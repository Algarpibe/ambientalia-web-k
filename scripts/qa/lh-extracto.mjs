/**
 * EL EXTRACTO DE LA TARJETA (LH-SP10) Y LA DERIVA CORPUS↔ESPEJO.
 * Uso: node scripts/qa/lh-extracto.mjs            (npm run qa:lh-extracto)
 *      NEG=<etiqueta> SABOTAJE=<x> node …         (negativos)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS DOS PREGUNTAS, Y POR QUÉ VAN EN LA MISMA SONDA
 *
 * Las dos se contestan sobre **el mismo corpus congelado** y las dos deciden
 * qué puede construir `LISTADO-B`. Separarlas obligaría a recorrer 149 HTML dos
 * veces para dar dos números que sólo valen juntos.
 *
 * ── (1) `LH-SP10` — ¿el extracto es MANUAL o DERIVADO? ────────────────────
 * El plan (`PLAN-FASE-3.md` §F3-2) lo lleva como **incógnita** desde LH-2, y la
 * construcción no puede esperar a que se decida: es el texto de la tarjeta.
 *
 * La medida que la contesta no es «mirar un extracto», es **cruzar los dos
 * listados donde el MISMO post aparece con las DOS pieles**: `/blog` (el loop
 * del tema, `the_excerpt()`) y `/etiqueta/*` (el módulo `et_pb_blog` de Divi).
 * Si los dos mecanismos fueran uno, los textos coincidirían.
 *
 * ── (2) LA DERIVA — el clon se siembra del CORPUS y se mide contra el ESPEJO
 * `cms:seed` puebla desde `corpus/fase-3/`, capturado en F3-0; `qa:lh-cmp`
 * compara contra `medidas/lh-spec-{1440,390}.json`, medido **en vivo el
 * 2026-08-11**. Son **dos fotos del original en fechas distintas**, y por tanto:
 *
 *   > **Un Δ de TEXTO entre clon y espejo no distingue «el clon está mal» de
 *   > «el original cambió entre las dos fotos».**
 *
 * Eso no se arregla midiendo más: se arregla **acotándolo**, que es lo que hace
 * esta sonda — cuenta cuántos titulares congelados del espejo siguen siendo los
 * del corpus. Lo que no case es deriva **conocida**, y sale del saco de
 * «defecto» antes de que nadie lo persiga.
 *
 * ⚠ **La sonda NO decide cuál de las dos fotos manda.** Manda el original, y de
 * las dos el espejo es el más reciente; lo que aquí se establece es el
 * **denominador** de la duda, no su resolución.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, hoy, w } from "./lib.mjs";

const SABOTAJES = ["sin-corpus", "mecanismo-unico", "sin-espejo"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const RAIZ = SABOTAJE === "sin-corpus" ? join(QA, "medidas/no-existe-este-corpus") : "corpus/fase-3/listados";

/* ── Helpers de HTML, el idioma de los extractores de este repo ───────────── */
const sinSS = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ");
const deco = (s) =>
  s
    .replace(/&hellip;/g, "…").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&#39;/g, "’").replace(/&quot;/g, '"')
    .replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&#8211;/g, "–")
    .replace(/&#8220;/g, "“").replace(/&#8221;/g, "”");
const plano = (s) => deco(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();

/**
 * ⚠ El `<article>` se busca por `et_pb_post`, que es la clase que las DOS
 * familias de markup comparten (`lh-barrido` documenta las tres). Buscar por
 * `type-post` dejaría fuera el loop del tema, y buscar por `et_pb_blog_item`
 * dejaría fuera `/blog`: en los dos casos el hueco saldría como **cero
 * tarjetas**, no como error (§sondas 4).
 */
function tarjetasDe(fichero) {
  const h = sinSS(readFileSync(fichero, "utf8"));
  return (h.match(/<article[^>]*class="[^"]*et_pb_post[\s\S]*?<\/article>/g) ?? []).map((a) => {
    const href = a.match(/<h2 class="entry-title">\s*<a href="([^"]+)"/)?.[1] ?? null;
    return {
      href,
      slug: href ? href.replace(/\/$/, "").split("/").pop() : null,
      titulo: plano(a.match(/<h2 class="entry-title">([\s\S]*?)<\/h2>/)?.[1] ?? ""),
      extracto: plano(a.match(/<div class="post-content">([\s\S]*)$/)?.[1] ?? ""),
    };
  });
}

/** Todas las páginas de una serie: `index.html` + `page/N/index.html`. */
function paginasDe(base) {
  const out = [];
  const i = join(base, "index.html");
  if (existsSync(i)) out.push(i);
  const pd = join(base, "page");
  if (existsSync(pd)) for (const n of readdirSync(pd)) { const f = join(pd, n, "index.html"); if (existsSync(f)) out.push(f); }
  return out;
}

