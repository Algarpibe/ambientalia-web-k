/**
 * EL HTML SERVIDO, BYTE A BYTE — el listón que un Δ0 geométrico no alcanza.
 *
 * Uso:  node html-cmp.mjs [etiqueta]
 *       node html-cmp.mjs despues --cmp medidas/html-antes.json
 * Test en negativo:  npm run qa:html-cmp-neg
 *
 * ── Por qué hace falta ADEMÁS de `clon-base` ──────────────────────────────
 * `clon-base` compara **geometría**: `docH`, `h1.y`, el alto y el ritmo de cada
 * sección, y el nº de anclas e imágenes. Es el instrumento correcto para un
 * cambio de maquetación, y para F2-3 **se queda corto por un lado concreto**:
 *
 *   > un cambio que NO mueve un píxel pero cambia el CONTENIDO —un `<sup>` que
 *   > se pierde, un `alt` que llega vacío, un atributo reordenado, una entidad
 *   > `&amp;` que vuelve `&`— **da Δ0 en las cuatro medidas** y aun así el sitio
 *   > servido no es el mismo.
 *
 * Y ése es exactamente el riesgo de F2-3: la migración a Local API **no
 * pretende cambiar nada**, así que su criterio natural no es «se mueve poco»,
 * es **«sale el mismo fichero»**. Cuando lo que se cambia es la FUENTE del dato
 * y no su presentación, la identidad byte a byte es alcanzable — y por tanto
 * exigible.
 *
 * **CMS-SP-TIPO** es el caso con nombre: `qa:cms-roundtrip` la deja abierta
 * porque su pérdida (`R<sup>2</sup>` → `R2`) ocurre al **RENDERIZAR** y
 * guardar-y-releer sigue siendo inverso (medido, sabotaje `tipo-hoja`, 63/63).
 * Aquí se mira el render, así que aquí sí se ve.
 *
 * ── El único VOLÁTIL declarado, y se cuenta ───────────────────────────────
 * Dos builds del mismo código difieren en el `BUILD_ID` (aparece en las rutas
 * de `/_next/static/…`). Normalizarlo es dejar de mirar una parte del fichero,
 * o sea la puerta por la que se cuela un `catch {}` disfrazado. Se acota igual
 * que `volatilesQueDifieren` en `lib.mjs`:
 *
 *   1 · es **una sustitución literal** de la cadena del `BUILD_ID` del propio
 *       build, no un patrón que «parezca un hash»;
 *   2 · **se cuenta**: `nBuildId` va en la congelada, así que una corrida que
 *       normalizara de más se ve en el número;
 *   3 · **se guardan los DOS hashes**, crudo y normalizado. Si el crudo difiere
 *       y el normalizado no, la salida lo dice con esas palabras —«sólo el
 *       BUILD_ID»— y nunca como «idéntico»;
 *   4 · y el **tamaño en bytes del crudo** viaja al lado: si la normalización
 *       estuviera borrando contenido, el tamaño lo delata igual.
 *
 * ── Lo que esta sonda NO mide ─────────────────────────────────────────────
 * El DOM **después** del JS. Compara el HTML que sale del servidor, que es
 * donde vive el resultado del SSG. Lo que un `useEffect` monte encima lo sigue
 * midiendo `clon-base` con el navegador. Son complementarias, no sustitutas.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import {
  Evaluadas,
  QA,
  APP,
  env,
  hoy,
  iniciarClon,
  leeManifiesto,
  rutasEmitidas,
  w,
} from "./lib.mjs";

const args = process.argv.slice(2);
const iCmp = args.indexOf("--cmp");
const ficheroCmp = iCmp >= 0 ? args[iCmp + 1] : null;
const libres = (iCmp >= 0 ? args.slice(0, iCmp) : args).filter(Boolean);
const etiqueta = libres[0] || "antes";

const RUTAS = rutasEmitidas(leeManifiesto(APP));
if (!RUTAS.length) {
  console.error("El build no emitió ninguna ruta. Sin rutas no hay nada que comparar: ¿falta `npm run build`?");
  process.exit(2);
}

/**
 * ⚠ **GANCHO DE TEST, declarado.** El negativo necesita poder darle a la sonda
 * un volátil equivocado para comprobar que las dos guardas de abajo lo paran.
 * Se anuncia en la salida: un gancho invisible es un gancho que puede fabricar
 * un verde sin dejar rastro.
 */
