# HANDOFF — los flecos de C-QA6: el suelo bimodal NO es un umbral

> ⚠ **Tanda 2026-08-03 (13.ª), continuación de la 12.ª.** Cuatro pasos. Tanda de
> **LECTURA**: no se tocó el clon y solo se midió una ráfaga. Lo que cambia es
> **cómo se lee** un suelo que ya estaba medido — y de paso corrige el acta de
> la tanda anterior, que lo escribió como umbral.

## 0 · El titular, y corrige a la tanda de esta misma mañana

El acta del cierre escribió: *«todo residuo < 32.28 es indistinguible del estado
del original»*. **Eso es leer el suelo como un umbral, y el propio hallazgo
bimodal lo desmiente:**

> **No es una banda de 0 a 32.28: son DOS PICOS separados por 32.28 exactos, y
> entre ellos NO HAY MASA** — en las 27 cargas @1440 de `cqa6` no salió ni un
> solo valor intermedio.

| Δ | lectura |
|---|---|
| **≈ 0** | original en estado alto, el clon casa. **Limpio.** |
| **≈ 32.28** | original en estado bajo, casa con el otro pico. **Limpio.** |
| **cualquier otro** | **DEFECTO — incluidos los MENORES que 32.28.** |

**Leerlo como umbral habría tapado defectos de hasta 32 px en las rutas peor
conocidas del proyecto.** Un Δ de 12 no es «ruido pequeño»: es un valor que el
original **nunca ha producido**.

> **Forma general, que es lo reutilizable:** *un suelo acota solo si la
> distribución es UNIMODAL; si tiene picos, **discrimina**.* Por eso un suelo se
> publica con **su forma**, no solo con su número — «32.28» a secas invita
> justo a la lectura equivocada.

## 0bis · Y el Δ0 estaba redactado sin su condición

Las medidas congeladas dicen algo que el acta anterior no recogió: en **las 6**
corridas de `c-cabecera` que midieron `/software` el original salió **siempre**
en 421.39, y en **las 5** que midieron los monográficos, siempre en 261.16. **El
estado bajo nunca se dejó ver por `c-cabecera`**, y el clon se calibró contra lo
único que había delante:

```text
ANTES    clon 373.39  →  vs bajo 389.11 = −15.72  ·  vs alto 421.39 = −48.00
DESPUÉS  clon 421.39  →  vs bajo 389.11 = +32.28  ·  vs alto 421.39 =   0.00
```

> **El −15.72 no desapareció: hoy es +32.28.** Mover el clon no quitó la
> discrepancia contra el estado bajo — **cambió contra cuál de los dos estados
> el clon es exacto**. Ningún valor fijo da 0 contra los dos.

Así que **«Δ0» aquí es una afirmación CONDICIONADA AL ESTADO** y se redacta
así: *Δ0 **contra el estado alto***. Calibrar contra el alto fue deliberado —es
el dominante: 6/6 en `c-cabecera`, 2/3 en ráfagas, **23 de 27** cargas— y el
punto medio habría dado ±16.14 contra los dos, **fallando los dos**.

## 0ter · Predicción PRE-REGISTRADA, con falsador

Escrita **antes** de observarla, que es lo que la separa de un relato. Cuando el
original caiga en el estado bajo, `c-cabecera` imprimirá **+32.28 exactos**, de
forma **simultánea dentro de cada grupo**, y los grupos son **dos** —`/software`
por un lado; EDAR y petróleo por otro—. Que van por separado **está medido**,
carga a carga en la ráfaga 1 de `cqa6`:

| carga | `/software` | EDAR | petróleo |
|---|---|---|---|
| #1 | 389.11 **bajo** | 228.88 **bajo** | 228.88 **bajo** |
| #2 | 389.11 **bajo** | 261.16 **ALTO** | 261.16 **ALTO** |
| #3 | 421.39 **ALTO** | 261.16 alto | 261.16 alto |

El hueco es **32.28 en los dos grupos** pese a bases distintas
(`421.39−389.11` y `261.16−228.88`): **un solo mecanismo, sin identificar**.

> **FALSADOR:** cualquier lectura que **no sea ni ≈0 ni ≈32.28** tumba el modelo
> y reabre el mecanismo. También lo tumbaría un tercer estado, o que los dos
> monográficos dejaran de ir clavados.

**Sin contrastar todavía:** las 9 cargas @1440 de `cqa6-390` salieron las 9 en
alto. Consistente, **y no es evidencia a favor** — para eso hay que ver el bajo.

## 0quater · Rocket Loader: DESCARTADA, y la campaña de 390 en marcha

- **Detectores retirados** (`rocketToken`, `rocketLoader`), que es la cláusula
  que `ruido.mjs` tenía **pre-registrada** para el cierre de campaña. **No
  borrados en silencio:** `S 0 / N 54` queda escrito como hipótesis
  **DESCARTADA** con su recuento y sus fechas. ⚠ **Lo cerrado es el detector, no
  la pregunta:** el mecanismo sigue **sin identificar**. Test en negativo
  re-corrido: `SABOTAJE=detector` saca los dos sabotajes NO VALIDADOS — la regla
  del cero y la del pleno en una corrida.
- **Campaña `cqa6-390` arrancada**, porque *«no hay forma de dirimirlo»* no es un
  estado en el que este proyecto se quede. Ráfaga 1 hecha
  (`rafaga-2026-08-03T09-39-47.json`, `✓ 18/18 cargas`): `h1` a **0** en las
  tres @390. **Faltan 2**, y aquí **la 3 tiene que caer otro día
  obligatoriamente** — la ráfaga 1 es del 08-03 y no regala días como en `cqa6`.
  **Hasta que cierre, el −30 de EDAR@390 sigue SIN PROBAR**, con esa etiqueta.

---

# HANDOFF — C-QA6 cierra a 1440, el −15.72 se disuelve, y un `rm` deja un cabo que no se puede atar

> ⚠ **Tanda 2026-08-03 (12.ª).** Los cuatro pasos del encargo. Tanda de
> **MEDICIÓN Y REGISTRO**: no se tocó el clon. Lo que cambia es qué Δ se pueden
> leer en 3 rutas, y qué dos afirmaciones dejan de estar pendientes.
>
> ⚠ **CORREGIDA por la tanda 13.ª, arriba**, en dos puntos: su §4 leyó el suelo
> como **umbral** (no lo es, son dos picos) y su «Δ0» va **condicionado al
> estado**. Lo demás sigue en pie.

## 0 · El titular

C-QA6 pedía **fijar el suelo de ruido** de `/software` y los dos monográficos, y
con él resolver el **−15.72 de `/software`**, que llevaba semanas SIN PROBAR por
debajo del episodio de ±32.28. La campaña cierra, y la respuesta es mejor que la
que se buscaba:

> **El −15.72 no era un residuo pendiente de medir: era el −48 leído contra el
> otro estado de un original BIMODAL.** El clon valía 373.39 y el original
> oscila entre 389.11 y 421.39. `389.11 − 373.39 = 15.72`;
> `421.39 − 373.39 = 48`; y **la diferencia entre los dos «defectos» es
> exactamente el suelo, 32.28**. Un clon, un defecto, dos números según qué
> estado pillara la corrida.

Y ese defecto **ya estaba arreglado**: el clon pasó a 421.39 y las 4 corridas
posteriores de `c-cabecera` lo dan a Δ0. C-QA2 · `/software` no necesitaba un
objetivo nuevo; necesitaba saber que sus dos candidatos eran el mismo.

## 1 · Antes de medir: las 3 ráfagas, en UNA escala

Las ráfagas 1 y 2 se archivaron con sello **UTC**; la 3 salía en **local**. Como
el criterio de la campaña —«≥2 h y ≥2 **días** distintos»— se comprueba
**leyendo esos nombres**, mezclarlas habría metido **5 h de error en el propio
veredicto de separación**. Re-etiquetadas **antes** de correr la 3 (`9787f68`):

| se archivó como | pasa a llamarse | día |
|---|---|---|
| `rafaga-2026-07-31T03-14-57.json` | `rafaga-2026-07-30T22-14-57.json` | 07-31 → **07-30** |
| `rafaga-2026-08-02T17-33-41.json` | `rafaga-2026-08-02T12-33-41.json` | 08-02 (igual) |

**RE-ETIQUETADO, no re-medición — y probado, no afirmado.** Contra lo que git
guarda del fichero viejo: `resumen` y `crudo` con el **mismo sha256**, el resto
del `meta` idéntico, y el instante conservado (el sello viejo en UTC **es** el
`ts` nuevo). Dos fuentes independientes concuerdan en el −5 h: el `mtime` y la
fecha del commit que congeló cada uno. Con `git mv`. El nombre viejo va **dentro
del fichero** (`meta.reetiquetado`) porque **tres** documentos lo citaban.

> **El barrido de citas encontró 8, no las 2 que se sabían** — en
> `PENDIENTES-QA`, `HANDOFF` y `TRASPASO`. Todas actualizadas.

Y desde esta tanda el fichero lleva **`meta.escala`**: la escala se **declara**,
no se deduce del nombre. Mientras no lo llevó, la única forma de saber en qué
escala estaba un sello era mirar el `mtime` — **un dato que vive fuera de la
medida y que un `git clone` reescribe**.

## 2 · La campaña: COMPLETA

```
RUTAS=/software…,/…-en-edar,/…-petroleo-y-gas CAMPANA=cqa6 npm run qa:ruido -- 3
→ medidas/campana/cqa6/rafaga-2026-08-03T08-28-44.json
✓ evaluadas 18/18 cargas · ruido · 0 selectores muertos
```

`3 ráfagas · 3 días · separadas ≥2h (3)`. Separaciones **calculadas del `ts`
absoluto**, no estimadas: **62.31 h** (1→2) y **19.92 h** (2→3).

> **Cómo cierran 3 ráfagas, que es lo que se va a preguntar.** Los ≥2 días son
> un **mínimo**, no un reparto de una ráfaga por día: las ráfagas 1 y 2 ya
> aportaban los dos (30 jul · 2 ago), así que **la 3 podía caer el mismo día que
> la 2 y habría cerrado igual**. Cayó en un tercero (08-03) y salieron 3, pero
> eso es holgura. Y **el re-etiquetado no regaló el día**: movió la 1 de 07-31 a
> 07-30, que sigue siendo distinto de 08-02.

## 3 · El hallazgo: el `h1` es BIMODAL, no tembloroso

54 cargas dan **exactamente dos estados** por combinación, a 32.28 clavados:

| ruta @1440 | bajo | alto | Δ |
|---|---|---|---|
| `software` | 389.11 | 421.39 | 32.28 |
| `edar` · `petroleo` | 228.88 | 261.16 | 32.28 |

**El estado bajo se vio SOLO en la ráfaga 1.** Las ráfagas 2 y 3 y las **6**
corridas de `c-cabecera` cayeron todas en el alto.

> ⚠ **La consecuencia que hay que leer antes de tocar estas 3 rutas: el clon
> tiene UN valor fijo y el original tiene DOS.** No existe un valor fijo que case
> con los dos, así que su «Δ0» es **Δ0 contra el estado dominante**. **Si una
> corrida futura pilla el estado bajo, las tres marcarán +32.28 y eso NO es una
> regresión.** Recalibrar entonces sería fabricar la FAMILIA DE CALIBRACIÓN
> contra la que avisa `CLAUDE.md`.

## 4 · Lo que la campaña NO cierra, y por qué

**(a) El ancho de 390 — y no lo impidió la medición, lo impidió un `rm`.**
Las 3 ráfagas exhibibles dan **0** a 390 en las tres rutas (9 cargas cada una).
Pero la **ráfaga A** del 2026-07-30 midió **±30 en las tres @390**, y **su
fichero se borró a mano**. El suelo es «el máximo ENTRE ráfagas»: si la A
contara, sería **30**, no 0.

> Consecuencia concreta: el **−30 de `/…-en-edar` a 390** es «defecto claro» o
> «exactamente el suelo» según cuente o no esa ráfaga, y **no hay forma de
> dirimirlo**. `±30` contra `−30` es demasiada coincidencia para descartarla a
> ojo.
>
> **El borrado a mano se cobra por segunda vez, y más caro.** Hasta hoy era *«el
> número mejor pagado de la tanda es el único que no se puede exhibir»*. Ahora
> es **una decisión que no se puede tomar.** Lo cierra una ráfaga más a 390.

**(b) El MECANISMO.** La campaña fija el suelo; el *por qué* sigue abierto, y la
sonda lo imprime sola:

```
observable de mecanismo: presente en 1/3 ráfaga(s) · transiciones registradas CON observable: 0
```

Es un desencuentro de calendario: **el observable se añadió DESPUÉS de la ráfaga
1**, que es **la única con transición**. Las ráfagas 2 y 3 lo llevan pero no
cambiaron de estado — y eso se reporta *«aquí no se puede evaluar»*, no *«el
observable no sirve»*. Hace falta **una ráfaga con transición Y con observable**,
y no se provoca a demanda.

**Los dos detectores siguen NO VALIDADOS** tras 18 cargas más (54 en total):
`rocketToken` y `rocketLoader`, S 0 / N 18. No se citan en ninguna dirección.

> **Fichado, no hecho:** la propia sonda tiene escrito que un detector sin
> validar **al cerrar la campaña se retira**. La campaña ya cerró, así que toca
> retirarlos o reescribirlos — decisión sobre la sonda, no parte del cierre de
> C-QA6, y no se hace de tapadillo.

## 5 · Verificación

- `qa:lib` **69/69** · las **48 sondas compilan y declaran su mínimo** (0 sin
  contrato).
- Ráfaga 3 con `✓ evaluadas 18/18 cargas`, **0 selectores muertos**, y
  `meta.ts` + `meta.escala` comprobados **antes** de leer nada.
- Re-etiquetado probado por hash contra `git show HEAD:<fichero viejo>`.
- **Ningún `build` en vuelo** mientras la sonda medía.
- Las tres ráfagas commiteadas **antes** de escribir el acta.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
3. **El −30 de `/…-en-edar` a 390** — SIN PROBAR y **no dirimible** hasta otra
   ráfaga a 390 (§4a). No es un arreglo pendiente: es una medición pendiente.
4. **Los mínimos que no expresan su invariante**: **6** (`a-ids` · `c-behaviors`
   · `corte-cuerpo` · `dos-rutas` · `mono-cmp` · `tree-cmp`) **+1 a medias**
   (`offsets --cmp`) **+2 con denominador en otra unidad** (`c-muestra` 16/3,
   `esqueleto` 16/9). **Vivo y sin tocar en esta tanda.**
5. **`openPage` no cubre las 6 sondas que cuentan a mano** (`a-behaviors` ·
   `a-cascaron` · `a-miga` · `c-bases` · `clon-base` · `cmp-sector`): pueden
   sumar tras una 404. Para ésas el aviso es la línea gritada, no el contrato.
   **Vivo y sin tocar en esta tanda.**
6. **Las 17 filas sin emparejar** del eje horizontal, y su RANGO sin probar.
7. **Migrar a `iniciarClon()` las 45** que aún esperan un 3000 ajeno.
8. **Los 2 detectores sin validar** de `ruido` (§4b).
9. **El comportamiento sigue a 0/31** en la matriz de cobertura — el hueco mayor.

## 7 · Lo que NO hay que hacer al empezar

- **No leer el «Δ0» de estas 3 rutas como incondicional.** Es Δ0 **contra el
  estado dominante**; un +32.28 futuro es el original, no una regresión.
- **No escribir «el suelo a 390 es 0».** Es 0 **entre las ráfagas exhibibles**,
  con un ±30 documentado que lo contradice y no tiene fichero.
- **No reabrir el −15.72 de `/software`.** No es un residuo: es el −48 medido
  contra el otro estado, y el −48 ya está arreglado.
- **No citar `rocketToken`/`rocketLoader`**: 0 de 54 cargas en `S`.
- **No restar sellos de ráfaga sin mirar `meta.escala`.** Las tres están en local
  desde `9787f68`, pero cualquier fichero anterior a esa fecha en otra campaña
  puede seguir en UTC.
- **No borrar una medida a mano para dejar sitio a otra.** Es la segunda vez que
  se paga en este mismo expediente, y esta vez costó una decisión, no un número.

---

# HANDOFF — las 48 sondas corridas en vivo: el verde era MUDO en 47

> ⚠ **Tanda 2026-08-02 (11.ª).** Los cinco pasos del encargo. Tanda de
> **INSTRUMENTO**: no se midió fidelidad y **no se tocó el clon**. Lo que cambia
> es qué puede salir verde, dónde se congela la evidencia y con qué fecha.

## 0 · El titular, y es el que cambia cómo se lee todo lo demás

La tanda anterior migró las 48 sondas al contrato de `Evaluadas` y cerró
diciendo: *«las 47 compilan y declaran; si alguna falla, fallará en voz alta»*.
**Correrlas era la comprobación que faltaba**, y lo primero que sacó fue esto:

> **El HANDOFF anterior escribió «no leer un verde sin la línea de unidades:
> ahora la imprime». Medido corriéndolas: la imprimía UNA de 48.**

Las otras 47 declaraban, contaban y cerraban bien el código de salida —la guarda
funcionaba— y salían con un `✅` **sin decir sobre cuántas unidades**. El
contrato estaba cerrado **para la máquina** y abierto **para el lector**, que es
quien firma las actas. Es *documentado no es conectado* por **tercera vez en
`lib.mjs`** (tras `SIN_CLON` inerte y `BUILD_ID` sin cerrar el código).

Arreglado en el gancho de salida, no en 47 ficheros. Y todo lo demás que
encontró esta tanda **estaba en esa línea desde el momento en que existió**:

| lo que imprime | qué significaba |
|---|---|
| `evaluadas 1/1 filas comparadas` en `cmp-sector` | **verde falso**: contaba 1 de 13 |
| `evaluadas 12/1 páginas` en `corte-cuerpo` | suelo flojo: midió doce, se exigía una |
| `evaluadas 16/9 páginas` en `esqueleto` | el denominador cuenta **formas**, no páginas |
| `evaluadas 21/35 rutas` en `lh-paginas` | **rojo falso**: dos `continue` esquivaban el recuento |

## 1 · Las 48, corridas y clasificadas

**48 de 48**, en tres lotes por consecuencia. Servidor propio en el 3000 durante
toda la corrida y **ningún `build` en vuelo**.

| lote | sondas | verde | rojo legítimo | contrato bien disparado | **defecto** |
|---|---|---|---|---|---|
| **A** guardas y comparadoras | 23 | 21 | 1 | 0 | **1** |
| **B** identidad e infraestructura | 12 | 9 | 2 | 0 | **1** |
| **C** censos del original | 13 | 12 | 0 | 1 | **1**\* |

\* el de C no sale en el código de salida sino en el **fichero**: `c-cascaron`
salía verde y dejaba media medida en `medidas/`.

**Rojos legítimos** —veredictos de diseño sobre hallazgos ya fichados, y las tres
salidas **idénticas byte a byte a su congelado**—: `mono-cmp` (E3) · `a-embeds`
(16 proveedores fuera de la lista de 5) · `a-lexical` (CMS-0e, 16/24 sin
pérdida). **No se tocan.**

