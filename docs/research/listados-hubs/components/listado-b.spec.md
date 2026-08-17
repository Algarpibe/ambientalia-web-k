# SPEC · `LISTADO-B` — el archivo plantillado (`L1`, 23 páginas + 107 de paginación)

> **2026-08-11.** Medido con `npm run qa:lh-spec` contra **kunakair.com vivo**, a
> **1440 y 390**, sobre **7 páginas de `L1`** (3 canónicas + 4 segundas
> instancias). Congelado: `medidas/lh-spec-1440.json` · `medidas/lh-spec-390.json`
> · `medidas/lh-barra.json`.
>
> **Régimen: PLANTILLADO** (`et-tb-has-body`, cuerpo en 2 secciones `_tb_body`).
> No existe un editor por instancia ⇒ el discriminador es la **varianza ENTRE
> INSTANCIAS**, y un px absoluto significa **plantilla**, no campo. Aplicar aquí
> el test A del builder daría la respuesta invertida.

## ✅ ANTES DE NADA: el bloqueo de esta spec ESTÁ LEVANTADO (2026-08-11; anotado aquí el 2026-08-13)

> ⚠ **Esta cabecera decía «esta spec NO se puede implementar todavía» y llevaba
> dos días siendo falsa.** El escalón que citaba —§ESCALÓN F3-2 (2.º)— se cerró
> **el mismo día que se abrió**, y el cierre no bajó hasta aquí. Es §MENCIONADO
> NO ES DOCUMENTADO por el otro lado: no una decisión que no se escribió, sino
> **un bloqueo que nadie retiró** — y un lector de esta spec pararía sin motivo.

**Lo que se decidió:** `D1` no es falsa, queda **ACOTADA**. `L1` sigue siendo
**uno con tres variantes**; lo que se ensancha es **de qué** son las variantes:
tarjeta **y** retícula de cuerpo **y** barra. Varianza 0 dentro de cada variante,
distinta entre ellas — la misma lectura que la tarjeta, las tres pieles de
paginación y la regla de zoom.

**Y el límite que la medida impone, que sigue vivo:** barra y retícula son
**COLINEALES en 149/149** —ningún documento tiene una sin la otra—, así que
*«la barra es propiedad de la CAPA»* y *«…de la VARIANTE»* son **INDISTINGUIBLES**
con esta población. Al construir se elige el eje con **mecanismo servido** (la
plantilla de cuerpo del theme builder decide las dos a la vez) y **se dice que la
razón es ésa, no una medida**.

Lo que sigue está medido y es correcto. La tabla de abajo es **la que hay que
implementar**, con sus dos contenedores.

| | `L1-blog` · `L1-etiqueta` | `L1-resources` (padre e hijo) |
|---|---|---|
| fila del listado | **`3_4 + 1_4`** | **`4_4`** |
| columna de contenido @1440 | **911.75** | **1238.39** |
| barra lateral | **258.5**, con **4 widgets** | **no hay** |
| filas de la 2.ª sección `_tb_body` | **2** | **3** |
| documentos (población entera) | **80 de 80** | **0 de 37** |

⚠ **Y ojo al par 911.75 / 1238.39: son literalmente los dos contenedores del
`⚠⚠` de `CLAUDE.md` §Test A.** Los defaults de ritmo de Divi son **porcentajes
del contenedor**, así que `sección pt/pb 4 %`, `fila pt/pb 2 %` y `módulo mb
2.75 %` **valen distinto en las dos variantes**. Construir `L1` con un solo
contenedor mete ese error en 80 páginas — que es exactamente el fallo que ese
aviso describe, cobrado por segunda vez.

## 1 · El cascarón y la base

**Medido EN CRUDO** (`y` absoluta del `h1`, sin restar nada), que es la
obligación de §Notas de método para todo arquetipo nuevo:

| | @1440 | @390 |
|---|---|---|
| `h1.y` — blog · etiqueta · resources-padre | **332.59** en las tres | **236.58** en las tres |
| `h1.y` — resources-**hijo** | **332.59** | **262.58** ⚠ **+26** |
| cabecera + `_tb_header` | 1 sección | 1 sección |
| pie `_tb_footer` | 3 secciones | 3 secciones |
| capas del `<body>` | `tb_header 1 · tb_body 2 · tb_footer 3` — **varianza 0 en las 7 páginas** | ídem |

