/**
 * TEST EN NEGATIVO de `cms-teaser` — el falsador **falsado**, con control.
 *
 * `cms-teaser` es lo único que sostiene la decisión §F2-2 · TEASER (*guardar el
 * teaser como dato propio*), y la sostiene por un solo hecho: que `date` sale
 * **DISTINTO**. Un programa que dijera DISTINTO pase lo que pase daría
 * exactamente la misma salida y la decisión estaría apoyada en nada.
 *
 *   · `derivable` — se le da a `date` el **formateador de meses en español** que
 *     la decisión dice que no se puede escribir, así que el teaser y el
 *     documento coinciden. El veredicto tiene que **voltear a FALSADA**. Es el
 *     invariante que hace del falsador un falsador: sabe decir *«me equivoqué»*;
 *   · `sin-pares` — ningún teaser encuentra destino ⇒ **exit 2**. Es la regla del
 *     cero, y la propia sonda la declara: *«0 pares comparables NO es verde»*.
 *
 * ⚠ **Y el `derivable` no es un sabotaje inventado: es la alternativa REAL que
 * la decisión rechazó.** Correrlo prueba dos cosas a la vez — que la sonda sabe
 * fallar, y que *«escribe un formateador y el teaser se deriva»* es una salida
 * técnicamente viable. Que no se tome no es porque no funcione: es que
 * re-formatear **normaliza en silencio las erratas del original**, y el contrato
 * de fidelidad de `CLAUDE.md` §1 lo prohíbe. La decisión es de contrato, no de
 * capacidad, y este fichero es lo que lo demuestra.
 *
 * El **CONTROL**: sin sabotaje, `date` DISTINTO y la decisión SE SOSTIENE. Sin
 * él, los dos negativos los aprobaría una sonda rota de fábrica (F2-1 §5).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ CORREGIDO 2026-08-18 (83.ª) — el caso `derivable` YA NO PUEDE EXIGIR
 * «FALSADA», y la razón es un hecho nuevo del original, no una rebaja.
 *
 * Este negativo se escribió con **3 pares comparables**, cuando el único campo
 * no derivable era `date`. El corpus creció a **34 pares** y con ellos entró un
 * SEGUNDO no derivable con **otra causa**: `entradas-blog.title`, 1 de 18.
 *
 *   teaser →  «Medición de gases en los vertederos de basura»
 *   doc    →  «Contaminación del aire en vertederos: cómo afecta a la calidad del aire»
 *
 * No es un emparejamiento malo ni deriva de captura: el original sirve un
 * **301** (`INDICE.json` → `url` …/medicion-de-gases-en-los-vertederos-de-basura/
 * · `urlFinal` …/contaminacion-del-aire-en-vertederos/). El post se retituló y
 * se re-sluggeó, y el teaser conserva el título de antes.
 *
 * Consecuencia para el sabotaje: neutralizar el formato de la fecha **anula
 * media hipótesis** (§*un sabotaje que anula media hipótesis no falsea nada*),
 * porque la otra mitad la sostiene un 301 que ningún formateador toca. Así que
 * el caso comprueba lo que de verdad compra —**que `date` SALE de la lista**—
 * y lo comprueba también en la salida, con `salidaNoTiene`, para que caiga por
 * su motivo y no por el código de salida.
 *
 * Y el efecto sobre §F2-2 · TEASER es **reforzarla**: ahora se sostiene sobre
 * dos campos con causas independientes, y la segunda ni siquiera es de formato.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Uso: npm run qa:cms-teaser-neg
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "derivable",
    exit: 0,
    porQue: "el formateador de meses vacía el residuo de FORMATO de `date` ⇒ la sonda sabe decir «esto sí se deriva»",
    salidaTiene: /campo\(s\) NO derivables/,
    /**
     * El invariante que este caso compra es **anti-«DISTINTO pase lo que
     * pase»**, y se comprueba sobre EL CAMPO que el sabotaje neutraliza, con
     * el control al lado (§regla 8, *un negativo sin control no es un
     * negativo*): `date` tiene que **bajar de golpe** al ponerle el
     * formateador, y lo que quede **no puede ser de formato**.
     *
     * La segunda mitad es la que lo hace falsable sin cablear un cardinal: el
     * residuo de `date` tiene que caer DENTRO de los pares donde `title`
     * TAMBIÉN difiere — o sea, los que el 301 contaminó. Si el formateador se
     * rompiera, aparecerían residuos en pares con el título idéntico, y el
     * caso caería por eso mismo.
     */
    comprueba: (d, ctl) => {
      const c = d.porCampo?.["entradas-blog.date"];
      const base = ctl?.porCampo?.["entradas-blog.date"];
      if (!c || !base) return "falta porCampo de `entradas-blog.date` en el sabotaje o en el control";
      if (!(c.DISTINTO < base.DISTINTO))
        return `el formateador no neutralizó nada: ${base.DISTINTO} DISTINTO en el control y ${c.DISTINTO} con sabotaje ⇒ la sonda diría DISTINTO pase lo que pase`;
      if (c.IDÉNTICO <= base.IDÉNTICO) return `IDÉNTICO no subió (${base.IDÉNTICO} → ${c.IDÉNTICO})`;
      const conTituloDistinto = new Set(
        d.pares.filter((p) => p.campos?.title?.estado === "DISTINTO").map((p) => p.destino),
      );
      const residuoDeFormato = d.pares
        .filter((p) => p.campos?.date && p.campos.date.estado !== "IDÉNTICO" && p.campos.date.estado !== "POR REGLA")
        .map((p) => p.destino)
        .filter((x) => !conTituloDistinto.has(x));
      if (residuoDeFormato.length)
        return `${residuoDeFormato.length} par(es) con la fecha DISTINTA y el título IGUAL ⇒ residuo de FORMATO que el formateador debía neutralizar: ${residuoDeFormato.join(" · ")}`;
      return null;
    },
  },
  {
    sabotaje: "sin-pares",
    exit: 2,
    porQue: "0 pares comparables ⇒ NO SE PUEDE DECIDIR, y sale por error (regla del cero)",
    salidaTiene: /NO SE PUEDE DECIDIR/,
    comprueba: (d) =>
      d.veredicto?.paresComparables === 0 ? null : `esperaba 0 pares congelados, salió ${d.veredicto?.paresComparables}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-teaser ════════`);
