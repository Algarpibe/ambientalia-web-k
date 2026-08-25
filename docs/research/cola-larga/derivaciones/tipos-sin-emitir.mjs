/* tipos-sin-emitir — 106.ª tanda, 2026-08-25. ¿QUÉ TIPOS DE MÓDULO SIRVE EL
 * ORIGINAL QUE NINGÚN ARQUETIPO CONSTRUIDO EMITE?
 *
 * ── Por qué, y por qué en LAS DOS DIRECCIONES ────────────────────────────
 * `f33-cmp` destapó un `dvmd_table_maker` en `/es/politica-de-cookies/` — un
 * módulo de TERCEROS (plugin Divi Table Maker) que el censo no nombra y que el
 * clon no sirve por ningún canal. Los **34 «sin cablear»** de F3-3 son esa
 * clase, y este repo tiene escrito que **una clase no se da por cerrada hasta
 * que una sonda recorre la salida y sale limpia**.
 *
 * Y se pregunta en las DOS direcciones, porque §*una comprobación retroactiva
 * se enmarca en las DOS direcciones* y la de una sola sesga qué se encuentra:
 *
 *   A · **hacia atrás** — ¿hay arquetipos YA CONSTRUIDOS Y DADOS POR BUENOS que
 *       sirvan un tipo que el clon no emite? (el caso `dvmd_table_maker` en
 *       PRODUCTO, 20 documentos);
 *   B · **hacia delante** — ¿hay OTROS tipos en el corpus que ningún arquetipo
 *       emita? El barrido acotado, y **el número se escribe aunque sea cero**.
 *
 * ── Alcance, declarado ───────────────────────────────────────────────────
 * · **OFFLINE y sin abrir el original**: sólo lee `corpus/` y el árbol del clon;
 * · censa el tipo por su clase `et_pb_<tipo>` / `dvmd_*` **sobre el HTML sin
 *   `<style>` ni `<script>`**: el CSS de Divi nombra sus propias clases y
 *   buscarlas en el documento entero da el PLENO (§sondas 4, tercera cara);
 * · **NO arregla nada.** Si sale defecto, reabrir un arquetipo verificado es
 *   decisión del propietario, con su número delante.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus");
const SRC = join(RAIZ, "apps/web/src");

function anda(dir, ext) {
  const out = [];
  (function rec(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { if (!/node_modules|^\.next/.test(e.name)) rec(p); }
      else if (ext.test(e.name)) out.push(p);
    }
  })(dir);
  return out;
}
/** §sondas 4 · el markup se busca sobre el HTML SIN `<style>` ni `<script>`. */
const sinCss = (h) => h.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

/* ── 1 · el censo del ORIGINAL, por familia de corpus ─────────────────────── */
/**
 * ⚠⚠ **LA PRIMERA VERSIÓN DIO 188 TIPOS «SIN EMITIR» Y ERA EL INSTRUMENTO.**
 * Un regex propio sobre `class="…"` cuenta como tipos distintos los ORDINALES
 * (`et_pb_text_1`, `et_pb_text_5_tb_body`) y las clases ESTRUCTURALES
 * (`et_pb_menu__wrap`, `et_pb_icon_wrap`): 188 de 219 «no emitidos» es el
 * **pleno** de §sondas 4 — *un patrón que casa en casi todas mide el
 * instrumento, no el objeto*.
 *
 * El discriminador correcto **ya existe y está exportado**: `tipoDe` de
 * `arbol-f33`, que es el que Divi escribe siempre (`et_pb_<tipo>_<n>` sin
 * `_tb_`) y del que sale el censo de 313 módulos. Escribir un segundo sería la
 * clase C7 — dos definiciones de «qué es un tipo» y dos denominadores ciertos
 * a la vez.
 */
const { tipoDe, esEstructura } = await import("./arbol-f33.mjs");
const RE_CLASES = /class="([^"]*)"/gi;
const familias = new Map();          // familia → Map(tipo → Set(fichero))
for (const f of anda(CORPUS, /\.html?$/i)) {
  const rel = relative(CORPUS, f).split("\\").join("/");
  const fam = rel.split("/")[0];
  const html = sinCss(readFileSync(f, "utf8"));
  if (!familias.has(fam)) familias.set(fam, new Map());
  const m = familias.get(fam);
  for (const x of html.matchAll(RE_CLASES)) {
    const clases = x[1].split(/\s+/).filter(Boolean);
    const t = tipoDe({ clases });
    if (!t || esEstructura(t)) continue;
    if (!m.has(t)) m.set(t, new Set());
    m.get(t).add(rel);
  }
  /* Los módulos de TERCEROS no siguen el patrón `et_pb_<tipo>_<n>`: se nombran
   * por su prefijo de plugin. Se censan aparte y se dice que van aparte. */
  for (const x of html.matchAll(/\bdvmd_([a-z0-9_]+?)(?:_\d+)?\b/g)) {
    const t = `dvmd_${x[1]}`;
    if (!m.has(t)) m.set(t, new Set());
    m.get(t).add(rel);
  }
}

