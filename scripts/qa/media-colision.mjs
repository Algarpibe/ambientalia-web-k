/**
 * ¿COLISIONAN LOS FILENAMES DE MEDIA? — la medida que decide si **CMS-0g**
 * tiene que tocar el esquema, o si `rutaDeMedia` se implementa sobre lo que
 * `media` ya guarda.
 *
 * Uso: npm run qa:media-colision        (SIN_CLON: no toca el servidor)
 *      SABOTAJE=<etiqueta> …            → test en negativo (`qa:media-colision-neg`)
 *
 * ── Por qué existe, y por qué es una MEDIDA y no un diseño ────────────────
 * El HANDOFF de F2-3 paró el PASO 3 con esta derivación: *«`media` no guarda la
 * ruta de origen, así que `rutaDeMedia` no se puede implementar»*. La premisa es
 * verdadera —`select filename, url from media` da `Kunak-AIR-Pro-1024.jpg` y
 * `/api/media/file/Kunak-AIR-Pro-1024.jpg`, y de ahí no sale `/images/uploads/
 * 2022/12/…`—, pero la **conclusión sólo se sigue si los nombres COLISIONAN**:
 *
 * > si dos rutas distintas no comparten nunca su último segmento, entonces
 * > `filename → ruta` es una FUNCIÓN y se puede tabular. Si lo comparten, no
 * > hay tabla que valga y hace falta guardar la procedencia.
 *
 * Así que la pregunta no es «qué campo añado» sino **«hay algo que modelar?»**,
 * y a eso contesta el dato. Es el mismo movimiento que disolvió el ancho
 * pedido: preguntarle a los datos si la frontera existe antes de dibujarla.
 *
 * ── Las CUATRO poblaciones, y cuál decide ─────────────────────────────────
 * Contar «los 534 capturados» o «los 628 de public/images» contesta una
 * pregunta parecida y no la misma — es §El principio: la unidad. `rutaDeMedia`
 * recibe un documento de `media`, y **una fila de `media` sólo existe si alguna
 * ruta llegó a un campo `upload`**. Ése es su DOMINIO, y se deriva pasando el
 * walker de `mapeo.mjs` sobre los 9 catálogos con un `ctx` que **anota en vez de
 * subir**: el mismo recorrido que el seed, sin DB.
 *
 *   · `dominio`  — lo que HOY es una fila de `media`.        ← **decide**
 *   · `corpus`   — los orígenes capturados en `media-corpus/`. Es lo que el
 *                  cuerpo rico referenciará cuando el bloque 2 lo importe.
 *   · `union`    — dominio ∪ corpus: todo lo que ALGUNA VEZ podrá ser fila.
 *                  ← decide la **durabilidad** de la respuesta
 *   · `publico`  — el árbol entero de `apps/web/public/images`. Superconjunto:
 *                  incluye el CASCARÓN, que `media-regenera` dejó fuera a
 *                  propósito y el CMS no sube.
 *
 * ── Y lo que NO se da por supuesto: que `filename` SEA el basename ────────
 * Payload sanea nombres y **desduplica añadiendo sufijo**. Que `filename` sea
 * exactamente el último segmento de la ruta es una afirmación sobre la salida
 * servida, no sobre el código, así que se **verifica contra `media/`** —el
 * `staticDir` que el último seed escribió y que `cms:reset` vacía—. Sin esa
 * comprobación, «no colisionan» sería una propiedad de mis rutas y no del dato
 * que `rutaDeMedia` va a recibir.
 *
 * ── El peligro que no se ve leyendo: la VARIANTE ──────────────────────────
 * `media/` es PLANO y ahí caen también las variantes que genera `imageSizes`,
 * con la forma `<base>-<W>x<H>.<ext>`. El corpus está lleno de nombres con esa
 * misma forma —son variantes de WordPress usadas como origen— así que un
 * origen puede **chocar con el nombre generado de otro origen** sin que ninguna
 * de las dos rutas comparta basename. Se comprueba aparte (comprobación C).
 *
 * ⚠ **Y C NO decide CMS-0g, aunque salga roja.** Es la §regla 1 aplicada al
 * revés: lo que se mira se cuenta, **y si se cuenta y no cierra el código de
 * salida, se dice en la salida y por qué**. La razón aquí es que C contesta otra
 * pregunta: los dos `filename` siguen siendo DISTINTOS —la tabla no se rompe—,
 * lo que se pisa son los BYTES en disco. O sea familia **M-IMG** (dimensión
 * igual, bytes no), no la tabla. Su ficha va aparte.
 *
 * Quien sí vigila la tabla es **B**: si el orden de inserción cambiara y Payload
 * llegara a desduplicar, el `filename` dejaría de ser el basename y B lo caza en
 * la misma corrida. C es el aviso temprano; B es la guarda.
 */
