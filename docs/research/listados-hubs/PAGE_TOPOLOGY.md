# RECON LISTADOS + HUBS — ¿los 12 índices y los 23 archivos son un arquetipo o varios?

> **2026-07-31. Recon en frío: solo datos, cero construcción, cero decisiones de
> modelado** (esas van a la fase de decisión — última sección). Continúa
> `RECON-LISTADOS.md`, que dejó los grupos A–D medidos y a los hubs fuera del
> alcance. Sonda: `scripts/qa/lh-censo.mjs` (`npm run qa:lh`), fetch+parseo del
> HTML **servido** — la pregunta es de topología servida y un navegador solo
> añadiría mutaciones de JS que aquí no se miden. Salidas congeladas:
> `medidas/lh-regimen.json` · `medidas/lh-censo.json`.
>
> **Alcance declarado:** los **12 ÍNDICE/HUB** del censo (`CENSO-ARQUETIPOS.md`
> §4) y los **23 ARCHIVO DE TAXONOMÍA** (12 `etiqueta/*` + 8
> `recursos/articulos/*` + 3 `scientific-category/*`), leídos de los
> sub-sitemaps y reconciliados: **cuadran 12+8+3**. La cola larga (empresa,
> legales, contacto, soporte, landings) **NO entra**: es tanda propia.

## 1 · RÉGIMEN, antes de cualquier test (PASO 1)

Una línea del `<body>` servido por cada una de las 35 (`lh-regimen.json`,
2026-07-31). La sospecha de mezcla se confirma: **cuatro regímenes**, y este
reparto es el primer dato del recon:

| régimen | páginas | cuáles |
|---|---|---|
| **página de BUILDER** (`et_pb_pagebuilder_layout`, `page-id-N`, sin `tb_body`) | **6** | `productos` · `sectores` · `recursos` · `recursos/kunakpedia` · `recursos/documentos-cientificos` · `recursos/preguntas-frecuentes` |
| **página con PLANTILLA PHP propia** (`page-template-case-studies-php`) | **1** | `casos-de-exito` |
| **ARCHIVO con `tb_body`** (`archive`/`blog` + `et-tb-has-body`) | **23** | los 12 `etiqueta/*` + los 8 `recursos/articulos/*` + `blog` + `recursos/articulos` + `recursos/seminarios-web` |
| **ARCHIVO SIN `tb_body`** (`archive`, plantilla de tema) | **5** | `glosario` · `preguntas-frecuentes` · los 3 `scientific-category/*` |

Tres lecturas inmediatas, todas de dato servido:

1. **«Hub» era una etiqueta del censo, no un régimen.** De los 12, seis son
   páginas compuestas en el builder (la naturaleza de SECTOR/MONOGRÁFICO), una
   tiene plantilla PHP propia (la naturaleza del grupo C), y **cinco son
   archivos de WordPress** — tres de ellos (`blog`, `recursos/articulos`,
   `recursos/seminarios-web`) literalmente **archivos de término** con
   `tb_body`, iguales por régimen a los 20 archivos del grupo B. Los dos de
   `recursos/*` son los **términos padre** de la taxonomía jerárquica
   `resources` (`term-articulos` · `term-seminarios-web`); los 8 del censo son
   sus hijos.
2. **El grupo B del recon anterior estaba medido solo en `etiqueta/*`, y no
   cubre a los 3 `scientific-category/*`**: estos van **sin `et-tb-has-body`**
   — su cuerpo lo emite la plantilla del tema, no el Theme Builder. Mismo
   reparto de regímenes que separó al grupo C del A.
3. `glosario` y `preguntas-frecuentes` (raíz) son también archivos **sin**
   `tb_body` — el archivo de CPT (`glossary`, `faqs`) no comparte plantilla de
   cuerpo con el archivo de etiquetas del blog.

## 2 · PRE-REGISTRO — escrito ANTES de mirar un esqueleto (PASOS 2 y 3)

Se registra ahora, con el régimen ya visto y **ningún esqueleto mirado**, por
la razón de siempre: escrito después sería escrito sabiendo qué conviene.

### El plan de muestreo (PASO 2)

