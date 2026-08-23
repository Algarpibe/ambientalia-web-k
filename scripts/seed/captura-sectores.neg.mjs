/**
 * TEST EN NEGATIVO · captura-sectores
 *
 * | sabotaje | qué tiene que pasar | qué taparía si no |
 * |---|---|---|
 * | `lista-corta` | 3 de 8 ⇒ **TIRA** | «ninguna trae `<sub>`» cierto de la muestra y falso del original |
 * | `colision` | dos URLs al mismo fichero ⇒ **TIRA** | 8 páginas pedidas y 1 en disco, con el informe diciendo 8 |
 * | `cero-evaluadas` | 0 `ev.ok()` ⇒ **NO SE PUDO EVALUAR** | «8 páginas» impreso al lado de 0 evaluadas (§regla 1) |
 * | `control` | ✅ 8 URLs derivadas, ninguna repetida | — |
 * | `indice-intacto` | un sabotaje NO toca `corpus/fase-3-sectores/INDICE.json` | un índice con fecha de hoy y recuento de sabotaje |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ SIN RED, Y NO ES UNA COMODIDAD — §regla 8, el control
 *
 * Los tres sabotajes se ejercitan **sin pedirle nada al original**, y por dos
 * caminos distintos que hay que declarar porque no son el mismo:
 *
 * · `lista-corta` y `colision` muerden en la DERIVACIÓN, o sea antes del corte
 *   de `SOLO_DERIVA=1`. Ésos nunca tocarían la red;
 * · `cero-evaluadas` muerde en la CAMPAÑA, después del corte. Corre offline
 *   **porque las 8 páginas ya están en `corpus/fase-3-sectores/`** y la campaña
 *   las reutiliza («una vez por página ENTRE corridas»). Si alguien las borrara,
 *   este caso pediría al original — así que el negativo lo COMPRUEBA antes y se
 *   niega a correr si no están, en vez de pegarle al original sin avisar.
 *
 * ── El caso que hay que acordarse de escribir: `indice-intacto` ───────────
 * Los tres de arriba son «¿sabe decir que no ha mirado?». Éste es de HIGIENE, y
 * es el que ninguno de los otros puede ejercitar: de los cuatro, **sólo
 * `cero-evaluadas` llega a escribir índice** —los demás salen antes— y ninguno
 * lo comprueba. La campaña no congela por `w()` —escribe en `corpus/`, que
 * ninguna guarda vigila—, así que sin este caso el desvío no lo mira nadie y su
 * ausencia habría reescrito el índice real con fecha de hoy y recuento de
 * sabotaje: un fichero con nombre de artefacto bueno y contenido de sabotaje.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ ALCANCE: esto NO prueba la captura contra el original. Prueba las guardas
 * de POBLACIÓN y de HIGIENE. Que los bytes bajados sean los del original lo
 * dice el `sha256` del índice, y eso es otra afirmación.
 */
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

const RAIZ = join(QA, "../..");
const SONDA = join(QA, "../seed/captura-sectores.mjs");
const BASE = join(RAIZ, "corpus/fase-3-sectores");
const INDICE = join(BASE, "INDICE.json");
const LISTADO = join(RAIZ, "corpus/fase-3/listados/sectores/index.html");

console.log(`\n════════ TEST EN NEGATIVO · captura-sectores ════════`);
console.log(`  alcance: las guardas de POBLACIÓN (lista, colisión, contrato) y de HIGIENE (desvío).`);
console.log(`  NO cubre: que los bytes capturados sean los del original — eso lo dice el sha256.`);

/* §regla 8: un negativo sin su precondición comprobada no es un negativo — sería
 * un caso que pide al original creyendo que corre offline. */
if (!existsSync(LISTADO)) {
  console.error(`\n❌ falta ${LISTADO.slice(RAIZ.length + 1)} — la derivación no tiene de dónde salir.`);
  process.exit(2);
}
const enDisco = existsSync(BASE) ? readdirSync(BASE).filter((f) => f.endsWith(".html")).length : 0;
if (enDisco < 8) {
  console.error(
    `\n❌ sólo ${enDisco} de 8 páginas en corpus/fase-3-sectores/.\n` +
      `   El caso \`cero-evaluadas\` corre offline PORQUE la campaña las reutiliza. Con menos,\n` +
      `   pediría al original — y un negativo no le pega al original a escondidas.`,
  );
  process.exit(2);
}
console.log(`  precondición: ${enDisco}/8 páginas en disco ⇒ la campaña reutiliza y NO pide nada\n`);

