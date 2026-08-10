# CENSO DE ARQUETIPOS — ¿está completa la biblioteca?

> **Hecho el 2026-07-30, en frío y sin construir nada.** El objetivo del repo es
> levantar una **biblioteca de arquetipos de página** que se traslada a un CMS
> (`CLAUDE.md` §Qué es esto). Con 7 arquetipos y 11 rutas emitidas, la pregunta
> «¿falta mucho?» se estaba respondiendo a ojo. Esto la responde con el sitemap
> completo delante.
>
> **No decide construir nada.** Es un censo: qué formas de página existen en el
> original, cuáles caen bajo un arquetipo que ya tenemos y cuáles no.

> ⚠ **Nota de alcance añadida el 2026-08-09 (F3-1), y no es un número: es una
> distinción que este censo no hacía.** Un arquetipo puede estar **CENSADO**
> (sabemos que existe y cuántas instancias tiene), **RECONOCIDO** (topología y
> decisión de modelo) y **ESPECIFICADO** (`getComputedStyle` por sección, o sea
> lo único que permite construir una plantilla fiel). Los tres se venían leyendo
> como uno.
>
> `articulos-kb` está **censado y reconocido, y NO especificado** —
> `docs/research/grupo-D/` no tiene `components/`—, y eso paró su construcción
> (`ESQUEMA-CMS.md` §2d.4). **Un arquetipo con decisión de modelo escrita puede
> seguir sin ser construible**, y hasta hoy no había dónde leerlo.
>
> ✅ **CORREGIDO 2026-08-10: `articulos-kb` pasa a ESPECIFICADO.** Sus specs
> viven en **`docs/research/articulos-kb/`** —no en `grupo-D/`, que se queda como
> el recon— con `MEDICION.md` y `components/{cascaron,cuerpo,modulos}.spec.md`,
> sobre `medidas/kb-spec-{1440,390}.json` y `kb-tests.json`.
>
> **Y el tercer estado resultó tener un estado ANTES que nadie había nombrado:
> dónde se puede medir.** Especificar es `getComputedStyle` por sección, y eso
> necesita las hojas de estilo: de las **19** que el HTML de KB pide, la captura
> congelada tiene **0**. La captura **renderiza igual** —trae 184 KB de CSS en
> línea— así que una spec medida ahí sale **plausible y equivocada** (55 de 210
> anclas mal). O sea:
>
> > **CENSADO → RECONOCIDO → *MEDIBLE* → ESPECIFICADO.** Y «medible» no es una
> > propiedad del arquetipo: es una propiedad **del corpus que se tiene**, y se
> > pierde en silencio cuando el corpus no trae lo que el instrumento necesita.
>
> Ficha: `PENDIENTES-QA.md` §F3-1-CSS-NO-CAPTURADO.
>
> ⚠ **Sigue sin ser CONSTRUIDO**, y no se lea «especificado» como avance de
> construcción: es 1 de los 6 pasos del orden obligado de §2d.4.
>
> ✅ **2026-08-10 (2.ª tanda del día): pasa a MODELADO y POBLADO — 2 de los 6
> pasos más.** El esquema expresa la retícula (39 filas · 54 columnas · 143
> módulos, cuatro repartos) y la colección **está sembrada con sus 6
> instancias**, derivadas de las medidas congeladas por `cms:extractor-kb`.
>
> **Y hay que nombrar el estado, porque el censo tampoco lo tenía:** un
> arquetipo puede estar **POBLADO y no SERVIDO**. Las 6 rutas **no se emiten**
> —falta la plantilla (PASO 3) y la ruta (PASO 4)—, así que:
>
> > **CENSADO → RECONOCIDO → MEDIBLE → ESPECIFICADO → MODELADO → POBLADO →
> > *SERVIDO* → COMPARADO.** Y sólo desde SERVIDO puede correr una sonda de las
> > que este repo llama medir: **todas leen HTML servido**, así que un arquetipo
> > poblado y no servido tiene cobertura **cero** por construcción, no por
> > descuido.
>
> Es la razón operativa de que `COBERTURA-MEDICION.md` **no gane hoy ni la forma
> ni el lector de `c-cmp`**: declarar una familia contra rutas que no se emiten
> sería estrenar una guarda sin nada contra qué ejercitarla, que es exactamente
> lo que la tanda anterior decidió no hacer.
>
> ⚠ **2026-08-10 (3.ª tanda del día): sigue en POBLADO — y esta vez el estado no
> se movió por una razón que conviene distinguir de la anterior.**
>
> La tanda anterior paró en un ESCALÓN —una piel que el content type no podía
> expresar—. **Ese escalón está CERRADO** (`PENDIENTES-QA.md`
> §F3-1-ESCALON-TIPOGRAFIA): el campo existe, está migrado y la colección está
> **re-sembrada con él** (21 pieles de titular + 36 de blurb, verificadas en DB).
> Lo que no cupo fue la **construcción** de la plantilla y la ruta.
>
> > **La distinción importa para leer el censo: «POBLADO» significa hoy lo mismo
> > que ayer, pero por un motivo distinto.** Ayer había una decisión abierta que
> > bloqueaba; hoy no queda ninguna — queda trabajo. Un censo que no separa
> > *bloqueado* de *pendiente* invita a releer la parada anterior como si siguiera
> > vigente, y no lo está.
>
> Y lo que la tanda sí añadió al camino: el arquetipo pasó a tener **dos
> testigos independientes de su dato** —el estilo computado (`kb-spec`) y el CSS
> que Divi compiló (`qa:pieles`)—, cruzados módulo a módulo, con la regla de que
> *un override que el computado ve y ninguna regla explica se nombra*. Eso no es
> un estado del censo, pero es lo que hará auditable el SERVIDO cuando llegue.

