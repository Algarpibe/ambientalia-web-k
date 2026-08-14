# LH-2 · DECISIONES DE MODELADO — listados y hubs

> **2026-07-31.** Sesión de decisión sobre el recon de `PAGE_TOPOLOGY.md` (las
> 35: 12 hubs + 23 archivos). **Nada se construye aquí.** Cada decisión lleva su
> evidencia y, donde toca, su condición de reapertura — el formato de C-2.
>
> Evidencia nueva de esta sesión: la **lectura fina de tarjetas**
> (`qa:lh-tarjetas`, congelada en `medidas/lh-tarjetas.json`, §7b del recon) —
> sin ella, D3 se habría decidido a ciegas. El resto viene congelado del recon
> (`lh-regimen` · `lh-censo` · `lh-paginas`).

## D1 · Cuántos arquetipos son y dónde parte cada frontera

**Decidido: las 35 páginas cuestan DOS arquetipos nuevos de listado (quizá
tres), UNA página índice sobre una colección existente, y CERO arquetipos por
los seis hubs de builder.**

| forma del recon | veredicto | arquetipo |
|---|---|---|
| **L1** · 23 archivos con `tb_body` | **UN arquetipo con tres VARIANTES de tarjeta** (`blog` · `etiqueta` · `recursos`) | **LISTADO-B** (nuevo) |
| **L2** · glosario + preguntas-frecuentes | un arquetipo (2 instancias) | **LISTADO-TEMA-CPT** (nuevo) |
| **L3** · 3 `scientific-category/*` | separado de L2 **con condición de reapertura** | LISTADO-TEMA-TAX (nuevo, el «quizá») |
| **L4** · 6 hubs de builder | **cero arquetipos**: son páginas compuestas por instancia | ninguno — cola larga / hipótesis grupo D |
| **L5** · `casos-de-exito` | **página índice del grupo C**: consulta la colección `casos` (ya modelada) y pinta su tarjeta | ninguno nuevo |

**El argumento, pieza a pieza:**

- **L1 es UNO, no tres.** El esqueleto es idéntico en 23/23 (6 secciones, 2
  `tb_body`, sin una excepción) y lo que difiere entre familias es la
  **configuración del módulo de tarjetas**, uniforme al 100 % dentro de cada
  familia (fecha: 76/76 tarjetas de etiqueta la llevan, 0/79 de resources,
  0/9 de blog). En régimen plantillado esa lectura es la de `CLAUDE.md`:
  varianza cero entre instancias = plantilla; lo que varía **entre familias**
  distingue plantillas (aquí: tres variantes de una), no campos. La consulta
  (qué término, qué CPT) es **dato**; la piel de la tarjeta es **variante**.
- **L2 y L3 no se fusionan con L1** — mismo criterio que separó C de A: el
  cuerpo lo emite la **plantilla del tema**, no el Theme Builder
  (`et-tb-has-body` ausente), y el esqueleto no coincide (4 · 5 vs 6).
- **L2 y L3 van separados entre sí** porque su secuencia de primer nivel
  difiere (4 vs 5 secciones) — el criterio F2 del pre-registro. **Condición de
  reapertura, explícita:** la lectura fina sección a sección (la mitad de
  LH-SP1 que sigue pendiente) puede mostrar que la 5.ª sección de L3 es un
  bloque opcional del mismo esqueleto; si es así, **se fusionan en un solo
  LISTADO-TEMA** y el «quizá tres» baja a dos.
- **Los 6 hubs de builder no estrenan nada.** Oscilan (6·7·8·6·7·6 secciones),
  que es la firma de página compuesta por instancia — la naturaleza de SECTOR,
  MONOGRÁFICO y el artículo de KB. Van con la **cola larga** de páginas
  sueltas, y les aplica la hipótesis pre-registrada del grupo D (si
  `MonoSeccion[]` expresa páginas del builder, las expresa a ellas); **esa
  hipótesis no se decide aquí** y sigue con su experimento pendiente.
- **L5 no es un arquetipo: es el índice que le faltaba al grupo C.** Una sola
  página, plantilla PHP propia, que lista **las 57 mezclando ambos prefijos**
  (ya medido en C-1) con la tarjeta de caso. En el modelo es una ruta +
  plantilla sobre la colección `casos`; cero campos nuevos.

**Cuadre: 23 + 2 + 3 + 6 + 1 = 35.** ✓

> ⛔⛔ **NO LEAS LA FILA DE `L1` SIN ESTO (2026-08-11, fase de specs).** El
> veredicto —*un arquetipo con tres variantes*— **sigue en pie**; lo que es
> falso por defecto es la frase que lo justifica: *«lo que difiere entre familias
> es la configuración del módulo de tarjetas»*.
>
> Medido al construir la spec (`qa:lh-spec` en vivo + `qa:lh-barra` sobre la
> población entera): **difiere también la RETÍCULA DEL CUERPO**, y con ella una
> superficie de contenido que ningún documento de este repo modela.
>
> | | blog · etiqueta | resources |
> |---|---|---|
> | fila del listado | **`3_4 + 1_4`** | **`4_4`** |
> | columna de contenido @1440 | **911.75** | **1238.39** |
> | barra lateral (**4 widgets**: Buscar · vacío · Categorías · newsletter) | **80 de 80 documentos** | **0 de 37** |
>
> Reparto mixto dentro de una familia: **cero**, así que en régimen plantillado
> se lee igual que la tarjeta —varianza 0 dentro, distinta entre— y **el
> recuento de arquetipos no cambia**. Lo que cambia es **de qué son las
> variantes**, y por tanto qué hay que construir y qué hay que modelar.
>
> Y la razón de que el recon no lo viera es §La causa común con un contenedor
> nuevo: `lh-censo` midió **el primer nivel de secciones** —6 y 2 `_tb_body` en
> 23/23, que sigue siendo verdad— y **la barra lateral vive una fila más abajo**.

### ✅ 2026-08-13 · D1 se IMPLEMENTA, y su NO SEPARABILIDAD se resuelve por MECANISMO (66.ª tanda)

`ListadoB.tsx` sirve las dos retículas que `lh-barra.json` midió. Lo que la
construcción tuvo que decidir y esta acta registra:

**(a) Barra y retícula van en UNA sola prop (`conBarra`), no en dos.** El §(b)
de abajo estableció que son **COLINEALES en 149/149** ⇒ *«propiedad de la CAPA»*
y *«de la VARIANTE»* son indistinguibles con esta población. Separarlas en dos
props **afirmaría que se pueden combinar de cuatro formas**, y tres de esas
cuatro no existen en el original. Se elige el eje con **mecanismo servido** —la
plantilla de cuerpo del theme builder decide las dos a la vez— y **la razón es
ésa, no una medida**, tal como el §(b) exigía.

**(b) El camino `4_4`-sin-barra se implementa y se DECLARA SIN EJERCITAR.**
`L1-resources` está parado por §F3-LH-JERARQUIA-RECURSOS, así que **0 de las 3
formas construidas pasan por `conBarra={false}`**. Es §F2-5-ESCALON-ETIQUETAS con
nombre propio: un camino de render que ningún dato de calibración estrena.

> **Lo que NO se hizo, y es la razón de que el componente exista ya: cablear
> `3_4 + 1_4` porque es el que hay delante.** Eso convertiría la variante medida
> en una constante, y la tanda que construya `L1-resources` se encontraría un
> componente **que hay que reescribir** en vez de uno **que hay que estrenar**.

**(c) Y una celda del ritmo que la spec no separaba: el `14.3906` está en las DOS
variantes y en PROPIEDADES DISTINTAS** — `padding-top` de la fila en blog,
`margin-top` en etiqueta. Leerlo como «la misma celda con otro valor» habría
dado un arreglo que cuadra en una y falla en la otra.

### ✅ 2026-08-11 · D1 queda ACOTADA (no contradicha), y la barra CIERRA sin escalón

Tres cosas, y sólo la primera cambia lo que hay que construir. La corrida es
`qa:lh-barra` sobre los **149 documentos** de la captura de F3-0
(`medidas/lh-barra.json`), sin red y con población completa.

**(a) La acotación, que es el entregable.** `L1` es **uno con tres variantes**, y
lo que cambia entre variantes es **la configuración de la tarjeta Y la retícula
del cuerpo con su barra** — no sólo la tarjeta. Es la **misma lectura** que ya
tenían la tarjeta (76/76 · 0/79 · 0/9), las tres pieles de paginación y la regla
de zoom de `hover-zonal`: varianza **0 dentro** de cada familia, distinta
**entre** familias, en régimen plantillado ⇒ distingue **plantillas**, no campos.
**D1 no se retira ni se reabre: se le ensancha el enunciado.**

**(b) El límite, que es lo que la medida SÍ dice — y es una NO SEPARABILIDAD.**

| | valor | denominador |
|---|---|---|
| `barraEnElCuerpo` · `columna3_4` · `columna1_4` | **80 · 80 · 80** | 149 |
| familias con `conBarra == con3_4` | **9 de 9** | 9 |
| familias con reparto mixto (ni 0 ni n) | **0** | 9 |

Como dentro de cada familia los dos recuentos son **0 o n y coinciden**, el cruce
baja al documento: **no existe un solo documento con `3_4` sin barra, ni con
barra sin `3_4`**. Barra y retícula son **COLINEALES en la población entera**.

> ⛔ **Por tanto «la barra es propiedad de la CAPA» y «la barra es propiedad de
> la VARIANTE» son INDISTINGUIBLES con esta población.** Es §DOS VARIABLES
> CONFUNDIDAS de `CLAUDE.md` en su forma literal: la regla que se escribiera
> nombraría una de las dos **al azar**, cierta dentro y sin probar fuera.
>
> **Se declara NO SEPARABLE, con su denominador (149) y con la variable contra
> la que no se pudo separar (la retícula `3_4 + 1_4`).** No se elige ninguna.

**Y si al modelar hay que elegir una, se elige por MECANISMO, no por medida:** la
**plantilla de cuerpo del theme builder** decide las dos cosas a la vez —la fila
y lo que va en su columna estrecha— y es lo que está **servido en los dos lados**.
Ése es el criterio de §UN DISCRIMINADOR 1:1 PUEDE SER LA SOMBRA DE OTRO: *el eje
que tenga mecanismo y esté servido*. **La razón de la elección es ésa, y hay que
escribirla como tal — no como si la medición la hubiera dirimido.**

