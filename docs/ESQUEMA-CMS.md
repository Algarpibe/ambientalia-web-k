# ESQUEMA CMS — el destino de todo esto

> **Abierto el 2026-07-30.** Registro vivo del esquema del CMS, igual que
> `PENDIENTES-QA.md` lo es del QA: **cada tanda lo actualiza.** Lo que aquí se
> escribe está medido o marcado como no medido; no hay terceras categorías.
>
> El clon existe para levantar una **biblioteca de arquetipos** que se traslada a
> un CMS (`CLAUDE.md` §Qué es esto). Esto es ese traslado.

## CMS-0 · La decisión de plataforma

**Payload self-hosted**, tomada fuera de la sesión de recon:

| | |
|---|---|
| CMS | **Payload**, self-hosted |
| infra | **VPS Hostinger + Easypanel** |
| base de datos | **Postgres propio** |
| despliegue | **embebido en la propia app Next** (no headless separado) |
| editor | **Lexical** |
| lectura de datos | **Local API**: `generateStaticParams()` y las páginas leen de la DB sin HTTP — el SSG actual se conserva |

**Por qué Payload, en términos de este repo:** sus *blocks* son uniones
discriminadas — `SectorBlock[]` y `MonoSeccion[]` se traducen casi literales
(§1.4–1.5) —; su editor es Lexical con features activables — el contrato censado
del §3 **es** esa configuración —; y la Local API conserva el SSG, y con él la
aceptación del §8.

### Flecos abiertos de CMS-0

| # | fleco | por qué importa aquí |
|---|---|---|
| **CMS-0a** | **whitelist de nodos** de Lexical | resuelto en §3 con el censo de 209 páginas |
| **CMS-0b** | **media uploads**: volumen persistente vs S3-compatible | el clon sirve hoy de `public/`; 123 de 209 páginas del grupo A llevan imagen, con `srcset` |
| **CMS-0c** | **modelo de publicación**: rebuild por webhook vs ISR | **condiciona si la app necesita la DB en runtime o solo en build** — y eso cambia el enrutado del §4 |
| **CMS-0e** | **conversión del cuerpo**: HTML del editor clásico → Lexical **al importar**, o **HTML crudo primero** (render idéntico al actual) y conversión por entrada después | la conversión no es 1:1 (T5: estructura suelta que se normaliza) y hacerla de golpe en 209 documentos **sin pérdida** es una afirmación sin probar. Se decide con un **piloto sobre la muestra adversaria de 24** |

**CMS-0c no es un detalle de despliegue.** Con rebuild-por-webhook, las rutas se
emiten en build y `dynamicParams = false` es gratis; con ISR hay render en
caliente y la app necesita Postgres vivo. La recomendación del §4 asume el
primero; si se elige ISR, **hay que releer el §4 entero**.

### ✅ CMS-0d · Next subido a 16.2.12 — EJECUTADA (2026-07-30)

| | |
|---|---|
| exigido por Payload | **≥ 16.2.6** (16.0 y 16.1 no soportadas) |
| instalado | **`16.2.12`** — último parche de la línea 16.2 y `latest` de npm (publicado 2026-07-25) |

Fue tanda propia, como estaba escrito. El salto `16.2.1 → 16.2.12` arrastró
solo `next`, `@next/env` y los binarios `@next/swc-*`: **ni una dependencia
nueva, ni un cambio de código o de config**. Verificación con el protocolo
completo — línea base congelada ANTES
(`scripts/qa/medidas/clon-base-{1440,390}-cms0d-antes.json`), matar por
puerto, `.next` borrado, build desde HEAD, marcador de frescura por `BUILD_ID`
(presente en el HTML servido nuevo, ausente del viejo) y umbral cero:

| comprobación | resultado |
|---|---|
| `qa:clon-base` @1440 vs base | **Δ0** · 11 páginas · 0 regresiones |
| `qa:clon-base` @390 vs base | **Δ0** · 11 páginas · 0 regresiones |
| `qa:enlaces` | limpia en las dos direcciones (1180 externos · 315 internos) |
| `qa:corte` | 12/12 |
| lint + typecheck | verdes (`eslint-config-next` queda en `16.2.1`, funciona con next 16.2.12) |

