# ESQUEMA CMS — el destino de todo esto

> **Abierto el 2026-07-30.** Registro vivo del esquema del CMS, igual que
> `PENDIENTES-QA.md` lo es del QA: **cada tanda lo actualiza.** Lo que aquí se
> escribe está medido o marcado como no medido; no hay terceras categorías.
>
> El clon existe para levantar una **biblioteca de arquetipos** que se traslada a
> un CMS (`CLAUDE.md` §Qué es esto). Esto es ese traslado.
>
> ⚠ **Convención de nombres, para que no se mezclen:** `CMS-0a…0f`, `CMS-1`,
> `CMS-2`… son **IDs de DECISIÓN** de este registro. Las **FASES de la
> migración** se llaman **F2-1…F2-5** y viven en `docs/PLAN-FASE-2.md`. Un
> `CMS-n` no es una fase y un `F2-n` no es una decisión: la fase consume
> decisiones y las decisiones se toman y se actúan aquí.

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
| **CMS-0a** | **whitelist de nodos** de Lexical | **✅ resuelto** en §3 con el censo de 209 páginas |
| **CMS-0b** | **media uploads**: volumen persistente vs S3-compatible | **✅ resuelto (2026-07-30): volumen persistente**, abajo |
| **CMS-0c** | **modelo de publicación**: rebuild por webhook vs ISR | **✅ resuelto (2026-07-30): rebuild por webhook**, abajo |
| **CMS-0e** | **conversión del cuerpo**: HTML del editor clásico → Lexical **al importar**, o **HTML crudo primero** (render idéntico al actual) y conversión por entrada después | **✅ resuelto (2026-07-30): HTML crudo primero**, abajo |

### ✅ CMS-0c · Publicación por REBUILD CON WEBHOOK (2026-07-30)

**Decidido: rebuild por webhook. No hay ISR.** Publicar dispara una
reconstrucción; las rutas se emiten en build, como hoy.

Las tres consecuencias, y son las que se venían asumiendo:

1. **La app NO necesita Postgres en runtime, solo en build.** La DB es una
   dependencia del proceso de construcción, no del que sirve. Lo que se sirve
   sigue siendo HTML estático.
2. **El §4 queda vigente tal cual está escrito** — era la rama que ya asumía, y
   **no hay que releerlo**. `dynamicParams = false` es gratis, y la guarda de
   build del §4 (3) es el sitio correcto para cazar la colisión de slugs porque
   **el build es el único momento en que se decide qué rutas existen**.
3. **La aceptación del §8 sigue siendo alcanzable, y por eso mismo.** El listón
   es Δ0 con umbral cero, y eso **exige salida determinista**: dos cargas de la
   misma página tienen que dar el mismo número al céntimo. Con ISR, una página
   regenerada entre dos corridas de `clon-base` movería el número sin que nadie
   hubiera tocado nada — el ruido del original, importado al clon. Rebuild por
   webhook lo evita por construcción.

**SIN MEDIR, y es operativo, no de esquema:** quién dispara el webhook, cuánto
tarda el rebuild con las 209 del grupo A dentro (**A-SP13**) y qué ve el editor
mientras tanto. Nada de eso cambia el modelo de datos; se mide cuando haya
instancia.

### ✅ CMS-0b · Media en VOLUMEN PERSISTENTE del VPS (2026-07-30)

**Decidido: volumen persistente**, con el adaptador de **storage local** de
Payload. No se estrena S3.

**Lo que hay medido del tamaño:** el clon sirve hoy `public/` con **473 ficheros
y 37.4 MB**, de los que **452 ficheros y 36.1 MB son imágenes** — y eso son las
11 páginas construidas. **SIN MEDIR:** cuánto suma el corpus entero (123 de las
209 del grupo A llevan imagen, con `srcset`). El orden de magnitud conocido son
decenas de MB, no GB, y a esa escala un volumen es más simple que un bucket.

**Y es reversible, que es la mitad que importa de la decisión.** Migrar a S3 si
crece es **cambiar el adaptador de storage y mover los ficheros**: no rehace el
modelo de datos, porque la relación con el media ya es **relación a la colección**
y no una clase con el id de otro sistema (**T3**, §3.2). Se toma la opción simple
sabiendo el coste de deshacerla, no por no haber mirado la otra.

#### Los IMAGE SIZES que Payload tiene que declarar — medidos, y cierran M-IMG

**Se registra aquí porque no tenía sitio**, y es la entrada de la decisión que
cierra **M-IMG** en F2-2 (los tres módulos de imagen con residuo de décimas,
cuya causa medida es el `srcset`).

Un `srcset` que no se pueda regenerar obliga a servir el original a todos los
anchos, y eso **es** M-IMG. Payload genera las variantes que se le declaren, así
que la lista tiene que salir de lo que el corpus usa hoy — no de un criterio
nuevo.

| fuente | anchos observados |
|---|---|
| **detalle del grupo A** (destacadas, portadas y cuerpo de las 14 instancias transcritas — `medidas/a-spec.json`) | **480** ×33 · **980** ×27 · **1280** ×19 · 848 ×4 · 1800 ×6 · y la original sin recortar |
| **tarjetas de listado** (LH-2 D3, `medidas/lh-tarjetas.json`) | **1080×675** · **1024×683** · **980** · **480** |

De donde el conjunto mínimo, que es la unión y no la intersección:

> **`480` · `980` · `1024×683` · `1080×675` · `1280`**, más el original.
> Los `848` y `1800` que aparecen son **el tamaño nativo de esa imagen**, no una
> variante generada: no se declaran.

Y el atributo `sizes` que WordPress emite tampoco es libre — hay **5 formas
distintas** en las 14 instancias, todas del patrón
`(max-width:480px) 480px, (max-width:980px) 980px, …`. Es plantilla del tema, no
dato del autor: **se regenera al servir**, no se migra.

⚠ **Alcance declarado:** 14 instancias de 209 y las 9 formas de listado. No es
un censo de las 209 — se anota como lo que es, la entrada de la decisión, no la
decisión.

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

### ✅ CMS-0e · HTML CRUDO PRIMERO, conversión por entrada (2026-07-30)

**Decidido: el cuerpo entra como HTML crudo y se convierte por entrada, no de
golpe al importar.** El acta se separa en dos mitades **porque valen cosas
distintas**, y mezclarlas es lo que haría parecer probado lo que no lo está.

Sonda: `scripts/qa/a-lexical.mjs` (`npm run qa:a-lexical`), salida congelada en
`medidas/a-lexical.json` y la del test en negativo en
`medidas/a-lexical-sabotaje-sub.json`.

#### ⚠ Qué NO prueba este piloto, dicho antes que los números

**El destino Lexical del piloto es mi propia representación, no la de Payload.**
No se validó contra `@payloadcms/richtext-lexical` ni contra `lexical` —no están
instalados; el `package-lock.json` no se movió— ni contra un esquema JSON escrito
a partir de la documentación. El convertidor y el árbol contra el que se compara
**los escribí en la misma sonda**.

De donde la consecuencia, sin suavizar: **el veredicto «sin pérdida» describe mi
convertidor contra mi propio destino, y eso no puede probar que Payload lo
acepte.** El piloto se corrió **antes de instalar Payload**, fuera del orden
previsto, y eso acota su alcance a lo que se puede afirmar sin la librería
delante: qué construcciones del corpus se resisten a una estructura de nodos
—sea cual sea— y por qué.

#### A · INVENTARIO de construcciones difíciles — vale con cualquier convertidor

Esto es la evidencia real de CMS-0e: **son propiedades del material de origen**,
no de la librería de destino. Ninguna cambia por instalar Payload.

| construcción | instancias / 24 | por qué se resiste |
|---|---|---|
| **`<script>` que ES contenido** | 4 en 4 pág. | flipbook de PDF (×3) y reproductor de NBC (×1). §3.3 los elimina y **exige un sustituto que el importador no puede fabricar**: el PDF como relación a media, el enlace a la noticia |
| **`iframe` de proveedor fuera de la lista cerrada de 5** | 3 en 3 pág. | `storymaps.arcgis.com`, `www.linkedin.com`, `…gamma.site`. En 24 páginas aparecen **tres proveedores nuevos**: la lista cerrada del §3.3 no cubre el corpus |
| **`<video>` sin nodo en la whitelist** | 5 en 4 pág. | hueco **de esquema, no de dato**: §3.1 no tiene nodo de vídeo. Se cierra añadiéndolo, no pidiéndole nada a una persona |
| **`<h5>` fuera de la whitelist** | 7 en 1 pág. | §3.1 habilita h2·h3·h4; degradan a h4. Los 7 están en una sola página, que los usa como sub-epígrafes |
| **`<iframe>` mal cerrado por quien editó** | 2 pág. | el parser de HTML5 trata el interior de `iframe` como RAWTEXT, así que `&nbsp;</p><p>` y `<br/>Ver Real Decreto 214/2025` **acaban siendo texto del documento**. No es prosa de nadie: es resto de parser sobre HTML roto |
| **imagen enlazada con leyenda** | 2 pág. | la leyenda es **hermana** del `<a>`, no descendiente. Al modelarla como campo del `upload` —que sí cuelga del enlace— el texto **cruza la frontera del enlace**. Es una consecuencia del modelo, y hay que saberla antes de escribirlo |
| **lista anidada dentro de un `<li>`** | 1 pág. | el árbol concatena los bloques anidados sin separador; el origen los trae separados por el espacio de formato del fuente |