**(c) La condición de reapertura de `D3` se COMPROBÓ y NO SE CUMPLE.** `D3`
dejó escrito que el widget «Categorías» *«consume la taxonomía `category`»*; era
una lectura del **título**, y la medida dice otra cosa:

| pregunta | medido | denominador |
|---|---|---|
| ¿es el widget nativo `widget_categories`? | **NO** — es `et_pb_widget widget_text` | 80/80 |
| ¿varía su contenido entre instancias? | **NO** — 1 solo contenido | 80/80 |
| ¿cubre los términos que el contenido ejerce? | **NO** — lista 2, vivos **7** | 149 documentos |

Los 5 que la lista no menciona: `articulos` (240 artículos) ·
`articulos-cientificos-y-estudios` (42) · `evaluaciones-independientes` (16) ·
`podcast-es` (4) · `articulos-tecnicos` (1). Los términos vivos se derivan de las
clases `category-{slug}` que `post_class()` escribe en cada `<article>`.

> **Y esto es lo que convierte el veredicto en POSITIVO en vez de en una
> ausencia.** «No encontré un `categories-N`» sería §la regla del cero — *no
> encontrar nada y no mirar nada dan la misma salida*. **Una lista que no cubre 5
> de los 7 términos que su propio sitio ejerce está DESINCRONIZADA**, y una lista
> desincronizada no se está regenerando desde la taxonomía. Es evidencia de
> mecanismo, no de silencio.
>
> ⚠ **Con su límite declarado, porque el marcado servido no lo distingue todo:**
> un `widget_text` **podría** contener un shortcode que expandiera la taxonomía, y
> el HTML servido saldría igual. Lo que la medida sí cierra es que **no es el
> widget nativo** y que **su salida no varía ni cubre lo vivo**. Para el modelado
> basta: se modela como **contenido de la plantilla**, y si alguien lo cambia,
> cambia en las 80 a la vez.

**⇒ `D3` queda CONFIRMADA tal como está. No hay escalón por este disparador.**
Lo único que la barra le añade al modelo es **contenido de plantilla de la
variante** (4 widgets: buscador, uno vacío, la lista escrita, el CTA de
newsletter), no una relación a taxonomía.

**Dato que la construcción sí hereda:** el widget emite **2 `href` absolutos** a
`https://kunakair.com/es/categoria/{eventos,noticias}/`. Entran en **`P-LH-C4`**
(`qa:enlaces` los convertirá en fallo al emitir el primer listado) y tocan
**LH-SP8**, que ya tenía fichada la familia `/es/categoria/*` como archivo vivo
fuera de sitemap.

> ⚠ **Y de paso salió un defecto DE LA PROPIA SONDA, que es por lo que la firma
> de arriba dice 4 widgets y no 10.** `lh-barra` tomaba la firma sobre una
> **ventana fija de 14 000 caracteres** desde el inicio de la barra; la barra de
> `/blog` mide **1481**, así que **12 519 de esos 14 000 son PIE**. De los «10
> widgets» de la firma congelada, **6 eran del pie** (clase `fwidget`).
>
> Es §sondas 4 en su tercera cara —*un heurístico que encuentra MÁS de lo que hay
> no da error: da un número plausible de más*— y es **el mismo error que la
> cabecera de esa sonda le reprochaba a `lh-serie`**, cometido un nivel más
> abajo. **No mueve el veredicto de partición** —los tres patrones siguen a
> 80·80·80, verificable comparando las dos congeladas— pero sí el recuento de la
> firma, así que la vieja se conserva como
> `medidas/lh-barra-SONDA-VENTANA-14000-COMIA-EL-PIE.json` (§sondas 7) y la nueva
> se re-emite con su razón.
>
> **Arreglado en la clase, no en la instancia:** el delimitador es ahora el
> **balance de `<div>`**, y hay **guarda** — ningún widget de la barra puede
> llevar `fwidget`, derivado sobre esta misma población (**0 dentro, 480 fuera**).
> Negativos: **5, todos con código ≠ 0** (`patron-falso` · `patron-ubicuo` ·
> `familia-vacia` · **`categorias-variable`** · **`corte-fijo`**). Los dos nuevos
> son los que hacían falta: `categorias-variable` prueba que el comparador de
> contenido **sabe fallar** (da 2 contenidos distintos, o sea que el «1» de
> arriba es un dato y no un cero de instrumento), y `corte-fijo` reproduce el
> defecto **con su número** —vuelve a dar los 10 widgets— que es el ANTES/DESPUÉS
> que el §protocolo de verificación exige y que un diff no da.

## D2 · La paginación: qué es campo, qué es plantilla, y cómo se emite

**Decidido, y escrito también en `ESQUEMA-CMS.md` §4b (que esta sesión
CORRIGE):**

1. **El patrón `/page/N/` es plantilla** — esquema de URL del sistema, varianza
   cero en los 21 listados que paginan.
2. **`entradasPorPagina` es PARÁMETRO DE PLANTILLA de cada variante, no campo
   por listado.** ⚠ Esto **corrige** la nota que el recon dejó en §4b («campo
   del listado, por test B»): aquella lectura aplicó la lente del builder a un
   régimen plantillado. Con la lente correcta: dentro de cada familia la
   varianza es **cero** (todas las etiquetas a 9; los resources con contenido
   suficiente, a 15; los dos L2 a 5) — y varianza cero entre instancias es
   plantilla. Valores medidos: **9** (blog/etiqueta) · **15** (resources) ·
   **5** (L2) · **L3 SIN PROBAR** (LH-SP9).
3. **Las rutas `/page/N/` se DERIVAN en build, no se almacenan**:
   `⌈entradas publicadas ÷ entradasPorPagina⌉` por listado. Con
   `dynamicParams = false` se emiten todas; la guarda de slugs del §4 las cubre
   por construcción (se deriva del `prerender-manifest`). Consecuencia
   operativa: **publicar o despublicar una entrada puede crear o destruir
   rutas** `/page/N/` — el rebuild por webhook (CMS-0c) lo absorbe, porque las
   rutas se deciden en build y solo en build.
4. **Los 7 que responden 200 a cualquier `/page/N/` NO se replican.** Su
   canonical apunta a la primera: el propio original declara que no son rutas.
   El clon servirá **404** ahí (`dynamicParams = false` lo da gratis).
   **Desviación deliberada** — se anota en `PENDIENTES-QA.md` **en la tanda
   que construya**, con esta razón.
5. **El total de 107/142 es una foto del 2026-07-31**, no una constante: el
   contenido vivo lo mueve. **La tanda de construcción re-corre
   `qa:lh-paginas` el día que emita** y verifica contra esa corrida, no contra
   la de hoy.

## D2.5 · Las 55 rutas `/page/N/` que responden 200 y no listan nada — **REPLICAR TAL CUAL** (2026-08-11, firmada por el propietario)

**Decidido: el clon emite las 55 rutas de paginación vacías con HTTP 200, igual
que el original.** Cierra el §ESCALÓN F3-2 de `PENDIENTES-QA.md`, que paró la
construcción precisamente porque `D2.3` y `D2.4` daban respuestas distintas y
ninguna de las dos contemplaba esta forma.

### El razonamiento, no sólo el veredicto

Había **tres** salidas, y las tres eran defendibles. Lo que las separa no es
cuál deja el sitio mejor, sino **cuál de ellas es una decisión de MIGRACIÓN**:

| salida | qué hace el clon | qué es |
|---|---|---|
| **replicar** ← **decidida** | 200 vacío, canonical a sí misma, `<title>` «Página 9 de 17» | **la única que NO CAMBIA EL SITIO** |
| `noindex` en las vacías | 200 vacío + `robots: noindex` | decisión de **producto** (SEO) |
| 404 en las vacías | la URL deja de responder | decisión de **producto** (SEO) |

> **Las otras dos son legítimas y pueden ser incluso mejores; lo que no pueden
> es viajar DENTRO de una migración.** Si las 55 páginas vacías son deuda de
> SEO, lo son **hoy, en el original**, con este mismo clon sin existir. Una
> migración que las arregla de paso mezcla dos cambios en un despliegue y deja
> sin respuesta la pregunta que de verdad importa —*¿el clon reproduce el
> original?*— porque cualquier diferencia posterior tendrá dos explicaciones.
>
> La pregunta de producto **no se pierde**: se abre con su propio encuadre en
> `PENDIENTES-QA.md` §**F3-2-SEO-PAGINAS-VACIAS**, para decidirse **sobre el
> sitio**, antes o después de la migración, pero no dentro.

### Y `D2.4` no se contradice con esto: el discriminador es EL CANONICAL, y parte limpio

Ésta es la parte que convierte la decisión en una regla en vez de en dos
excepciones. El original **declara él mismo** cuáles de sus `/page/N/` son
rutas, y lo declara en el canonical:

| forma | canonical | veredicto | n |
|---|---|---|---|
| los 7 que sirven 200 para **cualquier** `N` (`D2.4`) | → **la página 1** | *«no soy una ruta»* ⇒ **404 en el clon** | **7/7** |
| las 55 vacías (**D2.5**) | → **a sí misma** | *«sí soy una ruta»* ⇒ **se emite** | **55/55** |

Derivado, no recordado: el 7/7 sale de `medidas/lh-paginas.json`
(`canonicalConfirmaMismaPagina`) y el 55/55 de recorrer las 55 capturas de
`corpus/fase-3/listados` — 55 canonical propias, **0** a otra URL, 0 sin
canonical. **La misma regla da las dos respuestas**, y por eso `D2.4` se queda
como está en vez de reabrirse.

### Las tres fuentes del total **no discrepan**: miden dos cosas distintas, y una de ellas manda

El escalón las anotó como *«tres fuentes que se contradicen — ventana 8 ·
`<title>` 17 · contenido 8»*. Con la población entera delante eso se deshace, y
es lo que hace que el número deje de ser una opinión:

| fuente | qué mide en realidad | acierto, con su denominador |
|---|---|---|
| **`<title>` de Yoast** («Página N **de M**») | **la última que sirve 200** — la frontera del servidor | **21/21** de las 21 series que paginan |
| **ventana de `paginate_links`** (la del **cuerpo**) | **la última CON CONTENIDO** | **14/14 donde existe** — y **no existe en 7 de las 21** |
| contar `<article>` | la última con contenido (misma magnitud que la ventana) | — |

