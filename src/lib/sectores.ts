/**
 * Content type del arquetipo **SECTOR / SOLUCIÓN VERTICAL** + los datos del
 * primer sector clonado (Urbano).
 *
 * Recon: docs/research/sectores/PAGE_TOPOLOGY.md · docs/research/sectores/BEHAVIORS.md
 * Original: https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/
 * Ruta destino: src/app/sectores/calidad-del-aire-en-las-ciudades/page.tsx
 * Capturas: docs/design-references/sectores/urbano-{desktop-1440,movil-390}-full.jpg
 *
 * ⚠️ NO CONFUNDIR con `src/lib/sectors.ts`, que es otra cosa: las **6
 * diapositivas del carrusel de sectores de la home** (`SECTOR_SLIDES`). Este
 * fichero es el modelo de la PÁGINA de sector.
 *
 * ── Por qué el cuerpo es una lista de bloques y no campos fijos ────────────
 * Los 7 sectores vivos comparten plantilla PHP (`page-template-sectors`) y por
 * tanto cabecera, banda de clientes, breadcrumb, hero, CTA de ancho completo y
 * bloque K. Lo que cambia es **el cuerpo entre el hero y el CTA**: cada sector
 * monta las filas Divi que quiere, en el orden que quiere. Urbano lleva
 * `ctaDescarga → beneficiosAplicaciones → claimConFoto`; Industria lleva
 * `beneficiosAplicaciones → ctaDescarga → listaSimple2Col → claimConFoto →
 * mapaProyectos`; e Investigación no lleva `ctaDescarga` en absoluto.
 * En el CMS esto es un *flexible content*: de ahí `body: SectorBlock[]`.
 * Medido y tabulado en PAGE_TOPOLOGY.md §2.
 *
 * ── Regla de rutas locales ────────────────────────────────────────────────
 * Los destinos ya clonados apuntan a la ruta local; el resto se deja en el
 * original. Anotado en cada caso con el href original al lado.
 */

import type { BlogPost, CaseStudy, Product } from "@/types/kunak";
import { PRODUCTS_TABS } from "./products";

/* ────────────────────────────── content type ───────────────────────────── */

/**
 * **Dónde corta la sección** — el campo que faltaba (S7, 2026-07-28).
 *
 * El cuerpo de un sector no es una pila de secciones: en Divi son SECCIONES con
 * FILAS dentro, y quien edita decide en cuál cae cada bloque. Medido en los 6
 * sectores de la plantilla clásica (`qa/tree-todos.mjs`, 1440 y 390) solo
 * aparecen **dos formas de sección** y **dos de fila**, y de su combinación
 * salen los 4 valores de este campo:
 *
 * | valor | qué monta | ritmo medido (1440 / 390) |
 * |---|---|---|
 * | `"seccion"` | abre `<section>` con el ritmo del cuerpo | `mt −14` · `pt 57.5938 / 50` · `pb 14`; su fila con `pt 2% / 30` |
 * | `"seccionRasa"` | abre `<section>` **sin** ritmo | `mt 0` · `pt 0` · `pb 0`; su fila con `pt 2% / 30` |
 * | `"fila"` | una fila más de la sección abierta | `pt 2% / 30` |
 * | `"filaPegada"` | una fila más, pegada a la de arriba | **`pt 0`** |
 *
 * Todas las filas cierran igual (`padding-bottom 2% / 30`), así que eso se
 * queda en el componente: aquí solo va el corte, que es lo editorial.
 *
 * Reparto real en los 6 sectores (así se eligieron los 4 valores, no viendo una
 * instancia — que fue justo el error de la tanda anterior):
 *
 * | sector | cuerpo |
 * |---|---|
 * | Urbano | cta `seccionRasa` · beneficios `seccion` · claim `filaPegada` |
 * | Construcción | igual que Urbano |
 * | Industria | beneficios `seccion` · cta · lista · claim `filaPegada` · mapa `fila` |
 * | Puertos | beneficios `seccion` · cta `fila` · claim `filaPegada` · mapa `fila` |
 * | Minería | beneficios `seccion` · claim · cta `filaPegada` · mapa `fila` |
 * | Investigación | beneficios `seccion` · claim `filaPegada` |
 *
 * Por defecto `"seccion"`: un bloque sin declarar abre su propia sección, que
 * es el comportamiento seguro (y el primero del cuerpo abre una siempre, lo
 * diga o no — una fila necesita sección que la contenga).
 */
export type SectorBlockFlujo = "seccion" | "seccionRasa" | "fila" | "filaPegada";

/** Lo que comparten los 5 tipos de bloque: dónde caen en el flujo de secciones. */
interface SectorBloqueBase {
  /** Ver `SectorBlockFlujo`. Por defecto `"seccion"`. */
  flujo?: SectorBlockFlujo;
}

