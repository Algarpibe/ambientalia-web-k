/**
 * TEST EN NEGATIVO · extractor-f33
 *
 * | sabotaje | qué tiene que pasar | qué taparía si no |
 * |---|---|---|
 * | `tipo-fantasma` | un tipo Divi sin bloque ⇒ **TIRA** | el módulo se OMITE y el documento sale con menos módulos y CERO errores |
 * | `sin-secciones` | 0 secciones propias ⇒ **rojo** | «las 31 páginas están vacías», que es un cero del parser leído como dato |
 * | `geometria` | una clave de ritmo escrita ⇒ **rojo** | 24 campos INVENTADOS, cada uno con su medición real de coartada |
 * | `control` | ✅ 31 docs · 313 módulos · 11 tipos · 0 geometría | — |
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ POR QUÉ ESTE NEGATIVO SE ESCRIBE **AHORA** — §regla 24
 *
 * El extractor produce un dato que todavía no siembra nadie. Podría parecer que
 * su negativo espera a que haya siembra; **es al revés**, y la ganancia no es de
 * calendario sino de **ATRIBUCIÓN**: cuando la siembra llegue, un rojo sólo
 * puede ser suyo, porque el instrumento ya está adjudicado. Si los dos se
 * estrenan a la vez, un rojo tiene DOS explicaciones y ninguna medida las
 * separa.
 *
 * ── El caso que hay que acordarse de escribir: `geometria` ────────────────
 * Los otros dos son «¿sabe decir que no ha mirado?». `geometria` es «¿SABE
 * GRITAR?»: se inyecta una clave de ritmo **conocida** y se exige que la guarda
 * la cace **y la nombre**. Sin él, la regla más cara de este arquetipo —*lo SIN
 * ESCRIBIR se omite, no se convierte en un número*— viviría sólo en un
 * comentario, y §sondas 3 dice lo que valen los comentarios: nadie los ejecuta.
 *
 * ⚠ Y el sabotaje va por VARIABLE DE ENTORNO, no editando el fuente (§regla 20,
 * caso peor): un `finally` no corre cuando el proceso muere por señal, así que
 * un sabotaje escrito en el fichero versionado sobrevive a la muerte de su
 * corrida, sigue compilando, y se commitea sin que nadie lo vea.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "../qa/lib.mjs";

const CANONICA = "medidas/f33-extraido.json";
const SONDA = join(QA, "../seed/extractor-f33.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "31 docs · 313 módulos · 11 tipos cruzados con arbol-f33 · 0 claves de geometría",
    env: {},
    exit: 0,
    salidaTiene: /TOTAL\s+313\s+✓/,
    comprueba: (j) => {
      if (j.catalogo?.paginas?.length !== 31) return `${j.catalogo?.paginas?.length} documentos, esperaba 31`;
      if (j.censo?.modulos !== 313) return `${j.censo?.modulos} módulos, esperaba 313`;
      if (j.cruce?.discrepancias?.length) return `${j.cruce.discrepancias.length} discrepancias con arbol-f33`;
      if (j.geometria?.clavesEscritas !== 0) return `${j.geometria?.clavesEscritas} claves de geometría escritas`;
      /* §regla 22: el veredicto de arriba es booleano y sale `true` igual sobre
       * 1 tipo que sobre 11. El cardinal va al lado. */
      const tipos = Object.keys(j.censo?.porTipo ?? {}).length;
      if (tipos !== 11) return `${tipos} tipos, esperaba 11`;
      return null;
    },
  },
  {
    etiqueta: "tipo-fantasma",
    porQue: "un tipo Divi sin bloque ⇒ TIRA, nunca se omite en silencio",
    env: { SABOTAJE: "tipo-fantasma" },
    exit: 1,
    salidaTiene: /TIPO SIN BLOQUE/,
    congela: false,
  },
  {
    etiqueta: "sin-secciones",
    porQue: "0 secciones propias ⇒ rojo, no «las 31 páginas están vacías»",
    env: { SABOTAJE: "sin-secciones" },
    exit: 2,
    salidaTiene: /0 SECCIONES propias|0 MÓDULOS/,
    comprueba: (j) => (j.censo?.modulos === 0 ? null : `el sabotaje dejó ${j.censo?.modulos} módulos`),
  },
  {
    etiqueta: "geometria",
    porQue: "una clave de ritmo escrita ⇒ GEOMETRÍA ESCRITA en rojo, no un campo inventado en verde",
    env: { SABOTAJE: "geometria" },
    exit: 2,
    salidaTiene: /GEOMETRÍA ESCRITA/,
    comprueba: (j) =>
      j.geometria?.clavesEscritas > 0
        ? null
        : "el sabotaje no llegó a escribir ninguna clave: el caso no ejercita la guarda",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · extractor-f33 ════════`);
console.log(`  alcance: el corpus congelado de fase-3 + f33-rutas.json · sin red · sin DB`);
console.log(`  NO cubre: la SIEMBRA (nadie consume este dato todavía) ni la GEOMETRÍA del clon,`);
console.log(`            que sale SIN ESCRIBIR porque hay 0 ejes comparados en las 31\n`);

/* §regla 1: lo que se imprime y lo que se cuenta no pueden discrepar. Los casos
 * son `casos.length` **+ 1** — el de `sin-NEG`, que corre fuera del bucle
 * porque no puede usar `corridaNegativa` con `NEG=`. Declarar el mínimo sin él
 * publicaría «4/4 sabotajes» debajo de un titular que dice 5/5. */
const ev = new Evaluadas({ nombre: "extractor-f33-neg", unidad: "sabotajes", minimo: casos.length + 1 });

let fallos = 0;
for (const c of casos) {
  /* `corridaNegativa` pone `NEG=<etiqueta>` y `w()` desvía por eso: TODOS los
   * casos —el control incluido— congelan en su `-neg-`, así que el canónico no
   * se toca en ninguna corrida de este fichero. */
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (c.congela !== false && existsSync(fichero)) rmSync(fichero);

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
 * EL CASO QUE §regla 24 PIDE DE VERDAD — el sabotaje SIN `NEG=`
 *
 * Los cuatro de arriba corren por `corridaNegativa`, que pone `NEG=<etiqueta>`;
 * con eso `w()` desvía **él solo** y el canónico nunca está en peligro. O sea
 * que **ninguno de los cuatro puede ejercitar la guarda de §regla 24**: 0
 * instancias separadoras, y su verde no diría nada de ella.
 *
 * Lo que la guarda protege es el otro camino: alguien lanza `SABOTAJE=… node
 * extractor-f33.mjs` a mano, sin `NEG=`. Si la sonda no desviara ella misma,
 * congelaría en el NOMBRE CANÓNICO con contenido de sabotaje — un fichero
 * plausible con la autoridad de una congelada (§regla 7).
 *
 * Se comprueba con el `mtime` del canónico: si la corrida saboteada lo toca, la
 * guarda no está. Y con su contenido: `meta.sabotaje` tiene que seguir a `null`.
 * ═════════════════════════════════════════════════════════════════════════ */
const canon = join(QA, CANONICA);
const antes = existsSync(canon) ? statSync(canon).mtimeMs : null;
const suelta = corridaNegativa({ etiqueta: "sin-NEG", args: [SONDA], env: { SABOTAJE: "geometria" }, timeout: 600_000 });
const salidaSuelta = (suelta.stdout || "") + (suelta.stderr || "");
if (suelta.error || suelta.status === null) ev.fallo("sin-NEG", suelta.error || "no llegó a correr");
else ev.ok();
let malSuelta = null;
if (antes === null) malSuelta = "no existe el canónico: corre `npm run cms:extractor-f33` antes";
else if (statSync(canon).mtimeMs !== antes) malSuelta = "la corrida SABOTEADA tocó el fichero CANÓNICO";
else if (JSON.parse(readFileSync(canon, "utf8")).meta?.sabotaje)
  malSuelta = "el canónico lleva `meta.sabotaje`: es una medida falsa con autoridad de congelada";
else if (!/la salida se desvía a/.test(salidaSuelta)) malSuelta = "la sonda no dijo en voz alta que desviaba";
if (malSuelta) { fallos++; console.log(`  ❌ ${"sin-NEG".padEnd(16)}       ${malSuelta}`); }
else
  console.log(
    `  ✓  ${"sin-NEG".padEnd(16)}       cayó por lo suyo: un sabotaje lanzado a mano DESVÍA solo — el canónico intacto\n` +
      `${" ".repeat(28)}└ §regla 24: los otros 4 casos no pueden ejercitar esto (NEG= ya desvía), o sea 0 separadoras`,
  );

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} extractor-f33 · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Un tipo sin bloque TIRA, un parser que no casa sale ROJO en vez de dar\n` +
        `   «páginas vacías», y una clave de ritmo escrita se caza y se NOMBRA. O sea\n` +
        `   que «313 módulos y 0 geometría» es una medida, no un descuido de conteo.\n`
      : `   El dato de \`f33-extraido.json\` NO se puede sembrar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
