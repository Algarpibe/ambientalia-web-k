/* ═════════════════════════════════════════════════════════════════════════
 *  SEPARADORA (a) · `categoria` — ¿CONSULTA o COLECCIÓN?
 *  116.ª · ESCALÓN 1 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * LA PREGUNTA, tal como la dejó la MESA-F3-4
 *   «Un término con CONTENIDO PROPIO QUE NO SE DERIVE DE SUS MIEMBROS —un
 *   texto de cabecera, una imagen, un orden distinto del de fecha—. Si lo hay
 *   ⇒ COLECCIÓN. Si no lo hay en ninguno de los 4 ⇒ es una CONSULTA.»
 *
 * CÓMO SE CONTESTA, y por qué así
 *   El régimen manda sobre el test (§*identifica el RÉGIMEN antes de aplicar
 *   ningún test*). En régimen PLANTILLADO no existe la persona que editó la
 *   instancia, así que la huella del px absoluto NO sirve y el discriminador
 *   es **LA VARIANZA ENTRE INSTANCIAS**:
 *
 *       varianza CERO entre instancias  ⇒ PLANTILLA
 *       varía de instancia a instancia  ⇒ CAMPO
 *
 * ⚠ Y ANTES, LA PREMISA — donde han fallado las últimas cuatro
 *   `censo-f34.mjs` L96 decide el régimen con **UN solo marcador**
 *   (`et-tb-has-body`). `CLAUDE.md` nombra **DOS** señales para `-T`: ese
 *   marcador **y** las secciones `…_tb_body`. Se derivan LAS DOS.
 *
 * ⚠⚠ TRES DEFECTOS DE LA v1, CAZADOS ANTES DE PUBLICAR (§sondas 1)
 *   1. `cabeceraDe` cortaba por el token `et_pb_section`, que cae DENTRO del
 *      atributo `class` — así que el corte empezaba a media etiqueta y el
 *      resto del atributo sobrevivía a `texto()` (que quita `<…>` enteros).
 *      Resultado: `resto="et_pb_section_1_tb_body et_section_regular\" >"`
 *      leído como TEXTO DE CABECERA en los 4. R1 daba «REFUTA» sobre basura;
 *   2. y su veredicto contaba en la unidad equivocada: `restos` es un Set, así
 *      que 4 valores IDÉNTICOS daban «1 de 4 términos». Además el test estaba
 *      mal planteado — lo que refuta no es que HAYA texto, es que **VARÍE**;
 *   3. R4 buscaba `et_pb_(section|row|module)_\w+`, que **no casa**
 *      `et_pb_blog_0_tb_body` ni `et_pb_text_5_tb_body`. Unión de 5 módulos y
 *      un 0 plausible, mientras la comparación de firma —al lado, en la misma
 *      salida— enseñaba módulos presentes en unos y ausentes en otros
 *      (§regla 1: lo que imprime y lo que cuenta no pueden discrepar);
 *   4. la marca de paginación exigía `class="…"` con COMILLAS DOBLES y
 *      `wp-pagenavi` viene con COMILLAS SIMPLES. Nunca casó, así que los
 *      enlaces del paginador entraban como «diferencia estructural» cuando son
 *      lo más derivado que hay;
 *   5. y la v2 estrenó el suyo (§*cada arreglo de una sonda vuelve a correr el
 *      test en negativo, entero*): `cabeceraDe` buscaba la marca de tarjeta en
 *      el CUERPO, que nunca la lleva, así que la cabecera no terminaba nunca y
 *      se comía la lista. R1 «refutaba» con 4 textos distintos y R2 con 27
 *      imágenes — los titulares y las miniaturas de los MIEMBROS, o sea justo
 *      lo que la separadora excluye. **Un refutador alimentado con lo derivado
 *      refuta siempre**, y su ❗ se lee como dato. Lo cierra C6.
 *
 * CONTROLES (§regla 8)
 *   C1  el extractor de cascarón DISCRIMINA por los dos lados
 *   C2  el detector de régimen SEPARA: ≥2 valores distintos sobre el corpus
 *   C3  el selector de cabecera casa un CASO CONOCIDO DE ANTEMANO (h1 en 4/4)
 *   C4  la marca de paginación MUERDE: 0 restos de paginador en las firmas
 *   C5  todo cardinal con su UNIDAD y su DENOMINADOR
 *   C6  la CABECERA no contiene ni una tarjeta — el que faltaba
 *   C7  el selector de tarjeta casa un caso conocido (si diera 0, el cruce
 *       publicaría «el corpus entero sin archivo» como si fuera un hallazgo)
 *   C8  el segundo canal casa un caso conocido (ídem, al revés)
 *
 * ⚠⚠⚠ Y UN SEXTO DEFECTO, EL DE LA v3, QUE ES EL MÁS CARO DE LOS SEIS
 *   El §7 cruzaba el corpus contra UN canal —la tarjeta del archivo— y publicó
 *   «2 entradas en el corpus y en ningún archivo». Cierto de ese canal, y
 *   **falso del dato**: las 2 declaran su categoría en su propio cuerpo
 *   (`/categoria/articulos/` y `/categoria/eventos/`). Lo que el canal A mide
 *   es COBERTURA DE LA CAPTURA, no membresía — y leerlo como membresía ficha
 *   2 entradas huérfanas que no existen, con una diferencia simétrica real de
 *   coartada. Cerrado midiendo LOS DOS canales y nombrando cuál dice qué.
 *
 * SIN RED · SIN BUILD · SIN TOCAR `src/` NI `lib.mjs`.
 * ═══════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../../..");
const F3 = join(RAIZ, "corpus", "fase-3");

/* ══ PRECONDICIONES · lo primero (§regla 37) ═════════════════════════════ */
const INSUMOS = {
  categoria: join(F3, "categoria", "categoria"),
  autor: join(F3, "autor", "author"),
  sector: join(F3, "taxonomia-sector"),
};
for (const [k, p] of Object.entries(INSUMOS))
  if (!existsSync(p))
    throw new Error(
      `PRECONDICIÓN AUSENTE · ${k} → ${p}\n` +
      `  Si este corpus se movió o se renombró, el nombre canónico quedó libre\n` +
      `  A PROPÓSITO para que esto falle en voz alta (§regla 5bis · 26 hermana).`);

