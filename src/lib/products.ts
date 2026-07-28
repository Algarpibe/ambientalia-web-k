import type { Product } from "@/types/kunak";

/**
 * "Nuestros productos" tabs — 5 items, verbatim from `#lista-soluciones`
 * (KunakAir theme shortcode). Order and content extracted 2026-07-22.
 * Spec: docs/research/components/productos-tabs.spec.md
 */
export const PRODUCTS_TABS: Product[] = [
  {
    id: "monitor-calidad-aire",
    name: "AIR Pro",
    tagline: "Monitor de calidad de aire para profesionales",
    description: "Estación de monitorización de la calidad del aire para profesionales.",
    highlight: "BASADA EN SENSORES | LA MAYOR PRECISIÓN",
    bullets: [
      "Multi-contaminante",
      "Sistema de cartuchos",
      "Totalmente autónomo",
      "Datos en tiempo real",
      "Precisión probada",
    ],
    image: "/images/uploads/2022/12/Kunak-AIR-Pro-1024.jpg",
    // ruta local: esta página ya está clonada (src/app/monitor-calidad-aire)
    href: "/monitor-calidad-aire",
  },
  {
    id: "estacion-de-monitoreo-de-calidad-del-aire",
    name: "AIR Lite",
    tagline: "Estación de monitoreo de calidad del aire",
    description: "Información sobre la calidad del aire calle a calle.",
    highlight: "CALIDAD INDUSTRIAL | MÁXIMA PRECISIÓN",
    bullets: [
      "Diseño robusto y compacto",
      "Sistema de cartuchos",
      "Funcionamiento autónomo",
      "Pantalla OLED integrada",
      "Gran relación calidad-precio",
    ],
    image: "/images/uploads/2022/12/Kunak_AIR_Lite-300.jpg",
    href: "https://kunakair.com/es/estacion-de-monitoreo-de-calidad-del-aire/",
  },
  {
    id: "sensor-de-calidad-del-aire",
    name: "Cartuchos inteligentes",
    tagline: "Sistema plug & play",
    description:
      "El sistema plug & play para una medición precisa de los principales contaminantes.",
    highlight: "BASADO EN SENSORES | SUSTITUCIÓN FÁCIL Y RÁPIDA",
    bullets: [
      "Plug & Play (detección automática)",
      "Calibración y validación individuales",
      "Control y garantía de calidad trazables",
      "Diseño patentado",
      "Sostenible",
    ],
    image: "/images/uploads/2023/01/cartridges-300.jpg",
    href: "https://kunakair.com/es/sensor-de-calidad-del-aire/",
  },
  {
    id: "software-de-medicion-calidad-del-aire",
    name: "AIR Cloud",
    tagline: "Software de calidad del aire",
    description: "Software profesional de calidad del aire para el análisis de datos.",
    highlight: "DATOS EN TIEMPO REAL | ACTUALIZACIONES CONTINUAS",
    bullets: [
      "Seguro y confidencial",
      "Informes de calidad del aire",
      "Visualización y análisis avanzado de datos",
      "Datos fiables garantizados",
      "Integración y envío de datos",
    ],
    image: "/images/uploads/2023/01/air-cloud.jpg",
    // ruta local: esta página ya está clonada (src/app/software-de-medicion-calidad-del-aire)
    href: "/software-de-medicion-calidad-del-aire",
  },
  {
    id: "kunak-api",
    name: "Kunak API",
    tagline: "Fácil integración de datos",
    description:
      "Fácil integración de datos en cualquier sitio web o plataforma de smart city",
    highlight: "DISPONIBILIDAD DE DATOS | COPIAS DE SEGURIDAD AUTOMÁTICAS",
    bullets: [
      "Visualización y gestión de datos",
      "Automatización de procesos",
      "Herramientas personalizadas",
      "Integración de sistemas de terceros",
      "Importación y exportación de datos",
    ],
    image: "",
    // ruta local: esta página ya está clonada (src/app/kunak-api)
    href: "/kunak-api",
  },
];
