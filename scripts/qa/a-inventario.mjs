/**
 * INVENTARIO DEL CORPUS ANTES DE EXTRAER — el PASO 1 de la tanda de DATOS.
 * Uso: npm run qa:a-inventario
 * Negativos:
 *   NEG=selector-muerto SABOTAJE=selector-muerto → exit ≠0 (patrón MUERTO)
 *   NEG=control-roto    SABOTAJE=control-roto    → exit ≠0 (el control no casa)
 *
 * ── Qué contesta, y por qué antes y no después ────────────────────────────
 * `D2.7` decide **sembrar el corpus completo**. Antes de escribir un extractor
 * hay que saber **qué hay** y **qué de eso ya sabe leer la maquinaria de F2**,
 * porque lo contrario es descubrirlo a mitad de la extracción:
 *
 *   1 · el RECUENTO por colección, derivado del disco y de `corpus/INDICE.json`
 *       —no heredado de ningún encargo (§sondas 9);
 *   2 · los CAMPOS del tipo medido (`EntradaBlog` …) contra lo que la captura
 *       sirve de verdad, documento a documento. Un campo que el tipo declara y
 *       la captura no trae **no se puede extraer**, y eso es una ficha, no una
 *       sorpresa a mitad de camino;
 *   3 · las TAXONOMÍAS que los listados consumen — sin ellas la población no
 *       basta: una serie de término no puede emitir con la colección llena y
 *       la taxonomía vacía;
 *   4 · los ASSETS que esas páginas referencian contra lo capturado. F3-0 ya
 *       enseñó que **capturar páginas no es capturar assets** (0 de 56 en
 *       `articulos-kb`), así que el hueco se cuenta ANTES.
 *
 * ── El CONTROL, que es lo que hace legible el censo (§sondas 8a) ──────────
 * Los 7 documentos de `src/lib/arquetipo-a.ts` están **transcritos a mano** y
 * verificados contra el original en su día. Esta sonda extrae sus campos de la
 * captura y **los compara contra la transcripción**: si el lector es correcto,
 * tiene que reproducirlos. Sin este control, «149 documentos con taxonomía»
 * sólo dice que un patrón casó 149 veces — no que case **bien**.
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No extrae, no transforma, no siembra y no toca el original. Cuenta y compara.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Censo, Evaluadas, enApp, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

/** Las tres del grupo A: cuerpo en `post_content`, que es lo que el extractor
 * de F2 ya sabe leer. `casos`/`faqs`/`productos` son de builder y su extracción
 * es otra mecánica — se cuentan aparte, no se cuelan en el denominador. */
const GRUPO_A = ["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"];
const DE_BUILDER = ["casos", "faqs", "productos"];

/** La regla del markup: se busca sobre el HTML sin `<script>` ni `<style>` —
 * el CSS de Divi nombra sus propias clases y un selector las encuentra ahí
 * (§sondas 4, tercera cara: el sobre-casado no da error, da un dato de más). */
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

/* ══════════════════════════════════════════════════════════════════════════
 * LOS LECTORES — uno por campo del tipo medido, sobre el HTML servido
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * El `Censo` de `lib.mjs` acumula por selector y decide el veredicto; su
 * `medir()` es para páginas de navegador y aquí no hay ninguna, así que se
 * alimenta **su acumulador** en vez de escribir un contador paralelo — que
 * sería la clase C7 sobre la guarda que existe justo para esto.
 */
const censo = new Censo();
/** Un lector que no case en NINGÚN documento sale por error, nunca por cero
 * (§sondas 4). El sabotaje `selector-muerto` lo ejercita. */
const cuenta = (id, valor) => {
  const vacio = valor === null || valor === undefined || (Array.isArray(valor) && !valor.length);
  censo.total[id] = (censo.total[id] || 0) + (vacio ? 0 : 1);
  return valor;
};

const uno = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};
const deco = (s) =>
  s === null
    ? null
    : s
        .replace(/&#8211;/g, "–").replace(/&#8217;/g, "’").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
        .replace(/&nbsp;/g, " ");

const SEL = {
  titulo: /<h1[^>]*>([\s\S]*?)<\/h1>/,
  seoTitle: /<title>([\s\S]*?)<\/title>/,
  seoDesc: /<meta\s+name="description"\s+content="([^"]*)"/,
  ogImage: /<meta\s+property="og:image"\s+content="([^"]*)"/,
  fechaPub: /<span class="fecha-publicacion">([^<]*)<\/span>/,
  fechaAct: /<span class="fecha-actualizacion">\s*Actualizado\s*([^<]*)<\/span>/,
};

