/**
 * Datos de /software-de-medicion-calidad-del-aire — arquetipo SOFTWARE/PLATAFORMA.
 * Recon: docs/research/software/PAGE_TOPOLOGY.md · BEHAVIORS.md
 * Specs: docs/research/software/components/*.spec.md
 *
 * "Plantilla + datos", igual que `accesorios.ts`: la plantilla son
 * `HeroSoftware` · `InfoProductoSoftware` · `CarruselCapturas` ·
 * `ListaBeneficios` · `RejillaHerramientas`; los datos son este archivo.
 *
 * TEXTOS VERBATIM, incluidas las erratas del original — no "corregir":
 *   · "Análíticas básicas"  (herramienta #3; la #11 sí escribe "Analíticas")
 *
 * Los `alt` del original NO se copian en iconos ni capturas: son textos en
 * inglés heredados de otra página ("Easy fast installation" para el candado de
 * "Seguro y confidencial") o el literal "Tools" repetido 16 veces. Ver la nota
 * de accesibilidad en lista-beneficios.spec.md y rejilla-herramientas.spec.md.
 */

import type { BlogPost, CaseStudy } from "@/types/kunak";
import { PROJECTS } from "@/lib/projects";

const U23_01 = "/images/uploads/2023/01";
const U23_02 = "/images/uploads/2023/02";
const U23_03 = "/images/uploads/2023/03";
const U23_04 = "/images/uploads/2023/04";

export const CONTACT_HREF = "https://kunakair.com/es/contacto/";
export const CATALOG_HREF = "https://kunakair.com/es/descarga-catalogo/";
export const CASES_HREF = "https://kunakair.com/es/casos-de-exito/";

/* --------------------------------------------------------------------------
 * Tipos de contenido (los 4 bloques repetibles del CMS)
 * ------------------------------------------------------------------------ */

export interface SoftwareImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

/** Diapositiva del carrusel del hero: el título es la ÚNICA copy que hay. */
export interface Diapositiva {
  titulo: string;
  /** va como `background-image` del slide, no como `<img>` */
  imagen: string;
}

/** Blurb de característica (columna 2/3 de la fila 2): icono + título, sin texto. */
export interface Caracteristica {
  icono: string;
  titulo: string;
}

/** Blurb de beneficio (#beneficios): icono a la izquierda + título + párrafo. */
export interface Beneficio {
  icono: string;
  titulo: string;
  descripcion: string;
}

/** Tarjeta de herramienta (#herramientas): captura 1800×1200 + título + párrafo. */
export interface Herramienta {
  titulo: string;
  descripcion: string;
  captura: SoftwareImage;
}

/* --------------------------------------------------------------------------
 * S0 · Breadcrumb (el último nivel va sin enlace)
 * ------------------------------------------------------------------------ */

export const BREADCRUMB: { label: string; href?: string }[] = [
  // ruta local: la home ya está clonada — original: https://kunakair.com/es/
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "https://kunakair.com/es/productos/" },
  { label: "AIR Cloud" },
];

/* --------------------------------------------------------------------------
 * S1 · fila 1 — hero (hero-software.spec.md)
 * ------------------------------------------------------------------------ */

export const HERO = {
  /** el `<p>` de 50px/fw800: es el titular VISUAL, el h1 va debajo a 23px */
  kicker: "Kunak AIR Cloud",
  h1: "Software de medición de la calidad del aire",
  h2: "Analiza datos de forma sencilla y obtén información útil para la toma de decisiones",
  /** línea en versalitas azules bajo el h2 (16px/30.6 fw800 #0075C9) */
  claim: "DATOS EN TIEMPO REAL | SIEMPRE ACTUALIZADO",
  ctaLabel: "Solicita una demo gratuita",
  ctaHref: CONTACT_HREF,
  appCtaLabel: "Descargar app (Android)",
  appCtaHref: "https://play.google.com/store/apps/details?id=com.kunak.kunak",
  image: {
    src: `${U23_02}/industrial-woman-engineer-using-the-cloud.jpg`,
    width: 1024,
    height: 683,
    alt: "medicion calidad aire Kunak AIR Cloud",
  } satisfies SoftwareImage,
} as const;

