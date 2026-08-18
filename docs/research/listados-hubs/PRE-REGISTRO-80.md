# PRE-REGISTRO · 80.ª tanda — cuánto de la deriva llega al clon, y L3 + L5

> **Escrito y commiteado ANTES de medir.** Un pre-registro protege de decidir por
> cansancio y **no** protege de partir de una premisa falsa (§sondas 8b): los
> hechos negativos que afirma van comprobados **contra el archivo** al
> escribirlo. Y su segunda mitad, pagada por la 79.ª: **lo que un cambio de
> instrumento toca se DERIVA del `git diff`, nunca se enumera de memoria** — la
> 79.ª dijo dos roles y eran tres, y los 273 pares del rol olvidado eran la
> mayoría del movimiento.

**Fecha:** 2026-08-18 · **Anchos:** 1440 y 390 · **DPR:** 1 · **Objetivo:** el
CLON contra los espejos congelados de la 79.ª (`lh-espejo-{1440,390}.json`,
2026-08-18) · **Alcance:** 82 páginas × 2 anchos.

**Estado de partida, derivado y no recordado:** 412 commits · árbol limpio ·
**1085** congeladas · **179** sondas (`qa:lib`, última línea) · **367** rutas
emitidas (`qa:manifiesto`) · `BUILD_ID` `EE6rrhKNhs19PnxkwQOVw` del 08:06, y el
único commit posterior (`5f1d12a`) toca **sólo docs y medidas** — o sea que el
`.next` que va a medir el PASO 0 es el de este árbol.

---

## 1 · QUÉ TOCÓ EL INSTRUMENTO ENTRE LOS DOS ESPEJOS — derivado del `git diff`

El espejo caducado se midió el **2026-08-14** y el nuevo el **2026-08-18**.
`git log --since=2026-08-14 -- scripts/qa/lh-barrido.mjs scripts/qa/lh-ejes.mjs`
devuelve **DOS** commits en esa ventana, no uno:

| commit | tanda | qué añadió al barrido |
|---|---|---|
| `0bb9707` (08-17 15:10) | 75.ª | **`paginador.piezasTotales`** (recuento sin recortar) + `topeDePiezas` (en `IGNORAR`, no se compara) |
| `3412c91` (08-18 07:22) | 78.ª | **`titulo`**: `.case-title`/`.scientific-title` en vez de los muertos en español · **`meta`**: `+.case-taxonomies`, `+.scientific-taxonomies` · **`extracto`**: `+.scientific-excerpt` y el rescate de **texto suelto** |

> **Son CUATRO campos, no tres.** La 79.ª derivó los tres del `3412c91` y su
> ventana empezaba ahí; la de esta tanda empieza el 08-14 y mete además el de la
> 75.ª. Es la misma regla aplicada un día después: **la ventana de la derivación
> es la que separa las dos medidas que vas a comparar**, no la del último commit
> que recuerdas.

## 2 · LO QUE YA ESTÁ DERIVADO SIN TOCAR EL CLON — y por tanto no se predice, se cita

Comparando los dos espejos camino a camino (`aplana` + `IGNORAR` de
`lh-ejes.mjs`, el mismo clasificador que usa el comparador):

| forma | en el clon | caminos MOVIDOS @1440 · @390 | caminos NUEVOS @1440 · @390 |
|---|---|---|---|
| `L1-blog` (8 pág) | compara | 32 · 32 | 8 · 8 |
| `L1-etiqueta` (36) | compara | 144 · **303** | 31 · **43** |
| `L1-resources-padre` (7) | compara | 28 · 28 | 6 · 6 |
| `L1-resources-hijo` (11) | compara | 44 · **87** | 6 · 6 |
| `L2-glosario` (8) | AUSENTE | 88 · 88 | 54 · 54 |
| `L2-faqs` (4) | AUSENTE | 44 · 44 | 28 · 28 |
| `L3-sci` (6) | AUSENTE | 16 · 16 | **1248 · 1248** |
| `L4` (1) | AUSENTE | **0 · 0** | **0 · 0** |
| `L5-casos` (1) | AUSENTE | 3 · 3 | 117 · 117 |

