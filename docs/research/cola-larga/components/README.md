# Specs de la COLA LARGA — el paso 1 que este arquetipo nunca tuvo

**Abiertas el 2026-08-24 (100.ª tanda).** Hasta hoy `docs/research/cola-larga/`
tenía `PRE-REGISTRO-*` y `derivaciones/` y **ningún `components/*.spec.md`**: el
arquetipo llegó al paso «plantilla» sin el paso 1 del orden obligado
(*specs → filas/columnas → extractor+seed → plantilla → ruta → sonda de dos
lados*).

**Y eso ya se había cobrado dos clases**, las dos escritas de memoria en
`CuerpoPagina.tsx` y las dos mal: `et_pb_toggle_item` y el `clearfix` de
`et_pb_toggle_content`. Las dos aparecen ahora medidas, en
[`modulos.spec.md`](modulos.spec.md) — y son el **control** de la sonda, no un
hallazgo suyo: se exigen de antemano justo para que un cero de instrumento no se
lea como un dato del original.

## ⚠ QUÉ CONTESTAN ESTAS SPECS Y QUÉ NO

Lo segundo es lo único que un fichero de medida **no puede decir solo**, y ya se
pagó: `lh-barra.json` acertó en todo lo que midió y nadie le preguntó cuántas
filas tenía el cuerpo.

| | |
|---|---|
| **CONTESTAN** | el **marcado** de los 11 tipos de módulo (etiqueta, clases invariantes vs variables, forma), la **retícula** y el discriminador `:first`/`:last`, todo **sobre lo COMPUTADO** y a los dos anchos |
| **NO contestan · el CLON** | son **UN SOLO LADO**: el original capturado. La comparación de dos lados es `qa:f33-cmp` y sigue a **0 ejes comparados en las 31** |
| **NO contestan · la GEOMETRÍA** | ritmo, caja y `anchoPct` los derivó `qa:f33-geo` (49 celdas con veredicto). Aquí se **citan**, no se recalculan |
| **NO contestan · el COMPORTAMIENTO** | **0 de 31 rutas**. Y no es un hueco cualquiera en este arquetipo: **36 módulos de 313 viven en desplegables CERRADOS** y su geometría **no es medible sin interacción** |
| **NO contestan · si un valor DEBE ser campo** | describen. La decisión de modelo es de quien escriba el bloque, con esto delante |
| **NO contestan · QUÉ NODO ES «EL MÓDULO»** | miden **el nodo que lleva el ORDINAL**. En 10 de los 11 tipos ese nodo es también el que lleva `et_pb_module`; en `button` **no**, y ahí las dos cosas se separan (ver abajo) |

### ⚠ El límite declarado del `button` — la spec acertó, y hay que saber a qué

`modulos.spec.md` escribió *«etiqueta `a` (13/13) — el ÚNICO tipo que no es
`div`»* y *«ESTE TIPO NO LLEVA `et_pb_module`»*. **Las dos son ciertas** — del
`<a>`, que es el nodo con ordinal (`et_pb_button_0`) y el que la spec fue a
medir. Y **las dos son falsas del MÓDULO**, que servido es

```html
<div class="et_pb_button_module_wrapper et_pb_button_0_wrapper … et_pb_module ">
  <a class="et_pb_button et_pb_button_0 boton-azul …">
```

**Contestó la pregunta que se le hizo**, y su fichero no puede llevar escrito
cuál NO se le hizo (§*una medida contesta las preguntas que se le hicieron, y su
fichero no lleva escrito cuáles NO*). Se declara aquí porque **cambia dónde cae
la retícula**: el selector servido es `.et_pb_column_X .et_pb_module`, así que
la regla de gutters llega al **envoltorio**, no al `<a>`.

**Y ya se cobró una lectura falsa**: la primera versión de `qa:f33-clases`
midió el `<a>` como módulo, sus 12 botones salieron con el `margin-bottom: 0`
del reset universal metidos en la distribución de gutters, y el derivador
informó *«el `1_2` declara DOS valores»* con un discriminador
—`clase:et_pb_button`— que era **una conclusión sobre el instrumento disfrazada
de dato del original**. Corregido midiendo el envoltorio **como nivel aparte**,
sin tocar el criterio de recuento: los **313 módulos** de `f33-spec` y `f33-geo`
ya tienen consumidores, y dos instrumentos que censan el mismo objeto se
unifican **con el criterio ya congelado**.

## El alcance, DERIVADO — y en las DOS unidades

De `medidas/f33-spec.json` y `medidas/f33-geo.json`, **31 páginas · 313 módulos ·
11 tipos**. El reparto **no es uniforme**, así que declararlo sólo en total
escondería que la mitad de los tipos no tiene con qué probar nada:

| tipo | inst | con caja | páginas | formas | ¿qué puede establecer una spec? |
|---|---|---|---|---|---|
| `text` | 151 | 146 | **29** | 30 | ✅ todo |
| `image` | 71 | 71 | **19** | 31 | ✅ todo |
| `video` | 30 | **0** | 5 | 1 | ⛔ **marcado sí · geometría NO MEDIBLE** |
| `blurb` | 22 | 22 | 3 | 5 | ✅ marcado · ⚠ 3 páginas |
| `button` | 13 | 12 | 6 | 2 | ✅ todo |
| `toggle` | 10 | 10 | 5 | 1 | ✅ todo |
| `code` | 9 | 9 | **9** | 8 | ✅ marcado · ritmo SIN ESCRIBIR |
| `icon` | 3 | 3 | **1** | 1 | ⚠ **test B sí** (3 hermanas) · test A no |
| `fullwidth_slider` | 2 | 2 | 2 | 1 | ⚠ n = 2 |
| `map` | 1 | 1 | **1** | 1 | ⛔ **SIN PROBAR** |
| `slider` | 1 | 1 | **1** | 1 | ⛔ **SIN PROBAR** |

### Los tres huecos, nombrados con su cardinal

**1 · `map` y `slider` — n = 1, y una instancia no establece nada.**
Ni el test A ni el test B pueden separar plantilla de campo con una sola
instancia. Salen **SIN PROBAR declarado, no cableado**: cablear el valor de la
única instancia es exactamente cómo se fabrica el arreglo falso.

> ⚠ **Y con n = 1 la columna «clases invariantes» NO mide invariancia.** Una
> clase «presente en el 100 % de las instancias» cuando la instancia es una sola
> quiere decir **«observada una vez»**. `slider` sale con **8 invariantes** —
> `et_slider_speed_7000`, `testimonios`— que son evidentemente **dato de esa
> página**, no plantilla del tipo. La lista se publica igual, pero se lee con su
> `n` delante.

**2 · `icon` — n = 1 PÁGINA pero 3 INSTANCIAS, y eso no es lo mismo.**
El test A (los dos anchos) necesita variación entre anchos; el **test B** (la
variación entre hermanos de la misma página) **sí se puede aplicar**, y dice
algo: las 3 traen `mb 29.59` y `anchoPct 86.93` **idénticos**. O sea que el test
B **no las separa** — lo que no las convierte en plantilla, porque el test B
tiene el falso negativo de *un campo que el editor puso uniforme*.

**3 · Los 36 módulos SIN CAJA — no es que no se cuenten: es que NO SE PUEDEN
MEDIR, y aun así devuelven números.**
`getComputedStyle` sobre un elemento sin caja **no resuelve los porcentajes
contra nada**: devuelve ceros, y esos ceros entran en una distribución como si
fueran dato. Reparto medido: **`video` 30 · `text` 5 · `button` 1**, en 8 rutas.

> Lo que necesitan **no es otra sonda del HTML servido: es INTERACCIÓN** —abrir
> el desplegable—, o sea el eje que este proyecto tiene a **0/31**. Se declara
> con lo que haría falta; **no se rellena**.
>
> Y el mecanismo está medido, no supuesto: los **10 `toggle` de 10** traen
> `et_pb_toggle_close` entre sus clases invariantes. En este corpus **no hay ni
> un desplegable abierto**.

**4 · Lo SIN ESCRIBIR se omite, no se cablea.**
`f33-geo` declaró **24 de 49 celdas** (tipo × eje) cuyo **único valor observado
es `0`, que es el valor INICIAL de la propiedad**. Un eje así **no es campo ni
plantilla: nadie tocó nada**, y para el modelo pesa lo mismo que SIN PROBAR. Los
cuatro ejes de `map`, los cuatro de `slider`, los cuatro de `code`, `text.pt`,
`image.pt`, `icon.mt/pt/pb`… no se escriben.

## Los ficheros

| spec | qué cubre | denominador |
|---|---|---|
| [`modulos.spec.md`](modulos.spec.md) | los 11 tipos: etiqueta, clases invariantes vs variables, `display`, `font-size` medido | **313 módulos · 11 tipos · 31 páginas** |
| [`reticula.spec.md`](reticula.spec.md) | sección → fila → columna, y **`:first`/`:last` medido por niveles** | **86 secciones · 113 filas · 179 columnas** |

## Instrumento

`npm run qa:f33-spec` (congelada `medidas/f33-spec.json`) · negativo
`qa:f33-spec-neg`, **5/5**. Mide **offline**, sobre el corpus **con sus hojas**
(32/32, precondición pagada en la 91.ª) y con `getComputedStyle`, nunca con
`grep` sobre las hojas.

> ⚠ **Y su cruce con `f33-geo` cierra el código de salida, por una razón
> medida.** La v1 de la sonda usaba `.et_pb_module` y perdía **`button` entero**
> —13 instancias; **300 módulos y 10 tipos** contra 313 y 11—. No dio error: dio
> un **número plausible**, y los 13 ausentes se habrían leído como *«este
> arquetipo no tiene botones»*. Es §sondas 4 en su forma de **cobertura
> parcial**: el selector casaba de sobra en los otros diez, así que no salía ni
> cero ni pleno. La congelada defectuosa se conserva con su nombre:
> `f33-spec-SONDA-PERDIA-button-ENTERO-300-de-313-2026-08-24.json`.
