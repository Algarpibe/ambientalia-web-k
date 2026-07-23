# CTA Newsletter "aviones de papel" Specification (`et_pb_section_8`)

## Overview
- **Target file:** `src/components/CtaNewsletter.tsx`
- **Screenshot:** `docs/design-references/cta-newsletter.jpg`
- **Interaction model:** estático (los aviones de papel son un único SVG de fondo, sin animación). Único interactivo: botón "¡Me apunto!".

## DOM Structure
```
section.et_pb_section_8 (fullwidth, bg blanco, padding 0, alto ~408px)
└─ .et_pb_fullwidth_code_1
   └─ .calls.one-column        ← todo el estilo vive aquí
      └─ .calls-content
         └─ .calls-content-inner
            ├─ p.calls-title      "Innovación en calidad del aire a 1 clic"
            ├─ .calls-text        (2 <p>)
            └─ .calls-buttons > span.et_pb_button.calls-button  (enlace ofuscado)
```

## Computed Styles (exact)

### `.calls` (contenedor fullwidth)
- `background: url(banner-suscripcion.svg)` — asset: `public/images/uploads/2024/11/banner-suscripcion.svg` (ilustración aviones de papel + trayectorias punteadas).
- `background-size: cover; background-position: 0% 0%`.
- **`background-color: rgba(0, 0, 0, 0.45)` + `background-blend-mode: multiply`** → esto produce el gris oscuro sobre el SVG claro. Clave para la fidelidad.
- Dentro de fullwidth section: `padding: 0` (la regla base `.calls {padding:40px 60px; margin-bottom:3.735%}` queda anulada por `.et_pb_fullwidth_section .calls {padding:0}`; el margin-bottom NO aplica visualmente relevante aquí).
- color texto: #fff.

### `.calls-content`
- `margin: 0 6%` (computed 0 84.53px a 1424px); `padding: 5% 0` (computed 70.44px 0).

### `.calls-content-inner` y `.calls-buttons`
- `max-width: 1380px; margin: 0 auto`.
- ≥981px: `padding-inline-end: 31% !important` (computed 384px) → el texto ocupa ~2/3 izquierdos, los aviones de la derecha quedan despejados.

### `p.calls-title`
- fontSize **45px** (regla fullwidth; base 37px); lineHeight 1.4em (63px); fontWeight 400; color #fff; padding-bottom 10px.

### `.calls-text p`
- fontSize 18px; lineHeight 30.6px (1.7em); color #fff; `.calls-text` padding-bottom 30px.

### Botón "¡Me apunto!" (`.calls-button`)
- Pill outline blanco: fontSize 15px/700; color #fff; border 1px solid #fff; borderRadius 30px; padding 7.5px 40.5px 9px 22.5px; `background-color: rgba(0,0,0,0.15)`.
- Flecha → siempre visible, blanca (`.calls-button:after` color #fff, tamaño 20px).
- En el original es un `<span role="link" tabindex="0">` con URL ofuscada en base64 (`data-url` → decodifica a `https://kunakair.com/es/suscribete/`). **En el clon: `<a href="/es/suscribete/">` normal.**

## States & Behaviors

### Hover del botón
- **Estado A:** border #fff, bg rgba(0,0,0,0.15), color #fff.
- **Estado B (hover):** `border-color: #7F8798 (var(--gris)); background-color: #7F8798; color: #fff` + patrón Divi: padding-inline-end crece (2.7em→3.7em) y la flecha se desplaza (margin-inline-start 0.25em→0.8em).
- **Transición:** 0.2s (Divi `et_pb_button` transition all .2s).
- Implementación: variante del `OutlineButton` existente con colores blancos (o prop `variant="onDark"`).

## Text Content (verbatim)
- Título: "Innovación en calidad del aire a 1 clic"
- P1: "¡Mantente informado sobre el aire que respiras!"
- P2: "Suscríbete a nuestra newsletter para recibir las últimas novedades en tecnología de monitorización ambiental, estudios sobre calidad del aire y más."
- Botón: "¡Me apunto!" → `/es/suscribete/`

## Assets
- `public/images/uploads/2024/11/banner-suscripcion.svg` — ya descargado.

## Responsive Behavior
- **≥981px:** texto con padding-inline-end 31%; título 45px.
- **<981px:** sin el padding derecho (texto a ancho completo dentro del 6% de margen).
- **<767px (base `.calls`):** título 37px (la regla de 45px es del contexto fullwidth — verificar en QA si en móvil Divi mantiene 45px; el CSS base dice 37px y no hay MQ móvil específica para calls-title).
- El SVG de fondo sigue cover anclado arriba-izquierda en todos los tamaños.
