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

> ✅ **`L5` CONSTRUIDA Y VERIFICADA (2026-08-18, 82.ª tanda).** El comparador de
> formas pasa de **13 · 4 ausentes · 9 comparadas** a **13 · 3 · 10**, y las tres
> que quedan son exactamente **`L2-glosario`, `L2-faqs` y `L4`** — de las cuales
> `L4` es **F3-3**, así que **lo que F3-2 sigue debiendo es `L2` (2 formas)**.
> Rutas 373 → **374**. `qa:cobertura` sube **+1 en cinco ejes**. Cierre con sus
> números y sus 20 diferencias con causa nombrada:
> `PENDIENTES-QA.md` §F3-LH-L5.
>
> ⚠ **Y la entrega se lee «`L5` menos el FILTRADO», no «menos la banda»**: los 12
> botones entran como geometría (inerte), y el comportamiento es **F3-4**.
>
> ⛔ **Lo que esta tanda NO puede declarar cerrado, y va con su número:** la
> banda de filtros queda a **+4.99 px** y **ningún par del comparador la mira**
> —el espejo no congela sus internos— así que el verde de `L5` es cierto *de lo
> que compara* y la banda está fuera (§F3-LH-BANDA-FILTROS-SIN-INTERNOS). Y
> `qa:enlaces`, corrido tras **dos tandas** sin correrse, sale con **105 destinos
> que hay que clasificar** sobre 374 páginas, frente a un verde anterior que era
> de **31** (§F3-LH-ENLACES-105).

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

## F3-3 · la cola larga — **48 RUTAS = 31 páginas + 1 entrada de blog + 13 redirecciones + 3 bajas**, en TRES subconjuntos y **CUATRO** regímenes

> ⚠ **TRES UNIDADES, LAS TRES CIERTAS, Y NO SON INTERCAMBIABLES** (91.ª y 93.ª):
> **48** es lo que la fase tiene que RESOLVER (URLs que el original sirve de
> algún modo); **32** son los documentos CAPTURADOS —el denominador de toda
> medida hecha sobre el corpus—; **31** es lo que la colección `paginas` ALOJA,
> desde que S1 mandó la webinar a `entradas-blog` (§2j.3c del ESQUEMA). Todo
> denominador de este §F3-3 dice cuál de las tres usa. ⚠ **S1 no descapturó
> nada**: las 32 capturadas siguen siendo 32, y el reparto sitio a sitio está en
> `derivaciones/denominador-32-reparto.md`. El «13 redirecciones» **no es un
> hueco**: es otro mecanismo, y su reparto está abajo.

> ⚠⚠ **EL REPARTO DE REGÍMENES, DERIVADO EN LA 92.ª — SON CUATRO, NO TRES.**
> Este §F3-3 decía «híbrido 8 · builder 22 · plantillado 2». Leído el `<body>`
> de las 32 capturas:
>
> | régimen | marcadores en el `<body>` | n | quiénes |
> |---|---|---|---|
> | **HÍBRIDO `BT`** | `et_pb_pagebuilder_layout` **+** `et-tb-has-body` | **8** | los 7 hubs de KB + `/es/sistema-interno-de-informacion/` |
> | **BUILDER `B-`** | sólo `et_pb_pagebuilder_layout` | **22** | los 6 hubs L4 + 16 sueltas |
> | **PLANTILLADO `-T`** | sólo `et-tb-has-body` | **1** | `/es/redes-hibridas-…-grabacion-webinar/` |
> | **SIN MARCADOR `--`** | **ninguno de los dos** | **1** | `/es/politica-de-seguridad-de-la-informacion/` |
>
> **El cuarto casillero no está en la taxonomía de `CLAUDE.md`**, que enumera
> `BT` / `B-` / `-T`. Es `page-template-default` + `et-tb-has-header/footer`, o
> sea la **plantilla clásica del tema** con `<article><div class="entry-content">`
> dentro — un tercer mecanismo de entrega de contenido, ni builder ni
> theme-builder. Y **no venía de las 16 que no existen: estaba capturado desde
> el principio**, invisible porque nadie contó por régimen.
>
> **Consecuencia inmediata:** la unión de CMS-3 expresa **30 de 32**, y las 2
> que faltan son exactamente estas dos últimas filas. Acta con sus números, sus
> nombres y su negativo: `ESQUEMA-CMS.md` §2j.3b ·
> `derivaciones/prueba-union-f33.log`.

> ✅ **MEMBRESÍA DERIVADA Y CERRADA (2026-08-22, 90.ª tanda). Las dos lecturas
> que convivían quedan BORRADAS, no conciliadas** — precedente de F3-5: mientras
> las dos estén escritas, cada lector elige la suya.
>
> **Y no eran «dos lecturas del mismo conjunto»: eran DOS CONJUNTOS DISTINTOS
> que suman 13 por coincidencia aritmética.**
>
> | lectura | decía | era | omitía |
> |---|---|---|---|
> | `ESQUEMA:1542` | «6 hubs LH-2 + 7 hubs KB» | **13 páginas reales**, todas hubs | **las 35 sueltas** |
> | `PLAN §F3-3` (esta fila) | «7 hubs KB + las autónomas (legal · descarga · empresa · suscripción · soporte · contacto)» | 7 páginas **+ 6 FAMILIAS** = 35 rutas | **los 6 hubs de L4** |
>
> El «13 = 13» salía de que la segunda contaba **6 familias** donde la primera
> contaba **6 páginas**. Es §*un cardinal es un contenedor y absorbe la
> membresía*: **la intersección real de las dos lecturas son sólo los 7 hubs de
> KB.** El conjunto de la fase es **la UNIÓN**, y se nombra elemento a elemento.

### La membresía, DERIVADA — 7 + 6 + 35 = **48 RUTAS** (= **32 capturadas** = **31 de `paginas`** + 1 entrada), sin solapamiento

Fuente: `corpus/fase-3/LISTA-DERIVADA.json` (2026-08-20) por `bucket`, cruzado
con `medidas/lh-regimen.json` (2026-07-31) para separar L4. **Los 6 de L4 caen en
el bucket `listados`, no en `sueltas`**, así que los tres subconjuntos son
disjuntos — comprobado, no supuesto.

**▸ A · los 7 hubs de KB** (`bucket: hubs-kb`) — **régimen HÍBRIDO `BT`, los 7**

| ruta | secciones propias | módulos propios |
|---|---|---|
| `/es/soporte/centro-de-ayuda/` | **11** | text · image · **toggle** · **video** · button |
| `/es/centro-de-ayuda/kunak-air/` | 7 | text · image · **toggle** · **video** |
| `/es/centro-de-ayuda/kunak-air/video-tutoriales/` | 7 | text · image · **video** |
| `/es/centro-de-ayuda/kunak-air-cloud/` | 5 | text · image · **toggle** · **video** |
| `/es/soporte/centro-de-ayuda/kunak-air-cloud/video-tutoriales/` | 5 | text · image · **video** |
| `/es/centro-de-ayuda/kunak-air/articulos-de-ayuda/` | **1** | text · image · **toggle** |
| `/es/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/` | **1** | text · image · **toggle** |

> **Y traen una regularidad de 7/7 que nadie había escrito:** los `…/articulos-de-ayuda/`
> llevan **toggle sin video**, los `…/video-tutoriales/` **video sin toggle**, y
> los tres índices **los dos**. El tipo de hub predice sus módulos.

**▸ B · los 6 hubs de L4** (`lh-regimen`: `esBuilder && !tieneTbBody`) — **régimen
BUILDER PURO `B-`, los 6.** Secciones Divi **6·7·8·6·7·6**, que es la oscilación
literal que LH-2 §D1 cita:

`/es/productos/` · `/es/sectores/` · `/es/recursos/` · `/es/recursos/kunakpedia/`
· `/es/recursos/documentos-cientificos/` · `/es/recursos/preguntas-frecuentes/`

**▸ C · las 35 sueltas** (`bucket: sueltas`) — **19 capturadas · 16 sin capturar**,
listadas una a una en el acta de la 90.ª (`HANDOFF.md` §2).

> ⚠⚠ **CORREGIDO 2026-08-22 (91.ª): LAS 16 «SIN CAPTURAR» NO SON PÁGINAS, Y LA
> COLA LARGA NO TIENE 48 RUTAS SINO 32.** *(⚠ y de esas 32 capturadas, `paginas` aloja **31**: la 93.ª mandó la webinar a `entradas-blog` — S1, §2j.3c)*
>
> Re-preguntadas al **origen vivo** (`cms:captura-f3`, que vuelve a pedir todo
> fichero ausente): **0 nuevas**. El original responde **13 × HTTP 301** y **3 ×
> HTTP 404** — y **la misma respuesta que el 2026-08-09**, o sea dos lecturas
> separadas 13 días, sin una discrepancia.
>
> | | n | qué son |
> |---|---|---|
> | **páginas** | ~~32~~ **31** | 7 hubs KB + 6 hubs L4 + **18** sueltas — las que `paginas` (CMS-3) aloja *(93.ª, S1)* |
> | **entrada de blog** | **1** | la webinar — `entradas-blog`, que ya existe. Estaba en `sueltas` **por su URL, no por su forma** |
> | **redirecciones** | **13** | un **mapa de redirecciones**, que NO es un documento de la colección. Varias apuntan a sitio ya clonado (`/es/estaciones-control-calidad-del-aire/` → `/es/monitor-calidad-aire/`) o ya dentro del conjunto (`/es/soluciones/` → `/es/productos/`); **dos redirigen a una IMAGEN** |
> | **bajas** | **3** | `404` — fuera del sitio |
>
> **El «16 sin capturar» era membresía mal derivada, no captura pendiente**, y su
> forma es §*un cardinal es un contenedor*: `35 sueltas` contaba **URLs
> conocidas**, no **páginas servidas**. Las dos son ciertas y sólo una es la
> unidad que la fase necesita.
>
> **Y lo que esto cierra de golpe** (`PRE-REGISTRO-CMS-3.md` §P-U, §P-O): la
> unión de 12 tipos **deja de ser una cota** —no quedan páginas por capturar— y
> las de **0 secciones propias** quedan fijadas, así que **RA-2 no puede
> dispararse** por una captura futura. ⚠ **Y no eran «2 de 32» de una forma:**
> son dos formas de una instancia cada una (92.ª), y con **S1** una de ellas sale
> de `paginas`. **RA-2 vigila hoy UNA forma con n = 1** —el régimen `--`— y su
> tercera redacción está en `ESQUEMA §2j.3`.

### Qué hay ya medido — con sus denominadores y sus ceros NOMBRADOS

| | hubs KB | hubs L4 | sueltas |
|---|---|---|---|
| **HTML capturado** | **7/7** | **6/6** | **19/19** ✅ — las otras 16 no son páginas |
| **hojas CSS completas** | **7/7** ✅ (`49/49`) | **6/6** ✅ (`43/43`) | **19/19** ✅ (`133/133`) |
| **medida por alguna sonda** | **0/7** | **6/6** (12 sondas) | **0/19** |
| **fila en `COBERTURA-MEDICION`** | **0/7** | — | **0/19** |

> ✅ **PAGADO EL 2026-08-22 (91.ª). Esta caja decía *«de las 32 capturadas, sólo
> 6 tienen sus hojas»* y hoy son 32 de 32** (`derivaciones/css-f33-2026-08-22.log`).
> Se conserva el porqué, porque es lo que hace que la precondición existiera:
> las que faltaban eran **todas `et-cache`** —las que Divi **compila por
> página**, o sea justo donde vive lo que el editor escribió (§*Divi no escribe
> marcado: COMPILA CSS*)—, y medir offline sin ellas habría dado **números
> plausibles y falsos en 26 de 32**, que es §F3-1-CSS-NO-CAPTURADO cobrado por
> segunda vez.
>
> ⚠ **Y el mecanismo que lo hizo pagable, que es lo reutilizable:** pedir una
> hoja `et-cache` **en frío devuelve 404**; pedir antes **su página** la
> recompila y entonces la hoja existe. 15 de 49 dieron 404 y **no eran bajas**:
> calentadas sus 8 páginas, **15/15**. Un 404 de `et-cache` **no se reporta como
> ausencia sin haber calentado su página** (ya en `CLAUDE.md`).
>
> **El «medida por alguna sonda» de los hubs L4 dice QUÉ pregunta se contestó y
> cuál no:** `lh-censo` · `lh-regimen` · `lh-paginas` · `lh-jerarquia` son de
> **recon**; el único comparador de dos lados que los toca es `lh-cmp`, y **sólo
> alcanza a `/es/recursos/`**. Los otros **5 no tienen ni un eje comparado contra
> el original**.
>
> ⚠ **Y cómo se derivó el «0 sondas», porque el primer intento salió mal:** el
> cruce v1 aceptaba la ruta **sin** `/es/` y eso casaba con las claves de los
> **recuentos de enlaces entrantes** de los extractores (`"/contacto": 4`), que
> **no son medidas**. Daba 22/35 falsos. Destapado verificando **un caso a mano
> contra el fichero** —la guarda que §sondas 4 manda antes de creerse un
> resultado—, corregido a la forma `/es/…` y **con control en negativo (ruta
> inventada → 0 ficheros ✅)**.

### Las restricciones, con su cita — y comprobadas EN LAS DOS DIRECCIONES

| # | restricción | cita | ¿se sostiene contra lo medido? |
|---|---|---|---|
| R1 | los hubs **no estrenan arquetipo** — cero arquetipos | `ESQUEMA:1216`, `:1524` | ✅ nada la contradice |
| R2 | añadir `video`/`toggle` a `MonoSeccion[]` es el **arreglo falso** de §1.5b Razón 1 | `ESQUEMA:1526` | ✅ y se refuerza: los tipos fuera de `MonoSeccion[]` **no son 2, son ~~7~~ 9** (⚠ recontado en la 91.ª, `ESQUEMA §2j.2`) |
| R3 | la hipótesis del **grupo D cayó** → la cola larga no hereda su modelo | `ESQUEMA:1522` | ✅ |
| R4 | `MonoSeccion[]` sola **no cubre** la cola larga — usan `video`/`toggle` | `ESQUEMA §2d.1` (`:1542`) | ⚠ **CIERTA SÓLO EN 7 DE LAS 32 PÁGINAS** |

> ⚠⚠ **R4 NO SE SOSTIENE FUERA DE LOS HUBS DE KB, y es el hallazgo que más
> cambia la decisión.** Censado el marcado de las 32 páginas capturadas (capa
> propia, `et_pb_<tipo>_<n>`, con `<style>`/`<script>` fuera):
>
> | conjunto | `video` | `toggle` | tipos FUERA de `MonoSeccion[]` — ⚠ **v2 (mal)** | **v3, derivado (2026-08-22)** |
> |---|---|---|---|---|
> | hubs **KB** (7) | **5/7** | **5/7** | **2** — `video` · `toggle` | **2** ✅ sin cambio |
> | hubs **L4** (6) | **0/6** | **0/6** | ~~**NINGUNO**~~ | **1** — `blurb` (1/6) |
> | **sueltas** (19 leídas) | **0/19** | **0/19** | ~~**5**~~ — `map` · `slider` · `fullwidth_slider` · `slide` · `icon` | **7** — los 5 **+ `code` (9/19)** + `blurb` (2/19) |
>
> Las dos direcciones, y las dos dan resultado: **hacia atrás**, R4 es correcta
> en el dominio donde se derivó (los hubs de KB); **hacia delante**, se había
> generalizado a las 48 RUTAS y en 25 de las 32 PÁGINAS **el caso no se da** — §*una regla
> derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR para ese
> caso*, aquí además con **cinco tipos que nadie había nombrado** en su lugar.
>
> > ⚠⚠ **RECONTADO EN LA 91.ª — y el instrumento tenía una LISTA ESCRITA A MANO
> > (§regla 9 caso 7).** `modulos-f33-v2.mjs` comparaba contra
> > `YA = ["text","image","button","blurb","cta","divider","code","gallery"]`,
> > que acredita a `MonoSeccion[]` **cuatro tipos que no expresa**: `blurb` y
> > `gallery` existen como bloque pero en **`MODULOS_KB`**, y `code` y `divider`
> > **no existen en ninguna unión del repo**. `modulos-f33-v4.mjs` **deriva el
> > conjunto del registro de bloques** en vez de reescribir la lista.
> >
> > **Fuera de `MonoSeccion[]` son 9, no 7** (`code` · `toggle` · `video` ·
> > `blurb` · `fullwidth_slider` · `slide` · `map` · `slider` · `icon`), y **la
> > unión que la cola larga necesita son 12 tipos de contenido**, de los que
> > **8 no tienen definición en el repo** y 1 (`blurb`) es copiable.
> > **`code` es el segundo módulo más frecuente de las sueltas (9/19)** y se
> > había perdido entero. Detalle y consecuencia: `ESQUEMA §2j.2`.

**▸ R5 — RESTRICCIÓN NUEVA, derivada: el conjunto tiene TRES REGÍMENES, no uno.**
Leído el `<body>` servido de las 32 (§*identifica el RÉGIMEN antes de aplicar
ningún test*):

| régimen | marcadores | n | quién decidió los valores |
|---|---|---|---|
| **híbrido** `BT` | los dos | **8** (los 7 hubs KB + `/es/sistema-interno-de-informacion/`) | **por capas** — `_tb_` plantilla, propia editor |
| **builder puro** `B-` | sólo `et_pb_pagebuilder_layout` | **22** (los 6 L4 + 16 sueltas) | el editor de la instancia |
| **plantillado / sin capa propia** | `-T` o **ninguno**, y **0 secciones propias** | **2** — `/es/redes-hibridas-…-grabacion-webinar/` · `/es/politica-de-seguridad-de-la-informacion/` | la plantilla |

> **Las 2 últimas son la separadora más dura de la fase:** tienen **cero
> secciones propias**, así que **cualquier modelo basado en bloques del builder
> no tiene nada que poner en ellas**. No es un caso raro: es el caso que decide
> si el modelo necesita una vía de escape.

**▸ R6 — y el rango de secciones propias va de 0 a 11** (`0·1·…·7·11`), con
`/es/soporte/centro-de-ayuda/` y `/es/empresa/` en **11**. Un modelo de página
compuesta tiene que admitir ese rango sin que 11 sea un caso especial.

### Los MODELOS CANDIDATOS que las restricciones dejan vivos

**Ninguno se decide aquí** — es `CMS-n`, del propietario. Se publican con su
coste y **con las instancias que los separan**, que es lo único que convierte
una lista de opciones en una decisión (§*un modelo se elige por lo que lo SEPARA
de su alternativa, no por lo que acierta*).

| # | candidato | coste | qué restricción lo mantiene vivo |
|---|---|---|---|
| **C1** | **campo RICO por página**: una colección `paginas`, cascarón + **un** campo HTML | **el más bajo** — 1 colección, 1 campo | la frontera que `CLAUDE.md` ya declara: *a partir del contenedor de contenido, se declara RICO* |
| **C2** | **`MonoSeccion[]` TAL CUAL** (sin ampliar) + un bloque de **escape** para lo que no cabe | bajo — reutiliza lo existente | R2 se respeta: no se toca `MonoSeccion[]` |
| **C3** | **unión PROPIA de bloques** de `paginas`, con los tipos medidos — el camino que `articulos-kb` ya abrió con `texto-kb` | alto — ~~7~~ **12 tipos en la unión, 8 sin definición previa** (v3) | R2 se respeta **porque no toca el compartido**; hay precedente |
| **C4** | **dos colecciones**: `hubs` (13) y `paginas` (35), cada una con su unión | el más alto | §1.5b Razón 2 (obligatoriedad real por colección) |

**LAS SEPARADORAS, nombradas — y una pareja que NO tiene ninguna:**

> ⚠ **Los tres primeros cardinales quedan RECONTADOS en la 91.ª, y en la unidad
> que la afirmación usa: la PÁGINA.** El «12» de C2-vs-C3 contaba **instancias
> de tipo** (5 `toggle` + 5 `video` + `map` + `slider`), que es §*un cardinal es
> un contenedor* con dos unidades mezcladas en la misma columna.

| par | instancias separadoras | cuáles |
|---|---|---|
| **C1 vs C2/C3/C4** | ~~≥ 30~~ → **16 de las 32 capturadas** | toda página con **>1 sección propia** (KB **5/7** · L4 **6/6** · sueltas **5/19**): C1 las aplana a un blob, los otros conservan `flujo`/`anchoPct`. La más clara: `/es/soporte/centro-de-ayuda/` y `/es/empresa/` (**11 secciones**) contra `/es/aviso-legal/` (**1**). **«≥30» no reproduce** — **y NO es una cota**: las 16 restantes no son páginas (13 × 301 · 3 × 404), así que nada la sube. El «≥30» salía de contar sobre 48 RUTAS |
| **C2 vs C3** | ~~12~~ → **20 páginas de 32** | KB **7/7** · L4 **1/6** · sueltas **12/19**. Además de `video`/`toggle`/`map`/`slider`: **9** sueltas con `code` y **3** páginas con `blurb`. C2 las mete en el escape; C3 les da tipo. **20 de 32 no es una vía de escape: es el modelo** |
| **C2 vs C3 · dentro de los 6 hubs L4** | ~~0~~ → **1** (`/es/recursos/`, `blurb`) | **la conclusión NO cambia**: por §*un discriminador hallado en UNA SOLA instancia no es un discriminador*, **L4 sigue sin poder elegir** entre C2 y C3. Lo que cambia es que el cero era del instrumento —`blurb` estaba en la lista escrita a mano— y no del original |
| **C3 vs C4** | **2, y bastan** | `/es/redes-hibridas-…-grabacion-webinar/` y `/es/politica-de-seguridad-de-la-informacion/`: **0 secciones propias**. En C4 la colección `paginas` puede declararlas de otra forma; en C3, colección única, **el campo de bloques tendría que ser opcional para las 32** — que es §1.5b Razón 2 al pie de la letra. *(⚠ argumento SUPERADO en la 93.ª: el opcional **nunca fue el mecanismo** —§2j.3c del ESQUEMA—; a esas 2 las expresan una colección distinta (S1) y un campo rico (S2). El resultado de la comparación no cambia; **esta celda ya no dice por qué**)* |
| **todos vs «lo que hay»** | **2** | las mismas dos: **ningún** candidato basado en bloques del builder tiene qué poner en ellas sin una vía de escape |

> **Y el criterio ya ratificado que el propietario puede aplicar sin medir más**
> es §1.5b **Razón 3**: *fusionar luego es más barato que separar luego; entre dos
> opciones reversibles se toma la que se deshace mejor*. Eso ordena **C4 antes
> que C3** sin necesidad de una medición nueva — y **no** ordena C1 frente a C2/C3,
> porque pasar de rico a bloques **no es reversible barato**: hay que decidir
> bloque a bloque sobre HTML ya escrito.
>
> > ⚠⚠ **CORREGIDO EL SIGNO, 2026-08-22 (91.ª tanda). Esta línea decía «ordena
> > C3 antes que C4», que es Razón 3 AL REVÉS** — y es de las que más caro salen
> > porque es un criterio que se relee y llega blindado por venir de una decisión
> > ratificada.
> >
> > Razón 3 dice que **se toma la opción que se deshace mejor**, y la que se
> > deshace mejor es **la que empieza SEPARADA**: deshacerla es *fusionar*, que
> > es el lado barato. **C4 son dos colecciones y C3 es una, así que Razón 3
> > ordena C4 antes que C3.** Es exactamente lo que la misma maquinaria ya
> > decidió dos veces en este repo — **dos apps** en CMS-0f (*«de DOS apps a
> > una: mecánico y electivo»*) y **dos colecciones** en §1.5b — y el propio
> > párrafo la aplica bien tres líneas antes, al negarse a usarla para C1.
> >
> > **La decisión no cambia**: el propietario eligió **C3** (CMS-3, `ESQUEMA §2j`)
> > **contra** lo que Razón 3 favorece, porque **R1 —cero arquetipos— pesa más**,
> > y la asimetría de deshacer sólo arbitra cuando ninguna medida arbitra. Lo
> > que cambia es que C3 necesita **condición de reapertura explícita**, que es
> > `ESQUEMA §2j.3`. Escrito con el signo invertido, C3 parecía la opción que el
> > criterio ya bendecía y esa condición no habría existido.

