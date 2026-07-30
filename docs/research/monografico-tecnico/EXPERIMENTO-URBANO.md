# El experimento que decide si SECTOR y MONOGRÁFICO son un content type o dos

> **Diseñado el 2026-07-29, en fase de specs, ANTES de construir nada.**
> Se escribe ahora justamente porque escribirlo después sería escribirlo sabiendo
> qué resultado conviene. Lo que sigue —hipótesis, criterio de éxito, predicciones
> y regla de decisión— **queda registrado y no se toca** cuando lleguen los datos.
>
> ---
>
> ## ▶ CORRIDO el 2026-07-30 · **H1 RECHAZADA por C1** · acta en el §8
>
> **Veredicto:** el content type de MONOGRÁFICO **no** expresa el cuerpo de
> Urbano sin campos nuevos. Hacen falta **tres**. Los dos arquetipos se quedan
> separados, y ahora **con la frontera medida**.
>
> **De las cuatro predicciones acertaron tres** (P1 · P2 · P4) y **falló P3**,
> que se daba por segura. El acta completa, con la composición de cada Δ y por
> qué P3 falló, está abajo. Nada de §1–§7 se ha tocado.

## 0 · Cuándo se corre

**Al terminar de construir MONOGRÁFICO, y no antes.** Hasta entonces: no tocar
`SectorBlock`, no ampliar `flujo`, no subir el `pb` de fila a campo. El
argumento está en `DECISIONES.md` (c) y en §3 del recon.

Se adelanta **solo** si aparece antes una instancia de SECTOR que el modelo de
SECTOR no representa (p. ej. un sector clásico con un `pb` de fila distinto de
28.7969/30). Ese hallazgo *es* el resultado del experimento llegando por otra
puerta.

## 1 · Hipótesis

> **H1** — El content type de MONOGRÁFICO puede expresar el cuerpo de Urbano sin
> pérdida y sin campos nuevos. Es decir: **SECTOR es un caso degenerado de
> MONOGRÁFICO**, y el CMS necesita un solo content type.

**H0** (lo que hay que poder afirmar si H1 falla): existe al menos una propiedad
del cuerpo de Urbano que el modelo de MONOGRÁFICO no representa sin añadirle un
campo. Entonces **la frontera está medida** y los dos arquetipos se quedan
separados con una razón escrita.

Las dos salidas son resultado. La que no vale es "casi entra".

## 2 · Qué se mide, y contra qué

**Clon contra clon, no contra el original.** Urbano ya está clonado y su cuerpo
clava el original (Δ0 en los dos anchos, S7). Comparar la reexpresión contra el
**Urbano actual** elimina de raíz el ruido del sitio vivo: el clon es
determinista y dos builds del mismo código dan el mismo número al céntimo.

El objetivo de medida es, en los **dos anchos** (1440×900 y 390×844):

1. el **árbol sección → fila** del cuerpo (`mt` · `pt` · `pb` · alto de cada
   nodo), con `scripts/qa/tree-cmp.mjs` adaptado a comparar dos rutas del clon;
2. la **altura de documento** (`docH`);
3. las **anclas de texto** del cuerpo (`cmp-sector.mjs`).

## 3 · Procedimiento

1. Construido MONOGRÁFICO, se crea **`/sectores/urbano-mono`** (ruta temporal, no
   enlazada) que monta el cuerpo de Urbano **con el modelo y los componentes del
   monográfico**, transcribiendo `SECTOR_URBANO.body` a `MonoSeccion[]`.
2. La transcripción se hace **solo con los campos que ya existen** en
   `MODELO.md`. **Cada vez que haga falta inventar un campo se anota en el acta y
   no se inventa**: es un fallo de H1, y seguir adelante con el campo puesto
   convierte el experimento en una profecía autocumplida.
3. `npm run build`, matar el servidor **por puerto**, relanzar, verificar un
   marcador del cambio en el HTML servido (§ el corolario de `CLAUDE.md`).
4. Medir las tres cosas del §2 sobre `/sectores/calidad-del-aire-en-las-ciudades`
   y `/sectores/urbano-mono` **en la misma corrida**.
