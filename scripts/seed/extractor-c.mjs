/**
 * EXTRACTOR DEL GRUPO C — del corpus congelado al catálogo de CASOS y FAQS.
 * Uso: npm run cms:extractor-c
 * Negativos: SABOTAJE=selector-muerto | control-roto | region-ausente | saneador
 *
 * ── Por qué hace falta uno NUEVO, derivado y no supuesto ──────────────────
 * `qa:c-inventario` (PASO 0) lo midió: `post_content` en **0 de 57** y **0 de
 * 19**, y `corpus/transformado/{casos,faqs}` **no existe**. Ni `cms:extractor`
 * ni `cms:extractor-a` los cubren — los dos entran por ahí.
 *
 * **Pero es EXTENSIÓN, no camino nuevo**, y eso también salió con número: las
 * **10** transformaciones de `TRANSFORMACIONES` tienen la firma
 * `aplica(html, ctx)` sobre **una cadena**, o sea que son agnósticas de la
 * región. Lo que no existía es el extractor de regiones, que es esto.
 *
 * ── La diferencia real con el grupo A: CUÁNTAS regiones ricas hay ─────────
 * Un documento del grupo A tiene **una** (`post_content`). Aquí:
 *
 *   · un **caso** tiene **cinco** — `necesidad`, `solucion`, `resultados`,
 *     `destacado` y `detalles.parametros`;
 *   · una **faq** tiene **una**, pero en `.entry-content` y no en
 *     `et_pb_post_content`.
 *
 * Cada región pasa por T1–T8 **por separado y con su propio `ctx`**, porque una
 * transformación que cuenta (T4a los scripts, T3b la media) tiene que contar por
 * región o su postcondición mide otra cosa.
 *
 * ── El ámbito, que es donde está la trampa de este arquetipo ──────────────
 * El pie de cada caso trae un aside «Otros casos» con **3 teasers** que llevan
 * `case-cliente`, `case-title` y `case-sectores` **de otros casos**. Un lector
 * global casa 4 veces y devuelve el primero por azar de orden. Por eso lo
 * primero que hace el lector es **acotar al `<article>` propio**.
 *
 * ── Las guardas que cierran el código de salida ───────────────────────────
 * 1 · **CONTROL** contra los 4 casos y las 2 faqs transcritos a mano, **cuerpos
 *     ricos INCLUIDOS** — que es lo que `c-inventario` no podía comparar porque
 *     no transformaba. Su denominador se congela al lado: **6 de 76**;
 * 2 · **censo de lectores** — uno que no case en NINGÚN documento sale por error;
 * 3 · **región obligatoria** — un caso sin `necesidad`/`solucion`/`resultados`
 *     TIRA. Un campo rico `undefined` no revienta: **no pinta** (§sondas 6bis);
 * 4 · **el contrato del saneador** sobre cada región transformada, con el MISMO
 *     `validaHtmlCorpus` que corre el `validate` del alta — importado, no
 *     copiado (clase C7);
 * 5 · `Evaluadas` con el mínimo DERIVADO del índice.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No toca el original, no siembra y no decide modelo.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, clasificaDiscrepancia, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";
import { mediaPublicada } from "./media-publicada.mjs";
import { cargaExportados } from "./catalogos.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

/** T10 · el entorno, derivado una vez: qué media sirve el clon (§regla 6: TIRA si no hay árbol). */
const MEDIA_PUBLICADA = mediaPublicada();

/**
 * ⚠ **El término de sector se embebe COMPLETO, y `paginaSlug` NO está en el chip.**
 *
 * El chip servido enlaza al archivo de taxonomía (`/es/sector/<slug>/`), así que
 * de la página del caso sólo salen `slug` y `nombre`. Pero §2c modela esto como
 * **término embebido completo** —el caso guarda QUÉ término, y el término lleva
 * su página cuando la tiene— y la VUELTA reconstituye el término entero desde la
 * colección. Con el término a medias, el round-trip veía 36 `paginaSlug`
 * «(ausente) → valor» y los contaba como diferencia de FORMA.
 *
 * Enriquecer no es inventar: sale del MISMO catálogo que siembra
 * `taxonomia-sectores`, no de una segunda tabla. Un slug que no esté ahí se
 * queda como está y se nombra — un `paginaSlug` fabricado sería peor que su
 * ausencia.
 */
const TERMINOS = new Map(
  (await cargaExportados("src/lib/taxonomia-sectores.ts", ["TERMINOS_SECTOR"])).map((t) => [t.slug, t]),
);
const terminosDesconocidos = new Set();
const mediaCaliente = [];

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["selector-muerto", "control-roto", "region-ausente", "saneador", "destacado-dentro", "t9-sin-discriminador"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const GRUPO_C = ["casos", "faqs"];

/* ── el contrato del saneador y las rutas de T7: de la config, no copiados ── */
const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
mkdirSync(join(QA, ".tmp"), { recursive: true });
const bComunes = join(QA, ".tmp", "comunes-cext.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/campos/comunes.ts")],
  outfile: bComunes, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const { validaHtmlCorpus } = await import(`${pathToFileURL(bComunes).href}?t=${Date.now()}`);

