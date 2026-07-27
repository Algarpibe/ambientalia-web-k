# PAGE_TOPOLOGY.md — kunakair.com/es/accesorios (arquetipo CATÁLOGO)

> Reconocimiento **2026-07-27** sobre `https://kunakair.com/es/accesorios/`.
> Metodología del proyecto: CDP con **perfil limpio**, Cookiebot bloqueado por
> `--host-resolver-rules`, **device metrics reales** y **pase de scroll +
> settle** antes de medir (sondas en el scratchpad de la sesión:
> `acc/lib.mjs` + `recon1..8`, `shots.mjs`).
> Viewports: **desktop 1440×900** y **móvil 390×844 real** (DPR 3).
> Alto total: **desktop ~10 940 px** (10 906–10 969 entre cargas — los 3 posts
> del bloque de artículos rotan, ver §Rotación) · **móvil 20 407 px**.
> Título SEO: "Accesorios para sensores de calidad del aire | Kunak".

## Qué arquetipo es realmente

**No es una rejilla de tarjetas.** Es un **catálogo long-form**: dos categorías,
cada una con una **columna sticky de anclas** a la izquierda y una **pila de
fichas de accesorio** a la derecha. Cada ficha es imagen + título + descripción
+ **tabla de especificaciones**. No hay filtros, ni tabs, ni paginación, ni
buscador, ni orden — el "listado" es estático y su única navegación es el
scrollspy de anclas.

Es, sin embargo, **plantilla + datos también en el original**: cada ficha se
renderiza con el mismo markup de tema (`.accesorio-container` > `img` +
`.accesorio-content` > `.accesorio-title` + `.accesorio-txt`) y la imagen lleva
`class="attachment-post-thumbnail wp-post-image"` → es el **thumbnail de un CPT
de WordPress** recorrido por un shortcode. La separación que pide el objetivo
CMS ya existe aguas arriba; el clon solo tiene que reproducirla.

## Stack detectado

- **WordPress + Divi** (tema hijo `KunakAir`), plantillas Theme Builder:
  `et-tb-has-header` **y `et-tb-has-footer`** — igual que /monitor-calidad-aire.
- Body: `solutions-template-default single single-solutions postid-26481` →
  **mismo CPT `solutions`** que la página de producto. Arquetipo hermano.
- Fuente **Manrope** (fundación compartida, sin novedad).
- **Ninguna librería nueva y — más importante — ninguna en uso.** WP carga
  globalmente swiper 8, `@3dweb/360javascriptviewer`, `popups-for-divi`,
  `lightbox.js`, `interact.js`, `snazzy-maps`, `divi-modules-table-maker`…
  pero en esta página el conteo de instancias es **0** en todas
  (`swiper`=0, `[id^=jsv-holder]`=0, `.da-overlay`=0, `a[href="#video"]`=0,
  `[class*=table-maker]`=0, `form`=0). Las tablas son `<table>` HTML plano.
- **Sin animaciones de entrada**: 0 módulos con clases `et_pb_animation_*`
  (ni siquiera los `_off` del monitor). Clon estático fiel, sin discusión.
- Lo único vivo: **Divi sticky elements** (`sticky-elements.js`) sobre las dos
  columnas de anclas, y el scrollspy del tema. Ver BEHAVIORS §3–§5.

## Layout global

- Scroll nativo, sin contenedores anidados ni scroll-snap.
- **Header**: mismo template TB compartido (`HeaderNav`) sobre una franja de
  cabecera con foto. **Sin hero a pantalla completa**: el contenido arranca en
  blanco justo bajo el header, igual que /monitor-calidad-aire.
- **Footer**: TB de 3 secciones — `footer-links` + `footer-legal` +
  **`footer-background`** (franja `cabecera-puerto-1.jpg`, **41 px** desktop /
  **40 px** móvil). Es decir: **`<Footer template="tb" />`**, la variante que
  se acaba de cerrar en P1. Medido aquí: footer **681 px** a 1440.
