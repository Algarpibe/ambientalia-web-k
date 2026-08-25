/**
 * TEST EN NEGATIVO de `f33-cmp`.
 * Uso: npm run qa:f33-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * **CORTE LIMPIO 3 de la 93.ª tanda pasa por aquí.** El encargo lo escribe así:
 * *«si el comparador no sale con su negativo cayendo por su motivo, la tanda
 * cierra sin emitir. Un comparador sin negativo probado no adjudica nada, y
 * este arquetipo no tiene NINGÚN eje comparado del que heredar.»*
 *
 * ── Por qué los tres casos corren SIN CLON ────────────────────────────────
 * Los tres usan `NEG_MISMO_LADO`, que copia el lado del original al del clon y
 * **no levanta el servidor**. No es un atajo: lo que estos casos preguntan
 * —*¿compara? ¿sabe gritar? ¿tiene las hojas?*— **no depende de que exista
 * emisión**, y poder contestarlo antes es lo que permite probar el instrumento
 * **antes** de emitir, que es el orden que CORTE LIMPIO 3 impone.
 *
 * ── El modo de fallo de ESTE comparador ───────────────────────────────────
 * Es un comparador, así que su conclusión barata es **«0 distintos»**: sale
 * igual de un clon fiel que de una sonda que no mira, de un ancla muerta o de
 * una captura sin estilo. Los tres casos atacan las tres:
 *
 * | caso | tiene que caer por | y NO por |
 * |---|---|---|
 * | `mismo-lado` (control) | dar **0 distintos con los dos lados idénticos** | inventar diferencias que no existen |
 * | `inyecta-delta` | cazar un Δ **conocido** y **NOMBRARLO** con sus dos lados | cambiar el exit sin decir qué se movió |
 * | `sin-hojas` | la guarda de HOJAS ⇒ corrida NULA | publicar 6 números plausibles y falsos |
 *
 * ⚠⚠ **`inyecta-delta` es el caso que §regla 21 (la vuelta) exige y que casi
 * nunca se escribe.** Cuando el objeto está en verde —y aquí no hay ni objeto—
 * la pregunta del negativo deja de ser *«¿sabe callar?»* y pasa a ser *«¿sabe
 * gritar?»*: se inyecta un Δ conocido y se exige que lo cace **y lo nombre**.
 * Un caso atado sólo al código de salida caducaría el día que hubiera clon.
 *
 * ⚠⚠ **Y `sin-hojas` ya se cobró un defecto de la propia sonda**, que es la
 * razón de que exista. La v1 de la guarda miraba
 * `document.styleSheets.length === 0` y **no podía dispararse**: estas páginas
 * traen **8 `<style>` EN LÍNEA**, así que con las 7 externas fuera el contador
 * valía 8 y el caso salía **verde**. §sondas 4 cometida dentro de la guarda que
 * venía a evitarla. Lo que discrimina es `enlazadas` contra `resueltas`.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "f33-cmp.mjs");
/* ⚠ Los negativos corren con `PILOTO=1` (6 páginas) desde la 104.ª: su trabajo
 * es probar el INSTRUMENTO, no la cobertura, y la sonda ya desvía su salida en
 * consecuencia. Por eso la base del nombre lleva `-piloto`: un negativo que
 * congelara sobre el nombre de las 31 sería §regla 7 —nombre de medida,
 * contenido de muestra— y encima con un sabotaje dentro. */
const CANONICA = "medidas/f33-cmp-1440-piloto.json";
const DELTA = "37.5";

