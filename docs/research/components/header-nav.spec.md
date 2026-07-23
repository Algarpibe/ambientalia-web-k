# HeaderNav Specification

## Overview
- **Target file:** `src/components/HeaderNav.tsx`
- **Screenshots:** capturas de Fase 1 (hero top / scrolled) en la conversación; original en `https://kunakair.com/es/`
- **Interaction model:** scroll-driven (sticky con cambio de tema) + hover-driven (dropdowns)
- **Fuente de la extracción:** HTML servido + `themes/KunakAir/style.css` + `themes/KunakAir/assets/js/init.js` (código fuente real, no aproximación)

## DOM Structure

```
header.et-l--header
└─ #cabecera-wrap (.et_pb_section.cabecera)          ← sección con bg transparente sobre el hero
   ├─ ::before                                        ← degradado de legibilidad top
   ├─ Row 0 — utility bar (.et_pb_row_0_tb_header)
   │  └─ nav ul#menu-menu-secundario
   │     ├─ li "Soporte" ▼  → /es/soporte/
   │     │   └─ sub-menu: "Centro de ayuda" | "Servicio de reparación (RMA)" | "Soporte técnico" (externo Atlassian)
   │     ├─ li "Blog"      → /es/blog/
   │     ├─ li "Contacto"  → /es/contacto/
   │     └─ li lang "Español" ▼ → sub-menu: English (/), Français (/fr/), العربية (/ar/)
   └─ Row 1 — main nav (.et_pb_row_1_tb_header.fila-menu-principal)
      │   (init.js envuelve el contenido en .fila-menu-principal-contenido en runtime)
      ├─ Col 1/4 (.col-logotipo-cabecera)
      │  └─ SVG inline #Capa_1 (wordmark "kunak® SENSING ANYWHERE", clases .st0/.st1)
      └─ Col 3/4 (#menu-principal)
         └─ nav ul#menu-menu-principal
            ├─ li "Inicio"                       → /es/
            ├─ li.menu-soluciones "Productos" ▼  → /es/productos/          (MEGA MENÚ full-width)
            ├─ li.menu-sectores2 "Sectores" ▼    → /es/sectores/           (dropdown con iconos)
            ├─ li "Empresa" ▼                    → /es/empresa/  (sub: Sobre nosotros, Premios y reconocimientos)
            ├─ li "Casos de éxito"               → /es/casos-de-exito/
            ├─ li "Recursos" ▼                   → /es/recursos/ (sub: Artículos, Documentos científicos, Kunakpedia, Centro de ayuda, Preguntas frecuentes)
            ├─ li.ds-custom-link.secondary-btn "¿Cómo podemos ayudarte?" → /es/contacto/   (pill outline)
            ├─ li.ds-custom-link "Descargar catálogo" → /es/descarga-catalogo/             (pill sólido azul)
            └─ li.visible-movil × 3 (Soporte/Blog/Contacto duplicados, solo móvil)
```

## Design tokens usados

```css
--negro: #333;  --gris: #7F8798;  --gris-kunak: #5e6770;  --gris-claro: #ecedf0;  --azul: #0075C9;
```

## Computed / authored styles

### `#cabecera-wrap` (contenedor)
- `background`: transparente (hereda el hero detrás; en la home el bg-image de cabecera se anula con `background-image: none`)
- `#cabecera-wrap::before`: `position:absolute; width:100%; height:200px` (desktop; 140px base), `background-image: linear-gradient(180deg, rgba(71,71,71,0.25) 0%, rgba(0,0,0,0) 100%); mix-blend-mode: multiply` — franja de legibilidad superior
- `#cabecera-wrap .et_pb_row { padding: 30px 0 }`

### Row 0 — utility bar
- Altura render: **41px**. Fondo transparente. Borde inferior hairline (`et_pb_with_border`, color rgba blanca sutil).
- Item: `font-family: Manrope; font-weight: 500; font-size: 13px; color: #FFFFFF; transition: all .4s ease-in-out`
- Hover item: `opacity: .7`
- Sub-menu item: `color: #333; padding: 6px 20px; transition all .4s` — hover: `background-color: rgba(0,0,0,0.03)`
- Caret de items con hijos: fuente `ETmodules`, `content:"3"`, 16px, fw 800, absolute right 0 → **en el clon usar ChevronDownIcon**

### Row 1 — main nav (estado A, top de página)
- Altura render: **144px** (contenido 113px + padding 30px 0). `position: relative`, fondo transparente.
- `.fila-menu-principal-contenido` (wrapper JS): `max-width: 1380px; width: 85%; padding: 0; margin: auto` (92% en tablet)
- Logo col: `.col-logotipo-cabecera { margin-inline-start: 10%; max-width: 200px; z-index: 20001 }`
- Logo SVG estado A: `.st0 { fill: #ffffff } .st1 { fill: #ffffff }` (todo blanco). Ancho render ~164px.
- Links nav estado A: color `#FFFFFF` (regla Divi + text-shadow ninguno). Font Divi por defecto: Manrope, ~14px, fw 500-600.
- Link hover (home sobre hero): `opacity .7` estándar Divi (los links usan la transición Divi `all .4s`)
- Item activo (`current-menu-item`): `color: var(--azul)`
- **Botón "¿Cómo podemos ayudarte?"** (`li.ds-custom-link.secondary-btn a`):
  - `background: transparent; border: 1px solid #fff; color: #fff; padding: 14px 11px 9px; border-radius: 10px; font-size: clamp(13px, 1.2vw, 15px)`
  - Hover: `color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.7)`
