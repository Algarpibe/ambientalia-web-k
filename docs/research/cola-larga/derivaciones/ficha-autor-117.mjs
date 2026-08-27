/* ═════════════════════════════════════════════════════════════════════════
 *  LA FICHA DE AUTOR — el objeto que esta tanda va a construir
 *  117.ª · PASO 0 · 2026-08-27
 * ═════════════════════════════════════════════════════════════════════════
 *
 * QUÉ CONTESTA
 *   1. las CIFRAS QUE EL ENCARGO PASA, derivadas y no aceptadas
 *      (§*toda cifra se DERIVA antes de usarse, también las que yo te pase*);
 *   2. la FORMA de la ficha, que es lo que decide el esquema del ESCALÓN 2:
 *      ¿el texto del papel es un campo de la RELACIÓN, o se deriva del AUTOR?
 *
 * QUÉ **NO** CONTESTA — y hay que decirlo (§*una medida contesta las preguntas
 * que se le hicieron, y su fichero no lleva escrito cuáles NO*)
 *   · NADA de geometría: este corpus no trae las hojas enlazadas, así que
 *     `getComputedStyle` daría una medida PLAUSIBLE Y FALSA (§regla 32).
 *     La transcripción del ESCALÓN 3 se mide EN VIVO, no aquí;
 *   · no dice si el clon pinta bien la ficha: el clon todavía no la pinta.
 *
 * LA SEPARADORA DEL ESCALÓN 2 — y por qué no es cosmética
 *   Si el texto del papel se DERIVA del autor, la relación entrada→autor es
 *   un campo simple más un enum de papel. Si NO se deriva —si dos entradas
 *   del mismo autor traen textos distintos, o si el texto contradice al
 *   `cargo` del archivo— entonces el texto vive EN LA RELACIÓN y un enum no
 *   lo expresa. Las dos hipótesis predicen cosas distintas sobre un dato que
 *   ya está capturado, así que se miden en vez de elegirse.
 *
 * CONTROLES (§regla 8 · un negativo sin control no es un negativo)
 *   C1  el extractor casa un CASO CONOCIDO DE ANTEMANO (las 2 entradas con
 *       «Revisado y aprobado», derivadas por `grep` antes de escribir esto).
 *       Si diera 0, «no hay papeles» sería un filtro roto disfrazado de verde
 *       (§sondas 4);
 *   2.  C2 el extractor DISCRIMINA por los dos lados: tiene que ver también
 *       las 150 de un solo papel, no sólo las 2;
 *   C3  §regla 40 — EL OBJETO NO CONTIENE NI UNA INSTANCIA DE LO EXCLUIDO.
 *       La pregunta es por LA FICHA, no por la página: si el extractor se
 *       comiera el cuerpo, encontraría «Escrito por» en cualquier parte y
 *       refutaría siempre. Se exige 0 tarjetas y 0 módulos dentro del bloque;
 *   C4  el cardinal de fichas POR FICHERO se publica: son 2, y si las 2 no
 *       son idénticas eso es un dato, no un detalle de extracción.
 *
 * NO SE PIPEA (§regla 11) · congela en `medidas/` por `w()` (§regla 2/5)
 * ═════════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..", "..", "..", "..");
const BLOG = join(RAIZ, "corpus", "entradas-blog");
const AUTORES = join(RAIZ, "corpus", "fase-3", "autor", "author");

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

/* ── extracción de la ficha, con profundidad BALANCEADA ────────────────────
 * Nada de `slice(0, N)`: un tope se lee como una ausencia del original
 * (§sondas 4, cuarta cara). Se cierra el `<div>` contando apertura y cierre. */
function bloqueBalanceado(html, desde) {
  // `desde` apunta al `<` del div de apertura
  const re = /<div\b[^>]*>|<\/div>/gi;
  re.lastIndex = desde;
  let prof = 0, m;
  while ((m = re.exec(html))) {
    prof += m[0][1] === "/" ? -1 : 1;
    if (prof === 0) return html.slice(desde, re.lastIndex);
  }
  return null; // no cerró: se reporta, no se recorta
}

