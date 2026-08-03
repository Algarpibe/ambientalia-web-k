# PRE-REGISTRO · ¿es el ancho de módulo un CAMPO fuera de MONOGRÁFICO?

> **2026-08-03. Escrito y commiteado ANTES de construir la sonda y ANTES de
> medir.** Es la medición de desbloqueo que `docs/research/clase/DECISION.md`
> §PASO 5 dejó como paso 1, y la que el HANDOFF llama *«los 10 se abren con UNA
> medición»*.
>
> Método: el de `EXPERIMENTO-URBANO.md`, LH-2 y grupo D — **qué significa cada
> resultado se escribe antes de conocerlo**, para que la decisión sea la rama que
> el pre-registro asignó y no la que apetezca al ver el número.

---

## 0 · Un hallazgo de LECTURA, anterior a la medición — y reencuadra la pregunta

Antes de medir se leyó el fuente de los 10 bloqueadores para saber **a qué nivel
del árbol** vive cada valor cableado. El resultado no es el que la clasificación
daba por supuesto:

| componente | valor cableado | **nivel real** |
|---|---|---|
| `SectorBody` | `w-[86%]` | **FILA** (`const FILA = "mx-auto w-[86%] max-w-[1380px]"`) |
| `SectorHero` | `w-[86%]` · `w-[47.25%]` | **FILA** · **COLUMNA** |
| `ClaimConFoto` | `w-[47.25%]` ×2 | **COLUMNA** |
| `ListaSimple2Col` | `w-[47.25%]` ×2 | **COLUMNA** |
| `BeneficiosAplicaciones` | `w-[47.25%]` · **`w-[80%]`** | **COLUMNA** · **MÓDULO** (`<h3>`, línea 58) |
| `CabeceraSector` | `w-[86%]` | **FILA** |
| `CasoPagina` | `w-[86%]` `w-[80%]` · `w-[47%]` | **FILA** · **COLUMNA** |
| `CasoDetalles` | `w-[80%]` · `w-[32%]` `w-[50.5%]` | **FILA** · **COLUMNA** |
| `CasoGaleria` | `w-[80%]` | **FILA** |
| `FaqSidebar` | `w-[25%]` | **COLUMNA** |

> **De los 10, NUEVE cablean retícula (fila u columna). UNO —el `<h3>` de
> `BeneficiosAplicaciones`— cablea algo al nivel de MÓDULO.**

`DECISION.md` los agrupó a los diez bajo *«cablean ancho de MÓDULO»*. **Es una
confusión de NIVEL**, y es la clase que `CLAUDE.md` §La causa común documenta seis
veces: *se mide al nivel que está a mano, no al nivel donde vive la propiedad*. El
precedente de MONOGRÁFICO (`anchoPct` 70·80·90) es **del nivel de módulo**; nueve
de los diez no están en ese nivel, así que **el precedente no les aplica
directamente** y la pregunta no puede ser una sola.

**Consecuencia inmediata: la pregunta se abre en TRES, una por nivel**, y cada
una tiene su propia consecuencia sobre el esquema. Medir una sola y extenderla a
las otras dos sería fabricar el arreglo falso a escala de tanda.

**Y lo que la lectura del fuente NO puede contestar, que es por lo que hay que
medir igual:** un módulo sin clase de ancho en el clon **es un módulo al 100 %**.
Si el original le da 80 %, el `grep` no ve nada — no hay valor cableado que
encontrar, hay un valor **ausente**. Es exactamente el defecto de *«no varía»*
que el eje de RANGO existe para cazar, y es invisible a cualquier lectura de
código.

---

## 1 · EL DISCRIMINADOR: Test B, no Test A — y por qué

El encargo de la tanda dice: *«SECTOR y grupo C son builder, así que px absolutos
iguales a 1440 y a 390 significan CAMPO»*. Eso es el **test A** (el de Divi), y es
la regla general del régimen de builder — correcta para el **ritmo**.

**Aquí no se puede usar, y lo dice `CLAUDE.md` con esta propiedad como ejemplo
literal:**

