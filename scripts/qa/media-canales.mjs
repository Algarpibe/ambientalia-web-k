/**
 * EL INVENTARIO DE MEDIA, DERIVADO POR CANALES — y por los que el ESQUEMA
 * declara, no por los que algún extractor ya lee.
 * Uso: npm run qa:media-canales      (SABOTAJE=canal-mudo | guarda-floja)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE — la tercera vez del mismo hueco
 *
 * El hueco de media se ha descubierto **tres veces CHOCANDO con `MEDIA
 * AUSENTE`**, nunca derivándolo:
 *
 * | # | canal | cómo se descubrió | n |
 * |---|---|---|---|
 * | 1 | el CUERPO rico | el seed murió al sembrar `entradas-blog` | 1889 → 28 |
 * | 2 | la DESTACADA y el `og:image` | el seed murió otra vez | 93 → 4 |
 * | 3 | **la foto del PANEL de producto** | el seed murió otra vez | **5** |
 *
 * > **Un canal nuevo no avisa: espera a que alguien lo siembre.** Y como cada
 * > fase estrena canales, el coste se paga entero cada vez.
 *
 * De ahí la regla que esta sonda implementa (`CLAUDE.md` §El inventario de
 * media): **el inventario se deriva de los canales que el ESQUEMA declara, no
 * de los que algún extractor ya lee.** Un canal declarado y todavía sin dato
 * **sale nombrado con un cero**, que es lo que lo convierte en un hueco futuro
 * visible en vez de en la próxima sorpresa.
 *
 * ── Las dos mitades, y ninguna sirve sola ────────────────────────────────
 *   **(a) los canales DECLARADOS** — se caminan los campos de la config
 *       resuelta y se marca todo el que puede portar un fichero: `upload`
 *       (relación a `media`) y los de texto que el modelo usa para una URL de
 *       asset (`seo.ogImage`, `image`…). Sale la lista **completa**, con ceros;
 *   **(b) los VALORES**, y contra LA GUARDA QUE PARA — no contra otra. El
 *       recorrido es el del propio seed en modo sondeo, así que quien decide si
 *       un fichero está es `creaContexto().media`, la misma función que mata al
 *       sembrar. **No hay segunda definición de «qué es media»** (clase C7).
 *
 * ⚠ **Y la guarda NO ES LA MISMA PARA TODOS, que es el error que convirtió «90»
 * en «4»:** `seed.mjs` exige el fichero **exacto** en `apps/web/public`;
 * `seed-kb.mjs` acepta además `media-corpus/` y colapsa variantes. Derivar
 * contra la que no corre da un número correcto de una pregunta que nadie hace.
 * Aquí cada colección se cruza contra **la suya**, y la sonda lo dice.
 *
 * ── Lo que NO hace ───────────────────────────────────────────────────────
 * No abre el original, no captura y no siembra. Produce **una lista congelada**
 * que la campaña de captura consume.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATALOGOS, TAXONOMIAS_DERIVADAS, cargaCatalogos } from "../seed/catalogos.mjs";
import { creaContexto, derivaTaxonomias, PREPARA, SEMBRADAS } from "../seed/seed.mjs";
import { aPayload } from "../../packages/cms-config/src/mapeo.mjs";
import { APP, enApp, Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["canal-mudo", "guarda-floja"];
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — esta corrida DEBE fallar.\n`);

const { getPayload } = await import("payload");
const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const payload = await getPayload({ config: await construyeConfig() });

/* ══════════════════════════════════════════════════════════════════════════
 * (a) LOS CANALES DECLARADOS — caminando la config, no una lista
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Un campo es canal de media si **puede portar un fichero**. Dos formas, y las
 * dos se declaran para que ninguna se cuele por el hueco de la otra:
 *
 *   · `upload` → relación a `media`. Es el canal explícito;
 *   · `text` cuyo nombre está en `NOMBRES_URL` → el modelo lo usa para una URL
 *     de asset aunque el tipo no lo diga (`seo.ogImage` es el caso medido).
 *
 * ⚠ La segunda mitad es una heurística **declarada**, no identidad: si un campo
 * de texto nuevo lleva una URL de asset y no está aquí, es un canal invisible.
 * Por eso la sonda IMPRIME los nombres que reconoce — una heurística que no se
 * puede auditar es la que produce el sobre-casado de §sondas 4.
 */
