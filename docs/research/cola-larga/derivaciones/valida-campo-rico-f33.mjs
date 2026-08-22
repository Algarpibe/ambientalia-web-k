/* valida-campo-rico-f33 — 93.ª tanda, 2026-08-22. ESCALÓN 1, punto 3.
 *
 * LA PREGUNTA: el documento del régimen `--` —el único que S2 estrena—,
 * ¿**PASA** `validaHtmlCorpus`?
 *
 * ⚠ **Y se contesta CORRIENDO la validación, no leyéndola.** El encargo lo dice
 * con todas las letras y tiene razón: *«8 387 caracteres y `p,h2,ul,li,b` caben
 * en el contrato sobre el papel, y eso no es haberlo ejercitado»*. Es §*una
 * afirmación de completitud se verifica EJERCITÁNDOLA, no releyéndola* — la
 * única verificación es **usar la cosa para lo siguiente que iba a
 * necesitarla**, y lo siguiente es aterrizar el cuerpo en el campo.
 *
 * ── Por qué hace falta un CONTROL, y no es ceremonia ───────────────────────
 * §regla 8: *un negativo sin control no es un negativo*. Aquí el riesgo es el
 * simétrico y más barato de cometer — **un `true` que significa «no se miró»**:
 *
 *   · `validaHtmlCorpus` devuelve `true` **de entrada** si el valor no es
 *     `string` (`typeof valor !== "string"`). O sea que si la extracción
 *     devolviera `undefined`, la validación diría **PASA** sin haber mirado un
 *     solo carácter. Ése es §regla 6 al pie de la letra: una ausencia
 *     traducida a un valor benigno;
 *   · y si el extractor casara con 0 caracteres, el `""` también pasa.
 *
 * Por eso el veredicto se cierra con TRES cosas y no con una:
 *   1 · el cuerpo extraído es `string` y su longitud está DENTRO del rango
 *       medido del contrato (275–69 784) — se comprueba, no se supone;
 *   2 · la validación devuelve `true` sobre él;
 *   3 · y **el mismo cuerpo con un `<script>` inyectado tiene que ser
 *       RECHAZADO, y rechazado POR SU MOTIVO** (§3.3 · T4). Si el sabotaje
 *       pasara, el `true` del punto 2 no significaría nada.
 *
 * ── Lo que esta prueba NO contesta ─────────────────────────────────────────
 *   · no dice que el cuerpo RENDERICE bien: dice que el campo lo admite;
 *   · no dice nada de la geometría — 0 ejes comparados en estas rutas;
 *   · y con n = 1 no prueba el campo por variación, sólo por su único dato.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");

/* `pathToFileURL` y no la ruta a pelo: en Windows una ruta absoluta empieza por
 * `c:` y el cargador ESM la lee como un ESQUEMA de URL. Falla en voz alta —que
 * es lo correcto— pero falla. */
const { validaHtmlCorpus } = await import(pathToFileURL(join(RAIZ, "packages/cms-config/src/campos/comunes.ts")).href);
if (typeof validaHtmlCorpus !== "function")
  throw new Error("IMPORTE MUERTO: `validaHtmlCorpus` no es una función — no hay nada que ejercitar (§sondas 4)");

/* ── 1 · el dominio: los documentos SIN capa propia que traen contenido ────── */
/**
 * ⚠ **Se DERIVA, no se escribe** (§regla 9). El caso lo define el régimen `--`
 * leído del `<body>`, no una lista de rutas: si mañana hubiera un segundo, esta
 * sonda lo recoge sola. Y el cardinal se publica: **con n = 1, «pasa» es un
 * dato de una instancia, no una propiedad del campo.**
 */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const TODAS = [
  ...ld.filter((x) => x.bucket === "hubs-kb"),
  ...L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  ...ld.filter((x) => x.bucket === "sueltas"),
].filter((e) => e.fichero);

/** El cuerpo clásico: lo que hay dentro de `<div class="entry-content">`. */
function cuerpoClasico(html) {
  const i = html.indexOf('class="entry-content"');
  if (i < 0) return null;
  const abre = html.indexOf(">", i);
  if (abre < 0) return null;
  /* Se corta en el cierre del `<article>`, que es el contenedor que WordPress
   * cierra siempre en esta plantilla. Medir hasta el final del documento
   * arrastraría el pie, y el pie trae etiquetas que NO son del cuerpo. */
  const resto = html.slice(abre + 1);
  const fin = resto.search(/<\/article>/);
  return fin < 0 ? null : resto.slice(0, fin);
}

