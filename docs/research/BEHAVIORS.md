# BEHAVIORS.md — kunakair.com/es (home)

> Barrido de interacciones sobre `https://kunakair.com/es/` — 2026-07-22.
> Objetivo: identificar el **modelo de interacción** de cada zona (estático / click / scroll / tiempo)
> y las **transiciones observables** para que las specs de Fase 3 los capturen con precisión.

## 1. Runtime y librerías

- **jQuery 3.7.1** — motor de todos los listeners custom.
- **SwiperJS** — inicializada como `sectoresSwiper` en el carrusel de sectores.
- **Divi builtin animations** — ~~23 módulos con animaciones on-view~~ **CORRECCIÓN (2026-07-23, verificado en vivo para M7):** los 23 módulos (todos `<img>` de blurbs: features S2, validadores, awards, beneficios HazVisible, pilares Sostenibilidad) llevan `et-waypoint` + **`et_pb_animation_off`/`_off_tablet`/`_off_phone`** — la animación está **desactivada** en los 3 breakpoints. El critical CSS de Divi eliminó todas las reglas `.et-animated`/`.et_pb_animation_*` (en runtime `document.styleSheets` no contiene ninguna, verificado por CDP); los iconos están a `opacity: 1` desde el load en desktop y móvil, y el waypoint de `scripts.min.js` (offset `"100%"`) añade `et-animated` al entrar en viewport **sin ningún efecto visual** (animationName none, sin inline styles, opacity 1→1). **La home NO tiene animaciones de entrada** — el clon estático es el comportamiento fiel.
- **Cookiebot** — banner de consentimiento (`window.Cookiebot` presente, iframe `.CybotCookiebotHiddenIframe`).
- **NO se detectan**: `Lenis`, `LocomotiveScroll`, `GSAP`, `AOS`, `ScrollReveal`. Scroll es nativo del navegador (no smooth-scroll custom).
- Plugins WordPress extra activos: `3d-flip-book-client-locale-loader`, `snazzymaps` (probable render del mapa mundial), `dvmd-tm-module`, `txtcc-tooltip_js`.

## 2. Modelo de scroll global

- **Scroll nativo** en `<html>/<body>`. Sin `scroll-snap`, sin `overflow:hidden` en `html`, sin `will-change: scroll-position` custom, sin contenedores anidados.
- No hay parallax verdadero (no se observa velocidad diferencial de capas mientras se hace scroll — el hero usa una única imagen de fondo `cover` sobre la sección).
- Alto total = 11 538 px (aprox. 16 viewports desktop).

## 3. Barra de navegación — comportamiento sticky con cambio de tema

**Trigger:** aproximadamente `scrollY > 100–200 px` (umbral exacto controlado por listener jQuery de Divi/tema hijo `KunakAir`; activado usando la clase `fila-menu-principal-fixed` sobre `.fila-menu-principal`).

**Estado A — Top (scrollY ≈ 0):**
- Header `<header class="et-l--header">` = `position:absolute; top:0; height:225px`.
- Row 0 (utility): 41 px, `background: transparent`, textos blancos (Soporte, Blog, Contacto, idioma).
- Row 1 (`.fila-menu-principal`): 144 px, `position:relative`, `background: transparent`. Logo variante **blanco** (`SENSING ANYWHERE`). Enlaces del menú en blanco. Botón outline pill blanco `¿Cómo podemos ayudarte?`. Botón sólido azul `Descargar catálogo` desplazado por debajo del bloque.
- La sección hero se ve completa detrás del header (contraste con la imagen aérea oscura).

**Estado B — Sticky (scrollY ≳ 200):**
- Row 1 pasa a `position:fixed; top:0; z-index:1000; background: rgba(255,255,255,0.576); box-shadow: 0 0 20px rgba(0,0,0,0.1); height: 127px`.
- Row 0 (utility) permanece `display:block` pero se aleja con la página (queda por encima del área visible; **no** se re-fija).
- Logo cambia a variante **azul**; enlaces del menú pasan a gris/azul oscuro.
- El botón `¿Cómo podemos ayudarte?` sigue en su sitio con estilo outline.
- Botón `Descargar catálogo` continúa visible sobre el fondo blanco translúcido.

**Transición registrada en Row 1:** `transition: background-color 0.3s` (sólo el color de fondo se anima; el cambio de `position` y las clases de logo/enlaces son instantáneas al alcanzar el umbral).

