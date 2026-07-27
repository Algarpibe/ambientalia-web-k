# accesorio-card.spec.md — Ficha de accesorio (`AccesorioCard`)

> Medido 2026-07-27 a **1440×900** y **390×844 real**. Las 11 fichas comparten
> markup exacto. Topología: `../PAGE_TOPOLOGY.md` §"Anatomía de la ficha".

## Markup del original

```html
<div id="{slug}" class="accesorio-container">
  <img class="attachment-post-thumbnail wp-post-image" width="300" height="300" src="…">
  <div class="accesorio-content">
    <h3 class="accesorio-title">{título}</h3>
    <div class="accesorio-txt">{rich-text}<table>…</table></div>
  </div>
</div>
```

No es una tarjeta: **no tiene borde, ni fondo, ni sombra, ni hover**. Es un
bloque de contenido con la imagen flotada.

## Desktop (fiel al original)

| Propiedad | Valor medido |
|---|---|
| Contenedor | `display: block`, `margin: 32px 0 48px`, ancho de columna **848** |
| Imagen | **`float: right`** con **`margin-top: -32px`**, render **260×244** sea cual sea el natural (300/500/800/1000/1024) |
| Título `<h3>` | **32px / 32 / fw300 / #333**, `padding-left: 10px` |
| Texto | **18px / 30.6 / #333**; el texto **fluye alrededor** de la imagen |
| Separación | Solo el aire de los márgenes; sin regla divisoria |

El `margin-top: -32px` de la imagen la sube por encima del `<h3>`, de modo que
el título arranca a la izquierda de la foto y el párrafo la rodea.

### Contenido rich-text (heterogéneo — ver §Modelo de datos)

- 5 de 11 llevan la descripción en `<p>`; **6 la llevan como nodo de texto
  suelto** dentro de `.accesorio-txt` (sin envolver).
- **1 con `<ul>`**: `anemometro-ultrasonico`, 3 ítems (Velocidad máxima del
  viento · Velocidad media del viento · Dirección del viento).
- **1 con imagen extra**: `gashood`, `2024/07/gashood-air-pro-lite.jpg`
  1500×500 → **848×283**, `float: none`, debajo del párrafo. Es la única ficha
  sin tabla.

En el clon esto se normaliza a un modelo de datos (`description: string[]`,
`bullets?`, `extraImage?`) y se renderiza siempre con `<p>` — el resultado
visual es idéntico porque el nodo suelto hereda los mismos 18px/30.6.

## Móvil — **ARREGLADO** (decisión de producto 2026-07-27)

El original a 390 mantiene el `float: right` a 260 px dentro de una columna de
312, dejando ~52 px al `<h3>`, que **se parte letra a letra**: "Pa / nel /
sol / ar" (alto 138 px para dos palabras). Ver `shots/m390-bloque-panelsolar.png`
del recon.

**En el clon NO se replica ese defecto.** A `<640px`:

- La imagen deja de flotar y se **apila encima del título** (`float: none`,
  bloque propio), sin `margin-top` negativo.
- El `<h3>` ocupa el ancho completo de la columna (312) y no se parte.
- El párrafo va a ancho completo, sin rodear nada.

Desde `sm:` (≥640) se restaura exactamente el comportamiento del original
(float derecha, −32 de margen superior, 260×244).

## Accesibilidad

- `id={slug}` en el contenedor: es el destino de las anclas de `AnchorNav`.
- `scroll-margin-top` para compensar el header fijo al saltar por ancla
  (el original aterriza el bloque a **80 px** del viewport, ver
  `../BEHAVIORS.md` §5).
- La imagen es decorativa/ilustrativa del producto: `alt` con el título del
  accesorio (el original la sirve con `alt=""`; usar el título es más útil y no
  altera el render).

## Inventario (11 fichas)

Ver la tabla completa en `../PAGE_TOPOLOGY.md` §"Inventario completo".
Erratas del original que van **verbatim**: `Anenómetro Ultrasónico` (sic),
`Cargadores para exteriores` (plural, con slug en singular).
