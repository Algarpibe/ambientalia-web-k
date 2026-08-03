# DECISIÓN · el ancho de módulo fuera de MONOGRÁFICO — **MIXTO**, y los 10 se PARTEN

> **2026-08-03.** Evalúa `PRE-REGISTRO-ANCHO-MODULO.md` (commit `61a9e78`,
> anterior a la sonda y a la medición). Evidencia:
> `medidas/clase-rango-{1440,390}.json` (commit `226c30f`, anterior a este acta).
> Sonda: `clase-rango`, con su test en negativo entero en verde (`02d806d`).

---

## 0 · El veredicto

> **MIXTO — y no era la rama cómoda.** El ancho de **MÓDULO** en **SECTOR** es
> **CAMPO**: `80 · 90 · 100`, idénticos a 1440 y a 390, con varianza
> intra-página **y** entre instancias. En **grupo C** no hay nada que sea campo,
> porque **no hay capa de builder que medir**.
>
> **De los 10 bloqueadores, NUEVE se abren y UNO se convierte en trabajo.** Y
> aparece **uno nuevo que ningún inventario tenía**, con su número: `MapaProyectos`,
> **+123.84 px** a 1440 y **+33.55** a 390, solo en Industria.

---

## 1 · Lo medido, por nivel y familia

24/24 páginas por ancho · 0 selectores muertos · **control con varianza 2/2**.

| nivel | **SECTOR** (4) | **CASO** (4) | **FAQ** (2) | CONTROL · MONO (2) |
|---|---|---|---|---|
| **fila** | `86` ×10–12 + `95` ×1 | `86` ×1 | **—** | `86` + `95` |
| **columna** | `29.67 · 47.25 · 64.83 · 100` | `100` ×1 | **—** | `29.67 · 36.7 · 47.25 · 57.8 · 64.83 · 100` |
| **módulo** | **`80 · 90 · 100`** | `100` ×1 | **—** | **`70 · 80 · 90 · 100`** |

### 1.1 · La discriminación que salvó el veredicto: `%` que se mueve vs `px` que no

La sonda cantó, en crudo, **5–6 valores distintos** de módulo por página de
SECTOR. Leído así, «varía mucho». **Y la mayoría no es varianza de módulo:**

| valor | qué es realmente |
|---|---|
| `4.84` · `10.25` · `16.33` (@1440) · `17.89` (@390) | **`w = 60 px` EXACTOS y firma VACÍA** — separadores. Un ancho fijo leído contra columnas de anchos distintos: **UNA decisión, no cuatro** |
| **`80` · `90` · `100`** | **el mismo número a 1440 y a 390** con px distintos (`468.09`/`268.31`, `1114.55`/`301.84`): eso es un **porcentaje escrito por una persona** |

> **Es el test A al revés, y por eso vale aquí:** el separador tiene **px iguales
> a los dos anchos** —la huella que en régimen de builder significaría «campo»—
> y **no lo es**; el ancho de módulo tiene **% igual y px distinto** —la huella
> que el test A leería como «plantilla»— y **sí lo es**. Exactamente la
> inversión que `CLAUDE.md` declara para esta propiedad, **medida**.

La sonda pudo separarlas porque congela **`w` y `pct` juntos**. Con solo el `pct`
los separadores habrían inflado el recuento y con solo `w` se habría perdido el
campo.

### 1.2 · Y el discriminador que decide: los DOS coinciden

| | ¿varía? |
|---|---|
| **intra-página** (test B, régimen builder) | **SÍ** — Industria trae `80`, `90` y `100` en la misma página |
| **entre instancias** (el de régimen plantillado) | **SÍ** — el `90` existe **solo en Industria** de los 4 sectores |
| **a los dos anchos** | **SÍ** — `80` y `90` idénticos a 1440 y a 390 |

**Los dos tests dan lo mismo, así que el veredicto no depende de qué régimen se
le suponga a SECTOR.** Es la lectura más robusta que podía salir.

---

## 2 · Grupo C: no es «no varía», es que **no hay capa de builder**

Y esto no se dedujo, se leyó del `<body>` y del recuento de secciones propias:

| | `<body>` | secciones **propias** | filas propias |
|---|---|---|---|
| **SECTOR** | `page-template-sectors` | **7** | 10–13 |
| **CASO** | `case-studies-template-default` · `single-case-studies` | **1** | **1** |
| **FAQ** | `faqs-template-default` · **`et-tb-has-template`** | **0** | **0** |

> **El `0` de FAQ NO es un cero de instrumento**, y se puede probar sin salir de
> la corrida: **el mismo código, en la misma pasada, devolvió 7 secciones en
> SECTOR y 8 en el control**. El selector está vivo (censo: 0 muertos). Lo que
> hay es **ausencia del fenómeno**, no ausencia de medida — la distinción que
> `CLAUDE.md` §sondas regla 4 exige hacer explícita.

**Consecuencia:** en grupo C **nadie compone módulos**, así que no puede haber un
ancho de módulo elegido por un editor. Cero varianza intra-página **y** entre las
4 y 2 instancias, a los dos anchos ⇒ **PLANTILLA**, por el discriminador que
corresponde a su régimen.

---

## 3 · PASO 4 · Qué pasa con los 10 — **se PARTEN 9/1**

Decidido **por celda `nivel × familia`**, que es lo que el pre-registro §4 MIXTO
mandaba, y **no** por mayoría.

