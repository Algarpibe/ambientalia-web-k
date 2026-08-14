/**
 * Shared TypeScript interfaces for the Kunak homepage clone.
 * Derived from PAGE_TOPOLOGY.md and BEHAVIORS.md.
 */

export type LocaleCode = "es" | "en" | "fr" | "ar";

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavSubItem[];
}

export interface ClientLogo {
  name: string;
  src: string;
  href?: string;
  width?: number;
  height?: number;
}

export interface FeatureIcon {
  icon: string;
  label: string;
  href?: string;
}

export interface AwardCard {
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  href?: string;
}

export interface SectorSlide {
  slug: string;
  label: string;
  description: string;
  image: string;
  icon: string;
  href: string;
}

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  authorCompany?: string;
  avatar: string;
}

export interface Benefit {
  icon: string;
  label: string;
}

export interface Product {
  /** data-id of the `<span>` tab in the original `#lista-soluciones` module. */
  id: string;
  name: string;
  /**
   * Cabecera SEO de la ficha del CPT `solutions`.
   *
   * ⚠ **Añadido el 2026-08-04, y llegaba tarde por una razón de capa que vale la
   * pena decir.** El esquema del CMS declara `productos.seo.title` `required` y
   * el sondeo de frontera midió que **no tenía dato en 9 de 9**. No era un
   * descuido del catálogo: de los 9 productos, el clon **construyó 3** y para
   * ésos el título vive en el `export const metadata` de su `page.tsx`, o sea
   * **en la capa de ESTRUCTURA** — justo lo que la regla 2 de `CLAUDE.md` separa.
   * Las 6 restantes sólo están referenciadas y no lo tenían en ninguna parte.
   *
   * El respaldo es medido, no supuesto: `npm run qa:solutions-seo` sobre las
   * **24** URLs del `solutions-sitemap.xml` da `title` **24/24** y **no derivable
   * del `h1`** (17 formas distintas de «título menos h1», 7 que ni lo contienen)
   * ⇒ es CAMPO, y el `required` queda respaldado. `description` sale **22/24**,
   * así que es opcional con su medida — `kunak-api` es una de las dos que no la
   * tienen. Congelado en `medidas/solutions-seo.json`.
   */
  seo: SeoA;
  /** Subtitle shown under the tab label ("Monitor de calidad de aire…"). */
  tagline: string;
  description: string;
  /** "BASADA EN SENSORES | LA MAYOR PRECISIÓN" claim line. */
  highlight: string;
  /**
   * Título de la lista de viñetas. **Defecto `"Ventajas"`, omitido en el dato
   * cuando coincide** — la regla de defaults del proyecto.
   *
   * Estaba cableado en `ProductPanel` hasta que el grupo C pobló la segunda
   * instancia: los 4 productos de cartucho que usan los casos titulan la misma
   * lista **«Especificaciones»**. Dos valores en el corpus = campo, y el valor
   * de la primera instancia **no se cablea** (`CLAUDE.md` §Estructura que en
   * realidad es contenido; C-SP14 en `PENDIENTES-QA.md`).
   */
  bulletsTitulo?: string;
  /**
   * Viñetas. **Admiten marcado en LÍNEA** del contrato del §3.1 — los cartuchos
   * traen `R<sup>2</sup> &gt;0,8` y `1 μg/m<sup>3</sup>`, que son fórmulas, no
   * adorno. Se pintan como HTML; las de los 5 productos de la home son texto
   * plano y salen idénticas.
   */
  bullets: string[];
  /** Product photo; empty string for Kunak API y para `amoniaco` (panel sin foto). */
  image: string;
  href: string;
}

/* ────────────────────────── GRUPO C · caso de éxito + FAQ ──────────────────
 * Modelo en `docs/research/grupo-C/MODELO.md`, decidido en C-2 sobre el censo
 * 76/76 y corregido en C-3 por la medición (`MEDICION.md` §5). Traslado a
 * Payload en `docs/ESQUEMA-CMS.md` §2b y §2b.1.
 *
 * La regla que gobierna estos tres tipos: **lo que tiene un solo valor en las
 * 57 es PLANTILLA y no aparece aquí** — sobretítulo «Caso de éxito», los
 * títulos «Necesidad · Solución · Resultados» y su orden, «Detalles del
 * proyecto», «Soluciones», los 6 rótulos de detalles y el singular/plural de
 * `Sector(es):`, que se deriva del número de términos.                       */