> ⚠ **Los +26 de `resources-hijo` a 390 son un hallazgo, no un fleco.** A 1440
> las cuatro familias comparten base exacta y **a 390 una se separa**. Es la
> **regla espejo** de `CLAUDE.md`: un Δ que aparece en un solo ancho es un
> contenedor que en el otro lo tapaba. **No está diagnosticado** — se ficha, y
> el sitio donde mirarlo es la miga (los hijos cuelgan un nivel más).

`h1`: `Manrope 800`, **50 px / 60** a 1440 y **35 px / 42** a 390,
`letter-spacing −0.5px`, `#333`, alineado a la izquierda. **Varianza 0 en las 7.**

## 2 · La retícula del listado

| | @1440 blog·etiqueta | @1440 resources | @390 (las tres) |
|---|---|---|---|
| columnas | **3** | **3** | **1 — apiladas** |
| ancho de tarjeta | **277.2** | **386.08** | **335.39** |
| hueco horizontal | **40** | **40** (39.99) | — |
| hueco vertical | **40** | **39.99** | **32** |
| contenedor del listado | 951.75 | 1278.39 | 335.39 |
| ritmo de la tarjeta | `margin-right 40 · margin-bottom 40` | ídem | `margin-right 0 · margin-bottom 32` |

`3 × 277.2 + 2 × 40 = 911.6` contra la columna de **911.75**, y
`3 × 386.08 + 2 × 40 = 1238.24` contra la fila de **1238.39**: la rejilla llena
su contenedor en las dos variantes. **El hueco de 40 es el mismo**; lo que cambia
es el contenedor.

## 3 · La tarjeta, variante a variante

Todas las cifras son de la **primera tarjeta**; la sonda congela las tres
primeras. Tipografía: `Manrope, sans-serif` en todo.

| | `L1-etiqueta` | `L1-resources` | `L1-blog` |
|---|---|---|---|
| **media** | `.entry-featured-image-url img` · **277.2 × 187.11** @1440 | ídem · **440 × 293.17** ⚠ | **la 1.ª no tiene** (ya visto en §7b) |
| **título** | `h2` · **20 px / 27** · `−0.5px` · `#333` | `h2` · **20 px / 27** | `h2` · **23 px / 28.75** ⚠ |
| `padding-bottom` del título | **10** | **0** | **10** |
| **fecha** | `.published` · **13.5 px / 20.925** · `#333` · «May 25, 2026» | **no** | **no** |
| **categoría** | **13.5 px / 20.925** · **`#666`** · → `/es/categoria/articulos/` | **no** | **13.5 / 20.925** · `#666` · → `/es/categoria/noticias/` |
| **extracto** | **15 px / 23.25** · `#333` · **267 c** | **no** | ⚠ **sí, 300 c** |
| alto de tarjeta @1440 | 548.03 | 430.02 | 653.53 |

> ⚠⚠ **CORREGIDO 2026-08-14 (68.ª tanda): los tres «no» de la columna
> `L1-resources` son TRES SELECTORES QUE NO CASAN, no tres ausencias.** Leído el
> HTML servido de las 18 páginas con contenido, su tarjeta **sí** trae fecha y
> **sí** trae término — en otros elementos:
>
> | celda | lo que la spec buscó | lo que el original sirve |
> |---|---|---|
> | **fecha** | `.published` | **`<p class="post-meta">Jul 21, 2026</p>`**, sin `<span>` |
> | **categoría** | el enlace de `.post-meta` | **`<p class="resources-categories">`** con el término de `resources`, en 160 de 163 tarjetas |
> | **extracto** | `.post-content` | ése sí es una ausencia real: **0 de 163** |
>
> Es §sondas 4 en la spec en vez de en una sonda: *un selector que no casa
> devuelve lo mismo que una propiedad ausente*. Los «no» eran ciertos **del
> selector** y falsos de la tarjeta — y construir desde ellos habría emitido una
> tarjeta sin fecha y sin término en 18 páginas.
>
> **Y el `alt` de la media sale del ADJUNTO, como en blog** (no del titular como
> en etiqueta): medido en las 4 formas.

