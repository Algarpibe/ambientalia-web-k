/**
 * EXTRACTOR DE LISTADOS — el dato que la TARJETA y el ARCHIVO DE TÉRMINO traen y
 * que no está en la ficha del documento.
 * Uso: node scripts/seed/extractor-listados.mjs      (npm run cms:extractor-listados)
 *      NEG=<etiqueta> SABOTAJE=<x> node …            (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ SACA, Y POR QUÉ NO ESTABA YA
 *
 * Los extractores anteriores leen **la página del documento**. Estos dos campos
 * no viven ahí: viven en **el listado**, que es otra plantilla.
 *
 * | campo | de dónde | por qué es campo |
 * |---|---|---|
 * | `entradas-blog.extracto` | la tarjeta de `/blog` | **LH-SP10**: `/blog` usa el extracto MANUAL donde existe — 15 de 63 medidos, de 86–102 c, o sea escritos a mano |
 * | `etiquetas.descripcion` | el módulo `et_pb_text_4_tb_body` del archivo | varía entre las 2 instancias medidas ⇒ campo, no plantilla |
 *
 * ── ⚠ LO QUE **NO** SE EXTRAE, Y ES DELIBERADO ───────────────────────────
 * **El extracto de `/etiqueta/*` NO se guarda.** `LH-SP10` midió que el módulo
 * `et_pb_blog` de Divi **ignora el manual** y trunca el contenido a 256–271 c +
 * «...» — o sea que es **DERIVADO**, y guardarlo sería cablear el resultado de
 * una truncación. Se deriva en el render, desde `cuerpo`.
 *
 * Guardar los dos habría sido lo cómodo y habría producido dos campos donde el
 * original tiene uno y una regla; el día que un cuerpo cambiara, el extracto
 * cableado se quedaría atrás **sin que nada fallara**.
 *
 * ── ✅ Y LA JERARQUÍA DE `resources`, QUE HASTA HOY ESTE EXTRACTOR NO TOCABA ──
 * Aquí decía *«`padre` sigue a `null` en las 8 hijas y faltan los 2 términos
 * padre; no es un olvido, es un ESCALÓN declarado»*. **`D2.8` lo cerró el
 * 2026-08-14 decidiendo MODELAR la jerarquía**, así que la pregunta vuelve a
 * ser de extracción y se contesta aquí — §(3).
 *
 * El catálogo de `categorias-recursos` **no puede salir de las entradas**, y
 * ésa es la razón de que faltaran dos términos: `seed.mjs` lo declara
 * TAXONOMÍA DERIVADA (dedupe de `entradas-blog.recurso`), y una taxonomía
 * derivada de sus miembros **no puede ver** (a) un término que ninguna entrada
 * referencia —`articulos`, que sólo existe como PADRE— ni (b) el `padre`
 * mismo, que no viaja en el `{slug, nombre}` embebido.
 *
 * O sea: el hueco no era de esfuerzo, era **de canal**. La jerarquía la declara
 * el ARCHIVO del término, y el archivo es corpus de listados — este fichero.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, w } from "../qa/lib.mjs";

const SABOTAJES = ["sin-corpus", "extracto-vacio", "via4-muerta"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const RAIZ = SABOTAJE === "sin-corpus" ? "corpus/no-existe-este-corpus" : "corpus/fase-3/listados";

/* ── los helpers de HTML, el idioma de los extractores de este repo ──────── */
const sinSS = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");
const deco = (s) =>
  s
    .replace(/&hellip;/g, "…").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&#39;/g, "’").replace(/&quot;/g, '"')
    .replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&#8211;/g, "–")
    .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&#8230;/g, "…");
const plano = (s) => deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
const slugDeHref = (h) => (h ? h.replace(/\/$/, "").split("/").pop() : null);

const paginasDe = (base) => {
  const out = [];
  const i = join(base, "index.html");
  if (existsSync(i)) out.push(i);
  const pd = join(base, "page");
  if (existsSync(pd)) for (const n of readdirSync(pd)) { const f = join(pd, n, "index.html"); if (existsSync(f)) out.push(f); }
  return out;
};

/* ══════════════════════════════════════════════════════════════════════════
 * (1) EL EXTRACTO DE `/blog` — el campo
 * ═════════════════════════════════════════════════════════════════════════ */
