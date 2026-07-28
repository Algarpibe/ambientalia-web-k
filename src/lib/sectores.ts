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
   * El `<h2>`. En el original el azul lo pone un `<span style="color:#0075c9">`
   * dentro del h2, no el h2: el h2 computa `#333`.
   */
  heading: string;
  /** Párrafos a 18/30.6 con la rítmica Divi (`padding-bottom: 18px` salvo el último). */
  paragraphs: string[];
}

/** CTA de descarga — shortcode `calls` en su variante `call-con-foto`. */
export interface SectorBloqueCtaDescarga {
  kind: "ctaDescarga";
  title: string;
  body: string[];
  cta: SectorLink;
  image: string;
}

/** Las dos listas con viñeta azul: "Beneficios de…" | "Aplicaciones en…". */
export interface SectorBloqueBeneficiosAplicaciones {
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
export const SECTORES_PUBLICADOS: SectorPage[] = [SECTOR_URBANO];

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
