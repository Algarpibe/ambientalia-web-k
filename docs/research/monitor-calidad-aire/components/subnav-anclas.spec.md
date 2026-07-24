# subnav-anclas.spec.md — Sub-nav de anclas sticky + scrollspy (S3 · columna izquierda)

> getComputedStyle a 1045×515 + reglas extraídas de `KunakAir/style.css` + lógica del script inline de la página.
> Tokens: `--azul:#0075C9`, `--gris:#7F8798`, `--gris-claro:#ecedf0`, `--negro:#333`.

## Estructura

Fila `.et_pb_row_3.et_pb_row_1-4_3-4` (contenedor 824px): columna izq `.et_pb_column_1_4.columna-lista-anclas.et_pb_sticky_module` (**172px**) + columna der 3/4 con los 8 bloques anclados.

Columna izquierda, de arriba a abajo:

1. **Caja menú** `.et_pb_text_16.menu-anclas.et_pb_with_border`:
   - `border: 0.67px solid #333; border-radius: 10px; padding: 16px 16px 0 16px; background: transparent; width: 172px`.
   - `ul` `padding:0; list-style:none`; `li` `padding-bottom:10px`; `a` `display:block; padding:2px 0`.
2. **3 botones CTA** (wrappers apilados debajo de la caja):
   - `Descargar ficha técnica` (outline #333) → PDF `Kunak_AIR_Datasheet_ES.pdf`
   - `Solicita más información` (`boton-azul`) → `/es/contacto/`
   - `Descarga el catálogo` (`boton-azul`) → **`#catalogo` (ancla muerta en el original)** — ✅ decisión: enlazar `/es/descarga-catalogo/`.
   - Mismos estilos de botón que el resto (radius 30, 15px w700, hover gris/flecha).

## Enlaces del menú (verbatim + ids)

`<a target="_blank" id="link-<ancla>" href="#<ancla>">` (el `target="_blank"` es ignorado en la práctica porque el click se intercepta con preventDefault):

| Texto | href | id |
|---|---|---|
| Beneficios | `#benefits` | `link-benefits` |
| Aplicaciones | `#applications` | `link-applications` |
| Software | `#software` | `link-software` |
| Especificaciones | `#specifications` | `link-specifications` |
| Ensayos y pruebas | `#trials-test` | `link-trials-test` |
| Casos de éxito | `#case-studies` | `link-case-studies` |
| Paquetes de energía | `#power-packs` | `link-power-packs` |
| Sondas meteorológicas | `#meteo-sensors` | `link-meteo-sensors` |

Los targets son los módulos de título de cada bloque (`div.et_pb_text` con ese id) en la columna derecha.

## Estados de los enlaces

- **Default**: `color: #BBB (rgb(187,187,187))`, **16px, weight 800, line-height 26px** (@1045; regla ≥1279px fija 16px/1.5).
- **Activo (scrollspy)**: clase **`activo`** → `color: var(--azul) !important` (#0075C9). Mismo weight.
- **≥1279px**: cada `a` añade `padding-inline-end: 30px; background: url(ico-arrow.svg) no-repeat right top; background-size: 30px 30px` (flecha gris a la derecha) y `:hover { background-image: url(ico-arrow-azul.svg) }` (flecha azul al hover). Ambos SVG YA están en el clon (`themes/KunakAir/assets/images/`). A 1045 (<1279) no hay flecha.
- Hover de texto: no hay regla propia de color → queda #BBB (solo cambia la flecha en ≥1279).

## Sticky (desktop)

Implementación original: Divi sticky JS (`et_pb_sticky_module`) — replicar con **CSS `position: sticky`**:

- CSS del tema: `.columna-lista-anclas { top: 70px !important; z-index: 1 }`; en ≥1024px, estado pinned añade `margin-top: 30px`.
- Comportamiento verificado: al alcanzar el tope, la columna se fija con inline `position:fixed; top:70px; z-index:10000; width:172px; padding-top:32px` (clases `et_pb_sticky et_pb_sticky--top`); se libera al final de la fila S3 (vuelve al flujo tras Sondas meteorológicas).
- La columna completa (menú + 3 botones ≈ 900px) es más alta que el viewport 515 → los botones quedan bajo el fold mientras está pinned (fiel; con `position:sticky` nativo ocurre igual).
- Equivalente clon: `position: sticky; top: 70px` sobre la columna (o `top: 100px` si se decide compensar mejor el header; fidelidad = 70).

## Scrollspy (lógica exacta, extraída del script inline de la página)

```
scroll → scrollTop = $(window).scrollTop()
para cada a de .menu-anclas ul li a (en orden):
    target = $(href); si target.offset().top < scrollTop + 600 → candidato (el último que cumple gana)
removeClass('activo') de todos → addClass('activo') al candidato
```

- **Offset fijo: +600px** — por eso el activo "se adelanta" (marca la sección cuyo título está a menos de 600px por debajo del tope del viewport).
- Sin IntersectionObserver en el original; en el clon puede implementarse con listener de scroll (rAF) y la misma regla `top < scrollY + 600` para fidelidad exacta.
- Estado inicial (arriba del todo): ningún candidato → sin activo; en la práctica "Beneficios" se activa en cuanto S3 se acerca.

## Click en ancla (smooth scroll)

- El script inline hace `animate({ scrollTop: … }, 500)` (500 ms; el código contiene una variante `offset().top - 80`); **comportamiento observado en vivo: aterriza con el módulo destino a ~0px del tope del viewport, SIN compensar el header fijo** → el H2 del bloque queda parcialmente tapado por el glass del header (~100px). No cambia el hash de la URL.
- Clon (fidelidad): `scrollTo` animado ~500ms hasta `target.top` (sin offset), sin `history.pushState`. Si se prefiere corregir el quirk: `scroll-margin-top: 110px` en los targets — **decisión de build, dejar flag**.

## Móvil (≤980) — verificado + reglas del tema

- **El menú se oculta**: `menu-anclas` → `display:none`. Solo sobreviven los 3 botones.
- La columna pasa a `display:flex` y, cuando está pinned (`et_pb_sticky--top`):
  ```
  inset-inline-start: 0; width: 100vw !important; top: 60px !important;
  background-color: #eee; display: flex; justify-content: center; z-index: 2;
  ```
  → **barra horizontal gris pegada bajo el header móvil (60px)** con los 3 botones en fila.
- Botones en la barra: `wrapper { max-width: 47%; margin-top: -10px }`; en ≤479px: `wrapper { max-width: 45%; margin-inline-end: 10px }`, `a { font-size: 13.5px; line-height: 1.25em }`, y la columna pinned `width: 49vh !important; max-width: 100%` — ⚠️ `49vh` parece un typo del tema (¿49%?): produce el recorte del primer botón por la izquierda visto a 390px. **Replicar fiel (con el recorte) o normalizar a 100vw — flag de build.**
- La barra se libera al terminar S3 (no acompaña a Artículos/FAQ/footer).

## Relación con el header

- Header sticky compartido (glass) por encima (z-index 1000); la barra móvil usa top:60 para colocarse justo debajo; en desktop top:70 deja ~10px de respiro bajo el nav de 60px?? (medida real del nav sticky del sitio: 127px de alto — el valor 70 hace que el menú se deslice PARCIALMENTE bajo el header al hacer scroll rápido; fiel al original).

## Assets

Ninguno nuevo: `ico-arrow.svg` y `ico-arrow-azul.svg` ya existen en el clon.