const casos = [
  {
    etiqueta: "control",
    porQue: "8 URLs derivadas del listado congelado, ninguna repetida, sin pedir nada",
    env: { SOLO_DERIVA: "1" },
    exit: 0,
    salidaTiene: /páginas\s+8/,
    y: (out) => (/no se ha pedido nada al original/.test(out) ? null : "no declaró que no pidió nada"),
  },
  {
    etiqueta: "lista-corta",
    porQue: "3 de 8 ⇒ TIRA, no un veredicto de una población recortada",
    env: { SOLO_DERIVA: "1", SABOTAJE: "lista-corta" },
    exit: 1,
    salidaTiene: /la derivación da 3 páginas .* y el original tiene 8/s,
  },
  {
    etiqueta: "colision",
    porQue: "dos URLs al mismo fichero ⇒ TIRA, no 8 pedidas y 1 en disco",
    env: { SOLO_DERIVA: "1", SABOTAJE: "colision" },
    exit: 1,
    salidaTiene: /COLISIÓN:/,
  },
  {
    etiqueta: "cero-evaluadas",
    porQue: "0 ev.ok() ⇒ NO SE PUDO EVALUAR, no «8 páginas» impreso al lado de 0 evaluadas",
    env: { SABOTAJE: "cero-evaluadas" },
    exit: 1,
    salidaTiene: /NO SE PUDO EVALUAR|evaluadas 0\/8/,
    /* §regla 8a, el control del propio caso: si el sabotaje no llegase a la
     * campaña, este caso caería por otra cosa y su verde no diría nada. */
    y: (out) => (/↺ .*\(en disco\)/.test(out) ? null : "no llegó a la campaña: el caso no ejercita el contrato"),
  },
];

const ev = new Evaluadas({ nombre: "captura-sectores-neg", unidad: "sabotajes", minimo: casos.length + 1 });
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
  if (!mal && c.y) mal = c.y(out);
  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * HIGIENE · el índice REAL no lo toca ningún sabotaje
 *
 * Se mide con el `mtime` y con el contenido: las cuatro corridas de arriba han
 * pasado ya, así que si alguna hubiera escrito el índice real, aquí se ve.
 * ═════════════════════════════════════════════════════════════════════════ */
const antes = existsSync(INDICE) ? { mtime: statSync(INDICE).mtimeMs, txt: readFileSync(INDICE, "utf8") } : null;
const suelta = corridaNegativa({ etiqueta: "indice-intacto", args: [SONDA], env: { SABOTAJE: "cero-evaluadas" }, timeout: 300_000 });
const salidaSuelta = (suelta.stdout || "") + (suelta.stderr || "");
if (suelta.error || suelta.status === null) ev.fallo("indice-intacto", suelta.error || "no llegó a correr");
else ev.ok();

let malSuelta = null;
if (!antes) malSuelta = "no existe corpus/fase-3-sectores/INDICE.json: corre `npm run cms:captura-sectores` antes";
else if (statSync(INDICE).mtimeMs !== antes.mtime || readFileSync(INDICE, "utf8") !== antes.txt)
  malSuelta = "una corrida SABOTEADA reescribió el índice REAL";
else if (!/el índice se desvía a/.test(salidaSuelta)) malSuelta = "la campaña no dijo en voz alta que desviaba";
else {
  const desviado = join(BASE, "INDICE-neg-cero-evaluadas.json");
  if (!existsSync(desviado)) malSuelta = "no escribió el índice desviado: el desvío no llegó a ocurrir";
  else if (JSON.parse(readFileSync(desviado, "utf8")).meta?.sabotaje !== "cero-evaluadas")
    malSuelta = "el índice desviado no lleva `meta.sabotaje`: no se distingue de uno bueno por su contenido";
  else rmSync(desviado);
}
if (malSuelta) { fallos++; console.log(`  ❌ ${"indice-intacto".padEnd(16)}       ${malSuelta}`); }
else
  console.log(
    `  ✓  ${"indice-intacto".padEnd(16)}       cayó por lo suyo: el sabotaje desvía y marca su JSON — el índice real intacto\n` +
      `${" ".repeat(28)}└ de los otros ${casos.length}, sólo \`cero-evaluadas\` LLEGA a escribir índice —los demás\n` +
      `${" ".repeat(28)}  salen antes— y ninguno lo comprueba: sin este caso, el desvío no lo mira nadie`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura-sectores · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La población se DERIVA y una lista corta TIRA en vez de dar un veredicto de\n` +
        `   muestra con cara de veredicto de original; dos URLs no pueden caer en el mismo\n` +
        `   fichero; y un sabotaje no reescribe el índice de la campaña buena.\n`
      : `   El corpus de \`fase-3-sectores\` no vale para auditar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
