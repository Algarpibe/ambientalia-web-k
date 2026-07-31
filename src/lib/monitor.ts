/**
 * Datos de la página /monitor-calidad-aire (Kunak AIR Pro).
 * Specs: docs/research/monitor-calidad-aire/components/*.spec.md
 */
import type { ReactNode } from "react";
import type { AccesorioItem, BlogPost } from "@/types/kunak";

/* --- Visor 360° del hero: 35 frames kunak360_IMG_01..35.jpg (2023/03) --- */
export const FRAMES_360: string[] = Array.from({ length: 35 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/images/uploads/2023/03/kunak360_IMG_${n}.jpg`;
});

/* --- 6 logos validadores (hero + info), cada uno enlaza a su estudio ---
 * Orden y hrefs verbatim de hero-producto.spec.md §logos. */
export interface ValidatorLogo {
  title: string;
  src: string;
  href: string;
  /** ancho en px; 0 = 100% de la celda */
  width: number;
}

export const VALIDATOR_LOGOS: ValidatorLogo[] = [
  {
    title: "US EPA",
    src: "/images/uploads/2023/02/US-EPA-united-states-environmental-protection-agency-1.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf",
    width: 120,
  },
  {
    title: "MCERTS",
    src: "/images/uploads/2023/01/Mcerts.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf",
    width: 100,
  },
  {
    title: "AirParif",
    src: "/images/uploads/2023/01/airparif.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf",
    width: 0,
  },
  {
    title: "AQ-SPEC",
    src: "/images/uploads/2023/01/AQ-SPEC.svg",
    href: "https://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/kunak-air-pro---field-evaluation.pdf",
    width: 100,
  },
  {
    title: "SEDEMA CDMX",
    src: "/images/uploads/2023/05/SEDEMA_CDMX.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/SEDEMA_2b_Evaluacion_Sensores_CDMX_2022.pdf",
    width: 100,
  },
  {
    title: "Ricardo",
    src: "/images/uploads/2023/04/Ricardo_logo.svg",
    href: "https://kunakair.com/doc/09.StudiesReferences/Independent_studies/Ricardo_Kunak_Air_Pro_Sensor_report_summary.html",
    width: 100,
  },
];

/* --- Checklist de 6 iconos (info · col derecha) --- */
export interface ChecklistItem {
  icon: string;
  label: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { icon: "/images/uploads/2023/02/cartridge-system.svg", label: "Sistema plug & play de cartuchos" },
  { icon: "/images/uploads/2023/02/multi-pollutant-1.svg", label: "Hasta 16 contaminantes. Combina 5" },
  { icon: "/images/uploads/2023/02/accuracy.svg", label: "Precisión demostrada (EPA, MCERTS, Airlab, CEN/TS 17660)" },
  { icon: "/images/uploads/2023/02/high-reliability.svg", label: "Trazable respecto a normas de referencia" },
  { icon: "/images/uploads/2023/02/easy-fast-installation.svg", label: "Mantenimiento sencillo y remoto" },
  { icon: "/images/uploads/2023/01/IconosAirLite_Mesa-de-trabajo-1-copia-4.svg", label: "Funcionamiento autónomo" },
];

/* --- 16 chips de contaminantes (info · col derecha) ---
 * Cada label se compone de segmentos para poder pintar los subíndices con
 * <sub>. hrefs = grid "Cartuchos inteligentes" del mega-menú (B8). */
export interface ChipSeg {
  t: string;
  sub?: boolean;
}
export interface ContaminantChip {
  /** texto plano para aria-label/title */
  label: string;
  segs: ChipSeg[];
  href: string;
}

const C = "https://kunakair.com/es/cartuchos-inteligentes";

export const CONTAMINANT_CHIPS: ContaminantChip[] = [
  { label: "CO", segs: [{ t: "CO" }], href: `${C}/monoxido-de-carbono/` },
  { label: "NO", segs: [{ t: "NO" }], href: `${C}/oxido-nitrico/` },
  { label: "NO2", segs: [{ t: "NO" }, { t: "2", sub: true }], href: `${C}/dioxido-de-nitrogeno/` },
  { label: "O3", segs: [{ t: "O" }, { t: "3", sub: true }], href: `${C}/ozono/` },
  { label: "SO2", segs: [{ t: "SO" }, { t: "2", sub: true }], href: `${C}/dioxido-de-azufre/` },
  { label: "H2S", segs: [{ t: "H" }, { t: "2", sub: true }, { t: "S" }], href: `${C}/sulfuro-de-hidrogeno/` },
  { label: "CO2", segs: [{ t: "CO" }, { t: "2", sub: true }], href: `${C}/dioxido-de-carbono/` },
  { label: "CH4", segs: [{ t: "CH" }, { t: "4", sub: true }], href: "https://kunakair.com/es/sensor-de-calidad-del-aire/metano/" },
  { label: "COV", segs: [{ t: "COV" }], href: `${C}/compuestos-organicos-volatiles/` },
  { label: "NMHC", segs: [{ t: "NMHC" }], href: `${C}/hidrocarburos-no-metanicos/` },
  { label: "NH3", segs: [{ t: "NH" }, { t: "3", sub: true }], href: `${C}/amoniaco/` },
  { label: "HCl", segs: [{ t: "HCl" }], href: `${C}/cloruro-de-hidrogeno/` },
  { label: "HCN", segs: [{ t: "HCN" }], href: `${C}/cianuro-de-hidrogeno/` },
  { label: "HF", segs: [{ t: "HF" }], href: `${C}/fluoruro-de-hidrogeno/` },
  {
    label: "Cl2 – ClO2",
    segs: [{ t: "Cl" }, { t: "2", sub: true }, { t: " – ClO" }, { t: "2", sub: true }],
    href: `${C}/cloro-dioxido-de-cloro/`,
  },
  { label: "O2", segs: [{ t: "O" }, { t: "2", sub: true }], href: `${C}/oxigeno/` },
];

/* --- Sub-nav de anclas (S3 · columna izquierda sticky) --- */
export interface AnchorLink {
  label: string;
  id: string;
}

export const ANCHOR_LINKS: AnchorLink[] = [
  { label: "Beneficios", id: "benefits" },
  { label: "Aplicaciones", id: "applications" },
  { label: "Software", id: "software" },
  { label: "Especificaciones", id: "specifications" },
  { label: "Ensayos y pruebas", id: "trials-test" },
  { label: "Casos de éxito", id: "case-studies" },
  { label: "Paquetes de energía", id: "power-packs" },
  { label: "Sondas meteorológicas", id: "meteo-sensors" },
];

/* Enlaces reutilizados en varios CTAs de la página */
export const DATASHEET_PDF = "https://kunakair.com/doc/External/Kunak_AIR_Datasheet_ES.pdf";
export const CONTACT_HREF = "https://kunakair.com/es/contacto/";
export const CATALOG_HREF = "https://kunakair.com/es/descarga-catalogo/";

/* =========================================================================
 * GRUPO B — datos de las 3 secciones nuevas de S3
 * Specs: docs/research/monitor-calidad-aire/components/{beneficios,
 *        especificaciones,galeria-ensayos}.spec.md
 * ========================================================================= */

/* --- #benefits: grid 3×3 de icon-blurbs (≠ Beneficios de la home) --- */
export interface BenefitItem {
  icon: string;
  title: string;
  text: string;
}

export const BENEFITS_ITEMS: BenefitItem[] = [
  { icon: "/images/uploads/2023/02/easy-fast-installation.svg", title: "Instalación sencilla y rápida", text: "Instala la estación en menos de 10′ con diagnóstico visual en pantalla." },
  { icon: "/images/uploads/2023/02/cartridge-system.svg", title: "Sistema de cartuchos", text: "Sustituye y combina los cartuchos mediante sistema plug & play." },
  { icon: "/images/uploads/2023/02/accuracy.svg", title: "Precisión probada", text: "Adquiere el sistema más fiable y preciso del mercado." },
  { icon: "/images/uploads/2023/02/easy-calibration.svg", title: "Calibración sencilla", text: "Calibra todo el rango de medida solo con dos puntos." },
  { icon: "/images/uploads/2023/02/cloud-platform.svg", title: "Plataforma cloud de calidad del aire", text: "Visualiza, analiza y gestiona tu red de equipos y tus datos en la nube." },
  { icon: "/images/uploads/2023/02/multi-pollutant-1.svg", title: "Múltiples contaminantes", text: "Aprovecha su capacidad para medir hasta 5 gases y partículas a la vez." },
  { icon: "/images/uploads/2023/01/IconosAirLite_Mesa-de-trabajo-1-copia-4.svg", title: "Totalmente autónomo", text: "Funcionamiento autónomo gracias a su batería integrada y a su panel solar." },
  { icon: "/images/uploads/2023/02/real-time.svg", title: "Datos en tiempo real", text: "Accede a tus datos y alarmas en tiempo real." },
  { icon: "/images/uploads/2023/02/additional-probes.svg", title: "Sensores adicionales", text: "Conecta sondas como sensores de viento, lluvia, ruido, etc." },
];

/* --- #specifications: 15 filas (label + valor multilínea) + sellos --- */
export interface SpecRow {
  label: string;
  /** líneas del valor (>1 = varias líneas separadas por <br> en el original) */
  value: string[];
}

export const SPEC_ROWS: SpecRow[] = [
  { label: "Dimensiones / Peso", value: ["257 x 270 x 225 mm / <3,5 kg"] },
  { label: "Carcasa", value: ["PMMA, policarbonato y acero inoxidable"] },
  { label: "Temp. / HR de funcionamiento", value: ["De -40ºC a 60ºC / De 0 a 99% HR"] },
  { label: "Grado de protección IP", value: ["IP65"] },
  { label: "Batería", value: ["Litio 26Ah"] },
  { label: "Alimentación externa", value: ["Cargador 7 – 12 Vdc. o panel solar"] },
  { label: "Autonomía", value: ["24/7 con cargador o panel solar", "9-30 días funcionamiento con batería (dependiendo de la configuración)"] },
  { label: "Consumo energético", value: ["0,08-1,2W (según la configuración)"] },
  { label: "Comunicaciones", value: ["Multibanda 2G/3G/4G, Ethernet y Modbus RTU Esclavo"] },
  { label: "GNSS", value: ["GPS y GLONASS"] },
  { label: "Sensores integrados", value: ["Temp. | Humedad | Presión atmosférica | Punto de rocío"] },
  { label: "Conectores", value: ["#1: Alimentación de 7V a 12V o Ethernet", "#2: Modbus RTU esclavo", "#3: Sonómetro, UV", "#4: WBGT, piranómetro, Modbus RTU maestro", "#5: Anemómetro y pluviómetro", "#Wifi: Sensor de partículas ultrafinas (PUF)"] },
  { label: "Periodos de muestreo", value: ["Desde 10 segundos a un máximo de 24h"] },
  { label: "Periodos de envío", value: ["Desde 5 minutos a un máximo de 24h"] },
  { label: "SIM", value: ["eSIM integrada y soporte SIM adicional"] },
];

export interface CertSeal {
  src: string;
  alt: string;
}

export const CERT_SEALS: CertSeal[] = [
  { src: "/images/uploads/2023/01/certificate-FCC-1.svg", alt: "Certificado FCC" },
  { src: "/images/uploads/2023/01/certificate-CE-1.svg", alt: "Certificado CE" },
  { src: "/images/uploads/2023/01/certificate-rohs.svg", alt: "Certificado RoHS" },
];

/* --- #trials-test: galería de 9 gráficas + enlaces de resultados ---
 * Nombres locales saneados (el original sirve 6 con <sub> codificado que dan
 * 404; se usan las variantes saneadas que sí resuelven — ver spec). */
export interface TrialImage {
  src: string;
  alt: string;
}

export const TRIALS_GALLERY: TrialImage[] = [
  { src: "/images/uploads/2023/09/co_mexico.webp", alt: "CO — co-ubicación en Ciudad de México (México)" },
  { src: "/images/uploads/2023/09/NO_sweden.webp", alt: "NO — co-ubicación en Suecia" },
  { src: "/images/uploads/2023/09/no2_uk.webp", alt: "NO₂ — co-ubicación en Reino Unido" },
  { src: "/images/uploads/2023/09/o3_spain.webp", alt: "O₃ — co-ubicación en España" },
  { src: "/images/uploads/2023/09/so2_france.webp", alt: "SO₂ — co-ubicación en Francia" },
  { src: "/images/uploads/2023/09/h2s_spain.webp", alt: "H₂S — co-ubicación en España" },
  { src: "/images/uploads/2023/09/pm10_belgium.webp", alt: "PM₁₀ — co-ubicación en Bélgica" },
  { src: "/images/uploads/2023/09/pm25_belgium.webp", alt: "PM₂,₅ — co-ubicación en Bélgica" },
  { src: "/images/uploads/2023/01/co2_glasgow.jpg", alt: "CO₂ — co-ubicación en Glasgow" },
];

/** Enlace de resultado (chip con subíndice + PDF del estudio por contaminante). */
export interface TrialResult {
  label: string;
  segs: ChipSeg[];
  href: string;
}

const RD = "https://kunakair.com/doc/External/";

// hrefs saneados (los verbatim con <sub> codificado dan 404 en el original).
export const TRIALS_RESULTS: TrialResult[] = [
  { label: "CO", segs: [{ t: "CO" }], href: `${RD}Kunak_AIR_Co-location_test_CO.pdf` },
  { label: "NO", segs: [{ t: "NO" }], href: `${RD}Kunak_AIR_Pro_Co-location_test_NO.pdf` },
  { label: "NO2", segs: [{ t: "NO" }, { t: "2", sub: true }], href: `${RD}Kunak_AIR_Pro_Co-location_test_NO2.pdf` },
  { label: "O3", segs: [{ t: "O" }, { t: "3", sub: true }], href: `${RD}Kunak_AIR_Pro_Co-location_test_O3.pdf` },
  { label: "SO2", segs: [{ t: "SO" }, { t: "2", sub: true }], href: `${RD}Kunak_AIR_Pro_Co-location_test_SO2.pdf` },
  { label: "H2S", segs: [{ t: "H" }, { t: "2", sub: true }, { t: "S" }], href: `${RD}Kunak_AIR_Pro_Co-location_test_H2S.pdf` },
  { label: "CO2", segs: [{ t: "CO" }, { t: "2", sub: true }], href: `${RD}Kunak_AIR_Pro_Co-location_test_CO2.pdf` },
  { label: "PM", segs: [{ t: "PM" }], href: `${RD}Kunak_AIR_Pro_Co-location_test_PM.pdf` },
];

export const CO_LOCATION_FULL_PDF = `${RD}Kunak_AIR_Pro_Co-location_tests.pdf`;
export const PRECISION_HELP_HREF =
  "https://kunakair.com/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision/";

/* --- #software: 4 párrafos con enlaces inline + botón outline ---
 * Spec: docs/research/monitor-calidad-aire/components/software.spec.md
 * ⚠️ El bloque NO lleva capturas: es texto puro + botón (corrige PAGE_TOPOLOGY). */

/** Trozo de párrafo: texto plano, o enlace inline si lleva `href`. */
export interface ParaSeg {
  t: string;
  href?: string;
}

// Regla del proyecto: los destinos que YA están clonados van a RUTA LOCAL (sin
// barra final: `trailingSlash` no está activado); el resto sigue apuntando al
// original hasta que se clone. La misma que aplican `nav.ts`, `footer.ts`,
// `products.ts` y `lib/api.ts`.
//
// Los TRES enlaces de este bloque ya están localizados (2026-07-28). Sus hrefs
// en el original, por si hay que rehacer la comparación:
//   · Kunak AIR Cloud → `https://kunakair.com/software-medicion-calidad-del-aire/`
//     (sic: SIN el prefijo /es/; responde 301 a /es/software-de-medicion-calidad-del-aire/)
//   · API Rest        → `https://kunakair.com/es/kunak-api/`
//   · "Saber más"     → `https://kunakair.com/software-calidad-aire`
//     (301 a /es/software-de-medicion-calidad-del-aire/ — mismo destino que el
//     primero, con otro slug heredado)
export const SOFTWARE_PARAGRAPHS: ParaSeg[][] = [
  [
    { t: "Analiza todos los datos recogidos por las estaciones Kunak AIR de forma sencilla con nuestro software avanzado de calidad del aire " },
    // ruta local: esta página ya está clonada (src/app/software-de-medicion-calidad-del-aire)
    { t: "Kunak AIR Cloud", href: "/software-de-medicion-calidad-del-aire" },
    { t: " y genera informes que te faciliten la toma de decisiones. " },
  ],
  [
    { t: "Además, podrás configurar los dispositivos desplegados y disponer de un sistema de alarmas que te facilitará la operación y mantenimiento remoto de la red de una forma sencilla." },
  ],
  [
    { t: "Integra los datos recopilados por la red y almacenados por el servidor en plataformas de calidad del aire públicas o en aplicaciones de terceros a través de la potente " },
    // ruta local: esta página ya está clonada (src/app/kunak-api)
    { t: "API Rest", href: "/kunak-api" },
    { t: "." },
  ],
  [
    { t: "Si lo necesitas, la API también te permite integrar datos de fuentes externas que complementen la información que te proporciona la red de monitorización y así analizarás todos los datos en una única plataforma." },
  ],
];

// ruta local: esta página ya está clonada (src/app/software-de-medicion-calidad-del-aire)
export const SOFTWARE_MORE_HREF = "/software-de-medicion-calidad-del-aire";

/** Helper de tipografía usado por varias secciones (evita re-declararlo). */
export type WithChildren = { children: ReactNode };

/* =========================================================================
 * GRUPO C — sondas meteorológicas (S3 · #meteo-sensors) + FAQ (S5)
 * Specs: docs/research/monitor-calidad-aire/components/{sondas-meteorologicas,
 *        faq}.spec.md
 * ========================================================================= */

/* --- #meteo-sensors: 6 sondas (shortcode `lista-contenido`, variante
 * accesorios; el 1º arranca activo). Textos verbatim del original, typos
 * incluidos: "Anenómetro" (#2) y "de energía de energía" (#6). --- */
// Ruta LOCAL: /accesorios ya está clonada y define los 11 slugs (los 9 que se
// enlazan desde aquí, incluidos). Los "Ver más" resuelven dentro del clon; el
// aterrizaje del ancla lo cubre el `scroll-mt-[80px]` de `AccesorioCard`.
// Sin barra final: `trailingSlash` no está activado en next.config.
const ACC = "/accesorios";
const U12 = "/images/uploads/2022/12";

export const METEO_SENSORS: AccesorioItem[] = [
  {
    id: "anemometro-mecanico",
    label: "Anemómetro Mecánico",
    intro: "Incluye sensores de velocidad y de dirección del viento.",
    image: `${U12}/kunak_IMG_0047-copia-300x300-1-300x300.jpg`,
    href: `${ACC}#anemometro-mecanico`,
  },
  {
    id: "anemometro-ultrasonico",
    label: "Anenómetro Ultrasónico",
    intro: "Incluye sensores de velocidad y de dirección del viento.",
    image: `${U12}/kunak_IMG_0061-copia-300X300-300x300.jpg`,
    href: `${ACC}#anemometro-ultrasonico`,
  },
  {
    id: "pluviometro",
    label: "Pluviómetro",
    intro:
      "Gracias a su gran fiabilidad, fácil mantenimiento y limpieza sencilla, ofrece aplicaciones en todos los climas.",
    image: `${U12}/rain-gauge-300x300.jpg`,
    href: `${ACC}#pluviometro`,
  },
  {
    id: "piranometro",
    label: "Piranómetro",
    intro:
      "El piranómetro mide la radiación solar mediante una termopila ennegrecida de alta calidad protegida por una cúpula.",
    image: `${U12}/pyranometer-300x300.jpg`,
    href: `${ACC}#piranometro`,
  },
  {
    id: "termometro-de-globo-y-de-bulbo-humedo-wbgt",
    label: "Termómetro de globo y de bulbo húmedo (WBGT)",
    intro:
      "El termómetro de globo y de bulbo húmedo (WBGT) mide el estrés térmico bajo la luz solar directa, teniendo en cuenta la temperatura, la humedad, la velocidad del viento (sensación térmica) y la radiación solar.",
    image: `${U12}/WBGT-300x300-1-300x300.jpg`,
    href: `${ACC}#termometro-de-globo-y-de-bulbo-humedo-wbgt`,
  },
  {
    id: "sensor-ultravioleta-a",
    label: "Sensor Ultravioleta-A",
    intro:
      "Estos sensores UV-A detectan la radiación UV de 300 a 400 nm y están calibrados en unidades de densidad de flujo de energía de energía en vatios por metro cuadrado.",
    image: `${U12}/apogee-su-202-ultraviolet-A-sensor-300x163.jpg`,
    href: `${ACC}#sensor-ultravioleta-a`,
  },
];

/* --- S5: 19 preguntas frecuentes (acordeón de toggles independientes) --- */

/** Trozo de párrafo de una respuesta. */
export interface FaqSeg {
  t: string;
  /** renderiza `t` como <sub> (solo la pregunta 17: PM₁, PM₂,₅, PM₁₀) */
  sub?: boolean;
  /** inserta un <br/> ANTES de este segmento (solo la pregunta 12) */
  br?: boolean;
  /** enlace inline (solo la pregunta 19: "catálogo") */
  href?: string;
}

/** Bloque de una respuesta: párrafo o lista con viñeta azul. */
export type FaqBlock = { type: "p"; segs: FaqSeg[] } | { type: "ul"; items: string[] };

export interface FaqItem {
  q: string;
  a: FaqBlock[];
}

/** Atajo para el caso común: respuesta de párrafos de texto plano. */
const ps = (...texts: string[]): FaqBlock[] => texts.map((t) => ({ type: "p", segs: [{ t }] }));

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "¿Los equipos Kunak son certificados ATEX?",
    a: ps(
      "Los equipos Kunak están diseñados para el monitoreo perimetral de emisiones difusas o detección de fugas en zonas no clasificadas como ATEX.",
      "Pueden adaptarse para operar en entornos con riesgo de explosión cumpliendo los requisitos de la Zona 1 ATEX, siempre que se configure el sistema adecuadamente.",
    ),
  },
  {
    q: "¿Qué área cubre cada dispositivo?",
    a: ps(
      "En cuanto al alcance del dispositivo, es importante tener en cuenta que los equipos Kunak realizan mediciones puntuales (point measurement). No existe un “radio” de alcance, es decir, miden la concentración en el punto donde están instalados. La representatividad espacial que pueda tener esa medición depende de múltiples factores como la orografía, las fuentes emisoras cercanas y las condiciones meteorológicas.",
    ),
  },
  {
    q: "¿Cada cuánto tiempo se reemplazan los cartuchos y se renueva el software?",
    a: ps(
      "La vida útil de los cartuchos depende del tipo de sensor y las condiciones ambientales, con un rango estimado de entre 12 y 36 meses. Puede consultarse más información en la página correspondiente del catálogo.",
      "Los servicios en la nube (Kunak Cloud) se renuevan anualmente para mantener las funciones de análisis, calibración y trazabilidad actualizadas.",
    ),
  },
  {
    // El original arrastra un <span data-sheets-root="1"> mal anidado que cruza
    // los dos <p> (artefacto de pegado desde Sheets). No se replica.
    q: "¿El equipo es portátil o fijo?",
    a: ps(
      "Los equipos Kunak pueden instalarse en farolas, paredes, mástiles o trípodes.",
      "Gracias a su diseño ligero y modular, es posible reubicarlos fácilmente retirando la base y fijándolos en otro punto de la instalación.",
    ),
  },
  {
    q: "¿Cada cuánto se calibra el equipo?",
    a: ps(
      "Los sensores se entregan calibrados de fábrica con certificado oficial de calibración.",
      "Para mantener la precisión de las mediciones, se recomienda realizar una calibración o ajuste remoto cada tres meses, o bien tras un cambio de ubicación o de estación del año.",
    ),
  },
  {
    q: "¿Qué opciones de calibración existen?",
    a: [
      { type: "p", segs: [{ t: "La calibración puede hacerse mediante tres métodos:" }] },
      {
        type: "ul",
        items: [
          "co-locación con una estación de referencia",
          "campana de gas (gashood) con botellas patrón",
          "ajuste remoto utilizando datos históricos para corregir la línea base",
        ],
      },
      {
        type: "p",
        segs: [{ t: "La elección dependerá de las necesidades del proyecto y del presupuesto disponible." }],
      },
    ],
  },
  {
    q: "¿Se pueden obtener los datos en local (Modbus)?",
    a: ps(
      "Sí. Todos los equipos Kunak incorporan el protocolo Modbus RTU RSxx, que permite la transmisión y lectura local de datos sin depender de la conexión a Internet.",
    ),
  },
  {
    q: "¿Cómo se comunica el equipo?",
    a: ps(
      "El sistema puede enviar datos mediante conexión celular (4G/3G), Ethernet, Wi-Fi o Modbus, adaptándose a las infraestructuras de red disponibles en cada emplazamiento.",
    ),
  },
  {
    q: "¿Cuál es la duración de la batería?",
    a: ps(
      "Los equipos incluyen una batería interna de respaldo con una autonomía de entre 3 y 30 días, dependiendo de la configuración y del tipo de sensor activo.",
    ),
  },
  {
    q: "¿A qué altura debe instalarse el equipo?",
    a: ps(
      "Se recomienda una altura de instalación de 3 a 4 metros sobre el suelo, para garantizar representatividad en la medición y evitar interferencias o actos vandálicos.",
    ),
  },
  {
    q: "¿El equipo tiene memoria interna?",
    a: ps(
      "Sí. Dispone de memoria interna de alta velocidad capaz de almacenar los datos hasta 15 días sin conexión a Internet, asegurando la continuidad de los registros.",
    ),
  },
  {
    q: "¿Se pueden conectar sondas meteorológicas?",
    a: [
      {
        type: "p",
        segs: [
          {
            t: "Sí. Kunak AIR Pro admite hasta 6 sondas meteorológicas. Kunak AIR Lite, hasta 2 sondas, según la versión del equipo.",
          },
          {
            t: "Esto permite correlacionar variables ambientales con las concentraciones de contaminantes.",
            br: true,
          },
        ],
      },
    ],
  },
  {
    q: "¿Puedo instalarlo en un vehículo o en un dron para monitoreo en movimiento?",
    a: ps(
      "Sí, siempre que la velocidad no supere los 20 km/h. De este modo se garantiza la estabilidad de la medición y la correcta captura de datos ambientales.",
    ),
  },
  {
    q: "¿Cuenta esta tecnología con certificaciones?",
    a: ps(
      "Los equipos basados en sensores no se rigen por una certificación única. Kunak valida continuamente sus dispositivos en campo junto a organismos independientes.",
      "Estas pruebas garantizan que los datos cumplen con la Directiva Europea de Calidad del Aire y los estándares de la US EPA.",
    ),
  },
  {
    q: "¿Es obligatorio el uso de la plataforma Kunak AIR Cloud?",
    a: ps(
      "Sí. Kunak AIR Cloud es esencial para compensar efectos de temperatura y humedad, ejecutar mantenimiento remoto y autodiagnóstico, corregir la línea base y validar los datos, y asegurar la trazabilidad y fiabilidad de las mediciones.",
    ),
  },
  {
    q: "¿Pueden utilizarse los equipos en interiores?",
    a: ps(
      "Sí. Los equipos pueden utilizarse en entornos industriales, ganaderos o logísticos, ofreciendo un control preciso de los contaminantes también en espacios cerrados.",
    ),
  },
  {
    q: "¿Cuál es la diferencia entre el sensor de partículas del AIR Pro y el AIR Lite?",
    a: [
      {
        type: "p",
        segs: [
          { t: "Kunak AIR Pro: Sensor de 24 canales, certificado MCERTS, mide partículas finas y gruesas (PM" },
          { t: "1", sub: true },
          { t: ", PM" },
          { t: "2.5", sub: true },
          { t: ", PM" },
          { t: "10", sub: true },
          { t: ") y cumple con medidas indicativas." },
        ],
      },
      {
        type: "p",
        segs: [
          {
            t: "Kunak AIR Lite: Sensor de 5 canales, sin certificación MCERTS, especializado en la detección de partículas finas.",
          },
        ],
      },
    ],
  },
  {
    q: "¿Cómo se integran los datos a una tercera plataforma?",
    a: ps(
      "Los datos pueden integrarse automáticamente mediante REST API, Modbus o FTP, facilitando la conexión con plataformas de terceros y sistemas de gestión ambiental o industrial.",
    ),
  },
  {
    q: "¿Cuál es la diferencia entre calibración y corrección?",
    a: [
      {
        type: "ul",
        items: [
          "La calibración ajusta la respuesta del sensor comparando sus datos con una referencia trazable (como una estación de referencia o gas certificado) para determinar su incertidumbre exacta.",
          "La corrección modifica la respuesta del sensor sin referencia externa para reducir errores y compensar la deriva natural, aunque no permite calcular la incertidumbre con precisión.",
        ],
      },
      {
        type: "p",
        segs: [
          {
            t: "En síntesis, la calibración usa una referencia externa y la corrección es un ajuste interno para mantener la fiabilidad del sensor.",
          },
        ],
      },
      {
        type: "p",
        segs: [
          { t: "Más info en la página 35 del " },
          { t: "catálogo", href: CATALOG_HREF },
          { t: "." },
        ],
      },
    ],
  },
];

