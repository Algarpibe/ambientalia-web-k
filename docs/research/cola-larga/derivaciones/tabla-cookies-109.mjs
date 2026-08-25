/* ¿CABE `/politica-de-cookies` EN `MODULO_TABLA`? — 109.ª, ESCALÓN 3, 2026-08-25.
 *
 * La ficha decía *«hueco: `dvmd_table_maker` sin bloque en ninguna colección»*.
 * Cierto de `paginas` — y `packages/cms-config/src/bloques/monografico.ts` YA
 * exporta `MODULO_TABLA` (`slug: "tabla"`), tabla **genérica**. Así que la
 * pregunta abierta no es *«¿hay que inventar un tipo?»* sino:
 *
 *     ¿lo que `/politica-de-cookies` SIRVE cabe en `MODULO_TABLA`, y qué queda
 *     fuera?
 *
 * ⚠ Y SE CONTESTA RECORRIENDO **EL DOCUMENTO**, NO LOS CAMPOS. §*la prueba de
 * que un modelo expresa un corpus no es «¿cabe lo que hay?» sino «¿queda
 * contenido SIN SITIO?»*: la primera recorre los campos y **no puede ver lo que
 * el modelo no sabe leer**; la segunda recorre el documento.
 *
 * ⚠ **NO es una sonda** y **NO decide el modelo**: no se escribe ningún bloque
 * ni se toca `bloques/paginas.ts`. La salida es el reparto con su cardinal, para
 * que la decisión llegue con sus números.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const HTML = join(RAIZ, "corpus/fase-3/sueltas/politica-de-cookies/index.html");
if (!existsSync(HTML)) throw new Error(`falta el HTML capturado: ${HTML}`);
const doc = readFileSync(HTML, "utf8");

const L = [];
const P = (s = "") => { L.push(s); console.log(s); };

/* ── 0 · el marcado, SIN `<style>` ni `<script>` ──────────────────────────────
 * §sondas 4, tercera cara: el CSS de Divi nombra sus propias clases, así que
 * buscar sobre el HTML entero cuenta selectores como si fueran marcado. Aquí
 * la diferencia es enorme y en la dirección que engaña: 158 apariciones en el
 * documento entero contra las que quedan tras quitar CSS y JS. */
const marcado = doc.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
const enTodo = (doc.match(/dvmd_table_maker/g) || []).length;
const enMarcado = (marcado.match(/dvmd_table_maker/g) || []).length;

P("══════════════════════════════════════════════════════════════════════");
P("  ¿CABE `/politica-de-cookies` EN `MODULO_TABLA`? — 109.ª · ESCALÓN 3");
P("══════════════════════════════════════════════════════════════════════");
P(`  fuente: corpus/fase-3/sueltas/politica-de-cookies/index.html (${doc.length} chars)`);
P("");
P("── 0 · EL CANAL, separado del CSS (§sondas 4, el sobre-casado) ─────────");
P(`   «dvmd_table_maker» en el documento entero .... ${enTodo}`);
P(`   … y en el MARCADO (sin <style> ni <script>) .. ${enMarcado}`);
P("");
P("   ⚠ Y EL PRIMER HALLAZGO ES QUE **NO ES UNA TABLA HTML**:");
for (const t of ["table", "thead", "tbody", "tr", "th", "td"]) {
  P(`       <${t}> en el marcado: ${(marcado.match(new RegExp("<" + t + "[ >]", "g")) || []).length}`);
}
P("   Es una REJILLA DE `<div>` con la posición codificada en las clases");
P("   (`dvmd_tm_row_N` · `dvmd_tm_col_N`). Cualquier extractor que buscara");
P("   `<table>` daría CERO y lo leería como «no hay tabla».");
P("");

/* ── 1 · las CELDAS ───────────────────────────────────────────────────────── */
const celdas = [];
const reCelda = /<div[^>]*class="([^"]*dvmd_tm_tcell[^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*dvmd_tm_tcell|<\/div>)/g;
/* El corte de arriba es frágil con divs anidados. Se usa un recorrido explícito
 * de llaves angulares en su lugar: se localiza cada apertura de celda y se
 * equilibran `<div>`/`</div>` hasta cerrarla. Es más largo y no se equivoca. */
