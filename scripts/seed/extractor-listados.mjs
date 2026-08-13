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
 * ── ⚠ Y LO QUE ESTE EXTRACTOR **TAMPOCO** TOCA: LA JERARQUÍA DE `resources` ──
 * `padre` sigue a `null` en las 8 hijas y faltan los 2 términos padre. **No es
 * un olvido: es un ESCALÓN declarado** — la comprobación en las dos direcciones
 * dice que el original **SÍ tiene jerarquía** (8/8 migas nombran al padre con su
 * URL, y el padre lista exactamente sus 8 hijas), así que la pregunta que queda
 * no es de extracción. Ficha: `PENDIENTES-QA.md` §F3-LH-JERARQUIA-RECURSOS.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, hoy, w } from "../qa/lib.mjs";

const SABOTAJES = ["sin-corpus", "extracto-vacio"];
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
const ev = new Evaluadas({
  nombre: "extractor-listados",
  unidad: "páginas de corpus leídas",
  minimo: ficherosBlog.length + dirsEtq.length,
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

/* ── GUARDA · los dos ceros que engañan ──────────────────────────────────── */
if (!extractos.size)
  throw new Error("0 extractos extraídos de /blog: el selector de tarjeta no casó en ninguna página (§sondas 4).");
if (!terminos.length)
  throw new Error("0 términos leídos de /etiqueta: sin ellos `descripcion` no se puede poblar y su cero se leería como «no tienen».");

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

const salida = {
  meta: {
    fecha: hoy(),
    que: "los dos campos que viven en el LISTADO y no en la ficha del documento",
    corpus: RAIZ,
    noExtrae: [
      "el extracto de /etiqueta/*: LH-SP10 lo midió DERIVADO (Divi trunca el cuerpo a 256-271 c + «...»); " +
        "guardarlo sería cablear el resultado de una truncación",
      "la jerarquía de `categorias-recursos`: ESCALÓN declarado, el original SÍ la tiene y la pregunta que " +
        "queda no es de extracción (§F3-LH-JERARQUIA-RECURSOS)",
    ],
    sabotaje: SABOTAJE,
  },
  extractos: Object.fromEntries([...extractos].sort(([a], [b]) => a.localeCompare(b))),
  terminos,
  resumen: {
    paginasBlog: ficherosBlog.length,
    extractos: extractos.size,
    terminos: terminos.length,
    terminosConDescripcion: conDescripcion.length,
    etiquetasHtmlEnDescripcion: etiquetasVistas,
  },
};
w("medidas/extractor-listados.json", salida);
console.log(`\n✅ ${extractos.size} extractos · ${conDescripcion.length}/${terminos.length} descripciones de término.`);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} páginas de corpus leídas · extractor-listados`);