- **Botón "Descargar catálogo"** (`li.ds-custom-link a`, no secondary):
  - `background: var(--azul); border-color: var(--azul); color: #fff; border-radius: 10px; border-top-width: 6px; border-bottom-width: 1px; margin: 7px 0; padding: 5px 0/4px (es); font-size: 14px`
  - (El borde superior de 6px del mismo azul da la altura extra de la píldora)
- li.ds-custom-link: `padding: 0 4px` (locale es)

## States & Behaviors

### Sticky (fila-menu-principal-fixed) — MECANISMO EXACTO (de init.js)

```js
var elementoFijo = $('.fila-menu-principal');
var posicionInicial = elementoFijo.offset().top;   // = 41px en desktop (alto de la utility bar)

$(window).scroll(function () {
  if (scrollTop >= posicionInicial)      elementoFijo.addClass('fila-menu-principal-fixed');
  if (scrollTop < posicionInicial + 10)  elementoFijo.removeClass('fila-menu-principal-fixed');
});
```

- **Trigger efectivo:** clase activa cuando `scrollY ≥ posicionInicial + 10` = **51px** (ambos `if` corren en orden: entre 41–50px se añade y se quita en el mismo tick → neto OFF). OFF de vuelta al subir por debajo de 51px.
- `posicionInicial` se mide en load → **en el clon: capturar el offsetTop de la fila al montar** (no hardcodear 41 si la utility bar cambia de alto en otros breakpoints).
- Un segundo listener independiente añade `cabecera-fixed` a `body` y `.cabecera` cuando `scrollY ≥ 100` (se usa para subir z-index del header a 10001).

### Estado B (fixed) — CSS

```css
.fila-menu-principal-fixed {
  position: fixed; top: 0; width: 100%; z-index: 1000;
  background-color: #fff;                 /* sólido; el rgba(255,255,255,0.576) capturado en vivo era la transición a medio camino */
  transition: background-color .3s;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
#cabecera-wrap .et_pb_row.fila-menu-principal-fixed { padding: 18px 0 10px; }   /* (variante: 14px top / 0 bottom en regla Divi row) */
```

- Altura render fixed: **127px**.
- Logo: `svg { max-width: 104px }` + `.st0 { fill: var(--azul) } .st1 { fill: #5E666F }` → wordmark azul + tagline gris.
- Links nav: `color: var(--negro)`.
- secondary-btn: `border: 1px solid var(--negro); color: var(--negro)`; hover `opacity .7`.
- ds-custom-link (catálogo): permanece azul con texto blanco.
- La utility bar NO se re-fija: se pierde con el scroll.
- Transición: solo `background-color .3s` (posición y colores cambian a corte). El logo tiene `transition: all .2s ease-in-out` en variantes de página, aplicarlo también aquí para suavidad.

### Mega menú "Productos" (li.menu-soluciones) — hover
- Sub-menu: `width: 100%; position: fixed; inset-inline-start: 0; z-index: 999999; top: 119px; border-top: 1px solid rgba(51,51,51,.3); text-align: center` (fondo blanco Divi).
- Items nivel 1 (Kunak AIR Pro / AIR Lite / AIR Cloud / Cartuchos inteligentes / Kunak API / Accesorios): `display: flex; flex-direction: column-reverse; align-items: center; color: #333; padding: 10px 0; font-size: 15px; max-width: 15%` con **imagen de producto** `width: 130px; padding: 10px 0`.
  - Imágenes (ya en public/): `01-Kunak-AIR-Pro-300.jpg`, `Kunak_AIR_Lite-300.jpg`, `air-cloud.jpg`, `cartridges-300.jpg`, `kunak-api.jpg`, `kunak-air-accessories.jpg` bajo `public/images/uploads/...`
  - Hover: `color: var(--azul)`; imagen crece `width: 150px; padding: 0; transition: all .3s`.
- Sub-sub-menu "Cartuchos inteligentes" (18 contaminantes CO, NO, NO₂, O₃, SO₂, H₂S, CO₂, CH₄, COV, NMHC, NH₃, HCl, HCN, HF, Cl₂/ClO₂, O₂, MP, PUF): `display: grid; grid-auto-flow: column; grid-template-rows: repeat(9, auto); top: 197px; min-width: 500px; padding-block: 1rem`; item `width: 273px (es); line-height: 1.6`; hover `background-color: rgba(0,0,0,0.1)`. Pseudo `::after` de 2rem bajo el menú para que no se cierre al mover el cursor.
- Con nav fixed: `top: 73px` (productos) / `top: 43px` (resto de dropdowns) + `box-shadow: 0 0 4px rgba(0,0,0,0.1)`.

