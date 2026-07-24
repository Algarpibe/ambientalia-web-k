# informacion-producto.spec.md — "Información del producto" (S1 · fila 2)

> getComputedStyle a 1045×515. Fila `.et_pb_row_2`: columnas **1/3 (244px) + 2/3 (534px)**, mismo contenedor 824px.
> Decisión de producto: "Descarga el catálogo" → `/es/descarga-catalogo/` (así está ya en ESTA fila; el `#catalogo` muerto solo existe en el sub-nav sticky).

## Columna izquierda (1/3 — 244px)

| Módulo | Contenido | Estilos |
|---|---|---|
| `et_pb_image_2` | `punteado.svg` decorativo | existente |
| `text_5 > p` | `Información del producto` | **44px / 55px, weight 300, ls ‑0.5px, #333** (mismo estilo que el H2 del hero) |
| `et_pb_image_3` | **Foto producto instalado** `kunak_air_pro_completo-isolated-2.png` (estación en mástil con panel solar) | 176×421 renderizado, ancho natural de columna |
| `et_pb_button_2` (outline) | `Descargar ficha técnica` → `https://kunakair.com/doc/External/Kunak_AIR_Datasheet_ES.pdf` | outline #333: transparente, borde 0.67px #333, radius 30px, 15px w700, padding 7.5/40.5/9/22.5 |
| `et_pb_button_3.boton-azul` | `Solicita más información` → `/es/contacto/` | pill sólido #0075C9 (mismos metrics), margin-bottom 30px |
| `et_pb_button_4.boton-azul` | `Descarga el catálogo` → `/es/descarga-catalogo/` | ídem |

(A 244px de columna los 2 primeros botones parten en 2 líneas — 229×69; fiel al original.)
Alineación tablet: `et_pb_button_alignment_tablet_center` (botones centrados en ≤980).

## Columna derecha (2/3 — 534px) — orden exacto de módulos

Base tipográfica: **p 18px / 30.6px, weight 400, #333**; márgenes entre módulos ~22.7px.
H3 azules: **37px / 37px, weight 300, #0075C9**.
Enlaces inline en el copy: color #333 (no azul), sin subrayado — `Kunak AIR Cloud` → `/es/software-de-medicion-calidad-del-aire/`, `Kunak AIR` → `/es/soluciones/`.