**Lo que el inventario decide por sí solo, sin necesitar la validación.** Hay una
clase **no vacía** de documentos cuyo contenido **no tiene representación sin que
una persona aporte lo que falta** —el PDF, el enlace a la noticia, la decisión
sobre tres proveedores de `iframe`—. Esa clase **no depende del convertidor**:
existe igual con el de Payload, con el mío o con cualquier otro, porque está en
el material de origen.

Y una importación masiva es exactamente el momento en el que **no se pueden tomar
esas decisiones**: son una por documento y las toma una persona mirando la página.
Por eso el cuerpo **entra crudo y se convierte por entrada**, con el HTML como
fuente de verdad hasta que cada entrada esté dada por buena. Convertir al importar
obligaría a elegir entre parar la migración en el primer flipbook o dejar que
tire contenido en silencio.

⚠ **La muestra es ADVERSARIA, elegida por difícil.** El 5/24 de abajo **no es la
tasa del corpus** de 209 y no debe citarse como tal. El inventario establece que
**las clases existen**, no con qué frecuencia.

#### B · RECUENTO — provisional mientras el destino no esté validado

**24 juzgadas de 24** · **16 limpias · 3 con pérdida recuperable · 5
irrecuperables**. El único diff que queda es una transformación **declarada**
(un `<h5>` degradado a h4); no hay ninguna discrepancia sin explicar.

**Provisional, y por dos razones distintas:** el destino no es el de Payload
(arriba), y los números se movieron **cuatro veces durante la propia auditoría**
sin que el corpus cambiara ni un carácter — cada vez por un defecto de la sonda,
no del material. Un recuento que se mueve al arreglar quien mide es un recuento
que todavía mide a quien mide.

Se cita como provisional hasta que se rehaga con `@payloadcms/richtext-lexical`
instalado. **Esa validación es condición escrita del recuento, no de la
decisión** — la decisión ya la sostiene el inventario.

#### C · El test en negativo, que es lo que hace legible el recuento

Un «limpio» sin haber probado que la sonda sabe fallar no es un dato. Tres
sabotajes, cada uno tiene que caer **por un invariante distinto**:

| sabotaje | cae por | comprobado |
|---|---|---|
| `sub` — el convertidor no emite sub/sup | `formato:subscript` · `superscript` | ✅ |
| `hid` — el encabezado pierde su `id` | `encabezados` | ✅ |
| `leyenda` — el `upload` no absorbe la leyenda | `imagenes` | ✅ |

El de `leyenda` es el que importa: **el texto no se pierde** —cae como párrafo
suelto— así que el invariante `texto` sigue cuadrando y solo se rompe la
asociación. Una sonda que solo mirase texto habría dicho «limpio».

Sobre las 24 reales, `SABOTAJE=sub` baja las limpias de **16 a 6**, y la
correspondencia es exacta: **cae toda página con sub/sup y resiste toda página sin
ellos, sin una sola excepción**. Ninguna pasa desapercibida.

⚠ **El `id` de encabezado (T6) NO lo ejercita el corpus.** Las 24 páginas traen
**299 encabezados en el cuerpo y ninguno con `id`** (verificado sobre el HTML
servido). Por eso el sabotaje `hid` se prueba contra una **probeta sintética**
(`PROBETA=1`): sin ella, «no cae» sería indistinguible de «no hay nada que
perder», que son las dos cosas que un test en negativo existe para separar.
**Esto es dato para T6/A-SP9**, que sigue abierta: si en las 209 no hay `id`, la
decisión «conservar o regenerar» no tiene nada que conservar.

#### D · Los cinco defectos de la sonda, porque el recuento se movió con cada uno

La auditoría de esta tanda encontró **cinco defectos en el instrumento**, no en el
material. Van escritos porque el recuento cambió con cada uno y sin la lista los
números de arriba no se pueden auditar:

| defecto | efecto en el recuento |
|---|---|
| `charsCenso()` **definida y nunca llamada** — la guarda comparaba `textContent` normalizado contra la definición etiqueta→espacio del censo | **21 de 24 páginas marcadas DERIVA sin haber derivado**; solo 3 juzgadas. El recuento original no existía |
| un `<a>` **suelto a nivel de bloque** se desenvolvía y el nodo `link` no se emitía | 6 páginas con enlaces «perdidos» que no faltaban |
| un inline suelto a nivel de bloque **perdía su propio formato** | `formato:small` de 329 caracteres a 0 |
| el arreglo del `<a>` **estrenó su propio defecto**: clonaba el nodo y sacaba al `<img>` de su `.wp-caption`, así que `closest()` ya no hallaba la leyenda | 2 páginas con la leyenda vacía |
| ítems de lista y citas comparados con `norm` en vez de flujo | 1 falso positivo en una lista anidada |

Más dos de impresión que no alteraban el veredicto pero sí el informe: `fmt
[object Object]`, y diffs que imprimían `listas: 10 → 10` **sin decir qué
cambiaba** — un descuadre anunciado y no contado, que es el primero de los que
`CLAUDE.md` §«Dos reglas sobre las sondas» pone por escrito.

**La moraleja operativa, que es la que se lleva la tanda siguiente:** los cuatro
primeros defectos daban **números plausibles**, no errores. Ninguno habría
levantado una ceja leyendo solo el resumen.

---

## 1 · Los dos content types medidos, y su frontera

> **El régimen BUILDER también entra en Payload — explícito para que no se
> relea.** El cuerpo de MONOGRÁFICO es el árbol de Divi (`MonoSeccion[]`,
> §1.2) y los *blocks* de Payload lo expresan de forma **nativa** — blocks
> anidados sección → fila → columna → módulo (§1.5); si el anidamiento pesa en
> el admin, `blocksAsJSON` lo simplifica sin cambiar el modelo. La «frontera
> de regímenes» que se discutió en la evaluación externa —dejar el régimen
> builder fuera del CMS— era una **mitigación del M2A de Directus** (la
> junction table que degenera con uniones anidadas) y **no aplica a Payload**:
> aquí la unión discriminada es el tipo del campo, no una tabla puente.

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
**no se han añadido**. Y en Payload eso se traduce en **dos colecciones** —
ratificado y cerrado en §1.5b, con su condición de reapertura.

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
| `MonograficoPage` | **colección** `monograficos`, **separada de `sectores`** — cerrado abajo |
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

### ✅ 1.5b · DOS COLECCIONES, no una con discriminante — CERRADA (2026-07-30)

**`sectores` y `monograficos` son dos colecciones de Payload.** No se
re-investiga nada: es la ratificación de la decisión que el experimento ya dejó
tomada, escrita aquí para que deje de figurar como abierta.

**Razón 1 · la fricción está medida, no supuesta.** El experimento pre-registrado
(`EXPERIMENTO-URBANO.md` §8) transcribió el cuerpo de Urbano al modelo del
monográfico con umbral cero: **H1 rechazada por C1**, y la frontera son los
**tres campos del §1.3** con su coste cuantificado (+12.39/−90.58 · +10 · offset
121.03). Unir hoy las dos colecciones obliga a añadir esos tres campos al
monográfico **para nada más que la unión** — que es exactamente el arreglo falso
que este proyecto ya sabe reconocer: un campo que existe porque el modelo lo
necesita, no porque el contenido lo tenga.

**Razón 2 · el admin y la validación salen más limpios con dos.** Una colección
por arquetipo permite que cada campo obligatorio **sea obligatorio de verdad**.
Con una sola colección y un discriminante, todo campo que solo aplique a una de
las dos formas tiene que declararse opcional y volverse condicional en el admin:
la obligatoriedad deja de vivir en el esquema y pasa a vivir en la lógica de
presentación, que es el sitio donde no se puede comprobar. Quien da de alta un
monográfico tampoco ve un formulario con los campos de SECTOR apagados.

**Razón 3 · la asimetría de coste: fusionar luego es más barato que separar
luego.** Fusionar es añadir un discriminante y mover filas a un esquema que ya
las admite. Separar es lo contrario, y es caro porque para entonces ya se habrá
escrito contenido en la forma mixta: hay que decidir **fila por fila** de qué
tipo era, y las relaciones que apunten a la colección única sobreviven al corte
sólo si se reescriben. Entre dos opciones reversibles se toma **la que se
deshace mejor**.

