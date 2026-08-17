# PLAN FASE 3 — la BIBLIOTECA sobre el CMS

> **Abierto el 2026-08-09.** Las fases se llaman **F3-0…F3-5**; los `CMS-n`
> siguen siendo **IDs de DECISIÓN** y viven en `docs/ESQUEMA-CMS.md`. Este plan
> **consume** decisiones; no las toma — lo que una fase decida se escribe como
> acta en el ESQUEMA, en la misma tanda. Misma convención que `PLAN-FASE-2.md`,
> y por la misma razón: un `F3-n` no es una decisión.
>
> Cada fase trae: **qué entrega · qué decisiones del ESQUEMA la alimentan · su
> incógnita · su criterio de «hecho» con su medida.** Un criterio de «hecho» sin
> medida no es un criterio.

## Por qué esta fase existe, y en qué se diferencia de la FASE 2

La FASE 2 **movió** al CMS lo que ya estaba construido: 9 colecciones, 46 filas
de catálogo, 31 rutas. Terminó sin arbitrajes abiertos (`PLAN-FASE-2.md`
§ESTADO DE LA FASE 2).

> **La FASE 3 es AÑADIR, no cambiar.** Lo dijo la precondición 1 reformulada, y
> es lo que autoriza a construir sin re-migrar: todo lo que queda cayó en el
> cubo **B** (*añade lo suyo*) y el cubo **C** (*fuerza algo ya decidido*) quedó
> **vacío** el 2026-08-03.

Y trae una diferencia de método que no es cosmética:

> **Es la primera vez que el dato NACE en el CMS.** En la FASE 2 el dato existía
> en `apps/web/src/lib/*.ts` y el CMS lo recibió; aquí no hay contraparte
> transcrita — `articulos-kb` está en `FUERA_DE_BLOQUE_1` con esa razón exacta.
> El camino es **captura → seed por Local API → build → Δ0 contra el ORIGINAL**,
> y ese último eslabón es lo que hace que la migración pruebe algo: hasta hoy el
> CMS se comparaba contra el clon, no contra el sitio.

## ⚠ F3-0 · LA CAPTURA — EJECUTADA (2026-08-09)

**Va primero y se hace UNA vez**, por una razón que no es de orden sino de
irreversibilidad: el original es un sitio vivo, y la captura que no se hizo hoy
ya no se puede hacer igual mañana.

| | |
|---|---|
| **entrega** | **dos mitades**: `corpus/fase-3/` — 272 registros · 69.4 MB · 0 fallos — **y** `media-corpus/fase-3/` — 337 ficheros · 101.5 MB · 0 fallos. Cada una con índice propio |
| **alimenta** | §2f (CONSTRUIDO vs REFERENCIADO) · §2d.1 (los 13 del grupo D) · §2c + LH-2 (los 35) · CMS-0e (HTML crudo primero) |
| **incógnita** | ninguna abierta: la derivación tiene test en negativo 4/4 |
| **hecho** | ✅ `npm run cms:captura-f3` exit 0 con `evaluadas 107/107 páginas`, commiteada antes de transformar nada |

**El resultado que cambia el plan de esta fase**, y merece escribirse con estas
palabras:

> **EL ORIGINAL SALE DEL CAMINO CRÍTICO, DEFINITIVAMENTE.** Todo lo que la FASE
> 3 va a construir —los 6 artículos de KB, los 35 listados con sus 107 rutas de
> paginación, los 7 hubs, la cola larga, y las tres familias de archivo que
> ningún censo había mirado— **está congelado en bytes, con su sha256 y en git**.
> Ninguna fase posterior necesita pegarle al sitio vivo para construir. Lo único
> que sigue exigiéndolo es **medir el píxel** (el Δ0 contra el original), y eso
> es medición, no dependencia de datos.

> ⚠ **Y esa frase se pudo escribir sólo después de la SEGUNDA mitad, porque con
> la primera era falsa a medias.** El acta de la captura de HTML ya la decía, y
> al intentar sembrar salió que **0 de las 56 imágenes de `articulos-kb` estaban
> capturadas**: construir cualquiera de estos arquetipos seguía exigiendo el
> sitio vivo. **Capturar las páginas no es capturar sus assets** — la misma
> lección que `captura-media.mjs` había escrito para el corpus de F2-2, cobrada
> otra vez por no haberla aplicado a la vez. Lo que la destapó no fue releer el
> acta: fue **usar la captura para algo**.

Y lo que la campaña midió de paso, porque no se sabía:

- **el sitemap aporta CERO en exclusiva** — sus 370 URLs de `/es` ya eran
  alcanzables desde el corpus congelado. La captura de F2-2 era un
  superconjunto del sitemap y nadie lo había comprobado;
- **`/es/author/*` es una familia viva de 34 rutas** (29 sólo en `author/kunak`)
  con **0 URLs en el sitemap de `/es`**. No estaba en ningún censo;
- **`/es/categoria/*` (LH-SP8) son 4 términos + 2 formas acentuadas** que 301 a
  la forma sin tilde;
- **`/es/sector/*` está a medias**: 5 de 11 redirigen a `/es/sectores/*`;
- **142 = 35 + 107** en los listados: la paginación de LH-2 se reprodujo
  **exacta** nueve días después.

## F3-1 · `articulos-kb` — el primer arquetipo CMS-FIRST

| | |
|---|---|
| **entrega** | la colección poblada con sus **6 instancias**, la plantilla de página, la ruta emitida, y el Δ0 contra el original |
| **alimenta** | **§2d.1** (una colección nueva; `blurb`/`gallery` como **unión propia** que CONSUME las definiciones compartidas exportadas, no las duplica) · §2d (el cascarón `_tb_` es plantilla: sidebar y sticky en 13/13) · CMS-0e · §7e (la lista vacía vuelve `[]` salvo declaración) |
| **incógnita** | **qué campos piden los 3 artículos que `MODULOS_COMPARTIDOS` NO cubre.** El recon midió los *kinds* (`blurb` ×36/×18/×18, `gallery` ×2) pero **no sus campos**: eso lo mide la construcción sobre la captura |
| **hecho** | (a) `npm run check` verde; (b) las 6 rutas emitidas y en `qa:slugs` sin colisión; (c) **sonda comparadora de dos lados propia**, congelando, con negativo por invariante; (d) **Δ0 contra el ORIGINAL a 1440 y a 390** en sus ejes, con la **base en crudo medida una vez** (§Notas de método: un arquetipo nuevo mide su base sin corregir antes de fiarse de sus deltas de cuerpo) |

⚠ **Y el criterio (c) no es opcional ni heredable.** `CLAUDE.md` §UN ARQUETIPO
NUEVO NO HEREDA COBERTURA: si `mono-cmp` o los comparadores existentes corren
sobre este arquetipo sin modificarse, **se dice con la evidencia de haberlos
corrido**; si hay que tocarlos, **esa modificación ES el coste del arquetipo** y
se cuenta antes de hacerla, no después.

> ⚠⚠ **A ESTA TABLA LE FALTABA UNA FILA, y se vio al ir a cumplirla (2026-08-09,
> §2d.4): la PRECONDICIÓN de SPECS.** El criterio (d) pide **Δ0 contra el
> original**, y este arquetipo **no tiene fase de specs** —
> `docs/research/grupo-D/` tiene `RECON.md` y `DECISION.md`, y **ningún**
> `components/*.spec.md`—. Sin `getComputedStyle` por sección, la plantilla se
> inventa y el «Δ0» deja de medir fidelidad.
>
> **Un criterio de «hecho» no comprueba que exista lo que hace falta para
> cumplirlo** (§regla 10). El orden obligado de la tanda que lo retome:
> **specs → filas/columnas en el esquema → extractor+seed → plantilla → ruta →
> sonda de dos lados**.

> ✅ **PASO 1 DEL ORDEN OBLIGADO — HECHO (2026-08-10, tanda 44.ª).** El
> arquetipo tiene fase de specs: `docs/research/articulos-kb/MEDICION.md` +
> `components/{cascaron,cuerpo,modulos}.spec.md`, sobre `medidas/kb-spec-{1440,390}.json`
> y `kb-tests.json` (**1519 pares nodo × propiedad**).
>
> **Y el PASO 0 que la tabla tampoco tenía: DÓNDE se miden.** `qa:kb-css`, de dos
> lados: de las **19 hojas externas** que el HTML pide, la captura tiene **0**, y
> aun así renderiza —184 KB de CSS en línea— así que sale **plausible y
> equivocada** (55 de 210 anclas de estilo mal, `columna.width` **678.52 offline
> contra 430.80**). **Las specs necesitan el sitio vivo**, y eso deja la frase de
> F3-0 con su alcance: el original está fuera del camino crítico **para obtener
> datos**, no **para medir el píxel**. Ficha: `PENDIENTES-QA.md`
> §F3-1-CSS-NO-CAPTURADO.
>
> **Lo que las specs cambian del plan, y hay que leerlo antes de seguir:**
>
> 1. **el `cuerpo` necesita el nivel FILA con su `reparto`** — 45 filas (6
>    ocultas), cuatro repartos, y `fila.reparto` sale **CAMPO por test B**;
> 2. **un campo de ritmo de fila no es un número: es un número CON UNIDAD.** El
>    editor escribió px absolutos (`7·14·17·19·20·25·−2·−21`) **y** porcentajes
>    (`2·5·0.8·0.4 %`), y **a 1440 son el mismo número**. Los separa que el
>    default de Divi cambia de unidad al apilar (`2 %` → `30px` plano) y un % del
>    editor no;
> 3. **el extractor NO puede leer `style=`**: hay **0** estilos en línea en las 45
>    filas y los 149 módulos. Divi lo compiló a `et-core-unified`. La entrada del
>    extractor son **las medidas congeladas** `kb-spec-{1440,390}.json` (que son
>    la captura del estilo computado) más el HTML congelado para el verbatim;
> 4. **el default de `mb` es una función del tipo de columna**, no una constante
>    — `34.0469` en `4_4` y `25.0625` en columna estrecha, sin excepción en 72.
>
> Lo que **no** cambia: el escalón **no se disparó**. Las specs no destaparon
> ninguna forma que el ESQUEMA no pueda expresar — el nivel de fila y una unidad
> en el campo de ritmo caben en el vocabulario que ya hay, y **no contradicen
> ninguna decisión escrita** (§1.5b deja `MonoModulo` intacto y `articulos-kb` ya
> tiene unión propia).

