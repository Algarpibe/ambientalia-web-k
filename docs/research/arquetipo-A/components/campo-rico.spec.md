# El `post_content` — especificación del campo de texto rico

> **Inventario CENSADO, no muestreado**: las **209/209** páginas del arquetipo A,
> leídas del HTML servido con `npm run qa:a-censo`. Salida congelada en
> `scripts/qa/medidas/a-censo.json`. **0 fallos de lectura.**
>
> Por qué censo y no muestra: contar etiquetas dentro de un contenedor es `fetch`
> + parseo, así que muestrear sería aceptar incertidumbre a cambio de nada. Con
> el censo, cada frecuencia es **un dato y no una estimación**, y la pregunta que
> produjo la familia S9–S11 —«¿esto es raro, o es que no lo he visto?»— deja de
> existir.

## 0 · La decisión, primero

**El `post_content` NO se parsea a bloques. Se declara campo de texto rico.**

El razonamiento está en `CLAUDE.md` §«Dónde para el modelado de estructura». Aquí
va la evidencia que lo sostiene:

- **43 etiquetas HTML distintas** en el corpus, con cola larga real (`mark`,
  `center`, `noscript`, `tfoot`, `embed`, `hr`, `u`, `section`…);
- **ninguna estructura repetida** lo bastante como para merecer tipo propio: lo
  más frecuente después del párrafo son encabezados y listas, que son texto rico
  de manual;
- y **contenido ejecutable dentro del blob** (`script` en 15 páginas), que
  ningún modelo de bloques tipado va a representar.

Modelar esto como bloques sería inventarse un esquema para 209 documentos que ya
tienen uno: HTML.

## 1 · El inventario completo, con frecuencia por forma

Frecuencia = **en cuántas páginas aparece la etiqueta al menos una vez**.

| etiqueta | blog /149 | término /37 | doc. /23 | total /209 |
|---|---|---|---|---|
| `p` | 149 (100 %) | 37 (100 %) | 20 (87 %) | 206 |
| `span` | 143 (96 %) | 37 (100 %) | 2 (9 %) | 182 |
| `a` | 143 (96 %) | 37 (100 %) | 1 (4 %) | 181 |
| `div` | 134 (90 %) | 37 (100 %) | 3 (13 %) | 174 |
| `br` | 135 (91 %) | 36 (97 %) | 0 | 171 |
| `h2` | 92 (62 %) | 37 (100 %) | 15 (65 %) | 144 |
| `sub` | 87 (58 %) | 32 (86 %) | 20 (87 %) | 139 |
| `strong` | 110 (74 %) | 22 (59 %) | 5 (22 %) | 137 |
| `li` · `ul` | 94 · 92 | 31 · 31 | 0 | 125 · 123 |
| `img` | 94 (63 %) | 29 (78 %) | 0 | 123 |
| `h3` | 86 (58 %) | 28 (76 %) | 0 | 114 |
| `em` | 68 (46 %) | 17 (46 %) | 1 | 86 |
| `blockquote` | 48 (32 %) | 25 (68 %) | 0 | 73 |
| `iframe` | 49 (33 %) | 6 (16 %) | 0 | 55 |
| `b` | 33 (22 %) | 20 (54 %) | 0 | 53 |
| `h4` | 38 (26 %) | 9 (24 %) | 0 | 47 |
| `sup` | 21 (14 %) | 14 (38 %) | 2 (9 %) | 37 |
| `i` | 23 (15 %) | 13 (35 %) | 1 | 37 |
| `table`·`tbody`·`tr`·`td` | 17 (11 %) | 18 (49 %) | 0 | 35 |
| `thead` · `th` | 8 · 7 | 11 · 11 | 0 | 19 · 18 |
| `ol` | 13 (9 %) | 5 (14 %) | 0 | 18 |
| **`script`** | **15 (10 %)** | 0 | 0 | **15** |
| `figure` | 9 (6 %) | 0 | 0 | 9 |
| `video` · `source` | 7 · 7 | 1 · 0 | 0 | 8 · 7 |
| `figcaption` | 5 | 0 | 0 | 5 |
| `hr` · `u` · `section` | 5 · 5 · 5 | 0 | 0 | 5 cada una |
| `h1` · `h5` | 1 · 1 | 1 · 1 | 0 | 2 · 2 |
| `embed` | 2 | 0 | 0 | 2 |
| `style` · `center` · `small` · `noscript` · `mark` | 1 cada una | 0 | 0 | 1 cada una |
| `tfoot` | 0 | 1 | 0 | 1 |

