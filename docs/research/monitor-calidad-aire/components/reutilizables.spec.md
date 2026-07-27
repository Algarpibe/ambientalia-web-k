# reutilizables.spec.md — Los 5 ajustes de REUSE_NOTES (S2 · #applications · #case-studies · S4 · #power-packs)

> Recon 2026-07-26: HTML de la página descargado y citado verbatim (snapshot 19:04) + getComputedStyle en vivo
> @1600 (equivalencias @1265 anotadas) + **CSS con contexto @media parseado determinista** del inline de Divi y de
> `KunakAir/style.css` (la pestaña quedó oculta y el iframe 390 no cargó: los valores móviles salen del CSS
> canónico, no de computed — así se marca donde aplica).
> Completa (y corrige) `REUSE_NOTES.md`: los datos de artículos y del CTA de casos de aquel documento estaban
> desactualizados; manda lo de aquí.

---

## 1 · S2 — CtaBanner "No se puede mejorar…" (variante align-left)

`et_pb_section_2 > et_pb_fullwidth_slider_0` — slider de **1 slide** (`et_pb_slide_0 et_pb_bg_layout_dark`),
sin flechas / dots / autoplay (verificado en vivo). Se replica como banner estático con `CtaBanner`.

### Contenido (verbatim)

- **H3 título** (¡es un enlace!): `No se puede mejorar  lo que no se puede medir  de forma precisa y fiable`
  — con **doble espacio** tras "mejorar" y tras "medir" (sic, así viene en el HTML; sin `<br>`).
  `<a href="https://kunakair.com/es/contacto/">` blanco, sin subrayado.
- **Párrafo** (`et_pb_slide_content`): `La calidad de los datos es una cuestión clave; los datos de calidad deficiente o desconocida son menos útiles que la ausencia de datos ya que pueden conducir a decisiones equivocadas. (Snyder et al., 2013)` — la cita va inline al final, sin cursiva ni estilo propio.
- **Botón**: `Empezar a medir con precisión` → `https://kunakair.com/es/contacto/`.

### Asset

- **Fondo**: `uploads/2023/02/hyper-local-scale-data.jpg` (foto ciclistas urbanos) — **NUEVO**, descargar.
  `background-blend-mode: multiply` + `background-color: rgba(0,0,0,0.33)`, cover center (= patrón CtaBanner).

### Estilos (computed @1600 / CSS canónico)

| Cosa | Valor |
|---|---|
| Slide | h 393px @1600; padding 0; bg multiply como arriba |
| `.et_pb_slide_description` | width 1380 (container Divi), **`padding: 5% 31% 5% 0`** (global), `text-align: left` |
| — ≤980 | `padding-right: 0%; padding-left: 0px` |
| — ≤767 | `padding-top: 10%; padding-bottom: 15%` |
| Título | **45px / lh 1.3em w300 blanco ls −0.5**, pb 10px; **≤767: 27px** |
| Párrafo | **20px / 32px (lh 1.6em) w400 blanco** |
| Botón | ⚠️ **outline #333** (¡NO blanco!): color #333, borde 1px #333, bg transparente, radius 30, padding 7.5/40.5/9/22.5, 15px w700, mt 20px — computed en vivo. El módulo slider NO lleva `et_pb_bg_layout_dark` (solo el slide), así que la regla del botón blanco del tema (`.et_pb_slider.et_pb_bg_layout_dark .et_pb_button`) no aplica: queda el restyle global = **`OutlineButton` del clon tal cual, sobre la foto** |

### Delta vs `CtaBanner` del clon

