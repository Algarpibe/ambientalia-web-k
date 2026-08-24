# SPEC · Los 11 tipos de módulo de la COLA LARGA

**Medido el 2026-08-24** (100.ª) con `npm run qa:f33-spec` sobre el corpus de
`corpus/fase-3` **con sus hojas**, a **1440 y 390**, con `getComputedStyle`.
Congelada: `medidas/f33-spec.json`. Denominador: **313 módulos · 11 tipos · 31
páginas**.

> ⚠ **Alcance:** esto es el **MARCADO**. El ritmo (`mt·mb·pt·pb`) y el
> `anchoPct` los derivó `qa:f33-geo` y aquí se **citan** — no se recalculan. Y
> es **UN SOLO LADO**: nada de lo de abajo dice qué hace el clon.

## Cómo se lee la columna «invariantes»

**Invariante = presente en el 100 % de las instancias del tipo.** Es lo único
que puede escribirse como plantilla del módulo; lo demás es dato del editor.

> ⚠⚠ **Y sólo vale lo que vale su `n`.** Con `n = 1` (`map`, `slider`) toda
> clase observada sale «invariante» **por construcción**, así que ahí la columna
> **no mide invariancia: mide una observación**. Se lee con el `n` delante,
> siempre.

---

## `text` — 151 instancias · 146 con caja · **29 páginas**

```
<div class="et_pb_module et_pb_text et_pb_text_N et_pb_bg_layout_light …">
```

| | |
|---|---|
| etiqueta | `div` (151/151) |
| **invariantes** | `et_pb_module` · `et_pb_text` · `et_pb_text_N` · `et_pb_bg_layout_light` |
| variables | `et_pb_text_align_left` **143/151** · `breadcrumbs` **10/151** · `et_pb_text_align_center` **8/151** · `et_clickable` 6 · … (6 en total) |
| `display` | `block` (146/146 con caja) |
| `font-size` COMPUTADO | **8 valores**: 12 ×10 · 15 ×26 · 16 ×15 · **18 ×60** · 25 ×21 · 26 ×4 · 40 ×6 · 50 ×4 |
| formas distintas | **30** |

**El tipo mayoritario y el más heterogéneo**: 30 formas de subárbol y 8 cuerpos
distintos. `et_pb_text_align_*` es **campo** por el test B (dos valores en la
misma página); `breadcrumbs` marca las 10 migas.

> ⚠ **El `font-size` va aquí con su cardinal porque es LA BASE de todo `em`.**
> Un `0.5em` de este módulo vale 9 px si el cuerpo es 18 y 6 si es 12 — *un `em`
> citado sin su `font-size` es la misma trampa que un `%` citado sin su
> contenedor*, y ya costó 22 px predichos contra 16.5 reales.

**Geometría** (`f33-geo`): `mt` **CAMPO** (0 · 10 · −19) · `mb` **CAMPO**, 14
valores · `pb` **CAMPO** · **`pt` SIN ESCRIBIR** (sólo `0`).

---

## `image` — 71 · 71 con caja · **19 páginas**

| | |
|---|---|
| etiqueta | `div` (71/71) |
| **invariantes** | `et_pb_image` · `et_pb_image_N` · `et_pb_module` |
| variables | **ninguna** |
| `display` | `block` (71/71) |
| formas distintas | **31** |

**Cero clases variables y 31 formas**: toda la variación de este tipo está
**dentro** (el `<img>`, su `srcset`, la leyenda), no en las clases del módulo.

**Geometría**: `mt` **CAMPO** (0 · 30 · 112 · −33) · `mb` **CAMPO**
(0 · 25.06 · 34.05 · 23.2) · `pb` CAMPO · **`pt` SIN ESCRIBIR**.

---

## `video` — 30 · **0 con caja** · 5 páginas ⛔

| | |
|---|---|
| etiqueta | `div` (30/30) |
| **invariantes** | `et_pb_module` · `et_pb_video` · `et_pb_video_N` |
| variables | ninguna |
| formas distintas | **1** |

> ⛔⛔ **NINGUNA de las 30 instancias tiene caja.** Las 30 viven dentro de
> desplegables CERRADOS, así que su marcado **sí** se puede censar y su
> **geometría NO ES MEDIBLE**: `getComputedStyle` devolvería ceros que entrarían
> en la distribución como si fueran dato.
>
> **Lo que haría falta: INTERACCIÓN** —abrir el desplegable—, o sea el eje
> `comportamiento`, hoy **0 de 31 rutas**. Se declara; no se rellena.

