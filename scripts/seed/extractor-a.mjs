/**
 * EXTRACTOR DEL GRUPO A — del corpus congelado al CATÁLOGO completo.
 * Uso: npm run cms:extractor-a
 * Negativos: SABOTAJE=selector-muerto | control-roto | cuerpo-ausente
 *
 * ── Qué es esto, y por qué hace falta ─────────────────────────────────────
 * `D2.7` decide sembrar el corpus completo. La maquinaria de F2 ya sabe sacar
 * **el cuerpo** (`cms:extractor` → `corpus/transformado/`, T1–T8 + saneador),
 * pero **nadie sacaba los METADATOS**: el seed lee `src/lib/arquetipo-a.ts`, que
 * es una **transcripción de MUESTRA** —7 entradas de 149— hecha a mano cuando
 * el arquetipo se midió.
 *
 * Este extractor produce el catálogo entero desde la captura, con la misma
 * forma que el tipo medido (`EntradaBlog` · `TerminoKunakpedia` ·
 * `DocumentoCientifico`), y lo congela en `medidas/a-extraido.json`.
 *
 * ── Por qué el dato pasa a nacer aquí y no en `src/lib` ───────────────────
 * Es el precedente de **F3-1**: `articulos-kb` **nace en el CMS**, sembrado
 * desde `medidas/kb-extraido.json`. Lo mismo aquí, con una diferencia que hay
 * que decir en voz alta: `src/lib/arquetipo-a.ts` **no se borra ni se
 * contradice** — se queda como (a) la definición de los TIPOS y (b) **el
 * CONTROL**. Que el extractor reproduzca los 7 transcritos a mano es lo que
 * autoriza a sustituir la fuente para los otros 142.
 *
 * ── Las guardas que cierran el código de salida ───────────────────────────
 * 1 · **CONTROL** — los 7 de `ENTRADAS_BLOG` (y los 3 términos, y los 4
 *     documentos) tienen que reproducirse campo a campo. Una discrepancia es
 *     roja: sin esto, «149 extraídos» sólo dice que un patrón casó 149 veces;
 * 2 · **censo de lectores** — uno que no case en NINGÚN documento sale por
 *     error, nunca por cero (§sondas 4);
 * 3 · **cuerpo obligatorio** — un documento sin su fichero en
 *     `corpus/transformado/` no se emite a medias: TIRA. `undefined` en un
 *     campo rico es un render vacío servido con 200 (§sondas 6bis);
 * 4 · `Evaluadas` con el mínimo DERIVADO del índice, no escrito.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No toca el original, no siembra, no transforma el cuerpo (eso es
 * `cms:extractor`, cuyo resultado consume) y no decide modelo.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const TRANSFORMADO = join(CORPUS, "transformado");
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

if (!existsSync(TRANSFORMADO))
  throw new Error("no hay `corpus/transformado/`: corre `npm run cms:extractor` antes — el cuerpo sale de ahí, no de esta sonda.");

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const GRUPO_A = ["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"];

/* ══════════════════════════════════════════════════════════════════════════
 * LECTORES — sobre el HTML servido, con la regla del markup
 * ═════════════════════════════════════════════════════════════════════════ */

const censo = new Censo();
const cuenta = (id, v) => {
  const vacio = v === null || v === undefined || (Array.isArray(v) && !v.length);
  censo.total[id] = (censo.total[id] || 0) + (vacio ? 0 : 1);
  return v;
};

const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

const deco = (s) =>
  s === null || s === undefined
    ? s
    : s
        .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘")
        .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&hellip;|&#8230;/g, "…")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&nbsp;/g, " ")
        .trim();

const uno = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

