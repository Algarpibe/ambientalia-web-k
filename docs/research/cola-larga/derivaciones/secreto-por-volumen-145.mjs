/**
 * 145.ª · ESCALÓN 3 — ¿REINTRODUCE B EL SECRETO, POR EL VOLUMEN?
 *
 * La 144.ª sacó el secreto de la IMAGEN y lo verificó **sobre el artefacto
 * construido**, no sobre el `.dockerignore` (§regla 59: comprobar que un secreto
 * no está en las VARIABLES no es comprobar que no está en el ARTEFACTO). B abre
 * una puerta nueva —un volumen— y la pregunta hay que rehacerla por ese canal.
 *
 * ⚠ **Y hay motivo concreto para sospechar, derivado y no supuesto:** el árbol
 * `standalone` del host contiene
 * `apps/web/.next/standalone/apps/web/.env` (166 bytes), porque `output:
 * standalone` copia el `.env` del paquete. El volumen de B monta `apps/web/.next`
 * ENTERO, así que **ese fichero entra en el contenedor** — por una ruta distinta
 * de la que la 144.ª cerró.
 *
 * DOS PREGUNTAS DISTINTAS, y sólo la segunda decide (§regla 15):
 *   1 · ¿ESTÁ el fichero dentro del contenedor?  → `find`
 *   2 · ¿lo LEE el proceso que sirve?            → dónde busca su `.env`
 *
 * CONTROL POSITIVO OBLIGATORIO (§regla 28c, §regla 59): la imagen `:144-test`
 * —la de ANTES del arreglo, conservada como evidencia— tiene que dar **≥1**. Si
 * diera 0, el `find` no estaría mirando y el 0 del caso bueno sería una sonda
 * muda, no una ausencia.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const APP = path.join(RAIZ, "apps/web");
const NOMBRE = "kunak-secreto-probe";

const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });

/**
 * Cuenta ficheros `.env` dentro de un contenedor efímero de esa imagen.
 *
 * `tapaStandalone` monta un volumen ANÓNIMO VACÍO encima de
 * `.next/standalone`, que es donde `output: standalone` deja una copia del
 * `.env` del paquete. En modo B ese árbol **no se usa** —el `server.js` que
 * corre es el de la IMAGEN, con sus `node_modules` de Linux—, así que taparlo no
 * quita nada… **y eso hay que MEDIRLO, no razonarlo**: el caso `sirveIgual` de
 * abajo comprueba que el contenedor sigue sirviendo el `buildId` del host con el
 * tapón puesto.
 */
