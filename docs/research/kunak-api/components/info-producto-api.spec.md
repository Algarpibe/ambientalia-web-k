# info-producto-api.spec.md — `InfoProductoApi` (S1 · fila 2)

> Medido en vivo el **2026-07-27** a **cw 1264.7** (viewport 1280).
> Topología: `../PAGE_TOPOLOGY.md` §S1 · Blurbs: `blurbs-iconos.spec.md`.

## Estructura

Fila `et_pb_row_2`: **80% máx 1380** (1011.7), `padding: 20px 0 5%` (63.23).
Columnas **1/3 + 2/3** = 300.1 + 655.9 (29.6667% / 64.833%), gutter 5.5% —
la misma retícula que la fila 2 de /monitor-calidad-aire y /software.

### Columna 1/3 (300.1) — solo el rótulo

| Elemento | Medida |
|---|---|
| Punteado | 60×22 fuera de flujo, **−65 x / −40 y** |
| Rótulo | **`<h2>`** `Información del producto` — 44/55 fw300 #333, `pb 10`, alto 120 (2 líneas), módulo `margin-bottom: 0` |

⚠️ Aquí **sí es un `<h2>`**; en /software el mismo rótulo es un `<p>`. Y no hay
foto de dispositivos ni CTA de vídeo: la columna se acaba en el titular.

### Columna 2/3 (655.9) — ritmo de módulos Divi

| # | Módulo | y | alto | margin |
|---|---|---|---|---|
| 1 | Párrafo de entrada (con enlace inline) | 918.6 | 91.8 | `10px 0 −1px` |
| 2 | `<h2>` azul de 37px | 1029.4 | 84 | `20px 0` |
| 3 | Párrafo | 1133.4 | 91.8 | `10px 0 20px` |
| 4 | `<p>` `Características:` | 1245.2 | 30.6 | `10px 0 27.82px` |
| 5 | 6 blurbs `iconos-xs-2 iconos-md-3` | 1306.3 | 129.2 + 107.6 | `0 0 27.82px` |

Los márgenes verticales **colapsan** entre hermanos, así que los huecos reales
son 19 (el `−1` con el `20`) y 20 el resto. En el clon se pinta con
`space-y-[20px]` en la columna más:

- `mb-[19px]` en el párrafo de entrada (**no** `-mb-[1px]`: el `margin-bottom`
  de `space-y` en Tailwind v4 va con `:where()`, especificidad 0, así que
  cualquier clase de margen propia lo **sustituye** en vez de sumarse);
- `pb-[7.82px]` en `Características:` (**padding**, que sí se suma a los 20).

Diferencias con `InfoProductoSoftware`: aquí el `<h2>` azul **no lleva bajada**
de 17pt, y no hay carrusel, ni segundo bloque azul, ni párrafo de cierre.

## El enlace inline — el único de contenido que se localiza

```
Kunak API es un potente sistema de interconexión con el software
[Kunak AIR Cloud] que te permite extraer información y utilizarla en tu
propio software o sistema de gestión de forma fácil y rápida.
```

El original apunta a `/es/software-de-medicion-calidad-del-aire/` con
`target="_blank"`. En el clon esa página **ya existe**, así que se emite como
**`/software-de-medicion-calidad-del-aire`** y sin `target` (abrir el propio
clon en una pestaña nueva no tiene sentido). Es la regla del proyecto: solo se
localizan los destinos ya clonados.

## Móvil (390)

Columnas apiladas a 312. El rótulo baja a 35/43.75 y los 6 blurbs pasan a
**2 por fila** al 48% — el corte de esta variante es **480px**, no 768 ni 981
(ver `blurbs-iconos.spec.md`).
