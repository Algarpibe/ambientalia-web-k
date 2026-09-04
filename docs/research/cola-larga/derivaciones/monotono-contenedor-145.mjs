/**
 * 145.ª · ESCALÓN 2 — EL CRITERIO DE B1, A TRAVÉS DEL CONTENEDOR
 * ═══════════════════════════════════════════════════════════════
 *
 * **EL CRITERIO NO ES NUEVO: ES EL DE B1** (`monotono-servido-143.mjs`), y eso
 * es deliberado. Un criterio nuevo para el mismo invariante no se podría
 * comparar con lo que la 143.ª dejó verde, y la pregunta de esta tanda es
 * exactamente *«¿sigue cumpliéndose AHORA QUE EL SERVIDOR ES UN CONTENEDOR?»*.
 *
 *   > **3 publicaciones encadenadas · 3 valores SERVIDOS distintos · 0
 *   > repeticiones · cada servido igual a su propio disco · y observado DESDE
 *   > FUERA del contenedor.**
 *
 * Lo único que cambia es el mecanismo de relevo: donde la 143.ª mataba el árbol
 * del proceso local y comprobaba `puertoLibre`, aquí `publicador.mjs` ejecuta
 * `docker restart` y comprueba que `StartedAt` avanza (§regla 53 — por EFECTO,
 * no porque la orden devuelva).
 *
 * LOS CUATRO CONTROLES SE CONSERVAN, y K4 es el que el encargo exige
 * explícitamente —*«con el testigo de control que exige ver también lo viejo»*—:
 * sin él, un canal que devolviera siempre el disco pasaría K1–K3 sin haber
 * mirado nunca lo servido.
 *
 * ⚠ **Y hay una pregunta que sólo el contenedor plantea, y que esta sonda
 * contesta por construcción:** `promociona()` hace `renameSync` sobre el mismo
 * directorio que el contenedor tiene montado como bind-mount. Si el montaje
 * quedara anclado al inodo viejo, el `buildId` servido no cambiaría **y la
 * cadena tendría repeticiones**. No se razona: se mide.
 */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const APP = path.join(RAIZ, "apps/web");
const SECRETO = "monotono-145";
const PUBLICACIONES = 3;
const IMAGEN = process.env.B_IMAGEN || "ai-website-cloner:144-fix";
const CONTENEDOR = "kunak-b-monotono";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const d = (...a) => spawnSync("docker", a, { encoding: "utf8" });

/**
 * ⚠⚠ TODO `fetch` DE ESTE MEDIDOR VA POR AQUÍ, Y NO ES HIGIENE: la primera
 * corrida MURIÓ con `TypeError: fetch failed / read ECONNRESET` justo después
 * del primer `docker restart`, con el reinicio YA VERIFICADO en el log
 * (`StartedAt` avanzado). O sea que **el objeto funcionaba y lo que se rompió
 * fue el instrumento** (§regla 21: antes de tocar nada, se comprueba cuál de los
 * dos falla) — y al morir se llevó la congelada, que es §regla 5 cobrada sobre
 * una derivación con `writeFileSync` pelado.
 *
 * Un `ECONNRESET` contra un puerto cuyo contenedor se está reiniciando **no es
 * un veredicto sobre nada**: es ruido de transporte. Se reintenta y se declara
 * cuántas veces hizo falta; lo que NO se puede hacer es dejar que aborte la
 * corrida, porque entonces «el mecanismo falló» y «se cortó una conexión» dan
 * exactamente la misma salida.
 *
 * Log de la corrida abortada, conservado como artefacto (§regla 7):
 * `monotono-contenedor-145-neg-medidor-econnreset.log`.
 */
let reintentosDeRed = 0;
async function pide(url, opciones = {}, intentos = 40) {
  let ultimo = null;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(10_000), ...opciones });
    } catch (e) {
      ultimo = e;
      reintentosDeRed++;
      await espera(500);
    }
  }
  throw new Error(`${url} no respondió en ${intentos} intentos: ${ultimo?.message}`);
}

function puertoLibre(p) {
  return new Promise((res) => {
    const s = net.createServer();
    s.once("error", () => res(false));
    s.once("listening", () => s.close(() => res(true)));
    s.listen(p, "127.0.0.1");
  });
}
async function buscaPuerto(desde) {
  for (let p = desde; p < desde + 200; p++) if (await puertoLibre(p)) return p;
  throw new Error(`sin puerto libre desde ${desde}`);
}