**Y no hay coste de enrutado en tenerlas separadas**, que es la objeción obvia:
`/sectores/[slug]` **ya despacha dos catálogos por slug** en el código actual
(§5), y la unicidad **entre familias** del §4 —hook `beforeValidate` + guarda de
build— es justamente el mecanismo que hace seguro que dos colecciones compartan
un espacio de nombres plano. La decisión no estrena problema: usa una guarda que
ya hacía falta.

**Ni duplicación de campos, que es la otra objeción obvia.** Lo común —cabecera,
breadcrumb, hero, slider, bloque K y cola comercial— se declara **una sola vez**
como array de campos exportado y se esparce en las dos colecciones. Lo que se
duplica es el **documento**, no la **definición**: cambiar un campo común sigue
siendo un cambio en un solo sitio, exactamente igual que con una colección única.

**Y hay cómo apuntar a «una página de sector» sin saber de cuál de las dos es.**
Payload soporta **relación polimórfica** —`relationTo: ['sectores',
'monograficos']`—, así que un enlace destacado, un menú o un bloque relacionado
referencian las dos familias con un solo campo. Separar las colecciones no obliga
a duplicar tampoco las relaciones que las apuntan.

**Condición de reapertura, explícita.** Esta decisión se reevalúa **gratis** el
día que **los tres campos del §1.3 se hayan añadido al monográfico por una razón
independiente** —porque una tercera instancia los pida, o porque otro arquetipo
los traiga—. En ese momento la fricción medida vale cero y la fusión pasa a ser
sólo una cuestión de esquema, que se decide con el mismo umbral de entonces.

⚠ **Lo que la reapertura NO autoriza, y es la mitad que se olvida:** añadir esos
tres campos **para poder fusionar** es circular, y sigue prohibido sin una tanda
de fusión con su plan (`HANDOFF.md`). La condición es que los campos aparezcan
**por su cuenta**; si aparecen para justificar la unión, no se ha probado nada.

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
alcance de `style` en línea y de `srcset` · ~~`A-SP12` `dynamicParams=false` no
medido~~ **cerrada en §2.4** · `A-SP13` coste de emitir 209 rutas.

### 2.4 · ⚠ CORRIGE al modelo — lo que midió la CONSTRUCCIÓN (2026-07-31)

Acta en `docs/research/arquetipo-A/MEDICION.md`. **Ninguna contradice una
decisión**: tres corrigen un número del recon y una añade campos. Van aquí en la
misma tanda que las midió, que es la regla.

| # | el recon decía | la salida servida dice |
|---|---|---|
| **1** | «solo los 23 documentos científicos tienen **prefijo** propio» (singular) | son **TRES**: `documentos-cientificos/articulos-cientificos-y-estudios` (14) · `…/evaluaciones-independientes` (8) · **`estudios-cientificos/articulos-tecnicos` (1)**. La ruta es `recursos/<prefijo>/<categoría>/<slug>` |
| **2** | el documento tiene «portada + PDF» | `text#2` trae además **`autores` y `anyo`** («Reche et al.» \| 2020), que varían en las 4 instancias → **campos** |
| **3** | `text#1 font-size` del término = **18** (vs 44 en blog y doc) | el **18 es del MÓDULO**; el `h1` de dentro mide **44 / 52.8** — y **no reduce a 390**, al revés que blog y doc (35/42). Además lleva `mb 44` |
| **4** | «autoría: sí (`text#4`/`text#5`)» como campo de entrada | **idéntica en las 11 instancias que la llevan** → **plantilla**. Confirma por el otro lado la decisión de LH-2 D3 (**sin `autor`**) |

**Traducción a Payload de la 1**, y es el precedente exacto de CMS-1: el prefijo
es un **campo `select` con defecto `"documentos-cientificos"`, omitido cuando
coincide** — solo 1 de 23 lo escribe. La **categoría** es relación a
`categoriasCientificas` (§2c, 3 términos confirmados), y es el segmento anterior
al slug.

⚠ La 3 no cambia el veredicto —sigue habiendo varianza cero entre instancias, o
sea plantilla— pero **sí el número**, y por la razón de siempre: se leyó el
contenedor. El `color` computado de ese mismo módulo sale **blanco** en las tres
formas; maquetar con él habría dado un titular invisible.

**✅ A-SP12 CERRADA por medición.** `dynamicParams = false` **sí** devuelve los
404: `/slug-inventado` → 404, `/acesorios` → 404, `/recursos/inventado/x/y` →
404, mientras las 14 declaradas dan 200 y `/accesorios` la sigue sirviendo la
ruta estática. Las dos mitades de la salida (a) del §4 quedan verificadas **en
ejecución**, no deducidas.

**Y la guarda del §4 (3) existe, y está probada con una colisión REAL**:
`scripts/qa/slugs.mjs` · `npm run qa:slugs`, dentro de `npm run check`. Se
inyectó `slug: "accesorios"` en el catálogo de términos y **el build volvió a
compilar sin un aviso** —tercera confirmación de que la colisión es silenciosa—;
la sonda la cazó por A y por B con exit 1
(`medidas/slugs-COLISION-DELIBERADA-catalogo.json`).

**SIN PROBAR nuevos**: `A-SP14` (el índice de escritorio trae 21 ítems y el
móvil 16 en la misma página, sin causa medida) · `A-SP15` (geometría interior de
la tarjeta de relacionados; el original **sortea** los 3 posts, P4) · `A-SP16`
(que la autoría sea constante en las **209** — medida en 11).

---

## 2b · El grupo C — dos arquetipos, tres colecciones (2026-07-30)

76 páginas: caso de éxito 57 (53 `/casos-de-exito/` + 4 `/case-studies/`) ·
FAQ 19. Recon censado 76/76 en `docs/research/grupo-C/`; decisiones en su
`DECISIONES.md`, tipos completos en su `MODELO.md`. Régimen **tercero**:
cabecera y pie por Theme Builder, cuerpo por PHP del tema hijo — se aplica la
lectura plantillada (varianza entre instancias), y el cascarón dio varianza
cero en las 76.

**D1: caso y FAQ son DOS arquetipos** (firma de secciones, pie 4 vs 3, cuerpo
estructurado vs `entry-content` único — tres criterios F cuando bastaba uno).

| pieza | en Payload |
|---|---|
| `CasoDeExito` | **colección `casos`**, slug único a través de ambos prefijos |
| **`prefijo`** (CMS-1) | **campo `select`** con defecto `"casos-de-exito"`, omitido cuando coincide — solo los 4 ingleses lo escriben |
| `necesidad · solucion · resultados` | **tres campos ricos** obligatorios (títulos «Necesidad · Solución · Resultados» = plantilla, 57/57). Contrato §3.1 **sin construcción nueva** |
| `sectores` | **relación 0..n** a la colección nueva **`taxonomia-sectores`** (11 términos medidos; 4 casos con dos; 4 sin ninguno). El término lleva relación polimórfica *opcional* a `sectores`/`monograficos` — 11 términos, 8 páginas |
| `soluciones` | **relación 0..n a la colección de productos** (la del §1.4). Probado que la ficha es proyección del producto: 640 nodos de panel, **18 fichas, 17 títulos** en todo el corpus |
| `galeria` | **array de relaciones a media** (48/57; 3–15, mediana 7). El carrusel es plantilla |
| `destacado` | texto plano opcional (49/57), verbatim — las comillas son contenido |
| `detalles` | grupo `usuario · ubicacion · anyo · parametros?` — las filas «Cliente» y «Sector» se **proyectan** de `cliente` y `sectores` (igualdad 57/57 y 53/53; ausencia conjunta 4/4) |
| `ubicacionMapa` | `{lat, lng}` opcional (56/57) — **un punto**: 1 marcador exacto en las 56. El render (mapa real o placeholder tipo S3) lo decide la construcción **en voz alta** |
| `Faq` | **colección `faqs`**: `slug · seo.title · titulo · cuerpo` — la más simple del proyecto; su cuerpo (151–539 chars, `p ul li a span br sub`) entra entero en §3.1 |
| sobretítulo «Caso de éxito», «Detalles del proyecto», «Soluciones», rótulos | **plantilla** — un solo valor en 57/57; no se promocionan a campo |

**Corrección medida al recon (importa al SEO de todos los grupos):**
`seo.description` es **opcional** — falta en 4 casos y en las 19 FAQ; `ogImage`
falta en las 19 FAQ. `title` y `canonical` sí están en las 76, y el canonical
**se deriva** de prefijo + slug, no se guarda.

**Enrutado:** rutas prefijadas — **no tocan el plano de 202 slugs del §4** ni
su guarda; unicidad por colección (nativa) a través de ambos prefijos. Las
rutas cruzadas del original (301 en 7 de 9, 2 404 — C-SP2) son comportamiento
de servicio, **no se emiten ni se modelan**; si algún día se quieren, la
medición que cierra C-SP2 está escrita en `DECISIONES.md` D2 (barrer las 57 con
`X-Redirect-By`).