function fichasDe(html) {
  const out = [];
  const marca = /<div class="ficha-autor-revisor"/gi;
  let m;
  while ((m = marca.exec(html))) {
    const b = bloqueBalanceado(html, m.index);
    if (b === null) { out.push({ sinCerrar: true }); continue; }
    out.push({ html: b });
  }
  return out;
}

const txt = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function papelesDe(fichaHtml) {
  const papeles = [];
  const re = /<div class="(revisor|autor)">/gi;
  let m;
  while ((m = re.exec(fichaHtml))) {
    const b = bloqueBalanceado(fichaHtml, m.index);
    if (b === null) continue;
    const href = (b.match(/href="([^"]+)"/) || [])[1] || null;
    const img = (b.match(/<img[^>]*\bsrc="([^"]+)"/) || [])[1] || null;
    const p = (b.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    const nombre = (p.match(/<a[^>]*>([\s\S]*?)<\/a>/) || [])[1] || null;
    // el PROEMIO es el texto del <p> QUITANDO el nombre enlazado: es lo que
    // el editor escribió, separado de lo que viene del autor.
    const proemio = txt(p.replace(/<a[^>]*>[\s\S]*?<\/a>/g, "‹NOMBRE›"));
    papeles.push({
      div: m[1],
      href,
      slug: href ? (href.match(/\/author\/([^/]+)/) || [])[1] || null : null,
      img,
      nombre: nombre ? txt(nombre) : null,
      proemio,
      texto: txt(p),
    });
  }
  return papeles;
}

say("═══ LA FICHA DE AUTOR · 117.ª PASO 0 ═══");
say("");
say("0 · LAS CIFRAS DEL ENCARGO, DERIVADAS (§regla 9)");
say("");

const ficheros = readdirSync(BLOG).filter((f) => f.endsWith(".html")).sort();
say(`  entradas de blog en disco: **${ficheros.length}**`);

const porFichero = [];
let sinCerrar = 0;
for (const f of ficheros) {
  const html = readFileSync(join(BLOG, f), "utf8");
  const fs_ = fichasDe(html);
  if (fs_.some((x) => x.sinCerrar)) sinCerrar++;
  porFichero.push({
    f,
    n: fs_.length,
    fichas: fs_.filter((x) => !x.sinCerrar).map((x) => ({ html: x.html, papeles: papelesDe(x.html) })),
  });
}

const conFicha = porFichero.filter((x) => x.n > 0);
say(`  con \`ficha-autor-revisor\`: **${conFicha.length} de ${ficheros.length}**` +
    `  ${conFicha.length === ficheros.length ? "✅ casa el 152/152 del encargo" : "❌ NO casa"}`);
say(`  bloques que NO cerraron (extracción incompleta): **${sinCerrar}**` +
    `  ${sinCerrar === 0 ? "✅" : "❌ el extractor no es de fiar"}`);

/* C4 · el cardinal de fichas POR FICHERO */
const repartoN = {};
for (const x of porFichero) repartoN[x.n] = (repartoN[x.n] || 0) + 1;
say("");
say("  C4 · ¿CUÁNTAS fichas por fichero? (un cardinal se publica, no se asume)");
for (const [n, c] of Object.entries(repartoN).sort()) say(`     ${n} ficha(s): ${c} ficheros`);

/* ¿son IDÉNTICAS las 2 de cada fichero? — si no, son dos emplazamientos */
let identicas = 0, distintas = 0;
const ejemploDistinto = [];
for (const x of porFichero) {
  if (x.fichas.length < 2) continue;
  const set = new Set(x.fichas.map((y) => y.html));
  if (set.size === 1) identicas++;
  else { distintas++; if (ejemploDistinto.length < 3) ejemploDistinto.push(x.f); }
}
say(`     de los que traen ≥2: **idénticas ${identicas}** · **distintas ${distintas}**`);
if (distintas) say(`     ejemplos distintos: ${ejemploDistinto.join(", ")}`);
say(`     ⇒ ${distintas === 0
  ? "las 2 son EL MISMO bloque repetido: el modelo tiene UNA ficha, no dos"
  : "⚠ NO son el mismo bloque: hay DOS emplazamientos y el modelo los necesita"}`);

/* ── C3 · §regla 40 · el objeto NO contiene lo excluido ────────────────── */
say("");
say("  C3 · §regla 40 — ¿se ha colado en la ficha algo que la pregunta EXCLUYE?");
const CONTAMINANTES = [
  ["tarjeta de listado", /class="[^"]*\b(post-content|entry-summary|scientific-excerpt)\b/i],
  ["módulo de Divi", /\bet_pb_(text|blurb|image|section)_\d+/i],
  ["paginador", /class="[^"]*\bpage-numbers\b/i],
];
let contaminada = 0;
for (const [nom, re] of CONTAMINANTES) {
  let n = 0;
  for (const x of porFichero) for (const fi of x.fichas) if (re.test(fi.html)) n++;
  contaminada += n;
  say(`     ${nom.padEnd(20)} dentro de la ficha: **${n}** ${n === 0 ? "✅" : "❌"}`);
}
say(`     ⇒ ${contaminada === 0
  ? "el bloque extraído ES la ficha, no la página: la separadora pregunta por lo que mira"
  : "⚠ el extractor se comió más que la ficha — cualquier veredicto suyo REFUTA por construcción"}`);

