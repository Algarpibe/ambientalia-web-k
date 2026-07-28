# PAGE_TOPOLOGY.md — kunakair.com/es/kunak-api/

> Recon (Fase 1) del **2026-07-27**. Medido con puppeteer-core sobre el Chrome
> del sistema (headless, perfil limpio, Cookiebot bloqueado,
> `--hide-scrollbars`), a **1440×900** y **390×844**, con las imágenes perezosas
> forzadas a `eager` y un pase de scroll antes de medir.
> Ruta destino: `src/app/kunak-api/page.tsx`.
> Sondas en el scratchpad: `api-fetch.mjs` · `api-recon.mjs` · `api-behav.mjs`
> · `api-hover.mjs` · `api-detalle.mjs` · `api-shot.mjs`.
> Capturas: `docs/design-references/kunak-api/api-{desktop-1440,movil-390}-full.jpg`.

- **Título**: "Kunak API - Kunak"
- **H1**: "Integración de datos más allá de la solución Kunak AIR Cloud"
- **Breadcrumb**: Inicio / Productos / **Kunak API** (3 niveles, el último sin enlace)
- **Altura**: **5421** a 1440 · **~9203** a 390. Sin scroll horizontal en ninguno.
- **Retícula**: la de siempre en este clon — fila Divi **80% máx 1380**
  (1152px a 1440), gutter 5.5%.

## ⚠️ El arquetipo "API / DESARROLLADOR" **no existe en esta página**

La hipótesis de partida (documentación de endpoints, ejemplos de código con
sintaxis resaltada, tabs de lenguajes, tablas de parámetros) **no se cumple**.
Verificado en el DOM en vivo, no solo en el HTML servido:

| Se buscaba | Encontrado |
|---|---|
| `<pre>` | **0** |
| `<code>` | **0** |
| Tablas de parámetros | **0** |
| Tabs de lenguaje (`et_pb_tabs`) | **0** |
| Resaltado de sintaxis (Prism/hljs/Shiki) | **no se carga ninguno** |
| Listado de endpoints | **no hay** |
| Enlace a un portal de docs / Swagger / Postman | **no hay** |
| Formularios (alta de API key) | **0** |

Lo más "de desarrollador" que hay es **una foto**: `kunak-api.jpg` (1200×1200),
un portátil con un editor de código oscuro. Es un JPG decorativo, no código real.

**Lo que esta página es de verdad**: la **ficha de producto más corta de la
familia** — la mitad de alta que /software-de-medicion-calidad-del-aire (5421
vs 11705 a 1440). Es el arquetipo de /software **descafeinado**: mismo hero,
misma fila "Información del producto", mismos blurbs de icono, mismos artículos,
mismo FAQ y mismo CTA — pero **sin** carrusel, **sin** rejilla de capturas,
**sin** columna de anclas, **sin** casos de éxito y **sin** vídeo.

Propuesta de nombre para la biblioteca: **FICHA DE PRODUCTO CORTA**
(o "producto sin sub-navegación"). No aporta un arquetipo nuevo: aporta la
**variante mínima** del que ya está construido.

## Mapa de secciones (`#main-content .et_pb_section`), desktop 1440

| # | Sección | top | alto | Modelo de interacción |
|---|---|---|---|---|
| — | Cabecera TB (`cabecera-urbana.jpg`) | 0 | 225 | **scroll-driven** (compartida) |
| S0 | Breadcrumb | 225 | 50 | estático |
| S1 | Hero + Información del producto + Beneficios | 275 | 1947.7 | **estático** |
| S2 | Artículos y Guías | 2222.7 | 749.9 | estático (hover en tarjetas) |
| S3 | Preguntas frecuentes | 2972.6 | 1433.8 | **click-driven** (19 toggles) |
| S4 | CTA de ancho completo | 4406.4 | 291.2 | estático (slider de 1 diapositiva) |
| — | Footer TB | 4739.6 | 681 | estático (compartido) |

Móvil 390: cabecera 136.6 · S0 50 · S1 **3162.9** · S2 1436.2 · S3 2021.1 ·
S4 274.8.

**Ojo**: el CTA de ancho completo va **al FINAL**, después del FAQ — no entre
el hero y el bloque de anclas como en /software. Y no hay S de casos de éxito.

### S1 — desglose (3 filas)