**Payload ya no está bloqueado por la versión de Next.** Ojo operativo que se
pagó en la tanda: `puppeteer-core` va con `--no-save`, así que **cualquier
`npm install` lo poda** — tras tocar dependencias hay que rehacer
`npm i --no-save puppeteer-core` antes de correr sondas.

---

## 1 · Los dos content types medidos, y su frontera

### 1.1 · SECTOR (`src/lib/sectores.ts`)

6 instancias en el original, **4 pobladas**. `SectorPage`:
`slug · seo · breadcrumb · header · hero · body: SectorBlock[] · ctaSlides ·
soluciones · proyectos · articulos · taxonomy · footerStripImage`.

El cuerpo es *flexible content* de 5 bloques
(`ctaDescarga · beneficiosAplicaciones · claimConFoto · listaSimple2Col ·
mapaProyectos`), cada uno con **`flujo`** — dónde corta la sección
(`seccion · seccionRasa · fila · filaPegada`), deducido de los **8 sectores**, no
de dos.

### 1.2 · MONOGRÁFICO (`src/lib/monografico.ts`)

2 instancias, las dos pobladas. Su cuerpo **no es una lista de bloques: es el
árbol de Divi** — `MonoSeccion[]` → fila → columna → pila de módulos.

### 1.3 · La frontera entre ambos, medida

`docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md` §8: se transcribió el
cuerpo de Urbano al modelo del monográfico con umbral cero. **H1 rechazada por
C1: hacen falta tres campos.**

| # | campo que falta | coste medido |
|---|---|---|
| 1 | `variante` (piel del `ctaDescarga`: `foto` \| `fondo`) | +12.39 @1440 · −90.58 @390 |
| 2 | nivel semántico `<p>` del `claim` (hoy solo `h2/h3/h4`) | +10 en los dos anchos |
| 3 | alineación vertical de las columnas de una fila | offset 121.03 → 0 |

**Y lo que quedó probado a favor de fusionar:** los 4 valores de
`SectorBlockFlujo` son **azúcar sobre `MonoRitmo`** (Δ0 en los dos anchos), y
`beneficiosAplicaciones` entra sin un solo campo nuevo. **El desacuerdo no está
en el ritmo ni en la retícula.**

**Decisión vigente: dos content types**, con la frontera escrita. Los tres campos
**no se han añadido**.

### 1.4 · Traducción a Payload — SECTOR

| pieza del modelo | en Payload |
|---|---|
| `SectorPage` | **colección** `sectores`, con `slug` único |
| `seo` | **grupo** de campos, o el plugin de SEO |
| `header`, `hero` | **grupos** |
| `body: SectorBlock[]` | **`blocks`** — un block por `kind` |
| `flujo` | **campo `select`** dentro de cada block, **con defecto `"seccion"`** |
| `variante` del `ctaDescarga` | **campo `select`**, defecto `"foto"` |
| `hero.headingColor` | **campo con defecto** `#0075c9` (el de marca). Se guarda solo cuando difiere — Industria y EDAR usan `#0c71c3`, el azul de serie de Divi, y eso es **error del original replicado a propósito** |
| `soluciones` | **relación** a la colección de productos, no texto |
| `proyectos`, `articulos` | **relación** a casos y entradas (ver §3) |
| `ctaSlides` | **array** |

### 1.5 · Traducción a Payload — MONOGRÁFICO

| pieza | en Payload |
|---|---|
| `MonograficoPage` | **colección** `monograficos` (o la misma que sectores con un discriminante — decisión abierta, ver §7) |
| `cuerpo: MonoSeccion[]` | **`blocks` anidados**: sección → fila → columna → módulo |
| `MonoRitmo` (`mt`/`pt`/`pb`) | **campos numéricos opcionales**, omitidos cuando valen el defecto |
| **el `pb` de fila** | **campo con defecto** — 2 % (28.7969 @1440 / 30 @390). Omitido en el dato cuando coincide |
| `MonoAncho` (`1_4`…`4_4`) | **`select`** de 8 valores: es la retícula, no un número |
| `anchoPct`, `lh`, `nivel` | **campos** con defecto (100, 30.6, 2) |
| `MonoInline` (`string \| {b}[]`) | **NO es un campo de texto plano**: hay 56 `<strong>` a mitad de frase y cambian dónde envuelve. En Payload es **texto rico acotado** a negrita, o un array tipado |

