# Las cinco decisiones del GRUPO C, argumentadas

> **C-2, 2026-07-30.** Escritas sobre el recon C-1 (`PAGE_TOPOLOGY.md`,
> `BEHAVIORS.md`) y sobre **agregaciones nuevas del censo congelado**
> (`scripts/qa/medidas/c-censo.json`, 76/76) — no se midió nada nuevo contra el
> original: todo lo citado sale de ficheros de `medidas/` o del código del clon.
> El content type resultante está en `MODELO.md`; el traslado a Payload, en
> `docs/ESQUEMA-CMS.md` §2b.

---

## 0 · ⚠ CORRIGE al recon — tres afirmaciones que el censo desdice

Leídas las 76 entradas del JSON congelado, tres frases de `PAGE_TOPOLOGY.md`
sobreafirman. Van aquí porque las tres tocan campos del modelo:

| el recon dice | el censo congelado dice |
|---|---|
| §5: «Presente en las 76: `title`, `meta description`, `canonical`, `og:image`» | **`description` falta en 4 `caso-es` y en las 19 FAQ** (53/57 y 0/19); **`og:image` falta en las 19 FAQ**. `title` y `canonical` sí están en las 76 |
| §2.1: el bloque de detalles trae «siempre los mismos rótulos: Cliente · Usuario · Ubicación · Sector · Año · Parámetros» | Cliente/Usuario/Ubicación/Año **57/57**; **Sector 53/57**; **Parámetros 56/57** |
| §2.1: `sector` presente **53/53 y 4/4** | la sonda contó **el nodo `.case-sectores`, no su contenido**: en 4 páginas el nodo está **vacío** (world-athletics · etiopía · almería · chipre). El dato real es **53/57** |

Y el hallazgo que cierra las dos últimas filas a la vez: **las 4 páginas con el
chip vacío son exactamente las 4 sin fila `Sector` en detalles**, y en las 53
restantes el valor de la fila **es igual al del chip, 53/53 sin excepción**. No
hay dos campos ni un interruptor de visibilidad: hay **un solo dato** (los
términos de sector del caso) con **dos proyecciones** (chip y fila), ausentes
las dos cuando el dato no existe.

---

## D1 · Caso de éxito y FAQ son DOS arquetipos

**Decisión: dos.** Por el esqueleto, con el mismo criterio pre-registrado que
separó los cuatro grupos en `RECON-LISTADOS.md` §1 — y aquí se disparan **tres
criterios cuando con uno bastaba**:

| criterio | caso | FAQ |
|---|---|---|
| **F2 · firma de secciones** | `tb_header · propia:migas · tb_footer ×4` | `tb_header · tb_footer ×3` — **cero secciones propias** |
| **F3 · elemento estructural exclusivo** | sección de migas + 4ª sección del pie | ninguna de las dos |
| **F1 · naturaleza del cuerpo** | campos estructurados (ACF) + **3 bloques ricos fijos** | **un** `entry-content` corto |

Medido en **76/76 con varianza cero dentro de cada forma** (`c-censo.json`,
eje `firmaSecciones`): no es que dos instancias difieran, es que las dos
poblaciones enteras difieren. EDAR y Petróleo fueron **uno** porque su topología
coincidió medida original contra original; caso y FAQ son **dos** porque no
coincide en tres ejes.

**Qué comparten, y dónde parte la frontera.** Comparten el régimen (el tercero:
cabecera y pie por Theme Builder, cuerpo por PHP del tema hijo — §0 del recon),
el `tb_header`, las **tres últimas** secciones del pie
(`footer-links · footer-legal · footer-background`, que son el pie estándar del
sitio, el que el clon ya monta) y el contrato del campo rico §3.1. La frontera
parte **debajo de la cabecera**: todo lo demás — migas, cuerpo, la 4ª sección
del pie — es de cada arquetipo.

**Qué costaría absorberlo en uno.** Un discriminante `tipo: caso | faq` con
9 campos que solo aplican a una forma, una sección de migas condicional y un pie
condicional. Es la razón 2 de `ESQUEMA-CMS.md` §1.5b aplicada aquí: la
obligatoriedad de `titulo`/`cliente`/los 3 bloques dejaría de vivir en el
esquema y pasaría a lógica condicional del admin. No se compra nada a cambio:
las dos formas no comparten ni un campo de contenido más allá de
`slug · titulo · seo`.