/* --------------------------------------------------------------------------
 * S1 · fila 2 — Información del producto (info-producto-software.spec.md)
 * ------------------------------------------------------------------------ */

export const INFO = {
  /** en el original es un `<p>` de 44px/55, no un h2 */
  heading: "Información del producto",
  imagen: {
    src: `${U23_04}/kunak-cloud-dispositivos.png`,
    width: 626,
    height: 800,
    alt: "software kunak Air",
  } satisfies SoftwareImage,
  videoCtaLabel: "Ver vídeo del producto",
  /** URL real del player, capturada abriendo el lightbox el 2026-07-27 */
  videoYoutubeId: "sRLe65Enlbs",
  videoTitle: "Kunak Cloud 2.2.0 release - Air quality software - New features",
} as const;

/** Titulares azules de 37px de la columna 2/3, con su bajada de 17pt. */
export const INFO_BLOQUE_1 = {
  heading: "Software de control de calidad del aire",
  lead: "Visualiza y analiza los datos recopilados por la red de sensores.",
} as const;

export const INFO_BLOQUE_2 = {
  heading: "Software de contaminación atmosférica",
  lead: "Analiza y entiende cómo se comporta la contaminación.",
} as const;

/** 1er párrafo tras el bloque 1. */
export const INFO_PARRAFO_INTRO =
  "Kunak AIR Cloud es un software de medición de calidad del aire con un análisis sencillo de datos que facilita la toma de decisiones. Accede en tiempo real a los datos recogidos por la red de sensores que te permitirán tomar decisiones que ayuden a mejorar la calidad del aire del entorno y proteger la salud de las personas.";

/** 2º párrafo: el original marca "completa suite" con un `<b>`. */
export const INFO_PARRAFO_SUITE = {
  antes:
    "La plataforma web Kunak AIR Cloud ofrece a los profesionales una nueva forma de operar la red, gestionar los dispositivos, configurar alarmas, calibrar y realizar operaciones de campo de forma remota, así como de disponer una ",
  negrita: "completa suite",
  despues: " para el análisis de los datos de calidad del aire.",
} as const;

/** Frase azul suelta entre los dos párrafos (22.67px = 17pt). */
export const INFO_LEAD_HERRAMIENTAS =
  "Elige las herramientas que necesites para tu proyecto.";

export const INFO_PARRAFO_MODULAR =
  "Kunak AIR Cloud es un software modular y flexible diseñado para facilitar la gestión de las cuentas de los usuarios, el manejo sencillo de la red, el análisis y la validación intuitiva de los datos y la generación de informes de forma rápida e intuitiva.";

export const INFO_CARACTERISTICAS_LABEL = "Características:";

export const INFO_LEAD_CARRUSEL =
  "Gracias a nuestro software de medición de calidad del aire, podrás:";

/* --------------------------------------------------------------------------
 * 6 características del hero — bloque repetible
 * ------------------------------------------------------------------------ */

export const CARACTERISTICAS: Caracteristica[] = [
  { icono: `${U23_02}/cloud-based-1.svg`, titulo: "Basado en la nube" },
  { icono: `${U23_02}/reliable-data.svg`, titulo: "Datos fiables garantizados" },
  { icono: `${U23_02}/flexible-scalable-1.svg`, titulo: "Flexible y escalable" },
  { icono: `${U23_02}/multiple-users.svg`, titulo: "Múltiples usuarios" },
  { icono: `${U23_02}/data-integration.svg`, titulo: "Integración de datos de fuentes externas" },
  { icono: `${U23_02}/advanced-tools.svg`, titulo: "Herramientas avanzadas" },
];

/* --------------------------------------------------------------------------
 * 9 diapositivas del carrusel — bloque repetible (carrusel-capturas.spec.md)
 * ------------------------------------------------------------------------ */