**Pendiente que este § deja armado:** censar por host los `iframe` del cuerpo
de caso (11 páginas, C-SP6) **antes** del import del grupo — van a la misma
allowlist del §3.3b. Y las predicciones P-C3-1…7 de `DECISIONES.md` son la
condición de entrada de la construcción C-3.

### 2b.1 · ⚠ CORRIGE al modelo — lo que midió la entrada de C-3 (2026-07-30)

Acta completa en `docs/research/grupo-C/MEDICION.md`; sondas `qa:c-cascaron` y
`qa:c-spec`, salidas congeladas. **Ninguna de estas cuatro contradice una
decisión de C-2**: tres resuelven condiciones que C-2 dejó escritas, y la cuarta
es un campo que el corpus del grupo C descubre en una colección ajena. Van aquí
porque cambian el esquema, y **se dicen en voz alta, no en silencio**.

| # | el modelo decía | la salida servida dice |
|---|---|---|
| **1** | `destacado` **texto plano** («si lleva marcado inline no se sabe — C-SP9; **mientras**, texto plano») | **lleva marcado**: `<strong>…</strong><br>` → **campo rico restringido a LÍNEA** (`strong`, `br`, texto). La condición la escribió C-2; esto la resuelve |
| **2** | `detalles.parametros?: string` | trae `<ul> <li> <sub> <b> <p>` dentro → **campo rico**, contrato del §3.1 (el `sub` ya está: 139 páginas del grupo A lo usan para fórmulas) |
| **3** | la FAQ es «cabecera + `h1` + cuerpo + pie estándar», el arquetipo más barato | además **`et_right_sidebar` con 4 widgets** (Buscar · texto vacío · Categorías · Suscríbete con enlace ofuscado en base64). **No añade campo** —P-C3-7 aguanta— pero sí pieza de plantilla. Es barato en CAMPOS, no en cascarón |
| **4** | la ficha del producto titula sus viñetas «Ventajas» (cableado en `ProductPanel`) | **dos valores en el corpus**: «Ventajas» (equipos) y **«Especificaciones»** (cartuchos) → **campo `bulletsTitulo` con defecto explícito `"Ventajas"`**, omitido cuando coincide |

**La 2 trae además una trampa de migración**, y es de las que no dan error: el
original escribe `<p><span>Parámetros:</span><br><ul>…</ul></p>`, y `<ul>`
dentro de `<p>` es HTML inválido — **el parser cierra el `<p>` antes del
`<ul>`**, así que la lista queda de **hermana** y un extractor ingenuo
(`.case-detalles-txt > p`) devuelve el campo **vacío**. El importador tiene que
recomponer la fila **hasta el siguiente rótulo**, no hasta el fin del `<p>`.

**La 4 es `CLAUDE.md` §Estructura que en realidad es contenido, otra vez**: el
componente se calibró con la primera instancia (los 5 productos de la home) y la
segunda lo desmiente. Se anota el campo con defecto; **no se cablea el valor de
la primera**, que es como se produce el arreglo falso.

**Y §3.1 pierde un SIN PROBAR**: «alineación e indentación | no medidas» ya
están medidas — `text-align` aparece **24 veces** en las 10 instancias, con
**tres valores** (`justify`, `left`, `center`) y en **cuatro etiquetas**
(`p`, `li`, `ul`, `div`). La decisión de qué hace el CMS con ella (conservar,
normalizar, o descartar como T2) sigue abierta, pero **ya no por falta de
datos**. Los `padding-top` en porcentaje que salen en el mismo inventario **no
son estilo de autor**: son el envoltorio de proporción de los `iframe`, y van
con el nodo-embed del §3.3b.

**Lo que la entrada CONFIRMÓ, y no hay que volver a preguntar:**

- **P-C3-1** — la 4ª sección del pie (el slider CTA de ancho completo) es
  **idéntica byte a byte en los 6 pares**. **D5 cerrada con cero campos.**
- **P-C3-2** — el cascarón no esconde ningún campo: **131 ejes × 2 anchos, 0 con
  varianza**, en 10 instancias adversarias.
- **P-C3-4, en lo comparable** — los 2 `data-id` que salen en más de un caso dan
  la ficha idéntica: la ficha **es** proyección del producto. 0 choques.
- **C-SP12** — el chip del detalle **enlaza** a `/es/sector/<slug>/`: la
  proyección única de `sectores` queda confirmada en las dos caras.
- **C-SP8** — las migas del **prefijo inglés apuntan al índice ESPAÑOL**
  (`/es/casos-de-exito/`). Es evidencia nueva **a favor de D2**: ni el propio
  original trata los 4 ingleses como una colección aparte.

---

## 2c · Los listados y hubs — decidido en LH-2 (2026-07-31)

Actas en `docs/research/listados-hubs/DECISIONES.md` y `MODELO.md`; evidencia
congelada en `medidas/lh-{regimen,censo,paginas,tarjetas}.json`. Lo que entra
al esquema:

**Colecciones nuevas — términos de taxonomía** (un listado no es un content
type: es una consulta; el contenido son los términos):

| colección | fuente | docs | campos |
|---|---|---|---|
| `etiquetas` | `post_tag` | 12 | `nombre` · `slug` |
| `categoriasRecursos` | `resources`, **jerárquica** | 10 (2 padres + 8 hijas) | `nombre` · `slug` · `padre?` |
| `categoriasCientificas` | `scientific-category` | 3 | `nombre` · `slug` |
| `categorias` | `category` | **SIN CENSAR** (LH-SP8: viva y fuera de sitemap) | se censa antes de modelar |

**El contrato de nacimiento del grupo A** (D3 — lo caro de re-migrar si
falta): `fechaPublicacion` · `imagenDestacada` opcional con sizes
**1080×675 · 1024×683 · 980 · 480** (amarra CMS-0b/M-IMG) · `extracto`
opcional con **derivación por defecto** (~267c del arranque + «…»; LH-SP10
decide si alguno es manual) · **relaciones a las TRES taxonomías** · y **sin
`autor`**: no lo exige ningún listado (0/9 formas, 0 URLs de author en `/es`).

**Arquetipos**: LISTADO-B (23 instancias, **una plantilla con tres variantes
de tarjeta** — config uniforme al 100 % dentro de cada familia) ·
LISTADO-TEMA-CPT (2) · LISTADO-TEMA-TAX (3, separado **con reapertura
escrita**). Los 6 hubs de builder **no estrenan arquetipo** (cola larga /
hipótesis grupo D), y `/es/casos-de-exito/` es una **página índice** sobre la
colección `casos`: lista las 57, ambos prefijos, **sin paginar** (fidelidad).

### ⚠ 2c.1 · `tituloMiga` — el rótulo NO es el titular (2026-07-31)

**Campo nuevo del content type, medido al cerrar A-QA1.** El rótulo del último
eslabón de la miga de pan **no es el `h1`** en el término de Kunakpedia:

| slug | miga | `h1` |
|---|---|---|
| `emisiones-atmosfericas` | «Emisiones atmosféricas» | «Emisiones atmosféricas y su impacto en el medioambiente» |
| `cloruro-de-hidrogeno-hcl` | «Cloruro de hidrógeno (HCl)» | «…: emisiones, riesgos y monitorización en calidad del aire» |
| `metano` | «Metano (CH4)» | «Metano, un desafío para la estabilidad climática global» |

**No es una excepción, es la regla de esa forma**: de las 14 instancias
transcritas, **3 de 3 términos difieren** y **11 de 11** entradas de blog y
documentos científicos coinciden. El `h1` es el titular largo y el rótulo es el
nombre corto del término.

> **`tituloMiga`: opcional, con defecto «el título», omitido en el dato cuando
> coinciden.** Es el mismo patrón que `prefijo` (CMS-1), `headingColor` y
> `variante`: un defecto explícito, que es además la decisión de diseño que
> hereda quien dé de alta un contenido nuevo.

**Y por qué no salió en la base de lectura, que es la parte que enseña.** El
término daba **−0.02** en el residuo del `h1`, o sea «limpio». No lo estaba: a
390 el rótulo corto y el largo **caen en 2 renglones igualmente**, así que la
diferencia —218.47 px de ancho a 1440— **no producía ni un píxel de alto**. Era
una **medida tapada**, no un acierto; y lo destapó preguntar por el ancho, no
por el alto.

⚠ Alcance: **3 términos de 37**. Que los 3 difieran es fuerte, pero el campo se
declara opcional precisamente porque no se ha censado la forma entera.

**La proyección de teaser pertenece al content type** y los listados la
consumen: `BlogPost`/`CaseStudy` (S1) quedan **verificadas contra 9 formas**
(`lh-tarjetas`). El listado embebido en páginas de builder es un **bloque de
consulta** que el clon ya tiene (`UltimosArticulos`, h3 medido).

## 2d · El grupo D — HD1 RECHAZADA, y la frontera medida (2026-08-03)