/* ── 1 · EL PAPEL ─────────────────────────────────────────────────────── */
say("");
say("1 · EL PAPEL — ¿cabe en un campo simple?");
say("");

const todasFichas = porFichero.flatMap((x) => x.fichas.slice(0, 1).map((fi) => ({ f: x.f, ...fi })));
const repartoPapeles = {};
for (const fi of todasFichas) repartoPapeles[fi.papeles.length] = (repartoPapeles[fi.papeles.length] || 0) + 1;
say("  nº de papeles por ficha (unidad = ENTRADA, primera ficha de cada una):");
for (const [n, c] of Object.entries(repartoPapeles).sort()) say(`     ${n} papel(es): **${c}** entradas`);

const dosPapeles = todasFichas.filter((fi) => fi.papeles.length >= 2);
say(`  ⇒ entradas con MÁS DE UN papel: **${dosPapeles.length} de ${todasFichas.length}**` +
    `  ${dosPapeles.length === 2 ? "✅ casa el 2/152 del encargo" : "❌ NO casa"}`);
for (const fi of dosPapeles) say(`     · ${fi.f}`);

/* C1/C2 · el extractor casa el caso conocido Y ve el otro lado */
const c1 = dosPapeles.length > 0;
const c2 = todasFichas.filter((fi) => fi.papeles.length === 1).length > 0;
say("");
say(`  C1 · casa el caso conocido de antemano (≥1 con dos papeles): ${c1 ? "✅" : "❌"}`);
say(`  C2 · DISCRIMINA por el otro lado (≥1 con un solo papel):     ${c2 ? "✅" : "❌"}`);

/* los PROEMIOS distintos */
const proemios = {};
for (const fi of todasFichas) for (const p of fi.papeles) {
  const k = `${p.div} │ ${p.proemio}`;
  (proemios[k] ||= []).push(fi.f);
}
say("");
say("  LOS PROEMIOS SERVIDOS (el texto del <p> con el nombre sustituido):");
say("");
say(`  ${"div".padEnd(8)} ${"proemio".padEnd(64)} n`);
for (const [k, fs_] of Object.entries(proemios).sort((a, b) => b[1].length - a[1].length)) {
  const [div, pro] = k.split(" │ ");
  say(`  ${div.padEnd(8)} ${pro.slice(0, 64).padEnd(64)} ${fs_.length}`);
}
say(`  ⇒ proemios distintos: **${Object.keys(proemios).length}**`);

