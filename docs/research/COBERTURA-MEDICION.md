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

> Generada por `npm run qa:cobertura` · congelada en `medidas/cobertura.json`.
> **No se edita a mano**: se recomputa de las salidas de `medidas/`.

> ⚠ **`/` — base `h1` NO VÁLIDA. Ancla alternativa: el `h2`.** Su `h1` es un
> título oculto para SEO en los dos lados y **no empuja nada**: original
> `static` pero **0×0**, clon `absolute` (fuera de flujo) 1×1. Medido
> 2026-08-01, `medidas/c-cabecera-{1440,390}-parcial-2026-08-01.json`. Su celda
> `O` en «base» significa *comparada*, **no** *verificada*: el número que vale
> es el del `h2` — **+21.03 a 1440 · −0.23 a 390**, abierto en C-QA3.

| ruta | docH | base cruda (h1.y) | árbol secciones | filas | módulos | offsets/holgura | anchos horiz. | enlaces | comportamiento |
|---|---|---|---|---|---|---|---|---|---|
| **HOME** ||||||||||
| `/` ⚠ | **O** | **O**⚠ | **O** | · | · | · | **O** | **O** | · |
| **PRODUCTO** ||||||||||
| `/monitor-calidad-aire` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| **CATÁLOGO** ||||||||||
| `/accesorios` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| **SOFTWARE** ||||||||||
| `/kunak-api` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/software-de-medicion-calidad-del-aire` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| **MONOGRÁFICO** ||||||||||
| `/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar` | **O** | **O** | **O** | **O** | **O** | c | · | **O** | · |
| `/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas` | **O** | **O** | **O** | **O** | **O** | c | **O** | **O** | · |
| **SECTOR** ||||||||||
| `/sectores/calidad-del-aire-en-las-ciudades` | **O** | **O** | **O** | **O** | · | c | **O** | **O** | · |
| `/sectores/contaminacion-por-construccion` | **O** | **O** | **O** | **O** | · | · | · | **O** | · |
| `/sectores/control-de-emisiones-industriales` | **O** | **O** | **O** | **O** | · | · | · | **O** | · |
| `/sectores/estudio-de-la-contaminacion-atmosferica` | **O** | **O** | **O** | **O** | · | · | · | **O** | · |
| **CASO** ||||||||||
| `/case-studies/distrito-baja-emision-rio-de-janeiro` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/casos-de-exito/red-calidad-de-aire-para-world-athletics` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| **FAQ** ||||||||||
| `/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| **A · documento científico** ||||||||||
| `/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/recursos/documentos-cientificos/articulos-cientificos-y-estudios/idoneidad-de-una-red-de-comunicaciones-moviles-para-realizar-mediciones-de-la-calidad-del-aire-de-alta-resolucion` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/recursos/estudios-cientificos/articulos-tecnicos/soluciones-avanzadas-de-monitorizacion` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| **A · blog / término** ||||||||||
| `/cloruro-de-hidrogeno-hcl` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/contador-particulas-suspension-movilidad-sostenible` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/contaminacion-por-metano` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/emisiones-atmosfericas` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |
| `/la-contaminacion-del-aire-el-asesino-silencioso-de-europa` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/metano` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/monitorizacion-de-emisiones-del-trafico-urbano` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/running-for-clean-air` | **O** | **O** | **O** | · | · | · | · | **O** | · |
| `/todas-nuestras-soluciones-en-el-iotswc` | **O** | **O** | **O** | · | · | · | **O** | **O** | · |

### Recuento · DESPUÉS de la tanda de cierre (2026-08-01)

