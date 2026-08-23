/* t11-noop-f33 — 98.ª tanda, 2026-08-23.
 *
 * D1 se decidió: `data-teams` se limpia con una **transformación de
 * importación** (T11), y `ATRIBUTOS_CENSADOS` NO se amplía. La condición que el
 * encargo le pone es literal:
 *
 *   > «tiene que ser NO-OP sobre todo lo demás: si toca algo fuera de ese
 *   >  fichero, es que casa de más, y un detector que encuentra más de lo que
 *   >  hay no da error, da un número plausible de más».
 *
 * ── Por qué esto no es `atributo-teams-f33` otra vez ─────────────────────
 * Aquella derivación censó **el atributo**; ésta corre **la transformación**.
 * Son dos cosas distintas y sólo la segunda contesta la pregunta:
 * §*CUANDO EL CAMBIO SE PUEDA APLICAR, APLÍCALO Y MIDE* —*«si el cambio se
 * puede simular por el mismo canal que la regla que vas a escribir, simúlalo y
 * mide qué se movió: eso no es una estimación del efecto, ES el efecto»*—. Un
 * censo del atributo no puede ver que la regex de T11 case de más; sólo puede
 * verlo aplicarla y comparar los bytes.
 *
 * ── El veredicto, y es por IDENTIDAD, no por argumento ───────────────────
 * Para cada uno de los `.html` de `corpus/`: se aplica T11 y se compara la
 * salida con la entrada **byte a byte**. NO-OP significa `salida === entrada`,
 * no «no debería tocar nada».
 *
 * ── Sus dos controles, porque un NO-OP sin control no prueba nada ────────
 *   · **el positivo** — T11 tiene que actuar en el fichero que se sabe que trae
 *     el atributo. `0 tocados` sería un patrón muerto leído como «ya está
 *     limpio» (§sondas 4);
 *   · **el sintético** — un HTML fabricado con las formas vecinas
 *     (`data-teamsx`, `xdata-teams`, `data-team`, el literal dentro de un
 *     texto) que T11 **no** debe tocar, más una que sí. Sin él, «tocó 1 de 788»
 *     sólo dice que el corpus es pobre, no que la regex esté ajustada.
 *
 * ⚠ ALCANCE: mide `corpus/` entero, con `<style>` y `<script>` DENTRO —a
 * propósito: si T11 casara ahí, sería tocar de más igual—. NO mide el original
 * vivo ni las páginas que el corpus no tiene.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { T11, TRANSFORMACIONES } from "../../../../scripts/seed/transformaciones.mjs";

const RAIZ = join(import.meta.dirname, "../../../..");
const CORPUS = join(RAIZ, "corpus");
const L = (s = "") => console.log(s);

function htmls(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) htmls(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}
const FICHEROS = htmls(CORPUS);

let rojo = 0;
const mal = (m) => { rojo++; console.error(`\n❌ ${m}`); };

L(`═══ t11-noop-f33 · T11 APLICADA sobre el corpus entero: ¿toca sólo lo suyo?\n`);
L(`  ficheros .html bajo corpus/              ${FICHEROS.length}`);

/* ── 1 · la aplicación, y el NO-OP por identidad de bytes ────────────────── */
const tocados = [];
let idénticos = 0;
for (const f of FICHEROS) {
  const antes = readFileSync(f, "utf8");
  const diana = T11.diana(antes);
  const { html: después, n } = T11.aplica(antes);
  const rel = f.slice(CORPUS.length + 1).replace(/\\/g, "/");

  if (n === 0) {
    if (después === antes) idénticos++;
    else mal(`NO-OP ROTO: ${rel} — T11 dice n=0 y la salida difiere en ${antes.length - después.length} chars`);
    continue;
  }
  if (diana !== n) mal(`${rel}: diana ${diana} ≠ aplicadas ${n} — la sonda no cuenta lo que la transformación hace`);
  /* Reconstrucción: lo único que se fue son las ocurrencias del atributo. */
  const quitados = [...antes.matchAll(/\sdata-teams\s*=\s*"[^"]*"/gi)];
  const suma = después.length + quitados.reduce((a, m) => a + m[0].length, 0);
  if (suma !== antes.length)
    mal(`${rel}: reconstrucción ${suma} ≠ ${antes.length} chars — T11 se llevó algo que no era el atributo`);
  if (T11.post(después).length) mal(`${rel}: la postcondición de T11 sigue mordiendo después de aplicarla`);
  tocados.push({ rel, n, chars: quitados.reduce((a, m) => a + m[0].length, 0) });
}

L(`  ficheros que T11 TOCA                    ${tocados.length}`);
L(`  ficheros idénticos byte a byte           ${idénticos}`);
for (const t of tocados) L(`     ${t.n}×  ${t.rel}   (−${t.chars} chars)`);

/* ── 2 · control POSITIVO: el patrón no está muerto ──────────────────────── */
L(`\n  ── control POSITIVO ──`);
if (!tocados.length) {
  mal(`0 ficheros tocados: el patrón de T11 no casa con nada. Un patrón muerto no es un cero (§sondas 4).`);
} else L(`     ✓ T11 actúa en ${tocados.length} fichero(s): el patrón está vivo`);

/* ── 3 · control SINTÉTICO: las formas vecinas que NO se tocan ───────────── */
L(`\n  ── control SINTÉTICO · las vecinas que T11 NO debe tocar ──`);
const VECINAS = [
  ['<span data-teamsx="true">a</span>', 0, "atributo más largo"],
  ['<span xdata-teams="true">a</span>', 0, "atributo con prefijo"],
  ['<span data-team="true">a</span>', 0, "atributo más corto"],
  ["<p>el literal data-teams=\"true\" escrito en el TEXTO</p>", 0, "fuera de un tag"],
  ['<span class="x" data-teams="true">a</span>', 1, "la forma servida (con otra clase al lado)"],
  ['<span data-teams="true">a</span>', 1, "la forma servida, desnuda"],
];
for (const [entrada, esperado, porQue] of VECINAS) {
  const { html: salida, n } = T11.aplica(entrada);
  const ok = n === esperado && (esperado === 0 ? salida === entrada : !/data-teams/.test(salida));
  if (!ok) mal(`control sintético: "${entrada}" dio n=${n} (esperaba ${esperado}) → ${salida}`);
  L(`     ${ok ? "✓" : "✗"} n=${n}  ${porQue.padEnd(38)} ${esperado ? "→ " + salida : "(intacto)"}`);
}

/* ── 4 · el reparto por SUBÁRBOL, para que el «1» no se lea como una clase ─ */
L(`\n  ── el reparto, por subárbol de corpus/ ──`);
const porSub = {};
for (const f of FICHEROS) {
  const sub = f.slice(CORPUS.length + 1).replace(/\\/g, "/").split("/")[0];
  porSub[sub] ??= { total: 0, tocados: 0 };
  porSub[sub].total++;
}
for (const t of tocados) porSub[t.rel.split("/")[0]].tocados++;
for (const [k, v] of Object.entries(porSub).sort())
  L(`     ${k.padEnd(16)} ${String(v.tocados).padStart(4)} / ${String(v.total).padStart(4)}`);

/* ── 5 · T11 NO está en la cadena del grupo A, y aquí está el número ─────── */
L(`\n  ── por qué T11 NO entra en \`TRANSFORMACIONES\` (§regla 21, tercer caso) ──`);
L(`     Ts en la cadena del grupo A            ${TRANSFORMACIONES.length}`);
L(`     ¿está T11 entre ellas?                 ${TRANSFORMACIONES.includes(T11) ? "SÍ" : "no"}`);
const enPostContent = tocados.filter((t) => !t.rel.startsWith("fase-3/"));
L(`     ficheros tocados FUERA de fase-3/      ${enPostContent.length}`);
L(`     → con diana 0 en su corpus, \`extractor.neg\` informaría SIN DIANA y saldría`);
L(`       ROJO. Eso no es «roto» ni «probado»: es SIN PROBAR, y un SIN PROBAR en`);
L(`       verde se lee como probado. Su negativo vive donde SÍ hay diana:`);
L(`       \`extractor-f33.neg.mjs\` §t11.`);
if (TRANSFORMACIONES.includes(T11))
  mal(`T11 está en \`TRANSFORMACIONES\`: su sabotaje en \`extractor.neg\` saldrá SIN DIANA.`);

L(
  `\n${rojo ? "❌" : "✅"} t11-noop-f33: ${tocados.length} de ${FICHEROS.length} ficheros tocados · ` +
    `${idénticos} idénticos byte a byte · ${VECINAS.length} controles sintéticos · ${rojo} en rojo`,
);
if (!rojo)
  L(
    `   El NO-OP es por IDENTIDAD, no por argumento: los ${idénticos} ficheros que T11 no\n` +
      `   toca salen con los MISMOS bytes con los que entraron.\n` +
      `   ⚠ Y el alcance: esto mide UN atributo. La CLASE «residuo de pegado del editor»\n` +
      `     sigue SIN MEDIR — que no es 0 (atributo-teams-f33.log §ALCANCE).`,
  );
process.exit(rojo ? 2 : 0);