No había contradicción: había **dos magnitudes** y un criterio que elegía una
sin decirlo. **Bajo D2.5 manda la del servidor**, o sea el `<title>` — que es
además la única que un cliente puede leer sin adivinar.

⚠ **Y los dos denominadores están escritos porque el segundo casi se publica
mal.** El primer cálculo dio «ventana = contenido, 14/14» y eso se lee como *«en
las 14 que se miraron»* cuando el universo son **21**: las **7** que faltan no
discrepan, **no imprimen ventana** —5 porque sólo tienen una página con
contenido, y los **2 `scientific-category` por §LH-C6-L3-SIN-PAGINADOR**, que ya
estaba fichado—. Es §sondas 4 por el lado del lector: un acierto sobre un
subconjunto no declarado.

**Y hay una tercera magnitud que se llama parecido y no lo es:** el campo
`segunLaVentana` de `lh-censo` es *el mayor `/page/N/` que el documento CITA en
cualquier sitio*, **`<link rel="next">` del `<head>` incluido**. Da **15/21**
contra el contenido, no 14/14, porque en esas 7 el `<head>` cita una página que
el cuerpo no. `qa:lh-paginas` imprime las dos con su nombre largo, y **ninguna
se llama «la ventana» a secas**.

### El número de la entrega, DERIVADO de la decisión

| criterio | rutas de F3-2 |
|---|---|
| **D2.5 · replicar tal cual** ← **el que manda** | **142** (35 índices + **107** de paginación) |
| derivar por contenido (`D2.3` leída al pie) | 87 (35 + 52) |
| diferencia | **55** — las vacías |

**Los dos números se derivaron primero del archivo congelado y después se
re-midieron EN VIVO el mismo día** (`qa:lh-paginas`, 261 peticiones, congelada
en `medidas/lh-paginas-2026-08-11.json`), y salen idénticos: **142 · 87 · 55
vacías**, con el `<title>` = frontera del servidor **21/21**. O sea que `P-LH-C3`
—*«re-corre la sonda el día que emitas»*— queda **cumplida para el 2026-08-11**;
si la construcción cae otro día, se repite.

> ⚠ **Y sigue en pie `P-LH-C3`: el 142 es una foto.** El contenido vivo mueve la
> frontera de contenido y puede mover la del servidor. La tanda que emita
> **re-corre `qa:lh-paginas` ese día** y verifica contra esa corrida.

### ⚠ La corrección que esta decisión obliga: el «107» lo estaba decidiendo una MEDICIÓN

El total de 107 salía de `lh-paginas`, cuyo criterio era *«último N con HTTP
200; parada por 404»*. Ese criterio **cuenta las vacías** — o sea que la sonda
venía dando por decidida, **por inercia y sin decirlo**, exactamente la pregunta
que el escalón paró. Es §la causa común de `CLAUDE.md` en su versión más barata:
no un contenedor que absorbe, sino **un criterio de medición ocupando el sitio
de una decisión**.

Corregido en la misma tanda, y en las dos direcciones:

1. **el criterio de `lh-paginas` cita a D2.5 como su autoridad** — deja de ser
   una elección del instrumento y pasa a ser la consecuencia de una decisión
   escrita;
2. **la sonda mide y publica las DOS magnitudes** (servidor y contenido) con su
   fuente al lado, e imprime el total bajo cada criterio. Un lector futuro ve
   qué habría dado la otra lectura, que es justo lo que no se podía ver.

> ⚠ **Y arreglándola aparecieron DOS defectos suyos, los dos de la familia
> «verde falso», los dos cazados por corridas y no por leer el código:**
>
> | qué | qué hacía | regla |
> |---|---|---|
> | `catch {}` mudo en el fetch | cualquier fallo de red → `status: 0` → aguas abajo *«no pagina»*. Una corrida entera dio **«los 35 tienen 1 página»** con **cero errores impresos** y **exit 0** | §sondas **6**: una ausencia traducida a un valor benigno **en el sitio donde todavía se sabía** |
> | `process.exit(0)` en la última línea | **reseteaba `process.exitCode`**, así que el ❌ de *«canonical NO confirma»* se imprimía y la sonda salía **VERDE** | §sondas **1** por la puerta de atrás: no un descuadre sin contar, sino uno contado y **borrado después** |
>
> El primero se cazó porque el «1 página en las 35» es un **pleno** (§sondas 4:
> *un patrón que casa en TODAS no mide nada*) y contradecía la medida buena de
> julio. La corrida defectuosa se conserva con su nombre diciendo lo que es:
> `medidas/lh-paginas-2026-08-11-SONDA-CATCH-MUDO-red.json` (§sondas 7).

### Lo que D2.5 arrastra

- **`LH-SP9`** (entradas/página de L3) se calcula contra **las páginas con
  contenido**, nunca contra el total del 404 — ya anotado en el escalón.
- **Cobertura**: el denominador de F3-2 deja de ser un rango y pasa a ser
  **142** (§PASO 5 · `COBERTURA-MEDICION.md`).
- **Verificación**: las 55 vacías **tienen contrato propio** y se verifican —
  200, canonical a sí misma y `<title>` correcto—. Una ruta vacía que sirva 404
  en el clon es un defecto igual que cualquier otro (`P-LH-C7`, abajo).

## D2.6 · `L3` pagina por URL y **no sirve ningún control** — **REPLICAR TAL CUAL** (2026-08-12)

**Decidido: el clon emite las `/page/N/` de `scientific-category` y su cuerpo NO
pinta paginador**, igual que el original. Cierra
`PENDIENTES-QA.md` §**LH-C6-L3-SIN-PAGINADOR**, que dejó la elección abierta
*«con la razón escrita»* y no la tomó.

### Es la misma forma que D2.5, y por eso se decide igual

Había **tres** salidas y las tres eran defendibles. Lo que las separa no es cuál
deja el sitio mejor:

| salida | qué hace el clon | qué es |
|---|---|---|
| **replicar** ← **decidida** | emite las 6 rutas; el cuerpo sin control de paginación | **la única que NO CAMBIA EL SITIO** |
| servir un paginador visible | emite las 6 y **añade** el control que el original no tiene | decisión de **producto** (navegación) |
| no emitir las `/page/N/` | las URL dejan de responder | decisión de **producto** (SEO/enrutado) |

> **Servir el paginador sería mejorar el original dentro de la migración**, que
> es exactamente lo que `D2.5` rechazó: si las páginas 2 y 3 de `L3` son
> inalcanzables navegando, lo son **hoy, en el original**, con este clon sin
> existir. Arreglarlo de paso mezcla dos cambios y deja sin respuesta la
> pregunta que importa —*¿el clon reproduce el original?*—.
>
> La pregunta de producto **no se pierde**: se abre con su encuadre propio en
> `PENDIENTES-QA.md` §**F3-2-PRODUCTO-L3-NAVEGACION**, para decidirse **sobre el
> sitio**, antes o después de la migración, pero no dentro.

### El discriminador es EL MISMO CANONICAL de D2.4/D2.5, y da la respuesta sin caso nuevo

`L3` no estrena criterio: el original **declara él mismo** que sus `/page/N/` son
rutas, con el canonical, igual que las 55 vacías.

| forma | canonical | veredicto | n |
|---|---|---|---|
| las 7 de `D2.4` | → la página 1 | *«no soy una ruta»* ⇒ 404 en el clon | 7/7 |
| las 55 vacías de `D2.5` | → a sí misma | *«sí soy una ruta»* ⇒ se emite | 55/55 |
| **las `/page/N/` de `L3`** | → **a sí misma** | *«sí soy una ruta»* ⇒ **se emite** | **6/6** |

Derivado de las capturas de `corpus/fase-3/listados/scientific-category/**`: los
6 documentos llevan canonical propia, **0** a otra URL; los `<title>` traen su
«Página N de M» del servidor; y `grep` de `wp-pagenavi|kunak-pagination` da
**0 en los 6**. La ausencia de control no es una anomalía de una página: es la
plantilla de la forma.

**Y las tres series de `L3` no tienen ni una vacía** (`lh-paginas-2026-08-12`:
3+1+2 páginas, `vacias: 0` en las tres), así que aquí `D2.5` no aplica y las 6
rutas son todas con contenido. Son dos preguntas distintas sobre la misma
familia de URLs y se han contestado por separado.

### Lo que D2.6 arrastra

- **Construcción**: la ruta de `L3` deriva sus `/page/N/` como cualquier otra
  (`D2.3`) y **el componente de listado no monta paginador** para esta forma.
  No es un olvido que una revisión futura deba «arreglar»: está decidido aquí.
- **Verificación**: el comparador de dos lados exige `paginador.presente:false`
  en las 6 — un paginador servido por el clon es **defecto**, no mejora.
- **`LH-SP9`** (entradas/página de `L3`) sigue abierta y se calcula contra el
  servidor, nunca contra la ventana: en esta forma **no existe**.
- **`P-LH-C5`** no cambia: los 7 de `D2.4` siguen dando 404.

## D2.7 · El clon no tiene población para sus listados — **SEMBRAR EL CORPUS COMPLETO** (salida A, 2026-08-12)

**Decidido: las cinco colecciones que consumen los listados se siembran enteras
desde el corpus congelado** —`entradas-blog` · `casos` · `terminos-kunakpedia`
· `documentos-cientificos` · `faqs`— **con las taxonomías que sus series
consultan**. Cierra `PENDIENTES-QA.md` §**ESCALÓN F3-2 (4.º) · POBLACIÓN**, que
paró la construcción de `LISTADO-B` antes de escribir una línea.

### El razonamiento, no sólo el veredicto

Había **tres** salidas y las tres eran defendibles. Lo que las separa es **qué
deja verificable**:

| salida | qué hace | qué es |
|---|---|---|
| **A · sembrar el corpus** ← **decidida** | el clon consulta lo mismo que el original | **la única que deja verificable lo que F3-2 declara** |
| B · re-derivar los criterios contra la población del clon | `P-LH-C3`/`P-LH-C7` pasan a medirse contra lo que el clon tiene | una **FAMILIA DE CALIBRACIÓN en el instrumento**: el criterio se ajusta al clon en vez de al original, y con él desaparece la única comprobación de que la paginación funciona |
| C · entregar `L1` con la muestra y declarar el hueco | se verifica la primera página y el resto queda declarado | deja **38 clases estructurales con UN camino ejercitado**. Es §F2-5-ESCALON-ETIQUETAS literal: *un camino de render que ningún dato de calibración estrena* — y aquella costó una fase parada |