| | |
|---|---|
| **entrega** | **31 páginas** de `paginas` emitidas con Δ0 en sus ejes (7 hubs KB + 6 hubs L4 + **18** sueltas) **+ 1 entrada de blog** (la webinar, a `entradas-blog` — S1) **+ un mapa de 13 redirecciones**. Las 48 rutas quedan resueltas, pero **no como 48 documentos**: **31 + 1** lo son, 13 son redirección y 3 son baja |
| **alimenta** | §2d.1 (**cero arquetipos**; `video`/`toggle` **no** entran en `MonoSeccion[]`) |
| **incógnita** | ✅ **DECIDIDA POR EL PROPIETARIO, 2026-08-22 (91.ª): C3** — una colección `paginas` con **unión PROPIA** de bloques, por el camino de `articulos-kb`. `MonoSeccion[]` **no se toca**. Escrita como **CMS-3** en `ESQUEMA §2j`, con por qué caen los otros tres, su **condición de reapertura** (C3 va contra Razón 3, §2j.3) y su pre-registro (`docs/research/cola-larga/PRE-REGISTRO-CMS-3.md`) |
| **precondición NUEVA** | ✅ **A CERO, LOS DOS (2026-08-22, 91.ª).** Eran **dos** huecos y esta fila declaraba uno. ① **50 hojas `et-cache` → 0 faltan**: KB `49/49` (7/7 páginas) · L4 `43/43` (6/6, ya estaba) · sueltas `133/133` (19/19). **32 de 32 páginas con TODAS sus hojas**, contra 6/32 al empezar. ② **los «16 HTML sin capturar» NO ERAN UN HUECO**: re-preguntados al origen **vivo** hoy dan **13 × 301 y 3 × 404**, idéntico a la lectura del 2026-08-09. Congelado: `derivaciones/sueltas-16-reverificadas-2026-08-22.json` |
| **estado** | ✅ **CORTE LIMPIO 2 RESUELTO (2026-08-22, 93.ª): el propietario tomó S1 y S2, y la unión expresa 31 de 31.** ~~⛔ BLOQUEADA (92.ª): expresaba **30 de 32**; las 2 que no —régimen `-T` y `--`— tenían contenido en un canal que el modelo no tenía, y `bloques` opcional **no las cubría: las emitiría vacías con 200**.~~ **S1** manda la webinar a `entradas-blog` (su `<body>` es `single-post`, y `articleSection`/`author` son dato servido que `paginas` no tiene dónde poner: **1 de 32 cada uno**); **S2** da a `paginas` un `campoHtml` para el régimen `--`, con contrato heredado y validación **ejercitada**. Acta: `ESQUEMA §2j.3c`. ⚠ **La colección SIGUE sin estar en `COLECCIONES`** — registrarla es la mitad irreversible y es de la tanda que emita |
| **hecho** | la decisión escrita en el ESQUEMA **con su pre-registro**, **las 31 emitidas con Δ0** (más la entrada por `entradas-blog`) y **las 13 redirecciones emitidas por su mecanismo** (no por la colección) |
| **instrumento** | ✅ **CONSTRUIDO en la 93.ª, y era precondición: §UN ARQUETIPO NUEVO NO HEREDA COBERTURA.** `npm run qa:f33-cmp [390]` compara de dos lados —original por `file://` **con sus 7 hojas** y la red cortada, contra `next start`— sobre un **piloto de 6 páginas derivado por lo que EJERCITA** (11/11 tipos · 3/3 regímenes · 5/5 obligados). Negativo **3/3** con tres exits distintos. ⚠ **No acredita ninguna celda de `COBERTURA-MEDICION` todavía**: el lado del clon no existe |
| **enrutado** | ⛔ **BLOQUEADO POR CMS-4 (94.ª, 2026-08-22): decisión de propietario.** Derivado con `qa:f33-rutas`: **0 de 31 colisionan literalmente** pero **30 de 31 SOLAPAN el plano de otra familia** —19 en `/[slug]`, 4+4+3 en tres catch-all con `dynamicParams = false`, 1 sin plano—. Las tres salidas (E1/E2/E3) con su coste en `PENDIENTES-QA.md` §CMS-4. ✅ **Lo que ya NO espera es la guarda**: `qa:slugs` derivaba sus familias de **una lista de 2** cuando el registro tenía **4** —11 slugs sin cruzar— y ahora las deriva del registro, así que `paginas` entra sola. Y `paginas` lleva ya su `enElPlano`, sin el cual habría reservado **12 slugs de raíz que no son la URL de nadie** |
| **lo que queda** | ✅✅ **LA EMISIÓN ESTÁ HECHA (104.ª, 2026-08-24): 382 → 413 rutas, reparto EXACTO** —19 · 4 · 4 · 3 · 1— y leído por **diferencia simétrica: 31 nuevas · 0 desaparecidas**. `qa:slugs` limpio con `paginas` entrando **sola** (19 en el plano · 29 publicados); `qa:manifiesto` 413 rutas · 23 familias · 0 desaparecidas. El cascarón lo elige `regimen` con `switch` exhaustivo por tipo —`-T` con `case` propio que TIRA (0 de 31) y `default` sobre `never`, así que un quinto valor rompe el **typecheck** en vez de renderizar `undefined`—. Banda `colaLargaB` **193.72 / 196.58**, la base en CRUDO medida **antes** de construir.<br>⚠ **Y lo que la emisión NO cierra, con su número:** (a) la **RETIRADA** deja **10 secciones sin emitir** —CASCARÓN ×10, la miga; CONSULTA ×2— y **la miga no la emite nadie**, así que 10 de 31 rutas van sin ella (§*documentado no es conectado*, fichado); (b) el lado del **CAMPO** de `f33.css` está **SIN ESTRENAR**: `clavesEscritas: 0` y **cero** variables `--f33*` en el HTML servido, o sea que lo probado son **los DEFAULTS**; (c) `map`·`slider`·`icon` siguen **SIN PROBAR** (n = 1) y **no cableados**. Detalle: `PENDIENTES-QA.md` §F3-3-EMISION | ~~⚠ **la EMISIÓN, que es una tanda de construcción entera**: extractor · renderizador de 11 tipos · rutas · registro en `COLECCIONES` · siembra. Y **la geometría no se puede improvisar** —`pt/pb/mt/mb` y `anchoPct` están declarados «SIN PROBAR»—: se DERIVA del original medido, usando el comparador **mientras** se construye. ⚠⚠ **CORREGIDO 2026-08-22 (95.ª): «4 tipos a `n = 1`» es falso EN LAS DOS UNIDADES, y el número correcto depende de cuál se use** — `n = 1` **página**: **3** (`icon` · `map` · `slider`); `n = 1` **instancia**: **2** (`map` · `slider`); `n ≤ 2` páginas entre las definiciones nuevas: **5** (de ahí salía el 4, contando bloques y olvidando `CAMPOS_DIAPOSITIVA`). Los tres números son ciertos de preguntas distintas, y §*un denominador se escribe CON SU UNIDAD*. Derivado: `qa:f33-geo` §5c, congelada `medidas/f33-geo.json`. ✅ **Y la geometría del ORIGINAL ya está derivada** (95.ª): lo que sigue sin existir es el lado del CLON. El enrutado, derivado el 2026-08-22: **0 de las 6 rutas se emiten hoy · 0 colisiones literales**, pero 5 caerían en `app/[slug]` (que pasaría a servir una TERCERA familia) y `/centro-de-ayuda/kunak-air-cloud` cae en un catch-all de KB con `dynamicParams = false`. Detalle: `PENDIENTES-QA.md` §F3-3-EMISION.<br>⚠⚠ **ESTADO al 2026-08-23 (97.ª): la colección está registrada y su dato producido; lo que falta para SEMBRAR son 12 bloqueos en 2 páginas.** La pregunta del censo del campo rico está **cerrada y medida** —las 5 etiquetas eran **cascarón (25 ocurrencias) y consulta (95)**, **0 de contenido** de 120, y `campoHtml` **no se tocó**: `ESQUEMA §2j.6`—. Lo que la para ahora es otra cosa y de otros ejes: `data-teams` (whitelist de atributos, **1 de 788 ficheros**), un `<img src>` en `upload.wikimedia.org` (**1 en las 31**) y `ancho: "1_5"` ×10 que la retícula `MonoAncho` no expresa —**y que el docstring de `validaReticulaPagina` sí lista**—. **Los tres son decisiones de MODELO y suben al propietario**: `PENDIENTES-QA.md` §F3-3-BLOQUEOS-DE-SIEMBRA. Y quedan **2 páginas servidas incompletas a propósito** hasta que exista un bloque de listado embebido (§F3-3-CONSULTAS-EMBEBIDAS) |

## F3-4 · las tres familias de archivo sin censar

> ## ✅✅ **F3-4 · FASE COMPLETA — cerrada el 2026-08-27 (118.ª), registrada aquí por la 119.ª**
>
> **Del plan de F3 sólo queda F3-5.** Se registra con lo que deja abierto **y su
> cardinal**, porque una fase que se cierra sin nombrar su residuo manda a la
> siguiente a redescubrirlo (§*una campaña se declara COMPLETA respecto a un
> USO*, nunca en absoluto).
>
> | qué entregó | evidencia |
> |---|---|
> | el **censo** de las tres familias | `derivaciones/censo-f34.{mjs,log}` (108.ª), offline |
> | el **modelo** de `sector` **implementado** | 13 páginas + 5 redirecciones **301** emitidas (118.ª) |
> | `category` y `author` **decididos** | `author` sale `--` por el **invariante** del marcador, no por su presencia (116.ª) |
> | la mesa de decisiones de propietario | 5 de 5 predicciones confirmadas (118.ª) |
>
> ### Lo que F3-4 deja ABIERTO — tres cosas, cada una con su cardinal
>
> | residuo | cardinal | qué hace falta |
> |---|---|---|
> | **la GEOMETRÍA de `/sector/*`** | **0 de 13** capturas medidas con `getComputedStyle` | ⛔ un **INSTRUMENTO**, no una medida: el corpus da marcado, no alturas. Exige el original **en vivo** o capturado **con sus hojas**, y de esta familia hay **0 hojas capturadas** |
> | el **repunte de `hrefTermino()`** | **1** definición + **3** importadores | decisión de propietario; está fichado |
> | el **bucle de `mineria`** | **5 saltos**, 301 a sí misma | **red**: leer la cabecera `Location` de cada salto. No diagnosticable offline |
>
> ⚠⚠ **Y el segundo residuo tiene una trampa que la 119.ª derivó y que un
> repunte por `grep` pisaría: `hrefTermino` es DOS OBJETOS DISTINTOS con el
> mismo nombre.**
>
> | qué es | dónde | n |
> |---|---|---|
> | la **función** exportada por `lib/taxonomia-sectores.ts:68` | `app/casos-de-exito/page.tsx` · `components/caso/CasoCabecera.tsx` · `components/caso/CasoDetalles.tsx` | **3 importadores** |
> | una **prop homónima** de componentes de listado, que **no la importa** | `listados/PaginaCategoriaCientifica.tsx` · `listados/PaginaRecursos.tsx` · `listados/TarjetaCientifica.tsx` · `listados/TarjetaListado.tsx` | **4 ficheros** |
>
> > **`grep -rn hrefTermino` devuelve SIETE ficheros y sólo TRES son el objeto.**
> > Repuntar por el literal tocaría 4 componentes que no tienen nada que ver —
> > es §*el literal de `className` no discrimina* con el objeto cambiado: aquí
> > lo que no identifica no es una clase de estilo, es **un identificador
> > reutilizado como nombre de prop**. El discriminador es la **línea de
> > `import`**, no la aparición.
>
> **Y el cardinal del encargo estaba corto:** venía escrito como *«1 fichero + 2
> consumidores»* y derivado son **3**. Es la cuarta cifra recordada que esta
> etapa corrige al derivarla — §regla 9.

| | |
|---|---|
| **entrega** | el censo y el modelo de `category` (LH-SP8) · `author` · la taxonomía `sector` |
| **alimenta** | §2c (`categorias`: *«SIN CENSAR … se censa antes de modelar»*) · LH-2 D3 (las **tres** taxonomías que la tarjeta exige) |
| **incógnita** | **`author` no estaba en el plan de nadie.** LH-2 D3 midió que *«el autor no aparece en ninguna tarjeta y el sitemap de author tiene 0 URLs en `/es`»* y concluyó, correctamente para su alcance, que **los listados no lo exigen**. F3-0 midió otra cosa: **el archivo existe y tiene 34 rutas vivas.** Las dos son ciertas y contestan preguntas distintas |
| **hecho** | cada familia con su decisión escrita en el ESQUEMA (colección o «no se replica», **con razón**), y el nº de rutas que añade contabilizado contra A-SP13 |

> ✅ **EL CENSO ESTÁ HECHO (108.ª, 2026-08-25) — offline, sin abrir el original.**
> `derivaciones/censo-f34.{mjs,log}`. **La entrega que falta es el MODELO, que es
> decisión del propietario**; el censo ya no bloquea.
>
> | familia | TÉRMINOS | RUTAS | régimen | tarjetas (min–max) | cuerpo (bytes) |
> |---|---|---|---|---|---|
> | `categoria` (LH-SP8) | **6** | **27** | `-T` en 4/4 | 2–9 | 7 650–21 405 |
> | `author` | **6** | **34** | **`--` en 6/6** | 0–6 | 1 469–12 978 |
> | taxonomía `sector` | **11** | **13** | `-T` en 6/6 | **0–0** | 3 346–3 361 |
>
> **Las dos unidades se escriben las dos** (§*dos lecturas pueden dar el mismo
> cardinal contando unidades distintas*): la incógnita de la fila de arriba
> —«LH-2 D3 dice 6, F3-0 dice 34»— **no era un conflicto**: `author` tiene **6
> TÉRMINOS** y **34 RUTAS**, y las 28 de diferencia son la paginación de **un solo
> término** (`kunak`). Las dos afirmaciones eran ciertas y contestaban preguntas
> distintas, exactamente como la fila decía.
>
> **Y el censo parte F3-4 en una decisión MENOS de las que parecía:**
>
> > **La taxonomía `sector` NO LISTA NADA** — 0 tarjetas en 6 de 6 capturados por
> > los TRES selectores, cuerpo de ~3.3 KB que es miga + barra lateral, y su
> > paginación tampoco.
>
> Así que *«modelar la taxonomía `sector`»* son **dos decisiones separables**:
> **(a)** la RELACIÓN `caso → sector`, que **sí** tiene consumidor medido —el
> filtro de 12 botones de `casos-de-exito`, **la única de las 35 formas de
> listado que enlaza a `/sector/`**— y **(b)** el ARCHIVO `/es/sector/*`, que
> **no lo consume nadie y no sirve contenido**. Se puede hacer (a) sin (b).
>
> **`author` cae en el CUARTO casillero** (`--` en 6/6: plantilla PHP del tema,
> sin capa de builder), así que su lectura es la del **plantillado** — varianza
> entre instancias, no huella de px.
>
> ✅ **(b) `author` — IMPLEMENTADA (117.ª, 2026-08-27), Y LO QUE SIGUE SIN
> MEDIR VA CON SU CARDINAL.**
>
> La **ficha** (`Escrito por…` / `Revisado y aprobado por…`) está transcrita,
> sembrada y adjudicada contra el original. Lo entregado, con sus dos lados:
>
> | eje | medido |
> |---|---|
> | la ficha en el original | **152 de 152** entradas · 612 `href` a `/author/` |
> | el clon antes | **0 de 228** ficheros la emitían |
> | pares del comparador | **0 de 18 → 18 de 18** |
> | la «constante» del clon | era un **CAMPO**: acertaba en 141 y fallaba en 11 |
> | geometría @390 | **152 de 152** entradas se mueven |
> | geometría @1440 | **0 de 152** — pieza tapada, no defecto |
>
> ⚠ **LO QUE NO SE MIDIÓ, con su cardinal — no se lee como cubierto:**
>
> | sin medir | cardinal | qué lo cerraría |
> |---|---|---|
> | las **fotos** de la ficha | **0 de 5** capturadas | RED. Este corpus no puede |
> | el **ARCHIVO** `/es/author/*` | **0 de 34** rutas emitidas | es otra decisión, y sigue abierta |
> | la varianza entre instancias del régimen `--` | **0 de 6** términos de `author` (y **0 de 131** documentos `--` del corpus) | un barrido offline; para el corpus entero, sus hojas enlazadas ⇒ RED |
> | atribución de **8 rutas** no-blog movidas sólo a 390 | Δ≈+504 contra Δ+4/+5 | una base tomada JUSTO antes de la ficha |
> | el `proemio`, tercer eje | **n = 1** | ≥2 instancias — n=1 no discrimina |
>
> **O sea: la FICHA está implementada; la familia `author` NO.** Emitir el
> archivo `/es/author/*` sigue fuera —y explícitamente fuera del alcance de la
> 117.ª—, así que *«author implementada»* a secas sería la cobertura declarada
> al nivel de arriba absorbiendo lo que no se midió abajo.
>
> **LH-2 D3 confirmada offline y POR FORMA:** el autor no aparece en **0 de 35**
> formas de listado; `categoria` en 15; `sector` en 1.
>
> ⚠ **Lo que el censo NO cierra, con su cardinal:** **7 términos** declarados sin
> captura en disco (2 formas acentuadas de `categoria` + 5 de `sector`), y
> **offline no hay código de estado**, así que «redirige» no se puede confirmar
> ni refutar. Lo que el dato SÍ constriñe: de los 5 de `sector`, **3 tienen
> `/page/N` capturado**, lo que **refuta** «el término entero redirige» y deja «la
> base redirige y su paginación no» **SIN PROBAR**. Y el **filtro de 12 botones
> necesita el eje COMPORTAMIENTO**, que este censo no mide.

## F3-5 · los content types de lo ya construido

> ✅ **ALCANCE DECIDIDO POR EL PROPIETARIO, 2026-08-18 (81.ª tanda): F3-5 SON
> TODOS LOS ARQUETIPOS QUE SIGAN SIRVIÉNDOSE DE `src/lib/`, NO SÓLO HOME.** El
> proyecto termina **con el sitio servido desde Payload**, no con el content type
> de HOME escrito.
>
> ⚠ **Esta fase llevaba abierta desde el 2026-08-13 por DOS LECTURAS conviviendo
> en este mismo documento**: el encabezado decía *«los content types de lo ya
> construido»* (plural, todo) y la fila `entrega` y la tabla de estado decían *«el
> content type de HOME»* (uno). **La lectura de HOME-solo queda BORRADA**, no
> conciliada con una nota: dos lecturas que conviven se resuelven eliminando una,
> porque mientras las dos estén escritas cada lector elige la suya.

| | |
|---|---|
| **entrega** | el content type de **cada arquetipo construido que todavía lea su contenido de `src/lib/`**, hasta que el sitio se sirva entero desde Payload |
| **alimenta** | §2e (`productos`, una colección con discriminante) y las colecciones que cada arquetipo estrene |
| **incógnita** | **cada uno es singleton o casi**, HOME el caso puro: una instancia, así que **no se sabe qué es plantilla y qué es campo**. Es exactamente la FAMILIA DE CALIBRACIÓN, y modelar desde una única instancia es el arreglo falso |
| **hecho** | por arquetipo: o su content type escrito **con sus SIN PROBAR declarados y no cableados**, o la decisión explícita de dejarlo como plantilla sin colección, **con razón** |

**El inventario, DERIVADO y no recordado** (criterio: `page.tsx` que importa un
módulo de **contenido** de `src/lib/`, no sólo tipos o helpers):

| ruta | arquetipo | módulo |
|---|---|---|
| `/` | **HOME** | `lib/products` (+ datos incrustados en componentes) |
| `/monitor-calidad-aire` | **PRODUCTO** | `lib/monitor` |
| `/accesorios` | **CATÁLOGO** | `lib/accesorios` |
| `/software-de-medicion-calidad-del-aire` | **SOFTWARE** | `lib/software` |
| `/kunak-api` | *variante corta de SOFTWARE, no arquetipo nuevo* | `lib/api` |

**Ya servidos desde Payload, comprobado:** SECTOR y MONOGRÁFICO
(`cms/sectores`, que de `lib/` sólo importa **tipos** y lee por `leeColeccion`) ·
GRUPO A (`cms/arquetipo-a`) · CASO (`cms/casos`) · FAQ (`cms/faqs`) ·
`articulos-kb` · los listados.

> ⚠ **El cardinal del encargo no reproduce, y se escribe el derivado:** la
> decisión llegó como *«los SEIS arquetipos»* y este criterio da **5 rutas · 4
> arquetipos + 1 variante**. La **sustancia** de la decisión no depende del
> número —el alcance es *«todo lo que siga en `src/lib/`»*, que es un criterio y
> no una lista— pero el número sí, así que se publica con **el criterio que lo
> produce** para que el propietario corrija la cuenta y no la sustancia
> (§regla 9). Si «seis» contaba SECTOR y MONOGRÁFICO, la derivación de arriba
> dice por qué **ya están fuera**.

### ✅ PASO 0 de la 123.ª (2026-08-30) · el censo RE-DERIVADO, y el elegido

**El inventario de arriba se re-derivó contra el árbol de hoy —las tandas
113–122 tocaron `src/`— y REPRODUCE**: 5 rutas · 4 arquetipos + 1 variante.
Instrumento: `derivaciones/censo-lib-123.{mjs,json,log}`, 8 controles en verde.

**Las TRES unidades, cada una con su definición** (§*corregir un denominador no
es sustituirlo en todas partes* — un denominador sin unidad no se puede
auditar). El censo de la 119.ª dio «4 · 10 · 13»; **estos números no lo
reproducen y no lo pretenden**: son otras definiciones, publicadas con ellas.

| unidad | definición | n |
|---|---|---|
| **A · MÓDULO** | ficheros de `src/lib` que exportan ≥1 constante de datos | **22 de 23** |
| **B · PAGE, directo** | `import @/lib/x` en el propio `page.tsx` | **9 de 26** |
| **B · PAGE, transitivo** | `page.tsx` → componentes → `@/lib/x` | **25 de 26** ⚠ |
| **B · PAGE, propio** | el transitivo MENOS el cascarón derivado | **19 de 26** |

> ⚠ **El transitivo a secas es un PLENO y no mide lo que dice.** `nav` y `footer`
> son el cascarón y los alcanzan **24 de 26** pages, así que «25 de 26» describe
> el cascarón, no el arquetipo — §*un patrón que casa en TODAS tampoco mide
> nada*. El cascarón **se deriva** (módulo alcanzado por ≥90 % de las pages), no
> se escribe a mano. Evidencia del pleno, conservada:
> `censo-lib-123-SONDA-TRANSITIVO-ES-PLENO-25-DE-26.json`.

**⚠ Y el censo llegó con un SOBRE-CASADO propio que metía SECTOR y MONOGRÁFICO
en el alcance.** El descuento de `import type` miraba 200 caracteres hacia atrás
y fallaba en los dos casos frecuentes —el `}` de cierre antes de `from`, y el
import **multilínea**—, así que colaba **13 imports de sólo tipos** como lectura
de contenido. **Lo delató contradecir a este mismo §F3-5**, que ya tenía a los
dos fuera (§sondas 4, *la contradicción con una medida buena anterior*, que es
el único control que este defecto tenía). Con el descuento arreglado, los dos
inventarios **concuerdan**. Evidencia: `censo-lib-123-SONDA-IMPORT-TYPE-COLABA-13.json`.

**Por candidato** (`derivaciones/candidatos-f35-123.*` y `eleccion-f35-123.*`):

| arquetipo | régimen | capturado | ejes de dos lados que faltan | del nivel F3-5 |
|---|---|---|---|---|
| **PRODUCTO** `/monitor-calidad-aire` | **`B-`** | sí | filas · módulos · offsets | **filas · módulos** |
| **CATÁLOGO** `/accesorios` | **`B-`** | sí | filas · módulos · offsets | **filas · módulos** |
| **SOFTWARE** `/software-…` + `/kunak-api` | **`B-`** | sí | filas · módulos · offsets | **filas · módulos** |
| **HOME** `/` | **sin derivar** | **NO** | filas · módulos · offsets | filas · módulos |

El régimen se leyó con **los DOS marcadores**, nombrando la combinación: los 32
documentos de `corpus/productos` y `corpus/fase-3-sectores` son **`B-`**, y el
detector **discrimina** —fuera de los candidatos ve `--`×112, `-T`×275,
`BT`×13—, así que ese `B-` es dato y no pleno del instrumento.

> ⚠ **«HOME no está capturada» es un hecho NEGATIVO y se comprobó contra el
> archivo, no de memoria** (§regla 8b) — **0 de 788** documentos del corpus
> traen el canonical de la raíz, con su control al lado: **517 de 788** traen
> *algún* canonical, o sea que el cero no es del filtro.
>
> **Y la primera versión de ese detector dijo lo CONTRARIO.** Filtraba por
> nombre de fichero —`(index|home|inicio|kunakair)\.html$`— y casaba **256**
> documentos: todos los `index.html` de listado. Corregir el sobre-casado
> **invirtió la respuesta**, que es §sondas 4 en su tercera cara.

**EL ELEGIDO: el lote PRODUCTO · CATÁLOGO · SOFTWARE, con PRODUCTO de cabeza.**

**Y el criterio se publica con lo que NO decide.** «Menos SIN PROBAR» separa
**3 de 6** pares —todos contra HOME— y deja **3 pares SIN ORDENAR**: los tres
empatan en ejes que faltan, régimen y captura. El desempate no se inventa, lo
nombra el encargo (*filas y módulos, el nivel donde F3-5 mide*) y **tampoco los
separa**: los tres tienen los dos ejes a `·`.

> **Ese empate es el resultado, no un fallo del criterio: dice que los tres son
> UN LOTE y no tres candidatos.** Comparten régimen (`B-`) y comparten los dos
> ejes que faltan. Así que el ESCALÓN 1 construye **un comparador para las 4
> rutas**, que es lo que el empate está diciendo; romperlo para elegir «uno»
> habría costado tres comparadores del mismo nivel.

> ⚠⚠ **Y LA TERCERA RAZÓN QUE ESTA FRASE DABA —«comparten `lib/monitor`, que
> alcanzan 4 de las `page.tsx`»— SE REESCRIBE CON SU UNIDAD, PORQUE SIN ELLA
> ADMITÍA DOS LECTURAS Y LAS DOS SON CIERTAS DE COSAS DISTINTAS (2026-08-30,
> 125.ª PASO 0).** Derivado sobre las **26** `page.tsx` del árbol
> (`derivaciones/paso0-125.*`, 9 controles en verde, cascarón derivado y no
> escrito a mano: `nav · footer`):
>
> | unidad | qué cuenta | n |
> |---|---|---|
> | `lib/monitor` en **DIRECTO** (`import` en la propia `page.tsx`) | **sólo `/monitor-calidad-aire`** | **1 de 26** |
> | `lib/monitor` **TRANSITIVO** (`page.tsx` → componentes → `@/lib`) | las **4** del lote, exactamente | **4 de 26** |
>
> **El «4» era cierto —en unidad TRANSITIVO— y la frase lo leía como si las
> cuatro rutas importaran ese módulo.** No lo hacen: en directo cada una trae
> **el suyo** —`monitor · accesorios · software · api`, cuatro módulos de
> contenido distintos, que es justo lo que la tabla del inventario dice tres
> párrafos más arriba. Lo que comparten es que **sus componentes** llegan a
> `lib/monitor`; el `FAQ_ITEMS` de `/accesorios` ya estaba documentado así
> (`research/accesorios/PAGE_TOPOLOGY.md` §3).
>
> **Y la frase además estaba INCOMPLETA: la intersección de lo propio en las 4
> no es un módulo, son DOS** — `articles` **y** `monitor`. Citar uno solo
> sugiere un canal compartido donde hay dos.
>
> **La forma general, que es §*un denominador sin unidad no se puede auditar*
> con el objeto puesto en un GRAFO:** en un árbol de imports, «alcanza» tiene al
> menos tres unidades —directo, transitivo, y transitivo menos el cascarón— y
> **las tres se escriben igual**. Un recuento de alcance se publica con la suya,
> o el lector elige la que le convenga. Aquí la diferencia entre 1 y 4 es
> exactamente el trabajo que separa «un content type con cuatro instancias» de
> «cuatro content types», que es la decisión de esta fase.

**Lo que esta fase NO puede cerrar, declarado por delante (punto 4 del encargo):**

- **HOME queda fuera y su captura es precondición** — sin ella su régimen no es
  derivable offline y su SIN PROBAR es **irreducible = 3**, el único candidato
  con ese valor;
- **el reparto por arquetipo de los 6 documentos de `corpus/productos` está SIN
  DERIVAR**, y con el instrumento de esta tanda no se cierra. La firma por
  repertorio de tipos de módulo (`familia-producto-123.*`, 2 controles en verde,
  rango 0.575) **ordena vecinos pero no adjudica arquetipo**: da un continuo de
  **0.6 a 0.875** entre los cinco no-`accesorios`, sin corte. Lo único que separa
  nítido es `accesorios` (**0.3–0.5**), que es CATÁLOGO. Lo que haría falta es un
  recon, no otra métrica de similitud;
- **por tanto «PRODUCTO tiene 6 instancias» es FALSO como leído: 6 es el
  CARDINAL DEL DIRECTORIO**, y el directorio no es el arquetipo — §*un cardinal
  es un contenedor y absorbe la membresía*, con el contenedor puesto en la
  carpeta. Lo establecido es más débil y basta para no bloquear: `monitor` tiene
  **2 vecinos a ≥0.7 que no están clonados** (`estacion-de-monitoreo…`,
  `sensor-de-calidad-del-aire`), así que **no es un singleton irremediable** —
  hay con qué medir varianza inter-instancia **en cuanto un recon adjudique**.
  Mientras no lo haga, lo que no separen los tests A y B sale **SIN PROBAR y no
  se cablea**;
- **`countries` y `faqs` son módulos de contenido que NINGUNA `page.tsx`
  alcanza** (2 de 22). Ni son de esta fase ni se tocan aquí: se fichan.

### ✅ ESCALÓN 1 de la 123.ª (2026-08-30) · `productos-cmp`, y el eje `filas` deja de estar a `·`

**Empezando por el archivo, como manda el encargo.** Barridas las **218**
sondas: **ninguna** medía filas/módulos del cuerpo de estas 4 rutas —66
mencionan el nivel por selector, 21 nombran una ruta del lote, y las **5** del
cruce son cascarón o matriz (`cobertura`, `ruido`, `d4-pie`, `d4-tipografia`,
`c-banda`)—. Los dos lados del cruce se publican por separado para poder
auditar el cero: **53** miden nivel sin ver mis rutas, **13** ven mis rutas sin
medir nivel. Instrumento: `derivaciones/archivo-sondas-123.*`.

> ⚠ El detector llegó **sobre-casado**: `/\bfilas?\b/` casa en cualquier
> comentario y daba **119 de 218** (54 %), con `ruido.mjs` y `slugs.mjs` entre
> las «que sirven». Apretado a **selectores de Divi** baja a 66 y a 5,
> conservando el control del caso conocido (`mono-cmp` mide módulos, `tree-cmp`
> filas). Evidencia: `archivo-sondas-123-SONDA-NIVEL-POR-PALABRA-119-DE-218.json`.

**Construido `qa:productos-cmp`** —original por `file://` con sus hojas contra
`next start`— **con su negativo probado ANTES de la primera corrida real**
(§regla 24), **3/3**, y tres códigos de salida distintos para que un rojo futuro
se pueda atribuir: `mismo-lado` **0** · `inyecta-delta` **4** · `sin-insumos`
**3**. Declara `meta.lado` (§encargo), aplica la intercepción de red **a los dos
lados** (§regla 32) y comprueba sus tres precondiciones **antes del `launch`**,
sin ninguna navegación entre medias (§regla 37).

