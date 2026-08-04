/**
 * PRODUCTOS — §2e, cerrada el 2026-08-03 sobre las **24** URLs del
 * `solutions-sitemap.xml` (derivadas, no citadas del censo).
 *
 * > **El CPT `solutions` es UNA colección con discriminante.** Campos de
 * > frontera medidos: **1**, y opcional. Ni U1 (obligatoriedad) ni U2 (≥3 o
 * > >25 %) disparan.
 *
 * Es el destino de las **dos** relaciones que el esquema tenía apuntando a una
 * incógnita: `soluciones` de SECTOR (§1.4) y de los casos (§2b). Al ser una
 * sola colección **no hacen falta relaciones polimórficas** — el mecanismo que
 * §1.5b reserva para `sectores`/`monograficos`.
 */
import type { Block, CollectionConfig, Field } from "payload";
import { campoHtml, conDefecto, htmlLinea, seo, subida } from "../campos/comunes.ts";
import {
  CAMPOS_CTA_DESCARGA,
  MODULOS_COMPARTIDOS,
} from "../bloques/contenido.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

/* ── Los kinds que el CPT estrena sobre los compartidos ──────────────────── */

const TOGGLE: Block = {
  slug: "toggle",
  labels: { singular: "Desplegable", plural: "Desplegables" },
  fields: [
    { name: "titulo", type: "text", required: true },
    // Contenedor de contenido del CPT ⇒ HTML crudo, igual que los cuerpos.
    campoHtml("contenido"),
    { name: "abiertoPorDefecto", type: "checkbox" },
  ],
};

/**
 * ⚠ **`texto` pasa de `inline()` a `htmlLinea` y NO es un cambio cosmético.**
 * `inline()` es `editorNegrita` —Párrafo + Negrita y nada más— y estos kinds no
 * son `MonoInline`: son módulos del **corpus** del CPT `solutions`. Su
 * inventario **no está censado** (§2e los deja como composición del cuerpo, y
 * `cms-campos` los declara fuera de alcance), así que por la regla de la casa
 * *lo SIN PROBAR no se cablea*: entre un campo que **no puede perder** contenido
 * (HTML) y uno que sí (negrita sola), el que no está probado va al primero.
 * La primera instancia censada que solo lleve negrita puede devolverlo.
 */
const BLURB: Block = {
  slug: "blurb",
  labels: { singular: "Blurb", plural: "Blurbs" },
  fields: [
    { name: "titulo", type: "text" },
    htmlLinea("texto"),
    subida("icono"),
  ],
};

const SLIDER: Block = {
  slug: "slider",
  labels: { singular: "Slider", plural: "Sliders" },
  fields: [
    {
      name: "diapositivas",
      type: "array",
      fields: [
        { name: "heading", type: "text" },
        // Mismo caso que `BLURB.texto` — ver la nota de arriba.
        htmlLinea("texto"),
        subida("image"),
        {
          name: "cta",
          type: "group",
          fields: [
            { name: "label", type: "text" },
            { name: "href", type: "text" },
            { name: "external", type: "checkbox" },
          ],
        },
      ],
    },
  ],
};

