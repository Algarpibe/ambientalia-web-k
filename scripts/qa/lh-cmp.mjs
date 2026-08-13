/**
 * EL COMPARADOR DE DOS LADOS DE LOS LISTADOS — par a par, nodo × propiedad.
 * Uso: node scripts/qa/lh-cmp.mjs [1440|390]          (npm run qa:lh-cmp)
 *      node scripts/qa/lh-cmp.mjs [1440|390] --vivo   (npm run qa:lh-cmp-vivo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE ANTES DE QUE HAYA NADA QUE COMPARAR
 *
 * §UN ARQUETIPO NUEVO NO HEREDA COBERTURA: *«toda tanda de construcción cierra
 * con una sonda comparadora DE DOS LADOS; si para ese arquetipo no existe,
 * construirla es parte de la tanda, no un extra»*. Y se escribe **antes** de la
 * plantilla por una razón que el proyecto ya pagó: un comparador escrito después
 * acaba **calibrado contra lo que el clon ya hace**, que es la forma más cara de
 * fabricar un verde.
 *
 * Hoy, por tanto, esta sonda **tiene que salir ROJA**: el clon no emite las
 * rutas de listado. Eso no es un fallo — es el estado inicial correcto, y está
 * declarado abajo en §EL ESTADO INICIAL.
 *
 * ── La unidad es el PAR, no el Δ0 de página ───────────────────────────────
 * **Un total puede ser dos errores que se anulan** (`CLAUDE.md` §El principio).
 * Un `docH` idéntico no dice que el listado esté bien: dice que la suma
 * coincide. Aquí se compara **cada propiedad de cada nodo** y, cuando algo no
 * cuadra, se nombra con su camino (`listado.tarjetas.0.titulo.tipo.fontSize`).
 *
 * ── Un solo barrido, los dos lados ────────────────────────────────────────
 * `lh-barrido.mjs`, el mismo que escribió `lh-spec` para el original. Dos copias
 * serían la clase C7 con su peor salida: los dos verdes en su marco midiendo
 * cosas distintas. El barrido busca por **ROLES** (con el selector que casó al
 * lado), así que vale para los dos dialectos sin una tabla de traducción.
 *
 * ── La BASE de lectura, y su mitad que sólo se puede pagar aquí ───────────
 * Por forma: el `h1` donde lo hay, la **primera tarjeta** en `L2` — que no tiene
 * `h1`, y eso es **propiedad de su plantilla** (`D4b`), no una anomalía.
 *
 * ⚠ **`P-LH-C8` cobra aquí su segunda mitad.** `D4b.1` verificó que el ancla
 * EXISTE en los 12 documentos de `L2`; lo que no podía comprobar —porque no
 * había segundo lado— es que sea **EL MISMO ELEMENTO** en original y clon. Es el
 * criterio de `qa:c-cabecera`, que existe justamente porque *un selector puede
 * casar en los dos lados y apuntar a cosas distintas*. Aquí se compara la
 * **marca** (etiqueta + 3 clases) además de la `y`, y si difieren la sonda lo
 * dice y **no normaliza nada contra esa base**.
 *
 * ── Y la base se reporta EN CRUDO ─────────────────────────────────────────
 * §*la regla del `h1` es CIEGA A SU PROPIO PUNTO DE APOYO*: restar la base antes
 * de comparar normaliza a cero **un desfase que viva EN la base**. Así que se
 * publican las dos lecturas — `baseCruda` (la `y` absoluta de los dos lados, sin
 * restar) y los deltas del cuerpo ya normalizados — y **la cruda va primero**.
 *
 * ── El suelo de ruido: NO HAY, y por eso se dice ──────────────────────────
 * ⚠ Estas rutas **no tienen campaña de ruido**. Un residuo pequeño aquí **no es
 * «limpio»: es SIN PROBAR**, y no se puede rodear leyendo el suelo de otra ruta
 * —un suelo es propiedad *de las rutas medidas*—. La sonda lo imprime en cada
 * corrida para que ningún acta lo olvide.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL ESTADO INICIAL, declarado para que su rojo no se lea como regresión
 *
 * Mientras el clon no emita `/blog`, `/etiqueta/*`, `/recursos/*`, `/glosario`,
 * `/preguntas-frecuentes`, `/scientific-category/*` y `/casos-de-exito`, cada
 * forma cuenta como **AUSENTE** y la sonda sale con 2. La lista de ausentes es
 * el trabajo que queda, y por eso se imprime entera.
 * ═════════════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { barrer } from "./lh-barrido.mjs";
/* ⚠ El clasificador de ejes vive FUERA desde el 2026-08-13, y no por estética:
 * el alcance verificable de una tanda hay que declararlo **antes** de construir,
 * y preguntárselo a este fichero costaba arrancar el clon (`iniciarClon()` corre
 * al importarlo). Reescribirlo en la sonda de alcance habría sido la clase C7
 * —dos verdes en su marco midiendo cosas distintas—, que es exactamente el
 * argumento que ya está escrito arriba para `lh-barrido.mjs`. */
