# Hero Specification (`banner-home`, et_pb_section_0)

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Interaction model:** estático + hover (animación del play button); H1 pequeño uppercase como kicker
- **Fuente:** HTML servido + theme.css + init.js (los botones se inyectan por JS en el original)

## DOM Structure

```
section .et_pb_section_0.banner-home              ← bg imagen + overlay
├─ ::before                                        ← marca de agua "K" (recurso-k-fondo.svg), soft-light
└─ Row .et_pb_row_0.et_pb_equal_columns  (height: 80vh; display:flex)
   ├─ Col 2/5 .banner-home-col-izda                ← flex col, align-self:end, align-items:end
   │  └─ img kunak-air-pro-aislado.png (426×971)   ← sensor sobre poste, pegado al fondo de la sección
   └─ Col 3/5 .banner-home-col-dcha                ← flex col, align-self:center
      ├─ text_0  h1  "Monitoreo de la calidad del aire"          (kicker uppercase)
      ├─ text_1  h2  "La solución profesional …"                 (titular principal)
      ├─ text_2  h2  "Datos fiables y trazables …"               (subtítulo)
      ├─ botón #btn-home-es  → #video               ("Descubre cómo funciona", play SVG)
      ├─ botón #btn-home-es-catalogue → /es/descarga-catalogo/ (target _blank; "Catálogo", download SVG)
      ├─ text_3  p "Evaluado por los principales expertos…"     (con borde superior hairline)
      ├─ text_4 .banner-logotipos                   ← 3 logos-enlace a PDFs
      └─ code_2 .scroll-code                        ← indicador de scroll centrado abajo
```

## Computed / authored styles

### Sección
- `background-color: transparent` + `background-image: linear-gradient(rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.47) 100%), url(/images/uploads/2023/07/imagen-banner-principal-2-1-1.webp)`; `background-size: cover, cover`
- `padding: 180px 0 0` (top da espacio al header overlay)
- Altura total render: **752px** @1440×900 (row interior `height: 80vh`)
- `.banner-home { position: relative }`
- `::before`: `position:absolute; inset-inline-start:0; top:31%; width:100%; height:100%; background: no-repeat url(/images/theme/recurso-k-fondo.svg) left top; mix-blend-mode: soft-light; z-index:1`

### Columna izquierda
- `width: 36.7%; margin-inline-end: 5.5%; margin-bottom: 0; display:flex; flex-direction:column; align-self:end; align-items:end`
- `img { width:auto; max-height: 73vh }` — el sensor "sale" del borde inferior de la sección

### Columna derecha
- `width: 57.8%; display:flex; flex-direction:column; align-self:center`
- Todos los `et_pb_text` con `width: 90%` (base) / `100%` (móvil)

### Tipografía (valores autored Divi + computed @1424w)
| Elemento | Reglas | Computed @1424 |
|---|---|---|
| `h1` (text_0, kicker) | `text-transform:uppercase; font-size:20px; color:#FFF; line-height:1.3; text-shadow:0 0 0.5em #000` (12px @móvil) | 20px |
| `h2` (text_1, titular) | `font-weight:600; font-size:42px; color:#FFF; line-height:1.2; text-shadow:0 0 0.3em rgba(0,0,0,0.64)` — MQ tablet 46px, móvil 38px. Regla vw: `.banner-home .et_pb_text_1 h2 { font-size: 3.7vw }` | **42px / 600 / lh 50.4 / ls −0.5px** |
| `h2` (text_2, subtítulo) | `font-size:28px; color:#FFF; line-height:1.3; text-shadow:ídem` + override `.banner-home .et_pb_text_2 h2 { font-size: 2.4vw }` | ~34px @1424 (2.4vw); usar `clamp(24px, 2.4vw, 36px)` |
| `p` (text_3) | `color:#FFF` (18px body) | 18px |

### Botones (inyectados por JS en el original — construir directo en JSX)
Los `<a class="et_pb_button">` Divi se vacían (`color/bg/border: transparent, :before/:after display:none`) y el JS mete `span.banner-home-button`:

```css
.banner-home-button { display:inline-flex; align-items:center; height:50px; color:#fff; }
.banner-home-button svg { width:50px; margin-inline-end:10px; }
.banner-home-button span { font-size:18px; font-weight:700; }
.banner-home-col-dcha .et_pb_button_module_wrapper { display:inline-block; }
.banner-home-col-dcha .et_pb_button_module_wrapper a { margin-inline-end:15px; }
```

