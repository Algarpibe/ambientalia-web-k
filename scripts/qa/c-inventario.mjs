/**
 * INVENTARIO DEL CORPUS DEL GRUPO C — el PASO 0 de la 2.ª mitad de la tanda.
 * Uso: npm run qa:c-inventario
 * Negativos:
 *   SABOTAJE=selector-muerto → exit ≠0 (lector MUERTO)
 *   SABOTAJE=control-roto    → exit ≠0 (el control deja de reproducir)
 *   SABOTAJE=campo-inventado → exit ≠0 (un campo del esquema sin lector)
 *
 * ── Qué contesta, y por qué existe ────────────────────────────────────────
 * La tanda anterior dimensionó las TRES colecciones del grupo A y dejó las dos
 * del grupo C **sin mencionar**. `CLAUDE.md` §sondas 4: *«no encontrar nada y
 * no mirar nada dan la misma salida»* — aplicado al **encargo**: «casos y faqs
 * no tienen bloqueo» y «a casos y faqs no los miró nadie» se leían igual.
 *
 * Esta sonda pone el número, aunque el número sea cero, en cuatro ejes:
 *
 *   1 · **el camino de extracción** que les toca — derivado del corpus, no
 *       supuesto: `conPostContent` es **0 en 57 y 0 en 19** (`corpus/INDICE.json`),
 *       así que `cms:extractor` los declara FUERA con razón y `cms:extractor-a`
 *       no puede leerlos: su entrada es `corpus/transformado/`, que no los tiene;
 *   2 · **qué campos pide su esquema** — DERIVADO de `colecciones.ts` con
 *       esbuild, no tecleado. Un campo nuevo en el esquema aparece solo aquí, y
 *       si no tiene lector la sonda **sale roja** (§regla 9: se deriva, no se
 *       recuerda);
 *   3 · **qué trae el corpus congelado** — un lector por campo sobre el HTML
 *       servido, contado documento a documento;
 *   4 · **qué falta** — la diferencia, por campo, con su denominador.
 *
 * ── El CONTROL, que es lo que convierte el censo en medida (§sondas 8a) ────
 * `src/lib/casos.ts` trae **4** casos y `src/lib/faqs.ts` **2** faqs transcritos
 * a mano y verificados contra el original en su día. Los lectores tienen que
 * reproducirlos. **El denominador es pequeño y se dice**: 4 de 57 (7 %) y 2 de
 * 19 (10.5 %) — un extractor validado contra n=4 no está validado igual que uno
 * validado contra 14, que es lo que tuvo el grupo A.
 *
 * ── Los DOS canales, porque uno de ellos no está en el marcado ─────────────
 * `imagenCabecera` **no se sirve como atributo**: Divi la COMPILA a CSS y la
 * sirve en el `<style>` del propio documento
 * (`.et_pb_section_0_tb_header{background-image:…url(…)}`). Es §*la salida
 * servida incluye el CSS que el documento se trae*, y por eso su lector mira el
 * `<style>` **a propósito** mientras todos los demás miran el HTML **sin**
 * `<script>` ni `<style>` (la regla del markup).
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No extrae, no transforma, no siembra y **no toca el original**: todo sale de
 * la captura congelada. Los cuerpos ricos se cuentan y se miden en bytes, pero
 * **no se comparan verbatim** contra la transcripción: eso exige el pipeline
 * T1–T8 (`cms:extractor`), que es trabajo del extractor y no de un inventario.
 * Declararlo es la mitad del §alcance que a la campaña anterior le faltó.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Censo, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["selector-muerto", "control-roto", "campo-inventado"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const GRUPO_C = ["casos", "faqs"];

/* ══════════════════════════════════════════════════════════════════════════
 * UTILIDADES DE LECTURA
 * ═════════════════════════════════════════════════════════════════════════ */