**Implementación esperada del clon:** listener `scroll` con throttling (rAF), toggle de clase sobre el contenedor del nav en umbral fijo; alternar tokens de color mediante variantes de logo (dos `<img>` o `mask-image`) y variables CSS de color de texto. No hay `backdrop-filter`.

## 4. Botón scroll-to-top

- Elemento: `span.et_pb_scroll_top.et-pb-icon`.
- `position: fixed; bottom: 125px; right: 0; background: rgba(0,0,0,0.4); color: #fff; z-index: 99999`.
- Aparece visible desde antes del hero (visibility:visible incluso a scrollY 0, pero pantalla completa lo cubre); en la práctica sólo es útil cuando ya se ha bajado.
- Al hacer click: scroll suave a `top`.

## 5. Sección Hero (`et_pb_section_0`) — estática con CTAs

- **Modelo:** estático (no vídeo, no autoplay).
- Fondo: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.47)), url(imagen-banner-principal-2-1-1.webp)` con `background-size: cover, cover` y `padding: 180px 0 0`.
- H1 visualmente oculto para SEO (`Monitoreo de la calidad del aire`).
- Enlace `Descubre cómo funciona` apunta a `#video` (anchor probablemente a un lightbox/reproductor situado más abajo o abierto por lightbox).
- Enlace `Catálogo` va a `/es/descarga-catalogo/`.
- Logos EPA / MCERTS / AIRLAB actúan como enlaces a PDFs (`USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf`, `Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf`, `AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf`).

## 6. Trust bar (`et_pb_section_1`) — carrusel automático de logos

- **Modelo:** driven-by-time (probablemente `setInterval` o transición CSS con `animation` sobre una lista horizontal).
- Al recargar / re-scroll se observaron dos ciclos distintos de logos:
  - Ciclo 1: Repsol · Ricardo · Rio Tinto · APM Terminals · BHP · Iberia.
  - Ciclo 2: Dunkerque Port · Lifeco · Acoem · Vito · Port of Zeebrugge · WHO.
- Transición aparente entre ciclos: **cross-fade** o slide horizontal (no confirmé el mecanismo exacto, se recomienda inspeccionar `.et_pb_row` del bloque para ver keyframes CSS o setter jQuery). Cadencia estimada: cada varios segundos.

## 7. Sección de contenido largo (`et_pb_section_2`) — estático con reveal on-view

- **Modelo:** estático, con animaciones Divi builtin al hacer scroll (fade / slide-up) en el momento en que cada módulo entra al viewport.
- Sin sticky, sin parallax, sin snap.
- Enlaces en línea (CEN/TS 17660, EPA/…, Directiva) usan color azul y underline en hover (comportamiento estándar Divi, no verificado en detalle).
- Recuadro azul destacado con borde redondeado y padding generoso.
- Los cinco iconos+etiqueta ("Datos fiables en tiempo real", etc.) son fila de módulos Divi con animación de entrada probable `fade`.
- Sub-bloque "Solución validada" contiene una **grid estática** de 6 logos (EPA, MCERTS, AQ-SPEC, AirParif, CDMX Medio Ambiente, Ricardo) — sin carrusel.
- Sub-bloque "Reconocimientos" muestra 3 **tarjetas fijas** (no carrusel).

## 8. Sección intro Sectores (`et_pb_section_3`) — estático

- Copy + títulos + instrucción "Desliza las imágenes…" apuntando al carrusel de la sección siguiente.

## 9. Carrusel Sectores (`et_pb_section_4`) — **SwiperJS driven-by-click + gesture**

- **Modelo:** **click / gesture-driven** (Swiper por defecto — drag horizontal + click en dots).
- Container: `.et_pb_module.et_pb_fullwidth_code.et_pb_fullwidth_code_0` → `.swiper.sectoresSwiper.kunak-shortcode.swiper-initialized.swiper-horizontal.swiper-pointer-events`.
- **12 `.swiper-slide` en DOM** con **6 slides únicos** (loop activado en Swiper duplica slides).
- **6 puntos de paginación** clicables (`.swiper-pagination-bullet`). Al cargar, el segundo dot aparece activo (offset por el loop).
- Cada tarjeta: **imagen de fondo** (`background-image` con foto del sector) + **icono lineal centrado** (SVG outline blanco/gris) + **etiqueta de sector** en la esquina inferior izquierda (blanco). Al hover / active se revelan **descripción + CTA `Ver más →`**.
- Sectores identificados por texto visible: Minería, Investigación y consultoría, Urbano, Industria, más otros dos por inferir en las tarjetas cortadas (probables: Construcción, Puertos y aeropuertos según los links del footer).
- **No hay autoplay observado** en la ventana capturada; sin embargo puede haberlo con delay largo — validar en Fase 3.
- Sin flechas laterales visibles; navegación por dots + drag/swipe.

