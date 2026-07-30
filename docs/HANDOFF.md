# HANDOFF — MONOGRÁFICO construido y EXPERIMENTO corrido

> Reescrito el **2026-07-29** al terminar el build de MONOGRÁFICO TÉCNICO;
> actualizado el **2026-07-30** al correr el experimento. Para arrancar sesión
> limpia: son 5 minutos.

## El destino ya está decidido: Payload (CMS-0, 2026-07-30)

**Payload self-hosted** en VPS Hostinger + Easypanel, sobre Postgres propio,
**embebido en la propia app Next**, editor **Lexical**. Todo el esquema —qué es
colección, qué es block, qué es campo con defecto, la whitelist del campo rico y
las transformaciones de migración— vive en **`docs/ESQUEMA-CMS.md`**, que es
registro vivo como `PENDIENTES-QA.md`.

⚠ **Bloqueo conocido: `next` está en `16.2.1` y Payload exige ≥ 16.2.6.** Es un
salto de parche dentro de 16.2, no de minor — barato, pero **tanda propia** con
línea base y sondas. No se cuela en otra.

Flecos abiertos que condicionan trabajo: **media** (volumen vs S3) y sobre todo
**modelo de publicación** (rebuild por webhook vs ISR) — este último decide si la
app necesita la DB en runtime, y **si se elige ISR hay que releer el enrutado
entero**.

## Lo primero: en qué punto está

**MONOGRÁFICO TÉCNICO está construido y medido**, y **el experimento
pre-registrado está corrido**. Las dos páginas vivas del original están clonadas
y el cuerpo cuadra al céntimo salvo un residuo de décimas con causa
identificada.

**El experimento decidió: H1 rechazada por C1.** El content type de MONOGRÁFICO
necesita **tres campos** para expresar el cuerpo de Urbano, así que **el CMS
lleva dos content types** — ya no por falta de datos, sino con la frontera
medida. Acta en `docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md` §8.
Los tres campos **no se han añadido**: la regla de decisión lo prohíbe, y la
fusión (si se hace) es tanda propia.

| documento | qué trae |
|---|---|
| `docs/research/monografico-tecnico/PAGE_TOPOLOGY.md` | recon medido, con tres `⚠ CORRIGE` sobre la versión en frío |
| `…/DECISIONES.md` | las tres decisiones, argumentadas y cerradas — **las tres se sostuvieron al construir** |
| `…/MODELO.md` | el content type de la fase de specs. **Le faltaban campos**: el vigente es `src/lib/monografico.ts` |
| `…/components/seccion-editorial.spec.md` | el cuerpo. **Empieza con un `⚠ CORRIGE` de seis puntos**: léelo antes que el resto |
| `…/EXPERIMENTO-URBANO.md` | el experimento pre-registrado + **el ACTA (§8)**: H1 rechazada por C1, la frontera son 3 campos |
| `docs/PENDIENTES-QA.md` §MONOGRÁFICO | el acta de QA: qué cuadra, qué no y por qué |
| `docs/research/CENSO-ARQUETIPOS.md` | **cuánto le falta a la biblioteca**: 7 formas cubiertas de 23, y las 14 que no |
| `docs/research/RECON-LISTADOS.md` | las 7 formas que suman 321 páginas **son 4 arquetipos**, medido por el esqueleto. Con pre-registro, y con las 2 notas de esquema para el CMS |
| `docs/research/arquetipo-A/` | recon del grupo A (209 pg): plan de muestreo, topología, behaviors, **la spec del campo rico censada en 209/209**, el enrutado resuelto con prueba, y la hipótesis del grupo D encolada |
| **`docs/ESQUEMA-CMS.md`** | **el destino**: Payload self-hosted, la traducción de cada content type, la whitelist del campo rico, las transformaciones de migración y el criterio de aceptación. **Registro vivo — cada tanda lo actualiza** |

## Estado

**7 arquetipos**, 11 rutas emitidas:

| arquetipo | ruta | estado |
|---|---|---|
| HOME | `/` | clonado |
| PRODUCTO | `/monitor-calidad-aire` | clonado |
| CATÁLOGO | `/accesorios` | clonado |
| SOFTWARE/PLATAFORMA | `/software-de-medicion-calidad-del-aire` | clonado |
| — (variante corta) | `/kunak-api` | clonado |
| SECTOR | `/sectores/[slug]` | 4 de 8 poblados |
| **MONOGRÁFICO TÉCNICO** | `/sectores/…-en-edar` · `/sectores/…-petroleo-y-gas` | **2 de 2 — completo** |

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera de los dos sigue siendo añadir datos: un `SectorPage` a
`SECTORES_PUBLICADOS` o un `MonograficoPage` a `MONOGRAFICOS_PUBLICADOS`.

## El resultado, medido

Original vs clon **módulo a módulo** (`scripts/qa/mono-cmp.mjs`), 1440 y 390:

| | @1440 | @390 |
|---|---|---|
| Petróleo y gas | **exacto**: 0 módulos · 0 filas · 0 secciones | −0.23 total |
| EDAR | −0.01 | −0.16 total |

Y **las 9 páginas anteriores sin moverse un píxel** en los dos anchos, habiendo
tocado tres componentes compartidos. Lo dice `scripts/qa/clon-base.mjs`, que se
probó **en negativo** en la misma sesión: con 1px de más en el `pb` del hero
cazó las 4 páginas afectadas, nombró la sección y salió con código 1.

Todo el residuo que queda son **tres módulos de imagen** y la causa está medida:
el original sirve por `srcset` una variante redimensionada cuya proporción
redondea distinto (M-IMG en `PENDIENTES-QA.md`). Es tanda de **assets**,
transversal, no de este arquetipo.

## El experimento, ya corrido (2026-07-30) — lo que dejó decidido

Acta en `…/EXPERIMENTO-URBANO.md` §8. El resumen que hace falta para trabajar:

| criterio | resultado |
|---|---|
| **C1** · ningún campo nuevo | ❌ **3 campos** |
| **C2** · árbol sección→fila Δ0 en los dos anchos | ❌ 2 de las 3 filas del cuerpo |
| **C3** · `docH` Δ0 | ❌ +12 @1440 · −80 @390 |

**C1 manda**, así que: **H1 rechazada, dos content types, frontera escrita.** La
frontera son tres campos, y **ninguno es de ritmo**:

1. la **piel** del módulo `ctaDescarga` (`variante: "foto" | "fondo"` — el
   monográfico la cablea a `"fondo"` en el `.tsx`);
2. el **nivel semántico** del `claim` (en Urbano es un `<p>` de 37px, y
   `MonoNivel` solo da `h2`/`h3`/`h4`);
3. la **alineación vertical** de las columnas de una fila (el claim va centrado
   respecto a la foto; las 31 columnas del monográfico apilan desde arriba).

Lo que el experimento dejó **probado a favor** de fusionar algún día: los 4
valores de `SectorBlockFlujo` son azúcar sobre `MonoRitmo` (P2, Δ0 en los dos
anchos) y `beneficiosAplicaciones` entra sin un solo campo nuevo (P1, Δ0). **El
desacuerdo no está en el ritmo ni en la retícula.**

De las 4 predicciones acertaron 3; **falló P3**, que daba el `variante` por
existente en el módulo del monográfico. Existía en el modelo de SECTOR y se
perdió al pasar el dato al componente — el mismo error de la tanda, en el sitio
menos esperado.

**Lo que sigue prohibido hasta que haya una tanda de fusión con su plan:**
añadir esos tres campos "de paso", ampliar `flujo`, o subir el `pb` de fila a
dato. La regla de decisión pre-registrada lo dice y se ha cumplido.

## Lo que enseñó construirlo, y que cambia cómo se leen las specs

**No hay un discriminador: hay dos tests, y cada uno con su alcance.** Reescrito
en `CLAUDE.md` el 2026-07-30, porque escrito como uno solo daba respuestas
**invertidas** fuera de su alcance:

- **Test A (Divi, los dos anchos)** — responsive = plantilla; px absolutos
  iguales a 1440 y a 390 = tocado por el editor. **Vale para el RITMO.** No vale
  para la caja ni la tipografía: el ancho de módulo se escribe en % igual que su
  default, así que se mueve con el ancho lo escriba quien lo escriba.
- **Test B (general)** — ¿varía de un módulo a otro dentro de la misma página?
  Si varía, es campo. Sin restricción de alcance. **Es la regla**; A es el atajo.

Y el matiz, que P3 acaba de cobrar: **los dos tienen falsos negativos
distintos** —A no ve un campo escrito en % como su default; B no ve un campo que
el editor puso uniforme en toda la página—, así que **una propiedad que no pasa
ninguno de los dos no está probada como plantilla: está sin probar.** Y sin
probar **no se cablea**, se anota. `variante` no pasaba ninguno de los dos.

Ocho propiedades salieron de ahí, y **ninguna se veía en la primera página**:
ancho de módulo, `line-height`, tamaño del claim, bordes de la tabla, default
de `mb` de imagen, la regla del último módulo, el `<strong>` en línea y el hueco
entre columnas apiladas. Tabla con el coste de cada una en el `⚠ CORRIGE` de
`seccion-editorial.spec.md`.

## Cuánto le falta a la biblioteca (censo del 2026-07-30)

`docs/research/CENSO-ARQUETIPOS.md`, contra el sitemap completo del original.
**380 páginas conocidas en la rama `/es`**, y el reparto:

| cubo | páginas | formas |
|---|---|---|
| cubiertas por un arquetipo | **13** | 7 |
| dudosas (mismo CPT `solutions`, plantilla sin medir) | **20** | 2 |
| **sin cubrir** | **347** | **14** |

**Por formas de página vamos por el 30 %**, que es la cifra que cuenta — un
arquetipo se paga una vez y sirve para todas sus instancias. Y las 14 que faltan
**no son variantes de las que hay**: los 7 arquetipos actuales son páginas de
venta; lo que falta es contenido editorial y listados (fecha, autor, taxonomía,
paginación).

**7 de esas 14 formas se comen 321 de las 347 páginas** (blog, caso de éxito,
término de Kunakpedia, documento científico, FAQ, archivo de taxonomía, artículo
de KB). Las otras 7 formas son 26 páginas de cola larga. O sea que la deuda no
son 347 páginas: son **7 plantillas de listado y 7 páginas casi sueltas**.

Dato que cambia cómo se lee: el clon **ya pinta** tarjetas de caso de éxito y de
entrada de blog (`UltimosProyectos`, `UltimosArticulos`, con datos a mano en
`projects.ts` y `articles.ts`). El modelo de las dos formas más numerosas está a
medias por el lado de la tarjeta; falta la página de destino.

El censo **no decide construir nada**. Y ojo con su §0: el sitemap omite los
`noindex`, y las 10 páginas de esa familia que están contadas se encontraron
porque el clon ya enlazaba a ellas. **380 es un suelo.**

### Y esas 7 formas son 4 arquetipos, no 1 (recon del 2026-07-30)

`docs/research/RECON-LISTADOS.md`, con pre-registro y por el **esqueleto**. La
medida decisiva no fue geométrica: Divi sufija cada sección con la plantilla del
Theme Builder que la emite (`_tb_body`, `_tb_footer`) y marca `et-tb-has-body` en
el `<body>`.

| grupo | formas | páginas | qué lo separa |
|---|---|---|---|
| **A · detalle plantillado** | blog · término · doc. científico | **209** | `tb_body` de 2 secciones + módulo `post_content` |
| **B · listado plantillado** | archivo de taxonomía | **23** | mismo `tb_body`, **sin** `post_content`: el medio es una consulta con paginación |
| **C · detalle sin plantilla de cuerpo** | caso de éxito · FAQ | **76** | **sin `et-tb-has-body`**: el cuerpo lo emite la plantilla del tema. Y su pie es otro (`tb_footer` 4 vs 3) |
| **D · página del builder** | artículo de KB | **13** | lo compone el editor, **como SECTOR y MONOGRÁFICO** |

