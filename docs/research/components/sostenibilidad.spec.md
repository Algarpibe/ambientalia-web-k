# Comprometidos con la sostenibilidad Specification (`et_pb_section_12`)

## Overview
- **Target file:** `src/components/Sostenibilidad.tsx`
- **Screenshot:** `docs/design-references/sostenibilidad.jpg`
- **Interaction model:** estático (sin hovers relevantes, sin animaciones propias más allá del reveal on-view Divi).

## DOM Structure
```
section.et_pb_section_12 (fondo blanco, padding 56.36px 0 59px)
└─ .et_pb_row_15 (maxWidth 1380, padding 20px 0 70.44px)
   ├─ col 1/3
   │  ├─ punteado.svg (decoración)
   │  └─ H2 "Comprometidos con la sostenibilidad"
   └─ col 2/3 (width ~786px)
      ├─ et_pb_text_38: 2 párrafos
      └─ 3 × et_pb_blurb (inline-block, centrados)
         ├─ .et_pb_main_blurb_image > img (SVG 50px)
         └─ .et_pb_blurb_description > p (con <strong>)
```
→ Usar el patrón `SectionRow` + `SectionTitle` existente.

## Computed Styles (exact)

### H2
- 44px/300/#333, lineHeight 55px, letterSpacing −0.5px (= `SectionTitle`).

### Párrafos (col derecha)
- fontSize 18px; lineHeight 30.6px (1.7em); color #333. Separación estándar entre párrafos (~1em padding-bottom Divi).

### Blurbs (×3)
- `display: inline-block; width: ~33% (computed 235.67px sobre col de 786px); margin: 0 23.56px 33.31px 0; padding: 0 39.27px; text-align: center`.
  - Equivalente limpio: grid de 3 columnas con gap ~24px y padding interno horizontal ~40px por celda.
- Imagen: wrapper `margin-bottom: 30px`, centrado; `img` width **50px** (SVG).
- Descripción: fontSize **16px**; lineHeight **21.92px** (1.37em); color #333; text-align center; `<strong>` en peso 700.

## States & Behaviors
- N/A (estático). Reveal on-view Divi de bajo impacto — reproducir el fade-up genérico si el resto de secciones ya lo hace.

## Text Content (verbatim)

- P1: "Las estaciones de monitorización de la calidad del aire de Kunak son los sistemas de monitorización ambiental más sostenibles del mercado."
- P2: "En su fabricación, cuidamos al detalle:"

### Blurbs (HTML con strong)
1. icono `ecology.svg` — "el **ecodiseño** con sistemas que facilitan la reutilización y reparación de los equipos;"
2. icono `waste-reduction.svg` — "la **reducción de residuos** a través de la implementación de estrategias de economía circular, y"
3. icono `energy-efficiency.svg` — "la **eficiencia energética** con el uso de soluciones que aprovechan la energía solar."

## Assets (ya descargados)
- `public/images/uploads/2023/02/ecology.svg` (planeta con hojas)
- `public/images/uploads/2023/02/waste-reduction.svg` (papelera con planta)
- `public/images/uploads/2023/02/energy-efficiency.svg` (panel solar y sol)
- `public/images/uploads/2022/12/punteado.svg`

## Responsive Behavior
- **Desktop:** fila 1/3 (título) + 2/3 (texto + 3 blurbs en línea).
- **≤980px:** columnas de la fila se apilan (título arriba, contenido debajo) — patrón Divi.
- **≤767px:** los 3 blurbs se apilan en columna (inline-block cae a 100% por regla Divi de blurbs en móvil), manteniendo icono centrado + texto centrado.
