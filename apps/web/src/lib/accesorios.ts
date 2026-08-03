/**
 * Datos de /accesorios — arquetipo CATÁLOGO.
 * Recon: docs/research/accesorios/PAGE_TOPOLOGY.md · BEHAVIORS.md
 * Specs: docs/research/accesorios/components/*.spec.md
 *
 * "Plantilla + datos": la plantilla son `AccesorioCard` + `SpecTable`; los
 * datos son este array. En el original ya es así (cada ficha es un post de un
 * CPT recorrido por un shortcode, con `wp-post-image` de thumbnail).
 *
 * TEXTOS VERBATIM, incluidas las erratas del original — no "corregir":
 *   · "Anenómetro Ultrasónico"      (sic; el navLabel sí va bien escrito)
 *   · "Cargadores para exteriores"  (título en plural, slug en singular)
 *   · "Sensor de radiación"         (navLabel) vs "Sensor Ultravioleta-A" (título)
 *   · "de energía de energía"       (sic, en la descripción del sensor UV-A)
 */

import type { BlogPost } from "@/types/kunak";

const U12 = "/images/uploads/2022/12";
const U23_01 = "/images/uploads/2023/01";
const U24_07 = "/images/uploads/2024/07";

/** Celda de tabla: string, o varias líneas (el original usa `<br>`). */
export type SpecCell = string | string[];

export type SpecAlign = "left" | "center" | "right";

export type AccesorioSpecs =
  | {
      kind: "matrix";
      /** fila de cabecera (en el original es `<td><strong>`, aquí `<th scope="col">`) */
      header: string[];
      rows: SpecCell[][];
      /** fila final a `colspan` completo, 10px alineada a la derecha */
      note?: string;
      /** anchos inline del original por columna; sin ellos el reparto `auto`
       *  ensancha la última columna y cambia los saltos de línea */
      colWidths: string[];
      /** alineación de las celdas de DATOS por columna (la cabecera va centrada) */
      align: SpecAlign[];
    }
  /** el valor admite varias líneas (el original usa `<br>` en el piranómetro) */
  | { kind: "pairs"; rows: [string, SpecCell][] };

