# PRE-REGISTRO · 130.ª ESCALÓN 1 — `data-modulo` en la FILA 3 de `/software-de-medicion-calidad-del-aire`

**Escrito ANTES de tocar una línea y antes de medir.** Fecha: 2026-08-31.
Los hechos negativos que afirma están comprobados contra el archivo, no de
memoria (§regla 8b).

---

## Por qué esa fila y no otra

Derivado, no elegido: el ESQUEMA (§2o, corrección de la 128.ª) nombra los CAMPO
de este arquetipo por su marcador, y **los dos están en la fila 3**:

| CAMPO | marcador | fila del original |
|---|---|---|
| `menu-anclas` · `mb` 31.6719 · `pt` 0 | `.et_pb_text_14/15` | **3**, módulo 1 |
| `iconos-md-2` · `mb` 40px `!important` | `.et_pb_blurb_15/16` | **3**, módulos 15 y 16 |

`SOFTWARE` tiene **4 CAMPO de 44 pares resueltos** (ESQUEMA, tabla de la
cascada). Marcar esta fila es lo que pone bajo comparación de dos lados el
ritmo que el content type de F3-5 modela.

## Lo que se marca, con su reparto ATRIBUTO / ENVOLTORIO

La regla promovida por la 129.ª: **atributo sobre un elemento que YA EXISTE
siempre que se pueda; el ENVOLTORIO es la excepción y se cuenta aparte**, porque
es el único punto donde el NO-OP puede romperse.

| # del original | kind | dónde va en el clon | forma |
|---|---|---|---|
| 0 | image | `<img punteado>` del `aside` | atributo |
| 1 | text | la caja `menu-anclas` de `AnchorNav` | atributo |
| 2 | (null) | 1.er `BlueButton` de `ANCLAS_CTAS` | **ENVOLTORIO** |
| 3 | (null) | 2.º `BlueButton` de `ANCLAS_CTAS` | **ENVOLTORIO** |
| 4 | text | `<h2>Beneficios</h2>` | atributo |
| 5–13 | blurb ×9 | `<li>` de `ListaBeneficios` | atributo |
| 14 | text | `<h2>Herramientas</h2>` | atributo |
| 15–30 | blurb ×16 | `<li>` de `RejillaHerramientas` | atributo |
| 31 | text | `BlockTitle` de `UltimosProyectos` embebido | atributo |
| 32 | text | el `<div class="grid">` de las 3 fichas | atributo |
| 33 | (null) | el `<div class="flex">` del CTA | atributo |

**32 atributos · 2 envoltorios · 34 módulos.** Los dos envoltorios son el único
riesgo declarado: un `<div>` nuevo dentro de un `flex flex-col items-start
gap-[44.4px] md:gap-[14px]`.

## Alcance colateral, derivado con `git grep` (§regla 3)

Tres de los cinco ficheros son COMPARTIDOS, así que el marcador llega a rutas
que esta tanda no mide con `productos-cmp`:

| fichero | lo importan además |
|---|---|
| `AnchorNav.tsx` | `/accesorios` · `monitor/SubNavAnclas` · `AccesorioCard` |
| `UltimosProyectos.tsx` | `/monitor-calidad-aire` · HOME · `/sectores/[slug]` |
| `ListaBeneficios.tsx` | `api/BeneficiosApi` **(no lo usa: sólo lo nombra en un comentario — comprobado)** · `sectores/BeneficiosAplicaciones` |
| `RejillaHerramientas.tsx` | nadie más |
| `app/software-…/page.tsx` | — |

## PREDICCIONES — los dos lados

### DEBE pasar

1. **NO-OP al bit en las 4 rutas de `productos-cmp`, a 1440 Y a 390.** No lo
   firma quien mide: lo firma la guarda de `w()` diciendo *«idéntica a la
   congelada salvo meta.fecha»*, que compara el CONTENIDO y no un recuento que
   pueda absorber dos errores que se anulen.
2. **`clon-base` sin regresión en las 413 rutas, a los dos anchos** — es la
   única guarda que cubre el alcance colateral de los tres compartidos.
3. **La fila 3 de software pasa a COMPARADA**: `34 → 34` a 1440.
4. Las filas **1, 2 y 3 de `/kunak-api`, que hoy ya comparan, siguen
   comparando** con el mismo recuento. Ningún fichero de esta tanda las toca.

### NO DEBE pasar

5. Que la fila 3 salga **PARCIAL** por recuento: sería que el reparto de esta
   tabla está mal contado.
6. Que el NO-OP falle **sólo a 390**: sería el aviso de §regla 35 —la cascada no
   es la misma a los dos anchos— cobrado sobre un envoltorio.
7. Que aparezcan módulos marcados en filas que no son la 3.

### Lo que NO se puede predecir y por qué

8. **A 390 el recuento puede ser 33 y no 34**, porque la caja `menu-anclas` es
   `hidden … md:block` y un elemento sin caja no se cuenta. Si el original la
   oculta igual (regla ≤980 del tema, según el comentario del clon), los dos
   lados pierden el mismo módulo y cuadra en 33. **Eso es una predicción sobre
   el ORIGINAL que este pre-registro no ha medido**: si el recuento descuadra a
   390, la fila sale PARCIAL y eso es dato, no defecto del marcador.

## Lo que esta tanda NO arregla, y se ficha con su número

**El emparejamiento de filas está DESALINEADO en las 4 rutas, y no es un
defecto que el marcador de módulo pueda tocar.** El original sirve una
`et_pb_row` propia para el botón «Amplia tus conocimientos con nuestras guías»
—**146 px, 1 módulo**— y el clon no la marca con `data-fila`, así que el índice
desliza y la última fila comparada del clon (la FAQ, ~1400 px) se empareja con
ese botón:

| ruta | última fila comparada | Δ publicado |
|---|---|---|
| `/monitor-calidad-aire` | orig **146** → clon 1375.81 | +1229.81 |
| `/accesorios` | orig **146** → clon 1375.81 | +1229.81 |
| `/software-…` | orig **146** → clon 1425.81 | +1279.81 |
| `/kunak-api` | orig **146** → clon 1425.81 | +1279.81 |

**Esos cuatro Δ no son defectos del clon: son el instrumento** —§*31 de 31 rutas
distintas no es un hallazgo*, aquí 4 de 4 con el mismo `orig 146`—. Arreglarlo
es emitir el `data-fila` que falta, lo cual **cambia el cardinal de filas del
clon (6 → 7)** y por tanto caduca la línea base del eje `filas` de las 4 rutas
(§regla 5bis). Es una tanda con su propio NO-OP, no un extra de ésta.

**Consecuencia para el alcance de HOY, publicada con su cardinal y no
descontada:** de los **90** módulos del objetivo de software (cota DOM), sólo
**65** viven en filas alineadas (0–4). Los otros **25** son la fila 5
desalineada (1) y las filas 6–7, que el clon no empareja (22 de la FAQ + 1 del
vídeo). Esta tanda marca **34 de esos 65**.