**Y el reparto por camino, que es lo que hace la predicción falsable:**

- **en las 62 páginas que el clon SÍ compara**, lo movido es
  `esqueleto.cascaron.N.rect.{y,h}`, **`pie.rect.h`** y —sólo a 390—
  `esqueleto.cuerpo.*.rect.y`. **Ni un solo camino de los tres roles del
  `3412c91`**;
- lo **nuevo** en esas 62 es **`paginador.piezasTotales` y nada más** (51 @1440;
  @390 hay además **12** `body.clases.21..24` en 3 páginas de `L1-etiqueta`);
- los 1248 + 117 caminos nuevos de `L3` y `L5` son **`meta.*` + `extracto.*`**, y
  hoy **no rinden ni un par**: esas formas están AUSENTES. Empezarán a contar
  cuando el PASO 2 y el PASO 3 las construyan.

## 3 · LAS PREDICCIONES

### A · Alcance

| # | predicción |
|---|---|
| **A1** | `qa:lh-cmp-todas` y `-390` comparan **62 páginas** y declaran **20 AUSENTES**, las mismas 20 del congelado del 17 (`L5` 1 · `L2-glosario` 8 · `L2-faqs` 4 · `L4` 1 · `L3-sci` 6). Si sale otro número, **se nombra página a página**; no se ajusta |

### B · Los tres cubos del PASO 0

| # | predicción |
|---|---|
| **B1** | **el cubo 2 (arreglo del SELECTOR) es 0 en las 62 comparadas.** Los tres roles del `3412c91` sólo se movieron en `L2`/`L3`/`L5`, que están ausentes |
| **B2** | el único campo de instrumento que llega es **`paginador.piezasTotales`**: **51 pares nuevos** a cada ancho. Que difieran o no **no se predice** — el barrido lo calcula también sobre el DOM del clon |
| **B3** | **el cubo 1a (pares que la deriva CREA) es ≈ 0.** `pie.rect.h` **ya diferían antes** del movimiento del original: el congelado del 17 da `orig 590.75 → clon 594.75`. Con el pie nuevo a 593.75 el par **sigue difiriendo, con Δ +1 en vez de +4**: la deriva lo mueve, no lo crea |
| **B4** | ídem `esqueleto.cascaron.*`: **248 de 248 ya diferían** a 1440 en el congelado del 17 — es la divergencia YA DECLARADA (Divi mete cabecera y pie dentro de `.et_pb_section`). La deriva cambia su magnitud, no su existencia |
| **B5** | por B3 + B4, **la mayoría de la deriva cae en el cubo 1b** («ya diferían y la deriva los movió»), que **no es daño nuevo**. Si sale al revés —un cubo 1a grande— la premisa de esta tanda está mal y **se dice** |

### C · Las 4 rutas de ±30 @390 — hipótesis del encargo, COMPROBADA contra el archivo antes de escribirla

Los dos espejos a 390 dan, en `baseEnCrudo.yAbsoluta`:

| ruta | espejo 08-14 | espejo 08-18 | Δ |
|---|---|---|---|
| `/es/etiqueta/cov/` | 266.58 | 236.58 | **−30** |
| `/es/etiqueta/emisiones-industriales/` | 266.58 | 236.58 | **−30** |
| `/es/etiqueta/particulas-en-suspension/` | 266.58 | 236.58 | **−30** |
| `…/articulos/industria-y-contaminacion-por-olores/page/2/` | 262.58 | 292.58 | **+30** |

