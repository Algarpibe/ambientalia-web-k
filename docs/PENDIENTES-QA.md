# Pendientes de QA — clon kunakair.com/es

> Estado tras la Fase 5 (QA visual) del 2026-07-22, actualizado el 2026-07-23
> tras cerrar A1 y A2. Comparación por capturas CDP full-page (viewport real
> 1440×900 → ancho útil 1418px; móvil emulado 390×844) entre
> `https://kunakair.com/es/` y `http://localhost:3000/`.
> Alturas de referencia (2026-07-23, tras M1+M2+M3): original desktop
> **11863px** / clon **11848px** (−15); original móvil **19221px** / clon
> **19208px** (−13). No quedan deltas móviles por sección fuera de banda.
> Herramientas de medición reutilizables en el scratchpad de la sesión:
> `qa/fullpage.mjs` (captura, con flag `mobile` para emular 390 de verdad —
> sin él Chrome headless fuerza 500px de ancho mínimo), `qa/sections.mjs`
> (alturas por sección), `qa/compose-m2.ps1` (comparativas lado a lado),
> `qa/tree.mjs` (**la sonda genérica de la tanda M2**: árbol de módulos con
> geometría+tipografía por titular regex o `css:<selector>`, sirve para
> original y clon), `qa/s2-probe.mjs` (anclas de texto, plantilla A2),
> `qa/verify-baja.mjs` (checks puntuales de la tanda mecánica).
> Ojo servidor: el clon corre con `next start` (build de producción) — tras
> editar componentes hay que **parar el proceso, `npm run build` y relanzar**;
> si la página sale sin estilos (CSS 500), es un `next start` desincronizado
> de `.next` (pasó el 2026-07-23).
>
> **2ª tanda mecánica (2026-07-23):** M6 (fondo sticky vidrio), M8 (scroll-to-top),
> M1-parcial (H2 hero móvil 38px), B1/B2/B3 (alturas BAJA) y B6 (botón Cookiebot).
> Verificados por checks CDP puntuales sobre el clon (valores computados), **no
> por una re-medición full-page** — las alturas de referencia de arriba son de la
> tanda A1/A2 y no se recalcularon.

Todo lo no listado aquí quedó verificado dentro de ±13px del original en desktop
y con comportamiento correcto (hover de productos, sticky nav, sliders, hovers
de tarjetas, footer).

## Prioridad ALTA

(vacía — A1 y A2 resueltos, ver abajo)

## Prioridad MEDIA

(vacía — M1…M5 resueltos, ver abajo)

## Prioridad BAJA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| B4 | Footer (móvil) | 1792px vs 1761px. **Sin objetivo móvil documentado** (la tabla de objetivos es solo desktop, donde el footer ya cuadra exacto). No se toca sin re-medir el original en móvil. | +31px solo móvil |
| B5 | Productos — acordeón móvil | Al abrir un item, el original hace scroll animado hasta el item (`$("html,body").animate({scrollTop: offset−5}, "slow")` en init.js). El clon abre/cierra sin scroll. Añadir `scrollIntoView` suave en el toggle móvil. | Interacción sutil solo móvil |
| B7 | TrustBar / carruseles | En capturas simultáneas los logos/slides visibles difieren entre original y clon por el instante del autoplay. **No es defecto** — anotado para no re-investigarlo en futuros QA. | N/A |
| B8 | Mega-menú — sub-submenú "Cartuchos inteligentes" | Detectado en el QA de M4: en el original, "Cartuchos inteligentes" dentro del mega lleva chevron y despliega el grid de 18 contaminantes (spec header-nav: grid 9 filas, `top: 197`, min-w 500). El clon no lo implementa. También queda un residuo de ±15px de alto en el panel del mega (198 orig vs 213) y ~6px/item de deriva de anchos de texto en la fila de links (dd de Recursos a −34px del original, alineación con su propio link correcta). | Contenido faltante menor |

## Resueltos

