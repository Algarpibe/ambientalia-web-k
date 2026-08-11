/**
 * ¿LA RETÍCULA DEL CUERPO ES LA MISMA EN LAS TRES VARIANTES DE `L1`? — y qué
 * hay en la columna que sobra.
 * Uso: node scripts/qa/lh-barra.mjs        (npm run qa:lh-barra)
 *
 * ── De dónde sale la pregunta ─────────────────────────────────────────────
 * De `qa:lh-spec` (fase de specs de F3-2), midiendo la retícula por primera vez:
 * `/es/blog/` sirve su listado en una fila **`3_4 + 1_4`** con la columna de
 * contenido a **911.75**, y `/es/recursos/articulos/` en una fila **`4_4`** a
 * **1238.39**. Las dos son `L1`, y `DECISIONES.md` §D1 afirma que **lo único que
 * difiere entre familias de `L1` es la configuración del módulo de tarjetas**.
 *
 * Esa afirmación se apoya en `lh-censo`, que midió **el primer nivel de
 * secciones** — 6 secciones y 2 `_tb_body` en 23/23, sin excepción, y es
 * verdad—. Pero la barra lateral **no vive en ese nivel**: vive en una FILA
 * dentro de la 2.ª sección. Es §La causa común de `CLAUDE.md` en su forma
 * literal: **se midió al nivel que absorbe**, y el contenedor —el recuento de
 * secciones— tenía holgura de sobra para esconder una columna entera.
 *
 * ── Por qué sobre la CAPTURA y no en vivo ─────────────────────────────────
 * Porque la pregunta es de MARCADO SERVIDO y la población entera ya está
 * congelada: **149 documentos** de F3-0. Medir en vivo daría 13 páginas y una
 * cota; medir aquí da el censo completo sin tocar el original. Lo que sí exige
 * el vivo es el píxel, y ése lo pone `lh-spec` (911.75 / 1238.39 medidos).
 *
 * ── ⚠ AMPLIADA 2026-08-11 (F3-2, PASO 1c) · y arreglando un defecto PROPIO ──
 * La pregunta nueva es la **condición de reapertura de `D3`**: el widget
 * titulado «Categorías» *«consume la taxonomía `category`»*. Para contestarla
 * no basta con el **id** y el **título** del widget —que es lo único que la
 * versión anterior comparaba—: hace falta **su CONTENIDO**. Un contenido
 * variable entre instancias salía antes como «1 firma», que es exactamente §un
 * cero con forma de dato.
 *
 * ⚠⚠ **Y al ir a leerlo apareció un defecto de esta misma sonda, de la familia
 * que su propia cabecera criticaba.** La firma se tomaba sobre una **ventana
 * fija de 14 000 caracteres** desde el inicio de la barra. Medido: la barra de
 * `/blog` ocupa **1481** caracteres y el `<footer>` empieza en el 1481 de esa
 * ventana — o sea que **12 519 de los 14 000 son PIE**. De los «10 widgets» de
 * la firma congelada, **6 son del pie** (`text-10 · text-13 · text-16 · text-22
 * · text-19 · custom_html-29`, todos con clase `fwidget`). La barra tiene
 * **4**: `search-6 · text-1 · text-7 · custom_html-25`.
 *
 * Es §sondas 4 en su tercera cara —*un heurístico que encuentra MÁS de lo que
 * hay no da error: da un número plausible de más*— y es **el mismo error que
 * esta cabecera le reprochaba a `lh-serie`** (su firma `sb` mira
 * `et_pb_widget_area` en el documento entero, pie incluido), cometido un nivel
 * más abajo: allí el contenedor era el documento; aquí, una ventana que se pasa.
 *
 * **No mueve el veredicto de partición** —`barraEnElCuerpo` no dependía de la
 * ventana— pero sí **el recuento de la firma**, así que la congelada se
 * RE-EMITE con su razón y su fichero fechado, no se reinterpreta en silencio.
 * El delimitador ahora es el **balance de `<div>`**, que es dónde acaba la
 * barra de verdad.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · los tres patrones son DISCRIMINANTES, así que declaran **mínimo y
 *     máximo**: si uno casa en 0 documentos sale MUERTO y si casa en los 149
 *     sale UBICUO, los dos con código ≠ 0 (§sondas 4 y su complementario). Un
 *     patrón de barra lateral que casara en todo es exactamente lo que le pasó
 *     a `lh-serie` con su firma `sb`, que da `·sb` en las 149 porque mira
 *     `et_pb_widget_area` **en el documento entero** — y el pie también tiene
 *     widgets;
 * 2 · `Evaluadas`, mínimo derivado del recuento de ficheros de la captura;
 * 2bis · **un SEGUNDO `Evaluadas` para el widget**, con el mínimo derivado de
 *     los documentos que resultaron tener barra. No es circular en lo que
 *     importa: el numerador sólo sube cuando el **contenido** se ha leído, así
 *     que «hay barra pero no supe leer su widget» sale ROJO en vez de callado;
 * 3 · congela en `medidas/lh-barra.json`;
 * 4 · negativo: `SABOTAJE=patron-falso|patron-ubicuo|familia-vacia|`
 *     `categorias-variable|corte-fijo`. Los dos últimos son de esta ampliación:
 *     `categorias-variable` prueba que el comparador de contenido **sabe
 *     fallar** (§4bis: un negativo que no cambia el resultado no prueba nada), y
 *     `corte-fijo` reproduce el defecto de la ventana para que el arreglo tenga
 *     su medida ANTES/DESPUÉS y no sólo su diff (§protocolo de verificación,
 *     paso 2: *el marcador prueba frescura, no efecto*).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const SAB = process.env.SABOTAJE ?? "";
const RAIZ = join(QA, "../..");
const BASE = join(RAIZ, "corpus/fase-3/listados");

const ficheros = (d, acc = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) ficheros(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
};
const F = ficheros(BASE);
if (!F.length) throw new Error(`la captura de F3-0 no está en ${BASE}: sin población no hay censo`);

/** Marcado sin `<style>`/`<script>`: el CSS de Divi nombra sus propias clases y
 *  ya hizo pasar un selector por marcado una vez (`lh-censo`, defecto 1). */