> *⚠ Alcance: [el test A] vale para el RITMO … **NO vale para la caja ni para la
> tipografía**. En Divi el **ancho de módulo** se escribe en % igual que su
> default, así que el número **se mueve con el ancho lo escriba quien lo
> escriba**; y sin embargo es un campo — 70 · 80 · 90 · 100 % en la misma página.
> Aplicado ahí, el test A responde «plantilla» a cosas que son campo: **da la
> respuesta al revés.***

Así que el discriminador de esta tanda es el **test B**, el general:

> **¿Varía de un módulo a otro DENTRO DE LA MISMA PÁGINA?** Si dos hermanos del
> mismo hueco traen valores distintos, lo escribió una persona: **es un campo.**

**No es una desviación del encargo: es la excepción que el propio `CLAUDE.md`
declara para esta propiedad exacta.** Se deja escrito aquí porque, aplicando el
test A, esta tanda habría contestado «plantilla» y desbloqueado los 10 **por el
motivo equivocado**.

**Y el falso negativo del test B se declara también** (`CLAUDE.md`, tabla de
falsos negativos): B no ve *«un campo que el editor puso uniforme en toda la
página»*. Por eso el veredicto «no varía» **no se escribirá como «es plantilla»**,
sino con la etiqueta que corresponde — ver §4, resultado PLANTILLA.

---

## 2 · ALCANCE — declarado, y cerrado

| | |
|---|---|
| **instancias SECTOR** | **4** — `calidad-del-aire-en-las-ciudades` · `control-de-emisiones-industriales` · `contaminacion-por-construccion` · `estudio-de-la-contaminacion-atmosferica` |
| **instancias grupo C** | **6** — 3 `/casos-de-exito/*` + 1 `/case-studies/*` + 2 `/faqs/*` |
| **instancias CONTROL** | **2** — los dos MONOGRÁFICOS (`…-en-edar`, `…-petroleo-y-gas`) |
| **total rutas** | **12** |
| **lados** | **2** (original + clon) |
| **anchos** | **1440 y 390** |
| **cargas** | **12 × 2 × 2 = 48** |
| **niveles medidos** | **3** — fila, columna, **módulo** |

**Los 2 monográficos entran como CONTROL, no como muestra.** Su respuesta ya está
medida y es **CAMPO** (`anchoPct` 70·80·90 en `src/lib/monografico.ts`, 19
módulos). Si la sonda no reproduce esa varianza en el control, **la sonda está
mal y su resultado sobre SECTOR y grupo C no vale** — es la regla de `CLAUDE.md`
*«antes de creerte un pleno, reconstruye UN caso a mano contra una medida buena
anterior»*, aplicada por adelantado.

**Los 2 anchos son obligatorios** aunque el discriminador sea intra-página: el
ancho de módulo puede estar puesto solo en escritorio (Divi permite valor por
breakpoint), y **medir solo 1440 no distingue «campo de escritorio» de «campo en
los dos»** — que son dos campos distintos en el esquema.

**Lo que NO entra, dicho para que no se amplíe sobre la marcha:** grupo A (209
páginas, régimen **plantillado** — su discriminador es otro, la varianza *entre*
instancias, y mezclarlo invertiría la lectura), HOME, PRODUCTO, CATÁLOGO,
SOFTWARE y los 13 del centro de ayuda.

---

## 3 · EL INSTRUMENTO — `clase-rango`, y sus DOS números

La sonda no existe; construirla es coste declarado de esta tanda
(`PRE-REGISTRO.md` §PASO 3). Cierra con **dos** números porque **el defecto de
esta clase es «no varía»**, y una sonda de un solo número no lo ve:

| eje | qué compara | de dónde sale | qué defecto caza |
|---|---|---|---|
| **FIDELIDAD** | Δ de ancho % por elemento **emparejado**, clon vs original | **pares** (requiere emparejar) | el clon pone otro valor |
| **RANGO** | nº de valores **distintos** intra-página, en cada lado por separado | **conjuntos por lado** (NO requiere emparejar) | el clon pone **un** valor donde el original pone varios |

> **La independencia de los dos ejes es estructural y es la razón de ser del
> segundo: se calculan de datos distintos.** La fidelidad necesita pares; el
> rango no. Donde el emparejamiento falla —y falla: el eje horizontal tiene **17
> filas sin emparejar**— la fidelidad **enmudece** y el rango sigue hablando.

