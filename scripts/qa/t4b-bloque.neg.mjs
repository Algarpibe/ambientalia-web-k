/**
 * TEST EN NEGATIVO de `t4b-bloque` — cada sabotaje por SU invariante, con control.
 * Uso: npm run qa:t4b-bloque-neg
 *
 * ── Qué hay que poder falsar aquí, y son TRES cosas, no una ──────────────
 * `t4b-bloque` afirma *«fuera de los bloques declarados no cambió un byte, y
 * dentro cada bloque está adjudicado a su clase»*. Esa frase puede ser falsa
 * por tres caminos que no se parecen:
 *
 *   1 · **que no vea un cambio en el RESTO** — el fallo obvio, y el que hace
 *       inútil toda la sonda: `resto-alterado` y `sin-par`;
 *   2 · **que el patrón de una clase no case con lo que hay** — el cero y el
 *       pleno de `CLAUDE.md` §sondas 4: `patron-muerto` y `patron-sobrecasado`.
 *       Un patrón muerto no da error, da **varianza cero**;
 *   3 · **que el patrón se ENSANCHE hasta tragarse la regresión** — el fallo
 *       PROPIO de este diseño, y el más peligroso, porque *fabrica* el verde en
 *       vez de perderlo. Lo cubre `patron-ensanchado`, y es el único caso que
 *       las guardas de recuento **no pueden ver**: un patrón más ancho casa el
 *       mismo número de veces y la identidad de bytes se cumple por
 *       construcción del `replace`.
 *
 * Sin el grupo 3, «el resto está a cero» sería una etiqueta y no una medida:
 * bastaría estirar un patrón para que cualquier regresión saliera del alcance
 * de la puerta sin que ningún número se moviera.
 *
 * ── Y el que NO es un sabotaje: el CONTROL ────────────────────────────────
 * Sin sabotaje tiene que salir exit 0 **y haber comparado las 10 rutas**. Un
 * control que saliera 0 comparando una sola no distingue «todo igual» de «casi
 * nada mirado» — la regla del cero aplicada al propio negativo (§sondas 8a: un
 * sabotaje que no cambia el resultado no ha probado la guarda).
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

import { corridaNegativa, Evaluadas, nombreNeg, QA, w } from "./lib.mjs";

/**
 * ⚠ **LA BASE SE MIDE, NO SE HEREDA DEL PROYECTO (2026-08-06, misma tanda).**
 *
 * La primera versión usaba `medidas/t4b-bloque-antes.json`, o sea el estado
 * **anterior a la migración**. En cuanto `/[slug]` se landó, esa base dejó de
 * describir el build: los patrones `antes` ya no casan con nada y **sabotearlos
 * no cambia el resultado**. Salieron verdes `patron-muerto` y
 * `patron-ensanchado` — §sondas 8a con todas sus letras: *un sabotaje que no
 * cambia el resultado no ha probado la guarda, ha probado que el instrumento no
 * la ejercita*.
 *
 * La base se mide al empezar, contra el build de ahora, y **el lado que se
 * sabotea se DERIVA** de cuál tiene bloques — que es lo que hace que este
 * negativo siga valiendo cuando la familia cambie otra vez.
 */
const SONDEO = "control-base";
const ARCH = nombreNeg(`medidas/t4b-bloque-${SONDEO}.json`, SONDEO);
corridaNegativa({
  etiqueta: SONDEO,
  args: [join(QA, "t4b-bloque.mjs"), SONDEO],
  env: { CLON: process.env.CLON ?? "" },
});
const rutaBase = join(QA, ARCH);
if (!existsSync(rutaBase)) {
  console.error(
    `\n❌ SIN BASE — la corrida de sondeo no dejó ${ARCH}.\n` +
      `   Comparar contra una congelada de otra fase haría que los sabotajes dejaran de\n` +
      `   sabotear en cuanto el proyecto avanzara, y su verde se leería como «lo cazó».`,
  );
  process.exit(2);
}
const BASE = ARCH;
const base = JSON.parse(readFileSync(rutaBase, "utf8"));
const rutas = Object.keys(base.paginas);

/* ── La diana se DERIVA: una ruta que SÍ tiene bloques declarados ───────────
 * Sobre una ruta sin bloques, `patron-ensanchado` no tendría nada que
 * ensanchar y su verde se leería como «la sonda lo cazó» (regla 8a). */
