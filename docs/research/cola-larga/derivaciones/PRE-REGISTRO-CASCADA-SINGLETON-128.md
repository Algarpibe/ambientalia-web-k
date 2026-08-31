# PRE-REGISTRO · 128.ª · LA CASCADA SOLA, SIN EMPAREJAR

**Escrito y commiteado ANTES de correr nada** (§regla 8b). Fecha derivada del
sistema: **2026-08-31**. `HEAD` al escribirlo: el commit del ESCALÓN 1.

---

## 0 · EL DIFF DE LO QUE VOY A TOCAR — derivado del instrumento, no recordado

§regla 8b, segunda mitad: *«la lista de lo que tocaste es un conjunto derivable
y escribirla de memoria produce una predicción INCOMPLETA que se lee como
cumplida»*. El cambio todavía no existe, así que aquí van **los símbolos
exactos** que pienso tocar de
`docs/research/cola-larga/derivaciones/escalon1-varianza-127.mjs`, leídos hoy
del fichero:

| símbolo / bloque | línea hoy | qué le hago |
|---|---|---|
| `const DOMINIO` (L74) · `const SIN_ETCACHE` (L78) | 70-80 | **añado** `const SIN_EMPAREJAR = !!process.env.SIN_EMPAREJAR` al lado, misma forma |
| el bucle `for (const [marc, docsSet] of compartidos)` (L289) | 288-387 | **no lo toco.** El modo nuevo es un bloque HERMANO, no una rama dentro |
| `const pares = []` (L288) | 288 | **añado** `const filas = []` para el modo nuevo |
| el veredicto en cascada (L346-364) | 346-364 | **extraigo** a `function veredictoDe({hayVarianza, todoInicial, ganadores, conOrdinal, genericos, enMedia, coherente, varianzaEstructural})` para que los dos caminos compartan la MISMA función. Es el punto donde el NO-OP se puede romper, y por eso se extrae en vez de duplicarse |
| `const CASOS_ORDINAL` (L99) · `esTokenOrdinal` (L95) | 92-103 | **no los toco.** El detector de ordinal es el mismo |
| la salida `dominioNuevo` (L675) | 675 | **no la toco** — es *«pares nuevos respecto de la 125.ª»*, NO un modo sin emparejar. El nombre engaña y es congelado (§regla 5): el mío se llama `porDocumento` |
| el objeto de salida (L~660-690) | ~660-690 | **añado** la clave `porDocumento` y el bloque de informe |
| el desvío de nombre por sabotaje | ~692-700 | **añado** `NEG_SIN_ORDINAL` a la lista que la sonda comprueba ella misma |
| `noContesta` | ~688 | **añado** lo que el modo nuevo NO contesta |
| **sabotaje NUEVO** `NEG_SIN_ORDINAL` | — | quita el ordinal de los selectores ganadores (en el DATO, no en el umbral — §regla 28a) |

**Control de esta lista:** después de aplicar el cambio, `git diff --stat` y la
lista de símbolos tocados se comparan **contra esta tabla**, y lo que sobre o
falte **se escribe**. Una predicción sobre una lista incompleta se lee como
cumplida porque lo olvidado no sale nombrado en ninguna parte.

---

## 1 · EL DOMINIO, DERIVADO DE CONGELADAS ANTES DE GASTAR NADA

No es predicción: es el techo, y acota la tanda antes de gastarla. Derivado de
`escalon1-varianza-127-control-lote.json` §`censo` y §`pares`, al grano fino
**documento × marcador × ancho × eje**:

| arquetipo | filas | SIN MEDIR hoy | SIN ESCRIBIR | PLANTILLA | CAMPO |
|---|---|---|---|---|---|
| PRODUCTO | 136 | 84 | 40 | 10 | 2 |
| CATÁLOGO | 32 | 4 | 22 | 4 | 2 |
| SOFTWARE | 48 | 12 | 28 | 6 | 2 |
| SOFTWARE-corta | 40 | 0 | 32 | 8 | 0 |
| **TOTAL** | **256** | **100** | **122** | **28** | **6** |