**LOS TRES CANALES CERRADOS EN LA MISMA TANDA** — hojas **30/30**, media
**162/162**, documentos **4/4**—, que es lo que hace que la corrida **ACREDITE**
en vez de sólo medir:

- **10 hojas `et-cache` capturadas** (las que le faltaban al lote de las 51 del
  directorio). ⚠ Y **no hizo falta calentar**: una sola petición comprobó que
  estas `et-cache` dan **200 en frío**, así que el mecanismo del 404-en-frío
  existe pero hoy no se da aquí. La campaña `cms:captura-css` **no implementa el
  calentamiento** que este documento manda desde el 2026-08-22 — se ficha, no se
  arregló aquí;
- **1 imagen** que parecía hueco (`PM2.5_belgium.webp`) **estaba capturada con
  el nombre normalizado** (`pm25_belgium.webp`). Se resuelve por una segunda vía
  **declarada y publicada con su cardinal** (`via: "nombre-normalizado"`, 1 de
  162); las variantes `-WxH` **siguen sin colapsarse**.

**EL RESULTADO, a los dos anchos:**

| ancho | ejes | distintos | subpíxel (<1/64) | huérfanas orig |
|---|---|---|---|---|
| **1440** | 130 | **43** | 3 | 4 |
| **390** | 130 | **49** | 1 | 4 |

| eje | @1440 | @390 |
|---|---|---|
| `h` | 22 · \|Δ\| 1.20 … **1671.60** | 22 · \|Δ\| 0.39 … **2765.36** |
| `pb` | 13 · 8.00 … 79.61 | 16 · 3.89 … 50.50 |
| `pt` | 8 · 32.00 … 77.60 | 10 · 3.90 … 70.00 |
| `mb` | 0 | 1 · 22.20 |
| **`w`** | **0 — el ancho de fila cuadra EXACTO en las 4** | **0** |

> **El `w` a 0 es el control que sostiene todo lo demás.** Si los dos selectores
> no denotaran el mismo conjunto, el ancho tampoco cuadraría — y a la primera no
> cuadraba.

**⚠⚠ Y ESO ES LO QUE MÁS COSTÓ: EL COMPARADOR LLEGÓ CON DOS VERSIONES QUE NO
COMPARABAN LO MISMO, Y LAS DOS PUBLICARON NÚMEROS PLAUSIBLES.**

| v | qué publicaba | qué era |
|---|---|---|
| 1 | **103 de 156 distintos (66 %)**, `w` valiendo `1440` en todas, **24 huérfanas de un solo lado** | `.et_pb_row` casa también la CABECERA y el PIE del theme builder —medido: 14 filas, **5 del cascarón**— y el clon no las marca. Es el mismo defecto que la v1 del árbol de `c-cmp` |
| 2 | `nModulos` **14→2 · 7→2 · 6→2** | el clon **no emite marcador de MÓDULO**: los hijos directos de `[data-fila]` no son los `.et_pb_module` anidados en columnas |

Las dos son §*31 de 31 rutas distintas no es un hallazgo: es el instrumento*, y
en las dos la firma estaba a la vista —un porcentaje altísimo, un eje constante,
huérfanas de un solo lado—. Congeladas conservadas con su defecto en el nombre:
`productos-cmp-1440-SONDA-MEZCLABA-CASCARON-Y-CUERPO.json` y
`-SONDA-MODULOS-NO-DENOTAN-LO-MISMO.json`.

**LO QUE ESTE ESCALÓN NO CIERRA, con su cardinal (§regla 14):**

- **el eje `módulos` sigue SIN COMPARAR** —no «0 defectos»—, y cerrarlo pide
  **emitir `data-modulo` en los componentes**, que es trabajo de otra tanda. La
  congelada lo publica por ruta en `modulosSinComparar`;
- **4 filas huérfanas del original** (1 por ruta), sin adjudicar entre «el clon
  no la emite» y «el recorte de cascarón se deja una»;
- **el negativo tiene 0 instancias separadoras para el selector del lado del
  CLON**, porque sus 3 casos usan `NEG_MISMO_LADO`. Falta un 4.º caso que sólo
  se puede escribir con el clon servido: *«`[data-fila]` casa >0 en las 4»*.
  Hoy se sabe que casa —la corrida real da 6 · 8 · 6 · 6— pero eso es una
  corrida, no una guarda;
- **los 43 y 49 distintos NO están adjudicados**: son la primera medida de dos
  lados de este nivel, no un diagnóstico. Adjudicarlos es la tanda siguiente.

### ✅ ESCALÓN 2 de la 123.ª (2026-08-30) · los dos tests, y el A habría respondido al revés en 27 de 31

**El régimen primero**, que es lo que decide qué lectura toca: los 4 son **`B-`**
—builder puro—, así que A y B valen tal como están escritos y son
**intra-instancia**. Instrumento: `derivaciones/tests-ab-123.*`, 3 controles en
verde, **357 nodos con caja** a 1440, alcance **sólo ejes de RITMO**
(`margin`/`padding` de sección, fila y módulo), que es el alcance declarado del
test A. La caja y la tipografía quedan **fuera a propósito**: ahí el test A
responde al revés.

**EL CRUCE 2×2, que es lo que el veredicto único esconde** (48 celdas =
4 documentos × 3 tipos × 4 ejes):

| | `seMueve` → test A dice **plantilla** | `noSeMueve` → test A dice **campo** |
|---|---|---|
| **varía** → test B dice **campo** | **27** | **4** |
| **no varía** | **0** | **0** |
| *(sin nada escrito)* | | **17** |

**Las tres lecturas, y la primera es la que vale la tanda:**

1. **El test A, aplicado solo, habría dado la respuesta INVERTIDA en 27 de los
   31 ejes escritos — el 87 %.** El falso negativo que este documento describe
   —*un campo escrito en % igual que su default se mueve con el ancho y parece
   plantilla*— **no es marginal en este arquetipo: es la mayoría**. Quien aplique
   aquí el test A sin el B se lleva 27 plantillas inventadas;
2. **ningún eje de ritmo sale probado como plantilla**: las dos celdas
   `noVaria` están a **0**. Así que no hay ni uno que se pueda cablear;
3. **17 de 48 celdas salen SIN ESCRIBIR** —su único valor observado es **0**, el
   inicial de la propiedad—. Eso **no es «px absolutos»**: es que nadie tocó
   nada, y pesa lo mismo que SIN PROBAR. Leídas por el enunciado literal del
   test A habrían sido **17 campos inventados**, que es exactamente el modo de
   fallo que la premisa callada viene a evitar.

> ⚠ **Y los 31 «CAMPO» salen CON RESERVA, no como conclusión**: esta derivación
> **no mira la unidad DECLARADA**, y un `em` no se mueve con el ancho lo escriba
> quien lo escriba. Para los 4 de la celda `varia+noSeMueve` —los únicos donde el
> test A por sí solo dictaría campo— **haría falta la CASCADA**
> (`CSS.getMatchedStylesForNode`), que es lo que dice *quién* escribió en vez de
> inferirlo del comportamiento del número. Los 27 restantes no dependen de eso:
> los dicta el test B, que no tiene esa reserva.

**⚠ Y el emparejamiento entre anchos NO podía ser por orden** — lo cazó un
control en rojo: el n.º de nodos con caja **difiere entre anchos** (119/117 ·
68/66 · 102/100) porque el constructor **duplica el módulo y esconde uno por
ancho**. Emparejado por el **ordinal de la clase** (§regla 33, la llave no es
opcional): **984 comunes · 24 sólo-1440 · 0 sólo-390 · 420/420 sin llave**, los
dos lados publicados sueltos. Evidencia del defecto:
`tests-ab-123-SONDA-EMPAREJABA-POR-ORDEN.log`.

**LA DECISIÓN DE ESQUEMA QUE ESTO SOPORTA, y lo que NO:**

- **soporta** que el content type de estos arquetipos **necesita campos de ritmo
  por bloque** —igual que SECTOR con su `flujo`—, porque 31 de 31 ejes escritos
  son campo y **cero** son plantilla;
- **NO soporta escribir el content type todavía**, y ésa es la decisión
  explícita que el §hecho de esta fase admite. Faltan tres cosas con su cardinal:
  el eje **`módulos` sin comparar** (ESCALÓN 1), los **105 NODOS sin llave** de
  esta derivación —el `420/420` de arriba está en pares nodo×eje y es correcto
  EN ESA UNIDAD; escrito como «420 nodos» no lo era, corregido por la 124.ª— y
  la **cascada** de los 4 con reserva, **que la 124.ª cerró**. Escribirlo ahora sería
  modelar sobre una sola instancia por arquetipo, que es el arreglo falso que
  esta fase tiene como incógnita declarada desde que se abrió.

### 🔻 ESCALÓN 3 de la 123.ª · NO APLICA, y se dice en vez de saltárselo

El escalón está condicionado —*«si el content type llega a escribirse»*— y **no
se escribió**, por la decisión fundada de arriba. Así que no hay seed, ni
migración, ni reversa que probar: **el escalón no tiene objeto**, que no es lo
mismo que haberlo omitido.

**Lo que sí se verificó, y lo que no se pudo:**

| | resultado |
|---|---|
| `typecheck -w web` | **exit 0** |
| `lint -w web` | **exit 0** (67 avisos, 0 errores) |
| `qa:manifiesto` | **426 rutas · 25 familias · 0 vacías · 0 desaparecidas** |
| `qa:slugs` | **rojo por POSTGRES CAÍDO**, no por la tanda |
| `npm run check` entero | **NO SE CORRIÓ, a propósito** |

> ⚠⚠ **Y no correr el `check` entero fue la decisión correcta, no una omisión.**
> Docker se comprobó **en tres pasos y ANTES de gastar nada** (§regla 37) y el
> demonio **no está levantado**. `npm run check` construye, y **`next build`
> vacía su directorio desde el primer segundo**: sin DB habría muerto a mitad y
> se habría llevado por delante el `.next` con el que esta misma tanda acababa de
> medir las 4 rutas. Comprobar el entorno antes es lo que lo evitó.
>
> El rojo de `qa:slugs` es del **entorno** y no de la tanda: es
> `ECONNREFUSED` contra Postgres, y esta tanda **no tocó `src/`** — sus cambios
> son `scripts/qa/*.mjs`, `docs/` y `package.json`. §regla 21: antes de tocar
> nada, se mira si el rojo es del instrumento, del objeto o de debajo.

### 🔁 124.ª · EL REGISTRO DE F3-5 TRAS AUDITAR EL DISCRIMINADOR

**Tanda OFFLINE. No toca `src/`, no escribe content type, no sale a la red.** Lo
que audita es **el instrumento con el que la 123.ª decidió**, y el resultado
cambia el titular sin cambiar la decisión.

**LO QUE SIGUE EN PIE, y es lo que importa para la fase:**

- **el LOTE está identificado** — PRODUCTO · CATÁLOGO · SOFTWARE ·
  SOFTWARE-corta, los cuatro en régimen `B-` derivado;
- **el comparador está construido y adjudicado con su negativo 3/3**, ANTES de
  que exista el lado que mide (§regla 24);
- **el content type NO se escribe, y sigue siendo una decisión fundada.** El
  motivo se robustece: ahora hay **dos** modos medidos por los que un `number`
  guardaría mal el ritmo del lote —`%` (41 casos) y punto de ruptura (45)—, y la
  primitiva que los expresa (`medida()`) existe pero **estos bloques no la usan**.

**LOS CUATRO HUECOS, con su estado tras esta tanda:**

> ⚠ **Esta tabla es el estado TRAS LA 124.ª y la 125.ª la reemplaza.** El estado
> vigente es el del §CIERRE de la 125.ª, más abajo: dos huecos cerrados, uno
> encogido a la mitad y el cuarto reducido. Se deja porque es el punto de
> partida contra el que se lee lo que la 125.ª movió, no como estado actual.

| hueco | estado |
|---|---|
| eje **`módulos` sin comparar** (no a 0) | **abierto, sin cambio.** Sigue en `·`, que es lo correcto |
| **420 nodos sin llave** | ⚠ **corregido de UNIDAD, no cerrado.** Son **420 pares nodo×eje = 105 NODOS** (420 / 4 ejes). Y **24 de los 105 son rescatables** con la llave depurada de `f33-clases` — el `\b` no casa antes de `_`, así que `et_pb_button_1_wrapper` se queda fuera. §*cada denominador se escribe CON SU UNIDAD* |
| la **cascada** de los 4 con reserva de `em` | ✅ **CERRADO.** Corrida sobre los 984 pares: **269 adjudicables · 66 ciegos** (56 `auto` · 10 `em`) · **0 sin declaración ganadora**. La reserva deja de ser una nota y pasa a ser un cardinal |
| la **varianza inter-instancia** | **abierto, sin cambio.** Los 4 documentos son 4 arquetipos, no 4 instancias de uno |

**Y LA CORRECCIÓN QUE OBLIGA A REESCRIBIR EL TITULAR DE LA 123.ª:**

> El «**87 % al revés**» y el «**31 de 31 son campo, cero son plantilla**» salen
> los dos de agregar con `.some()` a nivel de **CELDA**, y el test A se pronuncia
> sobre **UN VALOR**. Medido por NODO contra la cascada: **216 de 269 · 80.3 %**,
> y **11 de las 27** celdas «al revés» tienen **CERO** nodos mal clasificados.

**Lo que eso NO cambia:** la decisión de no escribir el content type. Al
contrario — la refuerza, porque los 53 fallos que quedan **tienen mecanismo** y
dos de ellos (`FN-%` y `FN-bp`) son exactamente lo que un campo `number` no
puede guardar. Regla y números en `CLAUDE.md` §Alcance; derivaciones en
`docs/research/cola-larga/derivaciones/paso0-*-124.*`, `escalon1-ab-124.*` y
`fn-bp-mecanismo-124.*`.

**Verificado en esta tanda:** ningún `check` — **la tanda no toca `src/`**, así
que construir no verificaría nada suyo y Docker sigue caído. Se dice en vez de
correrlo por costumbre.

### ✅ PASO 0 de la 125.ª (2026-08-30) · el hueco del tipo NO es de tipo, y `medida()` se queda a DOS ejes de expresarlo

La 124.ª cierra diciendo que hay *«dos modos medidos por los que un `number`
guardaría mal el ritmo»* y que *«la primitiva que los expresa (`medida()`)
existe pero estos bloques no la usan»*. **La segunda mitad es la que había que
comprobar antes de diseñar nada** — porque si `medida()` ya los expresa, el
hueco no es de tipo: es de dato, y eso es trabajo de otra clase.

**Lo que `medida()` expresa hoy** (`packages/cms-config/src/campos/comunes.ts`):
un `group` con `valor` + `unidad ∈ {px, pct}` y su override `movilValor` +
`movilUnidad`. O sea **dos ejes**: la UNIDAD, con dos valores; y el
BREAKPOINT, con **dos posiciones** (base y móvil).

**Lo que el editor escribe de verdad**, censado sobre los 4 documentos del lote
—sólo reglas de ritmo cuyo ordinal es **SUJETO** del selector, §regla 36, con su
control en negativo (`generico=1238 · sujeto=125 · contexto=9 · cascarón=36`)—:

| eje | `medida()` expresa | el editor escribe | ¿cabe? |
|---|---|---|---|
| **unidad** | `px` · `pct` | `px` **115** · `%` **35** · **`rem` 30** · **`em` 2** | ❌ **32 declaraciones fuera** |
| **breakpoint** | base · móvil (**2**) | base **85** · `≤980` **20** · `≤767` **20** (**3**) | ❌ **falta una posición** |

**Los dos huecos son de naturaleza distinta y sólo uno está cerrado:**

1. **El BREAKPOINT es firme y no depende de nada más.** Divi da **tres**
   pestañas por campo de espaciado —escritorio, tablet, móvil— y las compila en
   dos `@media` (`≤980` y `≤767`). `medida()` tiene **dos** posiciones, así que
   **un valor de tablet no tiene dónde ir**, y guardarlo en `movilValor` lo
   serviría también a 390, donde el original sirve otro. Es el mismo modo de
   fallo que `FN-bp` en el test A, con el objeto puesto en el esquema;
2. **La UNIDAD sale CON RESERVA, y la reserva es su base.** `rem` se resuelve
   contra el `font-size` del **`html`**, no contra el ancho — así que si esa base
   es constante, `-3rem` y su px computado son el mismo número a 1440 y a 390 y
   `px` bastaría. **Esa base no está medida**: el HTML sirve `body{font-size:14px}`
   y **no declara `html`** en línea, así que el ganador vive en una hoja enlazada
   y **lo dice `getComputedStyle`, no un `grep`**. Es exactamente §*un `em` citado
   sin su `font-size` es la misma trampa que un `%` sin su contenedor*, y es lo
   que el **ESCALÓN 3** de esta tanda va a medir. Hasta entonces: **SIN PROBAR,
   con su cardinal —32— y no cableado.**

> ✅ **CERRADO POR EL ESCALÓN 3 DE ESTA MISMA TANDA, y en la dirección de «NO
> hace falta»:** la base del `rem` es **16px y la misma a 1440 y a 390** en los
> 4 documentos, con el control aritmético cerrando **28/28 al bit**. Así que el
> px computado es fiel y **`medida()` no necesita un valor de unidad para
> `rem`**. **El hueco de tipo se encoge a UNO: la posición de breakpoint** — que
> el escalón 3 mide además con su número (`-4rem` = −64 a 1440 contra `0rem` = 0
> a 390, misma unidad y misma base).

> ⚠ **Y el `em` no es el del tema.** Este documento avisa de un falso positivo
> conocido: `.et_pb_button{padding:0.5em}` es **genérico**, o sea plantilla, y el
> test A dictaría campo sobre él. Los 2 `em` de aquí llevan **ordinal**
> (`.et_pb_text_7{padding-top:1em!important}`) y por tanto son del editor — el
> filtro de §regla 36 es lo que separa un caso del otro, y el aviso viejo sigue
> valiendo para los que no lo pasan.

**LA RESPUESTA A LA PREGUNTA DEL ENCARGO, que es lo que decide el trabajo:**

> **No caben, así que el hueco SÍ es de tipo — pero es MENOS de lo que parecía:
> `medida()` no hay que reemplazarla, hay que darle una posición más de
> breakpoint (y, si la base del `rem` no es constante, dos valores más de
> unidad).** Lo que NO hace falta es diseñar una primitiva nueva: la forma
> —grupo con valor y unidad inseparables, y la unidad rechazada en vez de
> supuesta— ya es la correcta, y su `validate` ya dice por qué.

**Y el matiz de recuento, publicado para que nadie lo lea de más:** los **35**
`%` incluyen los de valor **cero**, que son inocuos —`0% == 0px` a todo ancho—
igual que en el barrido de la 124.ª. No cambian el veredicto de este eje (el `%`
ya cabe como `pct`), pero inflarían cualquier lectura de «cuánto porcentaje hay».

Instrumento: `derivaciones/paso0-125.{mjs,json,log}`, **9 controles en verde**,
incluido el negativo del papel del selector.

### 🔻 ESCALÓN 1 de la 125.ª (2026-08-30) · el eje `módulos` sigue SIN COMPARAR, y ahora se sabe POR QUÉ y A QUÉ COSTE

El acta de la 123.ª dice que cerrarlo *«pide emitir `data-modulo` en los
componentes, que es trabajo de otra tanda»*. Eso es **una** vía, y §regla 9
(8.º caso) manda **derivar el conjunto antes de elegir**, con el número
delante. Derivado —offline, sin clon servido:
`derivaciones/escalon1-modulos-125.{mjs,json,log}`, **5 controles en verde**,
incluido el negativo del descuento de cascarón (crudo 316 → cuerpo 110).

**LO PRIMERO, Y NO ESTABA PLANTEADO: «UN MÓDULO» TIENE TRES CARDINALES CIERTOS
POR DOCUMENTO, Y LA CONGELADA PUBLICA UN CUARTO.**

`.et_pb_module` casa **a cualquier profundidad**, así que un acordeón cuenta él
y sus toggles. Censado el cuerpo de los 4 (cascarón descontado):

| criterio | PRODUCTO | CATÁLOGO | SOFTWARE | S-corta |
|---|---|---|---|---|
| **todos** los `.et_pb_module` del cuerpo (en el DOM) | **110** | **55** | **90** | **56** |
| de **primer nivel** (sin módulo por encima) | **90** | **35** | **70** | **36** |
| lo que `productos-cmp` suma en `orig` (con caja + `slice(0,60)`) | **83** | **33** | **66** | **33** |

**Los tres son ciertos y ninguno es «el» número.** Es §*un censo de NODOS y un
censo de LO QUE SE VE son dos medidas distintas* más §*un cardinal es un
contenedor*, las dos a la vez — y la consecuencia es operativa: **una tanda que
emita `data-modulo` sin fijar antes el criterio compararía contra un cardinal
inflado y leería la diferencia como defecto del clon.**

**Y EL ANIDAMIENTO TIENE MECANISMO, QUE ES LO QUE LO CONVIERTE EN DATO:**
**20 anidados, EXACTOS EN LOS CUATRO documentos.** Un número idéntico en cuatro
documentos distintos es la firma de §*un 100 % redondo: la primera hipótesis es
el instrumento* — así que se persiguió, y no lo era. El desglose es
**`et_pb_toggle` 19 + `et_pb_posts` 1** en los cuatro, o sea **el acordeón de
FAQs compartido**, que este repo ya tenía medido por otro instrumento:
`research/accesorios/PAGE_TOPOLOGY.md` §3 dice **19 toggles idénticos 19/19 a
`FAQ_ITEMS` de `src/lib/monitor.ts`**. Cruce al elemento, no al cardinal.

> **Y eso ata el PASO 0 de esta misma tanda:** el acordeón compartido es
> exactamente **por qué** `/accesorios` y `/kunak-api` alcanzan `lib/monitor`
> **transitivamente** sin importarlo en directo. Las dos derivaciones se
> explican la una a la otra.
>
> **Consecuencia de modelo, que hay que decidir antes de emitir nada:** los
> **80 anidados de 311 (25.7 %)** no son módulos de maquetación de la página —
> son **hijos de un módulo compuesto**. Marcar los 19 toggles como «módulo»
> mediría el interior del acordeón; marcar sólo el acordeón mediría la página.
> Son dos content types distintos, y hoy la decisión no está tomada.

**EL COSTE, DERIVADO Y NO ESTIMADO (Q2):** emitir el marcador toca el cierre
transitivo de componentes de las 4 rutas — **35 ficheros de los 97** de
`src/components` (PRODUCTO 25 · CATÁLOGO 10 · SOFTWARE 18 · S-corta 13). O sea
que toca `src/`, y por tanto **exige build y clon servido para adjudicar el
NO-OP** (§regla 5ter): con Docker caído no hay ni una cosa ni la otra.

**Y NO HAY VÍA SIN MARCADOR (Q3), medido en vez de supuesto:** los módulos **no
son todos hijo directo de su columna** —89/110 · 35/55 · 69/90 · 35/56—, así
que **ningún selector estructural del clon denota el mismo conjunto**. La vía
del marcador no es una preferencia: es la única que queda.

**VEREDICTO DEL ESCALÓN, con lo que NO hace y por qué:**

> **El eje se queda en `·` — SIN COMPARAR, que no es «a 0»** (§regla 14: la
> limitación va con su cardinal). **No se amplió el comparador, y no por falta
> de tiempo: por dos bloqueos derivados**, uno de entorno (35 componentes → build
> → Docker caído) y **uno de modelo, que es el que esta tanda destapa** — el
> criterio de «qué cuenta como un módulo» no está fijado, y ampliarlo sin
> fijarlo escribiría el criterio por accidente, en el marcador.

**Tampoco se tocó `productos-cmp.mjs`.** Modificar una sonda que hoy **no se
puede correr** —necesita `httpClon` y no hay clon— es escribir un cambio sin su
paso 2 (§*el marcador prueba que el build es nuevo, no que el cambio tenga
efecto*). Lo que la tanda siguiente necesita queda **derivado y congelado**, no
a medio aplicar en el instrumento.

> ⚠ **Punto 4 del encargo, comprobado y NEGATIVO:** el `nModulos: orig 2 →
> clon 0` que una vez destapó 6 páginas servidas vacías **no se da aquí** — el
> clon devuelve 1–3 hijos directos por fila, y el eje `w` cuadra **exacto en las
> 4**, que es el control que dice que los dos lados denotan la misma fila. Lo
> que hay no es un cero: son **dos conjuntos distintos** (módulos contra
> columnas), y por eso se excluye en vez de contarse.

### ✅ ESCALÓN 2 de la 125.ª (2026-08-30) · los 105 sin llave se reparten en TRES causas, y la aritmética cierra

La 123.ª publicó **420 sin llave** (pares nodo×eje); la 124.ª corrigió la unidad
—**105 NODOS**— y midió **24 rescatables**. Quedaban **81 sin explicar**, y «81»
es un total: no dice si son un mecanismo o cinco. Esta derivación los reparte
**por causa**, con el **mismo montaje** que la 124.ª copiado sin tocar — así lo
que difiera no puede venir de ahí. `derivaciones/escalon2-llaves-125.*`,
**8 controles en verde**, y los dos cruces con la 124.ª **reproducen exactos**
(`105` y `24`), que es lo que acredita el instrumento antes de leer nada nuevo.

| causa | n | mecanismo |
|---|---|---|
| **SIN-ORDINAL-EN-EL-MARCADO** | **77** | **76 `et_pb_toggle`** (19 × 4 documentos) **+ 1 `dvmd_table_maker`**. Divi **no numera** los toggles de un acordeón: son hijos de un módulo compuesto |
| **SUFIJO-TRAS-ORDINAL** | **24** | `et_pb_button_0_wrapper` — el `\b` de la llave vieja **no casa antes de `_`**. Es el que la 124.ª ya había derivado |
| **ORDINAL-DE-OTRA-CAPA (`_tb_body`)** | **4** | `et_pb_blog_0_tb_body`, 1 por documento |
| | **105** | **24 + 4 + 77 = 105**, con su control de suma |

**LA TERCERA CAUSA ES UN HALLAZGO Y NO UNA RELAJACIÓN DEL CUBO, y la diferencia
importa:** la primera corrida dejó esos 4 en **`SIN CAUSA`** y **cerró en rojo**
—§regla 6: una llave que no se puede derivar se tira, no se sustituye por un
valor benigno—. La congelada de ese rojo se conserva
(`escalon2-llaves-125-SONDA-TB-BODY-CAIA-EN-SIN-CAUSA-4.*`), porque las
derivaciones **no pasan por la guarda de `w()`** y una corrida de verificación
pisaría a la del diagnóstico. Lo que los saca del cubo no es bajar el listón: es
que **su causa se derivó**, y tiene nombre —

> **El descarte de `_tb_` en la llave es §regla 25: una guarda cuyo dominio es
> más ancho que su invariante.** Existe para dejar fuera el **cascarón**
> (`_tb_header` · `_tb_footer`) y se lleva por delante **`_tb_body`**, que no es
> cascarón sino **el CUERPO de la plantilla del theme builder** — la capa `-T`
> del régimen híbrido `BT`, cuyos nodos **sí** están numerados. La guarda no
> falló en voz alta: **rechazó 4 nodos correctos**.

Y se arregló **añadiendo una tercera llave, no cambiando la que ya tiene
consumidores** (§regla 29, punto 2): tocar `ordMej` habría roto el cruce con la
124.ª, que es justamente lo que acredita esta corrida.

**EL HALLAZGO QUE ATA LOS DOS ESCALONES, y ninguno de los dos lo veía solo:**

> **Los 105 nodos sin llave son, casi exactamente, los módulos que el ESCALÓN 1
> midió como ANIDADOS.** 80 anidados (76 toggles + 4 posts) + 24 wrappers de
> botón + 1 `dvmd_table_maker` = **105**. Dicho al revés: **el constructor sólo
> numera los módulos que el editor colocó**, y lo que queda sin llave es lo que
> **no** colocó él — el interior de un módulo compuesto, el envoltorio que Divi
> añade, y el módulo que pone otra capa.