1. **Alineación IZQUIERDA**: el clon usa `md:pl-[49%]` (texto a la derecha) → aquí `pr-[31%]` y pl 0 (y pr 0 ≤980).
2. **Botón**: el clon pinta botón blanco con bg `rgba(0,0,0,.15)` → aquí variante `OutlineButton` #333.
3. **Párrafo bajo el H2**: el clon no tiene slot de párrafo → prop nueva (`body?`) 20px/32 blanco.
4. **Título enlazado** a `/es/contacto/` (los banners de la home no enlazan el título).
→ Props sugeridas: `align?: 'left'|'right'`, `body?: string`, `buttonVariant?: 'light'|'dark'`, `headingHref?: string`.
El asset placeholder actual (`people-city-urban.jpg`) pasa a su sitio real: el banner-guía de §2.

---

## 2 · #applications — Aplicaciones (S3 · col. derecha)

Tres piezas: carrusel embebido + frase azul + banner-guía con popup.

### 2a · SectoresCarousel — variante embebida

- Ancla: `id="applications"` en el **módulo del título** (`et_pb_text_18 > h2 "Aplicaciones"`).
  (El tema añade por JS ids-slug a los h2 en runtime — `aplicaciones`, `casos-de-exito`… — no replicar.)
- **H2 "Aplicaciones": 37px/37px w300 #333 ls −0.5 pb 10px** (escala S3, no la de 44px).
- Mismo shortcode `sectoresSwiper` y las **mismas 6 slides que la home** (mismos títulos, fotos 1024×546,
  iconos SVG, descripciones y hrefs — verificado slide a slide; ya están en `sectors.ts` y en `public/`).
- **Parámetros Swiper leídos de la instancia viva**: `loop: true`, `autoplay 5000ms`, breakpoints
  `≥1500: 4/30 · ≥990: 3/25 · ≥640: 2/20 · ≥480: 1/10` (slidesPerView/spaceBetween).
- **Overrides de ESTA página** (por `body.single-solutions`, CSS canónico del tema):

```css
/* global */
.single-solutions .sectoresSwiper .swiper-slide .sector-imagen {
    justify-content: flex-start; padding-top: 10%; padding-bottom: 0; }
.single-solutions .sector-content .sector-descripcion { font-size: 1rem }
#applications .sectoresSwiper, #aplicaciones .sectoresSwiper { padding-inline-start: 0 !important; }
/* ≥981 */
.single-solutions .sectoresSwiper .swiper-slide { height: 400px !important; }   /* home: 500px */
.single-solutions .sectoresSwiper .swiper-slide .sector-imagen { padding-top: 30%; }
```

  Es decir: **slides de 400px** (no 500), icono/título arrancando al 30% de altura, descripción 1rem, y el
  padding lateral inicial del swiper (`padding: 0 7vw 3rem`) **suprimido solo a la izquierda** (queda pr 7vw +
  pb 3rem). Computed @1600: contenedor 931px (col 3/4), slide 182px, imagen 400px, pb 48px.
- **Bullets píldora** (computed): **32×7px, radius 5px**, margen 0 4px; inactivo `border 1px solid #000` +
  `opacity: .2` (bg transparente); **activo `background: var(--azul)` + border azul, opacity 1**; paginación
  absoluta `bottom: 10px` centrada. (Vars swiper del tema: `--swiper-pagination-bullet-size: 2rem` de ancho,
  alto 7px.) Si el clon de la home ya pinta esto, no hay delta; si pinta puntos, esta es la referencia.

### 2b · Frase azul

`et_pb_text_19`: `<p><span style="color:#0075c9">Facilitamos la toma de decisiones con datos ambientales precisos.</span></p>`
— computed: **37px/37px (lh 1em) w300 #0075C9 ls −0.5**, márgenes 20px arriba/abajo, ancho col (931).
(No es h3: es un `<p><span>` estilado. En el clon puede ser un p con esos estilos.)

### 2c · Banner-guía "Diseña tu proyecto de calidad del aire" (et_pb_cta_0)

