# Pendientes de QA — clon kunakair.com/es

## /monitor-calidad-aire — QA visual final (2026-07-26)

> Comparación CDP por secciones (puppeteer-core + Chrome del sistema, perfil
> limpio, Cookiebot bloqueado) a **1280** y **390 real** (device metrics), clips
> lado a lado + computed styles. Referencias del día: original desktop
> **12927** / móvil **22363**. Clon tras la tanda: **12489 (−438)** / **21546
> (−817)**. Sondas reutilizables en el scratchpad de la sesión (`qa/snap.mjs`
> captura+clips por sección/ancla, `qa/probe*.mjs` computed, `qa/hover2.mjs`
> hover por ratón real — ojo: en el original el label es `p.lista-titulo`, el
> primer `a` del li es el "Ver más" del panel oculto con rect 0×0).

### Corregido en la tanda (desktop y móvil salvo indicación)

- **Cabecera**: el original sirve `cabecera-construccion.jpg` (no
  cabecera-puerto) y la banda mide **137px móvil / 177px desktop** (era 220/300).
- **Retícula**: TODAS las filas de esta página son Divi **80% máx 1380** (no
  85%/1080), gutter 5.5%, cols 47.25 · 29.6667/64.833 · 20.875/73.625; secciones
  py 4vw (50 móvil), filas pt 2vw (30 móvil). Aplicado en breadcrumb, hero,
  fila 2, S3, artículos y FAQ. Esto arregló de rebote todos los wraps (chips
  9/fila, blurbs, "Preguntas frecuente-s"…).
