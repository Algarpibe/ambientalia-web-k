/**
 * Content type del arquetipo **SECTOR / SOLUCIÓN VERTICAL** + los datos del
 * primer sector clonado (Urbano).
 *
 * Recon: docs/research/sectores/PAGE_TOPOLOGY.md · docs/research/sectores/BEHAVIORS.md
 * Original: https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/
 * Ruta destino: src/app/sectores/calidad-del-aire-en-las-ciudades/page.tsx
 * Capturas: docs/design-references/sectores/urbano-{desktop-1440,movil-390}-full.jpg
 *
 * El carrusel de sectores de la home es otra cosa y vive en
 * `src/lib/home-carrusel-sectores.ts` (`SECTOR_SLIDES`). Se llamaba `sectors.ts`
 * y este aviso decía "NO CONFUNDIR"; se renombró el 2026-07-29 para que no haga
 * falta el aviso.
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
 * sectores de la plantilla clásica (`scripts/qa/tree-todos.mjs`, 1440 y 390;
 * salida congelada en `scripts/qa/medidas/tree-todos-1440.json`) solo aparecen
 * **dos formas de sección** y **dos de fila**, y de su combinación salen los 4
 * valores de este campo:
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
export interface SectorBloqueClaimConFoto extends SectorBloqueBase {
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
export interface SectorBloqueListaSimple2Col extends SectorBloqueBase {
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
export interface SectorBloqueMapaProyectos extends SectorBloqueBase {
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

  // flujo medido: cta `seccionRasa` · beneficios `seccion` · claim `filaPegada`
  // (el CTA va en su propia sección sin ritmo; las listas abren la segunda y el
  //  claim es otra fila de ESA, pegada — el `pb 14` cierra tras el claim)
  body: [
    {
      kind: "ctaDescarga",
      flujo: "seccionRasa",
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
      flujo: "filaPegada",
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
        // ruta local: este caso ya está clonado (src/app/case-studies/[slug])
        // original: https://kunakair.com/es/case-studies/distrito-baja-emision-rio-de-janeiro/
        href: "/case-studies/distrito-baja-emision-rio-de-janeiro",
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
 * Poblarlo destapó **cuatro** cosas que el arquetipo no sabía, y las cuatro
 * resultaron ser campos que le faltaban al content type, no retoques de CSS
 * (informe en PENDIENTES-QA.md). Ya están las cuatro:
 *   · `variante: "fondo"` — la 2ª piel del shortcode `calls`;
 *   · `headingColor` — su hero usa `#0c71c3`, no el `#0075C9` de marca;
 *   · la rítmica Divi de párrafos del `.calls-text` (se veía con dos, no con uno);
 *   · `flujo` — sus cinco bloques son cinco FILAS de la misma sección (S7).
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

  // flujo medido: los CINCO bloques son cinco filas de la MISMA sección, y solo
  // el mapa vuelve a separarse con el `pt` de fila. Entre las tres primeras y el
  // claim no hay más que el `pb` de la fila de arriba (`filaPegada`).
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
      flujo: "filaPegada",
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
      flujo: "filaPegada",
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
      flujo: "filaPegada",
      claim:
        "Identifica qué operaciones o procesos producen más gases y partículas en industrias.",
      image: {
        src: "/images/uploads/2023/05/Identify-which-operations-or-processes-produce-the-most-gases-and-particulates-in-industries.jpg",
        alt: "control emisiones industriales y olores",
      },
    },
    {
      kind: "mapaProyectos",
      flujo: "fila",
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

/* ───────────────────────── datos: Construcción ─────────────────────────── */

/**
 * Tercer sector, 2026-07-29, **solo datos**. Es el único de los 8 que pone el
 * CTA de descarga POR DELANTE de las listas, así que su cuerpo es
 * `cta seccionRasa · beneficios seccion · claim filaPegada`: invierte el orden
 * respecto a Industria y es el que de verdad ejercita la regla de agrupación de
 * `SectorBody` — dos secciones, y la primera rasa.
 *
 * Comparte forma con Urbano pero **no** su piel de CTA: aquí el shortcode
 * `calls` va con `one-column call-fondo-blanco espacio-blanco-derecha`, o sea
 * `variante: "fondo"`, como Industria. Y el azul del hero es el `#0c71c3` de
 * Divi, no el de marca — el claim sí usa el de marca.
 *
 * Un solo caso de éxito (los demás sectores traen 3): no es un recorte, es lo
 * que publica el original.
 */
