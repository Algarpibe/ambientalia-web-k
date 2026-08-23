# kunak-web-clone

## Qué es esto

Clon fiel de **https://kunakair.com/es/** (WordPress + Divi) reconstruido en
Next.js. El objetivo **no** es tener una copia bonita: es levantar una
**biblioteca de arquetipos de página** que después se traslada a un CMS. Cada
página clonada aporta un arquetipo (HOME, PRODUCTO, CATÁLOGO,
SOFTWARE/PLATAFORMA…) con su plantilla y su modelo de contenido ya separados.

De ahí salen las dos consecuencias que gobiernan todo el repo:

1. **Fidelidad al píxel sobre criterio propio.** Los textos van *verbatim*,
   erratas incluidas (ver la cabecera de `src/lib/software.ts`). Las
   desviaciones deliberadas se anotan en `docs/PENDIENTES-QA.md`, no se
   improvisan.
2. **Estructura y contenido nunca se mezclan.** Es lo que hace que el arquetipo
   sea trasladable a un CMS.

Stack: Next.js 16 (App Router, `output: standalone`), React 19, Tailwind v4,
TypeScript. Node 24 (`.nvmrc`). Swiper para carruseles.

## Arquitectura

| Capa | Dónde | Qué es |
|---|---|---|
| **Estructura** | `src/components/**/*.tsx` | La plantilla del arquetipo. Maquetación, estados, interacción. Sin textos de negocio incrustados. |
| **Contenido** | `src/lib/*.ts` | Los datos de cada página. Es el **content type** del futuro CMS, escrito como constantes tipadas. |
| **Tipos** | `src/types/kunak.ts` | Interfaces compartidas del modelo (`Product`, `BlogPost`, `CaseStudy`, `Benefit`, `AccesorioItem`…). |
| **Ensamblaje** | `src/app/<ruta>/page.tsx` | Importa componentes + datos, define `metadata` y el orden de secciones. |
| **Tokens** | `src/app/globals.css` | Colores, tipografía, espaciado y keyframes extraídos del original. |
| **Assets** | `public/` (`images`, `fonts`, `videos`, `seo`) | Descargados con `scripts/download-assets.mjs`. Nunca se enlaza a kunakair.com en caliente. |

Componentes compartidos en la raíz de `src/components/`; los específicos de una
página en su subcarpeta (`monitor/`, `software/`, `api/`). **Cuando un
componente de página se reutiliza en una segunda página, se extrae a la raíz**
— así se hizo con `BlurbsIconos` (commit `1d79be2`), verificando A/B que la
página original no sufre regresión.

Cada `page.tsx` y cada `src/lib/*.ts` llevan una cabecera que enlaza su recon y
sus specs. Mantén esa costumbre: es lo que hace navegable el trabajo previo.

## Estructura que en realidad es contenido

**El patrón más caro del proyecto, y el que más condiciona el esquema del CMS.**

La regla 2 dice que estructura y contenido no se mezclan. La trampa es que
**parte de lo que parece estructura es contenido modelado**: lo escribe quien
edita la página en WordPress, cambia de una instancia a otra del mismo
arquetipo, y por tanto **tiene que ser un campo, no una clase de Tailwind**.

Cuando una segunda instancia de un arquetipo no cuadra, la pregunta correcta no
es *"¿qué CSS le falta al componente?"* sino **"¿esto lo decidió quien maquetó
la plantilla, o quien editó esta página?"**. Si lo decidió quien editó, es un
campo. Tratarlo como CSS produce **arreglos falsos**: cablear el valor de la
primera instancia, que sigue funcionando hasta que llega la tercera.

Tres instancias, las tres del arquetipo SECTOR, las tres descubiertas al poblar
el segundo sector (Industria) sobre una plantilla calibrada con el primero:

| Parecía | Era | Campo |
|---|---|---|
| Dos diseños distintos del bloque de descarga | El shortcode `calls` tiene **dos pieles** y el editor elige | `variante: "foto" \| "fondo"` |
| El ritmo vertical entre bloques del cuerpo | En Divi son **secciones con filas dentro**, y el editor decide en cuál cae cada bloque | `flujo: "seccion" \| "seccionRasa" \| "fila" \| "filaPegada"` |
| Un párrafo de entrada del bloque de listas | Un módulo de texto que en el original **cuelga de la fila anterior** | pendiente (§S9a de `PENDIENTES-QA.md`) |
| Que un titular ocupe su columna | El editor le pone **ancho de módulo**: 70 · 80 · 90 · 100 % | `anchoPct` |
| La interlínea del cuerpo | Un ajuste **por módulo**: 30.6 · 36 · 45 | `lh` |
| Negrita como adorno | 56 `<strong>` **en medio de la frase**, que cambian dónde envuelve | `MonoInline` |

La segunda costaba +42.8 en el CTA de Industria y ~+70 de ahí al pie, y se
intentó primero como retoque de `padding`. No lo era.

### Cómo se decide si algo es plantilla o campo: dos tests, cada uno con su alcance

No es un discriminador, son **dos**, y confundir sus alcances da respuestas
**invertidas**. Se aplican en este orden.

**Test A — el de Divi (los dos anchos).** Del recon del monográfico
(2026-07-29, `docs/research/monografico-tecnico/`), medido en 19 filas, 6
secciones y ~60 módulos sin una excepción:

> **Lo que el editor NO toca es responsive (un % del padre); lo que toca queda
> en px absolutos, iguales a 1440 y a 390.**

Se mide a dos anchos y se mira si el número se mueve. Se mueve → lo pone la
plantilla, vive en el componente. Igual a 1440 y a 390 → lo escribió una persona
en el builder, **es un campo**. Defaults medidos: sección `pt/pb` 4%
(57.5938/50) · fila `pt/pb` 2% (28.7969/30) · módulo `mb` 2.75% (34.0469/30).

> ⚠⚠ **LOS TRES DEFAULTS DE ARRIBA SON PORCENTAJES SIN DECIR DE QUÉ, Y ESO LOS
> CONVIERTE EN CONSTANTES EN CUANTO SE LEEN (corregido 2026-08-10, F3-1 PASO 6).**
> `57.5938 · 28.7969 · 34.0469` son los valores **de una página cuyo contenedor
> mide 1440 y cuya fila mide 1238.39**. En cuanto un arquetipo mete su contenido
> **dentro de una columna**, los tres cambian y ninguno da error:
>
> | default | contra 1440 / fila 1238.39 | **contra la columna 911.75 de KB** |
> |---|---|---|
> | sección `pt/pb` 4 % | 57.5938 | **36.4688** |
> | fila `pt/pb` 2 % | 28.7969 | **18.2344** |
> | módulo `mb` 2.75 % | 34.0469 | **25.0625** |
>
> **Escribir los de la izquierda en el comparador de `articulos-kb` daría «no es
> el default» a TODOS los defaults, y de ahí saldrían ~30 campos inventados.** El
> porcentaje se resuelve contra el contenedor **medido**, no contra 1440.
>
> **Y el de `mb` tiene además una excepción con número, que es la que enseña.**
> La spec de KB concluyó *«el default de `mb` es una función del TIPO DE
> COLUMNA»* (34.0469 en `4_4`, 25.0625 en estrechas) — correcto en KB, donde
> **todas las filas miden 911.75** y tipo de columna y ancho de fila están
> confundidos. Derivado contra un **segundo** arquetipo
> (`medidas/mono-modulos-{1440,390}.json`, filas de 1238.39) la confusión se
> deshace y el enunciado se **invierte fuera de KB**:
>
> | arquetipo | fila | columna | `mb` por defecto @1440 | n |
> |---|---|---|---|---|
> | SECTOR/MONOGRÁFICO | 1238.39 | **estrechas** (`1_2·1_3·1_4·2_3·3_4·3_5`) | **34.0469** | 35 |
> | SECTOR/MONOGRÁFICO | 1238.39 | `4_4` | **34.0469** | 11 |
> | `articulos-kb` | 911.75 | **estrechas** (`1_2·1_3·2_3`) | **25.0625** | 13 |
> | `articulos-kb` | 911.75 | `4_4` | **34.0469** | 59 |
>
> > **La variable que manda es el ANCHO DE LA FILA, no el tipo de columna.** Un
> > `1_2` de **585.13** en fila de 1238.39 lleva **34.0469**; un `2_3` de
> > **591.11** —casi el mismo ancho de columna— en fila de 911.75 lleva
> > **25.0625**. Aplicar la regla del tipo de columna fuera de KB pondría
> > 25.0625 donde hay 34.0469 medido en 35 módulos.
>
> **La excepción `4_4` de KB queda SIN PROBAR**: por qué una `4_4` de una fila de
> 911.75 resuelve su 2.75 % contra 1238.39 no se ha medido. Se replica el número,
> no se explica el mecanismo. Implementación con su tabla y su `throw`:
> `mbPorDefecto()` en `packages/cms-config/src/defaults.ts`.
>
> **Y la moraleja general, que vale para cualquier default futuro:**
>
> > **Un default expresado como porcentaje se lee como constante en cuanto se
> > cita, porque el px es lo que se puede comparar y el contenedor no viaja con
> > él.** Un default de ritmo se escribe **con su contenedor** —«2.75 % de la
> > FILA»— o no se escribe. Los cuatro arquetipos anteriores calibraron bien por
> > una coincidencia: sin cascarón, la fila mide 1238.39 **siempre**, así que las
> > dos lecturas dan el mismo número y ninguna medición podía separarlas.

> **⚠ Alcance: vale para el RITMO, que es donde se descubrió — `margin` y
> `padding` de sección, fila y módulo. NO vale para la caja ni para la
> tipografía.** En Divi el **ancho de módulo** se escribe en % igual que su
> default, así que el número se mueve con el ancho **lo escriba quien lo
> escriba**; y sin embargo es un campo — 70 · 80 · 90 · 100 % en la misma
> página. Igual el `line-height` de los párrafos (30.6 · 36 · 45) y el tamaño
> del claim. Aplicado ahí, el test A responde "plantilla" a cosas que son campo:
> **da la respuesta al revés.**

> ⚠⚠ **Y SU PREMISA, QUE NO ESTÁ ESCRITA Y ES DONDE MÁS BARATO SE ROMPE: EL
> TEST A SUPONE QUE HAY ALGO ESCRITO. UN VALOR IGUAL AL INICIAL DE LA PROPIEDAD
> NO ES «PX ABSOLUTOS», ES QUE NADIE TOCÓ NADA.**
>
> El enunciado del test —*lo que el editor toca queda en px absolutos, iguales a
> 1440 y a 390*— tiene una precondición callada: **que el editor tocara**. Un
> `margin-top` computado de **0** también sale igual a los dos anchos, y no
> porque alguien escribiera «0px»: porque **0 es el valor inicial** y no hay
> nada que resolver contra el ancho.
>
> > **Un eje cuyo ÚNICO valor observado es el inicial de la propiedad sale SIN
> > ESCRIBIR — que no es ni campo ni plantilla.** Para el modelo pesa lo mismo
> > que SIN PROBAR: **no se cablea.**
>
> **Y no es un caso marginal: suele ser la mayoría.** Medido al derivar la
> geometría de un arquetipo de builder, **24 de 49 celdas** (tipo × eje) computan
> 0. Leerlas por el enunciado literal habría producido **24 campos inventados de
> una sola vez**, cada uno con su medición real de coartada — que es la misma
> forma del *arreglo falso* que el test A existe para evitar.
>
> **La comprobación cuesta una condición:** antes de aplicar el test A a un eje,
> mira **cuántos valores distintos tiene y si alguno es distinto del inicial**.
> Si no lo hay, el test A no tiene nada sobre lo que pronunciarse.

**Test B — el general (la variación intra-página).** Es la regla, no el atajo:

> **¿Varía de un módulo a otro dentro de la misma página?** Si dos hermanos del
> mismo hueco traen valores distintos, lo escribió una persona: **es un campo.**

Sin restricción de alcance: sirve para el ritmo, la caja, la tipografía y
cualquier otra propiedad.

**El matiz que cierra la regla: los dos tienen falsos negativos, y distintos.**

| test | no ve | ejemplo medido |
|---|---|---|
| A (Divi) | un campo **escrito en % igual que su default** — se mueve con el ancho y parece plantilla | `anchoPct` 70/80/90/100; `lh` 30.6/36/45 |
| B (general) | un campo que el editor puso **uniforme en toda la página** — no varía y parece plantilla | `mb 3%` de imagen: uniforme en la primera página, lo lleva **una** imagen en la segunda |

De donde la conclusión operativa, que es lo único que hay que recordar:

> **Una propiedad que no pasa NINGUNO de los dos tests no está probada como
> plantilla: está SIN PROBAR.** Y "sin probar" no se cablea en el componente —
> se deja anotado como pendiente de medir en una segunda instancia, porque
> cablearlo es exactamente cómo se produce el arreglo falso.

**La evidencia son las ocho propiedades de esta tanda**, ninguna visible en la
primera página, todas dadas por plantilla sin haber pasado ningún test — y todas
campo: ancho de módulo (**−55 por instancia, ×10**), `line-height` (hasta −77 en
un módulo), tamaño del claim (−12), bordes de la tabla (**−58**), default de
`mb` de imagen (±37), la regla del último módulo (+16 en siete filas), el
`<strong>` en línea (−30.59 a 390, invisible a 1440) y el hueco entre columnas
apiladas a 390. Tabla con el coste de cada una en el `⚠ CORRIGE` de
`docs/research/monografico-tecnico/components/seccion-editorial.spec.md`.

### ⚠ Antes de aplicar ningún test: identifica el RÉGIMEN de la página

**Los dos tests de arriba solo valen en uno de los dos regímenes que tiene este
sitio**, y aplicarlos en el otro da la respuesta invertida. Lo demostró el recon
del arquetipo A (`docs/research/arquetipo-A/PAGE_TOPOLOGY.md` §5).

**Son DOS marcadores binarios, así que la taxonomía tiene CUATRO casilleros —
y el reparto medido dice que ninguno es raro:**

| # | régimen | cómo se reconoce | quién decidió los valores | n de 576 |
|---|---|---|---|---|
| `B-` | **página de BUILDER** | `et_pb_pagebuilder_layout` en el `<body>`; secciones **propias** de la instancia | **quien editó ESTA página** | **60** |
| `-T` | **página PLANTILLADA** | `et-tb-has-body`; secciones `…_tb_body`; el contenido entra por un módulo `post_content` | **quien construyó la plantilla**, para todas las instancias a la vez | **371** |
| `BT` | **HÍBRIDO** | los **dos** marcadores a la vez — las dos capas conviviendo | **cada capa el suyo**: se lee por la VARIANZA de la capa (caja de abajo) | **14** |
| `--` | **⚠ SIN NINGÚN MARCADOR DE DIVI** | **ni uno ni otro**: `page-template-default` / `single-<CPT>` / `archive`, y el cuerpo en `entry-content` o `post_content`. Es la **plantilla clásica del tema**, PHP puro | **quien construyó la plantilla del TEMA** — no hay capa de builder que mirar | **131** |

> ⚠⚠ **EL CUARTO CASILLERO NO LLEVA NINGÚN MARCADOR DE DIVI, Y POR ESO SE
> CONFUNDE CON «no lo he mirado».** Es §*un selector que no casa con nada no es
> un cero* cometida sobre el `<body>`: la ausencia de los dos marcadores **es un
> dato**, no un fallo de lectura, y las dos salidas se escriben igual.
>
> **Y no es una rareza que se pueda despachar como excepción: son 131 de 576
> documentos capturados (22.7 %), el segundo casillero más poblado.** Dentro
> viven **CASO (57)** y **FAQ (19)** —dos arquetipos de la tabla de «Páginas
> clonadas», ya construidos—, así que este régimen lleva usándose desde antes de
> tener nombre.
>
> **La regla operativa, que es lo único que hay que recordar:** ante un `<body>`
> **se comprueban los DOS marcadores y se nombra la combinación**, incluida la
> vacía. *«No es builder»* no implica *«es plantillado»*: son dos preguntas
> binarias, no una de dos valores.
>
> ⚠ **Y lo que este reparto NO dice, que hay que declarar:** el marcador
> **anuncia qué mecanismos hay presentes**; **quién decidió cada valor lo dice la
> VARIANZA de la capa** (corrección del 2026-08-03, más abajo). Para `--` **esa
> varianza no está medida**: la columna de arriba dice lo que el mecanismo
> implica —no hay builder, luego no hay editor de instancia— y **eso es una
> deducción, no un barrido**. Se trata como SIN PROBAR hasta que alguien mida la
> varianza entre sus instancias.
>
> Derivado, no recordado: `docs/research/cola-larga/derivaciones/regimenes-corpus.{mjs,log}`
> — 576 documentos, censo del `<body>`, **4 combinaciones de 4 pobladas, 0 con
> n = 0** (cero **por construcción**: dos binarios sólo dan cuatro). El eje de la
> **plantilla de WordPress** es otro y **no coincide** con éste: 20 plantillas y
> 23 celdas pobladas de 80.

**En régimen de builder** —SECTOR, MONOGRÁFICO, artículo de KB— los dos tests
valen tal como están escritos: existe una persona que editó esta página, y px
absolutos son su huella.

**En régimen plantillado** —el arquetipo A, 209 páginas— **esa persona no
existe**. Una plantilla renderiza 149 entradas de blog; quien escribe una entrada
rellena el `post_content` y nada más. Por tanto:

> **La lectura del px absoluto se invierte.** En builder, «px iguales a 1440 y a
> 390» = lo tocó un editor = **campo**. En plantillado, lo mismo significa que **lo
> fijó quien construyó la plantilla** = **plantilla**, para las 149 a la vez.

Y el discriminador que sí vale en plantillado es otro:

> **La varianza entre instancias.** Cero varianza entre instancias de la misma
> forma = **plantilla**, aunque la huella diga px absolutos. Lo que varía entre
> **formas** distingue plantillas, no campos.

**En régimen `--` la lectura es la del plantillado, y por el mismo motivo — con
una diferencia que hay que saber**: allí no hay **ninguna** capa de builder, ni
propia ni de theme-builder, así que **no existe la persona que editó la
instancia** y todo lo que se mida lo fijó quien construyó la plantilla PHP del
tema. El discriminador vuelve a ser **la varianza entre instancias**, y hay con
qué: 57 casos y 19 FAQ. ⚠ **Y esa varianza NO se ha medido todavía** — la frase
anterior es lo que el mecanismo implica, no un barrido, así que se trata como
SIN PROBAR hasta que alguien la mida.

Medido: `post_content margin-bottom` vale **72 en las 12 instancias de blog** y
**0 en las 12 de término y documento científico**, a los dos anchos. Por el
enunciado literal del test A eso sería «campo»; **no lo es** — es el valor que el
constructor de cada plantilla fijó. En las 24 instancias muestreadas, **el ritmo,
la tipografía y la retícula del cascarón tienen varianza cero dentro de cada
forma**.

**Consecuencia operativa: identifica el régimen ANTES de aplicar el test.** Se
mira el `<body>` —una línea de HTML servido— y ya sabes cuál de las lecturas
toca. Aplicar el test sin mirarlo es cómo se convierte una plantilla en ocho
campos inventados, o al revés.

> ⚠ **Y se miran LOS DOS marcadores, no uno**: la tabla tiene cuatro casilleros
> y **el cuarto no lleva ninguno**. Comprobar sólo `et_pb_pagebuilder_layout` y
> concluir «plantillada» al no verlo mete en el casillero equivocado a **131 de
> 576** documentos capturados — los dos casos, `-T` y `--`, dan la misma
> respuesta a esa única pregunta y **tienen contenido en canales distintos**.

> ⚠ **CORREGIDO 2026-08-03 (grupo D, por predicado pre-registrado): el régimen
> es propiedad de la CAPA, no de la página — y el `<body>` puede llevar LOS DOS
> marcadores a la vez.** Las 13 páginas del centro de ayuda traen
> `et_pb_pagebuilder_layout` **y** `et-tb-has-body` juntos, y no son un tercer
> régimen: son **los dos existentes conviviendo en capas** — una plantilla de
> theme-builder que pone cascarón (con el `post_content` dentro) **más** las
> secciones propias del builder de la instancia inyectadas por él.
>
> Cómo se lee un híbrido, medido y no supuesto: **la capa que tiene varianza
> CERO entre instancias la fijó quien construyó la plantilla** (capa `_tb_`:
> una sola firma en 13/13, sidebar y sticky en 13/13 → lectura plantillada);
> **la capa que varía la compuso quien editó la instancia** (secciones propias:
> composición variable en artículos, 1→11 secciones en hubs → lectura de
> builder). El marcador del `<body>` **anuncia qué mecanismos están presentes**;
> quién decidió cada valor lo dice **la varianza de su capa**. Evidencia:
> `medidas/grupo-d-plantilla.json` + `grupo-d-inventario.json`; predicados en
> `docs/research/grupo-D/PRE-REGISTRO-DECISION.md` (P-R).

**Cómo se decide bien.** No mirando una instancia: **midiendo todas las que
existan**. El campo `flujo` salió de barrer los 8 sectores vivos con
`scripts/qa/tree-todos.mjs` y ver que solo hay dos formas de sección y dos de
fila; con dos sectores a la vista se habrían inventado los valores equivocados.
Las sondas viven en `scripts/qa/` con su salida congelada en `medidas/` — se
reutilizan, no se rehacen.

**Consecuencia para el CMS.** El content type de un arquetipo no es solo "los
textos". Cada bloque de un *flexible content* necesita además sus campos de
presentación editorial (qué piel, dónde corta la sección), con un valor por
defecto explícito y omitido en el dato cuando coincide con él. Ese default es
también la decisión de diseño que hereda quien dé de alta un contenido nuevo.

## Dónde para el modelado de estructura

Todo lo de arriba empuja en una dirección —**cuando algo varía, hazlo campo**— y
llevado al límite lleva a modelar cada `<p>` del sitio. **No es lo que hay que
hacer, y la frontera se puede escribir:**

> **Hasta el contenedor de contenido, la estructura se modela.** Sección, fila,
> columna, módulo, piel, ritmo: eso es plantilla y campos, y se separa como dice
> la regla 2.
>
> **A partir del contenedor de contenido, el contenido lleva su propia estructura
> dentro y se declara RICO.** Un solo campo HTML, con un contrato de qué tiene
> que admitir — no un árbol de bloques tipados.

**No es una comodidad, es lo que dijo el censo.** Las 209 páginas del arquetipo A
(`docs/research/arquetipo-A/components/campo-rico.spec.md`, censo de 209/209):

- **43 etiquetas HTML distintas**, con cola larga real (`mark`, `center`,
  `noscript`, `tfoot`, `embed`, `hr`, `u`, `section`…);
- **ninguna estructura se repite** lo bastante como para merecer tipo propio: lo
  más frecuente tras el párrafo son encabezados y listas, que son texto rico de
  manual;
- **`script` ejecutable dentro del contenido** en 15 páginas, que ningún modelo
  de bloques tipado va a representar;
- **el rango de longitud es de 254×** (275 a 69 784 caracteres en blog).

Modelar eso como bloques sería inventar un esquema para documentos que ya tienen
uno: HTML del editor clásico de WordPress (**cero `wp-block-*` en las 209**).

**Y «rico» no quiere decir «cualquier cosa».** La contrapartida de no modelar es
que **el contrato se escribe y se mide**: qué etiquetas, con qué frecuencia, qué
convenciones viven dentro (el 80 % del corpus depende de `<a class="et_pb_button">`
para que un enlace se vea como botón) y qué **no** aparece —código, `dl`,
formularios: ausentes en las 209—. Ese inventario **es** el contrato del campo, y
sin él «texto rico» es una excusa para no haber mirado.

La prueba de que la frontera está en el sitio correcto: **por encima del
contenedor, cero varianza**. En las 24 instancias muestreadas del arquetipo A, el
ritmo, la tipografía y la retícula del cascarón son idénticos dentro de cada
forma. Por debajo, 43 etiquetas y 254× de rango. La frontera no la elegí: está
donde el dato cambia de régimen.

## Páginas clonadas

| Ruta | Arquetipo | Recon/specs |
|---|---|---|
| `/` | HOME | `docs/research/` (raíz) + `docs/research/components/*.spec.md` |
| `/monitor-calidad-aire` | PRODUCTO | `docs/research/monitor-calidad-aire/` |
| `/accesorios` | CATÁLOGO (CPT `solutions`) | `docs/research/accesorios/` |
| `/software-de-medicion-calidad-del-aire` | SOFTWARE/PLATAFORMA | `docs/research/software/` |
| `/kunak-api` | Variante **corta** del anterior — no es arquetipo nuevo | `docs/research/kunak-api/` |
| `/sectores/[slug]` | SECTOR / SOLUCIÓN VERTICAL — **ruta dinámica, 4 de los 8 poblados** | `docs/research/sectores/` |
| `/sectores/…-en-edar` · `/sectores/…-petroleo-y-gas` | MONOGRÁFICO TÉCNICO — **misma ruta dinámica, otro arquetipo** | `docs/research/monografico-tecnico/` |
| `/[slug]` | GRUPO A — **el plano de raíz**, sirviendo DOS formas: entrada de blog y término de Kunakpedia | `docs/research/arquetipo-A/` + su `MEDICION.md` |
| `/recursos/[...ruta]` | GRUPO A — DOCUMENTO CIENTÍFICO, la tercera forma. Catch-all porque **el prefijo tiene tres valores**, no uno | idem, §1.1 del `MEDICION.md` |

Los 4 sectores vivos (Urbano · Industria · Construcción · Investigación) salen
de **una sola plantilla**: dar de alta uno es añadir un `SectorPage` a
`SECTORES_PUBLICADOS` en `src/lib/sectores.ts`, **sin tocar código**. Puertos y
Minería se dejan fuera a propósito (son permutaciones de una topología ya
validada — razón en `docs/PENDIENTES-QA.md`).

**El plano de raíz `/[slug]` lleva una guarda propia, y es obligatoria.** 202
slugs de cinco familias comparten el espacio de nombres de `/es/`, y **una
colisión no da error**: el build compila, emite la ruta por las dos vías y sirve
la página equivocada con HTTP 200 (medido tres veces). `npm run qa:slugs` la
caza y entra en `npm run check`. La unicidad que hay que imponer es **ENTRE
familias**, no dentro de cada una — en WordPress cada CPT la garantiza dentro de
sí y eso no basta.

**`/sectores/[slug]` sirve DOS arquetipos**, y eso es fidelidad, no atajo: en el
original los ocho cuelgan de `/es/sectores/` y comparten cabecera, banda de
clientes, breadcrumb, hero, slider, bloque K y pie — medido original contra
original. Lo único que cambia de forma es el cuerpo. El despacho es por slug
contra los dos catálogos (`SECTORES_PUBLICADOS` y `MONOGRAFICOS_PUBLICADOS`);
partirlo en dos carpetas de `app/` habría duplicado el 80% de la página.

## Regla de rutas locales

**Si el destino de un enlace ya está clonado, el `href` va a la ruta local; si
no, se deja apuntando al original hasta que se clone.**

- Sin barra final: `trailingSlash` no está activado. `/kunak-api`, no `/kunak-api/`.
- Marca cada uno con el comentario de una línea que ya usa el repo:
  `// ruta local: esta página ya está clonada (src/app/<ruta>)`.
- Al localizar, **deja anotado el href original** en el comentario del bloque,
  con su 301 si lo hay — hace falta para rehacer la comparación A/B contra el
  original. Ejemplo trabajado: la cabecera de `SOFTWARE_PARAGRAPHS` en
  `src/lib/monitor.ts`.
- **`target="_blank"` solo si el destino es externo.** Abrir el propio clon en
  otra pestaña no tiene sentido, aunque el original lo haga. `OutlineButton`
  (`src/components/SectionRow.tsx`) ya lo implementa con la prop `external`.

La aplican `nav.ts`, `footer.ts`, `products.ts`, `api.ts` y `monitor.ts`.

## Flujo de trabajo

Una página completa antes de empezar la siguiente. Por página:

1. **Recon** — Barrido de la página real: topología de secciones, capturas
   desktop y móvil, y clasificación de cada interacción (scroll / click /
   tiempo). Sale `docs/research/<pagina>/PAGE_TOPOLOGY.md` + `BEHAVIORS.md`.
   Aquí se decide **si es un arquetipo nuevo o una variante de uno existente** —
   ver `docs/research/kunak-api/PAGE_TOPOLOGY.md`, que concluyó que el arquetipo
   "API/desarrollador" no existía. No se escribe código en esta fase.
2. **Specs** — Por sección: `getComputedStyle` de cada elemento, todos los
   estados, texto verbatim y dependencias de assets →
   `docs/research/<pagina>/components/<seccion>.spec.md`. Sigue sin escribirse
   código.
3. **Build** — Componentes + `src/lib/<pagina>.ts` + `page.tsx` a partir del
   spec. Verificar con `npm run check` (lint + typecheck + build).
4. **QA visual** — Comparación lado a lado contra el original, desktop y móvil,
   de arriba a abajo. Cada discrepancia: revisar el spec, re-medir si hace
   falta, corregir. Lo que quede sin resolver o se desvíe a propósito va a
   `docs/PENDIENTES-QA.md` con fecha y razón.
5. **Commit** — Mensaje en español, con el ámbito por delante
   (`monitor: …`, `software: …`). Cuerpo explicando el porqué y lo que queda
   pendiente.

### ⚠ UN ARQUETIPO NUEVO NO HEREDA COBERTURA

> **Toda tanda de construcción cierra con una sonda comparadora DE DOS LADOS
> sobre los ejes estándar.** Si para ese arquetipo no existe, **construirla es
> parte de la tanda, no un extra.** Una guarda solo-clon —`clon-base`,
> `offsets`— se lee como verde y **no mide fidelidad**: compara el clon con el
> clon de ayer, y ayer podía estar mal.

**El dato que lo sostiene** (auditoría de cobertura, `docs/research/COBERTURA-MEDICION.md`):

| arquetipo | construido | cobertura antes de la auditoría |
|---|---|---|
| HOME · PRODUCTO · CATÁLOGO · SOFTWARE | el más temprano | `docH` y árbol en `c` |
| MONOGRÁFICO | en medio | **el mejor cubierto: `O` en docH, árbol, filas y módulos** |
| CASO · FAQ | tardío | `O` en docH y árbol |
| **GRUPO A** | **el más reciente** | **`docH` y árbol en `c`** |

