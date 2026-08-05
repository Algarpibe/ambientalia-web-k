/**
 * TEST EN NEGATIVO del extractor — UNO POR TRANSFORMACIÓN, ninguna opcional.
 *
 * `PLAN-FASE-2.md` §F2-2 lo exige literal: *«un sabotaje por cada
 * transformación, cada uno cayendo por SU invariante, y cada arreglo re-corre
 * el test entero»*. El sabotaje `tN` desactiva esa transformación y la
 * POSTCONDICIÓN de su etapa tiene que morder NOMBRÁNDOLA — no vale que caiga
 * otra guarda: eso probaría que el extractor es frágil, no que T<N> está viva.
 *
 * Y la regla 8a por construcción: si el corpus no trae el patrón de una T, el
 * extractor declara **SIN DIANA** y aquí se acepta NOMBRADO (○) — nunca como
 * verde de que la guarda muerde. El día que el corpus cambie y una diana
 * aparezca o desaparezca, este fichero cambia de dibujo y obliga a leer por qué.
 *
 * Todo corre por `corridaNegativa`: NEG desvía las congeladas a `-neg-` por
 * construcción y PISAR no puede llegar al hijo.
 *
 * Uso: npm run cms:extractor-neg      (offline: solo lee `corpus/`)
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";

process.env.SIN_CLON = "1";

const EXTRACTOR = join(QA, "../seed/extractor.mjs");

console.log(`\n════════ TEST EN NEGATIVO · extractor (T1–T8) ════════`);
console.log(`  ${TRANSFORMACIONES.length} sabotajes —uno por transformación— + control\n`);

const ev = new Evaluadas({ nombre: "extractor-neg", unidad: "sabotajes", minimo: TRANSFORMACIONES.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [EXTRACTOR], env, timeout: 600_000 });

for (const t of TRANSFORMACIONES) {
  const t0 = Date.now();
  const res = corre(t.id, { SABOTAJE: t.id });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(t.id, res.error || "no llegó a correr");
  else ev.ok();

  const mordio = new RegExp(`${t.id.toUpperCase()} POSTCONDICIÓN`).test(out);
  const sinDiana = new RegExp(`SABOTAJE=${t.id} SIN DIANA`).test(out);

  let mal = null;
  if (res.status === 0) mal = "exit 0 — ni mordió ni declaró SIN DIANA";
  else if (mordio && !sinDiana) mal = null; // cayó por SU invariante
  else if (sinDiana && !mordio) mal = null; // diana ausente, declarada
  else mal = `exit ${res.status} sin ${t.id.toUpperCase()} POSTCONDICIÓN ni SIN DIANA — cayó por otra cosa`;

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${t.id.padEnd(3)} (${seg}s)  ${mal}`);
  } else if (mordio)
    console.log(`  ✓  SABOTAJE=${t.id.padEnd(3)} (${seg}s)  su postcondición muerde — ${t.titulo.slice(0, 72)}`);
  else console.log(`  ○  SABOTAJE=${t.id.padEnd(3)} (${seg}s)  SIN DIANA declarado — el corpus no trae su patrón hoy`);
}

/* ── EL CONTROL: sin sabotaje, 8/8 limpias y el saneador admite el corpus ── */
const fCtl = join(QA, nombreNeg("medidas/extractor-corpus.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const t0 = Date.now();
const ctl = corre("control");
const seg = ((Date.now() - t0) / 1000).toFixed(0);
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!/8\/8 postcondiciones limpias/.test(ctlOut)) malCtl = "sin la línea de 8/8 postcondiciones";
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL   (sin sabotaje) (${seg}s)  ${malCtl}`);
} else console.log(`  ✓  CONTROL   (sin sabotaje) (${seg}s)  exit 0, 8/8 limpias — el extractor no falla siempre`);

const total = TRANSFORMACIONES.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor · test en negativo: ${total - fallos}/${total}\n` +
    (fallos === 0
      ? `   Las ocho transformaciones tienen guarda viva o diana declarada, y el\n` +
        `   conjunto pasa en limpio. El corpus transformado ya se puede citar.\n`
      : `   El corpus transformado NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
