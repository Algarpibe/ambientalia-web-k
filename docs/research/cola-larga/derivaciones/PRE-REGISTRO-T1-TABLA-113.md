# PRE-REGISTRO · T1 — `MODULO_TABLA` tal cual, y el residuo decide si hay T2 (113.ª) — 2026-08-26

**Se escribe y se commitea ANTES de tocar `src/`, `packages/` o el extractor.**
§0 **no es predicción**: está derivado y lleva su comando al lado (§regla 8b).
Lo que se predice es §2, y sólo §2.

---

## §0 · LO QUE YA ESTÁ DERIVADO (con su comando, no de memoria)

### 0.1 · El entorno, comprobado ANTES de gastarlo (§regla 37 — de eso iba la 112.ª)

```
$ docker info --format '{{.ServerVersion}}'                    # 29.6.2  (demonio vivo)
$ docker ps -a --filter name=kunak-cms-pg                      # Up 2 hours · postgres:17-alpine
$ docker exec kunak-cms-pg psql -U kunak -d kunak_cms -tAc …   # kunak@kunak_cms · tablas=130
$ tasklist | grep -iE '^(node|chrome)'                         # 0 node → ninguna sonda en vuelo
```

El veredicto lo da **la consulta**, no el `Up` de `docker ps` (§El principio).

### 0.2 · El mecanismo exacto por el que hoy faltan 9 → 8 módulos

Derivado leyendo el corpus y `arbol-f33.mjs`:

```
$ grep -o 'class="[^"]*dvmd_table_maker[^"]*"' corpus/…/politica-de-cookies/index.html | grep -v _item_
class="et_pb_module dvmd_table_maker dvmd_table_maker_0 dvmd_tm_version_4_0_1"
```

`tipoDe` (`arbol-f33.mjs` L79) exige **`^et_pb_([a-z][a-z0-9_]*?)_(\d+)$`**. El
envoltorio lleva `et_pb_module` pero **ningún `et_pb_<tipo>_<n>`**, así que:

| paso | qué pasa |
|---|---|
| `tipoDe(envoltorio)` | **`null`** |
| `modulosDe` | como no es módulo, **DESCIENDE dentro** |
| dentro | sólo hay `dvmd_tm_*` — ningún `et_pb_*_<n>` |
| resultado | **la tabla entera es invisible: 8 módulos, no 9** |

⚠ **Y no da error: da 8, que es un número plausible.** Es §sondas 4 sobre el
predicado de un caminante.

### 0.3 · Los dos instrumentos cuentan «módulo» con criterios distintos — y por eso el Δ existe

| instrumento | criterio | ve la tabla |
|---|---|---|
| `arbol-f33.modulosDe` (extractor) | clase `et_pb_<tipo>_<n>` | **NO** |
| `f33-cmp` (comparador) | DOM `[class*='et_pb_module'], [data-modulo]` | **SÍ** |

Por eso el comparador publica **orig 9 → clon 8**: su lado del original usa el
selector ancho y su lado del clon lee lo que el extractor emitió. Es
§sondas 31 hermana (*dos instrumentos que censan el mismo objeto con distinto
criterio de recuento*), aquí con **efecto real**, no artefacto.

### 0.4 · `f33-cmp` YA sabe nombrar el módulo de terceros — no hay que inventar heurístico

`f33-cmp.mjs` L486-497 lo deriva sin listar vendedores: *«una clase `X_<n>` cuya
base `X` también está presente en el elemento»*. Así `dvmd_table_maker_0` +
`dvmd_table_maker` → **`dvmd_table_maker`**, y `dvmd_tm_version_4_0_1` **no
cuela**. Y anota la caja medida: **880 × 1511**.

### 0.5 · La forma de la tabla, ya censada (109.ª, `tabla-cookies-109.log`)

**1 tabla · 11 × 5 = 55 celdas** · `item_N` es la **COLUMNA** (1:1 en las 55).
Papeles: `rhead` **11** (col 0) · `tdata` **33** (col 1·2·3) · `rfoot` **11**
(col 4). Contenido: **55/55 texto plano**, 0 enlaces, 0 listas, 0 párrafos
múltiples. Sin sitio en el modelo: **22 de 55 (40 %)**.

### 0.6 · Dónde NO se toca, derivado

`arbol-f33.mjs` tiene **15 consumidores** (`grep -rln 'arbol-f33'`), entre ellos
**`f33-spec`**, que es una de las 3 sondas de la deuda de §regla 37. Tocar
`tipoDe` ahí caducaría los artefactos de los 15. **El reconocimiento del módulo
de terceros se hace LOCAL en `extractor-f33.mjs`** — §regla 29 mitad 2: no se
cambia la definición compartida para arreglar a un consumidor.

---

## §1 · LA SEPARADORA, ESCRITA ANTES DE MEDIR

**T1 pierde el PAPEL de 22 celdas, no las celdas.** Las 55 siguen emitiéndose
(11 filas × 5 columnas); lo que el modelo no expresa es que la col 0 sea
cabecera y la col 4 pie. De ahí la pregunta que decide T2:

> **¿El papel perdido tiene efecto GEOMÉTRICO que la POSICIÓN no pueda
> recuperar?**

| resultado del residuo | veredicto |
|---|---|
| \|Δ docH\| **≤ 150** a los dos anchos | **T1 se sostiene · T2 NO se reabre** |
| **> 150** y atribuido **al papel** (col 0 / col 4 con estilo que la posición no reproduce) | **T2 SE REABRE** |
| **> 150** y atribuido a **otra cosa** (tipografía, `padding`, envoltura) | **T2 NO se reabre** — es defecto de transcripción, se arregla en el componente |

⚠ **El residuo se ATRIBUYE, no se resta.** El −1512 de partida medía que
faltaba **el módulo entero**; un residuo sin atribuir no reabre nada ni cierra
nada.

---

## §2 · LO QUE PREDIGO (esto sí es predicción)

### P1 · el residuo de `docH`, **con su ancho** (§*una predicción sobre una propiedad tapada se escribe con su ancho*)

Partida derivada: **orig 9 módulos → clon 8 · Δ docH −1512.00 a 1440**, con la
caja del módulo medida en **880 × 1511**. O sea que **el Δ ES el módulo**: 1511
de caja + ~1 de ritmo.

| ancho | predicción | rango que aceptaría |
|---|---|---|
| **1440** | **−60** | −150 … +150 |
| **390** | **−200** | −600 … +200 |

**El razonamiento de 1440:** si el clon emite las 55 celdas con la tipografía y
el `padding` transcritos, la altura la fija el mismo texto envolviendo en el
mismo ancho de columna, así que el grueso de los 1511 se recupera y lo que
queda son bordes y redondeos.

**Por qué 390 va con rango cuatro veces más ancho, y lo declaro:** a 390 una
rejilla de 5 columnas **tiene que hacer algo** —apilar, encoger o desbordar con
scroll— y **cuál de las tres hace el original no está medido**. §regla 35: un
`@media` mete en juego selectores que al otro ancho no existen, así que **el
ancho donde la regla no compite no puede verla**. Predecir −200 a 390 con el
mismo rango que a 1440 sería fingir una precisión que no tengo.

### P2 · el manifiesto no se mueve

**413 rutas · diferencia simétrica 0 y 0** contra `manifiesto-2026-08-26.json`
(derivado: `rutas` = 413).

**Mecanismo:** T1 añade un MÓDULO a un documento que **ya existe**; no da de
alta ni de baja ninguna página, y `paginas` no aporta segmento de ruta por
módulo. **Refutación:** si la diferencia simétrica no fuera 0 y 0, T1 habría
tocado el enrutado sin querer — y entonces **ése es el hallazgo y se para**
(escalón 3.4).

### P3 · el aplanado de los 22 papeles, **con su mecanismo y su refutación**

> **Predigo que el aplanado NO produce Δ geométrico observable.**

**Mecanismo, y es lo que hace falsable la predicción:** el papel es una
**clase** (`dvmd_tm_rhead` / `dvmd_tm_rfoot`) y su efecto visual es CSS sobre
esa clase. Pero el censo de la 109.ª midió que **papel y columna son 1:1 en las
55** — `rhead`→col 0, `tdata`→col 1·2·3, `rfoot`→col 4. Así que **una regla CSS
POSICIONAL (`nth-child`) reproduce el aspecto del papel sin que el modelo tenga
que expresarlo**. Se pierde la semántica; no se pierde el píxel.

**Refutación, escrita:** encontrar **una sola celda cuyo papel no coincida con
su columna**. Con eso, la posición deja de recuperar el papel y la predicción
cae. En el dominio medido hay **0 de 55**.

> ⚠⚠ **Y LA SEPARADORA QUE HAY QUE DECLARAR, PORQUE ES §*dos variables
> confundidas*: en esta tabla PAPEL y POSICIÓN son INDISTINGUIBLES.** El 1:1 no
> se mide sobre dos tablas, se mide sobre **UNA** (n = 1). Una segunda tabla
> `dvmd` con los papeles repartidos de otro modo separaría las dos variables —
> y **no la tengo**: el corpus menciona `dvmd` en **21 documentos** pero sólo
> emite **2 rutas**, y la otra es de arquetipo escrito a mano.
>
> O sea que si P3 acierta, lo que quedará probado es **«la posición basta EN
> ESTA TABLA»**, nunca «el papel es prescindible». Eso se escribe como
> **SIN PROBAR fuera de este dominio**, no como cerrado.

### Y la dirección en la que espero equivocarme

> **Espero que P1 se me quede CORTO a 390, no a 1440.**

A 1440 el mecanismo es aritmético —el texto envuelve igual en el mismo ancho—.
A 390 depende de una decisión de maquetación del original **que no he medido**,
y §la regla espejo dice que un residuo que aparece sólo en un ancho es un
contenedor que en el otro lo tapaba. Si me equivoco fuerte, será ahí.

### Lo que NO predigo

**No predigo si T2 se reabre.** Es justo lo que la separadora de §1 existe para
decidir, y fijarlo aquí sería escribir el veredicto antes que la medida.
