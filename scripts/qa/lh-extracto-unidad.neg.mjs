/**
 * TEST EN NEGATIVO de `lh-extracto-unidad`.
 * Uso: npm run qa:lh-extracto-unidad-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda **elige entre modelos**, así que su negativo tiene que probar las
 * dos formas de elegir mal, no sólo la de no medir:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-corpus` | **NO SE PUDO EVALUAR** (0 < mínimo) | «los 4 modelos empatan a 0/0», que es el verde de un instrumento vacío |
 * | `un-solo-modelo` | **0 SEPARADORAS ⇒ SIN PROBAR** | verde: un modelo solo acierta 23/23 y no ha elegido nada |
 * | `plano-con-espacio` | **NINGÚN modelo con pleno** | verde con el ganador de siempre |
 *
 * `un-solo-modelo` es el que da nombre a la sonda: §*un modelo se elige por lo
 * que lo SEPARA de su alternativa, no por lo que acierta*. Sin él, la sonda
 * podría publicar `23/23` de un modelo que nadie ha puesto a prueba y eso se
 * leería exactamente igual que la medición buena.
 *
 * `plano-con-espacio` es el defecto de INSTRUMENTO que esta sonda estuvo a
 * punto de tener: `strip_tags` de PHP no deja espacio donde estaba la etiqueta,
 * y una regex `→ " "` convierte `H<sub>2</sub>S` en «H 2 S». Con él, el extracto
 * deja de ser prefijo del cuerpo y el pleno se cae. Es el mismo corte en `<sub>`
 * que ya se pagó en la 76.ª al nombrar el sobrante de la serie.
 *
 * ── EL CONTROL (§sondas, regla 8a) ────────────────────────────────────────
 * Sin sabotaje: verde, con UN ganador y `separadorasDelGanador > 0`. Si el
 * control no separase nada, los rojos de abajo no probarían nada — podrían
 * venir de un corpus que no se lee.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-extracto-unidad.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: UN ganador, pleno, y elegido con separadoras > 0",
    env: {},
    exit: 0,
    congela: true,
    comprueba: (j) => {
      if (j.veredicto.ganadores.length !== 1) return `el control no deja UN ganador (${j.veredicto.ganadores.length}): los rojos de abajo no probarían nada`;
      if (!j.veredicto.separadorasDelGanador) return "0 separadoras en el CONTROL: el sabotaje `un-solo-modelo` no probaría nada";
      if (j.poblacion.conCuerpo !== j.poblacion.tarjetas) return `${j.poblacion.tarjetas - j.poblacion.conCuerpo} tarjetas sin cuerpo: el canal independiente no está entero`;
      if (j.poblacion.esPrefijoDelCuerpo !== `${j.poblacion.conCuerpo}/${j.poblacion.conCuerpo}`)
        return `el extracto no es prefijo del cuerpo en las ${j.poblacion.conCuerpo}: ${j.poblacion.esPrefijoDelCuerpo}`;
      /* El modelo de CARACTERES tiene que quedar refutado, no empatado: si
       * empatara, la 77.ª tenía razón en no elegir y esta sonda no aporta. */
      if (j.barrido["chars-crudo"].aciertos === j.poblacion.conCuerpo) return "el modelo de CARACTERES también da pleno: es empate, no elección";
      /* §regla 14: la limitación se declara CON SU NÚMERO, no como nota al pie */
      if (!j.meta.noMide.some((s) => /0 de \d+/.test(s))) return "`noMide` no declara su cardinal (§regla 14)";
      return null;
    },
  },
  {
    etiqueta: "sin-corpus",
    porQue: "sin las 3 páginas de término no hay tarjetas: cae por el MÍNIMO, no por «4 modelos a 0/0»",
    env: { SABOTAJE: "sin-corpus" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NO SE PUDO EVALUAR/,
    /* Y NO por el otro motivo: con 0 filas los cuatro modelos «empatan» a 0/0,
     * y ese veredicto tiene el código de salida bueno con el motivo falso. */
    prohibidoEnSalida: /EMPATE real/,
  },
  {
    etiqueta: "un-solo-modelo",
    porQue: "un modelo sin rival acierta 23/23 y NO ha elegido: 0 separadoras ⇒ SIN PROBAR",
    env: { SABOTAJE: "un-solo-modelo" },
    exit: 2,
    congela: false,
    esperaEnSalida: /SIN PROBAR/,
  },
  {
    etiqueta: "plano-con-espacio",
    porQue: "el `<sub>` de H2S: con la regex que mete espacio, el extracto deja de ser prefijo y NINGÚN modelo da pleno",
    env: { SABOTAJE: "plano-con-espacio" },
    exit: 2,
    congela: false,
    esperaEnSalida: /NINGÚN modelo reproduce/,
  },
];

const ev = new Evaluadas({ sonda: "lh-extracto-unidad.neg", unidad: "casos", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: ["scripts/qa/lh-extracto-unidad.mjs"], env: c.env });
  const salida = `${r.stdout || ""}${r.stderr || ""}`;
  const problemas = [];
  if (r.status !== c.exit) problemas.push(`exit ${r.status} (esperaba ${c.exit})`);
  if (c.esperaEnSalida && !c.esperaEnSalida.test(salida)) problemas.push(`la salida no dice ${c.esperaEnSalida}`);
  /* §regla 1: no basta con que caiga — tiene que caer por SU motivo. Un código
   * de salida correcto con el motivo equivocado es un rojo que engaña igual. */
  if (c.prohibidoEnSalida && c.prohibidoEnSalida.test(salida)) problemas.push(`cae por el motivo EQUIVOCADO: la salida dice ${c.prohibidoEnSalida}`);
  if (c.comprueba) {
    const f = join(QA, CANONICA);
    if (!existsSync(f)) problemas.push(`no congeló ${CANONICA}`);
    else {
      const malo = c.comprueba(JSON.parse(readFileSync(f, "utf8")));
      if (malo) problemas.push(malo);
    }
  }
  /* §regla 7: un artefacto de negativo NO puede parecer una medida */
  if (!c.congela) {
    const n = nombreNeg(CANONICA, c.etiqueta);
    if (existsSync(join(QA, n))) console.log(`     · artefacto marcado: ${n}`);
  }
  ev.ok(1);
  if (problemas.length) { fallos++; console.log(`  ✗ ${c.etiqueta} — ${problemas.join(" · ")}`); }
  else console.log(`  ✓ ${c.etiqueta} — ${c.porQue}`);
}

console.log(
  fallos
    ? `\n⛔ ${fallos}/${casos.length} casos del negativo NO se comportan como su tabla promete.`
    : `\n✅ ${casos.length}/${casos.length} — la sonda sabe FALLAR: sin corpus no evalúa, sin rival no elige,\n        y un plano que mete espacios donde PHP no los mete tumba el pleno en vez de convivir con él.`,
);
console.log(`  ✓ evaluadas ${ev.n}/${ev.minimo} casos · lh-extracto-unidad.neg`);
process.exit(fallos ? 2 : 0);