/**
 * HTML del contrato del campo rico (`ESQUEMA-CMS.md` §3.1). Es un alias
 * documental, no un tipo nominal: el punto de declararlo es que **el contrato
 * está escrito y medido**, no que TypeScript lo compruebe.
 */
export type CampoRico = string;

/**
 * Campo rico restringido a marcado de LÍNEA (`strong`, `b`, `i`, `br`, `sub`,
 * `sup`, `a`). Sin bloques: no lleva `<p>` propio.
 */
export type CampoRicoEnLinea = string;

/**
 * Término de `taxonomia-sectores` — la taxonomía de 11 términos que el censo
 * midió en los 57 casos. Es propia del modelo, no un espejo de la de
 * WordPress: C-SP3 (si allí es taxonomía real) sigue abierta y **no
 * condiciona**, porque el modelo es robusto a las dos respuestas.
 */
export interface TerminoSector {
  /** El de `/es/sector/<slug>/` — el archivo de taxonomía, del grupo B. */
  slug: string;
  /** «Urbano», «EDAR / PTAR», «Oil & Gas»… */
  nombre: string;
  /**
   * Relación **opcional** a su página de sector o monográfico: hay **11
   * términos y 8 páginas** (Olores, Metalurgia, Sports y Obras no tienen). Es
   * el slug de la ruta `/sectores/[slug]` del clon cuando existe.
   */
  paginaSlug?: string;
}

/** Una imagen de la galería del caso. */
export interface CasoImagen {
  src: string;
  /**
   * C-SP10, medido: el `alt` es **constante dentro de cada caso** (el mismo
   * texto en las 7 imágenes de Des Moines y en las 15 de Río) → es del caso,
   * no de la imagen. Se guarda por imagen igual, porque es donde vive en el
   * medio, pero el import puede derivarlo.
   */
  alt: string;
  width: number;
  height: number;
}

/**
 * CASO DE ÉXITO — colección `casos`. **Una sola colección para los 57**, con el
 * prefijo como campo (D2 · CMS-1): los 4 de `/case-studies/` son contenido
 * propio en español sobre la misma plantilla en los cinco ejes, y la única
 * diferencia es una palabra en la URL. Las migas del original lo confirman:
 * incluso las de los 4 ingleses apuntan al índice **español** (C-SP8).
 */
export interface CasoDeExito {
  /** Único en la colección **a través de ambos prefijos** (D2). */
  slug: string;
  /** Omitido = `"casos-de-exito"`. Solo los 4 ingleses lo escriben. */
  prefijo?: "case-studies";
  seo: {
    title: string;
    /** OPCIONAL — falta en 4 de 57 (corrección §0 de `DECISIONES.md`). */
    description?: string;
    ogImage: string;
  };

  titulo: string;
  /**
   * La foto de la **banda de cabecera** (C-QA1, medida 2026-07-30).
   *
   * El original la pone como `background-image` del `et_pb_section` de
   * `header.et-l--header`, junto al degradado de la plantilla. El **alto** de
   * esa sección es `min-height: 387px` en **4 de 4** instancias → plantilla; la
   * **foto es distinta en las 4** → campo. Es el discriminador de `CLAUDE.md`
   * en régimen plantillado: cero varianza = plantilla, lo que varía = campo.
   *
   * Obligatoria: las 4 medidas la traen. Si apareciera un caso sin ella, la
   * banda quedaría con el degradado sobre transparente —que es lo que hace la
   * FAQ— y habría que medirlo antes de darlo por bueno.
   */
  imagenCabecera: string;
  /** 55 valores distintos en 57 → texto, no relación. */
  cliente: string;
  /**
   * 0..n términos (53/57; 4 casos con dos, 4 sin ninguno). **Un solo dato con
   * DOS proyecciones**: el chip bajo el cliente y la fila «Sector(es)» de
   * detalles. No existen aparte, y faltan las dos juntas cuando el dato no
   * está.
   */
  sectores?: TerminoSector[];

  /** Los tres bloques, obligatorios los tres (57/57). Contrato del §3.1. */
  necesidad: CampoRico;
  solucion: CampoRico;
  resultados: CampoRico;

  /**
   * 49/57. **Rico en línea** (C-SP9 cerrada en C-3: lleva `<strong>` y `<br>`).
   * Se renderiza como **último hijo del contenedor de `necesidad`**, que es
   * donde lo pone el original.
   */
  destacado?: CampoRicoEnLinea;
  /** 48/57; 3–15 imágenes, mediana 7. El carrusel es plantilla. */
  galeria?: CasoImagen[];