**Contrato bien disparado:** `ruido` con una sola corrida no puede medir
dispersión y lo dice —*«NINGUNA combinación con ≥2 corridas válidas: esta corrida
NO midió el suelo»*—. Es el 4.º arreglo de la tanda anterior funcionando.

## 2 · Los tres defectos de sonda

**`cmp-sector` — verde falso, con TRES capas tapándose.** Imprimía sus 13 filas
en pantalla y declaraba `1/1`:

| capa | qué tenía | qué hizo |
|---|---|---|
| recuento | `ev.ok(filas.length)` | `filas` es un **objeto** ⇒ `undefined` |
| firma | `ok(n = 1)` | el defecto lo convirtió en **1** |
| declaración | `minimo: 1` | 1 ≥ 1 ⇒ **verde** |

Quítese cualquiera de las tres y sale roja. Estaban las tres. **Es la regla 6
nueva de `CLAUDE.md`**: *un parámetro por defecto convierte «no lo sé» en «está
bien»*. `ok()` ya distingue «sin argumento» de «argumento `undefined`» y tira en
el segundo caso.

**`lh-paginas` — ROJO falso.** Medía las 35 rutas, informaba de las 35 y salía
con `21 de 35`. El bucle tiene **dos salidas tempranas** —«1 página» y «NO
PAGINA»— y las dos son **resultados**, no rutas sin medir. La migración puso el
`ev.ok()` al final del cuerpo y los `continue` lo esquivaban.

> **Un rojo que nadie sabe explicar se acaba ignorando.** Un falso positivo
> desactiva una alarma igual de bien que un falso negativo, solo que más despacio.

Barrida la clase: 8 sondas tienen un salto por delante de su `ev.ok()`, y **solo
ésta estaba mal**. Discriminador: *¿el camino que salta dejó un DATO o dejó un
ERROR?*

**`c-cascaron` — media medida en `medidas/`, cada corrida.** Escribía **dos veces
el mismo fichero**: una antes del veredicto y otra al final. La primera es un
prefijo estricto de la segunda y **nada en el nombre decía que estaba
incompleta**. Barrida la clase: ninguna otra escribe dos veces el mismo destino.

## 3 · Cuatro defectos más, todos en `lib.mjs` — o sea en las 48 a la vez

| | qué pasaba | alcance |
|---|---|---|
| **la línea de unidades** | la imprimía 1 sonda de 48 | 47 |
| **`w()` fechaba en UTC** | a las 19:03 del **02** congelaba como **`-08-03`** | `lib.mjs` + **22 sondas** |
| **`alLado()` duplicaba** | la idempotencia miraba solo el destino canónico ⇒ `-fecha.json` y `-fecha-2.json` **byte a byte iguales** | todas |
| **`openPage` ignoraba el HTTP** | **22 de 31** usuarias no miraban el estado; una 404 se mide como página buena | 22 |

**La fecha va en los DOS sentidos y por eso importa:** dos ráfagas de la misma
tarde pueden salir con días distintos —**verde falso del «≥2 días distintos» de
C-QA6**— y dos de días distintos pueden colapsar en la misma. `ruido` nombra sus
ráfagas con ese sello. Ahora `hoy()`/`sello()` viven en `lib.mjs` y las importan
las 22; el fichero de ráfaga añade `meta.ts` (instante absoluto) porque las
ráfagas 1 y 2 de cqa6 llevan sello UTC y restarlas contra una local mete 5 h.

**Y el 404, auditado hacia atrás:** de los **324** ficheros de `medidas/`, solo
**14 registran el estado** y los 4 valores ≥ 400 son legítimos (un negativo con
su nombre, y `c-rutas`, donde el 404 **es** la medida). **No hay contaminación
conocida — pero 310 de 324 no registran el estado, así que para ésos la pregunta
no se puede contestar**, que no es lo mismo que «están limpios».

## 4 · Y seis sondas congelaban FUERA de `medidas/`

`cmp-sector` · `mono-cabecera` · `mono-detalle` · `mono-inline` · `mono-modulos`
· `tree-todos` escribían en la raíz de `scripts/qa/`, con su congelado en
`medidas/`. **La guarda de sobrescritura compara contra el destino, y el destino
no existía: nunca disparaba.** En el lote C se la vio disparar por primera vez en
`mono-cabecera`.

## 5 · El pendiente de los mínimos CAMBIA DE ENUNCIADO

Era *«apretar los 8 suelos de 1»*. Las dos mitades estaban mal:

- **la lista de 8 estaba escrita a mano** y le faltaban `a-behaviors`,
  `cmp-sector` y el 2.º contrato de `clon-base`. **Derivada ejecutando**: 49
  declaraciones en 48 sondas, **39 derivadas** y **10 literales**;
- **el criterio no es «que no sea 1»**: para cuatro de esas diez el mínimo
  correcto **es** 1.

> **TODO MÍNIMO TIENE QUE EXPRESAR EL INVARIANTE QUE LA SONDA AFIRMA.**

**No lo cumplen 6** (`a-ids` · `c-behaviors` · `corte-cuerpo` · `dos-rutas` ·
`mono-cmp` · `tree-cmp`) **y 1 a medias** (`offsets`, con `--cmp`). **Y no se
agota ahí**: `c-muestra` (`16/3`) y `esqueleto` (`16/9`) **derivan** su mínimo y
tampoco lo cumplen, porque el denominador cuenta **formas** y el numerador
**páginas**. Nombrados, no arreglados.

## 6 · Verificación

`npm run check` **0 errores** · `qa:lib` **69/69** (el total lo **cuenta** el
test, ya no está escrito) · las **48 compilan y declaran**, con un solo veredicto
por sonda · `qa:slugs` limpio · `cmp-sector` **13/13** y `lh-paginas` **35/35**
re-corridas tras su arreglo · `c-cascaron` con **un** fichero por corrida.

## 7 · Lo que queda abierto

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
3. **Ráfaga 3 de C-QA6**, con el observable puesto. **Ojo: las ráfagas 1 y 2
   están fechadas en UTC**; la 3 saldrá en local y el `meta.ts` es lo que
   permite restarlas bien.
4. **Los mínimos que no expresan su invariante**: 6 + 1 + 2 (§5).
5. **Las 17 filas sin emparejar** del eje horizontal, y su RANGO sin probar.
6. **Migrar a `iniciarClon()` las 45** que aún esperan un 3000 ajeno.
7. **`openPage` no cubre las 6 sondas que cuentan a mano**: pueden sumar tras
   una 404. Para ésas el aviso es la línea gritada, no el contrato.

## 8 · Lo que NO hay que hacer al empezar

- **No leer un `✅` sin su línea de unidades.** Ahora la lleva siempre; si falta,
  esa sonda no es de este contrato.
- **No leer `12/1` ni `16/9` como verdes equivalentes a `31/31`.** El primero es
  un suelo flojo y el segundo un denominador en otra unidad.
- **No citar los `-2026-08-03` del lote A como del día 3**: son del 2 por la
  tarde, con el sello en UTC. Se dejan con su nombre a propósito, porque
  renombrarlos sería reescribir la evidencia del fallo que los produjo.
- **No tocar los tres rojos legítimos** (`mono-cmp`, `a-embeds`, `a-lexical`):
  son veredictos de diseño, idénticos a su congelado.
- **No usar `rocketToken`/`rocketLoader` como evidencia**: 0 de 50 cargas en `S`.

---

# HANDOFF — «0 comparado = verde» deja de depender de la atención

> ⚠ **Tanda 2026-08-02 (10.ª).** Los cuatro pasos del encargo. Tanda de
> **INSTRUMENTO**: no se midió fidelidad y no se tocó el clon. Lo que cambia es
> qué puede y qué no puede salir verde.

## 1 · El contrato, y por qué esta vez sí cierra la clase

La misma clase había aparecido **cinco veces**, cada una con su arreglo local:
`mono-cmp` (E1) · `charsCenso()` · `ancho-cuerpo` al nacer · `ruido` ·
**`clon-base`** con 31 `ERR_CONNECTION_REFUSED` y código 0. Cinco arreglos no
impidieron el sexto, así que el arreglo no era el arreglo.

> **Toda sonda DECLARA —o deriva del build— su mínimo de unidades evaluadas, y
> por debajo el resultado es NO SE PUDO EVALUAR con código ≠ 0. Nunca verde.**

`Evaluadas`, en `lib.mjs`. Lo que lo hace **estructural** y no una función más
que se puede olvidar:

- el veredicto lo fuerza un gancho de `process.on("exit")`: una sonda que declare
  su mínimo **no puede salir con 0 por debajo de él aunque nunca mire su propio
  contador**, ni con un `process.exit(0)` explícito;
- **congelar una medida sin declarar nada sale por «SIN CONTRATO»**: el olvido
  tampoco es verde;
- `minimo` es obligatorio y ≥ 1, y `new Evaluadas()` **tira** si falta o es 0 —
  una sonda que no sabe cuántas unidades debería evaluar no puede afirmar que las
  evaluó;
- las páginas las cuenta **`openPage`**, por donde pasan todas: no hay un `ok()`
  que se pueda olvidar.

**Migradas las 47.** 39 con el mínimo derivado de su lista (`× 2` en las
comparadoras: media pareja no es una comparación) y **8 con suelo declarado de
1** — `a-ids` · `c-behaviors` · `corte-cuerpo` · `d4-cta` · `dos-rutas` ·
`mono-cmp` · `offsets` · `tree-cmp`. El suelo cierra «0 = verde» pero **no
detecta una corrida parcial**: apretarlas a su lista real está anotado como
pendiente, no dado por hecho.

## 2 · `clon-base` a servidor propio, y las cuatro patas

Ya no espera un `next start` ajeno. El modo de fallo que la hizo dar verde
midiendo nada **no se detecta: no existe**. Y lleva **dos** contratos, porque
tiene dos niveles que se vacían por separado — rutas medidas y rutas
**comparadas** (una línea base sin rutas en común comparaba cero y salía con 0).

| pata | resultado |
|---|---|
| puerto muerto (`CLON=…:9`) | **exit 2** · «NO SE PUDO EVALUAR — 0 de 31 rutas» |
| build viejo (`BUILD_ID` a mitad) | **exit 2** · salida `-CONTAMINADA`, 31/31 medidas |
| 0 páginas comparadas | **exit 1** · «0 de 1 rutas comparadas» |
| control | **exit 0** · 31 comparadas · 0 con regresión |

## 3 · Dos instancias más, destapadas por el propio trabajo

**La SEXTA, dentro de otra guarda.** La de `BUILD_ID` renombraba la salida a
`-CONTAMINADA`, gritaba **y no tocaba el código de salida**. El HANDOFF que la
estrenó decía «sale por error»: no salía. Es *documentado no es conectado* por
segunda vez en `lib.mjs` —la primera fue `SIN_CLON`, inerte—. La destapó pedirle
a `clon-base` la pata de «build viejo», que habría dado verde.

**La SÉPTIMA, en el test del contrato.** El barrido que comprueba que las 47 lo
declaran es una expresión regular, y dio verde sobre `c-censo.mjs` **con dos
`const ev` y sin compilar**: miraba el texto, no el programa. `qa:lib` hace ahora
un `--check` por sonda.

Y una tercera cosa que conviene no olvidar: la migración automática produjo en
`c-muestra` un fichero **que compila** con la `ev` **fuera de alcance**, porque
el `for` de nivel 0 que parecía el bueno estaba anidado. Lo cazó revisar el diff,
no ejecutar nada.

## 4 · La auditoría: ¿hubo algún verde-sin-medir citado?

Contestada **leyendo `medidas/`**, sin re-medir. **31 corridas congeladas de
`clon-base`; en 30 todas sus páginas tienen dato.** Los dos ficheros con cero
unidades son de hoy: el diagnóstico y la pata 1 del negativo.

**Una quedó a medias:** `clon-base-1440-cqa1-despues.json`, **16 de 17** —
`/casos-de-exito/red-calidad-de-aire-para-world-athletics`, timeout de 120 s.

| afirmación | estado |
|---|---|
| acta de C-QA1: «las **11 anteriores** no se han movido un píxel» | **RESPALDADA** — las 11 están medidas |
| titular de esa corrida: «17 páginas comparadas» | **fueron 16** |
| esa ruta a 390, misma tanda | **medida y comparada** |

**Ninguna conclusión del proyecto se cae**; se corrige una cifra de titular. Y
que la respuesta exista es mérito de la regla de congelar: sin los 31 ficheros,
la pregunta no se podría contestar hoy.

## 5 · Verificación

`qa:lib` **42/42** (6 casos del contrato + barrido de declaración + barrido de
compilación) · `npm run check` **0 errores** · `qa:slugs` limpio ·
`qa:cobertura` limpio · `qa:ancho` acotada exit 0 · `clon-base` las cuatro patas.

⚠ **Lo que NO se ha corrido**: las 47 sondas enteras. Se verificó que **las 47
compilan y declaran**, y se corrieron en vivo `slugs`, `cobertura`, `ancho`,
`clon-base` y `lib`. Las demás llevan una línea insertada por barrido revisado a
mano; si alguna falla, fallará **en voz alta** — que es exactamente lo que esta
tanda instala.

## 6 · Lo que queda abierto

1. **Ráfaga 3** de C-QA6, con el observable puesto. **Desde hoy mismo** (el
   2026-08-03 ya cumple ≥2 h y tercer día).
2. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
3. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
4. **Los 8 mínimos de suelo**, a su lista real.
5. **Las 17 filas sin emparejar** del eje horizontal y su **RANGO, sin probar**.
6. **Migrar a `iniciarClon()` las 17 sondas** que aún esperan un 3000 ajeno
   (`clon-base` ya no está en la lista).

## 7 · Lo que NO hay que hacer al empezar

- **No leer un verde de sonda como «midió»** sin la línea de unidades: ahora la
  imprime, pero el hábito viene de antes.
- **No añadir una sonda nueva sin `Evaluadas`**: `qa:lib` la caza, y por eso el
  barrido tiene que seguir en verde.
- **No citar el titular de `clon-base-1440-cqa1-despues`**: son 16, no 17.
- **No dar por apretados los 8 mínimos de 1.**

---

# HANDOFF — el marcador de fila, las 177 huérfanas resueltas y el observable de la ráfaga 3

> ⚠ **Tanda 2026-08-02 (9.ª).** Los cuatro pasos del encargo. **Tanda de
> INSTRUMENTO y ADJUDICACIÓN**: se arregló cómo se mide y se adjudicó todo lo
> medido; **no se tocó ni un ancho del clon**, a propósito.

## 1 · Lo primero, porque tiene fecha: la ráfaga 3 ya tiene con qué explicar

`ruido.mjs` anota ahora, **por carga y junto al `h1`**, un observable
discriminante. La campaña llegaba a su última ráfaga sabiendo que el `h1` es
**bimodal** —dos estados a 32.28 exactos, el alto idéntico en dos días— y sin
nada con que atribuirlo, y **una condición binaria no se explica midiendo más
veces la misma magnitud.**

```bash
# desde el 2026-08-03, ≥2 h de la última (12:33 local del 2026-08-02), mejor en un 3.er día
RUTAS=/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas \
  CAMPANA=cqa6 npm run qa:ruido -- 3
```

Lo que registra: `document.fonts.status` · el `font-family` computado · **qué
familias están de verdad disponibles** (`fonts.check`) · los **renglones y el
ancho RENDERIZADOS** del titular · y la **cadena `h1`→raíz** con el
desplazamiento de cada nivel dentro de su padre.

**Los dos avisos que hacen falta para no leerlo mal, y el segundo cambia dónde
hay que mirar:**

1. **`getComputedStyle(h1).fontFamily` devuelve la lista DECLARADA, no la fuente
   con la que se pintó.** Si la webfont no llegó y se usó la de reserva, ese
   valor **no cambia**: él solo es un detector que no puede ver el fenómeno. Se
   registra igual —descarta que el CSS servido cambie— pero quien discrimina son
   `fonts.status`/`check()` y el **ancho y los renglones renderizados**.
2. **El ±32.28 no está DENTRO del `h1`: está en su `y`**, o sea que lo que crece
   está **por encima**. La cadena existe por eso: el nivel cuyo desplazamiento
   cambia entre dos cargas es **el nivel donde nace el 32.28**.

El informe distingue **tres** respuestas y no dos: *acompaña* · *no acompaña* ·
**«no se puede evaluar aquí»** (el `h1` no cambió de estado en esta ráfaga).
Confundir las dos últimas es el fallo entero de C-QA6.

**`rocketToken`: NO VALIDADO, y con número.** `N` en las **36 cargas** de las
ráfagas 1 y 2 — y `rocketLoader` igual. Eso no es «el token no interviene»: es un
detector que **nunca ha discriminado**. Sale impreso como NO VALIDADO y **no se
cita** hasta que se le vea cambiar. Si la ráfaga 3 tampoco le saca un `S`, se
retira del observable.

## 2 · El marcador de fila: 99 parejas de 181 pasan a 164 — y la hipótesis era un tercio

`data-fila` en 23 contenedores del clon. **Es identidad, no medida, y está
probado**: `clon-base` con el mismo original y el mismo día, build sin marcador
contra build con marcador, da **31 páginas · 0 con regresión · umbral CERO**.

> ⚠ **Pero el HANDOFF anterior decía que el marcador «convierte huérfanas en
> emparejadas sin tocar una medida», y medido es UN TERCIO.** Las otras dos
> terceras partes estaban **dentro del emparejador**: tenía **tres definiciones
> distintas de «el mismo texto»**, la trampa de `charsCenso()` tres veces
> seguidas en la misma función.

| causa de las 177 | qué era | lo arregla |
|---|---|---|
| filas **fantasma** del clon | el conductual bajaba a las diapositivas de un slider y a sus puntos (12 · 12 · 7 px) | el marcador |
| el original sirve **todos los idiomas** | «Related content قد يهمك أيضًا» contra el español solo | `innerText` |
| la **flecha** de los botones | `::after` en el original, `<span>` en el clon | quitarla de los dos |
| contenido que **rota** | «Artículos y Guías» se baraja; la banda de clientes es un carrusel de 2.5 s | pasada por prefijo y por **conjunto** de imágenes |

|  | antes | ahora |
|---|---|---|
| filas del original emparejadas | 99 / 181 (54.7 %) | **164 / 181 (90.6 %)** |
| huérfanas | 177 | **27** |
| filas del clon | 194 (con fantasmas) | **174, todas por marcador** |

**Las 31 rutas dan el MISMO recuento a 1440 y a 390.** No es cobertura: es el
control de que el emparejador no está inventando.

## 3 · La adjudicación — y una corrección a la cosecha de ayer

### ⚠ El «75 % → −158.39» de la HOME NO EXISTE

Era una **fila fantasma**: un bloque centrado dentro de `Testimonios` que el
detector conductual tomó por fila. Con el marcador desaparece y la fila real
empareja a **86.35 %, +5.05**, como sus siete hermanas. **El clon sirve DOS
valores de retícula, no tres**, y el peor Δ de la home es **−14.39**.