export const DIAPOSITIVAS: Diapositiva[] = [
  { titulo: "Identificar los puntos conflictivos", imagen: `${U23_02}/hotspots-detection.jpg` },
  {
    titulo: "Caracterizar las fuentes de contaminación",
    imagen: `${U23_02}/pollution-sources-identification.jpg`,
  },
  { titulo: "Detectar posibles fugas", imagen: `${U23_02}/leakage-detection.jpg` },
  {
    titulo: "Analizar el tamaño de las partículas y su distribución",
    imagen: `${U23_02}/particle-size-analysis.jpg`,
  },
  { titulo: "Gestionar la red de sensores", imagen: `${U23_02}/control-panel.jpg` },
  { titulo: "Realizar análisis multiparamétricos", imagen: `${U23_02}/multiparametric-analysis.jpg` },
  {
    titulo: "Registrar las tareas de mantenimiento en sus dispositivos (GMAO)",
    imagen: `${U23_02}/cmms.jpg`,
  },
  {
    titulo: "Acceder al registro de alarmas y su trazabilidad",
    imagen: `${U23_02}/alarms-traceability.jpg`,
  },
  {
    titulo: "Validar datos y crear informes personalizados",
    imagen: `${U23_02}/customised-reports.jpg`,
  },
];

/** Ciclo medido en vivo: 6000 ms por diapositiva (5 s de reposo + 1 s de fundido). */
export const CARRUSEL_INTERVALO_MS = 6000;
export const CARRUSEL_FUNDIDO_MS = 1000;

/** Párrafo de cierre de la columna 2/3, con un enlace inline a /es/soluciones/. */
export const INFO_CIERRE = {
  antes: "Nuestro software de monitorización de la calidad del aire es el complemento perfecto para obtener el máximo potencial de las ",
  enlaceLabel: "estaciones Kunak AIR",
  enlaceHref: "https://kunakair.com/es/soluciones/",
  despues: " y las redes de monitorización de la contaminación del aire.",
} as const;

/* --------------------------------------------------------------------------
 * S2 · CTA de ancho completo (et_pb_fullwidth_slider de 1 diapositiva)
 * ------------------------------------------------------------------------ */

export const S2 = {
  image: `${U23_01}/urban-1500.jpg`,
  heading:
    "Una completa suite de herramientas para sacar el máximo partido a los datos de calidad del aire",
  headingHref: CONTACT_HREF,
  buttonLabel: "Solicita una demo gratuita",
  buttonHref: CONTACT_HREF,
} as const;

/* --------------------------------------------------------------------------
 * S3 · anclas de la columna 1/4 + sus 2 CTAs
 * ------------------------------------------------------------------------ */

export const ANCLAS = [
  { id: "beneficios", label: "Beneficios" },
  { id: "herramientas", label: "Herramientas" },
  { id: "case-studies", label: "Casos de éxito" },
];

export const ANCLAS_CTAS = [
  { label: "Solicita más información", href: CONTACT_HREF },
  { label: "Descarga el catálogo", href: CATALOG_HREF },
];

/* --------------------------------------------------------------------------
 * 9 beneficios — bloque repetible (lista-beneficios.spec.md)
 * ------------------------------------------------------------------------ */

