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
  /**
   * ⚠ **EL INVARIANTE DE ESTE CONTROL CAMBIÓ EL 2026-08-13, y el que había se
   * retira con su razón.**
   *
   * Decía *«el clon no emite listados ⇒ las N formas AUSENTES»*. Era cierto —y
   * el valor correcto que comprobar— **mientras no hubiera nada construido**. En
   * cuanto la 66.ª tanda emitió `L1-blog` y las dos `L1-etiqueta`, ese control
   * empezó a fallar **por la razón buena**: 10 de 13, no 13 de 13.
   *
   * Un control que se pone rojo cuando el proyecto AVANZA no está midiendo el
   * instrumento: está midiendo el estado del clon, que es trabajo de la sonda y
   * no de su negativo. Así que el invariante se sustituye por el que de verdad
   * pertenece al instrumento:
   *
   *   · congela un `resumen` (llegó al final);
   *   · derivó un universo del espejo (`formas > 0`);
   *   · **comparó pares de verdad** (`paresComparados > 0`) — que es lo que
   *     distingue «no encontré diferencias» de «no miré»;
   *   · y las servidas más las ausentes suman las formas, o sea que ninguna se
   *     perdió por el camino en silencio.
   *
   * Lo que ya NO se afirma aquí es cuántas formas emite el clon: eso lo dice la
   * sonda, y fijarlo en su negativo era **cablear el estado de ayer**.
   */
  {
    etiqueta: "control",
    porQue: "sin sabotaje: deriva el universo, compara pares de verdad y no pierde ninguna forma",
    env: {},
    exit: 2,
    salidaTiene: /AUSENTES en el clon/,
    comprueba: (j) => {
      if (!j.resumen) return "sin resumen: la sonda no llegó a congelar su recuento";
      if (!j.resumen.formas) return "0 formas: el universo no se derivó del espejo";
      if (!(j.resumen.paresComparados > 0))
        return "0 pares comparados: «no hay diferencias» y «no miré» darían la misma salida (§sondas 4bis)";
      const servidas = j.resumen.formas - j.resumen.ausentesEnElClon;
      if (servidas < 0 || servidas > j.resumen.formas) return `recuento incoherente: ${servidas} servidas de ${j.resumen.formas}`;
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
  /**
   * ⚠ **AÑADIDO 2026-08-13 (66.ª tanda), y lo pidió esta misma sonda.** Hasta
   * hoy `base-distinta` salía declarado **NO EJERCITADO** con su razón: el clon
   * no servía ninguna forma, así que el sabotaje no podía cambiar el resultado
   * —y *un sabotaje que no cambia nada no prueba la guarda, prueba que el
   * instrumento no la ejercita* (§sondas 8a)—. El bloque de abajo lo decía y
   * remataba: *«ejercitable ⇒ HAY QUE AÑADIRLO a los casos de arriba»*.
   *
   * Con `L1-blog` y las dos `L1-etiqueta` servidas, **ya cambia el resultado**:
   * la sonda tiene 3 bases que comparar y el sabotaje fuerza a que ninguna case.
   *
   * Lo que prueba: que `P-LH-C8` **discrimina**. El criterio de `qa:c-cabecera`
   * existe porque *un selector puede casar en los dos lados y apuntar a cosas
   * distintas*; sin este caso, «las 3 bases casan» y «la sonda no mira las
   * bases» darían exactamente la misma salida verde.
   */
  {
    etiqueta: "base-distinta",
    porQue: "P-LH-C8: si la base no es el MISMO elemento, se nombra y no se normaliza nada contra ella",
    env: { SABOTAJE: "base-distinta" },
    exit: 2,
    salidaTiene: /P-LH-C8/,
    comprueba: (j) => {
      const servidas = j.resumen.formas - j.resumen.ausentesEnElClon;
      if (!servidas) return "el clon no sirvió ninguna forma: el sabotaje no puede cambiar nada (§sondas 8a)";
      if (j.resumen.basesQueNoCasan !== servidas)
        return `esperaba las ${servidas} bases servidas marcadas como distintas, hay ${j.resumen.basesQueNoCasan}`;
      return null;
    },
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

/* ══════════════════════════════════════════════════════════════════════════
 * LA GUARDA DE LA GUARDA — que `base-distinta` siga siendo EJERCITABLE
 *
 * El caso está en la lista desde que el clon sirve formas, pero **eso puede
 * dejar de ser cierto sin que nadie lo note**: si mañana una regresión deja las
 * 13 formas AUSENTES, `base-distinta` volvería a pasar «por lo suyo» —exit 2 y
 * el texto de P-LH-C8 no aparecería… y su `comprueba` lo cazaría—. Para que el
 * informe no dependa de eso, el nº de formas servidas se imprime aquí.
 * ═════════════════════════════════════════════════════════════════════════ */
const control = join(QA, nombreNeg(CANONICA, "control"));
let servidas = 0;
if (existsSync(control)) {
  const j = JSON.parse(readFileSync(control, "utf8"));
  servidas = j.resumen.formas - j.resumen.ausentesEnElClon;
}
console.log(
  `\n  ── \`base-distinta\` (P-LH-C8) ──\n` +
    (servidas
      ? `  ✓ EJERCITADO sobre ${servidas} forma(s) servida(s) por el clon.`
      : `  ⊘ el clon no sirve ninguna forma: el sabotaje no puede cambiar el resultado\n` +
        `    (§sondas 8a). Si esto sale, el caso de arriba está pasando en falso.`),
);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} lh-cmp · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El rojo de hoy es del CLON, no del instrumento: la sonda tira sin espejo,\n` +
        `   marca AUSENTE lo que no se sirve y no confunde eso con Δ0.\n`
      : `   El comparador no se puede usar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
