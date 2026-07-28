# hero-api.spec.md — `HeroApi` (S1 · fila 1)

> Medido en vivo el **2026-07-27** a **cw 1264.7** (viewport 1280) con computed
> styles reales. Topología: `../PAGE_TOPOLOGY.md` §S1.

## Estructura

Fila `et_pb_row_1`: **80% máx 1380** (1011.7), `padding: 0 0 1%` (12.65) y
`margin-bottom: 0` — el `padding-top` lo pone el 4% de la sección.
Columnas **1/2 + 1/2** = 478.0 + 478.0 (47.25% cada una), gutter 5.5% (55.64).

### Columna izquierda — ritmo medido

| Módulo | y | alto | margin-bottom |
|---|---|---|---|
| Punteado 60×22 | 299.3 | 22 | fuera de flujo: **−65 x**, **−26 y** |
| `<p>` kicker + `<h1>` | 325.3 | 125.6 | 27.81 (+ `padding-bottom: 9.55` del módulo) |
| `<h2>` | 478.6 | 175 | **0** |
| `<p>` claim | 653.6 | 61.2 | 27.81 |
| Botón azul | 742.6 | 43.3 | **30 del botón + 60 del wrapper = 90** |

Cierre de columna: 875.9 → alto 550.7. A este ancho **manda la columna
izquierda**, no la foto.

Tipografía (idéntica a la de /accesorios y /software, con la misma inversión:
el titular VISUAL es el `<p>`, el `<h1>` real va debajo):

| Elemento | Desktop | Móvil (≤767) |
|---|---|---|
| Kicker `<p>` | **50 / 60 / fw800** | 35 / 42 |
| `<h1>` | **23 / 23 / fw300**, `pb 10` | igual |
| `<h2>` | **44 / 55 / fw300**, `pb 10` | 35 / 43.75 |
| Claim `<p>` | **16 / 30.6 / fw800 / #0075C9** | igual |

En el clon los 9.55 de `padding-bottom` del módulo del kicker se suman a los
27.81 de margen y se pintan como **`mt-[37.4px]` en el `<h2>`**, exactamente
igual que en `HeroSoftware`.

⚠️ El **separador `|` del claim NO es azul**: va en un
`<span style="color: #333333;">`. El resto de la línea sí. Por eso
`HERO.claim` es `{ antes, separador, despues }` y no una cadena.

## Columna derecha — la foto con `margin-top: -10%`

`2023/02/kunak-api.jpg` **1200×1200**, `alt="Kunak API"`, sin enlace.

El detalle propio de esta página: el módulo de imagen sube por encima de la
fila. **Es un porcentaje, no un valor fijo** — y los márgenes en % se resuelven
contra el **ancho** del bloque contenedor (la columna):

| Ancho de columna | `margin-top` medido |
|---|---|
| 478.0 (cw 1264.7) | **−47.80** |
| 544.3 (cw 1440) | **−54.42** ← el valor que anotó el recon |

⇒ `margin-top: -10%`. Cierra el punto 3 de `../BEHAVIORS.md` §8.

En el clon la clase va en la **`<img>`**, no en la columna: la columna es un
flex item y su bloque contenedor sería la fila entera (1011.7), con lo que el
−10% valdría −101. Solo desde `md`, que es donde el original solapa.

## Móvil (390)

Columnas apiladas con los 30px de columna Divi. **La foto SÍ se ve** (312×312),
a diferencia de `kunak-cloud-dispositivos.png` en /software, que el original
oculta. El punteado sigue colgando −65px de la retícula, así que se recorta
contra el borde izquierdo (misma regla verificada en /accesorios, A4).

## Un solo CTA

`Solicita más información` → `/es/contacto/` (`BlueButton`). Aquí **no está** el
segundo CTA de la app de Android que sí tiene /software.