const ficherosBlog = existsSync(join(RAIZ, "blog")) ? paginasDe(join(RAIZ, "blog")) : [];
if (!ficherosBlog.length)
  throw new Error(
    `CORPUS AUSENTE: 0 páginas bajo ${join(RAIZ, "blog")}.\n` +
      `  Un cero aquí saldría como «0 extractos extraídos», que es un extractor que\n` +
      `  no encontró nada y uno que no miró dando la misma salida (§sondas 4).`,
  );

/**
 * ⚠ El mínimo se DERIVA de las DOS fuentes que este extractor recorre, no sólo
 * de una. Con `minimo: ficherosBlog.length` la sonda imprimía **29/17**: un
 * numerador que suma páginas de `/blog` **y** archivos de término contra un
 * denominador que sólo cuenta las primeras. `CLAUDE.md` lo dice para la línea de
 * unidades — *un denominador en otra unidad que el numerador es un mínimo que no
 * expresa lo que la sonda afirma*— y aquí el efecto es que **el listón queda por
 * debajo de lo que se recorre**, o sea que perder los 12 términos no lo bajaría
 * de 17 y saldría verde.
 */
const dirsEtq = existsSync(join(RAIZ, "etiqueta"))
  ? readdirSync(join(RAIZ, "etiqueta")).filter((d) => existsSync(join(RAIZ, "etiqueta", d, "index.html")))
  : [];
/**
 * ⚠ Y con la fuente **(3)** el mismo argumento se repite: el listón tiene que
 * contar también los archivos de `resources`, o perderlos enteros no lo bajaría
 * y saldría verde. Se deriva del corpus, no se escribe.
 */
const dirsRecursos = (function contar(d) {
  if (!existsSync(d)) return 0;
  let n = 0;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === "page") continue;
    if (existsSync(join(d, e.name, "index.html"))) n++;
    n += contar(join(d, e.name));
  }
  return n;
})(join(RAIZ, "recursos"));

const ev = new Evaluadas({
  nombre: "extractor-listados",
  unidad: "páginas de corpus leídas",
  minimo: ficherosBlog.length + dirsEtq.length + dirsRecursos,
});

const extractos = new Map();
for (const f of ficherosBlog) {
  const h = sinSS(readFileSync(f, "utf8"));
  for (const a of h.match(/<article[^>]*class="[^"]*et_pb_post[\s\S]*?<\/article>/g) ?? []) {
    const href = a.match(/<h2 class="entry-title">\s*<a href="([^"]+)"/)?.[1] ?? null;
    const slug = slugDeHref(href);
    if (!slug) continue;
    const cuerpo = a.match(/<div class="post-content">([\s\S]*)$/)?.[1] ?? "";
    const texto = SABOTAJE === "extracto-vacio" ? "" : plano(cuerpo);
    if (texto) extractos.set(slug, texto);
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * (2) LA DESCRIPCIÓN DEL TÉRMINO — el campo nuevo
 *
 * ⚠ Se guarda **el HTML interno del módulo, no su texto plano**: el módulo de
 * Divi puede traer `<p>`, `<strong>` y enlaces, y aplanarlo aquí sería tirar
 * estructura que el original sirve — el mismo error que §El principio describe
 * con la TRANSCRIPCIÓN. Lo que decida el ESQUEMA es cosa del esquema; lo que
 * este extractor no puede hacer es perder el dato antes de que se decida.
 * ═════════════════════════════════════════════════════════════════════════ */