/** La regla del markup: el CSS de Divi nombra sus propias clases. */
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
const textoPlano = (s) => (s === null || s === undefined ? s : deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")));
const attr = (tag, n) => { const m = tag.match(new RegExp(`${n}="([^"]*)"`)); return m ? m[1] : null; };

/** T3b: la ruta del original pasa a la local que sirve el clon. */
const rutaLocalMedia = (u) =>
  u === null || u === undefined
    ? u
    : u.replace(/^https?:\/\/kunakair\.com\/wp-content\/uploads\//, "/images/uploads/").replace(/^\/wp-content\/uploads\//, "/images/uploads/");

/** Recorta desde `desde` hasta `hasta`, o `null` si no está el ancla. */
function entre(h, desde, hasta) {
  const i = h.indexOf(desde);
  if (i < 0) return null;
  const j = hasta ? h.indexOf(hasta, i + desde.length) : -1;
  return h.slice(i, j < 0 ? undefined : j);
}

const censo = new Censo();
const cuenta = (id, v) => {
  const vacio = v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length);
  censo.total[id] = (censo.total[id] || 0) + (vacio ? 0 : 1);
  return v;
};

/* ══════════════════════════════════════════════════════════════════════════
 * LOS LECTORES DEL CASO
 *
 * ⚠ **El ámbito se acota al `<article>` PROPIO antes de leer nada.** El aside
 * «Otros casos» del pie trae 3 teasers con `case-cliente`, `case-title` y
 * `case-sectores` **del otro caso**, así que un lector global casaría 4 veces y
 * devolvería el primero por azar de orden — §sondas 4, tercera cara: el
 * sobre-casado no da error, da un dato de más. Medido: 4 `case-cliente` por
 * página, de los cuales **1** es del documento.
 * ═════════════════════════════════════════════════════════════════════════ */

const CASO_SEL = {
  articulo: /<article id="post-\d+"[^>]*class="[^"]*case-studies[^"]*"[\s\S]*?(?=<aside class="container case-list")/,
  titulo: /<h1 class="entry-title">([\s\S]*?)<\/h1>/,
  cliente: /<div class="case-cliente">([\s\S]*?)<\/div>/,
  necesidad: /class="entry-content entry-content-need"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  solucion: /class="entry-content entry-content-solution"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  resultados: /class="entry-content entry-content-results"[\s\S]*?<div class="entry-content-bloque">([\s\S]*?)<\/div>\s*<\/div>/,
  destacado: /<div class="texto-destacado">([\s\S]*?)<\/div>/,
  mapa: /<div class="marker" data-lat="([-\d.]+)" data-lng="([-\d.]+)"/,
};

/**
 * `imagenCabecera` — el ÚNICO lector que mira el `<style>`, y a propósito.
 * Divi compila la foto de la banda a `background-image` con un degradado
 * delante, así que se toma **la última `url()`** de la regla.
 */
function imagenCabeceraDe(crudo) {
  const regla = uno(crudo, /\.et_pb_section_0_tb_header\s*\{([^}]*)\}/);
  if (!regla) return null;
  const urls = [...regla.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/^['"]|['"]$/g, ""));
  return urls.length ? rutaLocalMedia(urls[urls.length - 1]) : null;
}

/** Los términos de sector del documento: `href="…/es/sector/<slug>/"`. */
function sectoresDe(art) {
  const bloque = entre(art, '<div class="case-taxonomies">', "</div>");
  if (!bloque) return [];
  const m = new Map();
  for (const x of bloque.matchAll(/href="https:\/\/kunakair\.com\/es\/sector\/([^"/]+)\/"[^>]*>([\s\S]*?)<\/a>/g))
    m.set(x[1], textoPlano(x[2]).trim());
  return [...m].map(([slug, nombre]) => ({ slug, nombre }));
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

/**
 * Los seis rótulos de «Detalles del proyecto».
 *
 * ⚠ `Parámetros:` es el que tiene la trampa que el esquema ya documenta: el
 * original escribe `<p><span>Parámetros:</span><br><ul>…</ul></p>`, y como
 * `<ul>` dentro de `<p>` es HTML inválido el parser cierra el `<p>` antes. Aquí
 * se lee sobre el TEXTO servido (no sobre un DOM), así que la lista sigue
 * dentro del recorte — pero el recorte tiene que llegar **hasta el siguiente
 * rótulo o el fin del bloque**, no hasta el primer `</p>`.
 */
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
    else if (rotulo.startsWith("a")) o.anyo = textoPlano(valor); // Año / Ano
    else if (rotulo.startsWith("par")) o.parametros = valor.replace(/^<br\s*\/?>/i, "").trim();
    else if (rotulo.startsWith("cliente")) o.__cliente = textoPlano(valor);
    else if (rotulo.startsWith("sector")) o.__sector = textoPlano(valor);
  }
  return o;
}

/**
 * Los productos del caso: el `data-id` de cada pestaña de la lista de
 * soluciones.
 *
 * ⚠ **Lo que NO se puede hacer es recortar hasta el primer `</ul>`**, y lo cazó
 * el CONTROL en la primera corrida: el panel de cada producto trae **su propia
 * `<ul>` de ventajas** dentro del `<li>`, así que el recorte moría en el primer
 * producto y devolvía `["monitor-calidad-aire"]` en los tres casos con
 * soluciones. **Un array de UNO es un dato plausible** — ninguna guarda de
 * recuento lo habría visto; sólo comparar contra los 4 transcritos.
 *
 * El discriminador bueno es el propio marcado y no una frontera: la pestaña
 * lleva `data-id="<producto>"` y su panel `data-id="item-<producto>"`. Se
 * quitan los `item-` y se deduplica **conservando el orden**, que es el que el
 * original sirve.
 */
function solucionesDe(art) {
  const sec = entre(art, '<section class="case-soluciones', "</section>");
  if (!sec) return [];
  const ids = [...sec.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]).filter((id) => !id.startsWith("item-"));
  return [...new Set(ids)];
}

