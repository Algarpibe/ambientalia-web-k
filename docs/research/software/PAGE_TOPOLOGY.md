# PAGE_TOPOLOGY.md — kunakair.com/es/software-de-medicion-calidad-del-aire

> Recon (Fase 1) del **2026-07-27**. Arquetipo nuevo para la biblioteca:
> **SOFTWARE / PLATAFORMA**. Medido con puppeteer-core sobre el Chrome del
> sistema, `Emulation.setDeviceMetricsOverride` a **1440×900** y **390×844**,
> imágenes perezosas forzadas antes de medir.
> Ruta destino: `src/app/software-de-medicion-calidad-del-aire/page.tsx`.
> Sondas en el scratchpad: `qa/recon-sw*.mjs`.

- **Título**: "Software para el análisis de la calidad del aire | Kunak AIR Cloud"
- **H1**: "Software de medición de la calidad del aire"
- **Breadcrumb**: Inicio / Productos / **AIR Cloud** (3 niveles, el último sin enlace)
- **Altura**: **11837** a 1440 · **20888** a 390. Sin scroll horizontal en ninguno.
- **Retícula**: la de siempre en este clon — fila Divi **80% máx 1380**
  (1152px a 1440), gutter 5.5%.

## Qué arquetipo es realmente

Es un **híbrido**: hereda casi toda su carpintería de `/monitor-calidad-aire`
(columna de anclas sticky 1/4 + contenido 3/4, CTA de ancho completo, artículos,
FAQ) pero cambia el *contenido* de producto físico por **capturas de producto
software**. Lo genuinamente nuevo son dos piezas:

1. Un **carrusel de capturas con autoplay** en el hero (9 diapositivas).
2. Una **rejilla de 16 herramientas**, cada una con captura de dashboard.

No hay tabs, ni buscador, ni filtros, ni visor 360, ni tablas de specs, ni
popup de formulario. La única navegación interna es el scrollspy de 3 anclas.

## Mapa de secciones (`#main-content .et_pb_section`)

| # | Sección | top | alto | Modelo de interacción |
|---|---|---|---|---|
| S0 | Breadcrumb | 225 | 50 | estático |
| S1 | Hero + Información del producto | 275 | 2544 | **time-driven** (carrusel autoplay) + lightbox de vídeo |
| S2 | CTA ancho completo "Una completa suite…" | 2819 | 376 | estático (slider de 1 diapositiva, sin controles) |
| S3 | Anclas + Beneficios / Herramientas / Casos de éxito | 3196 | 5650 | **scroll-driven** (sticky + scrollspy) |
| S4 | Artículos y Guías | 8845 | 834 | estático (hover en tarjetas) |
| S5 | Preguntas frecuentes | 9680 | 1434 | **click-driven** (19 toggles) |

### S1 — desglose (2 filas)

- **Fila 0** — `1/2 + 1/2` (544 + 544), alto 657.
  Izquierda: kicker "Kunak AIR Cloud", H1, H2 "Analiza datos de forma sencilla…",
  y CTA. Derecha: foto `industrial-woman-engineer-using-the-cloud.jpg`
  (1024×683, mostrada a 463).
- **Fila 1** — `1/3 + 2/3` (342 + 747), alto 1802.
  - Columna 1/3: "Información del producto", CTA **"Ver vídeo del producto"**,
    imagen `kunak-cloud-dispositivos.png` (626×800 → 342) y los **6 blurbs de
    características** (icono SVG 150×150 mostrado a 50px, solo título, 232px
    de ancho cada uno).
  - Columna 2/3: el **carrusel de 9 capturas** (747×500).

### S3 — desglose (fila única `1/4 + 3/4` = 240 + 848)

Mismo esqueleto que el S3 del monitor y que las categorías de /accesorios.

- **Columna 1/4 (240)**: caja de anclas sticky con 3 enlaces —
  `#beneficios`, `#herramientas`, `#case-studies` — más 2 CTAs debajo
  ("Solicita más información", "Descarga el catálogo").
