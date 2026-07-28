# BEHAVIORS.md — arquetipo SECTOR / SOLUCIÓN VERTICAL

> Recon (Fase 1) del **2026-07-28** sobre
> `https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/`.
> Medido en vivo con ratón real por CDP (puppeteer-core, Chrome del sistema,
> headless, perfil limpio, Cookiebot bloqueado) a **1440×900** y **390×844**.
> Sonda: `behaviors.mjs` en el scratchpad de la sesión.

## Resumen: cuántas cosas se mueven aquí

Muy pocas, y **ninguna es nueva**. La página es casi enteramente estática:

| # | Comportamiento | Disparador | ¿Existe ya en el clon? |
|---|---|---|---|
| 1 | Header sticky + mega-menú + menú móvil | scroll / hover / tap | ✅ `HeaderNav` |
| 2 | Carrusel de logos `banda-clientes` | **tiempo** (2,5 s) | ✅ `TrustBar` (falta la variante sin titular) |
| 3 | Slider CTA de ancho completo, 3 diapositivas | **tiempo** (7,0 s) + click en dots/flechas | ⚠️ `CtaBanner` hoy es de 1 diapositiva sin autoplay |
| 4 | Flechas del slider al pasar el ratón | hover | ⚠️ igual que arriba |
| 5 | Tabs `#lista-soluciones` (AIR Pro/Lite/Cloud) | **hover** en escritorio · **tap** (acordeón) en móvil | ✅ `ProductosTabs` + `useListaContenido` |
| 6 | Zoom de la foto en tarjetas de caso y de artículo | hover | ✅ `UltimosProyectos` / `UltimosArticulos` |
| 7 | Botón "subir" | scroll | ✅ `ScrollToTop` |
| 8 | Banner de cookies (Cookiebot) | carga | decisión de producto aún abierta (igual que en las otras 4) |

**No hay**: acordeón de FAQ, caja de anclas con scrollspy, lightbox de vídeo,
visor 360, buscador, filtros, formularios, ni animaciones de entrada.
`html { scroll-behavior: auto }` (coherente con el hallazgo A1 de /accesorios) y
los únicos `a[href="#"]` de la página son los 11 del propio header y del slider.

---

## 1 · Header (compartido)

Sin novedad: mismo template TB que las otras cuatro páginas. Se aplica todo lo
ya cerrado en P2/M4/B8 (tres regímenes de fila por ancho, dropdowns anclados a
la línea 119/73, puente de gracia de 20px, vidrio sticky). **Único matiz**: la
foto de fondo de la sección es la del sector y **no varía entre visitas**, al
contrario que la cabecera genérica de las otras páginas.

## 2 · `banda-clientes` — carrusel de logos

Shortcode `.swiper.clientesSwiper` — **la misma instancia y la misma
configuración** que la home (`init.js`): `slidesPerView` 2 → 6 por breakpoint,
`spaceBetween` 30 → 50, `loop: true`, `grabCursor: true`,
`autoplay: { delay: 2500, disableOnInteraction: false }`.

Verificado en vivo: el `transform` del wrapper cambia de `−1654.33px` a
`−1890.67px` en 2,6 s → **autoplay activo**. 13 logos reales + clones de bucle
(25 slides a 1440, 17 a 390). Logos a **80px** de alto en ambos viewports;
slide 186.3 a 1440 y 170.5 a 390.

Lo único distinto respecto a la home es la **caja**, no el comportamiento:
aquí no hay columna de titular y la fila va al 95%.

## 3 · Slider CTA de ancho completo — 3 diapositivas

`et_pb_fullwidth_slider et_slider_auto et_slider_speed_7000 et_pb_bg_layout_dark`.

**Cadencia medida** (muestreo cada 500 ms durante 31 s, 5 cambios):
2553 → 9721 → 16342 → 23522 → 30637 ms.
Deltas 7168 / 6621 / 7180 / 7115 → **periodo ≈ 7,0 s**, bucle infinito, sin
desplazamiento horizontal (fundido cruzado).