const NOMBRES_URL = new Set(["ogimage", "portada", "image", "imagen", "icono", "poster", "src", "archivo"]);

const canales = []; // { coleccion, ruta, tipo }
function caminaCampos(coleccion, campos, prefijo = "") {
  for (const c of campos ?? []) {
    const nombre = "name" in c ? c.name : null;
    const aqui = nombre ? (prefijo ? `${prefijo}.${nombre}` : nombre) : prefijo;
    if (c.type === "upload") canales.push({ coleccion, ruta: aqui, tipo: "upload" });
    else if (c.type === "text" && nombre && NOMBRES_URL.has(nombre.toLowerCase()))
      canales.push({ coleccion, ruta: aqui, tipo: "texto-url" });
    if (Array.isArray(c.fields)) caminaCampos(coleccion, c.fields, aqui);
    if (Array.isArray(c.blocks)) for (const b of c.blocks) caminaCampos(coleccion, b.fields, `${aqui}.${b.slug}`);
    if (Array.isArray(c.tabs)) for (const t of c.tabs) caminaCampos(coleccion, t.fields, aqui);
  }
}
for (const col of payload.config.collections) {
  if (col.slug === "media") continue; // es el destino, no un canal
  caminaCampos(col.slug, SABOTAJE === "canal-mudo" && col.slug === "productos" ? [] : col.fields);
}

/* ══════════════════════════════════════════════════════════════════════════
 * (b) LOS VALORES — el recorrido del propio seed, en modo sondeo
 * ═════════════════════════════════════════════════════════════════════════ */

const catalogos = await cargaCatalogos();
const ctx = creaContexto(payload, { sondeo: true });
/* El sondeo no escribe, pero las relaciones necesitan ids: se registran los
 * slugs de todas las colecciones antes de recorrer, igual que hace `cms:sondeo`. */
for (const c of CATALOGOS)
  for (const fila of catalogos.get(c.coleccion) ?? []) {
    const d = (PREPARA[c.coleccion] ?? ((x) => x))(fila);
    if (d?.slug) ctx.registra(c.coleccion, d.slug, `sondeo:${c.coleccion}:${d.slug}`);
  }
for (const t of TAXONOMIAS_DERIVADAS)
  for (const term of derivaTaxonomias(catalogos).get(t.coleccion) ?? [])
    ctx.registra(t.coleccion, term.slug, `sondeo:${t.coleccion}:${term.slug}`);