> ✅ **PASOS 2 y 3 DEL ORDEN OBLIGADO — HECHOS (2026-08-10, tanda 45.ª).** Acta:
> `ESQUEMA-CMS.md` §2d.6.
>
> | paso | estado |
> |---|---|
> | (1) specs | ✅ 44.ª tanda |
> | **(2) filas/columnas en el esquema, con su migración** | ✅ 39 filas · 54 columnas · 143 módulos · 4 repartos. Dos migraciones |
> | **(3) extractor + seed** | ✅ `cms:extractor-kb` (+ negativo 6/6) · `cms:seed-kb` — 6 artículos, 56 imágenes, 0 peticiones al original |
> | (4) plantilla | ⛔ **no hecha** |
> | (5) ruta | ⛔ **no hecha** |
> | (6) sonda de dos lados + Δ0 + lector de `c-cmp` | ⛔ **no hecha** |
>
> **Y la corrección que el PASO 2 se llevó por delante, porque afecta a lo ya
> construido:** §2d.5 decía que el default de `mb` es *«función del tipo de
> columna»*. Medido contra un **segundo** arquetipo, manda **el ancho de la
> FILA**. En KB las dos lecturas dan el mismo número (todas sus filas miden
> 911.75); fuera de KB **no**, y la regla de la spec habría puesto `25.0625` en
> 35 módulos que miden `34.0469`. `mbPorDefecto()` es una tabla medida que
> **TIRA** ante un ancho de fila sin medir.
>
> ⚠ **La cobertura NO se mueve, y es por construcción:** las 6 rutas **no se
> emiten**, así que ninguna sonda de este repo puede verlas —todas leen HTML
> servido—. `COBERTURA-MEDICION.md` no gana ni la forma ni el lector de `c-cmp`
> hasta el PASO 5. Estado nuevo nombrado en `CENSO-ARQUETIPOS.md`: **POBLADO y no
> SERVIDO**.

#### El coste de cobertura, CONTADO ANTES de gastarlo (2026-08-09)

Derivado leyendo de dónde saca cada sonda su lista de rutas y cómo clasifica.
**Con el matiz que lo hace citable: es una derivación del CÓDIGO, no una corrida
—** las 6 rutas no se emiten todavía, así que ninguna sonda se ha podido correr
sobre ellas. Eso es lo que hay, y no se presenta como más.

| sonda | ¿corre sin tocarla? | evidencia |
|---|---|---|
| `clon-base` · `c-cabecera` · `enlaces` · `manifiesto` · `corte` · `slugs` | **SÍ** | derivan sus rutas del `prerender-manifest` y **no clasifican por forma**: una ruta nueva entra sola |
| `html-cmp` | **SÍ** | ídem, y compara HTML/chunks — agnóstica del arquetipo |
| **`c-cmp`** | **NO** | ver abajo |
| `mono-cmp` · `cmp-sector` · `d4-*` · `a-*` | **no aplican** | son de otros arquetipos, con sus anclas |

> ⚠ **Y `c-cmp` no es que «necesitara un ajuste»: tenía un FALLBACK que habría
> medido la página nueva con el lector equivocado y sin decir nada.**
> `formaDe()` era una cascada de `if` terminada en `return "A-blog"`, así que una
> ruta de un arquetipo desconocido **no daba error: daba «entrada de blog»**, y
> con él las anclas del blog. Y no lo caza el `Censo`: esos selectores **existen**
> en el DOM del clon, así que la salida habría sido **números plausibles sobre el
> elemento equivocado**.
>
> Es la regla 6 en un sitio nuevo — *un valor por defecto convierte «no lo sé» en
> «está bien»*—, y es peor que un selector muerto porque el muerto tiene guarda y
> esto no la tenía.
>
> **Arreglado antes de construir**, que es cuando valía la pena: la forma se
> deriva de la **familia del manifiesto** (`srcRoute`), toda familia emitida
> tiene que estar declarada, y una que no lo esté **TIRA con el aviso escrito
> para la tanda que lo reciba**. La prueba de que no cableó nada es que **no
> movió nada**: el mismo reparto de 31 rutas en 10 formas, **0 desconocidas**.

**Conclusión, sin redondear:** el coste de cobertura de este arquetipo es **una
forma + su LECTOR en `c-cmp`**, y aparece como rojo explícito el día que las 6
rutas se emitan. Lo demás lo hereda gratis porque las sondas derivan del build.

## F3-2 · listados y hubs — LISTADO-B y sus hermanos

> ⛔⛔ **SEGUNDA PARADA DE ALCANCE (2026-08-14, 70.ª tanda) — y la ordenó el
> ESCALÓN 1 del encargo, con su condición cumplida al pie de la letra.** El PASO 1
> pedía derivar qué rutas compara `qa:lh-cmp` de verdad y cruzarlo contra
> §F3-2-UNIDAD-SERIE, con el escalón *«si `lh-cmp` toma el atajo que `lh-serie`
> rechaza, para antes de construir»*. **Lo toma.** Así que `L3` y `L5` **no se
> construyen**, y el corte es el limpio que el encargo declara: *alcance
> declarado, nada construido*.
>
> **El alcance, derivado** (`qa:lh-alcance` §`alcanceReal`, congelado a los dos
> anchos, idéntico en los dos):
>
> | en la unidad que `lh-serie` estableció — la PÁGINA | n |
> |---|---|
> | páginas del original | **149** (84 con contenido) |
> | las que `lh-cmp` compara | **13**, y **las 13 son la página 1** |
> | `intermedia` · `última` comparadas | **0** · **0**, de **86** y **28** |
> | clases de `lh-serie` tocadas | **11 de 38** → **27 ciegas = 122 páginas** |
>
> `lh-serie` contestó esta pregunta con veredicto literal **«LA SERIE NO ES UNA
> UNIDAD»** y su negativo sale rojo ante el atajo de *«una por serie»*. `lh-cmp`
> lo toma **y ni siquiera entero**: la página 1 de **13 de las 35** series. Hasta
> hoy vivía como una línea **sin número** en el `noMide` de `lh-alcance` mientras
> el cierre se leía como *«LISTADO-B verificado»*. Ficha con el coste de
> ensanchar (**71 páginas**, ×6.5, y exige medir el ORIGINAL en las `/page/N`,
> que hoy **no están en el espejo**): `PENDIENTES-QA.md`
> §F3-LH-ALCANCE-PAGINA-1.
>
> ⚠ **Y CORRIGE el mecanismo que la 69.ª escribió para el verde de la piel B.**
> Cruzadas las 43 instancias **por ruta** y no por cardinal: **3** en el universo
> del espejo, **1 realmente comparada** (las otras dos son `L2`, AUSENTE) y
> **0 SEPARADORAS**. O sea que el verde no vino de *«sólo mira páginas 1»* — vino
> de que su dominio efectivo **no distinguía los dos modelos**. Con predicción:
> `/glosario` es página 1 con `total = 8` y **sí separa**, así que construir `L2`
> le da su primera separadora sin ensanchar nada.
>
> **`CMS-ORDEN-L2` queda ESCRITA como decisión y no decidida** (§7e), con sus dos
> preguntas y sus 3 + 4 salidas descritas por *lo que son*. Y al nombrar los
> canales que quedaban —lo que §regla del cero exige— apareció **uno con dato que
> nadie miró**: `/preguntas-frecuentes` **sí sirve fecha** (`article:modified_time`,
> **19/19**) y lo que no tiene es un canal **que ORDENE**. El control se cobra dos
> veces: en `/glosario`, `dateModified` **tampoco ordena** con 37/37.
>
> **Los TRES números NO se mueven** — pares **COMPARADOS** 10 707 / 10 714 ·
> **MIXTOS** 1 840 / 1 847 · **AUSENTES** 5 999 / 6 005 —, el criterio sigue en
> **13 formas · 6 AUSENTES · 7 comparadas**, y la **cobertura es IDÉNTICA**
> (`base` 38 · `árbol` 38 · `comportamiento` 37 · `docH` 31 · `enlaces` 31 ·
> `anchos` 22 · `filas` 13 · `módulos` 9 sobre **363**), re-derivada y comprobada.
> **Cero formas construidas**, dicho sin rodeos. El objetivo sigue siendo
> **13 · 1 · 12**.
>
> **Los dos bloqueos de siembra, adjudicados en vez de sólo nombrados:**
> §F3-LH-EXTRACTOR-T10-SIN-CABLEAR **sigue fichada y NO entra** (es una
> RE-EMISIÓN de 169 cuerpos: exige línea base antes/después y un `build`, que no
> cabe en una tanda con sondas midiendo), y §F3-LH-ARTICLE-ETIQUETA-44 queda
> adjudicada **a T9 y no a la whitelist** —es DOM ajeno, no estructura— con su
> denominador (**1 de 3** nuevos, **0 de 209** sembrados).
>
> **Verificación:** `qa:lh-alcance` 13/13 a 1440 y 390 **cruzando al par** con
> `lh-cmp` · negativos `lh-alcance` **3/3** y `lh-huecos` **4/4** · `qa:lib`
> **167** sondas · **93/93** · `qa:manifiesto` **363 rutas · 17 familias · 0
> vacías** · `qa:cobertura` idéntica · `npm run check` **exit 0**.

