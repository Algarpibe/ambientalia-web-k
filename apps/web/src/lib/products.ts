import type { Product } from "@/types/kunak";

/**
 * ⚠ **ESTE FICHERO ES LA PROYECCIÓN DE PESTAÑA, NO LA FICHA DEL PRODUCTO** — y
 * saberlo cambia cómo se lee todo lo de abajo (2026-08-04).
 *
 * `npm run qa:cms-arquetipos` lo deriva contra el `prerender-manifest`: de estos
 * **9 productos el clon sirve 3** (`monitor-calidad-aire`, `software-…`,
 * `kunak-api`). Los otros **6 sólo están REFERENCIADOS** — existen aquí porque
 * la home los pinta como pestaña, y lo que hay de ellos es *lo que la pestaña
 * necesita*, no su página.
 *
 * Por eso la premisa del §F2-2 —*«`src/lib/*.ts` son los datos»*— **es falsa
 * para 6 de 9 filas de este fichero**, y no por descuido: una proyección está
 * completa respecto de su propósito. Lo que no puede es sembrar la colección.
 *
 * ── El bloque `seo`, añadido el 2026-08-04 con su medida ──────────────────
 * `npm run qa:solutions-seo` sobre las **24** URLs del `solutions-sitemap.xml`:
 * `title` **24/24** y **no derivable del `h1`** ⇒ es campo, y el `required` del
 * esquema queda respaldado; `description` **22/24** ⇒ opcional con su medida.
 * Congelado en `medidas/solutions-seo.json`. Antes de esto el título vivía en el
 * `export const metadata` de tres `page.tsx` —capa de ESTRUCTURA— y no existía
 * para los otros seis.
 *
 * ⚠ **Y una discrepancia de fidelidad que la medición destapó de paso:** el
 * `metadata.title` del clon en `/kunak-api` dice *«Kunak API | Integración de
 * datos de calidad del aire»* y el original dice **«Kunak API - Kunak»**. El
 * dato de aquí abajo es el del ORIGINAL. Fichado en `PENDIENTES-QA.md`.
 */

/**
 * "Nuestros productos" tabs — 5 items, verbatim from `#lista-soluciones`
 * (KunakAir theme shortcode). Order and content extracted 2026-07-22.
 * Spec: docs/research/components/productos-tabs.spec.md
 */
