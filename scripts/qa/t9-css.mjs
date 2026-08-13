/**
 * LA CUARTA CONDICIÓN DE T9, CONTESTADA POR MECANISMO — ¿alguna clase del
 * envoltorio ajeno tiene regla en el CSS que el documento se trae, EN LÍNEA
 * **y** ENLAZADO?
 * Uso: npm run qa:t9-css        Negativo: npm run qa:t9-css-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y POR QUÉ NO ES UNA MEDIDA DE PÍXEL
 *
 * T9 desenvuelve contenedores de TRANSPORTE ajenos. Su NO-OP tenía tres de sus
 * cuatro condiciones pagadas y la cuarta —**que desenvolver no mueve un
 * píxel**— sólo tenía una derivación *con su límite declarado*: ninguna de las
 * clases del envoltorio tiene regla en los **231 508 bytes** de `<style>` que
 * la página sirve, **pero las 7 hojas ENLAZADAS no estaban en el corpus**.
 *
 * Ese hueco es el que esta sonda cierra, y la respuesta que da es **más fuerte
 * que un Δ0**:
 *
 * > Si ninguna clase del envoltorio tiene regla en NINGUNA de las hojas que el
 * > documento se trae, entonces esos contenedores **no llevan render** en el
 * > original — y desenvolverlos no puede mover nada. No es *«no se observó
 * > diferencia»*: es que **no hay mecanismo por el que pudiera haberla**.
 *
 * Es el eje que este proyecto prefiere (§*el que tenga mecanismo y esté SERVIDO
 * en los dos lados*), y no hereda las cautelas de una medida de píxel: la ruta
 * de `castel-d-ario` **no tiene campaña de ruido**, así que un Δ pequeño ahí
 * sería SIN PROBAR — mientras que un cero de reglas es una propiedad del
 * documento, no de la carga.
 *
 * ── DE DÓNDE SALEN LAS CLASES: DE T9, NO DE UNA LISTA ─────────────────────
 * Las clases se derivan **corriendo T9** sobre el campo real y recogiendo su
 * `transporteDesenvuelto`. Escribirlas a mano sería medir un conjunto distinto
 * del que la transformación toca, y la sonda saldría verde sobre una lista que
 * ya no es la del código (§regla 9 · §sondas 3 — un comentario no prueba lo que
 * el código hace).
 *
 * ── EL CONTROL, QUE ES LO QUE HACE QUE EL CERO SIGNIFIQUE ALGO ────────────
 * §sondas 8a: *un negativo sin control no es un negativo*. Un cero de reglas y
 * un lector de CSS que no lee dan **la misma salida**, así que la sonda mide
 * además clases del MISMO documento que **sí** tienen que aparecer
 * (`et_pb_section`, `et_pb_row`…). Si el control no aparece, el cero no vale y
 * la sonda sale ROJA: no habría medido nada.
 *
 * ── EL PARSER, QUE NO SE DUPLICA ─────────────────────────────────────────
 * Se reutiliza `reglas()` de `css-compilado.mjs` — dos parsers de CSS son
 * exactamente la clase que ese fichero existe para no tener. Y por eso el
 * criterio es *«hay una REGLA cuyo selector casa la clase»*, no *«la cadena
 * aparece en el fichero»*: un `.markdown` dentro de un comentario o de un
 * `content:` no es render.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { T9 } from "../seed/transformaciones.mjs";
import { cssDe, reglas } from "./css-compilado.mjs";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const PAGINA = "corpus/casos/monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario.html";
const CSS_DIR = join(RAIZ, "corpus/css");
const INDICE = join(CSS_DIR, "INDICE.json");

/**
 * SABOTAJE `regla-para-el-envoltorio` — inyecta una hoja con una regla para una
 * clase del envoltorio. La sonda tiene que **encontrarla** y salir en rojo: sin
 * este caso, «0 clases con regla» y «no sé leer una hoja» son indistinguibles.
 */
