/**
 * ¿PROYECTA IGUAL EL CONTEXTO DEL RENDER QUE EL DE LA IDA? — la guarda que
 * traslada el 63/63 del round-trip al camino que estrena F2-3.
 *
 * Uso: npm run cms:reset && npm run qa:cms-lectura    (exige DB sembrada)
 *      SABOTAJE=<etiqueta> …                          → `qa:cms-lectura-neg`
 *
 * ── Por qué NO basta con `qa:cms-roundtrip` ───────────────────────────────
 * El round-trip prueba que **ida y vuelta son inversas** (63/63), pero su vuelta
 * corre con `creaContexto` —el contexto que la IDA fue llenando en el mismo
 * proceso—. El render no tiene ida: usa `contextoDeLectura`, que se apoya en las
 * declaraciones de la config (CMS-0g, `ESQUEMA-CMS.md` §7c).
 *
 * > **O sea que el 63/63 verifica un contexto y el build usa OTRO.** Dar por
 * > bueno el primero para el segundo es heredar un verde: exactamente la
 * > FAMILIA DE CALIBRACIÓN, y la razón por la que este proyecto no se cree los
 * > verdes prestados.
 *
 * ── Qué compara, y por qué así ────────────────────────────────────────────
 * `aMedido(cfg, doc, ctxIDA)` contra `aMedido(cfg, doc, ctxRENDER)` sobre **los
 * mismos documentos leídos de la misma DB**. Un solo recorrido cambia entre los
 * dos lados —el contexto—, así que una diferencia sólo puede venir de ahí. Es
 * medir **al nivel donde vive la propiedad**: comparar contra el catálogo medido
 * volvería a meter en la ecuación la ida, las normalizaciones y los alias, y
 * entonces un fallo del contexto quedaría absorbido por lo demás.
 *
 * ── Lo que NO prueba, dicho aquí para que no se cite de más ───────────────
 * Que las dos proyecciones coincidan **no** prueba que la proyección sea fiel al
 * dato medido: eso lo prueba el round-trip, y este fichero se apoya en él. Lo
 * que prueba es que **el camino del render no pierde nada respecto del camino
 * verificado** — que es justo la pieza que faltaba.
 */
import { Evaluadas, hoy, w } from "./lib.mjs";
import { getPayload } from "payload";

process.env.SIN_CLON = "1";

const SABOTAJE = process.env.SABOTAJE ?? "";

const { SEMBRADAS, creaContexto } = await import("../seed/seed.mjs");
const { TAXONOMIAS_DERIVADAS } = await import("../seed/catalogos.mjs");
const { aMedido, contextoDeLectura } = await import("../../packages/cms-config/src/mapeo.mjs");
const { DEVUELVE } = await import("../../packages/cms-config/src/vuelta.mjs");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");

const config = await construyeConfig();
const payload = await getPayload({ config });

/** Las colecciones con lado medido: las sembradas + las taxonomías derivadas. */
const COLECCIONES = [...SEMBRADAS, ...TAXONOMIAS_DERIVADAS.map((t) => t.coleccion)];

/* ── el contexto de la IDA, cargado como lo carga el seed ────────────────────
 *
 * ⚠ **La primera versión de esto sólo rellenaba `mediaPorRuta` e
 * `idsPorColeccion`, y su negativo la cazó.** `creaContexto` tiene TRES mapas
 * más —`formaDeRel`, `CON_KIND`, `centinelas`— que **sólo se llenan pasando la
 * ida**, y sin ellos el contexto de la ida devolvía el slug donde el dato tiene
 * el término, exactamente igual que un contexto del render sin declaraciones.
 *
 * > O sea que los dos lados coincidían **por no hacer ninguno el trabajo**, y el
 * > `63/63` era un pleno que no medía nada (`CLAUDE.md` §sondas, regla 4, la
 * > cara del pleno). Lo delató el sabotaje `sin-declaraciones` saliendo VERDE.
 *
 * Así que aquí se pasa **la ida de verdad** sobre los catálogos. No escribe en
 * la DB: `ctx.media` encuentra la ruta ya cacheada y `ctx.rel` resuelve contra
 * `idsPorColeccion`, los dos precargados de lo que la DB tiene. */