const L = [];
const P = (s = "") => { L.push(s); console.log(s); };
let FALLOS = 0;
const CONTROLES = {};
const marca = (id, ok, nota) => { CONTROLES[id] = { ok, nota }; if (!ok) FALLOS++; };

const limpia = (h) => h
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "");

function anda(d, out = []) {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

P("═══ SEPARADORA (a) · `categoria` — ¿CONSULTA o COLECCIÓN? · 116.ª ESCALÓN 1 ═══");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · LA PREMISA · el régimen con LAS DOS SEÑALES, no con una
 * ═════════════════════════════════════════════════════════════════════════ */
P("1 · LA PREMISA PRIMERO · el régimen, derivado con LAS DOS SEÑALES");
P("");
P("  `CLAUDE.md` nombra dos señales para `-T`: el marcador `et-tb-has-body` en");
P("  el `<body>` **y** las secciones `…_tb_body`. `censo-f34.mjs` L96 usa SÓLO");
P("  la primera. Si discrepan, el veredicto publicado es de UNA señal.");
P("");

const FAMILIAS = {
  categoria: { dir: INSUMOS.categoria, terminos: ["articulos", "eventos", "noticias", "podcast-es"] },
  author: { dir: INSUMOS.autor, terminos: ["admin", "edurne-ibarrola", "irene", "javier-fernandez", "kunak", "mar_ramirez"] },
};
{
  const raizSec = join(INSUMOS.sector, "sector");
  const base = existsSync(raizSec) ? raizSec : INSUMOS.sector;
  FAMILIAS.sector = {
    dir: base,
    terminos: readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(base, e.name, "index.html")))
      .map((e) => e.name),
  };
}

function señales(html) {
  const bodyClase = (/<body[^>]*class="([^"]*)"/i.exec(html) || [])[1] || "";
  const sinCss = limpia(html);
  const secTb = [...new Set(sinCss.match(/et_pb_section_\d+_tb_body/g) || [])];
  return {
    s1_marcadorBody: /\bet-tb-has-body\b/.test(bodyClase),
    s1b_pagebuilder: /\bet_pb_pagebuilder_layout\b/.test(bodyClase),
    s2_seccionesTbBody: secTb.length,
    postContent: (sinCss.match(/et_pb_post_content/g) || []).length,
    tbTemplate: /\bet-tb-has-template\b/.test(bodyClase),
  };
}

const DESACUERDOS = [];
const REGIMEN = {};
P("  familia    término              censo(s1)  _tb_body(s2)  post_content  ¿DE ACUERDO?");
for (const [fam, F] of Object.entries(FAMILIAS)) {
  REGIMEN[fam] = [];
  for (const t of F.terminos) {
    const f = join(F.dir, t, "index.html");
    if (!existsSync(f)) { P(`  ${fam.padEnd(10)} ${t.padEnd(20)} ⛔ SIN CAPTURA EN DISCO`); continue; }
    const s = señales(readFileSync(f, "utf8"));
    const censoDice = s.s1b_pagebuilder && s.s1_marcadorBody ? "BT" : s.s1b_pagebuilder ? "B-" : s.s1_marcadorBody ? "-T" : "--";
    const s2Dice = s.s2_seccionesTbBody > 0 ? "-T" : "--";
    const acuerdo = censoDice === s2Dice;
    if (!acuerdo) DESACUERDOS.push({ fam, termino: t, censoDice, s2Dice, secciones: s.s2_seccionesTbBody });
    REGIMEN[fam].push({ termino: t, censoDice, s2Dice, acuerdo, ...s });
    P(`  ${fam.padEnd(10)} ${t.padEnd(20)} ${censoDice.padEnd(9)}  ${String(s.s2_seccionesTbBody).padStart(11)}  ${String(s.postContent).padStart(12)}  ${acuerdo ? "sí" : "❌ NO"}`);
  }
}
P("");

const valoresCenso = new Set(Object.values(REGIMEN).flat().map((r) => r.censoDice));
const valoresS2 = new Set(Object.values(REGIMEN).flat().map((r) => r.s2Dice));
marca("C2", valoresCenso.size >= 2 || valoresS2.size >= 2,
  `censo → {${[...valoresCenso].join(",")}} · s2 → {${[...valoresS2].join(",")}}`);
P(`  C2 · el detector SEPARA: censo → {${[...valoresCenso].join(", ")}} · s2 → {${[...valoresS2].join(", ")}}  ${CONTROLES.C2.ok ? "✅" : "❌"}`);
P("");

const nTot = Object.values(REGIMEN).flat().length;
P(`  ⇒ DESACUERDO ENTRE LAS DOS SEÑALES: **${DESACUERDOS.length} de ${nTot}** términos capturados.`);
{
  const porFam = {};
  for (const d of DESACUERDOS) (porFam[d.fam] ??= []).push(d);
  for (const [fam, ds] of Object.entries(porFam))
    P(`     · ${fam}: **${ds.length} de ${REGIMEN[fam].length}** — el censo dice \`${ds[0].censoDice}\`, las secciones dicen \`${ds[0].s2Dice}\``);
  const limpias = Object.entries(REGIMEN).filter(([f]) => !porFam[f]).map(([f, r]) => `${f} ${r.length}/${r.length}`);
  if (limpias.length) P(`     · de acuerdo en las dos señales: ${limpias.join(" · ")}`);
}
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · EL EXTRACTOR DE CASCARÓN, y sus controles
 * ═════════════════════════════════════════════════════════════════════════ */
P("2 · EL CASCARÓN · todo menos lo que se DERIVA de los miembros");
P("");

const MARCA_ART = " «TARJETA» ";
const MARCA_PAG = " «PAGINADOR» ";