export interface SectorLink {
  label: string;
  href: string;
  /** `target="_blank"` — solo si el destino es externo al clon. */
  external?: boolean;
}

export interface SectorImage {
  src: string;
  alt: string;
}

/** Migas de pan: Inicio / Sectores / [título]. El último va sin `href`. */
export interface SectorBreadcrumbItem {
  label: string;
  href?: string;
}

/** Cabecera: foto del sector a sangre con el kicker y el H1 encima, en blanco. */
export interface SectorHeader {
  /** Nombre corto del sector — el kicker de 40px sobre el H1 ("Urbano"). */
  kicker: string;
  /** El `<h1>` de la página ("Calidad del aire en las ciudades"). */
  title: string;
  /** Foto de la franja. La MISMA imagen alimenta la franja del pie. */
  image: string;
}

/** Hero 1/2 + 1/2: foto + 2 CTA a la izquierda, titular azul + copy a la derecha. */
export interface SectorHero {
  image: SectorImage;
  /** Los dos botones azules bajo la foto (siempre 2 en los 7 sectores). */
  ctas: SectorLink[];
  /**
   * El `<h2>`. En el original el color lo pone un `<span style="color:…">`
   * dentro del h2, no el h2: el h2 computa `#333`.
   */
  heading: string;
  /**
   * Color de ese `<span>`. **Es contenido, no estilo**: lo escribe quien edita
   * la página en WordPress y no es el mismo en todos los sectores — Urbano usa
   * `#0075c9` (el azul de marca) e Industria `#0c71c3` (el azul por defecto de
   * Divi). Por defecto, el de marca.
   */
  headingColor?: string;
  /** Párrafos a 18/30.6 con la rítmica Divi (`padding-bottom: 18px` salvo el último). */
  paragraphs: string[];
}

/**
 * CTA de descarga — shortcode `calls`. Tiene **dos pieles** y el mismo campo
 * `image` alimenta las dos; lo que cambia es dónde se pinta la foto:
 *
 * | | `"foto"` (Urbano) | `"fondo"` (Industria) |
 * |---|---|---|
 * | Clases del original | `…espacio-derecha call-fondo-blanco …` **`call-con-foto`** | `calls one-column call-fondo-blanco espacio-blanco-derecha` |
 * | La foto | `<img>` de 280 a la izquierda, sangrada −30 | **`background-image: cover`** de la caja |
 * | `padding` desktop | `40px 50px` | **`40px 60px`** |
 * | `padding` móvil | `30px 30px 40px` | **`40px 60px`** |
 * | Texto | tras la foto (inner 866.4) | inner a ancho completo con **`padding-left: 36%`** |
 * | Alto a 1440 | 337 | 420 |
 *
 * Lo descubrió poblar Industria (2026-07-28): el componente solo sabía pintar
 * la primera y la página salía +53 desplazada de ahí abajo.
 */
export interface SectorBloqueCtaDescarga extends SectorBloqueBase {
  kind: "ctaDescarga";
  title: string;
  body: string[];
  cta: SectorLink;
  image: string;
  /** Por defecto `"foto"` — la piel de Urbano. */
  variante?: "foto" | "fondo";
}

/** Las dos listas con viñeta azul: "Beneficios de…" | "Aplicaciones en…". */
export interface SectorBloqueBeneficiosAplicaciones extends SectorBloqueBase {
  kind: "beneficiosAplicaciones";
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
}

/** Claim azul de 37px a la izquierda + foto a la derecha. */
export interface SectorBloqueClaimConFoto {
  kind: "claimConFoto";
  claim: string;
  image: SectorImage;
}

/**
 * Lista corrida repartida en 2 columnas, con un párrafo de entrada.
 * No la usa Urbano — la usa Industria ("Algunos de las aplicaciones donde
 * desplegar sistemas de monitorización ambiental son:"). Se declara aquí
 * porque forma parte del arquetipo.
 */
export interface SectorBloqueListaSimple2Col {
  kind: "listaSimple2Col";
  intro?: string;
  left: string[];
  right: string[];
}

/**
 * Mapa de Google con pines de proyectos (Industria 41 · Puertos 30 · Minería 32).
 * Tampoco la usa Urbano. Sin construir: cuando toque, medir antes el módulo
 * `et_pb_map` — lleva API key de Google y no se puede clonar tal cual.
 */
export interface SectorBloqueMapaProyectos {
  kind: "mapaProyectos";
  title: string;
  intro?: string;
  pins: { title: string; lat: number; lng: number }[];
}

export type SectorBlock =
  | SectorBloqueCtaDescarga
  | SectorBloqueBeneficiosAplicaciones
  | SectorBloqueClaimConFoto
  | SectorBloqueListaSimple2Col
  | SectorBloqueMapaProyectos;

/** Diapositiva del CTA de ancho completo (3 en los 7 sectores, autoplay 7 s). */
export interface SectorCtaSlide {
  /** El título ES un enlace en el original, al mismo destino que el botón. */
  heading: string;
  cta: SectorLink;
  image: string;
}