⚠ **Dos celdas contradicen a `PAGE_TOPOLOGY.md` §7b, y no se resuelven aquí.**
Aquella tabla da `L1-blog` **sin extracto** y con el mismo titular que las
demás; lo medido ahora da **extracto de 300 c** y **titular de 23 px**. Las dos
medidas son buenas en su instrumento —§7b leyó el HTML servido, esto lee el DOM
renderizado con las hojas externas— así que **la discrepancia es el dato**: o la
primera tarjeta de `/es/blog/` es una tarjeta destacada con piel propia, o §7b
midió otra cosa. **Se ficha, no se elige** — y hasta resolverlo, la piel de la
tarjeta de blog está **SIN PROBAR**.

⚠ **Y la media de `resources` mide 440 dentro de una tarjeta de 386.08**: la
imagen **desborda** su caja y la recorta el envoltorio. Es coherente con el zoom
de `scale(1.1)` medido en `BEHAVIORS.md` —hace falta margen para ampliar sin
hueco— pero **el recorte hay que construirlo**, no sale solo.

## 4 · El paginador — tres pieles, una por variante

Confirmado por una vía independiente de la de `BEHAVIORS.md` §1b (que las censó
sobre el corpus): aquí salen del **DOM renderizado**.

| variante | piel | selector | alto @1440 |
|---|---|---|---|
| `L1-blog` | **A** | `div.wp-pagenavi[role="pagination"]` | **42** |
| `L1-etiqueta` · **`L2`** | **B** | `div.wp-pagenavi[role="navigation"]` | **40** |
| `L1-resources` | **C** | `nav.kunak-pagination` | **42** |
| `L3` | **ninguna** | — · el único `/page/2/` está en el `<link rel=next>` del `<head>` | — |

El paginador ocupa **el ancho completo de la columna de contenido** (911.75 /
1238.39 @1440; 335.39 @390) y va **sin margen propio** en las tres pieles.

> **Y navega por enlace real, no por AJAX** — `defaultPrevented: false` en las 5
> formas con control (`BEHAVIORS.md` §1b). Es lo que `D2.3` necesitaba.

⚠ **La instancia con una sola página de contenido NO sirve paginador** (`piel:
ninguna` en `h2s-es` y en los `resources` de 1 tarjeta). O sea que el paginador
es **condicional al nº de páginas**, no un elemento fijo de la plantilla.

> ⚠⚠ **Y ESTA SECCIÓN SE MIDIÓ SOBRE UN CANAL TRUNCADO — leer antes de citarla
> (2026-08-17, 75.ª tanda).** `lh-barrido.mjs` congela las piezas del paginador
> con `as.slice(0, 12)`, y **2 de las 43 instancias emiten 14**
> (`/etiqueta/monitorizacion-ambiental/page/{4,5}`, `total 11`). Toda tabla de
> **SECUENCIA** derivada del espejo pierde ahí las piezas 13 y 14 —que son
> justamente `»` y `Last »`— y las da por inexistentes.
>
> Los dos canales que sí traen la secuencia entera: **`paginador.hrefs` del
> propio espejo** (no truncado) y el **HTML del corpus**. La derivación de la
> ventana vive en `qa:lh-huecos`, que lee el corpus.
>
> Esta tabla de §4 —pieles y selectores— **no la afecta**: se lee del contenedor,
> no de las piezas. Lo que la afecta es cualquier lectura de `piezas` más allá de
> la 12.ª.

## 5 · La barra lateral — 4 widgets, **una sola firma en 80 documentos**

Derivado sobre la población entera de la captura (`qa:lh-barra`, negativo 5/5):

