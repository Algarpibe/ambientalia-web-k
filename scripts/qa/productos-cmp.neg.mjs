/**
 * TEST EN NEGATIVO de `productos-cmp`.
 * Uso: npm run qa:productos-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §regla 24 — **EL NEGATIVO DE UN COMPARADOR SE CORRE ANTES DE QUE EXISTA EL
 * LADO QUE VA A MEDIR.** Casi todas las preguntas de un negativo de comparador
 * —*¿compara o inventa? ¿sabe gritar? ¿tiene sus insumos?*— **no dependen del
 * lado que todavía no está acreditado**: se contestan copiando un lado sobre el
 * otro. Y la ganancia no es de calendario, es de ATRIBUCIÓN: cuando la corrida
 * de verdad exista, un rojo sólo puede ser suyo, porque el instrumento ya está
 * adjudicado.
 *
 * ── El modo de fallo de ESTE comparador ───────────────────────────────────
 * Es un comparador, así que su conclusión barata es **«0 distintos»**: sale
 * igual de un clon fiel que de una sonda que no mira, de un selector muerto o
 * de una captura sin estilo. Los tres casos atacan las tres, **con tres códigos
 * de salida distintos** para que un rojo futuro se pueda atribuir:
 *
 * | caso | tiene que caer por | y NO por |
 * |---|---|---|
 * | `mismo-lado` (control) | dar **0 distintos con los dos lados idénticos** | inventar diferencias |
 * | `inyecta-delta` | cazar un Δ **conocido** y **NOMBRARLO** con sus dos lados | cambiar el exit sin decir qué se movió |
 * | `sin-insumos` | los documentos ausentes ⇒ **corrida NULA** | publicar números plausibles de la nada |
 *
 * ⚠⚠ **`inyecta-delta` es el caso que §regla 21 (la vuelta) exige y que casi
 * nunca se escribe.** Sin objeto no hay defecto que ocultar, así que la pregunta
 * no es *«¿sabe callar?»* sino **«¿sabe gritar?»** — y un caso atado sólo al
 * código de salida caducaría el día que el objeto se ponga en verde.
 *
 * ⚠ **Los sabotajes van en el DATO, no en un umbral** (§regla 28): `sin-insumos`
 * hace que los documentos no existan —el modo de fallo real— en vez de bajar una
 * condición; y `inyecta-delta` mueve una ALTURA medida, no el criterio de
 * comparación.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "productos-cmp.mjs");
const CANONICA = "medidas/productos-cmp-1440.json";
const DELTA = "37.5";

const casos = [
  {
    etiqueta: "mismo-lado",
    porQue: "los dos lados IDÉNTICOS: tiene que dar 0 distintos, o el comparador inventa diferencias",
    env: { NEG_MISMO_LADO: "1" },
    exit: 2, /* 2 y no 0: los canales del lote siguen abiertos (51 hojas et-cache) */
    salidaTiene: /distintos: 0/,
    comprueba: (j) => {
      if (j.resumen.pares < 2) return `sólo ${j.resumen.pares} par(es): un comparador de un par no separa nada`;
      if (j.resumen.distintos !== 0) return `distintos ${j.resumen.distintos} ≠ 0 — con los dos lados iguales, inventa diferencias`;
      if (!j.resumen.ejesComparados) return `0 ejes comparados: el control no llegó a comparar NADA (§4bis, «0 comparado = verde»)`;
      if (j.resumen.huerfanasO || j.resumen.huerfanasC)
        return `huérfanas O=${j.resumen.huerfanasO} C=${j.resumen.huerfanasC} con los dos lados iguales — el emparejamiento pierde filas`;
      if (!j.meta.lado) return `la congelada no declara \`meta.lado\`: no se puede saber qué lados midió`;
      return null;
    },
  },
  {
    etiqueta: "inyecta-delta",
    porQue: `Δ CONOCIDO de ${DELTA} en el alto de una fila: tiene que cazarlo Y NOMBRARLO con sus dos lados`,
    env: { NEG_MISMO_LADO: "1", NEG_DELTA: DELTA },
    exit: 2, /* el canal abierto manda sobre el 4: se comprueba el Δ en el dato */
    /* No basta con que el exit cambie: se exige que el informe DIGA qué se movió
     * y con qué valores (§sondas 1 · un número de un par se cita con sus dos
     * lados). Un rojo mudo no adjudica nada. */
    salidaTiene: new RegExp(`h\\s+orig\\s+[\\d.]+\\s+→ clon\\s+[\\d.]+\\s+Δ\\+${DELTA}`),
    salidaNoTiene: /distintos: 0/,
    comprueba: (j) => {
      if (!j.resumen.distintos) return `distintos 0 con un Δ de ${DELTA} inyectado: NO SABE GRITAR`;
      const conDelta = j.informe.filter((i) => i.difs.some((d) => d.eje === "h" && Math.abs(d.delta - Number(DELTA)) < 0.01));
      if (conDelta.length !== j.informe.length)
        return `${j.informe.length - conDelta.length} de ${j.informe.length} rutas sin el Δ cazado en \`h\``;
      const sinLados = j.informe.flatMap((i) => i.difs).filter((d) => d.orig === undefined || d.clon === undefined);
      if (sinLados.length) return `${sinLados.length} diferencias publicadas SIN sus dos lados (§sondas 1)`;
      return null;
    },
  },
  {
    etiqueta: "sin-insumos",
    porQue: "los documentos del corpus ausentes: corrida NULA, no números plausibles de la nada",
    env: { NEG_MISMO_LADO: "1", NEG_SIN_INSUMOS: "1" },
    exit: 3,
    salidaTiene: /CORRIDA NULA/,
    /* ⚠ La aserción que de verdad importa: que NO se declare limpio. Con 0
     * documentos el recuento de distintos también sería 0 —correctamente—, así
     * que lo único que separa este caso del control es la guarda. */
    salidaNoTiene: /EXIT 0 — sin diferencias/,
    /* Sin insumos no hay congelada: comprobar el fichero sería exigirle que
     * escriba justo lo que su guarda impide. La aserción es la salida. */
  },
];