5. Se borra la ruta temporal. **Lo que se conserva es el acta**, no el código.

## 4 · Criterio de éxito — registrado antes de mirar

**H1 se acepta si y solo si se cumplen las tres:**

| # | criterio | umbral |
|---|---|---|
| C1 | ningún campo nuevo en el modelo del monográfico | **0** campos |
| C2 | árbol sección→fila idéntico | **Δ 0** en `mt`/`pt`/`pb` y en el alto de cada fila, **en los dos anchos** |
| C3 | `docH` idéntico | **Δ 0** en los dos anchos |

**El umbral es cero y no es un capricho.** Es clon contra clon: no hay ruido que
justifique una tolerancia. Y el cuerpo de un sector está en la región de
dispersión **0** del sitio (`scripts/qa/README.md` §3), así que aquí un Δ de 8.6
es tan real como uno de 100.

**C1 manda sobre C2 y C3.** Un cuerpo que sale idéntico al píxel *después* de
añadirle dos campos al modelo no prueba H1: prueba que dos modelos parecidos
convergen si se les añade lo que les falta, que es cierto para cualquier par de
modelos.

## 5 · Predicciones — para que no se puedan mover las porterías

Registradas ahora, con lo que se sabe hoy. El valor del experimento está en que
estas cuatro se pueden equivocar:

| # | pieza de Urbano | predicción | por qué |
|---|---|---|---|
| P1 | `beneficiosAplicaciones` | **entra sin campos nuevos** | EDAR S2F0 es literalmente `punt · h3 · ul` en las dos columnas — ya medido |
| P2 | `flujo: seccionRasa` / `filaPegada` | **entra**: son `{mt:0,pt:0,pb:0}` y `{pt:0}` | el enum de 4 es una proyección de los overrides (`seccion-editorial.spec.md` §1) |
| P3 | `ctaDescarga` piel `"foto"` | **entra**, pero el monográfico **no la ejercita** (solo usa `"fondo"`) | el campo `variante` ya existe en `SectorBloqueCtaDescarga` y viaja con el módulo |
| P4 | **`claimConFoto`** | **ES EL QUE FALLA** | ver abajo |

### P4, la predicción que importa

`claimConFoto` es lo único de Urbano que el monográfico **no tiene ninguna
instancia de**, y tiene dos rasgos que el modelo no expresa hoy:

- el claim es un **`<p>` de 37px**, no un `h2` ni un `h3` (el `claim` del
  monográfico es `h2` 37/37 o `h3` 44/55);
- va **centrado verticalmente** respecto a la foto (el original usa
  `margin: 121.031px 0` en la columna; el clon lo resuelve con `items-center`).
  **Ninguna columna del monográfico está centrada verticalmente**: las 31
  medidas apilan desde arriba.

Si P4 se cumple, H1 cae por C1 y el resultado es **"la frontera está en la
alineación vertical de columna y en el nivel semántico del claim"** — una
frontera concreta, medida y de una línea, que es exactamente el resultado
valioso del caso "no entra".

Y si P4 **no** se cumple —si el `<p>` de 37 resulta ser expresable como un
`claim` más y el centrado sale del reparto de alturas—, entonces H1 sobrevive a
su prueba más dura, y eso vale mucho más que si nadie hubiera predicho nada.

## 6 · Regla de decisión

| resultado | qué se hace |
|---|---|
| **C1 + C2 + C3** | Se declara probado **por construcción** que SECTOR ⊂ MONOGRÁFICO. El esquema del CMS pasa a **un content type** con SECTOR como caso degenerado. La fusión se planifica como tanda propia — **no se hace en caliente el mismo día**. |
| **C1 falla** (hacen falta campos) | Se documenta **cuáles** y por qué, en este mismo fichero. Los dos content types se quedan separados **con la frontera escrita**. No se añaden esos campos "de paso". |
| **C2 o C3 fallan con C1 cumplido** | El modelo expresa el dato pero los componentes no lo pintan igual: es **defecto de componente**, no de modelo. Va a `PENDIENTES-QA.md` y el experimento se repite tras corregirlo. |