- **Censo 35/35** para todo lo que sea fetch+parseo: régimen, reparto de
  secciones por origen (`_tb_body` vs propias), módulo `post_content`,
  paginación (patrón y máximo), nº de tarjetas y muestra de sus campos.
- **Muestra adversaria SOLO para lectura fina** (esqueleto sección a sección,
  campos por tarjeta), elegida por máquina con **semilla fija 1440**
  (mulberry32): 4 hubs de 12 · 3 `etiqueta` de 12 · 3 `resources` de 8 · 2
  `scientific-category` de 3, **más dos por regla adversaria**: el listado con
  MÁS tarjetas y el que MENOS (los extremos que un formulario servirá). La
  muestra la imprime y congela la sonda.

### La hipótesis (PASO 3)

> **H-LH1** — Los **23 archivos con `tb_body`** (las tres familias: etiqueta,
> resources padre e hijos, blog) son **UNA plantilla** — un solo arquetipo
> LISTADO con la consulta como parámetro.
>
> **H-LH2** — Los **5 archivos sin `tb_body`** son **otro** arquetipo (o
> varios): plantilla de tema, como el grupo C respecto al A.
>
> **H-LH3** — Los **6 hubs de builder** NO son un arquetipo de listado: son
> páginas compuestas por instancia (la naturaleza de SECTOR), y su parecido
> entre sí es cuestión de la fase de decisión, no de plantilla compartida.
>
> **H-LH0** — Cualquier reparto distinto: más arquetipos dentro de los
> `tb_body`, o menos de los que el régimen sugiere.

### Qué hallazgo cambiaría el veredicto — registrado antes de mirar

**No se añaden criterios después.**

| # | hallazgo | efecto sobre el veredicto |
|---|---|---|
| **PL-F1** | dos archivos `tb_body` con **distinto nº o secuencia de secciones `tb_body`** | parte H-LH1: el grupo B son ≥2 plantillas |
| **PL-F2** | un archivo clasificado «sin `tb_body`» cuyo cuerpo resulte tener secciones **propias** (builder) | régimen mal leído para esa página: **se re-mide y se descarta su fila** de esta corrida — no se acomoda el veredicto |
| **PL-F3** | un hub de builder con **rejilla de entradas por consulta** (módulo blog/portfolio dentro del builder) | tercera naturaleza de listado («listado compuesto»): obliga a separar hub de listado también en el modelado |
| **PL-F4** | tarjetas con **campos distintos** entre familias (p. ej. fecha en unas y no en otras) | NO parte arquetipos — es proyección/campo — pero fija la proyección de teaser por familia y se anota como tal |
| **PL-F5** | un archivo `tb_body` **sin paginación y sin rejilla** | señal de medida rota (un archivo sin listado no es un archivo): se re-mide esa página antes de contarla |

**Y el límite de la muestra, dicho antes:** el censo 35/35 cubre las señales de
esqueleto de primer nivel; la lectura fina va sobre 12+2 páginas. Un veredicto
«varios» será firme (refutar es barato); un «uno» dentro de cada grupo será
**provisional** al nivel de detalle que la lectura fina no cubra — la tanda del
monográfico enseñó que 8 propiedades no se ven en la primera instancia.

---

## 3 · El censo 35/35 (`medidas/lh-censo.json`)

Leído del HTML servido, 2026-07-31. **Réplica:** dos corridas independientes
separadas ~1 min dieron **la misma medida estructural** (idénticas ignorando
`cargaMs`) — lo que por el protocolo de C-QA6 se lee «no se observó variación
en este episodio», no «es estable».

### 3.1 · El esqueleto, por régimen

| régimen | páginas | secciones Divi | secciones `tb_body` | módulo `post_content` |
|---|---|---|---|---|
| **ARCHIVO con `tb_body`** | **23** | **6 en las 23** | **2 en las 23** | no |
| **ARCHIVO de CPT sin `tb_body`** | 2 (`glosario` · `preguntas-frecuentes`) | **4** | 0 | no |
| **ARCHIVO de taxonomía sin `tb_body`** | 3 (`scientific-category/*`) | **5** | 0 | no |
| **HUB de builder** | 6 | **6 · 7 · 8 · 6 · 7 · 6** | 0 | no |
| **HUB con plantilla PHP** | 1 (`casos-de-exito`) | 6 | 0 | no |

