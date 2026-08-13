/**
 * EXTRACTOR DEL GRUPO A — del corpus congelado al CATÁLOGO completo.
 * Uso: npm run cms:extractor-a
 * Negativos: SABOTAJE=selector-muerto | control-roto | cuerpo-ausente | cuerpo-cambiado
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
 *     roja: sin esto, «149 extraídos» sólo dice que un patrón casó 149 veces.
 *     ⚠ **Desde 2026-08-13 el CUERPO RICO entra en el control** (§PASO 3): hasta
 *     entonces comparaba 18 campos y ninguno era `cuerpo`, o sea que el HTML de
 *     T1–T8 llevaba desde F2-2 sin compararse contra nada;
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
import { Censo, clasificaDiscrepancia, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";

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
  if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null, clases: ["valor"] });
};
const porSlug = (col) => new Map(salida[col].map((d) => [d.slug, d]));

/* ══════════════════════════════════════════════════════════════════════════
 * EL CUERPO — el campo que este control NO comparaba, y era el que importa
 *
 * ⚠ **Añadido el 2026-08-13 (§DATOS-C-PIPELINE, PASO 3).** Hasta hoy el control
 * comparaba 18 campos y **ninguno era `cuerpo`**, así que el HTML que T1–T8
 * produce llevaba desde F2-2 **sin compararse contra nada** — y el verde decía
 * *«los metadatos se reproducen»*, no *«el cuerpo se reproduce»*. Es §el
 * séptimo contenedor: la unidad en la que se declara la cobertura de un control
 * absorbe lo que no compara.
 *
 * **Y alcanza a §DATOS-PIXEL**: las 8 rutas que se movieron al cambiar de
 * fuente son de este arquetipo, y su Δ no se podía adjudicar porque no había
 * ningún instrumento que mirara el objeto que cambió.
 *
 * Se compara con `clasificaDiscrepancia` (`qa/lib.mjs`), que es el MISMO
 * instrumento de `extractor-c` —importado, no copiado (clase C7)—: exige
 * identidad **plegada la serialización** y devuelve la CLASE de lo que difiere.
 * Una clase que no reconoce sale `SIN CLASIFICAR`, y eso es rojo.
 */
/**
 * Los pliegues del PIPELINE de este proyecto. No pueden vivir en `lib.mjs` sin
 * atarla a `transformaciones.mjs`, así que se inyectan.
 *
 * **Las dos son transformaciones DECLARADAS (§3.2 T3) y POSTERIORES a la
 * transcripción a mano**, que se escribió antes de que existieran. Que el
 * pipeline y la transcripción difieran aquí no es un defecto de ninguno de los
 * dos: es que miden momentos distintos del proyecto.
 */