Sección con `padding-top: 57.59` (**4%**) y el watermark `recurso-k-fondo.svg`.

- **Fila 1** (`et_pb_row_1`, top 332.6, alto 544.2, `padding-bottom: 14.39`) —
  `1/2 + 1/2` (544.3 + 544.3, gutter 5.5%).
  - Izquierda: punteado, kicker `<p>` + `<h1>`, `<h2>`, claim azul y **1 CTA**.
  - Derecha: **solo la foto** `kunak-api.jpg` 1200×1200 → 544.3, con
    **`margin-top: -54.42px`** (sube por encima de la fila; detalle propio de
    esta página, no está en /software).
- **Fila 2** (`et_pb_row_2`, top 876.8, alto 775.4, `padding: 20px 0 72px`) —
  `1/3 + 2/3` (341.8 + 746.9).
  - Columna 1/3: punteado + `<h2>` "Información del producto" (44px/55).
    **Aquí sí es un `<h2>`**; en /software el mismo rótulo es un `<p>`.
  - Columna 2/3: párrafo de entrada (con enlace inline a Kunak AIR Cloud),
    `<h2>` azul de 37px, párrafo, "Características:" y los **6 blurbs**.
- **Fila 3** (`et_pb_row_3`, top 1652.2, alto 570.5, `padding: 20px 0 72px`) —
  `1/4 + 3/4` (240.5 + 848.2).
  - Columna 1/4: punteado + `<h2>` "Beneficios" (44px/55).
  - Columna 3/4: párrafo de entrada + los **6 blurbs**.

**Aquí no hay caja de anclas.** La columna 1/4 solo lleva el titular: sin
`menu-anclas`, sin CTAs debajo, sin `position: sticky`. Es la diferencia
estructural más importante respecto a /monitor-calidad-aire, /accesorios y
/software.

### Los 12 blurbs de icono — un solo patrón usado dos veces

Ambos grupos comparten clase (`iconos-xs-2 iconos-md-3`), tipografía y
geometría. Solo cambia la columna que los contiene.

| | Características (fila 2) | Beneficios (fila 3) |
|---|---|---|
| Columna | 2/3 = 746.9 | 3/4 = 848.2 |
| Ancho de blurb @1440 | **224.1** (30%) | **254.4** (30%) |
| Separación | 22.41 (3%) | 25.44 (3%) |
| Por fila @1440 | **3** | **3** |
| Ancho @390 | **149.75** (48%) | 149.75 (48%) |
| Por fila @390 | **2** | **2** |
| `margin-bottom` | 31.67 (2.2%) | 31.67 |

Regla del tema (`style.css`), con el corte en **480px**, no en 768 ni 981:

```css
.iconos-xs-2 { display:inline-block; width:48%; margin-inline-end:2% }   /* siempre */
.iconos-xs-2:nth-child(2n) { margin-inline-end:0 }
@media (min-width:480px) {
  .iconos-md-3 { display:inline-block; width:30%; margin-inline-end:3% }
  .iconos-md-3:nth-child(2n)   { margin-inline-end:3% }
  .iconos-md-3:nth-child(3n+1) { margin-inline-end:0 }
}
```

Anatomía: icono **50×50 centrado** (`text-align:center`, `margin-bottom:30px`;
el SVG fuente es 48×48 en los 5 nuevos y 800×800 en los reutilizados) + `<h4>`
**18px / 21.6 / fw300 / #333 / centrado / `padding-bottom:10px` /
`letter-spacing:-0.5px`**. **Sin descripción y sin enlace.**

> Diferencia con /software: allí las 6 características usan `modulo-beneficios`
> (31% + 2%, corte en 981px) y el `<h4>` mide **16px/19.2**. Misma forma,
> números distintos → conviene extraer un componente parametrizable en vez de
> reutilizar el bloque inline de `InfoProductoSoftware`.

### S2 — Artículos y Guías

- Sección sin padding y **sin watermark**. Fila 4 (top 2222.7, `padding:
  28.8px 0 14.39px`): punteado + `<h2>` 44px/55 + las 3 tarjetas
  (**357.3 de ancho, gap 40**, una sola fila). Fila 5 (top 2826.6,
  `padding-bottom: 72px`): el CTA azul alineado a la **derecha**.
