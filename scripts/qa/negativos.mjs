/**
 * ¿SIGUEN SABIENDO FALLAR LOS NEGATIVOS BARATOS?
 * Uso: node scripts/qa/negativos.mjs        (npm run qa:negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE — el hueco lo dejó una regla CORRECTA pero INCOMPLETA
 *
 * La regla de la casa es *«cada arreglo de una sonda vuelve a correr SU
 * negativo, entero»* — **por arreglo, no periódica**. Es correcta y no se
 * deroga: lo que no cubre es el negativo de una sonda **que nadie toca**. Ése
 * puede pudrirse durante meses y **el repo no tiene forma de enterarse**,
 * porque un negativo que no se corre no da error: no da nada.
 *
 * Ya se pagó una vez con su fecha: `cms:extractor-a-neg` llevaba **ROJO desde
 * el 2026-08-17** con `149` cableado mientras el corpus había pasado a `152` en
 * la 74.ª, y lo cazó **el azar**.
 *
 * ── QUÉ CONTESTA, Y QUÉ NO (§*escribe qué pregunta contesta y cuál no*) ───
 *
 * CONTESTA: de los negativos **que no necesitan navegador ni DB**, cuáles
 * siguen saliendo rojos por su motivo y cuáles ya no.
 *
 * NO CONTESTA, y va con su cardinal (§regla 14):
 *   · los **14** que levantan un navegador o el clon servido — quedan fuera
 *     por coste, y **se nombran** en la salida en vez de desaparecer;
 *   · los **13** que necesitan la DB de Docker — fuera por dependencia de
 *     entorno, y también nombrados;
 *   · **si un negativo verde prueba lo que su tabla promete.** Esta sonda mira
 *     el CÓDIGO DE SALIDA, no la calidad del sabotaje. Un negativo que anula
 *     media hipótesis sale verde aquí y sigue sin medir nada — ése es §*un
 *     sabotaje que anula media hipótesis no falsea nada*, y no se detecta desde
 *     fuera.
 *
 * ── EL REPARTO SE DERIVA, NO SE ESCRIBE (§regla 9, 7.º caso) ──────────────
 * La lista de negativos y su clase salen de recorrer `scripts/qa` y
 * `scripts/seed` y de mirar **si el fichero o la sonda que lanza LLAMA** a
 * `iniciarClon`/`openPage`/`puppeteer.launch` o a `getPayload`. Una lista de
 * literales se habría quedado corta el día siguiente.
 *
 * ⚠ **Y `lib.mjs` NO se sigue al derivar**: la importan todas, así que
 * seguirla marca los **67 de 67** como «necesita navegador» — un PLENO, que
 * §sondas 4 dice que no mide nada. La primera versión de este reparto lo
 * cometió y lo delató el 67/67.
 *
 * ── LO QUE `qa:lib` YA CUBRE, Y LO QUE NO ────────────────────────────────
 * `qa:lib` comprueba que las **183** sondas **COMPILAN y declaran su mínimo**.
 * Es el contrato, y es otra pregunta: **compilar no es seguir sabiendo
 * fallar.** Un negativo cuyo sabotaje ya no muerde compila igual de bien.
 *
 * ── EL VEREDICTO ES INFORMATIVO EN ESTA TANDA ────────────────────────────
 * Nace **rojo**: 10 de 40. Cablearlo a `npm run check` hoy bloquearía el repo
 * entero por una deuda que esta sonda acaba de descubrir, no de causar. Se
 * ancla la línea base y se arregla en su tanda.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Evaluadas, gritaSiRevienta, w } from "./lib.mjs";

gritaSiRevienta();

const DIRS = ["scripts/qa", "scripts/seed"];
const lee = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
};

/** Llamada REAL, no mención: `iniciarClon(` y no la palabra suelta. */
const usaNavegador = (s) => /\biniciarClon\s*\(|\bopenPage\s*\(|puppeteer\.launch\s*\(/.test(s);
const usaDb = (s) => /getPayload\s*\(|--env-file/.test(s);

/** El fichero del negativo MÁS las sondas que lanza — pero nunca `lib.mjs`. */
function fuenteEfectiva(neg) {
  let todo = lee(neg);
  const hijos = [...todo.matchAll(/["'`]([\w./-]*?[\w-]+\.mjs)["'`]/g)]
    .map((m) => path.basename(m[1]))
    .filter((x) => !x.includes(".neg.") && x !== "lib.mjs");
  for (const h of new Set(hijos))
    for (const d of DIRS) {
      const p = path.join(d, h);
      if (fs.existsSync(p)) todo += lee(p);
    }
  return todo;
}

/**
 * El comando con el que el REPO lo invoca, no el que uno supone. Varios
 * negativos necesitan `--env-file` y lanzarlos con `node` a secas los pone
 * rojos por una razón que no es la suya — pasó al derivar esta tabla: **2 de
 * los 12 rojos eran del corredor**, no de la sonda (§regla 8, *un negativo sin
 * control no es un negativo*).
 */
const PKG = JSON.parse(lee("package.json")).scripts ?? {};
function comandoDe(neg) {
  const base = path.basename(neg);
  for (const [nombre, cmd] of Object.entries(PKG)) if (cmd.includes(base)) return { nombre, cmd };
  return { nombre: null, cmd: `node ${neg}` };
}

const negs = [];
for (const d of DIRS) for (const f of fs.readdirSync(d)) if (f.endsWith(".neg.mjs")) negs.push(path.join(d, f));
negs.sort();

const baratos = [];
const conNavegador = [];
const conDb = [];
for (const n of negs) {
  const src = fuenteEfectiva(n);
  if (usaNavegador(src)) conNavegador.push(path.basename(n));
  else if (usaDb(src)) conDb.push(path.basename(n));
  else baratos.push(n);
}

const ev = new Evaluadas({ unidad: "negativos baratos", minimo: baratos.length, nombre: "negativos" });

console.log(`\n════════ ¿SIGUEN SABIENDO FALLAR LOS NEGATIVOS? ════════`);
console.log(`  censados      ${negs.length} ficheros \`.neg.mjs\` en ${DIRS.join(" · ")}`);
console.log(`  se corren     ${baratos.length}  (ni navegador ni DB)`);
console.log(`  NO se corren  ${conNavegador.length} que levantan navegador/clon · ${conDb.length} que necesitan la DB`);
console.log(`  ⚠ esta sonda mira el CÓDIGO DE SALIDA, no si el sabotaje prueba lo que promete\n`);

const t0 = Date.now();
const filas = [];
for (const b of baratos) {
  const { nombre, cmd } = comandoDe(b);
  const t = Date.now();
  const partes = cmd.split(/\s+/);
  const r = spawnSync(partes[0] === "node" ? process.execPath : partes[0], partes.slice(1), {
    encoding: "utf8",
    timeout: 300000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const seg = +((Date.now() - t) / 1000).toFixed(1);
  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const marcador = (salida.match(/(?:✅|❌).{0,80}/g) ?? []).pop() ?? "";
  filas.push({ neg: path.basename(b), script: nombre, code: r.status, seg, marcador: marcador.trim() });
  console.log(
    `  ${r.status === 0 ? "✓" : "✗"} ${String(seg).padStart(6)}s  ${path.basename(b).padEnd(30)} ${r.status === 0 ? "" : marcador.trim()}`,
  );
  ev.ok(1);
}
const total = +((Date.now() - t0) / 1000).toFixed(1);
const rojos = filas.filter((f) => f.code !== 0);

console.log(`\n  ── el recuento, en la unidad que compara ──`);
console.log(`  corridos            ${filas.length}`);
console.log(`  ROJOS               ${rojos.length}`);
console.log(`  tiempo total        ${total}s`);
console.log(`  noMide · ${conNavegador.length} negativos con navegador: ${conNavegador.join(" ")}`);
console.log(`  noMide · ${conDb.length} negativos con DB: ${conDb.join(" ")}`);

w("medidas/negativos.json", {
  meta: { fecha: new Date().toISOString().slice(0, 10), censados: negs.length, corridos: filas.length, segundos: total },
  reparto: { baratos: baratos.map((b) => path.basename(b)), conNavegador, conDb },
  filas,
  rojos: rojos.map((r) => r.neg),
});

if (rojos.length) {
  console.log(`\n❌ ${rojos.length} de ${filas.length} negativos baratos YA NO SABEN FALLAR:`);
  for (const r of rojos) console.log(`     · ${r.neg}${r.script ? `  (npm run ${r.script})` : ""}  ${r.marcador}`);
  console.log(
    `\n   Un negativo podrido no da error: **no da nada**. Por eso esto se mide,\n` +
      `   y por eso la regla «cada arreglo re-corre SU negativo» no bastaba: no\n` +
      `   cubre el negativo de una sonda que nadie toca.`,
  );
  process.exitCode = 1;
} else {
  console.log(`\n✅ los ${filas.length} negativos baratos siguen saliendo rojos.`);
}