---

## `blurb` — 22 · 22 con caja · **3 páginas**

| | |
|---|---|
| etiqueta | `div` (22/22) |
| **invariantes** | `et_pb_module` · `et_pb_blurb` · `et_pb_blurb_N` · `et_pb_blurb_position_top` · `et_pb_bg_layout_light` |
| variables | `et_pb_text_align_left` 17/22 · **`iconos-xs-2` 13/22** · **`iconos-md-4` 8/22** · **`iconos-md-3` 5/22** · `et_pb_section_video_on_hover` 5/22 · … (9) |
| `display` | ⚠ **`block` ×9 y `inline-block` ×13** |
| `font-size` | 16 ×13 · 18 ×4 · 14.5 ×5 |

**`iconos-md-3` / `iconos-md-4` / `iconos-xs-2` son CAMPO** por el test B: tres
valores del mismo hueco conviviendo, y son las **columnas de la rejilla de
iconos** que el editor eligió.

> ⚠⚠ **Y su `display` está PARTIDO, que es lo que acota qué significa su
> `anchoPct`.** En las 13 instancias `inline-block` **la caja es la del
> contenido**, así que `w / wCol` **no recupera ninguna declaración del editor**:
> mide el texto. Sólo en las 9 `block` la razón es el ancho declarado. Es §*la
> inversa del nivel al que se mide*, y por eso `anchoPct` de este tipo **no se
> lee entero**.

---

## `button` — 13 · 12 con caja · 6 páginas

```
<a class="et_pb_button et_pb_button_N et_pb_bg_layout_light …">
```

| | |
|---|---|
| etiqueta | ⚠⚠ **`a` (13/13)** — el ÚNICO tipo que no es `div` |
| **invariantes** | `et_pb_button` · `et_pb_button_N` · `et_pb_bg_layout_light` |
| variables | **`boton-azul` 4/13** |
| `display` | `inline-block` (12/12 con caja) |
| `font-size` | **15** (12/12) |

> ⚠⚠ **ESTE TIPO NO LLEVA `et_pb_module`, Y ESO NO ES UN DETALLE: ES LO QUE
> PERDIÓ A LOS 13 EN LA v1 DE LA SONDA.**
>
> Un censo por `.et_pb_module` da **300 módulos y 10 tipos** en vez de 313 y 11,
> **sin dar error**. Los 13 ausentes se habrían leído como *«este arquetipo no
> tiene botones»* — una afirmación sobre el original producida por un descuido
> del instrumento. El conjunto se deriva bajando sección → fila → columna e
> identificando por el ordinal `et_pb_<tipo>_<n>`.

**`boton-azul` es CAMPO** (4 de 13), y ya está modelado como la piel
`azul`/`defecto` en `bloques/paginas.ts`.

> ⚠ **Su `font-size` medido es 15, no el 20 que declara el core del
> constructor** — el customizer del sitio lo baja. Cualquier `em` de este módulo
> se resuelve contra **15**: es exactamente el caso que hizo predecir 22 px de
> cuota donde la real son 16.5.

**La instancia sin caja (1 de 13)** está en un desplegable cerrado.

---

## `toggle` — 10 · 10 con caja · 5 páginas

| | |
|---|---|
| etiqueta | `div` (10/10) |
| **invariantes** | `et_pb_module` · `et_pb_toggle` · `et_pb_toggle_N` · **`et_pb_toggle_close`** · **`et_pb_toggle_item`** |
| variables | ninguna |
| `display` | `block` · `font-size` **18** |
| formas distintas | **1** |

> ✅ **LAS DOS CLASES QUE `CuerpoPagina.tsx` ESCRIBIÓ MAL, AHORA MEDIDAS.**
> `et_pb_toggle_item` sale **invariante en 10 de 10**, y el `clearfix` de
> `et_pb_toggle_content` aparece en el subárbol. Las dos son el **CONTROL** de la
> sonda —se exigen de antemano— así que su presencia **no es un hallazgo de esta
> spec: es la prueba de que la sonda sabe verlas** (§sondas 4: un cero de
> instrumento y un cero del original se escriben igual).

> ⚠⚠ **`et_pb_toggle_close` en 10 de 10 es EL dato del arquetipo, y explica los
> 36 sin caja.** En este corpus **no hay un solo desplegable abierto**, así que
> todo lo que vive dentro —30 `video`, 5 `text`, 1 `button`— está en el DOM y no
> está en la página. **El estado ABIERTO no está capturado**: no es que su
> geometría sea 0, es que **no hay medida**, y hace falta interacción.