/* ── C1 · el buildId del payload RSC. Canal adjudicado por `publicador.mjs:423`,
 * no elegido aquí: `/_next/static/<id>/` no aparece en el HTML de Next 16 App
 * Router, así que `"b":"<id>"` es el único que hay en el cuerpo. */
async function c1(base) {
  try {
    const r = await fetch(`${base}/`, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    const html = await r.text();
    const m =
      /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) ||
      /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
    return { id: m ? m[1] : null, http: r.status, bytes: html.length };
  } catch (e) {
    return { id: null, http: null, error: String(e.message) };
  }
}

/* ── C2 · la RESOLUCIÓN de ruta: 200 con el id del servidor, 404 con otro. No es
 * una cadena en un cuerpo, es un comportamiento de enrutado — o sea un canal
 * INDEPENDIENTE de C1, que es lo que permite cruzarlos. */
async function c2(base, id) {
  const pide = async (x) => {
    try {
      const r = await fetch(`${base}/_next/static/${x}/_ssgManifest.js`, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
      });
      return r.status;
    } catch {
      return null;
    }
  };
  return { httpDelId: id ? await pide(id) : null, httpDelFalso: await pide("ZZnoExisteEsteBuild") };
}

const discoBuildId = () => {
  try {
    return fs.readFileSync(path.join(APP, ".next/BUILD_ID"), "utf8").trim();
  } catch {
    return null;
  }
};

function uriDeLaDb() {
  const env = d("inspect", "kunak-cms-pg", "--format", "{{range .Config.Env}}{{println .}}{{end}}").stdout;
  const val = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1];
  const [u, p, db] = [val("POSTGRES_USER"), val("POSTGRES_PASSWORD"), val("POSTGRES_DB")];
  if (!u || !p || !db) throw new Error("no se pudo derivar la conexión a la DB del contenedor de Postgres");
  return `postgres://${u}:${encodeURIComponent(p)}@host.docker.internal:55432/${db}`;
}

/* ══════════════════════════════════════════════════════════════════════════ */
const PUERTO = await buscaPuerto(4200);
const PUERTO_WEB = await buscaPuerto(3910);
console.log(`puertos: control :${PUERTO} · web (contenedor) :${PUERTO_WEB}`);

const discoAntes = discoBuildId();
console.log(`buildId en DISCO antes de empezar: ${discoAntes}`);

/* ── el CONTENEDOR, que aquí hace de servidor web ─────────────────────────── */
d("rm", "-f", CONTENEDOR);
const arranque = d(
  "run", "-d", "--name", CONTENEDOR,
  "-p", `${PUERTO_WEB}:3000`,
  "-e", `DATABASE_URI=${uriDeLaDb()}`,
  "-e", "PAYLOAD_SECRET=monotono-145-local-only",
  "--add-host", "host.docker.internal:host-gateway",
  /* Sólo `.next`: los `node_modules` del contenedor son los de la IMAGEN
   * (Linux) y no se tocan — el `@img/sharp-win32-x64` del standalone del host
   * se queda fuera por construcción. `:ro` porque el contenedor no escribe
   * ahí: quien escribe es el publicador, desde el host. */
  "-v", `${path.join(APP, ".next")}:/app/apps/web/.next:ro`,
  IMAGEN,
);
if (arranque.status !== 0)
  throw new Error(`no arrancó el contenedor: ${(arranque.stderr || "").trim().slice(0, 400)}`);
console.log(`contenedor ${CONTENEDOR} arrancado desde ${IMAGEN}`);

const BASE_WEB = `http://127.0.0.1:${PUERTO_WEB}`;

/* ── LA OBSERVACIÓN DE PARTIDA — el testigo de K4 ─────────────────────────── */
let partida = null;
for (let i = 0; i < 120; i++) {
  const v = await c1(BASE_WEB);
  if (v.id) { partida = v; break; }
  await espera(500);
}
if (!partida?.id) {
  console.log(d("logs", "--tail", "40", CONTENEDOR).stdout + d("logs", "--tail", "40", CONTENEDOR).stderr);
  d("rm", "-f", CONTENEDOR);
  throw new Error("el contenedor de partida no sirvió ningún buildId en 60 s — sin él no hay relevo que medir");
}
const c2Partida = await c2(BASE_WEB, partida.id);
console.log(`contenedor de PARTIDA sirve ${partida.id} · C2 id=${c2Partida.httpDelId} falso=${c2Partida.httpDelFalso}`);

