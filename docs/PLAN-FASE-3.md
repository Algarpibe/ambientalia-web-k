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

> ✅ **EL 1.er ESCALÓN ESTÁ CERRADO (2026-08-11, tarde): `D2.5` · REPLICAR TAL
> CUAL**, firmada por el propietario. El clon emite las **55 rutas vacías** con
> 200, como el original — la única de las tres salidas que **no cambia el
> sitio**; `noindex` y 404 son decisiones de producto y se llevan aparte
> (`PENDIENTES-QA.md` §F3-2-SEO-PAGINAS-VACIAS). Con eso la entrega deja de ser
> un rango: **142 rutas** (35 índices + 107 de paginación), derivadas de la
> decisión y re-medidas en vivo ese día. `D2.4` no se reabre: **el canonical
> separa las dos formas, 7/7 y 55/55**.
>
> ⛔⛔ **PERO HAY UN 2.º ESCALÓN, y lo levantó la fase de specs: `L1` tiene DOS
> retículas de cuerpo, no una.** `3_4 + 1_4` con **barra lateral de 10 widgets**
> en blog y etiqueta (**80 de 80 documentos**), `4_4` sin barra en resources
> (**0 de 37**) — y con ellas dos contenedores distintos, **911.75 y 1238.39**,
> que son literalmente los dos del `⚠⚠` de `CLAUDE.md` §Test A. `D1` afirma que
> entre familias sólo cambia la configuración de la tarjeta, y `D3` no lista la
> barra lateral, cuyo widget «Categorías» **consume la taxonomía `category`**.
> **F3-2 no construye hasta decidirlo.** Ficha: `PENDIENTES-QA.md` §ESCALÓN F3-2
> (2.º). Congeladas: `medidas/lh-barra.json` · `medidas/lh-spec-{1440,390}.json`.
>
> ✅ **Y la precondición de abajo queda LEVANTADA a medias:** ya hay fase de
> specs —`qa:lh-spec` contra el original vivo, 13 páginas × 2 anchos— con
> `components/README.md` y `components/listado-b.spec.md` escritas. **Las specs
> de `L2` · `L3` · `L4` · `L5` están MEDIDAS Y CONGELADAS, sin redactar**: lo
> que falta es la prosa, no volver a pegarle al original.
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
> **35 clases estructurales** en la población, medidas sobre las 149 páginas
> capturadas (no sobre una muestra). «Una por serie» es el atajo que dejó
> MONOGRÁFICO a cero, y aquí sale **rojo por construcción** en el negativo de
> `qa:lh-serie`.
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
| **F3-2** · listados y hubs | pendiente · **DESBLOQUEADA** — `P-LH-C6` cumplida el 2026-08-10 y el eje llevado a **37/37** el 08-11 (`qa:comportamiento` 254 + 70 + **518** interacciones, todas con disparo confirmado). De las 3 fichas de entrada queda **UNA en el camino**: §LH-C6-L3-SIN-PAGINADOR (decidir replicar o desviarse, con la razón escrita). ✅ §LH-C6-HOVER-ZONAL **resuelta con la regla medida** (`qa:hover-zonal`); §LH-C6-FILTRO-L5 **no bloquea**: se decide en F3-4 y F3-2 entrega **L5 menos el filtro**, anotado como desviación |
| **F3-3** · cola larga | pendiente · abre decisión de ESQUEMA |
| **F3-4** · familias de archivo | pendiente · abre decisión de ESQUEMA |
| **F3-5** · content type de HOME | pendiente · sin dependencias |
