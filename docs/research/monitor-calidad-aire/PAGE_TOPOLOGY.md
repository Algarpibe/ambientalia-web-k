# PAGE_TOPOLOGY.md — kunakair.com/es/monitor-calidad-aire (Kunak AIR Pro)

> Reconocimiento realizado el 2026-07-23 sobre `https://kunakair.com/es/monitor-calidad-aire/`.
> Viewport de referencia desktop: **1045×515 CSS px** (máximo capturable en esta sesión: pantalla 1280×800 DIP @150 %;
> el breakpoint desktop de Divi es ≥981 px, por lo que el layout es el mismo que a 1440 con márgenes menores).
> Móvil: **390 px** de ancho (iframe same-origin de 390×515 – media queries y scripts inicializados a 390).
> Alto total desktop: **13 204 px** (crece a ~13 700 al cargar lazy images). Alto móvil 390: **~21 600 px**.
> Título SEO: "Monitor de calidad del aire profesional | Kunak AIR Pro".

## Stack detectado

- **WordPress + Divi** (tema hijo `KunakAir`), plantillas Theme Builder: `et-tb-has-header` **y `et-tb-has-footer`** (a diferencia de la home, el footer también es plantilla TB — incluye franja fotográfica final).
- Body classes: `solutions-template-default single single-solutions postid-768 … et_right_sidebar` (CPT **solutions**).
- **Fuente:** `Manrope, sans-serif` (idéntica a la home — reutilizar fundación).
- **jQuery** + **SwiperJS** (`sectoresSwiper`, mismo shortcode de la home).
- **NUEVAS librerías** (no presentes en la home):
  - **360 Javascript Viewer** (`@3dweb/360javascriptviewer` v1.7.32 vía plugin WP `360deg-javascript-viewer`) — visor 360° del hero.
  - **Popups for Divi** v3.2.7 — popup modal con formulario (`#disenar-proyecto-form-esp`).
- Lightbox del tema (`KunakAir/assets/js/lightbox.js`, clase overlay `lightboxOverlay`) — mismo mecanismo que la home (M5), aquí con **YouTube** en vez de Brightcove.
- **Sin animaciones de entrada**: los 27 módulos con waypoint llevan `et_pb_animation_off` + `_off_tablet` + `_off_phone` (igual que la home → clon estático fiel).
- Sin Lenis/GSAP/AOS/Locomotive. Scroll nativo. Cookiebot presente.

## Layout global

- Scroll nativo en `<html>/<body>`, sin scroll containers anidados ni scroll-snap.
- **Header**: MISMO template TB que la home (utility bar + `.fila-menu-principal` sticky glass con `fila-menu-principal-fixed`). Única diferencia: la sección de cabecera `.et_pb_section_0_tb_header.cabecera` lleva fondo `linear-gradient(rgba(71,71,71,0.17), transparent) + url(2023/10/cabecera-puerto.jpg)` → foto panorámica industrial/puerto visible detrás del header transparente (~335 px de alto visible). No hay hero fullscreen: el contenido de página empieza inmediatamente con fondo blanco.
- **Footer**: mismo TB footer de 5 columnas + barra legal, **más una tercera sección `footer-background`**: franja decorativa con `url(2022/12/cabecera-puerto-1.jpg)` (~40–90 px) al fondo de todo. Verificar si el `Footer` del clon ya la incluye; si no, añadirla como prop opcional.
- **Scroll-to-top** compartido (`et_pb_scroll_top`, mismas coordenadas).
- **Sticky nuevo**: columna izquierda `.columna-lista-anclas` (`et_pb_column_1_4 … et_pb_sticky_module`) dentro de la fila compuesta S3 — ver BEHAVIORS §5.
- Fondo decorativo de S1/S5: `recurso-k-fondo.svg` (marca de agua diagonal "K" gris claro) + matrices de puntos azules (mismo lenguaje que la home).

## Mapa de secciones (`#main-content > article > .et_pb_section_*`)

Medidas a 1045 px de ancho (tops crecen ligeramente al cargar imágenes lazy).