En los tres casos el acta se escribe **aquí**, con fecha, y `HANDOFF.md` apunta a
ella.

## 7 · Después del experimento, pase lo que pase

**Correr `scripts/qa/enlaces.mjs`** con el clon servido y después de
`npm run build`.

En cuanto MONOGRÁFICO emita sus rutas, los enlaces a EDAR y a Petróleo y gas que
hoy son correctos **pasan a ser fallo automáticamente**, sin tocar la sonda: la
regla se deriva de `.next/prerender-manifest.json`. Hay que localizarlos en los
**tres** ficheros que pintan enlaces a sectores —`nav.ts`, `footer.ts` y
`home-carrusel-sectores.ts`— y volver a correrla hasta que salga limpia.

La sonda cubre las dos direcciones y está verificada en negativo. Sale con
código 0 limpia y 1 sucia.

---

# 8 · ACTA — corrido el 2026-07-30

> Medido a **1440×900** y **390×844** (device metrics por CDP), DPR 1, perfil
> limpio, Chrome del sistema por puppeteer-core, lazy→eager + scroll/settle.
> **Clon contra clon, mismo build, misma corrida.** Umbral **cero**.
>
> Sondas: `scripts/qa/dos-rutas.mjs` (árbol + `docH` + anclas de la cola) y
> `scripts/qa/exp-detalle.mjs` (la composición, módulo a módulo). Salida
> congelada en `scripts/qa/medidas/exp-{urbano,detalle}-{1440,390}.json`.
>
> El andamio (`/sectores/urbano-mono` + `src/lib/_andamio-urbano-mono.ts`) **se
> borró al terminar**, según §3.5. Lo que queda es esta acta y las sondas.

## 8.0 · La medida es válida: el cascarón no se movió

Antes de leer un solo Δ del cuerpo, el control que decide si la comparación
significa algo — la base de lectura del protocolo (`scripts/qa/README.md` §2):

| | @1440 | @390 |
|---|---|---|
| `h1.y` | 261.16 → 261.16 · **Δ0** | 189.39 → 189.39 · **Δ0** |
| fin del hero | 1463.13 → 1463.13 · **Δ0** | 2083.97 → 2083.97 · **Δ0** |
| sección del slider (bajo el cuerpo) | 401.53 → 401.53 · **Δ0** | 265.06 → 265.06 · **Δ0** |

El andamio monta `SECTOR_URBANO` sin tocar y cambia **solo** el cuerpo. Con el
`h1`, el cierre del hero y el slider a Δ0, **todo lo que se mide abajo es del
cuerpo y de nada más**.

## 8.1 · Veredicto — la regla de decisión del §6, aplicada tal cual

| criterio | umbral | resultado | |
|---|---|---|---|
| **C1** · ningún campo nuevo | 0 campos | **3 campos** | ❌ |
| **C2** · árbol sección→fila | Δ0 en los dos anchos | **2 de las 3 filas** del cuerpo fallan | ❌ |
| **C3** · `docH` | Δ0 en los dos anchos | **+12** @1440 · **−80** @390 | ❌ |

**C1 falla, y C1 manda sobre C2 y C3.** Fila del §6:

> *«**C1 falla** (hacen falta campos) → Se documenta **cuáles** y por qué, en
> este mismo fichero. Los dos content types se quedan separados **con la
> frontera escrita**. No se añaden esos campos "de paso".»*

Así queda: **H0 afirmada, H1 rechazada.** SECTOR **no** es un caso degenerado de
MONOGRÁFICO tal como está hoy el modelo del monográfico. El CMS lleva **dos**
content types, y ya no por falta de datos sino por una frontera de tres campos
medida al céntimo.

**No se toca nada más.** Ni se añaden los tres campos, ni se amplía `flujo`, ni
se sube el `pb` de fila a dato, ni se unifica nada: eso es precisamente lo que
el §6 prohíbe hacer "de paso", y lo que el pre-registro llamaba profecía
autocumplida.

## 8.2 · La frontera, con nombre y coste