function lee(html) {
  const sin = sinScriptNiStyle(html);
  const termino = (tax) => {
    const re = new RegExp(`href="https://kunakair\\.com/es/${tax}/([^"/]+)/"`, "g");
    return [...new Set([...sin.matchAll(re)].map((m) => m[1]))];
  };
  return {
    titulo: cuenta("titulo", deco(uno(sin, SABOTAJE === "selector-muerto" ? /<h9[^>]*>([\s\S]*?)<\/h9>/ : SEL.titulo)?.replace(/<[^>]+>/g, "") ?? null)),
    seo: {
      title: cuenta("seo.title", deco(uno(html, SEL.seoTitle))),
      description: cuenta("seo.description", deco(uno(html, SEL.seoDesc))),
      ogImage: cuenta("seo.ogImage", uno(html, SEL.ogImage)),
    },
    fechaPublicacion: cuenta("fechaPublicacion", deco(uno(sin, SEL.fechaPub))),
    fechaActualizacion: cuenta("fechaActualizacion", deco(uno(sin, SEL.fechaAct))),
    categorias: cuenta("categorias", termino("categoria")),
    etiquetas: cuenta("etiquetas", termino("etiqueta")),
    recurso: cuenta("recurso", termino("recursos/articulos")),
    cientifica: cuenta("cientifica", termino("scientific-category")),
    relacionados: cuenta("relacionados", /tambi[ée]n te puede interesar/i.test(sin) ? true : null),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL RECORRIDO
 * ═════════════════════════════════════════════════════════════════════════ */

const porColeccion = {};
const documentos = {};
for (const [clave, p] of Object.entries(INDICE.paginas)) {
  const col = clave.split("/")[0];
  if (!GRUPO_A.includes(col)) continue;
  const html = readFileSync(join(CORPUS, p.fichero), "utf8");
  const campos = lee(html);
  const slug = clave.slice(col.length + 1);
  documentos[clave] = { coleccion: col, slug, ...campos };
  porColeccion[col] ??= { n: 0, sinTitulo: 0, sinSeoDesc: 0, sinFecha: 0, conRelacionados: 0 };
  const c = porColeccion[col];
  c.n++;
  if (!campos.titulo) c.sinTitulo++;
  if (!campos.seo.description) c.sinSeoDesc++;
  if (!campos.fechaPublicacion) c.sinFecha++;
  if (campos.relacionados) c.conRelacionados++;
}

const ev = new Evaluadas({ nombre: "a-inventario", unidad: "documentos del grupo A", minimo: 200 });
for (let i = 0; i < Object.keys(documentos).length; i++) ev.ok();

/* ── el recuento del disco, para cruzarlo con el índice (regla 9) ────────── */
const enDisco = {};
for (const col of [...GRUPO_A, ...DE_BUILDER]) {
  const d = join(CORPUS, col);
  enDisco[col] = existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".html")).length : 0;
}

/* ── las taxonomías, censadas sobre la población entera ──────────────────── */
const taxonomias = {};
for (const eje of ["categorias", "etiquetas", "recurso", "cientifica"]) {
  const cuentas = {};
  for (const d of Object.values(documentos)) for (const t of d[eje] ?? []) cuentas[t] = (cuentas[t] || 0) + 1;
  taxonomias[eje] = { terminos: Object.keys(cuentas).length, cuentas: Object.fromEntries(Object.entries(cuentas).sort((a, b) => b[1] - a[1])) };
}

/* ── EL CONTROL: los 7 transcritos a mano tienen que reproducirse ────────── */
const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const tmp = join(QA, ".tmp");
const bundle = join(tmp, "arquetipo-a-inv.mjs");
await esbuild.build({
  entryPoints: [enApp("src/lib/arquetipo-a.ts")],
  outfile: bundle,
  bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "silent",
});
const { pathToFileURL } = await import("node:url");
const LIB = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

