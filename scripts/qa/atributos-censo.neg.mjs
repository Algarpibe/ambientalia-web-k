/**
 * TEST EN NEGATIVO · atributos-censo
 *
 * | sabotaje | qué tiene que pasar | qué taparía si no |
 * |---|---|---|
 * | `lector-muerto` | 0 aperturas ⇒ **LECTOR MUERTO, rojo** | «el corpus no tiene atributos», que es un cero del lector leído como dato |
 * | `lector-ubicuo` | todo ubicuo ⇒ **UBICUO, rojo** | un lector que casa en TODAS las páginas y por tanto no discrimina nada |
 * | `control` | ✅ N atributos · 6 familias censadas · las 4 peligrosas a CERO | — |
 * | `sin-NEG` | un sabotaje lanzado A MANO desvía él solo | un fichero con nombre de censo y contenido de sabotaje (§regla 7) |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ POR QUÉ ESTE NEGATIVO IMPORTA MÁS QUE LA MEDIA — de aquí sale una WHITELIST
 *
 * `atributos-censo` no es un censo cualquiera: **es la fuente de
 * `ATRIBUTOS_CENSADOS`**, y de esa lista depende qué contenido servido se puede
 * rechazar sin perderlo. Sus dos ceros deciden en direcciones opuestas:
 *
 * · un cero de MÁS —el lector no casa— produciría una whitelist corta, y el
 *   saneador tiraría contenido bueno del corpus;
 * · un cero de MENOS —«las 4 familias peligrosas salen a 0»— es literalmente el
 *   argumento que autoriza a que rechazar vaya en la dirección que grita. Si ese
 *   0 fuera del instrumento y no del dato, la autorización sería falsa.
 *
 * Por eso el `control` no se conforma con el código de salida: **exige que las
 * cuatro familias peligrosas estén CENSADAS y a cero, y que las que sí existen
 * —`style`— tengan su número.** Un censo que las diera todas a 0 porque no las
 * mira daría exactamente el mismo exit que uno que las mide.
 *
 * ── El caso que hay que acordarse de escribir: `lector-ubicuo` ────────────────
 * `lector-muerto` es «¿sabe decir que no ha mirado?». `lector-ubicuo` es su
 * COMPLEMENTARIO: *un patrón que casa en TODAS tampoco mide nada, y encima
 * parece un dato* (§sondas 4). Sin él, la mitad de la regla del cero que protege
 * del PLENO no la vigila nadie.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ ALCANCE: esto prueba las guardas del CENSO. NO prueba que la whitelist
 * derivada sea correcta —eso lo dice el censo mismo, con su denominador— ni que
 * `validaHtmlCorpus` la aplique bien, que es otra sonda y otra afirmación.
 */
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/atributos-censo.json";
const SONDA = join(QA, "atributos-censo.mjs");

/** Las que el censo mide a CERO y que autorizan a rechazar en la dirección que grita. */
const PELIGROSAS = ["manejador-on*", "url-javascript:", "url-data:", "srcdoc"];