## 0 · De dónde salen los números, y qué NO cubren

Fuente: los **11 sub-sitemaps** de `https://kunakair.com/sitemap_index.xml`
(Yoast), filtrados a la **rama `/es`** — que es la única que el clon reproduce
(`scripts/qa/enlaces.mjs`, constante `RAMA`). La raíz, `/fr/` y `/en/` son otras
páginas y quedan fuera por definición.

| sub-sitemap | URLs totales | en `/es` |
|---|---|---|
| `post` | 382 | 150 |
| `page` | 131 | 33 |
| `solutions` | 97 | 24 |
| `case-studies` | 187 | 58 |
| `glossary` | 117 | 38 |
| `scientific-docs` | 69 | 23 |
| `faqs` | 81 | 20 |
| `post_tag` | 48 | 12 |
| `resources` | 36 | 10 |
| `scientific-category` | 9 | 3 |
| `author` | 5 | 0 |
| **total** | | **371 → 370 únicas** (`casos-de-exito` sale en dos) |

⚠ **El sitemap NO es el sitio.** Yoast omite lo que está en `noindex`, y ahí vive
una familia entera. Comprobadas a mano **10 páginas que existen (HTTP 200) y no
aparecen en ningún sitemap**:

```
politica-de-seguridad-de-la-informacion          aviso-legal
politica-de-privacidad-y-de-proteccion-de-datos  politica-de-cookies
descarga-catalogo                                newsletter
informe-tecnico-control-de-la-calidad-del-aire-en-ciudades
informe-tecnico-control-de-la-calidad-del-aire-en-industria
soporte                                          soporte/servicio-de-reparacion
```

**Ese 10 es un suelo, no un total**: se encontraron porque el clon ya tenía sus
`href` transcritos en `footer.ts`, `monitor.ts` y `monografico.ts`. Las páginas
`noindex` a las que no enlaza nada de lo ya clonado **no están contadas**. Todo lo
que sigue va sobre **380 páginas conocidas**, y el verdadero total es ≥ 380.

> ✅ **MEDIDO el 2026-08-09 (F3-0), y el «≥ 380» se puede sustituir por un
> número con su alcance.** La campaña de captura de la FASE 3 derivó la unión de
> **seis** fuentes —los 11 sub-sitemaps, los `href` de las 309 páginas
> congeladas del corpus, los del clon, el bloque `noindex` de este documento, el
> inventario del grupo D y el censo de listados— y salieron **685 rutas
> distintas de `/es/`**. Evidencia: `corpus/fase-3/INDICE.json`.
>
> **Los tres resultados que corrigen a esta sección:**
>
> 1. **El sitemap no aporta NADA en exclusiva.** Sus 370 URLs de `/es` ya eran
>    todas alcanzables desde el corpus congelado. O sea que la captura de F2-2
>    era un **superconjunto** del sitemap, y nadie lo había comprobado;
> 2. **hay TRES familias de archivo que este censo no tiene**, y ninguna está en
>    ningún sitemap: `/es/categoria/*` (4 términos + 2 formas **acentuadas** que
>    301), **`/es/author/*` (34 rutas vivas, 29 sólo en `author/kunak`)** y
>    `/es/sector/*` (11, de las que **5 redirigen** a `/es/sectores/*`). El §4 de
>    abajo cuenta **23** archivos de taxonomía; con éstas son **muchas más**;
> 3. **la cola larga de «26 páginas» tenía más ejemplares de los enumerados**:
>    los `informe-tecnico-*` son **5** y aquí se citan 2, y aparece
>    `sistema-interno-de-informacion`, que no está en la lista de 10 de arriba.
>
> **Y el 685 tampoco es «el sitio»:** es la unión de lo que seis fuentes
> conocidas alcanzan. Sigue siendo un suelo — mejor medido, con su derivación
> commiteada, y ya no citable de memoria.