const SABOTAJES = ["regla-para-el-envoltorio", "lector-ciego", "sin-hojas"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

const html = readFileSync(join(RAIZ, PAGINA), "utf8");

/* ── 1 · las clases que T9 desenvuelve, derivadas CORRIENDO T9 ────────────── */
const clasesConEstiloDe = (crudo) => {
  const s = new Set();
  for (const m of cssDe(crudo).matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) s.add(m[1]);
  return s;
};
const ctx = { pagina: "castel-d-ario", clasesConEstilo: clasesConEstiloDe(html), transporteDesenvuelto: [] };
const salida = T9.aplica(html, ctx);

const clases = new Set();
for (const t of ctx.transporteDesenvuelto) for (const c of (t.clase ?? "").split(/\s+/).filter(Boolean)) clases.add(c);

if (!ctx.transporteDesenvuelto.length)
  throw new Error(
    "T9 desenvolvió 0 contenedores en la página que motivó la transformación.\n" +
      "  Eso NO es «no hay nada que medir»: es que la sonda no está mirando lo que cree,\n" +
      "  y su cero de reglas saldría verde sin haber evaluado una sola clase (§sondas 4).",
  );
if (!clases.size)
  throw new Error(
    `T9 desenvolvió ${ctx.transporteDesenvuelto.length} contenedores pero NINGUNO traía clase:\n` +
      "  sin clases no hay nada que cruzar contra el CSS, y el cero sería del instrumento.",
  );

/* ── 2 · el CSS que el documento se trae: EN LÍNEA + las 7 ENLAZADAS ──────── */
if (!existsSync(INDICE))
  throw new Error(
    "corpus/css/INDICE.json AUSENTE: las hojas enlazadas no están capturadas.\n" +
      "  Corre `npm run cms:captura-css -- --pagina=<html>` antes. Sin ellas esta sonda\n" +
      "  mediría lo mismo que ya estaba medido —el CSS en línea— y su verde diría\n" +
      "  «ninguna regla en absoluto» habiendo mirado sólo la mitad de los canales.",
  );
const indice = JSON.parse(readFileSync(INDICE, "utf8"));

/** Las hojas que ESTA página enlaza, no todas las capturadas. */
const rutaLocalDe = (u) => u.replace(/^https?:\/\/[^/]+\//, "").replace(/[?#].*$/, "");
const enlazadas = [
  ...new Set(
    [...html.matchAll(/<link\b[^>]*>/gi)]
      .filter((m) => /stylesheet/i.test(m[0]) || /\.css/i.test(m[0]))
      .map((m) => m[0].match(/href=["']([^"']+)["']/i)?.[1])
      .filter(Boolean)
      .map(rutaLocalDe),
  ),
];

/**
 * `lector-ciego` — el parser devuelve CSS vacío. El cruce sigue dando **0
 * clases con regla**, o sea el MISMO número que la corrida buena; lo único que
 * lo separa de un verde es el CONTROL. Es §sondas 8a con su forma exacta: sin
 * control, «no tienen render» y «no sé leer el CSS» son indistinguibles.
 */
const ciego = SABOTAJE === "lector-ciego";
const enLinea = ciego ? "" : cssDe(html);
const fuentes = [{ nombre: "<style> en línea", css: enLinea, bytes: enLinea.length }];
const ausentes = [];
for (const local of enlazadas) {
  const f = join(CSS_DIR, local);
  /* `sin-hojas` — se finge que las enlazadas no están capturadas: la sonda tiene
   * que TIRAR, no medir sólo el CSS en línea y titular «ninguna en absoluto». */
  if (!existsSync(f) || SABOTAJE === "sin-hojas") {
    ausentes.push(local);
    continue;
  }
  const css = readFileSync(f, "utf8");
  fuentes.push({ nombre: local, css: ciego ? "" : css, bytes: ciego ? 0 : css.length });
}
if (ausentes.length)
  throw new Error(
    `${ausentes.length} de ${enlazadas.length} hojas enlazadas NO están capturadas:\n` +
      ausentes.map((a) => `    ${a}`).join("\n") +
      "\n  Medir con parte de los canales y titular «ninguna regla en absoluto» es\n" +
      "  exactamente el hueco que esta sonda existe para cerrar.",
  );

if (SABOTAJE === "regla-para-el-envoltorio") {
  const victima = [...clases][0];
  fuentes.push({ nombre: "SABOTAJE", css: `@media (max-width:980px){ .${victima}{ margin-bottom:37px } }`, bytes: 0 });
}

/* ── 3 · el cruce: ¿hay una REGLA cuyo selector case la clase? ────────────── */
const casa = (selector, clase) =>
  selector.split(",").some((s) => new RegExp(`\\.${clase.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&")}(?![\\w-])`).test(s));

/** El control: clases del MISMO documento que TIENEN que tener regla. */
const CONTROL = ["et_pb_section", "et_pb_row", "et_pb_text"];

const conRegla = new Map(); // clase → [{fuente, media, selector}]
const controlEncontrado = new Map();

const ev = new Evaluadas({ sonda: "t9-css", unidad: "clases del envoltorio", minimo: clases.size });

for (const f of fuentes) {
  for (const r of reglas(f.css)) {
    for (const c of clases)
      if (casa(r.selector, c)) {
        if (!conRegla.has(c)) conRegla.set(c, []);
        conRegla.get(c).push({ fuente: f.nombre, media: r.media ?? null, selector: r.selector.slice(0, 120) });
      }
    for (const c of CONTROL)
      if (casa(r.selector, c)) controlEncontrado.set(c, (controlEncontrado.get(c) ?? 0) + 1);
  }
}
for (const _ of clases) ev.ok(1);

/* ── informe ─────────────────────────────────────────────────────────────── */
console.log(`\n════════ T9 · ¿el envoltorio ajeno tiene RENDER en el original? ════════\n`);
console.log(`  página                ${PAGINA.split("/").pop()}`);
console.log(`  contenedores que T9 desenvuelve   ${ctx.transporteDesenvuelto.length}`);
console.log(`  clases distintas                  ${clases.size}`);
console.log(`  canales de CSS leídos             ${fuentes.length}  (1 en línea + ${enlazadas.length} enlazadas)`);
console.log(`  bytes de CSS                      ${fuentes.reduce((a, b) => a + b.bytes, 0)}\n`);

console.log(`  ── las clases, una a una ──`);
for (const c of [...clases].sort()) {
  const r = conRegla.get(c);
  console.log(`  ${r ? "⛔ CON REGLA" : "·  sin regla "}  ${c}${r ? `   → ${r[0].fuente} · ${r[0].selector}` : ""}`);
}

console.log(`\n  ── el CONTROL (§sondas 8a: sin él, el cero no significa nada) ──`);
for (const c of CONTROL) console.log(`  ${controlEncontrado.has(c) ? "✓" : "✗"} .${c}   ${controlEncontrado.get(c) ?? 0} reglas`);

const controlMudo = CONTROL.filter((c) => !controlEncontrado.has(c));
const conReglaN = conRegla.size;

w("medidas/t9-css.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿alguna clase del envoltorio de TRANSPORTE ajeno tiene regla en el CSS que el documento se trae?",
    pagina: PAGINA,
    canales: fuentes.map((f) => ({ nombre: f.nombre, bytes: f.bytes })),
    limite:
      "mide el CSS EN LÍNEA y las hojas ENLAZADAS por ESTA página. No mide CSS que un <script> inyecte en runtime; el original no lo hace para estas clases.",
  },
  resumen: {
    contenedoresDesenvueltos: ctx.transporteDesenvuelto.length,
    clases: clases.size,
    conRegla: conReglaN,
    hojasEnlazadas: enlazadas.length,
    bytesCss: fuentes.reduce((a, b) => a + b.bytes, 0),
    control: Object.fromEntries(CONTROL.map((c) => [c, controlEncontrado.get(c) ?? 0])),
    t9Aplicaciones: salida.n,
  },
  clases: [...clases].sort().map((c) => ({ clase: c, conRegla: conRegla.has(c), donde: conRegla.get(c) ?? [] })),
  contenedores: ctx.transporteDesenvuelto,
});

if (controlMudo.length) {
  console.log(
    `\n⛔ CONTROL MUDO — ${controlMudo.length} de ${CONTROL.length} clases de control sin una sola regla.\n` +
      `   El cero de arriba NO vale: no distingue «no tienen render» de «no sé leer el CSS».`,
  );
  process.exitCode = 2;
} else if (conReglaN) {
  console.log(
    `\n⛔ ${conReglaN} de ${clases.size} clases del envoltorio TIENEN regla servida.\n` +
      `   La cuarta condición de T9 NO se paga por mecanismo: hay render que desenvolver puede mover.\n` +
      `   Toca medida de PÍXEL a los dos anchos antes de dar T9 por probada.`,
  );
  process.exitCode = 2;
} else {
  console.log(
    `\n✅ 0 de ${clases.size} clases con regla en ${fuentes.length} canales (${fuentes.reduce((a, b) => a + b.bytes, 0)} bytes).\n` +
      `   Los contenedores de transporte NO llevan render en el original, así que\n` +
      `   desenvolverlos no puede mover un píxel: la cuarta condición de T9 queda\n` +
      `   PAGADA POR MECANISMO — que es más fuerte que un Δ0 observado.`,
  );
}