const control = [];
for (const e of LIB.ENTRADAS_BLOG) {
  const d = documentos[`entradas-blog/${e.slug}`];
  if (!d) { control.push({ slug: e.slug, campo: "—", mal: "no está en el corpus" }); continue; }
  const esperado = SABOTAJE === "control-roto" ? { ...e, titulo: e.titulo + " ✂" } : e;
  const par = [
    ["titulo", d.titulo, esperado.titulo],
    ["seo.title", d.seo.title, esperado.seo.title],
    ["fechaPublicacion", d.fechaPublicacion, esperado.fechaPublicacion],
    ["categorias", d.categorias.join(","), esperado.categorias.map((t) => t.slug).join(",")],
    ["etiquetas", [...d.etiquetas].sort().join(","), esperado.etiquetas.map((t) => t.slug).sort().join(",")],
    ["recurso", d.recurso[0] ?? null, esperado.recurso?.slug ?? null],
    ["relacionados", d.relacionados === true, esperado.relacionados],
  ];
  for (const [campo, leido, esp] of par)
    if (String(leido ?? "") !== String(esp ?? "")) control.push({ slug: e.slug, campo, leido, esperado: esp });
}

/* ── los ASSETS que el corpus referencia contra lo que hay en disco ────────
 *
 * ⚠ **La primera versión buscaba `/images/uploads/…` sobre la captura CRUDA y
 * daba 0 — un patrón MUERTO con cara de dato** (§sondas 4). `/images/uploads/`
 * es la ruta **ya reescrita por T3b**; lo que la captura sirve es
 * `wp-content/uploads/…`. El cero se leyó como *«no hay assets que capturar»*,
 * que es justo lo contrario de lo que pasa. Por eso el patrón entra ahora **en
 * el censo**: si deja de casar, sale por error y no por cero. */
const publico = join(RAIZ, "apps/web/public");
/** ⚠ El terminador incluye `<` `>` y `,`: sin ellos el patrón se comía el
 * markup de al lado —`…-300.jpg></a></li>`— y **sobre-casaba**, que es la
 * tercera cara de §sondas 4: no da error, da un dato de más. */