const casos = [
  {
    etiqueta: "mismo-lado",
    porQue: "los dos lados IDÉNTICOS: tiene que dar 0 distintos, o el comparador inventa diferencias",
    env: { NEG_MISMO_LADO: "1", PILOTO: "1" },
    args: [SONDA],
    exit: 0,
    salidaTiene: /distintos 0/,
    comprueba: (j) => {
      const p = Object.values(j.paginas || {});
      if (p.length < 2) return `sólo ${p.length} página(s): un comparador de una página no separa nada`;
      for (const [r, v] of Object.entries(j.paginas)) {
        if (!v.clon) return `${r}: sin lado de clon — el control no llegó a comparar`;
        if (v.hojas.enlazadas !== v.hojas.resueltas)
          return `${r}: enlazadas ${v.hojas.enlazadas} ≠ resueltas ${v.hojas.resueltas} — el control mide SIN todas sus hojas`;
        if (!v.hojas.peticionesBloqueadas)
          return `${r}: 0 peticiones bloqueadas ⇒ la red NO estaba cortada: la medida «offline» le pegó al original`;
      }
      return null;
    },
  },
  {
    etiqueta: "inyecta-delta",
    porQue: `Δ CONOCIDO de ${DELTA} en docH: tiene que cazarlo Y NOMBRARLO con sus dos lados`,
    env: { NEG_MISMO_LADO: "1", NEG_INYECTA_DELTA: DELTA, PILOTO: "1" },
    args: [SONDA],
    exit: 3,
    /* No basta con que el exit cambie: se exige que el informe DIGA qué se movió
     * y con qué valores (§sondas 1 · un número de un par se cita con sus dos
     * lados). Un rojo mudo no adjudica nada. */
    salidaTiene: new RegExp(`docH\\s+orig\\s+[\\d.]+\\s+→ clon\\s+[\\d.]+\\s+Δ${DELTA}`),
    salidaNoTiene: /distintos 0/,
    comprueba: (j) => {
      const p = Object.entries(j.paginas || {});
      const mal = p.filter(([, v]) => !v.clon || Math.abs(v.clon.docH - v.original.docH - Number(DELTA)) > 0.01);
      if (mal.length) return `${mal.length} página(s) sin el Δ inyectado: ${mal.map(([r]) => r).join(" · ")}`;
      return null;
    },
  },
  {
    etiqueta: "sin-hojas",
    porQue: "captura SIN sus hojas: la guarda tiene que anular la corrida, no publicar números plausibles",
    env: { NEG_MISMO_LADO: "1", NEG_SIN_HOJAS: "1", PILOTO: "1" },
    args: [SONDA],
    exit: 2,
    salidaTiene: /CERO hojas aplicadas/,
    /* ⚠ Y la aserción que de verdad importa: que NO se declare limpio. Con los
     * dos lados iguales el recuento de distintos ES 0 —correctamente—, así que
     * lo único que separa este caso del control es la guarda. */
    salidaNoTiene: /✅ LA UNIÓN|✓ evaluadas .* · pares .* · distintos 0\n\s*$/,
    comprueba: (j) => {
      for (const [r, v] of Object.entries(j.paginas || {})) {
        if (v.hojas.resueltas !== 0) return `${r}: resueltas ${v.hojas.resueltas} ≠ 0 — el sabotaje no quitó las hojas`;
        if (!v.hojas.enlazadas) return `${r}: enlazadas 0 ⇒ el sabotaje MUEVE LA PORTERÍA (§regla 17): sin enlazadas la guarda no puede disparar`;
        /* El número que justifica que la guarda exista: sin hojas la geometría
         * se mueve de verdad. Si NO se moviera, la guarda sería ceremonia. */
      }
      return null;
    },
  },
  /* ══════════════════════════════════════════════════════════════════════════
   * 106.ª · LOS DOS CANALES QUE FALTABAN
   *
   * Los dos sabotajes reproducen **el estado real de antes de la 106.ª** —el
   * canal abierto en el lado del original y cerrado en el del clon— en vez de
   * tocar el umbral de una condición (§regla 28: *el sabotaje va en el DATO*).
   *
   * ⚠ Y `sin-fuentes` es **el que enseña**, porque es el que NO se nota: sin
   * Manrope la página **sigue midiendo** y `docH` sólo se mueve −1. Si su
   * aserción fuera un total, el caso pasaría con el canal abierto.
   * ════════════════════════════════════════════════════════════════════════ */
  {
    etiqueta: "sin-media",
    porQue: "las imágenes del original sin resolver a copia local: la guarda anula la corrida en vez de medir 65 de 71 a 16 px",
    env: { NEG_MISMO_LADO: "1", NEG_SIN_MEDIA: "1", PILOTO: "1" },
    args: [SONDA],
    exit: 2,
    salidaTiene: /⛔ MEDIA ·/,
    comprueba: (j) => {
      for (const [r, v] of Object.entries(j.paginas || {})) {
        if (!v.media) return `${r}: la congelada no publica el canal \`media\` — sin cardinal la limitación es una nota al pie (§regla 14)`;
        if (v.media.resueltas !== 0) return `${r}: resueltas ${v.media.resueltas} ≠ 0 — el sabotaje no cerró el canal`;
        if (!v.media.img) return `${r}: img 0 ⇒ el sabotaje MUEVE LA PORTERÍA (§regla 17): sin imágenes la guarda no puede disparar`;
      }
      return null;
    },
  },
  {
    etiqueta: "sin-fuentes",
    porQue: "la tipografía del original sin inyectar: la guarda tiene que verlo AUNQUE docH sólo se mueva −1",
    env: { NEG_MISMO_LADO: "1", NEG_SIN_FUENTES: "1", PILOTO: "1" },
    args: [SONDA],
    exit: 2,
    salidaTiene: /⛔ FUENTE ·/,
    comprueba: (j) => {
      for (const [r, v] of Object.entries(j.paginas || {})) {
        if (v.fuentesInyectadas !== 0) return `${r}: fuentesInyectadas ${v.fuentesInyectadas} ≠ 0 — el sabotaje no cerró el canal`;
        if (v.fuenteCargada) return `${r}: Manrope CARGADA con el sabotaje puesto — el canal entra por otro sitio y el control no lo mide`;
      }
      return null;
    },
  },
];

