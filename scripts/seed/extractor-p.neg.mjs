/**
 * TEST EN NEGATIVO · extractor-p
 *
 * | sabotaje | qué tiene que pasar | qué taparía si no |
 * |---|---|---|
 * | `lector-muerto` | 0 apariciones ⇒ **rojo** | «el CPT está vacío», que es un cero del lector leído como dato |
 * | `ficha-divergente` | dos formas para un slug ⇒ **rojo** | leer «la primera aparición» y devolver una ficha POR AZAR DE ORDEN |
 * | `control-roto` | un campo cambiado ⇒ **discrepancia SIN CLASIFICAR, rojo** | que el control compare y no mire, o que el cubo de sobras se trague la clase |
 * | `sin-seo` | 0 filas de seo ⇒ **rojo** | documentos con página propia y sin `seo`, sin que nadie lo note |
 * | `control` | ✅ 19 productos · 0 sin clasificar · 0 lectores muertos | — |
 * | `sin-NEG` | un sabotaje lanzado A MANO desvía él solo | un fichero con nombre de medida y contenido de sabotaje (§regla 7) |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ POR QUÉ ESTE FICHERO NO EXISTÍA, Y POR QUÉ ESO NO SALÍA ROJO — §regla 26
 *
 * `package.json` declaraba `cms:extractor-p-neg` apuntando a un fichero
 * **ausente**, y eso no daba error en ningún sitio: la sonda que censa negativos
 * **enumera el disco**, así que un negativo que falta no le sale rojo — **no le
 * sale**. Y nadie lo corría a mano, porque el `npm run` estaba ahí y eso se lee
 * como que el negativo está ahí. De los 4 que la 95.ª encontró así, éste era el
 * que estaba **debajo del camino de siembra** que la 97.ª iba a usar.
 *
 * `extractor-p` es de los 6 extractores el ÚNICO que se había quedado sin
 * negativo, y no por ser el más simple: estrena un invariante propio —*la ficha
 * es PROYECCIÓN del producto*— que ninguna otra sonda vigila.
 *
 * ── El caso que hay que acordarse de escribir: `ficha-divergente` ─────────
 * Los otros tres son «¿sabe decir que no ha mirado?». Éste es «¿SABE GRITAR?»:
 * se inyecta una segunda forma **conocida** para un slug y se exige que la
 * guarda la cace **y la nombre con su recuento de formas**. Sin él, la premisa
 * que autoriza a leer el panel —640 nodos de C-2— viviría sólo en un comentario.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ ALCANCE, y se declara porque el mínimo lo cambia el propio sabotaje:
 * `extractor-p` declara `minimo: SABOTAJE ? 1 : 19`, o sea que **una corrida
 * saboteada NO puede caer por el contrato de `Evaluadas`** — cae por su guarda o
 * no cae. Por eso cada caso exige además su `salidaTiene`: comprobar sólo el
 * código de salida no distinguiría «cayó por lo suyo» de «cayó por el mínimo»
 * (§regla 17: un sabotaje que comparte variable con el mínimo mueve la portería).
 */
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/p-extraido.json";
const SONDA = join(QA, "../seed/extractor-p.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "19 productos · ficha idéntica en todas las apariciones · 0 sin clasificar · 0 lectores muertos",
    env: {},
    exit: 0,
    salidaTiene: /ficha IDÉNTICA en todas las apariciones/,
    comprueba: (j) => {
      if (j.recuento?.extraidos !== 19) return `${j.recuento?.extraidos} productos, esperaba 19`;
      if (j.invariante?.divergentes?.length) return `${j.invariante.divergentes.length} slugs con ficha divergente`;
      const sc = (j.control?.discrepancias ?? []).filter((d) => d.clase === "SIN CLASIFICAR").length;
      if (sc) return `${sc} discrepancias SIN CLASIFICAR`;
      /* §regla 22: «0 divergentes» es un booleano y sale `true` igual sobre 1
       * aparición que sobre 98. El cardinal va al lado y cierra el veredicto. */
      if (!(j.recuento?.apariciones > 19))
        return `${j.recuento?.apariciones} apariciones: con una por slug el invariante de proyección no se puede ejercitar`;
      return null;
    },
  },
  {
    etiqueta: "lector-muerto",
    porQue: "0 apariciones ⇒ rojo, no «el CPT está vacío»",
    env: { SABOTAJE: "lector-muerto" },
    exit: 2,
    salidaTiene: /0 productos extraídos|LECTOR MUERTO/,
    comprueba: (j) => (j.recuento?.extraidos === 0 ? null : `el sabotaje dejó ${j.recuento?.extraidos} productos`),
  },
  {
    etiqueta: "ficha-divergente",
    porQue: "dos formas para un slug ⇒ FICHA DIVERGENTE en rojo, no una ficha elegida por azar de orden",
    env: { SABOTAJE: "ficha-divergente" },
    exit: 2,
    salidaTiene: /FICHA DIVERGENTE/,
    comprueba: (j) =>
      j.invariante?.divergentes?.length > 0
        ? null
        : "el sabotaje no llegó a divergir ninguna ficha: el caso no ejercita la guarda (0 separadoras)",
  },
  {
    etiqueta: "control-roto",
    porQue: "un campo cambiado ⇒ discrepancia SIN CLASIFICAR en rojo, no absorbida por un cubo de sobras",
    env: { SABOTAJE: "control-roto" },
    exit: 2,
    salidaTiene: /SIN CLASIFICAR/,
    comprueba: (j) => {
      const sc = (j.control?.discrepancias ?? []).filter((d) => d.clase === "SIN CLASIFICAR");
      if (!sc.length) return "el sabotaje no produjo ninguna discrepancia SIN CLASIFICAR: el control no compara";
      /* Y cae por lo SUYO: la discrepancia tiene que ser del campo saboteado. */
      if (!sc.some((d) => d.campo === "name")) return `las ${sc.length} sin clasificar no son del campo saboteado (\`name\`)`;
      return null;
    },
  },
  {
    etiqueta: "sin-seo",
    porQue: "0 filas de seo ⇒ SIN SEO MEDIDO en rojo, no documentos con página propia y sin `seo`",
    env: { SABOTAJE: "sin-seo" },
    exit: 2,
    salidaTiene: /SIN SEO MEDIDO/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-p ════════`);
console.log(`  alcance: el corpus congelado + medidas/solutions-seo.json + el CONTROL de src/lib/products.ts`);
console.log(`  NO cubre: la SIEMBRA de \`productos\` ni los 8 slugs del CPT que ningún caso referencia —`);
console.log(`            ésos no tienen panel en el corpus y están fuera del dominio de la sonda\n`);