const abre = /<div[^>]*class="([^"]*dvmd_tm_tcell[^"]*)"[^>]*>/g;
let m;
while ((m = abre.exec(marcado))) {
  const clases = m[1];
  let i = abre.lastIndex;
  let prof = 1;
  const reTag = /<(\/?)div\b[^>]*>/g;
  reTag.lastIndex = i;
  let t;
  while (prof > 0 && (t = reTag.exec(marcado))) {
    prof += t[1] ? -1 : 1;
    i = reTag.lastIndex;
  }
  const html = marcado.slice(abre.lastIndex, i - "</div>".length);
  const fila = +(/dvmd_tm_row_(\d+)/.exec(clases)?.[1] ?? -1);
  const col = +(/dvmd_tm_col_(\d+)/.exec(clases)?.[1] ?? -1);
  const item = +(/dvmd_table_maker_item_(\d+)/.exec(clases)?.[1] ?? -1);
  /* el DATO vive en un `.dvmd_tm_cdata` de dentro, no en el `tcell` */
  const texto = (/<div[^>]*class="[^"]*dvmd_tm_cdata[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(html)?.[1] ?? html)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&oacute;/g,"ó").replace(/&aacute;/g,"á").replace(/&iacute;/g,"í").replace(/&eacute;/g,"é").replace(/&uacute;/g,"ú").replace(/&ntilde;/g,"ñ").replace(/&amp;/g,"&").replace(/&nbsp;/g," ");
  celdas.push({ item, fila, col, esCabecera: /dvmd_tm_rhead/.test(clases), clases, html, texto });
}

/* ⚠⚠ TRES DEFECTOS DE ESTA DERIVACIÓN, CAZADOS POR INVEROSÍMILES Y NO POR ERROR
 * — la v1 publicó «5 módulos de tabla, cada uno de 11 filas × 1 COLUMNA». Cinco
 * tablas de una columna en una política de cookies es la forma que hay que
 * mirar dos veces, y detrás había esto:
 *
 *   1. `dvmd_table_maker_item_N` NO es el ordinal de la TABLA: es el de la
 *      COLUMNA. Derivado: `item=N` casa 1:1 con `col=N`, 11 celdas cada uno.
 *      Leerlo como tabla partía UNA tabla de 5 columnas en cinco de una;
 *   2. la tabla de verdad es UNA, y su envoltorio lo dice:
 *      `class="et_pb_module dvmd_table_maker dvmd_table_maker_0 …"` — se cuenta
 *      ése, no los `item_`;
 *   3. el TEXTO no está en el `tcell`: está en un `.dvmd_tm_cdata` de dentro.
 *      Por eso el censo de etiquetas daba «div×55 y nada más» y las celdas
 *      salían vacías de contenido — se estaba mirando el envoltorio.
 *
 * Los tres empujaban en la misma dirección: hacia una forma más simple de la
 * real. §*un 100 % redondo casi nunca es un dato del original*. */
const contenedores = (marcado.match(/class="[^"]*\bdvmd_table_maker\b(?![_-])[^"]*"/g) || []).length;
const filasN = new Set(celdas.map((c) => c.fila));
const colsN = new Set(celdas.map((c) => c.col));
const itemEsCol = celdas.every((c) => c.item === c.col);

P("── 1 · LA FORMA, derivada del marcado ─────────────────────────────────");
P(`   CONTENEDORES \`dvmd_table_maker\` (la tabla) : ${contenedores}`);
P(`   celdas \`dvmd_tm_tcell\`                     : ${celdas.length}`);
P(`   filas × columnas                           : ${filasN.size} × ${colsN.size}  = ${filasN.size * colsN.size}`);
P(`   ¿\`item_N\` es la COLUMNA y no la tabla?      : ${itemEsCol ? "SÍ, 1:1 en las " + celdas.length : "NO — revisar"}`);
P("");
P("   ⚠ Es UNA tabla de 11 × 5, no cinco de 11 × 1. La v1 de esta derivación");
P("     leyó `item_N` como el ordinal del módulo y publicó «5 módulos». Lo");
P("     delató la forma, no un error: cinco tablas de una columna en una");
P("     política de cookies no es una cosa que exista.");
P("");

/* ── 2 · LOS PAPELES DE CELDA ──────────────────────────────────────────────
 * ⚠ Y AQUÍ CAYÓ EL CUARTO DEFECTO, por el mismo camino que los tres de arriba:
 * la v2 clasificaba `rhead` contra «el resto» y publicó que la fila 0 era
 * «mixta». No era mixta: hay un TERCER papel que el binario no podía ver —
 * `dvmd_tm_rfoot`, la última columna, 11 celdas. Es §*un selector que casa en
 * unas formas y en otras no*: preguntar «¿es rhead?» nunca puede devolver el
 * tercer valor de un enum de tres. */
