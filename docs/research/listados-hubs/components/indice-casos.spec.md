# SPEC · el ÍNDICE DE CASOS (`L5`, `/es/casos-de-exito/`) — plantilla PHP propia

> **2026-08-11.** Redactada **desde lo congelado**: `medidas/lh-spec-{1440,390}.json`
> · `medidas/lh-barra.json` · `medidas/lh-ancla.json` · `medidas/lh-serie.json`.
>
> ⚠ **`L5` NO es un arquetipo nuevo** (`D1`): es **la página índice que le
> faltaba al grupo C**, sobre la colección `casos` ya modelada. Esta spec
> describe su plantilla, no un content type.
>
> **Alcance: 1 instancia — es que sólo hay una.** A diferencia de `L4`, aquí n=1
> no es una limitación del muestreo: es la población.

## 0 · El régimen y el esqueleto

| | medido |
|---|---|
| `et_pb_pagebuilder_layout` · `et-tb-has-body` | **no** · **no** |
| clases del `<body>` | `wp-singular page-template **page-template-case-studies** page-template-case-studies-php` |
| secciones | **6** = `tb_header 1` + `propia 1` + **`tb_footer 4`** |

> ⚠⚠ **`L5` sirve CUATRO secciones de pie, y las otras cuatro formas sirven
> TRES.** Medido a los dos anchos. Es varianza **en el cascarón**, que es
> justamente donde el arquetipo A midió varianza cero — así que **no se puede dar
> el pie por común** al construir. No está diagnosticado: es `SP-K5`.

**Y su plantilla se llama en el marcado**: `page-template-case-studies-php`. No
hay que inferir que es PHP propia — el `<body>` lo dice.

## 1 · La base — y la cabecera es **el doble** que en el resto

| | @1440 | @390 |
|---|---|---|
| `h1.y` **en crudo** | **593.28** | **608.27** |
| **cabecera (`h`)** | **458.09** | **473.08** |
| cabecera en `L2` · `L3` | 225 | 136.58 |
| `h1` | **Manrope 44px / 44px · 300 · `#333`** | ídem, **1 renglón** |
| texto | «Casos de éxito» | ídem |

> ⚠ **+233.09 de cabecera a 1440 y +336.5 a 390** frente a `L2`/`L3`. La
> cabecera de `L5` **no es la misma banda**. Con `D4a` delante, el `h1` («Casos
> de éxito») es un **titular de índice**, o sea **dato de la página**, no
> derivado de ningún término.
>
> **Es la única forma cuya `y` de base es MAYOR a 390 que a 1440** (608.27 contra
> 593.28). En las otras cuatro la base baja al estrechar. **No diagnosticado** —
> `SP-K5`.

## 2 · La retícula — **3 columnas y 57 tarjetas sin paginar**

| | @1440 | @390 |
|---|---|---|
| vía | **`loop-del-tema`** | ídem |
| tarjetas servidas | **57** | **57** |
| columnas | **3** | **1** |
| ancho de tarjeta | **357.28** | **312** |
| `margin-right` / `margin-bottom` | 40 / 40 | 0 / 32 |
| `x` de las 3 primeras | 144 · 541.27 · 938.55 | 39 |
| `docH` | **10 721** | **27 607** |

`3 × 357.28 + 2 × 40 = 1151.84` — la rejilla llena una caja de ~1152, **igual que
`L3`** y distinta de la fila propia de la miga, que mide **1238.39**. O sea que
`L5` tiene **dos contenedores**: 1238.39 para el cascarón y ~1152 para el listado.

**Altura de tarjeta: variable** (418.5 · 391.5 · 449.09 @1440) — la pone el
contenido, como en `L2`.

> **Las 57 en una sola página es fidelidad, no un descuido** (`D5.5`): es el
> comportamiento servido del original, y paginarlas sería la desviación.

## 3 · El paginador — **no hay, y no debe haberlo**

`presente: false`, `piel: ninguna`, **sin `<link rel=next>`**. Coherente con las
57 en una página. `lh-serie` lo confirma desde el otro lado: la serie
`/casos-de-exito` tiene **2 documentos** y los dos sin barra ni paginación real.

## 4 · La barra lateral — **no la tiene**

`lh-barra`, población entera: `L5-casos` **0 de 2** documentos con barra y **0**
con columna `3_4`. La retícula de `L5` es de ancho completo.

Y `qa:hover-zonal` ya lo había dicho por el canal del CSS: la regla de zoom de
`L5` es **de otra familia** —`.case-list-content article .case-imagen:hover`, que
amplía **el propio `<a>`** porque la tarjeta de caso no tiene `<img>`— mientras
`L1` y `L4` comparten `.et_pb_post .entry-featured-image-url:hover img`. **`L5`
no comparte el módulo de Divi**, que es exactamente lo que `D1` afirma.

## 5 · ⛔ Lo que `L5` NO puede entregar en F3-2, y está decidido

**El filtro de 12 botones por sector** (§LH-C6-FILTRO-L5): 57 → 3 tarjetas sin
recargar ni cambiar la URL. **Consume la relación `sector`**, que `D3` dejó fuera
del modelo del caso *«hasta que un listado la consuma»* — y la consume.

> **`sector` se decide en F3-4**, así que **F3-2 construye `L5` SIN su filtro**.
> Es una **desviación deliberada** y se anota como tal en la tanda que construya,
> igual que `D2.4` con los 7 sin paginación real. La entrega hay que leerla
> **«L5 menos el filtro»** (`PLAN-FASE-3.md` §F3-2).

## 6 · Lo que esta spec NO mide

| # | qué | por qué importa |
|---|---|---|
| **SP-K1** | el **clon**: no existe | esta spec es de un lado |
| **SP-K2** | las **54 tarjetas** que no son las 3 primeras | se congelaron 3 de 57; la varianza de altura dentro de la rejilla está SIN MEDIR |
| **SP-K3** | el **filtro** de 12 botones — su marcado, su estado inicial y su efecto en el alto | medido como comportamiento (`P-LH-C6`), **no como geometría** |
| **SP-K4** | **anchos intermedios** y **el ruido** | contrato de RANGO · sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-K5** | por qué el pie trae **4 secciones** y la cabecera **458.09**, y por qué la base **sube** al estrechar | tres medidas sin diagnóstico, y las tres son del **cascarón** — que es donde el resto del sitio tiene varianza cero |
| **SP-K6** | la **relación `post_tag`** que las clases del `<article>` revelan (`tag-cov`, `tag-h2s-es`, `tag-malos-olores`) | `D3` la anotó como dato y **no la añadió al modelo** hasta que un listado la consuma; este listado **no** la consume — el que la consume es el filtro, y ése usa `sector` |