const marcado = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");

/* ⚠ El `_tb_body` del sufijo es lo que separa el CUERPO del pie. Sin él, el
 * patrón casa también con los widgets del pie y sale ubicuo. */
const PATRONES = {
  barraEnElCuerpo: SAB === "patron-falso" ? /class="[^"]*\bno-existe-esta-barra\b/ : /class="[^"]*\bet_pb_sidebar_\d+_tb_body\b/,
  columna1_4: SAB === "patron-ubicuo" ? /</ : /class="[^"]*\bet_pb_column_1_4\b[^"]*\bet_pb_column_\d+_tb_body\b/,
  columna3_4: /class="[^"]*\bet_pb_column_3_4\b[^"]*\bet_pb_column_\d+_tb_body\b/,
};

/** La familia se deriva de la RUTA, que es la misma partición que usa el censo. */
const familiaDe = (r) =>
  /^\/etiqueta\//.test(r) ? "L1-etiqueta"
  : /^\/blog(\/|$)/.test(r) ? "L1-blog"
  : /^\/recursos\/articulos(\/|$)/.test(r) || /^\/recursos\/seminarios-web(\/|$)/.test(r) ? "L1-resources"
  : /^\/scientific-category\//.test(r) ? "L3-sci"
  : /^\/glosario(\/|$)/.test(r) ? "L2-glosario"
  : /^\/preguntas-frecuentes(\/|$)/.test(r) ? "L2-faqs"
  : /^\/casos-de-exito(\/|$)/.test(r) ? "L5-casos"
  : /^\/recursos(\/page)?(\/|$)/.test(r) ? "L4-hub"
  : "otra";