const papelDe = (c) => (/dvmd_tm_rhead/.test(c.clases) ? "rhead" : /dvmd_tm_rfoot/.test(c.clases) ? "rfoot" : /dvmd_tm_tdata/.test(c.clases) ? "tdata" : "SIN PAPEL");
const porPapel = {};
for (const c of celdas) porPapel[papelDe(c)] = (porPapel[papelDe(c)] ?? 0) + 1;
P("── 2 · LOS PAPELES DE CELDA, censados (no dos: TRES) ──────────────────");
P(`   ${Object.entries(porPapel).map(([k, v]) => `${k}: ${v}`).join("  ·  ")}   (suma ${Object.values(porPapel).reduce((a, b) => a + b, 0)} de ${celdas.length})`);
const colDe = (papel) => [...new Set(celdas.filter((c) => papelDe(c) === papel).map((c) => c.col))].sort((a, b) => a - b);
for (const p of ["rhead", "tdata", "rfoot"]) if (porPapel[p]) P(`     ${p.padEnd(6)} → columna(s) ${colDe(p).join(", ")}`);
P("");
P("   ⇒ la tabla tiene una columna de CABECERA (0) y una de PIE (4), y el");
P("     modelo no tiene dónde poner ninguna de las dos.");
P("");

P("── 2b · ⚠ EL PRIMER CONTENIDO SIN SITIO: LA CABECERA ES UNA **COLUMNA** ");
const cabs = celdas.filter((c) => c.esCabecera);
const cabsPorCol = {};
const cabsPorFila = {};
for (const c of cabs) {
  cabsPorCol[c.col] = (cabsPorCol[c.col] ?? 0) + 1;
  cabsPorFila[c.fila] = (cabsPorFila[c.fila] ?? 0) + 1;
}
P(`   celdas marcadas \`dvmd_tm_rhead\`: ${cabs.length}`);
P(`   repartidas por COLUMNA : ${Object.entries(cabsPorCol).map(([k, v]) => `col_${k}:${v}`).join(" · ")}`);
P(`   repartidas por FILA    : ${Object.entries(cabsPorFila).map(([k, v]) => `fila_${k}:${v}`).join(" · ")}`);
const soloUnaCol = Object.keys(cabsPorCol).length === 1;
P("");
P(`   ⇒ ${soloUnaCol ? "TODAS las celdas `rhead` caen en UNA SOLA COLUMNA (la 0)" : "las cabeceras se reparten en varias columnas"}.`);
P("");
/* ⚠ Y hay que mirar la FILA 0 aparte, porque el marcado NO la marca y el
 * contenido dice que es una cabecera. Es §*verificar contra la salida servida*:
 * la clase no lo dice, el texto sí. */
const fila0 = celdas.filter((c) => c.fila === 0).sort((a, b) => a.col - b.col);
P("   ⚠ Y LA FILA 0, que el marcado NO marca como cabecera, LO ES por su texto:");
P(`       ${fila0.map((c) => `[${c.col}] ${JSON.stringify(c.texto)}`).join("  ")}`);
P(`       papel de cada una  : ${fila0.map((c) => `[${c.col}] ${papelDe(c)}`).join("  ")}`);
P("");
P("   ⇒ HAY DOS CABECERAS Y SÓLO UNA ESTÁ MARCADA:");
P("       · la COLUMNA 0 — marcada `dvmd_tm_rhead` en las 11 filas;");
P("       · la FILA 0    — cabecera por su CONTENIDO, sin clase que lo diga.");
P("     `MODULO_TABLA` declara `cabeceras: array[{texto}]`, una lista PLANA:");
P("     expresa UNA de las dos —la de columna— y la otra NO TIENE SITIO.");
P("");