> **B es la más barata y la peor**, y conviene decir por qué con precisión: no
> falla por ser menos ambiciosa, falla porque **mueve el patrón de calibración
> al lado del clon**. `P-LH-C3` dice *«las rutas emitidas coinciden con una
> corrida del día»*, y una corrida del día mide **el original**; re-derivarla
> contra el clon la convierte en *«el clon coincide consigo mismo»*, que es la
> guarda solo-clon que §UN ARQUETIPO NUEVO NO HEREDA COBERTURA prohíbe leer
> como verde.

### El encuadre que la hace barata de defender: **no es un desvío, es la migración que el proyecto debe**

Ésta es la parte que evita leer la tanda como un rodeo:

> **Sembrar el corpus no es trabajo extra de F3-2: es F2-2 terminada.** El
> bloque 1 sembró **46 filas** porque su alcance eran los tipos **medidos en
> `src/lib`**, y `src/lib` es una **transcripción de muestra** — 7 entradas de
> 149. El resto de los documentos nunca se decidió dejarlos fuera: **no les
> tocaba todavía**. Un CMS que se entrega con el 5 % de su contenido no está
> entregado, así que esta siembra **iba a hacer falta con listados o sin ellos**.

Lo que F3-2 aporta es la **fecha**: los listados son el primer consumidor que
**no puede funcionar** con una muestra, y por eso el hueco aparece ahora y no en
la entrega final. Adelantarlo aquí es más barato que descubrirlo con cuatro
arquetipos más construidos encima.

### Lo que D2.7 arrastra

- **Las taxonomías entran con los documentos, no después.** Una serie de término
  (`/etiqueta/*`, `/scientific-category/*`) **no puede emitir sin su taxonomía
  poblada**: población y relación son la misma precondición, y separarlas
  dejaría 12 series emitiendo vacío con la colección llena.
- **La frontera escrita de `seed.mjs` se respeta**: `sectores` y `monograficos`
  **no** se siembran —su round-trip topa con la frontera de `PLAN-FASE-2` §F2-2
  y **ningún listado los consume como documentos**: `/es/sectores/` es un hub de
  builder, no una consulta.
- **La siembra parte de DB VACÍA** (`cms:reset` + seed), que es la regla escrita
  en `seed.mjs`: la salida es determinista, así que cada colección nueva
  re-siembra todo en vez de añadirse encima.
- **Se espera que `qa:nunca-vistos` baje de golpe** (hoy 208 de 296): la
  población completa **estrena casos legales** que la muestra no ejercía. Es la
  cosecha de esta decisión, no un daño.
- **Se espera que algún render muera.** Cada muerte es un hallazgo con la forma
  de `F2-5`: el arreglo **se estrecha** a donde el caso se da, con su ficha —
  no se sustituye por la regla contraria ni se tapa con un default benigno.
- **Lo que la cierra**: `qa:lh-poblacion` **verde sola**. Es la sonda del
  escalón y su rojo era deliberado; si con las cinco sembradas siguiera roja,
  eso sería un hallazgo y no un ajuste de la sonda.

## D2.8 · `/recursos/articulos` es un ARCHIVO DE TÉRMINO y su ruta se DERIVA de la jerarquía — **MODELAR LA JERARQUÍA** (2026-08-14)

**Decidido: `categorias-recursos.padre` se puebla, y la ruta de un término se
compone `<prefijo> + [padre.slug si lo hay] + slug` en la PLANTILLA — sin campo
de ruta.** Cierra `PENDIENTES-QA.md` §**F3-LH-JERARQUIA-RECURSOS**, que paró
`L1-resources` porque el esquema ya expresaba `padre` y faltaba la decisión.

Evidencia: `npm run qa:lh-jerarquia` (negativo **4/4**), congelada en
`medidas/lh-jerarquia.json` — 5 taxonomías · 38 términos · corpus congelado.

> ✅ **EJERCITADA el 2026-08-14 (68.ª tanda), y la decisión aguanta entera.**
> Sembrada —**10 filas · `padre` en 8/8 · 0 relaciones sin destino**, round-trip
> **349/349**— y construida: las **4 formas** de `L1-resources` emiten **18
> rutas** y quedan comparadas contra el original vivo con **base Δ0**.
> **Cero campos nuevos**, como decía el acta.
>
> **Lo que el ejercicio añade y el acta no podía saber:** el hueco de dato no
> era de esfuerzo sino **de canal** — `categorias-recursos` es una TAXONOMÍA
> DERIVADA de `entradas-blog.recurso`, y una taxonomía derivada de sus miembros
> no puede ver un término que ninguna entrada referencia (`articulos`, que sólo
> existe como padre) ni el `padre` mismo. Los dos los declara **el ARCHIVO**, y
> por eso salen de `cms:extractor-listados`.
>
> ⚠ **Y lo que el ejercicio CORRIGE**: el acta daba por bueno que
> `L1-resources` era «la misma fila sin barra». No lo es — tiene **3 filas** y
> su listado cuelga de un módulo de texto vacío. `D1`, que dice *«entre
> variantes cambia tarjeta + retícula + barra»*, queda **acotada otra vez**:
> cambia también **el número de filas**. Ficha: §F3-LH-ESCALON-4-4.

### Las dos preguntas de §0b del HANDOFF, contestadas — y la primera se contesta con un canal que nadie había mirado

**(1) ¿Un archivo de término o una página propia?** El HANDOFF la dejó escrita
con su razón: *«las dos lecturas producen las mismas 80 tarjetas hoy, así que el
dato no las separa»*. **Eso es cierto de las tarjetas y falso del documento.**
El original lo declara —y declara además el contraste— en el `<body class>`:

| URL | `<body class>` | qué dice el original que es |
|---|---|---|
| `/es/recursos/` | `page-template-default page page-id-33166 **page-parent**` | **PÁGINA** (y padre de páginas) |
| `/es/recursos/kunakpedia/` | `page-template-default page page-id-33769 **page-child**` | **PÁGINA hija** |
| `/es/recursos/documentos-cientificos/` · `/es/recursos/preguntas-frecuentes/` | ídem `page-child` | **PÁGINA hija** |
| **`/es/recursos/articulos/`** | **`archive tax-resources term-articulos term-379`** | **ARCHIVO DE TÉRMINO** |
| `/es/recursos/seminarios-web/` | `archive tax-resources term-seminarios-web term-384` | ARCHIVO DE TÉRMINO |
| `/es/recursos/articulos/contaminacion-urbana/` | `archive tax-resources term-contaminacion-urbana term-393` | ARCHIVO DE TÉRMINO |

Y la miga usa **el mismo vocabulario de dos tokens**, servido en la clase del
`<li>`: `pagina` · `pagina padre` · `categoria` · `taxonomia padre`. Los tres
hermanos de `articulos` bajo `/recursos/` son `pagina`; `articulos` y
`seminarios-web` son `categoria`. **El discriminador no se inventa: está en el
marcado, y su contraste vive en el mismo directorio.**

> **Es §El principio otra vez —*verificar contra la salida servida*— con el
> matiz de 2026-08-10: la salida servida tiene MÁS DE UN CANAL, y «el dato no
> las separa» sólo era verdad del canal que se había mirado.** Las tarjetas son
> el canal que no discrimina; el `<body>` y la clase del `<li>` sí, y llevaban
> ahí desde la primera captura.

**Y la segunda mitad de la pregunta —¿el archivo INCLUYE a sus descendientes?—
se contesta con una DIFERENCIA SIMÉTRICA, no con un recuento** (§UN CARDINAL ES
UN CONTENEDOR): `/recursos/articulos/` lista **80 tarjetas** y la **unión de sus
8 hijas es exactamente esas 80** — *0 en el padre que ninguna hija tenga, 0 en
una hija que el padre no tenga*. O sea: **el archivo del padre ES la unión de sus
descendientes**, y no tiene entradas propias.

**(2) ¿Qué hace eso con las rutas de dos segmentos?** Se derivan. El modelo
`ruta = <prefijo> + [padre] + slug` reproduce **35 de 35** URLs medidas, y —lo
que lo convierte en medida y no en preferencia— hay **2 términos que SEPARAN**
los dos modelos: `articulos` y `seminarios-web` son de primer nivel, y ahí
«derivar» predice **un** segmento y «cablear el prefijo» predice dos. Sin ellos
los dos modelos serían indistinguibles y elegir uno nombraría **una variable al
azar** (§DOS VARIABLES CONFUNDIDAS).

### La FORMA completa, que es lo que faltaba para poder modelar

§F3-LH-JERARQUIA-RECURSOS estableció que la jerarquía **existe**. Con eso no se
modela: hace falta su forma, y sale del censo de las 5 taxonomías.

| | medido | denominador |
|---|---|---|
| profundidad máxima | **2** | 35 archivos leídos |
| términos con padre | **8** | 35 |
| padres distintos | **1** (`articulos`) | — |
| términos con **DOS** padres | **0** | 35 |
| **tercer nivel** (un término que es padre y tiene padre) | **0** | 35 |
| taxonomías con jerarquía | **1 de 5** | `post_tag` 12 · `scientific-category` 3 · `category` 4 · `sector` 6/9 son planas |

**Las tres vías van con su propio denominador y no con uno solo**, porque son
afirmaciones distintas: miga **35/38** · padre-en-miga **8/35** · chips **9/35**
· URL de dos segmentos **8/38**.

⚠ **Y el alcance se declara donde no está completo:** de `sector` faltan **3 de
9** archivos en el corpus (`industria` · `investigacion-consultoria` ·
`urbano`), así que su lectura «plana» descansa en la vía 1 (URL: **9/9** de un
segmento) y en la vía 2 (miga: **6/9**). No es «se comprobó»: es esa fracción.

### La dirección CONTRARIA, que es la que casi nadie hace

§UNA COMPROBACIÓN RETROACTIVA SE ENMARCA EN LAS DOS DIRECCIONES. La pregunta
cómoda es *«¿el original tiene jerarquía que el clon no tiene?»*; la otra mitad
es *«¿el ESQUEMA admite `padre` donde el original nunca lo produce?»*, y decide
si la salida es «poblar `padre`» o «poblar `padre` **y acotar dónde**».

