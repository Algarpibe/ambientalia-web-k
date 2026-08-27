/**
 * DEUDA ABIERTA · derivada de `PENDIENTES-QA.md`, no recordada (119.ª, 2026-08-27)
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 * «¿Qué deuda sigue abierta, y cuánta?» — con su CARDINAL y su UNIDAD, que es
 * lo que hace estimable el proyecto. Hoy la política implícita es pagar toda
 * deuda encontrada, y por eso la fecha se mueve sola.
 *
 * ── LA UNIDAD, y no es el defecto ─────────────────────────────────────────
 * La unidad es **LA FICHA** (una cabecera `## `). Una ficha puede contener
 * varios defectos y dos fichas pueden hablar del mismo, así que «N fichas» y
 * «N defectos» son DOS CARDINALES CIERTOS A LA VEZ, uno por unidad. Se cuenta
 * la ficha porque es lo que se puede contar sin interpretar
 * (§*se compara en la unidad que se afirma*).
 *
 * ── EL DISCRIMINADOR, y por qué NO es el emoji de la cabecera ─────────────
 * La v1 de esta derivación trató `⚠` como marcador de estado y publicó
 * **147 abiertas de 314 (46.8 %)**. Es el sobre-casado de §sondas 4: un número
 * plausible de más, que invita a explicarlo. Muestreadas, las `⚠` mezclan
 * deuda viva (*«el clon lo pierde ENTERO»*) con **actas de tanda**
 * (*«las TRES predicciones salieron FALSAS, y se dicen»*), que no son deuda.
 *
 * > **`⛔` es el marcador de BLOQUEO del repo; `⚠` es un TONO.** Los dos se
 * > escriben igual de fácil y sólo el primero declara estado.
 *
 * Así que el estado se lee del CUERPO de la ficha, no de su emoji — y como eso
 * es un heurístico, lleva **control**: se aplica primero a las `⛔`, donde la
 * cabecera ya da la respuesta, y se publica **cuántas reproduce**. Un
 * discriminador que no acierta sobre el conjunto conocido no se usa sobre el
 * desconocido (§regla 8: *un negativo sin control no es un negativo*).
 *
 * ── Qué NO contesta, con su número (§regla 14) ────────────────────────────
 *   · NO decide qué se paga — eso es del propietario;
 *   · NO cubre deuda fuera de este fichero (código, `HANDOFF`, planes de
 *     fase). El alcance es **UN fichero**, declarado;
 *   · NO juzga gravedad: eso lo hace la clasificación contra el listón, que va
 *     en el acta y se escribe a mano con el criterio al lado.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(AQUI, "..", "..", "..", "..");
const FICHERO = join(REPO, "docs", "PENDIENTES-QA.md");

const lineas = readFileSync(FICHERO, "utf8").split(/\r?\n/);

/** Toda cabecera `## `, con su número de línea y el cuerpo hasta la siguiente. */
const FICHAS = [];
for (let i = 0; i < lineas.length; i++) {
  if (!lineas[i].startsWith("## ")) continue;
  FICHAS.push({ n: i + 1, txt: lineas[i].slice(3), desde: i + 1 });
}
for (let k = 0; k < FICHAS.length; k++) {
  const fin = k + 1 < FICHAS.length ? FICHAS[k + 1].n - 1 : lineas.length;
  FICHAS[k].cuerpo = lineas.slice(FICHAS[k].desde, fin).join("\n");
  FICHAS[k].nLineas = fin - FICHAS[k].desde;
}

/* ── eje 1 · el MARCADOR de la cabecera (derivable, y es lo único que declara
 *            estado por sí solo) ─────────────────────────────────────────── */

const RETIRADA = (t) =>
  /\(histórico\)/.test(t) || /\(RETIRADA\)/.test(t) || /^\s*~~/.test(t)
  || /~~[^~]+~~\s*·/.test(t) || /enunciado original/.test(t)
  || /SÓLO NOMBR/.test(t) || /se retira/i.test(t);

function marcador(t) {
  if (RETIRADA(t)) return "RETIRADA";
  if (t.startsWith("✅")) return "✅ cerrada";
  if (t.startsWith("⛔")) return "⛔ bloqueo";
  if (/^[⚠🧨🟠🔒🟡🔎📋📦📅📐🐞]/u.test(t)) return "⚠ tono";
  return "sin marcador";
}

/* ── eje 2 · el ESTADO leído del cuerpo (heurístico, va con su control) ──── */

