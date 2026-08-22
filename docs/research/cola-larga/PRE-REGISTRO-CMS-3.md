# CMS-3 · PRE-REGISTRO de la decisión de la COLA LARGA

> ⚠⚠ **RESUELTO EN PARTE EL MISMO DÍA, Y NO POR LLEGAR EVIDENCIA NUEVA: POR
> DESAPARECER EL DOMINIO.** Este documento se escribió tratando las **16 sueltas
> sin capturar** como muestra ciega. Al pagar la precondición (ESCALÓN 2 de la
> misma tanda) resultó que **las 16 no son páginas**: el origen vivo responde
> **13 × 301 y 3 × 404**, igual que el 2026-08-09.
>
> **Así que P-U y P-O no se «confirmaron»: se quedaron sin instancias que los
> pudieran ejercitar** — y eso es una resolución legítima **sólo porque la
> pregunta era sobre el recuento final**, que ahora se conoce entero. Redactarlo
> como *«P-U1 ✅ confirmado»* sería §*0 instancias separadoras leído como
> acierto*. Se redacta como lo que es: **el denominador cambió de 48 a 32 y la
> pregunta se cerró con él.**
>
> | predicado | estado | por qué |
> |---|---|---|
> | **P-U1 · P-U2 · P-U3** | ✅ **cerrados** | no quedan páginas por capturar ⇒ la unión de **12 tipos es COMPLETA para las 32**, no una cota. Las 16 añaden **0** tipos porque no existen |
> | **P-O1** | ✅ **cerrado a favor de C3** | las de 0 secciones propias quedan en **2 de 32** y **no pueden crecer** por captura. **RA-2 no puede dispararse por esta vía** — sólo por contenido nuevo dado de alta |
> | **P-O2 · P-O3** | ✅ **sin objeto** por la misma razón | no hay 16 páginas nuevas que puedan traer campo obligatorio ni régimen nuevo |
> | **P-S · P-C · P-R1a/b** | ⏳ **siguen vivos** | no dependían de las 16: se evalúan sobre las 32, y ahora **con sus hojas** (32/32) |
>
> **Y la mitad honesta:** el predicado que se escribió *«para poder salir contra
> la decisión»* —**P-O1**— salió **a favor**, y por una vía que el pre-registro
> no contemplaba. Eso **no es una validación de C3**: es que la prueba que iba a
> tensionarla **no llegó a celebrarse**. Lo que sí sigue pudiendo tumbar C3 son
> **RA-1** y **RA-3**, que dependen de medir las 32 y no de capturar nada.

> **Escrito el 2026-08-22 (91.ª tanda), ANTES de construir nada y ANTES de
> capturar las 16 sueltas que faltan.** La decisión (**C3**: una colección
> `paginas` con unión PROPIA de bloques) ya está tomada por el propietario y
> escrita en `ESQUEMA-CMS.md` §2j. Este documento **no la vuelve a discutir**:
> fija **qué implica**, en predicados que se puedan evaluar y **que puedan salir
> mal**.
>
> **Honestidad sobre el punto de partida, porque sin ella esto no es un
> pre-registro:** la evidencia de **32 de las 48** páginas ya está mirada y
> congelada (`corpus/fase-3/`, censo en
> `derivaciones/modulos-f33-v4.mjs` + `mod-v4.log`). Lo que aquí se fija ANTES de
> existir es lo que dirán **las 16 que todavía no se han capturado** — que son
> justamente la precondición de la fase. Ésa es la muestra ciega, y es lo que
> hace que estos predicados sean predicciones y no descripciones.
>
> ⚠ **La unidad de todo lo de abajo es la PÁGINA** salvo donde diga otra cosa.
> El plan mezcló páginas e instancias de tipo en la misma columna y de ahí salió
> «12» donde eran 20 (§2j.1).

## 0 · El estado de partida, con su denominador

| | valor | denominador |
|---|---|---|
| rutas de la cola larga | **48** | 7 hubs KB + 6 hubs L4 + 35 sueltas |
| HTML capturado | **32** | 7/7 · 6/6 · **19/35** |
| con sus hojas `et-cache` | **6** | 0/7 · **6/6** · 0/19 |
| tipos de contenido en la unión | **12** | derivado de las 32 |
| tipos sin definición en el repo | **8** | `code` · `toggle` · `video` · `fullwidth_slider` · `slide` · `map` · `slider` · `icon` |
| tipos copiables de otra unión | **1** | `blurb` (vive en `MODULOS_KB`) |
| páginas con **0 secciones propias** | **2** | de las 32 |

**Los 12 tipos y cuántas de las 32 los ejercitan** (capa propia, retícula
excluida):