O sea: **el fenómeno es del ORIGINAL y está en el archivo**, con las dos
direcciones dentro de la misma corrida y `pie.rect.h` moviéndose igual (+6.65)
que en sus 33 hermanas. Es la firma del **suelo bimodal de 390 (Δ = 30)** que
`cqa6-390` cerró el 2026-08-04 sobre **otras** rutas.

| # | predicción |
|---|---|
| **C1** | el `baseCruda.delta` del clon en esas 4 rutas @390 cae **en uno de los dos picos: ≈ 0 ó ≈ 30**. Un valor intermedio —12, 25— **NO es ruido pequeño**: entre pico y pico no hay masa, así que **dispara el ESCALÓN 2** |
| **C2** | ⚠ **y esto NO establece que esas 4 rutas sean bimodales.** Dos lecturas separadas 4 días son **n = 2**, no una campaña; lo que sí está establecido es que el original produjo **dos valores separados exactamente por 30** en ellas. La forma se declara **NO ESTABLECIDA** hasta que haya campaña, igual que quedó `petroleo` en `cqa6-390` |

### D · La construcción (PASOS 2 y 3)

| # | predicción |
|---|---|
| **D1** | rutas emitidas **367 → 374** (+6 de `L3`, +1 de `L5`). Otra cifra se **nombra ruta a ruta** |
| **D2** | comparador de **FORMAS** (espejo `lh-spec`, 13): **13 · 6 ausentes · 7 comparadas → 13 · 3 · 10** |
| **D3** | comparador de **PÁGINAS** (espejo `lh-espejo`, 82): **82 · 20 ausentes → 82 · 13** |
| **D4** | `qa:cobertura` **sube**, y con números: `lh-cmp` aporta hoy **62** rutas a los cinco ejes que alimenta, y pasará a **69** ⇒ base cruda **93 → 100** · árbol **93 → 100** · anchos **77 → 84** · filas **68 → 75** · módulos **64 → 71** · total **367 → 374** |
| **D5** | `L3` **no pinta paginador** en ninguna de sus 6 páginas y **las 3 páginas de una serie sirven las mismas tarjetas** (14·14·14 y 8·8). Emitir una rebanada sería inventar comportamiento |
| **D6** | `L5` **no lleva extracto**. Si el comparador saca `extracto` en `L5`, contradice dos canales (114 instancias del corpus + el original vivo de la 79.ª) y **se dirime antes de seguir** |

### E · Qué NO predice este documento, y va dicho

- **cuánto vale el cubo 3** — lo del clon — es exactamente lo que la corrida
  mide, y adelantarlo sería escribir el resultado;
- **que `L3` y `L5` salgan Δ0 a la primera.** No hay razón para esperarlo y
  esperarlo empuja a cablear;
- **el ruido de estas rutas.** No hay campaña: un residuo pequeño aquí es **SIN
  PROBAR**, no «limpio» — y esta tanda **no la abre**;
- **si la decisión del PASO 1 es (A) recalibrar o (B) declarar.** Se toma **con
  el número del PASO 0 delante**, que es el punto del escalón.

## 4 · Los cinco disparadores del ESCALÓN 2, y qué los haría verdad

| # | condición | dónde se lee |
|---|---|---|
| **(a)** | Δ en las 4 rutas @390 que no sea ≈0 ni ≈30 | `formas[*].baseCruda.delta` de `lh-cmp-390-todas` |
| **(b)** | la deriva del pie llega al clon en `L3`/`L4`/`L5`, donde el ORIGINAL **no se movió** (0 · 0 en la tabla de §2) | el cubo 1 de `qa:lh-cubos` en esas formas |
| **(c)** | algo POR ENCIMA del pie sale movido a 1440, donde el espejo da 0 de 82 | ídem, por camino |
| **(d)** | `qa:lh-poblacion` con déficit ≠ 0 en `documentos-cientificos` o `casos` | su congelada |
| **(e)** | se ejercita «cuerpo MÁS CORTO que el tope» del extracto de `L3` — **0 de 23 lo ejercitan**, o sea SIN PROBAR y NO SOPORTADO | el render de `L3` |

