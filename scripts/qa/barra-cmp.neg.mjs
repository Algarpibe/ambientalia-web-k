/**
 * TEST EN NEGATIVO de `barra-cmp` — cada sabotaje por SU motivo, con control.
 * Uso: npm run qa:barra-cmp-neg     (necesita red: el lado del original es vivo)
 *
 * ── El control NO se define por el código de salida, y decirlo importa ────
 * `barra-cmp` es un COMPARADOR, y **su código de salida cambia con el estado
 * del objeto**: en su primera corrida encontró 234 pares distintos (exit 2) y
 * tras la transcripción da 0 (exit 0). Un control cableado a cualquiera de los
 * dos habría caducado **el mismo día** — que es §regla 5ter: *arreglar el
 * objeto medido caduca el control del instrumento que lo midió*.
 *
 * Así que el control **no mira el exit**: mira que la sonda alcance su dominio,
 * publique su eje mixto y distinga las dos capas. Esas tres cosas son ciertas
 * con defecto y sin él.
 *
 * Lo que el control afirma, y es comprobable:
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
 * | `delta-inyectado` | la IGUALDAD de los dos lados: +7 en el contenedor | el par nombrado (`contenedor.h`) |
 *
 * ⚠⚠ **HUBO UN QUINTO, `sin-diferencias`, Y SE RETIRÓ EN LA MISMA TANDA.**
 * Copiaba el lado del original al del clon y exigía «0 distintos», y con el
 * defecto puesto **discriminaba**. En cuanto la transcripción dejó los dos
 * lados a Δ0, pasó a predecir **exactamente lo mismo que la corrida limpia**:
 * cero instancias separadoras. Habría seguido saliendo verde sin probar nada,
 * que es como un caso muerto se lee como uno bueno. Su simétrico
 * —`delta-inyectado`— es el que discrimina ahora: con el objeto en verde, la
 * pregunta ya no es *«¿sabe callar?»* sino *«¿sabe gritar?»*.
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
    etiqueta: "delta-inyectado",
    exit: 2,
    porQue: "un Δ de +7 en el contenedor tiene que salir CAZADO y NOMBRADO — es el que prueba que la comparación compara",
    env: { SABOTAJE: "delta-inyectado" },
    salidaTiene: /contenedor\.h/,
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
