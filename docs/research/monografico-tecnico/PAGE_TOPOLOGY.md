# PAGE_TOPOLOGY.md — arquetipo MONOGRÁFICO TÉCNICO

> **Recon en frío + fase de specs, 2026-07-29. No se ha escrito código.**
> Instancias vivas: `…/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/`
> y `…/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/`.
> Medido a **1440×900** y **390×844** (device metrics), DPR 1, con
> `scripts/qa/mono-{modulos,cabecera,detalle,inline}.mjs`. Salida congelada en
> `scripts/qa/medidas/mono-*.json`.
> **Dos corridas a 1440 con dispersión 0** (docH 11136 / 11303, `h1` en y 261.16
> en las cuatro páginas): la base de lectura del protocolo se cumple.

## Cómo leer este documento

La primera versión de este recon (mismo día, antes de medir) se escribió con la
sonda `tree-todos.mjs`, que **se para en la fila** y adivina el tipo de bloque
por una huella. Tres de sus conclusiones eran incorrectas y están **corregidas
abajo, con la marca `⚠ CORRIGE`**. Se dejan visibles a propósito: el error no
fue de descuido, fue mirar la etiqueta de un heurístico en vez de los módulos, y
es exactamente el error que este arquetipo invita a repetir.

## Por qué tiene nombre propio y no lleva "sector" dentro

Estas dos páginas **cuelgan de `/sectores/`** en el original y aparecen en el
mega-menú junto a las otras seis. Es la única cosa que comparten en la URL.