| taxonomía | el esquema declara `padre` | el original lo produce | celda |
|---|---|---|---|
| `resources` → `categorias-recursos` | **sí** | **sí** (8) | OK · modelado y ejercido |
| `post_tag` → `etiquetas` | no | no | OK · plana en los dos lados |
| `scientific-category` → `categorias-cientificas` | no | no | OK · plana en los dos lados |
| `category` → `categorias` | no | no | OK · plana en los dos lados |
| `sector` → *(sin colección)* | no | no *(6/9)* | OK · plana en los dos lados |

> **Cero celdas «SOBRE-GENERALIZADO».** `padre` está declarado en **1 de 4**
> colecciones de taxonomía, y es exactamente la única que el original hace
> jerárquica. **La decisión no tiene que acotar nada** — que es una respuesta,
> no una ausencia de respuesta, y por eso se escribe con su cruce entero.

⚠ **Lo que sí queda SIN EJERCITAR, dicho para que no se lea como soportado:** la
relación es a sí misma, así que el esquema admite **profundidad > 2** y el
original **no la produce**. Es §F2-5-ESCALON-ETIQUETAS con nombre: un camino que
ningún dato de calibración estrena. Se declara; **no se prohíbe** —prohibirlo
sería inventar una regla que ninguna instancia ha probado que exista, que es el
error simétrico.

### Las salidas, escritas con lo que cada una ES

| salida | qué hace | qué es |
|---|---|---|
| **(a) modelar la jerarquía** ← **decidida** | `padre` poblado; la ruta se compone en la plantilla | **la única que no añade dato que el original no tenga** |
| (b) aplanar | `padre` a `null` y las rutas cableadas | exige **quitar `padre`** del esquema y **añadir un campo de ruta**: cambia el modelo en dos sitios para no leer lo que el original ya declara |
| (c) partir la preocupación | `padre` modela la taxonomía y la ruta sale de otro campo | una **segunda fuente de verdad**: en **10 de 10** la ruta es derivable de `padre` + `slug` |

**Qué cambia cada una, y qué deja sin verificar:**

| | ESQUEMA | ENRUTADO | sin verificar | reversible |
|---|---|---|---|---|
| **(a)** | `padre` poblado (8 de 10) + los 2 términos que faltan como filas. **Cero campos nuevos** | `/recursos/[...ruta]` despacha por nº de segmentos contra dos catálogos —documentos (3) y términos (1–2, más `/page/N`)—, igual que `/sectores/[slug]` sirve dos arquetipos | profundidad > 2 (declarada arriba) | **sí**: la columna `padre_id` ya existe con su FK; poblarla es un `UPDATE` y la ruta es una función, no un dato |
| (b) | **quitar** `padre` (un campo declarado y jamás poblado se lee como modelado) **y añadir** `prefijo`/`ruta` | cada término declara su camino; el prefijo cableado se queda en el extractor y en la miga | **nada nuevo** — y deja **sin explicar** los tres canales del original | en el código sí; **en el dato no**: 10 rutas escritas a mano hay que volver a derivarlas |
| (c) | `padre` **y** `prefijo` | la ruta la manda el campo; `padre` sólo alimenta miga y chips | **que los dos puedan divergir**: el original no los separa en 10/10 | sí, y es la que más superficie deja |

> **(c) no es «lo mejor de las dos»: es el precedente contrario del propio
> repo.** `productos.pagina` lo dejó escrito — *«con página propia SÍ se compone
> y guardarlo sería una segunda fuente de verdad»*. Un campo derivable de otro
> en **todas** las instancias medidas no es flexibilidad: es un sitio donde el
> dato puede contradecirse consigo mismo.

### La decisión la toma el PRECEDENTE, no una firma

`D2.4`/`D2.5` se resolvieron con una regla que aquí aplica literal: **el original
declara él mismo lo que es, y lo declara en un canal servido.** Allí era el
canonical diciendo *«soy una ruta»*; aquí son **tres canales independientes**
diciendo *«soy un término y éste es mi padre»* —la miga con `class="taxonomia
padre"` y el href, los chips del padre listando sus 8 hijas, y el `<body>` con
`tax-resources term-<slug>`— más un cuarto que dice qué **no** es término
(`page-child` en los 3 hermanos).

Y los tres escalones que habrían obligado a escalar **no se dan, medidos**:

| escalón | umbral | medido |
|---|---|---|
| un tercer nivel | ≥1 | **0** |
| un término con dos padres | ≥1 | **0** |
| poblar `padre` mueve rutas ya emitidas | ≥1 | **0** — hoy la jerarquía la leen **2 líneas** y las dos tienen el padre **cableado** |
| el esquema admite `padre` donde el original no lo produce | ≥1 | **0** |

### ⚠ Lo que la medición destapó y NINGUNA de las tres salidas cubría: el prefijo cableado ya está cobrando

La decisión de arriba es de **esquema**. Al medir la consecuencia de enrutado
apareció una segunda mitad que es de **dato**, y que `padre` no arregla:

> **`extractor-a.mjs` busca el término de `resources` por el prefijo literal
> `recursos/articulos`.** O sea que la jerarquía ya está cableada **en la
> extracción**, y una entrada cuyo término es de PRIMER NIVEL no casa y **pierde
> su `recurso` en silencio**.

Reparto medido sobre las **149** entradas del corpus, por la forma de su cadena
de miga — y la DB confirma los dos primeros al par (81 con `recurso`, 68 sin):

| forma de la cadena | n | el prefijo cableado |
|---|---|---|
| `Inicio › Blog` | **66** | no aplica |
| `… › /recursos/articulos/<hija>/` | **81** | acierta |
| **`… › /recursos/seminarios-web/`** | **2** | **NO casa ⇒ pierden `recurso` y caen en `/blog`** |

**Y con eso queda nombrada la mitad que §F3-LH-DOS-CONJUNTOS-DE-149 dejó
anónima.** Aquella ficha escribió *«2 en la DB sin `recurso`, fuera del corpus de
`/blog`»* sin decir quiénes; son
`control-de-la-contaminacion-del-aire-en-la-industria-seminario-web` y
`webinar-deteccion-temprana-de-episodios-de-contaminacion-por-malos-olores-en-edar`,
y **el mecanismo es éste**. El cardinal `68 = 68` salía exacto porque los 2 que
sobraban compensaban a los 2 que faltaban por captura.

**Su consecuencia sobre lo ya emitido, derivada y no razonada** (posiciones
calculadas sobre la DB con el orden que `entradasDeBlog()` aplica):

| | hoy | con `recurso` arreglado |
|---|---|---|
| entradas en `/blog` | 68 (2 **mal**) | 66 (2 **ausentes por captura**) |
| páginas de `/blog` | 8 | **8** — no se añade ni se quita ruta |
| dónde caen los 2 | `/blog/page/2` pos. 5 · `/blog/page/3` pos. 1 | fuera |

⇒ **9 rutas ya emitidas cambian de CONTENIDO** (`/blog/page/2` … `/blog/page/8`,
más las 2 de `/[slug]` cuya miga pasa de 4 eslabones a 3) **y 0 se añaden o
quitan**. Eso es re-emisión, va con su medida antes/después, y **no es de esta
tanda**: la línea base queda congelada en
`medidas/clon-base-{1440,390}-f33-padre-antes.json`.

> ⚠ **Y el arreglo NO deja `/blog` correcto: lo deja HONESTAMENTE incompleto.**
> Pasa de «68 con 2 equivocadas» a «66 con 2 que faltan por capturar». Decirlo
> importa porque el recuento **empeora** y la fidelidad **mejora**, y quien mire
> sólo el número leerá lo contrario.

### Lo que D2.8 arrastra

- **Se siembran los 2 términos que faltan** —`articulos` (`term-379`) y
  `seminarios-web` (`term-384`)— y `padre = articulos` en las 8 hijas. Hoy la
  tabla tiene **8 de 10** filas y `padre_id` a `null` en las 8.
- **El extractor deja de cablear el prefijo**: el término se deriva de la miga
  por su **clase** (`taxonomia padre` / `categoria`), que es el canal que lo
  declara, y no por un literal de URL. Con eso las 3 entradas de
  `seminarios-web` entran solas.
- **La ruta es plantilla, no dato.** Un helper `rutaTermino(t)` al lado de
  `rutaDocumento(t)`, y **cero campos nuevos** en `categorias-recursos`.
- **`/recursos/` NO es un listado y no se emite como tal**: 0 tarjetas, 0 chips,
  y `/recursos/page/2/` **canonicaliza a `/es/recursos/`** — o sea *«no soy una
  ruta»* por la misma regla de `D2.4`, con la que da **la misma respuesta**.
- **La profundidad > 2 se declara SIN EJERCITAR** y entra en `qa:nunca-vistos`.
- **`qa:lh-poblacion` tiene que bajar sus dos series de `/recursos/*`** cortas
  cuando esto se siembre; si no baja, es hallazgo y no ajuste de la sonda.

## D3 · Lo que los listados le EXIGEN al grupo A — la decisión que condiciona

**Ésta es la razón de que LH-2 vaya antes de construir A: si A nace sin estos
campos, se re-migra.** Todo sale de la tarjeta medida (`lh-tarjetas.json`):

| campo exigido | evidencia | forma |
|---|---|---|
| `titulo` + `slug` | toda tarjeta es título+permalink | ya previstos en A |
| `fechaPublicacion` | `.published` en 76/76 tarjetas de etiqueta; como texto en resources | fecha del post |
| `imagenDestacada` | tarjetas sirven **1080×675 · 1024×683 · 980 · 480** por `srcset` | **relación a media, OPCIONAL** (hay tarjeta sin imagen: blog t0) — y sus *image sizes* amarran con CMS-0b/M-IMG |
| `extracto` | ~267c terminando en «…», **arranque idéntico al cuerpo** | **campo opcional con derivación por defecto** (recorte del arranque). SIN PROBAR si existe alguno manual (LH-SP10) — si aparece, el campo ya está |
| **TRES taxonomías**: `category` · `post_tag` · `resources` | la huella vive en las clases de cada `<article>` (`category-noticias`, `tag-*`, `resources-*`), y las tres tienen **archivo vivo** (¡`/es/categoria/*` incluido — LH-SP8!) | **relaciones a tres colecciones de términos**. Es lo más caro de re-migrar si falta |
| `autor` | **no aparece en ninguna tarjeta de las 9 formas** y el sitemap de author tiene 0 URLs en `/es` | **los listados NO lo exigen** — si el detalle lo muestra es cuestión del grupo A, no de aquí |