- **Scroll-to-top** compartido (`ScrollToTop`).
- Marca de agua **`recurso-k-fondo.svg`** en las secciones 1 y 3 (`background`
  de sección, `auto 0% 50%` y `auto 0% 0%`). Secciones 0 y 2 sin fondo.
- Adorno **`punteado.svg`** (60×22) en `position:absolute`, 6 apariciones,
  ~40 px por encima del módulo al que acompaña (hero, "Información sobre el
  producto", cada columna de anclas, artículos y FAQ).
- Rejilla Divi: fila **1152 px** a 1440 (80 %), columnas del catálogo
  **1/4 (240) + 3/4 (848)**, gutter 5.5 %. Coincide con la retícula 80 %/1380
  ya aplicada en /monitor-calidad-aire.

## Mapa de secciones (`#main-content > article > .et_pb_section_*`)

Coordenadas a **1440 px**.

| # | idx CSS | Nombre operativo | Top | Alto | Reutiliza / Nuevo | Contenido |
|---|---------|------------------|----:|-----:|-------------------|-----------|
| 0 | `et_pb_section_0` | **Breadcrumb** | 225 | 50 | ♻️ patrón del monitor | `ol.kunak-breadcrumbs`: Inicio / Productos / **Accesorios** (el último sin enlace). |
| 1 | `et_pb_section_1` | **Hero + intro + CATÁLOGO** | 275 | 7676 | 🆕 núcleo (5 filas) | Ver desglose abajo. Fondo watermark K. |
| 2 | `et_pb_section_2` | **Artículos y Guías** | 7951 | 861 | ♻️ **UltimosArticulos** (variante `monitor`) | 3 tarjetas de post + CTA azul "Amplia tus conocimientos con nuestras guías" → `/es/recursos/guias/`. **Sin watermark** (bg `none`) — exactamente la variante `monitor` ya construida. |
| 3 | `et_pb_section_3` | **Preguntas frecuentes** | 8812 | 1434 | ♻️ **FaqAcordeon** sin cambios | `kunak-faqs-accordion` con **19 toggles**, **idénticos 19/19** (mismo texto y mismo orden) a `FAQ_ITEMS` de `src/lib/monitor.ts`. Fondo watermark K. |
| F | TB footer | **Footer** | 10225 | 681 | ♻️ **Footer `template="tb"`** | links + legal + franja `footer-background` 41 px. |

### Desglose de la sección 1

| Fila | Clase | Top | Alto | Estructura | Contenido |
|------|-------|----:|-----:|-----------|-----------|
| 1 | `et_pb_row_1` | 333 | 438 | cols **3/5 + 2/5** | **Hero**. Izq: punteado + kicker `<p>` **"Accesorios" a 50px/60 fw800** + `<h1>` de **23px/23 fw300** ("Accesorios para sensores de calidad del aire, más datos para decidir mejor") — ojo, el `<p>` es el titular visual y el H1 va debajo en pequeño; luego `<h2>` **44px/55 fw300** "¿Quieres obtener el máximo rendimiento de tu red de monitorización?" y **CTA azul** "Conoce cómo es el aire que respiras" → `/es/contacto/`. Der: imagen `kunak-air-accessories.jpg` (1000×1000 → 423 px). |
| 2 | `et_pb_row_2` | 547 | 313 | col 4/4 | punteado + `<h2>` 44px **"Información sobre el producto"**. |
| 3 | `et_pb_row_3` | 860 | 360 | cols **1/2 + 1/2** | Intro a dos columnas: izq 3 `<p>`; der 1 `<p>` + `<ul>` de 2 ítems ("Información meteorológica y atmosférica…", "Independencia energética…"). |
| 4 | `et_pb_row_4` `et_pb_row_1-4_3-4` | 1284 | 1476 | **1/4 sticky + 3/4** | **Categoría 1 — "Opciones de alimentación"**. Izq: punteado + `<h2>` 32px + caja de anclas (3 ítems). Der: `<p>` de entradilla (2 párrafos sobre la batería de litio) + **3 fichas**. |
| 5 | `et_pb_row_5` `et_pb_row_1-4_3-4` | 2824 | 5126 | **1/4 sticky + 3/4** | **Categoría 2 — "Sondas adicionales"**. Izq: punteado + `<h2>` 32px + caja de anclas (8 ítems). Der: **8 fichas** (sin entradilla). |

## Anatomía de la ficha de accesorio (el "Card")

Markup del original, idéntico en las 11 fichas:

```html
<div id="{slug}" class="accesorio-container">
  <img class="attachment-post-thumbnail wp-post-image" width="300" height="300" src="…">
  <div class="accesorio-content">
    <h3 class="accesorio-title">{título}</h3>
    <div class="accesorio-txt">{descripción rich-text}<table>…</table></div>
  </div>
</div>
```

Geometría y estilo medidos (1440):

- **Contenedor**: `display:block`, `margin: 32px 0 48px`, ancho de columna 848.
  Sin borde ni fondo — las fichas se separan solo por aire.
- **Imagen**: `float: inline-end` (derecha) con **`margin-top: -32px`**, render
  **260×244** sea cual sea el natural (300/500/800/1000/1024 px). El texto
  **fluye alrededor** de ella. No es una tarjeta con imagen arriba.
- **Título** `.accesorio-title`: `<h3>` **32px/32 fw300 #333**, `padding-left: 10px`.
- **Texto** `.accesorio-txt`: **18px/30.6 #333**. Contenido **rich-text
  heterogéneo**: a veces `<p>`, a veces **nodo de texto suelto** (6 de 11), una
  ficha con `<ul>` (Anemómetro ultrasónico) y una con **imagen extra**
  (Gashood, `gashood-air-pro-lite.jpg` 1500×500 → 848×283, `float:none`).
- **Tabla**: `border: 1px solid #333`, `border-collapse: collapse`, ancho 848.
  **Dos formas** (ver §Modelo de datos).

### Caja de anclas (columna 1/4) — ♻️ ya existe en el clon

**Es el mismo componente** que la sub-nav de /monitor-calidad-aire (ver
PENDIENTES-QA, "Sub-nav anclas"), valores idénticos:

| Propiedad | Valor medido |
|---|---|
| Caja `.menu-anclas` | `border: 1px solid #333`, `radius: 10px`, `padding: 17px 17px 0`, `margin-bottom: 27.2px`, ancho 240 |
| `ul` / `li` | `ul` padding-bottom **17**; `li` padding-bottom **10**, sin viñeta |
| `a` | **17px/26 fw800**, `display:block`, `padding: 2px 30px 2px 0` |
| Flecha | **background** del propio `a`: `ico-arrow.svg`, `30px 30px`, `100% 0%`, no-repeat (no es `::after`) |
| Color base | **#bbb** |
| Color `.activo` | **#0075C9** (mismo peso 800 — solo cambia el color) |

## Modelo de datos para el CMS (`src/lib/accesorios.ts`)

**11 accesorios en 2 categorías.** Campos por ficha:

| Campo | Tipo | Notas |
|---|---|---|
| `slug` | `string` | `id` del `div` = destino del ancla (`#panel-solar`). |
| `navLabel` | `string` | Texto en la caja de anclas. **Difiere del título en 4 de 11** — no derivar uno del otro. |
| `title` | `string` | `<h3>` de la ficha. |
| `image` | `{src, width, height}` | Render fijo 260×244; natural variable. |
| `description` | rich text | Párrafos; ver `bullets` y `extraImage`. |
| `bullets?` | `string[]` | Solo Anemómetro ultrasónico (3 ítems). |
| `extraImage?` | `{src,…}` | Solo Gashood (848×283 bajo el texto). |
| `specs` | unión discriminada | `matrix` \| `pairs` \| `null`. |

**Discrepancias `navLabel` ≠ `title`** (verbatim, incluida la errata del original):

| slug | navLabel | title |
|---|---|---|
| `cargador-para-exteriores` | Cargador para exteriores | Cargador**es** para exteriores |
| `anemometro-mecanico` | Anemómetro mecánico | Anemómetro **M**ecánico |
| `anemometro-ultrasonico` | Anemómetro ultrasónico | **Anenómetro** Ultrasónico *(sic, errata del original)* |
| `sensor-ultravioleta-a` | **Sensor de radiación** | Sensor Ultravioleta-A |

**Las dos formas de tabla:**

- **`matrix`** (3 fichas de alimentación): 4 columnas, primera fila de
  cabecera hecha con `<td><strong>`, celdas **centradas**, `padding: 6px 24px`,
  anchos por `style="width:%"` inline. Panel solar añade una **fila nota con
  `colspan=4`**, texto **10px alineado a la derecha**.
- **`pairs`** (7 fichas de sondas): 2 columnas `<th>` + `<td>`, **alineadas a
  la izquierda**, `<th>` fw700, `padding: 9px 24px`. Entre 6 y 8 filas.
- **`null`**: Gashood (sin tabla; lleva la imagen extra en su lugar).

### Inventario completo

**Categoría 1 — "Opciones de alimentación"** (fila 4, entradilla de 2 párrafos):

| # | slug | title | specs | filas |
|---|---|---|---|---|
| 1 | `panel-solar` | Panel solar | matrix (Potencia/Dimensiones/Peso/Notas de instalación) | 3 + nota |
| 2 | `cargador-para-exteriores` | Cargadores para exteriores | matrix (Dimensiones/Peso/V entrada/V salida) | 1 |
| 3 | `cargador-para-interiores` | Cargador para interiores | matrix (ídem) | 1 |

**Categoría 2 — "Sondas adicionales"** (fila 5, sin entradilla):

| # | slug | title | specs | filas |
|---|---|---|---|---|
| 4 | `anemometro-mecanico` | Anemómetro Mecánico | pairs | 8 |
| 5 | `anemometro-ultrasonico` | Anenómetro Ultrasónico | pairs | 8 (+`bullets` ×3) |
| 6 | `pluviometro` | Pluviómetro | pairs | 6 |
| 7 | `sonometro` | Sonómetro | pairs | 6 |
| 8 | `piranometro` | Piranómetro | pairs | 7 |
| 9 | `sensor-ultravioleta-a` | Sensor Ultravioleta-A | pairs | 7 |
| 10 | `termometro-de-globo-y-de-bulbo-humedo-wbgt` | Termómetro de globo y de bulbo húmedo (WBGT) | pairs | 7 |
| 11 | `gashood` | Micro-cámara de calibración (Gashood) | **null** | — (+`extraImage`) |

### Relación con `src/lib/monitor.ts` — ojo al construir

Los **slugs coinciden exactamente** con los ya presentes en el clon:
`POWER_PACKS` (3/3) y `METEO_SENSORS` (6, subconjunto de estas 8 — le faltan
`sonometro` y `gashood`). Además **los `href` del monitor ya apuntan aquí**
(`${ACC}#panel-solar`, etc.): al construir esta página esos enlaces dejan de
ser externos y pasan a resolver dentro del clon.

**Pero el contenido NO es el mismo y no debe fusionarse a ciegas**: el monitor
usa una entradilla comercial más corta y una variante `-300x300` de la imagen,
mientras que aquí va la descripción larga + tabla. Son dos campos distintos del
mismo producto en el CMS. Recomendación: `accesorios.ts` como dataset propio y
canónico del catálogo, compartiendo **solo el vocabulario de slugs** para que
los enlaces cruzados resuelvan; dejar `monitor.ts` intacto.

## Diferencias móvil (390 real)

- **La caja de anclas desaparece**: `.menu-anclas` → `display: none` (misma
  regla ≤980 del monitor). Como aquí la columna **no tiene CTAs** debajo (el
  monitor sí tenía 3), no queda barra sticky: la columna 1/4 se reduce al
  `<h2>` de categoría (98 px / 54 px) y el catálogo queda como **lista lineal**
  bajo dos titulares. **No hay navegación de catálogo en móvil.**
- Filas 1-4/3-4 apiladas; todas las columnas a **312 px**.
- La ficha mantiene la imagen **flotada a la derecha a 260 px** dentro de 312 →
  al título le quedan ~52 px de hueco.
- **Dos defectos reales del original a 390** (ver BEHAVIORS §8): el `<h3>` se
  parte letra a letra ("Pa/nel/sol/ar") y las **tablas `matrix` (472/432 px)
  se recortan** contra `.et-boc { overflow-x: hidden }` sin scroll horizontal
  → la 4ª columna ("Notas de instalación") es **inalcanzable**.
- Tablas `pairs`: caben a 312 px sin recorte (`padding` de celda 9/24).
- Alturas móvil: sec0 137/50 · sec1 187/**14 558** · sec2 14 745/1546 ·
  sec3 16 291/2021 · footer **2053** (franja 40).

## Rotación de contenido (no re-investigar)

Los **3 posts de "Artículos y Guías" cambian entre cargas** (mismo sorteo
documentado en el pendiente P4 del monitor). En este recon salieron dos ternas
distintas en dos pases seguidos. Congelar un set en `src/lib/` como se hizo
allí; no es comparable px a px.

## Assets clave

| Asset | Uso |
|---|---|
| `2023/03/kunak-air-accessories.jpg` (1000²) | Imagen del hero |
| `2022/12/punteado.svg` (60×22) | Adorno, 6 usos |
| `2022/12/recurso-k-fondo.svg` | Watermark de secciones 1 y 3 |
| `themes/KunakAir/assets/images/ico-arrow.svg` | Flecha de los ítems de ancla (30×30) — ya en el clon |
| `2022/12/cabecera-puerto-1.jpg` | Franja `footer-background` — ya en el clon |
| 11 thumbnails de ficha | `kunak_IMG_0017-300x300-2`, `kunak_IMG_0015-300x300-1`, `kunak-air-indoor-charger`, `kunak_IMG_0047-copia-300x300-1`, `kunak_IMG_0061-copia-300X300`, `rain-gauge`, `2023/01/Sound-level-meter`, `pyranometer`, `apogee-su-202-ultraviolet-A-sensor`, `WBGT-300x300-1`, `2024/07/gashood-air-pro` |
| `2024/07/gashood-air-pro-lite.jpg` (1500×500) | Imagen extra de la ficha Gashood |

## Mapa de reutilización (resumen para Fase 2)

| Parte | Veredicto |
|---|---|
| HeaderNav · Footer (`template="tb"`) · ScrollToTop | ♻️ **tal cual** |
| FaqAcordeon + `FAQ_ITEMS` | ♻️ **tal cual** (19/19 idénticas) |
| UltimosArticulos variante `monitor` | ♻️ **tal cual** (sin watermark, mismo CTA azul) |
| Breadcrumb | ♻️ patrón del monitor, 3 migas |
| `BlueButton` / `SectionRow` (fila 80 %, cols 1/4+3/4) | ♻️ fundación existente |
| Caja de anclas + scrollspy sticky | ♻️ **patrón del monitor**, mismos valores — extraer a componente compartido y usarlo **dos veces** |
| `AccesorioCard` (img flotada + título + rich text + tabla) | 🆕 **nuevo** |
| `SpecTable` (`matrix` \| `pairs`) | 🆕 **nuevo** |
| `src/lib/accesorios.ts` (11 fichas × 2 categorías) | 🆕 **nuevo** |