import { aplana, censaEjes, ejeDe, IGNORAR } from "./lh-ejes.mjs";
import { Censo, Evaluadas, env, gritaSiRevienta, hoy, iniciarClon, launch, openPage, QA, settle, w } from "./lib.mjs";

const ARGS = process.argv.slice(2);
const ANCHO = Number(ARGS.find((a) => /^\d+$/.test(a)) || 1440);
const MOVIL = ANCHO <= 500;
const VIVO = ARGS.includes("--vivo") || !!env("VIVO");

const SABOTAJES = ["clon-ciego", "base-distinta", "sin-espejo"];
const SABOTAJE = process.env.SABOTAJE || null;
if (SABOTAJE && !SABOTAJES.includes(SABOTAJE)) throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${SABOTAJES.join(" · ")})`);

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ EL ORDEN IMPORTA: LAS PRECONDICIONES BARATAS, ANTES DE ARRANCAR EL CLON
 *
 * La primera versión llamaba a `iniciarClon()` aquí arriba y validaba el espejo
 * después. Funcionaba… y **colgaba el test en negativo**: al tirar por «ESPEJO
 * AUSENTE» el `next start` se quedaba huérfano, su pipe seguía abierto, y el
 * `spawnSync` de `corridaNegativa` **esperaba para siempre** a un hijo que ya
 * había muerto. 20 minutos de negativo sin pasar del primer caso.
 *
 * La regla que deja: **no se adquiere un recurso caro antes de comprobar lo que
 * se puede comprobar gratis.** Un fallo de precondición tiene que poder salir
 * sin haber arrancado nada.
 * ═════════════════════════════════════════════════════════════════════════ */

/* ── El universo: DERIVADO de la spec congelada, no escrito a mano ─────────
 * Las claves de `lh-spec` son las formas medidas del original. Si mañana se
 * mide una décima, entra sola — igual que en `enlaces.mjs`. */
const ESPEJO_F = join(QA, `medidas/lh-spec-${ANCHO}.json`);
if (!existsSync(ESPEJO_F) || SABOTAJE === "sin-espejo")
  throw new Error(
    `ESPEJO AUSENTE: no existe medidas/lh-spec-${ANCHO}.json.\n` +
      `  Sin el lado ORIGINAL no hay comparación posible, y su cero saldría como\n` +
      `  «0 pares con diferencia» — un verde de una sonda que no miró (§sondas 4bis).`,
  );
const ESPEJO = JSON.parse(readFileSync(ESPEJO_F, "utf8"));

const { base: CLON, parar: pararClon } = await iniciarClon();
gritaSiRevienta(pararClon);

/** `/es/glosario/` → `/glosario` (la regla de rutas locales: sin `/es`, sin barra final). */
const aClon = (r) => CLON + r.replace(/^\/es/, "").replace(/\/$/, "");

/**
 * ⚠ **La clave de `lh-spec.paginas` es `"<forma>::<ruta>"`, no la forma sola** —
 * porque hay **12 páginas y 9 formas**: `L1-etiqueta`, `L1-resources-hijo` y
 * `L3-sci` traen su segunda instancia, que es lo que permite el test de varianza
 * intra-familia. Partir por la forma perdería una de cada par **en silencio**, y
 * el recuento saldría plausible (9 en vez de 12).
 *
 * Se deriva del propio fichero y **se comprueba** que las dos mitades existen:
 * una clave sin `::` significa que el formato cambió, y entonces el universo se
 * habría quedado a medias sin dar error.
 */
const FORMAS = Object.entries(ESPEJO.paginas ?? {})
  .filter(([, v]) => v && !v.error)
  .map(([clave, v]) => {
    const i = clave.indexOf("::");
    if (i < 0) throw new Error(`clave sin '::' en lh-spec.paginas: '${clave}'. El formato cambió y el universo saldría a medias.`);
    const forma = clave.slice(0, i);
    const ruta = clave.slice(i + 2);
    return { clave, forma, ruta, original: `https://kunakair.com${ruta}`, clon: aClon(ruta), espejo: v };
  });

