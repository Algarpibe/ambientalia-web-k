# RECON DE LISTADOS — ¿las 7 formas que se comen 321 páginas son un arquetipo o varios?

> **2026-07-30. Recon en frío: no se construye nada.** Sale del censo
> (`CENSO-ARQUETIPOS.md`), que dejó la pregunta planteada y sin responder: de las
> 14 formas sin cubrir, **7 son «una plantilla, muchas instancias» y suman 321 de
> las 347 páginas**. Si son un arquetipo, una construcción cubre el 92 % de lo que
> falta. Si son varios, hay que saber cuántos y qué los separa.
>
> **Nota de precisión sobre el nombre.** Se las viene llamando «formas de
> listado», y solo **una** lo es (el archivo de taxonomía). Las otras seis son
> **páginas de detalle**: entrada de blog, caso de éxito, término, documento
> científico, FAQ y artículo de KB. La distinción no es cosmética — un listado y
> un detalle no pueden ser el mismo arquetipo, así que conviene no meterlos en el
> mismo saco por inercia del nombre.

## 1 · PRE-REGISTRO — escrito antes de medir

Se registra ahora por la misma razón que en `EXPERIMENTO-URBANO.md`: escrito
después sería escrito sabiendo qué conviene.

### La hipótesis

> **H1** — Las 7 formas son **un solo arquetipo con 7 instancias**: mismo
> esqueleto (cascarón compartido + una columna de contenido + cola comercial), y
> lo único que cambia es el **modelo de contenido del medio**.

> **H0** — Son **N > 1 arquetipos**: el esqueleto mismo difiere, y la diferencia
> no se absorbe con campos.

### Cómo se contesta: por el ESQUELETO, no por las piezas

Igual que con EDAR y Petróleo. Lo que decidió allí que eran **el mismo**
arquetipo no fue que se parecieran los textos, sino que **la topología de
secciones era la misma medida original contra original**. Aquí se mide lo mismo:

1. **las clases del `<body>`** — WordPress emite ahí el post type y la plantilla
   (`single-post`, `single-case-studies`, `page-template-*`), y Divi añade la
   suya (`et-tb-has-template-…`, `et_pb_pagebuilder_layout`). **Es la medida más
   directa que existe de "¿los renderiza la misma plantilla?"**, y no hay que
   inferirla de la geometría;
2. **la secuencia de secciones de primer nivel** del documento;
3. **si el cuerpo es Divi Builder** (`.et_pb_section` dentro del contenido) **o un
   blob de plantilla de tema** (`.entry-content` y equivalentes);
4. **el cascarón**: cabecera, banda de clientes, breadcrumb, franja del pie;
5. **la cola**: qué hay entre el contenido y el pie.

### Qué hallazgo cambiaría el veredicto — registrado antes de mirar

**H1 se rechaza si aparece cualquiera de estos.** No se añaden criterios después:

| # | hallazgo | por qué mata H1 |
|---|---|---|
| **F1** | dos formas con el cuerpo de **naturaleza distinta**: una compuesta en Divi Builder (`.et_pb_section` propias por instancia) y otra un **blob de plantilla** | no es una diferencia de campos: en una el cuerpo lo compone el editor por página y en la otra lo fija la plantilla. **Es el discriminador que más peso tiene**, y por sí solo basta |
| **F2** | la **secuencia de secciones de primer nivel** difiere entre dos formas | es exactamente lo que se midió para EDAR/Petróleo, y allí *coincidir* fue la prueba de que eran uno |
| **F3** | una forma tiene un **elemento estructural que ninguna otra tiene** y es una sección, no un módulo (barra lateral, caja de autor, índice, rejilla de relacionados) | una sección de más no es un campo opcional: cambia la retícula |
| **F4** | las **clases del `<body>`** revelan plantillas distintas y además (F1/F2/F3) confirman que la diferencia es estructural | por sí solas no bastan —WordPress emite `single-{cpt}` siempre, incluso con plantilla compartida—, pero corroboran |
| **F5** | el **archivo de taxonomía** resulta tener el esqueleto de un detalle | sería la señal de que estoy midiendo mal, no de que sean uno: un listado paginado y un detalle no son la misma forma. **Si sale esto, se descarta la corrida** |

**Y el límite de la muestra, dicho antes:** 2 instancias por forma. Esto es
suficiente para **refutar** que dos formas sean iguales (basta una diferencia
estructural), pero **no** para probar que una forma es una plantilla — la tanda
del monográfico enseñó que 8 propiedades no se ven en la primera página. Por
tanto:

- veredicto **«varios»** → firme, con la frontera medida;
- veredicto **«uno»** → **provisional**, y hay que escribirlo como provisional.

Asimetría deliberada, y es la honesta: refutar es barato, probar es caro.

## 2 · Medida