/* =========================================================================
 * REUTILIZABLES — los 5 ajustes de las secciones compartidas con la home
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md
 * ========================================================================= */

/* --- S2: banner "No se puede mejorar…" (variante texto a la izquierda) ---
 * El título lleva DOBLES espacios en el original (sic; el HTML los colapsa al
 * pintar) y es un enlace a contacto. La cita cierra el párrafo, sin cursiva. */
export const S2_HEADING = "No se puede mejorar  lo que no se puede medir  de forma precisa y fiable";
export const S2_BODY =
  "La calidad de los datos es una cuestión clave; los datos de calidad deficiente o desconocida son menos útiles que la ausencia de datos ya que pueden conducir a decisiones equivocadas. (Snyder et al., 2013)";
export const S2_IMAGE = "/images/uploads/2023/02/hyper-local-scale-data.jpg";

/* --- #applications: banner-guía + popup de descarga --- */
export const GUIA_IMAGE = "/images/uploads/2023/02/people-city-urban.jpg";
export const GUIA_HEADING = "Diseña tu proyecto de calidad del aire";
export const GUIA_BODY =
  "Descarga gratis la guía que hemos diseñado con los aspectos clave que debes tener en cuenta a la hora de diseñar tu proyecto de calidad del aire.";
export const APLICACIONES_CLAIM = "Facilitamos la toma de decisiones con datos ambientales precisos.";