const casos = [
  {
    etiqueta: "control",
    porQue: "el censo mide, las 6 familias están censadas y las 4 peligrosas salen a CERO con su número",
    env: {},
    exit: 0,
    salidaTiene: /atributos distintos/,
    comprueba: (j) => {
      if (!(j.recuento?.aperturas > 0)) return `${j.recuento?.aperturas} aperturas: el lector no casó`;
      if (!(j.recuento?.atributosDistintos > 0)) return "0 atributos distintos";
      /* §regla 22: «no hay peligrosas» es un booleano y sale `true` igual si no
       * se miran. Se exige que estén CENSADAS —la clave existe— y a cero. */
      for (const f of PELIGROSAS) {
        if (!(f in (j.familias ?? {}))) return `la familia \`${f}\` no está censada: su cero sería del informe, no del dato`;
        if (j.familias[f].n !== 0) return `\`${f}\` sale a ${j.familias[f].n}: rechazar YA cuesta contenido servido, y eso es una decisión`;
      }
      /* Y el control del control: una familia que SÍ existe tiene que tener su
       * número. Si todas salieran a 0, el cero sería del lector (§sondas 4). */
      if (!(j.familias?.style?.n > 0))
        return "`style` sale a 0: si NINGUNA familia tiene número, los ceros de las peligrosas son del lector";
      return null;
    },
  },
  {
    etiqueta: "lector-muerto",
    porQue: "0 aperturas ⇒ LECTOR MUERTO en rojo, no «el corpus no tiene atributos»",
    env: { SABOTAJE: "lector-muerto" },
    exit: 2,
    salidaTiene: /LECTOR MUERTO/,
    comprueba: (j) => (j.recuento?.aperturas === 0 ? null : `el sabotaje dejó ${j.recuento?.aperturas} aperturas`),
  },
  {
    etiqueta: "lector-ubicuo",
    porQue: "todo ubicuo ⇒ UBICUO en rojo — el complementario del cero: casar en TODAS tampoco mide nada",
    env: { SABOTAJE: "lector-ubicuo" },
    exit: 2,
    salidaTiene: /UBICUO:/,
    comprueba: (j) =>
      j.recuento?.atributosDistintos > 0
        ? null
        : "el sabotaje vació el censo en vez de hacerlo ubicuo: caería por LECTOR MUERTO, o sea por otra cosa (0 separadoras)",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · atributos-censo ════════`);
console.log(`  alcance: las guardas del CENSO (lector muerto · patrón ubicuo · desvío del sabotaje).`);
console.log(`  NO cubre: que la whitelist derivada sea correcta, ni que \`validaHtmlCorpus\` la aplique bien —`);
console.log(`            son otras dos afirmaciones y ninguna la contesta este fichero\n`);

/* §regla 1: los casos son `casos.length` **+ 1** — el de `sin-NEG`. */
const ev = new Evaluadas({ nombre: "atributos-censo-neg", unidad: "sabotajes", minimo: casos.length + 1 });

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

/* ══════════════════════════════════════════════════════════════════════════
 * §regla 24 · EL SABOTAJE SIN `NEG=`
 *
 * Los tres de arriba corren por `corridaNegativa`, que pone `NEG=<etiqueta>`; con
 * eso `w()` desvía él solo y el canónico nunca está en peligro — o sea que
 * **ninguno puede ejercitar la guarda de §regla 24**: 0 separadoras.
 *
 * ⚠ Y aquí el desvío es NUEVO (97.ª). Antes, un `SABOTAJE=… node
 * atributos-censo.mjs` a mano dejaba un fichero fechado y sin marcar. En este
 * censo eso sale especialmente caro: es la fuente de `ATRIBUTOS_CENSADOS`, así
 * que leerlo saboteado produce una whitelist con la autoridad de una congelada.
 * ═════════════════════════════════════════════════════════════════════════ */
const canon = join(QA, CANONICA);
const antes = existsSync(canon) ? statSync(canon).mtimeMs : null;
const suelta = corridaNegativa({ etiqueta: "sin-NEG", args: [SONDA], env: { SABOTAJE: "lector-muerto" }, timeout: 600_000 });
const salidaSuelta = (suelta.stdout || "") + (suelta.stderr || "");
if (suelta.error || suelta.status === null) ev.fallo("sin-NEG", suelta.error || "no llegó a correr");
else ev.ok();
let malSuelta = null;
if (antes === null) malSuelta = "no existe el canónico: corre `npm run qa:atributos-censo` antes";
else if (statSync(canon).mtimeMs !== antes) malSuelta = "la corrida SABOTEADA tocó el fichero CANÓNICO";
else if (JSON.parse(readFileSync(canon, "utf8")).meta?.sabotaje)
  malSuelta = "el canónico lleva `meta.sabotaje`: es una whitelist falsa con autoridad de congelada";
else if (!/la salida se desvía a/.test(salidaSuelta)) malSuelta = "la sonda no dijo en voz alta que desviaba";
if (malSuelta) { fallos++; console.log(`  ❌ ${"sin-NEG".padEnd(16)}       ${malSuelta}`); }
else
  console.log(
    `  ✓  ${"sin-NEG".padEnd(16)}       cayó por lo suyo: un sabotaje lanzado a mano DESVÍA solo — el canónico intacto\n` +
      `${" ".repeat(28)}└ §regla 24: los otros ${casos.length} casos no pueden ejercitar esto (NEG= ya desvía), o sea 0 separadoras`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} atributos-censo · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Las dos mitades de la regla del cero están vigiladas: un lector que no casa sale\n` +
        `   por error, y uno que casa en TODAS también. Y el «0 manejadores \`on*\`» que\n` +
        `   autoriza a rechazar en la dirección que grita es un cero MEDIDO — la familia\n` +
        `   está censada y \`style\` tiene su número al lado para probarlo.\n`
      : `   \`ATRIBUTOS_CENSADOS\` no se puede citar como derivado hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
