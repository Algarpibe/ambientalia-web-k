/**
 * TEST EN NEGATIVO de `programada` — F2-4 pasos 3 y 4.
 * Uso: npm run qa:programada-neg
 *
 * ── Los tres sabotajes, y cada uno cae por SU invariante ──────────────────
 *
 *   1 · **`sin-filtro`** — el proyector deja de filtrar por `estado`. Es el
 *       defecto que esta tanda ya cometió de verdad: el filtro estuvo escrito
 *       en `todos()` de `local.ts`, que **no lo usa ninguna familia**, y el Δ0
 *       de las 31 rutas salió verde igual porque las 63 filas estaban
 *       publicadas. **Un filtro que no corre y uno correcto dan la misma
 *       salida** mientras no haya un borrador — así que el falsador ES el
 *       borrador;
 *   2 · **`cron-sin-hora`** — el cron publica todo lo que esté en borrador sin
 *       mirar `publicarEn`. Cae P2, que es el negativo del PASO 3: sin él,
 *       «el cron publica lo que vence» se cumpliría publicándolo TODO;
 *   3 · **`preview-abierta`** — la preview no comprueba el token. Cae P4, y es
 *       la única guarda de la grieta de runtime.
 *
 * ⚠ Los sabotajes 1 y 3 tocan **código del artefacto**, no del publicador, así
 * que se aplican por variable de entorno leída en el propio fichero y el
 * artefacto **se reconstruye** al terminar: un sabotaje que se quede pegado al
 * `.next` es una regresión sembrada a mano.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "programada.mjs");
const RAIZ = join(QA, "../..");
const salidaDe = (e) => nombreNeg(`medidas/programada-${e}.json`, e);

const casos = [
  {
    etiqueta: "sin-filtro",
    porQue: "el proyector deja de filtrar por `estado` ⇒ el borrador SALE en el build propio de P1: cae P1",
    env: { PROGRAMADA_SABOTAJE: "sin-filtro" },
    salidaTiene: /✗ P1·borrador fuera del build/,
  },
  {
    etiqueta: "cron-sin-hora",
    porQue: "el cron publica todo borrador sin mirar la hora ⇒ cae P2, el negativo del PASO 3",
    env: { SABOTAJE: "cron-sin-hora" },
    salidaTiene: /✗ P2·futuro NO se publica/,
  },
  {
    etiqueta: "preview-abierta",
    porQue: "la preview no comprueba el token ⇒ cae P4: la grieta queda sin puerta",
    env: { PROGRAMADA_SABOTAJE: "preview-abierta" },
    reconstruye: true,
    salidaTiene: /✗ P4·preview sin credencial/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · programada ════════\n`);

const ev = new Evaluadas({ nombre: "programada-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const construye = (etiqueta, env = {}) => {
  const b = spawnSync("npm", ["run", "build", "-w", "web"], {
    cwd: RAIZ, shell: true, encoding: "utf8", timeout: 600_000,
    env: { ...process.env, ...env },
  });
  if (b.status !== 0) { fallos++; console.log(`  ❌ ${etiqueta}: el build falló (exit ${b.status})`); return false; }
  return true;
};

/* ── CONTROL ─────────────────────────────────────────────────────────────── */
const salCtl = salidaDe("control");
if (existsSync(join(QA, salCtl))) rmSync(join(QA, salCtl));
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA], env: { SALIDA: salCtl } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const nInv = /evaluadas (\d+)\/(\d+) invariantes/.exec(ctlOut);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!nInv) malCtl = "no dice cuántos invariantes evaluó";
else if (Number(nInv[1]) < Number(nInv[2])) malCtl = `evaluó ${nInv[1]} de ${nInv[2]}`;
if (malCtl) { fallos++; console.log(`  ❌ CONTROL              ${malCtl}`); }
else console.log(`  ✓  CONTROL              exit 0 · ${nInv[1]}/${nInv[2]} invariantes`);

/* ── SABOTAJES ───────────────────────────────────────────────────────────── */
for (const c of casos) {
  const sal = salidaDe(c.etiqueta);
  if (existsSync(join(QA, sal))) rmSync(join(QA, sal));
  /* Los que tocan el artefacto necesitan un build CON el sabotaje puesto. */
  if (c.reconstruye && !construye(c.etiqueta, c.env)) { ev.fallo(c.etiqueta, "no se pudo construir"); continue; }

  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: { ...c.env, SALIDA: sal } });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== 1) mal = `esperaba exit 1, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(18)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(18)} ${c.porQue}`);
}

/* ── Devolver el artefacto a su estado LIMPIO ─────────────────────────────
 * Un sabotaje del artefacto que se quede en `.next` es una regresión sembrada
 * a mano y sin ficha. Se reconstruye SIN sabotaje, siempre. */
console.log(`\n  · reconstruyendo el artefacto sin sabotaje…`);
if (construye("restauración")) console.log(`  ✓  \`.next\` limpio`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} programada · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve un filtro de publicación que no filtra, un cron que ignora la hora y una\n` +
        `   preview sin puerta.\n`
      : `   Los invariantes de programación y preview NO se pueden citar hasta que salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
