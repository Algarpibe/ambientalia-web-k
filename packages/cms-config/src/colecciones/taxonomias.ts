/**
 * TAXONOMÍAS — §2c, decidido en LH-2.
 *
 * > **Un listado no es un content type: es una consulta.** El contenido son los
 * > términos.
 *
 * Por eso aquí no hay colección «blog» ni «recursos»: los 23 LISTADO-B, los 2
 * LISTADO-TEMA-CPT y los 3 LISTADO-TEMA-TAX son proyecciones sobre estas cuatro
 * y sobre las colecciones de contenido.
 */
import type { CollectionConfig } from "payload";

/** `post_tag` — 12 términos. */
export const etiquetas: CollectionConfig = {
  slug: "etiquetas",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "nombre", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
  ],
};

/** `resources`, **jerárquica** — 10 términos (2 padres + 8 hijas). */
export const categoriasRecursos: CollectionConfig = {
  slug: "categorias-recursos",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "nombre", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "padre", type: "relationship", relationTo: "categorias-recursos" },
  ],
};

/** `scientific-category` — 3 términos confirmados. */
export const categoriasCientificas: CollectionConfig = {
  slug: "categorias-cientificas",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "nombre", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
  ],
};

/**
 * `category`.
 *
 * ⚠ **SIN CENSAR — LH-SP8**: está viva y **fuera del sitemap**, así que el
 * número de términos y sus campos no se han medido. §2c dice literalmente *«se
 * censa antes de modelar»*.
 *
 * Se declara igualmente porque `entradas-blog.categorias` es **1..n obligatorio**
 * y una relación necesita destino: sin ella la colección de blog no compila. Lo
 * que se declara es **el mínimo que `TerminoA` mide** (`slug` + `nombre`) y nada
 * más — **no se inventan campos para una taxonomía sin censar**, que es
 * exactamente cómo se fabrica un esquema con aspecto de medido.
 */
export const categorias: CollectionConfig = {
  slug: "categorias",
  admin: {
    useAsTitle: "nombre",
    group: "Taxonomías",
    description: "SIN CENSAR (LH-SP8) — solo el mínimo de `TerminoA`. Censar antes de F2-2.",
  },
  fields: [
    { name: "nombre", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
  ],
};