/* ── 2 · ¿EL PROEMIO SE DERIVA DEL AUTOR? — la separadora ──────────────── */
say("");
say("2 · LA SEPARADORA · ¿el proemio se DERIVA del autor, o vive en la RELACIÓN?");
say("");

/* el `cargo` de cada autor, leído de SU archivo */
const cargos = {};
if (existsSync(AUTORES)) {
  for (const slug of readdirSync(AUTORES)) {
    const idx = join(AUTORES, slug, "index.html");
    if (!existsSync(idx)) continue;
    const h = readFileSync(idx, "utf8");
    // el cargo va en el <p> que sigue al h1 del término
    const m = h.match(/<h1[^>]*>[\s\S]*?<\/h1>([\s\S]{0,600})/i);
    const p = m ? (m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] : null;
    cargos[slug] = p ? txt(p) : "";
  }
}
say(`  archivos de autor leídos: **${Object.keys(cargos).length}**`);

/* ¿un mismo autor trae SIEMPRE el mismo proemio? */
const porAutor = {};
for (const fi of todasFichas) for (const p of fi.papeles) {
  if (!p.slug) continue;
  (porAutor[p.slug] ||= new Set()).add(`${p.div}│${p.proemio}`);
}
say("");
say(`  ${"autor".padEnd(20)} ${"proemios distintos".padEnd(20)} ${"cargo en su ARCHIVO".padEnd(34)}`);
let autoresVarios = 0;
for (const [slug, set] of Object.entries(porAutor).sort()) {
  if (set.size > 1) autoresVarios++;
  say(`  ${slug.padEnd(20)} ${String(set.size).padEnd(20)} ${(cargos[slug] ?? "‹sin archivo›").slice(0, 34).padEnd(34)}`);
}
say(`  ⇒ autores con MÁS DE UN proemio: **${autoresVarios} de ${Object.keys(porAutor).length}**`);

/* ¿el proemio CONTIENE el cargo del archivo? */
say("");
say("  ¿el proemio del REVISOR contiene, literal, el `cargo` de su archivo?");
const revisores = todasFichas.flatMap((fi) => fi.papeles.filter((p) => /Revisado/i.test(p.proemio)));
for (const p of revisores) {
  const c = cargos[p.slug] ?? "";
  const dentro = c && p.proemio.includes(c);
  say(`     ${p.slug}: proemio «${p.proemio}»`);
  say(`        cargo del archivo: «${c}» ⇒ ${dentro ? "SÍ contenido" : "**NO contenido literalmente**"}`);
}

/* ── 2b · LA SEPARADORA FINA · ¿proemio = f(autor, papel)? ───────────────
 * Arriba sale que 3 de 5 autores traen MÁS DE UN proemio, y eso parece decir
 * «el texto vive en la relación». Puede ser un tercer eje: el PAPEL. Los dos
 * modelos predicen cosas distintas y hay dato para separarlos, así que se
 * miden en vez de elegirse (§*un modelo se elige por lo que lo SEPARA*).
 *
 *   modelo D (DERIVADO)  proemio = f(autor, papel)  ⇒ basta un enum de papel
 *   modelo R (RELACIÓN)  el texto es propio         ⇒ hace falta guardarlo
 *
 * La INSTANCIA SEPARADORA es un (autor, papel) con ≥2 proemios distintos. */
