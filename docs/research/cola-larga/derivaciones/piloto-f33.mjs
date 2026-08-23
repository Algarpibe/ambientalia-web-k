/* piloto-f33 — 93.ª tanda, 2026-08-22. ESCALÓN 3, selección del piloto.
 *
 * LA PREGUNTA: ¿QUÉ páginas tiene que llevar el piloto?
 *
 * ⚠ **El criterio es LO QUE EJERCITA, no lo que es fácil** (encargo de la
 * tanda), y por eso la selección se DERIVA en vez de escribirse: qué página
 * trae cada tipo raro es un hecho del corpus, y una lista a mano envejece
 * contra él en silencio (§regla 9 caso 7).
 *
 * Las cuatro condiciones, y cada una con su porqué:
 *
 *   1 · **los 6 hubs L4 NO valen solos.** El plan ya midió que dentro de L4 hay
 *       **1 sola separadora** entre C2 y C3, o sea que L4 **no discrimina este
 *       modelo**: un piloto de L4 saldría verde sin haber elegido nada
 *       (§*un verde vale lo que valen sus instancias separadoras*);
 *   2 · **tiene que ir el documento del régimen `--`.** Estrena el campo rico
 *       de S2 y su camino de render, y es **lo único con n = 1 de esa decisión**:
 *       si no entra, S2 queda escrita y sin estrenar;
 *   3 · **al menos una instancia de cada tipo con n ≤ 2** — son los que no
 *       tienen con qué probarse y los que más SIN PROBAR arrastran;
 *   4 · **y `codigo`**, que es el de n alto y el que lleva
 *       `F3-3-CODE-SEGURIDAD` encima.
 *
 * CONTROLES:
 *   · los tipos raros se DERIVAN contando sobre el corpus, no de la spec;
 *   · **todo tipo que la selección no cubra sale NOMBRADO**, y si queda alguno
 *       la sonda TIRA: un piloto que dice cubrir y no cubre es peor que uno
 *       corto, porque su verde se lee como cobertura;
 *   · y el piloto se publica **con lo que NO ejercita**, que es la mitad que
 *       decide cómo leer su resultado.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { limpia, parsea, tipoDe, esEstructura, seccionesPropias, modulosDe } from "./arbol-f33.mjs";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");

/* ── 1 · censo: qué tipo trae cada página ─────────────────────────────────── */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const GRUPOS = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};

const paginas = [];
for (const [grupo, lista] of Object.entries(GRUPOS)) {
  for (const e of lista) {
    if (!e.fichero || !existsSync(join(CORPUS, e.fichero))) continue;
    const bruto = readFileSync(join(CORPUS, e.fichero), "utf8");
    const html = limpia(bruto);
    const bc = (/<body[^>]*class="([^"]*)"/.exec(html) || [])[1] || "";
    /* S1 — las de otra colección no entran en el piloto de `paginas`. */
    if (/\bsingle-post\b/.test(bc)) continue;
    const B = /\bet_pb_pagebuilder_layout\b/.test(bc), T = /\bet-tb-has-body\b/.test(bc);
    const reg = B && T ? "BT" : B ? "B-" : T ? "-T" : "--";
    const tipos = {};
    let nSec = 0;
    for (const sec of seccionesPropias(parsea(html))) {
      nSec++;
      for (const m of modulosDe(sec)) {
        const t = tipoDe(m);
        if (!t || esEstructura(t)) continue;
        tipos[t] = (tipos[t] || 0) + 1;
      }
    }
    paginas.push({ ruta: e.ruta, grupo, reg, nSec, tipos, fichero: e.fichero });
  }
}
if (paginas.length === 0) throw new Error("CENSO VACÍO (§sondas 4)");

/* ── 2 · el n de cada tipo, EN PÁGINAS ─────────────────────────────────────── */
const nPaginasPorTipo = {};
for (const p of paginas) for (const t of Object.keys(p.tipos)) nPaginasPorTipo[t] = (nPaginasPorTipo[t] || 0) + 1;

/** Raro = lo trae 2 páginas o menos. DERIVADO, no una lista. */
const RAROS = Object.entries(nPaginasPorTipo).filter(([, n]) => n <= 2).map(([t]) => t);
const OBLIGADOS = [...RAROS, "code"];

/* ── 3 · la selección ─────────────────────────────────────────────────────── */
const piloto = [], porQue = {};
function mete(p, razon) {
  if (piloto.some((x) => x.ruta === p.ruta)) { porQue[p.ruta].push(razon); return; }
  piloto.push(p); porQue[p.ruta] = [razon];
}

/* (2) el régimen `--`, sí o sí */
for (const p of paginas.filter((x) => x.reg === "--")) mete(p, "régimen `--` — estrena el campo rico de S2 (n = 1)");

/* (3)+(4) una instancia de cada obligado. Se elige la que traiga MÁS
 * obligados a la vez: menos páginas en el piloto, misma cobertura. */
for (const t of OBLIGADOS) {
  if (piloto.some((p) => p.tipos[t])) continue;
  const cands = paginas.filter((p) => p.tipos[t]);
  if (!cands.length) continue;
  cands.sort((a, b) => OBLIGADOS.filter((x) => b.tipos[x]).length - OBLIGADOS.filter((x) => a.tipos[x]).length);
  mete(cands[0], `única/primera con \`et_pb_${t}\` (n = ${nPaginasPorTipo[t]} páginas)`);
}

/* (5) UNA de cada RÉGIMEN. Sin esto el piloto puede dejar fuera un régimen
 * entero —`BT` son 8 de 31— y su verde se leería como verde del arquetipo.
 * Entre las candidatas se elige la que traiga más tipos todavía sin tocar:
 * misma página, más cobertura. */