| eje | **O** | `c` | `·` | sonda que lo compara | antes |
|---|---|---|---|---|---|
| **docH** | **31** | 0 | 0 | `c-cmp` — deriva del build | 8 |
| **base cruda (h1.y)** | **31** | 0 | 0 | `c-cabecera` — deriva del build | 21 |
| **árbol de secciones** | **31** | 0 | 0 | `c-cmp` | 9 |
| enlaces | **31** | 0 | 0 | `enlaces` — **ya congela** | 31 *(sin evidencia)* |
| anchos horizontales | **13** | 0 | 18 | `a-miga` · `c-banda` | 12 |
| filas | **6** | 0 | 25 | `tree-cmp` · `mono-cmp` | 3 |
| módulos | **2** | 0 | 29 | `mono-cmp` | 2 |
| offsets / holgura | **0** | 3 | 28 | — *(ninguna)* | 0 |
| comportamiento | **0** | 0 | **31** | — *(ninguna)* | 0 |

**No queda ni una celda `c` en docH, base y árbol.** Se cerraron generalizando
dos sondas para que **deriven sus rutas del build**, como ya hacía `enlaces`: a
partir de ahora **una ruta nueva entra sola** y su hueco se cierra sin que nadie
tenga que acordarse. Ése es el cierre que importa — no las 23 celdas de hoy,
sino que la matriz no vuelva a abrirse por olvido.

**Lo que la primera corrida encontró está en `PENDIENTES-QA.md` §COBERTURA:** un
desfase de cascarón **por familia** (−87.5 en las 14 rutas de grupo A, con el
signo invertido a 390), **+289.91 de base en la HOME**, y dos defectos de sonda
cazados por sus tests en negativo. Ninguno era visible para una guarda solo-clon.

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

## Lo que queda abierto, y su coste

La tanda de cierre gastó lo barato. Queda:

| # | hueco | estado | coste |
|---|---|---|---|
| 1 | **anchos horizontales del CUERPO** | **0/31 de verdad** — los 13 de la tabla son de UN elemento (11 de la miga, 2 de la banda) | **sonda nueva.** La prioritaria |
| 2 | **filas** | 6/31 — solo sectores y monográficos; `tree-cmp` no sabe de las otras formas | generalizar `tree-cmp` |
| 3 | **módulos** | 2/31 — solo `mono-cmp` | generalizar `mono-cmp` |
| 4 | **offsets / holgura** | 0 contra el original; `offsets` es solo-clon por construcción | modo `--orig`, caro |
| 5 | **comportamiento** | **0/31** — `a-behaviors` y `c-behaviors` solo abren el original | sonda nueva |
| 6 | **estado HTTP en las demás sondas** | solo `c-cmp` lo mira; `lib.mjs` ya lo expone | 1 línea por sonda |

### Por qué el ancho del cuerpo sigue siendo el número 1

No ha cambiado desde la auditoría, y ahora hay una razón más:

1. **El eje puede ser absorbido.** El *wrap* tapa un ancho igual que una fila con
   holgura tapa un alto, y a 1440 no deja ni rastro.
2. **Nunca hubo sonda apuntándole.** Las dos que existen —`a-miga`, `c-banda`—
   nacieron **reaccionando a un defecto ya encontrado**, nunca antes.
3. **Precedente medido, ya tres veces**: el kicker de `/monitor` a 50 px, la miga
   del grupo A, y las cuatro copias a mano de A-QA1b.
4. **Y ahora un cuarto**: el desfase de cascarón de C1 aparece a −87.5 a 1440 y
   **+228.5 a 390**. Un residuo que cambia de signo entre anchos es, por la regla
   espejo, un contenedor que en un ancho tapaba algo — y eso es geometría
   horizontal.

### Lo que NO recomiendo priorizar

**`offsets` contra el original.** Sirve para **diagnosticar** cuando ya sabes que
algo no cuadra, no para **detectar**. Como red, el ancho del cuerpo (#1) cubre
más por menos.

## Cómo se refresca

```bash
npm run qa:cobertura      # recomputa la matriz de medidas/ y la congela
```

La sonda **exige que exista toda fuente que declara**: si un fichero de
`medidas/` desaparece, la celda saldría `·` —indistinguible de «nunca se
midió»— así que sale por **error** y cierra el código de salida. Test en
negativo: `SABOTAJE=1 npm run qa:cobertura` → exit 2.
