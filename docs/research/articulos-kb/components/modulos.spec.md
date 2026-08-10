# SPEC · los MÓDULOS de `articulos-kb`

> Medido el **2026-08-10** contra `kunakair.com` **vivo**, 6/6 instancias, a
> **1440** y **390**. Congelado en `medidas/kb-spec-{1440,390}.json`. Método:
> `../MEDICION.md`.

## 0 · El censo

**149 módulos** en las 39 filas visibles + 6 en las ocultas.

| kind | n | dónde |
|---|---|---|
| `text` | **85** | por todas partes |
| `blurb` | **36** | 3 de los 6 artículos |
| `image` | **21** | por todas partes |
| `button` | **6** | 3 artículos |
| `gallery` | **1** | sólo `que-es-kunak-air-cloud` |

Ni un módulo de otro kind: **no hay** `toggle`, `video`, `divider`, `code`,
`cta`, `accordion` ni `tabs` en las 6 instancias. Es un cero de **6 instancias**,
no del arquetipo: se declara con su denominador.

## 1 · `text`

### 1.1 · Tipografía, medida

Titulares dentro de `.et_pb_text_inner`, todos `Manrope`, `letter-spacing
-0.5px`, `margin 0` (`mt` y `mb` a 0 en los 36):

| etiqueta | @1440 | @390 | n | color |
|---|---|---|---|---|
| `h2` (título del artículo) | **45/45 w700** | **45/45 w700** | 6 | `#333` |
| `h2` (de sección) | **44/55 w300** | **35/43.75 w300** | 11 | `#333` |
| `h2` | 37/37 w300 | 37/37 w300 | 3 | `#333` |
| `h3` | 32/32 w300 | 32/32 w300 | 4 | **`rgb(12,113,195)`** |
| `h3` | 32/32 w300 | 32/32 w300 | 4 | `#333` |
| `h4` | 26/26 w300 | 26/26 w300 | 2 | `#333` |
| `h1` (oculto) | 44/44 w300 | 44/44 w300 | 6 | `#333` |

> **El `h2` tiene DOS pieles y las separa el peso, no el nivel**: el título del
> artículo es `45/45 w700` y no encoge a 390; el `h2` de sección es `44/55 w300`
> y **sí** encoge (a `35/43.75`). Un componente que trate «h2» como una sola cosa
> se equivoca en 11 de 17.

Cuerpo:

| elemento | @1440 | @390 | n |
|---|---|---|---|
| `p` | **18/30.6 w400 `#333`** | 18/30.6 | 47 |
| `p` (claim) | 25/30 w400 | **35/42** | 5 |
| `p` (etiqueta azul) | 15/30.6 **w800** `ls 0.1px` `rgb(0,117,201)` | **13**/30.6 | 2 |
| `li` | 18/30.6 w400 | 18/30.6 | 9 |
| `ul` | `padding-left 36px` · `list-style-type: none` | idem | 9 |

`list-style-type: none` con `padding-left 36`: **la viñeta la pinta el tema, no
el navegador**. Copiar el `ul` sin eso da una lista con el punto del navegador.

### 1.2 · Lo que hay DENTRO, y el escalón que ya está fichado

Censo sobre los 85 módulos (etiqueta × apariciones):

```
p×95 · span×50 · li×40 · h2×20 · strong×13 · ul×9 · b×9 · h3×8 ·
sub×7 · h1×6 · a×5 · i×4 · em×2 · h4×2 · sup×1 · img×1
```

**16 etiquetas distintas; 7 fuera de lo que `BLOQUES_TEXTO` + `inline`
expresan**: `span×50 · sub×7 · a×5 · i×4 · em×2 · sup×1 · img×1`. Reproduce al
carácter lo que midió `qa:kb-recon`, con otro instrumento y otro día — es el
control cruzado de esa medida.