const BUILD_ID = env("BUILD_ID", null) ?? readFileSync(join(APP, ".next/BUILD_ID"), "utf8").trim();
if (env("BUILD_ID", null)) console.log(`⚠ BUILD_ID=${BUILD_ID} por entorno — no es el del build`);
if (!BUILD_ID) {
  console.error("`.next/BUILD_ID` vacío: sin él no se puede declarar el volátil, y normalizar a ciegas es dejar de mirar.");
  process.exit(2);
}

/* ── GUARDA 1 · el volátil tiene que DISCRIMINAR ────────────────────────────
 * `CLAUDE.md` §sondas 4, complementario: *un patrón que casa en TODAS tampoco
 * mide nada*. Aplicado a una NORMALIZACIÓN el daño es mayor que en un selector:
 * un volátil corto o frecuente no da un cero, **borra contenido real de los dos
 * lados y los iguala**. O sea que fabrica el verde en vez de perderlo. */
const MIN_LARGO = 8;
if (BUILD_ID.length < MIN_LARGO) {
  console.error(
    `\n❌ VOLÁTIL DEMASIADO CORTO — "${BUILD_ID}" (${BUILD_ID.length} < ${MIN_LARGO} caracteres).\n` +
      `   Una cadena corta aparece por todo el documento, así que normalizarla no\n` +
      `   esconde un volátil: BORRA CONTENIDO REAL e iguala los dos lados.`,
  );
  process.exit(2);
}

/* ── GUARDA 2 · y cuánto del documento toca, medido ─────────────────────────
 * El largo no basta: una cadena larga puede ser frecuente. Se acota la
 * FRACCIÓN de bytes que la normalización toca, por página. Con el `BUILD_ID`
 * real (21 caracteres, 1 aparición en ~50 KB) esto vale ~0.04 %. */
const MAX_FRACCION = 0.01;

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** Sustituye el volátil declarado y devuelve cuántas veces apareció. */
function normaliza(html) {
  const partes = html.split(BUILD_ID);
  return { texto: partes.join("<BUILD_ID>"), n: partes.length - 1 };
}

const { base: BASE, parar } = await iniciarClon();

const ev = new Evaluadas({ nombre: `html-cmp ${etiqueta}`, unidad: "rutas", minimo: RUTAS.length });
const todo = {
  meta: { fecha: hoy(), etiqueta, rutas: RUTAS.length, buildIdNormalizado: true },
  paginas: {},
};

console.log(`\n════════ HTML SERVIDO · ${RUTAS.length} rutas · BUILD_ID ${BUILD_ID} ════════\n`);

for (const ruta of RUTAS) {
  try {
    const res = await fetch(BASE + ruta, { redirect: "manual" });
    const html = await res.text();
    /* Un 200 no es opcional: una ruta que responde 404 y devuelve su HTML de
     * error tendría hash estable y compararía «igual» corrida tras corrida.
     * `CLAUDE.md` §sondas regla 6: la ausencia se rechaza, no se sustituye. */
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const { texto, n } = normaliza(html);
    const bytes = Buffer.byteLength(html);
    const tocados = n * BUILD_ID.length;
    if (tocados > bytes * MAX_FRACCION) {
      console.error(
        `\n❌ VOLÁTIL UBICUO — en ${ruta} la normalización toca ${tocados} de ${bytes} bytes ` +
          `(${((tocados / bytes) * 100).toFixed(2)} % > ${MAX_FRACCION * 100} %), ${n} apariciones.\n` +
          `   Eso ya no es esconder un identificador de build: es borrar documento.\n` +
          `   Una comparación así IGUALA los dos lados y sale verde por construcción.`,
      );
      await parar();
      process.exit(2);
    }
    todo.paginas[ruta] = { bytes, crudo: sha(html), normalizado: sha(texto), nBuildId: n };
    ev.ok();
  } catch (e) {
    todo.paginas[ruta] = { error: String(e).slice(0, 200) };
    ev.fallo(ruta, e);
  }
}