/* ── 2 · lo que el CLON emite ────────────────────────────────────────────── */
/** Se deriva del código, no de una lista escrita a mano (§regla 9, 7.º caso):
 *  cualquier literal `et_pb_*` / `dvmd_*` que aparezca en un `.tsx` del clon. */
/**
 * ⚠⚠ **LOS DOS LADOS NOMBRAN EL MISMO TIPO DISTINTO, y la v2 de esto tampoco lo
 * sabía: daba `image` como «no emitido» en 63 documentos.**
 *
 * El original dice `et_pb_image`; el clon dice `imagen-pagina` y su clase es
 * `f33-imagen`. Buscar el literal `et_pb_image` en el clon da **cero**, y ese
 * cero se lee como *«el clon no emite imágenes»* — que es falso y plausible.
 * Es exactamente §*el cruce de tipos comparaba DOS SISTEMAS DE NOMBRES*, el
 * defecto que `f33-cmp` ya se comió una vez (257 de 356, el 72 %).
 *
 * La correspondencia **ya existe**: `KIND_DE_DIVI` en `f33-cmp`. Escribir una
 * segunda sería la clase C7. Se lee del fuente de la sonda —no se copia— para
 * que ampliar allí amplíe aquí.
 */
const fuenteCmp = readFileSync(join(RAIZ, "scripts/qa/f33-cmp.mjs"), "utf8");
const bloque = /const KIND_DE_DIVI = \{([\s\S]*?)\};/.exec(fuenteCmp);
if (!bloque) throw new Error("no se pudo leer `KIND_DE_DIVI` de f33-cmp: sin la tabla esto compara dos sistemas de nombres (§sondas 4).");
const KIND_DE_DIVI = {};
for (const m of bloque[1].matchAll(/([a-z_]+)\s*:\s*"([^"]+)"/g)) KIND_DE_DIVI[m[1]] = m[2];
if (Object.keys(KIND_DE_DIVI).length < 5) throw new Error(`KIND_DE_DIVI leída con ${Object.keys(KIND_DE_DIVI).length} entradas: el regex no está casando (§sondas 4).`);

/** Un tipo está EMITIDO si el clon escribe su clase Divi **o** su `kind`. */
const literales = new Set();
for (const f of anda(SRC, /\.(tsx|ts)$/i)) {
  const s = readFileSync(f, "utf8");
  for (const x of s.matchAll(/\bet_pb_([a-z0-9_]+)\b/g)) literales.add(x[1]);
  for (const x of s.matchAll(/\bdvmd_([a-z0-9_]+)\b/g)) literales.add(`dvmd_${x[1]}`);
  for (const x of s.matchAll(/"([a-z]+-pagina|toggle|blurb|icono|mapa|slider|slider-completo|codigo)"/g)) literales.add(`kind:${x[1]}`);
}
if (!literales.size) throw new Error("0 clases `et_pb_*` en el clon: su cero se leería como «no emite nada» (§sondas 4).");
const emitidas = new Set();
for (const t of literales) emitidas.add(t);
for (const [divi, kind] of Object.entries(KIND_DE_DIVI)) if (literales.has(`kind:${kind}`)) emitidas.add(divi);
/**
 * ⚠ **`emitidas` es el conjunto de lo que el clon ESCRIBE, no de lo que
 * RENDERIZA correctamente.** Un tipo que aparece aquí puede seguir estando mal
 * —el `toggle` de esta misma tanda emitía su clase y era INERTE—. Lo que este
 * censo contesta es la pregunta más débil y más barata: **¿existe el canal?**
 * La fidelidad la dice el comparador, y para 5 de las 9 familias de corpus **no
 * existe comparador de dos lados** (§COBERTURA-MEDICION).
 */

/* ── 3 · el informe ──────────────────────────────────────────────────────── */
const todos = new Map();             // tipo → Map(familia → n ficheros)
for (const [fam, m] of familias) for (const [t, s] of m) {
  if (!todos.has(t)) todos.set(t, new Map());
  todos.get(t).set(fam, s.size);
}
const sinEmitir = [...todos.entries()].filter(([t]) => !emitidas.has(t))
  .sort((a, b) => [...b[1].values()].reduce((x, y) => x + y, 0) - [...a[1].values()].reduce((x, y) => x + y, 0));