const PAPEL = (pro) => (/^Revisado y aprobado/i.test(pro) ? "revisado" : "escrito");
say("");
say("2b · SEPARADORA FINA · ¿el proemio es función de (AUTOR, PAPEL)?");
say("");
const porAutorPapel = {};
for (const fi of todasFichas) for (const p of fi.papeles) {
  if (!p.slug) continue;
  const k = `${p.slug}│${PAPEL(p.proemio)}`;
  (porAutorPapel[k] ||= new Set()).add(p.proemio);
}
say(`  ${"autor".padEnd(20)} ${"papel".padEnd(10)} proemios distintos`);
let separadoras = 0;
for (const [k, set] of Object.entries(porAutorPapel).sort()) {
  const [slug, papel] = k.split("│");
  if (set.size > 1) separadoras++;
  say(`  ${slug.padEnd(20)} ${papel.padEnd(10)} ${set.size}${set.size > 1 ? "   ⇐ SEPARADORA" : ""}`);
  if (set.size > 1) for (const s of set) say(`        · «${s}»`);
}
say("");
say(`  ⇒ pares (autor, papel) observados: **${Object.keys(porAutorPapel).length}**`);
say(`  ⇒ INSTANCIAS SEPARADORAS (mismo autor y papel, proemio distinto): **${separadoras}**`);
say(`  ⇒ VEREDICTO: ${separadoras === 0
  ? "**modelo D** — el proemio se DERIVA de (autor, papel). Un enum de papel basta;\n     el texto no se guarda: se compone. Y el denominador de esta elección son\n     los pares de arriba, no las 152 entradas."
  : "**modelo R** — hay un mismo (autor, papel) con textos distintos: el texto es\n     propio de la RELACIÓN y un enum no lo expresa."}`);

/* ── 2c · LA SEPARADORA, CON EL TERCER EJE ────────────────────────────────
 * La de 2b sale «modelo R» con **n = 1**, y §*un discriminador hallado en una
 * sola instancia tampoco es un discriminador* prohíbe cerrarla ahí. Antes de
 * fichar una indeterminación hay que comprobar que las dos hipótesis sean de
 * verdad distintas — y la única separadora resultó ser `kunak` en las DOS
 * entradas de dos papeles, o sea que el eje que faltaba es el HUECO
 * estructural (`revisor` con foto · `autor` sin foto), no el autor.
 *
 * Se mide el triple. Si da 0 separadoras, el modelo D vuelve — y esta vez con
 * su denominador y sin la instancia degenerada. */
say("");
say("2c · LA MISMA SEPARADORA CON EL TERCER EJE · ¿proemio = f(autor, papel, HUECO)?");
say("");
const porTriple = {};
for (const fi of todasFichas) for (const p of fi.papeles) {
  if (!p.slug) continue;
  const k = `${p.slug}│${PAPEL(p.proemio)}│${p.div}`;
  (porTriple[k] ||= new Set()).add(p.proemio);
}
let sepTriple = 0;
say(`  ${"autor".padEnd(18)} ${"papel".padEnd(9)} ${"hueco".padEnd(8)} proemios`);
for (const [k, set] of Object.entries(porTriple).sort()) {
  const [slug, papel, div] = k.split("│");
  if (set.size > 1) sepTriple++;
  say(`  ${slug.padEnd(18)} ${papel.padEnd(9)} ${div.padEnd(8)} ${set.size}${set.size > 1 ? "  ⇐ SEPARADORA" : ""}`);
}
say("");
say(`  ⇒ triples observados: **${Object.keys(porTriple).length}** · separadoras: **${sepTriple}**`);
say(`  ⇒ ${sepTriple === 0
  ? "**modelo D con el hueco dentro**: el proemio se DERIVA de (autor, papel, hueco).\n     El texto NO hace falta guardarlo — pero la elección se apoya en **1 sola**\n     instancia separadora (la de 2b), así que lo que está probado es que\n     (autor,papel) NO basta, NO que el triple sea la función correcta."
  : "**modelo R**: ni con el hueco se deriva."}`);
