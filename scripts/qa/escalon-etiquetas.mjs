/**
 * QUÉ HACE EL ORIGINAL EN UNA ENTRADA SIN ETIQUETAS — la medida que arbitra
 * §F2-5-ESCALON-ETIQUETAS.   Uso: npm run qa:escalon   (SABOTAJE=… → negativo)
 *
 * ── Por qué existe, y por qué NO es una sonda de fidelidad ────────────────
 * La prueba final de F2-5 paró aquí: el EDITOR dio de alta una entrada **sin
 * etiquetas** —opcional en el esquema—, todas las guardas de entrada la
 * acogieron y el render murió con `undefined.length`. La ficha dejó tres
 * piezas coherentes cuya COMPOSICIÓN nadie arbitraba, y una consigna:
 * *«arreglar sin medir el original sería inventar el contrato»*.
 *
 * Esto mide el contrato. No compara clon contra original —no hay clon de esas
 * páginas: **de las 149 entradas sólo 7 están transcritas**, y las 7 traen
 * etiquetas; ése es justo el hueco—. Lo que hace es **interrogar al corpus
 * congelado**, que lleva las 149 desde la captura del 2026-08-04 y es una
 * muestra del original que nadie había preguntado por esto (`CLAUDE.md`
 * §sondas 8b: *el archivo ya tiene respuestas que una campaña nueva pagaría*).
 *
 * ── Las tres preguntas, que son distintas ─────────────────────────────────
 *   1. **¿cuántas de las 149 NO traen etiquetas?** Si fueran 0, el caso sería
 *      legal en el esquema e inexistente en el corpus, y la pregunta cambiaría
 *      de «qué copio» a «qué pinto en algo que el original nunca ha servido»;
 *   2. **¿QUÉ hace el original ahí?** Y las tres salidas no son la misma:
 *      **OMITE** el bloque · lo pinta **VACÍO** · pinta el **RÓTULO sin lista**.
 *      Se distinguen por el marcado, no por la impresión — de ahí que se lea el
 *      interior del `div` y se congele **verbatim**;
 *   3. **¿el rótulo se DERIVA del número?** La plantilla del clon escribe
 *      `n > 1 ? "Etiquetas: " : "Etiqueta: "` y lo declara plantilla. Con 141
 *      instancias delante eso deja de ser una lectura y pasa a ser una medida.
 *
 * ── Las guardas, y cuál protege qué ───────────────────────────────────────
 * · **`Evaluadas` con mínimo DERIVADO** del `INDICE.json` del corpus
 *   (`resumen.porColeccion["entradas-blog"].paginas`), **no** de contar los
 *   ficheros que voy a recorrer: derivar el listón de la misma lista que se
 *   itera es no tener listón. Un corpus a medias sale por error;
 * · **el marcado se busca SIN `<style>` ni `<script>`** — `CLAUDE.md` §sondas 4,
 *   tercera cara: el CSS de Divi nombra sus propias clases y `case-taxonomies`
 *   aparece ahí. Buscar sobre el HTML entero da un pleno que parece un dato;
 * · **el LOCALIZADOR y el DISCRIMINANTE tienen contratos opuestos**, y
 *   confundirlos es cómo se fabrica el cero y el pleno:
 *     — `case-taxonomies` **localiza**: tiene que casar en TODAS. Una que falte
 *       es un fallo contado, no un «no tiene taxonomías»;
 *     — `case-tags` **discrimina**: 0 ⇒ MUERTO (regla 4, el cero) y N ⇒ UBICUO
 *       (su complementario, el pleno). Las dos cierran el código de salida;
 * · **la respuesta 2 se FALSA sola.** El veredicto sólo puede ser OMITE si no
 *   existe *ni una* instancia de `case-tags` con cero enlaces. Con una sola, el
 *   corpus estaría diciendo dos cosas a la vez y el veredicto es AMBIGUO, que
 *   sale por error: un arbitraje no se apoya en una mayoría.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, sello, w } from "./lib.mjs";
/* La definición de «el interior de un div de Divi» ya existe y la comparten
 * `captura.mjs` y `extractor.mjs`. Una tercera copia es la clase C7 (ver la
 * cabecera de `scripts/seed/corpus.mjs`): se importa. */
import { interiorDiv } from "../seed/corpus.mjs";

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const COLECCION = "entradas-blog";