export const BENEFICIOS: Beneficio[] = [
  {
    icono: `${U23_02}/secure-confidential.svg`,
    titulo: "Seguro y confidencial",
    descripcion:
      "Fortalece la seguridad gracias a los protocolos HTTPS/SSL. La confidencialidad y la propiedad de los datos están garantizadas por el EULA.",
  },
  {
    icono: `${U23_02}/continuous-updates.svg`,
    titulo: "Actualizaciones continuas gratuitas",
    descripcion:
      "Disfruta de actualizaciones continuas de cualquier nueva herramienta o funcionalidad de forma inmediata sin coste adicional.",
  },
  {
    icono: `${U23_02}/reports.svg`,
    titulo: "Informes de calidad del aire",
    descripcion:
      "Genera informes personalizados para mostrar los datos de la calidad del aire en diferentes formatos para compartirlos con terceros.",
  },
  {
    icono: `${U23_02}/automatic-supervision-1.svg`,
    titulo: "Supervisión automática",
    descripcion:
      "Supervisa el estado de sus estaciones y sensores a distancia y solucione los problemas gracias al sistema de alarmas automáticas con consejos para su solución.",
  },
  {
    // mismo icono que la característica #2 del hero; no es un error de extracción
    icono: `${U23_02}/reliable-data.svg`,
    titulo: "Datos fiables garantizados",
    descripcion:
      "Asegura disponer de datos fiables gracias a la invalidación automática de los datos. Extrae el máximo beneficio de los algoritmos avanzados para el etiquetado automático de los datos.",
  },
  {
    icono: `${U23_02}/pollution-sources.svg`,
    titulo: "Identificación de fuentes de contaminación y puntos calientes",
    descripcion:
      "Accede a potentes herramientas de calidad del aire y visualización avanzada de datos sobre el mapa.",
  },
  {
    icono: `${U23_02}/remote-troubleshooting.svg`,
    titulo: "Asistencia remota",
    descripcion:
      "Mantén, diagnóstica y resuelve problemas a distancia. Benefíciate de la asistencia remota de nuestro equipo de profesionales.",
  },
  {
    icono: `${U23_02}/data-sharing.svg`,
    titulo: "Simple intercambio e integración de datos",
    descripcion:
      "Comparte los datos recogidos a través de la API o expórtalos en diferentes formatos. Integra datos de dispositivos de terceros.",
  },
  {
    icono: `${U23_02}/public-aq-data.svg`,
    titulo: "Datos sobre la calidad del aire públicos",
    descripcion:
      "Crea páginas web públicas y widgets para compartir los datos sobre la calidad del aire con tus clientes o el público de interés.",
  },
];

/* --------------------------------------------------------------------------
 * 16 herramientas — bloque repetible (rejilla-herramientas.spec.md)
 * ------------------------------------------------------------------------ */

/** Todas las capturas son 1800×1200 (ratio 3:2). */
const captura = (file: string, titulo: string): SoftwareImage => ({
  src: file,
  width: 1800,
  height: 1200,
  alt: `Captura de ${titulo} en Kunak AIR Cloud`,
});