if (!FORMAS.length)
  throw new Error(
    "0 formas en el espejo: sin universo no hay comparación.\n" +
      "  Un cero aquí se leería como «nada que comparar», que es la regla del cero.",
  );

/* ══════════════════════════════════════════════════════════════════════════
 * EL APLANADO — de dos árboles a un conjunto de PARES comparables
 *
 * Se comparan **valores escalares** por su camino. Las listas de longitud
 * distinta no se emparejan por índice a ciegas: la longitud es ella misma un
 * par (`listado.nTarjetas`), y los índices que faltan salen como AUSENTE en un
 * lado — que es información, no un hueco.
 * ═════════════════════════════════════════════════════════════════════════ */
/* `IGNORAR` y `aplana` viven en `lh-ejes.mjs` — ver el `import` y su cabecera. */

/** Números: se comparan con 2 decimales, que es la precisión que congela el barrido. */
const igual = (a, b) => {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 0.01;
  return a === b;
};

/* ══════════════════════════════════════════════════════════════════════════
 * LA REFERENCIA SE DECLARA POR EJE, Y UN PAR SIN EJE NO ES UN PAR
 *
 * §F3-LH-DOS-FOTOS: el clon se siembra del **corpus** (F3-0) y esta sonda mide
 * contra el **espejo** (`lh-spec`, en vivo el 2026-08-11). Son dos fotos del
 * original en fechas distintas, así que **un Δ de TEXTO no distingue «el clon
 * está mal» de «el original cambió entre las dos fotos»**.
 *
 * Eso no se arregla re-capturando —la siguiente foto vuelve a derivar—: se
 * arregla **declarando contra qué lado se mide cada propiedad**:
 *
 * | eje | referencia | por qué |
 * |---|---|---|
 * | `contenido` | **el CORPUS** del que se sembró el clon | comparar el texto contra el vivo mide la deriva del ORIGINAL, no la fidelidad del clon |
 * | `plantilla` | **el ORIGINAL vivo** (el espejo) | la plantilla no deriva, y ahí es donde vive la fidelidad |
 * | `mixta` | **ninguna de las dos, limpia** | ver el ESCALÓN de abajo |
 *
 * ── ⚠ EL ESCALÓN, DECLARADO Y NO ESCONDIDO ───────────────────────────────
 * Hay un tercer grupo que **no cae limpio en ninguno de los dos**: las
 * magnitudes que dependen **de las dos cosas a la vez**. El alto de una tarjeta
 * es plantilla *y* cuánto texto trae; `renglones` es tipografía *y* longitud;
 * `nTarjetas` es «entradas por página» (plantilla) *y* cuántas quedan
 * (contenido); y `clases`/`marca` de una tarjeta mezclan las clases del tema
 * con `post-68584`, `category-*` y `tag-*`, que son del dato.
 *
 * **Medirlas contra el espejo las hace absorber la deriva del contenido; contra
 * el corpus, la geometría de un render sin hojas.** O sea §La causa común otra
 * vez, y el contenedor es **el eje**: una magnitud mixta leída contra una sola
 * referencia se traga la otra variable sin dejar rastro en el número.
 *
 * Lo que esta sonda hace con ellas es lo único honesto que puede hacer hoy:
 * **contarlas aparte y NO leerlas como defecto**. La referencia que las
 * arreglaría es una tercera —el corpus RENDERIZADO con sus hojas capturadas—, y
 * construirla es una tanda, no un parámetro.
 *
 * ── Y por qué el clasificador TIRA en vez de tener un defecto ─────────────
 * §regla 6: *un valor por defecto convierte «no lo sé» en «está bien»*. Un
 * `?? "plantilla"` aquí metería toda propiedad nueva en el eje que se compara
 * contra el vivo, **en silencio**. Un camino sin eje declarado sale por ERROR
 * con su nombre, que es la única forma de que el escalón dispare por mecanismo
 * y no porque alguien se acordara de mirar.
 * ═════════════════════════════════════════════════════════════════════════ */