**Consecuencia para el content type, que es lo que esta fase necesita:** «sin
llave» **no es ruido de la medición** — es un **discriminador servido** entre lo
que el editor compuso y lo que compuso el constructor. Los 77 del acordeón son
**contenido de un solo campo** (`FAQ_ITEMS`, que el clon ya modela así), no 19
bloques del flexible content. Esto **refuerza** la decisión de no escribir el
content type todavía y a la vez **la informa**: la frontera de modelado cae
donde cae el ordinal.

> ⚠ **§regla 33 comprobada, y NO se da:** la señal de una llave que no casa es
> que **los dos lados crezcan JUNTOS con el mismo cardinal**. Medido y publicado
> **suelto, nunca su diferencia**: **solo-1440 = 6 · solo-390 = 0**. Un lado a
> cero **no es esa firma** — son nodos que a 390 pierden la caja porque el
> constructor duplica el módulo y esconde uno por ancho, que es lo que la 124.ª
> ya había medido. Cruza al bit: **6 nodos × 4 ejes = los 24 pares sólo-1440**
> de aquella corrida.

### ✅ ESCALÓN 3 de la 125.ª (2026-08-30) · la base del `rem` es 16 y NO se mueve, así que el hueco de `medida()` es SÓLO el breakpoint

**Lo primero es acotar la pregunta, porque la mitad ya estaba cerrada.** La
124.ª corrió la cascada sobre los 984 pares y adjudicó **269 · 0 sin declaración
ganadora**: **QUIÉN** escribió cada valor está **dicho** por el selector, no
inferido, y los 10 «ciegos relativos al font» salen **CAMPO en los 10** por su
ordinal. Lo que quedaba abierto es otra cosa — **CON QUÉ BASE** —, y es lo que
el PASO 0 de esta tanda dejó *SIN PROBAR con su cardinal (32)*.

> ⚠ **Y de paso corrige el enunciado del encargo, que hablaba de «reserva de
> `em`»: los 10 ciegos son `rem`, NO `em`.** El aviso de este documento sobre
> el `em` del tema es real y aquí **no es el caso que muerde**.

**Instrumento:** `derivaciones/escalon3-bases-125.*`, **5 controles en verde**,
con el que sostiene todo lo demás:

> **CONTROL ARITMÉTICO — `declarado × base == computado`, y cierra 28/28 AL
> BIT.** Sin él, una base mal medida daría un número plausible y falso, que es
> exactamente el modo de fallo de esta familia: se predijo **22 px donde eran
> 16.5** por usar el `font-size` de la hoja en vez del del elemento.

**LO MEDIDO, con la base puesta al lado de cada valor (§«0.5em de un cuerpo de
15» o no se escribe):**

| | resultado |
|---|---|
| base del `rem` (`font-size` del `html`) | **16px** — y **la misma a 1440 y a 390 en los 4 documentos** |
| base de los `em` con ritmo ganador | **17px**, medida **en el elemento**; **constante** entre anchos |
| pares con declaración ganadora en unidad relativa | **28** (`rem` 26 · `em` 2) |
| pares con una regla rival dentro de un `@media` (§regla 35) | **11** |

**EL VEREDICTO, Y SEPARA LAS DOS MITADES DEL HUECO DEL PASO 0:**

> **1 · La UNIDAD `rem` NO hace falta en `medida()`.** Un `rem` se resuelve
> contra el `html`, cuya base **no se mueve con el ancho** en estos 4
> documentos, así que **el px computado es fiel** y guardarlo no pierde nada. La
> reserva que el PASO 0 dejó abierta queda **cerrada en la dirección de «no hace
> falta»** — medida, no supuesta.
>
> **2 · El BREAKPOINT sí hace falta, y ahora tiene número propio.** La misma
> corrida lo enseña con la unidad quieta:
>
> | nodo · eje | @1440 | @390 |
> |---|---|---|
> | `PRODUCTO et_pb_text_4 · marginTop` | `-4rem` = **−64px** | `0rem` = **0px** |
> | `SOFTWARE et_pb_image_1 · marginTop` | `2rem` = **32px** | `1rem` = **16px** |
>
> **Misma unidad, misma base 16, VALOR distinto** — o sea `FN-bp` puro. Un campo
> con una sola posición serviría **−64 a los dos anchos**, donde el original
> sirve **0** a 390.

**LA AMBIGÜEDAD QUE QUEDA ES LATENTE, NO REALIZADA — y se declara en vez de
cablearse:** **12 bases de `em` SÍ cambian con el ancho** (`et_pb_text_1`
50 → 35 · `et_pb_text_3` 15 → 13, y 10 más). **Ninguna de las 12 tiene hoy una
declaración de ritmo ganadora en `em`**, así que no muerde. Pero el mecanismo
está servido: el día que un editor escriba un `padding` en `em` sobre uno de
esos nodos, su px cambiará **sin que nadie lo haya declarado por breakpoint**.
Es la misma forma que el comentario de `ritmoInline` ya describe para el `%` —
*«un `number` no puede expresar el `%` que aparecería en una cuarta instancia, y
lo guardaría como px sin dar error»*— con la unidad cambiada.

> ⚠ **Y el alcance se declara, porque «16» invita a darlo por universal:** la
> base del `rem` es 16 **en estos 4 documentos**. No es una propiedad del sitio,
> y **el customizer de este mismo tema ya ha bajado un tamaño antes** (los 20
> del core servidos como 15). Un quinto arquetipo **re-mide su base**, no la
> hereda de aquí.

### ✅ ESCALÓN 4 de la 125.ª (2026-08-30) · la varianza inter-instancia SÍ es medible, y hay 6 ejes que salen CAMPO por ella

**La incógnita declarada de F3-5 es que «cada uno es singleton o casi»**, de
donde no se sabe qué es plantilla y qué es campo. **Antes de darlo por
imposible** (punto 1 del encargo) se deriva lo que el lote comparte de verdad —
y la respuesta cambia el estado del hueco.

**LA LLAVE NO PODÍA SER EL ORDINAL**, y ahí estaba el bloqueo: `et_pb_text_4` en
PRODUCTO y en CATÁLOGO **no son dos instancias de una pieza**, son dos módulos
distintos. Lo que identifica una pieza es el **marcador SEMÁNTICO** —la clase
CSS personalizada que el editor pone en el módulo—, que es §*el literal de
`className` no discrimina; lo que identifica un módulo es el marcador
semántico*. Y el conjunto **se censa, no se escribe de memoria**.

**Censados: 18 marcadores, de los que 7 tienen ≥2 instancias.**

| marcador | instancias |
|---|---|
| `breadcrumbs` · `bucle-entradas` · `kunak-faq-item` | **4** |
| `menu-anclas` | **3** |
| `iconos-xs-2` · `iconos-md-3` · `modulo-beneficios` | **2** |
| 11 más | **1** — singleton, con su denominador |

> **Así que la varianza inter-instancia NO era inmedible: era inmedible CON LA
> LLAVE QUE SE ESTABA USANDO.** Es §regla 33 en su cara de diseño —una llave
> que no identifica— y §regla 29: el índice construido para una pregunta (cruzar
> anchos) no contesta otra (cruzar documentos).

**EL RESULTADO — 52 pares evaluables (marcador × ancho × eje), 6 con varianza:**

| pieza · eje | PRODUCTO | CATÁLOGO | SOFTWARE | S-corta |
|---|---|---|---|---|
| `menu-anclas` · `marginBottom` @1440 | **31.6719** | `{0, 27.2}` | **27.2** | — |
| `menu-anclas` · `paddingTop` @1440 | **0** | `{0, 17}` | **17** | — |
| `iconos-xs-2` · `marginBottom` @1440 | **31.6719** | — | — | `{0, 31.6719}` |
| `iconos-md-3` · `marginBottom` @1440 | **31.6719** | — | — | `{0, 31.6719}` |

**Y ESTO ATA LOS TRES ESCALONES, que es lo que le da peso:** el `27.2` es
`1.7rem × 16` y el `17` es `1em × 17` — **exactamente los valores que el ESCALÓN
3 midió** sobre `et_pb_text_7` y `et_pb_text_14`. Cruzado **al elemento** y no
al cardinal: `menu-anclas` **es** `et_pb_text_7`+`_13` en CATÁLOGO y
`et_pb_text_14` en SOFTWARE, y en PRODUCTO es `et_pb_text_16`, que trae **el
default**.

> **Leído como decisión de modelo: el editor tocó `menu-anclas` en 2 de sus 3
> instancias y en la tercera lo dejó por defecto.** Eso es **CAMPO** por el test
> B inter-instancia — no por inferencia sobre una sola página, que es
> precisamente lo que la incógnita de esta fase prohibía.

**LO QUE NO SE PUEDE LEER DE MÁS, y son dos:**

1. **los 46 pares SIN VARIANZA no son «plantilla probada»**: son **sin varianza
   en el dominio alcanzable**, que pesa lo mismo que SIN PROBAR y **no se
   cablea**. El listón no es «≥2» (§*ese «≥2» está mal puesto como listón*) sino
   todo el dominio, y aquí el dominio son 4 documentos;
2. **§regla 36 medida y publicada:** el papel del marcador en el selector
   ganador es **`no-aparece` 21 · `sujeto` 3**. O sea que el marcador semántico
   **casi nunca gana la cascada** — el editor lo pone para su propio CSS y Divi
   compila por ordinal. La varianza se mide bien porque se mide **sobre el
   nodo**, no sobre quién declara.

> ⚠ **Y una limitación DEL INSTRUMENTO, con su cardinal (§regla 14):** el
> marcado `data-sem` guarda **una** clase por nodo, así que un nodo con dos
> semánticas pierde la primera. Medido: afecta a **1 marcador de 7
> (`iconos-xs-2`) y a 4 pares de 28** @1440, y **sólo al eje de §regla 36** — la
> varianza no lo usa. No se tapa: se declara.

**VEREDICTO DEL ESCALÓN, que es el que el hueco 4 necesitaba:**

> **El hueco pasa de «no hay con qué medir» a «hay con qué, y ya se midió en 7
> piezas».** No cierra la incógnita de la fase —los 4 documentos siguen siendo 4
> arquetipos, no 4 instancias de uno— pero **la reduce a su tamaño real**: lo
> que comparten sí tiene instancias, y **6 ejes de ritmo ya salen CAMPO por
> varianza medida entre ellas.**

### 🔁 125.ª · CIERRE — los cuatro huecos, con su cardinal, y la decisión que SUBE

**Tanda OFFLINE.** No toca `src/`, no escribe content type, no sale a la red.
Docker se comprobó **antes de gastar nada** (§regla 37) y **está caído**, así
que no hubo `check` — construir no verificaría nada de esta tanda y `next build`
vacía su directorio desde el primer segundo.

| # | hueco | estado al entrar | estado al salir |
|---|---|---|---|
| **1** | eje **`módulos`** | «sin comparar» | **sigue en `·`, y ahora con sus DOS bloqueos derivados**: 35 componentes de 97 (entorno) **y** el criterio de «qué cuenta como un módulo», que no está fijado — **110 · 90 · 83**, tres cardinales ciertos por documento |
| **2** | **105 nodos sin llave** | 24 rescatables, **81 sin explicar** | **CERRADO como reparto**: `24 + 4 + 77`, los tres con mecanismo, con control de suma. Y **atan con el hueco 1**: son casi exactamente los módulos anidados |
| **3** | **las bases** de las unidades relativas | «SIN PROBAR, cardinal 32» | **CERRADO**: base del `rem` = **16px, constante** a los dos anchos, control aritmético **28/28 al bit**. **El hueco de tipo se encoge de dos ejes a UNO** |
| **4** | **varianza inter-instancia** | «no hay con qué medir» | **ABIERTO PERO REDUCIDO**: **7 piezas con ≥2 instancias** y **6 ejes que ya salen CAMPO**. Lo que faltaba no era dominio: era **la llave** |

**LO QUE ESO DEJA PARA LA DECISIÓN, y es lo único que sube:**

> **Los cuatro huecos tienen número. Dos están cerrados, uno se encogió a la
> mitad y el cuarto pasó de imposible a medido en 7 piezas.** La decisión de
> **ESCRIBIR o no el content type** no se toma dentro de la tanda: sube al
> propietario con este reparto delante.

**Las tres salidas, con lo que cada una cuesta:**

1. **escribirlo ya**, con los 6 ejes medidos como campo, los 46 sin varianza
   declarados **SIN PROBAR y no cableados**, y `medida()` ampliada con **una
   posición de breakpoint**;
2. **cerrar antes el hueco 1** —fijar el criterio de módulo y emitir
   `data-modulo` en 35 componentes—, que exige Docker y una tanda que toque
   `src/`;
3. **ampliar antes el dominio del hueco 4**: los 2 vecinos de `monitor` a ≥0.7
   que no están clonados darían varianza inter-instancia **del mismo
   arquetipo**, no sólo de piezas compartidas.

**Lo que esta tanda NO hizo, dicho en vez de omitido:** no tocó HOME (sigue con
su SIN PROBAR irreducible de 3 y **0 de 788** documentos capturados), no capturó
los 3 descifradores de Cloudflare, no abrió los 4 ejes de regresión de
`clon-base` sin negativo, y **no modificó `productos-cmp.mjs`** — una sonda que
hoy no se puede correr no se cambia, porque el cambio se quedaría sin su paso 2.

**Barrido de §regla 12, acotado y con su número** (`derivaciones/regla12-barrido-125.*`,
2 controles en verde): **34 enunciados destacados · 12 ya en `CLAUDE.md` · 19
candidatos por forma**. Aplicado el discriminador real —quitarle la fecha y el
nombre propio— **18 son EVENTOS** y se quedan aquí. **Uno era regla, y es la
mitad que le faltaba a §regla 29**: allí una llave mala **empareja mal** y
produce un dato falso; en su otra cara **no empareja nada**, y ese cero se lee
como una propiedad del objeto — que es como se ficha un **pendiente inventado**
y se para una fase. Escrita en `CLAUDE.md` §regla 29, con esta tanda de
evidencia.

### ✅ 126.ª (2026-08-31) · **SE ESCRIBE EL CONTENT TYPE** — salida 1, con sus SIN PROBAR delante

**Tanda de CONSTRUCCIÓN.** Docker comprobado en TRES pasos **antes de gastar
nada** (§regla 37): demonio 29.6.2 · contenedor `kunak-cms-pg` **EXISTENTE**
arrancado con `docker start`, nunca `compose up` · verificado con **consulta
real** — 138 tablas y las filas derivadas (`entradas_blog` 152 · `articulos_kb`
6 · `casos` 57 · `documentos_cientificos` 23). La base se llama **`kunak_cms`**,
derivada de `pg_database` porque el nombre supuesto no existía.

#### PASO 0 · el criterio de módulo, y el 83 **no era un criterio**

**FIJADO** (ESQUEMA §2n): «un módulo» = nodo `.et_pb_module` del CUERPO que **no
cuelga de otro**, cascarón descontado. **90 · 35 · 70 · 36 = 231.** Los otros
dos cardinales quedan **nombrados con su unidad** y no se sustituyen.

Cruzado PROFUNDIDAD × LLAVE sobre los 311 del DOM, partición que suma en 4/4:
**230** de primer nivel con llave · **1** sin · **4** anidados con llave · **76**
sin. Los 76 son los 19 `et_pb_toggle` × 4 docs — el acordeón, contenido de **un**
campo y no 19 bloques.

> ⚠⚠ **LO QUE NO ESTABA PLANTEADO: EL 83 NO ES UN CRITERIO DE MÓDULO.**
> `productos-cmp` publica `porFila` como `slice(0, min(nO,nC))`, así que deja
> fuera **la última fila del original**: 1 huérfana por documento, **4 de 4**
> (7→6 · 9→8 · 7→6 · 7→6), y cuadra con el `huerfanasO: 4` que la propia
> congelada publica. No son tres criterios: son **DOS criterios de módulo y un
> artefacto del emparejamiento**.

**420 contra 105: DOS UNIDADES, no una corrección.** El número de ejes se **lee
del fuente** de la 123.ª (4 de ritmo), así que **105 NODOS × 4 = 420 PARES**.
Cruzado **al elemento** con las dos congeladas de la 125.ª: 34 · 22 · 27 · 22 en
4/4. Y los dos censos de la 125.ª **no cuentan la misma unidad** —311 módulos
contra 357 nodos que incluyen secciones y filas—, así que cruzarlos por el total
habría dado un desacuerdo inventado.

Instrumento: `derivaciones/paso0-criterio-126.*`, **14 controles**.

#### ESCALÓN 1 · `medida()` gana su tercera posición — y la segunda estaba **mal nombrada**

El hueco era el breakpoint (base **85** · `≤980` **20** · `≤767` **20** frente a
dos posiciones). Y **cuál faltaba se derivó del RENDER, no del nombre del
campo**: los dos consumidores aplican `--*-movil` dentro de
`@media (max-width: 980px)`, así que **`movilValor` ocupa la posición de
TABLET** y la que faltaba es la de **≤767**. Otra instancia de §*escribe el
valor, no la intención*.

Consumidores **derivados antes de tocar**, por los tres canales: **16 llamadas
en 2 ficheros · 4 lectores a mano + el generado · 18 tablas · 165 columnas · 55
grupos**, en dos colecciones **pobladas** (6 y 31 filas). Con eso, **se amplía**.

`unidadDe` deja de mapear a mano: era un ternario de dos ramas, y con la tercera
posición habría bautizado su unidad `movilUnidad`, **colisionando en silencio**.
Es la regla que esta tanda sube a `CLAUDE.md`.

**Migración con reversa probada ANTES de sembrar, TABLA A TABLA:** 110 ADD / 110
DROP · 55 CREATE TYPE / 55 DROP TYPE · `down` con `diff` **vacío** en las 138
tablas · 0 tipos huérfanos · filas intactas. Y el aviso de §regla 30 se cobró en
vivo: la consola dijo **«25 migration(s)»** y revirtió **una** — el veredicto lo
dio `payload_migrations`.

**Guarda nueva:** `qa:medida-bp` (8 controles) con su negativo de **5 casos,
control incluido**. `medida()` llevaba desde que existe **sin ninguna sonda que
leyera su forma**.

#### ESCALÓN 2 · el content type (ESQUEMA §2o)

Colección **`arquetipos`**: 3 valores de discriminante (`/kunak-api` **no
estrena arquetipo**), 11 tipos de bloque, `bloques` **required** porque los 4
documentos traen 231 módulos y **0 vacíos**.

**Colección propia y no `paginas`, decidido CONTANDO:** la unión de `paginas` ya
expresa **8 de 11 tipos y 228 de 231 instancias (98.7 %)**, y aun así se separa
—con la operación escrita: deshacer «dos» es FUSIONAR, el lado barato— **y con
su CONDICIÓN DE REAPERTURA con número**.

> ⚠⚠ **Y EL CENSO DE TIPOS LLEGÓ CON UN SOBRE-CASADO QUE HABRÍA INVERTIDO EL
> VEREDICTO.** Derivar el tipo de *la primera clase desnuda* toma MODIFICADORES
> por tipos: `et_pb_with_border` sobre un `et_pb_text` (×3), `et_pb_promo` donde
> el ordinal dice `et_pb_cta`, `et_pb_button_module_wrapper` donde dice
> `et_pb_button` (×24). Publicaba **86.6 % y «colección propia»**; por el
> ORDINAL sale **98.7 % y «reutilizar»**. Lo delató que *«con borde»* no es un
> tipo de módulo.

**El ritmo, con los tres cardinales y cada uno con su unidad:** **6 / 46** en
marcador × ancho × eje · **4 / 24** en marcador × eje · **2 / 2 por eje** (`mb`
y `pt` campo; `mt` y `pb` **SIN PROBAR**). Los 6 entran con su varianza citada
—pieza, ancho, eje, n y valores—; los 46 salen **SIN PROBAR y no cableados**, en
la misma frase que el cierre.

**`down` generado que NO revertía**, cazado por §regla 30: `DROP TABLE … CASCADE`
antes del `DROP CONSTRAINT` de la FK que ese mismo CASCADE ya se lleva ⇒ **exit
1 y CERO revertido**. Con `IF EXISTS`: `diff` vacío, 0 tipos huérfanos.

**Límite de modelado derivado, no sufrido:** el slug de un bloque tiene un
presupuesto de **18 caracteres** (63 − 23 − 22), y `migrate:create` **falla en
voz alta** al pasarlo.

#### ESCALÓN 3 · sembrar y adjudicar

**Build FUERA** (`NEXT_DIST_DIR=.next-126`), exit 0, **promoción por rename** —
y la comparación **antes** de promocionar, no después: **diferencia simétrica de
las rutas emitidas** contra la base, `429 = 429`, **0 desaparecen · 0
aparecen**. La colección nueva no mueve una ruta, que es lo que tiene que pasar
con 0 filas y 0 lectores.

| guarda | resultado |
|---|---|
| `qa:manifiesto` | **426 rutas · 25 familias · 0 vacías · 0 desaparecidas** |
| `qa:productos-cmp` @1440 | `EXIT 4 · 43 ejes` — **idéntica a la congelada salvo `meta.fecha`** |
| `qa:productos-cmp` @390 | `EXIT 4 · 49 ejes` — **idéntica a la congelada salvo `meta.fecha`** |
| `clon-base` @1440 vs t121 | **426 de 426 · 0 con regresión · umbral CERO** |
| `clon-base` @390 vs t121 | **426 de 426 · 0 con regresión · umbral CERO** |
| `npm run check` entero | **exit 0** — lint · typecheck ×3 · build · manifiesto · slugs · cms-campos · **medida-bp** |

> ⚠⚠ **EL `EXIT 4` NO ES UNA REGRESIÓN, Y NO LO DICE EL CARDINAL: LO DICE LA
> COMPARACIÓN AL BYTE.** `43` y `49` son los mismos que la congelada de la
> 123.ª, y un cardinal igual **no prueba que los conjuntos sean el mismo**
> (§*un cardinal es un contenedor y absorbe la membresía*). Quien lo adjudicó
> fue **`w()`**, que compara el contenido antes de decidir si pisa y dijo
> *«idéntica a la congelada salvo `meta.fecha` — no se reescribe»*. O sea que
> los 43 son exactamente los 43, **elemento a elemento**, y esta tanda es
> **NO-OP sobre la fidelidad de los cuatro arquetipos**.

> ⚠ **Y LO QUE `clon-base` NO PUEDE DECIR, dicho aquí en vez de omitido:** es
> **clon contra clon**. Su `426 de 426` significa *«no hay regresión respecto de
> la 121.ª»*, nunca *«el clon casa con el original»*. **La fidelidad la da
> `productos-cmp`**, que es el único de los dos con el original delante —
> §*una guarda solo-clon se lee como verde y no mide fidelidad*.

**§regla 20 · el entorno.** Nada reseteó la DB, y se comprobó **durante** la
corrida y no sólo al final: `entradas_blog` 152 · `articulos_kb` 6 · `casos` 57 ·
`paginas` 31 · `arquetipos` 0 · **26 migraciones**.

> ⚠ **Y un coste NO DOCUMENTADO de la convención de build fuera, con su
> cardinal:** `NEXT_DIST_DIR` hace que el build **añada su directorio al
> `include` de `apps/web/tsconfig.json`**, y eso no lo limpia nadie. Hoy: **14
> directorios distintos, de los que 11 están MUERTOS**. Es inocuo —TypeScript
> tolera un glob que no resuelve— pero es una lista que **crece por efecto
> secundario**, y el día que alguien recree uno de esos nombres sus tipos entran
> solos. Fichado en `PENDIENTES-QA.md`; no se limpia aquí porque tocar la
> entrada del build con una sonda en vuelo es exactamente lo que §regla 18
> prohíbe.

#### CIERRE · el estado de F3-5, y la condición de reapertura **medida**

**F3-5 pasa a: content type ESCRITO — la primera mitad de su «hecho».** Lo que
queda abierto, con su cardinal, en `PENDIENTES-QA.md` §126.ª: `valor767` sin
cablear (**0 consumidores**) · los **46** SIN PROBAR · `arquetipos` con **0
filas y 0 lectores** · el eje `módulos` en `·` (**35 componentes de 97**) ·
**11 de 14** entradas muertas en el `tsconfig` · **HOME** (3 SIN PROBAR
irreducibles, 0 de 788 capturados).

> ✏️ **ACTUALIZADO 2026-08-31 (131.ª) — y el estado de `arquetipos` sigue siendo
> «0 filas · 0 lectores», con un motivo NUEVO y medido.**
>
> La 131.ª escribió el **extractor** (`cms:extractor-f35`, negativo **5/5 +
> control**), que produce las **4 filas con sus 231 módulos** reproduciendo el
> `porDoc` de la 126.ª al bit (90 · 35 · 70 · 36). Lo que **no** se hizo es
> sembrarlas, y no por alcance: **el censo del campo rico las bloquea**.
>
> **El denominador se derivó recorriendo LOS CUATRO ejes de `validaHtmlCorpus`
> en UNA corrida**, en vez de re-correr el sembrador hasta que dejara de morir
> (§regla 27) — y los ceros van con su denominador:
>
> | eje | bloqueos | denominador |
> |---|---|---|
> | `script` | **0** | 199 campos HTML |
> | `etiqueta` | **11** | 199 |
> | `host` | **0** | 199 |
> | `atributo` | **11** | 199 |
>
> **22 bloqueos · 30 tokens distintos · 5 clases · 0 SIN CLASIFICAR**, y la
> clase mayor es **formulario (9 tokens)** — que es exactamente la que
> `CLAUDE.md` declara **ausente** en el dominio del censo (*«código, `dl`,
> formularios: ausentes en las 209»*). O sea §*una regla derivada sobre un
> dominio donde el caso NO SE DA está SIN PROBAR para ese caso*, con el censo de
> **43 etiquetas / 81 atributos** ejercitado fuera de donde se midió.
>
> **Ampliar una whitelist de seguridad con `<form action method>` y
> `data-sitekey` es una DECISIÓN DE ESQUEMA con su propio análisis**, y el censo
> mismo lo dice: *«se admite AÑADIÉNDOLA al censo con su evidencia, no
> colándola»*. Es la precondición de la siembra, fichada en `ESQUEMA-CMS.md`
> §2o.5. Derivación: `derivaciones/bloqueos-f35-131.{mjs,log}`.

> ✏️ **ACTUALIZADO 2026-09-01 (132.ª) — el estado de F3-5 sigue siendo el mismo,
> y ahora la precondición está DECIDIBLE en vez de sólo fichada.**
>
> **Lo que NO cambia:** `arquetipos` a **0 filas · 0 lectores**; el sembrador
> escrito y su negativo verde; la siembra parada. **No se sembró, no se cableó y
> no se construyó**: la 132.ª es OFFLINE por encargo.
>
> **Lo que cambia, y son tres cosas medidas:**
>
> 1. **el bloqueo se encoge a UN campo.** Admitir las cuatro clases inertes deja
>    **2 bloqueos de 22** —diferencia simétrica **DESAPARECEN 20 · APARECEN 0**—
>    y los dos son del **mismo** `monitor-calidad-aire · codigo-arq.contenido`.
>    Los otros **3 documentos de 4 entran limpios**;
> 2. **el alcance del censo está medido, y vale para las CINCO clases**, no sólo
>    para `formulario`: **43 de 43 tokens con cero apariciones** en el dominio
>    donde la regla se derivó, cada eje contra SU censo y **auditado con 8
>    testigos vivos** (§sondas 4: un 100 % redondo es antes sospecha del
>    instrumento que dato). El censo **no excluyó estas clases: no las conocía**;
> 3. **eran 43 tokens, no 30.** `extractor-f35` congela `hit.slice(0, 6)` y tres
>    bloqueos estaban **EN el tope**; **8 de los 13 ocultos son de formulario**.
>    El reparto de 5 clases y el `0 SIN CLASIFICAR` aguantan — lo que estaba
>    subestimado en más del doble es el cardinal de la clase que decide.
>
> **La decisión queda planteada como `CMS-6`** en `ESQUEMA-CMS.md` §2o.9, con sus
> cinco opciones, su coste, **su reversa NOMBRADA** (§regla 23: *ampliar es
> barato, restringir es caro*) y lo que el expediente no contesta. **PENDIENTE
> DEL PROPIETARIO**: la tanda describe, no elige.
>
> ⚠ **Y la referencia de arriba a `ESQUEMA-CMS.md` §2o.5 es la que la 131.ª
> escribió; la ficha vive en §2o.8**, y la decisión nueva en **§2o.9**.
>
> Acta: `PENDIENTES-QA.md` §132.ª. Derivaciones:
> `derivaciones/{paso0,clases,fichas}-132.{mjs,log,json}`.

