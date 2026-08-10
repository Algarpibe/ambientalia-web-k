# SPEC · el CUERPO de `articulos-kb` (capa propia, del builder)

> Medido el **2026-08-10** contra `kunakair.com` **vivo**, 6/6 instancias, a
> **1440** y **390**. Congelado en `medidas/kb-spec-{1440,390}.json` y
> clasificado en `medidas/kb-tests.json`. Método, régimen y las cuatro
> correcciones al clasificador: `../MEDICION.md`.
>
> **Lectura de BUILDER** (§régimen): valen los dos tests tal cual. Los
> porcentajes de Divi se resuelven contra **911.75** (la columna de contenido),
> no contra 1440 — ver `cascaron.spec.md` §1.

## 0 · Veredicto en una línea

> **El cuerpo NO es plano.** Una sección propia por artículo (6/6) con **45
> filas** — 6 ocultas y **39 visibles** — que se reparten en **1, 2 o 3
> columnas** con **cuatro repartos distintos**, y el reparto está **probado como
> campo** por el test B.

Esto es el hueco (a) que paró el PASO 4: el `cuerpo` de la colección es plano y
el original tiene esta forma.

## 1 · La retícula

### 1.1 · Recuento, y cómo reconcilia con el acta anterior

| | filas | columnas |
|---|---|---|
| **totales** | **45** | 60 |
| ocultas (`et_pb_row_0 d-none`, 1 por artículo) | **6** | 6 (`4_4`) |
| **visibles** | **39** | **54** |

Repartos de las 39 visibles:

| reparto | filas | columnas que aporta |
|---|---|---|
| `4_4` | **25** | 25 × `4_4` |
| `1_2 + 1_2` | **7** | 14 × `1_2` |
| `1_3 + 2_3` | **6** | 6 × `1_3` + 6 × `2_3` |
| `1_3 + 1_3 + 1_3` | **1** | 3 × `1_3` |

> **Reconcilia con el `4_4`×31 · `1_2`×14 · `1_3`×9 · `2_3`×6 del acta de la
> 43.ª**: `25 + 6 ocultas = 31`. El recuento anterior contaba las columnas de
> las filas ocultas; éste las separa, que es lo que hace falta para construir.

Forma por artículo (`·` = fila oculta, el número es cuántas columnas):

| artículo | filas |
|---|---|
| `como-garantiza-kunak-la-mejor-precision` | `· 2 1 1 2 1 1` |
| `evidencias-de-funcionamiento` | `· 2 1 2 2 2 1 2` |
| `por-que-kunak-air-es-la-mejor-estacion…` | `· 2 1 1` |
| `que-es-kunak-air` | `· 2 1 1 1 1 1` |
| `que-puedes-hacer-con-kunak-air` | `· 2 1 1 3 1` |
| `que-es-kunak-air-cloud` | `· 2 1 1 1 1 1 1 1 2 2 1 1` |

### 1.2 · Anchos resultantes

| tipo | @1440 | @390 |
|---|---|---|
| `4_4` | **911.75** | 335.39 |
| `1_2` | **430.797** | 335.39 (apila) |
| `2_3` | **591.109** | 335.39 |
| `1_3` | **270.484** | 335.39 |
| canal entre columnas (`margin-right` de la no-última) | **50.1406** | 0 |
| `margin-bottom` al apilar | 0 | **30** |

Las dos últimas son **regla posicional de la retícula, no campos** — la
variación está completamente explicada por la posición (`../MEDICION.md` §3.2).

### 1.3 · El invariante de forma: la fila 1 es siempre la misma

**6/6**, y con la misma composición:

```
fila 1 · reparto 1_2 + 1_2 · pt 18.2344 (default) · pb 0 · mt 0
  ├─ col 1_2 (430.797)
  │    ├─ text · <h2> 45/45 w700 · mb 25.0625 (default)      ← EL TÍTULO VISIBLE
  │    └─ text · <p> 18/30.6                                 ← entradilla (1..2 módulos)
  └─ col 1_2 (430.797)
       └─ image · 366.17 × 366.17 (cuadrada) · mb 0 · 85 % de su columna
```

Dos cosas que hay que escribir porque son fáciles de mejorar sin querer:

1. **el título visible es un `h2`, no un `h1`** — el `h1` de la página dice
   `Kunak Help Center` y está oculto (`cascaron.spec.md` §3);
2. **la imagen es cuadrada y ocupa el 85 % de su columna**, no el 100 %. Ese
   85 % está **medido como campo** por el test A en razón, no supuesto.

## 2 · El ritmo, fila a fila

`pt` = `padding-top`, etc. `a→b` = cambia entre 1440 y 390; un solo valor =
igual a los dos anchos.