**El mayor cubre 209 de 321 páginas (65 %) con un solo esqueleto**, tres formas
que coinciden en las seis medidas. «Varios» es firme (basta una diferencia
estructural y hay tres); la composición **interna** de cada grupo es
**provisional**: 2 instancias por forma no prueban una plantilla.

Pista anotada y **no perseguida**: el grupo D es una página del builder, o sea del
tipo que ya sabemos construir, y su cuerpo es lo que `MonoSeccion[]` modela. Si lo
expresa, esas 13 no cuestan arquetipo nuevo — **hipótesis**, se prueba con un
experimento pre-registrado, no de oído.

Y dos **notas de esquema para el CMS** (no son pendientes de QA, no hay nada que
arreglar): el caso de éxito tiene **dos patrones de ruta** (`/es/casos-de-exito/`
y 4 en `/es/case-studies/`), y **202 slugs de cinco familias comparten el espacio
de nombres plano de `/es/`** —150 entradas de blog, 38 términos, 7 páginas, 6 del
CPT `solutions`—, incluidas las cuatro rutas que el clon ya sirve.

### El grupo A, reconocido (2026-07-30)

`docs/research/arquetipo-A/`. Muestreo pre-registrado; **inventario del cuerpo
censado en las 209/209**, no muestreado.

- **El cascarón no tiene ni un campo por instancia.** Cero varianza en las 24
  instancias muestreadas (ritmo, tipografía, retícula). **Son tres plantillas**,
  que difieren entre sí (`post_content mb` 72 en blog vs 0 en las otras dos).
- **Los dos tests de plantilla-o-campo NO se aplican al grupo A**, y hay que
  saberlo: ambos infieren «lo escribió alguien editando ESTA página», y en un
  `tb_body` **esa persona no existe**. La huella sale igual; **la interpretación
  se invierte**. Detalle y prueba en `PAGE_TOPOLOGY.md` §5.
- **El `post_content` se declara campo RICO y no se parsea a bloques**: 43
  etiquetas distintas, `script` ejecutable en 15 páginas, rango de longitud de
  **254×**, y **cero `wp-block-*`** — es HTML del editor clásico. El contrato
  medido está en `components/campo-rico.spec.md`, y la postura general en
  `CLAUDE.md` §«Dónde para el modelado de estructura».
- **Enrutado resuelto con una prueba** (`ENRUTADO.md`): en Next **la ruta
  estática gana** a un `[slug]` dinámico de raíz — verificado con una colisión
  deliberada en `/accesorios`. Pero un `[slug]` de raíz **se traga todos los 404
  de un segmento** (`/slug-inventado` → 200), así que la recomendación es
  replicar el plano **con `dynamicParams = false`**, unicidad **entre familias**
  en el esquema y una guarda que falle en build — porque **el build no avisa de
  la colisión**.
- **Hipótesis del grupo D encolada** con su pre-registro y sus 4 predicciones
  (`HIPOTESIS-GRUPO-D.md`). No se ejecuta, y **no se toca `MonoSeccion[]`**
  mientras tanto.

## Lo que NO hay que hacer al empezar

- **No arreglar S9, S10 ni S11 sueltos.** Ver la nota de **CLASE** en
  `PENDIENTES-QA.md`: son el mismo hallazgo cuatro veces y se resuelven en una
  tanda única con criterio común. El monográfico **añadió instancias al
  catálogo**, que era lo que faltaba.
- **No perseguir el residuo de las imágenes** (M-IMG): son décimas, la causa
  está escrita y se cierra con `srcset`, no con maquetación.
- **No re-medir el original a mano.** Las sondas están en `scripts/qa/` con su
  salida congelada en `medidas/`. Se reutilizan.