  detalles: {
    usuario: string;
    ubicacion: string;
    /** String, no number: el formato no está censado. */
    anyo: string;
    /** 56/57. **RICO** — trae `ul li sub b p` dentro (`MEDICION.md` §5.2). */
    parametros?: CampoRico;
    // `cliente` y `sectores` NO están aquí: se PROYECTAN de los campos de arriba.
  };

  /**
   * 56/57. **UN punto, no un array** — exactamente 1 marcador en las 56.
   * Reapertura escrita: el primer caso con 2 lo convierte en array.
   */
  ubicacionMapa?: { lat: number; lng: number };

  /**
   * 0..n `id` de la colección de productos (53/57; 3–10 por caso). El caso
   * guarda **qué** productos; **la ficha se proyecta del producto** — probado
   * en C-2 (640 nodos, 18 fichas, 17 títulos) y sin contraejemplo en C-3.
   */
  soluciones?: string[];
}

/**
 * FAQ — colección `faqs`. La más simple del proyecto: cuatro campos y ninguno
 * de caso. Su cascarón sí tiene una pieza que el modelo no mencionaba: la
 * **barra lateral estándar** del sitio, que es plantilla y no añade campo
 * (`MEDICION.md` §5.3, C-SP13).
 */
export interface Faq {
  slug: string;
  /** `description` y `ogImage` AUSENTES en las 19: no se inventan. */
  seo: { title: string };
  titulo: string;
  /** 151–539 caracteres. Perfil medido `p ul li a span br sub` — §3.1 entero. */
  cuerpo: CampoRico;
}

/**
 * Item of the `lista-contenido` shortcode in its "accesorios" flavour
 * (`#producto-accesorios-*`): label + photo + one intro line + "Ver más".
 * The richer `Product` above is the "soluciones" flavour of the same
 * shortcode (`#lista-soluciones`, with tagline/highlight/bullets).
 */
export interface AccesorioItem {
  /** data-id of the `<span>` label (also the panel's `item-<id>`). */
  id: string;
  /** Label in the left list; repeated as the panel heading. */
  label: string;
  intro: string;
  image: string;
  href: string;
}

export interface BlogPost {
  title: string;
  date: string;
  image: string;
  href: string;
  excerpt?: string;
}

export interface CaseStudy {
  client: string;
  sector: string;
  sectorHref?: string;
  /** The descriptive case title (`.case-title`). */
  title: string;
  image: string;
  href: string;
}

export interface SustainabilityPillar {
  icon: string;
  htmlContent: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  network: "linkedin" | "x" | "instagram" | "facebook" | "youtube";
  href: string;
}

export interface CTABanner {
  heading: string;
  cta: { label: string; href: string };
  bgImage: string;
  variant?: "light" | "dark";
}

/* ══════════════════════════════════════════════════════════════════════════
 * ARQUETIPO A — detalle plantillado. 209 páginas, TRES plantillas.
 *
 * Recon en `docs/research/arquetipo-A/`, esquema en `ESQUEMA-CMS.md` §2 y §2c,
 * enrutado en §4. Lo que gobierna estos tipos, y que no es evidente:
 *
 * ── El cascarón no tiene NI UN campo por instancia ────────────────────────
 * Cero varianza en 24 instancias (ritmo, tipografía, retícula). Todo lo que
 * aparece aquí es contenido de la entrada; nada es presentación. Es lo
 * contrario de SECTOR, donde media docena de propiedades resultaron ser campos
 * editoriales — y la razón es el RÉGIMEN: A es **plantillado**, así que la
 * persona que decide el ritmo no existe (`CLAUDE.md` §régimen).
 *
 * ── Son TRES tipos y no uno con discriminante ─────────────────────────────
 * Difieren en estructura (`row#2` ausente en término), en ritmo
 * (`post_content mb` 72 en blog · 0 en las otras dos) y en campos: el blog
 * tiene fecha, taxonomías, destacada y bloque de relacionados; el término no
 * tiene ninguno; el documento científico tiene portada, PDF, autores y año.
 * Mismo criterio que cerró §1.5b para sector/monográfico.
 * ═════════════════════════════════════════════════════════════════════════ */

/** Término de taxonomía citado por una entrada. El archivo aún no está clonado. */
export interface TerminoA {
  slug: string;
  nombre: string;
}

