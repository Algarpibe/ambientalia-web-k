/**
 * EL COLOCADOR — de `media-corpus/` a `apps/web/public`, con las variantes
 * regeneradas. Es el paso que la campaña de captura NO hace y sin el cual la
 * siembra muere igual.
 * Uso: npm run cms:coloca-media        (SOLO_DERIVA=1 → dice qué haría y no toca nada)
 * Negativo: npm run cms:coloca-media-neg
 *
 * ── Por qué existe, y por qué no es «parte de la captura» ─────────────────
 * `qa:media-siembra` midió el hueco **contra la guarda que para** —el fichero
 * EXACTO en `apps/web/public`— y salieron **1889 rutas**, de las cuales sólo
 * **393 orígenes** hay que pedirle al original. Las otras **1489 (78.8 %) ya
 * están**: unas en `media-corpus/` desde la captura de F2-2, y otras son
 * variantes `-WxH` que `sharp` sabe fabricar.
 *
 * O sea que entre «capturado» y «sembrable» hay un paso que **no es de red**, y
 * no tenerlo escrito es exactamente la trampa de §*una afirmación de completitud
 * se verifica ejercitándola*: la captura se declararía completa y el seed
 * moriría en el primer `MEDIA AUSENTE`.
 *
 * ── Las dos operaciones, y por qué la segunda no es una licencia ──────────
 *   1 · **COPIAR** el origen de `media-corpus/` (o de `media-corpus/datos/`,
 *       `fase-3/`) a `apps/web/public/images/uploads/`. Bytes idénticos: es una
 *       copia, no una conversión;
 *   2 · **REGENERAR** la variante `-WxH` desde su origen con `sharp`. Esto **no
 *       se decide aquí**: `qa:media-regenera` ya midió que el pipeline real
 *       reproduce la dimensión exacta (**73/73**), y por eso las campañas de
 *       captura de este repo **no piden variantes**. Aquí sólo se ejecuta esa
 *       decisión ya tomada.
 *
 * > ⚠ **Y lo que se REGENERA no es byte a byte lo que sirve el original**, lo
 * > cual hay que decir en voz alta: coincide la **dimensión**, no el fichero.
 * > Es la misma renuncia que `media-regenera` dejó escrita —*«lo que no
 * > reproduce son bytes que no mueven un píxel»*— y el que quiera fidelidad de
 * > bytes en una variante tiene que capturarla, no regenerarla.
 *
 * ── Las guardas ───────────────────────────────────────────────────────────
 * · **la lista se DERIVA de la congelada de `media-siembra`**, no se recalcula:
 *   dos definiciones del hueco serían la clase C7 (y la segunda mediría contra
 *   la guarda cómoda, que es el defecto que esa sonda existe para no repetir);
 * · **`Evaluadas` con el mínimo derivado de esa lista** — colocar 0 de 1489 no
 *   es «ya estaba todo», es no haber hecho nada;
 * · **un origen que no aparece TIRA**: la campaña de captura decía que estaba, y
 *   si no está es que la congelada y el disco no cuentan lo mismo;
 * · **excepto los 404 declarados**: un origen que el ORIGINAL ya no sirve no se
 *   puede colocar, y eso está medido y congelado en `media-corpus/datos/INDICE.json`
 *   (`ausentesEnOrigen`). Se cuentan aparte y se nombran, nunca se descartan en
 *   silencio.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import sharp from "sharp";
import { Evaluadas, gritaSiRevienta, hoy, origenDe, QA, RE_VARIANTE, w } from "../qa/lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const RAIZ = join(QA, "../..");
const PUBLICO = join(RAIZ, "apps/web/public");
const MEDIA_CORPUS = join(RAIZ, "media-corpus");
const SOLO_DERIVA = !!process.env.SOLO_DERIVA;
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["lista-vacia", "origen-ausente"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

/* ── la lista, DERIVADA de la congelada ──────────────────────────────────── */
const FUENTE = join(QA, "medidas/media-siembra.json");
if (!existsSync(FUENTE))
  throw new Error(
    "no existe `medidas/media-siembra.json`: corre `npm run qa:media-siembra` antes.\n" +
      "  El hueco se DERIVA de ahí, no se recalcula aquí: dos definiciones de «lo que\n" +
      "  falta» serían la clase C7, y la segunda mediría contra la guarda cómoda.",
  );
