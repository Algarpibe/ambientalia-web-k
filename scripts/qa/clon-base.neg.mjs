/**
 * TEST EN NEGATIVO de `clon-base` — el que la guarda de regresión NO TENÍA.
 * Uso: npm run qa:clon-base-neg
 *
 * ── Por qué existe este fichero (122.ª) ────────────────────────────────────
 * `clon-base` es la guarda de regresión principal del repo: 426 rutas × 2
 * anchos, umbral cero, y su verde es lo que autoriza a decir «el cambio no
 * movió un píxel». Derivado el 2026-08-29: **0 ocurrencias en `negativos.mjs` y
 * ningún `clon-base.neg.mjs`** — o sea que esa frase llevaba tandas citándose
 * sin que nadie hubiera probado que la sonda sabe fallar.
 *
 * Es `CLAUDE.md` §sondas 4bis leído del revés: el catálogo persigue sondas que
 * salen verdes sin mirar, y aquí lo que faltaba era **la comprobación de que
 * ésta mira**. Un instrumento sin negativo no es que esté roto: es que su verde
 * y su silencio son indistinguibles.
 *
 * ── QUÉ SEPARA CADA CASO, y no es lo mismo que «cuál pasa» ─────────────────
 * §regla 21 (la vuelta) exige que un negativo diga qué distingue cada caso HOY,
 * no si pasa. Los tres de aquí separan cosas distintas y ninguno sobra:
 *
 *   | caso | qué separa | ¿separaba el arreglo de la 122.ª? |
 *   |---|---|---|
 *   | `base-ajena` | el SUELO `Math.max(1, …)` del listón | **NO** — con `minimo: 1`, `0 < 1` ya gritaba |
 *   | `casi-toda-sin-comparar` | el LISTÓN DERIVADO | **SÍ** — con `minimo: 1`, `1 ≥ 1` salía suficiente |
 *   | CONTROL | que sin sabotaje se comparen TODAS y el contrato calle | — |
 *
 * ⚠ Que `base-ajena` NO separe el arreglo se escribe aquí a propósito. Es el
 * caso que primero se le ocurre a cualquiera —y el que el encargo nombraba—,
 * y tiene **0 instancias separadoras** para el listón: pasaba antes y pasa
 * después. Lo que sí prueba es la otra mitad, que es real: sin el suelo, una
 * base ajena llevaría el listón a 0 y «0 de 0» sería suficiente. Dos mitades,
 * dos casos (§regla 17, 2.ª cara).
 *
 * ── ALCANCE, con su cardinal (§regla 14) ───────────────────────────────────
 * Esto NO es el negativo completo de `clon-base`: cubre **el segundo contrato**
 * —el nivel de comparación— y nada más. Lo que queda SIN NEGATIVO, nombrado en
 * vez de omitido:
 *
 *   · el PRIMER contrato (`minimo: RUTAS.length`, las páginas medidas);
 *   · la detección de regresión en sí —`docH`, `h1.y`, nº de secciones, nº de
 *     anclas—: **4 ejes, 0 casos**. Un sabotaje que mueva un `docH` de la base
 *     y exija que salga nombrado es el caso que falta, y es de otra tanda;
 *   · la guarda de `SOLO=` que no casa, y la del MARCADOR.
 *
 * Se corre sobre **3 rutas** con `SOLO=`, no sobre las 426: a ~7 s por ruta y
 * navegador, las 426 son ~50 min por corrida y aquí hay 4 corridas. La sonda
 * impone ella misma que una corrida filtrada no lleve el nombre canónico, así
 * que estas medidas no pueden confundirse con la línea base.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, APP, leeManifiesto, nombreNeg, QA, rutasEmitidas, w } from "./lib.mjs";

const SONDA = join(QA, "clon-base.mjs");
const ANCHO = "1440";

/* ── El dominio se DERIVA del build, no se escribe (§regla 9) ────────────── */
const TODAS = rutasEmitidas(leeManifiesto(APP));
if (TODAS.length < 3) {
  console.error(`\n❌ SIN DOMINIO — el build emite ${TODAS.length} rutas y hacen falta ≥3. ¿Falta \`npm run build\`?`);
  process.exit(2);
}
const RUTAS = TODAS.slice(0, 3);
const SOLO = RUTAS.join(",");
const ARCH = `medidas/clon-base-${ANCHO}-SOLO-${RUTAS.length}.json`;

const ficheroDe = (etiqueta) => join(QA, nombreNeg(ARCH, etiqueta));
const borra = (etiqueta) => {
  const f = ficheroDe(etiqueta);
  if (existsSync(f)) rmSync(f);
};

console.log(`\n════════ TEST EN NEGATIVO · clon-base ════════\n`);
console.log(`  dominio derivado del build: ${RUTAS.length} de ${TODAS.length} rutas · @${ANCHO}`);
console.log(`  ${RUTAS.join(" · ")}\n`);

/* ── LA BASE SE MIDE, NO SE HEREDA ──────────────────────────────────────────
 * Igual que en `html-cmp.neg`: comparar el build consigo mismo es el control
 * correcto. Heredar la línea base del proyecto mezclaría «el comparador sabe
 * decir IGUAL» con «el clon de hoy coincide con el de hace tres tandas», y el
 * rojo dejaría de decir cuál de las dos falló. */
