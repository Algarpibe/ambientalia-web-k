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
  RE_TROZO_RSC,
  rutasEmitidas,
  visibleDe,
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

/* ══════════════════════════════════════════════════════════════════════════
 * EL SEGUNDO VOLÁTIL DECLARADO — los NOMBRES DE FICHERO DE CHUNK (2026-08-06)
 *
 * Lo destapó la migración de `productos`: **11 rutas con el `visible` distinto y
 * el contenido idéntico**. El diff, tomado contra el build inmediatamente
 * anterior y con `visibleDe` (la función de la propia sonda, no una copia):
 *
 *     visible 136664 → 136664 · igual: false
 *                              · igual tras normalizar los nombres de chunk: TRUE
 *
 * en las 3 rutas muestreadas —home, sector y un caso **que ni siquiera monta el
 * componente tocado**—. Toda la diferencia estaba en
 * `<script src="/_next/static/chunks/2xiiasx10lkh8.js">` → `0la1r4byhiv3d.js`.
 *
 * ── Por qué es volátil, y en qué se DIFERENCIA del `BUILD_ID` ─────────────
 * Es identidad de build igual que él —**el original no emite chunks de Next**,
 * medido en `qa:rsc-original`— así que no traslada ninguna fidelidad. Pero hay
 * una diferencia que **hay que decir en voz alta porque es la que podría tapar
 * algo**:
 *
 *   > el `BUILD_ID` cambia en **todo** build, aunque el código sea idéntico; el
 *   > nombre de chunk cambia **sólo si el bundle cliente cambió**. Normalizarlo
 *   > a secas **borraría una señal real**.
 *
 * Por eso no se borra: se **cuenta y se nombra**. Una ruta cuyo `visible` sólo
 * difiere en los nombres de chunk **no se reporta como idéntica**: sale en su
 * propia categoría (`bundle`), con su recuento, y la salida dice que el paquete
 * de JS que descarga el visitante ha cambiado. En esta tanda es un hecho real y
 * deseado: `ProductosTabs` dejó de importar el catálogo medido, así que el
 * bundle de la home **ya no lleva los 9 productos dentro**.
 *
 * ── Las MISMAS cuatro guardas del `BUILD_ID`, y por lo mismo ──────────────
 *   1 · el patrón está **anclado a un prefijo literal** (`/_next/static/chunks/`),
 *       no a «lo que parezca un hash»;
 *   2 · **se cuenta** (`nChunks` viaja en la congelada);
 *   3 · **se guardan los DOS hashes** (`visible` crudo y `visibleSinChunks`), así
 *       que la salida nunca puede decir «idéntico» donde hubo sustitución;
 *   4 · **se acota la fracción** de bytes del visible que toca, con la misma
 *       guarda de ubicuidad. Medido: ~13 referencias × ~13 caracteres sobre
 *       ~136 KB ⇒ **0.12 %**.
 *
 * ── ⚠ Y lo que NO se puede comprobar contra una base anterior ─────────────
 * `html-f23-base.json` es de antes de este nivel y **no se re-congela**. Contra
 * ella, una ruta que sólo cambie de nombres de chunk **no se puede distinguir**
 * de una que cambie de contenido, así que sigue saliendo DISTINTA y la salida
 * **dice por qué** en vez de darlo por cumplido (regla 6: una ausencia se
 * rechaza, no se traduce a un valor benigno). Para adjudicarla hace falta una
 * base tomada con este nivel puesto.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Anclado al prefijo literal: el nombre opaco de un chunk de Next y nada más.
 *
 * ⚠ **GANCHO DE TEST, declarado** — mismo patrón que `BUILD_ID` y por lo mismo:
 * el negativo necesita poder darle a la sonda un patrón ENSANCHADO para
 * comprobar que la guarda de ubicuidad lo para. Se anuncia en la salida; un
 * gancho invisible es un gancho que puede fabricar un verde sin dejar rastro.
 */