const rutaDe = (f) => "/" + relative(BASE, f).replace(/\\/g, "/").replace(/\/index\.html$/, "").replace(/^index\.html$/, "");

/**
 * Dónde ACABA un `<div>`: por balance, no por ventana.
 *
 * ⚠ Devuelve `null` si el marcado no cierra, y quien llama lo cuenta como
 * FALLO. Traducir «no supe delimitarlo» a «bloque vacío» es §sondas 6 — una
 * ausencia convertida en valor benigno **en el sitio donde todavía se sabía**.
 */
const bloqueDiv = (h, idxDelTag) => {
  const re = /<div\b|<\/div\s*>/gi;
  re.lastIndex = idxDelTag;
  let prof = 0;
  let m;
  while ((m = re.exec(h))) {
    if (m[0][1] === "/") {
      prof--;
      if (prof === 0) return h.slice(idxDelTag, m.index + m[0].length);
    } else prof++;
  }
  return null;
};

const norm = (s) => s.replace(/\s+/g, " ").trim();

const ev = new Evaluadas({ nombre: "lh-barra", unidad: "documentos", minimo: SAB === "familia-vacia" ? F.length + 1 : F.length });

const casos = Object.fromEntries(Object.keys(PATRONES).map((k) => [k, 0]));
const porFamilia = {};
const conBarra = [];
/* Los términos VIVOS de la taxonomía `category`, derivados de las clases que
 * `post_class()` escribe en cada `<article>`. Es el control cruzado que
 * convierte «no parece consumir la taxonomía» en una afirmación POSITIVA: si el
 * contenido ejerce términos que la lista no menciona, la lista no se regenera. */
const catsVivas = new Map();

/* ── PASADA 1 · la partición, que es lo que ya estaba medido ──────────────── */
for (const f of F) {
  const ruta = rutaDe(f);
  const m = marcado(readFileSync(f, "utf8"));
  const hit = Object.fromEntries(Object.entries(PATRONES).map(([k, re]) => [k, re.test(m)]));
  for (const k of Object.keys(PATRONES)) if (hit[k]) casos[k]++;

  /* `post_class()` emite `category-{slug}` SÓLO para la taxonomía `category`;
   * las taxonomías propias salen como `{taxonomia}-{slug}` (`resources-*`,
   * `tag-*`), así que el prefijo discrimina sin ambigüedad. */
  for (const a of m.matchAll(/<article[^>]*class="([^"]*)"/g))
    for (const c of a[1].matchAll(/\bcategory-([a-z0-9-]+)\b/g)) catsVivas.set(c[1], (catsVivas.get(c[1]) ?? 0) + 1);

  const fam = familiaDe(ruta);
  const acc = (porFamilia[fam] ??= { n: 0, conBarra: 0, con3_4: 0, rutasSinBarra: [] });
  acc.n++;
  if (hit.barraEnElCuerpo) {
    acc.conBarra++;
    conBarra.push({ f, ruta, fam });
  } else acc.rutasSinBarra.push(ruta);
  if (hit.columna3_4) acc.con3_4++;
  ev.ok();
}

/* ── PASADA 2 · la COMPOSICIÓN de la barra y el CONTENIDO de «Categorías» ───
 * Se recorre sólo lo que tiene barra, y el mínimo del contrato sale de ahí.
 * Si nadie tuviera barra, el patrón ya habría salido MUERTO abajo; aun así se
 * dice en voz alta en vez de construir un `Evaluadas` con mínimo 0, que la
 * librería rechaza por esta misma razón. */
if (!conBarra.length && SAB !== "patron-falso")
  throw new Error("ningún documento con barra lateral: no hay población sobre la que preguntar por el widget «Categorías»");

const evW = conBarra.length
  ? new Evaluadas({ nombre: "lh-barra · widget «Categorías»", unidad: "documentos con barra", minimo: conBarra.length })
  : null;