const ctxIda = creaContexto(payload);
{
  const { docs } = await payload.find({ collection: "media", pagination: false, depth: 0 });
  for (const m of docs) if (m.rutaOrigen) ctxIda.mediaPorRuta.set(m.rutaOrigen, m.id);
  for (const col of COLECCIONES) {
    const { docs: d } = await payload.find({ collection: col, pagination: false, depth: 0 });
    for (const x of d) ctxIda.registra(col, x.slug ?? x.id, x.id);
  }
  const { CATALOGOS, cargaCatalogos } = await import("../seed/catalogos.mjs");
  const { aPayload } = await import("../../packages/cms-config/src/mapeo.mjs");
  const { PREPARA } = await import("../seed/seed.mjs");
  const catalogos = await cargaCatalogos();
  for (const { coleccion } of CATALOGOS) {
    const cfg = config.collections.find((c) => c.slug === coleccion);
    for (const fila of catalogos.get(coleccion) ?? [])
      /* ⚠ La raíz es `coleccion`, **la misma que usa `inserta()` en el seed**.
       * Con raíz vacía los mapas salen sin prefijo, `deRel` falla el `get` y la
       * ida devuelve el slug donde el dato tiene el término: el lado que se toma
       * por bueno pasa a ser el equivocado. Es la tercera vez que esta raíz
       * muerde en la misma tanda, y por eso está escrito en los tres sitios. */
      await aPayload(cfg.fields, (PREPARA[coleccion] ?? ((x) => x))(fila), ctxIda, coleccion);
  }
  /* Y se comprueba que la carga SIRVIÓ, en vez de darlo por hecho: un contexto
   * de ida con los mapas vacíos es justo el defecto que esto corrige, y volvería
   * a producir un pleno silencioso. */
  if (!ctxIda.formaDeRel.size || !ctxIda.centinelas.size)
    throw new Error(
      `CONTEXTO DE IDA VACÍO: formaDeRel=${ctxIda.formaDeRel.size} · centinelas=${ctxIda.centinelas.size}.\n` +
        `  Sin sus mapas, la ida proyecta como un render sin declaraciones y la comparación\n` +
        `  sale verde sin haber ejercitado nada — el defecto que cazó \`sin-declaraciones\`.`,
    );
}

const cfgDe = (col) => {
  const c = config.collections.find((x) => x.slug === col);
  if (!c) throw new Error(`COLECCIÓN AUSENTE en la config: '${col}'`);
  return c;
};

/* El proyector de términos embebidos, uno por lado — cada uno con SU contexto,
 * porque si compartieran el del render la comparación se estaría haciendo
 * trampa a sí misma en los documentos anidados, que son justo los interesantes. */
const proyectaConIda = (col, doc, donde) =>
  (DEVUELVE[col] ?? ((x) => x))(aMedido(cfgDe(col).fields, doc, ctxIda, col));
ctxIda.declaraProyector(proyectaConIda);

/**
 * El índice `id → slug` que el render usa cuando una relación llega **un nivel
 * más abajo de lo que `depth` alcanza**. Es el mismo `slugPorId` que la ida
 * construye al sembrar, leído de la DB en vez de del recorrido.
 */
const slugPorId = new Map();
const mediaPorId = new Map();
{
  const { docs } = await payload.find({ collection: "media", pagination: false, depth: 0 });
  for (const m of docs) mediaPorId.set(m.id, m);
}
for (const col of COLECCIONES) {
  const { docs } = await payload.find({ collection: col, pagination: false, depth: 0 });
  for (const d of docs) if (d.slug !== undefined) slugPorId.set(`${col}\0${d.id}`, d.slug);
}

const proyectaConRender = (col, doc, donde) => {
  const destino = cfgDe(col);
  const ctx = contextoDeLectura(destino, proyectaConRender, { slugPorId, mediaPorId });
  return (DEVUELVE[col] ?? ((x) => x))(aMedido(destino.fields, doc, ctx, col));
};

/* ── los sabotajes ────────────────────────────────────────────────────────── */
function ctxRenderDe(cfg) {
  const ctx = contextoDeLectura(cfg, proyectaConRender, { slugPorId, mediaPorId });
  /* `sin-declaraciones`: el contexto del render se queda sin las declaraciones
   * de `custom`, que es lo que pasaría si `declaracionesDe` mirase el sitio
   * equivocado. Tiene que salir DIFERENCIA, no verde. */
  if (SABOTAJE === "sin-declaraciones") {
    ctx.declaraciones.formaDeRel.clear();
    ctx.declaraciones.conKind.clear();
    ctx.declaraciones.centinelas.clear();
  }
  return ctx;
}

/**
 * `sin-ruta-origen`: se le quita `rutaOrigen` a los documentos de `media` que
 * ve **el lado del render**, y sólo a ése —el contexto de la ida resuelve por su
 * mapa `id → ruta` y no mira el campo—. Es **CMS-0g en negativo**: sin el campo,
 * `rutaDeMedia` cae al `/api/media/file/…`, que es otra cadena en el HTML.
 *
 * Sin este sabotaje, «63/63» no distinguiría «el campo funciona» de «el campo no
 * hacía falta», que es la pregunta que toda la decisión contesta.
 */
