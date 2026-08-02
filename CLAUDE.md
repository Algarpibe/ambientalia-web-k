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
«no se ha mirado» no está en ningún otro sitio del repo. Hoy: el ancho del
**cuerpo** está a **0/31**, el comportamiento a **0/31**, y de las 41 sondas
**solo 9 abren los dos lados**.

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

Los seis contenedores son distintos y el error es el mismo: se leyó el número
del nivel de arriba porque estaba a mano.

**Y hay un séptimo contenedor, que no contiene píxeles sino AFIRMACIONES: la
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

### Cinco reglas sobre las sondas mismas

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

## Comandos

```bash
npm run dev        # desarrollo
npm run check      # lint + typecheck + build  ← antes de commitear
npm run build
npm run typecheck
```