| tipo | páginas | ¿lo expresa `MonoSeccion[]`? |
|---|---|---|
| `text` | **29** | sí (`titular`/`claim`/`texto`) |
| `image` | **19** | sí (`imagen`) |
| `code` | **9** | **no — sin bloque en el repo** |
| `button` | **6** | sí (`boton`) |
| `toggle` | **5** | **no — sin bloque** |
| `video` | **5** | **no — sin bloque** |
| `blurb` | **3** | no en `MonoSeccion[]`; **existe en `MODULOS_KB`** |
| `fullwidth_slider` | **2** | **no — sin bloque** |
| `slide` | **2** | **no — sin bloque** |
| `map` | **1** | **no — sin bloque** |
| `slider` | **1** | **no — sin bloque** |
| `icon` | **1** | **no — sin bloque** |

---

## P-U · LA UNIÓN — ¿converge, o la cola larga no tiene fondo?

**Hipótesis:** la unión está **casi cerrada**. Las 16 sin capturar son landings
comerciales, dos casos de éxito, un término de glosario y dos índices; todas del
mismo constructor y del mismo sitio, así que deben reutilizar tipos ya vistos.

| # | predicado | evaluable con | resultado |
|---|---|---|---|
| **P-U1** | capturadas las 48, la unión de tipos de contenido queda en **12 ≤ N ≤ 17** | el censo v3 corrido sobre 48 | ✅ **CERRADO SIN EJERCITARSE** — no quedaban 16 por capturar. N = **12**, y es TOTAL, no cota (`mod-v4.log` §¿COTA o TOTAL?) |
| **P-U2** | los 16 nuevos añaden **≤ 5 tipos** que hoy no están | ídem | ✅ **SIN OBJETO** — añaden **0**, porque no existen (13 × 301 · 3 × 404) |
| **P-U3** | **ningún tipo nuevo aparece en ≥ 8 de las 16** — o sea, lo que falta es cola, no un tipo mayoritario que el muestreo se dejó fuera | ídem | ✅ **SIN OBJETO** — mismo motivo. ⚠ Y por eso NO se lee como *«el muestreo era bueno»*: es que no había muestreo, el conjunto está entero |

**Qué significa qué:**

- **P-U1 ∧ P-U2 ∧ P-U3** → la unión converge; C3 es dimensionable y su coste es
  el declarado ±5 definiciones.
- **¬P-U2 (añaden > 5)** → **la muestra de 32 no representaba al conjunto**, y el
  coste de C3 estaba subestimado por más de un tercio **dos veces seguidas** (7 →
  12 → >17). Eso **no cambia la decisión por sí solo** —C2 y C4 empeoran igual—
  pero obliga a **re-presupuestar F3-3 antes de construir** y a decir en el
  ESQUEMA que la unión no está acotada.
- **¬P-U3** → hay un tipo frecuente que las 19 sueltas capturadas no vieron: es
  §*la instancia que hay que meter en el catálogo es aquélla donde la holgura se
  acaba*, y el muestreo de la 90.ª era sesgado. Se re-lee **todo** lo derivado de
  esas 19, no sólo el recuento de tipos.

---

## P-O · LA OPCIONALIDAD — el predicado que puede salir CONTRA C3

**Éste es el que puede tumbar la decisión, y por eso va con su umbral escrito
antes.** C3 paga que `bloques` sea **opcional en las ~~48~~ 32** por culpa de **2**
páginas con cero secciones propias. Ese precio es asumible **mientras esas 2
sean una excepción**; si son la punta de una forma poblada, RA-2 se cumple y la
colección única deja de valer.

| # | predicado | evaluable con | resultado |
|---|---|---|---|
| **P-O1** | capturadas las 48, las páginas con **0 secciones propias** siguen siendo **exactamente 2** | `reg-f33` sobre 48 | ✅ **CERRADO A FAVOR DE C3, sin ejercitarse** — quedan en **2 de 32** y **no pueden crecer por captura**. RA-2 sólo puede dispararse por contenido nuevo dado de alta |
| **P-O2** | ninguna de las 16 trae un **campo de documento obligatorio** que las otras 32 no tengan (no un bloque: un campo del cascarón — cabecera, hero, barra, ficha) | recon del cascarón de las 16 | ✅ **SIN OBJETO** — no hay 16 páginas nuevas |
| **P-O3** | los 16 nuevos no estrenan **régimen**: siguen siendo `BT` / `B-` / `-T`, sin cuarta combinación | `reg-f33` sobre 48 | ✅ **SIN OBJETO** — mismo motivo |

**Qué significa qué:**

- **P-O1 ∧ P-O2 ∧ P-O3** → C3 se sostiene tal como está escrita. `bloques`
  opcional por **2 de 32** (⚠ escrito «2 de 48»; el denominador bajó el mismo día) es una excepción declarada, no un content type.
