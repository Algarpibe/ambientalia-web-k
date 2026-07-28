# lista-beneficios.spec.md — `ListaBeneficios` (9 blurbs, `#beneficios`)

> Medido el **2026-07-27** a **1280** (cw 1264.7). Vive en la columna 3/4 de S3.
> Topología: `../PAGE_TOPOLOGY.md` §S3.

## Contexto: la fila 1/4 + 3/4 de S3

| Elemento | Medida |
|---|---|
| Sección `et_pb_section_3` | `padding: 0 0 63.23px` (**5%** del ancho útil), fondo blanco |
| Fila | 80% máx 1380 = **1011.7**, `padding: 50.58px 0 25.29px` (4% / 2%) |
| Columna 1/4 (`columna-lista-anclas`) | **211.2** (20.875%), `padding-top: 32px`, sticky a `top: 70px` |
| Columna 3/4 (`columna-caracteristicas`) | **744.9** (73.625%), y es un **`display: flex; flex-wrap: wrap`** |
| Gutter | 5.5% = 55.6 |

La caja de anclas coincide **al píxel** con la de /accesorios y /monitor:
borde 1px #333, radius 10, `padding: 16px 16px 0`, `margin-bottom: 27.2px`,
`li` con `padding-bottom: 10px`, `a` **16px/26 fw800 #BBB** con
`ico-arrow.svg` 30×30 a `right top` y `padding-right: 30px`; activo → #0075C9.
→ se reutiliza `AnchorNav` sin tocar nada.

Debajo de la caja, **2 CTAs azules apilados**: `Solicita más información`
(`/es/contacto/`) y `Descarga el catálogo` (`/es/descarga-catalogo/`).

## Titular del bloque

`<div id="beneficios">` es el propio módulo de texto, con
**`padding-top: 32px`** y `margin-bottom: 27.81px`; dentro, `<h2>Beneficios</h2>`
a **37px / 37 / fw300 / #333** con `padding-bottom: 10px` (la escala
`BlockTitle` que ya existe en el clon, no la de 44px de cabecera de sección).

Idéntico para `#herramientas` y para el `<h2>Casos de éxito</h2>` (que va en un
módulo con `id="case-studies"`; ojo: **el id se repite** en el original, está en
el `<h2>` y en el contenedor del listado — el clon lo emite una sola vez).

## El blurb de beneficio (`Beneficio`)

**Ancho completo de la columna: 744.9** — a diferencia de los 6 blurbs de
característica (31%) y de las 16 tarjetas de herramienta (47%).

| Elemento | Medida |
|---|---|
| Módulo | `width: 744.9`, `margin-bottom: 27.81px` |
| Estructura | `display: table` / icono `display: table-cell` — o sea **icono a la izquierda, texto a la derecha** (`et_pb_blurb_position_left`) |
| Icono | **40×40** (el SVG original es 800×800), `margin-bottom: 30px` |
| Hueco icono→texto | `padding-left: **15px**` del contenedor |
| `<h3>` | **24px / 28.8 / fw300 / #333**, `padding-bottom: 10px` |
| Descripción | **16px / 21.92 / #333** |

Es exactamente la tipografía del bloque `Beneficios` de /monitor-calidad-aire
(icono 40 + gap 15 + h3 24/28.8 w300 + p 16/21.92); lo único que cambia es que
allí van a 31% en rejilla 3×3 y aquí a ancho completo, uno por fila.

## Los 9 beneficios (orden verbatim)

| # | Título | Icono (`uploads/2023/02/`) | `alt` del original |
|---|---|---|---|
| 1 | Seguro y confidencial | `secure-confidential.svg` | Easy fast installation |
| 2 | Actualizaciones continuas gratuitas | `continuous-updates.svg` | Cartridges system |
| 3 | Informes de calidad del aire | `reports.svg` | Proven accuracy |
| 4 | Supervisión automática | `automatic-supervision-1.svg` | Easy calibration |
| 5 | Datos fiables garantizados | `reliable-data.svg` | Air quality platform |
| 6 | Identificación de fuentes de contaminación y puntos calientes | `pollution-sources.svg` | Multi pollutant |
| 7 | Asistencia remota | `remote-troubleshooting.svg` | Fully autonomous |
| 8 | Simple intercambio e integración de datos | `data-sharing.svg` | Real-time data |
| 9 | Datos sobre la calidad del aire públicos | `public-aq-data.svg` | Add environmental sensors |

Descripciones verbatim en `src/lib/software.ts` (`BENEFICIOS`).

**Nota sobre los `alt`**: en el original son textos en inglés heredados de otra
página y **no describen el icono** ("Easy fast installation" para el candado de
"Seguro y confidencial"). El clon los emite como **decorativos**
(`alt="" aria-hidden`), igual que hace `monitor/Beneficios`: son iconos
redundantes con el `<h3>` que va al lado, y arrastrar el alt equivocado sería
peor que no tenerlo. Desviación deliberada y sin efecto visual.

`reliable-data.svg` se repite: es el icono #2 de las características del hero y
el #5 de los beneficios. No es un error de extracción.

## Hover

**Ninguno.** Los 9 blurbs son estáticos: sin enlace, sin cambio de color, sin
transformación (`../BEHAVIORS.md` §7).

## Móvil (390)

Columna a **312**; la caja de anclas desaparece (regla ≤980 del tema) pero los
2 CTAs se quedan. Los blurbs mantienen la disposición icono-izquierda.
