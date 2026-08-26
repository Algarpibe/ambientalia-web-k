/**
 * DERIVACIÓN · ¿QUÉ HOJAS HACEN FALTA PARA LOS 3 PARES SIN REGLA CAPTURADA?
 * (114.ª tanda, ESCALÓN 2 · PASO 1 — el inventario, ANTES de pedir nada)
 *
 * El ESCALÓN 2 de la 109.ª dejó 3 pares sin NINGUNA regla en lo capturado:
 *
 *     et_pb_section_video_on_hover · modulo:blurb    5/22
 *     et_pb_column_empty           · columna        21/179
 *     et_pb_section_video_on_hover · columna         7/179
 *
 * y escribió que **no son «sin efecto»: son COBERTURA**. Hoy: **507 hojas
 * distintas, 108 capturadas, 399 sin capturar** (derivado de
 * `corpus/css/INDICE.json` §resumen, no citado de memoria — §regla 9).
 *
 * ⚠ **NO se capturan 507.** El encargo lo prohíbe y con razón: `et-cache` son
 * **500 de las 507** —Divi compila una hoja POR PÁGINA— así que capturarlas
 * enteras es una campaña con su propio encargo, no un parámetro por defecto.
 * Esta derivación calcula **el subconjunto mínimo**: las hojas de las páginas
 * donde viven esos 3 pares, y nada más. **El cardinal se publica ANTES de pedir.**
 *
 * ⚠ El `inventario` de `INDICE.json` cuenta páginas por hoja (`paginas: 576`)
 * pero **no las nombra**, así que la relación hoja→página no se puede leer de
 * ahí. Se deriva al revés: de las CLASES a sus páginas, y de cada página a sus
 * `<link rel=stylesheet>`.
 *
 * Uso:  node hojas-3pares-114.mjs
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const CORPUS = join(RAIZ, "corpus");
const IDX_CSS = join(CORPUS, "css", "INDICE.json");

if (!existsSync(IDX_CSS))
  throw new Error(
    `ÍNDICE DE CSS AUSENTE: no existe corpus/css/INDICE.json.\n` +
      `  Lo produce \`npm run cms:captura-css\`. Sin él no se sabe QUÉ está capturado,\n` +
      `  y el subconjunto mínimo saldría igual a «todas» (§regla 6: la ausencia se rechaza).`,
  );

const IDX = JSON.parse(readFileSync(IDX_CSS, "utf8"));
const INV = IDX.inventario;

/* ── las clases de los 3 pares ─────────────────────────────────────────────── */
const CLASES = ["et_pb_column_empty", "et_pb_section_video_on_hover"];

/* ── recorrer los HTML del corpus ──────────────────────────────────────────── */
const htmls = [];
(function anda(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (e.name === "css" || e.name === "_sitemaps") continue; anda(p); }
    else if (e.name.endsWith(".html")) htmls.push(p);
  }
})(CORPUS);

const RE_LINK = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
const RE_HREF = /href=["']([^"']+)["']/i;

const paginasCon = new Map();       // clase → [ruta html]
const hojasDe = new Map();          // ruta html → Set(url de hoja)

for (const f of htmls) {
  const src = readFileSync(f, "utf8");
  const rel = relative(CORPUS, f).replace(/\\/g, "/");
  let tocada = false;
  for (const c of CLASES) {
    if (!new RegExp(`\\b${c}\\b`).test(src)) continue;
    if (!paginasCon.has(c)) paginasCon.set(c, []);
    paginasCon.get(c).push(rel);
    tocada = true;
  }
  if (!tocada) continue;
  const set = new Set();
  for (const m of src.match(RE_LINK) ?? []) {
    const h = RE_HREF.exec(m)?.[1];
    if (h && /\.css/.test(h)) set.add(h.startsWith("//") ? `https:${h}` : h);
  }
  hojasDe.set(rel, set);
}

/* ── el subconjunto mínimo ─────────────────────────────────────────────────── */
const todasLasHojas = new Set();
for (const s of hojasDe.values()) for (const h of s) todasLasHojas.add(h);

