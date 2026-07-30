/**
 * Content type del arquetipo **MONOGRÁFICO TÉCNICO** + las dos páginas vivas.
 *
 * Recon:   docs/research/monografico-tecnico/PAGE_TOPOLOGY.md
 * Modelo:  docs/research/monografico-tecnico/MODELO.md
 * Specs:   docs/research/monografico-tecnico/components/*.spec.md
 * Decisiones: docs/research/monografico-tecnico/DECISIONES.md
 * Original: https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/
 *           https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/
 *
 * ── Por qué NO es el arquetipo SECTOR, aunque cuelgue de /sectores/ ─────────
 * Son piezas largas de contenido divulgativo con apartados propios que
 * **terminan** con la cola comercial de SECTOR. El sector es el pie de la
 * página, no su forma. Lo decidió el recon **antes** de escribir código.
 *
 * ── El cuerpo no es una lista de bloques: es el árbol de Divi ──────────────
 * `sección → fila → columna → pila de módulos`. Es más general que el cuerpo de
 * SECTOR y probablemente lo contiene; si lo contiene o no lo decide
 * `EXPERIMENTO-URBANO.md`, que se corre DESPUÉS de construir esto.
 *
 * ── El discriminador que separa plantilla de contenido ─────────────────────
 * En Divi, **lo que el editor no toca es responsive (un % del padre); lo que
 * toca queda en px absolutos, iguales a 1440 y a 390.** Medido sin excepción en
 * las 19 filas, 6 secciones y ~60 módulos de las dos páginas. Por eso los
 * campos de ritmo de aquí abajo son `number` (px) y **opcionales**: omitido =
 * el default responsive, que vive en el componente.
 *
 * ── Regla de rutas locales ────────────────────────────────────────────────
 * Aplicada: el único destino ya clonado que aparece es `/monitor-calidad-aire`
 * (Petróleo S1F0). El resto —contacto, descarga de catálogo, informe técnico—
 * sigue apuntando al original porque no está clonado.
 */

import type { BlogPost, CaseStudy, Product } from "@/types/kunak";
import type {
  SectorBreadcrumbItem,
  SectorCtaSlide,
  SectorHeader,
  SectorImage,
  SectorLink,
} from "./sectores";
import { SECTOR_SOLUCIONES } from "./sectores";

/* ────────────────────────────── content type ───────────────────────────── */

/**
 * Token de columna de Divi. **No es el enum de los valores vistos**: es la
 * retícula. Escrito solo desde EDAR habría salido de cuatro valores
 * (`4_4 · 1_2 · 1_4 · 3_4`) y Petróleo estrena otros cuatro — catch 1 de
 * `MODELO.md` §2. El componente traduce token → `%`.
 */
export type MonoAncho =
  | "1_4"
  | "1_3"
  | "2_5"
  | "1_2"
  | "3_5"
  | "2_3"
  | "3_4"
  | "4_4";

/**
 * Overrides de ritmo de sección y fila, en **px absolutos**. Omitido = el
 * default responsive de la plantilla:
 *
 * | nivel | default (1440 / 390) |
 * |---|---|
 * | sección `mt` · `pt` · `pb` | `0` · `4% → 57.5938 / 50` · `4%` |
 * | fila `pt` · `pb` | `2% → 28.7969 / 30` |
 */
export interface MonoRitmo {
  mt?: number;
  pt?: number;
  pb?: number;
}

/**
 * Overrides de ritmo de MÓDULO, en px absolutos. El default es
 * `mb 2.75% → 34.0469 / 30`.
 *
 * ⚠ **La regla "0 si es el último de su columna" del recon NO se sostiene**, y
 * por eso el `mb` viaja siempre en el dato en vez de deducirse de la posición.
 * Medido en los ~70 módulos de las dos páginas, la rompen 12:
 *
 * | caso | instancias |
 * |---|---|
 * | botón último **con `mb 16`** | 7 de 7 — el wrapper del botón no se entera de ser el último |
 * | texto último con su override (`mb 41`) | 2 |
 * | imagen última con el default responsive | 1 (EDAR S0F2) |
 * | módulo **no** último con `mb 0` | 2 |
 *
 * O sea: no es una regla de plantilla, es lo que suele salir. Cablearla habría
 * metido +16 en siete filas y ~±37 en otras tres.
 */
export interface MonoRitmoModulo {
  mt?: number;
  mb?: number;
  pt?: number;
  pb?: number;
  pr?: number;
  /**
   * Divi tiene **dos** defaults responsive de `margin-bottom` para módulos y el
   * dato solo elige cuál; no caben en `mb` porque no son un px, cambian con el
   * ancho:
   *
   * | | @1440 | @390 | instancias |
   * |---|---|---|---|
   * | el de siempre (2.75%) | 34.0469 | 30 | todo lo demás, incluidos los 31 punteados y 1 imagen |
   * | **`mbAlterno`** (3%) | 37.1406 | 10.0469 | **1**: EDAR S0F2C0M2 |
   *
   * El recon lo daba al revés —"módulo de imagen: 3%"— porque la única imagen
   * que midió con `mb` propio era ésa. Con las 11 imágenes del cuerpo delante,
   * la que se sale es ella.
   */
  mbAlterno?: boolean;
}

export interface MonoSeccion extends MonoRitmo {
  filas: MonoFila[];
}

export interface MonoFila extends MonoRitmo {
  columnas: MonoColumna[];
}

export interface MonoColumna {
  ancho: MonoAncho;
  /**
   * El `punteado.svg` que cuelga −65px a la izquierda de la fila. **Es un
   * booleano por columna, no un adorno del bloque**: EDAR lo pone en las dos
   * columnas cuando las dos llevan contenido; Petróleo solo en la 0, incluso
   * cuando la 0 es la foto. No hay regla de plantilla que dé los dos repartos.
   */
  punteado?: boolean;
  /**
   * Hueco bajo la columna **cuando apila a 390**. Default: `30` si no es la
   * última de su fila, `0` si lo es.
   *
   * Es campo porque hay excepciones, y las dos páginas coinciden en cuál: la
   * primera columna de la fila de cierre comercial (EDAR S2F1, Petróleo S2F0)
   * va a **0** sin ser la última. Dos instancias de dos páginas distintas
   * acordando lo mismo ya no es una casualidad; cablear el 30 metía +30 en esa
   * fila de las dos.
   */
  mbMovil?: number;
  modulos: MonoModulo[];
}

/** Nivel del heading. Manda la tipografía; ver `MonoModulo`. */
export type MonoNivel = 2 | 3 | 4;

/**
 * Los bloques que caben dentro de UN módulo de texto de Divi. Es una lista y no
 * campos fijos porque un solo `et_pb_text` mezcla heading, párrafos y listas
 * **con un único `margin-bottom`**: partirlo en dos módulos metería 34px de
 * aire donde el original pone los 10 del `padding-bottom` del heading.
 */
/**
 * Un trozo de texto con su marcado en línea. `b` es `<strong>`.
 *
 * **No es HTML, y no puede llegar a serlo**: el conjunto está cerrado, igual
 * que `MonoCelda`. Si mañana aparece cursiva o un enlace en línea, se añade un
 * caso — no un campo `html`.
 */
export type MonoTrozo = string | { b: string };