> Es la regla del pleno aplicada a un heurístico: **uno que encuentra MÁS de lo
> que hay no da error — da un número plausible de más.**

### La ficha buena de `/` (FIDELIDAD, va con C-QA3)

El original usa **86 % en sus 16 filas, sin excepción, a los dos anchos**.

| el clon | filas | Δ@1440 | Δ@390 | quién |
|---|---|---|---|---|
| fijo **86.35 %** | 8 | +5.05 | +1.36 | `SectionRow` |
| fijo **85 %** | 2 | −14.39 | −3.89 | `TrustBar` · `UltimosProyectos` |
| **cambia** 86.35→85 en `md` | 3 | −14.39 | +1.36 | `HeroSection` · `ProductosTabs` · `UltimosArticulos` |

**FAMILIA DE CALIBRACIÓN de manual:** los cinco componentes tienen variante por
familia y **las de las otras familias están a Δ0** en las 30 rutas restantes
—`TrustBar` sirve 95 % al sector, `UltimosArticulos` 86 % al sector y 80 % a
producto—. La única variante que nadie había comparado es la de la home.

### Las otras 30 rutas: **152 filas informativas a Δ0**, los dos anchos

Primera verificación real de la retícula del cuerpo del proyecto. Incluye la
**miga de pan de las 29 rutas** que la llevan, que hasta hoy solo había mirado
`a-miga` y solo el eslabón.

### Las 27 huérfanas: ninguna es un ancho

12 son **PARTICIÓN** (el clon funde en una fila lo que el original parte en dos,
o al revés) · 6 de ellas son **D1**, ya fichada · 2 son un límite del
emparejador (el carrusel de logos) · 1 es el artefacto del `h1` oculto de `/` ·
**1 es S9a, que este eje redescubrió solo** — dos instrumentos independientes
señalando el mismo párrafo. Tabla completa en `PENDIENTES-QA.md`.

⚠ **Y una medida que la tabla de Δ no cuenta:** la fila del hero de `/` mide
**1224 contra 1238.39** y no empareja (por el `h1` oculto). Serían **13** filas
con Δ≠0, no 12.

## 4 · `clon-base` daba VERDE midiendo nada

Cazado al usarla como guarda de esta tanda: **con el 3000 vacío imprimía 31
`ERR_CONNECTION_REFUSED` y salía con código 0.** La guarda de regresión del clon,
la que más se corre, no distinguía «sin regresión» de «sin medir».

Son las dos reglas de §sondas a la vez: *impreso y no contado* y *verde por
vaciado*. El aviso llevaba ahí desde el principio; lo que faltaba era que
**contase**. Arreglado —las rutas no medidas cierran el código de salida— pero
**no migrada**: sigue esperando un `next start` ajeno, y es una de las 18.

## 5 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones
(1725 · 868) · `qa:slugs` limpio (A, B y C) · `qa:lib` **31/31** ·
`qa:ancho` **exit 0 a 1440 y a 390**, con sus cuatro negativos ·
`qa:ruido` con sus tres negativos · `clon-base` **31 páginas · 0 regresión**
antes/después del marcador.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO,
   arreglo estructural. Sin tocar.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. **Va con C-QA3.**
3. **Ráfaga 3** de la campaña, **con el observable puesto**. Desde mañana.
4. **Las 17 filas sin emparejar**: 12 son partición ya nombrada; lo que no se
   puede cerrar por esta vía son las de contenido barajado.
5. **El RANGO del eje horizontal: sin probar.** `qa:ancho` solo se ha corrido a
   1440 y a 390.
6. **Migrar las 18 sondas** a servidor propio — con `clon-base` la primera, que
   ya ha demostrado el modo de fallo.
7. **Los huecos 2–5 de cobertura**: filas 6/31 · módulos 2/31 · offsets 0/31 ·
   **comportamiento 0/31**.

## 7 · Lo que NO hay que hacer al empezar

- **No citar el −158.39 de la home.** No existe: era una fila fantasma.
- **No leer «164/181» como el eje cerrado.** Y no leer «31/31 rutas» como nada:
  la unidad de este eje es la FILA.
- **No usar `rocketToken` como evidencia** hasta que dé `S` alguna vez.
- **No arreglar la home por partes**: la retícula va con C-QA3.
- **No fiarse de un `clon-base` verde sin mirar que haya medido.** Ya lo dice él,
  pero la costumbre de leerlo como «todo bien» viene de antes del arreglo.

---

# HANDOFF — el eje horizontal, medido por primera vez; y la campaña de ruido a 2/3

> ⚠ **Tanda 2026-08-02 (8.ª).** Los cinco pasos del encargo. **Tanda de
> DIAGNÓSTICO**: se midió un eje que nunca se había mirado y **no se arregló
> nada de lo que salió**, a propósito.

## 1 · El hueco nº 1 de cobertura, cerrado — y lo que había debajo

**`qa:ancho`** compara el ancho de la retícula del cuerpo contra el original en
**31 rutas × 2 anchos**. Era el **0/31 de verdad** de `COBERTURA-MEDICION.md`.

**Toda la cosecha está en `/`.** Las otras 30 rutas salen limpias. El original usa
**86 % uniforme**; el clon sirve tres anchos distintos:

| el clon sirve | Δ @1440 | Δ @390 | filas |
|---|---|---|---|
| **86.35 %** | +5.05 | +1.36 | 6 · 10 |
| **85 %** | −14.39 | −3.89 | 5 · 2 |
| **75 %** | **−158.39** | — | 1 (solo @1440) |

**Encuadre: FIDELIDAD.** Se reproduce en los dos anchos del contrato **y con el
mismo porcentaje**, no con el mismo píxel — firma más fuerte todavía que la de
«reproducirse entre anchos»: no es un residuo que sobrevive a dos maquetaciones,
es **el mismo valor equivocado escrito en la hoja de estilos**. Familia de
calibración, con el `w-[85%]` de la home ya anotado en `Footer.tsx` desde hace
tandas y nunca comparado, **porque este eje no se medía**.

**No se arregla aquí y va con C-QA3** (+289.91 abierto en la home): dos cambios a
la vez en la misma página no se adjudican.

### ⚠⚠ Y la letra pequeña, que vale tanto como la cosecha

> **«31/31 rutas» NO es «31/31 filas».** Se emparejaron **99 filas de 276**; las
> **177 huérfanas NO se compararon**. Son preguntas, no verdes.

El detector de fila del clon es **conductual** (bloque centrado más estrecho que
su sección) y **sobre-casa en los sectores**: 11 filas en el original contra
**16** en el clon. Se estrecha dando al clon un **marcador semántico de fila**
—como el `data-kunak` del pie— en vez de deducirla. Eso convierte huérfanas en
emparejadas sin tocar una medida.

## 2 · Campaña de ruido: 2 de 3 ráfagas, y tres cosas nuevas

**1 · El `h1` tiene DOS ESTADOS DISCRETOS**, separados por **32.28 exactos**, no
temblor continuo. El valor alto es **idéntico en dos ráfagas separadas por dos
días**: estable y reproducible.

**2 · La sincronía entre rutas NO es total.** En la ráfaga 1, corrida 2: los dos
monográficos ya estaban en alto y **software seguía en bajo**. Son **al menos dos
grupos**, no un interruptor global. La ráfaga 2 cayó entera en el estado alto, así
que **no confirma ni refuta**.

**3 · Latencia: cero pares útiles, y no por falta de instrumento.** La ráfaga 2
trae cronómetro (6.9–12.1 s, con un pico de 12.1 s) **y no tuvo transición**; la
ráfaga 1 tuvo transición y **es anterior al cronómetro**. Hay latencia sin
transición y transición sin latencia.

**4 · ⚠ `rocketToken` dio `N` en las 12 cargas.** Eso **no es «el token no
interviene»**: es un detector que **nunca ha discriminado**. Por la regla del
cero/pleno se anota como **sin validar**; antes de concluir con él hay que
comprobar que sabe dar `S` en alguna página.

**Ráfaga 3: a partir del 2026-08-03**, ≥2 h de la última (12:33 local del
2026-08-02) y **mejor en un tercer día**. Cierra la campaña.

## 3 · CLASE MAYOR fichada, sin tocar: el hueco de la barra en 31 rutas

| | @1440 | @1280 |
|---|---|---|
| barra del original | **185** | **136.52** |
| hueco cableado en el clon | 185 | **185** |

**No hay constante que sirva:** 185/1440 = 12.85 % pero 136.52/1280 = **10.67 %**.
La barra **no varía proporcionalmente al ancho** — la mueve el reflote del menú—,
así que ni px ni % reproducen la curva: **cualquier valor acierta solo en el ancho
donde se midió**. Es un **generador de familias de calibración**, no un número mal.

**Ámbito 31 rutas**: `CabeceraSector` (6) y **`BandaCabecera` (29)**. Defecto de
**RANGO**; arreglo **estructural** (la barra en flujo), prioridad **alta**.

> ⚠ **Y el matiz que evita un malentendido caro:** meter la barra en flujo **no es
> reabrir D1 como defecto**. D1 sigue siendo partición deliberada y sigue sin
> mover `docH`. Es **elegir la otra partición** porque la actual obliga a cablear
> un hueco. La ficha de D1 no se toca.

## 4 · Las sondas: dos defectos propios cazados antes de creerles nada

**En `ancho-cuerpo`, la primera corrida comparó 0 filas de 13 y aun así imprimió
✅ con código 0.** Dos causas, las dos de manual:

1. **La firma emparejaba con espacios normalizados.** El original separa los nodos
   en línea con espacios y el clon no: «Inicio Productos» contra
   «InicioProductos». Es la trampa de `charsCenso()` —dos definiciones de «lo
   mismo»—. Ahora la firma va **sin espacios**.
2. **Acotar se volvía verde por vaciado.** Ahora `comparadas === 0` **cierra el
   código de salida**: *una sonda que no compara nada y una que compara y no
   encuentra nada dan la misma salida*.

**Y en `lib.mjs`, la bandera `SIN_CLON` era INERTE**: se leía al cargar el módulo
y la sonda la pone **después** del `import`, así que la constante ya valía
`false`. *Documentado no es conectado*, cometido **dentro de la propia guarda**.
Ahora se lee en cada llamada.

## 5 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones ·
`qa:slugs` limpio · `qa:lib` **31/31** · `qa:ancho` con sus dos negativos
(selector muerto ⇒ error · patrón ubicuo ⇒ error · control ⇒ 0) · `c-cmp`
**exit 0 a 1440 y a 390**.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, arreglo estructural.
2. **La retícula de la HOME** — 86.35/85/75 % contra 86 %. **Va con C-QA3.**
3. **Las 177 filas huérfanas** del eje horizontal: marcador semántico de fila en
   el clon y vuelven a la comparación.
4. **Ráfaga 3** de la campaña, para fijar el suelo.
5. **Validar el detector `rocketToken`** antes de usarlo como evidencia.
6. **Migrar las 18 sondas restantes** a servidor propio (cubiertas por BUILD_ID).
7. **Los huecos 2–5 de cobertura**: filas 6/31 · módulos 2/31 · offsets 0/31 ·
   **comportamiento 0/31**.

## 7 · Lo que NO hay que hacer al empezar

- **No leer «30 de 31 rutas limpias» como el eje verificado.** Son 99 filas de
  276; el resto **no se ha mirado**.
- **No arreglar la home por partes**: la retícula va con C-QA3.
- **No usar `rocketToken` como evidencia** hasta que se le vea dar `S`.
- **No tratar el hueco de la barra como un número que ajustar.** No lo es.

---

# HANDOFF — el contrato de RANGO, el pie a Δ0 exacto, y las sondas dueñas de su servidor

> ⚠ **Tanda 2026-08-02 (7.ª).** Los cinco pasos del encargo, hechos. Lo que más
> se va a usar de aquí no es un arreglo: es **la distinción de contrato**, porque
> decide qué cuenta como defecto en todo lo que venga.

## 1 · EL CONTRATO NO ES EL MISMO A TODOS LOS ANCHOS

| dónde | contrato | qué es defecto |
|---|---|---|
| **1440 y 390** | **FIDELIDAD** | cualquier Δ ≠ 0 sobre el suelo de ruido |
| **anchos intermedios** | **COMPORTAMIENTO DE RANGO** | un valor **cableado** donde el original **varía** |

El original es **Divi fluido** y el clon es Tailwind con cortes declarados: las
dos curvas pasan por 1440 y por 390 y **no coinciden entre medias**. Igualarlas
punto a punto sería reproducir el motor de Divi, y como no hay un ancho
«siguiente» que fijar, **no termina**.

**En intermedios no se exige Δ0: se exige que el clon VARÍE donde el original
varía.** Y se arregla haciendo que dependa de lo que el original hace que
dependa — **nunca cableando el valor del ancho medido**, que es exactamente cómo
se fabrica una familia de calibración.

En `CLAUDE.md` (antes de las notas de método) y en `ESQUEMA-CMS.md` §8.1, que
añade lo que el listón de aceptación no cubría: **al migrar, una presentación
puede volverse un CAMPO, y un campo con el valor de 1440 dentro pasa el listón y
rompe el rango.**

## 2 · La cabecera a 1280: eran tres valores cableados donde Divi usa %

Descompuesta por composición — la sección del original tiene **tres** hijos y el
clon uno más un `pt` cableado:

| qué | 1440 | 1280 | era |
|---|---|---|---|
| `py` de fila | 28.7969 | 25.5938 | **2 %** |
| `mb` del módulo del `h1` | 21.6562 | 19.25 | **1.7488 %** |
| `mb` / `mt` del kicker | 29.77 / −13 | 26.46 / −11.55 | **2.4039 % / −1.0498 %** |

**Medido:** 1440 pasa a **Δ 0.00 exacto en las cuatro rutas** —mejor que con los
px, que daban −0.02—, 390 sin cambio, y 1280 de **59.34 a 48.69**.

### Lo que queda a 1280 tiene un nombre y NO se arregla con una constante

Los **48.69** son el hueco de la barra de navegación: el original vale
41 + 95.52 = **136.52** y el clon cablea **185**. Y no hay porcentaje que sirva:
185/1440 = 12.85 % pero 136.52/1280 = **10.67 %**, o sea que la altura de la barra
**no varía proporcionalmente al ancho** — la mueve la maquetación del menú. El
clon lo sabe: **su propio `header` mide 203.59 a 1440 y 157.89 a 1280**, varía
igual. Lo congelado es solo el HUECO.

> **Su arreglo es estructural —la barra en flujo, que es la partición D1— y es de
> ámbito PROYECTO, no de esta cabecera:** `BandaCabecera` cablea lo mismo para las
> otras 29 rutas (`--banda-alto` 165.58/225).

## 3 · El residuo de ~1 px del pie: era un BORDE, y es el 7.º eje

Estaba fichado como «~1 px sin descomponer». **Un residuo que se repite igual a
1440 y a 390 no puede ser ruido.** Midiendo `pt + pb + Σcolumnas` contra el alto
de la fila: el original sobraba **2.01** y el clon **1.01**, constante en los dos
anchos y en las tres presentaciones.

| presentación | orig `border-top` | orig `border-bottom` | clon |
|---|---|---|---|
| ancha · estrecha | 1px | **1px** | 1px / 0 |
| estrechaPad | **0** | **0** | 1px / 0 |

El clon servía `border-top: 1px` y nada abajo **en las tres**: −1 donde falta el
de abajo y **+1 donde sobra el de arriba**. Y no era solo alto: **en catálogo y
producto pintaba una línea de `#333` cruzando el pie que el original no tiene.**

**`footer-links` queda a Δ 0.00 exacto a 1440** en las cinco rutas y **+0.20 a
390**, con un solo dueño con nombre: la columna CERTIFICACIONES (184.25 contra
184.05).

## 4 · Las sondas, dueñas de su servidor — dos mitades

**`iniciarClon()`** arranca su servidor en un puerto libre, espera a que
responda y mata el árbol al salir (incluida excepción sin capturar). Dos sondas
pueden medir a la vez.

⚠ **No basta, y decirlo importa:** el servidor propio lee el **mismo `.next`**,
así que un build concurrente le cambia el contenido igual. De eso protege la
segunda mitad:

**La guarda de `BUILD_ID` en `w()`.** Se lee al arrancar la sonda y al congelar;
si cambió, la salida va a **`…-CONTAMINADA.json`** y sale por error.

> **Lo grave de un build a mitad de corrida nunca fue el 404: era no saber DÓNDE
> CAYÓ EL CORTE.** Ahora el fichero lo dice en el nombre.

Vive en `w()` —por donde escriben las 19— así que **las cubre todas sin tocar
ninguna**. Migrada a servidor propio: **`cabecera-cmp`**, verificada con el 3000
muerto (arranca en puerto propio, mide Δ0, deja el puerto cerrado). **Las otras
18 siguen esperando un `next start` ajeno** — mecánico y pendiente.

`npm run qa:lib` **31/31**, con los tres negativos nuevos.

## 5 · La CLASE, redefinida

> **Un componente compartido cablea los valores del PRIMER CONTEXTO en que se
> midió** — y «contexto» puede ser una **familia** (instancias 1–4), un
> **ARQUETIPO** (la 5) o hasta un **ANCHO** (la 7).

Siete instancias, **todas cerradas**. La 7 es la que estira la definición: px
donde Divi escribe %, con **Δ0 en los dos anchos del contrato** y congelado en
todo lo de en medio.

**El barrido pendiente cambia de criterio:** no «componentes que cablean
constantes de software» —eso busca una instancia— sino **componentes compartidos
con valores fijos que UN SOLO contexto consumidor ha ejercitado**. Con la
pregunta que faltaba: **si todos los consumidores ejercitan el valor IGUAL, está
sin probar aunque haya ocho.**

Y la nota de método: **la reutilización por un segundo arquetipo es un test del
primero, y a veces el único.** El `h1` al 100 % daba Δ0 en las 4 instancias de
SECTOR **a los cinco anchos** porque sus titulares son cortos.

## 6 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones
(1725 salientes · 868 entrantes) · `qa:slugs` limpio (A, B y C) · `qa:lib`
**31/31** · `c-cmp` **exit 0 a 1440 y a 390**, 31/31 cada uno, las tres
predicciones en pie.

## 7 · Lo que queda abierto

1. **El hueco de la barra de navegación**, de ámbito proyecto: **48.69 a 1280** en
   `/sectores/*` y el equivalente en `BandaCabecera` para las otras 29. **Defecto
   de RANGO**, no de fidelidad. Arreglo estructural (la barra en flujo = D1), con
   adjudicación en 31 rutas.
2. **La columna CERTIFICACIONES, +0.20 a 390.** Sub-píxel, con nombre.
3. **Migrar las 18 sondas restantes** a servidor propio. Mecánico.
4. **El barrido de la FAMILIA DE CALIBRACIÓN con el criterio nuevo** — sigue
   necesitando el ancho del cuerpo en las 31 rutas, hoy **0/31**.
5. **La ráfaga 2 de la campaña de ruido**, pendiente de su día.
6. **`/` con su pie propio**, con C-QA3 (+289.91).

## 8 · Lo que NO hay que hacer al empezar