> Sonda `scripts/qa/esqueleto.mjs` (`npm run qa:esqueleto`), salida congelada en
> `scripts/qa/medidas/esqueleto.json`. Original a 1440×900, DPR 1, perfil limpio,
> Cookiebot bloqueado, lazy→eager + scroll/settle. **16 páginas: 2 por forma + 2
> controles.**

### 2.0 · Los controles, que son el test en negativo de la sonda

Se midieron además **SECTOR y MONOGRÁFICO**, cuyo arquetipo ya conocemos. Sin
ellos no se sabe si la sonda distingue algo o si todo le sale parecido:

| control | `tb-body` | secciones propias | builder |
|---|---|---|---|
| SECTOR (Urbano) | no | **7** | **sí** |
| MONOGRÁFICO (EDAR) | no | **8** | **sí** |

Sale exactamente lo que sabemos que son: páginas del builder con el cuerpo
compuesto por instancia. **La sonda separa.**

### 2.1 · La medida decisiva: de qué plantilla sale cada sección

Divi sufija la clase de cada sección con la plantilla del Theme Builder que la
emite —`et_pb_section_0_tb_body`, `…_tb_footer`— y pone `et-tb-has-body` en el
`<body>` cuando esa forma tiene plantilla de cuerpo. **Responde a la pregunta del
recon directamente, sin inferir nada de la geometría.**

| forma | `et-tb-has-body` | secciones `tb_body` | secciones **propias** | builder | módulo `post_content` | páginas |
|---|---|---|---|---|---|---|
| ENTRADA DE BLOG | **sí** | 2 · 3 | 0 | no | **sí** | 149 |
| TÉRMINO KUNAKPEDIA | **sí** | 2 | 0 | no | **sí** | 37 |
| DOCUMENTO CIENTÍFICO | **sí** | 2 | 0 | no | **sí** | 23 |
| ARCHIVO DE TAXONOMÍA | **sí** | 2 | 0 | no | **no** | 23 |
| CASO DE ÉXITO | **NO** | 0 | 1 | no | no | 57 |
| FAQ SUELTA | **NO** | 0 | **0** | no | no | 19 |
| ARTÍCULO DE KB | sí | 1 | **1** | **SÍ** | sí | 13 |

Y el `#main-content` **no se supuso, se comprobó**: Divi reparte la página en tres
árboles y hay que quedarse con el del medio. En una entrada de blog, `body` tiene
6 secciones, `#et-main-area` 5 y `#main-content` **2** — las del cuerpo. Contar
sobre `body` habría metido cabecera y pie en el esqueleto de las siete formas y
las habría hecho parecer **más iguales de lo que son**.

## 3 · VEREDICTO — H1 rechazada por F1. Son **cuatro** arquetipos

**F1 era el criterio decisivo pre-registrado** —«dos formas con el cuerpo de
naturaleza distinta»— y se cumple tres veces: hay cuerpos de plantilla del Theme
Builder, cuerpos de plantilla de tema sin Divi, y una página compuesta en el
builder. No es una diferencia de campos: en una el cuerpo lo fija la plantilla y
en otra lo compone el editor.

Los cuatro grupos, con lo que los separa:

| grupo | formas | páginas | esqueleto | qué lo separa de los demás |
|---|---|---|---|---|
| **A · DETALLE PLANTILLADO** | blog · término · documento científico | **209** | `tb_body` de 2 secciones: breadcrumb + contenido con módulo `post_content` | — (es el patrón de referencia) |
| **B · LISTADO PLANTILLADO** | archivo de taxonomía | **23** | `tb_body` de 2 secciones, **sin** `post_content` | el medio no es un blob, es **una consulta**: rejilla de 7–9 entradas y paginación |
| **C · DETALLE SIN PLANTILLA DE CUERPO** | caso de éxito · FAQ | **76** | **sin `et-tb-has-body`**; 1 sección propia (caso) o **ninguna** (FAQ) | el cuerpo lo emite la **plantilla del tema**, no Divi. Y el **pie es otro**: `tb_footer` 4 en caso de éxito frente a 3 en todo lo demás |
| **D · PÁGINA DEL BUILDER** | artículo de KB | **13** | `page-template-default` + `et_pb_pagebuilder_layout`, 1 sección propia + barra lateral de contenido | **lo compone el editor**, como SECTOR y MONOGRÁFICO |

**321 páginas = 209 + 23 + 76 + 13.** Cuadra.

### La respuesta a la pregunta, en una línea

**No es uno, y tampoco son siete: son cuatro** — y el mayor cubre **209 de 321
páginas (65 %) con un solo esqueleto**, tres formas que coinciden en las seis
medidas. Esa parte de la intuición era buena.

