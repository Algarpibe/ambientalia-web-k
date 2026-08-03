# GRUPO D · DECISIÓN — los cinco predicados, evaluados

> **2026-08-03.** Evalúa `PRE-REGISTRO-DECISION.md` (commit `effb473`, anterior a
> toda evaluación). Fuentes: `medidas/grupo-d-inventario.json` (13 páginas),
> `medidas/grupo-d-plantilla.json` (censo `_tb_`, la medida que P-R1 declaró
> pendiente — tomada y congelada en `982d9dc`, después del pre-registro),
> y los criterios ya decididos §1.5b y LH-2 D1.
>
> **Ningún predicado se sustituyó ni se reinterpretó.** Cada decisión de abajo es
> la rama que el pre-registro asignó al resultado que salió.

## P-R · Régimen — **NO hay tercer régimen: el régimen es propiedad de la CAPA**

| predicado | resultado |
|---|---|
| **P-R1** · varianza cero de la capa `_tb_` entre las 13 | ✅ **UNA sola firma** (`header · body · footer×3`) en las 13 · sidebar 13/13 · sticky 13/13 · `post_content` 13/13 |
| **P-R2** · la capa propia varía entre instancias | ✅ artículos: composición variable (`text` ×11…×15, `blurb` 0/18/36, `gallery` 0/2, `button` 0…3) · hubs: **secciones 1→11** |

**Rama del pre-registro: P-R1 ∧ P-R2 → no hay tercer régimen.** La hipótesis se
sostiene: el marcador del `<body>` **anuncia qué mecanismos están presentes**, y
el discriminador real es la **varianza entre instancias, capa a capa**. En el
grupo D conviven los dos mecanismos — capa `_tb_` a varianza cero (la fijó quien
construyó la plantilla: **lectura plantillada**) y capa propia variable (la
compuso quien editó la instancia: **lectura de builder**) — y por eso conviven
los dos marcadores.

> **`CLAUDE.md` no gana un casillero: gana una corrección que quita ambigüedad
> al que tiene** — «identifica el régimen de la página» pasa a «identifica el
> régimen de **cada capa**». El caso híbrido queda enunciado como composición de
> los dos regímenes existentes, no como uno nuevo. → aplicada en §Régimen.

Verificación cruzada del instrumento: la re-derivación de `propias` del censo
`_tb_` coincide con el inventario congelado **en las 13** (0 desacuerdos).

## P-H · El hub — **casillero L4 de LH-2: página compuesta, cola larga**

| predicado | resultado |
|---|---|
| **P-H1** · cuerpo emitido por plantilla con módulo de consulta (firma LISTADO-B) | ❌ **NO** — kinds de los hubs: `video`/`toggle`/`text`/`image`/`button`, **cero módulos de consulta**. El instrumento los ve: en el control EDAR el kind `blog` SÍ aparece |
| **P-H2** · oscilan en secciones propias | ✅ **1 · 1 · 5 · 5 · 7 · 7 · 11** |

**Rama del pre-registro: ¬P-H1 ∧ P-H2 → el hub de KB NO es un listado de §2c y
NO es una tercera cosa: es el casillero L4 que LH-2 ya decidió** — «hubs de
builder que oscilan = página compuesta por instancia = cola larga, **cero
arquetipos de listado**». La única diferencia con los 6 hubs de LH-2 es el
cascarón con barra lateral, que ya está fichado como plantilla (13/13).

El matiz pre-registrado se respeta: las parejas casi calcadas (los dos
`articulos-de-ayuda`: `toggle×2 text×1 image×1`) se anotan como **sub-formas de
página compuesta** y no se convierten en colección por parecido — la misma
decisión que LH-2 tomó para sus 6, que también se parecían.

## P-C · ¿Una colección o dos? — **UNA: artículos. Los hubs quedan FUERA de colección**

| predicado | resultado |
|---|---|
| **P-C1** · kinds distintos en las dos direcciones | ✅ artículos → `blurb`/`gallery` que los hubs no piden como forma · hubs → `video`/`toggle` que ningún artículo usa |
| **P-C2** · cascarón distinto | ✅ artículos varianza **0** (1 sección las 6) · hubs **1→11** |