- Módulo promo centrado, **dentro de la col 3/4** (931×252 @1600), `margin-bottom 34.8px`.
- **Fondo: `uploads/2023/02/people-city-urban.jpg` (YA en el clon)** + multiply `rgba(0,0,0,0.33)`, cover.
- `padding: 40px 60px`, `text-align: center`; descripción pb 20px.
- **H4**: `Diseña tu proyecto de calidad del aire` — **37px/37px w600 blanco ls −0.5 pb 10px**.
- **P**: `Descarga gratis la guía que hemos diseñado con los aspectos clave que debes tener en cuenta a la hora de diseñar tu proyecto de calidad del aire.` — **18px/30.6 w400 blanco**.
- **Botón**: `Descargar ahora` → `#disenar-proyecto-form-esp` (abre popup) — **blanco outline con
  `bg rgba(0,0,0,0.15)`** = exactamente el botón del `CtaBanner` del clon (aquí el promo SÍ es `bg_layout_dark`).

### 2d · Popup "disenar-proyecto-form-esp" (Popups for Divi)

Decisión ya tomada (REUSE_NOTES): **replicar visualmente, submit → `/es/contacto/`, sin backend** (sin
reCAPTCHA ni ActiveCampaign).

**Estructura/estilos (computed con el popup abierto):**
- Overlay fijo `rgba(0,0,0,0.55)` z 1000001; wrapper fijo z 1000002; se abre al click del CTA
  (clase `is-open`), cierra con `.da-close` o click en overlay.
- **Caja**: `et_pb_section_8.popup.dark` — **max-width 400px, radius 15, bg #0075C9, padding 0,
  overflow hidden**; centrada, top 10px; 400×769 @1600×789 (prácticamente el alto del viewport).
- **Cierre**: `.da-close` 30×30 arriba-dcha, "×" 32px color #eee.
- Fila interior: `padding: 35px` (sobre el azul).
- **Intro** (`et_pb_text_36`, **bg BLANCO**, pb 10px del módulo): 2 párrafos — `Para descargar la guía, rellena el siguiente formulario.` / `Te enviaremos un email con el enlace al documento.` — 16px/24 (lh 1.5) #333.
- **Formulario** (`et_pb_code_0`, **bg BLANCO**) — campos verbatim del form de ActiveCampaign (`_form_106_`):

| Campo | Tipo | Label |
|---|---|---|
| fullname | text | `Nombre y Apellidos*` |
| email | text | `Email de trabajo*` |
| field[2] | text | `Empresa*` |
| field[27] | select | `País*` (lista completa de países en inglés, "Afghanistan"…) |
| field[51] | select | `Sector*` — opciones: Urbano · Minería · Petróleo y Gas · Aguas residuales · Otras industrias · Puertos y Aeropuertos · Construcción · Investigación y consultoría · Obras y Demoliciones · Otros |
| (reCAPTCHA) | — | omitir en el clon |
| field[15][] | fieldset 2 checkbox | legend `Política de Privacidad y Suscripción`; `Acepto los términos y condiciones` / `Acepto recibir correos con contenido de Kunak` |
| submit | button | **`DESCARGAR`** |

- Estilos form: labels **14px w700 #5e666f mb 5px**; inputs h ~30px, `border 1px #979797`, radius 4,
  **bg #f3f3f3**, 14px, padding 6; submit **bg #0075C9 blanco radius 6 padding 14 14px** (ancho contenido).
- En el clon: `<form>` sin action real; al enviar, `location.href = CONTACT_HREF`.

---

## 3 · #case-studies — Casos de éxito

- Ancla `id="case-studies"` (el original la lleva **duplicada** en los módulos del título `et_pb_text_26` y
  del grid `et_pb_text_27` — ids duplicados, no replicar; el clon ya usa un único wrapper).
- **H2 `Casos de éxito` — 37px/37px w300 #333 pb 10px** (escala S3).
- **Las 3 tarjetas son EXACTAMENTE las de `projects.ts`** (verificado artículo a artículo: Nama Water /
  Valdemingómez / Virginia DEQ, mismos títulos, sectores, imágenes 2026/05 y hrefs — assets ya en el clon).
  `UltimosProyectos` se reusa con datos intactos.