**La cobertura no crece con el tiempo**: el más nuevo estaba tan descubierto como
el más viejo. La única variable es **qué sonda tenía delante la tanda que lo
construyó** — el monográfico nació con `mono-cmp` y `tree-cmp` hechos para él;
grupo A se apoyó en `clon-base` (guarda del clon) y `a-cascaron` (censo del
original), **dos sondas que nunca se tocan**.

Y lo que costó saltárselo: al cerrar el hueco, las 31 rutas comparadas por
primera vez en `docH` sacaron **un desfase de cascarón por familia** —−87.5 en
las 14 de grupo A, con el signo invertido a 390— y **+289.91 de base en la
HOME**, el arquetipo más antiguo. Ninguno de los dos podía verlo una guarda
solo-clon. Registro en `PENDIENTES-QA.md` §COBERTURA.

**En la práctica:** `npm run qa:cobertura` dice en qué estado queda cada eje.
Una tanda de construcción no está cerrada mientras su arquetipo tenga celdas en
`c` o en `·` en los ejes que esa página sí tiene.

`docs/PLAN-CLONADO.md` tiene el detalle de fases y qué modelo conviene en cada
una. `docs/PENDIENTES-QA.md` es el registro vivo de QA — **léelo antes de tocar
una página ya clonada**: incluye objetivos numéricos por sección y hallazgos
cerrados que no hay que reinvestigar.

**`docs/research/COBERTURA-MEDICION.md` dice qué se ha comparado contra el
original y qué no** — 31 rutas × 9 ejes, con tres estados: comparado contra el
original · solo clon-contra-clon · nunca. **Consúltalo antes de leer un verde
como una verificación**, porque la diferencia entre «no hay defecto conocido» y
«no se ha mirado» no está en ningún otro sitio del repo. Hoy (2026-08-02): el
ancho del **cuerpo** ya no está a 0 —se midió, **164 de 181 filas**, y su unidad
es la FILA, no la ruta— y el **comportamiento sigue a 0/31**, que es el hueco
mayor que queda.

> ⚠ **El recuento de sondas se DERIVA, no se cita de memoria** (§sondas 9): el
> número exacto lo dice `npm run qa:lib` en su última línea (*«las N sondas
> COMPILAN y declaran su mínimo»*). Aquí llegó a estar escrito «48» y a fecha de
> 2026-08-08 son **113**: un número recordado envejece **contra** el repo, en
> silencio, y no hay lectura que lo distinga de uno derivado.

> ⚠ **Y desde esta fecha hay una lectura más barata que abrir el documento:
> toda sonda imprime su LÍNEA DE UNIDADES** (`✓ evaluadas 31/31 rutas · enlaces`).
> El primer número es lo que midió; el segundo, lo que debía medir. **Un verde
> sin esa línea no es de este contrato**, y un denominador en otra unidad que el
> numerador —`16/9 páginas` sobre nueve *formas*— es un mínimo que no expresa lo
> que la sonda afirma.

**`docs/ESQUEMA-CMS.md` es el registro vivo del destino**, y se mantiene igual
que `PENDIENTES-QA.md`: **cada tanda lo actualiza**. Ahí vive la decisión de
plataforma (Payload self-hosted sobre Postgres, embebido en la app, editor
Lexical), la traducción de cada content type medido a colecciones/blocks/campos
con defecto, la whitelist del campo rico con su evidencia, las transformaciones
de migración, el enrutado decidido y el criterio de aceptación. **Si una tanda
mide algo que cambia el esquema, se anota ahí en la misma tanda** — no después.

**El camino hacia ese destino está en `docs/PLAN-FASE-2.md`**: cinco fases
F2-1…F2-5 (esquema · datos · lectura · publicación · admin y traspaso), cada
una con las decisiones del ESQUEMA que la alimentan, su incógnita y su criterio
de «hecho», más las dos precondiciones de arranque. Ojo a la convención: los
`CMS-n` son **decisiones** (viven en el ESQUEMA), los `F2-n` son **fases** —
no se mezclan.

## ⚠ EL CONTRATO NO ES EL MISMO A TODOS LOS ANCHOS

**Antes que cualquier nota de método, porque decide qué cuenta como defecto.**
Este proyecto mide a **1440 y 390**, y esos dos anchos tienen un contrato
distinto del resto:

| dónde | contrato | qué es un defecto |
|---|---|---|
| **1440 y 390** | **FIDELIDAD** | cualquier Δ ≠ 0 por encima del suelo de ruido |
| **cualquier ancho intermedio** | **COMPORTAMIENTO DE RANGO** | un valor **cableado** donde el original **varía** |

> **En los anchos intermedios NO se exige Δ0, se exige que el clon VARÍE como
> varía el original.** Si el original se mueve con el ancho y el clon devuelve
> una constante, eso es defecto —de rango— aunque a 1440 y a 390 cuadre al
> céntimo. Y al revés: **una diferencia de píxeles a 1280 entre dos cosas que
> las dos varían no es defecto**, y perseguirla no termina.

**Por qué, y no es pereza:** el original es **Divi fluido** —porcentajes, filas
que reflotan, `max-width` que entra a un ancho que nadie eligió— y el clon es
Tailwind con cortes declarados. **Las dos curvas pasan por 1440 y por 390 y no
coinciden entre medias.** Igualarlas punto a punto exigiría reproducir el motor
de maquetación de Divi, no la página; y como no hay ancho «siguiente» que fijar,
el trabajo no tiene final.

**Cómo se usa, en dos preguntas:**

1. ¿El original **varía** en ese tramo? Si no varía y el clon tampoco, no hay
   nada que mirar.
2. Si varía: ¿el clon **también varía**? Si sí → cumple, aunque el número
   difiera. Si devuelve una constante → **defecto de rango**, y se arregla
   haciendo que dependa de lo que el original hace que dependa (el contenido, el
   ancho disponible), **no cableando el valor del ancho que tengas medido** —
   eso es exactamente cómo se fabrica una FAMILIA DE CALIBRACIÓN.

**Caso medido (2026-08-02):** la cabecera de `/sectores/*` a 1280 daba el
original **338.25** y el clon **397.59**. A 1440 y 390 estaba a Δ0. Diagnóstico
correcto: **defecto de RANGO** —el clon no variaba— y no defecto de fidelidad.
Se arregla haciendo variar, y **no se le exige Δ0 a 1280**.

> **Y el corolario que evita el trabajo infinito: un «se ficha, no se persigue»
> en un ancho intermedio no es deuda.** Es el contrato. Lo que sí es deuda es no
> haber comprobado **si varía**.

## Notas de método (medición y capturas)

Estas se pagaron con horas de depuración. No las reinventes:

- **Perfil limpio, siempre.** Se mide con puppeteer-core sobre el Chrome del
  sistema, headless, perfil nuevo y **Cookiebot bloqueado** vía
  `--host-resolver-rules`. En una sesión viva con cookies e historial el
  original renderiza estados distintos y las medidas no valen.
- **Scroll + settle antes de medir.** Divi recalcula alturas de slider por JS
  después del load. Hay que dar un pase de scroll completo y esperar a que se
  asiente; conviene además forzar las imágenes perezosas a `eager`.
- **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844). El
  `resize_window` de la extensión de Chrome **no sirve**: informa éxito pero el
  viewport se queda en 1280. Y sin override, Chrome headless fuerza un ancho
  mínimo de 500px, así que el "móvil" que salga será falso.
- **Capturas con `setViewport`, nunca con `fullPage: true`.** `fullPage`
  **reinicia el override de device metrics**. A 1440 la página pasaba a
  maquetar como si el viewport midiera ~800; y con
  `Emulation.setDeviceMetricsOverride` puesto por CDP, el screenshot captura
  **la ventana real (800×600) en vez del viewport emulado**. O sea: la captura
  no es de lo que acabas de medir. Captura por viewport y compón las tiras
  después. (Hallazgo del recon de /kunak-api, 2026-07-27.)
- **El original no es un objetivo de medición estable.** Protocolo completo en
  `scripts/qa/README.md`; sonda `ruido.mjs`.

  > ⚠ **REDISEÑADO 2026-07-30 (C-QA6). «Mide 3 veces» era el protocolo entero y
  > medía lo que no había que medir**: tres cargas seguidas miden **el temblor
  > dentro de un episodio**, y lo que mueve al original son **los episodios**.
  > Una ráfaga limpia se estaba leyendo como «suelo 0», que es un veredicto
  > verde de una comprobación que no puede ver el fenómeno.

  Las tres reglas que lo sustituyen:

  1. **El suelo NO es el máximo dentro de una ráfaga, sino el máximo ENTRE
     ráfagas separadas en el tiempo.** Una *ráfaga* son 3 cargas seguidas; hacen
     falta **≥3 ráfagas separadas por ≥2 horas, y en al menos 2 días distintos**.
     El suelo de una ruta es el **máximo de los máximos**, y **no está fijado
     hasta completar la campaña**. Medido: dos ráfagas a ~6 minutos dieron
     `±32.28` y `0` en las mismas 3 rutas.
  2. **Una ráfaga limpia se reporta como «no se observó ruido en este
     episodio», nunca como «el suelo es 0».** Son afirmaciones distintas y solo
     la primera está respaldada. La segunda **solo** puede escribirla una
     campaña completa, y aun así con su fecha.
  3. **El alcance se declara siempre: qué rutas y qué anchos entraron.** Un
     suelo es una propiedad **de las rutas medidas**, no del sitio. Si una ruta
     no está en la lista, no tiene suelo — tiene un hueco.
  4. ⚠ **AÑADIDA 2026-08-03, y corrige a las tres de arriba en su punto ciego:
     LAS TRES MIDEN EN DÍAS Y EL FENÓMENO PASA EN SEGUNDOS.**

     Las reglas 1–3 se calibraron con los **episodios largos** —las dos lecturas
     separadas por horas de C-QA1— y para eso siguen valiendo. Pero la campaña
     que cerró C-QA6 midió las transiciones **carga a carga**, y salió otra cosa:
     en la ráfaga 1, **los monográficos saltaron entre la carga #1 y la #2, y
     `/software` entre la #2 y la #3**. Cargas consecutivas: **segundos**.

     > **La variable que discrimina es el NÚMERO DE CARGAS, no el reparto en
     > días.** El protocolo gasta días para comprar algo que se compra con
     > cargas: 3 ráfagas en 3 días dan **9 cargas** por combinación, y una sola
     > sentada de 60 da casi siete veces más muestreo **en una tarde**.

     **Los dos ejes no se sustituyen, y hay que saber qué compra cada uno:**

     | eje | qué compra | sigue haciendo falta porque |
     |---|---|---|
     | días / separación | protege de que una condición **persistente** (un despliegue, una caché fría) se lea como suelo permanente | es lo que impide llamar «suelo» a una tarde rara |
     | **nº de cargas** | **muestrea los estados** — la escala a la que ocurre el cambio | es el que decide si un «un solo estado» significa algo |

     **El protocolo no se deroga: se le añade el eje que no tenía.** Una campaña
     con 3 días y 9 cargas está **bien separada y mal muestreada**, y hasta hoy
     eso no se podía ni enunciar.

     **Y de ahí la regla de lectura, que es la que evita la conclusión falsa:**

     > **«No se observó un segundo estado en N cargas» NO es «esa combinación es
     > unimodal».** Es la **regla del cero** —*no encontrar nada y no mirar nada
     > dan la misma salida*— aplicada al **muestreo** en vez de a un selector.

     Medido, con sus dos lados: **a 1440, DOS estados en 27 cargas; a 390, UNO
     en 18.** Y a 1440 el estado raro salió en **4 de 27** (~15 %), una tasa que
     18 cargas pierden por azar sin nada de extraordinario. **18 no es un tamaño
     que pueda contestar la pregunta.** Instrumento: `qa:estados-390` —muchas
     cargas, una sentada, unidad = la carga—, deliberadamente **fuera** de la
     campaña para no romperle la homogeneidad a sus ráfagas.

     **Corrido el 2026-08-03: 60 cargas × 3 rutas = 180, UN SOLO ESTADO en las
     tres** (`308.58` · `189.39` · `189.39`, cero variación). Y así es como se
     reporta un cero de muestreo **sin convertirlo en prueba de ausencia**:

     > **No se escribe «390 es unimodal». Se escribe la COTA.** Regla de tres
     > (0 eventos en n ⇒ cota al 95 % = `3/n`): **< 5 % por carga y ruta**. Y el
     > contraste: si a 390 hubiera un segundo estado con la tasa de 1440,
     > no verlo en 60 cargas tendría probabilidad `6.6 × 10⁻⁵`. **390 no se
     > comporta como 1440 — medido, no supuesto.** Una tasa mucho menor sigue
     > cabiendo, y por eso esto acota en vez de cerrar.

     **Y el reparto de ejes que deja, que es lo reutilizable:** un cero en el eje
     de las cargas **no puede** contestar una hipótesis **episódica** —si la
     condición va ligada a un momento y no a una carga, 180 cargas de una tarde
     no la ven **por construcción**—. Para eso está la separación en días. **Los
     dos ejes no compiten: contestan preguntas distintas, y hay que decir cuál se
     está contestando.**

  De ahí la consecuencia que gobierna la lectura de cualquier Δ:

  > **Sin campaña cerrada para esa ruta, un residuo pequeño no es «limpio»: es
  > SIN PROBAR.** Y «pequeño» significa *por debajo del mayor episodio observado
  > en esa ruta*, no por debajo de un número global.

  Lo esencial del resto:
  - **La base de lectura es el `h1`.** Se compara primero con el del original y,
    si difiere, ese desplazamiento se resta de todo lo demás. Es el `h1` porque
    en 42 cargas medidas su dispersión fue **0 en las 14 combinaciones** de
    página y ancho. Si el `h1` del original no cuadra entre dos corridas del
    mismo día, la corrida se descarta y se repite.

    > ⚠ **CORREGIDO 2026-07-30 (C-QA6). La frase de arriba es cierta y está
    > INCOMPLETA en dos ejes, y de los dos el segundo invalida el método de
    > comprobación, no solo el alcance.**
    >
    > **(a) Alcance.** Las «14 combinaciones» son **7 páginas × 2 anchos**, y las
    > 7 son las que había clonadas en julio de 2026 (`PORDEFECTO` en
    > `ruido.mjs`): home · monitor · accesorios · software · api · urbano ·
    > industria. **No incluyen los dos monográficos, ni el caso, ni la FAQ.** La
    > afirmación se venía citando como si fuera una propiedad del sitio; es una
    > propiedad **de las rutas medidas**.
    >
    > **(b) Alcance temporal, que es el grave.** Correr el protocolo de 3
    > corridas **no establece** que una base sea estable. Medido hoy sobre
    > `/software` y los dos monográficos, dos ráfagas separadas por ~6 minutos:
    >
    > | ráfaga | `h1` |
    > |---|---|
    > | A | **±32.28** en petróleo@1440 · **±30** en las tres @390 · nº de filas variable en 3 |
    > | B | **0 en las 6** · nº de filas estable |
    >
    > La misma sonda, las mismas rutas, el mismo día. **Una ráfaga limpia no
    > prueba estabilidad: prueba que en esos minutos no hubo episodio.** Y como
    > el protocolo dice «3 corridas», una ráfaga B se lee como «suelo 0» y cierra
    > la pregunta en falso — que es lo que llevaba pasando.
    >
    > **Lo medido, sin redondear:** `/software`, EDAR y petróleo presentan
    > episodios de hasta **±32.28** en la base, **no reproducibles a demanda**.
    > Se ha visto tres veces: dos lecturas separadas por horas durante C-QA1
    > (421.39→389.11 en software; 261.16→228.88 en los dos monográficos) y la
    > ráfaga A de hoy.
    >
    > **Consecuencia, y es de las que hay que decir en voz alta:** en esas 3
    > rutas, **todo residuo por debajo de ~32.28 está SIN PROBAR** — ni defecto
    > ni limpio. Eso incluye el **−15.72 de `/software`** con el que se iba a
    > fijar el objetivo de C-QA2. Para las otras 14 combinaciones la frase
    > original sigue en pie **con su fecha**: es lo que se midió el 2026-07-29,
    > no una garantía permanente.
    >
    > ✅ **CERRADO 2026-08-03 (C-QA6, campaña completa: 3 ráfagas · 3 días ·
    > separadas 62.31 h y 19.92 h).** Suelo `h1` **a 1440 = 32.28** en las 3
    > rutas. **Y el −15.72 no quedó pendiente: se disolvió**, con una lección que
    > vale más que el número —
    >
    > > **El `h1` de esas rutas no tiembla: es BIMODAL**, dos estados discretos a
    > > 32.28 clavados (`software` 389.11 ↔ 421.39; los monográficos 228.88 ↔
    > > 261.16). Así que **el −15.72 y el −48 nunca fueron dos candidatos a
    > > objetivo: eran EL MISMO defecto medido contra los dos estados.** El clon
    > > valía 373.39; `389.11−373.39 = 15.72` y `421.39−373.39 = 48`, y **la
    > > diferencia entre los dos «defectos» ES el suelo.** El −48 ya está
    > > arreglado (clon a 421.39, Δ0 en 4 corridas de `c-cabecera`).
    >
    > **De donde la regla nueva, que es lo reutilizable:** cuando el original sea
    > bimodal, **el clon tiene UN valor fijo y el original DOS**, así que su «Δ0»
    > es **Δ0 contra el estado dominante**. Un **+32.28** en una corrida futura
    > **no es una regresión**: es el otro estado. Recalibrar ahí fabrica una
    > FAMILIA DE CALIBRACIÓN. Y el corolario de método: **antes de leer un
    > residuo pequeño contra un suelo, mira contra QUÉ ESTADO se midió** — es lo
    > que disolvió éste, no medir más veces.
    >
    > ⚠ **Y AHORA LA PARTE QUE SE ESCRIBIÓ MAL A LA PRIMERA, porque es la que
    > tapa defectos: UN SUELO BIMODAL NO ES UN UMBRAL.** El acta de cierre dijo
    > *«todo residuo < 32.28 es indistinguible del estado»*, y eso es leerlo como
    > una banda de 0 a 32.28. **No lo es: son dos picos, y entre pico y pico no
    > hay masa** — en 27 cargas @1440 no salió ni un valor intermedio.
    >
    > | Δ | lectura |
    > |---|---|
    > | **≈ 0** | el original en su estado alto: el clon casa. **Limpio.** |
    > | **≈ 32.28** | el original en su estado bajo: casa con el otro pico. **Limpio.** |
    > | **cualquier otro** | **DEFECTO — incluidos los MENORES que 32.28.** |
    >
    > **Leerlo como umbral taparía defectos de hasta 32 px en las rutas peor
    > conocidas del proyecto.** Un Δ de 12 o de 31 no es «ruido pequeño»: es un
    > valor que el original **nunca ha producido**, así que solo puede venir del
    > clon.
    >
    > > **La forma general, que vale para cualquier suelo futuro: un suelo acota
    > > solo si la distribución es UNIMODAL. Si tiene picos, DISCRIMINA — se
    > > compara contra los valores admisibles, no contra el máximo.** La pregunta
    > > no es *«¿cabe dentro del suelo?»* sino *«¿cae en uno de los picos?»*. Y
    > > por eso un suelo se publica con **su forma**, no solo con su número: «32.28»
    > > a secas invita justo a la lectura equivocada.
    >
    > **Y el «Δ0» hay que redactarlo condicionado**, porque el clon está cableado
    > a **un** pico: `/software`, EDAR y petróleo están a **Δ0 contra el estado
    > ALTO** —el único que vieron las 6 corridas de `c-cabecera`— y a **+32.28
    > contra el bajo**. El −15.72 de antes del arreglo **no desapareció: es hoy
    > ese +32.28**. Mover el clon no quitó la discrepancia, **cambió contra cuál
    > de los dos estados es exacto**.
    >
    > ⚠ **Lo que NO cerró, y no fue por la medición:** a **390** las 3 ráfagas
    > exhibibles dan **0**, pero la **ráfaga A** midió **±30 en las tres @390** y
    > **su fichero se borró a mano**. Si contara, el suelo a 390 sería 30. O sea
    > que el **−30 de EDAR@390** es «defecto claro» o «exactamente el suelo»
    > según cuente o no, y **con lo medido hasta hoy no se puede dirimir**. Es la
    > §regla 5 (*el borrado a mano*) cobrándose por **segunda** vez y más caro: la
    > primera costó un número que no se puede exhibir; ésta, **una decisión que
    > no se puede tomar**.
    >
    > **Pero «no se puede dirimir» NO es un estado en el que este proyecto se
    > quede, y ésa es la lección operativa**: cuando la evidencia que falta es
    > *medible*, la salida es **medirla otra vez**, no argumentar sobre la que se
    > perdió. Campaña **`cqa6-390`** arrancada el 2026-08-03 sobre las mismas 3
    > rutas.
    >
    > ✅ **CERRADA 2026-08-04 (3 ráfagas · 2 días · ≥2 h) — y la dirimió el
    > ARCHIVO, no la campaña.** Las 4 ráfagas a 390 vieron **sólo el estado
    > dominante** en las tres rutas, igual que las 180 cargas de `estados-390`.
    > Quien tenía la respuesta era **`c-cabecera`**, congelada y commiteada desde
    > julio: **a 390 el original es BIMODAL con Δ = 30 exactos**, y el clon **no
    > se mueve** —`clon 189.39` en la corrida del Δ0 y en la del −30—.
    >
    > | ruta @390 | dominante | 2.º estado | forma |
    > |---|---|---|---|
    > | `/software…` | 308.58 | **338.58** | ✅ bimodal Δ30 |
    > | `…-en-edar` | 189.39 | **219.39** | ✅ bimodal Δ30 |
    > | `…-petroleo-y-gas` | 189.39 | **ninguno visto** | ❌ **no establecida** |
    >
    > **El −30 nunca fue defecto del clon: es el original en su segundo estado**,
    > y sale de SIN PROBAR sin entrar en defecto. Lectura (sólo para las **dos**
    > rutas con forma establecida): **Δ≈0 limpio · Δ≈30 limpio · cualquier otro
    > valor DEFECTO, incluidos los menores de 30**. En **petróleo** sólo Δ≈0 está
    > respaldado — que sus hermanas sean bimodales es razón para sospecharlo, **no
    > para afirmarlo**. Acta con alcance y ficheros: `PENDIENTES-QA.md` §CAMPAÑA
    > `cqa6-390` · CERRADA.
    >
    > ⚠ **Y el precio del borrado a mano NO se recuperó, sólo se rodeó:** la
    > ráfaga A sigue sin poder exhibirse. Lo que la sustituyó fue **otra
    > evidencia que nunca se borró**, y encontrarla costó un `grep`. La §regla 5
    > sigue entera.
    >
    > **Y `±30` / `±32.28` no son de la familia conocida.** El ruido documentado
    > abajo (27 · 54 · 81) son renglones del módulo «Artículos y Guías». Estos
    > números no son múltiplos de 27 y aparecen en el `h1`, que va **por encima**
    > de ese módulo: es **otro mecanismo, sin identificar**.
  - ⚠ **Y la regla es CIEGA A SU PROPIO PUNTO DE APOYO.** Restar la base *antes*
    de comparar significa que **un desfase que está EN LA BASE se normaliza a
    cero por construcción**: la cabecera puede estar a −48 y todas las anclas
    del cuerpo salen limpias. Sigue siendo la forma correcta de leer el
    **cuerpo** —para eso se escribió— pero no puede auditarse a sí misma. Por
    eso:

    > **Cada arquetipo nuevo mide su base EN CRUDO una vez** —la `y` absoluta
    > del `h1` en original y clon, **sin corrección**— **antes de fiarse de sus
    > deltas de cuerpo.** Una sola corrida, y queda hecho para siempre en ese
    > arquetipo.

    Se pagó con **cuatro páginas que llevaban meses dadas por verificadas con
    Δ0** y tenían −48 y −19.2 a 1440 (y **+78.42 y +48.42 a 390**: el signo se
    invierte, que es la firma de una medida tapada). Nadie las había mirado en
    crudo porque el protocolo nunca lo pide. Instrumento: `qa:c-cabecera`, que
    reporta la `y` cruda de las 17 rutas y **verifica además que el primer `h1`
    sea el MISMO elemento en los dos lados** — un selector que casa en ambos
    pero apunta a cosas distintas no lo caza ningún censo.
  - **Un Δ por debajo de la dispersión observada NO es un defecto** — pero la
    dispersión **no es un número único, son dos regiones**: hasta **81** en el
    módulo "Artículos y Guías" y de ahí abajo (el original **sortea los 3 posts
    en cada carga**, P4, y los titulares envuelven distinto: 27/54/81 son uno,
    dos o tres renglones), y **0 en todo lo demás**. En el cuerpo de la página
    un Δ de 8.6 es tan real como uno de 100. Aplicar un suelo global sería el
    error contrario: descartar defectos por ruido que solo existe en otro sitio.

    > ⚠ **«0 en todo lo demás» hereda las dos correcciones de C-QA6** (arriba,
    > §La base de lectura): se midió sobre 7 páginas, y una ráfaga limpia no
    > prueba estabilidad. Hay una **tercera región medida** que no está en la
    > frase: `/software` y los dos monográficos, con episodios de hasta **±32.28
    > en la propia base de lectura**. Son **tres** regiones, no dos — y la
    > tercera no se identifica por el módulo, como la de 81, sino **por la ruta y
    > por el momento**, que es lo que la hace difícil de ver.
  - **Reproducirse entre anchos pesa más que el tamaño.** Un residuo idéntico a
    1440 y a 390 no puede ser ruido: son dos maquetaciones distintas. Y al revés:
    un residuo que **aparece solo en un ancho** es un contenedor que en el otro lo
    tapaba — ver «La causa común: el NIVEL al que se mide» más abajo.
  - **Un comentario CSS no puede contener `*/`, ni siquiera entre comillas** — el
    token de cierre no se puede citar; lo que sigue pasa a ser selector y el
    parser se come la regla base. El fallo solo lo vio la medición a dos anchos
    (bandas de 0 a 390 con 1440 intacto): es el argumento operativo de la regla
    «siempre dos anchos».
- **Un Δ de cero puede ser dos errores que se anulan.** El caso, medido: la fila
  del CTA de Industria a 390 iba con un déficit de −47.5 de contenido y, encima,
  con +74 de ritmo que no le tocaba; el total daba **+26.5** y parecía un fleco.
  Al corregir el ritmo (S7) apareció el −47.5 entero, que llevaba ahí desde el
  principio. Ver «El principio» más abajo.
- Anota en el doc de cada medida **viewport, DPR y fecha**. Los deltas solo se
  comparan entre medidas del mismo día y la misma configuración; el original es
  un sitio vivo.
- Ojo con el servidor del clon al comparar: si corre con `next start`, tras
  editar hay que **parar, `npm run build` y relanzar**. Una página sin estilos
  (CSS 500) es un `next start` desincronizado de `.next`.

  > ⚠ **Y la vuelta que cuesta una corrida entera (2026-08-02): `npm run check`
  > CONSTRUYE.** Lanzarlo —o cualquier `build`— **mientras una sonda está
  > midiendo** le cambia el `.next` al servidor vivo por debajo, y lo que sale no
  > es un error del clon: son **404 en rutas que existen**. Pasó con las 4 de
  > `/recursos/…` en mitad de una adjudicación de 31 rutas; con el servidor
  > relanzado dan 200 las cuatro.
  >
  > **Lo grave no es el 404, es que NO SE SABE DÓNDE CAYÓ EL CORTE:** las rutas
  > medidas antes del cambiazo son buenas y las de después no, y el fichero no
  > distingue unas de otras. **La corrida entera se descarta y se repite** — no se
  > salvan las que «parecen bien».
  >
  > Regla: **mientras haya una sonda en vuelo, nada de `build`, `check` ni
  > `dev`.** Si hay que verificar código, se espera o se hace en otra copia.

`KV-01 · 7HQMPD`
## El principio: verificar contra la salida servida

**Nunca contra la fuente que uno supone responsable.** Es la regla que gobierna
las notas de método de arriba, y las tres veces que se ha aprendido en este
proyecto costaron una tanda cada una:

| se supuso | la salida servida decía |
|---|---|
| «el ritmo lo pone el componente del bloque» | lo ponía la SECCIÓN, y cada sector la corta donde quiere (S7) |
| «el desfase del claim es +26.5» | eran **−47.5 de contenido tapados por +74 de ritmo** — dos errores anulándose |
| «los enlaces a sectores los pinta `nav.ts`» | los pintaban **tres** ficheros, y dos ni se sospechaban |
| «el tipo del módulo de texto se midió sobre el original» | se midió sobre **la TRANSCRIPCIÓN**, que ya había tirado lo que faltaba |
| «si el editor tocó la tipografía, quedará rastro en el marcado» | **Divi no escribe marcado: COMPILA CSS**, y lo sirve en el mismo `<style>`. Los 10 ejes que se miraron eran atributos y estructura; **ninguno era CSS** |

⚠ **La cuarta es de 2026-08-10 y merece nombre propio, porque el error no fue
mirar poco: fue mirar EL CANAL EQUIVOCADO.**

> **«La salida servida» incluye el CSS que el documento se trae.** Un constructor
> de páginas puede expresar lo que escribió el editor en **cualquiera** de los
> canales que sirve —atributo, clase, CSS compilado, `<style>` en línea—, y mirar
> sólo uno da un cero que se lee como *«esa propiedad no existe»*.

Medido: `qa:kb-tipografia` recorrió `style=`, `class=`, las clases del módulo,
`estiloInline`, el reparto, la posición, la fila, `mb`, `mt` y las etiquetas
vecinas —**diez ejes**— y concluyó que el `h2` de `articulos-kb` tiene **tres
pieles sin discriminador servido**. Lo tenía, en el `<style>` del propio
documento: `.et_pb_text_3 h2 { font-weight:300; font-size:44px;
line-height:1.25em }`. Con eso, las tres pieles resultaron ser **un DEFECTO del
tema y DOS overrides por módulo** — y lo mismo el `h3`.

**Y la premisa que lo sostenía era cierta**, que es lo que la hace peligrosa: el
esquema afirmaba *«`estiloInline` es `null` en los 85 módulos, o sea que el
editor no tocó la tipografía»*. `estiloInline` es el atributo `style=`, **y Divi
no lo usa**: es medir al nivel que absorbe, con una medida real como coartada.
Lo servido dice que el editor tocó la tipografía **en 89 sitios** de esos 85
módulos.