### Test en NEGATIVO — cada sabotaje por SU invariante

**Antes de creerle un limpio**, y **entero** (`CLAUDE.md` §sondas, corolario:
*cada arreglo de una sonda vuelve a correr el test en negativo, entero*).

| sabotaje | qué hace | **tiene que caer por** | y **NO** por |
|---|---|---|---|
| `fidelidad` | desplaza el ancho de **todos** los elementos del clon un δ constante | **FIDELIDAD** (todo par Δ≠0) | rango — la varianza se conserva a los dos lados |
| `rango` | aplana el clon a **un solo valor** y le borra la firma, de modo que **no empareja nada** | **RANGO** (distintos clon = 1, original > 1) | fidelidad — que se queda **sin pares y lo dice** |
| `muerto` | selector que no casa en ninguna página | censo de selectores | — |
| `pleno` | patrón ubicuo | guarda de pleno | — |

El sabotaje `rango` es el que **prueba que el segundo número sirve**: reproduce
el caso real —instancias que no emparejan— y ahí la fidelidad no puede opinar
mientras el rango sí. **Se asertará sobre los CONTADORES, no sobre el código de
salida**, porque «salió rojo» no distingue por cuál de los dos invariantes cayó
— y esa distinción es justo lo que hay que probar (`CLAUDE.md` §sondas, regla 1:
*un solo canal de verdad*).

Contrato obligatorio: `Evaluadas` declarado (mínimo derivado, no escrito), `__q`
/`__qa` en vez de `querySelector`, congelado en `medidas/`.

---

## 4 · LOS RESULTADOS Y QUÉ SIGNIFICA CADA UNO — escrito antes de mirar

**Se decide por NIVEL.** Un mismo veredicto en niveles distintos tiene
consecuencias distintas, así que hay tres decisiones, no una.

### Resultado **CAMPO** — el original varía intra-página en ese nivel

| nivel | qué pasa con los 10 | qué pasa con el esquema |
|---|---|---|
| **MÓDULO** | **NO se abren: se convierten en TRABAJO.** El precedente de MONOGRÁFICO se extiende, y los componentes que aplanan el módulo a 100 % están cableando el valor de la primera instancia | **F2-1 SIGUE BLOQUEADA** hasta añadir `anchoPct` (o el nombre que se decida) a los content types de SECTOR y grupo C, con su **defecto explícito** (100) y omitido en el dato cuando coincide |
| **COLUMNA** | se convierten en trabajo **de retícula**, no de campo, salvo que la varianza exceda la rejilla de Divi | si la varianza es la rejilla de Divi (47.25 / 29.6667 / 20.875…), es **plantilla derivable del nº de columnas**: cero campos. Si NO lo es, es un campo de columna y **bloquea** |
| **FILA** | se convierten en trabajo | **86 %/80 % por familia ya está registrado** en `ESQUEMA-CMS.md` §6b como derivable de la colección. Si varía **dentro** de una página, esa entrada del esquema está mal y hay que corregirla: **bloquea** |

**En los tres casos la conclusión operativa es la misma y hay que decirla:** un
CAMPO significa **más trabajo, no menos** — los 10 dejan de estar «sin probar»
para estar «probados y mal», y F2-1 gana una precondición real en vez de una
sospecha.

### Resultado **PLANTILLA** — el original NO varía intra-página en ese nivel

> **Y aquí va la precisión que impide el verde falso: «no varía» NO es
> «plantilla probada».** El test B tiene su falso negativo declarado (§1) —un
> campo que el editor puso **uniforme** en toda la página no varía y parece
> plantilla—, y este proyecto ya lo pagó: el `mb 3%` de imagen era **uniforme en
> la primera página** y lo llevaba **una sola** imagen en la segunda.

Por eso el veredicto se parte, y la diferencia decide:

| lo que sale | etiqueta | qué pasa con los 10 |
|---|---|---|
| **el CONTROL (monográfico) varía y SECTOR/grupo C no** | **PLANTILLA**, y con el instrumento **probado** en la misma corrida: la sonda demostró que sabe ver la varianza donde la hay | **SE ABREN.** El valor cableado deja de estar «sin probar»: está probado como plantilla en 10 instancias. Se anota en el esquema con su evidencia y **F2-1 se desbloquea sin tocar una línea de componente** |
| **NI el control varía** | **NO SE PUDO EVALUAR** | **NO se abren.** La sonda no ha demostrado que sepa ver la varianza; su cero es indistinguible de un cero de instrumento (`CLAUDE.md` §sondas, regla 4). Se arregla la sonda y se repite |

**Por qué los 10 dejarían de bloquear con «plantilla»**, dicho explícitamente: el
criterio de bloqueo de `DECISION.md` es *«¿el valor lo elige el editor (campo) o
se deriva del contenido/plantilla?»*, y la duda cuenta como bloqueo **solo
mientras es duda**. Un «plantilla» medido en 10 instancias, con el instrumento
validado contra un control que sí varía, **disuelve la duda**: el esquema no
necesita el campo, así que migrar sin él no lo deja mal. Los 10 pasan a la lista
de los 21 —trabajo de plantilla, arreglable después de F2-1— **si es que siguen
siendo defecto**, que es otra pregunta.

### Resultado **MIXTO** — varía en unos niveles/familias y en otros no

Es el resultado **más probable** y el que más fácil se resuelve mal, así que el
criterio se escribe ahora:

> ⚠ **El criterio NO es «lo que salga en la mayoría».** Contar instancias y
> quedarse con el lado que gana es promediar dos poblaciones distintas, y ya se
> sabe lo que produce: **una FAMILIA DE CALIBRACIÓN** — el valor de la mayoría
> cableado en el componente, funcionando hasta que llega la instancia de la
> minoría.

**El criterio es la ASIMETRÍA DEL COSTE, y es el mismo de §1.5b Razón 3 que ya
gobierna esta clase:**

> **UNA sola instancia con varianza basta para declarar CAMPO en ese nivel y esa
> familia.** Porque un campo que sobra tiene coste **cero** en el dato (se omite
> cuando coincide con su defecto) y coste **cero** en la plantilla (el defecto lo
> pone ella); mientras que un campo que falta se descubre **cuando ya hay
> contenido escrito**, y añadirlo entonces es la dirección cara.

Y su contrapartida, para que la asimetría no se vuelva coartada de modelarlo
todo:

> **La decisión es POR NIVEL Y POR FAMILIA, no global.** «Módulo varía en SECTOR»
> **no** autoriza a añadir el campo a grupo C, ni «fila varía en un caso»
> a tocar SECTOR. Cada celda de la matriz `nivel × familia` se decide con **su**
> evidencia, y las celdas sin varianza observada se anotan como tales con su n.

**Y el desempate cuando una celda tenga n bajo:** con n = 1 instancia y cero
varianza, la celda **no** se declara plantilla — se declara **SIN PROBAR con su
n**, que es lo que este proyecto escribe cuando no ha mirado bastante. No se
rellena con el veredicto de la celda vecina.

---

## 5 · LO QUE ESTA MEDICIÓN NO PUEDE CONTESTAR

Dicho por adelantado, para que no se le pida después:

1. **Si el valor cableado es el CORRECTO.** Ésa es fidelidad, y la contesta el
   primer número — pero solo en las instancias que emparejen.
2. **Si un nivel sin varianza hoy la tendrá con las instancias sin poblar.**
   Puertos y Minería no están, 53 de 57 casos no están. Una celda plantilla lo
   es **sobre las instancias medidas**, con su n al lado.
3. **Nada del régimen plantillado.** Grupo A queda fuera a propósito (§2).

---

## 6 · ESCALÓN DECLARADO

Se comprobará contra las tres condiciones del encargo —(a) ninguna medida de esta
tanda la arbitra, (b) cara de deshacer, (c) sin precedente en `ESQUEMA-CMS.md` ni
`CLAUDE.md`— y **solo se disparará si fallan las tres**. El escalón se evalúa
**después** de medir y **antes** de tocar el esquema.

---

*Pre-registrado el 2026-08-03. La sonda `clase-rango` se construye DESPUÉS de
commitear esto; la medición, después de que su test en negativo pase entero.*