**El patrón, y es la regla general:** cada campo de presentación editorial lleva
**un defecto explícito** y se **omite del dato cuando coincide** con él. Ese
defecto es también la decisión de diseño que hereda quien dé de alta un contenido
nuevo.

---

## 2 · El arquetipo A — plantilla + campos de entrada

209 páginas: blog 149 · término 37 · documento científico 23.
Recon completo en `docs/research/arquetipo-A/`.

### 2.1 · El cascarón es plantilla pura

**Cero varianza en 24 instancias** (ritmo, tipografía, retícula). **No hay ni un
campo por instancia en el cascarón.** Y son **tres plantillas distintas**, no
una: difieren en estructura, ritmo (`post_content mb` 72 en blog vs 0 en las
otras dos) y tipografía.

**4 firmas de `tb_body` en las 209:**

| forma | firmas | reparto |
|---|---|---|
| blog | **2** | 83 con bloque de relacionados · 66 sin él |
| término | 1 | 37 |
| documento científico | 1 | 23 |

Retícula: la del sitio — fila 86 % (máx 1380), columnas **`3_4` + `1_4`**,
gutter 5.5 %. **No estrena nada.**

### 2.2 · Los campos de entrada, por forma

| campo | blog | término | doc. |
|---|---|---|---|
| `titulo` | sí (`text#1`, 44/35) | sí (18/18) | sí (44/35) |
| `fecha` + `actualizado` | sí (`text#2`) | — | — |
| taxonomías | sí (`text#3`: categoría + etiquetas) | — | — |
| imagen destacada | sí (`image#0`) | — | — |
| autoría | sí (`text#4`/`text#5`) | — | — |
| **`cuerpo` (rico)** | **sí** | **sí** | **sí** |
| portada + PDF | — | — | sí (`image#0` + `button#0`) |
| bloque de relacionados | **campo booleano/derivado** — 83/149 | — | — |

**El índice del artículo NO es un campo**: es una proyección calculada de los
`h2` del cuerpo (16 de 61 encabezados llevan `id`, y coinciden 1:1 con las
anclas). En Payload es una función del `cuerpo`, no un dato — y renombrar un `h2`
rompe su ancla, que es comportamiento del generador.

### 2.3 · Los 13 SIN PROBAR, que se heredan

`arquetipo-A/PAGE_TOPOLOGY.md` §6 y `components/campo-rico.spec.md` §7. **No se
cablea ninguno**; van al esquema como preguntas abiertas:

`A-SP1` una plantilla condicional o dos (las 2 firmas de blog) · `A-SP2` qué
decide que haya relacionados · `A-SP3` si fecha/taxonomías son campos o texto
compuesto · `A-SP4` ritmo de la lateral · `A-SP5` Test A sobre las 24 a 390 ·
`A-SP6` contenido de `sidebar#1` vs `#2` · `A-SP7` si el bloque de relacionados
sortea (heredaría el ruido de hasta 81 px de P4) · `A-SP8` **cerrado en §3** ·
`A-SP9` si los `id` de los `h2` los pone el tema o el contenido · `A-SP10`/`A-SP11`
alcance de `style` en línea y de `srcset` · `A-SP12` `dynamicParams=false` no
medido · `A-SP13` coste de emitir 209 rutas.

---

## 3 · El campo rico: whitelist de Lexical y transformaciones de migración

**Son DOS listas distintas y conviene no mezclarlas:** lo que el editor permite
escribir de aquí en adelante, y lo que hay que hacerle al corpus al importarlo.

### 3.1 · WHITELIST — qué features de Lexical se habilitan

Del censo de **209/209 páginas**. Los nombres de feature son los de Payload;
**los identificadores exactos hay que confirmarlos contra la versión instalada**
—esto es un contrato de contenido, no una firma de API—.

