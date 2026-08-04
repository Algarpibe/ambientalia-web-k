/**
 * EL HOOK QUE ESCRIBE EL REGISTRO DE SLUGS — §4, mitad de ENTRADA.
 *
 * `PLAN-FASE-2.md` §F2-1, literal: *«los hooks de las colecciones de contenido
 * **pasando `req`** (misma transacción: el alta y su registro de slug entran o
 * fallan juntos)»*. Ese `req` es la pieza entera: sin él, el `create` del
 * registro va por su cuenta y puede quedar un slug reclamado por un documento
 * que nunca llegó a existir — o al revés.
 *
 * ── Quién impone la regla, que no es este fichero ──────────────────────────
 * La impone el `unique: true` de `slugs.slug`, o sea **Postgres**. Este código
 * hace dos cosas y ninguna es «comprobar»:
 *
 *   1. **reclamar y soltar** en los momentos correctos (alta, cambio de slug,
 *      entrada y salida del plano, borrado);
 *   2. **dar un mensaje decente** cuando choque, mirando ANTES quién lo tiene.
 *
 * ⚠ El (2) es diagnóstico y **no es la guarda**. Se hace antes del `create`
 * porque después no se puede: un `INSERT` que viola `UNIQUE` **aborta la
 * transacción**, y cualquier `SELECT` posterior en ella falla también. Así que
 * el orden no es estilo, es lo único que funciona. Y si el `find` no ve nada por
 * una carrera, **el `UNIQUE` sigue estando** — las dos capas, no una.
 */
import type { CollectionBeforeValidateHook, CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";

/** Un documento del que sólo nos importan estas dos cosas. */
type Doc = Record<string, unknown> | null | undefined;

export interface OpcionesRegistro {
  /** El `slug` de la colección que reclama. Es lo que se guarda en `familia`. */
  familia: string;
  /**
   * Si el documento cae en el plano de UN segmento de `/es/`.
   *
   * Existe por **`productos`**: §2e midió que **6 de 24 no llevan `padre`**, y
   * ésos —y sólo ésos— viven en el plano. Los otros 18 cuelgan de un segmento y
   * su unicidad es la nativa de la colección. Sin este predicado habría que
   * elegir entre registrar 24 (y colisionar con blog por slugs que en la URL
   * real no colisionan) o ninguno (y dejar los 6 sin guarda).
   *
   * Por defecto, toda la colección está en el plano.
   */
  enElPlano?: (doc: Record<string, unknown>) => boolean;
}

const texto = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

/**
 * ⚠ **`data` en un `update` es PARCIAL.** Si se guarda un producto sin tocar
 * `padre`, `data.padre` viene `undefined` y `enElPlano(data)` diría «está en el
 * plano» de uno que no lo está. El estado efectivo es el documento anterior
 * pisado por lo que llega — nunca sólo uno de los dos.
 */
const efectivo = (originalDoc: Doc, data: Doc): Record<string, unknown> => ({
  ...(originalDoc ?? {}),
  ...(data ?? {}),
});

export function registroDeSlug({ familia, enElPlano = () => true }: OpcionesRegistro) {
  const enPlano = (d: Doc): string | null => {
    if (!d) return null;
    const doc = d as Record<string, unknown>;
    return enElPlano(doc) ? texto(doc.slug) : null;
  };

  /** Suelta un slug. Por `slug` + `familia`, que se conocen siempre (el id no). */
  const soltar = async (req: { payload: { delete: Function } }, slug: string) => {
    await req.payload.delete({
      collection: "slugs",
      where: { and: [{ slug: { equals: slug } }, { familia: { equals: familia } }] },
      req,
    });
  };

  const reclamar = async (
    req: { payload: { find: Function; create: Function } },
    slug: string,
  ) => {
    /* Diagnóstico ANTES del insert — ver la cabecera. No es la guarda. */
    const yaEsta = await req.payload.find({
      collection: "slugs",
      where: { slug: { equals: slug } },
      limit: 1,
      req,
    });
    const dueno = yaEsta?.docs?.[0];
    if (dueno)
      throw new Error(
        `COLISIÓN DE SLUG ENTRE FAMILIAS: «${slug}» ya está en el plano de /es/, reclamado por ` +
          `«${dueno.familia}»${dueno.documento ? ` (documento ${dueno.documento})` : ""}, y ahora lo pide «${familia}».\n` +
          `  En WordPress cada CPT garantiza unicidad DENTRO de sí y eso no basta: aquí conviven ` +
          `blog, término, page y solutions en un plano de 202 slugs (ESQUEMA-CMS.md §4).\n` +
          `  Si se deja pasar, el build NO avisa: emite la ruta por las dos vías y sirve la página ` +
          `equivocada con HTTP 200 — medido en ENRUTADO.md §2.`,
      );

    await req.payload.create({ collection: "slugs", data: { slug, familia }, req });
  };

  /**
   * El alta y su registro entran o fallan juntos porque **el `req` viaja**: si
   * la validación posterior tumba el documento, la transacción se deshace y el
   * registro se va con ella.
   */
  const beforeValidate: CollectionBeforeValidateHook = async ({ data, req, originalDoc }) => {
    const antes = enPlano(originalDoc);
    const ahora = enPlano(efectivo(originalDoc, data));
    if (antes === ahora) return data; // ni entra, ni sale, ni cambia
    if (antes) await soltar(req as never, antes);
    if (ahora) await reclamar(req as never, ahora);
    return data;
  };

  /** Rellena `documento` cuando el id ya existe. Diagnóstico, nada depende de él. */
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    const slug = enPlano(doc);
    if (!slug) return doc;
    await (req as never as { payload: { update: Function } }).payload.update({
      collection: "slugs",
      where: { and: [{ slug: { equals: slug } }, { familia: { equals: familia } }] },
      data: { documento: String((doc as Record<string, unknown>).id ?? "") },
      req,
    });
    return doc;
  };

  /**
   * Sin esto el slug queda reclamado por un documento que ya no existe, y
   * volver a darlo de alta con el mismo slug fallaría. No lo pide el PLAN —
   * pide `beforeValidate`— pero sin él la guarda **no es usable**: bloquearía
   * altas legítimas, que es la otra forma de que una guarda deje de servir.
   */
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    const slug = enPlano(doc);
    if (slug) await soltar(req as never, slug);
    return doc;
  };

  return { beforeValidate: [beforeValidate], afterChange: [afterChange], afterDelete: [afterDelete] };
}
