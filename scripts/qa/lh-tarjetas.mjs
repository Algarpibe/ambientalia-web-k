/**
 * LECTURA FINA DE TARJETAS — qué campos pinta cada familia de listado (LH-SP1½).
 * Uso: node scripts/qa/lh-tarjetas.mjs        (npm run qa:lh-tarjetas)
 *       SABOTAJE=1 …                          → test en negativo (escribe aparte)
 *
 * ── Para qué ───────────────────────────────────────────────────────────────
 * La decisión D3 de LH-2 —qué le piden los listados a las entradas del grupo A—
 * no se puede tomar sin saber qué campos muestra una tarjeta. El censo 35/35
 * contó tarjetas; esto lee LOS CAMPOS de las primeras 3 de UNA página por
 * forma (la proyección la fija la plantilla, no la instancia — por eso basta
 * una página por forma y no la muestra entera; el resto de LH-SP1, el
 * esqueleto sección a sección, sigue pendiente).
 *
 * ── Qué extrae por tarjeta, del HTML servido y sin <style>/<script> ────────
 * imagen (con variante -WxH del src) · título+permalink · fecha (.published) ·
 * enlaces de taxonomía dentro de la meta (categoria/ · etiqueta/ · rel=tag) ·
 * extracto (¿termina en «...»?) · autor · huella de taxonomías en las clases
 * del <article> (category-* · tag-* · resources-*).
 *
 * Reglas de la casa: salida congelada (lh-tarjetas.json), patrón muerto = exit
 * 2 (regla 4 con `min`), y SABOTAJE=1 que rompe el patrón de <article> y tiene
 * que salir 2 escribiendo en su propio fichero.
 */
import { Evaluadas, env, hoy, w } from "./lib.mjs";

const ORIGEN = "https://kunakair.com";
const SABOTAJE = !!env("SABOTAJE");

/** Una página por forma (L1 en sus 4 sabores · L2 ×2 · L3 · L4-listado · L5). */
const PAGINAS = [
  { ruta: "/es/blog/", forma: "L1-blog" },
  { ruta: "/es/etiqueta/calidad-del-aire/", forma: "L1-etiqueta" },
  { ruta: "/es/recursos/articulos/contaminacion-urbana/", forma: "L1-resources-hijo" },
  { ruta: "/es/recursos/seminarios-web/", forma: "L1-resources-padre" },
  { ruta: "/es/glosario/", forma: "L2-glosario" },
  { ruta: "/es/preguntas-frecuentes/", forma: "L2-faqs" },
  { ruta: "/es/scientific-category/articulos-cientificos-y-estudios/", forma: "L3-sci" },
  { ruta: "/es/recursos/", forma: "L4-listado-embebido" },
  { ruta: "/es/casos-de-exito/", forma: "L5-casos" },
];

let RE_ARTICLE = /<article\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
if (SABOTAJE) RE_ARTICLE = /<articulo\b[^>]*clase="([^"]*)"[^>]*>([\s\S]*?)<\/articulo>/g;

const soloMarkup = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const baja = async (url) => {
  for (let i = 0; ; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 90000);
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (recon kunak-web-clone)" } });
      clearTimeout(t);
      return { status: r.status, html: await r.text() };
    } catch (e) {
      clearTimeout(t);
      if (i >= 2) return { status: 0, html: "", error: String(e).slice(0, 90) };
    }
  }
};

const leerTarjeta = (clases, cuerpo) => {
  const img = cuerpo.match(/<img[^>]*src="([^"]+)"/);
  const titulo = cuerpo.match(/<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
  const fecha = cuerpo.match(/class="published"[^>]*>([^<]+)</);
  const metaLinks = [...cuerpo.matchAll(/<a href="([^"]*\/(?:categoria|etiqueta|scientific-category|recursos)\/[^"]*)"[^>]*(?:rel="tag")?[^>]*>([^<]+)<\/a>/g)]
    .map((m) => m[1].replace(ORIGEN, ""));
  const extractoM = cuerpo.match(/post-content-inner[^>]*>([\s\S]*?)<\/div>/) || cuerpo.match(/<p[^>]*>((?:(?!<\/p>)[\s\S])*?)<\/p>\s*(?:<a[^>]*>(?:leer|read|ver)|$)/i);
  const extracto = extractoM ? texto(extractoM[1]) : null;
  return {
    imagen: img ? { variante: (img[1].match(/-(\d+x\d+)\.\w+$/) || [])[1] || "original" } : null,
    titulo: titulo ? { tag: (cuerpo.match(/<(h\d)[^>]*entry-title/) || [])[1], txt: texto(titulo[2]).slice(0, 60), href: titulo[1].replace(ORIGEN, "") } : null,
    fecha: fecha ? fecha[1].trim() : null,
    taxEnMeta: metaLinks.slice(0, 4),
    extracto: extracto ? { chars: extracto.length, terminaEnPuntos: /\.\.\.$|…$/.test(extracto), arranque: extracto.slice(0, 60) } : null,
    autor: /\/author\/|class="author/.test(cuerpo),
    leerMas: (cuerpo.match(/<a[^>]*>((?:leer más|read more|ver más)[^<]*)<\/a>/i) || [])[1] || null,
    /** huella de taxonomías en las clases del propio <article> */
    taxEnClases: {
      category: [...clases.matchAll(/\bcategory-([\w-]+)/g)].map((m) => m[1]),
      tag: [...clases.matchAll(/\btag-([\w-]+)/g)].map((m) => m[1]),
      resources: [...clases.matchAll(/\bresources-([\w-]+)/g)].map((m) => m[1]),
      type: (clases.match(/\btype-([\w-]+)/) || [])[1] || null,
    },
  };
};

