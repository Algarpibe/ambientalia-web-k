# especificaciones.spec.md — Bloque "Especificaciones" (S3 · col. derecha · ancla `#specifications`)

> getComputedStyle 2026-07-24 a viewport **2400×1138** (col. derecha 3/4 = 1016 px; tabla max-width 880).
> Computed fraccionarios (1.25px, 31.25px…) = zoom 0.8 del navegador de captura; aquí se dan los valores CSS canónicos.
> ⚠️ **La "tabla" NO es un `<table>`**: es el plugin **Divi Table Maker** (`dvmd_table_maker` v4.0.1) — DIVs con CSS Grid,
> fuertemente re-estilado por el tema hijo KunakAir. Son **15 filas** (la topología estimaba 17 — corregido).

## Estructura

1. **Título** `.et_pb_text_21` con `id="specifications"`: `<h2>Especificaciones</h2>` — **37px/37px w300 #333 ls ‑0.5px pb 10px**.
2. **Tabla** `.dvmd_table_maker_0 > .dvmd_tm_table.dvmd_tm_hover_enabled` > 15 × `.dvmd_tm_trow_N` > 2 × `.dvmd_tm_tcell` cada una
   (col 0 = `.dvmd_tm_rhead`, col 1 = `.dvmd_tm_rfoot`; dentro `.dvmd_tm_cdata` con el texto).
3. **Sellos** `.et_pb_text_22.iconos-certificicados`: `<p>` con 3 `<img>` FCC · CE · RoHS.

Margen entre módulos: 37.94px (patrón 2.75% del row).

## Layout de la tabla

```css
/* plugin (base) */
.dvmd_table_maker_0 { max-width: 880px; }          /* .dvmd_table_maker { width: 100% } (tema) */
.dvmd_tm_table {
  display: grid;
  grid-template-columns: minmax(100px, 33%) minmax(100px, 67%);   /* computed @880: 290.4 / 589.6 */
  grid-auto-rows: minmax(60px, auto);  overflow: auto;  gap: 2px;
}
/* tema hijo (override) */
.dvmd_table_maker .dvmd_tm_table { grid-auto-rows: minmax(35px, auto) !important; gap: 0 !important; }
```
- `.dvmd_tm_trow` = `display: contents` (las celdas se colocan con `grid-area` explícita por celda).
- Cada celda: `display: flex; flex-direction: column` (centrado vertical natural: el cdata arriba; alto mínimo 35px).

## Celdas (tema hijo pisa al plugin)

| Propiedad | Valor (CSS canónico) |
|---|---|
| Borde | `border: 1px solid` (currentColor → **#333**) |
| Colapso de bordes | `.dvmd_tm_tcell:not(.dvmd_tm_col_first) { margin-inline-start: -1px }` · `.dvmd_tm_trow:not(.dvmd_tm_trow_0) .dvmd_tm_tcell { margin-top: -1px }` → hairlines simples |
| Padding | `8px 20px !important` |
| Fondo | **blanco `#fff !important`** (pisa los azules del plugin: rhead azul #0075C9, rfoot #d7e2ed — NO se ven) |
| Tipografía | **15px / 1.4 (21px), weight 400, #333** — ambas columnas (la izquierda NO va en bold ni en azul) |
| Esquinas | `border-radius: 10px` SOLO en las 4 celdas de esquina, vía `body:not(.rtl) .dvmd_tm_trow:first-child div:first-child { border-top-left-radius: 10px }` (+ 3 análogas) |
| Transición | `transition: background, border-radius, border-color, border-width 300ms ease` (del plugin) |
| Multilínea | saltos con `<br>` dentro del `.dvmd_tm_cdata` |

## Estados

- **Hover de fila (solo ≥981px)** — verificado empíricamente: el JS del plugin añade `.dvmd_tm_row_hover` a AMBAS celdas de la fila →
  `background-color: #eee !important` (tema, pisa los colores hover del plugin); el texto sigue #333. Transición 300ms.
- Sin hover en <981. Sin más estados (no hay enlaces dentro).
- Móvil ≤479: celdas `font-size: 13px; padding: 8px 10px !important`.

## Las 15 filas (verbatim)

| Col izquierda | Col derecha |
|---|---|
| Dimensiones / Peso | 257 x 270 x 225 mm / <3,5 kg |
| Carcasa | PMMA, policarbonato y acero inoxidable |
| Temp. / HR de funcionamiento | De -40ºC a 60ºC / De 0 a 99% HR |
| Grado de protección IP | IP65 |
| Batería | Litio 26Ah |
| Alimentación externa | Cargador 7 – 12 Vdc. o panel solar |
| Autonomía | 24/7 con cargador o panel solar`<br>`9-30 días funcionamiento con batería (dependiendo de la configuración) |
| Consumo energético | 0,08-1,2W (según la configuración) |
| Comunicaciones | Multibanda 2G/3G/4G, Ethernet y Modbus RTU Esclavo |
| GNSS | GPS y GLONASS |
| Sensores integrados | Temp. \| Humedad \| Presión atmosférica \| Punto de rocío *(los `\|` son texto literal)* |
| Conectores | #1: Alimentación de 7V a 12V o Ethernet`<br>`#2: Modbus RTU esclavo`<br>`#3: Sonómetro, UV`<br>`#4: WBGT, piranómetro, Modbus RTU maestro`<br>`#5: Anemómetro y pluviómetro`<br>`#Wifi: Sensor de partículas ultrafinas (PUF) |
| Periodos de muestreo | Desde 10 segundos a un máximo de 24h |
| Periodos de envío | Desde 5 minutos a un máximo de 24h |
| SIM | eSIM integrada y soporte SIM adicional |

## Sellos FCC / CE / RoHS

- `.iconos-certificicados p { display: flex; flex-wrap: wrap; align-items: baseline }`
- `.iconos-certificicados img { max-height: 40px; width: auto; margin-inline-end: 25px; margin-bottom: 20px }`
- Renderizados: FCC 48×40 · CE 56×40 · RoHS 40×40. Color gris oscuro (SVG monocromo). Sin enlaces.

## Implementación clon sugerida

`<table>` semántica (o grid) con: max-width 880, 33%/67%, borde 1px #333 colapsado, radius 10 en las 4 esquinas
exteriores (`overflow:hidden` en wrapper redondeado NO sirve: el radius es por celda y el overflow debe seguir siendo
auto para scroll horizontal en móvil), padding 8/20, 15px/1.4, hover de fila `#eee` (solo desktop), min-alto de fila 35px.

## Assets NUEVOS a descargar

| Asset | URL origen |
|---|---|
| Sello FCC | `https://kunakair.com/wp-content/uploads/2023/01/certificate-FCC-1.svg` |
| Sello CE | `https://kunakair.com/wp-content/uploads/2023/01/certificate-CE-1.svg` |
| Sello RoHS | `https://kunakair.com/wp-content/uploads/2023/01/certificate-rohs.svg` |
