# Beneficios Specification (dentro de `et_pb_section_7`, row 9 — parte inferior, col 2/3)

## Overview
- **Target file:** `src/components/Beneficios.tsx` (o sub-bloque de `HazVisible.tsx` — vive en la MISMA columna 2/3 de row 9, a continuación del texto)
- **Screenshot:** `docs/design-references/beneficios.jpg`
- **Interaction model:** estático.
- **CORRECCIÓN a PAGE_TOPOLOGY/BEHAVIORS §11.e:** son **6 blurbs**, no 3 (el reconocimiento solo vio la fila inferior).

## DOM Structure
```
(col 2/3 de .et_pb_row_9, tras et_pb_text_29)
├─ et_pb_text_30: p "Beneficios:"
├─ et_pb_blurb ×6  (inline-block → grid 3×2)
│  └─ .et_pb_blurb_content
│     ├─ .et_pb_main_blurb_image > img (SVG 50×50)
│     └─ .et_pb_blurb_container > h3.et_pb_module_header > span (label)
└─ BlueButton "Solicita más información" (wrapper et_pb_button_alignment_center)
```

## Computed Styles (exact)

### "Beneficios:" (et_pb_text_30)
- 18px/400 #333 (párrafo normal, no heading).

### Blurbs (×6)
- `display: inline-block; width: 235.67px` (≈33% de la col de 786px); `margin: 0 23.56px 33.31px 0`; `padding: 0` (a diferencia de Sostenibilidad, aquí SIN padding horizontal).
  - Equivalente limpio: grid 3 columnas × 2 filas, gap horizontal ~24px, gap vertical ~33px.
- Icono: `img` **50×50px**; wrapper `.et_pb_main_blurb_image` centrado (`text-align: center`), `margin-bottom: 30px`.
- Label: `h3.et_pb_module_header` — fontSize **18px**; fontWeight **300**; lineHeight 1.2em (21.6px); color #333; **text-align: center**; padding-bottom 10px.

### CTA
- `BlueButton` "Solicita más información" — href verbatim **`#`** (enlace muerto en el original; en ensamblaje mapear a `/es/contacto/` — anotar en QA). Wrapper **centrado** (`et_pb_button_alignment_center`) respecto a la col 2/3.

## States & Behaviors
- **Hover BlueButton:** #0075C9 → #7F8798 + desplazamiento de flecha; 0.2s.
- Blurbs sin hover. Reveal on-view Divi genérico (los iconos llevan clases `et-waypoint et_pb_animation_off` — sin animación propia).

## Per-State Content (verbatim, orden DOM = visual 3×2)

| # | Label | Icono (`public/images/uploads/…`) |
|---|-------|-----------------------------------|
| 1 | Sistema de cartuchos | `2023/02/cartridge-system.svg` |
| 2 | Múltiples contaminantes | `2023/02/multi-pollutant-1.svg` |
| 3 | Flexible y escalable | `2023/02/flexible-scalable.svg` |
| 4 | Mantenimiento reducido | `2023/01/reduced-maintenance.svg` |
| 5 | Calibración remota | `2023/01/remote-calibration.svg` |
| 6 | Software avanzado | `2023/01/advanced-software-1.svg` |

CTA: "Solicita más información" → `#` (ver nota arriba).

## Assets
- 6 SVGs de icono — ya descargados (rutas en la tabla). Estilo: iconos lineales azul/gris de trazo fino, 50×50.

## Responsive Behavior
- **≥981px:** grid 3×2 dentro de la col 2/3.
- **≤980px:** col 2/3 a ancho completo; blurbs siguen inline-block → caben 2-3 por fila según ancho.
- **≤767px:** blurbs apilados a 1 por fila (patrón Divi móvil), icono y label centrados; botón centrado.