- ⚠️ El `padding-top` de la fila del titular es **28.8 (2%)**, no los **140px**
  de /monitor-calidad-aire y /software. `UltimosArticulos variant="monitor"`
  se reutiliza, pero necesita una variante de espaciado nueva.

### S3 — Preguntas frecuentes

Sección `padding: 57.59px 0` (4%) con watermark; fila 1/4 + 3/4 con
`padding: 20px 0 72px`. **19 toggles idénticos** a los de las otras tres
páginas, todos cerrados de inicio. Coincide al detalle con `FaqAcordeon`.

### S4 — CTA de ancho completo

`et_pb_fullwidth_slider` con **una sola diapositiva**, `et_pb_bg_layout_dark`,
sin flechas, sin puntos y sin autoplay.

| Propiedad | Valor medido @1440 |
|---|---|
| Alto | 291.2 |
| Fondo | `2023/01/urban-1500.jpg` + `rgba(0,0,0,0.33)` en `multiply` |
| Caja de descripción | ancho 1267.2 (88%), `padding: 63.36px 392.83px 63.36px 0` → **5%** arriba/abajo y **31%** a la derecha |
| `<h2>` | 45px / 58.5 / fw300 / #FFF, `padding-bottom: 10px`, enlazado |
| Párrafo | 20px / 32 / #FFF |
| Botón | claro (`rgba(0,0,0,.15)` + borde blanco), 15px, radius 30 |
| @390 | título 27px/35.1, párrafo 14px/22.4, caja `padding: 34.31px 0 51.47px` (sin `pr`) |

Es **exactamente** la configuración `align="left"` + `body` + `headingHref` +
`buttonVariant="light"` de `CtaBanner`, incluida la regla de padding vertical
al 5% que el componente ya aplica cuando hay `body`. **Cero props nuevas.**

## Inventario de CTAs y enlaces de contenido

| Sección | Texto | Destino |
|---|---|---|
| S1 | Solicita más información | `/es/contacto/` |
| S1 | Kunak AIR Cloud (enlace inline, `target="_blank"`) | **`/software-de-medicion-calidad-del-aire`** → ruta LOCAL |
| S2 | 3 tarjetas de artículo | posts del blog (aleatorios, ver BEHAVIORS §6) |
| S2 | Amplia tus conocimientos con nuestras guías | `/es/recursos/guias/` |
| S3 | catálogo (dentro de la última pregunta) | `/es/descarga-catalogo/` |
| S4 | Saca el máximo partido a los datos (título) | `/es/contacto` *(sic: sin barra final)* |
| S4 | Descubre cómo | `/es/contacto` *(sic)* |

**Regla del proyecto**: el único enlace de contenido que apunta a una página ya
clonada es el de **Kunak AIR Cloud** → debe emitirse como
`/software-de-medicion-calidad-del-aire`. El resto sigue absoluto.

**Enlaces entrantes desde el clon**: `src/lib/nav.ts` y `src/lib/footer.ts` ya
listan "Kunak API" apuntando a `https://kunakair.com/es/kunak-api/`, y
`src/lib/products.ts` lo tiene como tab del acordeón de productos. Al construir
hay que pasarlos a `/kunak-api` — **3 sitios** (frente a los 5 de /software).

## Assets

Nuevos (5 SVG + 1 JPG):

- `2023/02/kunak-api.jpg` **1200×1200** — foto del hero.
- `2023/04/api-rest.svg`, `json-format.svg`, `call-limit.svg`,
  `size-limit.svg`, `data-export.svg` (48×48).

Reutilizados del proyecto (**ya descargados**): `2023/02/cloud-based-1.svg`,
`2023/01/urban-1500.jpg`, `punteado.svg`, `recurso-k-fondo.svg`.

Nuevos de beneficios (5 SVG, 800×800): `2023/02/easy-fast-installation.svg`,
`2023/02/cloud-platform.svg`, `2023/03/process-automation.svg`,
`2023/03/new-tools.svg`, `2023/03/data-analytics.svg`,
`2023/03/external-data-integration.svg`.

Cabecera: `2023/10/cabecera-urbana.jpg` — **ojo**, la foto de la franja
**varía entre visitas** (ya anotado en `PENDIENTES-QA.md`, P2); no
re-investigar.