Y si se admite que A y B son el mismo esqueleto con el medio en dos modos —blob o
consulta, que es literalmente la diferencia medida—, **A + B = 232 páginas (72 %)
con una construcción y dos modelos de contenido.** Eso es una decisión de
modelado, no una medida, así que se deja planteada y no resuelta.

### Lo que el veredicto es y lo que NO es

Por el §1, **«varios» es firme**: basta una diferencia estructural para refutar la
igualdad, y hay tres. Pero **la composición interna de cada grupo es
provisional**: 2 instancias por forma no prueban una plantilla, y la tanda del
monográfico enseñó que 8 propiedades no se ven en la primera página. En concreto:

- que las 3 formas de A compartan esqueleto está medido en 6 páginas, no en 209;
- ya se ve **variación intra-forma**: una entrada de blog tiene 2 secciones
  `tb_body` y otra **3** —la tercera es un «También te puede interesar»—, lo cual
  por el test B de `CLAUDE.md` es **un campo** (bloque de relacionados opcional),
  el mismo patrón que `flujo` en SECTOR. Con dos instancias no se sabe si hay
  más.

### F5 no se disparó

El archivo de taxonomía salió con esqueleto de **listado** —sin `post_content`,
con paginación y 7–9 entradas—, no de detalle. La corrida vale.

### Una pista que no se persigue aquí

**El artículo de KB (grupo D) es una página del builder**, igual que SECTOR y
MONOGRÁFICO. O sea que **no pertenece a la familia editorial**: es del tipo que ya
sabemos construir, y su cuerpo —árbol de Divi compuesto por el editor— es
exactamente lo que `MonoSeccion[]` modela.

Si el modelo del monográfico lo expresa, esas 13 páginas no cuestan un arquetipo
nuevo. **Es una hipótesis, no un hallazgo**, y se prueba como se probó la otra:
con un experimento pre-registrado de umbral cero, no de oído. Queda anotada y
**no** se toca nada por ella.

### Un aviso sobre la sonda, que es parte del resultado

`esqueleto.mjs` nació con **ocho booleanos de «elementos propios» y cuatro
mentían**: `barraLateral` daba `sí` en las nueve páginas (cazaba el área de
widgets del **pie**), `sliderAncho` daba `no` en el control SECTOR —cuya S5 es
literalmente `[fullwidth_slider_,slide]`—, `relacionados` daba `no` en la entrada
de blog que lleva un «También te puede interesar», y `fecha` daba `no` en un post
que muestra «24 mayo 2019».

Se quitaron en vez de parchearlos, porque **el inventario de módulos por sección
ya los decía bien**: el atajo daba 4 de 8 valores equivocados y el camino largo
daba los 8 bien. Es el caso de `CLAUDE.md` §«Dos reglas sobre las sondas mismas»
cazado en la sonda de esta misma corrida — y la razón de que el veredicto se
apoye en `et-tb-has-body` y en los sufijos `_tb_`, que son inequívocos, y no en
booleanos de conveniencia.

## 4 · El par listado→detalle: cuánto hay ya construido

Para las dos formas más numerosas —**caso de éxito (57)** y **entrada de blog
(149)**, 206 páginas entre las dos—, el clon ya pinta la mitad del par.

### Lo que existe

| | modelo | campos | dónde | instancias |
|---|---|---|---|---|
| tarjeta de caso | `CaseStudy` | `client · sector · sectorHref? · title · image · href` | `src/types/kunak.ts` | **3** en `src/lib/projects.ts` |
| tarjeta de artículo | `BlogPost` | `title · date · image · href · excerpt?` | idem | **3** en `src/lib/articles.ts` |

Y los componentes que las pintan —`UltimosProyectos`, `UltimosArticulos`— están
construidos, verificados y reutilizados en 6 páginas.

### Lo que falta, y es más de lo que parece

Los dos modelos son **la proyección de teaser** del content type, no el content
type. Tienen lo que necesita un listado y **nada** de lo que necesita un detalle:

| falta | por qué importa |
|---|---|
| **el cuerpo** | en el grupo C (caso de éxito) es un blob de plantilla de tema; en el A (blog) es el módulo `post_content` de un `tb_body`. En los dos casos es el campo principal y no existe |
| **el slug** | los modelos guardan un `href` **absoluto al original**, no un slug. No hay de dónde sacar la ruta local |
| **taxonomía** | el `<body>` de una entrada de blog trae `tax-resource`: las entradas están clasificadas, y de eso viven los 23 archivos del grupo B |
| **SEO por instancia** | `title`/`description`/`canonical`/`ogImage`, que los 7 arquetipos existentes sí tienen |
| **el pie propio del caso de éxito** | `tb_footer` 4 frente a 3: una sección de CTA que el pie actual del clon no monta |

Y la cobertura de instancias es **3 de 149** (2 %) y **3 de 57** (5 %): los datos
están escritos a mano para que el listado tenga qué pintar, no importados.

### La consecuencia que llega sola