const terminos = [];
const dirEtq = join(RAIZ, "etiqueta");
{
  for (const slug of dirsEtq) {
    const f = join(dirEtq, slug, "index.html");
    const h = sinSS(readFileSync(f, "utf8"));
    const nombre = plano(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    /* El módulo `_4_` es el de la descripción; el `_3_` es el del `h1`. */
    const m = h.match(/et_pb_text_4_tb_body[\s\S]*?<div class="et_pb_text_inner">([\s\S]*?)<\/div>\s*<\/div>/);
    const html = (m?.[1] ?? "").trim();
    terminos.push({ slug, nombre, descripcionHtml: html || null, descripcionTexto: plano(html) || null, etiquetasHtml: [...new Set([...html.matchAll(/<(\w+)/g)].map((x) => x[1].toLowerCase()))] });
    ev.ok();
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * (3) LA JERARQUÍA DE `categorias-recursos` — los 10 términos con su `padre`
 *
 * `D2.8` decide MODELAR la jerarquía: `padre` poblado y la ruta compuesta en la
 * plantilla, cero campos nuevos. Lo que falta para eso es el CATÁLOGO, y sale
 * de aquí.
 *
 * ── El discriminador «término» vs «página», y por qué no es el directorio ──
 * Bajo `/es/recursos/` cuelgan **cinco** directorios y sólo **dos** son
 * archivos de término. Los otros tres —`kunakpedia`, `documentos-cientificos`,
 * `preguntas-frecuentes`— son PÁGINAS, y el original lo dice en el `<body>`:
 *
 *   término   `<body class="archive tax-resources term-articulos term-379">`
 *   página    `<body class="page page-child …">`
 *
 * Es la **vía 4** de `qa:lh-jerarquia`, la que separa las dos lecturas que el
 * HANDOFF había dado por inseparables (35/35 términos · 4/4 vecinos página).
 * Filtrar por nombre de directorio sería cablear una lista de tres excepciones
 * que nadie midió.
 *
 * ── El `padre`: DOS vías que tienen que coincidir ─────────────────────────
 * No se elige una, se exigen las dos y se cruzan (§sondas 4bis · un cero que
 * parece dato):
 *
 *   vía A · la URL       — `/recursos/<padre>/<slug>/` tiene 2 segmentos
 *   vía B · la miga      — `<li class="taxonomia padre">` con el href del padre
 *
 * Si discrepan, **tira**: dos canales que dicen cosas distintas sobre la misma
 * relación es exactamente el caso en que elegir uno produce un dato plausible.
 * ═════════════════════════════════════════════════════════════════════════ */
const RE_BODY = /<body[^>]*\bclass="([^"]*)"/;
const RE_OL_MIGA = /<ol class="kunak-breadcrumbs"[\s\S]*?<\/ol>/;
const RE_LI_MIGA = /<li[^>]*>[\s\S]*?<\/li>/g;

/**
 * El trozo del módulo `et_pb_text_<n>_tb_body`, **SIN dejarle cruzar su
 * frontera**.
 *
 * ⚠ **La primera versión lo hizo con `et_pb_text_2_tb_body[\s\S]*?<div
 * class="et_pb_text_inner">(…)`, y en `seminarios-web` —donde ese módulo va
 * VACÍO, sin `et_pb_text_inner`— el `[\s\S]*?` siguió buscando y se trajo el
 * inner del módulo del LISTADO**, dos módulos más abajo. Salida: «10/10 tienen
 * descripción», que es un dato plausible y falso.
 *
 * Es el mismo defecto que la cabecera de `extractor-a.mjs` documenta para
 * `destacada`, y por eso se corta en el siguiente `et_pb_module`/`et_pb_row`.
 */
function trozoDeModulo(h, n) {
  const i = h.search(new RegExp(`<div class="et_pb_module et_pb_text et_pb_text_${n}_tb_body`));
  if (i < 0) return "";
  const resto = h.slice(i);
  const fin = resto.slice(1).search(/<div class="et_pb_(module|row|section)/);
  return fin < 0 ? resto : resto.slice(0, fin + 1);
}

/** Los `index.html` de archivo (sin `/page/N`) bajo un directorio, recursivo. */
function archivosDe(dir, base = "") {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === "page") continue;
    const sub = join(dir, e.name);
    const f = join(sub, "index.html");
    if (existsSync(f)) out.push({ fichero: f, ruta: base ? `${base}/${e.name}` : e.name });
    out.push(...archivosDe(sub, base ? `${base}/${e.name}` : e.name));
  }
  return out;
}

const dirRec = join(RAIZ, "recursos");
const candidatos = archivosDe(dirRec);
const recursos = [];
const noTermino = [];
const conflictos = [];

