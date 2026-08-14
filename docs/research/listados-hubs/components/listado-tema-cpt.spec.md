# SPEC · `LISTADO-TEMA-CPT` — el archivo de CPT (`L2`: glosario · preguntas-frecuentes)

> **2026-08-11.** Redactada **desde lo congelado**, sin volver al original:
> `medidas/lh-spec-1440.json` · `medidas/lh-spec-390.json` · `medidas/lh-h1.json`
> · `medidas/lh-ancla.json` · `medidas/lh-serie.json`. Medición original:
> `qa:lh-spec` contra kunakair.com vivo, 1440 y 390.
>
> **Alcance: 2 instancias, 1 por CPT.** `D1` las llama *«un arquetipo, 2
> instancias»*, así que **la varianza entre instancias se mide con n = 2** — es
> lo que hay, y se dice: toda propiedad que sólo aparezca en una queda **SIN
> PROBAR**.

## 0 · El régimen, y no es ninguno de los dos habituales

| | medido |
|---|---|
| `et_pb_pagebuilder_layout` | **no** |
| `et-tb-has-body` | **no** |
| clases del `<body>` | `archive post-type-archive post-type-archive-glossary` · `…-faqs` |
| secciones Divi | **4** = `tb_header 1` + `tb_footer 3` — **cero propias** |

> **No hay cuerpo Divi.** El listado lo emite **la plantilla PHP del archivo de
> CPT**, y el theme builder sólo pone cabecera y pie. Es lo que `D1` usó para
> separar `L2` de `L1` (*«el cuerpo lo emite la plantilla del tema»*), aquí
> medido en el esqueleto: `cuerpo = 0` en las dos instancias y a los dos anchos.
>
> ⚠ **Pero el LISTADO sí es un módulo Divi** (`listado.via = modulo-divi`,
> `article.et_pb_post`). O sea: **plantilla del tema que incrusta un módulo de
> Divi**, no una cosa ni la otra. Eso importa para el clon: la tarjeta es la del
> módulo, el cascarón no.

## 1 · La base — **`L2` NO TIENE `h1`**, y eso es plantilla

`D4b` lo cierra con su denominador: **12 documentos sin `<h1>`** (glosario 8/8 ·
faqs 4/4), **0 con `<h1>` vacío** en los 149. Varianza 0 dentro de cada familia
⇒ **plantilla de la familia**, no campo.

**Base de lectura: la PRIMERA TARJETA** (`D4b.1`, `qa:lh-ancla`).

| | @1440 | @390 |
|---|---|---|
| ancla `article.et_pb_post…` — `y` **en crudo** | **283** en las dos instancias | **194.58** en las dos |
| cabecera (`h`) | **225** | **136.58** |
| contenedor del tema (`y`) | **225** | **136.58** |

> ⚠⚠ **MEDIA VERIFICACIÓN.** El criterio de `c-cabecera` —*ser **el mismo
> elemento** en los dos lados*— **no se ha podido comprobar**: el clon no emite
> estas rutas. Es **`P-LH-C8`**, a cargo de la tanda que construya. Sin eso, un
> Δ0 en el cuerpo de `L2` no significa lo que parece.

## 2 · La retícula del listado — **una sola columna**

| | @1440 | @390 |
|---|---|---|
| columnas | **1** | **1** |
| ancho de tarjeta | **848.16** | **312** |
| `margin-bottom` entre tarjetas | **42** | **42** |
| `margin-right` | 0 | 0 |
| `x` de la tarjeta | 144 | 39 |

**El `mb` de 42 es el mismo a los dos anchos**, que es lo contrario de `L1`
(40 → 32). No es una tarjeta de rejilla: es una lista.

**Alturas medidas** (las 3 primeras): glosario **138.78 · 138.78 · 138.78**
@1440; faqs **138.78 · 138.78 · 175.78** — la 3.ª de faqs envuelve un renglón
más. A 390: glosario **359.34 · 328.75 · 365.75**. **La altura la pone el
contenido**, no la plantilla.

## 3 · El paginador — **piel B**, y es la única forma que la usa junto con `L1-etiqueta`

`div.wp-pagenavi` con `role="navigation"`.

| pieza | qué es | tipografía / caja |
|---|---|---|
| `span.pages` | **«Page 1 of 8»** (glosario) · **«Page 1 of 4»** (faqs) | 15px/30.6 · 400 · `#333` · `padding 3px 5px` |
| `span.current` | la página actual | 15px · **600** · **blanco sobre `#0075C9`** · **36×36** · `border-radius 50%` · borde 2px |
| `a.page.larger` | las demás | 15px · 600 · `#0075C9` · 36×36 · radio 50% · borde 2px |
| `span.extend` | **«...»** | 15px · 400 · `#333` |
| `a.last` | **«Last »»** | 15px · 600 · `#0075C9` · 52.36×36 |
| `a.nextpostslink` | **«»»** — **`display: none`** | servido y oculto: se replica oculto, no se omite |

**Caja del paginador:** `848.16 × 42` (glosario) y `848.16 × 40` (faqs) @1440;
`312 × 80` @390 — a 390 **envuelve en dos renglones**. Ritmo: `margin 0` y
`padding 0` en los dos; el aire lo ponen los `margin: 2px` de cada pieza.

