# TrustBar Specification (`banda-clientes`, et_pb_section_1)

## Overview
- **Target file:** `src/components/TrustBar.tsx`
- **Interaction model:** time-driven — **carrusel Swiper con autoplay** (RESUELTO: punto abierto #4 de BEHAVIORS.md)
- **Fuente:** HTML servido (35 slides literales) + init.js (config Swiper exacta) + theme.css

## DOM Structure

```
section .et_pb_section_1.banda-clientes            ← bg #e4e5e5
└─ Row .et_pb_row_1  (padding: 30px 0 20px)
   ├─ Col 1/3
   │  ├─ img punteado.svg (60×22)                   ← puntos decorativos, absolute
   │  └─ text_5  p "Con la confianza de empresas líderes"
   └─ Col 2/3
      └─ .swiper.clientesSwiper.kunak-shortcode
         └─ .swiper-wrapper > .swiper-slide × 35 (img SVG por cliente)
```

## Configuración Swiper EXACTA (de init.js)

```js
new Swiper(".clientesSwiper", {
  slidesPerView: 2,
  spaceBetween: 30,
  centeredSlides: false,
  autoplay: { delay: 2500, disableOnInteraction: false },
  grabCursor: true,
  loop: true,
  breakpoints: {
    480:  { slidesPerView: 3, spaceBetween: 20 },
    640:  { slidesPerView: 4, spaceBetween: 20 },
    768:  { slidesPerView: 5, spaceBetween: 40 },
    1024: { slidesPerView: 6, spaceBetween: 50 },
    1280: { slidesPerView: 6, spaceBetween: 50 },
  },
});
```

- **Autoplay cada 2500 ms**, avanza 1 slide; `disableOnInteraction:false` (sigue tras arrastrar).
- `loop: true` → aparenta marquesina infinita por pasos (con transición de deslizamiento estándar Swiper ~300ms).
- `grabCursor` → cursor de agarre; arrastrable con ratón/touch.
- Sin dots ni flechas.
- **En el clon (sin Swiper):** carrusel por pasos con `transform: translateX` animado cada 2.5 s y lista duplicada para loop, o instalar `swiper` npm. Recomendado: swiper npm para clavar la física del drag.

## Computed / authored styles

### Sección
- `background-color: #e4e5e5` (¡no #eee!)
- `padding: 0` (vertical lo da la row: `padding: 30px 0 20px`)
- Altura render: **153px** @1440

### Col izquierda
- Texto "Con la confianza de empresas líderes": módulo `et_pb_text_5`; render visual ≈ 28–30px, peso 300, color `#333`, line-height ~1.3 *(el tamaño exacto del módulo lo fija el builder — validar en QA; la regla `.et_pb_text_5 h2 {font-size:44px}` NO aplica porque el contenido es `<p>`)*
- Punteado decorativo: `img punteado.svg (60×22)`, `position:absolute; top:-10px; left:-65px; z-index:-1` *(la regla `.banda-clientes .et_pb_image { top:-10px }` pisa el `top:-40px` genérico)*. En RTL se voltea.

### Carrusel
- `.banda-clientes .swiper { width:100%; line-height:1 }`
- `.banda-clientes .swiper-wrapper { align-items:center; height:auto }`
- `.banda-clientes .swiper-slide { text-align:center }`
- `.banda-clientes img { max-width:200px; max-height:80px }`
- Los SVG de cliente son monocromos gris oscuro por diseño propio (sin filter en la home).

## Slides (35, orden del DOM, con title verbatim y ruta local)

| # | Cliente (title) | Archivo local (`public/images/uploads/…`) |
|---|---|---|
| 1 | World Health Organization | `2023/05/world-health-organization.svg` |
| 2 | Teck Resources Limited | `2023/11/teck.svg` |
| 3 | APM Terminals | `2023/05/apm-terminals.svg` |
| 4 | Envirosuite | `2023/05/envirosuite.svg` |
| 5 | LIFECO The Libyan Fertilizer Company | `2024/11/lifeco-logo.svg` |
| 6 | World Athletics | `2023/05/world-athletics.svg` |
| 7 | City of Gent | `2025/02/gent.svg` |
| 8 | Universiti Brunei Darussalam | `2023/05/university-of-brunei-darussalam.svg` |
| 9 | Arcelor Mittal | `2023/05/arcelor-mital.svg` |
| 10 | Barrick Gold Corporation | `2023/11/barrick.svg` |
| 11 | Ricardo | `2025/02/ricardo.svg` |
| 12 | Cemex | `2023/05/cemex.svg` |
| 13 | Iberia | `2023/05/iberia.svg` |
| 14 | Acoem | `2023/05/acoem.svg` |
| 15 | Saneago | `2023/05/saneago.svg` |
| 16 | Coca-Cola | `2023/05/coca-cola.svg` |
| 17 | AQMD South Coast | `2023/05/south-coast-aqmd.svg` |
| 18 | AMB Àrea Metropolitana de Barcelona | `2025/02/AMB.svg` |
| 19 | Vito | `2023/05/vito.svg` |
| 20 | Dunkerque Port | `2023/05/dunkerque-port.svg` |
| 21 | BHP Billiton | `2023/11/bhp.svg` |
| 22 | Atmo | `2023/01/ATMO.svg` |
| 23 | Rio Tinto Company Limited (RTC) | `2023/11/riotinto.svg` |
| 24 | Total Energies | `2025/02/total_energies.svg` |
| 25 | Ternium | `2025/02/ternium.svg` |
| 26 | UNEP | `2023/05/UNEP.svg` |
| 27 | Port of Zeebrugge | `2023/05/port-of-zeebrugge.svg` |
| 28 | Repsol | `2023/05/repsol.svg` |
| 29 | Marcobre | `2023/05/marcobre.svg` |
| 30 | Inpex corporation | `2023/05/inpex.svg` |
| 31 | US EPA | `2023/05/us-epa.svg` |
| 32 | Ayuntamiento de Madrid | `2023/05/madrid.svg` |
| 33 | First Quantum Minerals Ltd. | `2023/11/first-quantum.svg` |
| 34 | Petrobras | `2025/02/petrobras.svg` |
| 35 | EFE Trenes de Chile | `2023/05/efe-chile.svg` |

*(Los slides son `<img>` sin enlace — no clicables.)*

## Text Content (verbatim)
- `Con la confianza de empresas líderes`

## Responsive Behavior
- slidesPerView según breakpoints Swiper de arriba (2 → 3 @480 → 4 @640 → 5 @768 → 6 @1024).
- **≤980px (Divi):** las dos columnas (texto / carrusel) se apilan; texto arriba, carrusel debajo a ancho completo.
- Punteado decorativo puede quedar oculto/parcial en móvil (absolute con left negativo).

## Assets
- `public/images/uploads/2022/12/punteado.svg` (60×22)
- 35 SVG de clientes listados arriba (todos descargados).
