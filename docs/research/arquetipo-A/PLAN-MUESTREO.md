# PLAN DE MUESTREO — arquetipo A (detalle plantillado, 209 páginas)

> **Escrito el 2026-07-30 ANTES de mirar un solo contenido.** Se registra antes
> por la misma razón que el pre-registro del experimento Urbano: elegir la
> muestra después de ver los contenidos es elegirla sabiendo qué conviene.
>
> El arquetipo A lo definió `../RECON-LISTADOS.md` §3: **blog (149) + término de
> Kunakpedia (37) + documento científico (23) = 209 páginas**, las tres con el
> mismo esqueleto medido — `tb_body` de 2 secciones, sin secciones propias, con
> módulo `post_content`.

## 0 · El modo de fallo que este plan existe para evitar

**La familia S9–S11** (`../../PENDIENTES-QA.md` §CLASE): cuatro residuos del
arquetipo SECTOR con una sola causa raíz — *un componente construido para el
contenido de UNA instancia, no para un rango de contenidos*. Ninguno apareció en
el QA de la página para la que se construyó: **solo se ven al poblar la segunda,
la tercera o la cuarta.**

Y el precedente cuantificado: el monográfico se construyó con 2 páginas, y la
segunda **rompió ocho propiedades** que la primera daba por plantilla.

De ahí las dos consecuencias que gobiernan este plan:

1. **2 instancias por forma no valen.** Es exactamente el tamaño de muestra que
   produjo S9–S11.
2. **Elegir «las tres primeras del listado» tampoco vale.** Las primeras de un
   listado están ordenadas por fecha, que no correlaciona con nada estructural.
   Una muestra por conveniencia mide el caso medio; lo que rompe un arquetipo son
   **los extremos y los payloads raros**.

## 1 · La decisión de diseño: censo para el inventario, muestra para la lectura

Son dos preguntas distintas y **no necesitan el mismo tamaño**:

| pregunta | método | tamaño |
|---|---|---|
| **¿Qué elementos aparecen dentro del `post_content` y con qué frecuencia?** (PASO 3) | **CENSO** — extracción mecánica del HTML servido de **las 209** | **209 / 209** |
| **¿Cómo es el cascarón y qué varía?** (PASO 2) y la spec por sección | **MUESTRA ADVERSARIA** con lectura en profundidad | ver §2 |

**El inventario no se muestrea.** Contar etiquetas dentro de un contenedor es
`fetch` + regex: no hace falta navegador ni lectura, así que muestrear sería
aceptar incertidumbre a cambio de nada. Con el censo, la frecuencia de cada
elemento es **un dato, no una estimación**, y la pregunta «¿esto es raro o es
que no lo he visto?» —que es la que produjo S9–S11— deja de existir.

Lo que sí se muestrea es la **lectura**: mirar 209 páginas en profundidad no
aporta sobre mirar 24 bien elegidas.

## 2 · Tamaño de muestra por forma, y su justificación

| forma | población | muestra | papel |
|---|---|---|---|
| **entrada de blog** | 149 | **12** | **de aquí se escribe el modelo** |
| **término de Kunakpedia** | 37 | **6** | **validación** |
| **documento científico** | 23 | **6** | **validación** |
| | 209 | **24** | |

**Por qué 12 y no 3, ni 30.** No sale de una fórmula: sale de lo que este
proyecto ya midió.

- **Cota inferior, empírica:** en SECTOR, el campo `flujo` **necesitó los 8
  sectores** para salir bien; con 2 se habrían inventado los valores
  equivocados (`CLAUDE.md` §«Cómo se decide bien»). Y las 8 propiedades del
  monográfico aparecieron **en la instancia 2 de 2**, o sea que la curva de
  hallazgos ni siquiera había empezado a aplanar cuando se acabó la muestra.
  **Cualquier N donde todavía aparezcan tipos nuevos es un N corto.**