> **El `<span class="pages">` es la fuente del total sin pedir una página**
> (`BEHAVIORS.md` §1b) — y `D2.5` la confirma: la **M** que hay que servir es la
> del servidor, la misma que el `<title>` de Yoast.

## 4 · Las series y su contrato

| | glosario | preguntas-frecuentes |
|---|---|---|
| páginas `/page/N/` | **8** | **4** |
| entradas por página | **5** | **5** |
| `docH` @1440 · @390 | 1933 · 4601 | 1968 · 4752 |
| `<title>` | «Kunakpedia Archive - Kunak» | «FAQs archivo - Kunak» |

**`entradasPorPagina = 5` es parámetro de plantilla de la variante** (`D2.2`):
varianza 0 dentro de cada CPT.

⚠ **Ninguna de las 12 páginas de `L2` está vacía** (`lh-ancla`: 0 vacíos en
`L2-glosario` y `L2-faqs`), así que **`D2.5` y `P-LH-C7` no le aplican a esta
forma**. Es la única de las cinco de la que se puede decir eso.

## 5 · Lo que esta spec NO mide

> ⚠⚠ **CUATRO ENTRADAS NUEVAS (2026-08-14, 69.ª tanda) — y no salieron de
> re-medir: salieron de ESCRIBIR EL ALCANCE antes de construir.**
>
> `CLAUDE.md` §*UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA*. Las cuatro
> estaban **dentro de los números que esta spec ya cita** y **fuera de su
> prosa**, que es exactamente la forma en que un hueco llega a la construcción
> sin que nada dé error. Instrumento: `npm run qa:lh-huecos` (negativo 4/4),
> congelado en `medidas/lh-huecos.json`.
>
> | # | lo que la spec dice | lo que el canal dice |
> |---|---|---|
> | **SP-C8** | §4 y §2 no nombran la **BARRA LATERAL**, y `lh-barra.json` da `conBarra 0 de 12` | **`L2` SÍ tiene barra: 12 de 12.** Es la del **TEMA** (`<body … et_right_sidebar>` + `#sidebar` hermano de `#left-area`, **3 widgets**: Buscar · Categorías · ¡Suscríbete!), no la partición Divi `3_4+1_4` que aquella medida buscaba — **0 de 12** en el cuerpo. Las dos medidas son ciertas y contestan preguntas distintas |
> | **SP-C9** | §1 da `ancla y = 283` y `cabecera h = 225` y **no nombra los 58 de en medio** | **58 px, iguales a 1440 y a 390** (283−225 y 194.58−136.58). Es el `padding-top` del `.container` del tema, y está en los dos números de la tabla sin estar en el texto |
> | **SP-C10** | §3 describe las piezas de la piel B y **no su VENTANA** | **5 números** con `« First` · `...` · `Last »`. Derivado de las **43** instancias capturadas (totales 2·3·4·8·11): el componente reproduce **38/38** secuencias, el que había **7/38**. ⚠ Y las instancias de esta spec (`total = 4`) **no podían separar los dos modelos** |
> | **SP-C11** | ninguna sección trata **QUÉ ORDENA** el archivo | `/glosario` = JSON-LD **`datePublished` DESC, 37/37** (y los post-id **no** son descendentes, así que la fecha discrimina). **`/preguntas-frecuentes` no lo sirve en ninguno de los 4 canales mirados** — `<span class="fecha-publicacion">` (el que usa `entradas-blog`), `datePublished`, `article:published_time` y el `<lastmod>` del sitemap —, y `lastmod` **no ordena ni siquiera en `/glosario`**, donde el orden verdadero se conoce (control, §sondas 8a) |
>
> **SP-C11 es la que bloquea la construcción**, y con su forma exacta: los dos
> tipos del clon (`TerminoKunakpedia`, `Faq`) **no tienen campo de fecha**, y el
> único con precedente —`entradas-blog.fechaPublicacion`— sale de **otro canal**
> (un `<span>` renderizado que estas 56 páginas no sirven) y guarda **el literal
> español**, no un ISO. O sea: no es «aplicar el precedente», es una decisión de
> ESQUEMA con dos mitades distintas. Ficha: `PENDIENTES-QA.md`
> §F3-LH-ORDEN-DE-L2.

| # | qué | por qué importa |
|---|---|---|
| **SP-C1** | el **clon**: no existe, las dos rutas dan 404 | esta spec es de un lado |
| **SP-C2** | **la mitad de `P-LH-C8`** — que el ancla sea el mismo elemento en los dos lados | sin ella la base de `L2` está verificada a medias |
| **SP-C3** | la **tipografía de la tarjeta** (título del término, su enlace) | `lh-spec` congeló la caja y el ritmo, no el tipo de sus hijos |
| **SP-C4** | **anchos intermedios** | contrato de RANGO, no de fidelidad (§CONTRATO) |
| **SP-C5** | **el ruido** de estas rutas | sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-C6** | la **varianza con n = 2** | dos instancias no separan «plantilla» de «coincidencia»; lo que sólo aparezca en una está SIN PROBAR |
| **SP-C7** | por qué la 3.ª tarjeta de faqs mide **+37** @1440 | medido, **no diagnosticado** — la hipótesis obvia es el wrap del título, sin comprobar |
