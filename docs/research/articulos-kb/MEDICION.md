# `articulos-kb` — la fase de SPECS

> **Tanda 2026-08-10 (44.ª), F3-1 PASO 4 · escalón 1 de 6.** Este arquetipo
> llegó al PASO 4 **sin fase de specs**: `docs/research/grupo-D/` tiene `RECON.md`,
> `DECISION.md` y `PRE-REGISTRO-DECISION.md`, y **no tiene `components/`**. Sin
> specs la plantilla se inventa y el «Δ0 contra el original» deja de medir
> fidelidad, así que el PASO 4 paró aquí y esto es lo que lo desatasca.
>
> Recon previo: `docs/research/grupo-D/RECON.md` (2026-08-03) · modelo:
> `docs/ESQUEMA-CMS.md` §2d.1 y §2d.2 · plan: `docs/PLAN-FASE-3.md` §F3-1.

| documento | qué trae |
|---|---|
| **este** | dónde se mide, con qué protocolo, y qué decidieron los dos tests |
| `components/cascaron.spec.md` | la capa `_tb_`: cabecera, retícula con barra lateral, pie |
| `components/cuerpo.spec.md` | la capa propia: 1 sección, 45 filas, el reparto de columnas y el ritmo |
| `components/modulos.spec.md` | los 5 kinds medidos: `text` · `blurb` · `image` · `button` · `gallery` |

Medidas congeladas: `scripts/qa/medidas/kb-css.json` (PASO 0) ·
`kb-spec-1440.json` · `kb-spec-390.json` · `kb-tests.json`.

---

## 0 · PASO 0 — ¿DÓNDE se miden? Y la respuesta obliga a corregir una frase

**La pregunta no es retórica.** El acta de F3-0 escribió *«EL ORIGINAL SALE DEL
CAMINO CRÍTICO, DEFINITIVAMENTE»* sobre una campaña de 272 registros con 0
fallos, y la 43.ª tanda ya tuvo que corregirla dos veces (§regla 10). Una spec es
`getComputedStyle` de cada elemento, y `getComputedStyle` necesita las hojas de
estilo. Los 6 HTML están congelados; **sus hojas, no**.

Sonda: **`npm run qa:kb-css`**, de DOS LADOS — la misma batería de anclas sobre
la captura (`file://`, con toda petición que no sea `file:` abortada) y sobre el
original vivo, a 1440.

| | |
|---|---|
| hojas externas que el HTML pide | **19 distintas** · capturadas en el repo: **0** |
| CSS **en línea** dentro del HTML | 8 bloques · **184 015 bytes** |
| anclas de ESTILO distintas | **55 de 210** |
| anclas que sólo se renderizan en un lado | **36** (el `h1`) |
| anclas de CAJA distintas | **36 de 36** |
| árbol de módulos idéntico | **6/6** |

> **La captura no sale desnuda: sale PLAUSIBLE.** Con 184 KB de CSS en línea
> —`divi-dynamic-critical-inline-css` y los `et-core-unified-…-cached-inline-styles`
> entre ellos— el `file://` renderiza una página con tipografía y colores casi
> correctos. **155 de 210 anclas de estilo coinciden.** Medir ahí no habría dado
> ningún error: habría dado una spec con **55 valores inventados**.

Las **9 anclas que fallan en las SEIS** son exactamente el ritmo y la caja:
`seccion.paddingBottom` · `fila.paddingTop`/`paddingBottom`/`marginLeft`/`marginRight`
· `columna.width`/`marginRight` · `modulo-texto.marginBottom`/`width`. O sea **las
dos cosas que los tests A y B discriminan**.

Y el número que cierra la pregunta, porque es el defecto que esta fase existe
para corregir:

> **`columna.width` da 678.52 offline y 430.80 en el original.** Sin las hojas
> externas la partición en columnas **no ocurre** y todas salen de ancho
> completo. Una spec medida sobre la captura habría dicho, con respaldo
> numérico, que **el cuerpo de este arquetipo es plano** — que es precisamente la
> afirmación falsa que paró el PASO 4.

