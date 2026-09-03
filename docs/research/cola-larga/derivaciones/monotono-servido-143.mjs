/**
 * 143.ª · ESCALÓN 2 — EL CRITERIO DE B1: EL MONÓTONO POR `buildId` SERVIDO
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ⚠ **Esto NO pasa por `qa:publicar` ni por `publica-e2e`, y no es una
 * preferencia: es que las dos comparten la ceguera** (PASO 0 §4). `publica-e2e`
 * tiene el invariante que B1 viola —`E4·el cambio llega SERVIDO`— y lo mide con
 * `rutasEmitidas(leeManifiesto())`, o sea el `prerender-manifest.json` EN DISCO.
 * Y `GESTIONA_SERVIDOR` es falso en las 0 corridas de sonda que ponen
 * `PUBLICAR_SERVIDOR=1`, así que el código donde vive B1 no se ejecuta en
 * ninguna. Cero separadoras **por construcción**.
 *
 * EL CRITERIO, pre-registrado en el ESCALÓN 1 antes de medir:
 *
 *   > **3 publicaciones encadenadas · 3 valores SERVIDOS distintos · 0
 *   > repeticiones · y cada servido igual a su propio disco.**
 *
 * Y el 3 no es un número redondo: el modo de fallo de B1 —el huérfano
 * sosteniendo el puerto— **sólo aparece cuando hay un servidor anterior al que
 * relevar**, porque un primer arranque encuentra el puerto libre lo mates bien
 * o mal.
 *
 * ⚠ **CORREGIDO al correr, y a favor: el publicador SÍ arranca servidor al
 * nacer** —`publicador.mjs:936`, `if (GESTIONA_SERVIDOR && existsSync(BUILD_ID))
 * arrancaServidor()`—, no sólo desde `promociona()` como decía la primera
 * versión de este comentario. Así que hay **servidor de partida** y las 3
 * publicaciones producen **3 relevos**, no 2: el caso del huérfano se ejercita
 * **tres** veces y la cadena tiene **4 valores** (el de partida más 3).
 *
 * DOS CANALES INDEPENDIENTES, porque uno solo no se puede cruzar:
 *
 *   C1 · el `buildId` del payload RSC del HTML de `GET /` — `\"b\":\"<id>\"`
 *   C2 · la RESOLUCIÓN de `/_next/static/<id>/_ssgManifest.js`: 200 con el id
 *        del servidor, 404 con otro. No es una cadena en un cuerpo: es un
 *        comportamiento de enrutado.
 *
 * Si C1 y C2 discrepan, **la corrida NO ADJUDICA** — ni confirma ni refuta.
 */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const APP = path.join(RAIZ, "apps/web");
const SECRETO = "monotono-143";
const PUBLICACIONES = 3;

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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

/* ── C1 · el buildId del payload RSC ─────────────────────────────────────── */
async function c1(base) {
  try {
    const r = await fetch(`${base}/`, { redirect: "manual" });
    const html = await r.text();
    const m = /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) || /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
    return { id: m ? m[1] : null, http: r.status, bytes: html.length };
  } catch (e) {
    return { id: null, http: null, error: String(e.message) };
  }
}

/* ── C2 · la resolución de ruta. Se le pregunta por el id que C1 dice Y por un
 * id FALSO: el falso tiene que dar 404, o C2 no discrimina y no vale como
 * canal (§regla 28c: el control es el caso conocido de antemano). */
async function c2(base, id) {
  const pide = async (x) => {
    try {
      const r = await fetch(`${base}/_next/static/${x}/_ssgManifest.js`, { redirect: "manual" });
      return r.status;
    } catch {
      return null;
    }
  };
  const falso = "ZZnoExisteEsteBuild";
  return { httpDelId: id ? await pide(id) : null, httpDelFalso: await pide(falso) };
}

const discoBuildId = () => {
  try {
    return fs.readFileSync(path.join(APP, ".next/BUILD_ID"), "utf8").trim();
  } catch {
    return null;
  }
};

/* ══════════════════════════════════════════════════════════════════════════ */
const PUERTO = await buscaPuerto(4100);
const PUERTO_WEB = await buscaPuerto(3100);
console.log(`puertos: control :${PUERTO} · web :${PUERTO_WEB}`);
console.log(`⚠ NO se usa :3000 — lo tiene otro proyecto (C:\\dev\\kbi-app), derivado en el PASO 0`);