> ⛔ **PARADA DE ALCANCE (2026-08-14, 69.ª tanda) — y la ordenó el propio
> encargo.** Pedía aplicar §*UNA REGLA INCOMPLETA SE LEE IGUAL QUE UNA COMPLETA*
> a las specs de `L2`·`L3`·`L5` **antes** de construir sobre ellas, con el
> escalón *«si aparece un hueco que decide la construcción, para y mídelo»*.
> **Disparó cinco veces en la primera forma.**
>
> **Los cinco, con su canal y su denominador** (`npm run qa:lh-huecos`, nueva,
> negativo **4/4**, `medidas/lh-huecos.json`):
>
> | # | la spec dice | el canal dice |
> |---|---|---|
> | 1 | `lh-barra`: `L2` **`conBarra` 0 de 12** | `L2` **SÍ** tiene barra, **12 de 12** — la del **TEMA** (`et_right_sidebar` + `#sidebar`, 3 widgets); la partición Divi que aquella medida buscaba da **0 de 12** en el cuerpo. Las dos son ciertas |
> | 2 | §1 da `ancla 283` y `cabecera 225`, sin nombrar la diferencia | **58 px, iguales a los dos anchos** |
> | 3 | §3 lista las piezas de la piel B, no su **ventana** | **ventana de 5** con `« First` · `...` · `Last »` |
> | 4 | nada trata **qué ordena** | `/glosario` = `datePublished` DESC **37/37**; `/preguntas-frecuentes` **sin canal en los 4 mirados** ⚠ *la 70.ª miró 6 y encontró uno con dato: `article:modified_time` 19/19, que **no ordena***  |
> | 5 | ninguna nombra la **banda de filtros** | `L3` **3** botones · `L5` **12**, entre el `h1` y el listado |
>
> **Los cinco tienen la misma forma: el número ESTABA en la medida congelada y
> el elemento NO estaba en la prosa.** Los 3 y 5 se pagan en píxeles —la banda
> de filtros vale **162.8** en `L3` y **264.6** en `L5`—, y el **4 es el que
> para**: los dos tipos del clon no tienen campo de fecha y el precedente
> (`entradas-blog.fechaPublicacion`) **no se aplica tal cual** —otro canal, otro
> contenido—. Eso es decisión de ESQUEMA: **`CMS-ORDEN-L2`**, §7e.
>
> **Y un DEFECTO en trabajo ya dado por verificado, con su número:** la `PielB`
> emitía `current` + `n+1..total`, o sea **cero `page smaller`** y sin ventana.
> Contra las **43** instancias capturadas y comparando **la secuencia entera**:
> el componente **nuevo 38/38**, el **viejo 7/38** — y **los 7 buenos son
> exactamente páginas 1** ⚠ *(«las únicas que el comparador mira» decía aquí, y
> es FALSO: la 70.ª cruzó por ruta y el comparador comparó **UNA**, con **0
> separadoras** — arriba)*. Segunda vez en dos
> tandas (la 68.ª lo encontró igual en la piel A). Arreglado; **NO-OP sobre todo
> lo comparado**, mueve el contenido de 23 rutas que nada mide.
>
> **De camino, una pregunta abierta que CIERRA** porque la forma nueva trae el
> denominador: `TOPE = 269` del extracto derivado estaba *«ajustado, no medido»*
> con n=6. Barrido 250–300 contra las **37** tarjetas de `/glosario`: **269
> acierta 37/37 y es el ÚNICO tope del rango que lo consigue.**
>
> **Los TRES números NO se mueven, y se dicen igual:** pares **COMPARADOS**
> 10 707 / 10 714 · **MIXTOS** 1 840 / 1 847 · **AUSENTES** 5 999 / 6 005. El
> criterio sigue en **13 formas · 6 AUSENTES · 7 comparadas**. **Cero formas
> construidas en esta tanda**, dicho sin rodeos.
>
> ⚠ **Y una corrección al encargo, derivada:** de las **6** AUSENTES, una es
> **`L4-listado-embebido::/es/recursos/`**, que es **F3-3** (hub) y no F3-2. Las
> de F3-2 son **5**: `L2` ×2 · `L3` ×2 · `L5` ×1. El objetivo alcanzable de una
> tanda de construcción es **13 · 1 · 12**, no `13 · 0 · 13`.
>
> **Cobertura: IDÉNTICA** (`base` 38 · `árbol` 38 · `comportamiento` 37 · `docH`
> 31 · `enlaces` 31 · `anchos` 22 · `filas` 13 · `módulos` 9, sobre 363), y es
> **por construcción**: esta tanda no emitió ruta ni comparó geometría nueva.
> Escrito después de re-derivarla.
>
> **De la captura:** los **3 documentos** de §F3-LH-TERCER-DOCUMENTO están
> **CAPTURADOS** (corpus 309 → 312, 0 fallos) con la lista **derivada de las 807
> tarjetas** de los 149 listados congelados — misma respuesta que la ficha había
> sacado por otra vía. La siembra queda con **dos bloqueos nombrados**:
> §F3-LH-EXTRACTOR-T10-SIN-CABLEAR y §F3-LH-ARTICLE-ETIQUETA-44.

> ✅✅ **`LISTADO-B` COMPLETO — las TRES variantes de `L1` construidas Y
> VERIFICADAS (2026-08-14, 68.ª tanda).**
>
> ⚠ **Y «completo» se declara con su alcance, que es lo que la frase absorbe si
> no se dice:** completo **para las tres variantes de `L1`**, NO para F3-2, que
> sigue debiendo **L2 · L3 · L5** (6 formas), las **55 rutas vacías** de `D2.5` y
> la decisión de alcance del CASCARÓN.
>
> **El cierre con sus TRES números:**
>
> | | |
> |---|---|
> | pares **COMPARADOS** | **10 707** @1440 · **10 714** @390, en **7 formas** |
> | pares **MIXTOS** no verificables | **1 840** / **1 847** — sin referencia limpia |
> | pares **AUSENTES** por variante no construida | **5 999** / **6 005** — las 6 formas de L2·L3·L4·L5 |
>
> El criterio estaba en `13 formas · 10 AUSENTES · 3 comparadas` y queda en
> **13 · 6 · 7**. **Residuos 699 / 695, en 0 clases sin nombrar**, y las 3 formas
> de la 66.ª siguen en **232 / 231** — su línea base exacta, o sea **cero
> regresión**. **Base Δ0 en las 7 formas y a los dos anchos** (`P-LH-C8`).
>
> **Rutas 345 → 363** (+18: 10 índices de término + 8 de paginación). Las **19**
> que el servidor del original sirve vacías caen en §F3-LH-VACIAS-NO-EMITIDAS,
> por la misma razón que las 55 de `D2.5`.
>
> **Cobertura: la matriz sube en 5 ejes con el denominador subiendo a la vez** —
> `base` 34→**38** · `árbol` 34→**38** · `anchos` 18→**22** · `filas` 9→**13** ·
> `módulos` 5→**9**, sobre 363.
>
> ⚠⚠ **Y el ESCALÓN 1 del encargo disparó con una respuesta que no era ninguna
> de las dos previstas.** `lh-barra.json` acertó en **todo lo que midió** —la
> fila es `4_4`, no hay barra, la columna mide 1238.39— y el componente estaba
> **mal** igual: `resources` tiene **3 filas** donde las otras dos tienen 2, su
> listado va en la fila **3** y cuelga de **un módulo de texto vacío**. El error
> no fue de medición sino **de ALCANCE al leerla**, y la regla que deja es:
> *una regla INCOMPLETA se lee exactamente igual que una completa*. Ficha:
> §F3-LH-ESCALON-4-4.
>
> **Cuatro defectos que sólo esta variante podía enseñar**, los cuatro
> arreglados: el `margin-top` de dos filas · el `pb 0` del módulo del `h1` · el
> `padding-bottom` del titular de tarjeta (la cascada, cobrada por 2.ª vez) y
> **el formato de fecha, que era INGLÉS y es ESPAÑOL** —8 de 12 meses no podían
> separarlo, y arreglarlo toca también a `/etiqueta`, que estaba verificada—.
>
> **Instrumentos:** `qa:lh-cmp --vivo` estrenado como referencia (antes iba
> contra el espejo congelado) · `cms:seed-listados-neg` **nuevo, 5/5** (el
> fichero declaraba sus sabotajes desde el primer día y **nadie los corría**) ·
> `cms:extractor-listados-neg` 3/3 → **4/4** · y `qa:cobertura` corregida: **no
> veía ninguna corrida `--vivo`**.

> ⛔ **PARADA DE ESCALÓN (2026-08-12, 56.ª tanda) — el 4.º, y es de POBLACIÓN.**
> Los tres escalones anteriores cerraron y `D2.6` cerró la última ficha del
> camino, así que la tanda entró a construir `LISTADO-B` con el contrato de
> *«entero o nada»*. **Al dimensionarlo salió que el corte limpio está antes de
> empezarlo:**
>
> **Un listado no tiene contenido propio: es una CONSULTA.** Las `142` rutas,
> las `55` vacías y las `21` series que paginan salen **del original**; el clon
> consulta **su** DB, que tiene **7 entradas de blog contra 149**, 4 casos contra
> 57, 3 términos contra 37, 4 documentos contra 23 y 2 faqs contra 19. **19 de
> las 29 series con listado se quedan cortas** y el clon podría emitir **35 de
> 142** — con la columna del clon calculada como **cota superior**.
>
> **Y no es una tarea de datos que se haga después:** `P-LH-C3` (*«las rutas
> emitidas coinciden con una corrida del día»*), `P-LH-C7` (*«las 55 vacías
> cumplen su contrato»*) y la comparación **par a par** presuponen las tres la
> población del original. Con 7 entradas el clon no llega a tener **una sola**
> ruta vacía, y cada Δ del comparador vendría del contenido, no de la plantilla.
>
> Sonda: **`npm run qa:lh-poblacion`** (sin red; cruza `lh-serie` con la
> `lh-paginas` del día y la DB por Local API), negativo **3/3** —el que importa
> es `completa`: con la población del original **sale verde**, así que el rojo
> mide el clon y no el código—. Tres salidas (sembrar el corpus · re-derivar los
> criterios · entregar con el hueco declarado) en `PENDIENTES-QA.md` §ESCALÓN
> F3-2 (4.º) · POBLACIÓN. **Lo que ninguna puede ser es implícita.**

> ✅ **EL 4.º ESCALÓN CIERRA PARA `/blog` Y `/etiqueta/*`, Y SIGUE ABIERTO PARA
> `/recursos/*` (2026-08-13, 64.ª tanda).** `qa:lh-poblacion` sale **verde en las
> 29 series** (149 entradas · 57 casos · 37 términos · 23 documentos · 19 faqs) y
> `qa:lh-paginas` re-derivada ese día confirma las **142 rutas**, idéntica a la
> congelada ⇒ **`P-LH-C3` cumplida**.
>
> ⚠ **Pero el verde de `lh-poblacion` no cubre `/recursos/*`, y la razón es que
> su cota superior lo tapa** (§F3-LH-TAXONOMIA-RECURSOS). Derivado contra la DB:
> `categorias-recursos` tiene **8 de 10** términos —faltan `articulos` y
> `seminarios-web`—, **`padre` a null en los 8**, y **0** entradas en
> `seminarios-web` contra 3 del original. Las 4 formas `L1-resources` del
> comparador **no son construibles** hasta que eso se pueble.
>
> **Lo que esta tanda deja resuelto y no lo estaba:**
>
> | | |
> |---|---|
> | **`LH-SP10`** | ✅ **CONTESTADA — son DOS mecanismos** (`qa:lh-extracto`, negativo 4/4). `/blog` usa el extracto **manual** donde existe (15 de 63 medidos, 86–102 c) y el automático si no; `/etiqueta` **ignora el manual** y trunca el contenido a 256–271 c + «...». ⇒ el de `/blog` es **campo**, el de `/etiqueta` es **derivado** |
> | **`LH-SP3`** (qué ordena) | ✅ **fecha descendente**, verificado: las 149 fechas verbatim parsean 149/149 y las posiciones 0 y 1 de `/blog` y de `/etiqueta/calidad-del-aire` reproducen el original |
> | el discriminador de `/blog` | ✅ **derivado y exacto**: 149 − 81 con `recurso` = **68**, que es lo que lista el original. El campo `recurso` decide **miga y listado a la vez** |
> | la **deriva** corpus↔espejo | ⚠ **nueva, y es de método** — §F3-LH-DOS-FOTOS. **2 de 9** titulares congelados cambiaron entre F3-0 y el espejo del 2026-08-11 |
>
> **Y el hueco de dato que queda antes de construir**, dicho con su número:
> `extracto` está a **null en las 149** entradas ⇒ la variante `/blog` necesita
> una pasada de extractor sobre el corpus; la de `/etiqueta` **no**, porque su
> extracto se deriva del cuerpo. `etiquetas.descripcion` **no existe** y las 2
> instancias medidas lo traen (módulo `et_pb_text_4_tb_body`, 941.17 de ancho a
> 1440) ⇒ es **campo**, y es el único que `L1-etiqueta` necesita añadir.
>
> **Estado de la entrega, en la unidad del comparador (13 formas):** siguen
> **13 AUSENTES · 0 pares**. Esta tanda no emitió ruta ninguna — lo que hizo fue
> **quitarle a `L1-etiqueta` sus dos incógnitas de dato** (orden y extracto) y
> dejar `L1-resources` fichado con lo que le falta. Es menos de lo que el encargo
> pedía y está dicho con su número.