## 10. CTA "¿Estás inmerso en un proyecto…?" (`et_pb_section_6`) — estático

- Fondo foto + overlay oscuro, texto blanco alineado a la derecha, botón outline pill "Podemos ayudarte →".
- Sin animaciones activas.

## 11. Bloque compuesto `et_pb_section_7` — combinación de estáticos, slider e interactive tabs

Este bloque es el **más denso** de la home. Contiene:

### 11.a Presencia mundial + mapa
- **Modelo:** estático (mapa con países coloreados en azul renderizado como una única imagen SVG/PNG; posible SVG interactivo pero no verificado). Sin tooltips observados.

### 11.b CTA "¿Cómo podemos ayudarte?"
- Botón pill sólido — link a formulario/contacto.

### 11.c Testimonios
- **Modelo:** **click-driven slider** con **flechas `‹` y `›`** a izquierda y derecha (visibles en la captura).
- Muestra: foto circular (avatar), cita larga, nombre + cargo debajo.
- Testimonio visible: **Jérôme De Waele — Director General, AIRCOAN** ("Valoramos especialmente la escalabilidad y fiabilidad…").
- Probable Swiper adicional o slider Divi builtin (`et_pb_slider`). Necesita verificación en Fase 3 (contar slides, transición fade vs slide, autoplay). No se detectó dots debajo.

### 11.d "Haz visible la contaminación" + destacado azul
- Dos columnas de texto + botón CTA. Estático.
- Cita destacada en azul: "Elige los contaminantes a medir en tu proyecto…".

### 11.e Beneficios
- **Grid de 3 iconos + labels**: Mantenimiento reducido / Calibración remota / Software avanzado. Estático.
- Botón sólido `Solicita más información →`.

### 11.f Nuestros productos — **acordeón/tabs custom (jQuery + span `li-activo`)**
- **Modelo:** **click-driven** (tabs verticales controlados vía jQuery custom del tema hijo `KunakAir`).
- Columna izquierda con **4 items** en `<span>`:
  1. **AIR Pro** — Monitor de calidad de aire para profesionales (por defecto marcado con clase `li-activo`, texto en **azul**, subtítulo activo).
  2. **AIR Lite** — Estación de monitoreo de calidad del aire.
  3. **AIR Cloud** — Software de calidad del aire.
  4. **Kunak API** — Fácil integración de datos.
- Cada item muestra un icono `+` a la derecha (o `−` si está activo).
- Al hacer click en un item, se le añade la clase `li-activo` (y se quita a los demás), el icono cambia a `−`, y el **panel derecho** se sustituye por la imagen + descripción + bullets + CTA del producto correspondiente. No hay animación slide/fade observada — es un cambio inmediato (a validar en Fase 3).
- Panel derecho (para AIR Pro por defecto): imagen del sensor + título + descripción + subtítulo "BASADA EN SENSORES | LA MAYOR…" + bullet list ("Sistema de cartuchos", "Totalmente autónomo", "Datos en tiempo real", "Precisión probada") + botón outline "Ver más →" con enlace a la ficha del producto.
- Bajo el bloque de productos, botón sólido `Cuéntanos tus necesidades →`.

## 12. Banner newsletter aviones (`et_pb_section_8`) — estático

- Fondo gris muy claro con ilustraciones SVG de aviones de papel siguiendo trayectorias punteadas azules — parece **decoración estática** (no animación observada).
- Titular grande "Innovación en calidad del aire a 1 clic".
- Botón outline pill blanco `¡Me apunto! →` (link probablemente a formulario de suscripción).

## 13. Últimos artículos (`et_pb_section_9`) — grid estático de posts

- 3 tarjetas visibles con imagen + título truncado + fecha (formato `Jul 21, 2026`).
- Probable módulo `et_pb_blog` de Divi filtrado por últimos 3.
- Hover posible sobre tarjeta (elevación / cambio de color de título) — no verificado.
- CTA `Amplia tus conocimientos con nuestras guías →` bottom-right.