/** Opciones del `<select name="field[51]">` del formulario de la guía. */
export const GUIA_SECTORES: string[] = [
  "Urbano",
  "Minería",
  "Petróleo y Gas",
  "Aguas residuales",
  "Otras industrias",
  "Puertos y Aeropuertos",
  "Construcción",
  "Investigación y consultoría",
  "Obras y Demoliciones",
  "Otros",
];

/* --- #power-packs: 3 accesorios de energía (1º activo) --- */
export const POWER_PACKS: AccesorioItem[] = [
  {
    id: "panel-solar",
    label: "Panel solar",
    intro:
      "El panel solar monocristalino de alta eficiencia de 6,3 voltios es robusto, resistente al agua (IP67) y ha sido diseñado para un uso prolongado en exteriores en cualquier entorno.",
    image: `${U12}/kunak_IMG_0017-300x300-2-300x300.jpg`,
    href: `${ACC}#panel-solar`,
  },
  {
    // sic: la etiqueta va en plural y el data-id en singular
    id: "cargador-para-exteriores",
    label: "Cargadores para exteriores",
    intro:
      "Pequeño, ligero e impermeable y ha sido diseñado para un uso prolongado al aire libre en cualquier entorno. Para utilizar cuando las estaciones Kunak AIR vayan a instalarse en el exterior.",
    image: `${U12}/kunak_IMG_0015-300x300-1-300x300.jpg`,
    href: `${ACC}#cargador-para-exteriores`,
  },
  {
    id: "cargador-para-interiores",
    label: "Cargador para interiores",
    intro:
      "Se dispone de un cargador de interior con enchufes globales para su comprobación y verificación.",
    image: `${U12}/kunak-air-indoor-charger-300x300.jpg`,
    href: `${ACC}#cargador-para-interiores`,
  },
];