const conBloques = rutas.filter((r) => (base.paginas[r].bloques ?? []).length > 0);
const sinBloques = rutas.filter((r) => !(base.paginas[r].bloques ?? []).length);
if (!conBloques.length || !sinBloques.length) {
  console.error(
    `\n❌ SIN DIANA — hacen falta rutas CON bloques (${conBloques.length}) y SIN ellos (${sinBloques.length}).\n` +
      `   Sin las dos, los sabotajes no aíslan lo que dicen aislar.`,
  );
  process.exit(2);
}
const dianaConBloque = conBloques[0];
const dianaSinBloque = sinBloques[0];

/**
 * **El LADO que se sabotea se DERIVA del build**, no se escribe. Un patrón del
 * lado que hoy no existe no tiene nada que matar, así que su sabotaje sería
 * inerte y su verde, falso.
 */
const bloques = rutas.flatMap((r) => base.paginas[r].bloques ?? []);
const conSustitucion = bloques.find((b) => b.clase === "fb3d");
if (!conSustitucion) {
  console.error(
    `\n❌ SIN DIANA — no hay ningún bloque \`fb3d\` en el build de ahora.\n` +
      `   Los sabotajes de patrón necesitan una clase con instancia: sin ella no saborean nada.`,
  );
  process.exit(2);
}
const LADO = conSustitucion.lado; // "antes" o "despues", según cómo esté el build
/* El patrón real de ese lado, y el ENSANCHADO que se traga el `<p>` siguiente.
 * Se escriben los dos porque el segundo tiene que ser el primero MÁS algo: si
 * fueran independientes, el caso no probaría el ensanchamiento sino otro patrón. */
const PATRON = {
  antes: "<div\\b[^>]*_3d-flip-book[^>]*>\\s*</div>(?:\\s*<script\\b[^>]*>[\\s\\S]*?</script>)+",
  despues: '<p><a href="[^"]*"\\s+data-media="[^"]*">[^<]*</a></p>',
}[LADO];
const ENSANCHADO = `${PATRON}\\s*<p>[\\s\\S]*?</p>`;

/** Una base derivada de la congelada, con la mutación pedida. */
function fabricaBase(etiqueta, muta) {
  const b = JSON.parse(JSON.stringify(base));
  muta(b);
  const destino = `medidas/t4b-bloque-neg-${etiqueta}-base.json`;
  w(destino, b, { pisar: true });
  return destino;
}