> ⚠️ **No cuadra con la regla que se dedujo en `/software`** ("5 s de
> `et_slider_speed_5000` + 1 s de fundido = 6000 ms"): si el fundido sumara,
> `speed_7000` daría 8000 y aquí da 7000. Lo medido es lo medido; para
> construir este bloque el intervalo es **7000 ms**. Queda anotado que si
> algún día se re-mide el carrusel de /software habrá que decidir cuál de las
> dos lecturas describe la regla — no se ha re-medido en esta tanda.

- **Dots**: 3, blancos, 7×7 con `border-radius: 7px` y `margin-right: 10`,
  centrados a `bottom: 20px` (móvil 13.25). El activo y los inactivos comparten
  color de fondo — los distingue la opacidad del tema.
- **Flechas**: en reposo `opacity: 0` con `right/left: −22px`; al pasar el ratón
  por el slider, **`opacity: 1` y `±22px`**, transición `0.2s ease-in-out`.
  El disparador es la clase `et_slider_hovered` que Divi añade **por JS**
  (verificado: `et_slider_hovered: true` tras `mouse.move` real).
  ⚠️ *Trampa de método, la misma que en /software*: leer computed styles justo
  después de mover el ratón todavía devuelve `opacity: 0`; hay que esperar a que
  el JS meta la clase.
- **En móvil las flechas son visibles siempre** (`opacity: 1`, `left/right: 0`,
  48px, blancas). No es hover: es el estado por defecto a 390 (ver tira
  `m390-05`).
- El **título es un enlace** (`h4.et_pb_slide_title > a`) al mismo destino que
  el botón. En los 7 sectores los 3 slides apuntan a `/es/contacto/`.

## 4 · `#lista-soluciones` — tabs de producto

Mismo shortcode `lista-contenido` de la home, transcrito en `init.js` como
`$("#lista-soluciones li span").on("mouseenter", …)`.

**Escritorio (≥768) — verificado con ratón real:**

| Acción | Resultado medido |
|---|---|
| `mouseenter` sobre "AIR Lite" | el panel de la derecha pasa a AIR Lite; la etiqueta se pone azul + `opacity: 1` + icono ⊖; las otras dos a `#333` + `opacity: .3` + ⊕ |
| salir del módulo (`mouseleave`) | **no revierte** — el panel se queda en AIR Lite |
| `click` sobre la etiqueta | mismo efecto que el hover, sin estado adicional |

O sea: hover **exclusivo y persistente**, sin cierre. Es exactamente lo que ya
implementa `useListaContenido`. (No confundir con el `#power-packs` de
/monitor-calidad-aire, cuya nota de QA describe un "vuelve al fijado" —
ahí la instancia es la variante *accesorios* del shortcode.)

Geometría del estado activo: etiqueta **30px/33 w700 `#0075C9`**, subtítulo
`.subtitulo-producto` **16px/17.6 w400 azul, display block**, iconos
`ico-minus-azul.svg` / `ico-plus-negro.svg` a **28×28** en `100% 5px`, panel
**780.2×500** con `border 1px #777`, `radius 10`, `padding 30` y foto de
359×320 sin flotar.

**Móvil (<768):** la columna de contenido se oculta (`display: none`) y el panel
se renderiza **dentro de cada `<li>`** (`display: flex`). Es el acordeón táctil
ya resuelto en B5: al abrir, anima el scroll hasta `li.offset().top − 5`
(~600 ms); al cerrar, no hay scroll.

## 5 · Tarjetas de caso y de artículo

- `.case-imagen-container` y `.entry-featured-image-url`: **`border-radius: 10px`
  + `overflow: hidden`**; la capa interior con la foto lleva `transition: all
  0.5s` y escala al hover (mismo patrón que la home).
- Tipografía de la tarjeta de caso: taxonomía 13.5/16.9, cliente **16/30.6
  w700**, título **20/27 w400 `#333`** (azul al hover).
- Tarjeta de artículo: título 20/27 w400, fecha 13.5/20.9.
- Foto de caso **386.1×260.6** a 1440 · **335.4×226.4** a 390.

**Los 3 artículos rotan en cada carga** (tres cargas del mismo día dieron tres
tríos distintos). Igual que en las otras páginas: se congelan en `lib` y ese
bloque no se compara px a px (P4).

## 6 · Botón "subir"

`.et_pb_scroll_top` — `position: fixed`, **40×40**, `bottom: 125px`,
`right: 0`, `background: rgba(0,0,0,.4)`, `border-radius: 5px 0 0 5px`,
`padding: 5px`, icono de 30px blanco, `z-index: 99999`. Idéntico al de la home
(medido en la misma tanda). El clon lo tiene a 44×44 sin radio — ver la nota
de QA en `PAGE_TOPOLOGY.md` §3.

## 7 · Lo que se comprobó que NO ocurre

| Hipótesis | Resultado |
|---|---|
| FAQ / acordeón | **0** `.et_pb_toggle` reales — y **0 en los 7 sectores** (el `et_pb_toggle` que aparece en el HTML servido es CSS del bundle de Divi, no un módulo) |
| Caja de anclas + scrollspy | **0** elementos `.caja-anclas` / `[class*=anclas]` |
| Lightbox de vídeo | **0** `<iframe>`; ningún popup de *popups-for-divi* con contenido |
| Mapa | **0** `.et_pb_map` en Urbano (sí lo tienen Industria 41 pines, Puertos 30 y Minería 32 — fuera del alcance de esta página) |
| Newsletter | no existe en el arquetipo |
| Animaciones de entrada | mismo caso que M7 en la home: el critical CSS de Divi las anula; nada que implementar |

## 8 · Notas de método de esta tanda

Dos trampas nuevas, pagadas con tiempo, que conviene no repetir:

1. **`clip` en `page.screenshot()` va en coordenadas de DOCUMENTO** (lleva
   `captureBeyondViewport` implícito) y, como `fullPage`, **reinicia el override
   de device metrics**. Con `clip: {x:0,y:0,…}` fijo salieron 13 capturas
   idénticas de la cabecera, y con `y` variable salieron a la escala
   equivocada. Es la misma familia de problema que ya documenta el CLAUDE.md
   para `fullPage`.
2. **Para móvil hay que emular con `page.setViewport({isMobile:true})`, no con
   `Emulation.setDeviceMetricsOverride` a pelo por CDP.** Los dos miden igual
   (docHeight 10886 vs 10913, filas 335.4 en ambos), pero puppeteer **no
   recuerda** el override hecho por CDP al capturar: `page.screenshot()`
   devuelve la ventana real (800×600) con el contenido de 390 y relleno blanco.
   Con `setViewport` la captura sale a 390 de verdad.

Y una confirmación de las que ya estaban: hay que forzar `loading="eager"` y dar
un pase de scroll + settle antes de medir, o el slider y las fotos del bloque K
devuelven alturas de menos.