> ⚠⚠ **LA CONDICIÓN DE REAPERTURA NO EXIGE CLONAR, y eso salió de enumerar las
> separadoras en vez de copiar la primera.** El encargo la enunció *«si se
> clonan los 2 vecinos de `monitor` a ≥0.7…»*. Derivado
> (`derivaciones/reapertura-f35-126.*`, 6 controles): los dos vecinos son
> `estacion-de-monitoreo-de-calidad-del-aire` (**0.8**) y
> `sensor-de-calidad-del-aire` (**0.7**), están **sin clonar** y su HTML **ya
> está capturado**. Y **la varianza inter-instancia es una propiedad DEL
> ORIGINAL**, no del clon.
>
> ⇒ **No es un si-condicional: es una MEDICIÓN pendiente, y se puede correr
> hoy.** Con un dominio **mayor** que el que tuvo el lote: **21 marcadores
> semánticos** en los 3 documentos de la familia PRODUCTO, **18 en ≥2** y **9 en
> los tres** — contra **7 con ≥2 instancias** en el lote de 4 arquetipos
> *distintos*.
>
> ⚠ **Alcance declarado:** esa derivación **no mide la varianza** —eso exige
> navegador y geometría— ni dice si los marcadores compartidos traen valores
> distintos. Contesta si el dominio **existe** y cuánto mide.

**Barrido de §regla 12, acotado y con su número:** **41** enunciados destacados ·
**15** ya en `CLAUDE.md` · **22** candidatos por forma. Aplicado el discriminador
real, los 22 son **eventos o instancias de reglas que ya están**.

> **UNA ERA REGLA, y el detector de forma NO PODÍA VERLA** porque vive en el
> CÓDIGO y no en prosa destacada: *un mapeo con rama `else` es un conjunto
> enumerado de DOS, y al llegar el tercero el `else` le pone el nombre del
> segundo*. Subida a `CLAUDE.md` §regla 9 (7.º caso), **con la limitación del
> propio barrido**: su «0 candidatos» es cierto de la **prosa**, no del repo.

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

> ✅ **ACTUALIZACIÓN 2026-08-24 (102.ª tanda) — LA HOJA EXISTE Y SUS NÚMEROS
> ESTÁN DERIVADOS. LA EMISIÓN SIGUE SIN HACERSE, Y ES LA DECISIÓN DEL
> PROPIETARIO, NO UN BLOQUEO NUEVO.**
>
> **Rutas 382, sin cambio por TERCERA tanda consecutiva.** Esta tanda no emite
> ninguna ruta: construye el instrumento que faltaba y escribe la hoja.
>
> ### Lo que cerró, y el canal que lo hizo posible
>
> El corte de la 101.ª decía que el ritmo de sección y fila **no era derivable**
> porque la congelada de `f33-geo` trae el valor computado. **Cierto de esa
> congelada y falso del repo** — que es exactamente la forma que el encargo
> mandaba comprobar antes de darlo por bueno. Las dos direcciones, con su número:
>
> | canal | ¿separa «dato» de «plantilla»? |
> |---|---|
> | el DATO del CMS (`f33-extraido`) | ⛔ **no puede**: el extractor no emite geometría a propósito — **313 de 313 omiten, 0 declaran** ⇒ 0 separadoras POR CONSTRUCCIÓN |
> | `mbPorDefecto()` + `anchoDeFilaPorRegimen` | **no hacía falta** (ver abajo) |
> | **la CASCADA del original** | ✅ **sí** — **297 de 570 nodos** llevan override ganador del editor |
>
> **Divi no escribe marcado: COMPILA CSS.** `qa:f33-clases` lee la cascada por
> CDP, calcula qué regla GANA cada propiedad en cada nodo, y deriva el default de
> los que llegan a la regla genérica del tema.
>
> ### El resultado, en la unidad del «17» con que se abrió §F3-3-SIN-HOJA
>
> | | antes (101.ª) | después |
> |---|---|---|
> | clases inertes (unidad TOKEN) | **17 de 17** | **8 de 17** |
> | familias de variables inertes | **5 de 5** | **2 de 5** |
>
> Y las 8 que quedan **no están inertes por descuido**: cada una con su razón
> derivada (ejes SIN ESCRIBIR, o piel — que esta sonda no mide).
>
> ### Los dos hallazgos que salen fuera de este arquetipo
>
> | # | hallazgo | ficha |
> |---|---|---|
> | **1** | **el lado de 390 de `qa:f33-geo` se midió SIN las hojas enlazadas.** `setViewport({isMobile})` RECARGA, y la recarga vuelve al fichero crudo: **6 de 6 rutas difieren**, fila **249.594** contra **335.391**. No falla — sale PLAUSIBLE | ⚠ **§F3-3-GEO-390-SIN-HOJAS-ENLAZADAS** |
> | **2** | **el `mb` del módulo NO necesita el ancho de fila**: la regla servida es un `%` de la COLUMNA. Retira el único consumidor que se le atribuía al régimen dentro del cuerpo — CMS-5 **no se reabre**, su razón sigue siendo el CASCARÓN | ✅ `ESQUEMA §2j.9` |
>
> ### Lo que sigue parando la emisión
>
> **Nada nuevo, y no es un bloqueo técnico: es el orden que el propietario
> decidió.** La hoja está escrita y `qa:f33-cmp` sigue a **0 ejes comparados**
> porque no hay lado del clon que comparar. Lo que la 101.ª puso como condición
> —*«emitir sin hoja congelaría una línea base sin maquetar»*— **ya no aplica**.
>
> ---
>
> ⛔⛔ **ACTUALIZACIÓN 2026-08-24 (101.ª tanda) — LA EMISIÓN SIGUE SIN HACERSE, Y
> POR LA OTRA MITAD DEL MISMO ARQUETIPO: CORTE LIMPIO 1 DISPARÓ EN EL PASO 0.
> `CuerpoPagina.tsx` NO TIENE HOJA, así que su ritmo, su retícula y su ancho son
> INERTES.**
>
> **Rutas 382, sin cambio por segunda tanda consecutiva.** El pre-registro
> **382 → 413 se RE-DERIVÓ** como el encargo pedía —no se supuso— y sale
> **idéntico**: reparto por plano `19 · 4 · 4 · 3 · 1 = 31` desde
> `f33-rutas.json`. **R1 no cambió el recuento**, y ahora eso está comprobado.
>
> ### Lo que encontró el PASO 0, que el encargo declara *barato y
> no-verificación* — y lo es: dos `grep`, sin gastar un build
>
> | # | hallazgo | estado |
> |---|---|---|
> | **1** | **`qa:f33-cmp` no habría visto NI UN módulo del clon.** Cuenta los dos lados con `[class*='et_pb_module'], [data-modulo]` y `.et_pb_section, [data-seccion]`; el componente emitía `f33-modulo`/`f33-seccion`. Habría publicado **`nModulos 313 → 10`** y **`nSecciones 86 → 0`** con el render **correcto** | ✅ **arreglado** (`data-modulo`/`data-seccion`) |
> | **2** | **No existe `f33.css`.** 17 clases y 5 familias de variables emitidas · **0 reglas** en las cuatro hojas del clon | ⛔ **§F3-3-SIN-HOJA** |
> | **3** | **7 huecos de forma** medidos contra el HTML servido (`et_pb_text_inner` 151/151 · `et_pb_blurb_content` 22/22 · `et_pb_code_inner` 9/9 · `et_pb_image_wrap` 53/71 · `et_pb_icon_wrap` 3/3), y **un campo de alineación del botón** que el modelo no tiene (11 de 13) | ⚠ **§F3-3-MARCADO-INTERIOR** |
>
> **El 1 es el que justifica que el PASO 0 exista**, y es el defecto de KB
> **leído al revés**: allí el render no pintaba y el comparador lo cazó; aquí el
> render pinta y el comparador no sabe verlo. Los dos se leen igual desde fuera
> —`orig N → clon 0`— y el segundo manda a arreglar lo que está bien. Su
> negativo no podía cazarlo: el caso `mismo-lado` copia el lado del original
> sobre el del clon, así que esos selectores tenían **0 instancias separadoras**.
>
> ### Por qué esto PARA la emisión, y es el argumento de la 99.ª aplicado a la otra mitad
>
> La 99.ª no degradó la emisión al cascarón equivocado porque *«el arreglo
> posterior se leería como REGRESIÓN contra una línea base construida sobre el
> cascarón equivocado — una FAMILIA DE CALIBRACIÓN fabricada a mano»*. **Ese
> argumento vale igual para la hoja del cuerpo**, y con el mismo mecanismo:
> emitir hoy congelaría una línea base de 31 páginas **sin ritmo ni retícula**, y
> el día que llegue la hoja **todo se movería y se leería como regresión**.
>
> Y `f33-cmp` volvería a quedar sin poder adjudicar en la mitad de sus ejes:
>
> | eje | ¿lo invalida la hoja ausente? |
> |---|---|
> | `nSecciones` · `nFilas` · `nModulos` · `enlaces` | **no** — son recuentos de nodos |
> | `docH` · `base` | **sí** — son geometría, y **3 de las 5 familias de variables** del componente (las del RITMO) siguen sin números |
>
> ### Lo que la tanda siguiente NO tiene que volver a descubrir
>
> Derivado y congelado: `derivaciones/hoja-f33-derivable.{mjs,log}`. **La
> RETÍCULA ya está medida** —6 repartos × 2 anchos, varianza cero salvo la
> cuantización a 1/64 px del `1_2`; a **390 los seis apilan al 100 %**— y el
> default de `mb` también (34.05 / 25.06). Lo que falta es **el RITMO por
> defecto de sección y fila**, y su instrumento tiene nombre: **`qa:f33-clases`**,
> el equivalente de `qa:kb-clases` —*«lo deriva de los nodos cuyo DATO omite la
> propiedad»*—, que **no existe**.
>
> > **Es §*UN ARQUETIPO NUEVO NO HEREDA COBERTURA* con el objeto cambiado:** allí
> > lo que faltaba era el comparador, aquí la sonda que da los defaults de
> > plantilla. Las dos veces el error sería el mismo — dar por hecha una fase que
> > nadie hizo.

> ⛔ **ACTUALIZACIÓN 2026-08-24 (99.ª tanda) — LA EMISIÓN NO SE HACE, Y NO POR
> FALTA DE TRABAJO: CORTE LIMPIO 2 DISPARÓ EN EL CASCARÓN. El clon no puede
> elegir el suyo en 30 de 31 páginas.**
>
> **Rutas 382, sin cambio.** El pre-registro dice **413** y se queda escrito y
> commiteado **sin cobrar**, que es como tiene que quedarse un pre-registro cuya
> precondición no se cumplió.
>
> ### 1 · El hallazgo, y por qué para en vez de degradar
>
> El régimen decide **qué cascarón lleva la página**, y **los dos ya existen
> medidos** —`B-` es el de SECTOR/MONOGRÁFICO (fila **1238.39**), `BT` es el de
> `articulos-kb` (fila **911.75** con columna `1_4` de barra)—. Lo que falta no
> es construirlos: es **el campo que elige entre ellos**.
>
> | candidato | acierta | veredicto |
> |---|---|---|
> | `cuerpoClasico` presente ⇒ `--` | **31/31** | ✅ el régimen `--` **sí** es derivable |
> | la RUTA (`centro-de-ayuda` ⇒ BT) | 30/31 | ❌ **REFUTADO** por 2 separadoras, una por dirección |
> | cualquier campo del documento | — | ❌ **52 pares** de régimen distinto **indistinguibles** |
>
> **30 de 31 no es «casi bien»: es refutado**, y las separadoras son
> `/sistema-interno-de-informacion` (**raíz y BT**) y
> `/soporte/servicio-de-reparacion` (**bajo `soporte` y B-**). Derivado:
> `derivaciones/f33-regimen-discriminador.{mjs,log}`.
>
> **Y no se degrada a «emitir todas con el cascarón B- y arreglar la barra
> después»** por tres razones con número: son **326.64 px** de ancho de cuerpo
> en 8 páginas; el arreglo posterior se leería como **regresión** contra una
> línea base construida sobre el cascarón equivocado —una FAMILIA DE CALIBRACIÓN
> fabricada a mano—; y `f33-cmp` quedaría **sin poder adjudicar**, porque un Δ
> tendría tres causas simultáneas y ninguna medida las separa.
>
> **Sube al propietario con sus tres salidas** (R1 campo derivado del `<body>`
> que el extractor ya calcula · R2 emitir **sólo lo derivable hoy, que es 1** ·
> R3 cablear la ruta, que
> es el arreglo falso y se nombra para que conste): `PENDIENTES-QA.md`
> §F3-3-CASCARON-SIN-DISCRIMINADOR.
>
> ### 2 · Lo que SÍ queda hecho y no hay que rehacer
>
> | | |
> |---|---|
> | **el PRE-REGISTRO de rutas** | **382 → 413**, derivado y **con su reparto por plano** (19 · 4 · 4 · 3 · 1), commiteado **antes** de construir. Contesta las tres preguntas de las que depende el total, incluida la que produjo el «374 → 375»: **ninguna familia repagina**, porque nadie en `apps/web` lee `paginas` |
> | **el RENDERIZADOR de los 11 tipos** | escrito desde el esquema medido y **compilando** (`npm run check` exit 0), **sin cablear a ninguna ruta** y con la razón al lado. `switch` con `default` que **TIRA** —el hueco que sirvió 6 páginas de KB con cero módulos— y **cero geometría emitida**, que es lo que el extractor garantiza en el otro extremo |
> | **los 4 tipos que no se pintan** | **34 módulos de 313 · 7 rutas de 31**, con **las razones separadas**: `video` es NO MEDIBLE (30 instancias, **0 con caja**, todas en desplegables cerrados) y `slider-completo`/`slider`/`mapa` son n ≤ 2. §F3-3-CUATRO-SIN-CABLEAR |
> | **la línea base de `clon-base`** | refrescada a **382 rutas** a los dos anchos. La que había era de **2026-08-14 y 345 rutas**: la tanda que extienda los catch-all necesitaba una vigente y ahora la tiene |
>
> ### 3 · El PASO 0, que encontró lo que la 98.ª mandó buscar
>
> De los **32 de 79** negativos que `qa:negativos` no corre —**derivado hoy**, la
> 98.ª decía 31 de 78— se corrieron los **6** que están debajo de esta tanda.
> Uno rojo: **`cms-slugs` llevaba sin poder ejercitarse desde el 2026-08-13**,
> con dos fixtures caducados contra el esquema (§regla 5ter).
>
> **Los invariantes 3 y 4 no estaban fallando: estaban SIN EJERCITAR** — el alta
> moría en la validación antes de llegar a la guarda. Y se llevó por delante a
> su propio negativo **en las dos direcciones**: `sin-hook` en ROJO (el
> invariante 2 caía por el campo ausente, o sea pasaba por el motivo equivocado,
> y con eso la guarda de colisión **no se podía demostrar portante**) y
> `fuera-plano` en VERDE **gratis** (0 separadoras). **2/4 → 4/4.**
>
> ⚠ Es la **segunda** instancia de la clase que la 98.ª estrenó con `sondeo.neg`,
> y la causa es estructural: mientras no exista corredor para los de DB y los de
> navegador, **«rojo» y «no ejecutado» siguen dando la misma salida** para 32 de
> 79. Los otros **26** siguen SIN MEDIR.
>
> ### 4 · §regla 20 cobrada otra vez, y esta vez con RUTAS
>
> El `cms-roundtrip-neg` del PASO 0 **resetea la DB**, y la 98.ª ya lo había
> escrito. Lo que se añade hoy es **cuánto cuesta y en qué unidad**: el build
> siguiente emitió **376 rutas en vez de 382**, y el diff no es «faltan 6» —
> es **17 desaparecidas y 11 nuevas**, porque sin el término `articulos` de
> `categorias-recursos` (lo escribe `cms:seed-listados`, que el round-trip no
> corre) **todas las rutas de esa familia pierden un segmento**:
> `/recursos/articulos/contaminacion-minera` → `/recursos/contaminacion-minera`.
>
> > **Un neto de −6 escondía 28 rutas movidas**, que es §*un cardinal es un
> > contenedor y absorbe la membresía* en su forma más barata de cazar: la
> > diferencia simétrica, no el total.
>
> Restaurado con el pipeline completo (`cms:reset` + `cms:seed` **383 docs / 14
> colecciones** + `cms:seed-listados` 88/88 + `cms:seed-kb` 6/6) y reconstruido:
> **382 rutas, diferencia simétrica 0 y 0** contra la línea base. O sea que el
> susto era del entorno y **no del código de esta tanda** — y así se demuestra,
> no se argumenta.
>
> ### 5 · Lo que esta tanda NO tocó, y hay que decirlo
>
> `f33-cmp` **sigue sin haber comparado nada** y por tanto **no se registra en
> `qa:cobertura`**: sus congeladas de hoy siguen siendo los CONTROLES de su
> negativo, donde el «clon» es una copia del original. *«El comparador existe»* y
> *«no se ha comparado nada»* son las dos ciertas, **y gobierna la segunda**.

> ✅ **ACTUALIZACIÓN 2026-08-23 (98.ª tanda) — `paginas` SEMBRADA: 31 documentos
> en la DB y round-trip 383/383. Las tres decisiones del propietario, aplicadas
> y escritas.**
>
> **Rutas 382, sin cambio: esta tanda siembra, NO emite.** La emisión (CMS-4 /
> E1) sigue siendo la siguiente, y con ella la plantilla y la ruta.
>
> ### 1 · Las tres decisiones (D1 · D2 · D3), con lo que cada una dejó medido
>
> | | qué se decidió | dónde vive | qué quedó |
> |---|---|---|---|
> | **D1** | `data-teams` → **T11**, transformación de importación; `ATRIBUTOS_CENSADOS` **NO se amplía** | `ESQUEMA` §3.2d | NO-OP medido **por identidad de bytes**: 1 de 788 ficheros tocado, **787 idénticos**, 6 controles sintéticos |
> | **D2** | el `<img>` de `upload.wikimedia.org` **se deja ABSOLUTO** | `ESQUEMA` §2j.7 | `imagen-pagina.srcExterno` + `validaOrigenImagen` (exactamente uno). **70 local · 1 externo = 71** |
> | **D3** | `1_5` **y** `1_6` en la retícula, una migración versionada | `ESQUEMA` §2j.7 | `1_5` ×10 **ejercitado**; `1_6` **SIN EJERCITAR con su denominador** (0 de 313 módulos, 0 de 113 filas) |
>
> **La reversa se probó ANTES de sembrar, que es la única ventana en la que la
> pregunta tiene respuesta** — el `down` hace `src_id SET NOT NULL` y con el
> documento externo dentro fallaría. `3333 → 3334 → 3333` filas en 80 tablas,
> con el censo **tabla a tabla idéntico línea a línea**, y 19 migraciones en
> batch 1 antes y después.
>
> ### 2 · Lo que la siembra destapó — 133 diferencias, CUATRO causas, 0 decisiones nuevas
>
> La primera corrida del round-trip dio **352 de 383**, y el titular es
> engañoso: **29 documentos, 4 causas**, ninguna de modelo.
>
> | causa | n | de quién |
> |---|---|---|
> | la **LLAVE** (`ids.get(slug)` empareja con otro documento) | **53** | instrumento — `paginas` es la 1.ª con `prefijo`: **29 slugs para 31 documentos** |
> | **lista vacía** `(ausente)` ↔ `[]` | **63** | esquema — faltaban 3 `vaciaEsAusente`, y **`qa:cms-decl` las nombró una a una** |
> | **`toggle.nivel: 5`** = el defecto escrito explícito | **8** | extractor — `conDefecto` anula lo igual al defecto |
> | **`piel`** con `defaultValue` **sin** `conDefecto` | **9** | esquema — media pieza del patrón |
>
> **Resultado: 383/383 IDÉNTICOS.** Y de paso **uno de los 9 rojos** del censo de
> negativos (`cms-decl`) cierra por su motivo, no por mantenimiento.
>
> ### 3 · Instrumento nuevo: `qa:f33-membresia` (negativo 3/3)
>
> **Diferencia simétrica 0 y 0 sobre 31**, con los dos lados nombrados, más los
> tres huecos de geometría comprobados **sobre lo que la DB devuelve** (0 claves
> con valor). Su sabotaje `cardinal` **mueve un elemento por lado dejando los
> cardinales intactos**: sin esa instancia separadora, la sonda sería un `31 ===
> 31` con otro nombre.
>
> ⚠ Y llegó con un defecto propio, cazado por **contradecir una medida buena
> anterior**: su predicado `hayValor` miraba un solo nivel y contó **299** claves
> de geometría —Payload devuelve `ritmo` poblado de nulos—. Corregido a
> recursivo, con un control de 4 casos dentro.
>
> ▸ **REGLAS NUEVAS (`CLAUDE.md` §29 y §30), las dos pagadas aquí:**
> **(29)** *un índice construido para una pregunta no contesta otra — y cuando
> su llave deja de identificar no da error: empareja mal*;
> **(30)** *una migración que RELAJA una restricción tiene una reversa con fecha
> de caducidad: se prueba antes de que entre el dato*.
>
> ▸ ⚠ **Y un DÉCIMO rojo, que no es de esta tanda ni de la 97.ª:** `sondeo.neg`
> llevaba rojo **desde el 2026-08-13** con un `46` cableado, y no se veía porque
> el tope de `qa:negativos` se agota antes de llegar a su grupo (**47 corridos de
> 78**). Arreglado **derivando** el denominador, no poniendo el de hoy. Cuántos
> de los 31 no ejecutados están igual: **SIN MEDIR**.

> ✅ **ACTUALIZACIÓN 2026-08-21 (89.ª tanda) — LA BARRA LATERAL, COMPARADA DE
> DOS LADOS POR PRIMERA VEZ: Δ0 EN LAS 3 FORMAS QUE LA SIRVEN Y EN LOS 2 ANCHOS.**
>
> **Rutas 382, sin cambio: esta tanda no construye, corrige.** Lo que estaba
> pendiente del ESCALÓN 2 de la 88.ª —`#sidebar` a `−75.80 @390`— resultó ser un
> caso de §*UN ARQUETIPO NUEVO NO HEREDA COBERTURA* con el instrumento que
> faltaba: la barra tenía su **marcado** censado (`lh-barra`, un lado, 80/149) y
> **ni un píxel** contra el original.
>
> **Instrumento nuevo:** `qa:barra-cmp` (dos lados, widget a widget, negativo
> 5/5). **Resultado: 234 pares distintos → 0**, 918 caminos por ancho, 36/36
> piezas leídas en los dos lados.
>
> | forma | @1440 | @390 | después |
> |---|---|---|---|
> | `L1` (blog · etiqueta) | **−82.80** | **−78.80** | **Δ0** |
> | `L2` (glosario) | **−57.80** | **−75.80** | **Δ0** |
>
> **Y la corrección de alcance que sale de aquí, que sí toca al plan:** `L1`
> tiene **tres** variantes y sólo **dos** sirven barra —`resources` **0 de 37**—,
> así que los «80 documentos con una sola firma» son **80 de 117**. El clon ya
> ramificaba; lo que estaba sin denominador era la frase.
>
> ▸ **REGLAS NUEVAS (`CLAUDE.md`), las cuatro pagadas aquí:**
> **(1)** *transcribir la DECLARACIÓN servida no es transcribir la CASCADA* — la
> 88.ª leyó bien `#sidebar .et_pb_widget{margin-bottom:30px}` y el valor real es
> **32**, porque el tema sirve `.et_pb_widget{margin-bottom:2rem !important}`;
> **(2)** *un `em` citado sin su `font-size` es la trampa del `%` sin su
> contenedor* — el pre-registro predijo 22 px usando el `font-size:20px` de Divi
> y el customizer lo baja a **15**;
> **(3)** *una regla en el nivel equivocado no da error* — el clon tenía un
> `:last-child{mb:0}` sobre el widget, donde el original no lo tiene, y le
> faltaba sobre el `li`, donde sí;
> **(4)** *un caso de negativo puede morirse VERDE* el día que se arregla el
> objeto — `sin-diferencias` dejó de discriminar y se sustituyó por su simétrico.
>
> ▸ ⚠ **Y el PASO 0 NO salió gratis, tras tres tandas seguidas que sí:**
> `ed5517a` tocó `tema.css` **después** de congelar `clon-base-*-t88-despues`
> *(90.ª: renombrada a `…-CADUCADA-glosario-8-de-382-pre-ed5517a.json`)*.
> Todo el diff está bajo `.lh-cpt`, que lo escribe un solo sitio, así que la base
> queda **caducada para las 8 rutas de `/glosario` y vigente para las otras 374**.

> ✅ **ACTUALIZACIÓN 2026-08-20 (88.ª tanda) — `L2-glosario` CONSTRUIDA. Tres
> tandas de aplazamiento se cierran, y el hilo del pie con ellas.**
>
> Rutas **374 → 382** (`/glosario` + `/glosario/page/2..8`). El cardinal salió
> del canal SIN recortar —`span.pages` = «Page 1 of 8» y 37 tarjetas en las 8
> capturas—, no del espejo, que congela `cards.slice(0,3)`.
>
> ### 1 · La piel B del pie: Δ0 en las TRES secciones @1440
>
> | | `links` | `legal` | `background` | TOTAL |
> |---|---|---|---|---|
> | @1440 | **Δ0** | **Δ0** | **Δ0** | **Δ0** |
> | @390 | +0.20 | +1.88 | **Δ0** | +2.08 |
>
> Los de 390 son **los residuos transversales ya fichados** (+0.21/+0.18 en
> `links` y +1.89/+1.88 en `legal` en las otras formas): `L2` no trae nada
> propio. Y **es la única de las 7 formas comparadas con Δ0 en las tres @1440**,
> porque la piel B no lleva el `border-y` que da el `+1` a las demás.
>
> ### 2 · ⚠ `estrechaPad` NO era la piel B — el mapeo de la 86.ª tenía 0 separadoras
>
> La 86.ª dedujo bien el mecanismo (*«3 pieles = ancho de fila × `padSeccion`»*)
> y mapeó `B → estrechaPad` sobre **el espejo de listados, donde `estrechaPad`
> no tiene ni una instancia**: catálogo y producto no son listados. Lo separan
> dos números —`col0` de `legal` **93.19** (legal a 12 px) contra el de 18 px, y
> `col2` de `links` **357.56** contra 366.16/335.56—, así que `L2` estrena
> presentación propia (`archivoCpt`) con sus **seis** ejes derivados de
> `pie-mecanismo`, y el `sus` cuadra al centésimo por las dos vías.
>
> ### 3 · El mecanismo del `+67.00` queda LEÍDO, no inferido
>
> §6 de aquella ficha decía *«el TEXTO de la regla NO leído — lo dirime UNA hoja,
> **no capturada** (0 de 505)»*. **Estaba capturada desde el 13 de agosto**, y con
> ella **las 11 hojas** que `/glosario` enlaza. Leída (343 bytes): trae sólo las
> reglas base del módulo icono y **no trae `font-size:25px`**.
>
> > **La piel B mide 96 px porque su hoja dinámica no le lleva el override.**
>
> Es §regla 9 sobre un **hecho negativo**, la variante que la propia regla
> señala como peor: *«no hay»* parece que no cuesta comprobarlo. Costó fichar
> como «hay que volver al original» algo que un `ls` cerraba.
>
> ### 4 · Y el mismo canal arregló el cuerpo, con su control
>
> A 390 el comparador sacó **`#left-area` +23.00** (el `padding-bottom` es de
> `≥981` y estaba escrito a los dos anchos — el número llevaba en la congelada
> desde el principio) y **`contenedorTema` −73.80**. El bloque de CSS se
> reescribió **transcrito del `<style>` servido** en vez de deducido de la
> geometría, y son cinco cosas que ninguna división de píxeles daba:
> `#sidebar{float:left}`, `#sidebar .et_pb_widget{float:none}`, la **ausencia**
> del `:last-child` con `mb:0`, `#sidebar{padding-bottom:28px}` y el corte
> **981/980 servido** donde se había escrito «se pone el 980 de Divi».
>
> **Control:** el cambio es **NO-OP a 1440** (`acercan 0 · alejan 0 · igual 329 ·
> Σ 0.00`), que es donde `#left-area` tapa al sidebar.
>
> ### 5 · Lo que queda, con su número
>
> | # | qué | cardinal |
> |---|---|---|
> | ⛔ **ESCALÓN 2 · (a)** | `#sidebar` sigue a **−75.80 a 390** y Δ0 a 1440 (tapado). La spec declara que hay barra y **no da un solo píxel** de su composición | reparto del clon medido widget a widget; `.et_pb_button` sin transcribir explica ~22. **Y no es de `L2`: los 4 widgets son los de `L1`, donde está TAPADO** |
> | ⛔ `P-LH-C8` | el ancla es el mismo elemento (Δ0) y su **firma** no: falta `post-<id>` | `clases.length` **7 → 5**, 3 tarjetas × 8 páginas |
> | ⛔ instrumento | el eje mixto lee **APARECER como ALEJARSE** | publicó `+283.06 ← ALEJÁNDOSE` en la primera corrida y `−17.00 ← HACIA` en la segunda |
> | ⛔ dato | el rótulo perdió su `<sub>` al extraer | **9 de 37** en `tituloMiga`, **6 de 37** en `titulo` |
>
> `pie-cmp`: **3 formas ausentes de 9 → 2**. Quedan `L2-faqs` (la otra mitad de
> `L2`) y `L4-listado-embebido`.


