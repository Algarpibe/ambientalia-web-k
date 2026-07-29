# BEHAVIORS.md — arquetipo MONOGRÁFICO TÉCNICO

> Fase de specs, **2026-07-29**. Medido en EDAR y Petróleo y gas a 1440×900 y
> 390×844 (device metrics), perfil limpio, Cookiebot bloqueado.
> Sondas: `scripts/qa/mono-{modulos,cabecera,detalle,inline}.mjs`.

## Resumen: aquí casi nada se mueve

**El cuerpo del monográfico es 100% estático.** Las 19 filas de las dos páginas
son texto, listas, fotos, una tabla y botones: ni un acordeón, ni un tab, ni un
slider, ni un hover más allá del de botón. Toda la interacción de estas páginas
vive en piezas **compartidas con SECTOR**, ya especificadas en
`docs/research/sectores/BEHAVIORS.md` y ya construidas:

| pieza | comportamiento | dónde está descrito |
|---|---|---|
| Header y mega-menú | hover, sticky, hamburguesa ≤1023 | `sectores/BEHAVIORS.md` §1 |
| Banda de clientes | carrusel de logos en autoplay | §2 |
| Slider CTA de ancho completo | 3 diapositivas, autoplay 7 s | §3 |
| `#lista-soluciones` | tabs de producto | §4 |
| Tarjetas de caso y artículo | hover | §5 |
| Botón "subir" | aparece con `scrollY > 500` | §6 |
| Mapa de proyectos (solo EDAR) | placeholder deliberado, no se clona | `sectores/PAGE_TOPOLOGY.md` |

Lo que sigue es **solo lo propio de este arquetipo**.

## 1 · La `<table>` desborda su columna a 390, y el original no lo arregla

Medido en EDAR a 390 (`mono-inline.mjs 390`):

| | valor |
|---|---|
| ancho de la tabla | **524.39** |
| ancho de su contenedor (`.et_pb_text_inner`) | 335.39 |
| `overflow-x` del contenedor | **`visible`** |
| borde derecho de la tabla | 551.69 |
| `scrollWidth` / `clientWidth` del documento | **390 / 390** |
| `overflow-x` de `html` y `body` | `visible` |

O sea: **la tabla se sale 189px de su columna, la página NO gana scroll
horizontal, y la cuarta columna ("Valor operativo del control") queda
inalcanzable en móvil.** No es un defecto de medida: es lo que sirve el
original.

Es **el mismo caso ya documentado en `/accesorios`** (A4 en `PENDIENTES-QA.md`:
"envoltorio de tabla `visible`, 4ª columna alcanzable: no"), y allí se decidió
**no** replicar la pérdida de contenido. La misma decisión aplica aquí, y se
anota como **desviación deliberada** en el momento de construir:

- el clon envuelve la tabla en `overflow-x: auto`;
- consecuencia esperada: a 390 el clon será **más alto o más bajo** que el
  original en esa fila (el original la deja desbordar, no la comprime), y eso
  **no es un defecto**;
- alternativa a evaluar en QA visual: reformatear a tarjetas apiladas en móvil.
  No se decide aquí — hace falta la comparación lado a lado.

A 1440 no hay nada que decidir: 1238.39 en un contenedor de 1238.39, `scrollW`
= `clientW` = 1440.

## 2 · Ocho botones de módulo, todos enlaces normales

EDAR 2, Petróleo 5, más los 2 del hero en cada una. Son `et_pb_button` con el
`margin-bottom: 16px` del wrapper, alto 74 (mismo botón Divi ya construido:
15px/44px con flecha, `PENDIENTES-QA.md` §A2). **Ninguno abre modal, lightbox ni
ancla interna**: navegan.

Destinos medidos (los mismos rótulos se repiten entre las dos páginas):
"Solicita una demo técnica", "Descargar catálogo", "Saber más", "Más
información", "¿Quieres más información?". Al transcribirlos aplica la **regla
de rutas locales** de `CLAUDE.md`: si el destino ya está clonado, `href` local
y **sin** `target="_blank"`.

## 3 · Lo que se comprobó que NO ocurre

- **No hay animaciones de entrada.** Igual que en el resto del sitio (M7 en
  `PENDIENTES-QA.md`, cerrado como premisa incorrecta): las imágenes llevan
  `et-waypoint` + `et_pb_animation_off` y el critical CSS de Divi eliminó las
  reglas. No re-investigar.
- **La tabla no ordena, no filtra y no tiene JS.** Es HTML pegado en un módulo
  de texto: sin `<button>`, sin `data-*`, sin clases del tema.
- **La serie de `h4` no es un acordeón.** Son pares `h4 + p` siempre visibles
  dentro de un solo `et_pb_text`; ni `display:none` ni handlers.
- **El punteado no reacciona a nada.** `<img>` decorativa de 60×22.
- **El hero no tiene lightbox de vídeo** (a diferencia de la home, M5).

## 4 · Nota de método para la fase de QA

Las dos páginas llevan el bloque **"Artículos y Guías"**, o sea que arrastran
**P4**: es la única fuente de dispersión conocida del sitio (27/54/81, el
original sortea los 3 posts en cada carga). Suelo de ruido por regiones, según
`scripts/qa/README.md`:

- de "Artículos y Guías" hacia abajo → hasta **81**;
- **en todo el cuerpo del monográfico → 0**. Dos corridas de `mono-cabecera.mjs`
  a 1440 del 2026-07-29 dieron `docH` **11136 / 11303** y el `h1` en **y 261.16**
  en las cuatro páginas, sin variación.
