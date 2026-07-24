# galeria-ensayos.spec.md — Bloque "Ensayos y pruebas" (S3 · col. derecha · ancla `#trials-test`)

> getComputedStyle 2026-07-24 a viewport **2400×1138** (col. derecha 3/4 = 1016 px). Galería medida CARGADA: 660×421.
> Computed fraccionarios (31.25px, 6.99px…) = zoom 0.8 del navegador; se dan los valores CSS canónicos.
> ⚠️ Corrección a PAGE_TOPOLOGY: lo que se describía como "H2 del estudio completo" es en realidad un **BOTÓN outline** → PDF.

## Estructura del bloque (orden de módulos)

1. **Título** `.et_pb_text_23` con `id="trials-test"`: `<h2>Ensayos y pruebas</h2>` — **37px/37px w300 #333 ls ‑0.5px pb 10px**.
2. **Botón outline** `et_pb_button_9` (patrón `OutlineButton` existente: transparente, borde #333, radius 30, 15px w700,
   padding 7.5/40.5/9/22.5, flecha →). Texto verbatim: `Kunak AIR Pro: Estudio de campo de co-ubicación (completo)`
   → `https://kunakair.com/doc/External/Kunak_AIR_Pro_Co-location_tests.pdf` (target _blank).
3. **Galería-slider** `.et_pb_gallery_0.galeria.et_pb_slider.et_pb_gallery_fullwidth` — ver abajo.
4. `.et_pb_text_24` — módulo **VACÍO** (spacer accidental del builder; ignorable en el clon).
5. **"Resultado de las pruebas"** `.et_pb_text_25` — H3 + lista 2 columnas de enlaces a PDFs.
6. **CTA centrado** `et_pb_button_10.boton-azul` (patrón `BlueButton`): `¿Cómo asegura Kunak la mejor precisión?`
   → `https://kunakair.com/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision/`.

Margen entre módulos: 37.93px (2.75% del row).

## Galería (marco "tablet" + slider fade)

### Marco

```css
.galeria { border-radius: 17px; box-shadow: 0 0 1px /* #333 hairline */; overflow: hidden; }  /* módulo, max-width 660px */
.galeria .et_pb_gallery_items { border: 32px solid #eee; }        /* franja gris = marco tablet; ≤479px: 16px */
```
- Medidas cargada @1016: módulo **660×421**; imagen interior **596×358** (660 − 2×32).

### Slides

- 9 × `.et_pb_gallery_item` — el activo lleva `.et-pb-active-slide` y `display:block`; el resto `display:none`.
- Transición: **crossfade por JS de Divi** (jQuery fade ~400ms; no hay regla CSS). Clon: conmutar con opacity ~400ms.
- Cada slide: `.et_pb_gallery_image.landscape > a[href=imagen-completa] > img` (el `<a>` dispara el lightbox del tema;
  decisión de clon: mantener lightbox de imagen o dejar la imagen estática — flag de build).
- `img`: `width="1000" height="600"` (5:3), `srcset` 1000w / 980×588 / 480×288, `sizes`: ≤480→480px, 481–980→980px, ≥981→1000px.
- **Sin autoplay** (verificado en recon).
- ⚠️ Quirk de fidelidad: la galería colapsa si las imágenes lazy no han cargado (caja 0×0) — en el clon precargar el primer frame
  o reservar aspect-ratio para evitar CLS.

### Flechas ‹ › (aparecen al hover del slider)

```css
.et-pb-arrow-prev, .et-pb-arrow-next {           /* <a href="#"><span>Anterior|Siguiente</span></a>, span display:none */
  position: absolute; top: 50%; margin-top: -24px; z-index: 100;
  font-size: 48px; color: #333;                   /* bg_layout_light; glifos ETmodules ::before "4" y "5" */
  transition: .2s ease-in-out; opacity: 0;
}
.et-pb-arrow-prev { left: -22px; }   .et-pb-arrow-next { right: -22px; }
.et_pb_slider:hover .et-pb-arrow-prev { left: 22px; opacity: 1; }    /* entran deslizándose + fade */
.et_pb_slider:hover .et-pb-arrow-next { right: 22px; opacity: 1; }
```
- Click → slide anterior/siguiente con crossfade (verificado en recon idx 0→1→2).
- ⚠️ `href="#"` en el original (salta el scroll a veces) → clon: `<button>` + `preventDefault` (BEHAVIORS §7).
- Clon: glifos ETmodules no disponibles → usar ‹ › SVG/texto a 48px equivalente.

### Dots (9, numerados ocultos)