Contesta la hipótesis pre-registrada `docs/research/arquetipo-A/HIPOTESIS-GRUPO-D.md`.
Acta completa en `docs/research/grupo-D/RECON.md`; evidencia congelada en
`medidas/grupo-d-inventario.json` (13 páginas).

**HD1 preguntaba si `MonoSeccion[]` expresa el cuerpo del grupo D sin campos
nuevos —o sea, si esas páginas cuestan datos en vez de arquetipo—.**

> ❌ **RECHAZADA por D1**, que era el criterio que mandaba: **4 kinds de módulo
> que el modelo no tiene**, necesarios en **10 de las 13** páginas.

| kind ausente en `MonoModulo` | dónde |
|---|---|
| `blurb` | 3 artículos (×36, ×18, ×18) |
| `video` | 5 hubs (hasta ×20) |
| `toggle` | 5 hubs (hasta ×8) |
| `gallery` | 1 artículo (×2) |

**D2 y D3 no se evalúan**: D1 manda por el propio pre-registro —*«un cuerpo
idéntico al píxel después de añadir campos no prueba nada»*— y medirlos exigiría
construir, que es justo lo que D1 acaba de declarar caro.

### La frontera, en dos piezas y las dos medidas

**1 · Los módulos.** Lo dicho arriba: 4 kinds. Pero la mitad útil de HD1 **sí se
confirma** y hay que anotarla porque decide qué se reutiliza: **`MonoRitmo` y los
kinds de texto/imagen/botón sirven** — 3 de los 6 artículos se expresarían solo
con ellos (PD1 y PD2 acertaron).

**2 · El cascarón, que es el hallazgo que cambia el esquema.** PD3 predijo que la
barra lateral sería la frontera. **Acertó, y está un nivel MÁS ARRIBA de lo
previsto:**

```
et_pb_section_0_tb_body   ← PLANTILLA: sidebar SÍ · sticky SÍ · post_content SÍ
  └── et_pb_section_0     ← PROPIA de la instancia (aquí vive el cuerpo)
```

> **La barra lateral pegajosa está en 13 de 13 y siempre en la PLANTILLA, nunca
> en la sección propia.** O sea que **no es un campo de `MonoColumna`**: es
> **cascarón**, como la cabecera y el pie.

**Y eso es mejor noticia para el esquema que la predicción original:** una barra
lateral que fuera campo de columna **contaminaría el content type de
MONOGRÁFICO**. Siendo cascarón, el content type se salva y lo que cuesta es una
**plantilla de página**. La frontera queda más limpia y más barata de enunciar.

### Consecuencia para las colecciones: **son DOS formas, no una**

El enunciado hablaba de «13 páginas». **No son 13 artículos**, y la cuenta de
secciones propias las parte sin ambigüedad:

| forma | n | secciones propias | varianza |
|---|---|---|---|
| **artículo de KB** | 6 | **1** en las 6 | **cero** ⇒ plantilla |
| **hub / índice de KB** | 7 | 1 · 1 · 5 · 5 · 7 · 7 · 11 | **de 1 a 11** ⇒ campo |

~~**Decisión: el grupo D es arquetipo propio, y previsiblemente DOS
colecciones** —artículo y hub—.~~ **CERRADO en la tanda de decisión del mismo
día — y el «previsiblemente» estaba a medias:** ver §2d.1.

**Lo que NO se hizo, y es deliberado:** no se ha tocado `MonoSeccion[]`, no se ha
construido nada y **no se han añadido los 4 kinds**. Igual que los tres campos de
§1.3 siguen sin añadirse: la frontera se documenta, no se borra.

### ✅ 2d.1 · Las cinco decisiones del grupo D — CERRADAS (2026-08-03)

Por predicados pre-registrados **antes de evaluarse** (commit `effb473`):
`docs/research/grupo-D/PRE-REGISTRO-DECISION.md` fija la función de decisión,
`DECISION.md` la evalúa. Evidencia: `medidas/grupo-d-inventario.json` +
`medidas/grupo-d-plantilla.json` (censo `_tb_`, varianza cero en las 13).

| pregunta | decisión | predicado |
|---|---|---|
| **régimen** | **no hay tercero: el régimen es propiedad de la CAPA.** Grupo D = capa `_tb_` plantillada (1 firma en 13/13) + capa propia de builder (varía 1→11). `CLAUDE.md` corregido, no ampliado | P-R1 ∧ P-R2 |
| **hub de KB** | **casillero L4 de LH-2**: página compuesta por instancia → **cola larga, cero arquetipos**. NO es LISTADO-B (cero módulos de consulta; el instrumento los ve — el control EDAR trae `blog`) | ¬P-H1 ∧ P-H2 |
| **colecciones** | **UNA nueva: `articulos-kb`** (6 instancias, 1 sección propia las 6). Los 7 hubs, fuera de colección, con los 6 de LH-2. La pregunta «¿dos?» se disolvió al caer el hub en L4 | P-C1 ∧ P-C2 + dependencia declarada |
| **los 4 kinds** | **tipo propio por arquetipo; `MonoModulo` intacto.** `blurb`/`gallery` → unión propia de `articulos-kb` cuando se construya; `video`/`toggle` → con la cola larga, cuando se decida. Ninguno aparece en SECTOR/MONOGRÁFICO medidos (P-K1 ❌): añadirlos a `MonoSeccion[]` sería el arreglo falso de §1.5b Razón 1 | ¬P-K1 ∧ P-K2 |
| **D2/D3** | **SIN OBJETO, no «no se pudo»**: eran confirmatorios de HD1 y su pregunta desapareció con ella. Construcción-instrumento **no autorizada**. El píxel vuelve por la vía estándar (sonda de dos lados propia del arquetipo) al construir | P-M1 |

**Común compartido, no duplicado:** las definiciones de texto/imagen/botón y el
ritmo se exportan una vez y las consumen `MonoModulo` y la futura unión de
`articulos-kb` — *lo que se duplica es el documento, no la definición* (§1.5b).

**Consecuencia nueva para la cola larga, que antes no estaba escrita:** la cola
de páginas compuestas (6 hubs LH-2 + 7 hubs KB) **ya se sabe que `MonoSeccion[]`
solo no la cubre** — usan `video`/`toggle`. LH-2 D1 la dejó apuntando a la
hipótesis del grupo D; la hipótesis cayó, así que la cola larga necesitará su
propia decisión de modelo cuando toque.

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
| **upload / vídeo** | **8 `<video>` en 8 páginas** (+2 `<embed>`) — censado 2026-07-30, ver §3.1b |
| **regla horizontal** | 5 |
| **bloques** (`BlocksFeature`) | el vehículo de los nodos tipados de §3.3 |
| **embed**, con **URL** (no `enum` de proveedor) | **83 `iframe` · 18 hosts** — censado 2026-07-30, ver §3.3b |
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
| **T6** | `id` de los `h2` | **✅ REGENERAR, no conservar (2026-07-30).** A-SP9 cerrada: **los pone el JS del tema**, no el contenido — 0 `id` en el HTML servido y 16 en el DOM **en la misma página**, y 8 páginas sin excepción (`npm run qa:a-ids`, `medidas/a-ids.json`). No hay nada que migrar: el `id` **no entra en el campo** y el índice del artículo se **deriva** de los encabezados |
| **T7** | **enlaces internos DENTRO del cuerpo rico** — **181/209** páginas del grupo A llevan enlaces | al importar, **los enlaces cuyo destino sea una ruta que publicamos se reescriben a ruta local; los que apunten fuera se dejan** (la regla de rutas locales de `CLAUDE.md`, aplicada al contenido y no solo a los datos). Nació en la sesión de C-3: dos enlaces dentro del campo rico apuntaban al original y `qa:enlaces` los convirtió en fallo al emitir las rutas nuevas — la sonda vigila la **salida**; T7 es la mitad de **entrada**, para que la guarda no cace uno a uno lo que el import puede reescribir en bloque. ⚠ Vivió solo en el informe de sesión hasta el 2026-07-31 (**mencionado no es documentado**, `CLAUDE.md` §sondas regla 3): una tanda llegó a «corregir» un plan de T1-T7 a T1–T6 comprobando este registro — la comprobación no distingue «nunca existió» de «no se escribió» |
| **T8** | el **token de Cloudflare Rocket Loader** en el `type` de los `<script>` del cuerpo | **se normaliza a `text/javascript` al importar** (y después T4 decide qué pasa con el script). Rocket Loader reescribe `type="text/javascript"` poniéndole delante un token de 24 hex **distinto en cada petición**, para aplazar la ejecución. Medido al comparar **dos congelaciones de `a-spec` del mismo día**: misma longitud, contenido distinto en **4 de las 14** instancias, y la única diferencia era ese token (evidencia en `medidas/a-spec-SEGUNDA-CARGA-token-cloudflare.json`). Sin T8, **cada re-import marcará esas páginas como cambiadas sin que haya cambiado nada**, y el historial del CMS se llena de ruido que nadie puede explicar. Y hay un argumento de fondo además del operativo: ese `type` **no lo escribió nadie**, lo inyecta la capa de entrega — migrarlo verbatim sería importar un artefacto del CDN como si fuera contenido |

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
| **Reproductor de NBC Washington** (`nbcwashington.com/portableplayer/?CID=…&autoplay=true`) | 1 | 1 | **✅ resuelto (2026-07-30): eliminación + sustitución** → **enlace a la noticia**. Ver abajo |