| # | Sección | Resolución | Fecha |
|---|---------|-----------|-------|
| M5 | Hero — botón "Descubre cómo funciona" | **Resuelto**: nuevo `VideoLightbox.tsx` (client) — overlay `bg-black/80` por portal a body, iframe Brightcove (videoId 6361248610112) 16:9 con allowfullscreen, ✕ / Esc / clic-fuera para cerrar, scroll del body bloqueado al abrir, el iframe se desmonta al cerrar (detiene el vídeo). Verificado por CDP: dialog+aria-modal, src exacto, overflow hidden↔visible, red a players.brightcove.net → 200, cierre por ambas vías. Nota: el vídeo que sirve ese ID muestra un monitor HORIBA APHA-380 (¿clip correcto?) — cambiar el `videoId` en `VideoLightbox.tsx` si no lo es. Commit `149c3d2`. | 2026-07-23 |
| M4 | Header — dropdowns top/sticky | **Resuelto** (sonda `qa/m4-probe.mjs`: hover real por CDP sobre Productos/Sectores/Empresa/Recursos en ambos estados, original vs clon). Medido el original: TODOS los dropdowns cuelgan de la línea **viewport 119-120 (top) / 73-74 (sticky)** — no del borde inferior del header (185/127): tapan la 2ª línea del catálogo, con gap negativo también en el original. El mega ya estaba exacto (119/73 ✓); los tres estándar iban −7 (top) / **−14 (sticky)** y alineados a la derecha del link cuando el original alinea al **borde izquierdo del li**. Fixes: los tres pasan a `position: fixed` con `top: sticky?73:120` sin `left` (la posición estática los ancla al li, como el sub-menu Divi), sombra exacta `0 2px 5px` (mega sticky `0 0 4px`), caja cuadrada, Sectores a min-w 240. **Puente de gracia** `::before` de 20px sobre cada panel (equivale al `padding-bottom: 23px` del li + `::after` 2rem del original — sin él, el cursor moría en el hueco link→panel y el menú se cerraba en tránsito; el mega tenía el mismo bug latente). De rebote: la **columna del logo pasa a 15.87% fijo de la fila en lg** (192px como la col Divi; antes el `max-w` 170→104 encogía la columna y todo el menú saltaba 66px a la izquierda al entrar en sticky — el original no se mueve: dd left 517/617/833 idénticos en ambos estados), menú a 4.63% con items `px-2` sin gap (geometría li del original), e **iconos de Sectores a la IZQUIERDA del texto** (captura en vivo; el spec de Fase 3 decía lo contrario — corregido). Resultado: dTop 0/−1 en los 8 casos; dLeft −11/−20/−34 residual por deriva de anchos de texto (cada dd alineado con su propio link). Desktop 11848 y móvil 19208 sin cambios. Ojo QA: el vidrio sticky se ve transparente en capturas headless (`--disable-gpu` no pinta `backdrop-filter`) — no es defecto. | 2026-07-23 |
| M1 | Hero (móvil 390px) | **Resuelto: 834 vs 836 (−2)**, con anclas idénticas (H2 y120/h192, subtítulo y315/h119, botones y456, divisor y630, logos y700 en una fila). Causas: (1) el wrapper del 90% es de desktop — en móvil los módulos de texto ocupan la fila completa (335px): con 298px el titular caía en 6 líneas en vez de 4 (+82) y el subtítulo en 4 en vez de 3 (+27); (2) los **badges van en UNA fila** en el original (EPA a 134×60, gaps de 16 — el gap-32 del clon los echaba a 2 filas, +96); (3) ritmo Divi: H2 sin mt y con pb10, mb 3.34 entre titulares, mb 20.8 antes de botones, stride 84 entre botones apilados (50+34), divisor con pt8 y P "Evaluado" a 16px/30.6, logos pegados al párrafo, y remate mb30+pb40 de columna tras los badges (el clon acababa a ras). Fidelidad extra: la **marca de agua K solo existe desde 768px** (`@media (min-width:768px) .banner-home:before` — en móvil el clon la pintaba encima de los badges), el módulo **scroll-code va oculto en phone** (display:none verificado), y el P "Evaluado" ahora lleva `text-white` explícito — la regla global `p { color:#333 }` de globals.css le ganaba a la herencia y lo dejaba ilegible sobre la foto (bug preexistente, también visible en desktop). Desktop intacto: hero 824 (0), total 11848. **Página móvil completa: 19208 vs 19221 (−13).** | 2026-07-23 |
| M3 | S3 Sectores intro (móvil) | **Resuelto: 965 vs 965 (exacto)**, con todas las anclas a ±0 del original (H2 en y80, botón en y186, col derecha en y290, texto y300/h324, lema y654/h131, "Desliza" y815). Causas: pt móvil 80 (50+30) y pb 89 (30 fila + 59 sección); el módulo del título lleva **pb32+mb20** antes del botón (no solo el pb10 del h2) y el botón su mb30; el bloque de texto lleva mt10 y rítmica Divi (p pb18, no space-y); y el lema **"Una solución./Múltiples aplicaciones." son dos h2 de 37px con `line-height: 1` y pb10 cada uno en móvil** (misma regla que los h2 azules de S2/A2) — el clamp del clon los bajaba a 28px/33.6 (−64px). Extra de fidelidad: el enlace "cartuchos inteligentes" es **#333** en el original (verificado por CDP, como los enlaces de HazVisible), no azul. Desktop intacto: S3 533 (−13, igual que antes), total 11848. Móvil total tras M3: **19377 vs 19221 (+156)** — ahora todo el delta restante es el hero (M1, +167) menos los flecos ya anotados dentro de banda. | 2026-07-23 |
| M2 | S7 compuesto (móvil) + items asociados | **Resuelto** con la metodología de A2 (`qa/tree.mjs`, sonda genérica de árbol por titular/selector, nueva en esta tanda). Móvil: compuesto **5154 vs 5167 (−13)** — Presencia 896 vs 895, Testimonios **923 vs 923 (exacto)**, HazVisible 1809 vs 1815, Productos 1526 vs 1534 — y de los items asociados: CTA inmerso **319 vs 320**, newsletter **312 vs 312 (exacto)**, artículos 1426 vs 1423, sostenibilidad 954 vs 952. **Página móvil completa: 19221 vs 19221.** Causas reales por bloque: (1) *Presencia*: pt 80 (50 sección + 30 fila), mb 20 del módulo H2, mb 30 del texto y del botón, mapa con mt 30, pb 20 — el pb-146 era de desktop. (2) *Testimonios*: el slider Divi móvil mide por el slide activo **en flujo** (los demás `display:none`, como el fadeIn/Out de jQuery) — no un contenedor fijo de 400px; slide = img 177×177 mt 18 + gap 32 + quote 18.1/28.96 a ancho completo + nombre h57 (26+21+pb10, sin mt del rol) + **pb 104**; hueco H2→slider 69.5. (3) *HazVisible*: los H2 azules intermedios **mantienen 37px/44.4 en móvil** (el clamp los bajaba a 26); "Elige los contaminantes…" envuelve en **7 líneas porque la fila original mide 335px** (no 337) — `max-w-[335px]` móvil, sin hacks; rítmica p pb18, mb 40/20/40; blurbs 2 col de 162 gutter 13, H3 **16px/19.2+pb10 en móvil** (18px solo desktop), icono+26. (4) *Productos*: pt 30, lista pegada al H2 (mb 0), UL con pb18, panel abierto con img pegada (+6), p 18px/27 pb18, **ventajas sin viñetas y con divisor #999 por li** (regla `.lista-contenido-ul li` móvil del tema; bullets azules solo ≥sm), botón "Ver más" a +20, pb 21 del panel, botón final a +34 y pb 50. (5) *CTA inmerso/preocupa*: slide description pt 34/pb 51 (10%/15%), H2 27px/35.1 con **fw 500 en móvil / 300 desktop** (peso responsive Divi — causaba un wrap de 3 líneas en vez de 4), pb10, botón mt 20 y alto 44 (pt 7.5/pb 9). (6) *Newsletter*: título 27px/1.4, cuerpo **14px/22.4 con p pb14** en móvil, botón 44px con **mb 10** (`.calls-button`). (7) *Sostenibilidad*: pt 70, gap 30 entre pilares, texto de blurbs a la izquierda con px 17 (302px). Bonus: el fondo K (710×1302) ahora vive en un wrapper común de los 4 bloques en `page.tsx` — en el original es una sola sección Divi y la K cruzaba el borde Presencia→Testimonios (también arregla el recorte en desktop). Desktop verificado sin regresión: **11848 vs 11863 (−15, antes −23)** — newsletter 409 (0, antes −10), CTA inmerso 471 (0) y CTA preocupa 341 (0) ahora exactos; resto idéntico. Restos conocidos dentro de banda: li de ventajas 38px vs 40 del original (su pb computado es 10 — artefacto de render, no se fuerza), y el crop de las fotos del blog móvil difiere (original recorta img de 440px anclada a la izquierda; clon object-cover centrado) — solo encuadre, mismas alturas. | 2026-07-23 |
| A1 | Header móvil — menú hamburguesa | **Implementado** en `HeaderNav.tsx` (breakpoint real del tema: **≤1023px**, no 980). Hamburguesa de 3 barras 28×2 (blancas/`#333` en sticky, morph a ✕), panel 90vh con slide 500ms, 11 items verbatim, submenús acordeón +/− con overlay `.hover-link`, pill azul "Descargar catálogo"; "¿Cómo podemos ayudarte?" oculto como el original (`visible-escritorio`). Spec completo en `docs/research/components/mobile-nav.spec.md`. Verificado por CDP a 390 y 800px contra el original (fila 126→73px sticky, logo 120→104px, panel y96/y73, filas 47px — todo ±1px); desktop sin cambios. Commit `334df3b`. | 2026-07-23 |
| A2 | S2 "La solución profesional" | **Resuelto**: desktop **2407 vs 2409** (−2px, 21 anclas ±9) y móvil **4884 vs 4884 (exacto)**. Causas reales (extraídas módulo a módulo, ver addendum en `solucion-profesional.spec.md`): geometría de fila Divi (86.35% / cols 29.6667+64.833 / gutter 5.5%) que cambiaba el wrapping; `line-height: 1` en los h2 azules de 37px; `padding-bottom: 10px` de Divi en todos los h2; mt 10 del primer módulo; mb de módulo 33.67px; `<p>&nbsp;</p>` de 30px ante el callout; "Protege tu salud./Protege el medio ambiente." son **dos h2** sin negrita; blurbs 18px/21.6 con icono+30; logos validadores con ancho por logo (EPA 120, resto 100, Airparif 100%); botones Divi 15px/44px con flecha siempre visible y hover que expande el padding. En móvil: sección pt 50, filas pt 30, título 35px, validadores 2/fila, gaps propios. De rebote quedaron exactos **S7 desktop (+1)** y **Sostenibilidad (0)**, y se encontró el hueco de 53px (desktop) / 15px (móvil) tras el newsletter que faltaba desde la Fase 5. Desktop total: **11840 vs 11863 (−23)**. | 2026-07-23 |
| M6 | Header sticky — fondo vidrio | **Resuelto**: la fila sticky pasa de blanco sólido a **`rgba(255,255,255,0.576)` + `backdrop-filter: blur(10px)`** (valores en `HeaderNav.tsx`). Verificado por CDP: `backgroundColor rgba(255,255,255,0.576)`, `backdropFilter blur(10px)`, `position fixed`. El logo azul y el texto `#333` siguen legibles sobre el vidrio. | 2026-07-23 |
| M8 | Botón scroll-to-top | **Resuelto**: nuevo `ScrollToTop.tsx` montado en `page.tsx`. `position: fixed; bottom: 125px; right: 0; z-index: 99999; background: rgba(0,0,0,0.4)`, icono `ChevronUpIcon` blanco, 44×44 pegado al borde derecho; aparece con `scrollY > 500` (rAF-throttled) y hace `scrollTo({top:0, behavior:'smooth'})`. Verificado por CDP (bottom 125, right 0, z 99999, bg rgba 0.4, borde derecho a 1424 = viewport). | 2026-07-23 |
| B1 | Newsletter (desktop) | **Aplicada rítmica Divi documentada**: los dos `<p>` del bloque `.calls-text` pasan de `space-y-4` (16px) al `padding-bottom: 1em (18px)` real de Divi (salvo el último), con el bloque rematando en 30px. La diferencia de −11px estaba **dentro de la banda ±13px** que el propio doc declara verificada; el cambio es de fidelidad, no de pixel-forcing. | 2026-07-23 |
| B2 | TrustBar (móvil) | **Aplicado valor documentado**: el titular "Con la confianza…" pasa a **30px en móvil** (spec: render ~28-30px; el `clamp` lo bajaba a 22 y apilaba con poco aire). Desktop mantiene el `clamp(22,1.9vw,30)` verificado exacto. Verificado por CDP: 30px a 390. (No se re-midió la altura total móvil del original.) | 2026-07-23 |
| B3 | Carrusel sectores (móvil) | **Altura de slide responsive**: `500px` fijo → **`450px` en <640px** / `500px` desde 640 (`SwiperSlide` y `.sector-imagen-wrap`). El −50px derivado del delta documentado (+51) acerca el móvil a los 568px del original. Verificado por CDP: slide 450px a 390. | 2026-07-23 |
| B6 | Cookiebot — botón footer | **Cableado**: "Editar preferencias de cookies" ahora es `CookiePreferencesButton` (client) que invoca **`window.Cookiebot.renew()`** (API documentada en BEHAVIORS.md #8). No-op seguro mientras el script de Cookiebot no esté cargado; queda listo para cuando se decida clonar el banner (decisión de producto aún abierta). | 2026-07-23 |
| M7 | Animaciones de entrada | **N/A — premisa incorrecta, verificado en vivo (no re-investigar, como B7)**: el original NO tiene animaciones de entrada. Los "23 módulos con `et_pb_animation_*`" del recon son 23 `<img>` de blurbs con `et-waypoint` + **`et_pb_animation_off`** en los 3 breakpoints; el critical CSS de Divi eliminó todas las reglas `.et-animated`/`.et_pb_animation_*` (en runtime `document.styleSheets` tiene 0 reglas al respecto — CDP, perfil limpio + Cookiebot bloqueado). Medido sin scroll previo: iconos a `opacity: 1` desde el load en 1440 y 390; el waypoint de `scripts.min.js` (offset `"100%"`, `bottom-in-view` solo para la última fila de la última sección) añade la clase `et-animated` al entrar en viewport **sin efecto visual alguno** (animationName none, opacity 1→1, sin inline styles, muestreado 60ms×20). El clon estático ya es fiel; no se implementó nada. `.kunak-fade-up` sigue en `globals.css` por si algún día se quiere un reveal como personalización deliberada (post-emulación). Corrección anotada en BEHAVIORS.md §1. | 2026-07-23 |

## Notas para retomar

- Las medidas del original se tomaron con perfil limpio (sin cookies) y Cookiebot
  bloqueado vía `--host-resolver-rules`. Ojo: en sesión viva con historial, el
  original puede renderizar estados distintos (p. ej. la cabecera PRODUCTOS del
  footer se midió azul en vivo pero es `#333` en render limpio — ya corregido).
- El original recalcula alturas de sliders Divi por JS tras el load; medir
  siempre tras un pase de scroll + settle (los scripts `qa/*.mjs` ya lo hacen).
- Objetivos numéricos por sección (desktop 1418px, re-medidos 2026-07-23 —
  entre paréntesis el delta actual del clon): hero 824 (0) · trustbar 153 (0) ·
  S2 2409 (−2) · intro 546 (−13) · carrusel 619 (0) · spacer 57 (−1) ·
  CTA inmerso 471 (+1) · S7 compuesto 3185 (+1) · newsletter 409 (−10) ·
  artículos 793 (+3) · proyectos 822 (−3) · CTA preocupa 341 (+2) ·
  sostenibilidad 588 (0) · footer 592 (0). Además hay un margen ENTRE
  secciones tras el newsletter: 53px desktop / 15px móvil (ya replicado en
  `CtaNewsletter`).
- Cambios globales aplicados en A2 (afectan a todas las secciones que usan
  `SectionRow`): fila 86.35% máx 1380, columnas 29.6667%/64.833% con gutter
  5.5% y `shrink-0`, `SectionTitle` con `pb-[10px]` (regla Divi h2) y 35px en
  móvil, `belowTitle` a +34 (0 en móvil), botones Divi exactos (15px/44px,
  padding 7.5/40.5/9/22.5, flecha siempre visible, hover expande a pr 55.5).
  Cualquier ajuste futuro de sección debe medir DESPUÉS de estos valores.