## Sondas nuevas de esta tanda

| sonda | qué hace |
|---|---|
| `clon-base.mjs [ancho] [--cmp antes.json]` | **el clon contra sí mismo**, antes/después de tocar algo compartido. Rutas del `prerender-manifest`, umbral cero, y exige un `MARCADOR` en el HTML servido antes de medir nada |
| `mono-cmp.mjs <edar\|petroleo> [ancho]` | original vs clon **módulo a módulo**, separando alto (contenido) de margen (ritmo) |
| `dos-rutas.mjs <rutaA> <rutaB> [ancho]` | **dos rutas del MISMO build, cara a cara**: árbol sección→fila + `docH` + anclas de la cola, umbral cero. Del experimento Urbano. Exige `MARCADOR` igual que `clon-base.mjs` |
| **`offsets.mjs <ruta> [ancho] [--cmp otra]`** | **el offset de cada nodo dentro de su padre** y la **holgura** de cada columna: cuánto puede fallar ahí sin que la fila se mueva. Instrumental estándar — era `exp-detalle.mjs` |
| `corte-cuerpo.mjs` | guarda de E1: que la rebanada del cuerpo del clon **acabe en el slider**, 6 rutas × 2 anchos |

`tree-cmp.mjs` acepta los 6 slugs y localiza el hero **por el breadcrumb** y no
por su `padding-bottom`: el del monográfico cierra a 39 y la heurística vieja se
quedaba sin cuerpo.

**E1 RESUELTO (2026-07-30).** El cierre del cuerpo en el lado del clon estaba mal
en **dos** sondas —`tree-cmp.mjs` y `mono-cmp.mjs`, que es la de los números del
acta— y ahora corta por `[aria-roledescription='carrusel']`, falla en voz alta si
no lo encuentra, cuenta los nodos sin pareja y **congela su salida** (antes no
escribían nada: sus conclusiones vivían en la consola de quien las corría).
Probado que no falseó nada: ver **E1** en `PENDIENTES-QA.md`.

## Comandos

**Las sondas se lanzan por `npm run qa:*`, desde la raíz. No hace falta `cd`.**

```bash
npm run check                            # lint + typecheck + build
npm run build && npm run start           # tras editar: parar, rehacer, relanzar
npm i --no-save puppeteer-core           # una vez

npm run qa:enlaces                       # guarda de rutas locales — limpia hoy
npm run qa:corte                         # guarda del corte del cuerpo — 12/12
npm run qa:esqueleto                     # topología del original por forma
npm run qa:offsets -- /sectores/calidad-del-aire-en-las-ciudades 1440
npm run qa:mono -- edar 1440
npm run qa:dos-rutas -- /sectores/a /sectores/b 1440
npm run qa:ruido -- 3                    # suelo de ruido, antes de juzgar nada
```

El `--` es obligatorio para que npm pase los argumentos al script. El catálogo
completo está en `scripts/qa/README.md`.

**Por qué envueltas:** dan un prefijo estable que se autoriza **una vez** en
`.claude/settings.json` y vale para cualquier argumento. A pelo, cada invocación
nueva era un comando distinto y pedía permiso — **360 reglas de un solo uso**
acumuladas antes de arreglarlo.

Dos trampas del entorno, ya muertas en `lib.mjs` y no en la documentación:
`w()` resuelve contra `scripts/qa/` y no contra el `cwd` (si no, lanzarlas desde
la raíz partía `medidas/` en dos árboles **sin dar error**), y `ruta()` deshace la
traducción de MSYS, así que `/sectores/x` funciona **también desde Git Bash**.

Y lo de siempre, que sigue costando cuando se olvida: **matar el servidor por
puerto**, nunca con `pkill`, y **verificar un marcador del cambio en el HTML
servido** antes de dar una medida por buena. `clon-base.mjs` ya lo exige por
`MARCADOR`; las demás sondas todavía no (tarea mecánica pendiente: que sean
dueñas de su ciclo de servidor, ~20 líneas en `lib.mjs`).