export const HERRAMIENTAS: Herramienta[] = [
  {
    titulo: "Panel de control",
    descripcion:
      "Revisa el estado de tus dispositivos y visualiza fácilmente datos fiables en tiempo real gracias al etiquetado automático de los datos.",
    captura: captura(`${U23_03}/Control-panel.jpg`, "Panel de control"),
  },
  {
    titulo: "Dashboard",
    descripcion: "Consulta tus dispositivos en un mapa, su estado y las últimas mediciones.",
    captura: captura(`${U23_03}/Dashboard.jpg`, "Dashboard"),
  },
  {
    // sic: errata del original (la herramienta #11 sí escribe "Analíticas")
    titulo: "Análíticas básicas",
    descripcion:
      "Visualización de datos estándar, cálculos de medias horarias/diarias y estadísticas básicas.",
    captura: captura(`${U23_03}/Basic-data-analytics.jpg`, "Analíticas básicas"),
  },
  {
    titulo: "Índice de calidad del aire",
    descripcion: "Herramienta de ICA según diferentes escalas: UE, US EPA, España, India, etc.",
    captura: captura(`${U23_03}/AQI.jpg`, "Índice de calidad del aire"),
  },
  {
    titulo: "Invalidación automática",
    descripcion:
      "Preinvalidación automática de los datos en caso de mal funcionamiento de los sensores.",
    captura: captura(`${U23_03}/Automatic-data-invalidation.jpg`, "Invalidación automática"),
  },
  {
    titulo: "Sistema de alertas",
    descripcion: "Configuración remota de avisos por superación de umbrales.",
    captura: captura(`${U23_03}/Alert-system.jpg`, "Sistema de alertas"),
  },
  {
    titulo: "Detección de errores",
    descripcion:
      "Detección automática de errores, anomalías y descalibraciones, notificándolos y proponiendo consejos para solucionar el problema.",
    captura: captura(`${U23_03}/Error-detection.jpg`, "Detección de errores"),
  },
  {
    titulo: "GMAO",
    descripcion:
      "Un sistema informatizado de gestión del mantenimiento que centraliza la información y facilita los trabajos realizados sobre la red.",
    captura: captura(`${U23_03}/CMMS.jpg`, "GMAO"),
  },
  {
    titulo: "Ubicaciones",
    descripcion:
      "Gestione los datos de calidad del aire mediante la asignación de ubicaciones de los dispositivos a puntos específicos.",
    captura: captura(`${U23_03}/Locations-log.jpg`, "Ubicaciones"),
  },
  {
    titulo: "Validación de datos",
    descripcion:
      "Validación de datos manual y sencilla para limpiar conjuntos de datos y realizar análisis avanzados con datos fiables.",
    captura: captura(`${U23_03}/Data-invalidation-tool.jpg`, "Validación de datos"),
  },
  {
    titulo: "Analíticas avanzadas",
    descripcion:
      "Análisis avanzado de la suite OpenAir como cálculo de estadísticas básicas, gráficos temporales de contaminantes, variación temporal, gráficas de viento y muchos más.",
    captura: captura(`${U23_03}/Advanced-data-analytics.jpg`, "Analíticas avanzadas"),
  },
  {
    titulo: "Fuentes externas",
    descripcion:
      "Integración de otras fuentes de datos en tiempo real o mediante la importación de archivos.",
    captura: captura(`${U23_03}/External-data-integration.jpg`, "Fuentes externas"),
  },
  {
    titulo: "Informes personalizados",
    descripcion:
      "Creación sencilla de informes de calidad del aire de forma automática de un dispositivo y/o de toda una red.",
    captura: captura(`${U23_03}/Custom-reports.jpg`, "Informes personalizados"),
  },
  {
    titulo: "Mapas de calor",
    descripcion:
      "Identificar los puntos calientes (hotspots) en una zona y mapas de calor variables para conocer su evolución en el tiempo.",
    // el mismo archivo que el fondo de la diapositiva 0 del carrusel
    captura: captura(`${U23_02}/hotspots-detection.jpg`, "Mapas de calor"),
  },
  {
    titulo: "Origen de la contaminación",
    descripcion:
      "Detección de fuentes de contaminación mediante rosas de contaminación y gráficos polares directamente en el mapa.",
    captura: captura(`${U23_03}/Pollution-source-detection.jpg`, "Origen de la contaminación"),
  },
  {
    titulo: "Recuento de partículas",
    descripcion:
      "Herramienta de análisis del tamaño de las partículas que incluye gráficos de distribución de tamaños por masa y por recuentos.",
    captura: captura(`${U23_03}/Particle-count.jpg`, "Recuento de partículas"),
  },
];

/* --------------------------------------------------------------------------
 * Casos de éxito y artículos
 * ------------------------------------------------------------------------ */

/** Los 3 mismos casos que la home y /monitor-calidad-aire (verificado en el DOM). */
export const CASOS: CaseStudy[] = PROJECTS;

/**
 * "Artículos y Guías" — el original SORTEA los 3 posts en cada carga (mismo
 * comportamiento que /monitor-calidad-aire y /accesorios, pendiente P4). Aquí
 * va congelado el set capturado el 2026-07-27; no es comparable px a px.
 */
export const SOFTWARE_ARTICLES: BlogPost[] = [
  {
    title: "Control de las emisiones industriales: soluciones para un futuro más limpio",
    date: "Jul 27, 2022",
    image: "/images/uploads/2022/07/control-de-emisiones-industriales.jpg",
    href: "https://kunakair.com/es/control-emisiones-industriales/",
  },
  {
    title: "La contaminación del aire: el asesino silencioso de Europa",
    date: "Dic 13, 2024",
    image:
      "/images/uploads/2024/12/Air-Pollution-Europes-Silent-Killer-and-the-Call-for-Cleaner-Air-1024x683.jpg",
    href: "https://kunakair.com/es/la-contaminacion-del-aire-el-asesino-silencioso-de-europa/",
  },
  {
    title:
      "Impacto ambiental del acero en la calidad del aire, deteriorando las condiciones atmosféricas",
    date: "Oct 29, 2024",
    image: "/images/uploads/2024/10/lamina-acero-1024x683.jpg",
    href: "https://kunakair.com/es/impacto-ambiental-del-acero-en-la-calidad-del-aire/",
  },
];