/* `ejeDe()` vive en `lh-ejes.mjs` con su tabla de hojas y sus tres reglas por
 * camino — ver el `import` y la cabecera de ese fichero. */

/**
 * LA DERIVA CONOCIDA — **derivada de `lh-extracto`, no escrita a mano** (§regla
 * 9). Son los titulares que cambiaron entre el corpus y el espejo: salen del
 * saco de «defecto» **con su nombre y su fecha**, y no se normalizan.
 */
const DERIVA_F = join(QA, "medidas/lh-extracto.json");
const DERIVA = existsSync(DERIVA_F) ? JSON.parse(readFileSync(DERIVA_F, "utf8")) : null;
const derivaConocida = new Set();
for (const f of DERIVA?.deriva?.porForma ?? [])
  for (const t of f.titularesQueCambiaron ?? []) derivaConocida.add(`${f.forma}::listado.tarjetas.${t.i}.titulo.texto`);

/* ══════════════════════════════════════════════════════════════════════════
 * EL CENSO DE EJES — se hace ANTES del bucle, y no es cosmético
 *
 * Con las 13 formas AUSENTES el bucle de pares no llega a ejecutarse, así que
 * `ejeDe()` **no se ejercitaría** y el escalón del eje mixto no podría
 * dispararse: sería un sabotaje que no cambia nada (§sondas 8a). Clasificando
 * aquí el universo entero del espejo, la sonda dice **hoy** cuántos pares caen
 * en cada eje y **falla hoy** si aparece un camino sin clasificar.
 * ═════════════════════════════════════════════════════════════════════════ */
const censoEjes = { contenido: 0, plantilla: 0, mixta: 0 };
const sinClasificar = [];
for (const F of FORMAS) {
  const { censo, sinClasificar: sc } = censaEjes(F.espejo);
  for (const e of Object.keys(censoEjes)) censoEjes[e] += censo[e];
  for (const k of sc) if (sinClasificar.length < 40) sinClasificar.push(`${F.clave}::${k}`);
}
if (sinClasificar.length)
  throw new Error(
    `PARES SIN EJE DECLARADO: ${sinClasificar.length} camino(s) no caen en 'contenido', 'plantilla' ni 'mixta'.\n` +
      sinClasificar.slice(0, 12).map((s) => `    · ${s}`).join("\n") +
      `\n  La referencia se declara POR EJE (§F3-LH-DOS-FOTOS). Un defecto los mediría\n` +
      `  contra el vivo sin decirlo — clasifícalos en ejeDe() o declara el ESCALÓN.`,
  );

const { browser } = await launch();
const censo = new Censo();

/* El mínimo se DERIVA del lado original: si el clon no emite un nodo, su clave
 * falta y el recuento cae por debajo del mínimo — o sea que «no emitir» no
 * puede salir verde. */
const ev = new Evaluadas({ nombre: `lh-cmp@${ANCHO}${VIVO ? "-vivo" : ""}`, unidad: "formas comparadas", minimo: FORMAS.length });

/**
 * ⚠ **`openPage` devuelve `{ page, client, status }`, no la página.** La primera
 * versión de esta sonda hacía `page.__status ?? 200` — o sea **200 siempre**, un
 * número plausible que habría hecho pasar una 404 por una página buena. Es el
 * modo de fallo que `lib.mjs` documenta en `openPage` con su medida (*22 de 31
 * sondas no miraban el estado*), reproducido aquí a la primera. §sondas 1: una
 * sonda nueva llega con defectos, y el único control es mirar su salida contra
 * algo que ya sabes.
 */
