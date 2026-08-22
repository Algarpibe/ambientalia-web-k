/* v4 — 92.ª tanda, 2026-08-22.
 *
 * v3 arregló §regla 9 caso 7 (la lista `YA` escrita a mano) derivando `UNION_MONO`
 * del registro de bloques. Su defecto que quedaba NO estaba en el censo —que es
 * bueno y v4 reproduce LITERALMENTE, mismo bloque de impresión— sino en las DOS
 * ÚLTIMAS LÍNEAS:
 *
 *     ⚠ COTA, no total: derivado de 32 páginas de 48.
 *        Las 16 sin capturar pueden añadir tipos. La unión es un MÍNIMO.
 *
 * El número `48` estaba bien derivado (`lista.length`), así que NO era §regla 9.
 * Lo que estaba mal era la INFERENCIA: el pie daba por sentado que «entrada sin
 * fichero» = «página que espera captura». `sueltas-16-reverificadas-2026-08-22.json`
 * —congelada a las 09:06 del MISMO DÍA, 18 minutos después de este log— prueba
 * que las 16 son **13 × HTTP 301 y 3 × HTTP 404**: no son páginas y no se pueden
 * capturar nunca. Así que la unión NO es una cota: es el TOTAL de las 32.
 *
 * v4 no reescribe el veredicto a mano (eso sería cablear el resultado de hoy):
 * **deriva la disposición de cada entrada sin fichero** de la congelada, y
 * declara COTA o TOTAL según lo que quede sin explicar.
 *
 *   · ruta sin fichero Y sin entrada en la congelada → HUECO REAL de captura,
 *     se NOMBRA, y el veredicto vuelve a ser COTA;
 *   · ruta sin fichero Y con 301/404 en la congelada → NO ES UNA PÁGINA, se
 *     cuenta aparte y no puede añadir tipos.
 *
 * CONTROL (§sondas 4 · §regla 8 — un negativo sin control no es un negativo):
 * si la congelada no existe, o hay ausencias y no explica NI UNA, es un DEFECTO
 * y tira. Un cero de cobertura no puede leerse como «no había ausencias».
 *
 * ⚠ DIFERENCIA CON v3, declarada para que el control se pueda comprobar: el
 * bloque de censo y el de la unión son los de v3 CARÁCTER A CARÁCTER salvo el
 * denominador del titular de la unión (`32/48` → `32`, porque el 48 no es una
 * unidad de páginas). Todo lo demás nuevo está DEBAJO, en §6.
 *
 * ⚠ Esto NO es una sonda: lee el corpus y el código que ya están en el repo,
 * no abre el original y no congela en `medidas/`.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const BLOQUES = join(RAIZ, "packages/cms-config/src/bloques");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");

/* ── 1 · el REGISTRO de bloques, derivado del código ───────────────────────── */
const registro = {};
for (const f of readdirSync(BLOQUES).filter((x) => x.endsWith(".ts"))) {
  const src = readFileSync(join(BLOQUES, f), "utf8");
  const slugs = [...src.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
  registro[f.replace(/\.ts$/, "")] = [...new Set(slugs)].sort();
}
/* CONTROL (§sondas 4): si el parseo no casa con nada, es un defecto, no un cero. */
const totalSlugs = Object.values(registro).flat().length;
if (totalSlugs === 0) throw new Error("REGISTRO VACÍO: el parseo de slug: no casó con nada");

/* La unión que MonoSeccion[] consume, derivada de monografico.ts:116 —
 * MODULOS_MONOGRAFICO = [...MODULOS_COMPARTIDOS, serie, tabla, ctaDescarga,
 * mapaProyectos] y MODULOS_COMPARTIDOS = [titular, claim, texto, imagen, boton]. */
const UNION_MONO = new Set([
  ...["titular", "claim", "texto", "imagen", "boton"],           // contenido.ts:296
  ...["serie", "tabla", "ctaDescarga", "mapaProyectos"],          // monografico.ts:116
]);

/* ── 2 · la CORRESPONDENCIA Divi → slug. DECLARADA, no derivable ───────────── */
const MAPA = {
  text: ["titular", "claim", "texto"],
  image: ["imagen"],
  button: ["boton"],
  cta: ["ctaDescarga"],
  blurb: ["blurb"],       // existe, pero en MODULOS_KB
  gallery: ["gallery"],   // existe, pero en MODULOS_KB
};
/* Estructura de Divi: no son módulos de contenido, son la retícula que
 * `flujo`/`anchoPct`/`filas`/`columnas` ya modelan. Se cuentan aparte. */
const ESTRUCTURA = new Set([
  "section", "row", "column", "column_1", "column_2", "column_3", "column_4",
]);

const expresaMono = (t) => (MAPA[t] || []).some((s) => UNION_MONO.has(s));
const existeBloque = (t) => (MAPA[t] || []).some((s) => Object.values(registro).flat().includes(s));

/* ── 3 · LA DISPOSICIÓN DE LO NO CAPTURADO, derivada (lo nuevo de v4) ──────── */
const FREV = join(DERIV, "sueltas-16-reverificadas-2026-08-22.json");
if (!existsSync(FREV)) {
  throw new Error(`CONGELADA AUSENTE: ${FREV}\n` +
    "Sin ella no se puede derivar si una ausencia es un hueco de captura o una no-página.\n" +
    "§regla 8b: un hecho negativo se comprueba contra el archivo, no de memoria.");
}
const rev = JSON.parse(readFileSync(FREV, "utf8"));
const norm = (r) => r.replace(/\/+$/, "") || "/";
const NOPAGINA = new Map(rev.rutas.map((r) => [norm(r.ruta), r]));

/* ── 4 · el censo ─────────────────────────────────────────────────────────── */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};
const limpia = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