/* §regla 1: los casos son `casos.length` **+ 1** — el de `sin-NEG`, que corre
 * fuera del bucle porque no puede usar `corridaNegativa` con `NEG=`. */
const ev = new Evaluadas({ nombre: "extractor-p-neg", unidad: "sabotajes", minimo: casos.length + 1 });

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
  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(18)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(18)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

/* ══════════════════════════════════════════════════════════════════════════
 * §regla 24 · EL SABOTAJE SIN `NEG=` — el único que ejercita el desvío propio
 *
 * Los cinco de arriba corren por `corridaNegativa`, que pone `NEG=<etiqueta>`;
 * con eso `w()` desvía él solo y el canónico nunca está en peligro. O sea que
 * **ninguno de los cinco puede ejercitar la guarda de §regla 24**: 0 instancias
 * separadoras, y su verde no diría nada de ella.
 *
 * ⚠ Y aquí esa guarda es NUEVA (97.ª): hasta hoy `extractor-p` congelaba en
 * `medidas/p-extraido.json` con SABOTAJE puesto. No corrompía el canónico
 * —`w()` no pisa una congelada que difiera— pero lo que salía era un fichero
 * **fechado y sin marcar**: nombre de medida, contenido de sabotaje.
 * ═════════════════════════════════════════════════════════════════════════ */
const canon = join(QA, CANONICA);
const antes = existsSync(canon) ? statSync(canon).mtimeMs : null;
const suelta = corridaNegativa({ etiqueta: "sin-NEG", args: [SONDA], env: { SABOTAJE: "ficha-divergente" }, timeout: 600_000 });
const salidaSuelta = (suelta.stdout || "") + (suelta.stderr || "");
if (suelta.error || suelta.status === null) ev.fallo("sin-NEG", suelta.error || "no llegó a correr");
else ev.ok();
let malSuelta = null;
if (antes === null) malSuelta = "no existe el canónico: corre `npm run cms:extractor-p` antes";
else if (statSync(canon).mtimeMs !== antes) malSuelta = "la corrida SABOTEADA tocó el fichero CANÓNICO";
else if (JSON.parse(readFileSync(canon, "utf8")).meta?.sabotaje)
  malSuelta = "el canónico lleva `meta.sabotaje`: es una medida falsa con autoridad de congelada";
else if (!/la salida se desvía a/.test(salidaSuelta)) malSuelta = "la sonda no dijo en voz alta que desviaba";
if (malSuelta) { fallos++; console.log(`  ❌ ${"sin-NEG".padEnd(18)}       ${malSuelta}`); }
else
  console.log(
    `  ✓  ${"sin-NEG".padEnd(18)}       cayó por lo suyo: un sabotaje lanzado a mano DESVÍA solo — el canónico intacto\n` +
      `${" ".repeat(30)}└ §regla 24: los otros ${casos.length} casos no pueden ejercitar esto (NEG= ya desvía), o sea 0 separadoras`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor-p · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El invariante que autoriza a leer el panel —la ficha es PROYECCIÓN del producto—\n` +
        `   se cae en rojo si dos apariciones divergen, un lector que no casa sale por error\n` +
        `   en vez de dar «el CPT está vacío», y una discrepancia que no encaje en ninguna\n` +
        `   clase declarada NO se archiva en un cubo de sobras.\n`
      : `   El dato de \`p-extraido.json\` NO se puede sembrar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
