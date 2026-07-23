# Nuestros productos (tabs) Specification (dentro de `et_pb_section_7`, rows 10–11)

## Overview
- **Target file:** `src/components/ProductosTabs.tsx`
- **Screenshots:** `docs/design-references/productos-tabs-air-pro.jpg` (estado inicial), `docs/design-references/productos-tabs-cartuchos-hover.jpg` (tras hover en otro item)
- **Interaction model:** **HOVER-driven** (¡NO click!). Verificado en `KunakAir/assets/js/init.js`: `$("#lista-soluciones li span").on("mouseenter", toggleActiveClasses)`. En desktop, pasar el ratón por un item de la lista izquierda activa su panel. En móvil (<768px, body sin clase `min-768`) funciona como **acordeón táctil**: el tap dispara mouseenter; si el item ya está activo se cierra todo; al abrir, hace scroll animado (`slow`) hasta el item (offset −5px).
- **RESUELTO punto abierto de BEHAVIORS §11.f:** son **5 items**, no 4 (el reconocimiento inicial no vio "Cartuchos inteligentes"). El cambio de panel es **instantáneo** (display none→flex, sin transición).

## DOM Structure
```
Row 10 (.et_pb_row_10, maxWidth 1380, col 4/4)
├─ .et_pb_text_31 > H2 "Nuestros productos"
└─ .et_pb_text_32 > #lista-soluciones.lista-contenido.kunak-shortcode  (overflow:hidden, width 100%)
   ├─ .lista-contenido-ul            (float:inline-start; width 30%; min-width 250px @≥1080)
   │  └─ ul (list none, padding 0, li margin-bottom 10px)
   │     └─ li ×5
   │        ├─ span[data-id]                 ← etiqueta clicable/hoverable
   │        │  ├─ (texto) "AIR Pro"
   │        │  └─ strong.subtitulo-producto  "Monitor de calidad de aire…"
   │        └─ .lista-contenido-item[data-id="item-…"]  ← SOLO se muestra en móvil (acordeón)
   └─ .lista-contenido-content       (float:inline-end; width 63%)  ← clones de los 5 items; visible el .item-activo (desktop)
Row 11: botón azul "Cuéntanos tus necesidades" (BlueButton)
```
Nota de implementación React: no hacen falta clones — renderizar la lista y un único panel controlado por estado, y en móvil renderizar el panel dentro de cada item (acordeón).

## Computed Styles (getComputedStyle, desktop 1440)

### H2 "Nuestros productos"
- fontSize 44px; fontWeight 300; color #333; lineHeight 55px; letterSpacing −0.5px; padding-bottom 10px → usar `SectionTitle`.

### Etiqueta de tab (`span[data-id]`)
- display block; fontSize **30px**; fontWeight 700; lineHeight 1.1; padding `5px 50px 5px 0`; cursor pointer.
- Icono +/−: `background: url(ico-plus-negro.svg) no-repeat right 5px; background-size: 28px 28px` (assets en `public/images/theme/`).
- **Inactivo:** color #333 con **`opacity: 0.3`** (así se ve gris — no es color gris).
- **Hover (inactivo):** `opacity: 1; transition: opacity .3s`.
- **Activo (`.li-activo`):** `color: #0075C9 (var(--azul)); opacity: 1; background-image: url(ico-minus-azul.svg)`.
- Subtítulo `strong.subtitulo-producto`: display block; fontSize 16px; fontWeight 400; hereda color/opacity del span.

### Panel activo (`.lista-contenido-item.item-activo`)
- Base: `display:none; opacity:0; visibility:hidden`. Activo: `display:flex; flex-direction:column; opacity:1; visibility:visible` (row a partir de ≥576px). Sin transición → cambio instantáneo.
- ≥768px: `border: 1px solid #777; border-radius: 10px; padding: 30px; margin-bottom: 2rem` (computed margin `0 0 32px`).
- `.lista-contenido-item-imagen`: width 50% (≥576). `img`: max-width 100%.
- `.lista-contenido-item-txt`: width 50% (≥576).
- `h3.lista-contenido-item-title`: fontSize 20px !important; fontWeight 700; lineHeight 1.5em. **`display:none` en <576px** (el label del acordeón ya lo muestra).
- Párrafos: 18px/400 #333, lineHeight 26px.
- Bullets: `ul` list none, padding `0 0 18px 36px`, lineHeight 27px; cada `li::before` content "•" color **#0075C9** fontSize 22.4px (bullet azul).
- "Ventajas": `strong` 18px/700.
- CTA "Ver más": OutlineButton — fontSize 15px/700; color #333; border 1px solid #333; borderRadius 30px; padding 7.5px 40.5px 9px 22.5px; flecha → visible; hover Divi (padding-inline-end crece a 3.7em, flecha se desplaza, color flecha azul).

### CTA inferior (Row 11)
- `BlueButton` "Cuéntanos tus necesidades" → `/es/contacto/`. boton-azul: bg #0075C9, border #0075C9, texto blanco; hover bg/border `#7F8798` (var(--gris)).

