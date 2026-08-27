# PRE-REGISTRO · 117.ª · `author` ENTERO

**Fecha:** 2026-08-27 · **Escalón de CONSTRUCCIÓN** (toca `packages/cms-config`,
`src/`, migración, seed, build, y levanta Chrome para adjudicar).

Se escribe **antes** de tocar nada. Las tres apuestas de la 116.ª salieron
falsas y eso fue informativo; el formato se mantiene: **apuesta · mecanismo ·
premisa · refutación escrita**.

---

## 0 · LAS CIFRAS DEL ENCARGO, DERIVADAS ANTES DE USARSE (§regla 9)

El encargo pasa cifras. Se derivan, **también las que me pasan**. Instrumento:
`ficha-autor-117.mjs`, congelado en `scripts/qa/medidas/ficha-autor-117.json`.

| lo que el encargo dice | derivado | ¿casa? |
|---|---|---|
| ficha en **152 de 152** entradas | **152 de 152** | ✅ |
| `ficha-autor-revisor` **no** está en `apps/web/src` | **0** de **155** ficheros de código | ✅ |
| **2 de 152** separan «Revisado y aprobado» de «Escrito por» | **2 de 152** | ✅ |
| clon sirve **1 absoluto, 0 locales** a `/author/` | **1 absoluto · 0 locales** | ✅ |
| `author` enlazado desde **0 de 35 formas** de listado | 0 de 35 (`mesa-f34-115.log:105`) | ✅ |
| `author`: **7 de 7** ejes propios varían | 7 de 7 (`separadora-author-116.log` §2) | ✅ |
| campos opcionales ejercitados **2 de 6** | 2 de 6 (`admin`, `mar_ramirez`) | ✅ |
| los 2 documentos sin `<style>` son los 2 sin bio | ⚠ **matiz** — ver abajo | ⚠ |
| Docker: **130 tablas** | **134** | ❌ |
| línea base: **382 rutas** | **413** (`clon-base-1440-t104-despues4.json`) | ❌ |

**Las dos que NO casan son la §regla 9 en directo**: `130` y `382` son números
**recordados** que envejecieron *contra* el repo en silencio. Ninguno bloquea
—la DB contesta y la base existe— pero **la línea base de esta tanda es 413,
citada con su fichero**, no 382.

**Y el matiz del `<style>`, que no es cosmético:** los 2 documentos **sí**
tienen `<style>` (41 206 B, 7 bloques). Lo que les falta es **un bloque**,
`divi-dynamic-critical-inline-css`, de **161 728 B**. Escrito como *«los dos
documentos sin `<style>`»* se lee como que no traen estilo — y decidiría mal el
ESCALÓN 3.

**Cardinal con su unidad:** los **155** ficheros de código son
`apps/web/src/**` con extensión `.ts|.tsx|.js|.jsx|.mjs`. El `228` de la 116.ª
y el `239` del encargo cuentan **otra unidad**; no se concilian con una nota al
pie, se escribe cuál es cuál (§*cada denominador se escribe CON SU UNIDAD*).

---

## 1 · LO QUE LA DERIVACIÓN ENCONTRÓ Y EL ENCARGO NO DICE

El encargo decide *«la relación es 1:N CON PAPEL — no cabe en un campo
simple»*. **La conclusión se sostiene; la razón medida es otra y más fuerte.**

**El papel no es binario: hay 8 proemios servidos**, y el reparto no es el de
un enum de dos valores.

| hueco | proemio (nombre sustituido) | n |
|---|---|---|
| `revisor` | Escrito por el ‹NOMBRE› | 141 |
| `revisor` | Escrito por la Directora Científica (CSO) ‹NOMBRE› | 3 |
| `revisor` | Escrito por el Director General y cofundador ‹NOMBRE› | 3 |
| `revisor` | Escrito por la Jefa de producto ‹NOMBRE› | 2 |
| `autor` | Escrito por ‹NOMBRE› | 2 |
| `revisor` | Revisado y aprobado por la Jefa de producto ‹NOMBRE› | 1 |
| `revisor` | Revisado y aprobado por la Directora Científica (CSO) ‹NOMBRE› | 1 |
| `revisor` | Escrito por ‹NOMBRE› | 1 |

**Y la separadora se midió en vez de elegirse** (§*un modelo se elige por lo
que lo SEPARA, no por lo que acierta*):

| modelo | predice | separadoras | acierto |
|---|---|---|---|
| proemio = f(autor, papel) | un enum basta | **1** | falla |
| proemio = f(autor, papel, **hueco**) | un enum + el hueco | **0** | 8 de 8 triples |

La única separadora es `kunak` **escrito**, con «Escrito por el ‹NOMBRE›» y
«Escrito por ‹NOMBRE›» — y las 2 entradas del segundo son **exactamente las 2
de dos papeles**, o sea que el eje que faltaba es el **hueco estructural**
(`revisor` lleva foto · `autor` no), no el autor.

> ⚠ **Y con eso NO se cierra, porque el tercer eje se apoya en UNA instancia.**
> §*un discriminador hallado en una sola instancia tampoco es un
> discriminador*. Lo probado es que **(autor, papel) NO basta**; que el triple
> sea *la* función **no** lo está.

**Decisión de esquema, y su dirección:** la relación **guarda el texto** con su
defecto derivado, **omitido cuando coincide**. Si la función es correcta el dato
queda vacío en las 152 y no cuesta nada; si es falsa, el original se replica
igual. El defecto se pone **en la dirección que grita** (§sondas 6): derivarlo
mal serviría «Escrito por el» donde el original dice «Escrito por» en 2
páginas, y **ninguna guarda del repo mira ese texto**.

