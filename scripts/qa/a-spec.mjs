/**
 * TRANSCRIPCIÓN VERBATIM DEL MÍNIMO ADVERSARIO — arquetipo A.
 * Uso: npm run qa:a-spec
 * Test en negativo: SABOTAJE=1 npm run qa:a-spec   (rompe un selector → exit 2)
 *
 * Hermana de `c-spec.mjs`, y por la misma razón: **el contenido se lee una vez,
 * se congela, y a partir de ahí se construye desde el fichero, no del original.**
 * El original es un sitio vivo (`CLAUDE.md` §ruido) y volver a él cada vez que
 * hace falta un texto es cómo se cuelan diferencias que nadie sabe de dónde
 * salen.
 *
 * ── Del HTML SERVIDO, no del DOM. Y aquí no es una preferencia ────────────
 * `campo-rico.spec.md` §4 lo midió: los `id` de los `h2` **no están en el HTML
 * servido y sí en el DOM** —los pone el JS del tema, 8 páginas sin excepción—.
 * Transcribir del DOM metería en el campo rico 16 `id` por página que el
 * contenido no tiene, y `ESQUEMA-CMS.md` §T6 dice justo lo contrario: el `id`
 * **se regenera, no se conserva**. O sea que leer del DOM no sería «casi igual»:
 * sería importar como contenido algo que es comportamiento del tema.
 *
 * Por eso esta sonda **no abre navegador**. `fetch` y parseo, como `a-censo`.
 *
 * ── La muestra no la elijo aquí ───────────────────────────────────────────
 * Sale de `medidas/a-muestra.json`, que la eligió una regla pre-registrada
 * (`PLAN-MUESTREO.md` §3) **antes de mirar un solo contenido**. Aquí solo se
 * declara el SUBCONJUNTO que se transcribe, y con su razón escrita al lado —
 * las 209 se pueblan en F2-2 con el extractor, y transcribir a mano lo que un
 * extractor va a rehacer es trabajo tirado.
 *
 * ── El `<style>` que se hace pasar por marcado ────────────────────────────
 * Divi emite una regla CSS **por módulo**, con esas mismas clases dentro, en un
 * `<style>` de la propia página. Buscar `et_pb_text_1_tb_body` a pelo casa
 * primero con el CSS. `a-censo.mjs` ya se comió ese fallo —firmas con la cola
 * repetida decenas de veces, sin dar error— y `lh-censo` lo volvió a comer con
 * `post_content` casando en las 35.
 *
 * Aquí se resuelve **cegando los `<style>` con espacios de la misma longitud**,
 * para que los índices del texto sigan valiendo y la extracción no se desplace.
 * Los `<script>` NO se ciegan: en una de las instancias el `<script>` está
 * **dentro** del contenido (15/209, §3.3) y es justo el payload que se quiere
 * transcribir.
 */
import { Evaluadas, w } from "./lib.mjs";

const DORMIR = Number(process.env.DORMIR || 400); // cortesía con el sitio vivo
const SABOTAJE = !!process.env.SABOTAJE;

/* ══════════════════════════ el mínimo adversario ═══════════════════════════
 * 13 instancias de las 24 de `a-muestra.json`. Cada una entra por un eje que
 * puede ROMPER la plantilla, no por ser representativa — el criterio de
 * `PLAN-MUESTREO.md` §0: lo que rompe un arquetipo son los extremos y los
 * payloads raros, y ninguno aparece en la instancia para la que se construyó.
 * ═════════════════════════════════════════════════════════════════════════ */
