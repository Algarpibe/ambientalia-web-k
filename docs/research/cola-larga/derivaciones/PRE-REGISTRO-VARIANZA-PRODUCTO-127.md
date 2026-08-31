# PRE-REGISTRO · 127.ª · la varianza inter-instancia de la familia PRODUCTO

**Escrito el 2026-08-31, ANTES de medir varianza.** Derivación del PASO 0:
`paso0-dominio-127.{mjs,json,log}` — controles **7/7**, exit 0, offline.

---

## 0 · Las cifras de ayer, derivadas hoy (§regla 9, también con las propias)

El encargo trae tres números de la 126.ª. Se vuelven a sacar antes de gastarlos.

| censo | instrumento | hoy | ayer | ¿reproduce? |
|---|---|---|---|---|
| familia PRODUCTO, 3 docs | OFFLINE (regex sobre el HTML) | **21 · 18 · 3** | 21 · 18 · 3 | **SÍ, al par** |
| lote, 4 arquetipos | OFFLINE — el de hoy | **20 · 8 · 12** | — | — |
| lote, 4 arquetipos | NAVEGADOR con filtro CON CAJA — 125.ª | — | 18 · 7 · 11 | **NO, y no debe** |

⚠ **El desacuerdo del lote NO es del dato: es de CRITERIO DE RECUENTO**
(§regla 31 hermana — *dos instrumentos que censan el mismo objeto tienen que
compartir el criterio, o su cruce inventa el desacuerdo*). Y se comprueba
**nombrando los elementos, no restando cardinales** (§*un cardinal es un
contenedor y absorbe la membresía*):

> **diferencia simétrica = 2 y 0.** Un solo lado. Los dos de más son **`popup`**
> (compartido) y **`dark`** (singleton), y los dos son exactamente la clase de
> nodo que el censo de ayer excluye **con razón**: sin caja, `getComputedStyle`
> no resuelve los porcentajes contra nada y devuelve ceros que entrarían en la
> distribución como si fueran dato.

O sea que los dos censos son **ciertos** y ninguno corrige al otro. El
`18 · 7` de la 125.ª es el denominador correcto **para medir geometría**; el
`20 · 8` de hoy lo es para **inventariar el HTML**. Se publican los dos con su
criterio.

---

## 1 · La premisa, declarada

**Los 3 documentos de la familia son régimen `B-` (BUILDER)** — derivado hoy,
mirando **los DOS marcadores del `<body>`** y nombrando la combinación
(§*se comprueban los DOS marcadores*, la tabla de cuatro casilleros):

| documento | casillero | secciones `…_tb_body` |
|---|---|---|
| `monitor-calidad-aire` | **`B-`** | 0 occ / 0 dis |
| `estacion-de-monitoreo-de-calidad-del-aire` | **`B-`** | 0 occ / 0 dis |
| `sensor-de-calidad-del-aire` | **`B-`** | 0 occ / 0 dis |

**Por qué es precondición y no adorno:** en `B-` existe una persona que editó
cada página, así que *varianza entre instancias = campo*. En `-T` o `--` esa
persona **no existe** y la lectura **se invierte** — lo mismo medido diría
plantilla. Nadie había mirado el `<body>` de los 2 vecinos hasta hoy.

**Si en el ESCALÓN 1 algún documento resultara no ser `B-`, esta predicción no
le aplica** y su reparto se publica aparte.

---

## 2 · El ancho, dentro de la predicción (§*una predicción sobre una propiedad
tapada se escribe con su ancho*)

**Las dos mitades se predicen a 1440 Y a 390**, y las dos se miden a los dos
anchos. Con una diferencia deliberada respecto de la 125.ª:

> La 125.ª tomó **la cascada sólo a 1440**. Esta tanda la toma **a los dos**,
> porque `FN-bp` —el editor escribiendo por punto de ruptura, compilado en
> `@media` con ordinal— es exactamente el caso en que **el ganador de la cascada
> cambia con el ancho** (§regla 35). Medir la cascada a un solo ancho es medir
> en el ancho donde la regla no compite.

---

## 3 · El techo, derivado antes de gastar la tanda

| | n |
|---|---|
| pares de los 46 cuyo marcador está en ≥2 docs de la familia — **alcanzables** | **46 de 46** |
| fuera de alcance | **0** |

Los **7** marcadores del lote están **los 7** entre los **18** compartidos de la
familia. O sea que el dominio nuevo **puede** pronunciarse sobre los 46 enteros;
lo que no está dicho es que vaya a hacerlo.

**Y el corte que cambia lo que se puede predecir** (§*el test A supone que hay
algo escrito*):

| de los 46 | n |
|---|---|
| **SIN ESCRIBIR** — el único valor observado es `0`, el inicial de la propiedad | **40** |
| con valor **no-inicial** y sin varianza | **6** |

Los 6 con valor son `modulo-beneficios` `mb` (×2 anchos, 31.6719 / 30) y
`kunak-faq-item` `pt`·`pb` (×2 anchos, 17 en las 4 instancias).

---

## 4 · El instrumento del ESCALÓN 1 — DOS patas, y la segunda no es opcional

**Pata 1 · varianza inter-instancia** sobre la familia (3 docs, mismo arquetipo,
`B-`): dos documentos con valores distintos para la misma pieza ⇒ **CAMPO**.

**Pata 2 · la cascada** (`CSS.getMatchedStylesForNode`, a los dos anchos). Del
**selector ganador** de cada eje se deriva:

| selector ganador | veredicto | por qué |
|---|---|---|
| lleva **ORDINAL** (`et_pb_<tipo>_<n>`) en algún compuesto | **CAMPO** | el ordinal lo emite el constructor por módulo: lo escribió el editor |
| **GENÉRICO** (sin ordinal) | **PLANTILLA** | el tema o el core del constructor |
| dentro de `@media` **y con ordinal** | **CAMPO por punto de ruptura** (`FN-bp`) | la pestaña tablet/móvil del editor |
| **no hay declaración ganadora** | **SIN ESCRIBIR** | nadie tocó nada |

⚠ **Y una condición que se escribe ANTES de mirar, no después:** un eje cuyo
valor ganador **es el inicial de la propiedad** sale **SIN ESCRIBIR sea cual sea
el selector**. Un reset genérico (`*{margin:0}`) que produce `0` no es «la
plantilla decidió este valor»: es que nadie decidió. Sin esta condición, la pata
2 dictaría PLANTILLA en casi los 46 y eso sería el **pleno** de §sondas 4 —
*un patrón que casa en TODAS tampoco mide nada*.

Cada eje que se declare **PLANTILLA** sale con su segunda pata escrita: el
selector ganador, su **unidad declarada** y si vive **dentro de un `@media`**.

---

## 5 · LA PREDICCIÓN

**Unidad: el par (marcador × ancho × eje). Denominador: 46.**

| mitad | qué predice | punto central | rango |
|---|---|---|---|
| **A** · varianza inter-instancia | pares de los 46 que pasan a **CAMPO** | **6** | 2 – 14 |
| **B** · cascada, sobre los que tienen valor no-inicial | pares de los 46 que pasan a **PLANTILLA** o a **CAMPO por ordinal** | **6** | 4 – 10 |
| **A ∩ B** · solape | pares resueltos por las dos | **≤ 2** | 0 – 2 |
| — | **RESUELTOS en total** | **12** | 6 – 22 |
| — | **SIGUEN ABIERTOS** (SIN ESCRIBIR + SIN PROBAR) | **34** | **≥ 25** |

**Predigo que la mayoría sigue abierta**, y la razón está derivada: **40 de los
46 son SIN ESCRIBIR**, y un eje sin declaración no tiene cascada a la que
preguntar ni valor que pueda variar salvo que un vecino traiga uno.

**Predicción lateral, sobre pares NUEVOS que el lote no tenía:** la familia
comparte **18** marcadores contra los **7** del lote, así que el dominio de la
medición crece. Predigo **≥ 100 pares evaluables** en la familia, contra los
**52** del lote. Esto **no resuelve** ninguno de los 46 — es dominio nuevo, y se
publica con su propio cardinal y su propio reparto.

---

## 6 · LAS REFUTACIONES, escritas — cada mitad por los DOS lados

### Mitad A · por defecto

> **Refutada si 0 de los 46 muestran varianza en la familia.** Entonces el
> dominio mayor no aportó nada y los 46 se quedan exactamente donde estaban.

**Y hay que decir si el cero es del dominio o del instrumento, así que lleva su
control:** los **6 CAMPO ya conocidos** tienen que **reproducirse** donde son
evaluables — `iconos-xs-2` `mb` y `iconos-md-3` `mb` están en los 3 documentos
de la familia. Si tampoco reproducen, **la primera hipótesis es el instrumento**
(§sondas 4 · §regla 16), no el original.

### Mitad A · por exceso

> **Refutada también si ≥ 40 de los 46 muestran varianza.** Un pleno en 3
> documentos del **mismo arquetipo** no es un hallazgo: es un emparejamiento que
> casa nodos distintos (§regla 29).

**Control:** se publica el cardinal de **instancias por marcador y documento**.
Si un marcador trae 1 nodo en un documento y 19 en otro, no se están comparando
las mismas piezas y el conjunto de valores no es comparable.

### Mitad B · por defecto

> **Refutada si 0 pares con valor no-inicial obtienen selector ganador
> clasificable** (ni ordinal ni genérico). Entonces la cascada no aporta y
> **ningún par pasa a PLANTILLA en esta tanda** — se dice con su cardinal y los
> 46 se reescriben sólo con lo que mueva la mitad A.

### Mitad B · por exceso

> **Refutada también si la cascada dicta PLANTILLA en ≥ 90 % de los 46.** Es el
> pleno de §sondas 4 y la primera hipótesis es el instrumento — casi con
> seguridad un reset genérico contándose como decisión de plantilla, que es lo
> que la condición del §4 existe para impedir.

---

## 7 · Lo que esta tanda NO contesta, declarado antes (§regla 14)

- **NO mide el clon.** La varianza es propiedad del **ORIGINAL**; el clon no
  entra en ningún eje de esta medición. Un Δ contra el clon sería otra tanda.
- **NO siembra ni cablea lectores.** Las 4 rutas de F3-5 siguen leyendo de
  `src/lib/`, con **0 filas** y **0 lectores**.
- **NO alcanza a los 11 marcadores singleton del lote ni a los 3 de la
  familia** — siguen NO ESTABLECIDOS con su denominador.
- **NO alcanza al eje `módulos`** (35 componentes de 97), que sigue `·`.
- **NO mide los ejes fuera de `mt`·`mb`·`pt`·`pb`.** La caja y la tipografía
  quedan fuera del alcance, y el test A **no vale para ellas** de todos modos.