## 1 · El resultado, en una tabla

| cubo | páginas | formas de página distintas |
|---|---|---|
| **A · cubiertas** por un arquetipo existente | **13** | 7 |
| **B · dudosas**: misma familia, plantilla sin verificar | **20** | 2 |
| **C · sin cubrir**: ninguna se parece a lo que tenemos | **347** | **14** |
| | **380** | **23** |

Los dos porcentajes, porque cuentan cosas distintas y solo juntos dicen la verdad:

- **Por páginas: 13 de 380 → 3.4 %.** Engañoso a la baja: 149 entradas de blog
  son *un* arquetipo, no 149.
- **Por formas de página: 7 de 23 → 30 %.** Es la cifra que importa, porque un
  arquetipo se paga una vez y sirve para todas sus instancias.

**La biblioteca no está completa: le falta cerca del 70 % de las formas**, y las
que faltan no son variantes de las que hay — son otra familia. Los 7 arquetipos
actuales son todos **páginas de marketing de producto o de sector**; lo que falta
es, en su mayoría, **contenido editorial y listados**.

## 2 · Cubo A — cubiertas por un arquetipo existente (13 páginas · 7 formas)

| forma | arquetipo | páginas | ¿emitida por el clon? |
|---|---|---|---|
| home | HOME | 1 · `/es/` | sí |
| sector clásico | SECTOR | 6 · `sectores/*` | 4 de 6 (Puertos y Minería fuera **a propósito**) |
| monográfico técnico | MONOGRÁFICO TÉCNICO | 2 · edar · petroleo-y-gas | sí |
| producto | PRODUCTO | 1 · `monitor-calidad-aire` | sí |
| catálogo | CATÁLOGO (CPT `solutions`) | 1 · `accesorios` | sí |
| software/plataforma | SOFTWARE/PLATAFORMA | 1 · `software-de-medicion-calidad-del-aire` | sí |
| variante corta | — (variante, no arquetipo) | 1 · `kunak-api` | sí |

**El arquetipo SECTOR es el único con rendimiento de escala demostrado**: 6
instancias de una plantilla, y dar de alta una es añadir datos. Los otros seis
tienen **una instancia cada uno**, así que de ellos todavía no se sabe qué es
plantilla y qué es campo — que es exactamente lo que enseñó la tanda del
monográfico (8 propiedades invisibles en la primera página) y lo que dice el
`⚠ CORRIGE` de `seccion-editorial.spec.md`.

## 3 · Cubo B — dudosas (20 páginas · 2 formas)

Mismo CPT `solutions` que PRODUCTO y CATÁLOGO, así que **probablemente** salen de
una plantilla que ya tenemos o de una variante corta. **No se ha medido ninguna**,
y por eso están aquí y no en A: dar por cubierta una página por compartir CPT es
la suposición que este proyecto ya ha pagado tres veces.

| forma | páginas | la duda concreta |
|---|---|---|
| **cartucho inteligente** (ficha de gas) | **17** · `cartuchos-inteligentes/*` | 17 instancias de una misma plantilla. ¿Es PRODUCTO reducido, o un arquetipo FICHA con su propio modelo? Con 17 instancias, es el mejor sitio del sitio para separar plantilla de campo |
| otra ficha del CPT `solutions` | 3 · `estacion-de-monitoreo-de-calidad-del-aire` · `sensor-de-calidad-del-aire` · `sensor-de-calidad-del-aire/metano` | las dos primeras ya viven en `PRODUCTS_TABS` como productos; ¿usan la plantilla de `monitor-calidad-aire`? Y la tercera cuelga de la segunda: ¿ficha hija o variante? |

Resolverlas es **recon, no build**: un barrido de topología por página y
comparar. Barato, y mueve 20 páginas de "no se sabe" a A o a C.

## 4 · Cubo C — formas que ningún arquetipo cubre (347 páginas · 14 formas)