const MUESTRA = [
  // ── blog: 7 de 12. Las dos firmas del §2 (83 con relacionados · 66 sin) ──
  { forma: "blog", slug: "contaminacion-por-metano", eje: "la MÁS LARGA de las 209 (69 784 ch) · embebido · firma CON relacionados" },
  { forma: "blog", slug: "todas-nuestras-soluciones-en-el-iotswc", eje: "la MÁS CORTA de las 209 (275 ch) · firma SIN relacionados" },
  { forma: "blog", slug: "monitorizacion-de-la-calidad-del-aire-en-centros-de-datos", eje: "tabla (§3.4 abierta) + cita" },
  { forma: "blog", slug: "contador-particulas-suspension-movilidad-sostenible", eje: "galería · y es la MEDIANA exacta de blog (6 347 ch)" },
  { forma: "blog", slug: "monitorizacion-de-emisiones-del-trafico-urbano", eje: "vídeo (§3.1b: el nodo que a la whitelist le faltaba)" },
  { forma: "blog", slug: "running-for-clean-air", eje: "`<script>` DENTRO del cuerpo (15/209) — el payload que §3.3 prohíbe" },
  { forma: "blog", slug: "la-contaminacion-del-aire-el-asesino-silencioso-de-europa", eje: "más variedad interna: 26 etiquetas distintas" },

  // ── término: 3 de 6 ──────────────────────────────────────────────────────
  { forma: "termino", slug: "cloruro-de-hidrogeno-hcl", eje: "la más larga del glosario (50 640) · tabla (49 % de los términos)" },
  { forma: "termino", slug: "emisiones-atmosfericas", eje: "la más corta del glosario (5 651)" },
  { forma: "termino", slug: "metano", eje: "embebido · y comprueba que `metano` NO colisiona con `contaminacion-por-metano`" },

  // ── documento científico: 4 de 6, y DOS entran por la RUTA ───────────────
  // ⚠ Las tres rutas se copian de `a-muestra.json`, no se escriben a mano: la
  // primera corrida las inventó de memoria y dos dieron **404**. Es el mismo
  // tropiezo que `a-cascaron.mjs` ya anota en su cabecera.
  {
    forma: "doc-cientifico",
    ruta: "recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo",
    eje: "la más larga de la forma (2 646) · prefijo mayoritario (14/23)",
  },
  {
    forma: "doc-cientifico",
    ruta: "recursos/documentos-cientificos/articulos-cientificos-y-estudios/idoneidad-de-una-red-de-comunicaciones-moviles-para-realizar-mediciones-de-la-calidad-del-aire-de-alta-resolucion",
    eje: "la más corta de la forma (675)",
  },
  {
    forma: "doc-cientifico",
    ruta: "recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023",
    eje: "SEGUNDO prefijo (8/23) — `evaluaciones-independientes`",
  },
  {
    forma: "doc-cientifico",
    ruta: "recursos/estudios-cientificos/articulos-tecnicos/soluciones-avanzadas-de-monitorizacion",
    eje: "TERCER prefijo, y es 1 de 23: `estudios-cientificos/articulos-tecnicos` — la que rompe «un prefijo fijo, una plantilla»",
  },
];

const url = (m) => `https://kunakair.com/es/${m.ruta ?? m.slug}/`;

/* ═══════════════════════════ extracción, sin DOM ═══════════════════════════ */

/** Ciega los `<style>` con espacios de la MISMA longitud: los índices siguen valiendo. */
function cegarEstilos(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, (s) => " ".repeat(s.length));
}

/** Interior de un elemento a partir de su apertura, emparejando aperturas y cierres. */
function interior(html, desdeApertura, etiqueta = "div") {
  const fin = html.indexOf(">", desdeApertura);
  if (fin < 0) return null;
  const re = new RegExp(`<(/?)${etiqueta}\\b`, "gi");
  re.lastIndex = fin + 1;
  let nivel = 1;
  let m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}

/**
 * Zona útil: de `id="main-content"` al `<footer>`, con los `<style>` cegados.
 * Los `<script>` se conservan — uno de ellos ES el contenido que se transcribe.
 */
function zona(html) {
  const i = html.indexOf('id="main-content"');
  if (i < 0) return null;
  const j = html.indexOf("<footer", i);
  return cegarEstilos(html.slice(i, j > 0 ? j : undefined));
}