for (const c of candidatos) {
  const h = sinSS(readFileSync(c.fichero, "utf8"));
  const clases = (h.match(RE_BODY) ?? [, ""])[1];
  /* SABOTAJE `via4-muerta`: el discriminador deja de casar en TODAS ⇒ 0
     términos ⇒ el guarda de abajo tira. Un cero aquí se leería como «recursos
     no tiene taxonomía», que es §sondas 4 con forma de dato. */
  const esTermino = SABOTAJE === "via4-muerta" ? false : /\btax-resources\b/.test(clases) && /\bterm-/.test(clases);
  /* La unidad es «página LEÍDA», y una página que resulta no ser término se ha
     leído igual. Contarla sólo cuando el discriminador dice que sí pondría el
     numerador en una unidad («términos») y el denominador en otra («páginas»). */
  ev.ok();
  if (!esTermino) {
    noTermino.push({ ruta: c.ruta, clasesBody: clases.split(/\s+/).slice(0, 3).join(" ") });
    continue;
  }
  const segmentos = c.ruta.split("/");
  const slug = segmentos[segmentos.length - 1];
  const nombre = plano(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");

  /* vía A · la URL */
  const padrePorUrl = segmentos.length > 1 ? segmentos[segmentos.length - 2] : null;

  /* vía B · la miga, por CLASE — que aquí SÍ está servida (es el archivo). */
  const ol = h.match(RE_OL_MIGA)?.[0] ?? "";
  const li = ol.match(RE_LI_MIGA) ?? [];
  const liPadre = li.find((x) => /class="[^"]*\btaxonomia\b[^"]*\bpadre\b[^"]*"/.test(x));
  const hrefPadre = liPadre?.match(/href="https:\/\/kunakair\.com\/es\/recursos\/([^"]+?)\/"/)?.[1] ?? null;
  const padrePorMiga = hrefPadre ? hrefPadre.split("/").pop() : null;

  if (padrePorUrl !== padrePorMiga)
    conflictos.push({ slug, padrePorUrl, padrePorMiga });

  /**
   * ⚠ **`descripcion` NO se extrae aquí, y la razón se MIDE en vez de
   * afirmarse.** En `etiquetas` el módulo `et_pb_text_4_tb_body` trae texto y
   * por eso es campo. En `resources` el módulo homólogo (`_2_`) trae **los
   * CHIPS de filtro**. Se cuentan los dos, término a término, para que la
   * conclusión salga del denominador y no de haber mirado cuatro.
   */
  const modulo2 = trozoDeModulo(h, 2);
  const inner2 = modulo2.match(/<div class="et_pb_text_inner">([\s\S]*)<\/div>/)?.[1] ?? "";
  const chips = [...inner2.matchAll(/<a href="[^"]*"[^>]*class="button[^"]*"/g)].length;

  recursos.push({
    slug,
    nombre,
    padre: padrePorUrl,
    url: `/es/recursos/${c.ruta}/`,
    segmentos: segmentos.length,
    viaUrl: padrePorUrl,
    viaMiga: padrePorMiga,
    chips,
    /* Lo que quedaría del módulo `_2_` si se le quitan los chips: si es «» en
       todos, ese módulo no lleva descripción y el campo no existe. */
    textoFueraDeLosChips: plano(inner2.replace(/<div class="button-group[\s\S]*<\/div>/, "")),
  });
}

/* ── GUARDA · los dos ceros que engañan ──────────────────────────────────── */
if (!extractos.size)
  throw new Error("0 extractos extraídos de /blog: el selector de tarjeta no casó en ninguna página (§sondas 4).");
if (!terminos.length)
  throw new Error("0 términos leídos de /etiqueta: sin ellos `descripcion` no se puede poblar y su cero se leería como «no tienen».");
if (!recursos.length)
  throw new Error(
    `0 términos de \`resources\` leídos de ${dirRec}: el discriminador del <body>\n` +
      `  (\`tax-resources\` + \`term-\`) no casó en NINGUNO de los ${candidatos.length} archivos.\n` +
      `  Un cero aquí se leería como «recursos no tiene taxonomía» en vez de como «no miré».`,
  );
if (conflictos.length)
  throw new Error(
    `PADRE EN CONFLICTO en ${conflictos.length} término(s): la URL y la miga dicen cosas distintas.\n` +
      conflictos.map((c) => `    · ${c.slug}: url=${c.padrePorUrl} · miga=${c.padrePorMiga}`).join("\n") +
      `\n  Elegir uno de los dos canales daría un \`padre\` PLAUSIBLE. No se elige: se para.`,
  );
/* Un padre nombrado que no existe como término dejaría una relación sin destino
   al sembrar, y el seed moriría lejos de aquí. Se caza donde se sabe. */
const slugsRec = new Set(recursos.map((r) => r.slug));
const huerfanos = recursos.filter((r) => r.padre && !slugsRec.has(r.padre));
if (huerfanos.length)
  throw new Error(
    `PADRE SIN TÉRMINO en ${huerfanos.length}: ${huerfanos.map((r) => `${r.slug}→${r.padre}`).join(" · ")}.\n` +
      `  El catálogo se sembraría con una relación sin destino.`,
  );

const conDescripcion = terminos.filter((t) => t.descripcionHtml);
const etiquetasVistas = [...new Set(terminos.flatMap((t) => t.etiquetasHtml))].sort();

console.log(`\n════════ extractor-listados ════════\n`);
console.log(`  corpus                 ${RAIZ}`);
console.log(`  páginas de /blog       ${ficherosBlog.length}`);
console.log(`  EXTRACTOS extraídos    ${extractos.size}`);
const largos = [...extractos.values()].map((s) => s.length);
console.log(`     longitud            min ${Math.min(...largos)} · max ${Math.max(...largos)} · media ${Math.round(largos.reduce((a, b) => a + b, 0) / largos.length)}`);
console.log(`  TÉRMINOS leídos        ${terminos.length}`);
console.log(`     con descripción     ${conDescripcion.length}`);
console.log(`     etiquetas HTML      ${etiquetasVistas.join(" · ") || "«ninguna»"}`);
for (const t of terminos) console.log(`     · ${t.slug.padEnd(34)} «${(t.descripcionTexto ?? "—").slice(0, 74)}»`);

console.log(`\n  categorias-recursos    ${recursos.length} términos de ${candidatos.length} archivos bajo /recursos/`);
console.log(`     de PRIMER NIVEL     ${recursos.filter((r) => !r.padre).length}   ·  con PADRE  ${recursos.filter((r) => r.padre).length}`);
console.log(`     descartados (PÁGINA, no término, por el <body class>)  ${noTermino.length}`);
for (const p of noTermino) console.log(`        ⨯ ${p.ruta.padEnd(26)} <body class="${p.clasesBody}…">`);
console.log(`     las dos vías del padre coinciden en  ${recursos.length}/${recursos.length}`);
console.log(
  `     con TEXTO fuera de los chips en el módulo _2_  ` +
    `${recursos.filter((r) => r.textoFueraDeLosChips).length}/${recursos.length}  ⇒ ` +
    `${recursos.some((r) => r.textoFueraDeLosChips) ? "⚠ HAY descripción: revisar §2c" : "`descripcion` NO es campo de esta taxonomía"}`,
);
for (const r of recursos)
  console.log(`     · ${r.slug.padEnd(38)} padre=${String(r.padre ?? "—").padEnd(12)} chips=${String(r.chips).padStart(2)}  «${r.nombre}»`);

const salida = {
  meta: {
    fecha: hoy(),
    que: "los dos campos que viven en el LISTADO y no en la ficha del documento",
    corpus: RAIZ,
    noExtrae: [
      "el extracto de /etiqueta/*: LH-SP10 lo midió DERIVADO (Divi trunca el cuerpo a 256-271 c + «...»); " +
        "guardarlo sería cablear el resultado de una truncación",
      "la DESCRIPCIÓN de un término de `resources`: el módulo homólogo al de `etiquetas` (`_2_`) trae los " +
        "CHIPS de filtro y no texto — ver `categoriasRecursos[].textoFueraDeLosChips`, que es el " +
        "denominador de esa afirmación y no una impresión de haber mirado unos cuantos",
    ],
    discriminadorDeTermino:
      "<body class> con `tax-resources` + `term-` (vía 4 de qa:lh-jerarquia). NO el nombre del directorio: " +
      "3 de los 5 directorios bajo /recursos/ son PÁGINAS (`page-child`) y filtrarlos por nombre sería " +
      "cablear una lista de excepciones que nadie midió",
    padreDerivadoPorDosVias: "URL (nº de segmentos) y miga (`<li class=\"taxonomia padre\">`); discrepar TIRA",
    sabotaje: SABOTAJE,
  },
  extractos: Object.fromEntries([...extractos].sort(([a], [b]) => a.localeCompare(b))),
  terminos,
  categoriasRecursos: recursos,
  descartadosNoTermino: noTermino,
  resumen: {
    paginasBlog: ficherosBlog.length,
    extractos: extractos.size,
    terminos: terminos.length,
    terminosConDescripcion: conDescripcion.length,
    etiquetasHtmlEnDescripcion: etiquetasVistas,
    categoriasRecursos: recursos.length,
    categoriasRecursosPrimerNivel: recursos.filter((r) => !r.padre).length,
    categoriasRecursosConPadre: recursos.filter((r) => r.padre).length,
    archivosBajoRecursosDescartadosPorSerPagina: noTermino.length,
  },
};
w("medidas/extractor-listados.json", salida);
console.log(
  `\n✅ ${extractos.size} extractos · ${conDescripcion.length}/${terminos.length} descripciones de término · ` +
    `${recursos.length} categorias-recursos (${recursos.filter((r) => r.padre).length} con padre).`,
);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} páginas de corpus leídas · extractor-listados`);