**El reproductor de NBC, decidido: se elimina y se sustituye por un enlace a la
noticia.** Las dos razones ya estaban medidas y solo faltaba resolver: lleva
`autoplay` —que un CMS propio no debería heredar de un tercero— y un `CID` que
**caduca**, así que un embed convierte un documento del corpus en algo que se
rompe solo el día que la cadena rote el identificador. Un enlace se degrada a
enlace muerto; un embed se degrada a hueco. Y no cuesta un proveedor nuevo: la
lista cerrada de abajo **se queda en cinco**.

**Regla que sale de esto, y va a la whitelist:**

> **`script` no entra.** En un CMS propio, script arbitrario dentro del contenido
> no debe existir. Los 17 acaban en **nodo-embed tipado (7)** o en **eliminación
> documentada con sustitución (10)**.

⚠ **Ese reparto era 8 · 9 hasta hoy, y estaba mal contado**: daba el de NBC por
embed cuando su fila decía «decisión abierta». Con la decisión tomada el reparto
real es **7 · 10** — Flourish 4 + Twitter 2 + Instagram 1 por un lado; FB3D 6 +
Swiper 3 + NBC 1 por el otro. Suman 17 igual, y ahora por las razones ciertas.

Y el nodo-embed tipado no es libre: **proveedor de una lista cerrada** —
`youtube`, `ourworldindata`, `flourish`, `twitter`, `instagram`— más su
identificador. Los `iframe` ya censados (55/209: YouTube **y** gráficos
interactivos) entran por el mismo nodo, no por HTML crudo.

### ⚠ 3.3b · La lista cerrada de 5 NO es un modelo viable — CENSADO (2026-07-30)

El piloto de CMS-0e vio 3 proveedores fuera de la lista en 24 páginas. Ahora está
**censado en las 209**, con el mismo argumento que escribió `campo-rico.spec.md`
para las etiquetas: **contar dentro de un contenedor es `fetch` + parseo, así que
muestrear sería aceptar incertidumbre a cambio de nada.** Sonda
`npm run qa:a-embeds`, salida congelada en `medidas/a-embeds.json`.

**83 `iframe` · 18 hosts distintos.** Y el reparto es el que decide:

| | hosts | iframes |
|---|---|---|
| **en la lista cerrada** | **2** — `youtube.com` (42 en 36 pág.) · `ourworldindata.org` (20 en 12 pág.) | 62 (75 %) |
| **fuera de ella** | **16** | 21 (25 %) |

**La lista falla de tres formas distintas, y conviene no contarlas como una:**

1. **Tres de los cinco listados no aparecen nunca como `iframe`** —flourish,
   twitter, instagram entran por `<script>` (§3.3)—. La lista describe scripts y
   se estaba aplicando a iframes.
2. **El patrón está incompleto para un proveedor que SÍ está listado:**
   `flo.uri.sh` **es Flourish** por su acortador, y el regex solo casaba
   `flourish.studio`. Habría contado como «proveedor nuevo» algo ya decidido.
3. **La cola es larga y no se repite: 12 de los 16 hosts aparecen UNA sola vez.**
   Canva, Google Sheets, Google Maps (con dos TLD), ArcGIS (con dos hosts),
   Facebook, LinkedIn, un Grafana de Ports de Balears, el geoportal de Madrid, el
   Banco Mundial, `shipmap.org`, un `clicdata`, un `gamma.site`… y un `iframe`
   que apunta a **un `.gif`** (`essic.umd.edu`), que no es un embebido de nada.

**Es la misma forma de dato que produjo la decisión del campo rico**, y merece la
misma respuesta. Un `enum` cerrado sobre una cola donde 12 de 16 valores aparecen
una vez no es un modelo: es una lista de excepciones esperando a la número 17.

> **El nodo-embed lleva URL, no un `enum` de proveedores.** El proveedor pasa a
> ser **derivado** (para elegir cómo se renderiza y qué se permite), y la lista
> cerrada baja de **tipo** a **política de validación**: una allowlist editable
> que se comprueba al guardar, no un tipo que hay que migrar cada vez que alguien
> embebe un Canva.

Con eso, los 21 de la cola dejan de ser 16 decisiones de esquema y pasan a ser
**una decisión de política** —qué hosts se admiten— más los casos que haya que
rechazar a mano. **Y no rebaja CMS-0e:** el que apunta a un `.gif` y el
`gamma.site` siguen necesitando que una persona mire, que es exactamente el
argumento de que el cuerpo entre crudo.

⚠ **Lo que queda SIN DECIDIR** es el contenido de esa allowlist inicial. Se
propone arrancar con los 18 hosts censados y exigir alta explícita para
cualquiera nuevo; **no se cierra aquí** porque es una decisión de política de
seguridad (un `iframe` de terceros ejecuta código de terceros), no de modelado.

### ⚠ 3.1b · Falta el nodo de vídeo — CENSADO (2026-07-30)

Del mismo censo: **8 `<video>` en 8 páginas**, con 7 `<source>`, más **2
`<embed>` en 2 páginas**. §3.1 no tiene nodo que los represente.

Es hueco **de esquema, no de dato**: se cierra **añadiendo el nodo** —upload de
vídeo, que es lo que son (`.mp4` en `wp-content/uploads`)— y no pidiéndole nada a
nadie. Va a la whitelist del §3.1 como `upload` de tipo vídeo, con `<source>`
resuelto a la relación de media y el contenido de reserva —texto y enlace— como
hijos, que es lo que el piloto ya hace.

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

El grupo C añade evidencia sin cambiar el dilema: **2 `table` más** en 57 casos
(1 es + 1 en, con `thead`/`th` la inglesa), censadas en `c-censo.json`. La
decisión sigue abierta y sigue siendo la misma para los dos grupos.

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

### ⚠ 4b · La PAGINACIÓN son 107 rutas más, medidas (2026-07-31)

Del recon de listados y hubs (`docs/research/listados-hubs/PAGE_TOPOLOGY.md`
§5, sonda `qa:lh-paginas`, congelado en `medidas/lh-paginas.json`). **Dato de
enrutado, no de modelado**, y por eso entra aquí:

| | |
|---|---|
| patrón | **`/page/N/`**, sin excepción en las 35 |
| listados que paginan | **21** de 35 |
| **rutas extra** además de las 35 primeras | **107** (total **142**) |
| mayores | `etiqueta/monitorizacion-ambiental` 19 · `blog` 17 · `recursos/articulos` 16 |

Tres consecuencias para este §:

1. **El plano de slugs crece**: a los **202** ya censados se suman **107 rutas
   de paginación** cuando esos listados se emitan. La guarda de build de (3) las
   cubre por construcción —se deriva del `prerender-manifest`— pero conviene
   saber el volumen antes, no después.
2. **`dynamicParams = false` obliga a emitirlas todas en build**, así que las
   107 son coste de rebuild: entra en **A-SP13** (§2.3), que ya estaba abierta
   por las 209 del grupo A.
3. **Y 7 páginas del original NO paginan aunque respondan 200 a cualquier
   `/page/N/`** (los 6 hubs de builder y `casos-de-exito`): su canonical apunta
   a la primera, o sea que es **contenido duplicado infinito del original**. **No
   se replica** — son 1 ruta cada una. Contarlas por su HTTP 200 habría metido
   **441 rutas inexistentes** en este cálculo.

~~**Y un campo que el recon deja medido, sin modelar:** el número de entradas
por página no es constante entre familias — por el test B eso es campo del
listado.~~

> ⚠ **CORREGIDO en LH-2 (2026-07-31), y la corrección es de LENTE, no de
> dato.** El párrafo tachado aplicó el test B con la lectura del régimen
> BUILDER a páginas PLANTILLADAS — exactamente el error contra el que avisa
> `CLAUDE.md` §régimen. Con la lente correcta: dentro de cada familia la
> varianza es **cero** (todas las etiquetas a 9; los resources a 15; los dos
> L2 a 5), y varianza cero entre instancias = **plantilla**. Lo que varía
> **entre** familias distingue plantillas (las tres variantes de LISTADO-B),
> no campos. El «3» de seminarios-web no era config sino contenido (solo hay
> 3 seminarios).
>
> **`entradasPorPagina` es PARÁMETRO DE PLANTILLA por variante: 9
> (blog/etiqueta) · 15 (resources) · 5 (L2) · L3 SIN PROBAR (LH-SP9).**

**Y las decisiones de D2 (LH-2) que este § hereda:**