## 5 · Instrumentos: qué se toca y qué NO

- **el PASO 0 no toca ni una sonda existente**, así que **no caduca ninguna
  congelada** (§sondas 5bis). Lo único nuevo es **`scripts/qa/lh-cubos.mjs`**,
  que no mide el sitio: **deriva** el reparto por cubos de una congelada de
  `lh-cmp` cruzándola con los dos espejos;
- `lh-cubos` declara su mínimo (`Evaluadas`) y congela en `medidas/`, y su
  negativo tiene que caer **por su motivo**, no por el código de salida;
- si el PASO 2 o el PASO 3 obligan a tocar `lh-barrido`, **eso caduca los dos
  espejos otra vez** y se declara con su alcance antes de seguir.

---

# RESULTADO DEL PASO 0 — contrastado contra lo pre-registrado (2026-08-18)

**Canales:** `medidas/lh-cmp-{1440,390}-todas-2026-08-18.json` (el comparador,
con el clon SIN TOCAR) · `medidas/lh-cubos-{1440,390}.json` (el reparto por
causa) · los dos espejos.

## Las predicciones, una a una

| # | predicción | medido | |
|---|---|---|---|
| **A1** | 62 comparadas · 20 AUSENTES, las mismas 20 | **62 · 20**, las mismas 20 | ✅ |
| **B1** | el cubo 2 (arreglo del SELECTOR) es **0** en las 62 | **0 @1440 · 0 @390** en los tres cubos; en las mixtas **0 @1440 · 33 @390** | ✅ |
| **B2** | `paginador.piezasTotales` entra como par nuevo; que difiera no se predice | entra (**pares comparados 110 779 → 110 830**, +51 exactos) y **no difiere ni una vez** | ✅ |
| **B3** | el cubo **1a** (pares que la deriva CREA) es ≈ 0 | **0 @1440.** A 390 son **11**, y los 11 son de **una sola página** — ver abajo | ✅ |
| **B4** | `esqueleto.cascaron.*` ya diferían: la deriva los MUEVE, no los crea | **248 de 248 @1440 MUEVE, 0 CREA** | ✅ |
| **B5** | la mayoría de la deriva cae en el cubo 1b | **248 de 248 @1440 · 379 de 390 @390** | ✅ |
| **C1** | las 4 rutas de ±30 @390 caen en uno de sus dos picos | **Δ0 · Δ0 · Δ0 · Δ−30.** Ni un valor intermedio | ✅ |

## Los tres cubos, con su número

| | @1440 | @390 |
|---|---|---|
| **cubo 2 · INSTRUMENTO** | **0** | **0** |
| **cubo 1 · DERIVA** | **0** | **0** |
| **cubo 3 · DEL CLON** | **4996** | **4974** |
| pares comparados | 110 830 | 110 889 |
| resueltos por la deriva | 0 | 0 |
| sin clasificar | 0 | 0 |
| *control* · caminos que el espejo movió | 299 | 513 |

## ⚠ Y LA MITAD QUE ESTUVO A PUNTO DE PUBLICARSE COMO UN CERO

La primera versión de `lh-cubos` saltaba los pares de eje **mixto** con un
`continue` —el comparador los declara *sin referencia limpia*— y publicó
**`cubo 1 = 0`** al lado de un control que decía **299 caminos movidos**. Los dos
números eran ciertos y juntos daban la lectura falsa: *«la deriva no llega al
clon»*.

> **Lo que pasa es que los caminos que la deriva movió son EXACTAMENTE los de eje
> mixto**: `pie.rect.h` y `esqueleto.cascaron.N.rect.{y,h}` son `y`/`h`, y
> `ejeDe()` las clasifica mixtas por construcción. La deriva **sí llega**, y
> llega entera al único cubo que el comparador no lee como defecto.