const casos = [
  {
    etiqueta: "resto-alterado",
    exit: 1,
    porQue: `${dianaSinBloque} con otro RESTO ⇒ regresión FUERA de todo bloque: es la puerta`,
    base: () => fabricaBase("resto-alterado", (b) => { b.paginas[dianaSinBloque].restoSha = "0".repeat(16); }),
    salidaTiene: /RESTO alterado/,
  },
  {
    /* Y el que de verdad justifica la sonda: la regresión está en una ruta que
     * ADEMÁS tiene un bloque sustituido. Medir la ruta entera la habría tapado;
     * medir el resto aparte la enseña. */
    etiqueta: "resto-alterado-bajo-sustitucion",
    exit: 1,
    porQue: `${dianaConBloque} — regresión en el resto de una ruta CON sustitución: lo que el hash de la ruta taparía`,
    base: () => fabricaBase("resto-alterado-bajo-sustitucion", (b) => { b.paginas[dianaConBloque].restoSha = "0".repeat(16); }),
    salidaTiene: /RESTO alterado/,
  },
  {
    etiqueta: "sin-par",
    exit: 1,
    porQue: "una ruta que la congelada no trae ⇒ NO se comparó, y un no-comparado no es un verde",
    base: () => fabricaBase("sin-par", (b) => { delete b.paginas[dianaSinBloque]; }),
    salidaTiene: /sin par en la congelada/,
  },
  {
    etiqueta: "patron-muerto",
    exit: 1,
    porQue: "el patrón de `fb3d` no casa con nada ⇒ varianza cero, no un cero (§sondas 4)",
    base: () => BASE,
    env: { T4B_PATRON: `fb3d:${LADO}:<div class="NO-EXISTE-EN-NINGUNA-PAGINA"></div>` },
    salidaTiene: /fb3d: hallados 0 \(antes 0 · después 0\), esperados [1-9]/,
  },
  {
    etiqueta: "patron-sobrecasado",
    exit: 1,
    porQue: "el patrón de `fb3d` casa con cualquier `<div>` ⇒ el pleno, que también mide otra cosa",
    base: () => BASE,
    env: { T4B_PATRON: `fb3d:${LADO}:<${LADO === "antes" ? "div" : "p"}\\b[^>]*>` },
    salidaTiene: /fb3d: hallados \d+ \(antes \d+ · después \d+\), esperados/,
  },
  {
    /* ⚠ EL CASO QUE JUSTIFICA LA GUARDA DE ANCHURA. El patrón se estira hasta
     * llevarse el `<p>` siguiente: el RECUENTO no se mueve (sigue casando una
     * vez por página) y la identidad de bytes se cumple igual, así que las dos
     * guardas obvias salen VERDES. La única que muerde es la de contenido. */
    etiqueta: "patron-ensanchado",
    exit: 1,
    porQue: "el patrón se traga el `<p>` siguiente ⇒ saca marcado de la puerta SIN mover ningún recuento",
    base: () => BASE,
    env: { T4B_PATRON: `fb3d:${LADO}:${ENSANCHADO}` },
    salidaTiene: /invaden CUERPO\s+1|se llevó p/,
  },
  {
    etiqueta: "gancho-invalido",
    exit: 2,
    porQue: "un sabotaje mal escrito TIRA en vez de correr sin sabotear (§sondas 8a)",
    base: () => BASE,
    env: { T4B_PATRON: "clase-que-no-existe:antes:x" },
    salidaTiene: /desconocidos/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · t4b-bloque ════════\n`);
console.log(`  base: ${BASE} (${rutas.length} rutas)`);
console.log(`  diana CON bloque: ${dianaConBloque}`);
console.log(`  diana SIN bloque: ${dianaSinBloque}\n`);

const ev = new Evaluadas({ nombre: "t4b-bloque-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const ficheroDe = (etiqueta) => join(QA, nombreNeg(`medidas/t4b-bloque-${etiqueta}.json`, etiqueta));
const borra = (etiqueta) => { const f = ficheroDe(etiqueta); if (existsSync(f)) rmSync(f); };

for (const c of casos) {
  borra(c.etiqueta);
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "t4b-bloque.mjs"), c.etiqueta, "--cmp", c.base()],
    env: { CLON: process.env.CLON ?? "", ...(c.env ?? {}) },
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(32)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(32)} ${c.porQue}`);
}

/* ── EL CONTROL, con su exigencia de alcance ───────────────────────────────
 * exit 0 **y** las 10 rutas comparadas. Sin la segunda mitad, un control verde
 * no distingue «el resto está a cero» de «no se comparó casi nada». */
borra("control");
const ctl = corridaNegativa({
  etiqueta: "control",
  args: [join(QA, "t4b-bloque.mjs"), "control", "--cmp", BASE],
  env: { CLON: process.env.CLON ?? "" },
});
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!new RegExp(`evaluadas ${rutas.length}/${rutas.length} rutas`).test(ctlOut))
  malCtl = `no dice «evaluadas ${rutas.length}/${rutas.length} rutas»`;
else if (!/con el RESTO alterado \.+\s+0/.test(ctlOut)) malCtl = `no dice «con el RESTO alterado … 0»`;
if (malCtl) { fallos++; console.log(`  ❌ ${"CONTROL".padEnd(32)} ${malCtl}`); }
else console.log(`  ✓  ${"CONTROL".padEnd(32)} exit 0 · ${rutas.length} rutas · RESTO a cero`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} t4b-bloque · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve una regresión en el resto —incluida la que va BAJO una sustitución, que es\n` +
        `   la que el hash de la ruta taparía—, ve una ruta que falta, rechaza un patrón\n` +
        `   muerto y uno sobrecasado, y RECHAZA UN PATRÓN ENSANCHADO: la única forma que\n` +
        `   tenía este diseño de dar verde siempre.\n`
      : `   «Fuera de los bloques no cambió un byte» NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
