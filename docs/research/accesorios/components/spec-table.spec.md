# spec-table.spec.md — Tabla de especificaciones (`SpecTable`)

> Medido 2026-07-27 a **1440×900** y **390×844 real**. Son `<table>` HTML plano:
> el plugin `divi-modules-table-maker` está cargado pero **no se usa**
> (`[class*=table-maker]` = 0).

## La unión discriminada

`specs` tiene **tres formas** y no son un continuo — cambian markup, alineación
y padding:

```ts
type Specs =
  | { kind: "matrix"; header: string[]; rows: (string | string[])[][]; note?: string }
  | { kind: "pairs";  rows: [string, string][] }
  | null;
```

| Forma | Fichas | Markup |
|---|---|---|
| `matrix` | 3 de alimentación | 4 columnas; **fila de cabecera con `<td><strong>`** (no `<th>`); celdas **centradas**; `padding: 6px 24px` |
| `pairs` | 7 sondas | 2 columnas; **`<th>` fw700 + `<td>`**; **alineadas a la izquierda**; `padding: 9px 24px` |
| `null` | `gashood` | sin tabla (lleva `extraImage` en su lugar) |

Común a ambas: `border: 1px solid #333`, `border-collapse: collapse`,
**15px**, color `#333`, ancho **848** (100 % de la columna 3/4).

### `matrix` — detalles

- La primera fila **no es `<thead>`**: es un `<tr>` dentro de `<tbody>` cuyas
  celdas llevan `<strong>`. Mismo padding que el resto (6/24).
- Anchos por `style="width:%"` inline y variables por ficha: Panel solar
  reparte 17.12 / 28.23 / 13.33 / 41.32 %; los dos cargadores van a 25 % cada
  una (medidos 212 px × 4).
- **Valores multilínea**: la celda "Notas de instalación" de la fila 12W lleva
  un `<br>` → `AIR Pro: entre los paralelos 0-50ºN/S` + `AIR Lite: por encima
  de los paralelos 0-50ºN/S`. Por eso el tipo de celda es `string | string[]`.
- **Fila nota** (solo Panel solar): `<tr>` con **una sola celda `colspan=4`**,
  **10px**, **alineada a la derecha**, texto: `Dimensiones sin caja. Cada panel
  solar garantiza un suministro de energía suficiente en función de la
  aplicación y la ubicación del proyecto.`

### `pairs` — detalles

- `<th>` de etiqueta a **fw700** y `<td>` de valor a fw400, ambos **left**.
- Entre **6 y 8 filas** según ficha.
- Anchos variables por ficha (el `<th>` va de 373 a 493 px): los fija el
  `style` inline del original, pero **no son significativos** — en el clon
  basta un reparto estable (55/45) porque el contenido manda.

## Móvil — **ARREGLADO** (decisión de producto 2026-07-27)

En el original a 390:

- Las tablas `pairs` miden 312 y **caben** sin problema.
- Las `matrix` miden **472 px** (Panel solar) y **432 px** (cargadores) dentro
  de una columna de 312. Ningún ancestro del contenido tiene `overflow-x`
  distinto de `visible`, **pero `.et-boc` sí lleva `overflow-x: hidden`** → la
  tabla se **corta en x=390** (su borde derecho cae en 511) y **no hay scroll
  horizontal** (`document.scrollWidth == clientWidth == 390`). La 4ª columna,
  "Notas de instalación", queda **inalcanzable**: pérdida de contenido real.

**En el clon NO se replica.** La tabla se envuelve en un contenedor con
`overflow-x: auto` (y `-webkit-overflow-scrolling: touch`), de modo que:

- A ≥640 px la tabla ocupa el 100 % y el contenedor no hace nada (idéntico al
  original).
- A <640 px la tabla conserva su ancho mínimo natural y **se puede desplazar
  horizontalmente** dentro de su caja, sin desbordar la página ni ocultar la
  4ª columna.

Se aplica el contenedor a **ambas formas** por consistencia; en `pairs` es
inocuo porque ya caben.

## Accesibilidad

- `pairs`: la etiqueta va en `<th scope="row">` (el original ya usa `<th>`).
- `matrix`: la fila de cabecera del original usa `<td><strong>`; en el clon se
  emite `<th scope="col">` dentro de `<thead>` — mismo render visual (fw700
  centrado) y semántica correcta. Es la única desviación deliberada de markup.
- La fila nota va como `<tfoot>` con `colSpan` igual al nº de columnas.
