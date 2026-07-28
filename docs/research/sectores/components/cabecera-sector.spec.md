# CabeceraSector — `.cabecera.cabecera-sectores`

> Medido 2026-07-28 en `…/sectores/calidad-del-aire-en-las-ciudades/` a
> **1440×900** y **390×844** reales (puppeteer-core, Chrome del sistema,
> headless, perfil limpio, Cookiebot bloqueado, lazy→eager + scroll/settle).
> Componente: `src/components/sectores/CabeceraSector.tsx`.

## Qué es

La franja de foto de las otras 4 páginas clonadas **más una fila Divi con
texto encima**. Es la única diferencia estructural de la cabecera de un sector:

| | Las 4 páginas ya clonadas | **Sector** |
|---|---|---|
| Clases | `cabecera` | `cabecera` **`cabecera-sectores`** |
| Alto de sección | 225 | **397.61** (móvil **347.25**) |
| Filas | topbar 0..41 · menú 41..185 | + **fila kicker/H1 185..357.61** |
| Foto | genérica, **varía entre visitas** | **la del sector**, estable |

## Fondo

```
background-image:
  linear-gradient(rgba(71,71,71,0.17) 0%, rgba(0,0,0,0) 100%),
  url(<foto del sector>);
background-position: 50% 50%, 50% 50%;
background-size: cover, cover;
```
Urbano → `/images/uploads/2023/01/urban-1920.jpg` (la **misma** que la franja
del pie, ver `Footer` prop `stripImage`).

`padding: 0 0 40px` en los dos anchos.

## Geometría vertical (la cuenta completa, de arriba abajo)

| | 1440 | 390 |
|---|---|---|
| Filas del header (las pinta `HeaderNav`) | 0 → **185** | 0 → **125.58** |
| Fila de texto: `padding-top` | 28.7969 (**2%**) | **30** |
| Kicker: `margin-top` | **−13** | **−13** |
| Kicker: caja de línea | 30.59 (`40px/30.6`) | 30.59 |
| Hueco kicker → h1 | **29.77** | **16.22** |
| `<h1>`: alto | 46 (1 línea) | 82 (2 líneas) |
| Tras el h1 (`margin-bottom` del módulo) | 21.6562 | 5.8594 |
| Fila: `padding-bottom` | 28.7969 | 30 |
| Sección: `padding-bottom` | 40 | 40 |
| **Total** | **397.61** | **347.25** |

Comprobación 1440: 185 + 28.797 − 13 + 30.59 + 29.77 + 46 + 21.656 + 28.797 +
40 = **397.61** ✓ · 390: 125.58 + 30 − 13 + 30.59 + 16.22 + 82 + 5.859 + 30 +
40 = **347.25** ✓.

> **De dónde sale el "hueco kicker → h1".** El módulo del kicker mide **41.8**
> de alto cuando su `.et_pb_text_inner` mide 30.59, con `padding: 0` y sin
> márgenes: sobran 11.21px que **no hemos sabido atribuir a ninguna regla
> Divi** (el inner es `display: block`, los únicos hermanos son nodos de
> espacios en blanco). En vez de replicar un `padding` inventado, se replica el
> **resultado**: caja de línea de 30.6 y luego el hueco real hasta el h1
> (11.21 + 18.5625 = **29.77** en desktop; 11.21 + 5.0156 = **16.22** en
> móvil). Si algún día aparece la regla, el reparto cambia pero el total no.

## Fila de texto

Retícula Divi **86% máx 1380** en los DOS anchos (1238.39 a 1440 · 335.39 a
390). Medido a 1280/1440/1600/1800: 1100.8 · 1238.39 · 1376 · 1380 — el
máximo entra a ~1605px. **No es el 80%** de las páginas de producto. `margin: 0 auto`.

## Tipografía

| Elemento | 1440 | 390 |
|---|---|---|
| Kicker | `40px / 30.6px` **w700** `#fff`, `letter-spacing: normal` | igual |
| `<h1>` | `30px / 36px` w400 `#fff`, `letter-spacing: -0.5px`, `padding-bottom: 10px` | igual |

**El kicker no baja de tamaño en móvil** (sigue a 40px), igual que el h1. Es la
misma familia de reglas que los h2 de 37px del hero: en este arquetipo lo que
baja son los **44px** (a 35), no los 30/37/40.

El kicker es texto plano dentro de un `.et_pb_text` (no un heading): en el clon
va como `<p>`, para no meter un `<h2>` por delante del `<h1>`.

## Contenido (Urbano, verbatim)

- Kicker: `Urbano`
- H1: `Calidad del aire en las ciudades`

Los dos son campos del content type (`header.kicker`, `header.title`).

## Nota de integración con `HeaderNav`

`HeaderNav` es `absolute inset-x-0 top-0`, así que **no ocupa espacio**: el
hueco de 185/125.58 lo pone esta sección con `padding-top`. Medido en el clon,
el header real acaba en **203.59 a 1440** y **126 a 390** — o sea, a 1440 va
18.6px más alto que el original (residuo pre-existente anotado en P2). Con el
hueco del original (185) la **caja** del header solapa los primeros 18.6px de
la franja, pero **no hay colisión visual**: el elemento más bajo que pinta el
header es el pill "Descargar catálogo", que termina en ~173, muy por encima del
kicker (200.8). Se replica la geometría del original y no se compensa.

## Estados

Ninguno. Bloque 100% estático: sin enlaces, sin hover, sin interacción.

## Assets

- `/images/uploads/2023/01/urban-1920.jpg` (compartida con la franja del pie)