const discoAntes = discoBuildId();
console.log(`buildId en DISCO antes de empezar: ${discoAntes}`);

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
      PUBLICAR_SERVIDOR: "1",
      PUBLICAR_URL: "",
    },
    /* ⚠ NO `"ignore"`: es literalmente el defecto que esta tanda arregla, y
     * cometerlo en el medidor sería §regla 28b (un stub que ciega un canal). */
    stdio: ["ignore", "pipe", "pipe"],
  },
);
const salidaPub = [];
for (const s of [pub.stdout, pub.stderr])
  s.on("data", (d) => {
    const t = d.toString();
    salidaPub.push(t);
    process.stdout.write(`  [pub] ${t}`);
  });

/* ── la GUARDA DE IDENTIDAD: un 200 en el puerto no prueba que sea el nuestro
 * (§la causa común, con el contenedor puesto en el proceso al otro lado) ── */
const CTRL = `http://127.0.0.1:${PUERTO}`;
let arrancado = false;
for (let i = 0; i < 120; i++) {
  await espera(250);
  try {
    const r = await fetch(`${CTRL}/estado`);
    if (!r.ok) continue;
    const e = await r.json();
    if (e.pid !== pub.pid) throw new Error(`el puerto :${PUERTO} lo tiene OTRO publicador (pid ${e.pid}, esperado ${pub.pid})`);
    arrancado = true;
    break;
  } catch (e) {
    if (String(e.message).includes("OTRO publicador")) throw e;
  }
}
if (!arrancado) throw new Error("el publicador no contestó en 30 s");
console.log(`publicador vivo, pid ${pub.pid}`);

/* ── LA OBSERVACIÓN DE PARTIDA. El publicador arranca servidor al nacer
 * (`publicador.mjs:936`), así que hay un servidor con el build de partida —y es
 * justo el que las 3 publicaciones tienen que relevar—. Sin esta observación la
 * cadena empezaría en la primera publicación y **no habría ningún relevo
 * medido**: el primer arranque encuentra el puerto libre lo mates bien o mal. */
const BASE_WEB = `http://127.0.0.1:${PUERTO_WEB}`;
let partida = null;
for (let i = 0; i < 120; i++) {
  const v = await c1(BASE_WEB);
  if (v.id) { partida = v; break; }
  await espera(500);
}
if (!partida?.id) throw new Error("el servidor de partida no sirvió ningún buildId en 60 s — sin él no hay relevo que medir");
const c2Partida = await c2(BASE_WEB, partida.id);
console.log(`servidor de PARTIDA sirve ${partida.id} · C2 id=${c2Partida.httpDelId} falso=${c2Partida.httpDelFalso}`);

const observaciones = [];
try {
  for (let n = 1; n <= PUBLICACIONES; n++) {
    console.log(`\n──── PUBLICACIÓN ${n}/${PUBLICACIONES} ────`);
    const t0 = Date.now();
    const r = await fetch(`${CTRL}/rebuild`, {
      method: "POST",
      /* `Authorization: Bearer …` — derivado del fuente (`publicador.mjs:741`),
       * no supuesto. La primera versión inventó una cabecera `x-publicar-secreto`
       * y se llevó un 401: un medidor que no autentica mide 0 publicaciones y
       * las 0 publicaciones dan un monótono vacío, que es §regla 6 con el
       * contenedor puesto en la cabecera. */
      headers: { authorization: `Bearer ${SECRETO}`, "content-type": "application/json" },
      body: JSON.stringify({ motivo: `monotono-143 #${n}` }),
    });
    console.log(`  /rebuild → ${r.status}`);
    /* ⚠ TIRA en vez de esperar (§regla 6): un `/rebuild` rechazado produce 0
     * builds, y esperarlos 800 s da un monótono VACÍO con cara de corrida
     * agotada. La primera versión de este medidor se llevó un 401 por inventarse
     * la cabecera y estuvo girando en balde. */
    if (r.status !== 202)
      throw new Error(`/rebuild devolvió ${r.status}, se esperaba 202 — el disparo no entró y no hay nada que medir`);

    /* espera a que el publicador quede OCIOSO con builds === n */
    let est = null;
    for (let i = 0; i < 1600; i++) {
      await espera(500);
      est = await (await fetch(`${CTRL}/estado`)).json();
      if (est.builds >= n && est.fase !== "construyendo") break;
    }
    const segundos = +((Date.now() - t0) / 1000).toFixed(2);

    const disco = discoBuildId();
    const base = `http://127.0.0.1:${PUERTO_WEB}`;
    const v1 = await c1(base);
    const v2 = await c2(base, v1.id);

    const obs = {
      n,
      segundos,
      /* los dos lados del par, siempre: un número de un par se cita con sus dos
       * lados o no se cita (§sondas 1) */
      buildIdEnDisco: disco,
      buildIdServidoC1: v1.id,
      httpC1: v1.http,
      C2_httpDelIdServido: v2.httpDelId,
      C2_httpDeUnIdFalso: v2.httpDelFalso,
      /* lo que el ESTADO dice — que antes del arreglo era el del disco a secas */
      estadoBuildId: est?.ultimoExito?.buildId ?? null,
      estadoBuildIdServido: est?.ultimoExito?.buildIdServido ?? null,
      estadoLlegoAlSitio: est?.ultimoExito?.llegoAlSitio ?? null,
      estadoUltimoFallo: est?.ultimoFallo ? est.ultimoFallo.motivo : null,
      builds: est?.builds ?? null,
    };
    obs.servidoIgualADisco = obs.buildIdServidoC1 !== null && obs.buildIdServidoC1 === obs.buildIdEnDisco;
    observaciones.push(obs);
    console.log(`  disco ${disco} → servido ${v1.id} · C2 id=${v2.httpDelId} falso=${v2.httpDelFalso} · ${segundos}s`);
  }
} finally {
  console.log("\nparando el publicador…");
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pub.pid), "/T", "/F"], { stdio: "ignore" });
  else pub.kill("SIGTERM");
  await espera(2500);
}

