# SPEC · el ÍNDICE DE CASOS (`L5`, `/es/casos-de-exito/`) — plantilla PHP propia

> **2026-08-11.** Redactada **desde lo congelado**: `medidas/lh-spec-{1440,390}.json`
> · `medidas/lh-barra.json` · `medidas/lh-ancla.json` · `medidas/lh-serie.json`.
>
> ⚠ **`L5` NO es un arquetipo nuevo** (`D1`): es **la página índice que le
> faltaba al grupo C**, sobre la colección `casos` ya modelada. Esta spec
> describe su plantilla, no un content type.
>
> **Alcance: 1 instancia — es que sólo hay una.** A diferencia de `L4`, aquí n=1
> no es una limitación del muestreo: es la población.

---

## ⚠ QUÉ CONTESTA ESTA SPEC Y QUÉ **NO** — escrito antes de construir (2026-08-17, 73.ª tanda)

**Por qué esto está aquí:** §*una regla INCOMPLETA se lee exactamente igual que
una completa*. Una medida contesta las preguntas que se le hicieron y **su
fichero no lleva escrito cuáles NO**. Lo de abajo se derivó hoy del espejo de
PÁGINAS (`medidas/lh-espejo-{1440,390}.json`).

### Lo que la spec YA contesta, y sigue en pie

Régimen (`page-template-case-studies`, sin builder y sin `tb_body`) · las **6**
secciones con **`tb_footer` 4** · que la 4.ª es la banda CTA **del grupo C** y el
clon ya la construye (`CtaInmerso`) · que n=1 es la población, no la muestra.

### Lo que la spec NO contesta — y hoy sí está medido

| pregunta que nadie le hizo | derivado del espejo de páginas |
|---|---|
| **¿pagina?** | **NO.** `/es/casos-de-exito/` sirve **las 57 tarjetas en UNA página**, y **no pinta paginador** |
| **¿y `/casos-de-exito/page/2`?** | **no es una ruta**: es `D2.4·duplicado` —canonical a la 1.ª—, y es una de las **2** que colaban por el filtro de contenido. **No se construye** |
| **¿cuántas FILAS tiene el cuerpo?** | **1**, a los dos anchos |
| **¿qué hay entre el `h1` y el listado?** | **banda de filtros: 12 botones**, etiqueta `<button>`, **título «Sectores»**, y **210.6 px**. `qa:lh-huecos` la marca `enLaSpec: false` |
| **el contenedor del listado** | `div.case-list-content`, **w 1192** |
| **la base del cascarón** | `contenedorTema.y` **458.09** @1440 · **473.08** @390 |

> ⚠ **`L5` es la ÚNICA forma cuya base BAJA al estrechar** (458.09 → 473.08; en
> `L3` va 225 → 136.58). No es una anomalía a corregir: es su cascarón propio, el
> del grupo C. **Calibrarla contra la base de las otras formas la rompe a 390.**

### ✅ CONSTRUIDA (2026-08-18, 82.ª tanda) — y lo que la spec NO decía costó tres arreglos

`L5` está construida y verificada a los dos anchos: **76 de 818 pares**, base
`h1` **−0.01 @1440** y **0 @390**, con los **20** caminos restantes todos con
causa nombrada. Acta: `PENDIENTES-QA.md` §F3-LH-L5.

**Lo que esta spec midió salió bien.** Lo que costó fueron **tres cosas que
ninguna de sus tablas nombra**, y las tres se sacaron del canal SIN RECORTAR
(`corpus/fase-3/listados/casos-de-exito/index.html`) o de la hoja del tema:

| lo que faltaba | dónde estaba | coste |
|---|---|---|
| `span.case-sectores` tiene **tres** formas según el cardinal (0 · «Sector: » · «Sectores: ») | las 57 tarjetas del canal sin recortar — **el espejo congela 3, y las 3 tienen un sector** | habría emitido «Sector: » en las 57 |
| el original **esconde «Ver todos»** (`.button:first-child.is-checked{display:none}`) | la hoja del tema, **al lado** de la regla que sí se copió | **+5.00 px** de banda |
| `.sobretitulo` y `.case-cliente` heredan **30.6px como LONGITUD**, no una ratio | el `<style>` servido: `body{line-height:1.7em}` | **−5.09** de base y **−3.41** de tarjeta |

> ⚠⚠ **Y los dos últimos se anulaban entre sí en el sitio donde uno miraría.**
> `lista.y` daba **857.77** contra **857.88**, o sea **−0.11**, que parece
> limpio. Dentro había **−5.09 y +5.00**. Lo destapó el **`h1`**, que está por
> encima de la banda y no podía absorberlo. Es §*un Δ de cero puede ser dos
> errores que se anulan* — y la salida fue medir **por composición** la cadena
> entera, no leer el total.

**Sigue sin medir, y va con su número:** los **internos** de la banda de filtros
—alto del `h2`, alto de `#filters`, paso de fila— que esta spec nunca pidió y sin
los cuales el **+4.99** restante no se puede atribuir
(§F3-LH-BANDA-FILTROS-SIN-INTERNOS).

### ⛔⛔ Y LA PREGUNTA QUE NADIE LE HIZO A ESTA SPEC, Y QUE PARÓ LA CONSTRUCCIÓN (2026-08-18, 80.ª tanda — RESUELTA en la 81.ª/82.ª)

**`L5` NO se construyó en la 80.ª tanda, y el motivo no está en ninguna de las
listas de arriba: `¿EN QUÉ ORDEN VAN LAS 57 TARJETAS?`**

Esta spec mide la retícula, la caja, el pie, la cabecera y hasta que **no
pagina** — y da por hecho el orden, que es lo único que la plantilla no puede
inventar. Es §*una regla INCOMPLETA se lee exactamente igual que una completa*,
cobrada por segunda vez en esta familia de specs.

| candidato | ¿está en el modelo `casos`? | reproduce el orden servido |
|---|---|---|
| **`datePublished`** (JSON-LD del singular) | ⛔ **NO** | **57 / 57** |
| `detalles.anyo` | sí | no (`2026 · 2025 · 2026 · 2026`…) |
| orden de la colección | sí | no |
| carpeta `uploads/AAAA/MM` de `imagenCabecera` | sí | **30 / 57** |
| ID de WordPress DESC | no (irreproducible por diseño) | no |

> **La clave existe y está SERVIDA en los 57 singulares. Lo que falta es el
> CAMPO**, y añadirlo es una decisión de esquema con migración y re-siembra.
> Ficha: `PENDIENTES-QA.md` §F3-LH-ORDEN-DE-L5-SIN-MODELAR · alcance:
> `ESQUEMA-CMS.md` §7g.

**Y por qué no se construyó «con el orden que salga»:** esta forma tiene **una
sola página** y el espejo congela **sus 3 primeras tarjetas**. Con otro orden
serían **otras tres**, y el comparador sacaría decenas de pares rojos de eje
`contenido` que **no son defecto de plantilla**. Desde ahí, el camino de menor
resistencia es cablear el orden para que cuadren las 3 que el espejo mira.

**Lo que sí queda hecho de `L5` en esa tanda**, para que la siguiente no lo
rehaga: el **cascarón está construido y compartido** con `L3`
(`components/listados/PaginaTema.tsx`, `variante="casos"`), con su envoltorio
`.hentry`, su `padding-top: 50px`, su `BANDA.indiceCasos` (458.09 / 473.08), su
punteado y el hueco para la 4.ª sección de pie. Falta **la consulta, la tarjeta
y la banda de 12 botones**.

### Lo que sigue SIN contestar, y hay que decirlo

- **el filtro por sector NO se construye** — desviación ya declarada: `sector` se
  decide en **F3-4** (§LH-C6-FILTRO-L5). Los **12 botones** entran como banda
  **inerte**, y eso se escribe en el registro, no se calla;
