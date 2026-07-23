# SolucionProfesional Specification (`et_pb_section_2`, id `home-content`)

## Overview
- **Target file:** `src/components/SolucionProfesional.tsx`
- **Interaction model:** estático + hover scale en logos de validación. **Los iconos NO llevan reveal Divi** (todas las imágenes de blurb tienen `et_pb_animation_off` en las 3 variantes) — el "reveal on-view" que se asumió en BEHAVIORS.md §7 queda descartado para esta sección.
- **Fuente:** HTML servido + theme.css + reglas inline Divi (page-id 24305).

## Layout general
- Sección con `padding-bottom: 59px`, fondo blanco con **forma diagonal decorativa** gris muy claro (`rgba(0,0,0,0.03)` aprox.) — verificar en QA el shape exacto (aparece como parallelogramo en capturas).
- **3 filas** (`et_pb_row_2/3/4`), todas patrón **1/3 (título) + 2/3 (contenido)**.
- Cada columna izquierda lleva el punteado decorativo: `img punteado.svg (60×22)` con `position:absolute; top:-40px; left:-65px; z-index:-1` (regla genérica `.et_pb_image_N`; en esta sección no hay override de -10px).
- Títulos H2 columna izquierda: `font-weight:300; font-size:44px; line-height:1.25em; color:#333; letter-spacing:-0.5px` (35px en tablet y móvil según MQ Divi).

## Fila 1 — "La solución profesional para la monitorización ambiental"

### Col izquierda (1/3)
- 3 × punteado.svg apilados (módulos image_2/3/4 absolutos — solo el primero es visible como acento).
- H2 (`text_7`): "La solución profesional para la monitorización ambiental" — 44px/300/#333.
- Botón (`et_pb_button_2`): **"Descargar ficha técnica"** → `https://kunakair.com/doc/External/Kunak_AIR_Datasheet_ES.pdf`
  - Variante outline Divi (borde 2px rgba, pill). Flecha `→` Divi `:after` aparece en hover (`opacity 0 → 1`).
  - Wrapper `margin-top:-3rem; margin-bottom:1rem`.
- Botón (`et_pb_button_3.boton-azul`): **"Descargar catálogo"** → `/es/descarga-catalogo/`
  - `.boton-azul`: `background: var(--azul); border-color: var(--azul); color:#fff` — hover: `background: var(--gris #7F8798); border-color: var(--gris)`. Pill.

