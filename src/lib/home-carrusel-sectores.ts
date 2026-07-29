/**
 * Las 6 diapositivas del **carrusel de sectores de la HOME**.
 * Componente: `src/components/SectoresCarousel.tsx`.
 *
 * Se llamaba `sectors.ts` y convivía con `sectores.ts` —el content type de la
 * PÁGINA de sector—, con significados distintos y a una letra de distancia. La
 * confusión llegó a costar un aviso escrito en la cabecera del otro fichero;
 * renombrado el 2026-07-29 para que el nombre haga el trabajo que hacía el
 * aviso.
 *
 * Ojo con el `href` de cada diapositiva: le aplica la **regla de rutas locales**
 * y lo vigila `scripts/qa/enlaces.mjs`. Al clonar un sector nuevo hay que
 * tocarlo aquí, en `nav.ts` y en `footer.ts` — los tres pintan enlaces a
 * sectores y ninguno se entera de lo que hacen los otros.
 */
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
