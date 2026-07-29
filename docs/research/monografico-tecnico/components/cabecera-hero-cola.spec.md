# Cabecera, hero y cola — qué se reutiliza de SECTOR, medido

> Medido el **2026-07-29** con `scripts/qa/mono-cabecera.mjs` y
> `mono-detalle.mjs`, que leen **EDAR, Petróleo, Urbano e Investigación en la
> MISMA corrida** y los dos anchos (1440×900 y 390×844 por device metrics).
> Comparar original contra original es lo único que responde "¿es el mismo
> componente?" sin depender de una spec escrita hace dos tandas.
> **Dos corridas a 1440, dispersión 0.** Decisión argumentada: `../DECISIONES.md` (b).

## Veredicto

| pieza | veredicto | trabajo nuevo |
|---|---|---|
| `CabeceraSector` | **reutiliza tal cual** | ninguno |
| `SectorHero` | **reutiliza con 2 campos nuevos** | `pb` de desktop + lista de módulos |
| `CtaBannerSlider` | **reutiliza tal cual** — y hereda S10 | ninguno (a resolver en la tanda de CLASE) |
| Banda de clientes · breadcrumb · bloque K · franja del pie | **reutilizan tal cual** | ninguno |
| `CtaDescarga` piel `"fondo"` | **reutiliza tal cual** | ninguno |
| `MapaProyectos` | **reutiliza tal cual** (solo EDAR) | ninguno |

## 1 · Cabecera — idéntica al céntimo

Todo lo que pinta `CabeceraSector` coincide en las **cuatro** páginas, en los dos
anchos:

| | valor @1440 | @390 |
|---|---|---|
| sección: `padding` | `0 0 40px` | `0 0 40px` |
| fila | 86% máx 1380 → 1238.39 | 335.39 |
| kicker: `margin-top` | **−13** | −13 |
| kicker: caja de línea | **30.59** (40px / 30.6, w700 `#fff`) | 30.59 |
| kicker: `margin-bottom` del módulo | **18.5625** | **5.01562** |
| `h1` | **30 / 36** w400 `#fff`, `padding-bottom: 10` | igual |
| `h1`: `x` · `y` · `w` | **100.8 · 261.16 · 619.19** | 27.3 · 189.39 · 335.39 |

Toda la diferencia de altura es **contenido**: 36px por línea de `h1`.

| | EDAR | Petróleo | Urbano | Investigación |
|---|---|---|---|---|
| kicker | `EDAR` | `Petróleo y Gas` | `Urbano` | `Investigación y consultoría` |
| líneas de `h1` @1440 / @390 | 2 / **4** | 2 / 3 | 1 / 2 | 1 / 3 |
| alto de sección @1440 | 433.61 | 433.61 | 397.61 | 397.61 |
| alto de sección @390 | **419.25** | 383.25 | 347.25 | 402.64 |

> **Dos instancias nuevas para la clase S11.** El `h1` de EDAR a 390 llega a
> **4 líneas**, el máximo medido del sitio; y el kicker de Investigación es el
> que envuelve a 2. Cuando se aborde la tanda de variabilidad, éstos son los
> extremos del rango: no hay que volver a buscarlos.

## 2 · Hero — mismo componente, dos campos nuevos

Lo idéntico (las cuatro páginas, los dos anchos):

| | @1440 | @390 |
|---|---|---|
| sección: `padding-top` | 57.5938 (4%) | 50 |
| fila: `padding-top` / `padding-bottom` | 0 / 28.7969 | 0 / 30 |
| fila: ancho | 1238.39 | 335.39 |
| columnas | `1_2 + 1_2` (585.13) | apiladas, 335.39 |
| columna izquierda | `punteado(22) · img · botón · botón` | ídem |
| botones | alto 74, `mb 16` el primero, 0 el segundo | ídem |
| `h2` | 37 / 37 w300, `padding-bottom: 10`, color por `<span>` | igual |

### Campo nuevo 1 · `padding-bottom` de la sección

| EDAR | Petróleo | Urbano | Investigación |
|---|---|---|---|
| **39** | **39** | 60 | 60 |

A **390 los cuatro valen 20**. Es decir: el hero lleva valores por breakpoint y
el de desktop es **el que distingue los dos arquetipos**. Confirmado en dos
corridas — es el dato que "ya costó dos versiones de sonda" y aquí queda cerrado.

### Campo nuevo 2 · la columna derecha es una LISTA de módulos

