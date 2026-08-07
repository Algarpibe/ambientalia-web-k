/**
 * TEST EN NEGATIVO de `tipo-hoja` — cada sabotaje por SU invariante, con control.
 * Uso: npm run qa:tipo-hoja-neg
 *
 * ── Qué hay que poder falsar aquí ─────────────────────────────────────────
 * `tipo-hoja` afirma *«ningún campo pierde marcado de su corpus»*. Esa frase
 * puede ser falsa por cuatro caminos, y **tres de ellos dan cero en vez de
 * error**, que es la familia entera de `CLAUDE.md` §sondas 4:
 *
 *   1 · **que no vea una pérdida que existe** — el fallo obvio: `tipo-plano`;
 *   2 · **que no sepa evaluar un editor y lo dé por bueno** — `editor-opaco`.
 *       Es el defecto original de CMS-SP-TIPO puesto en la propia sonda:
 *       suponer capacidad es fabricar el verde justo donde vive el defecto;
 *   3 · **que el extractor de etiquetas no case con nada** — `detector-muerto`.
 *       Sin marcado que evaluar, TODOS los campos salen «expresables»;
 *   4 · **que una hoja medida no case con ningún campo y eso se lea como
 *       silencio** — `sin-emparejar`. «No lo encontré» y «está bien» no pueden
 *       dar la misma salida.
 *
 * El control corre **primero**: un sabotaje sólo aísla algo si parte de una
 * corrida que ya sale limpia.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "tipo-hoja.mjs");
const salidaDe = (etiqueta) => nombreNeg(`medidas/tipo-hoja-${etiqueta}.json`, etiqueta);

const casos = [
  {
    etiqueta: "tipo-plano",
    exit: 1,
    porQue: "`productos.bullets` como `text` ⇒ el `<sup>` de `R<sup>2</sup>` NO cabe: es CMS-SP-TIPO literal",
    env: { TIPO_SABOTAJE: "productos:bullets=text" },
    salidaTiene: /NO puede expresar: <sup>/,
  },
  {
    etiqueta: "editor-opaco",
    exit: 1,
    porQue: "un `richText` con un editor que la sonda no conoce ⇒ tira, no lo da por expresable",
    env: { TIPO_SABOTAJE: "productos:bullets=richText" },
    salidaTiene: /editor que esta sonda no sabe evaluar/,
  },
  {
    etiqueta: "detector-muerto",
    exit: 2,
    porQue: "un extractor de etiquetas que no casa con nada ⇒ 0 hojas, y 0 no es «todo expresable»",
    env: { ETIQUETA_PATRON: "<zzz-etiqueta-que-no-existe(?=[\\s/>])" },
    salidaTiene: /DETECTOR MUERTO/,
  },
  {
    etiqueta: "sin-emparejar",
    exit: 1,
    porQue: "una hoja medida con marcado que no casa con ningún campo ⇒ DEFECTO, no silencio",
    env: { TIPO_BORRA: "productos:bullets" },
    salidaTiene: /NO casa con ningún campo del esquema/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · tipo-hoja ════════\n`);

const ev = new Evaluadas({ nombre: "tipo-hoja-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* ── EL CONTROL, primero ────────────────────────────────────────────────────
 * Sin sabotaje tiene que salir 0 **y decir cuántas hojas miró**: un control que
 * saliera 0 habiendo evaluado ninguna no distinguiría «todo cabe» de «no miré».*/
const salCtl = salidaDe("control");
if (existsSync(join(QA, salCtl))) rmSync(join(QA, salCtl));
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA], env: { SALIDA: salCtl } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const nHojas = /(\d+) hojas con marcado · (\d+) que su campo NO puede contener/.exec(ctlOut);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!nHojas) malCtl = "no dice cuántas hojas con marcado evaluó";
else if (Number(nHojas[1]) < 1) malCtl = "evaluó 0 hojas: eso no es «todo cabe»";
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL          ${malCtl}`);
} else {
  console.log(`  ✓  CONTROL          exit 0 · ${nHojas[1]} hojas con marcado · ${nHojas[2]} sin caber`);
}

for (const c of casos) {
  const sal = salidaDe(c.etiqueta);
  if (existsSync(join(QA, sal))) rmSync(join(QA, sal));
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: { ...c.env, SALIDA: sal } });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} tipo-hoja · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve una pérdida de marcado, se niega a evaluar un editor que no conoce, no lee un\n` +
        `   extractor muerto como «todo expresable» y no confunde «no lo encontré» con «cabe».\n`
      : `   «Ningún campo pierde marcado de su corpus» NO se puede citar hasta que esto salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