- **No perseguir Δ0 en un ancho intermedio.** Comprueba si VARÍA; si varía,
  cumple. Un «se ficha, no se persigue» ahí **no es deuda, es el contrato**.
- **No reabrir D1 ni D2** como defectos de fidelidad: son partición. (Pero D1 sí
  es el camino del arreglo de rango del punto 7.1 — no es lo mismo.)
- **No construir con una sonda en vuelo.** Ahora se detecta, pero detectar
  significa **descartar la corrida**, no salvarla.
- **No dar por barrido un componente** porque tenga muchos consumidores: lo que
  cuenta es cuántos **ejercitan el valor de forma distinta**.

---

# HANDOFF — C1 SALDADO: 2 causas arregladas, 2 particiones fichadas

> ⚠ **Tanda 2026-08-02 (6.ª).** Los cuatro pasos del encargo, hechos. **C1 se
> cierra como capítulo**, y con él la cuarta de sus causas y una quinta
> instancia de la FAMILIA DE CALIBRACIÓN que llegó de fuera.

## 1 · El balance de C1, que es lo que hay que llevarse

| | era | veredicto |
|---|---|---|
| **D1** −225 | la cabecera del clon va **dentro** de `main` como `section.banda-cabecera` | **PARTICIÓN DELIBERADA** · fichada |
| **D2** +50 | las migas del clon son un `<nav>`, no una `<section>` | **PARTICIÓN DELIBERADA** · fichada |
| **D3** −42 | `margin-bottom` del `<article>` del CPT `solutions` | **arreglado** |
| **D4** | el pie: **5 ejes** de presentación por tipo de página | **arreglado** |

**Dos de cuatro no eran defectos.** `c1-localiza` los reconstruía al céntimo, y
reconstruir no es explicar: eran la misma altura contada de otra forma.

La prueba está congelada y es la que impide que alguien los «arregle» dentro de
tres tandas: **11 formas × 2 anchos**, la banda del clon igualando al céntimo la
cabecera del original (1440: **225** · 397.59/**397.61**; 390: 165.58 · 136.58 ·
347.25 · 419.25 · 362.91) y las migas **50 = 50**.

## 2 · ⚠⚠ LO QUE HAY QUE LEER ANTES DE `c-cmp` Y DE `COBERTURA`

> **La métrica RESTO (`docH` − Σsecciones) cuenta todo lo que vive FUERA de
> sección: migas, bandas, envoltorios. Una diferencia de RESTO puede ser
> PARTICIÓN y no defecto, y desde el número no hay forma de saberlo.**

RESTO es un **contenedor con holgura** —cabe dentro un nodo entero sin dejar
rastro— y además su frontera **la define el selector de sección de cada lado**:
`.et_pb_section` en el original, `main > section` en el clon. Dos selectores que
no denotan el mismo conjunto.

**Un Δ de RESTO se adjudica POR COMPOSICIÓN antes de tocar nada:** se enumeran
los hijos en flujo de los dos lados y se emparejan **por lo que son** —cabecera
con banda, migas con migas—, no por si casan con el selector. Instrumento:
`qa:d123`. Lo mismo vale para el **`nº de secciones ≠`** que `c-cmp` ya imprime
como **PREGUNTA**.

Coste de no haberlo tenido escrito: D1 y D2 vivieron una tanda entera como
causas pendientes, con orden de ataque y condición de bloqueo.

## 3 · La cabecera del monográfico: ancho de módulo, y la clase cambia

Era **−36.02 a 1440 y 0 a 390**. `36` es el `line-height` del `h1`: **un
renglón**, o sea envolvimiento, o sea que la causa es un **ancho**.

El original le da al `h1` el **50 %** de la fila; el clon le daba el **100 %**.
Medido a **cinco anchos** con `qa:cabecera` (los dos lados): 390 y 800 → 100 % ·
1000, 1280 y 1440 → 50 %. Cinco y no dos porque con 1440 y 390 «50 % de la fila»
y «un ancho fijo en px» **predicen lo mismo**; 1280 las separa y 800/1000 sitúan
el corte (el de Divi, 980) en vez de suponerlo.

**Adjudicado en la propiedad medida** —la sección de cabecera, `qa:cabecera`—:
edar y petróleo **−36.02 → −0.02** a 1440, sin moverse a 390; los dos sectores
intactos. Ahí sí se movieron **las 2 del monográfico y ninguna más**.

⚠ **A nivel de `docH` se movieron CINCO de 31**, y decir «2 y ninguna más» a
secas sería falso: petróleo **+36** (exacto), edar **+9** (+36 −27 de ruido), dos
sectores **±27** con su cabecera medida **sin moverse**, y un CASO **+76** que
está **fuera del alcance del cambio** — `grep -rn CabeceraSector src/` da **un
solo importador**, `sectores/[slug]/page.tsx`, así que el caso no puede haber
sido tocado. **Un alcance se cita con el NIVEL al que se midió**, igual que un
número de un par se cita con sus dos lados.

### Lo que esta instancia cambia de la CLASE — y es lo más útil de la tanda

Las cuatro instancias anteriores heredaban valores de SOFTWARE, hasta parecer que
la clase era «todo se calibró con software». **No lo es.** La clase es *un
componente compartido hereda la familia sobre la que se midió*, y aquí esa
familia es un **ARQUETIPO**: `CabeceraSector`, medido sobre SECTOR y reutilizado
por MONOGRÁFICO.

Y el defecto **es invisible en las 4 instancias de su propio arquetipo, a los
cinco anchos**: los titulares de los sectores caben en un renglón con 619 px y
con 1238.

> **Un ancho mal no cuesta un píxel hasta que el texto envuelve. Así que el
> detector de un defecto de ancho no siempre es OTRO ANCHO: a veces es OTRO
> CONTENIDO.** Barrer «las N instancias del arquetipo a dos anchos» no habría
> encontrado ésta. La encontró medir **el arquetipo vecino que comparte el
> componente**.

En `CLAUDE.md`, como segunda cara del NO-WRAP.

## 4 · Dos trampas de operación que se cobraron en esta tanda

**(a) `npm run check` CONSTRUYE.** Lanzarlo mientras una sonda mide le cambia el
`.next` al servidor vivo y salen **404 en rutas que existen** — pasó con las 4 de
`/recursos/…` en mitad de la adjudicación. Con el servidor relanzado dan 200 las
cuatro. **Lo grave no es el 404: es que no se sabe dónde cayó el corte**, así que
la corrida entera se descarta y se repite. Regla nueva en `CLAUDE.md`: **con una
sonda en vuelo, nada de `build`, `check` ni `dev`.**

**(b) La sonda nueva llegó con dos defectos, los dos «plausibles».**
`getClientRects().length` **no cuenta renglones** en un elemento de bloque —da 1
siempre—, así que la 1.ª versión publicaba «Δ renglones 0» **al lado** de «Δ alto
−36», dos números suyos contradiciéndose. Y el kicker se buscaba como `<p>`, que
en el original no lo es → `null` en las 4. Corregidos: `Range` agrupado por `top`
y búsqueda por posición.

## 5 · Estado de las sondas

```bash
npm run qa:cabecera -- 1440|1280|1000|800|390   # la cabecera de /sectores/*, los dos lados
npm run qa:d123     -- 1440|390                 # hijos EN FLUJO: distingue partición de defecto
npm run qa:d4-sus   -- 1440|390                 # el «¡Suscríbete!», por composición
```

`qa:enlaces` limpio en las dos direcciones (1725 salientes · 868 entrantes) ·
`qa:slugs` limpio (A, B y C) · `npm run check` **0 errores**.

**`c-cmp` en VERDE de verdad a los dos anchos**, cada uno con su corrida limpia y
congelada:

| ancho | resultado | salida |
|---|---|---|
| 1440 | **exit 0** · 31/31 · las 3 predicciones en pie | `c-cmp-1440-tras-cabecera.json` |
| 390 | **exit 0** · 31/31 · las 3 predicciones en pie | `c-cmp-390-tras-cabecera.json` |

A 390 **no se repitió el episodio de latencia**: las 31 rutas cargaron, incluida
la FAQ que el 2026-08-02 dio timeout de 120 s. Queda confirmado lo que decía el
reintento — era un episodio del original, no un defecto del clon ni de la sonda.

## 6 · Lo que queda abierto

1. **El alto de la cabecera a 1280**: el original varía entre 1280 y 1440
   (338.25 → 397.61) y el clon no (397.59 en los dos) → **+59.34**. Salió de paso
   al buscar el corte. **1280 no es uno de los dos anchos del proyecto**, así que
   se ficha; lo que deja escrito es que **el ritmo vertical de esa cabecera no
   está verificado fuera de 1440 y 390**.
2. **El residuo de ~1 px del pie** en las tres presentaciones (fila ~1 + columna
   CERTIFICACIONES +0.2). Sin descomponer.
3. **`+11.2` de base en `/sectores/estudio-de-la-contaminacion-atmosferica` a
   390**, anterior a esta tanda y congelado en `c-cmp-390-tras-d3.json`.
4. **La FAMILIA DE CALIBRACIÓN no se cierra como clase**: falta medir el **ancho
   del cuerpo** en las 31 rutas, hoy **0/31** en `COBERTURA-MEDICION.md`. La
   sonda no existe. **Y ahora se sabe además que el barrido tiene que incluir los
   arquetipos VECINOS que comparten componente**, no solo las instancias propias.
5. **La ráfaga 2 de la campaña de ruido**, pendiente de su día. El timeout de 120 s
   del 2026-08-02 está registrado como episodio, **pero no la sustituye**.
6. **`/` con su pie propio**, a propósito, y va con C-QA3 (+289.91).

## 7 · Lo que NO hay que hacer al empezar

- **No reabrir D1 ni D2.** Están medidas en 11 formas y dos anchos.
- **No leer un Δ de RESTO ni un `nº secciones ≠` como defecto** sin componer.
- **No dar por barrido un componente compartido** habiendo mirado solo las
  instancias de su arquetipo: si lo usa un segundo arquetipo con contenidos más
  largos, **ahí es donde vive el defecto**.
- **No construir mientras se mide.**

---

# HANDOFF — `footer-links` cerrado, D3 cerrado, D1 y D2 NO EXISTEN

> ⚠ **Tanda 2026-08-02 (5.ª).** Se hicieron los PASOS 0 a 5 del encargo y el 6
> incluida la corrida final de adjudicación a los dos anchos. **D4 está
> cerrado entero**; de las cuatro causas de C1 ya no queda ninguna abierta —
> pero **dos de ellas se cerraron demostrando que no eran defectos**.

## 1 · El titular: de las cuatro causas de C1, dos no existían

`c1-localiza` descompuso el desfase del cascarón en cuatro sumandos que
reconstruían el total al céntimo. Reconstruir no es explicar: **dos de los cuatro
eran la misma altura contada de otra forma.**

| | qué decía | qué es | estado |
|---|---|---|---|
| **D1** | −225 antes de la 1.ª sección | la cabecera del clon está dentro de `main` como `section.banda-cabecera`, y **mide 225 igual que la del original** | **partición · fichada, no se toca** |
| **D2** | +50 de hueco entre secciones | las migas del clon son un `<nav>`, y `main > section` no las cuenta. **50 = 50** | **partición · fichada, no se toca** |
| **D3** | −42 entre última sección y pie | el `margin-bottom` del `<article>` del CPT `solutions` | **CERRADO** |
| **D4** | el alto del pie | tres presentaciones por tipo de página | **CERRADO** (5 ejes) |

**Lo que lo hizo visible fue bajar un nivel.** Un hueco de 50 px puede ser aire
que sobra o un nodo que el censo no cuenta, y **los dos dan el mismo número**.
`c1-localiza` medía huecos entre secciones sin mirar dentro del hueco. La sonda
nueva —`qa:d123`— **enumera los hijos en flujo del contenedor, casen o no con el
selector de sección**, y con las dos listas delante la pregunta se contesta sola.

Comprobado en **11 formas y los dos anchos**: la banda del clon iguala al
céntimo la cabecera del original (1440: 225 · 397.59/397.61; 390: 165.58 ·
136.58 · 347.25 · 419.25 · 362.91).

## 2 · ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH` (sigue vigente)

> **Muchos `docH` se ALEJAN de 0, y eso es CORRECTO.** `docH` carga todas las
> causas a la vez; mientras el pie estuvo mal, su error **compensaba** al del
> cuerpo. Al arreglarlo la compensación desaparece y el residuo del cuerpo sale
> a la superficie.

**Y ahora hay número para exhibirlo.** A 390, de 30 rutas, **15 se alejan de 0** —
y no de cualquier manera:

| familia | movió | predicho por las piezas |
|---|---|---|
| **ancha** (grupo A · sector · monográfico · FAQ), 19 rutas | **−292 / −291** | −268.63 (D4) − 30 (legal) + 6.9 (Suscríbete) = **−291.73** |
| **estrechaPad** · `/monitor-calidad-aire` | **+354** | +339.59 (D4) − 2 (legal) − 25.09 (Suscríbete) + 42 (D3) = **+354.5** |
| **caso**, 4 rutas | −26 / −27 | D4 del caso |

**Diecinueve rutas moviéndose el mismo número, y ese número predicho por la suma
de las piezas, es la adjudicación.** No lo es que el total se acerque a cero.

**Dos residuos que NO cuadran, y los dos caen en la familia de ruido documentada
(27 · 54 · 81):** `/accesorios` mueve **+274** donde su hermano de familia mueve
+354 —**−80**, y `/accesorios` lleva el módulo «Artículos y Guías», que el
original **baraja en cada carga**—; y `/kunak-api` mueve **+69** donde D3
predice +42 (**+27**). No se persiguen: están por debajo del suelo conocido de
ese módulo.

## 3 · El «¡Suscríbete!» — y por qué dos intentos midieron el nodo equivocado

Era el residuo **entero** de `footer-links`: de las cinco columnas, cuatro
cuadraban al céntimo en las tres presentaciones.

**No fue un descuido de la sonda anterior: era la identidad.** `.et_pb_column`
identifica la columna en el original y **no existe en el clon**, así que
`closest()` subía hasta la rejilla (28 enlaces). Ahora el ancla se busca **por
texto**, la columna por `.et_pb_column` / `data-kunak`, y lo demás se **deriva**.

Dos supuestos que el HTML servido desmintió, **los dos habrían dado «0 anclas»**:

1. En el original el botón **no es un `<a>`**: es `<span role="link">` con el
   destino en **base64**, resuelto por JS.
2. **Hay uno por idioma** en el DOM, todos servidos y todos menos uno ocultos por
   CSS. «Cuántos casan» y «cuántos se ven» son preguntas distintas.

| `footer-links` | @1440 antes | ahora | @390 antes | ahora |
|---|---|---|---|---|
| ancha | −4 | **−1** | −7.7 | **−0.79** |
| software | −1 | −1 | −0.82 | −0.82 |
| estrechaPad | +1 | +1 | **+26.29** | **+1.2** |

La columna EMPRESA queda a **0.00 contra la caja del original** en las tres
presentaciones y los dos anchos.

## 4 · El NIVEL, en los dos sentidos, dentro de una misma sonda

Es el hallazgo de método de la tanda, y conviene no volver a pagarlo:

| sentido | qué pasaba | qué habría producido |
|---|---|---|
| **arriba** | la columna del clon es un **ítem de rejilla** y va `stretch`: a 1440 su caja es la de la columna más alta | Δ **+51** y **+83** leídos como defecto, siendo sobrante |
| **abajo** | en el original el `mb` del envoltorio **se escapa** de la columna (contenido 329.59, caja 313.59); el clon, contexto de formato propio, **lo contiene** | **16 px de más** cableados en las tres |

Lo que suma en la fila es **la caja**, en los dos lados — comprobado con la Σ de
las cinco columnas a 390 (orig 1325.41 · clon 1318.71 · fila −7.7).

Y su corolario, que ya está en `CLAUDE.md`: **a 1440 la fila no se movió en dos
de las tres presentaciones, y el arreglo era correcto.** Ahí EMPRESA no es la
columna más alta, así que su error estaba tapado por la holgura. **Con solo la
fila delante, dos de tres arreglos parecerían inertes.**

## 5 · Lo que queda abierto, en orden

1. ~~La corrida de adjudicación a 1440~~ **HECHA · exit 0 · 31/31**
   (`medidas/c-cmp-1440-tras-d3.json`), y es la mejor prueba de la tanda:

   | familia | rutas | movió total | de ese total, **por D3** |
   |---|---|---|---|
   | **ancha** | 22 | −87 / −88 | **0** en 19 de 22 |
   | **caso** | 4 | +256 | **0** |
   | **home** | 1 | 0 | **0** |
   | **estrechaPad** | 2 | +410 | **+42** |
   | **software** | 2 | +42 | **+42** |

   **D3 movió las cuatro rutas del CPT `solutions` y dejó las otras 27 en
   cero.** Un arreglo cuyo alcance medido y cuyo alcance servido coinciden
   ruta a ruta no necesita más adjudicación. Las tres excepciones de `ancha`
   son **±27** —la familia de ruido documentada—, no D3.
2. **La cabecera del MONOGRÁFICO: −36.02 a 1440 y 0 a 390.** Salió de paso en
   `qa:d123`. El clon sirve al monográfico **el valor del sector** a 1440 y el
   suyo a 390. Es la **regla espejo** con firma de **familia de calibración**.
   Fichada en `PENDIENTES-QA.md`, sin perseguir.
3. **El residuo de ~1 px del pie** en las tres presentaciones (fila ~1 + columna
   CERTIFICACIONES **+0.2**). Sin descomponer.
4. **La FAMILIA DE CALIBRACIÓN sigue sin cerrarse como clase**: hace falta medir
   el **ancho del cuerpo** en las 31 rutas, hoy a **0/31** en
   `COBERTURA-MEDICION.md`. La sonda no existe.
5. **`/` con su pie propio**, a propósito, y va con C-QA3 (+289.91).

## 6 · Lo que NO hay que hacer al empezar

- **No leer «se aleja de 0» como regresión** sin mirar de qué familia es y
  cuánto movió. Diecinueve rutas moviendo −292 es la prueba, no el problema.
- **No reabrir D1 ni D2.** Están medidas en 11 formas y dos anchos: son
  partición. Tocar el flujo de la cabecera en 31 rutas por un número de
  partición es el arreglo falso de manual, y ahora hay fichero para probarlo.
- **No citar el 1440 congelado como si incluyera D3.** No lo incluye.
- **No leer el `último→pie` de CASO ni de FAQ en `qa:d123`** como defecto: su
  contenedor se elige por una cadena distinta a la del clon y la sonda lo dice
  en `via`. Son dos niveles comparados, no un hueco.
- **No perseguir ±27 ni ±81** en rutas con el módulo «Artículos y Guías».

## 7 · Sondas nuevas de esta tanda

```bash
npm run qa:d4-sus -- 390|1440     # el bloque «¡Suscríbete!», por composición y con la FILA
npm run qa:d123   -- 390|1440     # los hijos EN FLUJO del contenedor, 11 formas + cadena de antepasados
```

Las dos con `Censo`, `SOLO=`, `SALIDA=`, salida congelada y **test en negativo
que escribe en otro fichero**. Catálogo y las dos trampas que existen para no
repetir, en `scripts/qa/README.md` §«Las sondas de C1».

`qa:enlaces` **limpio en las dos direcciones** (1725 salientes · 868 entrantes) ·
`qa:slugs` limpio (A, B y C) · `npm run check` **0 errores** · `c-cmp` **exit 0 a
1440**; a 390 exit 1 por **un timeout de 120 s del ORIGINAL** en una FAQ —
reintentada suelta, mide bien (`base 0 · docH −86`), o sea episodio de latencia,
no defecto del clon.

---

# HANDOFF — `footer-legal` cerrado y la CLASE nombrada; D2/D3/D1 SIGUEN SIN TOCAR

> ⚠ **Tanda 2026-08-01 (4.ª).** Se hicieron los PASOS 0, 1 y 4 del encargo.
> **Los PASOS 2 (D2/D3) y 3 (D1) NO se alcanzaron** — no es que se descartaran:
> no se llegó. Siguen exactamente como estaban.

## ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH`

> **Con D4 arreglado, muchos `docH` se ALEJAN de 0, y eso es CORRECTO.**
>
> `docH` carga **las cuatro causas de C1 a la vez**. Mientras el pie estuvo mal,
> su error **compensaba** a D1/D2/D3; al arreglarlo, la compensación desaparece.
> Medido: `/sectores/calidad-del-aire-en-las-ciudades` pasa de **+41 a −23**.
>
> **El eje en el que se adjudica D4 es `qa:d4`, no `qa:c-cmp`.**

Es el catálogo de compensaciones de `CLAUDE.md` **visto desde el otro lado**: no
se descubre una compensación al medir, se **fabrica** una al arreglar una de las
dos mitades. Un arreglo correcto de una causa de una suma **tiene** que empeorar
el total mientras las demás sigan abiertas.

## 1 · Estado del pie, medido contra el original

| forma | @1440 links · legal · fondo | @390 links · legal · fondo |
|---|---|---|
| ancha (A×3 · sector · monográfico · caso · faq) | −4 · +1 · **0** | **−7.7** · +1.59 · **0** |
| software | −1 · +1 · **0** | −0.82 · +1.58 · **0** |
| catálogo · producto | +1 · **0** · **0** | **+26.29** · +0.58 · **0** |

**`footer-legal` y `footer-background` están CERRADOS.** El legal pasó de
**+31.59 / +1.59 / +2.6** a **+1.59 / +1.58 / +0.58**.

**Todo lo que queda vive en `footer-links`, y dentro de él en UNA columna.** De
las cinco, cuatro cuadran al céntimo en las tres presentaciones; el residuo
entero está en **EMPRESA**, la única con el botón «¡Suscríbete!».

## 2 · Lo siguiente, y por qué en ese orden

1. **El bloque «¡Suscríbete!»** — cierra `footer-links` y con él D4 entero. Sus
   márgenes (`mt 16 · mb 46 · pb 3.1`) están cableados con el valor de SOFTWARE:
   **−0.01 ahí y +25.1 en catálogo**. ⚠ **Dos intentos de medir su caja dieron
   nodos equivocados** (el lado del clon casó la rejilla entera, 28 enlaces): la
   sonda necesita bajar un nivel más en el clon —la fila es la REJILLA, y las
   columnas son sus hijos— antes de fiarse de ningún número suyo.
2. **D2** (+50 de huecos entre secciones) y **D3** (−42 entre última sección y
   pie): **sin diagnosticar y sin tocar.**
3. **D1** (−225): **sigue bloqueada**, con la misma condición — solo si se
   demuestra que mueve `docH` y no solo la partición.

## 3 · CLASE nueva: LA FAMILIA DE CALIBRACIÓN (`PENDIENTES-QA.md`)

> Un componente compartido construido midiendo **UNA** página hereda los valores
> de esa familia, acierta en ella y falla en las demás — y **el acierto se lee
> como verificación**.

Firma: **una familia a Δ≈0 exacto y las otras con residuos de signos distintos**.
Tres instancias, las tres con familia SOFTWARE: alto del pie · tipografía del pie
· bloque Suscríbete (abierta).

**Candidatos listados y NO arreglados**: `Breadcrumb` (8 importadores) y
`UltimosArticulos` (6) cablean `w-[80%]` **por defecto**, y el ESQUEMA §6b dice
que los mismos anchos gobiernan la retícula del **cuerpo**. Y lo que el barrido
no cubre: `SectionRow` (15) y `HeaderNav` (10) — **un grep por constantes
conocidas es un cribado, no un censo**. La clase no se cierra sin medir el ancho
del cuerpo, hoy a **0/31**.

## 4 · Dos correcciones a lo que este mismo HANDOFF decía

**(a) La atribución del bloque social estaba invertida.** El acta de D4 decía que
el clon servía el valor de `estrecha` en las dos; **servía el de `ancha` en las
tres**. El error de método es el que `CLAUDE.md` nombra: citar un número de una
tabla de pares **sin decir de qué lado es**. `d4-tipo` solo abría el original;
ahora abre los dos.

**(b) El primer arreglo del bloque social NO FUNCIONÓ, y en silencio.** Se cableó
como `pb-[30px]` sobre una caja de **alto fijo**: con `box-sizing: border-box` el
`padding` se absorbe. La clase **estaba en el HTML servido** y era **inerte** —
el marcador dio verde y el cambio no existía—. Lo cazó medir después, no leer el
diff.

## 5 · Sondas

- **`c-cmp` vuelve a poder dar VERDE.** `P-C3-3` barría las 31 rutas con
  `.entry-content`, un selector escrito para 6 → REFUTADA en toda corrida. Ahora
  su ámbito es `caso` + `faq`, **con guarda de que acotar no se vuelva no
  mirar** (cuenta zonas casadas y etiquetas; 0 ⇒ NO SE PUDO EVALUAR).
  Negativos: `SABOTAJE=cauces` → refuta · `SABOTAJE=ruta` → error · control →
  **exit 0**. `SOLO=` y `SALIDA=` nuevos.
- `qa:d4-tipo` abre ya **los dos lados** y lee la composición de `footer-legal`.
- ⚠ **MONOGRÁFICO no se pudo medir a 390** (timeout de 120 s en el original, que
  tiene episodios de latencia documentados). La sonda lo registra como **error**,
  no como «sin diferencia».

`qa:enlaces` limpia · `qa:slugs` limpia · typecheck · lint 0 errores · build.
⚠ **La adjudicación de las 31 rutas NO se re-corrió tras el PASO 1** — el estado
de `c-cmp` es el de la tanda anterior.

---

# HANDOFF — D4 ARREGLADO (3 partes, con residuo fichado); D2/D3/D1 sin tocar

> ⚠ **Tanda 2026-08-01 (3.ª) · EL ARREGLO DE D4.** Tres commits, cada uno con su
> medición antes/después y su adjudicación contra el original. **D2, D3 y D1 NO
> se han tocado** — no cabían, y D1 sigue bloqueada por su condición.

## ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH`

> **Con D4 arreglado, muchos `docH` se ALEJAN de 0, y eso es CORRECTO.**
>
> `docH` carga **las cuatro causas de C1 a la vez**. Mientras el pie estuvo mal,
> su error **compensaba** a D1/D2/D3; al arreglarlo, la compensación desaparece
> y el residuo de las otras tres sale a la superficie. Ejemplo medido:
> `/sectores/calidad-del-aire-en-las-ciudades` pasa de **+41 a −23**.
>
> **Quien mida el PIE contra el original ve la mejora; quien mire solo `docH`
> leerá como regresión lo que es descompensación esperada.** El eje en el que se
> adjudica D4 es `qa:d4`, no `qa:c-cmp`.

Es el mismo mecanismo del catálogo de compensaciones de `CLAUDE.md` —«un Δ de
cero puede ser dos errores que se anulan»—, pero visto **desde el otro lado**:
aquí no se descubre una compensación al medir, se **fabrica** una al arreglar
una de las dos mitades. Un arreglo correcto de una causa de una suma **tiene**
que empeorar el total mientras las demás sigan abiertas.

⚠ Este aviso vivió una tanda **solo en el mensaje del commit `fd3de61`** y no en
ningún documento. Es *MENCIONADO NO ES DOCUMENTADO* (`CLAUDE.md` §sondas, regla
3): un mensaje de commit lo lee menos gente todavía que un informe de sesión.

## 1 · Lo que se arregló, y contra qué se adjudicó

El clon servía **681.09 de pie SIEMPRE** —el valor de SOFTWARE, la familia con
la que se calibró—. Ahora cada tipo de página hereda su presentación.

| forma | @1440 antes | @1440 ahora | @390 antes | @390 ahora |
|---|---|---|---|---|
| ancha (A×3 · sector · monográfico · faq) | +87.34 | **−3** | +292.52 | **+23.89** |
| CASO | −255.72 | **−3** | +27.46 | **+23.9** |
| catálogo · producto | −367.16 | **+3** | −310.70 | **+28.89** |
| **software** | **0** | **0** ✅ | +0.78 | +0.78 ✅ |
| home (sin tocar, a propósito) | −1.58 | −1.58 | +0.42 | +0.42 |

- **La 4ª sección del CASO cierra a Δ 0.00 a los dos anchos** (343.06 y 265.06).
- **`footer-background` cierra a 0 exacto** en las tres presentaciones y los dos
  anchos: el eje del `padding` está cerrado.
- **SOFTWARE no se movió un píxel**: no es una recalibración global disfrazada.

**Adjudicación en las 31 rutas** (`c-cmp`, los dos anchos, congelado): el clon se
movió en **28 de 31**, y las 3 que no son exactamente las que no debían (home
intacta, las 2 de software sin cambio). El movimiento es **exactamente el Δ del
pie** en cada familia: −90.34 ancha · +370.16 catálogo/producto · +252.72 caso
@1440; −268.63 · +339.59 · −3.56 @390.

**Y la reconstrucción cierra al céntimo**, que es lo que prueba que no se movió
nada más: A·blog predicho `docH` 1400.66, medido **1401** (scrollHeight es
entero); por causas, `D1 −225 + D2 +50 + D3 0 + D4 −3 + cuerpo −193.21 =
−371.34` contra **−371** medido.

## 2 · ⚠ El modelo del §6b tenía DOS ejes y son TRES (y hay un cuarto anotado)

Corregido en `ESQUEMA-CMS.md` **§6b.1**. La decisión de modelo NO cambia —sigue
siendo plantilla por tipo de página—; cambia de cuántos ejes consta.

1. **Faltaban 4 formas, 9 rutas** (FAQ, HOME, A·documento, MONOGRÁFICO). Las 4
   son `ancha`. La que importa: **el pie del original en la HOME es idéntico al
   de grupo A**, no una maquetación propia.
2. **El tercer eje es TIPOGRAFÍA** (`li` 14/26/mb0 · 14/30.6/mb7 ·
   **18**/30.6/mb9; legal 12 · 12 · **18**). Con solo los dos primeros,
   catálogo/producto se quedaban a **−79.19**. **No es responsive**: idéntico a
   1280, 1440 y 390.