## States & Behaviors

### Cambio de producto (desktop ≥768)
- **Trigger:** `mouseenter` sobre `span[data-id]` de la lista izquierda.
- **Efecto:** quita `li-activo`/`item-activo` de todos; añade al hovered y a su panel. Cambio **instantáneo** (sin fade/slide).
- **Estado inicial:** AIR Pro activo.

### Acordeón (móvil <768)
- `.lista-contenido-content` (panel derecho) → `display:none !important`.
- El `.lista-contenido-item` DENTRO de cada `li` se muestra cuando está activo.
- Tap en item activo → se cierra todo (ningún item activo). Tap en item inactivo → se activa + scroll suave hasta el item.
- `li` con `border-bottom: 1px solid #999; padding-bottom: 10px` (último sin borde).

## Per-State Content (verbatim)

| # | data-id | Label | Subtítulo | Imagen (`public/images/uploads/…`) |
|---|---------|-------|-----------|-------------------------------------|
| 1 | monitor-calidad-aire | AIR Pro | Monitor de calidad de aire para profesionales | `2022/12/Kunak-AIR-Pro-1024.jpg` |
| 2 | estacion-de-monitoreo-de-calidad-del-aire | AIR Lite | Estación de monitoreo de calidad del aire | `2022/12/Kunak_AIR_Lite-300.jpg` |
| 3 | sensor-de-calidad-del-aire | Cartuchos inteligentes | Sistema plug & play | `2023/01/cartridges-300.jpg` |
| 4 | software-de-medicion-calidad-del-aire | AIR Cloud | Software de calidad del aire | `2023/01/air-cloud.jpg` |
| 5 | kunak-api | Kunak API | Fácil integración de datos | **(sin imagen — panel solo texto)** |

### 1. AIR Pro → `/es/monitor-calidad-aire/`
- Intro: "Estación de monitorización de la calidad del aire para profesionales."
- Claim: "BASADA EN SENSORES | LA MAYOR PRECISIÓN"
- **Ventajas**: Multi-contaminante · Sistema de cartuchos · Totalmente autónomo · Datos en tiempo real · Precisión probada

### 2. AIR Lite → `/es/estacion-de-monitoreo-de-calidad-del-aire/`
- Intro: "Información sobre la calidad del aire calle a calle."
- Claim: "CALIDAD INDUSTRIAL | MÁXIMA PRECISIÓN"
- **Ventajas**: Diseño robusto y compacto · Sistema de cartuchos · Funcionamiento autónomo · Pantalla OLED integrada · Gran relación calidad-precio

### 3. Cartuchos inteligentes → `/es/sensor-de-calidad-del-aire/`
- Intro: "El sistema plug & play para una medición precisa de los principales contaminantes."
- Claim: "BASADO EN SENSORES | SUSTITUCIÓN FÁCIL Y RÁPIDA"
- **Ventajas**: Plug & Play (detección automática) · Calibración y validación individuales · Control y garantía de calidad trazables · Diseño patentado · Sostenible

### 4. AIR Cloud → `/es/software-de-medicion-calidad-del-aire/`
- Intro: "Software profesional de calidad del aire para el análisis de datos."
- Claim: "DATOS EN TIEMPO REAL | ACTUALIZACIONES CONTINUAS"
- **Ventajas**: Seguro y confidencial · Informes de calidad del aire · Visualización y análisis avanzado de datos · Datos fiables garantizados · Integración y envío de datos

### 5. Kunak API → `/es/kunak-api/`
- Intro: "Fácil integración de datos en cualquier sitio web o plataforma de smart city"
- Claim: "DISPONIBILIDAD DE DATOS | COPIAS DE SEGURIDAD AUTOMÁTICAS"
- **Ventajas**: Visualización y gestión de datos · Automatización de procesos · Herramientas personalizadas · Integración de sistemas de terceros · Importación y exportación de datos

Todos los CTAs de panel: texto "Ver más".

## Assets
- `public/images/theme/ico-plus-negro.svg`, `public/images/theme/ico-minus-azul.svg` (28×28) — descargados.
- Imágenes de producto ya en `public/images/uploads/` (ver tabla).
- Iconos alternativos si se prefiere inline: `PlusIcon`/`MinusIcon` de `icons.tsx` (pero los SVG del tema son un círculo fino con +/−; usar los SVG descargados para fidelidad).

## Responsive Behavior
- **≥1080px:** lista izquierda 30% (min 250px), panel derecho 63%.
- **768–1079px:** lista 30% min-width 239px, panel 60% (63% con `#lista-soluciones`).
- **576–767px:** acordeón (content oculto, item dentro del li); item aún flex-row imagen 50% / texto 50%.
- **<576px:** item flex-column (imagen encima del texto, 100%), título h3 oculto, sin border/padding de tarjeta (el borde de tarjeta es regla ≥768).
- Divi: la fila entera colapsa según breakpoints estándar (980/767).
