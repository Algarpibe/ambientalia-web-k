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
import { campoHtml } from "../campos/comunes.ts";

/** `post_tag` — 12 términos. */
export const etiquetas: CollectionConfig = {
  slug: "etiquetas",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "nombre", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /**
     * ⚠ **CAMPO NUEVO (2026-08-13) — la descripción del término, que el ARCHIVO
     * pinta y la ficha del término no tiene.**
     *
     * Vive en el módulo `et_pb_text_4_tb_body` de `/es/etiqueta/<slug>/`, justo
     * debajo del `h1` y **a 941.17 de ancho contra los 1238.39 de la fila** (o
     * sea con ancho de módulo propio). Es campo por el test más simple que hay:
     * **varía entre instancias** — las 2 medidas traen textos distintos, y el
     * extractor lo confirma en **12 de 12**.
     *
     * ── Por qué es RICO y no `textarea` ───────────────────────────────────
     * Porque se midió, no porque convenga: `cms:extractor-listados` censa el
     * marcado que traen las 12 descripciones y salen **`p`, `br` y `a`**.
     * Guardarlo como texto plano tiraría los enlaces y los saltos — el mismo
     * error que §El principio describe cuando se mide sobre la TRANSCRIPCIÓN en
     * vez de sobre lo servido.
     *
     * ⚠ **No es `required`, y eso también es una medida, no una precaución:**
     * las 12 la traen, pero el archivo de un término **sin** descripción es un
     * camino de render que el dato de calibración no ejercita
     * (§F2-5-ESCALON-ETIQUETAS). Declararlo obligatorio hoy convertiría el alta
     * de un término nuevo en un error del admin por una regla que **ninguna
     * instancia ha probado que exista**.
     */
    campoHtml("descripcion"),
  ],
};

/**
 * `resources`, **jerárquica** — 10 términos: 2 de primer nivel (`articulos` ·
 * `seminarios-web`) y 8 hijas de `articulos`.
 *
 * ── El contrato de `padre`, decidido en `D2.8` (2026-08-14) ───────────────
 * Evidencia: `qa:lh-jerarquia` (negativo 4/4), `medidas/lh-jerarquia.json` —
 * censo de 5 taxonomías y 38 términos sobre el corpus congelado.
 *
 *   · **`padre` se puebla**: 8 de 10 con `articulos`; `null` en los 2 de primer
 *     nivel, y ese `null` es un valor **medido**, no un hueco de siembra;
 *   · **la RUTA es plantilla, no campo**: `ruta(t) = /recursos/ + [padre.slug] +
 *     t.slug` acierta **35/35**. Añadir un `prefijo` por término sería una
 *     segunda fuente de verdad — el precedente contrario está escrito en
 *     `productos.pagina`;
 *   · **un padre como mucho** (sin `hasMany`): el original produce **0**
 *     términos con dos padres en 35;
 *   · **profundidad 2 medida**; la relación a sí misma admite más y eso queda
 *     **DECLARADO SIN EJERCITAR** (§F2-5-ESCALON-ETIQUETAS). No se prohíbe:
 *     prohibirlo sería inventar una regla que ninguna instancia ha probado.
 *
 * ⚠ **Y `padre` NO está sobre-generalizado**, que es la mitad que casi nadie
 * comprueba: se declara en **1 de 4** colecciones de taxonomía y es exactamente
 * la única que el original hace jerárquica (`etiquetas` 12, `categoriasCientificas`
 * 3 y `categorias` 4 son planas, medidas).
 *
 * ⚠ **Lo que esto NO arregla, y hay que arreglar aparte**: `extractor-a.mjs`
 * busca el término por el prefijo literal `recursos/articulos`, así que las 2
 * entradas cuyo `recurso` es de primer nivel pierden el campo
 * (§F3-LH-EXTRACTOR-PREFIJO-CABLEADO). Es un defecto de DATO, no de esquema, y
 * arreglarlo mueve el contenido de 9 rutas ya emitidas.
 */
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
