# beneficios.spec.md — Bloque "Beneficios" (S3 · col. derecha · ancla `#benefits`)

> getComputedStyle 2026-07-24 a viewport **2400×1138** CSS px (fila Divi al tope: 1380 px; col. derecha 3/4 de S3 = **1016 px**).
> Los computed fraccionarios (37.93px, 20.31px…) provienen del zoom 0.8 del navegador de captura; se indican los valores CSS canónicos.
> ⚠️ Este grid es DISTINTO del componente `Beneficios` de la home (no reutilizar).

## Estructura

Bloque = 10 módulos hermanos directos en la col. derecha (que es `display:flex; flex-wrap:wrap`):

1. **Título** `.et_pb_text_17` con `id="benefits"` (ancla del sub-nav). HTML interior verbatim:
   ```html
   <h2 id="beneficios">Beneficios</h2>
   <p>Facilitamos la toma de decisiones con datos ambientales precisos</p>
   ```
   (El `<p>` intro NO lleva punto final. Nótese el segundo id `beneficios` en el h2 — irrelevante, el sub-nav usa `benefits` del módulo.)
2. **9 blurbs** `.et_pb_blurb.modulo-beneficios.et_pb_blurb_position_left` (blurb_18 … blurb_26).

## Grid (mecanismo real)

- La columna es `display:flex; flex-wrap:wrap` → el título (width 100%) ocupa su fila y los blurbs envuelven en filas de 3.
- Regla del tema (`style.css`), **solo ≥981px**:
  ```css
  .modulo-beneficios { display: inline-block; margin-inline-end: 2%; width: 31%; }
  .modulo-beneficios:nth-child(3n+1) { margin-inline-end: 0; }   /* 3º de cada fila (título = child 1) */
  .modulo-beneficios > div { max-width: none !important; }
  ```
  Computed @1016: blurb **314.96 × ~111 px**, margin-right 20.31px.
- `margin-bottom` de cada módulo (título incluido): **37.93px** = 2.75% del row Divi (1380) — separación vertical entre filas.
- **<981px**: sin regla de ancho → blurbs apilados al 100% (single column).

## Tipografías (computed)

| Elemento | Estilos |
|---|---|
| `h2` Beneficios | **37px / 37px, weight 300, #333, letter-spacing ‑0.5px**, padding-bottom 10px |
| `p` intro | **18px / 30.6px, weight 400, #333** |
| Blurb `h3` título | **24px / 28.8px, weight 300, #333, ls ‑0.5px**, padding-bottom 10px |
| Blurb `p` texto | **16px / 21.92px, weight 400, #333** |

## Anatomía del blurb (Divi `et_pb_blurb_position_left`)

- `.et_pb_blurb_content`: `display: table`.
- `.et_pb_main_blurb_image`: `display: table-cell; width: 40px; line-height: 0` → **icono 40×40** arriba-izquierda (svg lineal azul).
- `.et_pb_blurb_container` (título + texto): `display: table-cell; vertical-align: top; padding-left: 15px`.
- Equivalente clon: flex `items-start gap-[15px]`, icono `40px` fijo.

## Los 9 items (verbatim: título — texto — icono)

| # | Título | Texto | Icono (`/wp-content/uploads/…`) | Asset |
|---|---|---|---|---|
| 1 | Instalación sencilla y rápida | Instala la estación en menos de 10′ con diagnóstico visual en pantalla. | `2023/02/easy-fast-installation.svg` | ✓ ya en clon |
| 2 | Sistema de cartuchos | Sustituye y combina los cartuchos mediante sistema plug & play. | `2023/02/cartridge-system.svg` | ✓ |
| 3 | Precisión probada | Adquiere el sistema más fiable y preciso del mercado. | `2023/02/accuracy.svg` | ✓ |
| 4 | Calibración sencilla | Calibra todo el rango de medida solo con dos puntos. | `2023/02/easy-calibration.svg` | 🆕 |
| 5 | Plataforma cloud de calidad del aire | Visualiza, analiza y gestiona tu red de equipos y tus datos en la nube. | `2023/02/cloud-platform.svg` | 🆕 |
| 6 | Múltiples contaminantes | Aprovecha su capacidad para medir hasta 5 gases y partículas a la vez. | `2023/02/multi-pollutant-1.svg` | ✓ |
| 7 | Totalmente autónomo | Funcionamiento autónomo gracias a su batería integrada y a su panel solar. | `2023/01/IconosAirLite_Mesa-de-trabajo-1-copia-4.svg` | ✓ |
| 8 | Datos en tiempo real | Accede a tus datos y alarmas en tiempo real. | `2023/02/real-time.svg` | 🆕 |
| 9 | Sensores adicionales | Conecta sondas como sensores de viento, lluvia, ruido, etc. | `2023/02/additional-probes.svg` | 🆕 |

Los SVG originales son 800×800 (salvo #7: 113×113); todos renderizan a 40×40.

## Estados

- **Ninguno**: sin enlaces, sin hover, sin animaciones de entrada (`et_pb_animation_off`). Bloque 100 % estático.

## Assets NUEVOS a descargar

| Asset | URL origen |
|---|---|
| Icono calibración | `https://kunakair.com/wp-content/uploads/2023/02/easy-calibration.svg` |
| Icono plataforma cloud | `https://kunakair.com/wp-content/uploads/2023/02/cloud-platform.svg` |
| Icono tiempo real | `https://kunakair.com/wp-content/uploads/2023/02/real-time.svg` |
| Icono sondas adicionales | `https://kunakair.com/wp-content/uploads/2023/02/additional-probes.svg` |
