/**
 * TEST EN NEGATIVO de `barra-cmp` — cada sabotaje por SU motivo, con control.
 * Uso: npm run qa:barra-cmp-neg     (necesita red: el lado del original es vivo)
 *
 * ── El control NO es «exit 0», y decirlo importa ──────────────────────────
 * `barra-cmp` es un COMPARADOR y su primera corrida encuentra diferencias: ése
 * es el hallazgo, no un fallo. Así que un control que exigiera exit 0 estaría
 * exigiendo que la sonda **no encuentre lo que vino a buscar**, y ponerla verde
 * ajustando esa expectativa sería escribir el defecto DENTRO de la guarda
 * (§regla 21).
 *
 * Lo que el control sí afirma, y es comprobable:
 *
 *   · **alcanza su dominio entero** — `evaluadas N/N piezas`, numerador y
 *     denominador **en la misma unidad**;
 *   · **publica el eje mixto solo**, con su cardinal, ANTES del titular;
 *   · **el envoltorio sale distinto por forma** (`envoltorio-L1` en blog y
 *     etiqueta, `envoltorio-L2` en glosario). Si saliera el mismo en las tres,
 *     la sonda no estaría discriminando las dos capas y todo lo demás daría
 *     igual.
 *
 * ── Los cuatro sabotajes, y por qué cada uno ──────────────────────────────
 *
 * | caso | anula | tiene que caer por |
 * |---|---|---|
 * | `sin-original` | el lado del original **entero** | el CONTRATO (0 piezas leídas en los dos lados) |
 * | `lector-ciego` | el contenedor, y con él widgets y botón | el CONTRATO |
 * | `dominio-encogido` | 2 de las 3 formas | el CONTRATO — **y el mínimo NO baja con él** |
 * | `sin-diferencias` | la diferencia entre los dos lados | **exit 0 y `distintos: 0`** |
 *
 * ⚠ **`dominio-encogido` es el que prueba §regla 17.** Si el mínimo se
 * derivara de la variable que el sabotaje encoge —el catálogo— encoger el
 * dominio bajaría también la portería y el caso saldría **verde sin haber
 * probado nada**. Por eso el mínimo sale de `lh-barra.json` (fuente
 * independiente) y del **fuente literal** del catálogo, no de la variable.
 *
 * ⚠ **`sin-diferencias` es el único que sale VERDE, y es el que discrimina.**
 * Los otros tres prueban que la sonda sabe decir «no pude»; sólo éste prueba
 * que la comparación COMPARA. Si con los dos lados idénticos siguieran
 * saliendo diferencias, el comparador las estaría inventando —§sondas 4, la
 * cara del sobre-casado— y todos sus números serían plausibles y falsos.
 */
import { Evaluadas, QA } from "./lib.mjs";
import { corridaNegativa } from "./lib.mjs";
import { join } from "node:path";

const SONDA = join(QA, "barra-cmp.mjs");
const ANCHO = process.argv[2] || "1440";

const casos = [
  {
    etiqueta: "sin-original",
    exit: 2,
    porQue: "sin el lado del original no hay comparación: 0 piezas leídas en los dos lados",
    env: { SABOTAJE: "sin-original" },
    salidaTiene: /NO SE PUDO EVALUAR/,
  },
  {
    etiqueta: "lector-ciego",
    exit: 2,
    porQue: "sin contenedor no hay widgets ni botón — el contrato cae, no el recuento de diferencias",
    env: { SABOTAJE: "lector-ciego" },
    salidaTiene: /NO SE PUDO EVALUAR/,
  },
  {
    etiqueta: "dominio-encogido",
    exit: 2,
    porQue: "1 forma de 3 — y el mínimo NO baja con el dominio (§regla 17: el sabotaje no mueve la portería)",
    env: { SABOTAJE: "dominio-encogido" },
    salidaTiene: /NO SE PUDO EVALUAR/,
  },
  {
    etiqueta: "sin-diferencias",
    exit: 0,
    porQue: "los dos lados idénticos ⇒ 0 distintos. Es el que prueba que la comparación COMPARA",
    env: { SABOTAJE: "sin-diferencias" },
    salidaTiene: /0 distintos|distintos 0/,
    prohibidoEnSalida: /pares DISTINTOS de/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · barra-cmp @${ANCHO} ════════\n`);

const ev = new Evaluadas({ nombre: "barra-cmp-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* ── CONTROL ── exit 2 legítimo (hay diferencias), pero con su dominio entero
 * y con el eje mixto publicado. */
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA, ANCHO] });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const mUnidades = /evaluadas (\d+)\/(\d+) piezas/.exec(ctlOut);
const tieneMixto = /EJE MIXTO \(lo que NO lee como defecto\)/.test(ctlOut);
const dosEnvoltorios =
  /envoltorio=envoltorio-L1/.test(ctlOut) && /envoltorio=envoltorio-L2/.test(ctlOut);
let malCtl = null;
if (ctl.status === null || ctl.error) malCtl = `no llegó a correr: ${ctl.error || "timeout"}`;
else if (!mUnidades) malCtl = "no imprime su línea de unidades (`evaluadas N/M piezas`)";
else if (mUnidades[1] !== mUnidades[2]) malCtl = `dominio incompleto: ${mUnidades[1]}/${mUnidades[2]} piezas`;
else if (!tieneMixto) malCtl = "no publica el eje mixto solo";
else if (!dosEnvoltorios) malCtl = "no distingue los DOS envoltorios (L1 módulo Divi / L2 #sidebar)";
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL            ${malCtl}`);
  console.log(ctlOut.split("\n").slice(-30).join("\n"));
} else {
  console.log(
    `  ✓  CONTROL            ${mUnidades[1]}/${mUnidades[2]} piezas · eje mixto publicado · 2 envoltorios distinguidos`,
  );
}

for (const c of casos) {
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA, ANCHO], env: c.env });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  /* ⚠ Que caiga POR SU MOTIVO, no por un exit cualquiera. En la 88.ª un
   * negativo salía verde imprimiendo la frase contraria a la que probaba. */
  if (!mal && !c.salidaTiene.test(out)) mal = `no cayó por su motivo (${c.salidaTiene})`;
  if (!mal && c.prohibidoEnSalida && c.prohibidoEnSalida.test(out))
    mal = `imprimió lo que este caso PROHÍBE (${c.prohibidoEnSalida})`;
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(20)} ${mal}`);
    console.log(out.split("\n").slice(-25).join("\n"));
  } else console.log(`  ✓  ${c.etiqueta.padEnd(20)} ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} barra-cmp · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe decir «no pude» por tres caminos distintos, y sabe decir\n` +
        `   «limpio» cuando los dos lados coinciden. Su reparto está respaldado.\n`
      : `   Ningún número de \`qa:barra-cmp\` se cita hasta que esto salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