const CHUNK_PATRON = env("CHUNK_PATRON", null) ?? "\\/_next\\/static\\/chunks\\/[A-Za-z0-9_-]+\\.js";
if (env("CHUNK_PATRON", null))
  console.log(`⚠ CHUNK_PATRON=${CHUNK_PATRON} por entorno — no es el patrón declarado`);
const RE_CHUNK = new RegExp(CHUNK_PATRON, "g");

/**
 * Sustituye las referencias a chunk y devuelve cuántas y cuántos bytes ocupaban.
 *
 * Se sustituye **la referencia entera**, no sólo el nombre: cuenta como
 * «tocado» más de lo estrictamente volátil, que es la dirección conservadora
 * para una guarda —una normalización que se pasa tiene que saltar antes, no
 * después—. Que haya o deje de haber referencias lo dice `nChunks`, que viaja
 * en la congelada.
 */
function sinChunks(html) {
  let n = 0;
  let tocados = 0;
  RE_CHUNK.lastIndex = 0;
  const texto = html.replace(RE_CHUNK, (m) => {
    n++;
    tocados += m.length;
    return "<CHUNK>";
  });
  return { texto, n, tocados };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LOS TRES NIVELES, Y POR QUÉ SON TRES (2026-08-05, medido con el canario)
 *
 * La primera versión comparaba **un** hash del documento entero, y al migrar la
 * primera familia dio `2 DISTINTAS` de 31. Al abrir las dos diferencias:
 *
 *   · el **marcado visible** —todo el documento menos los `<script>` de
 *     `self.__next_f`— salía **byte a byte idéntico** (53675→53675 y
 *     53221→53221);
 *   · toda la diferencia estaba en la **carga RSC**, la que Next inserta para
 *     hidratar. Y no era contenido: en `puedo` el CONJUNTO de filas es el mismo
 *     y sólo cambian los cortes entre `push` (17→16 trozos, **−43 bytes**, que
 *     es exactamente un envoltorio de trozo); en `cual` las filas son las
 *     mismas con **otros números de fila** (`HeaderNav` de la `f` a la `10`,
 *     `IconMark` de la `1d` a la `f`) y el total no se mueve un byte.
 *
 * La causa es conocida y esperable: `generateMetadata` pasa a ser **asíncrona**
 * porque consulta la DB, así que los metadatos resuelven en otro momento y el
 * serializador de React reparte los ids de fila en orden de resolución.
 *
 * ── Lo que NO se hace, y es la tentación ──────────────────────────────────
 * Meter `__next_f` en la normalización. Eso sería declarar volátil **un tercio
 * del documento** para que la sonda deje de protestar — la trampa exacta que
 * las dos guardas de arriba existen para impedir, cometida a mano.
 *
 * Lo que se hace es **medir a tres niveles y decir en cuál difiere**:
 *
 * | nivel | qué es | umbral |
 * |---|---|---|
 * | `visible` | el documento **sin** los `push` de `__next_f` | **CERO — es lo que ve el visitante** |
 * | `filas` | las filas RSC con los identificadores ENMASCARADOS: invariante a renumeración y a dónde caen los cortes | **CERO — es el contenido de la carga** |
 * | `normalizado` | el documento entero salvo `BUILD_ID` | **se informa**: si los dos de arriba están a cero, lo que queda es reparto del stream |
 *
 * Los dos primeros son el veredicto. El tercero **se cuenta y se nombra**, que
 * es la diferencia entre «lo excluí» y «lo miré y sé qué es».
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ CORREGIDO 2026-08-06 (§F2-3-RSC-ORDEN) · EL CONTRATO DE LOS TRES NIVELES
 *
 * La tabla de arriba puso `filas` a **umbral CERO**, o sea de PUERTA. Al migrar
 * la segunda familia enrojeció una ruta cuyo contenido no había cambiado, y la
 * ficha lo diagnosticó con números. La tentación era ensanchar la máscara. La
 * pregunta correcta era otra: **¿qué puede garantizar cada nivel?**
 *
 * ── Lo que decide la categoría, y está medido ─────────────────────────────
 *
 *   > **EL ORIGINAL NO EMITE CARGA RSC.** `npm run qa:rsc-original`, congelada,
 *   > negativo 5/5 — cuyo falsador es el propio clon: 4 arquetipos del original,
 *   > 0 con `__next_f`, los 4 con su control positivo.
 *
 * De ahí se sigue, y no es una preferencia: **el nivel `filas` no tiene
 * contraparte que auditar, ni hoy ni nunca.** No hay un lado del original con el
 * que compararlo, así que es **clon-contra-clon POR CONSTRUCCIÓN** — la familia
 * que `CLAUDE.md` §UN ARQUETIPO NUEVO NO HEREDA COBERTURA declara que *«se lee
 * como verde y no mide fidelidad»*. Un Δ0 ahí no compra fidelidad: no hay
 * fidelidad que comprar.
 *
 * ── Por qué `visible` SÍ puede ser puerta, y es el mismo argumento ────────
 * `html-cmp` es una guarda de INVARIANCIA (clon de hoy contra clon de ayer),
 * no de fidelidad, y eso está bien para F2-3: el efecto esperado de la migración
 * es cero. Lo que hace una invariancia útil es que **traslade** una fidelidad ya
 * pagada en otro sitio. El marcado visible es exactamente donde vive la
 * fidelidad que 48 sondas midieron contra kunakair.com, así que byte-identidad
 * ahí **transfiere** esa afirmación al otro lado de la migración. La carga RSC
 * no tiene ninguna que transferir.
 *
 * ── Y la segunda razón, independiente de la primera ──────────────────────
 * `generateMetadata` pasa a ser asíncrona **en cada familia que se migra**, así
 * que el serializador reparte los ids en orden de resolución **en cada familia**.
 * Una puerta que enrojece por el mecanismo de la propia fase no es una puerta:
 * es ruido con nombre. Es la regla del pleno (`CLAUDE.md` §sondas 4,
 * complementario) aplicada a un comparador.
 *
 * ── EL CONTRATO ───────────────────────────────────────────────────────────
 *
 * | nivel | qué es | qué GARANTIZA | umbral | falsador |
 * |---|---|---|---|---|
 * | `visible` | el documento sin los `push` de `__next_f` | lo que recibe el visitante no cambió — **y traslada la fidelidad medida contra el original** | **PUERTA · CERO** | `visible-alterado` (exit 1) |
 * | `visibleSinChunks` | lo mismo, con los **nombres de fichero de chunk** normalizados (2º volátil declarado, 2026-08-06) | el MARCADO no cambió aunque el bundle cliente sí | **PUERTA · CERO** (es la puerta real) | `chunk-ensanchado` (exit 2) · `solo-bundle` (verde y contado) |
 * | `filas` | las filas RSC con los identificadores enmascarados | **nada de fidelidad**: el original no emite esto. Sólo churn accidental de la carga de hidratación | **INFORMATIVO, con disparador** | `filas-renumeradas` (verde y contado) · `filas-invariante` (exit 1) |
 * | `normalizado` | el documento entero salvo `BUILD_ID` | nada por sí solo | informativo, contado | `solo-reparto` (verde y contado) |
 *
 * ── EL DISPARADOR: qué tiene que aparecer para que alguien mire `filas` ──
 * Degradar a informativo **no es dejar de mirar**. El reparto mueve *qué fila
 * lleva qué id*; lo que **no** puede mover son los INVARIANTES de la carga:
 *
 *   · `nFilas` — cuántas filas hay;
 *   · `nMascaras` — cuántos identificadores y referencias;
 *   · `bytesCarga` — cuánto pesa la carga desescapada.
 *
 * **Si el hash de `filas` difiere y los invariantes NO se mueven** → es
 * renumeración: verde, contado y nombrado aparte. **Si se mueve uno** → DEFECTO,
 * y la salida dice cuál y con qué número. Medido sobre las 6 rutas en que el
 * fenómeno aparece: `nFilas` y `nMascaras` idénticos en las 6 (33·36·46·40·46·45
 * y 66·72·77·78·75·73), incluida la que enrojecía.
 *
 * ⚠ **`bytesCarga` es nuevo, y `html-f23-base.json` es ANTERIOR.** Esa congelada
 * no se re-congela —es el HTML de antes de la migración y es contra lo que se
 * mide toda la fase—, así que **durante F2-3 el disparador corre con dos
 * invariantes y no con tres**, y la salida lo dice ruta a ruta en vez de darlo
 * por cumplido. Lo que eso deja fuera está acotado: un cambio de bytes DENTRO de
 * una fila que no altere el nº de filas ni el de referencias. Si ese contenido
 * se renderiza, el nivel `visible` —la puerta— lo ve igual; lo que escapa a los
 * dos es contenido que viaje **sólo** en la carga.
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **`RE_TROZO_RSC` y `visibleDe` SUBIERON A `lib.mjs` el 2026-08-06.** No es
 * un movimiento estético: `t4b-bloque` mide el mismo `visible` **al nivel del
 * bloque**, y su afirmación (*«todo el resto está a Δ0»*) sólo compone con la
 * de aquí (*«la ruta difiere»*) si las dos recortan el fichero por el mismo
 * sitio. Dos definiciones que derivaran darían las dos sondas verdes en su
 * propio marco y contradiciéndose sin que nada lo delatara.
 */
const RE_TROZO = RE_TROZO_RSC;

/**
 * Las filas RSC, **con los identificadores enmascarados**.
 *
 * Los cortes entre `push` son transporte, no contenido: se concatenan las
 * cargas y se parte por filas. Y los números de fila son una asignación
 * interna del serializador —cambian con el orden de resolución sin que cambie
 * el árbol—, así que se enmascaran tanto en la cabeza de la fila (`1c:`) como
 * en las referencias (`"$L1c"`).
 *
 * ⚠ Enmascarar es dejar de mirar, otra vez, así que **se cuenta**: `nMascaras`
 * viaja en la congelada. Y no puede fabricar un verde por sí solo — el nivel
 * `visible`, que decide, no enmascara nada.
 */
function filasDe(html) {
  const cargas = [];
  RE_TROZO.lastIndex = 0;
  let m;
  while ((m = RE_TROZO.exec(html))) cargas.push(JSON.parse(m[1]));
  let n = 0;
  const carga = cargas.join("");
  const filas = carga
    .split("\n")
    .filter(Boolean)
    .map((f) =>
      f
        .replace(/^[0-9a-f]+:/, () => (n++, "<F>:"))
        .replace(/"\$[LW]?[0-9a-f]{1,4}"/g, () => (n++, '"<REF>"')),
    )
    .sort();
  /* `bytesCarga` — el tercer INVARIANTE del disparador (ver el contrato arriba).
   * Es la carga **desescapada y sin los envoltorios de trozo**: el reparto mueve
   * dónde cortan los `push` (y con ellos los bytes del documento), pero no
   * cuánto pesa lo transportado. */
  return { filas, n, bytesCarga: Buffer.byteLength(carga), nTrozos: cargas.length };
}

const { base: BASE, parar } = await iniciarClon();

const ev = new Evaluadas({ nombre: `html-cmp ${etiqueta}`, unidad: "rutas", minimo: RUTAS.length });
const todo = {
  /**
   * ⚠ **`buildId` es el MARCADOR DE FRESCURA de esta sonda, y va en la
   * congelada.** El protocolo pide un marcador en el HTML servido para
   * discriminar el build; aquí el cambio que se mide **no deja marca en el
   * HTML** —una migración cuyo efecto esperado es cero no la puede dejar—, así
   * que el marcador tiene que ser otro. Éste lo es y es mejor: dos ficheros con
   * `buildId` distinto son dos builds distintos, y se ve **en la evidencia
   * congelada** y no sólo en la consola de quien la corrió.
   */
  meta: { fecha: hoy(), etiqueta, rutas: RUTAS.length, buildId: BUILD_ID },
  paginas: {},
};

console.log(`\n════════ HTML SERVIDO · ${RUTAS.length} rutas · BUILD_ID ${BUILD_ID} ════════\n`);

/**
 * ⚠ **CORREGIDO 2026-08-06 — la guarda de UBICUIDAD acertaba y salía con el
 * código equivocado, que en un negativo es indistinguible de no acertar.**
 *
 * Estaba escrita como `await parar(); process.exit(2)` **dentro del bucle**, o
 * sea saliendo del proceso con una petición de `fetch` a medio cerrar. En
 * Windows eso hace saltar una aserción de libuv (`UV_HANDLE_CLOSING`, `async.c`
 * 94) y el proceso muere con **0xC0000409 = 3221226505**, no con 2. La guarda
 * imprimía su mensaje correcto y `qa:html-cmp-neg` la contaba como fallada:
 * *«esperaba exit 2, salió 3221226505»*.
 *
 * Es la §regla 1 por el otro lado —el canal de verdad son **la salida Y el
 * código**, y aquí discrepaban— y también §sondas 8a: el sabotaje sí ejercitaba
 * la guarda, y el instrumento que lo leía no podía verlo.
 *
 * El motivo se anota y **se sale después del bucle**, con todo cerrado.
 */
let ubicuo = null;

for (const ruta of RUTAS) {
  if (ubicuo) break;
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
      ubicuo = { ruta, tocados, bytes, n };
      break;
    }
    const { filas, n: nMascaras, bytesCarga, nTrozos } = filasDe(texto);
    const vis = visibleDe(texto);
    const { texto: visSinChunks, n: nChunks, tocados: bytesChunks } = sinChunks(vis);
    /* Guarda 4 del segundo volátil: la misma de UBICUIDAD, sobre el visible. Una
     * normalización que toque más que un puñado de nombres no está escondiendo
     * una identidad de build: está borrando documento e igualando los dos lados. */
    if (bytesChunks > vis.length * MAX_FRACCION) {
      ubicuo = { ruta, tocados: bytesChunks, bytes: vis.length, n: nChunks, cual: "nombres de chunk" };
      break;
    }
    todo.paginas[ruta] = {
      bytes,
      crudo: sha(html),
      normalizado: sha(texto),
      visible: sha(vis),
      visibleSinChunks: sha(visSinChunks),
      nChunks,
      filas: sha(filas.join("\n")),
      nFilas: filas.length,
      nMascaras,
      bytesCarga,
      nTrozos,
      nBuildId: n,
    };
    ev.ok();
  } catch (e) {
    todo.paginas[ruta] = { error: String(e).slice(0, 200) };
    ev.fallo(ruta, e);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * El veredicto de la guarda de UBICUIDAD, **antes de congelar nada**: una
 * corrida con el volátil mal no ha medido, así que su salida no sería una
 * medida (regla 7).
 *
 * ⚠ **Y sale con `process.exitCode`, NO con `process.exit()`, por una razón
 * medida en esta máquina** — repro mínimo, 3 de 3:
 *
 *     await fetch(url); process.exit(2)   → Assertion failed:
 *                                           !(handle->flags & UV_HANDLE_CLOSING),
 *                                           src\win\async.c:94  ⇒ exit 3221226505
 *     await fetch(url); process.exitCode = 2  → exit 2
 *
 * `process.exit()` arranca el proceso mientras el socket keep-alive de `fetch`
 * sigue cerrándose, y libuv aborta. Ni `setImmediate` ni `setTimeout(0)` ni
 * cerrar el dispatcher de undici lo evitan (probados, 3 de 3 cada uno): lo
 * único que funciona es **dejar drenar el bucle**, que es lo que hace
 * `exitCode`. No es un retardo mágico, es el mecanismo.
 *
 * Lo grave era el efecto en el negativo: la guarda **acertaba** —imprimía su
 * mensaje— y `qa:html-cmp-neg` la contaba como fallada por el código de salida.
 * §regla 1 por el otro lado: el canal de verdad son la salida **y** el código, y
 * discrepaban.
 *
 * ⚠ **Es una CLASE, no esta instancia**: 24 ficheros de `scripts/` hacen `fetch`
 * y `process.exit`. Aquí se ve siempre porque la salida ocurre inmediatamente
 * después del `fetch`; en las demás la carrera la suele ganar el trabajo que
 * hay en medio. Fichada en `PENDIENTES-QA.md` §F2-3-EXIT-FETCH con su repro.
 * ═════════════════════════════════════════════════════════════════════════ */
if (ubicuo) {
  console.error(
    `\n❌ VOLÁTIL UBICUO${ubicuo.cual ? ` (${ubicuo.cual})` : ""} — en ${ubicuo.ruta} la normalización toca ${ubicuo.tocados} de ${ubicuo.bytes} bytes ` +
      `(${((ubicuo.tocados / ubicuo.bytes) * 100).toFixed(2)} % > ${MAX_FRACCION * 100} %), ${ubicuo.n} apariciones.\n` +
      `   Eso ya no es esconder un identificador de build: es borrar documento.\n` +
      `   Una comparación así IGUALA los dos lados y sale verde por construcción.`,
  );
  await parar();
  process.exitCode = 2;
}

/* Todo lo que sigue **sólo tiene sentido si hubo medida**. Va dentro del bloque
 * en vez de detrás de un `process.exit()` porque salir a la brava es justo lo
 * que rompe el código de salida (arriba). */
if (!ubicuo) {

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

/**
 * Los INVARIANTES del nivel `filas` — lo que la renumeración del serializador no
 * puede mover. El disparador del contrato (ver la cabecera) se lee así:
 *
 *   · hash de `filas` distinto **y** los invariantes quietos → renumeración:
 *     verde, contado y nombrado;
 *   · **un invariante movido** → DEFECTO, con su nombre y su número.
 *
 * ⚠ Un invariante que la base NO trae **no cuenta como cumplido**: se dice en la
 * salida. Convertir «no lo puedo comprobar» en «está bien» es exactamente la
 * regla 6 (`CLAUDE.md` §sondas), y aquí el que falta es `bytesCarga` durante
 * toda F2-3 porque su congelada es anterior.
 */
const INVARIANTES = ["nFilas", "nMascaras", "bytesCarga"];
const movidos = (a, b) =>
  INVARIANTES.filter((k) => a[k] !== undefined && b[k] !== undefined && a[k] !== b[k]).map(
    (k) => `${k} ${a[k]}→${b[k]}`,
  );
const ausentes = (a, b) => INVARIANTES.filter((k) => a[k] === undefined || b[k] === undefined);

let distintas = 0;
let soloVolatil = 0;
let soloReparto = 0;
let renumeradas = 0;
let bundle = 0;
let sinComparar = 0;
/** ¿La base trae el segundo volátil? Si no, un cambio de chunk NO se adjudica. */
const baseConChunks = Object.values(antes.paginas).some((p) => p.visibleSinChunks);
if (!baseConChunks)
  console.log(
    `  ⚠ la base es ANTERIOR al nivel \`visibleSinChunks\`: una ruta que sólo cambie de\n` +
      `    nombres de chunk saldrá DISTINTA y no se puede distinguir de un cambio de\n` +
      `    contenido. Para adjudicarla hace falta una base tomada con este nivel.\n`,
  );
/** ¿La base es de antes de los tres niveles? Entonces sólo se puede exigir el 1. */
const baseConNiveles = Object.values(antes.paginas).some((p) => p.visible);
if (!baseConNiveles)
  console.log(`  ⚠ la base no trae \`visible\`/\`filas\`: sólo se puede comparar el documento entero\n`);

/**
 * La INTERSECCIÓN build ∩ fichero-base: **todo lo que esta comparación puede
 * llegar a mirar**, y se conoce ANTES de comparar. Estaba calculada en línea
 * dentro del `for` y sin nombre, así que el segundo contrato no podía usarla de
 * listón aunque la tenía delante (ver `evCmp`, abajo).
 */
const comunes = rutasAntes.filter((r) => RUTAS.includes(r));

for (const ruta of comunes) {
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
  /* Difiere el documento entero. Los dos niveles de abajo dicen SI ESO IMPORTA:
   * lo que el visitante ve, y el contenido de la carga de hidratación. */
  const visibleIgual = baseConNiveles && a.visible === b.visible;
  const filasIguales = baseConNiveles && a.filas === b.filas;
  /* El segundo volátil declarado: mismo marcado, otro BUNDLE cliente. Cierra la
   * puerta —el contenido no cambió— pero **no cuenta como idéntico**: lo que el
   * visitante descarga sí cambió, y eso se dice. */
  const soloBundle =
    !visibleIgual &&
    a.visibleSinChunks !== undefined &&
    b.visibleSinChunks !== undefined &&
    a.visibleSinChunks === b.visibleSinChunks;
  const puertaCerrada = visibleIgual || soloBundle;
  const nota = soloBundle
    ? `marcado visible Δ0 SALVO los nombres de chunk (${a.nChunks}→${b.nChunks} refs): otro BUNDLE cliente`
    : `marcado visible Δ0`;
  if (puertaCerrada && filasIguales) {
    if (soloBundle) bundle++;
    else soloReparto++;
    console.log(
      `  ✅ ${ruta}\n       ${nota} · filas RSC Δ0 (${a.nFilas}) — sólo cambia el REPARTO del stream` +
        ` (${a.bytes} → ${b.bytes} bytes)`,
    );
    continue;
  }
  /* ── EL DISPARADOR del nivel informativo ─────────────────────────────────
   * La puerta es `visible`. Con la puerta cerrada a Δ0, unas `filas` distintas
   * sólo son defecto si movieron un INVARIANTE de la carga; si no, es la
   * renumeración que `generateMetadata` asíncrona produce en cada familia. */
  if (puertaCerrada && baseConNiveles) {
    const rotos = movidos(a, b);
    const noComprobados = ausentes(a, b);
    if (!rotos.length) {
      if (soloBundle) bundle++;
      else renumeradas++;
      console.log(
        `  ✅ ${ruta}\n       ${nota} · filas RSC con OTROS identificadores, invariantes quietos` +
          ` (nFilas ${a.nFilas} · nMascaras ${a.nMascaras}) — nivel informativo, NO es Δ0` +
          (noComprobados.length ? `\n       ⚠ sin comprobar en la base: ${noComprobados.join(" · ")}` : ""),
      );
      continue;
    }
    distintas++;
    console.log(
      `  ❌ ${ruta}\n       ${nota} pero la CARGA RSC movió un invariante: ${rotos.join(" · ")}` +
        `\n       eso no es renumeración: es contenido de la carga` +
        (noComprobados.length ? `\n       ⚠ sin comprobar en la base: ${noComprobados.join(" · ")}` : ""),
    );
    continue;
  }
  distintas++;
  console.log(
    `  ❌ ${ruta}\n       bytes ${a.bytes} → ${b.bytes} (${b.bytes - a.bytes >= 0 ? "+" : ""}${b.bytes - a.bytes})` +
      `  ·  sha ${a.normalizado} → ${b.normalizado}` +
      (baseConNiveles
        ? `\n       visible ${visibleIgual ? "Δ0" : `DISTINTO (${a.visible} → ${b.visible})`}` +
          ` · filas RSC ${filasIguales ? `Δ0 (${a.nFilas})` : `DISTINTAS (${a.nFilas} → ${b.nFilas})`}` +
          (!visibleIgual && a.visibleSinChunks === undefined
            ? `\n       ⚠ la base no trae \`visibleSinChunks\`: NO se puede descartar que sea sólo el nombre de chunk`
            : "")
        : `\n       (base sin niveles: no se puede decir si es contenido o reparto)`),
  );
}
/* Lo que SE COMPARÓ, no lo que se intentó: `comunes` menos las que erraron. Se
 * nombra una vez y la usan el contrato Y el titular, para que no puedan
 * discrepar (`CLAUDE.md` §sondas 1: un solo canal de verdad). */
const comparadas = comunes.length - sinComparar;
const iguales = comparadas - distintas - soloReparto - renumeradas - bundle;
console.log(
  `\n  ${iguales - soloVolatil} idénticas byte a byte · ${soloVolatil} sólo el BUILD_ID · ` +
    `${soloReparto} sólo el reparto del stream RSC · ${renumeradas} sólo renumeración RSC · ` +
    `${bundle} sólo el NOMBRE DE CHUNK (otro bundle cliente) · ${distintas} DISTINTAS`,
);

/**
 * Segundo contrato, con su propio mínimo: se puede medir las 426 y comparar
 * CERO si la base es de otro conjunto de rutas (`CLAUDE.md` §sondas 4bis).
 *
 * ── EL LISTÓN TIENE DOS MITADES Y AQUÍ SÓLO ESTABA LA PRIMERA (122.ª) ──────
 * Que el listón lo ponga **el fichero de comparación y no el build** es cierto,
 * y es lo que justifica no usar `RUTAS.length`. **No justifica el `1`**: el
 * fichero de comparación también dice CUÁNTAS, y es `comunes` —calculado unas
 * líneas más arriba, antes de comparar nada—.
 *
 * Con `minimo: 1`, este contrato salía **verde habiendo comparado 1 ruta de
 * 426**: bastaban 425 errores de medida y una sola comparación. Y el `1` no
 * sólo no protegía: **hacía inerte** la protección estructural de §4bis, que es
 * que el gancho de salida fuerce el veredicto aunque la sonda no mire su propio
 * contador.
 *
 * ⚠ El `Math.max(1, …)` impide que el sabotaje MUEVA LA PORTERÍA (§regla 17):
 * una base de otro conjunto de rutas lleva `comunes` a 0, y con el listón a 0
 * «0 de 0» sería suficiente. Con el suelo en 1 sale **NO SE PUDO EVALUAR**.
 *
 * ⚠ Cardinal de §regla 25 —rechazos legítimos que añade— **0, demostrado**:
 * `mal` es falso sólo si `idas.length === 0 && sinComparar === 0`, y entonces
 * `comparadas === comunes.length === minimo`.
 */
const evCmp = new Evaluadas({
  nombre: `html-cmp vs ${etiqueta}`,
  unidad: "rutas comparadas",
  minimo: Math.max(1, comunes.length),
});
evCmp.ok(comparadas);
const fallosCmp = evCmp.informe();

const mal = distintas > 0 || idas.length > 0 || sinComparar > 0 || fallosEv > 0 || fallosCmp > 0;
console.log(
  `\n${mal ? "❌" : "✅"} ${comparadas} de ${comunes.length} rutas comparadas · ` +
    `${distintas} con CONTENIDO distinto · umbral CERO en el marcado VISIBLE (la puerta)` +
    (soloReparto
      ? `\n   (${soloReparto} con el mismo contenido y otro reparto del stream — contadas aparte, no son Δ0)`
      : "") +
    (renumeradas
      ? `\n   (${renumeradas} con la carga RSC RENUMERADA e invariantes quietos — nivel informativo, no son Δ0)`
      : "") +
    (bundle
      ? `\n   (${bundle} con el MISMO marcado y otro NOMBRE DE CHUNK: el bundle cliente cambió — contadas aparte, no son Δ0)`
      : ""),
);
  await parar();
  /* Mismo motivo que la guarda de UBICUIDAD: `exitCode` y no `exit()`, para que
   * el código de salida sea el que la sonda decidió y no una aserción de libuv
   * ganándole la carrera al socket de `fetch`. */
  process.exitCode = mal ? 1 : 0;
}