## 14. Últimos proyectos (`et_pb_section_10`) — grid estático de casos

- 3 tarjetas con: **imagen de fondo** + label pequeño `Sector: <enlace>` + título del cliente + descripción de una frase.
- Vistos: EDAR/PTAR (Nama Water Services, Omán), Olores (Vertedero de Valdemingómez), Industria (Virginia DEQ).
- CTA outline pill `Ver todos los casos de éxito →`.

## 15. CTA "¿Te preocupa la calidad del aire que respiras?" (`et_pb_section_11`) — estático

- Fondo azul oscuro con foto de barco atracado, texto blanco.

## 16. Comprometidos con la sostenibilidad (`et_pb_section_12`) — estático

- 2 columnas: título + texto/iconos.
- 3 columnas de icono + label con explicación (ecodiseño, reducción de residuos, eficiencia energética).
- Iconos parecen SVG lineal delgado.

## 17. Footer — estático

- 5 columnas de enlaces (PRODUCTOS, SECTORES, EMPRESA, RECURSOS, CERTIFICACIONES).
- CTA `¡Suscríbete! →` en la columna EMPRESA.
- Barra inferior con copyright, iconos sociales (LinkedIn, X, Instagram, Facebook, YouTube) y selector de idioma.
- Sin animaciones.

## 18. Hover states (barrido rápido)

- **Enlaces de nav**: color cambia sobre hover (blanco → azul primario en versión estática; en versión sticky se oscurecen). Underline no observado.
- **Botones sólidos azules (`Descargar catálogo`, etc.)**: probable transición de brillo/tono. Todos tienen forma de píldora con flecha `→` que probablemente se desplaza a la derecha en hover (patrón Divi habitual).
- **Botones outline pill**: relleno progresivo o cambio de color de fondo — a verificar.
- **Tarjetas de sectores en carrusel**: revelan descripción + CTA al hover (posible cambio de opacidad de overlay).
- **Tarjetas de blog / proyectos**: probable elevación (`box-shadow`) o cambio de escala 1.02 — a validar en Fase 3.

## 19. Responsive (breakpoints detectados)

Breakpoints presentes en las hojas de estilo cargadas (Divi + tema hijo):

- `320px`, `479px/480px`, `540px`, `576px`, `601px`, `667px`, **`767px/768px`**, `850px`, `869px/870px`, `900px`, **`979px/980px/981px`**, `999px`, `1000px/1023px/1024px`, `1045px`, `1080px`, `1100px/1110px`, `1200px`, `1254px/1255px`, `1279px/1280px`, `1379px/1380px`, `1405px`, `1500px`, `1725px`, `1800px`.

**Familias principales usadas por Divi:**
- `max-width: 980px` — cambio de escritorio a **tablet** (columnas empiezan a apilarse).
- `max-width: 767px` — **mobile** (todo se apila).
- `max-width: 479px` — mobile chico.

**Elementos móviles confirmados en el DOM (siempre presentes, activos por CSS):**
- `.mobile_nav.closed` — botón hamburguesa Divi (visible a partir de ≤980 px).
- `.et_mobile_menu` — desplegable móvil con submenús (4 items raíz).

**Comportamientos móviles esperados (por convención Divi + revisión CSS):**
- **Header:** el menú horizontal se sustituye por un botón hamburguesa; el logo se reduce; el CTA `Descargar catálogo` puede pasar a icono o desaparecer del bar principal.
- **Filas de contenido:** las columnas 1/2 + 1/2 y 1/4 + 3/4 pasan a 100 % apilado. El bloque compuesto (`et_pb_section_7`) se vuelve un long-scroll natural (mapa arriba, testimonio en columna, productos en tabs apilados o en accordion vertical).
- **Carrusel Sectores:** Swiper adapta el número de slides por vista (probablemente 1 por vista a ≤768 px), mantiene drag/swipe táctil.
- **Footer:** 5 columnas → apiladas.

> Nota: no se pudieron tomar capturas reales a 390 px porque la ventana Chrome no baja de ~500 px en Windows con la extensión activa. En Fase 3 conviene usar Chrome DevTools o Puppeteer/Playwright para capturas móviles fieles.

## 19-bis. Addendum Fase 3a (2026-07-22) — puntos resueltos

