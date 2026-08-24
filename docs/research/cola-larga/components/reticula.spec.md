# SPEC · La retícula de la COLA LARGA — sección → fila → columna

**Medido el 2026-08-24** (100.ª) con `npm run qa:f33-spec` y `qa:f33-geo`, sobre
el corpus **con sus hojas**, a **1440 y 390**, con `getComputedStyle`.

| nivel | en el DOM | con caja |
|---|---|---|
| secciones | **86** | — |
| filas | **113** | **79** |
| columnas | **179** | **145** |
| módulos | **313** | **277** |

> ⚠ **«En el DOM» y «con caja» son dos medidas distintas y las dos son ciertas.**
> Un elemento dentro de un desplegable cerrado está en la primera y no en la
> segunda. Publicar sólo una invita a construir el número equivocado.

---

## 1 · El ANCHO DE FILA, que es lo que resuelve todos los `%`

De `f33-geo` §`anchoDeFilaPorRegimen`. **Va primero** porque un default de ritmo
expresado en porcentaje **se lee como constante en cuanto se cita**, y el
contenedor no viaja con él:

| régimen | ancho de fila | filas |
|---|---|---|
| `B-` | **1238.39** | 57 |
| `B-` | 1296 | **2** |
| `BT` | **911.75** | 19 |
| `BT` | 784.09 | **1** |

**El ancho mayoritario por régimen es el que da el cascarón** —y es exactamente
lo que el campo `regimen` de CMS-5 transporta (`ESQUEMA` §2j.9)—, pero **no es
una función total del régimen**: hay **2 + 1 filas minoritarias** que no encajan.

> ⚠ **Esas 3 filas se declaran SIN DERIVAR.** No se sabe qué las mueve, y
> escribir «el ancho de fila es función del régimen» las convertiría en ruido.
> Son 3 de 79 filas con caja.

**Y de ahí sale el default de `mb` de cada módulo**, que es la razón por la que
esto no es cosmético:

| ancho de fila | default `mb` (2.75 %) |
|---|---|
| 1238.39 | **34.05** |
| 911.75 | **25.06** |

---

## 2 · `:first-child` / `:last-child` — **la pregunta no es «¿existe?» sino «¿SOBRE QUÉ?»**

Es la regla que la 89.ª pagó: un `:last-child { margin-bottom: 0 }` puesto en el
nivel equivocado **no da error** — quita un margen que nadie echa en falta y deja
faltando otro que ninguna medida de la página mira.

**Se mide el PRIMER y el ÚLTIMO hermano por separado en cada nivel.** Si
difieren, ahí está la regla; si no, no está ahí.

| nivel | contenedores (≥2 hijos) | `mb` difiere | `mt` difiere |
|---|---|---|---|
| **módulo dentro de columna** | 79 | ⚠ **78** | 9 |
| columna dentro de fila | 51 | **0** | 1 |
| fila dentro de sección | 9 | 6 | 4 |

### El veredicto: la regla vive en el MÓDULO, no en la columna

**78 de 79 columnas** tienen su último módulo con un `margin-bottom` distinto
del primero, y el patrón es limpio:

| ruta | módulos | primero `mb` | último `mb` |
|---|---|---|---|
| `/es/centro-de-ayuda/kunak-air-cloud/` | 3 | **25.06** | **0** |
| `/es/centro-de-ayuda/kunak-air/` | 3 | **25.06** | **0** |
| `/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/` | 2 | **25.06** | **0** |
| `/es/centro-de-ayuda/kunak-air/video-tutoriales/` | 2 | **13** | **0** |

> **El último módulo de cada columna lleva `margin-bottom: 0`.** Y el nivel de
> arriba lo confirma por ausencia: **columna dentro de fila difiere en 0 de 51**,
> o sea que ahí **NO** hay ninguna regla de `:last-child`. Los dos lados de la
> comprobación, que es lo que la hace concluyente.

### ⚠ Y el tercer nivel NO está establecido — el numerador es `null`

`fila dentro de sección` marca «difiere» en 6 de 9, pero al mirar los valores el
**primero es `null`**, no un número:

| ruta | filas | primero | último |
|---|---|---|---|
| `/es/soporte/centro-de-ayuda/` | 2 | **null** | 0 |
| `/es/productos/` | 4 | **null** | 0 |

`null` es lo que devuelve `parseFloat` sobre **`auto`** — y las filas de Divi van
centradas con `margin: … auto`. O sea que **no se está comparando dos márgenes:
se está comparando `auto` con `0`**, que no es la misma magnitud.

> **Veredicto: NO ESTABLECIDO en el nivel de fila.** Con `n = 9` contenedores y
> un numerador que no es numérico, la diferencia **no se puede leer como una
> regla de `:last-child`**. Lo que haría falta: resolver el `auto` a su px
> computado antes de comparar. Se declara; **no se cablea**.

---

## 3 · La columna, y por qué su tipo NO es el discriminador del ritmo

`f33-geo` §`separabilidadFilaColumna` derivó que en este arquetipo **ancho de
fila y tipo de columna SÍ se pueden separar** —hay más de un ancho de fila—, y el
resultado confirma la corrección que ya está en `CLAUDE.md`:

> **La variable que manda es el ANCHO DE LA FILA, no el tipo de columna.**

Es la §*dos variables confundidas* que costó una regla escrita al revés: en
`articulos-kb` **todas las filas miden 911.75**, así que allí los dos ejes son
indistinguibles y la spec nombró el equivocado. Aquí, con **dos anchos de fila
poblados**, se separan.

---

## 4 · Qué NO contesta esta spec

| | |
|---|---|
| **el CLON** | un solo lado. `qa:f33-cmp` sigue a **0 ejes comparados en las 31** |
| **el estado ABIERTO de los desplegables** | **10 de 10 `toggle` traen `et_pb_toggle_close`**: en este corpus no hay ninguno abierto. **34 de las 113 filas y 34 de las 179 columnas no tienen caja** por eso, y su geometría exige **INTERACCIÓN** (eje `comportamiento`, 0/31) |
| **las 3 filas de ancho minoritario** | `1296` ×2 y `784.09` ×1: **SIN DERIVAR** |
| **el nivel fila-en-sección para `:last-child`** | **NO ESTABLECIDO**: el numerador es `auto` |
| **los anchos intermedios** | se miden 1440 y 390, que es donde el contrato es de **FIDELIDAD**. Entre medias el contrato es de **rango** y no se exige Δ0 |
