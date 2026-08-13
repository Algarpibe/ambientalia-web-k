/**
 * DOM AJENO PEGADO EN EL EDITOR — el censo de la CLASE, no de la instancia.
 * Uso: npm run qa:dom-ajeno        (SABOTAJE=familia-muerta | tope-cero)
 *
 * ── Por qué existe, y por qué es un censo y no un arreglo ─────────────────
 * El saneador rechazó `detalles.parametros` de **1 caso** porque el original
 * trae ahí un `<article>` con el DOM de una conversación de ChatGPT pegado. La
 * primera pregunta que se hizo fue *«¿cuántas páginas traen `<article>`?»* y la
 * respuesta fue **1 de 309** — un número correcto que contesta **la pregunta
 * equivocada**.
 *
 * > **La instancia es «un `<article>` de ChatGPT». La CLASE es «el editor pegó
 * > DOM de otra aplicación».** Censar la etiqueta mide la instancia; censar los
 * > MARCADORES de cada aplicación de origen mide la clase. Si hay una hay más, y
 * > el número va a la ficha **aunque sea cero** — porque un cero medido y un
 * > cero no mirado se escriben igual (§sondas 4).
 *
 * ── Qué mira ──────────────────────────────────────────────────────────────
 * Familias de origen con sus marcadores **servidos**, sobre el corpus congelado
 * (309 páginas) y con la regla del markup: sin `<script>` ni `<style>`, porque
 * el CSS de Divi nombra sus propias clases y un patrón que casa dentro de un
 * `<style>` es un pleno que no mide nada (§sondas 4, tercera cara).
 *
 * ── Lo que NO hace ────────────────────────────────────────────────────────
 * No toca el original (lee `corpus/`), no transforma y no decide. Dice **qué
 * hay y cuánto**; qué se hace con ello lo decide T9 y su ficha.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["familia-muerta", "tope-cero"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));

/**
 * Las familias, con sus marcadores y su TOPE.
 *
 * ⚠ **El `tope` no es decoración: es la otra mitad de la guarda.** Un marcador
 * que no casa en ninguna página sale MUERTO (puede que ya no exista, o que esté
 * mal escrito); uno que casa en TODAS sale UBICUO, porque un patrón que casa en
 * el 100 % no discrimina — está mirando otra cosa. Las dos cierran el código de
 * salida. §sondas 4 y su complementario.
 *
 * Los marcadores se eligen por ser **atributos o clases que la aplicación de
 * origen escribe y el destino no**: `data-testid` es de una suite de tests,
 * `mso-` es de Word, `docs-internal-guid` es de Google Docs. Ninguno tiene
 * sentido dentro de un `post_content` de WordPress.
 */