function leeCaso(crudo, url) {
  const sin = sinScriptNiStyle(crudo);
  /* El ámbito propio: sin grupo de captura — lo que interesa es la coincidencia
   * entera, desde el `<article>` del documento hasta el aside de «Otros casos». */
  const art = cuenta("caso.articulo", sin.match(CASO_SEL.articulo)?.[0] ?? null);
  const ambito = art ?? "";
  const det = detallesDe(ambito);
  const titRe = SABOTAJE === "selector-muerto" ? /<h9 class="entry-title">([\s\S]*?)<\/h9>/ : CASO_SEL.titulo;
  const mapa = ambito.match(CASO_SEL.mapa);
  const pref = new URL(url).pathname.split("/").filter(Boolean)[1];
  return {
    prefijo: cuenta("caso.prefijo", pref),
    "seo.title": cuenta("seo.title", deco(uno(crudo, /<title>([\s\S]*?)<\/title>/))),
    "seo.description": cuenta("seo.description", deco(uno(crudo, /<meta\s+name="description"\s+content="([^"]*)"/))),
    "seo.ogImage": cuenta("seo.ogImage", rutaLocalMedia(uno(crudo, /<meta\s+property="og:image"\s+content="([^"]*)"/))),
    titulo: cuenta("titulo", textoPlano(uno(ambito, titRe))),
    imagenCabecera: cuenta("caso.imagenCabecera", imagenCabeceraDe(crudo)),
    cliente: cuenta("caso.cliente", textoPlano(uno(ambito, CASO_SEL.cliente))),
    sectores: cuenta("caso.sectores", sectoresDe(ambito)),
    necesidad: cuenta("caso.necesidad", uno(ambito, CASO_SEL.necesidad)?.trim() ?? null),
    solucion: cuenta("caso.solucion", uno(ambito, CASO_SEL.solucion)?.trim() ?? null),
    resultados: cuenta("caso.resultados", uno(ambito, CASO_SEL.resultados)?.trim() ?? null),
    destacado: cuenta("caso.destacado", uno(ambito, CASO_SEL.destacado)?.trim() ?? null),
    galeria: cuenta("caso.galeria", galeriaDe(ambito)),
    "detalles.usuario": cuenta("caso.detalles.usuario", det.usuario ?? null),
    "detalles.ubicacion": cuenta("caso.detalles.ubicacion", det.ubicacion ?? null),
    "detalles.anyo": cuenta("caso.detalles.anyo", det.anyo ?? null),
    "detalles.parametros": cuenta("caso.detalles.parametros", det.parametros ?? null),
    /* Aplanado a `lat`/`lng` porque así lo declara el esquema (un `group` con
     * dos campos), y la cobertura se cruza con el esquema campo a campo. */
    "ubicacionMapa.lat": cuenta("caso.ubicacionMapa", mapa ? Number(mapa[1]) : null),
    "ubicacionMapa.lng": mapa ? Number(mapa[2]) : null,
    soluciones: cuenta("caso.soluciones", solucionesDe(ambito)),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS LECTORES DE LA FAQ — cuatro campos, y el cuerpo es un `entry-content`
 * ═════════════════════════════════════════════════════════════════════════ */

function leeFaq(crudo) {
  const sin = sinScriptNiStyle(crudo);
  const art = entre(sin, '<div class="et_post_meta_wrapper">', "</article>") ?? sin;
  const titRe = SABOTAJE === "selector-muerto" ? /<h9 class="entry-title">([\s\S]*?)<\/h9>/ : /<h1 class="entry-title">([\s\S]*?)<\/h1>/;
  /**
   * ⚠ **`seo.description` y `seo.ogImage` se leen aunque el esquema de `faqs`
   * NO los declare, y el id del censo se COMPARTE con el del caso.** Las dos
   * mitades importan:
   *
   *   · leerlos es lo que convierte *«el esquema dice que no están»* en una
   *     medida independiente — salen **0 de 19**, que es exactamente lo que
   *     `DECISIONES.md` §0 corrigió al recon;
   *   · compartir el id impide el falso positivo de §sondas 4: con un id propio
   *     por colección, ese 0 legítimo saldría como **SELECTOR MUERTO** y
   *     tumbaría la sonda. El selector está **vivo** —casa 53 y 57 veces en los
   *     casos— y su cero en las faqs es una **ausencia medida**, no un lector
   *     equivocado. Son dos afirmaciones distintas y el censo sólo puede
   *     distinguirlas si el denominador es el corpus entero.
   */
  return {
    "seo.title": cuenta("seo.title", deco(uno(crudo, /<title>([\s\S]*?)<\/title>/))),
    "seo.description(fuera de esquema)": cuenta("seo.description", deco(uno(crudo, /<meta\s+name="description"\s+content="([^"]*)"/))),
    "seo.ogImage(fuera de esquema)": cuenta("seo.ogImage", rutaLocalMedia(uno(crudo, /<meta\s+property="og:image"\s+content="([^"]*)"/))),
    titulo: cuenta("titulo", textoPlano(uno(art, titRe))),
    cuerpo: cuenta("faq.cuerpo", uno(art, /<div class="entry-content">([\s\S]*?)<\/div>/)?.trim() ?? null),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const trabajo = Object.entries(INDICE.paginas).filter(([c]) => GRUPO_C.includes(c.split("/")[0]));
const ev = new Evaluadas({ nombre: "c-inventario", unidad: "documentos del grupo C", minimo: trabajo.length });

const documentos = {};
for (const [clave, p] of trabajo) {
  const col = clave.split("/")[0];
  const slug = clave.slice(col.length + 1);
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  documentos[clave] = { coleccion: col, slug, ...(col === "casos" ? leeCaso(crudo, p.url) : leeFaq(crudo)) };
  ev.ok();
}

/* ── el recuento del disco, cruzado con el índice (regla 9) ──────────────── */
const enDisco = {};
for (const col of GRUPO_C) {
  const d = join(CORPUS, col);
  enDisco[col] = existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".html")).length : 0;
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS CAMPOS QUE EL ESQUEMA PIDE — DERIVADOS, no tecleados
 * ═════════════════════════════════════════════════════════════════════════ */

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
mkdirSync(join(QA, ".tmp"), { recursive: true });

const bColec = join(QA, ".tmp", "colecciones-cinv.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/colecciones.ts")],
  outfile: bColec, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const COLEC = await import(`${pathToFileURL(bColec).href}?t=${Date.now()}`);

/** Aplana los campos de una colección a rutas `a.b`, saltando lo que no es dato. */
function camposDe(cfg, prefijo = "") {
  const fuera = new Set(["slug"]); // el slug sale del nombre del fichero, no de un lector
  const out = [];
  for (const f of cfg.fields ?? []) {
    if (!f.name) continue;
    const ruta = prefijo ? `${prefijo}.${f.name}` : f.name;
    if (!prefijo && fuera.has(f.name)) continue;
    if (f.type === "group") out.push(...camposDe(f, ruta));
    else out.push({ ruta, tipo: f.type, requerido: !!f.required });
  }
  return out;
}
/** `seo()` es un grupo compartido; sus subcampos se aplanan igual. */
const CAMPOS = {
  casos: camposDe(COLEC.casos),
  faqs: camposDe(COLEC.faqs),
};
if (SABOTAJE === "campo-inventado") CAMPOS.faqs.push({ ruta: "campoQueNadieLee", tipo: "text", requerido: true });

/* ── la cobertura: por campo, cuántos documentos lo traen ────────────────── */
const cobertura = {};
const sinLector = [];
for (const col of GRUPO_C) {
  const docs = Object.values(documentos).filter((d) => d.coleccion === col);
  cobertura[col] = { n: docs.length, campos: {} };
  for (const c of CAMPOS[col]) {
    if (!(c.ruta in docs[0])) { sinLector.push(`${col}.${c.ruta}`); continue; }
    const traen = docs.filter((d) => {
      const v = d[c.ruta];
      return !(v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length));
    }).length;
    cobertura[col].campos[c.ruta] = { traen, de: docs.length, requerido: c.requerido, tipo: c.tipo };
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CONTROL — los 4 casos y las 2 faqs transcritos a mano
 * ═════════════════════════════════════════════════════════════════════════ */

const bLib = join(QA, ".tmp", "grupo-c-lib.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/casos.ts")],
  outfile: bLib, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
  tsconfig: enApp("tsconfig.json"),
});
const LIB_CASOS = await import(`${pathToFileURL(bLib).href}?t=${Date.now()}`);
const bFaqs = join(QA, ".tmp", "grupo-c-faqs.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/faqs.ts")],
  outfile: bFaqs, bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
  tsconfig: enApp("tsconfig.json"),
});
const LIB_FAQS = await import(`${pathToFileURL(bFaqs).href}?t=${Date.now()}`);

const control = [];
const cmp = (slug, campo, leido, esperado) => {
  const a = JSON.stringify(leido ?? null), b = JSON.stringify(esperado ?? null);
  if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null });
};

