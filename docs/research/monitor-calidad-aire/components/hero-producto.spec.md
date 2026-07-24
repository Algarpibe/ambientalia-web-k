# hero-producto.spec.md — Hero Kunak AIR Pro (S1 · fila 1) + breadcrumb (S0)

> Medidas tomadas con getComputedStyle a viewport **1045×515** (desktop Divi ≥981). Página real: `/es/monitor-calidad-aire/`.
> Decisión de producto: el vídeo abre **YouTube `tuTfw6KIvd4`** en el VideoLightbox existente (parametrizar fuente).

## Contexto de sección

- `section.et_pb_section_1`: fondo `url(/wp-content/uploads/2022/12/recurso-k-fondo.svg) no-repeat 0% 50%` (marca de agua "K", asset YA en el clon), `padding: 41px 0`.
- Detrás del header (S0 arriba): la cabecera TB lleva `linear-gradient(rgba(71,71,71,.17), transparent) + url(/wp-content/uploads/2023/10/cabecera-puerto.jpg)` → franja foto ~335 px con el header transparente encima (logo blanco → sticky glass al scrollear; componente HeaderNav compartido, solo hay que pasarle la imagen de cabecera).
- Fila hero: `.et_pb_row_1` — ancho **824 px** a 1045 (~78.8% del viewport, max-width 1380), `padding: 30px 0`, 2 columnas de **389.33 px** con gutter `margin-right: 45.3px`.

## Breadcrumb (S0, 50 px de alto)

- `ol.kunak-breadcrumbs` (schema.org BreadcrumbList), display block, **12px**; enlaces `Inicio`, `Productos` → `<a><span>` color `#333` weight 600; item actual "AIR Pro" color `#0075C9`; separador `/` azul entre items. Padding-left de página estándar (arranca en el margen del contenedor ~110px).
- Hrefs: `/es/` y `/es/productos/` (verificar el 2º en build), último sin enlace.

## Columna izquierda (texto)

Orden de módulos y estilos exactos:

| Elemento | Texto verbatim | Estilos clave |
|---|---|---|
| `et_pb_image_0` | — | `punteado.svg` (matriz de puntos, asset existente), decorativo arriba-izquierda |
| `text_1 > p` | `Kunak AIR Pro` | **50px / 60px, weight 800, #333** |
| `text_1 > h1` | `Monitor de calidad del aire` | **23px / 23px, weight 300, letter-spacing ‑0.5px, #333**, padding-bottom 10px (H1 SEO visible, estilo subtítulo) |
| `text_2 > h2` (id `monitoriza-la-calidad-del-aire-con-datos-precisos-y-fiables`) | `Monitoriza la calidad del aire con datos precisos y fiables` | **44px / 55px, weight 300, ls ‑0.5px, #333**, padding-bottom 10px |
| `text_3 > p` | `BASADO EN SENSORES | MÁXIMA PRECISIÓN` | **16px, weight 800, #0075C9** (`var(--azul)`); el separador `|` es `<span>` **#333** |
| 6× `et_pb_blurb.iconos-xs-2` | logos validadores (solo imagen, cada uno ES ENLACE a su estudio) | inline-block, alto ~55px, vertical-align text-top, margin-bottom ~22.6px; en ≤980: `width:48%; margin-inline-end:2%` (grid 2 col móvil) |
| `et_pb_button_0.boton-azul` | `Solicita más información` | pill sólido: bg `#0075C9`, borde 0.67px mismo color, **radius 30px**, 15px w700 blanco, padding `7.5px 40.5px 9px 22.5px` (derecha mayor para la flecha →), margin-bottom 30px. Hover: bg → `var(--gris) #7F8798` (texto y flecha blancos), padding-inline-end crece a 3.7em (flecha se desliza) |

### Logos validadores (orden + asset + href)

1. `US-EPA-united-states-environmental-protection-agency-1.svg` (`/2023/02/`) → `/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf`
2. `Mcerts.svg` (existente) → `/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf`
3. `airparif.svg` (existente) → `/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf`
4. `AQ-SPEC.svg` (existente) → `https://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/kunak-air-pro---field-evaluation.pdf` (externo)
5. `SEDEMA_CDMX.svg` (existente) → `/doc/09.StudiesReferences/Independent_studies/SEDEMA_2b_Evaluacion_Sensores_CDMX_2022.pdf`
6. `Ricardo_logo.svg` (existente) → `/doc/09.StudiesReferences/Independent_studies/Ricardo_Kunak_Air_Pro_Sensor_report_summary.html`

Todos `target` por defecto (los PDF abren en la misma pestaña en el original; usar `target="_blank"` es mejora aceptable — decidir en build).

## Columna derecha (visor 360° + badge + botón vídeo)

### Visor 360° (NUEVO componente `Product360Viewer`)

Original: plugin WP `360deg-javascript-viewer` + lib **`@3dweb/360javascriptviewer` v1.7.32**. Config verbatim del div holder:

```
data-total-frames="35"
data-main-image-url="https://kunakair.com/wp-content/uploads/2023/03/kunak360_IMG_01.jpg"
data-image-url-format="kunak360_IMG_xx.jpg"   (xx = 01…35, mismo directorio /2023/03/)
data-speed="90"  data-inertia="12"  data-zoom="true"  data-reverse="true"  data-auto-rotate="1"
notificación drag-to-rotate por defecto: activada
```

DOM generado por la lib (replicar estructura visual, no la lib):

- `.jsv-holder` `position:relative`, ancho 100% de columna (389px @1045; aspecto ≈1:1, frames cuadrados).
- Placeholder: `<img>` primer frame con `filter: blur(5px)` mientras precarga; luego oculto.
- Barra de carga: div absoluto `height:5px; width:30%; background:rgba(255,255,255,.5); border-radius:.25rem; z-index:200` con hijo negro que avanza (progreso de precarga de los 35 frames).
- Contenedor de frames: `overflow:hidden; user-select:none` con **35 `<img>` apiladas, `display:none` salvo el frame activo** (`transform-origin: 50% 50%` para el zoom).
- **Hint pill** centrado: wrapper absoluto `top:50%; left:50%; height:20%; width:20%; display:flex; align-items/justify-content:center; pointer-events:none; z-index:200`; caja interior `text-align:center; font-size:12px; padding:.2em .5em; white-space:nowrap; color:rgba(243,237,237); background:rgba(0,0,0,.2); border-radius:.5em` con `<span>` texto **"arrastrar para rotar"**.

Comportamiento (verificado en vivo):

1. Al cargar: precarga de frames con barra de progreso → **1 vuelta automática** (auto-rotate:1) → reposo en frame 01.
2. **Drag horizontal** (pointerdown + move): avanza/retrocede frames; `reverse:true` (arrastrar a la derecha rota "hacia atrás"); sensibilidad `speed:90` (~90 = una vuelta por ancho arrastrado aprox.); al soltar, **inercia** (`inertia:12`, decaimiento suave).
3. El hint desaparece en la primera interacción y no vuelve.
4. `zoom:true` en la lib (rueda/pinch); no verificado en vivo — opcional en el clon (flag build).
5. El grafismo "360°⟳" que se ve sobre el producto **está horneado en las propias fotos** (no es overlay HTML).

Implementación clon: componente cliente con `<img>` precargadas (o sprite), pointer events + rAF para inercia, snap por frame (35 pasos), sin dependencia externa.

### Badge laurel AIRLAB

- `et_pb_image_1` — `ganador-airlab-2021-2023-2.svg` (`/2024/01/`), **position:absolute; z-index:2; width:105px**, esquina inferior-derecha del visor (solapa la foto). Texto interno del SVG: "GANADOR AIRLAB Microsensors Challenge 2021 & 2023 · SENSOR MULTICONTAMINANTE MÁS PRECISO".

### Botón "Ver vídeo del producto"

- Wrapper `et_pb_button_1_wrapper` con `et_pb_button_alignment_center` (centrado bajo el visor).
- `a.et_pb_button` outline: transparente, borde 0.67px `#333`, radius 30px, 15px w700 `#333`, padding `7.5px 40.5px 9px 22.5px`, flecha → tras el texto. Hover: padding-inline-end 3.7em + flecha `var(--azul)`.
- `href="#video"` → abre **VideoLightbox** (overlay `lightboxOverlay` + caja blanca + X) con iframe `https://www.youtube.com/embed/tuTfw6KIvd4?feature=oembed` (16:9 dentro de `.et_pb_video_box`). Cierre con X o click en overlay.

## Móvil (390)

- Todo apilado: dots → títulos → kicker → logos (grid 2 col 48%) → CTA → visor 360 (100% ancho) → badge → botón vídeo.
- El hero de cabecera muestra la foto puerto recortada (~200px alto) con logo blanco + hamburguesa.

## Assets NUEVOS a descargar (esta sección)

| Asset | URL origen |
|---|---|
| 35 frames 360° | `https://kunakair.com/wp-content/uploads/2023/03/kunak360_IMG_01.jpg` … `kunak360_IMG_35.jpg` |
| Badge laurel | `https://kunakair.com/wp-content/uploads/2024/01/ganador-airlab-2021-2023-2.svg` |
| Logo EPA (variante) | `https://kunakair.com/wp-content/uploads/2023/02/US-EPA-united-states-environmental-protection-agency-1.svg` |
| Foto cabecera | `https://kunakair.com/wp-content/uploads/2023/10/cabecera-puerto.jpg` |

Ya existentes en el clon: `punteado.svg`, `recurso-k-fondo.svg`, `Mcerts.svg`, `airparif.svg`, `AQ-SPEC.svg`, `SEDEMA_CDMX.svg`, `Ricardo_logo.svg`.