say("");
say("  ⚠ LO QUE ESTO **NO** PRUEBA, y decide el esquema del ESCALÓN 2:");
say("     el dominio tiene **1** instancia separadora en 152 entradas y **5**");
say("     autores que firman. Una función ajustada a 7 triples con 1 separadora");
say("     es §*una explicación con mecanismo y dos casos a favor se parece");
say("     muchísimo a una medida*. Así que el esquema **guarda el texto** con su");
say("     defecto derivado y lo omite cuando coincide: si la función es correcta,");
say("     el dato queda vacío en las 152 y no cuesta nada; si es falsa, el original");
say("     se replica igual. El defecto se pone en la dirección que GRITA (§sondas 6)");
say("     — derivarlo mal serviría «Escrito por el» donde el original dice");
say("     «Escrito por», en 2 páginas, y ninguna guarda del repo mira ese texto.");

/* ── 3 · LA FOTO ──────────────────────────────────────────────────────── */
say("");
say("3 · LA FOTO — ¿la trae el papel, o sólo uno de los dos?");
const conImg = todasFichas.flatMap((fi) => fi.papeles).filter((p) => p.img);
const sinImg = todasFichas.flatMap((fi) => fi.papeles).filter((p) => !p.img);
say(`  papeles CON <img>: **${conImg.length}** · SIN <img>: **${sinImg.length}**`);
const porDiv = {};
for (const p of todasFichas.flatMap((fi) => fi.papeles)) {
  const k = `${p.div}│${p.img ? "con img" : "sin img"}`;
  porDiv[k] = (porDiv[k] || 0) + 1;
}
for (const [k, c] of Object.entries(porDiv).sort()) say(`     ${k.replace("│", " · ").padEnd(24)} ${c}`);

/* ── 4 · EL CLON, HOY ─────────────────────────────────────────────────── */
say("");
say("4 · EL CLON, HOY — ¿pinta la ficha? ¿enlaza a /author/?");
const SRC = join(RAIZ, "apps", "web", "src");
function walk(d) {
  const out = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}
const codigo = existsSync(SRC) ? walk(SRC) : [];
let emiteFicha = 0, conAuthor = [];
for (const p of codigo) {
  const s = readFileSync(p, "utf8");
  if (s.includes("ficha-autor-revisor")) emiteFicha++;
  const hrefs = s.match(/["'`][^"'`]*\/author\/[^"'`]*["'`]/g) || [];
  for (const h of hrefs) conAuthor.push({ p: p.replace(RAIZ, "").replace(/\\/g, "/"), h: h.slice(1, -1) });
}
say(`  ficheros de código barridos: **${codigo.length}**`);
say(`  que emiten \`ficha-autor-revisor\`: **${emiteFicha}**` +
    ` ${emiteFicha === 0 ? "✅ casa: el clon NO la pinta" : ""}`);
say(`  con un \`href\` a /author/: **${conAuthor.length}**`);
for (const a of conAuthor) {
  const abs = /^https?:/.test(a.h);
  say(`     ${abs ? "ABSOLUTO" : "**LOCAL**"}  ${a.h}   (${a.p})`);
}
const locales = conAuthor.filter((a) => !/^https?:/.test(a.h)).length;
say(`  ⇒ ABSOLUTOS **${conAuthor.length - locales}** · LOCALES **${locales}**` +
    `  ${locales === 0 ? "✅ «colección sin archivo» no crea ni un enlace roto" : "❌ hay enlace local a una ruta que el build no emite"}`);

/* ── 5 · EL CANAL DE MEDIA DE LA FICHA ───────────────────────────────────
 * §EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA DECLARA:
 * el canal se enumera **antes de necesitarlo**, no cuando mate un seed. La
 * `foto` del autor es un canal `upload` que el ESCALÓN 2 va a declarar, así
 * que su cardinal —incluido el CERO— se publica aquí.
 *
 * ⚠ Se cuenta sobre el bloque BALANCEADO, no sobre una ventana: una `slice`
 * alrededor de la ficha se lleva las imágenes del cuerpo que vienen detrás y
 * publica un conjunto inflado (§sondas 4, tercera cara — comprobado: una
 * ventana de 2500 chars daba **17** fotos, y de ellas la mayoría son del
 * cuerpo del artículo, no de la ficha). */