---

## `code` — 9 · 9 con caja · **9 páginas**

| | |
|---|---|
| etiqueta | `div` (9/9) · **invariantes** `et_pb_code` · `et_pb_code_N` · `et_pb_module` |
| variables | ninguna · `display` `block` · `font-size` 18 |
| formas distintas | **8** de 9 instancias |

**Ritmo: los CUATRO ejes SIN ESCRIBIR** (`code.mt/mb/pt/pb`), o sea `0` en las 9.
No se cablea nada. Y **8 formas en 9 instancias**: el contenido de un `code` es
libre por definición, lo que lo hace el candidato natural a **campo rico** y no
a estructura modelada.

---

## `icon` — 3 · 3 con caja · **1 página** ⚠

| | |
|---|---|
| etiqueta | `div` · **invariantes** `et_pb_icon` · `et_pb_icon_N` · `et_pb_module` |
| `display` | `block` · formas: **1** · ruta: `/es/soporte/` |
| medido | `mb` **29.59 ×3** · `anchoPct` **86.93 ×3** · `mt`·`pt`·`pb` **SIN ESCRIBIR** |

**n = 1 página pero n = 3 instancias**, y eso no es lo mismo: el **test B sí se
puede aplicar**. Resultado: las 3 son **idénticas**, así que el test B **no las
separa**.

> ⚠ **Y «no las separa» NO es «es plantilla».** El test B tiene su falso
> negativo conocido —*un campo que el editor puso uniforme en toda la página*— y
> aquí la página es una sola. El test A dice que `mb` **se mueve** con el ancho
> (3 de 3), lo que en régimen de builder apunta a plantilla **para el ritmo**;
> pero **no vale para `anchoPct`**, donde el test A da la respuesta al revés.
>
> **Veredicto: `mb` plantilla por test A · `anchoPct` SIN PROBAR.**

---

## `fullwidth_slider` — 2 · 2 con caja · 2 páginas

Invariantes `et_pb_slider` · `et_pb_fullwidth_slider_N` · `et_pb_module`; 1 forma;
**los cuatro ejes de ritmo SIN ESCRIBIR**. Cuelga de la **sección sin pasar por
fila** (los *fullwidth* de Divi). Con **n = 2** se puede aplicar el test B pero
no concluir gran cosa: se declara.

---

## `map` — 1 · 1 con caja · **1 página** ⛔ SIN PROBAR

Invariantes `et_pb_map_container` · `et_pb_map_N` · `et_pb_module`. **Los cuatro
ejes de ritmo SIN ESCRIBIR.**

> ⛔ **Una sola instancia no establece plantilla ni campo** — ni el test A ni el
> B pueden separarlos. **Haría falta una SEGUNDA instancia.** No se cablea el
> valor observado: eso es el arreglo falso de manual.

---

## `slider` — 1 · 1 con caja · **1 página** ⛔ SIN PROBAR

| | |
|---|---|
| «invariantes» | `et_pb_module` · `et_pb_slider` · `et_pb_slider_N` · `et_pb_slider_fullwidth_off` · `et_pb_slider_no_pagination` · **`et_slider_auto`** · **`et_slider_speed_7000`** · **`testimonios`** |

> ⚠⚠ **Ocho «invariantes» con n = 1, y es el ejemplo que enseña a leer esta
> columna.** `et_slider_speed_7000` y `testimonios` son evidentemente **dato de
> esa página** —una velocidad concreta, un nombre de sección—, no plantilla del
> tipo. Con una sola instancia **«presente en el 100 %» significa «visto una
> vez»**, y separar plantilla de dato aquí **exige una segunda instancia**.
>
> Lo mismo para su ritmo: **los cuatro ejes SIN ESCRIBIR**.

---

## Resumen de veredictos de ritmo (de `f33-geo`, 49 celdas)

| veredicto | celdas |
|---|---|
| **SIN ESCRIBIR** (único valor = el inicial) | **29** |
| **CAMPO** (test B) | **16** |
| plantilla | 3 |
| mixto | 1 |

**29 de 49 celdas no se escriben.** Es la mayoría, y leerlas por el enunciado
literal del test A —*«igual a los dos anchos ⇒ campo»*— habría producido ~29
campos inventados, cada uno con su medición real de coartada.