- **Botón 1 "Descubre cómo funciona"** → `href="#video"` con `data-trigger-click="video"` (abre el lightbox de vídeo — pendiente para la sección que contenga `#video`). SVG = círculo + triángulo play (PlayIcon de icons.tsx, blanco).
- **Botón 2 "Catálogo"** → `/es/descarga-catalogo/`, `target="_blank"`. SVG = círculo + flecha descarga con bandeja (DownloadIcon).

### Animación hover del play/download (exacta)
```css
.banner-home .stroke-solid { stroke-dashoffset:0; stroke-dasharray:300; stroke-width:4px;
                             transition: stroke-dashoffset 1s ease, opacity 1s ease; }
.banner-home .icon         { transform: scale(0.8); transform-origin:50% 50%;
                             transition: transform 200ms ease-out; }
.banner-home-button:hover .stroke-solid { opacity:1; stroke-dashoffset:300; }   /* el círculo se "des-dibuja" */
.banner-home-button:hover .icon         { transform: scale(0.9); }              /* el glifo crece */
```

### text_3 — "Evaluado por…"
- `et_pb_with_border`: hairline superior (línea blanca fina visible sobre el texto; 1px, blanco semitransparente — verificar exacto en QA visual).
- `color: #fff`, tamaño body 18px.

### banner-logotipos (text_4)
```css
.banner-logotipos .et_pb_text_inner p { display:flex; }
.banner-logotipos a { transition: opacity .2s ease; padding-inline-end: 1rem; }
.banner-logotipos a:hover { opacity: .75; }
```
| Logo | Tamaño | Enlace (PDF, target _blank) |
|---|---|---|
| EPA | 235×105 | `/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf` |
| mCerts | 104×105 | `/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf` |
| AirLab | 147×105 | `/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf` |

### scroll-code (indicador de scroll)
- `.scroll-code { position:absolute; width:40px; bottom:60px; left:50%; transform:translate(-50%,0) }`
- Contiene un icono de ratón con rueda animada (`.icon-scroll`, animación CSS de la bolita bajando). En hover la animación se pausa y la bolita queda fija a `top:10px` (7×7px). El markup interno lo genera CSS del tema; en el clon: dibujar un mouse outline 40px con dot animado (keyframe: dot baja ~15px y desvanece, loop ~2s). *Nivel de detalle exacto del icono a validar en QA.*

## States & Behaviors
- **Estático** (imagen fija; sin parallax, sin vídeo de fondo).
- Hover play/download → animación stroke + scale descrita arriba.
- Hover logos → opacity .75.
- `#video` anchor: destino real es un lightbox (lightbox.js del tema); fuera de alcance de esta sección.

## Assets (rutas locales ya descargadas)
- Fondo: `public/images/uploads/2023/07/imagen-banner-principal-2-1-1.webp` (1920w, 286 KB)
- Sensor: `public/images/uploads/2022/12/kunak-air-pro-aislado.png` (426×971) + variante `-132x300.png`
- Marca K: `public/images/theme/recurso-k-fondo.svg`
- Logos: `public/images/uploads/2025/10/logos-banner-home-epa.svg` (235×105) · `logos-banner-home-mcerts.svg` (104×105) · `logos-banner-home-airlab.svg` (147×105)

## Text Content (verbatim)
- H1 kicker: `Monitoreo de la calidad del aire`
- H2 titular: `La solución profesional para la monitorización de la calidad del aire`
- H2 subtítulo: `Datos fiables y trazables para decisiones operativas y cumplimiento normativo`
- Botones: `Descubre cómo funciona` · `Catálogo`
- Claim logos: `Evaluado por los principales expertos mundiales en calidad del aire`

## Responsive Behavior
- **Desktop (≥981px):** 2 columnas (36.7% / 57.8%), row 80vh, imagen sensor max-height 73vh anclada abajo.
- **Tablet (≤980px):** columnas se apilan (Divi); titular 46px→(escala); sensor probablemente centrado bajo el texto. Padding-top se mantiene ~180px.
- **Mobile (≤767px):** H1 12px; H2 titular 38px; H2 sub sigue vw (≥24px con clamp); botones apilables en 2 líneas; logos EPA/mCerts/AirLab en fila con wrap.
- Breakpoints Divi: 980px / 767px / 479px.