> ⚠ **Y su forma de REDACCIÓN, que es donde este cero se cuela sin que nadie lo
> note (2026-08-14, F3-2):** el enunciado peligroso no es *«no existe»* — es
> **«el dato no lo separa»**, porque suena a haber mirado el dato entero.
>
> **Toda afirmación de que un discriminador NO EXISTE se escribe con la lista de
> canales que se miraron.** Sin esa lista es una afirmación sobre el canal que
> se miró, no sobre el dato — y llega a la tanda siguiente **blindada**, porque
> parece el resultado de una medición.
>
> Medido: *«las dos lecturas producen las mismas 80 tarjetas, así que el dato no
> las separa»* era **cierto del canal de las tarjetas** y falso del documento.
> El mismo HTML servía `<body class="archive tax-resources term-articulos">` en
> la página en cuestión y `page-child` en sus tres hermanas del mismo
> directorio: **el discriminador estaba servido, con su contraste al lado**, y
> la frase lo dio por inexistente durante dos tandas. Es §sondas 4 —*un selector
> que no casa con nada no es un cero*— cobrada sobre **la prosa** en vez de sobre
> el código.

⚠ **Y la quinta tiene una hermana pequeña que se paga al TRANSCRIBIR CSS, y son
tres cosas que «la salida servida» incluye y nadie mira (2026-08-13):**

| lo que se transcribe | lo que el navegador hace | coste medido |
|---|---|---|
| una declaración **INVÁLIDA** (`min-width: none`, `border-radius: none`) | **la tira** — la salida servida de una declaración inválida es *que no existe* | traducirlas a lo que «querían decir» daba `border-radius: 0` contra el `50%` medido |
| el **espacio en blanco** entre elementos `inline-block` | **lo renderiza**: 3.61 px a 18 px de cuerpo | un JSX «limpio» desplazaba el paginador **3.61 px por pieza, acumulativo** |
| dos reglas de **origen distinto** consolidadas en un selector | **cambia quién gana la cascada** | subir el `10px` global dentro de `.entry-title` dejó sin efecto un `@media (≤479)`: Δ0 a 1440 y **9 pares a 390** |
| un marcado y el **`<script>` que lo REPARA en cliente** | ejecuta el script y **repara el marcado** antes de que nadie lo vea | quitar el script y **dejar el marcado** convirtió 2 enlaces vivos en **404 permanentes** — y otros 3 esperando a que se construyan sus páginas |

> **Las cuatro son la misma:** al transcribir, lo que se replica es **lo que el
> navegador hace con lo servido**, no lo que el autor pretendía, ni lo que un
> formateador considera limpio, ni un valor equivalente en otro selector.

> ⚠ **Y la cuarta añade un eje que las otras tres no tienen: el TIEMPO.** Las
> tres primeras se ven en el HTML servido tal cual llega; ésta sólo existe
> **después de ejecutar**. Así que una transformación que limpie el marcado tiene
> que preguntarse **qué scripts reparaban lo que va a dejar atrás** — y si quita
> el reparador, **deshacer la reparación a mano** es parte de la transformación,
> no un extra. Un marcado ofuscado más su descifrador son **una unidad**: media
> unidad no es una versión más limpia, es un defecto que el original no tiene.

⚠⚠ **Y LA QUINTA, QUE ES LA QUE SE COLA CON UNA MEDICIÓN BUENA DE COARTADA:
TRANSCRIBIR LA DECLARACIÓN SERVIDA NO ES TRANSCRIBIR LA CASCADA (2026-08-21).**

Las cuatro de arriba avisan de transcribir **algo que no estaba servido**. Ésta
avisa de lo contrario, y por eso es más difícil de ver: la declaración **estaba
servida, se leyó bien y se copió entera** — y aun así el clon sirve otro número.

> **Una regla puede estar en el canal, leerse correctamente y NO LLEGAR A LA
> PROPIEDAD.** Lo que el navegador aplica es el ganador de la cascada, y el
> ganador puede vivir en otra hoja, con otra especificidad, o con un
> `!important` que no está a la vista de quien leyó la regla que buscaba.

**Medido:** una tanda transcribió `#sidebar .et_pb_widget{margin-bottom:30px}`
del CSS servido. Correcto como lectura. Lo que no se miró es **quién gana**: el
tema sirve además `.et_pb_widget{margin-bottom:2rem !important}`, y ese
`!important` de hoja de autor le gana a la declaración específica. El valor real
es **32**, no 30, en las tres formas y a los dos anchos — y el error se pagó
cuatro veces, una por widget.

**Las dos mitades operativas:**

1. **el veredicto lo da `getComputedStyle` SOBRE EL ORIGINAL, no `grep` sobre
   las hojas.** `grep` contesta *«¿existe esta declaración?»*; la pregunta es
   *«¿cuál gana?»*, y sólo la tiene el navegador;
2. **y cuando haga falta saber POR QUÉ, se le pregunta a la cascada**
   (`CSS.getMatchedStylesForNode` por CDP), que devuelve **las reglas que casan,
   en orden**. Buscarla con `grep` depende de acertar el selector: en la misma
   tanda, la regla que faltaba se llamaba `.boton-azul` y el filtro exigía
   `button` en el selector, así que salió **cero** — §sondas 4 cometida sobre el
   filtro de un `grep` en vez de sobre un `querySelector`.

⚠ **Y su hermana pequeña, del mismo día: UN `em` CITADO SIN SU `font-size` ES
LA MISMA TRAMPA QUE UN `%` CITADO SIN SU CONTENEDOR.**

El documento ya avisa —«*un default expresado como porcentaje se lee como
constante en cuanto se cita, porque el px es lo que se puede comparar y el
contenedor no viaja con él*»— y **el `em` tiene exactamente la misma forma**,
con el contenedor cambiado: **el `font-size` final del propio elemento**.

**Medido:** de `padding: 0.5em 2.7em 0.6em 1.5em` se predijo una cuota de
**22 px** multiplicando por el `font-size: 20px` que declara el core del
constructor. El customizer del sitio lo baja a **15**, así que la cuota real es
**16.5**. La regla estaba bien leída y el número salió mal **por el
denominador**, que es el modo de fallo de esta familia entera.

> **Un valor relativo se escribe CON SU BASE MEDIDA —«0.5em de un cuerpo de
> 15»— o no se escribe.** Y la base se mide en el elemento, no se hereda de la
> hoja donde apareció la declaración.

⚠ **Y la tercera del mismo día, que es §*la causa común* con el contenedor
puesto en el SELECTOR: UNA REGLA EN EL NIVEL EQUIVOCADO NO DA ERROR.**

El clon servía un `:last-child { margin-bottom: 0 }` sobre **el widget**, donde
el original no lo tiene, y le faltaba el mismo `:last-child` sobre **el `li`**,
donde el original sí lo tiene. Las dos mitades del error son invisibles: la
sobrante quita un margen que nadie echa en falta, y la que falta añade **9 px**
en un elemento que ninguna medida de la página mira.

> **Al transcribir un `:first-*`/`:last-*`, la pregunta no es «¿existe?» sino
> «¿SOBRE QUÉ?».** Se comprueba midiendo **el primero y el último hermano por
> separado** en el original: si difieren, ahí está el nivel; si no, no está ahí.

De ahí las dos formas de aplicarlo, que son la misma:

- **Alturas** — se mide el DOM renderizado, y **por composición**: `padding-top`,
  contenido y `padding-bottom` por separado. El total solo dice si cuadra o no;
  la composición dice qué. Un Δ de cero puede ser dos errores que se anulan.
- **Enlaces** — se recorre el HTML servido y se compara contra **las rutas que
  emite el build**, no contra una lista escrita a mano. Guarda automática:
  `scripts/qa/enlaces.mjs`. Correrla después de clonar cualquier página: las
  rutas nuevas entran solas y sus enlaces pasan a ser fallo sin tocar la sonda.

### La causa común: el NIVEL al que se mide

Las dos formas de arriba, las tres suposiciones de la tabla y media docena de
hallazgos sueltos son **el mismo error**, y conviene enunciarlo una vez:

> **Una medición tomada a un nivel que puede absorber el error no es una
> medición.** Se mide **al nivel donde vive la propiedad**, no al que la
> contiene. Todo contenedor con holgura —una fila más alta que su columna, un
> total que suma con signos, un servidor que decide qué HTML sale— es un sitio
> donde el defecto cabe sin dejar rastro en el número que estás mirando.

Las seis instancias medidas en este proyecto, cada una con su contenedor:

| se midió | el contenedor absorbió | había dentro |
|---|---|---|
| el **total** de la fila del CTA de Industria: `+26.5` | la suma: contenido y ritmo con signos opuestos | **−47.5 de contenido tapados por +74 de ritmo** |
| el **alto de la caja** del CTA de Urbano: `+12.39` | la caja: el texto se reacomoda dentro | una **piel entera distinta** — el título pierde **151.89** de ancho y gana **51.79** de alto |
| el **alto de la fila** del claim de Urbano: `Δ0` a 1440 | la columna hermana, **390.08** contra 148 | **+10** de `padding-bottom` y **121.03** de centrado vertical perdido |
| el **HTML de `.next`**, en el test en negativo de `enlaces.mjs` | `next start` sirviendo el build anterior | el enlace roto — la sonda dio **«limpio» en falso** |
| **todo el cuerpo de 4 páginas de producto**, relativo al `h1`: `Δ0` | **el propio PROTOCOLO** — la regla del `h1` resta la base antes de comparar | **−48 y −19.2 de cabecera a 1440**, y **+78.42 y +48.42 a 390**: el signo se invierte |
| la **base en crudo** de `/accesorios` a 1440: `−19.2` | la suma otra vez: **dos defectos con signos opuestos** | **−48 de espaciador tapando +28.8 propios** (un `pt` de fila que el original no tiene, C-QA7). Un número pequeño no es un defecto pequeño: era el residuo de dos grandes |
| el **HTML servido** de las 10 instancias que pintan `#lista-soluciones`: `Δ0` | **el mecanismo de PESTAÑAS**: sólo se sirve el panel del producto ACTIVO, y el activo es el mismo en las 10 | **el panel entero de los otros 8 productos** — con sus viñetas, su imagen y su `href`. Ahí vivían el `<sup>` de CMS-SP-TIPO (4 filas) y 6 `href` a rutas que el build no emite. **Ninguna sonda de HTML servido puede verlos: no se sirven** (2026-08-06, ESQUEMA §7d) |

Los seis contenedores son distintos y el error es el mismo: se leyó el número
del nivel de arriba porque estaba a mano.

**Y hay un séptimo contenedor que no contiene píxeles ni filas, sino ELEMENTOS:
UN CARDINAL ES UN CONTENEDOR Y ABSORBE LA MEMBRESÍA (2026-08-13).**

> **Un recuento igual no prueba que los conjuntos sean el mismo.** `68 → 68` es
> exacto, y los dos conjuntos de 68 pueden diferir en 2 por lado sin que el
> número se mueva un dígito. Lo que prueba la igualdad de dos conjuntos es
> **nombrar cada elemento**, no contarlos.

Medido: `qa:lh-poblacion` daba `/blog 68 → 68` y lo destapó `cms:seed-listados`
al sembrar **por slug** — **2** entradas del corpus sin fila en la DB
(`descarga-catalogo-kunak` · `kunak-obtiene-el-sello-reconcilia`) y **2** filas
sin `recurso` fuera del corpus, compensándose. El seed las vio porque siembra
por slug; el recuento no podía verlas por construcción.

**Es el contenedor más barato del catálogo**, y por eso conviene tenerlo
presente: cuesta **un `diff` de listas**. La comprobación que sí discrimina es
la diferencia simétrica, y se escribe con los dos lados —*«2 en el corpus que la
DB no tiene, 2 en la DB que el corpus no tiene»*—, no con el total.

**Y su corolario, que es lo que lo hace regla y no anécdota:** un cardinal es la
unidad **más agregada posible** de un conjunto, así que es el nivel de arriba de
§La causa común aplicado a la membresía. La regla operativa es la misma de
siempre: **se compara en la unidad que se afirma**. Si la afirmación es «son los
mismos», la unidad es el ELEMENTO — y el recuento va al lado como resumen, nunca
como prueba.

⚠ **Y SU CASO PEOR, PORQUE EL EMPATE APAGA LA SOSPECHA EN VEZ DE ENCENDERLA: DOS
LECTURAS PUEDEN DAR EL MISMO CARDINAL CONTANDO UNIDADES DISTINTAS (2026-08-22).**

El caso de arriba —`68 → 68` con 2 por lado de diferencia— al menos cuenta lo
mismo en los dos lados. Éste no:

> **Cuando dos documentos describen «el mismo» conjunto y sus cardinales
> coinciden, la coincidencia se lee como confirmación cruzada — y puede ser que
> uno cuente PÁGINAS y el otro FAMILIAS.** Entonces no hay nada que cruzar: son
> dos conjuntos distintos, y el empate es lo único que impide verlo.

**Medido:** una fase tenía dos definiciones de su membresía, **las dos con 13**.
Una eran **13 páginas** (7 + 6 hubs); la otra, **7 páginas + 6 FAMILIAS** —que
son 35 rutas—. Su **intersección real eran 7**, y el conjunto verdadero, la
unión: **48**. Las dos llevaban meses escritas, y **cada lector elegía la suya**.

**Operativamente, y es lo de siempre con el objeto cambiado:** antes de dar dos
recuentos por concordantes, **comprueba que cuenten la misma unidad** — y si el
conjunto se puede nombrar, **nómbralo elemento a elemento**; la unión y la
intersección se calculan solas y el empate deja de decidir nada. Es §*una
cobertura declarada al nivel de arriba absorbe lo que no se midió abajo* con el
contenedor puesto en **la definición del conjunto**.

> **Y la salida es BORRAR una, nunca conciliarlas con una nota al pie**:
> mientras las dos estén escritas, la nota es una tercera lectura, no un
> arreglo.

⚠⚠ **Y AL BORRARLA, LA MITAD QUE FALTA — Y ES DONDE SE FABRICA EL ERROR ESPEJO:
CORREGIR UN DENOMINADOR NO ES SUSTITUIRLO EN TODAS PARTES (2026-08-22).**

El caso de arriba se arregla borrando una lectura. Pero cuando lo que cambia es
**el denominador de un conjunto**, el arreglo tiene dos mitades y sólo se hace
la primera:

> **Un mismo conjunto puede tener DOS CARDINALES CIERTOS A LA VEZ, uno por
> unidad.** Así que un acta que dice *«el denominador es 32, no 48»* está
> corrigiendo **una** unidad, y leerla como *«48 estaba mal»* mete 32 en los
> sitios donde la unidad correcta era la otra — que es el mismo error, con el
> signo cambiado y ninguna forma de notarlo.

**Medido:** un conjunto de rutas valía **48 en unidad RUTA** (URLs que el
original sirve de algún modo) y **32 en unidad PÁGINA** (documentos con HTML
propio), porque `48 = 32 páginas + 13 redirecciones + 3 bajas`. Barridos los
**19** sitios donde el 48 vivía: **2** eran lecturas refutadas, **6** eran
unidad RUTA y **ciertos**, **8** eran unidad PÁGINA y falsos, y **3** eran
predicados pre-registrados que no se reescriben. Sustituir a ciegas habría roto
los 6 buenos.

> **Operativamente, y cuesta una palabra por sitio: cada denominador se escribe
> CON SU UNIDAD** —«48 RUTAS», «32 páginas»—, **y el barrido clasifica antes de
> sustituir.** Un denominador sin unidad no se puede auditar: las dos lecturas
> se escriben igual.

**Y el corolario que decide dónde mirar:** cuando un acta corrija un cardinal,
lo que hay que derivar **no es dónde aparece el número viejo, sino qué unidad
usa cada aparición**. El primero es un `grep`; el segundo hay que leerlo — y es
el que evita cambiar un acierto por un fallo.

**Y el cardinal tiene una hermana que muerde ANTES: LA DEFINICIÓN DE «CUÁNTOS
HAY» ES ELLA MISMA UN CONTENEDOR.**

> **Un censo de NODOS y un censo de LO QUE SE VE son dos medidas distintas, y la
> primera se lee como la segunda en cuanto el CSS puede esconder.** Un elemento
> con `display:none`, con alto 0 o recortado por su padre **está en el DOM y no
> está en la página**: los dos recuentos son ciertos y sólo uno contesta la
> pregunta que se estaba haciendo.

Así que **un recuento de elementos se publica con su CRITERIO** —*«12 en el DOM,
11 con caja»*— o invita a construir el número equivocado. Es §*la causa común*
con el contenedor puesto **en la definición**, no en el dato: el nivel de arriba
aquí no es una fila ni un total, es *qué cuenta como «uno»*.

> ⚠⚠ **Y LA MITAD QUE NO ES DE RECUENTO, QUE ES PEOR: LO QUE NO TIENE CAJA NO ES
> QUE NO SE CUENTE — ES QUE NO SE PUEDE MEDIR, Y AUN ASÍ DEVUELVE NÚMEROS.**
>
> La regla de arriba dice *publica los dos recuentos*. Le falta decir qué hacer
> con esos elementos **después**, y la respuesta no es «contarlos aparte»:
>
> > **`getComputedStyle` sobre un elemento sin caja —dentro de un desplegable
> > cerrado, de una pestaña inactiva, de un `display:none`— NO resuelve los
> > porcentajes contra nada.** Devuelve ceros, y esos ceros **entran en una
> > distribución como si fueran dato**, fabricando un pico que el original no
> > tiene.
>
> Así que **se excluyen del análisis, no sólo del recuento** — y su exclusión se
> publica con su cardinal y su mecanismo. Medido: **36 de 313 módulos** de un
> arquetipo, **30 de ellos de un solo tipo**, todos dentro de desplegables
> cerrados; incluirlos habría dado ese tipo por «ritmo 0 en las 30».
>
> **Y lo que su geometría necesita no es otra sonda del HTML servido: es
> INTERACCIÓN** — abrir el desplegable—, o sea el eje que casi nunca está medido.
> Un tipo cuyas instancias viven todas escondidas se declara **SIN DERIVAR con lo
> que haría falta**, no se rellena con los ceros que el navegador devolvió.

**Y hay un contenedor hermano que no contiene elementos sino CAUSAS: EL RECUENTO
DE PARES TOCADOS POR UNA DERIVA DEL OBJETIVO.**

> **Cuando el objetivo se mueve, «cuántos pares tocó» NO dice si hay daño.** Un
> par que **ya difería** y cuya referencia se desplaza sigue difiriendo: la
> deriva le cambió la magnitud, no la existencia. El discriminador es el corte
> **CREA / MUEVE** —¿casaba antes ese par?— y hay que contarlo, porque el total
> los suma y **el total es el nivel de arriba de la atribución**.

**Y su mitad de redacción, que es donde se decide mal:** *«la deriva toca 248
pares»* y *«la deriva rompió 248 pares»* se escriben casi igual y sólo la segunda
justifica recalibrar el clon. **Recalibrar contra un objetivo que se acaba de
mover, sin ese corte delante, es exactamente cómo se fabrica una FAMILIA DE
CALIBRACIÓN**: la tanda siguiente encuentra el signo contrario y vuelve a mover.

**Y el sitio donde la deriva se esconde:** si tu comparador tiene un eje que
**no lee como defecto** —un «mixto», un «sin referencia limpia»—, la deriva
geométrica cae **entera ahí**, porque `y` y `h` son justo las magnitudes que
dependen de las dos cosas a la vez. Saltarlo con un `continue` publica **«deriva
= 0»** al lado de un control que dice que la referencia se movió: dos números
ciertos y una lectura falsa. **Los ejes excluidos se reparten igual y se
publican con su cardinal, fuera del recuento** (§regla 14).

> ⚠ **Y EL EJE QUE NO LEE COMO DEFECTO ESCONDE LA MEJORA EXACTAMENTE IGUAL QUE
> ESCONDE LA DERIVA (2026-08-19, 84.ª tanda).** La regla de arriba se escribió
> mirando el daño, y por eso se lee como una guarda contra falsos verdes. Tiene
> la otra mitad, y **produce el error contrario: dar por INERTE un arreglo que
> funcionó.**
>
> Medido: un arreglo de una línea movió **31 164 elementos** y el titular del
> comparador —`pares distintos`— dio **5 423 → 5 423** y **5 401 → 5 401**, o sea
> idéntico al par a los dos anchos. Todo el efecto había caído en el eje
> **mixto** (*«sin referencia limpia»*): `cabecera.rect.h` pasó de **203.59 a
> 217.19** contra un original de **225**, o sea **+13.6 px HACIA el original en
> las 69 formas, +938.4 acumulados y 0 que se alejen**. Leído por el titular, el
> veredicto habría sido «el cambio no hace nada» — y el paso siguiente,
> revertirlo.
>
> > **La lectura que sí discrimina no es un recuento: es comparar
> > `|clon − original|` ANTES y DESPUÉS, par a par.** El recuento dice cuántos
> > pares difieren; sólo la distancia dice **hacia dónde se movieron**. Un
> > comparador que clasifica antes de restar puede dejar el efecto entero fuera
> > de su titular, y el titular es lo que se cita.

---

### CUANDO EL CAMBIO SE PUEDA APLICAR, APLÍCALO Y MIDE — UN CENSO POR HEURÍSTICA NO DISTINGUE «HEREDA» DE «DECLARA LO MISMO» (2026-08-19)

Es §El principio —*verificar contra la salida servida*— aplicado a **un cambio
que todavía no se ha hecho**:

> **Para saber qué mueve un cambio, la heurística es el último recurso, no el
> primero.** Si el cambio se puede **simular por el mismo canal** que la regla
> que vas a escribir, simúlalo y mide qué se movió: eso no es una estimación del
> efecto, **es el efecto**.

**Y el motivo por el que la heurística falla no es la pereza — es que la
pregunta no se puede contestar con `getComputedStyle`:** el valor computado **no
dice de dónde viene**. Medido: censar *«elementos cuyo `lineHeight` es 1.7 × su
`fontSize`»* para encontrar los que heredan una razón tiene un falso positivo
real —un elemento que declara `font-size:14px` **y** `line-height:1.7em`, o sea
23.8, que es exactamente `1.7 × 14`—. La heurística lo cuenta como heredado
cuando declara lo suyo.

**Las dos mitades operativas:**

1. **la simulación va por el canal que reproduce la cascada** —un estilo en línea
   en el mismo elemento donde vive la regla—, no por un `!important` global ni
   reescribiendo hojas;
2. **y lleva su CONTROL, o no prueba nada** (§sondas 8): escribir **el valor de
   HOY** por ese mismo canal tiene que ser **NO-OP**. Si mueve algo, el canal no
   reproduce la regla y el censo no mide lo que dice medir. Sin ese control, un
   censo de 31 164 elementos es un número grande sin garantía de ser el correcto.

**Y la contrapartida, que es lo que lo cierra:** una vez aplicado el cambio de
verdad, **la misma sonda tiene que dar CERO**. El tratamiento pasa a ser NO-OP
porque ya está puesto, así que «0 movidos» es la prueba de que lo escrito en el
código es exactamente lo que se simuló — y de que no queda ni un elemento en el
estado viejo. Medido: **0 movidos y 374 rutas intactas a los dos anchos**.

**Y hay un octavo contenedor, que no contiene píxeles sino AFIRMACIONES: la
unidad en la que se declara la COBERTURA (2026-08-02).**

> **Una cobertura declarada al nivel de arriba absorbe todo lo que no se midió
> abajo.** «31/31 rutas» del eje horizontal era verdad **y una ruta contaba como
> cubierta con UNA de sus doce filas emparejada**. Medido en filas, el mismo eje
> daba **99 de 181**. El mismo número, dos unidades, y solo una de las dos es
> auditable.

La regla operativa es la de siempre, aplicada al informe: **la cobertura se
declara en la unidad que la sonda compara** —filas si compara filas, módulos si
compara módulos— y el recuento por ruta va al lado, porque el reparto nunca es
uniforme. Contar al nivel que hace la cifra bonita es el mismo error que medir la
fila cuando el defecto está en la columna.

**La quinta es la más antigua del proyecto y la que más costó ver**, porque el
contenedor no era una fila, ni una caja, ni un servidor: era **el instrumento de
medida**. Un protocolo que normaliza contra un punto de apoyo no puede detectar
que el punto de apoyo esté movido, y por eso la única salida es **mirarlo en
crudo una vez por arquetipo** (§Notas de método). Estuvo invisible desde el
primer clon y salió sola cuando el grupo C estrenó dos arquetipos que **no
tienen nada entre la cabecera y el `h1`** que lo absorbiera.

**Y EL NIVEL NO ES SOLO VERTICAL.** Las seis instancias de arriba son de alto,
y por eso la regla se lee como si fuera de alturas. No lo es:

> **El ancho de un elemento ENVUELTO es el de su contenedor, no el de su
> contenido.** Así que un ancho medido al ancho estrecho puede estar **tapado
> por el wrap** exactamente igual que un alto lo está por una fila con holgura:
> el elemento ya llena la línea, y lo que sobra se fue a la línea siguiente en
> vez de aparecer en el número.

Caso medido (A-QA1, 2026-07-31): la miga del grupo A envolvía un renglón de más
a 390 y la sospecha era el separador. **A 390 los dos separadores son
inobservables** —la miga llena el contenedor en los dos lados—, así que la
medida se tomó **a 1440**, donde cabe en un renglón: original **75.72** por
eslabón contra **75.89** del clon, o sea **+0.17**, tres órdenes por debajo del
renglón de 26. El separador quedó descartado con un número en vez de con una
corazonada, y la causa real —el último eslabón, `max-width: 350` en el
original— apareció en la misma corrida.

De donde el corolario operativo: **cuando el síntoma sea de envolvimiento, mide
al ancho donde NO envuelve.** El ancho estrecho da el efecto; el ancho donde
cabe da la causa.

> ⚠ **Y su INVERSA, que muerde al derivar un ancho DECLARADO a partir de una
> razón medida:** en un elemento de nivel **enlínea** la caja **es la de su
> contenido**, así que `caja / contenedor` no recupera ninguna declaración —
> mide el texto. La razón sólo devuelve lo que el editor escribió cuando la caja
> del numerador **la impone esa declaración**, o sea en nivel de bloque.
>
> **Se distingue con una propiedad que ya está a mano: `display`.** Medido, la
> señal es visible en los propios valores — un tipo de bloque da `33 · 50 · 75 ·
> 80 · 85 · 100` (limpios, declarados) y uno enlínea da `33.36 · 38.76 · 62.16`
> (fracciones del contenido). **Los dos se escriben igual y no son lo mismo**, así
> que el reparto se publica con su cardinal y los enlínea salen **SIN MEDIR por
> el instrumento, no por el original**.

**Y la vuelta que le faltaba: LA GUARDA TAMBIÉN TIENE UN NIVEL, y el suyo es
vertical (2026-08-01).** Al unificar las cuatro migas copiadas a mano se esperaba
que `clon-base` —el guardián clon-contra-clon, umbral cero— marcase las cuatro
rutas para adjudicarlas. Marcó **cero: `31 páginas · 0 con regresión` a 1440 y a
390**, con el cambio verificado en el HTML servido y `a-miga` midiendo **+33.25**
en una de ellas.

> **`clon-base` mide `docH`, `h1.y`, nº de secciones y nº de enlaces: todo alto y
> estructura.** Un defecto de **ancho** que no llega a cambiar el nº de renglones
> **no le mueve un solo píxel**. La guarda no falló: estaba mirando otro eje.

De ahí la lectura correcta de un verde suyo, que no es la que invita a dar:

> **Un `clon-base` limpio dice «no hay regresión VERTICAL», nunca «el cambio no
> tuvo efecto».** Para un cambio horizontal, la adjudicación tiene que venir de
> una sonda que mida **ancho contra el original** — que es justo lo que la regla
> de arriba pide, aplicada al instrumento en vez de al síntoma.

Es la sexta instancia del catálogo de abajo con un contenedor nuevo: no una fila,
ni una caja, ni un servidor, ni el protocolo — **el eje que la guarda no mide**.

**La regla espejo es un caso particular de ésta.** Un Δ0 en un ancho con Δ≠0 en el
otro no es «casi cuadra»: es una **medida tapada**, porque la holgura del
contenedor no es la misma a 1440 que a 390 —a 1440 las columnas van en fila y la
más alta manda; a 390 apilan y no hay dónde absorber—. Es el complemento de
«reproducirse entre anchos pesa más que el tamaño» (§Notas de método): si un
residuo que se repite en los dos anchos no puede ser ruido, un residuo que
**aparece solo en uno** es un contenedor que en el otro lo estaba tapando.

**Pero el contenedor con holgura no es el único mecanismo que tapa: el NO-WRAP
es otro, y se caza distinto.** Un contenedor que absorbe se encuentra con
`offsets.mjs` (holguras por columna). Un **texto que no envuelve** no tiene
holgura que mirar: a 1440 la línea cabe y el defecto **no deja ni rastro** —
solo aparece midiendo al ancho estrecho, por composición de la cadena. Caso
medido (C-QA7): el kicker de `/monitor` con estilo inline a 50px — **120 de
alto contra 42** a 390, los +78 exactos, con Δ0 perfecto a 1440. Cuando la
regla espejo dispare, las dos hipótesis se comprueban cada una con su
instrumento: la holgura con `offsets`, el no-wrap con la cadena al ancho que
falla.

⚠ **Y el no-wrap tiene una segunda cara, que es peor porque NINGÚN ancho la
enseña (2026-08-02).** En C-QA7 el defecto se veía a 390 y no a 1440: bastaba
medir al otro ancho. Pero si **el texto de todas las instancias que tienes
delante es corto**, un ancho de contenedor equivocado no envuelve en **ninguno**,
y entonces no hay ancho al que ir:

> **Un ancho mal no cuesta un solo píxel hasta que el texto envuelve. Así que el
> detector de un defecto de ancho no siempre es OTRO ANCHO — a veces es OTRO
> CONTENIDO.**

Medido: el `h1` de la cabecera de `/sectores/*` iba al **100 %** de la fila donde
el original le da el **50 %**. Los **4 sectores vivos** tienen titulares que caben
en un renglón con 619 px y con 1238, así que el defecto da **Δ0 a los cinco anchos
medidos** en las cuatro. Apareció en el **MONOGRÁFICO**, que comparte el
componente y trae titulares largos: **−36.02**, o sea un renglón de 36 exacto.