for (const reg of [...new Set(paginas.map((p) => p.reg))].sort()) {
  if (piloto.some((p) => p.reg === reg)) continue;
  const yaTocados = new Set(piloto.flatMap((p) => Object.keys(p.tipos)));
  const cands = paginas.filter((p) => p.reg === reg).sort(
    (a, b) => Object.keys(b.tipos).filter((t) => !yaTocados.has(t)).length - Object.keys(a.tipos).filter((t) => !yaTocados.has(t)).length,
  );
  if (cands[0]) mete(cands[0], `único representante del régimen \`${reg}\` (${paginas.filter((p) => p.reg === reg).length} de ${paginas.length} páginas)`);
}

/* (1) el contraste: una de BUILDER puro con varias secciones, para que el
 * piloto no sea sólo casos raros. Sin esto mediría las excepciones y no el
 * arquetipo. */
const gordas = paginas.filter((p) => p.reg === "B-" && !piloto.some((x) => x.ruta === p.ruta)).sort((a, b) => b.nSec - a.nSec);
if (gordas[0]) mete(gordas[0], `BUILDER puro con ${gordas[0].nSec} secciones — el caso NORMAL, para no medir sólo excepciones`);

/* ── 4 · el control: ¿queda algún obligado fuera? ──────────────────────────── */
const sinCubrir = OBLIGADOS.filter((t) => !piloto.some((p) => p.tipos[t]));

/* ── 5 · el informe ───────────────────────────────────────────────────────── */
console.log(`═══ 1 · CENSO — n de cada tipo EN PÁGINAS (de ${paginas.length} de \`paginas\`)`);
for (const [t, n] of Object.entries(nPaginasPorTipo).sort((a, b) => b[1] - a[1]))
  console.log(`  et_pb_${t.padEnd(20)} ${String(n).padStart(3)} páginas${n <= 2 ? "   ← RARO (n ≤ 2): arrastra SIN PROBAR" : ""}`);

console.log(`\n═══ 2 · OBLIGADOS — derivados, no escritos`);
console.log(`  raros (n ≤ 2): ${RAROS.join(" · ")}`);
console.log(`  + \`code\` por F3-3-CODE-SEGURIDAD (n = ${nPaginasPorTipo.code || 0})`);

console.log(`\n═══ 3 · EL PILOTO — ${piloto.length} páginas`);
for (const p of piloto) {
  console.log(`\n  · ${p.ruta}`);
  console.log(`      grupo ${p.grupo} · régimen ${p.reg} · ${p.nSec} secciones`);
  console.log(`      tipos: ${Object.entries(p.tipos).map(([t, n]) => `${t}×${n}`).join(" · ") || "(ninguno — el cuerpo va por campo rico)"}`);
  for (const r of porQue[p.ruta]) console.log(`      ▸ ${r}`);
}

console.log(`\n═══ 4 · COBERTURA — lo que el piloto EJERCITA`);
const cubiertos = OBLIGADOS.filter((t) => piloto.some((p) => p.tipos[t]));
console.log(`  obligados cubiertos: ${cubiertos.length}/${OBLIGADOS.length} — ${cubiertos.join(" · ")}`);
console.log(`  regímenes: ${[...new Set(piloto.map((p) => p.reg))].sort().join(" · ")} de ${[...new Set(paginas.map((p) => p.reg))].sort().join(" · ")}`);
const tiposPiloto = new Set(piloto.flatMap((p) => Object.keys(p.tipos)));
console.log(`  tipos del corpus tocados: ${tiposPiloto.size}/${Object.keys(nPaginasPorTipo).length}`);

console.log(`\n═══ 5 · LO QUE EL PILOTO **NO** EJERCITA — la mitad que decide cómo leerlo`);
const noTocados = Object.keys(nPaginasPorTipo).filter((t) => !tiposPiloto.has(t));
console.log(`  tipos sin tocar: ${noTocados.length}${noTocados.length ? " — " + noTocados.join(" · ") : ""}`);
console.log(`  páginas sin emitir: ${paginas.length - piloto.length} de ${paginas.length}`);
const regsNo = [...new Set(paginas.map((p) => p.reg))].filter((r) => !piloto.some((p) => p.reg === r));
console.log(`  regímenes sin tocar: ${regsNo.length ? regsNo.join(" · ") : "ninguno"}`);
console.log(`  ⚠ un verde del piloto NO es un verde de las ${paginas.length}: es un verde de ${piloto.length},`);
console.log(`    y de los tipos raros lo es con n = 1 POR TIPO — sin variación que lo pruebe.`);

writeFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/piloto-f33.json"),
  JSON.stringify({ generado: "93.ª tanda", piloto: piloto.map((p) => ({ ruta: p.ruta, fichero: p.fichero, reg: p.reg, nSec: p.nSec, tipos: p.tipos, porQue: porQue[p.ruta] })), nPaginasPorTipo, obligados: OBLIGADOS, noTocados }, null, 2));

console.log(`\n═══ 6 · CONTRATO`);
console.log(`  evaluadas ${paginas.length}/${paginas.length} páginas · piloto ${piloto.length} · obligados ${cubiertos.length}/${OBLIGADOS.length}`);
if (sinCubrir.length) {
  console.log(`⛔ OBLIGADOS SIN CUBRIR: ${sinCubrir.join(" · ")} — un piloto que dice cubrir y no cubre`);
  console.log(`   es peor que uno corto: su verde se lee como cobertura.`);
  process.exit(2);
}
console.log(`  ✅ los ${OBLIGADOS.length} obligados están cubiertos.`);