/**
 * ETIQUETA (`post_tag`) **con lo que su ARCHIVO pinta** — 12 términos.
 *
 * Es `TerminoA` más `descripcion`, y va aparte en vez de ensanchar `TerminoA`
 * porque la descripción **no es propiedad del término citado desde una tarjeta**:
 * es lo que la plantilla del archivo `/etiqueta/<slug>/` sirve bajo el `h1`
 * (módulo `et_pb_text_4_tb_body`, 941.17 de ancho a 1440). Las entradas de blog
 * siguen citando `TerminoA` y no deben arrastrar un campo que su tarjeta no usa.
 *
 * `descripcion` es **rico** —el censo del marcado de las 12 da `p`, `br` y `a`—
 * y **opcional**: las 12 la traen, pero un término sin descripción es un camino
 * de render que el dato de calibración no ejercita (§F2-5-ESCALON-ETIQUETAS), y
 * declararlo obligatorio sería una regla que ninguna instancia ha probado.
 */
export interface EtiquetaA {
  slug: string;
  nombre: string;
  descripcion?: CampoRico;
}

/**
 * CATEGORÍA DE RECURSOS (`resources`) **con su jerarquía** — 10 términos.
 *
 * Es la única de las 5 taxonomías del sitio que el original hace jerárquica, y
 * `D2.8` decidió MODELARLA: `padre` poblado y la ruta COMPUESTA en la plantilla,
 * cero campos nuevos.
 *
 * ── Por qué la ruta se DERIVA y no se guarda ──────────────────────────────
 * Los dos modelos —derivar `prefijo + [padre] + slug` o cablear el prefijo—
 * aciertan **35/35** sobre los términos medidos, y ese número no decide nada:
 * en las **8 hijas** los dos dan exactamente la misma URL. Lo que los separa son
 * los **2 términos de primer nivel**, donde derivar predice UN segmento y
 * cablear predice dos. **El denominador de la elección es 2** (§DOS MODELOS QUE
 * PREDICEN LO MISMO), y el coste de haber elegido mal ya estaba cobrado en el
 * árbol: `extractor-a.mjs` cableaba el prefijo y perdía el `recurso` de 2 de las
 * 149 entradas **sin dar error**.
 *
 * ── `padre` vuelve como SLUG, no como objeto ──────────────────────────────
 * `deRel` devuelve el documento entero sólo donde el campo declara
 * `custom.formaMedida = "objeto"` (§2c). Éste no lo declara —la tarjeta nunca
 * pinta el padre embebido, sólo lo necesita para componer una ruta— así que
 * llega el slug pelado, que es exactamente lo que hace falta.
 *
 * ⚠ **`descripcion` NO existe aquí, y es una medida, no un olvido.** En
 * `etiquetas` el módulo homólogo del archivo (`et_pb_text_4_tb_body`) trae
 * texto; en `resources` el suyo (`_2_`) trae **los CHIPS de filtro**, y el texto
 * que queda al quitarlos es vacío en **0 de 10** (`cms:extractor-listados`).
 */
export interface CategoriaRecurso {
  slug: string;
  nombre: string;
  /** El slug del término padre. Ausente en los 2 de primer nivel. */
  padre?: string;
}

/**
 * Imagen de WordPress con su `srcset`. **`srcset` es campo, no adorno**: es la
 * causa medida de M-IMG (los tres módulos de imagen con residuo de décimas) y
 * la entrada de los *image sizes* que hay que declarar en Payload (CMS-0b).
 */
export interface ImagenA {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: string;
  height?: string;
  alt?: string;
}

/** SEO del grupo A. `description` falta en los 23 documentos científicos. */
export interface SeoA {
  title: string;
  description?: string;
  ogImage?: string;
}

/**
 * ENTRADA DE BLOG — 149 de las 209, y la forma de la que se escribe el modelo.
 *
 * El «contrato de nacimiento» de LH-2 D3 vive aquí entero: `fechaPublicacion`,
 * `imagenDestacada` opcional con sus sizes, relaciones a las taxonomías, y
 * **sin `autor`** — no lo pide ningún listado (0/9 formas) y el rótulo
 * «Escrito por el Equipo de marketing y comunicación» salió **idéntico en las
 * 11 instancias medidas que lo llevan**, o sea plantilla.
 */