/* ── el PUBLICADOR, en modo contenedor ────────────────────────────────────── */
const pub = spawn(
  process.execPath,
  ["--env-file=apps/cms/.env", path.join(RAIZ, "scripts/publicar/publicador.mjs")],
  {
    cwd: RAIZ,
    env: {
      ...process.env,
      PUBLICAR_PUERTO: String(PUERTO),
      PUBLICAR_PUERTO_WEB: String(PUERTO_WEB),
      PUBLICAR_SECRETO: SECRETO,
      PUBLICAR_CONTENEDOR: CONTENEDOR,
      PUBLICAR_URL: "",
    },
    /* ⚠ NO `"ignore"`: es el defecto que la 143.ª arregló, y cometerlo en el
     * medidor sería §regla 28b — un stub que ciega un canal. */
    stdio: ["ignore", "pipe", "pipe"],
  },
);
for (const s of [pub.stdout, pub.stderr])
  s.on("data", (x) => process.stdout.write(`  [pub] ${x}`));

const CTRL = `http://127.0.0.1:${PUERTO}`;
let arrancado = false;
for (let i = 0; i < 120; i++) {
  await espera(250);
  try {
    const r = await fetch(`${CTRL}/estado`);
    if (!r.ok) continue;
    const e = await r.json();
    /* la guarda de IDENTIDAD: un 200 en el puerto no prueba que sea el nuestro */
    if (e.pid !== pub.pid)
      throw new Error(`el puerto :${PUERTO} lo tiene OTRO publicador (pid ${e.pid}, esperado ${pub.pid})`);
    arrancado = true;
    break;
  } catch (e) {
    if (String(e.message).includes("OTRO publicador")) throw e;
  }
}
if (!arrancado) {
  d("rm", "-f", CONTENEDOR);
  throw new Error("el publicador no contestó en 30 s");
}
console.log(`publicador vivo, pid ${pub.pid}, modo contenedor`);

const observaciones = [];
try {
  for (let n = 1; n <= PUBLICACIONES; n++) {
    console.log(`\n──── PUBLICACIÓN ${n}/${PUBLICACIONES} ────`);
    const t0 = Date.now();
    const r = await pide(`${CTRL}/rebuild`, {
      method: "POST",
      headers: { authorization: `Bearer ${SECRETO}`, "content-type": "application/json" },
      body: JSON.stringify({ motivo: `monotono-145 #${n}` }),
    });
    console.log(`  /rebuild → ${r.status}`);
    if (r.status !== 202)
      throw new Error(`/rebuild devolvió ${r.status}, se esperaba 202 — el disparo no entró y no hay nada que medir`);

    let est = null;
    for (let i = 0; i < 2000; i++) {
      await espera(500);
      est = await (await pide(`${CTRL}/estado`)).json();
      if (est.builds >= n && est.fase !== "construyendo") break;
    }
    const segundos = +((Date.now() - t0) / 1000).toFixed(2);

    const disco = discoBuildId();
    /* ⚠ Se espera a que el contenedor RESPONDA, no a que responda LO QUE
     * ESPERAMOS. Un `docker restart` deja unos segundos sin servicio, y leer ahí
     * daría `id: null` — que se leería como REFUTADA cuando lo único que pasa es
     * que el proceso aún no escucha. Esperar «hasta que el id sea el del disco»
     * sería lo contrario y peor: cablear el resultado que la sonda existe para
     * medir. El bucle sólo exige que HAYA id; cuál sea es el dato. */
    let v1 = await c1(BASE_WEB);
    for (let i = 0; i < 120 && !v1.id; i++) {
      await espera(500);
      v1 = await c1(BASE_WEB);
    }
    const v2 = await c2(BASE_WEB, v1.id);

    const obs = {
      n,
      segundos,
      buildIdEnDisco: disco,
      buildIdServidoC1: v1.id,
      httpC1: v1.http,
      C2_httpDelIdServido: v2.httpDelId,
      C2_httpDeUnIdFalso: v2.httpDelFalso,
      estadoBuildId: est?.ultimoExito?.buildId ?? null,
      estadoBuildIdServido: est?.ultimoExito?.buildIdServido ?? null,
      estadoLlegoAlSitio: est?.ultimoExito?.llegoAlSitio ?? null,
      estadoReinicio: est?.ultimoExito?.reinicio ?? null,
      estadoUltimoFallo: est?.ultimoFallo ? est.ultimoFallo.motivo : null,
      builds: est?.builds ?? null,
    };
    obs.servidoIgualADisco = obs.buildIdServidoC1 !== null && obs.buildIdServidoC1 === obs.buildIdEnDisco;
    observaciones.push(obs);
    console.log(
      `  disco ${disco} → servido ${v1.id} · C2 id=${v2.httpDelId} falso=${v2.httpDelFalso} · ` +
        `reinicio=${JSON.stringify(obs.estadoReinicio)} · ${segundos}s`,
    );
  }
} finally {
  console.log("\nparando el publicador y el contenedor…");
  if (process.platform === "win32")
    spawnSync("taskkill", ["/PID", String(pub.pid), "/T", "/F"], { stdio: "ignore" });
  else pub.kill("SIGTERM");
  await espera(2500);
  d("rm", "-f", CONTENEDOR);
}