- **CTA**: **`Ver todos los casos`** → `https://kunakair.com/es/casos-de-exito/` — outline #333 estándar
  (=`OutlineButton`), wrapper SIN clase de alineación (`text-align: start` → **izquierda**, no centrado como
  la home). ≠ home: la home dice "Ver todos los casos de éxito" y va centrado.
- Grid dentro de la col 3/4: tarjetas ≈284px @1600 (3 por fila, se mantiene 3-up). Imagen tarjeta h ≈191px.

### Delta vs `UltimosProyectos` del clon

Título (`Casos de éxito`, escala 37), CTA (texto, href igual, alineación izquierda) y contenedor (dentro de
col 3/4, sin sección propia). → props `title?`, `ctaLabel?`, `ctaAlign?`, `embedded?`.

---

## 4 · S4 — Artículos y Guías (UltimosArticulos)

⚠️ **Los 3 posts son ALEATORIOS por carga** (blog "relacionados" con orden aleatorio). Evidencia: 4 sets
distintos en 5 cargas el 2026-07-26 (recon 23-jul: deporte-2020/AIR-Lite-2022/móviles-2021 · snapshot 19:04:
los 3 de abajo · DOM vivo 19:5x: minería-2023/aeropuertos-2024/fertilizantes-2024 · curl 20:0x:
móviles-2021/acero/sensores). **Decisión: congelar el set del snapshot** (es el capturado verbatim completo):

| # | Título (verbatim) | Fecha | Imagen | href |
|---|---|---|---|---|
| 1 | Running for Clean Air: midiendo el impacto de la calidad del aire en el deporte | Feb 28, 2025 | `uploads/2025/02/Control-de-la-contaminacion-del-aire-en-los-JJOO-de-Paris-2024-Kunak-1024x683.jpg` (1024×683) | `/es/running-for-clean-air/` |
| 2 | Detectores de calidad del aire y movilidad, ¿qué nos cuentan los sistemas de monitorización? | Nov 4, 2020 | `uploads/2020/11/detectores-de-calidad-del-aire-trafico-coronavirus.jpg` (888×500) | `/es/detectores-calidad-aire-movilidad/` |
| 3 | ¿Cómo afecta la calidad del aire al rendimiento de los atletas? | Nov 29, 2018 | `uploads/2018/11/Kunak-AIR-medira-la-calidad-del-aire-para-analizar-el-rendimiento-de-los-athletas-para-la-IAAF.jpg` (800×458) | `/es/hasta-que-punto-la-calidad-del-aire-afecta-el-rendimiento-de-los-atletas/` |

(Corrige la lista de REUSE_NOTES §4 — era otro sorteo del mismo módulo.)

- **Título de sección: `Artículos y Guías`** — 44px/55 w300 (sección a ancho completo, fuera de la col 3/4;
  = escala `SectionTitle` del clon). Sección sin watermark (`et_pb_section_4`, bg none).
- Tarjetas: 395px @1600 (3-up en container 1380), título 20px/27 w400 #333, meta 13.5px.
  = layout actual de `UltimosArticulos`; **solo cambian título de sección y los 3 posts** (CTA idéntico:
  `Amplia tus conocimientos con nuestras guías` → `https://kunakair.com/es/recursos/guias/`, azul, alineado dcha).

### Delta vs clon

`UltimosArticulos` lee `ARTICLES` (posts de la home) y trae título fijo "Últimos artículos" → props
`title?`, `posts?`. Las 3 imágenes son **NUEVAS** (descargar).

---

## 5 · #power-packs — Paquetes de energía

