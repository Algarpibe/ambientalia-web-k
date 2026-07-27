# BEHAVIORS.md — kunakair.com/es/accesorios (arquetipo CATÁLOGO)

> Barrido de interacciones **2026-07-27**. Desktop **1440×900**, móvil
> **390×844 real** (DPR 3). Perfil limpio + Cookiebot bloqueado + pase de
> scroll y settle. Ratón real por CDP (`Input.dispatchMouseEvent`) salvo donde
> se indique. Sondas: `acc/recon5-interact.mjs`, `acc/recon6.mjs`, `acc/ovf.mjs`.

## Resumen ejecutivo

**Es la página menos interactiva del proyecto hasta ahora.** Todo el
comportamiento propio se reduce a **una cosa**: las dos columnas de anclas que
se fijan al hacer scroll y marcan el accesorio visible. No hay sliders, ni
modales, ni formularios, ni acordeones propios, ni animaciones. Lo demás
(header, footer, scroll-top, FAQ) ya está clonado.

## 1. Runtime y librerías — **ninguna nueva, y casi ninguna en uso**

WordPress carga globalmente swiper 8, `@3dweb/360javascriptviewer`,
`popups-for-divi`, `lightbox.js` del tema, `interact.js`, `snazzy-maps` y
`divi-modules-table-maker`. **En esta página no se instancia ninguna.** Conteo
en vivo:

| Sonda | Resultado |
|---|---|
| `.swiper, .swiper-container` | **0** |
| `[id^=jsv-holder]` (visor 360) | **0** |
| `.da-overlay, [class*=popup]` | **0** |
| `a[href="#video"]`, lightbox | **0** |
| `[class*=table-maker], [class*=dmtm]` | **0** — las tablas son `<table>` HTML plano |
| `#main-content form` | **0** |
| `.et_pb_sticky_module` | **4** (2 columnas + 2 placeholders de Divi) |

**Animaciones de entrada: 0 módulos** con clases `et_pb_animation_*` — ni
siquiera los `_off` que llevaba /monitor-calidad-aire. El clon estático es fiel
por construcción; no hay nada que decidir aquí (cierra el mismo asunto que M7).

## 2. Header, footer y scroll-to-top — ♻️ COMPARTIDOS

Mismo template TB ya clonado: `HeaderNav` (utility bar + sticky glass +
dropdowns/mega), `ScrollToTop`, y footer TB de 3 secciones con la franja
`footer-background` → **`<Footer template="tb" />`** (la variante cerrada en
P1). **No reimplementar nada.**

## 3. Columnas de anclas: sticky por JS de Divi — 🆕 (patrón ya resuelto)

Las dos columnas `.columna-lista-anclas` llevan `et_pb_sticky_module`. Divi
**no usa `position:sticky`**: su `sticky-elements.js` clona el elemento
(`et_pb_sticky_placeholder` queda en el flujo) y al elemento vivo le aplica
inline:

```
position: fixed !important; z-index: 10000; width: 240.469px;
left: 144px; top: 0px; bottom: auto; margin-top: 0px;
```

con `top` **computado a 70px** (regla del tema). Comportamiento medido a lo
largo del scroll (12 posiciones, evento `scroll` real):

- Se fija al entrar su fila y **se libera al final de la fila** — cada columna
  vive solo dentro de su categoría, con `margin-top` negativo creciente
  aplicado por Divi para "soltarla" (p. ej. `-5440px` al final de la página).
- Las **dos columnas coexisten**: mientras la 2ª está fija, la 1ª ya se ha
  soltado por arriba.

**Para el clon: `position: sticky; top: 70px` nativo** — misma conclusión que
BEHAVIORS §5 del monitor, donde ya se verificó que el resultado es idéntico y
evita replicar el clonado de Divi.

## 4. Scrollspy `activo` — un solo ítem, y un artefacto que NO hay que copiar

- El `<a>` del accesorio visible recibe la clase **`.activo`** → color
  **#0075C9** (el resto queda **#bbb**; el peso 800 no cambia).
- **Es exclusivo: exactamente uno marcado por columna**, verificado en el
  elemento vivo a lo largo de todo el scroll (Panel solar → Cargador para
  exteriores → Cargador para interiores → …).
- Cuando el scroll deja atrás la categoría, la columna se queda **sin ningún
  `activo`** (lista entera en gris) antes de soltarse.
- **Estado inicial (scrollY 0): el marcado es el ÚLTIMO ítem** de la 2ª columna
  ("Micro-cámara de calibración (Gashood)"), no el primero — se ve así en las
  capturas estáticas de página completa.
- ⚠️ **Artefacto a ignorar**: el `et_pb_sticky_placeholder` es un **clon del
  DOM con IDs duplicados** y en él las clases `activo` se **acumulan** (llegan
  a verse 12 a la vez, y `document.querySelector('#link-x')` puede devolver el
  del clon). Es un efecto colateral del sticky de Divi, **no un diseño**. En el
  clon, con `position:sticky` nativo no hay clon ni duplicación: un
  IntersectionObserver que marque uno solo reproduce lo que el usuario ve.
  *(No re-investigar, como B7/M7.)*

## 5. Clic en un ancla — scroll suave, sin hash

Medido con clic real sobre `#link-pluviometro` desde `scrollY = 2900`:

- Muestreo cada 120 ms: `2963 → 3143 → 3445 → 3727 → 4002 → 4135 → **4156** →
  4137 → 4105 → 4082 → 4077 → 4077`. Es decir **animación de ~1,2–1,4 s con un
  ligero sobrepaso** (llega a 4156 y retrocede a 4077) — típico del `animate`
  de jQuery con una corrección posterior.
- **La URL NO cambia**: `location.hash` sigue vacío antes y después (igual que
  en el monitor).
- Posición final: el bloque destino queda a **`top: 80px`** del viewport. Aquí
  **sí hay un offset** que compensa parcialmente el header fijo (en el monitor
  no lo había y el H2 quedaba tapado).

Implementación sugerida: `scrollTo({ top: el.offsetTop − 80, behavior:'smooth' })`
+ `preventDefault()` para no escribir el hash. El sobrepaso es un artefacto del
easing de jQuery; no merece replicarse.

## 6. Hovers — superficie mínima

Barrido con ratón real, comparando computed styles antes/después:

| Elemento | Cambio |
|---|---|
| `#link-…` (ítem de ancla) | **ninguno** — ni color, ni fondo, ni subrayado |
| Imagen de ficha | **ninguno** |
| Fila de tabla | **ninguno** |
| CTA azul del hero | `background: #0075C9 → #7F8798` |

O sea: **el único hover de la página es el botón azul**, que ya está
implementado en `BlueButton` (mismo `boton-azul` de Divi: 15px, alto 44,
padding 7.5/40.5/9/22.5, radius 30, flecha, y el hover que expande el padding).
Los enlaces de ancla no responden al ratón en absoluto.

## 7. FAQ — ♻️ reutilizar, ya verificado

19 toggles `kunak-faq-item` dentro de `.kunak-faqs-accordion`, **idénticos
19/19** (texto y orden) a `FAQ_ITEMS` de `src/lib/monitor.ts`.

⚠️ Nota honesta de medición: **no conseguí abrir un toggle** con clic real en
headless (dos intentos sobre ítems distintos; el `.et_pb_toggle` siguió
`_close` con `contentH: 0`, y el texto de respuesta ya está en el DOM). No lo
investigué más porque el componente **`FaqAcordeon` ya está construido y
verificado** en la tanda de /monitor-calidad-aire; esta página no aporta
requisitos nuevos. Si en Fase 2 se quisiera confirmar el mecanismo del
original, hay que sondearlo aparte (posible handler `mouseenter`, como pasó
con el acordeón de productos en B5).

## 8. Móvil (390) — la navegación desaparece y hay dos defectos reales

- **`.menu-anclas` → `display: none`** (regla ≤980 del tema). Como esta columna
  **no lleva CTAs** debajo (a diferencia del monitor), no queda barra sticky
  alguna: **el catálogo pierde toda su navegación** y queda como lista lineal
  bajo los dos `<h2>` de categoría. La columna 1/4 se reduce a 98 px / 54 px.
- **Defecto 1 — título partido**: la imagen sigue **flotada a la derecha a
  260 px** dentro de una columna de 312 → al `<h3>` de 32 px le quedan ~52 px y
  se parte letra a letra: **"Pa / nel / sol / ar"** (alto 138 px para dos
  palabras). Visible en `shots/m390-bloque-panelsolar.png`.
- **Defecto 2 — tabla recortada con pérdida de contenido**: las tablas `matrix`
  miden **472 px** (Panel solar) y **432 px** (cargadores) dentro de 312.
  Ningún ancestro del contenido tiene `overflow-x` distinto de `visible`, pero
  **`.et-boc` sí lleva `overflow-x: hidden`** → la tabla se **corta en x=390**
  (su borde derecho cae en 511) y **no hay scroll horizontal**
  (`document.scrollWidth == clientWidth == 390`). La 4ª columna, "Notas de
  instalación", es **inalcanzable en móvil**. Las tablas `pairs` (312 px) sí
  caben.

**Decisión pendiente para Fase 2** (no la tomo aquí): replicar los dos defectos
al pie de la letra —coherente con la política de emulación fiel del proyecto,
que ya conservó cosas como los botones cortados del sticky del monitor— o
corregirlos (título con `min-width`/imagen no flotada en móvil, y tabla en un
contenedor `overflow-x: auto`). El defecto 2 **oculta datos al usuario**, así
que conviene decidirlo explícitamente antes de construir.

## 9. Lo que NO existe en esta página (verificado, no re-investigar)

Sin **filtros**, sin **categorías clicables**, sin **tabs**, sin **paginación**,
sin **buscador**, sin **ordenación**, sin **carrusel**, sin **lightbox**, sin
**popup/formulario**, sin **visor 360**, sin **acordeón** propio (el único es
el FAQ compartido), sin **animaciones**, sin **hover en tarjetas**, y sin
**enlaces dentro de las fichas** (`links: 0` en las 11 — la ficha no lleva "Ver
más"; es contenido terminal). Los dos únicos CTAs de toda la página son el del
hero (→ `/es/contacto/`) y el de Artículos (→ `/es/recursos/guias/`).

## 10. Enlaces entrantes desde el clon

`src/lib/monitor.ts` ya define `href: ${ACC}#<slug>` para sus 9 accesorios
(`POWER_PACKS` + `METEO_SENSORS`) apuntando a esta página. Al construirla, esos
"Ver más" del monitor pasan a resolver **dentro del clon** — conviene
comprobarlo en Fase 2, incluido que el ancla caiga en el sitio con el offset de
80 px de §5.
