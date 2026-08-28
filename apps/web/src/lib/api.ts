/**
 * Datos de /kunak-api — la **ficha de producto corta**: la variante mínima del
 * arquetipo de /software (mismo hero, misma "Información del producto", mismos
 * blurbs de icono, mismos artículos, mismo FAQ y mismo CTA) **sin** carrusel,
 * rejilla de capturas, columna de anclas, casos de éxito ni vídeo.
 * Recon: docs/research/kunak-api/PAGE_TOPOLOGY.md · BEHAVIORS.md
 *
 * "Plantilla + datos", igual que `accesorios.ts` y `software.ts`: la plantilla
 * son `HeroApi` · `InfoProductoApi` · `BeneficiosApi` (+ el `BlurbsIconos`
 * compartido); los datos son este archivo.
 *
 * TEXTOS VERBATIM, incluidas las erratas del original — no "corregir":
 *   · "Realiza el análisis de  los datos"  (beneficio #5, doble espacio)
 *   · el CTA final enlaza a `/es/contacto` SIN barra final, al revés que el
 *     resto de la página
 *
 * La página **no expone documentación de API**: cero `<pre>`, cero `<code>`,
 * cero tablas de parámetros y ningún enlace a un portal de docs. Por eso aquí
 * no hay `Endpoint`, `Parametro` ni `EjemploCodigo`: el único bloque repetible
 * es `BlurbIcono`, usado dos veces (características y beneficios).
 */

import type { BlogPost } from "@/types/kunak";
import type { BlurbIconoItem } from "@/components/BlurbsIconos";

const U20_05 = "/images/uploads/2020/05";
const U22_06 = "/images/uploads/2022/06";
const U23_01 = "/images/uploads/2023/01";
const U23_02 = "/images/uploads/2023/02";
const U23_03 = "/images/uploads/2023/03";
const U23_04 = "/images/uploads/2023/04";
const U25_01 = "/images/uploads/2025/01";

export const CONTACT_HREF = "/contacto";
/** sic: el CTA de ancho completo enlaza SIN la barra final. */
export const CONTACT_HREF_CTA = "/contacto";

/* --------------------------------------------------------------------------
 * Tipos de contenido — un solo bloque repetible
 * ------------------------------------------------------------------------ */

/** Blurb de icono: icono arriba centrado + título. SIN descripción ni enlace. */
export type BlurbIcono = BlurbIconoItem;

export interface ApiImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

/* --------------------------------------------------------------------------
 * S0 · Breadcrumb (3 niveles, el último sin enlace)
 * ------------------------------------------------------------------------ */

export const BREADCRUMB: { label: string; href?: string }[] = [
  // ruta local: la home ya está clonada — original: https://kunakair.com/es/
  { label: "Inicio", href: "/" },
  // original: https://kunakair.com/es/productos/
  { label: "Productos", href: "/productos" },
  { label: "Kunak API" },
];

/* --------------------------------------------------------------------------
 * S1 · fila 1 — hero
 * ------------------------------------------------------------------------ */

export const HERO = {
  /** el `<p>` de 50px/fw800: es el titular VISUAL, el h1 va debajo a 23px */
  kicker: "Kunak API",
  h1: "Integración de datos más allá de la solución Kunak AIR Cloud",
  h2: "Extrae información y utilízala en tu software o sistema de gestión",
  /** línea azul en versalitas: el separador `|` va en un `<span>` #333 */
  claim: {
    antes: "DISPONIBILIDAD DE DATOS ",
    separador: "|",
    despues: " COPIAS DE SEGURIDAD AUTOMÁTICAS",
  },
  ctaLabel: "Solicita más información",
  ctaHref: CONTACT_HREF,
  image: {
    src: `${U23_02}/kunak-api.jpg`,
    width: 1200,
    height: 1200,
    alt: "Kunak API",
  } satisfies ApiImage,
} as const;

/* --------------------------------------------------------------------------
 * S1 · fila 2 — Información del producto
 * ------------------------------------------------------------------------ */

export const INFO = {
  /** aquí SÍ es un `<h2>` de 44/55; en /software el mismo rótulo es un `<p>` */
  heading: "Información del producto",
  /** párrafo de entrada, con el enlace inline a la página ya clonada */
  parrafoIntro: {
    antes: "Kunak API es un potente sistema de interconexión con el software ",
    enlaceLabel: "Kunak AIR Cloud",
    // ruta local: esta página ya está clonada
    enlaceHref: "/software-de-medicion-calidad-del-aire",
    despues:
      " que te permite extraer información y utilizarla en tu propio software o sistema de gestión de forma fácil y rápida.",
  },
  /** `<h2>` de 37px en azul (el color va en un `<span style>` inline) */
  h2Azul: "Integra datos de fuentes externas y toma mejores decisiones informadas.",
  parrafo:
    "Diseña tus propias soluciones, herramientas y aplicaciones de visualización y gestión, manteniendo el acceso a todas las funcionalidades de nuestra plataforma Kunak AIR Cloud para la gestión de redes de calidad del aire y ruido.",
  caracteristicasLabel: "Características:",
} as const;