const mide = async (url) => {
  const { page, status } = await openPage(browser, url, { width: ANCHO, height: MOVIL ? 844 : 900, mobile: MOVIL, dsf: 1 });
  try {
    /* Una 404 CARGA BIEN y se mide como una página buena: se corta antes. */
    if (status >= 400 || status === 0) return { status, datos: null };
    await settle(page);
    /* `censo.medir`, no `page.evaluate`: el barrido usa `__q` —el `querySelector`
     * censado— y sin la inyección del `Censo` ni siquiera está definido. Es la
     * misma llamada que hace `lh-spec`, y por eso los dos lados salen del mismo
     * instrumento hasta el último detalle. */
    const { datos } = await censo.medir(page, barrer);
    return { status, datos };
  } finally {
    await page.close().catch(() => {});
  }
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL TERCER LADO: EL CORPUS, que es la referencia del eje `contenido`
 *
 * Se mide con **el mismo `barrer()`** que los otros dos —dos definiciones
 * serían la clase C7, y este fichero ya tiene escrito por qué— pero cargando el
 * HTML congelado y **abortando todo subrecurso**: hojas, imágenes, fuentes y
 * scripts.
 *
 * ⚠ **De esta medición se lee SÓLO el eje `contenido`, y no es una precaución:
 * es que su geometría es BASURA POR CONSTRUCCIÓN.** Sin hojas, Divi no parte en
 * columnas —§F3-1-CSS-NO-CAPTURADO lo midió: `columna.width` **678.52 offline
 * contra 430.80 en vivo**—. Leer un `rect` de aquí daría números plausibles y
 * falsos, que es el modo de fallo más caro del repo.
 * ═════════════════════════════════════════════════════════════════════════ */
const CORPUS = "corpus/fase-3/listados";
const aCorpus = (r) => join(CORPUS, `${r.replace(/^\/es/, "").replace(/^\//, "").replace(/\/$/, "")}/index.html`);

const mideCorpus = async (ruta) => {
  const f = aCorpus(ruta);
  if (!existsSync(f)) return { falta: f, datos: null };
  /* ⚠ `browser.newPage()` y **no** `openPage`, a propósito: el corpus es un
   * fichero local ya comprobado con `existsSync`, así que no hay estado HTTP que
   * mirar — y `openPage` sobre `about:blank` imprimía **13 «❌ HTTP 0»** que se
   * leen como fallo de la sonda. Un aviso correcto en el sitio equivocado es
   * ruido que tapa el informe, que es lo que §sondas 1 llama un solo canal de
   * verdad: lo que imprime y lo que cuenta no pueden discrepar. */
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: ANCHO, height: MOVIL ? 844 : 900, isMobile: MOVIL, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (r.isInterceptResolutionHandled?.()) return;
      /* El documento entra por `setContent`, así que TODO lo que pida la página
       * es subrecurso y se aborta. Nada de red: el corpus es la fuente. */
      r.abort().catch(() => {});
    });
    await page.setContent(readFileSync(f, "utf8"), { waitUntil: "domcontentloaded" });
    const { datos } = await censo.medir(page, barrer);
    return { falta: null, datos };
  } finally {
    await page.close().catch(() => {});
  }
};

const salida = {
  meta: {
    fecha: hoy(),
    que: `COMPARADOR de dos lados de listados, par a par, a ${ANCHO}`,
    ladoOriginal: VIVO ? "kunakair.com VIVO en esta corrida" : `medidas/lh-spec-${ANCHO}.json (congelado ${ESPEJO.meta?.fecha ?? "?"})`,
    ladoClon: CLON,
    unidad: "el PAR (camino × propiedad), NO el Δ0 de página",
    ruido:
      "⚠ estas rutas NO tienen campaña de ruido: un residuo pequeño es SIN PROBAR, no «limpio». " +
      "Un suelo es propiedad de las rutas medidas y no se hereda de otra.",
    baseDeLectura: "h1 donde lo hay; primera tarjeta en L2 (D4b/D4b.1). P-LH-C8: se verifica que sea EL MISMO ELEMENTO.",
  },
  formas: {},
};

console.log(`\n════════ LISTADOS · COMPARADOR DE DOS LADOS @${ANCHO} ════════`);
console.log(`  original   ${salida.meta.ladoOriginal}`);
console.log(`  clon       ${CLON}`);
console.log(`  corpus     ${CORPUS}   ← referencia del eje 'contenido' (§F3-LH-DOS-FOTOS)`);
console.log(`  deriva     ${derivaConocida.size} pares de titular EXCLUIDOS por conocidos${DERIVA ? "" : "   ⚠ sin medidas/lh-extracto.json: 0 exclusiones"}`);
console.log(`  formas     ${FORMAS.length}`);
console.log(
  `  ejes       contenido ${censoEjes.contenido} · plantilla ${censoEjes.plantilla} · MIXTOS ${censoEjes.mixta}` +
    `   (censo del universo del espejo, ${censoEjes.contenido + censoEjes.plantilla + censoEjes.mixta} caminos)\n`,
);

