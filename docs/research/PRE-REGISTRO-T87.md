# PRE-REGISTRO · 87.ª tanda (2026-08-20)

Escrito **antes** de mirar el dato de `legal` y **antes** de escribir el código del
eje mixto. §sondas 8b: los hechos negativos que un pre-registro afirme se
comprueban contra el archivo, no de memoria; y §regla 8b-2.ª mitad: cuando lo que
se predice es el efecto de un CAMBIO DE INSTRUMENTO, la lista de lo que se toca se
DERIVA, no se recuerda.

---

## 0 · Los hechos negativos de este pre-registro, comprobados al escribirlo

| lo afirmado | cómo se derivó | resultado |
|---|---|---|
| «sólo `lh-cmp` produce pares con eje» | `grep -ln "dif.push({ camino" scripts/qa/*.mjs` | **1 fichero**: `lh-cmp.mjs` |
| «`pie-cmp` NO comparte esa cañería» | `grep -n "mixta" scripts/qa/pie-cmp.mjs` | **1 sola cita, en un comentario**. Su salida es una descomposición por rol, no pares |
| «la base `t86-despues` sirve» | `git diff --stat 949b66b HEAD -- src public packages apps` | **vacío** |
| «el orden alfabético invierte el tiempo» | `ls -lt` sobre `lh-cmp-1440-todas-2026-08-20*.json` | `-2.json` = **11:58**, `.json` = **09:33**. Alfabético pone `-2` (45) antes que `.` (46) ⇒ **invertido** |

## 0bis · La lista DERIVADA de lo que el cambio de instrumento toca

No de memoria. Símbolos nuevos o modificados, y el `diff` va en el acta de cierre:

- `scripts/qa/lib.mjs` — **añade** `eligeCongeladaAnterior()` y `repartoDeDistancia()`;
- `scripts/qa/lh-cmp.mjs` — **llama** a las dos y publica el bloque; añade `ANTES=`;
- `scripts/qa/lib.test.mjs` — **añade** el negativo de las dos.

Predicción sobre esa lista: **ningún otro fichero cambia**, y en particular
**ninguna congelada de `medidas/` se invalida** (§sondas 5bis) porque el cambio
sólo AÑADE un bloque a la salida, no toca cómo se mide ningún par existente.

---

## 1 · PASO 1 · el eje mixto

**P1.1** — El bloque nuevo se publica **fuera del recuento de defectos**: el
titular `pares distintos` **no cambia de valor** por añadirlo.
*Falsador:* que `paresDistintos` se mueva un dígito entre antes y después del cambio.

**P1.2** — Corrido con `ANTES=medidas/lh-cmp-1440-todas-2026-08-20.json` (la de
**09:33**, anterior al arreglo de `L3`) contra la corrida de hoy, el reparto del eje
mixto reproduce la 86.ª: **se ACERCAN 6 · se ALEJAN 0 · Σ ≈ −512.04 px**, y las
formas son **las 6 de `L3-sci`**.
*Falsador:* cualquier otro cardinal, cualquier otro signo, o formas que no sean `L3-sci`.

**P1.3** — La unidad publicada es el **PAR**. No la forma, no la página.
*Falsador:* que el bloque imprima un denominador en formas o en páginas.

**P1.4** — La congelada anterior se elige por **`mtime`** y la sonda **imprime su
fecha**. Un sabotaje que fuerce el orden alfabético produce **el signo contrario**
(`+512.04`, «se alejan 6»), y el negativo cae **por el signo**, no por el código.
*Falsador:* que el sabotaje salga rojo por otra razón (excepción, exit code) — eso
sería no haber ejercitado el motivo.

**P1.5 (límites, con su cardinal — §regla 14)** — El bloque declara, con número:
(a) cuántos pares mixtos **no son numéricos** y por tanto no tienen distancia;
(b) cuántas formas tienen `diferencias` **truncadas** por el `slice(0, 400)`;
(c) cuántos pares tienen la **referencia movida** entre las dos fotos.
*Falsador:* que alguno salga como frase sin número.

## 2 · PASO 2 · el `legal`

**P2.1 — la predicción que se moja.** El Δ de `legal` entre las pieles B y C es
**MÁS DE UNA causa**. Razón declarada antes de mirar: `115.86 − 48.86 = 67.00` no
reconstruye **ni** el `+22.67` de 1440 **ni** el `+97` de 390, y el «+1.80» de la
85.ª ya resultó ser dos (`+1.59` de `legal` y `+0.21` de `links`).

*Qué la falsaría, dicho con una entrada concreta:* que exista **un solo** camino
—una propiedad de un solo elemento— cuyo Δ valga **+22.67 a 1440 y +97 a 390** a
la vez, con todos los demás caminos de `legal` a Δ0. Eso sería una causa única.

**P2.2** — El eje que separa B de C **dentro de `legal`** es **NUEVO**, distinto de
la fila 1238.39/1152 del mecanismo de las pieles. Razón: B y C **comparten fila**,
así que el eje de las pieles no puede explicar una diferencia entre ellas.
*Falsador:* que el reparto de `legal` se explique enteramente por el ancho de fila.

**P2.3** — El Δ **no** se reproduce con la misma composición a los dos anchos.
Razón: `+22.67` y `+97` no guardan proporción con 1440/390 ni entre sí.
*Falsador:* que el mismo conjunto de caminos, con los mismos valores, dé los dos.

## 3 · PASO 3 · condicionales, y se declaran NO EJERCITADAS si no se llega

**P3.1** — `L1 · L4 · L5` **no se mueven** en `pie-cmp` a ningún ancho.
*(Esta NO es condicional: se comprueba corra o no el PASO 3.)*

**P3.2** *(condicional a construir `L2`)* — `pie-cmp` pasa de **9 · 3 · 6** a
**9 · 2 · 7** (formas · ausentes · comparadas).

**P3.3** *(condicional a construir `L2`)* — rutas **374 → 375**.

---

## 4 · Los cinco disparadores del ESCALÓN 2, copiados del encargo

(a) el Δ de `legal` es más de una causa → se reparten y se nombran una a una;
(b) el mecanismo exige el original VIVO → se declara y se planifica campaña;
(c) arreglar `legal` mueve `L1`, `L4` o `L5`;
(d) construir `L2` destapa que su spec (n = 2) no cubre algo que hace falta;
(e) al construir, `pie-cmp` no baja de 3 ausentes a 2.

**Nota de coherencia:** P2.1 predice «más de una causa», que es exactamente el
disparador (a). O sea que este pre-registro **predice su propia parada**. Se
escribe así a propósito: si acierta, el ESCALÓN 2 no es una retirada sino el plan;
si falla, `L2` se construye en esta misma tanda.