Dos lecturas que se sostienen solas:

- **Los 23 con `tb_body` no tienen ni una excepción**: 6 secciones y 2 `tb_body`
  en las 23, sean etiqueta, términos de `resources` (padre o hijo) o el propio
  `/es/blog/`. Es el patrón de uniformidad que en el grupo A fue la prueba de
  plantilla compartida.
- **Los 6 de builder oscilan** (6·7·8·6·7·6), que es exactamente lo que hace una
  página compuesta por instancia — la firma de SECTOR y MONOGRÁFICO.

**Y el módulo `post_content` no está en NINGUNA de las 35**, lo cual es
coherente y esperado: ninguna de estas páginas es un detalle. (Ese dato costó
una corrección de sonda — §6.)

### 3.2 · Cuántas entradas lista cada uno

| listado | tarjetas en la 1.ª página |
|---|---|
| `/es/casos-de-exito/` | **57 — las 57, sin paginar** |
| `/es/recursos/articulos/` y 3 de sus hijos | **15** |
| `/es/blog/` · la mayoría de `etiqueta/*` | **9** |
| `scientific-category/*` | 14 · 8 · 1 |
| `glosario` · `preguntas-frecuentes` | **5** |
| `/es/recursos/seminarios-web/` · `petroleo-y-gas` | 3 |
| **hubs de builder** | **0 … salvo `/es/recursos/`, que lista 3** |

El número por página **no es constante entre familias** (9 · 15 · 5 · 3): es un
parámetro de la consulta, y por el test B de `CLAUDE.md` eso lo hace **campo**
del listado, no plantilla. Se anota; **no se modela aquí**.

## 4 · VEREDICTO (PASO 3) — no son uno: son **cinco formas**, y una refuta el propio pre-registro

**H-LH1 se sostiene** — los 23 archivos con `tb_body` son **una** plantilla en
todo lo que este censo mira: **PL-F1 no se disparó** (ni una diferencia de nº
ni de reparto de secciones en 23 páginas).

**H-LH2 se refina, y a peor**: los 5 sin `tb_body` **no son una forma, son
dos** — 4 secciones los archivos de CPT (`glossary`, `faqs`) y 5 los de
taxonomía (`scientific-category`). El censo anterior los metía a los 3
`scientific-category` en el grupo B junto a las etiquetas, y **su régimen es
otro**.

**H-LH3 se sostiene**: los 6 hubs de builder no son un arquetipo de listado.

**PL-F3 SE DISPARÓ, y estaba pre-registrado**: `/es/recursos/` es una página de
builder **con rejilla de entradas por consulta dentro** (3 tarjetas
`et_pb_post`, el módulo blog de Divi). Por el pre-registro eso es «tercera
naturaleza de listado (*listado compuesto*), que obliga a separar hub de
listado también en el modelado». Se registra como disparado; **la consecuencia
de modelado es de la fase de decisión**.

| # | forma | páginas | qué la separa |
|---|---|---|---|
| **L1** | ARCHIVO PLANTILLADO | **23** | `tb_body` de 2 secciones; el medio es una consulta |
| **L2** | ARCHIVO DE CPT (plantilla de tema) | 2 | sin `tb_body`, 4 secciones |
| **L3** | ARCHIVO DE TAXONOMÍA (plantilla de tema) | 3 | sin `tb_body`, 5 secciones |
| **L4** | HUB DE BUILDER | 6 | compuesto por instancia; **uno de ellos lleva listado dentro** |
| **L5** | HUB CON PLANTILLA PHP PROPIA | 1 | `case-studies-template`, lista las 57 sin paginar |

**Lo que el veredicto es y lo que no.** «Varios» es **firme** (refutar es
barato: basta una diferencia estructural, y hay cuatro). Que L1 sea **una sola**
plantilla es **provisional al nivel que este censo mira** — primer nivel de
secciones. La lectura fina de la muestra adversaria (13 páginas, semilla 1440)
no se ha hecho en esta tanda y queda anotada.

## 5 · PAGINACIÓN (PASO 4) — 107 rutas extra, y la primera cifra era menos de la mitad

