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
> `qa/sost-tree.mjs` (árboles de módulos Divi con márgenes computados).

Todo lo no listado aquí quedó verificado dentro de ±13px del original en desktop
y con comportamiento correcto (hover de productos, sticky nav, sliders, hovers
de tarjetas, footer).

## Prioridad ALTA

(vacía — A1 y A2 resueltos, ver abajo)

## Prioridad MEDIA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| M1 | Hero (móvil 390px) | Clon 1031px vs original 836px. El spec (hero.spec.md) indica en móvil: H2 titular **38px** (clon mantiene 42), H1 kicker 12px (clon lo tiene sr-only — OK), y los badges EPA/MCERTS/AIRLAB apilan más compactos en el original. Ajustar tipografía responsive del H2 y compactar la fila de badges. | +195px solo móvil |
| M2 | S7 compuesto (móvil) | Presencia+Testimonios+HazVisible+Productos suman 4601px vs 5167px del original (medido 2026-07-23; desktop del compuesto ya exacto a +1). Aplicar la misma metodología de A2 (anclas con `qa/s2-probe.mjs` adaptado + árbol de módulos): gaps móviles Divi ≈30-33px, títulos 35px, columnas apiladas con mb 30. Al re-medir tras A2 afloraron además otros items móviles no tabulados en Fase 5: **CTA inmerso +54** (374 vs 320), **newsletter móvil +96** (408 vs 312), **artículos móvil +45** (1468 vs 1423) y **sostenibilidad móvil −24** (928 vs 952) — tratarlos junto con M2. | −566px solo móvil (+ items nuevos) |
| M3 | S3 Sectores intro (móvil) | Clon 825px vs original 965px. Desktop ya cuadra (−12px); en móvil el original escala títulos/espaciados distinto. | −140px solo móvil |
| M4 | Header — dropdowns tras el rediseño | El mega-menú "Productos" usa offsets fijos `top: sticky ? 73 : 119`. Tras pasar el header a dos filas (catálogo en 2ª línea) esos valores pueden no alinear con el borde inferior real del header. Verificar hover de Productos/Sectores/Empresa/Recursos en top y sticky, y recalcular offsets. | Visual — riesgo de dropdown descolgado |
| M5 | Hero — botón "Descubre cómo funciona" | Apunta a `#video` (ancla verbatim), pero el lightbox/modal de vídeo del original no está implementado; el click no hace nada. Decidir: implementar lightbox con el vídeo real o mapear a un destino útil. | Funcional (interacción faltante) |
| M6 | Header sticky — fondo | El original usa vidrio `rgba(255,255,255,0.576)` + sombra; el clon pinta `#ffffff` sólido (el token correcto existe en `globals.css` como `.kunak-nav[data-sticky]` pero el estilo inline lo pisa). Cambiar a la transparencia original. | Visual sutil en sticky |
| M7 | Global — animaciones de entrada | El original tiene 23 módulos con animaciones on-view de Divi (fade/slide-up al entrar al viewport). La utilidad `.kunak-fade-up` está definida en `globals.css` pero **ningún componente la usa**; el clon renderiza todo estático. Implementar con IntersectionObserver en las secciones que el original anima. | Sensación de página "muerta" al hacer scroll |
| M8 | Página — botón scroll-to-top | El original tiene `span.et_pb_scroll_top` (fixed, bottom 125px, right 0, bg rgba(0,0,0,0.4), z 99999) que aparece al abandonar el hero y hace scroll suave arriba. Existe `ChevronUpIcon` en `icons.tsx` pero el componente no está construido ni montado. | Componente faltante |

## Prioridad BAJA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| B1 | S8 Newsletter (desktop) | 398px vs 409px del original. | −11px |
| B2 | S1 TrustBar (móvil) | 217px vs 265px (el original apila cabecera y logos con más aire). | −48px solo móvil |
| B3 | S4 Carrusel sectores (móvil) | 619px vs 568px — las slides usan altura fija 500px que no escala en 390px. Hacer la altura responsive. | +51px solo móvil |
| B4 | Footer (móvil) | 1792px vs 1761px. | +31px solo móvil |
| B5 | Productos — acordeón móvil | Al abrir un item, el original hace scroll animado hasta el item (`$("html,body").animate({scrollTop: offset−5}, "slow")` en init.js). El clon abre/cierra sin scroll. Añadir `scrollIntoView` suave en el toggle móvil. | Interacción sutil solo móvil |
| B6 | Cookiebot | El banner de consentimiento del original no está clonado (decisión pendiente desde el recon: punto abierto #8 de BEHAVIORS.md). El enlace "Editar preferencias de cookies" del footer es un botón sin acción (en el original lo gestiona el plugin GDPR). | Funcional — decidir si se implementa un banner propio |
| B7 | TrustBar / carruseles | En capturas simultáneas los logos/slides visibles difieren entre original y clon por el instante del autoplay. **No es defecto** — anotado para no re-investigarlo en futuros QA. | N/A |

## Resueltos

| # | Sección | Resolución | Fecha |
|---|---------|-----------|-------|
| A1 | Header móvil — menú hamburguesa | **Implementado** en `HeaderNav.tsx` (breakpoint real del tema: **≤1023px**, no 980). Hamburguesa de 3 barras 28×2 (blancas/`#333` en sticky, morph a ✕), panel 90vh con slide 500ms, 11 items verbatim, submenús acordeón +/− con overlay `.hover-link`, pill azul "Descargar catálogo"; "¿Cómo podemos ayudarte?" oculto como el original (`visible-escritorio`). Spec completo en `docs/research/components/mobile-nav.spec.md`. Verificado por CDP a 390 y 800px contra el original (fila 126→73px sticky, logo 120→104px, panel y96/y73, filas 47px — todo ±1px); desktop sin cambios. Commit `334df3b`. | 2026-07-23 |
| A2 | S2 "La solución profesional" | **Resuelto**: desktop **2407 vs 2409** (−2px, 21 anclas ±9) y móvil **4884 vs 4884 (exacto)**. Causas reales (extraídas módulo a módulo, ver addendum en `solucion-profesional.spec.md`): geometría de fila Divi (86.35% / cols 29.6667+64.833 / gutter 5.5%) que cambiaba el wrapping; `line-height: 1` en los h2 azules de 37px; `padding-bottom: 10px` de Divi en todos los h2; mt 10 del primer módulo; mb de módulo 33.67px; `<p>&nbsp;</p>` de 30px ante el callout; "Protege tu salud./Protege el medio ambiente." son **dos h2** sin negrita; blurbs 18px/21.6 con icono+30; logos validadores con ancho por logo (EPA 120, resto 100, Airparif 100%); botones Divi 15px/44px con flecha siempre visible y hover que expande el padding. En móvil: sección pt 50, filas pt 30, título 35px, validadores 2/fila, gaps propios. De rebote quedaron exactos **S7 desktop (+1)** y **Sostenibilidad (0)**, y se encontró el hueco de 53px (desktop) / 15px (móvil) tras el newsletter que faltaba desde la Fase 5. Desktop total: **11840 vs 11863 (−23)**. | 2026-07-23 |

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