| feature | evidencia (páginas/209) |
|---|---|
| párrafo | 206 |
| **negrita** · **cursiva** | 137 · 86 |
| **subíndice** · **superíndice** | **139** · 37 — fórmulas químicas (NO₂, CO₂). No es opcional |
| subrayado · tachado · `mark` · `small` | residuales (5 · — · 1 · 1): se habilitan por baratos |
| encabezados **h2 · h3 · h4** | 144 · 114 · 47. `h1` y `h5` residuales → **no** se habilitan |
| lista desordenada · ordenada | 123 · 18 |
| **enlace**, con `target` y `rel` | 181 |
| **cita** | 73 |
| **upload / imagen**, con `srcset`, `width`, `height` y **leyenda** | 123, y 83 con `wp-caption` |
| **regla horizontal** | 5 |
| **bloques** (`BlocksFeature`) | el vehículo de los nodos tipados de §3.3 |
| **tabla** | 35 — **ABIERTA, ver §3.4** |

**Fuera de la whitelist, con evidencia:**

| feature | por qué |
|---|---|
| **código** (inline y bloque) | **`code`/`pre` ausentes en las 209** |
| **lista de definición** | `dl` **ausente** |
| **formularios** | `form`/`input` **ausentes** |
| **HTML arbitrario / `script`** | **prohibido** — ver §3.3 |
| alineación e indentación | no medidas; **SIN PROBAR**, no se habilitan a ciegas |

### 3.2 · TRANSFORMACIONES DE MIGRACIÓN

Lo que hay que hacerle a las 209 al importar. **Ninguna es opcional.**

| # | qué | acción |
|---|---|---|
| **T1** | `<a class="et_pb_button">` — **168/209 (80 %)** | → **enlace con `variante: "boton"`**. Es un campo del nodo enlace, no una clase. Hoy el 80 % del corpus depende de una clase del tema para que un enlace parezca botón: eso es acoplamiento contenido↔tema y se corta aquí |
| **T2** | `style="width: 1210px"` en `wp-caption` | **se elimina al importar**. Un ancho absoluto en el contenido desborda un contenedor de 911.75 y no es dato del autor: es residuo del editor clásico |
| **T3** | `class="wp-image-<id>"`, `wp-caption`, `aligncenter` | se descartan; la relación con el media pasa a ser **relación a la colección**, no una clase con un id de otro sistema |
| **T4** | `<script>` — 17 en 15 páginas | **ninguno sobrevive como script**. Detalle en §3.3 |
| **T5** | `<div>`/`<span>`/`<section>` sueltos del editor clásico | se normalizan; no hay estructura que preservar |
| **T6** | `id` de los `h2` | **A-SP9**: si los pone el tema, se regeneran; si vienen en el contenido, se conservan. **No decidido** |

### 3.3 · Los `<script>`, clasificados uno a uno

Cierra **A-SP8**. Sonda `npm run qa:a-scripts`, salida congelada en
`scripts/qa/medidas/a-scripts.json`. **17 scripts en 15 páginas**, y **cero de
analítica** — nada de seguimiento vive dentro del contenido:

| qué es | scripts | páginas | destino |
|---|---|---|---|
| **FB3D FlipBook** (plugin de WP, visor de PDF; payload base64 con datos del post) | **6** | 6 | **eliminación + sustitución**: el contenido real es un PDF → **relación a media** o embed de documento |
| **Flourish** (`public.flourish.studio/…/embed.js`) | 4 | 3 | **nodo-embed tipado** `proveedor: flourish` |
| **Swiper 8 desde jsDelivr** (`cdn.jsdelivr.net`) | 3 | 3 | **eliminación + sustitución**: es una galería montada a mano cargando una librería de terceros → **galería nativa** |
| **Twitter/X** (`platform.twitter.com/widgets.js`) | 2 | 2 | **nodo-embed tipado** `proveedor: twitter` |
| **Instagram** (`www.instagram.com/embed.js`) | 1 | 1 | **nodo-embed tipado** `proveedor: instagram` |
| **Reproductor de NBC Washington** (`nbcwashington.com/portableplayer/?CID=…&autoplay=true`) | 1 | 1 | **decisión abierta**: embed de origen permitido, o **eliminación** — lleva `autoplay` y un `CID` que caducará |

**Regla que sale de esto, y va a la whitelist:**

> **`script` no entra.** En un CMS propio, script arbitrario dentro del contenido
> no debe existir. Los 17 acaban en **nodo-embed tipado (8)** o en **eliminación
> documentada con sustitución (9)**.

