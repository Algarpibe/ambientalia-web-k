import type { CaseStudy } from "@/types/kunak";

/**
 * "Últimos proyectos" — 3 latest case studies, verbatim from the home
 * `.case-list-content` module. Images render as `background-image`.
 * Extracted 2026-07-22. Spec: docs/research/components/ultimos-proyectos.spec.md
 */
export const PROJECTS: CaseStudy[] = [
  {
    client: "Nama Water Services (NWS)",
    sector: "EDAR / PTAR",
    sectorHref: "https://kunakair.com/es/sector/edar/",
    title:
      "Monitorización de olores en estaciones depuradoras de aguas residuales en Omán",
    image:
      "/images/uploads/2026/05/Odour-monitoring-in-wastewater-treatment-plants-in-Oman-NAMA-Kunak-1-1024x683.jpg",
    href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-olores-en-estaciones-depuradoras-de-aguas-residuales-en-oman/",
  },
  {
    client: "Vertedero de Valdemingómez",
    sector: "Olores",
    sectorHref: "https://kunakair.com/es/sector/olores/",
    title: "Control avanzado de olores y gases en el vertedero de Valdemingómez",
    image:
      "/images/uploads/2026/05/Control-avanzado-de-gases-y-olores-en-el-vertedero-de-Valdemingomez-1-1024x683.jpg",
    href: "https://kunakair.com/es/casos-de-exito/control-avanzado-de-olores-y-gases-en-el-vertedero-de-valdemingomez/",
  },
  {
    client: "Virginia Department of Environmental Quality (DEQ)",
    sector: "Industria",
    sectorHref: "https://kunakair.com/es/sector/industria/",
    title:
      "Monitorización de la calidad del aire en el mayor corredor de centros de datos de EE.UU",
    image: "/images/uploads/2026/05/639130508516830000.jpg",
    href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos/",
  },
];