**Condición de reapertura:** ninguna realista. Se reabriría solo si el original
unificara las plantillas (`case-studies-template-default` ≡
`faqs-template-default`), que es observable en la línea del `<body>`.

---

## D2 · CMS-1 — UNA colección, el prefijo como campo con defecto

**Decisión: una sola colección `casos`, con campo
`prefijo: "casos-de-exito" | "case-studies"`, defecto `"casos-de-exito"`,
omitido del dato cuando coincide.** Solo los 4 ingleses lo llevan escrito. Es el
patrón de la casa (§1.5 de `ESQUEMA-CMS.md`): el defecto explícito es la
decisión que hereda quien dé de alta un caso nuevo.

**Por qué una colección y no dos.** El dato nuevo de C-1 manda: los 4 de
`/es/case-studies/` son **contenido propio en español** sobre **la misma
plantilla en los cinco ejes** (§4.1–4.2 del recon: mismas clases de `<body>`,
mismo reparto, misma firma, mismos bloques; 0 duplicados, 0 `hreflang`,
`canonical` propio). La única diferencia entre los 57 es **una palabra en la
URL**. Dos colecciones modelarían un accidente de enrutado como distinción de
contenido: partirían el índice (que **mezcla los 57**, medido dos veces —
censo y `BEHAVIORS.md` §5), duplicarían la definición entera de campos y
obligarían a las relaciones (`proyectos` de SECTOR, §1.4) a hacerse polimórficas
para apuntar «a un caso». Y una tabla de excepciones aparte deja el dato de la
ruta fuera del documento que la necesita: el campo con defecto **es** la tabla
de excepciones, viviendo donde se edita y visible en el admin.

**El registro de slugs del §4: los casos NO entran, y se dice explícito.** El
plano de `ESQUEMA-CMS.md` §4 son los **202 slugs de primer nivel** de `/es/`;
los 57 casos y las 19 FAQ son rutas **prefijadas**
(`/casos-de-exito/…`, `/case-studies/…`, `/faqs/…`) y no compiten en ese
espacio. Lo que sí vive en el plano — y ya está contado en las 202 — son los
slugs de los índices (`casos-de-exito`, `case-studies`, `faqs`,
`preguntas-frecuentes`). La unicidad que esta colección necesita es otra:
**slug único dentro de `casos` a través de ambos prefijos** (como WordPress la
da por CPT), nativa de Payload; ídem `faqs`. La guarda de build del §4 (3) no
cambia de alcance.

**C-SP2 (7 de 9 rutas cruzadas con 301, 2 con 404): el modelo es ROBUSTO a
cualquiera de las explicaciones, y no depende de resolverla.** El modelo asigna
a cada caso **una** ruta canónica (prefijo + slug), y esa ruta está medida
directamente en los 57 (sitemap + `canonical` propio, `c-rutas.json`). Las
redirecciones cruzadas son comportamiento de servicio del original, no dato del
contenido: que las produzca un plugin por entrada o el adivinador canónico de
WordPress no cambia qué ruta es la de cada caso. **El clon no emite las rutas
cruzadas** — no hay dato que las sostenga, y 2 de las 9 ya no existen ni en el
original.

Si algún día se quisiera replicar el 301 cruzado, **entonces sí** habría que
cerrar C-SP2, y la medición que lo cierra está escrita (no se corre aquí):
barrer las 57 rutas cruzadas completas con cabeceras sin seguir redirección
(ampliar `c-rutas.mjs` de 9 a 57) y leer la cabecera **`X-Redirect-By`** de las
respuestas 301 — WordPress la firma y los plugins de redirección la firman con
su nombre; es el discriminador directo entre «alias sistemático» y «regla por
entrada».

---

## D3 · El content type del caso, campo a campo

El tipo completo, con defaults, en `MODELO.md`. Aquí cada decisión con su
evidencia. Los números son del censo 76/76 salvo indicación.

**Constantes que van a PLANTILLA, no a campo — explícito para que nadie los
promocione después:**

| cadena | evidencia |
|---|---|
| sobretítulo **«Caso de éxito»** | un solo valor en 57/57 |
| títulos de bloque **«Necesidad · Solución · Resultados»** | constantes y en el mismo orden en 57/57 (`bloquesClase`, un solo orden en el corpus) |
| **«Detalles del proyecto»** y **«Soluciones»** | un solo valor en 57/57 (agregado en C-2) |
| los 6 rótulos de detalles | rótulos fijos; lo que varía es qué filas existen |
| el rótulo `Sector:`/`Sectores:` | derivado del número de términos (singular 49, plural 4) |

