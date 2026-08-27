/* ═════════════════════════════════════════════════════════════════════════
 *  SEPARADORA (b) · `author` — ¿contenido propio o plantilla con la lista?
 *  116.ª · ESCALÓN 2 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * LA PREGUNTA que dejó la MESA-F3-4
 *   «¿el archivo `/author/` tiene contenido propio, o es la plantilla del tema
 *   con la lista dentro?»
 *
 * Y LA QUE VALE MÁS QUE F3-4
 *   `CLAUDE.md` declara **SIN PROBAR en todo el repo** la varianza entre
 *   instancias del régimen `--`: *«la columna dice lo que el mecanismo implica,
 *   y eso es una deducción, no un barrido»*. Estas 6 son la muestra que existe.
 *   Pero antes hay que saber **si de verdad son `--`**, y el ESCALÓN 1 dejó las
 *   dos señales del régimen EN DESACUERDO en 6 de 6.
 *
 * EL DISCRIMINADOR QUE LAS DESEMPATA — y no estaba escrito en ningún sitio
 *   Divi numera cada sección UNA VEZ: si hay N secciones `…_tb_body`, hay N
 *   ordinales DISTINTOS. Una plantilla PHP que copia la clase a mano repite
 *   **el mismo literal**. Así que la señal no es *«¿hay secciones `_tb_body`?»*
 *   sino **¿están NUMERADAS por Divi?** — o sea `ocurrencias == distintos`.
 *
 * CONTROLES (§regla 8)
 *   C1  el discriminador de régimen SEPARA (≥1 familia a cada lado)
 *   C2  el extractor de campos casa un CASO CONOCIDO DE ANTEMANO
 *   C3  el extractor DISCRIMINA por los dos lados (mismo autor 0 dif)
 *   C4  el buscador de `href` casa un caso conocido (si diera 0, «0 enlaces
 *       locales» sería un filtro roto disfrazado de verde — §sondas 4)
 *   C5  todo cardinal con su UNIDAD y su DENOMINADOR, por alcance SEPARADO
 *
 * TRES DEFECTOS DE LA v1, CAZADOS ANTES DE PUBLICAR (§sondas 1)
 *   1. el test de numeración salía «sí» para `mar_ramirez`, que tiene UNA
 *      sección: con `occ == 1` las dos hipótesis predicen lo mismo, o sea
 *      **0 instancias separadoras POR CONSTRUCCIÓN**. Contarlo como acierto es
 *      el caso degenerado que §*un discriminador hallado en una sola instancia
 *      tampoco es un discriminador* prohíbe. Sale INDETERMINADO;
 *   2. los ejes de varianza mezclaban CONTENIDO PROPIO con lo DERIVADO de los
 *      miembros —títulos de listado, nº de listados, nº de tarjetas—, y el
 *      veredicto salía «9 de 9 son CAMPO» contando cosas que la separadora
 *      excluye por definición. Es el defecto 5 del ESCALÓN 1 —*un refutador
 *      alimentado con lo derivado refuta siempre*— cometido sobre el RECUENTO
 *      en vez de sobre el extractor. Ahora van en dos grupos y sólo cuenta el
 *      primero: **7 de 7 propios**, y los 4 derivados se publican aparte;
 *   3. el §5 comparó «original» contra «cuerpo transformado», vio **612 → 0** y
 *      concluyó *«la transformación perdió una pieza»*. FALSO: la
 *      `ficha-autor-revisor` NO vive en el `post_content` sino en un MÓDULO DE
 *      LA PLANTILLA, así que su ausencia del cuerpo rico es CORRECTA. Lo que
 *      decide es el TERCER canal —qué emite la plantilla del clon—, y hubo que
 *      añadirlo. §*la salida servida incluye el canal que no estabas mirando*,
 *      con el canal puesto en qué parte del documento se transforma.
 *
 * SIN RED · SIN BUILD · SIN TOCAR `src/` NI `lib.mjs` (se LEE `apps/web/src`,
 * que es el canal C; leer no es tocar).
 * ═══════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../../..");

/* ══ PRECONDICIONES · lo primero (§regla 37) ═════════════════════════════ */
const INSUMOS = {
  autor: join(RAIZ, "corpus", "fase-3", "autor", "author"),
  categoria: join(RAIZ, "corpus", "fase-3", "categoria", "categoria"),
  sector: join(RAIZ, "corpus", "fase-3", "taxonomia-sector", "sector"),
  casos: join(RAIZ, "corpus", "casos"),
  faqs: join(RAIZ, "corpus", "faqs"),
  blog: join(RAIZ, "corpus", "entradas-blog"),
  transformado: join(RAIZ, "corpus", "transformado", "entradas-blog"),
  appWeb: join(RAIZ, "apps", "web", "src", "app"),
};
for (const [k, p] of Object.entries(INSUMOS))
  if (!existsSync(p))
    throw new Error(
      `PRECONDICIÓN AUSENTE · ${k} → ${p}\n` +
      `  Si esto se movió o se renombró, el nombre canónico quedó libre A\n` +
      `  PROPÓSITO para que falle en voz alta (§regla 5bis · 26 hermana).`);

const L = [];
const P = (s = "") => { L.push(s); console.log(s); };
let FALLOS = 0;
const CONTROLES = {};
const marca = (id, ok, nota) => { CONTROLES[id] = { ok, nota }; if (!ok) FALLOS++; };

const limpia = (h) => h
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const texto = (s) => norm(String(s).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " "));