export interface SectorPage {
  /** Último segmento de la ruta: /sectores/<slug>. */
  slug: string;
  seo: {
    title: string;
    description: string;
    ogImage: string;
    canonical: string;
  };
  breadcrumb: SectorBreadcrumbItem[];
  header: SectorHeader;
  hero: SectorHero;
  /** Cuerpo libre: los bloques que monte cada sector, en su orden. */
  body: SectorBlock[];
  ctaSlides: SectorCtaSlide[];
  /** "Nuestras soluciones" — subconjunto de `PRODUCTS_TABS` (3 de los 5). */
  soluciones: Product[];
  /** "Últimos proyectos" — filtrados por la taxonomía `sector/*` del original. */
  proyectos: { title: string; cta: SectorLink; posts: CaseStudy[] };
  /** "Artículos y Guías" — el original los sortea en cada carga (P4). */
  articulos: { title: string; cta: SectorLink; posts: BlogPost[] };
  /** Taxonomía `sector/*` a la que pertenecen los casos (no es 1:1 con la página). */
  taxonomy: SectorLink;
  /** Franja del pie: la MISMA foto que la cabecera. */
  footerStripImage: string;
}

/** Los 3 productos que muestran los 7 sectores (ni Cartuchos ni API). */
const SOLUCIONES_IDS = [
  "monitor-calidad-aire",
  "estacion-de-monitoreo-de-calidad-del-aire",
  "software-de-medicion-calidad-del-aire",
] as const;

export const SECTOR_SOLUCIONES: Product[] = SOLUCIONES_IDS.map(
  (id) => PRODUCTS_TABS.find((p) => p.id === id)!,
);

/* ──────────────────────────── datos: Urbano ────────────────────────────── */

