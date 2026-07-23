# CTA "¿Estás inmerso en un proyecto…?" Specification (`et_pb_section_6`)

## Overview
- **Target file:** `src/components/CtaInmerso.tsx`
- **Screenshot:** `docs/design-references/cta-inmerso.jpg`
- **Interaction model:** estático. Igual que la sección 11: `et_pb_fullwidth_slider` de Divi con **1 solo slide**, sin flechas/dots/autoplay. Clonar como banner estático. **Gemelo estructural de `cta-preocupa.spec.md`** — considerar un componente compartido `CtaBanner` con props (imagen, título, botón).

## DOM Structure
```
section.et_pb_section_6 (fullwidth)
└─ .et_pb_fullwidth_slider_0.et_pb_slider.et_pb_bg_layout_dark
   └─ .et_pb_slides > .et_pb_slide_0   ← bg imagen + overlay
      └─ .et_pb_container > .et_pb_slider_container_inner > .et_pb_slide_description
         ├─ h2
         └─ a.et_pb_button.et_pb_more_button "Podemos ayudarte"
```

## Computed Styles (exact)

### Slide (`.et_pb_slide_0`)
- `background-image: url(people-city-urban.jpg)` → `public/images/uploads/2023/02/people-city-urban.jpg` (peatones caminando por ciudad).
- `background-size: cover; background-position: 50% 50%`.
- **`background-color: rgba(0, 0, 0, 0.33)` + `background-blend-mode: multiply`**.
- `padding: 0 84.53px` (0 6%); altura resultante ~**398px** (3 líneas de título).

### `.et_pb_slide_description`
- `padding: 74.39px 0 74.39px 607.56px` (padding-left ≈ 49% → contenido en mitad derecha); `text-align: left`.

### H2
- fontSize **45px**; fontWeight **300**; color #fff; lineHeight 1.3em (58.5px); letterSpacing −0.5px. Tres líneas a 1440.

### Botón "Podemos ayudarte"
- Pill outline blanco: 15px/700; color #fff; border 1px solid #fff; borderRadius 30px; padding 7.5px 40.5px 9px 22.5px; `background-color: rgba(0,0,0,0.15)`.
- href: **`/es/contacto/`**.
- Flecha → visible.

## States & Behaviors
- **Hover botón:** border/bg → `#7F8798` (var(--gris)); flecha se desplaza (margin-inline-start 0.25em→0.8em) y padding-inline-end 2.7em→3.7em; transition 0.2s. (La flecha permanece blanca — regla `.et_pb_slider.et_pb_bg_layout_dark`.)
- Sin más interacción.

## Text Content (verbatim)
- H2: "¿Estás inmerso en un proyecto de calidad del aire y necesitas información fiable?"
- Botón: "Podemos ayudarte" → `/es/contacto/`

## Assets
- `public/images/uploads/2023/02/people-city-urban.jpg` — ya descargado.

## Responsive Behavior
- **≥981px:** contenido en mitad derecha (padding-inline-start ~49%).
- **<981px:** description a ancho completo (paddings laterales 6%), altura crece con el texto (patrón slider Divi por defecto).
- Fondo cover centrado en todos los tamaños.