Por el discriminador del régimen plantillado (§0 del recon): cero varianza =
plantilla, y aquí la varianza es cero.

**Los campos, uno a uno:**

- **`titulo`** — texto, obligatorio (57/57). El `h1.entry-title`.
- **`cliente`** — texto, obligatorio (57/57). **55 valores distintos en 57**:
  prácticamente único, no hay nada que normalizar → texto, no relación. La fila
  «Cliente» de detalles es **proyección** (igual al campo en 57/57, comprobado
  en C-2).
- **`sectores`** — **relación 0..n a la colección nueva `taxonomia-sectores`**,
  opcional (53/57; los 4 sin ella, arriba). Evidencia de que es taxonomía y no
  cadena: **11 términos normalizados** en 57 asignaciones (Urbano 17 ·
  Industria 8 · Investigación y consultoría 7 · Puertos y aeropuertos 7 ·
  Minería 5 · Olores 5 · EDAR/PTAR 3 · Metalurgia 2 · Obras 1 · Oil & Gas 1 ·
  Sports 1 — las «15 cadenas» del recon son estas 11 contando los 4 chips
  plurales como cadenas propias), **4 casos con dos términos**, y las tarjetas
  ya clonadas (`src/lib/projects.ts`) enlazan el sector a
  **`/es/sector/<slug>/`** — un archivo de taxonomía, del territorio del
  grupo B. **NO** es relación directa a las páginas de SECTOR/MONOGRÁFICO:
  hay 11 términos y 8 páginas (Olores, Metalurgia, Sports y Obras no tienen
  página); el término lleva una relación **opcional** a su página
  (polimórfica, §1.5b) para quien la tenga. C-SP3 (el mecanismo interno de
  WordPress) queda abierta pero **ya no condiciona**: la taxonomía propia es
  robusta a ambas respuestas.
- **`necesidad` · `solucion` · `resultados`** — **tres campos ricos**,
  obligatorios los tres (57/57 cada uno). Tres y no uno-con-secciones ni un
  array: los títulos no son contenido (constantes 57/57), el orden no es
  contenido (un solo orden en el corpus), y con tres campos la obligatoriedad
  vive en el esquema. **C-SP4 (¿3 campos ACF o un `post_content` troceado?) no
  condiciona la decisión**: la salida servida muestra tres contenedores con
  clase propia, y tres campos la reproducen venga de donde venga — se decide
  por la salida servida, que es el principio del repo. Contrato: **§3.1 tal
  cual, sin construcción nueva** (§3 del recon); los flecos entran por los
  cauces ya abiertos — `iframe` por el nodo-embed con URL (§3.3b), `video` por
  el nodo de vídeo (§3.1b), las 2 `table` por §3.4 (sigue abierta), el único
  `script` exige sustituto (§3.3; leerlo es C-SP5), el `h5` degrada a `h4`.
