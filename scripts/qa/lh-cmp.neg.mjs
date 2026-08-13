/**
 * TEST EN NEGATIVO de `lh-cmp`.
 * Uso: npm run qa:lh-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **ESTE NEGATIVO CORRE CONTRA UN COMPARADOR QUE HOY SALE ROJO A PROPÓSITO**,
 * porque el clon todavía no emite las rutas de listado. Eso cambia lo que hay
 * que probar, y conviene decirlo antes de leer la tabla:
 *
 *   · **no** se puede probar «sabe dar Δ0», porque no hay Δ0 que dar;
 *   · **sí** se puede probar —y es lo que importa— que **el rojo es del clon y
 *     no del instrumento**, que es exactamente la duda que un comparador nuevo
 *     tiene que despejar antes de que nadie se crea su primer verde.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | (control) | **AUSENTE en las 9**: el estado inicial declarado, con exit 2 | un fallo de lectura del espejo |
 * | `sin-espejo` | **TIRA** sin el lado original | «0 pares distintos», que es como se lee un cero |
 * | `clon-ciego` | mide una ruta que no existe ⇒ **AUSENTE**, nunca Δ0 | — |
 * | `base-distinta` | **P-LH-C8**: bases que no casan se NOMBRAN y no se normaliza contra ellas | — |
 *
 * **`sin-espejo` es el que más protege**: sin lado original, un comparador
 * ingenuo compara el clon consigo mismo y saca **0 diferencias** — el verde más
 * caro que este proyecto sabe producir (§sondas 4bis, quinta instancia).
 *
 * ⚠ **Y `base-distinta` sólo puede evaluarse cuando el clon sirva alguna
 * forma.** Mientras las 9 estén AUSENTES, el caso se declara **NO EJERCITADO**
 * en vez de darse por pasado: un sabotaje que no cambia el resultado no ha
 * probado la guarda, ha probado que el instrumento no la ejercita (§sondas 8a).
 * Se comprueba explícitamente y se dice.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/lh-cmp-1440.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "sin sabotaje: el clon no emite listados ⇒ 9 AUSENTES y exit 2 (el estado inicial DECLARADO)",
    env: {},
    exit: 2,
    salidaTiene: /AUSENTES en el clon/,
    comprueba: (j) => {
      if (!j.resumen) return "sin resumen: la sonda no llegó a congelar su recuento";
      if (!j.resumen.formas) return "0 formas: el universo no se derivó del espejo";
      if (j.resumen.ausentesEnElClon !== j.resumen.formas)
        return `esperaba las ${j.resumen.formas} formas ausentes (el clon no las emite), hay ${j.resumen.ausentesEnElClon}`;
      return null;
    },
  },
  {
    etiqueta: "sin-espejo",
    porQue: "sin el lado ORIGINAL ⇒ TIRA, en vez de comparar el clon consigo mismo y sacar 0 diferencias",
    env: { SABOTAJE: "sin-espejo" },
    exit: 1,
    salidaTiene: /ESPEJO AUSENTE/,
  },
  {
    etiqueta: "clon-ciego",
    porQue: "una ruta del clon que no existe ⇒ AUSENTE, nunca Δ0",
    env: { SABOTAJE: "clon-ciego" },
    exit: 2,
    salidaTiene: /AUSENTES en el clon/,
    comprueba: (j) => (j.resumen.ausentesEnElClon === j.resumen.formas ? null : "una ruta inexistente no salió como AUSENTE"),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · lh-cmp ════════`);
console.log(`  alcance: espejo congelado de lh-spec + el clon local · SIN red al original\n`);

const ev = new Evaluadas({ nombre: "lh-cmp-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [join(QA, "lh-cmp.mjs")], env: c.env, timeout: 900_000 });
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

/* ── El caso que HOY no se puede ejercitar, declarado en vez de dado por bueno ── */
const control = join(QA, nombreNeg(CANONICA, "control"));
let baseEjercitable = false;
if (existsSync(control)) {
  const j = JSON.parse(readFileSync(control, "utf8"));
  baseEjercitable = j.resumen.ausentesEnElClon < j.resumen.formas;
}
console.log(
  `\n  ── \`base-distinta\` (P-LH-C8) ──\n` +
    (baseEjercitable
      ? `  ejercitable: el clon ya sirve alguna forma. HAY QUE AÑADIRLO a los casos de arriba.`
      : `  ⊘ NO EJERCITADO — el clon no sirve ninguna forma todavía, así que el sabotaje\n` +
        `    no puede cambiar el resultado. Un sabotaje que no cambia nada no prueba la\n` +
        `    guarda: prueba que el instrumento no la ejercita (§sondas 8a). Se declara.`),
);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-cmp · test en negativo: ${casos.length - fallos}/${casos.length}` +
    ` (+1 declarado NO EJERCITADO)\n` +
    (fallos === 0
      ? `   El rojo de hoy es del CLON, no del instrumento: la sonda tira sin espejo,\n` +
        `   marca AUSENTE lo que no se sirve y no confunde eso con Δ0.\n`
      : `   El comparador no se puede usar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