/* ── sabotajes ───────────────────────────────────────────────────────────── */
const SABOTAJE = process.env.SABOTAJE || null;
const SABOTAJES = {
  "localizador-muerto":
    "el localizador del bloque busca una clase que no existe → 0 entradas localizadas, que NO es «ninguna tiene taxonomías»",
  "discriminante-ubicuo":
    "el discriminante de etiquetas casa con cualquier span → 149/149 con etiquetas ⇒ 0 sin ellas, un cero que parece un dato",
  "tags-vacio":
    "se inyecta UNA entrada con el bloque presente y vacío → el corpus diría OMITE y PINTA VACÍO a la vez ⇒ AMBIGUO",
  "sin-corpus": "la lista de entradas llega vacía → no hay unidades y el veredicto sería vacuo",
  control: "ningún sabotaje: la sonda tiene que salir LIMPIA y decir OMITE",
};
if (SABOTAJE && !Object.keys(SABOTAJES).includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${Object.keys(SABOTAJES).join(" | ")})`);
if (SABOTAJE && SABOTAJE !== "control") console.log(`\n⚠ SABOTAJE=${SABOTAJE} — ${SABOTAJES[SABOTAJE]}\n`);

/* ── el mínimo, DERIVADO del índice del corpus ───────────────────────────── */
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const ESPERADAS = INDICE.resumen?.porColeccion?.[COLECCION]?.paginas;
if (typeof ESPERADAS !== "number" || ESPERADAS < 1) {
  console.error(
    `❌ El INDICE del corpus no dice cuántas ${COLECCION} hay (salió ${JSON.stringify(ESPERADAS)}).\n` +
      `   Sin listón derivado, «0 evaluadas» saldría verde.`,
  );
  process.exit(2);
}

/* La lista sale del ÍNDICE, no de `readdir`: el índice es lo que la captura
 * afirmó haber traído, y comparar las dos es lo que caza un fichero perdido.
 * `readdir` se usa sólo para el cotejo. */
const delIndice = Object.values(INDICE.paginas)
  .filter((p) => typeof p.fichero === "string" && p.fichero.startsWith(`${COLECCION}/`))
  .map((p) => p.fichero.slice(COLECCION.length + 1))
  .sort();
const enDisco = readdirSync(join(CORPUS, COLECCION)).filter((f) => f.endsWith(".html")).sort();
const soloIndice = delIndice.filter((f) => !enDisco.includes(f));
const soloDisco = enDisco.filter((f) => !delIndice.includes(f));

const FICHEROS = SABOTAJE === "sin-corpus" ? [] : delIndice;

/* ── el instrumento ──────────────────────────────────────────────────────── */
/** El HTML sin CSS ni JS: ahí es donde vive el marcado y no los selectores. */
const soloMarcado = (h) =>
  h.replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<script\b[\s\S]*?<\/script>/gi, "");

const CLASE_BLOQUE = SABOTAJE === "localizador-muerto" ? "case-taxonomias" : "case-taxonomies";
/* El discriminante nombra UNA cosa (§sondas: marcador semántico, no aspecto).
 * El sabotaje lo ensancha a «cualquier span del bloque», que es exactamente el
 * error que produce un pleno con pinta de medida. */
const RE_HIJOS =
  SABOTAJE === "discriminante-ubicuo"
    ? /<span class="(case-[a-z-]+)"/g
    : /<span class="(case-categorias|case-tags)"/g;
const CLASE_ETIQUETAS = SABOTAJE === "discriminante-ubicuo" ? "case-categorias" : "case-tags";

/** El interior del `<span class="case-…">` que empieza en `desde`, con anidado. */
function interiorSpan(html, desde) {
  const fin = html.indexOf(">", desde);
  if (fin < 0) return null;
  const re = /<(\/?)span\b/gi;
  re.lastIndex = fin + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}

/** La forma del marcado, sin textos ni hrefs: lo que se compara entre entradas. */
const forma = (s) =>
  s.replace(/href="[^"]*"/g, 'href="…"').replace(/>[^<]+</g, ">…<").replace(/\s+/g, " ").trim();

/* ── el barrido ──────────────────────────────────────────────────────────── */
const ev = new Evaluadas({ nombre: "escalon-etiquetas", unidad: "entradas del corpus", minimo: ESPERADAS });

const censo = { bloque: 0, "case-categorias": 0, "case-tags": 0 };
const sinEtiquetas = [];
const conEtiquetas = [];
const bloquesVacios = [];
const rotuloMal = [];
const formasSinEtiquetas = new Map();

for (const f of FICHEROS) {
  let html;
  try {
    html = soloMarcado(readFileSync(join(CORPUS, COLECCION, f), "utf8"));
  } catch (e) {
    ev.fallo(f, e.message);
    continue;
  }
  /* SABOTAJE `tags-vacio`: se inyecta el bloque presente-y-vacío en UNA entrada
   * de las que no lo traen. Es el falsador del HALLAZGO, no de la sonda: si el
   * corpus contuviera esa forma, «el original OMITE» sería falso. */
  if (SABOTAJE === "tags-vacio" && f === FICHEROS.find((x) => x === "nos-hemos-mudado.html"))
    html = html.replace(/(<span class="case-categorias">)/, '<span class="case-tags"></span>$1');

  const i = html.search(new RegExp(`<div[^>]*\\bclass="[^"]*\\b${CLASE_BLOQUE}\\b[^"]*"`, "i"));
  if (i < 0) {
    /* Un LOCALIZADOR que no casa no dice «esta entrada no tiene taxonomías»:
     * dice que no se pudo mirar. Se cuenta como fallo con nombre. */
    ev.fallo(f, `sin bloque .${CLASE_BLOQUE}`);
    continue;
  }
  const bloque = interiorDiv(html, i);
  if (bloque == null) {
    ev.fallo(f, `.${CLASE_BLOQUE} sin cierre`);
    continue;
  }
  ev.ok();
  censo.bloque++;

  const hijos = new Set();
  RE_HIJOS.lastIndex = 0;
  let m;
  while ((m = RE_HIJOS.exec(bloque))) hijos.add(m[1]);
  for (const c of hijos) if (c in censo) censo[c]++;

  if (!hijos.has(CLASE_ETIQUETAS)) {
    sinEtiquetas.push(f);
    const fm = forma(bloque);
    if (!formasSinEtiquetas.has(fm)) formasSinEtiquetas.set(fm, []);
    formasSinEtiquetas.get(fm).push(f);
    continue;
  }

  const j = bloque.indexOf(`<span class="${CLASE_ETIQUETAS}"`);
  const dentro = interiorSpan(bloque, j) ?? "";
  const enlaces = (dentro.match(/<a\b/g) || []).length;
  const rotulo = (dentro.match(/^<span>([^<]*)<\/span>/) || [])[1] ?? null;
  conEtiquetas.push({ f, enlaces, rotulo });
  if (enlaces === 0) bloquesVacios.push({ f, dentro });
  const esperado = enlaces > 1 ? "Etiquetas: " : "Etiqueta: ";
  if (rotulo !== esperado) rotuloMal.push({ f, enlaces, rotulo, esperado });
}

/* ── el censo: el cero y el pleno, cada uno con su contrato ──────────────── */
const N = censo.bloque;
const problemasCenso = [];
if (N === 0)
  problemasCenso.push(
    `LOCALIZADOR MUERTO — .${CLASE_BLOQUE} no casó en NINGUNA de las ${FICHEROS.length} entradas. ` +
      `Eso no es «no hay taxonomías»: es que no se miró nada.`,
  );
if (N > 0 && censo[CLASE_ETIQUETAS] === 0)
  problemasCenso.push(
    `DISCRIMINANTE MUERTO — .${CLASE_ETIQUETAS} no casó en ninguna de las ${N}. ` +
      `«${N} sin etiquetas» sería un cero del instrumento, no del original.`,
  );
if (N > 0 && censo[CLASE_ETIQUETAS] === N)
  problemasCenso.push(
    `DISCRIMINANTE UBICUO — .${CLASE_ETIQUETAS} casó en las ${N}/${N}. Un patrón que casa en TODAS ` +
      `no discrimina, y «0 sin etiquetas» es su pleno, no una medida.`,
  );

/* ── el veredicto ────────────────────────────────────────────────────────── */
let decision, porQue;
if (problemasCenso.length) {
  decision = "NO SE PUDO MEDIR";
  porQue = problemasCenso.join(" · ");
} else if (bloquesVacios.length) {
  decision = "AMBIGUO";
  porQue =
    `el corpus contiene las DOS formas: ${sinEtiquetas.length} entradas OMITEN el bloque y ` +
    `${bloquesVacios.length} lo traen PRESENTE Y VACÍO. Un arbitraje no se apoya en una mayoría.`;
} else if (sinEtiquetas.length === 0) {
  decision = "CASO NO OBSERVADO";
  porQue =
    `las ${N} entradas del corpus traen etiquetas. El caso es LEGAL en el esquema e INEXISTENTE ` +
    `en el original: lo que se pinte ahí es una decisión de diseño, no una copia.`;
} else if (formasSinEtiquetas.size === 1) {
  decision = "OMITE";
  porQue =
    `${sinEtiquetas.length} de ${N} entradas no traen etiquetas, y en las ${sinEtiquetas.length} el ` +
    `original NO emite el <span class="${CLASE_ETIQUETAS}">: el bloque .${CLASE_BLOQUE} sigue ahí con ` +
    `la categoría sola. Una sola forma, sin excepciones.`;
} else {
  decision = "AMBIGUO";
  porQue = `las ${sinEtiquetas.length} entradas sin etiquetas traen ${formasSinEtiquetas.size} formas distintas de bloque.`;
}

/* ── informe ─────────────────────────────────────────────────────────────── */
console.log(`\n════════ EL ORIGINAL EN UNA ENTRADA SIN ETIQUETAS · ${COLECCION} ════════`);
console.log(`  corpus congelado ${INDICE.meta?.fecha ?? "?"} · ${FICHEROS.length} ficheros del índice\n`);

if (soloIndice.length || soloDisco.length)
  console.log(
    `  ⚠ índice y disco no coinciden: ${soloIndice.length} sólo en el índice · ${soloDisco.length} sólo en disco\n`,
  );

console.log(`  censo del bloque (sobre el marcado, sin <style> ni <script>)`);
console.log(`    .${CLASE_BLOQUE.padEnd(22)} ${String(censo.bloque).padStart(3)}/${ESPERADAS}   LOCALIZADOR`);
console.log(`    .case-categorias${" ".repeat(7)} ${String(censo["case-categorias"]).padStart(3)}/${N}   medida`);
console.log(`    .${CLASE_ETIQUETAS.padEnd(22)} ${String(censo[CLASE_ETIQUETAS]).padStart(3)}/${N}   DISCRIMINANTE`);

console.log(`\n  SIN ETIQUETAS: ${sinEtiquetas.length} de ${N}`);
for (const f of sinEtiquetas) console.log(`    · ${f.replace(/\.html$/, "")}`);

console.log(`\n  qué emite el original en ésas — ${formasSinEtiquetas.size} forma(s):`);
for (const [fm, fs] of formasSinEtiquetas) console.log(`    ${fm}\n      (×${fs.length})`);

console.log(`\n  rótulo derivado del número (n>1 ⇒ "Etiquetas: ")`);
const sing = conEtiquetas.filter((e) => e.enlaces === 1).length;
console.log(
  `    ${conEtiquetas.length} con etiquetas · ${sing} con UNA (rótulo singular) · ` +
    `${conEtiquetas.length - sing} con varias · ${rotuloMal.length} sin cuadrar`,
);
for (const r of rotuloMal.slice(0, 5))
  console.log(`    ❌ ${r.f}: ${r.enlaces} enlace(s) con rótulo ${JSON.stringify(r.rotulo)}, esperaba ${JSON.stringify(r.esperado)}`);

console.log(`\n  ⚖ VEREDICTO: ${decision}`);
console.log(`     ${porQue}\n`);

w("medidas/escalon-etiquetas.json", {
  meta: {
    sonda: "escalon-etiquetas",
    que: "qué emite el original de kunakair.com en una entrada de blog sin etiquetas (post_tag)",
    fuente: `corpus/${COLECCION} — ${FICHEROS.length} capturas congeladas el ${INDICE.meta?.fecha ?? "?"}`,
    ficha: "docs/PENDIENTES-QA.md §F2-5-ESCALON-ETIQUETAS",
    sello: sello(),
    sabotaje: SABOTAJE,
  },
  contrato: { unidad: "entradas del corpus", minimo: ESPERADAS, evaluadas: ev.n, fallos: ev.fallos },
  censo: { ...censo, localizador: CLASE_BLOQUE, discriminante: CLASE_ETIQUETAS, problemas: problemasCenso },
  cotejoIndiceDisco: { soloIndice, soloDisco },
  sinEtiquetas: { n: sinEtiquetas.length, de: N, ficheros: sinEtiquetas },
  formasSinEtiquetas: [...formasSinEtiquetas].map(([forma, ficheros]) => ({ forma, n: ficheros.length, ficheros })),
  bloquesVacios: bloquesVacios.map((b) => ({ fichero: b.f, dentro: b.dentro })),
  rotulo: {
    conEtiquetas: conEtiquetas.length,
    conUna: sing,
    conVarias: conEtiquetas.length - sing,
    noCuadran: rotuloMal,
    derivadoDelNumero: rotuloMal.length === 0,
  },
  veredicto: { decision, porQue },
});

const mal = problemasCenso.length > 0 || decision === "AMBIGUO" || ev.fallos.length > 0;
console.log(
  mal
    ? `❌ escalon-etiquetas — el arbitraje NO se puede apoyar en esta corrida.\n`
    : `✅ escalon-etiquetas — el contrato del original queda medido: ${decision}.\n`,
);
ev.informe();
process.exit(mal ? 2 : 0);