function envsDentro(imagen, conVolumen, tapaStandalone = false) {
  d("rm", "-f", NOMBRE);
  const args = ["run", "--rm", "--name", NOMBRE, "--entrypoint", "sh"];
  if (conVolumen) {
    args.push("-v", `${path.join(APP, ".next")}:/app/apps/web/.next:ro`);
    if (tapaStandalone) args.push("-v", "/app/apps/web/.next/standalone");
  }
  args.push(imagen, "-c", "find /app -name '*.env' -o -name '.env' 2>/dev/null | sort");
  const r = d(...args);
  const lineas = (r.stdout || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return { exit: r.status, n: lineas.length, ficheros: lineas, error: r.status === 0 ? null : (r.stderr || "").trim().slice(0, 200) };
}

const salida = { fecha: new Date().toISOString(), casos: {} };

// ── CONTROL POSITIVO · la imagen de ANTES del arreglo tiene que dar ≥1 ───────
salida.casos.controlPositivo = {
  pregunta: "la imagen ANTERIOR al arreglo (:144-test) tiene el .env dentro — si da 0, el `find` no mira",
  imagen: "ai-website-cloner:144-test",
  ...envsDentro("ai-website-cloner:144-test", false),
};

// ── A · la imagen ARREGLADA, sin volumen (lo que la 144.ª dejó) ──────────────
salida.casos.imagenArreglada = {
  pregunta: "¿sigue limpia la imagen arreglada, sin volumen?",
  imagen: "ai-website-cloner:144-fix",
  ...envsDentro("ai-website-cloner:144-fix", false),
};

// ── B · la imagen arreglada CON EL VOLUMEN DE B ──────────────────────────────
salida.casos.conVolumenDeB = {
  pregunta: "¿reintroduce B el secreto por el volumen?",
  imagen: "ai-website-cloner:144-fix",
  volumen: "apps/web/.next → /app/apps/web/.next:ro",
  ...envsDentro("ai-website-cloner:144-fix", true),
};

// ── C · EL CIERRE: tapar `standalone` con un volumen anónimo vacío ──────────
salida.casos.conTaponEnStandalone = {
  pregunta: "¿basta con tapar `.next/standalone` para que no entre ningún .env?",
  imagen: "ai-website-cloner:144-fix",
  volumen: "apps/web/.next → /app/apps/web/.next:ro  +  volumen anónimo sobre .next/standalone",
  ...envsDentro("ai-website-cloner:144-fix", true, true),
};

// ── Y su contrapartida, que es la que impide el arreglo falso: ¿SIGUE
// SIRVIENDO? Un tapón que quitara el secreto rompiendo el servicio no es un
// arreglo, y «no hay .env» saldría igual de verde (§regla 28: el sabotaje se
// pone en el DATO, y el control tiene que exigir que la función sobreviva).
{
  const NOMBRE_SRV = "kunak-secreto-sirve";
  d("rm", "-f", NOMBRE_SRV);
  const env = d("inspect", "kunak-cms-pg", "--format", "{{range .Config.Env}}{{println .}}{{end}}").stdout;
  const val = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1];
  const uri = `postgres://${val("POSTGRES_USER")}:${encodeURIComponent(val("POSTGRES_PASSWORD"))}@host.docker.internal:55432/${val("POSTGRES_DB")}`;
  const PUERTO = 3915;
  const r = d(
    "run", "-d", "--name", NOMBRE_SRV,
    "-p", `${PUERTO}:3000`,
    "-e", `DATABASE_URI=${uri}`,
    "-e", "PAYLOAD_SECRET=secreto-probe-145-local-only",
    "--add-host", "host.docker.internal:host-gateway",
    "-v", `${path.join(APP, ".next")}:/app/apps/web/.next:ro`,
    "-v", "/app/apps/web/.next/standalone",
    "ai-website-cloner:144-fix",
  );
  let servido = null, http = null;
  if (r.status === 0) {
    for (let i = 0; i < 60; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PUERTO}/`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
        http = res.status;
        const html = await res.text();
        const m = /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) || /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
        if (m) { servido = m[1]; break; }
      } catch { /* aún no escucha */ }
      await new Promise((x) => setTimeout(x, 1000));
    }
  }
  d("rm", "-f", NOMBRE_SRV);
  const disco = fs.readFileSync(path.join(APP, ".next/BUILD_ID"), "utf8").trim();
  salida.casos.sirveIgual = {
    pregunta: "con el tapón puesto, ¿sigue sirviendo el buildId del HOST?",
    arranque: r.status,
    buildIdEnDisco: disco,
    buildIdServido: servido,
    http,
    ok: servido === disco,
    nota: "sin esto, un tapón que rompiera el servicio saldría igual de verde en el recuento de .env",
  };
}

// ── La SEGUNDA pregunta: ¿lo LEE el proceso que sirve? ───────────────────────
/* El `server.js` de la IMAGEN hace `process.chdir(__dirname)`, así que busca su
 * `.env` en `/app/apps/web/.env`. Lo que el volumen introduce vive en
 * `/app/apps/web/.next/standalone/apps/web/.env` — otra ruta. Se DERIVA
 * comparando las rutas halladas contra la que el proceso mira, no se supone. */
const RUTA_QUE_LEE = "/app/apps/web/.env";
const hallados = salida.casos.conVolumenDeB.ficheros || [];
salida.casos.loLee = {
  pregunta: "¿alguno de los .env presentes está en la ruta que el proceso lee?",
  rutaQueLeeElProceso: RUTA_QUE_LEE,
  presentes: hallados,
  enLaRutaQueLee: hallados.includes(RUTA_QUE_LEE),
  nota:
    "`server.js` hace process.chdir(__dirname) (derivado del fuente del standalone), " +
    "así que su cwd es /app/apps/web y ahí busca el .env",
};

const cp = salida.casos.controlPositivo;
const vale = cp.n >= 1;
const reintroduce = salida.casos.conVolumenDeB.n > salida.casos.imagenArreglada.n;

const cerrado =
  salida.casos.conTaponEnStandalone.n === 0 && salida.casos.sirveIgual.ok === true;

salida.veredicto = !vale
  ? `NO ADJUDICA — el control positivo dio ${cp.n}: el \`find\` no está mirando, así que ningún 0 es ausencia`
  : reintroduce
    ? `⚠ B REINTRODUCE ficheros .env por el volumen: ${salida.casos.imagenArreglada.n} → ${salida.casos.conVolumenDeB.n}` +
      (salida.casos.loLee.enLaRutaQueLee
        ? " — Y ADEMÁS en la ruta que el proceso LEE"
        : " — pero NINGUNO en la ruta que el proceso lee") +
      (cerrado
        ? ". ✅ CERRADO tapando `.next/standalone` con un volumen anónimo: 0 ficheros y el sitio sigue sirviendo el buildId del host"
        : ". ❌ el tapón NO cierra: " +
          (salida.casos.conTaponEnStandalone.n !== 0
            ? `siguen ${salida.casos.conTaponEnStandalone.n} ficheros`
            : "el contenedor deja de servir el build del host"))
    : "✅ B NO reintroduce el secreto: el volumen no aporta ningún .env";

const fichero = path.join(AQUI, "secreto-por-volumen-145.json");
fs.writeFileSync(fichero, JSON.stringify(salida, null, 2) + "\n");
console.log(JSON.stringify(salida, null, 2));
console.log("\n→ " + fichero);
/* Sale ≠0 si el control no vale, si el volumen mete un .env EN LA RUTA QUE SE
 * LEE, o si lo reintroduce y el tapón no lo cierra. Un `.env` presente y no
 * leído no es el mismo defecto que uno cargado — pero tampoco se calla. */
process.exit(!vale || salida.casos.loLee.enLaRutaQueLee || (reintroduce && !cerrado) ? 1 : 0);
