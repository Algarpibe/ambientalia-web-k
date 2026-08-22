/* v3 — 91.ª tanda, 2026-08-22.
 *
 * v2 arregló el SOBRE-CASADO (contaba clases modificadoras como tipos). Su
 * defecto que quedaba es otro y es §regla 9 caso 7: **`YA` era una lista de
 * literales escrita a mano dentro de la derivación** —
 *
 *     const YA = new Set(["text","image","button","blurb","cta",
 *                         "divider","code","gallery"]);
 *
 * y esa lista acredita a `MonoSeccion[]` CUATRO tipos que no expresa:
 *   · `blurb` y `gallery` existen como bloque, pero en `MODULOS_KB` — la unión
 *     de `articulos-kb`, NO la del monográfico;
 *   · `code` y `divider` **no existen en ninguna unión del repo**.
 *
 * v3 no reescribe la lista (eso sólo reinicia el reloj): **la DERIVA del
 * registro de bloques**, leyendo los `slug:` de `packages/cms-config/src/bloques/`.
 * Un bloque nuevo entra solo; uno que se borre, sale solo.
 *
 * Lo que NO se puede derivar es la correspondencia `et_pb_<tipo>` → slug de
 * bloque: es una decisión de modelado. Se declara aquí, con su fuente, y todo
 * tipo sin correspondencia sale NOMBRADO en vez de contarse como cubierto.
 *
 * ⚠ Esto NO es una sonda: lee el corpus y el código que ya están en el repo,
 * no abre el original y no congela en `medidas/`.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const BLOQUES = join(RAIZ, "packages/cms-config/src/bloques");

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

/* ── 3 · el censo ─────────────────────────────────────────────────────────── */
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
let paginasLeidas = 0, paginasTotales = 0;

for (const [nombre, lista] of Object.entries(grupos)) {
  const propia = {}, tb = {};
  const porPagina = [];
  let n = 0;
  paginasTotales += lista.length;
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
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
}

/* ── 4 · la UNIÓN que C3 necesita ─────────────────────────────────────────── */
const tipos = Object.keys(unionGlobal).sort((a, b) => unionGlobal[b] - unionGlobal[a]);
const fuera = tipos.filter((t) => !expresaMono(t));
const sinBloque = fuera.filter((t) => !existeBloque(t));
console.log(`\n═══ LA UNIÓN QUE C3 NECESITA — derivada de ${paginasLeidas}/${paginasTotales} páginas`);
console.log(`  tipos de CONTENIDO distintos (capa propia): ${tipos.length}`);
tipos.forEach((t) => {
  const d = expresaMono(t) ? "MonoSeccion[] lo expresa" : existeBloque(t) ? `bloque existe, pero fuera de MonoSeccion[] (${MAPA[t].join("/")})` : "SIN BLOQUE EN EL REPO — definición nueva";
  console.log(`     et_pb_${t.padEnd(20)} ${String(unionGlobal[t]).padStart(3)} págs · ${d}`);
});
console.log(`  ▸ fuera de MonoSeccion[]: ${fuera.length} — ${fuera.join(" · ")}`);
console.log(`  ▸ definiciones NUEVAS que C3 tiene que escribir: ${sinBloque.length} — ${sinBloque.join(" · ")}`);
console.log(`  ▸ copiables de otra unión: ${fuera.filter((t) => existeBloque(t)).length} — ${fuera.filter((t) => existeBloque(t)).join(" · ") || "—"}`);
console.log(`\n  ⚠ COTA, no total: derivado de ${paginasLeidas} páginas de ${paginasTotales}.`);
console.log(`     Las ${paginasTotales - paginasLeidas} sin capturar pueden añadir tipos. La unión es un MÍNIMO.`);