> Sonda `scripts/qa/lh-paginas.mjs` (`npm run qa:lh-paginas`), congelada en
> `medidas/lh-paginas.json`. **El final de cada listado se le pregunta al
> servidor** —exponencial hasta el primer 404 y luego binaria—, porque leerlo
> del HTML **no vale**: `paginate_links` imprime una ventana (`1 2 3 … 8
> Siguiente`), no la lista.

| | |
|---|---|
| **patrón de ruta** | **`/page/N/`** — sin excepción en las 35 |
| listados que **paginan de verdad** | **21** de 35 |
| listados con **una sola página** de contenido | 7 |
| páginas que **ignoran `/page/N/`** | **7** (abajo) |
| **rutas totales, paginación incluida** | **142** |
| **páginas EXTRA** además de las 35 primeras | **107** |
| lo que decía la ventana de `paginate_links` | 56 — **subestimaba en 51** |

Los mayores: `etiqueta/monitorizacion-ambiental` **19** · `/es/blog/` **17** ·
`/es/recursos/articulos/` **16** · `/es/glosario/` **8**. En **13 de los 21** la
ventana se quedaba corta.

### ⚠ Y siete «hubs» NO paginan: sirven 200 para cualquier N

`/es/productos/page/999/` devuelve **200** con `<link rel="canonical">`
apuntando a **`/es/productos/`** — WordPress solo interpreta `/page/N/` cuando
hay un loop paginado; en una página normal lo ignora y sirve la misma. Son las
**7 que no son archivos** (los 6 hubs de builder + `casos-de-exito`), y el
canonical lo confirma en las 7.

> **Para el enrutado eso es 1 ruta, no 64.** Contarlas por su HTTP 200 habría
> inventado **441 rutas inexistentes** — y es lo que hizo la primera versión de
> esta sonda (§6, defecto 4).

Es además un dato **del original**, no nuestro: cualquier `/page/N/` de esas 7
es contenido duplicado infinito que solo el canonical salva. No se replica.

## 6 · ⚠ La sonda llegó con CUATRO defectos, y es parte del resultado

Como en `esqueleto.mjs`, se cuenta porque los tres **dieron números plausibles,
no errores** — y uno contradecía una medida buena del proyecto, que fue lo
único que lo delató.

| # | daba | era | cómo se cazó |
|---|---|---|---|
| **1** | `post_content` = **sí en las 35** | `et_pb_post_content` aparece 2 veces y **las 2 dentro de `<style>`**: era el CSS de Divi | contradecía `RECON-LISTADOS.md`, que midió ese módulo sobre el DOM y dio **no** en archivo de taxonomía |
| **2** | **0 tarjetas** en los 3 `scientific-category` | usan el **loop del tema** (`<article class="… type-scientific-docs">`), no el módulo Divi. La sonda solo miraba `et_pb_post` | un archivo con paginación y sin rejilla es imposible — olía a PL-F5 |
| **3** | **1 tarjeta** en las 6 páginas de builder, **4** en `/es/recursos/` (que lista 3) | al ampliar a `type-*` entró el **wrapper de la propia página**: `<article class="… page type-page">` | el «1» clavado en seis páginas distintas |
| **4** | **64 páginas** en 7 listados (`lh-paginas`) | 64 era el `MAX` de la sonda: esas rutas **sirven 200 para cualquier N**. Contarlas inventaba **441 rutas**. La sonda **imprimía «⚠ TOPE» y sumaba el número igual** — la regla 1 rota dentro del propio informe, como le pasó a `ruido.mjs` con las filas variables | el 64 exacto repetido en 7 sitios |

**Y de aquí sale una guarda nueva, hermana de la regla 4 de `CLAUDE.md`:**

> **La regla 4 dice que un selector que no casa con nada no es un cero, es un
> defecto. Su complementario: un patrón que casa en TODAS tampoco mide nada —
> y encima parece un dato.** `min` protege del primer caso; para el segundo,
> todo patrón cuyo trabajo sea *discriminar* declara un **`max`**, y superarlo
> cierra el código de salida en 2 igual que un patrón muerto.

Implementada en `lh-censo.mjs`, y el **test en negativo cubre las dos guardas
en una corrida** (`SABOTAJE=1`: un selector inventado → MUERTO, un `max` a 0 →
UBICUO; exit 2 con los dos mensajes). Re-corrido entero tras cada uno de los
tres arreglos, como manda la regla 3.