/* --- S4: los 3 posts de "Artículos y Guías" ---
 * ⚠️ El original sortea 3 posts distintos en cada carga (módulo de blog con
 * orden aleatorio): se congela el set del snapshot de recon (2026-07-26). */
export const MONITOR_ARTICLES: BlogPost[] = [
  {
    title: "Running for Clean Air: midiendo el impacto de la calidad del aire en el deporte",
    date: "Feb 28, 2025",
    image:
      "/images/uploads/2025/02/Control-de-la-contaminacion-del-aire-en-los-JJOO-de-Paris-2024-Kunak-1024x683.jpg",
    // ruta local: esta página ya está clonada (src/app/[slug]) — grupo A.
    //   original: https://kunakair.com/es/running-for-clean-air/
    href: "/running-for-clean-air",
  },
  {
    title: "Detectores de calidad del aire y movilidad, ¿qué nos cuentan los sistemas de monitorización?",
    date: "Nov 4, 2020",
    image: "/images/uploads/2020/11/detectores-de-calidad-del-aire-trafico-coronavirus.jpg",
    href: "https://kunakair.com/es/detectores-calidad-aire-movilidad/",
  },
  {
    title: "¿Cómo afecta la calidad del aire al rendimiento de los atletas?",
    date: "Nov 29, 2018",
    image:
      "/images/uploads/2018/11/Kunak-AIR-medira-la-calidad-del-aire-para-analizar-el-rendimiento-de-los-athletas-para-la-IAAF.jpg",
    href: "https://kunakair.com/es/hasta-que-punto-la-calidad-del-aire-afecta-el-rendimiento-de-los-atletas/",
  },
];
