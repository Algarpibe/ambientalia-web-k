# Cobertura de medición — qué se ha comparado contra el original y qué no

**Fecha: 2026-08-01.** Diagnóstico puro: no se arregló nada y no se midió nada
nuevo. Todo sale de leer las salidas congeladas de `scripts/qa/medidas/` y el
código de las 41 sondas.

## Por qué existe este documento

En la tanda de la miga (A-QA1b) tres rutas —`/accesorios`, `/software-…`,
`/kunak-api`— resultaron tener el mismo defecto que `/monitor-calidad-aire`. No
lo escondieron pasando una comprobación: **nunca se habían comparado con el
original en ese eje.** Su Δ0 del 2026-08-01 fue la primera medición de esas
migas en la historia del proyecto.

De ahí la pregunta que contesta esta matriz: **¿qué más está en esa
situación?** Y el criterio, que es el que hace útil el documento:

> **«No hay defecto conocido» y «no se ha mirado» producen exactamente el mismo
> informe.** Sólo se distinguen mirando la lista de lo que se ha medido — que es
> esto.

## Cómo se lee

Tres estados, y la distinción entre los dos primeros es el punto entero:

| | significado |
|---|---|
| **O** | **comparado CONTRA EL ORIGINAL**: alguna sonda abrió los dos lados y congeló el par |
| `c` | comparado **solo clon-contra-clon** (`clon-base`, `offsets`): detecta regresión respecto a un build anterior, **no dice si el clon se parece al original** |
| `·` | **nunca** |

> ⚠ **`c` NO es media medición: es cero información sobre fidelidad.** Un
> `clon-base` limpio dice «no he cambiado nada respecto a ayer», y ayer podía
> estar mal. Los tres defectos de la miga vivían en rutas con `c` verde durante
> meses. Y en A-QA1b se midió además su límite: `clon-base` dio **31/31 sin
> mover un píxel** en la corrida que corregía **+33.25 px** de ancho, porque
> mide alto y estructura.

## La matriz · 31 rutas × 9 ejes