1. las rutas `/page/N/` se **derivan en build** (`⌈entradas/porPagina⌉`), no se
   almacenan; con `dynamicParams = false` se emiten todas y la guarda de (3)
   las cubre sola. Publicar o despublicar una entrada **puede crear o destruir
   rutas** — el rebuild por webhook lo absorbe por construcción;
2. los **7 que responden 200 a cualquier N no se replican**: el clon sirve 404
   (su canonical ya los declara no-rutas). Desviación deliberada → a
   `PENDIENTES-QA.md` en la tanda que construya;
3. el 107/142 es **una foto del 2026-07-31**: la tanda que construya re-corre
   `qa:lh-paginas` ese día y verifica contra esa corrida (P-LH-C3).

**Traducción a Payload de (2):** la unicidad **entre** colecciones no es nativa.
Un hook `beforeValidate` que consulte las demás familias planas (o una
colección-índice de slugs) protege **el alta**; la guarda de build protege **el
conjunto**. Son complementarias, no alternativas: el hook avisa a quien edita,
la guarda caza lo que entre por cualquier otra vía.

✅ **CMS-0c resuelta, y por la rama que este § asumía: rebuild por webhook.** Ya
no hay condicional que arrastrar — **el §4 queda vigente tal como está escrito**,
sin releer. La guarda de build de (3) es además la que corresponde: si las rutas
se deciden en build, ahí es donde tiene que fallar la colisión.

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
| **CMS-1** | el caso de éxito tiene **dos patrones de ruta**: 53 en `/es/casos-de-exito/` y **4 en `/es/case-studies/`** | **✅ resuelta (2026-07-30, C-2): el prefijo como campo con defecto** en la colección única `casos` — §2b y `grupo-C/DECISIONES.md` D2. Los 4 son contenido propio en español sobre la misma plantilla; el modelo es robusto a C-SP2 (las rutas cruzadas no se emiten) |
| **CLASE (S9–S11)** | 4 residuos de SECTOR con una causa: **componente calibrado con UNA instancia** | **es deuda de CMS-readiness, no de acabado**: un CMS no da un rango de contenido, da cualquiera. Los extremos ya están medidos (alto del slider @390: 265.06 · 300.14 · 300.16; `h1` de EDAR a 4 líneas) |
| **M-IMG** | residuo de décimas: el original sirve por `srcset` una variante cuya proporción redondea distinto | se cierra con `srcset`, no con maquetación. **CMS-0b ya está decidida** (volumen persistente) y **no lo cierra ni lo reabre**: dónde viven los ficheros no decide qué variantes se generan. Lo que queda es el juego de tamaños que emita el CMS y su redondeo — **SIN MEDIR**, y es lo mismo con volumen que con S3, así que la reversibilidad de CMS-0b no lo toca |
| **S1** | tarjetas de caso y de artículo: **la mitad construida del par listado→detalle** (206 páginas) | los modelos `CaseStudy`/`BlogPost` son la **proyección de teaser**: falta cuerpo, slug (hoy `href` absoluto al original), taxonomía y SEO |
| **C-QA7** (2026-07-31) | el **`pt` de la primera fila del cuerpo** en las 4 páginas de producto (régimen builder) es **campo, no plantilla**: huella test A medida con `qa:banda` — **0 px a los dos anchos** en accesorios/api/software (el editor lo anuló) y **2 %/30 (default intacto)** en monitor. Cuatro hermanas, dos valores | cuando PRODUCTO/CATÁLOGO/SOFTWARE se modelen, la fila del hero lleva su ajuste de ritmo como **campo con defecto 2 %/30** (la familia de `flujo` de SECTOR, en la entrada del cuerpo). Hoy resuelto en plantilla por página, cada una con su valor **medido**. Y el kicker (35px/42 ≤767, 50/60 desde 768) es **plantilla con varianza cero en los 4**: al modelar, UN componente — cablearlo por instancia ya costó dos defectos (C-QA7) |

### ⚠ 6b · EL PIE — una plantilla con variante de CTA, y su presentación por TIPO DE PÁGINA (2026-08-01)

**Pregunta del encargo de D4:** el pie del original mide distinto por familia
—593.75 blog · 1048.25 catálogo · 681.09 software— y es constante dentro de cada
una. ¿Mismo pie con contenido distinto, o **plantillas distintas** del Theme
Builder, como el `tb_footer` 4 vs 3 que midió C-1?

**Medido** (`npm run qa:d4 -- 1440`, congelado en `medidas/d4-pie-1440*.json`),
7 familias, sobre el ORIGINAL:

| familia | secs | ancho de fila | `pt/pb` de sección | alto |
|---|---|---|---|---|
| A · blog · A · término · SECTOR | 3 | **1238.39** | 0 | 593.75 |
| SOFTWARE | 3 | **1152** | 0 | 681.09 |
| CATÁLOGO · PRODUCTO | 3 | **1152** | **57.5938** | 1048.25 |
| **CASO** | **4** | 1238.39 | 0 | 936.81 |

**La respuesta son las dos cosas, y hay que separarlas:**

1. **El CONTENIDO del pie es el mismo en las 7.** Las tres secciones son las
   mismas —`footer-links` (8 módulos, 5 columnas), `footer-legal` (7 módulos, 3
   columnas), `footer-background` (1 columna)— con las mismas clases
   `et_pb_section_N_tb_footer` y prácticamente los mismos enlaces (46–48).
   **No es un pie distinto: es el mismo pie.**
2. **CASO añade una CUARTA sección** —un CTA, «Do you need to control the
   environmental i…», 343.06 de alto, 4 módulos y ninguna fila Divi— que las
   otras seis no tienen. Eso **sí** es otra plantilla, y confirma el `tb_footer`
   4 vs 3 de C-1 con su contenido a la vista.
3. **Lo que hace variar el alto entre las seis restantes NO es contenido: es
   presentación**, y son **dos ejes independientes**:
   - **ancho de fila** 1238.39 (86 %) contra 1152 (80 % de 1440). Más estrecho →
     columnas de 230.39 en vez de 247.67 → los enlaces envuelven más →
     `footer-links` pasa de 430.78 a 518.13. **Es la regla del ancho, en el pie.**
   - **`padding` vertical de sección** 0 contra **57.5938** (el default Divi del
     4 %, ya documentado). Solo catálogo y producto lo llevan, y explica
     `footer-background` **al céntimo**: 41 → 156.19 = **+115.19 = 57.5938 × 2**.

**Decisión de modelo, que es lo que pedía el encargo:**

> **El pie es UNA plantilla con una variante (`conCta`), no un content type con
> campos por instancia.** La firma lo dice: **constante dentro de cada familia y
> distinta entre familias** es la firma de una decisión de PLANTILLA — nadie
> editó el pie de `/accesorios` a mano; lo heredó de su tipo de página. Es la
> misma lectura de régimen de `CLAUDE.md`: en plantillado, cero varianza entre
> instancias = plantilla, aunque el número sea px absoluto.
>
> Y la presentación —ancho de fila y `padding`— **no es un campo del pie**: es un
> **ajuste del tipo de página**, porque los mismos valores gobiernan la retícula
> del cuerpo (86 % en grupo A y sector, 80 % en producto/catálogo/software). Al
> modelar, va en la **plantilla de tipo**, no en el dato del pie.

**Consecuencia para el clon (D4, abierta):** hoy el clon sirve **681.09 siempre**
—el valor de SOFTWARE, con el que se calibró— y por eso acierta en esa familia y
falla en las demás. El arreglo **no es un campo por página**: es que el pie tome
ancho de fila y padding **del tipo de página**, y que CASO reciba su cuarta
sección. Registro del defecto en `PENDIENTES-QA.md` §COBERTURA C1/D4.

### ⚠⚠ 6b.1 · CORRIGE al §6b — son TRES ejes, y las formas son ONCE (2026-08-01)

El §6b de arriba se escribió con **7 familias medidas y dos ejes**. Al escribir
el arreglo, ampliar la sonda a **las 11 formas que el clon emite** y bajar al
nivel del renglón cambió dos cosas. La decisión de modelo **no se mueve** —sigue
siendo plantilla por tipo de página, no campo por instancia—; lo que se corrige
es **cuántos ejes tiene esa plantilla** y **a cuántas formas se aplica**.

**(1) Faltaban 4 formas — 9 de las 31 rutas.** FAQ, HOME, A·documento y
MONOGRÁFICO no estaban medidas. Las cuatro caen en la presentación **ancha**, y
la que importa es **HOME**: su pie en el original es **idéntico al de grupo A**
(593.75 / 1761.17, fila 86 %, 3 secciones), no una maquetación propia.

**(2) El tercer eje es TIPOGRAFÍA.** Con solo ancho de fila y `padding`,
`footer-background` cuadra al céntimo y **catálogo/producto se quedan a −79.19**.
Medido con `qa:d4-tipo` (5 formas, **idéntico a 1280, 1440 y 390** → no es un
breakpoint):