const ficheros = [];
if (existsSync(join(RAIZ, "blog"))) ficheros.push(...paginasDe(join(RAIZ, "blog")));
const dirEtq = join(RAIZ, "etiqueta");
if (existsSync(dirEtq)) for (const t of readdirSync(dirEtq)) ficheros.push(...paginasDe(join(dirEtq, t)));

/* GUARDA · sin corpus no hay medida, y su cero se leería como «no hay deriva».  */
if (!ficheros.length)
  throw new Error(
    `CORPUS AUSENTE: 0 páginas de listado bajo ${RAIZ}.\n` +
      `  Un cero aquí saldría como «0 posts con extracto distinto» y «0 titulares\n` +
      `  derivados» — dos verdes de una sonda que no miró (§sondas 4bis).`,
  );

/* El mínimo se DERIVA del corpus: una captura nueva sube el listón sola. */
const ev = new Evaluadas({ nombre: "lh-extracto", unidad: "páginas de listado leídas", minimo: ficheros.length });

const deBlog = new Map();
const deEtq = new Map();
for (const f of ficheros) {
  const destino = f.includes(`${join("listados", "blog")}`) || /[\\/]blog[\\/]/.test(f) ? deBlog : deEtq;
  for (const t of tarjetasDe(f)) if (t.slug) destino.set(t.slug, t);
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * (1) LH-SP10 · los DOS mecanismos
 * ═════════════════════════════════════════════════════════════════════════ */
const comunes = [...deBlog.keys()].filter((s) => deEtq.has(s));
if (!comunes.length)
  throw new Error(
    "0 posts aparecen en los DOS listados: sin intersección no se pueden comparar\n" +
      "  los dos mecanismos, y «0 distintos» se leería como «es el mismo».",
  );

/** Quita el terminador de cada piel para comparar el CUERPO del extracto. */
const nucleo = (s) => s.replace(/\s*\[?…\]?\s*$/, "").replace(/\s*\.\.\.$/, "").trim();

const clases = { identicos: [], prefijo: [], distintos: [] };
for (const s of comunes) {
  const a = deBlog.get(s).extracto;
  const b = SABOTAJE === "mecanismo-unico" ? deBlog.get(s).extracto : deEtq.get(s).extracto;
  const na = nucleo(a);
  const nb = nucleo(b);
  if (a === b) clases.identicos.push(s);
  else if (na.startsWith(nb) || nb.startsWith(na)) clases.prefijo.push({ slug: s, blog: a.length, etiqueta: b.length });
  else clases.distintos.push({ slug: s, blog: a, etiqueta: b });
}

const acabaEn = (m, suf) => [...m.values()].filter((t) => t.extracto.endsWith(suf)).length;
const longs = (m) => {
  const v = [...m.values()].map((t) => t.extracto.length);
  return { n: v.length, min: Math.min(...v), max: Math.max(...v), media: Math.round(v.reduce((a, b) => a + b, 0) / v.length) };
};

/* ══════════════════════════════════════════════════════════════════════════
 * (2) LA DERIVA — titular a titular contra el espejo congelado
 * ═════════════════════════════════════════════════════════════════════════ */
const ESPEJO_F = join(QA, "medidas/lh-spec-1440.json");
if (!existsSync(ESPEJO_F) || SABOTAJE === "sin-espejo")
  throw new Error(
    "ESPEJO AUSENTE: sin medidas/lh-spec-1440.json no se puede acotar la deriva,\n" +
      "  y su ausencia daría «0 titulares derivados», que es el cero que engaña.",
  );
const ESPEJO = JSON.parse(readFileSync(ESPEJO_F, "utf8"));

const deriva = [];
let paresTitulo = 0;
let titulosIguales = 0;
for (const [clave, p] of Object.entries(ESPEJO.paginas ?? {})) {
  if (!/^L1-(blog|etiqueta)/.test(clave)) continue;
  const ruta = clave.split("::")[1].replace(/^\/es\//, "").replace(/\/$/, "");
  const f = join(RAIZ, ruta, "index.html");
  if (!existsSync(f)) { ev.fallo(clave, "sin fichero en el corpus"); continue; }
  const c = tarjetasDe(f);
  const filas = [];
  (p.listado?.tarjetas ?? []).forEach((t, i) => {
    const esp = (t.titulo?.texto ?? "").trim();
    const cor = (c[i]?.titulo ?? "").trim();
    paresTitulo++;
    if (esp === cor) titulosIguales++;
    else filas.push({ i, espejo: esp, corpus: cor });
  });
  deriva.push({ forma: clave, nTarjetasCorpus: c.length, nTarjetasEspejo: p.listado?.nTarjetas ?? null, titularesQueCambiaron: filas });
}

/* ── informe ─────────────────────────────────────────────────────────────── */
console.log(`\n════════ lh-extracto · LH-SP10 y la deriva corpus↔espejo ════════\n`);
console.log(`  corpus     ${RAIZ}  (${ficheros.length} páginas)`);
console.log(`  espejo     medidas/lh-spec-1440.json (${ESPEJO.meta?.fecha ?? "sin fecha"})\n`);
console.log(`  ── (1) LH-SP10 · los dos mecanismos de extracto ──`);
console.log(`  tarjetas únicas         /blog ${deBlog.size} · /etiqueta ${deEtq.size}`);
console.log(`  posts en LOS DOS        ${comunes.length}`);
console.log(`     idénticos            ${clases.identicos.length}`);
console.log(`     uno PREFIJO del otro ${clases.prefijo.length}`);
console.log(`     DISTINTOS            ${clases.distintos.length}   ← el extracto MANUAL`);
const lb = longs(deBlog);
const le = longs(deEtq);
console.log(`  longitud  /blog         min ${lb.min} · max ${lb.max} · media ${lb.media}`);
console.log(`  longitud  /etiqueta     min ${le.min} · max ${le.max} · media ${le.media}`);
console.log(`  terminador «…»          ${acabaEn(deBlog, "…")}/${deBlog.size} en /blog`);
console.log(`  terminador «...»        ${acabaEn(deEtq, "...")}/${deEtq.size} en /etiqueta`);
for (const d of clases.distintos.slice(0, 3))
  console.log(`     · ${d.slug}\n        blog(${d.blog.length}c) «${d.blog.slice(0, 90)}»\n        etiq(${d.etiqueta.length}c) «${d.etiqueta.slice(0, 90)}»`);

console.log(`\n  ── (2) la deriva, acotada ──`);
console.log(`  titulares comparados    ${paresTitulo}`);
console.log(`  siguen siendo los mismos ${titulosIguales}`);
console.log(`  CAMBIARON               ${paresTitulo - titulosIguales}   ← deriva CONOCIDA, no defecto del clon`);
for (const d of deriva)
  for (const f of d.titularesQueCambiaron)
    console.log(`     ⚠ ${d.forma} T${f.i}\n        espejo «${f.espejo.slice(0, 82)}»\n        corpus «${f.corpus.slice(0, 82)}»`);

const salida = {
  meta: {
    fecha: hoy(),
    que: "LH-SP10 (los dos mecanismos de extracto) y la deriva corpus↔espejo",
    corpus: RAIZ,
    espejo: `medidas/lh-spec-1440.json (${ESPEJO.meta?.fecha ?? "?"})`,
    alcance:
      "SÓLO /blog y /etiqueta/*. `/recursos/*` NO entra: su taxonomía está incompleta en el clon " +
      "(8 de 10 términos, `padre` a null) y sus tarjetas no se pueden emparejar todavía.",
    loQueNoDecide:
      "cuál de las dos fotos manda. Manda el original; aquí se establece el DENOMINADOR de la duda.",
  },
  sp10: {
    postsEnLosDos: comunes.length,
    identicos: clases.identicos.length,
    prefijo: clases.prefijo.length,
    distintos: clases.distintos.length,
    longitudBlog: lb,
    longitudEtiqueta: le,
    terminadorBlogPuntosSuspensivosHtml: `${acabaEn(deBlog, "…")}/${deBlog.size}`,
    terminadorEtiquetaTresPuntos: `${acabaEn(deEtq, "...")}/${deEtq.size}`,
    ejemplosDistintos: clases.distintos.slice(0, 20),
  },
  deriva: { paresTitulo, titulosIguales, cambiaron: paresTitulo - titulosIguales, porForma: deriva },
};
w(`medidas/lh-extracto.json`, salida);

/* ══════════════════════════════════════════════════════════════════════════
 * EL VEREDICTO — y qué se considera fallo
 *
 * Esta sonda no compara clon contra original: **establece dos hechos**. Falla
 * cuando un hecho no se puede establecer, no cuando el número sale «feo»:
 *
 *  · `distintos === 0` ⇒ los dos listados usarían el MISMO mecanismo, que es lo
 *    contrario de lo medido. Si eso pasa, o el sitio cambió o el emparejado se
 *    rompió — en los dos casos, la afirmación de esta sonda deja de valer.
 * ═════════════════════════════════════════════════════════════════════════ */
let codigo = 0;
if (!clases.distintos.length) {
  console.log(
    `\n⛔ 0 posts con extracto DISTINTO entre las dos pieles.\n` +
      `   LH-SP10 se contesta cruzando los dos mecanismos: si no difieren en ninguno,\n` +
      `   no hay dos mecanismos que medir y la conclusión de esta sonda no está respaldada.`,
  );
  codigo = 2;
} else {
  console.log(
    `\n✅ LH-SP10 contestada: DOS mecanismos.\n` +
      `   · /blog usa el extracto MANUAL donde existe (${clases.distintos.length} de ${comunes.length}) y el automático si no;\n` +
      `   · /etiqueta (módulo Divi) IGNORA el manual y trunca el contenido (${le.min}–${le.max} c + «...»).\n` +
      `   Y la deriva queda acotada: ${paresTitulo - titulosIguales} de ${paresTitulo} titulares congelados cambiaron.`,
  );
}
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} páginas de listado · lh-extracto`);
process.exit(codigo);
