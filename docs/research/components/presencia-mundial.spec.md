# Presencia mundial + mapa Specification (dentro de `et_pb_section_7`, row 6)

## Overview
- **Target file:** `src/components/PresenciaMundial.tsx`
- **Screenshot:** `docs/design-references/presencia-mundial.jpg`
- **Interaction model:** estático. El mapa es **una única imagen SVG** (`world.svg`) — sin tooltips, sin países interactivos (resuelve BEHAVIORS §11.a).

## DOM Structure
```
.et_pb_row_6 (maxWidth 1380, padding 28.17px 0 70.44px, 2 columnas)
├─ col 1/3 (.et_pb_column_12)
│  ├─ punteado.svg (decoración — patrón SectionRow)
│  ├─ H2 "Presencia mundial"
│  ├─ et_pb_text_24: 2 párrafos
│  └─ BlueButton "¿Cómo podemos ayudarte?" → /es/contacto/
└─ col 2/3 (.et_pb_column_13)
   └─ img world.svg  (mapa mundi con países en azul)
```
→ Usar `SectionRow` (título 1/3 + contenido 2/3) pero aquí el TEXTO también va en la col 1/3 (título+párrafos+botón juntos a la izquierda; el mapa ocupa la 2/3 derecha).

## Computed Styles (exact)

### H2
- 44px/300/#333; lineHeight 55px; letterSpacing −0.5px (= `SectionTitle`).

### Párrafos (col izquierda)
- 18px/400 #333; lineHeight 30.6px (1.7em); separación estándar entre párrafos (~1em).

### Botón
- `BlueButton` (boton-azul): bg/border #0075C9, texto blanco 15px/700, pill 30px, flecha →; hover bg/border #7F8798. Margen superior ~2rem respecto al texto (ver screenshot).

### Mapa (`img world.svg`)
- Computed **785.6 × 404.6px** (ancho completo de la col 2/3); `max-width: 100%`, altura auto.
- Sin sombra, sin borde. Países activos en **#4A77BC/azul** (el azul lo trae el propio SVG), resto gris claro.

## States & Behaviors
- N/A (estático). Hover del botón = patrón BlueButton estándar. Reveal on-view Divi genérico.

## Text Content (verbatim)
- H2: "Presencia mundial"
- P1: "Las estaciones Kunak AIR han sido probadas en las condiciones más adversas en más de 80 países por los 5 continentes. Desde los países nórdicos con temperaturas de -30ºC hasta Oriente Medio a +50ºC."
- P2: "Nuestra avanzada tecnología hace que nuestras soluciones sean válidas para ambientes con condiciones de extrema temperatura y humedad como las zonas tropicales o zonas gélidas como la Antártida."
- Botón: "¿Cómo podemos ayudarte?" → `/es/contacto/`

## Assets
- `public/images/uploads/2023/03/world.svg` — ya descargado.
- `public/images/uploads/2022/12/punteado.svg`.

## Responsive Behavior
- **≥981px:** 1/3 (texto) + 2/3 (mapa) lado a lado.
- **≤980px:** columnas apiladas — texto y botón arriba, mapa debajo a ancho completo (patrón Divi).
- **≤767px:** igual, todo apilado; el mapa escala a 100% del ancho.