/* ══ VEREDICTO ═════════════════════════════════════════════════════════════ */
const servidos = observaciones.map((o) => o.buildIdServidoC1);
const distintos = new Set(servidos.filter(Boolean));
const repeticiones = servidos.filter((v, i) => i > 0 && v === servidos[i - 1]).length;

/* ── EL CONTROL, y es el que decide si el veredicto vale (§regla 28c) ──────
 * K1 · C2 DISCRIMINA: 200 para el id servido, 404 para uno falso. Sin esto, C2
 *      contestaría lo mismo a todo y su concordancia con C1 no probaría nada.
 * K2 · C1 y C2 CONCUERDAN en las 3 observaciones.
 * K3 · el buildId servido NO es el de antes de empezar. Es el caso conocido de
 *      antemano: si saliera igual, o no publicamos o el servidor está anclado. */
const k1 = observaciones.every((o) => o.C2_httpDelIdServido === 200 && o.C2_httpDeUnIdFalso === 404);
const k2 = observaciones.every((o) => o.servidoIgualADisco);
const k3 = !servidos.includes(partida.id);
/* K4 · el CONTROL DE POLARIDAD (§regla 28d): el canal tiene que saber ver
 * también el estado VIEJO, o un canal que siempre devolviera el disco pasaría
 * K1–K3 sin medir nada de lo servido. El testigo es el servidor de PARTIDA: su
 * id tiene que ser el del disco de antes de empezar. */
const k4 = partida.id === discoAntes;
const control = {
  K1_C2_discrimina: { ok: k1, nota: "200 para el id servido y 404 para uno falso, en las 3" },
  K2_C1_y_C2_concuerdan: { ok: k2, nota: "el servido coincide con el disco en las 3" },
  K3_no_es_el_build_de_partida: { ok: k3, buildIdDePartida: partida.id },
  K4_el_canal_ve_tambien_lo_VIEJO: { ok: k4, servidoDePartida: partida.id, discoAntes, nota: "polaridad: sin esto, un canal que devolviera siempre el disco pasaría K1-K3" },
};
control.vale = k1 && k2 && k3 && k4;

const cadena = [partida.id, ...servidos];
const veredicto = {
  publicaciones: PUBLICACIONES,
  relevosMedidos: PUBLICACIONES, // hay servidor de partida: las 3 relevan
  observacionesServidas: servidos.length,
  valoresDistintos: distintos.size,
  repeticionesConsecutivas: repeticiones,
  cadena,
  valoresDistintosEnLaCadena: new Set(cadena.filter(Boolean)).size,
  cadenaSinRepeticiones: cadena.filter((v, i) => i > 0 && v === cadena[i - 1]).length === 0,
  P1:
    !control.vale
      ? "NO ADJUDICA (el control no pasa)"
      : new Set(cadena.filter(Boolean)).size === PUBLICACIONES + 1 && cadena.filter((v, i) => i > 0 && v === cadena[i - 1]).length === 0
        ? "CONFIRMADA"
        : "REFUTADA",
};

const salida = { fecha: new Date().toISOString(), puertos: { control: PUERTO, web: PUERTO_WEB }, partida: { buildIdServido: partida.id, discoAntes, c2: c2Partida }, veredicto, control, observaciones };
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "monotono-servido-143.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2));

console.log("\n═══ VEREDICTO ═══");
console.log(JSON.stringify(veredicto, null, 2));
console.log("\n── CONTROL ──");
console.log(JSON.stringify(control, null, 2));
console.log(`\ncongelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
process.exitCode = veredicto.P1 === "CONFIRMADA" ? 0 : 1;