**Custodia de las medidas defectuosas:** se conservan con el nombre diciendo lo
que son (§`medidas/lh-censo-SONDA-DEFECTUOSA-*.json`), aplicando la lección de
la mina de custodia del 2026-07-31 — el nombre canónico contiene la medida
buena.

## 7 · Relación con lo ya construido (PASO 5)

### 7.1 · Ninguno de los 12 hubs existe en el clon

Verificado contra **las rutas que emite el build** (`.next/prerender-manifest`,
18 rutas), no contra una lista a mano: `/productos` · `/sectores` ·
`/casos-de-exito` · `/faqs` · `/blog` · `/glosario` · `/recursos` ·
`/preguntas-frecuentes` → **ninguna emitida**. Los 12 son **rutas nuevas**.

Y el matiz que importa: **`/casos-de-exito` y `/faqs` tienen su DETALLE
construido** (grupo C, 4 casos y 2 FAQ) **y no tienen índice**. El par
listado→detalle del clon está hoy **invertido** respecto al grupo A, donde pasa
lo contrario.

### 7.2 · 25 enlaces del clon apuntan a 8 de los 12 hubs

Contados sobre `src/`, con el destino absoluto al original:

| hub | href | dónde |
|---|---|---|
| `/es/sectores/` | **7** | `sectores.ts` (migas de los 6 sectores + monográficos) |
| `/es/productos/` | **6** | `nav.ts`, `monitor.ts`, `software.ts`, `sectores.ts` |
| `/es/casos-de-exito/` | **5** | CTA «Ver todos los casos de éxito» de `UltimosProyectos` en varias páginas |
| `/es/recursos/` | **2** | `sectores.ts` |
| `/es/blog/` | **2** | CTA de `UltimosArticulos` |
| `recursos/{kunakpedia, documentos-cientificos, preguntas-frecuentes}` | **1** c/u | `nav.ts` |

> **La consecuencia llega sola, y ya pasó dos veces** (con el monográfico y con
> C-3): **el día que se emita cualquiera de estos hubs, sus `href` absolutos
> pasan a ser fallo de `qa:enlaces` sin tocar la sonda** — la guarda se deriva
> del `prerender-manifest`. **25 enlaces** están en esa situación. Conviene
> saberlo antes de emitir la primera ruta, no después.

### 7.3 · Qué tarjeta pintan, y qué hub NO se puede construir todavía

La proyección de teaser existe y está verificada (**S1**): `CaseStudy`
(`client · sector · sectorHref? · title · image · href`) y `BlogPost`
(`title · date · image · href · excerpt?`) en `src/types/kunak.ts`, pintadas por
`UltimosProyectos` / `UltimosArticulos` en 6 páginas. **Les falta lo mismo que
al content type: cuerpo, slug local, taxonomía y SEO.**

De ahí el reparto operativo, que es el dato útil de este paso:

| hub | lista contenido de | ¿se puede construir hoy? |
|---|---|---|
| `/productos` · `/sectores` | PRODUCTO · SECTOR (**construidos**) | **SÍ** — son los dos únicos con su detalle completo en el clon |
| `/casos-de-exito` | CASO (grupo C, **4 de 57**) | parcial: listaría 4 de 57 |
| `/preguntas-frecuentes` · `/recursos/preguntas-frecuentes` | FAQ (grupo C, **2 de 19**) | parcial: 2 de 19 |
| `/blog` · los 12 `etiqueta/*` · los 8 `recursos/articulos/*` | ENTRADA DE BLOG (**grupo A, sin construir**) | **no** |
| `/glosario` | TÉRMINO (**grupo A, sin construir**) | **no** |
| `/recursos/documentos-cientificos` · los 3 `scientific-category/*` | DOC. CIENTÍFICO (**grupo A, sin construir**) | **no** |
| `/recursos` · `/recursos/kunakpedia` · `/recursos/articulos` · `/recursos/seminarios-web` | mixto / índices de índices | depende de los anteriores |

**O sea: 26 de los 35 dependen del grupo A**, que es la parte de la biblioteca
sin construir. Es la respuesta concreta a «qué hubs no pueden construirse hasta
que exista su detalle».