/* ── 3 · qué hay DENTRO de cada celda ─────────────────────────────────────── */
P("── 3 · QUÉ HAY DENTRO — y el modelo sólo tiene {texto, fuerte, resto} ──");
const etiquetas = new Map();
const conEnlace = [];
const conLista = [];
const conVarios = [];
for (const c of celdas) {
  const tags = [...c.html.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((x) => x[1].toLowerCase());
  for (const t of tags) etiquetas.set(t, (etiquetas.get(t) ?? 0) + 1);
  if (tags.includes("a")) conEnlace.push(c);
  if (tags.includes("ul") || tags.includes("ol") || tags.includes("li")) conLista.push(c);
  const p = tags.filter((t) => t === "p").length;
  if (p > 1) conVarios.push(c);
}
P(`   etiquetas HTML distintas dentro de las celdas: ${etiquetas.size}`);
P(`     ${[...etiquetas].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}×${n}`).join(" · ")}`);
P("");
P(`   celdas con ENLACE  (<a>)          : ${conEnlace.length}`);
P(`   celdas con LISTA   (<ul>/<ol>)    : ${conLista.length}`);
P(`   celdas con VARIOS PÁRRAFOS (<p>×n): ${conVarios.length}`);
P("");

/* ── 4 · EL RECUENTO DE LO QUE NO CABE ────────────────────────────────────── */
P("══════════════════════════════════════════════════════════════════════");
P("  LO QUE QUEDA SIN SITIO, con su cardinal");
P("══════════════════════════════════════════════════════════════════════");
const sinSitio = [];
if (soloUnaCol && cabs.length)
  sinSitio.push([`cabecera de FILA (columna ${Object.keys(cabsPorCol)[0]})`, cabs.length, "`cabeceras` es una lista PLANA: expresa cabeceras de columna, no de fila"]);
if (porPapel.rfoot) sinSitio.push([`columna de PIE (rfoot, columna ${colDe("rfoot").join(", ")})`, porPapel.rfoot, "`MODULO_TABLA` no tiene `pies` ni papel por columna: sólo `cabeceras` planas y celdas indiferenciadas"]);
if (fila0.length) sinSitio.push(["fila 0 como CABECERA DE COLUMNA (sin clase que lo diga)", fila0.length, "el marcado no la marca; su CONTENIDO sí. `cabeceras` podría expresarla, pero entonces se pierde el papel de columna"]);
if (conEnlace.length) sinSitio.push(["enlaces dentro de celda", conEnlace.length, "`CELDA` es {texto,fuerte,resto}: tres `text`. Un `href` no tiene campo"]);
if (conLista.length) sinSitio.push(["listas dentro de celda", conLista.length, "idem: no hay campo de estructura dentro de la celda"]);
if (conVarios.length) sinSitio.push(["varios párrafos en una celda", conVarios.length, "tres `text` planos no expresan n párrafos"]);
if (contenedores > 1) sinSitio.push(["más de un módulo de tabla en la página", contenedores, "esto SÍ cabe: son n bloques `tabla` en el array"]);

if (!sinSitio.length) P("   (ninguno — todo el contenido del módulo cabe en `MODULO_TABLA`)");
for (const [que, n, porque] of sinSitio) {
  P(`   ⛔ ${que}`);
  P(`        cardinal: ${n}`);
  P(`        por qué : ${porque}`);
}
P("");
P(`   ⇒ CELDAS con un papel que el modelo NO expresa: ${(porPapel.rhead ?? 0) + (porPapel.rfoot ?? 0)} de ${celdas.length} (${((((porPapel.rhead ?? 0) + (porPapel.rfoot ?? 0)) / celdas.length) * 100).toFixed(1)} %)`);
P("");
P("── LO QUE SÍ CABE ─────────────────────────────────────────────────────");
P(`   celdas totales ....................... ${celdas.length}  (${filasN.size} × ${colsN.size})`);
P(`   celdas de contenido plano (sin <a>, sin lista, sin <p> múltiple)`);
const planas = celdas.filter((c) => !conEnlace.includes(c) && !conLista.includes(c) && !conVarios.includes(c));
P(`     .................................... ${planas.length}  (${((planas.length / celdas.length) * 100).toFixed(1)} %)`);
P("   Ésas caben en {texto, fuerte, resto} sin perder nada.");
P("");

P("══════════════════════════════════════════════════════════════════════");
P("  LO QUE ESTA DERIVACIÓN **NO** CONTESTA");
P("══════════════════════════════════════════════════════════════════════");
P("   · NO decide si se adopta `MODULO_TABLA` para `paginas`, ni con qué");
P("     cambios. Eso es del propietario, y ahora llega con su reparto;");
P("   · NO mide geometría. El Δ de esta página está medido aparte y va con");
P("     sus DOS lados y su ancho: `/politica-de-cookies`, orig 9 módulos →");
P("     clon 8, **Δ docH −1512.00 a 1440**;");
P("   · NO dice nada de las otras instancias de `dvmd_table_maker`. Las dos");
P("     unidades, siempre: **21 DOCUMENTOS** lo mencionan · **2 RUTAS**");
P("     emitidas. Esta derivación mira UNA ruta;");
P("   · y NO mira `/monitor-calidad-aire`, la otra emitida: es de arquetipo");
P("     ESCRITO A MANO, así que lo que allí se sirva **no es un veredicto");
P("     sobre el CMS** — el propio censo ya avisa de que es un FALSO NO sobre");
P("     lo que sirve la DB.");

writeFileSync(join(AQUI, "tabla-cookies-109.log"), L.join("\n") + "\n", "utf8");
void reCelda;
