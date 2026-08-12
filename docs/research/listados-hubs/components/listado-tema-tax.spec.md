# SPEC · `LISTADO-TEMA-TAX` — el archivo de taxonomía (`L3`: `scientific-category`, 3 términos)

> **2026-08-11.** Redactada **desde lo congelado**, sin volver al original:
> `medidas/lh-spec-{1440,390}.json` · `medidas/lh-contenedores.json` ·
> `medidas/lh-h1.json` · `medidas/lh-serie.json`.
>
> **Alcance: 2 instancias medidas de 3** — la canónica
> (`articulos-cientificos-y-estudios`, 14 tarjetas) y la **adversaria**
> (`articulos-tecnicos`, **1 tarjeta**). La tercera
> (`evaluaciones-independientes`) **no está medida en `lh-spec`**.

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

| # | qué | por qué importa |
|---|---|---|
| **SP-T1** | el **clon**: no existe | esta spec es de un lado |
| **SP-T2** | la **3.ª instancia** (`evaluaciones-independientes`) | la varianza se mide con **2 de 3** |
| **SP-T3** | la **tipografía de la tarjeta** | congelada la caja y el ritmo, no el tipo de sus hijos |
| **SP-T4** | **anchos intermedios** | contrato de RANGO |
| **SP-T5** | **el ruido** de estas rutas | sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-T6** | **entradas por página** (`LH-SP9`) | sin ventana de `paginate_links` no se deriva del documento |
| **SP-T7** | ✅ mecanismo **DIAGNOSTICADO 2026-08-12** (§1: banda del tema con una sola regla vs módulo Divi con override móvil compilado) · queda sin exhibir la regla de la hoja externa — la piel se replica de la medida | mitad cerrada |