**43 etiquetas distintas.**

### Longitud del blob

| forma | mín | mediana | máx |
|---|---|---|---|
| blog | **275** | 6 347 | **69 784** |
| término | 5 651 | 19 741 | 50 640 |
| doc. científico | 675 | 1 678 | 2 646 |

**El rango de blog es de 254×.** Cualquier componente con alto cableado muere
aquí — es la familia S9–S11 esperando a que la construyan.

## 2 · Lo que NO aparece — también es contrato

Buscado explícitamente y **ausente en las 209**:

| payload | veredicto |
|---|---|
| **código** (`code`, `pre`) | **ausente en las 209** |
| **lista de definición** (`dl`) | **ausente** |
| **formulario** (`form`, `input`) | **ausente** |
| **bloques de Gutenberg** (`wp-block-*`) | **ausente** — ver §3 |
| galería en término y doc. | ausente (solo blog, 9 páginas) |
| `audio` | ausente (`video` sí, 8 páginas) |

Que no aparezcan **no significa que el campo pueda prohibirlos**, pero sí que
**hoy no hay que soportarlos** y que si aparecen es contenido nuevo, no
migración.

## 3 · El editor es el CLÁSICO, no Gutenberg

**Cero clases `wp-block-*` en las 209.** Lo que sí hay:

| marca | páginas | qué es |
|---|---|---|
| `wp-caption` + `wp-caption-text` | **83 (40 %)** | el *shortcode* de leyenda del editor clásico |
| `wp-image-<id>` | mayoría de las `img` | clase que el editor clásico pone a la imagen insertada |
| `wp-video-shortcode` | 6 | el shortcode `[video]` |

Es un dato de migración de primer orden: **el corpus es HTML del editor clásico
con shortcodes resueltos en servidor**, no un árbol de bloques. No hay estructura
que importar — hay HTML.

### ⚠ Y trae `style` en línea con píxeles

Ejemplo real, de la leyenda de imagen:

```html
<div id="attachment_60497" style="width: 1210px" class="wp-caption aligncenter">
  <img class="wp-image-60497 size-full" src="…" srcset="…" width="1200" height="…">
  <p class="wp-caption-text">…</p>
</div>
```

**`style="width: 1210px"` escrito en el contenido.** En un contenedor de 911.75
eso desborda. Es exactamente la clase de dato que un campo rico arrastra y que
la maquetación tiene que neutralizar — y hay que decidirlo, no descubrirlo.

## 4 · Convenciones que viven DENTRO del blob

No son etiquetas, son acuerdos que el contenido da por hechos:

| convención | páginas | qué es |
|---|---|---|
| **`<a class="et_pb_button">`** | **168 (80 %)** | CTA con la piel de botón de Divi, escrito en el contenido. Verificado: `<a href="…/descarga-catalogo/" class="et_pb_button calls-button" target="_blank" rel="nofollow">` |
| ~~`id` en los `h2`~~ | ~~16 de 61 encabezados en la página medida~~ | ⚠ **NO es una convención del contenido — corregido 2026-07-30.** Ver abajo |
| `srcset` en las `img` | 8 de 9 en la página medida | responsive de WordPress |

**El `et_pb_button` es el hallazgo incómodo:** el 80 % de los documentos depende
de **una clase CSS del tema** para que un enlace se vea como botón. En el CMS eso
es acoplamiento entre contenido y tema, y hay dos salidas —convertirlo a un nodo
tipado al migrar, o replicar la clase—; **no se elige aquí**, se deja medido.

### ⚠ Los `id` de los `h2` NO viven en el contenido — corregido (2026-07-30)

**La medida era correcta; su sitio no.** «16 de 61» es real, pero es del **DOM
tras settle**, y esta tabla es de **convenciones que viven dentro del contenido**.
En el contenido no hay ni uno.

Medido en la misma página —`/es/contaminacion-por-metano/`, la que produjo el «16
de 61»— con `npm run qa:a-ids`, salida congelada en `medidas/a-ids.json`:

| | HTML servido | DOM tras settle |
|---|---|---|
| encabezados del documento | 68 · **0 con `id`** | 68 · **16 con `id`** |
| dentro de `post_content` | 61 · **0 con `id`** | 61 · **16 con `id`** |

**Los pone el JS del tema al cargar.** Confirmado en **8 páginas**: en las 6 con
encabezados, cero `id` en el HTML servido y `id` en el DOM; en las otras 2 no hay
`id` en ninguno de los dos. **Ninguna los trae en el contenido.**

