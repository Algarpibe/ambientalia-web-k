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
import type { Block, CollectionConfig, Field, TextField, TextFieldSingleValidation } from "payload";
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

/* ══════════════════════════════════════════════════════════════════════════
 * EL DOCUMENTO DEL CPT **SIN PÁGINA PROPIA** — CMS-PR3, 2026-08-13
 *
 * `qa:productos-hueco` midió que los 57 casos referencian **19** slugs de
 * producto y que **tres no son ninguna de las 24 URLs del CPT**: son documentos
 * del CPT **en inglés** que el editor eligió en la relación `soluciones` de un
 * caso español. Su evidencia es la SERVIDA, no una hipótesis:
 *
 * | `data-id` | rótulo | `href` del botón «Ver más» |
 * |---|---|---|
 * | `accesories` | Accesorios | `…/es/accesorios/` |
 * | `air-cloud` | AIR Cloud · *Air quality software* | `…/es/software-de-medicion-calidad-del-aire/` |
 * | `ozone-2` | Ozone | `…/?post_type=solutions&p=56674` — **sin permalink** |
 *
 * ── Por qué NO son alias del documento español, y es una medida ───────────
 * `air-cloud` sirve una ficha **distinta** de la de `software-…`: en inglés,
 * con sus propias viñetas (*«Multipurpose air quality software for
 * professionals»*, `Benefits`, y la errata **`condifential`** que viaja tal cual
 * por la regla 1). Aliasarlos pintaría la ficha española donde el original pinta
 * la inglesa — se pierde fidelidad en el panel visible, no sólo en el `href`.
 * O sea: **son documentos**, y el discriminador es si tienen página.
 *
 * ── Las dos consecuencias, y ninguna es cosmética ────────────────────────
 * **(1) `href` deja de ser derivable.** §4 lo compone como `padre` + `slug`, y
 * para estos tres eso fabricaría `/es/air-cloud/`, una URL que el original
 * **no sirve**. El valor medido se guarda en `hrefServido`.
 *
 * **(2) `seo.title` deja de ser exigible.** Su `required` está respaldado por
 * `qa:solutions-seo` — `title` **24/24** — y ese 24 son **URLs**, no documentos:
 * los tres de aquí no estaban en el dominio donde la regla se derivó. Así que la
 * regla **se ESTRECHA a su dominio en vez de sustituirse por la contraria**
 * (`CLAUDE.md` §F2-5-ESCALON-ETIQUETAS, la 3.ª cara de la familia de
 * calibración).
 *
 * ── El discriminador es un CAMPO, no una ausencia ────────────────────────
 * ⚠ **`pagina` es `required` y sin defecto**, y eso es la §regla 6 puesta donde
 * muerde: calcularlo por la ausencia de `hrefServido` —o de `seo.title`— borraría
 * la diferencia entre *«este documento no tiene página»* y *«nadie rellenó el
 * campo»*, que es exactamente cómo una ausencia se convierte en un valor
 * benigno. La ida lo deriva **del dato medido** (el último segmento del `href`
 * servido, ¿es el `slug`?) y lo **escribe**; nadie aguas abajo lo infiere.
 *
 * ⚠ **FICHA ABIERTA, no bloqueante: el CPT `solutions` MEZCLA IDIOMAS.**
 * 3 de 24 documentos referenciados son ingleses y **uno trae ficha completa**.
 * El modelo **no tiene dimensión de idioma** y esta decisión no se la inventa:
 * los trata como documentos sin página, que es lo que la salida servida dice que
 * son. Si F3-4 se encuentra lo mismo en otra familia, la decisión está planteada
 * con su número en vez de improvisada (`PENDIENTES-QA.md` §CPT-IDIOMAS).
 * ═════════════════════════════════════════════════════════════════════════ */

/** Los dos estados, explícitos. Sin defecto: la ausencia TIRA. */
export const PAGINA_PRODUCTO = ["propia", "ninguna"] as const;

const pagina: Field = {
  name: "pagina",
  type: "select",
  required: true,
  options: [
    { label: "Tiene página propia en /es/", value: "propia" },
    { label: "Sin página propia (documento del CPT sin permalink de /es/)", value: "ninguna" },
  ],
  admin: {
    description:
      "CMS-PR3 · el discriminador de «documento sin página propia». SIN DEFECTO a propósito: " +
      "derivarlo de una ausencia confundiría «no tiene página» con «nadie lo rellenó» (§regla 6). " +
      "Medido: 21 `propia` · 3 `ninguna` (accesories · air-cloud · ozone-2).",
  },
};

/** `es` = tiene valor no vacío. `""` cuenta como ausente en los dos campos:
 *  ninguno de los dos tiene vacío legal medido, así que no se le inventa uno. */
const puesto = (v: unknown) => v !== undefined && v !== null && v !== "";

/**
 * El condicional, en las DOS direcciones. Un condicional con un solo lado no
 * está probado: dejaría pasar el documento con página y sin `seo.title`
 * (defecto viejo) **o** el documento sin página que trae uno inventado.
 */
