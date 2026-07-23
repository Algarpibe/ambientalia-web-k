# "Haz visible la contaminación" Specification (dentro de `et_pb_section_7`, row 9 — parte superior)

## Overview
- **Target file:** `src/components/HazVisible.tsx` (puede incluir el sub-bloque Beneficios como hijo — ver `beneficios.spec.md`)
- **Screenshot:** `docs/design-references/haz-visible.jpg`
- **Interaction model:** estático (solo hovers de botón y links inline).
- **CORRECCIÓN a PAGE_TOPOLOGY/BEHAVIORS:** el "destacado azul" ('Elige los contaminantes…') NO es un recuadro con fondo — es un **H2 azul de 37px** sin caja.

## DOM Structure
```
.et_pb_row_9 (maxWidth 1380, 2 columnas)
├─ col 1/3 (.et_pb_column_17)
│  ├─ punteado.svg
│  ├─ H2 "Haz visible la contaminación"        (44px/300/#333)
│  └─ BlueButton "Descargar catálogo" → #catalogo
└─ col 2/3 (.et_pb_column_18)
   ├─ et_pb_text_27: dos H2 con span azul     ("Simplifica…" / "Toma mejores decisiones.")
   ├─ et_pb_text_28: 2 párrafos con links inline
   ├─ et_pb_text_29: H2 azul "Elige los contaminantes…"
   └─ … (continúa con Beneficios — spec aparte)
```

## Computed Styles (exact)

### Col izquierda
- H2: 44px/300/#333, lineHeight 55px, letterSpacing −0.5px (`SectionTitle`).
- Botón: `BlueButton` "Descargar catálogo" → href **`#catalogo`** (anchor verbatim del original; en ensamblaje mapear al mismo destino que el CTA de catálogo del hero: `/es/descarga-catalogo/` — anotar para QA).

### Subtítulos azules (et_pb_text_27)
- Dos `<h2>` consecutivos, cada uno con `<span>`:
- fontSize **37px**; fontWeight **300**; lineHeight 1.2em (44.4px); letterSpacing −0.5px; **color del span: #0075C9** (h2 base #333, el span pinta el azul).

### Párrafos (et_pb_text_28)
- 18px/400 #333; lineHeight 30.6px.
- Links inline color **#0075C9** sin subrayado (hover: subrayado/tono estándar del sitio ya establecido en specs previas):
  - "software de calidad del aire" → `/es/software-de-medicion-calidad-del-aire/`
  - "cartuchos inteligentes" → `/es/sensor-de-calidad-del-aire/`

### Destacado azul (et_pb_text_29)
- `<h2><span>` — fontSize **37px**; fontWeight 300; lineHeight 44.4px; letterSpacing −0.5px; **color span #0075C9**; text-align left.
- Módulo: `margin: 10px 0 40px`; sin fondo, sin borde, sin padding.

## States & Behaviors
- **Hover BlueButton:** bg/border #0075C9 → #7F8798, flecha se desplaza; 0.2s.
- **Hover links inline:** patrón del sitio (azul, subrayado en hover).
- Reveal on-view Divi genérico.

## Text Content (verbatim)
- H2 izq: "Haz visible la contaminación"
- Botón izq: "Descargar catálogo" → `#catalogo`
- H2 azul 1: "Simplifica tu operativa diaria."
- H2 azul 2: "Toma mejores decisiones."
- P1: "Súmate al cambio y empieza a medir de forma fiable la contaminación con los sensores de calidad del aire más precisos del mercado y toma mejores decisiones gracias al software de calidad del aire más avanzado." (link en "software de calidad del aire")
- P2: "Nuestra solución Kunak AIR es la solución más versátil del mercado para medir gases y partículas gracias a su sistema patentado de cartuchos inteligentes intercambiables." (link en "cartuchos inteligentes")
- H2 azul 3: "Elige los contaminantes a medir en tu proyecto de calidad del aire y cámbialos cuando lo necesites."

## Assets
- `public/images/uploads/2022/12/punteado.svg`. Sin más assets.

## Responsive Behavior
- **≥981px:** 1/3 (título + botón) + 2/3 (texto).
- **≤980px:** apilado; título y botón arriba.
- **≤767px:** H2 de 44px → ~35px y los de 37px → ~28-30px (escala Divi móvil; confirmar en QA con la escala usada en las secciones ya construidas).
