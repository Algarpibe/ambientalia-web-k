# SPEC · el HUB DE BUILDER y su listado embebido (`L4`, 6 páginas)

> **2026-08-11.** Redactada **desde lo congelado**: `medidas/lh-spec-{1440,390}.json`
> · `medidas/lh-contenedores.json` · `medidas/lh-ancla.json`.
>
> ⚠ **`L4` NO es un arquetipo de listado, y esta spec no lo convierte en uno.**
> `D1`: *«los 6 hubs de builder no estrenan arquetipo: son páginas compuestas por
> instancia»*. Lo que se especifica aquí es **el bloque de listado embebido** y
> el cascarón que lo rodea — no una plantilla de hub.
>
> **Alcance: 1 instancia medida de 6** (`/es/recursos/`). Con n = 1, **todo lo
> de esta spec está SIN PROBAR como propiedad de la forma**; vale como
> descripción de esa página.

## 0 · El régimen — **es el único BUILDER de las cinco formas**

| | medido |
|---|---|
| `et_pb_pagebuilder_layout` | **SÍ** |
| `et-tb-has-body` | no |
| clases del `<body>` | `wp-singular page-template-default page page-id-33166` |
| secciones | **8** = `tb_header 1` + **`propia 4`** + `tb_footer 3` |

> **Y eso cambia qué test aplica.** `L1`·`L2`·`L3`·`L5` son **plantillados** —el
> discriminador es la varianza entre instancias—; `L4` es **builder**, así que
> aquí sí valen los tests **A y B** de `CLAUDE.md`, con sus alcances. Aplicar el
> criterio plantillado a `L4` daría la respuesta invertida.

## 1 · La base

| | @1440 | @390 |
|---|---|---|
| `h1.y` **en crudo** | **361.39** | **295.58** |
| cabecera (`h`) | 225 | **165.58** |
| `h1` | **Manrope 44.1px / 55.125px · 300 · `#333`** | **35px / 43.75px · 300** |
| renglones | **3** | **3** |
| texto | «Centro de recursos sobre la calidad del aire» | ídem |

> ⚠ **Tercera piel de titular del sitio, y las tres están medidas:** `L1`
> **50/60 · 800**, `L3`·`L5` **44/44 · 300**, `L4` **44.1/55.125 · 300**. El
> `44.1` y el `55.125` **no son redondos**: huelen a `em`/`%` resueltos, no a px
> escritos. **No diagnosticado** — es `SP-H6`.
>
> Y la cabecera de `L4` mide **165.58 a 390** contra los **136.58** de `L2`/`L3`:
> **+29**. También sin diagnosticar.

## 2 · El cuerpo — cuatro secciones propias, cinco filas

| # | fila (@1440) | `pt` / `pb` | reparto | columnas (ancho · módulos) |
|---|---|---|---|---|
| 1 | 1238.39 × 50 | 12 / 12 | `4_4` | 1238.39 · **1** (la miga) |
| 2 | 1238.39 × 447.39 | **28.7969** / **28.7969** | `1_3 + 2_3` | 367.38 · 2 · · 802.88 · 2 |
| 3 | 1238.39 × 531.03 | 0 / 0 | `1_4 ×4` | 281.72 · 1 (×4) |
| 4 | 1238.39 × 569.75 | **28.7969** / **14.3906** | `4_4` | 1238.39 · **3** |
| 5 | 1238.39 × 171 | 0 / **72** | `1_3 + 2_3` | 367.38 · **0** · · 802.88 · 1 |

> **El `28.7969` es el default de fila del §Test A** (2 % del contenedor de
> 1440), y aparece **tal cual** — lo que confirma que en `L4` la fila resuelve
> contra **1440**, no contra su propia fila de 1238.39. Y el `14.3906` es
> **exactamente la mitad**: un `1 %`. Los `0` y el `72` de la fila 5 son
> **valores escritos por quien editó la página** (test B: varían de una fila a
> otra dentro de la misma página).
>
> ⚠ **La fila 5 tiene una columna `1_3` con CERO módulos** —y a 390 su ancho cae
> a **0**—. Es una columna vacía servida, no un hueco de medición.

**A 390 las cinco filas miden 335.39** y los repartos se apilan; la fila 2 pasa
de 447.39 a **1047.53** de alto y la 3 de 531.03 a **2126.94**.

## 3 · El listado embebido — **es la tarjeta de `L1-resources`**

| | @1440 | @390 |
|---|---|---|
| vía | **`modulo-divi`** | ídem |
| tarjetas | **3** | 3 |
| ancho de tarjeta | **386.08** | **335.39** |
| `margin-right` / `margin-bottom` | 40 / 40 | 0 / 32 |
| `y` de la primera | 1536.45 | 3623.80 |

> **386.08 es exactamente el ancho de tarjeta de `L1-resources`**
> (`listado-b.spec.md` §2), y `D5.4` ya lo había dicho por otra vía: *«el listado
> embebido es un bloque de consulta, y el clon ya tiene ese componente
> (`UltimosArticulos`; hasta el `h3` coincide)»*. Aquí queda con su número.
>
> **Consecuencia de construcción:** el bloque de listado de `L4` **no estrena
> componente** — reusa el de la variante `resources`, con `entradasPorPagina`
> fijado a 3 y **sin paginador**.

## 4 · El paginador — **no hay**, y no es una desviación

`paginador.presente = false`, `piel: ninguna`, **sin `<link rel=next>`**. `L4` no
pagina: sirve 3 tarjetas y para. Es lo esperado en un bloque de consulta dentro
de una página compuesta, no el caso de `L3` (que sí pagina por URL sin control).

## 5 · Lo que esta spec NO mide

| # | qué | por qué importa |
|---|---|---|
| **SP-H1** | **5 de las 6 instancias** de `L4` | con n = 1 no hay varianza que medir: **todo lo de arriba es de `/es/recursos/`**, no de «la forma» |
| **SP-H2** | el **clon**: no existe | esta spec es de un lado |
| **SP-H3** | el **contenido** de los 11 módulos de las 5 filas | esta spec mide la retícula y el ritmo, no lo que va dentro |
| **SP-H4** | **anchos intermedios** | contrato de RANGO |
| **SP-H5** | **el ruido** de esta ruta | sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-H6** | por qué el `h1` mide **44.1 / 55.125** y la cabecera **+29 a 390** | medido, **no diagnosticado** |
| **SP-H7** | si `MonoSeccion[]` expresa este cuerpo | es la **hipótesis pre-registrada del grupo D**, y su experimento sigue pendiente (`D1`) |