const TITULO_BUSCADO = "Categorías";
const firmas = {};
const contenidos = {};
const widgetCat = { encontrado: 0, tipos: {}, sinWidget: [] };
const fugas = [];
let iSab = 0;

for (const { f, ruta } of conBarra) {
  const m = marcado(readFileSync(f, "utf8"));
  const iClase = m.search(PATRONES.barraEnElCuerpo);
  const iDiv = m.lastIndexOf("<div", iClase);

  /* El defecto que esta ampliación arregla, reproducible a demanda para que el
   * arreglo tenga su ANTES y su DESPUÉS medidos. */
  const barra = SAB === "corte-fijo" ? m.slice(iDiv, iDiv + 14000) : bloqueDiv(m, iDiv);
  if (barra == null) {
    evW.fallo(ruta, "el <div> de la barra no cierra: no se pudo delimitar");
    continue;
  }

  /* Los widgets, ahora acotados a la barra de verdad. */
  const abre = [...barra.matchAll(/<div[^>]*id="([^"]+)"[^>]*class="([^"]*\bwidget[^"]*)"/g)];
  const widgets = abre.map((x) => x[1]);
  /* ⚠ GUARDA DEL DELIMITADOR, y es la que convierte el defecto de la ventana en
   * algo que esta sonda ya no puede volver a cometer. `fwidget` es la clase que
   * el tema pone a los widgets del PIE: derivado sobre esta misma población,
   * aparece **0 veces dentro de la barra y 480 fuera** (6 × 80). Así que un
   * `fwidget` entre los widgets de la barra sólo puede significar que el
   * delimitador se pasó — que es exactamente lo que hacía. */
  for (const a of abre) if (/\bfwidget\b/.test(a[2])) fugas.push(`${ruta} · ${a[1]}`);
  const titulos = [...barra.matchAll(/<h[1-6][^>]*class="[^"]*widgettitle[^"]*"[^>]*>([\s\S]*?)<\/h[1-6]>/g)].map((x) => x[1].replace(/<[^>]+>/g, "").trim());
  (firmas[JSON.stringify({ widgets, titulos })] ??= []).push(ruta);

  /* ── El widget cuyo TÍTULO es «Categorías» ──────────────────────────────
   * Se localiza por título porque es lo que la condición de D3 nombra, y se
   * lee su bloque entero por balance: el contenido es la pregunta. */
  let cat = null;
  for (const a of abre) {
    const bloque = bloqueDiv(barra, a.index);
    if (bloque == null) continue;
    const t = bloque.match(/<h[1-6][^>]*class="[^"]*widgettitle[^"]*"[^>]*>([\s\S]*?)<\/h[1-6]>/);
    if (!t || t[1].replace(/<[^>]+>/g, "").trim() !== TITULO_BUSCADO) continue;
    cat = { id: a[1], clases: a[2], bloque };
    break;
  }

  if (!cat) {
    widgetCat.sinWidget.push(ruta);
    evW.fallo(ruta, `no se encontró widget con título «${TITULO_BUSCADO}»`);
    continue;
  }

  let cuerpo = norm(cat.bloque.replace(/<h[1-6][^>]*class="[^"]*widgettitle[^"]*"[^>]*>[\s\S]*?<\/h[1-6]>/, ""));
  /* Sabotaje del COMPARADOR: si el contenido variase entre instancias, ¿lo
   * vería? Se altera UNA instancia, que es la magnitud del fenómeno que se
   * quiere poder detectar. */
  if (SAB === "categorias-variable" && iSab++ === 0) cuerpo += "<li>SABOTAJE-contenido-variable</li>";

  const hrefs = [...cuerpo.matchAll(/href="([^"]*)"/g)].map((x) => x[1]);
  const clave = JSON.stringify({ clases: cat.clases, cuerpo });
  (contenidos[clave] ??= { id: cat.id, clases: cat.clases, cuerpo, hrefs, rutas: [] }).rutas.push(ruta);
  widgetCat.tipos[cat.clases] = (widgetCat.tipos[cat.clases] ?? 0) + 1;
  widgetCat.encontrado++;
  evW.ok();
}