function estadoPorCuerpo(f) {
  const t = f.txt;
  /* Lo EXPLÍCITO en la cabecera gana a cualquier lectura del cuerpo. */
  if (/\bABIERTA\b/.test(t) || /\bFICHAD[AO]\b/.test(t)) return "ABIERTA";
  if (/\bCERRAD[AO]\b/.test(t)) return "CERRADA";
  const c = f.cuerpo;
  /* Una ficha que declara su cierre dentro lleva un ✅ de cierre, no de paso. */
  if (/^>?\s*\*?\*?✅+\s*\*?\*?(CERRAD|RESUELT|MEDID[OA]\b.*CIERR)/mu.test(c)) return "CERRADA";
  if (/\bCERRAD[AO]\b\s*(el|—|·|\()/.test(c)) return "CERRADA";
  if (/\b(SIN PROBAR|SIN DERIVAR|SIN MEDIR|PENDIENTE|queda abierto|sigue abierta|no se ha (medido|arreglado))\b/i.test(c))
    return "ABIERTA";
  return "INDETERMINADA";
}

for (const f of FICHAS) { f.marc = marcador(f.txt); f.est = estadoPorCuerpo(f); }

/* ── CONTROL · el heurístico del cuerpo sobre el conjunto donde la cabecera
 *              YA da la respuesta: las ⛔ (bloqueo ⇒ ABIERTA) y las ✅ ────── */

const ctrlBloqueo = FICHAS.filter((f) => f.marc === "⛔ bloqueo");
const ctrlCerrada = FICHAS.filter((f) => f.marc === "✅ cerrada");
const aciertaB = ctrlBloqueo.filter((f) => f.est === "ABIERTA").length;
const aciertaC = ctrlCerrada.filter((f) => f.est === "CERRADA").length;

/* ── salida ────────────────────────────────────────────────────────────── */

const R = (n) => String(n).padStart(4);
console.log("═".repeat(80));
console.log("DEUDA ABIERTA · derivada de docs/PENDIENTES-QA.md — 119.ª, 2026-08-27");
console.log("═".repeat(80));
console.log(`\nALCANCE  : UN fichero — docs/PENDIENTES-QA.md (${lineas.length} líneas)`);
console.log(`UNIDAD   : LA FICHA (cabecera \`## \`) — NO el defecto`);
console.log(`TOTAL    : ${FICHAS.length} fichas`);

console.log(`\n${"─".repeat(80)}\nEJE 1 · el MARCADOR de la cabecera (lo único que declara estado por sí solo)\n${"─".repeat(80)}`);
const porMarc = {};
for (const f of FICHAS) (porMarc[f.marc] = porMarc[f.marc] || []).push(f);
for (const k of ["⛔ bloqueo", "⚠ tono", "✅ cerrada", "RETIRADA", "sin marcador"])
  console.log(`  ${k.padEnd(16)} ${R((porMarc[k] || []).length)}  (${(((porMarc[k] || []).length * 100) / FICHAS.length).toFixed(1)} %)`);
const sumaM = Object.values(porMarc).reduce((a, v) => a + v.length, 0);
console.log(`  ${"suma".padEnd(16)} ${R(sumaM)}   ${sumaM === FICHAS.length ? "✓ cuadra" : "✗ NO CUADRA"}`);

console.log(`\n${"─".repeat(80)}\nCONTROL del heurístico de cuerpo (§regla 8)\n${"─".repeat(80)}`);
console.log(`  sobre ⛔ (la cabecera dice BLOQUEO ⇒ debería salir ABIERTA)  : ${aciertaB}/${ctrlBloqueo.length}`);
console.log(`  sobre ✅ (la cabecera dice CERRADA ⇒ debería salir CERRADA)  : ${aciertaC}/${ctrlCerrada.length}`);
const poder = ctrlBloqueo.length + ctrlCerrada.length;
const ok = aciertaB + aciertaC;
console.log(`  acierto conjunto                                            : ${ok}/${poder}  (${((ok * 100) / poder).toFixed(1)} %)`);
console.log(`\n  ⇒ el heurístico ${(ok * 100) / poder >= 80 ? "SE USA" : "NO SE USA"} sobre las ⚠, y su fracción va publicada al lado.`);

console.log(`\n${"─".repeat(80)}\nEJE 2 · estado por cuerpo, SÓLO dentro de las ⚠ (${(porMarc["⚠ tono"] || []).length} fichas)\n${"─".repeat(80)}`);
const tono = porMarc["⚠ tono"] || [];
for (const e of ["ABIERTA", "CERRADA", "INDETERMINADA"])
  console.log(`  ${e.padEnd(16)} ${R(tono.filter((f) => f.est === e).length)}`);

console.log(`\n${"═".repeat(80)}\nLA DEUDA ABIERTA — ⛔ vivas, una a una\n${"═".repeat(80)}`);
const vivas = ctrlBloqueo;
for (const f of vivas)
  console.log(`  L${String(f.n).padStart(5)} · ${String(f.nLineas).padStart(4)} líneas · ${f.txt.replace(/\*\*/g, "").replace(/`/g, "").slice(0, 100)}`);

console.log(`\n${"═".repeat(80)}\n⚠ CON CUERPO QUE DICE ABIERTA — candidatas a deuda que el emoji no declara\n${"═".repeat(80)}`);
for (const f of tono.filter((x) => x.est === "ABIERTA"))
  console.log(`  L${String(f.n).padStart(5)} · ${String(f.nLineas).padStart(4)} líneas · ${f.txt.replace(/\*\*/g, "").replace(/`/g, "").slice(0, 100)}`);

console.log(`\n${"═".repeat(80)}\n⚠ INDETERMINADAS — se publican con su cardinal, NO se reparten a ojo\n${"═".repeat(80)}`);
const ind = tono.filter((x) => x.est === "INDETERMINADA");
if (!ind.length) console.log("  (ninguna)");
for (const f of ind)
  console.log(`  L${String(f.n).padStart(5)} · ${f.txt.replace(/\*\*/g, "").replace(/`/g, "").slice(0, 100)}`);

console.log(`\n${"═".repeat(80)}\nSIN MARCADOR — publicadas para que nadie las dé por clasificadas\n${"═".repeat(80)}`);
const sm = porMarc["sin marcador"] || [];
if (!sm.length) console.log("  (ninguna)");
for (const f of sm)
  console.log(`  L${String(f.n).padStart(5)} · ${f.txt.replace(/\*\*/g, "").replace(/`/g, "").slice(0, 100)}`);

if (sumaM !== FICHAS.length) { console.error("\n❌ el reparto no suma"); process.exit(1); }
console.log(`\n✓ derivadas ${FICHAS.length}/${FICHAS.length} fichas · unidad: FICHA`);