/** T3b: la ruta del original pasa a la local que sirve el clon. */
const rutaLocalMedia = (u) =>
  u === null || u === undefined ? u : u.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "/images/uploads/").replace(/^\/wp-content\/uploads\//, "/images/uploads/");

const SEL = {
  h1: /<h1[^>]*>([\s\S]*?)<\/h1>/,
  title: /<title>([\s\S]*?)<\/title>/,
  desc: /<meta\s+name="description"\s+content="([^"]*)"/,
  og: /<meta\s+property="og:image"\s+content="([^"]*)"/,
  pub: /<span class="fecha-publicacion">([^<]*)<\/span>/,
  act: /<span class="fecha-actualizacion">\s*Actualizado\s*([^<]*)<\/span>/,
  /**
   * La destacada es un `et_pb_image` del `_tb_body`, FUERA del `post_content`
   * — medido: el `post_content` empieza después. Por eso es campo propio.
   *
   * ⚠ **Se ancla al `et_pb_image_wrap` y NO se deja cruzar su frontera.** La
   * primera versión hacía `…_tb_body">[\s\S]*?(<img…)` y en las páginas SIN
   * destacada el envoltorio existe **vacío** (`<span class="et_pb_image_wrap
   * "></span>`), así que el `[\s\S]*?` seguía buscando y se traía **la foto del
   * autor** de dos módulos más abajo. Lo cazó el CONTROL —la transcripción dice
   * que `todas-nuestras-soluciones-en-el-iotswc` no tiene destacada— y no lo
   * habría cazado ningún recuento: 149 de 149 «con imagen» es un pleno
   * plausible (§sondas 4, el complementario).
   */
  destacada: /<div class="et_pb_module et_pb_image et_pb_image_0_tb_body">\s*<span class="et_pb_image_wrap[^"]*">([\s\S]*?)<\/span>/,

  /* ── los CINCO del documento científico (PASO 5, 2026-08-12) ────────────
   * Los cuatro lectores de abajo cubren `autores` · `anyo` · `portada` ·
   * `descarga.{href,label}`, que §2.4 declara `required` en las 23 y que el
   * extractor no leía. No es un hallazgo: era trabajo declarado. */

  /** `<div class="scientific-taxonomies"><strong>Reche et al.</strong> | 2020<div …` */
  autores: /<div class="scientific-taxonomies">\s*<strong>([\s\S]*?)<\/strong>/,
  /**
   * El año va SUELTO entre el `</strong>` y el `<div class="scientific-category">`,
   * con un `|` de separador que es **plantilla** (constante en las 23) y no dato.
   */
  anyo: /<div class="scientific-taxonomies">\s*<strong>[\s\S]*?<\/strong>\s*\|\s*([^<]*?)\s*<div/,
  /**
   * La PORTADA — mismo envoltorio que la destacada del blog, con la diferencia
   * de que aquí va **dentro de un `<a>`**, que es justo de donde sale la
   * descarga. Se ancla al módulo, no al `<a>`, para no depender de que exista.
   */
  portada: /<div class="et_pb_with_border et_pb_module et_pb_image et_pb_image_0_tb_body">([\s\S]*?)<\/div>/,
  /** El botón: su `href` es la descarga y su texto el rótulo (en INGLÉS). */
  descarga: /<a class="et_pb_button et_pb_button_0_tb_body[^"]*"\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/,
};

/**
 * El rótulo corto del término = **el último eslabón de la miga**, que no es
 * enlace y no lleva `class="pagina"` (medido: el `<li>` final sólo trae su
 * `<span itemprop="name">`).
 */
function migaDe(sin) {
  const i = sin.indexOf("kunak-breadcrumbs");
  if (i < 0) return null;
  const ol = sin.slice(i, sin.indexOf("</ol>", i));
  const ultimo = ol.slice(ol.lastIndexOf("<li"));
  const m = ultimo.match(/<span itemprop="name">([\s\S]*?)<\/span>/);
  return m ? textoPlano(m[1]) : null;
}

/**
 * ⚠ **Las etiquetas se sustituyen por UN ESPACIO, no por nada.** Es lo que hace
 * la transcripción medida: `Metano (CH<sub>4</sub>)` está transcrito como
 * `«Metano (CH 4 )»`, y el campo es texto plano. Reproducirlo es fidelidad a la
 * medida; «mejorarlo» a `Metano (CH4)` sería criterio propio.
 */
const textoPlano = (s) => deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

const attr = (tag, n) => { const m = tag.match(new RegExp(`${n}="([^"]*)"`)); return m ? m[1] : null; };