| # | idx CSS | Nombre operativo | Top | Alto | Reutiliza / Nuevo | Contenido |
|---|---------|------------------|----:|-----:|-------------------|-----------|
| 0 | `et_pb_section_0` | **Breadcrumb** | 225 | 50 | 🆕 NUEVO (simple) | `Inicio / Productos / AIR Pro` — enlaces azules, separador `/`. |
| 1 | `et_pb_section_1` | **Hero producto + Información del producto** | 275 | 3523 | 🆕 NUEVO (núcleo de la página) | **Fila 1 (hero, ~670 px)**: izquierda H1 "Kunak AIR Pro" + sub "Monitor de calidad del aire" + H2 gigante "Monitoriza la calidad del aire con datos precisos y fiables" + kicker azul "BASADO EN SENSORES \| MÁXIMA PRECISIÓN" + fila 6 logos validadores (EPA, MCERTS, AirParif, AQ-SPEC, CDMX Medio Ambiente, Ricardo) + CTA sólido "Solicita más información →" (→ /es/contacto/). Derecha: **visor 360°** drag-to-rotate (35 frames `kunak360_IMG_xx.jpg`, hint "arrastrar para rotar") + badge laurel "GANADOR AIRLAB Microsensors Challenge 2021 & 2023 — SENSOR MULTICONTAMINANTE MÁS PRECISO" + botón outline "Ver vídeo del producto →" (`#video` → lightbox YouTube `tuTfw6KIvd4`). **Fila 2 (~2770 px)**: 2 columnas 1/4–3/4. Izq: título "Información del producto" + 3 CTAs apilados (outline "Descargar ficha técnica" → PDF `Kunak_AIR_Datasheet_ES.pdf`, sólido "Solicita más información" → contacto, sólido "Descarga el catálogo" → `#catalogo` **ancla muerta**, ver BEHAVIORS §10). Der: copy largo con H3 azules ("Te mereces una buena calidad del aire.", "Obtén datos precisos…", "Empieza hoy mismo…", "La gama de contaminantes más completa"), **2 recuadros azules** redondeados (Calidad de datos / niveles de rendimiento con enlaces normativos CEN/TS 17660, EPA/600/R…, Directiva (UE) 2024/2881, USEPA 40 CFR 53), **checklist de 6 iconos** (plug&play, 16 contaminantes, precisión, trazabilidad, mantenimiento, autonomía), segunda fila de los mismos 6 logos validadores, y **grid de 16 chips-píldora** de contaminantes (CO NO NO₂ O₃ SO₂ H₂S CO₂ CH₄ COV NMHC NH₃ HCl HCN HF Cl₂–ClO₂ O₂ — cada chip es `<a>`; subíndices con `<sub>`; borde azul redondeado, mismo lenguaje que el grid Cartuchos B8). |
| 2 | `et_pb_section_2` (fullwidth) | **CTA banner "No se puede mejorar…"** | 3797 | 467 | ♻️ patrón **CtaBanner** (variante izquierda) | Técnicamente `et_pb_fullwidth_slider` de **1 sola slide** (sin flechas/dots → estático). Foto ciclistas cruzando + overlay oscuro. Texto blanco **alineado a la IZQUIERDA** (la home los tiene a la derecha): H2 + cita "(Snyder et al., 2013)" + CTA outline "Empezar a medir con precisión →". |
| 3 | `et_pb_section_3` | **Bloque compuesto con sub-nav de anclas** | 4265 | 5978 | mixto — ver desglose | UNA fila `et_pb_row_3 et_pb_row_1-4_3-4`: **col izq 1/4 sticky** (menú de anclas + 3 CTAs, ver BEHAVIORS §5) + **col der 3/4** con 8 bloques anclados: ver tabla siguiente. |
| 4 | `et_pb_section_4` | **Artículos y Guías** | 10243 | 764 | ♻️ **UltimosArticulos** | Mismo grid 3 tarjetas post (imagen, título, fecha: Sep 24 2020 / Jun 30 2022 / May 18 2021) + CTA sólido "Amplia tus conocimientos con nuestras guías →". Título distinto: "Artículos y Guías". |
| 5 | `et_pb_section_5` | **Preguntas frecuentes** | 11007 | 1454 | 🆕 NUEVO (FAQ acordeón) | Layout 1/4–3/4: título izq "Preguntas frecuentes"; der **19 × `et_pb_toggle.kunak-faq-item`** independientes (título + icono ⊕ derecha, hairline entre ítems, fondo con diagonal gris `recurso-k-fondo`). |
| F | `footer` TB | **Footer** | ~12461 | ~700 | ♻️ **Footer** (+ franja) | `footer-links` (5 columnas idénticas a la home) + `footer-legal` (copyright, social, idioma) + `footer-background` (franja foto puerto). |

### Desglose col. derecha de S3 (tops a 1045 px; ids = anclas del sub-nav)