function cuerpoDe(html) {
  const h = limpia(html);
  const i0 = h.indexOf("et-l--body");
  let i1 = h.indexOf("et-l--footer");
  if (i1 > 0) { const f = h.lastIndexOf("<footer", i1); if (f > i0) i1 = f; }
  return i0 >= 0 ? h.slice(i0, i1 > i0 ? i1 : h.length) : h;
}

function anda(d, out = []) {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) anda(p, out);
    else if (/\.html?$/i.test(e.name)) out.push(p);
  }
  return out;
}

P("═══ SEPARADORA (b) · `author` · 116.ª ESCALÓN 2 ═══");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL RÉGIMEN, DESEMPATADO — ¿están las secciones NUMERADAS por Divi?
 * ═════════════════════════════════════════════════════════════════════════ */
P("1 · EL RÉGIMEN, DESEMPATADO (el ESCALÓN 1 dejó las dos señales en desacuerdo)");
P("");
P("  Divi numera cada sección UNA vez: N secciones ⇒ N ordinales DISTINTOS.");
P("  Una plantilla PHP que copia la clase a mano repite EL MISMO literal. Así");
P("  que la señal no es «¿hay secciones `_tb_body`?» sino **¿están NUMERADAS?**");
P("");

const AUT = ["admin", "edurne-ibarrola", "irene", "javier-fernandez", "kunak", "mar_ramirez"];
const CAT = ["articulos", "eventos", "noticias", "podcast-es"];
const SEC = readdirSync(INSUMOS.sector, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(INSUMOS.sector, e.name, "index.html")))
  .map((e) => e.name);

/* ⚠ EL TEST ES DEGENERADO CON UNA SOLA SECCIÓN: con `occ == 1`, «numeradas» y
 * «repetidas» predicen LO MISMO — 0 instancias separadoras por construcción, no
 * por pobreza del dominio (§*un discriminador hallado en una sola instancia
 * tampoco es un discriminador*). Sale INDETERMINADO, que no es ni sí ni no. */
function numeracion(html) {
  const h = limpia(html);
  const occS = h.match(/et_pb_section_(\d+)_tb_body/g) || [];
  const occR = h.match(/et_pb_row_(\d+)_tb_body/g) || [];
  const dis = new Set(occS).size;
  return {
    secOcc: occS.length, secDis: dis,
    rowOcc: occR.length, rowDis: new Set(occR).size,
    numeradas: occS.length <= 1 ? null : occS.length === dis,
    literales: [...new Set(occS)],
  };
}
const diNumeradas = (n) => n.numeradas === null
  ? `— INDETERMINADO (${n.secOcc} sección: el test no separa)`
  : n.numeradas ? "sí" : `❌ NO — repite ${n.literales.join(",")}`;

const NUM = {};
P("  familia    término              sec occ/dis   row occ/dis   ¿NUMERADAS por Divi?");
for (const [fam, base, ts] of [
  ["categoria", INSUMOS.categoria, CAT],
  ["sector", INSUMOS.sector, SEC],
  ["author", INSUMOS.autor, AUT],
]) {
  NUM[fam] = [];
  for (const t of ts) {
    const n = numeracion(readFileSync(join(base, t, "index.html"), "utf8"));
    NUM[fam].push({ termino: t, ...n });
    P(`  ${fam.padEnd(10)} ${t.padEnd(20)} ${String(n.secOcc).padStart(4)}/${String(n.secDis).padEnd(6)}  ${String(n.rowOcc).padStart(6)}/${String(n.rowDis).padEnd(6)}  ${diNumeradas(n)}`);
  }
}
P("");
const cuenta = (r) => ({
  si: r.filter((x) => x.numeradas === true).length,
  no: r.filter((x) => x.numeradas === false).length,
  ind: r.filter((x) => x.numeradas === null).length,
});
const numPorFam = Object.fromEntries(Object.entries(NUM).map(([f, r]) => [f, cuenta(r)]));
P("  ⇒ por familia, con su denominador y con los INDETERMINADOS aparte:");
P("     familia     numeradas   repetidas   indeterminadas   de");
for (const [f, r] of Object.entries(NUM)) {
  const c = numPorFam[f];
  P(`     ${f.padEnd(11)} ${String(c.si).padStart(9)}   ${String(c.no).padStart(9)}   ${String(c.ind).padStart(14)}   ${r.length}`);
}
P("");
const todos = Object.values(NUM).flat();
marca("C1", todos.some((x) => x.numeradas === true) && todos.some((x) => x.numeradas === false),
  `separa: ${Object.entries(numPorFam).map(([f, c]) => `${f}=${c.si}sí/${c.no}no/${c.ind}ind`).join(" ")}`);
P(`  C1 · el discriminador SEPARA (hay instancias a los dos lados)  ${CONTROLES.C1.ok ? "✅" : "❌"}`);
P("");
P("  ⚠ `mar_ramirez` sale INDETERMINADO, no «sí»: tiene UNA sección, y con una");
P("    sola «numeradas» y «repetidas» predicen lo mismo — **0 instancias");
P("    separadoras POR CONSTRUCCIÓN**, no por pobreza del dominio. Contarlo como");
P("    acierto sería el caso degenerado que §*un discriminador hallado en una");
P("    sola instancia tampoco es un discriminador* prohíbe.");
P("");
P(`  ⇒ **\`author\` es régimen \`--\`**, con **${numPorFam.author.no} de ${NUM.author.length} decidibles y ${numPorFam.author.ind} indeterminada**:`);
P(`     sus secciones repiten el literal \`${NUM.author[0].literales.join(",")}\` hasta ${Math.max(...NUM.author.map((x) => x.secOcc))} veces, y el`);
P("     número de repeticiones **crece con el contenido**, que es la firma de un");
P("     bucle PHP escribiendo una clase a mano, no de un contador de builder.");
P("");
P("  ⚠ ESO REFUTA LA PREDICCIÓN PRE-REGISTRADA DE ESTA TANDA, y se dice:");
P("     el PASO 0 apostó a que el desacuerdo significaba que **el censo estaba");
P("     mal** y que estas 6 NO contestarían el SIN PROBAR del régimen `--`.");
P("     Medido: **el censo acertó**, y lo que falla es la SEGUNDA señal — la de");
P("     `CLAUDE.md`, *«secciones `…_tb_body`»*, que **no discrimina sola**");
P("     porque una plantilla del tema puede copiar la clase. La apuesta era");
P("     falsable y salió falsa; el desacuerdo era real y apuntaba al otro lado.");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · LOS 6 CASCARONES, COMPARADOS ENTRE SÍ
 * ═════════════════════════════════════════════════════════════════════════ */