**Rama del pre-registro — con la dependencia declarada activada:** P-C1 ∧ P-C2
confirman que artículo y hub **no comparten colección jamás**; y como P-H
concluyó **L4**, la pregunta «¿dos colecciones?» **se disuelve**:

> **Colecciones nuevas: UNA — `articulos-kb` (6 instancias, forma uniforme:
> 1 sección propia, cuerpo de texto/imagen/botón/blurb/gallery).**
> **Los 7 hubs van a la cola larga de páginas compuestas**, con los 6 de LH-2 —
> ni colección, ni arquetipo de listado, ni content type propio ahora.

El criterio de §1.5b aplicó tal cual (fricción en las dos direcciones +
«separar después es mucho más caro que fusionar después»); no hubo que
argumentar por qué no valía.

## P-K · Los 4 kinds — **tipo PROPIO por arquetipo; `MonoSeccion[]` no se toca**

| predicado | resultado |
|---|---|
| **P-K1** · alguno de los 4 aparece en SECTOR/MONOGRÁFICO medidos | ❌ **NO** — controles: `text`/`image`/`button`/`slide`/`code`/`map`/`fullwidth_slider`/`blog`. Ni `blurb`, ni `video`, ni `toggle`, ni `gallery` |
| **P-K2** · el grupo D reutiliza kinds y ritmo existentes | ✅ 3 de 6 artículos solo usan texto/imagen/botón; `MonoRitmo` cubre el ritmo |

**Rama del pre-registro: ¬P-K1 ∧ P-K2 → los 4 kinds viven en tipo propio del
arquetipo que los necesita, reutilizando por definición compartida lo común.**
En concreto:

- **`blurb` y `gallery`** → en el content type de **`articulos-kb`** cuando se
  construya (su unión de módulos propia, p. ej. `KbModulo`), con las
  definiciones comunes (texto, imagen, botón, ritmo) **exportadas y
  compartidas** — el patrón de §1.5b: *lo que se duplica es el documento, no la
  definición*.
- **`video` y `toggle`** → pertenecen a los hubs, que son **cola larga**: su
  modelo se decide cuando se decida la cola larga, no aquí. Anotarlos ahora en
  ningún content type sería modelar páginas que no se ha decidido construir.
- **Ninguno entra a `MonoModulo`**: existirían ahí solo por la unión, que es el
  arreglo falso de §1.5b Razón 1. La prohibición del §6 del pre-registro de la
  hipótesis queda **ratificada como decisión**, ya no como cautela.

## P-M · D2/D3 — **D1 BASTA. Se cierran como SIN OBJETO, no como «no se pudo»**

| predicado | resultado |
|---|---|
| **P-M1** · D2/D3 son confirmatorios de HD1 y su objeto desapareció con ella | ✅ — medirlos exigiría construir con los 4 kinds añadidos, o sea medir **otro modelo** distinto del que HD1 nombraba |

**Rama del pre-registro: D1 basta y se escribe que basta.** La construcción
mínima como instrumento **no se autoriza**: no compra información para ninguna
decisión de esta tanda. Y la vuelta del píxel queda pre-registrada por la vía
estándar: cuando `articulos-kb` se construya, **un arquetipo nuevo no hereda
cobertura** — sonda comparadora de dos lados propia, no un D2/D3 resucitado.

---

## Resumen ejecutable de la tanda

| pregunta | decisión |
|---|---|
| régimen | **no hay tercero**: régimen por CAPA; híbrido = plantillado (capa `_tb_`) + builder (capa propia) |
| hub de KB | **L4 de LH-2**: página compuesta, cola larga, cero arquetipos |
| colecciones | **UNA nueva: `articulos-kb`** · hubs fuera de colección |
| los 4 kinds | tipo propio por arquetipo (`blurb`/`gallery` → `articulos-kb`; `video`/`toggle` → con la cola larga) · **`MonoSeccion[]` intacto** |
| D2/D3 | **SIN OBJETO** — D1 bastó; el píxel vuelve con la sonda propia del arquetipo cuando se construya |

**Lo que esta tanda NO decide:** cuándo se construye `articulos-kb` (prioridad,
no información) y qué modelo tendrá la cola larga de páginas compuestas — que
ahora incluye 6 hubs de LH-2 + 7 hubs de KB, **y ya se sabe que `MonoSeccion[]`
solo no la cubre** (HD1 rechazada les alcanza: usan `video`/`toggle`).
