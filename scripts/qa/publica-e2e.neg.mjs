/**
 * TEST EN NEGATIVO de `publica-e2e` — 2 sabotajes + control.
 *
 * Uso:  npm run qa:publica-e2e-neg
 *
 * ── Qué tiene que ver esta sonda, y por qué estos dos falsadores ──────────
 *
 * | sabotaje | qué quita | qué invariante DEBE caer |
 * |---|---|---|
 * | `hook-mudo` | `PUBLICAR_URL` en el momento del guardado | **E2** — el hook no avisa. Es el falsador de *«publicar dispara»*, o sea del eslabón que da nombre a CMS-0c |
 * | `disparo-fantasma` | cuenta un disparo **antes** de guardar nada | **E1** — el control. Sin él, un publicador que contara disparos de cualquier origen daría E2 verde sin hook |
 *
 * ── ⚠ Los dos son necesarios y ninguno cubre al otro ─────────────────────
 * `hook-mudo` prueba que E2 **muerde**; `disparo-fantasma` prueba que E1 **mide
 * el cero de verdad**. Un negativo con sólo el primero dejaría vivo el caso que
 * §regla 8a describe: *«un sabotaje que no cambia el resultado ha probado que el
 * instrumento no ejercita la guarda»* — con E1 siempre a cero por construcción,
 * E2 podría estar contando cualquier cosa.
 *
 * ── ⚠ Esta sonda CONSTRUYE de verdad (E4), así que el negativo es caro ────
 * Cada corrida son dos `next build` (~90 s), y hay tres corridas: control y dos
 * sabotajes. Se declara aquí en vez de descubrirse a los diez minutos.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "publica-e2e.mjs");
const salidaDe = (etiqueta) => nombreNeg(`medidas/publica-e2e-${etiqueta}.json`, etiqueta);

const casos = [
  {
    etiqueta: "hook-mudo",
    porQue: "se quita `PUBLICAR_URL` al guardar ⇒ el hook no avisa: cae E2, el eslabón de CMS-0c",
    env: { SABOTAJE: "hook-mudo" },
    salidaTiene: /✗ E2·guardar DISPARA/,
  },
  {
    etiqueta: "disparo-fantasma",
    porQue:
      "se registra un disparo ANTES de guardar nada ⇒ cae E1: sin ese control, un recuento " +
      "contaminado daría E2 verde sin que el hook existiera",
    env: { SABOTAJE: "disparo-fantasma" },
    salidaTiene: /✗ E1·sin PUBLICAR_URL el hook es inerte/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · publica-e2e ════════\n`);

const ev = new Evaluadas({ nombre: "publica-e2e-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* ── EL CONTROL, primero: un sabotaje sólo aísla algo si se parte de limpio ── */
const salCtl = salidaDe("control");
if (existsSync(join(QA, salCtl))) rmSync(join(QA, salCtl));
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA], env: { SALIDA: salCtl } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const nInv = /evaluadas (\d+)\/(\d+) invariantes/.exec(ctlOut);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!nInv) malCtl = "no dice cuántos invariantes evaluó";
else if (Number(nInv[1]) < Number(nInv[2])) malCtl = `evaluó ${nInv[1]} de ${nInv[2]}`;
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL              ${malCtl}`);
} else console.log(`  ✓  CONTROL              exit 0 · ${nInv[1]}/${nInv[2]} invariantes`);

for (const c of casos) {
  const sal = salidaDe(c.etiqueta);
  if (existsSync(join(QA, sal))) rmSync(join(QA, sal));
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: { ...c.env, SALIDA: sal } });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  /* Exit 1 y no otro: el invariante se EVALUÓ y se incumplió. Un exit distinto
   * sería «no se pudo evaluar», que es otra frase (§sondas 4bis). */
  if (res.status !== 1) mal = `esperaba exit 1, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(20)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(20)} ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} publica-e2e · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve un hook que no avisa y ve un recuento de disparos contaminado.\n`
      : `   Los invariantes de punta a punta NO se pueden citar hasta que esto salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
