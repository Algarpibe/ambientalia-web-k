# ARQUETIPO A · topología — el `tb_body` de 2 secciones

> **Recon del 2026-07-30. No se ha construido nada.** Muestreo pre-registrado en
> `PLAN-MUESTREO.md`; el inventario del cuerpo, en
> `components/campo-rico.spec.md`.
>
> Medido con `npm run qa:a-censo` (**las 209 páginas**, HTML servido) y
> `npm run qa:a-cascaron` (24 páginas de muestra a 1440 y a 390, DPR 1, perfil
> limpio, Cookiebot bloqueado). Salidas congeladas en
> `scripts/qa/medidas/a-{censo,muestra,cascaron-*}.json`.

## 1 · Qué es el arquetipo A

Las tres formas que `../RECON-LISTADOS.md` §3 agrupó por esqueleto:

| forma | páginas | CPT |
|---|---|---|
| entrada de blog | **149** | `post` |
| término de Kunakpedia | **37** | `glossary` |
| documento científico | **23** | `scientific-docs` |
| | **209** | |

Las tres se renderizan con una **plantilla de cuerpo del Divi Theme Builder**
(`et-tb-has-body`), con un módulo `post_content` que inyecta el contenido. Ni una
tiene secciones propias de la instancia.

## 2 · El esqueleto, censado en las 209

`a-censo.mjs` extrae la secuencia de módulos `…_tb_body` **en orden del DOM** de
cada página. Resultado: **4 firmas distintas en 209 páginas.**

| forma | firmas | reparto |
|---|---|---|
| blog | **2** | 83 con bloque de relacionados · 66 sin él |
| término | **1** | 37 |
| documento científico | **1** | 23 |

### Blog — firma mayoritaria (83/149)

```
section#0 · row#0 · column#0 · text#0                    ← breadcrumb
section#1 · row#1 · column#1 · text#1 text#2 text#3      ← título · fecha · taxonomías
                  · column#2 (vacía, lateral)
          · row#2 · column#3 · image#0 text#4 sidebar#0 post_content#0
                  · column#4 · text#5 sidebar#2
section#2 · row#3 · column#5 · text#6…text#9 blog#0      ← «También te puede interesar»
          · row#4 · column#6 column#7 · button#0…#2
```

La firma minoritaria (66/149) es **idéntica hasta `post_content#0`** y **no
tiene `section#2`**: el bloque de relacionados no aparece.

### Término (37/37) — el más plano

```
section#0 · row#0 · column#0 · text#0                    ← breadcrumb
section#1 · row#1 · column#1 · text#1 sidebar#0 post_content#0
                  · column#2 · sidebar#1
```

Sin `row#2`, sin imagen destacada, sin bloque de relacionados.

### Documento científico (23/23)

```
section#0 · row#0 · column#0 · text#0                    ← breadcrumb
section#1 · row#1 · column#1 · text#1 text#2
          · row#2 · column#3 · text#3 sidebar#0 post_content#0
                  · column#4 · image#0 button#0 sidebar#1
```

La columna lateral lleva **imagen + botón**: la portada del PDF y su descarga.

## 3 · Qué hay antes y qué después del `post_content`

| | antes, en la columna principal | después, en la lateral |
|---|---|---|
| **blog** | `image#0` (destacada) + `text#4` (autoría) + `sidebar#0` (índice móvil) | `text#5` (autoría) + `sidebar#2` (índice desktop) |
| **término** | nada más que `text#1` + `sidebar#0` | `sidebar#1` |
| **doc. científico** | `text#3` + `sidebar#0` | `image#0` + `button#0` + `sidebar#1` |

**Invariante en las tres:** `section#0` de breadcrumb con **un solo** módulo de
texto; `section#1` que contiene el `post_content`; y **siempre** un módulo
`sidebar` después del blob.

## 4 · La retícula — idéntica a la del resto del sitio

Medido a 1440 en las 24 páginas de muestra, **sin una variación**:

| | valor | equivalencia |
|---|---|---|
| fila | **1238.39** (máx 1380) | 86 %, la misma que SECTOR y MONOGRÁFICO |
| columna principal | **911.75** | 73.62 % → token **`3_4`** de `MonoAncho` |
| columna lateral | **258.5** | 20.87 % → token **`1_4`** |
| gutter | 68.14 | **5.5 %**, el del resto del sitio |

**El arquetipo A no estrena retícula.** Es la misma de Divi con un reparto 3/4 +
1/4 que ya está tokenizado en `src/lib/monografico.ts`.

## 5 · Los dos tests, aplicados con su alcance

`CLAUDE.md` §«Cómo se decide si algo es plantilla o campo».

### Test A (Divi, los dos anchos) — el ritmo es plantilla

Medido a 1440 y 390 en las cuatro páginas de referencia:

| propiedad | @1440 | @390 | ¿se mueve? | veredicto |
|---|---|---|---|---|
| `section#1` `pt`/`pb` | 57.59 | 50 | **sí** | plantilla (4 % de Divi) |
| `row#1` `pb` | 28.8 | 30 | **sí** | plantilla (2 %) |
| `row#2` `pt` | 14.39 | 3.89 | **sí** | plantilla (1.16 %) |
| `text#2` `mb` | 34.05 | 30 | **sí** | plantilla (2.75 %) |
| `text#1` `font-size` | 44 | 35 | **sí** | plantilla (escala responsive) |
| **`post_content#0` `mb`** | **72** | **72** | **NO** | ⚠ ver abajo |
| `text#0` (breadcrumb) `font-size` | 12 | 12 | **NO** | fuera del alcance de A |

### ⚠ El alcance que este arquetipo obliga a añadir

Por el enunciado literal, `post_content#0 mb = 72` a los dos anchos significa
«lo escribió una persona en el builder» → **campo**. **Y es la respuesta
equivocada.**

> **Los dos tests infieren «lo escribió alguien editando ESTA página». En el
> arquetipo A esa persona NO EXISTE.** El `tb_body` es **una** plantilla que
> renderiza 149 páginas; quien escribe una entrada rellena el `post_content` y
> nada más. Cualquier valor del cascarón —se mueva o no con el ancho, varíe o no
> entre módulos hermanos— **lo escribió quien construyó la plantilla**.

La huella que da el test es correcta; **la interpretación se invierte**, porque
el mecanismo que la produce es otro. En SECTOR, px absolutos = un editor tocó
*esta página*. En A, px absolutos = **el constructor de la plantilla** lo fijó
para *las 149*.

**Y no es un argumento, está medido.** Si `mb 72` fuese un campo editorial
variaría entre instancias de la misma forma. Medido en las 24 de la muestra:

| forma | `post_content mb` | `text#1 font-size` | `section#1 pt` | ancho de columna |
|---|---|---|---|---|
| blog (12 instancias) | **72** en las 12 | 44 en las 12 | 57.59 en las 12 | 911.75 en las 12 |
| término (6) | **0** en las 6 | 18 en las 6 | 57.59 | 911.75 |
| doc. científico (6) | **0** en las 6 | 44 en las 6 | 57.59 | 911.75 |

**Cero varianza dentro de cada forma. Varía entre FORMAS**, o sea entre
plantillas. Ése es el Test B aplicado bien, y resuelve donde el Test A confunde:
la unidad de variación aquí no es el módulo dentro de la página, es **la forma**.

### Test B (variación intra-página) — inaplicable como está

Dentro de una misma página el ritmo sí varía de módulo a módulo (`text#2 mb`
34.05 · `text#3 mb` 0 · `post_content mb` 72), lo que por el enunciado daría
«campo». **Tampoco vale**, por lo mismo: nadie puede variarlo por instancia. El
test necesita que la unidad comparada sean **hermanos que un editor pueda
tocar**, y aquí no lo son.

## 6 · ⚠ SIN PROBAR — lo que no se ha demostrado y no se da por sabido

Es la categoría que costó P3, así que va explícita:

| # | qué | por qué no está probado | qué haría falta |
|---|---|---|---|
| **A-SP1** | Si las **2 firmas de blog** son **una** plantilla con el bloque de relacionados condicionado, o **dos** plantillas | el censo ve la salida, no la configuración del Theme Builder. Las dos hipótesis encajan con 83/66 | correlacionar la presencia del bloque con algún dato de la entrada (¿taxonomía? ¿nº de relacionadas?) en las 149 |
| **A-SP2** | Qué **decide** que una entrada lleve relacionados | no medido. 83 sí y 66 no, sin causa identificada | lo mismo que A-SP1 |
| **A-SP3** | Si `text#2`/`text#3` (fecha, taxonomías) son **campos del post** o **texto compuesto por la plantilla** | se ve el resultado renderizado, no su origen | comparar el texto emitido entre instancias: si cambia con el post, es campo |
| **A-SP4** | El ritmo **de la columna lateral** y del bloque de relacionados | medido solo el eje principal | ampliar `a-cascaron` a esos módulos |
| **A-SP5** | Las **3 formas restantes del grupo A a 390** más allá de las 4 de referencia | Test A aplicado sobre 4 páginas, no sobre 24 | correr `a-cascaron --muestra 390` |
| **A-SP6** | Si `sidebar#1` (término, doc) tiene el mismo contenido que `sidebar#2` (blog) | no comparado | medir su interior |

**Ninguna de las seis se cablea.** Se anotan, que es lo que la conclusión
operativa de `CLAUDE.md` manda hacer con lo que no pasa ningún test.

## 7 · Lo que sí queda probado

1. **El cascarón del arquetipo A no tiene ni un campo por instancia.** Cero
   varianza en 24 instancias, en las cuatro propiedades medidas.
2. **Son tres plantillas, no una.** Difieren en estructura (`row#2` ausente en
   término), en ritmo (`mb` 72 vs 0) y en tipografía (`text#1` 44 vs 18).
3. **La única variación intra-forma medida es el bloque de relacionados** en
   blog, 83/149 — y es presencia/ausencia de una **sección entera**, no un valor.
4. **La retícula es la del sitio**, con tokens que el repo ya tiene.
