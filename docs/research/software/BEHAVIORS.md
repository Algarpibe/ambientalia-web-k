# BEHAVIORS.md — kunakair.com/es/software-de-medicion-calidad-del-aire

> Barrido de interacciones del recon (Fase 1), **2026-07-27**, con
> puppeteer-core sobre el Chrome del sistema (headless, perfil limpio) a
> **1440×900** y **390×844**.
> **Aviso de método heredado de la QA de /accesorios**: `requestAnimationFrame`
> no corre en pestañas ocultas, así que cualquier scrollspy o animación medida
> desde una pestaña en segundo plano parece congelada. Todo lo de aquí está
> medido en headless con la página activa, que sí ejecuta rAF.

## Resumen ejecutivo

Página tranquila: **una sola pieza con vida propia** (el carrusel del hero, con
autoplay) y dos comportamientos ya resueltos en el clon (scrollspy de anclas y
acordeón del FAQ). No hay librería de scroll suave, ni parallax, ni animaciones
de entrada al viewport, ni tabs, ni popups de formulario.

## 1. Carrusel del hero — 🆕 **time-driven, ES LO ÚNICO NUEVO DE VERDAD**

- Módulo `et_pb_slider` en la columna 2/3 de la fila 1 de S1; caja **747×500**.
- **9 diapositivas**, cada una con **imagen de fondo** (`background-image` sobre
  el `.et_pb_slide`, no un `<img>`) y **un único texto** — no hay descripción ni
  botón dentro de la diapositiva.
- **Autoplay confirmado**: la diapositiva activa pasó de **0 a 2 en 7 s** →
  ~**3,5 s por diapositiva**, con avance automático y bucle.
- Controles: el módulo trae la maquinaria de flechas y puntos de Divi. **Al
  construir hay que decidir explícitamente** si se replican visibles; en la
  captura de escritorio no destacan, conviene remedirlo en la Fase 3 con estados
  de hover antes de fijarlo.
- **INTERACTION MODEL: time-driven (autoplay con bucle)**. No es scroll-driven:
  las diapositivas cambian solas sin tocar el scroll.

Los 9 textos, en orden: identificar puntos conflictivos · caracterizar fuentes de
contaminación · detectar posibles fugas · analizar tamaño de partículas ·
gestionar la red de sensores · análisis multiparamétricos · registrar
mantenimiento (GMAO) · registro de alarmas y trazabilidad · validar datos y
crear informes personalizados.

## 2. Columna de anclas + scrollspy — ♻️ patrón ya resuelto

- 3 anclas (`#beneficios`, `#herramientas`, `#case-studies`) en la columna 1/4,
  con 2 CTAs debajo. Misma caja que /monitor-calidad-aire y /accesorios.
- **Scrollspy verificado**, y funciona igual que en las otras dos páginas:
  ninguna activa arriba del todo, y luego una sola —
  `y=0` → ninguna · `3500` → Beneficios · `4500` y `6000` → Herramientas ·
  `8000` y `8600` → Casos de éxito.
- **INTERACTION MODEL: scroll-driven**. Se cubre con el `AnchorNav` compartido
  (que ya lleva `scrollOffset` parametrizable); queda por medir en la Fase 3 el
  offset exacto de esta página al pulsar un ancla.

## 3. Cabecera al hacer scroll — ♻️ compartida

Se encoge de **225px** (arriba del todo) a **81px** (a partir de ~900 de scroll),
el mismo comportamiento del resto del clon. **No reimplementar**: sale del
`HeaderNav` compartido. Ojo con el pendiente **A2** de `docs/PENDIENTES-QA.md`
(la franja de cabecera del clon mide 177 frente a 224.7 del original porque el
botón "Descargar catálogo" se resuelve en una fila en vez de dos); esta página
tiene el mismo 225 de partida, así que **A2 le afecta igual**.

## 4. Vídeo del producto — ♻️ lightbox ya existente

- El CTA "Ver vídeo del producto" apunta a `#video`, pero **ese destino no
  existe en el DOM**: no es un salto de ancla, es un **lightbox** (hay 2 nodos
  con clase de lightbox en la página).
- El iframe del reproductor **no está en el HTML inicial** — se inyecta al
  pulsar. Queda pendiente de la Fase 3 capturar la URL real del player
  (Brightcove o YouTube) abriendo el modal.
- Se cubre con `VideoLightbox`, que ya acepta `src` o `youtubeId`.

## 5. FAQ — ♻️ reutilizar tal cual

**19 toggles, todos cerrados de inicio**, y las primeras preguntas coinciden
literalmente con las de /monitor-calidad-aire y /accesorios ("¿Los equipos Kunak
son certificados ATEX?", "¿Qué área cubre cada dispositivo?", "¿Cada cuánto
tiempo se reemplazan los cartuchos…?"). Mismo componente `FaqAcordeon`, sin
cambios. **INTERACTION MODEL: click-driven.**

Pendiente heredado: **A3** de `docs/PENDIENTES-QA.md` (al h2 del FAQ le falta
`overflow-wrap: break-word` y ocupa 2 líneas en vez de 3). Afecta también aquí.

## 6. CTA de ancho completo (S2) — ♻️ `CtaBanner`

`et_pb_fullwidth_slider` con **una sola diapositiva** y sin controles — es
exactamente el patrón que ya cubre `CtaBanner` en la home y en el monitor. No
tiene autoplay porque no hay nada que rotar.

## 7. Hovers

Superficie pequeña, y toda ella en componentes compartidos: tarjetas de
artículos (zoom 1.1× de la imagen + título a azul), tarjetas de casos de éxito y
botones Divi (la flecha expande el padding derecho). **Las 16 tarjetas de
herramienta y los 9 blurbs de beneficio no tienen hover propio** — conviene
confirmarlo en la Fase 3 con ratón real, porque el barrido de esta fase fue
programático.

## 8. Móvil (390) — sin defectos que corregir

A diferencia de /accesorios, aquí **no aparece ningún defecto del original que
haya que decidir si replicar**:

- **Sin scroll horizontal** (`scrollWidth == clientWidth == 390`).
- La **caja de anclas desaparece** (regla ≤980 del tema), igual que en las otras
  páginas. Aquí sí quedan debajo los 2 CTAs, como en el monitor.
- Las **16 tarjetas de herramienta pasan a 312px, una por fila** (de 2 por fila
  en escritorio) — la captura de dashboard se reescala sin recortarse.
- Los **9 blurbs de beneficio** también a 312.
- El **carrusel mantiene 500px de alto**.
- Altura total **20888**.

## 9. Lo que NO existe (verificado, no re-investigar)

Sin tabs, sin acordeón propio (el único es el FAQ), sin filtros, sin buscador,
sin paginación, sin visor 360, sin popup de formulario, sin tablas de
especificaciones, sin `lista-contenido` (el widget de sondas del monitor **no**
se usa aquí), sin librería de scroll suave (Lenis/Locomotive), sin animaciones
de entrada al viewport y sin scroll-snap.

## 10. Enlaces entrantes desde el clon

Cinco sitios del clon ya apuntan a esta página con URL absoluta y deberán pasar
a la ruta local `/software-de-medicion-calidad-del-aire` al construirla:
`src/lib/nav.ts`, `src/lib/footer.ts`, `src/lib/products.ts`,
`src/components/HazVisible.tsx` y `src/components/monitor/InformacionProducto.tsx`.
Es la misma operación que se hizo con /accesorios en el commit `f34bedc`.
