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
