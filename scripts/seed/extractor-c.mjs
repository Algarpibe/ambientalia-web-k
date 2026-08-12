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
import { Censo, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["selector-muerto", "control-roto", "region-ausente", "saneador"];
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

/** Las rutas publicadas, para T7: el manifiesto del build + el propio corpus. */
const rutas = new Set();
const manifiesto = enApp(".next/prerender-manifest.json");
if (!existsSync(manifiesto))
  throw new Error(
    "no hay `prerender-manifest.json`: sin build no hay conjunto de rutas publicadas para T7.\n" +
      "  0 rutas daría un T7 «limpio» que no miró nada (la regla del cero).",
  );
for (const r of Object.keys(JSON.parse(readFileSync(manifiesto, "utf8")).routes ?? {})) rutas.add(r);
for (const p of Object.values(INDICE.paginas)) {
  const camino = new URL(p.url).pathname.replace(/^\/es/, "").replace(/\/$/, "");
  rutas.add(camino === "" ? "/" : camino);
}

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

/** Aplica el pipeline a UNA región y devuelve su HTML transformado. */
function transforma(html, clave, campo) {
  if (html === null || html === undefined) return html;
  const ctx = {
    pagina: `${clave}#${campo}`,
    rutas,
    scriptsQuitados: [],
    mediaDelCuerpo: [],
    sinLlaveT3b: [],
    sustitucionesT4b: [],
    payloadIlegible: [],
  };
  let out = html;
  for (const t of TRANSFORMACIONES) {
    const r = t.aplica(out, ctx);
    out = r.html;
    porT[t.id].aplicadas += r.n;
    for (const v of t.post(out, ctx)) porT[t.id].violaciones.push(`${clave}.${campo}: ${v}`);
  }
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

for (const [clave, p] of trabajo) {
  const col = clave.split("/")[0];
  const slug = clave.slice(col.length + 1);
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const sin = sinScriptNiStyle(crudo);

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
      cuerpo: transforma(cuerpo, clave, "cuerpo"),
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
    const bruto = SABOTAJE === "region-ausente" && salida.casos.length === 2 ? null : uno(ambito, SEL[campo])?.trim() ?? null;
    if (bruto === null) { sinRegion.push(`${clave}: ${campo}`); ev.fallo(clave, `sin región \`${campo}\``); }
    regiones[campo] = bruto;
  }
  if (Object.values(regiones).some((v) => v === null)) continue;

  const doc = {
    slug,
    seo,
    titulo: cuenta("caso.titulo", textoPlano(uno(ambito, titRe))),
    imagenCabecera: cuenta("caso.imagenCabecera", imagenCabeceraDe(crudo)),
    cliente: cuenta("caso.cliente", textoPlano(uno(ambito, SEL.cliente))),
    necesidad: transforma(regiones.necesidad, clave, "necesidad"),
    solucion: transforma(regiones.solucion, clave, "solucion"),
    resultados: transforma(regiones.resultados, clave, "resultados"),
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
  if (destacado !== null) doc.destacado = transforma(cuenta("caso.destacado", destacado), clave, "destacado");

  const galeria = cuenta("caso.galeria", galeriaDe(ambito));
  if (galeria.length) doc.galeria = galeria;

  if (det.parametros) doc.detalles.parametros = transforma(cuenta("caso.detalles.parametros", det.parametros), clave, "parametros");
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
 * ⚠ **El HTML se compara NORMALIZANDO EL ESPACIO EN BLANCO, y hay que decirlo.**
 * La transcripción a mano está indentada a mano dentro de una plantilla de JS;
 * el corpus trae la indentación que emite WordPress. Comparar byte a byte
 * mediría **el sangrado del fichero fuente**, no el contenido — y eso no es lo
 * que se está verificando. Lo que sí se compara literal es todo lo demás.
 */
const norm = (s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : s);

const control = [];
const cmp = (slug, campo, leido, esperado, normaliza = false) => {
  const f = normaliza ? norm : (x) => x;
  const a = JSON.stringify(f(leido) ?? null), b = JSON.stringify(f(esperado) ?? null);
  if (a !== b) control.push({ slug, campo, leido: leido ?? null, esperado: esperado ?? null });
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
  console.log(`     · ${c.slug} · ${c.campo}\n         leído    ${JSON.stringify(c.leido)?.slice(0, 200)}\n         esperado ${JSON.stringify(c.esperado)?.slice(0, 200)}`);
if (control.length > 10) console.log(`     … y ${control.length - 10} más`);

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
      htmlComparado: "normalizando espacio en blanco: la transcripción está indentada a mano y el corpus no",
    },
    noMide: ["no toca el original", "no siembra", "no decide modelo"],
  },
  recuento: { casos: salida.casos.length, faqs: salida.faqs.length },
  transformaciones: Object.fromEntries(TRANSFORMACIONES.map((t) => [t.id, porT[t.id].aplicadas])),
  violaciones: Object.fromEntries(TRANSFORMACIONES.map((t) => [t.id, porT[t.id].violaciones])),
  saneador: rechazosSaneador,
  control: { comparaciones: nControl, documentos: controlados, poblacion: salida.casos.length + salida.faqs.length, discrepancias: control.length, detalle: control },
  catalogo: salida,
});

const rojo = control.length > 0 || muertos > 0 || sinRegion.length > 0 || rechazosSaneador.length > 0 || violaciones > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} extractor-c: ${salida.casos.length} casos · ${salida.faqs.length} faqs · ` +
    `${control.length} discrepancia(s) · ${muertos} lector(es) muerto(s) · ${sinRegion.length} sin región · ` +
    `${rechazosSaneador.length} rechazo(s) del saneador · ${violaciones} violación(es) de postcondición\n`,
);
process.exit(rojo ? 2 : 0);