const SONDEO = "sondeo";
borra(SONDEO);
corridaNegativa({ etiqueta: SONDEO, args: [SONDA, ANCHO], env: { SOLO } });
const ARCH_SONDEO = ficheroDe(SONDEO);
if (!existsSync(ARCH_SONDEO)) {
  console.error(
    `\n❌ SIN BASE — la corrida de sondeo no dejó ${ARCH_SONDEO}.\n` +
      `   Sin ella no hay nada contra lo que sabotear, y «0 casos» se leería como «0 fallos».`,
  );
  process.exit(2);
}
const base = JSON.parse(readFileSync(ARCH_SONDEO, "utf8"));
const limpias = Object.entries(base.paginas).filter(([, p]) => !p.error).map(([r]) => r);
if (limpias.length < 2) {
  console.error(
    `\n❌ SIN BASE ÚTIL — sólo ${limpias.length} de ${RUTAS.length} páginas se midieron sin error.\n` +
      `   Con menos de 2 no se puede construir «todas en error salvo una».`,
  );
  process.exit(2);
}
const diana = limpias[0];
const nComunes = Object.keys(base.paginas).length;
console.log(`  base medida: ${nComunes} páginas (${limpias.length} sin error) · diana ${diana}\n`);

/** Una base derivada de la del sondeo, con la mutación pedida. */
function fabricaBase(etiqueta, muta) {
  const b = JSON.parse(JSON.stringify(base));
  muta(b);
  const destino = `medidas/clon-base-neg-${etiqueta}-base.json`;
  w(destino, b, { pisar: true });
  return destino;
}

const casos = [
  {
    /* El SUELO del listón. Con `comunes = 0`, un `minimo` sin `Math.max(1, …)`
     * valdría 0 y «0 de 0» sería suficiente — o reventaría en el constructor de
     * `Evaluadas`, que exige ≥1. Ni una cosa ni la otra es un veredicto. */
    etiqueta: "base-ajena",
    exit: 1,
    porQue: "base de OTRO conjunto de rutas ⇒ 0 comparadas contra un suelo de 1: NO SE PUDO EVALUAR",
    base: () =>
      fabricaBase("base-ajena", (b) => {
        const paginas = {};
        for (const [r, p] of Object.entries(b.paginas)) paginas[`/no-existe-122${r}`] = p;
        b.paginas = paginas;
      }),
    salidaTiene: new RegExp(`NO SE PUDO EVALUAR · clon-base cmp @${ANCHO} — 0 de 1 rutas comparadas`),
  },
  {
    /* EL CASO QUE SEPARA EL ARREGLO. El sabotaje va EN EL DATO (§regla 28a): se
     * marcan con `error` todas las páginas de la base menos la diana, que es el
     * modo de fallo del que la guarda protege —una corrida cuya medida no
     * llegó—, no un umbral bajado a mano.
     *
     * ⚠ No se ancla en el código de salida: `sinComparar > 0` ya ponía exit 1
     * antes del arreglo, así que el exit NO separa (§regla 21). Lo que separa
     * son las dos cifras del contrato. */
    etiqueta: "casi-toda-sin-comparar",
    exit: 1,
    porQue: `base con todas en error salvo la diana ⇒ 1 comparada de ${nComunes}: NO SE PUDO EVALUAR`,
    base: () =>
      fabricaBase("casi-toda-sin-comparar", (b) => {
        for (const r of Object.keys(b.paginas))
          if (r !== diana) b.paginas[r].error = "SABOTAJE 122.ª: esta página no se midió";
      }),
    salidaTiene: new RegExp(`NO SE PUDO EVALUAR · clon-base cmp @${ANCHO} — 1 de ${nComunes} rutas comparadas`),
  },
];

const ev = new Evaluadas({ nombre: "clon-base-neg", unidad: "casos", minimo: casos.length + 1 });
let fallos = 0;

for (const c of casos) {
  borra(c.etiqueta);
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [SONDA, ANCHO, "--cmp", c.base()],
    env: { SOLO },
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(24)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(24)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────────
 * Sin sabotaje: exit 0, **todas** comparadas, y el contrato del nivel de
 * comparación CALLADO. Las tres cosas, no sólo el exit — un control atado al
 * código de salida no distingue «comparó todas» de «comparó una» (que es
 * exactamente el defecto que esta tanda cerró). */
borra("control");
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA, ANCHO, "--cmp", nombreNeg(ARCH, SONDEO)], env: { SOLO } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
if (ctl.error || ctl.status === null) ev.fallo("control", ctl.error || "no llegó a correr");
else ev.ok();

let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!new RegExp(`${nComunes} de ${nComunes} páginas comparadas · 0 con regresión`).test(ctlOut))
  malCtl = `no dice «${nComunes} de ${nComunes} páginas comparadas · 0 con regresión»`;
else if (/NO SE PUDO EVALUAR · clon-base cmp/.test(ctlOut))
  malCtl = "sin sabotaje NO puede gritar el contrato de comparación";
if (malCtl) {
  fallos++;
  console.log(`  ❌ ${"CONTROL".padEnd(24)} ${malCtl}`);
} else
  console.log(`  ✓  ${"CONTROL".padEnd(24)} exit 0 · ${nComunes} de ${nComunes} comparadas · el contrato NO grita`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} clon-base · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El nivel de COMPARACIÓN sabe negarse: ni una base de otro conjunto de rutas\n` +
        `   ni una en la que la medida no llegó pueden sacarle un veredicto. Y sin\n` +
        `   sabotaje compara las ${nComunes} y calla.\n` +
        `   ⚠ Alcance: SÓLO el segundo contrato. Los 4 ejes de regresión (docH, h1.y,\n` +
        `   secciones, anclas) siguen SIN NEGATIVO — ver la cabecera.\n`
      : `   «${nComunes} páginas comparadas · 0 con regresión» NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