/**
 * ⚠ **Los cuerpos ricos NO entran en el control, y eso se declara.** La
 * transcripción de `src/lib` está **ya transformada** (T1–T8: rutas locales,
 * `target="_blank"` retirado en 3 sitios) y el corpus trae el HTML crudo del
 * original. Compararlos verbatim daría discrepancia en los 4 **por diseño**.
 * Lo que se compara aquí son los campos ESCALARES y las LISTAS; el verbatim del
 * cuerpo es control del extractor, cuando lo haya (PASO 6).
 */
const ESCALARES_CASO = ["titulo", "cliente", "imagenCabecera", "seo.title", "seo.description", "seo.ogImage", "detalles.usuario", "detalles.ubicacion", "detalles.anyo"];
let nControl = 0;
for (const e of LIB_CASOS.CASOS_PUBLICADOS) {
  const d = documentos[`casos/${e.slug}`];
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe en el corpus" }); continue; }
  const esp = SABOTAJE === "control-roto" ? { ...e, titulo: `${e.titulo} ✂` } : e;
  const val = (o, r) => r.split(".").reduce((x, k) => x?.[k], o);
  for (const c of ESCALARES_CASO) { cmp(e.slug, c, d[c], val(esp, c)); nControl++; }
  cmp(e.slug, "prefijo", d.prefijo, esp.prefijo ?? "casos-de-exito"); nControl++;
  cmp(e.slug, "sectores", d.sectores.map((t) => t.slug), (esp.sectores ?? []).map((t) => t.slug)); nControl++;
  cmp(e.slug, "soluciones", d.soluciones, esp.soluciones ?? []); nControl++;
  cmp(e.slug, "ubicacionMapa", d["ubicacionMapa.lat"] === null ? null : { lat: d["ubicacionMapa.lat"], lng: d["ubicacionMapa.lng"] }, esp.ubicacionMapa ?? null); nControl++;
  cmp(e.slug, "galeria", d.galeria, esp.galeria ?? []); nControl++;
}
for (const e of LIB_FAQS.FAQS_PUBLICADAS) {
  const d = documentos[`faqs/${e.slug}`];
  if (!d) { control.push({ slug: e.slug, campo: "—", leido: null, esperado: "existe en el corpus" }); continue; }
  cmp(e.slug, "titulo", d.titulo, e.titulo); nControl++;
  cmp(e.slug, "seo.title", d["seo.title"], e.seo.title); nControl++;
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ c-inventario · qué trae el corpus del grupo C ════════\n`);

console.log(`  1 · EL CAMINO DE EXTRACCIÓN, derivado del propio índice:`);
for (const col of GRUPO_C) {
  const r = INDICE.resumen.porColeccion[col] ?? {};
  console.log(
    `     ${col.padEnd(8)} ${String(enDisco[col]).padStart(3)} en disco · ${String(r.paginas ?? 0).padStart(3)} en índice · ` +
      `post_content en ${r.conPostContent ?? 0}/${r.paginas ?? 0} · transformado/${col}: ${existsSync(join(CORPUS, "transformado", col)) ? "sí" : "NO EXISTE"}`,
  );
}
console.log(`     ⇒ ni \`cms:extractor\` (T1–T8) ni \`cms:extractor-a\` los cubren: los dos`);
console.log(`       entran por \`corpus/transformado/\`, que para el grupo C está VACÍO.`);

