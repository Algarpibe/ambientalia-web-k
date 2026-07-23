# Pendientes de QA — clon kunakair.com/es

> Estado tras la Fase 5 (QA visual) del 2026-07-22, actualizado el 2026-07-23
> tras cerrar A1 y A2. Comparación por capturas CDP full-page (viewport real
> 1440×900 → ancho útil 1418px; móvil emulado 390×844) entre
> `https://kunakair.com/es/` y `http://localhost:3000/`.
> Alturas de referencia (2026-07-23): original desktop **11863px** / clon
> **11840px** (−23); original móvil **19221px** / clon **18894px** (−327,
> concentrado en M1/M2/M3).
> Herramientas de medición reutilizables en el scratchpad de la sesión:
> `qa/fullpage.mjs` (captura), `qa/sections.mjs` (alturas por sección),
> `qa/compose.ps1` (comparativas lado a lado), `qa/s2-probe.mjs` (anclas de
> texto por sección, plantilla reutilizable), `qa/sec-fix-probe.mjs` y
> `qa/sost-tree.mjs` (árboles de módulos Divi con márgenes computados),
> `qa/verify-baja.mjs` (checks puntuales de la tanda mecánica).
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

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| M1 | Hero (móvil 390px) | Clon 1031px vs original 836px. **H2 titular ya bajado a 38px móvil (2026-07-23)**; queda **pendiente compactar la fila de badges EPA/MCERTS/AIRLAB** (en el original apilan más juntos) y revisar el resto del ritmo móvil del hero. | +195px solo móvil (parcial) |
| M2 | S7 compuesto (móvil) | Presencia+Testimonios+HazVisible+Productos suman 4601px vs 5167px del original (medido 2026-07-23; desktop del compuesto ya exacto a +1). Aplicar la misma metodología de A2 (anclas con `qa/s2-probe.mjs` adaptado + árbol de módulos): gaps móviles Divi ≈30-33px, títulos 35px, columnas apiladas con mb 30. Al re-medir tras A2 afloraron además otros items móviles no tabulados en Fase 5: **CTA inmerso +54** (374 vs 320), **newsletter móvil +96** (408 vs 312), **artículos móvil +45** (1468 vs 1423) y **sostenibilidad móvil −24** (928 vs 952) — tratarlos junto con M2. | −566px solo móvil (+ items nuevos) |
| M3 | S3 Sectores intro (móvil) | Clon 825px vs original 965px. Desktop ya cuadra (−12px); en móvil el original escala títulos/espaciados distinto. | −140px solo móvil |
| M4 | Header — dropdowns tras el rediseño | El mega-menú "Productos" usa offsets fijos `top: sticky ? 73 : 119`. Tras pasar el header a dos filas (catálogo en 2ª línea) esos valores pueden no alinear con el borde inferior real del header. Verificar hover de Productos/Sectores/Empresa/Recursos en top y sticky, y recalcular offsets. | Visual — riesgo de dropdown descolgado |
| M5 | Hero — botón "Descubre cómo funciona" | Apunta a `#video` (ancla verbatim), pero el lightbox/modal de vídeo del original no está implementado; el click no hace nada. Decidir: implementar lightbox con el vídeo real o mapear a un destino útil. | Funcional (interacción faltante) |
| M7 | Global — animaciones de entrada | El original tiene 23 módulos con animaciones on-view de Divi (fade/slide-up al entrar al viewport). La utilidad `.kunak-fade-up` está definida en `globals.css` pero **ningún componente la usa**; el clon renderiza todo estático. Implementar con IntersectionObserver en las secciones que el original anima. | Sensación de página "muerta" al hacer scroll |

## Prioridad BAJA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| B4 | Footer (móvil) | 1792px vs 1761px. **Sin objetivo móvil documentado** (la tabla de objetivos es solo desktop, donde el footer ya cuadra exacto). No se toca sin re-medir el original en móvil. | +31px solo móvil |
| B5 | Productos — acordeón móvil | Al abrir un item, el original hace scroll animado hasta el item (`$("html,body").animate({scrollTop: offset−5}, "slow")` en init.js). El clon abre/cierra sin scroll. Añadir `scrollIntoView` suave en el toggle móvil. | Interacción sutil solo móvil |
| B7 | TrustBar / carruseles | En capturas simultáneas los logos/slides visibles difieren entre original y clon por el instante del autoplay. **No es defecto** — anotado para no re-investigarlo en futuros QA. | N/A |

## Resueltos