3. **Cuarto eje, medido y NO cableado:** el bloque de **iconos sociales** vale
   **31.59 en ancha** y **61.59 en estrecha**. Es el **+31.59** que queda en
   `ancha` a 390.

> **Por qué se escondía:** los dos ejes reproducen el total de
> `footer-background`, que **no tiene texto**. Lo que no cuadraba vivía en el
> **renglón**, dos niveles más abajo. Regla del NIVEL, aplicada al pie.

## 3 · ⚠ Una medida del repo era falsa

La cabecera de `Footer.tsx` atribuía `li 14px/30.6 mb 7` a
**/monitor-calidad-aire** medido a 1280 (P1, 2026-07-27). /monitor da hoy
**18px/30.6 mb 9** a ese mismo ancho — esos eran los valores de SOFTWARE.
Corregida. **No se ha investigado** si el original cambió o si P1 midió otra
cosa; se cableó lo medido hoy, reproducido a tres anchos y congelado.

## 4 · El residuo — está FICHADO, no está limpio

Composición en `PENDIENTES-QA.md` §D4. En corto:

| @1440 | links | legal | fondo | | @390 | links | legal | fondo |
|---|---|---|---|---|---|---|---|---|
| ancha | −4 | +1 | 0 | | ancha | −7.7 | **+31.59** | 0 |
| software | −1 | +1 | 0 | | software | −0.82 | +1.59 | 0 |
| estrechaPad | +1 | +2 | 0 | | estrechaPad | **+26.29** | +2.6 | 0 |

- El **+1 de `footer-legal` es ANTERIOR a esta tanda**: software ya lo tenía y se
  anulaba contra el −1 de `footer-links`. Δ0 por compensación, dentro del único
  Δ0 que el pie tenía.
- El **+31.59 de ancha @390** tiene dueño medido (iconos sociales, arriba).
- El **+26.29 de estrechaPad @390** NO está atribuido.

## 5 · Lo que NO se tocó

- **D2** (+50 de huecos entre secciones) y **D3** (−42 entre última sección y
  pie): **sin diagnosticar y sin tocar.** No cabían en la tanda.
- **D1** (−225 antes de la 1ª sección): **sigue bloqueada.** La condición no ha
  cambiado — hay que demostrar primero que mueve `docH` y no solo la partición.
- **`/` conserva su pie propio a propósito.** Su pie original es idéntico al de
  grupo A, pero el clon lo construye aparte (`w-[85%]`, 1 bloque en vez de 3) y
  totaliza −1.58/+0.42: partición distinta con total casi igual. **Va con C-QA3**
  (+289.91 abierto); con los dos cambios a la vez no se adjudica ninguno.
- **C3** (cuerpo de A·blog), **C5**, **C6**: sin cambios.

## 6 · Sondas y verificación

Nuevas: **`qa:d4-tipo`** (varianza tipográfica del pie) · **`qa:d4-cta`** (spec de
la 4ª sección). `qa:d4` ampliada: **11 formas**, lee la fila **de los dos lados**
(antes `null` en el clon — un `null` leído como dato), abre la composición
(`fila`/`cols`/`mods`), estrena `Censo` y **código de salida** (antes devolvía 0
pasara lo que pasara), y `SOLO=` para acotar.

Las tres con **test en negativo comprobado en las dos direcciones** antes de
creerse ningún limpio.

`qa:enlaces` **limpia** · `qa:slugs` **limpia** · typecheck · lint 0 errores ·
build · marcador verificado en el HTML servido en cada parte.

⚠ **`c-cmp` sale con código 1 a los dos anchos, y ya lo hacía ANTES de esta
tanda** (la corrida de línea base también). Es `P-C3-3`: su selector
`.entry-content` se escribió para las 6 rutas del grupo C y hoy barre las 31, así
que marca `<h1>`, `<article>`, `<header>` y `<meta>` en páginas que no son casos.
**No es regresión y no se tocó** — pero es una sonda que no puede dar verde, o
sea una guarda apagada.

---

# (anterior) HANDOFF — D4 con el MODELO resuelto y el arreglo listo para escribir; D2/D3/D1 sin tocar

> ⚠ **Tanda 2026-08-01 (2.ª) · DIAGNÓSTICO de D4.** No se ha tocado ni un
> componente. Se cierra aquí a propósito: el arreglo de D4 toca **las 31 rutas**
> y exige el ciclo de adjudicación completo, que no cabía. Lo que queda hecho es
> **la pregunta de modelo, contestada y escrita en el ESQUEMA** — que era la
> condición del encargo antes de arreglar nada.

## 1 · D4 · el pie: una plantilla, una variante, y dos ejes de presentación

`npm run qa:d4 -- 1440` · congelado en `medidas/d4-pie-1440*.json` · 7 familias,
sobre el ORIGINAL.

| familia | secs | ancho de fila | `pt/pb` sección | alto |
|---|---|---|---|---|
| A·blog · A·término · SECTOR | 3 | **1238.39** (86 %) | 0 | 593.75 |
| SOFTWARE | 3 | **1152** (80 %) | 0 | 681.09 |
| CATÁLOGO · PRODUCTO | 3 | **1152** | **57.5938** | 1048.25 |
| **CASO** | **4** | 1238.39 | 0 | 936.81 |

**La respuesta a «¿mismo pie o plantillas distintas?» son las dos cosas:**

1. **El contenido del pie es el mismo en las 7** — `footer-links` (8 módulos, 5
   columnas), `footer-legal` (7, 3), `footer-background` (1), mismas clases
   `_tb_footer`, 46–48 enlaces. **No es otro pie.**
2. **CASO añade una 4ª sección**, un CTA de 343.06 con 4 módulos. **Eso sí es
   otra plantilla**, y confirma el `tb_footer` 4 vs 3 que midió C-1.
3. **Lo que varía entre las otras seis es PRESENTACIÓN**, en dos ejes
   independientes: el **ancho de fila** (1152 estrecha las columnas a 230.39 y
   los enlaces envuelven más → `footer-links` 430.78 → 518.13) y el **`padding`
   de sección** (0 vs 57.5938, el default Divi del 4 %), que explica
   `footer-background` **al céntimo**: 41 → 156.19 = **57.5938 × 2**.

**Decisión de modelo, ya en `ESQUEMA-CMS.md` §6b:** firma «constante dentro de la
familia, distinta entre familias» = **decisión de PLANTILLA, no campo por
instancia**. Nadie editó el pie de `/accesorios`; lo heredó su tipo de página. Y
los mismos dos valores gobiernan la retícula del cuerpo (86 % en grupo A y
sector, 80 % en producto/catálogo/software) → **van en la plantilla de tipo, no
en el dato del pie.**

## 2 · El defecto del clon, localizado — y por qué NO lo arreglé

`src/components/Footer.tsx` escribe **`w-[80%] max-w-[1380px]` fijo** → 1152
siempre, que es el valor de **SOFTWARE**. Por eso acierta en esa familia y falla
en las demás: **la familia con la que se calibró.** Lo importan **10 ficheros**.

**Lo que hay que hacer, en orden:**

1. el **ancho de fila** y el **`padding`** salen del **tipo de página** (86 %/0
   para grupo A y sector; 80 %/0 para software; 80 %/4 % para catálogo y
   producto). **No se cablean por página** — sería repetir el error que lo causó;
2. **CASO recibe su 4ª sección** (el CTA), que hoy no existe en el clon;
3. medición antes/después y **adjudicación contra el original una a una** de todo
   lo que se mueva. `qa:d4` ya mide los dos lados, así que sirve de verificación.

⚠ **Aviso para quien lo coja:** al cambiar el pie se mueven las 31 rutas a la
vez. `clon-base` marcará todo y **no puede decir si el cambio es correcto** —
hay que preguntarle al original (regla de petróleo). Y `docH` cambiará en las 31,
así que conviene congelar `c-cmp` **antes** de tocar.

## 3 · Lo que sigue sin tocar

- **D2** · +50 de huecos entre secciones, igual en las tres familias (76 a 390 en
  grupo A). Sin diagnosticar dónde vive.
- **D3** · −42 entre la última sección y el pie, solo en catálogo y software.
  Sin diagnosticar.