const SIEMBRA = JSON.parse(readFileSync(FUENTE, "utf8"));
const pendientes = SABOTAJE === "lista-vacia" ? [] : Object.keys(SIEMBRA.faltan ?? {});
if (!pendientes.length)
  throw new Error(
    "0 rutas pendientes en `media-siembra.json`.\n" +
      "  Eso NO es «ya está todo colocado»: es una congelada que no se pudo leer, y su\n" +
      "  cero saldría como un colocador verde que no movió un fichero (regla 6).",
  );

/* ── el índice de `media-corpus/`, con sus tres subárboles ───────────────── */
const enCorpus = new Map(); // ruta relativa a uploads/ → fichero absoluto
(function barre(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) barre(p);
    else if (e.isFile() && !e.name.endsWith(".json")) {
      const rel = relative(MEDIA_CORPUS, p).split(sep).join("/").replace(/^(fase-3|datos)\//, "");
      if (!enCorpus.has(rel)) enCorpus.set(rel, p);
    }
  }
})(MEDIA_CORPUS);

/**
 * Los 404 DECLARADOS: el original ya no los sirve, así que no se pueden colocar.
 * Se leen de la congelada de la campaña — no se re-deciden aquí.
 */
const ausentes = new Set();
for (const f of ["datos", "fase-3"]) {
  const idx = join(MEDIA_CORPUS, f, "INDICE.json");
  if (!existsSync(idx)) continue;
  for (const a of JSON.parse(readFileSync(idx, "utf8")).ausentesEnOrigen ?? []) ausentes.add(a.fichero);
}