/** Interior del módulo `et_pb_<tipo>_<n>_tb_body`, o `null` si no está. */
function modulo(z, tipo, n) {
  const re = new RegExp(`<div[^>]*\\bclass="[^"]*\\bet_pb_${tipo}_${n}_tb_body\\b[^"]*"`, "i");
  const m = re.exec(z);
  return m ? interior(z, m.index) : null;
}

/** Interior de `et_pb_text_inner` dentro de un módulo de texto. */
function textoInterno(htmlModulo) {
  if (htmlModulo == null) return null;
  const m = /<div[^>]*\bclass="[^"]*\bet_pb_text_inner\b[^"]*"/i.exec(htmlModulo);
  return m ? interior(htmlModulo, m.index) : htmlModulo;
}

const texto = (h) =>
  h == null
    ? null
    : h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const meta = (html, re) => (re.exec(html) || [])[1] ?? null;

/** Primer `<img>` de un fragmento, con lo que hace falta para M-IMG (§CMS-0b). */
function imagen(h) {
  if (!h) return null;
  const m = /<img\b[^>]*>/i.exec(h);
  if (!m) return null;
  const at = (n) => (new RegExp(`\\b${n}="([^"]*)"`, "i").exec(m[0]) || [])[1] ?? null;
  return {
    src: at("src"),
    srcset: at("srcset"),
    sizes: at("sizes"),
    width: at("width"),
    height: at("height"),
    alt: at("alt"),
    clase: at("class"),
  };
}

/** Enlaces `<a>` de un fragmento: {href, label}. */
function enlaces(h) {
  if (!h) return [];
  return [...h.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: m[1],
    label: texto(m[2]),
  }));
}

/* ═════════════ censo de patrones: la guarda de la regla 4 y su gemela ══════
 * Un selector que no casa en NINGUNA página es un defecto (regla 4). Y uno que
 * casa en TODAS cuando su trabajo es discriminar, también (su complementaria,
 * pagada en el recon de listados). Los dos cierran el código de salida.
 * ═════════════════════════════════════════════════════════════════════════ */
const censo = {};
function anota(patron, casó, max = null) {
  const c = (censo[patron] ??= { casó: 0, de: 0, max });
  c.de++;
  if (casó) c.casó++;
}

/* ═══════════════════════════════ recorrido ════════════════════════════════ */

const salida = [];
const fallos = [];

/* Contrato de `Evaluadas` (lib.mjs): el mínimo se declara y por debajo el
 * veredicto es NO SE PUDO EVALUAR con código ≠ 0. Esta sonda no usa
 * `openPage`, así que cuenta ella misma cada unidad completada. */
