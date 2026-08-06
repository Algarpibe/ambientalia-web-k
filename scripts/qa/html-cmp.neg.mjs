/**
 * TEST EN NEGATIVO de `html-cmp` — cada sabotaje por SU invariante, con control.
 * Uso: npm run qa:html-cmp-neg
 *
 * ── Qué hay que poder falsar aquí, y son DOS cosas distintas ──────────────
 * `html-cmp` afirma *«el HTML servido es el mismo byte a byte»*. Esa frase
 * puede ser falsa por dos caminos que no se parecen:
 *
 *   1 · **que no vea una diferencia que existe** — el fallo obvio, y el que
 *       cubren `visible-alterado`, `filas-alteradas`, `ruta-fantasma` y `base-vacia`;
 *   2 · **que la NORMALIZACIÓN se coma la diferencia** — el fallo propio de
 *       esta sonda y el más peligroso, porque *fabrica* el verde en vez de
 *       perderlo: un volátil corto o frecuente borra contenido real **de los
 *       dos lados** y los iguala. Lo cubren `volatil-corto` y `volatil-ubicuo`.
 *
 * Sin el grupo 2, «byte a byte» sería una etiqueta y no una medida: bastaría un
 * volátil mal elegido para que las 31 rutas salieran idénticas siempre.
 *
 * El sabotaje `volatil-ubicuo` **deriva su cadena del HTML prerenderizado de
 * disco** (`.next/server/app/*.html`) en vez de escribir una a mano: una cadena
 * cableada deja de ser frecuente en cuanto cambie el marcado, y entonces el
 * sabotaje no sabotea nada y se lee como «la sonda lo cazó».
 */
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, APP, nombreNeg, QA, w } from "./lib.mjs";

const BASE = "medidas/html-f23-base.json";
const base = JSON.parse(readFileSync(join(QA, BASE), "utf8"));
const rutasBase = Object.keys(base.paginas);

/* ── La cadena UBICUA se deriva del artefacto, no se escribe ──────────────── */
const dirHtml = join(APP, ".next/server/app");
const ficheroHtml = existsSync(dirHtml)
  ? readdirSync(dirHtml).filter((f) => f.endsWith(".html") && !f.startsWith("_")).sort()[0]
  : null;
if (!ficheroHtml) {
  console.error(`\n❌ SIN DIANA — no hay HTML prerenderizado en ${dirHtml}. ¿Falta \`npm run build\`?`);
  process.exit(2);
}
const htmlDisco = readFileSync(join(dirHtml, ficheroHtml), "utf8");
/**
 * La ventana de 8 caracteres —el largo mínimo que la guarda acepta— que más
 * bytes del documento cubre. **Se calcula, no se elige**: una cadena escrita a
 * mano deja de ser frecuente en cuanto cambie el marcado, y entonces el
 * sabotaje no sabotea y su verde se lee como «la sonda lo cazó».
 */
const LARGO = 8;
const cuenta = new Map();
for (let i = 0; i + LARGO <= htmlDisco.length; i++) {
  const s = htmlDisco.slice(i, i + LARGO);
  cuenta.set(s, (cuenta.get(s) || 0) + 1);
}
const [cad, veces] = [...cuenta].sort((a, b) => b[1] - a[1])[0] ?? [];
const ubicua = cad ? { c: cad, n: veces } : null;
if (!ubicua || ubicua.n * ubicua.c.length <= Buffer.byteLength(htmlDisco) * 0.01) {
  console.error(
    `\n❌ SIN DIANA para 'volatil-ubicuo' — ninguna candidata de ≥8 caracteres supera el 1 % de ${ficheroHtml}.\n` +
      `   El sabotaje no llegaría a existir, y eso da la misma salida que «la sonda lo cazó».`,
  );
  process.exit(2);
}

/** Una base derivada de la congelada, con la mutación pedida. */
function fabricaBase(etiqueta, muta) {
  const b = JSON.parse(JSON.stringify(base));
  muta(b);
  const destino = `medidas/html-cmp-neg-${etiqueta}-base.json`;
  w(destino, b, { pisar: true });
  return destino;
}

/**
 * La diana se elige DERIVANDO, y con una condición: que no sea una de las rutas
 * que hoy difieren de verdad por el reparto del stream (las de la familia
 * migrada). Si la diana fuese una de ésas, el sabotaje y el fenómeno real se
 * mezclarían y el caso dejaría de aislar nada.
 */
const repartoReal = new Set(
  Object.keys(base.paginas).filter((r) => r.startsWith("/faqs/")),
);
const rutaDiana = rutasBase.find((r) => r !== "/" && !repartoReal.has(r)) ?? rutasBase[0];

