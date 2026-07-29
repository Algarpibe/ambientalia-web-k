export interface SectorSlide {
  slug: string;
  title: string;
  description: string;
  bg: string;
  icon: string;
  href: string;
}

/** Sectores home carousel — 6 slides verbatim from HTML source (init.js confirms order). */
export const SECTOR_SLIDES: SectorSlide[] = [
  {
    slug: "urbano",
    title: "Urbano",
    description: "Crea espacios donde la gente quiera vivir controlando la calidad del aire.",
    bg: "/images/uploads/2023/01/urban-1920-1024x546.jpg",
    icon: "/images/uploads/2023/01/urban-2.svg",
    href: "/sectores/calidad-del-aire-en-las-ciudades",
  },
  {
    slug: "industria",
    title: "Industria y olores",
    description: "Ayuda a crear un futuro más limpio vigilando las inmisiones industriales.",
    bg: "/images/uploads/2023/01/industry-1920x1024-1-1024x546.jpg",
    icon: "/images/uploads/2023/01/industry.svg",
    href: "/sectores/control-de-emisiones-industriales",
  },
  {
    slug: "puertos",
    title: "Puertos y Aeropuertos",
    description: "Haz tu transporte más sostenible controlando sus emisiones.",
    bg: "/images/uploads/2023/03/ports-1920-1024x546.jpg",
    icon: "/images/uploads/2023/02/ports-airports-2.svg",
    href: "https://kunakair.com/es/sectores/contaminacion-del-transporte-maritimo/",
  },
  {
    slug: "construccion",
    title: "Construcción",
    description: "Reduce el impacto ambiental de tus obras midiendo la contaminación que generan.",
    bg: "/images/uploads/2023/01/construction-1920x1024-1-1024x546.jpg",
    icon: "/images/uploads/2023/01/construction.svg",
    href: "/sectores/contaminacion-por-construccion",
  },
  {
    slug: "mineria",
    title: "Minería",
    description: "Contribuye a una extracción más sostenible monitorizando el impacto de tus explotaciones.",
    bg: "/images/uploads/2023/01/mining-1920x1024-1-1024x546.jpg",
    icon: "/images/uploads/2023/01/mining.svg",
    href: "https://kunakair.com/es/sectores/contaminacion-del-aire-por-la-mineria/",
  },
  {
    slug: "investigacion",
    title: "Investigación y consultoría",
    description: "Estudia la contaminación atmosférica combinando tecnología punta y conocimiento.",
    bg: "/images/uploads/2023/01/research-1920-1024x546.jpg",
    icon: "/images/uploads/2023/01/research.svg",
    href: "/sectores/estudio-de-la-contaminacion-atmosferica",
  },
];
