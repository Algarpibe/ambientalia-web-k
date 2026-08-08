/**
 * LA LECTURA POR LOCAL API — el único sitio por el que este artefacto habla con
 * la DB.
 *
 * `PLAN-FASE-2.md` §F2-3 · `ESQUEMA-CMS.md` CMS-0 (Local API) y CMS-0c
 * (Postgres es dependencia de **build**, no de runtime).
 *
 * ── Qué es y qué no es ────────────────────────────────────────────────────
 * La Local API **no es un servidor**: es una biblioteca que habla con Postgres,
 * así que funciona desde cualquier proceso con acceso a la DB — incluido
 * `next build`. No hay HTTP en el camino de los datos, y por tanto no hay un
 * segundo proceso que levantar ni un puerto que acertar.
 *
 * Lo que sale de aquí se consume en **componentes de servidor y en
 * `generateStaticParams()`**, o sea en tiempo de build. Lo servido sigue siendo
 * HTML estático: nada de esto corre cuando un visitante pide una página.
 *
 * ── ⚠ POR QUÉ NO HAY NI UN `try/catch` EN ESTE FICHERO ────────────────────
 * Es la regla 6 de `CLAUDE.md` §sondas, y aquí es la decisión de diseño entera:
 *
 *   > **Todo código que traduce una AUSENCIA a un valor benigno —un `?? []`, un
 *   > `catch {}`, un valor por defecto— borra la diferencia entre «esto no se
 *   > pudo calcular» y «esto salió bien». Y la borra en el sitio donde todavía
 *   > se sabía.**
 *
 * Con la DB caída, un `catch { return [] }` aquí produciría **un build que
 * termina en verde y emite menos rutas**: el sitio se despliega con 404 donde
 * había páginas y ninguna sonda que derive sus rutas del build puede
 * enterarse, porque el build es la fuente de esa lista. Ése es exactamente el
 * modo de fallo que F2-3 estrena, y la forma de no tenerlo es **no
 * escribirlo**: si la consulta no se puede hacer, la excepción sube y
 * `next build` muere en voz alta.
 *
 * La otra mitad —la DB **viva** pero con una colección vacía— no la puede ver
 * este fichero (cero documentos es una respuesta legítima de una consulta
 * correcta). La ve `npm run qa:manifiesto`, que grita cuando una familia
 * declarada emite 0 rutas, y por eso entra en `npm run check`.
 */
import { getPayload, type CollectionSlug, type Payload } from "payload";
import { construyeConfig } from "@kunak/cms-config";

/**
 * Una sola instancia por proceso de build. `getPayload` ya cachea internamente,
 * pero la promesa se guarda aquí para que las ~11 familias no compitan por
 * inicializar el pool a la vez.
 */
let instancia: Promise<Payload> | null = null;

export function cms(): Promise<Payload> {
  instancia ??= getPayload({ config: construyeConfig() });
  return instancia;
}

/**
 * Todos los documentos de una colección, **en el orden en que se insertaron**.
 *
 * ⚠ **`sort: "id"` no es cosmética.** El `id` es un serial de Postgres, así que
 * el orden por `id` es el orden en que el seed los escribió, que es el orden de
 * `src/lib/*.ts` — el mismo que el clon lleva pintando desde el primer día. Sin
 * `sort` explícito el orden lo decide el planificador de Postgres, y un listado
 * reordenado es un Δ ≠ 0 que no tiene nada que ver con el dato.
 *
 * `pagination: false` porque el defecto de Payload es **10 documentos**: con
 * las 149 entradas del grupo A dentro, paginar por descuido daría un build con
 * 10 rutas y sin un solo error.
 *
 * ⚠ `coleccion` es `CollectionSlug`, no `string`, **y eso es una guarda que
 * costó un build**: con `string`, una colección mal escrita se descubre en
 * ejecución —o sea, con la consulta devolviendo nada— y ése es exactamente el
 * cero silencioso del que este fichero protege. Tipada, el error es de
 * compilación.
 */
/**
 * ── EL FILTRO DE PUBLICACIÓN — F2-4 ──────────────────────────────────────
 * Desde F2-4 un documento puede existir en la DB **sin estar en el sitio**
 * (`estado: "borrador"`, para poder programar su salida y previsualizarlo). El
 * build es el único sitio donde se decide qué rutas hay (§4 · CMS-0c), así que
 * es aquí donde el borrador se queda fuera.
 *
 * ⚠ **El filtro se aplica sólo donde el campo EXISTE, y eso se deriva de la
 * config**, no de una lista de colecciones. Las taxonomías y el media no
 * publican —no son páginas—, y un `where` contra un campo que no está no da
 * cero: da error o, peor, un cero que se lee como «no hay nada» (§regla 6).
 */
function publica(payload: Payload, coleccion: CollectionSlug): boolean {
  const c = payload.config.collections.find((x) => x.slug === coleccion);
  return !!c?.fields.some((f) => "name" in f && f.name === "estado");
}

export async function todos<T>(
  coleccion: CollectionSlug,
  { conBorradores = false }: { conBorradores?: boolean } = {},
): Promise<T[]> {
  const payload = await cms();
  const { docs } = await payload.find({
    collection: coleccion,
    pagination: false,
    depth: 0,
    sort: "id",
    ...(publica(payload, coleccion) && !conBorradores
      ? { where: { estado: { equals: "publicado" } } }
      : {}),
  });
  return docs as T[];
}