const salida = { meta: { fecha: hoy(), sabotaje: SABOTAJE, paginas: PAGINAS.length }, paginas: {} };
let sinArticulos = 0;
let fallos = 0;

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "lh-tarjetas", unidad: "páginas", minimo: PAGINAS.length });
for (const P of PAGINAS) {
  const r = await baja(ORIGEN + P.ruta);
  if (r.status !== 200) {
    fallos++;
    salida.paginas[P.ruta] = { forma: P.forma, error: r.error || `HTTP ${r.status}` };
    console.log(`  ⚠ ${P.ruta} → ${r.status}`);
    continue;
  }
  const html = soloMarkup(r.html);
  /** El wrapper de la propia página (type-page) no es una tarjeta — defecto 3 del censo. */
  const articulos = [...html.matchAll(RE_ARTICLE)].filter(([, cls]) => !/\btype-page\b/.test(cls));
  if (!articulos.length) sinArticulos++;
  salida.paginas[P.ruta] = {
    forma: P.forma,
    nTarjetas: articulos.length,
    tarjetas: articulos.slice(0, 3).map(([, cls, cuerpo]) => leerTarjeta(cls, cuerpo)),
  };
  console.log(`  ✓ ${P.forma.padEnd(20)} ${P.ruta} → ${articulos.length} tarjetas`);
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ── ¿La taxonomía `category` tiene archivo vivo? No está en ningún sitemap ── */
const cat = await baja(`${ORIGEN}/es/categoria/articulos/`);
salida.categoriaArticulos = { status: cat.status, esArchivo: /class="[^"]*\barchive\b/.test(cat.html || "") };
console.log(`\n  /es/categoria/articulos/ → HTTP ${cat.status}${cat.status === 200 ? (salida.categoriaArticulos.esArchivo ? " y ES un archivo" : " pero NO es un archivo") : ""}`);

/* ── informe por forma ── */
console.log(`\n═══ CAMPOS POR FORMA (1.ª tarjeta de cada una)`);
for (const [ruta, v] of Object.entries(salida.paginas)) {
  if (v.error || !v.tarjetas?.length) continue;
  const t = v.tarjetas[0];
  console.log(
    `  ${v.forma.padEnd(20)} img ${t.imagen ? t.imagen.variante.padEnd(9) : "—".padEnd(9)}` +
      ` título ${t.titulo ? t.titulo.tag : "— "} fecha ${t.fecha ? "sí" : "· "} tax-meta ${String(t.taxEnMeta.length)}` +
      ` extracto ${t.extracto ? `${t.extracto.chars}c${t.extracto.terminaEnPuntos ? "…" : " "}` : "—    "}` +
      ` autor ${t.autor ? "sí" : "· "} leerMás ${t.leerMas ? "sí" : "· "}`,
  );
}

const muerto = !SABOTAJE && sinArticulos > 0;
if (muerto) console.error(`\n❌ ${sinArticulos} página(s) con 0 tarjetas — en estas 9 eso es el patrón roto, no el sitio (todas listan).`);
if (SABOTAJE && sinArticulos === PAGINAS.length - fallos) console.error(`\n❌ SABOTAJE: 0 tarjetas en todas — la sonda sabe fallar.`);

w(`medidas/lh-tarjetas${SABOTAJE ? "-SABOTAJE" : ""}.json`, salida);
process.exit(muerto || fallos || (SABOTAJE && sinArticulos) ? 2 : 0);