Y para los otros tipos listados: el **término** (glosario) no necesita nada
nuevo (tarjeta solo-título); el **documento científico** necesita su relación a
`scientific-category` (ya implícita — su archivo la usa); el **caso** ya está
modelado en C, y las clases revelan que **lleva `post_tag`** (cov · h2s ·
malos-olores) — se anota como dato: hoy ningún archivo de etiqueta medido lista
casos (las 12 listan solo `type-post`), así que **no se añade la relación al
modelo del caso** hasta que un listado la consuma. Condición de reapertura
escrita.

**El cruce con S1, que cierra el círculo:** la tarjeta medida de blog/resources
**es** `BlogPost` (`title · date · image · href · excerpt?`) y la de L5 **es**
`CaseStudy`. Los teasers que el clon ya pinta (`UltimosArticulos`,
`UltimosProyectos`) son **la proyección canónica confirmada por 9 formas** — el
listado embebido de `/es/recursos/` hasta baja el titular a **h3** como el
componente del clon. Decisión: **la proyección de teaser pertenece al content
type** (cada colección define la suya) y todo listado la consume; S1 deja de
ser «mitad construida» y pasa a ser la mitad **verificada**. Al construir A,
`BlogPost` gana `slug` y taxonomías y su `href` deja de ser absoluto (ya
anotado en `RECON-LISTADOS.md` §4).

## D4 · Campo vs plantilla en las 35 — con los tests y su alcance

**Régimen primero** (la regla de `CLAUDE.md`): L1/L2/L3/L5 son PLANTILLADOS —
no existe un editor por instancia; el discriminador es la **varianza entre
instancias**. L4 es BUILDER y sus cuerpos se medirán con los tests A/B cuando
se toquen — no aquí.

| propiedad | veredicto | evidencia |
|---|---|---|
| esqueleto L1 (6 secciones · 2 `tb_body`) | **plantilla** | varianza 0 en 23/23 |
| configuración de tarjeta (fecha · categoría · extracto · tamaño de imagen) | **plantilla DE LA VARIANTE** | varianza 0 dentro de familia (76/76 · 0/79 · 0/9); varía solo entre familias |
| `entradasPorPagina` (9 · 15 · 5) | **plantilla de la variante** (⚠ corrige §4b) | varianza 0 intra-familia |
| ~~`h1` del archivo~~ → **partida en `D4a` y `D4b`** | ✅ **RESUELTA 2026-08-11**, ver abajo | ~~los 35 h1 = nombre del término/índice~~ — un enunciado, **dos poblaciones**, **dos unidades** |
| nivel del titular de tarjeta (h2 · h3 embebido) | plantilla (contexto) | medido en L4 |
| patrón `/page/N/` | plantilla (sistema) | 21/21 |
| la **consulta** (qué término, qué CPT) | **dato** (el término es contenido) | es lo único que cambia entre los 23 de L1 |
| qué entradas salen y en qué orden | **SIN PROBAR** (LH-SP3) | no medido; si sortea como P4, condiciona el QA px a px |
| entradas por página de L3 | **SIN PROBAR** (LH-SP9) | 14·1·8 no da divisor limpio |
| extracto manual vs derivado | **SIN PROBAR** (LH-SP10) | lo medido es compatible con auto-excerpt |

**Y nada de lo SIN PROBAR se cablea** — se construye con el default medido y la
pregunta anotada, que es exactamente la regla del arreglo falso.

### ✅ D4a · de dónde sale el TEXTO del `h1` — **DOS enunciados, DOS denominadores** (2026-08-11, tanda de decisión)

El escalón no era que `D4` estuviera mal medida: es que **publicaba dos
propiedades en una sola unidad**. Partidas, y cada una con la suya
(`medidas/lh-h1.json`, 149 documentos, negativo **5/5**):

| población | n | qué dice la medida |
|---|---|---|
| **archivo de TÉRMINO** | **89 documentos** | el `h1` es **el NOMBRE del término** — se **deriva**, la página no lo almacena |
| **ÍNDICE** | **48 documentos** (10 índices) | el `h1` **NO es derivable de la ruta** y **varía dentro de la familia** ⇒ es **DATO DE LA PÁGINA** |

**Y la mitad que `D4` tenía al revés:** decía *«dato derivado del término, **no
propiedad de la página**»*. Para los **48 de índice eso es falso**: «Sistemas de
sensores de calidad del aire» (`/productos`), «Precisión validada por organismos
independientes» (`/recursos/documentos-cientificos`) o «Centro de recursos sobre
la calidad del aire» (`/recursos`) son **titulares escritos**, no el nombre de
nada. El discriminador está medido: **3 familias tienen dos índices con `h1`
distinto** — `L1-resources` («Artículos y Guías» vs «Seminarios Web»), `L4-hub`
(4 valores) y `otra` (2). `L1-resources` es **régimen plantillado**, así que ahí
varianza intra-familia significa **dato**, sin ambigüedad.

> ⚠ **Y el «137/137» con el que se planteó esta tanda NO es lo que la evidencia
> sostiene, aunque el número sea correcto.** 137 son los documentos **con `h1`**;
> lo que se puede afirmar de los 89 no se puede afirmar de los 48. Para un
> índice, *«el `h1` es el nombre del índice»* **no es falsable** —no hay «nombre
> del índice» en ninguna otra parte contra el que contrastarlo—: es un enunciado
> invacuo, y **la barra de «término/índice» era exactamente lo que lo
> escondía**. Es §la cobertura declarada al nivel de arriba, aplicada a una
> decisión: **una unidad que agrupa dos poblaciones absorbe lo que no se midió en
> la segunda.**

#### El detalle que separa dos hipótesis, y sin él serían indistinguibles

De los 89 de término, el `h1` **casa literalmente con el slug en 85**. Los **4**
que no:

| slug | `h1` | por qué |
|---|---|---|
| `co2-es` | **CO2** | sufijo `-es` de desambiguación de WordPress |
| `h2s-es` | **H2S** | idem (2 documentos: la página 1 y `/page/2`) |
| `petroleo-y-gas` | **Emisiones del petróleo y gas** | el slug es una abreviación del nombre |

> **Esos 4 no son excepciones: son EL DISCRIMINADOR.** Con slug ≡ nombre en 85
> de 89, *«el `h1` sale del SLUG»* y *«sale del NOMBRE del término»* darían el
> mismo resultado y serían **indistinguibles** (§DOS VARIABLES CONFUNDIDAS). Los
> 4 casos rompen el empate y **descartan el slug como fuente**.
>
> Probado con su negativo: `SABOTAJE=slug-igual-al-nombre` los borra y el
> veredicto pasa solo a *«INDISTINGUIBLES»* — o sea que la conclusión la
> sostienen esos 4 casos y no la redacción.

**Consecuencia de modelo:** el archivo de término **no lleva campo de titular**
(lo trae la relación al término, por su `nombre`, no por su `slug`); **el índice
sí lo lleva**, y es un campo propio de la página.

### ✅ D4b · SI HAY `h1` — **plantilla de la FAMILIA** (2026-08-11)

| | |
|---|---|
| **evidencia** | **12 documentos sin `<h1>`** y **0 con `<h1>` vacío**, sobre **149** |
| **quiénes** | `L2-glosario` **8/8** · `L2-faqs` **4/4** — la familia `L2` entera |
| **discriminador aplicado** | **la varianza entre instancias**, que es el de **régimen plantillado** (`CLAUDE.md` §Antes de aplicar ningún test) |
| **resultado** | **0 familias mixtas** de 9: cada una es «todas» o «ninguna» ⇒ **PLANTILLA DE LA FAMILIA**, no campo |

**El disparador 1 del escalón NO salta, y está cableado en la sonda**: una
familia mixta —unos documentos con `h1` y otros sin él— haría que la presencia
fuera campo, y `lh-h1` **cierra el código de salida** si aparece. Sale limpia.

#### Las DOS rutas que no cumplían el enunciado viejo, nombradas — y qué son

> `/es/glosario/` y `/es/preguntas-frecuentes/`.

Las tres salidas estaban escritas antes de mirar. **Es la (c): el denominador de
`D4` estaba MAL FORMADO**, y se re-declara con su alcance.

`D4` contaba sobre las **35 rutas de `lh-censo`**, agrupadas por su campo
`grupo` — `hub` · `post_tag` · `scientific-category` · `resources`—, **que no es
la partición de arquetipos**. Derivado:

| grupo del censo | rutas | familias de arquetipo que contiene |
|---|---|---|
| **`hub`** | 12 | **7** — `otra` · `L4-hub` · `L5-casos` · `L1-blog` · **`L2-glosario`** · **`L2-faqs`** · `L1-resources` |
| `post_tag` | 12 | 1 (`L1-etiqueta`) |
| `scientific-category` | 3 | 1 (`L3-sci`) |
| `resources` | 8 | 1 (`L1-resources`) |

**`hub` es un cajón que junta siete familias**, y **ninguna de las siete es
mixta**: cada una sale «todas con `h1`» o «ninguna». O sea que la «excepción de 2
en 35» **no era una excepción: era la señal de que el denominador mezclaba
plantillas distintas**. Descartadas (a) —no es excepción dentro de su familia,
es el 100 % de ella— y (b) —no hay varianza intra-familia en ninguna de las 9—.

> **Y la lección, que es la misma del §séptimo contenedor:** un denominador
> formado por una etiqueta cómoda (`grupo`) en vez de por la partición que
> gobierna el fenómeno (la **familia de plantilla**) **produce excepciones
> aparentes**, y una excepción aparente se «explica» en vez de corregirse. Los
> 2 de 35 se leían como *«dos rarezas»*; en la unidad correcta son **dos
> familias enteras**, 12 de 12 documentos.

### ✅ D4b.1 · el ANCLA de `L2` — «primera tarjeta», con MEDIA verificación y la otra mitad asignada (2026-08-11)

`D4b` convierte *«`L2` no tiene `h1`»* de anomalía en **propiedad de su
plantilla**, así que su base de lectura no es un parche: es lo que a esa familia
le toca. Medido sobre el corpus congelado (`qa:lh-ancla`, 149 documentos,
negativo **3/3**), **empezando por `/glosario` y `/preguntas-frecuentes`** — las
dos que rompieron el protocolo, porque calibrar contra las siete que sí tienen
`h1` sería fabricar una familia de calibración.