> Esto **no** es un hallazgo nuevo de esta tanda: es §F3-1-ESCALON-TEXTO, ya
> arbitrado en la 43.ª. Lo que aporta aquí es que **el spec lo confirma con su
> propio recuento**, y que la población está medida de los dos lados (KB 7 ·
> SECTOR/MONOGRÁFICO 12, `medidas/texto-poblacion.json`).

### 1.3 · Ritmo del módulo

`margin-bottom`, **9 valores** — la propiedad es campo (hay px absolutos que sólo
pudo escribir alguien), pero dos de sus valores son «el default»:

| par | n | qué es |
|---|---|---|
| `0 → 0` | 51 | campo a 0 |
| `34.0469 → 30` | 49 | **default**, ver ⚠ abajo |
| `25.0625 → 30` | 13 | **default**, ver ⚠ abajo |
| `16` · `27` · `40` | 18 | **campo**, px absolutos (test A) |
| `34.0469 → 0` | 10 | campo |
| `13 → 0` · `45 → 0` | 2 | campo |

### ⚠ El default de `mb` NO es un número: depende del TIPO DE COLUMNA

Los dos valores «de aspecto default» colapsan los dos a `30px` a 390, y **cuál
de los dos sale está perfectamente determinado por el reparto, sin una sola
excepción en los 72 módulos que los llevan**:

| valor @1440 | n | tipos de columna en que aparece | es el 2.75 % de |
|---|---|---|---|
| **`34.0469`** | 59 | **`4_4` y sólo `4_4`** (911.75) | **1238.39** — la fila del **cascarón** |
| **`25.0625`** | 13 | `1_2` (430.8) · `2_3` (591.11) · `1_3` (270.48) | **911.75** — la fila **propia** |

> **Ninguno de los dos es el 2.75 % de su propio contenedor.** Un módulo en la
> columna `4_4` mide 911.75 de ancho y su `mb` vale 34.0469, que es el 3.734 %
> de 911.75 — o sea que el porcentaje **se resolvió contra un ancestro**, y
> contra cuál depende del reparto de la fila.

Consecuencia para quien construya, y es la razón de escribir esto:

> **Cablear «el default de `mb`» como una constante se equivoca en uno de los dos
> grupos por ~9 px, y en 59 módulos si se elige mal.** El default es una
> **función del tipo de columna**, no un número.

**El mecanismo queda SIN PROBAR.** Que el 2.75 % se resuelva contra 1238.39 en
las `4_4` es lo que dicen los números; *por qué* no se ha medido, y esta spec no
lo afirma. Ficha en `PENDIENTES-QA.md` §F3-1-SIN-PROBAR-KB.

**Y es un límite declarado del clasificador:** `esDefault()` de `kb-tests.mjs`
sólo reconoce la forma «2.75 % de la fila propia», así que los 59 nodos a
`34.0469` salen clasificados **CAMPO por el test B**. Eso **no** afirma que los
escribiera un editor — afirma que el clasificador no tiene la regla para
reconocerlos como default. El veredicto de la propiedad (`CAMPO`) no depende de
ellos: lo sostienen los `16`, `27`, `40`, `13` y `45`.

`margin-top`: `0` ×121 · **`-18 → 0`** ×14 · `-25` ×6 · `-15` ×2. Los negativos
son campo (test A) salvo **uno**, que queda SIN PROBAR (§4 de `../MEDICION.md`).

`padding-top` **0 en los 143** → SIN EVIDENCIA. `padding-bottom` `0` ×141 y
**`35`** ×2 → campo.

## 2 · `blurb` — 36 módulos

Confirma §2d.2 con otro instrumento, y añade la tipografía:

| campo | medida | veredicto |
|---|---|---|
| `imagen` | **50×50** ×27 · **270.48×270.48** ×3 · **ninguna** ×6 | **opcional** (30/36) |
| `descripcion` | presente ×24, ausente ×12 | **opcional** |
| `titular` nivel | `h4` ×27 · `h3` ×9 | **campo** |
| `titular` tipo | `h4` **18/21.6 w700** ×24 (→ **16/19.2** a 390) · `h3` 18/21.6 w300 ×9 · `h4` 18/18 w600 ×3 | **campo** (tres pieles) |
| `titular` marcado | **envuelto en `<span>` en los 36** | plantilla |
| `reticula` | `iconos-xs-2 iconos-md-3` ×24 · `col-md-4` ×9 · **ninguna** ×3 | **campo, 3 valores** |
| `enlace` | **0 de 36** | **no existe** |
| alineación | `et_pb_text_align_center` ×27 · `_left` ×9 | **campo** |
| posición imagen | `et_pb_blurb_position_top` en los 36 | cero varianza — **no se cablea** |

`margin-bottom` del contenedor de la imagen: **30** (`.et_pb_main_blurb_image`).
La descripción es HTML: `<p>…</p>`, no texto plano.

> **`et_pb_blurb_position_top` sale 36/36 y NO se cablea**: cero varianza no
> prueba plantilla (`CLAUDE.md`, la lección del propio `blurb`). Queda declarado
> como SIN PROBAR de bajo riesgo.

## 3 · `image` — 21 módulos

| | |
|---|---|
| con `srcset` | **14 de 21** |
| con `alt` no vacío | **18 de 21** |
| anchos @1440 | `366.17` ×6 · `911.75` ×6 · `135.23` ×4 · `108.19` ×2 · `752` · `800` · `911.73` |
| `.et_pb_image_wrap` | `display: inline-block`, `max-width: 100%`, sin borde |
| clases de alineación | **ninguna** en las 21 |

Los anchos que no llenan la columna son **`anchoPct` medido**: `366.17/430.797 =
85 %`, `135.23/270.484 = 50 %`, `108.19/270.484 = 40 %` — y la razón se conserva
a 390 (`285.078/335.391 = 85 %`, `167.688/335.391 = 50 %`,
`134.156/335.391 = 40 %`). **Test A en razón** (`../MEDICION.md` §3.3).

`752` y `800` son **anchos intrínsecos**: la imagen es más estrecha que su
columna y no se estira. No son campo — son el fichero.

## 4 · `button` — 6 módulos, una sola piel

**Idéntica en los 6 y a los dos anchos:**

```
a.et_pb_button   15px/25.5px  w700  Manrope  color #333
                 padding 7.5px 40.5px
                 border 1px solid rgb(51,51,51) · border-radius 30px
                 background transparent
```

Cero varianza en 6 instancias → **no se cablea**: se declara SIN PROBAR de bajo
riesgo, con su denominador.

## 5 · `gallery` — 1 módulo

Sólo en `que-es-kunak-air-cloud`. `et_pb_gallery_grid`,
`et_pb_text_align_center`, **6 items**, item de **258.5 × 201.33** a 1440.

> **Un módulo en 6 instancias es un denominador de 1.** No se puede decir nada
> de sus campos con esto: lo que haya que modelar de `gallery` sale del censo del
> grupo D, no de aquí. Se declara para que nadie lea «medido» donde pone «visto
> una vez».

## 6 · Lo que este spec deja abierto

1. **el extractor no puede leer `style=`**: hay **0** estilos en línea en los 149
   módulos (`cuerpo.spec.md` §2.2). Todo el ritmo y el ancho vienen de
   `getComputedStyle`, o sea de navegador contra el sitio vivo;
2. **`toggle`/`video`/`divider`/`cta`/`accordion`/`tabs` no aparecen** en las 6.
   Es un cero con denominador 6, no una propiedad del arquetipo — y es
   exactamente la forma de la §regla del caso no ejercitado: si el modelo los
   admite, son **camino de render sin estrenar** (`qa:nunca-vistos`);
3. **ni un `blurb` con enlace en 36**, y aquí sí se puede afirmar la ausencia con
   su denominador: `enlace` **no es campo** de este arquetipo.
