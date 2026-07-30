/**
 * Nav data verbatim from https://kunakair.com/es/ header (extracted via
 * server-side HTML parsing — see docs/research/components/header-nav.spec.md).
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavProductItem extends NavLink {
  image?: string; // path under public/
  children?: NavLink[]; // for "Cartuchos inteligentes" sub-sub menu
}

export interface NavSectorItem extends NavLink {
  icon: string; // path under public/
}

export interface UtilityMenuItem extends NavLink {
  children?: NavLink[];
  external?: boolean;
}

export const UTILITY_MENU: UtilityMenuItem[] = [
  {
    label: "Soporte",
    href: "https://kunakair.com/es/soporte/",
    children: [
      { label: "Centro de ayuda", href: "https://kunakair.com/es/soporte/centro-de-ayuda/" },
      { label: "Servicio de reparación (RMA)", href: "https://kunakair.com/es/soporte/servicio-de-reparacion/" },
      { label: "Soporte técnico", href: "https://kunaksensing.atlassian.net/servicedesk/customer/portal/1/group" },
    ],
  },
  { label: "Blog", href: "https://kunakair.com/es/blog/" },
  { label: "Contacto", href: "https://kunakair.com/es/contacto/" },
];

export const LANGUAGES: NavLink[] = [
  // ruta local: el idioma actual ES nuestra home — original: https://kunakair.com/es/
  { label: "Español", href: "/" },
  { label: "English", href: "https://kunakair.com/" },
  { label: "Français", href: "https://kunakair.com/fr/" },
  { label: "العربية", href: "https://kunakair.com/ar/" },
];

const CARTRIDGES: NavLink[] = [
  { label: "Monóxido de carbono (CO)", href: "https://kunakair.com/es/cartuchos-inteligentes/monoxido-de-carbono/" },
  { label: "Óxido nítrico (NO)", href: "https://kunakair.com/es/cartuchos-inteligentes/oxido-nitrico/" },
  { label: "Dióxido de nitrógeno (NO₂)", href: "https://kunakair.com/es/cartuchos-inteligentes/dioxido-de-nitrogeno/" },
  { label: "Ozono (O₃)", href: "https://kunakair.com/es/cartuchos-inteligentes/ozono/" },
  { label: "Dióxido de azufre (SO₂)", href: "https://kunakair.com/es/cartuchos-inteligentes/dioxido-de-azufre/" },
  { label: "Sulfuro de hidrógeno (H₂S)", href: "https://kunakair.com/es/cartuchos-inteligentes/sulfuro-de-hidrogeno/" },
  { label: "Dióxido de carbono (CO₂)", href: "https://kunakair.com/es/cartuchos-inteligentes/dioxido-de-carbono/" },
  { label: "Metano (CH₄)", href: "https://kunakair.com/es/sensor-de-calidad-del-aire/metano/" },
  { label: "Compuestos orgánicos volátiles (COV)", href: "https://kunakair.com/es/cartuchos-inteligentes/compuestos-organicos-volatiles/" },
  { label: "Hidrocarburos no metánicos (NMHC)", href: "https://kunakair.com/es/cartuchos-inteligentes/hidrocarburos-no-metanicos/" },
  { label: "Amoniaco (NH₃)", href: "https://kunakair.com/es/cartuchos-inteligentes/amoniaco/" },
  { label: "Cloruro de hidrógeno (HCl)", href: "https://kunakair.com/es/cartuchos-inteligentes/cloruro-de-hidrogeno/" },
  { label: "Cianuro de hidrógeno (HCN)", href: "https://kunakair.com/es/cartuchos-inteligentes/cianuro-de-hidrogeno/" },
  { label: "Fluoruro de hidrógeno (HF)", href: "https://kunakair.com/es/cartuchos-inteligentes/fluoruro-de-hidrogeno/" },
  { label: "Cloro (Cl₂)", href: "https://kunakair.com/es/cartuchos-inteligentes/cloro-dioxido-de-cloro/" },
  { label: "Oxígeno (O₂)", href: "https://kunakair.com/es/cartuchos-inteligentes/oxigeno/" },
  { label: "Material particulado (MP)", href: "https://kunakair.com/es/cartuchos-inteligentes/particulas-en-suspension/" },
  { label: "Partículas ultrafinas (PUF)", href: "https://kunakair.com/es/cartuchos-inteligentes/sensor-particulas-ultrafinas/" },
];

export const PRODUCTS: NavProductItem[] = [
  {
    label: "Kunak AIR Pro",
    // ruta local: esta página ya está clonada (src/app/monitor-calidad-aire)
    href: "/monitor-calidad-aire",
    image: "/images/uploads/2022/12/01-Kunak-AIR-Pro-300.jpg",
  },
  {
    label: "Kunak AIR Lite",
    href: "https://kunakair.com/es/estacion-de-monitoreo-de-calidad-del-aire/",
    image: "/images/uploads/2022/12/Kunak_AIR_Lite-300.jpg",
  },
  {
    label: "Kunak AIR Cloud",
    // ruta local: esta página ya está clonada (src/app/software-de-medicion-calidad-del-aire)
    href: "/software-de-medicion-calidad-del-aire",
    image: "/images/uploads/2023/01/air-cloud.jpg",
  },
  {
    label: "Cartuchos inteligentes",
    href: "https://kunakair.com/es/sensor-de-calidad-del-aire/",
    image: "/images/uploads/2023/01/cartridges-300.jpg",
    children: CARTRIDGES,
  },
  {
    label: "Kunak API",
    // ruta local: esta página ya está clonada (src/app/kunak-api)
    href: "/kunak-api",
    image: "/images/uploads/2026/04/kunak-api.jpg",
  },
  {
    label: "Accesorios",
    // ruta local: esta página ya está clonada (src/app/accesorios)
    href: "/accesorios",
    image: "/images/uploads/2023/03/kunak-air-accessories.jpg",
  },
];

/**
 * Los 8 sectores del mega-menú.
 *
 * ── CRITERIO AL AÑADIR O CLONAR UNO (léelo antes de tocar un href) ──────────
 *
 *   sector CLONADO      → ruta local, sin barra final, sin `target="_blank"`
 *   sector NO clonado   → URL del original, tal cual
 *
 * Es la regla de rutas locales de `CLAUDE.md`. Cuando se pueble un sector nuevo
 * en `src/lib/sectores.ts`, **este fichero hay que tocarlo también**: son los
 * dos sitios donde vive un sector, y `sectores.ts` no alimenta este menú.
 * Chivato: `SECTORES_INDICE` en `sectores.ts` lleva un `clonado: boolean` que
 * debe coincidir con lo que haya aquí.
 *
 * Al localizar un href, deja anotado el original al lado — hace falta para
 * rehacer la comparación A/B.
 */
