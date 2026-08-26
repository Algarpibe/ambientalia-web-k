/**
 * DERIVACIÓN · los CANALES en que la tabla `dvmd` expresa el papel de celda, y
 * qué hay realmente dentro (113.ª, ESCALÓN 1)
 *
 * Existe porque al escribir el extractor aparecieron DOS cosas que la 109.ª no
 * había mirado, y una de ellas CONTRADICE una medida suya:
 *
 *   1 · el papel está en DOS canales, no uno: la CLASE (`dvmd_tm_rhead`…) y
 *       ARIA (`role="rowheader"`). §El principio — la salida servida incluye el
 *       canal que no estabas mirando;
 *   2 · la 109.ª censó «celdas con ENLACE (<a>): 0», y el módulo trae
 *       `role="link"`. Una de las dos está mal, y §sondas 4 dice que la
 *       contradicción con una medida buena anterior es lo único que delata un
 *       cero con forma de dato.
 *
 * El módulo se acota por PROFUNDIDAD de `<div>`, no por el siguiente
 * `</section>`: la v1 de esta comprobación cortó ahí y se llevó el pie entero
 * dentro, con lo que contó 50 enlaces donde el módulo tiene otra cifra. Un
 * contenedor de más es §La causa común con el corte puesto en el slice.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const F = join(RAIZ, "corpus/fase-3/sueltas/politica-de-cookies/index.html");

const html = readFileSync(F, "utf8");
/* El markup se busca SIN <style> ni <script>: el CSS de Divi nombra sus propias
 * clases y ahí es donde `chead`/`cfoot` aparecen sin existir en el documento. */
const marcado = html
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "");

/** Recorta el elemento que empieza en `desde` contando apertura/cierre de div. */
function recorta(txt, desde) {
  const ini = txt.lastIndexOf("<div", desde);
  let i = ini,
    prof = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = ini;
  let m;
  while ((m = re.exec(txt))) {
    prof += m[0] === "</div>" ? -1 : 1;
    i = m.index + m[0].length;
    if (prof === 0) break;
  }
  return txt.slice(ini, i);
}

const anclaje = marcado.indexOf('class="et_pb_module dvmd_table_maker');
if (anclaje < 0) throw new Error("no se encontró el envoltorio del módulo dvmd");
const MOD = recorta(marcado, anclaje);

const P = (...a) => console.log(...a);
const cuenta = (t, re) => (t.match(re) || []).length;

P("══════════════════════════════════════════════════════════════════════");
P("  LOS CANALES DE LA TABLA `dvmd` — 113.ª · ESCALÓN 1");
P("══════════════════════════════════════════════════════════════════════");
P(`  fuente: corpus/fase-3/sueltas/politica-de-cookies/index.html`);
P(`  módulo acotado por profundidad de div: ${MOD.length} chars`);
P(`  (el documento entero mide ${html.length}; el marcado sin CSS, ${marcado.length})`);
P("");

/* ── control de acotado: el módulo tiene que traer 55 celdas y NADA de pie ── */
P("── 0 · CONTROL DEL ACOTADO (si esto falla, todo lo demás sobra) ────────");
const celdas = cuenta(MOD, /dvmd_tm_tcell/g);
const pie = cuenta(MOD, /et_pb_menu|wpml-ls|moove_gdpr|et-social/g);
P(`   celdas dvmd_tm_tcell dentro .......... ${celdas}   (esperado 55)`);
P(`   marcadores de PIE/NAV dentro ......... ${pie}   (esperado 0)`);
const acotadoOK = celdas === 55 && pie === 0;
P(`   ⇒ acotado ${acotadoOK ? "CORRECTO" : "MAL — el resto no vale"}`);
P("");

/* ── 1 · los dos canales del papel ───────────────────────────────────────── */
P("── 1 · EL PAPEL SE EXPRESA EN DOS CANALES ─────────────────────────────");
const porClase = {},
  porAria = {},
  cruce = {};
const RE_CELDA = /<div([^>]*\bclass="[^"]*dvmd_tm_tcell[^"]*"[^>]*)>/g;
let m;
while ((m = RE_CELDA.exec(MOD))) {
  const at = m[1];
  const clase = (at.match(/dvmd_tm_(rhead|tdata|rfoot)/) || [])[1] ?? "(ninguna)";
  const aria = (at.match(/role="([a-z]+)"/) || [])[1] ?? "(ninguno)";
  const col = (at.match(/dvmd_tm_col_(\d+)/) || [])[1] ?? "?";
  porClase[clase] = (porClase[clase] || 0) + 1;
  porAria[aria] = (porAria[aria] || 0) + 1;
  const k = `clase=${clase.padEnd(6)} · aria=${aria.padEnd(9)} · col=${col}`;
  cruce[k] = (cruce[k] || 0) + 1;
}
P(`   canal CLASE : ${JSON.stringify(porClase)}`);
P(`   canal ARIA  : ${JSON.stringify(porAria)}`);
P("   cruce:");
for (const [k, v] of Object.entries(cruce).sort()) P(`     ${String(v).padStart(3)}  ${k}`);
P("");
P("   ⚠ LOS DOS CANALES NO EXPRESAN LO MISMO:");
P("     · CLASE distingue TRES papeles (rhead · tdata · rfoot)");
P("     · ARIA  distingue DOS         (rowheader · cell) — rfoot NO tiene ARIA propio");
P("   ⇒ el papel de PIE existe SÓLO en el canal de la clase.");
P("");

