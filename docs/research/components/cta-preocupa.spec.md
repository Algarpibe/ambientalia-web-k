# CTA "¿Te preocupa la calidad del aire que respiras?" Specification (`et_pb_section_11`)

## Overview
- **Target file:** `src/components/CtaPreocupa.tsx`
- **Screenshot:** `docs/design-references/cta-preocupa.jpg`
- **Interaction model:** estático. Técnicamente es un `et_pb_fullwidth_slider` de Divi con **1 solo slide** — sin flechas, sin dots, sin autoplay. Clonar como banner estático.

## DOM Structure
```
section.et_pb_section_11 (fullwidth)
└─ .et_pb_fullwidth_slider_1.et_pb_slider.et_pb_bg_layout_dark
   └─ .et_pb_slides > .et_pb_slide_6   ← bg imagen + overlay
      └─ .et_pb_container > .et_pb_slider_container_inner
         └─ .et_pb_slide_description
            ├─ h2 "¿Te preocupa la calidad del aire que respiras?"
            └─ a.et_pb_button "Sí, quiero saber más"
```

## Computed Styles (exact)

### Slide (`.et_pb_slide_6`)
- `background-image: url(ship-pollution-monitoring-2.jpg)` → `public/images/uploads/2023/02/ship-pollution-monitoring-2.jpg` (buque granelero en el mar visto desde arriba).
- `background-size: cover; background-position: 50% 50%`.
- **`background-color: rgba(0, 0, 0, 0.33)` + `background-blend-mode: multiply`** (oscurece la foto).
- `padding: 0 84.53px` (≈ 0 6%).
- Altura resultante ~**340px** (dada por el padding vertical de la description, no fija).

### `.et_pb_slide_description`
- `padding: 74.39px 0 74.39px 607.56px` → padding-left ≈ **49%** del slide: todo el contenido vive en la mitad derecha, alineado a la izquierda dentro de esa mitad (arranca ~centro del viewport).
- `text-align: left`.

### H2
- fontSize **45px**; fontWeight **300**; color #fff; lineHeight 1.3em (58.5px); letterSpacing −0.5px; (dos líneas a 1440).

### Botón "Sí, quiero saber más"
- Pill outline blanco (mismo patrón que newsletter): 15px/700; color #fff; border 1px solid #fff; borderRadius 30px; padding 7.5px 40.5px 9px 22.5px; `background-color: rgba(0,0,0,0.15)` (regla `.et_pb_slider.et_pb_bg_layout_dark .et_pb_button`).
- href verbatim: **`/contact`** (así en el original — sin `/es`; mantener o normalizar en ensamblaje, anotar en QA).
- Flecha → visible; hover: bg/border → #7F8798 + desplazamiento de flecha (patrón Divi 0.2s).
- Margen sobre el botón: el h2 lleva padding-bottom estándar (≈10px) + separación visual ~2rem (ver screenshot).

## States & Behaviors
- **Hover botón:** border/bg `#7F8798`, flecha se desplaza a la derecha (margin-inline-start 0.25em→0.8em), padding-inline-end 2.7em→3.7em; transition 0.2s.
- Sin más interacción (slider de 1 slide, sin controles).

## Text Content (verbatim)
- H2: "¿Te preocupa la calidad del aire que respiras?"
- Botón: "Sí, quiero saber más" → `/contact`

## Assets
- `public/images/uploads/2023/02/ship-pollution-monitoring-2.jpg` — ya descargado.

## Responsive Behavior
- **Desktop (≥981):** texto en mitad derecha (padding-inline-start ~49%).
- **<981 (Divi slider estándar):** la description pierde el padding custom → texto centrado a ancho casi completo con paddings laterales 6%; altura crece con el texto. (Patrón Divi por defecto: `.et_pb_slide_description` width 100%.)
- Fondo siempre cover centrado.
