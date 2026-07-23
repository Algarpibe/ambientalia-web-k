# Últimos artículos Specification (`et_pb_section_9`)

## Overview
- **Target file:** `src/components/UltimosArticulos.tsx`
- **Screenshot:** `docs/design-references/ultimos-articulos.jpg`
- **Interaction model:** estático; hover sobre tarjetas (zoom de imagen, título a azul).

## DOM Structure
```
section.et_pb_section_9  (bg: url(recurso-k-fondo.svg) no-repeat 0% 0%, size auto → forma diagonal
                          gris clarísimo arriba-izquierda; padding-top 56.36px)
└─ .et_pb_row_12 (col 4/4, maxWidth 1380)
   ├─ et_pb_image_13: punteado.svg  (decoración de puntos — igual que otras secciones, usar SectionRow/patrón)
   ├─ et_pb_text_33: H2 "Últimos artículos"   (44px/300/#333, lh 55px, ls −0.5px)
   └─ et_pb_text_34: .et_pb_blog_0_tb_body.bucle-entradas   ← grid de posts
      └─ .et_pb_ajax_pagination_container   (flex wrap; width calc(100% + 35px))
         └─ article.et_pb_post ×3
            ├─ a.entry-featured-image-url > img
            ├─ h3.entry-title > a
            └─ p.post-meta   (fecha)
└─ .et_pb_row_13 (col 1/3 vacía + col 2/3)
   └─ BlueButton "Amplia tus conocimientos con nuestras guías" → /es/recursos/guias/
      (wrapper `et_pb_button_alignment_right` — alineado a la derecha en TODOS los breakpoints)
```

## Computed Styles (exact)

### Grid
- Contenedor: `display:flex; flex-wrap:wrap; width: calc(100% + 35px)` (≥768).
- `article`: `width: calc(33.33% − 35px); margin-inline-end: 35px; margin-bottom: 40px` (≥981). Computed a 1440: width 377px, margin `0 40px 40px 0` (1280+ usa 40px de gutter según regla case-list; para blog la regla es 35px — computed real 40px: usar **40px** a ≥1280).

### Tarjeta — imagen (`a.entry-featured-image-url`)
- `display:flex; align-items:center; position:relative; border-radius:10px; overflow:hidden; aspect-ratio: 4/2.7; background-color:#eee; margin-bottom: 25px`.
- `img`: `min-height:100%; width:auto; min-width:440px; max-width:100%; transition: all .5s`. (Imágenes fuente 1024×683.)

### Tarjeta — título (`h3.entry-title > a`)
- fontSize **20px**; fontWeight 400; lineHeight 1.35em (27px); color #333; sin subrayado.

### Tarjeta — fecha (`p.post-meta`)
- fontSize **13.5px**; color #333; lineHeight 1.55em. Formato: "Jul 21, 2026" (inglés abreviado, tal cual en el original).

### CTA
- `BlueButton` (boton-azul): bg/border #0075C9, texto #fff 15px/700, pill 30px; hover bg/border #7F8798.

## States & Behaviors

### Hover de tarjeta (sobre el enlace de imagen)
- **Trigger:** `:hover` en `a.entry-featured-image-url`.
- **Estado B:** `img { transform: scale(1.1) }`.
- **Transición:** `all .5s`.

### Hover del título
- `entry-title a:hover → color: #0075C9`.

## Per-State Content — Posts (verbatim)

| # | Título | Fecha | href | Imagen (`public/images/uploads/…`) |
|---|--------|-------|------|-------------------------------------|
| 1 | Monitorización de emisiones fugitivas: detección y control de fugas industriales | Jul 21, 2026 | `/es/monitorizacion-de-emisiones-fugitivas/` | `2026/07/Deteccion-temprana-emisiones-fugitivas_Kunak-1024x683.jpg` |
| 2 | Monitorización perimetral en instalaciones industriales: control continuo y detección de emisiones | Jun 25, 2026 | `/es/monitorizacion-perimetral/` | `2026/06/monitorizacion-perimetral_Kunak-1024x683.jpg` |
| 3 | Monitorización near-reference: precisión avanzada en la medición de la calidad del aire | Jun 18, 2026 | `/es/monitorizacion-near-reference/` | `2025/07/aaqms-1024x683.jpg` |

CTA: "Amplia tus conocimientos con nuestras guías" → `/es/recursos/guias/` (sic, "Amplia" sin tilde en el original).

## Assets
- Fondo sección: `public/images/theme/recurso-k-fondo.svg` (ya usado por otras secciones).
- `public/images/uploads/2022/12/punteado.svg`.
- 3 imágenes de post — ya descargadas (rutas arriba; variantes 480/980 disponibles para srcset).

## Responsive Behavior
- **≥981px:** 3 columnas (33.33% − 35px; gutter efectivo 40px a ≥1280).
- **480–980px:** 2 columnas (`calc(50% − 30px)` con gutter 30px; 35px a ≥768).
- **<480px:** 1 columna (article 100%, sin float).
- Botón CTA alineado a la derecha en desktop, tablet y móvil (clases alignment right en los 3).