/**
 * Texto que puede llevar marcado: **`string` si va limpio**, lista de trozos si
 * no. Los dos tercios largos del cuerpo son `string`, así que el dato se lee.
 *
 * Hace falta porque en estas dos páginas hay **56 bloques con `<strong>`**, y
 * la negrita **no** es siempre un rótulo al principio: aparece a mitad de
 * frase. Un par `{fuerte, resto}` como el de la tabla no la representa.
 *
 * Y no es solo cosmética: la negrita es más ancha, así que **cambia dónde
 * envuelve el texto**. Sin ella, un `li` de Petróleo S1F3 salía a 3 renglones
 * donde el original va a 4 — **−30.59 a 390**, y a 1440 no se notaba nada.
 */
export type MonoInline = string | MonoTrozo[];

export type MonoBloqueTexto =
  | {
      p: MonoInline;
      /**
       * `padding-bottom` del párrafo. Default: **18 si le sigue algo, 0 si es
       * el último** — la rítmica Divi, verificada en los 30 párrafos del cuerpo
       * de las dos páginas.
       *
       * Con **una** excepción, y por eso el campo existe: el `p` de EDAR
       * S0F1C0 va a `0` teniendo un `ul` detrás. Es el mismo módulo que lleva
       * `lh: 45`; con una sola instancia no se puede decir si una cosa causa la
       * otra, así que se replica el dato y no se inventa la regla.
       */
      pb?: number;
    }
  | { ul: MonoInline[] }
  | { claim: string; nivel?: MonoNivel }
  | { titular: string; nivel?: MonoNivel };

/** Celda de tabla: texto plano, o destacado + resto. **Nunca HTML.** */
export type MonoCelda = string | { fuerte: string; resto?: string };

/**
 * Un módulo de Divi dentro de la pila de una columna.
 *
 * ── `titular` vs `claim`: el discriminador es el `<span>`, y decide la escala ─
 * En el cuerpo, el color azul **siempre** lo pone un `<span style="color:…">`
 * escrito a mano; el heading en sí computa `#333`. Medido a los dos anchos, eso
 * viene acompañado de dos escalas tipográficas distintas:
 *
 * | papel | @1440 | @390 | ¿se mueve? |
 * |---|---|---|---|
 * | `titular` (sin span) | 44 / 55 | 35 / 43.75 | **sí → plantilla** |
 * | `claim` h2 | 37 / 37 | 37 / 37 | no |
 * | `claim` h3 | 32 / 32 | 32 / 32 | no |
 * | `claim` h4 | 26 / 26 | 26 / 26 | no |
 *
 * O sea: por el discriminador de Divi, **el tamaño del claim es un override
 * editorial**, no plantilla — y la spec lo daba por plantilla, con el `claim`
 * h3 a 44/55 cuando el original lo pinta a **32**. Construir desde la spec sin
 * medir habría dejado esa fila con el claim 12px más grande.
 *
 * No se abre un campo `fs` porque el valor está **predicho por `nivel` en las
 * 12 instancias medidas** (h2→37 · h3→32 · h4→26). El día que una instancia
 * rompa esa correlación, entonces sí: `fs` pasa a campo.
 */
interface MonoModuloBase {
  ritmo?: MonoRitmoModulo;
  /**
   * **Ancho del módulo como % de su columna.** Default 100.
   *
   * Ni el recon ni las specs lo midieron, y es el campo que más altura movía:
   * los `titular` van al **80%** y envuelven a tres renglones donde a ancho
   * completo entran en dos. Pintarlos al 100% costaba −55 por instancia.
   *
   * Valores medidos, los mismos a 1440 y a 390: **70 · 80 · 90 · 100**.
   *
   * ⚠ **Aquí NO vale el discriminador de los dos anchos**, y conviene decirlo:
   * en Divi el ancho de módulo se escribe en % igual que el default, así que
   * el número se mueve con el ancho en los dos casos. Lo que lo delata como
   * campo es lo de siempre —**varía de un módulo a otro dentro de la misma
   * página**—, no el test de las dos medidas. El discriminador separa ritmo de
   * plantilla; no clasifica cualquier propiedad.
   */
  anchoPct?: number;
}

export type MonoModulo =
  | ({ kind: "titular"; texto: string; nivel?: MonoNivel } & MonoModuloBase)
  | ({ kind: "claim"; texto: string; nivel?: MonoNivel } & MonoModuloBase)
  | ({
      kind: "texto";
      bloques: MonoBloqueTexto[];
      /**
       * `line-height` de los `p` y `li` del módulo. Default **30.6**.
       *
       * También es campo, y por la misma razón: medido a los dos anchos da el
       * mismo número, y **cambia de módulo a módulo dentro de la misma página**
       * — 30.6 · 36 · 45 en EDAR. La spec lo tenía al revés: daba 30.6 por
       * plantilla y llamaba "excepción" al 36 de Petróleo S0F1C0, cuando en
       * EDAR hay tres módulos a 36 y uno a 45.
       */
      lh?: number;
    } & MonoModuloBase)
  | ({
      kind: "serie";
      /**
       * Pares `h4 + p` dentro de UN `et_pb_text`, los dos con
       * `padding-left: 40px` inline. **No es un `blurb` ni una lista**: no hay
       * marcador (`::before` computa `content: none`). El indentado de 40 es
       * plantilla de la serie: 13 de 13 lo llevan.
       */
      items: { titulo: string; texto: string }[];
    } & MonoModuloBase)
  | ({
      kind: "tabla";
      /**
       * Tabla **genérica**, no cuatro columnas con nombre: Petróleo no tiene
       * tabla, así que n = 1, y un esquema con nombres sería S9–S11 aplicado al
       * esquema del CMS. Ver `DECISIONES.md` (a).
       */
      cabeceras: string[];
      filas: MonoCelda[][];
    } & MonoModuloBase)
  | ({ kind: "imagen"; src: string; alt: string } & MonoModuloBase)
  | { kind: "boton"; label: string; href: string; external?: boolean }
  | ({
      /** El shortcode `calls`, piel `"fondo"`. Reutiliza `CtaDescarga` tal cual. */
      kind: "ctaDescarga";
      title: string;
      body: string[];
      cta: SectorLink;
      image: string;
    } & MonoModuloBase)
  | ({
      /** Mapa de proyectos. Su cabecera `h2 + p` es un módulo `texto` aparte. */
      kind: "mapaProyectos";
      pins: { title: string; lat: number; lng: number }[];
    } & MonoModuloBase);

/**
 * Un módulo de texto de la columna derecha del hero.
 *
 * **La columna derecha es una LISTA, no `claim + párrafos`** (catch 3 de
 * `MODELO.md`): SECTOR monta 2 módulos y el monográfico 3, y el primero de
 * Petróleo está **vacío** — altura 0 pero `margin-bottom: 16`. Omitirlo deja la
 * página 16px corta del hero al pie.
 */
export interface MonoHeroModulo {
  heading?: string;
  /**
   * Color del `<span>` del heading. **Varía dentro de una misma página**: en
   * EDAR el primer módulo es `#0c71c3` y los otros dos `#0075c9`. Por eso el
   * `hero.headingColor` de `SectorPage` —un color por página— no puede
   * representar este hero.
   *
   * `#0c71c3` es **el azul de serie de Divi**, no el de marca, y el reparto
   * medido lo confirma como descuido y no como decisión: aparece **solo** en el
   * primer heading del hero de EDAR y de Industria, y **en ningún módulo del
   * cuerpo** de ninguna de las cuatro páginas, donde los 28 `<span>` son
   * `#0075c9`. O sea: quien editó tocó el color (hay `<span>` escrito a mano)
   * pero cogió la muestra por defecto del selector en vez del azul de marca.
   * Se replica **a propósito** — fidelidad al píxel sobre criterio propio — y
   * queda anotado como error del original, no como característica del
   * arquetipo. Por defecto, el de marca.
   */
  headingColor?: string;
  paragraphs?: string[];
  /** `margin-bottom` del módulo. Default 34.0469 / 30; 0 si es el último. */
  mb?: number;
}

