# SectoresCarousel Specification (`et_pb_section_3` intro + `et_pb_section_4` Swiper)

## Overview
- **Target files:** `src/components/SectoresIntro.tsx` + `src/components/SectoresCarousel.tsx`
- **Interaction model:** carrusel **SwiperJS `sectoresSwiper`** — autoplay (time) + drag + click en slide/dots. **RESUELTO punto abierto #2** con la config literal de `init.js`.

## Parte A — Intro (`et_pb_section_3`, id `home-content`)

Fila 1/3 + 2/3 (mismo patrón que sección 2):
- **Col izquierda:** punteado.svg + H2 "Sectores" (44px/300/#333) + botón `boton-azul` **"Descargar catálogo"** → `#catalogo` (anchor interno).
- **Col derecha:**
  - Body (`text_20`) verbatim:
    > Controla la contaminación ambiental en tiempo real con la solución más fiable para el análisis preciso de gases y partículas y toma mejores decisiones.
    >
    > Elige los contaminantes que desees medir en cada proyecto. Kunak AIR es una solución versátil que se adapta a las necesidades de cada sector gracias a sus [cartuchos inteligentes](https://kunakair.com/es/sensor-de-calidad-del-aire/) interc… *(verificar cola de la frase en QA)*
  - Destacado azul (`text_21`): dos `<span style="color:#0075c9">`: **"Una solución."** / **"Múltiples aplicaciones."** (azul grande, ~36px/300 — validar px en QA).
  - Nota (`text_22`): "Desliza las imágenes y encuentra la solución perfecta para tu sector."
- `padding-bottom: 59px` en la sección.

## Parte B — Carrusel (`et_pb_section_4`, fullwidth)

### Configuración Swiper EXACTA (init.js)

```js
new Swiper(".sectoresSwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  speed: 700,                                    // transición de deslizamiento 700 ms
  autoplay: { delay: 5000, disableOnInteraction: false },   // AUTOPLAY cada 5 s
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, // ocultas por CSS
  grabCursor: true,
  loop: true,
  centeredSlides: true,                          // slide activo centrado
  slideToClickedSlide: true,                     // click en slide lateral → navega a él
  pagination: { el: ".swiper-pagination", clickable: true },
  breakpoints: {
    480:  { slidesPerView: 1, spaceBetween: 10 },
    640:  { slidesPerView: 2, spaceBetween: 20 },
    990:  { slidesPerView: 3, spaceBetween: 25 },
    1500: { slidesPerView: 4, spaceBetween: 30 },
  },
});
```

- Timing-function del wrapper: `--swiper-wrapper-transition-timing-function: ease-in-out`.
- Flechas nativas: `display:none !important` — la navegación lateral se hace con **cursores custom** (SVG flecha data-URI, blanca) sobre `swiper-slide-next` (flecha →, hotspot 6 15) y `swiper-slide-prev` (flecha ← espejada, hotspot 30 15) + `slideToClickedSlide`.
- Alineación con el grid: JS copia el `offset().left` de `#distance-left` (un `.container` vacío) y aplica `padding-left = distance_left - 70px` al `.sectoresSwiper`. Además regla CSS base: `padding: 0 7vw 3rem !important`.

### Estructura de cada slide

```
.swiper-slide                        (500px alto, border-radius 10px, overflow hidden)
├─ .sector-imagen-wrap               (absolute, 100% ancho, 500px alto, br 10px, overflow hidden)
│  └─ a.sector-imagen                (flex col centrado; bg cover + overlay ::before rgba(0,0,0,.3);
│  │                                  transition: all .5s; padding-bottom: 30%)
│  └─ img icono SVG                  (60px, filter: brightness(0) invert(1) → blanco)
└─ .sector-content                   (z-2, absolute bottom, padding 3rem 1rem 1rem,
   │                                  bg linear-gradient(0deg, rgba(0,0,0,0.56), transparent))
   ├─ h3                             (blanco)
   ├─ .sector-descripcion            (blanco, lh 1.5, padding-bottom .7rem)
   └─ a.et_pb_button "Ver más"       (sin borde, blanco, padding 0, flecha Divi)
```

### Estados

| Estado | Valores |
|---|---|
| Slide NO activo | `opacity: .3`; `pointer-events: none` en sus enlaces; cursor default |
| Slide activo | `opacity: 1` |
| Hover slide activo | `.sector-imagen` → `transform: scale(1.1)` (transition all .5s) y overlay `::before` → `background-color: rgba(0,117,201,0.65)` (transition .5s ease-in-out) — capa azul Kunak |
| Slide next/prev | cursor flecha SVG custom (→/←); click navega (slideToClickedSlide) |
| Autoplay | avanza 1 slide cada **5000 ms**, transición **700 ms ease-in-out**, no se detiene tras interacción |

### Paginación (dots)
- `.swiper-pagination-bullet`: **píldoras 2rem × 7px**, `border-radius: 5px`, `border: 1px solid #000`, fondo transparente, `opacity: .2`, gap horizontal 4px, clicables.
- Activa: `background: var(--azul); border-color: var(--azul); opacity: 1`.
- Posición: bottom 10px, centrado.

### Slides (6, orden DOM, verbatim)

| # | H3 | Descripción | BG (local `public/images/uploads/…`) | Icono | Href |
|---|---|---|---|---|---|
| 1 | Urbano | Crea espacios donde la gente quiera vivir controlando la calidad del aire. | `2023/01/urban-1920-1024x546.jpg` | `2023/01/urban-2.svg` | `/es/sectores/calidad-del-aire-en-las-ciudades/` |
| 2 | Industria y olores | Ayuda a crear un futuro más limpio vigilando las inmisiones industriales. | `2023/01/industry-1920x1024-1-1024x546.jpg` | `2023/01/industry.svg` | `/es/sectores/control-de-emisiones-industriales/` |
| 3 | Puertos y Aeropuertos | Haz tu transporte más sostenible controlando sus emisiones. | `2023/03/ports-1920-1024x546.jpg` | `2023/02/ports-airports-2.svg` | `/es/sectores/contaminacion-del-transporte-maritimo/` |
| 4 | Construcción | Reduce el impacto ambiental de tus obras midiendo la contaminación que generan. | `2023/01/construction-1920x1024-1-1024x546.jpg` | `2023/01/construction.svg` | `/es/sectores/contaminacion-por-construccion/` |
| 5 | Minería | Contribuye a una extracción más sostenible monitorizando el impacto de tus explotaciones. | `2023/01/mining-1920x1024-1-1024x546.jpg` | `2023/01/mining.svg` | `/es/sectores/contaminacion-del-aire-por-la-mineria/` |
| 6 | Investigación y consultoría | Estudia la contaminación atmosférica combinando tecnología punta y conocimiento. | `2023/01/research-1920-1024x546.jpg` | `2023/01/research.svg` | `/es/sectores/estudio-de-la-contaminacion-atmosferica/` |

*(Nota: los sectores EDAR y Petróleo y gas existen en el nav pero NO están en el carrusel de la home.)*

- `padding-bottom: 5%` en la sección.

## Responsive
- slidesPerView: 1 (base y 480) → 2 (≥640) → 3 (≥990) → 4 (≥1500).
- Al bajar de 990px las tarjetas laterales apenas asoman (centeredSlides) — mantener opacidades.
- `padding: 0 7vw 3rem` se mantiene; el ajuste `#distance-left` solo si existe el contenedor.

## Assets
Los 6 JPG 1024×546 + 6 iconos SVG ya están en `public/images/uploads/…` (ver tabla).