Repartidas también las mixtas (bloque propio, **fuera** del recuento):

| mixtas que difieren | @1440 | @390 |
|---|---|---|
| total | 8451 | 8588 |
| de instrumento | 0 | 33 |
| **de DERIVA** | **248** | **390** |
| — de ellas **CREA** | **0** | **11** |
| — de ellas **MUEVE** | **248** | **379** |
| del clon | 8203 | 8165 |

Congelada anterior renombrada con su defecto (§regla 7):
`lh-cubos-1440-SONDA-NO-REPARTIA-LAS-MIXTAS.json`.

## Los 11 «creados» de 390 NO son deriva del pie: son el SEGUNDO PICO

Los once están **en una sola página** —`/recursos/articulos/industria-y-contaminacion-por-olores/page/2/`—
y los once son el **mismo +30**:

| camino | antes | ahora | clon |
|---|---|---|---|
| `baseEnCrudo.yAbsoluta` · `baseEnCrudo.rect.y` | 262.58 | **292.58** | 262.58 |
| `contenedorTema.rect.y` · `esqueleto.cuerpo.0.rect.y` · su fila · su columna | 136.58 / 148.58 | **166.58 / 178.58** | 136.58 / 148.58 |
| `esqueleto.cuerpo.1.*` (sección, fila, columna, módulo) | 212.58 / 262.58 | **242.58 / 292.58** | 212.58 / 262.58 |

> **El clon está en el pico dominante y el original salió en el otro.** Es la
> firma de 390 con Δ = 30 que `cqa6-390` cerró el 2026-08-04 sobre otras rutas —
> **y aquí no se declara la forma como establecida**: dos lecturas separadas 4
> días son n = 2, no una campaña (C2 del pre-registro).

## LA RESPUESTA A LA PREGUNTA DE LA TANDA

> **De la deriva del original, al clon le llega CERO en la unidad que el
> comparador lee como defecto.** Toca **248** pares a 1440 y **390** a 390,
> todos de eje mixto, y a 1440 **no crea ni uno**: los 248 ya diferían por la
> divergencia de cascarón YA DECLARADA (Divi mete cabecera y pie dentro de
> `.et_pb_section`).
>
> **Y el pie nunca casó.** El congelado del 17 da `pie.rect.h` **orig 590.75 →
> clon 594.75**; con el pie nuevo a **593.75** el par sigue difiriendo, **con
> Δ +1 en vez de Δ +4**. O sea que la deriva **acercó** el original al clon.

## Los cinco disparadores del ESCALÓN 2

| # | veredicto |
|---|---|
| **(a)** | **NO dispara** — las 4 rutas dan Δ0 · Δ0 · Δ0 · Δ−30, los dos picos exactos |
| **(b)** | **NO dispara** — `L3`/`L4`/`L5` están AUSENTES: 0 pares repartidos en ellas |
| **(c)** | **NO dispara** — a 1440 la deriva atribuida son `pie.rect.h` y `esqueleto.cascaron.*`, ninguno por encima del pie. `cabecera.rect.h` sale movido **sólo a 390** y en las **4** páginas del segundo pico |
| **(d)** | **NO dispara** — `qa:lh-poblacion`: `casos` **57/57**, `documentos-cientificos` **14/14 · 8/8 · 1/1**. Déficit 0 en las 29 series |
| **(e)** | **NO dispara** — el caso «cuerpo más corto que el tope» **no se ejercita**: los 23 cuerpos pasan de 100 bytes. Sigue **SIN PROBAR y declarado como camino de render sin estrenar**, que es lo que la ficha pide |

---

# RESULTADO DE LOS PASOS 2 y 3 (2026-08-18)

## PASO 2 · `L3` CONSTRUIDA — las predicciones D1…D5

