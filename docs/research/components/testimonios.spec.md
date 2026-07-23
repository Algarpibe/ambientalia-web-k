# Testimonios Specification (dentro de `et_pb_section_7`, rows 7–8)

## Overview
- **Target file:** `src/components/Testimonios.tsx`
- **Interaction model:** **RESUELTO punto abierto #3** — slider **Divi `et_pb_slider`** (NO Swiper) con **autoplay 7000 ms** + flechas click. Clases del módulo: `et_pb_slider_0 testimonios et_pb_slider_fullwidth_off et_pb_slider_no_pagination et_slider_auto et_slider_speed_7000`.
  - `et_slider_auto` → rotación automática activada.
  - `et_slider_speed_7000` → **7000 ms por slide**.
  - `et_pb_slider_no_pagination` → **sin dots**.
  - Transición Divi slider: **fade** (crossfade estándar Divi ~500 ms, jQuery `fadeIn/fadeOut`). El autoplay se **pausa en hover** (comportamiento Divi por defecto).
- **5 slides** (`et_pb_slide_1–5`).

## DOM Structure

```
Row 7:  col 1/3 (punteado + H2 "Testimonios")  |  col 2/3 (vacía — ancla layout)
Row 8:  col 4/4
        └─ .et_pb_slider_0.testimonios
           ├─ .et_pb_slides > .et_pb_slide ×5 (bg transparente, layout dark)
           │   └─ .et_pb_container
           │      └─ .et_pb_slider_container_inner
           │         ├─ .et_pb_slide_image  (img avatar circular)
           │         └─ .et_pb_slide_description   (flex column-reverse → cita arriba, autor debajo)
           │            ├─ h2.et_pb_slide_title  "Nombre" + <span> "Cargo - Empresa"
           │            └─ .et_pb_slide_content  (cita)
           └─ .et-pb-slider-arrows  (‹ ›)
```

## Computed / authored styles

### Contenedor
- `line-height: 1.6em; overflow: hidden`.
- Row 8: `padding-bottom: 10%`.
- Slides con `background-color: transparent` (sobre el fondo blanco de la página).
- Descripción: `padding-top: 0; padding-bottom: 104px` (hueco para las flechas de Divi abajo... en la práctica las flechas van a los lados verticales centradas).

### Avatar (`.et_pb_slide_image img`)
- **`border-radius: 50%`** (regla inline Divi `.et_pb_slider_0 .et_pb_slide_image img`).
- Desktop ≥1000px: **180×180px**; 768–999px: `20vw × 20vw`.
- Columna imagen: `width: 28%` (desktop; 33%/60% en variantes MQ menores).
- Layout slide: avatar a la izquierda, descripción `width: 70%` a la derecha.

### Cita (`.et_pb_slide_content`)
- `font-size: 18.1px; color: #333; line-height: 1.6em; text-shadow: none`.

### Autor (h2 `.et_pb_slide_title`)
- Orden visual: **cita arriba** (column-reverse), autor debajo.
- Nombre: `font-size: 20px; line-height: 1.3; color: var(--azul #0075C9); font-weight: 300; letter-spacing: -0.5px; margin-top: 1.5rem`.
- Cargo (`span` dentro del title): `display:block; font-size: 16px; color: #333`.

### Flechas (`.et-pb-arrow-prev` / `.et-pb-arrow-next`)
- Color: `#0075c9`. Siempre visibles (`opacity: 1`, sin fade de Divi).
- Posición: `inset-inline-start/end: 0`, centradas verticalmente (estilo Divi).
- Hover: `color: var(--gris #7F8798)`.
- Glifos: caracteres ETmodules (‹ ›) — en el clon usar ChevronLeftIcon/ChevronRightIcon (~24-32px).

## Slides (verbatim, orden DOM)

| # | Nombre | Cargo | Avatar (`public/images/uploads/…`) |
|---|--------|-------|------------------------------------|
| 1 | Jérôme De Waele | Director general - AIRSCAN | `2024/04/jerome-airscan.jpg` |
| 2 | Cristobal Hernández | Profesional del control medioambiental - Cobre Panamá - FQML | `2024/03/Cristobal-Hernandez.jpg` |
| 3 | Bachir Kerkache | Director General - CleanAir Europe | `2024/04/bachir-kerkache-1.jpg` |
| 4 | Jelle Hofman | I+D sobre la calidad del aire - VITO | `2024/03/Jelle-Hofman.jpg` |
| 5 | Ibai Uria Gaztelu-Iturri | Responsable de Prevención y Medio Ambiente - Puerto de Bilbao | `2024/04/Ibai-Uria-Gaztelu-Iturri.jpg` |

### Citas completas

1. **Jérôme De Waele:** "Valoramos especialmente la escalabilidad y fiabilidad de la solución Kunak: gestionamos más de 100 estaciones en África, Europa y Asia. Los datos son precisos, tenemos una tasa de 0 defectos en el hardware y el rendimiento de la analítica en la nube de Kunak es excelente, incluso con grandes volúmenes de datos."
2. **Cristobal Hernández:** "La red de sensores de Kunak nos permiten tener un control preciso del polvo en suspensión y los gases contaminantes en la mina y activar los mecanismos para minimizar su dispersión, mejorando así la calidad del aire y protegiendo a nuestros trabajadores y las comunidades próximas."
3. **Bachir Kerkache:** "Los monitores de calidad del aire Kunak convierten nuestra cartera de instrumentos medioambientales en la más completa del mercado, ya que nos proporcionan una calidad de datos casi de referencia en un sistema flexible y fácil de desplegar."
4. **Jelle Hofman:** "Valoro enormemente las innovadoras soluciones de Kunak, junto con sus herramientas de análisis y calibración en la nube, ya que constituyen una importante evidencia sobre la fiabilidad de los datos de los sensores de calidad del aire."
5. **Ibai Uria Gaztelu-Iturri:** "La red de sensores de Kunak ha mejorado nuestra supervisión y evaluación del impacto de la actividad portuaria en la calidad del aire. También nos ha ayudado a identificar con más detalle el origen de las fuentes de emisión, lo que hace más eficaces las medidas de mitigación aplicadas."

## Encabezado de la sección (Row 7)
- Col izquierda: punteado.svg + H2 **"Testimonios"** (44px/300/#333, 35px móvil).

## Estados y comportamientos (resumen implementación)
- **Auto-rotate:** cada 7000 ms → siguiente slide con **crossfade ~500 ms**; loop infinito.
- **Pausa en hover** del slider (Divi default).
- **Flechas:** click ‹ / › → slide anterior/siguiente con el mismo fade; reinician el timer (Divi reinicia el intervalo tras interacción).
- Avatares también hacen fade junto con el resto del slide (todo el slide es un bloque).

## Responsive
- ≥1000px: avatar 180×180, dos columnas 28% / 70%.
- 768–999px: avatar 20vw; mismas proporciones.
- ≤767px: layout apilado (avatar arriba centrado, cita debajo, autor al final); flechas a los bordes (`.ar` overrides muestran ±15px en árabe).

## Assets
Avatares en `public/images/uploads/2024/…` (5 originales + variantes 480/980) — ya descargados.