const ctxMudo = () => ({
  pagina: "control", rutas: new Set(),
  scriptsQuitados: [], mediaDelCuerpo: [], sinLlaveT3b: [], sustitucionesT4b: [], payloadIlegible: [],
});
const PLIEGUES_PIPELINE = [
  /**
   * Los pliegues NO se escriben: se DERIVAN de `TRANSFORMACIONES`, así que una
   * transformación nueva entra sola y su divergencia contra la transcripción
   * deja de contar como defecto sin tocar esta sonda (§sondas 9: la afirmación
   * trae su derivación al lado). **T7 queda FUERA a propósito** — es justo lo
   * que esta tanda está decidiendo, y plegarlo taparía lo que hay que medir.
   *
   * Se pueden aplicar a la transcripción porque son **idempotentes por
   * contrato**: la postcondición de cada una exige que después no quede diana.
   *
   * ⚠ **Y lo que este pliegue NO puede probar, dicho en voz alta:** una
   * transformación con un defecto lo aplica IGUAL a los dos lados, así que el
   * pliegue lo esconde. La transcripción no puede arbitrar T1–T8 —se escribió
   * antes de que existieran—, y quien las guarda son sus POSTCONDICIONES y sus
   * censos en `cms:extractor`. Aquí se mide otra cosa: que fuera de ellas los
   * dos cuerpos son el mismo.
   */
  ...TRANSFORMACIONES.filter((t) => t.id !== "t7").map((t) => ({
    clase: `${t.id}-declarada`,
    aplica: (s) => t.aplica(s, ctxMudo()).html,
    firma: (s) => String(t.diana(s, ctxMudo())),
  })),
  /**
   * ⚠ **`data-media` NO es una clase propia: es una CONSECUENCIA de
   * `media-original`, y por eso se pliega aparte.** T3b lo deriva de la llave
   * del `src`, y la llave sólo existe si el `src` apunta al prefijo de subidas
   * del original. La transcripción a mano **localizó el `src`**, así que su
   * llave no es derivable y su `<figure>` sale sin atributo — no porque T3b
   * falle, sino porque la entrada es otra.
   *
   * Que T3b lo emita cuando toca **está guardado en otro sitio**, y por eso
   * plegarlo aquí no deja un hueco: `medidas/extractor-corpus.json`
   * → `mediaDelCuerpo.referencias`, que es derivada y la consume el invariante
   * D de `qa:artefacto`.
   */
  { clase: "t3b-data-media", aplica: (s) => s.replace(/\s*data-media="[^"]*"/g, ""), firma: (s) => String((s.match(/data-media="/g) ?? []).length) },
  /**
   * `srcset` — **la transcripción es más VIEJA que la captura**, y aquí no hace
   * falta muestrear para saber de qué lado está la razón: se DERIVA.
   *
   * **Ninguna de las 10 transformaciones toca `srcset`** —T1 y T3a tocan
   * `class`, T2 toca `style`, T3b reutiliza el `<img>` verbatim— así que el
   * `srcset` del pipeline **es, por construcción, el del corpus congelado**, o
   * sea el del original. Comprobado además en las 2 instancias que divergen:
   * `contaminacion-por-metano` (original `980w 480w`, y la transcripción trae
   * un `1280w` que el original ya no sirve) y `running-for-clean-air` (original
   * `1751w 1280w 980w 480w`, y la transcripción se queda en `980w 480w`).
   *
   * WordPress regenera variantes; el original es un sitio vivo. No es defecto
   * de ninguno de los dos: es que miden fechas distintas, y el frozen manda.
   */
  {
    clase: "srcset-recapturado",
    /* `sizes` va CON `srcset`, no aparte: WordPress genera los dos del mismo
     * juego de variantes, así que cuando cambia el juego cambian los dos. Fue
     * el último residuo del PASO 3 — plegar sólo `srcset` dejaba `sizes` fuera
     * y sacaba un `SIN CLASIFICAR` que era la misma cosa con otro nombre. */
    aplica: (s) => s.replace(/\bsrcset="[^"]*"/g, 'srcset="·"').replace(/\bsizes="[^"]*"/g, 'sizes="·"'),
    firma: (s) => [...s.matchAll(/\b(?:srcset|sizes)="([^"]*)"/g)].map((m) => m[1]).join("|"),
  },
];

/**
 * ⚠ **LA ADJUDICACIÓN DE CADA CLASE, POR ESCRITO Y CON SU RAZÓN.**
 *
 * El clasificador dice EN QUÉ difieren; esta tabla dice **qué significa cada
 * diferencia**, y es lo único que separa un pliegue que MIDE de uno que TAPA.
 * Una clase que no esté aquí es roja por no estar adjudicada — que es la §regla
 * del cero aplicada al catálogo de clases: no reconocer una clase y no tener
 * ninguna dan la misma salida si el defecto por defecto es benigno.
 */
const CLASES = {
  espacio: ["dato", "la transcripción normalizó sangrado y finales de línea; el original sirve LF y CRLF MEZCLADOS (9184 CRLF en el corpus) — §PASO 2"],
  "cierre-xhtml": ["dato", "el original sirve `<br />` en las 3 instancias medidas; la transcripción lo normalizó a `<br>` — §PASO 2"],
  "espacio-duro": ["dato", "el original sirve U+00A0 CRUDO; la transcripción lo escapó a `&nbsp;` — §PASO 2"],
  /* Las declaradas se adjudican en bloque y por DERIVACIÓN, igual que se
   * pliegan: `<id>-declarada` es una transformación de §3.2 posterior a la
   * transcripción a mano, y su título dice cuál. */
  ...Object.fromEntries(
    TRANSFORMACIONES.filter((t) => t.id !== "t7").map((t) => [
      `${t.id}-declarada`,
      ["dato", `transformación declarada §3.2, POSTERIOR a la transcripción — ${t.titulo.slice(0, 72)}`],
    ]),
  ),
  "srcset-recapturado": ["dato", "ninguna de las 10 transformaciones toca `srcset`, así que el del pipeline ES el del corpus. La transcripción es más VIEJA que la captura y el original regenera variantes — arbitrado contra el corpus en 2/2"],
  "t3b-data-media": ["dato", "CONSECUENCIA de `media-original`: la llave sólo se deriva del `src` del original, y la transcripción lo localizó. Guardado aparte en `extractor-corpus.json` → `mediaDelCuerpo`"],
  href: ["DEFECTO", "§Regla de rutas locales + §F2-3-HREF-DERIVADO salida (b) — lo arregla T7 (§PASO 4)"],
  target: ["DEFECTO", '§Regla de rutas locales: `target="_blank"` sólo si el destino es externo — lo arregla T7 (§PASO 4)'],
  "media-original": ["DEFECTO", "§Assets: «nunca se enlaza a kunakair.com en caliente», y el destino SÍ está publicado — §DATOS-MEDIA-HOTLINK"],
  "SIN CLASIFICAR": ["DEFECTO", "ninguna regla escrita la cubre"],
};