function imagen(tag) {
  if (!tag) return undefined;
  const src = rutaLocalMedia(attr(tag, "src"));
  if (!src) return undefined;
  const srcset = attr(tag, "srcset");
  const o = { src };
  if (srcset) o.srcset = srcset.split(",").map((p) => rutaLocalMedia(p.trim())).join(", ");
  for (const k of ["sizes", "width", "height"]) { const v = attr(tag, k); if (v) o[k] = v; }
  const alt = deco(attr(tag, "alt")); if (alt) o.alt = alt;
  return o;
}

/**
 * Los términos de una taxonomía, con su NOMBRE.
 *
 * ⚠ El nombre se lee **hasta `</a>` y se le quitan las etiquetas**: en la miga
 * el rótulo va envuelto (`<a …><span itemprop="name">Industria y contaminación
 * por olores</span></a>`), así que un `>([^<]*)<` capturaba **vacío** y caía al
 * slug — dando `nombre: "industria-y-contaminacion-por-olores"`, que **parece
 * un dato** y no lo es. Lo cazó el CONTROL.
 */
function terminosDe(sin, tax) {
  const re = new RegExp(`href="https://kunakair\\.com/es/${tax}/([^"/]+)/"[^>]*>([\\s\\S]*?)<\\/a>`, "g");
  const m = new Map();
  for (const x of sin.matchAll(re)) {
    const nombre = textoPlano(x[2]).trim();
    if (!m.has(x[1]) || (!m.get(x[1]) && nombre)) m.set(x[1], nombre);
  }
  return [...m].map(([slug, nombre]) => ({ slug, nombre: nombre || slug }));
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const trabajo = Object.entries(INDICE.paginas).filter(([c]) => GRUPO_A.includes(c.split("/")[0]));
const ev = new Evaluadas({ nombre: "extractor-a", unidad: "documentos del grupo A", minimo: trabajo.length });

const salida = { "entradas-blog": [], "terminos-kunakpedia": [], "documentos-cientificos": [] };
const sinCuerpo = [];

for (const [clave, p] of trabajo) {
  const col = clave.split("/")[0];
  const slug = clave.slice(col.length + 1);
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const sin = sinScriptNiStyle(crudo);

  const fCuerpo = join(TRANSFORMADO, `${clave}.html`);
  if (SABOTAJE === "cuerpo-ausente" && salida["entradas-blog"].length === 3) { sinCuerpo.push(clave); ev.fallo(clave, "cuerpo ausente (sabotaje)"); continue; }
  if (!existsSync(fCuerpo)) { sinCuerpo.push(clave); ev.fallo(clave, "sin cuerpo en corpus/transformado"); continue; }
  const cuerpo = readFileSync(fCuerpo, "utf8");

  const titulo = cuenta("titulo", deco(uno(sin, SABOTAJE === "selector-muerto" ? /<h9[^>]*>([\s\S]*?)<\/h9>/ : SEL.h1)?.replace(/<[^>]+>/g, "")));
  const seo = {
    title: cuenta("seo.title", deco(uno(crudo, SEL.title))),
    description: cuenta("seo.description", deco(uno(crudo, SEL.desc))) ?? undefined,
    ogImage: cuenta("seo.ogImage", rutaLocalMedia(uno(crudo, SEL.og))) ?? undefined,
  };
  if (seo.description === undefined) delete seo.description;
  if (seo.ogImage === undefined) delete seo.ogImage;

  const base = { slug, seo, titulo, cuerpo };

  if (col === "entradas-blog") {
    const envoltorio = uno(sin, SEL.destacada);
    const destacada = imagen(cuenta("destacada", envoltorio ? (envoltorio.match(/<img[^>]*>/) ?? [null])[0] : null));
    const recurso = terminosDe(sin, "recursos/articulos")[0];
    const doc = {
      ...base,
      fechaPublicacion: cuenta("fechaPublicacion", deco(uno(sin, SEL.pub))) ?? "",
      categorias: cuenta("categorias", terminosDe(sin, "categoria")),
      etiquetas: cuenta("etiquetas", terminosDe(sin, "etiqueta")),
      relacionados: /tambi[ée]n te puede interesar/i.test(sin),
    };
    const act = deco(uno(sin, SEL.act)); if (act) { cuenta("fechaActualizacion", act); doc.fechaActualizacion = act; }
    if (destacada) doc.imagenDestacada = destacada;
    if (recurso) doc.recurso = recurso;
    salida["entradas-blog"].push(doc);
  } else if (col === "terminos-kunakpedia") {
    const miga = cuenta("miga", SABOTAJE === "selector-muerto" ? null : migaDe(sin));
    const doc = { ...base };
    /* El rótulo de la miga es campo con defecto «el título», OMITIDO cuando
     * coinciden — el mismo patrón que `prefijo` (CMS-1). */
    if (miga && miga !== titulo) doc.tituloMiga = miga;
    salida["terminos-kunakpedia"].push(doc);
  } else {
    const cat = terminosDe(sin, "scientific-category")[0];
    const envPortada = uno(sin, SABOTAJE === "selector-muerto" ? /<div class="et_pb_portada_inexistente">([\s\S]*?)<\/div>/ : SEL.portada);
    const mDescarga = SABOTAJE === "selector-muerto" ? null : sin.match(SEL.descarga);
    const doc = {
      ...base,
      categoria: cuenta("categoria", cat) ?? null,
      autores: cuenta("autores", textoPlano(uno(sin, SEL.autores))) ?? "",
      anyo: cuenta("anyo", deco(uno(sin, SEL.anyo))) ?? "",
      portada: cuenta("portada", imagen(envPortada ? (envPortada.match(/<img[^>]*>/) ?? [null])[0] : null)),
      descarga: cuenta("descarga", mDescarga ? { href: mDescarga[1], label: textoPlano(mDescarga[2]) } : null),
    };
    /* El prefijo se omite cuando vale el defecto (CMS-1). La ruta es
     * `/es/recursos/<prefijo>/<categoría>/<slug>/`, así que el prefijo es el
     * segmento **2**, no el 1 — el 1 es `recursos`, que es constante y por eso
     * daba «recursos» en las 23 sin dar error. */
    const pref = new URL(p.url).pathname.split("/").filter(Boolean)[2];
    if (pref && pref !== "documentos-cientificos") doc.prefijo = pref;
    salida["documentos-cientificos"].push(doc);
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTROL — los transcritos a mano tienen que reproducirse
 * ═════════════════════════════════════════════════════════════════════════ */

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
mkdirSync(join(QA, ".tmp"), { recursive: true });
const bundle = join(QA, ".tmp", "arquetipo-a-ext.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/arquetipo-a.ts")],
  outfile: bundle, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const LIB = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

const control = [];
const cmp = (slug, campo, leido, esperado) => {
  const a = JSON.stringify(leido ?? null), b = JSON.stringify(esperado ?? null);
  if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null });
};
const porSlug = (col) => new Map(salida[col].map((d) => [d.slug, d]));