### La frase, reescrita con su alcance

> **El original está fuera del camino crítico para OBTENER DATOS** —sembrar,
> censar, transcribir, auditar el texto— **y NO lo está para MEDIR EL PÍXEL.**
> La campaña de F3-0 sigue entera; lo que no cubre es esto, y no podía: capturar
> las páginas no es capturar sus hojas de estilo, igual que no era capturar sus
> imágenes.

Esto **no** es una tarea encolada. Capturar las 19 hojas + las fuentes y validar
que el render offline ≡ el vivo es una tanda con su propia campaña de
verificación, y hasta que exista y salga a Δ0 **la captura no se puede usar para
medir píxeles**. Se anota en `PENDIENTES-QA.md` §F3-1-CSS-NO-CAPTURADO.

---

## 1 · El protocolo con el que se midió

`CLAUDE.md` §Notas de método, entero:

- **perfil limpio** (`puppeteer-core` sobre el Chrome del sistema, headless,
  `userDataDir` nuevo) y **Cookiebot bloqueado** por `--host-resolver-rules`;
- **scroll + settle** antes de medir, con `loading="lazy"` → `eager`;
- **390 sólo con `Emulation.setDeviceMetricsOverride`** (390×844, vía
  `setViewport` para que la captura no se desincronice del viewport);
- **secuencial, 500 ms entre páginas**, como la campaña de F3-0;
- salida **congelada** por `w()`, con la guarda de sobreescritura activa.

### ⚠ Este arquetipo NO tiene campaña de ruido propia

Las rutas de `articulos-kb` **no están en `PORDEFECTO` de `ruido.mjs`**, y las
campañas cerradas (`cqa6`, `cqa6-390`) cubren `/software` y los dos
monográficos. Por tanto, y hasta que exista:

> **Un residuo pequeño en estas 6 rutas está SIN PROBAR — ni defecto ni
> limpio.** Y «pequeño» no tiene aquí un número contra el que compararse,
> porque el suelo de estas rutas no se ha medido nunca. No se cite ningún Δ de
> estas rutas como «dentro del ruido»: no hay ruido medido.

Lo que sí se puede afirmar de esta corrida es que **el árbol fue estable**: las
dos medidas (1440 y 390) dan 45 filas, 60 columnas y 149 módulos, y el
emparejamiento nodo a nodo de `kb-tests` **no encontró ni una discrepancia de
forma** — si el original hubiera servido otra composición entre las dos
corridas, el emparejamiento habría tirado.

---

## 2 · El RÉGIMEN, que decide cómo se lee cada número

El centro de ayuda es **HÍBRIDO** (`CLAUDE.md` §régimen, corrección del grupo D
del 2026-08-03): el `<body>` trae `et_pb_pagebuilder_layout` **y**
`et-tb-has-body`. No es un tercer régimen — son los dos conviviendo **en capas**,
y **a cada capa le toca la lectura contraria**:

| capa | qué es | lectura | discriminador |
|---|---|---|---|
| **`_tb_`** | cabecera · retícula del cuerpo con su barra lateral · pie | **plantillada** | **varianza entre instancias**. Un px absoluto aquí significa «lo fijó quien construyó la plantilla» ⇒ **plantilla** |
| **propia** | las secciones del builder dentro del `post_content` | **de builder** | los **dos tests** tal cual |

Aplicar el test A a la capa `_tb_` daría la respuesta **invertida** — es
exactamente cómo se convierte una plantilla en ocho campos inventados.

**Resultado de la lectura plantillada: varianza CERO en las 6, en todo lo
medido** del cascarón. Detalle en `components/cascaron.spec.md`.

---

## 3 · Los dos tests, y las cuatro correcciones que hubo que hacerles

`qa:kb-tests` no mide: lee las dos congeladas y clasifica **1519 pares (nodo ×
propiedad)**. Las correcciones no son cosmética — sin ellas la clasificación
decía cosas falsas, y tres de las cuatro salieron de que **la salida se
contradecía a sí misma**.