/* ── Las guardas ─────────────────────────────────────────────────────────── */
let rotos = 0;
if (fugas.length) {
  console.error(
    `❌ EL DELIMITADOR DE LA BARRA SE PASÓ: ${fugas.length} widget(s) con clase \`fwidget\` (= del PIE) contados como de la barra.\n` +
      `   Derivado sobre esta población: \`fwidget\` sale 0 veces dentro de la barra y 480 en el pie.\n` +
      `   Ej.: ${fugas.slice(0, 3).join(" · ")}`,
  );
  rotos++;
}
for (const [k, n] of Object.entries(casos)) {
  if (n === 0) { console.error(`❌ patrón MUERTO: \`${k}\` no casa en NINGUNO de los ${F.length} documentos. Un cero de selector no es un cero de dato.`); rotos++; }
  else if (n === F.length) { console.error(`❌ patrón UBICUO: \`${k}\` casa en los ${F.length}. Si su trabajo es discriminar, casar en todos no mide nada.`); rotos++; }
}

const listaContenidos = Object.values(contenidos).sort((a, b) => b.rutas.length - a.rutas.length);

/* ── El cruce: ¿la lista del widget cubre los términos que el contenido ejerce?
 * Los slugs que el widget menciona salen de sus propios href, no de una lista
 * escrita aquí (§sondas 9: se deriva, no se recuerda). */
