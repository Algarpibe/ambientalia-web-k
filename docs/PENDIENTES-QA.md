# Pendientes de QA — clon kunakair.com/es

> Estado tras la Fase 5 (QA visual) del 2026-07-22. Comparación por capturas CDP
> full-page (viewport real 1440×900 → ancho útil 1418px; móvil emulado 390×844)
> entre `https://kunakair.com/es/` y `http://localhost:3000/`.
> Alturas de referencia: original desktop **11845px** / clon **11511px**;
> original móvil **19221px** / clon **18374px**.
> Herramientas de medición reutilizables en el scratchpad de la sesión:
> `qa/fullpage.mjs` (captura), `qa/sections.mjs` (alturas por sección),
> `qa/compose.ps1` (comparativas lado a lado).

Todo lo no listado aquí quedó verificado dentro de ±13px del original en desktop
y con comportamiento correcto (hover de productos, sticky nav, sliders, hovers
de tarjetas, footer).

## Prioridad ALTA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| A1 | Header (móvil/tablet ≤980px) | **No hay menú hamburguesa.** El original sustituye el menú horizontal por `.mobile_nav` (botón hamburguesa + desplegable `.et_mobile_menu` con submenús). El clon deja los links en flex-wrap, que desbordan/se amontonan en viewports pequeños. | Funcional — el header móvil no es usable como el original |
| A2 | S2 "La solución profesional" (desktop) | Ritmo vertical interno ~261px más corto que el original (2145 vs 2406). El contenido y estilos ya coinciden (texto 18px, recuadro azul, logos 100px, banner AIRLAB 791px, destacados 37px); lo que falta son los micro-espaciados entre módulos Divi (márgenes de párrafo/módulo `~1em`/`2.75%` y paddings de fila 28/14 fila a fila). Requiere desglose módulo a módulo con `qa/probe3.mjs` como base. | −261px desktop / −598px móvil (~11%) |

## Prioridad MEDIA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| M1 | Hero (móvil 390px) | Clon 1031px vs original 836px. El spec (hero.spec.md) indica en móvil: H2 titular **38px** (clon mantiene 42), H1 kicker 12px (clon lo tiene sr-only — OK), y los badges EPA/MCERTS/AIRLAB apilan más compactos en el original. Ajustar tipografía responsive del H2 y compactar la fila de badges. | +195px solo móvil |
| M2 | S7 compuesto (móvil) | Presencia+Testimonios+HazVisible+Productos suman 4646px vs 5167px del original. Paralelo a A2 (wrap de texto y espaciados); revisar tras cerrar A2. | −521px solo móvil |
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

## Notas para retomar

- Las medidas del original se tomaron con perfil limpio (sin cookies) y Cookiebot
  bloqueado vía `--host-resolver-rules`. Ojo: en sesión viva con historial, el
  original puede renderizar estados distintos (p. ej. la cabecera PRODUCTOS del
  footer se midió azul en vivo pero es `#333` en render limpio — ya corregido).
- El original recalcula alturas de sliders Divi por JS tras el load; medir
  siempre tras un pase de scroll + settle (los scripts `qa/*.mjs` ya lo hacen).
- Objetivos numéricos por sección (desktop 1418px): ver tabla en el informe de
  la Fase 5 — original: hero 822 · trustbar 153 · S2 2406 · intro 545 ·
  carrusel 619 · spacer 57 · CTA inmerso 470 · Presencia 720 · Testimonios 570 ·
  HazVisible 1040 · Productos 853 · newsletter 409 · artículos 791 ·
  proyectos 819 · CTA preocupa 341 · sostenibilidad 587 · footer 592.