- **n = 1 no puede separar plantilla de campo.** Todo lo de arriba es *lo que
  hace esta página*; que sea plantilla de una familia **no lo puede decir esta
  medida**, porque no hay segunda instancia. Si algún día hay otra, se re-mide;
- ⚠ **no lleva override móvil** — `qa:lh-pieles-css`: **cero** overrides móviles
  de titular en `L2`/`L3`/`L5`. Construirle uno cuadraría a 1440 y sería falso.

---

## 0 · El régimen y el esqueleto

| | medido |
|---|---|
| `et_pb_pagebuilder_layout` · `et-tb-has-body` | **no** · **no** |
| clases del `<body>` | `wp-singular page-template **page-template-case-studies** page-template-case-studies-php` |
| secciones | **6** = `tb_header 1` + `propia 1` + **`tb_footer 4`** |

> ⚠⚠ **`L5` sirve CUATRO secciones de pie, y las otras cuatro formas sirven
> TRES.** Medido a los dos anchos. Es varianza **en el cascarón**, que es
> justamente donde el arquetipo A midió varianza cero — así que **no se puede dar
> el pie por común** al construir.
>
> ✅ **DIAGNOSTICADO 2026-08-12 desde lo congelado (PASO 1 de la 56.ª tanda).**
> La 4.ª sección es la **banda CTA del pie** — un `et_pb_fullwidth_slider` con
> tres diapositivas por idioma (`ocultar-en/es/fr`, sólo la ES visible):
> «¿Necesitas información fiable para tu proyecto de calidad del aire?» +
> «Podemos ayudarte» — servida **delante** de `footer-links`, que pasa a índice 1.
> **No es una rareza de `L5`: es el pie de la FAMILIA CASOS.** Derivado del
> corpus, no supuesto: los singulares del grupo C sirven **las mismas 4
> secciones en el mismo orden** (`corpus/casos/*.html`, 3 verificados + índice +
> `page/2`), y el resto del sitio —blog singular, producto, sector, y los 12
> listados capturados— sirve 3. El clon **ya construye esta banda**
> (`CtaInmerso`, plantilla del grupo C): para `L5` el pie es **el del grupo C**,
> no el de los listados.
>
> Y de camino, la segunda varianza del pie, censada en las 13 capturas de
> listados + 4 familias singulares: **`footer-background` pierde
> `et_pb_with_background` exactamente en las páginas de ARCHIVO** (L1-blog,
> etiqueta ×2, glosario, faqs, resources hijo/padre ×4, sci ×2 — 13/13 sin) y lo
> lleva todo lo que no es archivo (L4, L5 ×2, singulares de blog/producto/
> sector/casos — 0 excepciones). El discriminador sobrevive al cruce: blog
> singular es plantillado y lleva fondo, así que no es builder-vs-plantilla —
> es **archivo-vs-no**. Cada forma lleva su pie MEDIDO, no el compartido.

**Y su plantilla se llama en el marcado**: `page-template-case-studies-php`. No
hay que inferir que es PHP propia — el `<body>` lo dice.

## 1 · La base — y la cabecera es **el doble** que en el resto

| | @1440 | @390 |
|---|---|---|
| `h1.y` **en crudo** | **593.28** | **608.27** |
| **cabecera (`h`)** | **458.09** | **473.08** |
| cabecera en `L2` · `L3` | 225 | 136.58 |
| `h1` | **Manrope 44px / 44px · 300 · `#333`** | ídem, **1 renglón** |
| texto | «Casos de éxito» | ídem |