const GALERIA: Block = {
  slug: "gallery",
  labels: { singular: "Galería", plural: "Galerías" },
  fields: [
    {
      name: "imagenes",
      type: "array",
      fields: [
        { name: "src", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text" },
      ],
    },
  ],
};

const VIDEO: Block = {
  slug: "video",
  labels: { singular: "Vídeo", plural: "Vídeos" },
  fields: [
    { name: "archivo", type: "upload", relationTo: "media" },
    { name: "url", type: "text" },
    { name: "poster", type: "upload", relationTo: "media" },
  ],
};

const CTA: Block = {
  slug: "cta",
  labels: { singular: "CTA", plural: "CTA" },
  fields: [...CAMPOS_CTA_DESCARGA],
};

const TABLA: Block = {
  slug: "table",
  labels: { singular: "Tabla", plural: "Tablas" },
  fields: [
    { name: "cabeceras", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
    {
      name: "filas",
      type: "array",
      fields: [
        {
          name: "celdas",
          type: "array",
          fields: [
            { name: "texto", type: "text" },
            { name: "fuerte", type: "text" },
            { name: "resto", type: "text" },
          ],
        },
      ],
    },
  ],
};

/**
 * La unión de kinds del CPT. **Cada instancia usa su subconjunto**: que 18 de
 * 24 no usen `blurb` es contenido, no esquema — el eje real medido es el
 * **volumen** (18 páginas de 46–50 módulos sin `blurb` y 5 de 56–106 con él,
 * mismo nº de secciones y misma plantilla), no la forma.
 */
export const BLOQUES_PRODUCTO: Block[] = [
  ...MODULOS_COMPARTIDOS,
  TOGGLE,
  BLURB,
  SLIDER,
  GALERIA,
  VIDEO,
  CTA,
  TABLA,
];

/**
 * **`padre` — decidido en ESTA tanda, que es donde §2e lo dejó**: *«Relación vs
 * `select` lo decide F2-1 con el enrutado del §4 delante (PR-SP2)»*.
 *
 * ⚠ **La binaria que §2e escribió no contiene la respuesta, y hay que decirlo:**
 * los dos padres medidos **no son del mismo tipo**. `sensor-de-calidad-del-aire`
 * **sí** es uno de los 24 productos; **`cartuchos-inteligentes` NO aparece como
 * URL propia en el sitemap del CPT** — o sea que 17 de los 18 hijos apuntarían a
 * un documento que no existe. Una relación pura no vale.
 *
 * **Elegido `select`**, y por el precedente de la casa, no por comodidad: un
 * **segmento de ruta** ya se modela así dos veces —`prefijo` del caso (§2b,
 * CMS-1) y del documento científico (§2.4, con TRES valores)—, siempre como
 * campo con defecto explícito. `padre` es estructuralmente lo mismo: el
 * segmento anterior al slug.
 *
 * **Lo descartado, con su porqué:** una relación polimórfica exigiría inventar
 * una colección `categorias-productos` con **un solo término** que ningún censo
 * respalda — que es exactamente el arreglo falso de §1.5b Razón 1. Y la
 * asimetría de deshacer va a favor: `select` → relación es añadir la colección y
 * mapear 2 valores; relación → `select` sería borrar una colección con
 * contenido escrito.
 *
 * **Sin defecto**: 6 de 24 no lo traen y **la ausencia ES el valor por defecto**.
 *
 * **PR-SP2 sigue abierta, con forma más afilada**: si aparece un segundo padre
 * que sea categoría, o si `cartuchos-inteligentes` estrena página propia, esto
 * pasa a relación (polimórfica) y la migración es de 2 valores.
 */
const padre: Field = {
  name: "padre",
  type: "select",
  options: ["cartuchos-inteligentes", "sensor-de-calidad-del-aire"],
  admin: {
    description:
      "Segmento anterior al slug. Ausente = producto de primer nivel (6 de 24). " +
      "PR-SP2: `cartuchos-inteligentes` es categoría (17) y `sensor-de-calidad-del-aire` " +
      "es OTRO producto (1) — por eso hoy es select y no relación.",
  },
};

export const productos: CollectionConfig = {
  slug: "productos",
  admin: { useAsTitle: "titulo", group: "Catálogo" },
  /**
   * §4 · plano de `/es/`, **pero sólo los que no cuelgan de un segmento**: §2e
   * midió **6 de 24 sin `padre`**, y ésos son los que comparten espacio de
   * nombres con blog y término. `/accesorios` es uno de ellos, y es literalmente
   * el slug con el que `ENRUTADO.md` §2 provocó la colisión que no dio error.
   *
   * Los otros 18 (`cartuchos-inteligentes/<slug>`, `sensor-…/<slug>`) tienen
   * unicidad nativa de colección y **no se registran**: hacerlo inventaría
   * colisiones que en la URL real no existen.
   */
  hooks: registroDeSlug({ familia: "productos", enElPlano: (doc) => !doc.padre }),
  fields: [
    // ⚠ ALIAS de `Product.id` («data-id del `<span>` del tab»): `id` lo reserva
    // Payload para la PK. §2e escribe `slug`, y es el mismo dato.
    { name: "slug", type: "text", required: true, unique: true, index: true },
    // ⚠ ALIAS de `Product.name`. §2e escribe `titulo`.
    { name: "titulo", type: "text", required: true },
    /**
     * **El discriminante.** `ficha` en 23 de 24; `catalogo` solo lo usa
     * `accesorios` — n = **1**, y con n=1 **no se separa «catálogo es otra
     * forma» de «un autor que maquetó con tablas»** (PR-SP1). Una segunda
     * página de catálogo reabre la pregunta.
     */
    conDefecto(
      { name: "tipo", type: "select", options: ["ficha", "catalogo"] } as Field,
      "ficha",
      "§2e · 23 de 24 · productos/DECISION.md",
    ),
    padre,
    seo(),

    /* ── La ficha, que es PROYECCIÓN del producto y por tanto vive aquí ─────
     * Probado en C-2 sobre 640 nodos de panel: **18 fichas, 17 títulos**, y los
     * 2 `data-id` que salen en más de un caso dan la ficha idéntica. El caso
     * guarda **qué** productos; los textos son del producto.                */
    { name: "tagline", type: "text" },
    { name: "description", type: "textarea" },
    { name: "highlight", type: "text" },
    /**
     * **Dos valores en el corpus** —«Ventajas» (equipos) y «Especificaciones»
     * (cartuchos)—, así que es campo. Estaba cableado en `ProductPanel` hasta
     * que el grupo C pobló la segunda instancia: el valor de la primera **no se
     * cablea**, que es como se produce el arreglo falso (§2b.1 · 4).
     */
    conDefecto(
      { name: "bulletsTitulo", type: "text" } as Field,
      "Ventajas",
      "§2b.1 (4) · C-SP14",
    ),
    /**
     * **Admiten marcado en LÍNEA**: los cartuchos traen `R<sup>2</sup> >0,8` y
     * `1 μg/m<sup>3</sup>`, que son fórmulas, no adorno.
     *
     * ⚠ **DEFECTO DEL BLOQUE 2, cazado por la evaluación campo a campo del
     * §3.1d — y no daba error.** Esto era `inline("texto", true)`, o sea
     * `editorNegrita`, que es **Párrafo + Negrita y nada más**: un editor que
     * **no puede expresar `<sup>`**. El comentario de al lado declaraba las
     * fórmulas y el campo no las admitía — *documentado no es conectado*
     * (`CLAUDE.md` §sondas regla 3) en su forma de esquema, y de las caras:
     * `payload-types.ts` compilaba igual y `qa:cms-campos` también pasaba,
     * porque **ninguno de los dos mira el TIPO de la hoja, solo su ruta**.
     *
     * El tipo medido lo decía desde el principio: `Product.bullets: string[]`,
     * *«se pintan como HTML»*. Es `CampoRicoEnLinea` sin llamarse así.
     */
    { name: "bullets", type: "array", fields: [htmlLinea("texto", { requerido: true })] },
    subida("image"),

    /**
     * El cuerpo es `blocks` porque la **composición es por instancia**:
     * 4 · 5 · 6 (×21) · 7 secciones propias sobre **un solo cascarón**
     * (`solutions-template-default et-tb-has-template` en 24 de 24).
     */
    { name: "cuerpo", type: "blocks", blocks: BLOQUES_PRODUCTO },
  ],
};