> ✅ **`L1-blog` Y `L1-etiqueta` ESTÁN CONSTRUIDAS **Y VERIFICADAS** (2026-08-13,
> 66.ª tanda). `LISTADO-B` queda en **2 de sus 3 variantes**.**
>
> **El cierre con sus TRES números, que es como hay que leerlo:**
>
> | | |
> |---|---|
> | pares **COMPARADOS** | **5 445** @1440 · **5 448** @390, en **3 formas** |
> | pares **MIXTOS** no verificables | **915** / **918** — sin referencia limpia (§ESCALÓN eje mixto) |
> | pares **AUSENTES** por variante no construida | **11 261** — las 10 formas que no se construyen |
>
> El criterio estaba en su rojo —*13 formas · 13 AUSENTES · 0 pares*— y queda en
> **13 formas · 10 AUSENTES · 3 comparadas**. Los 5 445 coinciden **al par** con
> lo que `qa:lh-alcance` predijo ANTES de construir, que es el cruce entre dos
> instrumentos que este proyecto no siempre tiene.
>
> **Residuos: de 528 en la 1.ª pasada a 232 @1440 y 231 @390, con 0 SIN
> CLASIFICAR** — las que quedan caen enteras en 9 clases nombradas, la mayor de
> ellas el **CASCARÓN** (144), que es la divergencia que `c-cmp` ya midió en las
> 31 rutas y **no es de esta tanda**. Tabla completa: `PENDIENTES-QA.md`
> §F3-LH-CIERRE-66.
>
> **Base: Δ0 en las tres formas y a los dos anchos**, con `P-LH-C8` verificando
> que es EL MISMO ELEMENTO. `P-LH-C8` queda **cumplida entera** — su segunda
> mitad no se podía pagar hasta que el clon emitiera estas rutas.
>
> **Cobertura: la matriz SUBE en 5 ejes con el denominador subiendo a la vez**
> (302 → 345 rutas): `base` 31→34 · `árbol` 31→34 · `anchos` 15→18 · **`filas`
> 6→9** · **`módulos` 2→5**. `docH` y `enlaces` **no** suben, y es deliberado:
> `lh-cmp` no compara `docH` y su `href` va contra el corpus, que es otra
> pregunta. Las **42** rutas `/page/N` entran en `·`: emitidas y sin comparar.
>
> ⚠ **Y lo que NO se entrega, con su número:** el clon emite **43** rutas de
> listado y el original sirve **142**. Las **55 vacías** de `D2.5` no están
> emitidas porque su frontera la decide el servidor de WordPress y **no se
> deriva del contenido del clon** — ficha con sus dos salidas en
> §F3-LH-VACIAS-NO-EMITIDAS.
>
> **Instrumentos nuevos:** `qa:lh-alcance` (+ negativo 3/3) y `scripts/qa/lh-ejes.mjs`
> —el clasificador de ejes extraído para que haya **una sola definición**—. Y
> `qa:lh-cmp-neg` pasa de 3/4 declarados a **4/4**: `base-distinta` era
> ejercitable en cuanto el clon sirviera algo, y la propia sonda lo pedía.

> ✅ **EL DATO DE `L1-blog` Y `L1-etiqueta` ESTÁ COMPLETO (2026-08-13, 65.ª
> tanda). `L1-resources` PARA con un escalón medido.** Los dos instrumentos que
> había que arreglar antes de construir están arreglados, y los dos cambiaron lo
> que se puede afirmar:
>
> | paso | qué quedó |
> |---|---|
> | **la referencia por EJE** | `lh-cmp` declara, por par, contra qué lado mide: `contenido` → el **corpus** del que se sembró el clon · `plantilla` → el **original** · `mixta` → **sin referencia limpia**. Censo del universo: **contenido 523 · plantilla 13 147 · MIXTOS 3 036** de 16 706 |
> | **la cota de `lh-poblacion`** | estrechada: una serie de término se cuenta **por su término**, no por su colección al bulto. De **0 series cortas a 3** |
> | **`etiquetas.descripcion`** | ✅ campo nuevo, rico y opcional, con migración, extracción y siembra **12/12** (§2c.2 del ESQUEMA) |
> | **`extracto`** | ✅ sembrado **66 de 68**. LH-SP10 aterrizada: **campo** en `/blog`, **derivado** en `/etiqueta` |
> | **la jerarquía de `resources`** | ✅ **CERRADA el 2026-08-14 con `D2.8`** — el original **SÍ** la tiene, y la 67.ª tanda midió su FORMA: profundidad **2**, **1** padre, **0** con dos padres, **0** tercer nivel, **1 de 5** taxonomías jerárquica. Se decide **modelar la jerarquía**: `padre` poblado y la ruta compuesta en la plantilla, **cero campos nuevos** |
>
> **Lo que el escalón deja fuera, con su número: las 4 formas `L1-resources`.**
> No falta extraer: faltan **dos términos que no existen como filas** y, con
> ellos, **una decisión que nadie ha escrito** — qué es el archivo del padre. Las
> dos lecturas dan las mismas 80 tarjetas hoy, así que **el dato no las separa**.
>
> > ✅ **CORREGIDO el 2026-08-14 (67.ª tanda, `D2.8`): el dato SÍ las separa —
> > en otro canal.** La frase es cierta del canal de las **tarjetas** y falsa del
> > documento: `/es/recursos/articulos/` sirve `<body class="archive tax-resources
> > term-articulos term-379">` y sus tres hermanos bajo `/recursos/` sirven
> > `page-child`. Es un **archivo de término**, y el original lo dice con su
> > contraste en el mismo directorio. La lección de método —*antes de declarar
> > que un discriminador no existe, di qué canales miraste*— va al ESQUEMA §2c.3.
>
> **Y dos hallazgos que sólo aparecen al intentar sembrar:**
>
> 1. **el recuento casa y el conjunto no** (§F3-LH-DOS-CONJUNTOS-DE-149):
>    `/blog 68 → 68` es exacto y **los dos conjuntos difieren en 2 por lado**. Un
>    cardinal es un contenedor y absorbe la membresía; hacían falta los slugs;
> 2. **2 documentos que el listado nombra no están capturados** — ni en
>    `corpus/entradas-blog` ni en la DB. Es hueco de **captura**, no de seed, y su
>    efecto en el comparador ya está fichado para que no se persiga.
>
> **Cobertura: 302 rutas, matriz IDÉNTICA a la del día.** No se movió porque no
> entró ninguna ruta de listado — ése es el dato, no una conclusión escrita de
> antemano.