| # | Sección | Resolución | Fecha |
|---|---------|-----------|-------|
| A1 | Header móvil — menú hamburguesa | **Implementado** en `HeaderNav.tsx` (breakpoint real del tema: **≤1023px**, no 980). Hamburguesa de 3 barras 28×2 (blancas/`#333` en sticky, morph a ✕), panel 90vh con slide 500ms, 11 items verbatim, submenús acordeón +/− con overlay `.hover-link`, pill azul "Descargar catálogo"; "¿Cómo podemos ayudarte?" oculto como el original (`visible-escritorio`). Spec completo en `docs/research/components/mobile-nav.spec.md`. Verificado por CDP a 390 y 800px contra el original (fila 126→73px sticky, logo 120→104px, panel y96/y73, filas 47px — todo ±1px); desktop sin cambios. Commit `334df3b`. | 2026-07-23 |
| A2 | S2 "La solución profesional" | **Resuelto**: desktop **2407 vs 2409** (−2px, 21 anclas ±9) y móvil **4884 vs 4884 (exacto)**. Causas reales (extraídas módulo a módulo, ver addendum en `solucion-profesional.spec.md`): geometría de fila Divi (86.35% / cols 29.6667+64.833 / gutter 5.5%) que cambiaba el wrapping; `line-height: 1` en los h2 azules de 37px; `padding-bottom: 10px` de Divi en todos los h2; mt 10 del primer módulo; mb de módulo 33.67px; `<p>&nbsp;</p>` de 30px ante el callout; "Protege tu salud./Protege el medio ambiente." son **dos h2** sin negrita; blurbs 18px/21.6 con icono+30; logos validadores con ancho por logo (EPA 120, resto 100, Airparif 100%); botones Divi 15px/44px con flecha siempre visible y hover que expande el padding. En móvil: sección pt 50, filas pt 30, título 35px, validadores 2/fila, gaps propios. De rebote quedaron exactos **S7 desktop (+1)** y **Sostenibilidad (0)**, y se encontró el hueco de 53px (desktop) / 15px (móvil) tras el newsletter que faltaba desde la Fase 5. Desktop total: **11840 vs 11863 (−23)**. | 2026-07-23 |
| M6 | Header sticky — fondo vidrio | **Resuelto**: la fila sticky pasa de blanco sólido a **`rgba(255,255,255,0.576)` + `backdrop-filter: blur(10px)`** (valores en `HeaderNav.tsx`). Verificado por CDP: `backgroundColor rgba(255,255,255,0.576)`, `backdropFilter blur(10px)`, `position fixed`. El logo azul y el texto `#333` siguen legibles sobre el vidrio. | 2026-07-23 |
| M8 | Botón scroll-to-top | **Resuelto**: nuevo `ScrollToTop.tsx` montado en `page.tsx`. `position: fixed; bottom: 125px; right: 0; z-index: 99999; background: rgba(0,0,0,0.4)`, icono `ChevronUpIcon` blanco, 44×44 pegado al borde derecho; aparece con `scrollY > 500` (rAF-throttled) y hace `scrollTo({top:0, behavior:'smooth'})`. Verificado por CDP (bottom 125, right 0, z 99999, bg rgba 0.4, borde derecho a 1424 = viewport). | 2026-07-23 |
| B1 | Newsletter (desktop) | **Aplicada rítmica Divi documentada**: los dos `<p>` del bloque `.calls-text` pasan de `space-y-4` (16px) al `padding-bottom: 1em (18px)` real de Divi (salvo el último), con el bloque rematando en 30px. La diferencia de −11px estaba **dentro de la banda ±13px** que el propio doc declara verificada; el cambio es de fidelidad, no de pixel-forcing. | 2026-07-23 |
| B2 | TrustBar (móvil) | **Aplicado valor documentado**: el titular "Con la confianza…" pasa a **30px en móvil** (spec: render ~28-30px; el `clamp` lo bajaba a 22 y apilaba con poco aire). Desktop mantiene el `clamp(22,1.9vw,30)` verificado exacto. Verificado por CDP: 30px a 390. (No se re-midió la altura total móvil del original.) | 2026-07-23 |
| B3 | Carrusel sectores (móvil) | **Altura de slide responsive**: `500px` fijo → **`450px` en <640px** / `500px` desde 640 (`SwiperSlide` y `.sector-imagen-wrap`). El −50px derivado del delta documentado (+51) acerca el móvil a los 568px del original. Verificado por CDP: slide 450px a 390. | 2026-07-23 |
| B6 | Cookiebot — botón footer | **Cableado**: "Editar preferencias de cookies" ahora es `CookiePreferencesButton` (client) que invoca **`window.Cookiebot.renew()`** (API documentada en BEHAVIORS.md #8). No-op seguro mientras el script de Cookiebot no esté cargado; queda listo para cuando se decida clonar el banner (decisión de producto aún abierta). | 2026-07-23 |

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