- **`destacado`** — texto plano, opcional (49/57). **Las comillas son
  contenido**: 3 de los 49 las traen («×2, "×1) y el resto no — la plantilla no
  añade nada, el texto va verbatim. Si lleva marcado inline no se sabe
  (**C-SP9**, abajo); mientras, texto plano.
- **`galeria`** — **array de relaciones a media**, opcional (48/57), 3–15
  imágenes, mediana 7. No es un block: es media múltiple sin más estructura
  visible. El carrusel (swiper, clones, botones) es plantilla — `BEHAVIORS.md`
  §1. Leyendas y `alt` de autor: **C-SP10**.
- **`detalles`** — grupo: `usuario` (57/57) · `ubicacion` (57/57) · `anyo`
  (57/57) · `parametros` opcional (56/57 — falta en el caso del lindano, que es
  de agua). Las filas «Cliente» y «Sector» **no son campos**: son proyecciones
  de `cliente` y `sectores` (igualdad 57/57 y 53/53 + ausencia conjunta 4/4).
- **`ubicacionMapa`** — `{lat, lng}`, **un punto, no un array**, opcional
  (56/57; falta en 1 inglés). Evidencia: **exactamente 1 marcador en las 56**,
  ni una con dos. Condición de reapertura: el primer caso con 2 marcadores lo
  convierte en array. El dato vive en el HTML servido
  (`data-lat`/`data-lng`) y **se migra como dato del autor**.
  **El render es otra decisión y no la hereda el modelo**: `MapaProyectos` de
  SECTOR es placeholder deliberado (S3, sin clave de GCP) — este es *otro*
  componente (mapa de un punto, 330/290 de alto medido), y si C-3 decide
  también placeholder, lo decide en voz alta y va a `PENDIENTES-QA.md` con su
  razón, como S3. El modelo guarda las coordenadas igual en ambos casos.
- **`soluciones`** — **relación 0..n a la colección de productos** (la que
  §1.4 ya promete para SECTOR), opcional (53/57), 3–10 por caso. **La ficha del
  panel NO es contenido del caso — está probado en C-2**: los 640 nodos de
  panel del corpus (ya contando el duplicado responsive de `BEHAVIORS.md` §2)
  solo tienen **18 valores de `chars` distintos**, y los títulos de panel son
  **17 en todo el corpus** — un catálogo, no prosa por caso. Los `data-id` son
  slugs del CPT `solutions` (`monitor-calidad-aire`,
  `software-de-medicion-calidad-del-aire`, contaminantes «Datos fiables sobre
  el NO2»…). El caso guarda **qué** productos; la ficha se proyecta del
  producto. Dato sucio anotado para la migración: **una** ficha aparece en
  inglés («Air quality software», 1 caso) → se normaliza al producto ES al
  importar, no se modela.
- **`seo`** — grupo: `title` obligatorio (57/57) · `description` **opcional**
  (53/57 — la corrección del §0) · `ogImage` obligatorio en caso (57/57) ·
  `canonical` **derivado** de prefijo + slug (coincide con su URL en los 9
  comprobados de `c-rutas.json` y no se guarda).
- **`slug`** — único en la colección, a través de ambos prefijos (D2).
- **Las migas** — no son campo: las emite la plantilla PHP. Su contenido exacto
  no se censó (**C-SP8**); la predicción para C-3 es que se derivan de
  título e índice.

---

## D4 · La FAQ: colección propia, la más simple del proyecto — confirmado

**Confirmado contra censo y muestra: título + un cuerpo rico corto, y nada
más.** Las 19 tienen exactamente **un** `entry-content` (un solo `chars` por
página, 151–539, rango 3.6×), **cero** campos de caso (ni sobretítulo, ni
cliente, ni galería, ni mapa: `presencia.faq` = `{titulo: 19}`), y el perfil de
etiquetas entero — `p ul li a span br sub` — **cae dentro del §3.1 tal como
está**, sin tocar ni los cauces abiertos (0 iframes, 0 vídeos, 0 tablas,
0 scripts en las 19).

**Colección `faqs`: `slug · titulo · cuerpo · seo.title`.** El SEO es aún más
corto que el del caso: `description` y `ogImage` **ausentes en las 19**
(corrección del §0) — el grupo SEO compartido los deja vacíos, no los inventa.

**¿Arquetipo de página propio o entrada de la plantilla C con menos campos?**
Por D1, **arquetipo propio** — su cascarón no es el del caso (pie de 3, sin
migas) — pero es **el arquetipo más barato posible**: cabecera compartida +
`h1` + cuerpo rico + **el pie estándar del sitio, que el clon ya monta**. No
hay ni una pieza nueva que construir salvo la propia ruta. La asimetría con el
caso es la prueba de que D1 acertó la frontera: lo que los separa (migas, pie,
cuerpo estructurado) es exactamente lo que la FAQ no tiene.

El **archivo** `/es/preguntas-frecuentes/` (5 por página, con paginación — el
único listado paginado visto en el grupo) queda fuera: es un
`post-type-archive`, pariente del grupo B, y no necesita content type — es una
consulta. Se anota para cuando toquen los listados; C-3 no lo bloquea.

---

## D5 · C-SP1 (la 4ª sección del pie del caso): se difiere a C-3, y NO afecta al modelado

**Decisión: cero campos hoy; C-3 la abre antes de construir el pie.**

El argumento de por qué no afecta al modelo: la sección es de origen
**`tb_footer`** — la emite la plantilla de pie del Theme Builder, y en régimen
plantillado eso significa que **la fijó quien construyó la plantilla, para los
57 a la vez** (la lectura del §0 del recon). Su firma es idéntica en 57/57
(varianza cero en el eje `firmaSecciones`). No existe la persona que edita el
pie de *un* caso; no puede haber campo por instancia ahí.

**El riesgo residual, dicho en voz alta:** el censo midió la firma de la
sección, **no su interior**. Si dentro hubiera un módulo dinámico de Divi que
proyecte datos del post, habría contenido por instancia sin campo — improbable
en un pie, pero no imposible. Por eso la deferencia lleva **predicción
pre-registrada** (P-C3-1, abajo) en vez de cierre: si al abrirla en C-3 su HTML
difiere entre dos casos en algo no derivable del post, **D5 se reabre y puede
parir un campo**. Lo que D1 ya usa de ella — que existe y la FAQ no la tiene —
no depende de su contenido.

---

## SIN PROBAR — lo que C-2 deja abierto (numeración sigue al recon)

| # | qué | quién lo cierra |
|---|---|---|
| C-SP1–C-SP7 | siguen como las dejó el recon (C-SP2 con su medición de cierre escrita en D2; C-SP3 ya no condiciona el modelo — D3) | C-3 / import |
| **C-SP8** | el contenido exacto de las migas del caso (¿`Inicio > Casos de éxito > título`? ¿incluye sector?) | specs de C-3 |
| **C-SP9** | si `destacado` lleva marcado inline (el censo guardó texto, no el HTML del nodo) | specs de C-3 |
| **C-SP10** | leyendas y `alt` de autor en las imágenes de la galería | specs de C-3 |
| **C-SP11** | qué sirve el original en `/es/case-studies/` a pelo (la raíz del prefijo inglés, sin slug) — el clon no emite nada ahí hasta saberlo | specs de C-3 |
| **C-SP12** | si el chip de sector de la página de **detalle** enlaza a `/es/sector/<slug>/` (la evidencia de ese enlace viene de las tarjetas de teaser del clon, no del detalle) | specs de C-3 |

---

## PRE-REGISTRO PARA C-3 — qué debe verificar la construcción

Escritas antes de construir, con su condición de refutación. Si alguna falla,
se vuelve aquí antes de seguir.

- **P-C3-1 · el pie del caso.** La 4ª sección del pie contiene lo mismo en
  cualquier par de casos que se compare — nada derivado del post. *Refuta:*
  cualquier diferencia entre dos casos no atribuible a la plantilla. Si refuta,
  se reabre D5.
- **P-C3-2 · el cascarón (C-SP7).** Ritmo, tipografía y retícula del cascarón
  con varianza cero entre instancias de la misma forma, a los dos anchos,
  medido en ≥3 instancias por forma **antes** de escribir el componente.
  *Refuta:* cualquier eje con varianza — y ese eje sería un campo que este
  modelo no tiene.
- **P-C3-3 · el contrato del cuerpo.** Las 16 páginas de la muestra renderizan
  con §3.1 + nodo de vídeo + nodo-embed, sin construcción nueva; exactamente
  **1** página exige sustituto de `script` (C-SP5) y **2** llevan tabla (§3.4).
  *Refuta:* una construcción fuera de esos cauces.
- **P-C3-4 · soluciones como relación.** Las fichas se renderizan **desde el
  producto**, no desde dato del caso, y cuadran con el original en las 4
  páginas con soluciones de `BEHAVIORS.md`; el panel duplicado
  (copia B a 1440, copia A a 390) es mecanismo de plantilla. *Refuta:* una
  ficha que no sea proyección de su producto (distinta para el mismo `data-id`
  en dos casos).
- **P-C3-5 · las rutas nuevas rompen enlaces viejos, y los caza la sonda.** Al
  emitir `/casos-de-exito/[slug]`, `/case-studies/[slug]` y `/faqs/[slug]`,
  `qa:enlaces` convierte en fallo los `href` absolutos existentes (los 3 de
  `projects.ts`, el CTA de `sectores.ts` a `case-studies`, y los que haya — se
  localizan con la sonda, no a mano: la lección de los tres ficheros que
  pintaban sectores). *Refuta:* `qa:enlaces` limpio con los href absolutos aún
  presentes — sería la sonda fallando, no el clon acertando.
- **P-C3-6 · el mapa.** Contenedor de 330/290 (medido en `BEHAVIORS.md` §3), un
  marcador. Si C-3 decide placeholder, la desviación va a `PENDIENTES-QA.md`
  con razón, como S3 — no en silencio.
- **P-C3-7 · la FAQ no crece.** Las 19 entran con `titulo + cuerpo` y ningún
  campo aparece al construir. *Refuta:* cualquier campo nuevo — y refutaría D4.