const RE_ASSET = SABOTAJE === "selector-muerto" ? /wp-contenido\/subidas\/[^\s"'),<>]+/g : /wp-content\/uploads\/[^\s"'),<>]+/g;
/** ⚠ Y el ámbito es **el CUERPO**, no la página: el cascarón referencia
 * favicons y logos que no son dato de esta migración y que inflarían el hueco.
 * Se usa `postContent()` —la misma que el extractor— en vez de recortar a
 * mano: dos definiciones de «el cuerpo» serían la clase C7. */
const { postContent } = await import("../seed/corpus.mjs");
const referidas = new Set();
for (const [clave, p] of Object.entries(INDICE.paginas)) {
  if (!GRUPO_A.includes(clave.split("/")[0])) continue;
  const cuerpo = postContent(readFileSync(join(CORPUS, p.fichero), "utf8"));
  if (cuerpo === null) continue;
  for (const m of sinScriptNiStyle(cuerpo).matchAll(RE_ASSET)) referidas.add(m[0].split("?")[0]);
}
censo.total["assets(wp-content/uploads)"] = referidas.size;
/** T3b reescribe `wp-content/uploads/…` a `/images/uploads/…`, que es donde el
 * clon los sirve. La comprobación se hace **en la ruta local**, no en la del
 * original: es la que tiene que existir para que el render no dé 404. */
const local = (r) => "/" + r.replace(/^wp-content\/uploads\//, "images/uploads/");
const faltan = [...referidas].filter((r) => !existsSync(join(publico, local(r))));

/**
 * ⚠⚠ **«1174 sin capturar» sería el número mal enmarcado**, y de la misma
 * familia que el `149 vs 142` de `lh-poblacion`: cuenta junto tres cosas con
 * coste muy distinto. Se separan las tres, y sólo la última es un hueco:
 *
 *   · **en `media-corpus/`** — ya capturados y commiteados: sólo hay que
 *     colocarlos, sin tocar el original;
 *   · **VARIANTES `-WxH`** — `qa:media-regenera` decidió NO capturarlas porque
 *     el pipeline real (Payload + sharp) reproduce su dimensión exacta (73/73);
 *   · **ORÍGENES sin capturar** — esto sí es hueco, y necesita una campaña
 *     contra el original que esta tanda **no** hace.
 */
const MEDIA_CORPUS = join(RAIZ, "media-corpus");
const esVariante = (f) => /-\d+x\d+\.[a-z0-9]+$/i.test(f);
const enMediaCorpus = (r) => existsSync(join(MEDIA_CORPUS, r.replace(/^wp-content\/uploads\//, "")));
const reparto = { yaCapturados: [], variantes: [], origenesSinCapturar: [] };
for (const r of faltan) {
  if (enMediaCorpus(r)) reparto.yaCapturados.push(local(r));
  else if (esVariante(r)) reparto.variantes.push(local(r));
  else reparto.origenesSinCapturar.push(local(r));
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ a-inventario · qué hay en el corpus antes de extraer ════════\n`);
console.log(`  colección                 disco   índice   sin título  sin desc  sin fecha  relacionados`);
for (const col of GRUPO_A) {
  const c = porColeccion[col] ?? { n: 0, sinTitulo: 0, sinSeoDesc: 0, sinFecha: 0, conRelacionados: 0 };
  console.log(
    `  ${col.padEnd(24)}${String(enDisco[col]).padStart(6)}${String(c.n).padStart(9)}` +
      `${String(c.sinTitulo).padStart(12)}${String(c.sinSeoDesc).padStart(10)}${String(c.sinFecha).padStart(11)}${String(c.conRelacionados).padStart(14)}`,
  );
}
for (const col of DE_BUILDER)
  console.log(`  ${col.padEnd(24)}${String(enDisco[col]).padStart(6)}        —   ← de BUILDER: sin post_content, extracción = otra mecánica`);

console.log(`\n  taxonomías que los listados consultan:`);
for (const [eje, t] of Object.entries(taxonomias)) {
  const top = Object.entries(t.cuentas).slice(0, 4).map(([k, v]) => `${k}(${v})`).join(" · ");
  console.log(`    ${eje.padEnd(14)} ${String(t.terminos).padStart(3)} términos   ${top}${t.terminos > 4 ? " …" : ""}`);
}

console.log(`\n  CONTROL · los ${LIB.ENTRADAS_BLOG.length} transcritos a mano reproducidos desde la captura: ` +
  `${control.length === 0 ? "✅ los 7 × 7 campos" : `❌ ${control.length} discrepancia(s)`}`);
for (const c of control.slice(0, 8)) console.log(`     · ${c.slug} · ${c.campo}: leído ${JSON.stringify(c.leido)} ≠ esperado ${JSON.stringify(c.esperado)}`);

console.log(`\n  assets del CUERPO de las ${Object.keys(documentos).length} páginas: ${referidas.size} referenciados · ${referidas.size - faltan.length} ya en public/`);
console.log(`    de los ${faltan.length} que faltan, y NO son la misma cosa:`);
console.log(`      · ${String(reparto.yaCapturados.length).padStart(4)} ya están en media-corpus/  → colocar, sin tocar el original`);
console.log(`      · ${String(reparto.variantes.length).padStart(4)} son VARIANTES -WxH        → las regenera sharp (qa:media-regenera, 73/73)`);
console.log(`      · ${String(reparto.origenesSinCapturar.length).padStart(4)} son ORÍGENES sin capturar → ESTO es el hueco, y necesita campaña`);
for (const f of reparto.origenesSinCapturar.slice(0, 6)) console.log(`          ${f}`);
if (reparto.origenesSinCapturar.length > 6) console.log(`          … y ${reparto.origenesSinCapturar.length - 6} más`);

censo.paginas = Object.keys(documentos).length;
const muertos = censo.informe("de campos");

w("medidas/a-inventario.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿qué trae el corpus congelado, y qué de eso sabe leer ya la maquinaria de F2?",
    fuente: "corpus/ (captura congelada de F2-2) + src/lib/arquetipo-a.ts como CONTROL",
    sabotaje: SABOTAJE,
    noMide: [
      "no extrae, no transforma, no siembra",
      "no abre el original: todo sale de la captura",
      "casos/faqs/productos: contados, no leídos — son de builder",
    ],
  },
  enDisco,
  porColeccion,
  taxonomias,
  control: { discrepancias: control.length, detalle: control },
  assets: {
    referenciados: referidas.size,
    yaEnPublico: referidas.size - faltan.length,
    faltanEnPublico: faltan.length,
    reparto: {
      yaCapturadosEnMediaCorpus: reparto.yaCapturados.length,
      variantesQueRegeneraSharp: reparto.variantes.length,
      origenesSinCapturar: reparto.origenesSinCapturar.length,
    },
    origenesSinCapturar: reparto.origenesSinCapturar.sort(),
  },
  documentos,
});

const rojo = control.length > 0 || muertos > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} a-inventario: ${Object.keys(documentos).length} documentos del grupo A leídos · ` +
    `${control.length} discrepancia(s) contra la transcripción · ${muertos} lector(es) muerto(s)\n`,
);
process.exit(rojo ? 2 : 0);
