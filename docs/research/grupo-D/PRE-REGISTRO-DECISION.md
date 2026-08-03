# GRUPO D · PRE-REGISTRO de la tanda de DECISIÓN

> **Escrito el 2026-08-03, ANTES de evaluar ningún predicado.** HD1 quedó
> rechazada por D1 (`RECON.md`); las fronteras que eso abre no se resuelven
> midiendo más, se resuelven **decidiendo con criterio pre-registrado** — el
> método de `EXPERIMENTO-URBANO.md` y de LH-2: la decisión sale del predicado,
> no del argumento.
>
> **Honestidad sobre el punto de partida, porque sin ella esto no es un
> pre-registro:** la evidencia del recon **ya está mirada y congelada**
> (`medidas/grupo-d-inventario.json`, 13 páginas). Lo que este documento fija
> ANTES de computarse es **la función de decisión**: qué predicado decide cada
> pregunta y qué resultado significa qué. Un predicado (P-R1) necesita además
> una **medida nueva que aún no se ha tomado**, y se declara. Si un predicado no
> se puede evaluar con lo que hay, se dice — no se sustituye por uno más cómodo.

Las cinco preguntas, en orden de dependencia: el régimen decide cómo se leen las
otras; el hub condiciona la de colecciones.

---

## P-R · ¿Hay un TERCER régimen, o el de siempre leído por capas?

**Hipótesis a contrastar:** no hay tercer régimen. El marcador del `<body>` es
una **pista de qué mecanismos están presentes**, y el discriminador real es la
**varianza entre instancias, capa a capa**: la capa que no varía la fijó quien
construyó la plantilla (lectura plantillada); la que varía la compuso quien
editó la instancia (lectura de builder). Los dos marcadores conviven porque los
dos mecanismos conviven.

| # | predicado | fuente | estado |
|---|---|---|---|
| **P-R1** | la capa de PLANTILLA (`_tb_header` / `_tb_body` / `_tb_footer`, sidebar, sticky) tiene **varianza CERO entre las 13**: mismo número y mismas clases de secciones `_tb_`, sidebar y sticky en las 13 | **MEDIDA NUEVA** — censo `_tb_` de las 13 sobre HTML servido; se congela antes de leerse como dato | ⏳ sin tomar |
| **P-R2** | la capa PROPIA **varía entre instancias**: en artículos varía la composición de módulos (nº de `text`, presencia de `blurb`/`gallery`/`button`); en hubs varía hasta el nº de secciones (1→11) | congelado (`grupo-d-inventario.json`) | ⏳ sin evaluar |

**Qué significa qué:**

- **P-R1 ∧ P-R2** → **NO hay tercer régimen.** `CLAUDE.md` no gana un casillero:
  gana la corrección de que **el régimen es propiedad de la CAPA, no de la
  página** — una página puede tener capa plantillada y capa de builder a la vez,
  y cada test se aplica a su capa. El caso «híbrido» queda enunciado como
  composición de los dos existentes.
- **¬P-R1** (la capa `_tb_` varía entre las 13) → **sí hay tercer régimen** y hay
  que enunciar cómo se leen los dos tests dentro de él antes de tocar nada más.
- **P-R1 ∧ ¬P-R2** → contradiría el recon (que midió varianza 1→11); habría que
  auditar el instrumento antes de decidir nada.

---

## P-H · ¿El hub de KB es un listado de §2c, o qué es?

Se contrasta contra el modelo **YA DECIDIDO** en
`docs/research/listados-hubs/DECISIONES.md` (LH-2 D1), que da dos casilleros
posibles y sus firmas:

| # | predicado | firma decidida en LH-2 | fuente |
|---|---|---|---|
| **P-H1** | el cuerpo del hub lo emite una plantilla con **módulo de consulta** sobre una colección (la firma de LISTADO-B: régimen plantillado, tarjetas por query, varianza 0 intra-familia) | LISTADO-B | congelado: el inventario registra los kinds por sección propia — un módulo de consulta aparecería como `blog`/`portfolio` (en el control EDAR el kind `blog` SÍ aparece, luego el instrumento lo ve) |
| **P-H2** | los hubs **oscilan en nº de secciones propias** entre instancias | **L4**: «hubs de builder que oscilan = página compuesta por instancia = cola larga, CERO arquetipos» | congelado: 1 · 1 · 5 · 5 · 7 · 7 · 11 |

**Qué significa qué:**

- **P-H1** → el hub ES un listado: no estrena nada, y se dice con el criterio
  delante.
- **¬P-H1 ∧ P-H2** → el hub cae en el casillero **L4** de LH-2, que ya está
  decidido: **página compuesta por instancia, cola larga, cero arquetipos de
  listado**. No es «una tercera cosa»: es la naturaleza ya nombrada de los 6
  hubs de builder de LH-2, con la barra lateral de cascarón como única
  diferencia.
- **¬P-H1 ∧ ¬P-H2** → entonces sí sería una tercera cosa, y la diferencia
  concreta con LISTADO-B y con L4 es el enunciado del arquetipo nuevo.

**Matiz pre-registrado para no leerlo torcido después:** dentro de los 7 hubs
hay parejas con composición casi calcada (los dos `articulos-de-ayuda`:
`toggle×2 text×1 image×1`). Si P-H2 se cumple **el veredicto L4 vale para el
grupo**, y las parejas se anotan como lo que son —sub-formas de página
compuesta— sin convertirlas en colección por parecido: **ésa es exactamente la
decisión que LH-2 ya tomó para sus 6 hubs**, que también se parecían entre sí.