- **¬P-O1 con ≥ 4 páginas de 0 secciones** → **RA-2 se cumple** (`ESQUEMA §2j.3`):
  la forma «sin capa propia» deja de ser excepción. **Se reabre CMS-3 y C4 pasa
  a ganar**, porque además Razón 3 ya la favorecía. **Esta es la predicción que
  puede salir contra la decisión**, y el umbral —**4**— queda fijado aquí para
  que no se elija después de ver el número.
- **¬P-O2** → **RA-1 se cumple**: hay obligatoriedad real que difiere por
  subconjunto, que es el único argumento de §1.5b Razón 2 que C3 sacrifica. Se
  reabre.
- **¬P-O3** → hay un régimen nuevo en la cola larga; antes de modelar nada hay
  que leerlo por capas (§*el régimen es propiedad de la CAPA*).

> ⚠ ~~**Y el enunciado va con su alcance, porque el cero de hoy es de 32 y no de
> 48:** *«sólo 2 páginas sin capa propia»* es una afirmación sobre **las 32
> capturadas**. Las 16 que faltan **no están medidas**, así que P-O1 no es una
> confirmación esperada: es una **apuesta a que el 2 aguante**, y el conjunto que
> la puede romper es exactamente el que falta por capturar.**~~
>
> ✅ **ESTE PÁRRAFO QUEDA REFUTADO EL MISMO DÍA, y su forma es la que enseña:**
> daba por sentado que *«las 16 que faltan»* son un conjunto que **puede romper
> el 2**. No lo es: son 13 × 301 y 3 × 404. Así que **32 no es una muestra de
> 48 — es el conjunto entero**, y el «2» no es una apuesta: es el total. La
> apuesta que sí queda viva es otra —**contenido NUEVO dado de alta**— y ésa es
> RA-2, que no depende de ninguna captura.

---

## P-S · `slide` — ¿bloque o hijo?

En Divi `et_pb_slide` es **hijo** de `et_pb_slider` / `et_pb_fullwidth_slider`.
En las 2 páginas capturadas que lo traen (`/es/contacto/`, `/es/empresa/`)
**nunca aparece sin un slider en la misma página**. Si es hijo, no es un bloque
de la unión: es el `array` interno del bloque slider.

| # | predicado | resultado |
|---|---|---|
| **P-S1** | en las ~~48~~ **32**, `et_pb_slide` **nunca** aparece en una página sin `slider` ni `fullwidth_slider` | ⏳ **VIVO** — y ahora sobre el conjunto ENTERO, no sobre una muestra |
| **P-S2** | y anidado: cada `et_pb_slide` está **dentro** del DOM de un slider | ⏳ |

- **P-S1 ∧ P-S2** → la unión baja a **11 bloques top-level** y `slide` es un
  campo `array` dentro del bloque slider. El coste de C3 baja en una definición.
- **¬P-S1** → `slide` es top-level y se queda como bloque. La unión sigue en 12.

> **Se pre-registra porque es exactamente el sitio donde se cuela un tipo
> inventado:** contar `et_pb_slide` como hermano de `et_pb_slider` es el mismo
> error de nivel que contar `column_3` como módulo de contenido, y ése ya se
> pagó en la v1 del censo.

---

## P-C · `code` — el tipo que se había perdido entero

`code` aparece en **9 de las 19** sueltas leídas: las de formulario
(`contacto`, `newsletter`, `suscribete`, `descarga-catalogo`) y los **5**
informes técnicos. Es el segundo módulo más frecuente del subconjunto y el censo
anterior lo daba por cubierto.

| # | predicado | resultado |
|---|---|---|
| **P-C1** | el contenido de `et_pb_code` es **marcado incrustado de terceros** (formulario / script), no prosa | ⏳ |
| **P-C2** | **no** cae bajo la whitelist del campo rico de §3 — necesita bloque propio con campo HTML sin sanear, o queda fuera del modelo con su razón | ⏳ |
| **P-C3** | en los **5** informes técnicos el `code` es **la misma pieza** (mismo formulario), o sea un bloque con parámetros, no 5 contenidos distintos | ⏳ |

- **¬P-C2 (sí cae en la whitelist)** → `code` se absorbe en `texto` y la unión
  baja otra definición.
- **P-C3** → hay un candidato a **bloque parametrizado** (un formulario con su
  id), que es más barato y más editable que 5 blobs de HTML.

---

## P-R1 · La restricción que sostiene C3 frente a C4

C3 gana a C4 **sólo porque R1 (cero arquetipos) pesa más que Razón 3**. Si R1
cae, Razón 3 vuelve a mandar y C4 gana (`ESQUEMA §2j.3`, RA-3).

| # | predicado | resultado |
|---|---|---|
| **P-R1a** | ninguna de las 16 sin capturar estrena **plantilla** (`_tb_` con firma distinta de las ya censadas) | ⏳ |
| **P-R1b** | **0 tipos de contenido separan hubs de sueltas** como content type: los tipos exclusivos de un lado son **bloques de la misma unión**, no campos obligatorios distintos | ⏳ |