let ausentes = 0;
let conDiferencia = 0;
let paresTotales = 0;
let paresDistintos = 0;
/* §F3-LH-DOS-FOTOS · los tres recuentos que el eje obliga a llevar aparte. */
let paresMixtos = 0;
let mixtasQueDifieren = 0;
let derivaExcluida = 0;
let sinReferencia = 0;
let corpusOk = 0;
let corpusCaminos = 0;
const faltanCorpus = [];
const basesQueNoCasan = [];

for (const F of FORMAS) {
  const orig = VIVO ? (await mide(F.original)).datos : F.espejo;
  /* ⚠ **El corpus se mide ANTES del corte por AUSENTE, y no es orden casual.**
   * Estando dentro del `if (sirve)` sería código que **no se ejecuta mientras
   * las 13 formas estén ausentes**, o sea la referencia del eje `contenido`
   * declarada y nunca ejercitada — §sondas 8a: *un sabotaje que no cambia nada
   * no prueba la guarda*, y aquí ni siquiera habría sabotaje: habría una rama
   * muerta con aspecto de instrumento. Medido aquí, su recuento sale hoy. */
  const rc = await mideCorpus(F.ruta);
  if (rc.falta) faltanCorpus.push({ forma: F.clave, fichero: rc.falta });
  else corpusOk++;
  const pK = rc.datos ? aplana(rc.datos) : null;
  if (pK) corpusCaminos += pK.size;

  let clon = null;
  let status = null;
  try {
    const r = await mide(SABOTAJE === "clon-ciego" ? `${CLON}/no-existe-esta-ruta-jamas` : F.clon);
    status = r.status;
    clon = r.datos;
  } catch (e) {
    status = `ERR ${e.message?.slice(0, 60)}`;
  }

  /* ── ¿el clon sirve esta forma? ──────────────────────────────────────────
   * Una ruta que no existe NO es «0 pares con diferencia». Es una forma sin
   * medir, y cuenta como ausente para el contrato. */
  const sirve = !!clon && clon.listado && (clon.listado.nTarjetas > 0 || clon.esqueleto?.nSecciones > 0);
  if (!sirve) {
    ausentes++;
    salida.formas[F.clave] = { ruta: F.ruta, clon: F.clon, estado: "AUSENTE", status, nota: "el clon no emite (o no sirve contenido) en esta ruta" };
    console.log(`  ⛔ ${F.clave.padEnd(46)} AUSENTE   (${F.clon.replace(CLON, "")})`);
    continue;
  }

  /* ── LA BASE, en crudo y con P-LH-C8 ─────────────────────────────────────── */
  const bO = orig.baseEnCrudo ?? {};
  const bC = clon.baseEnCrudo ?? {};
  const anclaO = bO.hayH1 ? { que: "h1", marca: bO.etiqueta ?? "h1", y: bO.yAbsoluta } : { que: bO.anclaAlternativa?.que ?? null, marca: bO.anclaAlternativa?.marca ?? null, y: bO.anclaAlternativa?.yAbsoluta ?? null };
  const anclaC = bC.hayH1 ? { que: "h1", marca: bC.etiqueta ?? "h1", y: bC.yAbsoluta } : { que: bC.anclaAlternativa?.que ?? null, marca: bC.anclaAlternativa?.marca ?? null, y: bC.anclaAlternativa?.yAbsoluta ?? null };
  const mismaBase = anclaO.que === anclaC.que && (SABOTAJE === "base-distinta" ? false : anclaO.marca === anclaC.marca);
  if (!mismaBase) basesQueNoCasan.push({ forma: F.forma, original: anclaO, clon: anclaC });

  /* ── LOS PARES, CADA UNO CONTRA LA REFERENCIA DE SU EJE ──────────────────── */
  const pO = aplana(orig);
  const pC = aplana(clon);

  const dif = [];
  const porEje = { contenido: 0, plantilla: 0, mixta: 0 };
  const difPorEje = { contenido: 0, plantilla: 0, mixta: 0 };
  let derivados = 0;
  for (const [k, v] of pO) {
    if (IGNORAR.has(k)) continue;
    const eje = ejeDe(k);
    /* §regla 6 · un par sin eje declarado NO es un par: sale por error con su
     * nombre, nunca por un defecto que lo mete en el eje del vivo en silencio. */
    if (!eje)
      throw new Error(
        `PAR SIN EJE DECLARADO: '${k}' (forma ${F.clave}).\n` +
          `  La referencia se declara POR EJE (§F3-LH-DOS-FOTOS) y este camino no cae\n` +
          `  en 'contenido', 'plantilla' ni 'mixta'. Un defecto aquí lo mediría contra el\n` +
          `  vivo sin decirlo — clasifícalo en ejeDe() o declara el ESCALÓN.`,
      );
    paresTotales++;
    porEje[eje]++;

    /* La referencia: corpus para el contenido, espejo para la plantilla. */
    let ref = v;
    let contra = eje === "contenido" ? "corpus" : "espejo";
    if (eje === "contenido") {
      if (!pK) { sinReferencia++; continue; }   // sin corpus no hay par de contenido
      ref = pK.has(k) ? pK.get(k) : "«AUSENTE»";
    }
    /* Las mixtas se miden contra el espejo para poder enseñarlas, pero **no
     * cuentan como defecto**: no tienen referencia limpia (§ESCALÓN). */
    const w2 = pC.has(k) ? pC.get(k) : "«AUSENTE»";
    if (igual(ref, w2)) continue;

    /* Deriva CONOCIDA del original entre las dos fotos: no es defecto del clon. */
    if (derivaConocida.has(`${F.clave}::${k}`)) { derivados++; continue; }

    difPorEje[eje]++;
    if (eje !== "mixta") paresDistintos++;
    dif.push({ camino: k, eje, contra, referencia: ref, clon: w2, ...(eje === "mixta" ? { noEsDefecto: "sin referencia limpia (§ESCALÓN eje mixto)" } : {}) });
  }
  if (difPorEje.contenido || difPorEje.plantilla) conDiferencia++;
  paresMixtos += porEje.mixta;
  mixtasQueDifieren += difPorEje.mixta;
  derivaExcluida += derivados;
  ev.ok(1);

  salida.formas[F.clave] = {
    ruta: F.ruta,
    clon: F.clon,
    estado: dif.length ? "CON DIFERENCIAS" : "Δ0",
    /* ⚠ La cruda va PRIMERO y sin restar: es lo único que puede ver un desfase
     * que viva EN la base (§la regla es ciega a su punto de apoyo). */
    baseCruda: { original: anclaO, clon: anclaC, mismaBase, delta: anclaO.y !== null && anclaC.y !== null ? +(anclaC.y - anclaO.y).toFixed(2) : null },
    pares: pO.size,
    porEje,
    difPorEje,
    derivaExcluida: derivados,
    corpus: rc.falta ? `AUSENTE (${rc.falta})` : aCorpus(F.ruta),
    distintos: dif.length,
    diferencias: dif.slice(0, 400),
  };
  const real = difPorEje.contenido + difPorEje.plantilla;
  console.log(
    `  ${real ? "⚠" : "✓"} ${F.clave.padEnd(46)} ${String(real).padStart(4)} de ${String(porEje.contenido + porEje.plantilla).padStart(4)} pares` +
      `  [cont ${difPorEje.contenido}/${porEje.contenido} · plant ${difPorEje.plantilla}/${porEje.plantilla}]` +
      `  mixtas ${difPorEje.mixta}/${porEje.mixta}` +
      `  base ${mismaBase ? "misma" : "⛔ DISTINTA"} (Δ ${salida.formas[F.clave].baseCruda.delta ?? "—"})`,
  );
}

