# PRE-REGISTRO · el recuento de rutas de E1 — escrito ANTES de construir

> **99.ª tanda, 2026-08-24.** Se commitea **antes** de tocar una sola ruta, que
> es lo único que lo convierte en un pre-registro y no en una explicación.
>
> Derivación: `derivaciones/f33-prerregistro-rutas.{mjs,log}`.

## Por qué esto se deriva y no se estima

Este repo **ya falló esta predicción**: escribió «374 → 375» y el build emitió
otra cosa, porque `/glosario` pagina **8** páginas. La lección no es «cuenta
mejor», es que

> **un documento nuevo no siempre es UNA ruta nueva**, y cuando no lo es, **el
> build no da error: da otro número**.

Así que el total no se obtiene sumando 31. Se contestan **tres** preguntas, cada
una con su cardinal, y la tercera es la que produjo aquel fallo.

## La unidad, declarada

**El total se cuenta en la unidad de `manifiesto.mjs`** (`rutasEmitidas()`:
descarta `/_*` y todo lo que lleve un punto), no en claves del
`prerender-manifest`:

| unidad | hoy |
|---|---|
| claves de `prerender-manifest.json` | **385** |
| **`rutasEmitidas()` — la que publican las sondas** | **382** |

Las dos son ciertas. Sólo la segunda es comparable con lo que el repo cita, y
mezclarlas es §*un mismo conjunto puede tener DOS CARDINALES CIERTOS A LA VEZ*.

## Las tres preguntas

### 1 · ¿cuántas RUTAS produce el catálogo? — **31**

Derivado de **la DB**, que es lo que `generateStaticParams` va a leer, no de la
congelada del 2026-08-22:

| | |
|---|---|
| documentos en `paginas` | **31** |
| **rutas distintas** (`/` + `[prefijo, slug]`) | **31** |
| duplicadas entre ellas | **0** |

`31 documentos = 31 rutas` **es un resultado, no un supuesto**: `paginas` no
pagina, no tiene series y no tiene variantes por ruta.

### 2 · ¿alguna choca literalmente con lo que se emite HOY? — **0 de 31**

Cruzadas contra las **382** rutas del build actual: **0 colisiones literales**.

⚠ Y esto **se re-derivó hoy**, no se citó de la 94.ª: aquel `0` era contra el
build de entonces, y `/[slug]` ha pasado de 186 a **189** por el camino. Un cero
heredado es un cero de otra fecha.

### 3 · ¿repagina alguna familia EXISTENTE? — **no, y así se comprueba**

Es la pregunta del «374 → 375», y **no se ve mirando las rutas nuevas**: se ve
mirando **quién lee el catálogo nuevo**.

| familia paginada | cardinal | come de |
|---|---|---|
| `/blog/page/[n]` | 7 → **7** | `entradasBlog` |
| `/etiqueta/[slug]/page/[n]` | 24 → **24** | `etiquetas` |
| `/glosario/page/[n]` | 7 → **7** | `terminosKunakpedia` |
| `/scientific-category/[slug]/page/[n]` | 3 → **3** | `categoriasCientificas` |

**Ninguna lee `paginas`** — `grep` sobre `apps/web/src`: **0 referencias**. Ésa
es la comprobación; si mañana alguien hace que un listado consulte `paginas`,
**este número deja de valer** y hay que re-derivarlo.

## LA PREDICCIÓN

> ### **382 → 413**

Y **no se registra sólo el total**, porque un total absorbe (§*la causa común: el
NIVEL al que se mide*). El reparto por plano es lo que hace auditable el fallo:

| plano | antes | **después** | + |
|---|---|---|---|
| `/[slug]` | 189 | **208** | +19 |
| `/centro-de-ayuda/[...ruta]` | 5 | **9** | +4 |
| `/soporte/[...ruta]` | 1 | **5** | +4 |
| `/recursos/[...ruta]` | 41 | **44** | +3 |
| **`/empresa/premios-y-reconocimientos`** (ruta nueva) | 0 | **1** | +1 |
| resto de familias | 146 | **146** | 0 |
| **TOTAL** | **382** | **413** | **+31** |

## Qué cuenta como fallo de esta predicción

**CORTE LIMPIO 1: si el recuento no cuadra, se adjudica ANTES de seguir.** Y
«cuadrar» se define aquí, no después:

| resultado | lectura |
|---|---|
| **413 y los 5 planos con su reparto exacto** | la predicción se cumple |
| **413 con el reparto distinto** | ⚠ **FALLO** — dos errores compensándose es el caso que un total no puede ver |
| **≠ 413** | **FALLO**, y se adjudica por plano antes de tocar nada |

> **Una ruta de más o de menos es un catálogo despachando lo que no debe**, y eso
> no se descubre después.

## Lo que este pre-registro NO afirma

- **no afirma que el universo de 31 esté verificado.** La DB y la congelada
  `f33-rutas.json` coinciden en 31, y eso dice que **los dos leen el mismo
  universo** — no que el universo sea correcto (§regla 15: *un cruce entre dos
  instrumentos que comparten premisa no verifica la premisa*). Los dos vienen
  del mismo corpus sembrado. Quien verifica la membresía es `qa:f33-membresia`,
  con su diferencia simétrica y su sabotaje `cardinal`;
- **no afirma nada sobre el CONTENIDO servido.** 413 rutas emitidas y 413
  páginas con contenido son dos afirmaciones distintas, y ninguna guarda de
  recuento distingue la segunda (§*una ruta que responde 200 no prueba que sirva
  contenido*). Eso es ESCALÓN 3.