> ✅ **EL 1.er ESCALÓN ESTÁ CERRADO (2026-08-11, tarde): `D2.5` · REPLICAR TAL
> CUAL**, firmada por el propietario. El clon emite las **55 rutas vacías** con
> 200, como el original — la única de las tres salidas que **no cambia el
> sitio**; `noindex` y 404 son decisiones de producto y se llevan aparte
> (`PENDIENTES-QA.md` §F3-2-SEO-PAGINAS-VACIAS). Con eso la entrega deja de ser
> un rango: **142 rutas** (35 índices + 107 de paginación), derivadas de la
> decisión y re-medidas en vivo ese día. `D2.4` no se reabre: **el canonical
> separa las dos formas, 7/7 y 55/55**.
>
> ✅ **EL 2.º ESCALÓN TAMBIÉN ESTÁ CERRADO (2026-08-11), y sin retirar ninguna
> decisión de modelo.** `L1` tiene **dos retículas de cuerpo**: `3_4 + 1_4` con
> **barra lateral de 4 widgets** en blog y etiqueta (**80 de 80**), `4_4` sin
> barra en resources (**0 de 37**). Eso **acota `D1`** —la variante incluye la
> retícula y su barra, no sólo la tarjeta— y **confirma `D3`**: el widget
> «Categorías» **NO consume la taxonomía** (es `widget_text` en 80/80, un solo
> contenido, y no cubre 5 de los 7 términos vivos). Actas:
> `listados-hubs/DECISIONES.md` §*D1 queda ACOTADA* · `ESQUEMA-CMS.md` §2c.0.
> Congeladas: `medidas/lh-barra.json` (+5 negativos) ·
> `medidas/lh-spec-{1440,390}.json`.
>
> ✅ **EL 3.er ESCALÓN TAMBIÉN CIERRA (2026-08-11, tanda de decisión): `D4` se
> parte en `D4a` y `D4b`.** `D4` afirmaba *«los 35 `h1` = nombre del término»* y
> eran **33 de 35** — pero la lectura correcta no era corregir la cifra: **el
> denominador estaba MAL FORMADO**. Las 35 rutas se agrupaban por el campo
> `grupo` de `lh-censo` (`hub` · `post_tag` · …), y **`hub` junta SIETE familias
> de arquetipo**, ninguna de ellas mixta. Las «2 excepciones» eran **dos familias
> enteras**, 12 de 12 documentos.
>
> · **`D4a`** — el TEXTO: **89 documentos** de archivo de término lo sacan del
> **NOMBRE** del término (no de su slug: lo separan 4 casos), y **48** de índice
> lo llevan como **campo propio de la página**. Dos enunciados, dos
> denominadores.
> · **`D4b`** — la PRESENCIA: **12 sin `<h1>`** (`L2` entera), **0 con `<h1>`
> vacío**, **0 familias mixtas** de 9 ⇒ **plantilla de la familia**.
> · **`D4b.1`** — el ANCLA de `L2` es **la primera tarjeta**, y existe **12/12**.
> ⚠ **MEDIA verificación**: falta *«el mismo elemento en los dos lados»*, que no
> se puede comprobar hasta que el clon emita estas rutas ⇒ **`P-LH-C8`**.
>
> Congeladas: `medidas/lh-h1.json` (+5 negativos) · `medidas/lh-ancla.json` (+3).
>
> ✅ **Y las dos fichas de contenedor CIERRAN las dos** (`medidas/lh-contenedores.json`,
> `medidas/lh-rol.json`): **§LH-CONTENEDOR-ROL** — `mbPorDefecto` **exige el rol**
> (`"fila" | "columna"`) y una columna **tira**, ejercitado en `qa:lh-rol` (7
> casos, negativo 1/1); el cambio es **NO-OP** sobre `articulos-kb`, comprobado
> corriendo el extractor antes y después. **§LH-CONTENEDOR-L3** — la pregunta **no
> aplica: `L3` no usa `mbPorDefecto`**, porque su listado va por `loop-del-tema` y
> de su fila de 1152 **no cuelga ni un módulo de cuerpo**. Con eso
> `qa:lh-contenedores` **se pone verde**.
>
> ✅ **Y la precondición de abajo queda LEVANTADA DEL TODO (2026-08-11):** la fase
> de specs existe y **las CINCO están escritas** — `listado-b` · `listado-tema-cpt`
> · `listado-tema-tax` · `hub-builder` · `indice-casos`, con su
> `components/README.md`. Las cuatro últimas se redactaron **desde lo congelado**,
> sin volver a pegarle al original.
>
> ⚠ **Y cruzarlas destapó CUATRO medidas del CASCARÓN sin explicar**, que la
> construcción tiene que llevar delante: `L5` sirve **4 secciones de pie** (las
> otras 4 formas, 3); su cabecera mide **458.09** contra 225; hay **tres pieles
> de `h1`** (`L1` 50/60·800 · `L3`+`L5` 44/44·300 · `L4` 44.1/55.125·300, y `L3`
> **no baja de 44 a 390**); y `L5` es **la única cuya base SUBE al estrechar**.
> Fichadas en su spec (`SP-K5` · `SP-T7` · `SP-H6`). **Dar el cascarón por común
> las mete todas.**
>
> ⬇ **(histórico) PARADA DE ESCALÓN (2026-08-11, mañana)**, levantada en el PASO 2 y antes de
> construir nada: la entrega «107 rutas `/page/N/`» está mal contada, y no por
> poco.** El original sirve **55 páginas que responden 200, se declaran
> canónicas de sí mismas y no listan ni una entrada** (`/es/blog/page/9/`…`17/`,
> con el `<title>` de Yoast diciendo «Página 9 de 17»). Frente a **54** con
> contenido. Verificado **en vivo**: 51 fronteras, **0 discrepancias** con la
> captura. `D2.3` y `D2.4` **no contemplan esta forma** y dan respuestas
> distintas para ella, así que la decisión —replicar el 200-vacío o divergir— va
> con su razón escrita **antes** de emitir rutas. Evidencia y desarrollo:
> `PENDIENTES-QA.md` §ESCALÓN F3-2. Congeladas: `medidas/lh-serie{,-vivo}.json`.
>
> ✅ **Y lo que el mismo PASO 2 sí deja cerrado: la UNIDAD.** Cada `/page/N/` es
> su propia unidad de cobertura — **19 de 28 series son heterogéneas** y hay
> **38 clases estructurales** en la población, medidas sobre las 149 páginas
> capturadas (no sobre una muestra). «Una por serie» es el atajo que dejó
> MONOGRÁFICO a cero, y aquí sale **rojo por construcción** en el negativo de
> `qa:lh-serie`.
>
> > ⚠ **Eran 35 hasta el 2026-08-11 y son 38**, y no porque el sitio cambiara:
> > la firma `sb` de `lh-serie` casaba `et_pb_widget_area` **en el documento
> > entero** —pie incluido— y daba `·sb` en las 149, o sea que **no
> > discriminaba**. Con el discriminador bueno (80/149) **parte tres clases que
> > estaban unidas**. La congelada anterior venía además **obsoleta respecto a su
> > propio código**. Detalle y tabla ANTES/DESPUÉS: `PENDIENTES-QA.md`
> > §LH-SERIE-HIGIENE.
>
> ⚠ **Precondición que esta parada deja a la vista, y que no es del escalón:**
> `docs/research/listados-hubs/` tiene `PAGE_TOPOLOGY` · `DECISIONES` · `MODELO`
> · `BEHAVIORS` y **ningún `components/*.spec.md`** — derivado, no recordado. O
> sea que F3-2 entra en construcción **sin fase de specs**, que es justamente lo
> que `COBERTURA-MEDICION.md` dejó escrito para `articulos-kb`: *«un lector son
> ANCLAS, y las anclas salen de su fase de specs; escribirlas hoy sería
> inventarlas»*. Construir antes de medir las secciones repetiría ese error con
> otro arquetipo.

| | |
|---|---|
| **entrega** | L1 (LISTADO-B, 3 variantes de tarjeta · 23 instancias) · L2 (2) · L3 (3) · L5 (`casos-de-exito`), **y las 107 rutas `/page/N/` derivadas en build** |
| **alimenta** | **§2c + `listados-hubs/DECISIONES.md`** (D1 los arquetipos · D2 la paginación · D3 lo que le exigen al grupo A · D4 campo vs plantilla) · §4b (paginación) · §2g (el teaser es dato propio de cada content type) |
| **incógnita** | **LH-SP3** (qué ordena cada listado, y si sortea como P4 — condiciona el QA px a px) · **LH-SP9** (entradas/página de L3) · **LH-SP10** (extracto manual vs derivado) |
| **hecho** | los **6 pre-registros de LH-2** (`P-LH-C1…C6`) verificados uno a uno, cada uno con su sonda |

> ⚠ **`P-LH-C6` es una PRECONDICIÓN, no un criterio de cierre**: la pasada de
> comportamiento (hover · si la paginación navega por enlace o por AJAX · lazy
> de las imágenes de tarjeta · el orden entre dos cargas) va **ANTES** de
> construir. Es también el primer mordisco al eje `comportamiento`, que sigue
> **0/31** en `COBERTURA-MEDICION.md` y es el hueco mayor del proyecto.

> ✅ **`P-LH-C6` CUMPLIDA (2026-08-10). F3-2 queda DESBLOQUEADA.** Sonda nueva
> `npm run qa:comportamiento` (negativo 5/5), **254/254 interacciones con disparo
> confirmado**, congelada en `medidas/comportamiento-1440.json`. Acta:
> `docs/research/listados-hubs/BEHAVIORS.md`. El eje pasa de **0/31 a 13/37**.
>
> **Lo que la construcción de F3-2 se lleva ya contestado:**
>
> | pregunta | respuesta |
> |---|---|
> | ¿la paginación es AJAX? | **no: enlace real**, `defaultPrevented:false` en las 5 formas con control ⇒ `D2.3` (derivar `/page/N/` en build) es viable sin punto de entrada de datos |
> | ¿hay que congelar contenido para el QA px a px? | **no por sorteo**: 1 solo orden en 10 cargas en blog · etiqueta · casos, **cota < 30 %** |
> | ¿hace falta maquinaria de carga diferida? | **no** para ser fiel: `sinCargarAntes = 0` en las 9 formas. El atributo `loading="lazy"` es markup y sólo aparece en L4 (3 de 3) |
> | ¿qué hace el hover? | `scale(1.1)` **exacto** sobre la media en L1-resources · L4 · L5; `#f7f7f7 → #f0f0f0` en L3; **nada** en L2 |
> | ¿cuántas pieles de paginación? | **tres**, alineadas 1:1 con las tres variantes de tarjeta de `D1` — y la piel B **imprime el total de páginas** en `span.pages` |
>
> ⚠ **Y TRES cosas que F3-2 tiene que resolver ANTES de construir, con su ficha
> y su número** (`PENDIENTES-QA.md`):
>
> 1. **§LH-C6-FILTRO-L5** — `casos-de-exito` tiene **12 botones de filtro de
>    cliente por sector** (57 → 3 tarjetas, sin recargar). `D1` dijo *«cero
>    campos nuevos»* y `D3` dejó la relación `sector` fuera *«hasta que un
>    listado la consuma»*: **la consume**. Va a la mesa de **F3-4** (la taxonomía
>    `sector` es una de sus tres familias sin censar) — modelarla desde este
>    único consumidor sería decidir con n=1;
> 2. **§LH-C6-L3-SIN-PAGINADOR** — L3 pagina por URL (3 páginas) y **no sirve
>    ningún control** en el cuerpo. `D2.3` emitiría rutas inalcanzables:
>    replicar o desviarse, **con la razón escrita**, como `D2.4`;
> 3. ~~**§LH-C6-HOVER-ZONAL**~~ ✅ **RESUELTA 2026-08-11 — con la regla medida, no
>    con un criterio.** `npm run qa:hover-zonal` (nueva, negativo 4/4) leyó el CSS
>    **servido** —incluidas las hojas **externas**, 41 185 reglas— y el
>    disparador tiene nombre. **Se construye así, literal:**
>
>    | forma | regla a reproducir |
>    |---|---|
>    | L1 (3 variantes) · L4 | `.et_pb_post .entry-featured-image-url:hover img { transform: scale(1.1) }` |
>    | L5-casos | `.case-list-content article .case-imagen:hover { transform: scale(1.1) }` (se amplía **el propio `<a>`**) |
>
>    O sea: **el disparador es el `<a>` de la imagen, nunca el `article`**, y en
>    L5 el objetivo es el disparador mismo. Cruce con `qa:comportamiento`: 4
>    zooms medidos, **4 explicados, 0 sin regla**.

> ✅ **CONFIRMADO 2026-08-11: «DESBLOQUEADA» es exacto, y las tres fichas de
> arriba NO la re-bloquean.** Se comprobó porque el commit lo afirmaba y una
> afirmación de completitud se verifica ejercitándola (§regla 10): `P-LH-C6` es
> una **precondición** —«medir el comportamiento ANTES de construir»— y está
> cumplida con su sonda, su negativo 5/5 **reproducido en una segunda corrida
> independiente** y su congelada. Las tres fichas son **trabajo DENTRO de F3-2**,
> no requisitos previos suyos.
>
> ⚠ **Con una precisión que faltaba, y es de alcance de la entrega, no de
> bloqueo:** la ficha 1 se resuelve **en F3-4**, no aquí. O sea que F3-2 **no
> puede entregar L5 completo** — construiría el índice `casos-de-exito` **sin su
> filtro de 12 botones**, que es una afordancia medida del original. **Eso es una
> desviación deliberada y se anota como tal** (`PENDIENTES-QA.md`, misma tanda
> que construya, con la razón de `D1`/`D3`), exactamente como `D2.4` hace con los
> 7 sin paginación real. Lo que no vale es entregar L5 y llamarlo completo: la
> entrega de la tabla de arriba dice «L5 (`casos-de-exito`)» y hoy hay que
> leerla **«L5 menos el filtro»**.

> ⚠ **Y `P-LH-C3` cambia de fuente con esta tanda.** Decía *«contra una corrida
> de `qa:lh-paginas` del día de la construcción, no contra la del
> 2026-07-31»*. Hoy hay una tercera opción y es mejor que las dos: **la
> paginación de F3-0**, congelada con su HTML. Sigue valiendo la razón —el
> contenido vivo mueve el total— así que el criterio se reformula: **contra la
> congelada de F3-0, y si difiere, el que manda es el original y la diferencia
> se ficha con su fecha.**

## F3-3 · la cola larga — 7 hubs de KB + las sueltas