> ✅ **ACTUALIZACIÓN 2026-08-20 (87.ª tanda) — el residuo de `L2` queda MEDIDO:
> es UNA causa, vale +67.00 a los dos anchos, y su discriminador se sostiene en
> 145 páginas. `L2` NO se construye —ESCALÓN 2 pre-registrado— pero el hilo se
> para DESBLOQUEADO.**
>
> **Tres aplazamientos, y éste no es como los dos anteriores.** La 85.ª paró por
> el cascarón entero; la 86.ª, por un residuo **sin mecanismo**; la 87.ª para
> con el residuo **medido, cuantificado y con denominador**. La 88.ª puede ir
> directa al PASO 3.
>
> ### 1 · El número que el plan citaba era de otro par de pieles
>
> > **`+22.67 @1440 · +97 @390` es `B − A`, no `B − C`.** A 1440 coinciden porque
> > A y C tienen la misma fila `legal` (121.97); **a 390 A y C difieren 30**.
>
> Por eso `115.86 − 48.86 = 67.00` no reconstruía ninguno de los dos. §sondas 1
> con el par cambiado: los dos lados no son original/clon, son **qué dos pieles**.
>
> ### 2 · Entre B y C hay UNA causa, y el resto es un contenedor con holgura
>
> | | @1440 | @390 |
> |---|---|---|
> | `col0` (widget legal) | Δ0 | Δ0 |
> | **`col1` (iconos)** | **+67.00** | **+67.00** |
> | `col2` (menú idioma) | Δ0 | Δ0 |
> | absorbido por la columna hermana | **−44.33** | 0 |
> | ⇒ lo que llega a la FILA | **+22.67** | **+67.00** |
>
> A 1440 las columnas van en fila y la gobierna la más alta, que en C es `col0`
> (93.19) porque `col1` sólo mide 48.86. A 390 apilan. **Dos números distintos
> eran una sola cosa** — §La causa común con el contenedor a la vista.
>
> Modelo `col1.h = altoIcono + mbHermanos`: **exacto 6/6**.
>
> ### 3 · El mecanismo, con n = 145 y su control
>
> **Cuerpo del icono: 96 px en la piel B, 25 px en A y C** — derivado de los
> anchos de glifo, con la firma de razones idéntica en las 6 lecturas.
> `.et-pb-icon{…font-size:96px}` es **el defecto de Divi**, servido en línea en
> las tres capturas; el override de 25px lo trae en línea sólo C.
>
> Barrido el corpus entero (**149 capturas, 145 clasificables**), el contexto de
> caché de la hoja dinámica del theme builder cae **1:1** con la piel:
> **`archive/` en las 12 de B y en ninguna de las 133 restantes**.
>
> **CONTROL:** dentro de la piel A, **37** páginas traen el override en línea y
> **63** lo enlazan, y **las dos miden 25px** ⇒ «enlazarlo» no es el eje.
>
> ⚠ **CONFUNDIDO:** `ctx=archive` y «ser el archivo de un CPT» son la misma cosa
> aquí (las 12 son `glosario` y `preguntas-frecuentes`).
>
> ### 4 · Lo que la 88.ª necesita — y es POCO
>
> **Para construir NO hace falta el porqué.** El *cuánto* está medido: `legal`
> vale **259.83 @1440** y **480.75 @390** en las **12** instancias de la piel B,
> varianza cero. Es un **TERCER eje de la piel de pie** (`iconoPx: 96 | 25`),
> junto al ancho de fila y al `padding` de sección que la 86.ª ya implementó.
>
> **Lo único abierto es el TEXTO de la regla**, y lo dirime **UNA hoja** —
> `et-cache/archive/et-divi-dynamic-tb-140-tb-342.css`, no capturada (0 de 505).
> Es disparador (b): **se declara y se planifica, no se improvisa**. Y **no
> bloquea la construcción**: bloquearía explicar por qué el original hace eso.
>
> ### 5 · Lo que sigue SIN MECANISMO, con su número
>
> - el **+1.00 / +1.89** de `footer-legal` en todas las formas (heredado);
> - el **+0.18 / +0.21** de `footer-links` (heredado);
> - ⚠ **el `mb` de los iconos a 390**: `0` en A y `30` en B y C. A 1440 sí tiene
>   mecanismo —**1.5 % del ancho de FILA**, o sea el eje ya conocido— pero a 390
>   no es 1.5 % de 335.39 (5.03) ni de 312 (4.68). **Separa A de {B,C}, así que
>   NO afecta a construir `L2`.**

---

> ✅ **ACTUALIZACIÓN 2026-08-20 (86.ª tanda) — el cascarón de `L3` queda
> ARREGLADO, y el bloqueo de `L2` BAJA UN NIVEL.**
>
> La 85.ª paró por el cascarón: el clon servía un pie donde el original sirve
> varios. **Eso está resuelto para `L3-sci`** —de **−86.34/−289.64** a
> **+1.00/+2.06**, con `L1` sin moverse— y el modelo resultó más simple de lo
> que la 85.ª escribió: **3 pieles por dos ejes binarios** (fila 86 %/80 % ×
> `padSeccion`), no cuatro pies. Las tres **ya estaban implementadas**; el
> defecto era el mapeo `DE_TIPO`.
>
> **`L2` sigue sin construirse, y la razón ya NO es el pie entero sino un
> residuo dentro de él:** entre las pieles B y C, que comparten fila y sólo
> difieren en el `padding`, el **contenido** de `footer-legal` difiere **+22.67
> @1440 · +97 @390** —columna de iconos sociales, 115.86 contra 48.86— y **no
> tiene mecanismo**. `L2` es piel B, así que nacería con él dentro.
>
> **Lo que la 87.ª necesita para desbloquearla:** medir esa columna un nivel más
> abajo, igual que `qa:pie-mecanismo` hizo con la fila. El resto del cascarón de
> `L2` ya está derivado y congelado (`pie-familias`, `pie-mecanismo`).
>
> ⚠ **La actualización de la 85.ª que sigue abajo conserva su redacción**, y su
> número de `−394.99/−611.53` sigue siendo el desfase de `L2` **si se
> construyera con la piel A**. Lo que cambia es que ahora se sabe **qué piel le
> toca** y qué falta para dársela.

---

> ⛔ **ACTUALIZACIÓN 2026-08-20 (85.ª tanda) — `L2-glosario` NO se construye, y
> el bloqueo es NUEVO y tiene número.**
>
> La 81.ª dejó `L2-glosario` **construible** (el campo de fecha entra, orden
> 37/37). Sigue siéndolo **en su contenido**; lo que la para es **el cascarón**:
>
> > **El clon emite UN pie y el original sirve CUATRO**, uno por familia y con
> > varianza cero dentro de cada una. `L2` construido con el `Footer` de hoy
> > nacería con **−394.99 @1440** y **−611.53 @390** de desfase de pie **que no
> > son suyos** — repartidos en las tres secciones (`links −142.94` ·
> > `legal −136.86` · `background −115.19` a 1440).
>
> Medirlo después **no distinguiría el defecto de `L2` del defecto de clase**,
> que es la definición de FAMILIA DE CALIBRACIÓN. Instrumento y números:
> `qa:pie-cmp` (negativo 4/4) · `PENDIENTES-QA.md`
> §F3-LH-PIE-UNO-CONTRA-CUATRO.
>
> **Lo que la 86.ª necesita para desbloquearla**, en este orden:
> 1. hacer que el pie **dependa de la forma** (hoy `Footer` sólo distingue
>    `caso`, que le añade la 4.ª sección) — `L3-sci` lo verifica ya construido,
>    a **−86.34 @1440** y **−289.64 @390**;
> 2. descomponer `footer-legal` **un nivel más abajo**, que es lo único que
>    puede dirimir si el **+1.59** sin mecanismo y el **+0.30** de la interlínea
>    comparten causa además de sección.
>
> **Y lo que ya NO hace falta volver a medir:** el reparto del pie del original
> está congelado en `medidas/pie-cmp-{1440,390}.json` para las **6 formas
> comparadas**, con su control interno a 0 y las **3 ausentes** nombradas.