Los tres campos que hubo que **anotar y no inventar** (§3.2), y lo que cuesta no
tenerlos:

### Campo 1 — `variante` en el módulo `ctaDescarga`

`MonoModulo.ctaDescarga` lleva `title · body · cta · image` y **nada más**:
`MonoCuerpo.tsx` cablea `variante: "fondo"` porque las dos páginas del
monográfico solo usan esa piel. Urbano usa la otra.

Medido en la caja del CTA (la reexpresión, contra Urbano):

| | @1440 | @390 |
|---|---|---|
| ¿lleva el `<img>` de la piel `"foto"`? | sí → **no** | sí → **no** |
| `background-image` de la caja | `none` → **la foto** | `none` → **la foto** |
| `padding-right` | 50 → **60** | 30 → **60** |
| ancho del título (el `padding-left: 36%` de `"fondo"`) | 866.39 → **714.5** (−151.89) | 275.39 → **215.39** (−60) |
| alto del título | 61.8 → **113.59** (+51.79) | 123.39 → 123.39 |
| **alto de la caja** | 328.39 → 340.78 · **+12.39** | 512.41 → 421.83 · **−90.58** |

**Ojo con el +12.39 de 1440**: parece un fleco y no lo es. Debajo hay una piel
entera distinta —el título pierde 151.89 de ancho y gana 51.79 de alto—, y el
total sale pequeño porque las dos cosas casi se compensan. Es el caso de
`CLAUDE.md` otra vez: *un Δ pequeño puede ser dos grandes anulándose*. A 390,
donde no se compensan, el mismo campo cuesta **−90.58**.

### Campo 2 — nivel semántico `<p>` en el módulo `claim`

En Urbano el claim es un **`<p>` de 37px**. `MonoModulo.claim` solo sabe emitir
`h2`/`h3`/`h4` (`MonoNivel = 2 | 3 | 4`): no hay valor que dé un párrafo. El
tamaño sí entra —`nivel: 2` es 37/37, exacto—, pero el elemento arrastra dos
cosas que **no** son cosméticas:

| | @1440 | @390 |
|---|---|---|
| etiqueta | `P` → **`H2`** | `P` → **`H2`** |
| `padding-bottom` (lo pone `Claim`) | 0 → **10px** | 0 → **10px** |
| `letter-spacing` (`globals.css` lo da a `h1…h6`, no a `p`) | `normal` → **−0.5px** | `normal` → **−0.5px** |
| alto del claim | 148 → 158 · **+10** | 296 → 306 · **+10** |

Sobre el `letter-spacing`: es real y está medido, pero en **esta** instancia no
cambió dónde envuelve (el claim sigue a 4 renglones a 1440 y a 8 a 390, mismo
ancho de caja 560.13 / 310.39). Con n = 1 no se puede decir más: **queda anotado
como diferencia medida, no como coste**. La negrita en línea ya enseñó que un
cambio de métrica de texto se cobra en otra instancia (−30.59 a 390, invisible a
1440).

### Campo 3 — alineación vertical de las columnas de una fila

El original centra el claim respecto a la foto con `margin: 121.031px 0` en la
columna; el clon de SECTOR lo hace con `md:items-center`. **`MonoFila` y
`MonoColumna` no tienen dónde pedirlo**: `MonoCuerpo` monta
`flex md:flex-row` sin `items-*`, y las 31 columnas medidas del monográfico
apilan desde arriba.

| | @1440 | @390 |
|---|---|---|
| offset del claim **dentro de su fila** | **121.03 → 0** | 0 → 0 (apilado) |
| alto de su columna | 148 → **390.08** (estira) | 296 → 306 |

**121.03 es exactamente el número que el §5 predijo** (`margin: 121.031px 0`).

## 8.3 · El hallazgo de método: la fila del claim salió **Δ0 a 1440**

Y no cuadraba: **cuadraba por accidente.**

| fila del claim | @1440 | @390 |
|---|---|---|
| alto | 418.88 → 418.88 · **Δ0** | 549.59 → 559.59 · **+10** |

