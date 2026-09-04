/**
 * 145.ª · ESCALÓN 2 — B EN LOCAL, PASO 1: ¿SIRVE EL CONTENEDOR DESDE UN VOLUMEN?
 *
 * Antes de tocar `publicador.mjs` hay que saber QUÉ hay que montar, y eso no se
 * razona: se mide (§*cuando el cambio se pueda aplicar, aplícalo y mide*).
 *
 * LO DERIVADO ANTES DE ESCRIBIR ESTO (no supuesto):
 *
 *   · el árbol `standalone` del host lleva `apps/web/.next-nuevo/`, NO `.next/`
 *     — `output: standalone` **preserva el nombre del `distDir`**, y el
 *     publicador construye con `NEXT_DIST_DIR=.next-nuevo` (`publicador.mjs`
 *     L467). Su `server.js` lleva `"distDir":"./.next-nuevo"` congelado dentro
 *     y hace `process.chdir(__dirname)`, así que es AUTO-CONSISTENTE;
 *   · pero ese standalone del host **no sirve dentro del contenedor**: lleva
 *     `@img/sharp-win32-x64` con su `.node` — binario de Windows. En el VPS no
 *     se daría (host Linux, contenedor Linux); en desarrollo, sí;
 *   · el `server.js` de la IMAGEN se construyó dentro de Docker, sin
 *     `NEXT_DIST_DIR`, así que su `distDir` es `.next` y lee
 *     `/app/apps/web/.next`. Sus `node_modules` son los de `/app`, Linux;
 *   · y `.next/server` + manifiestos son **JavaScript portable**: el único
 *     binario nativo del árbol vive en `standalone/node_modules`, que el
 *     `server.js` de la imagen NO usa.
 *
 * LA HIPÓTESIS QUE ESTO MIDE: montar el `.next` del host sobre
 * `/app/apps/web/.next` deja al contenedor sirviendo el build del host.
 *
 * CONTROLES, por las dos polaridades (§regla 28d):
 *   · POSITIVO — con el volumen montado, el `buildId` SERVIDO == el del disco
 *     del host;
 *   · NEGATIVO — SIN volumen, el `buildId` servido es el HORNEADO en la imagen,
 *     y es DISTINTO. Sin este caso, un contenedor que sirviera cualquier cosa
 *     pasaría igual: es el testigo que exige ver también lo viejo.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const APP = path.join(RAIZ, "apps/web");
const IMAGEN = process.env.B_IMAGEN || "ai-website-cloner:144-fix";
const PUERTO = Number(process.env.B_PUERTO || 3910);
const NOMBRE = "kunak-b-volumen";

const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** El `DATABASE_URI` se DERIVA del contenedor de Postgres — nunca se escribe. */
function uriDeLaDb() {
  const env = d(
    "inspect",
    "kunak-cms-pg",
    "--format",
    "{{range .Config.Env}}{{println .}}{{end}}",
  ).stdout;
  const val = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1];
  const [u, p, db] = [
    val("POSTGRES_USER"),
    val("POSTGRES_PASSWORD"),
    val("POSTGRES_DB"),
  ];
  if (!u || !p || !db) throw new Error("no se pudo derivar la conexión a la DB");
  // `host.docker.internal` es la vía verificada por la 144.ª desde dentro.
  return `postgres://${u}:${encodeURIComponent(p)}@host.docker.internal:55432/${db}`;
}

/**
 * El `buildId` que el sitio SIRVE — no el del disco (§regla 53, §regla 55).
 *
 * ⚠⚠ EL CANAL NO SE ELIGE: SE CRUZA CON EL INSTRUMENTO DEL REPO QUE YA LO
 * MIDE. La primera versión de esta sonda buscaba `"buildId":"…"` y
 * `/_next/static/<id>/_buildManifest.js`, y dio **HTTP 200 con `buildId: null`
 * en los DOS casos** — o sea §sondas 4 con el cero puesto en un regex: un
 * veredicto «EL VOLUMEN NO SIRVE» sobre un contenedor que respondía 200.
 * Congelada de esa corrida, conservada como negativo:
 * `b-volumen-145-neg-selector-buildid-no-casa.json`.
 *
 * El canal bueno lo tiene adjudicado `publicador.mjs:423` y su comentario dice
 * por qué: es `"b":"<id>"` del payload RSC, porque `/_next/static/<id>/` **no
 * aparece** en el HTML de Next 16 App Router (0 ocurrencias, comprobado allí).
 */