| | |
|---|---|
| documentos con barra | **80** de 149 |
| **firmas distintas** | **1** — composición idéntica en los 80 |
| widgets | `search-6` · `text-1` · `text-7` · `custom_html-25` |
| títulos visibles | **«Buscar»** · **«Categorías»** · **«¡Suscríbete a nuestra newsletter!»** (el `text-1` va sin título y con cuerpo vacío) |
| ancho @1440 | **258.5** (`et_pb_column_1_4`) |

**Varianza 0 en 80 instancias en régimen plantillado ⇒ PLANTILLA**, no campo.
Pero *plantilla* no quiere decir *gratis*:

- ⚠ **CORREGIDO 2026-08-11: «Categorías» NO consume la taxonomía.** Esta spec
  decía que sí, y con ello daba por cumplida la condición de reapertura de `D3`.
  **Medido** (`qa:lh-barra` ampliada): es `et_pb_widget widget_text` en **80/80**
  —no el nativo `widget_categories`—, con **un solo contenido** en los 80, y
  **no cubre 5 de los 7** términos que el sitio ejerce (`articulos` 240 ·
  `articulos-cientificos-y-estudios` 42 · `evaluaciones-independientes` 16 ·
  `podcast-es` 4 · `articulos-tecnicos` 1). Una lista desincronizada no se
  regenera ⇒ **es contenido cableado de la plantilla, y `D3` queda CONFIRMADA**.
  Emite 2 `href` absolutos a `/es/categoria/{eventos,noticias}/` → `P-LH-C4`.
- **«Buscar» es una interacción** y `BEHAVIORS.md` no la midió: su alcance eran
  hover, paginación, lazy y orden. **Está SIN MEDIR**, no «sin efecto».
- **La newsletter es una integración externa**, no contenido.
- **`text-1` va sin título y con `<div class="textwidget"></div>` vacío** — es un
  widget servido y sin contenido, no un hueco de medición.

> ⚠ **Y por qué esta sección decía «10 widgets» hasta hoy:** `lh-barra` tomaba la
> firma sobre una **ventana fija de 14 000 caracteres** desde el inicio de la
> barra, y la barra mide **1481** — los otros 6 ids (`text-10 · text-13 ·
> text-16 · text-22 · text-19 · custom_html-29`, todos con clase `fwidget`) eran
> **del PIE**. §sondas 4 en su tercera cara. Corregido con delimitación por
> balance de `<div>` y guarda (`fwidget`: 0 dentro / 480 fuera).

## 6 · Lo que esta spec NO mide, dicho para que nadie lo dé por medido

| # | qué | por qué importa |
|---|---|---|
| ~~**SP-B1**~~ | ✅ **PARCIAL desde 2026-08-14** — el clon existe en **7 de las 13 formas** del comparador (`L1` entera: blog · 2 etiqueta · 4 resources) y `qa:lh-cmp --vivo` las compara par a par. Las **6** restantes (`L2` ·`L3` · `L4` · `L5`) siguen en 404 |
| **SP-B2** | **anchos intermedios** | el contrato ahí es de RANGO, no de fidelidad (§CONTRATO) |
| **SP-B3** | la varianza de `L1-blog` — **n = 1** | todo lo suyo está **SIN PROBAR**, incluida la piel de tarjeta del §3 |
| **SP-B4** | el **buscador** de la barra lateral | interacción no medida por `P-LH-C6` |
| **SP-B5** | **el ruido** de estas rutas | sin campaña, un residuo pequeño es SIN PROBAR |
| ~~**SP-B6**~~ | ✅ **CERRADA 2026-08-14** — el `+26` es **la MIGA que envuelve un renglón más**: sección 0 mide **76** en las hijas y **50** en los padres a 390 (4 eslabones contra 3, `line-height: 26px`). El clon lo reproduce **solo** —`base misma (Δ 0)` en las 4 formas y a los dos anchos—, así que no se cableó nada. Ficha: `PENDIENTES-QA.md` §SP-B6 |
| ~~**SP-B7**~~ | ✅ **CERRADA 2026-08-11** — el contenido del widget «Categorías» está medido en los 80 (§5). Los otros tres (`search-6` · `text-1` vacío · `custom_html-25`) siguen sin censar por dentro, pero **su denominador ya no es «6 text y 2 custom_html»**: eran 6 del pie |