/* ── 2 · qué hay dentro de las celdas, esta vez con el módulo bien acotado ── */
P("── 2 · CONTENIDO REAL DE LAS CELDAS ───────────────────────────────────");
const enlaces = cuenta(MOD, /<a\b/g);
P(`   <a> dentro del módulo ................ ${enlaces}`);
P(`   role="link" .......................... ${cuenta(MOD, /role="link"/g)}`);
P(`   <ul>/<ol> ............................ ${cuenta(MOD, /<(ul|ol)\b/g)}`);
P(`   <br> ................................. ${cuenta(MOD, /<br\b/g)}`);
P(`   <strong>/<b> ......................... ${cuenta(MOD, /<(strong|b)\b/g)}`);
P("");

/* reparto de los enlaces por columna — el `cdata` puede anidar, así que se
 * recorta cada celda por profundidad igual que el módulo */
const conEnlace = {};
const RE_ANCLA = /<div([^>]*\bclass="[^"]*dvmd_tm_tcell[^"]*"[^>]*)>/g;
let n2,
  celdasConA = 0,
  textos = [];
while ((n2 = RE_ANCLA.exec(MOD))) {
  const celda = recorta(MOD, n2.index + 5);
  const col = (n2[1].match(/dvmd_tm_col_(\d+)/) || [])[1] ?? "?";
  const papel = (n2[1].match(/dvmd_tm_(rhead|tdata|rfoot)/) || [])[1] ?? "?";
  if (/<a\b/.test(celda)) {
    celdasConA++;
    conEnlace[`col=${col} · ${papel}`] = (conEnlace[`col=${col} · ${papel}`] || 0) + 1;
  }
  textos.push({ col, papel, html: celda });
}
P(`   CELDAS con al menos un <a> ........... ${celdasConA} de ${textos.length}`);
for (const [k, v] of Object.entries(conEnlace).sort()) P(`     ${String(v).padStart(3)}  ${k}`);
P("");

P("   ⚠⚠ Y AQUÍ LA DERIVACIÓN REFUTA A QUIEN LA ENCARGÓ, QUE ERA YO:");
P("      La 109.ª censó «celdas con ENLACE (<a>): 0». Al escribir el extractor");
P(`      apareció \`role="link"\` y pareció contradecirla. Bien acotado: ${celdasConA}.`);
P("      La 109.ª estaba BIEN. La contradicción la fabricó un corte que iba");
P("      desde el módulo hasta el siguiente `</section>` y se tragó el PIE");
P("      entero — 50 <a> de menú y redes leídos como contenido de tabla.");
P("      §La causa común con el contenedor puesto en el SLICE: un corte con");
P("      holgura no da error, da un número plausible de más. Y el control que");
P("      lo caza es §0, que exige 55 celdas y CERO marcadores de pie dentro.");
P("");

/* ── 3 · lo que MODULO_TABLA puede sostener ─────────────────────────────── */
P("── 3 · ¿CABE EN `CELDA = {texto, fuerte, resto}`? ─────────────────────");
P("   Los tres campos son `type: \"text\"` — texto PLANO, sin marcado.");
P(`   celdas de texto plano ................ ${textos.length - celdasConA} de ${textos.length}`);
P(`   celdas que PIERDEN marcado ........... ${celdasConA}`);
P("");
if (celdasConA) {
  P("   las que pierden, con su texto y su href:");
  for (const t of textos.filter((x) => /<a\b/.test(x.html))) {
    const href = (t.html.match(/href="([^"]*)"/) || [])[1] ?? "";
    const plano = t.html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    P(`     col=${t.col} ${t.papel.padEnd(6)} → "${plano.slice(0, 62)}"`);
    P(`        href: ${href.slice(0, 90)}`);
  }
}
P("");
P("══════════════════════════════════════════════════════════════════════");
P("  LO QUE ESTA DERIVACIÓN NO CONTESTA");
P("══════════════════════════════════════════════════════════════════════");
P("   · NO mide geometría. El residuo va en el ESCALÓN 4, a los dos anchos;");
P("   · NO decide T2. Decide qué PIERDE T1, que es su insumo;");
P("   · mira UNA tabla. Papel y columna son 1:1 aquí y son INDISTINGUIBLES");
P("     en n = 1 — §dos variables confundidas. Fuera de esta tabla, SIN PROBAR.");

if (!acotadoOK) {
  console.error("\n✗ el acotado del módulo falló: 55 celdas y 0 marcadores de pie era la condición");
  process.exitCode = 1;
}