- **D1** · −225 antes de la primera sección, constante en las tres. **NO se toca
  hasta demostrar que mueve `docH`**: la cabecera del clon está fuera de flujo y
  la del original en flujo, pero si el clon mete esos 225 dentro de su primera
  sección, **la partición cambia y el total no**. Es la trampa de C4 y el aviso
  del encargo. Comprobación pendiente: comparar `docH` con y sin el cambio, no
  el reparto resto/secciones.
- **C3** · el cuerpo de A·blog, de −2 941.74 a +1 111.92, sin causa única.
- **C5** · industria fila 4 **+13 a los dos anchos**; investigación **+11.2 a
  390**; edar **−30 a 390** → dentro del suelo NO probado de ±32.28, **SIN
  PROBAR**.
- **C6** · el estado HTTP solo lo mira `c-cmp`; `lib.mjs` ya lo expone.

## 4 · Estado

Cobertura sin cambios respecto a la tanda anterior: docH · base · árbol ·
enlaces **31/31**, anchos 13, filas 6, módulos 2, offsets 0, comportamiento 0.

Sondas nuevas: **`npm run qa:d4`** (composición del pie, los dos lados) además de
`qa:c1` y `qa:cobertura`.

Verificación: `qa:enlaces` limpia · `qa:slugs` limpia · lint 0 errores ·
typecheck · build.

---

# (anterior) HANDOFF — C2 resuelta (no era defecto), C1 LOCALIZADA en cuatro causas; falta arreglarlas

> ⚠ **Tanda 2026-08-01 · DIAGNÓSTICO.** No se ha tocado ni un componente. Lo que
> hay es una contradicción del repo resuelta y una causa raíz abierta en cuatro
> piezas, listas para arreglar. Registro en `PENDIENTES-QA.md` §COBERTURA;
> matriz en `docs/research/COBERTURA-MEDICION.md`.

## 1 · C2 estaba MAL y contradecía a C-QA3. Se anula C2

El repo afirmaba dos cosas incompatibles sobre la home: C-QA3 (2026-07-31) decía
que el `+289.91` **no es un defecto y nunca lo fue**; C2 (2026-08-01) lo fichaba
como DEFECTO. **La que se tacha es C2**, y la medición que lo decide es la que
faltaba — si el `h1` **empuja** algo:

| | `position` | ¿en flujo? | caja | ¿empuja? |
|---|---|---|---|---|
| original | `static` | sí | **0 × 0** | **nada** |
| clon | `absolute` | **no** | 1 × 1 | **nada** |

Consecuencia visual **cero por los dos lados**, por caminos distintos. El error
de C2 fue leer `h1.y = 0` y deducir una maquetación sin comprobar que el `h1`
tuviera caja.

> **Lo que hay que llevarse:** «alto 0 o 1 px» dice que no se ve; **no** dice que
> no tenga consecuencia. Un elemento de 1 px **en flujo** desplaza 1 px. Lo
> decide `position`, y hay que **medirlo** — no deducirlo de la clase (`sr-only`).

`c-cabecera` mide ya `h1caja` (position · enFlujo · clip · w). La home queda
marcada en la matriz como **base `h1` NO VÁLIDA — ancla alternativa: `h2`**.

**Lo que sí sigue abierto en la home es C-QA3: +21.03 a 1440 · −0.23 a 390**
contra el `h2`, reproducido hoy al céntimo. No es esta tanda.

## 2 · C1 LOCALIZADA: no es un desfase, son CUATRO que se suman

`npm run qa:c1 -- 1440|390` (sonda nueva, congela). Una ruta por familia. **Las
cuatro piezas reconstruyen el número de cada familia al céntimo:**

| pieza | A · blog | CATÁLOGO | SOFTWARE |
|---|---|---|---|
| **D1 · antes de la 1ª sección** | −225 | −225 | −225 |
| **D2 · Σ huecos entre secciones** | +50 | +50 | +50.01 |
| **D3 · entre última sección y pie** | 0 | −42 | −42 |
| **D4 · alto del PIE** | **+87.34** | **−367.16** | **0** |
| **suma** | **−87.79** | **−583.97** | **−217.63** |
| medido | −87.79 | −583.97 | −217.63 |

Y a 390 cuadra igual: A da `−165.58 + 76 + 292.52 + 0.42 = +203.36`, el valor
medido. **La inversión de signo no necesita dos explicaciones**: son las mismas
cuatro causas con magnitudes distintas por ancho.

**D4 es la que explica que el número sea distinto por familia** — el pie del clon
es de **alto fijo (681.09)** y el del original **varía por página**: 593.75 en
blog, 1048.25 en catálogo, 681.09 en software. O sea que **el clon acertó en la
familia con la que se calibró el pie y las demás heredaron su altura**: otra
«corrección aparente por contenido corto», ahora en el pie.

## 3 · Por dónde seguir — el orden importa y está razonado

1. **D4 primero** — la de mayor magnitud y la única que diferencia familias.
   Hay que averiguar **qué** hace variar el pie del original (¿widgets por tipo
   de página? ¿un módulo extra en catálogo?) y modelarlo. Es candidato a
   **campo**, así que puede tocar `ESQUEMA-CMS.md`.
2. **D2 y D3** — constantes (+50 / −42) y localizadas; deberían ser baratas.
3. **D1 la ÚLTIMA, y solo si se demuestra que mueve `docH`.** ⚠ La cabecera del
   clon está fuera de flujo y la del original en flujo, pero **si el clon mete
   esos 225 dentro de su primera sección, la partición cambia y el total no**.
   Mientras no se pruebe, tocar el flujo de la cabecera en 31 rutas es el
   arreglo falso de manual. **Medir antes de tocar.**

**Cada arreglo: un commit, medición antes/después, y adjudicación contra el
original de todo lo que se mueva** (regla de petróleo: qué cambió nunca dice si
el cambio es correcto).

## 4 · Lo que también queda abierto, sin tocar

- **C3** — el cuerpo de A·blog va de −2 941.74 a **+1 111.92**, signos en los dos
  sentidos: no hay causa única. Pendiente de descomponer por módulo.
- **C4** — 14 rutas con distinto nº de secciones. La FAQ es **incomparable por
  construcción** (el original no mete su cuerpo en ninguna `.et_pb_section`).
- **C5** — industria fila 4 **+13 a los dos anchos** (reproduce → defecto);
  investigación **+11.2 a 390**; edar **−30 a 390**, dentro del suelo NO probado
  de ±32.28 → **SIN PROBAR**, no se toca.
- **C6** — el estado HTTP solo lo mira `c-cmp`; `lib.mjs` ya lo expone. Falta en
  las demás sondas.
- **La matriz**: ancho del **cuerpo** sigue a **0/31** de verdad (los 13 son de
  un elemento) y comportamiento a **0/31**.

## 5 · Estado de la cobertura

`npm run qa:cobertura` — docH **31/31** · base **31/31** · árbol **31/31** ·
enlaces **31/31** (ya congela) · anchos 13 · filas 6 · módulos 2 · offsets 0 ·
comportamiento 0. **Cero celdas `c`** en los cuatro primeros.

Verificación de esta tanda: `qa:enlaces` limpia · `qa:slugs` limpia · `qa:lib`
26/26 · lint 0 errores · typecheck · build.

---

# (anterior) HANDOFF — grupo A construido y A-QA1 CERRADO; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda 2026-07-31 (5.ª del día) — CONSTRUCCIÓN DEL GRUPO A.** Acta en
> **`docs/research/arquetipo-A/MEDICION.md`**; el ESQUEMA gana **§2.4** (cuatro
> correcciones al recon) y los **image sizes** bajo §CMS-0b; `PENDIENTES-QA.md`
> gana **A-QA1** y tres desviaciones deliberadas.
>
> ## Estado del clon: **31 rutas** (17 + 14), 0 regresión
>
> | ruta nueva | forma | instancias |
> |---|---|---|
> | `/[slug]` | entrada de blog · término de Kunakpedia | 7 + 3 |
> | `/recursos/[...ruta]` | documento científico | 4 |
>
> **14 de 209 a propósito**: las 209 van en F2-2 con el extractor. Lo que sí
> está es cada eje capaz de romper la plantilla — los dos extremos de longitud
> de las 209 (275 y 69 784 ch), las **dos firmas de blog**, tabla, cita,
> galería, vídeo, embebido, `<script>` en el cuerpo, la de 26 etiquetas y **los
> tres prefijos** de documento científico.
>
> ## Lo verificado
>
> - **0 regresión** en las 17 anteriores, **umbral cero, a los dos anchos**, con
>   marcador de frescura comprobado en el HTML servido.
> - **Base EN CRUDO** contra el original (la medida que se hace una vez por
>   arquetipo, antes de fiarse de ningún Δ de cuerpo): **−0.01 · −0.01 · −0.03 a
>   1440 en las tres formas.** La banda de cabecera —**225 / 165.58**— no se
>   copió de ninguna plantilla: se dedujo por composición de esa `y` cruda.
> - `qa:enlaces` limpia en las dos direcciones · `qa:corte` 12/12 · `qa:slugs`
>   limpia · lint · typecheck · build.
> - **✅ A-SP12 cerrada por medición**: `dynamicParams = false` devuelve los 404
>   (`/slug-inventado`, `/acesorios`, `/recursos/inventado/x/y`) y la ruta
>   estática sigue ganando.
> - **La guarda de slugs, probada con una colisión REAL** en el catálogo: el
>   build **volvió a compilar sin un aviso** (tercera confirmación de que es
>   silenciosa) y la sonda la cazó por A y por B, exit 1.
>
> ## ✅ A-QA1 · CERRADO (2026-07-31) — y el tope de 350 era del TEMA
>
> Las 4 formas a **Δ0 a los dos anchos**: −0.01 · −0.01 · −0.03 a 1440 y
> **0.00 · 0.00 · −0.02 a 390**.
>
> **El separador no era la causa**, y la medida lo dijo antes del arreglo: el
> clon medía **75.89** por eslabón contra **75.72** del original, o sea **+0.17**
> — tres órdenes por debajo de un renglón de 26. Lo era el **último eslabón**,
> que el original acota a `max-width: 350px · nowrap · overflow hidden ·
> text-overflow ellipsis`.
>
> Y ese tope está en las **siete formas medidas** del original, no solo en el
> caso, así que:
>
> - **`variante="caso"` de `Breadcrumb` estaba mal delimitada** — mezclaba una
>   regla general con las específicas. El truncado bajó al **defecto**; la
>   variante se queda con la interlínea 30.6, que sí es del caso;
> - **producto y sectores daban Δ0 porque sus rótulos no llegan a 350**, no
>   porque estuvieran bien: **corrección aparente por contenido corto**;
> - y el cambio **destapó una víctima**: el monográfico de petróleo envolvía en 3
>   renglones donde el original hace 2 (**−26 de `docH`**), invisible porque en
>   sector la miga va **debajo** del `h1` y la base no se movía. Comprobado
>   contra el original tras el arreglo: **Δ 0.00**.
>
> Instrumento nuevo: **`npm run qa:a-miga -- 1440|390`**, que mide la miga
> original contra clon con **el mismo selector en los dos lados** y lee el
> separador del pseudoelemento. Su lección va a `CLAUDE.md`: **el nivel al que
> se mide no es solo vertical** — un ancho medido al ancho estrecho está tapado
> por el wrap.
>
> **Campo nuevo de esquema (§2c.1): `tituloMiga`.** El rótulo de la miga del
> término **no es el `h1`** (3 de 3 términos difieren, 11 de 11 blog y doc
> coinciden). Opcional con defecto «el título». No salía en la base porque a 390
> los dos rótulos caen en 2 renglones igualmente: **medida tapada, no acierto**.
>
> ## Las cuatro correcciones al recon (§2.4 del ESQUEMA)
>
> 1. **El documento científico no tiene UN prefijo: tiene TRES**
>    (`documentos-cientificos/articulos-cientificos-y-estudios` 14 ·
>    `…/evaluaciones-independientes` 8 · **`estudios-cientificos/articulos-tecnicos`
>    1**). Se modela como CMS-1 modeló el del caso: campo con defecto. De ahí el
>    catch-all — un segmento fijo se habría comido esa instancia de 23.
> 2. **`text#2` del documento trae `autores` y `anyo`**, que el modelo no tenía.
> 3. **El `h1` del término mide 44/52.8, no 18** (el 18 era del MÓDULO) y **no
>    reduce a 390**, al revés que blog y documento.
> 4. **La autoría es PLANTILLA**: idéntica en las 11 instancias que la llevan.
>
> Las tres primeras son la misma lección: **se había leído el contenedor**. El
> `color` de ese módulo sale **blanco** en las tres formas — maquetar con él
> habría dado un titular invisible.
>
> ## Sondas y comandos nuevos
>
> ```bash
> npm run qa:slugs                       # unicidad de slug ENTRE familias del plano
> SABOTAJE=accesorios npm run qa:slugs   #   su test en negativo (exit 1)
> SABOTAJE=inexistente npm run qa:slugs  #   su control     (exit 0)
> npm run qa:a-spec                      # transcripción verbatim del mínimo adversario
> SABOTAJE=1 npm run qa:a-spec           #   test en negativo: patrón muerto, exit 2
> node scripts/gen-arquetipo-a.mjs       # regenera src/lib/arquetipo-a.ts
> node scripts/download-grupo-a.mjs      # baja sus assets a public/
> ```
>
> `npm run check` ahora es **lint → typecheck → build → qa:slugs**.
>
> ## Lo que NO hay que rehacer al empezar
>
> - **No re-medir el original a mano.** El contenido verbatim de las 14
>   instancias está en `medidas/a-spec.json` y el cascarón en
>   `a-cascaron-{1440,390}-2026-07-31-4.json`, ya con tipografía, `y` cruda e
>   índice.
> - **No editar `src/lib/arquetipo-a.ts` a mano**: está generado. Se toca la
>   sonda o el generador y se regenera.
> - **No aplicar T1–T7.** Siguen sin aplicar a propósito: son transformaciones
>   de migración y su sitio es F2-2. El generador hace solo las dos reescrituras
>   que el CLON obliga (assets a `public/`, `<a>` a rutas locales).
> - **No cablear A-SP14 ni A-SP15**: anotados, no resueltos.
>
> ## Sigue abierto, sin cambios
>
> **C-QA6** (campaña de ruido: 1 de 3 ráfagas; faltan 2, ≥2 h y ≥1 día distinto)
> · **C-QA3** (la home: +289.91 a 1440 · +119 a 390) · **C-QA5** · y la **Fase
> 2** con sus dos precondiciones. La biblioteca avanza de verdad: el grupo A
> pasa de «reconocido» a **construido**, y con él dejan de estar bloqueados los
> **26 de los 35 listados** que dependían de él.
>
> ---
>
# (bloque anterior) HANDOFF — LH-2 decidido: los listados ya tienen modelo; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda LH-2, 2026-07-31 (4.ª del día) — DECISIONES DE MODELADO de
> listados y hubs.** Actas: **`listados-hubs/DECISIONES.md`** (D1–D5, con
> reaperturas) y **`MODELO.md`** (content types con defaults); el ESQUEMA gana
> **§2c** (colecciones de términos + contrato del grupo A) y **§4b corregido**.
> Nada construido.
>
> - **D1**: las 35 cuestan **2 arquetipos nuevos (quizá 3)** — LISTADO-B (23,
>   una plantilla, tres variantes de tarjeta) y LISTADO-TEMA (L2/L3 separados
>   con reapertura) — más una **página índice** (`casos-de-exito`, sin paginar,
>   sobre la colección `casos`) y **cero arquetipos por los 6 hubs de builder**.
> - **D2**: `/page/N/` plantilla; **`entradasPorPagina` es parámetro de
>   plantilla por variante (9·15·5), NO campo** — ⚠ corrige la nota que el
>   recon dejó en §4b con la lente del builder. Rutas derivadas en build; los
>   7 con 200-para-todo sirven 404 (desviación deliberada, a PENDIENTES al
>   construir); re-correr `qa:lh-paginas` el día que se emita.
> - **D3 — la que condiciona el grupo A**: sus entradas nacen con
>   `fechaPublicacion`, `imagenDestacada` (sizes 1080×675·1024×683·980·480),
>   `extracto` derivado por defecto y **TRES taxonomías**
>   (`category`+`post_tag`+`resources`) — y **sin `autor`** (0/9 formas lo
>   piden). Evidencia nueva: **`qa:lh-tarjetas`** (lectura fina, 9 formas,
>   congelada). `BlogPost`/`CaseStudy` (S1) = proyección canónica verificada.
> - **D5**: 7 de las 8 preguntas contestadas; la 8.ª (orden de resolución de
>   la raíz) es CMS-2 y se decide en F2-1. **LH-SP5 decidido: hace falta una
>   pasada de COMPORTAMIENTO antes de construir L1** (hover · AJAX · lazy ·
>   orden entre cargas) — pre-registrada como P-LH-C6.
> - **Pre-registro de construcción P-LH-C1…C6** al final de DECISIONES.md.
> - ⚠ **Hallazgo fuera de alcance: `/es/categoria/*` existe** (200, archivo,
>   fuera de sitemap) — familia **SIN CENSAR (LH-SP8)**; los 35 no eran el
>   universo. Y quedan LH-SP9 (por-página de L3) y LH-SP10 (¿extracto manual?).
>
> ---
>
# (bloque anterior) HANDOFF — recon de listados+hubs hecho; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda 2026-07-31 (3.ª del día) — RECON LISTADOS + HUBS.** Acta completa
> en **`docs/research/listados-hubs/PAGE_TOPOLOGY.md`**. Solo datos: cero
> construcción y cero decisiones de modelado (van a su tanda, y las preguntas
> están escritas sin contestar en su §9).
>
> ## Lo que contestó
>
> **Las 35 no son un arquetipo: son CINCO formas**, y el reparto lo dio el
> **régimen del `<body>` servido**, mirado antes que nada:
>
> | forma | pág. | qué es |
> |---|---|---|
> | **L1** ARCHIVO PLANTILLADO | **23** | `tb_body` de 2 secciones — **6 secciones y 2 `tb_body` en las 23, sin una excepción** |
> | **L2** ARCHIVO DE CPT (tema) | 2 | `glosario` · `preguntas-frecuentes`, 4 secciones |
> | **L3** ARCHIVO DE TAXONOMÍA (tema) | 3 | los `scientific-category/*`, 5 secciones |
> | **L4** HUB DE BUILDER | 6 | compuestos por instancia (6·7·8·6·7·6) |
> | **L5** HUB CON PLANTILLA PHP | 1 | `casos-de-exito`: lista **las 57 sin paginar** |
>
> **Tres correcciones a lo que el censo anterior daba por sabido:** «hub» era
> una etiqueta, no un régimen (3 de los 12 son archivos de término); los 3
> `scientific-category` **no son del grupo B** (otro régimen); y **PL-F3 se
> disparó** — `/es/recursos/` es builder **con listado dentro**.
>
> **Paginación (nadie la había mirado):** patrón **`/page/N/`**, 21 de 35
> paginan, **107 rutas extra** (total 142). La ventana de `paginate_links` decía
> 56 — **subestimaba en 51**, porque imprime `1 2 3 … 8` y no la lista. Y **7
> páginas NO paginan aunque devuelvan 200 a cualquier N**: su canonical apunta a
> la primera. Va al **ESQUEMA §4b**, con el nº de entradas por página (9·15·5·3)
> anotado como **campo**.
>
> **Estado del clon frente a los 35:** **ninguno de los 12 hubs existe**
> (verificado contra el `prerender-manifest`). **25 href** del clon apuntan a 8
> de ellos y **pasarán a ser fallo de `qa:enlaces` solos** al emitir el primero.
> **Solo `/productos` y `/sectores` son construibles hoy**; **26 de 35 dependen
> del grupo A**, sin construir.
>
> ## ⚠ Lo que hay que saber antes de fiarse de estos números
>
> **La sonda llegó con CUATRO defectos y los cuatro daban cifras plausibles.**
> Están contados uno a uno en el §6 del acta. El cuarto es el que más enseña:
> `lh-paginas` **imprimía «⚠ TOPE» y sumaba el número igual** —la regla 1 rota
> dentro de mi propio informe, como le pasó a `ruido.mjs`— e inventaba **441
> rutas** que no existen.
>
> De ahí una **guarda nueva en `CLAUDE.md`, hermana de la regla 4**: *un patrón
> que casa en TODAS tampoco mide nada*. `max` por patrón discriminante, markup
> buscado sin `<style>`, y **test en negativo que cubre las dos guardas en una
> corrida**.
>
> ## Sondas nuevas
>
> ```bash
> npm run qa:lh                 # censo 35/35 (MODO=rutas|regimen|censo)
> npm run qa:lh-paginas         # el final real de cada paginación, por 404
> SABOTAJE=1 npm run qa:lh      # test en negativo: MUERTO + UBICUO, exit 2
> ```
>
> Congeladas en `medidas/lh-{regimen,censo,paginas}.json`, con las defectuosas
> conservadas bajo `…-SONDA-DEFECTUOSA-*` / `…-SONDA-CONTABA-EL-TOPE`.
>
> ## Sigue abierto, sin cambios
>
> **C-QA6** (campaña de ruido: 1 de 3 ráfagas; `ruido.mjs` ya congela `cargaMs`)
> · **C-QA3** (la home) · **C-QA5** · y la **Fase 2** con sus dos precondiciones
> (`docs/PLAN-FASE-2.md`). El recon de hoy **avanza la primera**: la biblioteca
> está más cerca de cerrada, pero **falta la cola larga** (empresa, legales,
> contacto, soporte, landings) y **el grupo A sin construir bloquea 26 de estos
> 35**.
>
> ---
>
# (bloque anterior) HANDOFF — C-QA7 cerrado; quedan la CAMPAÑA (2 ráfagas), la home y C-QA5

