/**
 * TEST EN NEGATIVO de `pie-legal`.
 * Uso: npm run qa:pie-legal-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * `pie-legal` afirma TRES cosas, y cada una tiene su sabotaje. Un negativo que
 * sólo probara una dejaría las otras dos sin ejercitar y saldría igual de
 * verde (§regla 17-2.ª cara: *si el arreglo tiene dos mitades, el sabotaje
 * tiene que anular LAS DOS*).
 *
 * | caso | qué anula | CAE POR |
 * |---|---|---|
 * | (control) | nada | 6/6 · una sola firma · 1:1 en 145. exit 0 |
 * | `mb-cero` | el modelo `col1.h = altoIcono + mbHermanos` | **el recuento del modelo**, no el control de sección |
 * | `glifo-torcido` | que los 5 glifos sean los mismos iconos | **las firmas de razón** |
 * | `corpus-mudo` | el DENOMINADOR del cruce | **el dominio**, no el `esUnoAUno` |
 *
 * ⚠ **`corpus-mudo` es el que más protege, y por la razón menos obvia.**
 * Apuntando el cruce a un solo subárbol, `esUnoAUno` sigue saliendo **`true`**
 * —una sola piel, un solo contexto: técnicamente 1:1— y el veredicto se leería
 * como *«el discriminador está probado»* sobre **12 páginas en vez de 145**. O
 * sea que la guarda que hace falta no es sobre el 1:1: es sobre **su
 * denominador**. Es §regla 14 —*una limitación sin cardinal se archiva*— con
 * el cardinal metido dentro del código de salida.
 *
 * Y el mínimo se deriva del corpus ENTERO, no del subárbol que el sabotaje
 * mira: si compartieran variable, `corpus-mudo` movería la portería y el caso
 * no probaría nada (§regla 17).
 * ══════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/pie-legal.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: 6/6 en el modelo, una sola firma de razones y el cruce sobre las 149 capturas",
    env: {},
    exit: 0,
    salidaTiene: /1:1 en \d+ páginas: SÍ/,
    prohibidoEnSalida: /⛔/,
    comprueba: (j) => {
      if (j.modeloColumna.aciertos !== j.modeloColumna.total) return `el modelo no cierra: ${j.modeloColumna.aciertos}/${j.modeloColumna.total}`;
      if (j.controlRazones.firmasDistintas !== 1) return `firmas de razón: ${j.controlRazones.firmasDistintas}`;
      if (!j.cruceContextoDeCache.veredicto.esUnoAUno) return "el cruce no da 1:1";
      /* El control tiene que EJERCITAR el dominio grande: si aquí ya sólo hubiera
       * 12 páginas, `corpus-mudo` no probaría nada (§sondas 8a). */
      if (j.cruceContextoDeCache.veredicto.n < 100) return `el control cruza sólo ${j.cruceContextoDeCache.veredicto.n} páginas: no ejercita el dominio`;
      /* Y la afirmación central, con su número: entre B y C, UNA causa de +67. */
      if (j.reparto["@1440"]["B-C"].col1 !== 67 || j.reparto["@390"]["B-C"].col1 !== 67)
        return `B−C en col1 no vale 67 a los dos anchos: ${j.reparto["@1440"]["B-C"].col1} · ${j.reparto["@390"]["B-C"].col1}`;
      return null;
    },
  },
  {
    etiqueta: "mb-cero",
    porQue: "el `mb` de los hermanos a 0: el modelo predice sólo el alto del icono y deja de cuadrar",
    env: { SABOTAJE: "mb-cero" },
    exit: 2,
    salidaTiene: /el modelo de la columna falla en \d+ de \d+ casos/,
    /* ⚠ Y NO puede caer por el control de sección: si cayera por ahí, el
     * sabotaje habría anulado los `padding` en vez del `mb`. */
    prohibidoEnSalida: /firma de razones|el cruce sólo clasificó/,
    comprueba: (j) => (j.modeloColumna.aciertos === j.modeloColumna.total ? "el modelo sigue cerrando: el sabotaje no mordió" : null),
  },
  {
    etiqueta: "glifo-torcido",
    porQue: "un ancho de glifo movido: las razones dejan de tener una firma única y dividir pierde justificación",
    env: { SABOTAJE: "glifo-torcido" },
    exit: 2,
    salidaTiene: /NO tienen la misma firma de razones/,
    prohibidoEnSalida: /el cruce sólo clasificó/,
    comprueba: (j) => (j.controlRazones.firmasDistintas === 1 ? "sigue habiendo una sola firma: el sabotaje no mordió" : null),
  },
  {
    etiqueta: "corpus-mudo",
    porQue: "el cruce mirando un solo subárbol: `esUnoAUno` SIGUE saliendo true y el denominador se desploma",
    env: { SABOTAJE: "corpus-mudo" },
    exit: 2,
    salidaTiene: /el cruce sólo clasificó \d+ páginas de las \d+ capturadas/,
    comprueba: (j) => {
      const v = j.cruceContextoDeCache.veredicto;
      /* La mitad que enseña: el 1:1 NO se rompe. Si se rompiera, el caso estaría
       * cayendo por otra cosa y la guarda del denominador seguiría sin probarse. */
      if (!v.esUnoAUno) return "el 1:1 se rompió: entonces la guarda que cerró el código no fue la del denominador";
      if (v.n >= 100) return `el denominador no bajó (${v.n}): el sabotaje no mordió`;
      return null;
    },
  },
];

const ev = new Evaluadas({ unidad: "casos del negativo", minimo: casos.length, nombre: "pie-legal.neg" });

console.log(`\n════════ NEGATIVO DE pie-legal · ${casos.length} casos ════════\n`);
let fallos = 0;
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "pie-legal.mjs")], env: c.env, cwd: join(QA, "..", "..") });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const destino = join(QA, nombreNeg(CANONICA, c.etiqueta));
  const problemas = [];

  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperado ${c.exit})`);
  if (c.salidaTiene && !c.salidaTiene.test(salida)) problemas.push(`no cae POR SU MOTIVO: la salida no casa ${c.salidaTiene}`);
  if (c.prohibidoEnSalida && c.prohibidoEnSalida.test(salida)) problemas.push(`cae por OTRO motivo: la salida casa ${c.prohibidoEnSalida}`);
  if (!existsSync(destino)) problemas.push(`no congeló ${destino}`);
  else {
    const j = JSON.parse(readFileSync(destino, "utf8"));
    const m = c.comprueba(j);
    if (m) problemas.push(m);
  }

  if (problemas.length) fallos++;
  console.log(`  ${problemas.length ? "❌" : "✓"} ${c.etiqueta.padEnd(16)} exit ${String(r.status).padStart(2)}   ${c.porQue}`);
  for (const p of problemas) console.log(`       ⛔ ${p}`);
  ev.ok();
}

console.log(
  fallos
    ? `\n❌ ${fallos} de ${casos.length} casos del negativo fallaron.\n`
    : `\n✅ ${casos.length}/${casos.length} — cada caso cae POR SU MOTIVO, y \`corpus-mudo\` lo hace\n` +
        `   con \`esUnoAUno\` todavía en true: la guarda que cierra es la del DENOMINADOR.\n`,
);
process.exit(fallos ? 1 : 0);
