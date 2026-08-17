# SPEC · `LISTADO-TEMA-TAX` — el archivo de taxonomía (`L3`: `scientific-category`, 3 términos)

> **2026-08-11.** Redactada **desde lo congelado**, sin volver al original:
> `medidas/lh-spec-{1440,390}.json` · `medidas/lh-contenedores.json` ·
> `medidas/lh-h1.json` · `medidas/lh-serie.json`.
>
> **Alcance: 2 instancias medidas de 3** — la canónica
> (`articulos-cientificos-y-estudios`, 14 tarjetas) y la **adversaria**
> (`articulos-tecnicos`, **1 tarjeta**). La tercera
> (`evaluaciones-independientes`) **no está medida en `lh-spec`**.

---

## ⚠ QUÉ CONTESTA ESTA SPEC Y QUÉ **NO** — escrito antes de construir (2026-08-17, 73.ª tanda)

**Por qué esto está aquí:** §*una regla INCOMPLETA se lee exactamente igual que
una completa*. `lh-barra.json` acertó en todo lo que midió y el componente de
`L1-resources` salió mal igual, porque **nadie le preguntó cuántas filas tiene el
cuerpo**. La medida no lleva escrito qué preguntas NO se le hicieron, así que se
escriben a mano. Lo de abajo **se ha derivado hoy** del espejo de PÁGINAS
(`medidas/lh-espejo-{1440,390}.json`, 82 páginas), que en agosto no existía.

### Lo que la spec YA contesta, y sigue en pie

Régimen · esqueleto de 5 secciones · la fila propia de **1152** con la miga y
**0 módulos de cuerpo** · el listado por `loop-del-tema` · las dos instancias
extremas (14 y 1 tarjetas).

### Lo que la spec NO contesta — y hoy sí está medido

| pregunta que nadie le hizo | derivado del espejo de páginas |
|---|---|
| **¿cuántas FILAS tiene el cuerpo?** (la que hundió `resources`) | **1**, en las **6** páginas y a los **dos** anchos. No hay trampa de 3-filas aquí |
| **la tercera instancia** | **medida**: `evaluaciones-independientes`, **8** tarjetas, **2** páginas |
| **¿cuántas páginas por serie?** | `articulos-cientificos-y-estudios` **3** · `evaluaciones-independientes` **2** · `articulos-tecnicos` **1** — **6 páginas**, no 3 |
| **¿pinta paginador en las páginas 2 y 3?** | **NO, en ninguna de las 6.** `D2.6`/§LH-C6-L3-SIN-PAGINADOR estaba afirmada **sólo sobre páginas 1**; ahora está sobre `primera`, `intermedia` y `última` |
| **¿qué hay entre el `h1` y el listado?** | **banda de filtros: 3 botones**, etiqueta `<a>`, **sin título**, y **108.8 px**. `qa:lh-huecos` la marca `enLaSpec: false` — construir sin ella **sube el listado** |
| **el contenedor del listado** | `div.scientific-list-content`, **w 1192** |
| **la base del cascarón** | `contenedorTema.y` **225** @1440 · **136.58** @390 |

### ⚠⚠ EL CUERPO DE `L3` **NO PAGINA**: cada `/page/N` sirve el TÉRMINO ENTERO (derivado 2026-08-17, 75.ª tanda)

**Esto cambia cómo se construye, y estaba dentro de los números que esta spec ya
citaba.** La línea de abajo decía *«`nTarjetas` es el total de la SERIE (14 en las
tres páginas), así que cuántas tarjetas van por página no está en el espejo»* —
y leerla como *«falta un dato»* es leerla al revés. `nTarjetas` es
`cards.length`, un **recuento del DOM de esa página**, no un total de serie: que
valga **14 en las tres** significa que **las tres páginas sirven las 14**.

Y hay un segundo canal que lo confirma sin depender de esa lectura: **`docH` es
idéntico** en las tres, a los dos anchos.