| forma | páginas | qué es |
|---|---|---|
| **ENTRADA DE BLOG** | **149** | `post`, sin prefijo de ruta |
| **CASO DE ÉXITO** | **57** | CPT `case-studies` |
| **TÉRMINO DE KUNAKPEDIA** | **37** | CPT `glossary` — glosario técnico |
| **DOCUMENTO CIENTÍFICO** | **23** | CPT `scientific-docs`, bajo `recursos/documentos-cientificos/` |
| **ARCHIVO DE TAXONOMÍA** | **23** | 12 `etiqueta/*` + 8 `recursos/articulos/*` + 3 `scientific-category/*` |
| **FAQ suelta** | **19** | CPT `faqs` |
| **CENTRO DE AYUDA (KB)** | **13** | `centro-de-ayuda/*` y `soporte/centro-de-ayuda/*`: hubs, artículos y vídeo-tutoriales |
| **ÍNDICE / HUB de listado** | **12** | `productos` · `sectores` · `recursos` · `casos-de-exito` · `blog` · `glosario` · `preguntas-frecuentes` · `recursos/{articulos,seminarios-web,kunakpedia,documentos-cientificos,preguntas-frecuentes}` |
| **LEGAL** | **4** | `noindex`: aviso legal, privacidad, cookies, seguridad de la información |
| **LANDING DE DESCARGA** (gated) | **3** | `noindex`: `descarga-catalogo` + 2 `informe-tecnico-*`. **Son el destino de los CTA que el clon ya pinta** |
| **EMPRESA / QUIÉNES SOMOS** | **2** | `empresa` · `empresa/premios-y-reconocimientos` |
| **SUSCRIPCIÓN** | **2** | `suscribete` · `newsletter` (`noindex`) |
| **SOPORTE** | **2** | `noindex`: `soporte` · `soporte/servicio-de-reparacion` |
| **CONTACTO** (formulario) | **1** | `contacto` |

### La forma del trabajo que falta, que es lo útil del censo

**7 de las 14 formas son «una plantilla, muchas instancias», y se comen 321 de las
347 páginas** (92.5 %): entrada de blog, caso de éxito, término, documento
científico, FAQ, archivo de taxonomía y artículo de KB.

Las otras **7 formas son 26 páginas en total** — cola larga de páginas casi
únicas: hubs, legales, landings, empresa, suscripción, soporte, contacto.

O sea que la biblioteca no le debe al sitio 347 páginas: le debe **7 plantillas de
listado/editorial y 7 páginas más o menos sueltas.** Y ninguna de las 14 se
parece a lo que hay: los 7 arquetipos actuales son páginas de venta con hero,
bloques de beneficios y cola comercial; esto es **contenido con fecha, autor,
taxonomía y paginación**, que es otro modelo de datos.

**El eslabón que ya se está usando sin tener arquetipo.** El clon **ya pinta**
tarjetas de caso de éxito (`UltimosProyectos`), de entrada de blog
(`UltimosArticulos`) y sus CTA a los índices, con los datos escritos a mano en
`projects.ts` y `articles.ts`. O sea: **el modelo de las dos formas más numerosas
del sitio ya está a medias en el repo, por el lado de la tarjeta, y le falta la
página de destino.** Ese es el estado real, no "no hay nada".

## 5 · Dos cosas que el censo destapó y conviene no perder

**1 · Cuatro casos de éxito viven bajo el slug inglés.** 53 están en
`/es/casos-de-exito/…` y **4 en `/es/case-studies/…`**:

```
case-studies/distrito-baja-emision-rio-de-janeiro
case-studies/monitoreo-ambiental-en-el-puerto-de-cotonu
case-studies/monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario
case-studies/monitorizacion-calidad-aire-planta-fertilizantes-lifeco
```

No es una errata de transcripción: está así en el sitemap del original. Importa
porque el día que exista el arquetipo CASO DE ÉXITO, **su ruta no es un patrón,
son dos** — y `enlaces.mjs` empezará a exigirlo. Encaja con lo ya anotado en
`sectores.ts`: el CTA «Ver todos los casos de éxito» apunta a
`https://kunakair.com/case-studies/`, **sin `/es/`**.

**2 · Los 37 términos de Kunakpedia cuelgan de la raíz de `/es/`**, sin prefijo
(`/es/sensor-calidad-aire`, `/es/glosario`), al mismo nivel que `contacto` o
`empresa`. En un CMS eso es un **espacio de nombres compartido entre páginas y
CPT**, y es el tipo de detalle que decide el esquema de rutas. Anotado antes de
que sea una sorpresa.

**3 · Menor, pero es un enlace vivo:** `footer.ts` apunta a
`https://kunakair.com/es/recursos/guias/`, que devuelve **301**. No lo caza
`enlaces.mjs` —su trabajo es otro: que no apuntemos fuera a algo ya clonado— pero
es un href a un redirect.

## 6 · Qué NO dice este documento

No dice qué construir, ni en qué orden, ni si merece la pena. Dice **cuánto falta
y de qué tipo**, que es lo que no se sabía. La decisión sigue abierta y ahora se
puede tomar con los números delante en vez de a ciegas.