| | |
|---|---|
| **entrega** | los 7 hubs del centro de ayuda (casillero **L4**: página compuesta por instancia) + las páginas autónomas (legal · landing de descarga · empresa · suscripción · soporte · contacto) |
| **alimenta** | §2d.1 (los hubs van a cola larga, **cero arquetipos**; `video`/`toggle` **no** entran en `MonoSeccion[]`) |
| **incógnita** | **el modelo de la cola larga no está decidido.** §2d.1 lo dejó dicho: *«la cola larga necesitará su propia decisión de modelo cuando toque»*. Es una decisión de ESQUEMA (`CMS-n`), no una fase |
| **hecho** | la decisión de modelo escrita en el ESQUEMA **con su pre-registro**, y las páginas emitidas con Δ0 en sus ejes |

## F3-4 · las tres familias de archivo sin censar

| | |
|---|---|
| **entrega** | el censo y el modelo de `category` (LH-SP8) · `author` · la taxonomía `sector` |
| **alimenta** | §2c (`categorias`: *«SIN CENSAR … se censa antes de modelar»*) · LH-2 D3 (las **tres** taxonomías que la tarjeta exige) |
| **incógnita** | **`author` no estaba en el plan de nadie.** LH-2 D3 midió que *«el autor no aparece en ninguna tarjeta y el sitemap de author tiene 0 URLs en `/es`»* y concluyó, correctamente para su alcance, que **los listados no lo exigen**. F3-0 midió otra cosa: **el archivo existe y tiene 34 rutas vivas.** Las dos son ciertas y contestan preguntas distintas |
| **hecho** | cada familia con su decisión escrita en el ESQUEMA (colección o «no se replica», **con razón**), y el nº de rutas que añade contabilizado contra A-SP13 |

## F3-5 · los content types de lo ya construido

| | |
|---|---|
| **entrega** | el content type de **HOME** — el único arquetipo construido que sigue sin uno (§precondición 1: PRODUCTO/CATÁLOGO/SOFTWARE/API resultaron ser del CPT `solutions`, ya modelado en §2e) |
| **alimenta** | §2e (`productos`, una colección con discriminante) |
| **incógnita** | HOME es **singleton**: una instancia, así que **no se sabe qué es plantilla y qué es campo**. Es exactamente la FAMILIA DE CALIBRACIÓN, y modelarla desde su única instancia es el arreglo falso |
| **hecho** | o el content type escrito **con sus SIN PROBAR declarados y no cableados**, o la decisión explícita de dejar HOME como plantilla sin colección, con razón |

## El orden, y por qué

| # | por qué va aquí |
|---|---|
| **F3-0** | irreversible: el sitio vivo cambia. ✅ hecho |
| **F3-1** | el más barato de los que estrenan colección (6 instancias, forma uniforme, varianza cero) y el que **estrena el camino CMS-first**. Si el camino falla, es mejor que falle con 6 documentos que con 23 listados |
| **F3-2** | el de más rendimiento: 4 arquetipos cubren 35 páginas + 107 rutas. Depende de `P-LH-C6` |
| **F3-3 · F3-4** | los dos abren decisión de ESQUEMA, así que van después de que F3-1/F3-2 hayan enseñado si el patrón de bloques aguanta |
| **F3-5** | el único que no le debe nada a nadie: se puede mover |

## Lo que esta fase NO hace

- **No toca lo poblado.** Si algo de lo construido en la FASE 2 tiene que
  cambiar, eso NO es F3: es una reapertura, y se escribe como tal en el ESQUEMA
  con la razón. Todo lo de esta fase cayó en el cubo B **precisamente** por eso.
- **No cierra los 208 casos legales sin ejercitar.** Los va reduciendo: cada
  fase EJERCITA a propósito los que su colección toca —lista vacía, opcional
  ausente, unión con un solo miembro— en vez de esperar a que un editor los
  cree. El escalón de las etiquetas midió el coste de la otra vía: 8 entradas
  reales de 149 tenían el caso y el render moría **al prerenderizar**.
- ~~**No arregla el eje `comportamiento` 0/31.**~~ **Lo mordió el 2026-08-10 y
  el mordisco fue mayor de lo previsto: 0/31 → 13/37 con sonda de dos lados y su
  negativo.** Lo que queda para una tanda propia son las **otras 24 rutas**
  (`TODAS=1`), el ancho **390** con su catálogo propio (a 390 el `hover` no es la
  misma interacción y por eso no está en el catálogo), y **un suelo de ruido para
  el eje** — hoy no existe, así que un `SIN EFECTO` aislado es SIN PROBAR.

## ESTADO DE LA FASE 3