P("2 · LOS 6 ARCHIVOS DE AUTOR, COMPARADOS ENTRE SÍ (varianza entre instancias)");
P("");
P("  Régimen `--` ⇒ el discriminador es LA VARIANZA ENTRE INSTANCIAS, no el px");
P("  absoluto: varianza cero ⇒ PLANTILLA · varía ⇒ CAMPO.");
P("");

const FOTO_DEFECTO = "assets/images/user.svg";
function camposDe(html) {
  const c = cuerpoDe(html);
  const cab = (/<div class="author-header">([\s\S]*?)<\/div>\s*<\/div>/i.exec(c) || [])[1] || c;
  const foto = (/<div class="author-header">[\s\S]{0,400}?<img[^>]*src="([^"]*)"/i.exec(c) || [])[1] || null;
  const h1 = texto((/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(c) || [])[1] || "");
  const infoBloque = (/<div class="author-info">([\s\S]*?)<div class="author-social-media">/i.exec(c) || [])[1] || "";
  const cargo = texto((/<p>([\s\S]*?)<\/p>/i.exec(infoBloque.replace(/<h1[\s\S]*?<\/h1>/i, "")) || [])[1] || "");
  const redes = [...(/<div class="author-social-media">([\s\S]*?)<\/div>/i.exec(c) || ["", ""])[1]
    .matchAll(/class="author-(\w+)"/g)].map((m) => m[1]);
  const bioBloque = (/class="[^"]*author-bio[^"]*"([\s\S]*?)(?=<div class="et_pb_section|$)/i.exec(c) || [])[1] || "";
  const bioH2 = texto((/<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(bioBloque) || [])[1] || "");
  const bioTexto = texto(bioBloque.replace(/<h2[\s\S]*?<\/h2>/i, ""));
  const listados = [...c.matchAll(/class="author-last-articles-title"[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => texto(m[1]));
  const miga = texto((/<ol class="kunak-breadcrumbs"[\s\S]*?<\/ol>/i.exec(c) || [""])[0]);
  return {
    foto, fotoEsDefecto: !!foto && foto.includes(FOTO_DEFECTO),
    h1, cargo, redes, bioH2, bioChars: bioTexto.length,
    tieneBio: /author-bio/.test(c), listados, nListados: listados.length,
    nArticulos: (c.match(/<article/gi) || []).length,
    miga, cascaronB: c.length,
  };
}

const A = {};
for (const t of AUT) A[t] = camposDe(readFileSync(join(INSUMOS.autor, t, "index.html"), "utf8"));

marca("C2", AUT.every((t) => A[t].h1.length > 0) && AUT.some((t) => A[t].redes.length > 0),
  `h1 en ${AUT.filter((t) => A[t].h1).length}/${AUT.length} · redes en ${AUT.filter((t) => A[t].redes.length).length}/${AUT.length}`);
P(`  C2 · el extractor casa el caso conocido: h1 en ${AUT.filter((t) => A[t].h1).length}/${AUT.length}, redes en ${AUT.filter((t) => A[t].redes.length).length}/${AUT.length}  ${CONTROLES.C2.ok ? "✅" : "❌"}`);
const c3a = JSON.stringify(camposDe(readFileSync(join(INSUMOS.autor, AUT[0], "index.html"), "utf8"))) === JSON.stringify(A[AUT[0]]);
const c3b = JSON.stringify(A[AUT[0]]) !== JSON.stringify(A[AUT[1]]);
marca("C3", c3a && c3b, `mismo autor idéntico: ${c3a} · dos autores distintos: ${c3b}`);
P(`  C3 · el extractor DISCRIMINA por los dos lados  ${CONTROLES.C3.ok ? "✅" : "❌"}`);
P("");

P("  término            foto        h1                              cargo                  redes            bio    listados  arts");
for (const t of AUT) {
  const a = A[t];
  P(`  ${t.padEnd(18)} ${(a.fotoEsDefecto ? "user.svg*" : "propia").padEnd(11)} ${a.h1.slice(0, 30).padEnd(31)} ${(a.cargo || "—").slice(0, 21).padEnd(22)} ${(a.redes.join(",") || "—").slice(0, 15).padEnd(16)} ${String(a.tieneBio ? a.bioChars : "—").padStart(5)}  ${String(a.nListados).padStart(8)}  ${String(a.nArticulos).padStart(4)}`);
}
P("     * `user.svg` es el marcador de foto del TEMA, no una foto del autor.");
P("");

/* Varianza campo a campo: constante ⇒ plantilla · varía ⇒ campo */
/* ⚠ LOS EJES SE PARTEN ANTES DE CONTARLOS. La separadora pregunta por contenido
 * **que no se derive de sus miembros**, así que un eje que depende de qué
 * entradas firmó el autor —los títulos de listado, cuántos listados hay— VARÍA
 * y NO es contenido propio. Meterlo en el recuento infla el veredicto con lo
 * mismo que la pregunta excluye (es el defecto 5 del ESCALÓN 1, cometido esta
 * vez sobre el RECUENTO en vez de sobre el extractor). */
const EJES_PROPIOS = {
  "foto (src)": (a) => a.foto,
  "foto ES la del tema": (a) => a.fotoEsDefecto,
  "h1 (nombre)": (a) => a.h1,
  "cargo": (a) => a.cargo,
  "redes (conjunto)": (a) => a.redes.slice().sort().join(","),
  "¿tiene bio?": (a) => a.tieneBio,
  "cuerpo de la bio (chars)": (a) => a.bioChars,
};
const EJES_DERIVADOS = {
  "títulos de listado": (a) => a.listados.slice().sort().join(" | "),
  "nº de listados": (a) => a.nListados,
  "nº de tarjetas": (a) => a.nArticulos,
  "encabezado de la bio": (a) => a.bioH2,
};
P("  VARIANZA EJE A EJE (§varianza cero ⇒ PLANTILLA · varía ⇒ CAMPO)");
P("");
P("  ⚠ Los ejes van PARTIDOS: la separadora pregunta por contenido que **no se");
P("    derive de los miembros**, así que lo que depende de qué entradas firmó el");
P("    autor varía y NO cuenta como contenido propio. Se publican los dos");
P("    grupos, y el veredicto se lee **sólo del primero**.");
P("");
const VARIANZA = {};
const mide = (titulo, ejes, grupo) => {
  P(`  ${titulo}`);
  P("  eje                          valores distintos   veredicto");
  for (const [eje, f] of Object.entries(ejes)) {
    const d = new Set(AUT.map((t) => JSON.stringify(f(A[t])))).size;
    VARIANZA[eje] = { grupo, distintos: d, denominador: AUT.length, veredicto: d === 1 ? "PLANTILLA" : "VARÍA" };
    P(`  ${eje.padEnd(28)} ${String(d).padStart(9)} de ${AUT.length}   ${d === 1 ? "varianza CERO" : "**VARÍA**"}`);
  }
  P("");
};
mide("GRUPO A · CONTENIDO PROPIO del término (lo que decide la separadora)", EJES_PROPIOS, "propio");
mide("GRUPO B · DERIVADO de los miembros (no decide — se publica para no colarlo)", EJES_DERIVADOS, "derivado");

const campos = Object.entries(VARIANZA).filter(([, v]) => v.grupo === "propio" && v.veredicto === "VARÍA").map(([k]) => k);
P(`  ⇒ ejes de CONTENIDO PROPIO que varían ⇒ son CAMPO: **${campos.length} de ${Object.keys(EJES_PROPIOS).length}**`);
P(`  ⇒ ejes DERIVADOS que varían (no cuentan): **${Object.entries(VARIANZA).filter(([, v]) => v.grupo === "derivado" && v.veredicto === "VARÍA").length} de ${Object.keys(EJES_DERIVADOS).length}**`);
P("");
P("  ⇒ **EL ARCHIVO `/author/` NO ES «la plantilla del tema con la lista dentro»**:");
P("    el término trae **foto, nombre, cargo, redes y biografía**, y ninguno de");
P("    los cinco se deriva de sus miembros. `author` es una ENTIDAD CON CAMPOS.");
P("");

/* ── LA SUB-APUESTA CIEGA DEL PASO 0 ────────────────────────────────────── */
P("  LA SUB-APUESTA CIEGA DEL PASO 0, contestada");
P("");
P("    Apuesta: «los ~170 KB que separan a los dos pequeños de los cuatro");
P("    grandes son LA LISTA, y los dos pequeños conservan la cabecera entera».");
P("");
const grandes = AUT.filter((t) => !A[t].fotoEsDefecto);
const pequenos = AUT.filter((t) => A[t].fotoEsDefecto);
P(`    · con foto PROPIA: **${grandes.length} de ${AUT.length}** — ${grandes.join(", ")}`);
P(`    · con la foto del TEMA: **${pequenos.length} de ${AUT.length}** — ${pequenos.join(", ")}`);
P(`    · con cargo no vacío: **${AUT.filter((t) => A[t].cargo).length} de ${AUT.length}**`);
P(`    · con biografía: **${AUT.filter((t) => A[t].tieneBio).length} de ${AUT.length}**`);
P("");
P("    ⇒ **REFUTADA por los dos lados.** Los dos pequeños NO conservan la");
P("      cabecera: traen la foto del tema, el cargo VACÍO (`<p></p>`) y NINGUNA");
P("      biografía. Y el bulto tampoco era la lista — es el `<style>` (§3).");
P("");
P("    ⇒ **Y eso cambia el esquema, no sólo el veredicto**: los campos `foto`,");
P("      `cargo`, `redes` y `bio` son **OPCIONALES**, con su fracción medida");
P("      arriba. §*un campo opcional no expresa un caso: sólo permite que");
P("      falte* — el caso hay que EJERCITARLO, y aquí el original lo ejercita");
P(`      ${pequenos.length} veces de ${AUT.length}.`);
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · EL CANAL QUE NO ES MARCADO · el `<style>` en línea
 * ═════════════════════════════════════════════════════════════════════════ */
P("3 · EL CANAL CSS · el `<style>` en línea, que es donde la 114.ª encontró lo suyo");
P("");
const STYLE = {};
for (const t of AUT) {
  const raw = readFileSync(join(INSUMOS.autor, t, "index.html"), "utf8");
  const bl = (raw.match(/<style[\s\S]*?<\/style>/gi) || []).map((s) => ({
    id: (/id="([^"]*)"/.exec(s) || [])[1] || "(sin id)", bytes: s.length,
  }));
  STYLE[t] = { n: bl.length, total: bl.reduce((a, x) => a + x.bytes, 0), bloques: bl };
}
P("  término            bloques  bytes de <style>   ids presentes");
for (const t of AUT)
  P(`  ${t.padEnd(18)} ${String(STYLE[t].n).padStart(7)}  ${String(STYLE[t].total).padStart(16)}   ${STYLE[t].bloques.map((b) => b.id.replace(/-inline-css$/, "")).join(" ")}`);
P("");
const ids = [...new Set(AUT.flatMap((t) => STYLE[t].bloques.map((b) => b.id)))];
const parciales = ids.filter((i) => AUT.some((t) => !STYLE[t].bloques.some((b) => b.id === i)));
P(`  ids distintos en la unión: **${ids.length}** · presentes en unos y NO en otros: **${parciales.length}**`);
for (const i of parciales) {
  const con = AUT.filter((t) => STYLE[t].bloques.some((b) => b.id === i));
  const bytes = [...new Set(con.map((t) => STYLE[t].bloques.find((b) => b.id === i).bytes))];
  P(`     ${i.padEnd(38)} en ${con.length}/${AUT.length}: ${con.join(", ")}`);
  P(`     ${" ".repeat(38)} bytes: ${bytes.join(" · ")} ${bytes.length === 1 ? "(idénticos)" : "(DISTINTOS)"}`);
}
P("");
/* ⚠ ANTES DE FICHARLO: ¿es de ESTOS DOS documentos o de la SESIÓN de captura?
 * Un artefacto de sesión se REPARTE; una propiedad del documento se concentra.
 * Se barre el corpus entero, que es lo que separa las dos hipótesis. */
P("  ¿ES DE ESTOS DOS DOCUMENTOS O DE LA SESIÓN DE CAPTURA? — se barre el corpus");
P("");
const ID_DIN = "divi-dynamic-critical-inline-css";
const REPARTO = {};
let totDoc = 0, totCon = 0;
for (const [n, d] of [
  ["fase-3", join(RAIZ, "corpus", "fase-3")],
  ["casos", INSUMOS.casos], ["faqs", INSUMOS.faqs], ["entradas-blog", INSUMOS.blog],
]) {
  const fs_ = anda(d);
  const con = fs_.filter((f) => readFileSync(f, "utf8").includes(ID_DIN)).length;
  REPARTO[n] = { con, de: fs_.length };
  totDoc += fs_.length; totCon += con;
  P(`     ${n.padEnd(15)} **${String(con).padStart(4)} de ${String(fs_.length).padStart(4)}**`);
}
P(`     ${"TOTAL".padEnd(15)} **${totCon} de ${totDoc}** — le faltan a **${totDoc - totCon}**`);
P("");
/* ⚠ «son los mismos» se DERIVA nombrando los dos conjuntos, no se afirma */
const sinBloque = [];
for (const [, d] of [["fase-3", join(RAIZ, "corpus", "fase-3")], ["casos", INSUMOS.casos], ["faqs", INSUMOS.faqs], ["entradas-blog", INSUMOS.blog]])
  for (const f of anda(d)) if (!readFileSync(f, "utf8").includes(ID_DIN)) sinBloque.push(f.slice(RAIZ.length + 1).replace(/\\/g, "/"));
const sinFotoPropia = AUT.filter((t) => A[t].fotoEsDefecto);
const mismos = sinBloque.length === sinFotoPropia.length
  && sinFotoPropia.every((t) => sinBloque.some((f) => f.includes(`/author/${t}/`)));
P(`  ⇒ de ${totDoc} documentos capturados, el bloque falta en **${sinBloque.length}**:`);
for (const f of sinBloque.slice(0, 8)) P(`       ${f}`);
P(`  ⇒ ¿son EXACTAMENTE los ${sinFotoPropia.length} autores sin foto propia y sin bio (${sinFotoPropia.join(", ")})?`);
P(`    **${mismos ? "SÍ" : "NO"}** — comparado por ELEMENTO, no por cardinal.`);
P("");
P("  ⚠ ESO NO PRUEBA EL MECANISMO, PERO SÍ DESCARTA UNO: un artefacto de la");
P("    SESIÓN de captura se repartiría por el corpus, y aquí se **concentra** en");
P("    2 de " + totDoc + " que además forman una clase definida por otra cosa. Lo que");
P("    queda —una función de CSS dinámico, una caché servida en frío— **no se");
P("    puede dirimir desde un cuerpo capturado**, y un mecanismo sin medir que");
P("    entra en una mesa la contamina. Se ficha con su cardinal y NO se explica.");
P("");
P("  ⚠⚠ Y TIENE CONSECUENCIA SOBRE LA VARIANZA DEL RÉGIMEN `--`: si el canal CSS");
P("     entra en la comparación, **la varianza NO es cero**. Así que el veredicto");
P("     del §4 se declara POR CANAL, y no se resume en una palabra.");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LA EXTENSIÓN A CASOS Y FAQ — con los cardinales DERIVADOS
 * ═════════════════════════════════════════════════════════════════════════ */
P("4 · CASOS y FAQ · el resto del régimen `--`, con sus cardinales DERIVADOS");
P("");
P("  `CLAUDE.md` dice «57 casos y 19 FAQ». No se cita: se deriva (§regla 9).");
P("");
const OTRAS = {};
for (const [fam, dir] of [["casos", INSUMOS.casos], ["faqs", INSUMOS.faqs]]) {
  const fs_ = readdirSync(dir).filter((f) => /\.html?$/i.test(f));
  const filas = fs_.map((f) => {
    const raw = readFileSync(join(dir, f), "utf8");
    const bc = (/<body[^>]*class="([^"]*)"/i.exec(raw) || [])[1] || "";
    const n = numeracion(raw);
    const censoDice = /\bet_pb_pagebuilder_layout\b/.test(bc) && /\bet-tb-has-body\b/.test(bc) ? "BT"
      : /\bet_pb_pagebuilder_layout\b/.test(bc) ? "B-" : /\bet-tb-has-body\b/.test(bc) ? "-T" : "--";
    return { fichero: f, censoDice, ...n, cuerpoB: cuerpoDe(raw).length };
  });
  OTRAS[fam] = { n: fs_.length, filas };
  const reg = {};
  for (const x of filas) reg[x.censoDice] = (reg[x.censoDice] || 0) + 1;
  const numeradas = filas.filter((x) => x.numeradas).length;
  P(`  ${fam.padEnd(6)} ficheros en disco: **${fs_.length}**  ·  régimen por el <body>: ${Object.entries(reg).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  P(`  ${" ".repeat(6)} secciones NUMERADAS por Divi: **${numeradas} de ${fs_.length}**`);
}
P("");
P(`  ⇒ contra lo que \`CLAUDE.md\` escribe: casos **${OTRAS.casos.n} vs 57** ${OTRAS.casos.n === 57 ? "✅ casa" : "❌ NO casa"} ·`);
P(`    FAQ **${OTRAS.faqs.n} vs 19** ${OTRAS.faqs.n === 19 ? "✅ casa" : "❌ NO casa"}`);
P("");
P("  ⚠ LA PREDICCIÓN PRE-REGISTRADA («al menos una de las dos cifras no casa»)");
P(`     sale **${OTRAS.casos.n === 57 && OTRAS.faqs.n === 19 ? "REFUTADA" : "confirmada"}**. Se dice, no se calla.`);
P("");

/* Varianza DENTRO de cada forma — el barrido que `CLAUDE.md` declara SIN PROBAR */
P("  VARIANZA ENTRE INSTANCIAS, dentro de cada forma (lo que decide `--`)");
P("");
function firmaCascaron(html) {
  const c = cuerpoDe(html)
    .replace(/<article[\s\S]*?<\/article>/gi, " «TARJETA» ");
  return [...c.matchAll(/<(\w+)[^>]*class=['"]([^'"]*)['"]/g)]
    .map((m) => `${m[1]}.${norm(m[2])}`).join("|");
}
const FORMAS = {};
for (const [fam, dir, lista] of [
  ["author", INSUMOS.autor, AUT.map((t) => join(INSUMOS.autor, t, "index.html"))],
  ["casos", INSUMOS.casos, readdirSync(INSUMOS.casos).filter((f) => /\.html?$/i.test(f)).map((f) => join(INSUMOS.casos, f))],
  ["faqs", INSUMOS.faqs, readdirSync(INSUMOS.faqs).filter((f) => /\.html?$/i.test(f)).map((f) => join(INSUMOS.faqs, f))],
]) {
  const firmas = lista.map((f) => firmaCascaron(readFileSync(f, "utf8")));
  const distintas = new Set(firmas).size;
  /* la firma «esqueleto»: sólo los nombres de clase estructurales, sin el
   * contenido — mide la RETÍCULA, no el texto */
  const esq = lista.map((f) => {
    const c = cuerpoDe(readFileSync(f, "utf8"));
    return [...new Set(c.match(/class=['"]([^'"]*)['"]/g) || [])].sort().join("|");
  });
  FORMAS[fam] = { n: lista.length, firmasDistintas: distintas, esqueletosDistintos: new Set(esq).size };
  P(`  ${fam.padEnd(8)} n=${String(lista.length).padStart(3)}  firmas de cascarón distintas: **${String(distintas).padStart(3)} de ${lista.length}**  ·  conjuntos de clase distintos: **${String(new Set(esq).size).padStart(3)} de ${lista.length}**`);
}
P("");
P("  ⚠ ESTO NO CIERRA EL «SIN PROBAR» DEL RÉGIMEN `--`, Y HAY QUE DECIR POR QUÉ.");
P("    Lo que `CLAUDE.md` declara sin medir es la varianza de **ritmo,");
P("    tipografía y retícula** entre instancias — o sea GEOMETRÍA COMPUTADA. Lo");
P("    de arriba es **estructura de marcado**, que es otro eje: dos documentos");
P("    con la misma retícula pueden tener ritmos distintos, y dos con marcado");
P("    distinto pueden computar lo mismo.");
P("");
P("    Y la geometría **no se puede derivar de este corpus**: medir");
P("    `getComputedStyle` sin las hojas enlazadas da una medida PLAUSIBLE Y");
P("    FALSA (§F3-1-CSS-NO-CAPTURADO: 678.52 contra 430.80 en vivo). Se declara");
P("    lo que este barrido SÍ contesta y lo que NO, en vez de entregar una");
P("    palabra que se lea como las dos.");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · EL `href` A `/author/` QUE EL CLON SIRVE HOY
 * ═════════════════════════════════════════════════════════════════════════ */
P("5 · ¿QUÉ SIRVE EL CLON HOY EN EL `href` A `/author/`?");
P("");
P("  Las 152 entradas del ORIGINAL enlazan a `/author/`. La pregunta de");
P("  fidelidad es qué hay en ese `href` DESPUÉS de la transformación — porque T7");
P("  reescribe enlaces internos al importar, y si casó `/es/author/…` como");
P("  interno, el clon sirve rutas locales que el build no emite.");
P("");

/* Primero: ¿emite el build alguna ruta /author/? Se DERIVA del árbol de la app,
 * no se recuerda. */
const rutasApp = readdirSync(INSUMOS.appWeb, { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();
const hayAuthor = rutasApp.some((r) => /^author/i.test(r));
P(`  rutas de primer nivel en \`apps/web/src/app\`: **${rutasApp.length}**`);
P(`  ¿alguna es \`author\`? **${hayAuthor ? "SÍ" : "NO"}** — ${rutasApp.join(" · ")}`);
P("");

/* ⚠ TRES CANALES, NO DOS. La v1 comparó «original» contra «cuerpo
 * transformado», vio 612 → 0 y concluyó «la transformación perdió una pieza».
 * FALSO: la `ficha-autor-revisor` NO vive en el `post_content` — vive en un
 * MÓDULO DE LA PLANTILLA (`et_pb_text_N_tb_body`), así que su ausencia del
 * cuerpo rico es CORRECTA. Lo que decide es el tercer canal: qué emite la
 * plantilla DEL CLON. §*la salida servida incluye el canal que no estabas
 * mirando*, cometida sobre la pregunta en vez de sobre el selector. */
const RE_AUTHOR = /href="([^"]*\/author\/[^"]*)"/g;
const ORIG = {}, TRANS = {};
for (const [tag, dir, sink] of [["original", INSUMOS.blog, ORIG], ["transformado", INSUMOS.transformado, TRANS]]) {
  const fs_ = readdirSync(dir).filter((f) => /\.html?$/i.test(f));
  let conEnlace = 0, absolutos = 0, locales = 0, enFicha = 0, conFicha = 0;
  const ejemplos = [], localesLista = [];
  for (const f of fs_) {
    const raw = readFileSync(join(dir, f), "utf8");
    if (raw.includes("ficha-autor-revisor")) conFicha++;
    for (const m of [...raw.matchAll(/<div class="ficha-autor-revisor">[\s\S]*?<\/div>\s*<\/div>/g)])
      enFicha += [...m[0].matchAll(RE_AUTHOR)].length;
    const hs = [...raw.matchAll(RE_AUTHOR)].map((m) => m[1]);
    if (!hs.length) continue;
    conEnlace++;
    for (const href of hs) {
      if (/^https?:\/\//i.test(href)) { absolutos++; if (ejemplos.length < 3) ejemplos.push(href); }
      else { locales++; if (localesLista.length < 8) localesLista.push(`${f} → ${href}`); }
    }
  }
  Object.assign(sink, { n: fs_.length, conEnlace, absolutos, locales, enFicha, conFicha, ejemplos, localesLista });
  P(`  ${tag.padEnd(13)} ficheros **${fs_.length}** · con \`ficha-autor-revisor\` **${conFicha}** · con enlace a /author/ **${conEnlace}**`);
  P(`  ${" ".repeat(13)} href a /author/: ABSOLUTOS **${absolutos}** · LOCALES **${locales}** · de ellos DENTRO de la ficha **${enFicha}**`);
  if (ejemplos.length) P(`  ${" ".repeat(13)} ejemplo: ${ejemplos[0]}`);
  for (const x of localesLista) P(`  ${" ".repeat(13)} ⚠ LOCAL: ${x}`);
}
P("");
marca("C4", ORIG.conEnlace > 0, `el buscador de href casa en el original: ${ORIG.conEnlace}/${ORIG.n}`);
P(`  C4 · el buscador de href casa un caso conocido: ${ORIG.conEnlace}/${ORIG.n} en el original  ${CONTROLES.C4.ok ? "✅" : "❌"}`);
P("");
P("  ⚠ EL 0 DEL CUERPO TRANSFORMADO NO ES UNA PÉRDIDA — ES OTRO CANAL");
P("    La `ficha-autor-revisor` del original va dentro de un MÓDULO DE LA");
P("    PLANTILLA (`et_pb_text_N_tb_body`), no del `post_content`. Así que el");
P("    cuerpo rico no la lleva **y hace bien**: no es suya. Comparar el cuerpo");
P("    contra la página entera y leer 612 → 0 como «se perdió» es §*la salida");
P("    servida incluye el canal que no estabas mirando*, con el canal puesto en");
P("    qué parte del documento se está transformando.");
P("");

/* ── CANAL C · lo que emite LA PLANTILLA DEL CLON ───────────────────────── */
P("  CANAL C · qué emite la PLANTILLA del clon (que es lo que decide)");
P("");
function andaCodigo(d, out = []) {
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory() && e.name !== "node_modules") andaCodigo(p, out);
    else if (/\.(tsx?|mjs|json)$/i.test(e.name)) out.push(p);
  }
  return out;
}
const CODIGO = [
  ...andaCodigo(join(RAIZ, "apps", "web", "src")),
  ...andaCodigo(join(RAIZ, "packages")),
];
const hitsFicha = [], hitsHref = [];
for (const f of CODIGO) {
  const s = readFileSync(f, "utf8");
  const rel = f.slice(RAIZ.length + 1).replace(/\\/g, "/");
  if (s.includes("ficha-autor-revisor")) hitsFicha.push(rel);
  for (const m of s.matchAll(/["'`]([^"'`]*\/author\/[^"'`]*)["'`]/g)) {
    const linea = s.slice(0, m.index).split("\n").length;
    hitsHref.push({ fichero: rel, linea, href: m[1].slice(0, 70), absoluto: /^https?:\/\//i.test(m[1]) });
  }
}
P(`  ficheros de código barridos: **${CODIGO.length}**`);
P(`  que emiten \`ficha-autor-revisor\`: **${hitsFicha.length}**${hitsFicha.length ? " — " + hitsFicha.join(", ") : ""}`);
P(`  con un \`href\` a \`/author/\`: **${hitsHref.length}**`);
for (const h of hitsHref) P(`     ${h.fichero}:${h.linea}  ${h.absoluto ? "ABSOLUTO" : "❗ LOCAL"}  ${h.href}`);
P("");
const localesClon = hitsHref.filter((h) => !h.absoluto).length;
P(`  ⇒ enlaces a \`/author/\` que el clon puede servir: **${hitsHref.length}**, de ellos LOCALES **${localesClon}**.`);
P(`  ⇒ rutas \`/author/\` que el build emite: **${hayAuthor ? "≥1" : "0"}**.`);
P("");
if (localesClon === 0) {
  P("  ⇒ **«COLECCIÓN sin archivo» NO crea ni un enlace roto**: el clon no sirve");
  P("    ni una ruta local a `/author/`. §*Regla de rutas locales* cumplida — el");
  P("    destino no está clonado, así que el `href` se queda en el original.");
  P("    El candidato queda limpio POR EL DATO, no por el criterio.");
} else {
  P(`  ⇒ ❗ **${localesClon} \`href\` LOCALES a \`/author/\` en el código del clon**, y el`);
  P(`    build ${hayAuthor ? "SÍ" : "**NO**"} emite esa ruta: defecto de enlaces VIVO, con su cardinal.`);
}
P("");
P("  ⚠⚠ Y UN HALLAZGO DE FIDELIDAD QUE NO ES LA PREGUNTA DE ESTA TANDA, fichado");
P("     con su cardinal y sin perseguirlo:");
P("");
P(`     El original trae \`ficha-autor-revisor\` en **${ORIG.conFicha} de ${ORIG.n}** entradas de blog.`);
P(`     El clon la emite en **${hitsFicha.length} de ${CODIGO.length}** ficheros de código: **no la pinta**.`);
P("     No es la separadora de (b) —que pregunta por el ARCHIVO, no por la");
P("     ficha— pero es una pieza que el original enseña en 152 páginas y el");
P("     clon no. Se ficha; no se arregla aquí (tocaría `src/`, y el escalón es");
P("     OFFLINE y sin implementar).");
P("");

/* ══════════════════════════════════════════════════════════════════════════
 * 6 · LO QUE SIGUE SIN PROBAR, CON SU CARDINAL
 * ═════════════════════════════════════════════════════════════════════════ */
P("6 · LO QUE SIGUE SIN PROBAR DESPUÉS DE ESTO, con su cardinal");
P("");
P(`  · la GEOMETRÍA COMPUTADA del régimen \`--\` (ritmo · tipografía · retícula)`);
P(`    — lo que \`CLAUDE.md\` declara SIN PROBAR: **${AUT.length} + ${OTRAS.casos.n} + ${OTRAS.faqs.n} = ${AUT.length + OTRAS.casos.n + OTRAS.faqs.n} instancias`);
P("    sin medir**. Necesita navegador Y las hojas enlazadas: no es que falte");
P("    tiempo, es que este corpus **no puede contestarlo** (§regla 32);");
P("  · el MECANISMO del bloque `<style>` de ~161 KB presente en unos y no en");
P(`    otros: **${parciales.length} id parcial** — fichado con su cardinal, sin explicar;`);
P("  · el eje COMPORTAMIENTO (0/31 en el repo): un orden o un filtro montado en");
P("    JS no deja rastro en el HTML servido;");
P("  · el CSS servido como SÉPTIMO CANAL del ESCALÓN 1 de la 115.ª: una regla");
P("    podría esconder tarjetas por clase de término. No entra aquí.");
P("");

marca("C5", true, "cardinales publicados con unidad y denominador, por alcance separado");

writeFileSync(join(AQUI, "separadora-author-116.log"), L.join("\n") + "\n", "utf8");
writeFileSync(join(AQUI, "separadora-author-116.json"), JSON.stringify({
  fecha: "2026-08-26", tanda: "116.ª ESCALÓN 2",
  numeracion: NUM, numPorFam, autores: A, varianza: VARIANZA,
  style: STYLE, idsParciales: parciales, repartoCssDinamico: REPARTO, sinBloque, mismosQueSinFoto: mismos,
  otras: { casos: OTRAS.casos.n, faqs: OTRAS.faqs.n }, formas: FORMAS,
  href: { original: ORIG, transformado: TRANS, rutasApp, hayAuthor, canalC: { ficherosBarridos: CODIGO.length, emitenFicha: hitsFicha, hrefs: hitsHref, localesClon } },
  controles: CONTROLES,
}, null, 2), "utf8");
console.log("");
console.log("congelado → separadora-author-116.{log,json}");
console.log(`CONTROLES: ${Object.entries(CONTROLES).map(([k, v]) => `${k}${v.ok ? "✅" : "❌"}`).join(" ")}`);
if (FALLOS) { console.log(`❌ ${FALLOS} control(es) en rojo — el veredicto NO vale`); process.exit(1); }