### Dropdown "Sectores" (li.menu-sectores2) — hover
- Comportamiento dropdown estándar Divi (no full-width en la home): ítems apilados con icono a la derecha (`flex-direction: row-reverse`), `color: #333; font-size: 13.5px`.
- Iconos por sector (SVG en public/images/uploads/): urban-2, industry, wastewater-treatment-plant, oil-and-gas, ports-airports-2, construction, mining, research — `width: 34px; filter: invert(12%) ... brightness(70%)` (gris); hover: filtro azul equivalente a `var(--azul)` + texto azul.
- Ítems verbatim: Urbano, Industria y olores, EDAR, Petróleo y gas, Puertos y aeropuertos, Construcción, Minería, Investigación y consultoría.

### Dropdowns "Empresa" / "Recursos" / "Soporte" (utility)
- Dropdown Divi clásico: caja blanca, items `font-size: 13.5px; color: #333; padding: 6px 20px`, hover `color: var(--azul)` / bg `rgba(0,0,0,0.03)`.

## Responsive Behavior
- **≥1024px:** nav horizontal completo; `.visible-movil` ocultos; wpml lang en utility bar.
- **≤980px (Divi):** `.et_pb_menu__menu` se oculta; hamburguesa `.mobile_nav.closed` (3 barras, color blanco top / `var(--negro)` en fixed) despliega `.et_mobile_menu` (panel blanco, lista apilada, subs con toggle). Los `li.visible-movil` (Soporte/Blog/Contacto) aparecen dentro del menú móvil.
- Logo col en móvil se reduce; el botón catálogo entra en el menú móvil como item destacado azul (`#mobile_menu2 li.ds-custom-link { display:block }`).
- **Umbral sticky en móvil:** mismo mecanismo JS (`offset().top` inicial de la fila).

## Assets
- Logo: SVG inline en el HTML fuente (extraer paths completos del `<svg id="Capa_1">` de la home al construir; nuestro fallback `KunakLogo` en `icons.tsx` sirve mientras). Variantes por fill CSS — NO hay dos imágenes.
- Imágenes mega-menú productos: `public/images/uploads/2022/12/01-Kunak-AIR-Pro-300.jpg`, `public/images/uploads/2022/12/Kunak_AIR_Lite-300.jpg`, `public/images/uploads/2023/01/air-cloud.jpg`, `public/images/uploads/2023/01/cartridges-300.jpg`, `public/images/uploads/2026/04/kunak-api.jpg`, `public/images/uploads/2023/03/kunak-air-accessories.jpg`
- Iconos sectores: `public/images/uploads/2023/01/{urban-2,industry,construction,mining,research}.svg`, `public/images/uploads/2026/04/{wastewater-treatment-plant,oil-and-gas}.svg`, `public/images/uploads/2023/02/ports-airports-2.svg`

## Text Content (verbatim)
- Utility: `Soporte` · `Centro de ayuda` · `Servicio de reparación (RMA)` · `Soporte técnico` · `Blog` · `Contacto` · `Español` · `English` · `Français` · `العربية`
- Main: `Inicio` · `Productos` · `Kunak AIR Pro` · `Kunak AIR Lite` · `Kunak AIR Cloud` · `Cartuchos inteligentes` · `Kunak API` · `Accesorios` · `Sectores` · `Urbano` · `Industria y olores` · `EDAR` · `Petróleo y gas` · `Puertos y aeropuertos` · `Construcción` · `Minería` · `Investigación y consultoría` · `Empresa` · `Sobre nosotros` · `Premios y reconocimientos` · `Casos de éxito` · `Recursos` · `Artículos` · `Documentos científicos` · `Kunakpedia` · `Centro de ayuda` · `Preguntas frecuentes` · `¿Cómo podemos ayudarte?` · `Descargar catálogo`
- Cartuchos (sub-sub): `Monóxido de carbono (CO)` · `Óxido nítrico (NO)` · `Dióxido de nitrógeno (NO₂)` · `Ozono (O₃)` · `Dióxido de azufre (SO₂)` · `Sulfuro de hidrógeno (H₂S)` · `Dióxido de carbono (CO₂)` · `Metano (CH₄)` · `Compuestos orgánicos volátiles (COV)` · `Hidrocarburos no metánicos (NMHC)` · `Amoniaco (NH₃)` · `Cloruro de hidrógeno (HCl)` · `Cianuro de hidrógeno (HCN)` · `Fluoruro de hidrógeno (HF)` · `Cloro (Cl₂)` · `Oxígeno (O₂)` · `Material particulado (MP)` · `Partículas ultrafinas (PUF)`

## Notas de implementación
- Implementar sticky con listener rAF-throttled y `data-sticky` (ya existe `.kunak-nav[data-sticky]` en globals.css); medir el offset inicial al montar.
- El wrap `.fila-menu-principal-contenido` (max-width 1380px / 85%) debe existir también en estado no-fixed para el centrado.
- Dropdowns por hover con delay de cierre (el original usa el `::after` invisible de 2rem como zona de gracia).
- z-index: fila fixed 1000; col logo 20001; mega menú 999999; body.cabecera-fixed header > div 10001.