/**
 * Las rutas publicadas, para T7: **SÓLO el manifiesto del build**.
 *
 * ⚠ Aquí había una copia literal del defecto de `extractor.mjs` —manifiesto
 * **más las URL del corpus**—, corregida el 2026-08-13 con él (§PASO 4). Una URL
 * capturada no es una ruta publicada: §F2-3-HREF-DERIVADO, salida (b).
 */
const rutas = new Set();
const manifiesto = enApp(".next/prerender-manifest.json");
if (!existsSync(manifiesto))
  throw new Error(
    "no hay `prerender-manifest.json`: sin build no hay conjunto de rutas publicadas para T7.\n" +
      "  0 rutas daría un T7 «limpio» que no miró nada (la regla del cero).",
  );
for (const r of Object.keys(JSON.parse(readFileSync(manifiesto, "utf8")).routes ?? {})) rutas.add(r);

/* ══════════════════════════════════════════════════════════════════════════
 * LECTORES — los de `qa:c-inventario`, que salieron 60/60 contra el control
 * ═════════════════════════════════════════════════════════════════════════ */

const censo = new Censo();
const cuenta = (id, v) => {
  const vacio = v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length);
  censo.total[id] = (censo.total[id] || 0) + (vacio ? 0 : 1);
  return v;
};

const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

/**
 * Las clases que el documento SIRVE con estilo — el discriminador de T9.
 *
 * ⚠ **Se lee del `<style>`, que es el único canal donde Divi lo pone.** §*Divi
 * no escribe marcado: COMPILA CSS, y lo sirve en el mismo `<style>`*. Mirar
 * atributos y clases del marcado para saber si algo tiene estilo es medir el
 * canal equivocado — es el error de `qa:kb-tipografia`, que censó diez ejes y
 * ninguno era CSS.
 *
 * ⛔ **Y su límite, declarado:** las hojas ENLAZADAS (plugins · `et-cache` ·
 * tema) **no están en el corpus**, así que este conjunto es *«las clases con
 * regla en el CSS EN LÍNEA»*, no *«todas las que tienen estilo»*. T9 lo usa como
 * condición NECESARIA para desenvolver, o sea que el sesgo va hacia **no**
 * desenvolver de más — que es la dirección segura.
 */