| fase | estado |
|---|---|
| **F3-0** · la captura | ✅ **EJECUTADA** (2026-08-09) — HTML **272 registros** + media **337 ficheros**, 0 fallos, commiteadas |
| **F3-1** · `articulos-kb` | ✅ **COMPLETA (2026-08-10, 4 tandas)** — los 6 pasos del orden obligado: specs + PASO 0 · esquema con retícula · extractor + seed · piel del titular (§2d.7) · **plantilla + ruta** (hoja `kb.css` DERIVADA por `qa:kb-clases`, 2 catch-all por sus dos prefijos) · **sonda de dos lados**: `qa:kb-cmp` par a par, **4999/5089 @1440 y 4979/5089 @390** contra la medida congelada y **5453/5543 y 5433/5543 contra el sitio VIVO**, cero diferencias sin declarar en las cuatro corridas. Deja **7 huecos con su número** (`PENDIENTES-QA.md` §F3-1), el mayor de ellos `srcset` con **108.83 px** de consecuencia geométrica a 390 |
| **F3-2** · listados y hubs | ✅ **`L5` DESBLOQUEADA — EL CAMPO DE FECHA ENTRA (2026-08-18, 81.ª tanda), y la tanda cierra en el CORTE LIMPIO 1 sin construirla.** ▸ **Decisión del propietario (§7g): se añade `fechaPublicacion` a `casos` y `terminos-kunakpedia`. Es TRANSCRIPCIÓN**, no producto: `qa:lh-fecha-orden` (nueva, negativo 4/4, **sin red**) mide **57/57** contra el orden servido de `/casos-de-exito/` y **37/37** contra el de `/glosario/`, con **92 posiciones separadoras** frente a tres rivales, **0 empates** y **0 sin fecha**. ⚠ El canal del orden **no es el espejo** —congela `cards.slice(0,3)`— sino el listado del corpus, y `/glosario` exige sus **8 páginas**: leer sólo el índice daría un «37/37» que es un **5/5 disfrazado**. ▸ **La migración que `migrate:create` NO podía generar**: emitía `ADD COLUMN NOT NULL` **sin defecto** sobre tablas con **57 y 37 filas**. Reescrita **nullable → backfill derivado del corpus → `SET NOT NULL`**, con el fallo puesto para que grite (un slug que falte deja `NULL` y revienta el `SET`). **Reversa probada**: `migrate:down` limpio, filas intactas, batch 1 sin tocar. ▸ **Round-trip 352/352 en 13 colecciones**, `qa:cms-campos` 10/10, `qa:lh-poblacion` **0 de 29 series cortas**, y **seis negativos enteros** (5/5 · 7/7 · 4/4 · 5/5 · 5/5 · 6/6). ▸ ⚠ **REGLA NUEVA (`CLAUDE.md` §sondas 20), pagada aquí:** *una sonda que RESETEA el entorno es una MUTACIÓN, y su verde no dice que el entorno quede como estaba* — el round-trip salió 352/352 y dejó `categorias-recursos` sin el término `articulos`, lo que puso `qa:lh-poblacion` en 1 serie corta y **se leía como regresión del campo nuevo sin serlo**; lo dirimió la congelada del mismo día anterior al cambio. ▸ ⚠ **Un negativo llevaba ROJO desde el 2026-08-17 sin que nadie lo corriera**: el control de `cms:extractor-a-neg` tenía **149** cableado y el corpus pasó a **152** en la 74.ª (§regla 9, 7.º caso). Derivado del corpus. ▸ **`L5` NO se construye** y la razón va escrita: el CORTE LIMPIO 1 declara cierre válido con el campo migrado, sembrado y el round-trip verde. ▸ *Lo anterior:* ✅⛔ **`L3` CONSTRUIDA · `L5` PARADA POR EL MODELO (2026-08-18, 80.ª tanda).** ▸ **PASO 0 — la deriva del original llega al clon en CERO pares de defecto**: sonda nueva `qa:lh-cubos` (negativo 4/4) que reparte por CAUSA — cubo 2 (instrumento) **0**, cubo 1 (deriva) **0**, cubo 3 (clon) **4996 @1440 · 4974 @390**; la deriva toca **248/390 pares de eje MIXTO** y a 1440 **no crea ni uno**. ⚠ Su primera versión saltaba las mixtas con un `continue` y publicaba `cubo 1 = 0` junto a un control de **299 caminos movidos**: dos números ciertos y una lectura falsa, porque **la deriva geométrica cae entera en el eje que el comparador no lee como defecto**. Regla en `CLAUDE.md` §La causa común. ▸ **PASO 1 — decisión `D6`: DECLARAR, no recalibrar.** El pie **nunca casó** (clon 594.75 · original 590.75 → 593.75), o sea que la deriva **acercó**: de +4 a +1. ▸ **PASO 2 — `L3` construida**: 6 rutas (367 → **373**), **base Δ0 a los dos anchos en las 6 páginas**, y lo que queda son **50 pares del cascarón YA DECLARADO** + **3–10 `href` locales** por página. Dos defectos cazados por el comparador y arreglados: la interlínea de la miga (**26 en `_tb_body` y 30.6 en las plantillas PHP del tema** — costaba **−4.59** de base) y **un espacio** detrás del año en `.scientific-taxonomies` (6 pares de `contenido`). ▸ ⛔ **PASO 3 — `L5` NO se construye**: su orden es `datePublished` DESC (**57/57**, servido) y **`casos` no tiene ese campo**; los 4 candidatos modelados están refutados con su número. Construir con un orden sustituto pondría otras tres tarjetas donde el espejo mira. §F3-LH-ORDEN-DE-L5-SIN-MODELAR · `ESQUEMA-CMS.md` §7g. ▸ **Y `CMS-ORDEN-L2` amplía su alcance a TRES arquetipos**, uno de ellos bloqueante. **— 79.ª tanda:** ⚠ **ESPEJOS RE-CONGELADOS, Y EL ORIGINAL SE MOVIÓ POR DEBAJO (2026-08-19).** ▸ **PASO 0 — el cableado, y lo decidió CONTAR**: `w()` no pisa, así que re-congelar sin tocar nada mandaría la medida nueva a un fichero **que nadie lee**. Dos salidas; elegida **A** (marcar los caducados `…-SONDA-EXTRACTO-EN-2-FORMAS-DE-9.json` y **liberar el nombre canónico**). El encargo enumeraba **6** puntos de entrada verificados en disco y derivados con `grep` son **16 en 11 ficheros** — **la lista se había quedado corta en 10 antes de usarse**, que es §regla 9 cometida sobre el propio encargo y la prueba de que «repuntar» no era viable. Regla nueva en `CLAUDE.md` (§regla 9, **8.º caso**): entre *renombrar el origen* y *repuntar a los consumidores* se decide **contándolos**, y el recuento se **deriva**. ▸ **PASO 1 — campaña contra el original VIVO**: `lh-spec` **13/13 × 2 anchos** y `lh-espejo` **82/82 × 2 anchos**, los cuatro escritos **en el canónico** (la salida A funciona sin tocar un solo consumidor). ▸ **Las 8 predicciones del pre-registro, CUMPLIDAS** —commiteado **antes** de medir (`docs/research/listados-hubs/PRE-REGISTRO-79.md`)—, incluida la decisiva: **`L5` sigue sin extracto** (`0/3 → 0/3`), confirmando por un **segundo canal** lo que la 78.ª midió sobre 114 instancias ⇒ **disparador (c) NO dispara**. ▸ **Y el `null` de 107 tarjetas queda REPARTIDO con la suma cuadrando**: **51** eran defecto del instrumento (`L3` 16 · glosario 23 · faqs 12, hoy con dato) y **56** eran **DATO** (`L1-resources` 50 · `L5` 3 · `L4` 3). **51 + 56 = 107**. Las dos formas de control **no se mueven**: `L1-blog` 24/24 y `L1-etiqueta` 105/105. ▸ ⛔ **DISPARADOR (a): EL ORIGINAL SE MOVIÓ.** `lh-espejo-1440` da **1 359 pares distintos de 122 762** en tres cubos — **~905 instrumento** (el rol `meta` casando por primera vez en `L3` y `L5`), **~310 deriva `Δ3`** en las cuatro formas de `L1`, y **~124 en `L2`** con `Δ` **no uniforme** (55.59 · 115.19 · 137.86 · 193.45 · 308.64 · 309: cambió de estructura, no de posición). **Se reproduce a 390 con OTRO número** —el pie **+6.65** contra **+3**, y el `padding` de `L2` `0px → 50px` contra `0px → 57.5938px`, que son los dos valores del default de sección de Divi a cada ancho—, o sea **cambio con mecanismo, no ruido**. Y el `Δ5` que sobraba lo cierra: **el pie ERA BIMODAL** (588.75 / 590.75) y **hoy las 82 páginas convergen a 593.75** — convergencia a un valor único es firma de **despliegue**. **El clon está calibrado contra el pie viejo**, así que `L1` mostrará un **−3 sistemático que NO es regresión suya**; recalibrar ahí fabricaría una FAMILIA DE CALIBRACIÓN. **No se puede dirimir «cambió» de «oscila»**: `SP-T5`/`SP-K4` siguen sin campaña de ruido. ▸ ✅ **Lo que ACOTA el daño: `L3` y `L5` NO tienen deriva** — **cero Δ numérico en los dos anchos**, y sus specs quedan confirmadas contra el original de hoy (`h1.y` **337.59/279.77** y **593.28/608.27** · **5** y **6** secciones · **14·1** y **57** tarjetas · **sin paginador**). Y **`L3` NO PAGINA, medido en vivo**: `14·14·14` en sus 3 páginas y `8·8` en las 2. ▸ ⚠ **Lección sobre el propio pre-registro**: decía que el arreglo tocó **dos** roles y tocó **tres** —se dejó `meta`, que son **273 de los 358** pares movidos a 13 formas—. Regla nueva: *cuando lo que predices es el efecto de un cambio de instrumento, «qué cambió» se DERIVA del `diff`, nunca se recuerda*. ▸ *Lo anterior:* ⚠ **EL EXTRACTO CIERRA EN BYTES, Y EL `null` DE 107 TARJETAS ERA LA SONDA — `L3` y `L5` SIGUEN SIN CONSTRUIR, y ahora por una PRECONDICIÓN NUEVA (2026-08-18, 78.ª tanda).** ▸ **PASO 0 — la unidad del extracto de `L3`**: `qa:lh-extracto-unidad` (negativo 4/4) sobre las 23 tarjetas y sus 23 cuerpos, **sin red**: es **`bytes`, tope 100, sobre el texto CRUDO** (antes de decodificar entidades). **23/23**, elegido con **27 instancias SEPARADORAS**, y el modelo de caracteres **REFUTADO** (10/23). ▸ **El empate que la 77.ª bancó NO existía**, y la causa es regla nueva: *una **COTA** (`≤ N`) y una **REGLA GENERADORA** (`corta a N`) no son la misma afirmación* — dos cotas empatan con facilidad, dos reglas sólo si predicen lo mismo; el dato da `bytes {100: 23}` **constante** contra `chars {97:4, 98:9, 99:10}`, así que caracteres estaba refutado **desde el primer día** y **la cota lo tapaba**. Es §La causa común con la COTA como contenedor. ▸ **Y un eje que la ficha no tenía, traído por el dato**: `crudo` vs `deco`, cuya **única** separadora es la tarjeta con un `&amp;` (`96 + 4 = 100`) — se declara con su **n = 1**. ▸ **PASO 1 — el `extracto: null` de 107 de 236 tarjetas era EL SELECTOR**, que cubría **2 formas de 9**: `qa:lh-selectores` (negativo 4/4, corpus por `file://`) da **+163 tarjetas recuperadas** (`L3` 59/59 · glosario 37/37 · faqs 19/19 · recursos 48/223) y **0 movidas** de las **355** que ya casaban — NO-OP con su antes/después. ▸ **Dos huecos, no uno**: `.scientific-excerpt` (un `<div>`, no un `<p>`) y **texto SUELTO sin envoltorio ninguno** en `L2`, que **ningún selector CSS puede casar**. ▸ **`L5` NO tiene extracto y su `null` era DATO** (114 instancias): el disparador (a) del encargo queda resuelto **con los dos signos**. ▸ **Arreglado en la CLASE**: `Censo.grupo()` · `parciales()` · `informeGrupos()` en `lib.mjs` — regla nueva, *el hueco entre el cero y el pleno: un selector que casa en unas formas y en otras no*; `muertos()` suma todas las páginas y 129 no es cero. ▸ **Dos selectores MUERTOS que el fallback tapaba**: `.case-titulo` y `.scientific-titulo` **en español**, cuando lo servido es `case-title` y `scientific-title` (114 y 105 nodos). ▸ **El negativo se estrenó FALLANDO**: `extracto-viejo` salía **exit 0 imprimiendo «NO-OP confirmado»** porque **el sabotaje revertía media hipótesis** —la lista sí, el texto suelto no— y las 56 tarjetas de `L2` mantenían la ganancia. Regla nueva, 2.ª cara de §regla 17-hermana; lo destapó `prohibidoEnSalida`, no el código de salida. ▸ ⛔ **LA PRECONDICIÓN QUE PARA LA TANDA: §F3-LH-ESPEJO-INVALIDADO-EN-EXTRACTO.** Los dos espejos se congelaron con el selector defectuoso, así que su `extracto: null` **no es del original ni del clon: es del instrumento**. Construir `L3` contra él empujaría a pintar la tarjeta **sin** extracto para cuadrar el `null` — una FAMILIA DE CALIBRACIÓN cableada al defecto, contra los 23 extractos medidos al byte. **Hay que re-congelar `lh-spec` y `lh-espejo` contra el original VIVO** (13 y 82 páginas × 2 anchos); **no vale re-derivarlos del corpus**, que sin sus hojas da geometría plausible y falsa. Daño acotado y con su número: **sólo el campo `extracto`**. ▸ **Fichado, no arreglado**: **8** selectores de `deTarjeta` sin ejercitar en las 149 páginas (fallbacks con otro delante), declarados en `NO_EJERCITADOS` para que uno **nuevo** sí cierre el código; y la categoría de `recursos/articulos` (`p.resources-categories a`) fuera de la lista, **sin cardinal todavía**. ▸ *Lo anterior:* ⚠ **LA VENTANA DEL PAGINADOR CERRADA; `L3` y `L5` SIGUEN SIN CONSTRUIR (2026-08-17, 75.ª tanda).** ▸ **La caída, medida a los dos anchos** (`qa:lh-cmp-todas` contra el espejo de 82 páginas): `paginador.piezas.*` **443 → 162** @1440 y **432 → 140** @390; pares distintos **5 265 → 4 996** y **5 254 → 4 974**. **Y el número que decide: 0 pares fuera de la clase sub-píxel** — sólo quedan `w` y `x` con Δ máximo **0.05**, o sea que la clase de la VENTANA no existe ya. La guarda clon-contra-clon lo enseña por el otro lado: las páginas **1–5** de `/etiqueta/monitorizacion-ambiental` ganan **+1 ancla** cada una, exactamente las **5** instancias que la regla predice. ▸ ⚠⚠ **LA TABLA QUE HABÍA QUE IMPLEMENTAR TENÍA DOS FILAS QUE ERAN EL INSTRUMENTO**: `lh-barrido.mjs` congela `as.slice(0, 12)` y las páginas 4 y 5 de 11 emiten **14**, así que la tabla del espejo las daba **sin `»` ni `Last »`** — implementarla al pie de la letra habría hecho que el clon omitiera dos piezas en 2 de 11 páginas **creyendo que replicaba**. Lo desmintieron **dos canales del mismo fichero congelado** (`paginador.hrefs`, sin truncar, y el HTML del corpus). Regla nueva en `CLAUDE.md` §sondas 4 **cuarta cara**, y el tope ya se declara en el barrido (`piezasTotales`, NO-OP sobre lo comparado hoy porque `lh-cmp` recorre las claves del espejo). ▸ **El denominador era parte del defecto**: `qa:lh-huecos` comparaba contra `piezas.filter(no larger page)` y las **5** instancias con número grande quedaban fuera **del recuento y de los fallos** — **38/38 en verde con los 377 pares dentro**. Ahora **43/43** sobre las 43 enteras, negativo **6/6** con dos sabotajes que atacan el borde por sus dos lados. ▸ **Lo que NO está ejercitado va con su cardinal y TIRA en vez de adivinar**: 2+ números grandes **0 de 43** (exige `total ≥ 20`) y grandes delante de la ventana **0 de 43** (exige `total ≥ 15` y `n ≥ 13`); son prerender, así que lo que revienta es el build. Ficha §F3-LH-PIELB-GRANDES-SIN-EJERCITAR — **que además es la que el comentario del componente citaba y no existía en ningún documento**. ▸ **No se pudo leer el código de `wp-pagenavi`** (SVN 404 · trac 403 · GitHub 404/503), así que *«corre con sus opciones por defecto»* es **hipótesis con mecanismo, no medida**: medido, ventana = 5 en 43 instancias; **una sola observación**, el múltiplo 10; **sin determinar**, cuántos grandes como mucho. ▸ **PASO 2 — el sub-píxel: hay UN residuo, no 155.** El único elemento de las 82 páginas × 2 anchos cuyo ANCHO difiere en centésimas es `span.pages` (**31 de 31** pares `.rect.w`, **0** fuera del paginador); los **124/116** `.rect.x` son su **aritmética** (`x(i+1) = x(i) + w(i) + 4`), comprobada pieza a pieza — `FALLAN 0` en **30 de 31** formas. La cota de redondeo se **deriva** (2 decimales ⇒ ±0.02 al comparar dos diferencias) y las dos clases se publican por separado; la propagación es **por RENGLÓN**, que lo enseñó 390 al envolver en dos. **De dónde sale el 0.03 sigue SIN PROBAR** y se queda fichado sin tocar: *«los 124 `.x` están explicados»* está medido, *«los 31 `.w` son ruido»* no lo dice nadie. Sonda nueva `qa:lh-subpixel`, negativo **4/4** — y se estrenó con **dos defectos suyos**, cazados antes de citarla (eligió `lh-cmp-1440.json`, que es **la primera foto**, por ordenar alfabéticamente; y midió el renglón por `y` cuando dentro de un renglón las piezas no comparten `y`, lo que estrenó 4 falsos en el ancho que ya iba bien). ▸ ⚠ **«0 SEPARADORAS» TIENE UN FALSO POSITIVO Y ESTA TANDA LO PISÓ**: los dos predicados candidatos del número grande **son la misma función**, no dos modelos que el dominio no distingue — fichar la indeterminación habría mandado a la tanda siguiente a medir un dilema inexistente. Regla añadida a `CLAUDE.md`. ▸ ⛔ **ESCALÓN 2 disparó y se adjudicó**: +12 fuera de clase; cruzadas las **tres** corridas del día, **contra la `-1` esta tanda introduce 0 pares nuevos fuera del paginador** (los 36 «nuevos» respecto de la `-2` son los que la `-1` ya tenía). Pero deja en pie que **36 pares de CONTENIDO aparecen y desaparecen entre builds del mismo código**, con la forma de *la ventana de la página desplazada una posición*, y la guarda lo enseñó también en `/contaminacion-por-metano` (`docH +16`, página que el paginador no toca). **Contradice la premisa sobre la que está escrita `clon-base`.** Ficha §F3-LH-LISTADO-QUE-OSCILA; amplía **CMS-ORDEN-L2**, que pasa a incluir *«con qué DESEMPATE»*. ▸ **`L3` y `L5` NO se construyeron**, y la razón es de **presupuesto de medición**, no de conocimiento: entrarían construidos y **sin verificar**, que no es entrega. Su precondición está entera, y esta tanda le añadió una pieza derivada del espejo sin volver al original: **el cuerpo de `L3` NO pagina** — `nTarjetas` **14 · 14 · 14** y `docH` **idéntico** en las 3 páginas (8 · 8 en la de 2), o sea que cada `/page/N` sirve el término entero y sólo cambian `<title>` y `canonical`. ▸ *Lo anterior:* ⚠ **DATO CERRADO A MEDIAS Y NADA CONSTRUIDO (2026-08-17, 74.ª tanda) — pararon DOS escalones, y los dos con su medida.** ▸ **Sembrados los 3 documentos** capturados (§F3-LH-TERCER-DOCUMENTO), con **T9B** desbloqueando el del cierre huérfano y **sin arrastrar la re-emisión de T10** (el extractor estrena `SOLO=`; la parcial movió **1 fichero de 212**, comprobado por md5). ▸ **La caída, que es la prueba**: `entradas_blog` 149→**152** · `monitorizacion-ambiental` 89→**91** *(el número del original)* · rutas 363→**367** · `qa:slugs` 190→**194** · formas comparadas 61→**62** · **pares distintos 6 207→5 282** @1440 y **6 199→5 271** @390 · **FECHA 58→6** · formas con `Page N of M` distinto **10→0**. ▸ **Y la ruta que no existía, existe**: `/etiqueta/monitorizacion-ambiental/page/11`. ▸ Cruce del ESCALÓN 3 **exacto al par** a los dos anchos (`62 · 110 779 · 18 349` y `110 829 · 18 399`). ▸ **El −925 va ATRIBUIDO**: todas las bajadas son `listado.tarjetas.*` (contenido dejando de estar desplazado) y las subidas son `cascaron.*` **+4 por capa** = *una forma nueva × 4 capas*, aritmética y no regresión. ▸ ⛔ **ESCALÓN 2**: sembrar **NO** cerró el paginador. Quedan **443 pares en 31 formas**, y son **DOS clases**: la **VENTANA** de las series de **11** páginas (**377 pares**, el clon pinta **9 piezas donde el original pinta 11** — le faltan el `10` y el segundo `...`) y **±0.03 px** sub-píxel en las de 2/3/4 (**66**). Derivada y congelada **la tabla de ventana del original sobre sus 43 series**, sin la cual no se puede arreglar sin inventar. Ficha §F3-LH-VENTANA-DEL-PAGINADOR. **Y sólo existía a partir de 11 páginas, que ninguna serie del clon alcanzaba hasta hoy: arreglar el DATO es lo que lo hizo visible.** ▸ ⛔ **ESCALÓN 1**: se aplicó `D2.4` al **301** de `medicion-de-gases-…` —canonical, `og:url`, `<title>` y un 301 en vivo, todo apuntando a otra— y **la medida lo desmintió**: FECHA **6 → 10**. `D2.4` contesta *«¿es una RUTA?»* y hacía falta *«¿es un DOCUMENTO?»*; en los `/page/N` coinciden porque un `/page/N` no se lista, y **para una entrada se separan** — el original redirige el permalink **y sigue listando su tarjeta**. **Revertido**; el extractor **detecta y reporta, no excluye**. Ficha con **4 salidas, una ya DESCARTADA POR MEDIDA**. ▸ **`L3` y `L5` NO se construyen**, por el ESCALÓN 2: no se construye encima de un defecto de paginador sin nombrar. Su **precondición sí está hecha** (73.ª). ▸ Cobertura **+1** real (`base` 92→93 · `filas` 67→68 · `módulos` 63→64 sobre **367**) — *una forma*, medida; **no confundir con el +54 de la 73.ª, que fue el instrumento dejando de ser ciego*. ▸ Tres cosas no previstas: la guarda de §sondas 5 se cobró una siembra entera (el catálogo canónico estaba desviado), los 3 documentos traían **3 media sin capturar** (5.ª instancia de §EL INVENTARIO DE MEDIA, esta vez derivada de la config y no por colisión) y **`HUECO_DE_CAPTURA` caducó y lo dijo la propia guarda**. ▸ *Lo anterior:* ✅ **RE-VERIFICADAS LAS 3 VARIANTES DE `L1` AL ALCANCE NUEVO (×6.3) — Y LA COSECHA ES DE DATOS: CERO CLASES NUEVAS DE PLANTILLA (2026-08-17, 73.ª tanda — nada construido, cero líneas de `src/`).** ▸ **El cruce del ESCALÓN 1 sale EXACTO AL PAR** a los dos anchos: `lh-alcance` predijo **82 formas · 61 emitidas · 109 421 pares · 18 117 mixtos** @1440 y `lh-cmp` midió **lo mismo** (@390: 109 470 · 18 166). ▸ **Y el cierre son CUATRO afirmaciones con cuatro respaldos, no una** (§sondas 15, escrita en esta fase): el cruce prueba que los dos leen el MISMO universo y es **débil por construcción** (mismo `ESPEJO.paginas`); que el universo **sea 82** lo prueba la derivación `149 − 7 duplicados = 142 rutas`, `142 − 60 vacías = 82`, con `duplicado-sin-marcar` en rojo (`qa:lh-espejo-neg` **3/3**); las **142** son la única con **DOS canales independientes** (`lh-paginas` contra el servidor **vivo** = 142 · el corpus **congelado** de `lh-serie` = 149 − 7); y `min 1 par por página` sale **82/82 por DATO** (`conCero: []`). **No se escribe «el universo está verificado».** ▸ **La re-verificación, cortada contra las 7 formas que el comparador viejo comparó de verdad:** **35 clases nuevas · 400 pares** @1440 (399 @390) = **342 paginador · 58 fecha · 0 CUALQUIER OTRA COSA**. Ese **0** es el resultado: las 3 variantes de `L1` renderizan igual de bien la página 7 de una serie que la 1. ▸ **Y las dos causas son de DATOS, con su mecanismo:** **(1)** los **3 documentos capturados y no sembrados** (§F3-LH-TERCER-DOCUMENTO, bloqueo **T10**) — diferencia simétrica **de los dos lados**: corpus **152** · DB **149** · **3 en el corpus sin fila** · **0 filas fuera del corpus**; dos llevan `monitorizacion-ambiental`, así que la serie tiene **91 entradas y 11 páginas** en el original y **89 y 10** en el clon, **y `/page/11/` NO SE EMITE** — una ruta que falta al final **no se echa en falta desde el principio**, o sea invisible a un comparador de páginas 1 *por construcción*; de ahí salen las 33 clases de paginador, **todas de esa única serie**. **(2) ⛔ NUEVA:** `medicion-de-gases-en-los-vertederos-de-basura` **es un 301** a `contaminacion-del-aire-en-vertederos` (verificado **en vivo hoy**, y su HTML capturado trae `canonical`, `og:url` y `<title>` de la otra) — se sembró como **fila propia con el contenido ajeno**, y la fecha equivocada la **desordena en dos listados**. Es **`D2.4` un nivel más abajo**: aplicado a una ENTRADA, donde nunca se había aplicado. **Con su control**: el otro par de títulos duplicados (`zonas-*`) **no es esto** — postid **13604** y **52220**, **200** los dos: mismo síntoma, **dos causas**. Ficha §F3-LH-ENTRADA-QUE-ES-UN-301, **sin decidir**, con 3 salidas y el barrido del denominador **declarado como no corrido**. ▸ **Nada se arregla aquí, y la razón va escrita**: (1) la bloquea T10, ya adjudicada como «no entra»; (2) **quita una ruta** (363 → 362) y exige re-sembrar, `build` y re-medir los dos anchos — y **aplicarla sola no cierra nada** porque (1) seguiría mal. Las dos, en la misma operación, abren la tanda siguiente. ▸ **21 AUSENTES**: `L2` 12 · `L3` 6 · `L4` 1 · `L5` 1 **+ 1 de `L1`**, que es la ruta que (1) se lleva por delante. ▸ Línea base **363 rutas** sin tocar — y citarla obligó a derivarla: vive en `clon-base-{1440,390}-**2026-08-14**.json`, porque el nombre canónico `clon-base-{1440,390}.json` sigue en **17** (la guarda de §sondas 5 nunca pisa, así que `<nombre>.json` significa **«la primera foto»**, no «hoy»). ▸ *Lo anterior:* ⚠ **EL ESPEJO DE PÁGINAS EXISTE Y EL ALCANCE SUBE A 82 DE 149 (2026-08-15, 72.ª tanda — nada construido).** ▸ `qa:lh-alcance --espejo=lh-espejo`: **82 formas · 129 358 pares @1440 · 129 428 @390**, `primera` **30/35** · `intermedia` **48/86** · `última` **4/28**, **clases 35 de 38**. ▸ **Y las dos cifras van con su cardinal, porque el resumen se las traga (§regla 14):** las **3 clases ciegas** son las de **CERO tarjetas** —**65 páginas de 149, 0 con contenido**, repartidas `D2.5` **55** · grupo B **5** · `D2.4` **5**—, o sea **NI formas sin construir** (las 5 familias `L1…L5` están todas dentro) **NI `L4`** (dentro, con 1 forma, y toca clase); **ensanchar `lh-cmp` alcanzaría 0 de esas 65**, cuyo contrato es `P-LH-C7` y no una comparación par a par, y el clon emite **0 de 65**. ▸ **`última` 4 y no 28 son DOS causas, no una**: `D2.5` **17** + `D2.4` **7**, **hueco 0** — la hipótesis de «son las vacías» acierta 17 de 24. ▸ **Y el 4 no mide lo que parece**: `pos` va sobre la serie **SERVIDA** y en **17 de 35** series ésa NO es la última CON CONTENIDO; la última **CON CONTENIDO** está comparada en **28 de 30** series (**30/30 en DOCUMENTOS**, porque un `D2.4` sirve el de la 1.ª). ▸ Cuarta frontera nueva `espejo·no-la-trae` = **el único hueco**: **0** con este espejo, **69** con el de formas. Negativo **5/5** (sabotaje nuevo `frontera-sin-explicar`). ▸ **Sigue abierto**: las **5** del grupo B sin decisión, y el clon sin emitir ninguna de las 65. ▸ *Lo anterior:* ⛔⛔ **SEGUNDA PARADA DE ALCANCE (2026-08-14, 70.ª tanda), por el ESCALÓN 1: `qa:lh-cmp` compara 13 PÁGINAS de 149 y las 13 son la PÁGINA 1 — o sea que toma el atajo que `qa:lh-serie` rechaza («LA SERIE NO ES UNA UNIDAD»), y el escalón manda parar antes de construir.** ▸ Derivado con `qa:lh-alcance` §`alcanceReal`, idéntico a los dos anchos: `intermedia` **0 de 86** · `última` **0 de 28** · clases **11 de 38** (27 ciegas = **122 páginas**). Vivía como una línea SIN NÚMERO en un `noMide` mientras el cierre se leía como «LISTADO-B verificado». ▸ **Y CORRIGE el mecanismo de la 69.ª**: cruzadas las 43 instancias de la piel B **por ruta**, el comparador tenía **3** en su universo, comparó **1** (las otras dos son `L2`, AUSENTE) y tuvo **0 SEPARADORAS** — el verde no vino del alcance, vino de que su dominio no distinguía los dos modelos. Predicción: `/glosario` (página 1, `total 8`) **sí separa**, así que construir `L2` da la primera separadora sin ensanchar. ▸ **`CMS-ORDEN-L2` ESCRITA como decisión y no decidida** (§7e), 2 preguntas × 3 y 4 salidas por *lo que son*; y nombrar los canales que faltaban destapó **uno con dato**: `/preguntas-frecuentes` **sí sirve fecha** (`article:modified_time` **19/19**) y lo que no tiene es canal **que ORDENE** — con control doble, porque en `/glosario` `dateModified` tampoco ordena con 37/37. ▸ **Los dos bloqueos de siembra ADJUDICADOS**: T10 **sigue fichada y no entra** (re-emisión de 169 cuerpos: exige antes/después y `build`), y la etiqueta 44 va **a T9, no a la whitelist** (DOM ajeno; **1 de 3** nuevos, **0 de 209** sembrados). ▸ **Ensanchar, FICHADO con su número**: 71 páginas, ×6.5, y exige medir el ORIGINAL en las `/page/N` — hoy no hay espejo. ▸ **Los TRES números no se mueven** (10 707/10 714 · 1 840/1 847 · 5 999/6 005, criterio **13 · 6 · 7**, objetivo **13 · 1 · 12**), **cobertura idéntica**, **cero formas construidas**. ▸ *Lo anterior:* ⛔ **PARADA DE ALCANCE (2026-08-14, 69.ª tanda): las specs de `L2`·`L3`·`L5` no contestaban CINCO preguntas que deciden la construcción, y el escalón del encargo manda parar y medirlas.** ▸ `qa:lh-huecos` (nueva, negativo 4/4) las deriva con su canal: la **barra del tema** de `L2` (12/12, donde `lh-barra` decía 0 porque medía la partición Divi) · los **58 px** del `.container` (iguales a los dos anchos) · la **ventana** de la piel B · **qué ordena** (`/glosario` = `datePublished` DESC 37/37; `/preguntas-frecuentes` **sin canal** en los 4 mirados) · la **banda de filtros** de `L3` (3 botones) y `L5` (12), que vale **162.8** y **264.6 px**. ▸ **El 4.º es el que para**: ningún tipo del clon tiene fecha y el precedente no se aplica tal cual ⇒ **`CMS-ORDEN-L2`**, §7e del ESQUEMA. ▸ **DEFECTO en lo ya verificado**: la `PielB` emitía `current` + `n+1..total` — **cero `page smaller`** —; contra las 43 instancias y por SECUENCIA, el nuevo **38/38** y el viejo **7/38**, y los 7 buenos son **páginas 1**, las únicas que el comparador mira. Arreglado, **NO-OP sobre todo lo comparado**. ▸ **`TOPE = 269` CIERRA** con n=37 (era n=6 y «no separable»): único tope del barrido 250–300 que da 37/37. ▸ **Los TRES números no se mueven** — 10 707/10 714 · 1 840/1 847 · 5 999/6 005, criterio en **13 · 6 · 7** — y **cero formas construidas**. ▸ Corrección derivada: de las 6 AUSENTES, **una es `L4` (F3-3)**; las de F3-2 son **5**, así que el objetivo es **13 · 1 · 12**. ▸ Cobertura **idéntica**, por construcción. ▸ Los **3 documentos** de §F3-LH-TERCER-DOCUMENTO: **CAPTURADOS** (309 → 312, 0 fallos, lista derivada de 807 tarjetas); la siembra para en §F3-LH-EXTRACTOR-T10-SIN-CABLEAR y §F3-LH-ARTICLE-ETIQUETA-44. ▸ *Lo anterior:* ✅✅ **`LISTADO-B` COMPLETO — las TRES variantes de `L1` construidas Y VERIFICADAS (2026-08-14, 68.ª tanda), y «completo» va con su alcance: para las tres variantes de `L1`, NO para F3-2.** ▸ **345 → 363 rutas** (+18). Comparador contra el original **VIVO**: **13 formas · 6 AUSENTES · 7 comparadas**, **10 707** pares @1440 y **10 714** @390, **699 / 695** residuos en **0 clases sin nombrar**, y **base Δ0 en las 7** con `P-LH-C8`. Las 3 formas de la 66.ª siguen en **232 / 231**: cero regresión. ▸ Cobertura **+4 en cinco ejes** con el denominador subiendo a la vez (`base` 34→38 · `árbol` 34→38 · `anchos` 18→22 · `filas` 9→13 · `módulos` 5→9 sobre 363). ▸ **El ESCALÓN 1 disparó con una tercera respuesta**: `lh-barra.json` acertó en todo lo que midió y el componente estaba mal igual — `resources` tiene **3 filas** donde las otras dos tienen 2 y su listado cuelga de un módulo de texto vacío. *Una regla INCOMPLETA se lee igual que una completa* (§F3-LH-ESCALON-4-4). ▸ **Cuatro defectos que sólo esta variante podía enseñar**, arreglados, incluido que **el formato corto de fecha era INGLÉS y es ESPAÑOL** —8 de 12 meses no podían separarlo, y toca también a `/etiqueta`—. ▸ **Lo que queda de F3-2**: **L2** (2 formas), **L3** (2, `D2.6`), **L5** (1, menos su filtro), las **55 vacías** de `D2.5` + las **19** de `resources`, y la decisión de alcance del **CASCARÓN**, que mueve 363 rutas. ▸ *Lo anterior:* ✅ **`L1-resources` DESBLOQUEADA: `D2.8` decide `padre` (2026-08-14, 67.ª tanda de DECISIÓN — nada construido).** ▸ La jerarquía se **modela**: `padre` poblado, ruta compuesta en la plantilla, **cero campos nuevos**. Forma medida con `qa:lh-jerarquia` (nueva, negativo 4/4, 5 taxonomías · 38 términos): profundidad **2** · **1** padre · **0** con dos padres · **0** tercer nivel · **1 de 5** taxonomías jerárquica. ▸ **La dirección contraria también contestada**, y es la que casi nadie hace: el esquema **NO** está sobre-generalizado —`padre` en **1 de 4** colecciones, y es la única que el original hace jerárquica—. ▸ **Se decide sin escalar** porque el precedente `D2.4`/`D2.5` cubre el caso: el original declara qué es cada cosa en canales servidos, aquí **cuatro** —miga con `class="taxonomia padre"`, chips, `<body class="archive tax-resources term-…">` y el contraste `page-child` de sus 3 hermanos—. ▸ **Y destapa un defecto que ninguna de las tres salidas cubría**: el prefijo `recursos/articulos` está **cableado en `extractor-a.mjs`**, y 2 de 149 entradas pierden su `recurso` por eso (§F3-LH-EXTRACTOR-PREFIJO-CABLEADO). Arreglarlo mueve el **contenido de 9 rutas ya emitidas** y 0 el conjunto: es re-emisión, con su línea base congelada en `clon-base-{1440,390}-f33-padre-antes`. ▸ *Lo anterior:* ⚠ **2 DE 3 VARIANTES DE `LISTADO-B` CONSTRUIDAS Y VERIFICADAS (2026-08-13, 66.ª tanda).** ▸ `L1-blog` y `L1-etiqueta` emiten **43 rutas** (302 → 345) y pasan de AUSENTES a **PARES COMPARADOS**: 5 445 @1440 · 5 448 @390, con **232 / 231** residuos en **9 clases nombradas y 0 sin clasificar**, y la **base a Δ0** en las tres formas con `P-LH-C8` verificado. La matriz de cobertura sube en 5 ejes (`filas` 6→9 · `módulos` 2→5). ▸ **Lo que queda de F3-2**: `L1-resources` (4 formas, ✅ **desbloqueada el 2026-08-14 por `D2.8`** — falta sembrar y construir), **L2** (2), **L3** (2, `D2.6`), **L5** (1, menos su filtro), las **55 páginas vacías** de `D2.5` (§F3-LH-VACIAS-NO-EMITIDAS) y una decisión de alcance sobre el **CASCARÓN** que mueve 345 rutas. ▸ *Lo anterior:* ⚠ **CON SU COMPARADOR Y SUS PIELES EXHIBIDAS; falta CONSTRUIR.** ▸ **2026-08-13 (2.ª tanda):** auditadas las specs contra el canal recién capturado, **en las dos direcciones** — ninguna afirmación se cae, y las tres declaradas «sin exhibir» quedan **con su regla servida** (`qa:lh-pieles-css`, 13/13 canal completo, negativo 3/3): `L1` y `L4` con override **por módulo** y su `@media`; `L2`/`L3`/`L5` con **CERO** overrides móviles de titular. **SP-T7 cerrada.** Las tres pieles de `h1` pasan de *replicadas de la medida* a **cableables sin inventar**. Línea base completa a **1440 y 390** (302 · 302 · 0 errores). ▸ **Lo anterior:** ⚠ **CON SU COMPARADOR YA HECHO; falta CONSTRUIR.** ▸ **Estado 2026-08-13 (tanda de CONSTRUCCIÓN):** el arquetipo estrena **su sonda de dos lados** —`qa:lh-cmp`, par a par (camino × propiedad), base de lectura por forma con `P-LH-C8` cableado, negativo **3/3**— escrita **antes** que la plantilla para que no acabe calibrada contra el clon. Primera lectura: **13 formas · 13 AUSENTES · 404 · 0 pares**, que es el estado inicial correcto. **Línea base** del clon a 1440 congelada (**302 rutas · 0 errores**). Y el **canal de pieles capturado antes de construir**: las **9 de 9** formas enlazan `et-core-unified-*` y estaba a cero — **52 hojas** capturadas (§F3-LH-PIELES-SIN-CAPTURAR), sin lo cual las specs habrían calibrado contra ceros sin probar. El ⛔ caducado de `listado-b.spec.md` queda levantado. ▸ *Lo anterior:* | ⚠ **SIN ESCALONES ABIERTOS — y lo que queda es CONSTRUIR, que no se ha empezado.** ▸ **Estado 2026-08-13 (tandas de DESBLOQUEO y de T9):** las **cinco colecciones pobladas** (348 documentos · **302 rutas** · round-trip 348/348), **`qa:lh-poblacion` VERDE** —0 de 29 series sin alcanzar—, `qa:lh-paginas` del día **142 rutas** (foto, no constante, P-LH-C3), `qa:slugs` **190 sin colisión** y `npm run check` exit 0. **T9 cerrada con sus CUATRO condiciones**: la cuarta pagada **por mecanismo** —`qa:t9-css`, 0 de 44 clases del envoltorio con regla en los 8 canales de CSS servidos, control vivo, negativo 4/4— tras capturar las 7 hojas enlazadas (§DATOS-DOM-AJENO). ▸ **Lo que falta es la construcción entera**: **LISTADO-B con sus tres variantes, L2, L3 y L5**, con dos desviaciones ya declaradas (**L5 sin su filtro** si `sector` se decide en F3-4, y **§LH-C6-L3-SIN-PAGINADOR** replicado por `D2.6`) y con la regla de que **un arquetipo nuevo NO hereda cobertura**: su comparador de dos lados es parte de la tanda, no un extra. ▸ *Histórico del escalón, que ya no bloquea:* | ⛔ **PARADA EN EL 4.º ESCALÓN, y el escalón BAJA DE 2 A 1.** ▸ **Progreso 2026-08-13 (tanda de PIPELINE):** §DATOS-C-PIPELINE **CERRADA** — las 12 discrepancias eran **tres clases MÁS** de las que la ficha nombraba, y ninguna era del extractor: **6** de T7 sin aplicar dos reglas ya escritas, **3** de serialización que la transcripción normalizó y el original NO, y **3** de una clase entera que el cubo de «combinaciones» escondía (el `texto-destacado` anidado dentro de `necesidad`, que son **48 regiones**, no 3). **`faqs` sembrada 2 → 19**, y `qa:lh-poblacion` baja a **1 serie corta**: `/casos-de-exito`. ⛔ **`casos` NO se siembra, y no por el extractor** —verde con los 57, control 0, negativo 7/7—: la para `RELACIÓN SIN DESTINO`, porque **43 de 57 referencian 10 productos que el clon no modela** (modela 9 de 24). Es §F3-COLA-DESTINOS visto desde la relación, y desbloquearlo es **clonar un arquetipo**, no trabajo de datos. Ficha: §DATOS-C-SOLUCIONES. ▸ De camino: **T7 reescrita** con dos reglas que ya estaban adjudicadas (**1788 → 2** enlaces locales con `target`, **53 → 2** destinos que el build no emite, `clon-base --cmp` **232 páginas · 0 con regresión** a los dos anchos), **T9 nueva** (§DATOS-DOM-AJENO: el editor pegó DOM ajeno, **10 de 309** páginas, con su negativo sobre el discriminador) y **§DATOS-MEDIA-HOTLINK abierta**: el clon sirve **3688 imágenes desde kunakair.com** en **180 de 234** rutas, y la premisa que lo justificaba es hoy falsa —**1265 de 1268** URL ya están publicadas en `public`. ▸ **Progreso 2026-08-12 (2.ª tanda de datos, la de la siembra):** ▸ **Progreso 2026-08-12 (2.ª tanda de datos, la de la siembra):** sembradas **TRES de cinco** colecciones desde el corpus — `entradas-blog` **149**, `terminos-kunakpedia` **37**, `documentos-cientificos` **23** — con round-trip **268/268** y `npm run check` verde en **232 rutas · 13 familias · 0 vacías**. `qa:lh-poblacion` pasa de **19 de 29 series cortas a 2**, y las 2 son exactamente las que faltan: `/casos-de-exito` (57 vs 4) y `/preguntas-frecuentes` (19 vs 2). El extractor de esas dos **está escrito y con negativo 5/5** (`cms:extractor-c`: 57 + 19, 0 lectores muertos, 0 regiones ausentes) y **no siembra** por una razón que no es suya: **§DATOS-C-PIPELINE** — es el primer instrumento que compara un cuerpo transformado contra su transcripción, y descubre que el control de `extractor-a` **no compara `cuerpo` en ninguno de sus 18 campos**. Consecuencia medida en los 209 cuerpos YA sembrados: **1788 enlaces localizados con `target="_blank"`** y **53 rutas locales que el build no emite** (31 se resuelven al sembrar casos; **20 son enlaces rotos vivos**). ▸ **Progreso 2026-08-12 (1.ª tanda de datos):** decidida la salida **A** (`D2.7` · sembrar el corpus) y el catálogo **extraído y verificado** (`cms:extractor-a`: 149 · 37 · 23, control **95/95**, negativo 4/4). **Ninguna colección sembrada todavía**, por tres precondiciones que las guardas pararon antes de la DB: **90 orígenes de media sin capturar** · **1 de 37** con `<h1>` vacío contra un `required` · **5 campos sin lector**. La primera necesita **campaña contra el original**. Ficha: §DATOS-A. Ficha original: | El camino de decisiones está **entero** —§LH-C6-L3-SIN-PAGINADOR cerrada con **`D2.6` · REPLICAR**, y las 4 medidas del cascarón diagnosticadas (3 con causa, `SP-H6` a medias)— pero **el clon no tiene documentos para emitir ni verificar las 142 rutas**: 19 de 29 series con listado se quedan cortas y sólo **35 de 142** son emitibles hoy (7 entradas de blog contra 149, 4 casos contra 57, 3 términos contra 37, 4 documentos contra 23, 2 faqs contra 19). `P-LH-C3`, `P-LH-C7` y la comparación par a par **presuponen las tres la población del original**. Sonda `qa:lh-poblacion` (negativo 3/3), congelada en `medidas/lh-poblacion.json`; tres salidas escritas en `PENDIENTES-QA.md` §ESCALÓN F3-2 (4.º). ✅ §LH-C6-HOVER-ZONAL resuelta; §LH-C6-FILTRO-L5 no bloquea (F3-4, `L5` menos el filtro) |
| **F3-3** · cola larga | ✅ **DECIDIDA Y EMITIDA.** La decisión de ESQUEMA la tomó el propietario el 2026-08-22 (91.ª, **CMS-3** en `ESQUEMA §2j`) y la emisión está hecha (104.ª, 2026-08-24): **382 → 413 rutas**, diferencia simétrica **31 nuevas · 0 desaparecidas**. Lo que NO cierra, con su número, en su propia §: 10 de 31 rutas sin miga · el lado CAMPO de `f33.css` sin estrenar · `map`·`slider`·`icon` SIN PROBAR (n=1) |
| **F3-4** · familias de archivo | ✅ **FASE COMPLETA**, cerrada el 2026-08-27 (118.ª), registrada por la 119.ª. Lo que deja abierto va en su propia § |
| **F3-5** · los content types de lo ya construido | 🔶 **PRIMERA MITAD HECHA (126.ª, 2026-08-31): el content type ESCRITO** para **4 de las 5 rutas** —colección `arquetipos`, ESQUEMA §2o—. ⚠ **Los «46 SIN PROBAR» de la 126.ª YA NO SON EL ESTADO: la 127.ª los reescribió a 6 RESUELTOS a PLANTILLA por cascada + 40 ABIERTOS** (`SIN ESCRIBIR`, valor inicial, sin declaración a la que preguntar), y añadió **8 CAMPO** sobre un denominador de **132 pares** en la FAMILIA. **Falta la segunda mitad**, que es lo que cierra la fase: **0 filas sembradas · 0 lectores en el render**, o sea que las 4 rutas siguen sirviéndose de `src/lib/` (re-derivado el 2026-08-31: `arquetipos` a **0 filas** por consulta real a la DB). ⚠ **Y la 129.ª añadió la PRECONDICIÓN DE VERIFICACIÓN que faltaba, que el plan no tenía nombrada:** el eje `módulos` —donde vive el ritmo `mt·mb·pt·pb` que este content type modela— estaba a `·` en las 4, y su comparador **ya existía con el eje CIEGO** por falta de un insumo del CLON. Con `data-modulo` emitido en `/kunak-api` (NO-OP al bit a los dos anchos, firmado por la guarda de `w()`), el eje **se enciende y da su línea base**: 85 ejes · 33 distintos @1440 · 22 @390, con la cosecha en el ritmo por módulo (`mb 31.67→0`, `mb 60→90`). **La celda de cobertura pasa a `O` en 1 de las 4, no en las 4** — el resto queda NOMBRADO con su cardinal (objetivo 215 módulos con caja), no descontado. Sin esto, cablear el lector y cerrar con `clon-base` mediría a un nivel que puede absorber el defecto. **HOME queda fuera** por alcance del encargo, no por criterio. Lo abierto, con su cardinal, en `PENDIENTES-QA.md` §127.ª — **no en la §126.ª, cuyo denominador está superado**. Alcance original (81.ª): **5 rutas · 4 arquetipos + 1 variante**; la lectura «content type de HOME» sigue borrada. ⚠⚠ **Y la 130.ª llevó el eje `módulos` a 3 de las 4** —`/software-…` COMPARA su fila 3, donde el ESQUEMA sitúa los DOS CAMPO de este arquetipo (`menu-anclas` sobre `.et_pb_text_14/15` e `iconos-md-2` sobre `.et_pb_blurb_15/16`), y `/accesorios` sus filas 4 y 5, donde vive `.et_pb_text_7`—: 85 → **245** ejes de módulo @1440 y 85 → **236** @390, filas CON marcador 3 → **6**, con NO-OP al bit en el eje de FILAS medido por diferencia simétrica (0·0·0) y su control, más `clon-base` @1440 dando **426 rutas idénticas · 0 movidas** para el alcance colateral de los 3 componentes COMPARTIDOS. **Pero el alcance se escribe con lo que queda fuera:** de los 90 módulos de `/software-…` sólo **65** están en filas ALINEADAS y se marcan **34**; en `/accesorios`, **18 de 55**. **`/monitor-calidad-aire` sigue a `·`**: recibe marcador de los compartidos pero ninguna fila suya queda completa, y PARCIAL no es cobertura (§regla 46). ⚠ Y la 130.ª cerró **dos defectos del INSTRUMENTO** que la fase arrastraba: (1) el `srcset` remoto ganaba al `src` localizado, así que **el ORIGINAL no pintaba 22 de sus 56 imágenes** y publicaba `Δ+243.75` constante en 14 tarjetas **con el signo invertido** (§regla 43); (2) romper `[data-fila]` salía en **VERDE** porque el contrato declara su unidad en el PAR y lo comparado son EJES (§regla 44), ahora con guarda y código de salida propio. ⛔ **Y ficha, sin arreglarlo, que el eje `filas` está DESALINEADO en las 4 rutas**: el original sirve una fila propia de 1 módulo para el botón «Amplia tus conocimientos» que el clon no marca, así que la FAQ del clon se compara contra ella —`orig 146 → clon ~1400` en 4 de 4, o sea el instrumento—. Arreglarlo caduca la línea base del eje `filas` de las 4 (§regla 5bis): es una tanda con su propio NO-OP. ⚠⚠ **Y la 133.ª quitó el BLOQUEO que impedía la segunda mitad, pero el estado sigue siendo `0 filas sembradas · 0 lectores`, y ahora con su motivo NOMBRADO:** resuelto `CMS-6 = A + C` (`ESQUEMA` §2o.9), el censo admite el **Tramo F3-5** —23 tokens, `ETIQUETAS_CENSADAS` 43→46 y `ATRIBUTOS_CENSADOS` 81→101, con su dominio de 4 documentos declarado— y el formulario va **tipado** (`formulario-arq`), así que el extractor emite **231 bloques en 4 filas con 0 bloqueos en los CUATRO ejes** (de 198 campos HTML, 199 antes: el campo de HTML crudo ya no existe). Pérdida medida POR ELEMENTO y con sus dos referencias: **texto visible 0 de 286 · vecino 0 caracteres · 2 piezas sin render que C introduce** (`novalidate`, `data-styles-version`). **Lo que impide sembrar hoy NO es el esquema: son dos cosas nombradas** — (1) `arquetipos` **no está cableada al sembrador**, no aparece ni en `CATALOGOS` ni en `SEMBRADAS` (11 colecciones), así que «correr el sembrador» no era posible; (2) el entorno. ⚠⚠ **Y la lectura que había aquí —«el contenedor **no arranca** porque otro proyecto ocupa el puerto 55432»— está REFUTADA y se BORRA, no se concilia** (`0359ba0`, re-medido en la 134.ª): el contenedor **arranca y sirve** (`pg_isready` → *accepting connections*), y lo que falta es que Docker **PUBLIQUE** el binding. Los dos canales, que no son el mismo: `HostConfig.PortBindings` lo DECLARA (`5432→55432`) y `NetworkSettings.Ports` sale **vacío**, así que el socket da `ECONNREFUSED` y nada ocupa el puerto. **Un `docker restart` del contenedor existente NO republica** (medido en la 134.ª), así que no es del contenedor: es del proxy de puertos de Docker Desktop, y es del propietario. Sin socket quedan sin correr `qa:media-canales` (12 canales · 121 rutas, §regla 48), la siembra, la diferencia simétrica del entorno y `clon-base`. ⚠ Y ficha `F3-5-CODE-DIVERGE`, **re-medida por la 134.ª CON el tramo puesto** —la 133.ª la midió en `d4174a4`, o sea antes de que entrara, y el tramo sólo puede hacer el censo más permisivo—: el repo modela el MISMO formulario de dos maneras, HTML crudo en `paginas` (**9 instancias, sembradas, sin validar**) y tipado en `arquetipos`. **A · lo viejo NO se encoge: 9 de 9 siguen bloqueando**, y el mecanismo lo explica —los 21 tokens fuera del censo en esos 9 son la clase `formulario`, justo la que el tramo dejó FUERA—. **B · el tramo NO está sobre-generalizado: ALCANZA 3 campos `campoHtml` de `paginas` y ADMITE DE MÁS 0 de 23** (§regla 25, los dos cardinales), en la unidad estrecha (167 campos) y en la ancha (1170 cadenas). ⚠ Y un dato que la ficha no tenía: `codigo-arq` da **0 instancias** en la canónica, no 1 — CMS-6·C llevó el formulario a `formulario-arq` (1). Es la forma de la clase C7 y **la decisión de unificarlas es del propietario**. ⛔ **La migración de `formulario-arq` NO EXISTE**: la última es `20260831_015813_f3_5_arquetipos` (67 tablas de bloque) y `formulario-arq` entró el 2026-09-01, así que crearla —y probar su reversa en la ÚNICA ventana que §regla 30 admite, ANTES de la primera fila— necesita la DB. ⚠⚠ **Y la 135.ª (2026-09-01) NO movió el estado —sigue `0 filas sembradas · 0 lectores`— porque el socket sigue en `ECONNREFUSED`; lo que añadió es el trabajo OFFLINE de los escalones bloqueados, y son dos cosas medidas.** **(1) La premisa que decidía si el ESCALÓN 3 puede restaurar con el pipeline completo está CONTESTADA por config, en las dos direcciones** (`derivaciones/premisa-code-135.{mjs,json}`): `MODULO_CODIGO.html` de `paginas` es `{type:"code", required:true}` **sin `validate`** —por eso sembraron, no es que «algo lo deje pasar»— y el «9 de 9» **no está sobre-generalizado pero es un CONTRAFÁCTICO**, o sea qué pasaría si a `paginas` se le pusiera el validador de `arquetipos`; **no** es una afirmación sobre la siembra. **Consecuencia: el pipeline completo es SEGURO por este eje y no hace falta camino alternativo.** Denominador entero recorriendo todos los ejes: **448 campos con `validate` en 20 colecciones**, con 7 a cero nombradas. ⚠ Y la sonda llegó midiendo **al nivel del BLOQUE**, que publicaba 18 «validados» en `paginas.[codigo]` —los 18 de RITMO, que absorben la pregunta—; estrechada al campo de CONTENIDO da **0 contra 1**, con los dos cubos publicados. **(2) §regla 42 tenía el DOBLE de instancias de las que declaraba** (`derivaciones/regla42-barrido-135.{mjs,json}`, 26 migraciones · 12 en alcance · 14 fuera declaradas): son **4, no 2**, y **las dos nuevas son EXPUESTAS y ANTERIORES a las que descubrieron la clase** —`20260804_122225_registro_slugs.ts` L31 y `20260823_131718_f3_3_paginas_cola_larga.ts` L543—. Se **fichan sin arreglar** (§regla 30: con dato encima y sin socket, su reversa no se puede probar). ⚠ **Y `arquetipos` a 0 filas NO se pudo comprobar**: eso es DB, así que la ventana de §regla 30 se declara **SIN COMPROBAR**, no «sigue abierta». ⚠⚠ **Y la 136.ª (2026-09-01) tampoco movió el estado —sigue `0 filas sembradas · 0 lectores`, socket en `ECONNREFUSED`— pero LEVANTÓ ENTERO el expediente que la fase arrastraba fichado: `F3-5-CODE-DIVERGE` pasa a decisión numerada **CMS-7 · ✅ RESUELTO: A · NO UNIFICAR (propietario, 2026-09-01, 137.ª)** (`ESQUEMA` §CMS-7), levantado con cuatro opciones y la operación de deshacer de cada una NOMBRADA (§regla 23). **Elegida A porque empieza SEPARADA y deshacerla es FUSIONAR, el lado barato**; C exigía SEPARAR sobre `paginas`, que tiene dato, con la ventana de §regla 30 CERRADA y su migración entre las dos EXPUESTAS de §regla 42; B y D iban contra CMS-6·C. **`F3-5-CODE-DIVERGE` queda CERRADA, y no la cierra la frase sino el CERO: los dos modelos tienen intersección de contenido VACÍA** (`codigo` 1 campo · `formulario-arq` 11 · comunes 0), así que nunca fueron dos versiones del mismo modelo. Sigue vivo `formulario-arq.metodo: "GET"` **SIN EJERCER sobre n = 10**, fichado con su alcance. ▸ **`F3-5-TEXTAREA-MUDO` CERRADA en la misma tanda (137.ª §ESCALÓN 2), y la clase se DERIVÓ en vez de parchear la instancia**: censadas 9 etiquetas de control en las 13 instancias del dominio (9 htmls de `paginas` + los 4 documentos del corpus de `arquetipos`), `textarea` es **el único** perdido en silencio —**1 en `paginas`, 0 en `arquetipos`**, o sea sólo fuera del dominio que calibró la guarda—. Se **NOMBRA**, no se modela: con CMS-7 = A, ampliar el enum `campos.tipo` inventaría un camino de render que nadie recorre. `PERDIDOS EN SILENCIO` **1 → 0**, alcance re-declarado con sus DOS cardinales (SIN PROBAR para `optgroup · datalist · output · progress · meter`, 0 ocurrencias), negativo del extractor **7/7 + control**. ⚠ **Y el control NO podía vivir en la corrida de la sonda**: el arreglo es **NO-OP donde el código corre** —`f35-extraido.json` no cambió un byte— así que el testigo se toma **donde el caso existe**, corriendo `formularioDe` sobre el html de `contacto`, que es de otra colección.** Los cuatro heredados reproducen (9 · `{type:"code"}` sin `validate` · 21 tokens · 9 de 9) y lo que añade son tres medidas que cambian el marco: **(1) los dos modelos NO comparten NI UN campo de contenido** —`codigo` 1 (`html`), `formulario-arq` 11, **comunes 0**— porque toda la coincidencia vivía en la BASE de ritmo (derivada: 19 en `paginas`, 25 en `arquetipos`); **(2) las 9 son `<form>` ENTERO 9 de 9**, una por documento (`contacto` · `descarga-catalogo` · los 5 informes técnicos · `newsletter` · `suscribete`); **(3) y unificar hacia lo TIPADO pierde un control EN SILENCIO** — corrido **el extractor real** (`formularioDe` cortada del fuente por ESTRUCTURA) sobre los 9: **0 piezas NOMBRADAS** como sin sitio y **1 PERDIDA muda**, el `<textarea name="field[23]" required>` de `contacto`. `textarea` aparece **0 veces** en `extractor-f35.mjs` y `formulario-arq.campos.tipo` no lo admite; su guarda es cierta de su dominio (4 documentos sin `<textarea>`) y **SIN PROBAR fuera de él** → ficha **`F3-5-TEXTAREA-MUDO`**, que es **ORTOGONAL** a CMS-7 (hace falta en la opción C, no estorba en A · B · D, y afecta a **0 filas**). El «0» es del extractor y no del instrumento porque el testigo T2 —el sabotaje `control-sin-sitio` que el propio extractor declara— **sí** hace crecer `SIN_SITIO_FORM`. **Y el coste de migración de la opción C está derivado, no supuesto:** la ventana de §regla 30 está **CERRADA** para `paginas` (tiene dato) y la migración que creó `paginas_blocks_codigo` es **una de las dos instancias EXPUESTAS de §regla 42** (`20260823_131718_f3_3_paginas_cola_larga.ts` L543), con su `down` haciendo rollback entero; `formulario-arq` **no tiene migración** (26 en el proyecto, 0 la nombran). Dirección B con el mismo barrido: `tipo` **no** sobre-generalizado (3 de 3 ejercidos), `metodo: "GET"` **SIN EJERCER** con n = 10. Derivación con 3 sabotajes y 2 testigos por polaridad: `derivaciones/escalon1-136.mjs` · `escalon1-136-SIN-DB.json` ⚠⚠ **Y la 138.ª (2026-09-01) SÍ movió el estado, y a la vez lo estrechó: `0 filas sembradas · 0 lectores` SIGUE, pero ahora la siembra tiene un bloqueador NOMBRADO y numerado en vez de un entorno.** **El ENTORNO está resuelto** —el contenedor corría **atado a CERO redes**, así que el binding estaba escrito y nunca aplicado; recreado montando el volumen anónimo **por su ID**, `2ebbe245…`, **sin perder nada**: socket abierto en 77 ms, **151 tablas**, `paginas=31 · productos=19 · entradas_blog=152`, `arquetipos` a **0 filas** por consulta real—. Y con eso caen las dos premisas que bloqueaban las tandas 134.ª–137.ª, las dos ahora corregidas en `CLAUDE.md`: *«no hay nada más que mirar tras el publish»* (falta `NetworkSettings.Networks`, que es **causal** y no sintomática) y *«un volumen anónimo muere con una recreación»* (**anónimo no es efímero**: tiene ID, sale en `docker volume ls` y se monta en un contenedor nuevo). ▸ **ESCALÓN 1 · LA MIGRACIÓN DE `formulario-arq` EXISTE Y SU REVERSA ESTÁ PROBADA**, en la única ventana que §regla 30 admite —`arquetipos` a 0 filas—: `20260901_230502_f3_5_formulario_arq`, 4 tablas y 14 tipos, comparado ANTES vs TRAS-DOWN **elemento a elemento en CUATRO ejes** más el registro de migraciones (tablas 151 · columnas 1884 · tipos 340 · constraints 1101 · `payload_migrations` 26) con **0 y 0 en los cinco**, y **control positivo** 4/4 tablas y 14/14 tipos creadas por el `up`. Los cuatro ejes no son adorno: un `DROP TABLE … CASCADE` **no se lleva los enums**, así que un `down` que dejara 14 huérfanos daría «tablas idénticas» con el esquema sucio. ⚠ **§regla 30 en vivo:** el log dijo *«Rolling back batch 4 consisting of **27** migration(s)»* y la tabla dice que revirtió **UNA**. ⚠⚠ **Y el `IF EXISTS` NO arregla §regla 42 aquí — el cardinal de la clase SIGUE EN 4:** medido corriendo el `down` sin él sobre la DB real en `BEGIN…ROLLBACK` (sin editar el fuente, §regla 20), **0 separadoras en la PRIMERA pasada**; esta migración **no emite el patrón** `DROP TABLE … CASCADE` + `DROP CONSTRAINT` porque no crea colección nueva. Lo que compra es **IDEMPOTENCIA**: 1 separadora, y está en la **segunda** pasada (`42P01`). ▸ **ESCALÓN 2 · `arquetipos` CABLEADA** a `CATALOGOS` y `SEMBRADAS` (11 → **12**), con su evidencia y con el efecto medido **corriendo**, no por la lista: sondeo **360 → 364 filas**, confirmado por el control del negativo desde otro instrumento (355 → 364, `required.delEsquema` 73 → 83). Su ORDEN se **deriva**: no declara ni un `relationTo`. ▸ ⛔ **Y AHÍ APARECE EL BLOQUEADOR REAL, QUE NINGUNA TANDA TENÍA NOMBRADO — `CMS-8`, ABIERTO:** con las 4 filas dentro salen **5 rutas `required`**, derivadas enteras en UNA corrida (§regla 27) y **cada una con su unidad** — `imagen-arq.enlace.label`/`.href` **SIN DATO en 27 de 27 instancias** (4 de 4 documentos) · `texto-arq.contenido` **VACÍO** 1 de 100 · `video-arq.url` **VACÍO 2 de 2** · `formulario-arq…opciones.texto` **VACÍO** 3 instancias en 1 documento. **Es decisión de MODELO y es del propietario**, con el precedente exacto de las D1·D2·D3 de `paginas`, y el mecanismo que lo hace decisión y no defecto es de FORMA: `enlace()` es un **`group`** con `label`/`href` `required` y **un grupo en Payload no es opcional**, así que exige enlace en las 27 aunque el original enlazara sólo algunas. Expediente con 4 opciones y **la operación de deshacer de cada una nombrada** en `ESQUEMA-CMS.md` §CMS-8 — donde la asimetría va **AL REVÉS** de lo habitual: en un `NOT NULL` **relajar es barato y re-imponer es caro**, porque `SET NOT NULL` tiene ventana y la primera fila la cierra. ⚠ El **27/27 es un 100 % redondo** (§sondas 4 quinta cara) y queda **SIN ATRIBUIR** entre «el extractor no lee éstos» y «los 27 de primer nivel no tienen enlace»: el extractor **sí** emite `enlace` (`extractor-f35.mjs:469`) y el barrido del corpus **no adjudica** (ventana de 900 caracteres, se lleva anclas vecinas y lo que hay dentro de `<style>`). Hace falta **sólo para la opción B**. ▸ **ESCALÓN 3 · medido hasta ahí, y la siembra NO se corre**: `cms:seed` exige DB vacía, así que confirmar contra el hecho costaría `cms:reset` + `cms:seed`, o sea vaciar la DB para verificar lo que un instrumento con negativo 4/4 ya predice. **`arquetipos` se queda cableada a propósito**: con el alta puesta el sondeo grita, sin ella el hueco es invisible (§sondas 6). `qa:media-canales` da **58 canales · 21 ejercidos · 39 sin dato · 4 de otro sembrador · 0 ficheros a capturar · 0 guardas en rojo**, con `arquetipos` aportando **68 rutas y 0 ausentes** resueltas **byte a byte**. **Build FUERA** (`.next-138`) exit 0, **sin promocionar**. ▸ **En vez de `clon-base`, la comparación de los dos builds, que es más fuerte y más barata**: manifiesto **429 → 429** con simétrica **0 y 0** (dinámicas 17 → 17, 0 y 0), membresía de HTML **0 y 0**, y **la 138.ª NO alcanza el bundle de web** —`git diff --name-only 16405ae..HEAD` da **0 ficheros de `apps/web/src`** y ninguna migración entra al bundle, **con testigo positivo** porque un 0 sin él no vale: `"Aviso legal"` 1709 · `"entradas-blog"` 59 · `"nextpostslink"` 126 contra **0 · 0 · 0**—. O sea **NO-OP sobre el render POR CONSTRUCCIÓN**. ▸ ⛔ **Y la comparación destapó una ficha que NO es de esta tanda y se declara sin atribuir: 131 de 428 documentos difieren en HTML VISIBLE** entre el build base (2026-08-31 14:54) y hoy, entre ellos **`blog.html`, que pierde `<link rel="next" href="/blog/page/2"/>`** con `/blog/page/2` emitida en los dos. El intervalo cubre las tandas 133.ª–137.ª; atribuirlo a la 138.ª sería tan falso como no contarlo. ⚠ Y el propio comparador se estrenó con **dos defectos cazados por su señal**: al bit daba **428 de 428** (el `BUILD_ID`, un 100 % redondo) y, normalizado, **196** por el **ORDEN del payload RSC** con el título idéntico — de ahí la regla que sube a `CLAUDE.md`. ⚠⚠ **Y la 139.ª (2026-09-02) CIERRA `CMS-8` —A para 8a, `requeridoConVacio` para 2 de los 3 vacíos de 8b, ficha de instrumento para el tercero— y AL SEMBRAR DE VERDAD DESTAPA UN BLOQUEADOR NUEVO Y DISTINTO: `CMS-8` NO ERA EL ÚLTIMO.** **`CMS-8` resuelto entero** (`ESQUEMA` §CMS-8 ✅): `enlace()` gana `{opcional}` y sólo se aplica a `imagen-arq.enlace` (los otros 2 usos de `enlace()`, derivados con `grep`, no se tocan); `texto-arq.contenido` y `formulario-arq…opciones.texto` pasan por `requeridoConVacio()` **tras comprobar EN EL ORIGINAL** que los tres vacíos son datos servidos reales (un `et_pb_text` sin `.et_pb_text_inner`, dos placeholders de `<select>` de ActiveCampaign sin texto); `video-arq.url` se queda `required`, con su canal fichado (`iframe[src]` de un embed de YouTube que `extractor-f35.mjs:478` no contempla). Dos migraciones más, reversa probada elemento a elemento las dos veces (0 y 0 en los cinco ejes), y el log de `migrate:down` mintió sobre el alcance las TRES veces que corrió esta tanda. **`qa:media-canales` re-verificado BYTE A BYTE** aparte del propio `existsSync` de la sonda (§regla 47): 745 rutas distintas, **0 y 0** en los dos cardinales — sin caso de §regla 47 en este lote. ▸ **`cms:reset` + `cms:seed` corrido de verdad por primera vez con `arquetipos` cableada, y MUERE EN EL PRIMER `create`** — no por `required`, por **UNICIDAD**: `registro-slug.ts` rechaza `monitor-calidad-aire` porque `productos` (documento 11) ya lo reclama en el plano de `/es/`. Derivado el alcance completo, no sólo el primero (§regla 27): **3 de los 4 slugs de `arquetipos` colisionan con `productos`** —`monitor-calidad-aire` · `software-de-medicion-calidad-del-aire` · `kunak-api`—, los tres con `productos.pagina === "propia"` (el discriminador de «tiene página en /es/», §2e/CMS-PR3) y `padre` vacío, o sea genuinamente en el plano por diseño, no por descuido. Y **`productos` no tiene NINGÚN campo de cuerpo** —sólo ficha corta (tagline · description · highlight · bullets · image · seo)—, así que un documento `pagina: "propia"` de `productos` no puede por sí mismo renderizar la página que promete: eso es justo lo que `arquetipos` sí trae. Dos colecciones con responsabilidades distintas (ficha vs cuerpo) reclamando el mismo hueco del plano porque `productos.pagina` se escribió en §2e antes de que `arquetipos` existiera. **Nueva decisión de MODELO, numerada `CMS-9` (`ESQUEMA` §CMS-9, ⛔ ABIERTO)**, con 3 salidas y su operación de deshacer cada una — **no resuelta**. DB restaurada y consistente tras el intento: `cms:seed` sembró las otras 11 colecciones con normalidad, `cms:seed-kb` y `cms:seed-listados` restauraron el resto del pipeline (§regla 20); `arquetipos` es la única pieza en `0 filas`, y sigue siéndolo — **F3-5 no cierra su segunda mitad esta tanda**, aunque `CMS-8` ya no es lo que lo bloquea. ⚠⚠ **Y el propio propietario investigó CMS-9 el mismo día y REFUTÓ su lectura más plausible («A»)**, además de corregir un cardinal falso de la primera versión de la ficha (decía 13 de 16 `pagina:propia` sin colisión; en realidad sólo **5** de los 16 tienen `padre` vacío/están en el plano — los otros 11 nunca lo intentan — y de esos 5 sólo 3 son ésta ficha, los otros 2 son el caso YA FICHADO desde la 94.ª/95.ª en §F3-3-REGISTRO-SOBRE-RECLAMA). `pagina: "ninguna"` en los 3 colisionantes mentiría el dato (el original SÍ los sirve); 0 consumidores de `productos.pagina`/`hrefServido` en el render; las 3 rutas las emiten sus carpetas estáticas, no `[slug]` (que no importa de `productos`). Encargadas y contestadas DOS preguntas derivadas del código: **(1)** `registro-slug.ts` (140 líneas leídas enteras) no tiene ningún concepto de fuerza de reclamo — separar el hecho («tiene página») del predicado («reclama el plano») exige crecerlo, no es gratis; **(2)** `qa:slugs` **ya** distingue emite de describe —`esFamiliaDelPlano`, `slugs.mjs:403`, escrito en una tanda anterior para estas MISMAS 3 rutas— pero **sólo del lado de lectura** (compara contra el build ya construido); no existe del lado de escritura, que es donde ocurre la colisión (`create`, sin build contra el que preguntar). **CORTE LIMPIO confirmado** por el propio criterio del encargo: crecer el mecanismo. No se implementa nada; CMS-9 sigue abierta con A' (nuevo concepto de prioridad, no una línea) / B (arquetipos cede el plano en esos 3) / D (no sembrar). |