const salida = env("SALIDA") || `medidas/html-${etiqueta}.json`;
w(salida, todo);

/* ─────────────────────────── comparación ─────────────────────────── */

const fallosEv = ev.informe();
if (!ficheroCmp) {
  console.log(`\n✓ congelado ${RUTAS.length} hashes. Sin \`--cmp\` esto es una LÍNEA BASE, no un veredicto.`);
  await parar();
  process.exit(fallosEv ? 2 : 0);
}

const rutaCmp = isAbsolute(ficheroCmp) ? ficheroCmp : join(QA, ficheroCmp);
const antes = JSON.parse(readFileSync(rutaCmp, "utf8"));
const rutasAntes = Object.keys(antes.paginas || {});
if (!rutasAntes.length) {
  console.error(`\n❌ ${rutaCmp} no tiene páginas: «ninguna difiere» sería cierto por vacío.`);
  await parar();
  process.exit(2);
}

console.log(`\n═══ ANTES (${ficheroCmp}) vs DESPUÉS\n`);
const idas = rutasAntes.filter((r) => !RUTAS.includes(r));
const nuevas = RUTAS.filter((r) => !rutasAntes.includes(r));
if (nuevas.length) console.log(`  NUEVAS (no había línea base): ${nuevas.join(" · ")}`);
if (idas.length) {
  console.error(`  ❌ DESAPARECIDAS del build (${idas.length}):`);
  idas.forEach((r) => console.error(`       · ${r}`));
}

let distintas = 0;
let soloVolatil = 0;
let sinComparar = 0;
for (const ruta of rutasAntes.filter((r) => RUTAS.includes(r))) {
  const a = antes.paginas[ruta];
  const b = todo.paginas[ruta];
  if (a.error || b.error) {
    sinComparar++;
    console.log(`  ⚠ ${ruta}: error en una de las dos corridas — NO comparada`);
    continue;
  }
  if (a.normalizado === b.normalizado) {
    if (a.crudo !== b.crudo) {
      soloVolatil++;
      console.log(`  ✅ ${ruta}  idéntico salvo el BUILD_ID (${a.nBuildId}→${b.nBuildId} apariciones)`);
    }
    continue;
  }
  distintas++;
  console.log(
    `  ❌ ${ruta}\n       bytes ${a.bytes} → ${b.bytes} (${b.bytes - a.bytes >= 0 ? "+" : ""}${b.bytes - a.bytes})` +
      `  ·  sha ${a.normalizado} → ${b.normalizado}`,
  );
}
const iguales = rutasAntes.length - idas.length - sinComparar - distintas;
console.log(`\n  ${iguales - soloVolatil} idénticas byte a byte · ${soloVolatil} sólo el BUILD_ID · ${distintas} DISTINTAS`);

/* Segundo contrato, con su propio mínimo: se puede medir las 31 y comparar
 * CERO si la base es de otro conjunto de rutas (`CLAUDE.md` §sondas 4bis). */
const evCmp = new Evaluadas({ nombre: `html-cmp vs ${etiqueta}`, unidad: "rutas comparadas", minimo: 1 });
evCmp.ok(rutasAntes.length - idas.length - sinComparar);
const fallosCmp = evCmp.informe();

const mal = distintas > 0 || idas.length > 0 || sinComparar > 0 || fallosEv > 0 || fallosCmp > 0;
console.log(
  `\n${mal ? "❌" : "✅"} ${rutasAntes.length - idas.length - sinComparar} rutas comparadas · ` +
    `${distintas} con el HTML distinto · umbral CERO (byte a byte, salvo BUILD_ID)`,
);
await parar();
process.exit(mal ? 1 : 0);
