/**
 * TEST EN NEGATIVO de `coloca-media`.
 * Uso: npm run cms:coloca-media-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `lista-vacia` | **0 rutas pendientes** ⇒ TIRA | «ya está todo colocado», que es como se lee un cero |
 * | `origen-ausente` | **SIN ORIGEN** ⇒ exit 2 | un fichero que el original no sirve (ésos van aparte) |
 * | `control` | ✅ 0 sin origen, y el CONTROL del redimensionado con pares > 0 | — |
 *
 * ── ⚠ EL CONTROL TIENE UNA TRAMPA PROPIA, Y HAY QUE DECIRLA ──────────────
 * Cuando la colocación ya está hecha, `coloca-media` no copia ni regenera nada:
 * las 1889 rutas están en `public` y sólo quedan los 28 que el original 404. O
 * sea que **el «control» no puede comprobar que sepa colocar** — comprobaría un
 * cero.
 *
 * Lo que sí comprueba, y es lo que hace que la corrida signifique algo:
 *
 *   · **el CONTROL DEL REDIMENSIONADO se ejecuta con `pares > 0`** — 133
 *     variantes capturadas del original reproducidas en dimensión por `sharp`.
 *     Ése es el control que autoriza a regenerar, y se re-ejercita cada corrida;
 *   · **`sinOrigen === 0`** — ninguna ruta pendiente se quedó sin resolver;
 *   · **el mínimo de `Evaluadas` sale de la propia lista**, así que una lista que
 *     encogiera sin razón no pasaría por verde.
 *
 * **Y lo que NO comprueba se declara**: con el trabajo hecho, este negativo no
 * vuelve a probar la COPIA ni la REGENERACIÓN sobre ficheros nuevos. Eso lo
 * probó la corrida que las hizo —682 y 1179, con el hueco cayendo de 1889 a 28
 * medido después— y esa medición está congelada, que es donde vive la prueba.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/coloca-media.json";
const SONDA = join(QA, "../seed/coloca-media.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "0 sin origen, y el CONTROL del redimensionado corre con pares CAPTURADOS, no con sus propias regeneraciones",
    env: { SOLO_DERIVA: "1" },
    exit: 0,
    salidaTiene: /CONTROL del redimensionado \.+ (\d+)\/\1 /,
    comprueba: (j) => {
      if (j.resumen.sinOrigen !== 0) return `${j.resumen.sinOrigen} rutas sin origen`;
      if (!j.control?.pares) return "el CONTROL del redimensionado no comparó ni un par: la regla del cero";
      if (j.control.fallos) return `${j.control.fallos} variantes no se reproducen en dimensión`;
      if (!j.resumen.pendientes) return "0 pendientes: la lista no se está leyendo";
      return null;
    },
  },
  {
    etiqueta: "lista-vacia",
    porQue: "una lista que resuelve a 0 TIRA — «no queda nada» y «no se pudo leer» no son lo mismo",
    env: { SOLO_DERIVA: "1", SABOTAJE: "lista-vacia" },
    exit: 1,
    salidaTiene: /0 rutas pendientes/,
  },
  {
    etiqueta: "origen-ausente",
    porQue: "sin origen en ningún sitio ⇒ SIN ORIGEN y exit 2, nunca una colocación parcial en verde",
    env: { SOLO_DERIVA: "1", SABOTAJE: "origen-ausente" },
    exit: 2,
    salidaTiene: /SIN ORIGEN en ningún sitio/,
    comprueba: (j) => (j.resumen.sinOrigen > 0 ? null : "el sabotaje no dejó ninguna ruta sin origen"),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · coloca-media ════════`);
console.log(`  alcance: la LISTA, la resolución del origen y el CONTROL del redimensionado`);
console.log(`  NO cubre: copiar o regenerar ficheros nuevos — eso lo probó la corrida que lo hizo,`);
console.log(`            con el hueco cayendo de 1889 a 28 medido DESPUÉS (medidas/media-siembra.json)\n`);

const ev = new Evaluadas({ nombre: "coloca-media-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env, timeout: 600_000 });
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

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} coloca-media · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Una lista ilegible TIRA, un origen perdido sale ROJO, y el redimensionado\n` +
        `   se re-verifica contra variantes capturadas del original en cada corrida.\n`
      : `   No se coloca nada hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
