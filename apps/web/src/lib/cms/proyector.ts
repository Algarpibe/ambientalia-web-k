/**
 * EL PROYECTOR GENÉRICO DE LECTURA — documento de Payload → la forma de
 * `src/lib`, con **el mismo walker que escribió el seed**.
 *
 * `ESQUEMA-CMS.md` §7c (CMS-0g) · `PLAN-FASE-2.md` §F2-3.
 *
 * ── Por qué existe, y qué sustituye ───────────────────────────────────────
 * El canario (`/faqs/[slug]`) se migró con un proyector **escrito a mano, campo
 * a campo**, y podía hacerse porque `faqs` es 0 en las cuatro transformaciones
 * de FORMA. `qa:lectura-forma` midió que **ninguna otra familia lo es**: la
 * mayor trae 199 hojas, 17 arrays y 2 uniones de bloques. Escribir su proyector
 * a mano sería re-implementar el walker en TypeScript — la «segunda lista
 * escrita a mano» contra la que avisa la cabecera de `mapeo.mjs`, y **peor aquí
 * que en el seed**: allí las dos listas se comparan entre sí (el round-trip), y
 * en el render **no hay pareja**, así que un olvido sólo se ve si mueve píxeles.
 *
 * Así que aquí no hay ninguna lista: hay **una llamada a `aMedido`**, el mismo
 * recorrido de la config que `aPayload` hace al derecho.
 *
 * ── Las tres cosas que el walker no puede derivar de la forma ─────────────
 * Cuando la vuelta corría dentro del round-trip, las tomaba de los mapas que la
 * IDA iba llenando en el mismo proceso. Aquí no hay ida, así que vienen de la
 * config (`custom`), y **`npm run qa:cms-decl` comprueba que lo declarado
 * coincide con lo que la ida deriva, en las dos direcciones** — sin esa guarda
 * un `custom` caído en un refactor no daría error en ninguna parte.
 *
 * ── ⚠ `depth: 1` MÁS DOS ÍNDICES, y la segunda mitad no es un extra ───────
 * Con `depth: 1` un término embebido llega poblado, pero **su propia relación y
 * su propia media quedan un nivel más abajo** y vuelven como id. Subir el
 * `depth` es la salida cara —los documentos de `sectores`/`monograficos` son
 * enormes y el coste crece con la profundidad, no con lo que hace falta, que es
 * *un slug*—. Se pasan los dos índices que la ida tiene por construcción
 * (`id → slug` e `id → media`), leídos una vez por build.
 *
 * Y cuando falta el índice, las dos **tiran**: devolver el id o una URL
 * plausible convertiría «no puedo reconstruirlo» en «esto es lo que había»
 * (`CLAUDE.md` §sondas, regla 6).
 *
 * ── Lo que garantiza que esta proyección es fiel ──────────────────────────
 * No es este fichero: son dos medidas. `qa:cms-roundtrip` prueba que ida y
 * vuelta son inversas (63/63) y **`qa:cms-lectura` prueba que ESTE contexto
 * proyecta lo mismo que aquél** (63/63, negativo 4/4) — sin la segunda, el
 * primero sería un verde prestado: verifica un contexto y el build usa otro.
 */
import type { CollectionSlug, SanitizedConfig } from "payload";
/* El walker va en JS con JSDoc — es el MISMO que usa el seed, y duplicarlo
 * tipado sería la segunda lista que este fichero existe para evitar. */
import { aMedido, contextoDeLectura } from "@kunak/cms-config/mapeo";
import { DEVUELVE } from "@kunak/cms-config/vuelta";
import { cms } from "./local";

type Doc = Record<string, unknown>;
type Fn = (x: unknown) => unknown;
const devuelveDe = (col: string): Fn =>
  (DEVUELVE as Record<string, Fn>)[col] ?? ((x: unknown) => x);

type Config = SanitizedConfig;
type Coleccion = Config["collections"][number];

/**
 * ⚠ **La config sale de la INSTANCIA de Payload, no de `construyeConfig()`.**
 * Llamarla otra vez construye una config nueva y Payload la rechaza —
 * `DuplicateCollection: "payload-kv"`, medido en el primer build de esta
 * familia—. Y aparte de que rompe, la instancia es lo correcto: es §El
 * principio, *verificar contra la salida servida* — el proyector camina la
 * config que el render **está usando**, no una equivalente.
 */
const config = async (): Promise<Config> => (await cms()).config;

/**
 * Los dos índices, construidos **una vez por proceso de build**. Son la misma
 * inversa que `creaContexto` monta al sembrar, leída de la DB en vez de del
 * recorrido — no una segunda fuente: la DB **es** lo que la ida escribió.
 */