| fase | estado |
|---|---|
| **F3-0** · la captura | ✅ **EJECUTADA** (2026-08-09) — HTML **272 registros** + media **337 ficheros**, 0 fallos, commiteadas |
| **F3-1** · `articulos-kb` | ✅ **COMPLETA (2026-08-10, 4 tandas)** — los 6 pasos del orden obligado: specs + PASO 0 · esquema con retícula · extractor + seed · piel del titular (§2d.7) · **plantilla + ruta** (hoja `kb.css` DERIVADA por `qa:kb-clases`, 2 catch-all por sus dos prefijos) · **sonda de dos lados**: `qa:kb-cmp` par a par, **4999/5089 @1440 y 4979/5089 @390** contra la medida congelada y **5453/5543 y 5433/5543 contra el sitio VIVO**, cero diferencias sin declarar en las cuatro corridas. Deja **7 huecos con su número** (`PENDIENTES-QA.md` §F3-1), el mayor de ellos `srcset` con **108.83 px** de consecuencia geométrica a 390 |
| **F3-2** · listados y hubs | ⚠ **DATO CERRADO A MEDIAS Y NADA CONSTRUIDO (2026-08-17, 74.ª tanda) — pararon DOS escalones, y los dos con su medida.** ▸ **Sembrados los 3 documentos** capturados (§F3-LH-TERCER-DOCUMENTO), con **T9B** desbloqueando el del cierre huérfano y **sin arrastrar la re-emisión de T10** (el extractor estrena `SOLO=`; la parcial movió **1 fichero de 212**, comprobado por md5). ▸ **La caída, que es la prueba**: `entradas_blog` 149→**152** · `monitorizacion-ambiental` 89→**91** *(el número del original)* · rutas 363→**367** · `qa:slugs` 190→**194** · formas comparadas 61→**62** · **pares distintos 6 207→5 282** @1440 y **6 199→5 271** @390 · **FECHA 58→6** · formas con `Page N of M` distinto **10→0**. ▸ **Y la ruta que no existía, existe**: `/etiqueta/monitorizacion-ambiental/page/11`. ▸ Cruce del ESCALÓN 3 **exacto al par** a los dos anchos (`62 · 110 779 · 18 349` y `110 829 · 18 399`). ▸ **El −925 va ATRIBUIDO**: todas las bajadas son `listado.tarjetas.*` (contenido dejando de estar desplazado) y las subidas son `cascaron.*` **+4 por capa** = *una forma nueva × 4 capas*, aritmética y no regresión. ▸ ⛔ **ESCALÓN 2**: sembrar **NO** cerró el paginador. Quedan **443 pares en 31 formas**, y son **DOS clases**: la **VENTANA** de las series de **11** páginas (**377 pares**, el clon pinta **9 piezas donde el original pinta 11** — le faltan el `10` y el segundo `...`) y **±0.03 px** sub-píxel en las de 2/3/4 (**66**). Derivada y congelada **la tabla de ventana del original sobre sus 43 series**, sin la cual no se puede arreglar sin inventar. Ficha §F3-LH-VENTANA-DEL-PAGINADOR. **Y sólo existía a partir de 11 páginas, que ninguna serie del clon alcanzaba hasta hoy: arreglar el DATO es lo que lo hizo visible.** ▸ ⛔ **ESCALÓN 1**: se aplicó `D2.4` al **301** de `medicion-de-gases-…` —canonical, `og:url`, `<title>` y un 301 en vivo, todo apuntando a otra— y **la medida lo desmintió**: FECHA **6 → 10**. `D2.4` contesta *«¿es una RUTA?»* y hacía falta *«¿es un DOCUMENTO?»*; en los `/page/N` coinciden porque un `/page/N` no se lista, y **para una entrada se separan** — el original redirige el permalink **y sigue listando su tarjeta**. **Revertido**; el extractor **detecta y reporta, no excluye**. Ficha con **4 salidas, una ya DESCARTADA POR MEDIDA**. ▸ **`L3` y `L5` NO se construyen**, por el ESCALÓN 2: no se construye encima de un defecto de paginador sin nombrar. Su **precondición sí está hecha** (73.ª). ▸ Cobertura **+1** real (`base` 92→93 · `filas` 67→68 · `módulos` 63→64 sobre **367**) — *una forma*, medida; **no confundir con el +54 de la 73.ª, que fue el instrumento dejando de ser ciego*. ▸ Tres cosas no previstas: la guarda de §sondas 5 se cobró una siembra entera (el catálogo canónico estaba desviado), los 3 documentos traían **3 media sin capturar** (5.ª instancia de §EL INVENTARIO DE MEDIA, esta vez derivada de la config y no por colisión) y **`HUECO_DE_CAPTURA` caducó y lo dijo la propia guarda**. ▸ *Lo anterior:* ✅ **RE-VERIFICADAS LAS 3 VARIANTES DE `L1` AL ALCANCE NUEVO (×6.3) — Y LA COSECHA ES DE DATOS: CERO CLASES NUEVAS DE PLANTILLA (2026-08-17, 73.ª tanda — nada construido, cero líneas de `src/`).** ▸ **El cruce del ESCALÓN 1 sale EXACTO AL PAR** a los dos anchos: `lh-alcance` predijo **82 formas · 61 emitidas · 109 421 pares · 18 117 mixtos** @1440 y `lh-cmp` midió **lo mismo** (@390: 109 470 · 18 166). ▸ **Y el cierre son CUATRO afirmaciones con cuatro respaldos, no una** (§sondas 15, escrita en esta fase): el cruce prueba que los dos leen el MISMO universo y es **débil por construcción** (mismo `ESPEJO.paginas`); que el universo **sea 82** lo prueba la derivación `149 − 7 duplicados = 142 rutas`, `142 − 60 vacías = 82`, con `duplicado-sin-marcar` en rojo (`qa:lh-espejo-neg` **3/3**); las **142** son la única con **DOS canales independientes** (`lh-paginas` contra el servidor **vivo** = 142 · el corpus **congelado** de `lh-serie` = 149 − 7); y `min 1 par por página` sale **82/82 por DATO** (`conCero: []`). **No se escribe «el universo está verificado».** ▸ **La re-verificación, cortada contra las 7 formas que el comparador viejo comparó de verdad:** **35 clases nuevas · 400 pares** @1440 (399 @390) = **342 paginador · 58 fecha · 0 CUALQUIER OTRA COSA**. Ese **0** es el resultado: las 3 variantes de `L1` renderizan igual de bien la página 7 de una serie que la 1. ▸ **Y las dos causas son de DATOS, con su mecanismo:** **(1)** los **3 documentos capturados y no sembrados** (§F3-LH-TERCER-DOCUMENTO, bloqueo **T10**) — diferencia simétrica **de los dos lados**: corpus **152** · DB **149** · **3 en el corpus sin fila** · **0 filas fuera del corpus**; dos llevan `monitorizacion-ambiental`, así que la serie tiene **91 entradas y 11 páginas** en el original y **89 y 10** en el clon, **y `/page/11/` NO SE EMITE** — una ruta que falta al final **no se echa en falta desde el principio**, o sea invisible a un comparador de páginas 1 *por construcción*; de ahí salen las 33 clases de paginador, **todas de esa única serie**. **(2) ⛔ NUEVA:** `medicion-de-gases-en-los-vertederos-de-basura` **es un 301** a `contaminacion-del-aire-en-vertederos` (verificado **en vivo hoy**, y su HTML capturado trae `canonical`, `og:url` y `<title>` de la otra) — se sembró como **fila propia con el contenido ajeno**, y la fecha equivocada la **desordena en dos listados**. Es **`D2.4` un nivel más abajo**: aplicado a una ENTRADA, donde nunca se había aplicado. **Con su control**: el otro par de títulos duplicados (`zonas-*`) **no es esto** — postid **13604** y **52220**, **200** los dos: mismo síntoma, **dos causas**. Ficha §F3-LH-ENTRADA-QUE-ES-UN-301, **sin decidir**, con 3 salidas y el barrido del denominador **declarado como no corrido**. ▸ **Nada se arregla aquí, y la razón va escrita**: (1) la bloquea T10, ya adjudicada como «no entra»; (2) **quita una ruta** (363 → 362) y exige re-sembrar, `build` y re-medir los dos anchos — y **aplicarla sola no cierra nada** porque (1) seguiría mal. Las dos, en la misma operación, abren la tanda siguiente. ▸ **21 AUSENTES**: `L2` 12 · `L3` 6 · `L4` 1 · `L5` 1 **+ 1 de `L1`**, que es la ruta que (1) se lleva por delante. ▸ Línea base **363 rutas** sin tocar — y citarla obligó a derivarla: vive en `clon-base-{1440,390}-**2026-08-14**.json`, porque el nombre canónico `clon-base-{1440,390}.json` sigue en **17** (la guarda de §sondas 5 nunca pisa, así que `<nombre>.json` significa **«la primera foto»**, no «hoy»). ▸ *Lo anterior:* ⚠ **EL ESPEJO DE PÁGINAS EXISTE Y EL ALCANCE SUBE A 82 DE 149 (2026-08-15, 72.ª tanda — nada construido).** ▸ `qa:lh-alcance --espejo=lh-espejo`: **82 formas · 129 358 pares @1440 · 129 428 @390**, `primera` **30/35** · `intermedia` **48/86** · `última` **4/28**, **clases 35 de 38**. ▸ **Y las dos cifras van con su cardinal, porque el resumen se las traga (§regla 14):** las **3 clases ciegas** son las de **CERO tarjetas** —**65 páginas de 149, 0 con contenido**, repartidas `D2.5` **55** · grupo B **5** · `D2.4` **5**—, o sea **NI formas sin construir** (las 5 familias `L1…L5` están todas dentro) **NI `L4`** (dentro, con 1 forma, y toca clase); **ensanchar `lh-cmp` alcanzaría 0 de esas 65**, cuyo contrato es `P-LH-C7` y no una comparación par a par, y el clon emite **0 de 65**. ▸ **`última` 4 y no 28 son DOS causas, no una**: `D2.5` **17** + `D2.4` **7**, **hueco 0** — la hipótesis de «son las vacías» acierta 17 de 24. ▸ **Y el 4 no mide lo que parece**: `pos` va sobre la serie **SERVIDA** y en **17 de 35** series ésa NO es la última CON CONTENIDO; la última **CON CONTENIDO** está comparada en **28 de 30** series (**30/30 en DOCUMENTOS**, porque un `D2.4` sirve el de la 1.ª). ▸ Cuarta frontera nueva `espejo·no-la-trae` = **el único hueco**: **0** con este espejo, **69** con el de formas. Negativo **5/5** (sabotaje nuevo `frontera-sin-explicar`). ▸ **Sigue abierto**: las **5** del grupo B sin decisión, y el clon sin emitir ninguna de las 65. ▸ *Lo anterior:* ⛔⛔ **SEGUNDA PARADA DE ALCANCE (2026-08-14, 70.ª tanda), por el ESCALÓN 1: `qa:lh-cmp` compara 13 PÁGINAS de 149 y las 13 son la PÁGINA 1 — o sea que toma el atajo que `qa:lh-serie` rechaza («LA SERIE NO ES UNA UNIDAD»), y el escalón manda parar antes de construir.** ▸ Derivado con `qa:lh-alcance` §`alcanceReal`, idéntico a los dos anchos: `intermedia` **0 de 86** · `última` **0 de 28** · clases **11 de 38** (27 ciegas = **122 páginas**). Vivía como una línea SIN NÚMERO en un `noMide` mientras el cierre se leía como «LISTADO-B verificado». ▸ **Y CORRIGE el mecanismo de la 69.ª**: cruzadas las 43 instancias de la piel B **por ruta**, el comparador tenía **3** en su universo, comparó **1** (las otras dos son `L2`, AUSENTE) y tuvo **0 SEPARADORAS** — el verde no vino del alcance, vino de que su dominio no distinguía los dos modelos. Predicción: `/glosario` (página 1, `total 8`) **sí separa**, así que construir `L2` da la primera separadora sin ensanchar. ▸ **`CMS-ORDEN-L2` ESCRITA como decisión y no decidida** (§7e), 2 preguntas × 3 y 4 salidas por *lo que son*; y nombrar los canales que faltaban destapó **uno con dato**: `/preguntas-frecuentes` **sí sirve fecha** (`article:modified_time` **19/19**) y lo que no tiene es canal **que ORDENE** — con control doble, porque en `/glosario` `dateModified` tampoco ordena con 37/37. ▸ **Los dos bloqueos de siembra ADJUDICADOS**: T10 **sigue fichada y no entra** (re-emisión de 169 cuerpos: exige antes/después y `build`), y la etiqueta 44 va **a T9, no a la whitelist** (DOM ajeno; **1 de 3** nuevos, **0 de 209** sembrados). ▸ **Ensanchar, FICHADO con su número**: 71 páginas, ×6.5, y exige medir el ORIGINAL en las `/page/N` — hoy no hay espejo. ▸ **Los TRES números no se mueven** (10 707/10 714 · 1 840/1 847 · 5 999/6 005, criterio **13 · 6 · 7**, objetivo **13 · 1 · 12**), **cobertura idéntica**, **cero formas construidas**. ▸ *Lo anterior:* ⛔ **PARADA DE ALCANCE (2026-08-14, 69.ª tanda): las specs de `L2`·`L3`·`L5` no contestaban CINCO preguntas que deciden la construcción, y el escalón del encargo manda parar y medirlas.** ▸ `qa:lh-huecos` (nueva, negativo 4/4) las deriva con su canal: la **barra del tema** de `L2` (12/12, donde `lh-barra` decía 0 porque medía la partición Divi) · los **58 px** del `.container` (iguales a los dos anchos) · la **ventana** de la piel B · **qué ordena** (`/glosario` = `datePublished` DESC 37/37; `/preguntas-frecuentes` **sin canal** en los 4 mirados) · la **banda de filtros** de `L3` (3 botones) y `L5` (12), que vale **162.8** y **264.6 px**. ▸ **El 4.º es el que para**: ningún tipo del clon tiene fecha y el precedente no se aplica tal cual ⇒ **`CMS-ORDEN-L2`**, §7e del ESQUEMA. ▸ **DEFECTO en lo ya verificado**: la `PielB` emitía `current` + `n+1..total` — **cero `page smaller`** —; contra las 43 instancias y por SECUENCIA, el nuevo **38/38** y el viejo **7/38**, y los 7 buenos son **páginas 1**, las únicas que el comparador mira. Arreglado, **NO-OP sobre todo lo comparado**. ▸ **`TOPE = 269` CIERRA** con n=37 (era n=6 y «no separable»): único tope del barrido 250–300 que da 37/37. ▸ **Los TRES números no se mueven** — 10 707/10 714 · 1 840/1 847 · 5 999/6 005, criterio en **13 · 6 · 7** — y **cero formas construidas**. ▸ Corrección derivada: de las 6 AUSENTES, **una es `L4` (F3-3)**; las de F3-2 son **5**, así que el objetivo es **13 · 1 · 12**. ▸ Cobertura **idéntica**, por construcción. ▸ Los **3 documentos** de §F3-LH-TERCER-DOCUMENTO: **CAPTURADOS** (309 → 312, 0 fallos, lista derivada de 807 tarjetas); la siembra para en §F3-LH-EXTRACTOR-T10-SIN-CABLEAR y §F3-LH-ARTICLE-ETIQUETA-44. ▸ *Lo anterior:* ✅✅ **`LISTADO-B` COMPLETO — las TRES variantes de `L1` construidas Y VERIFICADAS (2026-08-14, 68.ª tanda), y «completo» va con su alcance: para las tres variantes de `L1`, NO para F3-2.** ▸ **345 → 363 rutas** (+18). Comparador contra el original **VIVO**: **13 formas · 6 AUSENTES · 7 comparadas**, **10 707** pares @1440 y **10 714** @390, **699 / 695** residuos en **0 clases sin nombrar**, y **base Δ0 en las 7** con `P-LH-C8`. Las 3 formas de la 66.ª siguen en **232 / 231**: cero regresión. ▸ Cobertura **+4 en cinco ejes** con el denominador subiendo a la vez (`base` 34→38 · `árbol` 34→38 · `anchos` 18→22 · `filas` 9→13 · `módulos` 5→9 sobre 363). ▸ **El ESCALÓN 1 disparó con una tercera respuesta**: `lh-barra.json` acertó en todo lo que midió y el componente estaba mal igual — `resources` tiene **3 filas** donde las otras dos tienen 2 y su listado cuelga de un módulo de texto vacío. *Una regla INCOMPLETA se lee igual que una completa* (§F3-LH-ESCALON-4-4). ▸ **Cuatro defectos que sólo esta variante podía enseñar**, arreglados, incluido que **el formato corto de fecha era INGLÉS y es ESPAÑOL** —8 de 12 meses no podían separarlo, y toca también a `/etiqueta`—. ▸ **Lo que queda de F3-2**: **L2** (2 formas), **L3** (2, `D2.6`), **L5** (1, menos su filtro), las **55 vacías** de `D2.5` + las **19** de `resources`, y la decisión de alcance del **CASCARÓN**, que mueve 363 rutas. ▸ *Lo anterior:* ✅ **`L1-resources` DESBLOQUEADA: `D2.8` decide `padre` (2026-08-14, 67.ª tanda de DECISIÓN — nada construido).** ▸ La jerarquía se **modela**: `padre` poblado, ruta compuesta en la plantilla, **cero campos nuevos**. Forma medida con `qa:lh-jerarquia` (nueva, negativo 4/4, 5 taxonomías · 38 términos): profundidad **2** · **1** padre · **0** con dos padres · **0** tercer nivel · **1 de 5** taxonomías jerárquica. ▸ **La dirección contraria también contestada**, y es la que casi nadie hace: el esquema **NO** está sobre-generalizado —`padre` en **1 de 4** colecciones, y es la única que el original hace jerárquica—. ▸ **Se decide sin escalar** porque el precedente `D2.4`/`D2.5` cubre el caso: el original declara qué es cada cosa en canales servidos, aquí **cuatro** —miga con `class="taxonomia padre"`, chips, `<body class="archive tax-resources term-…">` y el contraste `page-child` de sus 3 hermanos—. ▸ **Y destapa un defecto que ninguna de las tres salidas cubría**: el prefijo `recursos/articulos` está **cableado en `extractor-a.mjs`**, y 2 de 149 entradas pierden su `recurso` por eso (§F3-LH-EXTRACTOR-PREFIJO-CABLEADO). Arreglarlo mueve el **contenido de 9 rutas ya emitidas** y 0 el conjunto: es re-emisión, con su línea base congelada en `clon-base-{1440,390}-f33-padre-antes`. ▸ *Lo anterior:* ⚠ **2 DE 3 VARIANTES DE `LISTADO-B` CONSTRUIDAS Y VERIFICADAS (2026-08-13, 66.ª tanda).** ▸ `L1-blog` y `L1-etiqueta` emiten **43 rutas** (302 → 345) y pasan de AUSENTES a **PARES COMPARADOS**: 5 445 @1440 · 5 448 @390, con **232 / 231** residuos en **9 clases nombradas y 0 sin clasificar**, y la **base a Δ0** en las tres formas con `P-LH-C8` verificado. La matriz de cobertura sube en 5 ejes (`filas` 6→9 · `módulos` 2→5). ▸ **Lo que queda de F3-2**: `L1-resources` (4 formas, ✅ **desbloqueada el 2026-08-14 por `D2.8`** — falta sembrar y construir), **L2** (2), **L3** (2, `D2.6`), **L5** (1, menos su filtro), las **55 páginas vacías** de `D2.5` (§F3-LH-VACIAS-NO-EMITIDAS) y una decisión de alcance sobre el **CASCARÓN** que mueve 345 rutas. ▸ *Lo anterior:* ⚠ **CON SU COMPARADOR Y SUS PIELES EXHIBIDAS; falta CONSTRUIR.** ▸ **2026-08-13 (2.ª tanda):** auditadas las specs contra el canal recién capturado, **en las dos direcciones** — ninguna afirmación se cae, y las tres declaradas «sin exhibir» quedan **con su regla servida** (`qa:lh-pieles-css`, 13/13 canal completo, negativo 3/3): `L1` y `L4` con override **por módulo** y su `@media`; `L2`/`L3`/`L5` con **CERO** overrides móviles de titular. **SP-T7 cerrada.** Las tres pieles de `h1` pasan de *replicadas de la medida* a **cableables sin inventar**. Línea base completa a **1440 y 390** (302 · 302 · 0 errores). ▸ **Lo anterior:** ⚠ **CON SU COMPARADOR YA HECHO; falta CONSTRUIR.** ▸ **Estado 2026-08-13 (tanda de CONSTRUCCIÓN):** el arquetipo estrena **su sonda de dos lados** —`qa:lh-cmp`, par a par (camino × propiedad), base de lectura por forma con `P-LH-C8` cableado, negativo **3/3**— escrita **antes** que la plantilla para que no acabe calibrada contra el clon. Primera lectura: **13 formas · 13 AUSENTES · 404 · 0 pares**, que es el estado inicial correcto. **Línea base** del clon a 1440 congelada (**302 rutas · 0 errores**). Y el **canal de pieles capturado antes de construir**: las **9 de 9** formas enlazan `et-core-unified-*` y estaba a cero — **52 hojas** capturadas (§F3-LH-PIELES-SIN-CAPTURAR), sin lo cual las specs habrían calibrado contra ceros sin probar. El ⛔ caducado de `listado-b.spec.md` queda levantado. ▸ *Lo anterior:* | ⚠ **SIN ESCALONES ABIERTOS — y lo que queda es CONSTRUIR, que no se ha empezado.** ▸ **Estado 2026-08-13 (tandas de DESBLOQUEO y de T9):** las **cinco colecciones pobladas** (348 documentos · **302 rutas** · round-trip 348/348), **`qa:lh-poblacion` VERDE** —0 de 29 series sin alcanzar—, `qa:lh-paginas` del día **142 rutas** (foto, no constante, P-LH-C3), `qa:slugs` **190 sin colisión** y `npm run check` exit 0. **T9 cerrada con sus CUATRO condiciones**: la cuarta pagada **por mecanismo** —`qa:t9-css`, 0 de 44 clases del envoltorio con regla en los 8 canales de CSS servidos, control vivo, negativo 4/4— tras capturar las 7 hojas enlazadas (§DATOS-DOM-AJENO). ▸ **Lo que falta es la construcción entera**: **LISTADO-B con sus tres variantes, L2, L3 y L5**, con dos desviaciones ya declaradas (**L5 sin su filtro** si `sector` se decide en F3-4, y **§LH-C6-L3-SIN-PAGINADOR** replicado por `D2.6`) y con la regla de que **un arquetipo nuevo NO hereda cobertura**: su comparador de dos lados es parte de la tanda, no un extra. ▸ *Histórico del escalón, que ya no bloquea:* | ⛔ **PARADA EN EL 4.º ESCALÓN, y el escalón BAJA DE 2 A 1.** ▸ **Progreso 2026-08-13 (tanda de PIPELINE):** §DATOS-C-PIPELINE **CERRADA** — las 12 discrepancias eran **tres clases MÁS** de las que la ficha nombraba, y ninguna era del extractor: **6** de T7 sin aplicar dos reglas ya escritas, **3** de serialización que la transcripción normalizó y el original NO, y **3** de una clase entera que el cubo de «combinaciones» escondía (el `texto-destacado` anidado dentro de `necesidad`, que son **48 regiones**, no 3). **`faqs` sembrada 2 → 19**, y `qa:lh-poblacion` baja a **1 serie corta**: `/casos-de-exito`. ⛔ **`casos` NO se siembra, y no por el extractor** —verde con los 57, control 0, negativo 7/7—: la para `RELACIÓN SIN DESTINO`, porque **43 de 57 referencian 10 productos que el clon no modela** (modela 9 de 24). Es §F3-COLA-DESTINOS visto desde la relación, y desbloquearlo es **clonar un arquetipo**, no trabajo de datos. Ficha: §DATOS-C-SOLUCIONES. ▸ De camino: **T7 reescrita** con dos reglas que ya estaban adjudicadas (**1788 → 2** enlaces locales con `target`, **53 → 2** destinos que el build no emite, `clon-base --cmp` **232 páginas · 0 con regresión** a los dos anchos), **T9 nueva** (§DATOS-DOM-AJENO: el editor pegó DOM ajeno, **10 de 309** páginas, con su negativo sobre el discriminador) y **§DATOS-MEDIA-HOTLINK abierta**: el clon sirve **3688 imágenes desde kunakair.com** en **180 de 234** rutas, y la premisa que lo justificaba es hoy falsa —**1265 de 1268** URL ya están publicadas en `public`. ▸ **Progreso 2026-08-12 (2.ª tanda de datos, la de la siembra):** ▸ **Progreso 2026-08-12 (2.ª tanda de datos, la de la siembra):** sembradas **TRES de cinco** colecciones desde el corpus — `entradas-blog` **149**, `terminos-kunakpedia` **37**, `documentos-cientificos` **23** — con round-trip **268/268** y `npm run check` verde en **232 rutas · 13 familias · 0 vacías**. `qa:lh-poblacion` pasa de **19 de 29 series cortas a 2**, y las 2 son exactamente las que faltan: `/casos-de-exito` (57 vs 4) y `/preguntas-frecuentes` (19 vs 2). El extractor de esas dos **está escrito y con negativo 5/5** (`cms:extractor-c`: 57 + 19, 0 lectores muertos, 0 regiones ausentes) y **no siembra** por una razón que no es suya: **§DATOS-C-PIPELINE** — es el primer instrumento que compara un cuerpo transformado contra su transcripción, y descubre que el control de `extractor-a` **no compara `cuerpo` en ninguno de sus 18 campos**. Consecuencia medida en los 209 cuerpos YA sembrados: **1788 enlaces localizados con `target="_blank"`** y **53 rutas locales que el build no emite** (31 se resuelven al sembrar casos; **20 son enlaces rotos vivos**). ▸ **Progreso 2026-08-12 (1.ª tanda de datos):** decidida la salida **A** (`D2.7` · sembrar el corpus) y el catálogo **extraído y verificado** (`cms:extractor-a`: 149 · 37 · 23, control **95/95**, negativo 4/4). **Ninguna colección sembrada todavía**, por tres precondiciones que las guardas pararon antes de la DB: **90 orígenes de media sin capturar** · **1 de 37** con `<h1>` vacío contra un `required` · **5 campos sin lector**. La primera necesita **campaña contra el original**. Ficha: §DATOS-A. Ficha original: | El camino de decisiones está **entero** —§LH-C6-L3-SIN-PAGINADOR cerrada con **`D2.6` · REPLICAR**, y las 4 medidas del cascarón diagnosticadas (3 con causa, `SP-H6` a medias)— pero **el clon no tiene documentos para emitir ni verificar las 142 rutas**: 19 de 29 series con listado se quedan cortas y sólo **35 de 142** son emitibles hoy (7 entradas de blog contra 149, 4 casos contra 57, 3 términos contra 37, 4 documentos contra 23, 2 faqs contra 19). `P-LH-C3`, `P-LH-C7` y la comparación par a par **presuponen las tres la población del original**. Sonda `qa:lh-poblacion` (negativo 3/3), congelada en `medidas/lh-poblacion.json`; tres salidas escritas en `PENDIENTES-QA.md` §ESCALÓN F3-2 (4.º). ✅ §LH-C6-HOVER-ZONAL resuelta; §LH-C6-FILTRO-L5 no bloquea (F3-4, `L5` menos el filtro) |
| **F3-3** · cola larga | pendiente · abre decisión de ESQUEMA |
| **F3-4** · familias de archivo | pendiente · abre decisión de ESQUEMA |
| **F3-5** · content type de HOME | pendiente · sin dependencias |