- **Columna 3/4 (848)**:
  - `#beneficios` — H2 + **9 blurbs** a ancho completo (848): icono SVG a 40px
    + H3 + párrafo.
  - `#herramientas` — H2 + **16 tarjetas** de **399px** (2 por fila): H3 +
    párrafo + **captura de dashboard 1800×1200** mostrada a 399.
  - `#case-studies` — H2 "Casos de éxito" (ojo: el id de la sección es
    `case-studies` pero el del H2 es `casos-de-exito`) + **3 tarjetas de 256px**
    (3 por fila) + CTA "Ver todos los casos".

## Inventario de CTAs

| Sección | Texto | Destino |
|---|---|---|
| S1 | Solicita una demo gratuita | `/es/contacto/` |
| S1 | Descargar app (Android) | Google Play (externo real) |
| S1 | Ver vídeo del producto | `#video` → **lightbox**, no ancla |
| S2 | Solicita una demo gratuita | `/es/contacto/` |
| S3 | Solicita más información | `/es/contacto/` |
| S3 | Descarga el catálogo | `/es/descarga-catalogo/` |
| S3 | Ver todos los casos | `/es/casos-de-exito/` |
| S4 | Amplia tus conocimientos con nuestras guías | `/es/recursos/guias/` |

## Assets clave

- **9 fondos de carrusel** (`.jpg`, `uploads/2023/02/`): hotspots-detection,
  pollution-sources-identification, leakage-detection, particle-size-analysis,
  control-panel, multiparametric-analysis, cmms, alarms-traceability,
  customised-reports.
- **16 capturas de herramienta** (1800×1200): Control-panel, Dashboard,
  Basic-data-analytics, AQI, Automatic-data-invalidation, Alert-system,
  Error-detection, CMMS, Locations-log, Data-invalidation-tool,
  Advanced-data-analytics, External-data-integration, Custom-reports,
  hotspots-detection, Pollution-source-detection, Particle-count.
- **15 iconos SVG 150×150**: 6 del hero (cloud-based-1, reliable-data,
  flexible-scalable-1, multiple-users, data-integration, advanced-tools) y 9 de
  beneficios (secure-confidential, continuous-updates, reports,
  automatic-supervision-1, reliable-data —repetido—, pollution-sources,
  remote-troubleshooting, data-sharing, public-aq-data).
- 2 fotos de hero + `punteado.svg` (ya en el proyecto).

## Modelo de datos para el CMS (`src/lib/software.ts`)

Plantilla (componentes) + datos (este archivo), igual que `accesorios.ts`.

```ts
// Hero
HERO = { kicker, h1, h2, ctaLabel, ctaHref, appCtaLabel, appCtaHref,
         videoCtaLabel, videoSrc, image: {src,width,height,alt} }

// 6 características del hero — bloque repetible
interface Caracteristica { icono: string; titulo: string }   // sin descripción

// Carrusel del hero — bloque repetible (9)
interface Diapositiva { titulo: string; imagen: string }      // el título es la única copy

// Información del producto (columna 1/3)
INFO = { heading, parrafos: string[], imagen: {...} }

// 9 beneficios — bloque repetible
interface Beneficio { icono: string; titulo: string; descripcion: string }

// 16 herramientas — bloque repetible
interface Herramienta {
  titulo: string; descripcion: string;
  captura: { src: string; width: 1800; height: 1200; alt?: string };
}

// Anclas de la columna 1/4
ANCLAS = [{ id: "beneficios", label: "Beneficios" },
          { id: "herramientas", label: "Herramientas" },
          { id: "case-studies", label: "Casos de éxito" }]

// Casos de éxito (3) y Artículos (3): reutilizan los tipos ya existentes
CASOS: Proyecto[]        // ver src/lib/projects.ts
SOFTWARE_ARTICLES: BlogPost[]
BREADCRUMB, CTA_*, S2 = { image, heading, buttonLabel, buttonHref }
```

Nota de contenido: **"Análíticas básicas"** (herramienta #3) lleva esa tilde
sobrante en el original. Igual que en /accesorios, va **verbatim**.

## Reutilización (detalle en el resumen de la sesión)

Rutas locales (regla del proyecto): al construir esta página hay que pasar a
`/software-de-medicion-calidad-del-aire` los **5 enlaces absolutos** que ya
apuntan a ella: `src/lib/nav.ts`, `src/lib/footer.ts`, `src/lib/products.ts`,
`src/components/HazVisible.tsx` y
`src/components/monitor/InformacionProducto.tsx`.
