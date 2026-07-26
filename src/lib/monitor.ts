/**
 * Datos de la página /monitor-calidad-aire (Kunak AIR Pro).
 * Specs: docs/research/monitor-calidad-aire/components/*.spec.md
 */
import type { ReactNode } from "react";

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

// hrefs verbatim del original: el de AIR Cloud va SIN prefijo /es/ y el del
// botón además sin barra final. Se replican tal cual.
export const SOFTWARE_PARAGRAPHS: ParaSeg[][] = [
  [
    { t: "Analiza todos los datos recogidos por las estaciones Kunak AIR de forma sencilla con nuestro software avanzado de calidad del aire " },
    { t: "Kunak AIR Cloud", href: "https://kunakair.com/software-medicion-calidad-del-aire/" },
    { t: " y genera informes que te faciliten la toma de decisiones. " },
  ],
  [
    { t: "Además, podrás configurar los dispositivos desplegados y disponer de un sistema de alarmas que te facilitará la operación y mantenimiento remoto de la red de una forma sencilla." },
  ],
  [
    { t: "Integra los datos recopilados por la red y almacenados por el servidor en plataformas de calidad del aire públicas o en aplicaciones de terceros a través de la potente " },
    { t: "API Rest", href: "https://kunakair.com/es/kunak-api/" },
    { t: "." },
  ],
  [
    { t: "Si lo necesitas, la API también te permite integrar datos de fuentes externas que complementen la información que te proporciona la red de monitorización y así analizarás todos los datos en una única plataforma." },
  ],
];

export const SOFTWARE_MORE_HREF = "https://kunakair.com/software-calidad-aire";

/** Helper de tipografía usado por varias secciones (evita re-declararlo). */
export type WithChildren = { children: ReactNode };
