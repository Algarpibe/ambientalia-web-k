/**
 * GRUPO A — §2, §2.2, §2.4 y §2c. 209 páginas: blog 149 · término 37 ·
 * documento científico 23.
 *
 * ── Por qué son TRES colecciones y no una con discriminante ────────────────
 * §2.1: son **tres plantillas distintas**, no una. Difieren en estructura
 * (`row#2` ausente en término), en ritmo (`post_content mb` **72 en blog vs 0**
 * en las otras dos), en tipografía y en campos. Mismo criterio que cerró §1.5b.
 *
 * ── Y por qué NO hay ni un campo de presentación ───────────────────────────
 * **Cero varianza en 24 instancias** (ritmo, tipografía, retícula). Es el
 * RÉGIMEN: A es **plantillado**, así que la persona que decide el ritmo **no
 * existe** — una plantilla renderiza 149 entradas. Aplicar aquí el test de los
 * px absolutos daría la respuesta **invertida** (`CLAUDE.md` §régimen).
 */
import type { CollectionConfig, Field } from "payload";
import { campoHtml, conDefecto, imagenA, seoA } from "../campos/comunes.ts";
import { MODULOS_COMPARTIDOS } from "../bloques/contenido.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

/**
 * El «contrato de nacimiento» de LH-2 D3 — lo caro de re-migrar si falta.
 * **Sin `autor`**: no lo exige ningún listado (0/9 formas, 0 URLs de author en
 * `/es`) y el rótulo salió **idéntico en las 11 instancias medidas**, o sea
 * plantilla (§2.4 · 4).
 */