| # | predicción | medido | |
|---|---|---|---|
| **D1** | rutas **367 → 374** (+6 `L3`, +1 `L5`) | **367 → 373**. La que falta es **`/casos-de-exito`**, y se nombra: `L5` no se construye (§PASO 3). Las 6 de `L3` son exactamente las predichas | ⚠ **nombrada** |
| **D2** | formas **13 · 6 ausentes → 13 · 3** | **13 · 4 · 9** — las 3 de `L3` menos, `L5` sigue ausente | ⚠ **nombrada** |
| **D3** | páginas **82 · 20 → 82 · 13** | **82 · 14 · 68** — ídem | ⚠ **nombrada** |
| **D4** | cobertura sube: `lh-cmp` 62 → 69 rutas | sube a **68** (+6, no +7) — ver el cierre | ⚠ **nombrada** |
| **D5** | `L3` **no pinta paginador** y las 3 páginas de una serie sirven las mismas tarjetas | reproducido: las 6 páginas emiten el término entero y **ninguna** pinta control | ✅ |

> **Las cuatro desviaciones son LA MISMA y tienen una sola causa: `L5` no se
> construyó.** Se nombra en vez de ajustarse el número, que es lo que el
> pre-registro exige.

### Lo que el comparador dice de `L3`, en las 6 páginas y a los dos anchos

**Base `Δ0` en las seis.** Y las diferencias que quedan, todas de clase ya
declarada:

| clase | pares por página | qué es |
|---|---|---|
| **cascarón** | **50** | Divi mete cabecera y pie **dentro de `.et_pb_section`** y el clon los sirve en Tailwind (`nSecciones` 5 → 1, `porCapa.tb_*`, los 4 nodos de `cascaron`). La misma que llevan las 62 páginas de `L1` |
| **`href` locales** | **3 · 9 · 10** | §Regla de rutas locales — la misma clase que los 259 `paginador.hrefs.N` de `L1` |
| **nada más** | **0** | tipografía, ritmo, cajas, anchos, `sel`, `marca`, textos y extracto: iguales |

### Los DOS defectos que el comparador cazó, y ninguno se veía sin él

| defecto | coste | clase conocida |
|---|---|---|
| interlínea de la miga: **26 en vez de 30.6** | **base −4.59** en las 2 instancias | el módulo vale **26 dentro de un `_tb_body` y 30.6 en las plantillas PHP del tema** — medido en el mismo espejo |
| **un espacio** detrás del año en `.scientific-taxonomies` | **6 pares** de `contenido` | §*el espacio en blanco entre elementos: el navegador lo renderiza*, aquí sobre el TEXTO |

## PASO 3 · ⛔ `L5` NO SE CONSTRUYE — y la razón es del MODELO, no de la tanda

| # | predicción | resultado |
|---|---|---|
| **D6** | `L5` **no lleva extracto** | **sin ejercitar**: no se llegó a construir |

**Lo que se entrega en su lugar es la medición que dice por qué no se puede:**
el orden de las 57 tarjetas es **`datePublished` DESC — 57/57**, servido en el
JSON-LD de los 57 singulares, y **`casos` no tiene ese campo**. Los cuatro
candidatos que sí están modelados quedan refutados **con su número**
(`detalles.anyo`, orden de la colección, carpeta `uploads/AAAA/MM` **30/57**, ID
de WordPress).

> **Construir con un orden sustituto pondría OTRAS TRES tarjetas donde el espejo
> mira** —`L5` tiene una sola página y el espejo congela sus 3 primeras—, y el
> comparador sacaría decenas de pares rojos que **no son defecto de plantilla**.
> Desde ahí, el camino de menor resistencia es cablear el orden para que cuadren
> las 3 que el espejo mira: el **arreglo falso** de manual.

Fichas: `PENDIENTES-QA.md` §F3-LH-ORDEN-DE-L5-SIN-MODELAR · `ESQUEMA-CMS.md`
§7g (**`CMS-ORDEN-L2` no era de `L2`: es de TRES arquetipos**).
