# Últimos proyectos Specification (`et_pb_section_10`)

## Overview
- **Target file:** `src/components/UltimosProyectos.tsx`
- **Screenshot:** `docs/design-references/ultimos-proyectos.jpg`
- **Interaction model:** estático; hover sobre tarjetas (zoom de imagen de fondo, links a azul).

## DOM Structure
```
section.et_pb_section_10 (et_section_regular, fondo blanco plano, sin bg-image)
└─ .et_pb_row_14 (col 4/4, maxWidth 1380)
   ├─ et_pb_image_14: punteado.svg
   ├─ et_pb_text_35: H2 "Últimos proyectos"  (44px/300/#333)
   └─ et_pb_text_36: .case-list-content
      └─ article.case-studies ×3  (flex column)
         ├─ .case-imagen-container > a.case-imagen   ← imagen como background-image
         ├─ .case-taxonomies > span.case-sectores > span "Sector:" + a (link sector)
         └─ header
            ├─ .case-cliente   (nombre del cliente, bold)
            └─ h3.case-title > a  (descripción/título del caso)
   └─ OutlineButton "Ver todos los casos de éxito" → /case-studies/
      (wrapper `et_pb_button_alignment_right`)
```

## Computed Styles (exact)

### Grid
- `.case-list-content:after` clearfix. ≥981px: `width: calc(100% + 35px)`; article `width: calc(33.33% − 35px); margin-inline-end: 35px; margin-bottom: 40px; float: inline-start` (≥1280: gutter 40px). Computed a 1440: article 377×?, margin `0 40px 40px 0`.
- `article`: `display:flex; flex-direction:column`.

### Imagen (`.case-imagen-container` + `a.case-imagen`)
- Container: `border-radius: 10px; overflow: hidden; aspect-ratio: 4/2.7`.
- `a.case-imagen`: `display:block; width:100%; height:100%; background-position:center; background-size:cover; background-repeat:no-repeat; transition: all .5s`. (Computed height 254.6px a ancho 377.)

### Taxonomías (`.case-taxonomies`)
- `padding: 5px 0; font-size: 13.5px; line-height: 1.4`.
- `span span` ("Sector:"): `font-weight: 700`, color #333.
- Link de sector: color **#0075C9**, 13.5px/400, sin subrayado.

### Header
- `margin-top: 12px`.
- `.case-cliente`: fontSize **16px**; fontWeight **700**; color #333.
- `h3.case-title`: fontSize **20px** !important; lineHeight 1.35 !important; fontWeight 400 !important; `a` color #333.

### CTA
- `OutlineButton` "Ver todos los casos de éxito" → `/case-studies/` (sic: URL sin `/es`, verbatim del original). 15px/700 #333, border 1px #333, pill 30px, flecha →; hover Divi (flecha azul, padding crece).

## States & Behaviors

### Hover de imagen
- **Trigger:** `:hover`/`:focus` en `a.case-imagen`.
- **Estado B:** `transform: scale(1.1)` (el propio elemento con bg escala; el container lo recorta).
- **Transición:** `all .5s`.

### Hover de links
- Link de sector: `color: #0075C9` (ya azul) con `transition: all .3s` (regla hover repite azul).
- `case-title a:hover → color: #0075C9`.

## Per-State Content — Casos (verbatim)

| # | Sector (label → href) | Cliente (.case-cliente) | Título (.case-title) | href del caso | Imagen bg (`public/images/uploads/…`) |
|---|----------------------|--------------------------|----------------------|----------------|----------------------------------------|
| 1 | EDAR / PTAR → `/es/sector/edar/` | Nama Water Services (NWS) | Monitorización de olores en estaciones depuradoras de aguas residuales en Omán | `/es/casos-de-exito/monitorizacion-de-olores-en-estaciones-depuradoras-de-aguas-residuales-en-oman/` | `2026/05/Odour-monitoring-in-wastewater-treatment-plants-in-Oman-NAMA-Kunak-1-1024x683.jpg` |
| 2 | Olores → `/es/sector/olores/` | Vertedero de Valdemingómez | Control avanzado de olores y gases en el vertedero de Valdemingómez | `/es/casos-de-exito/control-avanzado-de-olores-y-gases-en-el-vertedero-de-valdemingomez/` | `2026/05/Control-avanzado-de-gases-y-olores-en-el-vertedero-de-Valdemingomez-1-1024x683.jpg` |
| 3 | Industria → `/es/sector/industria/` | Virginia Department of Environmental Quality (DEQ) | Monitorización de la calidad del aire en el mayor corredor de centros de datos de EE.UU | `/es/casos-de-exito/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos/` | `2026/05/639130508516830000.jpg` |

Estructura de tarjeta: imagen → "**Sector:** <link azul>" → **Cliente** (bold) → título 20px.

## Assets
- `public/images/uploads/2022/12/punteado.svg`.
- 3 imágenes ya descargadas (rutas arriba).

## Responsive Behavior
- **≥981px:** 3 columnas (33.33% − 35px; 40px a ≥1280).
- **480–980px:** 2 columnas (50% − 30px; 35px a ≥768).
- **<480px:** 1 columna.
- CTA alineado a la derecha (desktop; sin override tablet/phone → Divi hereda right).