1. **`text_6`** — H3 azul: `Te mereces una buena calidad del aire.`
2. **`text_7`** — 2 párrafos: `Monitoriza partículas y hasta 5 gases contaminantes de nuestra amplia gama de sensores. El Kunak AIR Pro proporciona datos continuos y en tiempo real del aire ambiente, con mediciones equiparables a las de referencia en cualquier entorno, para una monitorización fiable.` / `Todos los datos recogidos se pueden visualizar y analizar en cualquier momento y lugar a través de la plataforma web Kunak AIR Cloud.`
3. **`text_8` — RECUADRO AZUL 1**: `border: 2px solid #0075C9; border-radius: 20px; padding: 25px; background: transparent`. Texto: `**Calidad de los datos garantizada.** Todos nuestros sensores se calibran y prueban en fábrica de acuerdo con la norma europea CEN/TS 17660 y los protocolos, métricas y valores objetivo de la EPA/600/R para sensores de aire.` + párrafo `**Trazabilidad de los datos** respecto a normas de referencia: Directiva Europea 2024/2881 y USEPA 40 CFR Parte 53.` — ⚠️ los destacados (`Calidad de los datos garantizada.`, `norma europea CEN/TS 17660`, `EPA/600/R`, `Trazabilidad de los datos`, `Directiva Europea 2024/2881`, `USEPA 40 CFR Parte 53`) son **`<span>`/`<strong>` azules #0075C9 w700 SIN enlace** (no `<a>`).
4. **`text_9`** — H3 azul: `Obtén datos precisos sobre una amplia gama de contaminantes.`
5. **`text_10`** — párrafo: `**La solución más versátil.** Nuestra tecnología de cartuchos de gas plug & play te permite combinar y cambiar fácilmente los sensores en cualquier momento para adaptarlos a las necesidades de tu proyecto.` (negrita inicial #333; `plug & play` en cursiva)
6. **CHECKLIST — 6× `et_pb_blurb` (`blurb_6`–`blurb_11`) clase `iconos-xs-2`**: grid 2 columnas (`width:48%; margin-inline-end:2%; :nth-child(2n){margin-inline-end:0}`, inline-block vertical-align text-top). Cada item: icono SVG lineal azul (~40px) a la izquierda + título **18px w300 / 21.6px #333** al lado. Orden verbatim:
   - `Sistema plug & play de cartuchos` — `/2023/02/cartridge-system.svg` (existente)
   - `Hasta 16 contaminantes. Combina 5` — `/2023/02/multi-pollutant-1.svg` (existente)
   - `Precisión demostrada (EPA, MCERTS, Airlab, CEN/TS 17660)` — `/2023/02/accuracy.svg` 🆕
   - `Trazable respecto a normas de referencia` — `/2023/02/high-reliability.svg` 🆕
   - `Mantenimiento sencillo y remoto` — `/2023/02/easy-fast-installation.svg` 🆕
   - `Funcionamiento autónomo` — `/2023/01/IconosAirLite_Mesa-de-trabajo-1-copia-4.svg` 🆕 (icono batería/solar)
7. **`text_11`** — párrafo intro + **RECUADRO AZUL 2** (div anónimo dentro del módulo): `border: 2px solid #0075C9; border-radius: 12px; padding: 20px`. Intro: `Con las estaciones de calidad del aire Kunak AIR obtienes una monitorización ambiental con mediciones precisas, fiables y en tiempo real de los principales contaminantes con un coste menor a los métodos tradicionales.` Recuadro: `Las estaciones Kunak AIR ofrecen niveles de rendimiento cercanos a los **estándares de referencia**, proporcionando datos fiables y precisos según la norma europea CEN/TS 17660 para alcanzar los DQO de Clase 1 y acorde a los protocolos, métricas y valores objetivo EPA/600/R-20/279 para O3, EPA/600/R-23/14 para NO2, CO y SO2, EPA/600/R-20/280 para PM2,5 y EPA/600/R-23/145 para PM10.` + `Además, los datos son trazables a estándares internacionales reconocidos (Directiva (UE) 2024/2881 y USEPA 40 CFR Parte 53).` (mismo tratamiento: destacados azules sin enlace; radius 12 ≠ 20 del recuadro 1 — fiel).
8. **`text_12`** — H3 azul: `Empieza hoy mismo a mejorar la calidad del aire en tu entorno.`
9. **`text_13`** — 2 párrafos: `Hazte con la solución premiada como el **sensor multi-contaminante más preciso** y comienza a tomar medidas efectivas para mejorar la calidad del aire.` / `Con la plataforma web Kunak AIR Cloud podrás visualizar y analizar fácilmente los datos recogidos en las estaciones de control de calidad del aire, permitiéndote tomar **mejores decisiones**.` (negritas #333)
10. **`text_14`** — párrafo: `Nuestra solución ha sido testada por los principales expertos en calidad del aire del mundo.`
11. **SEGUNDA FILA DE LOGOS — 6× `et_pb_blurb` (`blurb_12`–`blurb_17`) `iconos-xs-2`**: mismos 6 logos/enlaces que el hero (EPA‑1, Mcerts, AQ‑SPEC→aqmd.gov, airparif, SEDEMA_CDMX, Ricardo — ver hero-producto.spec.md §logos).
12. **`text_15.parametros.clear-both` — CHIPS DE CONTAMINANTES**:
    - `h3` `La gama de contaminantes más completa` — 37px azul + `padding-bottom: 17px`.
    - `ul` sin bullets (`list-style:none; padding-inline-start:0; padding-bottom:.3em`).
    - **16 `li`-píldora**: `display:inline-block; margin: 0 8px 10px 0; border: 2px solid #0075C9; border-radius: 30px; min-width: 50px; height: 50px; padding: 0.8em 0.5em 0.85em; background: #fff; color: var(--azul); line-height: 1; text-align: center` (el chip CO mide 50×50 → los cortos son circulares, los largos píldora).
    - Dentro, `a` **18px w700 #0075C9** con `target="_blank"`, subíndices `<sub>`. Orden + hrefs (`/es/cartuchos-inteligentes/…`): CO→`monoxido-de-carbono`, NO→`oxido-nitrico`, NO₂→`dioxido-de-nitrogeno`, O₃→`ozono`, SO₂→`dioxido-de-azufre`, H₂S→`acido-sulfhidrico`, CO₂→`dioxido-de-carbono`, CH₄→`metano`, COV, NMHC, NH₃, HCl, HCN, HF, Cl₂ – ClO₂, O₂ (los 8 últimos: capturar slug del DOM en build; mismos destinos que el grid "Cartuchos inteligentes" del mega-menú B8).
    - Hover chip: sin cambio de fondo detectado en CSS del tema (los `a` ya van en azul); confirmar en build si hay hover heredado.

## Móvil (390)

- Columnas apiladas (izq → der). Título 44px se mantiene; botones centrados (`alignment_tablet_center`).
- Checklist y logos ya son grid 2-col por `iconos-xs-2` 48%.
- Chips: mismas píldoras con wrap natural (3 filas aprox).

## Assets NUEVOS a descargar (esta sección)

| Asset | URL origen |
|---|---|
| Foto producto instalado | `https://kunakair.com/wp-content/uploads/2022/12/kunak_air_pro_completo-isolated-2.png` |
| Icono precisión | `https://kunakair.com/wp-content/uploads/2023/02/accuracy.svg` |
| Icono trazabilidad | `https://kunakair.com/wp-content/uploads/2023/02/high-reliability.svg` |
| Icono mantenimiento | `https://kunakair.com/wp-content/uploads/2023/02/easy-fast-installation.svg` |
| Icono autonomía | `https://kunakair.com/wp-content/uploads/2023/01/IconosAirLite_Mesa-de-trabajo-1-copia-4.svg` |

(EPA‑1 y demás logos: ver hero-producto.spec.md. La ficha técnica PDF se enlaza al origen, no se descarga.)