function clasesConEstiloDe(crudo) {
  const css = [...crudo.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]).join("\n");
  const s = new Set();
  for (const m of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) s.add(m[1]);
  return s;
}

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
const textoPlano = (s) => (s === null || s === undefined ? s : deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")));
const attr = (tag, n) => { const m = tag.match(new RegExp(`${n}="([^"]*)"`)); return m ? m[1] : null; };
const rutaLocalMedia = (u) =>
  u === null || u === undefined
    ? u
    : u.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "/images/uploads/").replace(/^\/wp-content\/uploads\//, "/images/uploads/");

function entre(h, desde, hasta) {
  const i = h.indexOf(desde);
  if (i < 0) return null;
  const j = hasta ? h.indexOf(hasta, i + desde.length) : -1;
  return h.slice(i, j < 0 ? undefined : j);
}

const SEL = {
  articulo: /<article id="post-\d+"[^>]*class="[^"]*case-studies[^"]*"[\s\S]*?(?=<aside class="container case-list")/,
  titulo: /<h1 class="entry-title">([\s\S]*?)<\/h1>/,
  cliente: /<div class="case-cliente">([\s\S]*?)<\/div>/,
  necesidad: /class="entry-content entry-content-need"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  solucion: /class="entry-content entry-content-solution"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  resultados: /class="entry-content entry-content-results"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  destacado: /<div class="texto-destacado">([\s\S]*?)<\/div>/,
  mapa: /<div class="marker" data-lat="([-\d.]+)" data-lng="([-\d.]+)"/,
  faqTitulo: /<h1 class="entry-title">([\s\S]*?)<\/h1>/,
  faqCuerpo: /<div class="entry-content">([\s\S]*?)<\/div>/,
};

/**
 * ⚠ **El `texto-destacado` vive DENTRO de `entry-content-bloque`, y es CAMPO
 * PROPIO.** Medido en el corpus: en los 3 casos que lo traen, el `<div
 * class="texto-destacado">` está anidado dentro del bloque de `necesidad`
 * —`need@253408 · destacado@254732 · solution@255183`—, así que el recorte no
 * greedy hasta `</div></div>` **se lo traga**. El modelo lo tiene aparte
 * (`casos.ts`, el esquema y el componente lo pintan por separado), o sea que
 * dejarlo dentro lo **duplicaría** en la página servida.
 *
 * Lo cazó el control de cuerpos ricos (§DATOS-C-PIPELINE, PASO 3): salía como
 * `SIN CLASIFICAR` en 3 de las 12 discrepancias, y la ficha lo tenía metido en
 * el cubo de «combinaciones de las anteriores». Un cubo que absorbe una clase
 * entera.
 *
 * ⚠ **Y el recorte llega SIN el `</div>` de cierre, que es lo que hace que la
 * primera versión de este arreglo no mordiera.** `SEL.necesidad` es no greedy
 * hasta `</div>\s*</div>`, y ese primer `</div>` **es el del propio
 * `texto-destacado`** — así que el grupo capturado termina en el texto, con el
 * `<div>` abierto y sin cerrar. Un patrón que exija el cierre no casa nunca y
 * devuelve **cero sin dar error**, que es §sondas 4 otra vez: `destacadoExtraido`
 * salió `[]` y las 3 discrepancias siguieron ahí.
 */
const SIN_DESTACADO = /\s*<div class="texto-destacado">[\s\S]*$/;

/**
 * `imagenCabecera` — el ÚNICO lector que mira el `<style>`, y a propósito: Divi
 * COMPILA la foto de la banda a `background-image` y la sirve ahí, no en el
 * marcado. Aplicarle la regla del markup daría `null` en **57 de 57** — un cero
 * perfecto, sin error, y falso.
 */
function imagenCabeceraDe(crudo) {
  const regla = uno(crudo, /\.et_pb_section_0_tb_header\s*\{([^}]*)\}/);
  if (!regla) return null;
  const urls = [...regla.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/^['"]|['"]$/g, ""));
  return urls.length ? rutaLocalMedia(urls[urls.length - 1]) : null;
}

function sectoresDe(art) {
  const bloque = entre(art, '<div class="case-taxonomies">', "</div>");
  if (!bloque) return [];
  const m = new Map();
  for (const x of bloque.matchAll(/href="https:\/\/kunakair\.com\/es\/sector\/([^"/]+)\/"[^>]*>([\s\S]*?)<\/a>/g))
    m.set(x[1], textoPlano(x[2]).trim());
  return [...m].map(([slug, nombre]) => {
    const t = TERMINOS.get(slug);
    if (!t) terminosDesconocidos.add(slug);
    return { slug, nombre, ...(t?.paginaSlug ? { paginaSlug: t.paginaSlug } : {}) };
  });
}

function galeriaDe(art) {
  const sec = entre(art, '<section class="case-galeria">', "</section>");
  if (!sec) return [];
  return [...sec.matchAll(/<img[^>]*>/g)].map((m) => {
    const t = m[0];
    const o = { src: rutaLocalMedia(attr(t, "src")) };
    const alt = deco(attr(t, "alt")); if (alt) o.alt = alt;
    const wd = attr(t, "width"); if (wd) o.width = Number(wd);
    const hg = attr(t, "height"); if (hg) o.height = Number(hg);
    return o;
  });
}

function detallesDe(art) {
  const txt = entre(art, '<div class="case-detalles-txt">', '<div class="case-detalles-mapa">');
  if (!txt) return {};
  const trozos = [...txt.matchAll(/<span>\s*([^<:]+):\s*<\/span>([\s\S]*?)(?=<p>\s*<span>|<\/div>\s*$)/g)];
  const o = {};
  for (const t of trozos) {
    const rotulo = deco(t[1]).toLowerCase();
    const valor = t[2].replace(/<\/p>\s*$/i, "").trim();
    if (rotulo.startsWith("usuario")) o.usuario = textoPlano(valor);
    else if (rotulo.startsWith("ubicaci")) o.ubicacion = textoPlano(valor);
    else if (rotulo.startsWith("a")) o.anyo = textoPlano(valor);
    else if (rotulo.startsWith("par")) o.parametros = valor.replace(/^<br\s*\/?>/i, "").trim();
  }
  return o;
}

/**
 * Los productos: `data-id` de la pestaña, **no** un recorte hasta el primer
 * `</ul>` — el panel de cada producto trae su propia `<ul>` de ventajas dentro
 * del `<li>`, y recortar ahí devolvía UN producto en los tres casos con varios.
 * Un array de uno es un dato plausible: lo cazó el control, no un recuento.
 */
function solucionesDe(art) {
  const sec = entre(art, '<section class="case-soluciones', "</section>");
  if (!sec) return [];
  const ids = [...sec.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]).filter((id) => !id.startsWith("item-"));
  return [...new Set(ids)];
}

/* ══════════════════════════════════════════════════════════════════════════
 * T1–T8 POR REGIÓN
 * ═════════════════════════════════════════════════════════════════════════ */

const porT = Object.fromEntries(TRANSFORMACIONES.map((t) => [t.id, { aplicadas: 0, violaciones: [] }]));
const rechazosSaneador = [];
/** T7 · la marca de §Regla de rutas locales, igual que en `extractor.mjs`. */
const noLocalizadas = [];
const relHuerfano = [];

/**
 * ⚠ **EL NEGATIVO DE T9, y sin él T9 no está probada.**
 *
 * T9 desenvuelve contenedores de transporte, y lo único que la separa de un
 * `replace` de `<div>` es su **discriminador**: *«no aporta estilo servido»*.
 * Así que el sabotaje ataca **el discriminador**, no la transformación:
 *
 * · inyecta dentro de la raíz ajena un envoltorio **que SÍ tiene render** —
 *   una clase con regla en el CSS que el documento sirve—;
 * · y **ciega** `clasesConEstilo` (conjunto vacío), que es exactamente «no
 *   saber cuál tiene estilo».
 *
 * Con el discriminador ciego, T9 se lleva el envoltorio con render y la guarda
 * de abajo lo caza. **Si el sabotaje no cambiara el resultado, no habría
 * probado nada** (§sondas 8a) — y aquí cambiarlo es la prueba de que la
 * condición 2 de T9 está haciendo trabajo, no adornando la cabecera.
 */
const CANARIO_CLASE = "et_pb_text";
const CANARIO = `<div class="${CANARIO_CLASE}"><p>canario con render</p></div>`;
const canarioComido = [];

/** Aplica el pipeline a UNA región y devuelve su HTML transformado. */
function transforma(html, clave, campo, clasesConEstilo) {
  if (html === null || html === undefined) return html;
  let entrada = html;
  const ciego = SABOTAJE === "t9-sin-discriminador";
  if (ciego && /data-testid="conversation-turn|class="[^"]*\bprose\b/.test(html)) {
    /* El canario va DENTRO de la raíz ajena, que es donde T9 actúa. */
    entrada = html.replace(/(<article\b[^>]*>)/i, `$1${CANARIO}`);
  }
  const ctx = {
    pagina: `${clave}#${campo}`,
    rutas,
    clasesConEstilo: ciego ? new Set() : clasesConEstilo,
    transporteDesenvuelto,
    scriptsQuitados: [],
    mediaDelCuerpo: [],
    /* T10 · el entorno: qué media sirve el clon. Sin esto T10 TIRA (§regla 6). */
    mediaPublicada: MEDIA_PUBLICADA,
    mediaCaliente,
    sinLlaveT3b: [],
    sustitucionesT4b: [],
    payloadIlegible: [],
    noLocalizadas,
    relHuerfano,
  };
  let out = entrada;
  for (const t of TRANSFORMACIONES) {
    const r = t.aplica(out, ctx);
    out = r.html;
    porT[t.id].aplicadas += r.n;
    for (const v of t.post(out, ctx)) porT[t.id].violaciones.push(`${clave}.${campo}: ${v}`);
  }
  /* La guarda del canario: si se inyectó, TIENE que seguir ahí. Un envoltorio
   * con render no es transporte, y T9 no puede llevárselo. */
  if (entrada !== html && !out.includes(`class="${CANARIO_CLASE}"`))
    canarioComido.push(`${clave}.${campo}`);
  /* El contrato del alta, con el MISMO código que el `validate`. El sabotaje
   * `saneador` mete un `<script>` DESPUÉS de T4 para que tenga que morder. */
  const conSabotaje = SABOTAJE === "saneador" ? `${out}<script>alert(1)</script>` : out;
  const veredicto = validaHtmlCorpus(conSabotaje);
  if (veredicto !== true) rechazosSaneador.push({ documento: clave, campo, veredicto: String(veredicto).slice(0, 160) });
  return conSabotaje;
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const trabajo = Object.entries(INDICE.paginas).filter(([c]) => GRUPO_C.includes(c.split("/")[0]));
const ev = new Evaluadas({ nombre: "extractor-c", unidad: "documentos del grupo C", minimo: trabajo.length });

const salida = { casos: [], faqs: [] };
const sinRegion = [];
/** Las regiones de las que hubo que sacar un `texto-destacado` anidado. */
const destacadoExtraido = [];
/** T9 · qué contenedores de transporte ajeno se desenvolvieron, y de dónde. */
const transporteDesenvuelto = [];

for (const [clave, p] of trabajo) {
  const col = clave.split("/")[0];
  const slug = clave.slice(col.length + 1);
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const sin = sinScriptNiStyle(crudo);
  const clasesConEstilo = clasesConEstiloDe(crudo);

  const seo = {
    title: cuenta("seo.title", deco(uno(crudo, /<title>([\s\S]*?)<\/title>/))),
    description: cuenta("seo.description", deco(uno(crudo, /<meta\s+name="description"\s+content="([^"]*)"/))) ?? undefined,
    ogImage: cuenta("seo.ogImage", rutaLocalMedia(uno(crudo, /<meta\s+property="og:image"\s+content="([^"]*)"/))) ?? undefined,
  };
  if (seo.description === undefined) delete seo.description;
  if (seo.ogImage === undefined) delete seo.ogImage;

  if (col === "faqs") {
    const art = entre(sin, '<div class="et_post_meta_wrapper">', "</article>") ?? sin;
    const titRe = SABOTAJE === "selector-muerto" ? /<h9 class="entry-title">([\s\S]*?)<\/h9>/ : SEL.faqTitulo;
    const cuerpo = cuenta("faq.cuerpo", uno(art, SEL.faqCuerpo)?.trim() ?? null);
    if (cuerpo === null) { sinRegion.push(`${clave}: cuerpo`); ev.fallo(clave, "faq sin `entry-content`"); continue; }
    /* Las faqs NO llevan `description` ni `ogImage`: ausentes en las 19,
     * medido, y el esquema no los declara. No se inventan. */
    salida.faqs.push({
      slug,
      seo: { title: seo.title },
      titulo: cuenta("faq.titulo", textoPlano(uno(art, titRe))),
      cuerpo: transforma(cuerpo, clave, "cuerpo", clasesConEstilo),
    });
    ev.ok();
    continue;
  }

  const art = cuenta("caso.articulo", sin.match(SEL.articulo)?.[0] ?? null);
  const ambito = art ?? "";
  const titRe = SABOTAJE === "selector-muerto" ? /<h9 class="entry-title">([\s\S]*?)<\/h9>/ : SEL.titulo;
  const det = detallesDe(ambito);
  const mapa = ambito.match(SEL.mapa);
  const pref = new URL(p.url).pathname.split("/").filter(Boolean)[1];

  /* Las tres regiones obligatorias: 57/57 medido. Una que falte TIRA. */
  const regiones = {};
  for (const campo of ["necesidad", "solucion", "resultados"]) {
    let bruto = SABOTAJE === "region-ausente" && salida.casos.length === 2 ? null : uno(ambito, SEL[campo])?.trim() ?? null;
    if (bruto === null) { sinRegion.push(`${clave}: ${campo}`); ev.fallo(clave, `sin región \`${campo}\``); }
    else if (SABOTAJE !== "destacado-dentro" && SIN_DESTACADO.test(bruto)) {
      /* El `destacado` es campo propio: sale de la región o se pinta dos veces. */
      bruto = bruto.replace(SIN_DESTACADO, "").trim();
      destacadoExtraido.push(`${clave}.${campo}`);
    }
    regiones[campo] = bruto;
  }
  if (Object.values(regiones).some((v) => v === null)) continue;

  const doc = {
    slug,
    seo,
    titulo: cuenta("caso.titulo", textoPlano(uno(ambito, titRe))),
    imagenCabecera: cuenta("caso.imagenCabecera", imagenCabeceraDe(crudo)),
    cliente: cuenta("caso.cliente", textoPlano(uno(ambito, SEL.cliente))),
    necesidad: transforma(regiones.necesidad, clave, "necesidad", clasesConEstilo),
    solucion: transforma(regiones.solucion, clave, "solucion", clasesConEstilo),
    resultados: transforma(regiones.resultados, clave, "resultados", clasesConEstilo),
    detalles: {
      usuario: cuenta("caso.detalles.usuario", det.usuario ?? ""),
      ubicacion: cuenta("caso.detalles.ubicacion", det.ubicacion ?? ""),
      anyo: cuenta("caso.detalles.anyo", det.anyo ?? ""),
    },
  };
  if (pref && pref !== "casos-de-exito") doc.prefijo = pref;

  const sectores = cuenta("caso.sectores", sectoresDe(ambito));
  if (sectores.length) doc.sectores = sectores;

  const destacado = uno(ambito, SEL.destacado)?.trim() ?? null;
  if (destacado !== null) doc.destacado = transforma(cuenta("caso.destacado", destacado), clave, "destacado", clasesConEstilo);

  const galeria = cuenta("caso.galeria", galeriaDe(ambito));
  if (galeria.length) doc.galeria = galeria;

  if (det.parametros) doc.detalles.parametros = transforma(cuenta("caso.detalles.parametros", det.parametros), clave, "parametros", clasesConEstilo);
  if (mapa) doc.ubicacionMapa = cuenta("caso.ubicacionMapa", { lat: Number(mapa[1]), lng: Number(mapa[2]) });

  const soluciones = cuenta("caso.soluciones", solucionesDe(ambito));
  if (soluciones.length) doc.soluciones = soluciones;

  salida.casos.push(doc);
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTROL — 4 casos y 2 faqs transcritos a mano, CUERPOS INCLUIDOS
 * ═════════════════════════════════════════════════════════════════════════ */

const bCasos = join(QA, ".tmp", "casos-cext.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/casos.ts")],
  outfile: bCasos, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
  tsconfig: enApp("tsconfig.json"),
});
const LIB_CASOS = await import(`${pathToFileURL(bCasos).href}?t=${Date.now()}`);
const bFaqs = join(QA, ".tmp", "faqs-cext.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/faqs.ts")],
  outfile: bFaqs, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
  tsconfig: enApp("tsconfig.json"),
});
const LIB_FAQS = await import(`${pathToFileURL(bFaqs).href}?t=${Date.now()}`);