/**
 * ⚠⚠ **Y LA TERCERA VUELTA DEL MISMO ERROR: 30 «tipos» NO SON 30 MÓDULOS.**
 *
 * `dvmd_tm_trow · dvmd_tm_tcell · dvmd_tm_col_odd …` son **el marcado INTERNO
 * de un solo módulo** (`dvmd_table_maker`), y `blog_item_0..4` son **los posts
 * dentro de un solo `et_pb_blog`**. Publicar 30 sería §*N valores de un total
 * no son N familias* — el mismo sobre-recuento que este fichero acaba de
 * corregir dos veces, una capa más abajo.
 *
 * La normalización se declara: se agrupa por **FAMILIA** —el prefijo de plugin
 * o el tipo sin su ordinal de item— y se publican **los dos cardinales**.
 */
function familiaDeTipo(t) {
  if (t.startsWith("dvmd_")) return "dvmd_table_maker (plugin Divi Table Maker)";
  const m = /^([a-z_]+?)_item(_\d+)?$/.exec(t);
  if (m) return m[1];
  return t;
}

const l = [];
l.push("═══ tipos-sin-emitir · qué sirve el original que el clon NO emite (OFFLINE)\n");
l.push(`  HTML del corpus            ${anda(CORPUS, /\.html?$/i).length}`);
l.push(`  familias de corpus         ${familias.size}   (${[...familias.keys()].join(" · ")})`);
l.push(`  tipos distintos vistos     ${todos.size}`);
l.push(`  clases que el clon emite   ${emitidas.size}   (derivadas de apps/web/src/**.tsx, no de una lista)`);
/* Agrupado por FAMILIA, con los dos cardinales publicados. */
const porFamilia = new Map();       // familia → {clases:Set, docs:Set, corpus:Map}
for (const [t, porFam] of sinEmitir) {
  const fa = familiaDeTipo(t);
  if (!porFamilia.has(fa)) porFamilia.set(fa, { clases: new Set(), docs: new Set(), corpus: new Map() });
  const v = porFamilia.get(fa);
  v.clases.add(t);
  for (const [famCorpus, m] of familias) if (m.has(t)) {
    for (const r of m.get(t)) v.docs.add(r);
    v.corpus.set(famCorpus, (v.corpus.get(famCorpus) || 0) + 0);
  }
}
for (const [, v] of porFamilia) {
  v.corpus = new Map();
  for (const r of v.docs) { const f = r.split("/")[0]; v.corpus.set(f, (v.corpus.get(f) || 0) + 1); }
}
const orden = [...porFamilia.entries()].sort((a, b) => b[1].docs.size - a[1].docs.size);

l.push(`\n  ── B · FAMILIAS DE MÓDULO QUE NINGÚN ARQUETIPO EMITE: ${orden.length} ──`);
l.push(`     (${sinEmitir.length} clases distintas, que son ${orden.length} módulos: el resto es su marcado interno)`);
if (!orden.length) l.push("     NINGUNA. (Y el cero se escribe: «no encontré» y «no miré» dan la misma salida.)");
for (const [fa, v] of orden) {
  l.push(`\n     ${fa}`);
  l.push(`        documentos  ${v.docs.size}   ·   ${[...v.corpus].map(([f, n]) => `${f} ${n}`).join(" · ")}`);
  l.push(`        clases      ${v.clases.size}   ${[...v.clases].sort().join(" · ")}`);
}

/* ── 4 · dirección A: los documentos NOMBRADOS, y CRUZADOS CON LAS RUTAS ───
 *
 * ⚠⚠ **UN DOCUMENTO DEL CORPUS NO ES UNA RUTA DEL CLON, Y CONFUNDIRLOS INFLA
 * EL HALLAZGO ×20.**
 *
 * El encargo de esta tanda decía *«20 son del arquetipo PRODUCTO, ya clonado y
 * dado por bueno»* — leído del DIRECTORIO `corpus/productos/`. Cruzado contra
 * `prerender-manifest`, de esos 20 el clon **emite UNO**
 * (`/monitor-calidad-aire`): los otros 19 son `/cartuchos-inteligentes/*` y
 * hermanas, **páginas que no están clonadas**. «Falta una tabla en un arquetipo
 * verificado» y «esa página no existe todavía» son cosas distintas y sólo la
 * primera reabre algo.
 */
