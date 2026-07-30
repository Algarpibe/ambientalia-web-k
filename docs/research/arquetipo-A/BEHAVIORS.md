# ARQUETIPO A · comportamientos

> Medido el 2026-07-30 con `npm run qa:a-behaviors -- 1440`, sobre la entrada más
> larga del corpus (`contaminacion-por-metano`, 69 784 chars). Salida congelada
> en `scripts/qa/medidas/a-behaviors-1440.json`.

## 1 · El índice del artículo — dos módulos, no uno responsive

El «Índice del artículo» aparece **dos veces en el DOM** y cada copia se muestra
a un ancho:

| módulo | @1440 | @390 | enlaces | de ellos anclas |
|---|---|---|---|---|
| `sidebar#0` | **0 × 0** (oculto) | 335 × 703, `mt 16` `pt 48` | 16 | **16** |
| `sidebar#2` | **259 × 1435** | 0 × 0 (oculto) | 21 | **16** |

**No es un módulo con CSS responsive: son dos módulos** con visibilidad por
ancho, cada uno en su columna. El de desktop vive en la lateral; el de móvil, en
el flujo principal justo antes del `post_content`.

`position: relative` en los dos: **el índice NO es sticky**. Se queda donde está
al hacer scroll.

## 2 · El índice se genera de los `h2`, y solo de los `h2`

| | |
|---|---|
| encabezados en el blob | **61** (`h2`+`h3`+`h4`) |
| encabezados **con `id`** | **16** |
| anclas del índice | **16** |

Los 16 `id` son de `h2` y coinciden uno a uno con las anclas
(`#que-es-el-metano-y-por-que-es-tan-importante`). Los `h3` y `h4` **no llevan
`id`** y no aparecen en el índice.

**Consecuencia para el modelo:** el índice **no es contenido**, es una
proyección calculada del blob. En el CMS no es un campo — es una función de
`post_content`. Y el `id` de cada `h2` es un **slug del texto**, así que
renombrar un encabezado rompe el enlace de anclaje: eso es comportamiento del
generador, no dato.

Clasificación: **interacción de click**, con salto nativo al fragmento.

## 3 · Los `iframe` cargan en caliente

4 en la página medida, **ninguno con atributo `loading`**:

| origen | tamaño @1440 |
|---|---|
| `www.youtube.com` | 912 × 513 |
| `ourworldindata.org` | 912 × 600 (×3) |

Dos orígenes de terceros y uno de ellos —Our World in Data— es un **gráfico
interactivo**, no un vídeo. El campo de texto rico tiene que admitir embebidos
arbitrarios, no solo YouTube.

## 4 · Imágenes

9 en el blob de la página medida. Del **HTML crudo** (no del DOM medido):
**8 de 9 con `srcset`**, 8 con `width`/`height` y 8 con clase `wp-image-<id>`.

> ⚠ **El atributo `loading` no se mide con el navegador en este repo.**
> `settle()` de `lib.mjs` pone `img.loading = "eager"` en todas antes de medir,
> así que cualquier conteo de perezosas sale **0 por construcción** — un dato
> falso, no un hallazgo. Se lee del HTML servido. La primera versión de esta
> sonda lo reportaba mal y se corrigió antes de escribir esto.

## 5 · El bloque de relacionados

`et_pb_blog_0_tb_body` con **3 artículos**. Presente en 83 de las 149 entradas y
ausente en 66 (`PAGE_TOPOLOGY.md` §2).

**Sin verificar si sortea**, y conviene decirlo: el original **sí sortea** los 3
posts del módulo «Artículos y Guías» de la cola comercial (P4 en
`../../PENDIENTES-QA.md`, con dispersión de hasta 81 px entre cargas). Si este
bloque hace lo mismo, **cualquier medida de altura de una entrada de blog por
debajo de él hereda ese ruido**. Queda como **A-SP7**: no medido.

## 6 · Resumen por tipo de interacción

| interacción | tipo | dónde |
|---|---|---|
| índice → encabezado | **click**, salto a fragmento | `sidebar#0` / `sidebar#2` |
| vídeo de YouTube | **click**, iframe de terceros | dentro del blob |
| gráfico de Our World in Data | **click/hover**, iframe interactivo | dentro del blob |
| bloque de relacionados | **ninguna**: 3 tarjetas estáticas | `section#2`, solo en 83/149 |
| índice sticky | **no existe** — `position: relative` | — |