import fs from "node:fs";
import path from "node:path";
import { APP, Evaluadas, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1"; // no hay servidor en el camino: todo es de disco

const SABOTAJE = process.env.SABOTAJE ?? "";
const RAIZ = path.join(QA, "..", "..");
const DIR_PUBLICO = path.join(APP, "public", "images");
const DIR_MEDIA = path.join(RAIZ, "media");
const INDICE_CORPUS = path.join(RAIZ, "media-corpus", "INDICE.json");
const REGENERA = path.join(QA, "medidas", "media-regenera.json");

/* ── el dominio: el walker, con un `ctx` que anota ───────────────────────── */
const { CATALOGOS, cargaCatalogos } = await import("../seed/catalogos.mjs");
const { aPayload } = await import("../seed/mapeo.mjs");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const { IMAGE_SIZES } = await import("../../packages/cms-config/src/defaults.ts");

const config = await construyeConfig();
const catalogos = await cargaCatalogos();

/** Los anchos que el pipeline puede escribir en un nombre de variante. */
const ANCHOS = IMAGE_SIZES.valor.map((s) => s.width);

const referencias = []; // { ruta, coleccion, donde } — CON multiplicidad
const ctx = {
  /* La ida real sube el fichero y devuelve un id. Aquí sólo hace falta que el
   * walker siga andando, así que se devuelve un id ficticio: lo que se está
   * midiendo es POR DÓNDE PASA, no qué escribe. */
  media: async (ruta, donde) => {
    referencias.push({ ruta, donde });
    return referencias.length;
  },
  rel: async () => 1,
  centinelaVacio: () => {},
};

for (const { coleccion } of CATALOGOS) {
  const cfg = config.collections.find((c) => c.slug === coleccion);
  if (!cfg) throw new Error(`COLECCIÓN AUSENTE en la config: '${coleccion}'`);
  /* `SABOTAJE=selector-muerto`: el walker recorre una lista de campos VACÍA, así
   * que ningún `upload` se ve y el dominio sale a cero. Es el caso que la regla
   * 4 exige que salga por error y no por «no hay colisiones». */
  const campos = SABOTAJE === "selector-muerto" ? [] : cfg.fields;
  const antes = referencias.length;
  for (const fila of catalogos.get(coleccion) ?? []) await aPayload(campos, fila, ctx, "");
  for (let i = antes; i < referencias.length; i++) referencias[i].coleccion = coleccion;
}

/**
 * `SABOTAJE=colision-inventada`: entran al dominio **el par homónimo REAL** que
 * ya vive en `public/images` (`kunak-api.jpg`, 2023/02 y 2026/04) y que hoy no
 * referencia ningún `upload`. No es una ruta inventada, y eso importa: una
 * inventada haría fallar también la comprobación D —no existe en disco— y el
 * sabotaje caería por un invariante que no es el suyo.
 *
 * Es exactamente lo que pasará el día que el bloque 2 importe dos imágenes
 * homónimas de meses distintos: el caso que la unión ya predice.
 */
const PAR_HOMONIMO = ["/images/uploads/2023/02/kunak-api.jpg", "/images/uploads/2026/04/kunak-api.jpg"];
if (SABOTAJE === "colision-inventada")
  for (const ruta of PAR_HOMONIMO) referencias.push({ ruta, coleccion: "(sabotaje)", donde: "(sabotaje)" });

/* ── las otras tres poblaciones ──────────────────────────────────────────── */
const anda = (dir, base = dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p, base, out);
    else out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out;
};