/**
 * ⚠ **El HTML se compara con `clasificaDiscrepancia` (`qa/lib.mjs`), que es el
 * MISMO instrumento de `extractor-a` — importado, no copiado (clase C7).**
 *
 * Aquí había un `norm` propio que sólo plegaba el espacio en blanco, y con él
 * las 12 discrepancias de §DATOS-C-PIPELINE se clasificaron a ojo en «4 clases y
 * 6 combinaciones» — y ese cubo de combinaciones **escondía una clase entera**
 * (el `texto-destacado` anidado). El instrumento compartido no tiene cubo: lo
 * que no encaja en ninguna clase sale **`SIN CLASIFICAR`** y es rojo.
 *
 * Los pliegues del pipeline se DERIVAN de `TRANSFORMACIONES`, igual que allí:
 * la transcripción a mano es **anterior** a T1–T8, así que su marcado sin
 * transformar no las contradice — no las había aplicado.
 */
const ctxMudo = () => ({
  pagina: "control", rutas,
  scriptsQuitados: [], mediaDelCuerpo: [], sinLlaveT3b: [], sustitucionesT4b: [], payloadIlegible: [],
  noLocalizadas: [], relHuerfano: [],
  mediaPublicada: MEDIA_PUBLICADA, mediaCaliente: [],
});
const PLIEGUES_PIPELINE = TRANSFORMACIONES.map((t) => ({
  clase: `${t.id}-declarada`,
  aplica: (s) => t.aplica(s, ctxMudo()).html,
  firma: (s) => String(t.diana(s, ctxMudo())),
}));
/** Qué significa cada clase. Una que no esté aquí es roja por no estar adjudicada. */
const CLASES = {
  ...Object.fromEntries(TRANSFORMACIONES.map((t) => [`${t.id}-declarada`, ["dato", `transformación declarada §3.2 — ${t.titulo.slice(0, 64)}`]])),
  espacio: ["dato", "la transcripción está indentada a mano y el corpus no (§PASO 2)"],
  "cierre-xhtml": ["dato", "el original sirve `<br />`; la transcripción normalizó a `<br>` (§PASO 2)"],
  "espacio-duro": ["dato", "el original sirve U+00A0 crudo; la transcripción lo escapó a `&nbsp;` (§PASO 2)"],
  "media-original": ["DEFECTO", "§Assets: nunca hotlink a kunakair.com — §DATOS-MEDIA-HOTLINK"],
  href: ["DEFECTO", "difieren DESPUÉS de plegar T7, así que no lo explica T7"],
  target: ["DEFECTO", "difieren DESPUÉS de plegar T7"],
  "SIN CLASIFICAR": ["DEFECTO", "ninguna regla escrita la cubre"],
};