**La condición correcta no es «tiene ancla»: es «tiene BASE».** El ancla
alternativa sólo hace falta donde no hay `h1`, y exigírsela a una página que sí
lo tiene produce un bloqueo falso — pasó en la 2.ª versión de la sonda.

| base | documentos |
|---|---|
| el `<h1>` (la estándar) | **82** |
| **«primera tarjeta»** | **12** — exactamente `L2`, que es donde hace falta |
| **ninguna** | **0** |
| *(vacíos, sin cuerpo que medir — `D2.5`/`P-LH-C7`)* | *55* |

`L2-glosario` **8/8** y `L2-faqs` **4/4** tienen ancla. El selector cubre los
**cinco** tipos de tarjeta del sitio: `type-glossary` · `type-faqs` ·
`type-post` · `type-scientific-docs` · `type-case-studies`.

> ℹ **Y los 10 documentos con contenido que NO tienen «primera tarjeta» no son
> un problema: tienen `h1`.** Son `/productos` · `/sectores` ·
> `/recursos/kunakpedia` · `/recursos/documentos-cientificos` ·
> `/recursos/preguntas-frecuentes` (con sus `/page/2`), páginas de builder que
> **no listan posts** — justo lo que `D1` dice de los hubs. Usan la base
> estándar.

⚠⚠ **MEDIA VERIFICACIÓN, y la otra mitad tiene dueño.** El criterio de
`c-cabecera` —*ser **el mismo elemento** en los dos lados*— **no se puede
contestar hoy**: el clon no emite estas rutas, así que **no hay segundo lado**.
Eso no es un pendiente tácito:

| **`P-LH-C8`** | la tanda que CONSTRUYA verifica que el ancla de `L2` es **el mismo elemento** en original y clon, a los dos anchos — con el criterio de `qa:c-cabecera`, que existe precisamente porque un selector puede casar en los dos lados y apuntar a cosas distintas |
|---|---|

> ⚠ **Y de camino, un defecto real de `lh-spec`, arreglado en la CLASE:** su
> `anclaAlternativa` (`:310`) usaba `article[class*='type-'], article.et_pb_post`
> **sin filtrar el wrapper `article.type-page`** — el mismo filtro que
> `contenedorDeTarjetas()` (`:152`) **sí tiene**, con su comentario explicándolo.
> §sondas 3 en su forma más barata: *el arreglo existe, está razonado, y no está
> en la llamada que importa*. Medido: en `/recursos` y `/recursos/page/2` el
> selector viejo apunta a `post-33166 type-page` —la página— en vez de a
> `post-71347 type-post`.
>
> **El arreglo es NO-OP sobre lo congelado, comprobado y no supuesto:**
> `anclaAlternativa` sólo se evalúa donde falta el `h1`, y las únicas rutas así
> son las dos de `L2`, que **no traen wrapper** — sus valores en
> `lh-spec-{1440,390}.json` son los mismos antes y después, así que **no se
> re-emiten**. Se arregla igual porque el día que se mida una forma sin `h1` que
> sí lo traiga, el ancla apuntaría mal **en silencio**.

### (histórico) ⛔ 2026-08-11 · la fila del `h1` SALE DE CERRADA — y no por un dato nuevo, sino porque su evidencia NO PODÍA SOSTENERLA

Comprobación retroactiva **enmarcada en las dos direcciones antes de mirar**
(§UNA COMPROBACIÓN RETROACTIVA SE ENMARCA EN LAS DOS DIRECCIONES), contestadas
con **el mismo barrido**: `qa:lh-h1` sobre los 149 documentos de la captura,
congelada en `medidas/lh-h1.json`, negativo **4/4**.

**(a) ¿Alguna decisión cerrada se apoya en el `h1: ""` de `lh-censo`? — SÍ, ésta.**

`D4` afirmaba *«los 35 `h1` = nombre del término/índice»*. Derivado del propio
`lh-censo.json` que la sostenía: **33 de 35**. Las dos excepciones
—`/es/glosario/` y `/es/preguntas-frecuentes/`— estaban **dentro de la evidencia
citada**, con valor `""`, y no se miraron.

> **Y lo grave no es el 33/35: es que ese `""` no puede decidir la pregunta en
> ninguna dirección.** `lh-censo` guardaba el **TEXTO**, así que «lo encontré y
> estaba vacío» y «no lo encontré» salen **con el mismo valor**. Un enunciado
> apoyado en él no está mal medido — está **sin medir**, con una medida real de
> coartada. Es §la regla del cero dentro de un censo que después se citó.

Resuelto contra el marcado servido, que sí distingue: **cero `<h1>` en el
documento entero** en esas dos. Era **ausencia**.

**(b) ¿Y la lectura NUEVA de `lh-spec` está sobre-generalizada? — NO, y con su
límite declarado.** `lh-spec.mjs:308-310` discrimina **por elemento**
(`h1 ? … : …`), no por texto: un `<h1></h1>` vacío daría `hayH1: true` con
`texto: ""`. No colapsa. Pero:

> ⚠ **Ningún documento de la población ejercita esa rama** — **0 `<h1>` vacíos
> en 149**. Así que «sin `h1` ⇒ ausente» es correcto en el 100 % de lo medido y
> **la rama del `<h1>` vacío es un CAMINO SIN ESTRENAR** (§F2-5, la familia de
> `qa:nunca-vistos`). Se declara con su alcance; no se da por soportada.

**El censo completo, y la partición es lo que decide:**

| familia | n | con `<h1>` y texto | `<h1>` vacío | SIN `<h1>` |
|---|---|---|---|---|
| L1-blog · L1-etiqueta · L1-resources | 117 | **117** | 0 | 0 |
| L3-sci · L4-hub · L5-casos · otra | 20 | **20** | 0 | 0 |
| **L2-glosario** | 8 | 0 | 0 | **8** |
| **L2-faqs** | 4 | 0 | 0 | **4** |

**Varianza 0 dentro de cada familia, distinta entre familias** — la misma forma
que la barra y la tarjeta. En régimen plantillado eso se lee como **plantilla**.

### Por qué esto NO se decide aquí

Porque lo que cae no es un número, es que **`D4` mezclaba dos propiedades en una
fila**:

| pregunta | lo que dice el censo |
|---|---|
| ¿de dónde sale el **texto** del `h1`? | del término — en 137/137 de los que lo tienen |
| ¿**hay** `h1`? | lo decide **la plantilla de la familia**: `L2` no emite ninguno, y sus términos sí tienen nombre |

Si el `h1` fuera *«dato derivado del término, no propiedad de la página»*, `L2`
tendría uno. **No lo tiene.** Así que la presencia es de la plantilla y el
contenido del término, y eso es un enunciado distinto del que `D4` tiene escrito
— **no una corrección de su cifra**. Reescribirlo es modelar, y modelar con una
decisión retirada delante es lo que esta tanda tiene prohibido.

⇒ **Queda como PENDIENTE para una tanda de decisión**, con la evidencia ya
congelada. Ficha: `PENDIENTES-QA.md` §**ESCALÓN F3-2 (3.º) · D4-H1**.

⚠ **Y arrastra una consecuencia de MÉTODO que ya estaba fichada y ahora tiene
denominador:** el protocolo de este proyecto lee el cuerpo **restando la `y` del
`h1`**, y **12 documentos no tienen ancla**. `lh-spec` ya propone «primera
tarjeta» como alternativa — es un **candidato, no el ancla**: para serlo hay que
probarlo en 9/9 formas y verificar que es **el mismo elemento en los dos lados**,
que es lo que `c-cabecera` aprendió a exigir. La mitad de los dos lados **no se
puede contestar todavía**: el clon no emite estas rutas.

## D5 · Las ocho preguntas del §9, una a una

1. **¿L1 uno o tres?** → **Uno con tres variantes** (D1). Contestada.
2. **¿L2/L3 se fusionan con L1?** → **No** (régimen y esqueleto). L2 vs L3:
   separados con condición de reapertura (D1). Contestada.
3. **¿Los hubs de builder son listados o páginas?** → **Páginas**; cero
   arquetipos de listado (D1). Contestada.
4. **¿`/es/recursos/`?** → El listado embebido es un **bloque de consulta**
   dentro de una página de builder — y el clon ya tiene ese componente
   (`UltimosArticulos`; hasta el h3 coincide). Contestada.
5. **¿`casos-de-exito` sin paginar?** → **Se replica sin paginar** (57
   tarjetas): es el comportamiento servido del original, no un accidente — la
   paginación inventada sería la desviación. Contestada.
6. **¿Las 107 rutas se emiten en build?** → **Sí, derivadas** (D2.3), guarda
   incluida; el coste va a A-SP13. Contestada.
7. **¿Cuántas proyecciones de teaser?** → **Una por content type**, consumida
   por los listados; las diferencias de presentación son de la variante de
   plantilla (D3). Contestada con `lh-tarjetas`.
8. **¿El orden de resolución de la raíz?** → **No se contesta aquí, y no por
   falta de datos de esta tanda**: es **CMS-2** (el plano de 202+ slugs), una
   decisión transversal al sitio que corresponde a F2-1 con las tres salidas de
   CMS-2 delante. Lo que esta tanda añade es dato para esa mesa: `blog`,
   `glosario` y `preguntas-frecuentes` viven en ese plano, y existe además la
   familia `/es/categoria/*` fuera de sitemap (LH-SP8). **Qué la cierra:** la
   decisión de enrutado de F2-1.

**Y LH-SP5 (comportamiento) queda decidido: SÍ hace falta una pasada de
navegador antes de construir L1.** Cuatro cosas concretas: (a) hover de
tarjeta; (b) si la paginación del módulo Divi navega por enlace real o por
AJAX; (c) lazy-load de las imágenes de tarjeta; (d) **el orden de entradas
entre dos cargas** (LH-SP3 — si sortea como P4, el QA px a px de listados
necesita congelar contenido). Es una sesión corta de sonda con navegador sobre
3 páginas (una por variante de L1).

## Pre-registro · qué debe verificar la CONSTRUCCIÓN

Escrito ahora para que la tanda que construya no se lo invente:

| # | verificación |
|---|---|
| **P-LH-C1** | el esqueleto 6/2 reproduce en las 3 variantes de L1, contra el original, a los dos anchos, con base en crudo medida una vez (regla del §Notas de método) |
| **P-LH-C2** | la config de tarjeta por variante sale EXACTA: etiqueta = fecha `.published` + categoría + extracto ~267c con «…»; resources = fecha-texto sin categoría ni extracto; blog = sin fecha ni extracto |
| **P-LH-C3** | las rutas `/page/N/` emitidas coinciden con **una corrida de `qa:lh-paginas` del día de la construcción** (no con la del 2026-07-31 — el contenido vivo mueve el total) |
| **P-LH-C4** | al emitir el primer hub/listado, `qa:enlaces` convierte los **25 href** absolutos en fallo — se localizan con la sonda, no a mano, y se re-corre hasta limpia en las dos direcciones |
| **P-LH-C5** | los 7 sin paginación real devuelven **404** en el clon para `/page/2/`, y la desviación queda anotada en `PENDIENTES-QA.md` con la razón de D2.4 |
| **P-LH-C7** | **las 55 vacías cumplen SU contrato** (`D2.5`): HTTP **200**, `<link rel=canonical>` **a sí misma** y `<title>` «Página N de M» con la **M del servidor**. Un 404 ahí es defecto, no ahorro |
| **P-LH-C8** | **el ancla de `L2` es EL MISMO ELEMENTO en los dos lados** — la mitad de `D4b.1` que hoy no se puede contestar porque el clon no emite estas rutas. Criterio y sonda: `qa:c-cabecera`, a los dos anchos. Sin esto, la base de `L2` está verificada **a medias** |
| **P-LH-C9** | ⛔ **NUEVA 2026-08-14 (70.ª tanda). La construcción declara sobre cuántas PÁGINAS verificó, no sobre cuántas FORMAS.** `qa:lh-cmp` compara **13 páginas de 149** y **las 13 son la página 1** (`intermedia` 0 de 86 · `última` 0 de 28 · **11 de 38** clases). Así que un cierre que diga *«la forma X está verificada»* **es falso tal cual**: dice *«la página 1 de X»*. Se escribe con el número que dé `qa:lh-alcance` §`alcanceReal` esa corrida, y **al lado del recuento de pares**, nunca en su lugar. Razón y coste de ensanchar: `PENDIENTES-QA.md` §F3-LH-ALCANCE-PAGINA-1 |
| **P-LH-C10** | ⛔ **NUEVA 2026-08-14. Un verde se acompaña de sus instancias SEPARADORAS.** Medido: un defecto de paginador falso en **31 de 38** instancias salió verde porque de esa piel el comparador **comparó 1** y tenía **0 separadoras** — y su dominio efectivo es **universo − AUSENTES**, que hoy no propaga a ningún denominador. Al construir `L2`, `/glosario` (página 1, `total = 8`) **es la primera separadora** de la piel B: verificarla es parte de la tanda |
| **P-LH-C6** | ✅ **CUMPLIDA 2026-08-10** — `npm run qa:comportamiento`, 254/254 interacciones con disparo confirmado, negativo 5/5. Acta: **`BEHAVIORS.md`** (mismo directorio) · `medidas/comportamiento-1440.json`. **AMPLIADA al universo entero el 08-11**: `TODAS=1` → **518/518** sobre las **37 rutas × 2 lados**, el eje de la matriz a **37/37** (`comportamiento-1440-emitidas-todas.json`) |

## ⚠ Lo que la pasada de comportamiento le DEVUELVE a este documento (2026-08-10)

**Esta sección NO reescribe ninguna decisión.** El acta está en `BEHAVIORS.md` y
las fichas en `PENDIENTES-QA.md`; aquí sólo queda anotado qué decisión toca cada
hallazgo, para que la tanda que construya no lea las tablas de arriba sin este
aviso al lado.

| decisión | qué dice hoy | qué midió `P-LH-C6` |
|---|---|---|
| **D2.3** · *las rutas `/page/N/` se derivan en build* | supone navegación por enlace | ✅ **confirmada**: enlace real, `defaultPrevented:false` en las 5 formas con control. **NO es AJAX** |
| **D4** · *«qué entradas salen y en qué orden» = SIN PROBAR (LH-SP3)* | sin medir | ✅ **medido con su cota**: 1 solo orden en 10 cargas (blog · etiqueta · casos) ⇒ **< 30 % por carga al 95 %**. **No sortean como el módulo P4 de la HOME**, así que el QA px a px **no necesita congelar contenido** por esa causa |
| **D1** · *L1 es UNO con tres variantes de tarjeta* | tres variantes | ✅ **corroborada por una vía nueva**: hay **tres pieles de paginación** y caen **1:1** con las tres variantes (blog · etiqueta/L2 · resources/L3). ⚠ Es un discriminador 1:1 en 9 páginas: corrobora, **no prueba** |
| **D1** · *L5 … **cero campos nuevos*** | ninguno | ⛔ **§LH-C6-FILTRO-L5**: 12 botones de **filtro de cliente por sector** (57 → 3 tarjetas, sin recargar ni cambiar la URL) |
| **D3** · *no se añade la relación `sector` al caso **hasta que un listado la consuma*** | condición de reapertura | ⛔ **la condición SE CUMPLE**: el filtro de L5 la consume, y es el discriminador de sus 12 opciones. **A la mesa de F3-4**, no aquí: `sector` es una de sus tres familias sin censar y decidirla desde un único consumidor es n=1 |
| **D2** · paginación de L3 | *«las rutas se derivan en build»* | ⛔ **§LH-C6-L3-SIN-PAGINADOR**: L3 pagina por URL (3 páginas) y **no sirve ningún control en el cuerpo** — el único `/page/2/` del documento es el `<link rel="next">` de Yoast en el `<head>`. Replicar o desviarse, **con la razón escrita** |
| **LH-SP9** · *entradas/página de L3* | abierta | sigue abierta, **y ahora se sabe por qué costaba**: la ventana de `paginate_links` que el censo leía **no existe** en esta forma |

> ✅ **REVISADO 2026-08-11 con el comportamiento delante: de las cinco filas de
> arriba, TRES confirman el modelo y DOS lo recortan — y ninguna lo tumba.**
> Concretamente: **D1 (L1 es uno con tres variantes) sigue en pie** —corroborada
> por las tres pieles de paginación 1:1—, **D2.3 y D4 quedan cerradas con
> medida**, y lo que cae no son los arquetipos sino **dos supuestos de alcance**
> (que L5 no traía campos y que L3 serviría paginador). El reparto D1/D2/D3/D5
> **no se toca**.
>
> ⚠ **Y la consecuencia de la fila de L5 que faltaba escribir, porque es de
> ENTREGA y no de modelo:** si `sector` se decide en **F3-4**, entonces F3-2
> construye **L5 sin su filtro**. Eso es una **desviación deliberada** y se anota
> como tal en la tanda que construya —igual que `D2.4` con los 7 sin paginación
> real—, no un pendiente tácito. `PLAN-FASE-3.md` §F3-2 lo lleva escrito: la
> entrega hay que leerla **«L5 menos el filtro»**.

### ✅ 2026-08-11 · el CSS servido añade una fila, y refuerza D1 por una vía que no era el marcado

`qa:hover-zonal` no se escribió para contestar a D1 —iba a por el disparador del
zoom— y de paso trae la evidencia más limpia que tiene esa decisión:

| decisión | qué midió el CSS servido |
|---|---|
| **D1** · *L1 es UNO con tres variantes de tarjeta* | ✅ **la regla de zoom de media es LITERALMENTE LA MISMA** en las tres variantes de L1 **y en L4**: `.et_pb_post .entry-featured-image-url:hover img { transform: scale(1.1) }`. Varianza **cero** entre variantes en el canal donde Divi escribe lo que decidió el editor |
| **D1** · *L5 no es un arquetipo: es plantilla PHP propia sobre `casos`* | ✅ **su regla es de otra familia** —`.case-list-content article .case-imagen:hover`, y amplía **el propio `<a>`** porque la tarjeta de caso no tiene `<img>`—. O sea que **no comparte el módulo de Divi con L1/L4**, que es exactamente lo que D1 afirma |

> **Por qué esto vale más que las tres pieles de paginación:** aquella
> corroboración era **un discriminador 1:1 en 9 páginas** y venía marcada como
> *«corrobora, no prueba»*. Ésta es varianza cero **dentro** de las variantes y
> familia distinta **fuera**, medida en el canal que este repo aprendió a mirar
> en F3-1 —*Divi no escribe marcado: COMPILA CSS*—. Sigue sin ser una prueba
> (n = 9 formas), pero es evidencia de otra naturaleza, y **apunta al mismo
> sitio**.

**Y para la construcción hay una consecuencia directa, no una impresión:** la
regla se copia **con su disparador**. `article:hover img` cuadra el píxel a 1440
en las dos formas y cambia **quién** dispara, que es el defecto de rango del
§CONTRATO trasladado al eje de interacción.

### ✅ 2026-08-13 · el comparador de dos lados EXISTE, y con él P-LH-C8 pasa de «sin dueño» a «declarado NO EJERCITADO»

La tanda de CONSTRUCCIÓN escribió `qa:lh-cmp` **antes** de la plantilla. Lo que
eso cambia en el camino de decisiones:

| precondición | antes | ahora |
|---|---|---|
| **`P-LH-C8`** — que el ancla de `L2` sea **el mismo elemento** en los dos lados | «a cargo de la tanda que construya» | **cableada en el comparador**: compara la `marca` (etiqueta + 3 clases) además de la `y`, y si difieren **no normaliza nada** contra esa base |
| su **sabotaje** (`base-distinta`) | no existía | escrito y **declarado NO EJERCITADO**, con su razón |

> ⚠ **«NO EJERCITADO» no es «pasa».** Mientras las 13 formas estén AUSENTES en el
> clon, el sabotaje no puede cambiar el resultado — y *un sabotaje que no cambia
> el resultado no ha probado la guarda: ha probado que el instrumento no la
> ejercita* (§sondas 8a). El negativo lo imprime en cada corrida y **la tanda que
> construya tiene que añadirlo a sus casos**. Escribirlo como pasado habría sido
> exactamente el verde que esa regla existe para impedir.

**Y una consecuencia de `D4b` que sólo se ve con el comparador delante:** la base
de lectura **no es la misma en todas las formas**, así que el comparador la
resuelve **por forma** (h1 · primera tarjeta) y publica la lectura **EN CRUDO**
antes que ningún delta normalizado — §*la regla del `h1` es ciega a su propio
punto de apoyo*. Un comparador que normalizara primero no podría ver un desfase
que viva **en** la base, que es justo lo que costó cuatro páginas en C-QA1.