**El día que exista el arquetipo de detalle, los 6 `href` de esas tarjetas pasan a
ser fallo de `enlaces.mjs` sin tocar la sonda** — la regla se deriva del
`prerender-manifest`. Es el mismo mecanismo que convirtió 22 enlaces en fallo
cuando el monográfico emitió sus rutas. Conviene saberlo antes, no descubrirlo.

## 5 · NOTAS DE ESQUEMA PARA EL CMS

**No son pendientes de QA.** No hay nada que arreglar en el clon: son dos
decisiones de modelado que el censo destapó y que **hay que tomar antes de
modelar**, porque después cuestan una migración.

### CMS-1 · El caso de éxito es un arquetipo con DOS patrones de ruta

53 casos viven en `/es/casos-de-exito/…` y **4 en `/es/case-studies/…`**:

```
case-studies/distrito-baja-emision-rio-de-janeiro
case-studies/monitoreo-ambiental-en-el-puerto-de-cotonu
case-studies/monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario
case-studies/monitorizacion-calidad-aire-planta-fertilizantes-lifeco
```

Está así en el sitemap del original, no es una errata de transcripción. Y encaja
con lo que ya estaba anotado en `sectores.ts`: el CTA «Ver todos los casos de
éxito» apunta a `https://kunakair.com/case-studies/`, **sin `/es/`**.

**La decisión, que es de esquema y no de maquetación:** un content type cuyo
`slug` no determina su ruta necesita **el prefijo como campo**, o una tabla de
excepciones. Las dos opciones son legítimas; lo que no vale es descubrirlo con
las 57 fichas ya cargadas. Y en el clon significa que la ruta dinámica del futuro
arquetipo **no es un patrón, son dos** — con `enlaces.mjs` exigiéndolo en cuanto
se emitan.

### CMS-2 · Los 37 términos de Kunakpedia cuelgan de la raíz de `/es/`

Sin prefijo: `/es/sensor-calidad-aire`, `/es/redes-de-vigilancia-de-calidad-del-aire`,
`/es/glosario`. **Al mismo nivel que `contacto`, `empresa` o `productos`.**

**Es una colisión de espacio de nombres en cualquier CMS**, y hay que decidirla
antes de modelar:

- en WordPress funciona porque un CPT con `rewrite.with_front=false` y sin `slug`
  comparte el espacio de las páginas, y quien crea una página llamada
  `sensor-calidad-aire` **rompe el término** (o al revés) sin que nada avise;
- en cualquier CMS con rutas declaradas, un `[slug]` a nivel raíz **captura todo
  lo que no haya casado antes**, así que el orden de resolución deja de ser un
  detalle y pasa a ser parte del contrato;
- y en el clon: una ruta dinámica `/[slug]` en la raíz de `app/` competiría con
  **todas** las páginas ya emitidas.

**Las tres salidas, para decidir y no improvisar:** (a) replicar la colisión y
resolver por orden explícito, con una guarda que falle si un slug de término
coincide con una página; (b) darle prefijo en el CMS (`/glosario/<slug>`) y
aceptar que se desvía del original — desviación deliberada, a `PENDIENTES-QA.md`
con su razón; (c) modelar los términos como páginas de un tipo, no como CPT
aparte. **Este recon no elige**: deja la decisión escrita y con sus consecuencias
medidas, que es lo que faltaba.

**Y la colisión es MUCHO mayor que los 37 términos.** Contados los slugs de un
solo nivel bajo `/es/`, sin ningún prefijo:

| familia | slugs en la raíz de `/es/` |
|---|---|
| `post` (entradas de blog + `blog`) | **150** |
| `glossary` (términos + `glosario`) | **38** |
| `page` | 7 — `sectores` · `suscribete` · `contacto` · `recursos` · `casos-de-exito` · `empresa` · `productos` |
| `solutions` | 6 — `accesorios` · `monitor-calidad-aire` · `kunak-api` · `software-…` · `sensor-…` · `estacion-…` |
| `case-studies` · `faqs` | 1 cada uno (sus índices) |
| **total, sin repetir** | **202** |

O sea: **202 slugs de cinco familias distintas comparten un único espacio de
nombres plano**, y ahí dentro están las cuatro páginas que el clon ya sirve como
rutas propias (`/accesorios`, `/monitor-calidad-aire`, `/kunak-api`,
`/software-de-medicion-calidad-del-aire`). No es un detalle del glosario: es la
forma del árbol de URLs del sitio entero, y cualquier `[slug]` a nivel raíz
captura las cinco familias a la vez.

Consecuencia inmediata y verificable: la guarda que pide la salida (a) no es
opcional. Con 202 slugs en un plano y cinco fuentes que pueden crear uno, **la
colisión no es hipotética, es cuestión de tiempo** — y hoy no hay nada que la
detecte.