salida.resumen = {
  formas: FORMAS.length,
  ausentesEnElClon: ausentes,
  conDiferencias: conDiferencia,
  paresComparados: paresTotales,
  paresDistintos,
  /* Los mixtos NO entran en `paresDistintos`: no tienen referencia limpia. */
  paresMixtos,
  mixtasQueDifieren,
  derivaExcluida,
  paresDeContenidoSinCorpus: sinReferencia,
  formasSinCorpus: faltanCorpus.length,
  basesQueNoCasan: basesQueNoCasan.length,
};
salida.faltanCorpus = faltanCorpus;
salida.basesQueNoCasan = basesQueNoCasan;
salida.ejes = {
  contenido: "referencia = el CORPUS del que se sembró el clon (corpus/fase-3/listados)",
  plantilla: `referencia = el ORIGINAL (${salida.meta.ladoOriginal})`,
  mixta:
    "SIN referencia limpia: depende de la plantilla Y del contenido a la vez (alto, y, renglones, " +
    "nTarjetas, clases, marca). Se cuentan y se enseñan, NO se leen como defecto.",
};

console.log(`\n  ── el recuento, en la unidad que compara ──`);
console.log(`  formas                 ${FORMAS.length}`);
console.log(`  AUSENTES en el clon    ${ausentes}`);
console.log(`  con diferencias        ${conDiferencia}`);
console.log(`  pares comparados       ${paresTotales}`);
console.log(`  pares distintos        ${paresDistintos}   (contenido + plantilla; los mixtos NO cuentan)`);
console.log(`  ── y los tres que el EJE obliga a llevar aparte ──`);
console.log(`  pares MIXTOS           ${paresMixtos}, de los que difieren ${mixtasQueDifieren}   ⚠ sin referencia limpia (§ESCALÓN)`);
console.log(`  deriva CONOCIDA        ${derivaExcluida} pares excluidos por §F3-LH-DOS-FOTOS (el original cambió, no el clon)`);
console.log(`  contenido sin corpus   ${sinReferencia} pares · ${faltanCorpus.length} formas sin fichero`);
console.log(`  CORPUS leído           ${corpusOk}/${FORMAS.length} formas · ${corpusCaminos} caminos   (referencia del eje 'contenido')`);
console.log(`\n  ⚠ sin campaña de ruido en estas rutas: un residuo pequeño es SIN PROBAR, no «limpio».`);