De donde la comprobación que hay que añadir al barrido de un componente
compartido: **no basta con recorrer las N instancias de su arquetipo a dos
anchos.** Si el componente lo usa un segundo arquetipo, **ése es parte del
barrido**, y si sus contenidos son más largos, es el único sitio donde el defecto
existe. Es también por lo que la **FAMILIA DE CALIBRACIÓN** no siempre es una
familia de páginas: aquí lo era de **arquetipos**.

⚠ **Y la tercera cosa de la que puede ser familia: el ESQUEMA (2026-08-08,
§F2-5-ESCALON-ETIQUETAS).** Las dos de arriba son de píxeles. Ésta no, y por eso
conviene enunciarla aparte:

> **Una regla derivada sobre un dominio donde el caso NO SE DA no está probada
> para ese caso: está SIN PROBAR.** Y se lee como probada, porque la derivación
> es correcta y el dominio es real.

Medido, y las dos mitades eran ciertas: *«un recorrido de los 9 catálogos —46
filas— da **0 arrays vacíos explícitos**, así que la lista vacía vuelve
AUSENTE»*. Verdad. **La conclusión no se sigue**: «0 vacíos explícitos» dice que
la preimagen es única **en ese dominio**, no que «ausente» sea la respuesta
correcta para todos los campos. El dominio eran **7 entradas de blog de 149**, y
el original ejerce el caso **8 veces**. Costó una fase parada: el primer editor
dio de alta una entrada sin etiquetas y el build murió con `undefined.length`.

**Las dos consecuencias operativas, y la segunda es la que se olvida:**

1. **Un campo que ADMITE un caso y que ningún dato de calibración EJERCITA es un
   camino de render sin estrenar.** Se inventaría —`npm run qa:nunca-vistos`,
   208 de 296— y se declara con su alcance; no se da por soportado;
2. **el arreglo se ESTRECHA a donde la regla se derivó, no se sustituye por la
   contraria.** Aquí: la lista vuelve `[]` **salvo** que el campo declare que el
   dato medido la omite, y el discriminador **se deriva** (de la ida) en vez de
   elegirse. La prueba de que no se cableó nada es que el cambio fue **NO-OP
   sobre todo lo medido** — 63/63 y 63/63 sin moverse, 31/31 sin un píxel.

**Y el defecto se pone en la dirección que GRITA** (§sondas 6): olvidar declarar
un campo omitible hace fallar el round-trip **en el acto**; olvidar lo contrario
—el defecto viejo— no hace fallar nada y mata el render delante del editor.

⚠ **Y la CUARTA cara, que no es de dominio sino de ÁLGEBRA: DOS VARIABLES
CONFUNDIDAS (2026-08-10, F3-1).** Las tres de arriba dicen que una regla puede
estar sin probar **fuera** del dominio donde se derivó. Ésta dice algo peor:

> **Si dentro del arquetipo donde la mediste dos variables toman siempre el
> mismo valor, la regla que escribas nombrará una de las dos AL AZAR — y será
> cierta dentro y falsa fuera.** No es un error de razonamiento: es que **la
> medición no puede distinguirlas**, y el enunciado no lleva marca de eso.

**Medido, con las dos direcciones y sus números.** El default de `margin-bottom`
de un módulo se derivó de `articulos-kb`, donde **todas las filas miden 911.75**;
allí «tipo de columna» y «ancho de fila» son indistinguibles, y la spec escribió
*«es una función del TIPO DE COLUMNA»*. Con un segundo arquetipo delante
(`mono-modulos-{1440,390}.json`, filas de 1238.39) manda **el ancho de la FILA**:
un `1_2` de **585.13** en fila de 1238.39 lleva `34.0469`, y un `2_3` de
**591.11** —casi el mismo ancho de columna— en fila de 911.75 lleva `25.0625`.
Generalizar la regla de KB hacia atrás habría puesto `25.0625` en **35 módulos
medidos a `34.0469`**.

**Cómo se detecta, y es barato:** antes de escribir una regla con la forma *«X
depende de Y»*, comprobar que **Y VARÍA** en el dominio donde se midió. Si Y es
constante ahí, la regla no está probada: está **nombrando una correlación**, y
hay que decir contra qué otra variable no se pudo separar. Un `select` sobre el
dominio agrupando por Y contesta la pregunta en una línea.

> **Y el corolario que evita el falso positivo simétrico:** un discriminador
> hallado en **una sola instancia** tampoco es un discriminador. Medido el mismo
> día: las dos pieles del `h3` de KB viven en una sola página, así que `fila` y
> `mb` «las separaban» — cualquier eje posicional lo hace cuando los grupos caen
> en bloques. Se exige que la separación se sostenga en **≥2 instancias**, y si
> no, se reporta **NO ESTABLECIDO con su denominador**
> (`qa:kb-tipografia`).

> ⚠⚠ **Y ese «≥2» ESTÁ MAL PUESTO COMO LISTÓN, corregido 2026-08-13 (66.ª
> tanda).** «≥2» nació para descartar el caso degenerado de n=1, y se lee como
> si a partir de 2 la cosa estuviera establecida. **No lo está**, y el contraste
> lo dio esta tanda con una hipótesis que tenía las tres cosas que hacen creíble
> una medida:
>
> | la hipótesis | lo que tenía a favor |
> |---|---|
> | *«el tope del extracto son 270 BYTES, no 270 caracteres: PHP `substr` cuenta bytes»* | **mecanismo** real y comprobable · **2 casos** que encajaban al carácter · una tabla con sus números |
>
> Barrida contra **las 6** tarjetas con cuerpo: **ninguna longitud en bytes pasa
> de 5/6**, y dos en caracteres dan **6/6**. Era falsa.
>
> > **Una explicación con mecanismo y dos casos a favor se parece muchísimo a una
> > medida, y la única diferencia es EL DENOMINADOR.** Así que el listón no es
> > «≥2»: es **todo el dominio alcanzable** — y cuando no se alcanza entero, lo
> > que se publica es la fracción (`6/6`, `5/6`), nunca «se comprobó».
>
> Y la contrapartida operativa, que es barata: **antes de escribir una regla
> ajustada, BARRE el parámetro** en vez de razonarlo. Aquí fue un bucle de 250 a
> 300 en las dos unidades — y de paso dijo que **268 y 269 son indistinguibles
> con n = 6**, que es información que ninguna deducción iba a dar.

⚠ **Y la MISMA álgebra aplicada a un MODELO en vez de a una regla: DOS MODELOS
QUE PREDICEN LO MISMO EN TODO TU DOMINIO SON UNO SOLO (2026-08-14, F3-2).**

La regla de arriba protege de nombrar **una variable** al azar. Ésta protege de
elegir **un modelo** al azar, y su síntoma es distinto: no es un enunciado
sospechoso, es un **porcentaje de acierto altísimo**.

> **Un modelo se elige por lo que lo SEPARA de su alternativa, no por lo que
> acierta.** Antes de decidir, cuenta las **instancias SEPARADORAS** —aquéllas
> en las que los dos candidatos predicen cosas distintas— y **publica ese
> número al lado del acierto**. Si son cero, no has elegido: has escrito uno de
> los dos.

**Medido:** para la ruta de un término había dos modelos —**derivarla** de la
jerarquía (`prefijo + [padre] + slug`) o **cablear el prefijo**—. El derivado
acierta **35/35**, y ese número no decide nada: en las **8 hijas** los dos dan
exactamente la misma URL. Lo que decide son los **2** términos de **primer
nivel**, donde derivar predice **un** segmento y cablear predice **dos**. O sea
que el denominador real de la elección es **2**, no 35.

**Y el coste de no contarlos ya estaba cobrado en el árbol:** `extractor-a.mjs`
había elegido «cablear» —busca el término por el literal `recursos/articulos`— y
por eso **2 de 149** entradas pierden su campo en silencio. El modelo equivocado
no dio error: dio **81 aciertos**.

**Operativamente**, y cuesta una línea: la sonda que compara los dos modelos
publica `separadores` junto a `aciertos`, y **su control en negativo exige
`separadores > 0`** — si no, el veredicto es *SIN PROBAR*, no *probado*
(`qa:lh-jerarquia`).

> ⚠⚠ **Y AHORA LA VUELTA, PORQUE LA REGLA DE ARRIBA TIENE UN FALSO POSITIVO Y ES
> CARO (2026-08-17, 75.ª tanda): «0 SEPARADORAS» TAMBIÉN SALE CUANDO NO HAY NADA
> QUE ELEGIR.**
>
> *«Cero separadoras ⇒ no has elegido, has escrito uno de los dos»* es cierta
> cuando los dos candidatos son **funciones distintas** que tu dominio no
> distingue. Pero el mismo cero sale, con la misma cara, cuando los dos
> candidatos son **la MISMA función escrita de dos maneras** — y ahí no hay nada
> que fichar: fichar un pendiente sería mandar a la tanda siguiente a medir algo
> que no existe.
>
> **Medido:** el número grande de la piel B parecía tener dos predicados,
> `L ≥ fin + 3` y `L ≥ n + 5`, y ninguna de las 43 instancias los separaba. No
> podían separarlos: en la ventana sin recortar `fin = n+2`, así que las dos
> condiciones son idénticas; y en los recortes (`n ≤ 2`, `n ≥ total−1`) caen del
> mismo lado **porque `L` es múltiplo de 10 y nunca vale 6 ni 7**. Son la misma
> función en todo el dominio posible, no sólo en el medido.
>
> > **Antes de fichar una indeterminación, comprueba que las dos hipótesis sean
> > DISTINTAS — y si lo son, di sobre qué entrada difieren.** Es una comprobación
> > de álgebra, no de medición, y es la única que separa *«mi dominio es pobre»*
> > de *«aquí no hay dos cosas»*.
>
> El discriminador operativo: **una separadora es una ENTRADA CONCRETA en la que
> los dos predicados dan resultados distintos.** Si no puedes escribirla —ni
> siquiera una hipotética, fuera de tu dominio— no tienes dos modelos.

> ⚠⚠ **Y LA TERCERA CARA, QUE FABRICA EMPATES QUE NO EXISTEN (2026-08-18, 78.ª
> tanda): UNA COTA Y UNA REGLA GENERADORA NO SON LA MISMA AFIRMACIÓN.**
>
> Las dos de arriba miran si los dos modelos difieren. Ésta mira **qué se está
> comparando**, y es la que deja una pregunta bancada meses:
>
> > **Una COTA (`≤ N`) sólo se moja sobre el TECHO. Una REGLA GENERADORA
> > (`corta a N`) predice el VALOR EXACTO.** Dos cotas empatan con facilidad
> > —les basta que nadie pase del techo—; dos reglas generadoras empatan sólo
> > si predicen lo mismo. **Comparar cotas y creer que has comparado reglas da
> > «0 separadoras» sobre un dominio que separaba de sobra.**
>
> **Medido:** el tope del extracto de un arquetipo tenía dos candidatos,
> `chars ≤ 99` y `bytes ≤ 100`, y las dos cotas aciertan **23/23** con **0
> separadoras** — de ahí una indeterminación fichada y bancada. Leídas como
> reglas, no había empate: el dato da `bytes {100: 23}` —**constante**— contra
> `chars {97:4, 98:9, 99:10}` —**tres valores**—, así que una regla en
> caracteres predice constante en caracteres y cae a **10/23**. Estaba
> **refutada desde el primer día**; la cota lo tapaba.
>
> **Es §*la causa común: el NIVEL al que se mide* con un contenedor nuevo — la
> cota es el nivel de arriba de la regla**, y absorbe toda la varianza que la
> regla sí predice. Un techo de 100 se lleva por igual al 97, al 98 y al 99.
>
> **Operativamente, y cuesta una línea:** si tu candidato tiene la forma `≤ N`,
> **conviértelo en `= f(x)` antes de contar separadoras** — y compara la
> DISTRIBUCIÓN de lo observado, no si cabe. Una distribución con varianza refuta
> por sí sola cualquier regla que prediga constante, sin necesidad de fabricar
> ninguna instancia.

> ⚠⚠ **Y LA CUARTA CARA, QUE NO CONFUNDE DOS VARIABLES SINO DOS EJES: N VALORES
> DE UN TOTAL NO SON N FAMILIAS (2026-08-20, 86.ª tanda).**
>
> Las tres de arriba miran si dos candidatos difieren. Ésta mira **cuántas cosas
> hay**, y su síntoma es una tabla que cuadra:
>
> > **Un TOTAL puede confundir DOS EJES INDEPENDIENTES, y entonces `N` valores
> > distintos se leen como `N` familias.** Descompuesto, casi siempre son
> > **`a × b` combinaciones de dos ejes** con `a·b ≥ N` — y las familias que
> > parecían tener `n = 1` resultan ser **una combinación de ejes que sí están
> > sostenidos**.
>
> **Medido:** el pie del original servía **4 valores del alto total**, y de ahí
> «cuatro pies, uno por familia». Una de las cuatro tenía **n = 1** —o sea una
> varianza cero que sólo dice que no había con qué variar—. Descompuesto por
> sección, eran **3 pieles × una sección CTA ortogonal**, y las pieles a su vez
> **dos ejes binarios** (ancho de fila × `padding` de sección). Con la CTA fuera
> de la firma, la familia de `n = 1` **cae encima de otra** y su `n` pasa a
> **64**.
>
> **Las dos consecuencias, y la segunda es la que ahorra el trabajo:**
>
> 1. **el modelo se encoge y se sostiene mejor a la vez** — de «4 familias, una
>    sin establecer» a «3 pieles, todas con n ≥ 2»;
> 2. **los ejes suelen estar YA implementados por separado.** Aquí las tres
>    pieles existían en el clon como tres presentaciones; lo que fallaba era el
>    **mapeo**. Escribir «cuatro pies» habría creado una variante nueva
>    duplicando una existente.
>
> **Operativamente:** antes de nombrar `N` familias por `N` valores de un total,
> **descompón el total y agrupa por la firma SIN cada componente, uno a uno.**
> Si al quitar uno dos familias colapsan, ese componente es un **eje ortogonal**
> y no parte de la familia. Cuesta un `groupBy` y es §*la causa común* aplicada
> al **recuento de tipos** en vez de al valor.

⚠ **Y la misma álgebra aplicada AL COMPARADOR en vez de a la spec: UN VERDE VALE
LO QUE VALEN SUS INSTANCIAS SEPARADORAS, NO LO QUE VALE SU RECUENTO DE PARES
(2026-08-14, F3-2).**

La regla de arriba mira el dominio **de la medición** que eligió el modelo. Ésta
mira el dominio **de la comparación que después lo da por bueno**, y tiene dos
mitades que se suman:

> **(a) El recuento de pares no es el denominador de nada.** Un comparador puede
> publicar decenas de miles de pares verdes y **cero instancias separadoras** de
> una pieza concreta: entonces su verde **no ha elegido** entre los dos modelos de
> esa pieza, la ha escrito. El número que hay que publicar al lado del verde es
> *cuántas instancias distinguían los candidatos*, no cuántos pares se compararon.
>
> **(b) El dominio EFECTIVO de un comparador es más pequeño que su universo,
> porque lo AUSENTE no se resta en ningún sitio.** Las formas que el clon todavía
> no sirve están en el universo del espejo, salen contadas en «13 formas» y en el
> resumen como `ausentes`, y **no propagan a ningún denominador**. Lo que se
> comparó de verdad es *universo − ausentes*, y ése es el número contra el que se
> lee el verde.

**Medido, y las dos mitades hicieron falta:** un defecto de paginador falso en
**31 de 38** instancias salió **verde**. El acta lo explicó por (a medias) el
alcance —*«el comparador sólo mira páginas 1»*—, y cruzando **por ruta** en vez de
por cardinal salió más estrecho: de las **43** instancias, **3** estaban en el
universo del comparador, **2 de esas 3 eran formas AUSENTES**, y la **única**
comparada tenía `total = 4`, donde los dos modelos emiten lo mismo. O sea
**1 comparada · 0 separadoras**. Instrumento: `qa:lh-alcance` §`alcanceReal`.

> **Y el corolario de redacción, que es donde se cuela:** *«el comparador sólo
> mira X»* y *«de esto, el comparador comparó UNA y no separaba»* suenan igual y
> **no son la misma afirmación** — la primera es sobre el alcance, la segunda
> sobre el poder discriminante, y **sólo la segunda explica un verde**. Un alcance
> estrecho no produce por sí solo un falso verde: lo produce que **lo que cayó
> dentro no distinguiera nada**.

**Y su mitad de ALCANCE, que es la otra cara y se declara aparte:** cuando el
arquetipo tenga **más de una página por ruta** —paginación, series, pestañas—, la
cobertura **no se puede declarar en rutas**: se declara en la unidad que la
midió. Si otra sonda del repo ya estableció esa unidad, **su veredicto manda**, y
que dos instrumentos del mismo repo estén en desacuerdo sobre la unidad es cosa
que se resuelve **antes** de leer ninguno de los dos verdes. Medido: un
comparador declaraba «13 formas» y comparaba **13 páginas de 149**, todas la
página 1 — `intermedia` **86** y `última` **28** sin abrir a ningún ancho, y
**11 de 38** clases tocadas.

⚠ **Y el tercer caso de la misma familia, que es el que se cuela porque parece
resuelto: UN DISCRIMINADOR 1:1 PUEDE SER LA SOMBRA DE OTRO (2026-08-10, F3-1).**

Los dos de arriba son sobre variables que **no** se pueden separar. Éste es
sobre una que sí, y que nadie mira porque la primera ya casaba perfecto:

> **Cuando el eje que separa tus grupos es un campo que declaraste FUERA del
> modelo, sospecha de él antes de fichar el conflicto.** Un 1:1 no dice cuál de
> las dos variables es la causa — dice que en tus datos van juntas —, y la que
> tienes a mano suele ser la sombra de la que no.

Medido: el envoltorio de imagen del original sirve `display` en dos valores,
**`inline-block` ×14 y `block` ×7**, y los separa **1:1 el `srcset`** — que este
arquetipo dejó fuera con su ficha. Leído así, era una decisión de modelo
cobrándose geometría. Censadas las 21 extensiones, la partición es **la misma y
con causa**: los 7 de `block` son **los 7 `.svg`**. WordPress no genera `srcset`
para SVG, o sea que `srcset` no era el discriminador: era su **sombra**.

**Y la diferencia no es académica, porque decide dónde se escribe la regla:**
sobre `srcset` no se puede escribir —el clon no lo tiene— y sobre la extensión
sí, que viaja en el `src`. El criterio para elegir el eje es ése: **el que tenga
mecanismo y esté SERVIDO en los dos lados**.

⚠ **Y su regla hermana, de MÉTODO y no de dominio: UNA COMPROBACIÓN RETROACTIVA
SE ENMARCA EN LAS DOS DIRECCIONES.**

> **Preguntar «¿lo viejo está mal?» sesga qué respuesta se encuentra.** La otra
> mitad —**«¿lo NUEVO está sobre-generalizado?»**— se contesta con la misma
> medición y casi nunca se hace, porque lo nuevo acaba de medirse y se siente
> firme. Las dos preguntas tienen la misma forma y **respuestas independientes**.

**La evidencia es la propia comprobación de arriba:** se encargó en la dirección
*«¿hay columnas estrechas en los arquetipos construidos que lleven `34.0469`
donde tocaba `25.0625`?»* y **se contestó en la contraria** — no había nada que
corregir en lo viejo (sus 35 módulos llevan el valor medido), y el riesgo real
era la regla nueva aplicada hacia atrás. **Con el marco de una sola dirección,
el hallazgo cabía en el resultado «no hay nada» y se habría cerrado en verde.**

Operativamente: una tanda que revise algo retroactivamente escribe **las dos
preguntas antes de mirar**, y contesta las dos con el mismo barrido.

**Y su corolario de instrumento, pagado en la misma corrida:** para afirmar
«envuelve un renglón más» hace falta **contar renglones**, y
`elemento.getClientRects().length` **no los cuenta** — en un elemento de bloque
devuelve la caja de borde, o sea **1 siempre**. La primera versión de
`cabecera-cmp` informaba «1 renglón» de un `h1` de 82 px con `line-height: 36`:
un número plausible, sin error, y falso, **justo al lado del Δ de alto de −36 que
lo contradecía**. Se cuentan con un `Range` sobre el contenido, agrupando las
cajas por su `top`.

**Y hay instrumento, no solo regla.** `scripts/qa/offsets.mjs` mide, por columna,
cuánto puede fallar dentro sin que la fila se mueva (`absorbe`), y el offset de
cada nodo dentro de su padre —que es lo único que ve el centrado vertical—. En
Petróleo a 1440 hay **11 columnas con holgura, de 16 a 421.11**: ése es el margen
de error real del árbol de filas en esa página. Cuando la sonda dice que **no hay
holgura**, entonces sí: el alto de la fila es concluyente.

⚠⚠ **Y LA HOLGURA TIENE UNA CONSECUENCIA SOBRE EL MUESTREO QUE NO ESTABA
ESCRITA: PARA UNA PROPIEDAD TAPADA, «LA PRIMERA Y UNA INTERMEDIA» ES UN CERO
GARANTIZADO (2026-08-21).**

Todo lo de arriba dice **a qué nivel** medir. Esto dice **qué instancias**
elegir, y es el mismo error una vuelta más arriba:

> **Un catálogo de instancias «típicas» no puede detectar si un arreglo llega a
> la MAQUETACIÓN cuando la pieza vive dentro de un contenedor con holgura.** En
> todas las instancias típicas el contenedor gana, así que el número sale igual
> con la pieza bien y con la pieza mal: **cero instancias separadoras**, y el
> verde es del muestreo, no del arreglo.

**Medido:** un comparador de barra lateral eligió *«la primera y una
intermedia»* de cada forma —6 páginas— y dio **Δ0** tras el arreglo. Correcto y
**mudo sobre la maquetación**: en las 6, la columna de contenido es más alta que
la barra y la tapa. Lo destapó la guarda de regresión: **382 rutas, 1 movida**, y
era la **última página de una serie** —la de menos tarjetas—, donde la barra
sobrepasa a la columna. Añadida al catálogo, el veredicto pasó de «Δ0 en 6
páginas que no podían distinguir» a «Δ0 en 7, una de ellas separadora».

> **La instancia que hay que meter en el catálogo es aquélla DONDE LA HOLGURA SE
> ACABA, y casi nunca es la típica: es la más corta, la más vacía, la última de
> su serie.** Se busca preguntando *«¿en qué instancia deja de mandar el
> contenedor?»*, no *«¿cuál es representativa?»*.

**Y el corolario de lectura, que es la otra mitad:** cuando una guarda vertical
diga **«N−1 sin mover un píxel y 1 movida»** tras un arreglo de una pieza tapada,
eso **no es una regresión con ruido**: es exactamente la firma esperada — las
N−1 no se movieron **porque no podían**. Leerlo como *«el arreglo casi no hizo
nada»* invierte el veredicto, y es §*el eje que no lee como defecto esconde la
mejora igual que esconde la deriva* con el contenedor puesto en el **muestreo**.

⚠ **Y SU TERCERA MITAD, QUE ES DE PRE-REGISTRO Y SE COBRA AL DÍA SIGUIENTE: UNA
PREDICCIÓN SOBRE UNA PROPIEDAD TAPADA SE ESCRIBE CON SU ANCHO (2026-08-22).**

Las dos de arriba dicen qué instancias elegir y cómo leer el resultado. Ésta
dice **cómo se enuncia la predicción**, y su síntoma es que la misma frase sale
refutada y confirmada sin que nadie se haya equivocado:

> **El contenedor que tapa una propiedad NO ES EL MISMO a los dos anchos** —a
> 1440 las columnas van en fila y la más alta manda; a 390 apilan y no hay dónde
> absorber—. Así que **una predicción de movimiento sin ancho es DOS
> predicciones**, y el ancho al que la corras decide cuál de las dos contestas.

**Medido, y las dos lecturas son correctas:** el pre-registro decía *«deben
moverse 52 rutas y no deben moverse 330»*. A **1440** dio **1 de 52** —refutado,
y bien: `#left-area` tapa a las otras 51—. A **390**, **52 de 52 y 330 quietas**,
con **diferencia simétrica 0/0** contra el conjunto derivado. Misma frase, mismo
arreglo, mismo día: lo único que cambió fue el ancho.

> **Operativamente, y cuesta tres palabras: «a 390» dentro de la predicción.** Y
> su corolario de lectura, que es el que ahorra una tanda: **una refutación en el
> ancho donde la propiedad está tapada no refuta nada** — deja la predicción
> **sin ejercitar**, y el instrumento que la ejercita es **el otro ancho**, no
> otra sonda. Es §la regla espejo aplicada al pre-registro en vez de al residuo.

### EL INVENTARIO DE MEDIA SE DERIVA DE LOS CANALES QUE EL ESQUEMA DECLARA, NO DE LOS QUE ALGÚN EXTRACTOR YA LEE (2026-08-13)

**Es la §regla 9 —derivar en vez de recordar— aplicada a un CONJUNTO en vez de a
un número, y se ha pagado CUATRO veces con la misma moneda.**

| # | canal | cómo se descubrió | n |
|---|---|---|---|
| 1 | el CUERPO rico | el seed murió al sembrar `entradas-blog` | 1889 → 28 |
| 2 | la DESTACADA y el `og:image` | el seed murió otra vez | 93 → 4 |
| 3 | **la foto del PANEL de producto** | el seed murió otra vez | **5** |
| 4 | **las HOJAS CSS ENLAZADAS** | ⚠ **no mató un seed: dejó una condición de T9 sin pagar durante dos tandas** | **505 distintas · 0 capturadas** |

Las cuatro veces el inventario se derivó **de lo que el extractor de turno ya
sabía leer**, y las cuatro veces el canal que faltaba apareció **chocando** con
algo. No es mala suerte: es que

> **un canal nuevo no avisa — espera a que alguien lo siembre.** El esquema, en
> cambio, **ya lo declara**: cada campo `upload` y cada campo de texto que el
> modelo usa para una URL de asset es un canal, tenga dato hoy o no.

**Las cuatro mitades de la regla, y ninguna sobra:**

1. **Los canales se enumeran caminando la CONFIG**, no una lista. Un canal
   declarado y todavía **sin dato sale nombrado con su cero** — eso es lo que lo
   convierte en un hueco futuro visible en vez de en la próxima sorpresa. Medido:
   **39 declarados · 16 ejercidos · 22 sin dato**;
2. **el cruce va contra LA GUARDA QUE PARA, no contra otra.** `seed.mjs` exige el
   fichero **exacto** en `apps/web/public`; `seed-kb.mjs` acepta `media-corpus/`
   y colapsa variantes. Derivar contra la que no corre es lo que convirtió **«90
   sin capturar» en «4»**: un número correcto de una pregunta que nadie hace;
3. **un canal que otro sembrador cubre NO es «sin dato»**, es *fuera de alcance*
   — decirlo de otra forma declara un cero que nadie midió (§sondas 4);
4. **y el instrumento tiene que poder RECORRERLO entero**: la guarda que mata al
   sembrar impide contar al medir. Por eso `creaContexto().media` tiene rama de
   sondeo —anota `{ruta, canal, existe}` en vez de tirar—, igual que `rel()`.
   **Un inventario no se puede derivar con un instrumento que muere en la primera
   ausencia**, y ésa es exactamente la razón por la que se descubría chocando.

**El instrumento es `npm run qa:media-canales`**, y su lista congelada la
consumen las dos campañas (`captura-f3-media --lista=` y `coloca-media
LISTA=`) — una sola definición de «lo que falta», elegida por parámetro y nunca
por fallback silencioso.

⚠ **Y capturar no es COLOCAR.** Son dos pasos y el segundo se olvidó una vez
entera: `cms:captura-*` deja los bytes en `media-corpus/`; `cms:coloca-media` los
copia a `apps/web/public` y regenera variantes. Entre los dos, el inventario
sigue diciendo que falta — y tiene razón.

#### ⚠ Y el cuarto canal AMPLÍA la regla, porque no se descubrió sembrando: LAS HOJAS CSS ENLAZADAS ENTRAN EN LA CAPTURA POR DEFECTO (2026-08-13)

Los tres primeros canales **mataron un seed**, así que la regla se escribió con
la forma *«el canal que falta aparece al sembrar»*. El cuarto no mata nada, y por
eso vivió más:

> **Un HTML capturado sin sus hojas no es la página: es su esqueleto con el
> estilo puesto por otro.** Y no da error — da una captura **PLAUSIBLE**, que es
> la peor salida posible.

**Lo que costó, con sus dos números:**

- §F3-1-CSS-NO-CAPTURADO: 19 hojas pedidas, **0 capturadas**, y la captura
  offline midiendo `columna.width` **678.52 contra 430.80** en vivo — sin las
  hojas la partición en columnas no ocurre y **una spec habría afirmado, con
  número, que el cuerpo de ese arquetipo es plano**;
- la cuarta condición de T9 (**el NO-OP al píxel**) quedó **dos tandas** sin
  pagar, porque la única derivación posible —*¿tienen render estas clases?*—
  sólo podía mirar el CSS **en línea** y tenía que declarar su límite.

**Las dos mitades que se añaden:**

1. **Toda campaña que congele HTML congela sus HOJAS ENLAZADAS.** Un `<link
   rel=stylesheet>` es un canal exactamente igual que un `<img src>`: sin él, lo
   capturado no reproduce lo servido. `npm run cms:captura-css` deriva el
   inventario del corpus entero y **pide sólo la lista que se le nombre**;
2. **y el inventario se declara con su cero, como los otros.** Medido hoy:
   **505 hojas distintas · 62 en más de una página · 443 en una sola**, de las
   que **498 son `et-cache`** — Divi compila una hoja **por página y por
   plantilla**, así que este canal **no es un conjunto pequeño y compartido** y
   capturarlo entero es una campaña con su encargo, no un parámetro por defecto.
   Hoy capturadas: **7 de 505** (las de `castel-d-ario`, para T9).

> **Y la lección de método que generaliza los cuatro:** el disparador de los tres
> primeros fue *«algo se rompió»*. Un canal cuyo síntoma es **una medida
> plausible** no tiene disparador — así que la única defensa es **enumerar los
> canales antes de necesitarlos**, que es lo que la regla ya decía y lo que
> «esperar a que el seed muera» venía sustituyendo sin que se notara.

