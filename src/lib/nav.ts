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
  { label: "Español", href: "https://kunakair.com/es/" },
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
    href: "https://kunakair.com/es/monitor-calidad-aire/",
    image: "/images/uploads/2022/12/01-Kunak-AIR-Pro-300.jpg",
  },
  {
    label: "Kunak AIR Lite",
    href: "https://kunakair.com/es/estacion-de-monitoreo-de-calidad-del-aire/",
    image: "/images/uploads/2022/12/Kunak_AIR_Lite-300.jpg",
  },
  {
    label: "Kunak AIR Cloud",
    href: "https://kunakair.com/es/software-de-medicion-calidad-del-aire/",
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
    href: "https://kunakair.com/es/kunak-api/",
    image: "/images/uploads/2026/04/kunak-api.jpg",
  },
  {
    label: "Accesorios",
    href: "https://kunakair.com/es/accesorios/",
    image: "/images/uploads/2023/03/kunak-air-accessories.jpg",
  },
];

export const SECTORS: NavSectorItem[] = [
  { label: "Urbano", href: "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/", icon: "/images/uploads/2023/01/urban-2.svg" },
  { label: "Industria y olores", href: "https://kunakair.com/es/sectores/control-de-emisiones-industriales/", icon: "/images/uploads/2023/01/industry.svg" },
  { label: "EDAR", href: "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-plantas-de-aguas-residuales/", icon: "/images/uploads/2026/04/wastewater-treatment-plant.svg" },
  { label: "Petróleo y gas", href: "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/", icon: "/images/uploads/2026/04/oil-and-gas.svg" },
  { label: "Puertos y aeropuertos", href: "https://kunakair.com/es/sectores/contaminacion-del-transporte-maritimo/", icon: "/images/uploads/2023/02/ports-airports-2.svg" },
  { label: "Construcción", href: "https://kunakair.com/es/sectores/contaminacion-por-construccion/", icon: "/images/uploads/2023/01/construction.svg" },
  { label: "Minería", href: "https://kunakair.com/es/sectores/contaminacion-del-aire-por-la-mineria/", icon: "/images/uploads/2023/01/mining.svg" },
  { label: "Investigación y consultoría", href: "https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/", icon: "/images/uploads/2023/01/research.svg" },
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