Son **monográficos técnicos**: una pieza larga de contenido divulgativo con
apartados propios ("¿Qué gases se deben medir en una EDAR?", "Tabla resumen:
procesos y emisiones", "Cómo funciona la solución") que **termina** con la cola
comercial del arquetipo SECTOR. El sector es el pie de la página, no su forma.

## 0. ¿Son dos instancias del mismo arquetipo, o uno y su primo?

**Son dos instancias del mismo arquetipo.** La pregunta se hizo antes de
construir —y no después, como pasó con Construcción e Investigación en SECTOR— y
la respuesta está medida, no inferida por parecido.

El test que importa no es "¿tienen las mismas piezas?" —no las tienen— sino
**"¿el esqueleto es el mismo y las diferencias son carga?"**:

| | EDAR | Petróleo y gas | ¿mismo? |
|---|---|---|---|
| Cabecera (kicker + h1 sobre foto) | ✓ | ✓ | **idéntica al píxel**, ver §3 |
| Hero 1/2+1/2 con `pb 39` | ✓ | ✓ | **sí, y difiere de SECTOR** (60) |
| Cuerpo = secciones → filas → columnas → pila de módulos | 3 sec / 10 filas | 3 sec / 9 filas | **sí** |
| Overrides en px absolutos, defaults responsive (§2) | ✓ | ✓ | **sí** |
| Cola (slider 3 diapositivas + bloque K + franja) | ✓ | ✓ | sí |
| **`<table>`** | 1 | **0** | no |
| **serie de `h4`** | 0 | **13 `h4` en 3 módulos** | no |
| `mapaProyectos` | ✓ | ✗ | no |

Las tres últimas filas son las que hacían dudar, y son justo las que **no**
deciden: son **tipos de módulo dentro de la pila**, no variantes del arquetipo.
Cada página trae un payload que a la otra le falta —EDAR la tabla, Petróleo la
serie de `h4`— y eso es la definición de *flexible content*, no la de dos
arquetipos. El caso análogo ya resuelto en el repo: Investigación no lleva
`ctaDescarga` y nadie propuso un arquetipo nuevo por eso.

**Lo que sí habría cambiado el veredicto**, y se comprobó que no ocurre:

- que el esqueleto sección→fila→columna→módulo fuese distinto (es el mismo);
- que la serie de `h4` fuese un módulo Divi propio —un `blurb`, una lista
  con estilo— y no texto dentro de un `et_pb_text` (es texto: §4.1);
- que la cabecera o el hero difiriesen entre las dos (no difieren).

## 1. Lo que comparten con SECTOR — medido, no supuesto

| pieza | ¿igual que SECTOR? | evidencia |
|---|---|---|
| cabecera de foto + kicker + h1 | **idéntica** | §3 |
| banda de clientes · breadcrumb | sí | sin cambios |
| hero 1/2 + 1/2 | **misma estructura, dos campos distintos** | §3 |
| CTA de ancho completo (3 diapositivas) | **idéntico a 1440; a 390 el alto lo pone el contenido** | §3 |
| bloque K (soluciones · proyectos · artículos) · franja del pie | sí | sin cambios |
| `ctaDescarga` (shortcode `calls`) | **idéntico a la piel `"fondo"` de Industria** | §4.3 |
| `beneficiosAplicaciones` | **es un caso degenerado de la sección editorial** | §4.4 |
| `mapaProyectos` | igual (solo EDAR) | §4.3 |
| `claimConFoto` | **NO aparece en ninguna de las dos** | ⚠ CORRIGE |

> ⚠ **CORRIGE — «la última sección del cuerpo es un cuerpo de SECTOR completo».**
> No lo es. Lo que el heurístico etiquetó `claimConFoto` en las dos páginas es
> otra cosa: una fila `h3 (mb 20) · h2 (pr 25) · párrafos · botón | foto`, la
> **misma en las dos páginas** hasta en los overrides. `claimConFoto` es un
> párrafo de 37px azul sin titular ni botón, y no aparece en ninguna instancia
> del monográfico. De la cola de SECTOR solo se reutilizan `ctaDescarga`,
> `mapaProyectos` y —vía sección editorial— `beneficiosAplicaciones`.

## 2. El hallazgo que gobierna todo el modelo

**En Divi, lo que el editor NO toca es responsive; lo que toca queda en px
absolutos, idénticos en los dos anchos.** Medido en las 19 filas, las 6
secciones y los ~60 módulos de las dos páginas, sin una excepción:

| nivel | default (template) | override (editorial) |
|---|---|---|
| sección `pt`/`pb` | 4% → **57.5938 / 50** | 40 · 14 (px, iguales a 1440 y 390) |
| sección `mt` | 0 | −14 |
| fila `pt`/`pb` | 2% → **28.7969 / 30** | 2 · 36 · 40 · 60 · 72 · 0 |
| módulo `mb` | 2.75% → **34.0469 / 30** | 16 · 17 · 20 · 23 · 26 · 28 · 30 · 41 |
| módulo de imagen `mb` | 3% → **37.1406 / 10.0469** | — |
| último módulo de la columna | **0** | — |

Esto **es la prueba de laboratorio que separa estructura de contenido**, y es
objetiva: se mide a dos anchos y se mira si el número se mueve.

- Si el valor **cambia con el ancho** → lo pone la plantilla → vive en el
  componente.
- Si el valor **es el mismo a 1440 y a 390** → lo escribió una persona en el
  builder → **es un campo**.

Es el mismo criterio que ya funcionó en S7 (`flujo`) y en S4 (`variante`),
pero por primera vez con un discriminador que no depende del juicio de nadie.

## 3. Cabecera, hero y cola: qué se reutiliza (medido)

Detalle completo y la decisión argumentada en
`components/cabecera-hero-cola.spec.md`. Resumen:

| | EDAR | Petróleo | Urbano | Investigación |
|---|---|---|---|---|
| alto de cabecera @1440 | 433.61 | 433.61 | 397.61 | 397.61 |
| alto de cabecera @390 | 419.25 | 383.25 | 347.25 | 402.64 |
| líneas del `h1` @1440 / @390 | 2 / 4 | 2 / 3 | 1 / 2 | 1 / 3 |
| `hero` `padding-bottom` @1440 | **39** | **39** | 60 | 60 |
| `hero` `padding-bottom` @390 | 20 | 20 | 20 | 20 |
| módulos de texto del hero (col. dcha.) | **3** | **3** | 2 | 2 |
| slider @1440 / @390 | 401.56 / 300.14 | 401.56 / 300.14 | 401.56 / 265.06 | 401.56 / 300.16 |

- **La cabecera es el MISMO componente.** Kicker (`mt −13`, caja 30.59,
  `mb 18.5625 / 5.01562`, 40px/30.6 w700) y `h1` (30/36, `pb 10`, x 100.8,
  y 261.16, w 619.19) coinciden **al céntimo en las cuatro páginas**. Toda la
  diferencia de altura la explica el número de líneas del `h1`: 36 por línea.
  Es una instancia más de la clase S11, no una cabecera distinta.
- **El hero es el mismo componente con dos campos distintos**: el `pb` de
  desktop (39 vs 60; a 390 los cuatro valen 20) y **cuántos módulos de texto**
  monta la columna derecha (3 vs 2).
- **El slider es el mismo componente** y **hereda S10**: a 1440 mide 401.56 en
  las cuatro; a 390 lo pone el contenido y ahora hay cuatro lecturas
  (265.06 · 300.14 · 300.14 · 300.16) frente al **345.1 cableado en el clon**.
  Dos instancias nuevas para la tanda de variabilidad, que es justo lo que
  pedía el HANDOFF.

## 4. El cuerpo: un solo tipo de bloque, y tres payloads nuevos

> ⚠ **CORRIGE — «la sección editorial es un 6º tipo de bloque con esta forma:
> h3 antetítulo / h2 titular / cuerpo / img / botón».** Ni el orden ni los
> papeles eran correctos:
>
> | decía el recon | mide la salida servida |
> |---|---|
> | `h3` es el antetítulo/eyebrow | **`h3` es el TITULAR: 44/55 → 35/43.75 a 390** |
> | `h2` es el titular | **`h2` es el claim azul: 37/37, con `<span style="color:#0075c9">`** |
> | «en 1 o 2 columnas, con la foto a un lado o debajo» | **6 repartos de columna distintos** (§4.2) |
> | es un bloque con campos fijos | es **una fila de columnas, cada una con una pila ordenada de módulos** |

### 4.1 Los tres payloads que el modelo actual no sabe pintar

| payload | dónde | qué es en la salida servida |
|---|---|---|
| **`<table>`** | EDAR, 1 vez | HTML escrito a mano dentro de un `et_pb_text`, con `style` inline. 4 columnas × 8 filas + `thead`. Detalle: `components/tabla-resumen.spec.md` |
| **serie de `h4`** | Petróleo, 2 módulos (5 y 7 pares) | **NO es un `blurb` ni una lista**: son pares `h4 + p` dentro de UN `et_pb_text`, los dos con `style="padding-left: 40px"` inline y el `h4` con `<span style="color:#0075c9">`. Sin marcador `::before` (`content: none`) |
| **dos pares titular+texto en una fila** | EDAR S1F0 | **no es un payload**: es una fila de 2 columnas donde **las dos** llevan pila de contenido en vez de foto. Sale gratis con el modelo de §4.2 |

Y un cuarto, menor: un `h4` **suelto** (Petróleo, "Red de sensores → Red de
comunicaciones → Plataforma de análisis") **sin** el `padding-left: 40px`. El
indentado pertenece a la serie, no al `h4`.

### 4.2 Inventario medido (@1440; el reparto de columnas es idéntico @390)

Notación: `punt` = módulo del punteado · `h3` titular · `h2` claim ·
`txt` módulo de párrafos/listas · `img` · `btn` · `serie` · `tabla` · `calls` ·
`mapa`. Entre paréntesis, los overrides.

**EDAR** — 3 secciones, 10 filas:

| fila | sección | reparto | `pb` fila | columna 0 | columna 1 |
|---|---|---|---|---|---|
| S0F0 | suelta | 1_2 + 1_2 | **60** | punt · h3 · txt(h2+ul, mb41) | img |
| S0F1 | | 4_4 | **72** | punt · h3 · txt(h2+p+ul) | — |
| S0F2 | | 4_4 | — | punt · h3 · h2 · img | — |
| S0F3 | | 4_4 | — | punt · h2 · **tabla** | — |
| S0F4 | | 1_4 + 3_4 | — | punt · img | h3(pb15) · h2 · txt(ul+p) · btn |
| S1F0 | suelta | 1_2 + 1_2 | — | punt · h3 · txt(h2+p+p) | punt · h3 · txt(h2+p) |
| S2F0 | **`seccion`** | 1_2 + 1_2 | — | punt · h3 · ul | punt · h3 · ul |
| S2F1 | | 1_2 + 1_2 | **60**, `pt 0` | h3(mb20) · h2(pr25) · p · btn | img |
| S2F2 | | 4_4 | `pt 0` | **calls** | — |
| S2F3 | | 4_4 | — | punt · txt(h2+p, mb17) · **mapa** | — |

**Petróleo y gas** — 3 secciones, 9 filas:

| fila | sección | reparto | `pb` fila | columna 0 | columna 1 |
|---|---|---|---|---|---|
| S0F0 | suelta (`pb 40`) | 1_3 + 2_3 | **40** | punt · img | h3 · txt(h2+p, pb23) · **serie×5** (pb23) |
| S0F1 | | 1_2 + 1_2 | **2** | punt · h3 · h3(claim) · ul · h2 · btn | img |
| S1F0 | suelta | 1_2 + 1_2 | **60** | punt · h3 · h2(mb41) · txt(p+ul+p, mb41) · btn | img |
| S1F1 | | **3_5 + 2_5** | **36** | punt · h3(mb26) · h2(mb41) · txt(p+ul+p) | img |
| S1F2 | | 1_3 + 2_3 | — | punt · img · btn | h3 · p(mb30) · **serie×7** (pb23) |
| S1F3 | | **2_3 + 1_3** | **60** | punt · h3(mb23) · h2(mb41) · txt(p+p+ul+p+p, mb41) · btn | img |
| S1F4 | | 4_4 | — | punt · h3 · h4 · txt(p+p, mb41) | — |
| S2F0 | **`seccion`** | 1_2 + 1_2 | **60**, `pt 0` | h3(mb20) · h2(pr25) · txt(p+p) · btn | img |
| S2F1 | | 4_4 | `pt 0` | **calls** | — |

**Seis repartos de columna** en 19 filas (anchos @1440, gutter 5.5% = `mr 68.1094`):

| reparto | anchos | dónde |
|---|---|---|
| `4_4` | 1238.39 | EDAR ×4 · Petróleo ×2 |
| `1_2 + 1_2` | 585.13 + 585.13 | EDAR ×4 · Petróleo ×3 |
| `1_3 + 2_3` | 367.38 + 802.88 | Petróleo ×2 |
| `2_3 + 1_3` | 802.88 + 367.38 | Petróleo ×1 |
| `1_4 + 3_4` | 258.5 + 911.75 | EDAR ×1 |
| `3_5 + 2_5` | 715.78 + 454.48 | Petróleo ×1 |

A 390 **todas** apilan en orden de DOM: la columna de foto queda arriba o abajo
según su posición, sin campo extra.

### 4.3 Lo que se reutiliza tal cual

- **`calls`**: las dos páginas montan `calls one-column call-fondo-blanco
  espacio-blanco-derecha`, `padding 40px 60px`, **misma imagen de fondo** que
  Industria (`cta-informe-tecnico-industria-scaled`), 1238.39×419.97 a 1440 y
  335.39×578.64 a 390. Es **exactamente `variante: "fondo"`**, sin un píxel de
  diferencia. Cero trabajo nuevo.
- **`mapaProyectos`** (solo EDAR): igual que en SECTOR, con su cabecera
  `h2 + p` (`mb 17`) encima.

### 4.4 `beneficiosAplicaciones` es un caso degenerado de la sección editorial

EDAR S2F0 es, módulo a módulo, `punt · h3 · ul` en las dos columnas — que es lo
que pinta `BeneficiosAplicaciones`. **No hay nada en ese bloque que la sección
editorial no exprese.** Lo mismo vale para `listaSimple2Col`. Es el indicio más
fuerte de que la contención de la observación 1 del HANDOFF va en la dirección
contraria a la que se pensó: no es que MONOGRÁFICO contenga un cuerpo de SECTOR
al final, es que **el cuerpo de SECTOR es un subconjunto del cuerpo de
MONOGRÁFICO**. Eso es lo que somete a prueba `EXPERIMENTO-URBANO.md`.

## 5. El punteado es un campo, no un adorno del componente

`punteado.svg`, 60×22, colgando **−65px a la izquierda de la fila** (x 35.8 con
la fila en 100.8 a 1440; −37.7 con la fila en 27.3 a 390), `mb 34.0469 / 30`.
Es el mismo elemento que ya aparece en `/accesorios` y en
`BeneficiosAplicaciones`, donde está **cableado dentro del componente**.

En el monográfico su presencia varía por columna, y el mapa es idéntico a 1440 y
a 390:

| | columnas | con punteado |
|---|---|---|
| EDAR | 15 | 10 |
| Petróleo | 16 | **7 — siempre la columna 0, nunca la 1** |
| Urbano | 5 | 2 |
| Industria | 8 | 3 |

Petróleo lo pone en la columna izquierda **aunque sea la de la foto** (S0F0C0,
S1F2C0). EDAR lo pone en las dos columnas cuando las dos llevan contenido
(S1F0). No hay regla de plantilla que produzca los dos repartos: **es un
booleano por columna**.

## 6. Consecuencia para el CMS

Se mantiene la recomendación del recon en frío —**arquetipo aparte**— pero por
una razón más precisa que "el modelo de SECTOR se rompe en tres sitios":

El content type de MONOGRÁFICO **no es una lista de bloques con campos fijos**:
es una lista de **secciones** → **filas** → **columnas** → **pila de módulos**,
con los overrides de §2 como campos opcionales en cada nivel. Es más general que
el de SECTOR y probablemente lo contiene. Meterlos en el mismo content type hoy
sería correcto o sería un desastre según el resultado del experimento, y **el
experimento se corre después de construir, no antes** (§`EXPERIMENTO-URBANO.md`).

## 7. Lo que este recon deja abierto

1. **Cuántas instancias más va a haber.** Siguen siendo 2 de 8 y las dos más
   recientes. Sin resolver: no hay dato público que lo diga.
2. **Una excepción tipográfica sin explicar**: el `ul` de Petróleo S0F1C0
   computa `line-height: 36px` donde todos los demás dan 30.6. No es `style`
   inline (medido). Es un override de módulo Divi; se replica como dato y se
   anota, no se investiga más.
3. **Los textos verbatim del cuerpo** no se transcriben en las specs: son dos
   piezas largas y su sitio es `src/lib/monografico.ts`. La tabla sí va
   verbatim en su spec, porque es el payload con riesgo de transcripción.
