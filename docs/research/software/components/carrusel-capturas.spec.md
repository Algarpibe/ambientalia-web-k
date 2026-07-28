# carrusel-capturas.spec.md — `CarruselCapturas` (9 diapositivas, autoplay)

> Medido el **2026-07-27** en vivo a **1280** (cw 1264.7): computed styles,
> rects, muestreo temporal del autoplay con `setInterval` y **hover con ratón
> real** para los estados de flecha. Es **la única pieza genuinamente nueva** de
> este arquetipo (`../BEHAVIORS.md` §1).

## Caja

Módulo `et_pb_slider` (`et_pb_slider_0`) en la columna 2/3 de la fila 2 de S1.

| Propiedad | Valor medido |
|---|---|
| Alto | **500px** (`.et_pb_slider_0, .et_pb_slider_0 .et_pb_slide { height: 500px }`) |
| Ancho | 655.9 a cw 1264.7 (el 100% de la columna 2/3); 747 a 1440 |
| Borde | **22px sólido `#eeeeee`** (Divi `et_pb_with_border`) |
| Radio | **32px** |
| Sombra | `0 0 5px rgba(0,0,0,0.3)` |
| Overflow | `hidden` (x e y) |
| `margin-bottom` | 27.82px |
| Caja interior (padding-box) | 611.9 × 456 |

## Diapositiva

- El fondo es **`background-image` sobre el `.et_pb_slide`**, no un `<img>`:
  `background-size: cover`, `position: 50% 50%`, `no-repeat`.
- **Velo oscuro**: `.et_pb_slide_overlay_container` a `rgba(0,0,0,0.3)`,
  absoluto y a sangre (`et_pb_slider_with_overlay`).
- **Un solo texto**, sin descripción ni botón:
  `<h3 class="et_pb_slide_title">` — **30px / 30 / fw700 / #FFF**, centrado,
  `padding-bottom: 10px`, `text-shadow: 0 1px 3px rgba(0,0,0,0.3)`.
- La caja del texto (`.et_pb_slide_description`) lleva `padding: 16% 8%` y
  `margin: auto` → el título queda **centrado vertical y horizontalmente**.

## Las 9 diapositivas (orden verbatim)

| # | Título | Fondo (`uploads/2023/02/`) |
|---|---|---|
| 0 | Identificar los puntos conflictivos | `hotspots-detection.jpg` |
| 1 | Caracterizar las fuentes de contaminación | `pollution-sources-identification.jpg` |
| 2 | Detectar posibles fugas | `leakage-detection.jpg` |
| 3 | Analizar el tamaño de las partículas y su distribución | `particle-size-analysis.jpg` |
| 4 | Gestionar la red de sensores | `control-panel.jpg` |
| 5 | Realizar análisis multiparamétricos | `multiparametric-analysis.jpg` |
| 6 | Registrar las tareas de mantenimiento en sus dispositivos (GMAO) | `cmms.jpg` |
| 7 | Acceder al registro de alarmas y su trazabilidad | `alarms-traceability.jpg` |
| 8 | Validar datos y crear informes personalizados | `customised-reports.jpg` |

## Autoplay — **6000 ms por diapositiva**, no 3500

`../BEHAVIORS.md` §1 estimó "~3,5 s" a partir de un salto de 2 diapositivas en
7 s. **Está mal**: esa lectura arrancó a mitad de ciclo.

Medición correcta (muestreo cada 100 ms del elemento con
`.et-pb-active-slide`, tras descartar el primer intervalo parcial):

```
marks   [0,8] [3814,0] [9819,1] [15813,2]
deltas  3814   6005     5994
```

→ periodo estable **6000 ms**. Cuadra con las clases del módulo:
`et_slider_auto` + **`et_slider_speed_5000`** (5 s de reposo) + **1 s de
transición** = 6 s de ciclo visible. **Bucle infinito**, sin pausa al hover.

## Transición — **fundido cruzado**, no desplazamiento

Muestreado a 80 ms durante los cambios: durante la transición hay **dos
diapositivas visibles**, ambas con `left: 0` y `transform: none`; la saliente
queda a `opacity: 1` con `z-index: 2` y la entrante sube de `opacity: ~0` a 1
con `z-index: 1`. **No hay desplazamiento horizontal**: es el mismo `fadeIn/Out`
de jQuery que ya se documentó en el slider de Testimonios de la home.

Implementación en el clon: diapositivas apiladas en `position: absolute` con
`transition: opacity 1000ms` y un `setInterval` de **6000 ms**.

## Flechas — **replicadas EXACTAMENTE: invisibles salvo al pasar el ratón**

Lo que dejaba abierto el recon ("decidir si se replican visibles") queda
cerrado con hover de ratón real:

| Estado | `opacity` | `left` (prev) | `right` (next) |
|---|---|---|---|
| Reposo | **0** | **−22px** | **−22px** |
| Hover sobre el slider | **1** | **22px** | **22px** |

- Divi añade por JS la clase **`et_slider_hovered`** al módulo en `mouseenter`;
  el CSS de reposo *no* usa `:hover`, por eso una lectura de computed styles
  inmediatamente después de mover el ratón todavía devuelve `opacity: 0` — hay
  que esperar a que caiga la clase (trampa de método: pasó en esta medición).
- Transición **`0.2s ease-in-out`**.
- Caja **48×48**, `position: absolute`, `top: 228px` con `margin-top: -24px`
  (centro exacto de los 456px de caja interior), `z-index: 100`, color `#FFF`.
- Glifo: fuente **ETmodules**, `content: "4"` (prev) y `"5"` (next),
  `font-size: 48px`. Son sendos **chevrones** ‹ › — en el clon se reproducen con
  los iconos `ChevronLeft`/`ChevronRight` de lucide a 48px, el mismo criterio
  que ya se usó para el caret ETmodules "3" del mega-menú.
- Al pulsar avanzan/retroceden con bucle. **No detienen el autoplay.**

## Puntos — siempre visibles

| Propiedad | Valor medido |
|---|---|
| Contenedor `.et-pb-controllers` | `position: absolute`, `bottom: 20px`, `left: 0`, ancho = el de la diapositiva, `text-align: center`, `z-index: 10`, `line-height: 30.6px` |
| Punto | `display: inline-block`, **7×7**, `border-radius: 7px`, sin borde, `background: rgba(255,255,255,0.5)`, `text-indent: -9999px` |
| Separación | `margin-right: 10px`; **el último a 0** (verificado: los 9 puntos suman 143px = 9×7 + 8×10, centrados) |
| Inactivo / activo | `opacity: **0.5**` / `opacity: **1**` (el color de fondo no cambia) |

Posiciones medidas a 1280: x = 738.7, 755.7, 772.7, 789.7, 806.7, 823.7, 840.7,
857.7, 874.7 (paso 17).

## Accesibilidad (adición del clon, sin efecto visual)

Los puntos del original son `<a>` vacíos con `text-indent: -9999px`. En el clon
se emiten como `<button type="button">` con `aria-label="Ir a la diapositiva N"`
y `aria-current` en el activo; las flechas, como `<button>` con
`aria-label="Diapositiva anterior/siguiente"`. La región lleva
`aria-roledescription="carrusel"`.

## Móvil (390)

El carrusel **mantiene los 500px de alto** (`../BEHAVIORS.md` §8) y pasa a
ancho de columna (312). Flechas y puntos siguen presentes; sin hover, las
flechas quedan invisibles — fiel al original.