> ⚠⚠ **Y ESTO YA CORRIGE LA PREMISA DEL ENCARGO ANTES DE MEDIR NADA.** El
> encargo dice que el modo sin emparejar *«desbloquea 3 de las 4 rutas»*. Al
> grano de MARCADOR, **CATÁLOGO y SOFTWARE-corta no aportan ni un marcador
> nuevo** —sus 4 y sus 5 marcadores están TODOS ya dentro de algún par— y
> SOFTWARE aporta **uno** (`iconos-md-2`). De las 100 filas hoy sin medir,
> **84 son de PRODUCTO** y sólo **16 de los tres singleton**.
>
> **Así que el premio del modo nuevo NO es «filas nuevas»: son 16.** El premio
> es el otro: **re-adjudicar POR DOCUMENTO las 120 filas de los 3 singleton que
> hoy heredan un veredicto COMPARTIDO** con otros arquetipos. Eso es §regla 41
> en su corolario —*la varianza entre arquetipos distintos no prueba campo*— y
> es exactamente la vía por la que los 2 CAMPO del lote están adjudicados hoy.

---

## 2 · LAS PREDICCIONES, CON NÚMERO Y RANGO, POR LOS DOS LADOS

### P1 · ¿cuántas de las filas hoy `SIN ESCRIBIR` de los 3 singleton resuelve la cascada sola?

**Dominio: 82 filas.** Predicción: **0**, rango **0–0**, **y es ÁLGEBRA, no
medición**: `SIN ESCRIBIR` se asigna cuando el único valor observado es el
INICIAL de la propiedad, y esa condición se evalúa **antes** que la cascada. Un
par `todoInicial` exige que TODOS los valores de TODOS sus documentos sean 0, así
que cada documento por separado también los tiene todos a 0. **Las dos hipótesis
no son distintas** (§*antes de fichar una indeterminación, comprueba que las dos
hipótesis sean DISTINTAS*), y decirlo ES la respuesta.

> Si sale ≠ 0, **no es un hallazgo del original: es que el modo nuevo cambió el
> orden del veredicto**, o sea un defecto del instrumento. Esta predicción es un
> CONTROL disfrazado de predicción, y así se lee.

### P1b · ¿cuántas de las 16 filas hoy SIN MEDIR de los 3 singleton resuelve la cascada?

**Dominio: 16 filas** (CATÁLOGO 4 · SOFTWARE 12). A la tasa base de las 156 hoy
cubiertas —SIN ESCRIBIR 78 % · PLANTILLA 18 % · CAMPO 4 %—:

| | predicho | rango |
|---|---|---|
| CAMPO | **0** | 0–2 |
| PLANTILLA | **2** | 0–6 |
| SIN ESCRIBIR | **14** | 8–16 |

### P2 · la dirección contraria — ¿cuántos de los 10 PLANTILLA del LOTE dicta CAMPO la cascada leída por documento?

**Predicción: 0, rango 0–0, y otra vez por ÁLGEBRA.** El agregado construye
`ganadores` recorriendo los documentos del par y hace `conOrdinal =
ganadores.filter(g => g.ordinal)`, o sea una **UNIÓN**. Luego
`par PLANTILLA ⟺ conOrdinal.length === 0 ⟺ NINGÚN documento tiene ganador
ordinal`. Por documento no puede aparecer un ordinal que la unión no tuviera.
**Control derivado hoy: de los 10 PLANTILLA, con `ordinal: true` → 0.**

> **La pregunta del encargo tiene 0 instancias separadoras POR CONSTRUCCIÓN**, no
> por pobreza del dominio. Se declara y se sustituye por las dos que sí separan:

### P2b · ¿ENCOGEN los 2 CAMPO del lote al leerse por documento? ← **la que sí separa**

**Y es la que puede ser el hallazgo.** Los 2 CAMPO del lote —`menu-anclas` 1440
`mb` y `pt`, 3 documentos cada uno, o sea **6 filas**— están adjudicados por
**`via = pata 1 · varianza inter-instancia`**, y esa varianza es **entre
ARQUETIPOS DISTINTOS**, que es justo la vía que §regla 41 declara incapaz de
confirmar campo. Por documento esa pata **no existe** y los 6 se re-adjudican
por cascada sola.

| | predicho | rango |
|---|---|---|
| filas que siguen CAMPO (por ordinal PROPIO) | **6** | 0–6 |
| filas que caen a PLANTILLA o SIN ESCRIBIR | **0** | 0–6 |

Predigo 6 porque los selectores ganadores del par ya incluyen `.et_pb_text_7` y
`.et_pb_text_14` —ordinales—; **si alguno de los 3 documentos no tiene ordinal
PROPIO, encoge**, y eso sería un CAMPO del content type sostenido por la vía
inválida.

