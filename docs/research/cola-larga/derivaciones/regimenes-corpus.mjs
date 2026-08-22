/* regimenes-corpus — 93.ª tanda, 2026-08-22. ESCALÓN 2.
 *
 * LA PREGUNTA, en las DOS direcciones (§*una comprobación retroactiva se
 * enmarca en las dos direcciones*):
 *
 *   (a) hacia atrás — ¿cuántos documentos de TODO lo capturado caen en cada
 *       casillero de régimen, incluido el CUARTO que la 92.ª descubrió?
 *   (b) hacia delante — ¿aparece alguna combinación MÁS sin nombrar?
 *
 * **El número se escribe aunque sea cero.** Se deriva del corpus, sin abrir el
 * original: el `<body>` es una línea de HTML servido y ya está congelada.
 *
 * ── Por qué DOS ejes y no uno ──────────────────────────────────────────────
 * El régimen (`CLAUDE.md` §identifica el RÉGIMEN) se lee de dos marcadores de
 * DIVI: `et_pb_pagebuilder_layout` y `et-tb-has-body`. Eso da 4 combinaciones.
 * Pero la 92.ª encontró que la cuarta —la que no lleva ninguno de los dos— se
 * distingue por un marcador que **no es de Divi sino de WORDPRESS**
 * (`page-template-default`, `single-post`, `archive`…), y ese eje es el que
 * dice QUÉ PLANTILLA DEL TEMA sirve el documento.
 *
 * Se censan **los dos por separado y su cruce**: si el cruce tuviera una sola
 * celda poblada por fila, los dos ejes serían el mismo (§*dos variables
 * confundidas*) y bastaría uno.
 *
 * ⚠ **EL EJE WP SE DERIVA, NO SE ESCRIBE** (§sondas 4, cara del sobre-casado).
 * La v1 de esta sonda usaba una lista de patrones a mano y **se sobre-casaba**:
 * `page-template-[a-z0-9-]+` se tragaba a `page-template-default`, y
 * `single-(?!post)` casaba con `single-format-standard`, que no es un CPT. Eso
 * no daba error — daba un reparto plausible con 6 formas inventadas. Ahora los
 * tokens se **recogen** del `<body>` y se agrupan por familia declarada.
 *
 * ── CONTROLES (§sondas 4) ──────────────────────────────────────────────────
 *   · el `<body>` tiene que casar. Un fichero sin `<body class=…>` sale
 *     NOMBRADO y FUERA del denominador: un `null` se leería como «sin
 *     marcador», que es justo uno de los casilleros — el cero y el dato son
 *     indistinguibles aquí, así que hay que separarlos a mano;
 *   · el cardinal se deriva del árbol, no se escribe;
 *   · `transformado/` **no es captura**: es salida derivada. Se declara con su
 *     cardinal y se excluye del universo, en vez de contarse como si fuera
 *     original servido (§*un canal que otro cubre no es «sin dato»*);
 *   · y **todo token de plantilla sale NOMBRADO con su n**, incluidos los que
 *     aparecen una sola vez.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus");

/* ── 1 · el universo: TODO el HTML capturado, derivado del árbol ──────────── */
function* html(dir) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) yield* html(f);
    else if (n.endsWith(".html")) yield f;
  }
}
const TODOS = [...html(CORPUS)].map((f) => relative(CORPUS, f).replace(/\\/g, "/"));
if (TODOS.length === 0) throw new Error("UNIVERSO VACÍO: el recorrido no casó con nada (§sondas 4)");
const DERIVADOS = TODOS.filter((f) => f.startsWith("transformado/"));
const CAPTURAS = TODOS.filter((f) => !f.startsWith("transformado/"));

/* ── 2 · los dos ejes ─────────────────────────────────────────────────────── */
/** Eje DIVI — los dos marcadores que `CLAUDE.md` usa para el régimen. */
function regimenDivi(bc) {
  const B = /\bet_pb_pagebuilder_layout\b/.test(bc);
  const T = /\bet-tb-has-body\b/.test(bc);
  return B && T ? "BT · híbrido" : B ? "B- · builder" : T ? "-T · plantillado" : "-- · sin marcador Divi";
}

/**
 * Eje WORDPRESS — la plantilla del tema, DERIVADA de los tokens presentes.
 * WordPress escribe una familia de clases en el `<body>`; se toma la de MAYOR
 * especificidad que esté, y lo que no case sale nombrado con su token crudo.
 */
function plantillaWp(bc) {
  const t = new Set(bc.split(/\s+/));
  if (t.has("error404")) return "error404";
  if (t.has("search")) return "search";
  if (t.has("single-post")) return "single-post";
  const cpt = [...t].find((x) => /^single-(?!post$|format-)/.test(x));
  if (cpt) return `single-CPT (${cpt.slice(7)})`;
  if (t.has("archive")) {
    const tax = [...t].find((x) => /^(tax|category|post-type-archive)-/.test(x));
    return `archive (${tax || "sin taxonomía nombrada"})`;
  }
  const pt = [...t].find((x) => /^page-template-/.test(x) && x !== "page-template");
  if (pt) return pt;
  if (t.has("page-template-default") || t.has("page-template")) return "page-template-default";
  if (t.has("page")) return "page (sin plantilla nombrada)";
  if (t.has("home") || t.has("blog")) return "home/blog";
  return `SIN TOKEN DE PLANTILLA [${bc.split(/\s+/).slice(0, 6).join(" ")}]`;
}

/* ── 3 · el recorrido ─────────────────────────────────────────────────────── */
const porDivi = {}, porWp = {}, cruce = {}, sinBody = [];
const ejemplos = {};