/** 6 características — bloque repetible `iconos-xs-2 iconos-md-3`. */
export const CARACTERISTICAS: BlurbIcono[] = [
  { icono: `${U23_04}/api-rest.svg`, titulo: "Interfaz API Rest" },
  { icono: `${U23_04}/json-format.svg`, titulo: "Formato JSON" },
  { icono: `${U23_04}/call-limit.svg`, titulo: "Nº llamadas para cada caso" },
  { icono: `${U23_04}/size-limit.svg`, titulo: "Tamaño adaptado" },
  { icono: `${U23_04}/data-export.svg`, titulo: "Exportación de datos" },
  // el mismo icono que la característica #1 de /software; no es un error
  { icono: `${U23_02}/cloud-based-1.svg`, titulo: "Copias de seguridad" },
];

/* --------------------------------------------------------------------------
 * S1 · fila 3 — Beneficios (1/4 + 3/4, SIN caja de anclas)
 * ------------------------------------------------------------------------ */

export const BENEFICIOS_HEADING = "Beneficios";

export const BENEFICIOS_INTRO =
  "Automatiza procesos como la extracción de lecturas, alertas o la configuración de los equipos. Desarrolla tus propias herramientas de visualización y procesamiento de datos, crea sistemas automatizados cuya actuación depende de los datos capturados e interactúa con sistemas, aplicaciones, servicios y dispositivos de terceros.";

/** 6 beneficios — el MISMO bloque repetible, otra columna y otro ancho. */
export const BENEFICIOS: BlurbIcono[] = [
  { icono: `${U23_02}/easy-fast-installation.svg`, titulo: "Gestiona la red de forma remota" },
  { icono: `${U23_02}/cloud-platform.svg`, titulo: "Visualiza y gestiona los datos recogidos" },
  { icono: `${U23_03}/process-automation.svg`, titulo: "Automatiza los procesos más frecuentes" },
  { icono: `${U23_03}/new-tools.svg`, titulo: "Desarrolla nuevas herramientas" },
  // sic: doble espacio en "de  los datos"
  { icono: `${U23_03}/data-analytics.svg`, titulo: "Realiza el análisis de  los datos" },
  {
    icono: `${U23_03}/external-data-integration.svg`,
    titulo: "Integra datos de sistemas de terceros",
  },
];

/* --------------------------------------------------------------------------
 * S4 · CTA de ancho completo (va AL FINAL, después del FAQ)
 * ------------------------------------------------------------------------ */

export const CTA = {
  image: `${U23_01}/urban-1500.jpg`,
  heading: "Saca el máximo partido a los datos",
  headingHref: CONTACT_HREF_CTA,
  body: "Integra los datos de la red de monitorización en su plataforma.",
  buttonLabel: "Descubre cómo",
  buttonHref: CONTACT_HREF_CTA,
} as const;

/* --------------------------------------------------------------------------
 * S2 · Artículos y Guías
 * ------------------------------------------------------------------------ */

/**
 * El original SORTEA los 3 posts en cada carga (pendiente P4, igual que en
 * /monitor-calidad-aire, /accesorios y /software). Aquí va congelado el set
 * que capturó el recon el 2026-07-27 —el de
 * `docs/design-references/kunak-api/api-desktop-1440-full.jpg`—, así que el
 * bloque no es comparable px a px con una carga cualquiera del original.
 */
export const API_ARTICLES: BlogPost[] = [
  {
    title: "Contaminación por metano: impacto en el medio ambiente, la salud y soluciones",
    date: "Ene 7, 2025",
    image: `${U25_01}/Ganaderia-extensiva-y-emisiones-de-metano-1024x573.jpg`,
    // ruta local: esta página ya está clonada (src/app/[slug]) — grupo A.
    //   original: https://kunakair.com/es/contaminacion-por-metano/
    href: "/contaminacion-por-metano",
  },
  {
    title: "Contaminación por malos olores: Qué es, causas, efectos y soluciones",
    date: "Ago 7, 2020",
    // ⚠️ único asset del proyecto con tilde en el nombre. El original lo sirve
    // en NFD (`o` + U+0301); al descargarlo se normalizó a **NFC** para que
    // coincida con lo que escribe cualquier editor — si algún día falla el 404,
    // es por aquí (la búsqueda en disco es exacta, no insensible a la forma).
    image: `${U20_05}/contaminación-por-mal-olor-problemas-ambientales.jpg`,
    href: "https://kunakair.com/es/contaminacion-mal-olor-sensores/",
  },
  {
    title:
      "Kunak AIR Lite: la estación basada en sensores para medir la calidad del aire con infinitas aplicaciones",
    date: "Jun 30, 2022",
    image: `${U22_06}/kunak-air-lite-estacion-calidad-aire-compacta-basada-en-sensores.jpg`,
    href: "https://kunakair.com/es/calidad-aire-tiempo-real-kunak-air-lite/",
  },
];
