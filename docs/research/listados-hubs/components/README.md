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
| `L1` (blog · etiqueta · resources) | [`listado-b.spec.md`](listado-b.spec.md) | ✅ escrita — su escalón **cerrado**, ver abajo |
| `L2` (glosario · faqs) | [`listado-tema-cpt.spec.md`](listado-tema-cpt.spec.md) | ✅ escrita **2026-08-11** |
| `L3` (`scientific-category`) | [`listado-tema-tax.spec.md`](listado-tema-tax.spec.md) | ✅ escrita **2026-08-11** |
| `L4` (hub con listado embebido) | [`hub-builder.spec.md`](hub-builder.spec.md) | ✅ escrita **2026-08-11** |
| `L5` (`casos-de-exito`) | [`indice-casos.spec.md`](indice-casos.spec.md) | ✅ escrita **2026-08-11** |

**Las cuatro se redactaron DESDE LO CONGELADO**, sin volver al original: la
medición ya estaba en `medidas/lh-spec-{1440,390}.json` con la misma profundidad
que la primera. Lo que faltaba era la prosa, no los píxeles.

### ⚠ Lo que la redacción destapó, y no estaba en ninguna medida anterior

Cuatro cosas que sólo se ven **cruzando las cinco formas**. ✅ **Diagnosticadas
2026-08-12 (PASO 1 de la 56.ª tanda), desde el corpus congelado y sin red** —
tres enteras con causa, una a medias:

| # | hallazgo | diagnóstico |
|---|---|---|
| 1 | **`L5` sirve CUATRO secciones de pie**; las otras cuatro formas sirven **tres** | ✅ la 4.ª es la **banda CTA** (`et_pb_fullwidth_slider`) y es **el pie de la familia CASOS** — los singulares del grupo C sirven las mismas 4; el clon ya la construye (`CtaInmerso`). `indice-casos` §0 |
| 2 | **La cabecera de `L5` mide 458.09 @1440** contra los **225** de `L2`/`L3` — y **473.08 @390** contra 136.58 | ✅ **tercera fila del header** con módulo de texto («Más información sobre nuestros proyectos…»), **exclusiva del índice** (n=2: índice y `page/2`; 0 en las otras 15 capturas miradas). `indice-casos` §1 |
| 3 | **Tres pieles de `h1`**: `L1` **50/60 · 800** · `L3`+`L5` **44/44 · 300** · `L4` **44.1/55.125 · 300**. Y `L3` **no baja de 44px a 390** mientras `L1` baja a 35 | ✅✅ **EXHIBIDO ENTERO 2026-08-13** (`qa:lh-pieles-css`, canal completo 13/13, negativo 3/3): `L1` = `.et_pb_text_1_tb_body h1 {font-weight:800;font-size:50px;line-height:1.2em}` **+ `@media (max-width:980px){…font-size:35px}`** — o sea override **por módulo**, igual que `L4` (`.et_pb_text_1 h1 {300;44.1px;1.25em}` + móvil 35px). Y el *«no baja a 390»* de `L3`/`L5` tiene su mecanismo: **CERO overrides móviles de titular** (`L1` 4 · `L4` 2 · `L2`/`L3`/`L5` **0**). Ya no se replica de la medida. `listado-tema-tax` §1 · `hub-builder` §1 |
| 4 | **`L5` es la única forma cuya base SUBE al estrechar** (593.28 → 608.27) | ✅ por composición: `h1.y − cabecera.h` = **135.19 a los dos anchos** — la subida es enteramente la cabecera (su fila extra crece +103.41 a 390 mientras el header base encoge −88.42). `indice-casos` §1 |

> ⚠ **Lo que queda medido y NO explicado**, con su ficha: el **+29 @390** de la
> cabecera de `L4` (marcado idéntico a `L2`, el Δ vive al nivel de fila y lo
> congelado no baja ahí — `hub-builder` §1) · el reparto interno de la fila
> extra de `L5` (hoja externa) · la regla externa de la piel de `L1`. Los tres
> se replican del número medido, que es lo que manda el contrato de FIDELIDAD.
>
> **Y un quinto hallazgo del mismo barrido** (2026-08-12): `footer-background`
> lleva `et_pb_with_background` en todo el sitio **salvo en las páginas de
> ARCHIVO** (13/13 sin, 0 excepciones; el cruce con blog singular —plantillado y
> con fondo— descarta que sea builder-vs-plantilla). `indice-casos` §0.

## ⛔ Y lo que esta fase destapó, antes de construir nada

Dos hallazgos, los dos en `PENDIENTES-QA.md`:

1. ✅ **§ESCALÓN F3-2 (2.º) — CERRADO 2026-08-11.** `L1` no tiene una retícula,
   tiene **dos**: `3_4+1_4` con **barra lateral de 4 widgets** en blog y etiqueta
   (**80 de 117 documentos**), `4_4` sin barra en resources (**0 de 37**). Eso
   **acota `D1`** —la variante incluye la retícula y su barra, no sólo la
   tarjeta— y **confirma `D3`**: el widget «Categorías» no consume la taxonomía.
   Acta: `../DECISIONES.md` §*D1 queda ACOTADA*.
2. ✅ **`/es/glosario/` y `/es/preguntas-frecuentes/` no tienen `<h1>` — CERRADO
   2026-08-11 con `D4b` y `D4b.1`.** No es una anomalía: es **plantilla de la
   familia** (12 documentos sin `h1`, 0 con `h1` vacío, 0 familias mixtas). Su
   base es **la primera tarjeta**, y **existe donde hace falta** (`L2` 12/12).
   ⚠ **Media verificación**: falta que sea *el mismo elemento en los dos lados*,
   que no se puede comprobar hasta que el clon emita estas rutas — **`P-LH-C8`**.