const blog = porSlug("entradas-blog");
for (const e of LIB.ENTRADAS_BLOG) {
  const d = blog.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  const esp = SABOTAJE === "control-roto" ? { ...e, titulo: `${e.titulo} ✂` } : e;
  cmp(e.slug, "titulo", d.titulo, esp.titulo);
  cmp(e.slug, "seo.title", d.seo.title, esp.seo.title);
  cmp(e.slug, "seo.description", d.seo.description, esp.seo.description);
  cmp(e.slug, "seo.ogImage", d.seo.ogImage, esp.seo.ogImage);
  cmp(e.slug, "fechaPublicacion", d.fechaPublicacion, esp.fechaPublicacion);
  cmp(e.slug, "fechaActualizacion", d.fechaActualizacion, esp.fechaActualizacion);
  cmp(e.slug, "categorias", d.categorias, esp.categorias);
  cmp(e.slug, "etiquetas", [...d.etiquetas].sort((x, y) => x.slug.localeCompare(y.slug)), [...esp.etiquetas].sort((x, y) => x.slug.localeCompare(y.slug)));
  cmp(e.slug, "recurso", d.recurso, esp.recurso);
  cmp(e.slug, "relacionados", d.relacionados, esp.relacionados);
  cmp(e.slug, "imagenDestacada", d.imagenDestacada, esp.imagenDestacada);
}
const term = porSlug("terminos-kunakpedia");
for (const e of LIB.TERMINOS_KUNAKPEDIA) {
  const d = term.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo);
  cmp(e.slug, "tituloMiga", d.tituloMiga, e.tituloMiga);
}
const docs = porSlug("documentos-cientificos");
for (const e of LIB.DOCUMENTOS_CIENTIFICOS) {
  const d = docs.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo);
  cmp(e.slug, "categoria", d.categoria, e.categoria);
  cmp(e.slug, "prefijo", d.prefijo, e.prefijo);
  /* Los CINCO del PASO 5, contra los 4 transcritos a mano. */
  cmp(e.slug, "autores", d.autores, e.autores);
  cmp(e.slug, "anyo", d.anyo, e.anyo);
  cmp(e.slug, "portada", d.portada, e.portada);
  cmp(e.slug, "descarga", d.descarga, e.descarga);
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ extractor-a · el catálogo del grupo A desde el corpus ════════\n`);
for (const col of GRUPO_A) console.log(`  ${col.padEnd(24)} ${String(salida[col].length).padStart(4)} documentos`);
if (sinCuerpo.length) console.log(`\n  ⛔ ${sinCuerpo.length} sin cuerpo en corpus/transformado: ${sinCuerpo.slice(0, 4).join(" · ")}`);

const nControl = LIB.ENTRADAS_BLOG.length * 11 + LIB.TERMINOS_KUNAKPEDIA.length * 2 + LIB.DOCUMENTOS_CIENTIFICOS.length * 7;
console.log(`\n  CONTROL · ${nControl} comparaciones contra la transcripción a mano: ` +
  `${control.length === 0 ? "✅ TODAS" : `❌ ${control.length} discrepancia(s)`}`);
for (const c of control.slice(0, 10))
  console.log(`     · ${c.slug} · ${c.campo}\n         leído    ${JSON.stringify(c.leido)?.slice(0, 150)}\n         esperado ${JSON.stringify(c.esperado)?.slice(0, 150)}`);
if (control.length > 10) console.log(`     … y ${control.length - 10} más`);

censo.paginas = trabajo.length - sinCuerpo.length;
const muertos = censo.informe("de campos");

w("medidas/a-extraido.json", {
  meta: {
    fecha: hoy(),
    que: "el catálogo COMPLETO del grupo A, extraído del corpus congelado",
    fuente: "corpus/ (metadatos) + corpus/transformado/ (cuerpo, T1–T8 + saneador)",
    control: `${nControl} comparaciones contra src/lib/arquetipo-a.ts`,
    sabotaje: SABOTAJE,
    noMide: ["no toca el original", "no siembra", "el cuerpo lo transforma `cms:extractor`, no esta sonda"],
  },
  recuento: Object.fromEntries(GRUPO_A.map((c) => [c, salida[c].length])),
  /**
   * ⚠ **El DENOMINADOR del control se congela al lado de su numerador.** El
   * control no compara los 209 documentos: compara los **transcritos a mano**,
   * que son otro conjunto y mucho más pequeño. Sin este número, cualquiera que
   * lea `comparaciones: 111` tiene que adivinar contra qué población es — y su
   * negativo lo adivinó mal en cuanto los campos crecieron (§sondas 9: la
   * afirmación trae su derivación al lado).
   */
  control: {
    comparaciones: nControl,
    documentos: LIB.ENTRADAS_BLOG.length + LIB.TERMINOS_KUNAKPEDIA.length + LIB.DOCUMENTOS_CIENTIFICOS.length,
    poblacion: Object.values(salida).reduce((a, b) => a + b.length, 0),
    discrepancias: control.length,
    detalle: control,
  },
  catalogo: salida,
});

const rojo = control.length > 0 || muertos > 0 || sinCuerpo.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} extractor-a: ${GRUPO_A.map((c) => `${salida[c].length} ${c}`).join(" · ")} · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinCuerpo.length} sin cuerpo\n`,
);
process.exit(rojo ? 2 : 0);