export const SECTOR_URBANO: SectorPage = {
  slug: "calidad-del-aire-en-las-ciudades",

  seo: {
    title:
      "Soluciones de control de la calidad del aire urbano para ciudades | Kunak AIR",
    description:
      "Soluciones de monitorización de la calidad del aire urbano para ciudades inteligentes y municipios. Mide los niveles de contaminación en tiempo real con sistemas de monitorización de la calidad del aire precisos y escalables.",
    ogImage: "/images/uploads/2023/01/urban-1920.jpg",
    canonical:
      "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/",
  },

  breadcrumb: [
    // ruta local: esta página ya está clonada (src/app/page.tsx)
    // original: https://kunakair.com/es/
    { label: "Inicio", href: "/" },
    // el índice /es/sectores/ NO está clonado todavía
    { label: "Sectores", href: "https://kunakair.com/es/sectores/" },
    { label: "Calidad del aire en las ciudades" },
  ],

  header: {
    kicker: "Urbano",
    title: "Calidad del aire en las ciudades",
    image: "/images/uploads/2023/01/urban-1920.jpg",
  },

  hero: {
    image: {
      src: "/images/uploads/2023/02/urban-air-quality-1.jpg",
      alt: "calidad del aire en las ciudades",
    },
    ctas: [
      { label: "Quiero saber más", href: "https://kunakair.com/es/contacto/" },
      {
        label: "Descargar catálogo",
        href: "https://kunakair.com/es/descarga-catalogo/",
      },
    ],
    heading:
      "Conoce la calidad del aire que respiran tus ciudadanos con datos precisos calle a calle.",
    paragraphs: [
      "Más del 50 % de la población mundial reside y trabaja en áreas urbanas. Por tanto, medir la calidad del aire en las ciudades es fundamental.",
      "Esto plantea un reto debido a las densas tramas urbanas, el ruido, el tráfico o la meteorología que altera el comportamiento local de la contaminación. Tenemos la solución que te permitirá superar estos desafíos.",
      "La protección de la salud de los ciudadanos es una responsabilidad fundamental de cualquier gobierno y para tomar las mejores decisiones, es necesario contar con datos fiables, precisos y en tiempo real.",
      "Descubre la solución integral que ya utilizan más de 50 ciudades por todo el mundo.",
      "Mide el impacto en la calidad del aire de las operaciones urbanísticas, el tráfico rodado, las industrias cercanas y demás fuentes de contaminación y toma medidas para proteger la salud de tus ciudadanos.",
    ],
  },

  body: [
    {
      kind: "ctaDescarga",
      title: "¿Necesitas medir la contaminación en tu ciudad?",
      body: [
        "Descarga ahora el informe completo y descubre cómo Bilbao ha reducido la contaminación atmosférica y creado una ciudad más sostenible.",
      ],
      cta: {
        label: "Descargar informe",
        href: "https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-ciudades/",
        external: true, // target="_blank" rel="nofollow" en el original
      },
      image: "/images/uploads/2024/11/cta-informe-tecnico-urban-ES.png",
    },
    {
      kind: "beneficiosAplicaciones",
      left: {
        title: "Beneficios de monitorizar la calidad del aire:",
        items: [
          "Permite tomar medidas para mejorar la calidad de vida y la salud de sus ciudadanos.",
          "Proteger la salud y así reducir los costes sanitarios.",
          "Incrementa la concienciación medioambiental de los habitantes.",
          "Impulsa nuevas formas de movilidad sostenible.",
          "Aumenta el atractivo turístico de tu ciudad.",
          "Disfruta de un ecosistema más saludable.",
          "Potencia la capacidad para atraer talento, innovación e inversiones.",
        ],
      },
      right: {
        title: "Aplicaciones en las ciudades:",
        items: [
          "Monitorización de la contaminación de forma fiable y precisa.",
          "Datos a escala hiperlocal y en tiempo real.",
          "Complemento en las medidas de las estaciones de referencia oficiales.",
          "Detección de puntos calientes de contaminación.",
          "Identificación de fuentes emisoras de contaminación.",
          "Prevención de episodios de alta contaminación mediante el sistema de alertas por superación de umbrales.",
          "Visión global de la calidad del aire.",
        ],
      },
    },
    {
      kind: "claimConFoto",
      claim:
        "Protege la salud de tus ciudadanos tomando las mejores decisiones basadas en datos fiables, precisos y en tiempo real.",
      image: {
        src: "/images/uploads/2023/04/control-de-la-calidad-del-aire-en-ciudades.jpg",
        alt: "calidad aire ciudades kunak",
      },
    },
  ],

  ctaSlides: [
    {
      heading:
        "Obtén datos fiables y precisos sobre la contaminación calle a calle",
      cta: {
        label: "Protege la salud de tus ciudadanos",
        href: "https://kunakair.com/es/contacto/",
      },
      image: "/images/uploads/2023/02/street-by-street-data.jpg",
    },
    {
      heading: "Mejora del nivel de vida protegiendo el medio ambiente",
      cta: {
        label: "Podemos ayudarte",
        href: "https://kunakair.com/es/contacto/",
      },
      image: "/images/uploads/2023/02/improve-the-life-quality.jpg",
    },
    {
      heading:
        "Complementa las redes oficiales con información fiable a escala hiperlocal",
      cta: {
        label: "Descubre cómo",
        href: "https://kunakair.com/es/contacto/",
      },
      image: "/images/uploads/2023/02/hyper-local-scale-data.jpg",
    },
  ],

  soluciones: SECTOR_SOLUCIONES,

  proyectos: {
    title: "Últimos proyectos",
    cta: {
      label: "Ver todos los casos de éxito",
      // el original apunta a /case-studies/ (SIN /es/) y con target="_blank"
      href: "https://kunakair.com/case-studies/",
      external: true,
    },
    posts: [
      {
        client: "Secretaria Municipal do Ambiente e Clima (SMAC)",
        sector: "Urbano",
        sectorHref: "https://kunakair.com/es/sector/urbano/",
        title:
          "El primer distrito de bajas emisiones (DBE) en Río de Janeiro (Brasil) para mejorar la calidad del aire y la salud urbana",
        image:
          "/images/uploads/2025/12/Brazil-first-Low-Emission-District-LED-Rio-de-Janeiro-1024x683.jpg",
        href: "https://kunakair.com/es/case-studies/distrito-baja-emision-rio-de-janeiro/",
      },
      {
        client: "CityTRAQ",
        sector: "Urbano",
        sectorHref: "https://kunakair.com/es/sector/urbano/",
        title:
          "CityTRAQ: Colaboración europea para mejorar la calidad del aire urbano",
        image:
          "/images/uploads/2025/07/CityTRAQ-Colaboracion-europea-para-mejorar-la-calidad-del-aire-urbano-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/citytraq-calidad-del-aire-urbano/",
      },
      {
        client: "Ayuntamiento de Castel D’Ario",
        sector: "Urbano",
        sectorHref: "https://kunakair.com/es/sector/urbano/",
        title:
          "Integración avanzada para el monitoreo del tráfico y la calidad del aire en Castel D’Ario (Italia)",
        image: "/images/uploads/2025/06/castel-d-ario-1024x683.jpg",
        href: "https://kunakair.com/es/case-studies/monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario/",
      },
    ],
  },

  articulos: {
    title: "Artículos y Guías",
    cta: {
      label: "Amplia tus conocimientos con nuestras guías",
      href: "https://kunakair.com/es/recursos/guias/",
    },
    /**
     * P4 heredado: el módulo de blog **sortea los 3 posts en cada carga** — tres
     * cargas del 2026-07-28 devolvieron tres tríos distintos. Se congela el
     * trío de la última medición; la captura de referencia
     * (`urbano-desktop-1440-full.jpg`) muestra otro. Este bloque no se compara
     * píxel a píxel.
     */
    posts: [
      {
        title:
          "Normativa Seveso, el control de riesgos con las sustancias peligrosas",
        date: "Ago 30, 2024",
        image: "/images/uploads/2024/08/SEVESO-1976-1024x819.jpg",
        href: "https://kunakair.com/es/normativa-seveso-el-control-de-riesgos-con-las-sustancias-peligrosas/",
      },
      {
        title:
          "Monitorización de emisiones del tráfico urbano: control avanzado de la calidad del aire para la movilidad sostenible",
        date: "Mar 25, 2026",
        image:
          "/images/uploads/2026/05/Movilidad-urbana-sostenible_Kunak-1024x683.jpg",
        href: "https://kunakair.com/es/monitorizacion-de-emisiones-del-trafico-urbano/",
      },
      {
        title:
          "Contaminación del aire en Madrid, desafíos y soluciones en la lucha por la salud ambiental",
        date: "Dic 27, 2023",
        image: "/images/uploads/2024/01/Air_pollution_in_Madrid.webp",
        href: "https://kunakair.com/es/contaminacion-del-aire-en-madrid/",
      },
    ],
  },

  taxonomy: { label: "Urbano", href: "https://kunakair.com/es/sector/urbano/" },

  footerStripImage: "/images/uploads/2023/01/urban-1920.jpg",
};