let indicesCache: Promise<{ slugPorId: Map<string, unknown>; mediaPorId: Map<unknown, Doc> }> | null = null;
function indices() {
  indicesCache ??= (async () => {
    const payload = await cms();
    const resuelta = await config();
    const slugPorId = new Map<string, unknown>();
    const mediaPorId = new Map<unknown, Doc>();
    const { docs: medias } = await payload.find({ collection: "media", pagination: false, depth: 0 });
    for (const m of medias) mediaPorId.set(m.id, m as unknown as Doc);
    for (const c of resuelta.collections) {
      /* Sólo las que tienen `slug`: es la llave de la que `deRel` tira, y pedir
       * las demás sería tráfico sin destinatario. */
      if (!c.fields.some((f) => "name" in f && f.name === "slug")) continue;
      const { docs } = await payload.find({
        collection: c.slug as CollectionSlug,
        pagination: false,
        depth: 0,
      });
      for (const d of docs) slugPorId.set(`${c.slug}\0${d.id}`, (d as unknown as Doc).slug);
    }
    return { slugPorId, mediaPorId };
  })();
  return indicesCache;
}

async function coleccionCfg(slug: CollectionSlug): Promise<Coleccion> {
  const c = (await config()).collections.find((x) => x.slug === slug);
  /* Regla 6: la ausencia se RECHAZA. Un `?? { fields: [] }` aquí proyectaría
   * documentos vacíos y el build saldría verde con páginas en blanco. */
  if (!c) throw new Error(`COLECCIÓN AUSENTE en la config resuelta: '${slug}'`);
  return c;
}

/**
 * El contexto de lectura de una colección. `proyectaDoc` reconstruye un término
 * EMBEBIDO proyectando el documento destino con los campos de SU colección —no
 * copiándolo de ningún catálogo medido, que sería comparar el dato consigo
 * mismo— y le aplica después su `DEVUELVE`, la inversa de los alias de la ida.
 */
async function contexto(slug: CollectionSlug) {
  const cfg = await coleccionCfg(slug);
  const resuelta = await config();
  const idx = await indices();

  const proyectaDoc = (col: string, doc: object, donde: string): object => {
    const destino = resuelta.collections.find((x) => x.slug === col);
    if (!destino) throw new Error(`PROYECTOR: la colección destino '${col}' (en ${donde}) no está en la config`);
    const ctxDestino = contextoDeLectura(destino, proyectaDoc, idx);
    return devuelveDe(col)(aMedido(destino.fields, doc, ctxDestino, col)) as object;
  };

  return { cfg, ctx: contextoDeLectura(cfg, proyectaDoc, idx) };
}

/**
 * Todos los documentos de una colección, **proyectados a la forma medida** y en
 * el orden en que el seed los insertó.
 *
 * `sort: "id"`, `pagination: false` y la ausencia de `try/catch` son las mismas
 * decisiones de `local.ts` y por las mismas razones — ver su cabecera.
 */
/**
 * ── EL FILTRO DE PUBLICACIÓN VIVE AQUÍ, y estuvo en el sitio equivocado ──
 *
 * F2-4 añade `estado: borrador | publicado` para poder programar salidas y
 * previsualizar. El filtro se escribió primero en `todos()` de `local.ts` —el
 * fichero que se anuncia como *«el único sitio por el que este artefacto habla
 * con la DB»*— y **`todos()` no lo usa ninguna familia**: las once leen por
 * aquí, que hace su propio `find`.
 *
 * Lo que lo hace digno de escribirse es que **el Δ0 salió verde igualmente**:
 * con las 63 filas sembradas como `publicado`, un filtro que no corre y un
 * filtro correcto emiten exactamente las mismas 31 rutas. Es la regla del cero
 * en su forma más cara —*no filtrar nada y filtrar bien dan la misma salida*—
 * y la habría cobrado el primer borrador de verdad, sirviéndolo.
 *
 * ⚠ Y por eso el filtro se deriva de la config (¿tiene la colección el campo?)
 * en vez de listar colecciones: la lista habría hecho falta en los dos sitios.
 */
function filtraPublicados(cfg: Coleccion, conBorradores: boolean) {
  /* ⚠ Punto de sabotaje de `qa:programada-neg`, declarado y ruidoso: sin él,
   * «el borrador no sale en el build» sería una frase sin instrumento. Sólo se
   * activa con la variable puesta, y el negativo reconstruye sin ella. */
  if (process.env.PROGRAMADA_SABOTAJE === "sin-filtro") {
    console.error("⚠⚠ PROGRAMADA_SABOTAJE=sin-filtro: el build va a emitir BORRADORES");
    return {};
  }
  const tieneEstado = cfg.fields.some((f) => "name" in f && f.name === "estado");
  return tieneEstado && !conBorradores ? { where: { estado: { equals: "publicado" } } } : {};
}

export async function leeColeccion<T>(
  slug: CollectionSlug,
  { conBorradores = false }: { conBorradores?: boolean } = {},
): Promise<T[]> {
  const payload = await cms();
  const { cfg, ctx } = await contexto(slug);
  const { docs } = await payload.find({
    collection: slug,
    pagination: false,
    depth: 1,
    sort: "id",
    ...filtraPublicados(cfg, conBorradores),
  });
  const devuelve = devuelveDe(slug);
  return docs.map((d) => devuelve(aMedido(cfg.fields, d, ctx, slug))) as T[];
}