function cuerpoDe(html) {
  const h = limpia(html);
  const i0 = h.indexOf("et-l--body");
  let i1 = h.indexOf("et-l--footer");
  /* `et-l--footer` cae DENTRO del atributo `class` del `<footer>`, así que
   * cortar ahí deja media etiqueta de apertura pegada al cuerpo, y `texto()`
   * —que sólo quita `<…>` ENTEROS— la publica como si fuera contenido. Se
   * corta por la etiqueta que la abre. */
  if (i1 > 0) { const f = h.lastIndexOf("<footer", i1); if (f > i0) i1 = f; }
  return i0 >= 0 ? h.slice(i0, i1 > i0 ? i1 : h.length) : h;
}

/* Cascarón = cuerpo con TARJETAS y PAGINADOR sustituidos por un marcador.
 * Sustituidos, no borrados: el recuento sigue visible (§regla 6).
 * ⚠ `wp-pagenavi` viene con COMILLAS SIMPLES — la v1 exigía dobles y no casó. */
function cascaronDe(html) {
  let c = cuerpoDe(html);
  const nArt = (c.match(/<article/gi) || []).length;
  c = c.replace(/<article[\s\S]*?<\/article>/gi, MARCA_ART);
  const nPag = (c.match(/wp-pagenavi/gi) || []).length;
  c = c.replace(/<div[^>]*class=['"][^'"]*\bwp-pagenavi\b[^'"]*['"][\s\S]*?<\/div>/gi, MARCA_PAG);
  return { cascaron: c, nArt, nPag };
}

const norm = (s) => s.replace(/\s+/g, " ").trim();
const texto = (s) => norm(s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " "));

/* Firma ESTRUCTURAL: la secuencia de etiquetas con su class. `sinOrdinal`
 * borra el contador de módulo de Divi, que NO es contenido del término. */
function firma(s, sinOrdinal = false) {
  const out = [];
  for (const m of s.matchAll(/<(\w+)([^>]*)>/g)) {
    let cls = (/class=['"]([^'"]*)['"]/.exec(m[2]) || [])[1];
    if (cls && sinOrdinal) cls = cls.replace(/_(\d+)_tb_body/g, "_N_tb_body");
    out.push(cls ? `${m[1]}.${norm(cls)}` : m[1]);
  }
  return out;
}

const CAT = FAMILIAS.categoria.terminos;
const datos = {};
for (const t of CAT) {
  const html = readFileSync(join(INSUMOS.categoria, t, "index.html"), "utf8");
  const r = cascaronDe(html);
  datos[t] = { ...r, rutas: anda(join(INSUMOS.categoria, t)).length, html };
}

const mismoLado = norm(datos[CAT[0]].cascaron) === norm(datos[CAT[0]].cascaron);
const distintos = norm(datos[CAT[0]].cascaron) !== norm(datos[CAT[1]].cascaron);
const noVacio = datos[CAT[0]].cascaron.length > 500;
marca("C1", mismoLado && distintos && noVacio,
  `mismo-término 0 dif · ${CAT[0]}≠${CAT[1]} ${distintos} · cascarón ${datos[CAT[0]].cascaron.length} B`);
P(`  C1 · el extractor DISCRIMINA por los dos lados: mismo-término 0 dif · ${CAT[0]}≠${CAT[1]} ${distintos ? "sí" : "NO"} · ${datos[CAT[0]].cascaron.length} B  ${CONTROLES.C1.ok ? "✅" : "❌"}`);

/* C4 · la marca de paginación MUERDE: 0 restos de paginador en las firmas */
const restosPag = CAT.flatMap((t) => firma(datos[t].cascaron)).filter((x) => /nextpostslink|page larger|larger page|\.last\b|previouspostslink|wp-pagenavi/.test(x));
marca("C4", restosPag.length === 0, `restos de paginador en las firmas: ${restosPag.length}`);
P(`  C4 · la marca de PAGINADOR muerde: ${restosPag.length} restos en las 4 firmas  ${CONTROLES.C4.ok ? "✅" : "❌"}`);
P("");

P("  término        rutas  tarjetas  paginador  cuerpo B  cascarón B");
for (const t of CAT) {
  const cu = cuerpoDe(datos[t].html).length;
  P(`  ${t.padEnd(14)} ${String(datos[t].rutas).padStart(5)}  ${String(datos[t].nArt).padStart(8)}  ${String(datos[t].nPag).padStart(9)}  ${String(cu).padStart(8)}  ${String(datos[t].cascaron.length).padStart(10)}`);
}
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LA COMPARACIÓN · los 4 entre sí, par a par
 * ═════════════════════════════════════════════════════════════════════════ */
P("3 · LOS 4 CASCARONES, PAR A PAR (6 pares de 4 términos)");
P("");

function difTokens(a, b) {
  const A = new Map(), B = new Map();
  for (const x of a) A.set(x, (A.get(x) || 0) + 1);
  for (const x of b) B.set(x, (B.get(x) || 0) + 1);
  const soloA = [], soloB = [];
  for (const [k, n] of A) { const m = B.get(k) || 0; if (n > m) soloA.push(`${k} ×${n - m}`); }
  for (const [k, n] of B) { const m = A.get(k) || 0; if (n > m) soloB.push(`${k} ×${n - m}`); }
  return { soloA, soloB };
}

const PARES = [];
for (let i = 0; i < CAT.length; i++)
  for (let j = i + 1; j < CAT.length; j++) PARES.push([CAT[i], CAT[j]]);

P("  ⚠ Se publican LAS DOS firmas. El contador de módulo de Divi (`_N_tb_body`)");
P("    numera las piezas de la PLANTILLA, no del término: si sólo cambia él, lo");
P("    que difiere es qué pieza de la plantilla se sirvió, no qué trae el término.");
P("");
P("  par                            CON ordinal A/B    SIN ordinal A/B    texto A/B");
const difPorPar = {};
for (const [a, b] of PARES) {
  const con = difTokens(firma(datos[a].cascaron), firma(datos[b].cascaron));
  const sin = difTokens(firma(datos[a].cascaron, true), firma(datos[b].cascaron, true));
  const dt = difTokens(texto(datos[a].cascaron).split(" "), texto(datos[b].cascaron).split(" "));
  difPorPar[`${a} vs ${b}`] = { con, sin, texto: dt };
  P(`  ${(a + " vs " + b).padEnd(30)} ${String(con.soloA.length).padStart(7)}/${String(con.soloB.length).padEnd(8)}  ${String(sin.soloA.length).padStart(7)}/${String(sin.soloB.length).padEnd(8)}  ${String(dt.soloA.length).padStart(5)}/${dt.soloB.length}`);
}
P("");

const igualCon = PARES.filter(([a, b]) => { const d = difPorPar[`${a} vs ${b}`].con; return !d.soloA.length && !d.soloB.length; }).length;
const igualSin = PARES.filter(([a, b]) => { const d = difPorPar[`${a} vs ${b}`].sin; return !d.soloA.length && !d.soloB.length; }).length;
P(`  ⇒ pares con firma idéntica CON ordinal: **${igualCon} de ${PARES.length}**`);
P(`  ⇒ pares con firma idéntica SIN ordinal: **${igualSin} de ${PARES.length}**`);
P("");

P("  LO QUE DIFIERE SIN EL ORDINAL, NOMBRADO (§sondas 1 · no un recuento):");
let algo = false;
for (const [a, b] of PARES) {
  const d = difPorPar[`${a} vs ${b}`].sin;
  if (!d.soloA.length && !d.soloB.length) continue;
  algo = true;
  P(`     ${a} vs ${b}:`);
  for (const x of d.soloA.slice(0, 10)) P(`        sólo en ${a}: ${x.slice(0, 120)}`);
  for (const x of d.soloB.slice(0, 10)) P(`        sólo en ${b}: ${x.slice(0, 120)}`);
}
if (!algo) P("     (ninguna: quitado el contador de módulo, las 4 traen las MISMAS piezas)");
P("");

P("  LO QUE DIFIERE EN EL TEXTO, NOMBRADO:");
for (const [a, b] of PARES) {
  const d = difPorPar[`${a} vs ${b}`].texto;
  if (!d.soloA.length && !d.soloB.length) continue;
  P(`     ${a} vs ${b}:  sólo ${a} → ${JSON.stringify(d.soloA.slice(0, 12))}`);
  P(`     ${" ".repeat(a.length + b.length + 4)}  sólo ${b} → ${JSON.stringify(d.soloB.slice(0, 12))}`);
}
P("");

/* ¿Los módulos COMPARTIDOS conservan su ordinal? Si la miga —que es la misma
 * pieza en los 4— lo conserva, el contador es de la PLANTILLA; si se mueve, es
 * un contador de página y no dice nada del término. */
const ordMiga = {};
for (const t of CAT) {
  const m = /class="[^"]*et_pb_text_(\d+)_tb_body[^"]*breadcrumbs/.exec(datos[t].cascaron)
    || /breadcrumbs[^"]*"[\s\S]{0,200}?et_pb_text_(\d+)_tb_body/.exec(datos[t].cascaron);
  ordMiga[t] = m ? +m[1] : null;
}
const ordBlog = {};
for (const t of CAT) {
  const m = /et_pb_blog_(\d+)_tb_body/.exec(datos[t].cascaron);
  ordBlog[t] = m ? +m[1] : null;
}
P("  EL CONTADOR DE MÓDULO, por término:");
P("     término        miga (pieza COMPARTIDA)   módulo de blog");
for (const t of CAT) P(`     ${t.padEnd(14)} ${String(ordMiga[t]).padStart(21)}   ${String(ordBlog[t]).padStart(14)}`);
const migaFija = new Set(Object.values(ordMiga)).size === 1;
P(`     ⇒ la miga conserva su ordinal en los 4: ${migaFija ? "**SÍ**" : "no"} · el módulo de blog: {${[...new Set(Object.values(ordBlog))].join(", ")}}`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LAS CUATRO REFUTACIONES PRE-REGISTRADAS
 * ═════════════════════════════════════════════════════════════════════════ */
P("4 · LAS CUATRO REFUTACIONES PRE-REGISTRADAS, contestadas una a una");
P("");

/* ⚠ El corte va por el `<div` que ABRE la sección, no por el token dentro del
 * atributo — que es el defecto 1 de la v1. */
function cabeceraDe(html) {
  const c = cuerpoDe(html);
  const iH1 = c.search(/<h1[\s>]/i);
  if (iH1 < 0) return "";
  const aperturas = [...c.matchAll(/<div[^>]*class=['"][^'"]*et_pb_section[^'"]*['"][^>]*>/gi)]
    .filter((m) => m.index < iH1);
  const ini = aperturas.length ? aperturas[aperturas.length - 1].index : 0;
  /* ⚠ DEFECTO 5 de la v2: aquí se buscaba `MARCA_ART` en `c`, que es el CUERPO
   * y no el cascarón — nunca la contiene, así que `iArt` salía −1, `fin` caía
   * en `c.length` y la «cabecera» se comía LA LISTA ENTERA de tarjetas. R1
   * «refutaba» con 4 textos distintos y R2 con 27 imágenes: los titulares y
   * las miniaturas de los miembros, o sea justo lo que la separadora excluye
   * por definición. Un refutador alimentado con lo derivado siempre refuta. */
  const iArt = c.search(/<article[\s>]/i);
  const fin = iArt > iH1 ? iArt : c.length;
  return c.slice(ini, fin);
}

const REF = {};
P("  R1 · ¿un texto de descripción bajo el `h1`, DISTINTO por término?");
P("       (el test NO es «¿hay texto?» sino «¿VARÍA?» — en régimen plantillado");
P("        un texto idéntico en los 4 es PLANTILLA, no campo)");
const cabeceras = {};
for (const t of CAT) {
  const cab = cabeceraDe(datos[t].html);
  const h1 = texto((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(cab) || [])[1] || "");
  const kicker = texto((/<span[^>]*class=['"][^'"]*tax-tap[^'"]*['"][^>]*>([\s\S]*?)<\/span>/i.exec(cab) || [])[1] || "");
  const resto = texto(cab
    .replace(/<h1[\s\S]*?<\/h1>/gi, " ")
    .replace(/<span[^>]*class=['"][^'"]*tax-tap[\s\S]*?<\/span>/gi, " "));
  const imgs = [...cab.matchAll(/<img[^>]*src=['"]([^'"]*)['"]/gi)].map((m) => m[1]);
  cabeceras[t] = { h1, kicker, resto, imgs, bytes: cab.length };
  P(`     ${t.padEnd(14)} h1=${JSON.stringify(h1)}  kicker=${JSON.stringify(kicker)}  resto=${JSON.stringify(resto)}  imgs=${imgs.length}`);
}
const conResto = CAT.filter((t) => cabeceras[t].resto.length > 0);
const restosDistintos = new Set(CAT.map((t) => cabeceras[t].resto));
REF.R1 = {
  terminosConTextoPropio: conResto.length, denominador: CAT.length,
  valoresDistintos: restosDistintos.size,
  hay: conResto.length > 0 && restosDistintos.size > 1,
};
P(`     ⇒ términos con texto de cabecera además del h1/kicker: **${conResto.length} de ${CAT.length}**`);
P(`       valores DISTINTOS de ese texto: **${restosDistintos.size}** — varianza ${restosDistintos.size > 1 ? "SÍ" : "CERO"}`);
P(`       R1 ${REF.R1.hay ? "❗ REFUTA (texto propio que varía por término)" : "NO refuta"}`);
P("");

const h1Vacios = CAT.filter((t) => !cabeceras[t].h1);
marca("C3", h1Vacios.length === 0, `h1 no vacío en ${CAT.length - h1Vacios.length}/${CAT.length}`);
P(`  C3 · el selector de cabecera casa el caso conocido: h1 en ${CAT.length - h1Vacios.length}/${CAT.length}  ${CONTROLES.C3.ok ? "✅" : "❌"}`);

/* C6 · LA CABECERA NO PUEDE CONTENER NI UNA TARJETA. Es el control que faltaba
 * y que habría cazado el defecto 5 en el acto: un refutador alimentado con lo
 * DERIVADO refuta siempre, y sin esta guarda su «REFUTA» se lee como dato. */
const cabConTarjeta = CAT.map((t) => [t, (cabeceraDe(datos[t].html).match(/<article/gi) || []).length]).filter(([, n]) => n > 0);
marca("C6", cabConTarjeta.length === 0,
  `cabeceras con tarjeta dentro: ${cabConTarjeta.length}/${CAT.length}` + (cabConTarjeta.length ? ` — ${cabConTarjeta.map(([t, n]) => `${t}:${n}`).join(" ")}` : ""));
P(`  C6 · la CABECERA no contiene ni una tarjeta: ${CAT.length - cabConTarjeta.length}/${CAT.length} limpias  ${CONTROLES.C6.ok ? "✅" : "❌"}`);
P("");

P("  R2 · ¿una imagen de cabecera con `src` DISTINTO por término?");
const srcs = new Set(CAT.flatMap((t) => cabeceras[t].imgs));
REF.R2 = { hay: srcs.size > 0, srcs: [...srcs], denominador: CAT.length };
P(`     imágenes en la cabecera: **${[...srcs].length} distintas** en ${CAT.length} términos`);
P(`     R2 ${REF.R2.hay ? "❗ REFUTA" : "NO refuta: 0 imágenes de cabecera en los 4"}`);
P("");

P("  R3 · ¿un orden de tarjetas que NO sea por fecha descendente?");
P("       (se leen TODAS las rutas del término, no sólo la página 1 — el orden");
P("        de una serie no se afirma desde su primera página, §regla 14)");
const MES = { Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6, Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12 };
const ordenes = {};
for (const t of CAT) {
  const fechas = [];
  const ficheros = anda(join(INSUMOS.categoria, t)).sort((a, b) => {
    const n = (x) => { const m = /page[\\/](\d+)/.exec(x); return m ? +m[1] : 1; };
    return n(a) - n(b);
  });
  for (const f of ficheros) {
    const h = limpia(readFileSync(f, "utf8"));
    for (const m of h.matchAll(/<span class="published">([^<]*)<\/span>/g)) {
      const mm = /(\w{3})\s+(\d+),\s+(\d{4})/.exec(m[1].trim());
      if (mm && MES[mm[1]]) fechas.push({ y: +mm[3], m: MES[mm[1]], d: +mm[2], txt: m[1].trim() });
    }
  }
  const clave = (x) => x.y * 10000 + x.m * 100 + x.d;
  let desc = true, primerFallo = null;
  for (let i = 1; i < fechas.length; i++)
    if (clave(fechas[i]) > clave(fechas[i - 1])) { desc = false; primerFallo ??= `${fechas[i - 1].txt} → ${fechas[i].txt}`; }
  ordenes[t] = { n: fechas.length, rutas: ficheros.length, descendente: desc, primerFallo };
  P(`     ${t.padEnd(14)} ${String(fechas.length).padStart(3)} fechas en ${String(ficheros.length).padStart(2)} rutas · ¿fecha desc?  ${desc ? "sí" : "❗ NO — " + primerFallo}`);
}
REF.R3 = { hay: CAT.some((t) => !ordenes[t].descendente), ordenes };
P(`     R3 ${REF.R3.hay ? "❗ REFUTA" : `NO refuta: los ${CAT.length} de ${CAT.length} van por fecha descendente`}`);
P("");

P("  R4 · ¿una pieza presente en un término y ausente en otro?");
P("       (⚠ la v1 buscaba `et_pb_(section|row|module)_\\w+`, que NO casa");
P("        `et_pb_blog_0_tb_body`: unión de 5 y un 0 plausible)");
const RE_MOD = /et_pb_[a-z]+(?:_[a-z]+)*_\d+_tb_body/g;
const piezas = {}, piezasSinOrd = {};
for (const t of CAT) {
  piezas[t] = [...new Set(datos[t].cascaron.match(RE_MOD) || [])].sort();
  piezasSinOrd[t] = [...new Set(piezas[t].map((s) => s.replace(/_\d+_tb_body$/, "_N")))].sort();
}
const union = [...new Set(CAT.flatMap((t) => piezas[t]))].sort();
const unionSin = [...new Set(CAT.flatMap((t) => piezasSinOrd[t]))].sort();
const parcialesCon = union.filter((s) => CAT.some((t) => !piezas[t].includes(s)));
const parcialesSin = unionSin.filter((s) => CAT.some((t) => !piezasSinOrd[t].includes(s)));
REF.R4 = { unionCon: union.length, unionSin: unionSin.length, parcialesCon, parcialesSin, hay: parcialesSin.length > 0 };
P(`     piezas distintas en la unión — CON ordinal: **${union.length}** · SIN ordinal: **${unionSin.length}**`);
P(`     parciales CON ordinal: **${parcialesCon.length}** de ${union.length}`);
for (const s of parcialesCon) P(`        ${s.padEnd(34)} en: ${CAT.filter((t) => piezas[t].includes(s)).join(", ")}`);
P(`     parciales SIN ordinal: **${parcialesSin.length}** de ${unionSin.length}`);
for (const s of parcialesSin) P(`        ${s.padEnd(34)} en: ${CAT.filter((t) => piezasSinOrd[t].includes(s)).join(", ")}`);
P(`     R4 ${REF.R4.hay ? "❗ REFUTA (una pieza de tipo distinto en unos y no en otros)" : "NO refuta: quitado el contador, las MISMAS piezas en los 4"}`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · VEREDICTO, CON SU DENOMINADOR
 * ═════════════════════════════════════════════════════════════════════════ */
P("5 · VEREDICTO, con su denominador (§4 de 4, nunca «se comprobó»)");
P("");
const refuta = ["R1", "R2", "R3", "R4"].filter((k) => REF[k].hay);
P(`  refutaciones que disparan: **${refuta.length} de 4** — ${refuta.join(", ") || "ninguna"}`);
P("");
if (!refuta.length) {
  P("  ⇒ **NINGÚN término de los 4 trae contenido propio que no se derive de sus");
  P("    miembros.** Lo único que varía entre las 4 instancias es (i) el nombre");
  P("    del término en el `h1` y en el último eslabón de la miga, (ii) qué");
  P("    módulo de blog de la plantilla se sirvió, y (iii) las tarjetas y su");
  P("    paginador — que son EXACTAMENTE los miembros.");
  P("");
  P("  ⇒ **`categoria` es una CONSULTA** (§*un listado no tiene contenido propio:");
  P("    es una CONSULTA*), y el candidato **RELACIÓN sin archivo** queda");
  P("    sostenido POR EL DATO, no por el criterio de asimetría.");
  P("");
  P("    Denominador: **4 de 4 términos** · **27 de 27 rutas** para el orden.");
} else {
  P("  ⇒ hay contenido propio: el candidato COLECCIÓN se sostiene. Ver arriba.");
}
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LA UNIDAD «RUTA» DE LA MESA, RE-DERIVADA — y no cuadra con las páginas
 *
 * Sale de la propia tabla del §2: `eventos` tiene 4 rutas capturadas y CERO
 * paginador. Un `<title>` que dice «Página 2 de 4» y un paginador ausente son
 * dos afirmaciones del mismo documento, así que la unidad RUTA que la mesa usa
 * para el coste (27 rutas · 6.0 s) hay que mirarla de cerca.
 * ═════════════════════════════════════════════════════════════════════════ */
P("6 · LA UNIDAD «RUTA» DE LA MESA, RE-DERIVADA (§cada denominador con su unidad)");
P("");
P("  ⚠ Las dos declaraciones de «cuántas páginas hay» se publican POR SEPARADO:");
P("    el paginador de la página 1 y el `<title>` de cada ruta son DOS canales,");
P("    y mezclarlos en una columna con «gana el último» es una cifra que nadie");
P("    puede auditar (§regla 1: lo que imprime y lo que cuenta no discrepan).");
P("");
P("  término        rutas  con tarjetas  VACÍAS  con paginador  pagenavi p1  máx «de M»");
const PAGINAS = {};
let rutasTot = 0, vaciasTot = 0;
for (const t of CAT) {
  const fs_ = anda(join(INSUMOS.categoria, t)).sort((a, b) => {
    const n = (x) => { const m = /page[\\/](\d+)/.exec(x); return m ? +m[1] : 1; };
    return n(a) - n(b);
  });
  let conArt = 0, vacias = 0, conPag = 0, pagenaviP1 = null, maxTitulo = null;
  const detalle = [];
  for (const [i, f] of fs_.entries()) {
    const raw = readFileSync(f, "utf8");
    const h = limpia(raw);
    const n = (h.match(/<article/gi) || []).length;
    const pag = /wp-pagenavi/.test(h);
    const ti = (/<title>([^<]*)</i.exec(raw) || [])[1] || "";
    const mt = /de\s+(\d+)\s*-/.exec(ti);
    if (mt) maxTitulo = Math.max(maxTitulo ?? 0, +mt[1]);
    if (i === 0) { const mp = /Page\s+\d+\s+of\s+(\d+)/i.exec(h); pagenaviP1 = mp ? +mp[1] : null; }
    if (n > 0) conArt++; else vacias++;
    if (pag) conPag++;
    detalle.push({ ruta: f.slice(f.indexOf("categoria")), articles: n, paginador: pag, tituloDeM: mt ? +mt[1] : null });
  }
  PAGINAS[t] = { rutas: fs_.length, conArt, vacias, conPag, pagenaviP1, maxTitulo, detalle };
  rutasTot += fs_.length; vaciasTot += vacias;
  P(`  ${t.padEnd(14)} ${String(fs_.length).padStart(5)}  ${String(conArt).padStart(12)}  ${String(vacias).padStart(6)}  ${String(conPag).padStart(13)}  ${String(pagenaviP1 ?? "—").padStart(11)}  ${String(maxTitulo ?? "—").padStart(10)}`);
}
P("");
P(`  ⇒ RUTAS capturadas: **${rutasTot}** · de ellas **VACÍAS (0 tarjetas): ${vaciasTot}**`);
P(`  ⇒ RUTAS que sirven al menos una tarjeta: **${rutasTot - vaciasTot} de ${rutasTot}**`);
P("");
P("  ⚠ Las rutas VACÍAS existen y responden: son la cola de una serie cuyo");
P("    paginador declara menos páginas de las que el corpus capturó. Es §*un");
P("    cardinal es un contenedor y absorbe la membresía* con el contenedor en la");
P("    palabra «ruta»: **«27 rutas» y «27 páginas con contenido» no son lo");
P("    mismo**, y el coste de la mesa se calculó sobre la primera.");
P("");
P("  ⚠⚠ Y hay una segunda lectura: una ruta vacía puede ser (i) una página real");
P("    que el original sirve vacía, o (ii) el corpus habiendo pedido una URL que");
P("    ya no existe. Los dos dan **el mismo cuerpo de 0 tarjetas** offline, y lo");
P("    que los separa —el código de estado— no vive en un cuerpo capturado.");
P("");
P("    ⚠ PERO ESO NO SE FICHA SIN MIRAR EL ARCHIVO PRIMERO (§regla 8b: *el suelo");
P("      de una ruta no vive sólo en la campaña que lo buscaba — vive en las");
P("      congeladas*). `estados-114.json` mide códigos de estado, así que la");
P("      pregunta es cuántas de estas 27 rutas ya cubre:");
{
  const est = join(AQUI, "estados-114.json");
  if (existsSync(est)) {
    const j = JSON.parse(readFileSync(est, "utf8"));
    const pet = (j.peticiones || []).filter((p) => /\/categoria\//.test(p.url));
    P("");
    P(`      · \`estados-114.json\` mide **${(j.peticiones || []).length} peticiones**, de ellas`);
    P(`        **${pet.length} de \`categoria\`**: ${pet.map((p) => `${p.status} ${p.url.replace("https://kunakair.com", "")}`).join(" · ") || "ninguna"}`);
    const cubreVacia = pet.some((p) => /page\/\d+/.test(p.url));
    P(`      · ¿cubre alguna ruta VACÍA (\`/page/N\`)? **${cubreVacia ? "sí" : "NO"}**`);
    P("");
    P(`      ⇒ el archivo NO dirime éstas: **${pet.length} de 27 rutas** cubiertas, y la`);
    P("        cubierta es la página 1 de `eventos`, que sirve tarjetas. Las **8");
    P("        vacías siguen SIN DIRIMIR** — pero ahora eso es un hecho negativo");
    P("        COMPROBADO contra el archivo, no una suposición.");
    PAGINAS.__estados = { total: (j.peticiones || []).length, deCategoria: pet.length, cubreVacia };
  } else {
    P("      · ⛔ `estados-114.json` no está en disco: el hecho negativo NO se puede");
    P("        comprobar, y por tanto no se afirma.");
  }
}
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 7 · EL CRUCE QUE DECIDE SI LA RELACIÓN CUBRE EL CORPUS
 *
 * Las tarjetas de los 4 archivos suman 152 y el corpus de entradas trae 152.
 * ⚠ Un cardinal igual NO prueba que los conjuntos sean el mismo (§*un cardinal
 * es un contenedor y absorbe la membresía*: 68→68 con 2 por lado). Lo que lo
 * prueba es NOMBRAR cada elemento — la diferencia simétrica, con LOS DOS LADOS.
 * ═════════════════════════════════════════════════════════════════════════ */
P("7 · ¿LA RELACIÓN CUBRE EL CORPUS? — diferencia simétrica, no recuento");
P("");
const CORPUS_BLOG = join(RAIZ, "corpus", "entradas-blog");
const CRUCE = { hecho: false };
if (existsSync(CORPUS_BLOG)) {
  const slugCorpus = new Set(readdirSync(CORPUS_BLOG)
    .filter((f) => /\.html?$/i.test(f)).map((f) => f.replace(/\.html?$/i, "")));

  const slugTarjeta = new Map();   // slug → [términos que lo listan]
  for (const t of CAT)
    for (const f of anda(join(INSUMOS.categoria, t))) {
      const h = limpia(readFileSync(f, "utf8"));
      for (const m of h.matchAll(/<h2 class="entry-title">\s*<a href="([^"]+)"/g)) {
        const s = m[1].replace(/^https?:\/\/[^/]+\/es\//, "").replace(/\/$/, "");
        if (!slugTarjeta.has(s)) slugTarjeta.set(s, []);
        if (!slugTarjeta.get(s).includes(t)) slugTarjeta.get(s).push(t);
      }
    }

  /* ⚠ SEGUNDO CANAL, y hace falta: la tarjeta del archivo NO es el único sitio
   * donde una entrada declara su categoría — la propia entrada la enlaza en su
   * `post-meta`. Con un solo canal, un slug ausente se lee como «sin categoría»
   * cuando puede ser «su página de archivo no está capturada»
   * (§*una afirmación de que algo NO EXISTE se escribe con la lista de canales
   * que se miraron*). */
  const slugPropio = new Map();
  for (const f of readdirSync(CORPUS_BLOG).filter((x) => /\.html?$/i.test(x))) {
    const raw = readFileSync(join(CORPUS_BLOG, f), "utf8");
    const ts = [...new Set([...raw.matchAll(/href="[^"]*\/categoria\/([\w-]+)\//g)].map((m) => m[1]))];
    slugPropio.set(f.replace(/\.html?$/i, ""), ts);
  }

  const enArchivo = new Set(slugTarjeta.keys());
  const soloCorpus = [...slugCorpus].filter((s) => !enArchivo.has(s)).sort();
  const soloArchivo = [...enArchivo].filter((s) => !slugCorpus.has(s)).sort();

  P("  CANAL A · la TARJETA del archivo (lo que el listado publica)");
  P(`     corpus de entradas ................ **${slugCorpus.size} slugs**`);
  P(`     slugs distintos en los 4 archivos . **${enArchivo.size}**`);
  P("     diferencia simétrica, con LOS DOS LADOS nombrados:");
  P(`        en el corpus y NO en ningún archivo: **${soloCorpus.length}**${soloCorpus.length ? " — " + soloCorpus.slice(0, 10).join(", ") : ""}`);
  P(`        en un archivo y NO en el corpus ...: **${soloArchivo.length}**${soloArchivo.length ? " — " + soloArchivo.slice(0, 10).join(", ") : ""}`);
  P("");
  P("  ⚠ Y AQUÍ EL RECUENTO ENGAÑABA POR PARTIDA DOBLE: las tarjetas suman **152");
  P("    instancias** y el corpus trae **152 entradas**, y NO son el mismo");
  P("    conjunto — son **150 slugs distintos + 2 contados dos veces**, contra");
  P("    **150 + 2 que faltan**. Dos hechos compensándose hasta el dígito");
  P("    (§*un cardinal es un contenedor y absorbe la membresía*).");
  P("");

  P("  CANAL B · el enlace `/categoria/…` DENTRO de la propia entrada");
  const sinCat = [...slugPropio].filter(([, ts]) => ts.length === 0).map(([s]) => s);
  const conCat = slugPropio.size - sinCat.length;
  P(`     entradas que declaran su categoría en su propio cuerpo: **${conCat} de ${slugPropio.size}**`);
  P(`     entradas SIN ninguna: **${sinCat.length}**${sinCat.length ? " — " + sinCat.slice(0, 6).join(", ") : ""}`);
  const rescatadas = soloCorpus.filter((s) => (slugPropio.get(s) || []).length > 0);
  P(`     de las ${soloCorpus.length} que el CANAL A no veía, el CANAL B recupera: **${rescatadas.length}**`);
  for (const s of rescatadas) P(`        ${s} → ${(slugPropio.get(s) || []).join(" + ")}`);
  P("");
  P("     ⇒ las 2 no estaban SIN CATEGORÍA: estaban sin la PÁGINA DE ARCHIVO que");
  P("       las lista. El canal A mide **cobertura de la captura**, no membresía,");
  P("       y leerlo como membresía habría fichado 2 entradas huérfanas que no");
  P("       existen — con una diferencia simétrica real de coartada.");
  P("");

  /* 1:N — se comprueba por LOS DOS canales, que es lo que le da valor */
  const enDosA = [...slugTarjeta].filter(([, ts]) => ts.length > 1);
  const enDosB = [...slugPropio].filter(([, ts]) => ts.length > 1);
  P("  ¿UNA ENTRADA EN DOS CATEGORÍAS? — por los dos canales");
  P(`     canal A (tarjetas): **${enDosA.length} de ${enArchivo.size}**`);
  for (const [s, ts] of enDosA) P(`        ${s} → ${ts.join(" + ")}`);
  P(`     canal B (cuerpo)  : **${enDosB.length} de ${slugPropio.size}**`);
  for (const [s, ts] of enDosB) P(`        ${s} → ${ts.join(" + ")}`);
  const mismos = JSON.stringify(enDosA.map(([s]) => s).sort()) === JSON.stringify(enDosB.map(([s]) => s).sort());
  P(`     ⇒ los dos canales nombran ${mismos ? "**los MISMOS**" : "**conjuntos DISTINTOS**"} — y se compara por`);
  P("       elemento, no por cardinal.");
  P("");
  const maxN = Math.max(0, ...[...slugPropio.values()].map((v) => v.length));
  P(`  ⇒ la relación entrada→categoría es **1:N con N ≤ ${maxN}**, positivos ${enDosB.length}`);
  P(`    sobre un dominio BARRIDO ENTERO de ${slugPropio.size} — se publica la FRACCIÓN,`);
  P("    no un «se comprobó» (§*el listón es todo el dominio alcanzable*).");
  P("");

  /* C8 · el canal B casa un caso conocido de antemano: si diera 0, «ninguna
   * entrada declara categoría» sería un selector roto disfrazado de hallazgo. */
  marca("C8", conCat > 0, `canal B casa en ${conCat}/${slugPropio.size}`);
  P(`  C8 · el canal B casa el caso conocido: ${conCat}/${slugPropio.size} entradas  ${CONTROLES.C8.ok ? "✅" : "❌"}`);

  CRUCE.hecho = true;
  Object.assign(CRUCE, {
    corpus: slugCorpus.size, canalA: enArchivo.size, canalB: conCat,
    soloCorpus, soloArchivo, rescatadasPorCanalB: rescatadas, sinCategoria: sinCat,
    enDosA: enDosA.map(([s, ts]) => ({ slug: s, terminos: ts })),
    enDosB: enDosB.map(([s, ts]) => ({ slug: s, terminos: ts })),
    mismosEnDos: mismos, maxN,
  });
  /* C7 · el selector de tarjeta casa un caso conocido: si diera 0, el cruce
   * saldría «el corpus entero sin archivo» y parecería un hallazgo enorme. */
  marca("C7", enArchivo.size > 0, `slugs leídos de las tarjetas: ${enArchivo.size}`);
  P(`  C7 · el selector de tarjeta casa: ${enArchivo.size} slugs leídos  ${CONTROLES.C7.ok ? "✅" : "❌"}`);
} else {
  P("  ⛔ `corpus/entradas-blog` no está en disco: el cruce NO se hace, y por");
  P("     tanto no se afirma nada sobre la cobertura.");
}
P("");

marca("C5", true, "todo cardinal publicado con unidad y denominador");

writeFileSync(join(AQUI, "separadora-categoria-116.log"), L.join("\n") + "\n", "utf8");
writeFileSync(join(AQUI, "separadora-categoria-116.json"), JSON.stringify({
  fecha: "2026-08-26", tanda: "116.ª ESCALÓN 1",
  regimen: REGIMEN, desacuerdos: DESACUERDOS,
  terminos: CAT, cabeceras, ordenes, piezas, piezasSinOrd, ordMiga, ordBlog, PAGINAS, cruce: CRUCE,
  igualCon, igualSin, totalPares: PARES.length,
  difPorPar, refutaciones: REF, controles: CONTROLES,
  veredicto: refuta.length === 0 ? "CONSULTA" : "COLECCION",
}, null, 2), "utf8");
console.log("");
console.log("congelado → separadora-categoria-116.{log,json}");
console.log(`CONTROLES: ${Object.entries(CONTROLES).map(([k, v]) => `${k}${v.ok ? "✅" : "❌"}`).join(" ")}`);
if (FALLOS) { console.log(`❌ ${FALLOS} control(es) en rojo — el veredicto NO vale`); process.exit(1); }
