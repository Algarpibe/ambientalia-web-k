/**
 * TEST EN NEGATIVO de `lh-pieles-css`.
 * Uso: npm run qa:lh-pieles-css-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Esta sonda produce **exhibiciones y ausencias**, y las dos se pueden fabricar
 * sin dar error. Los dos sabotajes atacan justo eso:
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-hojas` | **canal INCOMPLETO** en las 13 → exit 2 | «no hay override móvil», que es como se leería su ausencia |
 * | `lector-ciego` | **CONTROL MUDO** — el parser no lee nada | 0 reglas de titular, que es un número plausible |
 * | (control) | ✅ 13 páginas · canal completo · reglas exhibidas | — |
 *
 * **`sin-hojas` es el que reproduce el estado anterior a esta tanda**, y por eso
 * importa: con el canal a cero, `L3`/`L5` *seguían saliendo* «sin override
 * móvil» — la conclusión correcta **por la razón equivocada**. La sonda tiene
 * que distinguir *«miré las 11 hojas y no hay»* de *«no miré ninguna»*, que es
 * exactamente §sondas 4 y lo que costó el escalón de F3-1.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-pieles-css.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: las 13 páginas con su canal COMPLETO y las reglas de titular exhibidas",
    env: {},
    exit: 0,
    salidaTiene: /páginas con su canal COMPLETO/,
    comprueba: (j) => {
      if (j.resumen.paginas < 13) return `sólo ${j.resumen.paginas} páginas: el universo no se derivó entero`;
      if (j.resumen.sinCanalCompleto !== 0) return `${j.resumen.sinCanalCompleto} páginas con hojas sin capturar`;
      if (!Object.values(j.resumen.control).every((v) => v > 0)) return "control mudo en la corrida buena";
      /* Lo que esta tanda vino a exhibir: la regla POR MÓDULO de L1, con su @media. */
      const l1 = j.porForma["L1-blog"] ?? [];
      const base = l1.find((p) => /et_pb_text_\d+_tb_body h1/.test(p.selector) && /font-size:\s*50px/.test(p.declaraciones));
      if (!base) return "no aparece la regla base de L1 (.et_pb_text_N_tb_body h1 · 50px) — era el objetivo del paso";
      const movil = l1.find((p) => p.media !== "base" && /et_pb_text_\d+_tb_body/.test(p.selector) && /font-size:\s*35px/.test(p.declaraciones));
      if (!movil) return "no aparece el override MÓVIL de L1 (35px): el parser perdió la pila de @media";
      /* Y la ausencia que también es dato: L3/L5 sin regla de módulo para el titular. */
      const l3 = j.porForma["L3-sci"] ?? [];
      if (l3.some((p) => /et_pb_text_\d+(_tb_body)? h1/.test(p.selector)))
        return "L3 trae regla de módulo para el titular: contradice la spec y hay que arbitrarlo, no pasarlo";
      return null;
    },
  },
  {
    etiqueta: "sin-hojas",
    porQue: "el canal a CERO (el estado anterior a esta tanda) ⇒ INCOMPLETO y exit 2, no «no hay override»",
    env: { SABOTAJE: "sin-hojas" },
    exit: 2,
    salidaTiene: /hojas SIN CAPTURAR/,
    comprueba: (j) => {
      if (j.resumen.sinCanalCompleto !== j.resumen.paginas) return "no marcó todas las páginas como canal incompleto";
      /* La prueba de que el cero de antes era ciego: sin hojas, L1 pierde su regla. */
      const l1 = (j.porForma["L1-blog"] ?? []).find((p) => /font-size:\s*50px/.test(p.declaraciones));
      if (l1) return "con el canal cegado seguía viendo la regla de L1: entonces no venía de las hojas";
      return null;
    },
  },
  {
    etiqueta: "lector-ciego",
    porQue: "el parser no lee nada ⇒ CONTROL MUDO, no «0 reglas de titular»",
    env: { SABOTAJE: "lector-ciego" },
    exit: 2,
    salidaTiene: /CONTROL MUDO/,
    comprueba: (j) => (Object.values(j.resumen.control).some((v) => v) ? "el control no quedó mudo" : null),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-pieles-css ════════`);
console.log(`  alcance: corpus congelado + corpus/css · SIN red\n`);

const ev = new Evaluadas({ nombre: "lh-pieles-css-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-pieles-css.mjs")], env: c.env, timeout: 300_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-pieles-css · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La exhibición se puede citar: con el canal cegado la regla DESAPARECE, así que\n` +
        `   viene de las hojas y no de otro sitio.\n`
      : `   No se puede citar la exhibición hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
