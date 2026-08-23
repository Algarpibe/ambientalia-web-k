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
import { creaContexto, derivaTaxonomias, PREPARA } from "../seed/seed.mjs";
import { aPayload } from "../../packages/cms-config/src/mapeo.mjs";
import { APP, enApp, Evaluadas, gritaSiRevienta, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";
gritaSiRevienta();

const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = ["canal-mudo", "guarda-floja", "coleccion-fuera"];
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
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ Y HAY UNA TERCERA, AÑADIDA EL 2026-08-23 (98.ª, D2), QUE ES LA BUENA:
 * **`custom.canalDeMedia`, DECLARADO EN EL ESQUEMA.**
 *
 * `NOMBRES_URL` es *«una lista de literales dentro de una sonda cuyo trabajo es
 * reconocer algo»* — o sea la señal exacta de §regla 9, 7.º caso: **envejece
 * contra el repo, en silencio**, y un campo que no case no da error porque un
 * patrón que no casa no es un cero. La regla que esta sonda implementa dice
 * *«los canales se derivan de los que el ESQUEMA declara»*, y hasta hoy la
 * segunda mitad los derivaba **de una lista de la sonda**.
 *
 * Con `custom.canalDeMedia` el campo dice **él mismo** que es un canal, y con
 * qué clase:
 *
 *   · `"externo"` — el asset vive FUERA (`srcExterno` de `imagen-pagina`, 1
 *     instancia medida). **No se resuelve contra `apps/web/public`**: no hay
 *     fichero que capturar y su ausencia de la carpeta no es un hueco. Sale
 *     nombrado en el inventario con su cardinal, que es lo que lo convierte en
 *     un hueco visible en vez de en la próxima sorpresa.
 *
 * ⚠ `NOMBRES_URL` se conserva —hay campos vivos que dependen de ella y
 * migrarlos es otra tanda— pero **no se amplía**: un canal nuevo se declara en
 * el esquema. Los dos caminos se publican por separado abajo, con su cardinal,
 * para que no se lea uno como el otro.
 * ═════════════════════════════════════════════════════════════════════════ */
const NOMBRES_URL = new Set(["ogimage", "portada", "image", "imagen", "icono", "poster", "src", "archivo"]);

const canales = []; // { coleccion, ruta, tipo, clase? }
function caminaCampos(coleccion, campos, prefijo = "") {
  for (const c of campos ?? []) {
    const nombre = "name" in c ? c.name : null;
    const aqui = nombre ? (prefijo ? `${prefijo}.${nombre}` : nombre) : prefijo;
    const declarado = c.custom?.canalDeMedia;
    if (declarado) canales.push({ coleccion, ruta: aqui, tipo: "declarado", clase: declarado });
    else if (c.type === "upload") canales.push({ coleccion, ruta: aqui, tipo: "upload" });
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
    /* El 4.º argumento es EL DOCUMENTO: `registra` indexa también por IDENTIDAD
     * y una colección con `prefijo` colisiona si sólo se le pasa el slug
     * (§regla 29). */
    if (d?.slug) ctx.registra(c.coleccion, d.slug, `sondeo:${c.coleccion}:${d.slug}`, d);
  }
for (const t of TAXONOMIAS_DERIVADAS)
  for (const term of derivaTaxonomias(catalogos).get(t.coleccion) ?? [])
    ctx.registra(t.coleccion, term.slug, `sondeo:${t.coleccion}:${term.slug}`, term);

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

/**
 * SABOTAJE `coleccion-fuera` — **la instancia separadora que el dominio viejo
 * no tenía.** Inyecta una colección que EJERCE media y a la que el esquema no
 * le declara NINGÚN canal, **fuera de `SEMBRADAS`**. Con el dominio de la
 * guarda escrito a mano salía **ausente y en verde**; con el dominio derivado
 * de lo observado, sale **ROJA**. Es el caso que la 95.ª existe para no volver
 * a tener en silencio (§regla 9 caso 7).
 */
if (SABOTAJE === "coleccion-fuera")
  filas.push({ donde: "coleccion-fantasma.portada", ruta: "/images/postiza-del-sabotaje.jpg", existe: true, canal: "portada", coleccion: "coleccion-fantasma" });

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

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CUARTO CUBO: EL CANAL DECLARADO QUE **NO SE RESUELVE LOCALMENTE**
 *
 * `creaContexto().media` es la guarda de los assets **nuestros**: resuelve
 * contra `apps/web/public` y por eso es la que sabe si falta un fichero. Un
 * canal `custom.canalDeMedia === "externo"` **no pasa por ella** —su valor es
 * una URL absoluta, no una ruta— así que **nunca aparece en `mediaAuditada`**.
 *
 * Meterlo en `sinDato` diría exactamente lo contrario de lo que pasa: no es
 * que el canal esté vacío, es que **su dato no se mide con esta guarda**.
 * Sería §sondas 4 con el cero puesto en el cubo de destino, y encima con el
 * canal recién estrenado — o sea el hueco que esta sonda existe para evitar.
 *
 * Así que se cuenta **contra el dato del catálogo**, por su clave hoja, y sale
 * con su cardinal. `0` aquí sí sería un hueco (el canal declarado sin
 * ejercer); `1` es lo medido hoy (`f33-extraido.json` §origenImagen).
 * ═════════════════════════════════════════════════════════════════════════ */
function cuentaPorClave(v, clave, n = { n: 0 }) {
  if (Array.isArray(v)) { for (const x of v) cuentaPorClave(x, clave, n); return n; }
  if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (k === clave && typeof x === "string" && x.trim() !== "") n.n++;
      cuentaPorClave(x, clave, n);
    }
  return n;
}
/**
 * ⚠ **EL CARDINAL ES POR COLECCIÓN Y HOJA, NO POR RUTA — y se etiqueta como
 * tal.** Un mismo bloque aparece en VARIAS rutas de la config (`imagen-pagina`
 * cuelga de `modulosSueltos` y de `filas.columnas.modulos`), y `cuentaPorClave`
 * recorre el catálogo entero por el nombre de la hoja: no sabe por cuál de las
 * dos entró el valor. Publicarlo contra cada ruta diría **1 y 1** donde hay
 * **un solo valor**, que es §sondas 4 en su tercera cara — un número plausible
 * de más, y encima uno que invita a explicarlo.
 *
 * Se cuenta UNA vez por `(coleccion, hoja)` y las rutas que comparten esa hoja
 * se nombran juntas. Repartirlo por ruta exigiría recorrer el dato **por
 * camino**, y eso es otra sonda: aquí lo que se declara es EL CANAL.
 */
const externos = [];
for (const c of canales.filter((x) => x.clase === "externo")) {
  const hoja = c.ruta.split(".").pop();
  const k = `${c.coleccion}\0${hoja}`;
  const ya = externos.find((x) => x.k === k);
  if (ya) { ya.rutas.push(c.ruta); continue; }
  externos.push({
    k,
    coleccion: c.coleccion,
    hoja,
    clase: c.clase,
    tipo: c.tipo,
    rutas: [c.ruta],
    valores: cuentaPorClave(catalogos.get(c.coleccion) ?? [], hoja).n,
    unidad: "valores de la HOJA en toda la colección — no por ruta",
  });
}
const rutasExternas = new Set(externos.flatMap((c) => c.rutas.map((r) => `${c.coleccion} · ${r}`)));

const noEjercidos = canales.filter((c) => !ejercidos.has(`${c.coleccion} · ${c.ruta}`) && !rutasExternas.has(`${c.coleccion} · ${c.ruta}`));
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
console.log(`   · EXTERNOS (no se resuelven local)    ${String(externos.length).padStart(4)}   ← su dato no pasa por \`creaContexto().media\``);
console.log(`   referencias de media recorridas       ${String(filas.length).padStart(4)}`);
console.log(`   rutas DISTINTAS                       ${String(new Set(filas.map((f) => f.ruta)).size).padStart(4)}`);
console.log(`   · AUSENTES                            ${String(faltan.length).padStart(4)}`);
console.log(
  `\n   dominio de la guarda CANAL MUDO: ${[...new Set([...porCanal.values()].map((e) => e.coleccion))].length} colecciones ` +
    `DERIVADAS de lo observado (no una lista) — ${[...new Set([...porCanal.values()].map((e) => e.coleccion))].sort().join(", ")}`,
);

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

if (externos.length) {
  console.log(`\n  ── CANALES EXTERNOS — el asset alojado FUERA (D2, 2026-08-22) ──`);
  for (const c of externos) {
    console.log(
      `   ${(c.coleccion + " · " + c.hoja).padEnd(30)} ${String(c.valores).padStart(4)} valor(es) en la COLECCIÓN   ` +
        `[${c.tipo}:${c.clase}]  ← NO se captura ni se resuelve contra apps/web/public`,
    );
    for (const r of c.rutas) console.log(`        ruta declarada: ${r}`);
  }
  console.log(`   ⚠ el cardinal es por (colección · HOJA), no por ruta: un mismo bloque cuelga de`);
  console.log(`     varias rutas y publicarlo contra cada una diría «1 y 1» donde hay UN valor.`);
  console.log(`   Su ausencia de la carpeta no es un hueco: no hay fichero que capturar.`);
  console.log(`   Y su cardinal se cuenta contra el DATO del catálogo, no contra \`mediaAuditada\`,`);
  console.log(`   porque este canal no pasa por la guarda que resuelve rutas locales.`);
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
/**
 * ⚠⚠ **EL DOMINIO DE ESTA GUARDA SE DERIVA DE LO OBSERVADO. NO SE ESCRIBE.**
 * (95.ª tanda — §regla 9 caso 7, tercera vez de la misma clase en el repo)
 *
 * Aquí ponía `for (const col of SEMBRADAS)`, o sea **9 literales escritos a
 * mano en `seed.mjs`**. La pregunta que la guarda hace es *«¿hay alguna
 * colección que EJERCE media y a la que el esquema no le declara NINGÚN
 * canal?»*, y esa pregunta **no tiene un `SEMBRADAS` dentro**: el conjunto
 * correcto es *las colecciones que el recorrido vio ejerciendo media*, que es
 * exactamente `porCanal` — el dato, no una lista.
 *
 * Con la lista, una colección fuera de `SEMBRADAS` que ejerciera media sin
 * canales declarados salía **AUSENTE, no roja**: el `for` no la visitaba y un
 * bucle que no itera **no da error, da cero** (§sondas 4).
 *
 * ── LA MITAD HONESTA, y va primero porque decide cómo se lee este cambio ──
 * **Hoy `SEMBRADAS` y `CATALOGOS` son EL MISMO CONJUNTO** —diferencia
 * simétrica **0 y 0**, derivado, los dos con 9—, y `porCanal` sólo puede
 * contener colecciones de `CATALOGOS`, que es lo que el recorrido camina. O
 * sea: **0 instancias separadoras en el dato de hoy**, y por tanto el cambio
 * es **NO-OP sobre el veredicto**. Son §*dos variables confundidas*: dentro de
 * este dominio la guarda «nombraba una de las dos al azar», y la que tenía a
 * mano era la incorrecta por construcción — `SEMBRADAS` la mantiene una
 * persona, `porCanal` lo produce el propio recorrido.
 *
 * **Que sea NO-OP hoy no es un argumento para dejarlo**: es justo la forma que
 * tiene este defecto de sobrevivir. Lo que prueba que la guarda ahora
 * discrimina **no es esta corrida, es su negativo** (`SABOTAJE=coleccion-fuera`),
 * porque la instancia separadora **hay que fabricarla**: el dato no la tiene.
 *
 * **Y lo que no se puede derivar, TIRA** (§regla 6: una ausencia se rechaza,
 * no se sustituye) — el bloque de abajo.
 */
const ejercenMedia = [...new Set([...porCanal.values()].map((e) => e.coleccion))].sort();
if (ejercenMedia.length === 0 && filas.length > 0)
  throw new Error(
    "DOMINIO VACÍO: hay referencias de media recorridas y CERO colecciones derivadas de ellas.\n" +
      "  `porCanal` no puede quedarse vacío con `filas` poblado: o `coleccionDe` dejó de partir\n" +
      "  el `donde`, o el agrupado no corrió. «0 colecciones» y «no pude derivarlas» no pueden\n" +
      "  dar la misma salida (§regla 6).",
  );
for (const col of ejercenMedia)
  if (!conCanales.has(col))
    err(
      `CANAL MUDO: '${col}' ejerce media pero el esquema no le declara NINGÚN canal — el walker no la está mirando.\n` +
        `   Dominio de esta guarda: las ${ejercenMedia.length} colecciones DERIVADAS de lo observado, no una lista.`,
    );
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
    /**
     * El dominio de la guarda CANAL MUDO, congelado con su cardinal: se DERIVA
     * de las colecciones que el recorrido vio ejerciendo media (95.ª). Antes
     * era `SEMBRADAS`, 9 literales a mano — y una colección fuera de esa lista
     * salía ausente en vez de roja.
     */
    dominioCanalMudo: [...new Set([...porCanal.values()].map((e) => e.coleccion))].sort(),
  },
  recuento: {
    canalesDeclarados: canales.length,
    canalesEjercidos: ejercidos.size,
    canalesSinDato: sinDato.length,
    canalesDeOtroSembrador: otroSembrador.length,
    canalesExternos: externos.length,
    referencias: filas.length,
    rutasDistintas: new Set(filas.map((f) => f.ruta)).size,
    ausentes: faltan.length,
  },
  canalesDeclarados: canales,
  canalesSinDato: sinDato,
  canalesDeOtroSembrador: otroSembrador,
  /**
   * Los EXTERNOS, con su cardinal contado sobre el DATO. No entran en
   * `origenesACapturar`: no hay fichero que pedir, y meterlos ahí mandaría a la
   * campaña de captura a por un asset que el propietario decidió NO capturar
   * (D2, 2026-08-22).
   */
  canalesExternos: externos,
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