Y explica la contradicción con el piloto de CMS-0e —«299 encabezados en 24
páginas, ninguno con `id`»—: **las dos medidas eran ciertas.** Diferían en **dos**
ejes a la vez, ámbito (documento entero vs `post_content`) y momento (DOM vs HTML
servido), y por eso ninguna era comprobable contra la otra. Es `CLAUDE.md` §«El
NIVEL al que se mide» aplicado al eje del tiempo: **dos medidas que difieren en
dos variables no deciden ninguna.**

**Cierra A-SP9**, y la consecuencia va a `ESQUEMA-CMS.md` §T6: el `id` **se
regenera, no se conserva**, y el índice del artículo es **derivable** del propio
texto rico. No hay nada que guardar, así que el `id` tampoco entra en la
whitelist del campo.

## 5 · Las tres formas NO piden el mismo campo rico

| | blog | término | doc. científico |
|---|---|---|---|
| etiquetas distintas | **43** | 30 | 10 |
| tablas | 11 % | **49 %** | **0** |
| citas | 32 % | **68 %** | **0** |
| embebidos | 33 % | 16 % | **0** |
| imágenes | 63 % | 78 % | **0** |
| listas | 62 % | 84 % | **0** |
| `script` | 10 % | 0 | 0 |
| longitud mediana | 6 347 | **19 741** | **1 678** |

**El documento científico es casi texto plano**: `p`, `sub`, `h2` y poco más —
`a` en **1 de 23**, y **3 páginas sin un solo `<p>`**. El término es el más
tabular. El blog es el más variado y el único con `script`.

**Consecuencia para el modelo:** un campo rico único que admita el superconjunto
sirve a las tres, pero **el perfil de uso es tan distinto que el editor de cada
forma debería ofrecer distinto**. Es decisión de UX del CMS, no de esquema, y se
deja anotada.

## 6 · La especificación, entonces

**Un campo `cuerpo` de texto rico, HTML, con este contrato mínimo:**

| debe admitir | porque |
|---|---|
| `p` `br` `strong` `em` `b` `i` `u` `small` `mark` `sub` `sup` | inline; `sub`/`sup` en **139/209** (fórmulas químicas: NO₂, CO₂) |
| `h2` `h3` `h4` (`h1` y `h5` residuales) | `h2` en 144/209, **y con `id` estable** para el índice |
| `ul` `ol` `li` | 125/209 |
| `a`, incluidos `target` y `rel` | 181/209, y el CTA de §4 |
| `img` con `srcset`, `width`, `height`, `class` | 123/209 |
| `figure` `figcaption` y el patrón `wp-caption` | 83/209 llevan leyenda |
| `table` `thead` `tbody` `tfoot` `tr` `th` `td` | 35/209, y **49 % de los términos** |
| `blockquote` | 73/209 |
| `iframe` de **orígenes arbitrarios** | 55/209: YouTube **y** gráficos interactivos |
| `video` `source` `embed` | 8/209 |
| `hr` `div` `span` `section` | estructura suelta del editor clásico |
| **`script`** | **15/209 — decisión pendiente, ver abajo** |

### La decisión que este spec NO toma

**`script` dentro del contenido, en 15 entradas de blog.** Admitirlo es ejecutar
código escrito por quien edita; no admitirlo es perder 15 documentos tal como
están. Las dos son legítimas y ninguna es de maquetación:

- **(a) admitirlo**, con el campo marcado como confiado y solo editable por
  personal interno;
- **(b) no admitirlo** y convertir esos 15 a un nodo tipado de embebido durante
  la migración, con la lista de los 15 en la mano;
- **(c) no admitirlo y aceptar la pérdida**, anotada como desviación deliberada.

**Se deja escrita y sin elegir**, que es lo que corresponde a un recon.

## 7 · ⚠ SIN PROBAR

| # | qué | por qué |
|---|---|---|
| **A-SP8** | qué hacen exactamente los 15 `script` | contados, no leídos |
| ~~**A-SP9**~~ | ~~si los `id` de los `h2` los genera el tema o vienen en el contenido~~ | **✅ CERRADA (2026-07-30): los genera el tema.** 0 en el HTML servido, 16 en el DOM, misma página; 8 páginas sin una excepción. El índice **es derivable** y el `id` no se guarda — §4 |
| **A-SP10** | si el `style="width:1210px"` de `wp-caption` aparece en las 83 o solo en algunas | medido en una |
| **A-SP11** | si hay `srcset` en las 123 páginas con imagen | medido en una |