const norm = (u) => u.split("?")[0];
const capturada = (u) => {
  const n = norm(u);
  for (const k of Object.keys(INV)) if (norm(k) === n) return INV[k].capturada === true;
  return false;
};
const faltan = [...todasLasHojas].filter((h) => !capturada(h));
const familia = (u) => (/et-cache/.test(u) ? "et-cache" : /plugins/.test(u) ? "plugins" : /themes/.test(u) ? "themes" : /wp-includes/.test(u) ? "wp-includes" : "otra");

const P = (n) => String(n).padStart(4);
console.log(`\n════════ HOJAS PARA LOS 3 PARES · 114.ª ESCALÓN 2 (inventario) ════════\n`);
console.log(`  corpus     HTML recorridos ............. ${P(htmls.length)}`);
console.log(`  INDICE     hojas distintas del sitio ... ${P(IDX.resumen.hojasDistintas)}`);
console.log(`             capturadas .................. ${P(IDX.resumen.capturadas)}`);
console.log(`             SIN capturar ................ ${P(IDX.resumen.sinCapturar)}   ← lo que NO se va a pedir entero`);
console.log(`\n  ── las páginas donde viven los 3 pares ──`);
for (const c of CLASES) console.log(`     ${c} ......... ${P((paginasCon.get(c) ?? []).length)} páginas`);
console.log(`     páginas DISTINTAS tocadas ........... ${P(hojasDe.size)}`);
console.log(`\n  ── el SUBCONJUNTO MÍNIMO ──`);
console.log(`     hojas que esas páginas enlazan ...... ${P(todasLasHojas.size)}`);
console.log(`     de ésas, YA capturadas .............. ${P(todasLasHojas.size - faltan.length)}`);
console.log(`     de ésas, HAY QUE PEDIR .............. ${P(faltan.length)}   ← EL CARDINAL, publicado ANTES de pedir`);

const porFam = {};
for (const h of faltan) porFam[familia(h)] = (porFam[familia(h)] ?? 0) + 1;
console.log(`     por familia: ${Object.entries(porFam).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"}`);

/* guarda §sondas 4: ni cero ni pleno */
const fallos = [];
if (!hojasDe.size) fallos.push("CERO PÁGINAS con esas clases. Un selector que no casa con nada no es un cero — revisa los nombres de clase.");
if (hojasDe.size === htmls.length) fallos.push("PLENO: las clases casan en TODAS las páginas. Un patrón que casa en todas no mide nada.");
if (!todasLasHojas.size) fallos.push("CERO HOJAS enlazadas por esas páginas: el regex de <link> no está casando.");

console.log(`\n  ── páginas por clase (para calentar antes de pedir su hoja) ──`);
for (const c of CLASES) {
  const ps = paginasCon.get(c) ?? [];
  console.log(`     ${c}  (${ps.length})`);
  for (const p of ps.slice(0, 8)) console.log(`        ${p}`);
  if (ps.length > 8) console.log(`        … y ${ps.length - 8} más`);
}

const F = join(AQUI, "hojas-3pares-114.json");
writeFileSync(F, JSON.stringify({
  fecha: new Date().toISOString().slice(0, 10),
  resumenSitio: IDX.resumen,
  clases: CLASES,
  paginasPorClase: Object.fromEntries([...paginasCon]),
  subconjuntoMinimo: { enlazadas: todasLasHojas.size, yaCapturadas: todasLasHojas.size - faltan.length, hayQuePedir: faltan.length, porFamilia: porFam, faltan },
}, null, 2) + "\n");
console.log(`\n  congelado en derivaciones/hojas-3pares-114.json`);

if (fallos.length) { console.log(`\n❌ GUARDA:`); for (const f of fallos) console.log(`   ${f}`); }
console.log(`\n${fallos.length ? "❌" : "✅"} evaluadas ${hojasDe.size} páginas tocadas / ${htmls.length} HTML del corpus\n`);
process.exit(fallos.length ? 1 : 0);