const ev = new Evaluadas({ nombre: "f33-cmp-neg", unidad: "casos", minimo: casos.length });
let fallos = 0;

console.log("═══ NEGATIVO de f33-cmp — CORTE LIMPIO 3\n");
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: c.args, env: c.env });
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
    `   producir sin haber comparado: la tumban el Δ inyectado y la guarda de hojas.`,
);
console.log(`\n⚠ LO QUE ESTE NEGATIVO **NO** PRUEBA:`);
console.log(`  · no prueba que el clon esté bien — no hay clon en estos ${casos.length} casos.`);
console.log(`    Prueba que el INSTRUMENTO discrimina, que es otra afirmación;`);
console.log(`  · los ${casos.length} corren a 1440. El contrato de fidelidad es a los DOS anchos;`);
console.log(`  · ⚠⚠ y la que YA SE COBRÓ UN DEFECTO, con su cardinal (101.ª, PASO 0):`);
console.log(`    los ${casos.length} usan NEG_MISMO_LADO, que COPIA el lado del original`);
console.log(`    sobre el del clon. Así que los selectores del LADO DEL CLON`);
console.log(`      [class*='et_pb_module'], [data-modulo]   ·   .et_pb_section, [data-seccion]`);
console.log(`    nunca se aplican a marcado del clon: **0 instancias separadoras**.`);
console.log(`    Con ese hueco, \`CuerpoPagina.tsx\` emitía \`f33-modulo\`/\`f33-seccion\``);
console.log(`    —que no casan ninguno— y este negativo salía 3/3 mientras el`);
console.log(`    comparador habría publicado nModulos 313 → 10 y nSecciones 86 → 0`);
console.log(`    CON EL RENDER CORRECTO. Es §regla 15 con lo compartido puesto en el`);
console.log(`    MARCADO, y §regla 24 encontrando su límite: probar el instrumento`);
console.log(`    antes de que exista el objeto no puede contestar esta pregunta.`);
console.log(`    ⇒ FALTA un 4.º caso, y sólo se puede escribir CON clon emitido:`);
console.log(`      «los selectores del lado del clon casan contra marcado del clon».`);
console.log(`      Ficha: PENDIENTES-QA.md §F3-3-COMPARADOR-CIEGO.`);
console.log(`  ✓ evaluadas ${casos.length}/${casos.length} casos`);
ev.informe();
process.exit(fallos === 0 ? 0 : 1);