SECTOR monta **2** módulos de texto (claim + párrafos). El monográfico monta
**3**, y cada uno lleva su propio `h2` con su propio `<span style="color:…">`:

| | módulo 1 | módulo 2 | módulo 3 |
|---|---|---|---|
| **EDAR** | `h2` **`#0c71c3`** · h 47 · `mb 16` | `h2` `#0075c9` + 1 `p` · h 153.19 · `mb 34.0469` | `h2` `#0075c9` + 3 `p` · h 362.34 · `mb 0` |
| **Petróleo** | **VACÍO** · h **0** · `mb 16` | `h2` `#0075c9` + 3 `p` · h 364.75 · `mb 28` | `h2` `#0075c9` + 3 `p` · h 364.75 · `mb 0` |
| Urbano | `h2` `#0075c9` · h 121 · `mb 34.0469` | 5 `p` · h 592.09 · `mb 0` | — |
| Industria | `h2` `#0c71c3` · h 121 · `mb 34.0469` | 5 `p` · h 500.31 · `mb 0` | — |

Dos consecuencias que **no** se ven mirando una sola instancia:

1. **`hero.headingColor` (un color por página) no puede representar EDAR**: su
   primer `h2` es `#0c71c3` y los otros dos `#0075c9`, en la misma página. El
   color es **por titular**.
2. **El módulo vacío de Petróleo cuenta.** Altura 0, pero `margin-bottom: 16px`.
   Omitirlo del dato deja la página 16px corta del hero al pie — el residuo que
   después cuesta media tanda localizar.

Alturas de sección del hero @1440: EDAR **737.97** · Petróleo **898.89** ·
Urbano 893.53 · Investigación 862.94.

## 3 · Slider CTA de ancho completo — idéntico, y hereda S10

3 diapositivas, autoplay, `h2` **45 / 58.5** w300 `#fff` a 1440 y **27 / 35.1** a
390. Comportamiento en `docs/research/sectores/BEHAVIORS.md` §3.

| | @1440 | @390 |
|---|---|---|
| EDAR | **401.56** | **300.14** |
| Petróleo | **401.56** | **300.14** |
| Urbano | **401.56** | 265.06 |
| Investigación | **401.56** | 300.16 |
| **clon (alto cableado)** | — | **345.1** |

A 1440 el alto es constante y el clon acierta. A **390 lo pone el contenido**, y
el valor cableado del clon **no coincide con ninguna de las cuatro instancias
medidas**. Se reutiliza con el defecto dentro, a propósito: el HANDOFF pedía
sumar instancias a la tanda de variabilidad, y éstas son dos.

## 4 · `CtaDescarga` — es la piel `"fondo"`, sin una diferencia

Las dos páginas montan el shortcode `calls` con **exactamente** las clases,
paddings, fondo y medidas de Industria:

| | EDAR · Petróleo | Industria | Urbano (piel `"foto"`) |
|---|---|---|---|
| clases | `calls one-column call-fondo-blanco espacio-blanco-derecha` | **idénticas** | `… espacio-derecha … call-con-foto` |
| `padding` | `40px 60px` | `40px 60px` | `40px 50px` |
| fondo | `cta-informe-tecnico-industria-scaled` | **la misma** | ninguno (`<img>` de 280) |
| caja @1440 | 1238.39 × **419.97** | 419.97 | 1238.39 × 336.98 |
| caja @390 | 335.39 × **578.64** | 578.64 | — |
| fila que lo contiene | `pt 0`, `pb 2%` | — | — |

`variante: "fondo"`, y cero trabajo nuevo. Ojo al construir: aquí el bloque
entra como **módulo de una columna**, no como `SectorBlock` con `flujo` — el
ritmo lo ponen la fila y la sección (`MODELO.md` §4.3).

## 5 · Lo que NO se reutiliza

**`ClaimConFoto` no aparece en ninguna de las dos páginas.** Lo que la sonda de
árbol etiquetaba así es la fila de cierre comercial, que es **la misma en EDAR y
en Petróleo** hasta en los overrides:

```
columna 0:  h3 (mb 20) · h2 (padding-right 25) · párrafos · botón
columna 1:  imagen 390.08
fila:       pt 0 · pb 60 · reparto 1_2 + 1_2 · sin punteado en ninguna columna
```

Es una **sección editorial** normal y corriente (`seccion-editorial.spec.md`).
Que aparezca dos veces idéntica sugiere que quien edita la copia entre páginas,
no que sea un componente.
