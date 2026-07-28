# BeneficiosAplicaciones — dos listas con viñeta azul

> Medido 2026-07-28 a **1440×900** y **390×844** reales.
> Componente: `src/components/sectores/BeneficiosAplicaciones.tsx`.
> Bloque del *flexible content*: `{ kind: "beneficiosAplicaciones", … }`.

⚠️ **No confundir con `software/ListaBeneficios`**, que es otra cosa (blurbs
con icono, 24px/28.8). Aquí son dos `<ul>` de texto con viñeta.

## Sección y fila

| | 1440 | 390 |
|---|---|---|
| Sección `padding` | `57.5938 0 14` (**4%** arriba) | `50 0 14` |
| Sección `margin-top` | **−14** | **−14** |
| Fila `padding` | `28.7969 0` (2%) | `30 0` |
| Columnas | 1/2 + 1/2 = 585.13, gutter 5.5% | apiladas 335.39, la 1ª con `margin-bottom: 30` |

El `margin-top: -14` de la sección es real (Divi custom): el bloque se **solapa
14px** con lo que venga encima. Anotado porque descuadra las cuentas si se
ignora.

## Estructura de cada columna

```
punteado (60×22, x −65 de la retícula, margin-bottom 34.0469 D / 30 M)
h3       (margin-bottom del módulo: 34.0469 D / 30 M)
ul
```

En desktop los **dos punteados están a la misma altura** (y1936.36): el de la
izquierda en x 35.8 y el de la derecha en x **689.03** (= 754.03 − 65). En
móvil los dos caen a x −37.7, cada uno sobre su columna apilada.

## Titular

| | 1440 | 390 |
|---|---|---|
| `<h3>` | `44px / 55px` **w300** `#333` `ls -0.5px` `padding-bottom: 10px` | **`35px / 43.75px`** |
| Ancho de caja | 468.09 (**80% de la columna**) | 268.31 (80%) |

Es un `<h3>` **con tamaño de h2 de sección** (44/55, la misma escala que
"Nuestras soluciones"). Y **sí baja a 35 en móvil**, al contrario que los 37px
del hero. Ancho al 80% de la columna: por eso "Beneficios de monitorizar la
calidad del aire:" envuelve a 3 líneas y no a 2.

El módulo del h3 trae además estilos propios que el h3 pisa (el `.et_pb_text`
computa `15px/30.6 w800 #0075C9` — irrelevante para el render, no se replica).

## Lista

```
ul  { padding: 0 0 18px 36px; list-style: none; }
li  { font: 18px/30.6px w400 #333; }
li::before {
  content: "•"; color: #0075C9; font-size: 22.4px;
  display: inline-block; width: 20.1562px; margin-left: -20.16px;
}
```

La viñeta **cuelga** dentro del `padding-left: 36` gracias al margen negativo.
Alturas de `li` medidas (Urbano, columna izquierda): 1440
`62.19 · 31.59 ×5 · 62.19` — o sea ~31.59 por línea. En 390:
`92.78 · 62.19 ×6`.

Los `<li>` del original traen `style="font-weight:400"` y un `<span
style="font-weight:400">` dentro (ruido del editor de WordPress): **no se
replica**, no cambia el render.

## Contenido (Urbano, verbatim)

- Izquierda: **Beneficios de monitorizar la calidad del aire:** (7 ítems)
- Derecha: **Aplicaciones en las ciudades:** (7 ítems)

Ver `SECTOR_URBANO.body[1]` en `src/lib/sectores.ts`. En Industria son 9 y 9 y
los títulos cambian ("Beneficios del control de las emisiones industriales:" /
"Aplicaciones en las industrias:"): título y número de ítems son **contenido**.

## Estados

Ninguno: bloque estático, sin enlaces ni hover.

## Assets

- `/images/uploads/2022/12/punteado.svg` (ya en el repo)