- **¬P-R1a** → R1 cae para esa página; se reabre CMS-3 por RA-3.
- **¬P-R1b** → hay frontera de content type; C4 recupera su argumento.

---

## 6 · LOS CASOS LEGALES QUE C3 ADMITE Y NADA EJERCITA

§*un campo que ADMITE un caso y que ningún dato de calibración EJERCITA es un
camino de render sin estrenar* (`CLAUDE.md`, `qa:nunca-vistos`). Declarados
**antes** de construir, para que no se descubran con el primer editor delante:

| caso legal en C3 | ¿lo ejercita el dato medido? |
|---|---|
| `bloques` **ausente o vacío** | **sí, 2 de 32** — y es la única razón de que sea opcional. Es el caso que **más** hay que probar en render, no el más raro |
| una página con **1 solo bloque** y sin fila | sí — `/es/aviso-legal/` y 8 más con 1 sección propia |
| **11 secciones** propias | sí, **2 de 32** (`/es/soporte/centro-de-ayuda/`, `/es/empresa/`) |
| un bloque `slider` **sin `slide`** dentro | **NO — 0 de 32.** Camino sin estrenar |
| un bloque `toggle` **fuera de un hub de KB** | **NO — 0 de 32.** `toggle` sólo aparece en KB |
| `video` **fuera de un hub de KB** | **NO — 0 de 32** |
| `map` en una página que **no** sea `/es/contacto/` | **NO — 1 de 32.** n=1: no hay con qué separar plantilla de campo (§FAMILIA DE CALIBRACIÓN) |
| `icon` fuera de `/es/soporte/` | **NO — 1 de 32** |
| dos bloques del **mismo tipo** en la misma columna | sin derivar — el censo v3 mide **presencia por página**, no repetición dentro de la página |
| una página que mezcle `toggle` **y** `code` | **NO — 0 de 32.** KB y sueltas no se solapan en tipos |

> ⚠ **`map`, `slider`, `icon` y `fullwidth_slider` se modelan desde 1 o 2
> instancias.** Eso es exactamente la **FAMILIA DE CALIBRACIÓN**: con n=1 no se
> puede separar lo que puso la plantilla de lo que escribió el editor, así que
> **sus campos se declaran SIN PROBAR y no se cablean** (§*una propiedad que no
> pasa NINGUNO de los dos tests está SIN PROBAR*). El sitio donde se ficha es el
> ESQUEMA, en la definición del bloque, no un acta.

---

## 7 · Lo que este pre-registro NO contesta

| pregunta | por qué no |
|---|---|
| la **forma** (campos) de cada uno de los 12 bloques | se mide al construir, contra el original **con sus hojas**. Hoy los 26 de 32 sin `et-cache` darían números plausibles y falsos |
| si la unión de C3 **reutiliza** `texto-kb`/`imagen-kb`/`boton-kb` o declara los suyos | es decisión de construcción; el precedente de `MODULOS_KB` autoriza las dos |
| **la geometría de las 32** | no se ha comparado ni un eje contra el original en **26 de las 32** (`COBERTURA-MEDICION`), y §*UN ARQUETIPO NUEVO NO HEREDA COBERTURA* obliga a un comparador de dos lados propio |
| ~~si las 16 sin capturar **siguen vivas** en el original~~ | ✅ **CONTESTADO el mismo día**: 13 × 301 · 3 × 404, dos lecturas separadas 13 días. Ya no es una incógnita |

---

## 8 · Registro

| | |
|---|---|
| **decisión** | **C3** — `ESQUEMA-CMS.md` §2j · CMS-3 |
| **escrito** | 2026-08-22, 91.ª tanda, **antes** de capturar las 16 y **antes** de construir |
| **evidencia de partida** | `derivaciones/modulos-f33-v4.mjs` + `mod-v4.log` · `inv-f33.log` · `css-f33.log` · `reg-f33.log` |
| **predicado que puede salir CONTRA la decisión** | se escribió **P-O1** (umbral **≥ 4** páginas de 0 secciones ⇒ RA-2 ⇒ C4 gana) y **quedó cerrado a favor el mismo día, sin celebrarse**: las 16 que podían moverlo no son páginas. **Los que siguen pudiendo tumbar C3 son RA-1 y RA-3**, y se miden sobre las 32 |
| **precondición** | ✅ **a cero (2026-08-22)**: `et-cache` **0 faltan** (32/32 páginas con todas sus hojas) · los «16 HTML» **no eran un hueco** |
| **evaluable** | **ya**: las 32 están capturadas **con sus hojas**, que es lo que faltaba para que una medida offline no fuera plausible-y-falsa |