const ev = new Evaluadas({ nombre: "productos-cmp-neg", unidad: "casos", minimo: casos.length });
let fallos = 0;

console.log("═══ NEGATIVO de productos-cmp — 123.ª · ESCALÓN 1 (§regla 24)\n");
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const problemas = [];

  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperado ${c.exit})`);
  if (c.salidaTiene && !c.salidaTiene.test(salida)) problemas.push(`la salida no casa ${c.salidaTiene}`);
  if (c.salidaNoTiene && c.salidaNoTiene.test(salida))
    problemas.push(`la salida SÍ trae ${c.salidaNoTiene} — la conclusión barata se coló`);

  if (c.comprueba) {
    const ruta = join(QA, nombreNeg(CANONICA, c.etiqueta));
    if (!existsSync(ruta)) problemas.push(`no congeló ${nombreNeg(CANONICA, c.etiqueta)}`);
    else {
      const m = c.comprueba(JSON.parse(readFileSync(ruta, "utf8")));
      if (m) problemas.push(m);
    }
  }

  if (problemas.length) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(14)} ${c.porQue}`);
    problemas.forEach((p) => console.log(`       ${p}`));
  } else {
    console.log(`  ✅ ${c.etiqueta.padEnd(14)} ${c.porQue}`);
  }
  ev.ok();
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} ${casos.length - fallos}/${casos.length} — la conclusión BARATA («0 distintos») no se puede\n` +
    `   producir sin haber comparado: la tumban el Δ inyectado y la guarda de insumos.`,
);
console.log(`\n⚠ LO QUE ESTE NEGATIVO **NO** PRUEBA, con su cardinal (§regla 14):`);
console.log(`  · no prueba que el clon esté bien — no hay lado de clon en estos ${casos.length} casos.`);
console.log(`    Prueba que el INSTRUMENTO discrimina, que es otra afirmación;`);
console.log(`  · los ${casos.length} corren a 1440. El contrato de fidelidad es a los DOS anchos;`);
console.log(`  · ⚠⚠ y el límite que §regla 24 tiene y hay que decir: los ${casos.length} usan`);
console.log(`    NEG_MISMO_LADO, que COPIA el lado del original sobre el del clon.`);
console.log(`    Así que el selector del LADO DEL CLON —\`[data-fila]\`— NO se aplica`);
console.log(`    nunca a marcado del clon: **0 instancias separadoras** para él.`);
console.log(`    Si \`data-fila\` no casara en las 4 rutas, este negativo saldría 3/3`);
console.log(`    mientras el comparador publicaría «filas clon = 0» con el render`);
console.log(`    correcto. Es §regla 15 con lo compartido puesto en el MARCADO.`);
console.log(`    ⇒ FALTA un 4.º caso, y sólo se puede escribir CON el clon servido:`);
console.log(`      «\`[data-fila]\` casa >0 en las 4 rutas del lote».`);
console.log(`  · y las 51 hojas \`et-cache\` sin capturar hacen que la corrida MIDA`);
console.log(`    pero NO ACREDITE: por eso dos de los tres casos esperan exit 2.`);
console.log(`  ✓ evaluadas ${casos.length}/${casos.length} casos`);
ev.informe();
process.exit(fallos === 0 ? 0 : 1);