const ev = new Evaluadas({ nombre: "a-spec", unidad: "páginas de la muestra", minimo: MUESTRA.length });
for (const m of MUESTRA) {
  const u = url(m);
  const res = await fetch(u);
  if (!res.ok) {
    fallos.push({ url: u, http: res.status });
    continue;
  }
  const html = await res.text();
  const z = zona(html);
  if (!z) {
    fallos.push({ url: u, error: "sin #main-content" });
    continue;
  }

  // El sabotaje rompe el nombre del módulo del cuerpo: el patrón pasa a casar
  // en 0 de 13 y la sonda tiene que salir por error, no dar 13 cuerpos vacíos.
  const TIPO_CUERPO = SABOTAJE ? "post_contenido" : "post_content";

  const cuerpo = modulo(z, TIPO_CUERPO, 0);
  anota("post_content#0", cuerpo != null);

  const migas = textoInterno(modulo(z, "text", 0));
  anota("text#0 (migas)", migas != null);

  const titulo = textoInterno(modulo(z, "text", 1));
  anota("text#1 (título)", titulo != null);

  const esBlog = m.forma === "blog";
  const esDoc = m.forma === "doc-cientifico";

  // ── lo que solo tiene el blog (§2.2) ──────────────────────────────────
  const fecha = esBlog ? textoInterno(modulo(z, "text", 2)) : null;
  const taxonomias = esBlog ? textoInterno(modulo(z, "text", 3)) : null;
  const destacadaHtml = esBlog ? modulo(z, "image", 0) : null;
  const autoria = esBlog ? textoInterno(modulo(z, "text", 4)) : null;
  if (esBlog) {
    anota("text#2 (fecha)", fecha != null);
    anota("text#3 (taxonomías)", taxonomias != null);
    anota("image#0 (destacada)", destacadaHtml != null);
    anota("text#4 (autoría)", autoria != null);
  }

  // ── lo que solo tiene el documento científico ─────────────────────────
  const portadaHtml = esDoc ? modulo(z, "image", 0) : null;
  const botonDoc = esDoc
    ? (/<a\b[^>]*\bclass="[^"]*\bet_pb_button_0_tb_body\b[^"]*"[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i.exec(z) ??
       /<a\b[^>]*\bhref="([^"]*)"[^>]*\bclass="[^"]*\bet_pb_button_0_tb_body\b[^"]*"[^>]*>([\s\S]*?)<\/a>/i.exec(z))
    : null;
  const intro = esDoc ? textoInterno(modulo(z, "text", 3)) : null;
  // ⚠ `text#2` del documento científico NO estaba en §2.2: trae **autores y
  // año** («Reche et al. | 2020») más el nombre de su categoría científica.
  // Son campos, y el modelo del recon no los tenía. Se transcribe en crudo.
  const referencia = esDoc ? textoInterno(modulo(z, "text", 2)) : null;
  if (esDoc) {
    anota("image#0 (portada PDF)", portadaHtml != null);
    anota("button#0 (descarga PDF)", botonDoc != null);
    anota("text#2 (autores · año · categoría)", referencia != null);
  }

  // ── la firma: ¿lleva el bloque de relacionados? (83/149 · §2, A-SP1) ──
  // Patrón DISCRIMINANTE: si casara en las 13 no estaría midiendo la firma.
  const relacionados = /\bet_pb_blog_0_tb_body\b/.test(z);
  anota("blog#0 (relacionados) — DISCRIMINANTE", relacionados, MUESTRA.length - 1);

  /**
   * La `section#2` del blog: «También te puede interesar» + 3 botones. Es
   * PLANTILLA —sus textos no dependen de la entrada— pero hay que transcribirla
   * igual: sin ella el cascarón de 83 de las 149 está incompleto.
   *
   * Los 3 posts que lista NO se transcriben a propósito: el original **los
   * sortea en cada carga** (P4), y es la región de ruido de hasta 81 px que
   * `CLAUDE.md` §ruido documenta. Congelar un sorteo sería congelar ruido.
   */
  const bloqueRel = relacionados
    ? {
        textos: [6, 7, 8, 9].map((n) => texto(textoInterno(modulo(z, "text", n)))).filter(Boolean),
        botones: [0, 1, 2]
          .map((n) => {
            const re = new RegExp(
              `<a\\b[^>]*\\bclass="[^"]*\\bet_pb_button_${n}_tb_body\\b[^"]*"[^>]*>([\\s\\S]*?)</a>`,
              "i",
            );
            const mm = re.exec(z);
            if (!mm) return null;
            const href = (/\bhref="([^"]*)"/i.exec(mm[0]) || [])[1] ?? null;
            return { href, label: texto(mm[1]) };
          })
          .filter(Boolean),
      }
    : null;
  if (relacionados) {
    anota("text#6..#9 (rótulos del bloque)", (bloqueRel?.textos.length ?? 0) > 0);
    anota("button#0..#2 (botones del bloque)", (bloqueRel?.botones.length ?? 0) > 0);
  }

  salida.push({
    forma: m.forma,
    slug: m.slug ?? m.ruta.split("/").pop(),
    ruta: m.ruta ?? null,
    url: u,
    eje: m.eje,
    seo: {
      title: meta(html, /<title>([\s\S]*?)<\/title>/i),
      description: meta(html, /<meta[^>]*\bname="description"[^>]*\bcontent="([^"]*)"/i),
      canonical: meta(html, /<link[^>]*\brel="canonical"[^>]*\bhref="([^"]*)"/i),
      ogImage: meta(html, /<meta[^>]*\bproperty="og:image"[^>]*\bcontent="([^"]*)"/i),
    },
    migas: { html: migas, texto: texto(migas), enlaces: enlaces(migas) },
    titulo: texto(titulo),
    fecha: fecha == null ? null : { html: fecha, texto: texto(fecha) },
    taxonomias:
      taxonomias == null ? null : { html: taxonomias, texto: texto(taxonomias), enlaces: enlaces(taxonomias) },
    imagenDestacada: imagen(destacadaHtml),
    autoria: texto(autoria),
    portada: imagen(portadaHtml),
    descargaPdf: botonDoc ? { href: botonDoc[1], label: texto(botonDoc[2]) } : null,
    intro: texto(intro),
    referencia:
      referencia == null
        ? null
        : { html: referencia, texto: texto(referencia), enlaces: enlaces(referencia) },
    relacionados,
    bloqueRelacionados: bloqueRel,
    cuerpo, // ← VERBATIM, del HTML servido. Ni un `id` de `h2` inventado.
    cuerpoChars: cuerpo ? cuerpo.length : 0,
  });

  console.log(
    `  ${m.forma.padEnd(14)} ${(m.slug ?? m.ruta.split("/").pop()).slice(0, 46).padEnd(48)}` +
      ` ${String(cuerpo ? cuerpo.length : 0).padStart(6)} ch  ${relacionados ? "rel" : "   "}`,
  );
  await new Promise((r) => setTimeout(r, DORMIR));
  ev.ok(); // unidad completada — el mínimo lo cobra el gancho de salida
}