> ⚠ **Tanda corta 2026-07-31, después del cierre de abajo — HAY PLAN DE FASE 2:**
> **`docs/PLAN-FASE-2.md`**, las cinco fases de la migración a Payload
> (F2-1 esquema · F2-2 datos · F2-3 lectura · F2-4 publicación · F2-5 admin y
> traspaso), cada una con sus decisiones enlazadas, su incógnita y su criterio
> de «hecho», más las **dos precondiciones de arranque** (biblioteca cerrada y
> tanda CLASE). Convención nueva en el ESQUEMA: **`CMS-n` = decisión ·
> `F2-n` = fase**. La primera decisión de F2-1 es **CMS-0f** (app única vs dos
> apps en monorepo; el evaluador externo recomienda dos — costes de ambas ya
> escritos en el plan). En la misma tanda: la mina de custodia **desactivada
> con el rename** (✅ abajo), la ráfaga 2 con **tiempos de carga** (§CAMPAÑA),
> el **no-wrap como mecanismo propio** en `CLAUDE.md`, y el §1 del ESQUEMA
> deja explícito que **el régimen builder entra en Payload** (la «frontera de
> regímenes» era mitigación del M2A de Directus y no aplica).
>
> ⚠ **Actualización 2026-07-31, cerrando el bloque 5 de la cabecera.** El bloque
> anterior (abajo) sigue siendo contexto válido; esto es lo que cambia.
>
> ## Estado del clon, medido al cerrar — 17 rutas × 2 anchos
>
> | ancho | a Δ0 | desplazadas, TODAS con nombre y ficha |
> |---|---|---|
> | **1440** | **16 de 17** | `/` (+289.91 · C-QA3, sin base válida) |
> | **390** | **15 de 17** | `/` (+119 · C-QA3) · `estudio` (+11.2 · en el diagnóstico congelado) |
>
> Nada anónimo — el objetivo de la tanda de cabecera entera. Con la reserva de
> C-QA6 en pie: los Δ0 de `/software` y los 2 monográficos se leen **«sin
> episodio observado»**, no «verificados», hasta cerrar la campaña.
> `qa:enlaces` (dos direcciones), `qa:corte` (12/12) y `qa:bases` limpias;
> `clon-base` contra la línea post-C-QA2: solo se movieron los dos arreglos,
> las otras 15 sin un píxel (`clon-base-{1440,390}-cqa7-despues.json`).
>
> ## Hecho en este bloque
>
> - **PASO 0** · dos registros: la lección del comentario CSS en `CLAUDE.md`
>   (§Notas de método — es el argumento operativo de «siempre dos anchos») y la
>   **pista de sincronía** de la campaña (abajo, en su tabla).
> - **C-QA7 · CERRADO** (acta en `PENDIENTES-QA.md`). Los dos residuos eran
>   **tres defectos, y dos son el mismo**:
>   - `/accesorios` (+28.8·+48): un **`pt` de fila que el original no tiene**
>     (el default Divi cableado sin medir: +28.8/+30) **más** el kicker sin la
>     regla móvil 35px/42 (+18 a 390). La composición cuadra al céntimo.
>   - `/monitor` (+78 solo a 390): el **mismo kicker**, pero con estilo inline
>     que no puede ser responsive — «Kunak AIR Pro» a 2 líneas: 120−42=78.
>     La firma espejo en su forma pura: a 1440 el no-wrap lo tapaba entero.
>   - Resultado: **Δ0 exacto en crudo, dos rutas × dos anchos**, contra el
>     original en vivo. Commits `0ce6e00` · `2c2432e`.
> - **Docs en la misma tanda**: sexta instancia del catálogo de compensaciones
>   (`CLAUDE.md`: el −19.2 = −48+28.8) y **el `pt` de fila al esquema como
>   CAMPO** (`ESQUEMA-CMS.md` §6: test A — 0 px en 3 de 4 hermanas, default
>   2%/30 intacto en monitor). Regla nueva vigente: lo que un diagnóstico
>   revele como campo va al esquema en la tanda que lo mide.
>
> ## ✅ Custodia — RECONCILIADA (2026-07-31): el nombre canónico vuelve a ser la medida sana
>
> `clon-base-390-cqa2-despues.json` contenía el build roto por el comentario
> CSS (S0=0: 10 falsas regresiones de +136.58 al comparar). **Los nombres se
> invirtieron**: el canónico contiene ahora la medida **SANA**, y el build roto
> se llama `clon-base-390-cqa2-despues-BUILD-ROTO-comentario-css.json` —
> conservado como evidencia, git guarda las dos historias. Ya no hay aviso que
> recordar: el nombre obvio es el correcto. Detalle y moraleja en
> `PENDIENTES-QA.md` §C-QA7 · Custodia.
>
> ## Abiertas, por orden
>
> - **C-QA6 · la campaña de ruido** — 1 de 3 ráfagas; faltan 2, ≥2 h de
>   separación y ≥1 día distinto. Cómo correrla y la pista de sincronía: abajo,
>   §CAMPAÑA. **Hasta cerrarla, `/software` no se da por verificado.**
> - **C-QA3 · la home** — déficit de **contenido** en la columna del hero
>   (−50.84 amplificado por centrado), no de cabecera. Se decide aparte.
> - **C-QA5** — el `h1` envuelve distinto en 4 rutas, solo a 1440: es el
>   **ancho** del contenedor del título, base válida.
>
> ---
>
# (bloque anterior) HANDOFF — C-QA2 aplicada; quedan C-QA7, la home y una CAMPAÑA con fechas

> ⚠ **Actualización 2026-07-30, cerrando el bloque 4 de la cabecera.** El cuerpo
> de este documento (abajo) sigue siendo contexto válido. Esto es lo que cambia.
>
> ## Estado del clon, medido al cerrar — 17 rutas × 2 anchos
>
> | ancho | a Δ0 | desplazadas |
> |---|---|---|
> | **1440** | **15 de 17** | `/` (+289.91) · `/accesorios` (+28.8) |
> | **390** | **13 de 17** | `/` (+119) · `/accesorios` (+48) · `/monitor` (+78) · `estudio` (+11.2) |
>
> **Ninguna es una regresión**: `/` no tiene base válida (C-QA3), `estudio`
> +11.2 ya estaba en el diagnóstico congelado, y las otras dos son **C-QA7**,
> abierto abajo. `qa:enlaces`, `qa:corte` y `qa:bases` limpias.
>
> ## Hecho en este bloque
>
> - **PASO 0 · la otra mitad de la custodia**, en `CLAUDE.md` junto a la guarda
>   de `w()`: **congelar y COMMITEAR van en la misma tanda**. La guarda protege
>   de que una **sonda** pise su salida; de un `rm`, un `git checkout --` o un
>   descarte en el IDE protege **git y solo git**. Se cita el fallo de la ráfaga
>   A de C-QA6, que fue exactamente eso.
>
> - **PASO 1 · C-QA2 aplicada.** El espaciador de las 4 de producto pasa de
>   `137 / lg:177` a **225 / 136.58**, y los 4 `page.tsx` dejan de llevar el
>   `div` copiado a mano: usan **`BandaCabecera`**. `qa:clon-base` con umbral
>   cero: **+48 a 1440 y −0.42 a 390 en las 4, las otras 13 sin mover un píxel**.
>
>   Contra el original el cambio hace **exactamente** lo previsto —mueve +48
>   exactos en las cuatro— y ahí aparece lo que tapaba:
>
>   | ruta | @1440 | @390 |
>   |---|---|---|
>   | `/kunak-api` · `/software-…` | **0** ✅ | **0** ✅ |
>   | `/monitor-calidad-aire` | **0** ✅ | **+78** |
>   | `/accesorios` | **+28.8** | **+48** |
>
> - **PASO 2 · el protocolo de ruido, rediseñado**, y la campaña arrancada.
>
> ## C-QA7 (ABIERTO) — lo siguiente, y ya sabe por dónde empezar
>
> Los residuos de `/accesorios` y `/monitor` **no son del espaciador**: son de
> cada página, debajo de él, y el error del espaciador los venía compensando.
>
> **La pista está medida y es fuerte:** sus originales miden **392.59** y
> **308.58**, *idénticos* a los de `/kunak-api` y `/software-…`, que ahora dan
> **Δ0 a los dos anchos**. Misma cabecera, mismo espaciador, distinto resultado
> → el sobrante está **en el cuerpo**. Se localiza comparando **la cadena del
> `h1` de la página que falla contra la de la que cuadra**, que `qa:banda` ya
> sabe sacar (`cadena`).
>
> `/accesorios` es el caso de libro de dos errores que se anulan, y ni siquiera
> daba cero: daba **−19.2**, un número pequeño y fácil de leer como fleco, que
> era **−48 de espaciador más +28.8 propios**.
>
> ## ⏳ CAMPAÑA DE RUIDO `cqa6` — 1 de 3 ráfagas. NO SE PIERDA ENTRE TANDAS
>
> El protocolo nuevo: **el suelo es el máximo ENTRE ráfagas separadas**, no
> dentro de una. Requisitos: **≥3 ráfagas · ≥2 h de separación · ≥2 días
> distintos**.
>
> | ráfaga | cuándo | resultado |
> |---|---|---|
> | **1 ✅** | 2026-07-30 22:14 local | **±32.28** en el `h1` de las **tres** rutas a 1440 |
> | **2 ⏳** | **otro día**, ≥2 h de separación | pendiente |
> | **3 ⏳** | **otro día** | pendiente |
>
> **Cómo se corre la siguiente** (una línea, ~6 min):
>
> ```bash
> CAMPANA=cqa6 RUTAS="/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas" npm run qa:ruido -- 3
> ```
>
> Congela sola en `medidas/campana/cqa6/rafaga-<sello>.json` y **dice cuántas
> faltan**. Ráfaga 1 fue la **tercera observación independiente** del episodio de
> ±32.28 y la primera que lo ve en las tres rutas a la vez: ya no es un fleco.
>
> **⚠ HIPÓTESIS DE MECANISMO añadida el 2026-07-31 — solo se anota.**
> **Cloudflare Rocket Loader** está activo en el original: reescribe
> `type="text/javascript"` con un token de 24 hex **distinto en cada petición**
> para **aplazar la ejecución de los scripts**. Se descubrió midiendo el grupo A
> —dos congelaciones de `a-spec` del mismo día difieren **solo** en ese token, en
> 4 de 14 páginas— y encaja con lo que la campaña observa:
>
> | lo observado en C-QA6 | lo que Rocket Loader hace |
> |---|---|
> | el `h1` **envuelve distinto** entre cargas | aplazar scripts desplaza **cuándo asientan fuentes y maquetación** |
> | el movimiento aparece **sincronizado en varias rutas a la vez** | es una capa **global** del sitio, no algo por página |
> | correlaciona con la **latencia** | cuanto más tarda la carga, más tarde se ejecuta lo aplazado |
>
> **No es una explicación y no se persigue ahora.** Es un candidato con tres
> coincidencias, que es más de lo que había. Lo que sí se hace es **registrarlo
> sin coste**: `ruido.mjs` anota ya, junto a cada medida, `rocketToken` (si el
> token por petición está presente) y `rocketLoader` (si el script del propio
> Rocket Loader está en la página) — editada **antes** de la ráfaga 2, como se
> hizo con `cargaMs`. **Las ráfagas 2 y 3 no necesitan nada a mano.**
>
> > **Pista de mecanismo (solo anotada — no perseguir):** el ±32.28 de la ráfaga 1
> apareció **en las tres rutas A LA VEZ**. Movimiento sincronizado sugiere una
> causa global compartida, no aleatoriedad por página. Las ráfagas 2 y 3 deben
> anotar si la sincronía se repite.
>
> **Y la ráfaga 2 anota EL TIEMPO DE CARGA junto a cada medida.** Hipótesis a
> confirmar o descartar: el ±32.28 sincronizado **correlaciona con la latencia
> del original** (cargas lentas → fuentes/imágenes sin asentar → el `h1`
> envuelve distinto). El episodio de latencia existe: la noche del 2026-07-31
> el original dio cargas de >120 s (documentado en
> `c-banda-1440-2026-07-31-2.json`). ✅ **`ruido.mjs` ya congela `cargaMs`
> junto a cada medida** (2026-07-31, editada ANTES de la ráfaga 2, con
> `qa:lib` 26/26 y corrida instrumental congelada en
> `medidas/ruido{,-crudo}-paso0b.json` — cargas de 7.3–8.0 s esa corrida, y
> el timeout también se cronometra: un error trae su latencia). Las ráfagas
> 2 y 3 no necesitan nada a mano.
>
> ⚠ **Hasta cerrarla, `/software` NO se da por verificado** aunque dé Δ0 a los
> dos anchos: un Δ0 leído en una corrida puede ser el episodio y no el arreglo.
> Y una combinación a 0 se lee **«no se observó ruido en estos episodios»**,
> nunca «su suelo es 0».
>
> ## Abiertas, por orden
>
> - **C-QA7** — `/accesorios` (+28.8 · +48) y `/monitor` (+78 solo a 390). Con
>   pista medida, arriba.
> - **C-QA6** — la campaña, 2 ráfagas y ≥1 día.
> - **C-QA3 · la home** — es un déficit de **contenido** en la columna del hero
>   (**−50.84**, amplificado por centrado vertical), **no de cabecera**: el `pt`
>   del hero vale 180 en los dos lados. Se decide aparte.
> - **C-QA5** — el `h1` envuelve distinto en 4 rutas, **solo a 1440**. Base
>   válida; lo que no cuadra es el **ancho** del contenedor del título.
>
> ## Dos cosas que este bloque enseñó y conviene no repetir
>
> 1. **Un veredicto medido en una página no cubre las cuatro.** El acta anterior
>    decía «un solo cambio, sin segundo defecto debajo» apoyándose en que el
>    offset coincidía al céntimo — **en `/kunak-api` y solo ahí**. Para 2 de 4 no
>    valía, y esa diferencia es C-QA7.
> 2. **Medir a los dos anchos no es opcional.** Un comentario CSS mal cerrado
>    dejó cuatro líneas de prosa haciendo de selector y el parser se comió **la
>    regla base** —la que sirve el ancho móvil—: bandas de 0 a 390 con **1440
>    intacto**. A 1440 solo, habría pasado por buena. (Y pasó dos veces: la
>    explicación del fallo llevaba el token de cierre entre comillas, que en CSS
>    no se puede citar.)
>
> ---
>
# (bloque anterior) HANDOFF — C-3 construida; lo siguiente es la CABECERA

> ⚠ **Actualización 2026-07-30, al cerrar el diagnóstico de C-QA1.** El cuerpo
> de este documento (abajo) describe el estado **antes** de construir C-3 y
> sigue siendo válido como contexto. Lo que cambia es qué toca ahora.
>
> **C-3 está construida y verificada**: 17 rutas (11 + 6), las **siete
> predicciones P-C3-1…7 se sostienen**, `qa:enlaces` limpia en las dos
> direcciones y **0 regresión** en las 11 anteriores a los dos anchos. Acta en
> `docs/research/grupo-C/MEDICION.md` (partes 1 y 2).
>
> ## Lo siguiente: la cabecera, y son DOS defectos
>
> Diagnóstico completo en `docs/PENDIENTES-QA.md` §C-QA1, medido con
> `npm run qa:c-cabecera` sobre las 17 rutas y **congelado**. En corto:
>
> - **La cabecera del original no es una sola cosa.** Su alto depende de la
>   plantilla (**225** producto · **387** caso · **397.61** sector · **433.61**
>   monográfico a 1440) y está **EN FLUJO** en todas menos la home, porque el
>   original mete la banda de título **dentro** de `header.et-l--header`. El
>   clon sirve siempre **203.59** y siempre **fuera de flujo**.
> - **Los 6 sectores están CORRECTOS, no compensados**: el clon los descompone
>   en `HeaderNav` absoluto + `section.cabecera-sectores` en flujo y el `h1` cae
>   en 261.16 en los dos lados. Descomposición fiel, mismo total.
> - **Pero 4 páginas de producto tienen un desfase real que nadie había visto**
>   (`/accesorios`, `/kunak-api`, `/monitor-calidad-aire`, `/software-…`), y
>   **cambia de signo entre anchos**: −19.2 → **+48.42** en accesorios, −48 →
>   **+78.42** en monitor. Un residuo que cambia de signo entre dos maquetaciones
>   no es ruido.
> - **Por qué llevaba invisible**: la regla del `h1` **resta la base de lectura
>   antes de comparar**, así que un desfase que está *en* la base se normaliza a
>   cero por construcción. El contenedor con holgura es **el propio protocolo**.
>
> **Por tanto la tanda NO es «cabecera sola»**: es **C-QA1** (las 6 nuevas) +
> **C-QA2** (el espaciador de las 4 de producto), y arreglar la primera sin la
> segunda movería 4 páginas hoy verdes. **Va con plan propio y en sesión
> limpia** — es cambio de componente compartido en 17 rutas.
>
> **Lo que ya está listo para esa sesión:** la base congelada de las 17
> (`medidas/clon-base-{1440,390}-cqa1-antes.json`, umbral cero), el diagnóstico
> (`medidas/c-cabecera-{1440,390}.json`) y la guarda nueva de `lib.mjs`.
>
> ⚠ **`/` no cuenta como defecto todavía**: su `h1` sale a **y=0 a los dos
> anchos** en el original, la firma de un `h1` dentro de una diapositiva
> absoluta. Mirarlo aparte antes de tocarlo.
>
> **Y una regla nueva en `CLAUDE.md`**, la cuarta sobre sondas: *un selector que
> no casa con nada no es un cero, es un defecto*. Resuelta en el sitio común
> (`Censo` en `scripts/qa/lib.mjs`); las sondas usan `__q`/`__qa`.

