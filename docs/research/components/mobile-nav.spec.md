# MobileNav Specification (header ≤1023px)

## Overview
- **Target file:** `src/components/HeaderNav.tsx` (integrado — hamburguesa + panel móvil)
- **Screenshots:** scratchpad QA `orig-mobnav-{closed,open,submenu-open,sticky,sticky-open}.png` (390×844) y `orig-tabnav-*.png` (800×900)
- **Interaction model:** click-driven (hamburguesa toggle + submenús acordeón instantáneo)
- **Fuente:** `getComputedStyle` vía CDP con perfil limpio + Cookiebot bloqueado (2026-07-23) + `themes/KunakAir/assets/js/init.js` + `style.css` (líneas 6016-6077, 7646-7652, 7760-8114)

## Breakpoint

**≤1023px** (media query del tema `max-width: 1023px`, NO el 980 de Divi):
- `.et_pb_menu__menu` (nav horizontal) → `display: none`
- `.et_mobile_nav_menu` (hamburguesa) → `display: block`
- Utility bar (Row 0) → oculta por completo (0×0)
- `#menu-principal { margin-top: -36px }` — el módulo del menú se solapa con la fila del logo
- `.fila-menu-principal-contenido { width: 100%; padding: 0 }` (full width, sin 85%)
- `#cabecera-wrap .et_pb_row { padding: 30px 0 }`
- Header en home: `position: absolute; z-index: 3` (otras páginas: relative)
- En el clon: usar breakpoint Tailwind `lg` (1024px) — `lg:hidden` para lo móvil, `hidden lg:*` para lo desktop.

## Métricas de layout medidas (390×844 / idéntico en 800×900)

| Elemento | Top (no sticky) | Sticky |
|---|---|---|
| Row 1 (fila menú) | y=0, **h=126**, padding 30px 0, fondo transparente | fixed top 0, **h=73**, padding **14px 0 0**, bg #fff, shadow 0 0 20px rgba(0,0,0,.1), z 1000 |
| Logo (svg) | x=10% (39px), y=30, **120×48**, fills blancos | y=14, **104×42**, fills azul/gris |
| Hamburguesa `.mobile_nav` | x=311 (right, margen der. **3vh**), y=44, **48×52** | mismas dims, barras `var(--negro)` |
| Panel `#mobile_menu2` | y=**96** (= bottom del botón; row bottom − 30px padding) | y=**73** (= bottom fila fixed) |

## Botón hamburguesa

DOM real: `<span class="mobile_menu_bar"><span></span></span>` (init.js hace append del span interior; el glifo ETmodules `::before` está `display:none !important`).

- Contenedor `.mobile_menu_bar`: `width: 48px; height: 52px; padding: 8px 10px 24px; margin-top: -15px; cursor: pointer` (hit area 48×52; barras quedan ~13px bajo el top del botón)
- **Cerrado (≡):** 3 barras de `28×2px`:
  - span (barra media): `display:inline-block; position:relative; width:28px; height:2px; background #fff` (sticky: `#333`)
  - `span::after` (barra superior): `position:absolute; top:-8px; left:0; 28×2`
  - `span::before` (barra inferior): `position:absolute; top:8px; left:0; 28×2`
  - `transform-origin: 1.5px center; transition: transform .3s`
  - Hover cerrado: `::before → translateY(-2px)`, `::after → translateY(2px)` (las barras se acercan)
- **Abierto (✕):** span pierde el fondo (transparente); `::before → rotate(45deg)`, `::after → rotate(-45deg)`, ambas `top:50%; left:50%; margin:5px 0 0 -13px; width:28px; height:2px`, `transition: transform .1s ease`. Color: `#fff` en top de página, `var(--negro)` con fila fixed.
  - Hover abierto: ambas rotan a 0deg (se aplanan).
- Colores: **#fff** sobre el hero (no sticky) / **#333 (var(--negro))** cuando `.fila-menu-principal-fixed` — cerrado y abierto.

## Panel `#mobile_menu2` (abierto)

- `position: absolute; top: <bajo el header>; left/right: 0; width: 100%; z-index: 9999`
- `height: 90vh; overflow-y: auto`
- `background: #fff; border-top: 3px solid var(--azul) #0075C9; box-shadow: 0 2px 5px rgba(0,0,0,0.1)`
- `padding: 2% 0 0` (7.8px a 390)
- **Animación de apertura/cierre:** jQuery slideToggle ≈ **500ms ease-in-out** (muestreo: h 3→29→92→180→292→449→559→655→722→760 en ~510ms). Cierre igual. Los submenús NO animan (display none↔block instantáneo).
- El scroll del body NO se bloquea (el original solo pone `body.menu-open` para desactivar pointer-events de iframes de chat).

## Items nivel 1 (11 en /es/ — sin selector de idioma)

