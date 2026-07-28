# rejilla-herramientas.spec.md — `RejillaHerramientas` (16 tarjetas, `#herramientas`)

> Medido el **2026-07-27** a **1280** (cw 1264.7). Vive en la columna 3/4 de S3,
> justo debajo de `ListaBeneficios`. Topología: `../PAGE_TOPOLOGY.md` §S3.

## La rejilla

No es un `grid`: son **blurbs `inline-block` con `width: 47%`** dentro de la
columna 3/4, que el tema declara `display: flex; flex-wrap: wrap`
(`.columna-caracteristicas`). La clase que los dimensiona es **`iconos-md-2`**:

```css
@media (min-width: 480px) {
  .iconos-md-2 { display:inline-block; width:47%; margin-inline-end:5.5%;
                 vertical-align: text-top; }
  .iconos-md-2:nth-child(2n)   { margin-inline-end: 5.5% }
  .iconos-md-2:nth-child(2n+1) { margin-inline-end: 0 }
}
```

Como los blurbs no empiezan en el hijo 1 de la columna, el `nth-child` cae de
forma que **la primera tarjeta de cada fila lleva el margen y la segunda no**.
Verificado midiendo las 6 primeras: x = 393.3 / 784.4 / 393.3 / 784.4 / 393.3 /
784.4 con `margin-right` = 40.96 / 0 / 40.96 / 0 / 40.96 / 0.

| Propiedad | Valor medido |
|---|---|
| Ancho de tarjeta | **350.1** (47% de 744.9) — **399** a 1440, el dato del recon |
| Separación horizontal | **40.96** (5.5%) |
| `margin-bottom` | **40px** (no los 27.8 del resto de módulos) |
| Tarjetas por fila | **2** |

## Anatomía de la tarjeta (`Herramienta`)

| Elemento | Medida |
|---|---|
| Captura | `<img>` a ancho completo, **350.1 × 233.4** (fuente **1800×1200**, ratio 3:2), **`border-radius: 10px`**, sin sombra ni borde |
| Contenedor de la imagen | `margin-bottom: **30px**` |
| `<h3>` | **26px / 26 / fw300 / #333**, `padding-bottom: 10px`, alineado a la izquierda |
| Descripción | **18px / 30.6 / #333** (la escala de cuerpo, no los 16 de los beneficios) |
| Contenedor de texto | `padding: 0`, `margin: 0` |

Alto de la primera tarjeta: **421.8** (233.4 img + 30 gap + 36 h3 + descripción).

`alt` del original: **`Tools`** en las 16, o sea inútil. El clon lo sustituye
por `alt="Captura de {título} en Kunak AIR Cloud"` — desviación deliberada,
sin efecto visual (mismo criterio que los `alt` de `ListaBeneficios`).

## Las 16 herramientas (orden verbatim)

| # | Título | Captura (`uploads/`) |
|---|---|---|
| 1 | Panel de control | `2023/03/Control-panel.jpg` |
| 2 | Dashboard | `2023/03/Dashboard.jpg` |
| 3 | **Análíticas básicas** *(sic)* | `2023/03/Basic-data-analytics.jpg` |
| 4 | Índice de calidad del aire | `2023/03/AQI.jpg` |
| 5 | Invalidación automática | `2023/03/Automatic-data-invalidation.jpg` |
| 6 | Sistema de alertas | `2023/03/Alert-system.jpg` |
| 7 | Detección de errores | `2023/03/Error-detection.jpg` |
| 8 | GMAO | `2023/03/CMMS.jpg` |
| 9 | Ubicaciones | `2023/03/Locations-log.jpg` |
| 10 | Validación de datos | `2023/03/Data-invalidation-tool.jpg` |
| 11 | Analíticas avanzadas | `2023/03/Advanced-data-analytics.jpg` |
| 12 | Fuentes externas | `2023/03/External-data-integration.jpg` |
| 13 | Informes personalizados | `2023/03/Custom-reports.jpg` |
| 14 | Mapas de calor | `2023/02/hotspots-detection.jpg` |
| 15 | Origen de la contaminación | `2023/03/Pollution-source-detection.jpg` |
| 16 | Recuento de partículas | `2023/03/Particle-count.jpg` |

### La errata «Análíticas básicas»

La herramienta #3 lleva **tilde de más en la í** (`Análíticas`) en el original,
mientras que la #11 escribe bien `Analíticas avanzadas`. Va **verbatim**, igual
que "Anenómetro Ultrasónico" en `/accesorios`. Marcada con `// sic` en
`src/lib/software.ts` para que ningún corrector automático la "arregle".

`2023/02/hotspots-detection.jpg` se usa **dos veces**: como fondo de la
diapositiva 0 del carrusel y como captura de la herramienta #14. No duplicar el
archivo.

## Hover

**Ninguno** — ni en la imagen ni en el título; las tarjetas no son enlaces
(`../BEHAVIORS.md` §7).

## Peso de los assets

Las 16 capturas a resolución original suman **≈4,4 MB** (de 156 KB a 588 KB
cada una) y se muestran a 350–400px. El original sirve un `srcset` de 4 anchos
(480/980/1280/1800). El clon usa `<img>` plano con la fuente 1800×1200, como el
resto de imágenes del proyecto, y añade **`loading="lazy"` + `decoding="async"`**
en las tarjetas (el original también las marca `loading="lazy"`), que es lo que
evita que la primera pintura cargue los 4,4 MB.

## Móvil (390)

Por debajo de **480px** la regla `iconos-md-2` no aplica: las tarjetas pasan a
**ancho completo, una por fila** (312px), con la captura reescalada sin recorte
(`../BEHAVIORS.md` §8). El `margin-bottom: 40px` se mantiene.