export const entradasBlog: CollectionConfig = {
  slug: "entradas-blog",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  // §4 · plano de `/es/` — las 149 entradas cuelgan de `/[slug]` de raíz.
  hooks: registroDeSlug({ familia: "entradas-blog" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    { name: "titulo", type: "text", required: true },
    // Verbatim, como lo escribe el original: «7 enero 2025».
    { name: "fechaPublicacion", type: "text", required: true },
    // «15 junio 2026» — presente en las 7 medidas, con el MISMO valor.
    { name: "fechaActualizacion", type: "text" },
    imagenA("imagenDestacada"),
    /**
     * Contrato D3: **derivación por defecto** (~267c del arranque + «…»).
     * LH-SP10 decide si alguno es manual. No está en `EntradaBlog` de
     * `types/kunak.ts` porque el clon no pinta listados todavía — el hueco va en
     * esa dirección, y por eso es un campo de más y no uno de menos.
     */
    { name: "extracto", type: "textarea" },
    // `category` — 1..n. El rótulo singular/plural se deriva del número.
    { name: "categorias", type: "relationship", relationTo: "categorias", hasMany: true, required: true },
    { name: "etiquetas", type: "relationship", relationTo: "etiquetas", hasMany: true },
    /**
     * `resources` — la categoría del hub de Recursos. **Decide la miga**: con
     * ella `Inicio › Recursos › Artículos y Guías › <hija> › título`; sin ella
     * `Inicio › Blog › título`. Medido en 7 instancias, 6 con y 1 sin.
     */
    { name: "recurso", type: "relationship", relationTo: "categorias-recursos" },
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
    /**
     * «También te puede interesar». **83 de 149 lo llevan y no se sabe qué lo
     * decide** (A-SP1/A-SP2, sin causa identificada). Hasta que se sepa es un
     * campo: es lo único que varía entre instancias de la misma forma.
     */
    { name: "relacionados", type: "checkbox" },
  ],
};

export const terminosKunakpedia: CollectionConfig = {
  slug: "terminos-kunakpedia",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  // §4 · plano de `/es/` — los 37 términos comparten espacio con las 149 de blog.
  hooks: registroDeSlug({ familia: "terminos-kunakpedia" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    { name: "titulo", type: "text", required: true },
    /**
     * **`tituloMiga` — el rótulo NO es el titular** (§2c.1, medido al cerrar
     * A-QA1). De las 14 instancias transcritas, **3 de 3 términos difieren** y
     * **11 de 11** blog/doc coinciden: el `h1` es el titular largo y el rótulo
     * el nombre corto del término.
     *
     * Y la parte que enseña: el término daba **−0.02** en el residuo del `h1`,
     * o sea «limpio». No lo estaba — a 390 el rótulo corto y el largo caen en 2
     * renglones igualmente, así que 218.47 px de diferencia de ANCHO **no
     * producían ni un píxel de alto**. Medida tapada, no acierto.
     *
     * El defecto es «el título»; `null` significa *usa el título*, y por eso el
     * defecto se escribe como ausencia y no como una copia del `h1`.
     */
    conDefecto({ name: "tituloMiga", type: "text" } as Field, null, "§2c.1 · 3 términos de 37"),
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
  ],
};

export const documentosCientificos: CollectionConfig = {
  slug: "documentos-cientificos",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /**
     * ⚠ **No es UN prefijo: son TRES** (§2.4 · 1), y el recon decía uno. Medido
     * en las 23: `documentos-cientificos/<categoría>` en 22 y
     * `estudios-cientificos/articulos-tecnicos` en **1**. Mismo mecanismo que
     * CMS-1: campo con defecto, omitido cuando coincide.
     */
    conDefecto(
      {
        name: "prefijo",
        type: "select",
        options: ["documentos-cientificos", "estudios-cientificos"],
      } as Field,
      "documentos-cientificos",
      "§2.4 · 1 de 23",
    ),
    // El segmento que va ANTES del slug. 3 términos confirmados.
    {
      name: "categoria",
      type: "relationship",
      relationTo: "categorias-cientificas",
      required: true,
    },
    seoA,
    { name: "titulo", type: "text", required: true },
    // §2.4 · 2: `text#2` trae ADEMÁS de portada y PDF `autores` y `anyo`
    // («Reche et al.» | 2020), que varían en las 4 instancias ⇒ campos.
    { name: "autores", type: "text", required: true },
    { name: "anyo", type: "text", required: true },
    imagenA("portada", { requerida: true }),
    // El PDF o la publicación externa. El rótulo va EN INGLÉS en el original.
    {
      name: "descarga",
      type: "group",
      fields: [
        { name: "href", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    // `CampoRico` = HTML del corpus ⇒ `campoHtml` (CMS-0e · §3.1d).
    campoHtml("cuerpo", { requerido: true }),
  ],
};

/**
 * GRUPO D — §2d.1. **UNA colección nueva**, decidida por predicados
 * pre-registrados: 6 instancias, **1 sección propia las 6** ⇒ varianza cero ⇒
 * plantilla. Los 7 hubs quedan **fuera de colección**, en el casillero L4 de
 * LH-2 (página compuesta por instancia ⇒ cola larga, cero arquetipos).
 *
 * ⚠ **Los 4 kinds ausentes (`blurb`/`gallery`/`video`/`toggle`) NO se añaden
 * aquí**, y es deliberado: §2d.1 los deja «para cuando se construya», y
 * `MonoModulo` queda **intacto** — meterlos en `MonoSeccion[]` sería el arreglo
 * falso de §1.5b Razón 1 (P-K1 salió ❌: no aparecen en SECTOR/MONOGRÁFICO).
 * Hasta entonces el cuerpo usa **solo las definiciones compartidas**.
 *
 * ⚠ Y **no tiene contraparte medida en `src/lib`**: las 6 instancias no están
 * transcritas. La comprobación `qa:cms-campos` lo dice en voz alta en vez de
 * dejarlo pasar — una colección sin lado medido no se puede verificar.
 */
export const articulosKb: CollectionConfig = {
  slug: "articulos-kb",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seoA,
    { name: "titulo", type: "text", required: true },
    /**
     * `blocks` con **solo lo compartido**, que es la mitad útil de HD1 que sí se
     * confirmó: *«`MonoRitmo` y los kinds de texto/imagen/botón sirven — 3 de
     * los 6 artículos se expresarían solo con ellos»* (PD1 y PD2 acertaron).
     * Los otros 3 esperan a su construcción con los kinds que les falten.
     */
    { name: "cuerpo", type: "blocks", blocks: MODULOS_COMPARTIDOS },
  ],
};
