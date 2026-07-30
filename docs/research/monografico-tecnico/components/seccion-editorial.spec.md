# SecciónEditorial — el cuerpo del MONOGRÁFICO

> ## ⚠ CORRIGE — seis cosas que esta spec daba por plantilla y son CAMPO
>
> **Escrito al construir (2026-07-29), midiendo el clon contra el original
> módulo a módulo con `scripts/qa/mono-cmp.mjs`.** Se dejan arriba y no al final
> porque quien abra este fichero para construir una tercera instancia leería
> primero lo viejo.
>
> La spec se escribió mirando **el ritmo** —donde el discriminador de Divi
> funciona— y extendió esa conclusión a **la tipografía y la caja**, donde no
> aplica. El discriminador separa *ritmo por defecto* de *ritmo escrito*; no
> clasifica cualquier propiedad. Lo que delata a estas seis es lo de siempre:
> **varían de un módulo a otro dentro de la misma página**.
>
> | decía la spec | mide la salida servida | coste de creerla |
> |---|---|---|
> | el `titular` ocupa el ancho de su columna | **ancho de módulo: 70 · 80 · 90 · 100 %** — los `titular` van al 80 y envuelven a 3 renglones | **−55 por instancia**, 10 instancias |
> | `p` y `li` a 18/**30.6** | `line-height` **por módulo**: 30.6 · 36 · **45** | hasta −77 en un módulo |
> | `claim` h3 a **44/55** | **32/32** | −12 de cuerpo en esa fila |
> | la tabla va **sin bordes** (`border-bottom-width: 0`) | `border: 1px solid #333` + `border-top` en `th`/`td`, y `margin-bottom: 48px` | **−58** en la fila de la tabla |
> | módulo de imagen: `mb` **3%** | el default es **2.75%**, como todo lo demás; el 3% lo lleva **una** imagen | ±37 |
> | último módulo de la columna → `mb 0` | **la rompen 12 módulos**, 7 de ellos botones | +16 en siete filas |
>
> Y dos que la spec no menciona porque no se buscaron:
>
> - **`<strong>` en línea, 56 bloques**, y no siempre al principio de la frase.
>   La negrita es más ancha: sin ella un `li` de Petróleo salía a 3 renglones
>   donde el original va a 4 (**−30.59 a 390**, invisible a 1440).
> - **El hueco entre columnas apiladas a 390** no es "30 salvo la última": la
>   primera columna de la fila de cierre comercial va a **0** en las dos
>   páginas.
>
> El modelo resultante, con cada campo y su medida, está en
> `src/lib/monografico.ts`. Lo demás de esta spec —retícula, punteado, ritmo de
> sección y fila, los tres payloads— se confirmó exacto.


> Medido el **2026-07-29** en EDAR y Petróleo y gas a **1440×900** y **390×844**
> (device metrics), DPR 1, perfil limpio, Cookiebot bloqueado, lazy→eager +
> scroll/settle. Sondas `scripts/qa/mono-modulos.mjs` y `mono-inline.mjs`;
> salida congelada en `scripts/qa/medidas/mono-modulos-{1440,390}.json`.
> **Dos corridas a 1440 con dispersión 0.**
> Modelo de datos: `../MODELO.md`. Decisiones: `../DECISIONES.md`.

## Qué es

**No es un bloque.** Es el árbol de Divi del cuerpo, con cuatro niveles:

```
sección   (ritmo vertical; abre y cierra bloques de página)
└─ fila   (retícula 86% máx 1380, gutter 5.5%)
   └─ columna  (token de ancho Divi + punteado opcional)
      └─ módulo  (titular · claim · texto · serie · tabla · imagen · botón · calls · mapa)
```

**13 de las 19 filas** de las dos páginas son esto. Las 6 restantes son
`ctaDescarga` (2), `mapaProyectos` (1) y tres filas que también son esto, solo
que con la pila de módulos que hace de cierre comercial.

> ⚠ La huella heurística de `tree-todos.mjs` etiqueta casi todas estas filas
> como `claimConFoto`, porque su firma es "lleva `<img>` y pocos `<p>`". **No lo
> son.** `claimConFoto` es un párrafo de 37px azul sin titular ni botón, y **no
> aparece en ninguna de las dos páginas**. Construir mirando la etiqueta en vez
> de los módulos es el error que este arquetipo invita a cometer.

## 1 · Ritmo — la regla que lo gobierna todo

En Divi, **lo que el editor no toca es responsive; lo que toca queda en px
absolutos, iguales a 1440 y a 390.** Sin una excepción en 19 filas, 6 secciones
y ~60 módulos:

| nivel | propiedad | default (plantilla) | overrides medidos (editorial) |
|---|---|---|---|
| sección | `margin-top` | `0` | `−14` |
| sección | `padding-top` | **4% → 57.5938 / 50** | — |
| sección | `padding-bottom` | **4% → 57.5938 / 50** | `40` · `14` |
| fila | `padding-top` | **2% → 28.7969 / 30** | `0` |
| fila | `padding-bottom` | **2% → 28.7969 / 30** | `2` · `36` · `40` · `60` · `72` |
| módulo de texto | `margin-bottom` | **2.75% → 34.0469 / 30** | `17` · `20` · `23` · `26` · `28` · `30` · `41` |
| módulo de imagen | `margin-bottom` | **3% → 37.1406 / 10.0469** | — |
| módulo de botón | `margin-bottom` | **16** (fijo, los dos anchos) | — |
| último módulo de una columna | `margin-bottom` | **0** | — |
| módulo | `padding-bottom` | `0` | `15` · `23` |
| módulo | `padding-right` | `0` | `25` |

**Cómo se aplica en el componente:** el ritmo por defecto vive en el componente;
cada override es un campo opcional que, si viene, se pinta como px absolutos en
los dos anchos (`pb-[60px]`, sin variante `md:`).

### Las dos formas de sección que le faltaban a `flujo`

El enum de 4 valores de `SectorBlockFlujo` se dedujo de los 6 sectores clásicos.
Aquí aparecen otras dos — y la lectura correcta es que **no son formas nuevas,
son la ausencia de overrides**:

| forma | `mt` | `pt` | `pb` | qué es en realidad |
|---|---|---|---|---|
| `seccion` (SECTOR) | −14 | 4% | 14 | sección **con** dos overrides |
| `seccionRasa` (SECTOR) | 0 | 0 | 0 | sección **con** tres overrides |
| **"suelta"** | 0 | 4% | 4% | **sección sin ningún override** — el default de Divi |
| **"suelta corta"** | 0 | 4% | **40** | sección con **un** override |

Reparto medido: EDAR `suelta · suelta · seccion`; Petróleo `suelta corta ·
suelta · seccion`. Las dos páginas **cierran con la sección de ritmo clásica**,
que es donde vive el bloque comercial.

## 2 · Retícula

Idéntica a la de SECTOR: fila **86% máx 1380** (1238.39 a 1440 · 335.39 a 390),
`margin: 0 auto`, gutter **5.5%** (`margin-right: 68.1094` a 1440).

Seis repartos de columna en 19 filas — anchos medidos a 1440:

| token | ancho | % de la fila | dónde |
|---|---|---|---|
| `4_4` | 1238.39 | 100 | EDAR ×4 · Petróleo ×2 |
| `1_2` | 585.13 | 47.25 | EDAR ×8 · Petróleo ×6 |
| `1_3` | 367.38 | 29.6667 | Petróleo ×3 |
| `2_3` | 802.88 | 64.8333 | Petróleo ×3 |
| `1_4` | 258.5 | 20.875 | EDAR ×1 |
| `3_4` | 911.75 | 73.625 | EDAR ×1 |
| `3_5` | 715.78 | 57.8 | Petróleo ×1 |
| `2_5` | 454.48 | 36.7 | Petróleo ×1 |

A **390 todas las columnas apilan en orden de DOM** y ocupan 335.39. La foto
queda arriba o abajo según su posición en `columnas`: **no hace falta campo de
orden móvil**.

## 3 · El punteado

`punteado.svg`, **60×22**, colgando **−65px a la izquierda de la fila**
(x 35.8 con la fila en 100.8 a 1440; x −37.7 con la fila en 27.3 a 390).
`margin-bottom: 34.0469 / 30` (es un módulo de imagen que sigue el default de
texto, no el 3%). Va **siempre como primer módulo de su columna**.

**Es un booleano por columna, no un adorno del bloque.** Mapa medido, idéntico
en los dos anchos:

| página | columnas | con punteado | patrón |
|---|---|---|---|
| EDAR | 15 | 10 | también en la columna 1 cuando lleva contenido (S1F0) |
| Petróleo | 16 | **7** | **siempre la 0, nunca la 1** — incluso si la 0 es la foto |
| Urbano | 5 | 2 | las dos de `beneficiosAplicaciones` |
| Industria | 8 | 3 | las dos de `beneficios` + la del mapa |

No hay regla de plantilla que produzca los cuatro repartos. En el clon actual
está **cableado dentro de `BeneficiosAplicaciones`**; aquí sube a campo.

## 4 · Tipografía (plantilla — nada de esto es campo)

| elemento | 1440 | 390 | notas |
|---|---|---|---|
| **titular** `h3` | **44 / 55** w300 `#333` | **35 / 43.75** | `padding-bottom: 10px` (regla Divi de headings) |
| **claim** `h2` | **37 / 37** w300 | 37 / 37 (**no baja**) | el color lo pone un `<span style="color:#0075c9">` dentro; el `h2` computa `#333` |
| **claim** `h3` (Petróleo S0F1C0) | 44 / 55 | 35 / 43.75 | mismo `<span>` azul: un claim puede ser `h3` |
| **`h4`** de serie | **26 / 26** w300 | 26 / 26 | `<span>` azul + `padding-left: 40px` **inline** |
| `p` | 18 / 30.6 | igual | rítmica Divi: `pb 18` salvo el último |
| `li` | 18 / 30.6 | igual | **excepción medida**: el `ul` de Petróleo S0F1C0 va a 18/36 |
| `ul` | `padding: 0 0 18px 36px` | igual | viñeta azul `•` como en SECTOR |
| `h5` (en `th`) | 23 / 23 w300 `#333` | igual | ver `tabla-resumen.spec.md` |

El azul del cuerpo es **siempre `#0075c9`** en las dos páginas (el de marca). El
`#0c71c3` de Divi solo aparece en el **hero** de EDAR — ver
`cabecera-hero-cola.spec.md`.

## 5 · Los tres payloads nuevos

### 5.1 `tabla` — solo EDAR

Spec propia: **`tabla-resumen.spec.md`**.

### 5.2 `serie` — pares `h4 + p`, solo Petróleo

**No es un módulo `blurb`, ni una lista con estilo, ni texto suelto** — que era
la pregunta abierta §4.1 del recon en frío. Es **un solo `et_pb_text`** cuyo
`.et_pb_text_inner` contiene, alternados:

```html
<h4 style="padding-left: 40px;"><span style="color: #0075c9;">Detecta fugas de forma temprana</span></h4>
<p style="padding-left: 40px;">Reduce el tiempo que las emisiones pasan…</p>
… ×5   (fila S0F0C1)   ·   … ×7   (fila S1F2C1)
```

- `padding-left: 40px` **inline en los dos elementos**, escrito por quien editó.
- **Sin marcador**: `::before` computa `content: none`. No es una lista.
- El módulo entero lleva `padding-bottom: 23px` y `margin-bottom: 0`.
- Alturas medidas a 1440: serie de 5 → **427.97**; serie de 7 → **597.16**.

Modelo: `items: { titulo, texto }[]`. El indentado de 40 es **plantilla de la
serie** (13 de 13 lo llevan).

> **El `h4` suelto NO es una serie de un item.** Petróleo S1F4C0 ("Red de
> sensores → Red de comunicaciones → Plataforma de análisis") es un `h4` con su
> `<span>` azul **sin** `padding-left`. Alto 36 a 1440, `mb 34.0469`. Queda
> abierto en `MODELO.md` §4.1 si es un `kind` propio o un `claim` de nivel 4.

### 5.3 Dos pares titular+texto en una fila — **no es un payload**

Era el tercer payload del recon en frío. Medido, EDAR S1F0 es una fila
`1_2 + 1_2` donde **las dos columnas llevan pila de contenido**
(`punt · h3 · texto(h2+p…)`) en vez de contenido + foto. Sale gratis del modelo
de §1–§3: **no hace falta ningún campo.** Es el mejor argumento de que el
modelo de columnas es el correcto y el de "bloque con foto a un lado" no.

## 6 · Objetivos numéricos (1440, corrida del 2026-07-29)

Para verificar por composición durante el build — nunca solo el total, que puede
ser dos errores anulándose:

**EDAR** · `docH` 11136 (@390: 20580)

| sección | alto | filas (alto) |
|---|---|---|
| S0 suelta | 3675.81 | 570.81 · 544.84 · 966.14 · 935.14 · 543.69 |
| S1 suelta | 581.8 | 466.61 |
| S2 `seccion` | 2384.31 | 598.64 · 478.88 · 495.02 · 740.19 |

**Petróleo y gas** · `docH` 11303 (@390: 21188)

| sección | alto | filas (alto) |
|---|---|---|
| S0 suelta corta | 1758.58 | 819 · 841.98 |
| S1 suelta | 3740.3 | 798.19 · 550.95 · 899.98 · 998.52 · 377.47 |
| S2 `seccion` | 1149.08 | 582.47 · 495.02 |

La fila de `calls` mide **495.02** en las dos páginas (idéntica), y la del
bloque comercial 478.88 / 582.47.

## 7 · Estados

**Ninguno.** Ver `../BEHAVIORS.md`: el cuerpo es estático salvo los botones, que
son enlaces con el hover Divi ya construido.