> ⚠⚠ **Y EL MECANISMO QUE HACE OPERATIVA LA MITAD 1, medido el 2026-08-22: EL
> `et-cache` NO ES UN FICHERO ESTÁTICO — SE RECOMPILA AL RENDERIZAR LA PÁGINA.**
>
> *«Captura HTML y hojas como una unidad»* sonaba a higiene —capturar junto lo
> que va junto—. **No es higiene: es el único ORDEN que funciona.**
>
> > **Pedir una hoja `et-cache` EN FRÍO devuelve 404. Pedir primero su PÁGINA la
> > crea, y entonces la hoja existe.** Divi la compila por página, y si la ha
> > purgado no la sirve hasta que alguien renderiza la página que la necesita.
>
> **Medido, y la trampa es que el 404 tiene toda la cara de una baja
> definitiva:** una campaña pidió 49 hojas y **15 dieron 404** en 8 páginas. La
> lectura natural —*«Divi las purga, son irrecuperables al `?ver=` capturado»*—
> es **falsa**, y la refutó **una petición**: las mismas URLs daban **200** justo
> después de pedir su página. Calentadas las 8 y repetida la campaña: **15/15,
> 0 fallos.**
>
> **Las dos mitades operativas:**
>
> 1. **una campaña de hojas pide la PÁGINA antes que sus hojas**, siempre — no
>    sólo cuando falle. El coste es una petición por página;
> 2. **y un 404 de `et-cache` NO se reporta como ausencia sin haber calentado su
>    página.** Es §*un selector que no casa con nada no es un cero* con el
>    contenedor puesto en el **servidor**: el cero lo fabricó el orden de las
>    peticiones, no el original.
>
> **Y lo que costaba creérselo:** el informe iba a declarar «35 de 50, y 8
> páginas sin hojas recuperables» — un pendiente **inventado**, sobre páginas que
> incluían una de las dos separadoras que deciden un campo del esquema.

### Reglas sobre las sondas mismas

Las sondas son el único sitio donde este proyecto mira la realidad, así que un
defecto en ellas no se ve: se cree. Las dos primeras salieron de arreglar E1 y
E3; la tercera, de auditar el piloto de CMS-0e; la cuarta, de C-SP16; la quinta,
de que la corrida que verificaba C-QA1 se comiera el diagnóstico de C-QA1.

**1 · Un descuadre impreso y no contado da el mismo informe que uno no visto.**

> **Toda sonda tiene UN solo canal de verdad: lo que imprime y lo que cuenta no
> pueden discrepar.** Si un nivel del árbol se mira, se cuenta; si se cuenta y no
> cierra el código de salida, se dice en la propia salida y por qué.

Tres instancias, todas del 2026-07-30:

| la sonda imprimía | y contaba | consecuencia |
|---|---|---|
| `SEC 3 SOBRA en clon` en `mono-cmp` | **nada** — ningún `continue` incrementaba | acto seguido `✅ 0 · 0 · 0` **con código 0**. Así vivió E1 una tanda entera |
| `C1 h 539.45 → 909.72 Δ+370.27` (alto de columna) | **nada** | veredicto «exacto» con 6 columnas descuadradas en pantalla (E3) |
| `offsets.mjs`, recién escrita: `OFFSET 28.8` en cinco filas intactas, `SPAN` donde el original tiene `<p>`, y el interior de un `CtaDescarga` como si fuera una columna | lo que le habían dicho | **tres defectos en mi propia sonda**, cazados antes de documentarla. El `28.8` era el `padding` de la fila; el nivel de columna no es el mismo en los dos cuerpos del clon |

La tercera es la que importa: **la sonda nueva llegó con tres defectos**, y
ninguno habría dado error — habrían dado números plausibles. Una sonda es código
sin tests; el único control es mirar su salida contra algo que ya sabes.

**Y la regla NO acaba en la sonda: vale igual para quien la lee (2026-08-01).**

> **El canal único de verdad cubre los dos extremos — lo que escribe la sonda y
> lo que escribe quien la interpreta.** Un descuadre que la sonda imprime y el
> informe no recoge produce exactamente el mismo daño que uno que la sonda nunca
> contó: el lector del informe queda igual de ciego, y encima con una cita que
> parece respaldada por una medida congelada.

Su forma concreta, que es la que hay que saber reconocer: **citar un número de
una tabla de PARES sin decir de qué lado es.** Medido — el acta de A-QA1 escribió
«producto (**49.94**) daba Δ0 porque su rótulo no llega a 350». `49.94` es el
**original**; el clon leía **38.94** dos columnas más allá en el mismo fichero
congelado, y la miga entera iba a **−33.25 a los dos anchos**. La frase es
verdadera del original, falsa del par, y **se usó para cerrar una clase** —
que llegó a 3 de 7 implementaciones.

La guarda es de redacción, no de código, y por eso hay que enunciarla: **un
número de un par se cita con sus dos lados o no se cita.** `orig 49.94 → clon
38.94` no se puede leer mal; `49.94`, sí.

**2 · Una sonda que no congela su salida produce afirmaciones que no se pueden
auditar después.**

> **Todas escriben en `medidas/`.** Si una conclusión se cita en un doc, tiene que
> existir el fichero del que salió.

`tree-cmp.mjs` y `mono-cmp.mjs` **no escribían nada**: sus números están citados
en el acta del monográfico y en `HANDOFF.md`, y la única copia era la consola de
quien las corrió. Por eso, cuando apareció E1, demostrar que no había falseado
nada **exigió volver a medir** en vez de diffear un fichero — con el original
vivo por medio, que es la peor forma de tener que probar algo. Corregido: las dos
congelan, y `w()` resuelve contra `scripts/qa/` para que el `cwd` no parta las
salidas en dos árboles.

**3 · DOCUMENTADO NO ES CONECTADO.**

> **Un comentario que afirma un arreglo no prueba que el arreglo esté cableado.**
> `charsCenso()` estaba definida, documentada como resuelta y **nunca llamada**:
> 21 de 24 páginas salieron marcadas sin haberse medido, y el recuento del
> informe no existía.

El comentario de la función describía el fallo con precisión —dos definiciones de
«lo mismo», el censo mete un espacio por etiqueta— y decía que estaba corregido.
Lo único que faltaba era **la llamada**. Un lector del código veía un problema
documentado y resuelto; el intérprete veía código muerto. Y la salida no
protestaba: **21 DERIVA es una cifra plausible** para un sitio vivo.

Lo caza gratis el linter —`'charsCenso' is declared but its value is never
read`— y lo caza siempre el test en negativo. Lo que no lo caza nunca es leer el
comentario.

**Y su hermana, pagada con T7 (2026-07-31): MENCIONADO NO ES DOCUMENTADO.**

> **Un hallazgo citado en un informe de sesión no existe hasta que está en su
> documento.** T7 —la reescritura de enlaces internos del cuerpo rico al
> importar— nació en la sesión de C-3 y vivió solo en su informe; el registro
> (`ESQUEMA-CMS.md` §3.2) decía T1–T6, y una tanda posterior llegó a
> **«corregir» un plan que citaba T1-T7**, comprobando contra el registro.
> **Comprobar el destino no distingue «nunca existió» de «no se escribió»**:
> la comprobación da exactamente lo mismo en los dos casos. Lo que se decide
> en una sesión se escribe en su documento EN esa sesión, o la siguiente lo
> desharía con toda la razón aparente del mundo.

**Y su TERCERA hermana, pagada con la miga (2026-08-01): UN COMENTARIO QUE
AFIRMA CONSUMIDORES ES UN DATO SIN FUENTE.**

> **Ningún comentario declara quién usa un componente.** Quién lo importa se
> **deriva** —`grep -rn "components/X" src/`— y por tanto una lista escrita a
> mano es, en el mejor caso, una copia desactualizada de algo que se puede
> calcular. En el peor, y es el que pasó, **se lee como verdad y decide una
> conclusión.**

Medido: la cabecera de `Breadcrumb.tsx` afirmaba que la compartían
`/monitor-calidad-aire`, `/accesorios`, `/software-…` y `/kunak-api`. **Las
cuatro tenían su propia copia a mano y no importaban nada** — los importadores
reales eran otros tres. Con esa cabecera por única evidencia se dio por **CERRADA
la clase** del tope de 350, que llegó a **3 de 7** implementaciones; y una de las
cuatro (`producto`) llevaba **−33.25 px** de miga a los dos anchos.

Es la regla 3 —*documentado no es conectado*— aplicada al revés: allí el
comentario prometía una **llamada** que no existía; aquí promete unos
**consumidores** que no existen. Los dos fallan igual, porque en los dos casos
**el comentario es la única cosa del repo que nadie ejecuta ni verifica.**

La forma operativa, en dos mitades:

1. **No se escribe la lista: se borra.** Actualizarla sólo reinicia el reloj
   hasta el siguiente refactor. En su lugar, el comando que la deriva.
2. **Y se barre**, porque si hay una hay más: los **74** `.tsx` de
   `src/components` se revisaron en esa tanda y sólo mentía **ése** — pero eso
   es un resultado, no un supuesto. El barrido discrimina por marcador
   **semántico** (`aria-label`, `itemType`, `role`, clases `kunak-*`/`et_pb_*`),
   nunca por literal de `className`: los tokens del tema se repiten por diseño y
   casan en 16 ficheros a la vez, que es el falso positivo de *«un patrón que
   casa en todas no mide nada»*.

**Su corolario, que se pagó en la misma tanda:**

> **Cada arreglo de una sonda vuelve a correr el test en negativo, entero.**

El arreglo del `<a>` suelto **estrenó su propio defecto**: clonaba el nodo para
envolverlo y con eso sacaba al `<img>` de su `.wp-caption`, así que `closest()`
dejaba de encontrar la leyenda y dos páginas la perdieron. El arreglo era correcto
en el invariante que atacaba —`enlaces`— y rompía otro distinto —`imagenes`—. Un
test en negativo que solo cubra lo que acabas de tocar no lo habría visto: por eso
se corre entero, y por eso cada sabotaje tiene que caer **por su propio
invariante** y no por otro.

**4 · UN SELECTOR QUE NO CASA CON NADA NO ES UN CERO: ES UN DEFECTO.**

> **`querySelector` devuelve `null` cuando el selector está mal exactamente
> igual que cuando la propiedad no está.** Un `null` se lee como «esta
> propiedad no varía», así que un selector equivocado **no da error: da
> varianza cero**. Un selector que no casa en **ninguna** de las páginas
> medidas sale por **error**, nunca por cero.

Es la tercera regla una vuelta más abajo —*documentado no es conectado* llega
hasta el `evaluate`; esto pasa dentro de él— y es la cuarta instancia de «una
sonda que no encuentra nada y una que no mira nada dan la misma salida». Ésta
costó **391 px sin dar un solo error**: `c-cascaron` daba `header·ritmo` y
`header·ancho` por ejes limpios usando `#main-header`, que **no existe en el
original** (es `header.et-l--header`). El informe dijo «varianza cero en 131
ejes» y la cabecera **no se había medido**; el desfase apareció luego, en QA, y
solo porque el caso y la FAQ no tienen nada entre la cabecera y el `h1` que lo
absorba.

**El ámbito importa y es «todas las páginas», no «cada página».** Que un
selector no case en una página concreta es legítimo —la FAQ no tiene migas y el
caso sí—. Lo que no puede pasar es que no case en ninguna.

⚠ **Y la instancia que enseña cómo se caza cuando no hay error que mirar
(2026-08-10): LA CONTRADICCIÓN CON UNA MEDIDA BUENA ANTERIOR.**

`qa:pieles` informó **«0 overrides de titular en `blurb`»** en la misma corrida
en que informaba 1299 en módulos de texto. Un cero perfectamente plausible… que
**contradecía a `modulos.spec.md` §2**, donde estaban medidas **tres pieles** del
titular de blurb con sus tres denominadores. Las dos no podían ser verdad.

Ganó la spec: **Divi compila la piel del blurb contra `.et_pb_module_header`** —
porque ahí el nivel es un ajuste aparte y la piel tiene que valer para los seis
niveles— y el selector de la sonda sólo casaba `h[1-6]`. Corregido: **216 reglas
de blurb en una sola página**, y las tres pieles reaparecen exactas.

> **El cero no tenía forma de dar error: tenía forma de dato.** Lo único que lo
> delató fue **otra medición del mismo objeto hecha con otro instrumento**, que
> es el control que este proyecto no siempre tiene — y por eso, cuando exista,
> **cruzarlo es obligatorio antes de creerse un recuento nuevo.**

Y el corolario de construcción: el conjunto que un selector discrimina **se
deriva censando lo que aparece**, no se escribe de memoria. Aquí bastó censar
los objetivos de regla en 60 páginas para ver `.et_pb_module_header` con 271
apariciones, al lado de `h2`, `h3` y `h1`.

**Y su COMPLEMENTARIO, que cuesta lo mismo y se ve menos (2026-07-31):**

> **Un patrón que casa en TODAS tampoco mide nada — y encima parece un dato.**
> La regla de arriba protege del cero; ésta, del pleno. Si el trabajo de un
> selector es **discriminar**, casar en el 100 % no es «esta propiedad la tienen
> todas»: casi siempre es que está mirando otra cosa.

⚠ **Y EL HUECO QUE HAY ENTRE LOS DOS, QUE ES DONDE VIVEN LOS LARGOS (2026-08-18,
78.ª tanda): UN SELECTOR QUE CASA EN UNAS FORMAS Y EN OTRAS NO NO ES NI EL CERO
NI EL PLENO.**

> **La guarda del cero mira el TOTAL, y un total no distingue «casa en todas
> partes un poco» de «casa en dos sitios y en ninguno más».** Así que un selector
> que cubre dos formas de nueve **sale VIVO**, y los ceros de las otras siete se
> leen como *«esa forma no tiene esa parte»* — que es una afirmación sobre el
> original hecha por un descuido del instrumento.

**Medido:** el selector del extracto de la tarjeta era `.post-content p ·
.post-content-inner p · .entry-summary p · .excerpt`, que cubre `/blog` y
`/etiqueta` —**355/355**— y **ninguna** de las otras siete formas. El espejo
publicó `extracto: null` en **107 de 236** tarjetas y el `null` se leyó como
dato. Al censar aparecieron **dos** huecos, y sólo uno era un selector que faltaba:
`.scientific-excerpt` (105 nodos, y es un `<div>`, no un `<p>`) y **texto SUELTO
sin envoltorio ninguno** —nodo de texto hermano del título—, que **ningún
selector CSS puede casar**. Recuperadas **163** tarjetas, movidas **0**.

**La señal de que estás en este hueco, y es barata:** los ceros **se agrupan por
forma** y son **idénticos a los dos anchos**. Un defecto de maquetación varía con
el ancho; un selector, no.

**Operativamente:** cuando un censo abarque más de una forma, **se cuenta POR
FORMA y no sólo en total**, y todo selector con cobertura parcial sale
**nombrado**. Implementado en el sitio común —`Censo.grupo()` / `parciales()` /
`informeGrupos()` en `lib.mjs`— porque lo que hay que acordarse de llamar se
olvida. Los parciales legítimos —una piel de tarjeta sólo existe en su forma— se
**declaran**; uno sin declarar cierra el código de salida.

> **Y su corolario, que es el que ahorra la tanda siguiente:** un fallback que
> nunca casa **no es inofensivo por tener otro delante**. `.case-titulo` y
> `.scientific-titulo` llevaban meses muertos —las clases servidas son
> `case-title` y `scientific-title`, en INGLÉS— y no daban error porque el
> fallback genérico `h3` los tapaba: **el dato salía bien por el selector
> equivocado**, que es la forma de §sondas 4 que ninguna guarda ve.

**Y vale igual para una COMPARACIÓN, no solo para un selector (2026-08-01):**

> **31 de 31 rutas distintas no es un hallazgo: es el instrumento.** Un
> comparador que encuentra defecto en el 100 % de lo que mira está, casi
> siempre, comparando dos cosas que no son la misma.

Medido: la primera versión del árbol de `c-cmp` dio **las 31 rutas con el árbol
distinto**. Cero defectos — Divi mete **la cabecera y el pie del theme builder**
dentro de `.et_pb_section`, y el clon no los emite en `main`. Contra
`esqueleto.json`: sector `{tb_header:1, tb_footer:3, propia:7}` = 11 contra los
**7** del clon, y los 7 **eran exactos**. Dos selectores que no denotan el mismo
conjunto.

De donde la comprobación que cuesta un minuto y hay que hacer siempre: **antes
de creerse un pleno, reconstruye UN caso a mano contra una medida buena
anterior.** Si el clon «falla» en todo, empieza por dudar del comparador.

**Y su TERCERA cara, que no es un selector sino un HEURÍSTICO (2026-08-02):**

> **Un detector que encuentra MÁS de lo que hay tampoco da error: da un número
> plausible de más.** El cero se lee como «esta propiedad no varía» y el pleno
> como «la tienen todas»; el **sobre-casado** se lee como **un dato nuevo**, que
> es peor porque invita a explicarlo.

Medido: `ancho-cuerpo` deducía la fila del clon **por comportamiento** —bloque
centrado más estrecho que su sección— y bajaba a las diapositivas de un slider y
a sus puntos de paginación. De ahí salió un **«el clon sirve la retícula al
75 %, Δ −158.39»** que se fichó como cosecha y **no existía**: era un bloque
dentro de `Testimonios`. La fila real está a 86.35 %, como sus siete hermanas.

La guarda es la misma que para el cero: **que el objeto medido diga qué es**. El
original lo dice con `.et_pb_row`; el clon no tenía equivalente y ahora lleva
`data-fila` — **marcador de sonda, no estilo**, con su antes/después a umbral
cero para probar que no mueve un píxel. Un heurístico se queda de respaldo
**declarado** (`via` en la salida), nunca como identidad.

Medido en el recon de listados: `post_content` daba **«sí» en las 35** porque
buscaba `et_pb_post_content` en el HTML entero y lo encontraba **dentro de
`<style>`** — el CSS de Divi nombra sus propias clases. Un cero habría saltado
por la regla 4; el pleno no saltaba por ninguna. **Lo delató que contradecía una
medida buena anterior** (`RECON-LISTADOS.md` midió ese módulo sobre el DOM y dio
«no» en archivo de taxonomía), que es un control que no siempre se tiene.

De donde las dos mitades operativas:

1. **El markup se busca sobre el HTML sin `<style>` ni `<script>`.** Ahí viven
   los selectores que se hacen pasar por marcado.
2. **Todo patrón discriminante declara su máximo**, y superarlo cierra el código
   de salida igual que un patrón muerto. Implementado en `lh-censo.mjs`, cuyo
   test en negativo cubre **las dos guardas en una corrida**: un selector
   inventado (→ MUERTO) y un máximo a 0 (→ UBICUO).

Está resuelto en el sitio común, no sonda a sonda: **`Censo` en
`scripts/qa/lib.mjs`**. Inyecta `__q`/`__qa` en la página, cuenta cuántos nodos
casó cada selector sumando todas las páginas, y `censo.informe()` devuelve el nº
de muertos para que quien la llama **cierre su código de salida con eso**. Las
sondas usan `__q(sel)` en vez de `document.querySelector(sel)`.

⚠ **Y SU CUARTA CARA, QUE NO ES UN SELECTOR SINO UN `slice`: EL TOPE DE UNA
SONDA SE LEE COMO UNA AUSENCIA DEL ORIGINAL (2026-08-17).**

Las tres caras de arriba son de *casar*: el cero, el pleno y el sobre-casado.
Ésta es de **recortar**, y por eso no la ve ninguna guarda de selectores:

> **Una sonda que congela `lista.slice(0, N)` está afirmando «hay N» a todo el
> que la lea después.** Los elementos N+1 en adelante no salen marcados como
> recortados: **no salen**. Y una tabla derivada de ahí describe el instrumento
> creyendo que describe el original.

**Medido:** `lh-barrido.mjs` congela las piezas del paginador con
`as.slice(0, 12)`. Dos de las 43 instancias de la piel B emiten **14**, así que
la tabla del original derivada del espejo daba dos de sus filas **sin `»` ni
`Last »`** — y el encargo de la tanda siguiente decía, con toda la razón,
*«implementa desde la tabla»*. Implementarla al pie de la letra habría hecho que
el clon **omitiera dos piezas en 2 de 11 páginas** creyendo que replicaba.

**Las dos mitades operativas, y la segunda es la barata:**

1. **toda sonda que recorte publica su tope y cuántas unidades lo pasan** — un
   `slice` sin cardinal es una limitación sin número (§regla 14), y el cardinal
   se declara **en la unidad del tope**, no en la de la sonda (aquí: piezas
   *incluyendo* la que el parser salta, o el margen sale con el signo bueno y el
   número malo);
2. **y quien derive una tabla busca el canal SIN recortar antes de escribirla.**
   Aquí estaba **en el mismo fichero congelado**: `paginador.hrefs`, que no pasa
   por el `slice`, y que decía lo contrario. No hizo falta volver al original —
   hizo falta mirar el otro campo.

⚠⚠ **Y SU QUINTA CARA, QUE NI EL RECUENTO NI EL CRUCE PUEDEN VER: UN CAMPO
AUSENTE EN EL 100 % DE SU TIPO ES EL INSTRUMENTO, NO EL DATO (2026-08-23).**

Las cuatro de arriba son sobre el objeto que se busca: el cero no lo encuentra,
el pleno lo encuentra siempre, el sobre-casado encuentra de más, el `slice`
recorta. Ésta es sobre **una pieza DENTRO del objeto**, y por eso se cuela por
debajo de todas:

> **Cuando el elemento SÍ se encuentra y lo que no casa es un campo suyo, el
> recuento de elementos sigue saliendo perfecto.** El tipo aparece, el cardinal
> cuadra, el cruce con el otro instrumento da el mismo número — y el campo sale
> `undefined` en todas las instancias. **Un campo ausente en el 100 % de su tipo
> no dice «el original no lo trae»: dice «no lo sé leer».**

**Medido:** un extractor buscaba la imagen con `recorre(n).find(x => x.etiqueta
=== "img")` sobre un árbol cuyo tokenizador **descarta las etiquetas vacías por
diseño** (`VACIOS = {img, br, hr, input…}`). Resultado: **71 de 71** imágenes con
`src: undefined`. Y los dos controles que el proyecto exige **pasaron los dos**:
313 módulos y 11 tipos, cruzados al elemento con otro instrumento. `<iframe>` y
`<a>` sí estaban en el árbol, así que el defecto era **de una etiqueta**, y todo
lo demás salía bien — que es lo que lo hace invisible.

**Las dos mitades operativas:**

1. **la guarda se pone sobre los campos EXIGIBLES por tipo, con su denominador**
   — `tipo.campo: ausente en N/N` cierra el código de salida. Y sólo sobre lo que
   el esquema marca `required`: en un campo legítimamente opcional, «ausente en
   todas» puede ser dato;
2. **y no se arregla tocando el parser compartido.** El tokenizador estaba bien
   *para lo suyo*; cambiar su `VACIOS` movería el censo de otro instrumento para
   arreglar a éste. La pieza que falta se lee por su canal —aquí, un regex sobre
   el HTML crudo del nodo—, que es §*la salida servida incluye el canal que no
   estabas mirando* aplicado dentro de una sonda.

> **Y la señal para buscarlo, que es gratis: un 100 % redondo.** `71 de 71`,
> `0 de N` — un dato del original casi nunca es unánime, y cuando lo es, la
> primera hipótesis es el instrumento.

⚠ **Y EL LADO DEL LECTOR, que ninguna guarda de la sonda puede cubrir: UNA REGLA
INCOMPLETA SE LEE EXACTAMENTE IGUAL QUE UNA COMPLETA (2026-08-14).**

Todo lo de arriba protege de instrumentos que no miran. Ésta protege del caso
contrario, y por eso es la más difícil de ver: **el instrumento miró bien, midió
bien y congeló bien — y quien lo leyó le atribuyó un alcance que no tenía.**

> **Una medida contesta las preguntas que se le hicieron, y su fichero no lleva
> escrito cuáles NO.** Así que una regla derivada de ella se lee como si cubriera
> el caso que tienes delante, **aunque la medición nunca lo mirara**. El fallo no
> es de medición: es **de ALCANCE al leerla**, y sale idéntico a un acierto hasta
> que algo se ejercita.

**Medido:** `lh-barra.json` acertó en **todo lo que midió** —la fila es `4_4`, no
hay barra lateral, la columna mide 1238.39— y el componente construido sobre ella
estaba mal igual. La medida contestaba *«¿hay barra y qué tipo de columna?»*;
nadie le preguntó **cuántas filas tiene el cuerpo**, y `resources` tiene **3**
donde sus dos hermanas tienen 2 — su listado va en la fila **3** y cuelga de un
módulo de texto vacío. Ninguna relectura del fichero lo habría dicho: no está
ahí.

> **Operativamente, y cuesta dos líneas: antes de construir sobre una medida,
> escribe QUÉ PREGUNTA CONTESTA y QUÉ PREGUNTAS NO CONTESTA.** Lo segundo es
> justo lo que el fichero no puede decirte, y por eso es lo único que hay que
> escribir a mano.

Es hermana de §*una afirmación de que un discriminador NO EXISTE se escribe con
la lista de canales que se miraron*: allí se declara el alcance de un cero, aquí
el de un acierto. Y de §*una regla derivada sobre un dominio donde el caso NO SE
DA está SIN PROBAR para ese caso*, con el eje cambiado — allí falta **dominio**,
aquí falta **pregunta**.

**Y el caso particular que más aparece al buscar duplicación (2026-08-01): para
identificar un COMPONENTE, el literal de `className` no discrimina.**

> **Las clases de este proyecto son TOKENS DEL TEMA, no identidad de módulo.** Se
> repiten por diseño —es lo que significa que haya sistema de diseño—, así que
> buscar «quién más escribe estas clases» devuelve el catálogo entero y **parece
> un hallazgo**. Lo que identifica un módulo es el marcador **semántico**:
> `aria-label`, `itemType` de schema.org, `role`, `id`, o la clase **del tema
> original** (`kunak-*`, `et_pb_*`). Esos nombran **una cosa**; una clase de
> Tailwind nombra **un aspecto**.

Medido al barrer las copias a mano de la miga: la primera versión buscó literales
de `className` compartidos y casó con `text-[18px] leading-[30.6px] text-[#333]`
en **16 ficheros** — cero señal. La segunda, sobre marcadores semánticos, dio
**45 marcadores, 9 en más de un fichero**, y el único que delataba una copia real
fue `aria-label="Migas de pan"` en **5**. Mismo corpus, misma pregunta: la
diferencia entera estaba en qué se tomó como identidad.

Es el **pleno** de la regla de arriba con nombre y apellidos: un patrón que casa
en 16 de 74 no está midiendo duplicación, está midiendo que existe una hoja de
estilos.

El corolario práctico, en dos mitades — la segunda se aprendió cazando la
primera:

1. **Cuando arregles algo transversal, no des por cerrada la clase hasta que una
   sonda recorra la salida y salga limpia.** Arreglar la instancia que tienes
   delante es cómo se llega a la tercera tanda del mismo bug.
2. **Y no te creas un "limpio" hasta haber probado en negativo que la sonda sabe
   fallar.** Una sonda que no encuentra nada y una que no mira nada dan la misma
   salida. El test en negativo de `enlaces.mjs` dio **"limpio" en falso** a la
   primera: el enlace roto estaba en `.next` pero no en el HTML servido, porque
   `next start` seguía con el build anterior y `pkill` no lo mató. **Mata por
   puerto**, y verifica un marcador del cambio en la salida antes de medir.

⚠ **Y la mitad que falta, que es la que engaña (2026-08-02): EL MARCADOR PRUEBA
QUE EL BUILD ES NUEVO, NO QUE EL CAMBIO TENGA EFECTO.**

> Un marcador de frescura contesta *«¿estoy midiendo el HTML que acabo de
> generar?»* — y **solo** eso. La pregunta siguiente —*«¿el cambio hace algo?»*—
> es otra, y **ningún marcador la responde**: un arreglo puede estar en el HTML
> servido, ser exactamente el que se escribió, y ser **INERTE**.

Medido en D4: el bloque de iconos sociales se cableó como `pb-[30px]` sobre una
caja de **alto fijo**. Con `box-sizing: border-box` el `padding` se absorbe
dentro del alto declarado y no empuja nada. La clase **estaba en el HTML
servido**, el marcador dio verde, el diff se leía correcto — y el cambio **no
existía**. Lo cazó **medir después**; no lo habría cazado ninguna cantidad de
leer el diff, porque el diff era el correcto.

De donde el protocolo de verificación tiene **dos pasos y no uno**, y no se
pueden fusionar:

| paso | pregunta | instrumento | qué NO prueba |
|---|---|---|---|
| 1 · frescura | ¿mido el build de ahora? | marcador en el HTML servido | que el cambio tenga efecto |
| 2 · **efecto** | ¿el número se movió? | **la medida antes/después** | nada más: es la única que cierra |

Es la regla 3 —*documentado no es conectado*— una vuelta más abajo: allí el
comentario prometía una llamada que no existía; aquí **el HTML sirve una clase
que no hace nada**. En los dos casos lo servido es exactamente lo escrito, y en
los dos casos lo escrito no llega a la propiedad. **Ningún arreglo se da por
hecho sin su medición posterior**, ni siquiera cuando se ve en la salida.

**4bis · «0 COMPARADO = VERDE» APARECIÓ CINCO VECES. LA SEXTA LA IMPIDE EL
CONTRATO, NO LA ATENCIÓN.**

Las reglas de arriba se arreglaron **instancia a instancia**, y por eso la misma
clase volvió cinco veces:

| # | sonda | qué pasó |
|---|---|---|
| 1 | `mono-cmp` | imprimía «SEC 3 SOBRA» y no lo contaba → `✅ 0·0·0`, código 0 |
| 2 | `charsCenso()` | definida, documentada y **nunca llamada**: 21 de 24 páginas sin medir |
| 3 | `ancho-cuerpo` | comparó **0 filas de 13** y sacó ✅ con código 0 |
| 4 | `ruido` | sin combinaciones válidas imprimía `SUELO = -Infinity` como dato |
| 5 | **`clon-base`** | con el puerto vacío: **31 `ERR_CONNECTION_REFUSED` y código 0** |

