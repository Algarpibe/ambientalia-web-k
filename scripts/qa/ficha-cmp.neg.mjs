/**
 * TEST EN NEGATIVO de `ficha-cmp` — 117.ª · ESCALÓN 1
 * Uso: npm run qa:ficha-cmp-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * SE CORRE **ANTES DE QUE EXISTA EL LADO QUE VA A MEDIR** (§regla 24)
 *
 * El clon no pinta la ficha (0 de 155 ficheros de código). Y aun así casi todas
 * las preguntas de este negativo **no dependen de ese lado**: se contestan
 * copiando un lado sobre el otro. Así que se contestan HOY — y la ganancia no
 * es de calendario, es de ATRIBUCIÓN: cuando la ficha aparezca, un rojo sólo
 * puede ser suyo. Si el instrumento y el objeto se estrenaran a la vez, un rojo
 * tendría DOS explicaciones y ninguna medida las separaría.
 *
 * ── EL CONTROL NO SE ATA AL CÓDIGO DE SALIDA, y decirlo importa ──────────
 * `ficha-cmp` es un COMPARADOR: su exit cambia con el ESTADO DEL OBJETO —hoy 3
 * («ausente en el clon»), mañana 0 (Δ0) o 1 (diferencias)—. Un control cableado
 * a cualquiera de los tres CADUCARÍA el día que se pinte la ficha, que es
 * §regla 5ter: *arreglar el objeto medido caduca el control del instrumento*.
 *
 * Se ata a lo que es cierto en los TRES estados:
 *   · alcanza su dominio entero — `evaluadas N/N`, numerador y denominador **en
 *     la misma unidad**;
 *   · publica su CATÁLOGO con la razón de cada entrada;
 *   · publica el cardinal de bloqueadas **EN LOS DOS LADOS** (§regla 32);
 *   · publica las hojas resueltas, y las páginas con CERO.
 *
 * ── QUÉ SEPARA CADA CASO ────────────────────────────────────────────────
 *   mismo-lado    ¿COMPARA, o INVENTA diferencias? Copiado un lado sobre el
 *                 otro tiene que dar **0** y salir en VERDE. Es el único que
 *                 sale verde, y es el que prueba que la comparación compara;
 *   grita         ¿SABE GRITAR? Sin objeto no hay defecto que ocultar, así que
 *                 la pregunta NO es «¿sabe callar?». Se inyecta un Δ **CONOCIDO**
 *                 y se exige que lo cace **y lo NOMBRE con sus dos lados**
 *                 (§regla 24: un caso atado sólo al exit caduca el día que haya
 *                 objeto);
 *   sin-insumos   ¿sabe decir «no pude»? Sin corpus, **corrida NULA** con exit
 *                 ≠ 0 y sin abrir el navegador — nunca un verde de 0 comparados.
 *
 * ⚠ Y los tres SABOTEAN EL DATO, no el umbral (§regla 28): mover un umbral sólo
 *   muerde si el lado medido es > 0, y aquí el lado del clon vale **0 pares con
 *   ficha**. Un sabotaje sobre el umbral tendría **0 instancias separadoras POR
 *   CONSTRUCCIÓN**.
 *
 * ⚠ El sabotaje NO edita el fuente (§regla 20, caso peor): va por variable de
 *   entorno, así que una muerte por señal no puede dejarlo escrito en el repo.
 */
import { join } from "node:path";

import { corridaNegativa, Evaluadas, QA } from "./lib.mjs";

const SONDA = join(QA, "ficha-cmp.mjs");