A 1440 las dos columnas van en fila y la de la foto mide **390.08**, más que el
claim (148 o 158): la fila la fija la foto, así que **+10 de claim y 121.03 de
centrado perdido caben dentro sin que el alto se mueva**. A 390 apilan, y el +10
aparece entero.

Dos consecuencias, y las dos son de método:

1. **C2, tal como está redactado —"Δ0 en el alto de cada fila"—, habría dado
   esa fila por buena a 1440.** El criterio no es malo, es que el alto de fila
   **no puede ver** ni el centrado vertical ni un delta que quepa dentro de la
   columna hermana más alta. Lo que lo cazó fue medir **a los dos anchos**, que
   es exactamente lo que el pre-registro exigía, y luego bajar a la composición.
2. **Un Δ0 que no se reproduce entre anchos es sospechoso, no tranquilizador.**
   `CLAUDE.md` ya dice que *reproducirse entre anchos pesa más que el tamaño*, y
   lo aplicaba a los residuos: un Δ idéntico a 1440 y a 390 no puede ser ruido.
   Esta corrida añade el lado espejo: **un Δ0 en un ancho y un Δ≠0 en el otro no
   es "casi cuadra", es una medida tapada.** Ahí es donde hay que bajar a la
   composición. Y el centrado vertical no lo ve **ningún** alto: para eso está
   `exp-detalle.mjs`, que mide el claim **dentro** de su fila.

## 8.4 · Las cuatro predicciones, una a una

Registradas en el §5 el 2026-07-29 y no tocadas. **Las que fallan, primero.**

### ✗ P3 — `ctaDescarga` piel `"foto"` → predicción **FALLIDA**

Decía: *«entra, pero el monográfico no la ejercita (solo usa `"fondo"`) — el
campo `variante` ya existe en `SectorBloqueCtaDescarga` y viaja con el módulo»*.

**No viaja.** El razonamiento se apoyó en que el campo existe **en el modelo de
SECTOR**, y de ahí dedujo que el módulo del monográfico lo tendría porque
*reutiliza el mismo componente*. Reutiliza el componente, sí — y le pasa la piel
**cableada en el `.tsx`**. El campo no se perdió en el modelo: se perdió en el
paso del dato al componente, que es donde nadie miró.

Es **el mismo error de esta tanda una vez más, y en el sitio menos esperado**:
una propiedad que el editor elige (§`CtaDescarga`: *«Tiene dos pieles y el
editor elige»*) tratada como plantilla porque las dos instancias disponibles
coincidían. Con n = 2 páginas, las dos con `"fondo"`, el campo no se echa de
menos. Y **no lo cazaba ninguno de los dos tests** del discriminador: no varía
entre módulos de la misma página (falso negativo del test general) y no es una
propiedad de ritmo (fuera del alcance del test de Divi). O sea: estaba **sin
probar**, y la conclusión operativa que ahora dice `CLAUDE.md` es exactamente
que sin probar no se cablea.

Coste medido: **+12.39 @1440 · −90.58 @390**.

### ✓ P4 — `claimConFoto` → predicción **ACERTADA**, y en los dos ejes

Decía: *«ES EL QUE FALLA»*, por dos rasgos concretos — el claim es un `<p>` de
37px y no un heading; y va centrado verticalmente respecto a la foto, cuando
*«ninguna columna del monográfico está centrada verticalmente: las 31 medidas
apilan desde arriba»*.

**Las dos cosas, medidas:** `P` → `H2` (+10 de `padding-bottom`, y el
`letter-spacing` de heading que el `<p>` no lleva) y el offset en su fila
**121.03 → 0**, que es el `margin: 121.031px 0` que la predicción citó de
memoria y que la sonda confirmó al céntimo.

El §5 decía que si P4 se cumplía, el resultado sería *«la frontera está en la
alineación vertical de columna y en el nivel semántico del claim»* — «una
frontera concreta, medida y de una línea». **Es literalmente el resultado**, más
un tercer campo que la predicción no vio (P3).

### ✓ P1 — `beneficiosAplicaciones` → predicción **ACERTADA**

Decía: *«entra sin campos nuevos»*. Entra, y con Δ0 **en los dos anchos**:

| fila de Beneficios \| Aplicaciones | @1440 | @390 |
|---|---|---|
| alto | 566.98 → 566.98 · **Δ0** | 1356.56 → 1356.56 · **Δ0** |
| ritmo `mt/pt/pb` | `0/28.7969/28.7969` → idéntico | `0/30/30` → idéntico |

Y con campos que **ya existían**, sin excepción: `anchoPct: 80` (el `w-[80%]`
que `BeneficiosAplicaciones` llevaba cableado en el `<h3>`), `ritmo: {mb: 0}` en
el módulo de la lista por ser el último de su columna, `punteado: true` en las
dos columnas y el `mbMovil` por defecto (30 la primera, 0 la última).

Vale la pena decir qué significa: **el bloque más "de SECTOR" que hay —dos
columnas de titular + lista— es un caso degenerado del árbol del monográfico sin
tocar nada.** El fallo de H1 no viene de que los modelos sean ajenos.

### ✓ P2 — `flujo: seccionRasa` / `filaPegada` → predicción **ACERTADA**

Decía: *«entra: son `{mt:0,pt:0,pb:0}` y `{pt:0}`»*, porque el enum de 4 valores
es una proyección de los overrides de ritmo.

Es exactamente eso, medido:

| | Urbano (enum `flujo`) | reexpresión (overrides) | @1440 | @390 |
|---|---|---|---|---|
| sección del CTA | `seccionRasa` | `{mt:0, pt:0, pb:0}` | `0/0/0` → **idéntico** | `0/0/0` → **idéntico** |
| sección de listas+claim | `seccion` | `{mt:-14, pb:14}` | `-14/57.5938/14` → **idéntico** | `-14/50/14` → **idéntico** |
| fila del claim | `filaPegada` | `{pt: 0}` | `0/0/28.7969` → **idéntico** | `0/0/30` → **idéntico** |

**Los cuatro valores de `SectorBlockFlujo` son azúcar sobre `MonoRitmo`.** Es el
hallazgo positivo más limpio de la corrida y el que hace que la fusión siga
siendo pensable: el desacuerdo entre los dos modelos **no está en el ritmo**,
que era el sitio donde se temía.

## 8.5 · Qué queda dicho para el día de la fusión

No es una decisión de hoy —el §6 la manda planificar como tanda propia y esta
sesión no la abre—, pero el experimento deja la lista escrita:

- **El ritmo no es el problema** (P2): `flujo` ⊂ `MonoRitmo`, verificado.
- **La retícula y las listas tampoco** (P1): Δ0 en los dos anchos.
- **La frontera son tres campos**, y ninguno es de ritmo: una **piel** de módulo
  (`variante`), un **nivel semántico** (`p` frente a `h2/h3/h4`) y una
  **alineación de fila** (centrado vertical).
- Los tres son del mismo tipo que las ocho de la tanda anterior: **decisiones de
  quien editó la página**, que solo se ven cuando llega una instancia que las
  ejercita. Urbano fue esa instancia.
- Y el aviso, que es lo único que este experimento demuestra sobre el método de
  fusionar: **la reexpresión hay que medirla a los dos anchos y por composición.
  Con solo 1440 y solo alturas de fila, dos de los tres campos habrían pasado
  desapercibidos** (el nivel semántico salía Δ0; el centrado no lo ve ningún
  alto).

## 8.6 · El árbol vuelve a estar como estaba

Cerrado según §3.5 y §7, con el andamio borrado y el build rehecho:

| comprobación | resultado |
|---|---|
| `/sectores/urbano-mono` y `src/lib/_andamio-urbano-mono.ts` | **borrados**; el `prerender-manifest` vuelve a emitir **11** rutas |
| `clon-base.mjs 1440 --cmp exp-antes-1440.json` | **11 páginas, 0 regresiones** — umbral cero |
| `clon-base.mjs 390 --cmp exp-antes-390.json` | **11 páginas, 0 regresiones** — umbral cero |
| `enlaces.mjs` | **limpio en las dos direcciones** |
| `npm run check` | lint + typecheck + build en verde |
