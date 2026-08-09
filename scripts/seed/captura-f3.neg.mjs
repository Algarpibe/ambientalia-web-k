/**
 * TEST EN NEGATIVO de `captura-f3` — las tres guardas de la DERIVACIÓN, cada
 * una por SU invariante, más el control.
 *
 * ── Por qué se prueba la derivación y no la captura ────────────────────────
 * La captura es una petición HTTP: probarla en negativo exigiría pegarle al
 * original a propósito, que es justo lo que esta campaña existe para no tener
 * que repetir. **Lo que puede salir mal en silencio es la LISTA**, y eso se
 * prueba entero sin red (`SOLO_DERIVA=1`):
 *
 * | sabotaje | reintroduce | tiene que caer por |
 * |---|---|---|
 * | `familia-sin-decidir` | 3 URLs de un prefijo que `FAMILIAS` no nombra | **FAMILIA SIN DECIDIR** |
 * | `colision` | dos rutas distintas apuntando al mismo fichero | **COLISIÓN de fichero** |
 * | `cero-evaluadas` | declarar N y evaluar 0 | **NO SE PUDO EVALUAR** (contrato de `Evaluadas`) |
 *
 * **Cada uno cae por su propio invariante y no por otro** (`CLAUDE.md` §sondas,
 * corolario de la regla 3): un negativo en el que los tres cayeran por el mismo
 * mensaje probaría una guarda, no tres.
 *
 * ── Y el CONTROL, que es lo que decide si los tres significan algo ─────────
 * Sin sabotaje la derivación tiene que salir **exit 0 con su línea de
 * unidades**. La regla 8a: *un sabotaje que no cambia el resultado no ha
 * probado la guarda — ha probado que el instrumento no la ejercita*. Aquí el
 * riesgo es real y concreto: si un día la derivación diera 0 páginas por otro
 * motivo, los tres sabotajes «morderían» sin haber probado nada.
 *
 * Uso: npm run cms:captura-f3-neg
 */
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";

const CAMPAÑA = join(QA, "../seed/captura-f3.mjs");

const sabotajes = [
  {
    id: "familia-sin-decidir",
    que: "inyecta 3 URLs de `/es/familia-inventada/*`, un prefijo que FAMILIAS no nombra",
    cae: /FAMILIA SIN DECIDIR/,
    porQue: "sin la guarda, una familia entera se barre a `sueltas` y el informe la cuenta como cola larga",
  },
  {
    id: "colision",
    que: "mete la misma ruta dos veces en la lista de trabajo",
    cae: /COLISIÓN de fichero/,
    porQue: "sin la guarda, la segunda captura pisa a la primera y media captura sería de otra página",
  },
  {
    id: "cero-evaluadas",
    que: "declara su mínimo y luego no evalúa ni una unidad",
    cae: /NO SE PUDO EVALUAR/,
    porQue: "sin el contrato, «0 páginas capturadas» sale en verde: la clase «0 comparado = verde»",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · campaña F3 ════════`);
console.log(`  ${sabotajes.length} sabotajes (uno por guarda de la derivación) + control\n`);

const ev = new Evaluadas({ nombre: "captura-f3-neg", unidad: "sabotajes", minimo: sabotajes.length + 1 });
let fallos = 0;

const corre = (etiqueta, extra = {}) =>
  corridaNegativa({ etiqueta, args: [CAMPAÑA], env: { SOLO_DERIVA: "1", ...extra }, timeout: 300_000 });

/** Los otros invariantes: un sabotaje que caiga por el de otro no ha probado el suyo. */
const ajenos = (id) => sabotajes.filter((s) => s.id !== id).map((s) => s.cae);

for (const s of sabotajes) {
  const t0 = Date.now();
  const res = corre(s.id, { SABOTAJE: s.id });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(s.id, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status === 0) mal = `exit 0 — el sabotaje NO mordió: la guarda no está o no la ejercita`;
  else if (!s.cae.test(out)) mal = `exit ${res.status} pero sin «${s.cae.source}» — cayó por otra cosa`;
  else {
    const cruzado = ajenos(s.id).find((r) => r.test(out));
    if (cruzado) mal = `cae por el invariante de OTRO sabotaje (${cruzado.source}): no prueba el suyo`;
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${s.id.padEnd(20)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${s.id.padEnd(20)} (${seg}s)  cayó por SU invariante — ${s.porQue}`);
}

const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
ev.ok();
if (ctl.status !== 0) { fallos++; console.log(`  ❌ CONTROL${" ".repeat(19)} exit ${ctl.status} — sin sabotaje tiene que salir 0`); }
else if (!/✓ evaluadas \d+\/\d+ páginas · captura-f3/.test(ctlOut)) {
  /* La línea de unidades es la mitad legible del contrato: un verde sin ella no
   * distingue «no falta nada» de «no se derivó nada». */
  fallos++;
  console.log(`  ❌ CONTROL${" ".repeat(19)} exit 0 pero sin la línea de unidades evaluadas`);
} else if (/A CAPTURAR: 0 páginas/.test(ctlOut)) {
  fallos++;
  console.log(`  ❌ CONTROL${" ".repeat(19)} la derivación da 0 páginas: los sabotajes de arriba no probaron nada`);
} else console.log(`  ✓  CONTROL${" ".repeat(19)} exit 0 con su línea de unidades — la derivación no falla siempre`);

const total = sabotajes.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura-f3 · test en negativo: ${total - fallos}/${total}\n` +
    (fallos === 0
      ? `   Las tres guardas de la derivación muerden, cada una por SU invariante, y el\n` +
        `   control prueba que la lista no sale vacía por otro motivo.\n`
      : `   La lista de trabajo de la campaña NO se puede citar hasta que esto salga verde.\n`),
);
ev.informe();
process.exit(fallos === 0 ? 0 : 2);