/**
 * ⚠ **DEFECTOS ABIERTOS, CON FICHA Y CON NÚMERO.**
 *
 * Un defecto declarado **sin número** es un permiso: deja pasar el suyo y todos
 * los que lleguen detrás con la misma etiqueta. Con número es una **medida que
 * caduca sola** — si aparece uno más, o se arregla uno, el control se pone rojo
 * y obliga a re-declarar. Es el mismo idioma que los 28 `404` del original y los
 * 2 `wp-caption` no canónicos: ausencia MEDIDA, no ausencia supuesta.
 *
 * `media-original` está aquí y `href`/`target` NO, y la diferencia es de
 * ALCANCE: los segundos los arregla esta tanda (T7, §PASO 4); el primero es una
 * transformación distinta sobre los mismos 209 cuerpos, y meterla en el mismo
 * re-sembrado haría **inatribuible** el efecto de T7 — que es exactamente el
 * agujero por el que §DATOS-PIXEL no se pudo adjudicar.
 */
const ABIERTOS = {
  "media-original": { n: 9, ficha: "§DATOS-MEDIA-HOTLINK (PENDIENTES-QA.md), abierta 2026-08-13" },
};

/** Los pares que son el MISMO documento con otra ortografía: dato, no defecto. */
const serializacion = [];
const cmpRico = (slug, campo, leido, esperado) => {
  const r = clasificaDiscrepancia(leido, esperado, PLIEGUES_PIPELINE);
  const defectos = r.clases.filter((c) => (CLASES[c]?.[0] ?? "DEFECTO") === "DEFECTO" && !(c in ABIERTOS));
  if (!defectos.length) {
    /* Todas sus clases están adjudicadas como DATO: se anota y no es discrepancia.
     * ⚠ `mismoDocumento` tiene que ser cierto para llegar aquí — si sobrevive
     * algo a todos los pliegues, `SIN CLASIFICAR` está en `clases` y es DEFECTO. */
    if (r.clases.length) serializacion.push({ slug, campo, clases: r.clases });
    return;
  }
  control.push({
    slug, campo, clases: r.clases, defectos,
    /* ⚠ RECORTADOS a 400: la congelada es para auditar el RECUENTO y las CLASES,
     * no para re-clasificar. Re-clasificar sobre el recorte da otro reparto. */
    leido: typeof leido === "string" ? leido.slice(0, 400) : (leido ?? null),
    esperado: typeof esperado === "string" ? esperado.slice(0, 400) : (esperado ?? null),
  });
};

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
  cmpRico(e.slug, "cuerpo", SABOTAJE === "cuerpo-cambiado" ? `${d.cuerpo}<p>✂</p>` : d.cuerpo, esp.cuerpo);
}
const term = porSlug("terminos-kunakpedia");
for (const e of LIB.TERMINOS_KUNAKPEDIA) {
  const d = term.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo);
  cmp(e.slug, "tituloMiga", d.tituloMiga, e.tituloMiga);
  cmpRico(e.slug, "cuerpo", d.cuerpo, e.cuerpo);
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
  cmpRico(e.slug, "cuerpo", d.cuerpo, e.cuerpo);
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ extractor-a · el catálogo del grupo A desde el corpus ════════\n`);
for (const col of GRUPO_A) console.log(`  ${col.padEnd(24)} ${String(salida[col].length).padStart(4)} documentos`);
if (sinCuerpo.length) console.log(`\n  ⛔ ${sinCuerpo.length} sin cuerpo en corpus/transformado: ${sinCuerpo.slice(0, 4).join(" · ")}`);

/* 12 · 3 · 8 campos por documento — el `+1` de cada uno es `cuerpo`. */
const nControl = LIB.ENTRADAS_BLOG.length * 12 + LIB.TERMINOS_KUNAKPEDIA.length * 3 + LIB.DOCUMENTOS_CIENTIFICOS.length * 8;
const nRicos = LIB.ENTRADAS_BLOG.length + LIB.TERMINOS_KUNAKPEDIA.length + LIB.DOCUMENTOS_CIENTIFICOS.length;
console.log(`\n  CONTROL · ${nControl} comparaciones contra la transcripción a mano ` +
  `(${nRicos} de ellas son el CUERPO RICO): ` +
  `${control.length === 0 ? "✅ TODAS" : `❌ ${control.length} discrepancia(s)`}`);
for (const c of control.slice(0, 10))
  console.log(`     · ${c.slug} · ${c.campo}  [${(c.clases ?? []).join("+") || "—"}]\n         leído    ${JSON.stringify(c.leido)?.slice(0, 150)}\n         esperado ${JSON.stringify(c.esperado)?.slice(0, 150)}`);
if (control.length > 10) console.log(`     … y ${control.length - 10} más`);

/* ── El INVENTARIO de clases, que es lo que el PASO 3 tenía que producir ──
 * Se imprime SIEMPRE, incluso en verde: es el dato que dice qué formas de
 * divergencia existen entre el pipeline y la transcripción a mano, y sin él
 * «0 discrepancias» no distingue «coinciden» de «coinciden por poco». */
const porClase = new Map();
for (const x of [...serializacion, ...control])
  for (const cl of x.clases ?? ["valor"]) porClase.set(cl, (porClase.get(cl) ?? 0) + 1);
console.log(`\n  INVENTARIO de clases de divergencia sobre ${nRicos} cuerpos controlados:`);
if (!porClase.size) console.log(`     (ninguna: los ${nRicos} cuerpos coinciden)`);
for (const [cl, n] of [...porClase].sort((a, b) => b[1] - a[1])) {
  const [v, porQue] = CLASES[cl] ?? ["DEFECTO", "⛔ CLASE SIN ADJUDICAR: no está en la tabla `CLASES`"];
  console.log(`     ${String(n).padStart(3)} × ${cl.padEnd(15)} ${v === "dato" ? "· dato   " : "⛔ DEFECTO"}  ${porQue}`);
}
console.log(
  `     ${serializacion.length} de los ${nRicos} cuerpos divergen SÓLO en clases adjudicadas como dato o ABIERTAS\n` +
    `     ${control.filter((c) => c.campo === "cuerpo").length} traen al menos un DEFECTO no declarado`,
);

/* ── Los ABIERTOS: se comprueba el NÚMERO, que es lo que los hace caducar ── */
const abiertosMal = [];
for (const [cl, { n, ficha }] of Object.entries(ABIERTOS)) {
  const visto = porClase.get(cl) ?? 0;
  const ok = visto === n;
  if (!ok) abiertosMal.push(`${cl}: declarados ${n}, vistos ${visto}`);
  console.log(
    `\n  ${ok ? "⚠" : "❌"} DEFECTO ABIERTO \`${cl}\` — ${visto} de ${nRicos} cuerpos ` +
      `(declarados ${n})  ${ficha}` +
      (ok ? "" : `\n     ⛔ EL NÚMERO SE MOVIÓ: la declaración caduca. Re-mídelo y re-decláralo, no lo subas.`),
  );
}

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
    /** De las `comparaciones`, cuántas miran el CUERPO RICO. Antes: **0**. */
    cuerposComparados: nRicos,
    poblacion: Object.values(salida).reduce((a, b) => a + b.length, 0),
    discrepancias: control.length,
    detalle: control,
  },
  /**
   * El INVENTARIO del PASO 3: qué formas de divergencia existen entre el HTML
   * del pipeline y la transcripción a mano, con su recuento. Un `SIN
   * CLASIFICAR` aquí es una clase que ninguna regla escrita cubre.
   */
  divergencia: {
    porClase: Object.fromEntries([...porClase].sort((a, b) => b[1] - a[1])),
    /** La adjudicación se congela CON el reparto: un recuento sin ella no dice si es defecto. */
    adjudicacion: Object.fromEntries(Object.entries(CLASES).map(([k, [v, p]]) => [k, `${v} — ${p}`])),
    /** Los defectos ABIERTOS con su número declarado: si se mueve, la sonda cierra en rojo. */
    abiertos: ABIERTOS,
    abiertosMal,
    serializacion,
    sinClasificar: control.filter((c) => (c.clases ?? []).includes("SIN CLASIFICAR")).map((c) => `${c.slug}.${c.campo}`),
  },
  catalogo: salida,
});

const rojo = control.length > 0 || muertos > 0 || sinCuerpo.length > 0 || abiertosMal.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} extractor-a: ${GRUPO_A.map((c) => `${salida[c].length} ${c}`).join(" · ")} · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinCuerpo.length} sin cuerpo · ` +
    `${abiertosMal.length} declaración(es) de defecto abierto caducada(s)\n`,
);
process.exit(rojo ? 2 : 0);