- **Cota superior, práctica:** el rendimiento decae rápido. Con el censo
  cubriendo la frecuencia, la lectura solo tiene que **ver cada tipo de payload
  al menos una vez** y **ver los dos extremos de longitud**. Eso lo dan ~12.
- **12 y no 6 en blog** porque es la forma de la que se escribe el modelo y la
  que más población tiene (149 = 71 % de A). Las otras dos son el test, y un
  test no necesita el tamaño del entrenamiento.

**Y el tamaño no es fijo de verdad: hay regla de parada.** Ver §4.

## 3 · La regla de selección — adversaria, mecánica y pre-registrada

La muestra **no la elijo yo**: la elige esta regla sobre las señales que extraiga
el censo. Es deliberado — mi criterio es justo la fuente de sesgo que S9–S11
demuestra que existe.

Por forma, y en este orden de prioridad:

| # | criterio | cuántas | por qué |
|---|---|---|---|
| **1** | **la más larga** del corpus (por longitud de texto del `post_content`) | 1 | el extremo que rompe alturas cableadas — es literalmente S10/S11 |
| **2** | **la más corta** | 1 | el otro extremo: contenido mínimo, donde se ven los defaults |
| **3** | **una por cada payload raro presente** en el corpus: tabla · galería · embebido/`iframe` · código · cita · lista de definición · formulario · audio/vídeo | ≤ 8 | son los que un campo de texto rico tiene que admitir, y los que un parser ingenuo rompe |
| **4** | **la de más tipos de elemento distintos** (mayor variedad interna) | 1 | la que más probabilidades tiene de romper una plantilla |
| **5** | **relleno aleatorio** con semilla fija, hasta completar el cupo | resto | **control anti-sesgo**: una muestra solo adversaria exagera lo raro. Sin instancias del caso medio no se puede saber qué es típico |

**El criterio 5 no es relleno decorativo.** Una muestra 100 % adversaria da un
modelo que sobre-generaliza: todo parece opcional y variable. Las aleatorias son
las que permiten decir «esto sí es el caso normal».

Si un payload del criterio 3 **no existe** en el corpus, no se sustituye por otro:
se anota como **ausente**, que es un dato del contrato del campo rico.

## 4 · Regla de parada — registrada antes

El tamaño de §2 es un **suelo**, no un cupo:

> **Si entre las últimas 3 instancias leídas de una forma aparece un tipo de
> elemento que no estaba en el inventario, la muestra de esa forma se amplía en
> 3** y se vuelve a comprobar. Se declara **saturación** cuando 3 lecturas
> seguidas no añaden nada nuevo.

Tope duro: **24 por forma**. Si se llega al tope sin saturar, el resultado que se
escribe es **«no saturado»** —no un modelo con aire de completo—, y eso es en sí
el hallazgo: un corpus que no satura no se modela con un content type cerrado.

## 5 · El test fuerte: validar contra las otras dos formas

El modelo se escribe **desde blog** y se valida **contra término y documento
científico**. Lo que cuenta como fallo de validación, dicho antes:

| resultado | qué significa |
|---|---|
| las 12 de validación entran en el modelo de blog **sin campos nuevos** | A es un arquetipo con 3 modelos de contenido, como decía el recon |
| hace falta **algún campo** para término o para doc. científico | la frontera está ahí y se escribe; A se parte o gana un campo, y se dice cuál |
| hace falta **otra estructura** (no un campo) | A no es un arquetipo: el recon de listados se quedó corto y hay que decirlo |

Es la misma asimetría del recon anterior: **refutar es barato, probar es caro.**
Un «entra sin campos nuevos» con 24 instancias es fuerte pero **no es una
prueba**; se escribirá como lo que es.

## 6 · Lo que este plan NO hace

No construye nada, no escribe tipos en `src/`, y no decide el enrutado —eso es
PASO 4 y va aparte. Y **no toca `MonoSeccion[]`** ni el grupo D: su hipótesis
queda encolada con su pre-registro, sin ejecutarla.