async function buildIdServido(puerto, intentos = 60) {
  let ultimoHttp = null;
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/`, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      ultimoHttp = r.status;
      const html = await r.text();
      const m =
        /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) ||
        /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
      if (m) return { buildId: m[1], http: r.status, intentos: i + 1 };
      if (r.status === 200 && i >= 5)
        return {
          buildId: null,
          http: 200,
          intentos: i + 1,
          nota: "200 sin `b` en el payload RSC — mirar el canal, no concluir sobre el volumen",
          muestra: html.slice(0, 400),
        };
    } catch {
      /* aún no escucha */
    }
    await espera(1000);
  }
  return { buildId: null, http: ultimoHttp, intentos, nota: "nunca respondió" };
}

function arranca(conVolumen) {
  d("rm", "-f", NOMBRE);
  const args = [
    "run", "-d", "--name", NOMBRE,
    "-p", `${PUERTO}:3000`,
    "-e", `DATABASE_URI=${uriDeLaDb()}`,
    "-e", "PAYLOAD_SECRET=b-volumen-145-local-only",
    "--add-host", "host.docker.internal:host-gateway",
  ];
  if (conVolumen) {
    // Sólo el `.next`: los `node_modules` del contenedor son los de la imagen
    // (Linux) y NO se tocan — el binario nativo del host se queda fuera.
    args.push("-v", `${path.join(APP, ".next")}:/app/apps/web/.next:ro`);
  }
  args.push(IMAGEN);
  return d(...args);
}

const salida = {
  fecha: new Date().toISOString(),
  imagen: IMAGEN,
  puerto: PUERTO,
  buildIdEnDisco: fs.readFileSync(path.join(APP, ".next/BUILD_ID"), "utf8").trim(),
  casos: {},
};

// ── CONTROL NEGATIVO — sin volumen: sirve lo HORNEADO ────────────────────────
{
  const r = arranca(false);
  const servido = r.status === 0 ? await buildIdServido(PUERTO) : { error: (r.stderr || "").slice(0, 300) };
  salida.casos.sinVolumen = {
    pregunta: "sin volumen, ¿qué buildId sirve? (el testigo que exige ver lo viejo)",
    arranque: r.status,
    ...servido,
  };
  d("rm", "-f", NOMBRE);
}

// ── CONTROL POSITIVO — con volumen: sirve lo del HOST ────────────────────────
{
  const r = arranca(true);
  const servido = r.status === 0 ? await buildIdServido(PUERTO) : { error: (r.stderr || "").slice(0, 300) };
  salida.casos.conVolumen = {
    pregunta: "con el .next del host montado, ¿sirve el buildId del host?",
    arranque: r.status,
    ...servido,
  };
  if (!servido.buildId) {
    salida.casos.conVolumen.logs = (d("logs", "--tail", "40", NOMBRE).stdout +
      d("logs", "--tail", "40", NOMBRE).stderr).slice(-2000);
  }
  d("rm", "-f", NOMBRE);
}

const c = salida.casos;
const separa =
  c.sinVolumen.buildId && c.conVolumen.buildId &&
  c.sinVolumen.buildId !== c.conVolumen.buildId;

salida.veredicto = !c.conVolumen.buildId
  ? "EL VOLUMEN NO SIRVE — el contenedor no responde con él montado; ver logs"
  : c.conVolumen.buildId !== salida.buildIdEnDisco
    ? `EL VOLUMEN NO MANDA — sirve ${c.conVolumen.buildId}, el disco tiene ${salida.buildIdEnDisco}`
    : separa
      ? "✅ B VIABLE — con volumen sirve el buildId del HOST, sin volumen sirve el HORNEADO, y son DISTINTOS"
      : "SIN SEPARADORAS — los dos casos sirven lo mismo: el caso no discrimina";

const fichero = path.join(AQUI, "b-volumen-145.json");
fs.writeFileSync(fichero, JSON.stringify(salida, null, 2) + "\n");
console.log(JSON.stringify(salida, null, 2));
console.log("\n→ " + fichero);
process.exit(salida.veredicto.startsWith("✅") ? 0 : 1);