type ValidaTexto = TextFieldSingleValidation;

const soloSi = (
  quiere: (typeof PAGINA_PRODUCTO)[number],
  campo: string,
  porQue: string,
): ValidaTexto =>
  ((valor: unknown, { data }: { data?: unknown }) => {
    const p = (data as { pagina?: string } | undefined)?.pagina;
    /* `pagina` ausente NO se suple: su propio `required` lo caza, y contestar
     * aquí «true» sería traducir la ausencia a permiso. */
    if (p !== "propia" && p !== "ninguna") return true;
    if (p === quiere && !puesto(valor))
      return `\`${campo}\` es obligatorio cuando \`pagina\` es «${quiere}» — ${porQue}`;
    if (p !== quiere && puesto(valor))
      return (
        `\`${campo}\` NO puede tener valor cuando \`pagina\` es «${p}» — ${porQue}. ` +
        `Que sobre un dato no es más benigno que que falte: los dos dicen que el documento no es lo que declara.`
      );
    return true;
  }) as ValidaTexto;

/**
 * El `href` que el original SIRVE, para los documentos que no tienen página
 * propia y por tanto no lo tienen derivable.
 *
 * ⚠ **Es el valor MEDIDO, no una ruta local.** Al pintarlo se le aplica la regla
 * de rutas locales ya escrita —construido → local, no construido → original—,
 * así que `…/es/accesorios/` y `…/es/software-…/` **localizan** (el clon las
 * emite) y `?post_type=solutions&p=56674` **se queda en el original**, porque no
 * es una ruta que el build emita. No es decisión nueva: es §Regla de rutas
 * locales aplicada a un `href` que ahora viene del dato en vez de del `padre`.
 */
const hrefServido: Field = {
  name: "hrefServido",
  type: "text",
  validate: soloSi(
    "ninguna",
    "hrefServido",
    "sin página propia el `href` no se puede componer con `padre` + `slug` (fabricaría una URL que el original no sirve); con página propia SÍ se compone y guardarlo sería una segunda fuente de verdad",
  ),
  admin: {
    description:
      "El `href` tal y como lo sirve el original. Sólo para `pagina: ninguna`. " +
      "La regla de rutas locales se le aplica al pintarlo, igual que a cualquier otro.",
  },
};

/**
 * `seo` de `productos`: igual que el compartido salvo que `title` **es
 * obligatorio sólo donde se midió** — en documentos con página propia.
 */
const seoProducto = (): Field => {
  const base = seo() as Extract<Field, { type: "group" }>;
  /* `title` se REEMPLAZA, no se mapea: un `.map()` sobre `fields` ensancha la
   * unión discriminada de Payload y el resultado deja de ser `Field`. */
  const title: TextField = {
    name: "title",
    type: "text",
    /* Fuera el `required` de Payload: no sabe de condiciones, y dejarlo puesto
     * haría irrepresentables los 3 documentos sin página. */
    required: false,
    validate: soloSi(
      "propia",
      "seo.title",
      "`qa:solutions-seo` lo midió 24/24 sobre las URLs del CPT, y un documento sin página no está en ese dominio (§ESCALON-ETIQUETAS: la regla se estrecha, no se invierte)",
    ),
  };
  return { ...base, fields: [title, ...base.fields.filter((f) => !("name" in f) || f.name !== "title")] };
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
   *
   * ⚠ **Y desde CMS-PR3 hace falta la segunda mitad del predicado.** Los tres
   * documentos **sin página propia** tampoco tienen `padre`, así que por el
   * predicado viejo entrarían al plano y reservarían `/accesories`, `/ozone-2` y
   * `/air-cloud` — tres slugs que **no son URLs de nadie**. Es el mismo
   * argumento de arriba (*no inventar colisiones que en la URL real no
   * existen*), aplicado al eje que la clase nueva estrena.
   */
  hooks: registroDeSlug({
    familia: "productos",
    enElPlano: (doc) => !doc.padre && doc.pagina === "propia",
  }),
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
    /* CMS-PR3 — el discriminador va ANTES de los dos campos que condiciona:
     * se lee en el admin en el orden en que manda. */
    pagina,
    hrefServido,
    seoProducto(),

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
    subida("image", { centinelaVacio: true }),

    /**
     * El cuerpo es `blocks` porque la **composición es por instancia**:
     * 4 · 5 · 6 (×21) · 7 secciones propias sobre **un solo cascarón**
     * (`solutions-template-default et-tb-has-template` en 24 de 24).
     */
    /* `vaciaEsAusente`: `Product` **no tiene `cuerpo`** en el tipo medido — el
     * cuerpo del CPT `solutions` está en el esquema y todavía no transcrito, así
     * que la ida lo ve ausente en las 9 filas. Mientras siga así la vuelta tiene
     * que devolver ausente, o el round-trip fallaría por FORMA en los 9. */
    { name: "cuerpo", type: "blocks", blocks: BLOQUES_PRODUCTO, custom: { vaciaEsAusente: true } },
  ],
};