## 8 · SIN PROBAR — lo que esta tanda NO midió

Explícito, para que nadie lo dé por medido:

| # | qué | por qué importa |
|---|---|---|
| **LH-SP1** | **La lectura fina de la muestra adversaria** (13 páginas, semilla 1440) — esqueleto sección a sección y campos por tarjeta | es lo que haría firme el «L1 es UNA plantilla». Hoy L1 está medido al **primer nivel de secciones** en 23/23, que es fuerte pero no es lo mismo |
| **LH-SP2** | **La geometría**: ni un píxel medido en esta tanda | el recon es de topología. Cuando se construya, hará falta el pase de `qa:banda`/`clon-base` como en los demás arquetipos |
| **LH-SP3** | **Qué ordena cada listado** y si el orden es estable entre cargas | si sortea como «Artículos y Guías» (P4), las tarjetas no son comparables px a px |
| **LH-SP4** | **La cola comercial** de cada forma (qué hay entre el listado y el pie) | el censo cuenta secciones, no las identifica una a una |
| **LH-SP5** | **Comportamiento**: filtros, buscador, carga por AJAX | no se abrió navegador. Si algún listado filtra en cliente, no se ha visto |
| **LH-SP6** | **Los 3 `scientific-category`** salen del sitemap, pero el censo de arquetipos los contaba en el grupo B junto a las etiquetas: **su régimen es otro** (L3) | el recuento «23 archivos de taxonomía = grupo B» del censo anterior **mezcla dos formas** |
| **LH-SP7** | Si los **7 que ignoran `/page/N/`** hacen lo mismo con otros sufijos | solo se probó `/page/N/` |

**No hay `BEHAVIORS.md` en esta tanda**, y es deliberado: no se abrió navegador,
así que no hay ni una interacción observada. Escribir el fichero con lo que
«seguramente hace» un listado sería justo lo que este proyecto no hace. Queda
como **LH-SP5**.

## 9 · PREGUNTAS PARA LA FASE DE DECISIÓN — planteadas, no contestadas

Ninguna se responde aquí. Son de modelado y van a su tanda, con el dato de este
recon delante.

1. **¿L1 es un arquetipo con la consulta como campo, o tres?** Los 23 comparten
   esqueleto y difieren en **qué consultan** (etiqueta · término de `resources` ·
   todas las entradas) y en **cuántas por página** (9 · 15 · 3). El patrón
   `flujo`/`variante` del proyecto sugiere campos; decidirlo es de la otra tanda.
2. **¿L2 y L3 se fusionan con L1?** Son archivos también, pero su cuerpo lo pone
   la plantilla del tema. Es la misma pregunta que separó C de A, y allí la
   respuesta fue «no».
3. **¿Los hubs de builder son «listados» o son páginas normales?** Cinco de seis
   no listan nada: son páginas de venta con enlaces. Si son páginas normales,
   **no cuestan arquetipo** — caen en la cola larga y su tanda es otra.
4. **¿Y `/es/recursos/`, que sí lista dentro del builder (PL-F3)?** Es el caso
   que obliga a decidir si «hub» y «listado» son dos cosas o una con un bloque.
5. **`/es/casos-de-exito/` lista las 57 sin paginar.** ¿Se replica (una página
   con 57 tarjetas) o se pagina como los demás? Es desviación deliberada o
   fidelidad, y se decide con su razón escrita.
6. **Las 107 rutas de paginación: ¿se emiten todas en build?** Con SSG y
   `dynamicParams = false` son 107 rutas más que construir y verificar. Toca el
   **§4 del ESQUEMA** y el coste de rebuild (**A-SP13**).
7. **¿Qué proyección de teaser usa cada listado?** Hoy el clon tiene dos
   (`CaseStudy`, `BlogPost`). El censo ve al menos cuatro tipos listados
   (entrada, caso, término, documento científico) — ¿son cuatro proyecciones o
   una con campos opcionales?
8. **El orden de resolución de rutas** sigue siendo el de CMS-2: los archivos
   viven en `/es/etiqueta/*` y `/es/scientific-category/*`, pero `glosario`,
   `blog` y `preguntas-frecuentes` cuelgan de la raíz — **dentro de los 202
   slugs de un solo plano** ya censados.