Y el nodo-embed tipado no es libre: **proveedor de una lista cerrada** —
`youtube`, `ourworldindata`, `flourish`, `twitter`, `instagram`— más su
identificador. Los `iframe` ya censados (55/209: YouTube **y** gráficos
interactivos) entran por el mismo nodo, no por HTML crudo.

### 3.4 · ABIERTA · la tabla: ¿nodo de Lexical o block?

**Sí apareció**: `table` en **35 de 209**, y en el **49 % de los términos**
(18/37), con `thead`/`th` en 19 y un `tfoot`.

No se decide aquí. Las dos salidas, con lo que pesa cada una:

- **nodo de tabla de Lexical** — se escribe en el flujo, natural para el autor;
  la feature de tabla de Payload ha estado marcada como experimental y **hay que
  comprobar su estado en la versión instalada** antes de comprometerse;
- **block tipado** — estable y validable (cabeceras, alineación, celda como
  texto acotado), pero saca la tabla del flujo de escritura.

Dato que inclina, y que ya está medido: en el clon la tabla del monográfico
llevó **bordes que la spec daba por ausentes** (−58 de alto) y una **desviación
deliberada a 390** (`overflow-x` frente al desbordamiento del original). Una
tabla con requisitos de render propios encaja mejor como **block**. **No es la
decisión, es la evidencia.**

---

## 4 · Enrutado — resuelto

`docs/research/arquetipo-A/ENRUTADO.md`, con prueba: andamio `[slug]` de raíz con
colisión deliberada en `/accesorios`, medido y borrado.

| resultado | |
|---|---|
| el build **no avisa** de la colisión | emite `/accesorios` por las dos vías, sin error |
| **la ruta estática gana** | replicar el plano del original **es seguro en ejecución** |
| pero el `[slug]` de raíz **se traga todos los 404 de un segmento** | `/slug-inventado` → **200** |
| `enlaces.mjs` **no se entera, por diseño** | compara contra el `prerender-manifest`, no por HTTP — y por eso **sigue siendo fiable** |

### La decisión

> **Replicar el plano del original**, con:
> 1. **`dynamicParams = false`** en el `[slug]` de raíz — es la línea que
>    devuelve los 404 (**A-SP12: deducido, no medido**);
> 2. **unicidad de slug ENTRE familias**, no dentro de cada una. Es el cambio de
>    modelo: WordPress garantiza unicidad *por CPT* y **eso no basta** — el
>    conflicto es blog × término × página × `solutions`, **202 slugs en un
>    plano**, incluidas las 4 rutas que el clon ya sirve;
> 3. **una guarda que falle en BUILD**, porque el build no avisa. Compara los
>    slugs de todos los catálogos planos contra las rutas emitidas y sale con
>    código ≠ 0. Mismo patrón que `enlaces.mjs`, derivada del
>    `prerender-manifest` para que se automantenga.

**Requisito, no recomendación:** sin (3), la colisión es silenciosa y solo se ve
sirviendo la página equivocada.

**Traducción a Payload de (2):** la unicidad **entre** colecciones no es nativa.
Un hook `beforeValidate` que consulte las demás familias planas (o una
colección-índice de slugs) protege **el alta**; la guarda de build protege **el
conjunto**. Son complementarias, no alternativas: el hook avisa a quien edita,
la guarda caza lo que entre por cualquier otra vía.

⚠ **Depende de CMS-0c.** Todo esto asume **rebuild por webhook**. Con ISR hay
render en caliente y el §4 se relee entero.

---

## 5 · La prueba de CMS-readiness ya pasada

No es teoría: **está ejercitada**.

> Los **4 sectores vivos** (Urbano · Industria · Construcción · Investigación)
> salen de **una sola plantilla**. Dar de alta uno es **añadir un `SectorPage` a
> `SECTORES_PUBLICADOS`** — *sin tocar código*. El 3.º y el 4.º se poblaron así.

Y lo mismo con MONOGRÁFICO: `/sectores/[slug]` **despacha dos arquetipos por
slug** contra dos catálogos, y dar de alta una instancia de cualquiera es añadir
datos.

