# beneficios-api.spec.md — `BeneficiosApi` (S1 · fila 3)

> Medido en vivo el **2026-07-27** a **cw 1264.7** (viewport 1280).
> Topología: `../PAGE_TOPOLOGY.md` §S1 · Blurbs: `blurbs-iconos.spec.md`.

## ⚠️ No es `ListaBeneficios` de /software

Mismo rótulo, bloque distinto:

| | `ListaBeneficios` (/software) | `BeneficiosApi` (/kunak-api) |
|---|---|---|
| Disposición | icono **a la izquierda**, 1 por fila a ancho completo | icono **arriba centrado**, **3 por fila** |
| Icono | 40×40 + gap 15 | 50×50 |
| Titular | `<h3>` 24 / 28.8 | `<h4>` 18 / 21.6 |
| Descripción | **sí** | **no** |
| Nº de items | 9 | 6 |

Aquí el bloque es **exactamente el mismo** que las características de la fila 2
(`BlurbsIconos variante="iconos-md-3"`), solo que en una columna más ancha:
**223.5** de caja frente a 196.8.

## Estructura

Fila `et_pb_row_3`: **80% máx 1380** (1011.7), `padding: 20px 0 5%` (63.23).
Columnas **1/4 + 3/4** = 211.2 + 744.9 (20.875% / 73.625%), gutter 5.5%.

### Columna 1/4 (211.2) — **solo el titular**

| Elemento | Medida |
|---|---|
| Punteado | 60×22 fuera de flujo, −65 x / −40 y |
| `<h2>` `Beneficios` | 44/55 fw300 #333, `pb 10`, alto 65, módulo `margin-bottom: 0` |

**Aquí NO hay caja de anclas.** Sin `menu-anclas`, sin los 2 CTAs debajo y sin
`position: sticky` — verificado en el DOM en vivo (`.menu-anclas` → 0
elementos, y los únicos `sticky|fixed` del contenido son del header). Es la
diferencia estructural más importante de esta página respecto a
/monitor-calidad-aire, /accesorios y /software, y por eso `AnchorNav`
**no se monta**.

### Columna 3/4 (744.9)

| Módulo | y | alto | margin |
|---|---|---|---|
| Párrafo de entrada | 1694.7 | 142.4 | `10px 0 20px` + **`padding-bottom: 20px`** |
| 6 blurbs | 1859.8 | 129.2 × 2 filas | `0 0 27.82px` (el 6.º a 0) |

El `<p>` mide 122.4 (4 líneas de 30.6) y el módulo 142.4: los 20 de diferencia
son un `padding-bottom` del módulo, **además** de sus 20 de `margin-bottom`.

Blurbs medidos: `x = 393.3 · 639.1 · 884.9`, caja **223.5** (30%), hueco
**22.34** (3%), 3 por fila, `margin-bottom: 27.81`. Los 6 títulos envuelven a
2 líneas a este ancho → todos los blurbs miden 129.2.

## Móvil (390)

Columnas apiladas. Titular a 35/43.75 y blurbs a **2 por fila** (48%).
