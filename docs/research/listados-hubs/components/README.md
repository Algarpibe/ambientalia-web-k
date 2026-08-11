# SPECS de listados y hubs — índice y ALCANCE

> **2026-08-11, PASO 2 de F3-2.** La fase que faltaba: hasta hoy `listados-hubs`
> tenía recon (`PAGE_TOPOLOGY.md`), decisiones (`DECISIONES.md`) y
> comportamiento (`BEHAVIORS.md`), y **cero `components/*.spec.md`** — derivado,
> no recordado. `LH-SP2` lo decía con todas las letras: *«la geometría: ni un
> píxel medido en esta tanda»*.
>
> Instrumento: **`npm run qa:lh-spec [1440|390]`** contra el **original vivo**,
> congelado en `medidas/lh-spec-1440.json` y `medidas/lh-spec-390.json`.
> Complemento sobre la captura: **`npm run qa:lh-barra`** (`medidas/lh-barra.json`).

## Por qué contra el sitio vivo y no contra la captura

Misma razón **medida** que en F3-1 (`medidas/kb-css.json`): la captura no trae
las hojas externas y **aun así renderiza**, así que sale *plausible y
equivocada*. Aquí el número está en `medidas/hover-zonal.json`: cada forma pide
entre **7 y 14 hojas externas**, y la regla del zoom de tarjeta vive en ellas.

## El ALCANCE, declarado — porque un eje es propiedad de lo medido

| | |
|---|---|
| formas | **9** (las mismas de `lh-tarjetas` y `comportamiento`, para que las medidas se puedan cruzar) |
| páginas | **13** = 9 canónicas + **4 segundas instancias** |
| anchos | **1440 y 390**, los dos del contrato de FIDELIDAD |
| lado | **sólo el original.** El clon no existe: las 9 dan 404 (medido en `comportamiento-1440.json`) |
| ruido | ⚠ estas rutas **no tienen campaña de ruido**. Un residuo pequeño aquí es **SIN PROBAR**, no limpio |

**La segunda instancia no es un lujo, es lo que hace legible cada número.** En
régimen plantillado el discriminador es la **varianza entre instancias**, y eso
**no se puede medir con una**. Por eso la sonda no dice «plantilla» donde tiene
n=1: dice **SIN PROBAR (n=1)**, que es una afirmación distinta. La segunda se
elige por la regla adversaria que el recon pre-registró —**la instancia con
MENOS tarjetas**, la que rompe una plantilla calibrada con la abundante—.

| forma | n | régimen | lectura que toca |
|---|---|---|---|
| `L1-blog` | **1** | plantillado (`tb_body`) | **SIN PROBAR** en todo |
| `L1-etiqueta` | 2 | plantillado (`tb_body`) | varianza entre instancias |
| `L1-resources-hijo` | 2 | plantillado (`tb_body`) | ídem |
| `L1-resources-padre` | 2 | plantillado (`tb_body`) | ídem |
| `L2-glosario` · `L2-faqs` | 1 + 1 | plantillado (tema) | se cruzan entre sí |
| `L3-sci` | 2 | plantillado (tema) | varianza entre instancias |
| `L4-listado-embebido` | **1** | **builder** | tests A y B — es la única donde valen |
| `L5-casos` | **1** | plantillado (tema) | **SIN PROBAR** en todo |

## Estado de cada spec

| forma | spec | estado |
|---|---|---|
| `L1` (blog · etiqueta · resources) | [`listado-b.spec.md`](listado-b.spec.md) | ✅ escrita — **con su escalón declarado dentro** |
| `L2` (glosario · faqs) | — | ⛔ **pendiente**: medida y congelada, sin redactar |
| `L3` (`scientific-category`) | — | ⛔ pendiente |
| `L4` (hub con listado embebido) | — | ⛔ pendiente |
| `L5` (`casos-de-exito`) | — | ⛔ pendiente |

**Las cuatro pendientes tienen su medida congelada en
`medidas/lh-spec-{1440,390}.json`**, con la misma profundidad que la escrita:
lo que falta es la redacción, no la medición. Se dice así y no «faltan las
specs» porque son dos estados distintos y sólo uno cuesta volver a pegarle al
original.

## ⛔ Y lo que esta fase destapó, antes de construir nada

Dos hallazgos, los dos en `PENDIENTES-QA.md`:

1. **§ESCALÓN F3-2 (2.º)** — `L1` no tiene una retícula, tiene **dos**:
   `3_4+1_4` con **barra lateral de 10 widgets** en blog y etiqueta (**80 de 117
   documentos**), `4_4` sin barra en resources (**0 de 37**). `D1` afirma que
   entre familias sólo cambia la configuración de la tarjeta. **F3-2 no
   construye hasta que eso se decida.**
2. **`/es/glosario/` y `/es/preguntas-frecuentes/` no tienen `<h1>`** — y el
   protocolo de este proyecto lee el cuerpo restando la `y` del `h1`. `L2` **no
   tiene ancla**, así que su base hay que decidirla antes de comparar nada.