console.log("═══ REGISTRO DE BLOQUES, derivado de packages/cms-config/src/bloques/");
for (const [f, s] of Object.entries(registro)) console.log(`    ${f.padEnd(12)} ${s.join(" · ")}`);
console.log(`    UNION_MONO (lo que MonoSeccion[] consume): ${[...UNION_MONO].join(" · ")}`);

const unionGlobal = {};      // tipo de contenido -> nº de páginas (de las 32)
let paginasLeidas = 0, rutasTotales = 0;
const noPagina = [], huecoReal = [];

for (const [nombre, lista] of Object.entries(grupos)) {
  const propia = {}, tb = {};
  const porPagina = [];
  let n = 0;
  rutasTotales += lista.length;
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) {
      const d = NOPAGINA.get(norm(e.ruta));
      if (d) noPagina.push({ ruta: e.ruta, http: d.http, location: d.location || null });
      else huecoReal.push(e.ruta);
      continue;
    }
    n++;
    const html = limpia(readFileSync(f, "utf8"));
    const vP = new Set(), vT = new Set();
    for (const m of html.matchAll(/\bet_pb_([a-z][a-z0-9_]*?)_(\d+)(_tb_(header|body|footer))?\b/g)) {
      if (m[3]) vT.add(m[1]); else vP.add(m[1]);
    }
    vP.forEach((t) => (propia[t] = (propia[t] || 0) + 1));
    vT.forEach((t) => (tb[t] = (tb[t] || 0) + 1));
    porPagina.push([e.ruta, [...vP].filter((t) => !ESTRUCTURA.has(t)).sort().join(",") || "— (0 módulos de contenido)"]);
  }
  paginasLeidas += n;

  /* ▼▼ BLOQUE LITERAL DE v3 — no se toca, es lo que hace comprobable el control ▼▼ */
  const contenido = Object.entries(propia).filter(([t]) => !ESTRUCTURA.has(t)).sort((a, b) => b[1] - a[1]);
  contenido.forEach(([t, c]) => (unionGlobal[t] = (unionGlobal[t] || 0) + c));

  console.log(`\n═══ ${nombre} — ${n}/${lista.length} HTML capturados`);
  console.log(`  MÓDULOS DE CONTENIDO de la capa propia (los que deciden el modelo):`);
  for (const [t, c] of contenido) {
    const marca = expresaMono(t) ? "  " : existeBloque(t) ? "≈ " : "★ ";
    console.log(`     ${marca}et_pb_${t.padEnd(20)} ${String(c).padStart(3)}/${n} páginas`);
  }
  const estr = Object.keys(propia).filter((t) => ESTRUCTURA.has(t)).sort();
  console.log(`  estructura (retícula, ya modelada por flujo/anchoPct/filas/columnas): ${estr.join(" · ") || "—"}`);
  console.log(`  capa _tb_ (cascarón, común): ${Object.keys(tb).sort().join(" · ") || "—"}`);
  const fuera = contenido.map(([t]) => t).filter((t) => !expresaMono(t));
  const sinBloque = fuera.filter((t) => !existeBloque(t));
  console.log(`  ★ FUERA de MonoSeccion[]: ${fuera.length} — ${fuera.join(" · ") || "NINGUNO"}`);
  console.log(`  ★ sin bloque en NINGUNA unión del repo: ${sinBloque.length} — ${sinBloque.join(" · ") || "NINGUNO"}`);
  console.log(`  por página:`);
  porPagina.forEach(([r, t]) => console.log(`      ${r.padEnd(74)} ${t}`));
  /* ▲▲ fin del bloque literal de v3 ▲▲ */
}