> **Toda sonda DECLARA —o deriva del build— su mínimo de unidades evaluadas, y
> por debajo de él el resultado es NO SE PUDO EVALUAR con código ≠ 0. Nunca
> verde.** Vive en `Evaluadas`, en `lib.mjs`.

Y lo que lo hace **estructural** y no una función más que se puede olvidar:

- el veredicto lo fuerza un gancho de `process.on("exit")`, así que una sonda que
  declare su mínimo **no puede salir con 0 por debajo de él aunque nunca mire su
  propio contador** — ni con un `process.exit(0)` explícito;
- una sonda que **congela una medida sin haber declarado nada** sale por error
  con «SIN CONTRATO»: el olvido tampoco es verde;
- `minimo` es obligatorio y ≥ 1 —**una sonda que no sabe cuántas unidades
  debería evaluar no puede afirmar que las evaluó**— y derivarlo (`RUTAS.length`)
  es mejor que escribirlo, porque una ruta nueva sube el listón sola;
- las páginas las cuenta `openPage`, por donde pasan todas: no hay un `ok()` que
  se pueda olvidar.

⚠ **Y la comprobación de que el contrato está PUESTO también tiene su trampa.**
El barrido que verifica que las 47 lo declaran es una expresión regular, y dio
verde sobre un fichero **con dos `const ev` que no compilaba**. Miraba el texto,
no el programa. Ahora `qa:lib` hace además un `--check` por sonda: *mirar una
cosa y creer que has mirado otra*, cometido en el test del propio contrato.

⚠⚠ **Y HUBO SEXTA (2026-08-05), por un camino que el contrato NO PODÍA cerrar —
así que el titular de arriba estaba de más.**

| # | sonda | qué pasó |
|---|---|---|
| **6** | **`clon-base`** (y las otras 6 que llaman a `iniciarClon`) | sin `.next`: **exit 0 y CERO líneas de salida** |

`iniciarClon` registraba `uncaughtException` **en el mismo bucle** que `exit`,
`SIGINT` y `SIGTERM`, con el mismo cuerpo. Parece simetría y **no lo es**: los
tres primeros son **avisos**; `uncaughtException` es un **RELEVO**. En cuanto hay
un gancho, Node deja de imprimir el error y deja de salir con 1, y como después
de la excepción no queda nada que hacer, el proceso termina **en verde y mudo**.

> **El contrato de `Evaluadas` es ciego a esto POR CONSTRUCCIÓN: si el proceso
> muere antes de construir su `Evaluadas` o de congelar nada, no hay contador al
> que gritar ni congelada que reclamar.** El gancho de `exit` que fuerza el
> veredicto **sí corre** — y no encuentra nada de qué quejarse.

De donde la forma general, que es lo reutilizable y vale para cualquier guarda
futura:

> **Una guarda que vigila el FINAL de un proceso no puede ver que el proceso no
> llegó al final.** Hay que vigilar además **la muerte**, y la muerte no se
> vigila contando: se vigila **no desactivando lo que Node ya hacía**. Cualquier
> gancho que RELEVE un comportamiento por defecto —`uncaughtException`,
> `unhandledRejection`, un `catch` de tope— **tiene que devolver el fallo a su
> sitio**, no sólo limpiar.

Vive en `gritaSiRevienta()` de `lib.mjs`, registrada **antes** del atajo de
`CLON` para que el atajo no se quede sin guarda. Control en `qa:lib` §3b **por
los dos lados**: el mismo `throw` sin gancho (exit ≠0, 11 líneas) y con un gancho
vacío (exit 0, mudo). Lo destapó el negativo del entorno de F2-3 —contenedor
tirado, build fallido, `.next` borrado—, que es también el argumento a favor de
probar en negativo **el entorno** y no sólo el dato.

**5 · CONGELAR NO SIRVE DE NADA SI LA SIGUIENTE CORRIDA DESCONGELA SIN AVISAR.**

La regla 2 dice que toda sonda congela su salida *para que una conclusión citada
en un doc tenga su fichero*. Pero el fichero se llama igual corrida tras corrida,
y de ahí sale el agujero:

> **La corrida que VERIFICA un arreglo escribe en el mismo nombre que la que
> DIAGNOSTICÓ el defecto.** O sea que el acto de arreglar algo borra la prueba de
> que estaba mal — y la borra en silencio, porque sobrescribir un fichero no da
> error.

Medido: al comprobar que C-QA1 estaba cerrada, `c-cabecera` reescribió
`medidas/c-cabecera-{1440,390}.json` con el clon **ya corregido**. Se recuperó de
git. Si no hubieran estado commiteados, la evidencia del defecto habría
desaparecido en el acto de arreglarlo, y las tablas de `PENDIENTES-QA.md` que
citan esos números se habrían quedado sin respaldo.

La regla, que vale para **todas** las sondas porque vive en `w()` de `lib.mjs`:

> **Ninguna sonda pisa una salida existente cuyo contenido difiera.** Escribe al
> lado con la fecha y lo dice en voz alta. Idéntica se reescribe —no se pierde
> nada—. Para re-congelar a propósito, **`PISAR=1`**.

**Es hermana de la guarda de selectores, y por la misma razón**: las dos
convierten en ruido visible algo que por defecto pasaba en silencio. La
diferencia es el objeto — el `Censo` protege **la medida**, ésta protege **la
evidencia**.

⚠ **Y el efecto secundario que hay que saber leer, porque no es un defecto y
engaña igual: `<nombre>.json` SIGNIFICA «LA PRIMERA FOTO», NO «EL ESTADO DE
HOY».**

> Como `w()` **nunca** pisa una congelada que difiera, en una sonda que se corre
> muchas veces el **nombre canónico conserva la PRIMERA corrida** y todas las
> demás se van a su fechado. Así que el fichero con el nombre obvio —el que
> cualquiera abre para saber cómo está la cosa— es, con el tiempo, **el más
> viejo del montón**.

Medido: `clon-base-{1440,390}.json` dicen **`rutas: 17`** (julio) mientras la
línea base vigente son **363**, y vive en `clon-base-{1440,390}-2026-08-14.json`.
Un acta que cite «la línea base de `clon-base`» sin decir **qué fichero** manda a
la sesión siguiente a leer 17.

**Operativamente, y es una línea:** al citar una línea base, **se nombra el
fichero**, y el número se deriva de él —`grep '"rutas"'` sobre el montón dice
cuál es cuál—. Es la §regla 9 aplicada al sitio donde menos se espera: **el
nombre de una congelada es un dato recordado, no derivado.**

> ⚠⚠ **Y ESTO NO ES SÓLO PARA QUIEN LEE: UN CONSUMIDOR AUTOMÁTICO QUE RESUELVE
> AL NOMBRE CANÓNICO CONSUME LA PRIMERA FOTO, Y NO HAY LECTOR QUE LO NOTE
> (2026-08-23).**
>
> El aviso de arriba está redactado para una persona que abre un fichero —*«el
> que cualquiera abre para saber cómo está la cosa es, con el tiempo, el más
> viejo del montón»*—. Le falta la mitad cara:
>
> > **Cuando el que abre el canónico es una CAMPAÑA, el envejecimiento no se lee:
> > se ejecuta.** La campaña hace su trabajo entero, con su código de salida y su
> > informe, **sobre el conjunto de hace semanas** — y su verde es cierto de ese
> > conjunto.
>
> **Medido:** una campaña de colocación de media resolvía su lista al canónico y
> trabajaba sobre la foto de **11 días antes**. La diferencia simétrica —que es
> como se compara membresía, no por cardinal— tenía **dos lados**: 21 ya
> colocadas y **5 que faltaban HOY y la lista vieja no tenía**. De esas 5, **3
> eran resolubles SIN RED** y ninguna campaña iba a colocarlas nunca, porque la
> lista que consumen no las contenía.
>
> **La regla operativa, y son dos ejes ORTOGONALES que no hay que confundir:**
> un parámetro elige **qué DEFINICIÓN** se usa (y ahí un fallback silencioso sí
> sería la clase C7); **qué CORRIDA de esa definición se resuelve por `mtime`,
> nunca por nombre** — descartando los artefactos de la §regla 7, porque el más
> reciente de una familia puede ser el sabotaje que acaba de correr el negativo.
> Y la sonda **dice en voz alta qué fichero resolvió, con su fecha**.

⚠ **Y su moraleja es la de la regla 4, otra vez:** `c-cabecera` se parcheó a mano
primero. Eso es arreglar **la instancia y no la CLASE**, que es exactamente cómo
se llega a la tercera tanda del mismo bug. La guarda solo cuenta cuando está en
el sitio por el que escriben todas. Test en negativo: **`npm run qa:lib`**.

**Y su otra mitad, que la guarda NO cubre y hay que hacer a mano:**

> **Congelar y COMMITEAR van en la misma tanda, antes de re-correr nada contra
> ese fichero.** La guarda de `w()` protege de que **una sonda** pise su salida.
> De un **borrado manual** —o de un `rm` para «dejar sitio», o de un `git
> checkout` distraído— no protege nada excepto que el fichero ya esté en git.

⚠ **Y EL BORRADOR NO SIEMPRE ES UNA MANO: UN NEGATIVO QUE FALLA SE LLEVA LA
CONGELADA QUE IBA A ESCRIBIR** (2026-08-23).

Casi todo test en negativo hace `if (existsSync(fichero)) rmSync(fichero)` antes
de lanzar su caso —y **hace bien**: si no, una congelada vieja pasaría la
comprobación y el caso saldría verde sin haber corrido. Pero:

> **Si el caso después FALLA —o se agota, o lo matan—, el fichero se queda
> borrado.** El negativo no ha pisado la evidencia: **se la ha llevado**, y el
> repo queda sin ella con `git status` como único aviso.

**Medido:** una corrida completa de `qa:negativos` dejó **4 congeladas borradas**
—3 de `cms-arquetipos` (murió en 1/4) y 1 de `f33-geo` (se agotó a los 300 s)—.
Todas recuperables con `git checkout` **porque estaban commiteadas**; ésa es
exactamente la protección que la regla de arriba compra, y aquí es la única que
había.

> **Operativamente, y no hay que tocar ningún negativo: tras correr un barrido de
> negativos, se mira `git status` buscando BORRADOS antes de commitear.** Un
> `-neg-*.json` que desaparece no es ruido de la corrida: es evidencia de otra
> tanda que se va con la tuya.

Se pagó en la tanda siguiente a escribir la guarda, y **lo hizo quien la había
escrito**: la ráfaga A de C-QA6 midió `h1 ±32.28` en tres rutas —el episodio que
justifica toda la corrección del protocolo de ruido— y su salida se borró **a
mano** para que la ráfaga B, con la sonda ya corregida, escribiera con el nombre
limpio. Los números sobrevivieron en `PENDIENTES-QA.md`; **el fichero del que
salieron, no.** O sea que la afirmación mejor pagada de esa tanda es hoy la única
que no se puede exhibir.

La forma correcta era commitear la ráfaga A **antes** de tocar la sonda, y dejar
que la guarda mandara la ráfaga B a su fichero fechado. Dos órdenes de git, y
ninguna se dio.

⚠ **El caso general, porque `rm` no es la única puerta:** cualquier cosa que
devuelva el árbol a un estado anterior —`git checkout --`, `git reset --hard`,
descartar cambios en el IDE— **se lleva por delante las medidas no commiteadas**,
y las medidas son el producto de la sesión tanto como el código. Si acabas de
medir algo que vas a citar, **commitéalo antes de la siguiente orden que toque el
árbol.**

**5bis · ARREGLAR UN INSTRUMENTO NO ARREGLA SUS MEDIDAS: LAS CADUCA.**
(2026-08-18, subida aquí por el barrido de §regla 12 el 2026-08-19)

La regla 5 protege la evidencia de que una sonda **la pise**. Ésta protege de
algo que ninguna guarda puede ver, porque no pasa dentro de la sonda:

> **Toda medida congelada es una FOTO TOMADA CON UN INSTRUMENTO CONCRETO.** El
> día que ese instrumento se corrige, sus congeladas **no se vuelven falsas
> ruidosamente: se quedan calladas diciendo lo de antes**. Y como el fichero no
> lleva escrito con qué versión se tomó, la comparación siguiente mezcla dos
> instrumentos y **produce diferencias que no son de ninguno de los dos lados**.

**Medido:** arreglar el selector del extracto convirtió `extracto: null` en dato
para **51** tarjetas. Los dos espejos congelados llevaban ese `null` en **107**,
y **56 de esos 107 eran dato bueno**. Comparar el clon medido con el instrumento
nuevo contra el espejo medido con el viejo habría dado **51 falsos rojos**, y el
camino de menor resistencia habría sido **construir el clon SIN extracto para
cuadrar el `null`** — o sea cablearlo al defecto del instrumento.

**Las tres mitades operativas:**

1. **el alcance del daño se declara con su número**, y casi nunca es «todo»:
   aquí era **sólo el campo `extracto`** — geometría, ritmo y árbol seguían
   valiendo, y decir «el espejo está mal» habría tirado una medida buena;
2. **la congelada caducada se RENOMBRA con el defecto y su alcance**, no con
   «viejo» (§regla 7). Y renombrarla **libera el nombre canónico**, con lo que
   los consumidores recogen la nueva **por derivación** en vez de por una lista
   escrita a mano (§regla 9, 8.º caso);
3. **y hay que RE-MEDIR contra la fuente, no re-derivar de un sustituto.** Un
   corpus capturado sirve para el texto y **falsea la geometría** si no trae sus
   hojas — reconstruir el espejo desde ahí cambia un defecto conocido por otro
   invisible.

**Y el defecto se pone en la dirección que grita:** liberado el canónico, lo que
todavía no se ha re-medido **falla en voz alta** en vez de leer lo caducado.

**5ter · Y LA SIMÉTRICA, QUE ES PEOR: ARREGLAR EL OBJETO MEDIDO CADUCA EL
CONTROL DEL INSTRUMENTO QUE LO MIDIÓ.** (2026-08-20)

La 5bis va del instrumento a sus medidas. Ésta va **del objeto al instrumento**,
y su síntoma engaña más:

> **Un control se define como «escribe el valor de HOY y exige NO-OP». En cuanto
> el arreglo entra, «hoy» es otro valor — y el control sigue escribiendo el de
> AYER, o sea aplicando el tratamiento al revés.** No calla: **falla en voz
> alta**, así que se lee como un hallazgo del objeto en vez de como una avería
> del instrumento.

**Medido:** `lh-letra` verificó el cambio de `1.7` a `1.7em` y su control tenía
`"1.7"` **cableado**. Tras el arreglo falló en **374 de 374 rutas y a los dos
anchos**, y como su `process.exit(1)` va **antes** del `ev.ok()`, el contrato
publicó **«0 evaluadas»** junto a un informe que decía **«374 medidas»**. Las dos
frases eran ciertas; **se citó la segunda**, y la tanda cerró en verde con
`EXIT 1`.

> **Operativamente: el valor que un control escribe se DERIVA de la fuente que lo
> declara, nunca se cablea.** Es §regla 9 en el sitio donde más tarda en verse
> —un control sólo se estrena **cuando el objeto ya cambió**—, y por eso no basta
> con acordarse: si no se puede derivar, la sonda **tira** en vez de suponer.

**Y el corolario de lectura, que es el que cierra la clase:** cuando una sonda
imprima un recuento y su contrato imprima otro, **no son dos opiniones**. El
recuento describe lo que el bloque de arriba alcanzó a medir; el contrato
describe **si eso vale**. Citar el primero sin mirar el segundo es §regla 1
cometida por el lector, y sale idéntica a un verde.

**6 · UN PARÁMETRO POR DEFECTO CONVIERTE «NO LO SÉ» EN «ESTÁ BIEN».**

Las cinco reglas de arriba persiguen el mismo animal: *no encontrar nada y no
mirar nada dan la misma salida*. Ésta nombra **el mecanismo que lo produce**, y
por eso vale para código que no es una sonda:

> **Todo código que traduce una AUSENCIA a un valor benigno —un parámetro por
> defecto, un `?? 0`, un `|| []`, un `catch {}`— borra la diferencia entre «esto
> no se pudo calcular» y «esto salió bien».** Y la borra **en el sitio donde
> todavía se sabía**, que es lo que la hace irrecuperable aguas abajo.

**Caso medido (2026-08-02), y es de manual porque son tres capas tapándose:**
`cmp-sector` imprimía en pantalla sus **13 filas comparadas** y su contrato decía
`evaluadas 1/1` — verde.

| capa | qué tenía | qué hizo |
|---|---|---|
| el recuento | `ev.ok(filas.length)` | `filas` es un **objeto** ⇒ `filas.length` es `undefined` |
| la firma | `ok(n = 1)` | el parámetro por defecto **convirtió `undefined` en 1** |
| la declaración | `minimo: 1` | **1 ≥ 1 ⇒ verde** |

Quítese cualquiera de las tres y sale roja. Y la del medio es la que importa:
**`ok()` y `ok(undefined)` no significan lo mismo y no pueden dar lo mismo.** El
primero es «una unidad»; el segundo es «te paso el resultado de un cálculo que
falló». Un parámetro por defecto no los distingue — hay que mirar
`arguments.length`.

Lo más caro es dónde ocurrió: **dentro del contrato escrito para cerrar esta
misma familia.** La guarda contaba mal por el mismo mecanismo del que protege.

Operativamente: **en el código de las guardas, una ausencia se rechaza, no se
sustituye.** Si un valor puede no existir, el defecto seguro es tirar; el valor
benigno es el que fabrica el verde falso.

⚠ **Y su gemelo del lado del RENDER, pagado el 2026-08-10 (F3-1): UN
RENDERIZADOR QUE DEVUELVE `undefined` NO FALLA — NO PINTA.**

La regla de arriba persigue guardas que cuentan de más. Ésta persigue lo mismo
en el sitio donde no hay ningún contador:

> **En React, `undefined` es un valor de retorno legal que renderiza NADA.** Así
> que un `switch` sin `default`, un `find` que no encuentra o un `?.` que corta
> **borran contenido en silencio**, y el silencio llega hasta el HTML servido:
> no hay excepción, no hay aviso, y la página responde **200**.

**Medido, y el número es lo que lo hace regla:** el discriminador de bloque que
llega al render se llama `kind` —lo pone la vuelta del proyector— y el
componente miraba `blockType`, que es lo que Payload guarda. Las **6 páginas de
`articulos-kb` se servían con sus filas, sus columnas y CERO módulos**. Verde:
`npm run check`, `qa:slugs`, `qa:manifiesto`, el `prerender-manifest` con sus 6
rutas. Lo cazó el comparador de dos lados con `columna.nModulos: orig 2 → clon
0`.

**Las dos consecuencias, y la segunda es la que vale para cualquier arquetipo:**

1. **todo `switch` de un renderizador lleva `default` que TIRA**, con el valor
   recibido en el mensaje. El defecto se pone en la dirección que grita: mejor
   una página que revienta que seis que mienten;
2. **una ruta que responde 200 no prueba que sirva CONTENIDO.** Ninguna guarda
   de este repo mira dentro —cuentan rutas, slugs, familias y bytes— así que
   *«la ruta está emitida»* y *«la página está servida»* son dos afirmaciones, y
   sólo un comparador **contra el original** distingue la segunda. Es §UN
   ARQUETIPO NUEVO NO HEREDA COBERTURA con su caso más barato: aquí el clon no
   estaba un poco mal, estaba **vacío**, y todo lo verde siguió verde.

⚠⚠ **Y SU HERMANO EN EL ESQUEMA, QUE ES EL MISMO MECANISMO UNA CAPA MÁS ARRIBA:
UN CAMPO OPCIONAL NO EXPRESA UN CASO — SÓLO PERMITE QUE FALTE (2026-08-22).**

La regla 6 dice que un valor por defecto convierte *«no lo sé»* en *«está
bien»*. Ésta es la versión de **modelo de datos**, y engaña más porque el
opcional suele estar bien puesto:

> **`required: false` contesta «este documento PUEDE no traerlo». NO contesta
> «este documento no lo trae».** Y las dos se leen igual desde el esquema, así
> que un documento cuyo contenido **no cabe en ningún campo** sale «expresado»
> —el campo admite estar ausente— cuando lo correcto es **OMITIDO**.

**Medido:** un content type declaraba su cuerpo `bloques` opcional *«por las 2
páginas de cero módulos»*. Las 2 tenían **8387 y 5749 caracteres** de contenido
— en otro canal (`entry-content` clásico y `post_content`), que el modelo no
tiene. Con el opcional se habrían emitido con cabecera, pie y **nada en medio**,
respondiendo 200: exactamente el modo de fallo de arriba, pero **originado en el
esquema** en vez de en el render.

**Las dos mitades operativas:**

1. **la prueba de que un modelo expresa un corpus no es «¿cabe lo que hay?»,
   sino «¿queda contenido SIN SITIO?»** — y esas dos preguntas se contestan
   distinto: la primera recorre los campos, la segunda recorre **el documento**.
   Un recorrido que sólo mira lo que el modelo sabe leer **no puede ver lo que
   no sabe leer**;
2. **y esa comprobación se escribe ANTES de mirar el dato, con su
   justificación.** Añadida después de ver que dos documentos salen vacíos, es
   una condición ajustada al resultado. La prueba de que estaba antes es que su
   negativo la pueda anular: desactivarla dio **32/32 y exit 0** —el verde falso
   completo— y eso es lo único que demuestra de dónde viene el veredicto.

> **Y la lectura que NO hay que dar:** un opcional legítimo existe —hay
> documentos que de verdad no traen el campo—. Lo que la regla prohíbe es
> **inferir cuál es cuál desde el esquema**. Se mira el documento.

**7 · UN ARTEFACTO DE TEST EN NEGATIVO NO PUEDE PARECER UNA MEDIDA.**

> **Todo fichero de `medidas/` que NO sea una medida del sitio lo dice en el
> nombre.** Sabotajes, controles, salidas de un fallo provocado y las de un fallo
> accidental que se conserva como evidencia.

Marcadores en uso —**`-neg-` es el preferido** para lo nuevo, los otros dos son
prior art y no se renombran porque hay actas que los citan—: `-neg-` ·
`SABOTAJE` · `SONDA-` (un defecto de la propia sonda, p. ej.
`lh-paginas-SONDA-CONTABA-EL-TOPE.json`). **31 de los 324 ficheros congelados
llevan uno.**

`medidas/` es *la prueba, no un caché*, y la próxima sesión lo consulta **sin
preguntar**. Un fichero con nombre de medida y contenido de sabotaje es una
medida falsa con la autoridad de una congelada.

**Caso medido (2026-08-02):** una corrida de `dos-rutas` con un slug inventado
congeló `medidas/dos-rutas-1440.json` con `docH 6035 → 900` y `null` en todas las
anclas — o sea **la medida de una 404**, indistinguible por el nombre de una
comparación buena. Renombrada a `dos-rutas-1440-neg-404.json`.

La convención ya existía de hecho —`ancho-neg-*`, `ruido-*neg-*`,
`slugs-SABOTAJE`— pero **no estaba escrita**, así que no se aplicó al caso que
no venía de un sabotaje deliberado. Que el fallo sea accidental no cambia lo que
el fichero contiene.

**8 · UN NEGATIVO SIN CONTROL NO ES UN NEGATIVO — y `medidas/` ES UNA MUESTRA
DEL ORIGINAL QUE NADIE INTERROGA.** (2026-08-04)

Dos mitades de la misma tanda, y las dos son la regla del cero otra vez.

**(a) El control es lo que decide si el negativo significa algo.** Se probó
`push: false` inyectando un campo de sabotaje y viendo que no llegaba a la DB —
verde. **Falso:** con `push: true` tampoco llegaba, porque el arranque usado
(`migrate:status`) no dispara el push. El 0 no era *«la guarda lo paró»*, era
*«nadie miró»*.

| | guarda | arranque | resultado |
|---|---|---|---|
| intento fallido | `true` **y** `false` | `migrate:status` | **0 en los dos** — no medía nada |
| control | `true` | `getPayload()` real | **1** — aparece |
| negativo | `false` | `getPayload()` real | **0** — para |

> **Un sabotaje que no cambia el resultado no ha probado la guarda: ha probado
> que el instrumento no la ejercita.** Es la regla del cero cobrada **dentro de
> la verificación de una guarda**, que es donde más caro sale.

**(b) Toda medida congelada de un PAR contiene una muestra del ORIGINAL.** La
regla 7 dice que `medidas/` es *la prueba, no un caché*. Le faltaba la vuelta:

> **El suelo de ruido de una ruta no vive sólo en los ficheros de la campaña de
> ruido — vive en las 324 congeladas**, porque cada comparación guardó el lado
> del original en esa ruta y ese ancho. Preguntarle *«¿cuántos estados ha tenido
> esto?»* es un `grep` sobre lo que ya está en git.

Medido: la campaña `cqa6-390` se pagó con dos días para dirimir si el ±30 de
EDAR@390 era suelo o defecto, **y la respuesta llevaba meses commiteada** en
`c-cabecera-390*.json` — el original a **189.39 ↔ 219.39** y `/software` a
**308.58 ↔ 338.58**, Δ **30.00** exacto, con el clon inmóvil. O sea **bimodal a
390**, como a 1440 lo es con 32.28.

**Y el corolario, que es el que muerde:** el criterio **pre-registrado** de esa
campaña afirmaba *«un ±30 observado una vez, **sin fichero**»*. Era falso, y de
haberse aplicado habría convertido un **no-defecto en «defecto con su ficha»**,
mandando a la tanda siguiente a mover el clon del estado dominante al raro — una
FAMILIA DE CALIBRACIÓN fabricada a mano.

> **Un pre-registro protege de decidir por cansancio; NO protege de partir de una
> premisa falsa** — y ahí llega blindada contra la revisión, porque cuestionarla
> parece justo lo que el pre-registro prohíbe. Los hechos negativos que un
> pre-registro afirme (*«no existe», «no hay fichero», «no se ha visto»*) **se
> comprueban al escribirlo**, contra el archivo, no de memoria.

> ⚠ **Y SU SEGUNDA MITAD, PAGADA EL 2026-08-19: CUANDO LO QUE PREDICES ES EL
> EFECTO DE UN CAMBIO DE INSTRUMENTO, «QUÉ CAMBIÓ EL INSTRUMENTO» SE DERIVA DEL
> `diff` — NUNCA SE RECUERDA.**
>
> Es §regla 9 aplicada al sitio donde peor sienta, porque el pre-registro se
> escribe **el mismo día** que el cambio y por tanto se siente sabido:
>
> > **La lista de lo que tocaste es un conjunto derivable —`git diff` del commit
> > del arreglo— y escribirla de memoria produce una predicción INCOMPLETA que se
> > lee como cumplida**, porque lo que sí predijiste acierta y lo que olvidaste
> > no sale nombrado en ninguna parte.
>
> **Medido:** un pre-registro afirmó que el arreglo tocaba **dos** roles
> —`extracto` y `titulo`— y tocaba **tres**: se dejó `meta`. De los **358** pares
> que se movieron, **273 eran del rol olvidado** — la mayoría del movimiento,
> declarada inexistente por el documento que iba a interpretarlo. Las
> predicciones sobre los otros dos roles se cumplieron **todas**, así que nada
> chirriaba.
>
> **Operativamente, y cuesta una línea:** un pre-registro sobre un cambio de
> instrumento **empieza pegando el `diff`** —o la lista de símbolos que toca— y
> predice **sobre esa lista**, no sobre la que uno recuerda haber escrito.

**9 · UN RECUENTO —O UNA AUSENCIA— AFIRMADOS DE MEMORIA SE BARREN ANTES DE
USARSE.** (2026-08-04)

Las ocho reglas de arriba persiguen instrumentos que no miran. Ésta persigue lo
contrario: **afirmaciones que nadie midió y que se usan como si sí.**

> **Todo número —«son ~8», «hay 2 citas», «no existe fichero»— se DERIVA antes
> de usarse: `grep`, `find`, o recorrer el árbol. Nunca se recuerda mejor.** Y
> vale igual para los **hechos negativos**, que son los peores: *«no hay»*
> parece que no cuesta comprobarlo, y es justo el que más engaña.

**No es una hipótesis: son seis instancias medidas, todas en este repo.**

| # | lo afirmado | lo derivado | qué costó |
|---|---|---|---|
| 1 | inventario de la CLASE «~8» | **31** | el alcance de una precondición de F2-1 |
| 2 | «los mínimos flojos son 8» | **10** | dos sondas se quedaron sin contrato |
| 3 | «2 citas usan UTC» | **8** | 6 medidas con sello ambiguo |
| 4 | «CMS-0f se cita en 1 sitio» | **3** | dos documentos quedaron sin actualizar |
| 5 | «el CPT `solutions` tiene 22 URLs» | **24**, y **dos «singleton» no lo eran** | una decisión de modelado sobre n mal contado |
| 6 | **«un ±30 observado una vez, SIN FICHERO»** (pre-registro de `cqa6-390`) | **dos ficheros congelados** de otra sonda | habría convertido un **no-defecto en «defecto con ficha»** |

| 7 | **la lista de sufijos de `lh-cmp` escrita a mano en `cobertura.mjs`** (4 bases) | **8 posibles** (`-todas` × `-vivo`) | **61 formas comparadas invisibles** a la matriz: 5 ejes a **−54** cada uno |

**Los tres primeros son recuentos; el 4.º, el 5.º y el 6.º son peores**, porque el
número mal contado ya había **decidido algo**: qué se modela, qué se cierra, qué
se persigue.

⚠ **Y el 7.º extiende la regla a un sitio donde no se buscaba: UN CONJUNTO
ENUMERADO A MANO DENTRO DE UNA SONDA ES UN DATO RECORDADO** (2026-08-17).

> Los seis primeros son afirmaciones **en prosa**. El séptimo es una **lista de
> literales en código** —los nombres de fichero que un instrumento acepta— y
> falla igual: envejece **contra** el repo, en silencio, y no da error porque un
> patrón que no casa **no es un cero** (§sondas 4).

**Lo que lo hace regla y no anécdota es que fue la SEGUNDA vez en el mismo
bloque.** En julio la lista se quedó corta con `-vivo` y se arregló **añadiendo
la línea que faltaba**: eso es la instancia, y por eso volvió con `-todas`. La
forma correcta es la de siempre — **derivar el conjunto** (leer `medidas/` y
descartar los artefactos de la §regla 7), que es lo que ya hace `enlaces.mjs` con
las rutas del build: **lo nuevo entra solo**.