Orden verbatim: `Inicio` · `Productos ▸` · `Sectores ▸` · `Empresa ▸` · `Casos de éxito` · `Recursos ▸` · ~~¿Cómo podemos ayudarte?~~ (**OCULTO** — li lleva `visible-escritorio`, display none ≤1023) · `Descargar catálogo` (pill) · `Soporte ▸` · `Blog` · `Contacto` (los tres últimos `visible-movil`, solo existen en el menú móvil).

- li: `padding: 0 5%` (19.5px a 390); los padres `position: relative`
- a: `display:block; padding: 10px 5% (17.5px); font: Manrope 15px/26px fw500; color: #333; border-bottom: 1px solid rgba(0,0,0,0.03)`; **altura de fila 47px**
- `visible-movil` (Soporte/Blog/Contacto): igual pero `font-size: 13.5px`; sus submenús (li/ul) con `background: #eee !important`
- Hover: `background: #f9f9f9` (visible-movil: transparent); `transition: opacity .2s ease-in-out, background-color .2s ease-in-out`
- Item de página actual (`Inicio` en la home): `color: var(--azul)` sin fondo
- **Descargar catálogo** (li.ds-custom-link, `display:block` móvil): a `display:block` full-width (351px), `height: 38px; margin: 7px 0; padding: 0 5px 5px; background: var(--azul); border-top: 6px solid var(--azul); border-bottom: 1px solid var(--azul); border-radius: 15px; color: #fff; font-size: 15px; text-align: start`

## Submenús colapsables (mecanismo init.js, setup a load+700ms)

Para cada `li.menu-item-has-children > a` de `#mobile_menu2`:
1. El href original se sustituye por `#`; click → `event.preventDefault()` + `toggleClass('visible')` en el li. **Sin animación** (`display:none !important` ↔ `.visible > ul { display:block !important }`).
2. Se añade un **`<a class="hover-link">`** duplicado con el href original: `position:absolute; top:0; inset-inline-start:0; inset-inline-end:60px; height:47px` — la zona del texto navega a la página de sección; solo los 60px derechos (zona del icono) hacen toggle.
3. Links sin submenú: click → dispara click en `.mobile_nav` (cierra el menú) y navega.

Icono +/− (`a::after`): `20×20px; position:absolute; top:14px; inset-inline-end:10px; background: url(plus-light.svg) center no-repeat` → `.visible`: `minus-light.svg`. Hover: `filter: invert(37%) sepia(70%) saturate(7166%) hue-rotate(191deg) brightness(80%) contrast(101%)` (azul). Assets en `public/images/theme/{plus,minus}-light.svg`.

### Contenido por submenú (verbatim, orden móvil)
- **Productos** (6): Kunak AIR Pro · Kunak AIR Lite · Kunak AIR Cloud · **Cartuchos inteligentes ▸** (anidado, 18 contaminantes de nav.ts CARTRIDGES, mismo mecanismo toggle) · Kunak API · Accesorios — `li li img { display:none }` (sin imágenes de producto)
- **Sectores** (8): Urbano · Industria y olores · EDAR · Petróleo y gas · Puertos y aeropuertos · Construcción · Minería · Investigación y consultoría (sin iconos)
- **Empresa** (2): Sobre nosotros · Premios y reconocimientos
- **Recursos** (5): Artículos · Documentos científicos · Kunakpedia · Centro de ayuda · Preguntas frecuentes
- **Soporte** (3, orden distinto al utility desktop): Centro de ayuda · Soporte técnico · Servicio de reparación (RMA)
- Sub-item a: `padding: 10px 5%; font 15px fw500 #333; border-bottom 1px rgba(0,0,0,0.03)`; indentación por acumulación del `padding 0 5%` de cada li anidado. Alto de sub Productos: 282px (6×47).

## Sticky en móvil

Mismo mecanismo JS que desktop (`posicionInicial = offset().top` de la fila = **0** en móvil porque la utility bar está oculta → fixed a partir de scrollY ≥ 10px). Fila fixed: `padding: 14px 0 0; height 73px; bg #fff; shadow 0 0 20px rgba(0,0,0,.1)`. Logo 104px fills azul/gris. Barras #333. Panel abierto se ancla al bottom de la fila fixed (y=73).

## Notas de implementación clon
- Panel como hijo absoluto de la fila: `top: calc(100% - 30px)` no sticky (la fila tiene 30px de padding inferior) / `top: 100%` sticky (padding inferior 0).
- Animación: wrapper `overflow:hidden` con `height: 0 ↔ 90vh; transition: height .5s ease-in-out`; panel interior `h-[90vh] overflow-y-auto`.
- Hamburguesa: alinear con `mt-[14px]` bajo el padding-top 30 (no sticky) para reproducir y=44; sin offset en sticky; `margin-right: 3vh`.
- El estado `¿Cómo podemos ayudarte?` NO se renderiza en móvil; el resto de items desktop (utility Soporte/Blog/Contacto) entran como `visible-movil`.