for (const rel of CAPTURAS) {
  const h = readFileSync(join(CORPUS, rel), "utf8");
  const m = /<body[^>]*\bclass="([^"]*)"/.exec(h);
  if (!m) { sinBody.push(rel); continue; }
  const bc = m[1];
  const d = regimenDivi(bc), w = plantillaWp(bc), k = `${d}  ×  ${w}`;
  porDivi[d] = (porDivi[d] || 0) + 1;
  porWp[w] = (porWp[w] || 0) + 1;
  cruce[k] = (cruce[k] || 0) + 1;
  (ejemplos[k] = ejemplos[k] || []).push(rel);
}

const N = CAPTURAS.length - sinBody.length;
if (N === 0) throw new Error("NINGUNA captura tenía `<body class=…>` — es el instrumento, no el dato");

/* ── 4 · el informe ───────────────────────────────────────────────────────── */
console.log(`═══ 0 · UNIVERSO — derivado del árbol de \`corpus/\`, no de una lista`);
console.log(`  .html bajo corpus/            ${String(TODOS.length).padStart(5)}`);
console.log(`  − derivados (transformado/)   ${String(DERIVADOS.length).padStart(5)}   fuera: no son captura, son salida`);
console.log(`  = CAPTURAS                    ${String(CAPTURAS.length).padStart(5)}`);
console.log(`  − sin \`<body class=…>\`        ${String(sinBody.length).padStart(5)}${sinBody.length ? "   ⚠ nombradas abajo" : ""}`);
console.log(`  = DENOMINADOR                 ${String(N).padStart(5)}`);

console.log(`\n═══ 1 · EJE DIVI — los CASILLEROS de régimen de \`CLAUDE.md\``);
console.log(`  ${"casillero".padEnd(26)} ${"n".padStart(5)}   %`);
for (const [k, v] of Object.entries(porDivi).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k.padEnd(26)} ${String(v).padStart(5)}   ${(100 * v / N).toFixed(1)}%`);
const VISTOS = Object.keys(porDivi).length;
console.log(`  combinaciones POSIBLES 4 · VISTAS ${VISTOS} · con n = 0: ${4 - VISTOS}`);

console.log(`\n═══ 2 · EJE WORDPRESS — qué plantilla del tema sirve el documento`);
for (const [k, v] of Object.entries(porWp).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k.padEnd(46)} ${String(v).padStart(5)}`);

console.log(`\n═══ 3 · EL CRUCE — si tuviera UNA sola celda por fila, los dos ejes serían el mismo`);
const filas = Object.entries(cruce).sort((a, b) => b[1] - a[1]);
for (const [k, v] of filas) console.log(`  ${String(v).padStart(5)}  ${k}`);
console.log(`\n  celdas pobladas ${filas.length} de ${VISTOS} × ${Object.keys(porWp).length} = ${VISTOS * Object.keys(porWp).length} posibles`);
const porFila = {};
for (const [k] of filas) { const d = k.split("  ×  ")[0]; porFila[d] = (porFila[d] || 0) + 1; }
for (const [d, n] of Object.entries(porFila))
  console.log(`  ${d.padEnd(26)} → ${n} plantilla(s) WP distinta(s)${n === 1 ? "   ⚠ esta fila NO separa los dos ejes" : ""}`);

console.log(`\n═══ 4 · CELDAS RARAS (n ≤ 3) — NOMBRADAS, no contadas`);
let raras = 0;
for (const [k, v] of filas) if (v <= 3) { raras++; console.log(`  ${String(v).padStart(3)}  ${k}\n       ${ejemplos[k].join("\n       ")}`); }
if (!raras) console.log("  (ninguna)");

console.log(`\n═══ 5 · LA COLA LARGA DENTRO DE ESTO — las 32 de CMS-3`);
const ld = JSON.parse(readFileSync(join(RAIZ, "corpus/fase-3/LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const cl = [...ld.filter((x) => x.bucket === "hubs-kb"), ...L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  ...ld.filter((x) => x.bucket === "sueltas")].filter((e) => e.fichero && CAPTURAS.includes("fase-3/" + e.fichero));
const clCruce = {}, clDivi = {};
for (const e of cl) {
  const bc = (/<body[^>]*\bclass="([^"]*)"/.exec(readFileSync(join(CORPUS, "fase-3", e.fichero), "utf8")) || [])[1] || "";
  const d = regimenDivi(bc), w = plantillaWp(bc);
  clDivi[d] = (clDivi[d] || 0) + 1;
  (clCruce[`${d}  ×  ${w}`] = clCruce[`${d}  ×  ${w}`] || []).push(e.ruta);
}
console.log(`  n = ${cl.length}`);
for (const [k, v] of Object.entries(clDivi).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(26)} ${String(v).padStart(3)}`);
console.log(`  — por celda:`);
for (const [k, v] of Object.entries(clCruce).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(v.length).padStart(3)}  ${k}`);
  if (v.length <= 2) for (const r of v) console.log(`       ${r}`);
}

if (sinBody.length) {
  console.log(`\n═══ 6 · CAPTURAS SIN \`<body class=…>\` — nombradas, FUERA del denominador`);
  for (const s of sinBody.slice(0, 40)) console.log(`  · ${s}`);
  if (sinBody.length > 40) console.log(`  … y ${sinBody.length - 40} más`);
}

console.log(`\n═══ 7 · LO QUE ESTE CENSO **NO** CONTESTA`);
console.log(`  · no dice quién decidió cada valor: eso lo dice la VARIANZA de la capa,`);
console.log(`    no el marcador (CLAUDE.md, corrección del 2026-08-03)`);
console.log(`  · no mira el CSS ni la geometría: es un censo del \`<body>\` servido`);
console.log(`  · el universo son los ficheros CAPTURADOS (${N}), no el sitio`);