const control = [];
const serializacion = [];
const cmp = (slug, campo, leido, esperado, rico = false) => {
  if (!rico) {
    const a = JSON.stringify(leido ?? null), b = JSON.stringify(esperado ?? null);
    if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null, clases: ["valor"] });
    return;
  }
  const r = clasificaDiscrepancia(leido, esperado, PLIEGUES_PIPELINE);
  const defectos = r.clases.filter((c) => (CLASES[c]?.[0] ?? "DEFECTO") === "DEFECTO");
  if (!defectos.length) {
    if (r.clases.length) serializacion.push({ slug, campo, clases: r.clases });
    return;
  }
  control.push({
    slug, campo, clases: r.clases, defectos,
    leido: typeof leido === "string" ? leido.slice(0, 400) : (leido ?? null),
    esperado: typeof esperado === "string" ? esperado.slice(0, 400) : (esperado ?? null),
  });
};
const porSlug = (col) => new Map(salida[col].map((d) => [d.slug, d]));

const casos = porSlug("casos");
let nControl = 0;
for (const e of LIB_CASOS.CASOS_PUBLICADOS) {
  const d = casos.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  const esp = SABOTAJE === "control-roto" ? { ...e, titulo: `${e.titulo} ✂` } : e;
  for (const c of ["titulo", "cliente", "imagenCabecera"]) { cmp(e.slug, c, d[c], esp[c]); nControl++; }
  for (const c of ["title", "description", "ogImage"]) { cmp(e.slug, `seo.${c}`, d.seo[c], esp.seo[c]); nControl++; }
  cmp(e.slug, "prefijo", d.prefijo, esp.prefijo); nControl++;
  cmp(e.slug, "sectores", d.sectores?.map((t) => t.slug), esp.sectores?.map((t) => t.slug)); nControl++;
  cmp(e.slug, "soluciones", d.soluciones, esp.soluciones); nControl++;
  cmp(e.slug, "galeria", d.galeria, esp.galeria); nControl++;
  cmp(e.slug, "ubicacionMapa", d.ubicacionMapa, esp.ubicacionMapa); nControl++;
  for (const c of ["usuario", "ubicacion", "anyo"]) { cmp(e.slug, `detalles.${c}`, d.detalles[c], esp.detalles[c]); nControl++; }
  /* Los RICOS, que es lo que `c-inventario` no podía comparar. */
  for (const c of ["necesidad", "solucion", "resultados", "destacado"]) { cmp(e.slug, c, d[c], esp[c], true); nControl++; }
  cmp(e.slug, "detalles.parametros", d.detalles.parametros, esp.detalles.parametros, true); nControl++;
}
const faqs = porSlug("faqs");
for (const e of LIB_FAQS.FAQS_PUBLICADAS) {
  const d = faqs.get(e.slug);
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo); nControl++;
  cmp(e.slug, "seo.title", d.seo.title, e.seo.title); nControl++;
  cmp(e.slug, "cuerpo", d.cuerpo, e.cuerpo, true); nControl++;
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ extractor-c · casos y faqs desde el corpus ════════\n`);
for (const col of GRUPO_C) console.log(`  ${col.padEnd(10)} ${String(salida[col].length).padStart(4)} documentos`);

console.log(`\n  transformación   aplicadas   violaciones`);
for (const t of TRANSFORMACIONES)
  console.log(`  ${t.id.padEnd(16)} ${String(porT[t.id].aplicadas).padStart(6)}   ${porT[t.id].violaciones.length}`);

if (sinRegion.length) console.log(`\n  ⛔ ${sinRegion.length} región(es) obligatoria(s) ausente(s): ${sinRegion.slice(0, 4).join(" · ")}`);
if (rechazosSaneador.length) {
  console.error(`\n  ❌ ${rechazosSaneador.length} región(es) que el SANEADOR rechaza — el alta las tiraría igual:`);
  for (const r of rechazosSaneador.slice(0, 6)) console.error(`     · ${r.documento}.${r.campo}: ${r.veredicto}`);
}

const controlados = LIB_CASOS.CASOS_PUBLICADOS.length + LIB_FAQS.FAQS_PUBLICADAS.length;
console.log(
  `\n  CONTROL · ${nControl} comparaciones sobre ${controlados} documentos transcritos ` +
    `(${LIB_CASOS.CASOS_PUBLICADOS.length} de ${salida.casos.length} casos · ${LIB_FAQS.FAQS_PUBLICADAS.length} de ${salida.faqs.length} faqs): ` +
    `${control.length === 0 ? "✅ TODAS" : `❌ ${control.length} discrepancia(s)`}`,
);
for (const c of control.slice(0, 10))
  console.log(`     · ${c.slug} · ${c.campo}  [${(c.clases ?? []).join("+") || "—"}]\n         leído    ${JSON.stringify(c.leido)?.slice(0, 200)}\n         esperado ${JSON.stringify(c.esperado)?.slice(0, 200)}`);
if (control.length > 10) console.log(`     … y ${control.length - 10} más`);

/* ── El INVENTARIO de clases, igual que en `extractor-a`: se imprime SIEMPRE.
 * «0 discrepancias» sin él no distingue «coinciden» de «coinciden por poco». */
const porClase = new Map();
for (const x of [...serializacion, ...control])
  for (const cl of x.clases ?? ["valor"]) porClase.set(cl, (porClase.get(cl) ?? 0) + 1);
console.log(`\n  INVENTARIO de clases de divergencia sobre los cuerpos ricos controlados:`);
if (!porClase.size) console.log(`     (ninguna)`);
for (const [cl, n] of [...porClase].sort((a, b) => b[1] - a[1])) {
  const [v, porQue] = CLASES[cl] ?? ["DEFECTO", "⛔ CLASE SIN ADJUDICAR: no está en la tabla `CLASES`"];
  console.log(`     ${String(n).padStart(3)} × ${cl.padEnd(16)} ${v === "dato" ? "· dato   " : "⛔ DEFECTO"}  ${porQue}`);
}

if (destacadoExtraido.length)
  console.log(
    `\n  ⚠ ${destacadoExtraido.length} región(es) traían el \`texto-destacado\` ANIDADO y se ha sacado:\n` +
      `     ${destacadoExtraido.join(" · ")}\n` +
      `     Es campo propio del modelo; dejarlo dentro lo pintaría DOS VECES en la página.`,
  );