- **S2 CtaBanner**: el slider SÍ es `bg_layout_dark` → **botón BLANCO** con bg
  rgba(0,0,0,.15) (la spec §1 decía outline #333 — corregida aquí), desc py 5%
  desktop (la home mantiene sus 74px) y párrafo **14px/22.4 en móvil**. Exacto:
  400/400 d · 376/377 m.
- **Fila 2**: checklist en blurbs **3×2 centrados** (icono 50 arriba, h4 18/21.6
  w300, item 199, mb28; móvil 2×150), "La gama de contaminantes más completa"
  es **H3 20px/24 w700 #333** (no azul 37), subíndices añadidos en el recuadro
  azul 2 (O₃/NO₂/SO₂/PM₂,₅/PM₁₀), logos validadores con los SVG **cuadrados**
  (hero: fila única 69/49; fila 2: 94px ×6 gap 19; móvil 2 col 90-150), y la
  **imagen del mástil se OCULTA en móvil** (col izq original: 308px).
- **Sub-nav anclas**: caja a ancho de columna con **flecha `ico-arrow.svg`
  30×30** en cada ítem (bg del `a`, pr 30), ul pb16, mb 27, col pt 32; móvil
  gris #f4f4f4.
- **Aplicaciones**: slide embebido **300px en móvil** (no 450; regla en
  globals), dots remontados a ~28px bajo los slides (solo embedded), banner-guía
  px 40 en móvil. Móvil **+3 exacto**; frase azul 37px TAMBIÉN en móvil (hay un
  segundo "Facilitamos…" a 18px en Beneficios que confunde sondas de texto).
- **Ensayos**: lista de resultados con **chips circulares 46×46** (strong dentro
  del enlace, borde 2px azul, 14px w700), filas de 56, relleno por **columnas**
  (columns-2), flecha → al final del enlace y CTA azul **a la izquierda**.
  Móvil −2.
- **Especificaciones**: labels alineados ARRIBA en filas altas, gap título→tabla
  28, y en móvil columnas **35/65 con padding de celda 12** (antes 50/50+40 →
  +137 de wraps).
- **Artículos y Guías**: variante `monitor` de UltimosArticulos — **sin
  watermark K** (sección bg none), fila 80%, pt 140, CTA a +46 con remate
  30+64.
- **FAQ**: sección 4vw + fila pt20/pb64 (50/19.5 móvil), toggles con borde
  arriba Y abajo, remate mb30. Desktop −2, móvil +9.
- **Footer**: nueva prop `backgroundStrip` con la franja `footer-background`
  (`cabecera-puerto-1.jpg`, 41/40px).
- **Footer TB (P1, cerrado 2026-07-27)**: `Footer` gana `template="tb"` (la
  prop `backgroundStrip` desaparece — el tb la implica) con la plantilla TB
  propia de esta página medida módulo a módulo (`qa/p1-probe.mjs`, 1280/390
  reales): **los paddings Divi son % del ancho del PADRE** (sección links pt
  4% desktop / 50px móvil y pb 0; fila links py 2% / 30px; fila legal py 1%
  en ambos) → el shell tb son secciones a ancho completo con la fila
  **80% máx 1380** dentro (la home conserva su wrapper 85% byte-idéntico);
  columnas **sin gutter** (5×20%, el aire lo pone el mb 32 del widget → ul
  pb 32), **li 14px/lh 30.6 con mb 7** (stride 37.6, no 26), cabeceras p
  30.6 pegadas al ul (mb 0 también desktop), Suscríbete **pb 2 desktop /
  3.1 móvil** (h 37/38.1) con mt 16 + mb 46, CERT img + pb 32, legal
  **12px/lh 30.6 también en desktop** (2+1 líneas = 91.8; p2 a 9.6px) con
  mb 32/62, iconos móvil **gap 38 + pl 19** (no 42.7/9) en caja 31.6 +
  60 hasta idioma, fila legal py 1% (12.64/3.89), **sin espaciador de 40**
  y franja 41/40. Resultado: desktop **694.2 vs 694.2 (exacto**, links+legal
  653.2 = 653.2; era −41.8**)**, móvil **2053.7 vs 2053.1 (+0.6**, era
  −251.5**)** con las anclas de columnas idénticas al píxel (y 369.2 /
  732.5 / 1083.2 / 1484.1, iconos y1887.6, idioma y1979.2). Home verificada
  sin regresión: móvil **19182 / footer 1761.6 exactos** (B4) y desktop
  1418 footer **592.2 exacto**.
- **Header P2 (cerrado 2026-07-27, `qa/p2-probe.mjs`/`p2-cycle.mjs`)**: el
  header original (MISMO template en home y monitor — verificado a 1280
  idénticos) tiene **tres regímenes por ancho de viewport útil**:
  **≤1379px → fila `contenido` al 92% sin max-width** (1177.6 a cw1280, col
  logo 11.87% = 139.8 + margen 5.5% = 64.8, menú 973) y el menú entero en
  **UNA fila** con "Descargar catálogo" inline a 12px del pill de ayuda
  (catálogo x1059.5 y60, también en sticky: fila 75, catálogo y14);
  **1380–1417 → fila ~85%** y el catálogo cae a su 2ª línea (el estado
  verificado de la home a cw1403 en M4); **≥1418 → fila a ancho completo**
  y vuelve a una fila (fuera de alcance — la referencia de la home es
  cw1403). Fix en `HeaderNav` con variantes `lg:max-[1379px]:*` (fila 92%
  sin max-w, logo 11.87%, ml 5.5%, columna de menú en flex-row con gap 12):
  el clon a 1280 clava el contenedor (x51.2/1177.6/139.8/973) en top,
  sticky y vuelta a 0, en ambas páginas. Residuos anotados: catálogo
  x1013.3 vs 1059.5 (−46, deriva acumulada de anchos de items — misma
  familia que el dLeft de M4), alto de fila 115.9 vs 95.5 (pre-existente a
  todos los anchos), y a cw1265 (1280 CON scrollbar) el original ya no cabe
  y envuelve por flex-wrap mientras el clon (items más estrechos) aguanta
  hasta ~cw1210. **Re-verificado sin regresión**: home cw1403 con 35 links
  del header idénticos pre/post, M4 por hover real dTop 0/−1 en los 8 casos
  y dLeft −11/−20/−34 (los residuos aceptados), home docH 11837 / footer
  592.2 (B4). Ojo QA: la cabecera del original sirvió `cabecera-puerto` en
  esta tanda (el 26-07 sirvió construcción) — la imagen VARÍA entre visitas,
  no re-investigar.
- **Hover #power-packs (desktop)**: ✅ verificado por ratón real contra el
  original — mismo comportamiento exacto (hover = preview con mouseenter
  ~300ms, click = fija, mouseleave = vuelve al fijado; opacidades .3/1 y ⊖/⊕).
- Home verificada sin regresión tras la tanda: móvil **19182 exacto**; desktop
  por secciones idéntico (el hero es 100vh — depende del alto de viewport).

### Pendientes (residuos anotados, por orden de magnitud)

> Referencias re-medidas el 2026-07-27 (el contenido del blog del original
> varía a diario y mueve el total — no re-investigar): original **12533 d /
> 22248 m**; clon tras P1 **12567 (+34) / 21798 (−450)**. El footer ya no
> resta: el +34 desktop es P4 (artículos congelados vs original más corto
> hoy) y el −450 móvil es la suma P3+P4+P5+P6 ya anotada.

| # | Zona | Delta | Nota |
|---|------|-------|------|
| P1 | ~~Footer TB (esta página)~~ | ✅ 2026-07-27 | Resuelto — ver «Footer TB» en la lista de corregidos: `template="tb"` con secciones a ancho completo, fila 80%, li 30.6+7, paddings % del padre. Desktop exacto, móvil +0.6. |
| P2 | ~~Header a <~1330px~~ | ✅ 2026-07-27 | Resuelto — régimen responsive ≤1379px en `HeaderNav` (ver «Header P2» en corregidos). No era un wrap del texto: el original tiene TRES regímenes de fila por ancho y a ≤1379 mete todo el menú en UNA fila. M4 re-verificada sin regresión. |
| P3 | Fila 2 móvil | −209 | Ritmo de módulos móvil de la col derecha (space-y 28 vs mezcla Divi 18/30). Desktop quedó −90. |
| P4 | Artículos y Guías | −55 d / −194 m | **La ÚNICA fuente conocida de dispersión de todo el sitio** — ver «P4, ascendido» más abajo. Alturas dependientes del CONTENIDO: los 3 posts van congelados (decisión §4) y el original los sortea — no comparable px a px. |
| P5 | Sondas/Paquetes móvil | −94 / −43 | Acordeón inline `lista-contenido` algo compacto vs original. |
| P6 | Especificaciones móvil | +74 | Wraps residuales de la tabla (original trunca labels con overflow). |
| P7 | Chips fila 1 | 10 vs 9 | A 1280 el clon mete NMHC en la 1ª fila (geometría de chip idéntica; es el whitespace inline de li del original). |
| P8 | Círculo "N" en capturas | N/A | Es el indicador DevTools de Next (el server corre `next dev`, no `next start` — nota de cabecera desactualizada). No existe en producción. |


> Estado tras la Fase 5 (QA visual) del 2026-07-22, actualizado el 2026-07-23
> tras cerrar A1 y A2. Comparación por capturas CDP full-page (viewport real
> 1440×900 → ancho útil 1418px; móvil emulado 390×844) entre
> `https://kunakair.com/es/` y `http://localhost:3000/`.
> Alturas de referencia (2026-07-23, tras M1+M2+M3): original desktop
> **11863px** / clon **11848px** (−15); original móvil **19221px** / clon
> **19208px** (−13). No quedan deltas móviles por sección fuera de banda.
> **Tras B4 (2026-07-23): clon móvil 19182 (−39)** — el footer ya no compensa
> con +26.6 el resto de deltas (todos en banda por sección); el acumulado
> −39 es la suma de residuos ya anotados, no un defecto nuevo.
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
| B7 | TrustBar / carruseles | En capturas simultáneas los logos/slides visibles difieren entre original y clon por el instante del autoplay. **No es defecto** — anotado para no re-investigarlo en futuros QA. | N/A |

## Resueltos

| # | Sección | Resolución | Fecha |
|---|---------|-----------|-------|
| B5 | Productos — acordeón móvil (scroll animado) | **Resuelto** (sonda `qa/b5-probe.mjs`, ratón real por CDP a 390 — ojo: el handler del original es **mouseenter**, `el.click()` no lo dispara, y el pre-scroll de sondas debe ir con `behavior: "instant"` porque el clon lleva `scroll-behavior: smooth` global). Comportamiento medido del original: al ABRIR anima ~600ms hasta `li.offset().top − 5` (liTop final 5.4/4.6) incluso con otro panel cerrándose encima; al CERRAR (clic en el activo) no hay scroll. Implementado en `ProductosTabs.tsx`: refs por li + `window.scrollTo({top: li − 5, behavior: "smooth"})` en un `useEffect` post-commit (medir tras el cierre del panel anterior, como el offset post-toggle de jQuery); el cierre no dispara scroll. Verificado en el clon: abrir → liTop 5.3 animado, cerrar → sin scroll programático (−8 de scroll anchoring del navegador, también ausente de animación en el original), reabrir → 5.3. Orden y nº de tabs verificado idéntico (Pro, Lite, Cartuchos, Cloud, API). **Resto anotado fuera de alcance**: los paneles abiertos de Lite y Cartuchos miden +27px en el clon (857.8/884.8 vs 830.8/857.8) y el de Pro −8.9 — estado transitorio del acordeón, no afecta a las alturas de página del QA estático; pendiente solo si algún día se hace QA de estados abiertos. | 2026-07-23 |
| B4 | Footer (móvil) | **Resuelto: 1761.6 vs 1761.4 (+0.2)** (sonda `qa/b4-probe.mjs`, 390 real por `Emulation.setDeviceMetricsOverride` — reprodujo primero las referencias 19221/19208 exactas, validando la metodología). El +26.6 era un desajuste de ritmo **compensado**: columnas de enlaces demasiado altas (headings 39.8 vs 30.6, li 28 vs 26, ul pb 18 vs 14 → +25/+29/+31 por columna) canceladas por una zona legal demasiado compacta (lh 19.2 vs 30.6, gaps 24 vs 62 → −79.6). Causas raíz: (1) el original hereda **line-height 30.6px FIJO** (1.7em de body 18px) — el clon tiene `line-height: 1.7` sin unidades en globals y los hijos escalan por su font-size; (2) el li heredaba fs 18 del body y el strut inflaba la caja de 26 a 28 — el original pone **fs 14 en el propio li**. Ritmo móvil aplicado como base (<640) con `sm:` restaurando los valores desktop verificados: sección pt 50, fila pt 30, headings mb-0/lh-30.6, ul fs14/pb14, botón Suscríbete mt 48 (32+16) / alto 45 (pb 10 móvil) / +46 después (30+16), tras CERT 62 (32 widget + 30 fila), legal fila pt/pb 4 (1%), legal lh 30.6 + 62 hasta iconos, iconos +38 hasta idioma, e **iconos sociales a 42.7px de separación con 9 de entrada** (margen Divi responsive `0 33.7 0 9`; desktop sigue a 9px — verificado en árbol desktop). Desktop intacto por construcción (todo `<640`) y verificado: footer 592.2 ≈ 592. Capturas lado a lado coincidentes; matiz sin efecto en altura: "Editar preferencias de cookies" envuelve como bloque (es botón inline-block) donde el original corta la frase — mismas 3 líneas. **Nuevo total móvil del clon: 19182 vs 19221 (−39)** — ver nota de cabecera. | 2026-07-23 |
| B8 | Mega-menú — sub-submenú "Cartuchos inteligentes" + residuo del panel | **Resuelto** (sonda `qa/b8-probe.mjs`, hover real por CDP sobre original y clon en top/sticky). Medido el original: panel del mega **1418×198 SIN border-top** (el spec de Fase 3 decía 1px — computed 0px; ese border y el `px-6 py-4` del clon eran el residuo de 15px), celdas li de **200×198** con stride 202.8 (whitespace 2.8px entre inline-blocks), `a` con py 10 / 15px / lh 28, img 130 con py 10 (hover 150 + py 0 = caja constante de 150, sin reflow). Sub-sub: `absolute top:197px` del li **en ambos estados** (y316 top / y270 sticky), grid `auto-flow: column` 9 filas × 2 columnas (**273px + 296px** — la 2ª la fija el max-content de NMHC), padding 16/0, min-w 500, sombra `0 2px 5px` también en sticky, toggle instantáneo por visibility+opacity (sin transición), items 13.5px/fw500/lh 1.6/pad 6-20, hover `bg rgba(0,0,0,0.1)` + texto azul, caret ETmodules "3" 16px en right:0/top:160 del a (→ ChevronDownIcon absolute). `self-start` en los items para que el hover del último de cada columna no estire a la fila de 55.2 del wrap de COV (como el original). Re-probe del clon: panel, celda, img, grid, filas/columnas e items **idénticos al píxel** en top y sticky; verificado visualmente en navegador. Los datos (18 contaminantes) ya estaban en `nav.ts` desde Fase 2; el acordeón móvil ya los renderizaba desde A1. La deriva de ~6px/item de anchos de texto en la fila de links (dd Recursos −34px) queda como estaba — anotada en M4 como residuo aceptado. | 2026-07-23 |
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

## /accesorios — QA visual (2026-07-27)

> Comparación lado a lado clon (localhost:3000) vs original a **1280×631**
> (DPR 1.5), medida con computed styles + rects vía CDP sobre los 11 `id` de
> ficha, que existen en ambos. Alturas de documento del día: original
> **11423**, clon **11125 antes** → **11211 después** de la tanda (−212).
> Móvil 390 **no verificado** (ver pendiente A4).
>
> **Tres trampas de método que invalidaron medidas y conviene no repetir:**
> 1. **Imágenes lazy del original**: sin forzar la carga, el original mide
>    11361 en vez de 11423 y 3 de los 6 punteados dan `w=0`. Hay que recorrer
>    la página y poner `loading='eager'` antes de medir.
> 2. **`requestAnimationFrame` no corre en pestañas ocultas**: el scrollspy
>    (que va dentro de un rAF) se queda congelado y parece roto en AMBOS
>    sitios. Para probarlo hay que desplazar con ratón real sobre la pestaña
>    activa y leer el resultado en la captura, no con `scrollTo` vía JS.
> 3. `html { scroll-behavior: smooth }` hace que `scrollTo` + lectura
>    inmediata de `scrollY` devuelva valores obsoletos: usar
>    `behavior:'instant'`.

### Corregido en la tanda (desktop 1280)

- **`padding-bottom: 10px` en los titulares** (regla Divi de h1/h2, la misma
  que ya aplicaba `SectionTitle` en la home). Faltaba en los 5 titulares
  escritos a mano en `page.tsx`: h1 46→**56**, h2 del hero, h2 "Información
  sobre el producto" 55→**65**, y los dos h2 de categoría 80→**90**. El h3 de
  ficha y el h2 del FAQ ya la tenían.
- **h2 del hero a `md:w-[80%]`**: en el original el módulo de texto mide
  **467.8** dentro de una columna de 584.8, así que el titular envuelve a
  **4 líneas**; el clon lo tenía a ancho completo y salían 3 (−55px). Ahora
  467.4 y altura 230 = original.
- **Punteado 65px a la izquierda de la retícula**: el original coloca los 6 a
  `l=61.5` (la fila empieza en 126.5); el clon ponía a `l=126.5` los 4 de
  `page.tsx` (los 2 de componentes compartidos ya estaban bien). Aplicado
  `md:-left-[65px]` (en los de categoría, `-left-[65px]` a secas: ya iban
  `hidden md:block`).
- **Hueco h2 de categoría → caja de anclas**: `mb` 32 → **27.9** (medido).
- **`AnchorNav` a 16px/16px — REGRESIÓN PROPIA**: al extraer el componente
  desde `SubNavAnclas` (commit 91fe57f) se subió a `text-[17px]` y padding
  17/17 siguiendo el spec `anchor-nav.spec.md`. El original mide **16px de
  fuente y padding 16px 16px 0** en ambas páginas, que es justo lo que tenía
  el `SubNavAnclas` previo. Revertido a 16/16 — **esto también toca
  /monitor-calidad-aire**, devolviéndolo a sus valores de la QA de julio.
  El spec sigue diciendo 17; conviene corregirlo.

### A1 · Salto por hash — RESUELTO (2026-07-27, misma sesión)

**Síntoma**: `/accesorios#pluviometro` dejaba la página en `scrollY = 0`, así
que los 9 "Ver más" de /monitor-calidad-aire aterrizaban arriba del todo.

**Causa raíz**: `html { scroll-behavior: smooth }` en `globals.css`. Con esa
regla, el salto nativo al fragmento en la carga inicial pasa a ser una
**animación**, y cualquier reajuste de layout durante la carga la cancela: la
página se queda donde estaba (0). No era, como se supuso al principio, que el
App Router reseteara el scroll tras hidratar — esa hipótesis nunca llegó a
probarse (el indicio que lo delataba: `history.scrollRestoration` seguía en
"auto", o sea que el efecto del componente que se probó ni se ejecutó).

**Arreglo**: eliminar la regla. Tres líneas de CSS, sin JS ni componentes.

**Por qué es seguro y además más fiel**:
- El original tiene `scroll-behavior: **auto**` en `html` y en `body` (medido).
- `scroll-behavior` solo aplica cuando la API de scroll **no** especifica
  `behavior`. Los dos únicos consumidores de scroll suave del clon —
  `ScrollToTop` y `AnchorNav`— lo pasan **explícito** en JS, así que no cambian.
- El único otro enlace interno era `href="#catalogo"` en `SectoresIntro`, y
  **no existe ningún `id="catalogo"`** en el proyecto: no apuntaba a nada.
  El `href="#"` de `HeaderNav` lleva `preventDefault()`. Cero consumidores.

**Verificado**: los 4 slugs probados aterrizan a 80px del viewport (el
`scroll-mt-[80px]` de `AccesorioCard`) — `panel-solar` 79.7 · `piranometro` 80
· `gashood` 80.1 — y, sobre todo, **clic real en un "Ver más" desde
/monitor-calidad-aire**: navega a `/accesorios#anemometro-mecanico`, queda en
`scrollY 3038` con la ficha a **79.7** y el h3 correcto.

**Desviación deliberada que queda en pie**: el original aterriza la ficha a
**0px** en la navegación por hash y a **80px** al pulsar un ancla de la caja
(BEHAVIORS §5). El clon usa 80 en ambos casos, para que la cabecera fija no
tape el título. Si se quisiera fidelidad estricta, habría que quitar el
`scroll-mt-[80px]` de `AccesorioCard` y asumir que el título queda tapado.

### A4 · Móvil 390 — VERIFICADO Y CORREGIDO (2026-07-27, misma sesión)

Medido con **`Emulation.setDeviceMetricsOverride` a 390×844** (puppeteer-core
sobre el Chrome del sistema, perfil limpio, headless). `resize_window` de la
extensión NO sirve: informa éxito pero el viewport se queda en 1280.
Sonda reutilizable en el scratchpad de la sesión (`qa/m390.mjs` mide fichas,
`qa/m390b.mjs` titulares y punteados; el segundo se convierte a 1280 con un
`sed` sobre las dos líneas de métricas).

**Las dos correcciones móviles funcionan.** Contra el original a 390:

| | Clon | Original |
|---|---|---|
| h3 "Panel solar" | **42px / 1.31 líneas** | 138px / **4.31 líneas** |
| h3 "Cargadores para exteriores" | **74px / 2.31** | 266px / **8.31 líneas** |
| Imagen de ficha | `float:none`, **apilada sobre el título** | `inline-end` |
| Envoltorio de tabla | `overflow-x: auto` | `visible` |
| **4ª columna alcanzable** | **sí** | **no** |
| Scroll horizontal de página | no | no |

O sea: el original parte "Pa/nel/so/lar" letra a letra y deja "Notas de
instalación" inalcanzable; el clon no. Confirmado también a ojo en las
capturas `m390-clon-panelsolar.png` / `m390-orig-panelsolar.png`.

**Pero el pase destapó que las 5 correcciones de la tanda de desktop se habían
verificado SOLO a 1280 y tres estaban mal en móvil.** Corregido:

- **Los h2 son MÁS grandes en móvil, no más pequeños**: el original usa **35px
  en ≤767** para los tres (hero, "Información sobre el producto" y los de
  categoría), incluso para el de categoría que en desktop mide 32. El clon los
  dejaba en 44/44/32. Ahora `text-[35px] md:text-[44px]` y
  `text-[35px] md:text-[32px]`.
- **Interlínea proporcional**: el original mantiene **1.25× el tamaño** en
  todos sus h2 (44→55, 32→40, 35→43.75). Se sustituye el `leading-[55px]`
  fijo por `leading-[1.25]`, que sirve para los dos tamaños.
- **El punteado también cuelga −65px en móvil** (l=−26 con la retícula en 39),
  y el de los titulares de categoría **sí se ve a 390** — lo que desaparece
  bajo 980 es la caja de anclas, no el punteado. Se quitan el `md:` del
  desplazamiento y el `hidden md:block`.
- **`w-[80%]` del h2 del hero aplica en ambos tamaños** (249.6/312 a 390,
  igual que 467.8/584.8 a 1280), no solo desde `md:`.
- El `mb-[27.9px]` del h2 de categoría pasa a `md:mb-[27.9px]`: en móvil no hay
  caja de anclas debajo y el original va a mb 0.

**Resultado tras corregir** — a 390 coincide **exactamente** en todo lo medido
(punteados −26 ×6; h2hero 35px/249.6/272.5; h2info 35px/312/97.5; h2cat
35px/97.5/mb 0; h1 79/pb 10), y a 1280 no hay regresión: la altura total
mejora de −212 a **−101**.

Dos notas para no confundir en el próximo pase:
- **El clon es más ALTO que el original en móvil** (21197 vs 20338, +859). Es
  la consecuencia esperada de apilar la imagen sobre el título en las 11
  fichas; no es un defecto.
- El `mb` del h2 de categoría difiere en la propiedad (clon 27.9 sobre el h2,
  original 0 sobre el h2 y el hueco lo pone el módulo Divi), pero la
  **geometría resultante es la misma**. No "corregirlo" a 0 sin medir el hueco.

### A3 · `overflow-wrap: break-word` — RESUELTO (2026-07-27)

Aplicado en `body` dentro de `globals.css`. Se pone ahí, y no en `SectionTitle`,
porque **`overflow-wrap` es una propiedad heredada** y ese es exactamente el
alcance que tiene en el original (regla global de Divi): medido, el original
devuelve `break-word` en **todos** los h2 de las tres páginas y el clon devolvía
`normal` en todos.

**Efecto buscado**: el h2 "Preguntas frecuentes", en la columna de 211.2, pasa
de desbordar en 2 líneas/120px a partirse en **3 líneas/175px** — el valor
exacto del original — en /monitor-calidad-aire y /accesorios.

**Verificación de no regresión** (las 3 páginas × 2 viewports, alturas de
documento medidas antes y después con el mismo arnés):

| Página | Antes | Después | Original | Δ vs original |
|---|---|---|---|---|
| home @1280 | 11995 | 11995 | 11797 | +198 → +198 |
| monitor @1280 | 12532 | 12532 | 12927 | −395 → −395 |
| accesorios @1280 | 11315 | 11315 | 11416 | −101 → −101 |
| home @390 | 19182 | 19182 | 19221 | −39 → −39 |
| monitor @390 | 21798 | 21819 | 22309 | −511 → **−490** |
| accesorios @390 | 21197 | 21197 | 20338 | +859 → +859 |

Ninguna empeora y monitor@390 mejora 21. A 1280 la altura total no se mueve
porque los h2 afectados viven en la columna 1/4, que no manda en la altura de
la sección. El otro h2 que cambió, "Reconocimientos" de la home (65 → 120),
**convergió con el original** (dejó de aparecer en el diff contra el original).

**Bug latente que destapó, y que hubo que corregir a la vez**: los 4 titulares
de `/accesorios` llevaban `pl-[10px]` y **el original los tiene a
`padding-left: 0`** (medido en los cuatro: h1, h2 del hero, h2 de "Información
sobre el producto" y h2 de categoría). Sin `break-word` el desajuste no se veía
—la palabra larga desbordaba en silencio—, pero con él el h2 del hero pasaba a
7 líneas/316.3 en móvil en vez de las 6/272.5 del original. Quitado el
`pl-[10px]`, vuelve a coincidir exactamente. Es cambio de `page.tsx`, no de
componente compartido.

### A2 · por qué se queda como está (2026-07-27)

**No se arregla, y no es por falta de intento.** El pendiente original decía
"el clon la resuelve en una fila y el original en dos, −47.7px". Medido en
serio a varios anchos (valores estables, repetidos dos veces cada uno):

| Ancho | Original | filas | Clon | filas |
|---|---|---|---|---|
| 1440 | 237 | 2 | 177 | 2 |
| 1380 | 237 | 2 | 177 | 2 |
| 1280 | **188.5** | **1** | 177 | 1 |
| 1024 | 237 | 2 | 177 | **1** |

Es decir: **el original NO sigue una regla de breakpoint**, es no monótono —
una fila a 1280, dos filas tanto a 1024 como a 1440. El mecanismo está medido:
el contenedor del menú del original mide **973px a 1280 pero 962.4px a 1440**
(más ancho en el viewport más estrecho), y por eso el botón "Descargar
catálogo" (165.3) cabe en la fila del menú solo a 1280. Es una rareza del
dimensionado de la cabecera de Divi, no un diseño.

Razones para no forzarlo:

1. Replicarlo significa **reproducir un accidente de layout**, no una regla, en
   `HeaderNav`, que es compartido por las 4 páginas (incluida /software, que
   está por construir).
2. Deshace la decisión de **P2** (commit `4975da9`), que puso el botón en una
   línea a ≤1379px y se validó explícitamente contra regresiones en la home.
3. **No hay defecto visual que arreglar**: a 1440 la cabecera del clon mide
   203.6 y la franja 177, pero el botón termina en 173.6 —dentro de la foto— y
   nunca colisiona con el breadcrumb, que empieza en 189. Comprobado a 1440,
   1380, 1280 y 1024: `invade: false` en los cuatro.
4. La ganancia sería **solo de altura de cabecera** (entre −11.5 a 1280 y −60 a
   1440), sin ningún acercamiento en fidelidad de contenido.

Si en el futuro se quisiera abordar, el punto de partida es entender por qué el
contenedor del menú del original es más ancho a 1280 que a 1440 — hasta que eso
esté explicado, cualquier ajuste será prueba y error.

### Verificado correcto (no tocar)

- **Interiores de las 11 fichas: idénticos al píxel.** Alturas de bloque
  595.7 / 329.8 / 329.8 / 606.8 / 747.1 / 552.5…, imagen 260×244 flotada,
  tablas 339.4 / 117.8 / 394.8, ancho de columna 744.9. El modelo
  `AccesorioCard` + `SpecTable` reproduce el original sin desviación.
- **Footer**: 693.6 en ambos (trabajo de P1 intacto).
- **Scrollspy**: funciona y coincide con el original. Con desplazamiento real
  y pestaña activa, al llegar a "Cargadores para exteriores" ambos marcan
  "Cargador para exteriores". El original **sí** tiene scrollspy en esta
  página (la primera lectura, que decía que no, era el artefacto del rAF).
- **Caja de anclas**: border 1px #333, radius 10, mb 27.2, `li` 30/56,
  flecha `ico-arrow.svg` 30×30 a `100% 0%`, pr 30 — todo coincide.

### Pendiente

- **A2 · Franja de cabecera — NO SE ARREGLA (decisión razonada, 2026-07-27).**
  Ver la sección "A2 · por qué se queda como está" más abajo.
- **A5 · Residuo de altura: −101 a 1280**, y ya está explicado. Con medición
  homogénea (puppeteer, `--hide-scrollbars`) el clon queda en **11315** frente
  a **11416** del original. Ese −101 lo cubren A2 (−47.7) y A3 (−55), que
  suman −102.7: **no queda diferencia sin atribuir**. Los interiores de las 11
  fichas ya coincidían al píxel.

## /software-de-medicion-calidad-del-aire — QA de construcción (2026-07-27)

> Medido con puppeteer-core sobre el Chrome del sistema (headless, perfil
> limpio, Cookiebot bloqueado, `--hide-scrollbars`, imágenes perezosas forzadas
> a `eager` + pase de scroll) a **1280×900** y **390×844 reales**
> (`Emulation.setDeviceMetricsOverride`). Sondas en el scratchpad de la sesión:
> `m390.mjs` (bloques), `m390b.mjs` (anclas verticales), `m390c.mjs`
> (tipografía de la columna 1/3), `m390d.mjs` (ritmo móvil), `shot.mjs`.
> La página **nace con A3 aplicado**, así que no hereda el defecto de los h2.

### Desktop 1280 — anclas verticales (clon vs original)

| Ancla | Clon | Original | Δ |
|---|---|---|---|
| kicker "Kunak AIR Cloud" | 303.8 | 303.3 | +0.5 |
| h1 | 363.8 | 363.3 | +0.5 |
| h2 del hero | 434.2 | 434.1 | +0.1 |
| claim azul | 670.4 | 670.4 | **0** |
| "Información del producto" | 965.8 | 966.5 | −0.7 |
| h2 azul 1 | 985.8 | 986.5 | −0.7 |
| "Características:" | 1589.7 | 1592.4 | −2.7 |
| h2 azul 2 | 1945.5 | 1948.9 | −3.4 |
| párrafo de cierre | 2621.5 | 2631.3 | −9.8 |
| h2 Beneficios | 3219 | 3227.2 | −8.2 |
| h2 Herramientas | 4319.8 | 4331.5 | −11.7 |
| h2 Casos de éxito | 8051.5 | 8062.9 | −11.4 |
| h2 Artículos y Guías | 8848.4 | 8848.3 | **+0.1** |
| h2 Preguntas frecuentes | 9543.9 | 9625.7 | −81.8 |
| **Altura de documento** | **11579** | **11705** | **−126** |

El −126 está **atribuido por completo**: −81.8 es P4 (los 3 posts van
congelados y el original los sortea; los titulares envuelven distinto) y el
resto es el remate del footer ya anotado. Los −9…−12 intermedios son el strut
de los `<span>` de 17pt del original (sus módulos miden 31.9/78.9 donde el clon
da 30.6/77.6): sub-2px por módulo, no se fuerza.

Coinciden **al píxel**: carrusel 655.9×500 con borde 22 #eee, radius 32 y
sombra `0 0 5px`; los 9 puntos en x 738.7…874.7 (paso 17); las flechas en
526.3/1046.2 a 48×48; tarjeta de herramienta 350.1×421.8 con captura
350.1×233.4; blurb de beneficio 744.9×82.6 con icono 40 y gap 15; bloque de
las 6 características 285.2 de alto; caja de anclas 211.2×154.3.

### Móvil 390 — anclas verticales

| Ancla | Clon | Original | Δ |
|---|---|---|---|
| kicker | 267 | 266.6 | +0.4 |
| h1 | 309 | 308.6 | +0.4 |
| h2 del hero | 402.4 | 400.8 | +1.6 |
| "Información del producto" | 1214.7 | 1224.6 | −9.9 |
| h2 azul 1 | 1438.4 | 1430.5 | +7.9 |
| h2 azul 2 | 3457 | 3434.1 | +22.9 |
| h2 Beneficios | 5120.9 | 5081.4 | +39.5 |
| h2 Herramientas | 6978.2 | 6960.6 | +17.6 |
| h2 Casos de éxito | 13852.8 | 13837.5 | +15.3 |
| h2 Artículos y Guías | 15407.8 | 15366.8 | +41 |
| h2 Preguntas frecuentes | 16743.6 | 16870 | −126.4 |
| **Altura de documento** | **20757** | **20916** | **−159** |

Sin scroll horizontal (`scrollWidth == clientWidth == 390`). Interiores
idénticos al píxel: carrusel 312×500, tarjetas 312×396.4 y 312×365.8, blurb de
beneficio 312×148.4, h2 del hero 35px/228.8. El −159 es, otra vez, P4
(artículos→FAQ: −167).

**Cuatro reglas móviles del original que hubo que descubrir midiendo** (todas
aplicadas; sin ellas el clon salía +212 en vez de −159):

1. El **kicker baja a 35px/42** en ≤767 (a 50px "Kunak AIR Cloud" envuelve a 2
   líneas y el hero crece 78px).
2. **"Información del producto" baja a 35px/43.75** (misma regla que los h2).
3. La imagen **`kunak-cloud-dispositivos.png` se OCULTA en móvil**
   (`display: none` medido), igual que el mástil de /monitor-calidad-aire.
4. Las filas Divi usan **30px fijos** de padding y de margin-bottom en móvil,
   no el 2% del ancho; la fila de S3 usa **50px** de padding superior y los 2
   CTAs de la columna 1/4 se apilan con **44.4px** entre ellos.

### Comportamientos verificados en vivo

- **Autoplay del carrusel**: 6000 ms por diapositiva (5 s de `et_slider_speed_5000`
  + 1 s de fundido), bucle infinito, **fundido cruzado** sin desplazamiento
  horizontal. Corrige la estimación de "~3,5 s" de `BEHAVIORS.md` §1, que
  arrancó a mitad de ciclo.
- **Flechas**: invisibles en reposo (`opacity: 0`, `left/right: -22px`) y
  visibles al pasar el ratón (`opacity: 1`, 22px), transición 0.2s. En el
  original el disparador es la clase `et_slider_hovered` que Divi añade **por
  JS**: leer computed styles justo después de mover el ratón todavía devuelve
  `opacity: 0`. Trampa de método, anotada también en la spec.
- **Lightbox de vídeo**: abre `youtube.com/embed/sRLe65Enlbs`, con
  `aria-modal`, `body { overflow: hidden }` y cierre por ✕/Esc/clic fuera. La
  URL se capturó abriendo el modal real del original: el plugin
  *popups-for-divi* **extrae la sección `#video` del DOM** al cargar y la
  reinyecta al pulsar, por eso no aparece en una lectura inicial.
- **Scrollspy**: marca una sola ancla y en el mismo orden que el original
  (`y=0` ninguna · 3500 Beneficios · 4500/6000 Herramientas · 8000/8600 Casos).
  Ojo con la trampa de siempre: con la pestaña en segundo plano
  (`document.visibilityState === "hidden"`) el rAF de `AnchorNav` no corre y el
  scrollspy parece congelado; para medirlo hay que parchear `rAF` a
  `setTimeout` **y descontar un paso de retardo** en la lectura, o usar ratón
  real con la pestaña visible.
- **FAQ**: 19 toggles, todos cerrados de inicio. **Artículos**: 3. **Casos**: 3
  + CTA "Ver todos los casos".

### Pendiente

- **S1 · Residuo de −9 en la columna 2/3 a 1280.** Son 4 módulos que en el
  original miden 1,3px más de alto por el strut de sus `<span>` de 17pt. No se
  fuerza.
- **P4 (heredado)**: los 3 posts de "Artículos y Guías" van congelados y el
  original los sortea en cada carga — −81.8 a 1280 y −167 a 390. No es
  comparable px a px.
- **A2 (heredado)**: la franja de cabecera. Afecta igual que a las otras
  páginas y sigue sin arreglarse por la decisión razonada de más arriba.

## /kunak-api — QA de construcción (2026-07-27)

> ⚠️ **SUPERADA por "/kunak-api — QA VISUAL (Fase 5) · 2026-07-28"**, al final
> del archivo. Se conserva como registro histórico, pero **sus números no valen
> como referencia**: el móvil se midió dentro de un iframe y eso ocultó que S1
> iba +166.5px. Ir a la entrada de Fase 5.

> Medido con Claude in Chrome (`javascript_tool`, computed styles reales,
> imágenes perezosas forzadas a `eager` + pase de scroll) a **cw 1264.7**
> (viewport 1280) contra el original en vivo. El móvil se midió en un
> **iframe de 390** servido desde el propio `localhost:3000` (el navegador de la
> sesión no baja de 1280 de viewport): dentro del iframe `innerWidth` es 390 y
> el contenido 374.7, porque la barra de scroll sí ocupa — las alturas son
> comparables, los anchos van un ~4% cortos.
> Specs de bloque: `docs/research/kunak-api/components/*.spec.md`.

### Desktop 1280 — secciones (clon vs original)

| Sección | Clon | Original | Δ |
|---|---|---|---|
| S0 breadcrumb | 50 | 50 | **0** |
| S1 hero + info + beneficios | 1956.7 | 1965 | −8.3 |
| · fila 1 (hero) | 563.5 | 563.4 | **+0.1** |
| · fila 2 (información) | 771.5 | 776.1 | −4.6 |
| · fila 3 (beneficios) | 570.5 | 575 | −4.5 |
| S2 Artículos y Guías | 613.3 | 699.8 | −86.5 |
| S3 Preguntas frecuentes | 1398.4 | 1404.4 | −6 |
| S4 CTA de ancho completo | 275.1 | 275.1 | **0** |

- La **fila 1 es exacta**: kicker 60, h1 56, h2 175, claim 61.2, botón 43.3 con
  su remate de 90 (30 del botón + 60 del wrapper), columna 550.7 y foto a
  −47.8 (el `margin-top: -10%`, ver `hero-api.spec.md`).
- El **CTA final es exacto**: caja 275.1 con `padding` 55.65 / `padding-right`
  345, `<h2>` 68.5 y párrafo 32 — sin una sola prop nueva en `CtaBanner`.
- Los −4.5 de las filas 2 y 3 son **el strut de los `inline-block`**: en el
  original los blurbs forman line boxes y cada fila se lleva ~2.7px extra de
  interlínea que el flex del clon no tiene. Es el mismo residuo aceptado en
  /software; no se fuerza.
- El **espaciado nuevo de `UltimosArticulos` es correcto**: fila del titular a
  25.6 del techo de sección (original 25.3, el 2%) y CTA a 12.7 de las tarjetas
  (original 12.7, el 1%), con el mismo remate de 94.

### Móvil 390 — verificado

- **Sin scroll horizontal** (`scrollWidth == clientWidth`).
- Altura de documento **9196**, dentro de la horquilla del propio original
  (**9176 / 9203 / 9230** en tres cargas seguidas: los posts se sortean, P4).
- Los 12 blurbs pasan a **2 por fila** al 48% — el corte de esta variante es
  **480px**, no 768 ni 981.
- La foto del hero **se mantiene visible** (a diferencia de la de /software).
- Punteado recortado contra el borde izquierdo, como en /accesorios (A4).

### Pendiente

- **P4 (heredado)**: los −86.5 de "Artículos y Guías". Los 3 posts van
  congelados (el original los sortea) y, además, el módulo de blog del original
  se lleva ~60px de relleno interno que el clon no pinta — el mismo residuo que
  ya tienen /monitor-calidad-aire y /software con el componente compartido.
- **P2 (heredado)**: la franja de cabecera cambia de foto entre visitas. El
  recon capturó `cabecera-urbana.jpg` y el clon la fija; en la comprobación de
  hoy el original servía `cabecera-puerto-1.jpg`. No se re-investiga.
- **A2 (heredado)**: la franja del header mide menos que la del original.
  Decisión ya tomada: no se fuerza.

### A5 · Los blurbs de /software van 13px descolocados en el ORIGINAL (2026-07-27)

Descubierto al extraer `BlurbsIconos`. El tema separa los blurbs con
`margin-inline-end` y lo anula con `:nth-child(3n+1)`, que cuenta sobre **todos**
los hijos de la columna Divi, no solo sobre los blurbs:

| Página | Módulos de texto antes | `3n+1` cae en | Efecto |
|---|---|---|---|
| /kunak-api | 4 | blurbs **3 y 6** | huecos uniformes del 3% ✔ |
| /software | 5 | blurbs **2 y 5** | el 2.º y el 3.º de cada fila salen **PEGADOS** |

Medido en el original de /software: `x = 482.3 · 698.7 · 902.0` con caja 203.3
→ hueco 1→2 = 13.1 (2%) y hueco 2→3 = **0**.

El clon pinta huecos uniformes en las dos páginas, así que en /software el 3.er
blurb de cada fila queda **13.1px a la derecha** del original. **No se corrige**:
el encargo del refactor era extraer el componente sin mover /software, y el
resultado uniforme se ve mejor que el del tema. Queda anotado por si algún día
se quiere fidelidad total.

Del mismo A/B salen otras dos desviaciones **preexistentes** de /software, que
tampoco se han tocado: el `<h4>` del blurb se pinta a **fw 400** cuando el
original es **fw 300**, y el reparto vertical es `icono mb 30 + h4 sin padding`
en vez de `icono mb 20 + h4 pb 10` (el alto total del blurb es el mismo, 105.2,
pero el título va 10px más abajo dentro de la caja).

### /software — A/B del refactor: SIN regresión

Medido a 1280 antes y después de sustituir el bloque inline por `BlurbsIconos`,
recargando la misma página:

| | Antes | Después |
|---|---|---|
| Altura de documento | **11533** | **11533** |
| `<main>` (7 bloques) | idénticos | idénticos |
| `<ul>` de blurbs | 1639.2 / 285.2 / 482.3 / 655.9 | idéntico |
| `x` de los 6 blurbs | 482.3 · 698.7 · 915.1 (×2) | idéntico |
| Alto de blurb | 105.2 / 124.4 | idéntico |
| Icono | 1645.2 / 50 / 558.9 | idéntico |
| `<h4>` | 1725.2 / 19.2 / 482.3 / 203.3 | idéntico |

Lo único que cambia es **cómo** se pinta la separación: antes `margin-right: 2%`
con `nth-child(3n)` a 0, ahora `column-gap: 2%`. Mismas posiciones.
Móvil 390 también verificado: 1 blurb por fila a ancho completo, `mb 30`, sin
scroll horizontal.

## /kunak-api — QA VISUAL (Fase 5) · 2026-07-28

> Sustituye en autoridad al bloque **"/kunak-api — QA de construcción"** de más
> arriba, que midió con Claude in Chrome y **el móvil dentro de un iframe de
> 390** servido desde localhost. Ese atajo ocultó el defecto más grande de la
> página (S1 iba **+166.5px** en móvil): dentro del iframe el ritmo vertical no
> es el de un viewport real. Los números de aquella entrada se mantienen como
> registro histórico; los válidos son estos.
>
> Metodología (la de `CLAUDE.md`): puppeteer-core sobre el Chrome del sistema,
> headless, **perfil limpio**, Cookiebot bloqueado por `--host-resolver-rules`,
> `--hide-scrollbars`, imágenes perezosas forzadas a `eager` + pase de scroll y
> settle. **1280×900** y **390×844 reales** por
> `Emulation.setDeviceMetricsOverride`. Capturas por viewport con `setViewport`
> (nunca `fullPage`). Hovers con ratón real (`page.mouse.move`) y con el zoom
> 1.1 de la imagen como **control de que el hover aterriza**.
> Sondas en el scratchpad de la sesión: `lib.mjs` (base), `secciones.mjs`,
> `s1movil.mjs`, `s2.mjs`, `faq-strut.mjs`, `faqoffset.mjs`, `compartidos.mjs`
> (las 5 páginas a la vez), `bp.mjs` (barrido de breakpoints), `hover*.mjs`,
> `punteado.mjs`, `tiras.mjs` (capturas).

### Resultado por sección (clon vs original)

| Sección | 1280 antes | 1280 después | 390 antes | 390 después |
|---|---|---|---|---|
| S1 hero + info + beneficios | −14.5 | **−14.5** | **+166.5** | **+7.9** |
| S2 Artículos y Guías | −88.1 | **−3.1** | −167.4 | **−18.4** |
| S3 Preguntas frecuentes | −2 | **−10** | +8.5 | **−9.5** |
| S4 CTA de ancho completo | 0 | **0** | −0.8 | **−0.8** |
| Documento | −146 | **−69** | −34 | **−62** |

Ojo con los totales de documento: **no son el indicador bueno**. Antes, el
+166.5 de S1 en móvil cancelaba el −167.4 de S2 y el total salía "bueno" (−34)
con las dos secciones muy desviadas. Lo que cuenta es la tabla por sección.

### Discrepancias encontradas, por prioridad

**ALTA — corregidas**

| # | Qué | Medida | Dónde |
|---|---|---|---|
| K1 | **Ritmo móvil de S1**: 6 huecos inflados y 2 cortos | +166.5 acumulado | `HeroApi`, `InfoProductoApi`, `BeneficiosApi` |
| K2 | **Tarjeta de artículo sin los remates del módulo de blog**: falta `padding-bottom: 25px` en la ficha y el margen inferior (60 desktop / 42 móvil) | rejilla 347.3 vs 435.3 → **−88** | `UltimosArticulos` (compartido) |
| K3 | **Doble raya entre toggles del FAQ**: el clon ponía `border-y` en los 19; el original solo borde arriba en el 1.º y abajo en todos | +18.1 de alto y raya de 2px en vez de 1px | `FaqAcordeon` (compartido) |
| K4 | **Punteado invisible**: con `z-[-1]` se pinta por detrás del `bg-white` de su sección (`elementFromPoint` devolvía la `<section>`) | 3 de los 4 punteados de la página no se veían | `InfoProductoApi`, `BeneficiosApi`, `FaqAcordeon`, `UltimosArticulos` |
| K5 | **Título de artículo azul al hover** donde el original lo deja en `#333` | color | `UltimosArticulos` (compartido) |

**MEDIA — corregidas**

| # | Qué | Medida | Dónde |
|---|---|---|---|
| K6 | **Botón claro sin la geometría Divi**: `px-6` simétrico + flecha en flujo, en vez de `padding 7.5/40.5/9/22.5` con flecha absoluta y `pr 55.5` al hover | +8.5 de ancho en las 3 páginas donde se midió | `LightButton` (compartido) |
| K7 | **El h4 de los blurbs `iconos-md-3` no baja a 16/19.2 por debajo de 981px** | +2.4 por título de 1 línea, +4.8 por los de 2 | `BlurbsIconos` (compartido) |
| K8 | **La columna de toggles del FAQ no baja 10px** respecto al h2 | −10 constante | `FaqAcordeon`, prop `desfaseColumna` |

**BAJA — no se tocan**

- **K9 · Residuo del strut de los `inline-block` (punto abierto 2 del recon,
  RESUELTO Y CUANTIFICADO)**: el original pinta los blurbs con
  `display: inline-block` + `vertical-align: text-top` dentro de una columna con
  `line-height: 30.6px`, así que cada fila forma un *line box* **3.3px más alto**
  que la caja del blurb (paso real 160.3 = 129.2 del blurb + 28.16 de margen
  **+2.94 de interlínea**). El clon usa flex, donde no hay line box: paso 157.0
  exacto. Son **4 filas de blurbs → −13.2**, que es casi todo el −14.5 de S1 en
  desktop. Antes se anotó "~2.7px"; el valor medido es **3.3 por fila**. Se
  mantiene la decisión de /software: **no se fuerza**. Si algún día se quisiera,
  el arreglo es sumar 3.3 al `mb` de la fila de blurbs en `BlurbsIconos`.
- ~~**K10 · −10 de alto en la sección del FAQ.**~~ → **CERRADO el 2026-07-28**:
  era el remate inferior de la columna de toggles, que el clon fijaba en 30
  cuando el original usa **0** (/monitor, /accesorios) o **40** (/software,
  /kunak-api). Sección del FAQ ahora a **Δ 0.0** a 1280 y **+0.5** a 390 en las
  cuatro páginas. Ver "FAQ de las 4 páginas" al final del archivo.
- **P4 (heredado)**: el original **sortea** los 3 posts en cada carga. S2 no es
  comparable px a px y la altura de documento varía entre cargas (medido en el
  original: 5331 / 5358 a 1280). Los ±3…18 que quedan en S2 son eso.
- **P2 (heredado)**: la foto de la franja de cabecera cambia entre visitas.
- **A2 (heredado)**: la franja del header mide menos que la del original.

### Puntos abiertos del recon — los dos resueltos

1. **¿El título de la tarjeta de artículo se pone azul al hover?**
   **NO en las fichas de producto, SÍ en la home.** Medido con ratón real y con
   el zoom de la imagen como control:

   | Página (original) | Título al hover | Control |
   |---|---|---|
   | home | **#0075C9** | zoom OK |
   | /monitor-calidad-aire | #333 | zoom OK |
   | /software | #333 | zoom OK |
   | /kunak-api | #333 | zoom OK |
   | /accesorios | #333 | *el hover no aterrizó* |

   El recon acertaba. Como `UltimosArticulos` lo usan 4 páginas, el hover se ha
   dejado **solo en la variante `home`**. /accesorios se agrupa con las fichas de
   producto **por inferencia** (su sonda no llegó a aterrizar, pero monta el
   mismo módulo de blog: ficha `pb 25` / `mb 60`, frente al `pb 0` / `mb 40` de
   la home). Si alguien quiere cerrarlo del todo, es re-medir esa página.

2. **Residuo del strut** → K9, arriba.

Y un tercero que salió al medir: el `<h2>` "Integra datos de fuentes externas"
**no es una discrepancia de color** aunque lo parezca. El original deja el `h2`
en `#333` y mete todo el texto en un `<span>` a `#0075C9` (comprobado: el span
cubre el 100% del texto); el clon pinta el color en el propio `h2`. Misma
pintura. Anotado para que nadie lo vuelva a "arreglar".

### Verificación de no regresión (componentes compartidos)

`UltimosArticulos`, `FaqAcordeon`, `LightButton` y `BlurbsIconos` los usan las 5
páginas. Medido en las 5, original vs clon, a 1280 después de los cambios:

| | FAQ (paso / alto) | Botón claro | Ficha de artículo |
|---|---|---|---|
| home | (no tiene) | 200.3 y 210.9 = **exactos** (antes +8.5) | **intacta**: `pb 0` / `mb 0`, rejilla 361.7 — la variante `home` no se tocó |
| /monitor-calidad-aire | 61.88 = 61.88 ✔ | 285 = **285** (antes 293.4) | `pb 25` ✔, rejilla 432.3 vs 435.3 |
| /accesorios | 61.88 vs 61.87 · 1176.7 vs 1176.6 ✔ | (no tiene) | `pb 25` ✔, rejilla 432.3 vs 435.3 |
| /software | 61.88 vs 61.87 · 1176.7 vs 1176.6 ✔ · desfase 28 = 28 ✔ | 256.3 = **256.3** (antes 264.8) | `pb 25` ✔ |
| /kunak-api | 61.88 · 1176.7 vs 1176.6 ✔ · desfase 28 = 28 ✔ | 178.1 = **178.1** (antes 186.6) | `pb 25` ✔, hueco al CTA 12.8 = 12.8 ✔ |

Ninguna regresión; el arreglo del botón claro y el del FAQ **mejoran también**
las otras páginas.

### Hallazgos de otras páginas (fuera de este QA, sin tocar)

- ~~**`/monitor-calidad-aire` · el FAQ del original tiene 18 preguntas y arranca
  por "¿Qué área cubre cada dispositivo?"**~~ → **FALSO, retractado el
  2026-07-28.** Era un artefacto de sonda: el filtro descartaba los `h3` por
  encima del techo del `<h2>`, y en /monitor el primer toggle queda ARRIBA de
  ese techo. Las 19 preguntas están, y son las mismas. Ver la sección
  "FAQ de las 4 páginas" al final del archivo.
- **El punteado con `z-[-1]` (K4) está en otros 5 componentes**:
  `SectionRow`, `HeroProducto`, `InformacionProducto`, `InfoProductoSoftware`,
  `UltimosProyectos` (y `TrustBar`, con otro patrón). Casi seguro invisibles por
  el mismo motivo, pero afectan a páginas que no entraban en este QA. Se dejan
  para el QA de cada una.
- **Home**: la rejilla de artículos va **−34.9** a 1280 (su original monta la
  ficha con `pb 0` / `mb 40`, calibración distinta a la de las fichas de
  producto), y le queda un botón claro sin migrar ("¡Me apunto!", 24/24
  `inline-flex`) que no sale de `LightButton`.

### Nota de método (cara de aprender)

Durante esta tanda un `npm run build` **con `next start` levantado** dejó el
HTML estático sin regenerar: las páginas seguían sirviendo el marcado anterior
y una verificación dio por bueno un cambio que no estaba aplicado. `CLAUDE.md`
ya avisa ("parar el proceso, `npm run build` y relanzar") — cúmplase al pie, y
ante la duda `rm -rf .next`. Comprobación barata: `curl` a la página y buscar la
clase que se acaba de tocar antes de medir nada.

## FAQ de las 4 páginas — contenido compartido, presentación por página (2026-07-28)

> Arranca de una retractación: la Fase 5 de /kunak-api anotó que "/monitor tiene
> 18 preguntas y empieza por otra distinta". **Es falso.** Las sondas de aquel
> día filtraban los `h3` con `Y > techo del <h2>`, y en /monitor el primer
> toggle queda **por encima** de ese techo (el rótulo va 50.2px más abajo, ver
> abajo), así que se perdía la primera pregunta y el recuento salía 18.
>
> Metodología: puppeteer-core, perfil limpio, Cookiebot bloqueado, 1280×900 y
> 390×844 reales. Comparación **bloque a bloque sobre el DOM vivo** (párrafos,
> listas, `<br>` y enlaces), no por `textContent` concatenado.
> Sondas: `faqdump2.mjs`, `diff19.mjs`, `colfaq.mjs`, `detalle.mjs`,
> `verif4.mjs`, `secfaq.mjs`, `pad.mjs`.

### (1) Contenido: las 4 páginas comparten EL MISMO set

**19 preguntas, mismo orden, mismas respuestas** en /monitor-calidad-aire,
/accesorios, /software-de-medicion-calidad-del-aire y /kunak-api. El diff entre
las cuatro da **idéntico**: mismas preguntas, mismos párrafos, mismas listas,
mismos enlaces. La primera es "¿Los equipos Kunak son certificados ATEX?" en
las cuatro y la última "¿Cuál es la diferencia entre calibración y corrección?".

Y el `FAQ_ITEMS` del clon **ya los reproduce verbatim**: 0 preguntas distintas y
0 respuestas distintas contra el original. **No hace falta parametrizar el
dataset ni crear un set por página**: `FAQ_ITEMS` en `lib/monitor.ts` es
correcto donde está.

Tres diferencias que aparecieron en el primer diff eran **artefactos del
extractor**, no del clon (comprobadas una a una):

| Aparente | Realidad |
|---|---|
| El `<li>` del clon empieza por "•" | El original lo pinta con `li::before { content: "•"; color: #0075C9; font-size: 22.4px }`, que `textContent` no ve. El clon usa un `<span aria-hidden>•</span>` con esos mismos valores. **Misma pintura.** |
| "…del equipo.Esto permite…" sin espacio | Los dos tienen **1 `<br>`** en ese punto. El espacio extra del original es whitespace de fuente, invisible al renderizar. |
| Bloques de la respuesta 6 en distinto orden | El extractor leía un nodo clonado y sin layout. Sobre el DOM vivo coinciden. |

### (2) Presentación: eso SÍ cambia por página

Lo que difiere no es el contenido, sino tres valores de la plantilla. Medidos en
los cuatro originales a 1280 y a 390:

| | Rótulo | Punteado | Desfase de la columna | Remate inferior |
|---|---|---|---|---|
| /monitor-calidad-aire | **23px/23px** | **EN FLUJO** (`position: relative`, 22 alto + mb 28.16 desktop / 30 móvil) → empuja el rótulo **+50.2** | 0 | **0** |
| /accesorios | **23px/23px** | absoluto (−65 x, −40 y) | 0 | **0** |
| /software | 44/55 desktop · 35/43.75 móvil | absoluto | **10** | **40** |
| /kunak-api | 44/55 desktop · 35/43.75 móvil | absoluto | **10** | **40** |

El clon pintaba **44px en las cuatro**, el punteado **absoluto en las cuatro** y
un remate fijo de **30**. De ahí salían tres defectos:

- **K11 · Rótulo del FAQ a 44px en /monitor y /accesorios** donde el original usa
  23px: un titular de 3 líneas en vez de 2, muy visible.
- **K12 · Punteado absoluto en /monitor**: el rótulo quedaba 50.2px demasiado
  alto y el punteado colgado 65px a la izquierda en vez de alineado con la
  columna.
- **K13 (= K10 de la Fase 5) · Remate inferior fijo de 30**: sobraban 30 en
  /monitor y /accesorios y faltaban 10 en /software y /kunak-api.

`FaqAcordeon` recibe ahora `tituloCompacto` y `punteadoEnFlujo`; el remate se
deriva de `desfaseColumna`, porque son los dos márgenes del mismo módulo Divi y
van siempre emparejados (0+0 / 10+40).

### (3) Verificación en las 4 páginas, a 1280 y a 390

| | Rótulo | Rótulo sobre la columna | x del punteado | 1.er toggle | **Sección FAQ** |
|---|---|---|---|---|---|
| /monitor-calidad-aire | ✔ | ✔ 50.1 vs 50.2 · 52 vs 52 | ✔ 128 · 39 | ✔ 0 · 115 | **Δ 0.0 · +0.5** |
| /accesorios | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 0 · 63 | **Δ 0.0 · +0.5** |
| /software | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 10 · 127.5 | **Δ 0.0 · +0.5** |
| /kunak-api | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 10 · 127.5 | **Δ 0.0 · +0.5** |

La sección del FAQ pasa a coincidir **al píxel en las cuatro**, en los dos
anchos. Antes iba +30 en /monitor y /accesorios y −10 en /software y /kunak-api.

### Lección de método

Dos sondas distintas dieron "18 preguntas" y "otra primera pregunta" porque
ambas heredaban el mismo filtro `Y > y(h2)`. **Un filtro geométrico no sirve
para contar contenido**: si el recuento de una sonda no cuadra con lo esperado,
antes de anotarlo como hallazgo hay que reproducirlo con un criterio
independiente (aquí bastaba contar `h3` dentro de la sección, sin filtro de
posición). El coste de no hacerlo fue anotar en el QA un defecto de contenido
que no existía.

## Dos defectos transversales del recon de /sectores (2026-07-28)

> Salieron del recon del arquetipo SECTOR (`docs/research/sectores/`) al medir
> el original con el mismo arnés de siempre (puppeteer-core, Chrome del
> sistema, headless, perfil limpio, Cookiebot bloqueado). Afectan a las 5
> páginas ya clonadas, no solo a la nueva. **Los dos corregidos en esta tanda.**

### K11 · `nav.ts` — el href de EDAR daba 404 · RESUELTO

`SECTORS[2]` guardaba
`…/sectores/monitorizacion-ambiental-y-control-de-olores-en-plantas-de-aguas-residuales/`,
que devuelve **404**. El menú vivo del original usa
`…/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/` (**200**).
Comprobado con `fetch` a los dos.

Era un desajuste **interno del propio clon**: `footer.ts:29` ya tenía el bueno,
así que el mega-menú y el pie enlazaban a sitios distintos con la misma
etiqueta. Verificado en el DOM: antes del arreglo las 5 páginas servían **los
dos** hrefs; después, solo el correcto.

### K12 · `ScrollToTop` — caja 44×44 sin radio · RESUELTO

Medido en el original **en las 5 páginas** a 1440 (y confirmado a 390), con el
botón ya asentado:

| | Original | Clon (antes) | Clon (después) |
|---|---|---|---|
| Caja | **40×40** | 44×44 | **40×40** |
| `border-radius` | **5px 0 0 5px** | 6px 0 0 6px | **5px 0 0 5px** |
| `right` / `bottom` | 0 / 125 | 0 / 125 | 0 / 125 |
| `background` | rgba(0,0,0,.4) | ídem | ídem |
| `z-index` | 99999 | ídem | ídem |
| Chevron (tinta medida) | **14×8 centrado** | 14×8 centrado | **14×8 centrado** |

**El icono no se tocó, y es deliberado.** El original encaja un glifo de fuente
ETmodules ("2") de 30px en la caja de 40 con `padding: 5px`; el clon usa un SVG.
Midiendo la tinta blanca sobre capturas ampliadas ×5, el chevron visible mide
**14×8 px en ambos**, así que reproducir el `padding: 5px` con un SVG de 30×30
habría **agrandado** el chevron respecto al original. Se replica el resultado,
no la implementación. Residuo: el glifo del original va 1px más a la derecha
dentro de la caja (centro x 20.9 vs 19.9) — es el side bearing de la fuente.

**Sin regresión, verificado por medición y no por razonamiento** (el botón es
`position: fixed`, pero el baseline se midió de verdad haciendo `git stash` +
build): alturas de documento idénticas antes y después en las 5 páginas y en
los dos anchos.

| | home | monitor | accesorios | software | api |
|---|---|---|---|---|---|
| @1440 antes / después | 11870 / **11870** | 12410 / **12410** | 10863 / **10863** | 11711 / **11711** | 5289 / **5289** |
| @390 antes / después | 19182 / **19182** | 21854 / **21854** | 21180 / **21180** | 20844 / **20844** | 9125 / **9125** |

### K13 · Remates del mismo botón: umbral y hover · RESUELTO (2026-07-28)

**Umbral de aparición: `scrollY > 800`, constante.** El clon usaba 500px fijos.

> ⚠️ **Corrección de un hallazgo mal anotado en K12.** Allí se dijo que el
> original "aparece al pasar una pantalla completa" y que la regla parecía ser
> `scrollY > innerHeight`. **Es falso.** Salió de muestrear en pasos de 100px a
> dos alturas de viewport (900 y 844) que están las dos entre 800 y 900: los
> dos casos daban "off en y800, on en y900" y eso se leyó como dependencia del
> viewport. Repetido con **búsqueda binaria del punto de corte a cuatro
> geometrías** —1440×600, 1440×900, 1440×1200 y 390×844— los cuatro cortan en
> el **mismo** sitio:
>
> | Viewport | `innerHeight` | Corte | umbral / innerHeight |
> |---|---|---|---|
> | 1440×600 | 600 | **800–802** | 1.337 |
> | 1440×900 | 900 | **800–802** | 0.891 |
> | 1440×1200 | 1200 | **800–802** | 0.668 |
> | 390×844 | 844 | **800–802** | 0.950 |
>
> Al píxel: **off en y800, on en y801**, y sin histéresis (bajando se apaga en
> el mismo 800). Es la misma lección que dejó el falso hallazgo del FAQ al
> final de este archivo: **dos muestras que comparten el sesgo del método no
> son dos comprobaciones**. Aquí bastaba variar el alto del viewport.

**Hover: fondo `#0075C9`.** El clon oscurecía a `bg-black/60`. Medido en el
original: reposo `rgba(0,0,0,.4)` → hover `rgb(0,117,201)` → vuelta a
`rgba(0,0,0,.4)`. El cambio es **instantáneo**: el original computa
`transition: all 0s`. La `transition-opacity duration-300` del clon solo afecta
a la aparición (en el original ese fundido lo hace jQuery, no CSS), así que no
se toca.

**Verificado en el clon**, las 5 páginas × 3 geometrías (1440×900, 1440×600 y
390×844): corte en **800/801 en las 15 combinaciones** —igual que el original y
sin depender del alto de viewport— y hover `rgb(0, 117, 201)` en las 5.

Sin regresión: alturas de documento idénticas a las de K12 en las 5 páginas y
los 2 anchos (11870 · 12410 · 10863 · 11711 · 5289 a 1440; 19182 · 21854 ·
21180 · 20844 · 9125 a 390). El botón es `position: fixed` y ninguno de los dos
cambios es de maquetación, pero se volvió a medir.

#### Dos trampas de la sonda, pagadas en esta tanda

1. **No leer la `opacity` computada para saber si el botón está visible.** El
   clon tiene `transition-opacity duration-300`; con una espera de 260 ms la
   opacidad va todavía por 0.9x, así que el test daba **falso negativo** y la
   búsqueda binaria convergía a un 1500 sin sentido, idéntico en las 5 páginas
   (señal de que el sondeo estaba roto, no de que el umbral fuera ése). Hay que
   mirar la **clase** de estado, que cambia sin transición — el equivalente del
   `et-visible` del original.
2. **`document.scrollHeight` depende de dónde esté el scroll.** Medido al final
   de un pase de scroll, la home a 390 da **19174**; medido con el scroll en 0,
   **19182**. Son 8px del header, que al hacerse sticky pasa a `position:
   fixed` y sale del flujo. Para comparar alturas hay que usar **la misma sonda
   y el mismo estado de scroll** en el antes y el después, no dos sondas
   distintas.

## /sectores/[slug] — QA de construcción (2026-07-28)

> Primera **ruta anidada y dinámica** del proyecto:
> `src/app/sectores/[slug]/page.tsx` con `generateStaticParams()` sobre
> `SECTORES_PUBLICADOS` de `src/lib/sectores.ts`. Hoy solo Urbano; dar de alta
> otro sector es añadir un `SectorPage` a esa lista, sin tocar código.
> Medido con el arnés de siempre (puppeteer-core, Chrome del sistema, headless,
> perfil limpio, Cookiebot bloqueado, `--hide-scrollbars`, lazy→eager + pase de
> scroll) a **1440×900** y **390×844** reales. Sondas en el scratchpad:
> `spec.mjs` (fichas de los 6 bloques), `cmp.mjs` (clon vs original),
> `clon.mjs` (no regresión de las 5 páginas), `umbral.mjs`, `shots.mjs`.

### Alturas y anclas

| | original | clon | Δ |
|---|---|---|---|
| Documento @1440 | 6081 | **6122** | +41 |
| Documento @390 | 10913 | **11064** | +151 |

Sin scroll horizontal en ninguno de los dos (`scrollWidth == clientWidth`).

Anclas verticales (Δ del clon contra el original):

| Ancla | @1440 | @390 |
|---|---|---|
| h1 de la cabecera | **0** | **0** |
| banda de clientes | **0** | **0** |
| breadcrumb | **0** | **0** |
| h2 del hero | **0** | **0** |
| título del CTA de descarga | **0** | −8.4 |
| h3 "Beneficios…" / "Aplicaciones…" | −8.6 | −8.5 |
| claim azul | +5.4 | +5.5 |
| h2 "Nuestras soluciones" | −8.7 | −8.5 |
| h2 "Últimos proyectos" | −8.6 | −18.6 |
| h2 "Artículos y Guías" | −24.8 | −82.5 |
| footer | −73.8 | −141.4 |

Y coinciden **al píxel** las cajas: h2 del hero 585.1×121 · h3 de listas
468.1×175 · claim 560.1×148 · banda 1440×122 · panel de soluciones
**780.2×500** · fila del h2 de proyectos 122.6.

### Tres errores propios que costó encontrar (y cómo se vieron)

1. **La retícula del sector es el 86%, no el 80%.** El recon anotó "80% máx
   1380 (1238.4px a 1440)" — dos datos que no cuadran entre sí: 80% de 1440 son
   1152. Medido a cuatro anchos (1280/1440/1600/1800 → 1100.8 · 1238.39 · 1376
   · 1380) la fila es **86% con máximo 1380**, que entra a ~1605px. Corregido en
   los 7 componentes, en la página y en las specs. Se vio porque las cajas del
   h2 y del h3 salían ~41px estrechas.
2. **`ProductosTabs` anidaba dos retículas.** Con `sinTitulo` seguía aplicando
   su propia fila dentro de la fila del sector → panel de 671 en vez de 780.2.
   Ahora en ese modo va a `w-full` y la fila la pone la página.
3. **Un `style` inline no lo pisa una clase `md:`.** El fondo del CTA de
   descarga iba en `style={{backgroundColor}}` y la caja salía **gris también
   en desktop**, cuando ahí es blanca con borde. Movido a clases. De rebote
   apareció el otro clásico: la regla global `p { color: #333 }` le gana a la
   herencia, así que en móvil el texto del CTA salía gris sobre fondo oscuro —
   el color va explícito en cada `<p>` (mismo tropiezo que M1 en la home).

### Residuo: los interiores de las tarjetas (−74 @1440 / −141 @390)

Todo el delta que queda está **después** de "Nuestras soluciones" y es de los
interiores de `UltimosProyectos` y `UltimosArticulos`, que son **compartidos con
la home, /monitor, /software y /kunak-api**:

- ficha de caso **404.9** en el clon vs **421.1** en el original (−16.2);
- ficha de artículo **395.6** vs **414.5** (−18.9).

Desglosado: el `.case-cliente` del original va a `16px/**30.6**` y el clon usa
`leading-[1.4]` (22.4) → −8.2; la foto lleva `margin-bottom: 4` que el clon no
pone → −4; el resto son 2-4px de la caja de taxonomías. **No se toca**:
corregirlo cambia la tarjeta en las cuatro páginas ya verificadas y eso pide su
propia tanda con medición antes/después. Anotado aquí para que no se
re-investigue.

Lo que sí se ajustó, y solo para el sector, es el `margin-bottom: 40` de la
ficha, que en el original cuenta **también cuando las 3 caben en una fila** (la
rejilla mide ficha + 40); el `gap-y` del clon solo actúa entre filas.

### Verificado en vivo

- **Autoplay del CTA**: cambio de diapositiva cada **~6950 ms** medido en el
  clon (original 7000). Fundido cruzado, 3 dots, flechas al hover.
- **Rutas locales**: `Inicio → /` y `Ver más → /monitor-calidad-aire`. El resto
  apunta al original porque no está clonado, con `target="_blank"` solo en los
  dos que lo llevan (`Descargar informe` y `Ver todos los casos de éxito`).
- **404** en un slug que no existe (`/sectores/no-existe`).

### Sin regresión en las 4 páginas anteriores

Se tocaron 5 componentes compartidos (`TrustBar`, `Footer`, `ProductosTabs`,
`UltimosProyectos`, `UltimosArticulos`). Alturas de documento **idénticas** al
baseline de K12/K13 en las 5 páginas y los 2 anchos:

| | home | monitor | accesorios | software | api |
|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 |

Todas las variantes nuevas van cerradas por prop (`TrustBar variant`,
`Footer stripImage`, `ProductosTabs sinTitulo`, `UltimosProyectos bare`,
`UltimosArticulos variant="sectores"`), así que el camino por defecto de esas
páginas no cambia.

### Pendientes

- **S1 · Interiores de tarjeta** (−16.2 caso / −18.9 artículo). Ver arriba.
- **S2 · `ProductosTabs` en la home**: el original le da al panel
  `height: 500px` y `margin-bottom: 32`; el clon va a 497.5 con `mb 0`. En el
  sector se aplica (la lista de 3 ítems deja mandar al panel y sin los 500 el
  bloque salía +79.5); en la home la lista de 5 lo enmascara y **se deja como
  está** para no tocar una página verificada. Pendiente de su QA.
- **S3 · `MapaProyectos` es un placeholder deliberado**: pinta titular, intro y
  la lista de pines, no el mapa de Google (haría falta clave propia). Urbano no
  lo usa; lo usarán Industria, Puertos y Minería.
- **P4 (heredado)**: los 3 artículos van congelados y el original los sortea —
  entre dos medidas del mismo día su footer se movió de 5487.2 a 5514.2.

## /sectores — lo que enseñó poblar el 2º sector (2026-07-28)

> Industria y olores se pobló **solo con datos** (commit `6b65c2d`) para probar
> hasta dónde llega la plantilla. El modelo aguantó: otra composición, otro
> orden y los dos tipos que Urbano no ejercitaba (`listaSimple2Col`,
> `mapaProyectos` con 41 pines) entraron sin tocar código. Lo que falló fue el
> **componente**, calibrado viendo una sola instancia.

### S4 · Las dos pieles del shortcode `calls` · RESUELTO

| | `"foto"` (Urbano) | `"fondo"` (Industria) |
|---|---|---|
| Clases | `…espacio-derecha …` **`call-con-foto`** | `calls one-column call-fondo-blanco espacio-blanco-derecha` |
| La foto | `<img>` 280 a la izquierda, sangrada −30 | **`background-image: cover`** a `0% 0%` |
| `.calls-content` | `flex` | `block` |
| `padding` desktop | 40/50 | **40/60** |
| `padding` móvil | 30/30/40 | **40/60** |
| Texto | inner 866.4 | inner 1116.39 con `padding-left` **36%** |
| Alto @1440 | 337 | **420** |

Añadido `variante?: "foto" | "fondo"` al bloque (por defecto `"foto"`). El campo
`image` ya servía para las dos: lo que faltaba era el discriminador.
**Verificado contra el original a 1440 y 390**: caja `1238.4×420` / `335.4×578.6`,
`padding 40px 60px`, x del título `563.7` / `87.3` — **idénticos**.

### S5 · El color del titular del hero es CONTENIDO · RESUELTO

`SectorHero` cableaba `#0075C9`. Urbano usa ese, **Industria usa `#0c71c3`**
(el azul por defecto de Divi) — y dentro de la propia Industria el claim sí
lleva `#0075c9`, o sea que conviven los dos en la misma página. Viene del
`<span style="color:…">` que escribe quien edita en WordPress. Añadido
`headingColor?: string` al content type. Verificado: `rgb(12, 113, 195)` en el
clon y en el original.

### S6 · Rítmica Divi entre párrafos del `.calls-text` · RESUELTO

El original da `padding-bottom` de 1em a cada `<p>` salvo el último: **18px en
desktop, 14px en móvil**. Faltaba. No se veía en Urbano, que tiene un solo
párrafo; Industria tiene dos y salían pegados. Verificado: `79.2/pb18 + 61.2/pb0`
a 1440 y `103.6/pb14 + 112/pb0` a 390, igual que el original.

### Sin regresión

Las 6 páginas anteriores mantienen su altura exacta en los 2 anchos:

| | home | monitor | accesorios | software | api | urbano |
|---|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 | 6122 |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 | 11064 |

---

### Dos hallazgos NUEVOS de Industria

Salieron al medir Industria a fondo después de los tres arreglos.

**S7 · Los bloques del cuerpo son FILAS de una sección, no secciones sueltas ·
RESUELTO (2026-07-29).**
`SectorBody` metía cada bloque en su propia `<section>` con su ritmo (sección
`pb-14` + fila `py-2%`). El original agrupa o separa según le conviene: en
**Urbano** el CTA y las listas están en **dos secciones** distintas (S4 y S5) y
por eso las cuentas encajaban; en **Industria** los cinco bloques son **cinco
filas de la MISMA sección** (S4), donde entre fila y fila solo hay el
`padding-bottom` de la anterior.

Medido a 1440: el bloque de listas coincidía **al píxel** (h3 175/120, ul
363.5/332.9, fin 2016.3) y aun así el CTA caía a 2128.9 frente a 2086.1 del
original. El +42.8 era exactamente **14** (el `pb` de sección de
`BeneficiosAplicaciones`) **+ 28.797** (el `pt` de fila de `CtaDescarga`), que
en el original no existen porque las dos filas comparten sección. De ahí bajaba
todo ~+70 hasta el pie.

*Cómo se arregló.* No con CSS: **le faltaba un campo al content type**. Se midió
con `scripts/qa/tree-todos.mjs` el árbol sección→fila de los **8 sectores
vivos** (no de 2 — ése fue el error original), y salieron solo dos formas de
sección y dos de fila. De su combinación sale `SectorBlockFlujo`, con 4 valores:

| valor | qué monta | ritmo medido (1440 / 390) |
|---|---|---|
| `seccion` | abre `<section>` con ritmo | `mt −14` · `pt 57.5938 / 50` · `pb 14`; fila `pt 2% / 30` |
| `seccionRasa` | abre `<section>` sin ritmo | `mt 0` · `pt 0` · `pb 0`; fila `pt 2% / 30` |
| `fila` | otra fila de la sección abierta | `pt 2% / 30` |
| `filaPegada` | otra fila, pegada a la de arriba | **`pt 0`** |

Reparto en los 6 de plantilla clásica: Urbano y Construcción `cta seccionRasa ·
beneficios seccion · claim filaPegada`; Industria `beneficios seccion · cta ·
lista · claim filaPegada · mapa fila`; Puertos `… cta fila · claim filaPegada ·
mapa fila`; Minería `… claim · cta filaPegada · mapa fila`; Investigación
`beneficios seccion · claim filaPegada`. (EDAR y Petróleo y gas van con otra
plantilla y quedan fuera.)

Los 5 componentes de bloque dejan de envolverse a sí mismos y pintan **solo el
contenido de su fila**; `SectorBody` monta la `<section>` y la retícula. El
ritmo es plantilla y vive en el componente; **dónde corta** es editorial y vive
en el dato.

Resultado medido (2026-07-29, original vs clon, mismo día y configuración).
Informe completo, con el árbol sección→fila y el Antes/Después de las 7 páginas:
**`docs/research/sectores/MEDICION-S7.md`**.

| | Industria @1440 | Industria @390 | Urbano @1440 | Urbano @390 |
|---|---|---|---|---|
| fila del CTA (top) | **2086.1 / 2086.1 → Δ0** (antes +42.8) | **3653.06 / 3653.06 → Δ0** | 1532.9 / 1532.9 → Δ0 | −8.4 |
| fila del claim | Δ0 | −47.5 (ver S9) | −8.6 | −8.5 |
| fila del mapa | Δ0 | −47.5 | — | — |
| alto de la sección | — | — | **1057.45 / 1057.45** | **1970.16 / 1970.16** |

Las cinco filas de Industria comparten ya una sola `<section>` con los mismos
`pt/pb` que el original, y sus cuatro primeras filas arrancan **al píxel**.
Urbano, cuya sección de listas+claim ahora clava el alto en los dos anchos, ve
además corregido un error propio de +14 que tenía el claim: antes caía tras el
`pb` de sección de las listas, y en el original va **antes** de ese `pb`.

Alturas de documento tras S7:

| | home | monitor | accesorios | software | api | urbano | industria |
|---|---|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 | **6122** | 7229 → **7171** |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 | **11064** | 12626 → **12566** |

Las 6 páginas anteriores no se mueven ni un píxel, **Urbano incluido** (su
cuerpo pesa lo mismo: los 14px solo cambian de sitio dentro de la sección).
Industria adelgaza **−58 a 1440 y −60 a 390**, que es justo lo que sobraba: a
1440, `14` (pb de sección) + `28.797` (pt de fila del CTA) + `28.797` (pt de
fila de las listas); a 390, `14 + 30 + 30` menos el `pt` de sección que ya no se
duplica. Contra el original medido en la misma corrida queda en **+27** (7144) y
**+41** (12525).

⚠️ Al comparar con la tabla del 2026-07-28, ojo con la base: dos corridas de hoy
leyeron el original a 7117 y a 7144 a 1440. Es sitio vivo — los residuos solo
valen contra la lectura de su propia corrida, y por eso arriba se da el
adelgazamiento del clon, que sí es estable.

**S8 · `MapaProyectos` no fijaba altura en móvil · RESUELTO (2026-07-28).**
El contenedor llevaba `md:h-[570px]`, así que a 390 los 41 pines se desplegaban
enteros: **1632.9** de alto frente a los **570** del original. Medido el
`et_pb_map_container` del original: **`height: 570px` fijo en los dos anchos**
(1238.4×570 y 335.4×570), así que la altura va **sin prefijo**.

Efecto en Industria a 390: el mapa pasa a 570 (Δ0) y el documento de **13689 a
12626** frente a los 12530 del original — el desfase cae de **+1159 a +96**. Las
anclas de más abajo pasan de +1053 / +1043 / +979 a **−9.6 / −19.7 / −83.5**,
ya dentro del residuo conocido de los interiores de tarjeta (S1). Desktop no se
mueve (ya iba a 570). Sin regresión en las 6 páginas anteriores.

Sigue en pie lo de S3: el mapa de Google **no se clona** (haría falta clave
propia); el bloque pinta titular, intro y la lista de pines en la caja de 570.

---

---

## /sectores — 3º y 4º sector, solo datos (2026-07-29)

> **Construcción** (`contaminacion-por-construccion`) e **Investigación y
> consultoría** (`estudio-de-la-contaminacion-atmosferica`), poblados **sin
> tocar una sola línea de componente**. `npm run check`: 0 errores.

Elegidos por lo que ejercitan, no por completar la lista:

- **Construcción** es el único de los 8 que pone el CTA de descarga **por
  delante** de las listas (`cta seccionRasa · beneficios seccion · claim
  filaPegada`). Invierte el orden respecto a Industria y es el que de verdad
  prueba la regla de agrupación de `SectorBody`: dos secciones, la primera rasa.
- **Investigación** es el **caso mínimo**: dos bloques, una sección, y el único
  sector **sin CTA de descarga** (0 `.calls`). Prueba que el cuerpo es libre de
  verdad y no una plantilla con huecos opcionales.

### Por qué Puertos y Minería quedan fuera

**Decisión deliberada, no un pendiente.** Los dos son **permutaciones de una
topología ya validada**: Puertos es `beneficios seccion · cta fila · claim
filaPegada · mapa fila` y Minería `beneficios seccion · claim · cta filaPegada ·
mapa fila` — las mismas piezas que Industria en otro orden, sin un solo tipo de
bloque ni valor de `flujo` que no esté ya ejercitado.

Su único aporte diferencial son **30 y 32 pines** de datos para `mapaProyectos`,
que es un **placeholder deliberado** (S3: el mapa de Google no se clona, haría
falta clave propia de GCP). O sea: coste de transcripción real, información
nueva **cero**.

Para una **biblioteca de arquetipos**, que es lo que se está construyendo, no
aportan. Si algún día el objetivo cambia a clonar el sitio entero, entran — los
datos están inventariados y las sondas los miden sin tocar nada.

### Medición (2026-07-29, original vs clon, misma corrida)

**Cuerpo exacto en los dos sectores y en los dos anchos.** Todas las anclas del
cuerpo a Δ0:

| ancla | Construcción @1440 | Construcción @390 | Investigación @1440 | Investigación @390 † |
|---|---|---|---|---|
| cta | **−0.1** | **0** | (no tiene) | (no tiene) |
| beneficios | **0** | **0** | **0** | **0** |
| aplicaciones | **0** | **0** | **0** | **0** |
| claim | **0** | **0** | **0** | **0** |
| soluciones | −0.1 | −35.1 (S10) | **0** | **0** |
| proyectos | **0** | −45.3 | −0.1 | −10.2 |

† Investigación @390 lleva una base de **+11.2** en el `h1` (S11); la columna da
el valor **relativo a esa base**, según la regla 2 del protocolo.

Sin regresión: las 7 páginas anteriores mantienen su altura **al píxel** en los
dos anchos (home 11870/19182 · monitor 12410/21854 · accesorios 10863/21180 ·
software 11711/20844 · api 5289/9125 · urbano 6122/11064 · industria
7171/12566). `/sectores` da **404** — el índice no está clonado, así que pasar
`SECTORES_PUBLICADOS` de 2 a 4 entradas solo emite rutas nuevas y no cambia
ninguna página existente.

### Dos hallazgos NUEVOS, sin arreglar (son de componente)

Los dos salieron **porque estos dos sectores tienen textos que los anteriores no
tenían**. Es justo para lo que sirve poblar más instancias.

**S10 · `CtaBannerSlider` tiene alto fijo a 390 y el original crece con el
titular.** Medido: el slider del clon mide **345.1 en Construcción y 345.1 en
Urbano** — el mismo. El del original no: en Urbano coincide (Δ0 antes y después
del slider) y en Construcción es ~35 más alto, porque su primera diapositiva
—*"Controla la calidad del aire en las obras y contribuye al bienestar de las
personas"*— envuelve a más líneas. De ahí el **−35.1** que aparece de golpe
entre el claim y "Nuestras soluciones", y que arrastra el resto de la página.
No afecta a 1440 (Δ−0.1).

**S11 · `CabeceraSector` crece de más cuando el kicker envuelve a dos líneas.**
Investigación tiene el kicker más largo de los 8 ("Investigación y consultoría")
y a 390 envuelve. El original lo absorbe con **+19.4** sobre la posición del
`h1` de los demás sectores (189.4 → 208.8); el clon con **+30.6**, que es su
`line-height` completo. De ahí los **+11.2** de base, que arrastran toda la
página. A 1440 no envuelve y el Δ es 0.

Ninguno de los dos se toca en esta tanda: el encargo era **solo datos**, y
tocarlos habría ocultado precisamente el dato de que la plantilla aguanta 4
sectores sin una línea de componente.

### Lo que queda incumplido y no entraba en el encargo

**`nav.ts` apuntaba los 8 sectores al original** — **RESUELTO el 2026-07-29**:
los 4 clonados pasan a ruta local y los 4 no clonados se quedan en el original,
con el criterio escrito en la cabecera de `SECTORS` para quien añada el
siguiente. Medidas las 9 páginas a 1440 y 390 antes y después: **las 18 lecturas
idénticas**, sin regresión (un href no mueve layout, pero `nav` lo comparten
todas las páginas y era justo el caso donde uno sustituye medición por
confianza).

⚠️ **Al arreglarlo salió que la regla estaba rota en TRES ficheros, no en uno.**
El HTML servido seguía trayendo los hrefs originales de los 4 clonados desde:

**Y al cerrarla por clase salieron dos más**, que ni el grep de sectores habría
encontrado. Estado final, **todo resuelto el 2026-07-29**:

| fichero | qué pinta | estado |
|---|---|---|
| `src/lib/nav.ts` | mega-menú de Sectores + "Inicio" + selector de idioma | ✅ |
| `src/lib/footer.ts` | columna de Sectores del pie | ✅ |
| `src/lib/home-carrusel-sectores.ts` | `SECTOR_SLIDES` (era `sectors.ts`) | ✅ |
| `src/components/HeaderNav.tsx` | "Inicio" del menú principal y del móvil | ✅ |
| `src/components/monitor/HeroProducto.tsx` | breadcrumb del hero → pasa a `Link` | ✅ |
| `accesorios.ts` · `api.ts` · `software.ts` | breadcrumb "Inicio" ×3 | ✅ |

### La guarda: `scripts/qa/enlaces.mjs`

Se cierra **por clase, no por instancia**. La sonda recorre el HTML **servido**
de las páginas publicadas y compara cada href al original contra **las rutas que
emite el build** (`.next/prerender-manifest.json`). Publicado → fallo; no
publicado → correcto. **Sin lista manual**: cuando se clone el monográfico, sus
enlaces pasan a ser fallo sin que nadie toque la sonda.

Tres afinados que costaron una corrida cada uno y están en su cabecera:

- **Solo anclas.** `<link rel="canonical">` y `og:url` **deben** apuntar al
  original — declaran cuál es la página buena para los buscadores. Mirándolos,
  la guarda pedía romper el SEO.
- **Solo la rama `/es`.** El clon reproduce ese árbol. "Quitar el prefijo de
  idioma, sea cual sea" daba la home francesa y la raíz como si fueran la
  nuestra.
- El localizador de origen exige que la cola **cierre el literal**: como
  subcadena, el href de la home (`/es/`) casaba con toda línea que tuviera
  cualquier URL del original.

Verificación: **limpia** (1000 hrefs al original, 545 destinos externos
distintos, ninguno con ruta local) y **las 18 lecturas de altura idénticas**.

Lección de método, ya generalizada en `CLAUDE.md`: **verificar contra la salida
servida, nunca contra la fuente que uno supone responsable.** Se arregló
`nav.ts` dando por hecho que era el responsable, y el menú seguía trayendo
hrefs del original desde otros dos ficheros.

---

## CLASE · S9, S10 y S11 son el mismo hallazgo cuatro veces

> **Léelo antes que los cuatro apartados que vienen debajo.** Por separado
> parecen flecos de pulido. Juntos son una sola cosa, y esa cosa es deuda de
> **CMS-readiness**, no de acabado.

Los cuatro residuos vivos del arquetipo SECTOR tienen la misma causa raíz: **un
componente construido para el contenido de UNA instancia, no para un rango de
contenidos.**

| | qué se cableó | qué lo destapó |
|---|---|---|
| **S9b** · caja del CTA | el alto que daba el texto de Urbano | Industria, con dos párrafos y otra piel |
| **S9c** · cabecera del mapa | la del primer sector con mapa | el mismo bloque en otro sector |
| **S10** · `CtaBannerSlider` | **alto fijo** (345.1 a 390) | Construcción, con titulares que envuelven más |
| **S11** · `CabeceraSector` | un kicker que **no envuelve** | "Investigación y consultoría", el más largo de los 8 |

Y una quinta de la misma familia, ya resuelta, que sirve de patrón: **S9a**, la
intro de `listaSimple2Col`, donde el clon monta **una** maquetación y el
original tiene **dos** (la intro cuelga de la fila anterior).

El síntoma siempre es el mismo: el original **crece con su contenido** y el clon
**no**, porque se midió una instancia y se cableó el número. Por eso ninguno
apareció en QA de la página para la que se construyó el componente: **solo se
ven al poblar la segunda, la tercera o la cuarta**.

### Por qué es CMS-readiness y no pulido

Un CMS no da un rango de contenido: da **cualquier** contenido. Un componente
con alto fijo o con una sola maquetación no falla el día que se despliega —
falla el día que alguien escribe un titular de tres líneas. Los cuatro son
**defectos de contrato**, no de píxel: el componente promete servir al arquetipo
y solo sirve a la instancia que se midió.

### Cómo se resuelve: una tanda única, y no ahora

**No se arreglan de uno en uno según van saliendo.** Eso reproduce el error que
los causó: calibrar contra la instancia que se tiene delante.

Se resuelven en **una sola tanda, con criterio común** —*el alto lo pone el
contenido, no el componente*— y **con el catálogo de instancias ya completo**,
es decir cuando estén medidos los 8 sectores (o los que se decidan clonar). Solo
entonces se conoce el rango real: el kicker más largo, el titular de slider que
más envuelve, el CTA con más párrafos.

Hacerlo antes es adivinar el rango. Hacerlo por separado es cablear otra vez.

---

### S9 · Tres residuos que destapó la medida de S7, sin arreglar (2026-07-29)

> **Reclasificados contra el suelo de ruido el 2026-07-29. Los cuatro
> sobreviven** — ninguno es ruido. Ver el cuadro al final de la sección.
> Y ver la **nota de CLASE** de arriba: no se arreglan sueltos.

Con el ritmo de secciones ya exacto, lo que queda del desfase de los dos
sectores es **contenido dentro de la fila**, no la fila. Son tres cosas
distintas y ninguna entraba en el encargo de S7. Medido con
`qa/tree-cmp.mjs` (fila a fila, original vs clon).

**S9a · La `intro` de `listaSimple2Col` está en la fila equivocada.** En el
original de Industria el párrafo *"Algunos de las aplicaciones donde desplegar
sistemas de monitorización ambiental son:"* es un módulo de texto **al final de
la fila del CTA**, no la cabecera de la fila de las listas:

| fila @1440 | original | clon | Δ |
|---|---|---|---|
| CTA | 525.61 | 495.02 | **−30.6** |
| listas | 236.36 | 266.95 | **+30.6** |

Los 30.6 son exactamente el párrafo (18/30.6). A 390 son 61.78 (envuelve a dos
líneas), con el mismo trasvase. **Efecto vertical neto: cero** — la fila
siguiente arranca al píxel en los dos anchos —, así que se ve solo como que la
intro cae 30.6 más abajo de lo que debe.

No se toca porque el arreglo honesto es de modelo, no de CSS: si la intro
pertenece a la fila del CTA, entonces **no es un campo de `listaSimple2Col`**
sino un módulo de texto suelto que Divi deja colgar de cualquier fila. Antes de
inventar un `SectorBloqueTexto` conviene ver si se repite en Puertos y Minería o
es una excentricidad de quien editó Industria.

**S9b · La caja del CTA de descarga es más baja que la del original, y por
motivos distintos en cada piel.**

| | @1440 | @390 |
|---|---|---|
| piel `"foto"` (Urbano) | −8.6 | −8.4 |
| piel `"fondo"` (Industria) | 0 (una vez descontada S9a) | −47.5 |

La piel `"fondo"` **clava el desktop** y se queda corta solo en móvil. La piel
`"foto"` va −8.5 en los dos anchos, y ese −8.6 es el ÚNICO residuo de Urbano:
todas sus anclas, de la cabecera al pie, van desplazadas ese mismo valor y ni
una más. Es un interior de caja (padding o alto de la foto de 280), no ritmo.

**Origen del −47.5 a 390: PREEXISTENTE, verificado — no es regresión de S7.**
Comprobado con `git checkout` al commit anterior a S7 (`5db79ee`), `npm run
build` y la misma sonda; clon contra clon, que es determinista. La fila del CTA
mide **591.14 de contenido antes y después** de S7 (651.14 con `pt 30` →  621.14
con `pt 0`): S7 solo tocó el `padding`. El original mide 700.42 de contenido, y
esos 109.28 de déficit son 61.78 del párrafo mal colocado de S9a más **47.5 de
la caja**. Antes de S7 el claim daba **+26.5** contra el original de su corrida;
S7 retira 74 de ritmo sobrante (`14 + 30 + 30`, todos `pt 0` en el original) y
`26.5 − 74 = −47.5` — el déficit estaba **tapado** por un sobrante que lo
compensaba de más. Detalle en `docs/research/sectores/MEDICION-S7.md`.

**S9c · La fila del mapa es +13 en los dos anchos** (740.19 → 753.19 a 1440;
836.28 → 849.28 a 390). El contenedor de 570 es exacto desde S8, así que los 13
están en el bloque de titular + intro que va encima: el clon monta `h2 55 +
pb 10 + intro 30.6 + mt 30` = 695.6 y el original mide 682.6. Recordatorio de
que `MapaProyectos` es un **placeholder deliberado** (el mapa de Google no se
clona), así que afinar su cabecera solo tiene sentido cuando se decida qué se
pinta dentro.

### P4, ascendido: de fleco heredado a suelo de ruido del proyecto (2026-07-29)

P4 llevaba desde la Fase 5 anotado como "heredado, no es defecto, no comparable
px a px". **Eso se queda corto y hay que leerlo al revés.** Medido con
`scripts/qa/ruido.mjs` (3 corridas × 7 páginas × 2 anchos = 42 cargas del
original), P4 no es un fleco de una página: es **la única fuente conocida de
dispersión de todo el sitio**.

| | antes | ahora |
|---|---|---|
| qué es | un residuo heredado de una zona | **el suelo de ruido del proyecto** |
| dónde | "Artículos y Guías" | **exactamente una fila por página**, siempre ésa |
| cuánto | "no comparable" | **27, 54 u 81** — uno, dos o tres renglones de 27px |
| causa | "el original los sortea" | la misma, **y ya está confirmada como la única** |
| fuera de ahí | sin medir | **dispersión 0**, tres corridas al céntimo |

Consecuencias prácticas, que es lo que lo hace un ascenso y no una nota:

1. **Es la magnitud contra la que se juzga cualquier Δ.** Un residuo del cuerpo
   no se compara contra 81: se compara contra **0**.
2. **Acota dónde NO mirar.** Si un desfase aparece por primera vez en el bloque
   de artículos o de ahí abajo y vale ≤81, no se investiga.
3. **Explica retroactivamente medidas viejas.** Los `9176 / 9203 / 9230` de tres
   cargas del original en la QA de /accesorios son exactamente 27 y 27: era esto,
   ya visible entonces sin que se le pusiera nombre.
4. **No se puede arreglar y no se intenta.** El módulo es aleatorio en origen;
   los 3 posts van congelados por decisión §4. Lo que cambia es que ahora está
   *cuantificado*, y por eso sirve de instrumento.

### Reclasificación contra el suelo de ruido (2026-07-29)

Medido con `scripts/qa/ruido.mjs`: 3 corridas × 7 páginas × 2 anchos del
original. Protocolo en `scripts/qa/README.md`; salida en
`scripts/qa/medidas/ruido.json`.

El resultado hace innecesario el umbral que se temía: **la dispersión no está
repartida por la página**. En cada página varía **exactamente una fila** —
siempre la de "Artículos y Guías", porque el original sortea los 3 posts en cada
carga (P4)— con saltos de 27, 54 u 81 (uno, dos o tres renglones). **En todo lo
demás, tres corridas dieron el mismo valor al céntimo: dispersión 0.** El `h1`
dio 0 en las 14 combinaciones de página y ancho.

| residuo | magnitud | región | dispersión de su región | veredicto |
|---|---|---|---|---|
| S9a · intro en la fila del CTA | ±61.78 @390 · ±30.6 @1440 | cuerpo | **0** | **defecto** |
| S9b · caja CTA piel `"fondo"` | −47.5 @390 | cuerpo | **0** | **defecto** |
| S9b · caja CTA piel `"foto"` | −8.6 @1440 · −8.5 @390 | cuerpo | **0** | **defecto** |
| S9c · cabecera de `mapaProyectos` | +13 @1440 · +13 @390 | cuerpo | **0** | **defecto** |

Los dos pequeños —el −8.6 y el +13, que eran los sospechosos— **no caen por
debajo del ruido: caen en una región donde el ruido medido es cero**. Y los dos
se reproducen entre anchos, el +13 al píxel exacto, lo que por sí solo descarta
que sean jitter: son dos maquetaciones distintas del mismo componente.

La lección de método, que vale para el resto del proyecto: **un suelo de ruido
global habría sido peor que no tener ninguno.** Con un umbral de 81 aplicado a
toda la página se habrían archivado como ruido dos defectos reales del cuerpo,
por variación que solo existe en el bloque de artículos.