const porColeccion = new Map();
for (const c of CATALOGOS) {
  const cfg = payload.config.collections.find((x) => x.slug === c.coleccion);
  const filas = catalogos.get(c.coleccion) ?? [];
  let n = 0;
  for (const fila of filas) {
    const d = (PREPARA[c.coleccion] ?? ((x) => x))(fila);
    try {
      await aPayload(cfg.fields, d, ctx, c.coleccion);
      n++;
    } catch (e) {
      /* Un fallo de recorrido NO se traga: se nombra. Tragarlo convertiría
       * «no pude inventariar esta fila» en «esta fila no tiene media». */
      porColeccion.set(c.coleccion, { ...(porColeccion.get(c.coleccion) ?? {}), error: String(e?.message ?? e).slice(0, 160) });
    }
  }
  porColeccion.set(c.coleccion, { ...(porColeccion.get(c.coleccion) ?? {}), filas: filas.length, recorridas: n });
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL CRUCE — canal × existencia, contra LA guarda de cada colección
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * ⚠ **Las DOS guardas, nombradas.** `articulos-kb` se siembra con `seed-kb.mjs`,
 * que acepta `media-corpus/` y colapsa variantes; el resto con `seed.mjs`, que
 * exige el fichero EXACTO en `apps/web/public`. Cruzar contra la que no corre es
 * el error que convirtió «90 sin capturar» en «4».
 */
const GUARDA = (coleccion) =>
  coleccion === "articulos-kb"
    ? { id: "seed-kb", que: "acepta media-corpus/ y colapsa variantes" }
    : { id: "seed", que: "exige el fichero EXACTO en apps/web/public" };

/**
 * `donde` lo compone `aPayload` como `<coleccion>.<ruta>` con índices de array
 * —`productos.image`, `casos.galeria[3].src`—, que es literalmente el texto que
 * la guarda imprime al morir. Se parte por el primer punto y se quitan los
 * índices: lo que queda ES el canal.
 */
const canalDe = (donde) => String(donde).split(".").slice(1).join(".").replace(/\[\d+\]/g, "") || "(raíz)";
const coleccionDe = (donde) => String(donde).split(".")[0].replace(/\[\d+\]/g, "");

const filas = [];
for (const m of ctx.mediaAuditada) {
  const existe = SABOTAJE === "guarda-floja" ? true : m.existe;
  filas.push({ ...m, existe, canal: canalDe(m.donde), coleccion: coleccionDe(m.donde) });
}

const porCanal = new Map();
for (const f of filas) {
  const k = `${f.coleccion} · ${f.canal}`;
  if (!porCanal.has(k)) porCanal.set(k, { coleccion: f.coleccion, canal: f.canal, refs: 0, rutas: new Set(), faltan: new Set() });
  const e = porCanal.get(k);
  e.refs++;
  e.rutas.add(f.ruta);
  if (!f.existe) e.faltan.add(f.ruta);
}

/**
 * Canales DECLARADOS que este recorrido no ejerce. Son **dos cosas distintas**
 * y confundirlas fabrica un hueco futuro que no existe:
 *
 *   · **sin dato** — la colección la siembra ESTE recorrido y el canal está
 *     vacío: hueco futuro de verdad, nombrado;
 *   · **otro sembrador** — la colección NO está en `CATALOGOS` (`articulos-kb`
 *     la siembra `seed-kb.mjs` desde `media-corpus`). Su media existe; lo que
 *     pasa es que **esta sonda no la mira**, y decir «sin dato» sería declarar
 *     un cero que no se ha medido (§sondas 4).
 */
const ejercidos = new Set([...porCanal.values()].map((e) => `${e.coleccion} · ${e.canal}`));
const RECORRIDAS = new Set(CATALOGOS.map((c) => c.coleccion));
const noEjercidos = canales.filter((c) => !ejercidos.has(`${c.coleccion} · ${c.ruta}`));
const sinDato = noEjercidos.filter((c) => RECORRIDAS.has(c.coleccion));
const otroSembrador = noEjercidos.filter((c) => !RECORRIDAS.has(c.coleccion));

const faltan = [...new Set(filas.filter((f) => !f.existe).map((f) => f.ruta))].sort();

/* ══════════════════════════════════════════════════════════════════════════
 * INFORME
 * ═════════════════════════════════════════════════════════════════════════ */

const ev = new Evaluadas({ nombre: "media-canales", unidad: "canales declarados", minimo: SABOTAJE ? 1 : canales.length });
for (const _ of canales) ev.ok();

let rojo = 0;
const err = (m) => { rojo++; console.error(`\n❌ ${m}`); };

console.log(`\n════════ INVENTARIO DE MEDIA POR CANALES ════════\n`);
console.log(`   canales DECLARADOS por el esquema     ${String(canales.length).padStart(4)}`);
console.log(`   · ejercidos por algún dato            ${String(ejercidos.size).padStart(4)}`);
console.log(`   · declarados y SIN DATO todavía       ${String(sinDato.length).padStart(4)}   ← hueco futuro, nombrado`);
console.log(`   · de OTRO sembrador (seed-kb)         ${String(otroSembrador.length).padStart(4)}   ← existe, pero esta sonda no lo mira`);
console.log(`   referencias de media recorridas       ${String(filas.length).padStart(4)}`);
console.log(`   rutas DISTINTAS                       ${String(new Set(filas.map((f) => f.ruta)).size).padStart(4)}`);
console.log(`   · AUSENTES                            ${String(faltan.length).padStart(4)}`);

console.log(`\n  ── POR COLECCIÓN Y CANAL (guarda entre paréntesis) ──`);
for (const e of [...porCanal.values()].sort((a, b) => b.faltan.size - a.faltan.size || b.refs - a.refs))
  console.log(
    `   ${(e.coleccion + " · " + e.canal).padEnd(46)} ${String(e.refs).padStart(5)} refs · ` +
      `${String(e.rutas.size).padStart(4)} rutas · ${String(e.faltan.size).padStart(3)} AUSENTES   (${GUARDA(e.coleccion).id})`,
  );

if (sinDato.length) {
  console.log(`\n  ── CANALES DECLARADOS SIN DATO (cuestan una línea, y son el próximo hueco) ──`);
  for (const c of sinDato) console.log(`   ${c.coleccion} · ${c.ruta}   [${c.tipo}]`);
}

if (faltan.length) {
  console.log(`\n  ── LAS AUSENTES, una a una ──`);
  for (const r of faltan) console.log(`   ⛔ ${r}`);
}

/* ── LAS GUARDAS ────────────────────────────────────────────────────────── */
if (canales.length === 0) err(`0 canales declarados: el walker no está leyendo la config.`);
if (filas.length === 0) err(`0 referencias recorridas — eso no es «no hay media», es que el recorrido no corrió.`);
/* `canal-mudo`: si una colección con canales conocidos sale con CERO, es que el
 * walker dejó de mirarla. Un canal que desaparece del inventario es peor que uno
 * que falta: nadie lo echa de menos. */
const conCanales = new Set(canales.map((c) => c.coleccion));
for (const col of SEMBRADAS)
  if (!conCanales.has(col) && [...porCanal.values()].some((e) => e.coleccion === col))
    err(`CANAL MUDO: '${col}' ejerce media pero el esquema no le declara NINGÚN canal — el walker no la está mirando.`);
/* `guarda-floja`: si nadie falta Y el corpus tiene ausencias conocidas, la
 * guarda dejó de discriminar. Se comprueba contra el disco, no contra memoria. */
if (SABOTAJE === "guarda-floja" && faltan.length === 0)
  err(`GUARDA FLOJA: con el sabotaje puesto TODO existe — la existencia no se está comprobando.`);

w("medidas/media-canales.json", {
  meta: {
    fecha: hoy(),
    que: "el inventario de media DERIVADO POR CANALES del esquema, cruzado contra la guarda que para",
    regla: "el inventario se deriva de los canales que el ESQUEMA declara, no de los que algún extractor ya lee",
    guardas: {
      seed: "exige el fichero EXACTO en apps/web/public",
      "seed-kb": "acepta media-corpus/ y colapsa variantes",
    },
    sabotaje: SABOTAJE,
    noHace: ["no abre el original", "no captura", "no siembra"],
  },
  recuento: {
    canalesDeclarados: canales.length,
    canalesEjercidos: ejercidos.size,
    canalesSinDato: sinDato.length,
    canalesDeOtroSembrador: otroSembrador.length,
    referencias: filas.length,
    rutasDistintas: new Set(filas.map((f) => f.ruta)).size,
    ausentes: faltan.length,
  },
  canalesDeclarados: canales,
  canalesSinDato: sinDato,
  canalesDeOtroSembrador: otroSembrador,
  porCanal: [...porCanal.values()].map((e) => ({
    coleccion: e.coleccion,
    canal: e.canal,
    guarda: GUARDA(e.coleccion).id,
    refs: e.refs,
    rutas: e.rutas.size,
    ausentes: [...e.faltan].sort(),
  })),
  /**
   * LA LISTA que la campaña de captura consume. Una, congelada.
   *
   * ⚠ Se llama `origenesACapturar` **porque es el nombre que `captura-f3-media`
   * ya lee** en su modo LISTA. Inventarle otro obligaría a un adaptador, que es
   * una segunda definición de «qué hay que pedir» (clase C7) — y la lista es
   * justo el objeto que esta sonda existe para que haya UNO solo.
   */
  origenesACapturar: faltan,
  /**
   * La MISMA lista con la forma que  consume (objeto por ruta).
   * No es una segunda lista: es la misma, escrita también en el formato del otro
   * consumidor para que ninguno tenga que re-derivarla.
   */
  faltan: Object.fromEntries(faltan.map((r) => [r, { canales: [...new Set(filas.filter((f) => f.ruta === r).map((f) => f.canal))] }])),
  porColeccion: Object.fromEntries(porColeccion),
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} media-canales: ${canales.length} canales declarados · ${ejercidos.size} ejercidos · ` +
    `${sinDato.length} sin dato · ${otroSembrador.length} de otro sembrador · ${faltan.length} ficheros a capturar · ${rojo} guarda(s) en rojo\n`,
);
process.exit(rojo === 0 ? 0 : 2);