| serie | `nTarjetas` por página | `docH` @1440 · @390 | páginas |
|---|---|---|---|
| `articulos-cientificos-y-estudios` | **14 · 14 · 14** | 4169 · 12069 en las 3 | 3 |
| `evaluaciones-independientes` | **8 · 8** | 2509 · 7443 en las 2 | 2 |
| `articulos-tecnicos` | 1 | 1713 · 3181 | 1 |

**O sea que `/page/2` y `/page/3` sólo se diferencian de la 1.ª en el `<title>`
(«Página N de M») y en el `canonical`.** Es coherente con §3 —el cuerpo **no
sirve paginador**— y con `D2.6`: WordPress pagina la CONSULTA (Yoast ve 3
páginas, hay `<link rel=next>`), y la plantilla del tema **pinta el término
entero** ignorando el `paged`.

> **Consecuencia para construir:** la plantilla de `L3` **no parte la lista**.
> Emitir `/page/N` con una rebanada sería inventar un comportamiento que el
> original no tiene, y se vería en `nTarjetas` y en `docH` a la vez.

⚠ **Y `LH-SP9` («entradas por página») sigue sin poder cerrarse, pero ya no
bloquea nada de esta forma:** el nº de `/page/N` que hay que emitir sale de la
frontera del **SERVIDOR** (`qa:lh-paginas`, 3 · 2 · 1), no de un tamaño de
página. Con los tres pares (14→3, 8→2, 1→1) el tamaño sólo queda acotado a
**5 ó 6** —los dos satisfacen los tres—, o sea **0 instancias separadoras**: no
se escribe un número.

### Lo que sigue SIN contestar, y hay que decirlo

- ~~**el tamaño de página**~~ — ver el bloque de arriba: el cuerpo no pagina, así
  que no hace falta para construir, y el valor exacto está **acotado a 5 ó 6 sin
  instancia que los separe**;
- **la 3.ª instancia sólo tiene `primera` y `última`**: no hay `intermedia` en
  `evaluaciones-independientes`, así que toda propiedad exclusiva de una
  intermedia se apoya en **una sola serie**;
- ⚠ **no lleva override móvil**, y eso es un hecho medido, no una omisión:
  `qa:lh-pieles-css` dio **CERO overrides móviles de titular** en `L2`/`L3`/`L5`.
  **Construirle uno cuadraría a 1440 y sería falso.**

---

## 0 · El régimen y el esqueleto

| | medido |
|---|---|
| `et_pb_pagebuilder_layout` · `et-tb-has-body` | **no** · **no** |
| clases del `<body>` | `archive tax-scientific-category term-{slug} term-{id}` |
| secciones | **5** = `tb_header 1` + **`propia 1`** + `tb_footer 3` |

**`L3` sí tiene una sección propia y `L2` no** — ése es el criterio F2 con el que
`D1` los separó (4 vs 5 secciones), aquí confirmado a los dos anchos y en las 2
instancias.

⚠ **Pero la sección propia NO es el listado.** Su única fila lleva **un solo
módulo, y es la miga de pan** (`et_pb_text_0.breadcrumbs`, `mb: 0px`). El listado
va por **`loop-del-tema`**.

| la fila propia | @1440 | @390 |
|---|---|---|
| ancho | **1152** | **312** |
| `padding-top` / `bottom` | **12px** / 12px | 12px / 12px |
| reparto · módulos de cuerpo | `4_4` · **0** (sólo la miga) | ídem |

> ✅ **Y eso cierra §LH-CONTENEDOR-L3.** El 1152 es un tercer ancho de fila que
> `mbPorDefecto` no cubre, pero **de él no cuelga ni un módulo de cuerpo**, así
> que **no hace falta ningún default**: la tabla existe para *omitir* el `mb` de
> un módulo, y aquí no hay módulo que omitir. Si `L3` gana módulos algún día, el
> 1152 vuelve a ser huérfano y la función **tira** (`qa:lh-contenedores`, negativo
> `modulo-en-l3`).

## 1 · La base

| | @1440 | @390 |
|---|---|---|
| `h1.y` **en crudo** | **337.59** en las 2 instancias | **279.77** en las 2 |
| cabecera (`h`) | 225 | 136.58 |
| `h1` | **Manrope 44px / 44px · 300 · `#333`** | ídem 44/44 |
| renglones del `h1` | 1 y 1 | **3** («Artículos científicos y estudios») y **2** («Artículos técnicos») |