const casos = [];
for (const e of TODAS) {
  let html;
  try { html = readFileSync(join(CORPUS, e.fichero), "utf8"); } catch { continue; }
  const bc = (/<body[^>]*\bclass="([^"]*)"/.exec(html) || [])[1] || "";
  const B = /\bet_pb_pagebuilder_layout\b/.test(bc);
  const T = /\bet-tb-has-body\b/.test(bc);
  if (B || T) continue;                       /* no es el régimen `--` */
  casos.push({ ruta: e.ruta, cuerpo: cuerpoClasico(html) });
}

if (casos.length === 0)
  throw new Error("DOMINIO VACÍO: 0 documentos en régimen `--`. Un 0 aquí es el instrumento, no el dato (§sondas 4)");

/* ── 2 · el veredicto, con sus tres condiciones ────────────────────────────── */
const RANGO = [275, 69784];                   /* el contrato medido en 209/209 */
let fallos = 0;
console.log(`═══ 1 · DOMINIO — documentos en régimen \`--\`, DERIVADO del \`<body>\``);
console.log(`  n = ${casos.length}   ⚠ con n = 1, «pasa» es un dato de UNA instancia, no una propiedad del campo\n`);

for (const c of casos) {
  console.log(`  ── ${c.ruta}`);

  /* CONDICIÓN 1 — que haya STRING, y dentro del rango. Sin esto, el `true` de
   * la condición 2 podría venir del `typeof valor !== "string"` de la línea 492
   * de `comunes.ts`, o sea de no haber mirado nada. */
  if (typeof c.cuerpo !== "string") {
    console.log(`     ❌ 1/3 EXTRACCIÓN: no se pudo extraer \`entry-content\` (${typeof c.cuerpo}).`);
    console.log(`        ⚠ Y esto NO se puede leer como «pasa»: \`validaHtmlCorpus\` devuelve \`true\``);
    console.log(`        de entrada para lo que no es string. Sería §regla 6 — la ausencia`);
    console.log(`        traducida a un valor benigno.`);
    fallos++; continue;
  }
  const n = c.cuerpo.length;
  const dentro = n >= RANGO[0] && n <= RANGO[1];
  console.log(`     ${dentro ? "✅" : "❌"} 1/3 EXTRACCIÓN: string de ${n} caracteres · rango del contrato ${RANGO[0]}–${RANGO[1]}`);
  if (!dentro) fallos++;

  /* CONDICIÓN 2 — la validación real, corrida. */
  const v = validaHtmlCorpus(c.cuerpo);
  console.log(`     ${v === true ? "✅" : "❌"} 2/3 VALIDACIÓN: ${v === true ? "PASA" : "RECHAZA — " + String(v).slice(0, 220)}`);
  if (v !== true) fallos++;

  /* CONDICIÓN 3 — el control: el mismo cuerpo saboteado tiene que caer, y caer
   * POR SU MOTIVO. Un rechazo por otro mensaje probaría otra guarda. */
  const saboteado = c.cuerpo + '<script>alert(1)</script>';
  const s = validaHtmlCorpus(saboteado);
  const porSuMotivo = typeof s === "string" && /§3\.3 · T4/.test(s);
  console.log(`     ${porSuMotivo ? "✅" : "❌"} 3/3 CONTROL: el mismo cuerpo con \`<script>\` → ${s === true ? "PASA ⚠⚠ la validación NO se está ejercitando" : "RECHAZA"}`);
  if (typeof s === "string") console.log(`            motivo: ${s.slice(0, 120)}…`);
  if (!porSuMotivo) fallos++;

  /* Inventario, para que el «pasa» venga con lo que pasó. */
  const et = [...new Set([...c.cuerpo.matchAll(/<([a-z][a-z0-9]*)\b/gi)].map((m) => m[1].toLowerCase()))].sort();
  console.log(`     etiquetas (${et.length}): ${et.join(" · ")}`);
  const texto = c.cuerpo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  console.log(`     texto sin marcado: ${texto.length} caracteres`);
  console.log("");
}

console.log(`═══ 2 · VEREDICTO`);
console.log(`  documentos ${casos.length} · condiciones evaluadas ${casos.length * 3} · fallos ${fallos}`);
if (fallos) {
  console.log(`\n⚠ S2 NO está ejercitada: el campo no admite el dato que dice admitir.`);
  process.exit(3);
}
console.log(`  ✅ S2 EJERCITADA — el dato del régimen \`--\` entra en \`campoHtml\`, y el`);
console.log(`     control prueba que la validación se estaba ejecutando de verdad.`);
console.log(`\n═══ 3 · LO QUE ESTO **NO** DICE`);
console.log(`  · no dice que RENDERICE: dice que el campo lo ADMITE`);
console.log(`  · no dice nada de geometría — 0 ejes comparados en estas rutas`);
console.log(`  · con n = 1 no hay variación que probar: SIN PROBAR se declara, no se disimula`);