const casos = [
  {
    etiqueta: "visible-alterado",
    exit: 1,
    porQue: `${rutaDiana} con otro \`visible\` ⇒ es lo que ve el visitante: DEFECTO, no reparto`,
    base: () =>
      fabricaBase("visible-alterado", (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].visible = "0".repeat(16);
      }),
    salidaTiene: /visible DISTINTO/,
  },
  {
    etiqueta: "filas-alteradas",
    exit: 1,
    porQue: "el marcado visible casa pero la carga RSC no ⇒ tampoco es reparto: DEFECTO",
    base: () =>
      fabricaBase("filas-alteradas", (b) => {
        b.paginas[rutaDiana].normalizado = "0".repeat(16);
        b.paginas[rutaDiana].filas = "0".repeat(16);
      }),
    salidaTiene: /filas RSC DISTINTAS/,
  },
  {
    /* ⚠ El complementario de los dos de arriba, y el que evita que «sólo
     * reparto» se vuelva un cajón de sastre: con `visible` y `filas` iguales, un
     * `normalizado` distinto tiene que salir VERDE **y contarse aparte**. Si
     * esto saliera rojo, los tres niveles no serían tres niveles: serían uno. */
    etiqueta: "solo-reparto",
    exit: 0,
    porQue: "visible y filas iguales, documento distinto ⇒ verde, pero CONTADO como reparto",
    base: () => fabricaBase("solo-reparto", (b) => (b.paginas[rutaDiana].normalizado = "0".repeat(16))),
    /* Anclado en LA DIANA, no en el recuento total: el total incluye las rutas
     * que hoy difieren de verdad por el reparto, y contarlas juntas haría que
     * este caso pasara sin que el sabotaje hubiera hecho nada. */
    salidaTiene: new RegExp(
      `✅ ${rutaDiana.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+marcado visible Δ0 · filas RSC Δ0`,
    ),
  },
  {
    etiqueta: "ruta-fantasma",
    exit: 1,
    porQue: "la base trae una ruta que el build ya no emite ⇒ DESAPARECIDA, no «ninguna difiere»",
    base: () => fabricaBase("ruta-fantasma", (b) => (b.paginas["/una-ruta-que-no-existe"] = { ...b.paginas[rutaDiana] })),
    salidaTiene: /DESAPARECIDAS del build/,
  },
  {
    etiqueta: "base-vacia",
    exit: 2,
    porQue: "base sin páginas ⇒ «ninguna difiere» sería cierto por vacío",
    base: () => fabricaBase("base-vacia", (b) => (b.paginas = {})),
    salidaTiene: /no tiene páginas/,
  },
  {
    etiqueta: "volatil-corto",
    exit: 2,
    porQue: "un volátil de 1 carácter borraría documento en vez de esconder el build id",
    base: () => BASE,
    env: { BUILD_ID: "e" },
    salidaTiene: /VOLÁTIL DEMASIADO CORTO/,
  },
  {
    etiqueta: "volatil-ubicuo",
    exit: 2,
    porQue: `"${ubicua.c}" sale ${ubicua.n} veces en ${ficheroHtml} ⇒ normalizarlo IGUALA los dos lados`,
    base: () => BASE,
    env: { BUILD_ID: ubicua.c },
    salidaTiene: /VOLÁTIL UBICUO/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · html-cmp ════════\n`);
console.log(`  base: ${BASE} (${rutasBase.length} rutas) · diana: ${rutaDiana}`);
console.log(`  cadena ubicua derivada de ${ficheroHtml}: "${ubicua.c}" ×${ubicua.n}\n`);

const ev = new Evaluadas({ nombre: "html-cmp-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const ficheroDe = (etiqueta) => join(QA, nombreNeg(`medidas/html-${etiqueta}.json`, etiqueta));
const borra = (etiqueta) => { const f = ficheroDe(etiqueta); if (existsSync(f)) rmSync(f); };

for (const c of casos) {
  borra(c.etiqueta);
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: [join(QA, "html-cmp.mjs"), c.etiqueta, "--cmp", c.base()],
    env: c.env ?? {},
  });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────────
 * Sin sabotaje, el build actual contra la congelada tiene que dar exit 0. Y con
 * una exigencia más, que es la que hace que el control diga algo: **las 31
 * rutas comparadas**. Un control que saliera 0 comparando una sola ruta no
 * distinguiría «todo igual» de «casi nada mirado». */
borra("control");
const ctl = corridaNegativa({ etiqueta: "control", args: [join(QA, "html-cmp.mjs"), "control", "--cmp", BASE] });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!new RegExp(`${rutasBase.length} rutas comparadas · 0 con CONTENIDO distinto`).test(ctlOut))
  malCtl = `no dice «${rutasBase.length} rutas comparadas · 0 con CONTENIDO distinto»`;
if (malCtl) { fallos++; console.log(`  ❌ CONTROL          ${malCtl}`); }
else console.log(`  ✓  CONTROL          exit 0 · ${rutasBase.length} rutas comparadas · 0 con contenido distinto`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} html-cmp · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve una diferencia de contenido, ve una ruta que falta, se niega a comparar\n` +
        `   contra una base vacía, y RECHAZA un volátil que borraría documento — que es\n` +
        `   la única forma que tenía de dar verde siempre.\n`
      : `   «El HTML es el mismo byte a byte» NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
