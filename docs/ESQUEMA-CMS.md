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
| **T6** | `id` de los `h2` | **A-SP9**: si los pone el tema, se regeneran; si vienen en el contenido, se conservan. **No decidido** — pero el piloto de CMS-0e midió **299 encabezados en las 24 y ninguno con `id`**: si el censo de las 209 lo confirma, no hay nada que conservar y la decisión se cae sola |

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

⚠ **La lista de cinco NO cubre el corpus, y el piloto de CMS-0e lo midió.** En
**24 páginas** aparecieron **tres proveedores que no están en ella**:
`storymaps.arcgis.com`, `www.linkedin.com` y un `…gamma.site`. Es una por cada
ocho páginas de la muestra adversaria, así que en las 209 habrá más y **no se
sabe cuántos**: el censo de `iframe` contó cuántos hay, no de quién son.

Eso deja el §3.3 con **un fleco que antes no se veía**: o la lista deja de ser
cerrada, o se acepta que una fracción del corpus caiga en «decidir caso a caso» al
importar. **No se decide aquí** —hace falta el censo de proveedores sobre las
209, que es una sonda que no existe—, pero se anota ahora porque cambia el
tamaño de lo que §3.3 daba por resuelto. Y refuerza CMS-0e: es otra decisión
**por documento**, de las que no se pueden tomar en una importación masiva.

⚠ **Y falta un nodo de vídeo en §3.1.** El piloto halló **5 `<video>` en 4 de las
24**, sin nodo que los represente. Es hueco **de esquema, no de dato**: se cierra
añadiendo el nodo (upload de vídeo o embed propio), no pidiéndole nada a nadie.

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
| **CMS-1** | el caso de éxito tiene **dos patrones de ruta**: 53 en `/es/casos-de-exito/` y **4 en `/es/case-studies/`** (slug inglés) | un content type cuyo slug no determina su ruta necesita **el prefijo como campo** o una tabla de excepciones. **Abierta** |
| **CLASE (S9–S11)** | 4 residuos de SECTOR con una causa: **componente calibrado con UNA instancia** | **es deuda de CMS-readiness, no de acabado**: un CMS no da un rango de contenido, da cualquiera. Los extremos ya están medidos (alto del slider @390: 265.06 · 300.14 · 300.16; `h1` de EDAR a 4 líneas) |
| **M-IMG** | residuo de décimas: el original sirve por `srcset` una variante cuya proporción redondea distinto | se cierra con `srcset`, no con maquetación. **CMS-0b ya está decidida** (volumen persistente) y **no lo cierra ni lo reabre**: dónde viven los ficheros no decide qué variantes se generan. Lo que queda es el juego de tamaños que emita el CMS y su redondeo — **SIN MEDIR**, y es lo mismo con volumen que con S3, así que la reversibilidad de CMS-0b no lo toca |
| **S1** | tarjetas de caso y de artículo: **la mitad construida del par listado→detalle** (206 páginas) | los modelos `CaseStudy`/`BlogPost` son la **proyección de teaser**: falta cuerpo, slug (hoy `href` absoluto al original), taxonomía y SEO |

---

## 7 · Decisiones abiertas, en un sitio

| # | decisión | bloquea |
|---|---|---|
| §3.4 | tabla: nodo de Lexical vs block | whitelist |
| T6 / A-SP9 | los `id` de los `h2`: conservar o regenerar | índice del artículo |
| CMS-1 | prefijo de ruta del caso de éxito | grupo C |

**Y una condición escrita, que no es decisión abierta pero se cobra igual:** el
**recuento** de CMS-0e (16 · 3 · 5) es **provisional** hasta rehacerlo con
`@payloadcms/richtext-lexical` instalado. La decisión no depende de ello —la
sostiene el inventario—, pero **ningún número del §CMS-0e·B se cita como firme**
antes de esa corrida.

**Cerradas el 2026-07-30**, y dónde vive cada acta: **CMS-0d** (Next 16.2.12,
§CMS-0d) · **CMS-0c** (rebuild por webhook, §CMS-0c) · **CMS-0b** (volumen
persistente, §CMS-0b) · **CMS-0e** (HTML crudo primero, §CMS-0e) · **§3.3** (el
reproductor de NBC: eliminación con enlace a la noticia) · **§1.5** (dos
colecciones, no una con discriminante — §1.5b, con condición de reapertura
escrita). De las seis, **la única que tocaba a otro § era CMS-0c**, y lo hizo
confirmando el §4 en vez de cambiarlo.

De las tres que quedan, **ninguna bloquea ya instalar Payload**: dos son
decisiones de contenido (cómo se modela la tabla, qué pasa con los `id`) y una de
modelado (el prefijo del caso de éxito). El camino de infraestructura está
despejado.

⚠ **T6 tiene dato nuevo y no se ha usado todavía:** las 24 páginas de la muestra
traen **299 encabezados en el cuerpo y ninguno con `id`** (§CMS-0e·C). Si el censo
de las 209 lo confirma, «conservar o regenerar» se queda sin nada que conservar y
deja de ser una decisión.

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