### 3.1 · El veredicto se da POR PROPIEDAD, no por nodo

La primera versión sacó una contradicción a la cara: `fila.paddingTop`, **el
mismo par `18.2344px → 30px`, marcado CAMPO ×17 y PLANTILLA ×13**. Las dos ramas
eran correctas —unas filas tienen hermanas con valor distinto (test B ⇒ campo) y
otras no (⇒ coincide con el default)— y la conclusión conjunta es imposible: el
mismo valor no puede ser las dos cosas.

> **La pregunta no es de nodo.** *«¿Puede el editor escribir el `pt` de una
> fila?»* se contesta **una vez para la propiedad**. Si algún nodo lo prueba, la
> propiedad es CAMPO — y los nodos que llevan el default **no son plantilla: son
> el campo con su valor por defecto**, que es justo lo que el ESQUEMA dice que se
> omite en el dato.

### 3.2 · El test B tiene un FALSO POSITIVO, y no estaba escrito

`CLAUDE.md` documenta los falsos **negativos** de los dos tests. El B tiene
además uno positivo:

> **El test B supone que si dos hermanos difieren, lo escribió una persona. Una
> regla de plantilla que dependa de la POSICIÓN —`:last-child`, `:nth-child`—
> produce exactamente la misma variación entre hermanos.**

Medido: **`columna.marginRight` vale `50.1406px` en toda columna que no es la
última y `0px` en toda última, en las 60 columnas de los 6 artículos.** El test B
lo llamaría campo; es el **canal de la retícula de Divi**. Darlo por campo
inventaría un `margenDerecho` por columna en el content type.

**Discriminador:** la variación queda **completamente explicada por la
posición** — al agrupar por (¿primero?, ¿último?, ¿solo?) cada grupo trae un
único valor, y hay más de un grupo. Si dentro de un grupo siguen apareciendo
valores distintos, no es una regla: ahí sí hay alguien escribiendo.

### 3.3 · El test A no se aplica en PÍXELES a la caja — pero sí en RAZÓN

El alcance ya estaba escrito y saltárselo invierte la respuesta: **`fila.maxWidth`
vale `1380px` a los dos anchos en las 39 filas**, y el test A en px lo llamaría
campo. Es la constante del tema.

Lo que sí es nuevo y recupera al test para la caja:

> **El test A no es «el píxel no cambia»: es «el valor que escribió la persona no
> cambia». Si lo que escribió es un %, lo que hay que comparar entre los dos
> anchos es el %** — o sea la **razón contra el ancho del padre**.

Medido: un módulo de **366.172** en una columna de **430.797** es **85.0 %**; a
390 mide **285.078** en **335.391** — **85.0 % otra vez**. Razón constante entre
anchos ⇒ lo escribió una persona ⇒ **CAMPO**. Así sale `anchoPct` **medido** en
vez de inventado: **85 % ×6 · 50 % ×4 · 40 % ×2**. Y un módulo que llena su
columna da 100 % en los dos: ése es el default, no un campo.

### 3.4 · `0px` es el caso degenerado del test A

> **`0px` es a la vez «el editor escribió 0» y «aquí no hay nada».**

Se discrimina con el default documentado: un 0 uniforme **contra un default no
nulo** es un desvío que alguien escribió (`seccion.paddingTop`, cuyo default es
4 %); un 0 uniforme **sin default** no es evidencia de nada — se marca **SIN
EVIDENCIA**, que no es lo mismo que plantilla.

### ⚠ Y la sonda se cobró su propia ración de la regla del pleno

El detector de regla posicional, **sin exigir que la propiedad varíe de
verdad**, cumplía «cada grupo, un solo valor» **trivialmente** sobre toda
constante: clasificó **515 de 1429 pares** por una tautología. Es §sondas 4 (*un
patrón que casa en todas no mide nada*) cometido dentro de un clasificador en vez
de dentro de un selector, y no habría dado error nunca — habría dado un reparto
plausible.

---

## 4 · El veredicto, por propiedad