export interface MonoHero {
  image: SectorImage;
  /** Los dos botones azules bajo la foto. */
  ctas: SectorLink[];
  modulos: MonoHeroModulo[];
  /**
   * `padding-bottom` de la sección en **desktop**: 39 en este arquetipo y 60 en
   * SECTOR. A 390 los cuatro valen 20, así que sólo el de desktop distingue.
   */
  pb?: number;
}

export interface MonograficoPage {
  /** Último segmento de la ruta: /sectores/<slug>. */
  slug: string;
  seo: { title: string; description: string; ogImage: string; canonical: string };
  breadcrumb: SectorBreadcrumbItem[];
  /** Reutiliza `CabeceraSector` **tal cual**: idéntica al céntimo en las 4 páginas. */
  header: SectorHeader;
  hero: MonoHero;
  cuerpo: MonoSeccion[];
  ctaSlides: SectorCtaSlide[];
  soluciones: Product[];
  proyectos: { title: string; cta: SectorLink; posts: CaseStudy[] };
  articulos: { title: string; cta: SectorLink; posts: BlogPost[] };
  taxonomy: SectorLink;
  footerStripImage: string;
}

/* ─────────────────────── cola compartida por las dos ───────────────────── */

/**
 * Las 3 diapositivas del CTA de ancho completo. Las dos páginas montan las de
 * la taxonomía **industria**, o sea las mismas que ve Industria… **salvo una
 * palabra**: aquí la primera dice `inmisiones` y en
 * `/sectores/control-de-emisiones-industriales` dice `inisiones`.
 *
 * Comprobado contra el HTML servido de las tres páginas (2026-07-29), no
 * deducido: es una errata del original que vive **solo** en Industria. Copiar
 * los datos de Industria "porque el slider es el mismo" la habría traído aquí.
 */
const CTA_SLIDES_INDUSTRIA: SectorCtaSlide[] = [
  {
    heading: "Reduce el impacto ambiental midiendo las inmisiones industriales",
    cta: { label: "Podemos ayudarte", href: "https://kunakair.com/es/contacto/" },
    image:
      "/images/uploads/2023/02/Limitation-of-the-environmental-impact-of-industrial-activity.jpg",
  },
  {
    heading:
      "Mejora la calidad del aire y la salud de tus trabajadores con la monitorización ambiental",
    cta: {
      label: "Protege a tus trabajadores",
      href: "https://kunakair.com/es/contacto/",
    },
    image: "/images/uploads/2023/02/industry-worker.jpg",
  },
  {
    heading: "Mide el impacto de tu actividad industrial en la calidad del aire",
    cta: {
      label: "Obtén información fiable",
      href: "https://kunakair.com/es/contacto/",
    },
    image: "/images/uploads/2023/02/inudstry-operator.jpg",
  },
];

/**
 * "Últimos proyectos" — los 3 casos de la taxonomía `sector/industria`, que es
 * la que filtra las dos páginas (no `sector/edar`, aunque el kicker diga EDAR).
 * Idénticos a los de `/sectores/control-de-emisiones-industriales`.
 */
const PROYECTOS_INDUSTRIA: CaseStudy[] = [
  {
    client: "Virginia Department of Environmental Quality (DEQ)",
    sector: "Industria",
    sectorHref: "https://kunakair.com/es/sector/industria/",
    title:
      "Monitorización de la calidad del aire en el mayor corredor de centros de datos de EE.UU",
    image: "/images/uploads/2026/05/639130508516830000.jpg",
    href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos/",
  },
  {
    client: "BASF SE",
    sector: "Industria",
    sectorHref: "https://kunakair.com/es/sector/industria/",
    title:
      "Monitorización de la calidad del aire en la planta petroquímica de BASF en Ludwigshafen (Alemania)",
    image:
      "/images/uploads/2025/05/Air-quality-monitoring-at-BASF-chemical-plant-in-Ludwigshafen-Germany-1024x683.jpg",
    href: "https://kunakair.com/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-una-planta-petroquimica-en-alemania/",
  },
  {
    client: "Planta de procesamiento de alimentos",
    sector: "Industria",
    sectorHref: "https://kunakair.com/es/sector/industria/",
    title:
      "Análisis de la calidad del aire en una planta de procesamiento de alimentos en Singapur",
    image: "/images/uploads/2025/01/food-processing-plant-in-Singapore-1024x683.jpg",
    href: "https://kunakair.com/es/casos-de-exito/calidad-del-aire-en-planta-procesamiento-alimentos-singapur/",
  },
];

const PROYECTOS_CTA: SectorLink = {
  label: "Ver todos los casos de éxito",
  // el original apunta a /case-studies/ (SIN /es/) y con target="_blank"
  href: "https://kunakair.com/case-studies/",
  external: true,
};

const ARTICULOS_CTA: SectorLink = {
  label: "Amplia tus conocimientos con nuestras guías",
  href: "https://kunakair.com/es/recursos/guias/",
};

const BREADCRUMB_BASE: SectorBreadcrumbItem[] = [
  // ruta local: esta página ya está clonada (src/app/page.tsx)
  // original: https://kunakair.com/es/
  { label: "Inicio", href: "/" },
  // el índice /es/sectores/ NO está clonado todavía
  { label: "Sectores", href: "https://kunakair.com/es/sectores/" },
];

/* ──────────────────────────── datos: EDAR ──────────────────────────────── */

/**
 * Primera instancia del arquetipo. Aporta lo que Petróleo no tiene: la
 * `<table>`, el `mapaProyectos`, el reparto de punteado en las dos columnas y
 * el `#0c71c3` del primer heading del hero.
 *
 * Objetivos numéricos @1440 (`seccion-editorial.spec.md` §6): `docH` **11136**;
 * secciones 3675.81 · 581.8 · 2384.31.
 */