> **La señal para buscarlo:** un array de literales cuyo trabajo es *reconocer*
> algo —sufijos, familias, prefijos, extensiones—. Si el productor de esos
> nombres puede combinarlos, **la lista está incompleta desde el día que se
> escribió**; y si el consumidor no falla cuando no casa, no te vas a enterar.

⚠ **Y EL 8.º CASO, QUE ES EL QUE CIERRA LA REGLA POR ARRIBA (2026-08-19, 79.ª
tanda): CUANDO HAY QUE TOCAR UN CONJUNTO, LA ELECCIÓN ENTRE «RENOMBRAR EL
ORIGEN» Y «REPUNTAR A LOS CONSUMIDORES» SE DECIDE CONTÁNDOLOS — Y EL RECUENTO SE
DERIVA.**

> **Repuntar a los consumidores exige conocerlos a todos, o sea escribir la
> lista.** Renombrar el origen no exige conocer a ninguno: **los consumidores lo
> recogen porque resuelven el nombre, no porque estén enumerados.** Así que la
> segunda opción es la única que no envejece — y la primera es una lista escrita a
> mano disfrazada de plan de trabajo.

**Medido, y la evidencia es que el propio encargo lo cometió:** para cambiar de
espejo, un encargo verificado en disco enumeraba **6 puntos de entrada**.
Derivados con un `grep`, eran **16 en 11 ficheros**. **La lista se había quedado
corta en 10 antes de usarse**, así que la opción «repuntar» habría dejado 10
consumidores leyendo el fichero inválido **en verde y sin un solo error**.

**Las dos mitades operativas:**

1. **antes de elegir, DERIVA el conjunto** —`grep` sobre el nombre que vas a
   mover—, y decide con el número delante. Si sale más grande de lo que creías,
   eso *es* la respuesta;
2. **y al renombrar el origen, el nombre nuevo dice el DEFECTO Y SU ALCANCE**, no
   «viejo» ni «malo» (§regla 7). Un espejo que sólo está mal en un campo se
   nombra por ese campo: quien lo encuentre dentro de seis meses tiene que poder
   saber **qué parte suya seguía valiendo**.

**El efecto secundario es la mitad buena:** liberado el nombre canónico, los
consumidores que aún no se hayan re-medido **tiran en voz alta** en vez de leer
lo caducado. Es el defecto puesto en la dirección que grita (§sondas 6).

**Cómo se barre, y es siempre lo mismo:**

| lo que se quiere afirmar | cómo se deriva |
|---|---|
| «hay N de X» | `grep -c` · `Glob` · recorrer el árbol y contar |
| «X se cita en N sitios» | `grep -rn` sobre `docs/` y `scripts/` |
| «no existe fichero de Y» | **buscarlo en `medidas/` Y en `git log`** — regla 8b |
| «esta propiedad no varía» | la sonda, no la memoria |

**Y la forma general, que es lo que la hace regla y no anécdota:**

> **Un número recordado y un número derivado se escriben igual y no valen lo
> mismo.** El derivado envejece con el repo; el recordado envejece **contra** el
> repo, en silencio, y no hay lectura que los distinga. Por eso la exigencia no
> es «acuérdate bien»: es **que la afirmación traiga su derivación al lado**, que
> es lo que ya se le pide a las sondas (regla 2, congelar) aplicado a la prosa.

**10 · UNA AFIRMACIÓN DE COMPLETITUD SE VERIFICA EJERCITÁNDOLA, NO
RELEYÉNDOLA.** (2026-08-09)

La regla 9 persigue números afirmados de memoria. Ésta persigue su hermana
mayor: **afirmaciones de que algo ESTÁ COMPLETO**, que no son un número y por
eso no se pueden `grep`ear.

> **«Ya está capturado» · «el original sale del camino crítico» · «esa fase está
> cerrada» son afirmaciones sobre un CONJUNTO, y releer el acta que las escribió
> no las comprueba: sólo comprueba que el acta lo dice.** La única verificación
> es **USAR la cosa para lo siguiente que iba a necesitarla** — y si no se puede
> usar todavía, la afirmación se declara con su alcance, no con su titular.

**Caso medido:** el acta de F3-0 escribió *«EL ORIGINAL SALE DEL CAMINO CRÍTICO,
DEFINITIVAMENTE»* sobre una campaña de **272 registros con 0 fallos**. Todo
cierto, y la frase **falsa a medias**: al ir a sembrar salió que **0 de las 56
imágenes de `articulos-kb` estaban capturadas**. *Capturar las páginas no es
capturar sus assets.* Y lo destapó **intentar sembrar**, no releer el acta —
releerla habría vuelto a dar verde las veces que hiciera falta.

**Y a la segunda vuelta pasó otra vez, con la misma frase y otro conjunto:** ya
con las dos mitades capturadas, la frase seguía siendo falsa **para AUDITAR** —
los cuerpos de SECTOR y MONOGRÁFICO no estaban en ningún corpus (0 de 309, 0 de
272), excluidos con la razón *«CONSTRUIDA completa: el cuerpo es dato tipado
transcrito»*. Hubo que pegarle al original otra vez (§2d.3).

> **La forma general: una campaña se declara COMPLETA respecto a un USO, nunca
> en absoluto.** «Completa para sembrar» y «completa para auditar» son dos
> afirmaciones, y la segunda ni siquiera se había planteado. Un titular sin uso
> declarado es un cheque que firma la tanda siguiente.

**Operativamente:** cuando una tanda vaya a escribir *«X está completo»*, escribe
al lado **para qué** y **qué lo ejercitó**. Si nada lo ha ejercitado todavía, eso
es lo que se escribe — y es información, no una rebaja.

**11 · UNA SONDA NO SE PIPEA. NUNCA.** (2026-08-13)

Las diez reglas de arriba blindan lo que pasa **dentro** del proceso de una
sonda: el contrato de `Evaluadas`, el gancho de `exit`, `gritaSiRevienta`, la
guarda de `w()`. Ésta es la única que mira **fuera**, y por eso ninguna de las
otras puede sustituirla:

> **`npm run qa:x | tail` devuelve el código de salida de `tail`, no el de la
> sonda.** En `A | B` el exit es **el de B**. Así que una tubería —puesta por
> comodidad, para no leer 300 líneas— **anula el veredicto de las 157 sondas a
> la vez**, sin tocar una línea de código y sin dejar rastro.

**Y se lleva dos cosas, no una:**

| se pierde | cómo se ve |
|---|---|
| **el código de salida** | un rojo se lee como **verde** |
| **la salida misma** | `tail` bufferea hasta EOF; si el proceso se mueve a segundo plano o lo matan, **no imprime nada**: exit 0 y cero líneas |

**Es §regla 6 —*un valor por defecto convierte «no lo sé» en «está bien»*— en el
shell**, y el «valor por defecto» es que `tail` casi siempre funciona.

> **La forma correcta, y es más corta que la tubería:**
> `npm run qa:x > /tmp/x.log; echo "EXIT=$?"` — y después se lee el fichero.
> También vale mirar la congelada de `medidas/`, que es la prueba de verdad.

⚠ **Y esto se escribe aquí, en la ley, PORQUE YA ESTABA ESCRITO EN OTROS DOS
SITIOS Y NO SIRVIÓ.** Derivado con `grep`, tres ocurrencias del **mismo**
mecanismo:

| # | dónde quedó | qué costó |
|---|---|---|
| 1 | `PLAN-FASE-2.md` §F2-5 — *«el `EXIT=0` que se lee de `npm run check \| tail` **no es el de `check`**»*, **con la solución al lado** | la verificación de esa tanda **empezó creyendo que el árbol compilaba**, y no compilaba |
| 2 | `HANDOFF.md` §F2-5 — *«la tubería es un contenedor con holgura más (§La causa común), esta vez con el código de salida dentro»* | ídem |
| 3 | **esta tanda** | una corrida de `clon-base` de 302 rutas dada por perdida, y antes otra **descartada** por «no exhibible» cuando su congelada existía |

**Las dos primeras están bien escritas, bien razonadas y en el sitio
equivocado**: un acta y un plan de fase se leen una vez; `CLAUDE.md` se lee cada
sesión. Es §MENCIONADO NO ES DOCUMENTADO cobrado sobre una regla de método en
vez de sobre un hallazgo — y la prueba de que el sitio importa más que la
redacción.

**12 · UN HALLAZGO QUE ES REGLA Y NO EVENTO VIVE AQUÍ.** (2026-08-13)

La regla 11 se pagó **tres veces** y dos de ellas ya estaban escritas —bien, con
su mecanismo y su solución— en un acta y en un plan de fase. O sea que el fallo
no fue de redacción ni de razonamiento: **fue de UBICACIÓN**, y eso se puede
enunciar y evitar:

> **Un acta se lee UNA VEZ, en su sesión. `CLAUDE.md` se lee CADA sesión.** Así
> que un enunciado con forma de **regla general** —*«siempre que…», «nunca…»,
> «la forma correcta es…»*— escrito **sólo** en un acta, un plan de fase o un
> `HANDOFF` **equivale a no haberlo escrito**: se vuelve a pagar, y encima con la
> sensación de que ya estaba resuelto.

Es la hermana de §MENCIONADO NO ES DOCUMENTADO, aplicada a una **regla de
método** en vez de a un hallazgo — y con el discriminador al revés: allí el
problema era *no escribirlo*; aquí es *escribirlo en el sitio que nadie relee*.

**El discriminador, que es lo operativo:**

| lo que se escribió | dónde vive |
|---|---|
| **EVENTO** — qué pasó, con su fecha, su número y su ruta | el acta · `PENDIENTES-QA.md` · el plan de fase |
| **REGLA** — lo que hay que hacer *la próxima vez*, sin fecha ni ruta | **`CLAUDE.md`**, y el evento se queda de evidencia |

La prueba de que algo es regla y no evento: **quítale la fecha y el nombre
propio.** Si sigue diciendo qué hacer, es regla y va aquí.

> ⚠ **Y el barrido que la acompaña se hace ACOTADO, no sobre el archivo entero.**
> Barrer 7 296 líneas de `HANDOFF` produce ruido y ninguna decisión. Se barren
> **las actas de la fase en curso** buscando enunciados con forma de regla que no
> estén aquí, **y el número se escribe aunque sea cero** — «no encontré ninguna»
> y «no barrí» son la misma salida si no se dice (§regla del cero).
>
> **Barrido del 2026-08-13** (`PLAN-FASE-2.md` §F2-5 · `PLAN-FASE-3.md` §F3-1 y
> §F3-2, buscando `^> \*\*MAYÚSCULA…\*\*`): **31 enunciados, de los que 2 son
> regla general y no estaban aquí** —
>
> 1. **Un `next build` que falla no deja el build anterior: LO BORRA.** Y no hace
>    falta que falle: `next build` **vacía su directorio desde el primer
>    segundo**, así que reconstruir en sitio abre una ventana de ~90 s **sin
>    sitio** aunque todo vaya bien. Medido con `kunak-cms-pg` parado: `exit 1` y
>    `.next` sin `BUILD_ID`, sin `standalone` y sin `prerender-manifest`. **Es la
>    razón mecánica de la regla que ya está arriba** (*«mientras haya una sonda
>    en vuelo, nada de `build`, `check` ni `dev`»*): no es que el build
>    *desincronice* el `.next`, es que **se lo lleva por delante**. Se construye
>    fuera (`NEXT_DIST_DIR=.next-nuevo`) y se promociona por rename **sólo con
>    `exit 0`**;
> 2. **Un listado no tiene contenido propio: es una CONSULTA.** El contenido son
>    los términos y las colecciones; el listado es una proyección sobre ellos. Por
>    eso no hay colección «blog» ni «recursos» en el esquema. Vale para cualquier
>    arquetipo de archivo que venga después, y decide **que un listado no se
>    modela como content type** — el error contrario cuesta una colección por
>    cada archivo del sitio.
>
> Los otros 29 son **eventos** con su fecha y su número, y se quedan donde están.

**13 · UN DOCUMENTO SE ESCRIBE CON `Write`/`Edit`, NUNCA CON `node -e` NI CON UN
HEREDOC.** (2026-08-13)

Es la regla 11 —*el shell se mete en medio*— cobrada sobre el **contenido** en
vez de sobre el código de salida:

> **Todo texto que pasa por la línea de órdenes atraviesa un intérprete que
> reclama caracteres para sí**: backticks, `$`, `!`, comillas, `@'…'@`. Y no
> falla — **entrega el documento con huecos**, que es la salida que no se nota.

Medido: escribiendo actas por `node -e` y heredocs, el shell **se comió**
`qa:lh-pieles-css`, `L1` y `@media…` **dejando los huecos vacíos**. El fichero se
creó, el comando salió con 0, y el documento quedó afirmando menos de lo que se
había medido.

**Y por qué duele más que un error de shell normal:** un comando roto se ve; un
documento con tres huecos **se lee como si estuviera completo**, y la próxima
sesión lo cita.

La forma correcta es además la más corta: `Write`/`Edit` escriben el fichero
**sin intérprete en medio**. Para un mensaje de commit largo, el mismo criterio —
se escribe a un fichero y se pasa con `git commit -F`.

⚠ **Y AFINADO EL 2026-08-20, porque `-F` SE LEE COMO CUMPLIMIENTO SIN SERLO.**

> **`-F` no es la protección. La protección es que el TEXTO no pase por el
> shell.** `cat > msg.txt <<'FIN' … FIN; git commit -F msg.txt` tiene **la misma
> exposición** que `git commit -m`: el heredoc ya atravesó el intérprete. Y encima
> **parece la forma buena**, porque el `-F` está ahí a la vista.

Así que la regla se escribe con las dos mitades: **el fichero se crea con
`Write`** y **se pasa con `-F`**. La segunda sin la primera no protege de nada.

**Y la evidencia de que «más atención» no es el remedio son tres incidentes en
UNA sesión, todos de quien acababa de redactar la regla**: un `node -e` que se
comió un escape, un heredoc directo, y un `cat` + `-F` que parecía correcto. Los
tres sobrevivieron —`<<'FIN'` con el delimitador **entre comillas** no
interpola— y ésa es justo la trampa: la forma segura y la que se come el
documento **se distinguen en una comilla**, y equivocarse es **silencioso**.
Un heredoc que funciona veinte veces enseña que los heredocs funcionan.

⚠ **Y SU NEGATIVO TAMPOCO SE ESCRIBE POR EL SHELL (2026-08-20, 88.ª tanda).**

> **Un test que fabrica su entrada con `printf`/`echo` NO puede probar una
> guarda contra el shell: el sabotaje atraviesa el mismo intérprete que vigila,
> llega desactivado, y el caso sale VERDE.**

Medido en la misma sesión que esta nota: verificar el hook de `commit-msg` con
`printf '… `` …' > msg.txt` dio **exit 0** en el caso que tenía que fallar. No
era que el hook estuviera roto — era que **los backticks nunca llegaron al
fichero**, comidos exactamente por el mecanismo que el hook existe para cazar.
La segunda vuelta, con el fichero escrito por `Write`, dio **sabotaje 1 ·
control 0**.

Es §regla 15 —*compartir premisa no verifica la premisa*— con el objeto
cambiado: aquí lo compartido no es el fichero ni la variable, es **el defecto**.
La regla operativa es la de siempre y ya estaba escrita: **el fichero se crea
con `Write`** — también cuando el fichero es la entrada de un negativo.

**14 · UNA LIMITACIÓN DECLARADA SIN SU NÚMERO SE LEE COMO UNA NOTA AL PIE.**
(2026-08-14)

Las trece de arriba persiguen sondas que **no declaran** su límite. Ésta persigue
la que sí lo declara — y por eso es la que se cuela: cumple la letra del
contrato, y su salida es indistinguible de la de una sonda sin límites.

> **Una limitación sin cardinal no se puede sopesar, así que no se sopesa: se
> archiva.** *«No mide las intermedias»* es una frase; *«no mide las 86
> intermedias de 149»* es una decisión. Las dos ocupan un renglón del mismo
> campo, y sólo la segunda compite con la frase de cierre que tiene al lado.

**Medido:** `lh-serie` había dictado **«LA SERIE NO ES UNA UNIDAD»** —19 series
heterogéneas de 28— y el `noMide` de `lh-alcance` lo recogía, **sin número**.
Mientras tanto el cierre se leía *«LISTADO-B verificado»*. Lo que el campo no
decía:

| lo que el comparador no miraba | cardinal |
|---|---|
| páginas **intermedias** del universo | **86** de 149 |
| páginas **últimas** | **28** de 149 |
| clases tocadas | **11** de 38 (27 ciegas, 122 páginas dentro) |
| páginas que sí comparaba | **13**, todas la primera de su serie |

Y el defecto que vivía justo ahí: `PielB`, **mal en 31 de 38 instancias**, verde.

**Operativamente, y son dos mitades — la segunda es la que faltaba:**

1. **toda línea de `noMide` lleva su cardinal y su denominador.** Un puntero
   —*«ver `alcanceReal`, que lo dice con su número»*— **no cuenta**: mueve el
   número a un sitio donde ya no está al lado de la frase que contradice;
2. **si la limitación cambia lo que una frase de cierre afirma, se escribe
   TAMBIÉN en esa frase.** El campo que declara el límite y el titular que lo
   ignora conviven sin contradecirse a la vista, y gana el titular.

Es §*la cobertura declarada al nivel de arriba absorbe todo lo que no se midió
abajo* con el contenedor movido: aquí el que absorbe **no es la unidad del
informe, sino el propio campo que declara la limitación.**

**15 · UN CRUCE ENTRE DOS INSTRUMENTOS QUE COMPARTEN PREMISA NO VERIFICA LA
PREMISA.** (2026-08-14)

Este repo tiene escrito que **cruzar con otro instrumento es obligatorio** antes
de creerse un recuento nuevo (§sondas 4, *la contradicción con una medida buena
anterior*). Le faltaba **el límite**, y sin él un cruce se lee como una
verificación de todo lo que hay debajo:

> **Dos instrumentos que derivan del MISMO fichero concuerdan igual de bien
> sobre una premisa verdadera que sobre una falsa.** Así que un cruce al par
> prueba **que los dos leen lo mismo** —que es real y vale— y **no prueba que lo
> que leen sea correcto**.

Es el complementario de §*un patrón que casa en TODAS tampoco mide nada*, con el
objeto cambiado: allí el pleno lo fabricaba el selector, aquí **la concordancia
la fabrica la premisa compartida**.

**Medido, y por eso es regla:** los cruces de la 66.ª tanda (**5 445** pares) y
de la 68.ª (**10 707 / 10 714**) salieron **al par** sobre un universo que
llevaba dentro **7 documentos que no son rutas** —`/page/N` de series que no
paginan, con el canonical apuntando a la página 1— y **2 de ellos dentro del
conjunto «con contenido»**, invisibles al filtro porque repetían las tarjetas de
su página 1. Los dos cruces **no se inmutaron**, y no podían: el universo salía
del mismo espejo en los dos lados.

**Operativamente, y son dos frases separadas — nunca una:**

| lo que se escribe | lo que lo respalda |
|---|---|
| «los dos instrumentos leen el MISMO universo» | **el cruce**. Es real |
| «el universo es N» | **la derivación**, con su guarda y su sabotaje. El cruce no |

Y la consecuencia de redacción: **tras un cruce verde NO se escribe «el universo
está verificado»**. Se escribe qué lo verifica —una derivación independiente, con
un negativo que salga rojo si la premisa se rompe— o se dice que nadie lo ha
verificado.

**16 · «MISMO CÓDIGO» ES UN HECHO NEGATIVO. EL NO-DETERMINISMO ES LA ÚLTIMA
HIPÓTESIS, NUNCA LA PRIMERA.** (2026-08-18)

La §regla 8b dice que **los hechos negativos que un pre-registro afirme se
comprueban contra el archivo, no de memoria**. Ésta es la misma regla aplicada al
hecho negativo que más se afirma sin comprobar, porque quien lo afirma es quien
estuvo delante del teclado:

> **«las dos corridas son contra el MISMO código» no se recuerda: se DERIVA del
> diff entre los dos builds.** Y mientras no esté derivado, la explicación de que
> dos medidas difieran es **la más aburrida** —el árbol cambió entre medio—, no
> la más interesante.

**Por qué el orden importa tanto:** «no determinista» es una hipótesis que **no
tiene forma de fallar** y que **contamina hacia atrás todo lo medido en esas
rutas** —el propio registro lo escribió: *«cualquier Δ de contenido medido en
estas rutas es indistinguible de la oscilación»*—. O sea que colocarla la
primera **retira afirmaciones buenas** y manda a la tanda siguiente a arreglar un
defecto que no existe.

**Medido, y las dos mitades son del mismo día:** la 75.ª tanda fichó *«un grupo
de 36 pares de CONTENIDO aparece y desaparece entre builds del mismo código»* y
de ahí *«el clon no es determinista»* y *«contradice la premisa de `clon-base`»*.
**La misma tanda había aplicado y revertido una exclusión de documento entre esas
dos corridas, y lo escribió en su propio mensaje de commit.** Un `git log` de 12
líneas lo decía; nadie lo miró porque «no se tocó nada» se sentía sabido.

**Los tres discriminadores, en orden de coste creciente** — el primero suele
bastar:

| # | pregunta | cómo se contesta |
|---|---|---|
| 1 | ¿cambió el ÁRBOL entre las dos medidas? | `git log --format='%h %ad %s' --date=format:'%H:%M'` contra las **mtime de las congeladas**. Los commits llevan la hora |
| 2 | ¿cambió el DATO? | el clon lee de una DB: sembrar, excluir o re-extraer **no toca `src/` y mueve el render**. Un `nTarjetas` que baja es un documento menos, **no un empate** |
| 3 | ¿queda algo? | **entonces** sí: dos corridas contra el **mismo `.next`**. Y ojo, `iniciarClon()` **no construye** — lanza `npm run start` contra el `.next` que haya, así que dos sondas seguidas ya son mismo-build **por defecto** |

> **Y la firma que distingue las dos causas, que es gratis:** una EDICIÓN produce
> un conjunto de diferencias **anidado** —arregla unas, rompe otras, y al
> revertir vuelve exactamente al conjunto de partida—; el ruido produce
> diferencias **en las dos direcciones sin volver**. Medido: `-1 ⊂ -3` con **326
> claves menos y 0 nuevas**, que es la forma de una secuencia de arreglos y no la
> de un árbol que tiembla.

**Y la mitad que protege a la hipótesis de morir injustamente:** lo que quede sin
explicar **se declara con su n**, no se descarta por asociación. Aquí quedó
`/contaminacion-por-metano` **+16** con **n = 1**, en una corrida que murió antes
de repetirlo — ni defecto, ni ruido: **SIN PROBAR, y con la medida que lo dirime
ya planificada**.

> ✅ **MEDIDO 2026-08-17 (77.ª tanda), y el resultado NO es el que cerraba la
> pregunta:** `qa:clon-estados`, 60 cargas contra un solo build, da **UN estado
> en las dos rutas** (`41990`×30 y, en el control, `38502`×30). Así que se
> escribe **la cota** —regla de tres, `3/30` ⇒ **< 10 % por carga y ruta**— y el
> `+16` sigue siendo **regresión con su mecanismo SIN PROBAR**. Y una
> constricción nueva que ninguna de las dos sondas de un solo ancho podía dar:
> a **390 esa ruta no se mueve** (`81132 → 81132`), o sea que el `+16` es **de
> 1440 y sólo de 1440** — §regla espejo: en el otro ancho hay un contenedor que
> se lo come.

**17 · UNA GUARDA TIENE QUE DEVOLVER TODAS LAS MITADES DEL COMPORTAMIENTO QUE
RELEVA — Y `process.exitCode` NO MATA.** (2026-08-17)

La §4bis-sexta dice que un gancho que **releva** a Node —`uncaughtException`,
`unhandledRejection`— tiene que **devolver el fallo a su sitio**. Le faltaba
decir **cuántas mitades tiene ese sitio**, y son dos:

> **Ante una excepción no capturada, Node hace DOS cosas: elegir el código ≠ 0
> **y salir en el acto**. Un gancho que sólo pone `process.exitCode = 1`
> devuelve la primera y se queda la segunda** — porque `exitCode` no termina
> nada: sólo dice con qué código se terminará **cuando el bucle de eventos se
> vacíe**. Si algo lo mantiene vivo, **no se vacía nunca**.

**Medido:** `gritaSiRevienta` imprimía su banner entero y el proceso **se
quedaba colgado para siempre**, porque la excepción saltaba **después de
`launch()`** y el navegador de puppeteer sostenía el bucle. Con `spawnSync`
delante eso no es un rojo: es **`status: null` tras 15 minutos**, o sea un
negativo que **ni pasa ni falla — se agota**.

**Y por qué llevaba tiempo invisible, que es la parte reutilizable:** `qa:lib`
§3b ya probaba *«tras `iniciarClon()`, un `throw` SIGUE saliendo ≠0»* **y
pasaba**. Podía pasar: en su dominio **no hay ningún handle abierto**, así que
el bucle se vaciaba solo y las dos mitades daban el mismo resultado. Es
§*una regla derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR
para ese caso*, aplicada al **negativo de la propia guarda**.

> **Operativamente:** todo gancho que releve un comportamiento por defecto se
> prueba **con el bucle sostenido**, no sólo con el bucle limpio — y el remate
> va `unref()`ado, para no cambiar el caso que ya funcionaba.

**Y su hermana, del mismo día: UN SABOTAJE QUE COMPARTE VARIABLE CON EL MÍNIMO
NO PUEDE EJERCITARLO.**

> **Si el mínimo de una sonda se DERIVA de lo mismo que el sabotaje anula, el
> sabotaje MUEVE LA PORTERÍA** y el caso nunca prueba lo que su tabla promete.

Medido: el caso `sin-cargas` prometía *«0 cargas **< mínimo** ⇒ NO SE PUDO
EVALUAR»*, y con `minimo: RUTAS.length * CARGAS` poner `CARGAS=0` deja el mínimo
**en 0 también**: no hay «0 contra un mínimo positivo», hay «0 contra 0». Es
§regla 15 —*compartir premisa no verifica la premisa*— con el objeto cambiado:
aquí lo compartido no es el fichero, es **la variable**.

> ⚠ **Y SU SEGUNDA CARA, PAGADA EL 2026-08-18: UN SABOTAJE QUE ANULA MEDIA
> HIPÓTESIS NO FALSEA NADA.**
>
> La de arriba es sobre un sabotaje que mueve la portería. Ésta es sobre uno que
> **apunta a la mitad del blanco**, y sale VERDE — que es peor, porque un verde
> de un negativo se lee como *«la sonda sabe fallar»*:
>
> > **Si el arreglo que estás probando tiene DOS mitades, el sabotaje tiene que
> > anular LAS DOS.** Con una viva, el efecto sigue apareciendo, el caso pasa, y
> > lo que has demostrado es que **la otra mitad basta** — no lo que la tabla
> > del negativo dice.
>
> **Medido:** el arreglo del extracto de la tarjeta eran dos cosas —añadir un
> selector a la lista **y** rescatar el texto suelto sin envoltorio—. El sabotaje
> revertía sólo la lista, así que las **56** tarjetas que se ganan por la otra
> mitad mantenían la ganancia y el caso salía **exit 0 imprimiendo «NO-OP
> confirmado»**, que es literalmente lo contrario de lo que venía a probar.
>
> **Las dos mitades operativas:**
>
> 1. **el sabotaje anula el arreglo ENTERO** — si hace falta una bandera que
>    atraviese varias funciones, se pasa;
> 2. **y el CONTROL exige que cada mitad APORTE por separado.** Si una no gana
>    nada en el control, el sabotaje que la anula no prueba nada de ella, y su
>    código puede estar muerto sin que nadie lo vea. Se comprueba nombrando **la
>    vía por la que entró cada ganancia**, no el total.
>
> **Y lo que lo destapó no fue el código de salida, fue exigir que cayera POR SU
> MOTIVO**: el caso comprobaba `prohibidoEnSalida: /NO-OP confirmado/`, y ahí se
> vio que el rojo y el verde estaban imprimiendo la misma frase. §regla 1 —*lo
> que imprime y lo que cuenta no pueden discrepar*— aplicada al **negativo**.

**18 · «HAY UNA SONDA EN VUELO» NO SE DERIVA DEL ÁRBOL.** (2026-08-17)

Este documento ya manda *«mientras haya una sonda en vuelo, nada de `build`,
`check` ni `dev`»*. Le faltaba **cómo se sabe**, y resulta que con lo que una
tanda tiene mandado derivar **no se sabe**:

> **`git log`, `git status`, `qa:lib` y `ls medidas/` dan EXACTAMENTE LO MISMO
> con una sonda de otra sesión corriendo y sin ella.** La comprobación es de
> **PROCESOS**, no del árbol — y por eso hay que hacerla explícita: un árbol
> limpio no es un puerto libre.

**Medido:** una corrida de `clon-base 390 p1` venía en vuelo **de antes de la
sesión**, y el `npm run check` del PASO 0 —mandado por el propio encargo— le
cambió el `.next` por debajo. La guarda de `w()` hizo su trabajo y la desvió a
`clon-base-390-p1-CONTAMINADA.json` en vez de dejarla aterrizar con el nombre
bueno.

**Y el número que justifica descartar la corrida ENTERA** en vez de salvar «las
que parecen bien»: contra la corrida buena del mismo día, la contaminada difiere
en **10 de 367 rutas** — y **el fichero no dice cuáles**. Sin la guarda, esas 10
habrían entrado en la línea base indistinguibles de las 357 buenas.

> **Antes de `build`/`check`/`dev`: mirar los procesos** (`tasklist` / `ps`), no
> sólo `git status`. Y si aparece una sonda ajena en vuelo, **se espera o se
> construye fuera** (`NEXT_DIST_DIR`), que es lo que la §regla del build ya dice
> hacer.

**19 · UN MARCADOR DE INSTRUMENTO NO PUEDE SER UN COMENTARIO HTML EN UN
DOCUMENTO QUE SE INYECTA COMO CONTEXTO.** (2026-08-18)