console.log(`  el falsador de §F2-2 · TEASER, falsado — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "cms-teaser-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* Todo por `corridaNegativa`: el desvío a `-neg-` lo pone NEG por construcción,
 * y PISAR no puede llegar al hijo ni exportado. */
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "cms-teaser.mjs")], env, timeout: 300_000 });

/* ── EL CONTROL VA PRIMERO ───────────────────────────────────────────────
 * Reordenado 2026-08-18 (83.ª). Dos razones, y la segunda es la de fondo:
 *   1 · `derivable` necesita la medida SIN sabotaje para poder afirmar que el
 *       formateador **bajó** el nº de DISTINTO. Un sabotaje que se compara
 *       contra un número escrito a mano es el cardinal cableado otra vez;
 *   2 · §regla 8 — el control es lo que decide si los sabotajes significan
 *       algo, así que correrlo el último era dejar para el final la única
 *       comprobación de que el instrumento ejercita lo que dice.
 * ─────────────────────────────────────────────────────────────────────── */
const fCtl = join(QA, nombreNeg("medidas/cms-teaser.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const dCtl = ctl.status === 0 && existsSync(fCtl) ? JSON.parse(readFileSync(fCtl, "utf8")) : null;

for (const c of casos) {
  const fichero = join(QA, `medidas/cms-teaser-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.salidaNoTiene && c.salidaNoTiene.test(out))
    mal = `la salida SIGUE conteniendo ${c.salidaNoTiene}: cayó con el exit correcto y el motivo falso`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")), dCtl);
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(10)}  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(10)}  ${c.porQue}`);
}

/* ── EL VEREDICTO DEL CONTROL ────────────────────────────────────────────
 * Se corrió arriba, antes de los sabotajes. El CONTROL escribe en SU PROPIO
 * nombre POR CONSTRUCCIÓN: `corridaNegativa` pone NEG=control y `w()` desvía
 * la canónica a `-neg-control`. El nombre se DERIVA con `nombreNeg`. */
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else {
  const d = dCtl;
  if (d.veredicto?.decision !== "SE SOSTIENE") malCtl = `veredicto ${d.veredicto?.decision}, esperaba SE SOSTIENE`;
  else if (!d.veredicto.noDerivables.includes("entradas-blog.date"))
    malCtl = `los no derivables son [${d.veredicto.noDerivables}] y "date" no está — la decisión se apoya en ÉL`;
  /* El cardinal se DERIVA del propio veredicto (§regla 9, 7.º caso). Aquí
   * estuvo escrito `1 campo(s)` y el corpus pasó de 3 pares comparables a 34:
   * con ellos entró un SEGUNDO no-derivable, y el control salió rojo por un
   * número recordado en vez de por su invariante. Lo que hay que comprobar es
   * que la salida y el JSON DIGAN LO MISMO (§sondas 1, un solo canal de
   * verdad), no que el número sea uno concreto. */
  else if (!new RegExp(`${d.veredicto.noDerivables.length} campo\\(s\\) NO derivables`).test(ctlOut))
    malCtl = `la salida no dice los ${d.veredicto.noDerivables.length} campos que el JSON declara no derivables`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL    (sin sabotaje)  ${malCtl}`); }
else console.log(`  ✓  CONTROL    (sin sabotaje)  \`date\` DISTINTO ⇒ la decisión SE SOSTIENE`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-teaser · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El falsador sabe falsar: el formateador de meses lleva \`date\` de\n` +
        `   ${dCtl?.porCampo?.["entradas-blog.date"]?.DISTINTO ?? "?"} DISTINTO a ${JSON.parse(readFileSync(join(QA, "medidas/cms-teaser-neg-derivable.json"), "utf8")).porCampo?.["entradas-blog.date"]?.DISTINTO ?? "?"}, o sea que la sonda NO dice DISTINTO pase lo que pase.\n` +
        `   §F2-2 · TEASER es una decisión de CONTRATO (fidelidad verbatim) en el eje de\n` +
        `   la FECHA — reformatear normalizaría las erratas del original.\n` +
        `   Y desde la 83.ª se sostiene además por una vía que NINGÚN formateador toca:\n` +
        `   \`title\` (1 de 18), donde el original sirve un 301 y el teaser conserva el\n` +
        `   título de antes del cambio de slug.\n`
      : `   §F2-2 · TEASER NO se puede citar como medida hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
