# PRE-REGISTRO · 79.ª tanda — la re-congelación de los espejos

> **Escrito y commiteado ANTES de medir.** Un pre-registro protege de decidir por
> cansancio, y **no** protege de partir de una premisa falsa (§sondas 8b), así
> que los hechos negativos que afirma van comprobados **contra el archivo** en el
> momento de escribirlo, no de memoria.

**Fecha:** 2026-08-19 · **Anchos:** 1440 y 390 · **DPR:** 1 · **Objetivo:**
`https://kunakair.com` **VIVO** · **Alcance:** `lh-spec` 13 formas × 2 anchos ·
`lh-espejo` 82 páginas × 2 anchos.

---

## 1 · Qué cambia y qué NO puede cambiar — el discriminador del disparador (a)

El único cambio de instrumento entre el espejo caducado y el nuevo es
`deTarjeta`: se añadió `.scientific-excerpt` **al final** de la lista del
extracto, se añadió el rescate de **texto suelto**, y se corrigieron dos
selectores de título muertos (`.case-titulo`/`.scientific-titulo` →
`.case-title`/`.scientific-title`).

> **De ahí sale una predicción con FORMA, no un «va a cambiar algo»:**

| forma | `extracto` en el espejo caducado | predicción |
|---|---|---|
| `L1-blog` (24 tarjetas) | **24 con dato, 0 null** | **NO se mueve por el arreglo** |
| `L1-etiqueta` (105) | **105 con dato, 0 null** | **NO se mueve por el arreglo** |
| `L3-sci` (16) | 0 con dato, **16 null** | pasa a **16 con dato** |
| `L2-glosario` (23) | 0, **23 null** | pasa a **23 con dato** (texto suelto) |
| `L2-faqs` (12) | 0, **12 null** | pasa a **12 con dato** (texto suelto) |
| `L1-resources-hijo` (29) · `-padre` (21) | 0, **50 null** | **parcialmente**: el corpus dice que sólo las de `documentos-cientificos` tienen `.scientific-excerpt`; las de `articulos` **no tienen extracto** |
| `L4` (3) | 0, **3 null** | sin predicción — no medido en el corpus por forma |
| `L5-casos` (3) | 0, **3 null** | **sigue null** — medido sobre 114 instancias en la 78.ª |

**El discriminador, y es el trabajo del PASO 1:**

> **`L1-blog` y `L1-etiqueta` ya casaban al 100 %, así que el arreglo NO PUEDE
> moverlas.** Todo lo que se mueva ahí es **DERIVA DEL ORIGINAL** desde el
> 2026-08-11 (`lh-spec`) y el 2026-08-14 (`lh-espejo`), y se declara con su
> número **antes** de construir. Son dos causas y sólo una es mía.

## 2 · Los tres disparadores del ESCALÓN 2 que este paso puede activar

| # | condición | qué la haría verdad |
|---|---|---|
| **(a)** | pares movidos en `L1-blog`/`L1-etiqueta` | deriva del original — **se separa y se declara**, no se construye encima |
| **(b)** | algún consumidor sigue leyendo el espejo viejo | el PASO 0 lo previene liberando el canónico; se verifica **después** de re-congelar |
| **(c)** | aparece `extracto` en `L5` | contradiría la medida de 114 instancias de la 78.ª ⇒ **se dirime antes de seguir** |

## 3 · Lo que este pre-registro NO predice, y va dicho

- **cuánta deriva habrá.** No hay campaña de ruido cerrada para estas rutas
  (`SP-T5`/`SP-K4` abiertas en las dos specs), así que un residuo pequeño aquí es
  **SIN PROBAR**, no «limpio»;
- **el reparto exacto de `L1-resources`.** El corpus dice 48 de 223 con
  `.scientific-excerpt`, pero las páginas del espejo no son las mismas 45 del
  corpus: el emparejamiento se deriva al medir, no se predice;
- **`L4`**, que es F3-3 y no entra en esta fase.

## 4 · Y la predicción sobre el COMPARADOR, para que su subida no se lea como daño

> **El `extracto` es un EJE NUEVO del comparador**: donde antes había `null` a
> los dos lados —y por tanto **empate**— ahora hay dato a los dos. **Los pares
> distintos van a SUBIR, y eso NO es daño.**