export const MONOGRAFICO_EDAR: MonograficoPage = {
  slug: "monitorizacion-ambiental-y-control-de-olores-en-edar",

  seo: {
    title: "Monitorización ambiental en EDAR para el control de emisiones",
    description:
      "Monitorización ambiental continua en EDAR para controlar emisiones y olores y anticipar desviaciones de proceso con datos reales.",
    ogImage: "/images/uploads/2026/04/WWTP.jpg",
    canonical:
      "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
  },

  breadcrumb: [
    ...BREADCRUMB_BASE,
    { label: "Monitorización ambiental y control de olores en EDAR" },
  ],

  header: {
    kicker: "EDAR",
    title:
      "Monitorización ambiental en EDAR para el control de emisiones y olores",
    image: "/images/uploads/2026/04/WWTP.jpg",
  },

  hero: {
    pb: 39,
    image: {
      src: "/images/uploads/2026/04/10.jpg",
      alt: "Control continuo de emisiones y olores en plantas de tratamiento de aguas residuales",
    },
    ctas: [
      {
        label: "Solicita una demo técnica",
        href: "https://kunakair.com/es/contacto/",
      },
      {
        label: "Descargar catálogo",
        href: "https://kunakair.com/es/descarga-catalogo/",
      },
    ],
    modulos: [
      {
        heading: "Olores bajo control en EDAR",
        // el azul de serie de Divi, no el de marca — ver `MonoHeroModulo`
        headingColor: "#0c71c3",
        mb: 16,
      },
      {
        heading:
          "Monitorización continua de emisiones para una gestión más eficiente de los procesos",
        paragraphs: [
          "Obtén datos en tiempo real para anticiparte a desviaciones, optimizar la operación y demostrar control ambiental en tu EDAR.",
        ],
      },
      {
        heading: "Medir puntualmente no es gestionar",
        paragraphs: [
          "Las emisiones de gases y los episodios de olor forman parte del funcionamiento normal de una EDAR. Su aparición está ligada a la carga del influente, la operación del proceso y las condiciones meteorológicas.",
          "Las campañas puntuales no capturan esta variabilidad. No permiten detectar picos, identificar patrones ni explicar por qué se producen determinados episodios.",
          "Sin datos continuos, la gestión del olor se vuelve reactiva. Con monitorización continua, el olor pasa a ser una señal operativa.",
        ],
      },
    ],
  },

  /* ── cuerpo de edar — emitido del original, no transcrito ── */
  cuerpo: [
    {
      // S0 · alto medido 3675.8125
      filas: [
        {
          // S0F0 · alto 570.8125 · [1_2 + 1_2]
          pb: 60,
          columnas: [
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "¿Qué cambia con monitorización continua?", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    { claim: "De reaccionar tarde a tener control" },
                    { claim: "" },
                    {
                      ul: [
                        ["Visibilidad real de ", { b: "lo que ocurre en cada fase" }, " de la planta."],
                        ["Detección temprana de ", { b: "picos y anomalías" }, " de proceso."],
                        ["Capacidad de ", { b: "actuar antes" }, " de que el impacto llegue al entorno."],
                        ["Datos continuos, trazables y defendibles ante ", { b: "auditorías e inspecciones" }, "."],
                      ],
                    },
                  ],
                 ritmo: { mb: 41 },
                },
              ],
            },
            {
              ancho: "1_2",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/red-de-monitorizacion-ambiental-edar.jpg", alt: "Red de monitorización ambiental en EDAR - Kunak", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S0F1 · alto 544.8438 · [4_4]
          pb: 72,
          columnas: [
            {
              ancho: "4_4", punteado: true,
              modulos: [
                { kind: "titular", texto: "¿Qué gases se deben medir en una EDAR?", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    { claim: "Los gases clave que puedes controlar en continuo" },
                    { p: "Las soluciones de Kunak permiten monitorizar directamente los principales gases relevantes en plantas de tratamiento de aguas residuales.", pb: 0 },
                    {
                      ul: [
                        [{ b: "H" }, { b: "2" }, { b: "S (sulfuro de hidrógeno)." }, " Principal gas odorífero. Asociado a quejas, corrosión y riesgos para la seguridad."],
                        [{ b: "NH" }, { b: "3" }, { b: " (amoniaco)." }, " Indicador de condiciones operativas y desequilibrios del proceso biológico."],
                        [{ b: "COV (compuestos orgánicos volátiles)." }, " Señal de influente séptico y procesos anaerobios."],
                        [{ b: "CH" }, { b: "4" }, { b: " (metano)." }, " Relevante en digestión y línea de fangos. Indicador de eficiencia y posibles fugas."],
                        ["Otros gases como ", { b: "SO" }, { b: "2" }, { b: ", NO, N" }, { b: "2" }, { b: "O, O" }, { b: "3" }, { b: " y CO" }, { b: "2" }, " para contextualización ambiental y control perimetral."],
                      ],
                    },
                  ],
                 lh: 45,
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
        {
          // S0F2 · alto 966.1406 · [4_4]
          columnas: [
            {
              ancho: "4_4", punteado: true,
              modulos: [
                { kind: "titular", texto: "¿Dónde se generan las emisiones en la planta?", anchoPct: 80 },
                { kind: "claim", texto: "Cada fase, gases y riesgos distintos" },
                // única imagen del sitio con el OTRO default responsive (3%)
                { kind: "imagen", src: "/images/uploads/2026/04/EDAR-Flujo-de-procesos-gases-y-riesgos-de-olor.jpg", alt: "EDAR: Flujo de procesos, gases y riesgos de olor - Kunak", ritmo: { mbAlterno: true } },
              ],
            },
          ],
        },
        {
          // S0F3 · alto 935.1406 · [4_4]
          columnas: [
            {
              ancho: "4_4", punteado: true,
              modulos: [
                { kind: "claim", texto: "Tabla resumen: procesos y emisiones" },
                {
                  kind: "tabla",
                  cabeceras: ["Fase del proceso", "Gases generados", "Nivel de olor y riesgo", "Valor operativo del control"],
                  filas: [
                    [
                      { fuerte: "Llegada e impulsión" },
                      "H₂S, CH₄, CO₂",
                      { fuerte: "Olor muy alto", resto: ". Zona crítica con picos repentinos y riesgo para la seguridad." },
                      "Detectar influente séptico y acumulaciones. Anticipar picos súbitos y reducir riesgos en puntos cerrados.",
                    ],
                    [
                      { fuerte: "Tratamiento preliminar" },
                      "H₂S, NH₃, CO₂",
                      { fuerte: "Olor alto", resto: ". Principal foco de quejas si hay retenciones o mala ventilación." },
                      "Identificar acumulación de sólidos, fallos de ventilación y actuar antes de que el olor salga al exterior.",
                    ],
                    [
                      { fuerte: "Decantación primaria" },
                      "H₂S, CH₄ (bajo), CO₂",
                      { fuerte: "Olor alto", resto: " si no hay cubrición o purgas eficientes." },
                      "Detectar fermentación de lodos y validar la eficacia de purgas y cubiertas.",
                    ],
                    [
                      { fuerte: "Tratamiento biológico" },
                      "NH₃, CO₂, N₂O",
                      { fuerte: "Olor bajo", resto: " en operación normal. Riesgo operativo por desequilibrios del proceso." },
                      "Detectar desviaciones del proceso biológico. El N₂O actúa como indicador de eficiencia y sostenibilidad.",
                    ],
                    [
                      { fuerte: "Tratamiento terciario (si aplica)" },
                      "Cl₂, O₃ (puntual)",
                      { fuerte: "Olor bajo", resto: ". Riesgo químico puntual por dosificación incorrecta." },
                      "Controlar episodios localizados y verificar la correcta dosificación de reactivos.",
                    ],
                    [
                      { fuerte: "Línea de fangos" },
                      "H₂S, NH₃, CO₂, CH₄",
                      { fuerte: "Olor muy alto", resto: ". Principal fuente de olor persistente en la EDAR." },
                      "Identificar digestión inestable, fugas y almacenamiento prolongado. Justificar mejoras e inversiones.",
                    ],
                    [
                      { fuerte: "Almacenamiento y carga de lodos" },
                      "H₂S, NH₃",
                      { fuerte: "Olor alto e intenso", resto: ", episodios cortos y localizados." },
                      "Controlar operaciones de carga y descarga y prevenir episodios críticos puntuales.",
                    ],
                    [
                      { fuerte: "Perímetro de la planta" },
                      "Mezcla global de gases según viento",
                      { fuerte: "Olor percibido por terceros", resto: ". Riesgo reputacional y de quejas." },
                      "Atribuir correctamente episodios con datos y meteorología. Responder a quejas con evidencias.",
                    ],
                  ],
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
        {
          // S0F4 · alto 543.6875 · [1_4 + 3_4]
          columnas: [
            {
              ancho: "1_4", punteado: true,
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/alert-cloud-vertical-web-3.jpg", alt: "", ritmo: { mb: 0 } },
              ],
            },
            {
              ancho: "3_4",
              modulos: [
                { kind: "titular", texto: "Alertas y toma de decisiones", anchoPct: 80, ritmo: { mb: 0, pb: 15 } },
                { kind: "claim", texto: "Actúa antes de que el problema sea una realidad" },
                {
                  kind: "texto",
                  bloques: [
                    {
                      ul: [
                        "Umbrales configurables por gas y zona.",
                        "Alertas automáticas ante superaciones.",
                        "Registro del evento y de la actuación aplicada.",
                      ],
                    },
                    { p: ["Las alertas permiten detectar ", { b: "desviaciones" }, " incipientes, validar ", { b: "medidas correctivas" }, " y evitar la ", { b: "repetición" }, " de episodios."] },
                  ],
                 lh: 36,
                },
                { kind: "boton", label: "Solicita una demo técnica", href: "https://kunakair.com/es/contacto/" },
              ],
            },
          ],
        },
      ],
    },
    {
      // S1 · alto medido 581.7969
      filas: [
        {
          // S1F0 · alto 466.6094 · [1_2 + 1_2]
          columnas: [
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "Control perimetral y gestión de quejas", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    { claim: "Responder con hechos,no con suposiciones" },
                    { p: ["La correlación entre concentraciones de ", { b: "gases y variables meteorológicas" }, " permite interpretar correctamente cada episodio, ", { b: "identificar la fuente real" }, " y descartar aportes externos."] },
                    { p: "Esto refuerza la posición técnica de la EDAR frente a vecinos, administración e inspección." },
                  ],
                 ritmo: { mb: 0 },
                },
              ],
            },
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "Seguridad y prevención en planta", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    { claim: "Una capa adicional de protección" },
                    { p: ["La monitorización continua de gases como H2S, NH3 y CH4 complementa los ", { b: "protocolos de prevención" }, " en zonas de riesgo, aportando ", { b: "visión global" }, " y capacidad de ", { b: "anticipación" }, "."] },
                  ],
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // S2 · alto medido 2384.3125
      mt: -14, pb: 14,
      filas: [
        {
          // S2F0 · alto 598.6406 · [1_2 + 1_2]
          columnas: [
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "Beneficios clave para la operación de una EDAR", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    {
                      ul: [
                        ["Controla e identifica las ", { b: "fuentes de olores" }, "."],
                        ["Detecta ", { b: "anomalías de proceso" }, " antes de que se conviertan en incidencias."],
                        ["Permite anticiparse a ", { b: "picos críticos" }, " sin depender solo de rondas."],
                        ["Aporta ", { b: "información objetiva" }, " para actuar con rapidez."],
                        ["Ayuda a evitar la ", { b: "repetición" }, " de episodios recurrentes."],
                        ["Facilita saber qué ", { b: "medidas" }, " funcionan y cuáles no."],
                        ["Aumenta el ", { b: "control" }, " y la ", { b: "estabilidad operativa" }, " de la planta."],
                        ["Reduce la probabilidad de que pequeñas ", { b: "desviaciones" }, " escalen."],
                        ["Genera ", { b: "registros trazables" }, " para informes y auditorías."],
                      ],
                    },
                  ],
                 lh: 36,
                 ritmo: { mb: 0 },
                },
              ],
            },
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "Aplicaciones reales de la monitorización ambiental", anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    {
                      ul: [
                        ["Control continuo de ", { b: "olores" }, " en zonas críticas."],
                        ["Detección temprana de ", { b: "influente séptico" }, " en cabecera."],
                        ["Supervisión operativa del ", { b: "tratamiento biológico" }, "."],
                        ["Identificación de ", { b: "focos persistentes" }, " de olor."],
                        [{ b: "Monitorización perimetral" }, " con apoyo meteorológico."],
                        ["Atribución técnica de ", { b: "quejas" }, " vecinales."],
                        ["Validación del rendimiento de ", { b: "sistemas de desodorización" }, "."],
                        ["Generación de ", { b: "históricos ambientales" }, " fiables."],
                      ],
                    },
                  ],
                 lh: 36,
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
        {
          // S2F1 · alto 478.875 · [1_2 + 1_2]
          pt: 0, pb: 60,
          columnas: [
            {
              // única columna no-última con hueco 0 a 390 (ver mbMovil)
            ancho: "1_2", mbMovil: 0,
              modulos: [
                { kind: "titular", texto: "Da el siguiente paso", anchoPct: 80, ritmo: { mb: 20 } },
                { kind: "claim", texto: "Actúa antes de que el problema escale", ritmo: { pr: 25 } },
                {
                  kind: "texto",
                  bloques: [
                    { p: ["Descubre cómo la monitorización ambiental continua puede ayudarte a ", { b: "controlar emisiones" }, ", ", { b: "reducir olores" }, " y tomar mejores ", { b: "decisiones operativas" }, " en tu EDAR."] },
                  ],
                },
                { kind: "boton", label: "Solicita una demo técnica", href: "https://kunakair.com/es/contacto/" },
              ],
            },
            {
              ancho: "1_2",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/edar-monitorizacion-ambiental.jpg", alt: "control emisiones industriales y olores", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S2F2 · alto 495.0156 · [4_4]
          pt: 0,
          columnas: [
            {
              ancho: "4_4",
              modulos: [
                {
                  kind: "ctaDescarga",
                  title: "¿Quieres controlar el impacto de tus procesos en la calidad del aire?",
                  body: [
                    "Descarga el informe técnico [PDF] sobre la red de control de la calidad del aire desplegada en la planta de Cemex.",
                    "Descubre cómo Cemex ha conseguido controlar las emisiones y tener bajo control el impacto ambiental de la producción de cemento.",
                  ],
                  cta: { label: "Descargar informe", href: "https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-industria/", external: true },
                  image: "/images/uploads/2024/11/cta-informe-tecnico-industria-scaled.jpg",
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
        {
          // S2F3 · alto 740.1875 · [4_4]
          columnas: [
            {
              ancho: "4_4", punteado: true,
              modulos: [
                {
                  kind: "texto",
                  bloques: [
                    { titular: "Proyectos por todo el mundo", nivel: 2 },
                    { p: "Algunos de los proyectos de monitorización medioambiental en diferentes plantas." },
                  ],
                 anchoPct: 90,
                 ritmo: { mb: 17 },
                },
                {
                  kind: "mapaProyectos",
                 ritmo: { mb: 0 },
                  pins: [
                    { title: "MCP - EDAR Arazuri", lat: 42.8088125, lng: -1.7268125 },
                    { title: "EDAR (Estación depuradora de aguas residuales)", lat: 43.3614375, lng: -5.8504375 },
                    { title: "EDAR (Estación depuradora de aguas residuales)", lat: 50.9991875, lng: -0.1451875 },
                    { title: "Centro de Tratamiento de Aguas Residuales", lat: 31.9565625, lng: 34.7335625 },
                    { title: "EDAR (Estación depuradora de aguas residuales)", lat: 39.9215625, lng: -105.0244375 },
                    { title: "EDAR (Estación depuradora de aguas residuales)", lat: -27.3810625, lng: 153.1473125 },
                    { title: "Canal de Isabel II", lat: 40.4134375, lng: -3.5180625 },
                    { title: "Canal de Isabel II", lat: 40.4148125, lng: -3.4091875 },
                    { title: "SAMAE WWTP", lat: -26.5069375, lng: -49.1201875 },
                    { title: "EDAR Torredembarra", lat: 41.1461625, lng: 1.4132656 },
                    { title: "Planta de tratamiento de aguas residuales", lat: 51.6755625, lng: -4.7289375 },
                    { title: "Centro de residuos y reciclaje", lat: -27.6689375, lng: 152.8154375 },
                    { title: "Planta de tratamiento de aguas residuales (PTAR)", lat: 50.8945625, lng: 0.4390625 },
                    { title: "Planta de gestión de residuos", lat: 52.4430625, lng: -0.7535625 },
                    { title: "Planta de tratamiento de aguas residuales", lat: 39.9215625, lng: -105.0244375 },
                    { title: "Planta de tratamiento de aguas residuales (PTAR)", lat: 24.9118375, lng: 55.2357031 },
                    { title: "Planta de agua reciclada", lat: -37.603456, lng: 144.9754654 },
                    { title: "Planta de tratamiento de aguas residuales", lat: -27.4179375, lng: 153.1646875 },
                    { title: "Planta de tratamiento avanzado de agua", lat: -27.439234, lng: 153.1176194 },
                    { title: "Planta de tratamiento de aguas residuales de Lilydale", lat: -37.7463125, lng: 145.3553125 },
                    { title: "Planta de tratamiento de aguas residuales Seaview", lat: -41.2374375, lng: 174.9048125 },
                    { title: "Estación Depuradora de Aguas Residuales (EDAR)", lat: 37.3098125, lng: -5.9868125 },
                    { title: "Planta de tratamiento de aguas residuales (PTAR)", lat: 25.1594875, lng: 55.4319219 },
                    { title: "Nama - Planta de tratamiento de aguas residuales (PTAR)", lat: 23.5651875, lng: 58.3369375 },
                    { title: "TAIF - Planta de tratamiento de aguas residuales (PTAR)", lat: 21.5918125, lng: 40.7010625 },
                    { title: "El Salitre - Planta de tratamiento de aguas residuales (PTAR)", lat: 4.7207926, lng: -74.074768 },
                    { title: "Planta de tratamiento de residuos Herceg Novi", lat: 42.4558375, lng: 18.5515469 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],


  ctaSlides: CTA_SLIDES_INDUSTRIA,

  soluciones: SECTOR_SOLUCIONES,

  proyectos: {
    title: "Últimos proyectos",
    cta: PROYECTOS_CTA,
    posts: PROYECTOS_INDUSTRIA,
  },

  articulos: {
    title: "Artículos y Guías",
    cta: ARTICULOS_CTA,
    /** P4 heredado: el original sortea los 3 posts en cada carga. Trío del 2026-07-29. */
    posts: [
      {
        title:
          "Control de malos olores industriales, una solución para reducir la contaminación odorífera",
        date: "Oct 28, 2022",
        image: "/images/uploads/2022/10/industrial-odour-control.jpg",
        href: "https://kunakair.com/es/monitorizacion-mal-olor-industrial/",
      },
      {
        title:
          "Contaminación de la industria de fertilizantes y su impacto en la calidad del aire",
        date: "Mar 1, 2024",
        image: "/images/uploads/2024/03/airplane-465619_1280-1024x680.jpeg",
        href: "https://kunakair.com/es/contaminacion-de-la-industria-de-fertilizantes-y-su-impacto-en-la-calidad-del-aire/",
      },
      {
        title: "El impacto del humo de incendios forestales en la calidad del aire",
        date: "Mar 3, 2021",
        image:
          "/images/uploads/2021/03/contaminacion-por-incendios-forestales-monitorizacion-aire.jpg",
        href: "https://kunakair.com/es/contaminacion-incendios-forestales-aire/",
      },
    ],
  },

  taxonomy: {
    label: "Industria",
    href: "https://kunakair.com/es/sector/industria/",
  },

  footerStripImage: "/images/uploads/2026/04/WWTP.jpg",
};

/* ──────────────────── datos: Petróleo y gas ────────────────────────────── */

/**
 * Segunda instancia. Es la que **valida el modelo**: aporta los cuatro campos
 * que EDAR sola habría fallado (`MODELO.md` §2) — los cuatro tokens de columna
 * nuevos, el `claim` de nivel 3, el módulo de hero vacío y el payload `serie`.
 *
 * Objetivos numéricos @1440: `docH` **11303**; secciones 1758.58 · 3740.3 ·
 * 1149.08.
 */
export const MONOGRAFICO_PETROLEO: MonograficoPage = {
  slug: "monitorizacion-de-emisiones-en-petroleo-y-gas",

  seo: {
    title:
      "Monitorización de emisiones y detección de fugas en Oil & Gas - Kunak",
    description:
      "Monitorización continua de emisiones en Oil & Gas. Detecta fugas de metano en tiempo real, reduce riesgos y cumple con normativa ambiental.",
    ogImage:
      "/images/uploads/2026/04/Monitorizacion-de-emisiones-en-el-sector-del-petroleo-y-gas-Kunak-1.jpg",
    canonical:
      "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
  },

  breadcrumb: [
    ...BREADCRUMB_BASE,
    // verbatim: la miga dice "petróleo y gas" y el h1 "petróleo y el gas"
    { label: "Monitorización de emisiones en el sector del petróleo y gas" },
  ],

  header: {
    kicker: "Petróleo y Gas",
    title: "Monitorización de emisiones en el sector del petróleo y el gas",
    image:
      "/images/uploads/2026/04/Monitorizacion-de-emisiones-en-el-sector-del-petroleo-y-gas-Kunak-1.jpg",
  },

  hero: {
    pb: 39,
    image: {
      src: "/images/uploads/2026/04/Monitorizacion-de-emisiones-en-el-sector-del-petroleo-y-gas-Kunak-3.jpg",
      alt: "Monitorización de emisiones en el sector Oil & Gas - Control continuo de emisiones y detección temprana de fugas en instalaciones de petróleo y gas - Kunak",
    },
    ctas: [
      {
        label: "Solicita una demo técnica",
        href: "https://kunakair.com/es/contacto/",
      },
      {
        label: "Descargar catálogo",
        href: "https://kunakair.com/es/descarga-catalogo/",
      },
    ],
    modulos: [
      // Módulo VACÍO: altura 0, pero aporta 16px reales de aire. No se puede
      // omitir — catch 3 de `MODELO.md` §2.
      { mb: 16 },
      {
        heading: "Control continuo de emisiones en instalaciones Oil & Gas",
        paragraphs: [
          "Detecta fugas antes de que se conviertan en un problema operativo o regulatorio.",
          "Las instalaciones Oil & Gas gestionan miles de posibles puntos de emisión. Muchas fugas son intermitentes, invisibles y pueden permanecer activas durante semanas sin ser detectadas.",
          "La monitorización continua permite identificar emisiones fugitivas en tiempo real, reducir pérdidas de producto y reforzar programas LDAR con datos objetivos.",
        ],
        mb: 28,
      },
      {
        heading: "El problema real: emisiones que no se ven",
        paragraphs: [
          "Las emisiones pueden originarse en válvulas, compresores, tanques o líneas de proceso, y suelen pasar desapercibidas.",
          "Incluyen metano (CH₄), gases tóxicos como H₂S y contaminantes regulados como NO₂, SO₂, CO o COV, además de partículas generadas por procesos de combustión.",
          "El impacto es directo: pérdidas económicas, riesgos operativos y presión regulatoria creciente impulsada por programas LDAR y objetivos ESG.",
        ],
      },
    ],
  },

  /* ── cuerpo de petroleo — emitido del original, no transcrito ── */
  cuerpo: [
    {
      // S0 · alto medido 1758.5781
      pb: 40,
      filas: [
        {
          // S0F0 · alto 819 · [1_3 + 2_3]
          pb: 40,
          columnas: [
            {
              ancho: "1_3", punteado: true,
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/monitorizacion-continua-sector-oil-gas-2-2.jpg", alt: "monitorización de emisiones en oil and gas - Monitorización continua de emisiones en Oil & Gas. Detecta fugas de metano en tiempo real, reduce riesgos y cumple con normativa ambiental - Kunak", ritmo: { mb: 0 } },
              ],
            },
            {
              ancho: "2_3",
              modulos: [
                { kind: "titular", texto: "De inspecciones puntuales a control continuo" },
                {
                  kind: "texto",
                  bloques: [
                    { claim: "No puedes gestionar lo que no mides de forma continua." },
                    { p: "Las redes de sensores permiten detectar emisiones incluso a baja concentración y de forma intermitente, algo que los métodos tradicionales no cubren." },
                  ],
                 ritmo: { mb: 0, pb: 23 },
                },
                {
                  kind: "serie",
                  items: [
                    { titulo: "Detecta fugas de forma temprana", texto: "Reduce el tiempo que las emisiones permanecen activas." },
                    { titulo: "Identifica patrones de emisión", texto: "Relaciona emisiones con procesos y condiciones reales." },
                    { titulo: "Optimiza campañas LDAR", texto: "Prioriza inspecciones donde y cuando realmente hay riesgo." },
                    { titulo: "Toma decisiones basadas en datos", texto: "Mejora la eficiencia operativa." },
                    { titulo: "Demuestra cumplimiento regulatorio", texto: "Obtén datos trazables para auditorías y reporting." },
                  ],
                 ritmo: { mb: 0, pb: 23 },
                },
              ],
            },
          ],
        },
        {
          // S0F1 · alto 841.9844 · [1_2 + 1_2]
          pb: 2,
          columnas: [
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "Qué necesitas para controlar las emisiones", anchoPct: 80 },
                { kind: "claim", texto: "Una red de sensores distribuidos convierte las emisiones en una variable controlable.", nivel: 3, anchoPct: 80 },
                {
                  kind: "texto",
                  bloques: [
                    {
                      ul: [
                        [{ b: "monitorización continua" }, " en tiempo real"],
                        [{ b: "cobertura espacial" }, " suficiente para identificar puntos críticos"],
                        [{ b: "mediciones fiables y comparables" }, " con estándares de referencia"],
                        [{ b: "integración" }, " con sistemas de gestión ambiental"],
                        [{ b: "alertas tempranas" }, " que permitan actuar rápidamente"],
                      ],
                    },
                  ],
                 anchoPct: 90,
                 lh: 36,
                },
                { kind: "claim", texto: "Actúa antes de que el problema sea una realidad", anchoPct: 80 },
                { kind: "boton", label: "Saber más", href: "https://kunakair.com/es/contacto/" },
              ],
            },
            {
              ancho: "1_2",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/seguridad-cumplimiento-y-eficiencia-operativa-en-la-industria-del-petroleo-y-gas-2.jpg", alt: "Seguridad, cumplimiento y eficiencia operativa en la industria del petróleo y gas - Kunak", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
      ],
    },
    {
      // S1 · alto medido 3740.2969
      filas: [
        {
          // S1F0 · alto 798.1875 · [1_2 + 1_2]
          pb: 60,
          columnas: [
            {
              ancho: "1_2", punteado: true,
              modulos: [
                { kind: "titular", texto: "La solución de Kunak", anchoPct: 80 },
                { kind: "claim", texto: "Monitorización continua diseñada para entornos industriales complejos", ritmo: { mb: 41 } },
                {
                  kind: "texto",
                  bloques: [
                    { p: ["Las estaciones ", { b: "Kunak AIR" }, " permiten desplegar redes multiparámetro para medir gases, partículas y variables ambientales en tiempo real."] },
                    {
                      ul: [
                        ["Medición simultánea de ", { b: "múltiples contaminantes" }],
                        [{ b: "Cartuchos inteligentes" }, " intercambiables"],
                        [{ b: "Datos" }, " en tiempo real y ", { b: "análisis" }, " avanzado"],
                        [{ b: "Alertas automáticas" }, " por superación de umbrales"],
                        ["Solución flexible y ", { b: "escalable" }],
                        ["Funcionamiento ", { b: "autónomo" }, " y rápida instalación"],
                      ],
                    },
                    { p: [{ b: "Implementación flexible en upstream, midstream y downstream." }] },
                  ],
                 ritmo: { mb: 41 },
                },
                // ruta local: esta página ya está clonada (src/app/monitor-calidad-aire)
                // original: https://kunakair.com/es/monitor-calidad-aire/ — tampoco
                // allí abre en pestaña nueva, así que no cambia nada más
                { kind: "boton", label: "Más información", href: "/monitor-calidad-aire" },
              ],
            },
            {
              ancho: "1_2",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/Contaminantes-que-pueden-monitorizarse-en-una-instalacion-de-petroleo-y-gas-Kunak-2.jpg", alt: "Monitorización continua diseñada para instalaciones Oil & Gas complejas - Kunak", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S1F1 · alto 550.9531 · [3_5 + 2_5]
          pb: 36,
          columnas: [
            {
              ancho: "3_5", punteado: true,
              modulos: [
                { kind: "titular", texto: "Contaminantes que pueden monitorizarse", ritmo: { mb: 26 } },
                { kind: "claim", texto: "Configuración flexible según la instalación", ritmo: { mb: 41 } },
                {
                  kind: "texto",
                  bloques: [
                    { p: ["Las estaciones ", { b: "Kunak AIR" }, " pueden configurarse para medir distintos gases y partículas en función de las necesidades de cada instalación."] },
                    {
                      ul: [
                        [{ b: "Gases" }, ": CH4, COV, NMHC, H2S, SO2, NO, NO2, NOx, CO, CO2, NH3, HCl, HF, HCN, Cl2, ClO2, O2, O3"],
                        [{ b: "Partículas" }, ": PM1, PM2.5, PM4, PM10, TSP, partículas ultrafinas"],
                      ],
                    },
                    { p: ["Además, las estaciones pueden integrar ", { b: "anemómetros, pluviómetros y otros sensores" }, " para contextualizar las emisiones."] },
                  ],
                 anchoPct: 80,
                 ritmo: { mb: 0 },
                },
              ],
            },
            {
              ancho: "2_5",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/kunak-smart-cartridges-2.jpg", alt: "", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S1F2 · alto 899.9844 · [1_3 + 2_3]
          columnas: [
            {
              ancho: "1_3", punteado: true,
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/METHANE-REFINERY-2-2.jpg", alt: "Monitorización continua diseñada para instalaciones Oil & Gas complejas - Kunak" },
                { kind: "boton", label: "Solicita una demo técnica", href: "https://kunakair.com/es/contacto/" },
              ],
            },
            {
              ancho: "2_3",
              modulos: [
                { kind: "titular", texto: "Aplicaciones en petróleo y gas", anchoPct: 70 },
                {
                  kind: "texto",
                  bloques: [
                    { p: "Las redes de sensores Kunak permiten monitorizar emisiones atmosféricas y detectar fugas en distintos tipos de instalaciones Oil & Gas." },
                  ],
                 ritmo: { mb: 30 },
                },
                {
                  kind: "serie",
                  items: [
                    { titulo: "Refinerías", texto: "Control de emisiones en unidades de proceso, tanques y antorchas." },
                    { titulo: "Plantas petroquímicas", texto: "Monitorización de emisiones fugitivas en procesos industriales complejos." },
                    { titulo: "Terminales de almacenamiento", texto: "Vigilancia ambiental en tanques y operaciones de carga y descarga." },
                    { titulo: "Estaciones de compresión", texto: "Detección de emisiones en compresores, válvulas y equipos auxiliares." },
                    { titulo: "Oleoductos y gasoductos", texto: "Monitorización ambiental en estaciones intermedias y puntos críticos." },
                    { titulo: "Plataformas de producción", texto: "Detección temprana de fugas en instalaciones de extracción." },
                    { titulo: "Procesamiento de gas", texto: "Supervisión de emisiones en unidades de tratamiento y acondicionamiento." },
                  ],
                 ritmo: { mb: 0, pb: 23 },
                },
              ],
            },
          ],
        },
        {
          // S1F3 · alto 998.5156 · [2_3 + 1_3]
          pb: 60,
          columnas: [
            {
              ancho: "2_3", punteado: true,
              modulos: [
                { kind: "titular", texto: "Monitorización de metano y detección temprana de fugas", anchoPct: 80, ritmo: { mb: 23 } },
                { kind: "claim", texto: "Detectar las fugas a tiempo permite actuar antes de que se conviertan en un problema.", anchoPct: 80, ritmo: { mb: 41 } },
                {
                  kind: "texto",
                  bloques: [
                    { p: "El metano (CH4) es uno de los principales gases de efecto invernadero del sector." },
                    { p: "Las fugas suelen ser invisibles e intermitentes, pero tienen un impacto directo en costes, seguridad y cumplimiento." },
                    {
                      ul: [
                        [{ b: "Detección temprana de fugas: " }, "Reduce el tiempo que las emisiones permanecen activas"],
                        [{ b: "Reducción de pérdidas de producto: " }, "Minimiza el impacto económico de las emisiones fugitivas"],
                        [{ b: "Mayor seguridad industrial: " }, "Identificación rápida de gases peligrosos"],
                        [{ b: "Soporte a programas LDAR: " }, "Datos continuos para priorizar inspecciones y demostrar cumplimiento"],
                      ],
                    },
                    { p: ["Los sensores permiten medir ", { b: "bajas concentraciones de CH" }, { b: "4" }, " y detectar desviaciones en tiempo real."] },
                    { p: ["Integrado con ", { b: "Kunak Cloud" }, ", el sistema genera alertas automáticas, analiza patrones de emisión y facilita el reporting para auditorías y cumplimiento regulatorio."] },
                  ],
                 ritmo: { mb: 41 },
                },
                { kind: "boton", label: "¿Quieres más información?", href: "https://kunakair.com/es/contacto/" },
              ],
            },
            {
              ancho: "1_3",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/alert-cloud-vertical-web-2.jpg", alt: "", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S1F4 · alto 377.4688 · [4_4]
          columnas: [
            {
              ancho: "4_4", punteado: true,
              modulos: [
                { kind: "titular", texto: "Cómo funciona la solución" },
                { kind: "claim", texto: "Red de sensores → Red de comunicaciones → Plataforma de análisis → Toma de decisiones", nivel: 4 },
                {
                  kind: "texto",
                  bloques: [
                    { p: ["Las estaciones multiparámetro miden ", { b: "gases, partículas y variables meteorológicas" }, "."] },
                    { p: ["Los datos se transmiten en tiempo real a ", { b: "Kunak Cloud" }, ", donde se centraliza la información, se generan alertas y se realizan análisis avanzados que permiten a los equipos operativos detectar emisiones y actuar rápidamente."] },
                  ],
                 ritmo: { mb: 41 },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // S2 · alto medido 1149.0781
      mt: -14, pb: 14,
      filas: [
        {
          // S2F0 · alto 582.4688 · [1_2 + 1_2]
          pt: 0, pb: 60,
          columnas: [
            {
              // única columna no-última con hueco 0 a 390 (ver mbMovil)
            ancho: "1_2", mbMovil: 0,
              modulos: [
                { kind: "titular", texto: "Controla tus emisiones y detecta fugas en tiempo real", ritmo: { mb: 20 } },
                { kind: "claim", texto: "Actúa antes de que el problema escale", ritmo: { pr: 25 } },
                {
                  kind: "texto",
                  bloques: [
                    { p: [{ b: "Detectar una fuga a tiempo marca la diferencia entre una corrección operativa y una sanción." }] },
                    { p: "Convierte la monitorización ambiental en una herramienta de control real de tus operaciones." },
                  ],
                },
                { kind: "boton", label: "Solicita una demo técnica", href: "https://kunakair.com/es/contacto/" },
              ],
            },
            {
              ancho: "1_2",
              modulos: [
                { kind: "imagen", src: "/images/uploads/2026/04/Controla-tus-emisiones-y-detecta-fugas-en-tiempo-real-2.jpg", alt: "Controla tus emisiones y detecta fugas en tiempo real - Kunak", ritmo: { mb: 0 } },
              ],
            },
          ],
        },
        {
          // S2F1 · alto 495.0156 · [4_4]
          pt: 0,
          columnas: [
            {
              ancho: "4_4",
              modulos: [
                {
                  kind: "ctaDescarga",
                  title: "¿Quieres controlar el impacto de tus procesos en la calidad del aire?",
                  body: [
                    "Descarga el informe técnico [PDF] sobre la red de control de la calidad del aire desplegada en la planta de Cemex.",
                    "Descubre cómo Cemex ha conseguido controlar las emisiones y tener bajo control el impacto ambiental de la producción de cemento.",
                  ],
                  cta: { label: "Descargar informe", href: "https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-industria/", external: true },
                  image: "/images/uploads/2024/11/cta-informe-tecnico-industria-scaled.jpg",
                 ritmo: { mb: 0 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],


  ctaSlides: CTA_SLIDES_INDUSTRIA,

  soluciones: SECTOR_SOLUCIONES,

  proyectos: {
    title: "Últimos proyectos",
    cta: PROYECTOS_CTA,
    posts: PROYECTOS_INDUSTRIA,
  },

  articulos: {
    title: "Artículos y Guías",
    cta: ARTICULOS_CTA,
    /** P4 heredado: trío del 2026-07-29. */
    posts: [
      {
        title:
          "Contaminación por producción de energía: impacto ambiental y en la salud",
        date: "May 29, 2025",
        image: "/images/uploads/2025/05/contaminacion-produccion-energia-1024x683.jpg",
        href: "https://kunakair.com/es/contaminacion-por-produccion-de-energia/",
      },
      {
        title:
          "Contaminación por metano: impacto en el medio ambiente, la salud y soluciones",
        date: "Ene 7, 2025",
        image:
          "/images/uploads/2025/01/Ganaderia-extensiva-y-emisiones-de-metano-1024x573.jpg",
        href: "https://kunakair.com/es/contaminacion-por-metano/",
      },
      {
        title:
          "Monitorización de emisiones fugitivas: detección y control de fugas industriales",
        date: "Jul 21, 2026",
        image:
          "/images/uploads/2026/07/Deteccion-temprana-emisiones-fugitivas_Kunak-1024x683.jpg",
        href: "https://kunakair.com/es/monitorizacion-de-emisiones-fugitivas/",
      },
    ],
  },

  taxonomy: {
    label: "Industria",
    href: "https://kunakair.com/es/sector/industria/",
  },

  footerStripImage:
    "/images/uploads/2026/04/Monitorizacion-de-emisiones-en-el-sector-del-petroleo-y-gas-Kunak-1.jpg",
};

/**
 * Las instancias publicadas. Dar de alta una tercera es añadirla aquí — la ruta
 * `/sectores/[slug]` ya despacha por slug entre SECTOR y MONOGRÁFICO.
 */
export const MONOGRAFICOS_PUBLICADOS: MonograficoPage[] = [
  MONOGRAFICO_EDAR,
  MONOGRAFICO_PETROLEO,
];

export function getMonografico(slug: string): MonograficoPage | undefined {
  return MONOGRAFICOS_PUBLICADOS.find((m) => m.slug === slug);
}