say("");
say("5 · EL CANAL DE MEDIA DE LA FICHA (enumerado ANTES de que mate un seed)");
const fotos = new Map();
for (const fi of todasFichas) for (const p of fi.papeles) {
  if (!p.img) continue;
  if (!fotos.has(p.img)) fotos.set(p.img, { n: 0, slugs: new Set() });
  const e = fotos.get(p.img); e.n++; if (p.slug) e.slugs.add(p.slug);
}
const CANDIDATOS = ["media-corpus", join("apps", "web", "public"), join("corpus", "media")];
let resueltas = 0;
say(`  fotos DISTINTAS en la ficha (bloque balanceado): **${fotos.size}**`);
for (const [src, e] of [...fotos].sort((a, b) => b[1].n - a[1].n)) {
  const rel = src.replace(/^https?:\/\/[^/]+\//, "");
  const donde = CANDIDATOS.filter((c) => existsSync(join(RAIZ, c, rel)));
  if (donde.length) resueltas++;
  say(`     ${donde.length ? "OK   " : "FALTA"} n=${String(e.n).padStart(3)} ${[...e.slugs].join(",").padEnd(18)} ${rel.slice(-52)}`);
}
say(`  ⇒ RESUELTAS localmente: **${resueltas} de ${fotos.size}**`);
say(`  ⇒ ${resueltas === fotos.size
  ? "el canal está cubierto"
  : `**el canal NO está capturado**. Se ficha con su cardinal AHORA, que es lo\n     que §EL INVENTARIO pide: los tres canales anteriores se descubrieron\n     MATANDO UN SEED, y éste se descubre antes de escribir el esquema.\n     Consecuencia para el ESCALÓN 4: sembrar \`autores.foto\` necesita estos\n     ${fotos.size - resueltas} bytes, o el campo se declara y se deja vacío CON SU FRACCIÓN.`}`);

/* ── SALIDA ───────────────────────────────────────────────────────────── */
const MED = join(RAIZ, "scripts", "qa", "medidas");
const dest = join(MED, "ficha-autor-117.json");
const payload = {
  fecha: "2026-08-27",
  tanda: "117.ª PASO 0",
  unidad: "entrada de blog",
  entradas: ficheros.length,
  conFicha: conFicha.length,
  fichasPorFichero: repartoN,
  fichasIdenticasEnFichero: { identicas, distintas },
  controles: { C1: c1, C2: c2, C3_contaminantes: contaminada, C4_sinCerrar: sinCerrar },
  papelesPorEntrada: repartoPapeles,
  entradasConDosPapeles: dosPapeles.map((x) => x.f),
  proemios: Object.fromEntries(Object.entries(proemios).map(([k, v]) => [k, v.length])),
  autoresConVariosProemios: autoresVarios,
  cargosDeArchivo: cargos,
  clon: { ficherosCodigo: codigo.length, emitenFicha: emiteFicha, hrefsAuthor: conAuthor, locales },
  media: { distintas: fotos.size, resueltas, fotos: [...fotos].map(([src, e]) => ({ src, n: e.n, slugs: [...e.slugs] })) },
};
if (existsSync(dest) && readFileSync(dest, "utf8") !== JSON.stringify(payload, null, 2) && !process.env.PISAR) {
  const alt = dest.replace(/\.json$/, `-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(alt, JSON.stringify(payload, null, 2));
  say(`\n⚠ la congelada existía y DIFIERE: escrita al lado en ${alt.replace(RAIZ, "")}`);
} else {
  writeFileSync(dest, JSON.stringify(payload, null, 2));
  say(`\n✓ congelada en ${dest.replace(RAIZ, "")}`);
}
writeFileSync(join(import.meta.dirname, "ficha-autor-117.log"), L.join("\n") + "\n");