De `medidas/kb-tests.json` → `porPropiedad`. **`caja`** = clasificada sólo por
test B y test A en razón; **`deriv`** = propiedad derivada, no CSS.

| propiedad | valores | veredicto |
|---|---|---|
| `seccion.paddingTop` | `0px → 0px` | **CAMPO uniforme** — el default es 4 %/50px, así que el 0 es un desvío escrito. Test B no lo confirma: no varía |
| `seccion.paddingBottom` | `36.4688px → 50px` | **PLANTILLA** — el default de Divi al 4 % del contenedor (911.75) |
| `seccion.marginTop` · `marginBottom` | `0px → 0px` | **SIN EVIDENCIA** |
| **`fila.reparto`** `deriv` | 4 valores | **CAMPO** — probado en 39 de 45 (test B: filas hermanas con repartos distintos) |
| `fila.nColumnas` `deriv` | 3 valores | **CAMPO** — 39 de 45 |
| `fila.paddingTop` | 5 valores | **CAMPO** — 26 de 45 · default 2 %/30px, se omite |
| `fila.paddingBottom` | 6 valores | **CAMPO** — 39 de 45 · default 2 %/30px |
| `fila.marginTop` | 6 valores | **CAMPO** — 39 de 45 |
| `fila.marginBottom` | 2 valores | **CAMPO** — 39 de 45 |
| `fila.marginLeft` · `marginRight` | `0px` | **SIN EVIDENCIA** |
| `fila.maxWidth` `caja` | `1380px` | **SIN PROBAR** — uniforme en 39 y sin test que lo pruebe. Inerte: es mayor que el padre a los dos anchos |
| `fila.width` `caja` | 1 par | **PLANTILLA** — llena a su padre en los dos anchos |
| `columna.marginRight` | `50.1406→0` · `0→0` | **PLANTILLA · regla posicional** (el canal) |
| `columna.marginBottom` | `0→0` · `0→30` | **PLANTILLA · regla posicional** (el apilado a 390) |
| `columna.paddingTop` · `paddingBottom` | `0px` | **SIN EVIDENCIA** |
| **`columna.width`** `caja` | 4 valores | **CAMPO** — 12 de 60. Es la proyección de `fila.reparto`, no un campo aparte |
| `modulo.marginTop` | 4 valores | **CAMPO** — 142 de 149 |
| **`modulo.marginBottom`** | **9 valores** | **CAMPO** — 143 de 149 · default 2.75 %/30px, se omite |
| `modulo.paddingTop` | `0px` | **SIN EVIDENCIA** |
| `modulo.paddingBottom` | `0px` · `35px` | **CAMPO** — 143 de 149 |
| **`modulo.width`** `caja` | **9 valores** | **CAMPO** — 45 de 149 (`anchoPct`: 85 · 50 · 40 %) |

### Lo que queda SIN PROBAR, nombrado — y no se cablea

| propiedad | par | por qué no está probada |
|---|---|---|
| `fila.maxWidth` | `1380px → 1380px` | uniforme en las 39; el test A no vale (es caja) y el B calla. **Inerte**: 1380 > 911.75 y > 335.39, así que no recorta nada. Se rinde como constante del tema **declarándolo** |
| `columna.width` ×17 | `430.797 → 335.391` · `270.484 → 335.391` | son columnas de filas **simétricas** (`1_2+1_2`, `1_3×3`): las hermanas miden lo mismo, el test B calla. **No añaden incógnita**: la propiedad que decide es `fila.reparto`, y ésa sí está probada |
| `modulo.marginTop` ×1 | `-18px → 0px` | **un solo módulo** con margen superior negativo a 1440 y 0 a 390, sin hermano que lo contradiga. Se anota; no se cablea |

> Las tres se registran en `PENDIENTES-QA.md` §F3-1-SIN-PROBAR-KB. **Una
> propiedad que no pasa ninguno de los dos tests no está probada como plantilla:
> está SIN PROBAR**, y cablearla es exactamente el arreglo falso.