| Ancla | Bloque | Top | Reutiliza / Nuevo | Contenido |
|-------|--------|----:|-------------------|-----------|
| `#benefits` | **Beneficios** | 4306 | 🆕 grid propio (≠ Beneficios home) | H2 + "Facilitamos la toma de decisiones…" + **grid 3×3** de icon-blurbs (icono lineal azul izq + título + párrafo): Instalación sencilla y rápida · Sistema de cartuchos · Precisión probada · Calibración sencilla · Plataforma cloud · Múltiples contaminantes · Totalmente autónomo · Datos en tiempo real · Sensores adicionales. |
| `#applications` | **Aplicaciones** | 5080 | ♻️ **SectoresCarousel** | MISMO shortcode `sectoresSwiper` (6 slides únicos ×2 loop, mismos sectores/copys/fotos que la home: Construcción, Minería, Investigación y consultoría, Urbano, Industria y olores, Puertos y Aeropuertos) pero **embebido en la columna 3/4** (no fullwidth) y paginación de guiones/píldoras. Bajo el carrusel: H3 azul "Facilitamos la toma de decisiones con datos ambientales precisos." + **banner guía** (foto peatones + card "Diseña tu proyecto de calidad del aire" + copy + CTA outline "Descargar ahora →" que abre **popup formulario**, ver BEHAVIORS §9). |
| `#software` | **Software** | 6086 | 🆕 texto (+capturas) | H2 + 4 párrafos (Kunak AIR Cloud, alarmas, API Rest, integraciones) + botón outline "Saber más →". |
| `#specifications` | **Especificaciones** | 6675 | 🆕 tabla specs | Tabla 2 columnas con bordes 1 px y esquinas exteriores redondeadas, 17 filas (Dimensiones/Peso 257×270×225 mm <3,5 kg · Carcasa · Temp./HR · IP65 · Batería Litio 26Ah · Alimentación · Autonomía · Consumo 0,08-1,2 W · Comunicaciones · GNSS · Sensores integrados · Conectores #1–#Wifi · Periodos muestreo/envío · SIM). Debajo: iconos **FCC · CE · RoHS**. |
| `#trials-test` | **Ensayos y pruebas** | 7653 | 🆕 galería-slider | H2 "Kunak AIR Pro: Estudio de campo de co-ubicación (completo)". **`et_pb_gallery` en modo slider** (`galeria`): 9 imágenes de gráficas (co_mexico.webp, NO_sweden.webp, SO₂_UK.webp…) dentro de un marco tipo tablet (card gris redondeada), flechas ‹ › al hover + **9 dots**. Debajo: "Resultado de las pruebas" — lista 2 col de chips (CO, NO, NO₂, O₃, SO₂, H₂S, CO₂, PM) + enlace "Estudio de campo en coubicación →" cada uno; y CTA sólido "¿Cómo asegura Kunak la mejor precisión? →". |
| `#case-studies` | **Casos de éxito** | 8368 | ♻️ **UltimosProyectos** | Mismas 3 tarjetas que la home (Nama Water Services/EDAR-PTAR, Valdemingómez/Olores, Virginia DEQ/Industria) + CTA outline "Ver todos los casos →". |
| `#power-packs` | **Paquetes de energía** | 8972 | ♻️ patrón **ProductosTabs** (`lista-contenido`) | Shortcode `producto-accesorios-power_packs` clase `lista-contenido kunak-shortcode`: lista izq 3 ítems (Panel solar · Cargadores para exteriores · Cargador para interiores) con ⊖/⊕ y `li-activo`; panel der card borde redondeado (imagen + título + descripción + "Ver más →"). |
| `#meteo-sensors` | **Sondas meteorológicas** | 9651 | ♻️ patrón **ProductosTabs** | Ídem con 6 ítems: Anemómetro Mecánico · Anemómetro Ultrasónico · Pluviómetro · Piranómetro · Termómetro de globo y bulbo húmedo (WBGT) · Sensor Ultravioleta-A. |

## Diferencias móvil (390 px)

- Header/hamburguesa/overlay = componente compartido (mobile-nav). La franja `cabecera` (foto puerto) queda visible ~40 px sobre el nav.
- Hero: todo apilado; logos validadores en 2 columnas; CTAs full-width; visor 360° debajo del texto.
- **Sub-nav de anclas: el menú `menu-anclas` se OCULTA (`display:none`)**; la columna sticky se queda solo con los 3 botones CTA → **barra sticky horizontal** bajo el header (banda gris `#f4f4f4`, botones en fila que se cortan por la izquierda en el sitio real — fiel al original) mientras se recorre S3.
- Paquetes de energía / Sondas: modo **acordeón** (los `.lista-contenido-item` duplicados dentro de cada `li` se expanden inline; el panel lateral desaparece) — mismo mecanismo dual que ProductosTabs home.
- Carrusel Aplicaciones: 1 slide por vista, swipe + dots.
- Tabla de especificaciones: misma tabla comprimida (labels estrechos, sin scroll horizontal).
- FAQ y Artículos: single column. Footer apilado single-column con badge ENS.

## Assets clave

- Header/footer bg: `2023/10/cabecera-puerto.jpg`, `2022/12/cabecera-puerto-1.jpg`.
- Watermark: `2022/12/recurso-k-fondo.svg`.
- 360°: `2023/03/kunak360_IMG_01.jpg` … `kunak360_IMG_35.jpg` (35 frames).
- Ficha técnica: `https://kunakair.com/doc/External/Kunak_AIR_Datasheet_ES.pdf`.
- Vídeo: YouTube `tuTfw6KIvd4` ("Kunak Air Pro - The most accurate air quality monitor").
- Gráficas ensayos: `co_mexico.webp`, `NO_sweden.webp`, `SO2_UK.webp`, … (9).