### Col derecha (2/3)
- Subtítulo azul (`text_8`, h2): **"Mide múltiples contaminantes de forma precisa con la estación de calidad del aire más versátil."** — color `#0075c9`, ~32–36px/300 (validar px exacto en QA; capturas lo muestran al mismo tamaño que los demás destacados azules).
- Body (`text_9`) verbatim:
  > Con las estaciones de calidad del aire [Kunak AIR](https://kunakair.com/es/soluciones/) obtienes una monitorización ambiental con **mediciones precisas, fiables y en tiempo real** de los principales contaminantes con un coste menor a los métodos tradicionales.
  >
  > Las estaciones Kunak AIR ofrecen niveles de rendimiento cercanos a los **estándares de referencia**, proporcionando datos fiables y precisos según la norma europea CEN/TS 17660 para alcanzar los DQO de Clase 1 y acorde a los protocolos, métricas y valores objetivo EPA/600/R-20/279 para O₃, EPA/600/R-23/14 para NO₂, CO y SO₂, EPA/600/R-20/280 para PM₂,₅ y EPA/600/R-23/145 para PM₁₀.
  >
  > Además, los datos son trazables a estándares internacionales reconocidos (Directiva (UE) 2024/2881 y USEPA 40 CFR Parte 53).
  - El segundo párrafo va dentro del **recuadro azul** (borde `1px solid #0075c9` aprox., border-radius, padding generoso — verificar valores en QA; capturas muestran caja con borde azul redondeado).
  - Enlaces en texto: `color: var(--azul); transition: all .3s`.
- **5 blurbs** (`et_pb_blurb_0–4`, clase `iconos-xs-2`) en fila:
  | Icono (50px) | Label (16–18px, centrado) |
  |---|---|
  | `2023/02/real-time.svg` | Datos fiables en tiempo real |
  | `2023/01/Mcerts.svg` | Certificación MCERTS CSA MC230418/00 |
  | `2023/02/data-quality-1.svg` | Tecnología patentada |
  | `2023/02/global-presence.svg` | Equipos en los 5 continentes |
  | `2023/02/years-of-experience-1.svg` | +10 años de experiencia |
  - `.iconos-xs-2 { display:inline-block; width:48%; margin-inline-end:2% }` es la regla móvil (2 por fila); en desktop los 5 caben en una fila (usar flex + gap en el clon).
  - Imagen 50px de ancho; header `font-size:18px (16px móvil); line-height:1.2; text-align:center`.
  - Sin animación de entrada (`et_pb_animation_off`).

## Fila 2 — "Solución validada"

### Col izquierda (1/3)
- punteado + H2 "Solución validada" (44px/300).

### Col derecha (2/3)
- Intro (`text_11`): "Nuestra solución ha sido evaluada por los principales **expertos en calidad del aire** del mundo."
- **6 blurbs-logo enlazados** (`et_pb_blurb_5–10`), cada uno un `<a>` con imagen SVG:
  | Logo | Ancho img | Enlace (PDF/estudio, target _blank) |
  |---|---|---|
  | `2023/01/US-EPA-united-states-environmental-protection-agency.svg` | 120px | `/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf` |
  | `2023/01/Mcerts.svg` | 100px | `/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf` |
  | `2023/01/AQ-SPEC.svg` | 100px | `https://www.aqmd.gov/docs/default-source/aq-spec/field-evaluations/kunak-air-pro---field-evaluation.pdf` |
  | `2023/01/airparif.svg` | 100px (blurb_8: width 100%) | `/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf` |
  | `2023/05/SEDEMA_CDMX.svg` | 100px | `/doc/09.StudiesReferences/Independent_studies/SEDEMA_2b_Evaluacion_Sensores_CDMX_2022.pdf` |
  | `2023/04/Ricardo_logo.svg` | 100px | `/doc/09.StudiesReferences/Independent_studies/Ricardo_Kunak_Air_Pro_Sensor_report_summary.pdf` |
  - **Hover: `transform: scale(1.2)` con `transition: transform 300ms ease`** (regla `.et_pb_blurb_5:hover…{transform:scaleX(1.2) scaleY(1.2)}`).
- Texto (`text_12`): "Proteger la salud de las personas te resultará más fácil que nunca.\nToma decisiones informadas que ayuden a mejorar la calidad del aire."
- Destacado azul (`text_13`): "Protege tu salud. **Protege el medio ambiente.**" (dos líneas azules grandes).
- Botón `boton-azul` (`et_pb_button_4`): **"Quiero saber más"** → `/es/contacto/`.

## Fila 3 — "Reconocimientos"

### Col izquierda (1/3)
- punteado + H2 "Reconocimientos" (44px/300).

### Col derecha (2/3)
- Intro (`text_15`): "Confía en la solución premiada y reconocida por numerosos organismos internacionales."
- **3 blurbs-badge enlazados** (`et_pb_blurb_11–13`), imagen 150px:
  | Badge | Enlace |
  |---|---|
  | `2023/04/wildland-fire-sensors-challenge.svg` | `/es/mencion-de-honor-de-la-agencia-de-proteccion-ambiental-de-ee-uu-por-el-reto-wildland-f…` |
  | `2023/04/AIRLAB-challenge-awards.svg` | `/es/el-sensor-de-calidad-del-aire-mas-preciso/` |
  | `2023/04/AQE-awards.svg` | `/es/blog/medicion-de-la-calidad-del-aire-en-puertos-maritimos/` |
  - Mismo hover `scale(1.2)` 300ms.
- Texto (`text_16`) verbatim:
  > En la última edición del AIRLAB Microsensors Challenge organizado por Airparif, las estaciones de calidad del aire Kunak AIR fueron galardonadas como el **SENSOR MULTI-CONTAMINANTE MÁS PRECISO**. [Más info](https://kunakair.com/es/el-sensor-de-calidad-del-aire-mas-preciso/)
- Banner ganador (`text_17`): imagen-enlace `2023/10/banner-winner-airlab-ES.svg` ("Ganador del AIRLAB Microsensors Challenge" con laurel, 2021 & 2023) → `/es/el-sensor-de-calidad-del-aire-mas-preciso/`.
- Cierre azul (`text_18`): **"Construye un futuro más sostenible apostando por la tecnología más innovadora en monitorización ambiental."** (destacado azul grande).

## Estados y comportamientos
- **Estático**; sin reveals de entrada.
- Hover blurbs-logo/badge: `scale(1.2)` 300ms.
- Hover botones `boton-azul`: azul → gris `#7F8798` (300ms, transición Divi `all 300ms ease`).
- Hover botón outline `Descargar ficha técnica`: flecha `→` fade-in.
- Hover links de texto: `color: var(--azul)` con `transition: all .3s` (subrayado según Divi default underline on hover — validar).

## Assets (todos ya en `public/images/uploads/…`)
punteado.svg · real-time.svg · Mcerts.svg · data-quality-1.svg · global-presence.svg · years-of-experience-1.svg · US-EPA-united-states-environmental-protection-agency.svg · AQ-SPEC.svg · airparif.svg · SEDEMA_CDMX.svg · Ricardo_logo.svg · wildland-fire-sensors-challenge.svg · AIRLAB-challenge-awards.svg · AQE-awards.svg · banner-winner-airlab-ES.svg

## Responsive
- ≤980px: filas 1/3+2/3 se apilan (título arriba); H2 44→35px; blurbs `iconos-xs-2` a 2 por fila (48% + 2% gap).
- ≤767px: H2 35px; blurbs siguen 2 por fila; botones full-width tendencia Divi (`et_pb_button_alignment_tablet_center` en ficha técnica).