export const SECTORS: NavSectorItem[] = [
  // ruta local: clonado (src/app/sectores/[slug]) — original:
  // https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/
  { label: "Urbano", href: "/sectores/calidad-del-aire-en-las-ciudades", icon: "/images/uploads/2023/01/urban-2.svg" },
  // ruta local: clonado — original:
  // https://kunakair.com/es/sectores/control-de-emisiones-industriales/
  { label: "Industria y olores", href: "/sectores/control-de-emisiones-industriales", icon: "/images/uploads/2023/01/industry.svg" },
  // El href que tenía aquí (…-en-plantas-de-aguas-residuales/) devuelve 404;
  // el del menú vivo del original es …-en-edar/ (verificado 2026-07-28: 200 vs
  // 404). `footer.ts` ya usaba el bueno. Recon: docs/research/sectores/.
  // ruta local: clonado 2026-07-29 como arquetipo MONOGRÁFICO TÉCNICO
  // (docs/research/monografico-tecnico/) — original:
  // https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/
  { label: "EDAR", href: "/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar", icon: "/images/uploads/2026/04/wastewater-treatment-plant.svg" },
  // ruta local: clonado 2026-07-29, mismo arquetipo — original:
  // https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/
  { label: "Petróleo y gas", href: "/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas", icon: "/images/uploads/2026/04/oil-and-gas.svg" },
  // NO clonado, por decisión: permutación de una topología ya validada
  // (razón en docs/PENDIENTES-QA.md).
  { label: "Puertos y aeropuertos", href: "https://kunakair.com/es/sectores/contaminacion-del-transporte-maritimo/", icon: "/images/uploads/2023/02/ports-airports-2.svg" },
  // ruta local: clonado — original:
  // https://kunakair.com/es/sectores/contaminacion-por-construccion/
  { label: "Construcción", href: "/sectores/contaminacion-por-construccion", icon: "/images/uploads/2023/01/construction.svg" },
  // NO clonado, por la misma decisión que Puertos.
  { label: "Minería", href: "https://kunakair.com/es/sectores/contaminacion-del-aire-por-la-mineria/", icon: "/images/uploads/2023/01/mining.svg" },
  // ruta local: clonado — original:
  // https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/
  { label: "Investigación y consultoría", href: "/sectores/estudio-de-la-contaminacion-atmosferica", icon: "/images/uploads/2023/01/research.svg" },
];

export const COMPANY: NavLink[] = [
  { label: "Sobre nosotros", href: "https://kunakair.com/es/empresa/" },
  { label: "Premios y reconocimientos", href: "https://kunakair.com/es/empresa/premios-y-reconocimientos/" },
];

export const RESOURCES: NavLink[] = [
  { label: "Artículos", href: "https://kunakair.com/es/recursos/guias/" },
  { label: "Documentos científicos", href: "https://kunakair.com/es/recursos/documentos-cientificos/" },
  { label: "Kunakpedia", href: "https://kunakair.com/es/recursos/kunakpedia/" },
  { label: "Centro de ayuda", href: "https://kunakair.com/es/soporte/centro-de-ayuda/" },
  { label: "Preguntas frecuentes", href: "https://kunakair.com/es/recursos/preguntas-frecuentes/" },
];