## Modelo de datos para el CMS (`src/lib/api.ts`)

Plantilla (componentes) + datos (este archivo), igual que `accesorios.ts` y
`software.ts`. La página tiene **un solo bloque repetible**, usado dos veces:

```ts
/** Blurb de icono: icono arriba centrado + título. SIN descripción. */
interface BlurbIcono { icono: string; titulo: string }

HERO = { kicker, h1, h2, claim, ctaLabel, ctaHref,
         image: {src, width: 1200, height: 1200, alt} }

INFO = { heading,                 // <h2> "Información del producto"
         parrafoIntro,            // lleva enlace inline a Kunak AIR Cloud
         h2Azul, parrafo,         // 37px #0075C9 + cuerpo
         caracteristicasLabel }   // "Características:"

CARACTERISTICAS: BlurbIcono[]     // 6
BENEFICIOS_HEADING = "Beneficios"
BENEFICIOS_INTRO: string          // párrafo de la columna 3/4
BENEFICIOS: BlurbIcono[]          // 6

CTA = { image, heading, headingHref, body, buttonLabel, buttonHref }

BREADCRUMB
API_ARTICLES: BlogPost[]          // congelados, ver BEHAVIORS §6
```

**No hay** `Endpoint`, `Parametro` ni `EjemploCodigo`: la página no expone nada
de eso. Si algún día se quiere una sección de documentación real, habrá que
diseñarla, no clonarla.

Contenido verbatim de los 12 blurbs:

| # | Característica | Icono |
|---|---|---|
| 1 | Interfaz API Rest | `2023/04/api-rest.svg` |
| 2 | Formato JSON | `2023/04/json-format.svg` |
| 3 | Nº llamadas para cada caso | `2023/04/call-limit.svg` |
| 4 | Tamaño adaptado | `2023/04/size-limit.svg` |
| 5 | Exportación de datos | `2023/04/data-export.svg` |
| 6 | Copias de seguridad | `2023/02/cloud-based-1.svg` |

| # | Beneficio | Icono |
|---|---|---|
| 1 | Gestiona la red de forma remota | `2023/02/easy-fast-installation.svg` |
| 2 | Visualiza y gestiona los datos recogidos | `2023/02/cloud-platform.svg` |
| 3 | Automatiza los procesos más frecuentes | `2023/03/process-automation.svg` |
| 4 | Desarrolla nuevas herramientas | `2023/03/new-tools.svg` |
| 5 | Realiza el análisis de  los datos *(sic: doble espacio)* | `2023/03/data-analytics.svg` |
| 6 | Integra datos de sistemas de terceros | `2023/03/external-data-integration.svg` |

Los `alt` de los iconos son, otra vez, textos heredados de otra página
("Interfaz API Rest" repetido en los 6 de características; "Easy fast
installation", "Cartridges system", "Proven accuracy"… en los de beneficios).
Mismo criterio que en /software: se emiten **decorativos**.

## Ritmo de módulos medido (columna 2/3, desktop 1440)

| Módulo | y | alto | margin |
|---|---|---|---|
| Párrafo de entrada | 906.8 | 91.8 | `10px 0 -1px` |
| `<h2>` azul 37px | 1017.6 | 84 | `20px 0` |
| Párrafo | 1121.6 | 91.8 | `10px 0 20px` |
| "Características:" | 1233.4 | 30.6 | `10px 0 31.67px` |
| Blurbs fila 1 | 1298.6 | 107.6 | `0 22.41px 31.67px 0` |
| Blurbs fila 2 | 1440.9 | 107.6 | idem (el 3.º a `mr: 0`) |

Columna 3/4: párrafo `10px 0 20px` (y 1682.2, alto 142.4), blurbs desde 1847.5
con `mr` 25.44 y `mb` 31.67.

Columna del hero: punteado `mb 31.67` · módulo kicker+h1 `mb 31.67` (y 332.6,
alto 126.9) · `<h2>` sin margen (y 491.1, alto 175) · claim `mb 31.67`
(y 666.1) · botón con **`margin-bottom: 60px`** (y 728.4, alto de wrapper 74).

> El `margin-bottom` de módulo de esta página es **31.67 a cw 1440** y sería
> 27.82 a cw 1264.7: es el mismo **2.2% del ancho** que ya se midió en
> /software. No es un valor fijo.