/* ── el trabajo ──────────────────────────────────────────────────────────── */
const aRel = (ruta) => decodeURIComponent(ruta).replace(/^\/images\/uploads\//, "");
const ev = new Evaluadas({ nombre: "coloca-media", unidad: "rutas pendientes", minimo: pendientes.length });

/**
 * ⚠ **EL CONTROL DEL REDIMENSIONADO — sin él, «1179 regeneradas» sólo dice que
 * `sharp` corrió 1179 veces, no que produjera lo que el original sirve.**
 *
 * WordPress nombra sus variantes con **las dimensiones REALES del fichero
 * producido**, así que el objetivo siempre es exactamente `WxH`; lo que no está
 * dicho en el nombre es si el recorte fue duro (`crop=true`) o un escalado
 * proporcional. **No se elige: se comprueba.** En `apps/web/public` ya conviven
 * variantes CAPTURADAS del original con sus orígenes, y regenerar ésas y
 * comparar dimensiones contesta la pregunta con el mismo instrumento que va a
 * hacer el trabajo.
 *
 * Es el mismo control que `qa:media-regenera` hizo para decidir **si** había que
 * capturar variantes (73/73); éste comprueba **cómo** se regeneran, que es la
 * mitad que aquella sonda no tenía que contestar.
 *
 * ⚠⚠ **Y EL CONTROL NO PUEDE CALIFICARSE A SÍ MISMO.** La primera versión tomaba
 * TODAS las variantes de `public/` — incluidas **las que esta misma sonda acaba
 * de regenerar**. Comparar mi regeneración contra mi regeneración da identidad
 * **por construcción**, y el número sube solo: pasó de `133/133` a `922/922`
 * mientras el control real seguía siendo el de las 133 CAPTURADAS.
 *
 * Es literalmente lo que `media-regenera` ya había dejado escrito —*«comparar un
 * fichero CONSIGO MISMO … sale `sha256` idéntico por construcción»*— aplicado a
 * un instrumento nuevo.
 *
 * **Y se cierra por LISTA BLANCA, no por lista negra**, que es la dirección
 * segura: el control mide **sólo** contra las variantes que se sabe CAPTURADAS
 * del original, congeladas en `medidas/coloca-media-BASE-capturadas.json` y
 * derivadas del árbol de git **anterior** a la primera colocación. Con lista
 * negra, una variante fabricada que se olvidara de declarar se colaría y
 * volvería a inflar el número; con lista blanca, lo que no está declarado como
 * capturado simplemente **no cuenta**.
 */
async function controlDelRedimensionado(capturadas) {
  const pares = [];
  const raiz = join(PUBLICO, "images/uploads");
  for (const rel of capturadas) {
    const p = join(PUBLICO, decodeURIComponent(rel));
    if (!existsSync(p) || !RE_VARIANTE.test(rel)) continue;
    const origen = join(dirname(p), origenDe(rel.split("/").pop()));
    if (existsSync(origen)) pares.push({ variante: p, origen });
  }
  void raiz;

  const fallos = [];
  for (const par of pares) {
    const [, w0, h0] = par.variante.match(RE_VARIANTE);
    const [real, regen] = await Promise.all([
      sharp(par.variante).metadata(),
      sharp(par.origen).resize(Number(w0), Number(h0), { fit: "cover", position: "centre" }).toBuffer().then((b) => sharp(b).metadata()),
    ]);
    if (real.width !== regen.width || real.height !== regen.height)
      fallos.push({ fichero: relative(raiz, par.variante).split(sep).join("/"), capturada: `${real.width}x${real.height}`, regenerada: `${regen.width}x${regen.height}` });
  }
  return { pares: pares.length, fallos };
}

/**
 * La LISTA BLANCA del control: variantes que se sabe **CAPTURADAS del
 * original**, derivadas del árbol de git anterior a la primera colocación. Lo
 * que no esté ahí no se puede afirmar que venga del original, así que la sonda
 * **no lo usa para controlarse**.
 */
const BASE = join(QA, "medidas/coloca-media-BASE-capturadas.json");
if (!existsSync(BASE))
  throw new Error(
    "no existe `medidas/coloca-media-BASE-capturadas.json`: sin la lista de variantes\n" +
      "  CAPTURADAS, el control del redimensionado se mediría contra sus propias\n" +
      "  regeneraciones y daría identidad por construcción.",
  );
const capturadas = JSON.parse(readFileSync(BASE, "utf8")).variantes ?? [];
const control = await controlDelRedimensionado(capturadas);
/* §sondas 4: 0 pares comparados no es «todas coinciden», es que no se miró. */
if (!control.pares)
  throw new Error(
    "CONTROL VACÍO: 0 variantes capturadas con su origen en `apps/web/public`.\n" +
      "  Sin un solo par, «las dimensiones coinciden» no lo afirma nadie: es la regla\n" +
      "  del cero, y regenerar 1179 ficheros sobre esa base sería inventárselo.",
  );

const hecho = { copiadas: [], regeneradas: [], yaEstaban: [], ausentesEnOrigen: [] };
const sinOrigen = [];

for (const ruta of pendientes) {
  const rel = aRel(ruta);
  const destino = join(PUBLICO, "images/uploads", rel);
  if (existsSync(destino)) { hecho.yaEstaban.push(ruta); ev.ok(); continue; }

  const esVariante = RE_VARIANTE.test(rel);
  const relOrigen = esVariante ? origenDe(rel) : rel;
  const origen = SABOTAJE === "origen-ausente" ? undefined : enCorpus.get(relOrigen) ?? (existsSync(join(PUBLICO, "images/uploads", relOrigen)) ? join(PUBLICO, "images/uploads", relOrigen) : undefined);

  if (!origen) {
    /**
     * Un 404 declarado no es un origen perdido: es una ausencia MEDIDA.
     *
     * ⚠ **El sabotaje tiene que saltarse TAMBIÉN esta exención**, y lo enseñó
     * fallando: con la colocación ya hecha, las únicas rutas que quedan son los
     * 28 declarados, así que `origen-ausente` entraba por aquí y salía **verde**.
     * Un sabotaje que no cambia el resultado no ha probado la guarda — ha
     * probado que el instrumento no la ejercita (§sondas 8a).
     */
    if (ausentes.has(relOrigen) && SABOTAJE !== "origen-ausente") { hecho.ausentesEnOrigen.push(ruta); ev.ok(); continue; }
    sinOrigen.push({ ruta, origen: relOrigen });
    ev.fallo(ruta, `sin origen en media-corpus ni en public (${relOrigen})`);
    continue;
  }

  if (SOLO_DERIVA) { (esVariante ? hecho.regeneradas : hecho.copiadas).push(ruta); ev.ok(); continue; }
  mkdirSync(dirname(destino), { recursive: true });

  if (!esVariante) {
    copyFileSync(origen, destino);
    hecho.copiadas.push(ruta);
  } else {
    const [, w0, h0] = rel.match(RE_VARIANTE);
    /**
     * Los mismos parámetros que el CONTROL de arriba acaba de verificar contra
     * las variantes capturadas del original. Si se cambian aquí y no allí, el
     * control deja de medir lo que se hace — que es la clase C7.
     *
     * ⚠ **`toBuffer()` + `writeFileSync`, NO `toFile()`, y es por Windows:**
     * `libvips` abre la ruta por la API estrecha y muere con *«unable to open
     * for write · No such file or directory»* en cuanto pasa de 260 caracteres
     * — hay títulos de documento científico que dan rutas de **269**. `fs` de
     * Node sí las maneja (por eso `copyFileSync` funcionaba y esto no), así que
     * se le pasa el buffer y escribe Node. Lo destapó `gritaSiRevienta()`, que
     * mató la sonda en voz alta en vez de dejarla a medias en verde.
     */
    const buf = await sharp(origen).resize(Number(w0), Number(h0), { fit: "cover", position: "centre" }).toBuffer();
    writeFileSync(destino, buf);
    hecho.regeneradas.push(ruta);
  }
  ev.ok();
}

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

console.log(`\n════════ coloca-media · de media-corpus a apps/web/public ════════\n`);
console.log(`  ${SOLO_DERIVA ? "(SOLO_DERIVA=1 — no se ha tocado un fichero)\n" : ""}`);
console.log(
  `  CONTROL del redimensionado ........... ${control.pares - control.fallos.length}/${control.pares} variantes capturadas ` +
    `reproducidas en DIMENSIÓN por sharp (sólo CAPTURADAS: lista blanca de ${capturadas.length}; lo fabricado por esta sonda queda FUERA)${control.fallos.length ? "  ❌" : ""}`,
);
for (const f of control.fallos.slice(0, 8)) console.log(`       ✗ ${f.fichero}: capturada ${f.capturada} ≠ regenerada ${f.regenerada}`);
if (control.fallos.length > 8) console.log(`       … y ${control.fallos.length - 8} más`);
console.log(`  pendientes según media-siembra ....... ${pendientes.length}`);
console.log(`  ya estaban en public ................. ${hecho.yaEstaban.length}`);
console.log(`  COPIADAS desde media-corpus .......... ${hecho.copiadas.length}`);
console.log(`  REGENERADAS con sharp (variantes) .... ${hecho.regeneradas.length}`);
console.log(`  404 declarados en el original ........ ${hecho.ausentesEnOrigen.length}   ← medido, no se puede colocar`);
console.log(`  ⛔ SIN ORIGEN en ningún sitio ........ ${sinOrigen.length}`);
for (const s of sinOrigen.slice(0, 10)) console.log(`       ${s.ruta}  (origen buscado: ${s.origen})`);
if (sinOrigen.length > 10) console.log(`       … y ${sinOrigen.length - 10} más`);

w("medidas/coloca-media.json", {
  meta: {
    fecha: hoy(),
    que: "el paso SIN RED entre la captura y la siembra: colocar orígenes y regenerar variantes",
    fuente: "medidas/media-siembra.json (la lista) + media-corpus/ (los bytes)",
    soloDeriva: SOLO_DERIVA,
    sabotaje: SABOTAJE,
    renuncia: "una variante REGENERADA coincide en DIMENSIÓN, no byte a byte (qa:media-regenera, 73/73)",
  },
  resumen: {
    pendientes: pendientes.length,
    yaEstaban: hecho.yaEstaban.length,
    copiadas: hecho.copiadas.length,
    regeneradas: hecho.regeneradas.length,
    ausentesEnOrigen: hecho.ausentesEnOrigen.length,
    sinOrigen: sinOrigen.length,
  },
  control: { pares: control.pares, fallos: control.fallos.length, detalle: control.fallos },
  sinOrigen,
  ausentesEnOrigen: hecho.ausentesEnOrigen.sort(),
});

const rojo = sinOrigen.length > 0 || control.fallos.length > 0;
console.log(
  `\n${rojo ? "❌" : "✅"} coloca-media: ${hecho.copiadas.length} copiadas · ${hecho.regeneradas.length} regeneradas · ` +
    `${hecho.ausentesEnOrigen.length} ausentes en el original · ${sinOrigen.length} sin origen\n`,
);
process.exit(rojo ? 2 : 0);