| artículo | fila | reparto | pt | pb | mt | mb |
|---|---|---|---|---|---|---|
| precision | 1 | `1_2+1_2` | `18.2344→30` | `0` | `0` | `0` |
| | 2 | `4_4` | `18.2344→30` | `18.2344→30` | `0` | `0` |
| | 3 | `4_4` | `18.2344→30` | `0` | `0` | `0` |
| | 4 | `1_3+2_3` | `18.2344→30` | `0` | **`18.2344→6.70312`** | `0` |
| | 5 | `4_4` | `18.2344→30` | `18.2344→30` | `0` | `0` |
| | 6 | `4_4` | `18.2344→30` | `18.2344→30` | **`25`** | `0` |
| evidencias | 2 | `4_4` | `18.2344→30` | **`1`** | **`-2`** | `0` |
| | 3 | `1_3+2_3` | `18.2344→30` | `0` | **`45.5781→16.7656`** | `0` |
| | 6 | `4_4` | `18.2344→30` | `18.2344→30` | **`25`** | `0` |
| | 7 | `1_2+1_2` | `18.2344→30` | `18.2344→30` | **`25`** | `0` |
| por-que | 3 | `4_4` | **`7`** | `0` | **`25`** | `0` |
| que-es-kunak-air | 2 · 4 | `4_4` | **`20`** | **`7.28125→2.67188`** | `0` | `0` |
| que-puedes | 2 | `4_4` | **`20`** | **`7.28125→2.67188`** | `0` | `0` |
| | 4 | `1_3×3` | **`17`** | `18.2344→30` | `0` | `0` |
| cloud | 2 | `4_4` | `18.2344→30` | **`14`** | `0` | `0` |
| | 3 · 8 · 11 · 12 | `4_4` | `18.2344→30` / **`19`** | **`17`** | varios | `0` / **`-21`** |
| | 4·5·6·7 | `4_4` | **`19`** | `18.2344→30` | `0` | `0` |
| | 9 · 10 | `1_3+2_3` | `18.2344→30` | `0` | **`18.2344→6.70312`** | `0` |

(la tabla completa, fila a fila y sin resumir, está en `medidas/kb-spec-*.json`)

### 2.1 · El discriminador fino: default de Divi vs. porcentaje escrito

Los dos se ven igual a 1440 y **se separan a 390**, y esto es medida, no teoría:

> **El default de Divi cambia de UNIDAD al apilar: `2 %` en escritorio y un
> `30px` PLANO en móvil. Un porcentaje que escribió el editor sigue siendo
> porcentaje en los dos.**

| par medido | razón @1440 | razón @390 | qué es |
|---|---|---|---|
| `18.2344 → 30` | 2 % | *plano* | **default** de fila (`pt`/`pb`) |
| `18.2344 → 6.70312` | 2 % | **2 %** | **campo**: el editor escribió `2 %` |
| `45.5781 → 16.7656` | 5 % | **5 %** | **campo**: `5 %` |
| `7.28125 → 2.67188` | 0.8 % | **0.8 %** | **campo**: `0.8 %` |
| `3.64062 → 1.32812` | 0.4 % | **0.4 %** | **campo**: `0.4 %` |
| `7` · `14` · `17` · `19` · `20` · `25` · `-2` · `-21` | — | — | **campo**: px absolutos (test A) |

**Sin el segundo ancho, `18.2344 → 30` y `18.2344 → 6.70312` son el mismo número
a 1440.** Es el argumento operativo de *«siempre dos anchos»* en su forma más
barata: aquí decide si una fila lleva campo o no.

### 2.2 · Y el ritmo NO viaja en `style=`

**0 estilos en línea** en secciones, filas y módulos — las 45 filas y los 149
módulos, a los dos anchos.

> En SECTOR y MONOGRÁFICO los valores del editor viajaban como `style=` en el
> nodo, y el extractor los leía de ahí. **Aquí no hay ninguno**: Divi los compiló
> a `et-core-unified-…css` con una clase por módulo. El extractor de este
> arquetipo **tiene que leer `getComputedStyle`, no el atributo** — y como el CSS
> no está capturado (§0 de `../MEDICION.md`), **eso significa navegador y sitio
> vivo**, no un parseo del HTML congelado.

Es la consecuencia práctica más cara del PASO 0 y hay que decidirla antes de
escribir el extractor.

## 3 · La sección propia

Una por artículo, 6/6, sin clases de editor más allá de `et_pb_section_0
et_section_regular`.

| propiedad | @1440 | @390 | veredicto |
|---|---|---|---|
| `padding-top` | **0** | **0** | **CAMPO uniforme** — el default es 4 %/50px, así que el 0 lo escribió alguien. El test B no puede confirmarlo: hay **una** sección por página |
| `padding-bottom` | **36.4688** | **50** | **PLANTILLA** — es el default al 4 % de 911.75 |
| `margin-top` · `margin-bottom` | 0 | 0 | **SIN EVIDENCIA** |

> ⚠ **El test B no puede pronunciarse a nivel de sección en este arquetipo**, y
> su silencio **no es «no varía»**: es que no hay hermanos. Se declara.

## 4 · Lo que este spec obliga en el modelo

No decide el esquema —eso es `ESQUEMA-CMS.md`— pero lo acota con medida:

1. **`cuerpo` no puede ser una lista plana de módulos.** Necesita el nivel FILA
   con su `reparto` (4 valores medidos) y el reparto de módulos por columna;
2. **la fila lleva campos de ritmo**: `pt`, `pb`, `mt`, `mb`, cada uno con su
   default explícito (`pt`/`pb` = `2 %`/`30px`) y **omitido en el dato cuando
   coincide**, que es la convención del ESQUEMA;
3. **el valor de un campo de ritmo no es un número: es un número CON UNIDAD** —
   `19px` y `2 %` no son intercambiables, y a 1440 se ven igual. El campo tiene
   que poder expresar las dos;
4. **el módulo lleva `anchoPct`** (85 · 50 · 40 · 100 %) y `mb` (9 valores);
5. **la fila oculta se emite**: 6 de las 45, con su `<h1>Kunak Help Center</h1>`.
   No es contenido del artículo — es plantilla, y así hay que modelarla;
6. **`seccion.paddingTop = 0`** se emite como valor de plantilla **declarando**
   que el test B no lo pudo confirmar.