---

## P-C · ¿Una colección o dos?

Precedente directo: **§1.5b** — SECTOR y MONOGRÁFICO son dos colecciones y no
una con discriminante, con tres razones (fricción medida · obligatoriedad real
en el admin · **separar después es mucho más caro que fusionar después**).

| # | predicado | fuente |
|---|---|---|
| **P-C1** | los conjuntos de kinds difieren **en las dos direcciones**: los artículos necesitan kinds que los hubs no usan, y al revés | congelado: artículos → `blurb`/`gallery`; hubs → `video`/`toggle` |
| **P-C2** | la forma del cascarón difiere: artículos con secciones propias a varianza **cero**, hubs con 1→11 | congelado |

**Qué significa qué:**

- **P-C1 ∧ P-C2** → **artículo y hub NO comparten colección.** El criterio de
  §1.5b aplica idéntico: unirlos obliga a campos opcionales-condicionales que
  solo existen por la unión, y separar después es más caro que fusionar después.
- **Dependencia declarada:** si P-H concluye **L4** (hub = página compuesta,
  cola larga), la pregunta «¿dos colecciones?» se disuelve: queda **UNA colección
  (artículos de KB)** y los hubs **fuera de colección**, como los 6 de LH-2. Las
  «dos colecciones» solo se materializan si P-H1 diese listado (colección
  implícita en su modelo) o si el hub acabara siendo colección propia.
- **¬P-C1** (un conjunto anida en el otro) ∧ formas iguales → una colección. No
  es lo que el congelado sugiere, pero el predicado lo decide, no la impresión.

---

## P-K · ¿Dónde viven los 4 kinds (`blurb` · `video` · `toggle` · `gallery`)?

**Prohibición vigente y motivo:** añadirlos a `MonoSeccion[]` «de paso» fusiona
dos content types sin haberlo decidido — la misma razón escrita para los 3
campos de §1.3, y la Razón 1 de §1.5b (un campo que existe porque el modelo lo
necesita, no porque el contenido lo tenga, es un arreglo falso).

| # | predicado | fuente |
|---|---|---|
| **P-K1** | alguno de los 4 kinds aparece en alguna instancia medida de SECTOR o MONOGRÁFICO | congelado: inventarios de control (EDAR: text/image/button/slide/code/map/fullwidth_slider/blog · urbano: ídem sin map) |
| **P-K2** | el grupo D reutiliza kinds y ritmo existentes (la mitad confirmada de HD1: `MonoRitmo`, texto/imagen/botón) | congelado: 3 de 6 artículos solo usan esos |

**Qué significa qué:**

- **¬P-K1 ∧ P-K2** → los 4 kinds viven en un **tipo PROPIO del grupo D** (unión
  nueva, p. ej. `KbModulo`), que **reutiliza por definición compartida** lo común
  con `MonoModulo` — el patrón ya decidido en §1.5b: *lo común se declara una
  sola vez como definición exportada y se esparce; lo que se duplica es el
  documento, no la definición*. `MonoSeccion[]` no se toca.
- **P-K1** (alguno de los 4 aparece también en SECTOR/MONOGRÁFICO) → ese kind
  concreto es candidato a **extensión declarada de `MonoModulo` con su acta**,
  porque existiría por su contenido y no por la unión — y solo ése; los demás
  siguen la regla anterior.

---

## P-M · ¿D2/D3 quedan en «no se pudo», o se decide?

El recon dejó D2/D3 sin evaluar porque falta el lado del clon y el §6 prohíbe
construir. Eso no puede quedarse en «no se pudo». Predicado:

| # | predicado | fuente |
|---|---|---|
| **P-M1** | D2/D3 son **confirmatorios de HD1**: miden si un cuerpo *expresado por* `MonoSeccion[]` rinde idéntico al píxel. Con HD1 rechazada, un D2/D3 medido exigiría construir con los 4 kinds añadidos — o sea mediría **otro modelo distinto** del que la hipótesis nombraba | el propio pre-registro de la hipótesis («D1 manda»; §6) |

**Qué significa qué:**

- **P-M1** → **D1 BASTA y se escribe que basta.** D2/D3 se cierran como **SIN
  OBJETO** — no «no se pudo»—, porque su pregunta desapareció con HD1. La
  construcción mínima como instrumento **no se autoriza**: no compraría
  información para ninguna decisión de esta tanda.
- **¬P-M1** (alguien muestra una lectura de D2/D3 que decida algo con HD1 ya
  rechazada) → se autorizaría UNA instancia como instrumento, con alcance
  declarado. No se ve cuál sería, y el pre-registro lo deja dicho.
- **Y la vuelta del píxel, pre-registrada:** cuando el grupo D se construya como
  arquetipo propio, la verificación al píxel vuelve **por la vía estándar** —
  *un arquetipo nuevo no hereda cobertura*: sonda comparadora de dos lados
  propia, no un D2/D3 resucitado.

---

*Pre-registrado el 2026-08-03. Se commitea antes de evaluar P-R1–P-M1; la única
medida nueva pendiente es el censo `_tb_` de P-R1.*
