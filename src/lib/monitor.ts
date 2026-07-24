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

/** Helper de tipografía usado por varias secciones (evita re-declararlo). */
export type WithChildren = { children: ReactNode };