> ⚠ **El `h1` de `L3` NO es el de `L1`.** `L1` sirve **50px/60 · 800**; `L3`
> sirve **44px/44 · 300**. Y a **390 `L3` no baja de 44px** mientras `L1` baja a
> 35. Son **dos pieles distintas de titular**, medidas — no una con variantes.
> El texto es el **nombre del término** (`D4a`, 89 documentos de archivo).
>
> ✅ **El mecanismo de `SP-T7` está DIAGNOSTICADO 2026-08-12 desde lo servido.**
> El `h1` de `L3` es **la banda del TEMA** — `.main-title.titulo-puntos >
> h1.entry-title`, el mismo elemento que `L5` (por eso sus pieles son
> idénticas: 44/44 · 300 a los dos anchos)—. Su regla vive en la **hoja externa
> del tema** y el documento servido **no lleva ni una regla** para
> `main-title`/`entry-title` ni ningún override móvil que le aplique (censado
> el `<style>` inline completo de las 2 instancias): **una sola regla a todos
> los anchos**, y por eso no baja. Los `h1` que SÍ bajan (`L1`, `L4`) son
> **módulos de texto de Divi** cuya piel compila el override móvil del editor —
> exhibido en la spec de `L4` (`.et_pb_text_1 h1{font-size:35px}` @≤767).
> *No baja* = nadie escribió un tamaño móvil para la banda del tema; *baja* =
> el módulo lleva el suyo. **Lo que lo congelado no puede exhibir**: la regla
> concreta de la hoja externa (et-cache / style.css del hijo) — la piel de
> `L3`/`L5` se replica de la MEDIDA.

## 2 · La retícula del listado — **4 columnas**, la más densa del sitio

| | @1440 | @390 |
|---|---|---|
| columnas | **4** | **1 — apiladas** |
| ancho de tarjeta | **258** | **312** |
| hueco horizontal (`margin-right`) | **40** | 0 |
| hueco vertical (`margin-bottom`) | **40** | **32** |
| `x` de las 3 primeras | 144 · 442 · 740 | 39 |

`4 × 258 + 3 × 40 = 1152` — **la rejilla llena exactamente la fila de 1152**, que
es el mismo ancho de la fila de la miga. El contenedor de `L3` es **1152**, no
1238.39 ni 911.75.

**Altura de tarjeta:** `593.53` en las 3 primeras de la canónica @1440 —
**uniforme**, al contrario que en `L2`— y `492` en la instancia de 1 tarjeta. A
390: `588.52 · 588.52 · 620.91`.

## 3 · El paginador — **NO EXISTE**, y es una desviación con ficha

| | medido |
|---|---|
| paginador en el cuerpo | **no**, en las 2 instancias y a los 2 anchos |
| piel | `ninguna` |
| `<link rel="next">` del `<head>` | **sí** en la canónica → `…/page/2/` · **no** en la de 1 tarjeta |

> ⛔ **§LH-C6-L3-SIN-PAGINADOR.** `L3` **pagina por URL** (3 páginas en la
> canónica) y **no sirve ningún control en el cuerpo**: la única mención a
> `/page/2/` del documento es el `<link rel=next>` de Yoast. `D2.3` («las rutas
> se derivan en build») emitiría rutas **inalcanzables por navegación**.
> **Replicar o desviarse, con la razón escrita** — la decisión no se toma en esta
> spec.

⚠ **Y `LH-SP9` sigue abierta**: las entradas por página de `L3` no se derivan de
la ventana de `paginate_links`, **porque esa ventana no existe en esta forma**.
Se calcularían contra las páginas **con contenido** (`D2.5`), no contra el total
del servidor.

## 4 · Las instancias

| | `articulos-cientificos-y-estudios` | `articulos-tecnicos` | `evaluaciones-independientes` |
|---|---|---|---|
| tarjetas en la 1.ª página | **14** | **1** | **no medida** |
| `docH` @1440 · @390 | 4169 · 12069 | 1713 · 3181 | — |
| `<title>` | «Artículos científicos y estudios archivos - Kunak» | «Artículos técnicos archivos - Kunak» | — |