- **§11.f CORREGIDO — "Nuestros productos" es HOVER-driven, no click**: `init.js` del tema hace `$("#lista-soluciones li span").on("mouseenter", toggleActiveClasses)`. Además son **5 items** (falta "Cartuchos inteligentes" en el listado original): AIR Pro, AIR Lite, Cartuchos inteligentes, AIR Cloud, Kunak API. En móvil (<768) actúa como acordeón con scroll animado. Cambio de panel instantáneo (display none→flex). Ver `components/productos-tabs.spec.md`.
- **Punto abierto #1 RESUELTO — umbral del sticky nav**: `init.js` guarda `posicionInicial = $('.fila-menu-principal').offset().top` (~41px, la altura de la utility bar). `scroll >= posicionInicial` añade `fila-menu-principal-fixed`; `scroll < posicionInicial + 10` la quita.
- **§15 confirmado**: la CTA "¿Te preocupa…" es un `et_pb_fullwidth_slider` con **1 solo slide** — estático, sin controles. Overlay `rgba(0,0,0,0.33)` + `background-blend-mode: multiply`.
- **§12 confirmado**: el banner newsletter usa `banner-suscripcion.svg` + `rgba(0,0,0,0.45)` con `blend-mode: multiply`; el botón es un enlace ofuscado en base64 → `/es/suscribete/`.
- **Hover de tarjetas (blog y casos)**: imagen `scale(1.1)` con `transition: all .5s`; títulos y links de sector → azul `#0075C9`.
- **Footer**: dropdown de idioma abre hacia ARRIBA (`top:-89px`); links hover azul; primera cabecera de columna (PRODUCTOS) en azul, el resto en #333.
- **§10 confirmado**: la CTA "¿Estás inmerso…?" (sección 6) es también un `et_pb_fullwidth_slider` de **1 slide** — overlay `rgba(0,0,0,0.33)` + `blend-mode: multiply` sobre `people-city-urban.jpg`. Gemela de la sección 11.
- **§11.a confirmado**: el mapa de "Presencia mundial" es una única `<img>` (`world.svg`, ~786×405) — sin interactividad. El CTA "¿Cómo podemos ayudarte?" va DEBAJO del texto en la col 1/3 izquierda (no bajo el mapa).
- **§11.d CORREGIDO**: el "destacado azul" ('Elige los contaminantes…') NO es un recuadro — es un **H2 37px/300 con span color #0075C9**, sin fondo ni borde. Los subtítulos "Simplifica tu operativa diaria. / Toma mejores decisiones." son otros dos H2 37px azules.
- **§11.e CORREGIDO — Beneficios son 6, no 3**: Sistema de cartuchos, Múltiples contaminantes, Flexible y escalable, Mantenimiento reducido, Calibración remota, Software avanzado (grid 3×2, iconos 50×50, labels 18px/300 centrados). El botón "Solicita más información" tiene `href="#"` en el original (enlace muerto — mapear a `/es/contacto/` en el clon).

## 20. Puntos abiertos / a validar en Fase 3

1. **Umbral exacto** del sticky nav (asumido 100–200 px; usar `IntersectionObserver` sobre un sentinel o listener con umbral fijo — comprobar el JS de Divi/tema hijo para el valor real).
2. **Autoplay** del Swiper de sectores y **duración** del delay entre slides.
3. **Testimonios**: número total de slides, mecanismo (Swiper adicional vs `et_pb_slider`), autoplay, tipo de transición.
4. **Trust bar** de logos: si es carrusel Swiper, keyframes CSS o simple grid oculto/mostrado alternativamente — determinar mecanismo real (posible librería `SnazzyMaps`/`dvmd-tm-module` involucrada, ver scripts).
5. **Animaciones on-view** de Divi: por defecto `fade`, pero cada módulo puede tener valores propios (dirección, duración, delay); extraer clase `et_pb_animation_*` por módulo.
6. **Estados hover** de tarjetas y botones (medir cambios de `transform`, `box-shadow`, `background-color`).
7. **Vídeo del hero**: `#video` como anchor — verificar destino (¿lightbox con `<video>`? ¿un modal Divi?).
8. **Cookiebot** (banner de consentimiento) — comportamiento inicial: aparece full-width bottom / modal centrado. Definir textos y colores (o remplazarlo por una implementación propia adecuada al clon).