### P2c · ¿caen PLANTILLA a SIN PROBAR por documento?

El agregado también une los **genéricos**. Un documento sin genérico legible
propio cae a `SIN PROBAR` donde el par decía PLANTILLA. Predicción: **0**, rango
**0–8** sobre las 28 filas-PLANTILLA.

### P3 · ¿cuántas siguen abiertas?

Sobre las **256 filas** del lote, re-adjudicadas todas:

| veredicto | predicho | rango |
|---|---|---|
| SIN ESCRIBIR | **200** | 190–215 |
| PLANTILLA | **46** | 30–50 |
| CAMPO | **10** | 2–12 |
| SIN PROBAR | **0** | 0–10 |

**ABIERTAS = SIN ESCRIBIR + SIN PROBAR: predicho 200 de 256 (78 %), rango
190–225.**

---

## 3 · EL CONTROL QUE ADJUDICA, Y EL UMBRAL

**El NO-OP es el control** (§regla 5bis: tocar el instrumento CADUCA sus
congeladas; el NO-OP es lo único que demuestra que no las caducó):

| corrida | tiene que reproducir AL CONJUNTO |
|---|---|
| `DOMINIO=lote` | 52 pares · CAMPO 2 · PLANTILLA 10 · SIN ESCRIBIR 40 · SIN PROBAR 0 · estructural 4 · sus 13 controles en verde |
| `DOMINIO=familia` | 132 pares · CAMPO 8 · PLANTILLA 26 · SIN ESCRIBIR 98 · SIN PROBAR 0 · estructural 0 |

**Si no reproduce, la tanda PARA en el CORTE 3** y se dice que el instrumento
cambió de significado. No se ajusta la expectativa (§regla 21).

**El umbral se evalúa UNA VEZ, contra la primera corrida cuyo CONTROL pase**
(§regla 39). Ninguna cifra de una corrida con el NO-OP en rojo decide nada — ni
para cortar ni para seguir. Y esto **no autoriza a re-correr hasta que el número
guste**: si el NO-OP ya pasaba y una predicción sale fuera de rango, **sale
fuera de rango** y se escribe REFUTADA.

---

## 4 · LOS SABOTAJES, Y CUÁL PUEDE HABERSE MUERTO VERDE

| sabotaje | qué anula | qué predigo |
|---|---|---|
| `SONDA-DATA-SEM-SOLO-EL-ULTIMO` | escribe `data-sem` en bucle ⇒ sólo el último marcador | **sigue mordiendo** en los dos modos: el modo nuevo también lee `semanticas` |
| `SONDA-VARIANZA-ESTRUCTURAL-LEIDA-COMO-CAMPO` | quita la rama estructural ⇒ los 4 vuelven a CAMPO | **MUERE VERDE en el modo nuevo** — sin emparejamiento no hay varianza que leer mal, así que su Δ es 0 y su caso pasa a tener **0 instancias separadoras** (§regla 21, la vuelta) |
| **`NEG_SIN_ORDINAL` (nuevo)** | quita el ordinal de los selectores ganadores, **en el DATO** (§regla 28a) | **TODO cae a PLANTILLA o SIN ESCRIBIR**: 0 CAMPO por cascada. Si el reparto NO se mueve, el detector de ordinal no mide lo que dice |

**Si `SONDA-VARIANZA-ESTRUCTURAL` muere verde en el modo nuevo, se SUSTITUYE por
su simétrico, no se borra** (§regla 21): inyectar un ordinal CONOCIDO en un
documento y exigir que la sonda lo cace **y lo NOMBRE**.

---

## 5 · LO QUE ESTE PRE-REGISTRO NO CONTESTA

- **no dice si los 40 `SIN ESCRIBIR` deben cablearse**: siguen sin declaración a
  la que preguntar, y §*el test A supone que hay algo escrito*;
- **no toca definiciones de campo** del content type. El `down` generado por
  Payload está fichado como CLASE (§regla 42, dos fechas), así que mover campos
  es la tanda SIGUIENTE, con los números delante;
- **no mide el quinto arquetipo** que el PASO 0 encontró (los 18 cartuchos,
  153/153 pares homogéneos). Queda fichado con su cardinal, no medido;
- **no dice si el umbral J ≥ 0.7 del PASO 0 es el correcto**: hereda el criterio
  de la 123/126/127.ª.