export interface AccesorioImage {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Accesorio {
  /** id del bloque = destino del ancla (`#panel-solar`) */
  slug: string;
  /** etiqueta en la caja de anclas — difiere del título en 4 de 11 */
  navLabel: string;
  /** `<h3 class="accesorio-title">` */
  title: string;
  image: AccesorioImage;
  /** párrafos de la descripción */
  description: string[];
  /** lista de viñetas (solo el anemómetro ultrasónico) */
  bullets?: string[];
  /** imagen a ancho completo bajo el texto (solo Gashood) */
  extraImage?: AccesorioImage;
  specs: AccesorioSpecs | null;
}

export interface AccesorioCategoria {
  /** `<h2>` de la columna 1/4 */
  heading: string;
  /** entradilla en la columna 3/4, antes de las fichas (solo la 1ª categoría) */
  intro?: string[];
  items: Accesorio[];
}

/* --- Categoría 1 — Opciones de alimentación (3 fichas, tablas `matrix`) --- */

const OPCIONES_ALIMENTACION: Accesorio[] = [
  {
    slug: "panel-solar",
    navLabel: "Panel solar",
    title: "Panel solar",
    image: { src: `${U12}/kunak_IMG_0017-300x300-2.jpg`, width: 300, height: 300 },
    description: [
      "El panel solar monocristalino de alta eficiencia es robusto, resistente al agua (IP67) y ha sido diseñado para un uso prolongado al aire libre en cualquier entorno. El panel fotovoltaico hace que el dispositivo sea autónomo de la red eléctrica, lo que permite su instalación en cualquier lugar sin obra civil o en ubicaciones remotas. Todos los modelos de panel solar incluyen un kit de montaje.",
    ],
    specs: {
      kind: "matrix",
      header: ["Potencia", "Dimensiones", "Peso", "Notas de instalación"],
      rows: [
        ["6W", "320 x 190 x 110 mm", "1,250 kg", "Air Lite: entre los paralelos 0-50ºN/S"],
        [
          "12W",
          "340 x 220 x 110 mm",
          "2,350 kg",
          // el original separa las dos líneas con <br>
          ["AIR Pro: entre los paralelos 0-50ºN/S", "AIR Lite: por encima de los paralelos 0-50ºN/S"],
        ],
        ["26W", "450 x 350 x 110 mm", "3,150 kg", "Por encima de los paralelos 50ºN/S"],
      ],
      note: "Dimensiones sin caja. Cada panel solar garantiza un suministro de energía suficiente en función de la aplicación y la ubicación del proyecto.",
      colWidths: ["17.1238%", "28.2348%", "13.3263%", "41.3151%"],
      // la columna de notas va a la izquierda en los datos (la cabecera, centrada)
      align: ["center", "center", "center", "left"],
    },
  },
  {
    slug: "cargador-para-exteriores",
    navLabel: "Cargador para exteriores",
    // sic: el título va en plural y el slug en singular
    title: "Cargadores para exteriores",
    image: { src: `${U12}/kunak_IMG_0015-300x300-1.jpg`, width: 300, height: 300 },
    description: [
      "Debe utilizarse un cargador de exterior cuando la estación Kunak AIR vaya a instalarse en exteriores. Es pequeño, ligero, resistente al agua (IP67) y ha sido diseñado para un uso prolongado al aire libre en cualquier entorno. Cable de alimentación no incluido.",
    ],
    specs: {
      kind: "matrix",
      header: ["Dimensiones", "Peso", "Voltaje de entrada", "Voltaje de salida"],
      rows: [["200 x 85 x 95 mm", "750 gr", "100-240V AC 50-60 Hz", "12V DC"]],
      colWidths: ["25%", "25%", "25%", "25%"],
      align: ["center", "center", "center", "center"],
    },
  },
  {
    slug: "cargador-para-interiores",
    navLabel: "Cargador para interiores",
    title: "Cargador para interiores",
    image: { src: `${U12}/kunak-air-indoor-charger.jpg`, width: 800, height: 800 },
    description: [
      "Hay disponible un cargador de interior con enchufes globales para pruebas y verificación. No apto para uso en exteriores. Solo disponible con la compra de un pack de alimentación.",
    ],
    specs: {
      kind: "matrix",
      header: ["Dimensiones", "Peso", "Voltaje de entrada", "Voltaje de salida"],
      rows: [["75 x 35,8 x 65,6 mm", "170 gr", "100-240V AC 50-60 Hz", "9V DC"]],
      colWidths: ["25%", "25%", "25%", "25%"],
      align: ["center", "center", "center", "center"],
    },
  },
];

/* --- Categoría 2 — Sondas adicionales (8 fichas: 7 `pairs` + Gashood sin tabla) --- */

const SONDAS_ADICIONALES: Accesorio[] = [
  {
    slug: "anemometro-mecanico",
    navLabel: "Anemómetro mecánico",
    title: "Anemómetro Mecánico",
    image: { src: `${U12}/kunak_IMG_0047-copia-300x300-1.jpg`, width: 300, height: 300 },
    description: [
      "Incluye sensores de velocidad y de dirección del viento. Sus resistentes componentes soportan vientos huracanados y al mismo tiempo son sensibles a una ligera brisa. Incluye rodamientos sellados para una larga duración.",
    ],
    specs: {
      kind: "pairs",
      rows: [
        ["Rango de velocidad", "0,5 a 89 m/s"],
        ["Resolución de la veloc.", "0,5 m/s"],
        ["Precisión de la veloc.", "± 1 m/s o ± 5%"],
        ["Resolución de dirección", "1º en rosa de los vientos"],
        ["Precisión de dirección", "± 3º"],
        ["Temp. funcionamiento", "-40ºC a 65ºC"],
        ["Peso", "1,3 kg"],
        ["Dimensiones", "381 x 38 x 457 mm"],
      ],
    },
  },
  {
    slug: "anemometro-ultrasonico",
    navLabel: "Anemómetro ultrasónico",
    // sic: errata del original ("Anenómetro")
    title: "Anenómetro Ultrasónico",
    image: { src: `${U12}/kunak_IMG_0061-copia-300X300.jpg`, width: 300, height: 300 },
    description: [
      "Incluye sensores de velocidad y de dirección del viento. Se trata de un anemómetro ultrasónico con alimentación autónoma. Los requisitos de potencia son mínimos y se satisfacen por medio de un pequeño panel solar situado encima de la unidad y una batería de litio recargable situada en la parte ancha del poste de la unidad, justo debajo de la plataforma ultrasónica.",
    ],
    bullets: ["Velocidad máxima del viento", "Velocidad media del viento", "Dirección del viento"],
    specs: {
      kind: "pairs",
      rows: [
        ["Rango de velocidad", "De 0,13 a 40 m/s"],
        ["Resolución de la veloc.", "0,05 m/s"],
        ["Precisión de la veloc.", "0,12 m/s"],
        ["Peso", "0,2 kg"],
        ["Resolución de dirección", "1º"],
        ["Precisión de dirección", "± 1,5º"],
        ["Temp. funcionamiento", "De -15ºC a 55ºC"],
        ["Dimensiones", "300 x Ø16 mm"],
      ],
    },
  },
  {
    slug: "pluviometro",
    navLabel: "Pluviómetro",
    title: "Pluviómetro",
    image: { src: `${U12}/rain-gauge.jpg`, width: 500, height: 500 },
    description: [
      "Gracias a su gran fiabilidad, fácil mantenimiento y limpieza sencilla, ofrece aplicaciones en todos los climas. Cubeta con tecnología probada de vacío automático que garantiza la medición continua de precipitación sea cual sea el volumen y la intensidad. Mide la lluvia por medio de un orificio de embudo estándar que recoge el agua en un mecanismo de vaciado automático de la cubeta.",
    ],
    specs: {
      kind: "pairs",
      rows: [
        ["Precisión típica", "±0,2 mm"],
        ["Resolución", "0,2 mm"],
        ["Peso", "0,5 kg"],
        ["Temp. funcionamiento", "De 0 ºC a 60 ºC"],
        ["Área del orificio", "Ø200 cm2"],
        ["Dimensiones", "255 x Ø165 mm"],
      ],
    },
  },
  {
    slug: "sonometro",
    navLabel: "Sonómetro",
    title: "Sonómetro",
    image: { src: `${U23_01}/Sound-level-meter.jpg`, width: 300, height: 300 },
    description: [
      "Sistema inalámbrico de bajo coste para la monitorización del ruido urbano e industrial. Sonómetro tipo 2 que capta datos en tiempo real y los envía de forma inalámbrica a Kunak AIR Cloud. Monitoriza el nivel de ruido en puntos críticos de diferentes zonas, proporciona datos 24/7 y permite la configuración de alertas. Pequeño, ligero y fácil de instalar.",
    ],
    specs: {
      kind: "pairs",
      rows: [
        ["Rango de medida", "40-130 dB(A) 20 - 12,500 Hz"],
        ["Temp. funcionamiento", "De -10 a 50 ºC"],
        ["Peso", "2,5 kg"],
        ["Resolución", "0,1 dB"],
        ["Precisión típica", "±1 dB(A)"],
        ["Dimensiones", "191 x 296 x 168 mm"],
      ],
    },
  },
  {
    slug: "piranometro",
    navLabel: "Piranómetro",
    title: "Piranómetro",
    image: { src: `${U12}/pyranometer.jpg`, width: 500, height: 500 },
    description: [
      "El piranómetro mide la radiación solar mediante una termopila ennegrecida de alta calidad protegida por una cúpula. La termopila ennegrecida ofrece una respuesta espectral plana para todo el rango espectral del sol, lo que permite usarla bajo toldos o lámparas o cuando el cielo está nublado, así como para realizar mediciones de radiación reflejada.",
    ],
    specs: {
      kind: "pairs",
      rows: [
        // el original parte este valor con <br>
        ["Rango", ["0 a 1600 W/m²", "285 a 3000 nm"]],
        ["Precisión típica", "± 0.2 W/m²"],
        ["Peso", "0,5 kg"],
        ["Resolución", "0,2 W/m²"],
        ["Temp. de funcionamiento", "-40 a 80 ºC"],
        ["Dimensiones", "Ø56 x 70 mm"],
        ["Protocolo", "Modbus RTU (RS-485)"],
      ],
    },
  },
  {
    slug: "sensor-ultravioleta-a",
    // el navLabel del original NO coincide con el título
    navLabel: "Sensor de radiación",
    title: "Sensor Ultravioleta-A",
    image: {
      src: `${U12}/apogee-su-202-ultraviolet-A-sensor.jpg`,
      width: 1024,
      height: 555,
    },
    description: [
      // sic: "de energía de energía" está así en el original
      "Este sensor detecta la radiación UV de 280 a 400 nm y están calibrados en unidades de densidad de flujo de energía de energía en vatios por metro cuadrado. Las aplicaciones típicas de los sensores UV incluyen la medición de la radiación UV entrante en entornos exteriores o en laboratorios con fuentes de luz artificial (por ejemplo, lámparas germicidas).",
    ],
    specs: {
      kind: "pairs",
      rows: [
        ["Rango", "0 to 200 W/m² 280 to 400 nm"],
        ["Precisión", "±5% rdg"],
        ["Peso", "150 g"],
        ["Tiempo de respuesta", "≤1s"],
        ["Temp. de funcionamiento", "-40 to 85 ºC"],
        ["Dimensiones", "Ø64 x 33.5 mm"],
        ["Protocolo", "Modbus RTU (RS-485)"],
      ],
    },
  },
  {
    slug: "termometro-de-globo-y-de-bulbo-humedo-wbgt",
    // el navLabel va sin el "(WBGT)" final
    navLabel: "Termómetro de globo y de bulbo húmedo",
    title: "Termómetro de globo y de bulbo húmedo (WBGT)",
    image: { src: `${U12}/WBGT-300x300-1.jpg`, width: 300, height: 300 },
    description: [
      "El termómetro de globo y de bulbo húmedo (WBGT) mide el estrés térmico bajo la luz solar directa, teniendo en cuenta la temperatura, la humedad, la velocidad del viento (sensación térmica) y la radiación solar. Se utiliza en administraciones de seguridad y salud ocupacional, eventos deportivos y organismos militares para determinar los niveles apropiados de exposición a altas temperaturas.",
    ],
    specs: {
      kind: "pairs",
      rows: [
        ["Rango", "-40 a 80 ºC"],
        ["Precisión (0°C a 60°C)", "±0,2 ºC"],
        ["Peso", "780 g"],
        ["Resolución", "0,05 ºC"],
        ["Temp. de funcionamiento", "-40 a 60 ºC"],
        ["Dimensiones", "15 x 15 x 25,9 cm"],
        ["Protocolo", "Modbus RTU (RS-485)"],
      ],
    },
  },
  {
    slug: "gashood",
    navLabel: "Micro-cámara de calibración (Gashood)",
    title: "Micro-cámara de calibración (Gashood)",
    image: { src: `${U24_07}/gashood-air-pro.jpg`, width: 1000, height: 1000 },
    description: [
      "Para realizar una calibración precisa de los cartuchos de gas, se puede utilizar una micro-cámara de calibración (Gashood en inglés) para conectar una botella de gas de calibración certificada (ISO 6141, NIST) a la estación Kunak AIR. Este tipo de calibración es similar al protocolo de calibración de los instrumentos de referencia y sólo requiere dos puntos: línea de base y span (sensibilidad).",
    ],
    // única ficha sin tabla; en su lugar lleva una imagen a ancho completo
    extraImage: {
      src: `${U24_07}/gashood-air-pro-lite.jpg`,
      width: 1500,
      height: 500,
      alt: "Cámara de microcalibración de Kunak (Gashood)",
    },
    specs: null,
  },
];

export const ACCESORIO_CATEGORIAS: AccesorioCategoria[] = [
  {
    heading: "Opciones de alimentación",
    intro: [
      "Las estaciones Kunak AIR están equipadas con una batería de litio recargable que evita que el equipo se apague por un corte de luz.",
      "De este modo, pueden seguir trabajando durante largos periodos de tiempo hasta que se restablezca el suministro eléctrico. Existen diferentes paquetes de alimentación para abastecer a los dispositivos.",
    ],
    items: OPCIONES_ALIMENTACION,
  },
  {
    heading: "Sondas adicionales",
    items: SONDAS_ADICIONALES,
  },
];

/* --- Hero e intro (hero-accesorios.spec.md) --- */

export const HERO = {
  /** el `<p>` de 50px/fw800: es el titular VISUAL, el h1 va debajo en 23px */
  kicker: "Accesorios",
  h1: "Accesorios para sensores de calidad del aire, más datos para decidir mejor",
  h2: "¿Quieres obtener el máximo rendimiento de tu red de monitorización?",
  h2Id: "quieres-obtener-el-maximo-rendimiento-de-tu-red-de-monitorizacion",
  ctaLabel: "Conoce cómo es el aire que respiras",
  ctaHref: "https://kunakair.com/es/contacto/",
  image: {
    src: "/images/uploads/2023/03/kunak-air-accessories.jpg",
    width: 1000,
    height: 1000,
    alt: "Accesories",
  },
} as const;

export const INTRO_HEADING = "Información sobre el producto";
export const INTRO_HEADING_ID = "informacion-sobre-el-producto";

export const INTRO_LEFT: string[] = [
  "Los accesorios para sensores de calidad del aire maximizan el rendimiento de nuestras estaciones Kunak AIR.",
  "Estos accesorios para sensores de calidad del aire convierten a nuestras soluciones en dispositivos todoterreno capaces de monitorizar las condiciones atmosféricas en zonas remotas sin conexión eléctrica o con un suministro irregular.",
  "La recopilación de las variables meteorológicas hace posible, asimismo, analizar la incidencia del tiempo en la concentración o los niveles de inmisión de los distintos contaminantes.",
];

export const INTRO_RIGHT_LEAD = "Acoplados externamente al dispositivo, recopilan y aportan:";

export const INTRO_RIGHT_ITEMS: string[] = [
  "Información meteorológica y atmosférica (dirección y velocidad del viento, precipitación, estrés térmico, radiación solar, radiación ultravioleta UV-A, etc.)",
  "Independencia energética, gracias a la batería interna con las que se equipan las estaciones y la posibilidad de conectar un panel solar. Los equipos Kunak AIR también se pueden conectar, no obstante, a la corriente eléctrica.",
];

/**
 * "Artículos y Guías" — el original SORTEA los 3 posts en cada carga (mismo
 * comportamiento que /monitor-calidad-aire, pendiente P4). Aquí va congelado
 * el set capturado en el recon del 2026-07-27; no es comparable px a px.
 */
export const ACCESORIOS_ARTICLES: BlogPost[] = [
  {
    title: "EHS industrial, transformando el entorno laboral en un lugar seguro",
    date: "Sep 29, 2023",
    image: "/images/uploads/2023/09/EHS-industrial-1024x683.webp",
    href: "https://kunakair.com/es/ehs-industrial/",
  },
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
    title: "Impacto ambiental de la industria petroquímica, el coste invisible del progreso",
    date: "Mar 31, 2025",
    image: "/images/uploads/2025/03/Industria-petroquimica-1024x686.jpg",
    href: "https://kunakair.com/es/impacto-ambiental-de-la-industria-petroquimica/",
  },
];

/** Breadcrumb: el último nivel va sin enlace. */
export const BREADCRUMB: { label: string; href?: string }[] = [
  // ruta local: la home ya está clonada — original: https://kunakair.com/es/
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "https://kunakair.com/es/productos/" },
  { label: "Accesorios" },
];