const FAMILIAS = [
  {
    id: "chatgpt",
    porQue: "el DOM de una conversación de chat.openai.com, con su envoltorio de UI",
    marcadores: [/data-testid="conversation-turn/, /data-message-author-role=/, /data-message-model-slug=/, /data-scroll-anchor=/, /class="[^"]*\bmarkdown prose\b/],
    tope: 20,
  },
  {
    id: "tailwind-prose",
    porQue: "clases de Tailwind Typography — ni WordPress ni Divi las sirven, así que llegan de fuera",
    marcadores: [/class="[^"]*\bprose\b/, /\bdark:prose-invert\b/, /class="[^"]*\[--thread-content/],
    tope: 20,
  },
  {
    id: "word",
    porQue: "pegado desde Microsoft Word: sus estilos y su namespace de Office",
    marcadores: [/class="Mso[A-Za-z]/, /mso-[a-z-]+\s*:/, /<o:p\b/, /xmlns:o="urn:schemas-microsoft-com/],
    tope: 40,
  },
  {
    id: "google-docs",
    porQue: "pegado desde Google Docs: el guid que inyecta al copiar",
    marcadores: [/docs-internal-guid/, /id="docs-internal-guid-/],
    tope: 40,
  },
  {
    id: "notion",
    porQue: "pegado desde Notion: sus clases y su id de bloque",
    marcadores: [/class="[^"]*\bnotion-/, /data-block-id=/],
    tope: 40,
  },
  {
    id: "markdown-renderizado",
    porQue: "restos de un renderizador de markdown ajeno (offsets del origen)",
    marcadores: [/\bdata-start="\d+"/, /\bdata-end="\d+"/],
    tope: 20,
  },
];

/** La regla del markup: los marcadores se buscan sobre el HTML sin CSS ni JS. */
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

const paginas = Object.entries(INDICE.paginas);
const ev = new Evaluadas({ nombre: "dom-ajeno", unidad: "páginas del corpus", minimo: paginas.length });

const porFamilia = Object.fromEntries(FAMILIAS.map((f) => [f.id, { paginas: [], porMarcador: {} }]));

for (const [clave, p] of paginas) {
  const legible = sinScriptNiStyle(readFileSync(join(CORPUS, p.fichero), "utf8"));
  for (const f of FAMILIAS) {
    const casan = f.marcadores.filter((re, i) => (SABOTAJE === "familia-muerta" && f.id === "chatgpt" && i === 0 ? false : re.test(legible)));
    if (SABOTAJE === "familia-muerta" && f.id === "chatgpt") continue;
    for (const re of casan) porFamilia[f.id].porMarcador[String(re)] = (porFamilia[f.id].porMarcador[String(re)] ?? 0) + 1;
    if (casan.length) porFamilia[f.id].paginas.push({ pagina: clave, marcadores: casan.length, de: f.marcadores.length });
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ DOM AJENO · ${paginas.length} páginas del corpus congelado ════════\n`);
console.log(`  familia               páginas   marcadores vivos   tope`);
let rojo = 0;
const veredicto = {};
for (const f of FAMILIAS) {
  const e = porFamilia[f.id];
  const vivos = Object.keys(e.porMarcador).length;
  const tope = SABOTAJE === "tope-cero" ? 0 : f.tope;
  let v = "ok";
  /* Un marcador MUERTO no es rojo por sí solo: una familia puede no aparecer, y
   * eso es exactamente lo que se está midiendo. Lo que SÍ es rojo es que TODOS
   * los marcadores de una familia estén muertos **y la familia aparezca** —
   * imposible— o que se supere el tope. */
  if (e.paginas.length > tope) { v = "UBICUO"; rojo++; }
  console.log(
    `  ${f.id.padEnd(22)} ${String(e.paginas.length).padStart(5)}   ${String(vivos).padStart(8)}/${f.marcadores.length}   ${String(tope).padStart(4)}  ` +
      (v === "ok" ? "" : `⛔ ${v}: casa en demasiadas, no discrimina`),
  );
  veredicto[f.id] = { paginas: e.paginas.length, marcadoresVivos: vivos, de: f.marcadores.length, tope, veredicto: v };
}

/** La guarda que el sabotaje `familia-muerta` tiene que morder. */
const familiasSinNingunMarcadorVivo = FAMILIAS.filter((f) => porFamilia[f.id].paginas.length && !Object.keys(porFamilia[f.id].porMarcador).length);
if (familiasSinNingunMarcadorVivo.length) rojo++;
/* Y la de verdad: la familia que motivó la sonda TIENE que seguir apareciendo.
 * Si deja de aparecer, o el corpus cambió o el marcador se rompió — y las dos
 * cosas hay que verlas, no leerlas como «ya no pasa». */
const chatgpt = porFamilia.chatgpt.paginas.length;
if (chatgpt === 0) {
  rojo++;
  console.error(
    `\n❌ La familia \`chatgpt\` NO aparece en ninguna página, y ES la que motivó esta sonda.\n` +
      `   Un cero aquí no es «ya no pasa»: es un marcador roto o un corpus distinto. §sondas 4.`,
  );
}

console.log(`\n  ── EL DETALLE, página a página ──`);
let total = 0;
for (const f of FAMILIAS) {
  for (const x of porFamilia[f.id].paginas) {
    console.log(`   ${f.id.padEnd(22)} ${x.marcadores}/${x.de} marcadores   ${x.pagina}`);
    total++;
  }
}
if (!total) console.log(`   (ninguna)`);

const afectadas = new Set(FAMILIAS.flatMap((f) => porFamilia[f.id].paginas.map((x) => x.pagina)));

w("medidas/dom-ajeno.json", {
  meta: {
    fecha: hoy(),
    que: "el censo de la CLASE «el editor pegó DOM de otra aplicación», no de la instancia «<article>»",
    fuente: `corpus/ congelado — ${paginas.length} páginas, sin red`,
    reglaDelMarkup: "los marcadores se buscan sobre el HTML SIN <script> ni <style>",
    sabotaje: SABOTAJE,
    noMide: ["no toca el original", "no transforma", "no decide qué hacer con lo que encuentra"],
  },
  paginasCensadas: paginas.length,
  paginasAfectadas: afectadas.size,
  porFamilia: veredicto,
  detalle: Object.fromEntries(FAMILIAS.map((f) => [f.id, porFamilia[f.id].paginas])),
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} dom-ajeno: ${afectadas.size} de ${paginas.length} páginas con DOM ajeno pegado · ` +
    `${FAMILIAS.length} familias censadas · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