> ⚠ **+233.09 de cabecera a 1440 y +336.5 a 390** frente a `L2`/`L3`. La
> cabecera de `L5` **no es la misma banda**. Con `D4a` delante, el `h1` («Casos
> de éxito») es un **titular de índice**, o sea **dato de la página**, no
> derivado de ningún término.
>
> ✅ **DIAGNOSTICADO 2026-08-12 desde lo servido.** El `header.et-l--header` de
> `L5` lleva una **TERCERA fila** (`et_pb_row_2_tb_header`, columna `4_4`) con un
> módulo de texto centrado: *«Más información sobre nuestros proyectos más
> interesantes»*. Esa fila es **exclusiva de las páginas del índice** — está en
> las 2 instancias de `L5` (índice y `page/2`) y en **ninguna** otra captura:
> 0 de 12 listados, 0 de 3 singulares de casos mirados. O sea que la plantilla
> de cabecera del theme builder que recibe `/casos-de-exito/` trae la banda; el
> resto del sitio recibe la de 2 filas. El +233.09 ES esa fila (458.09 − 225).
>
> **Y la base que SUBE al estrechar cae con el mismo diagnóstico, por
> composición desde lo congelado:** `h1.y − cabecera.h` = **135.19 px a los DOS
> anchos** (593.28−458.09 = 608.27−473.08) — todo lo que hay entre cabecera y
> `h1` es invariante al ancho, así que la subida de la base (+14.99) **es
> enteramente la subida de la cabecera**. La cabecera base encoge a 390 como en
> todas las formas (225→136.58, −88.42) y la fila extra **crece** de 233.09 a
> 336.5 (+103.41: el texto envuelve y su ritmo es relativo); el neto es +14.99.
> Lo que lo congelado NO puede exhibir es el reparto interno de la fila
> (padding/tipografía viven en la hoja externa et-cache, que la captura no
> trae): **los números de la fila son la MEDIDA y se replican como tal.**

## 2 · La retícula — **3 columnas y 57 tarjetas sin paginar**

| | @1440 | @390 |
|---|---|---|
| vía | **`loop-del-tema`** | ídem |
| tarjetas servidas | **57** | **57** |
| columnas | **3** | **1** |
| ancho de tarjeta | **357.28** | **312** |
| `margin-right` / `margin-bottom` | 40 / 40 | 0 / 32 |
| `x` de las 3 primeras | 144 · 541.27 · 938.55 | 39 |
| `docH` | **10 721** | **27 607** |

`3 × 357.28 + 2 × 40 = 1151.84` — la rejilla llena una caja de ~1152, **igual que
`L3`** y distinta de la fila propia de la miga, que mide **1238.39**. O sea que
`L5` tiene **dos contenedores**: 1238.39 para el cascarón y ~1152 para el listado.

**Altura de tarjeta: variable** (418.5 · 391.5 · 449.09 @1440) — la pone el
contenido, como en `L2`.

> **Las 57 en una sola página es fidelidad, no un descuido** (`D5.5`): es el
> comportamiento servido del original, y paginarlas sería la desviación.

## 3 · El paginador — **no hay, y no debe haberlo**

`presente: false`, `piel: ninguna`, **sin `<link rel=next>`**. Coherente con las
57 en una página. `lh-serie` lo confirma desde el otro lado: la serie
`/casos-de-exito` tiene **2 documentos** y los dos sin barra ni paginación real.

## 4 · La barra lateral — **no la tiene**

`lh-barra`, población entera: `L5-casos` **0 de 2** documentos con barra y **0**
con columna `3_4`. La retícula de `L5` es de ancho completo.

Y `qa:hover-zonal` ya lo había dicho por el canal del CSS: la regla de zoom de
`L5` es **de otra familia** —`.case-list-content article .case-imagen:hover`, que
amplía **el propio `<a>`** porque la tarjeta de caso no tiene `<img>`— mientras
`L1` y `L4` comparten `.et_pb_post .entry-featured-image-url:hover img`. **`L5`
no comparte el módulo de Divi**, que es exactamente lo que `D1` afirma.

## 5 · ⛔ Lo que `L5` NO puede entregar en F3-2, y está decidido

