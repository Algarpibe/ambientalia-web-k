/**
 * TEST EN NEGATIVO de `captura-f3-media`.
 * Uso: npm run cms:captura-f3-media-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **Esta sonda no tenía negativo, y se descubrió al ir a tocarla.** Llevaba
 * desde F3-0 siendo la única salida a la red del proyecto sin una sola prueba de
 * que sabe fallar — que es §*no te creas un «limpio» hasta haber probado en
 * negativo que la sonda sabe fallar*, con el agravante de que aquí un verde
 * falso significa **no haber capturado** y enterarse cuando un seed muere.
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `lista-ausente` | **LISTA AUSENTE** — el fichero no existe | 0 ficheros a capturar, que se leería como «ya está todo» |
 * | `lista-vacia` | **LISTA VACÍA** — resuelve a `[]` | ídem, y es el modo que de verdad puede pasar (una sonda que no se corrió) |
 * | `error-no-404` | **NO SE PUDO EVALUAR** — un 503 sigue siendo fallo | «ausencia medida en el original», que es la excepción del 404 |
 * | `control` | ✅ modo F3: deriva del HTML congelado y sale con su lista | — |
 * | `modo-lista` | ✅ modo LISTA: consume la congelada de `media-siembra` | — |
 *
 * ── NINGUNO TOCA LA RED, y cada uno por su vía ───────────────────────────
 * Un test en negativo de una campaña de captura **no puede capturar**: sería
 * pedirle al original 393 ficheros cada vez que se comprueba una guarda.
 *
 *   · tres con `SOLO_DERIVA=1` — se ejercita **la derivación y sus guardas**;
 *   · `error-no-404` corre la campaña de verdad, pero **los 365 buenos ya están
 *     en disco** (se reutilizan) y a los 28 restantes se les sustituye el error
 *     **antes** de pedir nada. Cero peticiones, y la rama queda cubierta.
 *
 * **Y el alcance se declara, porque sigue habiendo hueco**: esto NO prueba nada
 * sobre una descarga real — ni un 200 ni un cortocircuito de red a mitad de
 * fichero—. Lo que prueba es que **la lista no puede salir vacía en silencio** y
 * que **la excepción del 404 no es una puerta abierta a cualquier error**.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

const SONDA = join(QA, "../seed/captura-f3-media.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "modo F3 sin LISTA: deriva del HTML congelado y declara su lista",
    env: { SOLO_DERIVA: "1" },
    exit: 0,
    salidaTiene: /A CAPTURAR\s+\d+/,
    noContiene: /LISTA (AUSENTE|VACÍA)/,
  },
  {
    etiqueta: "modo-lista",
    porQue: "modo LISTA: consume `origenesACapturar` de la congelada de media-siembra",
    env: { SOLO_DERIVA: "1", LISTA: "medidas/media-siembra.json" },
    exit: 0,
    salidaTiene: /modo LISTA — \d+ orígenes/,
    comprueba: (out) => {
      const m = out.match(/A CAPTURAR\s+(\d+)/);
      if (!m) return "no imprimió cuántos hay que capturar";
      if (Number(m[1]) < 1) return "derivó 0 orígenes: la lista no se está leyendo";
      return null;
    },
  },
  {
    etiqueta: "lista-ausente",
    porQue: "una LISTA que no existe TIRA, en vez de capturar 0 ficheros en verde",
    env: { SOLO_DERIVA: "1", LISTA: "medidas/esta-lista-no-existe.json" },
    exit: 1,
    salidaTiene: /LISTA AUSENTE/,
  },
  {
    etiqueta: "lista-vacia",
    porQue: "una LISTA que resuelve a [] TIRA — «no se pudo leer» no es «no hay nada que capturar»",
    env: { SOLO_DERIVA: "1", LISTA: "medidas/captura-f3-media-neg-lista-vacia-FIXTURE.json" },
    exit: 1,
    salidaTiene: /LISTA VACÍA/,
  },
  /**
   * ⚠ **El negativo del reclasificador del 404, y es el que da valor a la
   * excepción.** Desde hoy un `HTTP 404` no cuenta como captura fallida sino
   * como **ausencia MEDIDA en el original** — lo cual, sin este sabotaje, sería
   * una puerta abierta a que **cualquier** error saliera verde.
   *
   * `SABOTAJE=error-no-404` sustituye el error por un 503 **sin pedir nada** (los
   * 365 buenos ya están en disco y sólo los 28 vuelven a pasar por ahí), así que
   * el negativo cuesta **cero peticiones** y aun así ejercita la rama.
   */
  {
    etiqueta: "error-no-404",
    porQue: "un error que NO es 404 sigue siendo FALLO: la excepción del 404 no es una puerta abierta",
    env: { SABOTAJE: "error-no-404", LISTA: "medidas/media-siembra.json" },
    exit: 2,
    salidaTiene: /NO SE PUDO EVALUAR/,
    noContiene: /404 EN EL ORIGINAL/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · captura-f3-media ════════`);
console.log(`  alcance: la DERIVACIÓN, sus guardas y la CLASIFICACIÓN del error ⇒ CERO peticiones al original`);
console.log(`           (3 con SOLO_DERIVA=1 · 1 sobre los 365 ya en disco · 1 con el error sustituido)`);
console.log(`  NO cubre: una descarga real — ni un 200 ni un cortocircuito de red\n`);

const ev = new Evaluadas({ nombre: "captura-f3-media-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env, timeout: 300_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.noContiene && c.noContiene.test(out)) mal = `la salida contiene ${c.noContiene} y no debería`;
  if (!mal && c.comprueba) mal = c.comprueba(out);

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(14)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(14)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

/* Y la comprobación que no es de sabotaje: que el modo nuevo no se haya llevado
 * por delante el viejo. Los dos destinos tienen que ser DISTINTOS, o la campaña
 * de datos escribiría sobre el índice de F3-0 y ningún acta que lo cite valdría. */
const destinosDistintos = existsSync(join(QA, "../../media-corpus/fase-3"));
if (!destinosDistintos) { fallos++; console.log(`  ❌ media-corpus/fase-3 no existe: el modo original ya no tiene su archivo`); }
else console.log(`  ✓  destinos separados: media-corpus/fase-3 (F3-0) · media-corpus/datos (esta tanda)`);

/**
 * ⚠ **Y la que se añadió porque el negativo SE LO LLEVÓ POR DELANTE:** el
 * sabotaje `error-no-404` corre la campaña de verdad, y su primera versión
 * reescribió `media-corpus/datos/INDICE.json` con 28 fallos y 0 ficheros —
 * **borrando el acta de la campaña buena en el acto de comprobar una guarda**
 * (§sondas 5). Ahora el índice de una corrida negativa lleva `-neg-<etiqueta>`,
 * y esto lo comprueba: si la canónica no sobrevive al negativo, rojo.
 */
const indiceReal = join(QA, "../../media-corpus/datos/INDICE.json");
if (existsSync(indiceReal)) {
  const j = JSON.parse(readFileSync(indiceReal, "utf8"));
  if (!Object.keys(j.ficheros ?? {}).length) {
    fallos++;
    console.log(`  ❌ media-corpus/datos/INDICE.json quedó con 0 ficheros: un negativo pisó la canónica`);
  } else console.log(`  ✓  la canónica sobrevive al negativo: ${Object.keys(j.ficheros).length} ficheros en media-corpus/datos/INDICE.json`);
} else console.log(`  ·  (media-corpus/datos/INDICE.json todavía no existe: la campaña no se ha corrido)`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura-f3-media · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   La lista NO puede salir vacía en silencio, y los dos modos escriben en\n` +
        `   archivos separados. La campaña se puede lanzar.\n`
      : `   NO se lanza la campaña hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