> **El canal que auto-carga este fichero NO transporta los comentarios HTML**, y
> un comentario es la única forma cuyo «no aparece» **no deja hueco**: ni línea
> en blanco, ni marca, ni error. Así que su ausencia **no se distingue de que no
> exista**, y un canario con esa forma mide **cero por construcción**.

Es **§sondas 4** —*un selector que no casa con nada no es un cero*— cometida en
el **DISEÑO** de la sonda en vez de en su código. Y **se pagó dos veces en la
misma tanda**, que es la mitad que la convierte en regla:

| | qué se montó | cardinal |
|---|---|---|
| la sonda | 7 `KC-` + el `CANARIO-CARGA`, los ocho comentarios | **8 de 8 mudos** |
| **el control** | `KC-00`, fuera del repo — **y también un comentario** | **1 de 1 mudo** |

**Un control montado en la misma forma rota que la sonda no es un control**
(§regla 8: *un negativo sin control no es un negativo*): hereda el defecto que
venía a vigilar, así que su cero tampoco dirimía entre *«el canal los borra»* y
*«la copia auto-cargada es vieja»* — **0 instancias separadoras**, y la pregunta
se quedó abierta con el instrumento entero gastado.

> **Y el corolario operativo, que costó una iteración completa (v1 → v2): la
> forma correcta es TEXTO VISIBLE.** Ocho `KV-` en línea suelta se citaron **los
> ocho**, en orden y **ubicados en la estructura** del documento —o sea que llegó
> el contenido, no sólo las líneas de marcador—, y la pregunta que v1 dejó
> indecidible se cerró al primer intento.

Medido el 2026-08-18 sobre la v2 de este fichero —**156.426 chars**, **6.426**
por encima del aviso de 150.000—: **el truncado queda REFUTADO**, el aviso del
harness es **informativo** y §regla 12 conserva su premisa —`CLAUDE.md` se lee
cada sesión, **entero**—. El instrumento se retira salvo dos líneas sueltas,
`KV-01` (~30 % del fichero) y `KV-08` (a 16 chars del final), que se quedan de
**tripwire permanente**: con los dos extremos, cualquier sesión futura contesta
«¿me llega entero?» **sin volver a instrumentar**. Acta, los cinco veredictos y
lo que sigue sin medir: `PENDIENTES-QA.md` §META-CANARIOS-DE-CARGA.

**20 · UNA SONDA QUE RESETEA EL ENTORNO NO ES SÓLO UNA MEDIDA: ES UNA MUTACIÓN,
Y SU VERDE NO DICE QUE EL ENTORNO QUEDE COMO ESTABA.** (2026-08-18)

> **Un comparador que necesita partir de cero —un `reset`, un `exigeVacia`, un
> `truncate`— destruye el estado ANTES de medir, y lo que reconstruye después es
> SU universo, no el de la sesión.** Así que su ✅ es cierto **de lo que
> compara** y no dice absolutamente nada del entorno que deja detrás.

**Medido:** `qa:cms-roundtrip` resetea la DB y siembra las **9 colecciones de
`SEMBRADAS`**. Salió **352/352 documentos idénticos** —verde legítimo— y dejó
`categorias-recursos` **sin el término `articulos`**, porque ese término lo
escribe `cms:seed-listados`, que el round-trip no corre. `qa:lh-poblacion` pasó
en el acto de **0 series cortas a 1**, con `poblacionClon: 0` en
`/recursos/articulos`.

**Y lo que la hace regla y no anécdota es la ATRIBUCIÓN:** ese rojo se lee como
una regresión del cambio que la tanda estaba haciendo —un campo nuevo en el
esquema— **y no lo era**. Lo dirimió comparar contra la congelada **del mismo día
y anterior al cambio** (`lh-poblacion-2026-08-18.json`, `seriesQueNoAlcanzan: 0`).
Es §regla 16 —*el discriminador es si cambió el ÁRBOL o el DATO*— con el DATO
movido **por una sonda** en vez de por una edición, que es el caso que aquella
regla no nombra.

> **Operativamente, y son dos líneas:** (1) toda sonda que resetee **lo dice en
> su salida y nombra qué repuebla y qué no**; (2) después de correrla, el entorno
> se **restaura con el pipeline completo** antes de leer ninguna otra sonda —
> porque las que vengan detrás van a medir el universo que ella dejó, no el tuyo.

⚠⚠ **Y SU CASO PEOR, PORQUE EL ENTORNO ES EL PROPIO REPO: UN SABOTAJE QUE EDITA
EL FUENTE SOBREVIVE A LA MUERTE DE SU CORRIDA (2026-08-20, 88.ª tanda).**

> **Un `finally` de JavaScript NO corre cuando el proceso muere por una SEÑAL.**
> `SIGTERM`/`SIGKILL` —un `taskkill`, el timeout de un harness, un Ctrl-C—
> terminan sin desenrollar la pila, así que el `revierte()` **nunca se ejecuta**
> y el sabotaje **se queda escrito en el fichero versionado**.

Y a partir de ahí no lo ve nadie: el fuente saboteado **sigue compilando**, así
que `qa:lib` pasa, `npm run check` pasa, y la sonda saboteada devuelve **un
número plausible**. El siguiente `git add -A` lo commitea.

**Medido:** el sabotaje `marcador-ubicuo` ensancha `EXPRESABLES` de 9 etiquetas
a 16 en `scripts/qa/texto-poblacion.mjs`. Tras matar una corrida colgada, quedó
puesto y **entró en un commit**. Se cazó leyendo la lista de ficheros del propio
commit —`scripts/qa/*.mjs` en una tanda que no tocó ninguna sonda— y se
verificó restaurándolo: la sonda vuelve a reproducir su control `kb-recon.json`
**al carácter**.

**Las tres mitades operativas:**

1. **antes de commitear, mira si hay FUENTES de sonda en el `git status`** que la
   tanda no haya tocado. Es la única señal, porque no hay guarda que lo vea;
2. **un sabotaje no edita el fuente: corre una COPIA.** Si tiene que editar,
   registra además `process.on("exit")` y los manejadores de señal — un
   `finally` solo cubre la salida ordenada;
3. **y el cardinal se declara**: hoy es **1 de 59** negativos (`texto-poblacion`),
   derivado con un `grep` de `writeFileSync(SONDA`. Que sea uno es lo que hace
   barato el arreglo, y saberlo es lo que impide creer que son todos.

**21 · UN NEGATIVO EN ROJO NO ES UN NEGATIVO PODRIDO HASTA QUE CORRES SU SONDA
SOLA.** (2026-08-18)

Las veinte de arriba protegen de instrumentos que no miran. Ésta protege de
**arreglar el instrumento equivocado**, y su coste es que el arreglo *funciona*:
el negativo se pone verde y el hallazgo que había debajo desaparece.

> **«El sabotaje ya no muerde» y «la sonda está gritando un hallazgo real» dan
> EXACTAMENTE LA MISMA SALIDA desde fuera: un caso en rojo.** Y sólo el primero
> se arregla tocando el negativo. Así que la primera orden ante un negativo rojo
> no es abrir el negativo: es **correr su sonda sola, sin sabotaje**, y mirar si
> ya sale roja.

**El discriminador, y es una sola corrida:**

| la sonda sola sale… | qué es | dónde se arregla |
|---|---|---|
| **verde** | el sabotaje dejó de morder, o su expectativa envejeció | **en el negativo** |
| **roja** | la sonda tiene razón: hay un hallazgo | **en el dato o en la sonda** — y el negativo se queda rojo, con su ficha |

**La evidencia es un reparto medido, no una anécdota:** de **6** negativos que
quedaron rojos tras una tanda dedicada a arreglarlos, **5** lo estaban porque su
CONTROL reproducía un rojo legítimo de la sonda — un campo del esquema sin
lector, un control interno que no cuadra, un dominio por debajo de su testigo,
28 rutas sin origen. **Uno solo era un negativo podrido.**

> **Y el corolario que evita el daño: un caso que pasa a verde AJUSTANDO su
> expectativa al valor de hoy no ha arreglado nada — ha escrito el defecto
> DENTRO de la guarda.** Si para poner verde un negativo hay que cambiar el
> `exit` que espera, o rebajar la condición que comprueba, la respuesta correcta
> casi siempre es **dejarlo rojo y ficharlo**. Una guarda que se acomoda al
> defecto que vigila deja de vigilarlo, y encima en silencio.

**El tercer caso, que no es ninguno de los dos y hay que saber nombrarlo:** el
sabotaje muerde, la sonda está bien, y **el dominio no tiene con qué ejercitar
el caso** — 0 instancias separadoras, 0 elementos de la clase que la guarda
vigila. Eso no es «roto» ni «probado»: es **SIN PROBAR**, se reporta con su
denominador y **sigue contando como fallo**, porque un SIN PROBAR que sale verde
se lee como probado (§*dos modelos que predicen lo mismo en todo tu dominio son
uno solo*, aplicado al sabotaje).

⚠⚠ **Y LA VUELTA, QUE ES LA QUE NADIE MIRA PORQUE SALE EN VERDE: UN CASO DE
NEGATIVO PUEDE MORIRSE EL DÍA QUE SE ARREGLA EL OBJETO — Y SE MUERE VERDE
(2026-08-21).**

La regla de arriba enseña a leer un negativo **en rojo**. Su complementaria es
que un negativo en **verde** puede haber dejado de probar nada, y ahí no hay
ninguna señal:

> **El poder discriminante de un sabotaje depende del ESTADO DEL OBJETO, no
> sólo del código de la sonda.** Un caso que separaba de sobra mientras había
> defecto puede pasar a predecir **exactamente lo mismo que la corrida limpia**
> en cuanto el defecto se arregla. Cero instancias separadoras — y sigue
> imprimiendo su ✓.

**Medido, y en la misma tanda que lo produjo:** el caso `sin-diferencias`
copiaba el lado del original al del clon y exigía «0 distintos». Con el defecto
puesto **discriminaba**: separaba *«la comparación compara»* de *«el comparador
inventa diferencias»*. Terminada la transcripción, los dos lados quedaron a Δ0 y
el sabotaje pasó a predecir lo mismo que no sabotear nada. Habría seguido en
verde indefinidamente.

**Las dos mitades operativas:**

1. **cada vez que una tanda mueva el objeto a verde, RELEE sus negativos
   preguntando qué separa cada caso AHORA** — no si pasa. Es §regla 5ter (*
   arreglar el objeto caduca el control*) con el objeto cambiado: allí el
   control escribía el valor de ayer, aquí el sabotaje anula algo que ya no
   estaba;
2. **y el caso muerto se SUSTITUYE por su simétrico, no se borra.** Con defecto
   la pregunta es *«¿sabe callar?»*; sin defecto es *«¿sabe gritar?»* — se
   inyecta un Δ **conocido** y se exige que la sonda lo cace **y lo nombre**.

> **Y el corolario de diseño, que evita la mitad del problema: el control de un
> negativo NO se cablea al código de salida cuando la sonda es un
> COMPARADOR.** Su exit cambia con el estado del objeto —2 con defecto, 0 sin
> él— así que un control atado a cualquiera de los dos caduca el día del
> arreglo. Se ata a lo que es cierto en los dos estados: que alcanza su dominio,
> que publica sus ejes y que discrimina lo que dice discriminar.

**22 · UN BOOLEANO DE CONCORDANCIA ES VERDADERO SOBRE UN DOMINIO DE UNO IGUAL
QUE SOBRE UNO DE MIL.** (2026-08-20)

Las reglas 9 y 14 persiguen números afirmados de memoria y límites sin cardinal.
Ésta persigue el sitio donde el cardinal **no se olvida: se sustituye por un
`true`**, y por eso ninguna de las dos lo caza.

> **«1:1» · «coincide» · «no hay excepciones» · «varianza cero» son
> INDICADORES BOOLEANOS, y su valor no depende del tamaño del dominio.** Así que
> la guarda **no se pone sobre el booleano —sale `true` en los dos lados— sino
> sobre su CARDINAL.** Un `esUnoAUno: true` al lado de un `n` que nadie lee es
> §regla 14 con el número dentro del propio veredicto.

**Medido:** el sabotaje `corpus-mudo` de `qa:pie-legal` encoge el dominio del
cruce de **145 páginas a 12**. `esUnoAUno` **sigue saliendo `true`** —una piel,
un contexto: técnicamente 1:1— y el veredicto se leería como *«el discriminador
está probado»* sobre 12. El único modo de que el negativo cayera fue comprobar
**el denominador**; comprobar la concordancia **no podía** cazarlo.

**Y su forma general, que es la que lo hace regla:** es §*un patrón que casa en
TODAS tampoco mide nada* con el objeto cambiado — aquí el pleno **no lo fabrica
un selector, lo fabrica un dominio encogido**. Operativamente: toda sonda que
publique un booleano de concordancia **publica su `n` al lado y cierra su código
de salida con el `n`**, no con el booleano. Y el mínimo del `n` se **deriva de la
fuente entera**, nunca del subconjunto que la corrida esté mirando — si
compartieran variable, el sabotaje movería la portería (§regla 17).

**23 · UN CRITERIO DE ASIMETRÍA SE CITA CON SU OPERACIÓN DE DESHACER NOMBRADA.
SU CONCLUSIÓN SOLA ES SIMÉTRICA, Y AL RELEERLA EL SIGNO SE INVIERTE.**
(2026-08-22)

La §regla 9 persigue **números** recordados en vez de derivados. Ésta persigue lo
mismo en un **criterio**, y es peor porque un criterio no se puede `grep`ear
contra el repo: se vuelve a derivar en la cabeza de quien lo cita.

> **«Entre dos opciones reversibles se toma la que se deshace mejor» NO DICE
> CUÁL ES.** Para aplicarlo hay que rehacer el paso *«¿cuál es aquí la operación
> de deshacer, y qué lado es el barato?»* — y ese paso, hecho de memoria, sale
> invertido **la mitad de las veces sin que nada chirríe**, porque las dos
> lecturas suenan igual de sensatas.

**Medido:** §1.5b Razón 3 —*fusionar luego es más barato que separar luego*—
favorece **la opción que empieza SEPARADA**, porque deshacerla es *fusionar*, que
es el lado barato. Dos veces en este repo la maquinaria eligió bien con ese
razonamiento (**dos apps** en CMS-0f, **dos colecciones** en §1.5b). A la
tercera, un plan de fase escribió *«ordena la colección ÚNICA antes que las
dos»* — el signo al revés — y **el mismo párrafo la aplicaba bien tres líneas
antes**. Derivado con `grep`: **11 citas en el repo, 2 invertidas**, y las dos
eran del mismo enunciado copiado de un documento a otro.

**Y lo caro no es el error, es lo que TAPA:** con el signo invertido, la opción
elegida parecía la que el criterio ya bendecía, así que **no llevaba condición de
reapertura**. Con el signo bueno resulta elegida **CONTRA** el criterio — que es
perfectamente legítimo cuando otra restricción pesa más, pero **obliga a escribir
qué tendría que pasar para revisarla**. Un signo invertido no produce una
decisión distinta: produce **una decisión sin su salvaguarda**.

**Operativamente, y son dos mitades:**

1. **al citar un criterio de asimetría se escribe la OPERACIÓN, no sólo la
   conclusión** — *«se toma la separada, porque deshacerla es fusionar y fusionar
   es el lado barato»*. Con la operación delante el signo no se puede invertir;
2. **y cuando una decisión se tome CONTRA el criterio, se dice** —qué restricción
   pesó más y por qué— **y se le pone condición de reapertura**. Una decisión
   alineada con el criterio puede no llevarla; una que lo contradice, siempre.

**24 · EL NEGATIVO DE UN COMPARADOR SE CORRE ANTES DE QUE EXISTA EL LADO QUE VA
A MEDIR.** (2026-08-22)

Este documento ya manda construir la sonda comparadora al estrenar arquetipo
(§*UN ARQUETIPO NUEVO NO HEREDA COBERTURA*). Le faltaba **cuándo se prueba**, y
la respuesta no es «cuando haya algo que comparar»:

> **Un comparador tiene DOS lados, y casi todas las preguntas de su negativo
> —*¿compara o inventa? ¿sabe gritar? ¿tiene sus insumos?*— **no dependen del
> lado que todavía no existe**. Se contestan copiando un lado sobre el otro. Así
> que el instrumento se puede probar **antes** de construir lo que va a medir —
> y entonces hay que hacerlo, porque un comparador sin negativo probado no
> adjudica nada y llegaría a su primera corrida sin garantía.

**Y la ganancia no es de calendario, es de ATRIBUCIÓN:** cuando el lado nuevo
aparezca, un rojo sólo puede ser suyo — el instrumento ya está adjudicado. Si
los dos se estrenan a la vez, un rojo tiene **dos** explicaciones y ninguna
medida las separa.

**Medido:** un comparador estrenado sin objeto pasó sus 3 casos —`mismo-lado`
0 distintos · Δ conocido de 37.50 cazado y **nombrado** en 6 de 6 · insumos
ausentes ⇒ corrida NULA— con **tres códigos de salida y tres mensajes
distintos**, que es lo que hace que un rojo futuro se pueda atribuir. **Y de
paso encontró DOS defectos del propio comparador**, los dos invisibles: una
guarda que no podía dispararse y un selector que contaba la capa equivocada.

> ⚠ **Y el caso `sabe gritar` es el que hay que acordarse de escribir.** Sin
> objeto no hay defecto que ocultar, así que la pregunta del negativo **no** es
> *«¿sabe callar?»*: se inyecta un Δ **conocido** y se exige que lo cace **y lo
> nombre con sus dos lados**. Un caso atado sólo al código de salida caduca el
> día que haya objeto (§regla 21, la vuelta).

**Y SU MITAD DE HIGIENE, que se cobró en la misma tanda: UN SABOTAJE POR
VARIABLE DE ENTORNO TIENE QUE DESVIAR EL NOMBRE DE LA SALIDA ÉL MISMO.**

> **Si el desvío depende de que quien lanza la sonda ponga además la variable
> que nombra la corrida —aquí `NEG=`—, el nombre CANÓNICO queda al alcance de
> una corrida de control.** Y lo que sale entonces es lo peor de §regla 7: un
> fichero con **nombre de medida y contenido de control**, plausible y con la
> autoridad de una congelada.

Medido: `NEG_MISMO_LADO=1 node <sonda>.mjs` —sin `NEG=`— congeló la canónica con
el lado del clon **copiado del original** y un `httpClon: 200` **fabricado**.
Quien la abriera leería *«248 pares · 0 distintos · clon 200»* y concluiría que
el clon es perfecto, **sin que exista clon**.

**La forma correcta, y es una línea:** la sonda comprueba **sus propios
sabotajes** y, si hay alguno activo sin corrida de negativo, **desvía y lo dice
en voz alta**. Se arregla la CLASE —la sonda—, no la instancia —acordarse de
poner `NEG=`—. Y el efecto secundario es la mitad buena: **el nombre canónico
queda libre**, así que hasta que haya una corrida de verdad, quien lo lea falla
en voz alta en vez de leer un control.

**25 · UNA GUARDA CUYO DOMINIO ES MÁS ANCHO QUE SU INVARIANTE DEJA DE PROTEGER
Y PASA A BLOQUEAR — Y ESO NO DA ERROR: DA UN RECHAZO LEGÍTIMO.** (2026-08-22)

Todo lo escrito arriba sobre guardas persigue el mismo fallo: **que no vean**.
Ésta es la dirección contraria, y por eso no la caza ninguna de las otras:

> **Una guarda que reclama MÁS de lo que su invariante cubre no falla en voz
> alta: rechaza cosas correctas.** Y el rechazo llega con toda la autoridad de
> la guarda —un `UNIQUE` de la base, un `exit 1`, un mensaje bien redactado—
> así que quien lo reciba **corrige lo que estaba bien**.

**Medido, y en las dos direcciones el mismo día.** Un registro de unicidad
impone *«dos documentos no pueden compartir slug EN EL PLANO DE RAÍZ»*, y quien
lo escribe acepta un predicado para decir qué documentos están en ese plano.
Una colección **prefijada** que no pase el predicado reclama sus slugs en un
plano donde no vive:

| | reclama | sin ruta de raíz | qué habría bloqueado |
|---|---|---|---|
| colección prefijada, ya en producción | 6 | **6 de 6** | 6 slugs de raíz que ninguna URL usa |
| colección nueva, **antes** de emitir | 31 | **12 de 31** | 12 más — evitado por medir la profundidad primero |

**El discriminador es barato y es el mismo siempre: comprobar que el DOMINIO de
la guarda y el del invariante son el mismo conjunto**, no que la guarda
funcione. Aquí se comprueba midiendo cuántos de los documentos reclamados
**tienen de verdad** una URL en el plano que se reclama; si no la tienen, la
reserva sólo puede estorbar.

> **Y su corolario de redacción, que es donde se cuela:** *«la guarda cubre X»*
> y *«la guarda SÓLO puede rechazar X»* suenan igual y son afirmaciones
> distintas. La primera se comprueba con un caso que pasa; la segunda, con el
> **cardinal de lo que la guarda alcanza y el invariante no**. Publícalo — si
> sale 0, la guarda está ajustada; si no, ése es el número de rechazos falsos
> que espera.

**Y SU MITAD DE CONJUNTOS, del mismo día: UN CONJUNTO DEFINIDO POR COMPLEMENTO
DEJA DE SER DISJUNTO EN CUANTO EL ENUMERADO CRECE.**

> **«Todo lo que nadie declara» y «todo» son el mismo conjunto mientras nadie
> declare nada** — y entonces la diferencia entre los dos no se puede ver. El
> día que la enumeración se amplía, el complemento **hay que recalcularlo**, y
> si no, el mismo elemento cae en dos grupos y la comparación informa
> diferencias que son **la misma cosa consigo misma**.

Medido: una familia implícita definida como *«las rutas estáticas»* funcionó
mientras las familias explícitas eran 2 y ninguna tenía rutas estáticas. Al
derivarlas —pasaron a 4— entró una **cuyas páginas SON rutas estáticas**, y la
sonda informó **3 colisiones y 3 sombras inexistentes**. La corrección es la
palabra que faltaba: *«las estáticas que nadie declara»*, y se calcula
**después** de leer lo declarado, no antes.

> **Operativamente: si tu comparación tiene un grupo «los demás», su definición
> depende del resto de grupos — así que ampliar el resto es tocarlo.** Es
> §*un patrón que casa en TODAS tampoco mide nada* con el objeto cambiado: no un
> selector que sobra, sino un conjunto que dejó de ser disjunto sin que nadie lo
> tocara.

**26 · UN COMANDO QUE NOMBRA UNA GUARDA NO PRUEBA QUE LA GUARDA EXISTA — Y LA
SONDA QUE LAS CENSA MIRA EL OTRO CANAL.** (2026-08-22)

Las guardas de arriba vigilan sondas que **no miran**. Ésta vigila una que **no
existe**, y sobrevive porque **los dos canales que podrían delatarla miran cada
uno una mitad**:

> **Un `npm run <algo>-neg` declarado en `package.json` y el fichero del negativo
> en el disco son DOS CANALES.** El registro de comandos dice *«esto existe»*; la
> sonda que censa negativos **enumera el disco**, así que un negativo que falta
> **no le sale rojo: no le sale**. Y nadie lo corre a mano, porque el `npm run`
> está ahí y eso **se lee como que el negativo está ahí**.

Es §*un selector que no casa con nada no es un cero* con el selector puesto en un
`readdirSync`, y §*documentado no es conectado* con el objeto cambiado: allí el
comentario prometía una llamada que no existía; aquí **el registro de comandos
promete un fichero que no existe**.

**Medido:** cruzando los `*-neg` de `package.json` contra el disco, **4 de 76
nombraban un fichero ausente**. Ninguno aparecía en el censo de negativos —61
ficheros— ni en ningún recuento: no eran «negativos rojos», eran **negativos que
no existen**, y las dos cosas se leen igual desde fuera, como silencio.

> **La guarda cuesta un `filter` de tres líneas —cruzar el registro contra el
> disco— y hay que escribirla en la sonda que censa, no acordarse.** Mientras no
> esté, la única prueba de que un negativo existe es **abrir el fichero**.

⚠ **Y el aviso de método que vino con ella, porque se cometió al derivarla:** el
primer filtro dio **0** porque el regex `scripts\/[\w\/-]+\.mjs` **no casa un
punto**, y todos los negativos llevan `.neg.` en medio. Un cero perfectamente
plausible **de un filtro roto** — §sondas 4 sobre un `grep` propio. Lo delató
que **el fichero que se iba a escribir tenía que salir en esa lista y no salía**:
o sea, **un caso conocido de antemano**, que es la forma más barata de auditar un
cero que uno mismo acaba de producir.

**27 · UN PROCESO QUE ABORTA EN EL PRIMER FALLO CONTESTA «HAY AL MENOS UNO»,
NUNCA «HAY N» — Y SU RESPUESTA SE LEE COMO UN INVENTARIO.** (2026-08-23)

§regla 10 manda **ejercitar** una afirmación de completitud en vez de releerla, y
tiene razón. Le falta decir **qué devuelve el ejercicio**, porque casi nunca es lo
que hace falta para decidir:

> **Un validador que corta en el primer fallo, un `create` que lanza en el primer
> campo inválido, un build que muere en el primer error: los tres contestan
> «existe al menos un problema» y ninguno contesta «hay N».** Y como la respuesta
> llega **nombrando uno concreto**, se lee como si fuera el problema — no como una
> muestra de tamaño 1.

**Las dos formas en que muerde, y son la misma con distinto eje:**

| eje | qué pasa | cómo se ve |
|---|---|---|
| **entre unidades** | arreglas el que te dijo, vuelves a correr, aparece otro | *«uno por corrida»*, cada una con su reset por delante |
| **dentro de una unidad** | el validador mira N cosas y devuelve **la primera** que falla | **retirar lo de delante DESTAPA lo de detrás**, y lo de detrás no estaba en ningún informe |

**Medido, y las dos mitades el mismo día.** Una tanda midió UN eje —etiquetas—
sobre un validador que mira **cuatro** (script · etiqueta · host · atributo) y
concluyó que las etiquetas eran lo que paraba la siembra. Cierto **del eje que
miró**. Retiradas las etiquetas, quedó **1 campo rechazado por ATRIBUTO** que
nadie había visto. Y sembrar, que era la forma correcta de ejercitarlo, sacó
**dos bloqueos más a razón de uno por corrida**.

Derivado el denominador entero por los cuatro canales: **12 bloqueos · 2 páginas
de 31 · 3 canales de 4**, con el cuarto publicado a **0 sobre 697 comprobados**.

**Las dos mitades operativas:**

1. **el denominador NO se obtiene re-corriendo el proceso: se DERIVA recorriendo
   todos sus ejes** contra el mismo dato. Un instrumento que clasifica en vez de
   abortar contesta la pregunta que la decisión necesita, y de paso convierte N
   corridas en una;
2. **y los ejes que salen a CERO se publican CON SU DENOMINADOR.** «0 bloqueos de
   `required`» y «no miré `required`» son la misma salida si el informe no lo
   nombra — que es §sondas 4 aplicada al **eje** en vez de al selector.

> **Y el corolario de redacción, que es donde se cuela:** *«lo que para esto es
> X»* y *«lo primero que encontré es X»* se escriben casi igual, y sólo la segunda
> es lo que el proceso dijo. Un titular con la primera forma manda a la tanda
> siguiente a arreglar X y a descubrir Y — otra vez de uno en uno.

**28 · UN SABOTAJE SE PONE EN EL DATO, NO EN EL UMBRAL — Y UNA SONDA QUE
SUSTITUYE UNA PIEZA POR UNA CONSTANTE DEJA ESE CANAL SIN MEDIR.** (2026-08-23)

Dos caras de lo mismo: **una pieza del instrumento sustituida por una constante**,
y en las dos el resultado sale en verde y se lee como dato.

**(a) El sabotaje que mueve el umbral.** Casi toda guarda tiene la forma
`medido > umbral`. Sabotear el **umbral** parece equivalente a sabotear el
**dato** — y no lo es:

> **Bajar el umbral a 0 sólo muerde si `medido > 0`.** Si el dominio da `medido =
> 0`, la condición pasa a ser `0 > 0` y el caso sale **exit 0**, sin haber
> ejercitado nada. Es §regla 17 segunda cara con nombre y apellidos: el sabotaje
> anula **media** hipótesis y deja el otro lado quieto, así que tiene **0
> instancias separadoras POR CONSTRUCCIÓN** — no por pobreza del dominio.

**Medido:** un censo declaraba el sabotaje `tope-cero` —bajar a 0 el tope de
atributos ubicuos— y en ese corpus hay **0 ubicuos** (el más extendido está en 242
de 294 páginas). El caso llevaba declarado desde que se escribió la sonda y salía
**verde**. Rehecho contra el DATO —hacer que todos los atributos salgan en todas
las páginas, que es el modo de fallo del que la guarda protege— muerde a la
primera.

> **La regla operativa: el sabotaje reproduce EL MODO DE FALLO que la guarda
> vigila, no la aritmética de su condición.** Y se comprueba antes de creérselo,
> preguntando *«¿cuánto vale el lado medido HOY?»* — si es 0, tocar el umbral no
> puede hacer nada.

**(b) El stub que ciega un canal para siempre.** La misma sustitución, pero
puesta en la sonda buena en vez de en su negativo:

> **Una sonda que reemplaza una dependencia por una constante —`ctx.media = async
> () => 0`, un `payload` de mentira, un `fetch` que devuelve `{}`— no está
> midiendo ese canal.** Su «0 defectos» es cierto de lo que mira y **no dice nada
> del canal que anuló**, que es §sondas 4 con el cero puesto en un stub.

**Medido:** un sondeo de frontera que sustituía el resolutor de media por `0`
publicó **«0 defectos de INSTRUMENTO»** y dejó pasar hasta el `seed` una imagen
alojada en un host ajeno. **El comentario del código lo decía** —*«un payload de
mentira»*—; **el informe no**, y §regla 14 es exactamente eso: una limitación sin
su número se lee como nota al pie.

> **Operativamente: toda sonda que sustituya una dependencia lo PUBLICA en su
> informe, con el nombre del canal que deja de medir.** Un stub es una limitación
> de alcance, y las limitaciones de alcance se declaran arriba, no en un
> comentario junto a la línea que las causa.

## Comandos

```bash
npm run dev        # desarrollo
npm run check      # lint + typecheck + build  ← antes de commitear
npm run build
npm run typecheck
```

`KV-08 · 5ZMCFR`