export const PRODUCTS_TABS: Product[] = [
  {
    id: "monitor-calidad-aire",
    seo: {
      title: "Monitor de calidad del aire profesional | Kunak AIR Pro",
      description:
        "El monitor de calidad del aire exterior multi-contaminante más preciso y fiable del mercado. Validado por la US EPA, Airparif, AQ Spec y más.",
      ogImage: "https://kunakair.com/wp-content/uploads/2022/12/cabecera-puerto-1.jpg",
    },
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
    seo: {
      title: "Estación de calidad del aire | Kunak AIR Lite",
      description:
        "Con la estación de monitoreo de calidad del aire Kunak AIR Lite obtendrás información precisa sobre contaminantes fácil, rápida y asequible.",
      ogImage: "https://kunakair.com/wp-content/uploads/2022/12/cabecera-puerto-1.jpg",
    },
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
    seo: {
      title: "Sensor de calidad del aire exterior preciso y fiable - Kunak",
      description:
        "La tecnología patentada de cartuchos inteligentes desarrollada por Kunak permite medir los contaminantes ambientales de forma precisa.",
      ogImage: "https://kunakair.com/wp-content/uploads/2022/12/cabecera-puerto-1.jpg",
    },
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
    seo: {
      title: "Software para el análisis de la calidad del aire | Kunak AIR Cloud",
      description:
        "Software de análisis de la calidad del aire y ayudar a los profesionales a utilizar y explotar los datos para tomar decisiones informadas.",
      ogImage: "https://kunakair.com/wp-content/uploads/2022/12/cabecera-puerto-1.jpg",
    },
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
    seo: {
      title: "Kunak API - Kunak",
      ogImage: "https://kunakair.com/wp-content/uploads/2022/12/cabecera-puerto-1.jpg",
    },
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

/**
 * Los productos de CARTUCHO que usan los casos de éxito.
 *
 * No son "otra lista": son **el mismo content type** (`#lista-soluciones`, el
 * mismo shortcode con el mismo `data-id`), y viven aquí porque el caso los
 * referencia **por relación** — guarda el `id`, no la ficha. Que la ficha sea
 * proyección del producto está probado en C-2 (640 nodos de panel en el corpus,
 * **18 fichas y 17 títulos** distintos) y sin contraejemplo en C-3: los dos
 * `data-id` que salen en más de un caso dan la ficha idéntica byte a byte.
 *
 * Transcritos verbatim de `scripts/qa/medidas/c-spec.json` (2026-07-30).
 *
 * ⚠ **Son la segunda instancia que desmintió al componente.** `ProductPanel`
 * tenía «Ventajas» cableado; estos cuatro titulan la misma lista
 * **«Especificaciones»** → `bulletsTitulo`, campo con defecto `"Ventajas"`
 * omitido cuando coincide (C-SP14 en `docs/PENDIENTES-QA.md`). Y traen otros
 * dos flecos del mismo sitio: las viñetas llevan **marcado en línea**
 * (`R<sup>2</sup>`, `μg/m<sup>3</sup>`), que son fórmulas y no adorno, y
 * **`amoniaco` no tiene foto** — el panel sin imagen ya estaba contemplado por
 * Kunak API.
 *
 * Sus `href` van al original: los cartuchos no están clonados.
 */
export const PRODUCTS_CARTUCHOS: Product[] = [
  {
    id: "sulfuro-de-hidrogeno",
    seo: {
      title: "Sensor de H2S (Sulfuro de hidrógeno) - Kunak",
      description:
        "Cartucho inteligente diseñado por Kunak que integra un sensor capaz de medir de forma precisa y fiable los niveles de sulfuro de hidrógeno.",
      ogImage: "https://kunakair.com/wp-content/uploads/2023/02/Hydrogen_sulfide.jpg",
    },
    name: "Sulfuro de hidrógeno",
    tagline: "Datos fiables sobre el H2S",
    description: "Datos fiables sobre el sulfuro de hidrógeno",
    highlight: "TECNOLOGÍA GASPLUG | DISEÑO PATENTADO",
    bulletsTitulo: "Especificaciones",
    bullets: [
      "Electroquímico",
      "R<sup>2</sup> &gt;0,8",
      "Rango de medición: 0-2.000 ppb (Tipo A) | 0-20 ppm (Tipo B)",
      "Resolución: 1 ppb (Tipo A) | 0,01 ppm (Tipo B)",
      "24 meses de vida útil",
    ],
    image: "/images/uploads/2023/02/Hydrogen-sulfide.jpg",
    href: "https://kunakair.com/es/cartuchos-inteligentes/sulfuro-de-hidrogeno/",
  },
  {
    id: "amoniaco",
    seo: {
      title: "Sensor de NH3 (Amoniaco) - Kunak",
      description:
        "Cartucho inteligente diseñado por Kunak que integra un sensor capaz de medir de forma precisa y fiable los niveles de amoniaco.",
      ogImage: "https://kunakair.com/wp-content/uploads/2023/02/Ammonia.jpg",
    },
    name: "Amoniaco",
    tagline: "Datos fiables sobre el NH3",
    description: "Datos fiables sobre el amoniaco",
    highlight: "TECNOLOGÍA GASPLUG | DISEÑO PATENTADO",
    bulletsTitulo: "Especificaciones",
    bullets: [
      "Electroquímico",
      "Precisión típica (MAE): ±0,3 ppm",
      "Rango de medición: 0-50 ppm",
      "Resolución: 0,01 ppm",
      "24 meses de vida útil",
    ],
    // Medido: este panel NO trae imagen en el original. No es un hueco por
    // llenar — es el dato.
    image: "",
    href: "https://kunakair.com/es/cartuchos-inteligentes/amoniaco/",
  },
  {
    id: "compuestos-organicos-volatiles",
    seo: {
      title: "Sensor de COVs (Compuestos orgánicos volátiles) - Kunak",
      description:
        "Cartucho inteligente que integra un sensor capaz de medir de forma precisa y fiable los niveles de compuestos orgánicos volátiles.",
      ogImage: "https://kunakair.com/wp-content/uploads/2023/02/Volatile-Organic-Compounds.jpg",
    },
    name: "Compuestos orgánicos volátiles",
    tagline: "Datos fiables sobre los COVs",
    description: "Datos fiables sobre los compuestos orgánicos volátiles",
    highlight: "TECNOLOGÍA GASPLUG | DISEÑO PATENTADO",
    bulletsTitulo: "Especificaciones",
    bullets: [
      "Detector de fotoionización",
      "R<sup>2</sup> &gt;0,99",
      "Rango de medición: 0-3.000 ppb (Tipo A) | 0-40 ppm (Tipo B)",
      "Resolución: 1 ppb (Tipo A) | 0,01 ppm (Tipo B)",
      "10.000 horas de vida útil",
    ],
    image: "/images/uploads/2023/02/Volatile_organic_compounds.jpg",
    href: "https://kunakair.com/es/cartuchos-inteligentes/compuestos-organicos-volatiles/",
  },
  {
    id: "particulas-en-suspension",
    seo: {
      title: "Sensor de PM (Partículas en suspensión) - Kunak",
      description:
        "Cartucho inteligente diseñado por Kunak que integra un sensor capaz de medir de forma precisa y fiable los niveles de partículas en suspensión.",
      ogImage: "https://kunakair.com/wp-content/uploads/2023/02/particulate-matter.jpg",
    },
    name: "Partículas en suspensión",
    tagline: "Medición precisa de material particulado",
    description: "Información fiable sobre partículas",
    highlight: "TECNOLOGÍA GASPLUG | DISEÑO PATENTADO",
    bulletsTitulo: "Especificaciones",
    bullets: [
      "Contador óptico de partículas",
      "Hasta R<sup>2</sup> &gt;0.9",
      "Rango: 0-1.000 | 0-2.000 | 0-10.000 ppb",
      "Resolución: 1 μg/m<sup>3</sup>",
      "24 meses de vida útil",
    ],
    image: "/images/uploads/2023/02/particulate-matter-sensor.jpg",
    href: "https://kunakair.com/es/cartuchos-inteligentes/particulas-en-suspension/",
  },
];

/**
 * El catálogo entero, indexado por `data-id` — que es lo que el caso guarda.
 * Es la "colección de productos" del §1.4 del esquema, con el inventario que
 * el grupo C aporta de arranque.
 */
const POR_ID = new Map([...PRODUCTS_TABS, ...PRODUCTS_CARTUCHOS].map((p) => [p.id, p]));

/**
 * Proyecta los `id` que guarda un caso a sus productos.
 *
 * Lanza si un `id` no existe, y eso es deliberado: un `data-id` sin producto
 * significa que el catálogo está incompleto, y **fallar en el build** es
 * infinitamente mejor que renderizar el bloque con una ficha menos y que nadie
 * lo note. Es la misma razón por la que `enlaces.mjs` saca las rutas del
 * manifiesto y no de una lista.
 */
export function getProductos(ids: string[]): Product[] {
  return ids.map((id) => {
    const p = POR_ID.get(id);
    if (!p) throw new Error(`Producto desconocido en \`soluciones\`: "${id}"`);
    return p;
  });
}