console.log(`\n  2·3·4 · CAMPOS DEL ESQUEMA (derivados de colecciones.ts) contra el corpus:`);
for (const col of GRUPO_C) {
  const c = cobertura[col];
  console.log(`\n     ── ${col} (${c.n} documentos, ${Object.keys(c.campos).length} campos con lector) ──`);
  for (const [ruta, v] of Object.entries(c.campos)) {
    const falta = v.de - v.traen;
    const marca = v.requerido && falta > 0 ? " ⛔ REQUERIDO y falta" : falta > 0 ? "  ·" : "";
    console.log(`       ${ruta.padEnd(22)} ${String(v.traen).padStart(3)}/${String(v.de).padEnd(3)} ${(v.tipo ?? "").padEnd(12)}${marca}`);
  }
}

if (sinLector.length) {
  console.error(`\n  ❌ ${sinLector.length} campo(s) del esquema SIN LECTOR en esta sonda:`);
  for (const s of sinLector) console.error(`       · ${s}`);
  console.error(`     Un campo que el esquema pide y el inventario no mira sale por ERROR,`);
  console.error(`     nunca por cero: si no, el hueco se lee como «ese campo está cubierto».`);
}

console.log(
  `\n  CONTROL · ${nControl} comparaciones contra la transcripción a mano ` +
    `(${LIB_CASOS.CASOS_PUBLICADOS.length} de ${enDisco.casos} casos = ` +
    `${((LIB_CASOS.CASOS_PUBLICADOS.length / enDisco.casos) * 100).toFixed(1)} % · ` +
    `${LIB_FAQS.FAQS_PUBLICADAS.length} de ${enDisco.faqs} faqs = ` +
    `${((LIB_FAQS.FAQS_PUBLICADAS.length / enDisco.faqs) * 100).toFixed(1)} %):`,
);
console.log(`     ${control.length === 0 ? "✅ TODAS" : `❌ ${control.length} discrepancia(s)`}`);
for (const c of control.slice(0, 12))
  console.log(`       · ${c.slug} · ${c.campo}\n           leído    ${JSON.stringify(c.leido)?.slice(0, 160)}\n           esperado ${JSON.stringify(c.esperado)?.slice(0, 160)}`);
