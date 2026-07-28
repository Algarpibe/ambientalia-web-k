# info-producto-software.spec.md — `InfoProductoSoftware` (S1 · fila 2)

> Medido el **2026-07-27** a **1280** (cw 1264.7) con computed styles reales.
> Topología: `../PAGE_TOPOLOGY.md` §S1 · Comportamientos: `../BEHAVIORS.md` §4.

## ⚠️ Corrección al recon (Fase 1)

`PAGE_TOPOLOGY.md` sitúa los **6 blurbs de características** en la columna 1/3.
**Es falso**: en el DOM viven en la columna **2/3**, detrás del texto
`Características:`, con `width: 31%` y `margin-inline-end: 2%` — o sea **3 por
fila**, exactamente el patrón `.modulo-beneficios` que ya implementa
`monitor/Beneficios`. Medidos a 1280: **203.3px** de ancho cada uno
(31% de 655.9). A 1440 dan los 232px que anotó el recon, de ahí la confusión.

La columna 1/3 solo lleva: punteado, título, foto de dispositivos y el CTA de
vídeo.

## Estructura

Fila `et_pb_row_2`: **80% máx 1380** (1011.7), `padding: 25.29px 0`.
Columnas **1/3 + 2/3** = **300.1 + 655.9** (29.6667% / 64.833%), gutter 5.5% —
la misma retícula que la fila 2 de /monitor-calidad-aire.

### Columna 1/3 (300.1)

| Elemento | Medida |
|---|---|
| Punteado | 60×22 absoluto, −65px a la izquierda de la retícula |
| Título | **`<p>` (no h2)** `Información del producto` — 44px / 55 / fw300 / #333, módulo `margin-bottom: 27.82px` |
| Foto | `2023/04/kunak-cloud-dispositivos.png` 626×800 → **300.1×383.6**, `alt="software kunak Air"`, módulo `margin-bottom: 27.82px` |
| CTA vídeo | `OutlineButton` (#333) `Ver vídeo del producto`, wrapper **`text-align: center`** en desktop (izquierda en tablet/móvil), `margin-bottom: 14.4px` |

### Columna 2/3 (655.9) — ritmo de módulos Divi `margin: 20px 0`

Orden exacto de módulos:

1. `<h2>` **`Software de control de calidad del aire`** — 37px / 37 / fw300 /
   **#0075C9** (color por `<span style>` inline) + `<p>` azul de **22.67px**
   (17pt) / 30.6: `Visualiza y analiza los datos recopilados por la red de sensores.`
2. Dos párrafos de cuerpo — 18px / 30.6 / #333, `padding-bottom: 18px`.
3. `<span>` azul suelto de 22.67px/30.6:
   `Elige las herramientas que necesites para tu proyecto.`
4. Un párrafo de cuerpo.
5. `<p>` **`Características:`** — 18px / 30.6.
6. **6 blurbs `modulo-beneficios`** (ver abajo).
7. `<h2>` **`Software de contaminación atmosférica`** (37px azul) + `<p>` azul
   22.67px: `Analiza y entiende cómo se comporta la contaminación.`
8. `<p>`: `Gracias a nuestro software de medición de calidad del aire, podrás:`
9. **`CarruselCapturas`** (ficha propia: `carrusel-capturas.spec.md`).
10. Párrafo de cierre con un enlace inline a `/es/soluciones/`.

### Los 6 blurbs de característica (`Caracteristica`)

- Caja **31% + 2%** de margen derecho, `margin-bottom: 27.82px`, 3 por fila.
- Icono **50×50** centrado (`.et_pb_main_blurb_image` con `text-align:center`,
  `width:50px`, `margin-bottom: 30px`). El SVG original es 800×800.
- `<h4>` **16px / 19.2 / centrado**. **Sin descripción** — el tipo
  `Caracteristica` solo tiene `{ icono, titulo }`.

| # | Título | Icono (`uploads/`) |
|---|---|---|
| 1 | Basado en la nube | `2023/02/cloud-based-1.svg` |
| 2 | Datos fiables garantizados | `2023/02/reliable-data.svg` |
| 3 | Flexible y escalable | `2023/02/flexible-scalable-1.svg` |
| 4 | Múltiples usuarios | `2023/02/multiple-users.svg` |
| 5 | Integración de datos de fuentes externas | `2023/02/data-integration.svg` |
| 6 | Herramientas avanzadas | `2023/02/advanced-tools.svg` |

## El CTA de vídeo — lightbox, no ancla

`href="#video"`, pero **el destino no existe en el DOM al cargar**: el plugin
*popups-for-divi* extrae la sección `#video` del árbol y la reinyecta al pulsar.

**URL real del reproductor, capturada abriendo el lightbox en vivo el
2026-07-27** (clic real sobre el botón, luego lectura del `iframe`):

```
https://www.youtube.com/embed/sRLe65Enlbs?feature=oembed
```

- Proveedor: **YouTube** (no Brightcove).
- `title="Kunak Cloud 2.2.0 release - Air quality software - New features"`.
- Al abrir: la sección gana `is-open with-close`, el `<body>` pasa a
  `overflow: hidden`, y el modal mide 1080 de ancho con el iframe a 819×461.

En el clon se cubre con `VideoLightbox` pasándole **`youtubeId="sRLe65Enlbs"`**
(el componente ya construye la URL de embed). El `iframe` se desmonta al cerrar,
así que el vídeo se detiene — mismo efecto que el original.

Corrige a `../BEHAVIORS.md` §4, que dejaba abierto si era Brightcove o YouTube.

## Móvil (390)

Columnas apiladas a 312. El CTA de vídeo pasa a alineación **izquierda**
(`et_pb_button_alignment_phone_left`). Los 6 blurbs pierden el 31% y van a
ancho completo (la regla `.modulo-beneficios` solo aplica desde 981px).