```css
.et-pb-controllers { position: absolute; width: 100%; text-align: center; z-index: 10; bottom: -12px; }
/* override .galeria; base Divi: bottom 20px. ≤479px: bottom: -3px */
.et-pb-controllers a {                    /* texto interior "1".."9" oculto */
  display: inline-block; width: 7px; height: 7px; border-radius: 7px;
  text-indent: -9999px; margin-right: 10px; padding: 0;
  background-color: rgba(0,0,0,.3); opacity: .5;          /* layout light */
}
.et-pb-controllers a:last-child { margin-right: 0; }
.et-pb-controllers .et-pb-active-control { background-color: #333; opacity: 1; }
```
- Con `bottom:-12px` los dots quedan visualmente **sobre la franja gris inferior del marco** (verificado en screenshot).
- Dots clicables → van al slide N.

### Las 9 imágenes (orden verbatim)

⚠️ 6 nombres de archivo contienen `<sub>…</sub>` **literal URL-encoded** (`%3Csub%3E`). Al descargar, guardar con nombre
saneado (columna "local") y mapear en datos.

| # | URL origen (`/wp-content/uploads/…`) | Local sugerido |
|---|---|---|
| 1 | `2023/09/co_mexico.webp` | `co_mexico.webp` |
| 2 | `2023/09/NO_sweden.webp` | `NO_sweden.webp` |
| 3 | `2023/09/NO%3Csub%3E2%3C/sub%3E_UK.webp` | `no2_uk.webp` |
| 4 | `2023/09/O%3Csub%3E3%3C/sub%3E_spain.webp` | `o3_spain.webp` |
| 5 | `2023/09/SO%3Csub%3E2%3C/sub%3E_france.webp` | `so2_france.webp` |
| 6 | `2023/09/H%3Csub%3E2%3C/sub%3ES_spain.webp` | `h2s_spain.webp` |
| 7 | `2023/09/PM%3Csub%3E10%3C/sub%3E_belgium.webp` | `pm10_belgium.webp` |
| 8 | `2023/09/PM%3Csub%3E2.5%3C/sub%3E_belgium.webp` | `pm25_belgium.webp` |
| 9 | `2023/01/co2_glasgow.jpg` | `co2_glasgow.jpg` |

(1000×600 confirmado en la nº 1; todas con variantes srcset 980/480 regenerables — basta descargar la base.)

## "Resultado de las pruebas" (módulo 5)

- H3: `Resultado de las pruebas` — **32px / 32px, weight 300, #333** (OJO: 32px, no 37 como los H2 del bloque), pb 10px.
- `ul`: **`columns: 2`** (columnas CSS), `list-style: none; padding-left: 0`; `li` 18px/26px.
- 8 `li`, cada uno UN enlace `target="_blank" rel="noopener"`, color **#333 sin subrayado**, formato
  `<strong>XX</strong> Estudio de campo en coubicación` (el símbolo con `<sub>` en los que llevan subíndice):

| Chip (strong) | href (`https://kunakair.com/doc/External/…`) |
|---|---|
| CO | `Kunak_AIR_Co-location_test_CO.pdf` |
| NO | `Kunak_AIR_Pro_Co-location_test_NO.pdf` |
| NO₂ | `Kunak_AIR_Pro_Co-location_test_NO%3Csub%3E2%3C/sub%3E.pdf` |
| O₃ | `Kunak_AIR_Pro_Co-location_test_O%3Csub%3E3%3C/sub%3E.pdf` |
| SO₂ | `Kunak_AIR_Pro_Co-location_test_SO%3Csub%3E2%3C/sub%3E.pdf` |
| H₂S | `Kunak_AIR_Pro_Co-location_test_H%3Csub%3E2%3C/sub%3ES.pdf` |
| CO₂ | `Kunak_AIR_Pro_Co-location_test_CO%3Csub%3E2%3C/sub%3E.pdf` |
| PM | `Kunak_AIR_Pro_Co-location_test_PM.pdf` |

⚠️ Los href con `<sub>` encoded son así EN EL ORIGINAL (CMS roto); el primero además usa `Kunak_AIR_` sin `Pro`.
Decisión clon: enlazar verbatim al origen (fiel; son enlaces externos a kunakair.com).

## Estados (resumen)

| Elemento | Default | Hover slider | Otro |
|---|---|---|---|
| Flechas | opacity 0, fuera (±-22px) | opacity 1, dentro (±22px), transición .2s | click → crossfade ~400ms |
| Dot inactivo | rgba(0,0,0,.3), op .5 | — | click → activa slide |
| Dot activo | #333, op 1 | — | — |
| Chips resultado | #333 sin subrayado | (sin regla propia detectada; heredado tema) | target _blank |
| Botones 2 y 6 | patrones Outline/BlueButton existentes | hover estándar (flecha desliza / gris) | — |

## Assets NUEVOS a descargar

Las 9 imágenes de la tabla anterior (guardar en `public/images/uploads/2023/09/` — la nº 9 en `2023/01/` — con
los nombres locales saneados). Los PDFs NO se descargan: se enlazan al origen.