**El patrón del `<title>` es `{término} archivos - Kunak`** — con «archivos» en
plural y sin tilde, **verbatim**: es de WordPress, no una errata que corregir.

## 5 · La condición de reapertura de `D1`, y esta spec NO la resuelve

`D1` separó `L2` de `L3` **con condición escrita**: *«si la 5.ª sección de `L3`
resulta ser un bloque opcional del mismo esqueleto, se fusionan»*. Lo medido:

| | `L2` | `L3` |
|---|---|---|
| secciones | 4 | **5** |
| sección propia | **0** | **1**, y sólo lleva la miga |
| listado | `modulo-divi` | **`loop-del-tema`** |
| paginador | **piel B** | **ninguno** |

> **La diferencia NO se reduce a la 5.ª sección**: difieren además en **cómo
> emiten el listado** y en **si sirven paginador**. Con eso, la condición de
> reapertura **no se cumple** — pero **decirlo cerrado es modelar**, y esta spec
> mide. Se deja anotado para la mesa que toque `D1`.

## 6 · Lo que esta spec NO mide

> ⚠⚠ **`SP-T8` · LA BANDA DE FILTROS, que esta spec no nombra en ninguna
> sección (2026-08-14, 69.ª tanda).**
>
> Entre el `h1` y `.scientific-list-content` el original sirve **otro bloque**:
>
> ```html
> <div class="scientific-filter">
>   <div id="filters" class="button-group filtros-scientific">
>     <a href="…/articulos-cientificos-y-estudios/" class="button current">…</a>
>     <a href="…/articulos-tecnicos/" class="button">…</a>
>     <a href="…/evaluaciones-independientes/" class="button">…</a>
>   </div>
> </div>
> ```
>
> **Tres botones — uno por término de la taxonomía**, con `current` en el que se
> está viendo. Y no es un detalle de adorno: §1 congela `h1.y = 337.59` y §2
> congela el listado en `y = 500.39`, o sea **162.8 px** que esta prosa deja sin
> dueño. **Construir sin la banda sube el listado esos 162.8** — el número
> estaba dentro de las medidas y el elemento fuera del texto, que es cómo un
> hueco llega a la construcción sin que nada dé error
> (`CLAUDE.md` §*UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA*).
>
> ⚠ **Y el listado es la banda de filtros lo que `D1` es a la retícula:** los 3
> botones **consumen la taxonomía entera**, no el término. O sea que la consulta
> de esta forma necesita **los 3 términos** aunque pinte las tarjetas de uno.
>
> Derivado en `medidas/lh-huecos.json` (`npm run qa:lh-huecos`, negativo 4/4),
> **presente en las 2 instancias**.

| # | qué | por qué importa |
|---|---|---|
| **SP-T1** | el **clon**: no existe | esta spec es de un lado |
| **SP-T2** | la **3.ª instancia** (`evaluaciones-independientes`) | la varianza se mide con **2 de 3** |
| **SP-T3** | la **tipografía de la tarjeta** | congelada la caja y el ritmo, no el tipo de sus hijos |
| **SP-T4** | **anchos intermedios** | contrato de RANGO |
| **SP-T5** | **el ruido** de estas rutas | sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-T6** | **entradas por página** (`LH-SP9`) | sin ventana de `paginate_links` no se deriva del documento |
| ~~**SP-T7**~~ | ✅✅ **CERRADA ENTERA 2026-08-13.** El diagnóstico del 2026-08-12 era correcto y le faltaba el canal: con las **52 hojas capturadas**, `qa:lh-pieles-css` exhibe las dos mitades — `L1` lleva override **por módulo** (`.et_pb_text_1_tb_body h1` 50px + `@media (max-width:980px)` 35px) y `L3`/`L5` tienen **CERO** overrides móviles de titular, que es el mecanismo del *«no baja a 390»*. **Ya no se replica de la medida: se cita la regla.** Canal completo 13/13, negativo 3/3 | ✅ cerrada |