| bloqueador | lo que cablea | **nivel** | veredicto | ¿bloquea F2-1? |
|---|---|---|---|---|
| `SectorBody` | `w-[86%]` | fila | plantilla | ✅ **SE ABRE** |
| `SectorHero` | `w-[86%]` · `w-[47.25%]` | fila · columna | plantilla · rejilla | ✅ **SE ABRE** |
| `ClaimConFoto` | `w-[47.25%]` | columna | rejilla Divi | ✅ **SE ABRE** |
| `ListaSimple2Col` | `w-[47.25%]` | columna | rejilla Divi | ✅ **SE ABRE** |
| `CabeceraSector` | `w-[86%]` | fila | plantilla | ✅ **SE ABRE** |
| `CasoPagina` | `w-[86%]` `w-[80%]` · `w-[47%]` | fila · columna | plantilla | ✅ **SE ABRE** |
| `CasoDetalles` | `w-[80%]` · `w-[32%]` `w-[50.5%]` | fila · columna | plantilla | ✅ **SE ABRE** |
| `CasoGaleria` | `w-[80%]` | fila | plantilla | ✅ **SE ABRE** |
| `FaqSidebar` | `w-[25%]` | columna | plantilla | ✅ **SE ABRE** |
| **`BeneficiosAplicaciones`** | `w-[47.25%]` · **`w-[80%]`** | columna · **MÓDULO** | rejilla · **CAMPO** | ❌ **TRABAJO** |

> **9 se abren. 1 se convierte en trabajo.** Y el que queda **está cableado con
> el valor correcto** (`80 %` en las 4 instancias medidas): no es un defecto de
> píxel hoy, es un **campo que falta en el esquema**.

### 3.1 · El que no estaba en la lista, y es el que cuesta

El inventario derivado buscaba *«medida absoluta cableada»*. **Un módulo sin
clase de ancho no cablea nada y por eso no salía — y es justo el defecto**:

| | original | clon | Δ |
|---|---|---|---|
| **`MapaProyectos`** @1440 | `90 %` · 1114.55 | `100 %` · 1238.39 | **+123.84** |
| **`MapaProyectos`** @390 | `90 %` · 301.84 | `100 %` · 335.39 | **+33.55** |

- **Medido en los DOS lados y en los DOS anchos** — no es ruido: son dos
  maquetaciones distintas.
- **Existe solo en Industria** de los 4 sectores vivos. *El detector de un ancho
  mal no fue otro ancho: fue **otra instancia**.*
- **Y MONOGRÁFICO ya lo modela**: `monografico.ts` le da `anchoPct: 90` al mismo
  módulo. SECTOR no tiene el campo, así que lo pierde.
- ⚠ **El emparejador no lo casó** por **un carácter** de firma
  (`…mundoA` / `…mundo`), así que el eje de fidelidad **no lo habría cantado**
  ni con veredicto en ese nivel. Salió de leer el lado del original. Ficha
  abierta en `PENDIENTES-QA.md`.

---

## 4 · Lo que esto le hace a F2-1

> **La precondición NO queda limpia: queda ACOTADA y barata.**

| | antes | ahora |
|---|---|---|
| ítems que bloquean | **10, «sin probar»** | **1, probado — más 1 nuevo** |
| qué hay que hacer | desconocido | **añadir `anchoPct` al módulo de SECTOR**, con precedente |
| grupo C | bloqueaba | **no bloquea: no tiene capa de builder** |

**El cambio de esquema es pequeño y tiene precedente directo:**
`MonoModuloBase.anchoPct` ya existe y ya está medido. Registrado en
`ESQUEMA-CMS.md` en esta misma tanda.

---

## 5 · Lo que esta medición NO contesta — con su etiqueta

1. **El nivel de módulo no tiene veredicto de FIDELIDAD ni de RANGO en el lado
   del clon.** El clon solo marca la FILA (`data-fila`); en columna y módulo su
   identidad es un heurístico que sobre-casa (**66 «columnas» contra 27**, **102
   «módulos» contra 66**). La sonda lo cuenta y lo grita: **26 celdas SIN
   VEREDICTO**. Se cierra con `data-col`/`data-mod`, y **hasta entonces los dos
   ejes están CIEGOS ahí, no limpios.**
   ⚠ Los `Δ0` de la corrida son **del nivel de FILA**, 65 pares, y solo de ahí.
2. **Las instancias sin poblar.** Puertos y Minería fuera; 53 de 57 casos fuera.
   «Plantilla» lo es **sobre las instancias medidas**, con su n al lado.
3. **Si `80 %` es el valor correcto en instancias no medidas.** Está cableado y
   coincide en 4/4; con un quinto sector podría no coincidir — que es
   exactamente por qué se modela como campo.

---

## 6 · ESCALÓN DECLARADO — **no se disparó**

| condición | ¿se cumple? |
|---|---|
| (a) ninguna medida de esta tanda la arbitra | **NO** — la arbitró: `80·90·100`, dos discriminadores coincidentes, dos anchos |
| (b) cara de deshacer | sí |
| (c) sin precedente aplicable | **NO** — `MonoModuloBase.anchoPct` es precedente directo, medido y ya documentado |

**Dos de tres fallan.** No es frontera aplazada: es una decisión con evidencia,
y se toma aquí.

---

*Decidido el 2026-08-03, contra el pre-registro `61a9e78` y las medidas `226c30f`.*
