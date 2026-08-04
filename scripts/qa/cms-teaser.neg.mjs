/**
 * TEST EN NEGATIVO de `cms-teaser` — el falsador **falsado**, con control.
 *
 * `cms-teaser` es lo único que sostiene la decisión §F2-2 · TEASER (*guardar el
 * teaser como dato propio*), y la sostiene por un solo hecho: que `date` sale
 * **DISTINTO**. Un programa que dijera DISTINTO pase lo que pase daría
 * exactamente la misma salida y la decisión estaría apoyada en nada.
 *
 *   · `derivable` — se le da a `date` el **formateador de meses en español** que
 *     la decisión dice que no se puede escribir, así que el teaser y el
 *     documento coinciden. El veredicto tiene que **voltear a FALSADA**. Es el
 *     invariante que hace del falsador un falsador: sabe decir *«me equivoqué»*;
 *   · `sin-pares` — ningún teaser encuentra destino ⇒ **exit 2**. Es la regla del
 *     cero, y la propia sonda la declara: *«0 pares comparables NO es verde»*.
 *
 * ⚠ **Y el `derivable` no es un sabotaje inventado: es la alternativa REAL que
 * la decisión rechazó.** Correrlo prueba dos cosas a la vez — que la sonda sabe
 * fallar, y que *«escribe un formateador y el teaser se deriva»* es una salida
 * técnicamente viable. Que no se tome no es porque no funcione: es que
 * re-formatear **normaliza en silencio las erratas del original**, y el contrato
 * de fidelidad de `CLAUDE.md` §1 lo prohíbe. La decisión es de contrato, no de
 * capacidad, y este fichero es lo que lo demuestra.
 *
 * El **CONTROL**: sin sabotaje, `date` DISTINTO y la decisión SE SOSTIENE. Sin
 * él, los dos negativos los aprobaría una sonda rota de fábrica (F2-1 §5).
 *
 * Uso: npm run qa:cms-teaser-neg
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "derivable",
    exit: 0,
    porQue: "con formateador de meses, `date` coincide ⇒ el veredicto VOLTEA a FALSADA",
    salidaTiene: /QUEDA FALSADA/,
    comprueba: (d) =>
      d.veredicto?.decision === "FALSADA" && d.veredicto.noDerivables.length === 0
        ? null
        : `esperaba FALSADA sin no-derivables, salió ${d.veredicto?.decision} con [${d.veredicto?.noDerivables}]`,
  },
  {
    sabotaje: "sin-pares",
    exit: 2,
    porQue: "0 pares comparables ⇒ NO SE PUEDE DECIDIR, y sale por error (regla del cero)",
    salidaTiene: /NO SE PUEDE DECIDIR/,
    comprueba: (d) =>
      d.veredicto?.paresComparables === 0 ? null : `esperaba 0 pares congelados, salió ${d.veredicto?.paresComparables}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-teaser ════════`);
console.log(`  el falsador de §F2-2 · TEASER, falsado — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "cms-teaser-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (env) =>
  spawnSync(process.execPath, [join(QA, "cms-teaser.mjs")], {
    env: { ...process.env, PISAR: "1", ...env },
    encoding: "utf8",
    timeout: 300_000,
  });

for (const c of casos) {
  const fichero = join(QA, `medidas/cms-teaser-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre({ SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(10)}  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(10)}  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
/* ⚠ El CONTROL escribe en SU PROPIO nombre. Antes iba con PISAR sobre la
 * medida canónica: una corrida de un test en negativo re-congelando la
 * evidencia buena, que es la regla 5 automatizada. */
const F_CTL = "medidas/cms-teaser-neg-control.json";
const fCtl = join(QA, F_CTL);
const ctl = corre({ SALIDA: F_CTL });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  if (d.veredicto?.decision !== "SE SOSTIENE") malCtl = `veredicto ${d.veredicto?.decision}, esperaba SE SOSTIENE`;
  else if (!d.veredicto.noDerivables.includes("entradas-blog.date"))
    malCtl = `los no derivables son [${d.veredicto.noDerivables}] y "date" no está — la decisión se apoya en ÉL`;
  else if (!/1 campo\(s\) NO derivables/.test(ctlOut)) malCtl = "la salida no dice cuántos campos no derivan";
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL    (sin sabotaje)  ${malCtl}`); }
else console.log(`  ✓  CONTROL    (sin sabotaje)  \`date\` DISTINTO ⇒ la decisión SE SOSTIENE`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-teaser · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El falsador sabe falsar: con un formateador de meses la decisión CAE, y sin\n` +
        `   él se sostiene sobre \`date\`. O sea que §F2-2 · TEASER es una decisión de\n` +
        `   CONTRATO (fidelidad verbatim), no una limitación técnica.\n`
      : `   §F2-2 · TEASER NO se puede citar como medida hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