Un comparador que compara un campo más **no es comparable con el de ayer** sin
decir cuál campo entró. Al cerrar se publica **el reparto por campo**, nunca el
total a secas.

---

# RESULTADO — contrastado contra lo pre-registrado (2026-08-19, @1440)

## Lo que se cumplió: las 8 predicciones por forma, incluida la que más importaba

| forma | predicho | medido | |
|---|---|---|---|
| `L1-blog` | **no se mueve** | 3/3 → **3/3** | ✅ |
| `L1-etiqueta` | **no se mueve** | 6/6 → **6/6** | ✅ |
| `L3-sci` | pasa a tener dato | 0/4 → **4/4** | ✅ |
| `L2-glosario` | pasa a tener dato | 0/3 → **3/3** | ✅ |
| `L2-faqs` | pasa a tener dato | 0/3 → **3/3** | ✅ |
| `L1-resources` hijo · padre | **sin extracto** (son de `articulos`) | 0/4 → 0/4 · 0/6 → 0/6 | ✅ |
| `L4` | sin predicción | 0/3 → 0/3 | — |
| **`L5-casos`** | **sigue null** | 0/3 → **0/3** | ✅ **disparador (c) NO dispara** |

`L5` confirma por un **segundo canal** —el original vivo— lo que la 78.ª midió
sobre 114 instancias del corpus: **su tarjeta no lleva extracto**.

## ⚠ LO QUE EL PRE-REGISTRO NO ANTICIPÓ, Y ES LA MAYORÍA DEL MOVIMIENTO

**El arreglo de la 78.ª tocó TRES roles, no dos.** Este pre-registro nombró
`extracto` y `titulo`, y **se dejó `meta`**: la 78.ª le añadió
`.case-taxonomies` y `.scientific-taxonomies`. Son **273 de los 358** pares
movidos — la mitad más grande, y la que este documento daba por inexistente.

> **Es §*una afirmación de que un discriminador no existe se escribe con la lista
> de canales que se miraron*, cometida sobre un pre-registro.** Enumerar «qué
> cambió el instrumento» de memoria en vez de derivarlo del diff es §regla 9, y
> aquí se pagó con una predicción incompleta que se habría leído como cumplida.
>
> **La derivación que faltaba cuesta una línea:** `git diff` del commit del
> arreglo sobre `lh-barrido.mjs`, que nombra los tres roles.

## El reparto de las 358 diferencias, con su causa

| clase | pares | qué es |
|---|---|---|
| **campo nuevo del instrumento** (`meta.*` en `L3`/`L5`) | **273** | el rol `meta` pasa de `null` a casar — **no es deriva ni defecto** |
| `paginador.piezasTotales` · `topeDePiezas` | **12** | campos que añadió la 75.ª al declarar el tope (§sondas 4, 4.ª cara) |
| `titulo.sel` `h3` → `.scientific-title`/`.case-title` | **7** | el arreglo de los muertos. **NO-OP en geometría**: mismo `rect` y mismo texto, comprobado par a par |
| `meta: null → undefined` | **7** | consecuencia de la primera fila: el camino deja de ser hoja |
| **DERIVA DEL ORIGINAL — `Δ+3` en el pie** | **35** | `pie.rect.h 590.75 → 593.75`, propagado a `docH` y a las `y` de abajo. En `L1-blog`(5) · `L1-etiqueta`(10) · `L1-resources-hijo`(10) · `-padre`(10) |
| **DERIVA DEL ORIGINAL — `L2`, grande** | **24** | `L2-glosario` `docH 1933 → 2242` (**+309**), `pie.rect.h` **+308.64**, y `paddingBottom "0px" → "57.5938px"` en el cascarón. Ídem `L2-faqs` |

## ⛔ Y por tanto: EL DISPARADOR (a) DISPARA

**Hay deriva del original en formas que el arreglo NO PUEDE mover.** `L1-blog` y
`L1-etiqueta` casaban 3/3 y 6/6 antes y después, y aun así traen **15 pares
movidos** entre las dos: el pie del original creció **+3 px** entre el
2026-08-11 y hoy, y `L2` se movió **+309**.

**Son dos causas y sólo una es mía.** Por el escalón del encargo, esto se
**declara con su número y NO se construye encima**.