if (control.length > 12) console.log(`       … y ${control.length - 12} más`);

censo.paginas = Object.keys(documentos).length;
const muertos = censo.informe("de campos del grupo C");

w("medidas/c-inventario.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿qué camino de extracción les toca a casos y faqs, qué pide su esquema, qué trae el corpus y qué falta?",
    fuente: "corpus/ (captura congelada) + colecciones.ts (campos, derivados) + src/lib/{casos,faqs}.ts (CONTROL)",
    sabotaje: SABOTAJE,
    alcance: {
      controlCasos: `${LIB_CASOS.CASOS_PUBLICADOS.length} de ${enDisco.casos}`,
      controlFaqs: `${LIB_FAQS.FAQS_PUBLICADAS.length} de ${enDisco.faqs}`,
      advertencia: "un extractor validado contra n=4 NO está validado igual que uno validado contra 14 (grupo A)",
    },
    noMide: [
      "no extrae, no transforma, no siembra",
      "no abre el original: todo sale de la captura congelada",
      "los cuerpos ricos NO se comparan verbatim: eso exige T1–T8 (cms:extractor), que es del extractor",
    ],
  },
  enDisco,
  caminoDeExtraccion: Object.fromEntries(
    GRUPO_C.map((col) => [
      col,
      {
        conPostContent: INDICE.resumen.porColeccion[col]?.conPostContent ?? 0,
        de: INDICE.resumen.porColeccion[col]?.paginas ?? 0,
        transformado: existsSync(join(CORPUS, "transformado", col)),
        veredicto: "extractor NUEVO: ni cms:extractor ni cms:extractor-a lo cubren",
      },
    ]),
  ),
  cobertura,
  camposSinLector: sinLector,
  control: { comparaciones: nControl, discrepancias: control.length, detalle: control },
  documentos,
});

const rojo = control.length > 0 || muertos > 0 || sinLector.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} c-inventario: ${enDisco.casos} casos · ${enDisco.faqs} faqs leídos · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinLector.length} campo(s) sin lector\n`,
);
process.exit(rojo ? 2 : 0);