/* ══ VEREDICTO ═════════════════════════════════════════════════════════════ */
const servidos = observaciones.map((o) => o.buildIdServidoC1);
const cadena = [partida.id, ...servidos];

const k1 = observaciones.every((o) => o.C2_httpDelIdServido === 200 && o.C2_httpDeUnIdFalso === 404);
const k2 = observaciones.every((o) => o.servidoIgualADisco);
const k3 = !servidos.includes(partida.id);
const k4 = partida.id === discoAntes;
/* K5 · NUEVO en el modo contenedor: el reinicio se comprobó POR EFECTO en las
 * tres. Sin él, un `docker restart` que devolviera 0 sin reiniciar pasaría
 * K1–K4 si el volumen se recargara por otra vía — y no sabríamos por qué. */
const k5 = observaciones.every((o) => o.estadoReinicio?.reiniciado === true);

const control = {
  K1_C2_discrimina: { ok: k1, nota: "200 para el id servido y 404 para uno falso, en las 3" },
  K2_C1_y_C2_concuerdan: { ok: k2, nota: "el servido coincide con el disco en las 3" },
  K3_no_es_el_build_de_partida: { ok: k3, buildIdDePartida: partida.id },
  K4_el_canal_ve_tambien_lo_VIEJO: {
    ok: k4,
    servidoDePartida: partida.id,
    discoAntes,
    nota: "polaridad: sin esto, un canal que devolviera siempre el disco pasaría K1-K3",
  },
  K5_el_reinicio_se_verifico_por_EFECTO: {
    ok: k5,
    nota: "`StartedAt` avanzó en las 3 — no basta con que `docker restart` devuelva 0 (§regla 53)",
  },
};
control.vale = k1 && k2 && k3 && k4 && k5;

const distintosEnCadena = new Set(cadena.filter(Boolean)).size;
const sinRepeticiones = cadena.filter((v, i) => i > 0 && v === cadena[i - 1]).length === 0;

const veredicto = {
  modelo: "B · volumen + `docker restart` (CMS-10)",
  publicaciones: PUBLICACIONES,
  relevosMedidos: PUBLICACIONES,
  observadoDesde: "FUERA del contenedor, por HTTP al puerto publicado",
  cadena,
  valoresDistintosEnLaCadena: distintosEnCadena,
  cadenaSinRepeticiones: sinRepeticiones,
  P1: !control.vale
    ? "NO ADJUDICA (el control no pasa)"
    : distintosEnCadena === PUBLICACIONES + 1 && sinRepeticiones
      ? "CONFIRMADA"
      : "REFUTADA",
};

const salida = {
  fecha: new Date().toISOString(),
  imagen: IMAGEN,
  contenedor: CONTENEDOR,
  /* Se publica porque es lo que separa «el mecanismo funciona» de «además la red
   * tembló»: un número alto no invalida el veredicto, pero sin él no se puede
   * sopesar (§regla 14 — una limitación sin su número se lee como nota al pie). */
  reintentosDeRed,
  puertos: { control: PUERTO, web: PUERTO_WEB },
  partida: { buildIdServido: partida.id, discoAntes, c2: c2Partida },
  veredicto,
  control,
  observaciones,
};
const dest = path.join(AQUI, "monotono-contenedor-145.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2) + "\n");

console.log("\n═══ VEREDICTO ═══");
console.log(JSON.stringify(veredicto, null, 2));
console.log("\n── CONTROL ──");
console.log(JSON.stringify(control, null, 2));
console.log(`\ncongelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
process.exitCode = veredicto.P1 === "CONFIRMADA" ? 0 : 1;