---

# (contexto previo) la entrada de C-3 está COBRADA

> Reescrito el **2026-07-30** al cerrar el bloque de medición de **C-3**. Para
> arrancar sesión limpia: son 5 minutos. Lo anterior (grupo C decidido en C-2,
> monográfico construido, grupo A reconocido) sigue vigente y está resumido
> abajo con su detalle enlazado — no hay que releer los docs viejos.

## Lo primero: en qué punto está

El clon tiene **11 rutas de 7 arquetipos**, todas verificadas y sin moverse un
píxel. Desde el 2026-07-30 el trabajo se mueve del **clon** al **modelado**:
censo → los 4 grupos → grupo A reconocido → grupo C reconocido (**C-1**),
decidido (**C-2**) y ahora **con su entrada de construcción medida (C-3, bloque
1 de 2)**.

> **Lo siguiente es literalmente escribir el código.** La condición de entrada
> —las siete predicciones P-C3-1…7— **ya no bloquea**: las tres que se podían
> cobrar antes de construir se cobraron y **las tres se sostienen**. Lo que
> queda del encargo C-3 son los PASOS 1, 2 y 3.

| documento | qué trae |
|---|---|
| **`docs/research/grupo-C/MEDICION.md`** | **léelo primero**: la entrada cobrada, los 5 SIN PROBAR cerrados y **las 4 cosas que mueven el modelo** |
| `docs/research/grupo-C/DECISIONES.md` | **C-2: las cinco decisiones** + el ⚠ CORRIGE al recon + el pre-registro P-C3-1…7 |
| `docs/research/grupo-C/MODELO.md` | los tres content types, **ya con los ⚠ CORREGIDO de C-3 dentro** |
| **`docs/ESQUEMA-CMS.md`** | **el destino**: Payload, cada content type, la whitelist del campo rico, migración y aceptación. §2b es el grupo C; **§2b.1 es el corrige de C-3**. Registro vivo |
| `docs/research/grupo-C/PAGE_TOPOLOGY.md` · `BEHAVIORS.md` | recon C-1, censo 76/76. Datos, cero decisiones |
| `docs/research/arquetipo-A/` | recon del grupo A (209 pg): campo rico censado 209/209 |
| `docs/research/RECON-LISTADOS.md` · `CENSO-ARQUETIPOS.md` | las 7 formas que suman 321 páginas son 4 arquetipos · cuánto le falta a la biblioteca |
| `docs/PENDIENTES-QA.md` | registro vivo de QA. **Léelo antes de tocar una página ya clonada.** Su última sección es la del grupo C |

## Lo que cobró el bloque de medición (2026-07-30)

Dos sondas nuevas, **`qa:c-cascaron`** y **`qa:c-spec`**, con salida congelada y
test en negativo. Acta en `MEDICION.md`.

| predicción | veredicto | evidencia |
|---|---|---|
| **P-C3-2** · el cascarón no esconde campos | ✅ **se sostiene** | 10 instancias adversarias (6 casos con los dos prefijos, 4 FAQ) · **131 ejes × 2 anchos · 0 con varianza** |
| **P-C3-1** · la 4ª sección del pie | ✅ **se sostiene** | idéntica **byte a byte en los 6 pares**. **D5 cerrada: cero campos** |
| **P-C3-4** · la ficha se proyecta del producto | ✅ en lo comparable | los 2 `data-id` presentes en ≥2 casos dan ficha idéntica · 0 choques |

**Cinco SIN PROBAR cerrados** — C-SP8 (migas: `Inicio > Casos de éxito > título`,
y **la del prefijo inglés apunta al índice ESPAÑOL**, evidencia nueva a favor de
D2) · **C-SP9** · **C-SP10** (cero leyendas; el `alt` es del caso, no de la
imagen) · **C-SP12** (el chip **sí** enlaza a `/es/sector/<slug>/`) · muestra de
C-SP6 (`youtube` · `vimeo` · **`kunakcloud.com`**, dominio propio).

### ⚠ Las CUATRO cosas que mueven el modelo — están ya escritas, no las redescubras

Ninguna contradice a C-2: tres resuelven condiciones que C-2 dejó escritas.
Detalle en `MEDICION.md` §5 y `ESQUEMA-CMS.md` §2b.1.

1. **`destacado` NO es texto plano** — lleva `<strong>` y `<br>` → rico **en
   línea**. Y **vive como último hijo del contenedor de `necesidad`**: ahí hay
   que renderizarlo.
2. **`detalles.parametros` NO es texto plano** — lleva `ul li sub b p` → rico. Y
   su HTML de origen es **inválido** (`<ul>` dentro de `<p>`): el parser cierra
   el `<p>` antes, así que un extractor ingenuo devuelve el campo **vacío sin
   dar error**.
3. **La FAQ tiene BARRA LATERAL** (`et_right_sidebar`, 4 widgets). **No añade
   campo** —P-C3-7 aguanta— pero es pieza de plantilla que el modelo daba por
   inexistente. Es barato en campos, no en cascarón.
4. **El producto necesita `bulletsTitulo`** con defecto `"Ventajas"`: los
   cartuchos titulan **«Especificaciones»**. `ProductPanel` lo tiene cableado.

## Lo que queda de C-3, en orden

**PASO 1 · construir.** Colecciones en `src/lib` (`casos.ts`, `faqs.ts`,
`taxonomia-sectores.ts`), detalle de caso y detalle de FAQ, rutas según D2:
prefijo como campo, las 4 inglesas bajo `/case-studies/`, **rutas cruzadas NO
emitidas**. Fichas de soluciones **por relación a productos**. Sector por
taxonomía con sus **dos proyecciones** (chip y fila de detalles) desde **un solo
dato**. Constantes a plantilla (D3). Textos verbatim, rutas locales para lo
clonado.

> **`ubicacionMapa`: el render es decisión aparte y no se hereda.**
> `MapaProyectos` de SECTOR es placeholder deliberado (S3, sin clave de GCP).
> El mapa del caso es **otro** componente (un punto, contenedor 330/290). Si se
> decide también placeholder, **se dice en voz alta** y va a `PENDIENTES-QA.md`
> con su razón. El modelo guarda las coordenadas en los dos casos.

**Lo que ya está transcrito y no hay que volver a medir**: el contenido verbatim
de las 6 instancias del mínimo adversario está congelado en
**`scripts/qa/medidas/c-spec.json`** — títulos, cliente, los tres bloques ricos
en HTML, destacado, galerías, detalles fila a fila, marcadores, `data-id` de
soluciones con su ficha completa, migas y SEO. **Se lee de ahí, no del
original.**

**PASO 2 · el mínimo adversario, ya elegido** (y es el que mide `c-spec`):

| instancia | qué eje rompe |
|---|---|
| `des-moines` | **dos términos** de sector · galería 7 · soluciones · mapa |
| `world-athletics` | **sin término** (chips vacíos) · **sin galería** · destacado |
| `rio-de-janeiro` | **prefijo inglés** · **sin mapa** (el único de 57) · galería 15 (la mayor) · destacado **con marcado** · **tabla** |
| `lindano` | **sin soluciones** · **sin parámetros** (el único de 57) · sin galería |
| FAQ `dron` | la más corta (151) |
| FAQ `calibracion-correccion` | la más larga (539) y la de más etiquetas |

Assets que hay que descargar a `public/` (**nunca se enlaza en caliente**):
22 imágenes de galería (7 + 15), 4 `og:image`, y las fotos de los 3 productos
de cartucho nuevos que sí tienen (`amoniaco` no tiene).

**PASO 3 · verificar.** Ciclo completo (matar **por puerto**, `.next` borrado,
build, **marcador**). Las predicciones que quedan, una a una, **las que puedan
fallar primero**:

- **P-C3-3** · el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed. Ojo: Río
  **lleva tabla** (§3.4 sigue abierta) y `blockquote`.
- **P-C3-5** · al emitir las rutas nuevas, **`qa:enlaces` convierte en fallo los
  `href` absolutos existentes** (los de `projects.ts`, el CTA de `sectores.ts` a
  `case-studies`, y los que haya — **se localizan con la sonda, no a mano**).
  *Refuta:* que salga limpia con los absolutos aún puestos → sería la sonda
  fallando. Corregirlos y re-correr **hasta limpia en las dos direcciones**.
- **P-C3-6** · el mapa: contenedor 330/290, un marcador.
- **P-C3-7** · la FAQ entra con `titulo + cuerpo` y no aparece ningún campo.
  (La barra lateral **no** lo refuta: no es campo.)
- **Sin regresión**: las 11 páginas anteriores contra
  `medidas/clon-base-{1440,390}-c3-antes.json`, **umbral cero**, con `MARCADOR`.

**PASO 4 · docs.** `MEDICION.md` ya existe y se amplía con el resultado de la
construcción; `PENDIENTES-QA.md` tiene ya su sección de grupo C con
C-SP13/14/15 abiertos; `ESQUEMA-CMS.md` §2b.1 tiene el corrige.

## El destino: Payload, y nada lo bloquea

**Payload self-hosted** en VPS Hostinger + Easypanel, sobre **Postgres** propio,
**embebido en la app Next**, editor **Lexical**, lectura por **Local API** (el
SSG actual se conserva). Todo el esquema en `ESQUEMA-CMS.md`.

**Cerradas**: **CMS-0b** media en volumen persistente · **CMS-0c** publicación
por **rebuild con webhook, no ISR** · **CMS-0d** `next` a **16.2.12** (Δ0 en las
11) · **CMS-0e** el cuerpo entra como **HTML crudo, convertido por entrada** ·
**T6/A-SP9** el `id` de los `h2` **se regenera** · **§1.5b** `sectores` y
`monograficos` son dos colecciones · **CMS-1** el prefijo como campo (C-2).

**Abiertas, y ninguna bloquea**: cómo se modela la tabla (§3.4) · qué hosts de
embebido se admiten (§3.3b) · **qué hace el CMS con la alineación en línea**
(§3.1 — ya **no** por falta de datos: C-3 la midió, 24 apariciones, 3 valores, 4
etiquetas).

⚠ El **recuento** de CMS-0e (16 · 3 · 5) sigue **provisional** hasta rehacerlo
con `@payloadcms/richtext-lexical` instalado. **Ningún número de ese § se cita
como firme** antes de esa corrida.

## SIN PROBAR vivos, en un sitio

**Grupo C** — **cerradas por C-3**: `C-SP1`(=D5) · `C-SP7` · `C-SP8` · `C-SP9` ·
`C-SP10` · `C-SP12`. **Siguen abiertas**: `C-SP2` (rutas cruzadas — **ya no
bloquea**, D2; la medición que la cierra está escrita: barrer las 57 leyendo
**`X-Redirect-By`**) · `C-SP3` (**ya no condiciona**) · `C-SP4` (**no
condiciona**: se decide por la salida servida) · `C-SP5` (qué es el único
`<script>`) · **`C-SP6`** (censar por host los `iframe` de los 11 casos **antes
del import**) · `C-SP11` (qué sirve `/es/case-studies/` a pelo). **Nuevas de
C-3**: **`C-SP13`** (la barra lateral, medida en 4 de 19) · **`C-SP14`**
(`bulletsTitulo`) · **`C-SP15`** (la alineación en línea).

**Grupo A** — `A-SP1`…`A-SP7`, `A-SP10`…`A-SP13` (`ESQUEMA-CMS.md` §2.3).
`A-SP8` y `A-SP9` cerradas. **No se cablea ninguno.**

**Comportamiento del grupo C** — `C-SB1`…`C-SB5` en su `BEHAVIORS.md` §6.

## Estado del clon

**7 arquetipos**, 11 rutas emitidas, todas verificadas: HOME · PRODUCTO
(`/monitor-calidad-aire`) · CATÁLOGO (`/accesorios`) · SOFTWARE
(`/software-de-medicion-calidad-del-aire`) · su variante corta (`/kunak-api`) ·
SECTOR (`/sectores/[slug]`, 4 de 8 poblados) · MONOGRÁFICO TÉCNICO (2 de 2).

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera es **añadir datos, sin tocar código** — la prueba de
CMS-readiness ya pasada (§5 del esquema).

**La línea base viva**: Petróleo **exacto** a 1440 (0 módulos · 0 filas · 0
secciones), EDAR −0.01; a 390, −0.23 y −0.16. Las 9 anteriores sin moverse un
píxel habiendo tocado tres componentes compartidos. Todo el residuo son **tres
módulos de imagen** con causa medida (**M-IMG**: `srcset`).

**Del experimento pre-registrado**: H1 rechazada → **dos content types**, con la
frontera en **tres campos**. **Sigue prohibido** añadirlos «de paso», ampliar
`flujo` o subir el `pb` de fila a dato sin una tanda de fusión con su plan.

## Cuánto le falta a la biblioteca

**380 páginas conocidas** en `/es` (**y 380 es un suelo**: el sitemap omite los
`noindex`). Cubiertas 13 · dudosas 20 · **sin cubrir 347**. **Por formas vamos
por el 30 %**, que es la cifra que cuenta: un arquetipo se paga una vez.

| grupo | formas | páginas | estado |
|---|---|---|---|
| **A · detalle plantillado** | blog · término · doc. científico | **209** | reconocido, no construido |
| **B · listado plantillado** | archivo de taxonomía | 23 | sin tocar |
| **C · detalle sin plantilla de cuerpo** | caso de éxito · FAQ | **76** | **decidido y con la entrada medida** ← aquí |
| **D · página del builder** | artículo de KB | 13 | hipótesis encolada con pre-registro |

La pista del grupo D, **anotada y no perseguida**: su cuerpo es lo que
`MonoSeccion[]` modela. **Se prueba con experimento pre-registrado, no de
oído**, y mientras tanto **no se toca `MonoSeccion[]`**.

## Lo que NO hay que hacer al empezar

- **No re-medir el original a mano.** El contenido verbatim de las 6 instancias
  está en `medidas/c-spec.json` y el cascarón en `c-cascaron-{1440,390}.json`.
- **No arreglar S9, S10 ni S11 sueltos** (nota de **CLASE** en `PENDIENTES-QA`).
- **No perseguir M-IMG.** Son décimas, causa escrita, se cierra con `srcset`.
- **No promocionar a campo** el sobretítulo, los títulos de bloque ni los
  rótulos del caso: están en `MODELO.md` como plantilla **con su evidencia**.
- **No añadir los tres campos del §1.3** sin tanda de fusión con plan.
- **No reabrir D5.** P-C3-1 la cerró midiendo.

## Método: lo que se paga cuando se olvida

Todo está en `CLAUDE.md`; aquí solo lo que más ha costado:

- **Identifica el RÉGIMEN antes de aplicar ningún test.** El grupo C es un
  **tercer** régimen (cabecera y pie por Theme Builder, cuerpo por PHP del tema)
  y se le aplica la lectura **plantillada**: el discriminador es la **varianza
  entre instancias**, no el test A.
- **Mide al NIVEL donde vive la propiedad.** Y C-3 añadió **la mitad que
  faltaba**: medir más **ABAJO** la invalida igual que medir más arriba —
  `c-cascaron` midió un `<p>` de dentro del contenido rico y sacó «varianza» que
  era el `style` del editor. La otra cara: `c-spec` comparó el pie **entero** y
  refutó P-C3-1 por otra sección, a punto de reabrir D5 sin motivo. **El
  veredicto tiene que cubrir exactamente la propiedad de la que habla.**
- **Las sondas llegan con defectos y dan números plausibles, no errores.** Un
  canal de verdad, **congelar la salida** (y que **el sabotaje escriba en otro
  fichero**: la primera versión pisaba la medida buena con la falsa), y
  **documentado no es conectado**. Cada arreglo **vuelve a correr el test en
  negativo entero**.
- **Un HTML inválido no da error: da un campo vacío.** `<ul>` dentro de `<p>` y
  el extractor se queda sin la lista.

## Sondas y comandos

**Se lanzan por `npm run qa:*` desde la raíz. El `--` es obligatorio.**

```bash
npm run check                            # lint + typecheck + build  ← antes de commitear
npm run build && npm run start           # tras editar: parar POR PUERTO, rehacer, relanzar
npm i --no-save puppeteer-core           # una vez (y tras CUALQUIER npm install)

npm run qa:enlaces                       # guarda de rutas locales — las dos direcciones
npm run qa:corte                         # guarda del corte del cuerpo — 12/12
npm run qa:clon-base -- 1440 --cmp medidas/clon-base-1440-c3-antes.json
npm run qa:offsets -- <ruta> 1440        # offset por nodo + HOLGURA por columna
npm run qa:mono -- edar 1440             # original vs clon, módulo a módulo
npm run qa:dos-rutas -- /a /b 1440       # dos rutas del mismo build, cara a cara
npm run qa:ruido -- 3                    # suelo de ruido, antes de juzgar nada
npm run qa:c-cascaron -- 1440            # P-C3-2 · SABOTAJE=forma es su test en negativo
npm run qa:c-spec                        # transcripción verbatim + P-C3-1
npm run qa:c-censo | qa:c-muestra | qa:c-rutas | qa:c-behaviors
npm run qa:a-censo | qa:a-embeds | qa:a-scripts | qa:a-ids | qa:a-lexical
```

Catálogo completo en `scripts/qa/README.md`. Salidas congeladas en
`scripts/qa/medidas/`.

**Las tres trampas que siguen cobrándose:**

1. **Mata el servidor por puerto, nunca con `pkill`**, y **verifica un marcador
   del cambio en el HTML servido** antes de dar una medida por buena.
   `clon-base.mjs` lo exige por `MARCADOR`; las demás **todavía no** (tarea
   mecánica pendiente: que sean dueñas de su ciclo de servidor, ~20 líneas en
   `lib.mjs`).
2. **`puppeteer-core` va con `--no-save`**, así que **cualquier `npm install` lo
   poda**. Rehacerlo antes de correr sondas.
3. **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844), y
   **capturas por viewport, nunca `fullPage: true`**.
