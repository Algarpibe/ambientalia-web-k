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

| régimen | cómo se reconoce | quién decidió los valores |
|---|---|---|
| **página de BUILDER** | `et_pb_pagebuilder_layout` en el `<body>`; secciones **propias** de la instancia | **quien editó ESTA página** |
| **página PLANTILLADA** | `et-tb-has-body`; secciones `…_tb_body`; el contenido entra por un módulo `post_content` | **quien construyó la plantilla**, para todas las instancias a la vez |

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

Medido: `post_content margin-bottom` vale **72 en las 12 instancias de blog** y
**0 en las 12 de término y documento científico**, a los dos anchos. Por el
enunciado literal del test A eso sería «campo»; **no lo es** — es el valor que el
constructor de cada plantilla fijó. En las 24 instancias muestreadas, **el ritmo,
la tipografía y la retícula del cascarón tienen varianza cero dentro de cada
forma**.

**Consecuencia operativa: identifica el régimen ANTES de aplicar el test.** Se
mira el `<body>` —una línea de HTML servido— y ya sabes cuál de las dos lecturas
toca. Aplicar el test sin mirarlo es cómo se convierte una plantilla en ocho
campos inventados, o al revés.

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

> **Las tres son la misma:** al transcribir, lo que se replica es **lo que el
> navegador hace con lo servido**, no lo que el autor pretendía, ni lo que un
> formateador considera limpio, ni un valor equivalente en otro selector.

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

⚠ **Y su moraleja es la de la regla 4, otra vez:** `c-cabecera` se parcheó a mano
primero. Eso es arreglar **la instancia y no la CLASE**, que es exactamente cómo
se llega a la tercera tanda del mismo bug. La guarda solo cuenta cuando está en
el sitio por el que escriben todas. Test en negativo: **`npm run qa:lib`**.

**Y su otra mitad, que la guarda NO cubre y hay que hacer a mano:**

> **Congelar y COMMITEAR van en la misma tanda, antes de re-correr nada contra
> ese fichero.** La guarda de `w()` protege de que **una sonda** pise su salida.
> De un **borrado manual** —o de un `rm` para «dejar sitio», o de un `git
> checkout` distraído— no protege nada excepto que el fichero ya esté en git.

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

**Los tres primeros son recuentos; los tres últimos son peores**, porque el
número mal contado ya había **decidido algo**: qué se modela, qué se cierra, qué
se persigue.

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

## Comandos

```bash
npm run dev        # desarrollo
npm run check      # lint + typecheck + build  ← antes de commitear
npm run build
npm run typecheck
```