- Ancla `id="power-packs"` en el módulo del título (`et_pb_text_28 > h2`).
- **H2 `Paquetes de energía` — 37px/37px w300 #333 ls −0.5 pb 10px**; módulo con mb 34.8px @1600.
- Shortcode `#producto-accesorios-power_packs.lista-contenido.kunak-shortcode` — **mismo patrón/estilos que
  sondas** (labels 22px/1.2 w400, inactivo op .3, activo azul ⊖, card 1px #777 radius 10 padding 30 —
  computed verificado idéntico: card 559×356 @ col 931, h3 panel 32px/32 w300). Sin subtítulos `strong`.
  → **`<ListaContenido items={POWER_PACKS} />`** tal cual; cierra el TODO de datos de la home que hoy
  muestra `PRODUCTS_TABS`.

### Los 3 ítems (verbatim)

| # | `data-id` | Label | Intro (verbatim) | Imagen (`/uploads/2022/12/…`) | href `Ver más` |
|---|---|---|---|---|---|
| 1 | `panel-solar` (activo inicial) | Panel solar | El panel solar monocristalino de alta eficiencia de 6,3 voltios es robusto, resistente al agua (IP67) y ha sido diseñado para un uso prolongado en exteriores en cualquier entorno. | `kunak_IMG_0017-300x300-2-300x300.jpg` (300×300) | `/es/accesorios/#panel-solar` |
| 2 | `cargador-para-exteriores` | **Cargadores para exteriores** (label plural, data-id singular — sic) | Pequeño, ligero e impermeable y ha sido diseñado para un uso prolongado al aire libre en cualquier entorno. Para utilizar cuando las estaciones Kunak AIR vayan a instalarse en el exterior. | `kunak_IMG_0015-300x300-1-300x300.jpg` (300×300) | `/es/accesorios/#cargador-para-exteriores` |
| 3 | `cargador-para-interiores` | Cargador para interiores | Se dispone de un cargador de interior con enchufes globales para su comprobación y verificación. | `kunak-air-indoor-charger-300x300.jpg` (300×300; alt "Kunak AIR indoor charger") | `/es/accesorios/#cargador-para-interiores` |

---

## Assets NUEVOS a descargar (7)

| Asset | URL origen | Para |
|---|---|---|
| Ciclistas (S2) | `https://kunakair.com/wp-content/uploads/2023/02/hyper-local-scale-data.jpg` | §1 |
| JJOO París | `https://kunakair.com/wp-content/uploads/2025/02/Control-de-la-contaminacion-del-aire-en-los-JJOO-de-Paris-2024-Kunak-1024x683.jpg` | §4 |
| Detectores tráfico | `https://kunakair.com/wp-content/uploads/2020/11/detectores-de-calidad-del-aire-trafico-coronavirus.jpg` | §4 |
| Atletas IAAF | `https://kunakair.com/wp-content/uploads/2018/11/Kunak-AIR-medira-la-calidad-del-aire-para-analizar-el-rendimiento-de-los-athletas-para-la-IAAF.jpg` | §4 |
| Panel solar | `https://kunakair.com/wp-content/uploads/2022/12/kunak_IMG_0017-300x300-2-300x300.jpg` | §5 |
| Cargador ext. | `https://kunakair.com/wp-content/uploads/2022/12/kunak_IMG_0015-300x300-1-300x300.jpg` | §5 |
| Cargador int. | `https://kunakair.com/wp-content/uploads/2022/12/kunak-air-indoor-charger-300x300.jpg` | §5 |

Ya en el clon: `people-city-urban.jpg` (§2c), imágenes/iconos de los 6 sectores (§2a), fotos 2026/05 de los
3 casos (§3), iconos ⊕/⊖.

## Datos → `monitor.ts` (build)

- `POWER_PACKS: AccesorioItem[]` (3 ítems §5).
- `MONITOR_ARTICLES: BlogPost[]` (3 posts §4) — mismo shape que `ARTICLES`.
- `S2_BANNER` (heading con dobles espacios, body con la cita, hrefs) si se prefiere a props inline.
- Campos del popup (labels/orden §2d) — const local del componente popup; países: usar lista corta o la
  completa (decisión de build; el original la trae entera en inglés).
