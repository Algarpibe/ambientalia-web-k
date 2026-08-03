# DECISIÓN · el CPT `solutions` es **UNA colección**, `productos`

> **2026-08-03.** Evalúa `PRE-REGISTRO.md` (commit `3af483c`, anterior a la
> sonda y a la medición) contra `medidas/solutions-campos.json` (`3039996`,
> congelada antes de este acta). Sonda `solutions-campos` con negativo 3/3.

---

## 0 · El veredicto

> **UNA colección `productos` con discriminante.** Campos de frontera
> medidos: **1**, y **opcional**. Ni U1 ni U2 disparan.
>
> **El cubo C queda VACÍO ⇒ F2-1 puede congelar el esquema.**

---

## 1 · La calibración que decidió el recuento, y hay que leerla antes del número

El criterio es «campos nuevos que solo una forma usa». **Lo que cuenta como
«campo» no es libre: lo fija el precedente que este criterio ya cerró.** §1.3,
literal:

> *«Y lo que quedó probado a favor de fusionar: … **`beneficiosAplicaciones`
> entra sin un solo campo nuevo**.»*

`beneficiosAplicaciones` es **un bloque entero que SECTOR tiene y MONOGRÁFICO
no**, y el recuento de §1.3 lo dejó **fuera** de los 3 campos de frontera. Los 3
que sí contó son **propiedades**: `variante` (piel), nivel semántico del claim,
alineación vertical.

> **Calibración, y es la que gobierna este acta: un KIND DE BLOQUE que una forma
> usa y otra no NO es campo de frontera. Lo son las PROPIEDADES.** Un kind de más
> en la unión lo usa quien lo necesita; una propiedad de más hay que declararla,
> hacerla opcional y condicionarla en el admin — que es la Razón 2.

**Sin esta calibración el recuento sale ×5 y la decisión se invierte**, porque
casi todo lo que separa a estas páginas son kinds.

---

## 2 · Lo medido — 24/24, 0 selectores muertos, control 4/4

### 2.1 · Un solo cascarón, y eso quita la frontera más cara

| | |
|---|---|
| plantilla | **`solutions-template-default et-tb-has-template` en 24 de 24** |
| secciones propias | **4 · 5 · 6 (×21) · 7** ⇒ composición **por instancia** |

> **No hay dos cascarones que separar.** Es lo contrario de L2 vs L3 en LH-2
> —separados porque su secuencia de primer nivel difería (4 vs 5 secciones)— y lo
> mismo que grupo C, donde *«el cascarón es idéntico»* sostuvo una sola forma.

### 2.2 · La agrupación por RUTA era una hipótesis, y los datos la tumbaron

La sonda agrupó por ruta declarándolo como hipótesis. **Falsa en dos sitios:**

| se suponía | mide | es |
|---|---|---|
| `sensor-de-calidad-del-aire/metano` = ficha, como su padre | **47 mod · 0 blurb** | **la firma de un cartucho** |
| `software-…` y `kunak-api` = forma propia | **89 y 56 mod · blurb 31 y 12** | **la firma de `monitor-calidad-aire`** |

**El eje real es el VOLUMEN DE CONTENIDO, no la forma:**

| | n | módulos | `blurb` | secciones |
|---|---|---|---|---|
| sin `blurb` | **18** — 17 cartuchos + `…/metano` | 46–50 | **0** | 6 (y una 7) |
| con `blurb` | **5** — monitor · estación · sensor · software · api | 56–106 | 12–34 | 5–6 |
| `accesorios` | **1** | 55 | 0 | 4 |

> **Las dos primeras filas tienen el MISMO nº de secciones y la MISMA plantilla.
> Lo único que las separa es cuántos bloques puso el editor** — o sea contenido,
> no forma. `simple` y `rica` **no son dos content types**.

### 2.3 · El recuento de frontera, por propiedades

| propiedad candidata | ¿frontera? | por qué |
|---|---|---|
| `blurb` · `galeria` · `video` · `cta` · `tabla` · `slider` | **NO** | son **kinds de bloque** — calibración §1.3 (`beneficiosAplicaciones`) |
| `descargaPdf` | **NO** | es el `href` de un botón, o sea una **propiedad de un kind que las dos formas ya tienen** |
| **ruta con PADRE** | **SÍ — 1** | 18 de 24 cuelgan de un segmento (`cartuchos-inteligentes/*`, `sensor-de-calidad-del-aire/metano`) y 6 no. **Es una propiedad, y hay que declararla** |

> **FRONTERA = 1, y es OPCIONAL** (la tienen 18 de 24; las otras 6 simplemente no
> la traen). No hay ninguna propiedad **universal en una forma y ausente en
> otra**.

---

## 3 · Contra el umbral PRE-REGISTRADO

| regla | umbral | medido | ¿dispara? |
|---|---|---|---|
| **U1 · obligatoriedad** | ¿algún campo de frontera **obligatorio** en una forma? | **ninguno** — el único es opcional en las dos direcciones | **NO** |
| **U2 · magnitud** | ¿frontera **≥ 3** o **> 25 %** de la unión? | **1**, y muy por debajo del 25 % | **NO** |

⇒ **UNA colección con discriminante.** Y el precedente cuadra por el otro lado:
§1.5b separó con **3**; grupo D declaró arquetipo con **4**. Con **1** habría
sido incoherente separar.

---

## 4 · Lo que queda SIN PROBAR, y no se cablea

Aplicando la regla del pre-registro —*una propiedad vista en UNA sola instancia
está SIN PROBAR*—:

| # | qué | n | por qué no se decide hoy |
|---|---|---|---|
| **PR-SP1** | **`accesorios`**: única con tablas (10) y única sin slider, 4 secciones | **1** | Con n=1 **no se puede separar «catálogo es otra forma» de «un autor que maquetó con tablas»**. Entra en `productos` con su `tipo`, y **si aparece una segunda página de catálogo se re-evalúa** |
| **PR-SP2** | el **padre** de `…/metano` es **otro producto**, y el de los cartuchos una **categoría** | 18 | el campo se declara **opcional**; si es relación o `select` lo decide F2-1 con el enrutado del §4 delante |
| **PR-SP3** | `producto` y `catalogo` con **n=1** cada uno | 1 | su «universal» es «presente». **Ninguna afirmación de plantilla sale de ellas** |

**Ninguno bloquea**: los tres son preguntas **dentro** de una colección ya
decidida, no sobre cuántas colecciones hay.

---

## 5 · ESCALÓN DECLARADO — no se disparó

| condición | ¿se cumple? |
|---|---|
| (a) ninguna medida de esta tanda la arbitra | **NO** — la arbitró: frontera = 1, con su calibración |
| (b) cara de deshacer | sí |
| (c) sin precedente aplicable | **NO** — §1.3/§1.5b es precedente directo y **dio el listón** |

---

*Decidido el 2026-08-03, contra el pre-registro `3af483c` y la medida `3039996`.*