censo.paginas = salida.casos.length + salida.faqs.length;
const muertos = censo.informe("de campos del grupo C");
const violaciones = TRANSFORMACIONES.reduce((a, t) => a + porT[t.id].violaciones.length, 0);

w("medidas/c-extraido.json", {
  meta: {
    fecha: hoy(),
    que: "el catálogo de CASOS y FAQS extraído del corpus congelado, con T1–T8 por región",
    fuente: "corpus/{casos,faqs} (metadatos y regiones) + TRANSFORMACIONES (las mismas 10 del grupo A)",
    control: `${nControl} comparaciones sobre ${controlados} documentos transcritos a mano`,
    sabotaje: SABOTAJE,
    alcance: {
      controlCasos: `${LIB_CASOS.CASOS_PUBLICADOS.length} de ${salida.casos.length}`,
      controlFaqs: `${LIB_FAQS.FAQS_PUBLICADAS.length} de ${salida.faqs.length}`,
      advertencia:
        "denominador PEQUEÑO: 4 y 2. Lo que compra un control es cuántas FORMAS ejercita — los 4 casos son adversarios por diseño (con/sin galería, sin sector, sin soluciones) — no qué fracción cubre.",
      htmlComparado:
        "con `clasificaDiscrepancia` (qa/lib.mjs), el MISMO instrumento de extractor-a: identidad plegada la serialización y las transformaciones DECLARADAS, y lo que sobrevive sale SIN CLASIFICAR (rojo)",
    },
    noMide: ["no toca el original", "no siembra", "no decide modelo"],
  },
  recuento: { casos: salida.casos.length, faqs: salida.faqs.length },
  transformaciones: Object.fromEntries(TRANSFORMACIONES.map((t) => [t.id, porT[t.id].aplicadas])),
  violaciones: Object.fromEntries(TRANSFORMACIONES.map((t) => [t.id, porT[t.id].violaciones])),
  saneador: rechazosSaneador,
  divergencia: {
    porClase: Object.fromEntries([...porClase].sort((a, b) => b[1] - a[1])),
    adjudicacion: Object.fromEntries(Object.entries(CLASES).map(([k, [v, p]]) => [k, `${v} — ${p}`])),
    serializacion,
    sinClasificar: control.filter((c) => (c.clases ?? []).includes("SIN CLASIFICAR")).map((c) => `${c.slug}.${c.campo}`),
  },
  /** Las regiones de las que se sacó un `texto-destacado` anidado: es campo propio. */
  destacadoExtraido,
  t7: {
    rutasPublicadas: rutas.size,
    fuente: "SÓLO `.next/prerender-manifest.json` (§F2-3-HREF-DERIVADO b)",
    dejadosAlOriginal: noLocalizadas.length,
    porDestino: Object.fromEntries(
      [...noLocalizadas.reduce((m, x) => m.set(x.destino, (m.get(x.destino) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]),
    ),
    relHuerfano,
  },
  control: { comparaciones: nControl, documentos: controlados, poblacion: salida.casos.length + salida.faqs.length, discrepancias: control.length, detalle: control },
  catalogo: salida,
});

if (canarioComido.length)
  console.error(
    `\n❌ T9 SE LLEVÓ UN ENVOLTORIO CON RENDER en ${canarioComido.length} región(es):\n` +
      `     ${canarioComido.join(" · ")}\n` +
      `     Un contenedor cuya clase TIENE regla en el CSS servido no es transporte.\n` +
      `     Es exactamente lo que el discriminador de T9 tiene que impedir.`,
  );

/* Un slug de sector que el catálogo de términos no conoce NO se enriquece a
 * ciegas ni se calla: sería un término embebido a medias otra vez, y esta vez
 * sin que nada lo dijera. */
if (terminosDesconocidos.size)
  console.error(
    `\n❌ TÉRMINO DE SECTOR DESCONOCIDO en ${terminosDesconocidos.size} slug(s): ` +
      `${[...terminosDesconocidos].join(" · ")}.\n` +
      `     El chip los sirve y TERMINOS_SECTOR no los tiene, así que su término se\n` +
      `     embebería SIN paginaSlug sin saber si le toca o no.`,
  );

const rojo =
  control.length > 0 || muertos > 0 || sinRegion.length > 0 || rechazosSaneador.length > 0 ||
  violaciones > 0 || canarioComido.length > 0 || terminosDesconocidos.size > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} extractor-c: ${salida.casos.length} casos · ${salida.faqs.length} faqs · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinRegion.length} sin región · ` +
    `${rechazosSaneador.length} rechazo(s) del saneador · ${violaciones} violación(es) de postcondición\n`,
);
process.exit(rojo ? 2 : 0);