/* ═════════════════════════════ veredicto ══════════════════════════════════ */

console.log(`\nCenso de patrones (${salida.length} páginas leídas):`);
let muertos = 0;
let ubicuos = 0;
for (const [p, c] of Object.entries(censo)) {
  const nota =
    c.casó === 0 ? " ← MUERTO" : c.max != null && c.casó > c.max ? ` ← UBICUO (máx ${c.max})` : "";
  if (c.casó === 0) muertos++;
  if (c.max != null && c.casó > c.max) ubicuos++;
  console.log(`  ${p.padEnd(42)} ${String(c.casó).padStart(3)}/${String(c.de).padEnd(3)}${nota}`);
}

if (fallos.length) console.log(`\n⚠ ${fallos.length} página(s) no leídas:`, JSON.stringify(fallos));

w(SABOTAJE ? "medidas/a-spec-SABOTAJE.json" : "medidas/a-spec.json", {
  meta: {
    fecha: new Date().toISOString().slice(0, 10),
    fuente: "HTML servido del original (no el DOM: los `id` de los h2 los pone el tema)",
    muestra: `${salida.length} de las 24 de a-muestra.json`,
    sabotaje: SABOTAJE,
  },
  censo,
  fallos,
  paginas: salida,
});

if (muertos || ubicuos || fallos.length || salida.length === 0) {
  console.error(
    `\n❌ ${muertos} patrón(es) MUERTO(S) · ${ubicuos} UBICUO(S) · ${fallos.length} página(s) sin leer.\n` +
      `   Un patrón que no casa en ninguna página no es un cero, es un selector\n` +
      `   equivocado; uno que casa en todas cuando su trabajo es discriminar\n` +
      `   tampoco mide nada. Las dos cierran este código de salida.\n`,
  );
  process.exit(2);
}
console.log(`\n✅ ${salida.length} instancias transcritas · 0 patrones muertos · 0 ubicuos.`);
