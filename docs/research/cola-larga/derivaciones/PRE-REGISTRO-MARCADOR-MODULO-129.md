# PRE-REGISTRO · 129.ª ESCALÓN 1 — el marcador `data-modulo` en `/kunak-api`

**Escrito el 2026-08-31, ANTES de construir y ANTES de medir.** §regla 8b: un
pre-registro protege de decidir por cansancio, y sus hechos negativos se
comprueban contra el archivo al escribirlo, no de memoria.

---

## 0 · Lo que este pre-registro NO puede protegerme de

§regla 8b: *«un pre-registro NO protege de partir de una premisa falsa»*. Las
premisas aquí, cada una con su derivación:

| premisa | derivada de | valor |
|---|---|---|
| el eje `módulos` está a `·` en las 4 | `cobertura-2026-08-30.json` por `mtime` | 4 de 4 |
| el comparador existe y su eje está ciego | `productos-cmp-1440.json` §`ejesExcluidos` | sí |
| el ANTES sigue siendo válido | `git log --since` sobre `apps/web/src` | **0 commits** lo tocan |
| lo que el original tiene en cada fila | `escalon1-objetivo-129.json`, 4 controles verdes | 311 DOM · 215 con caja |
| qué rutas alcanza el cambio | `escalon1-alcance-129.json`, 4 controles verdes | **2** de 26 |

---

## 1 · El cambio, DERIVADO del `git diff` y no recordado

§regla 8b, segunda mitad: la lista de lo que tocaste es un conjunto derivable, y
escribirla de memoria produce una predicción **incompleta que se lee como
cumplida**.

```
apps/web/src/components/BlurbsIconos.tsx        | 15 ++++++++++
apps/web/src/components/api/BeneficiosApi.tsx   |  5 +++-
apps/web/src/components/api/HeroApi.tsx         | 39 ++++++++++++++++++-------
apps/web/src/components/api/InfoProductoApi.tsx | 11 +++++--
```

**16 marcadores escritos**: `BlurbsIconos` 1 (en el `<li>`, que se repite por
item) · `HeroApi` 6 · `InfoProductoApi` 6 · `BeneficiosApi` 3.

**15 son ATRIBUTO PURO** sobre un elemento que ya existe — no añaden nodo ni
clase, así que no pueden mover un píxel. **1 es un ENVOLTORIO NUEVO**: el
`<div data-modulo="text">` que agrupa el kicker y el `<h1>` de `HeroApi`, porque
en el original son **UN** `et_pb_text` (derivado: la fila 1 sirve
`image · text · text · text · button · image`).

> **Ese envoltorio es el único riesgo real de esta tanda**, y por eso se predice
> aparte: es donde el NO-OP puede romperse.

---

## 2 · Las predicciones, cada una con su ancho (§*una predicción sobre una propiedad tapada se escribe con su ancho*)

### P1 · NO-OP de geometría — **a 1440 Y a 390**

> En las **2 rutas afectadas** (`/kunak-api`, `/software-de-medicion-calidad-del-aire`)
> los ejes de fila `h · w · mb · pt · pb` salen **idénticos** al ANTES
> (`productos-cmp-{1440,390}.json`, mtime 2026-08-30 23:29/23:30), **a los dos
> anchos**, con umbral **cero**.

⚠ **El ancho va DENTRO de la predicción a propósito.** El envoltorio vive en una
columna que a 1440 va en fila con su hermana y a 390 apila, así que el contenedor
que podría absorber un desplazamiento **no es el mismo** — §la regla espejo: un
Δ0 en un ancho con Δ≠0 en el otro no es «casi cuadra», es una medida tapada.

### P2 · NO-OP en las NO afectadas

> Las otras **2 del lote** (`/monitor-calidad-aire`, `/accesorios`) y las **24**
> pages que el cierre transitivo deja fuera **no se mueven**. Si alguna se
> mueve, el defecto **no es el marcador** y hay que buscar otra causa antes de
> tocar nada.

### P3 · El marcador LLEGA, con su cardinal

> `/kunak-api` pasa de **12 hijos directos** a **27 `[data-modulo]` con caja** en
> las 6 filas que el comparador empareja: filas 1·2·3 a **6 · 12 · 9**, que son
> exactamente los cardinales del original.
>
> Y **6 quedan SIN MARCAR** —filas 0 (1), 4 (4) y 5 (1)—, porque sus componentes
> no se han tocado en esta tanda. **Eso se declara, no se descuenta** (§*un censo
> recortado para caber en la tanda mide la tanda*): el objetivo de la ruta son
> **33** y esta tanda entrega 27.

### P4 · Lo que NO predigo, y por qué

- **no predigo el número de `/software-…`**: gana sólo los blurbs de
  `BlurbsIconos` y sus otros módulos siguen sin marcar. Se **mide y se publica**,
  no se anticipa;
- **no predigo que el eje quede acreditado**: eso exige además cambiar el
  selector del lado clon en la sonda, que es un cambio **de instrumento** y va
  **separado** — si se hicieran a la vez, un rojo tendría dos explicaciones y
  ninguna medida las separaría (§regla 5bis).

---

## 3 · Cómo se falsa cada una

| predicción | qué la refuta |
|---|---|
| P1 | **un solo** eje de fila con Δ ≠ 0 en cualquiera de las 2 rutas, a cualquiera de los 2 anchos |
| P2 | cualquier movimiento en las 24 + 2 no afectadas |
| P3 | `nModulos` del clon ≠ 27, o un reparto por fila distinto de `0·6·12·9·0·0` |

**Y el orden importa**: P1 se evalúa **antes** que P3. Si el marcador mueve
píxeles, no vale que además cuente bien — un instrumento que altera el objeto que
mide no es un instrumento.

---

## 4 · La condición de anulación

Si el NO-OP falla **sólo** en el envoltorio de `HeroApi`, la salida **no es
quitar el marcador**: es marcar el módulo sin envolver —por ejemplo, moviendo el
atributo al elemento que ya agrupa— y volver a medir. Quitarlo devolvería el eje
a ciego, que es el estado que esta tanda existe para cambiar.