**Cardinal de la ficha, publicado y no supuesto (§C4):** hay **2 fichas por
fichero** y son **idénticas en 152 de 152**. El modelo tiene **UNA** ficha
repetida, no dos emplazamientos.

**Control §regla 40, el que la 116.ª acaba de pagar tres veces:** dentro del
bloque extraído hay **0 tarjetas · 0 módulos de Divi · 0 paginadores**. Si el
extractor se hubiera comido la página, habría encontrado «Escrito por» en
cualquier sitio y **refutado siempre**.

---

## 2 · LAS APUESTAS, CON SU ANCHO Y SU REFUTACIÓN

§*una predicción sobre una propiedad tapada se escribe CON SU ANCHO* — el
contenedor que tapa **no es el mismo a 1440 y a 390**, así que una predicción
sin ancho son dos predicciones y el ancho decide cuál contestas.

### P1 · RUTAS — sin ancho, porque no depende del ancho

> **Pintar la ficha NO añade ni quita una ruta.** `author` es COLECCIÓN **sin
> archivo**: no se emite `/author/*`.

- **Mecanismo:** la ficha vive en la plantilla de la entrada; la colección
  alimenta un campo, no una ruta.
- **Premisa:** la línea base son **413 rutas** (`clon-base-1440-t104-despues4.json`).
  ⚠ **SOSPECHOSA POR CONSTRUCCIÓN**: es de la **t104** y vamos por la **117**.
  Se re-deriva el conteo **antes** de comparar; si el build de HOY ya no da 413
  **antes** de mi cambio, P1 queda **sin evaluar** contra esa base, no refutada.
- **Refutación:** diferencia simétrica ≠ `0 y 0`. Y se lee **con sus dos lados
  nombrados**, nunca por el neto (§*un cardinal absorbe la membresía*).

### P2 · QUÉ SE MUEVE — **a 390**

> **A 390 se mueven las 152 entradas de blog y NO se mueve ninguna de las 261
> restantes.** `152 + 261 = 413`.

- **Mecanismo:** a 390 las columnas **apilan**; no hay columna hermana donde el
  alto de la ficha se absorba, así que todo lo que la ficha añade sale en `docH`.
- **Refutación:** una de las 261 que se mueva, **o** una de las 152 que no.
  Se publica **la diferencia simétrica de los dos conjuntos**, con sus dos
  lados, no el recuento.

### P3 · QUÉ SE MUEVE — **a 1440**, y aquí apuesto a que se mueven MENOS

> **A 1440 se moverán MENOS de 152**, y **cada una que no se mueva será una
> entrada cuya columna de contenido es más corta que su hermana.**

- **Mecanismo, derivado y no supuesto:** la ficha vive en
  `et_pb_column_3_4` de la fila `single-contenido`, y el documento trae **14
  nodos `et_pb_widget`** en una hermana `1_4`. A 1440 la fila mide **el máximo
  de las dos columnas**, así que donde la hermana sea más alta el alto de la
  ficha **se absorbe sin dejar rastro** — que es §*la causa común* y es
  exactamente lo que le pasó al pre-registro de las «52 rutas»: **1 de 52** a
  1440 y **52 de 52** a 390.
- **Refutación:** que a 1440 se muevan **las 152**. Eso refutaría el mecanismo
  de absorción para este arquetipo, y sería un hallazgo — no un susto.
- ⚠ **Y la lectura que NO se dará:** si a 1440 se mueven pocas, eso **no es**
  «el arreglo casi no hizo nada». Es la firma esperada: las demás no podían
  moverse. El veredicto de fidelidad lo da **390**.

### P4 · LA REVERSA, antes de que entre el dato (§regla 30)

> **La migración revierte limpia, y el censo TABLA A TABLA vuelve idéntico
> salvo la fila de la propia migración.**

- **Mecanismo:** sólo hay ventana para preguntarlo **antes de sembrar**;
  después lo único medible es que falla, y eso ya no distingue una migración
  bien escrita de una mal escrita.
- **Premisa derivada hoy:** **134** tablas en `public`.
- **Refutación:** cualquier tabla que difiera. Y se comprueba **tabla a tabla**,
  no con el total: `3333 → 3333` es exacto con dos tablas compensándose.

### P5 · EL ROUND-TRIP DEL PROEMIO

> **Tras sembrar, las 152 fichas se sirven con su proemio AL CARÁCTER**, las 2
> de dos papeles incluidas.

- **Refutación:** una sola entrada cuyo proemio servido difiera del original.
- **Y el control que lo hace valer:** si el comparador diera 0 diferencias
  **porque no mira el proemio**, sería un verde de alcance. El caso «sabe
  gritar» del ESCALÓN 1 tiene que inyectar un Δ conocido **en ese texto** y
  cazarlo **nombrando sus dos lados**.

---

## 3 · LO QUE ESTA TANDA DECLARA SIN PROBAR

- la **geometría computada** del régimen `--` (**82 instancias**): necesita las
  hojas enlazadas, o sea RED. Este corpus **no puede** contestarlo (§regla 32);
- el **mecanismo** del bloque de 161 728 B presente en 4 de 6 archivos de autor:
  fichado con su cardinal, **sin explicar**;
- que el triple `(autor, papel, hueco)` sea **la** función del proemio: **1**
  instancia separadora. Por eso el texto se guarda en vez de derivarse.