function sinRutaOrigen(x) {
  if (Array.isArray(x)) return x.map(sinRutaOrigen);
  if (x === null || typeof x !== "object") return x;
  const out = {};
  for (const [k, v] of Object.entries(x)) if (k !== "rutaOrigen") out[k] = sinRutaOrigen(v);
  return out;
}

const ev = new Evaluadas({ nombre: "cms-lectura", unidad: "documentos", minimo: 1, porPaginas: false });
const diferencias = [];
let comparados = 0;
let minimoReal = 0;

console.log(`\n════════ CONTEXTO DEL RENDER vs CONTEXTO DE LA IDA ════════`);
if (SABOTAJE) console.log(`  ⚠ SABOTAJE=${SABOTAJE}\n`);
console.log(`  mismos documentos · mismo walker · lo único que cambia es el CONTEXTO\n`);

const porColeccion = {};
for (const col of COLECCIONES) {
  const cfg = cfgDe(col);
  /* `depth: 1` es lo que el render usa, y es requisito de `deRel` y de
   * `rutaDeMedia`: con el id pelado las dos TIRAN en vez de adivinar. */
  const { docs } = await payload.find({ collection: col, pagination: false, depth: 1, sort: "id" });
  /* `sin-documentos`: la colección se lee vacía. Un `0 diferencias` sobre 0
   * documentos es la regla del cero, y el contrato tiene que cazarlo. */
  const lista = SABOTAJE === "sin-documentos" ? [] : docs;
  minimoReal += docs.length;

  let malas = 0;
  for (const doc of lista) {
    const ida = (DEVUELVE[col] ?? ((x) => x))(aMedido(cfg.fields, doc, ctxIda, col));
    const docRender = SABOTAJE === "sin-ruta-origen" ? sinRutaOrigen(doc) : doc;
    const render = (DEVUELVE[col] ?? ((x) => x))(aMedido(cfg.fields, docRender, ctxRenderDe(cfg), col));
    comparados++;
    ev.ok();
    const a = JSON.stringify(ida);
    const b = JSON.stringify(render);
    if (a !== b) {
      malas++;
      diferencias.push({ coleccion: col, id: doc.id, slug: doc.slug ?? null, ida: a.slice(0, 400), render: b.slice(0, 400) });
    }
  }
  porColeccion[col] = { documentos: docs.length, comparados: lista.length, distintos: malas };
  console.log(`  ${malas ? "❌" : "✓ "} ${col.padEnd(24)} ${String(lista.length).padStart(3)} doc${malas ? `  · ${malas} DISTINTOS` : ""}`);
}

/* El mínimo se DERIVA de lo que la DB tiene, no de lo que se llegó a comparar:
 * derivarlo del artefacto auditado deja que una lectura degenerada se autorice
 * a sí misma (§2.1 de la tanda del manifiesto). */
ev.minimo = Math.max(1, minimoReal);

if (diferencias.length) {
  console.log(`\n  ❌ ${diferencias.length} documento(s) que el render proyecta DISTINTO del camino verificado:`);
  for (const d of diferencias.slice(0, 5)) {
    console.log(`      · ${d.coleccion}/${d.slug ?? d.id}`);
    console.log(`          ida    ${d.ida.slice(0, 160)}`);
    console.log(`          render ${d.render.slice(0, 160)}`);
  }
}

w("medidas/cms-lectura.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿proyecta el contexto del RENDER (declaraciones de la config) lo mismo que el de la IDA (mapas que la ida llenó)?",
    fuente: "los mismos documentos de la misma DB, con `depth: 1`, por el mismo walker",
    noPrueba: "que la proyección sea fiel al dato medido — eso es `qa:cms-roundtrip`. Prueba que el camino del render no pierde nada respecto del verificado.",
    sabotaje: SABOTAJE || null,
  },
  contrato: { evaluadas: comparados, minimo: ev.minimo, suficiente: comparados >= ev.minimo },
  porColeccion,
  veredicto: { comparados, distintos: diferencias.length, ok: comparados >= ev.minimo && diferencias.length === 0 },
  diferencias,
});

console.log(
  `\n${diferencias.length ? "❌" : "✅"} cms-lectura: ${comparados - diferencias.length}/${comparados} documentos IDÉNTICOS por los dos contextos.\n`,
);
process.exit(ev.informe() || diferencias.length ? 2 : 0);