**El filtro de 12 botones por sector** (§LH-C6-FILTRO-L5): 57 → 3 tarjetas sin
recargar ni cambiar la URL. **Consume la relación `sector`**, que `D3` dejó fuera
del modelo del caso *«hasta que un listado la consuma»* — y la consume.

> **`sector` se decide en F3-4**, así que **F3-2 construye `L5` SIN su filtro**.
> Es una **desviación deliberada** y se anota como tal en la tanda que construya,
> igual que `D2.4` con los 7 sin paginación real. La entrega hay que leerla
> **«L5 menos el filtro»** (`PLAN-FASE-3.md` §F3-2).

## 6 · Lo que esta spec NO mide

> ⚠⚠ **`SP-K7` · LA GEOMETRÍA DEL FILTRO NO ES OPCIONAL, aunque su
> COMPORTAMIENTO sí lo sea (2026-08-14, 69.ª tanda).**
>
> §5 decide, con razón, que **F3-2 construye `L5` sin su filtro** porque el
> filtrado consume la relación `sector`, que se decide en F3-4. Y `SP-K3` dice
> que el filtro se midió *«como comportamiento, no como geometría»*. Las dos
> frases son ciertas y **juntas invitan a la lectura equivocada**: que la banda
> se puede omitir.
>
> **No se puede.** El original la sirve entre el `h1` y el listado —
>
> ```html
> <div class="case-filter">
>   <h2 class="case-filter-title">Sectores</h2>
>   <div id="filters" class="button-group">
>     <button class="button is-checked" data-filter="*">Ver todos</button>
>     <button class="button" data-filter=".sector-edar">EDAR / PTAR</button>
>     … 11 más
>   </div>
> </div>
> ```
>
> — y §1 congela `h1.y = 593.28` mientras §2 congela el listado en `y = 857.88`:
> **264.6 px** que esta prosa deja sin dueño. Omitir la banda **sube el listado
> esos 264.6 y descuadra las 57 tarjetas**.
>
> > **La desviación declarada es «sin FILTRADO», no «sin BANDA».** Son dos
> > cosas: la banda es geometría y sus 12 rótulos ya están en el clon
> > (`TERMINOS_SECTOR`, 11 términos + «Ver todos»); lo que falta es la relación
> > caso→sector que decide qué tarjeta se esconde. Construir la banda inerte es
> > fidelidad; omitirla es un defecto de 264.6 px con una desviación por coartada.
>
> Derivado en `medidas/lh-huecos.json` (`npm run qa:lh-huecos`, negativo 4/4):
> **12 botones**, etiqueta `<button>` (en `L3` son `<a>`), con `h2.case-filter-title`
> que `L3` no tiene.

| # | qué | por qué importa |
|---|---|---|
| **SP-K1** | el **clon**: no existe | esta spec es de un lado |
| **SP-K2** | las **54 tarjetas** que no son las 3 primeras | se congelaron 3 de 57; la varianza de altura dentro de la rejilla está SIN MEDIR |
| **SP-K3** | el **filtro** de 12 botones — su marcado, su estado inicial y su efecto en el alto | medido como comportamiento (`P-LH-C6`), **no como geometría** |
| **SP-K4** | **anchos intermedios** y **el ruido** | contrato de RANGO · sin campaña, un residuo pequeño es SIN PROBAR |
| **SP-K5** | ✅ **DIAGNOSTICADO 2026-08-12** (§0 y §1): pie = familia CASOS con banda CTA; cabecera = 3.ª fila exclusiva del índice; base que sube = la cabecera, por composición (135.19 invariante). **Queda sin exhibir**: el reparto interno de la fila extra (hoja externa) — los números se replican como medida |
| **SP-K6** | la **relación `post_tag`** que las clases del `<article>` revelan (`tag-cov`, `tag-h2s-es`, `tag-malos-olores`) | `D3` la anotó como dato y **no la añadió al modelo** hasta que un listado la consuma; este listado **no** la consume — el que la consume es el filtro, y ése usa `sector` |