export const SECTOR_CONSTRUCCION: SectorPage = {
  slug: "contaminacion-por-construccion",

  seo: {
    title: "Medición de contaminación por construcción | Kunak AIR",
    description:
      "Mide de forma precisa el impacto en la calidad del aire o la contaminación por construcción y haz tus obras más sostenibles.",
    ogImage: "/images/uploads/2023/01/construction-1920x1024-1.jpg",
    canonical: "https://kunakair.com/es/sectores/contaminacion-por-construccion/",
  },

  breadcrumb: [
    // ruta local: esta página ya está clonada (src/app/page.tsx)
    { label: "Inicio", href: "/" },
    { label: "Sectores", href: "https://kunakair.com/es/sectores/" },
    { label: "Contaminación por construcción" },
  ],

  header: {
    kicker: "Construcción",
    title: "Contaminación por construcción",
    image: "/images/uploads/2023/01/construction-1920x1024-1.jpg",
  },

  hero: {
    image: {
      src: "/images/uploads/2023/02/works-demolitions.jpg",
      alt: "contaminación por construcción",
    },
    ctas: [
      { label: "¿Quieres saber más?", href: "https://kunakair.com/es/contacto/" },
      { label: "Descargar catálogo", href: "https://kunakair.com/es/descarga-catalogo/" },
    ],
    heading:
      "Controla la calidad del aire en obras de construcción y demolición con datos de alta precisión.",
    headingColor: "#0c71c3",
    paragraphs: [
      "La construcción representa uno de los principales sectores económicos, exponente del grado de progreso de las sociedades.",
      "Sin embargo, su desarrollo no está exento de generar inconvenientes siendo necesario medir la contaminación que genera mediante sistemas de control ambiental.",
      "Esto es especialmente notable en el caso de los trabajos de demolición (emisiones de polvo) o la presencia de maquinaria pesada (gases contaminantes, partículas en suspensión y ruido).",
      "Monitoriza el impacto de tus obras en la calidad del aire de forma continua y toma decisiones que protejan la salud de las personas.",
      "Los productos y servicios de Kunak responden plenamente a los requisitos solicitados por las empresas constructoras o las administraciones mediante planes de control medioambiental en las obras.",
    ],
  },

  // flujo medido: cta `seccionRasa` · beneficios `seccion` · claim `filaPegada`
  body: [
    {
      kind: "ctaDescarga",
      flujo: "seccionRasa",
      title: "¿Necesitas controlar el impacto ambiental de tu obra?",
      body: [
        "Descarga ahora el informe completo y descubre cómo redujeron la contaminación del aire y cumplieron la normativa ambiental durante la demolición del estadio Vicente Calderón.",
      ],
      cta: {
        label: "Descargar informe",
        href: "https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-obras/",
        external: true,
      },
      image: "/images/uploads/2024/11/cta-informe-tecnico-works.jpg",
      variante: "fondo",
    },
    {
      kind: "beneficiosAplicaciones",
      left: {
        title: "Beneficios del control ambiental en la construcción:",
        items: [
          "Prevención de posibles problemas y quejas.",
          "Protección de la salud pública.",
          "Cumplimiento de la normativa ambiental.",
          "Aumento del prestigio de las constructoras.",
          "Fomento de prácticas sostenibles.",
          "Mayor bienestar y seguridad de los trabajadores y poblaciones cercanas.",
          "Protección de los hábitats naturales y los espacios verdes.",
        ],
      },
      right: {
        title: "Aplicaciones en las obras y demoliciones:",
        items: [
          "Evaluación del impacto ambiental.",
          "Cumplimiento normativo.",
          "Identificación y control de los contaminantes.",
          "Optimización de operaciones.",
          "Limitación del impacto sobre la calidad del aire de la actividad constructiva.",
          "Identificación de operaciones potencialmente problemáticas.",
          "Detección de fuentes de emisión atmosférica y acústica.",
          "Certificación de proyectos sostenibles (por ejemplo Certificado BREEAM®).",
        ],
      },
    },
    {
      kind: "claimConFoto",
      flujo: "filaPegada",
      claim:
        "Accede a datos ambientales de forma continua y toma decisiones basadas en datos fiables.",
      image: {
        src: "/images/uploads/2023/05/Accede-a-datos-medioambientales-en-obras-de-forma-continua.jpg",
        alt: "medición contaminación por construcción",
      },
    },
  ],

  ctaSlides: [
    {
      heading:
        "Controla la calidad del aire en las obras y contribuye al bienestar de las personas",
      cta: { label: "Cuéntanos tu caso", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/air-quality-at-construction-sites.jpg",
    },
    {
      heading: "Minimiza los riesgos desplegando una red de control del polvo en suspensión",
      cta: { label: "Mide tus emisiones", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/road-works.jpg",
    },
    {
      heading: "Controla tus obras con datos precisos en tiempo real",
      cta: { label: "Optimiza tus operaciones", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/Control-the-impact-of-your-operations.jpg",
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
    /** UNO solo: es lo que publica el original en este sector. */
    posts: [
      {
        client: "AFC Ingenieros",
        sector: "Obras",
        sectorHref: "https://kunakair.com/es/sector/obras/",
        title: "Vigilancia ambiental en la demolición del estadio Vicente Calderón",
        image:
          "/images/uploads/2020/04/environmental-monitoring-demolition-of-the-vicente-calderon-stadium-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/demolicion-estadio-vicente-calderon/",
      },
    ],
  },

  articulos: {
    title: "Artículos y Guías",
    cta: {
      label: "Amplia tus conocimientos con nuestras guías",
      href: "https://kunakair.com/es/recursos/guias/",
    },
    /** P4: el original sortea los 3 posts en cada carga; trío congelado el 2026-07-29. */
    posts: [
      {
        title:
          "Contaminación del aire por obras, analizando el impacto ambiental de la construcción",
        date: "Ago 31, 2023",
        image: "/images/uploads/2023/08/contaminacion-del-aire-por-obras-1024x683.jpg",
        href: "https://kunakair.com/es/contaminacion-del-aire-por-obras/",
      },
      {
        title:
          "Monitorización del aire en proyectos de remediación: control de emisiones y cumplimiento ambiental",
        date: "Abr 28, 2026",
        image: "/images/uploads/2026/05/Trabajos-de-remediacion-ambiental_Kunak-1024x683.jpeg",
        href: "https://kunakair.com/es/monitorizacion-aire-remediacion-suelos-contaminados/",
      },
      {
        title:
          "Impacto ambiental de la industria cementera: desafíos y soluciones tecnológicas",
        date: "Feb 21, 2022",
        image:
          "/images/uploads/2022/02/the-cement-industry-and-the-environment-air-quality-monitoring.jpg",
        href: "https://kunakair.com/es/impacto-ambiental-industria-cementera/",
      },
    ],
  },

  taxonomy: { label: "Obras", href: "https://kunakair.com/es/sector/obras/" },

  footerStripImage: "/images/uploads/2023/01/construction-1920x1024-1.jpg",
};

/* ────────────── datos: Investigación y consultoría (caso mínimo) ────────── */

/**
 * Cuarto sector, 2026-07-29, **solo datos**. Es el **caso mínimo del
 * arquetipo**: dos bloques y una sola sección
 * (`beneficios seccion · claim filaPegada`), y el único de los 8 **sin CTA de
 * descarga** — 0 `.calls` en el original. Sirve de prueba de que el cuerpo es
 * de verdad libre y no una plantilla con huecos opcionales.
 *
 * ⚠️ TEXTO VERBATIM: el 2º párrafo del hero dice "datos fiales" en el original.
 * Es una errata suya y **no se corrige** (misma regla que `src/lib/software.ts`).
 */
export const SECTOR_INVESTIGACION: SectorPage = {
  slug: "estudio-de-la-contaminacion-atmosferica",

  seo: {
    title: "Estudio de la contaminación atmosférica | Kunak AIR",
    description:
      "Realiza un estudio de la contaminación atmosférica más completo y accede a nuevas financiaciones aprovechando la tecnología de sensores.",
    ogImage: "/images/uploads/2023/01/research-1920.jpg",
    canonical: "https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/",
  },

  breadcrumb: [
    // ruta local: esta página ya está clonada (src/app/page.tsx)
    { label: "Inicio", href: "/" },
    { label: "Sectores", href: "https://kunakair.com/es/sectores/" },
    { label: "Estudio de la contaminación atmosférica" },
  ],

  header: {
    kicker: "Investigación y consultoría",
    title: "Estudio de la contaminación atmosférica",
    image: "/images/uploads/2023/01/research-1920.jpg",
  },

  hero: {
    image: {
      src: "/images/uploads/2023/02/air-quality-report.jpg",
      alt: "tecnología para el estudio de la contaminación atmosférica",
    },
    ctas: [
      { label: "¿Quieres saber más?", href: "https://kunakair.com/es/contacto/" },
      { label: "Descargar catálogo", href: "https://kunakair.com/es/descarga-catalogo/" },
    ],
    heading:
      "Realiza mediciones útiles y precisas para investigaciones con la mejor tecnología disponible.",
    headingColor: "#0c71c3",
    paragraphs: [
      "La elaboración de estudios sobre la contaminación atmosférica es, en ocasiones, una condición indispensable para la concesión de ayudas y de autorizaciones ambientales o su renovación.",
      // "fiales" es errata DEL ORIGINAL — no tocar
      "La tecnología de Kunak complementa las mediciones que efectúan las estaciones de referencia oficiales proporcionando datos fiales y precisos que enriquecen los informes elaborados por empresas del sector ambiental y que ayudan a las autoridades en la toma de decisiones.",
      "Los proyectos de investigación promovidos por universidades, centros de investigación o administraciones públicas también pueden requerir estudios de contaminación atmosférica.",
      "Elabora estudios más completos y accede a nuevas fuentes de financiación aprovechando las ventajas que ofrece la tecnología de sensores.",
      "Mejorar la calidad del aire es necesario para hacer frente a la crisis medioambiental.",
    ],
  },

  // flujo medido: beneficios `seccion` · claim `filaPegada`. Sin ctaDescarga.
  body: [
    {
      kind: "beneficiosAplicaciones",
      left: {
        title: "Beneficios en estudios de contaminación atmosférica:",
        items: [
          "Complemento para comprobar la eficacia de las Mejores Técnicas Disponibles (MTD).",
          "Aumento del prestigio y la credibilidad de los investigadores.",
          "Más colaboraciones y propuestas de estudios.",
          "Reconocimiento público de la importancia de la calidad del aire en el bienestar de las personas y el medio ambiente.",
          "Identificación de tendencias y dinámicas de la contaminación del aire.",
          "Aumento en la comprensión del impacto que generan los diferentes agentes contaminantes.",
          "Mejora de la salud pública (bienestar humano y conservación ambiental).",
          "Fortalecimiento de los mecanismos de detección y respuesta.",
        ],
      },
      right: {
        title: "Aplicaciones en los estudios ambientales:",
        items: [
          "Medición en tiempo real, fiable y precisa de diferentes contaminantes.",
          "Elaboración de estudios de salud pública y de cambio climático.",
          "Desarrollo de políticas públicas de control de la contaminación.",
          "Toma de decisiones informadas sobre el transporte, la industria y la energía.",
          "Acceso a nuevas fuentes de datos.",
          "Posibilidad de acceder a financiación y ayudas adicionales.",
          "Realización de estudios sobre la calidad del aire.",
          "Detección de fuentes de emisión atmosférica y acústica.",
          "Elaboración de informes con analíticas avanzadas.",
        ],
      },
    },
    {
      kind: "claimConFoto",
      flujo: "filaPegada",
      claim: "Elabora estudios más completos gracias a la tecnología de sensores.",
      image: {
        src: "/images/uploads/2023/05/Realiza-estudios-mas-detallados-gracias-a-la-tecnologia-de-sensores.jpg",
        alt: "investigaciones contaminación atmosférica",
      },
    },
  ],

  ctaSlides: [
    {
      heading:
        "Haz que tus estudios ambientales sean más completos gracias a las nuevas fuentes de datos",
      cta: { label: "Descubre cómo", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/environmental-studies-with-new-data-sources.jpg",
    },
    {
      heading: "Integra múltiples fuentes de datos y realiza análisis avanzados",
      cta: { label: "Realiza análisis avanzados", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/Perform-advanced-analysis.jpg",
    },
    {
      heading:
        "Añade valor a tus estudios científicos gracias a los nuevos sensores de calidad del aire homologados",
      cta: { label: "Accede a datos de referencia", href: "https://kunakair.com/es/contacto/" },
      image: "/images/uploads/2023/02/near-reference-data-1.jpg",
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
        client: "Ministerio del Ambiente y Desarrollo Sostenible (MADES)",
        sector: "Investigación y consultoría",
        sectorHref: "https://kunakair.com/es/sector/investigacion-consultoria/",
        title: "Modernización de la red de monitorización ambiental del MADES de Paraguay",
        image: "/images/uploads/2026/05/MADES-1-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/red-de-monitorizacion-ambiental-mades-paraguay/",
      },
      {
        client: "Associação Bora Ambientar",
        sector: "Investigación y consultoría",
        sectorHref: "https://kunakair.com/es/sector/investigacion-consultoria/",
        title:
          "Respirar Fundo, el proyecto que revela qué aire respiran los escolares portugueses",
        image:
          "/images/uploads/2025/12/Respirar-Fundo-Proyecto-de-monitorizacion-de-la-calidad-del-aire-en-escuelas-portuguesas-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/respirar-fundo-monitorizacion-de-la-calidad-del-aire-en-escuelas-portuguesas/",
      },
      {
        client: "Instituto Politécnico Nacional",
        sector: "Investigación y consultoría",
        sectorHref: "https://kunakair.com/es/sector/investigacion-consultoria/",
        title:
          "Monitorización de gases tóxicos por sargazo en el Caribe para protección ambiental y turística",
        image: "/images/uploads/2025/06/sargazo-cancun-repmex-1024x683.jpg",
        href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-gases-toxicos-por-sargazo-en-el-caribe/",
      },
    ],
  },

  articulos: {
    title: "Artículos y Guías",
    cta: {
      label: "Amplia tus conocimientos con nuestras guías",
      href: "https://kunakair.com/es/recursos/guias/",
    },
    /** P4: el original sortea los 3 posts en cada carga; trío congelado el 2026-07-29. */
    posts: [
      {
        title: "¿Qué está pasando con la calidad del aire en Ciudad de México?",
        date: "May 15, 2019",
        image: "/images/uploads/2019/05/calidad-del-aire-ciudad-de-mexico-1024x682.jpeg",
        href: "https://kunakair.com/es/que-esta-pasando-con-la-calidad-del-aire-en-ciudad-de-mexico/",
      },
      {
        title:
          "Quemas controladas de cultivos, conciliando práctica agrícola y calidad del aire",
        date: "Abr 27, 2022",
        image: "/images/uploads/2022/04/quemas-prescritas-agricolas-calidad-aire-1.jpg",
        href: "https://kunakair.com/es/quemas-prescritas-agricolas-calidad-aire/",
      },
      {
        title:
          "Conferencia sobre el Cambio Climático COP26, una cita ineludible para una humanidad en la encrucijada",
        date: "Sep 21, 2021",
        image: "/images/uploads/2021/09/conferencia-de-las-partes-cop26-cita-ineludible.jpg",
        href: "https://kunakair.com/es/conferencia-partes-cop26-incendios/",
      },
    ],
  },

  taxonomy: {
    label: "Investigación y consultoría",
    href: "https://kunakair.com/es/sector/investigacion-consultoria/",
  },

  footerStripImage: "/images/uploads/2023/01/research-1920.jpg",
};

/* ────────────────────── registro para la ruta dinámica ─────────────────── */

/**
 * Los sectores **poblados**. `src/app/sectores/[slug]/page.tsx` genera una ruta
 * estática por cada entrada con `generateStaticParams()`, así que añadir un
 * sector nuevo es añadir un `SectorPage` a esta lista — **sin tocar código**.
 *
 * Hoy 4 de los 8. Los otros están inventariados en `SECTORES_INDICE` con su URL
 * del original; según se vayan poblando, pasan de allí a aquí y su `href` del
 * índice se cambia por la ruta local.
 *
 * Nada renderiza esta lista todavía: `/sectores` (el índice) no está clonado,
 * así que añadir entradas solo emite rutas estáticas nuevas. Los enlaces del
 * mega-menú viven en `nav.ts` y se localizan allí.
 */
export const SECTORES_PUBLICADOS: SectorPage[] = [
  SECTOR_URBANO,
  SECTOR_INDUSTRIA,
  SECTOR_CONSTRUCCION,
  SECTOR_INVESTIGACION,
];

export function getSector(slug: string): SectorPage | undefined {
  return SECTORES_PUBLICADOS.find((s) => s.slug === slug);
}

/**
 * Índice de los 8 sectores del sitio (el orden es el del mega-menú).
 * `href` local solo para los ya clonados.
 *
 * **`clonado` NO quiere decir "es un SectorPage".** EDAR y Petróleo y gas están
 * clonados desde el 2026-07-29 pero como arquetipo **MONOGRÁFICO TÉCNICO**: sus
 * datos viven en `src/lib/monografico.ts` y la ruta `/sectores/[slug]` despacha
 * entre los dos catálogos. Este índice es de URLs, no de arquetipos.
 *
 * ✅ Cerrado: el href de EDAR de `nav.ts` apuntaba a
 * `…-en-plantas-de-aguas-residuales/` y daba 404. Al localizarlo (2026-07-29)
 * dejó de existir el problema. Lo encontró `scripts/qa/enlaces.mjs`, que además
 * corrigió de dónde se creía que salían estos enlaces: el HANDOFF apostaba por
 * `nav.ts` · `footer.ts` · `home-carrusel-sectores.ts`, y los tres sitios
 * reales eran `nav.ts` · `footer.ts` · **este fichero** — el carrusel de la home
 * no lleva ni EDAR ni Petróleo.
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
    // ruta local: esta página ya está clonada (src/app/sectores/control-de-emisiones-industriales)
    // original: https://kunakair.com/es/sectores/control-de-emisiones-industriales/
    href: "/sectores/control-de-emisiones-industriales",
    taxonomy: "industria",
    clonado: true,
  },
  {
    kicker: "EDAR",
    slug: "monitorizacion-ambiental-y-control-de-olores-en-edar",
    // ruta local: clonado 2026-07-29, pero como arquetipo MONOGRÁFICO TÉCNICO
    // y no como SECTOR — sus datos viven en `src/lib/monografico.ts`.
    // original: https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/
    href: "/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
    taxonomy: "edar",
    clonado: true,
  },
  {
    kicker: "Petróleo y gas",
    slug: "monitorizacion-de-emisiones-en-petroleo-y-gas",
    // ruta local: clonado 2026-07-29, mismo arquetipo — original:
    // https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/
    href: "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
    taxonomy: "industria",
    clonado: true,
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
    // ruta local: esta página ya está clonada (src/app/sectores/contaminacion-por-construccion)
    // original: https://kunakair.com/es/sectores/contaminacion-por-construccion/
    href: "/sectores/contaminacion-por-construccion",
    taxonomy: "obras",
    clonado: true,
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
    // ruta local: esta página ya está clonada (src/app/sectores/estudio-de-la-contaminacion-atmosferica)
    // original: https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/
    href: "/sectores/estudio-de-la-contaminacion-atmosferica",
    taxonomy: "investigacion-consultoria",
    clonado: true,
  },
];