const slugsWidget = new Set(
  (listaContenidos[0]?.hrefs ?? []).map((h) => (h.match(/\/categoria\/([^/?#]+)/) ?? [])[1]).filter(Boolean),
);
const vivas = [...catsVivas].sort((a, b) => b[1] - a[1]);
const noListadas = vivas.filter(([s]) => !slugsWidget.has(s));
/* La pregunta de D3, contestada por el marcado y no por el nombre del widget:
 * un widget NATIVO de categorías es `widget_categories`; un `widget_text` es
 * una lista escrita a mano, y por tanto NO consume la taxonomía en runtime. */
const nativo = Object.keys(widgetCat.tipos).filter((c) => /\bwidget_categories\b/.test(c));

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿la retícula del CUERPO es la misma en las tres variantes de L1, y qué hay en la columna que sobra? — y ¿el widget «Categorías» CONSUME la taxonomía o es una lista escrita? (D3, condición de reapertura)",
    fuente: "corpus/fase-3/listados — captura congelada de F3-0, población COMPLETA (sin red, sin muestreo)",
    porQue: "lh-spec midió por primera vez la retícula y dio 3_4+1_4 en blog contra 4_4 en resources. DECISIONES.md §D1 dice que entre familias de L1 sólo difiere la configuración de tarjeta.",
    sabotaje: SAB || null,
    corrige:
      "la firma de widgets se tomaba sobre una ventana FIJA de 14000 caracteres desde el inicio de la barra, y la barra mide 1481: 6 de los 10 ids de la firma congelada del 2026-08-11 eran del PIE (clase `fwidget`). Ahora la barra se delimita por balance de <div>.",
    noMide: [
      "el píxel: los anchos 911.75 / 1238.39 los pone lh-spec contra el original vivo",
      "el comportamiento del buscador de la barra: no se abrió navegador aquí",
      "las instancias de L1 que la captura no trae",
      "la taxonomía viva EN EL ORIGINAL DE HOY: los términos se derivan de las clases de los <article> de la captura, así que el cruce vale para lo capturado, no para el sitio de hoy",
      "⚠ el LÍMITE del marcado servido: no distingue «lista escrita a mano» de «un shortcode dentro del widget de texto que expande la taxonomía». Lo que sí decide es que NO es `widget_categories` —el widget nativo— y que su salida no varía; el cruce con los términos vivos es lo que inclina la lectura, no el tipo de widget a solas",
    ],
  },
  documentos: F.length,
  patrones: casos,
  porFamilia,
  barraLateral: {
    documentosConBarra: Object.values(porFamilia).reduce((s, v) => s + v.conBarra, 0),
    firmasDistintas: Object.keys(firmas).length,
    firmas: Object.entries(firmas).map(([k, v]) => ({ ...JSON.parse(k), enDocumentos: v.length, ejemplo: v[0] })),
  },
  widgetCategorias: {
    buscadoPorTitulo: TITULO_BUSCADO,
    documentosConBarra: conBarra.length,
    encontrado: widgetCat.encontrado,
    sinWidget: widgetCat.sinWidget,
    tiposDeWidget: widgetCat.tipos,
    esWidgetNativoDeTaxonomia: nativo.length > 0,
    contenidosDistintos: listaContenidos.length,
    contenidos: listaContenidos.map((c) => ({ id: c.id, clases: c.clases, enDocumentos: c.rutas.length, ejemplo: c.rutas[0], hrefs: c.hrefs, cuerpo: c.cuerpo })),
    cruceConLaTaxonomiaViva: {
      comoSeDerivan: "clases `category-{slug}` de cada <article> de los 149 documentos — post_class() sólo las emite para la taxonomía `category`",
      terminosVivos: Object.fromEntries(vivas),
      slugsQueElWidgetLista: [...slugsWidget],
      terminosVivosNoListados: noListadas.map(([s, n]) => ({ slug: s, articulos: n })),
      lectura:
        noListadas.length > 0
          ? `la lista NO cubre ${noListadas.length} de los ${vivas.length} términos que el contenido ejerce ⇒ está DESINCRONIZADA de la taxonomía: evidencia POSITIVA de que no se regenera`
          : "la lista cubre todos los términos vivos: compatible con que se regenere y con que esté escrita — el cruce NO discrimina en esta población",
    },
  },
};

console.log(`\n═══ RETÍCULA DEL CUERPO — ${F.length} documentos de la captura`);
console.log(`  familia`.padEnd(24) + `n`.padStart(5) + `  con barra lateral`.padEnd(22) + `con columna 3_4`);
for (const [k, v] of Object.entries(porFamilia).sort())
  console.log(`  ${k.padEnd(22)}${String(v.n).padStart(5)}${String(v.conBarra).padStart(16)}${String(v.con3_4).padStart(22)}`);
console.log(`\n  barra lateral: ${salida.barraLateral.documentosConBarra} documentos · ${salida.barraLateral.firmasDistintas} firma(s) distinta(s)`);
for (const f of salida.barraLateral.firmas)
  console.log(`    ${f.enDocumentos} docs · ${f.widgets.length} widgets · ${f.widgets.join(" · ")}`);

console.log(`\n═══ WIDGET «${TITULO_BUSCADO}» — la condición de reapertura de D3`);
console.log(`  encontrado en ${widgetCat.encontrado}/${conBarra.length} documentos con barra${widgetCat.sinWidget.length ? ` · SIN widget: ${widgetCat.sinWidget.length}` : ""}`);
console.log(`  tipo de widget: ${Object.entries(widgetCat.tipos).map(([c, n]) => `${c} ×${n}`).join(" | ") || "—"}`);
console.log(`  ¿es el widget NATIVO de taxonomía (widget_categories)?: ${nativo.length ? "SÍ" : "NO — es contenido escrito"}`);
console.log(`  contenidos DISTINTOS entre instancias: ${listaContenidos.length}`);
for (const c of listaContenidos.slice(0, 4)) console.log(`    ×${String(c.rutas.length).padStart(3)}  ${c.hrefs.join(" , ") || "(sin enlaces)"}   ej. ${c.rutas[0]}`);
console.log(`  términos VIVOS de \`category\` en los <article>: ${vivas.length} → ${vivas.map(([s, n]) => `${s}(${n})`).join(" · ")}`);
console.log(`  el widget lista: ${[...slugsWidget].join(" · ") || "—"}`);
console.log(`  ⇒ términos vivos que la lista NO menciona: ${noListadas.length}${noListadas.length ? " → " + noListadas.map(([s]) => s).join(" · ") : ""}`);

/* La partición se declara: dentro de cada familia tiene que ser 0 o n, nunca
 * intermedia — si lo fuera, «variante» sería la palabra equivocada. */
const mixtas = Object.entries(porFamilia).filter(([, v]) => v.conBarra !== 0 && v.conBarra !== v.n);
console.log(`\n  familias con reparto MIXTO (ni 0 ni n): ${mixtas.length}${mixtas.length ? " → " + mixtas.map(([k]) => k).join(" · ") : "  ← la partición es por familia, no por instancia"}`);
console.log(`✓ evaluadas ${F.length}/${F.length} documentos · retícula del cuerpo`);
console.log(`✓ evaluadas ${widgetCat.encontrado}/${conBarra.length} documentos con barra · contenido del widget «${TITULO_BUSCADO}»`);

salida.veredicto = {
  particionPorFamilia: mixtas.length === 0,
  familiasConBarra: Object.entries(porFamilia).filter(([, v]) => v.conBarra === v.n && v.n > 0).map(([k]) => k),
  familiasSinBarra: Object.entries(porFamilia).filter(([, v]) => v.conBarra === 0).map(([k]) => k),
  lectura:
    mixtas.length === 0
      ? "régimen plantillado: varianza 0 DENTRO de cada familia y distinta ENTRE familias ⇒ distingue PLANTILLAS (variantes), no campos — la misma lectura que la configuración de tarjeta"
      : "⚠ reparto mixto dentro de una familia: «variante» no es la palabra correcta, hay que mirarlo",
  D3:
    listaContenidos.length === 0
      ? "SIN POBLACIÓN: no se encontró el widget en ningún documento — no se puede contestar"
      : nativo.length > 0
        ? "el widget es NATIVO de taxonomía ⇒ consume `category` en runtime: la condición de reapertura de D3 SE CUMPLE"
        : listaContenidos.length > 1
          ? `el widget es contenido escrito, PERO su contenido VARÍA entre instancias (${listaContenidos.length} contenidos distintos) ⇒ es un campo, no plantilla: D3 se reabre por la otra puerta`
          : `el widget NO es nativo de taxonomía (\`widget_text\` ×${widgetCat.encontrado}), su contenido tiene varianza CERO en la población entera` +
            (noListadas.length
              ? ` y NO cubre ${noListadas.length} de los ${vivas.length} términos que el contenido ejerce`
              : "") +
            " ⇒ es contenido CABLEADO de la plantilla: la condición de reapertura de D3 se comprobó y NO se cumple",
};

/* ── La condición de D3, en la dirección que GRITA ────────────────────────
 * Si el widget resulta consumir la taxonomía —por ser el nativo o por variar
 * entre instancias— eso es el ESCALÓN, y un escalón no puede vivir como un
 * campo dentro de un JSON que nadie abre: cierra el código de salida. La
 * asimetría es deliberada (§sondas 6): el falso positivo cuesta una lectura, y
 * el falso negativo cuesta construir sobre una decisión retirada. */
if (salida.veredicto.D3.startsWith("el widget es NATIVO") || salida.veredicto.D3.includes("VARÍA entre instancias")) {
  console.error(`\n⛔ ESCALÓN — la condición de reapertura de D3 SE CUMPLE:\n   ${salida.veredicto.D3}`);
  rotos++;
}

w("medidas/lh-barra.json", salida);
process.exit(rotos || salida.veredicto.particionPorFamilia === false ? 2 : 0);