| eje | ancha | estrecha | estrecha+pad |
|---|---|---|---|
| `li` font-size | 14px | 14px | **18px** |
| `li` line-height | **26px** | 30.6px | 30.6px |
| `li` margin-bottom | **0** | 7px | **9px** |
| `ul` padding-bottom | **14px** | 0 | 0 |
| legal `<p>` font-size | 12px | 12px | **18px** |

El legal a 18px envuelve a **2 renglones (61.19)** en vez de 1 (30.59): son los
**+32.59** de `footer-legal`, al céntimo. La firma que lo delató es que crecen
las columnas de **texto** y la de la **imagen** no se mueve (0).

**(3) Y hay un cuarto eje anotado, sin cerrar:** el bloque de **iconos sociales**
vale **31.59 en ancha** y **61.59 en estrecha** (columna 2 de `footer-legal`).
Sale como **+31.59 en `ancha` a 390**. Medido, no modelado — **SIN PROBAR** para
las formas que no se midieron.

> **La lección, que es la de `CLAUDE.md` §El NIVEL aplicada al pie:** el alto de
> una sección es un contenedor con holgura. Los dos ejes reproducían el TOTAL de
> `footer-background` —que no tiene texto— y por eso parecían el modelo entero.
> Lo que no cuadraba vivía **en el renglón**, dos niveles más abajo, y solo
> aparece midiendo por composición: fila → columna → `li`.

### ⚠⚠ 6b.2 · CORRIGE al §6b.1 — son SEIS ejes, y el sexto no es del pie (2026-08-02)

El §6b.1 cerró con **tres ejes y un cuarto anotado**. Al cerrar el residuo
aparecieron **dos más**, y el segundo obliga a decir del preset algo que no
estaba dicho.

**(5) El bloque «¡Suscríbete!»**, medido con `qa:d4-sus` en los dos lados y los
dos anchos. Era el residuo ENTERO de `footer-links`: de las cinco columnas del
pie, cuatro cuadran al céntimo en las tres presentaciones.

| eje | ancha | estrecha | estrecha+pad |
|---|---|---|---|
| `margin-top` del envoltorio | 16 | 16 | **0** |
| `margin-bottom` del envoltorio | 46 | 46 | **30** |
| `padding-bottom` del botón | **10** | 3.109 / 2.297 | **10** |

El `padding-bottom` del botón es **el único valor de todo el preset que cambia
con el ancho**, y solo en `estrecha`. Los demás son idénticos a 1440 y a 390.

**(6) Los 42 px entre el cuerpo y el pie — y NO son un eje del pie.** Son el
`margin-bottom` del `<article>` del CPT en el original, medido sobre 11 formas
con `qa:d123`:

| formas | `<article>` | `margin-bottom` |
|---|---|---|
| catálogo · software · producto | `type-solutions` | **42** |
| sector · monográfico · home | `type-page` | 0 |
| A·blog · A·término · A·documento | no hay `<article>` en la cadena | 0 |

> **Lo que esto cambia del modelo:** el preset **no es «la presentación del
> pie»**. Es **la presentación que hereda un TIPO DE CONTENIDO**, y el pie es
> solo donde se vio primero. La frontera de los 42 px es el CPT de WordPress, y
> resulta ser **exactamente la misma** que separa `ancha` de las dos estrechas.
> Dos propiedades que no se tocan —una del envoltorio del post, otra del ancho de
> la fila del pie— caen del mismo lado de la misma raya **porque las dos las fija
> el tipo de contenido**.

**Consecuencia para el content type:** el preset se nombra por lo que es
—herencia del tipo de contenido— y puede llevar campos que no pinten en el pie.
Al migrar, `antesDelPie` es un valor del **tipo**, no del documento, y su defecto
es 0.

⚠ **Y una advertencia de atribución que hay que arrastrar:** el clon cablea esos
42 px como espacio antes del pie porque **no tiene envoltorio `<article>`**. La
geometría es la misma; el dueño no. Quien modele esto en el CMS lo pone en el
tipo de contenido, no en el componente de pie.

---

**Consecuencia para el content type:** la presentación del pie es un **preset de
tres valores** (`fila`, `padSeccion`, `tipografía`) que el tipo de página hereda
entero, no tres campos sueltos que un editor combine. Las tres combinaciones
observadas son las tres que existen: no hay ninguna forma con fila ancha y
tipografía de 18px, ni con `padding` y fila ancha.

---

## 7 · Decisiones abiertas, en un sitio

| # | decisión | bloquea |
|---|---|---|
| §3.4 | tabla: nodo de Lexical vs block | whitelist |
| §3.3b | **contenido de la allowlist de hosts de embebido** — 18 censados en A, y los del grupo C sin censar por host (C-SP6) | política, no modelado: el nodo ya lleva URL |

**Y una condición escrita, que no es decisión abierta pero se cobra igual:** el
**recuento** de CMS-0e (16 · 3 · 5) es **provisional** hasta rehacerlo con
`@payloadcms/richtext-lexical` instalado. La decisión no depende de ello —la
sostiene el inventario—, pero **ningún número del §CMS-0e·B se cita como firme**
antes de esa corrida.

**Cerradas el 2026-07-30**, y dónde vive cada acta: **CMS-0d** (Next 16.2.12,
§CMS-0d) · **CMS-0c** (rebuild por webhook, §CMS-0c) · **CMS-0b** (volumen
persistente, §CMS-0b) · **CMS-0e** (HTML crudo primero, §CMS-0e) · **T6/A-SP9**
(el `id` se regenera: lo pone el tema — §3.2 y `campo-rico.spec.md` §4) · **§3.3**
(el reproductor de NBC: eliminación con enlace a la noticia) · **§1.5** (dos
colecciones, no una con discriminante — §1.5b, con condición de reapertura
escrita) · **CMS-1** (el prefijo del caso como campo con defecto — §2b y
`grupo-C/DECISIONES.md` D2, en la tanda C-2 que también dejó decidido el grupo
entero: D1–D5). De las ocho, las únicas que tocaban a otro § eran CMS-0c (que
confirmó el §4) y CMS-1 (que entra al §6 como resuelta).

De las dos que quedan, **ninguna bloquea instalar Payload ni construir C-3**:
una es de contenido (cómo se modela la tabla) y una de política (qué hosts de
embebido se admiten). El camino de infraestructura está despejado.

⚠ **Y dos cosas que el censo de embebidos cambió, no añadió:** el nodo-embed pasa
a llevar **URL en vez de `enum` de proveedor** (§3.3b: 18 hosts, 12 de ellos una
sola vez) y **§3.1 estrena nodo de vídeo** (§3.1b: 8 `<video>` en 8 páginas). Las
dos estaban dadas por resueltas y no lo estaban.

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

### 8.1 · ⚠ El contrato NO es el mismo a todos los anchos (2026-08-02)

El listón de arriba dice **«umbral CERO, 11 páginas, 2 anchos»**, y hay que leer
las tres palabras juntas: **el umbral cero vale EN esos dos anchos**. Fuera de
ellos el contrato es otro, y confundirlos genera trabajo sin final.

| dónde | contrato | qué es un defecto |
|---|---|---|
| **1440 y 390** | **FIDELIDAD** | cualquier Δ ≠ 0 por encima del suelo de ruido |
| **cualquier ancho intermedio** | **COMPORTAMIENTO DE RANGO** | un valor **cableado** donde el original **varía** |

**Por qué:** el original es **Divi fluido** —porcentajes, filas que reflotan,
`max-width` que entra a un ancho que nadie eligió— y el clon es Tailwind con
cortes declarados. Las dos curvas pasan por 1440 y por 390 y **no coinciden entre
medias**. Igualarlas punto a punto sería reproducir el motor de Divi, no la
página.

**Consecuencia para la aceptación de la migración:** el criterio de §8 **no
cambia** —sigue siendo Δ0 a 1440 y 390—, pero se le añade una comprobación que
antes no estaba escrita y que el CMS puede romper sin que el listón se entere:

> **Lo que a 1440 y 390 es un número, en el CMS puede volverse un campo.** Si al
> migrar una presentación se convierte en un valor guardado, hay que comprobar
> que **sigue variando donde el original varía**, no solo que coincide en los dos
> anchos del listón. Un campo con el valor de 1440 dentro **pasa el listón y
> rompe el rango**.

Es la misma trampa que la **FAMILIA DE CALIBRACIÓN** (`PENDIENTES-QA.md`
§CLASE), una vuelta más arriba: allí un componente hereda los valores del primer
contexto medido; aquí un **campo** heredaría los valores del primer *ancho*
medido.

**Cómo se comprueba, en dos preguntas:** ¿el original varía en ese tramo? Si sí,
¿el clon también? Si el clon devuelve una constante donde el original se mueve,
es **defecto de rango** — se arregla haciendo que dependa de lo que el original
hace que dependa, **nunca cableando el valor del ancho medido**.

---

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