export interface EntradaBlog {
  slug: string;
  seo: SeoA;
  titulo: string;
  /** Verbatim, como lo escribe el original: «7 enero 2025». */
  fechaPublicacion: string;
  /** «15 junio 2026» — presente en las 7 medidas, con el MISMO valor. */
  fechaActualizacion?: string;
  imagenDestacada?: ImagenA;
  /**
   * El extracto de la TARJETA de `/blog`. **Campo, no derivado** — LH-SP10 lo
   * contestó midiendo (`qa:lh-extracto`, negativo 4/4): `/blog` usa el extracto
   * manual donde existe (**15 de 63** medidos, 86–102 c) y el automático si no;
   * `/etiqueta` **ignora el manual** y trunca el cuerpo. O sea que son **dos
   * mecanismos**, y sólo el de `/blog` es dato.
   *
   * ⚠ Estaba declarado en la colección desde F2-1 y **no en este tipo**, con la
   * razón escrita al lado: *«el clon no pinta listados todavía»*. Los pinta desde
   * la 66.ª tanda, así que el hueco se cierra aquí. Sembrado **66 de 68**; los 2
   * que faltan son el hueco de captura de §F3-LH-DOS-CONJUNTOS-DE-149.
   */
  extracto?: string;
  /** `category` — 1..n. El rótulo singular/plural se deriva del número. */
  categorias: TerminoA[];
  /** `post_tag` — 0..n. */
  etiquetas: TerminoA[];
  /**
   * `resources` — la categoría del hub de Recursos. **Decide la miga de pan**:
   * con ella, `Inicio › Recursos › Artículos y Guías › <hija> › título`; sin
   * ella, `Inicio › Blog › título`. Medido en 7 instancias, 6 con y 1 sin.
   */
  recurso?: TerminoA;
  cuerpo: CampoRico;
  /**
   * El bloque «También te puede interesar». **83 de 149 lo llevan y no se sabe
   * qué lo decide** (A-SP1/A-SP2, sin causa identificada). Hasta que se sepa es
   * un campo: es lo único que varía entre instancias de la misma forma.
   */
  relacionados: boolean;
}

/**
 * TÉRMINO DE KUNAKPEDIA — 37 de las 209. La forma más plana.
 *
 * ⚠ **Y tiene un campo que el resto del grupo A no tiene**, destapado al medir
 * A-QA1: el rótulo de la miga de pan **no es el `h1`**. Medido en las 14
 * instancias transcritas, **3 de 3 términos difieren** y **11 de 11** entradas
 * de blog y documentos coinciden:
 *
 *   miga «Emisiones atmosféricas»  ·  h1 «Emisiones atmosféricas y su impacto…»
 *   miga «Cloruro de hidrógeno (HCl)» · h1 «…: emisiones, riesgos y monitorización…»
 *   miga «Metano (CH4)»            ·  h1 «Metano, un desafío para la estabilidad…»
 *
 * No es una excepción: es la **regla de esta forma**. El `h1` es el titular
 * largo y el rótulo es el nombre corto del término.
 */
export interface TerminoKunakpedia {
  slug: string;
  seo: SeoA;
  titulo: string;
  /**
   * Rótulo corto para la miga (y para cualquier listado que lo use). **Opcional
   * con defecto «el título», omitido cuando coinciden** — el mismo patrón que
   * `prefijo` (CMS-1), `headingColor` y `variante`.
   */
  tituloMiga?: string;
  cuerpo: CampoRico;
}

/**
 * DOCUMENTO CIENTÍFICO — 23 de las 209, y la única forma con prefijo de ruta.
 *
 * ⚠ **No es UN prefijo: son tres**, y el modelo del recon decía uno. Medido en
 * las 23: `documentos-cientificos/<categoría>` en 22 y
 * `estudios-cientificos/articulos-tecnicos` en 1. Se modela como CMS-1 modeló
 * el prefijo del caso de éxito: **campo con defecto, omitido cuando coincide**.
 */
export interface DocumentoCientifico {
  slug: string;
  /** Defecto `"documentos-cientificos"`; 1 de 23 escribe `"estudios-cientificos"`. */
  prefijo?: "documentos-cientificos" | "estudios-cientificos";
  /** `scientific-category` — 3 términos. Es el segmento que va antes del slug. */
  categoria: TerminoA;
  seo: SeoA;
  titulo: string;
  /** «Reche et al.» · «Airparif» · «Revista Hydrocarbon Engineering». */
  autores: string;
  anyo: string;
  portada: ImagenA;
  /** El PDF o la publicación externa. El rótulo va **en inglés en el original**. */
  descarga: { href: string; label: string };
  cuerpo: CampoRico;
}
