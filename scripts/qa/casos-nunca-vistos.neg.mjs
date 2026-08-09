/**
 * TEST EN NEGATIVO de `casos-nunca-vistos` — con control.
 * Uso: npm run qa:nunca-vistos-neg
 *
 * Esta sonda es rara entre las del repo: **su salida normal es una lista larga
 * y su código de salida es 0 pase lo que pase con esa lista.** Un inventario no
 * juzga. Y eso la hace especialmente fácil de romper sin que se note, porque
 * los tres modos de fallo dan **números plausibles**:
 *
 *   · `sin-casos`       — el walker no reconoce ningún caso ⇒ **0 sin
 *     ejercitar**, que se lee como cobertura perfecta. Es §sondas 4, el cero;
 *   · `todo-ejercitado` — todos marcados vistos ⇒ **0 sin ejercitar** otra vez,
 *     pero por el camino contrario. Es el PLENO, y sin la guarda serían
 *     indistinguibles: la misma cifra por dos causas opuestas;
 *   · `sin-catalogos`   — no se recorre ninguna fila ⇒ **296 sin ejercitar**,
 *     el máximo posible, y la lista es verdadera y vacua. Es §sondas 4bis.
 *
 * ⚠ **Los dos primeros producen EL MISMO número** —cero— y el tercero produce
 * el máximo. Ninguno de los tres da un error por sí solo: los tres darían un
 * informe con pinta de informe. Por eso las tres guardas están en la sonda y
 * las tres se ejercitan aquí.
 *
 * El **CONTROL** cierra el triángulo: sin sabotaje, ni 0 ni el máximo.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-casos",
    exit: 2,
    porQue: "0 casos declarados ⇒ «0 sin ejercitar» sería cobertura perfecta de nada (el cero)",
    salidaTiene: /CERO CASOS DECLARADOS/,
    comprueba: (d) => (d.contrato?.universo === 0 ? null : `esperaba universo 0, salió ${d.contrato?.universo}`),
  },
  {
    sabotaje: "todo-ejercitado",
    exit: 2,
    porQue: "0 sin ejercitar por el camino OPUESTO ⇒ PLENO. Mismo número que `sin-casos`, causa contraria",
    salidaTiene: /PLENO/,
    comprueba: (d) =>
      d.sinEjercitar?.total === 0 && d.contrato?.universo > 0
        ? null
        : `esperaba 0 sin ejercitar con universo > 0; salió ${d.sinEjercitar?.total} / ${d.contrato?.universo}`,
  },
  {
    sabotaje: "sin-catalogos",
    exit: 2,
    porQue: "0 filas recorridas ⇒ el MÁXIMO sin ejercitar, y la lista es verdadera y vacua",
    salidaTiene: /CERO FILAS RECORRIDAS/,
    comprueba: (d) =>
      d.contrato?.filasRecorridas === 0 && d.sinEjercitar?.total === d.contrato?.universo
        ? null
        : `esperaba 0 filas y todo sin ejercitar; salió ${d.contrato?.filasRecorridas} filas y ${d.sinEjercitar?.total}/${d.contrato?.universo}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · casos-nunca-vistos ════════`);
console.log(`  el inventario de la FAMILIA DE CALIBRACIÓN del esquema — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "casos-nunca-vistos-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "casos-nunca-vistos.mjs")], env, timeout: 300_000 });
const fich = (e) => join(QA, nombreNeg("medidas/casos-nunca-vistos.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);

/* ── EL CONTROL, primero ────────────────────────────────────────────────── */
if (existsSync(fich("control"))) rmSync(fich("control"));
const ctl = corre("control");
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.contrato?.problemas?.length) malCtl = `el instrumento se acusó: ${dCtl.contrato.problemas[0]}`;
else if (!(dCtl.sinEjercitar?.total > 0)) malCtl = "0 sin ejercitar: no puede ser sobre 46 filas y este esquema";
else if (dCtl.sinEjercitar.total >= dCtl.contrato.universo)
  malCtl = `TODO sin ejercitar (${dCtl.sinEjercitar.total}/${dCtl.contrato.universo}): las filas no se recorrieron`;
else if (!(dCtl.contrato?.filasRecorridas > 0)) malCtl = "0 filas recorridas en el control";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL   ${dCtl.sinEjercitar.total}/${dCtl.contrato.universo} sin ejercitar sobre ` +
      `${dCtl.contrato.filasRecorridas} filas — ni 0 ni el máximo`,
  );

for (const c of casos) {
  if (existsSync(fich(c.sabotaje))) rmSync(fich(c.sabotaje));
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(17)} ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(17)} ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} casos-nunca-vistos · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El inventario distingue sus tres formas de no medir nada — y dos de ellas\n` +
        `   producen EL MISMO cero por causas opuestas. Sin las tres guardas, «0 casos\n` +
        `   sin ejercitar» sería la mejor noticia posible y la peor a la vez.\n`
      : `   El inventario del PASO 3 no se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