const man = JSON.parse(readFileSync(join(RAIZ, "apps/web/.next/prerender-manifest.json"), "utf8"));
const RUTAS = new Set(Object.keys(man.routes));
function rutaDe(rel) {
  const h = readFileSync(join(CORPUS, rel), "utf8");
  const m = /<link[^>]*rel=["']?canonical["']?[^>]*href=["']([^"']+)["']/i.exec(h)
    || /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']?canonical/i.exec(h);
  if (!m) return null;
  try { return new URL(m[1]).pathname.replace(/^\/es/, "").replace(/\/$/, "") || "/"; } catch { return null; }
}

l.push("\n  ── A · LOS DOCUMENTOS, NOMBRADOS y CRUZADOS CON LAS RUTAS QUE EL CLON EMITE ──");
l.push(`     (universo de rutas: ${RUTAS.size} del prerender-manifest, unidad RUTA)`);
for (const [fa, v] of orden) {
  let si = 0, no = 0, sc = 0;
  const enRuta = [];
  for (const r of [...v.docs].sort()) {
    const ruta = rutaDe(r);
    if (!ruta) { sc++; continue; }
    if (RUTAS.has(ruta)) { si++; enRuta.push(`${ruta}   ← ${r}`); } else no++;
  }
  l.push(`\n     ${fa} · ${v.docs.size} documentos`);
  l.push(`        el clon EMITE la ruta: ${si}  ·  NO la emite: ${no}  ·  sin canonical: ${sc}`);
  if (enRuta.length) {
    l.push("        LAS QUE SÍ EMITE (las únicas que pueden ser defecto de un arquetipo construido):");
    for (const x of enRuta) l.push(`           ${x}`);
  } else l.push("        NINGUNA de sus rutas está emitida: no es un defecto, es contenido sin clonar.");
}

/* ── 5 · el límite del instrumento, arriba y no en un comentario ──────────── */
l.push("\n  ── ⚠ LO QUE ESTE CENSO **NO** CONTESTA ──");
l.push("     Contesta «¿ESCRIBE el clon esta clase de Divi?», NO «¿SIRVE el clon este CONTENIDO?».");
l.push("     Son dos preguntas, y la segunda se contesta mirando el dato:");
l.push("       · `dvmd_table_maker` en `/monitor-calidad-aire` → el clon **SÍ sirve la tabla**,");
l.push("         por su propio canal (`lib/monitor.ts` §ESPECIFICACIONES: «257 x 270 x 225 mm»,");
l.push("         «PMMA, policarbonato y acero inoxidable», «Litio 26Ah»). NO es un hueco.");
l.push("       · `blog` en 55 documentos → los 36 con ruta emitida son archivos `/etiqueta/…`,");
l.push("         que el clon sirve con `TarjetaListado`. La CLASE de Divi no está; el CONTENIDO sí.");
l.push("     Un «no emite» de este censo es una PREGUNTA para el dato, no un veredicto.");
l.push("");
l.push("  ── LOS CUATRO, CON SU VEREDICTO TRAS MIRAR EL DATO ──");
l.push("     familia              rutas emitidas   veredicto");
l.push("     blog                            36    ✅ NO es hueco — `TarjetaListado` sirve el contenido");
l.push("     dvmd_table_maker                 1    ✅ NO es hueco — `/monitor-calidad-aire` sirve la tabla por");
l.push("                                           `lib/monitor.ts` §ESPECIFICACIONES (verificado al literal)");
l.push("     gallery                          2    ⛔ **HUECO REAL**, y una es de ARQUETIPO F3-3:");
l.push("                                           `/soporte/…/que-es-kunak-air-cloud` sirve un `et_pb_gallery`");
l.push("                                           con rótulo «Galería» y **11 `et_pb_gallery_item`**, y");
l.push("                                           `KIND_DE_DIVI` **no tiene `gallery`**: el esquema no lo expresa.");
l.push("                                           La otra es `/monitor-calidad-aire`. SIN COMPROBAR si el clon");
l.push("                                           la sirve por otro canal.");
l.push("     cta                              1    ⚠ SIN COMPROBAR — `/monitor-calidad-aire`. `KIND_DE_DIVI` no");
l.push("                                           lo tiene; el clon puede servirlo con su propio componente");
l.push("");
l.push("     ⚠ **NO se arregla nada aquí.** `gallery` es una decisión de ESQUEMA (un bloque");
l.push("        nuevo) y reabrir un arquetipo verificado es del propietario, con el número");
l.push("        delante. Fichas en PENDIENTES-QA.md.");
const txt = l.join("\n") + "\n";
console.log(txt);
writeFileSync(join(AQUI, "tipos-sin-emitir.log"), txt);