/* ──────────────────── datos: Industria y olores ─────────────────────────── */

/**
 * Segundo sector, poblado el 2026-07-28 SOLO con datos para probar que la
 * plantilla aguanta otra composición. Su cuerpo son **5 bloques en otro orden**
 * que Urbano y estrena los dos tipos que aquél no usa: `listaSimple2Col` y
 * `mapaProyectos` (41 pines).
 *
 * Dos desviaciones conocidas respecto al original, las dos por límites del
 * COMPONENTE y no del modelo de datos — informe en PENDIENTES-QA.md:
 *   · su CTA de descarga usa la 2ª piel del shortcode `calls`: la foto va de
 *     `background-image` de la caja y el texto se desplaza a la derecha, en vez
 *     de la foto como `<img>` a la izquierda que pinta `CtaDescarga`;
 *   · el azul del titular del hero es `#0c71c3` (azul por defecto de Divi), no
 *     el `#0075C9` de marca que `SectorHero` tiene cableado.
 */
export const SECTOR_INDUSTRIA: SectorPage = {
  slug: "control-de-emisiones-industriales",

  seo: {
    title: "Control de emisiones industriales y malos olores | Kunak AIR",
    description:
      "Medición y control de la calidad del aire en emisiones industriales mediante estaciones basadas en sensores. Mejora tu impacto ambiental.",
    ogImage: "/images/uploads/2023/01/industry-1920x1024-1.jpg",
    canonical: "https://kunakair.com/es/sectores/control-de-emisiones-industriales/",
  },

  breadcrumb: [
    // ruta local: esta página ya está clonada (src/app/page.tsx)
    { label: "Inicio", href: "/" },
    { label: "Sectores", href: "https://kunakair.com/es/sectores/" },
    { label: "Control de emisiones industriales" },
  ],

  header: {
    kicker: "Industria y olores",
    title: "Control de emisiones industriales",
    image: "/images/uploads/2023/01/industry-1920x1024-1.jpg",
  },

  hero: {
    image: { src: "/images/uploads/2023/02/industry-perimeter.jpg", alt: "control de emisiones industriales" },
    ctas: [
      { label: "¿Quieres saber más?", href: "https://kunakair.com/es/contacto/" },
      { label: "Descargar catálogo", href: "https://kunakair.com/es/descarga-catalogo/" },
    ],
    heading:
      "Mide el impacto de las emisiones industriales con datos fiables sobre múltiples contaminantes.",
    // el original de Industria usa el azul por defecto de Divi, no el de marca
    headingColor: "#0c71c3",
    paragraphs: [
      "El crecimiento de las ciudades hace que a menudo la gente acabe viviendo junto a industrias dando lugar a quejas y molestias por la contaminación o los olores que desprenden.",
      "El control y la monitorización de emisiones industriales ayuda a minimizar estos problemas.",
      "Identifica qué operaciones o procesos producen más gases y partículas y detecta emisiones fugitivas que de otro modo pasarían desapercibidas mediante el despliegue de una red perimetral de sensores de calidad del aire.",
      "Conecta sondas como anemómetros o pluviómetros para recopilar información sobre meteorología y analiza así su efecto en los niveles de contaminación y la percepción de olores.",
      "Ayuda a crear un futuro más sostenible a través de la medición del impacto en la calidad del aire de las emisiones industriales.",
    ],
  },

  body: [
    {
      kind: "beneficiosAplicaciones",
      left: {
        title: "Beneficios del control de las emisiones industriales:",
        items: [
          "Protección de la salud de los trabajadores.",
          "Fortalecimiento de la imagen pública y la reputación de la empresa.",
          "Evaluación de las acciones realizadas para minimizar el impacto de las operaciones.",
          "Adaptación a las normativas medioambientales.",
          "Planificar las operaciones en base a datos fiables.",
          "Aumento de la protección y conservación medioambiental.",
          "Mayor ahorro económico al reducirse el riesgo de sanciones.",
          "Oportunidad para implementar sistemas y tecnologías más eficientes.",
          "Alertas por superación de umbrales.",
        ],
      },
      right: {
        title: "Aplicaciones en las industrias:",
        items: [
          "Detección de fugas y emisiones fugitivas.",
          "Monitorización en tiempo real, fiable y precisa de la contaminación.",
          "Salud e higiene industrial.",
          "Optimización de procesos.",
          "Limitación del impacto de las operaciones sobre la calidad del aire.",
          "Reducción de los costes de mantenimiento.",
          "Evaluación de las mejoras u obras realizadas.",
          "Identificación de puntos calientes.",
          "Detección de fuentes de emisión.",
        ],
      },
    },
    {
      kind: "ctaDescarga",
      title: "¿Quieres controlar el impacto de tus procesos en la calidad del aire?",
      body: [
        "Descarga el informe técnico [PDF] sobre la red de control de la calidad del aire desplegada en la planta de Cemex.",
        "Descubre cómo Cemex ha conseguido controlar las emisiones y tener bajo control el impacto ambiental de la producción de cemento.",
      ],
      cta: {
        label: "Descargar informe",
        href: "https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-industria/",
        external: true,
      },
      image: "/images/uploads/2024/11/cta-informe-tecnico-industria-scaled.jpg",
      // Industria no lleva `call-con-foto`: la foto es el fondo de la caja.
      variante: "fondo",
    },
    {
      kind: "listaSimple2Col",
      intro: "Algunos de las aplicaciones donde desplegar sistemas de monitorización ambiental son:",
      left: [
        "Industria cementera",
        "Metalurgia y minería",
        "Pasta y papel",
        "Extracción de combustibles fósiles",
        "Tratamiento de aguas residuales (PTAR y EDAR)",
        "Vertederos y estiércol",
      ],
      right: [
        "Gestión del compost",
        "Espacios agrícolas y ganaderos",
        "Industria del gas y del petróleo",
        "Petroquímica",
        "Plantas de fertilizantes",
        "Empresas farmacéuticas",
      ],
    },
    {
      kind: "claimConFoto",
      claim:
        "Identifica qué operaciones o procesos producen más gases y partículas en industrias.",
      image: {
        src: "/images/uploads/2023/05/Identify-which-operations-or-processes-produce-the-most-gases-and-particulates-in-industries.jpg",
        alt: "control emisiones industriales y olores",
      },
    },
    {
      kind: "mapaProyectos",
      title: "Proyectos por todo el mundo",
      intro: "Algunos de los proyectos de monitorización medioambiental en diferentes industrias.",
      pins: [
        { title: "MCP", lat: 42.8166478, lng: -1.7295503 },
        { title: "Planta de fertilizantes Lifeco", lat: 30.4098125, lng: 19.6144375 },
        { title: "Vertedero Cerro Patacón", lat: 9.0552719, lng: -79.5587616 },
        { title: "EDAR (Confidencial)", lat: 43.3614375, lng: -5.8504375 },
        { title: "Empresa de petróleo y gas (Confidencial)", lat: 37.9479375, lng: 23.6174375 },
        { title: "EDAR (Confidencial)", lat: 50.9991875, lng: -0.1451875 },
        { title: "Empresa de petróleo y gas (Confidencial)", lat: 40.6831875, lng: 22.8850625 },
        { title: "Centro de Tratamiento de Aguas Residuales (Confidencial)", lat: 31.9565625, lng: 34.7335625 },
        { title: "Empresa cementera (Confidencial)", lat: 53.0033369, lng: -2.1827408 },
        { title: "Estación depuradora de aguas residuales (Confidencial)", lat: 39.9215625, lng: -105.0244375 },
        { title: "Empresa de petróleo y gas (Confidencial)", lat: 29.0908125, lng: 48.0873125 },
        { title: "Petrobras", lat: -22.4363125, lng: -45.1090625 },
        { title: "Granja (Confidencial)", lat: 26.7432875, lng: 38.0525469 },
        { title: "Empresa de petróleo y gas (Confidencial)", lat: 24.6171375, lng: 54.6672031 },
        { title: "Planta de residuos y reciclaje (Confidencial)", lat: -27.6689375, lng: 152.8154375 },
        { title: "EDAR (Confidencial)", lat: -27.3810625, lng: 153.1473125 },
        { title: "Planta de reciclaje y vertedero (Confidencial)", lat: -33.7994375, lng: 150.8316875 },
        { title: "Canal de Isabel II", lat: 40.4134375, lng: -3.5180625 },
        { title: "Canal de Isabel II", lat: 40.4148125, lng: -3.4091875 },
        { title: "ArcelorMittal", lat: -22.6983125, lng: -47.6550625 },
        { title: "ArcelorMittal", lat: 36.5216875, lng: -118.7329375 },
        { title: "ArcelorMittal", lat: 50.0317625, lng: 72.9927031 },
        { title: "ArcelorMittal", lat: 43.4328125, lng: 4.8873125 },
        { title: "SAMAE WWTP", lat: -26.5069375, lng: -49.1201875 },
        { title: "Titan Pneus Do Brasil Ltda", lat: -23.5338125, lng: -46.5988125 },
        { title: "Vigilancia en zonas remotas - Punta Arenas", lat: -52.8857375, lng: -70.1813281 },
        { title: "Calidad del aire en Islandia", lat: 64.0438984, lng: -21.3994694 },
        { title: "Galvani Fábrica de fertilizantes", lat: -12.0871875, lng: -45.7730625 },
        { title: "Inerco", lat: -32.7755625, lng: -71.4914375 },
        { title: "Ternium", lat: 25.7456875, lng: -99.9668125 },
        { title: "Cemex", lat: 25.4890625, lng: -103.3991875 },
        { title: "Cemex", lat: 25.7004375, lng: -100.2985625 },
        { title: "EDAR Torredembarra", lat: 41.1461625, lng: 1.4132656 },
        { title: "Fábrica de aluminio (Confidencial)", lat: 23.5684125, lng: 58.3744219 },
        { title: "ALBA Fábrica de aluminio", lat: 26.0948125, lng: 50.6071875 },
        { title: "Ubicación confidencial", lat: 66.3869742, lng: -106.7458395 },
        { title: "Vertedero de Valdemingómez", lat: 40.3360625, lng: -3.5919219 },
        { title: "Planta de petróleo y gas (Confidencial)", lat: -10.8166875, lng: 40.5666875 },
        { title: "Industria alimentaria (Confidencial)", lat: -34.2075625, lng: -70.8961875 },
        { title: "Fábrica de papel (Confidencial)", lat: 46.3271875, lng: -72.5574375 },
        { title: "Planta de gestión de residuos sólidos (Confidencial)", lat: 47.6611875, lng: -122.1835625 },
      ],
    },
  ],

  ctaSlides: [
    {
      heading:
        "Reduce el impacto ambiental midiendo las inisiones industriales",
      cta: { label: "Podemos ayudarte", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/Limitation-of-the-environmental-impact-of-industrial-activity.jpg",
    },
    {
      heading:
        "Mejora la calidad del aire y la salud de tus trabajadores con la monitorización ambiental",
      cta: { label: "Protege a tus trabajadores", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/industry-worker.jpg",
    },
    {
      heading:
        "Mide el impacto de tu actividad industrial en la calidad del aire",
      cta: { label: "Obtén información fiable", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/inudstry-operator.jpg",
    },
  ],

  soluciones: SECTOR_SOLUCIONES,

  proyectos: {
    title: "Últimos proyectos",
    cta: {
      label: "Ver todos los casos de éxito",
      href: "https://kunakair.com/case-studies/",
      external: true,
    },
    posts: [
      {
        client: "Virginia Department of Environmental Quality (DEQ)",
        sector: "Industria",
        sectorHref: "https://kunakair.com/es/sector/industria/",
        title:
          "Monitorización de la calidad del aire en el mayor corredor de centros de datos de EE.UU",
        image:
          "/images/uploads/2026/05/639130508516830000.jpg",
        href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos/",
      },
      {
        client: "BASF SE",
        sector: "Industria",
        sectorHref: "https://kunakair.com/es/sector/industria/",
        title:
          "Monitorización de la calidad del aire en la planta petroquímica de BASF en Ludwigshafen (Alemania)",
        image:
          "/images/uploads/2025/05/Air-quality-monitoring-at-BASF-chemical-plant-in-Ludwigshafen-Germany-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-una-planta-petroquimica-en-alemania/",
      },
      {
        client: "Planta de procesamiento de alimentos",
        sector: "Industria",
        sectorHref: "https://kunakair.com/es/sector/industria/",
        title:
          "Análisis de la calidad del aire en una planta de procesamiento de alimentos en Singapur",
        image:
          "/images/uploads/2025/01/food-processing-plant-in-Singapore-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/calidad-del-aire-en-planta-procesamiento-alimentos-singapur/",
      },
    ],
  },

  articulos: {
    title: "Artículos y Guías",
    cta: {
      label: "Amplia tus conocimientos con nuestras guías",
      href: "https://kunakair.com/es/recursos/guias/",
    },
    /** P4: el original sortea los 3 posts en cada carga; trío congelado el 2026-07-28. */
    posts: [
      {
        title:
          "El impacto del humo de incendios forestales en la calidad del aire",
        date: "Mar 3, 2021",
        image: "/images/uploads/2021/03/contaminacion-por-incendios-forestales-monitorizacion-aire.jpg",
        href: "https://kunakair.com/es/contaminacion-incendios-forestales-aire/",
      },
      {
        title:
          "Medición de gases en los vertederos de basura",
        date: "Abr 4, 2023",
        image: "/images/uploads/2023/04/gases-en-los-vertederos-de-basura.png",
        href: "https://kunakair.com/es/medicion-de-gases-en-los-vertederos-de-basura/",
      },
      {
        title:
          "¿Cómo afecta la contaminación del aire en el deporte practicado al aire libre?",
        date: "Sep 24, 2020",
        image: "/images/uploads/2020/09/contaminacion-del-aire-en-el-deporte_.jpg",
        href: "https://kunakair.com/es/contaminacion-aire-deporte/",
      },
    ],
  },

  taxonomy: { label: "Industria", href: "https://kunakair.com/es/sector/industria/" },

  footerStripImage: "/images/uploads/2023/01/industry-1920x1024-1.jpg",
};

/* ────────────────────── registro para la ruta dinámica ─────────────────── */

/**
 * Los sectores **poblados**. `src/app/sectores/[slug]/page.tsx` genera una ruta
 * estática por cada entrada con `generateStaticParams()`, así que añadir un
 * sector nuevo es añadir un `SectorPage` a esta lista — **sin tocar código**.
 *
 * Hoy solo Urbano. Los otros 7 están inventariados en `SECTORES_INDICE` con su
 * URL del original; según se vayan poblando, pasan de allí a aquí y su `href`
 * del índice se cambia por la ruta local.
 */
export const SECTORES_PUBLICADOS: SectorPage[] = [SECTOR_URBANO, SECTOR_INDUSTRIA];

export function getSector(slug: string): SectorPage | undefined {
  return SECTORES_PUBLICADOS.find((s) => s.slug === slug);
}

/**
 * Índice de los 8 sectores del sitio (el orden es el del mega-menú).
 * `href` local solo para los ya clonados.
 *
 * ⚠️ El href de EDAR que guarda `nav.ts` da **404**: apunta a
 * `…/monitorizacion-ambiental-y-control-de-olores-en-plantas-de-aguas-residuales/`
 * cuando el menú vivo del original usa
 * `…/monitorizacion-ambiental-y-control-de-olores-en-edar/`. Aquí va el bueno;
 * corregir `nav.ts` cuando toque tocar ese fichero.
 */
export const SECTORES_INDICE: {
  kicker: string;
  slug: string;
  href: string;
  /** Taxonomía `sector/*` que filtra sus casos de éxito (no es 1:1). */
  taxonomy: string;
  clonado: boolean;
}[] = [
  {
    kicker: "Urbano",
    slug: "calidad-del-aire-en-las-ciudades",
    // ruta local: esta página ya está clonada (src/app/sectores/calidad-del-aire-en-las-ciudades)
    // original: https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/
    href: "/sectores/calidad-del-aire-en-las-ciudades",
    taxonomy: "urbano",
    clonado: true,
  },
  {
    kicker: "Industria y olores",
    slug: "control-de-emisiones-industriales",
    href: "https://kunakair.com/es/sectores/control-de-emisiones-industriales/",
    taxonomy: "industria",
    clonado: false,
  },
  {
    kicker: "EDAR",
    slug: "monitorizacion-ambiental-y-control-de-olores-en-edar",
    href: "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
    taxonomy: "edar",
    clonado: false,
  },
  {
    kicker: "Petróleo y gas",
    slug: "monitorizacion-de-emisiones-en-petroleo-y-gas",
    href: "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    taxonomy: "industria",
    clonado: false,
  },
  {
    kicker: "Puertos y aeropuertos",
    slug: "contaminacion-del-transporte-maritimo",
    href: "https://kunakair.com/es/sectores/contaminacion-del-transporte-maritimo/",
    taxonomy: "puertos",
    clonado: false,
  },
  {
    kicker: "Construcción",
    slug: "contaminacion-por-construccion",
    href: "https://kunakair.com/es/sectores/contaminacion-por-construccion/",
    taxonomy: "obras",
    clonado: false,
  },
  {
    kicker: "Minería",
    slug: "contaminacion-del-aire-por-la-mineria",
    href: "https://kunakair.com/es/sectores/contaminacion-del-aire-por-la-mineria/",
    taxonomy: "mineria",
    clonado: false,
  },
  {
    kicker: "Investigación y consultoría",
    slug: "estudio-de-la-contaminacion-atmosferica",
    href: "https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/",
    taxonomy: "investigacion-consultoria",
    clonado: false,
  },
];