for (const b of basesQueNoCasan)
  console.log(`  ⛔ P-LH-C8 · ${b.forma}: original ${b.original.que}/${b.original.marca} → clon ${b.clon.que}/${b.clon.marca}`);

w(`medidas/lh-cmp-${ANCHO}${VIVO ? "-vivo" : ""}.json`, salida);
const muertos = censo.informe?.() ?? 0;
await pararClon?.();

let codigo = 0;
if (ausentes) {
  console.log(
    `\n⛔ ${ausentes} de ${FORMAS.length} formas AUSENTES en el clon — no hay nada que comparar en ellas.\n` +
      `   Es el ESTADO INICIAL declarado: el comparador existe antes que la plantilla,\n` +
      `   a propósito, para que no acabe calibrado contra lo que el clon ya hace.`,
  );
  codigo = 2;
} else if (basesQueNoCasan.length) {
  console.log(`\n⛔ P-LH-C8: ${basesQueNoCasan.length} forma(s) con la base apuntando a ELEMENTOS DISTINTOS. No se normaliza nada contra eso.`);
  codigo = 2;
} else if (paresDistintos) {
  console.log(`\n⚠ ${paresDistintos} pares distintos en ${conDiferencia} formas. Cada uno con su camino en la congelada.`);
  codigo = 2;
} else if (muertos) codigo = 2;
else
  console.log(
    `\n✅ ${paresTotales} pares · 0 distintos · ${FORMAS.length} formas · bases verificadas (P-LH-C8).\n` +
      `   contenido contra el CORPUS · plantilla contra el ORIGINAL · ${paresMixtos} mixtos sin referencia limpia.`,
  );

/**
 * ⚠ **`process.exit()` explícito, y no es cosmético.** Con sólo `exitCode`, Node
 * espera a que se vacíe el event loop — y el `next start` que arrancó
 * `iniciarClon` deja handles vivos, así que **el proceso no sale**. Corriendo a
 * mano no se nota (la consola ya imprimió todo); dentro de `corridaNegativa`,
 * que usa `spawnSync`, el arnés **espera hasta agotar su timeout**: 3 casos ×
 * 15 min = 45 minutos de negativo que parecía colgado y sólo estaba esperando.
 *
 * Es el patrón que `kb-cmp` ya tenía y que copiar habría evitado. La forma
 * general: **una sonda que adquiere un proceso hijo termina ella, no espera a
 * que el runtime decida que puede.**
 */
process.exit(codigo);