/* ── 5 · la UNIÓN que C3 necesita — bloque LITERAL de v3, salvo el denominador ─ */
const tipos = Object.keys(unionGlobal).sort((a, b) => unionGlobal[b] - unionGlobal[a]);
const fuera = tipos.filter((t) => !expresaMono(t));
const sinBloque = fuera.filter((t) => !existeBloque(t));
console.log(`\n═══ LA UNIÓN QUE C3 NECESITA — derivada de ${paginasLeidas} páginas`);
console.log(`  tipos de CONTENIDO distintos (capa propia): ${tipos.length}`);
tipos.forEach((t) => {
  const d = expresaMono(t) ? "MonoSeccion[] lo expresa" : existeBloque(t) ? `bloque existe, pero fuera de MonoSeccion[] (${MAPA[t].join("/")})` : "SIN BLOQUE EN EL REPO — definición nueva";
  console.log(`     et_pb_${t.padEnd(20)} ${String(unionGlobal[t]).padStart(3)} págs · ${d}`);
});
console.log(`  ▸ fuera de MonoSeccion[]: ${fuera.length} — ${fuera.join(" · ")}`);
console.log(`  ▸ definiciones NUEVAS que C3 tiene que escribir: ${sinBloque.length} — ${sinBloque.join(" · ")}`);
console.log(`  ▸ copiables de otra unión: ${fuera.filter((t) => existeBloque(t)).length} — ${fuera.filter((t) => existeBloque(t)).join(" · ") || "—"}`);

/* ── 6 · EL PIE, DERIVADO — ni COTA ni TOTAL por decreto ───────────────────── */
console.log(`\n═══ ¿COTA o TOTAL? — derivado, no supuesto`);
console.log(`  rutas de la cola larga (URLs conocidas) : ${rutasTotales}`);
console.log(`  de ellas, PÁGINAS leídas               : ${paginasLeidas}`);
console.log(`  de ellas, NO SON PÁGINAS (301/404)     : ${noPagina.length}   ← derivado de ${rev.meta.fecha}`);
console.log(`  de ellas, HUECO REAL de captura        : ${huecoReal.length}`);

/* CONTROL: la congelada tiene que explicar ALGO. Un 0 de cobertura con ausencias
 * a la vista significa que las rutas no casan, no que no hubiera ausencias. */
if (rutasTotales !== paginasLeidas && noPagina.length === 0) {
  throw new Error(
    `CONTROL ROTO: hay ${rutasTotales - paginasLeidas} ausencias y la congelada no explica NINGUNA.\n` +
    "Un 0 de cobertura no es «no había no-páginas»: es que las rutas no casan.");
}

if (huecoReal.length === 0) {
  console.log(`\n  ✅ TOTAL, no cota: las ${rutasTotales - paginasLeidas} rutas sin HTML NO SON PÁGINAS`);
  console.log(`     (${rev.recuento.r301} × 301 · ${rev.recuento.r404} × 404, dos lecturas separadas 13 días),`);
  console.log(`     así que no queda nada por capturar y la unión de ${tipos.length} tipos es COMPLETA para las ${paginasLeidas}.`);
} else {
  console.log(`\n  ⚠ COTA, no total: quedan ${huecoReal.length} rutas SIN capturar y SIN explicar.`);
  console.log(`     Pueden añadir tipos. La unión es un MÍNIMO. Son:`);
  for (const r of huecoReal.sort()) console.log(`       ${r}`);
}

console.log(`\n  ▸ las ${noPagina.length} que NO son páginas, NOMBRADAS (no contadas):`);
for (const d of noPagina.sort((a, b) => a.ruta.localeCompare(b.ruta))) {
  console.log(`      ${String(d.http)}  ${d.ruta.padEnd(58)} ${d.location || ""}`);
}