| ruta | docH | base cruda (h1.y) | árbol secciones | filas | módulos | offsets/holgura | anchos horiz. | enlaces | comportamiento |
|---|---|---|---|---|---|---|---|---|---|
| **HOME** ||||||||||
| `/` | c | **O** | c | · | · | · | · | **O** | · |
| **PRODUCTO** ||||||||||
| `/monitor-calidad-aire` | c | **O** | c | · | · | · | **O** | **O** | · |
| **CATÁLOGO** ||||||||||
| `/accesorios` | c | **O** | c | · | · | · | **O** | **O** | · |
| **SOFTWARE** ||||||||||
| `/kunak-api` | c | **O** | c | · | · | · | **O** | **O** | · |
| `/software-de-medicion-calidad-del-aire` | c | **O** | c | · | · | · | **O** | **O** | · |
| **SECTOR** ||||||||||
| `/sectores/calidad-del-aire-en-las-ciudades` | c | **O** | **O** | **O** | · | c | **O** | **O** | · |
| `/sectores/contaminacion-por-construccion` | c | **O** | c | · | · | · | · | **O** | · |
| `/sectores/control-de-emisiones-industriales` | c | **O** | c | · | · | · | · | **O** | · |
| `/sectores/estudio-de-la-contaminacion-atmosferica` | c | **O** | c | · | · | · | · | **O** | · |
| **MONOGRÁFICO** ||||||||||
| `/sectores/…-olores-en-edar` | **O** | **O** | **O** | **O** | **O** | c | · | **O** | · |
| `/sectores/…-petroleo-y-gas` | **O** | **O** | **O** | **O** | **O** | c | **O** | **O** | · |
| **CASO** ||||||||||
| `/case-studies/distrito-baja-emision-rio-de-janeiro` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/casos-de-exito/…-des-moines-iowa` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/casos-de-exito/red-calidad-de-aire-para-world-athletics` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/casos-de-exito/…-acuifero-por-lindano` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| **FAQ** ||||||||||
| `/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-…` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| **A · blog / término** ||||||||||
| `/contaminacion-por-metano` | c | **O** | c | · | · | · | **O** | **O** | · |
| `/emisiones-atmosfericas` | c | **O** | c | · | · | · | **O** | **O** | · |
| `/todas-nuestras-soluciones-en-el-iotswc` | c | **O** | c | · | · | · | **O** | **O** | · |
| `/cloruro-de-hidrogeno-hcl` | c | c | c | · | · | · | · | **O** | · |
| `/contador-particulas-suspension-movilidad-sostenible` | c | c | c | · | · | · | · | **O** | · |
| `/la-contaminacion-del-aire-el-asesino-silencioso-de-europa` | c | c | c | · | · | · | · | **O** | · |
| `/metano` | c | c | c | · | · | · | · | **O** | · |
| `/monitorizacion-de-emisiones-del-trafico-urbano` | c | c | c | · | · | · | · | **O** | · |
| `/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos` | c | c | c | · | · | · | · | **O** | · |
| `/running-for-clean-air` | c | c | c | · | · | · | · | **O** | · |
| **A · documento científico** ||||||||||
| `/recursos/…/exposicion-de-los-atletas-…` | c | **O** | c | · | · | · | **O** | **O** | · |
| `/recursos/…/idoneidad-de-una-red-…` | c | c | c | · | · | · | · | **O** | · |
| `/recursos/…/desafio-airlab-de-microsensores-2023` | c | c | c | · | · | · | · | **O** | · |
| `/recursos/estudios-cientificos/…/soluciones-avanzadas-…` | c | c | c | · | · | · | · | **O** | · |

### Recuento

| eje | **O** | `c` | `·` | sonda que lo compara | congelado en |
|---|---|---|---|---|---|
| enlaces | **31** | 0 | 0 | `enlaces` | *no congela* ⚠ |
| base cruda (h1.y) | **21** | 10 | 0 | `c-cabecera` (17) + `a-cascaron`×`clon-base` a mano (4) | `c-cabecera-{1440,390}` · `a-cascaron-…-4` |
| anchos horizontales | **12** | 0 | 19 | `a-miga` (11) · `c-banda` (2) | `a-miga-…-2026-08-01-{3,4}` · `c-banda-{1440,390}` |
| árbol de secciones | **9** | 22 | 0 | `c-cmp` · `mono-cmp` · `tree-cmp` | `c-cmp-{1440,390}` · `mono-cmp-*` · `tree-cmp-*` |
| docH | **8** | 23 | 0 | `c-cmp` · `mono-cmp` | idem |
| filas | **3** | 0 | 28 | `tree-cmp` · `mono-cmp` | `tree-cmp-{edar,urbano}-1440` |
| módulos | **2** | 0 | 29 | `mono-cmp` | `mono-cmp-{edar,petroleo}-{1440,390}` |
| offsets / holgura | **0** | 3 | 28 | — *(ninguna)* | `offsets-sectores-*` (solo clon) |
| comportamiento | **0** | 0 | **31** | — *(ninguna)* | — |

### Tres cosas que el recuento esconde y hay que decir

**1 · «anchos 12/31» está inflado: son 12 rutas de UN elemento.** Once vienen de
`a-miga`, que mide **solo la miga de pan**, y dos de `c-banda`, que mide **solo
la banda de título**. **Ninguna ruta del proyecto tiene su ancho de cuerpo
comparado con el original.** Leído bien, el eje horizontal está a **0 en lo que
importa** — que es justo donde apareció el defecto de la tanda anterior.

**2 · De las 41 sondas, solo 9 abren los dos lados.** `a-miga`, `c-banda`,
`c-cabecera`, `c-cmp`, `cmp-sector`, `mono-cmp`, `tree-cmp`, `enlaces` y
`ruido`. Las otras 32 son **censos del original** (recon: `a-spec`, `c-censo`,
`lh-*`, `esqueleto`…) o **guardas del clon** (`clon-base`, `offsets`,
`corte-cuerpo`, `dos-rutas`, `c-bases`). Ambas cosas son útiles y **ninguna
mide fidelidad**.

**3 · `enlaces` está a 31/31 pero no congela nada.** Es la única O completa del
cuadro y su evidencia **no existe en `medidas/`** — contradice la regla 2 de
§sondas (*una sonda que no congela produce afirmaciones que no se pueden
auditar*). Es un hueco de otra clase: no de cobertura, de trazabilidad.

## PASO 2 · Coste de cerrar cada hueco

### Baratos — una corrida de una sonda que ya existe

| hueco | cómo | coste |
|---|---|---|
| **base cruda de las 10 rutas de grupo A que faltan** | `npm run qa:c-cabecera` a 1440 y 390. **Deriva las rutas del build**, así que las 14 nuevas entran solas: hoy está congelada a 17 porque se corrió antes de que grupo A emitiera | **2 corridas.** El mejor ratio del cuadro |
| **filas de los 3 sectores restantes** | `tree-cmp` acepta cualquier sector; hay 2 congelados de 6 | 3 corridas ×2 anchos |
| **filas/secciones a 390 de los sectores ya medidos** | `tree-cmp` solo tiene congelado **1440** | 2 corridas |
| **anchos de miga**: ya está a 11/11 formas | — | hecho en A-QA1b |

### Piden sonda nueva o generalizar una existente

| hueco | por qué no es barato | coste estimado |
|---|---|---|
| **docH + árbol de las 23 rutas en `c`** | `c-cmp` tiene **las 6 rutas del grupo C cableadas** y `mono-cmp` las 2 del monográfico. No hay ninguna sonda general de *docH+árbol original-vs-clon*. Lo barato es **generalizar `c-cmp` para que derive rutas del build**, como ya hace `c-cabecera` | **editar 1 sonda** + 2 corridas. Alto valor |
| **offsets/holgura contra el original** | `offsets.mjs` es clon-only **por construcción**: toma una ruta del clon y mide holguras dentro. Compararla exige abrir el par y casar árboles | sonda nueva, o modo `--orig` |
| **anchos horizontales del CUERPO** | no existe nada. `a-miga` y `c-banda` son de un elemento cada una. Hace falta una sonda de **composición horizontal** (ancho de fila, de columna, de módulo, y el *wrap* de cada bloque de texto) | **sonda nueva.** La más cara y la que más tapa |
| **comportamiento** | `a-behaviors` y `c-behaviors` **solo abren el original**: son recon de fase 1, no comparación. Comparar exige guionizar la interacción en los dos lados | sonda nueva |
| **congelar `enlaces`** | trivial: `w()` ya existe | 1 línea |

## PASO 3 · Prioridad, con el criterio escrito

**Criterio.** Se prioriza por `P(defecto oculto)`, y se estima con tres señales
que el proyecto ya ha pagado por conocer:

1. **¿El eje puede ser absorbido?** (`CLAUDE.md` §El NIVEL). Un eje que un
   contenedor tapa esconde defectos aunque haya medidas cerca. Los horizontales
   los tapa el *wrap*; los verticales, la fila con holgura.
2. **¿Hubo una sonda comparadora apuntándole cuando se construyó?** Si no, su
   verde nunca significó nada.
3. **¿Hay precedente medido?** Un eje que ya escondió un defecto real vuelve a
   hacerlo.

### Tu apuesta, contrastada

> *«Los ejes HORIZONTALES y los arquetipos construidos temprano, porque el
> instrumental creció con el proyecto.»*

**La primera mitad: CONFIRMADA, y más fuerte de lo que la formulaste.** No es
que los ejes horizontales estén poco medidos: **el ancho del cuerpo está a cero
en las 31 rutas.** Lo único horizontal que existe son dos sondas de un elemento
cada una, y las dos nacieron **reaccionando a un defecto ya encontrado**
(`c-banda` en C-QA1, `a-miga` en A-QA1) — nunca preventivamente. Y las tres
señales del criterio apuntan a la vez: el *wrap* absorbe (1), no hubo sonda (2),
y ya escondió dos defectos —el kicker de `/monitor` a 50px y la miga— (3).

**La segunda mitad: PARCIALMENTE DESMENTIDA, y la corrección es útil.** Si la
causa fuera la edad, la cobertura crecería con el tiempo. No lo hace:

| arquetipo | construido | docH | árbol | filas | módulos |
|---|---|---|---|---|---|
| HOME · PRODUCTO · CATÁLOGO · SOFTWARE | **el más temprano** | `c` | `c` | · | · |
| SECTOR | medio | `c` | 1 de 4 | 1 de 4 | · |
| MONOGRÁFICO | medio | **O** | **O** | **O** | **O** |
| CASO · FAQ | tardío | **O** | **O** | · | · |
| **GRUPO A** | **el más reciente** | **`c`** | **`c`** | **·** | **·** |

**Grupo A es el más nuevo y está tan descubierto como el más viejo.** Así que la
variable no es la edad:

> **Lo que predice la cobertura no es cuándo se construyó un arquetipo, sino si
> la tanda que lo construyó tenía una sonda comparadora apuntándole.** El
> monográfico es el mejor cubierto porque nació con `mono-cmp` y `tree-cmp`
> hechos para él. Grupo A es el peor porque su tanda se apoyó en `clon-base` —
> un guardián clon-contra-clon— y en `a-cascaron`, un censo del original: dos
> sondas que **nunca se tocan**, salvo en las 4 formas que se emparejaron a mano.

Corolario operativo, que es el que vale para la siguiente tanda: **un arquetipo
nuevo no hereda cobertura.** Si su tanda no estrena o reutiliza una sonda de dos
lados, nace en `c` y ahí se queda — y `c` se lee como verde.

### Orden propuesto

| # | qué | por qué | coste |
|---|---|---|---|
| **1** | **`c-cabecera` a 1440 y 390** | cierra 10 rutas del eje **base**, que es el punto de apoyo del que cuelgan todos los demás Δ. La sonda ya deriva del build: las 14 de grupo A entran solas | 2 corridas |
| **2** | **generalizar `c-cmp` a las rutas del build** + correrla | convierte 23 `c` en O en **docH y árbol** de golpe. Es el mayor salto de cobertura por unidad de trabajo | 1 edición + 2 corridas |
| **3** | **sonda de composición horizontal del cuerpo** | eje a **0/31** con dos defectos ya cobrados y el mecanismo (*wrap*) que los esconde a 1440 | sonda nueva |
| **4** | **`tree-cmp` a los 3 sectores restantes y a 390** | SECTOR tiene 4 instancias de una plantilla y solo 1 medida; es exactamente la forma «corrección aparente por contenido corto» de A-QA1b | 5 corridas |
| **5** | congelar la salida de `enlaces` | regla 2 de §sondas, y cuesta una línea | 1 línea |
| **6** | comportamiento | 0/31, pero es el eje **menos** propenso a defecto silencioso: una interacción rota se ve al usarla, no se esconde en un píxel | sonda nueva |

**Lo que NO recomiendo priorizar:** `offsets` contra el original. Es caro y su
valor está acotado — `offsets` sirve para **diagnosticar** cuando ya sabes que
algo no cuadra, no para **detectar**. Como red de detección, la composición
horizontal (#3) cubre más por menos.

## Qué decidir con esto

Los huecos #1, #2 y #4 son **corridas de sondas existentes**: caben en la tanda
CLASE sin abrir nada. El #3 es una sonda nueva y **es el que justifica una tanda
de cobertura propia** — es también el que la evidencia señala con más fuerza.