**Es exactamente lo que un CMS va a hacer**, y ya se sabe que el código lo
aguanta. Lo que la prueba **no** cubre: que el contenido venga de una DB en vez
de un `.ts`, y los campos que aún no existen (§1.3).

---

## 6 · Transversales que el esquema hereda

| # | qué | estado |
|---|---|---|
| **CMS-1** | el caso de éxito tiene **dos patrones de ruta**: 53 en `/es/casos-de-exito/` y **4 en `/es/case-studies/`** (slug inglés) | un content type cuyo slug no determina su ruta necesita **el prefijo como campo** o una tabla de excepciones. **Abierta** |
| **CLASE (S9–S11)** | 4 residuos de SECTOR con una causa: **componente calibrado con UNA instancia** | **es deuda de CMS-readiness, no de acabado**: un CMS no da un rango de contenido, da cualquiera. Los extremos ya están medidos (alto del slider @390: 265.06 · 300.14 · 300.16; `h1` de EDAR a 4 líneas) |
| **M-IMG** | residuo de décimas: el original sirve por `srcset` una variante cuya proporción redondea distinto | se cierra con `srcset`, no con maquetación. **Toca a CMS-0b**: la estrategia de media decide si reaparece |
| **S1** | tarjetas de caso y de artículo: **la mitad construida del par listado→detalle** (206 páginas) | los modelos `CaseStudy`/`BlogPost` son la **proyección de teaser**: falta cuerpo, slug (hoy `href` absoluto al original), taxonomía y SEO |

---

## 7 · Decisiones abiertas, en un sitio

| # | decisión | bloquea |
|---|---|---|
| CMS-0b | media: volumen persistente vs S3 | migración de imágenes · M-IMG |
| CMS-0c | publicación: rebuild vs ISR | **el §4 entero** |
| CMS-0e | cuerpo: convertir al importar vs HTML crudo primero | la migración de las 209 |
| §3.4 | tabla: nodo de Lexical vs block | whitelist |
| §3.3 | el reproductor de NBC: embed o eliminación | migración |
| T6 / A-SP9 | los `id` de los `h2`: conservar o regenerar | índice del artículo |
| §1.5 | ¿SECTOR y MONOGRÁFICO son dos colecciones o una con discriminante? | la frontera de 3 campos sigue vigente: **dos** |
| CMS-1 | prefijo de ruta del caso de éxito | grupo C |

---

## 8 · Aceptación de la migración

**Cuándo se puede decir que el CMS está puesto.** El listón lo da el clon actual,
que es determinista:

> Con el sitio leyendo de Payload, **las mismas sondas contra el clon actual,
> umbral CERO, 11 páginas, 2 anchos.**

| comprobación | criterio |
|---|---|
| `npm run qa:clon-base -- 1440 --cmp <base>` | **Δ0** · 11 páginas · 0 regresiones |
| `npm run qa:clon-base -- 390 --cmp <base>` | **Δ0** · 11 páginas · 0 regresiones |
| `npm run qa:enlaces` | limpia en las dos direcciones, código 0 |
| `npm run qa:corte` | 12/12 |
| `npm run check` | verde |

**El camino de los datos, para que el listón sea alcanzable:**

- las páginas construidas tienen sus seeds ya escritos: **`src/lib/*.ts` son los
  datos** — un script los inserta por la Local API, mecánico;
- las 321 de listados entran por **extractor desde el original** (las sondas de
  `scripts/qa/` ya leen su DOM: está medio hecho), con las transformaciones
  **T1–T6** aplicadas al importar.

**Y hay una segunda prueba, además del Δ0:** la de SECTOR elevada al CMS —
**dar de alta una página nueva desde el admin, sin tocar código**, y que las
guardas (`qa:enlaces`, la de slugs del §4) la acojan sin editarlas.

**La línea base se toma ANTES de tocar nada** y se congela en
`scripts/qa/medidas/`. Es el mismo protocolo del experimento Urbano, que ya
demostró servir: se tomó base, se montó el andamio, se midió y el árbol volvió a
Δ0 en las 11 páginas.

Y el aviso que vale aquí más que en ningún sitio: **`clon-base` exige un
`MARCADOR` del build servido antes de medir**. La corrida que más importa es la
que dice «no se movió nada», y es justo la que un `next start` viejo falsifica
sin dejar rastro.
