# blurbs-iconos.spec.md — `BlurbsIconos` (componente compartido)

> Medido en vivo el **2026-07-27** a **cw 1264.7** (viewport 1280) sobre las dos
> páginas que lo usan, con computed styles reales y las imágenes forzadas a
> `eager`. Sustituye al bloque inline que vivía dentro de `InfoProductoSoftware`.

Rejilla de blurbs de **icono arriba centrado + título**, sin descripción y sin
enlace. Es el mismo módulo `et_pb_blurb` del tema en dos calibraciones, así que
el clon lo tiene en un solo componente con una tabla de variantes.

## Las dos variantes

| | `iconos-md-3` (/kunak-api) | `modulo-beneficios` (/software) |
|---|---|---|
| Clases del tema | `iconos-xs-2 iconos-md-3` | `modulo-beneficios` |
| Caja móvil | **48%** + 2% → **2 por fila desde 0** | 100% → 1 por fila |
| Corte | **480px** | 981px → el clon lo mapea a `md`, como `monitor/Beneficios` |
| Caja desktop | **30%** + 3% | **31%** + 2% |
| Ancho medido @1264.7 | 196.8 (col 2/3) · 223.5 (col 3/4) | 203.3 (col 2/3) |
| `<h4>` | **18 / 21.6** | **16 / 19.2** |
| Alto del blurb (1 línea) | **107.6** | **105.2** |
| Veces que aparece | 2 (características + beneficios) | 1 (características) |

## Anatomía común (idéntica en las dos páginas)

```
et_pb_only_image_mode_wrap   padding-top: 6px · margin-bottom: −10px
  img                        50 × 50, centrado
et_pb_main_blurb_image       margin-bottom: 30px           → 46 + 30
et_pb_blurb_container > h4   text-align: center · padding-bottom: 10px
```

En números: **6 arriba + 50 de icono + 20 hasta el título** (los 30 del wrap
menos los −10 del interior). El `letter-spacing: -0.5px` lo pone la regla
global de `h1–h6` del clon, no el componente.

`margin-bottom` de módulo: **27.82 a cw 1264.7** en las dos páginas (es el 2,2%
del ancho de ventana → 31.67 a 1440); **30px fijos** en móvil.

⚠️ En /kunak-api el 6.º blurb de cada grupo es el último hijo de su columna y
Divi le pone `margin-bottom: 0`. Es **inconsecuente**: la altura de la fila la
fija el hermano más alto de la última línea, que sí conserva sus 27.82
(verificado: col 2/3 = 692.8 = 20 + … + 27.82). El clon no necesita
`last:mb-0`.

## ⚠️ La separación horizontal del tema está desalineada en /software

El tema separa con `margin-inline-end` y lo anula con `:nth-child(3n+1)`, que
cuenta sobre **todos** los hijos de la columna Divi — también los módulos de
texto que van antes de los blurbs:

| Página | Módulos previos | Hijos que son blurbs | `3n+1` cae en | Efecto |
|---|---|---|---|---|
| /kunak-api | 4 | 5–10 | hijos 7 y 10 = blurbs **3 y 6** | huecos **uniformes** de 3% |
| /software | 5 | 6–11 | hijos 7 y 10 = blurbs **2 y 5** | el 2.º y el 3.º de cada fila salen **PEGADOS** |

Medido en el original de /software: `x = 482.3 · 698.7 · 902.0` con caja de
203.3 → hueco 1→2 = **13.1** (2%) y hueco 2→3 = **0**.

El clon usa `gap-x` (huecos uniformes) en las dos variantes:

- en **/kunak-api** es exacto, es lo que hace el original;
- en **/software** mantiene lo que ya se construyó y verificó en su tanda — el
  3.er blurb de cada fila queda 13.1px a la derecha del original. Anotado como
  pendiente **A5** en `docs/PENDIENTES-QA.md`; no se toca aquí porque el
  encargo del refactor era extraer, no corregir.

## Desviaciones conocidas de la variante `modulo-beneficios`

Las dos vienen de la construcción original de /software y se conservan tal cual
para que el refactor no mueva ni un píxel (A/B verificado: mismos rects, misma
altura de documento 11533):

1. El `<h4>` se pinta a **fw 400**; el original es **fw 300**.
2. El reparto vertical es `icono mb 30 + h4 sin padding` en vez de
   `icono mb 20 + h4 pb 10`. El **alto total del blurb es el mismo** (105.2),
   pero el título va 10px más abajo dentro de la caja.

En la variante `iconos-md-3` los dos detalles sí están como el original.

## a11y

Los `alt` del original son textos heredados de otra página ("Interfaz API Rest"
repetido en los 6 de características; "Easy fast installation",
"Cartridges system", "Proven accuracy"… en los de beneficios) y no describen el
icono. Se emiten **decorativos** (`alt="" aria-hidden`), mismo criterio que en
`lista-beneficios.spec.md` y `rejilla-herramientas.spec.md`.