const publico = fs.existsSync(DIR_PUBLICO) ? anda(DIR_PUBLICO) : [];

/* `SABOTAJE=sin-corpus`: el índice se lee de un sitio que no existe. Un `?? {}`
 * ahí daría «0 capturados, 0 colisiones» — la regla del cero de manual. */
const rutaIndice = SABOTAJE === "sin-corpus" ? `${INDICE_CORPUS}.no-existe` : INDICE_CORPUS;
const indice = fs.existsSync(rutaIndice) ? JSON.parse(fs.readFileSync(rutaIndice, "utf8")) : null;
const corpus = Object.keys(indice?.ficheros ?? {}).map((k) => `uploads/${k}`);

const dominio = [...new Set(referencias.map((r) => decodeURIComponent(r.ruta)))];
/* El dominio se normaliza al mismo sistema de coordenadas que `publico`
 * (relativo a `public/images`) para que la unión sea de rutas comparables y no
 * de dos vocabularios: eso sería fabricar colisiones o esconderlas. */
const dominioRel = dominio.map((r) => r.replace(/^\/images\//, ""));
const union = [...new Set([...dominioRel, ...corpus])];

/* ── A · ¿colisiona el último segmento? ──────────────────────────────────── */
const baseDe = (r) => r.split("/").pop();
function colisiones(lista) {
  const porBase = new Map();
  for (const r of lista) {
    const b = baseDe(r);
    if (!porBase.has(b)) porBase.set(b, []);
    porBase.get(b).push(r);
  }
  return [...porBase].filter(([, v]) => v.length > 1).map(([basename, rutas]) => ({ basename, rutas }));
}

/* Cuántas REFERENCIAS del corpus tocaría cada colisión. La pregunta del encargo
 * no es sólo «cuántos nombres», es «en cuántas referencias afecta»: un nombre
 * repetido que nadie referencia cuesta cero. */
const HTML_CORPUS = path.join(RAIZ, "corpus");
let textoCorpus = null;
function refsEnCorpus(rutaRel) {
  if (textoCorpus === null) {
    textoCorpus = "";
    if (fs.existsSync(HTML_CORPUS))
      for (const f of anda(HTML_CORPUS))
        if (f.endsWith(".html")) textoCorpus += fs.readFileSync(path.join(HTML_CORPUS, f), "utf8");
  }
  /* Se cuenta el ORIGEN: `foo-300x200.jpg` es una variante de `foo.jpg`, así
   * que la referencia que colisionaría es la misma. */
  const sinUploads = rutaRel.replace(/^uploads\//, "");
  const ext = path.extname(sinUploads);
  const sinExt = sinUploads.slice(0, -ext.length);
  const re = new RegExp(
    sinExt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + `(?:-\\d+x\\d+)?` + ext.replace(/\./g, "\\."),
    "g",
  );
  return (textoCorpus.match(re) ?? []).length;
}

const POBLACIONES = [
  { nombre: "dominio", que: "rutas que HOY llegan a un campo `upload` (el dominio de rutaDeMedia)", lista: dominioRel, decide: true },
  { nombre: "corpus", que: "orígenes capturados en media-corpus/ (el cuerpo rico del bloque 2)", lista: corpus, decide: false },
  { nombre: "union", que: "dominio ∪ corpus: todo lo que alguna vez podrá ser fila de `media`", lista: union, decide: true },
  { nombre: "publico", que: "apps/web/public/images entero — superconjunto, incluye el CASCARÓN", lista: publico, decide: false },
];

/* ── El contrato. La unidad es la POBLACIÓN, que es lo que esta sonda compara;
 * cada una trae además su propio suelo DERIVADO, y una población por debajo del
 * suyo es un fallo con nombre, nunca un cero silencioso. ──────────────────── */
const ev = new Evaluadas({ nombre: "media-colision", unidad: "poblaciones", minimo: POBLACIONES.length });

/* Los suelos, derivados de fuentes INDEPENDIENTES del recorrido que auditan —
 * derivarlos del propio artefacto deja que una corrida degenerada se autorice
 * a sí misma (§2.1 de la tanda anterior). */
const origenesEnMedia = (() => {
  if (!fs.existsSync(DIR_MEDIA)) return null;
  const ficheros = fs.readdirSync(DIR_MEDIA);
  /* Un fichero de `media/` es VARIANTE si al quitarle `-WxH` (con W declarado)
   * queda un nombre que existe ahí **con cualquier extensión**: el pipeline
   * recodifica, así que el origen `…-1024x680.jpeg` genera `…-1024x680-300x199
   * .jpg`. Comparar con extensión daba 128 en vez de 112 — medido. */
  const sinExt = new Set(ficheros.map((f) => f.slice(0, f.length - path.extname(f).length)));
  return ficheros.filter((f) => {
    const m = /^(.*)-(\d+)x(\d+)$/.exec(f.slice(0, f.length - path.extname(f).length));
    return !(m && ANCHOS.includes(Number(m[2])) && sinExt.has(m[1]));
  }).length;
})();

const listaACapturar = fs.existsSync(REGENERA)
  ? (JSON.parse(fs.readFileSync(REGENERA, "utf8")).listaACapturar ?? []).length
  : 0;

const suelos = {
  /* `media/` es el testigo independiente del dominio: lo escribió el último
   * seed y `cms:reset` lo vacía, así que su nº de orígenes acota |dominio|.
   *
   * ⚠ Es un SUELO y no una igualdad, **y se sabe por qué**: un origen con forma
   * de variante cuyo base también esté subido se cuenta aquí como variante. Son
   * exactamente los de la comprobación C, así que la diferencia no es holgura —
   * es un número con nombre. Medido: 110 aquí contra 112 en el dominio. */
  dominio: origenesEnMedia,
  /* La lista congelada por `qa:media-regenera` menos los que la captura no pudo
   * traer. Dos ficheros distintos que tienen que cuadrar entre sí. */
  corpus: listaACapturar ? listaACapturar - (indice?.errores?.length ?? 0) : null,
  union: null, // se deriva: ≥ max(dominio, corpus)
  /* `publico` no tiene fuente independiente, y por eso su suelo NO es un número
   * sino un INVARIANTE: cada ruta del dominio tiene que estar ahí, que es lo
   * que `ctx.media` comprueba con `existsSync` al sembrar. */
  publico: null,
};
suelos.union = Math.max(suelos.dominio ?? 0, suelos.corpus ?? 0) || null;

console.log(`\n════════ ¿COLISIONAN LOS FILENAMES DE MEDIA? ════════`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}\n`);
console.log(`  La pregunta de CMS-0g: ¿es \`filename → ruta\` una función?\n`);
console.log(`  ${"población".padEnd(10)} ${"rutas".padStart(6)} ${"suelo".padStart(7)}  ${"basenames repetidos".padStart(20)}`);

const salida = {
  meta: {
    fecha: hoy(),
    pregunta: "¿dos rutas distintas comparten su último segmento? Si no, `filename → ruta` es una función y CMS-0g se cierra sin campo nuevo.",
    fuente: "walker de mapeo.mjs sobre los 9 catálogos (dominio) · media-corpus/INDICE.json · apps/web/public/images · media/ (salida servida)",
    sabotaje: SABOTAJE || null,
  },
  poblaciones: {},
  comprobaciones: {},
  veredicto: {},
};

let malas = 0;      // cierran el código de salida
let hallazgos = 0;  // se cuentan y se nombran, y la salida dice por qué NO lo cierran
for (const p of POBLACIONES) {
  const suelo = suelos[p.nombre];
  const cols = colisiones(p.lista);
  const detalle = cols.map((c) => ({
    ...c,
    referenciasEnCorpus: c.rutas.map((r) => ({ ruta: r, n: refsEnCorpus(r) })),
  }));
  const refsAfectadas = detalle.reduce((a, c) => a + c.referenciasEnCorpus.reduce((b, x) => b + x.n, 0), 0);

  salida.poblaciones[p.nombre] = {
    que: p.que,
    rutas: p.lista.length,
    suelo,
    decide: p.decide,
    basenamesRepetidos: cols.length,
    referenciasDelCorpusAfectadas: refsAfectadas,
    colisiones: detalle,
  };

  const bajoSuelo = suelo !== null && p.lista.length < suelo;
  if (p.lista.length === 0 || bajoSuelo) {
    malas++;
    ev.fallo(p.nombre, p.lista.length === 0 ? "población VACÍA: no se midió nada" : `${p.lista.length} < suelo ${suelo}`);
    console.log(
      `  ${p.nombre.padEnd(10)} ${String(p.lista.length).padStart(6)} ${String(suelo ?? "—").padStart(7)}  ` +
        `❌ ${p.lista.length === 0 ? "VACÍA — la regla del cero" : `por debajo de su suelo derivado (${suelo})`}`,
    );
    continue;
  }
  ev.ok();
  console.log(
    `  ${p.nombre.padEnd(10)} ${String(p.lista.length).padStart(6)} ${String(suelo ?? "inv.").padStart(7)}  ` +
      `${String(cols.length).padStart(20)}${cols.length ? `  (${refsAfectadas} refs del corpus)` : ""}`,
  );
  for (const c of detalle) console.log(`      · ${c.basename}\n${c.rutas.map((r) => `          ${r}`).join("\n")}`);
}

/* ── B · CONTRA LA SALIDA SERVIDA: ¿`filename` ES el basename? ───────────── */
const enMedia = fs.existsSync(DIR_MEDIA) ? new Set(fs.readdirSync(DIR_MEDIA)) : new Set();
/* El sabotaje de la colisión modela un ESTADO FUTURO —dos homónimas en el
 * dominio—, y en ese estado el seed las habría subido. Darle el testigo es lo
 * que hace que caiga por A y sólo por A: dejárselo a medias lo tumbaría por B,
 * que es un invariante distinto y ya tiene su propio sabotaje. */
if (SABOTAJE === "colision-inventada") enMedia.add("kunak-api.jpg");
/* `SABOTAJE=filename-renombrado`: se simula que Payload saneó un nombre —lo que
 * de verdad haría con un `@` o una tilde— quitándolo del testigo. */
if (SABOTAJE === "filename-renombrado" && dominio.length) enMedia.delete(baseDe(dominio[0]));
const sinTestigo = dominio.map(baseDe).filter((b) => !enMedia.has(b));
salida.comprobaciones.filenameEsBasename = {
  que: "cada basename del dominio existe en media/ con su nombre EXACTO ⇒ Payload no saneó ni desduplicó",
  ficherosEnMedia: enMedia.size,
  sinTestigo: sinTestigo.length,
  cuales: sinTestigo.slice(0, 20),
  /* ⚠ `dominio.length > 0` no es defensivo: sin él, un dominio VACÍO da
   * `sinTestigo = 0` y esta comprobación sale VERDE sin haber mirado nada — la
   * regla del cero dentro de la comprobación que la vigila. */
  ok: enMedia.size > 0 && dominio.length > 0 && sinTestigo.length === 0,
};
if (!salida.comprobaciones.filenameEsBasename.ok) {
  malas++;
  console.log(`\n  ❌ B · filename ≠ basename en ${sinTestigo.length} rutas — la tabla no se puede construir sobre el basename`);
  for (const s of sinTestigo.slice(0, 8)) console.log(`      · ${s}`);
} else {
  console.log(`\n  ✓  B · las ${dominio.length} del dominio están en media/ con su nombre exacto (${enMedia.size} ficheros)`);
}

/* ── C · el peligro de la VARIANTE ───────────────────────────────────────── */
/* `SABOTAJE=variante-pisa-origen`: un origen bautizado con la forma que el
 * pipeline genera para OTRO origen. Es la colisión que no comparte basename y
 * que por tanto la comprobación A no puede ver. */
const paraVariante = SABOTAJE === "variante-pisa-origen" && union.length
  ? [...union, (() => { const r = union[0]; const e = path.extname(r); return `${r.slice(0, -e.length)}-${ANCHOS[0]}x999${e}`; })()]
  : union;
const basesSinExt = new Set(paraVariante.map((r) => { const b = baseDe(r); return b.slice(0, b.length - path.extname(b).length); }));
const pisadas = [];
for (const r of paraVariante) {
  const b = baseDe(r);
  const s = b.slice(0, b.length - path.extname(b).length);
  const m = /^(.*)-(\d+)x(\d+)$/.exec(s);
  if (m && ANCHOS.includes(Number(m[2])) && basesSinExt.has(m[1])) pisadas.push({ origen: r, pisaria: `${m[1]}(-${m[2]}x${m[3]})` });
}
/* ¿Se materializó ya? Un nombre con forma de variante sólo se pisa **de verdad**
 * si el origen y la base están LOS DOS subidos. Y eso no se razona: se compara
 * el fichero de `media/` con el de `public/images`, **con control** — Payload
 * copia los orígenes VERBATIM, así que un sha distinto en el disputado prueba
 * que lo que hay ahí es la variante generada y no el origen que un documento de
 * `media` cree tener. Sin el control, el sha distinto se explicaría solo por
 * recodificación y no probaría nada (regla 8a). */
const { createHash } = await import("node:crypto");
const sha = (f) => (fs.existsSync(f) ? createHash("sha256").update(fs.readFileSync(f)).digest("hex").slice(0, 16) : null);
const buscaEnPublico = (base) => {
  const hit = publico.find((r) => baseDe(r) === base);
  return hit ? path.join(DIR_PUBLICO, hit) : null;
};
let controlVerbatim = null;
for (const p of pisadas) {
  const base = baseDe(p.origen);
  const orig = buscaEnPublico(base);
  p.shaEnMedia = sha(path.join(DIR_MEDIA, base));
  p.shaEnPublico = orig ? sha(orig) : null;
  p.ficheroPisado = p.shaEnMedia !== null && p.shaEnPublico !== null && p.shaEnMedia !== p.shaEnPublico;
  /* El control: la BASE que genera la variante. Si Payload copia verbatim, su
   * sha tiene que coincidir con el de `public/images`. */
  const baseSinVar = `${p.pisaria.split("(")[0]}`;
  const cand = publico.find((r) => baseDe(r).startsWith(`${baseSinVar}.`));
  if (cand && controlVerbatim === null) {
    const b = baseDe(cand);
    controlVerbatim = { fichero: b, enMedia: sha(path.join(DIR_MEDIA, b)), enPublico: sha(path.join(DIR_PUBLICO, cand)) };
    controlVerbatim.copiaVerbatim = controlVerbatim.enMedia !== null && controlVerbatim.enMedia === controlVerbatim.enPublico;
  }
}
const pisadasReales = pisadas.filter((p) => p.ficheroPisado);
salida.comprobaciones.variantePisaOrigen = {
  que: "ningún origen se llama como una variante que el pipeline genere de otro origen (media/ es PLANO)",
  noDecideCMS0g:
    "los dos `filename` siguen siendo DISTINTOS: la tabla `filename → ruta` no se rompe. Lo que se pisa son los BYTES " +
    "en disco, o sea familia M-IMG. Por eso se cuenta y se nombra pero NO cierra el código de salida (regla 1). " +
    "La tabla la vigila B, que caza el día que Payload llegue a desduplicar.",
  anchosDeclarados: ANCHOS,
  controlVerbatim,
  n: pisadas.length,
  materializadas: pisadasReales.length,
  cuales: pisadas.slice(0, 20),
  ok: pisadas.length === 0,
};
if (pisadas.length) {
  hallazgos++;
  console.log(
    `  ⚠  C · ${pisadas.length} orígenes con forma de variante generable · ${pisadasReales.length} con el fichero YA PISADO` +
      `\n        (control: Payload copia los orígenes verbatim = ${controlVerbatim?.copiaVerbatim ? "SÍ" : "NO"})` +
      `\n        NO cierra el código de salida: contesta otra pregunta (bytes, no la tabla). Ficha aparte.`,
  );
  for (const p of pisadas.slice(0, 8))
    console.log(`      · ${p.origen}\n          ← lo genera ${p.pisaria}  ·  ${p.ficheroPisado ? "PISADO" : "aún no"}`);
} else {
  console.log(`  ✓  C · ningún origen de la unión (${union.length}) puede ser pisado por una variante generada`);
}

/* ── D · el dominio vive bajo public/images ──────────────────────────────── */
const enPublico = new Set(publico);
const fueraDePublico = dominioRel.filter((r) => !enPublico.has(r));
salida.comprobaciones.dominioBajoPublico = {
  que: "cada ruta del dominio existe en apps/web/public/images — el invariante que `ctx.media` comprueba al sembrar",
  n: fueraDePublico.length,
  cuales: fueraDePublico.slice(0, 20),
  /* Misma razón que en B: con el dominio vacío esto saldría verde sin mirar. */
  ok: publico.length > 0 && dominioRel.length > 0 && fueraDePublico.length === 0,
};
if (!salida.comprobaciones.dominioBajoPublico.ok) {
  malas++;
  console.log(`  ❌ D · ${fueraDePublico.length} rutas del dominio no están en public/images`);
} else {
  console.log(`  ✓  D · las ${dominioRel.length} del dominio están bajo public/images (${publico.length} ficheros)`);
}

/* ── veredicto ───────────────────────────────────────────────────────────── */
const colDominio = salida.poblaciones.dominio?.basenamesRepetidos ?? -1;
const colUnion = salida.poblaciones.union?.basenamesRepetidos ?? -1;
/* Una colisión EN EL DOMINIO sí cierra el código: es la tabla rota hoy, no una
 * previsión. Una colisión en la UNIÓN no —es la pregunta que esta sonda existe
 * para contestar, y contestarla «mal» es un resultado, no un fallo de medida. */
if (colDominio !== 0) {
  malas++;
  console.log(`\n  ❌ A · ${colDominio} basenames repetidos EN EL DOMINIO: la tabla está rota hoy`);
}
salida.veredicto = {
  referenciasUpload: referencias.length,
  rutasDistintas: dominio.length,
  /* La afirmación se hace SOBRE EL DOMINIO, que es quien recibe la llamada. Que
   * `publico` colisione no la toca: sus repetidos son cascarón, y el cascarón no
   * es fila de `media` (`media-regenera`, poblaciones). */
  /* SIN `variantePisaOrigen`, y a propósito: pisar bytes no rompe la tabla. */
  funcionHoy: colDominio === 0 && salida.comprobaciones.filenameEsBasename.ok,
  funcionEnLaUnion: colUnion === 0,
  lectura:
    colDominio === 0
      ? colUnion === 0
        ? "`filename → ruta` es una función en el dominio Y en la unión: rutaDeMedia se tabula sobre el basename y CMS-0g no necesita campo."
        : "es una función HOY y NO en la unión: el bloque 2 la rompe. La decisión de CMS-0g no puede aplazarse a entonces."
      : "NO es una función ni hoy: hace falta guardar la procedencia en `media`.",
};

console.log(`\n──────── VEREDICTO ────────`);
console.log(`  referencias a \`upload\` .......... ${referencias.length}`);
console.log(`  rutas distintas (filas de media) . ${dominio.length}`);
console.log(`  ¿función HOY? .................... ${salida.veredicto.funcionHoy ? "SÍ" : "NO"}`);
console.log(`  ¿función en la UNIÓN? ............ ${salida.veredicto.funcionEnLaUnion ? "SÍ" : "NO"}`);
console.log(`\n  ${salida.veredicto.lectura}\n`);
if (hallazgos)
  console.log(
    `  ⚠ ${hallazgos} hallazgo(s) contado(s) que NO cierran el código de salida.\n` +
      `    Por qué: contestan otra pregunta que la de esta sonda (la tabla), y tienen\n` +
      `    ficha propia. Se dicen aquí para que no se confundan con «no hay nada».\n`,
  );

w("medidas/media-colision.json", salida);

process.exit(ev.informe() || malas ? 2 : 0);