const casos = [
  {
    etiqueta: "mismo-lado",
    exit: 0,
    porQue: "copiado el lado del original sobre el del clon, 0 diferencias — separa «compara» de «inventa»",
    env: { NEG_MISMO_LADO: "1" },
    salidaTiene: /sin diferencias en \d+ pares comparados/,
    prohibidoEnSalida: /❌/,
  },
  {
    etiqueta: "grita",
    exit: 1,
    porQue: "un Δ CONOCIDO de +37.5 en caja.h tiene que salir CAZADO y NOMBRADO con sus dos lados",
    env: { NEG_GRITA: "37.5" },
    salidaTiene: /caja\.h\s+orig \S+ → clon \S+/,
  },
  {
    etiqueta: "sin-insumos",
    exit: 2,
    porQue: "sin corpus, CORRIDA NULA y sin abrir navegador — nunca un verde de 0 comparados",
    env: { NEG_SIN_INSUMOS: "1" },
    salidaTiene: /CORRIDA NULA/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · ficha-cmp ════════\n`);

/* el mínimo cuenta lo MISMO que el numerador: los N sabotajes + el control +
 * el caso de higiene. Un `minimo: casos.length` publicaba «4/3», que es
 * numerador y denominador en unidades distintas (§*la línea de unidades*). */
const ev = new Evaluadas({ nombre: "ficha-cmp-neg", unidad: "sabotajes", minimo: casos.length + 2 });
let fallos = 0;

/* ══════════════════════════════════════════════════════════════════════════
 * CONTROL — la corrida limpia. Su exit HOY es 3 («ausente en el clon»), y eso
 * es el estado de partida, no un fallo. Por eso el control NO lo mira.
 * ═════════════════════════════════════════════════════════════════════════ */
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA] });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const mUnidades = /evaluadas (\d+)\/(\d+) pares/.exec(ctlOut);
const tieneCatalogo = /catálogo: \*\*\d+\*\* entradas/.test(ctlOut);
const tieneBloqueadas = /bloqueadas .*orig \d+ · clon \d+/.test(ctlOut);
const tieneHojas = /hojas: resueltas \d+\/\d+/.test(ctlOut);

let malCtl = null;
if (ctl.status === null || ctl.error) malCtl = `no llegó a correr: ${ctl.error || "timeout"}`;
else if (!mUnidades) malCtl = "no imprime su línea de unidades (`evaluadas N/M pares`)";
else if (mUnidades[1] !== mUnidades[2]) malCtl = `dominio incompleto: ${mUnidades[1]}/${mUnidades[2]} pares`;
else if (!tieneCatalogo) malCtl = "no publica su catálogo con la razón de cada entrada (§regla 14)";
else if (!tieneBloqueadas) malCtl = "no publica el cardinal de bloqueadas EN LOS DOS LADOS (§regla 32)";
else if (!tieneHojas) malCtl = "no publica las hojas resueltas — sin ellas la geometría es ficción plausible";

if (malCtl) {
  console.log(`  ❌ CONTROL   ${malCtl}`);
  fallos++;
} else {
  console.log(`  ✓ CONTROL   dominio ${mUnidades[1]}/${mUnidades[2]} pares · catálogo, bloqueadas (2 lados) y hojas publicados`);
  console.log(`              (exit ${ctl.status} — NO se comprueba: cambia con el estado del objeto, §regla 5ter)`);
}
ev.ok();

/* ══════════════════════════════════════════════════════════════════════════
 * LOS SABOTAJES — cada uno tiene que caer POR SU MOTIVO
 * ═════════════════════════════════════════════════════════════════════════ */
for (const c of casos) {
  const r = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env });
  const out = (r.stdout || "") + (r.stderr || "");
  let mal = null;

  if (r.status === null || r.error) mal = `no llegó a correr: ${r.error || "timeout"}`;
  else if (r.status !== c.exit) mal = `exit ${r.status}, esperado ${c.exit}`;
  else if (c.salidaTiene && !c.salidaTiene.test(out)) mal = `no cae por su motivo: falta ${c.salidaTiene}`;
  else if (c.prohibidoEnSalida && c.prohibidoEnSalida.test(out)) mal = `cae por OTRO motivo: aparece ${c.prohibidoEnSalida}`;

  if (mal) { console.log(`  ❌ ${c.etiqueta.padEnd(14)} ${mal}`); fallos++; }
  else console.log(`  ✓ ${c.etiqueta.padEnd(14)} exit ${r.status} — ${c.porQue}`);
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * CASO 4 · LA HIGIENE DE §regla 24 — y se prueba FUERA del arnés, a propósito
 *
 * ⚠ ESTE CASO NACIÓ ROTO Y EL DEFECTO ERA MÍO, no de la sonda. La primera
 * versión comprobaba «¿avisa de que desvía?» DENTRO de cada caso de arriba —
 * y `corridaNegativa` pone `NEG: etiqueta` **siempre**, así que el aviso
 * legítimamente no sale y la comprobación tenía **0 instancias separadoras POR
 * CONSTRUCCIÓN**: no podía pasar nunca, dijera lo que dijera la sonda.
 *
 * §regla 21 lo dirimió en una corrida: la sonda SOLA —sin `NEG=`— sí desvía y
 * sí avisa. O sea que el rojo era del negativo, no un hallazgo. Y arreglarlo
 * NO es bajar el listón: es moverlo al único sitio donde el caso puede
 * ejercitarse, que es una corrida **sin el arnés**.
 * ═════════════════════════════════════════════════════════════════════════ */
const { spawnSync } = await import("node:child_process");
const { existsSync, statSync } = await import("node:fs");
const canonico = join(QA, "medidas", "ficha-cmp.json");
const antes = existsSync(canonico) ? statSync(canonico).mtimeMs : null;

const limpio = { ...process.env, NEG_MISMO_LADO: "1" };
delete limpio.NEG;
delete limpio.SALIDA;
const solo = spawnSync(process.execPath, [SONDA], { env: limpio, encoding: "utf8", timeout: 900_000 });
const soloOut = (solo.stdout || "") + (solo.stderr || "");
const despues = existsSync(canonico) ? statSync(canonico).mtimeMs : null;

let malHig = null;
if (solo.status === null || solo.error) malHig = `no llegó a correr: ${solo.error || "timeout"}`;
/* ⚠ SIN el canónico en disco, «no lo pisó» es cierto POR CONSTRUCCIÓN: `antes`
 * y `despues` valen los dos `null` y el caso pasa sin haber ejercitado nada —
 * **0 instancias separadoras**, que es el mismo defecto que este caso vino a
 * arreglar. §regla 21, tercer caso: eso no es «roto» ni «probado», es SIN
 * PROBAR — se reporta con su motivo y **sigue contando como fallo**, porque un
 * SIN PROBAR que sale verde se lee como probado. */
else if (antes === null)
  malHig = "SIN PROBAR: no hay canónico en medidas/ficha-cmp.json, así que «no lo pisó» es cierto por construcción — corre `npm run qa:ficha-cmp` limpio antes";
else if (!/SABOTAJE ACTIVO SIN 'NEG='/.test(soloOut))
  malHig = "no avisa de que hay sabotaje activo sin corrida de negativo";
else if (antes !== despues)
  malHig = "PISÓ EL CANÓNICO con contenido de sabotaje — es una medida falsa con la autoridad de una congelada (§regla 7)";

if (malHig) { console.log(`  ❌ ${"higiene-desvio".padEnd(14)} ${malHig}`); fallos++; }
else console.log(`  ✓ ${"higiene-desvio".padEnd(14)} sin 'NEG=' avisa y desvía sola; el canónico NO se toca (§regla 24)`);
ev.ok();

console.log(`\n  ✓ evaluadas ${ev.n}/${ev.minimo} sabotajes (control y higiene incluidos)`);
if (fallos) {
  console.error(
    `\n❌ ${fallos} caso(s). Antes de tocar este negativo: **corre la sonda sola**\n` +
      `   (§regla 21). Si sale roja, el hallazgo es suyo y el negativo se queda rojo\n` +
      `   con su ficha; sólo si sale verde el defecto está aquí. Y un caso que pasa a\n` +
      `   verde AJUSTANDO su expectativa no ha arreglado nada: ha escrito el defecto\n` +
      `   DENTRO de la guarda.\n`,
  );
  process.exit(1);
}
console.log(`\n✅ los ${casos.length} sabotajes caen por su motivo y el control alcanza su dominio.`);
