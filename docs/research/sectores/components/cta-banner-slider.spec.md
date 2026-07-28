# CtaBannerSlider — fusión `CtaBanner` (piel) + `CarruselCapturas` (motor)

> Medido 2026-07-28 a **1440×900** y **390×844** reales, y en vivo con ratón
> real por CDP. Componente: `src/components/CtaBannerSlider.tsx` (raíz: lo van
> a usar los 8 sectores).

## Qué es

`et_pb_fullwidth_slider et_slider_auto et_slider_speed_7000 et_pb_bg_layout_dark`
con **3 diapositivas**. Es el CTA de ancho completo de siempre — misma piel que
`CtaBanner` — pero con autoplay y controles, que es justo lo que ya sabe hacer
`software/CarruselCapturas`. **No se escribe un motor nuevo**: se fusionan.

| Pieza | De dónde sale |
|---|---|
| Foto a sangre + velo, copy a la derecha, botón blanco | `CtaBanner` (`align="right"`) |
| Fundido cruzado, flechas 48×48 a `opacity 0 / ±22px` con `group-hover`, dots 7×7 a `bottom: 20` | `CarruselCapturas` |
| `intervalMs` | **7000** (medido, ver abajo) |

## Cadencia

`et_slider_speed_7000`, medido en vivo con muestreo de 500 ms durante 31 s:
cambios en 2553 → 9721 → 16342 → 23522 → 30637 ms. Deltas
`7168 / 6621 / 7180 / 7115` → **periodo ≈ 7,0 s**, bucle infinito, **fundido
cruzado** sin desplazamiento horizontal.

> ⚠️ No cuadra con la regla que se dedujo en `/software` ("5 s de
> `et_slider_speed_5000` + 1 s de fundido = 6000"): si el fundido sumara,
> `speed_7000` daría 8000 y da 7000. Aquí el valor a usar es **7000**. No se ha
> re-medido /software en esta tanda.

## Geometría

| | 1440 | 390 |
|---|---|---|
| Alto de sección | **401.56** | **265.06** |
| Slide `padding` lateral | 86.3906 (**6%**) | 23.3906 (6%) |
| `.et_pb_container` | 1267.22, `display: table` | 343.22 |
| `.et_pb_slide_description` `padding` | `76.0312 0 76.0312 620.922` | `34.3125 0 51.4688 0` |
| Título | `45px / 58.5px` w300 `#fff` `ls -0.5` `padding-bottom: 10` | **`27px / 35.1px`** |
| Botón | `15px/25.5` w700, `padding 7.5 40.5 9 22.5`, `radius 30`, `margin-top: 20`, `background rgba(0,0,0,.15)`, `border 1px solid #fff` | igual |

El `padding-left: 620.922` de la descripción es el **49%** que ya usa
`CtaBanner` con `align="right"`; en móvil desaparece (0).

## Fondo de cada diapositiva

```
background-image: url(<foto de la slide>);
background-color: rgba(0, 0, 0, 0.33);
background-position: 50% 50%;
background-size: cover;
```
(El velo lo pone el `background-color` del propio slide, no una capa aparte —
`mix-blend-mode: normal`.)

## Controles

- **Dots**: 3, `7×7`, `border-radius: 7px`, `background: #fff`,
  `margin-right: 10px`, contenedor `absolute` centrado a **`bottom: 20px`**
  (móvil `bottom: 13.25`). Activo e inactivos comparten color; los distingue la
  opacidad del tema.
- **Flechas**: 48×48 blancas, `position: absolute`, `margin-top: -24px`
  (centradas). En reposo `opacity: 0` con `left/right: −22px`; con el ratón
  sobre el slider, `opacity: 1` y `±22px`, transición `0.2s ease-in-out`.
  En el original el disparador es la clase `et_slider_hovered` que Divi añade
  **por JS** (trampa de medición: leer computed justo tras mover el ratón
  todavía da `opacity: 0`).
- **En móvil las flechas son visibles siempre** (`opacity: 1`, `left/right: 0`).

## Título enlazado

`<h4 class="et_pb_slide_title"><a href="…">…</a></h4>` — el título **es un
enlace**, al mismo destino que el botón. En los 7 sectores los 3 slides van a
`/es/contacto/`.

## Contenido (Urbano, verbatim)

| # | Título | Botón | Foto |
|---|---|---|---|
| 1 | Obtén datos fiables y precisos sobre la contaminación calle a calle | Protege la salud de tus ciudadanos | `2023/02/street-by-street-data.jpg` |
| 2 | Mejora del nivel de vida protegiendo el medio ambiente | Podemos ayudarte | `2023/02/improve-the-life-quality.jpg` |
| 3 | Complementa las redes oficiales con información fiable a escala hiperlocal | Descubre cómo | `2023/02/hyper-local-scale-data.jpg` |

Los 3 → `https://kunakair.com/es/contacto/` (no clonado).

## Assets

- `/images/uploads/2023/02/street-by-street-data.jpg`
- `/images/uploads/2023/02/improve-the-life-quality.jpg`
- `/images/uploads/2023/02/hyper-local-scale-data.jpg` (ya en el repo)
