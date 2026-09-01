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
| despliegue | ~~embebido en la propia app Next~~ ⚠ **revisado por CMS-0f (2026-08-03): DOS APPS en monorepo, misma DB** — la letra «embebido» cae; la intención (self-hosted, sin headless SaaS, lectura sin HTTP) se conserva entera |
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
| **CMS-0f** | **app única vs dos apps en monorepo**, y la frontera de la lectura en build | **✅ resuelto (2026-08-03): DOS APPS + Local API por paquete compartido**, abajo |

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

~~**SIN MEDIR, y es operativo, no de esquema:** quién dispara el webhook, cuánto
tarda el rebuild con las 209 del grupo A dentro (**A-SP13**) y qué ve el editor
mientras tanto.~~

> ✅ **LAS TRES MEDIDAS Y CONTESTADAS (2026-08-07, F2-4).** Acta completa con
> configuración y congeladas: `PLAN-FASE-2.md` §F2-4 · ACTA.
>
> | incógnita | respuesta |
> |---|---|
> | quién dispara | hook `afterChange`/`afterDelete` de Payload, cableado en `colecciones.ts` para todo lo que no sea grupo `Sistema`; opt-in por `PUBLICAR_URL`. ⚠ **Esta fila se escribió el 2026-08-07 y NO estaba medida**: el hook existía sin un solo consumidor que lo hiciera correr (`grep -rn PUBLICAR_URL`: cero llamadas). **Medida el 2026-08-08** por `qa:publica-e2e` — guardar por la Local API dispara, 1 guardado = 1 disparo, 0 de `slugs`, y el cambio llega al artefacto servido |
> | **cuánto tarda** | **41.84 s a 31 rutas · 91.41 s a 220** (mediana; cota superior — los clones pesan 4.16× la media del corpus). Pendiente medida **0.2228 s/ruta** en la fase que escala, **lineal y sin codo** |
> | qué ve el editor | `GET /estado` del publicador, con el `ultimoFallo` conservado hasta que un build termine bien |
>
> **Las tres consecuencias de arriba SE CONSERVAN**, con una grieta declarada y
> acotada en la 1: `/vista-previa/[slug]` lee Postgres en runtime. **No entra en
> el `prerender-manifest`** (`force-dynamic`), así que las sondas que derivan sus
> rutas del build siguen midiendo las 31 de siempre; si Postgres cae, cae esa
> ruta y sólo ésa.
>
> ⚠ **Y un hallazgo que la consecuencia 1 no anticipaba, medido:** un `next
> build` que falla **borra el build anterior** (`BUILD_ID`, `standalone` y
> `prerender-manifest`), y vacía su directorio desde el primer segundo aunque
> vaya bien. Reconstruir en sitio no arriesga servir algo viejo: arriesga **no
> servir nada**. Por eso se construye fuera (`NEXT_DIST_DIR`) y se promociona
> por rename sólo con `exit 0`.

### ✅ CMS-0b · Media en VOLUMEN PERSISTENTE del VPS (2026-07-30)

**Decidido: volumen persistente**, con el adaptador de **storage local** de
Payload. No se estrena S3.

**Lo que hay medido del tamaño:** el clon sirve hoy `public/` con **473 ficheros
y 37.4 MB**, de los que **452 ficheros y 36.1 MB son imágenes** — y eso son las
11 páginas construidas. ~~**SIN MEDIR:** cuánto suma el corpus entero~~

> ✅ **MEDIDO (2026-08-04, F2-2 bloque 2 — la captura, `corpus/INDICE.json`):**
> el corpus entero son **309 páginas · 100.2 MB de HTML crudo · 4.4 MB de
> cuerpo `post_content` · 1 819 URLs de media distintas** referenciadas
> (srcset expandido; la unidad del bloque 3). Por colección: entradas-blog
> 149 pág (48.3 MB html · 3.1 MB cuerpo) · términos 37 (12.6 · 1.2) ·
> documentos 23 (6.5 · **0.04** — fichas cortas con PDF, `post_content`
> presente en 23/23) · casos 57 (18.4) · faqs 19 (5.2) · productos 24 (9.2)
> — estas tres últimas son builder: sin `post_content`, y es forma, no fallo.
> **El orden de magnitud queda confirmado: decenas-a-cien MB, no GB** — el
> volumen persistente sigue siendo la escala correcta.

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

> ✅ **CENSADO 2026-08-04 sobre las 309 páginas del corpus congelado**
> (`npm run qa:media-srcset`, `medidas/media-srcset.json`, negativo **7/7**).
> **La entrada de la decisión de arriba tenía dos errores**, y los dos venían de
> mirar 14 instancias: uno de FORMA y otro de ALCANCE. Y por encima de los dos,
> un hallazgo que cambia lo que un juego de tamaños puede prometer.

#### El censo: 1 719 atributos · 4 318 candidatos · 519 imágenes ORIGEN

**Lo primero que hay que deshacer es una lectura, no un número.** Un `grep`
sobre `corpus/` devuelve anchos irregulares —1110 · 1156 · 1198 · 1238 · 1279 ·
1333 · 1338 · 1478…— y eso **parece** la firma de anchos POR IMAGEN, con lo que
la premisa del PLAN («image sizes replicando el `srcset`») sería falsa de raíz.
No lo es: **son dos poblaciones distintas y el grep las mezcla.**

| población | cuántos anchos | qué es |
|---|---|---|
| **variante generada** (`-WxH` en el nombre) | **13** | tamaños declarables |
| **sólo el original sin recortar** | **60** | la anchura NATIVA de esa imagen |

Los irregulares están **todos** en la segunda. Y las 1 819 URLs del INDICE son
**variantes**: detrás hay **519 imágenes origen** — el `srcset` multiplica.

#### Y no son anchos: son CAJAS

Las 13 anchuras se pliegan en **9 cajas**. `114` · `126` · `247` · `576` no son
tamaños exóticos: son la **salida** de las cajas 300 y 600 sobre imágenes en
retrato. Agrupar por ancho fabrica tamaños que no existen.

| caja | formas WxH | cuerpo | cascarón | forma |
|---|---|---|---|---|
| **w480** | 88 | 306 | 1 046 | escala (`width`) |
| **w980** | 87 | 277 | 679 | escala |
| **w1280** | 38 | 112 | 69 | escala |
| **w1024** | **10** | 13 | 46 | escala |
| **w300** | 5 | 6 | 1 | escala |
| **w768** | 2 | 1 | 1 | escala |
| caja300 | 3 | **0** | 311 | acotada |
| caja150 | 1 | **0** | 50 | acotada |
| caja600 | 2 | **0** | 16 | acotada · **RECORTA** |

**Los dos errores corregidos, con su evidencia:**

1. **`card` no es `1024×683`.** La caja de 1024 emite **10 formas distintas**
   (1024x682 · 1024x1024 · 1024x576 · 1024x683 · 1024x797…), o sea que
   **conserva la proporción**. `1024x683` era una de las diez. Y declararlo con
   los dos lados no es cosmético: **el `fit` por defecto de Payload es `cover`**,
   así que recortaba a 3:2 todo lo que entrara. Corregido a `width: 1024`;
2. **`cardWide 1080×675` no aparece NI UNA VEZ** en los 4 318 candidatos. Su
   evidencia es `lh-tarjetas`, o sea los LISTADOS, que no están en el corpus.
   Se conserva **con su procedencia escrita**, que es justo lo que le faltaba a
   `card`.

**Y el reparto CUERPO/CASCARÓN, que decide qué declarar:** 312 atributos del
cuerpo contra 1 407 del cascarón. Las tres cajas acotadas están a **0 en
cuerpo** — son del sello del pie, los avatares y las galerías del tema. Es la
lectura de `googletagmanager` en C-SP6 aplicada al media: **contarlos juntos
infla el contrato con tamaños que ningún contenido pide.** No se declaran, y
`caja600` además recorta (600x600 y 576x600 sobre originales de 0.75 y 0.5627):
si algún día entra, entra con `width`+`height`+`fit` declarados, no por omisión.

**Excepción nombrada:** 1 candidato de 4 318 cuyo descriptor no es el ancho del
fichero (`…-2048x1152.jpg 1920w`). A su cubo, fichado, fuera del reparto.

#### ⚠ EL HALLAZGO: el `srcset` NO es función de la imagen

**39 de los 519 orígenes se sirven con `srcset` DISTINTO según dónde se usen.**
Y la diferencia es sistemática: la lista de candidatos **se topa en el ancho que
la plantilla pidió** y **siempre incluye el fichero pedido**.

```
2025/07/aaqms.jpg    ×20  480w · 980w
                     × 1  480w · 980w · 1280w · 1800w (el original)
```

De donde el veredicto que gobierna todo lo demás:

> **Un juego FIJO de image sizes es NECESARIO y NO SUFICIENTE.** Genera **todos**
> los ficheros que el corpus usa —9 cajas, 0 formas sin explicar—. **No
> determina el atributo**: el `srcset` se compone en el punto de USO, con un
> dato —el ancho pedido— que **no está en la colección de media** y que hoy **no
> está modelado en ningún sitio**.

**Consecuencia para M-IMG, y es la que hay que leer antes de darla por cerrada:
M-IMG no se cierra declarando `imageSizes`.** Los tamaños son la mitad de
abajo; la mitad de arriba es una regla de render que necesita el ancho pedido.
Ver §6 M-IMG y `medidas/cmp-srcset.json`.

⚠ **Alcance del censo, declarado:** las **309 páginas del corpus** — grupo A
(blog · kunakpedia · documentos) + casos · faqs · productos. **NO incluye
sectores ni monográficos**, que están fuera del corpus por construcción… y son
exactamente la población donde M-IMG está medida.

#### ✅ El «ancho pedido» — FRONTERA CERRADA SIN AÑADIR NADA (2026-08-05)

El párrafo de arriba deja una incógnita explícita: *«un dato —el ancho pedido—
que hoy no está modelado en ningún sitio»*. Se leía como **una pieza que falta
por modelar**, con el precedente de `anchoPct` a mano —un valor de presentación
por punto de uso, medido y ya en el esquema— que empujaba a copiarlo.

**No hacía falta modelar nada, y la diferencia la decidió una medida.**
`npm run qa:media-hueco` (offline sobre `corpus/`, congelada en
`medidas/media-hueco.json`, **negativo 7/7**) aplicó los dos tests de
`CLAUDE.md` **después de identificar el régimen**, que es el orden que la propia
regla exige:

| régimen, derivado del `<body>` | páginas |
|---|---|
| **PLANTILLADO** (`et-tb-has-body`) | 209 — blog · kunakpedia · documentos |
| **BUILDER** (`et_pb_pagebuilder_layout`) | 24 — productos |
| **SIN MARCADOR** (plantilla clásica del tema, sin builder) | 76 — casos · faqs |

⚠ **El test A no se aplica, y se dice por qué:** su alcance declarado es el
**RITMO** (`margin`/`padding` de sección, fila y módulo). El ancho pedido no es
ritmo — es qué fichero se solicita —, así que aplicárselo daría la respuesta
invertida, que es exactamente lo que ese alcance advierte.

**El resultado, en la unidad que la sonda compara:**

| | |
|---|---|
| pares (hueco × origen) que varían **POR ENCIMA** del contenedor de contenido | **0 de 237** |
| grupos intra-página (test B) que varían por encima | **0 de 715** |
| excepciones — **todas POR DEBAJO** | **7**: 1 en `post_content`, 6 en módulo de texto del builder |
| `srcset`+`sizes`+`width`+`size-` que sobreviven **VERBATIM** a T1–T8 | **311/311** |

> **Por encima del contenedor de contenido, la caja pedida la fija el HUECO ⇒
> PLANTILLA. Por debajo, viaja DENTRO del campo rico, carácter a carácter ⇒
> CAMPO RICO. NO ENTRA NADA EN EL ESQUEMA.**

**Y por qué NO es un `anchoPct`, que era la analogía tentadora:** `anchoPct` es
campo porque **varía entre módulos hermanos de la misma página** (70 · 80 · 90 ·
100 % en la misma instancia). La caja pedida **no varía ni entre instancias del
mismo hueco**. Misma pregunta, dos respuestas, y las dos medidas.

⚠ **ALCANCE de la mitad «viaja verbatim»:** medida sobre `post_content`, que es
lo único que T1–T8 procesan hoy. Los **6 pares del módulo de texto del builder
quedan SIN esa medida** porque la extracción de builder no existe todavía. Se
dice, no se supone: el día que se escriba, `qa:media-hueco` tiene que volver a
salir verde.

⚠ **Dos defectos de la propia sonda, cazados por el dato y conservados como
sabotaje** — los dos daban un veredicto plausible y falso:

| defecto | qué hacía | sabotaje que lo reproduce |
|---|---|---|
| medir el **ancho renderizado** en vez de la caja | `large` es una CAJA y WordPress no amplía ⇒ el renderizado es `min(caja, ancho NATIVO)` y **mezcla dos poblaciones**. Sacaba «86 grupos del cascarón varían» ⇒ CAMPO | `ancho-en-px` |
| definir el contenedor de contenido **sólo** como `post_content` | deja al BUILDER **sin contenedor**, y el HTML que escribió una persona cuenta como cascarón. Sacaba 6 pares falsos | `sin-zona` |

El primero es **el mismo error que §1 de `media-srcset` ya tenía documentado**
—*«los anchos irregulares son la anchura NATIVA de cada imagen, no tamaños»*—
cometido un nivel más arriba. Los dos artefactos quedan con marcador `SONDA-`
(regla 7) para que no puedan leerse como medidas del sitio.

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
pagó en la tanda: `puppeteer-core` iba con `--no-save`, así que **cualquier
`npm install` lo podaba** — tras tocar dependencias había que rehacerlo antes de
correr sondas.

> ✅ **CERRADO DE RAÍZ en F2-1 bloque 1 (2026-08-03).** `puppeteer-core` es hoy
> `devDependency` del `package.json` de la **raíz** del monorepo —que **no es el
> artefacto**: `apps/web/package.json` no la lleva—, así que un `npm install`
> normal la instala. **El `--no-save` ya no aplica y volver a él reabre la
> trampa.**

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

### ✅ CMS-0f · DOS APPS EN MONOREPO, con la lectura por LOCAL API COMPARTIDA (2026-08-03)

**La última decisión abierta del esquema, y son dos piezas que van juntas:**
cómo se reparte el código (app única vs dos apps) **y por dónde lee el build**
(Local API por paquete compartido vs endpoint interno del CMS). Elegir la
primera sin la segunda era dejarla a medias — la propia tabla de costes de
`PLAN-FASE-2.md` §F2-1 lo tenía anotado.

> **Decidido: DOS APPS en el mismo monorepo** — el clon intacto + una app CMS
> (admin de Payload), **misma DB** — **y la lectura en build por LOCAL API,
> compartiendo la config y los tipos por un paquete del monorepo.** No hay HTTP
> en el camino de los datos: CMS-0 queda como está.

#### El criterio, escrito ANTES de la elección

Ninguna medida arbitra esto — no hay nada que medir: las dos opciones funcionan.
Cuando ninguna medida arbitra, **decide la asimetría de deshacer** (la misma
maquinaria de §1.5b Razón 3). Las dos direcciones, costadas:

| dirección | qué cuesta |
|---|---|
| **de app ÚNICA a dos** (separar después) | **desenredar el artefacto verificado**: extraer config, rutas `/admin`+`/api` y dependencias de un `package.json` y un `next.config` ya entrelazados. Cada paso de la extracción toca la app que sirve las rutas a Δ0 ⇒ **re-aceptación completa a umbral cero** — y sobre el manifest de ese momento, que tras el grupo A son ~220 rutas, no 31. Y ocurre **en el momento caro por construcción**: la razón para separar sería que el churn de subidas de Payload ya duele, o sea **después** de F2-3, con editores dentro y contenido escrito |
| **de DOS apps a una** (colapsar después) | las piezas del CMS ya están **aisladas por construcción** (app propia + paquete compartido): colapsar es montar las rutas del admin en la app de render y fusionar dependencias. **Mecánico, en un momento elegido**, una sola corrida de re-aceptación, invisible para los editores, sin mover datos ni esquema (misma DB, mismo paquete de config) |

> **Enredar→desenredar es caro y llega forzado en el peor momento;
> aislado→fusionar es mecánico y electivo. Esa asimetría toma la decisión** —
> coincide con la recomendación del evaluador independiente, pero lo que decide
> es el criterio, no la recomendación.

#### Lo que la decisión protege, que es el activo del proyecto

**31 rutas a Δ0 con línea base congelada, y la aceptación de F2-3 a umbral CERO
sobre todo el `prerender-manifest`** (§8). La vara de qué cuesta re-verificar ya
está medida: **CMS-0d pagó el protocolo completo por un parche de Next** —
línea base antes, matar por puerto, `.next` borrado, marcador de frescura,
umbral cero a dos anchos.

- **Con app única**, cada release de Payload aterriza en el `package.json` y el
  `next.config` (`withPayload`) de la app de render ⇒ por el propio estándar del
  proyecto, **cada release fuerza el protocolo completo**. Y el riesgo mayor no
  es el coste: es la presión de saltárselo («este parche seguro que no toca
  nada»), que es exactamente cómo se fabrica un verde falso.
- **Con dos apps**, el churn del admin se queda en la app CMS. Los insumos de la
  app de render cambian **solo** cuando cambia el paquete compartido o su
  dependencia de build de Payload — un evento **elegido y agrupable**, no
  forzado por cada parche, y acotable por diff de lockfile y config: si los
  insumos no cambiaron, el artefacto no cambió.

#### La frontera de la lectura: LOCAL API COMPARTIDA, no endpoint — y por qué

1. **CMS-0 ya lo decidió**: *«`generateStaticParams()` y las páginas leen de la
   DB sin HTTP — el SSG actual se conserva»*. El endpoint interno **reabriría
   una decisión cerrada**; el paquete compartido la conserva en el mundo de dos
   apps. La Local API no es un servidor: es una biblioteca que habla con
   Postgres, y funciona desde cualquier proceso con acceso a la DB.
2. **Un endpoint convierte una dependencia de biblioteca en una de SERVICIO en
   build**: el build del clon fallaría con la app CMS caída, y mete HTTP —red,
   reintentos, orden— justo donde la aceptación exige **salida determinista**
   (CMS-0c, consecuencia 3: dos cargas, el mismo número al céntimo).
3. **El paquete compartido no es un sobrecoste del Local API: hace falta en las
   dos variantes.** Con endpoint también habría que compartir
   `payload-types.ts` para que el clon compile tipado — el endpoint no ahorra el
   paquete, solo añade HTTP encima.

**El contrato de la frontera, para que F2-1 no lo difumine:** el paquete
compartido contiene **la config de colecciones, los tipos generados y los
defaults — nada de componentes de admin**. La app de render gana `payload` y el
adaptador de Postgres como dependencias **de build** (CMS-0c: la DB es
dependencia del build, no del runtime) y **no emite jamás rutas `/admin` ni
`/api`**.

**Y el acoplamiento que QUEDA, dicho para que no se descubra como sorpresa:**
las dos apps comparten la versión de núcleo de Payload **a través del paquete y
del esquema de la DB** — una subida del núcleo en el paquete compartido toca el
build del clon y **paga el protocolo completo**. Dos apps no compra inmunidad:
compra que ese pago sea **un evento elegido y por lotes** en vez de uno forzado
por cada parche del admin.

#### Lo que se descarta, con su porqué

| descartado | por qué |
|---|---|
| **app única** | es la letra de CMS-0 («embebido») y un solo deploy — pero convierte cada release de Payload en una re-aceptación completa del artefacto, o en la erosión del estándar que la evita. La letra de CMS-0 se **revisa** (tabla de plataforma, anotada); la intención —self-hosted, sin headless SaaS externo, lectura sin HTTP, SSG conservado— **se conserva entera** |
| **endpoint interno del CMS** | reabre CMS-0, mete una dependencia de servicio y HTTP en el build, y no ahorra el paquete compartido |

#### La restricción que hereda F2-1 (la conversión a monorepo)

> **La conversión no mueve los ficheros del artefacto verificado en silencio.**
> Si el layout elegido toca la app de render —aunque sea una línea de
> `workspaces` en su `package.json`— **paga UNA corrida de re-aceptación Δ0
> contra la línea base congelada ANTES de cualquier otro cambio**, con el
> protocolo de CMS-0d. La mecánica del layout (raíz-como-app vs `apps/`) es la
> primera tarea de F2-1, **bajo esa restricción** — no se decide aquí porque no
> cambia el modelo ni la frontera.

#### Qué tendría que pasar para revisarla

1. **La frontera** cae a endpoint interno **solo si** la Local API compartida
   resulta inviable entre dos apps con versiones acopladas por el paquete
   (p. ej. la config deja de poder cargarse desde dos procesos). Eso revisaría
   **la frontera, no la decisión de dos apps**.
2. **La decisión** se colapsa a app única si operar dos apps en el VPS cuesta
   más de lo que evita — **contado en corridas de re-aceptación forzadas**, un
   número y no una impresión. El colapso es la dirección barata por
   construcción: poder pagarlo es exactamente lo que esta decisión compra.

#### ✅ CONSTRUIDA (2026-08-03, F2-1 bloque 2) — y la frontera aguantó

Payload **3.87.0** (peer `next >=16.2.6 <17`, que CMS-0d ya había dejado
satisfecho con 16.2.12) sirviendo `/admin` con **HTTP 200** contra Postgres 17
local. El reparto quedó así, y **`apps/web` no se tocó: `git diff HEAD --
apps/web` vacío**, ni un fichero nuevo.

| en `packages/cms-config` | en `apps/cms` |
|---|---|
| `campos/` · `bloques/` · `colecciones/` · `colecciones.ts` · `payload.config.ts` · `payload-types.ts` · `defaults.ts` | el andamio de `@payloadcms/next` (admin, `/api`, graphql), `next.config.mjs` con `withPayload`, y una config de **13 líneas** |

**Lo que la frontera obligó a repartir, y no era obvio:** `sharp` se queda en
`apps/cms` **aunque los `imageSizes` vivan en el paquete compartido** (CMS-0b).
El binario sólo hace falta para **subir** medios y la app de render no sube nada
—leerá por Local API—: meterlo en el paquete le colgaría un binario nativo al
build del artefacto verificado a cambio de nada.

**Y una colección que hay que declarar como lo que es: `usuarios`.** Payload
exige **una** colección con `auth: true`. No tiene lado medido y **no puede
tenerlo** —el original es WordPress y sus usuarios no son contenido del sitio—,
así que `qa:cms-campos` la lista entre las «colecciones SIN lado medido» junto a
`media` y `articulos-kb` en vez de dejarla pasar como si estuviera verificada.
Vive en el paquete compartido y no en `apps/cms` porque **es esquema de la base
de datos**, que las dos apps comparten — no un componente de admin, que es lo que
el acta prohíbe cruzar. Roles y control de acceso son **F2-5**: aquí está el
mínimo para que el admin arranque y nada más.

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
| `soluciones` | **`relationTo: 'productos'`** — la colección cerrada en **§2e** (2026-08-03), filtrable por su `tipo`. No texto, y **no polimórfica**: el CPT `solutions` resultó ser **una** colección |
| `proyectos`, `articulos` | **relación** a casos y entradas (ver §3) |
| `ctaSlides` | **array** |
| **`anchoPct`** (nivel de MÓDULO) | **campo numérico con defecto `100`**, omitido cuando coincide. **Medido 2026-08-03**: `80 · 90 · 100` en las 4 instancias, a 1440 y a 390 — ver §6c.1. Es **el mismo campo** que `MonoModuloBase.anchoPct` de §1.5, en una segunda colección |

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

### ⚠ 1.5c · Lo que la TRADUCCIÓN a Payload descubrió del patrón (2026-08-03, F2-1 bloque 2)

**(a) «Omitido cuando coincide» NO es gratis en Payload, y creerlo gratis rompe
el patrón en silencio.**

`defaultValue` hace **la primera mitad** —rellenar al dar de alta— y sólo esa.
Con `defaultValue` a secas **el valor se escribe en la fila**, y a partir de ahí
el dato ya no distingue *«el editor eligió esto»* de *«nadie tocó nada»*: las dos
instancias guardan `"seccion"`. La segunda mitad del patrón es un hook
`beforeChange` **por campo** que devuelve `null` cuando el valor entrante coincide
con el defecto.

> **Está implementado en `conDefecto` (`packages/cms-config/src/campos/comunes.ts`)
> y las dos mitades van juntas por construcción**, precisamente para que no pase
> lo de siempre: escribir el `defaultValue`, dar el patrón por aplicado, y que
> «omitido cuando coincide» quede como una frase de este documento que ningún
> código ejecuta (*documentado no es conectado*, `CLAUDE.md` §sondas regla 3).

Y su corolario, que además es una comprobación del modelo: **`conDefecto` TIRA si
el campo es `required`.** Un defecto que no se puede omitir no distingue nada —
o el campo es opcional, o el valor es **plantilla** y no es un campo.

**(b) `MonoInline` — elegida la primera de las dos formas que §1.5 autoriza.**

§1.5 dice *«texto rico acotado a negrita, **o** un array tipado»*. Se elige
**texto rico acotado a negrita** (`editorNegrita`: párrafo + negrita, nada más).
La razón es la misma que hizo existir el tipo: son **56 `<strong>` a mitad de
frase**, y lo que importa es dónde envuelve el texto. Un array de trozos obliga a
quien edita a **partir la frase a mano** para poner una negrita; el editor rico
lo hace seleccionando. **No es una decisión nueva** — es una de las dos que este
documento ya había autorizado, y se registra para que no se relea como abierta.

**(c) Y un hueco que va del ESQUEMA al CÓDIGO, no al revés.** `anchoPct` entra en
SECTOR por §6c.1 y está en las colecciones; **`SectorBloqueBase` de
`apps/web/src/lib/sectores.ts` sólo declara `flujo`**. La dirección importa: no es
un campo medido que se cayó en la traducción —eso lo cazaría `qa:cms-campos`—
sino un campo **decidido** que el clon todavía no consume. Se cierra al poblar,
no aquí.

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

> ✅ **CONFIRMADO EN EL PIE Y CON SU DENOMINADOR (2026-08-20, 85.ª tanda) — y el
> resultado es que NO ENTRA NINGÚN CAMPO.**
>
> `qa:pie-cmp` descompone el pie en sus secciones (`footer-links` ·
> `footer-legal` · `footer-background` · CTA) en los dos lados. Aplicados los dos
> tests:
>
> | test | resultado |
> |---|---|
> | **B · varianza intra-página** | el pie **no varía dentro de una página**: hay uno |
> | **varianza entre INSTANCIAS de la misma forma** | **CERO** — n = 36 en `L1-etiqueta`, 8 en `L1-blog`, 8 en `L2-glosario` |
> | varianza entre **FORMAS** | **cuatro valores** (`L1/L4` · `L5` · `L3` · `L2`) |
>
> Es exactamente el patrón del **régimen plantillado** (§*lo que varía entre
> FORMAS distingue plantillas, no campos*): **el pie es plantilla DE LA FORMA**,
> no un campo de la instancia. **El esquema no cambia.**
>
> **Y la consecuencia es de código, no de modelo:** hoy el `Footer` del clon
> distingue **una** variante (`tipo="caso"`, que añade la 4.ª sección) donde el
> original sirve **cuatro pies**. Eso no es un campo que falte: es una
> **plantilla que falta**, y su coste está medido —`L3-sci` a **−86.34 @1440** y
> **−289.64 @390**— en `PENDIENTES-QA.md` §F3-LH-PIE-UNO-CONTRA-CUATRO.
>
> ⚠⚠ **CORREGIDO EL MISMO DÍA (86.ª tanda): no son cuatro pies, y el esquema
> sigue sin cambiar — pero por una razón MÁS FUERTE.**
>
> Descompuesto por sección, el pie del original son **TRES PIELES × una sección
> CTA ortogonal**, y las pieles son **dos ejes binarios**: el ancho de la FILA
> (1238.39 = 86 % contra 1152 = 80 %) y el `padding` de sección. `L5-casos` no
> era una cuarta familia: es **piel A + CTA**, y con la CTA fuera su `n` pasa de
> **1 a 64**.
>
> **Eso refuerza la conclusión en vez de matizarla:** el pie no sólo es
> plantilla —es plantilla **derivable de una propiedad que la página ya tiene**,
> su ancho de fila. `L3-sci` sirve su cuerpo al 80 % y su pie al 80 %; `L1` los
> dos al 86 %. **No hay un campo «piel de pie»: hay una consecuencia del ancho
> de fila**, y modelarla como campo habría sido inventar un eje que el original
> no tiene. Arreglado en `DE_TIPO` (86.ª): `L3-sci` a **+1.00 / +2.06**.
>
> ⚠⚠ **AMPLIADO 2026-08-20 (87.ª tanda): hay un TERCER eje, y NO se deriva del
> ancho de fila — pero tampoco es un campo del CMS.**
>
> Los dos ejes de arriba explican `footer-links` y el `padding` de sección. **No
> explican `footer-legal`**, que entre las pieles B y C —que comparten fila,
> 1152— difiere **+67.00 a los dos anchos**. Descompuesto (`qa:pie-legal`), el
> residuo vive **entero en la columna de iconos**: `col0` (widget legal) y `col2`
> (menú de idioma) están a **Δ0 en las tres pieles y a los dos anchos**.
>
> **El tercer eje es el CUERPO del icono: 96 px en la piel B, 25 px en A y C.**
> Y no es un ajuste editorial: **96 px es el DEFECTO del módulo de icono de
> Divi** (`.et-pb-icon{…font-size:96px;line-height:1}`, servido en línea en las
> tres capturas). O sea que la piel B **no elige 96: se queda sin el override de
> 25**, que las otras dos sí reciben.
>
> **Discriminador, derivado y con denominador:** el **contexto de caché** de la
> hoja dinámica del theme builder cae **1:1 con la piel en 145 páginas** —
> `archive/` en las 12 de B, en ninguna de las 133 restantes. **Control:** dentro
> de la piel A hay 37 páginas que traen el override en línea y 63 que lo enlazan,
> y **las dos miden 25px** ⇒ «enlazarlo» no es el eje.
>
> ### Y la consecuencia para el ESQUEMA, que es la que importa
>
> **Sigue sin haber un campo «piel de pie», y ahora por una razón más precisa: lo
> que cambia no es una decisión editorial, es un ARTEFACTO DE COMPILACIÓN del
> tema.** Nadie lo escribió en el builder; nadie puede editarlo desde el admin;
> no varía entre instancias de la misma forma (varianza cero en las 12). Es
> **plantilla**, y de la clase más rígida: una propiedad del *pipeline de CSS*
> del origen, no del contenido.
>
> **Para el clon, por tanto, es una tercera dimensión de la presentación del pie
> —`iconoPx: 96 | 25`— derivada del mismo `DE_TIPO` que ya elige las otras dos.**
> No añade campo, no añade colección y no llega al editor.
>
> ⚠ **Y una nota de fidelidad que conviene dejar escrita:** es muy probable que
> el 96 sea **un defecto del original** (una caché de Divi que no regeneró el
> override). **Se replica igual** — regla 1 del proyecto, *los textos van
> verbatim, erratas incluidas*, y aquí lo mismo vale para la geometría. Lo que
> **no** se hace es corregirlo por criterio propio. Si el original lo arregla
> algún día, el clon lo verá como un Δ y lo adjudicará entonces.
>
> **Lo que queda sin leer, con su cardinal:** el TEXTO de la regla. Lo dirime
> **UNA** hoja (`et-cache/archive/et-divi-dynamic-tb-140-tb-342.css`), no
> capturada — 0 de 505 (§F3-1-CSS-NO-CAPTURADO). **No bloquea construir**: el
> *cuánto* está medido con varianza cero en 12 instancias.


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
| `soluciones` | **relación 0..n, `relationTo: 'productos'`** — la colección cerrada en **§2e** (2026-08-03), la misma que apunta §1.4. Probado que la ficha es proyección del producto: 640 nodos de panel, **18 fichas, 17 títulos** en todo el corpus |
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
| `etiquetas` | `post_tag` | 12 | `nombre` · `slug` · **`descripcion?` (rico)** |
| `categoriasRecursos` | `resources`, **jerárquica** | 10 (2 padres + 8 hijas) | `nombre` · `slug` · `padre?` |
| `categoriasCientificas` | `scientific-category` | 3 | `nombre` · `slug` |
| `categorias` | `category` | ✅ **CENSADA 2026-08-25 (108.ª): 6 TÉRMINOS · 27 RUTAS** | modelo aún **sin decidir** — el censo ya no bloquea |

> ✅ **EL CENSO DE LAS TRES FAMILIAS DE F3-4 ESTÁ HECHO (108.ª), offline y sin
> abrir el original** — `docs/research/cola-larga/derivaciones/censo-f34.{mjs,log}`.
> **Lo que falta es la DECISIÓN, que es del propietario.**
>
> | familia | TÉRMINOS | RUTAS | régimen | tarjetas | cuerpo (bytes) |
> |---|---|---|---|---|---|
> | `categorias` (`category`) | **6** *(4 términos + 2 formas acentuadas)* | **27** | `-T` | 2–9 | 7 650–21 405 |
> | `author` | **6** | **34** | **`--`** | 0–6 | 1 469–12 978 |
> | taxonomía `sector` | **11** | **13** | `-T` | **0** | 3 346–3 361 |
>
> **Las dos unidades se escriben las dos**: `author` = 6 TÉRMINOS **y** 34 RUTAS
> — la diferencia es la paginación de un solo término.
>
> **Y esto CONFIRMA el «sin `autor`» de abajo, con el barrido por forma**: el
> autor no aparece en **0 de 35** formas de listado. Lo que la nota de abajo dice
> como *«0/9 formas»* hoy se puede escribir **0 de 35**, misma conclusión y mejor
> denominador.
>
> ⚠ **Y lo que el censo CAMBIA para `sector`:** la taxonomía **no lista nada** —0
> tarjetas en 6 de 6 capturados, cuerpo de ~3.3 KB de miga + barra lateral—, así
> que la decisión son **DOS separables**: la **RELACIÓN** `caso → sector` (con
> consumidor medido: el filtro de 12 botones de `casos-de-exito`, la única de las
> 35 formas que enlaza a `/sector/`) y el **ARCHIVO** `/es/sector/*` (sin
> consumidor y sin contenido). Se puede modelar la primera sin emitir el segundo.

**El contrato de nacimiento del grupo A** (D3 — lo caro de re-migrar si
falta): `fechaPublicacion` · `imagenDestacada` opcional con sizes
**1080×675 · 1024×683 · 980 · 480** (amarra CMS-0b/M-IMG) · `extracto`
opcional con **derivación por defecto** (~267c del arranque + «…»; LH-SP10
decide si alguno es manual) · **relaciones a las TRES taxonomías** · y **sin
`autor`**: no lo exige ningún listado (0/9 formas, 0 URLs de author en `/es`).

### 2c.2 · `etiquetas.descripcion` — CAMPO NUEVO, y `extracto` deja de ser una incógnita (2026-08-13)

**Los dos campos que faltaban viven en EL LISTADO, no en la ficha del
documento** — por eso ningún extractor anterior los tenía: leen la página del
documento, y esto es otra plantilla. Instrumentos: `cms:extractor-listados`
(negativo 3/3) · `cms:seed-listados` · migración
`20260813_211316_f3_etiqueta_descripcion`.

**(a) `etiquetas.descripcion` — nuevo, rico, opcional.**

| | |
|---|---|
| dónde vive | módulo `et_pb_text_4_tb_body` de `/es/etiqueta/<slug>/`, bajo el `h1`, a **941.17** de ancho contra los 1238.39 de la fila |
| por qué es campo | **varía entre instancias** — el test más simple que hay. Extraído en **12 de 12** |
| por qué es RICO | **medido, no supuesto**: el marcado que traen las 12 es `p` · `br` · `a`. Guardarlo plano tiraría enlaces y saltos |
| por qué NO es `required` | las 12 la traen, pero un término **sin** descripción es un camino de render que ningún dato de calibración ejercita (§F2-5-ESCALON-ETIQUETAS). Obligarlo hoy rompería el alta de un término nuevo por una regla que ninguna instancia ha probado |

**(b) `extracto` — LH-SP10 cerrada: es campo en una variante y DERIVADO en la
otra.** Medido cruzando los dos listados donde el mismo post sale con las dos
pieles (63 posts: 0 idénticos · 48 prefijo · **15 distintos**):

> · **`/blog`** (loop del tema) usa el extracto **MANUAL** donde existe —los 15,
>   de 86–102 c— y el automático si no ⇒ **CAMPO**, y se siembra;
> · **`/etiqueta/*`** (módulo `et_pb_blog`) **ignora el manual** y trunca el
>   contenido a 256–271 c + «...» ⇒ **DERIVADO**, y **no se guarda**.

⚠ **Guardar los dos habría sido lo cómodo y es el error caro:** produciría dos
campos donde el original tiene uno y una regla, y el día que un cuerpo cambiara
el extracto cableado se quedaría atrás **sin que nada fallara**. La spec vieja
decía *«derivación por defecto (~267c + «…»)»* — correcta para `/etiqueta`,
**falsa para `/blog`**, y la diferencia sólo se ve cruzando las dos.

**Estado de la siembra, con sus dos direcciones:** `descripcion` **12/12** ·
`extracto` **66 de 68**. Los 2 que faltan (`descarga-catalogo-kunak` ·
`kunak-obtiene-el-sello-reconcilia`) **no son un fallo del seed**: sus documentos
no están en `corpus/entradas-blog` (149 ficheros, y el clon tiene 149) ⇒ es un
hueco de **CAPTURA**, fichado en §F3-LH-DOS-CONJUNTOS-DE-149.

> ✅ **CONSUMIDOS 2026-08-13 (66.ª tanda): los dos campos se pintan, y `extracto`
> entra en el TIPO medido.** `EntradaBlog` lo declaraba la colección desde F2-1 y
> **no** `types/kunak.ts`, con la razón escrita al lado —*«el clon no pinta
> listados todavía»*—. Los pinta desde hoy, así que el hueco se cierra: `extracto?:
> string` en `EntradaBlog` y **`EtiquetaA`** nuevo (`TerminoA` + `descripcion`).
>
> `EtiquetaA` va **aparte y no ensancha `TerminoA`**, y no es cosmético: la
> descripción no es propiedad del término *citado desde una tarjeta*, es lo que
> sirve la plantilla del ARCHIVO. Ensanchar `TerminoA` haría que las 149 entradas
> arrastraran un campo que su tarjeta no usa.
>
> ⚠ **Y la derivación de `/etiqueta` tiene DOS correcciones que sólo aparecen al
> renderizar** (§F3-LH-CIERRE-66):
>
> 1. **el cuerpo del clon está RENDERIZADO y el del original no.** El original
>    construye el extracto sobre `post_content` **crudo** con `strip_shortcodes`;
>    el clon se sembró de la captura, donde esos shortcodes están **expandidos**.
>    Resultado medido: el extracto se comía la definición entera del glosario
>    (`<span class="tooltip-content">`). Se quita **nombrando el marcador
>    servido**, no adivinando una longitud;
> 2. **el tope NO es 270**: ajustado contra las 6 tarjetas con cuerpo, **268 y
>    269 dan 6/6** y ninguna longitud en bytes pasa de 5/6. Se elige 269 y **se
>    declara que n = 6 no separa 268 de 269**.

### ✅ 2c.2b · `extracto` de `L3` — LA UNIDAD ES **BYTES**, Y EL MODELO DE CARACTERES QUEDA REFUTADO (2026-08-18, 78.ª tanda)

`§2c.2(b)` cerró el extracto de `/blog` y `/etiqueta/*`. **`L3`
(`scientific-docs`) es un TERCER mecanismo**, y se cierra aquí con medida.
Instrumento: `qa:lh-extracto-unidad` (negativo **4/4**), congelada
`medidas/lh-extracto-unidad.json`. Derivación **sobre disco**: sin red y sin
tocar el original.

| | contrato |
|---|---|
| **derivación** | `substr(textoPlano(cuerpo), 0, 100)` **en BYTES** + `"..."` ⇒ **DERIVADO**, no se guarda |
| **el tope** | **100 bytes**, y es el ÚNICO que acierta — barrido 80…130, **0 topes indistinguibles** |
| **el momento** | **ANTES de decodificar las entidades**: el corte se aplica al HTML crudo, donde `&amp;` ocupa **5 bytes** |
| **el texto** | `strip_tags` **sin** poner nada en su sitio (`H<sub>2</sub>S` → `H2S`), espacios colapsados |
| **el terminador** | `"..."` ASCII, **23/23**. No se ha visto un solo `…` (hellip) en este arquetipo |

**Se ELIGE, no se acierta** (§*un modelo se elige por lo que lo SEPARA de su
alternativa*): `bytes-crudo` da **23/23** y se separa de sus rivales en **27
instancias**. Y el rival **no empata: queda REFUTADO** —

> **Una COTA (`≤ N`) y una REGLA GENERADORA (`corta a N`) no son la misma
> afirmación, y ahí estaba la indeterminación de la 77.ª.** Las dos cotas
> —`chars ≤ 99` y `bytes ≤ 100`— aciertan las 23 y **0 separadoras**. Las dos
> **reglas** no empatan: una regla generadora predice la longitud **EXACTA**, y
> el dato tiene `bytes {100: 23}` —constante— contra `chars {97:4, 98:9,
> 99:10}` —tres valores—. `chars` cae a **10/23** en su mejor tope.

⚠ **Y apareció un SEGUNDO EJE que la ficha bancada no tenía, y lo trajo el
dato**: `crudo` contra `deco`. Con las entidades decodificadas los bytes salen
`{100: 22, **96: 1}`, y esa única instancia —`informe-de-co-ubicacion-en-glasgow-kerbside-kunak-air-pro`,
la única con un `&amp;`— es **la separadora entera de ese eje**. Un dominio sin
un solo `&` no habría podido verlo: se declara con su **n = 1**.

> ⚠⚠ **NO SE GENERALIZA A LOS OTROS DOS MECANISMOS, y el dato lo prohíbe.**
> `/etiqueta/*` midió lo **contrario** en §2c.2(b): *«268 y 269 dan 6/6 y ninguna
> longitud en bytes pasa de 5/6»* — allí gana **caracteres**. Son piezas
> distintas —módulo `et_pb_blog` de Divi contra plantilla del tema hijo— y **la
> unidad es propiedad de la pieza, no del sitio**. Tres mecanismos, tres
> contratos.

**Lo que esta medida NO contesta**, y va escrito porque el fichero no puede
decirlo (§*antes de construir sobre una medida, escribe qué preguntas NO
contesta*): **qué pasa cuando el cuerpo es MÁS CORTO que el tope**. Lo ejercitan
**0 de 23** tarjetas ⇒ **SIN PROBAR**, no «soportado». Es §F2-5-ESCALON-ETIQUETAS
otra vez: un camino de render que el dato de calibración no estrena.

### ✅ 2c.2c · `L5` NO lleva extracto en su tarjeta — y su `null` era DATO (2026-08-18, 78.ª tanda)

Medido sobre las **114** instancias del corpus (`qa:lh-selectores`), la tarjeta
del índice de casos es exactamente:

> imagen (`a.case-imagen`, fondo CSS y **sin `<img>`**) · **sector** ·
> **ubicación** · **cliente** · título (`h3.case-title`). **Y nada más.**

**Consecuencia para el content type:** el listado de `casos` **no consume ningún
campo de extracto**, así que no hay que derivar uno ni guardarlo. Lo que sí
consume, y ya estaba en el modelo, es `sector` y `ubicacion` — con la salvedad de
que **el filtrado** por sector se decide en F3-4 (§LH-C6-FILTRO-L5).

> ⚠ **Y por qué esto merece una entrada en vez de una línea:** el `extracto:
> null` de `L5` en el espejo es **exactamente el mismo valor** que el de `L3`, y
> uno era dato y el otro un defecto del instrumento. **Sin medir los dos, un
> `null` no distingue «no hay» de «no miré»** — que es la regla del cero
> aplicada a un campo del esquema. `recursos/articulos` está en el mismo caso:
> imagen + título + categorías + fecha, **sin extracto**.

**Arquetipos**: LISTADO-B (23 instancias, **una plantilla con tres variantes
de tarjeta** — config uniforme al 100 % dentro de cada familia) ·
LISTADO-TEMA-CPT (2) · LISTADO-TEMA-TAX (3, separado **con reapertura
escrita**). Los 6 hubs de builder **no estrenan arquetipo** (cola larga /
hipótesis grupo D), y `/es/casos-de-exito/` es una **página índice** sobre la
colección `casos`: lista las 57, ambos prefijos, **sin paginar** (fidelidad).

### ✅ 2c.3 · `categoriasRecursos.padre` — DECIDIDO: se puebla, y la RUTA se deriva de él (2026-08-14, `D2.8`)

`§2c` declaró el campo y lo dejó sin contrato: *«jerárquica, 10 (2 padres + 8
hijas)»* sin decir **quién compone la ruta**. Esta tanda lo cierra con medida.
Acta: `listados-hubs/DECISIONES.md` §`D2.8`; evidencia
`medidas/lh-jerarquia.json` (`qa:lh-jerarquia`, negativo 4/4).

| | contrato |
|---|---|
| **`padre`** | `relationship` a sí misma, **opcional**. Poblado en **8 de 10**; `null` en los 2 de primer nivel (`articulos` · `seminarios-web`). El `null` es un valor **medido**, no un defecto de siembra |
| **la RUTA** | **PLANTILLA, no campo**: `ruta(t) = /recursos/ + [padre.slug si lo hay] + t.slug`. Acierta **35/35** sobre las URL medidas, y **2 términos de primer nivel SEPARAN** este modelo del de cablear el prefijo |
| **cardinalidad** | **un padre como mucho** — `relationship` sin `hasMany`, y el original produce **0** términos con dos padres en 35 |
| **profundidad** | el original produce **2**; el esquema admite **más**, y eso se declara **SIN EJERCITAR** (§F2-5-ESCALON-ETIQUETAS). No se prohíbe |
| **el archivo del padre** | **es la unión de sus descendientes**, sin entradas propias — 80 tarjetas y 80 en la unión de las 8 hijas, **diferencia simétrica 0 por los dos lados** |

> ✅ **EJERCITADO Y SEMBRADO el 2026-08-14 (68.ª tanda).** El contrato de arriba
> deja de ser papel: **10 filas · `padre` en 8/8 · 0 relaciones sin destino ·
> 0 filas que el corpus no traiga**, round-trip **349/349**, y las **4 formas**
> de `L1-resources` emitidas y comparadas contra el original vivo.
>
> **Y el hueco de dato no era de esfuerzo, era DE CANAL**, que es lo reutilizable
> para cualquier taxonomía futura: `seed.mjs` declara `categorias-recursos`
> **TAXONOMÍA DERIVADA** (dedupe de `entradas-blog.recurso`), y una taxonomía
> derivada de sus miembros **no puede ver** (a) un término que ninguna entrada
> referencia —`articulos` sólo existe como PADRE— ni (b) el `padre`, que no viaja
> en el `{slug, nombre}` embebido. Las dos las declara **el ARCHIVO del término**,
> y por eso salen de `cms:extractor-listados` y no del extractor de documentos.
>
> `padre` **vuelve como SLUG**, no como objeto: no declara
> `custom.formaMedida = "objeto"` porque la tarjeta nunca lo pinta embebido —
> sólo lo necesita para componer una ruta.
>
> ⚠ **Y `descripcion` NO existe en esta taxonomía, con su denominador:** en
> `etiquetas` el módulo homólogo del archivo (`et_pb_text_4_tb_body`) trae texto;
> en `resources` el suyo (`_2_`) trae **los CHIPS de filtro**, y el texto que
> queda al quitarlos es vacío en **0 de 10**.

**Y lo que NO se añade, que es la mitad de la decisión:** **cero campos nuevos**.
Un `prefijo`/`ruta` por término sería una **segunda fuente de verdad** —en 10 de
10 la ruta es derivable de `padre` + `slug`—, y el repo ya tiene escrito el
precedente contrario en `productos.pagina`.

> **La corrección de método que arrastra, y vale para cualquier taxonomía
> futura:** *«el dato no separa las dos lecturas»* era cierto **del canal de las
> tarjetas** y falso del documento. `/es/recursos/articulos/` sirve `<body
> class="archive tax-resources term-articulos term-379">` y sus tres hermanos
> bajo `/recursos/` sirven `page-child`. **Antes de declarar que un
> discriminador no existe, hay que decir qué canales se miraron.**

**Cruce de la dirección contraria, que ninguna tanda anterior había hecho:**
`padre` está declarado en **1 de 4** colecciones de taxonomía y es exactamente
la única que el original hace jerárquica —`etiquetas` (12), `categoriasCientificas`
(3), `categorias` (4) son planas—. **0 celdas sobre-generalizadas.**

### ⚠ 2c.0 · Lo que la variante de `LISTADO-B` incluye ADEMÁS de la tarjeta (2026-08-11)

**`D1` queda ACOTADA**, no contradicha (acta: `listados-hubs/DECISIONES.md`
§*D1 queda ACOTADA*; evidencia `medidas/lh-barra.json`, 149 documentos):

> La variante de `LISTADO-B` no es sólo la **configuración de tarjeta**: es
> además la **retícula del cuerpo con su barra lateral**.

| variante | fila del listado | columna de contenido @1440 | barra lateral |
|---|---|---|---|
| `blog` · `etiqueta` | **`3_4 + 1_4`** | **911.75** | **sí** — 80/80 |
| `resources` | **`4_4`** | **1238.39** | **no** — 0/37 |

**La barra es CONTENIDO DE PLANTILLA de la variante, no campos.** Cuatro
widgets con **una sola firma en los 80**: buscador · uno de texto vacío · la
lista «Categorías» · el CTA de newsletter.

> ✅ **Y desde la 89.ª tanda (2026-08-21) está VERIFICADA DE DOS LADOS, no sólo
> censada.** Hasta ahí la barra tenía su **marcado** medido (`lh-barra`, un
> lado) y **ni un píxel** de su presentación: `qa:barra-cmp` la compara widget a
> widget contra el original y da **Δ0 en las tres formas que la sirven** —`L1`
> blog y etiqueta, `L2` glosario— **a 1440 y a 390**, 918 caminos por ancho.
>
> **Por qué esto es de ESQUEMA y no sólo de QA:** si la barra es plantilla, su
> **CSS es parte del contrato de la plantilla**, no un detalle de maquetación
> del clon. Un CMS que renderice `LISTADO-B` tiene que emitir esta barra con
> esta caja, y hasta hoy nadie había comprobado que la caja del clon fuera la del
> original — lo era en el marcado y **no en la presentación**: `−82.80` en `L1` y
> `−75.80` en `L2`, por cinco causas de cascada (`PENDIENTES-QA.md`
> §F3-LH-BARRA-CASCADA).
>
> ⚠ **Y lo que sigue sin ser contrato: el buscador.** `SP-B4` mide la caja y
> **no la interacción** — qué hace el formulario al enviarse sigue **SIN
> MEDIR**, así que el content type no puede prometerlo todavía.

> ✅ **Y `D3` queda CONFIRMADA: su condición de reapertura se comprobó y NO se
> cumple.** El widget «Categorías» **no consume la taxonomía**: es
> `et_pb_widget_area`/`widget_text` en 80/80 —no el nativo `widget_categories`—,
> con **un solo contenido**, y **no cubre 5 de los 7** términos que el propio
> sitio ejerce (`articulos` 240 · `articulos-cientificos-y-estudios` 42 ·
> `evaluaciones-independientes` 16 · `podcast-es` 4 · `articulos-tecnicos` 1).
> Una lista desincronizada no se regenera. ⇒ **no se añade relación a
> `category` por esta vía**; la colección `categorias` sigue como estaba (§2c,
> SIN CENSAR por LH-SP8).
>
> Límite declarado: el marcado servido no distingue «lista escrita» de «un
> shortcode que expande la taxonomía». Lo que sí cierra es que **no es el widget
> nativo** y que **su salida no varía ni cubre lo vivo**.

⛔ **NO SEPARABLE, y se declara como tal.** Barra y retícula son **colineales en
149/149**: ningún documento tiene una sin la otra. Así que *«la barra es
propiedad de la CAPA»* y *«…de la VARIANTE»* son **indistinguibles con esta
población** (§DOS VARIABLES CONFUNDIDAS). Al modelar se elige **variante**, y la
razón es de **mecanismo, no de medida**: la plantilla de cuerpo del theme
builder decide las dos cosas a la vez y está servida en los dos lados.

**Dato de entrega:** los 2 `href` del widget son absolutos a
`https://kunakair.com/es/categoria/{eventos,noticias}/` → entran en `P-LH-C4` y
tocan **LH-SP8**.

### ⚠ 2c.0bis · El `h1` de un listado: **dos poblaciones, dos tratamientos** (2026-08-11)

`D4` publicaba esto en **una** unidad —*«los 35 `h1` = nombre del término/
índice»*— y ahí iban fundidas dos cosas que no admiten el mismo enunciado.
Partido en `D4a`/`D4b` (`listados-hubs/DECISIONES.md`; evidencia
`medidas/lh-h1.json`, 149 documentos):

| población | n | de dónde sale el `h1` | qué hace el modelo |
|---|---|---|---|
| **archivo de TÉRMINO** | **89 documentos** | el **NOMBRE del término** — no su `slug` | **NO lleva campo de titular**: lo trae la relación al término |
| **ÍNDICE** | **48 documentos** (10 índices) | **no es derivable de la ruta** y varía dentro de la familia | **campo propio de la página** |

**El discriminador de `nombre` contra `slug` está medido, y son 4 documentos los
que lo sostienen**: `co2-es → «CO2»`, `h2s-es → «H2S»` (×2 documentos) y
`petroleo-y-gas → «Emisiones del petróleo y gas»`. En los otros 85 slug y nombre
coinciden, así que **sin esos 4 las dos hipótesis serían indistinguibles**
(§DOS VARIABLES CONFUNDIDAS). Probado con su negativo: borrándolos, el veredicto
pasa solo a *«INDISTINGUIBLES»*.

**Y la PRESENCIA del `h1` es plantilla de la familia** (`D4b`): **12 documentos
sin `<h1>`** —`L2` entera— y **0 con `<h1>` vacío**, con **0 familias mixtas** de
9. En régimen plantillado, varianza cero dentro y distinta entre ⇒ **plantilla**.

> **Consecuencia para el content type:** el titular de un listado **no es un
> campo del listado en general**. Un archivo de término lo deriva; un índice lo
> almacena; y **si la familia lo emite o no lo decide su plantilla**, no el dato.
> Las tres cosas son distintas y `D4` las tenía en una fila.

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

### ⚠ 2c.2 · `titulo` admite la cadena VACÍA en `terminos-kunakpedia` — CMS-2 (2026-08-12)

**Decisión de esquema tomada en la tanda de datos, PASO 4.** `esmog` sirve **dos**
`<h1>`: el de la plantilla **vacío** (`<h1></h1>`) y el real dentro del cuerpo
(*«Esmog, qué hay detrás de esa densa niebla»*). Su `titulo` medido es `""`, y el
`required` de Payload lo rechaza **igual que si faltara**.

| dominio | con `<h1>` vacío |
|---|---|
| `terminos-kunakpedia` | **1 de 37** (`esmog`) |
| `entradas-blog` | **0 de 149** |
| `documentos-cientificos` | **0 de 23** |

> **CMS-2 · `titulo` de `terminos-kunakpedia` es OBLIGATORIO y su cadena VACÍA es
> un valor legal DECLARADO.** La ausencia de la clave sigue matando el alta.
> Implementación: `requeridoConVacio()` en `campos/comunes.ts`, que sustituye el
> `required` de Payload por un `validate` que sólo rechaza `undefined`/`null`, y
> lo declara en el esquema (`custom.vacioLegal`) para poder auditarlo.

**Por qué esto NO es «inventar una regla de respaldo desde n=1».** La tanda
anterior hizo bien en no escribir *«si el `h1` está vacío, cae a la miga»* — eso
sería derivar un **discriminador** de una sola instancia. Lo que se decide aquí
es otra cosa, y ya estaba escrito en el repo:

> **`h1: ""` colapsando «vacío» y «ausente» es el defecto de `lh-censo`**,
> trasladado al esquema. El arreglo es que el campo **admita el vacío de forma
> explícita y distinguible de la ausencia** — no que alguien decida qué poner
> cuando está vacío.

**El defecto va en la dirección que GRITA** (§sondas 6): *ausente* falla en el
acto y con su mensaje; *vacío* se guarda y vuelve tal cual. Al revés —admitir la
ausencia— no haría fallar nada y mataría el render delante del editor, que es
literalmente §F2-5-ESCALÓN-ETIQUETAS.

**Y está ESTRECHADO, con su prueba.** `qa:vacio-legal` (negativo **3/3**) mide
contra Payload de verdad —no contra el objeto de config, §documentado no es
conectado— las **tres** mitades:

| caso | esperado | medido |
|---|---|---|
| `terminos-kunakpedia.titulo = ""` | entra | ✅ entra |
| `terminos-kunakpedia.titulo` ausente | muere | ✅ rechazado |
| **`faqs.titulo = ""`** (un `required` normal) | **muere** | ✅ rechazado |

El tercero es el que impide que «lo hemos ablandado» y «lo hemos ablandado en
todas partes» den el mismo verde.

**NO-OP sobre lo ya medido**: round-trip **249/249** con los 37 términos
sembrados, `esmog` incluido — el `""` sobrevive la ida y la vuelta.

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

> ⚠ **CORREGIDA EN SU CLÁUSULA DE TEXTO (2026-08-09, §2d.3).** El principio se
> mantiene y **`imagen`/`botón`/`moduloBase`/`nivelTitular` se consumen tal
> cual**, medido. Lo que no se sostuvo es *«sin cambiarlas»* aplicado al
> **texto**: `MODULO_TEXTO` no expresa lo que trae el original **ni en KB (7
> etiquetas) ni en SECTOR/MONOGRÁFICO (12)**, porque se calibró sobre la
> transcripción y no sobre el sitio. `articulos-kb` usa **`texto-kb`**
> (`campoHtml`); el compartido queda **declarado infra-especificado**. Acta y
> medida: §2d.3.

**Consecuencia nueva para la cola larga, que antes no estaba escrita:** la cola
de páginas compuestas **ya se sabe que `MonoSeccion[]` solo no la cubre**. LH-2
D1 la dejó apuntando a la hipótesis del grupo D; la hipótesis cayó, así que la
cola larga necesitará su propia decisión de modelo cuando toque.

> ⚠⚠ **CORREGIDA EN SU MEMBRESÍA Y EN SU ALCANCE (2026-08-22, 90.ª tanda).** La
> frase decía *«la cola de páginas compuestas (6 hubs LH-2 + 7 hubs KB)»* y
> **omitía 35 rutas**: la cola larga son **48 RUTAS** —7 hubs KB + 6 hubs L4 +
> **35 sueltas**—, derivada elemento a elemento en `PLAN-FASE-3.md` §F3-3.
> ⚠ **48 es la unidad RUTA; en unidad DOCUMENTO CAPTURADO son 32; en unidad
> DOCUMENTO DE `paginas` son 31** (91.ª: de las 35 sueltas, 13 son 301 y 3 son
> 404 — §2j; 93.ª: una de las 32 capturadas es una entrada de blog, §2j.3c).
> **Los tres números son ciertos y no son intercambiables:**
>
> | unidad | n | qué es | quién la usa |
> |---|---|---|---|
> | **RUTA** | **48** | URLs que el original sirve *de algún modo* | F3-3: lo que la fase tiene que **RESOLVER** |
> | **CAPTURADA** | **32** | documentos de la cola larga con HTML propio | toda medida hecha sobre el corpus de F3-3 |
> | **DOCUMENTO DE `paginas`** | **31** | lo que la colección **ALOJA** | CMS-3: el esquema, el opcional, la emisión |
>
> `48 = 31 páginas + 1 entrada de blog + 13 redirecciones + 3 bajas`. **S1 no
> movió la unidad CAPTURADA** —se capturaron 32 y se siguen habiendo capturado
> 32—: movió **de qué colección es una de ellas**. Reparto sitio a sitio en
> `derivaciones/denominador-32-reparto.md`. Convivía
> con la lectura del PLAN (*«7 hubs KB + las autónomas»*), que a su vez omitía
> los 6 de L4; **las dos sumaban 13 por coincidencia** —una contaba 6 páginas,
> la otra 6 familias— y su única intersección eran los 7 hubs de KB. **Las dos
> formulaciones quedan borradas**, no conciliadas.
>
> **Y el *«usan `video`/`toggle`»* es cierto en 7 de las 32 CAPTURADAS** (la 91.ª
> bajó el denominador de 48 a 32: 48 son rutas, 32 son documentos capturados).
> ⚠ **Aquí la unidad es CAPTURADA y por eso el 32 SIGUE SIENDO EL BUENO** aunque
> `paginas` aloje 31: es una medida sobre el corpus, y el corpus no cambió con
> S1. Censado el marcado de las 32 capturadas: **hubs KB** `video` 5/7 y `toggle` 5/7 ✅ · **hubs L4**
> 0/6 y 0/6 · **sueltas** 0/19 y 0/19, pero con **cinco tipos que nadie había
> nombrado**: `map` · `slider` · `fullwidth_slider` · `slide` · `icon`. La
> conclusión de §1.5b Razón 1 —no ampliar `MonoSeccion[]`— **se refuerza**, no
> se debilita.
>
> > ⚠⚠ **DOS CIFRAS DE ESTE PÁRRAFO RECONTADAS EN LA 91.ª (§2j.2): son 9, no 7,
> > y L4 NO estaba a cero.** El censo comparaba contra una **lista de literales
> > escrita a mano** que acreditaba a `MonoSeccion[]` cuatro tipos que no
> > expresa (`blurb`/`gallery` viven en `MODULOS_KB`; `code`/`divider` no
> > existen en el repo). Derivado del registro de bloques: **hubs L4 → 1**
> > (`blurb`) y **sueltas → 7** (los cinco **+ `code`, que es su segundo módulo
> > más frecuente, 9/19**). *«`MonoSeccion[]` los cubriría hoy»* aplicado a L4
> > queda **borrado**: no los cubre.

### ✅ 2d.2 · `articulos-kb` CONSTRUIDA a medias — `blurb` y `gallery` MEDIDOS, y el texto PARADO en su escalón (2026-08-09, F3-1)

§2d.1 dejó `blurb`/`gallery` «para cuando se construya». Se construyó, y esto es
lo que la medida dijo. Instrumento: **`npm run qa:kb-recon`** — 6/6 artículos,
**offline sobre `corpus/fase-3/`** con toda la red bloqueada (25–44 peticiones
abortadas por página), congelada en `medidas/kb-recon.json`.

**Confirma §2d.1 en lo que decidió:** **1 sección propia en las 6, varianza cero
⇒ plantilla**; sidebar 6/6 y sticky 6/6 en la capa `_tb_` ⇒ cascarón.

#### El content type de `blurb`, campo a campo y con su alcance (36 módulos, 3 artículos)

Régimen: capa propia de **builder**, así que el discriminador es el **test B**
(varianza entre hermanos) más la varianza entre instancias.

| propiedad | medido | veredicto |
|---|---|---|
| `imagen` | 30/36 | **opcional** |
| `descripcion` | 24/36 | **opcional** |
| nivel del titular | `h4`×27 · `h3`×9 | **CAMPO** |
| `reticula` | `iconos`×24 · `col-md-4`×9 · **ninguna**×3 | **CAMPO, con TRES valores** |
| `alineacion` | `center`×27 · `left`×9 | **CAMPO** |
| enlace | **0/36** | **NO EXISTE** — no se añade |

⚠ **`ninguna` es un valor, no la ausencia del campo**: los 3 blurbs que no
llevan clase de retícula la tienen *quitada* por quien editó. Modelarlo como
campo ausente obligaría a distinguir «no lo puso» de «lo quitó», que es
justamente la ambigüedad que §7e cerró por el otro lado.

⚠ **Y lo que NO se cableó, con su nombre:** `et_pb_blurb_position_top` y
`et_pb_bg_layout_light` salen **36/36**, y el estilo en línea es `null` en las
36. **Cero varianza no prueba plantilla**: prueba que en las instancias que
existen nadie lo tocó. Van al componente y quedan **SIN PROBAR** anotados.

**`gallery`: 1 módulo con 6 items.** Se escribe con lo que hay y **se declara que
no discrimina nada**: con n=1 no se sabe qué es plantilla y qué es campo — es la
FAMILIA DE CALIBRACIÓN, como `anchoPct: 90` viviendo en una sola de cuatro
instancias. El día que aparezca una segunda galería, se re-mide.

> ⚠ **Corrige de paso al inventario del grupo D.** `grupo-d-inventario.json`
> (2026-08-03) dice `blurb ×36/×18/×18` y `gallery ×2`; la captura congelada da
> **×18/×9/×9** y **×1** — la mitad exacta en los cuatro. Tres recuentos
> independientes sobre los mismos bytes coinciden en la mitad: nodos del DOM,
> índices `et_pb_blurb_N` distintos y el token de clase exacto. **No se puede
> adjudicar contra el instrumento viejo porque su código no existe en el repo**
> —ningún fichero de `scripts/` produce ese JSON—, que es la regla 2 (*una sonda
> que no congela su código produce afirmaciones que no se pueden auditar*)
> cobrada con nueve días de retraso. **La decisión no se mueve**: §2d.1 metió
> `blurb`/`gallery` en la unión propia por estar **ausentes de `MonoModulo`**, y
> 18 ó 36 no cambia eso. Lo que cambia es el número, y el número correcto es el
> que trae su sonda commiteada.

#### ⛔ Lo que NO se decide aquí: el módulo de TEXTO

La misma corrida midió **85 módulos `et_pb_text` con 16 etiquetas dentro**, de
las cuales **7 no caben en el tipo compartido** (`span`·`sub`·`a`·`i`·`em`·
`img`·`sup`). O sea que la mitad de §2d.1 que dice *«CONSUME las definiciones
compartidas sin cambiarlas»* **es cierta de imagen y botón y falsa del texto**.

**Parado con la evidencia congelada, con sus dos salidas y su coste**:
`PENDIENTES-QA.md` §F3-1-ESCALON-TEXTO.

> ✅ **CERRADO EL MISMO DÍA, y ninguna de las dos salidas era la respuesta —
> §2d.3.** El arbitraje no llegó a hacer falta: preguntando **sobre qué
> población se derivó el tipo** salió que SECTOR/MONOGRÁFICO traen **12**
> etiquetas fuera de él, más que las 7 de KB. `inline` estaba
> **INFRA-ESPECIFICADO desde el principio** y el dilema —*¿acomodo al recién
> llegado o toco un tipo poblado?*— **no tenía sujeto**. Las 7 de aquí no eran
> la anomalía: eran la primera vez que alguien miraba.

#### Lo que sí quedó aplicado

`prefijo` es **campo required**: los 6 artículos cuelgan de **dos** prefijos
(`centro-de-ayuda/kunak-air/…` ×5 y `soporte/centro-de-ayuda/kunak-air-cloud/…`
×1). Es el mismo hallazgo que obligó al catch-all de `/recursos/[...ruta]` en
grupo A — *el prefijo tiene tres valores, no uno*—, así que el slug no basta
para construir la URL. Migración versionada `20260809_125718_f3_articulos_kb`,
aplicada, con `npm run check` en verde.

### ✅ 2d.3 · EL ESCALÓN DEL TEXTO — ARBITRADO, y el dilema se DISOLVIÓ al preguntar por la POBLACIÓN (2026-08-09, F3-1)

Cierra §F3-1-ESCALON-TEXTO. **No lo cerró el arbitraje: lo cerró la pregunta de
antes**, que ninguna de las dos salidas escritas se había hecho.

> **¿Sobre qué POBLACIÓN se derivó el tipo compartido?**

Es la misma que disolvió CLASE (31 ítems → 1 medición) y la frontera del ancho
pedido. Y aquí valía lo mismo: **sobre `MonoInline`, que es dato TRANSCRITO A
MANO** a `apps/web/src/lib`. Lo dice la cabecera de `contenido.ts` sin
disimularlo — *«su inventario está medido en 56 `<strong>`»*.

> **Una transcripción no se puede auditar contra sí misma.** Lo que no se
> transcribió no está ahí para contarlo, así que preguntarle a `src/lib` si le
> falta algo **devuelve siempre que no**. El tipo no se midió sobre lo que
> existe: se midió sobre lo que alguien ya había decidido escribir.

#### Las dos premisas que había que derivar antes de medir, y las dos eran falsas

| lo que se daba por hecho | lo derivado |
|---|---|
| «el corpus tiene congelados los cuerpos de MONOGRÁFICO y SECTOR» | **0 en `corpus/INDICE.json` (309) y 0 en `corpus/fase-3/INDICE.json` (272).** Las dos campañas los excluyen *a propósito*, con la razón escrita: *«CONSTRUIDA completa: el cuerpo es dato tipado transcrito»* |
| el original ya está fuera del camino crítico | lo está **para construir**. Para **auditar una decisión de modelo** seguía dentro, y nadie lo había notado |

La segunda es la interesante: **la razón que dejó esas 8 páginas fuera del
corpus es exactamente la que produce el hueco.** Se excluyeron *porque* estaban
transcritas — o sea porque su única copia era la que había que auditar.

Capturadas para esto: **`npm run cms:captura-sectores`**, 8/8, 2.5 MB, 0 fallos,
denominador propio en `corpus/fase-3-sectores/` (no mueve los 309 ni los 272).

#### La medida: un instrumento, dos poblaciones

**`npm run qa:texto-poblacion`** (negativo **4/4**), congelada en
`medidas/texto-poblacion.json`. Offline sobre HTML congelado, red bloqueada.

Dos guardas que no son decorado, porque la sonda **falló las dos en su primera
corrida**:

1. **CONTROL** — reproduce `medidas/kb-recon.json` al carácter (85 módulos, 16
   etiquetas). Sin él, una asimetría entre poblaciones podría ser del
   instrumento (§sondas 4: *un comparador que falla en el 100 % está comparando
   dos cosas que no son la misma*);
2. **CLASIFICADOR prosa/anfitrión** — la primera corrida contó `div×427 ·
   article×42 · header×22` y **eso no es prosa**: en Divi un `et_pb_text` es
   también donde el editor pega un shortcode (la miga, la banda de clientes,
   `#lista-soluciones`, las tarjetas de caso). Es §sondas 4 en su **tercera
   cara** —*un número plausible de más, que encima invita a explicarlo*—.
   Evidencia conservada con su nombre (regla 7):
   `medidas/texto-poblacion-SONDA-SOBRECASABA-ANFITRIONES.json`.

**El resultado, sólo prosa:**

| población | páginas | módulos de prosa | fuera del tipo compartido |
|---|---|---|---|
| `articulos-kb` | 6 | 85 | **7** — `span×50 · sub×7 · a×5 · i×4 · em×2 · sup×1 · img×1` |
| **SECTOR + MONOGRÁFICO** | 8 | 175 | **12** — `span×179 · sub×52 · td×32 · tr×9 · th×4 · h5×4 · div×4 · br×3 · em×1 · table×1 · thead×1 · tbody×1` |

Compartidas por las dos: **`span` · `sub` · `em`**. Y el lado que se creía sano
trae **más** que el recién llegado, incluida **una `<table>` entera** en el
cuerpo de EDAR.

> **`inline` no se le quedaba corto a KB: estaba INFRA-ESPECIFICADO desde el
> principio.** KB no rompe nada — es **el primer arquetipo que se midió contra
> el original en vez de contra su propia transcripción**.

#### El segundo testigo: la transcripción improvisó TRES veces

Y es el que no admite réplica, porque está en el repo desde julio — un solo
fichero, `apps/web/src/lib/monografico.ts`:

| línea | el original | lo transcrito |
|---|---|---|
| 585-589 | `<strong>H<sub>2</sub>S (sulfuro de hidrógeno).</strong>` | `[{b:"H"},{b:"2"},{b:"S (sulfuro…"}]` — el subíndice **aplanado a negrita** |
| 627·633·639 | `H<sub>2</sub>S, CH<sub>4</sub>, CO<sub>2</sub>` | `"H₂S, CH₄, CO₂"` — **carácter Unicode**, otro apaño, 40 líneas más allá |
| 622 | el `<table>` del cuerpo | `kind: "tabla"` — un **kind inventado** para rodear el tipo |

**Tres apaños distintos para la misma carencia es la firma de un tipo corto**, no
de tres decisiones. Y ninguno dejó rastro de defecto: el clon compila, el
round-trip pasa y el píxel casa en casi todo, porque **nadie estaba comparando
contra la etiqueta del original**.

#### ⚠ La asimetría de esta decisión NO es la de siempre: UN ENSANCHAMIENTO ES RETROCOMPATIBLE

Hay que decirlo explícitamente, porque el instinto del proyecto empuja al revés
y aquí empuja **por la razón equivocada**:

> **La regla «no toques una colección poblada» protege de ESTRECHAMIENTOS y de
> CAMPOS NUEVOS REQUERIDOS.** Los dos invalidan dato que ya existe: el primero
> lo deja fuera del tipo, el segundo lo deja incompleto. **Un ensanchamiento no
> hace ninguna de las dos cosas** — el contenido ya sembrado sigue siendo válido
> si el tipo acepta más. Así que el cubo **C** *no* es el argumento contra la
> salida B, y usarlo como tal habría elegido la salida separada por un motivo
> que no aplica.

Lo que sí cuesta ensanchar `MODULO_TEXTO` es otra cosa, y es real: `MonoInline`,
el render de `MonoCuerpo.tsx` y `mapeo`/`vuelta` tienen que saber llevar las
marcas nuevas, y eso **se prueba con su round-trip**. Es una tanda, no un
renglón. La diferencia importa: se aplaza por **coste medido**, no por tabú.

#### La decisión

**La frontera ya estaba escrita en `CLAUDE.md` §Dónde para el modelado**, y esto
es su primera aplicación fuera de grupo A:

> *Hasta el contenedor de contenido, la estructura se modela. A partir del
> contenedor, el contenido lleva su propia estructura dentro y se declara RICO.*

| | |
|---|---|
| **`articulos-kb`** | módulo propio **`texto-kb`** = `campoHtml("html")` + `moduloBase`. El módulo, su ritmo y su ancho siguen modelados; lo de dentro es HTML (CMS-0e · §3.1d) |
| **`MODULO_TEXTO` compartido** | **intacto en el código y DECLARADO infra-especificado**, con su medida y su fecha. Ficha: `PENDIENTES-QA.md` §CLASE-INLINE-PRESTADO |
| **lo que se ofrece en `articulos-kb`** | los **5 kinds medidos** (`texto-kb`·`imagen`·`boton`·`blurb`·`gallery`). `titular`/`claim`/`texto` compartidos **se retiran**: el censo no los tiene —los encabezados van DENTRO del texto (`h1`×6·`h2`×20·`h3`×8·`h4`×2)— y la colección estaba **vacía**, así que estrechar aquí no invalida dato |

Migraciones versionadas y aplicadas: `20260809_135819_f3_texto_kb_rico` (sólo
altas) + `20260809_135857_f3_kb_retira_compartidos` (sólo bajas). **Partidas en
dos por la herramienta, no por el modelo**: `migrate:create` pregunta de forma
interactiva si cada tabla nueva es un renombrado de una que desaparece, y en un
entorno sin TTY ese prompt no se puede contestar; si ningún diff trae altas y
bajas a la vez, no hay pregunta.

#### PD2 no fracasó: acertó en KINDS y la pregunta era la FORMA DE LOS CAMPOS

**Y así se escribe un predicado pre-registrado que falla — como un resultado.**

PD2 predijo *«texto, imagen y botón entran»* y §2d.1 escribió que este arquetipo
*«CONSUME las definiciones compartidas **sin cambiarlas**»*. Medido: **imagen y
botón entran tal cual** (siguen importados, sin duplicar). Lo que falla es el
texto, y **falla por la misma junta que el proyecto ya había articulado** al
calibrar la frontera de `productos`:

> *un kind que una forma usa y otra no NO es campo de frontera; lo son las
> PROPIEDADES.*

**PD2 se midió sobre KINDS de módulo** —¿aparece `texto` en las dos?, sí— **y la
pregunta era la FORMA DE SUS CAMPOS**. Es el mismo desajuste de nivel que HD1,
que acertó la mitad de la retícula y falló la de los kinds. §2d.1 queda
corregida en esa cláusula y **sólo en ésa**: sus cinco decisiones siguen en pie.

#### Lo que NO encaja en ninguna salida, LISTADO y no acomodado

- **`img×1` dentro de un módulo de texto de KB** (`que-es-kunak-air`): con
  `campoHtml` deja de ser una excepción —el contrato del campo rico admite `img`
  en 209/209 de grupo A— **pero arrastra una pregunta que el bloque no contesta**:
  ese `<img>` apunta a `wp-content` y **necesita T4b** (sustitución por media
  local) igual que el cuerpo de grupo A. Se resuelve al sembrar, o el Δ0 lo
  delata. **Dueño: F3-1 PASO 4.**
- **`class="none"` en 6 de los 85 módulos de texto.** Aparece una vez por
  artículo y no se sabe qué la pone. Cero explicación ⇒ **SIN PROBAR, anotado y
  no cableado.**
- **El `<table>` de EDAR** sigue siendo `kind: "tabla"` en el clon y **§3.4 sigue
  ABIERTA** («¿nodo de Lexical o block?»). Esta acta no la cierra: la vuelve a
  poner sobre la mesa con un dato que antes no tenía —la tabla **está dentro de
  un `et_pb_text`**, o sea que en el original no es un módulo aparte.

#### El defecto NUEVO que salió de aquí, y no es un pendiente de modelo

> **`/sectores/…-en-edar` sirve `H2S` donde el original sirve `H₂S`.** No es que
> falte modelar: **el clon ya está pintando otra cosa**, hoy, en una página dada
> por verificada. Un `<sub>` tiene otro tamaño y otra línea base, así que además
> **puede mover el envolvimiento** — y es exactamente el tipo de defecto que
> §CONTRATO A DOS ANCHOS dice que sólo se ve donde el texto envuelve.

Ficha con su evidencia en `PENDIENTES-QA.md` §CLASE-INLINE-PRESTADO. **No se
arregla en esta tanda** —arreglarlo es el ensanchamiento con su round-trip— pero
deja de estar invisible, que era lo caro.

### ⛔ 2d.4 · `articulos-kb` NO SE PUEDE SEMBRAR TODAVÍA — dos huecos que ninguna salida del escalón contemplaba (2026-08-09, F3-1 PASO 4)

Resuelto el escalón del texto, F3-1 PASO 4 (seed → plantilla → ruta → Δ0) **paró
en el primer paso**, y por dos cosas distintas que salieron al ir a usar el
modelo. Las dos con su número, ninguna arbitrable: **son estructura sin medir**,
no un dilema.

#### Hueco 1 · el `cuerpo` es PLANO y el original tiene FILAS Y COLUMNAS

`articulos-kb.cuerpo` se construyó como `blocks` **plano** — una lista de
módulos. La captura dice otra cosa, derivado del árbol congelado en
`medidas/kb-recon.json` (los mismos bytes con los que se decidió `blurb`):

| | |
|---|---|
| filas en las 6 instancias | **45** |
| columnas por fila | **1**×31 · **2**×13 · **3**×1 |
| anchos de columna | `4_4`×31 · `1_2`×14 · `1_3`×9 · `2_3`×6 |
| clase de fila no-por-defecto | `d-none`×6 — **una por artículo** |

Una lista plana **no puede expresar** «este texto y esta imagen van en dos
columnas de la misma fila», que es lo que hacen 14 de las 45. El modelo que hace
falta ya existe y está medido: **`MonoFila`/`MonoColumna`**, el mismo que usan
SECTOR y MONOGRÁFICO. O sea que esto **no abre decisión**: es trabajo.

> ⚠ **Y por qué no se vio en la tanda anterior:** §2d.2 midió **los módulos**
> —`blurb` campo a campo, `gallery`— y el `cuerpo` plano nunca se ejerció, porque
> **no se sembró nada**. Es la §regla 10 otra vez: *«construida a medias» se
> verifica usándola*, y el uso llegó hoy.

#### Hueco 2 · este arquetipo NO TIENE FASE DE SPECS, y el Δ0 la exige

El flujo del proyecto es **Recon → Specs → Build**. Para `articulos-kb`:

| fase | estado |
|---|---|
| Recon | ✅ `docs/research/grupo-D/RECON.md` + `DECISION.md` + captura F3-0 |
| **Specs** (`getComputedStyle` por sección, estados, texto verbatim, assets) | ❌ **NO EXISTE** — `docs/research/grupo-D/components/` no existe |
| Build | bloqueado por lo anterior |

**Sin specs, «la plantilla» se inventa**, y entonces el Δ0 del criterio (d) no
mide fidelidad: mide si acerté. Es exactamente lo que `CLAUDE.md` §UN ARQUETIPO
NUEVO NO HEREDA COBERTURA dice de las guardas solo-clon, aplicado a la
construcción en vez de a la sonda.

> **Es la §regla 10 por tercera vez en la misma tanda.** F3-1 escribió su
> criterio de «hecho» —*(d) Δ0 contra el ORIGINAL a 1440 y 390*— **sin declarar
> la precondición que ese criterio tiene**. Un criterio de cierre no comprueba
> que exista lo que hace falta para cumplirlo.

#### Lo que esto NO cambia

- **§2d.3 sigue en pie entera**: el texto es `campoHtml`, y eso se decidió con
  la medida delante. Los dos huecos son de **estructura de página**, no de tipo
  de campo;
- **`blurb`/`gallery` siguen medidos y aplicados**, con sus migraciones;
- **nada se cableó a ciegas.** Es lo que pedía la consigna: *si aparece algo que
  ninguna salida costeada contempla, para con la evidencia congelada*.

**Dueño:** la tanda que retome F3-1 PASO 4, y su **orden obligado** es:
**(1)** specs del arquetipo · **(2)** filas/columnas en el esquema con su
migración · **(3)** extractor + seed · **(4)** plantilla · **(5)** ruta ·
**(6)** sonda de dos lados + Δ0. Saltarse (1) es construir contra una plantilla
inventada.

### ✅ 2d.5 · el PASO (1) HECHO, y lo que las specs le cambian al modelo (2026-08-10, tanda 44.ª)

Specs: `docs/research/articulos-kb/MEDICION.md` + `components/{cascaron,cuerpo,modulos}.spec.md`.
Medidas: `kb-css.json` (dónde se mide) · `kb-spec-{1440,390}.json` (el árbol) ·
`kb-tests.json` (**1519 pares nodo × propiedad** clasificados).

> **El escalón NO se disparó.** Las specs no destaparon ninguna forma que este
> ESQUEMA no pueda expresar: el nivel de fila y una unidad en el campo de ritmo
> caben en el vocabulario que ya hay, y **no contradicen ninguna decisión
> escrita**. Lo que sigue son **precisiones con número**, no arbitrajes.

#### El PASO 0 que el orden obligado tampoco tenía: DÓNDE se mide

`qa:kb-css`, de dos lados. **De las 19 hojas externas que el HTML pide, la
captura tiene 0** — y aun así renderiza, porque trae **184 KB de CSS en línea**.
O sea que **sale plausible y equivocada**: 155 de 210 anclas de estilo coinciden
y **55 no**, entre ellas las 9 del ritmo y la caja que fallan en las 6. La peor:
`columna.width` **678.52 offline contra 430.80** en el original — sin las hojas
la partición en columnas no ocurre, así que **una spec medida ahí habría afirmado
con número que el cuerpo es plano**, que es el hueco 1 con respaldo falso.

**Consecuencia declarada:** el original está fuera del camino crítico **para
obtener datos** y **no lo está para medir el píxel**. Ficha:
`PENDIENTES-QA.md` §F3-1-CSS-NO-CAPTURADO.

#### Lo que el hueco 1 necesita, ahora con la medida

| | medido |
|---|---|
| secciones propias | **1 por artículo**, 6/6 |
| filas | **45** — **6 ocultas** (`d-none`, una por artículo, con el `<h1>Kunak Help Center</h1>` dentro) y **39 visibles** |
| repartos | `4_4`×25 · `1_2+1_2`×7 · `1_3+2_3`×6 · `1_3×3`×1 |
| `fila.reparto` | **CAMPO**, probado por test B (filas hermanas con repartos distintos) |
| módulos | 149 · `text`×85 `blurb`×36 `image`×21 `button`×6 `gallery`×1 |

> ⚠ **CORRIGE al recuento del hueco 1**, que decía `4_4`×31: eran **25 visibles
> + 6 de las filas ocultas**. El número no cambia la decisión; el reparto entre
> visibles y ocultas sí cambia lo que hay que emitir.

#### Las CUATRO precisiones que el modelo tiene que absorber

1. **Un campo de ritmo de fila no es un número: es un número CON UNIDAD.**
   `ritmoModulo` (`campos/comunes.ts`) es `number`, o sea px. Medido en las
   filas de KB, el editor escribió **px absolutos** (`7·14·17·19·20·25·−2·−21`)
   **y porcentajes** (`2·5·0.8·0.4 %`). **A 1440 son el mismo número**; los
   separa que el default de Divi **cambia de unidad al apilar** (`2 %` → `30px`
   plano) y un porcentaje del editor no. Un campo `number` fuerza a elegir uno de
   los dos y **el error es invisible a 1440**;
2. **el default de `margin-bottom` es una FUNCIÓN DEL TIPO DE COLUMNA**, no una
   constante: `34.0469` en las 59 columnas `4_4` y `25.0625` en las 13
   estrechas, sin una excepción — y **ninguno de los dos es el 2.75 % de su
   propio contenedor** (`34.0469` es el 2.75 % de 1238.39, la fila del
   *cascarón*). Cablear una constante se equivoca en uno de los dos grupos por
   ~9 px;
3. **el extractor NO puede leer `style=`.** Hay **0** estilos en línea en las 45
   filas y los 149 módulos: Divi lo compiló a `et-core-unified`. En SECTOR y
   MONOGRÁFICO el valor del editor viajaba en el atributo. **La entrada del
   extractor son las medidas congeladas `kb-spec-{1440,390}.json`** —que son la
   captura del estilo computado, reproducible y commiteada— más el HTML
   congelado para el verbatim. Los dos anchos hacen falta: **uno solo no
   distingue px de %**;
4. **`anchoPct` sí aplica, y sale MEDIDO**: `85 %`×6 · `50 %`×4 · `40 %`×2, los
   12 en módulos `image`. **Ningún `text` tiene ancho < 100 %** de su columna, y
   los `blurb` al 30 % son la retícula (`iconos`/`col-md-4`), campo que ya
   existe — o sea que la geometría **confirma `reticula` por un camino
   independiente de los nombres de clase**.

#### Y una corrección de RAZONAMIENTO a `bloques/kb.ts`, con la conclusión intacta

La cabecera de `MODULO_TEXTO_KB` deduce que no hace falta `lh` ni `anchoPct`
**de que `estiloInline` es `null` en los 85**. La premisa es cierta y **el
argumento no vale**: `estiloInline` es `null` en los **149** módulos, incluidos
los 12 que sí llevan `anchoPct`. Lo que prueba la ausencia de `style=` es que
**Divi compiló a CSS**, no que el editor no tocara nada.

**La conclusión se sostiene, medida como toca** (`getComputedStyle`, no el
atributo): ningún `text` tiene ancho < 100 % de su columna, y su interlínea sólo
cambia junto con el tamaño de letra —o sea que es una **piel de párrafo dentro
del HTML**, no un ajuste por módulo—. `lh` y `anchoPct` siguen sin hacer falta en
`texto-kb`; lo que cambia es **por qué**.

#### Lo que las specs añaden al cascarón

**Varianza cero en las 6** en los 8 ejes medidos ⇒ plantilla entera, **cero
campos** — confirma §2d. Y el dato que gobierna todos los porcentajes del cuerpo:
**la capa propia vive dentro de una columna de 911.75**, no a 1440. Los defaults
de Divi se resuelven contra ella (sección 4 % = **36.4688**, fila 2 % =
**18.2344**, no los 57.5938/28.7969 del monográfico). **Escribir los números del
monográfico en el comparador daría «no es el default» a todos los defaults**, y
de ahí saldrían ~30 campos inventados.

### ✅ 2d.6 · la RETÍCULA aplicada y la colección POBLADA — y el defecto de `mb` atribuido a la variable equivocada (2026-08-10, tanda 45.ª)

Cierra el **hueco 1** de §2d.4 y los pasos **(2)** y **(3)** de su orden
obligado. `articulos-kb.cuerpo` deja de ser `blocks` plano y pasa a ser **la
lista de las 39 filas visibles**; la colección **está sembrada** con sus 6
instancias. Migraciones `20260810_140505` (suelta) y `20260810_140630` (retícula).

#### Las tres precisiones, y la forma que toma cada una

| precisión (§2d.5) | cómo se expresa | dónde |
|---|---|---|
| `fila.reparto` es CAMPO | **la secuencia de `ancho` de sus columnas**, con `validaReticulaKb` (suman 1 o se rechaza) | `bloques/kb.ts` |
| el ritmo lleva **unidad** | `medida()` = `valor` + `unidad` (`px`\|`pct`) + override de móvil; la unidad es **obligatoria en cuanto hay valor** | `campos/comunes.ts` |
| el defecto de `mb` no es una constante | `mbPorDefecto(anchoFila, tipoColumna)` — tabla medida, **`throw`** ante un ancho de fila sin medir | `defaults.ts` |

> ⚠ **Y `reparto` NO es un `select` de los cuatro repartos vistos, a propósito.**
> Sería el **catch 1 de `MODELO.md` §2 repetido con el mismo número**: `ancho` se
> declaró como *«la retícula y no el enum de los valores vistos»* porque escrito
> sólo desde EDAR habría salido de **cuatro** valores y Petróleo estrenó otros
> cuatro. KB vuelve a traer **cuatro, en 6 instancias**. Y guardar las dos cosas
> —el reparto y los anchos— sería la clase C7: dos representaciones de un dato,
> que divergen en silencio.

#### ⚠⚠ CORRIGE a §2d.5 · 2 — el default de `mb` depende del ANCHO DE LA FILA

§2d.5 escribió *«es una función del TIPO DE COLUMNA»*, y es correcto **sólo
dentro de KB**: allí **todas las filas miden 911.75**, así que tipo de columna y
ancho de fila están **confundidos** y la medición no puede separarlos. Derivado
contra un segundo arquetipo —`medidas/mono-modulos-{1440,390}.json`, filas de
1238.39, emparejado nodo a nodo— la confusión se deshace:

| arquetipo | fila | columna | `mb` por defecto @1440 | n |
|---|---|---|---|---|
| SECTOR/MONOGRÁFICO | 1238.39 | **estrechas** (`1_2·1_3·1_4·2_3·3_4·3_5`) | **34.0469** | 35 |
| SECTOR/MONOGRÁFICO | 1238.39 | `4_4` | **34.0469** | 11 |
| `articulos-kb` | 911.75 | **estrechas** (`1_2·1_3·2_3`) | **25.0625** | 13 |
| `articulos-kb` | 911.75 | `4_4` | **34.0469** | 59 |

> **Manda el ancho de la FILA (2.75 %).** Un `1_2` de **585.13** en fila de
> 1238.39 lleva 34.0469; un `2_3` de **591.11** —casi el mismo ancho de
> columna— en fila de 911.75 lleva 25.0625. Aplicar la regla del tipo de columna
> fuera de KB pondría 25.0625 en 35 módulos que miden 34.0469.

La excepción `4_4` de KB sigue **SIN PROBAR**: se replica el número, no se
explica el mecanismo. Corrección propagada a `CLAUDE.md` §Test A —donde los
**tres** defaults eran porcentajes sin decir de qué contenedor— y a
`PENDIENTES-QA.md` §F3-1-SIN-PROBAR-KB.

#### Lo que el seed cambia del modelo de trabajo, y hay que leerlo

`articulos-kb` es **la primera colección cuyo dato NACE en el CMS**: no tiene
catálogo en `src/lib` ni lo va a tener. Consecuencias, las dos ya escritas en el
código para que no se olviden:

1. **su verificación no es `qa:cms-campos`** —empareja colección contra
   `src/lib` y aquí no hay contra qué—, **sino el comparador de dos lados contra
   el ORIGINAL**;
2. **el extractor no puede leer `style=`**: 0 estilos en línea en las 45 filas y
   los 149 módulos. Su entrada son las medidas congeladas, **a los dos anchos** —
   uno solo no distingue `19px` de `2 %`.

#### Tres campos nuevos que el ESQUEMA gana, con su alcance

- **`MODULO_IMAGEN_KB` / `MODULO_BOTON_KB`** — mismo contenido compartido
  (`CAMPOS_MODULO_IMAGEN`, `CAMPOS_MODULO_BOTON`), **otro ritmo**. El botón de KB
  **sí** lleva ritmo (`mb 34.0469→30` ×2 · `mt −15` ×2) y el del monográfico no
  («el wrapper no se entera de ser el último», 7 de 7). Dos medidas, dos bloques;
- **`srcset` NO entra** en las imágenes de KB — 14 de 21 lo traen en el original.
  Omisión **declarada** (§F3-1-SRCSET-KB), no medida: M-IMG está abierta y no se
  cierra de paso;
- **`ancho` sube a `contenido.ts`**: lo consumen dos arquetipos y la retícula de
  Divi no es de ninguno.

### ✅ 2d.7 · LA PIEL DEL TITULAR — el escalón cerrado, y el campo NO es de KB (2026-08-10, tanda 46.ª)

Cierra `PENDIENTES-QA.md` §F3-1-ESCALON-TIPOGRAFIA. El acta completa está allí;
aquí va lo que el ESQUEMA gana y por qué está donde está.

#### El canal que faltaba mirar

El escalón concluyó que el `h2` de KB tiene **tres pieles** y que **ningún eje
servido las separa**. Los diez ejes eran atributos y estructura; **ninguno era
CSS**, y Divi **compila CSS** en vez de escribir marcado. Leído
(`npm run qa:pieles`, 573 páginas del corpus), las tres pieles son **un DEFECTO
del tema (37/37 w300) y DOS overrides por módulo** — reconstruido 1:1: los 3
módulos de 37 px son exactamente los que no llevan regla de `h2`.

#### Las dos preguntas de POBLACIÓN, que van antes de elegir la forma

| | pregunta | derivada |
|---|---|---|
| (a) | ¿conjunto CERRADO? | **NO** — 14 pieles en KB contra **43 en el corpus**, `font-size` hasta `44.1px`, y la misma piel en `h1`·`h2`·`h3` ⇒ **no es propiedad del nivel** |
| (b) | ¿existe FUERA de KB? | **SÍ, y KB es la minoría**: **1272 de 1456 reglas** están fuera (productos 827 · sectores 291 · sueltas 148 · listados 126 · hubs 56) |

> **(b) mueve el campo de sitio: no es de `articulos-kb`, es del módulo de texto
> COMPARTIDO**, infra-especificado igual que lo estaba `inline` (§2d.3). Se
> declara **una vez** en `campos/comunes.ts` y lo consumen `MODULO_TEXTO` y
> `MODULO_TEXTO_KB`. El tabú de «no toques lo poblado» **no aplica**, y esta vez
> con el diff delante: la migración es **3 `CREATE TABLE` + 6 `ADD COLUMN`, cero
> `ALTER` sobre columna existente**.

#### La forma, y de dónde sale cada decisión

| decisión | derivación |
|---|---|
| `titulares` = **array por nivel** en texto | Divi da 6 controles (`H1`…`H6`) |
| `piel` = **grupo** en blurb | Divi da **1** control, y lo compila contra `.et_pb_module_header`; el nivel es otro ajuste |
| `fs` en **px** | 1456/1456 reglas en px |
| `lh` en **em** (razón) | **499/499** en `em`, cero en px. En px, `1.25` sobre `fs 44` y sobre `fs 35` son números distintos y el dato quedaría atado a 1440 |
| `fw` **número**, no enum | catch 1 de `MODELO.md` §2: la escala CSS es 100–900 y KB estrenó cuatro peldaños |
| `align` **select de 4** | cerrado **por el control de Divi**, no por lo visto (2 ejercitados) |
| `movilFs` **uno** | `@980` y `@767` traen el **mismo valor en las 323**, ninguna sin base |
| el **defecto** fuera del campo | `titularPorDefecto()` en `defaults.ts`, que **tira** ante un nivel sin medir |

**El defecto del blurb se derivó de las OMISIONES de las reglas**, porque los 36
llevan regla: la de ×3 escribe *sólo* `font-weight:600` y computa `18/18` ⇒
`fs`=18, `lh`=1; la de ×9 no escribe peso y computa `w300` ⇒ `fw`=300.

#### La guarda que hace auditable todo esto

El extractor deriva del **computado a dos anchos** y **cruza contra el CSS
servido**: un override que el computado ve y ninguna regla explica **se nombra**.

> Es lo que convierte *«la captura no tiene las 19 hojas externas»* de riesgo
> silencioso en fallo visible. Y mordió a la primera: el `h2` de `text_13`
> computa `text-align:center` y **ninguna regla lo explica** — viene de
> `style="text-align:center"` **dentro del campo rico**. Es contenido, ya viaja
> en `html`, y escribirlo como campo habría duplicado el dato. Por eso `align`
> **no se deriva del computado**: está confundido con la herencia y con el
> `style=` del cuerpo rico.

#### Lo que el ESQUEMA gana y lo que queda declarado

- **gana** `titularesModulo` y `pielTitularModulo` (una sola definición de las
  propiedades, `CAMPOS_PIEL`, dos composiciones) y `TITULAR_POR_DEFECTO`;
- **queda declarado y no poblado**: los **1272 overrides fuera de KB**
  (§F3-1-PIEL-FUERA-DE-KB) y la **piel del CUERPO del módulo** (7 pieles en KB,
  §F3-1-PIEL-CUERPO-KB). Los dos con su número y su dueño.

## ✅ 2e · `productos` — UNA colección, medida y cerrada (2026-08-03)

Acta `docs/research/productos/DECISION.md` · pre-registro `PRE-REGISTRO.md`
(`3af483c`, **anterior a la sonda y a medir**) · evidencia
`medidas/solutions-campos.json` (`3039996`) · sonda `solutions-campos` con
negativo 3/3.

> **El CPT `solutions` es UNA colección `productos` con discriminante.** Campos
> de frontera medidos: **1**, y opcional. Ni U1 (obligatoriedad) ni U2 (≥3 o
> >25 %) disparan.

### El alcance, DERIVADO — y corrige a la sección anterior

`solutions-sitemap.xml` filtrado a `/es`: **24 URLs**, no 22. **Dos páginas que
el proyecto no contaba como de este CPT**: `software-de-medicion-calidad-del-aire`
y `kunak-api`.

> ⚠ **CORRIGE al §2e anterior y a `precondicion-1/DECISION.md`:** decían que
> «HOME · SOFTWARE · API son singleton, nada decidido las apunta ⇒ cubo B».
> **Falso para dos de los tres** — SOFTWARE y API son **del mismo CPT** que
> PRODUCTO y CATÁLOGO, o sea de la colección que las dos relaciones apuntan. El
> error fue **citar el censo en vez de derivar el CPT**. Los arquetipos
> construidos sin content type eran **4, no 5** (API es *variante*, no
> arquetipo — `CLAUDE.md` §Páginas clonadas), y **HOME es el único genuinamente
> fuera**.

### Lo medido — 24/24, 0 selectores muertos, control 4/4

| | |
|---|---|
| **plantilla** | **`solutions-template-default et-tb-has-template` en 24 de 24** — **un solo cascarón**, no hay frontera ahí |
| **secciones propias** | **4 · 5 · 6 (×21) · 7** ⇒ composición **por instancia** ⇒ el cuerpo es `blocks` |
| **eje real** | **volumen de contenido, no forma**: 18 páginas de 46–50 módulos sin `blurb` y 5 de 56–106 con `blurb` — **mismo nº de secciones y misma plantilla** |

**La calibración que fija el recuento** (y sin ella sale ×5): §1.3 dejó
**`beneficiosAplicaciones` —un bloque entero que solo SECTOR usa— FUERA** de sus
3 campos de frontera. ⇒ **un kind de bloque no es campo de frontera; lo son las
propiedades.** Por eso `blurb`, `galeria`, `video`, `cta`, `tabla` y `slider` **no
cuentan**, y `descargaPdf` tampoco (es el `href` de un botón que las dos formas
ya tienen).

### El content type

| pieza | en Payload |
|---|---|
| `productos` | **colección**, `slug` único (entra en la guarda del §4 con las demás) |
| **`tipo`** | **`select` con defecto `"ficha"`** · valores `ficha` · `catalogo`. Omitido en el dato cuando coincide. Es el **discriminante**, y su único uso hoy es `accesorios` |
| **`padre`** | **opcional** — el único campo de frontera medido. Lo traen **18 de 24**: `cartuchos-inteligentes/*` (categoría) y `…/metano` (**otro producto**). Relación vs `select` lo decide F2-1 con el enrutado del §4 delante (**PR-SP2**) |
| `seo` | grupo, como en las demás |
| `titulo` · `slug` | obligatorios |
| **`cuerpo`** | **`blocks`** — la unión de kinds del CPT: `text` · `image` · `button` · `toggle` · `blurb` · `slider` · `gallery` · `video` · `cta` · `table`. **Cada instancia usa su subconjunto**; que 18 no usen `blurb` es contenido, no esquema |
| ritmo y retícula de bloque | **definición compartida**, la misma que consumen `MonoModulo` y `articulos-kb` (§2d.1) — *lo que se duplica es el documento, no la definición* |

**El patrón de la casa, aplicado:** cada campo de presentación lleva **defecto
explícito** y se **omite del dato cuando coincide** — `tipo` por defecto
`"ficha"` (23 de 24), `padre` ausente por defecto (6 de 24 lo omiten).

### Las dos relaciones que la apuntan, cerradas

| dónde | antes | **ahora** |
|---|---|---|
| **§1.4 · SECTOR** | `soluciones` → «la colección de productos» (sin modelar) | **`relationTo: 'productos'`**, filtrable por `tipo` |
| **§2b · grupo C** | `soluciones` → «la colección de productos (la del §1.4)» | **`relationTo: 'productos'`** |

**No hacen falta relaciones polimórficas** —el mecanismo que §1.5b reserva para
`sectores`/`monograficos`—: al ser **una** colección, las dos apuntan al mismo
sitio y el `tipo` acota si hace falta.

### ✅ 2e.1 · `padre` — DECIDIDO `select`, y la binaria que §2e escribió NO contenía la respuesta (2026-08-03, F2-1 bloque 2)

§2e dejó escrito: *«Relación vs `select` lo decide F2-1 con el enrutado del §4
delante (PR-SP2)»*. Al ir a decidirlo con la medida delante apareció que **las
dos opciones que la frase ofrece fallan las dos**, y eso es lo primero que hay
que decir:

| padre medido | n | ¿es un documento de `productos`? |
|---|---|---|
| `sensor-de-calidad-del-aire` | 1 | **SÍ** — es una de las 24 URLs del CPT |
| `cartuchos-inteligentes` | **17** | **NO** — no aparece como URL propia en `solutions-sitemap.xml` |

> **Una relación pura dejaría 17 de 18 hijos apuntando a un documento que no
> existe.** Y una relación polimórfica exigiría **inventar una colección
> `categorias-productos` con un solo término que ningún censo respalda** — que es
> literalmente el arreglo falso de §1.5b Razón 1: *un campo (aquí, una colección)
> que existe porque el modelo lo necesita, no porque el contenido lo tenga*.

**Decidido: `select` con los dos valores medidos, opcional y sin defecto**
(6 de 24 no lo traen: **la ausencia ES el valor por defecto**).

**Por el precedente de la casa, no por comodidad.** Un **segmento de ruta** ya se
modela así dos veces en este documento —`prefijo` del caso (§2b · CMS-1, 2
valores) y del documento científico (§2.4, **tres**)—, siempre como campo con
defecto explícito omitido cuando coincide. `padre` es estructuralmente lo mismo:
el segmento anterior al slug. Y la asimetría de deshacer va a favor: `select` →
relación es añadir la colección y mapear **2** valores; relación → `select` sería
borrar una colección con contenido ya escrito.

**PR-SP2 no se cierra: se afila.** Reapertura escrita — **si aparece un segundo
padre que sea categoría, o si `cartuchos-inteligentes` estrena página propia,
esto pasa a relación (polimórfica)**, y la migración es de dos valores.

⚠ Y la lección de método, que vale más que el campo: **una pregunta
pre-registrada como binaria puede no contener su respuesta.** Aquí la binaria era
«relación vs select» y la medida decía «los dos padres no son del mismo tipo» —
un tercer eje que ninguna de las dos opciones nombraba. Escribir la binaria
estuvo bien; **cerrarla sin volver a mirar el dato** habría dado una relación rota
en 17 documentos.

### SIN PROBAR, anotado y no cableado

- **PR-SP1 · `accesorios`** (n=**1**): única con tablas (10) y única sin slider.
  Con n=1 **no se separa «catálogo es otra forma» de «un autor que maquetó con
  tablas»**. Entra con `tipo: "catalogo"`; **una segunda página de catálogo
  reabre la pregunta**.
- **PR-SP2 · el padre**: categoría en 17 casos, **otro producto** en 1.
- **PR-SP3** · `producto` y `catalogo` tienen **n=1**: su «universal» es
  «presente». **Ninguna afirmación de plantilla sale de ellas.**

### ⚠ El agujero que esta sección cierra, y el que deja abierto

**Cerrado**: `productos` ya no es una incógnita con dos relaciones apuntándola.
**Abierto y NO bloqueante**: **HOME** sigue sin content type — es singleton, nada
decidido la apunta, y modelarla después es **añadir** (cubo B).

### ✅ 2e.2 · CMS-PR3 — el documento del CPT **SIN PÁGINA PROPIA** (2026-08-13, F3, tanda de DESBLOQUEO)

**Qué lo trajo.** `qa:productos-hueco` midió que los 57 casos referencian **19**
slugs de producto y que **3 no son ninguna de las 24 URLs** del CPT: son
documentos **en inglés** que el editor eligió en la relación `soluciones` de un
caso español, y su evidencia es la SERVIDA en el panel:

| `data-id` | rótulo | `href` del botón «Ver más» |
|---|---|---|
| `accesories` | Accesorios | `…/es/accesorios/` |
| `air-cloud` | AIR Cloud · *Air quality software* | `…/es/software-de-medicion-calidad-del-aire/` |
| `ozone-2` | Ozone | `…/?post_type=solutions&p=56674` — **sin permalink** |

**Por qué NO son alias, y es medida.** `air-cloud` sirve una ficha **distinta**
de la de `software-…`: en inglés, con sus propias viñetas y con la errata
`condifential`. Aliasarlos pintaría la ficha española donde el original pinta la
inglesa — se pierde fidelidad **en el panel visible**, no sólo en el `href`.

**La decisión, y sus dos consecuencias.**

| campo | regla |
|---|---|
| **`pagina`** | `select` `propia \| ninguna`, **`required` SIN defecto** |
| **`hrefServido`** | obligatorio si `ninguna`, **prohibido** si `propia` |
| **`seo.title`** | obligatorio si `propia`, **prohibido** si `ninguna` |

**El discriminador es un CAMPO, no una ausencia.** Derivarlo de que falte
`hrefServido` —o `seo.title`— borraría la diferencia entre *«no tiene página»* y
*«nadie lo rellenó»* (§regla 6). La **ida** lo deriva del DATO —*¿el último
segmento del `href` servido es el `slug`?*— y lo **escribe**; nadie aguas abajo
lo infiere. Medido: **16 `propia` · 3 `ninguna`**.

**`seo.title` se ESTRECHA, no se invierte.** Su `required` está respaldado por
`qa:solutions-seo` —`title` **24/24**— y ese 24 son **URLs**, no documentos: los
tres de aquí **no estaban en el dominio donde la regla se derivó**. Es
§F2-5-ESCALON-ETIQUETAS aplicada tal cual.

**`hrefServido` no estrena regla de rutas: la consume.** Es el valor medido; al
pintarlo se le aplica la de siempre —construido → local, no construido →
original—, así que `…/es/accesorios/` y `…/es/software-…/` **localizan** y
`?post_type=solutions&p=56674` se queda verbatim, que es lo que la regla dice
para un destino sin clonar.

**Lo que la sostiene, y son las cuatro condiciones con las que se aceptó:**

1. discriminador explícito → `pagina` `required` sin defecto;
2. **negativo por los DOS lados** → `qa:pagina-propia`, **6 cuadrantes** contra
   Payload de verdad (falta ⇒ muere · **sobra ⇒ muere** · discriminador ausente
   ⇒ muere), negativo **3/3** con `un-solo-lado` y `discriminador-relleno`;
3. **NO-OP sobre los 9 ya modelados** → migración con guarda de recuento;
   `qa:cms-roundtrip` **285/285** y `npm run check` **249 rutas · 190 slugs**,
   los mismos números que antes;
4. la errata `condifential` **viaja tal cual** (regla 1).

⚠ **Ficha abierta, no bloqueante — §CPT-IDIOMAS.** El CPT **mezcla idiomas** (3
de los 19 referenciados) y el modelo **no tiene dimensión de idioma**. CMS-PR3 no
se la inventa: los trata como documentos sin página, que es lo que lo servido
dice que son. Si F3-4 encuentra lo mismo en otra familia, la decisión está
planteada con su número.

⛔ **Y no está sembrada todavía**: §DATOS-P-MEDIA — 5 ficheros de imagen ausentes
paran el cambio de fuente, y capturarlos exige red.

## ~~⚠ 2e-bis · EL AGUJERO (histórico, cerrado arriba)~~ (2026-08-03)

Acta: `docs/research/precondicion-1/DECISION.md` (pre-registro `cf25baf`,
anterior a clasificar). Salió de reformular la **precondición 1 de F2-1** de
frase binaria a la pregunta que de verdad gobierna: *¿queda algo sin construir
que pueda **forzar** un campo dentro de una colección ya decidida?*

> **`productos` se cita DOS veces en este documento y las dos como DESTINO DE
> RELACIÓN. No tiene ni un campo escrito en ninguna parte.**

| dónde | qué dice |
|---|---|
| **§1.4 · SECTOR** | `soluciones` → **relación a la colección de productos** |
| **§2b · grupo C** | `soluciones` → **relación 0..n a la colección de productos (la del §1.4)** |

**Los content types escritos son seis** —§1.4 SECTOR · §1.5 MONOGRÁFICO · §2
grupo A · §2b grupo C · §2c términos · §2d.1 `articulos-kb`— y **faltan cinco
arquetipos CONSTRUIDOS**: HOME · **PRODUCTO** · **CATÁLOGO** · SOFTWARE · API.
El §1 lo dice desde el primer día en su propio título («los **dos** content
types medidos») y nunca se completó.

**El reparto no es uniforme, y es lo que hace que solo uno bloquee:**

| arquetipo | veredicto | por qué |
|---|---|---|
| **PRODUCTO / CATÁLOGO** (CPT `solutions`) | **BLOQUEA F2-1** | hay **relación decidida apuntándolo** desde dos colecciones, y **20 instancias sin medir** (17 cartuchos + 3 fichas) que pueden **partirlo en dos colecciones** — con lo que el campo `soluciones` cambiaría en las dos |
| HOME · SOFTWARE · API | **no bloquea** | páginas singleton; **nada decidido las apunta**. Modelarlas después es **añadir**, no cambiar |

**Por qué no se vio antes, y es la lección:** la precondición decía «biblioteca
cerrada», y **PRODUCTO está construido** desde julio. Lo que falta no es la
página: es su content type. **Un criterio que mide construcción no puede ver un
hueco de modelado.**

**Y por qué no vale modelarlo desde la instancia que hay** —`CENSO-ARQUETIPOS.md`
§2 ya lo escribió—: *«los otros seis tienen **una instancia cada uno**, así que
de ellos todavía no se sabe qué es plantilla y qué es campo»*. Es la FAMILIA DE
CALIBRACIÓN, y **`anchoPct` la cobró el mismo día**: con **cuatro** instancias de
SECTOR, el `90 %` vivía en **una sola**.

**Lo que lo cierra, acotado:** recon de las 20 dudosas (*«recon, no build …
barato»*, censo §3) → decidir si `productos` es una o dos colecciones → escribir
el content type aquí → F2-1 congela.

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

### ⚠ 3.1c · TRES features de la whitelist NO EXISTEN en la versión instalada (2026-08-03)

§3.1 lo pedía por escrito —*«los identificadores exactos hay que confirmarlos
contra la versión instalada»*— y al confirmarlos contra
**`@payloadcms/richtext-lexical@3.87.0`** salieron tres huecos. El inventario de
features de esa versión es: `Paragraph · Bold · Italic · Underline ·
Strikethrough · Subscript · Superscript · Heading · UnorderedList · OrderedList ·
Checklist · Link · Blockquote · Upload · HorizontalRule · Blocks · Align ·
Indent · InlineCode · Relationship · TextState`.

| feature de §3.1 | evidencia | qué pasa |
|---|---|---|
| **tabla** | **35 páginas** | **no hay `TableFeature`.** §3.4 ya estaba ABIERTA; ahora además se sabe que la opción «nodo de Lexical» **no está disponible de serie** — lo que empuja la respuesta hacia el `block`, pero **no la cierra**: eso es una decisión, no un hallazgo |
| **`mark`** | 1 página | sin feature. Lo más cercano es `TextState`, que no es lo mismo |
| **`small`** | 1 página | sin feature |

> ⚠ **Y la razón de escribirlo en vez de habilitar lo que hay:** una ausencia
> **por decisión** y una ausencia **por inexistencia** se leen igual en el código
> —el feature no está en la lista— y **no significan lo mismo**. §3.1 tiene su
> propia tabla de *«fuera de la whitelist, con evidencia»* (código, `dl`,
> formularios): éstas **no** pertenecen ahí. Están dentro de la whitelist y sin
> vehículo.

**Los otros dos que parecían huecos y no lo son:** `embed` y `video` **sí** están
expresados —como **bloques tipados** dentro del campo rico (`BLOQUE_EMBED`,
`BLOQUE_VIDEO`), que es exactamente lo que §3.1 dice de `BlocksFeature`: *«el
vehículo de los nodos tipados de §3.3»*. Y **T1 está implementado**: el nodo
enlace lleva `variante: "texto" | "boton"` con defecto, que es lo que corta el
acoplamiento con `<a class="et_pb_button">` en el 80 % del corpus.

### ✅ 3.1d · RESUELTA (2026-08-04, F2-1 bloque 3) — el corpus entra como HTML, y el sitio de aterrizaje ES el campo definitivo

**La decisión no se tomó aquí: se APLICÓ.** CMS-0e está vigente y decidida desde
el 2026-07-30; lo que faltaba era dónde aterriza. El punto de congelación
tampoco era «la primera entrada importada», como decía el aviso de abajo: es **la
migración inicial de esta tanda**, que es la que escribe las columnas. Por eso se
resuelve antes de ella y no en F2-2.

#### El discriminador no es criterio mío: es el TIPO MEDIDO

Y estaba escrito en `types/kunak.ts` desde antes de traducir. La traducción del
bloque 2 fue la que se desvió, no el modelo:

| tipo medido | qué es | destino | evidencia |
|---|---|---|---|
| **`CampoRico = string`** | *«HTML del contrato del campo rico (§3.1)»* | **HTML crudo** | 209/209 censadas, 43 etiquetas |
| **`CampoRicoEnLinea = string`** | *«restringido a marcado de línea: `strong`, `b`, `i`, `br`, `sub`, `sup`, `a`»* | **HTML crudo de línea** | §2b.1 (1) · C-SP9 |
| **`MonoInline = string \| MonoTrozo[]`** | **no** es ninguno de los dos: la unión que §1.5 dejó en dos formas | **sigue Lexical** | §1.5c, 56 `<strong>` |

Los dos primeros **son `string`, o sea HTML**. Así que la frontera de `CLAUDE.md`
—*«a partir del contenedor de contenido […] un solo campo HTML, con un contrato
de qué tiene que admitir»*— y CMS-0e piden **lo mismo**, y el modelo medido ya lo
decía. `MonoInline` queda fuera porque **no hay importación que aterrizar**: es
dato tipado que el clon transcribió a mano en `lib/monografico.ts`, no un blob de
WordPress, y el alcance de CMS-0e es *«el cuerpo entra crudo»*.

#### Las dos formas que §3.1d dejó abiertas: NINGUNA hace falta

| forma abierta | por qué NO |
|---|---|
| campo hermano `cuerpoHtml` **temporal** | resolvía el aterrizaje a costa de **dos fuentes de verdad** y de un campo que retirar |
| **staging fuera de Payload** | dejaba las entradas sin existir en el CMS, así que **las relaciones no se pueden crear** en el mismo paso |

Las dos daban por hecho que el destino final es Lexical y el HTML un tránsito.
**No lo es:** el tipo medido *ya* es `string`, así que **el campo definitivo y el
sitio de aterrizaje son el mismo objeto**. Cae el compromiso entero.

#### El acta campo a campo — los 12 campos ricos, con su veredicto

| campo | era | es | por qué |
|---|---|---|---|
| `entradas-blog.cuerpo` · `terminos-kunakpedia.cuerpo` · `documentos-cientificos.cuerpo` | `editorRico` | **`campoHtml`** | `CampoRico` · 209 páginas del corpus |
| `casos.necesidad` · `.solucion` · `.resultados` | `editorRico` | **`campoHtml`** | `CampoRico` · 57/57 |
| `casos.detalles.parametros` | `editorRico` | **`campoHtml`** | `CampoRico` · trae `ul li sub b p`, y su trampa del `<ul>` dentro de `<p>` (§2b.1 · 2) |
| `faqs.cuerpo` | `editorRico` | **`campoHtml`** | `CampoRico` · perfil `p ul li a span br sub` |
| `productos.cuerpo[toggle].contenido` | `editorRico` | **`campoHtml`** | contenedor de contenido del CPT |
| `casos.destacado` | `editorEnLinea` | **`htmlLinea`** | `CampoRicoEnLinea` · 49/57, `<strong>` y `<br>` |
| **`productos.bullets[].texto`** | `editorNegrita` | **`htmlLinea`** | ⚠ **DEFECTO — ver abajo** |
| `productos.cuerpo[blurb].texto` · `[slider].diapositivas[].texto` | `editorNegrita` | **`htmlLinea`** | corpus del CPT, **inventario sin censar** ⇒ va al campo que **no puede perder** |
| **`MonoInline`** (`BLOQUE_P.p` · `BLOQUE_UL.ul[].texto`) | `editorNegrita` | **`editorNegrita`** | ✅ **se queda en Lexical** — dato tipado, no corpus |

`editorEnLinea` **se borra**: se queda sin consumidores y una declaración muerta
se pudre (regla 4 aplicada al esquema). `editorRico` **se queda**, y con su papel
por fin nombrado: es la **primera** de las dos listas que §3 abre —*«lo que el
editor permite escribir de aquí en adelante»*—, o sea el editor por defecto de la
config para contenido **nuevo**. El corpus es la segunda lista y ya no pasa por
él.

#### ⚠ Y la evaluación campo a campo destapó un DEFECTO del bloque 2, que no daba error

> **`productos.bullets[].texto` estaba en `editorNegrita` —Párrafo + Negrita y
> nada más—, y el corpus trae `R<sup>2</sup> >0,8` y `1 μg/m<sup>3</sup>`.** El
> campo **no podía expresar `<sup>`**, y el comentario justo encima declaraba las
> fórmulas: *«Admiten marcado en LÍNEA […] que son fórmulas, no adorno»*.

Es *documentado no es conectado* (regla 3) en su forma de esquema, y de las
caras, porque **las dos comprobaciones que existían pasaban**:

| comprobación | por qué no lo vio |
|---|---|
| `payload-types.ts` compila | los tipos se generan **desde** las colecciones: un editor demasiado pobre produce tipos perfectamente consistentes con él |
| `qa:cms-campos` · 10/10 · 0 sin contraparte | compara **rutas de campo**, y la ruta `bullets.texto` no cambió. Lo dice su propia salida de hoy: `medidas/cms-campos.json` **idéntica a la congelada** tras el cambio |

**El hueco que esto nombra, y queda abierto:** ninguna guarda mira el **TIPO de
la hoja**, solo su nombre. Un campo puede estar presente, tener el nombre
correcto y **no poder contener su dato medido**. Se ficha como **CMS-SP-TIPO** en
§7 — no se cierra hoy, porque cerrarlo es una sonda nueva y esta tanda ya trae la
suya.

**La causa mecánica, para que no vuelva:** `inline()` se prestó fuera de
`MonoInline`. Nombraba *«texto que puede llevar negrita»* y se usó para *«texto
rico de línea»*, que son cosas distintas — siete etiquetas contra una. El
comentario de `inline()` ahora lo dice como restricción, no como costumbre.

#### El contrato, escrito como dato y no como prosa

`ETIQUETAS_CENSADAS` en `campos/comunes.ts` lleva **las 43** del censo 209/209.
Es lo que el campo tiene que **ADMITIR**; no es una whitelist que se imponga
—`campo-rico.spec.md` lo dice de las ausentes (*«que no aparezcan no significa
que el campo pueda prohibirlos»*) y vale igual del otro lado—.

**La única prohibición es `<script>`, y tampoco es mía:** §3.3 la escribe como
regla (*«`script` no entra»*) y **T4** la ejecuta al importar (*«ninguno
sobrevive como script»* — 17 scripts a nodo-embed tipado (7) o a eliminación con
sustitución (10)). Va como `validate` y no como comentario **por la regla 3**: si
T4 falla o se olvida, el alta tiene que **caer**, no colarse.

#### Lo que esto desbloquea de rebote

**§3.1c deja de bloquear.** Los tres huecos de `richtext-lexical@3.87.0` —`table`
(35 páginas), `mark`, `small`— eran del editor del **corpus**, y el corpus ya no
pasa por el editor. **§3.4** (¿la tabla es nodo de Lexical o block?) sigue
ABIERTA como decisión de producto, pero **ya no es precondición de importar**.

#### La verificación, con sus dos pasos separados

| paso | resultado |
|---|---|
| **frescura** — ¿es el esquema de ahora? | `payload-types.ts` regenerado: **−195 / +52 líneas**. Los blobs de Lexical colapsan a `string` |
| **efecto** — ¿el número se movió? | `necesidad: string` · `cuerpo: string` · `destacado?: string \| null` · `bullets[].texto: string`. **El tipo generado por Payload es ahora literalmente el tipo medido** |
| `qa:cms-campos` | ✅ 10/10 tipos · 0 sin contraparte · 0 problemas |
| `qa:cms-campos-neg` | ✅ **5/5**, cada sabotaje por su invariante |
| `typecheck` de `@kunak/cms-config` | ✅ exit 0 |

---

### ~~⚠ 3.1d · el enunciado original (2026-08-03), conservado~~

CMS-0e decidió: *«el cuerpo entra como **HTML crudo** y se convierte por entrada,
no de golpe al importar»*. La traducción a Payload deja ver que esa frase
**necesita un campo que hoy no existe**:

> Un campo `richText` de Payload guarda **JSON de Lexical**, no HTML. Así que el
> importador no tiene dónde dejar el HTML crudo mientras espera su conversión —
> y el tipo medido (`CampoRico = string`, o sea HTML) no tiene, hoy, expresión
> donde vivir sin convertir.

**No bloquea el bloque 2 y no se resuelve aquí:** el esquema del cuerpo es
`richText` con la whitelist del §3.1, que es lo decidido, y eso está construido.
Lo que falta es **de migración**, o sea **F2-2**, y ahí se decide entre las dos
formas — anotadas con lo que cuesta cada una para que la tanda que las mire no
empiece de cero:

| forma | a favor | en contra |
|---|---|---|
| campo hermano `cuerpoHtml` **temporal** en las colecciones con cuerpo | el documento existe en Payload desde el minuto uno y se convierte entrada a entrada, que es la letra de CMS-0e | mete en el esquema un campo que hay que quitar después, y mientras esté hay **dos fuentes de verdad** para el mismo cuerpo |
| **staging fuera de Payload** (tabla propia o ficheros) y alta solo al convertir | el esquema queda limpio y sin campo que retirar | las entradas no existen en el CMS hasta convertirse, así que **las relaciones que las apunten** no se pueden crear en el mismo paso |

⚠ Lo que **no** vale es dejarlo sin decidir y empezar a importar: la primera
entrada importada fija la respuesta de facto.

> ✅ **Resuelto arriba. Y el aviso de esta última línea se quedó corto**: el
> punto de congelación **no es la primera entrada importada, es la primera
> MIGRACIÓN** — es la que escribe las columnas, y va antes que cualquier entrada.
> Por eso §3.1d se cerró en F2-1 y no en F2-2.

### 3.2 · TRANSFORMACIONES DE MIGRACIÓN

Lo que hay que hacerle a las 209 al importar. **Ninguna es opcional.**

> ✅ **LAS DIEZ ESTÁN ESCRITAS Y CON NEGATIVO (2026-08-05).** T1–T8 desde el
> bloque 2; **T3b y T4b**, que llevaban tres tandas nombradas y sin escribir,
> desde hoy. `scripts/seed/transformaciones.mjs` · `npm run cms:extractor` ·
> negativo **11/11** (un sabotaje por transformación, cada uno cayendo por SU
> postcondición, más el control). Congelada: `medidas/extractor-corpus.json`.
>
> **El orden es parte del contrato**, y las dos nuevas obligan su sitio **por
> dato, no por preferencia**: `T8 · T1 · T2 · T3a · T3b · T4b · T4a · T5 · T6 ·
> T7`.
>
> · **T3b después de T2 y T3a** — T2 encuentra el ancho absoluto *por* la clase
>   `wp-caption`, y 415 de los 446 contenedores traen `aligncenter` en el crudo,
>   que es la diana de T3a. Adelantar T3b desactivaría a las dos **sin que nada
>   diera error**;
> · **T4b ANTES de T4a** — la referencia al PDF de 6 de los 8 visores FB3D vive
>   **dentro del `<script>`**, así que después de T4a ya no existe.
>
> ⚠ **«LAS DIEZ» ES DE 2026-08-05 Y NO SE ACTUALIZA A MANO** (§regla 9: un
> recuento recordado envejece **contra** el repo). El número de la cadena lo dice
> `TRANSFORMACIONES.length` en `scripts/seed/transformaciones.mjs`; el del
> registro, esa cadena **más las que se declaran fuera de ella con su razón**
> —hoy **T11**, §3.2d—. Se deriva, no se cita: `node -e` sobre el módulo, o el
> propio informe de `cms:extractor`, que las imprime una por línea.

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
| **T12** | el **descifrador de correo de Cloudflare** — `href="/cdn-cgi/l/email-protection#hex"` y `class="__cf_email__" data-cfemail="hex"` | **se descifra a `mailto:` al importar.** Cloudflare ofusca los `mailto:` del autor y sirve `email-decode.min.js`, que **lo deshace en el cliente**: el visitante nunca ve el marcado ofuscado. El clon transcribió el marcado y **no** el script, así que servía **4 hrefs · 5 páginas · 6 apariciones**, todos **404** — es §*un marcado ofuscado más su descifrador son UNA UNIDAD; media unidad no es una versión más limpia, es un defecto que el original no tiene*, y `CLAUDE.md` ya lo tenía con su precedente («quitar el script y dejar el marcado convirtió 2 enlaces vivos en 404 permanentes»). **Misma familia que T8** y misma razón de fondo: lo inyecta la capa de entrega, no el autor. Tres formas censadas en el corpus —`#hex` + `<span>` ofuscado · `#hex` con texto del autor · **`__cf_email__` en el propio `<a>` SIN `#`**, que es la que el rótulo «4 hrefs» escondía—. Va **junto a T8 y antes de T5**, porque T5 desenvuelve `<span>` sueltos y se comería el `data-cfemail` antes de descifrarlo. Un hex que no descifra a un correo **se deja intacto** (§regla 6: la ausencia se rechaza, no se sustituye): mejor el 404 que la sonda caza que un `mailto:` inventado. Entra en **las dos cadenas**, y en `TRANSFORMACIONES_F33` **por medición** —3 filas de `paginas_blocks_texto_pagina.html`, diana > 0 derivada del corpus—, no por simetría. Verificación con control de idempotencia y negativo por los dos lados: `docs/research/cola-larga/derivaciones/t12-cloudflare-121.{mjs,log}` (121.ª) |

#### 3.2a-bis · T7 — el CONTRATO cambia el 2026-08-13, en dos mitades y las dos por precedente

**Ninguna de las dos es criterio nuevo: son reglas del repo que T7 no aplicaba**
(§DATOS-C-PIPELINE · PASO 1 y PASO 4 de `PENDIENTES-QA.md`).

| mitad | antes | ahora | la regla que ya lo decía |
|---|---|---|---|
| **el conjunto de destinos** | `ctx.rutas` = manifiesto del build **+ todas las URL del corpus** | **SÓLO el manifiesto del build** | §F2-3-HREF-DERIVADO, salida **(b)**, adjudicada el 2026-08-07. *Una URL capturada no es una ruta publicada* |
| **el `target`** | se reescribía el `href` y **el `target="_blank"` se quedaba** | al localizar, **el `target` se quita** | `CLAUDE.md` §Regla de rutas locales: *«`target="_blank"` **solo si el destino es externo**»* |

**El efecto, medido sobre los 209 cuerpos y no leído del diff:**

| | antes | después |
|---|---:|---:|
| `<a href>` totales | 3318 | **3318** — no se pierde ninguno |
| enlaces **locales** con `target="_blank"` | **1788** | **2** |
| rutas locales distintas | 153 | 103 |
| destinos que **el build no emite** | **53** | **2** |

Los 2 que quedan conservan su `target` **con razón**:
`/cdn-cgi/l/email-protection` es infraestructura de Cloudflare del sitio original
—**se escribe local y no es nuestro**— y lo decide `ctx.rutas`, no la forma del
`href`.

**Y la mitad de contrato que hay que saber leer:** el conjunto **crece solo**.
Cuando se siembre una colección, sus rutas entran en el manifiesto del build
siguiente y sus destinos pasan a localizarse **sin tocar una línea** — es lo que
convierte los 89 enlaces a `/casos-de-exito/*` en trabajo de datos y no de
código.

**Dos postcondiciones, no una**, y la segunda es la que no existía: *(1)* no
queda ningún `href` al original de una ruta que sí publicamos; *(2)* **no queda
ningún enlace a una página nuestra con `target="_blank"`** — lo hubiera
reescrito T7 o hubiera llegado ya local del original. La segunda cazó 3 casos que
llegaban locales del original, y obligó a que T7 haga **una sola pregunta en los
dos lados**: *«¿este destino lo publicamos nosotros?»*.

**Lo que NO se toca, declarado:** `rel="noopener"` sobrevive (**37 casos**).
Existe *por* el `target` y sin él es inerte, pero la regla nombra el `target` y
sólo el `target`; quitarlo sería ampliar el alcance de una decisión ajena — el
mismo argumento por el que T3b deja `alignnone` y `size-full`.

**La MARCA de lo que se deja fuera.** §Regla de rutas locales pide anotar el
destino que no se localiza; en código eso es un comentario, y **en un cuerpo rico
no hay dónde ponerlo sin cambiar lo que se sirve**. Así que la marca es la
congelada: `medidas/extractor-corpus.json` → `t7.porDestino`, **830 enlaces en 80
destinos**, contable y auditable. Ficha del hueco: §F3-COLA-DESTINOS.

#### 3.2c · T9 — contenedores de TRANSPORTE ajenos se desenvuelven (2026-08-13)

> **Se desenvuelven los contenedores de TRANSPORTE ajenos —los que no aportan
> contenido ni estilo servido—, conservando su contenido.**

**Es un enunciado de CLASE, y eso no es un detalle de redacción: es lo que
separa esta transformación de un parche.** Nació de un caso
(`castel-d-ario`) cuyo campo `Parámetros` trae **el DOM de una conversación de
ChatGPT pegado en el editor** — un `<article>` con 9 `<div>` anidados alrededor
de un `<ul>` de tres viñetas —, y la primera pregunta fue *«¿cuántas páginas
traen `<article>`?»*: **1 de 309**. Correcta, y equivocada. Censada la CLASE
(`npm run qa:dom-ajeno`, 6 familias): **10 de 309**.

**El precedente es T8**, literal: *«ese `type` no lo escribió nadie, lo inyecta
la capa de entrega — migrarlo verbatim sería importar un artefacto del CDN como
si fuera contenido»*. Aquí lo pegó una persona, pero **no como contenido**: es el
envoltorio de la UI de la aplicación de la que copió.

**El DISCRIMINADOR, que es todo.** Un contenedor se desenvuelve **sólo si las dos
cosas**:

1. está **dentro de una raíz ajena** — un elemento con marcadores de una
   aplicación de origen (`data-testid="conversation-turn…"`,
   `data-message-author-role`, `class="… prose …"`, `Mso*`,
   `docs-internal-guid`, `notion-`). Fuera de esa raíz T9 no toca nada;
2. **no aporta estilo SERVIDO** — ninguna de sus clases tiene regla en el CSS que
   el documento se trae, y no lleva `style=` en línea.

La 2 se **deriva del propio documento** (§*la salida servida incluye el CSS que
el documento se trae*), no de una lista escrita. Y es lo que hace el **negativo**
posible: `t9-sin-discriminador` **ciega** `clasesConEstilo` e inyecta un
envoltorio **con render**; T9 se lo lleva y el canario lo caza. **Exit 2 cegado ·
exit 0 con el discriminador.** Sin ese caso T9 sería un `replace` de `<div>` con
una historia bonita.

**Orden:** después de T4b y **antes de T5**. T5 deshace envoltorios *sin
atributos* y los de transporte llegan **con sus clases puestas**, que es justo lo
que T9 tiene que juzgar. No se mueve antes de T3a, aunque la simetría lo sugiera:
rompería la restricción *«T3b después de T2 y de T3a»*, que está medida en 415 de
446 contenedores. **Una restricción documentada pesa más que una simetría.**

**Lo que T9 NO hace, con su número:** no toca **atributos** ajenos sobre
etiquetas legítimas. `data-start`/`data-end` de un renderizador de markdown
aparecen en **10 páginas** sobre `<li>` y `<p>`, que son contenido de verdad —
y ahí se descubrió que **la whitelist del §3.1 censa ETIQUETAS, no ATRIBUTOS**,
así que los atributos ajenos pasan en silencio. Desenvolver es una cosa y limpiar
atributos es otra; la segunda no está decidida y **no se cuela dentro de la
primera**. Ficha: §DATOS-DOM-AJENO.

**Estado del NO-OP: ✅ COMPLETO desde el 2026-08-13, y la segunda mitad se pagó
POR MECANISMO en vez de por píxel.**

- ✅ contra el clon, **byte a byte** — 0 aplicaciones y 0 de 209 cuerpos del
  grupo A con bytes distintos;
- ✅ contra el **original**: `npm run qa:t9-css` cruza **las 44 clases** del
  envoltorio —derivadas *corriendo T9*, no escritas— contra **los 8 canales de
  CSS que el documento se trae**: el `<style>` en línea (231 508 B) **más las 7
  hojas enlazadas** (345 315 B), ya capturadas en `corpus/css/`. **0 de 44 con
  regla**, con CONTROL vivo (`.et_pb_section` 26 · `.et_pb_row` 254 ·
  `.et_pb_text` 19) y negativo **4/4**.

> **Y es una respuesta más fuerte que un Δ0**: no dice *«no se observó
> diferencia»* —lectura que en esa ruta sería SIN PROBAR, porque no tiene campaña
> de ruido— sino que **no hay mecanismo** por el que pudiera haberla. Sin regla
> servida no hay render, y sin render desenvolver no puede mover un píxel. Es el
> eje *con mecanismo y servido en los dos lados*.

⚠ **Con su alcance:** el discriminador que corre en el extractor sigue leyendo
sólo el `<style>` en línea; lo medido es que en la única página que ejercita T9
las enlazadas **no habrían añadido ninguna**. Un arquetipo nuevo con DOM ajeno
vuelve a pasar por `qa:t9-css`. (Y §regla 9: «10 clases» era un número recordado
— derivado son **44**.)

#### ✅ 3.2d · T11 — `data-teams` se LIMPIA, y `ATRIBUTOS_CENSADOS` **no se amplía** (2026-08-23, 98.ª tanda)

> ✅ **DECISIÓN DEL PROPIETARIO (D1, 2026-08-22), no derivación de esta tanda.**
> Las dos salidas se publicaron con su cardinal en `PENDIENTES-QA.md`
> §F3-3-BLOQUEOS-DE-SIEMBRA (97.ª) —alta en el censo con su evidencia, o
> transformación de importación— y se eligió **la transformación**.

**Qué es.** `<span data-teams="true">` envolviendo un párrafo en `/es/empresa/`:
la huella de **texto pegado desde Teams** en el editor. Es **contenido** —la
única cosa de todo el barrido que lo era— y **no es una etiqueta**, así que la
whitelist del §3.1 no lo veía: el que lo paró fue `ATRIBUTOS_CENSADOS`.

**El cardinal, derivado:** **1 fichero de 788** bajo `corpus/`, **1 ocurrencia**,
portadora `span`, valor `"true"`, **inerte** en las cuatro familias que el censo
mide a cero —manejador `on*` · `javascript:` · `data:` URI · `srcdoc`—
(`derivaciones/atributo-teams-f33.log`).

##### Por qué NO se amplía `ATRIBUTOS_CENSADOS` — tres razones, y ninguna es de gusto

1. **Es la whitelist de SEGURIDAD de cinco colecciones verificadas.** `campoHtml`
   la consume en `entradas-blog`, `terminos-kunakpedia`, `documentos-cientificos`,
   `casos`/`faqs` y ahora `paginas`. Un alta ahí **no es un alta local**: cambia
   el contrato de todo lo que ya pasó por él;
2. **lo que se limpia está MEDIDO como inerte, así que la salida servida no
   cambia.** `data-teams="true"` no ejecuta, no navega y no pinta — y por eso
   quitarlo **es fidelidad**, no una desviación: §*lo que se replica es lo que el
   navegador hace con lo servido*, y con esto el navegador no hace nada. El
   listón de §8 (Δ0 contra el original) **se mantiene entero**;
3. **y el alta abre una puerta que la limpieza no abre.** Admitir un atributo de
   otra herramienta en el censo dice *«los atributos de pegado son contenido»*, y
   eso es una **CLASE** que nadie ha medido. La transformación dice sólo *«este
   atributo se va»*, que es exactamente lo que hay medido.

> ⚠ **Y el alcance se declara, porque sin él este uno se lee como una clase:**
> T11 limpia **UN atributo**, no la familia «residuo de pegado del editor».
> Cuántos hay de esa familia en el corpus **sale SIN MEDIR — que no es 0**
> (`atributo-teams-f33.log` §ALCANCE).

##### El NO-OP, medido por IDENTIDAD DE BYTES y no argumentado

`derivaciones/t11-noop-f33.{mjs,log}` **aplica** T11 a los **788** `.html` de
`corpus/` —§*cuando el cambio se pueda aplicar, aplícalo y mide*— y compara la
salida con la entrada byte a byte:

| | n |
|---|---|
| ficheros que T11 toca | **1** (`fase-3/sueltas/empresa/index.html`, −18 chars) |
| ficheros **idénticos byte a byte** | **787** |
| controles sintéticos de las formas vecinas | **6** — `data-teamsx`, `xdata-teams`, `data-team`, el literal dentro del texto (los 4 intactos) + las 2 formas servidas |
| control POSITIVO (el patrón no está muerto) | ✓ |

Un censo del atributo **no podía** contestar esto: sólo cuenta apariciones, y la
pregunta era si la regex **casa de más**. Eso sólo lo ve aplicarla.

##### ⚠⚠ T11 NO está en `TRANSFORMACIONES`, y es una MEDIDA

La cadena `TRANSFORMACIONES` la corre `extractor.mjs` sobre el `post_content` del
**grupo A** (209 cuerpos). Ahí la diana de T11 es **0**: el fichero con
`data-teams` no es `post_content` de nadie. Y `extractor.neg.mjs` desactiva una T
por corrida **y exige que su postcondición muerda**; con diana 0 informa **SIN
DIANA** y sale rojo — que es lo correcto (§regla 8a).

> **Meterla ahí sería el tercer caso de §regla 21**: el sabotaje muerde, la sonda
> está bien y **el dominio no tiene con qué ejercitar el caso**. Eso no es «roto»
> ni «probado»: es **SIN PROBAR**, y un SIN PROBAR en verde se lee como probado.

Vive en **`TRANSFORMACIONES_F33`**, la cadena de la cola larga, y su negativo
está donde **sí** hay diana: `extractor-f33.neg.mjs` §`t11` (rojo con el
sabotaje, y cayendo por su postcondición, no sólo por el exit).

⚠ **Y lo que esto NO decide:** cuál de las otras doce transformaciones le
corresponde a este arquetipo. `extractor-f33` no aplicaba **ninguna** antes de
hoy, así que esto es el **estreno del canal**, no un recorte — y derivar la diana
de cada una contra `corpus/fase-3/` está **SIN MEDIR**, nombrado en el `noCubre`
de la congelada.

#### 3.2b · T3b — `wp-caption` → `<figure>` con relación de media (2026-08-05)

La segunda mitad de **T3**: *«se descartan; la relación con el media pasa a ser
**relación a la colección**, no una clase con un id de otro sistema»*. T3a ya se
llevó `wp-image-<id>` y `aligncenter`; T3b hace lo demás, y son **tres cosas**:

| # | qué | por qué |
|---|---|---|
| 1 | `id="attachment_<N>"` **y** `aria-describedby="caption-attachment-<N>"` se van **JUNTOS** | son ids de WordPress. Quitar uno y dejar el otro fabricaría un **puntero colgante**, que es peor que el residuo |
| 2 | `<div class="wp-caption">…<p class="wp-caption-text">` → **`<figure>`…`<figcaption>`** | la leyenda deja de ser un `<p>` con una clase del tema y pasa a ser el HTML que significa *«ésta es la leyenda de este medio»*. **Las dos etiquetas están en las 43 censadas (209/209)**, así que el saneador las admite sin tocar la whitelist |
| 3 | **`data-media="<llave>"`** en el `<figure>` | la relación, explícita y comprobable |

**La llave es la del documento, NO la de la variante.** `foo-1024x576.jpg` es un
**tamaño** de `foo.jpg`, y el documento de la colección es el origen — es lo que
`media-regenera` ya había decidido al derivar `listaACapturar` (el pipeline
reproduce la dimensión, 73/73). La función vive en `lib.mjs` (`origenDe`),
**una sola vez**: la primera versión de T3b tenía su propia copia y devolvía la
variante, y el invariante D lo cazó con **80 referencias que no resolvían**.

**Y `src` y `data-media` contestan preguntas distintas, a propósito:** el `src`
sigue apuntando al original —la regla de rutas locales: el destino no está
publicado— o sea **dónde está hoy**; `data-media` dice **qué documento de nuestra
colección es**. Conflarlos es exactamente lo que §3.2 T3 prohíbe. Y la **caja que
el cuerpo pidió** no se pierde: viaja verbatim en el `src`/`srcset` (§la frontera
del «ancho pedido», `media-hueco` 7/7).

**Censo que fija el alcance** (446 bloques · 83 páginas · `corpus/`): 446/446 con
**un** `<img>` y **con leyenda** · 420 con `id="attachment_N"` · 24 con el `<img>`
envuelto en `<a>` · **443 bajo el prefijo de subidas y 3 hotlinkeadas fuera**
(`eea.europa.eu` · `freudenberg-filter.com` · `ccacoalition.org`), que **no son
media nuestra** y por tanto salen sin `data-media`, contadas y nombradas.

**Lo que T3b NO hace, y va como pregunta abierta:** `size-full`/`size-large`/
`size-medium` (**405**), `alignnone` (29) y `alignright` (**2**) sobreviven. §3.2
T3 nombra **tres** marcadores y éstos no están; los dos primeros parecen residuo
y el tercero es una decisión editorial, así que la respuesta no es la misma para
los tres. Ficha: `PENDIENTES-QA.md` §T3-ALCANCE.

**Y 2 de los 446 quedan sin convertir**, declarados: su `<p>` sin cerrar mete un
bloque `calls` dentro del contenedor y el `</div>` cae después del CTA, así que
emparejar por balanceo se lo tragaría. `PENDIENTES-QA.md` §T3B-NO-CANONICO.

#### 3.2c · T4b — la sustitución, y la UNIDAD que estaba mal contada (2026-08-05)

§3.3 reparte los 17 `<script>` en **nodo-embed tipado (7)** y **eliminación con
sustitución (10)**. T4a ejecuta la eliminación; T4b la sustitución de las dos
clases que la tienen **derivable**.

> ⚠ **LA UNIDAD NO ES EL `<script>`, ES EL CONTENEDOR — y contarlo mal dejaba
> fuera dos sustituciones.** El reparto que traía el HANDOFF sale de
> `scriptsQuitados`, o sea de contar **scripts**:
>
> | clase | scripts | contenedores | por qué difieren |
> |---|---|---|---|
> | `fb3d` | 6 | **8** | 2 visores traen `data-pdf="<URL>"` en el atributo y **no cargan script**: T4a nunca los vio, así que ningún censo hecho sobre `scriptsQuitados` podía contarlos |
> | `flourish` | 4 | 5 | 1 ya trae su `<iframe>` materializado — **y es la que da la forma** |
>
> Es la misma trampa que el «13 mecánicos» de la tanda 30.ª, una vuelta más
> abajo: allí se contaba como trabajo lo que no lo era; aquí se dejaba fuera
> trabajo que sí lo es. **Se cuenta en la unidad sobre la que se actúa.**

| clase | n | qué hace T4b | de dónde sale el dato |
|---|---|---|---|
| **`fb3d-flipbook`** | **8** | → `<p><a href="<PDF>" data-media="<llave>">TÍTULO</a></p>` | forma A (6): `posts[<data-id>].data.guid` + `.title` del payload **base64**; forma B (2): `data-pdf` en el atributo, título = nombre del fichero. **Ninguno es texto inventado** |
| **`flourish`** | **4** | el `<div>` se **conserva** con su `data-src` y el `<iframe>` entra dentro | `data-src="visualisation/<ID>"` → `https://flo.uri.sh/visualisation/<ID>/embed?auto=1`. `flo.uri.sh` ya está en la allowlist firmada (§3.3b) |
| `twitter` · `instagram` | 3 | **nada, y es un resultado medido** | el `<blockquote>` sobrevive con su texto y su enlace al estado/permalink: degrada a **cita válida** |
| `swiper-jsdelivr` | 3 | **listado** | decisión de **RENDER**: el dato está (10 · 11 · 11 slides como `<a class="swiper-slide">`). ¿Galería nativa? — abierto |
| `nbc` | 1 | **listado** | **imposible**: el script sólo da la URL del **reproductor** con su `CID` caducable, nunca la del artículo, y §3.3 decidió *enlace a la noticia* |

**La forma del `<iframe>` de Flourish no se inventó: se copió de un hermano del
mismo corpus.** `entradas-blog/contaminacion-de-la-industria-de-fertilizantes-…`
trae el embed **ya materializado** —el script había corrido cuando se guardó la
página—, y es literalmente `<div class="flourish-embed" data-src="visualisation/
15668216?…"><iframe src="https://flo.uri.sh/visualisation/15668216/embed?auto=1"
…>`. De él se copia todo menos dos cosas, y las dos con razón:

- **`height: 673.078px`** — lo mide el script en ejecución para **esa**
  visualización. Copiarlo a las otras cuatro sería cablear el valor de la
  instancia que tienes delante: una familia de calibración de manual;
- **`data-mce-fragment="1"`** — residuo de TinyMCE, misma familia que el
  `style="width:NNNpx"` que T2 se lleva.

**Lo que T4b deja SIN SUSTITUTO no es un escalón: es una lista con nombre y
dueño** —3 swiper (decisión de render, con su §3.3) y 1 NBC (imposible)—, y el
extractor la imprime en cada corrida. Regla 6: una transformación que falta se
rechaza, no se sustituye a ojo.

**Y §M-ORIGEN404 queda decidido con esto** (`PENDIENTES-QA.md`): **el dato
conserva la referencia**, porque el original la sirve; que la página pinte un
hueco es decisión de render y va por su carril. La ausencia del artefacto se
vigila aparte, en el **invariante D** del eje `existencia`.

#### ⚠ T4b corre en LOS DOS CAMINOS desde el 2026-08-06 — y no lo hacía

Esto se escribió cuando T4b sólo existía en el **extractor** (el camino del
corpus). El **seed** —el que llena la DB desde el catálogo medido— tenía una
copia a mano de T8+T4a y **no importaba `transformaciones.mjs`** (`grep -c` →
0), así que aplicaba T4a sin T4b y guardaba 4 cuerpos de blog mutilados.
Corregido: `seed.mjs` importa `T4B` y lo corre **antes** de T4a con su
postcondición. **Medido: 3 de 3 visores FB3D del catálogo sustituidos vía
`payload`.**

**Lo que eso cambia del esquema es una sola cosa, y hay que saberla:
`data-media` en el campo rico llega ahora por DOS caminos** —el extractor
(corpus) y el seed (catálogo medido)—. El valor y su forma son los mismos (es
la misma función, importada, no reimplementada), pero **quien audite
`data-media` tiene que mirar las dos fuentes**: el invariante D de
`qa:artefacto` lee `medidas/extractor-corpus.json`, o sea **sólo el camino del
extractor**. Los 3 `data-media` que el seed produce hoy **no pasan por ese
invariante**, y sus PDF son justamente los de §M-PDF-FB3D (la captura nunca los
pidió). No se cierra aquí: se nombra.

El `validate` de `campoHtml` acepta la salida sin cambios (63 documentos
sembrados, 0 rechazos), así que **el modelo no se toca**.

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

~~⚠ **Lo que queda SIN DECIDIR** es el contenido de esa allowlist inicial. Se
propone arrancar con los 18 hosts censados y exigir alta explícita para
cualquiera nuevo; **no se cierra aquí** porque es una decisión de política de
seguridad (un `iframe` de terceros ejecuta código de terceros), no de modelado.~~

#### ✅ 3.3b · FIRMADA (2026-08-04, propietario del sitio — F2-2 bloque 2)

> **Allowlist = LOS 18 HOSTS CENSADOS**, comparación **por HOST, nunca por
> proveedor** (el caso `flo.uri.sh`: una lista por nombre de proveedor no habría
> reconocido a su propio proveedor), **más procedimiento de alta** para hosts
> nuevos. Es la forma con **cero pérdida medida** al importar; la estricta
> (solo tramo A) queda disponible después **sabiendo que cuesta 21 decisiones**
> — los 21 iframes de los 16 hosts de la cola.

Los 18, derivados de `medidas/a-embeds.json` (censo 209/209), no citados:

`youtube.com` · `ourworldindata.org` · `canva.com` · `docs.google.com` ·
`experience.arcgis.com` · `facebook.com` · `storymaps.arcgis.com` ·
`europeanbiogas.clicdata.com` · `linkedin.com` · `google.com` · `google.es` ·
`shipmap.org` · `elliotcloud.portsdebalears.com` · `flo.uri.sh` ·
`geoportal.madrid.es` · `data.worldbank.org` · `essic.umd.edu` ·
`real-decreto-2142025-un--0qvqhh6.gamma.site`

**Procedimiento de alta** (parte de la firma, no un anexo): un host nuevo entra
**añadiéndolo a `HOSTS_PERMITIDOS`** en `packages/cms-config` con un comentario
de una línea —quién lo pidió y para qué contenido— y el saneador lo rechaza
mientras tanto **nombrándolo**. El alta es un cambio de código revisable, no una
excepción silenciosa; es exactamente el punto medio entre «enum que hay que
migrar» y «cualquier tercero entra».

⚠ **Alcance firmado el 2026-08-04: GRUPO A (209/209).** Los `iframe` del **grupo
C** estaban **sin censar por host** al firmar (C-SP6) — un censo del grupo C
puede añadir hosts, y esos entran por el procedimiento de alta, no re-firmando la
lista. La lista se firma con este alcance escrito a propósito.

#### ✅ 3.3b · AMPLIACIÓN FIRMADA (2026-08-05, propietario del sitio — F2-2 bloque 3)

> **La allowlist suma los 3 hosts REALES del grupo C** —`kunakcloud.com` ·
> `player.vimeo.com` · `dailymotion.com`— por el **procedimiento de alta** que la
> firma del 04-08 dejó escrito, no re-firmando la lista. **Alcance firmado pasa
> de «grupo A» a «grupo A + grupo C censados».** Total: **21 hosts**.

**El criterio es EL MISMO que se firmó el 04-08** —*los hosts censados, cero
pérdida medida*— **aplicado al censo que entonces no existía**. No es un criterio
nuevo ni una excepción: es la primera vez que se ejecuta el procedimiento de alta
tal como la firma lo definió.

Los 3, **derivados** de `medidas/c-embeds.json` (censo 76/76, C-SP6), no citados:

| host | n | dónde | por qué entra |
|---|---|---|---|
| `kunakcloud.com` | 2 | `casos/red-calidad-de-aire-para-world-athletics` · `casos/running-for-clean-air-ciudades-saludables` | widget **propio de Kunak** |
| `player.vimeo.com` | 1 | `casos/red-calidad-de-aire-para-world-athletics` | vídeo del caso |
| `dailymotion.com` | 1 | `casos/calle-30-natura-sensores-de-calidad-del-aire-kunak-air` | vídeo del caso |

⛔ **`googletagmanager.com` queda FUERA, y su evidencia es el motivo de que se
escriba aquí en vez de omitirse:** **76 iframes en 76/76 páginas**. Eso no es un
host que use el contenido — es **el pleno de la regla 4**: un patrón que casa en
todas no mide contenido. Es el `<noscript>` de GTM que el tema inyecta en el
**cascarón**, y §3.3 ya lo tiene medido como *«cero de analítica dentro del
contenido»*. **Jamás candidato a alta**, y la razón queda escrita para que la
próxima tanda no tenga que re-derivarla.

**Efecto medido en la misma tanda:** `npm run cms:seed` estaba **parado** por
`kunakcloud.com` en `casos.ts` (`ValidationError · casos · Necesidad ·
Resultados`) — derivado con `grep`, dos ocurrencias reales en
`apps/web/src/lib/casos.ts:144,164` (`player.vimeo.com` y `kunakcloud.com`). Con
el alta firmada el seed termina y el `round-trip 63/63` del bloque 1 **vuelve a
ser reproducible**, que era el bloqueo declarado en el HANDOFF de la 28.ª.

> ✅ **C-SP6 CERRADO en la misma tanda** (`npm run qa:c-embeds`, offline sobre la
> captura commiteada, congelado en `medidas/c-embeds.json`): **90 iframes · 7
> hosts** en las 76 páginas del grupo C. Unidad declarada: **página servida
> completa sin `<script>`/`<style>`** — superset del campo rico, a propósito.
>
> | host | n | lectura |
> |---|---|---|
> | `googletagmanager.com` | **76 en 76/76 pág.** | **es el CASCARÓN, no contenido** — un patrón que casa en todas no mide contenido (regla 4, el pleno): es el `<noscript>` de GTM que el tema mete en cada página. **Jamás candidato a alta**: la analítica no entra en el contenido (§3.3, «cero de analítica dentro del contenido») |
> | `youtube.com` · `facebook.com` · `storymaps.arcgis.com` | 8 · 1 · 1 | ya firmados |
> | `kunakcloud.com` ×2 · `player.vimeo.com` ×1 · `dailymotion.com` ×1 | 4 | **contenido real del grupo C, FUERA de la allowlist** — pendientes del **procedimiento de alta** cuando el corpus del grupo C se importe (su extracción de builder no es de esta tanda). Fichados, no colados |

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

### ✅ 4·href — el `href` de un producto REFERENCIADO no es local por definición (F2-5, 2026-08-08)

La frase de este § *«dentro del CMS los 24 son documentos, así que su ruta es
local por definición»* produjo §F2-3-HREF-DERIVADO: la vuelta componía local
para los 9 y 6 apuntaban a rutas que el build no emite. **Corregida por la
salida (b) de la ficha**, y el reparto de capas es la decisión de esquema:

| capa | qué sabe del `href` |
|---|---|
| **dato** (DB) | nada — sigue sin guardarse; `padre` + `slug` es el candidato |
| **vuelta** (`devuelveProducto`) | compone el CANDIDATO local, pura, sin entorno |
| **render** (proyector de `apps/web`) | aplica la **regla de rutas locales**: candidato construido → local; no construido → `https://kunakair.com/es<candidato>/` |

«Construido» se **deriva** del árbol de `app/` (`@kunak/cms-config/entorno`),
que es la ENTRADA de la que el build deriva sus rutas estáticas — el manifiesto
es la SALIDA y no existe aún cuando el render corre. El lazo lo cierra
`qa:tipo-hoja` (eje `href`, veredicto) contra el manifiesto real: árbol y
manifiesto divergen ⇒ rojo. Medido al cerrar: **9/9 coinciden con el dato
medido** — el catálogo ya cumplía la regla; era la vuelta quien la rompía.
Acta y ficheros en `PENDIENTES-QA.md` §F2-3-HREF-DERIVADO · CERRADA.

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
| **CLASE (S9–S11)** | ~~4 residuos de SECTOR~~ → **31 ítems derivados** con una causa: **componente calibrado con UNA instancia** | **✅ CLASIFICADA (2026-08-03, `docs/research/clase/`)** — ver §6c. El inventario a mano tenía ~8; el derivado tiene **31** (`medidas/clase-censo.json`). **10 BLOQUEAN F2-1 · 21 no.** Y los 10 se desbloquean con **UNA medición**, no con 10 arreglos |
| **M-IMG** | residuo de décimas: el original sirve por `srcset` una variante cuya proporción redondea distinto | se cierra con `srcset`, no con maquetación. **CMS-0b ya está decidida** (volumen persistente) y **no lo cierra ni lo reabre**: dónde viven los ficheros no decide qué variantes se generan. Lo que queda es el juego de tamaños que emita el CMS y su redondeo — ~~SIN MEDIR~~ **MEDIDO 2026-08-04, y NO se cierra: ver la fila de abajo** |
| **M-IMG · 2026-08-04** | **el eje `srcset` comparado de dos lados por primera vez** (`qa:cmp-srcset`, negativo 4/4): **311 pares · 140 iguales · 70 el clon NO emite `srcset` · 5 distintos** | **NO SE CIERRA, y con número.** Tres razones, y ninguna es «falta trabajo»: **(1)** el juego fijo de tamaños es **necesario y NO suficiente** — el `srcset` no es función de la imagen (39 de 519 orígenes con ≥2 firmas), así que el atributo necesita el **ancho pedido en el punto de uso**, que no está modelado; **(2)** los 70 se concentran donde el clon **CONSTRUYÓ** (`/software` 19/37 · `/accesorios` 14/18 · `/monitor` 8/51), porque ahí `MonoModulo.imagen`, `Product` y compañía tienen `src` y **ningún campo de variantes**; en grupo A el `srcset` viaja verbatim dentro del HTML rico y por eso 140 salen iguales; **(3)** la ficha original de M-IMG está medida en el **monográfico**, y los 4 sectores + 2 monográficos **no están en el corpus** ⇒ su población **no es medible** con esta sonda. Lo que sí quedó hecho: el CMS **ya genera** `alert-cloud-vertical-web-3-480x705.jpg`, el fichero exacto que la ficha cita |
| **M-IMG · 2026-08-06** | **el disco de `media/` es PLANO, y eso tiene dos mecanismos que pisan bytes** — no uno. **(1)** un origen bautizado con la forma que el pipeline genera para otro (`X-1024x683.jpg` con `X.jpg` también subido): **2 materializados**. Y el denominador de la fragilidad, que faltaba: **40 de 112** orígenes tienen nombre de variante, **18** con un ancho que `imageSizes` produce (los otros 22 son `600`, que ningún tamaño genera ⇒ fuera de alcance) y **3** con su base en la unión. **(2)** **RE-CODIFICACIÓN**: `Air_pollution_in_Madrid.webp` mismas dimensiones (1000×600) y 65 752 → 62 096 bytes | **Ninguna consecuencia geométrica hoy** (misma dimensión ⇒ M-IMG) y **la pérdida es RECUPERABLE**: `apps/web/public/images` está en git con los 112 orígenes verbatim (109/112 byte-idénticos a `media/`; los 3 que difieren tienen el bueno en `public/`) y `media/` está en `.gitignore` y lo vacía `cms:reset`. ⚠ **Lo que NO sirve de red es la captura**: los disputados **no están en `media-corpus`** y no pueden estarlo — su alcance excluye las VARIANTES por nombre, igual que en §M-PDF-FB3D. Y el control *«Payload copia los orígenes verbatim»* vale para los **111 `jpeg`+`png` y NO para el `webp`** — propiedad del formato, derivada sobre **n=1**. Ficha: `PENDIENTES-QA.md` §F2-3-VARIANTE-PISA |
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

## 6c · CLASE, clasificada: 10 bloquean F2-1 y 21 no (2026-08-03)

Acta: `docs/research/clase/` (`PRE-REGISTRO.md` commiteado antes de clasificar;
`DECISION.md` con los PASOS 4 y 5). Evidencia derivada: `medidas/clase-censo.json`.

**El inventario estaba escrito a mano y era ~8. Derivado son 31** — 74
componentes, 58 con medida absoluta, 41 con alcance ≥2 **rutas**, 33 candidatos,
−2 falsos positivos. Crece **×3.9**.

### El criterio de bloqueo, que es lo reutilizable

> **BLOQUEA = el esquema quedaría MAL si se migra con el componente como está.**
> Y se resuelve en una pregunta: **¿el valor cableado lo elige EL EDITOR (campo)
> o se deriva del CONTENIDO (lo calcula la plantilla)?**

| | ítems | por qué |
|---|---|---|
| **BLOQUEAN** | **10** | cablean **ancho de MÓDULO** en SECTOR (`SectorBody` `SectorHero` `ClaimConFoto` `ListaSimple2Col` `BeneficiosAplicaciones` `CabeceraSector`) y grupo C (`CasoPagina` `CasoDetalles` `CasoGaleria` `FaqSidebar`). **`anchoPct` existe SOLO en `monografico.ts`**, y donde se midió resultó **campo** (70·80·90·100, −55 ×10). Fuera de ahí: **SIN PROBAR** |
| **NO bloquean** | **21** | altos derivados del contenido (los calcula la plantilla, cero campos), retícula de fila **por familia** (86 %/80 % = la colección, derivable), cajas de icono y separadores |

**Por qué la duda cuenta como bloqueo:** Razón 3 de §1.5b — **añadir un campo
después de que haya contenido escrito es la dirección cara**.

### Lo que desbloquea F2-1: una MEDICIÓN, no diez arreglos

> **La varianza intra-página del ancho de módulo en SECTOR y grupo C, contra el
> original, a 1440.** Sale con un sí o un no. Si varía → `anchoPct` (o
> equivalente) entra en esos content types **antes** de congelar el esquema. Si
> no varía en ninguna instancia → los 10 pasan a NO BLOQUEA sin tocar una línea.

Sonda: extensión de `ancho-cuerpo` al nivel de **módulo** (hoy mide fila).

### Los 21 no son precondición

Se hacen después, contra los criterios de `clase/PRE-REGISTRO.md` §PASO 3, y
necesitan **una sonda que no existe**: `clase-rango`, que cierra con **dos**
números —fidelidad (Δ0 por instancia) **y rango** (varianza>0 donde el original
varía)—. Sin el segundo no sirve: **el defecto de esta clase es «no varía»**.
Construirla es parte del coste de esa tanda, y está dicho de antemano.

El más urgente de los 21: **`Breadcrumb max-w-[350px]`**, 28 rutas y ya cobrado
(−33.25 en producto). Que no bloquee el esquema no lo hace menos defecto.

### ✅ 6c.1 · MEDIDO — el ancho de módulo es CAMPO en SECTOR, y los 10 se PARTEN 9/1 (2026-08-03)

**La medición de desbloqueo que pedía el §6c, hecha.** Pre-registro
`clase/PRE-REGISTRO-ANCHO-MODULO.md` (`61a9e78`, anterior a la sonda) · acta
`clase/DECISION-ANCHO-MODULO.md` · evidencia
`medidas/clase-rango-{1440,390}.json` (`226c30f`, anterior al acta) · sonda
`clase-rango` con negativo entero en verde (`02d806d`).

> ⚠ **CORRIGE al §6c en su premisa, no en su criterio.** La tabla de arriba dice
> que los 10 *«cablean ancho de MÓDULO»*. **Leído el fuente, NUEVE cablean
> retícula** —fila (`86 %`/`80 %`) o columna (`47.25` · `47` · `32` · `50.5` ·
> `25 %`)— **y solo UNO está al nivel de módulo** (el `<h3>` de
> `BeneficiosAplicaciones`, `w-[80%]`). Era **confusión de NIVEL**: el precedente
> de MONOGRÁFICO es del nivel de módulo y a nueve no les aplicaba.

**Lo medido** — 12 rutas × 2 lados × 2 anchos, 24/24 páginas por ancho, control
con varianza 2/2:

| nivel | SECTOR (4) | CASO (4) | FAQ (2) | veredicto |
|---|---|---|---|---|
| fila | `86`×10–12 + `95`×1 (banda de clientes, **sin texto**, igual en las 4) | `86`×1 | — | **plantilla** |
| columna | `29.67 · 47.25 · 64.83 · 100` | `100`×1 | — | **rejilla de Divi**, derivable del nº de columnas |
| **módulo** | **`80 · 90 · 100`** | `100`×1 | — | **CAMPO en SECTOR · plantilla en grupo C** |

**Los dos discriminadores coinciden**, así que el veredicto no depende del
régimen que se le suponga a SECTOR: **intra-página** (Industria trae los tres
valores) **y entre instancias** (el `90` existe **solo en Industria**), y
**idénticos a 1440 y a 390**.

**Grupo C no bloquea, y no por «no varía»: porque NO TIENE CAPA DE BUILDER.**
FAQ trae **0** secciones propias (`faqs-template-default` · `et-tb-has-template`);
CASO trae **1**, con 1 fila / 1 columna / 1 módulo al valor por defecto. No es un
cero de instrumento — **el mismo código en la misma pasada devolvió 7 secciones
en SECTOR y 8 en el control**.

#### La consecuencia sobre el modelo — **`anchoPct` entra en SECTOR**

> **`SectorBlock` gana un campo de presentación editorial al nivel de MÓDULO:
> `anchoPct?: number`, defecto `100`, omitido en el dato cuando coincide.**
> Es **el mismo campo, con el mismo nombre y el mismo defecto** que
> `MonoModuloBase.anchoPct` (§1.5): valores observados `80 · 90 · 100` en SECTOR
> contra `70 · 80 · 90 · 100` en MONOGRÁFICO. **No es un campo nuevo: es el
> mismo campo, en una segunda colección.**

Y por eso **no fuerza a fusionar las colecciones** ni contradice §1.5b: lo que se
comparte es **la definición del campo**, no el documento — la misma decisión que
el grupo D tomó para `blurb`/`gallery` en §2d.1 (*lo que se duplica es el
documento, no la definición*).

#### Los 10, repartidos

| | n | cuáles |
|---|---|---|
| ✅ **SE ABREN** (cablean fila o columna = plantilla) | **9** | `SectorBody` `SectorHero` `ClaimConFoto` `ListaSimple2Col` `CabeceraSector` `CasoPagina` `CasoDetalles` `CasoGaleria` `FaqSidebar` |
| ❌ **TRABAJO** (cablea módulo = campo) | **1** | `BeneficiosAplicaciones` — y **con el valor correcto** (`80 %` en 4/4): no es defecto de píxel hoy, es un campo que falta |

#### ⚠ Y uno NUEVO, que el inventario derivado no podía ver

**El inventario buscaba «medida absoluta cableada». Un módulo sin clase de ancho
no cablea nada — y ése es justo el defecto:**

| `MapaProyectos` | original | clon | Δ |
|---|---|---|---|
| @1440 | `90 %` · 1114.55 | `100 %` · 1238.39 | **+123.84** |
| @390 | `90 %` · 301.84 | `100 %` · 335.39 | **+33.55** |

Medido en los dos lados y los dos anchos; **existe solo en Industria** de los 4
sectores vivos. MONOGRÁFICO ya le da `anchoPct: 90` al mismo módulo. **El detector
de un ancho mal no fue otro ancho: fue otra INSTANCIA.**

#### Lo que sigue sin veredicto, con su etiqueta

**El nivel de módulo NO tiene veredicto en el lado del CLON.** El clon solo marca
la FILA (`data-fila`); en columna y módulo su identidad es un heurístico que
sobre-casa (**66 «columnas» contra 27**, **102 «módulos» contra 66**), así que
los dos ejes están **CIEGOS ahí, no limpios** — la sonda cuenta y grita **26
celdas SIN VEREDICTO**. Se cierra con `data-col`/`data-mod`. Los `Δ0` de la
corrida son **del nivel de fila**, 65 pares, y solo de ahí.

## ✅ 2f · CONSTRUIDO vs REFERENCIADO — la premisa del §F2-2 es cierta de UNAS colecciones y falsa de otras (2026-08-04)

**Es lo que más cambia de cómo se lee `src/lib` en todo el esquema**, y no estaba
escrito en ninguna parte. Instrumento: **`npm run qa:cms-arquetipos`** (negativo
`qa:cms-arquetipos-neg`, 3 sabotajes + control), congelado en
`medidas/cms-arquetipos.json`.

> **`PLAN-FASE-2.md` §F2-2 arranca de *«`src/lib/*.ts` **son** los datos»*.
> Medido: lo son de los arquetipos que el clon **CONSTRUYÓ**, y **no** de los que
> sólo **REFERENCIÓ**.**

El clon hizo dos cosas distintas con el original, y las dos dejan filas en
`src/lib`:

| | qué hizo | qué hay en `src/lib` | ¿siembra la colección? |
|---|---|---|---|
| **CONSTRUYÓ** | reconstruyó la página y la sirve (emite ruta) | el contenido completo | **sí** |
| **REFERENCIÓ** | pintó un enlace o un teaser hacia ella | lo que el que la pinta necesitaba | **no**: el resto de campos **nunca se midió** |

**Una fila referenciada no es una fila incompleta por descuido: es una
PROYECCIÓN, y está completa respecto de su propósito.** Confundir las dos cosas
es lo que hace que un `required` sin dato se lea como *«se me olvidó
rellenarlo»* en vez de *«este dato no existe todavía»* — que es exactamente cómo
nació la frontera de `productos.seo.title`.

**Y son DOS ejes, no uno.** Darlos juntos es el error de `CLAUDE.md` §El NIVEL al
que se mide aplicado a un informe:

- **A · ¿la FILA es completa?** ⇒ lo dice si el clon **emite ruta** para ella
  (`prerender-manifest`, o sea el build);
- **B · ¿está el CORPUS completo?** ⇒ cuántas filas hay de las que existen en el
  original. **`cms-arquetipos` NO mide el eje B y lo declara**: 4 casos de 57 y 7
  entradas de 149. Una colección puede estar **CONSTRUIDA y al 3 % del corpus**.

### El reparto medido, con las aristas colgantes

| colección | filas | con ruta | colgantes↑ | colgantes↓ | clase |
|---|---|---|---|---|---|
| `productos` | 9 | **3** | 0 | 0 | **MIXTA** — la premisa es FALSA para **6 de 9** |
| `sectores` | 4 | 4 | 0 | 0 | CONSTRUIDA |
| `monograficos` | 2 | 2 | 0 | 0 | CONSTRUIDA |
| `taxonomia-sectores` | 11 | **0** | 0 | 0 | **REFERENCIADA** — 11 de 11 |
| `casos` · `faqs` · `entradas-blog` · `terminos-kunakpedia` · `documentos-cientificos` | 4·2·7·3·4 | todas | 0 | 0 | CONSTRUIDA |

`colgantes↑` = relaciones de esa colección sin documento destino ·
`colgantes↓` = documentos suyos que otras piden y no existen. **Los dos están a
0 desde que la decisión del teaser (§F2-2 · TEASER) convirtió las 31 relaciones
huérfanas en dato propio** — antes eran 20 en `sectores` y 11 en `monograficos`.

> ⚠ **`taxonomia-sectores` es REFERENCIADA y aun así se siembra, y eso no es una
> excepción: es lo que distingue los dos ejes.** Sus 11 términos vienen embebidos
> completos en los documentos que los usan (§2c), así que la proyección **es** el
> término entero. Lo que la clase dice es que **el clon no sirve `/sector/<slug>`**,
> no que falte dato.

### Consecuencia para el esquema, que es por lo que esto vive aquí

**`productos.cuerpo` está VACÍO en las 9, y es correcto.** `src/lib/products.ts`
es la **proyección de pestaña** de la home, no la ficha: no tiene cuerpo porque
nadie lo midió. El round-trip da Δ0 porque los dos lados están vacíos, y **eso es
verdad, no un verde falso** — siempre que el alcance viaje al lado, que es para
lo que existe esta sección. Las 24 fichas del CPT entran en el **bloque 2**, con
el extractor.

**Regla que deja, y vale para cualquier colección futura:** antes de declarar
que una colección se puede sembrar de `src/lib`, se mira su clase. **REFERENCIADA
o MIXTA ⇒ lo que hay es una proyección**, y sembrarla entera exige medir primero
los campos que la proyección no necesitaba.

---

## ✅ 2g · El TEASER es DATO PROPIO, no relación — y su consecuencia va sin tapar (2026-08-04)

**Afecta a `sectores.proyectos.posts` y `sectores.articulos.posts`** (y los mismos
en `monograficos`). Migración versionada: `20260804_151246_teaser_dato_propio`.
Falsador ejecutable: **`npm run qa:cms-teaser`**, con negativo
`qa:cms-teaser-neg` (2 sabotajes + control). Congelado en `medidas/cms-teaser.json`.

### Lo que decía antes, y por qué se cae

§1.5 los dejó como **relaciones**, con este comentario: *«`CaseStudy` y
`BlogPost` son proyecciones de teaser del documento relacionado, no campos de
esta colección»*. **Nadie lo había medido.** Medido, se cae por dos sitios
independientes y basta cualquiera de los dos:

1. **El destino no existe para casi ninguno.** De los **34** teasers del dato
   medido, **31 apuntan a un documento que el clon no tiene** (`sondeo-frontera`).
   Es el **precedente directo de §2e.1 `padre`**, resuelto igual y por lo mismo:
   allí *«17 de 18 hijos apuntarían a un documento inexistente ⇒ relación pura no
   vale»*; aquí son **31 de 34**.
2. **Y aunque existiera, `date` no se deriva.** Comparados campo a campo los **3**
   pares cuyo destino sí está transcrito: `title`·`client`·`sector` **IDÉNTICOS**;
   `image`·`href`·`sectorHref` **POR REGLA** (M-IMG y §4, ya decididas); y
   **`date` DISTINTO** — `"Mar 25, 2026"` en el teaser contra `"25 marzo 2026"`
   en `fechaPublicacion`.

> ⚠ **Y lo que el negativo añade, que es lo que hace honesta la decisión:** el
> sabotaje `derivable` le pone a la sonda **el formateador de meses en español**
> y el veredicto **voltea a FALSADA**. O sea que derivar el teaser **sí es
> técnicamente posible**. No se hace porque re-formatear **normaliza en silencio
> cualquier errata del original**, y el contrato de fidelidad (`CLAUDE.md` §1:
> textos verbatim, erratas incluidas) lo prohíbe. **Es una decisión de contrato,
> no una limitación técnica**, y decirlo al revés sería vender una elección como
> una necesidad.

⚠ **La asimetría del alcance va dicha: 3 pares comparables de 34.** Un DISTINTO
basta para falsar la derivación; un IDÉNTICO en 3 pares **no** prueba
derivabilidad universal. El veredicto se apoya en el DISTINTO, que es el lado que
concluye.

### ⚠ LA CONSECUENCIA, SIN TAPAR

> **El teaser NO se actualiza cuando cambia el documento destino.** Quien edite
> el título de un caso en el CMS tiene que editarlo **también** en cada página de
> sector o monográfico que lo muestre. Es un **coste editorial real y
> recurrente**, y va en la documentación de traspaso de **F2-5** — no escondido en
> un comentario de código.

Se elige aun así porque la alternativa **no es «teaser vivo»**: es no poder
sembrar 31 de 34 hasta que los 57 casos y las 149 entradas estén dentro, y aun
entonces seguir sin poder reproducir la fecha. El campo lleva su `admin.description`
diciéndolo (*«Teaser VERBATIM, no proyección»*), que es donde lo va a leer quien
edite.

**Condición de reapertura, escrita:** esta decisión cae si `date` deja de salir
DISTINTO — porque `fechaPublicacion` deje de guardarse verbatim, o porque un
formateador reproduzca las dos renderizaciones **en todo el corpus**, no en una
muestra. `qa:cms-teaser` es quien lo dice.

---

## ✅ 2h · `productos.seo.title` — el `required` QUEDA RESPALDADO, y por medición (2026-08-04)

§2e escribió *«`seo`: grupo, como en las demás»* y el traductor lo puso
`required`. El sondeo de frontera midió lo que eso significaba: **`required` y
sin dato en 9 de 9**, ni en `src/lib/products.ts` ni en ninguna congelada. O sea
**el esquema afirmaba algo que ninguna medida respaldaba**.

Instrumento: **`npm run qa:solutions-seo`** (negativo `qa:solutions-seo-neg`, 3
sabotajes + control), sobre las **24 URLs derivadas del `solutions-sitemap.xml`**
—no citadas—. Congelado en `medidas/solutions-seo.json`.

| campo | medido | veredicto |
|---|---|---|
| `title` | **24/24** · y **NO derivable del `h1`**: 17 formas distintas de «título menos h1», y **7 que ni lo contienen** | **CAMPO**, y el `required` **respaldado** |
| `description` | **22/24** | **opcional**, con su medida — `kunak-api` es una de las dos que no la traen |

**Por qué la segunda pregunta era imprescindible:** que el `<title>` exista no lo
hace un campo. Si fuera derivable del `h1` con plantilla fija (`"<h1> | Kunak"`)
sería **plantilla** y el modelo no tendría que guardarlo. Lo decide la varianza —
*lo que varía de una instancia a otra lo escribió una persona*— y el negativo lo
prueba en los dos sentidos: el sabotaje `derivable` fabrica el mundo de plantilla
única y el veredicto **voltea a PLANTILLA**.

> **Y la razón de que llegara tarde es de CAPA, no de descuido**, que es lo
> reutilizable: de los 9 productos el clon **construyó 3**, y para ésos el título
> vive en el `export const metadata` de su `page.tsx` — o sea **en la capa de
> ESTRUCTURA**, justo lo que la regla 2 de `CLAUDE.md` separa. Los otros 6 sólo
> están REFERENCIADOS (§2f) y no lo tenían en ninguna parte. **Un dato que vive
> en la plantilla del clon es invisible para cualquier auditoría del catálogo.**

Lo que **no** se hizo, y era la salida cómoda: un `?? ""` en `seo.title`. Eso no
arregla el hueco, lo tapa — y en el sitio donde todavía se sabía que faltaba
(regla 6).

⚠ **Y una discrepancia de fidelidad que la medición destapó de paso:** el
`metadata.title` del clon en `/kunak-api` dice *«Kunak API | Integración de datos
de calidad del aire»* y el original dice **«Kunak API - Kunak»**. El dato del
catálogo es el del ORIGINAL. Fichado en `PENDIENTES-QA.md`.

---

## ✅ 2i · LA PUBLICACIÓN — dos campos de infraestructura, y por qué NO son los drafts de Payload (2026-08-07, F2-4)

**El modelo cambia por primera vez desde F2-3, y es lo mínimo que hace falta
para que F2-4 exista:** hasta hoy, todo lo que estaba en la DB salía en el
sitio, así que ni la publicación programada ni la vista previa se podían
enunciar. Los dos campos viven en `campos/comunes.ts` (`PUBLICACION`):

| campo | tipo | defecto | qué es |
|---|---|---|---|
| `estado` | `select` (`borrador` · `publicado`), **required**, indexado | **`borrador`** | sólo `publicado` sale en el build |
| `publicarEn` | `date` (día y hora), indexado | vacío | la hora a la que el cron debe publicarlo. Vacío = manual |

**Dónde:** las **9 colecciones publicables**, derivadas de `admin.group` ∈
{`Contenido`, `Páginas`, `Catálogo`} — sectores, monográficos, productos, casos,
FAQ, blog, términos, documentos científicos y artículos KB. **NO** en taxonomías,
media ni sistema.

> **Y el reparto se declara al revés que el del disparo del webhook, a
> propósito.** El disparo lista lo que **excluye** (defecto seguro: disparar de
> más cuesta un build sobrante). Aquí el defecto seguro es el contrario: un
> `estado: borrador` en una **taxonomía** no es «un poco de más», es **una
> relación rota** — una categoría en borrador la sigue apuntando una entrada
> publicada, y ahí no hay nada que publicar porque la categoría no es una página.

### Por qué NO `versions: { drafts: true }` de Payload

| | drafts nativos | los dos campos |
|---|---|---|
| tablas | **una `_v` por colección** (13) | 2 columnas |
| semántica de las consultas existentes | **cambia**: un `find` sin `draft: true` deja de devolver lo que devolvía | no cambia nada |
| riesgo concreto | un build que **emite menos rutas sin dar un error** — el modo de fallo exacto que `qa:manifiesto` existe para cazar | ninguno nuevo |
| previsualizar **cambios sobre un documento YA PUBLICADO** | ✅ | ❌ |

**La limitación se declara en vez de esconderse:** editar una página publicada
**no tiene preview** — sale en el siguiente rebuild. Se pueden previsualizar
**borradores** (documentos que aún no han salido), no ediciones de uno vivo.
Subir a drafts nativos después es un cambio de **migración**, no de modelo: los
dos campos se traducen a `_status` y a la fecha de `schedulePublish`.

### Los dos son INFRAESTRUCTURA, y eso es una declaración en el campo

Llevan `custom: { infraestructura: true }` y `camposPropios()` de `mapeo.mjs`
los salta, igual que salta lo que `buildConfig` inyecta. Sin esa marca, la
**vuelta** los devolvería como dato medido —la ida no los trae— y
`qa:cms-roundtrip` fallaría en las **63 filas**.

⚠ **Se reconoce por la DECLARACIÓN, nunca por el nombre.** Un
`SIN_MEDIR = ["estado", …]` sería una lista a mano que borraría en silencio un
campo medido que se llamara igual — el mismo argumento que `esSintetico` ya
tenía escrito, aplicado a la otra mitad.

### El seed escribe `publicado` explícitamente, y tiene que hacerlo

El defecto del campo es `borrador` (decisión de quien **edita**: una página a
medias no debe salir sola) y el seed reconstruye un sitio que **ya estaba
publicado** (decisión de quien **migra**). Son dos personas distintas, así que
son dos sitios distintos. Si el seed lo olvidara, el build emitiría **cero rutas
por familia** — y no en silencio: `qa:manifiesto` grita exactamente eso y entra
en `npm run check`.

### La idempotencia del cron es la TRANSICIÓN, no una marca de tiempo

> `estado = 'borrador'` **y** `publicarEn <= ahora` ⇒ se pone `publicado` y se
> dispara **un** rebuild. La segunda vuelta encuentra **cero**.

La primera versión comparaba `publicarEn` con el instante del último build
promocionado, y era frágil por una razón de **nivel**: ese corte vive en la
memoria del publicador, así que un reinicio o un segundo publicador lo pierden o
lo contradicen. **Un estado que decide si algo ya pasó no puede vivir en el
proceso que pregunta.** Con la transición, el cron es seguro de reintentar cada
minuto sin memoria ninguna. Medido: `qa:programada` P3 — 1ª vuelta publica 1,
2ª publica 0.

### ✅ 2d.8 · LA PLANTILLA DE `articulos-kb` — el default vive en la HOJA y el campo llega por VARIABLE (2026-08-10, tanda 48.ª)

Cierra los pasos 5 y 6 de §2d.4. El content type no cambia; lo que se decide
aquí es **dónde vive cada mitad**, y la decisión la impone el original:

> **El default de Divi CAMBIA DE UNIDAD al apilar** (`2 %` en escritorio, `30px`
> plano a 390). Un valor emitido desde el componente gana en los dos anchos, así
> que el default **tiene que estar en la hoja** y el campo **tiene que llegar por
> variable CSS**, con tres pisos: `var(--x-movil, var(--x, DEFECTO))`.

El piso de en medio no es adorno: un campo escrito como `2 %` **sigue siendo
2 %** a 390 (6.70312 medido), mientras el default pasa a 30px. Sin él, uno de los
dos se come al otro — y a 1440 no se vería.

**Los valores de la hoja se DERIVAN, no se escriben**: `npm run qa:kb-clases`
toma, para cada propiedad, el valor medido **en los nodos cuyo DATO la omite**, y
**falla si esos nodos no coinciden entre sí**. Con 1519 pares delante, escribir
la hoja de impresión es el arreglo falso con otro disfraz.

**Y el nombre de la variable lleva prefijo por NIVEL** (`--kbf-*` fila,
`--kbm-*` módulo, `--kbh-*` / `--kbb-*` pieles). Las custom properties heredan:
un `--kb-mb` puesto en la fila lo verían sus columnas y sus módulos, así que un
módulo sin `mb` propio cogería el de su fila **y sólo en las filas que traen
`mb`** — sin dar error.

#### Lo que la construcción devolvió al ESQUEMA

| hallazgo | consecuencia de modelo |
|---|---|
| el discriminador que llega al render es **`kind`**, no `blockType` | ninguna en el esquema; sí en el render, que ahora **TIRA** ante un `kind` desconocido |
| **`srcset`** tiene consecuencia GEOMÉTRICA: hasta **108.83 px** de alto a 390 | sube la prioridad de **M-IMG** (§CMS-0b): deja de ser una ficha de peso |
| el `align` de la piel de blurb **no se extrae** (9 de 36) | el campo existe; lo que falta es derivarlo **de la regla compilada**, no del computado, donde está confundido con la herencia |

## ✅ 2j · CMS-3 · LA COLA LARGA — **UNA colección `paginas` con UNIÓN PROPIA de bloques** (2026-08-22, 91.ª tanda)

> **DECISIÓN DEL PROPIETARIO, no derivación de esta tanda.** Los cuatro
> candidatos se publicaron con sus separadoras en `PLAN-FASE-3.md` §F3-3 (90.ª
> tanda) para que se decidiera, y se decidió **C3**. Aquí se escribe con su
> razón, con **por qué caen los otros tres** —cada uno con sus separadoras, no
> con un adjetivo— y con su **condición de reapertura**, que hace falta porque
> **C3 se toma CONTRA lo que §1.5b Razón 3 favorece** (§2j.3).

**Las rutas de la cola larga** —membresía derivada elemento a elemento en §F3-3—
se modelan como **una sola colección `paginas`**, cuyo cuerpo es un campo
`blocks` de **unión PROPIA**. Es el camino que `articulos-kb` ya abrió y que este
repo tiene construido: `MODULOS_KB` **no** consume `MODULOS_COMPARTIDOS`, declara
los suyos (`texto-kb` · `imagen-kb` · `boton-kb` · `blurb` · `gallery`).

> ⚠ **EL DENOMINADOR ES 32, NO 48 (medido el mismo día que se escribió esta
> decisión).** De las 35 «sueltas», **16 no son páginas**: el origen vivo
> responde **13 × 301** y **3 × 404**, dos lecturas separadas 13 días con la
> misma respuesta (`derivaciones/sueltas-16-reverificadas-2026-08-22.json`).
>
> | | n | dónde vive |
> |---|---|---|
> | **documentos de `paginas`** | ~~32~~ **31** | 7 hubs KB + 6 hubs L4 + **18** sueltas *(93.ª, S1)* |
> | **entrada de blog** | **1** | `entradas-blog`, que ya existe — la webinar. **Estaba en `sueltas` por su URL, no por su forma** (§2j.3c) |
> | **redirecciones** | **13** | **mapa de redirecciones — otro mecanismo**, no un documento. Dos apuntan a una imagen; varias, a rutas ya clonadas o ya dentro del conjunto |
> | **bajas** | **3** | fuera del sitio |
>
> **No cambia la decisión** —ninguna separadora depende de las 16— y **cierra dos
> incógnitas**: la unión de 12 tipos ya **no es una cota** (no quedan páginas que
> capturar) y las de 0 secciones propias quedan fijadas, con lo que **RA-2 no
> puede dispararse por una captura futura**. Lo que sí abre: quién emite los
> **13 redirects**, que es trabajo de F3-3 y **no** de esta colección.
>
> ⚠ **Y las 32 CAPTURADAS siguen siendo 32.** S1 no descaptura nada: mueve un
> documento de colección. Toda medida hecha *sobre el corpus* —el censo de
> tipos, las hojas, el `<body>`— conserva su denominador de **32**; lo que baja
> a **31** es lo que `paginas` **aloja**. Es §*corregir un denominador no es
> sustituirlo en todas partes*, con **tres** unidades en juego en vez de dos.

**`MonoSeccion[]` no se toca** — es R2, y es §1.5b Razón 1: ampliarla para que
quepa la cola larga metería en SECTOR y MONOGRÁFICO tipos que **ninguno de los
dos tiene medidos**. La unión propia respeta R2 *porque no toca el compartido*,
y **R1 (cero arquetipos) se respeta porque una colección no es un arquetipo**:
la cola larga no estrena plantilla, estrena content type.

### 2j.1 · Por qué caen los otros tres — con sus separadoras

| candidato | cae por | separadoras |
|---|---|---|
| **C1** · campo RICO por página | **contradice la frontera que este repo ya declara**: *hasta el contenedor de contenido la estructura se modela; RICO empieza POR DEBAJO*. `flujo` y `anchoPct` están **por encima** de ese contenedor, así que aplanarlos a un blob de HTML tira modelado que ya está medido y construido | **16 de las 32 capturadas** — toda página con **>1 sección propia** (KB **5/7** · L4 **6/6** · sueltas **5/19**). La más clara: `/es/soporte/centro-de-ayuda/` y `/es/empresa/` (**11 secciones** cada una) contra `/es/aviso-legal/` (**1**). C1 las representa igual; los otros tres no. ⚠ **El plan decía «≥ 30» y no reproduce: son 16 de 32, y NO es una cota** — las 16 restantes no son páginas (13 × 301 · 3 × 404), así que no hay nada que las suba. El «≥ 30» del plan salía de contar sobre 48 |
| **C2** · `MonoSeccion[]` tal cual + bloque de escape | el escape **se ejercita en 20 de las 32 páginas leídas**, o sea que no es una vía de escape: es el modelo. Un escape que traga el caso mayoritario no acota nada | **20 páginas** — KB **7/7** · L4 **1/6** · sueltas **12/19**. ⚠ **El plan decía «12» contando INSTANCIAS DE TIPO** (5 `toggle` + 5 `video` + `map` + `slider`); en la unidad que la afirmación usa —la página— son **20**, y con los dos tipos que v3 recupera: **9** sueltas con `code` y **3** páginas con `blurb`. Y **dentro de los 6 hubs L4 sólo hay 1** (`/es/recursos/`, `blurb`), que por §*un discriminador hallado en UNA SOLA instancia no es un discriminador* sigue significando lo que el plan concluyó: **L4 no podía elegir** entre C2 y C3 |
| **C4** · dos colecciones (`hubs` 13 · `paginas` 35) | **R1 — «cero arquetipos»** (`ESQUEMA:1216`, `:1524`). Los hubs no estrenan arquetipo, así que partir en dos colecciones **por familia de ruta** no tiene una diferencia de content type que lo sostenga: sería separar por procedencia, no por forma. ⚠ **Y esta tensión hay que dejarla escrita**: `PLAN-FASE-3.md` §F3-3 listaba C4 **vivo** sin reconciliarlo con R1, y §1.5b Razón 3 lo **favorece** (§2j.3) | **2, y bastan para separarlo de C3** — `/es/redes-hibridas-…-grabacion-webinar/` y `/es/politica-de-seguridad-de-la-informacion/`, con **0 secciones propias**: en C4 la colección que las aloje puede declararlas de otra forma; en C3, colección única, **el campo de bloques tiene que ser opcional para las 32** *(⚠ argumento SUPERADO en la 93.ª: el opcional **nunca fue el mecanismo** —§2j.3c—; quien expresa esas 2 es una colección distinta (S1) y un campo rico (S2). La comparación C3/C4 no cambia de resultado, pero **esta celda ya no dice por qué**)* |

> **Lo que C3 paga por elegirse, dicho con su número y no escondido:** esas dos
> páginas de cero secciones propias obligan a que `bloques` sea **opcional en las
> 32**, que es §1.5b **Razón 2** al pie de la letra —*la obligatoriedad deja de
> vivir en el esquema*—. **Es el coste conocido de la decisión, no un
> descubrimiento**: se paga a cambio de no partir la cola larga en dos
> colecciones que R1 no sostiene.

### 2j.2 · ⚠ CORRIGE el recuento de tipos: no son 7, y el instrumento tenía una lista escrita a mano

La 90.ª concluyó *«los tipos fuera de `MonoSeccion[]` no son 2, son 7»* y de ahí
el coste de C3 como *«7 tipos nuevos»*. **Derivado en esta tanda, son 9 fuera y
8 nuevos**, y el error es §regla 9 caso 7: `modulos-f33-v2.mjs` comparaba contra

```js
const YA = new Set(["text","image","button","blurb","cta","divider","code","gallery"]);
```

—**una lista de literales escrita a mano dentro de la derivación**—, que acredita
a `MonoSeccion[]` **cuatro tipos que no expresa**: `blurb` y `gallery` existen
como bloque pero en **`MODULOS_KB`**, y `code` y `divider` **no existen en
ninguna unión del repo** (derivado: `grep 'slug:' packages/cms-config/src/bloques/*.ts`).

`modulos-f33-v4.mjs` no reescribe la lista —eso sólo reinicia el reloj— sino que
**deriva `UNION_MONO` del registro de bloques**, y separa la retícula
(`section`/`row`/`column*`, que `flujo`/`anchoPct`/`filas`/`columnas` ya modelan)
de los módulos de contenido.

| conjunto | v2 decía | **v3, derivado** |
|---|---|---|
| hubs KB (7) | 2 | **2** — `toggle` · `video` ✅ sin cambio |
| hubs L4 (6) | **NINGUNO** | **1** — `blurb` (1/6) |
| sueltas (19) | **5** | **7** — `code` (**9/19**) · `fullwidth_slider` · `slide` · `blurb` · `map` · `slider` · `icon` |

**La unión que C3 necesita, con su cota:** **12 tipos de contenido distintos**
en la capa propia · **9 fuera de `MonoSeccion[]`** · **8 sin definición en el
repo** (`code` · `toggle` · `video` · `fullwidth_slider` · `slide` · `map` ·
`slider` · `icon`) · **1 copiable** de otra unión (`blurb`).

> **El tipo que más se había perdido es `code`, y es el segundo más frecuente de
> las sueltas (9/19)** — las páginas de formulario e informe técnico. No es un
> caso raro de la cola: es un tercio del subconjunto.
>
> ⚠⚠ **Y esto NO es un choque con C3: la refuerza.** Los 2 tipos que aparecen
> corrigen a C2 **en contra**: `code` y `blurb` mandan al escape **12 páginas
> más** de las que el plan contaba. C3 sale **más caro** (8 definiciones en vez
> de 7) y **mejor sostenido**. Lo que la corrección sí hace es subir el coste
> que la fase tiene que presupuestar.
>
> ✅ **Y DEJA DE SER UNA COTA EL MISMO DÍA.** Se escribió *«derivada de 32 de
> 48; las 16 sin capturar pueden añadir tipos»*, y al pagar la precondición
> resultó que **las 16 no son páginas** (13 × 301 · 3 × 404). No quedan páginas
> por capturar, así que **la unión de 12 tipos es COMPLETA para las 32**, no un
> mínimo. Con sus **32 de 32 páginas con todas sus hojas**, es además medible.

### 2j.3 · La condición de reapertura — obligatoria, porque C3 va CONTRA Razón 3

**§1.5b Razón 3 favorece C4, no C3.** *Fusionar luego es más barato que separar
luego; entre dos opciones reversibles se toma la que se deshace mejor* — y la
que se deshace mejor es **la que empieza separada**, porque deshacerla es
fusionar. C4 son dos colecciones y C3 es una, así que **Razón 3 ordena C4 antes
que C3**. Es la misma maquinaria que ya eligió **dos apps** en CMS-0f (§*de DOS
apps a una: mecánico y electivo*) y **dos colecciones** en §1.5b.

**C3 se elige igualmente porque R1 pesa más que la asimetría**: no hay dos
content types, hay uno; separar por familia de ruta crearía una frontera que
ninguna medida sostiene, y la asimetría de deshacer sólo arbitra **cuando
ninguna medida arbitra** (§CMS-0f, *«el criterio, escrito ANTES de la
elección»*). Aquí una medida arbitra: **0 tipos de contenido separan a los hubs
de las sueltas como content type distinto** — comparten `text`, `image`,
`button`, y lo que los diferencia (`toggle`/`video` contra `code`/`map`/
`slider`) son **tipos de bloque dentro de la misma unión**, no campos
obligatorios distintos.

> **CONDICIÓN DE REAPERTURA, explícita.** `paginas` se parte en dos colecciones
> el día que se cumpla **cualquiera** de estas tres, y no antes:
>
> | # | qué tendría que pasar | por qué reabre |
> |---|---|---|
> | **RA-1** | que aparezca **un campo obligatorio de verdad en un subconjunto y no en el otro** — no un bloque, un campo del documento | es Razón 2 con evidencia: la obligatoriedad volvería a poder vivir en el esquema, que es lo único que C3 sacrifica hoy |
> | **RA-2** | ⚠⚠ **REESCRITA POR TERCERA VEZ EN LA 93.ª — su denominador es 1, y lo que vigila ya NO es «que `bloques` sea opcional».** Ver la caja de debajo | — |
> | **RA-3** | que un hub estrene **plantilla** (no bloque): que R1 caiga | R1 es lo único que hoy pesa más que Razón 3. Si cae, Razón 3 vuelve a mandar y C4 gana |
>
> ### ⚠⚠ RA-2, TERCERA REDACCIÓN (93.ª, 2026-08-22) — y las dos anteriores vigilaban conjuntos que no existen
>
> | versión | qué vigilaba | por qué cayó |
> |---|---|---|
> | 1.ª (91.ª) | «las **2** páginas de cero secciones propias, si pasan a ser una forma poblada» | las 2 **no eran una forma**: eran dos formas de una instancia cada una (92.ª) |
> | 2.ª (92.ª) | «**1 + 1**, dos formas de una instancia cada una» | con **S1**, la mitad `-T` **sale de `paginas`**: ya no es un caso de esta colección, es una entrada de blog más entre 153 |
> | **3.ª (hoy)** | **UNA forma, UNA instancia: el régimen `--`** | — |
>
> **El disparador, reescrito con el dato de hoy:**
>
> > **RA-2 se dispara cuando aparezca una SEGUNDA página en régimen `--`** —sin
> > `et_pb_pagebuilder_layout` ni `et-tb-has-body`, con su contenido en
> > `entry-content`— **dentro de `paginas`.**
>
> **Y lo que vigila ha cambiado de objeto, que es lo que hay que leer dos veces.**
> Las dos redacciones anteriores vigilaban *«que `bloques` opcional deje de ser
> una excepción»*. Eso ya no es lo que está en juego: **el opcional no era el
> mecanismo** —§*un campo opcional no expresa un caso*—, y quien expresa el
> régimen `--` es **`cuerpoClasico`**, un campo con `n = 1`. Así que:
>
> > **RA-2 vigila que el SEGUNDO canal de contenido deje de ser una excepción.**
> > Con 1 instancia es un camino de render sin estrenar y declarado; con 2 pasa a
> > ser una forma, y una forma con su propio canal de cuerpo **es un content type
> > distinto** — que es exactamente lo que Razón 2 pedía para reabrir.
>
> ⚠ **El listón es bajo y hay que decirlo, no suavizarlo:** `n = 1` significa que
> **basta una página nueva** para reabrir CMS-3. No es una condición remota. Y
> **sólo puede crecer por CONTENIDO NUEVO**: la vía «aparece al capturar» quedó
> cerrada el 2026-08-22 — no quedan páginas por capturar.
>
> ⚠⚠ **Y lo que RA-2 NO vigila, que es la mitad que se cuela.** El régimen `--`
> es **el segundo más poblado del corpus entero** —**131 de 576 documentos
> capturados**, medido en `derivaciones/regimenes-corpus.log`—, e incluye los
> arquetipos **CASO (57)** y **FAQ (19)**, ya clonados. RA-2 mira **sólo dentro
> de `paginas`**: que el régimen sea común fuera de esta colección **no la
> dispara** y no debe leerse como que ya está disparada. Su denominador es 1 de
> **31**, no 1 de 576.
>
> **Y lo que costaría separar ENTONCES, escrito hoy que es barato** (§Razón 3:
> *para entonces ya se habrá escrito contenido en la forma mixta*): con las 32
> pobladas hay que **decidir fila por fila** de qué colección era cada
> documento —y el discriminador de ruta **no basta**, porque `/es/soporte/` es
> suelta y `/es/soporte/centro-de-ayuda/` es hub—, reescribir toda relación que
> apunte a `paginas`, y **re-aceptar las 31 a umbral cero** sobre el manifiesto
> de ese momento. Hoy la separación cuesta **editar un fichero de config antes
> de sembrar**.

### ⚠⚠ 2j.3b · LA UNIÓN SE ESCRIBIÓ Y SE PROBÓ (92.ª tanda) — Y EXPRESA **30 DE 32**

**Refutación MEDIDA, no una objeción.** `derivaciones/prueba-union-f33.mjs`
recorre las 32 capturas por EXTRACCIÓN —offline, sin abrir el original y sin
emitir una página— y pregunta si cada módulo cae en un bloque de la unión.
Publicado **por régimen**, porque el reparto nunca es uniforme:

| régimen | n | expresadas | NO expresadas |
|---|---|---|---|
| BUILDER (`B-`) | 22 | **22** | 0 |
| HÍBRIDO (`BT`) | 8 | **8** | 0 |
| PLANTILLADO (`-T`) | 1 | 0 | **1** |
| **SIN MARCADOR (`--`)** | **1** | 0 | **1** |
| **TOTAL** | **32** | **30** | **2** |

**Y la mitad honesta primero, porque decide cómo se lee: la refutación NO es
sobre los bloques.** Los 11 tipos de la unión expresan **313 de 313 módulos de
contenido**, y **0 tipos del corpus quedan sin correspondencia**. Lo que falla
son **dos documentos cuyo contenido NO SON MÓDULOS**.

**Las dos, nombradas** (§*toda página que la unión no exprese sale NOMBRADA, no
contada*):

| ruta | régimen | qué trae | dónde |
|---|---|---|---|
| `/es/politica-de-seguridad-de-la-informacion/` | **`--`** | **8387 car.** (`p,h2,ul,li,b`) | `entry-content` — plantilla CLÁSICA de WordPress |
| `/es/redes-hibridas-…-grabacion-webinar/` | `-T` | **5749 car.** (`h2,p,iframe,a,ul,li,…`) | `et_pb_post_content` |

**Dos cosas que el plan no decía, y las dos salieron de contar POR RÉGIMEN:**

**1 · Hay una CUARTA combinación de régimen, y está DENTRO de las 32.** El plan
decía «híbrido 8 · builder 22 · plantillado 2». Medido: **8 · 22 · 1 · 1**.
`/es/politica-de-seguridad-de-la-informacion/` no lleva
`et_pb_pagebuilder_layout` **ni** `et-tb-has-body` — lleva
`page-template-default` + `et-tb-has-header/footer`, o sea `<article><div
class="entry-content">`. La taxonomía `BT`/`B-`/`-T` de `CLAUDE.md` **no tiene
ese casillero**, y el caso no estaba entre las 16 que no existen: estaba
capturado desde el principio.

**2 · Las 2 «de cero módulos» NO son el mismo caso, y ninguna está vacía.** La
lectura de §2j.1 —*«son el caso que obliga al opcional»*— es **cierta en la
forma** (`bloques` ausente) y **falsa en el fondo**. Y una de las dos **ni
siquiera es de esta colección**: `/es/redes-hibridas-…-grabacion-webinar/` es
una **entrada de blog** (`single-post`, `postid-51434`), y aparece como
`<article id="post-51434">` en el bucle de `corpus/entradas-blog/…` con su
titular y su fecha. Está en el bucket `sueltas` **por su URL, no por su forma**.

> ⚠⚠ **POR QUÉ `bloques` OPCIONAL NO LAS CUBRE, que es el punto entero.** Un
> documento con `bloques` ausente se emite con cabecera, pie y **nada en
> medio**. Las dos responderían **200 sirviendo una página vacía** — §*una ruta
> que responde 200 no prueba que sirva CONTENIDO*, el mismo modo de fallo que
> costó seis páginas de `articulos-kb` servidas con cero módulos y todo lo demás
> en verde.
>
> **Y el negativo lo demuestra en vez de argumentarlo:** desactivando la
> comprobación *«sin capa propia PERO CON contenido»*, la prueba da **32/32 y
> exit 0** — el verde falso completo. Ese es el único cambio entre el veredicto
> real y el cómodo (`prueba-union-f33-neg.log`, sabotaje B).

**Qué cambia en la decisión: NADA de la elección, TODO del precio.** C3 sigue
siendo lo que el propietario eligió y 30 de 32 caen limpias. Lo que estaba mal
contado es el **coste**: §2j.1 lo cifró en *«`bloques` opcional en las 32»* y el
coste medido es *«`bloques` opcional **más** un segundo canal de contenido para
2 documentos cuyo contenido no son bloques»*. **Es un precio distinto y quién lo
paga es del propietario** — no se arregla ampliando la unión sobre la marcha,
que sería el reproche que tumbó a **C2** en pequeño (*un escape elegido sin
medir*).

**Las tres salidas, con lo que cada una cuesta — sin recomendación, porque no
toca:**

| # | salida | cuesta |
|---|---|---|
| **S1** | la webinar sale de `paginas` y entra en **`entradas-blog`**, que ya existe y ya tiene campo rico | **casi nada**, y es la que más evidencia tiene: su forma es la de una entrada, no la de una página |
| **S2** | `paginas` gana un campo rico **para el régimen `--`** (1 documento hoy) | un campo que **1 de 32** ejercita — §*un campo que ningún dato ejercita es un camino de render sin estrenar*, aquí con n = 1 |
| **S3** | el régimen `--` sale de la cola larga y espera a su segunda instancia | deja **1 ruta sin emitir**, declarada, en vez de un campo sin probar |

⚠ **Y esto cambia RA-2, que hay que releer con el dato nuevo:** RA-2 vigila que
«las 2 de cero secciones propias» no crezcan a forma poblada. Medido, **esas 2
nunca fueron una forma**: son **dos formas distintas de una instancia cada
una**. Así que RA-2 tal como está escrita vigila un conjunto que no existe, y su
denominador correcto es **1 + 1**, no 2. *(Y con S1 baja a **1** — tercera
redacción en §2j.3.)*

### ✅⚠ 2j.3c · CERRADA — EL PROPIETARIO TOMÓ **S1 Y S2**, Y S3 CAE (93.ª, 2026-08-22)

> ✅ **DECISIÓN DEL PROPIETARIO, 2026-08-22: se toman LAS DOS.**
> **S1** — `/es/redes-hibridas-…-grabacion-webinar/` sale de `paginas` y entra
> en **`entradas-blog`**. **S2** — `paginas` gana campo rico para el régimen
> `--`. **S3 cae**: no queda ninguna ruta sin emitir.

**Estado tras aplicarlas, medido y no supuesto** (`prueba-union-f33.log`,
exit 0):

| régimen | n | expresadas |
|---|---|---|
| BUILDER (`B-`) | 22 | **22** |
| HÍBRIDO (`BT`) | 8 | **8** |
| SIN MARCADOR (`--`) | 1 | **1** — por campo rico, `n = 1`, DECLARADO |
| **TOTAL `paginas`** | **31** | **31** · 313 de 313 módulos |

**TRES regímenes en `paginas`, no cuatro:** el `-T` se fue con la webinar.

#### Por qué S1, y por qué NO es la razón que parecía

**La razón que parecía —«así se expresa»— está REFUTADA por el contrafactual
del negativo.** Desaplicando S1, la prueba sigue dando **32/32 y exit 0**:
el campo rico que S2 añadió **se traga también el `et_pb_post_content` de la
webinar**. O sea **0 instancias separadoras**: por expresabilidad, «la webinar
en `paginas`» y «la webinar en `entradas-blog`» predicen exactamente lo mismo,
y elegir ahí sería §*dos modelos que predicen lo mismo en todo tu dominio son
uno solo*.

> ⚠⚠ **Y esto es una constricción sobre las dos salidas, no una curiosidad: S1
> y S2 NO SON INDEPENDIENTES.** Con S2 puesta, S1 deja de ser necesaria *para
> que el documento se exprese*. Si S1 se hubiera justificado por
> expresabilidad, sería **un escape que traga el caso que decía acotar** — el
> reproche exacto que tumbó a C2, cometido esta vez por la puerta de atrás.

**La razón que SÍ la sostiene es DATO SERVIDO SIN CAMPO DONDE CAER**, que es el
criterio del punto 3 un nivel más abajo — del campo en vez del documento:

| campo del JSON-LD | n de 32 | ¿separa? |
|---|---|---|
| `articleSection` | **1** | **SÍ** — sólo la webinar (`Seminarios Web`) |
| `author` | **1** | **SÍ** — sólo la webinar (`Equipo de marketing y comunicación`) |
| `datePublished` | **32** | **NO** — lo traen TODAS |

**Alojar la webinar en `paginas` PERDERÍA su categoría y su autor.**
`entradas-blog` los tiene (`categorias` es `required`); `paginas` no tiene
ninguno de los dos. Y la forma corrobora: su `<body>` es
`single single-post postid-51434 single-format-standard … tax-resource`,
**la misma firma que las 152 capturas de `corpus/entradas-blog`**.

> ⚠ **`datePublished` no separa, y decirlo importa más que el resto.** Es el
> candidato obvio —*«es una entrada, luego tiene fecha»*— y lo traen las 32.
> Citarlo como evidencia habría sido §*comprueba que Y VARÍE en el dominio
> donde se midió*: nombrar una propiedad del conjunto entero creyendo que
> discrimina. Lo que sí abre —y **no** lo decide esta tanda— es que **las 31
> sirven `datePublished` y `paginas` no tiene campo de fecha**: dato servido sin
> modelar, fichado en `PENDIENTES-QA.md` §F3-3-FECHA-SIN-CAMPO.

#### Por qué S2, y por qué NO S3

**S2 no inventa contrato: hereda uno censado.** `campoHtml` es el helper que ya
usan `entradas-blog`, `terminos-kunakpedia`, `documentos-cientificos` y
`articulos-kb`, con `validaHtmlCorpus` y su contrato medido en **209/209**
documentos (43 etiquetas · `<script>` prohibido · rango 275–69 784). Ésa es la
diferencia con C2: C2 metía un escape **cuyo contrato nadie había medido**.

**Y está EJERCITADA, corrida y no inspeccionada** (`valida-campo-rico-f33.log`):
el cuerpo del régimen `--` son **9 169 caracteres de marcado / 8 364 de texto**
—el 8 387 de §2j.3b es el mismo cuerpo con otro corte— con **5 etiquetas**
(`b · h2 · li · p · ul`), y **PASA**. Con su control: el mismo cuerpo con un
`<script>` inyectado **RECHAZA por su motivo** (§3.3 · T4). Sin ese control el
`true` no valdría nada — `validaHtmlCorpus` devuelve `true` de entrada para lo
que no es `string`, así que una extracción fallida habría dicho «PASA» sin mirar
un carácter (§regla 6).

**S3 cae, y su coste era el que no se quería pagar:** S3 dejaba **1 ruta sin
emitir** para no estrenar un campo con `n = 1`. Pero esa ruta **existe y se
sirve hoy**, y el campo no es un salto al vacío: es un helper con contrato
heredado y validación ejercitada. Entre «un camino de render con `n = 1`
declarado» y «una baja declarada», se toma el primero. **Lo que queda SIN
PROBAR es la geometría — que es exactamente lo que queda sin probar en los
otros 30.**

> ⚠ **Lo que S2 NO compra, dicho con su número:** `n = 1` es **un camino de
> render sin variación que lo pruebe**. Está probado que el campo **ADMITE** el
> dato; no está probado que lo **RENDERICE** — para eso hace falta el
> comparador de dos lados, y §2j.4 dice que hay **0 ejes comparados**. Y es
> justo lo que dispara **RA-2** en su tercera redacción: con `n = 1`, basta una
> segunda página en régimen `--` para reabrir CMS-3.

**Evidencia:** `derivaciones/prueba-union-f33.log` (control, exit 0) ·
`prueba-union-f33-neg.log` (5 casos: A muerde · **B queda MUDO y se sustituye
por B′** · B′ muerde por el mismo motivo · contrafactual C con 0 separadoras) ·
`valida-campo-rico-f33.log` · `regimenes-corpus.log`. Las congeladas de la 92.ª
se conservan con su alcance en el nombre:
`prueba-union-f33-{,neg-}92a-SIN-S1-NI-S2.log`.

### 2j.4 · Lo que esta decisión NO decide

| | |
|---|---|
| **la forma de cada uno de los ~~12~~ 11 bloques** | ⚠ **escrita en la 92.ª** (`bloques/paginas.ts`), con **el n de cada tipo al lado y lo SIN PROBAR declarado**: 5 de las 8 definiciones nuevas descansan en **n ≤ 2 páginas** y **3 en n = 1 página** (`icon` · `map` · `slider`; en unidad INSTANCIA son **2**, y el «4» que circulaba en `PLAN-FASE-3` §F3-3 es falso en las dos — §2j.5).<br>✅ **93.ª: el INSTRUMENTO de DOS LADOS ya existe** — `qa:f33-cmp`, negativo 3/3, sobre un piloto de 6.<br>✅ **95.ª: el LADO DEL ORIGINAL ya está DERIVADO** — `qa:f33-geo` (negativo 4/4), 31 páginas × 2 anchos, offline con sus hojas: §2j.5.<br>⚠⚠ **Y «0 ejes comparados» SIGUE SIENDO CIERTO, que es lo que hay que leer dos veces**: *«la geometría del original está derivada»* y *«hay 0 ejes comparados»* son **las dos verdad**, porque comparar exige **dos** lados y el del clon no existe. La segunda es la que manda (`PENDIENTES-QA.md` §F3-3-EMISION) |
| ~~**si `slide` es bloque o hijo de `slider`**~~ | ✅ **CONTESTADO OFFLINE en la 92.ª: es HIJO**, medido en el árbol con pila (`et_pb_fullwidth_slider_0 > et_pb_slides > et_pb_slide_0`, **2/2**). **La unión son 11 bloques, no 12.** `mod-v4` lo contaba como tipo de primer nivel porque barre con un regex plano: los dos instrumentos son correctos en lo que miden y **sólo uno contesta la pregunta que el pre-registro hacía** |
| **`code`** | qué es exactamente su contenido (formulario incrustado, script) y si cae bajo la whitelist de §3 o necesita campo propio |
| ~~las 16 sueltas sin capturar~~ | ✅ **resuelto el mismo día: no son páginas** (13 × 301 · 3 × 404). La unión **no** es un mínimo: es completa para las 32 |
| **quién emite los 13 REDIRECTS** | no es esta colección. Un 301 no es un documento de `paginas`; es un mapa de redirecciones del enrutado (§4), y F3-3 tiene que decir dónde vive |

**Evidencia:** `docs/research/cola-larga/derivaciones/modulos-f33-v4.mjs` +
`mod-v4.log` (registro de bloques derivado, control §sondas 4: el parseo tira si
casa con 0 slugs) · pre-registro en
`docs/research/cola-larga/PRE-REGISTRO-CMS-3.md`.

## ✅ 2j.5 · LA GEOMETRÍA DE LA COLA LARGA — DERIVADA DEL CORPUS (2026-08-22, 95.ª tanda)

*(Es de **CMS-3**, no de CMS-4: la geometría es el hueco que §2j.4 dejó abierto.
Va aquí, entre §2j.4 y la decisión de enrutado.)*

**El lado del ORIGINAL, que era la mitad que faltaba.** `qa:f33-geo` (negativo
**4/4**) renderiza las **31** capturas por `file://` **con sus hojas**, red
cortada, y mide `mt`·`mb`·`pt`·`pb` y `anchoPct` **a 1440 y a 390 en la misma
corrida y sobre el mismo módulo** — que es lo que el test A exige para poder
aplicarse. Congelada: `medidas/f33-geo.json`.

> **Dominio derivado, no enumerado:** la membresía sale de `medidas/f33-rutas.json`
> (94.ª, commiteada), y se **cruza contra el `<body>`** — **0 `single-post` en
> las 31**, o sea que `f33-rutas` y S1 concuerdan. El recorrido da **313 módulos**,
> que **cuadra con `arbol-f33.log` y con §2j.3c**: otro instrumento, mismo objeto.

### ⚠⚠ 1 · EL ANCHO DE FILA, y por eso la cola larga puede SEPARAR lo que KB no podía

**Primero el contenedor, antes de comparar contra ningún default** (§*un default
de ritmo se escribe CON SU CONTENEDOR o no se escribe*):

| régimen | anchos de fila medidos |
|---|---|
| `B-` | **1238.39** (×57) · 1296 (×2) |
| `BT` | **911.75** (×19) · 784.09 (×1) |

**La cola larga tiene LAS DOS filas que este repo conoce en la misma
colección**: la de **1238.39** del monográfico y la de **911.75** de
`articulos-kb`. Eso es lo que la convierte en el **tercer** arquetipo capaz de
volver a separar las dos variables que en KB estaban confundidas.

**Y las separa.** `2.75 % de 1238.39 = 34.05` · `2.75 % de 911.75 = 25.06`:

```
fila 1238.39 →  89 de 220 módulos en 34.05   repartos {1_2, 1_3, 2_3, 4_4}
fila  911.75 →  12 de  48 módulos en 25.06   repartos {1_2}
módulos con el default de OTRA fila: 0
```

> ✅ **LA INSTANCIA SEPARADORA, y basta una:** **`1_2` lleva `25.06` en una fila
> de 911.75 y `34.05` en una de 1238.39.** El MISMO tipo de columna con DOS
> defaults según el ancho de su fila ⇒ **el tipo de columna NO los explica y la
> FILA sí.** `CLAUDE.md` §Test A queda **reproducido de forma independiente en un
> tercer arquetipo**, y no por acumular aciertos sino por la única instancia que
> distingue los dos modelos (§*un modelo se elige por lo que lo SEPARA*).
>
> ⚠ **Con su matiz, porque el acierto solo engañaría:** a **911.75** el default
> sale con **un solo reparto**, así que ese ancho **por sí solo no separaría
> nada**. Lo que separa es el **cruce** entre los dos anchos, no cada fila suelta.

### ⚠⚠ 2 · TRES COSAS QUE CAMBIAN CÓMO SE LEE TODO LO DEMÁS

**(a) EL CERO NO ES UN VALOR ESCRITO, Y EL TEST A NO PUEDE VERLO.** La premisa
del test A es que **hay algo escrito**; un `margin-top` computado de **0** es el
**valor inicial** de la propiedad, y sale igual a 1440 y a 390 **porque nadie
escribió nada**. Leerlo como *«px absolutos ⇒ CAMPO»* convierte un defecto del
navegador en un campo del modelo — y aquí habría sido masivo: **24 de 49 celdas**
(tipo × eje) son exactamente eso. Salen **SIN ESCRIBIR**, que no es ni campo ni
plantilla, y para el modelo pesa lo mismo que SIN PROBAR: **no se cablea**.

**(b) «EN EL DOM» Y «CON CAJA» NO SON LA MISMA MEDIDA** (§*un censo de NODOS y
un censo de LO QUE SE VE*):

| | en el DOM | con caja |
|---|---|---|
| módulos | **313** | **277** |
| filas | 113 | 79 |
| columnas | 179 | 145 |

Los **36** sin caja son **desplegables cerrados** —**30 `video`** · 5 `text` · 1
`button`—: están en el DOM y **no están en la página**. Y no es higiene de
recuento: **`getComputedStyle` sobre un contenedor cerrado no resuelve
porcentajes contra nada**, así que su `mb: 0` no significa «el editor puso 0».
Meterlos en la distribución habría fabricado un pico en 0 que el original no
tiene. Es §*el mecanismo de PESTAÑAS* (§7d) con el envoltorio cambiado — con una
diferencia que importa: **aquí el CONTENIDO sí está capturado**, y lo que falta
es sólo su geometría.

**(c) `anchoPct` NO SIGNIFICA LO MISMO EN TODOS LOS TIPOS.** Se mide
`caja / columna`: en un módulo de **bloque** eso recupera el ancho declarado
—`image` da **33 · 50 · 75 · 80 · 85 · 100**, limpios—; en uno de nivel
**enlínea** la caja **es la del contenido** —`button` da 33.36 · 38.76 · 62.16…—.
**25 instancias en 2 tipos** (`button` · `blurb`) quedan **SIN MEDIR por el
instrumento, no por el original**.

### 3 · LOS DE n PEQUEÑO — y NO son el mismo caso

| tipo | n | qué contesta cada test |
|---|---|---|
| **`icon`** | 3 inst · **1 pág** | **el test B APLICA** (hay hermanos) **y contesta: NO varían.** Varianza cero, que *no prueba plantilla*. Quien decide es el **test A**: `mb 29.59` **se mueve** a 390 ⇒ **PLANTILLA**. `anchoPct 86.93` también se mueve, pero el test A **no vale para la caja** ⇒ SIN PROBAR. `mt`/`pt`/`pb` son 0 ⇒ sin escribir. **De sus 5 ejes, UNO tiene veredicto** |
| **`fullwidth_slider`** | 2 inst · 2 pág | varianza **ENTRE** instancias: los 4 ejes de ritmo valen **0 en las dos** ⇒ **sin escribir**, no plantilla |
| **`map`** · **`slider`** | 1 inst · 1 pág | **INDECIDIBLE, y ésa ES la respuesta.** Medido con su n: los 4 ejes a **0** y `anchoPct` **100**. **No se cablea** |

### ⛔ CORTE LIMPIO 2 · lo que NO se deriva del corpus, NOMBRADO

| tipo | n | por qué | qué haría falta |
|---|---|---|---|
| **`video`** | 30 inst · **0 con caja** | viven en desplegables **cerrados** | medir con **INTERACCIÓN** — eje `comportamiento`, hoy **0/31** |
| **`map`** | 1 inst | ni A ni B separan con una instancia | una **segunda** instancia |
| **`slider`** | 1 inst | ídem | una **segunda** instancia |

**Más 24 CELDAS** (tipo × eje) sin escribir, **nombradas una a una** en la
congelada. **En ninguno de los dos casos se elige un valor plausible.**

### Lo que esta derivación NO contesta

- **nada del CLON**: es **un solo lado**. `qa:f33-cmp` sigue a **0 ejes
  comparados en las 31**, y las dos frases son verdad a la vez;
- el **contenido** de los módulos (eso lo derivó `arbol-f33`);
- **si un valor DEBE ser campo**: los tests dicen qué está probado; la decisión
  de modelo es de quien escriba el bloque, con esto delante;
- el ancho **declarado** de los 25 módulos de nivel enlínea;
- la geometría de los **36** módulos sin caja;
- los **anchos intermedios**: se miden 1440 y 390, que es donde el contrato es de
  **fidelidad** (§8.1).

> ⚠ **Y dos derivas del INSTRUMENTO, cazadas y declaradas** (detalle en
> `PENDIENTES-QA.md` §F3-3-GEOMETRIA): un `loading=lazy` sin neutralizar hacía
> que dos corridas del mismo código dieran **269 y 270** módulos con caja —§regla
> 16: la explicación aburrida era la buena, y el diff estaba **confinado a
> `image`**—; y la espera que lo arregla **hubo que acotarla**, porque sin tope
> colgó la sonda hasta el `protocolTimeout` (§regla 17: *una espera sin tope no
> da rojo, se AGOTA*). Con las dos puestas, **dos corridas consecutivas congelan
> IDÉNTICO**.

## ✅ 2j.6 · LO QUE EL CAMPO RICO DE LA COLA LARGA **NO** MODELA — cascarón y consulta (2026-08-23, 97.ª tanda)

*(Es de **CMS-3**: cierra qué entra en `campoHtml` y qué no, que es la frontera
que paró la siembra en la 96.ª. Va aquí, después de la geometría.)*

**El corpus de F3-3 traía 5 etiquetas fuera del censo de 43 de `campoHtml`, y la
pregunta de modelo no era «¿se amplía el censo?» sino «¿qué SON».** Medido
recorriendo el HTML servido de los **178 campos ricos** y publicando la cadena de
ancestros de cada una de las **120 ocurrencias**
(`docs/research/cola-larga/derivaciones/clasifica-f33.{mjs,log}`):

| contenedor | ocurrencias | qué es | qué implica para el modelo |
|---|---|---|---|
| `ol.kunak-breadcrumbs` | 25 `<meta>` en 10 páginas | **CASCARÓN** — lo genera el tema | **lo retira el extractor**; el censo NO se toca |
| `div.et_pb_blog…bucle-entradas` | 3 `<article>` | **CONSULTA** — bucle de entradas | **no entra en el campo rico** |
| `div.scientific-list-content` | 23 × `<article>·<header>·<svg>·<path>` | **CONSULTA** — listado del CPT | ídem |

**CONTENIDO: 0 de 120.** Y ese 0 es un dato y no un cero por construcción: el
control en línea de la derivación prueba que el recorrido **sabe decir «fuera»**,
y TIRA si no separa.

### La decisión, en una frase

> **Un listado embebido dentro de una página NO es un campo del contenido de esa
> página: es una CONSULTA sobre otra colección.** Es §*un listado no tiene
> contenido propio* —que hasta hoy se había aplicado a **archivos enteros** (por
> eso no hay colección `blog` ni `recursos`)— aplicado **a escala de MÓDULO**, que
> es donde no estaba escrito.

**Y por eso el extractor retira el CONTENEDOR y no el MÓDULO:** lo generado se va,
y lo que quede al lado lo escribió una persona y se conserva. Medido: 12 módulos
tocados, **12 omitidos, 0 conservados**, con guarda de reconstrucción
(`chars(bruto) = chars(limpio) + Σ chars(retirado)`) y su pareja de negativos.

⚠ **No se eligió el criterio fácil.** Retirar por la clase `breadcrumbs` del
módulo acierta igual en las 31 — **0 instancias separadoras**, así que el acierto
no decide (§*dos modelos que predicen lo mismo en todo tu dominio son uno solo*).
Decide qué predicen **fuera**: por contenido, un futuro módulo con miga + párrafo
conserva el párrafo; por clase, lo pierde.

### Qué serviría las consultas — y la respuesta es «una tanda futura»

Un bloque de **listado embebido** que declare su consulta en vez de su HTML. Los
dos parámetros ya están medidos y no hay que volver al original:

| bloque futuro | consulta | evidencia |
|---|---|---|
| `bucle-entradas` | las **N más recientes** de `entradas-blog` (N = 3) | 3 de 3 tarjetas cruzan contra el corpus |
| `listado-cientifico` | **`documentos-cientificos` entera**, con filtro por `scientific-category` | diferencia simétrica **0 y 0** contra sus 23 |

**Mientras no exista, 2 páginas se sirven INCOMPLETAS y está declarado**, no
tapado: `recursos` conserva `<h2>Guías más recientes</h2>` sin lista debajo y
`documentos-cientificos` conserva su `scientific-filter` sin nada que filtrar. El
extractor lo imprime como `⚠ HUECO DECLARADO` y lo congela en `retirada.detalle`.
Ficha: `PENDIENTES-QA.md` §F3-3-CONSULTAS-EMBEBIDAS.

### ⚠ Lo que esta decisión NO decide

| qué | estado |
|---|---|
| la **whitelist** de `campoHtml` | **INTACTA**. Ni una etiqueta añadida: no hacía falta |
| el atributo `data-teams` de `empresa` | ✅ **DECIDIDO (D1, 2026-08-22) y aplicado en la 98.ª**: transformación de importación **T11**; `ATRIBUTOS_CENSADOS` **NO se amplía**. Las tres razones y el NO-OP por identidad de bytes (787 de 788): **§3.2d** |
| el `<img src>` a `upload.wikimedia.org` | ✅ **DECIDIDO (D2, 2026-08-22) y aplicado en la 98.ª**: **se deja ABSOLUTO**. Es lo que el original sirve, y la regla de no hotlinkear es sobre `kunakair.com`, para no depender del original. Estrena `imagen-pagina.srcExterno` — **§2j.7** |
| `ancho: "1_5"` ×10 | ✅ **DECIDIDO (D3, 2026-08-22) y aplicado en la 98.ª**: `1_5` **y** `1_6` en la misma migración versionada (`20260823_190450`), con la reversa probada. `1_6` entra **SIN EJERCITAR, con su denominador** — **§2j.7** |
| el módulo hermano `scientific-filter` | **SIN MEDIR.** Sus etiquetas están todas en el censo, así que no bloquea nada y ninguna medida se pronunció sobre él. Retirarlo «porque parece» sería clasificar por plausibilidad |

Los tres primeros nacieron con su cardinal en `PENDIENTES-QA.md`
§F3-3-BLOQUEOS-DE-SIEMBRA; su cierre está en §2j.7 (D2 y D3) y en §3.2d (D1).

## ✅ 2j.7 · LOS DOS BLOQUEOS DE MODELO QUE QUEDABAN — **el asset de FUERA (D2) y la retícula de QUINTOS (D3)** (2026-08-23, 98.ª tanda)

*(Es de **CMS-3**: cierra los dos huecos que §2j.6 dejó nombrados y que
`F3-3-BLOQUEOS-DE-SIEMBRA` cuantificó. El tercero —`data-teams`— es de §3.2d,
porque lo que decidió es una **transformación**, no un campo.)*

> ✅ **DECISIONES DEL PROPIETARIO, 2026-08-22.** Las tres se publicaron con su
> cardinal y sus salidas en `PENDIENTES-QA.md` §F3-3-BLOQUEOS-DE-SIEMBRA (97.ª),
> **sin recomendación**. Aquí se escriben las dos de esquema con su razón y con
> lo que cuestan.

### D2 · el asset alojado FUERA — `imagen-pagina.srcExterno`

**El dato:** 1 de las 71 imágenes de la cola larga es
`<img src="https://upload.wikimedia.org/…">` en `/es/empresa/`
(`derivaciones/bloqueos-f33.log` §media — **1 bloqueo de 93 comprobados**).

**La decisión: se deja ABSOLUTO. No se captura.** Es lo que el original sirve, y
**la regla de no hotlinkear es sobre `kunakair.com`** — su propósito es no
depender del original, no prohibir que una página cite un asset de un tercero.

#### Por qué es un CAMPO y no un `src` opcional a secas

`src` es `upload → media`, o sea que **sólo puede expresar un asset local**. Un
documento cuyo asset vive fuera **no cabe en el modelo**, y §*un campo opcional
NO expresa un caso — sólo permite que falte* dice qué pasaría si se dejara así:
la imagen saldría ausente y la página se serviría **con 200 y sin ella**.

> **La prueba de que un modelo expresa un corpus no es «¿cabe lo que hay?», sino
> «¿queda contenido SIN SITIO?»** — y aquí quedaba. Las dos preguntas se
> contestan distinto: la primera recorre los campos; la segunda, el documento.

**Y la obligatoriedad no desaparece: se MUEVE.** `src` deja de ser `required` y
`validaOrigenImagen` exige **exactamente uno** de `src` / `srcExterno`. Ni cero
—un módulo de imagen sin origen no da error, **no pinta**— ni dos, que sería un
dato ambiguo con el render eligiendo. El defecto se pone en la dirección que
grita.

#### El canal se declara EN EL ESQUEMA, no en la sonda

`custom: { canalDeMedia: "externo" }`. Es lo que hace que `qa:media-canales` lo
encuentre **caminando la config**, que es literalmente lo que §*el inventario de
media se deriva de los canales que el ESQUEMA declara* pide — y hasta hoy su
segunda mitad los derivaba de `NOMBRES_URL`, **una lista de literales dentro de
la sonda** (§regla 9, 7.º caso).

**Y sale en su propio cubo, con su cardinal**, porque meterlo en «sin dato» diría
lo contrario de lo que pasa:

| cubo | qué significa |
|---|---|
| ejercido | tiene dato y la guarda lo resuelve contra `apps/web/public` |
| **sin dato** | declarado y vacío: **hueco futuro** |
| de otro sembrador | existe, pero esta sonda no lo mira |
| **EXTERNO** ← nuevo | **tiene dato (1) y NO se resuelve localmente.** No hay fichero que capturar, así que su ausencia de la carpeta **no es un hueco** — y por eso **no entra en `origenesACapturar`** |

⚠ **Y con D2 el canal nacía VIGILADO POR NADIE**, así que se paga en la misma
tanda: `cms:sondeo` hace `ctx.media = async () => 0` —sustituye el resolutor por
una constante— y su *«0 defectos de INSTRUMENTO»* **no dice nada del canal que
anuló**. Desde hoy publica sus **CANALES ANULADOS con sus llamadas**, junto al
veredicto y no en un anexo (§regla 14, mitad 2: si la limitación cambia lo que
una frase de cierre afirma, se escribe también en esa frase). Son **dos**:
`creaContexto().media` y `payload.create`.

### D3 · la retícula gana `1_5` **y** `1_6`

| valor | estado | denominador |
|---|---|---|
| **`1_5`** | **EJERCITADO** | **10** instancias — dos filas de cinco columnas en `/es/servicio-de-reparacion/` (10 bloqueos de 173 comprobados) |
| **`1_6`** | **SIN EJERCITAR** | **0** de 313 módulos y **0** de 113 filas de la cola larga; **0** en los otros tres arquetipos. Divi lo sirve; este corpus no lo trae |

**Los dos entran porque `ancho` es LA RETÍCULA y no el enum de los valores
vistos** — que es lo que su propio docstring lleva escrito desde que Petróleo
estrenó cuatro valores nuevos. Escribirlo sólo desde lo visto es cómo se llega a
la cuarta migración de enum en cuatro arquetipos, y ésta es la cuarta.

> **SIN EJERCITAR no es 0.** `1_6` es un camino de render **sin estrenar**
> (§*un campo que ADMITE un caso y que ningún dato de calibración EJERCITA*), y
> sale nombrado en vez de darse por soportado.

**Y de paso, la §sondas 3 que lo destapó:** el docstring de
`validaReticulaPagina` **ya listaba `1_5+1_5+1_5+1_5+1_5`** entre los siete
repartos medidos y el `select` **no lo podía expresar**. El comentario decía una
cosa y el campo otra; no lo cazó ningún `check` ni ninguna sonda — **lo notó
Payload al sembrar**, con 10 rechazos en una página. Corregido en el CAMPO, que
es donde estaba el defecto.

#### La migración, con su reversa PROBADA

Un `select` de Payload sobre Postgres es un **tipo enum**, así que los dos
valores van en la **misma** migración versionada
(`20260823_190450_f3_3_ancho_quintos_y_media_externa`), junto con las dos
columnas de D2. Medido sobre la DB poblada por el pipeline completo y **antes**
de sembrar `paginas`:

| | filas | tablas | enums `_ancho` | `src_id` | `src_externo` | migraciones |
|---|---|---|---|---|---|---|
| antes | **3333** | 80 | 8 ×3 | `NOT NULL` | — | 19 · batch 1 |
| `up` | 3334 | 80 | **10 ×3** | `NULL` | `varchar` | 20 · batch 2 |
| `down` | **3333** | 80 | 8 ×3 | `NOT NULL` | — | **19 · batch 1** |

La fila de diferencia es **el registro de la propia migración**. Y el control no
es el total: el censo **tabla a tabla** de antes y después de la reversa es
**idéntico línea a línea** (`diff` sin salida) — §*un cardinal es un contenedor y
absorbe la membresía*: `3333 → 3333` sería exacto con dos tablas compensándose.

⚠ **La reversa sólo es limpia MIENTRAS `paginas` no tenga la fila externa**: el
`down` hace `src_id SET NOT NULL`. Con `empresa` sembrada **fallaría**, y estaría
bien que fallara — es el esquema diciendo que el dato ya no cabe en la forma
vieja. Por eso se prueba **ahí**, que es donde la pregunta tiene respuesta.

⚠ Y `payload migrate:down` imprime *«Rolling back batch 2 consisting of 20
migration(s)»*. **El 20 es de su mensaje, no de lo que hace**: revirtió UNA, y
las 19 anteriores siguen en batch 1 — comprobado en `payload_migrations`, no
leído en el log.

### Lo que §2j.7 NO decide

| | |
|---|---|
| **si el asset de Wikimedia se captura algún día** | D2 dice que hoy no. Si alguna vez se quisiera, es **añadir** (subir el fichero y mover el valor de `srcExterno` a `src`), no cambiar el modelo |
| **la CLASE «asset de tercero»** | se ha medido **una** instancia. Que haya más en otros arquetipos está **SIN MEDIR** — el inventario los nombraría con su cero el día que se declaren |
| **qué RENDERIZA `srcExterno`** | no hay plantilla todavía (la emisión es otra tanda). El campo expresa el dato; pintarlo es de quien construya el componente |
| **`1_6` en el render** | camino sin estrenar. Sale en `qa:nunca-vistos`, no se da por soportado |

## ⛔ 2j.8 · EL BLOQUEO QUE QUEDABA Y NADIE HABÍA NOMBRADO — **`paginas` NO LLEVA EL RÉGIMEN, Y SIN ÉL EL CLON NO PUEDE ELEGIR SU CASCARÓN** (2026-08-24, 99.ª tanda)

*(Es de **CMS-3**, y es la primera pregunta de esta colección que **no es del
contenido sino de la capa de ARRIBA**. Sube al propietario.)*

**Lo destapó ir a construir la plantilla**, no releer nada — que es §*una
afirmación de completitud se verifica EJERCITÁNDOLA*. §2j.7 cerró los dos
bloqueos de modelo *del contenido* y dejó escrito *«qué RENDERIZA `srcExterno`
… no hay plantilla todavía (la emisión es otra tanda)»*. Al escribir esa
plantilla aparece que **falta un campo que ninguna ficha pedía**.

### El mecanismo, con sus números

El régimen del `<body>` decide **qué cascarón sirve el tema**, y de ahí sale el
**ancho de fila**, y de ahí el **default de `mb` de cada módulo**:

| régimen | n | fila | cascarón | default `mb` (2.75 % de la FILA) |
|---|---|---|---|---|
| `B-` | **22** | **1238.39** | sin barra lateral | **34.05** |
| `BT` | **8** | **911.75** | columna `1_4` de barra + `3_4` de cuerpo | **25.06** |
| `--` | **1** | — | plantilla clásica (`entry-content`) | — |

**Los dos cascarones YA EXISTEN medidos y construidos** —`B-` es el de
SECTOR/MONOGRÁFICO, `BT` es literalmente el de `articulos-kb`, cuya
`ColumnaAncha` mide **911.75**—. Lo que falta **no es construir nada**: es el
campo que elige.

### Que el documento no lo lleva, DERIVADO

`derivaciones/f33-regimen-discriminador.{mjs,log}` — 31 documentos de la DB
contra el régimen medido en `medidas/f33-geo.json`:

| candidato | acierta | veredicto |
|---|---|---|
| `cuerpoClasico` presente ⇒ `--` | **31/31** | ✅ el régimen `--` **sí** es derivable |
| la **RUTA** (`centro-de-ayuda` ⇒ BT) | 30/31 | ❌ **REFUTADO** |
| **cualquier** campo del documento | — | ❌ **52 pares** de régimen distinto **indistinguibles** |

> ⚠ **30 de 31 no es «casi bien»: es refutado**, y lo que se publica es la
> separadora, no el porcentaje (§*un modelo se elige por lo que lo SEPARA, no
> por lo que acierta*). Hay una **por cada dirección**:
>
> | separadora | medido | la ruta diría |
> |---|---|---|
> | `/sistema-interno-de-informacion` — **raíz, un segmento** | **BT** | B- |
> | `/soporte/servicio-de-reparacion` — **bajo `soporte`** | **B-** | BT |

### Por qué es CAMPO por la regla de la casa, y no por comodidad

El régimen **varía dentro de la misma colección** —22 · 8 · 1— así que pasa el
**test B** (la variación intra-arquetipo) con holgura. Lo escribió **quien
construyó cada página en WordPress** al elegir plantilla, exactamente como
`prefijo` o `flujo`: es la huella del editor, no de quien maquetó.

### Las tres salidas, con su coste — **sin recomendación, porque no toca**

| # | salida | cuesta |
|---|---|---|
| **R1** | `paginas` gana un campo de régimen (`regimen` o `barraLateral`), **derivado del `<body>`** por el extractor, que **ya lo calcula** para su censo (`regimenDe()`) | migración versionada + re-extraer + re-sembrar. **El dato ya está en el corpus**: no hay que volver al original. Es lo único que deja el cascarón MEDIDO |
| **R2** | emitir sólo lo que **hoy es derivable** — el régimen `--`: **1 página** | ninguna decisión de modelo hoy, y **30 rutas sin emitir**. El pre-registro bajaría de 413 a **383** |
| **R3** | cablear la ruta (`centro-de-ayuda` ⇒ BT) | **0 coste hoy y una separadora YA CONOCIDA en contra**. Es el arreglo falso —el valor de la mayoría esperando a la tercera instancia— y se nombra para que conste que se consideró |

> ⚠⚠ **R2 SE CORRIGIÓ EN LA MISMA TANDA, porque su primera redacción era
> implementable sólo en apariencia.** Decía *«emitir las 22 `B-` y dejar las 8
> `BT`»* — y **excluir exige lo mismo que elegir**: para dejar fuera las 8 hay
> que saber cuáles son, o sea el campo que R1 añade. Escribirla sin el campo
> obligaría a **una lista de 8 rutas a mano** (§regla 9, 7.º caso: *un conjunto
> enumerado a mano es un dato recordado*), que envejece contra el corpus en
> silencio. Lo que R2 emite de verdad es **1 página**, y su coste real es **30
> rutas sin emitir**, no 8. La corrección no elige por el propietario: le
> devuelve **el precio real de la opción**.

### Por qué esto PARA la emisión en vez de degradarla

No se toma la salida cómoda —emitir las 31 con el cascarón `B-` y «arreglar la
barra después»— y las tres razones tienen número:

1. son **326.64 px** de ancho de cuerpo en 8 páginas. Todo lo que se midiera
   encima sería una medida **de otra página**;
2. el arreglo posterior se leería como **REGRESIÓN** contra una línea base
   construida sobre el cascarón equivocado: una **FAMILIA DE CALIBRACIÓN**
   fabricada a mano;
3. `f33-cmp` quedaría **sin poder adjudicar**. Mide `docH · base · nSecciones ·
   nFilas · nModulos · enlaces`; con el cascarón inventado un Δ tendría **tres
   causas simultáneas** —cascarón mal · geometría ausente · 4 tipos sin pintar—
   y ninguna medida las separa.

### Lo que §2j.8 NO dice

| | |
|---|---|
| **que el cascarón esté sin medir** | los dos están medidos **y construidos**. Falta el campo que elige entre ellos |
| **que `f33-geo` se equivocara** | derivó la geometría del ORIGINAL, que es lo que decía derivar — y de ahí sale `anchoDeFilaPorRegimen`, que es justamente la medida que hace visible este hueco |
| **que reabra CMS-3** | la unión de 11 bloques expresa **313 de 313** módulos y eso no cambia. Esto es de la capa de **arriba** del contenido |
| **qué pasa con el `--`** | **sí** es derivable (`cuerpoClasico`, 31/31), así que esa página no depende de esta decisión |

## ✅ 2j.9 · CMS-5 · QUÉ CASCARÓN LLEVA CADA PÁGINA — **EL CAMPO DERIVADO (R1)** (2026-08-24, 100.ª tanda)

> ✅ **DECISIÓN DEL PROPIETARIO, 2026-08-24.** Las tres salidas se publicaron con
> su coste en §2j.8 y en `PENDIENTES-QA.md` §F3-3-CASCARON-SIN-DISCRIMINADOR
> **sin recomendación**, y se eligió **R1**. Aquí se escribe con su razón, con
> **por qué caen R2 y R3** —cada una con su separadora o su número, no con un
> adjetivo— y con la **reversa probada**.
>
> ⚠ **Esta tanda cierra el MODELO. NO emite ninguna ruta**: la emisión (E1)
> sigue declarada en `PENDIENTES-QA.md` §F3-3-EMISION, y las 382 rutas de la
> línea base **no se movieron ni una** (diferencia simétrica **0 y 0**).

### Lo aplicado, en una línea

`paginas` gana **`regimen`**, un `select` **obligatorio** de cuatro valores,
**derivado del `<body>` del corpus** por `regimenDe()` —la misma función que el
extractor **ya llamaba** para su censo—. El coste real de R1 era exactamente el
que §2j.8 estimó: *«el dato ya está en el corpus: no hay que volver al
original»*, y resultó literal — **la extracción es una línea**.

| régimen | n medido | cascarón | default `mb` |
|---|---|---|---|
| `B-` | **22** | sin barra lateral (SECTOR/MONOGRÁFICO, fila 1238.39) | 34.05 |
| `BT` | **8** | barra `1_4` + cuerpo `3_4` (`articulos-kb`, fila 911.75) | 25.06 |
| `--` | **1** | plantilla clásica del tema (`entry-content`) | — |
| `-T` | **0** | ⚠ **SIN EJERCITAR**, declarado — no recortado |

**El reparto reproduce el 22 · 8 · 1 que sostiene que es campo**, y se comprobó
**en los dos extremos**: en la extracción (`f33-extraido.json`) y **en la DB**
(`SELECT regimen, count(*) FROM paginas`). Que cuadre en el destino y no sólo en
el origen es lo que distingue «el extractor lo calcula» de «el clon lo tiene».

### Por qué cae R3 — y no es un adjetivo, es una separadora por dirección

R3 (cablear la ruta) acierta **30/31**, y **30 de 31 no es «casi bien»: es
refutado**. Lo que se publica es la separadora, no el porcentaje:

| separadora | medido | la ruta diría |
|---|---|---|
| `/sistema-interno-de-informacion` — **raíz, un segmento** | **BT** | B- |
| `/soporte/servicio-de-reparacion` — **bajo `soporte`** | **B-** | BT |

**Y el campo aplicado las sirve bien las dos**, comprobado en la extracción: es
la prueba de que R1 funciona **justo donde R3 falla**, que es el único sitio
donde las dos se distinguen. Con las otras 29 los dos modelos predicen lo mismo,
así que el denominador real de esta elección es **2**, no 31.

### Por qué cae R2 — por su precio real, que no era el de su primera redacción

R2 («emitir sólo lo derivable hoy») cuesta **30 rutas sin emitir**, no 8: su
primera redacción decía *«emitir las 22 `B-` y dejar las 8 `BT`»* y **excluir
exige lo mismo que elegir** — para dejar fuera las 8 hay que saber cuáles son, o
sea el campo que R1 añade. Sin él haría falta **una lista de 8 rutas a mano**,
que envejece contra el corpus en silencio (§regla 9, 7.º caso).

### La reversa, probada — y la VENTANA del `up`, medida y no deducida

El detalle con sus censos está en la cabecera de
`migrations/20260824_155444_f3_3_regimen_cms5.ts`. Lo que hay que saber aquí:

| | filas | tablas | migraciones |
|---|---|---|---|
| poblada con `up` | **4103** | 130 | 21 |
| tras `down` | **4102** | 130 | **20** |

**La única línea que se movió en el censo tabla a tabla es
`payload_migrations`** —el registro de la propia migración— y las **31 filas de
`paginas` sobreviven**. El control no es el total: `4103 → 4102` sería exacto
con dos tablas compensándose.

⚠ **Y la mitad que hay que saber: `required` es `NOT NULL` sin defecto, así que
el `up` sólo corre con `paginas` VACÍA.** No se dedujo de la semántica de SQL:
se corrió **dos veces** sobre la tabla poblada y las dos dieron `exit 1` con
`column "regimen" ... contains null values`, con **rollback limpio** las dos
(censo idéntico línea a línea, 0 enums huérfanos). **Eso no es un defecto: es el
esquema diciendo que las 31 filas viejas no tienen el valor medido**, y es la
razón por la que la reversa se prueba antes de sembrar (§regla 30). El pipeline
no lo sufre porque `cms:reset` reaplica las versionadas sobre vacío.

**Y no se tapa con un `defaultValue`**, que era la salida cómoda: un defecto
benigno serviría las **8 `BT` con el cascarón de las 22** y nadie se enteraría
(§regla 6). El defecto se deja en la dirección que GRITA.

### Lo que §2j.9 NO dice

| | |
|---|---|
| **que las 31 se emitan** | **no se emite ninguna**. E1 sigue pendiente; las 382 rutas no se movieron (diferencia simétrica 0 y 0, `derivaciones/entorno-t100.log`) |
| **que la geometría esté derivada** | sigue en **0 ejes comparados** (§2j.4). El campo dice *qué cascarón*; **no** dice qué marcado lleva cada módulo dentro |
| **que `-T` esté soportado** | está **admitido y SIN EJERCITAR, 0 de 31**. Es un camino de render sin estrenar, declarado con su denominador |
| **que el ancho de fila sea función del régimen** | **no lo es del todo**, y está medido: `f33-geo.json` §`anchoDeFilaPorRegimen` da `BT` {911.75 ×19, **784.09 ×1**} y `B-` {1238.39 ×57, **1296 ×2**}. El campo transporta el RÉGIMEN; las minorías de ancho son otra pregunta y siguen **SIN DERIVAR** |

> ⚠⚠ **CORREGIDO 2026-08-24 (102.ª): EL `mb` DEL MÓDULO YA NO ES CONSUMIDOR DE
> ESTE CAMPO — Y ERA EL ÚNICO QUE SE LE ATRIBUÍA EN EL CUERPO.**
>
> La justificación de CMS-5 dice, y con razón, que *«no es cosmético: el ancho de
> fila resuelve el default de `mb` de cada módulo (**34.05** contra
> **25.06**)»*. El hecho es cierto; **la implicación no**. `qa:f33-clases` (102.ª)
> leyó la CASCADA del original y la regla que sirve ese default es
>
> ```
> .et_pb_gutters3 .et_pb_column_1_2 .et_pb_module { margin-bottom: 5.82% }
> ```
>
> o sea **un porcentaje de la COLUMNA, distinto por reparto**. Un `%` se resuelve
> solo contra su contenedor, así que los mismos `5.82%` dan 25.06 en una fila de
> 911.75 y 34.05 en una de 1238.39 **sin que la hoja sepa nada de la fila**.
> `f33.css` lo escribe así, derivado, y **no recibe el régimen**.
>
> **CMS-5 no se reabre**: el campo sigue siendo necesario y su razón sigue en pie
> — **elegir el CASCARÓN**, que es lo que §2j.8 nombró. Lo que cambia es que su
> lista de consumidores tenía uno de más, y ese uno se usaba para decir que la
> hoja no se podía escribir sin él. Se podía.
>
> Es §*el veredicto lo da la salida servida, no la fuente que uno supone
> responsable*: se estaba razonando sobre px medidos teniendo la declaración
> escrita al lado, en el mismo documento.

## ✅ 2k · CMS-4 · QUIÉN SIRVE LAS 31 — **EL PLANO EXISTENTE (E1)** (2026-08-22, 95.ª tanda)

> ✅ **DECISIÓN DEL PROPIETARIO, 2026-08-22.** Las tres salidas se publicaron con
> su coste en `PENDIENTES-QA.md` §CMS-4 (94.ª tanda) **sin recomendación**, y se
> eligió **E1**. Aquí se escribe con su razón, con **por qué caen E2 y E3** —cada
> una con su separadora, no con un adjetivo— y con su **condición de
> reapertura**, que hace falta porque **E1 se toma CONTRA lo que §1.5b Razón 3
> favorece** (abajo).
>
> ⚠ **Esta tanda escribe la decisión. NO la implementa**: la emisión es la
> siguiente, y sigue declarada en `PENDIENTES-QA.md` §F3-3-EMISION.
>
> ✅✅ **IMPLEMENTADA EL 2026-08-24 (104.ª). E1 EMITE: 382 → 413 rutas, y el
> reparto salió EXACTO al elemento.**
>
> | pieza | predicho | emitido |
> |---|---|---|
> | `/[slug]` — tercer catálogo | 19 | **19** (189 → 208) |
> | `/centro-de-ayuda/[...ruta]` | 4 | **4** (5 → 9) |
> | `/soporte/[...ruta]` | 4 | **4** (1 → 5) |
> | `/recursos/[...ruta]` | 3 | **3** (41 → 44) |
> | `/empresa/[...ruta]` — **ruta nueva** | 1 | **1** (0 → 1) |
> | **total** | **413** | **413** |
>
> Leído por **diferencia simétrica, no por neto**: **31 nuevas · 0
> desaparecidas**. El neto habría dado «+31» igual con una ruta perdida dentro —
> y extender un catch-all toca las rutas ya verificadas de `articulos-kb`, donde
> **emitir de MENOS no da error**.
>
> · el cascarón lo elige **`regimen`** (CMS-5), con `switch` exhaustivo por tipo:
>   `-T` tiene `case` propio que **TIRA** (0 de 31, SIN EJERCITAR) y el `default`
>   asigna a `never`, así que un quinto valor rompe el **typecheck** en vez de
>   renderizar `undefined` — que en React no falla, **no pinta**;
> · `qa:slugs` **limpio**, y `paginas` entró **sola**: 19 en el plano · 29
>   publicados, sin tocar la sonda, porque sus familias se derivan del registro;
> · `BANDA.colaLargaB` = **193.72 / 196.58**, la base EN CRUDO del arquetipo,
>   medida **antes** de construir sobre el lado del original ya congelado.
>
> ⚠ **Y lo que la emisión NO cierra, con su cardinal:** el lado del **CAMPO** de
> `f33.css` está **SIN ESTRENAR** — el extractor escribe **`clavesEscritas: 0`**
> y el HTML servido no trae **ni una** variable `--f33*` (control en positivo:
> 120 ficheros con `f33-seccion`). O sea que lo que la comparación pueda probar
> de esa hoja son **sus DEFAULTS**, y **nada** del camino de override.

**La forma, en tres piezas** (reparto derivado en `medidas/f33-rutas.json`, 94.ª):

| pieza | n | qué se hace |
|---|---|---|
| **plano de raíz** | **19** | `/[slug]` despacha un **TERCER catálogo**, junto a `entradas-blog` y `terminos-kunakpedia` |
| **catch-all** | **11** | `centro-de-ayuda` (4) · `soporte` (4) · `recursos` (3) extienden su `generateStaticParams` |
| **ruta nueva** | **1** | `/empresa/premios-y-reconocimientos` — no hay plano que la sirva **ni que la estorbe** |

### Por qué E1, y no es «la menos mala»: es la decisión que este repo YA TOMÓ

**E1 no estrena patrón — es `ENRUTADO.md` §3 punto 2 aplicado por tercera vez**,
y ese documento lo escribió con el hueco ya previsto:

> *«Un solo `[slug]` de raíz para las familias planas (blog, término, **y lo que
> venga**), despachando por slug contra los catálogos — exactamente el patrón que
> `/sectores/[slug]` ya usa para servir dos arquetipos.»*

O sea que la pregunta de CMS-4 **no era si el patrón vale**: vale, está probado
dos veces (`/sectores/[slug]` sirve SECTOR y MONOGRÁFICO desde la 1.ª tanda;
`/[slug]` sirve blog y término desde grupo A) y **vigilado** (`qa:slugs` impone
la unicidad ENTRE familias, que es el punto 4 del mismo documento). La pregunta
era **si merece la pena tocar rutas verificadas**, y ésa sí es del propietario.

**La razón, con su número: 0 URLs cambian.** Es la regla 1 del proyecto
—*fidelidad al píxel y a la topología de URLs*— y es lo único que separa a E1 de
E2 de forma que ninguna medición discute.

### Por qué caen E2 y E3 — con sus separadoras

| salida | cae por | separadoras |
|---|---|---|
| **E2** · prefijo propio para la cola larga | **rompe 19 URLs vivas.** Sería la **primera desviación estructural del clon**, y es literalmente la salida **(b)** que `ENRUTADO.md` §3 ya descartó para grupo A —allí eran 187 URLs, aquí 19: **el mismo error, más barato, y sigue siendo el mismo error**—. Elegir E2 no es tomar una decisión nueva: es **revertir una tomada**, y revertirla sin que ninguna medida nueva la contradiga | **19** — las 19 páginas de un segmento. Bajo E1 su URL es la del original; bajo E2, otra. Ninguna otra salida las mueve. ⚠ Y son **producto, no fidelidad**: quien las visite hoy por la URL del original recibe un 404 |
| **E3** · emitir sólo las 12 prefijadas | **no cierra F3-3**, que es la fase entera. Deja **19 rutas sin emitir** para no tocar 3 verificadas, y el proyecto ya tiene escrito cómo se resuelve ese cambio: **con su antes/después**, no evitándolo | **19** sin emitir, **y las mismas 19**: E3 y E2 se separan de E1 por el mismo conjunto, con distinto síntoma —E2 las sirve en otra URL, E3 no las sirve—. Lo que las separa **entre sí** son las 12 prefijadas, que E3 sí emite |

### El coste, declarado y no escondido

**3 rutas verificadas se tocan**, y son los `generateStaticParams` de los tres
catch-all. La única con contenido verificado detrás es
`/centro-de-ayuda/[...ruta]`, que hoy emite **los 6 artículos de KB** con
`dynamicParams = false`. **Entra con su antes/después a umbral cero sobre esas 6
rutas** — no es un extra de la tanda que emita: es parte de ella.

**Y lo que NO cuesta, derivado hoy y no supuesto** (`derivaciones/cms4-reclamos-f33.mjs`
+ `cms4-reclamos.log`), en las dos direcciones (§*una comprobación retroactiva
se enmarca en LAS DOS DIRECCIONES*):

| dirección | cruce | resultado |
|---|---|---|
| **¿lo viejo estorba a E1?** | los **6** slugs de raíz que `articulos-kb` reclama sin usar (§F3-3-REGISTRO-SOBRE-RECLAMA) ∩ los **19** que E1 baja al plano | **0 de 6.** Siguen LATENTES: E1 **no** los activa |
| **¿E1 estorba a lo viejo?** | los **19** de E1 ∩ las **4** familias del registro (`entradas-blog` 152 · `terminos-kunakpedia` 37 · `articulos-kb` 6 · `productos` 5 = **200 slugs**) | **0 colisiones.** E1 es sembrable sin tocar ninguna familia existente |

> ⚠ **Los dos ceros son de HOY y se leen con su fecha.** No dicen que nunca vaya
> a haber colisión: dicen que la guarda que la impondría —`qa:slugs`, que desde
> la 94.ª **deriva sus familias del registro**— no tiene nada que rechazar con el
> contenido que existe. `paginas` entra en esa guarda **sola** el día que se
> siembre, sin que nadie toque la sonda; y `paginas` ya lleva
> `enElPlano: (doc) => !doc.prefijo`, así que reclama **19** y no 31.

### ⚠ E1 va CONTRA §1.5b Razón 3 — y por eso lleva condición de reapertura

**Se cita el criterio CON SU OPERACIÓN, para que el signo no se pueda invertir al
releerlo** (§regla 23): *entre dos opciones reversibles se toma la que se deshace
mejor, y la que se deshace mejor es **la que empieza SEPARADA**, porque
deshacerla es **fusionar**, que es el lado barato.* Aquí la separada es **E2**
—plano propio— y la fusionada es **E1** —tres catálogos en un plano—. **Razón 3
ordena E2 antes que E1.**

**E1 se elige igualmente porque la FIDELIDAD pesa más que la asimetría**, y la
maquinaria es la misma con la que R1 le ganó a Razón 3 en §2j.3: la asimetría de
deshacer sólo arbitra **cuando ninguna medida arbitra**. Aquí una medida arbitra
—**19 URLs vivas**— y además hay un matiz que conviene decir en voz alta:

> **La premisa de Razón 3 es «dos opciones REVERSIBLES», y E2 no lo es en la
> misma moneda.** Deshacer E1 cuesta *código de enrutado*; E2 **cambia el
> producto el día que se aplica** y su vuelta atrás vuelve a cambiar 19 URLs. O
> sea que E1 y E2 no compiten en el eje que Razón 3 mide, y aplicárselo tal cual
> compara dos cosas que no son del mismo tipo.

> **CONDICIÓN DE REAPERTURA, explícita** —obligatoria porque la decisión va
> contra el criterio (§regla 23, mitad 2). CMS-4 se reabre el día que se cumpla
> **cualquiera** de estas dos, y no antes:
>
> | # | qué tendría que pasar | por qué reabre |
> |---|---|---|
> | **RE-1** | una **colisión de slug entre familias en el plano de raíz que no se pueda resolver renombrando** — o sea, dos documentos que *tienen que* llamarse igual porque el original los llama igual | es lo único que hace caro el plano compartido. Hoy: **0 sobre 219 slugs** (200 registrados + 19 de E1), así que la condición está lejos **y su denominador se publica** |
> | **RE-2** | que `/[slug]` **deje de poder despachar por catálogo** — que dos familias necesiten resolución distinta para el mismo segmento (p. ej. una que dependa de la petición) | rompería el mecanismo, no la preferencia. Entonces la elección ya no sería E1-vs-E2 sino otra |
>
> ⚠ **Lo que NO reabre: que el número de familias crezca.** Tres catálogos en un
> plano no es peor que dos — `ENRUTADO.md` §3 lo escribió como *«y lo que
> venga»*, y el coste de cada familia nueva es **un despacho más**, no una
> frontera nueva. Leer «ya son tres, mejor partimos» sería exactamente Razón 3
> aplicada donde su premisa no se cumple.

### Lo que CMS-4 NO decide

| | |
|---|---|
| **quién emite los 13 REDIRECTS** | sigue abierto, y es del enrutado (§4), no de `paginas` (§2j.4). E1 no lo toca: un 301 no ocupa slug |
| **el orden de despacho dentro de `/[slug]`** | tres catálogos y una sola ruta: en qué orden se consultan es implementación, y **da igual mientras la unicidad se imponga** — que es lo que `qa:slugs` hace. Si alguna vez dejara de dar igual, eso es **RE-1** |
| **la GEOMETRÍA de las 31** | otra cosa completamente, y sigue en **0 ejes comparados** (§2j.4). Emitir sin derivarla es cómo se fabrica una FAMILIA DE CALIBRACIÓN |
| **si los 6 reclamos falsos de `articulos-kb` se quitan** | derivado que E1 **no** los activa (0 de 6), así que sigue siendo la ficha que ya era — `F3-3-REGISTRO-SOBRE-RECLAMA`, arreglo medido de una línea sobre una colección verificada |

## 7 · Decisiones abiertas, en un sitio

| # | decisión | bloquea |
|---|---|---|
| ✅ **CMS-4 · ¿QUIÉN SIRVE LAS 31 DE LA COLA LARGA?** — **CERRADA el 2026-08-22 (95.ª): el propietario tomó `E1`, el PLANO EXISTENTE. Escrita con su razón, sus separadoras y su condición de reapertura en §2k.** Enunciado original de la 94.ª debajo | **`0 de 31` colisionan literalmente y `30 de 31` SOLAPAN el plano de otra familia** — dos afirmaciones distintas y sólo la primera estaba medida. Reparto: **19 → `/[slug]`** (el plano de raíz de grupo A) · **4 + 4 + 3 → los catch-all de `centro-de-ayuda`, `soporte` y `recursos`**, los tres con `dynamicParams = false` · **1 sin plano**. Tres salidas con su coste en `PENDIENTES-QA.md` §CMS-4: **E1** `/[slug]` sirve una tercera familia (0 URLs cambian, se tocan 3 rutas verificadas) · **E2** prefijo propio (no toca nada, **rompe 19 URLs vivas**) · **E3** emitir sólo las 12 prefijadas. ⚠ **El precedente de que un plano sirva dos formas existe** (`/sectores/[slug]`), así que la pregunta no es si se puede: es **cuál se toma**. Lo que ya NO espera: la guarda — `qa:slugs` deriva sus familias del registro y `paginas` entra sola el día que se siembre | **la EMISIÓN entera de F3-3** (31 páginas) y, con ella, los 9 ejes de cobertura de la cola larga |
| ✅ **CMS-5 · ¿CÓMO SABE EL CLON QUÉ CASCARÓN LLEVA CADA PÁGINA DE LA COLA LARGA?** — **CERRADA el 2026-08-24 (100.ª): el propietario tomó `R1`, el CAMPO DERIVADO DEL `<body>`. Escrita con su razón, con por qué caen R2 y R3, y con la reversa probada en §2j.9.** Enunciado original de la 99.ª debajo | **`paginas` no lleva el RÉGIMEN, y sin él el clon no puede elegir.** Los dos cascarones **ya existen medidos y construidos** —`B-` = SECTOR/MONOGRÁFICO (fila **1238.39**), `BT` = `articulos-kb` (fila **911.75** con columna `1_4` de barra)—: lo que falta es **el campo que elige**. Y no es cosmético: el ancho de fila resuelve el **default de `mb`** de cada módulo (**34.05** contra **25.06**). Derivado (`derivaciones/f33-regimen-discriminador.{mjs,log}`): `cuerpoClasico` ⇒ `--` acierta **31/31** (o sea que el `--` **sí** es derivable), la RUTA acierta **30/31 y queda REFUTADA** por **2 separadoras, una por dirección** (`/sistema-interno-de-informacion` es **raíz y BT**; `/soporte/servicio-de-reparacion` es **prefijada y B-**), y **ningún** campo del documento los separa: **52 pares indistinguibles**. ⚠ **30 de 31 no es «casi bien»: es refutado.** Tres salidas con su coste en `PENDIENTES-QA.md` §F3-3-CASCARON-SIN-DISCRIMINADOR: **R1** campo derivado del `<body>` que el extractor **ya calcula** · **R2** emitir 23 y dejar 8 declaradas · **R3** cablear la ruta, que es **el arreglo falso** y se nombra para que conste | **la EMISIÓN de F3-3** (las 31), y con ella los 9 ejes de cobertura de la cola larga — o sea lo mismo que CMS-4 desbloqueó y esto vuelve a bloquear una capa más arriba |
| ⛔ **CMS-BOTON-ALINEACION** *(abierta 2026-08-24, 102.ª — fichada, NO añadida)* ⚠ **SUBE JUNTO A `CMS-GUTTERS`: comparten MECANISMO — ver §7h**  | **`et_pb_button_alignment_*` es CAMPO por test B, con TRES ejes responsive, y el clon lo pierde ENTERO.** Derivado del HTML servido (capa propia, sin `<style>` ni `<script>`): **11 de 13 botones** en **4 rutas de 31** — escritorio `center`×10 · `right`×1 · tablet 9 · phone 9, y los tres ejes son **independientes**. Es geometría: la clase compila a `text-align` sobre el envoltorio, y `qa:f33-clases` cuenta **74 overrides ganadores de `text-align`** del editor. Estado derivado con `grep` sobre el fuente **sin comentarios** (la primera lectura dio falso positivo desde un comentario): `CuerpoPagina.tsx` **no lo emite** y `bloques/contenido.ts` **no tiene el campo**. ⚠ **Abre decisión de esquema, no es transcripción**: tres ejes responsive son un grupo de campos y una migración | **la fidelidad de 11 botones en 4 rutas** cuando se emitan. No bloquea la hoja |
| ⛔ **CMS-GUTTERS** *(abierta 2026-08-24, 102.ª — fichada, NO añadida)* ⚠ **SUBE JUNTO A `CMS-BOTON-ALINEACION`: comparten MECANISMO — ver §7h** | **el canal de la retícula tiene DOS valores y la variable que manda no está en el modelo.** `margin-right` de la columna no-última da **`5.5%` ×55** y **`3%` ×11**, y lo sirve `.et_pb_gutters<n> .et_pb_column` — un ajuste **de la FILA** que el editor elige. Lo separan 1:1 **dos** ejes y están **CONFUNDIDOS**: las **3 únicas filas con `gutters2` de 113** son justo las que llevan `1_4`/`1_5`, así que `reparto` es la **SOMBRA** de `gutters`. `f33.css` escribe por reparto —lo único que el clon puede emitir—, **correcto para las 31 y falso para la primera página que meta un `1_2` en una fila `gutters2`**. Afecta también a los porcentajes de `margin-bottom` del módulo, que salen de la misma tabla. ⚠ **n = 3 filas no basta para modelarlo** | **nada hoy.** Es deuda declarada de la hoja, con su separadora nombrada |
| ⛔ **CMS-F34-CATEGORIA** *(abierta 2026-08-26, 115.ª · mesa en `MESA-F3-4.md` §a)* ✅ **SEPARADORA CONTESTADA el 2026-08-26 (116.ª): es una CONSULTA, 0 de 4 refutaciones** | `separadora-categoria-116.{mjs,log,json}`. R1 texto propio **0 de 4 términos, 1 valor distinto ⇒ varianza CERO** · R2 imagen de cabecera **0** · R3 orden **4 de 4 por fecha desc**, con las fechas leídas en las **27 rutas** y no sólo en la página 1 · R4 pieza parcial **0 de 6 tipos**, quitado el contador de módulo de Divi. Lo único que varía: el nombre en el `h1` y la miga, qué módulo de blog de la plantilla se sirvió, y las tarjetas — que **son los miembros**. ⇒ el candidato **RELACIÓN sin archivo** queda sostenido **POR EL DATO**. Y la relación está medida por **DOS canales**: cobertura **152 de 152** entradas, cardinalidad **1:N con N ≤ 2**, positivos **2 de 152**. ⚠ **Y CORRIGE UNA UNIDAD DE LA MESA**: «27 rutas» no son 27 páginas — **19 sirven ≥1 tarjeta y 8 están VACÍAS**, así que el coste de 6.0 s se calculó sobre la unidad que las incluye. Las 8 siguen **SIN DIRIMIR** (200 real o URL inexistente), y eso se comprobó contra el archivo: `estados-114.json` cubre **1 de 27** | **la emisión de los archivos de categoría** — no bloquea las entradas |
| ~~⛔ CMS-F34-CATEGORIA (enunciado de la 115.ª)~~ | **¿COLECCIÓN o RELACIÓN sin archivo?** Unidades, las dos: **4 términos + 2 alias de codificación** (dan 301 a su gemela sin tilde) = **6 URLs declaradas** · **27 RUTAS** en disco, de las que **23** son `/page/N`. Régimen `-T` en 4/4 ⇒ lectura PLANTILLADA. Sirve contenido: **2–9 tarjetas**, cuerpo **7 650–21 405 B**, y la enlazan **15 de 35** formas de listado, así que *«no se replica»* está **descartado por el dato**. Coste: COLECCIÓN **27 rutas · 6.0 s** (A-SP13, 0.2228 s/ruta) · RELACIÓN **0**. **SEPARADORA**: un término con **contenido propio que no se derive de sus miembros** (texto de cabecera, imagen, orden distinto del de fecha) ⇒ COLECCIÓN; si no lo hay en los 4 ⇒ es una CONSULTA. **SIN MEDIR**: los 4 cuerpos **no se han comparado entre sí** (4 de 4). §regla 23 con su operación: la separada es RELACIÓN, porque deshacerla es **emitir 27 rutas** y lo contrario es **retirar URLs publicadas** | **la emisión de los archivos de categoría** — no bloquea las entradas |
| ⛔ **CMS-F34-AUTHOR** *(abierta 2026-08-26, 115.ª · `MESA-F3-4.md` §b)* ✅ **SEPARADORA CONTESTADA el 2026-08-26 (116.ª): el archivo SÍ tiene contenido propio, 7 de 7 ejes son CAMPO** | `separadora-author-116.{mjs,log,json}`. Comparados los **6 de 6** entre sí, con los ejes PARTIDOS entre lo propio y lo derivado de los miembros: **foto · nombre · cargo · redes · ¿tiene bio? · cuerpo de la bio** varían los 7; los 4 derivados (títulos y nº de listado, nº de tarjetas, encabezado de la bio) se publican aparte y **no cuentan**. ⇒ `author` **NO es «la plantilla del tema con la lista dentro»: es una ENTIDAD CON CAMPOS**. ⚠⚠ **Y ESO CAMBIA EL ESQUEMA, no sólo el veredicto: `foto`, `cargo`, `redes` y `bio` son OPCIONALES**, y el original **EJERCITA** el caso — `admin` y `mar_ramirez` traen la foto del TEMA (`user.svg`), el cargo VACÍO (`<p></p>`) y **ninguna bio**: **2 de 6** (§*un campo opcional no expresa un caso: sólo permite que falte*). ✅ **Y el `href` queda limpio POR EL DATO**, medido en **TRES canales**: original **612 absolutos / 0 locales** en 152 de 152, todos dentro de la ficha · cuerpo transformado **0**, y eso es CORRECTO porque la ficha vive en un módulo de la PLANTILLA, no en el `post_content` · **código del clon: 1 href, ABSOLUTO, 0 locales**, y el build emite **0** rutas `/author/`. ⇒ **«COLECCIÓN sin archivo» no crea ni un enlace roto** | **la emisión de los archivos de autor**; el CAMPO no espera, porque lo consumen las 152 entradas |
| ~~⛔ CMS-F34-AUTHOR (enunciado de la 115.ª)~~ | **¿COLECCIÓN con archivo, o sin él?** **6 términos · 34 RUTAS**, de las que **28** son la paginación de **un solo término** (`kunak`). Régimen **`--`** (cuarto casillero: plantilla PHP del tema). ⚠ **El «0 de 35 formas la enlazan» del censo es de los LISTADOS, no del sitio**: ampliado el barrido a `corpus/entradas-blog`, **152 de 152 entradas** traen `ficha-autor-revisor` con enlace y foto, así que *«no se replica»* queda **DESCARTADO POR EL DATO** — rompería la firma de las 152. Y la separadora del modelo está **contestada**: **2 de 152** entradas llevan **DOS autores con PAPELES DISTINTOS** («Revisado y aprobado por» + «Escrito por»), o sea **1:N CON PAPEL**, no un campo simple. Coste: con archivo **34 rutas · 7.6 s** · sin archivo **0**. **LO QUE QUEDA por separar**: si el archivo `/author/` tiene contenido propio (cuerpos de **1 469 a 12 978 B**) o es sólo la plantilla del tema. **SIN MEDIR**: la varianza entre instancias del régimen `--`, que `CLAUDE.md` declara SIN PROBAR — **6 de 6 sin comparar**, y es justo lo que decidiría | **la emisión de los archivos de autor**; el CAMPO no espera, porque lo consumen las 152 entradas |
| ✅ **CMS-F34-SECTOR** — **DECIDIDA por el propietario el 2026-08-26 (116.ª), en sus DOS mitades: (c1) SÍ a la relación · (c2) REPLICAR TAL CUAL el archivo, por precedente D2.5. Escrita con su razón y su condición de reapertura en §7i.** ⚠ **NO se implementa en esta tanda.** Enunciado original de la 115.ª debajo | **(c1)** la RELACIÓN `caso → sector`: **0 rutas**, y es la única pieza con **consumidor medido** (el filtro de `/casos-de-exito/`, 11 sectores + 1 comodín). **(c2)** el ARCHIVO `/es/sector/*`: **13 rutas · 2.9 s**, replicado tal cual — **las 5 que dan 301 se replican COMO REDIRECCIÓN, no como página**. `mineria` queda **fichada con sus 5 saltos, sin diagnosticar** (necesita red) | (c1) **el filtro de `/casos-de-exito/`** · (c2) **nada**: es cascarón vacío |
| ~~⛔ CMS-F34-SECTOR (enunciado de la 115.ª)~~ ⚠ **SON DOS DECISIONES, y la partición se MANTIENE: es lo que la hizo decidible en la 108.ª** | **(c1) la RELACIÓN `caso → sector`** — **0 rutas · 0 s**, y **tiene consumidor medido**: el filtro de `/casos-de-exito/`, **11 sectores + 1 comodín `"*"`** (los «12 botones» son 11+1). **(c2) el ARCHIVO `/es/sector/*`** — **13 rutas · 2.9 s**, y **no lo consume nadie ni sirve contenido**: **0 tarjetas en 6 de 6** por los TRES selectores, cuerpo ~3.3 KB de miga + barra lateral, y su paginación tampoco lista. Precedente para (c2): **`D2.5 · REPLICAR TAL CUAL`**, que ya decidió esto para las 55 que responden 200 sin listar. **11 términos · 13 RUTAS · 5 dan 301** — 4 al arquetipo SECTOR ya clonado y **`mineria` es un BUCLE a sí misma**. **SEPARADORAS**: (c1) un caso en DOS sectores, o un sector con orden propio; (c2) una URL `/sector/*` enlazada **desde fuera del filtro**. **SIN MEDIR y NO diagnosticado a propósito**: el mecanismo del bucle de `mineria` (**5 saltos**) — necesita red, y *un mecanismo sin medir que entra en una mesa la contamina* | (c1) **el filtro de `/casos-de-exito/`** · (c2) **nada**: es cascarón vacío |
| ⛔ **CMS-TITULO-RICO** | **`titulo` es `type: "text"` y 8 de 288 documentos del corpus llevan MARCADO dentro del `<h1>`** — `<sub>` de fórmula química (`O<sub>2</sub>`, `H<sub>2</sub>S`, `PM<sub>10</sub>`). Un campo de texto plano **no puede contener su dato medido**, y el clon ya sirve esos 8 aplanados en rutas dadas por verificadas. Reparto: **término 6/37 · blog 1/152 · caso 1/57 · doc. científico 0/23 · faq 0/19**. Ver §7f | **`L2`** (`/glosario` es donde se concentra: 6 de sus 37 términos) y la fidelidad de **8 rutas ya emitidas** |
| **CMS-ORDEN-L2** ✅ **DECIDIDA 2026-08-18 (81.ª) para sus DOS mitades con clave SERVIDA —se añade el campo de fecha a `casos` y `terminos-kunakpedia`—; la tercera (`documentos-cientificos`) queda DECLARADA y sin modelar. Ver §7g** ⚠ **ALCANCE AMPLIADO 2026-08-18 (80.ª): son TRES arquetipos, no uno, y uno de ellos BLOQUEA `L5` — ver §7g** | **¿cómo ordena el clon un ARCHIVO DE CPT?** El original ordena `/glosario` por **`datePublished` DESC (37/37)** y **ninguno de los dos tipos del clon tiene campo de fecha**. Dos mitades distintas, y **no se resuelven con la misma decisión** — ver §7e. ~~⚠ **AMPLIADA 2026-08-17 (75.ª): la pregunta no es sólo *«por qué campo»*, es también *«con qué DESEMPATE»*.**~~ ⛔⛔ **AMPLIACIÓN RETIRADA POR MEDIDA el 2026-08-18 (76.ª): su ÚNICA evidencia eran los «36 pares que oscilan entre builds del mismo código», y no eran builds del mismo código** — entre las corridas `-1` y `-2` se aplicó la salida `A` del 301 y entre la `-2` y la `-3` se revirtió; en la `-2` el clon sirve `/etiqueta/cov` con **`nTarjetas` 5 contra 6 del original**, o sea **un documento menos**, no un empate resuelto de otra forma. Sin esa evidencia **no hay ninguna medida que diga que el orden del clon sea inestable**, y hay 205 comparaciones de ruta a Δ0 contra el mismo build que dicen lo contrario. **La decisión vuelve a ser la de la 69.ª: sólo *«por qué campo ordena»*.** Un desempate total y estable sigue siendo sensato, pero entra **con esta decisión y con su antes/después**, no como reparación. Retirada y su prueba: `PENDIENTES-QA.md` §F3-AUDITORIA-76; la ficha original queda marcada `(RETIRADA)` en §F3-LH-LISTADO-QUE-OSCILA | **`L2` entera** (12 rutas) **y la estabilidad de los listados ya emitidos** |
| ~~**§2e**~~ | ~~`productos`: ¿UNA colección o DOS?~~ **✅ CERRADA (2026-08-03): UNA**, frontera medida = 1 y opcional | **nada** — el cubo C queda **vacío** y F2-1 puede congelar |
| §3.4 | tabla: nodo de Lexical vs block | ~~whitelist~~ → **nada**: §3.1d sacó el corpus del editor, así que las 35 páginas con tabla ya no dependen de esto. Sigue abierta como decisión de producto |
| ~~§3.3b~~ | ~~contenido de la allowlist de hosts de embebido~~ **✅ FIRMADA (2026-08-04): los 18 hosts censados, por HOST, con procedimiento de alta** — alcance grupo A; C-SP6 sigue abierto y entra por el alta | **nada** — la política está firmada y el saneador la ejecuta |
| ~~**CMS-SP-TIPO**~~ | ~~ninguna guarda mira el TIPO de la hoja, solo su nombre~~ **✅ CERRADA (2026-08-06): `npm run qa:tipo-hoja`, 10/10 hojas con marcado, negativo 5/5 — §7d**. ⚠ Y la cerró **la salida 2 de §7b, no la 1**: el Δ0 de render **NO PUEDE** verla, y eso está medido — el panel de un producto sólo se sirve si es el ACTIVO, y el activo es `monitor-calidad-aire` en las 10 instancias, así que **ninguna ruta emitida contiene el `<sup>`** | **nada** |
| ~~**CMS-0g · ORIGEN DE MEDIA**~~ | ~~`media` no guarda la ruta de origen del fichero~~ **✅ CERRADA (2026-08-06): campo de PROCEDENCIA `rutaOrigen`, nullable por construcción — §7c**. La premisa era verdadera y **la conclusión no se seguía**: `qa:media-colision` midió que `filename → ruta` **sí es una función hoy** (112 rutas · 0 repetidos) y **deja de serlo en la unión con el corpus** (646 · **1**, 12 referencias). O sea que tabular sobre `filename` funcionaría hoy y se rompería con contenido dentro | **nada** — desbloquea las 5 familias de F2-3 |

### ✅⚠ 7g · `CMS-ORDEN-L2` NO ERA DE `L2`: ES DE **TRES** ARQUETIPOS — **DECIDIDA EL 2026-08-18 (81.ª) PARA LAS DOS MITADES CON CLAVE SERVIDA** (abierta en la 80.ª)

> ✅ **DECISIÓN DEL PROPIETARIO, 2026-08-18 (81.ª tanda): SE AÑADE EL CAMPO DE
> FECHA DE PUBLICACIÓN a `casos` y a `terminos-kunakpedia`, y se construye `L5`.**
>
> **No es decisión de producto: es TRANSCRIPCIÓN.** La clave está **servida y
> medida** —`datePublished` en el JSON-LD de los singulares, reproduciendo el
> orden **57/57** en `/casos-de-exito/` y **37/37** en `/glosario/`—, así que
> modelarla es replicar lo que el original ya dice, no elegir un criterio.
> Es exactamente el discriminador de §*estructura que en realidad es contenido*:
> lo escribió quien editó, y por tanto **es un campo**.
>
> **Lo que NO decide, y va aparte:** la tercera mitad —`documentos-cientificos`—
> **queda fuera**, porque su desempate **no está servido por ningún canal
> medido** (**0 de 23** con `datePublished`). Ahí sí sería producto disfrazado de
> fidelidad, y su decisión es la 2.ª de esta tanda: **DECLARAR, no modelar**
> (`PENDIENTES-QA.md` §F3-LH-DESEMPATE-DE-L3).
>
> **La asimetría es la prueba de que la decisión discrimina:** las dos mitades
> con clave servida se transcriben, la que no la tiene se declara. Una decisión
> que hubiera cerrado las tres a la vez habría cableado un orden inventado en la
> tercera.

> ✅✅ **CONSUMIDA POR UNA RUTA EMITIDA — 2026-08-18 (82.ª tanda), y esto es lo
> que faltaba para que la decisión estuviera EJERCITADA y no sólo tomada.**
>
> La 81.ª dejó el campo modelado, migrado y sembrado, y **ninguna ruta lo leía**:
> de sus seis predicciones sólo `P6` pudo evaluarse. `L5` lo consume, y las seis
> quedan **cumplidas** (`PENDIENTES-QA.md` §F3-LH-L5). El orden que la ruta sirve
> reproduce el original **57/57**, cruzado por **tres canales**: el corpus
> (`qa:lh-fecha-orden`, 56 separadoras), la **DB** y el **HTML servido**.
>
> ⚠ **Y ejercitarla destapó lo que ninguna guarda podía ver: el campo NO había
> llegado a los TIPOS.** `fechaPublicacion` estaba en las dos colecciones de
> Payload y **no** en `CasoDeExito` ni en `TerminoKunakpedia` (`types/kunak.ts`).
> Nada dio error —`qa:cms-campos` 10/10, `qa:cms-decl` 64/64, el round-trip
> 352/352— porque **el round-trip compara DATOS y el tipo sólo lo ejercita quien
> lo lee**. Es §*una afirmación de completitud se verifica EJERCITÁNDOLA*: el
> primer consumidor la verificó, y hasta él la decisión estaba *tomada* pero no
> *probada*. Cerrado en los dos tipos, y los **7 controles transcritos a mano**
> que el tipo pasa a exigir (4 casos + 3 términos) entran además en la lista
> comparada de los dos extractores —**82→86** y **125→128** comparaciones— para
> que la transcripción no sea peso muerto (§sondas 3).
>
> ⚠ **Recordatorio de formato, que es donde se confunde:** el verbatim de este
> campo es **ISO 8601** en `casos` y en `terminos-kunakpedia` (el JSON-LD es su
> único canal), y el **literal español** en `entradas-blog` (que sí lo pinta).
> Reutilizar `aEpoch` de `cms/listados.ts` en un caso **tira en las 57**, que es
> la dirección buena del fallo; el parser propio es `aEpochIso` en
> `cms/casos.ts`. Ficha: §F3-LH-FECHA-DOS-FORMATOS.

> ✅ **EJECUTADA EN LA MISMA TANDA (81.ª).** El campo existe, está migrado,
> sembrado y verificado:
>
> | | |
> |---|---|
> | campo | `fechaPublicacion`, `type: "text"`, **`required: true`** en `casos` y `terminos-kunakpedia` |
> | por qué `text` | precedente `entradas-blog` (§2.4): **verbatim** al guardar, parseado al **ordenar** (`aEpoch` en `lib/cms/listados.ts`). Un `date` normalizaría, y normalizar es lo que el contrato de fidelidad prohíbe |
> | por qué `required` | §sondas 6 — un opcional que falte **no rompe nada y deja el listado en un orden inventado**; requerido mata el seed en el acto. Hoy lo traen **57/57** y **37/37**, así que no cuesta nada |
> | migración | `20260818_193649_f3_fecha_publicacion_orden` — **nullable → backfill → `SET NOT NULL`**, con los 94 valores DERIVADOS del corpus. La generada por `migrate:create` (`ADD COLUMN NOT NULL` sin defecto) **no servía**: las dos tablas ya tenían filas |
> | reversa | **probada** (disparador (b)): `migrate:down` EXIT 0, columna fuera, **57 y 37 filas intactas**, batch 1 sin tocar |
> | round-trip | ✅ **352/352 documentos idénticos en 13 colecciones** |
> | `qa:cms-campos` | ✅ 10/10 tipos, 0 campos sin contraparte |
> | fuente del dato | los extractores `cms:extractor-a` y `cms:extractor-c` leen `"datePublished"` del **JSON-LD**, **sin fallback a `""`** — si el canal se rompe, el seed muere |
>
> ⚠ **Un nombre, dos medios**: en `entradas-blog` el verbatim es la fecha
> **renderizada**; aquí es el **ISO**, porque estas dos colecciones no pintan
> fecha en ninguna parte. Fichado con su cardinal —**1 concepto · 2 formatos · 3
> colecciones**— en `PENDIENTES-QA.md` §F3-LH-FECHA-DOS-FORMATOS.

**Lo que sigue es el ALCANCE tal como se midió en la 80.ª**, que es lo que la
decisión de arriba consume:

`CMS-ORDEN-L2` se abrió con una instancia: *«el original ordena `/glosario` por
`datePublished` DESC (37/37) y ninguno de los dos tipos del clon tiene campo de
fecha»*. Al construir `L3` y medir `L5` aparecen **dos instancias más de la misma
clase**, y una de ellas **para una construcción**:

| arquetipo | colección | cómo ordena el ORIGINAL | ¿lo tiene el modelo? | consecuencia |
|---|---|---|---|---|
| `L2-glosario` | `terminos-kunakpedia` | `datePublished` DESC (**37/37**) | ⛔ no | `L2` sin construir |
| **`L5-casos`** | **`casos`** | **`datePublished` DESC (57/57)** | ⛔ **no** | **`L5` NO SE PUEDE CONSTRUIR** — §F3-LH-ORDEN-DE-L5-SIN-MODELAR |
| **`L3-sci`** | **`documentos-cientificos`** | **`anyo` DESC + ID de WP ASC** | **la mitad**: `anyo` sí, el desempate no | construido, con **17 de 23** tarjetas apoyadas en una coincidencia — §F3-LH-DESEMPATE-DE-L3 |

**Y las tres NO se cierran con la misma decisión, que es justo lo que la ficha de
`CMS-ORDEN-L2` ya advertía:**

- `casos` y `terminos-kunakpedia` **sí tienen la clave SERVIDA**: `datePublished`
  aparece en el JSON-LD de sus singulares y reproduce el orden **57/57** y
  **37/37**. Les falta el **campo**, no la medida;
- **`documentos-cientificos` NO la tiene**: **0 de 23** traen `datePublished`.
  Su clave primaria (`anyo`) sí está modelada; su desempate necesitaría un campo
  **que el original no sirve por ningún canal medido**, así que es una decisión
  de producto, no una transcripción.

> **La lección de alcance, que es la reutilizable:** `CMS-ORDEN-L2` se llamó así
> porque `L2` fue el primero en tropezar. **El orden es una exigencia de
> CUALQUIER listado sobre una colección**, y el modelo se midió contra los
> SINGULARES — donde la fecha no se pinta. Es §*una regla derivada sobre un
> dominio donde el caso NO SE DA*: cada índice nuevo ejercita algo que su
> singular no ejercitaba, y el hueco aparece **al construir**, no al modelar.

**Qué desbloquea qué:** un campo de fecha de publicación en `casos` desbloquea
`L5` **entero** (57 tarjetas en una página, sin paginación); el mismo campo en
`terminos-kunakpedia` es una de las dos mitades de `L2`. Los dos van con su
migración y su re-siembra desde el corpus, y **arrastran `qa:cms-campos` y
`qa:cms-roundtrip`**: es una tanda, no un parámetro.

### ⛔ 7f · CMS-TITULO-RICO · EL TITULAR LLEVA FÓRMULA QUÍMICA Y EL CAMPO ES TEXTO PLANO (2026-08-18, 76.ª tanda — NADA DECIDIDO)

**Qué se decide aquí: nada.** Se nombra la clase con su cardinal y se deja al
propietario, como `D2.4`, `D2.5` y `CMS-ORDEN-L2`.

**El hecho, derivado del corpus** (`<h1>` de cada documento, ¿contiene alguna
etiqueta?):

| colección | con marcado en el `<h1>` | de |
|---|---|---|
| `terminos-kunakpedia` | **6** | 37 |
| `entradas-blog` | **1** | 152 |
| `casos` | **1** | 57 |
| `documentos-cientificos` | 0 | 23 |
| `faqs` | 0 | 19 |
| **total** | **8** | **288** |

Los 8 son `<sub>` de **fórmula química**: `Oxígeno (O<sub>2</sub>)` ·
`Sulfuro de hidrógeno (H<sub>2</sub>S)` · `Amoníaco (NH<sub>3</sub>)` ·
`Dióxido de azufre (SO<sub>2</sub>)` · `Óxidos de nitrógeno (NOx) y óxido
nitroso (N<sub>2</sub>O)` · `cloro (Cl<sub>2</sub>) y dióxido de cloro
(ClO<sub>2</sub>)` · `Medición de PM<sub>10</sub>…` · y el caso de la PTAR de
Israel.

**Y el modelo lo declara plano:** `{ name: "titulo", type: "text" }` en las tres
colecciones del grupo A (`colecciones/grupo-a.ts`). O sea **un campo que no puede
contener su dato medido** — la misma forma exacta que `CMS-SP-TIPO`, que este
registro ya pagó una vez con el `<sup>` de la tabla de producto.

### Por qué no lo vio nadie, y son tres cegueras distintas

| instrumento | por qué es ciego |
|---|---|
| `clon-base` | congela `h1.txt`, que es `textContent`: `PM<sub>10</sub>` y `PM10` dan **la misma cadena**. Ciego **por construcción**, no por descuido |
| `lh-cmp` | **tiene** el canal (`listado.tarjetas.N.etiquetas` censa las etiquetas dentro de la tarjeta), pero el espejo congela **3 tarjetas de 15** y **7 de las 11** tarjetas con `<sub>` caen fuera — §F3-TARJETAS-RECORTADAS-A-3 |
| el round-trip del CMS | compara el dato **contra sí mismo**: un título aplanado en la ida sale aplanado en la vuelta y **casa** |

> **Las tres son la misma familia**: §*una medición tomada a un nivel que puede
> absorber el error no es una medición*. Aquí el contenedor es **`textContent`**,
> que absorbe el marcado por definición.

### Lo medido en la salida servida, que es lo que lo saca de hipótesis

`/es/recursos/articulos/`, tarjeta **5 de 15**:

| lado | lo servido |
|---|---|
| original | `Medición de PM<sub>10</sub> en entornos con alta presencia…` |
| clon | `Medición de PM10 en entornos con alta presencia…` |

**Y el `<sub>` NO es una etiqueta nueva para este proyecto:** §3.1 ya lo tiene en
la whitelist del campo rico con su censo —*«subíndice · superíndice · **139** ·
37 — fórmulas químicas. No es opcional»*—. Lo que está sin resolver es que **el
titular no es campo rico**, y nadie preguntó si debía serlo.

### Las salidas, sin decidir

| | qué implica | coste |
|---|---|---|
| **A · `titulo` pasa a campo rico** (mismo contrato que §3.1, whitelist recortada) | el titular admite `<sub>`/`<sup>`/`<em>`; hay que decidir qué se hace en `<title>`, `og:title` y la miga, donde el marcado **no** va | toca las 3 colecciones del grupo A y el render de **288** documentos: exige antes/después y build |
| **B · campo hermano `tituloHtml`, opcional** | `titulo` sigue plano para metadatos y ordenación; el render usa `tituloHtml ?? titulo` | campo nuevo con **8 de 288** ejerciéndolo — §F2-5-ESCALON-ETIQUETAS: *un camino de render que casi nadie estrena* |
| **C · dejarlo** | el clon sirve 8 titulares aplanados; a 1440 la diferencia de alto es **0** porque `<sub>` no cambia el `line-height`, así que **ninguna guarda vertical lo verá nunca** | es el estado de hoy, y hay que escribirlo como desviación en vez de callarlo |

> ⚠ **Lo que NO se ha medido, y hace falta para elegir:** el `<sub>` tiene otro
> tamaño y otra línea base, así que **puede mover el ancho del titular** y con él
> el punto de envolvimiento. Con 8 instancias y ningún ancho medido, *«no se
> ve»* es **SIN PROBAR**, no *«no pasa nada»*. El instrumento que lo diría es el
> mismo que hoy no llega: §F3-TARJETAS-RECORTADAS-A-3.

### ⛔ 7e · CMS-ORDEN-L2 · UN ARCHIVO DE CPT ORDENA POR FECHA, Y EL MODELO NO LA TIENE (2026-08-14, 69.ª tanda)

**Abierta, no decidida.** Se escribe aquí en la misma tanda que la mide, que es
lo que §*MENCIONADO NO ES DOCUMENTADO* exige. Evidencia congelada:
`medidas/lh-huecos.json` (`npm run qa:lh-huecos`, negativo 4/4). Ficha operativa:
`PENDIENTES-QA.md` §F3-LH-ORDEN-DE-L2.

**Lo medido, por canal y con su denominador** — y la lista de canales va escrita
porque la afirmación de abajo es un *«no existe»*:

> ⚠⚠ **AMPLIADA 2026-08-14 (70.ª tanda): la tabla tenía 4 canales y FALTABA UNO
> CON DATO.** `/preguntas-frecuentes` **sí sirve una fecha** —
> `article:modified_time`, **19/19**— y la primera versión no lo miró, así que se
> escribió *«no tiene canal»*. Es §*una afirmación de que un discriminador NO
> EXISTE se escribe con la lista de canales que se miraron*: la lista **estaba**,
> y por eso convencía; lo que faltaba era **la lista de los que quedaban**.
>
> **Y también estaba mal el SITIO.** Las fechas se leen en la **página individual**
> de cada tarjeta, no en el listado: el listado **no sirve fecha en ninguna de las
> dos formas** (0/8 también en `/glosario`), así que medirlo ahí habría dado un
> cero del sitio en vez de un cero del dato.

| canal (leído en la PÁGINA INDIVIDUAL) | `/glosario` (37) — **CONTROL** | `/preguntas-frecuentes` (19) |
|---|---|---|
| `<span class="fecha-publicacion">` — **el que usa `entradas-blog`** | **0/37** | **0/19** |
| JSON-LD `datePublished` | **37/37**, y **ordena DESC** ✅ | **0/19** |
| JSON-LD `dateModified` | 37/37, y **NO ordena** | **0/19** |
| `article:published_time` | 0/37 | **0/19** |
| **`article:modified_time`** ← *el que faltaba* | 34/37 (incompleto) | **19/19, y NO ordena** |
| sitemap `<lastmod>` | 37/37, y **NO ordena** | 19/19, y **NO ordena** |

**El `lastmod` se descarta CON CONTROL** (§sondas 8a): no reproduce el orden ni
siquiera en `/glosario`, donde el orden verdadero se conoce. Y en `/glosario` la
fecha **discrimina de verdad**: los post-id **no** son descendentes en el orden
servido, así que no es orden de inserción.

> **La afirmación correcta, que NO es la que había:** `/preguntas-frecuentes` **no
> se queda sin canal — se queda sin canal QUE ORDENE.** Tiene fecha servida en
> 19/19 y **ninguna de las dos que tiene reproduce el orden**. Para la decisión el
> efecto es el mismo, pero el enunciado ya no depende de qué canal se miró
> primero. Y el control lo respalda por partida doble: en `/glosario`,
> `dateModified` **tampoco ordena** aunque esté en 37/37 — o sea que **las fechas
> de modificación no ordenan estos archivos**, medido en los dos lados.

**Los canales que QUEDAN por barrer**, nombrados para que el próximo *«no hay»*
tenga denominador (`lh-huecos.ordenDeL2.canalesQueQUEDAN`):

| queda | por qué no se ha mirado |
|---|---|
| el **feed RSS** (`rel=alternate` servido en 4/4 y 8/8, lleva `pubDate`) | **no está capturado** — es una campaña de captura, no un `grep` |
| la **API REST** de WP (`/wp-json/wp/v2/…`) | fuera del corpus |
| `menu_order` / `orderby` | **no aparecen en lo servido**: sólo los vería la API |

**Las dos mitades, que es lo que hay que decidir:**

1. **`terminos-kunakpedia` — tiene canal y le falta esquema.** El precedente
   `entradas-blog.fechaPublicacion` **no se aplica tal cual**, y por dos razones
   medidas, no por gusto: sale de **otro canal** (un `<span>` renderizado que
   estas 37 páginas no sirven) y guarda **el literal español** («7 enero 2025»)
   **porque el original lo pinta**. Aquí el dato sólo existe como **ISO en datos
   estructurados** y **no aparece en ninguna tarjeta**. O sea que lo que haría
   falta es un campo **para ORDENAR y no para MOSTRAR** — y ésa es una decisión
   distinta, con su propia razón, no una extensión del precedente.

   > ⚠ **Y el aviso que la hace peligrosa: llamarlo `fechaPublicacion` la
   > cerraría por analogía.** El nombre arrastra el contrato del otro campo
   > (literal, mostrable, `required`) a un dato que no es ninguna de las tres
   > cosas. §DOS VARIABLES CONFUNDIDAS aplicado a un nombre.

2. **`faqs` — no tiene canal ninguno.** El orden servido **no es** el de la DB
   (es una permutación, comprobado por Local API) ni el de los id. Modelar aquí
   un campo de orden sería **inventarlo**; y replicar el orden capturado como
   dato hay que decirlo como lo que es — **una transcripción del original de una
   fecha**, no un valor derivado —, con el mismo criterio con que `D2.5` replica
   las 55 páginas vacías: se puede hacer, y se escribe por qué.

**Lo que NO se decide aquí y hay que resistirse a decidir de paso:** si el campo
lo llevan **las 4 colecciones de grupo A** o sólo las que un listado ordena. Hoy
lo ejercita **una** (`terminos-kunakpedia`), y generalizar desde ahí es
§*una regla derivada sobre un dominio donde el caso no se da*.

---

#### LAS DOS PREGUNTAS EXACTAS, y sus salidas con lo que CADA UNA ES

*(Escritas con la forma de `D2.5`: cada salida se describe por **lo que es**, no
por cuál deja el clon más bonito. La elección es de la tanda de decisión.)*

> **P1 — `terminos-kunakpedia`: ¿se modela un campo de fecha cuyo único uso es
> ORDENAR?**
> Hay canal (`datePublished`, 37/37, ordena DESC) y no hay esquema. El precedente
> `entradas-blog.fechaPublicacion` **no se aplica**: sale de otro canal y guarda el
> literal español porque el original lo pinta. Aquí el dato **no aparece en ninguna
> tarjeta**.

| salida | **qué ES** | qué arrastra |
|---|---|---|
| **P1-a · campo ISO nuevo**, distinto de `fechaPublicacion` | un campo **de orden**, no de presentación: `date`, no `required`, **no se pinta** | hay que **nombrarlo sin arrastrar el contrato del otro** — llamarlo `fechaPublicacion` cerraría la decisión por analogía (§DOS VARIABLES CONFUNDIDAS aplicado a un nombre) |
| **P1-b · reutilizar `fechaPublicacion`** | **un campo con dos contratos**: literal español mostrable en una colección, ISO invisible en otra | un `required` y un formato que esta colección no cumple; el precedente deja de significar una cosa |
| **P1-c · no modelar: orden explícito** (`orden: number` por fila) | **transcribir el resultado**, no la causa: se guarda la posición, no la fecha que la produce | el orden deja de re-derivarse; cualquier alta futura hay que colocarla a mano |

> **P2 — `faqs`: ¿qué se hace con un orden que lo servido NO explica?**
> Tiene fecha (19/19 en `article:modified_time`) y **ninguna ordena**. El orden
> servido no es el de la DB (permutación comprobada por Local API) ni el de los
> id.

| salida | **qué ES** | qué arrastra |
|---|---|---|
| **P2-a · `orden` explícito transcrito del original** | **una transcripción**, exactamente como `D2.5` transcribe las 55 páginas vacías: se replica lo observado y se escribe que es observado | 19 valores que **nadie puede re-derivar**; si el original reordena, el clon no se entera |
| **P2-b · orden por el canal que SÍ existe** (`modifiedTime` DESC) | **inventar un orden plausible**: el canal existe y **está medido que no es éste** | Δ ≠ 0 en el listado **desde el primer día**, y con la medida que lo dice ya congelada |
| **P2-c · dejar el orden de la DB** | **no modelar el orden**: el listado sale en el orden en que se sembró | idem, y además **inestable**: depende del orden de siembra, no del dato |
| **P2-d · capturar el FEED y volver a preguntar** | **no decidir todavía**: comprar un canal más antes de elegir | una campaña de captura (el feed no está en el corpus). Es la única salida que puede **disolver** P2 en vez de resolverla |

> ⚠ **P1 y P2 no se resuelven con la misma decisión, y por eso van separadas.**
> P1 es *«hay causa y falta esquema»*; P2 es *«no hay causa conocida»*. Fundirlas
> —«pongamos fecha a las dos»— resolvería P2 por analogía con P1, que es
> exactamente el paso que esta ficha existe para impedir.

**Precondición de la tanda de decisión, y es barata:** P2-d decide si P2 se
plantea siquiera. **Capturar el feed de `faqs` cuesta una petición** y puede
convertir P2 en un caso de P1. Mirarlo **antes** de elegir entre P2-a…c es lo que
§*una campaña se declara COMPLETA respecto a un USO* pide: el uso aquí es
*decidir*, y para eso el corpus **no está completo**.

### ✅ 7c · CMS-0g · EL ORIGEN DE MEDIA ES UN CAMPO DE PROCEDENCIA (2026-08-06)

**Y lo primero es que el PASO 1 pudo haberla disuelto, y no la disolvió.** El
encargo pedía medir antes de modelar —*«si no colisionan, `rutaDeMedia` se
implementa sobre `filename` y CMS-0g se cierra sin tocar el esquema»*—, que es
lo que pasó con el ancho pedido. Aquí el dato dijo otra cosa, y decirlo con el
número es el resultado:

| población | rutas | basenames repetidos | referencias del corpus |
|---|---:|---:|---:|
| **dominio** — lo que HOY es fila de `media` | **112** (133 referencias) | **0** | 0 |
| **corpus** — los orígenes capturados | 534 | **0** | 0 |
| **unión** — todo lo que ALGUNA VEZ podrá ser fila | 646 | **1** | **12** |
| `publico` — `public/images` entero | 628 | 12, y **11 son CASCARÓN** (nunca es fila) | — |

Congelado en `medidas/media-colision.json`, negativo **6/6**. Y no se dio por
supuesto que `filename` FUERA el basename: se verificó contra la salida servida
—`media/`, que `cms:reset` vacía— y salió **112/112 con el nombre exacto**.

> **La lectura, con su alcance: es una función HOY y no lo es en la unión.** La
> colisión es `control-de-la-calidad-del-aire-en-ciudades.jpg` en `2023/04` y en
> `2024/06`, y no es una hipótesis: los dos ficheros están capturados y el corpus
> los cita 3 y 9 veces.

#### Las tres salidas, costadas

| # | salida | qué cuesta |
|---|---|---|
| **a** | **tabular sobre `filename`**, sin campo: un mapa `filename → /images/…` derivado del árbol de `public/images` | **cero hoy.** Y mañana: la colisión de la unión llega con el bloque 2, Payload desduplica a `-1.jpg`, el mapa falla y `rutaDeMedia` tira. Falla **ruidosamente**, que es lo bueno; lo malo es **cuándo**: con contenido dentro. Además el mapa **re-deriva en la lectura un hecho que la escritura sabía y tiró**, y depende de un árbol (`public/images`) que el CMS no posee y que tras F2-4 no contendrá la media nueva |
| **b** | **campo de PROCEDENCIA en `media`** | un campo + una migración versionada + re-seed —que el seed ya exige desde DB vacía, o sea **gratis dentro del flujo de F2-3**— + el Δ0 que cada familia paga de todos modos |
| **c** | render contra `/api/media/file/…` | **cambia el HTML servido ⇒ rompe el Δ0**, que es el criterio entero de F2-3. Es **M-IMG**, ya registrada como deuda de RENDER (§6). Descartada para esta fase |

#### El criterio: LA ASIMETRÍA DE DESHACER (la misma de CMS-0f)

Y aquí la asimetría **no es la trivial** («añadir es más fácil que quitar»):

| dirección | qué cuesta |
|---|---|
| **de SIN campo a CON campo** (añadirlo después) | La columna es barata en SQL. Lo caro es **rellenarla**: el valor sólo lo sabe **el seed**, que lee `/images/…` de `src/lib`. En cuanto haya altas del admin o ediciones, re-sembrar desde cero pierde lo escrito, así que el relleno sería un **backfill por heurística** — o sea la opción (a), con su colisión conocida y **sin manera de dirimir cuál de las dos rutas era**. **La procedencia sólo es conocible mientras el seed sea la única fuente; después es irrecuperable.** Y `media` es la colección más referenciada: 7 colecciones con `upload`, 133 referencias hoy |
| **de CON campo a SIN campo** (quitarlo después) | una migración con `DROP COLUMN` y un `rutaDeMedia` que pase a derivar. **Mecánico y electivo**, y el día que se quiera el dato sigue ahí para comprobar que la derivación acierta antes de tirarlo |

> **Irrecuperable→adivinar es caro y llega forzado; guardado→derivar es mecánico
> y electivo, y encima verificable. Esa asimetría toma la decisión**, exactamente
> como en CMS-0f.

#### La NATURALEZA decide la forma del campo, no el gusto

Es **procedencia** —de dónde vino esta media al migrar— y no contenido. De ahí
salen las cuatro propiedades, ninguna elegida a mano:

| propiedad | por qué se sigue de la naturaleza |
|---|---|
| **`required: false`** | un alta legítima desde `/admin` **no tiene origen**. Un `required` sobre un campo que un alta legítima no puede rellenar es un esquema roto en producción |
| **`admin: { readOnly: true }`** | es un **registro de migración**, no un campo que el editor redacte. Editable sería invitar a que alguien lo cambie y mueva el render |
| **no entra en el round-trip** | `media` no está en `CATALOGOS`: se deriva de los `upload` de las demás. No tiene lado medido, así que no hay nada con qué comparar |
| **`unique: true`** | dos filas de `media` reclamando el mismo origen es un defecto del seed, y `ctx.media` ya memoiza por ruta. En Postgres un `unique` nullable admite muchos `NULL`, que es justo lo que los altas del admin necesitan |

#### Y el argumento que lo cierra: es la regla que este repo ya tiene escrita

`seed.mjs` lo dice de sus tres métodos de vuelta: *«se construyen con los mismos
mapas que la ida llenó, **no con una segunda lista**: si fueran independientes,
un mismo olvido en las dos daría Δ0 en falso»*.

> **La opción (a) es exactamente esa segunda lista** — la vuelta *adivinando* lo
> que la ida sabía. La (b) es el mismo mapa, persistido. **Una definición, dos
> sentidos**, igual que `formaDeRel` y `centinelas`.

#### El `null` tiene render, y no es un hueco

`rutaDeMedia(doc)` devuelve `doc.rutaOrigen` si está, y `/api/media/file/<filename>`
si no. **No es un defecto silencioso**: una media dada de alta en el admin nunca
existió bajo `/images/`, así que esa URL es **la única que puede funcionar** para
ella. El `null` no se sustituye por un valor benigno (regla 6) — se traduce a la
única respuesta correcta para su caso, y la distinción se conserva en el dato.

**Requisito que esto impone a la lectura, y es el mismo que ya tenía `deRel`:**
el documento de `media` tiene que llegar **poblado** (`depth ≥ 1`). Con el id
pelado no hay `rutaOrigen` que leer, y `rutaDeMedia` **tira** en vez de devolver
la URL de la API — que sería la regla 6 otra vez: convertir «no puedo
reconstruirlo» en «esto es lo que había».

#### Aplicado el mismo día, y el campo era la mitad pequeña

| pieza | dónde | comprobación |
|---|---|---|
| `rutaOrigen` en `media` | `colecciones/media.ts` | **112/112 con origen en la DB**, verificado con `psql` |
| migración versionada | `20260806_124532_ruta_origen_media` | reversible (`DROP COLUMN`), que es la dirección barata de la asimetría |
| la IDA lo escribe | `ctx.media` en `seed.mjs` | el mismo mapa que `mediaPorRuta`, **persistido** |
| el walker, compartido | `packages/cms-config/src/mapeo.mjs` | lo usan la ida, el round-trip y **el render** |
| `contextoDeLectura` | mismo fichero | los 3 métodos de `aMedido` **sin ida**, más `esCentinela` |
| las 3 declaraciones | `custom` en **8 campos** | `qa:cms-decl`, **en las dos direcciones**, negativo **6/6** |
| el proyector del render | `apps/web/src/lib/cms/proyector.ts` | `qa:cms-lectura` **63/63**, negativo **4/4** |

> **Y la pieza que impide heredar un verde: `qa:cms-lectura`.** El round-trip
> prueba que ida y vuelta son inversas, pero **su vuelta corre con el contexto de
> la ida**. El render usa otro. Dar el 63/63 por bueno para el segundo es la
> FAMILIA DE CALIBRACIÓN de manual, así que se mide: **63/63 idénticos por los
> dos contextos**, incluidos `sectores` (108 hojas) y `monograficos` (199).

⚠ **Tres defectos míos que el negativo cazó, y ninguno habría dado error:**

1. el contexto de la ida que la sonda reconstruía tenía sus tres mapas **vacíos**,
   así que los dos lados coincidían **por no hacer ninguno el trabajo** — un
   63/63 que no medía nada (regla 4, la cara del pleno);
2. **la RAÍZ del walker**: el seed camina con `aPayload(…, coleccion)` y las
   declaraciones se leían desde raíz vacía. Ningún `get` casaba nunca, **en
   silencio**;
3. y por eso mismo, `soluciones` **colapsaba tres colecciones en una clave** —
   dos con término embebido y una con slug. La llave es **(colección, ruta)**,
   que es la misma corrección que ya se le había hecho a `CON_KIND` (clase C7).

Los tres los destapó el sabotaje `sin-declaraciones` saliendo **verde** cuando
tenía que salir rojo.

### ⚠ 7b · CMS-SP-TIPO — por qué el round-trip NO la cierra, medido (2026-08-04)

`qa:cms-roundtrip` nació con la etiqueta de *«la única sonda que mira el TIPO de
la hoja»*, y esa frase **decía de más**. Se comprobó con un sabotaje en vez de
con un argumento:

> **`tipo-hoja`** cambia `productos.bullets[].texto` de `htmlLinea` a
> `editorNegrita` —o sea **CMS-SP-TIPO literal**, el defecto que escondía el
> `R<sup>2</sup> >0,8`— y la sonda sale **63/63, exit 0**.

**Y no es un fallo del comparador: es que la pérdida ocurre en el sitio que él no
mira.** `inlineALexical("R<sup>2</sup> …")` mete la cadena en un nodo de texto y
`lexicalAInline` la devuelve idéntica: **la ida y la vuelta son inversas
perfectas sobre un editor que aun así pinta la fórmula como texto plano**. El
`<sup>` se pierde al **RENDERIZAR**, no al guardar, y guardar-y-releer es ciego a
eso por construcción.

| lo que sí mira de la hoja | lo que NO |
|---|---|
| su **DEFECTO** — cazó el `nivel` compartido entre `claim` (2) y `titular` (3) | su **EDITOR** |
| su **FORMA** — cazó las 16 celdas de tabla que entraban en blanco | |

**Quién la cierra**, y ya se puede nombrar: el **Δ0 de F2-3** (que compara la
salida renderizada, donde la pérdida sí existe), o una sonda que contraste las
*features* del editor de cada campo contra el **inventario de etiquetas medido**
de ese campo — que es dato que ya existe (`ETIQUETAS_CENSADAS`, 43).

**Mientras tanto está declarado como PUNTO CIEGO VERIFICADO** en
`cms-roundtrip.neg.mjs`: el sabotaje se corre en cada negativo y se exige que
siga **sin** morder. El día que muerda, ese fichero sale **rojo** y obliga a
venir a leer por qué. *Un punto ciego documentado y no verificado envejece solo;
uno verificado avisa cuando deja de serlo.*

**Y una condición escrita, que no es decisión abierta pero se cobra igual:** el
**recuento** de CMS-0e (16 · 3 · 5) es **provisional** hasta rehacerlo con
`@payloadcms/richtext-lexical` instalado. La decisión no depende de ello —la
sostiene el inventario—, pero **ningún número del §CMS-0e·B se cita como firme**
antes de esa corrida.

### ✅ 7d · CMS-SP-TIPO — CERRADA, y por la salida que parecía la de repuesto (2026-08-06)

§7b nombró **dos** salidas posibles. La tanda que migra `productos` fue a por la
primera —el Δ0 de render— y se encontró con que **no puede**:

> **El mecanismo de pestañas es un CONTENEDOR CON HOLGURA, y su holgura es el
> panel entero de todo producto que no sea el activo.** `ProductosTabs` sólo
> renderiza en servidor el panel del **primero** de la lista; de los demás llegan
> al HTML únicamente `name` y `tagline`. El activo es `monitor-calidad-aire` en
> **las 10 instancias** que pintan el bloque (1 home · 6 sectores · 3 casos), y
> sus 5 viñetas son texto plano.

**Derivado, no supuesto:** los 4 `<sup>` viven en los productos 6, 8 y 9
(`sulfuro-de-hidrogeno`, `compuestos-organicos-volatiles`,
`particulas-en-suspension`), y `grep -rl "<sup>" apps/web/.next/server/app` da
**5 ficheros, los 5 cuerpos de grupo A** — **ninguno un panel de producto**. Así
que migrar la familia **no** ejercita el detector: `html-cmp` mide el HTML
servido, y lo que no se sirve no lo puede ver.

**Lo cierra la salida 2:** `npm run qa:tipo-hoja` compara, campo a campo, **lo
que la hoja PUEDE expresar** (su `type`; si es `richText`, su `editor`
identificado **por referencia** al objeto exportado, nunca por su nombre) contra
**lo que su dato medido TRAE** (las etiquetas reales de los catálogos de
`src/lib/*.ts`).

| resultado | n |
|---|---:|
| hojas del corpus con marcado | **10** |
| que su campo no puede contener | **0** |
| campos `richText` en las 16 colecciones | 6, **los 6 `editorNegrita`** |

**El negativo (5/5) prueba las cuatro formas de dar verde en falso**, y su caso
decisivo **es el defecto original**: `tipo-plano` pone `productos.bullets` como
`text` y la sonda nombra `<sup>` con su ejemplo medido. Los otros tres son la
familia de `CLAUDE.md` §sondas 4 — `editor-opaco` (un editor desconocido **tira**
en vez de suponerse capaz), `detector-muerto` (0 hojas con marcado sale por
error, no por cero) y `sin-emparejar` («no lo encontré» ≠ «cabe»).

⚠ **Y una condición escrita, que es lo que impide que envejezca:** `editorRico`
**no lo usa ningún campo hoy**, así que la sonda **no le escribe una tabla de
etiquetas a ciegas** — el día que un campo lo use, `tipo-hoja` **falla** y obliga
a derivarla de sus *features*. Lo SIN PROBAR no se cablea.

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

**Cerrada el 2026-08-03: CMS-0f** (dos apps en monorepo + Local API por paquete
compartido, §CMS-0f) — **la última decisión de infraestructura que quedaba**.

**Cerrada el 2026-08-03: §2e** (`productos` es UNA colección — frontera medida =
1 y opcional). Con ella **el cubo C de la precondición 1 queda vacío y F2-1 puede
congelar el esquema**.

**Cerrada el 2026-08-04: §3.1d** (el corpus entra como **HTML crudo**; el campo
definitivo y el sitio de aterrizaje son el mismo, porque el tipo medido ya era
`string`). Con ella **CMS-0e queda aplicada, no solo decidida**, y §3.1c deja de
bloquear: `table`/`mark`/`small` eran del editor del corpus.

De las **dos** que quedan de modelado, **ninguna bloquea nada de F2-1**: una es
de contenido (cómo se modela la tabla) y otra de política (qué hosts de embebido
se admiten). **El camino está despejado en los dos ejes**, infraestructura y
modelado. La tercera fila nueva —**CMS-SP-TIPO**— no es de modelado sino de
**instrumento**, y tampoco bloquea: nombra un hueco de comprobación que hasta
hoy no se podía ni enunciar.

⚠ **Y dos cosas que el censo de embebidos cambió, no añadió:** el nodo-embed pasa
a llevar **URL en vez de `enum` de proveedor** (§3.3b: 18 hosts, 12 de ellos una
sola vez) y **§3.1 estrena nodo de vídeo** (§3.1b: 8 `<video>` en 8 páginas). Las
dos estaban dadas por resueltas y no lo estaban.

---

### ✅ 7e · CMS-LISTA-VACÍA — la lista vacía vuelve `[]`, y quién la omite se DECLARA (2026-08-08, cierra §F2-5-ESCALON-ETIQUETAS)

**La decisión que la prueba final de F2-5 destapó por no existir.** El editor dio
de alta una entrada **sin etiquetas** —opcional en el esquema—, todas las guardas
de entrada la acogieron y el build murió prerenderizándola con
`undefined.length`. Tres piezas documentadas, cada una coherente, y **ningún
documento arbitraba su composición**. Esto es el arbitraje.

#### Lo que se midió primero, porque sin ello el arreglo inventa el contrato

`npm run qa:escalon` (nueva · negativo 5/5) interroga las **149 capturas
congeladas** del corpus — no el sitio vivo:

| pregunta | medido |
|---|---|
| ¿cuántas de las 149 no traen etiquetas? | **8** — el caso es REAL en el original, no sólo legal en el esquema |
| ¿qué emite el original ahí? | **OMITE** el `<span class="case-tags">` entero. UNA sola forma en las 8: el `div.case-taxonomies` sigue con la categoría sola. Ni vacío, ni rótulo sin lista |
| ¿el rótulo se deriva del número? | **sí, 141/141** — 63 con una (`Etiqueta:`), 78 con varias (`Etiquetas:`) |

#### Qué pieza cede, y por qué las otras dos NO

| pieza | veredicto |
|---|---|
| `types/kunak.ts:394` — `etiquetas: TerminoA[]` no-opcional, comentario «0..n» | **NO cede: la contradicción que se le imputaba NO EXISTE.** Un array no-opcional de longitud 0 **es** «0». El tipo dice «la clave está siempre, la lista puede estar vacía», que es exactamente lo medido. Es la pieza que ENUNCIA el contrato, y la que el arreglo restaura |
| `[slug]/page.tsx:163` — `entrada.etiquetas.length > 0 &&` | **NO cede: ya es la fidelidad medida.** El original OMITE (8/8) y eso es justo lo que la plantilla hace. Un `?.` ahí toleraría un valor que el tipo prohíbe — cerraría la INSTANCIA y dejaría vivas las otras 34 rutas de lista |
| **`mapeo.mjs` — «LA LISTA VACÍA»** | **CEDE**, y no por borrado: por **estrechamiento a donde se derivó** |

#### La regla nueva, y por qué el defecto se invierte

> **Una lista (`array` · `blocks` · `relationship hasMany`) vuelve como `[]`,
> salvo que el campo declare `custom: { vaciaEsAusente: true }`** — o sea, que el
> dato medido OMITE la clave cuando la lista está vacía.

La regla vieja —*«se elige AUSENTE; los 9 catálogos dan 0 arrays vacíos
explícitos»*— tenía las dos mitades ciertas y **la conclusión no se seguía**: «0
vacíos explícitos» dice que la preimagen es única *en ese dominio*, no que
«ausente» sea la correcta para todos los campos. Y el dominio eran **7 entradas
de 149**. Es una FAMILIA DE CALIBRACIÓN de manual.

**El discriminador no se elige: se DERIVA de la ida** (`ctx.lista(ruta,
presente)`), que es lo único que puede saberlo — en la DB las dos preimágenes son
el mismo `[]`. Medido sobre los 9 catálogos: **40 rutas de lista recorridas · 35
que el dato medido trae SIEMPRE · 5 que omite alguna vez**. Las 5 declaran:
`casos.sectores` · `casos.galeria` · `casos.soluciones` ·
`monograficos.hero.modulos.paragraphs` · `productos.cuerpo`. **Y las 5 son
exactamente las que el tipo medido declara opcionales** (`sectores?`, `galeria?`,
`soluciones?`, `paragraphs?`, y `Product` que ni siquiera tiene `cuerpo`): el
invariante *«opcional en el tipo ⟺ omitible en el dato»* se cumple 40/40.

**Por qué `[]` es el defecto y no `undefined` (regla 6):** los dos olvidos no
cuestan lo mismo, y el defecto seguro es el que grita.

| olvido | qué pasa |
|---|---|
| no declarar un campo omitible | la vuelta emite `[]` contra una clave ausente ⇒ **`qa:cms-roundtrip` falla por FORMA en el acto** |
| el contrario (el defecto de antes) | **no falla nada**, y el render muere delante del primer editor que deje una lista vacía |

#### La prueba de que no cablea nada

**El cambio es un NO-OP sobre todo lo medido**: para las 35 la rama de la lista
vacía no se ejecuta nunca (traen ≥1 fila) y para las 5 el comportamiento es
idéntico. Medido después, no leído en el diff: `qa:cms-roundtrip` **63/63** y
`qa:cms-lectura` **63/63**, sin moverse. La diferencia aparece **sólo** en el
caso que el corpus tiene y el seed no.

**Guarda:** `qa:cms-decl` gana su cuarta declaración, en las dos direcciones —
`vaciaEsAusente` de menos = HUECO, de más = DECLARACIÓN MUERTA (**que es el
escalón**, y es la mitad que sólo caza esta guarda). Negativo **8/8**, con
`vacia-es-ausente-muerta` reproduciendo el fallo real de la prueba final.

⚠ **Lo que la guarda NO puede afirmar, y lo nombra:** **9 listas de la config que
la ida no recorrió nunca** —8 bajo `productos.cuerpo` y
`monograficos.…modulos.filas.celdas`—. De ellas no se sabe si el dato medido las
omite. Entran en el inventario de §F2-5 · CASOS LEGALES NUNCA OBSERVADOS.

---

## 8 · Aceptación de la migración

**Cuándo se puede decir que el CMS está puesto.** El listón lo da el clon actual,
que es determinista:

> Con el sitio leyendo de Payload, **las mismas sondas contra el clon actual,
> umbral CERO, TODAS las rutas que el build emite, 2 anchos.**

> ⚠⚠ **EL DENOMINADOR NO ES UN NÚMERO ESCRITO AQUÍ: ES EL `prerender-manifest`,
> Y SE CITA CON SU FICHERO (reescrito 2026-08-27, 119.ª).**
>
> Hasta hoy el listón decía **«11 páginas»**, que es el denominador **del día
> que se escribió**. Derivado hoy: **426 RUTAS**, o sea **×38.7**. Un listón con
> un número congelado dentro no envejece ruidosamente — **se cumple con 11 y se
> lee como cumplido con 426**, que es §regla 9 (*un número recordado envejece
> CONTRA el repo, en silencio*) cometida sobre el criterio de aceptación.
>
> **La unidad es la RUTA, no la «página» ni la clave**, y es la que las dos
> sondas declaran: `clon-base` construye su `Evaluadas` con
> `unidad: "rutas", minimo: RUTAS.length`, y `RUTAS` sale de
> `.next/prerender-manifest.json` filtrando `/_*` y lo que lleve punto
> (`rutasEmitidas()` en `lib.mjs`).
>
> | derivación | fichero | valor |
> |---|---|---|
> | línea base del clon @1440 | `medidas/clon-base-1440-t118-tras-el-archivo.json` | `meta.rutas` **426** · 426 claves en `.paginas` · **0** con `error` |
> | línea base del clon @390 | `medidas/clon-base-390-t118-tras-el-archivo.json` | `meta.rutas` **426** · 426 claves · **0** con `error` |
> | auditoría del manifiesto | `medidas/manifiesto-2026-08-27-2.json` | `rutas` **426** · 25 familias · 0 vacías · 0 duplicadas |
>
> ⚠ **Y el cruce de esas dos NO verifica el 426** (§regla 15): las dos leen el
> **mismo** `prerender-manifest` por la **misma** función, así que su
> concordancia prueba que leen el mismo universo — no que el universo sea
> correcto. Lo que respalda el 426 es la derivación, y su guarda es
> `qa:manifiesto` con su negativo.
>
> ⚠ **Lo que hoy NO se puede derivar, y por eso no se escribe:** el recuento de
> **claves crudas** del manifiesto —antes del filtro de `/_*` y del punto—. No
> hay `.next` en el árbol, y esta tanda es offline. Se deja **SIN DERIVAR**, no
> se rellena con un número recordado.

| comprobación | criterio | qué lado mide |
|---|---|---|
| `npm run qa:clon-base -- 1440 --cmp <base>` | **Δ0** · las **426 rutas** del manifiesto · 0 regresiones | ⚠ **clon contra clon** |
| `npm run qa:clon-base -- 390 --cmp <base>` | **Δ0** · las **426 rutas** del manifiesto · 0 regresiones | ⚠ **clon contra clon** |
| `npm run qa:enlaces` | limpia en las dos direcciones, código 0 | ⚠ **clon contra el BUILD** |
| `npm run qa:corte` | 12/12 | clon |
| `npm run check` | verde | clon |

> **El `<base>` se nombra, no se resuelve al canónico** (§regla 5): el fichero
> `clon-base-{1440,390}.json` conserva la PRIMERA foto —**17 rutas**, de
> julio—, así que un listón que dijera «la línea base de `clon-base`» mandaría a
> comparar contra 17.

### 8.0 · ⛔ LAS CINCO COMPROBACIONES DE ARRIBA NO MIDEN FIDELIDAD — NI UNA (2026-08-27, 119.ª)

**Es la comprobación que §8 pedía y no tenía**, y sale del mismo sitio que la
118.ª acaba de escribir: *una guarda solo-clon se lee como verde y no mide
fidelidad — compara el clon con el clon de ayer, y ayer podía estar mal*.

Las cinco filas de la tabla, derivadas de su código:

| sonda | de dónde saca cada lado | ¿toca el original? |
|---|---|---|
| `clon-base` ×2 | el HTML servido **hoy** contra una congelada **del propio clon** | **NO** |
| `enlaces` | el HTML servido contra `.next/prerender-manifest.json` — **los dos lados son el clon** | **NO** |
| `corte` | el clon | **NO** |
| `check` | lint + typecheck + build | **NO** |

**Y no es una lectura mía: `cobertura.mjs` lo dice en su leyenda** —
`c = solo clon-contra-clon (clon-base, offsets)`— y `COBERTURA-MEDICION.md` lo
escribe con todas las letras: *«`clon-base` **no acredita ninguna celda de esta
matriz** (es clon-contra-clon, no contra el original)»*.

> **Consecuencia: el listón de §8, tal como estaba, se podía cumplir ENTERO con
> el CMS sirviendo una página que no se parece al original.** Δ0 contra la
> congelada del clon significa *«la migración no movió nada»*, que es la
> pregunta correcta **para la migración** y **no** es la pregunta de fidelidad.

**Qué instrumento del repo SÍ da fidelidad hoy, y con cuánta cobertura.**
Derivado de `medidas/cobertura-2026-08-25.json` (`meta.rutas` **413**, `O` = dos
lados, `c` = solo clon, `·` = nunca):

| eje | `O` | `·` | % sobre 413 | sondas que lo acreditan |
|---|---|---|---|---|
| `base` (h1.y crudo) | **139** | 274 | 33.7 % | `c-cabecera` · `f33-cmp-1440` · `lh-cmp` |
| `secciones` (árbol) | **139** | 274 | 33.7 % | `c-cmp` · `f33-cmp-1440` · `lh-cmp` |
| `anchos` | **123** | 290 | 29.8 % | `c-banda` · `a-miga` · `f33-cmp-1440` · `lh-cmp` |
| `modulos` | **110** | 303 | 26.6 % | `f33-cmp-1440` · `lh-cmp` · `mono-cmp` |
| `filas` | **83** | 330 | 20.1 % | `lh-cmp` · `tree-cmp` · `mono-cmp` |
| **`docH`** | **62** | 351 | **15.0 %** | `c-cmp` · `f33-cmp-1440` |
| `enlaces` | 62 | 351 | 15.0 % | ⚠ ver abajo |
| `comport` | **37** | 376 | 9.0 % | `comportamiento` |
| `pie` | **7** | 406 | 1.7 % | `pie-cmp` |
| `offsets` | **0** (`c` 3) | 410 | 0.0 % | `offsets` — solo clon por construcción |

**Las tres cosas que esta tabla dice y el listón viejo no dejaba ver:**

1. **el eje que el listón vigila —el alto del documento— es el SEGUNDO PEOR
   cubierto contra el original: 62 de 413, un 15 %.** `clon-base` mide `docH` en
   las 426 y **ninguna** de esas 426 cuenta como fidelidad;
2. **el denominador de la matriz está 13 rutas por detrás del build.** La matriz
   se congeló con **413** y hoy el manifiesto emite **426**: las 13 que entran
   son `L1-sector` (118.ª), declaradas con **0 de 13** en geometría. O sea que
   los porcentajes de arriba son **el techo**, no el estado;
3. ⚠ **y hay un `O` que no debería serlo — 31 de los 62 del eje `enlaces`.**
   `cobertura.mjs` L346 marca `enlaces` con nivel `"O"` (dos lados) desde
   `enlaces.json`, y `enlaces.mjs` **no lee el original en ningún momento**:
   compara el HTML servido contra las rutas del build. Derivado celda a celda:
   **31 rutas las acredita `enlaces`** (un lado) y **31 `f33-cmp-1440`** (dos
   lados). Es §*acreditar un eje que la sonda no COMPARA*, con el contenedor
   puesto en **el nombre de la sonda**. Retirando `enlaces`, el eje queda en
   **31**. Fichado en `PENDIENTES-QA.md`; **no se toca aquí** porque mover
   `cobertura.mjs` exige re-correr su negativo (§regla 5ter).

**Lo que el listón necesita y NO existe, que es el hallazgo:**

> **No hay ninguna sonda de dos lados cuyo universo sean las 426.** El eje mejor
> cubierto llega al 33.7 %, y lo hace **sumando cinco comparadores distintos**,
> cada uno con su universo. Así que «el CMS está puesto» **no se puede afirmar
> hoy en la unidad en la que el listón está escrito**: se afirma
> **«no movió nada»** (que sí es alcanzable, y es lo que las 5 filas compran) y
> por separado **«sigue siendo fiel en los N ejes × M rutas que alguien
> comparó»**, con la matriz al lado.

**Redacción obligatoria del cierre de la migración**, para que no vuelva a
leerse una cosa por la otra:

| se puede escribir | respaldado por |
|---|---|
| «la migración no movió el clon: **Δ0 en 426 rutas × 2 anchos**» | `clon-base --cmp` contra su congelada nombrada |
| «la fidelidad no bajó **donde estaba medida**: `docH` 62 · `base` 139 · …» | `qa:cobertura`, re-derivada **después** de migrar |
| ~~«el clon es fiel al original»~~ | **nada** — 0 sondas de dos lados sobre las 426 |

### 8.1 · ⚠ El contrato NO es el mismo a todos los anchos (2026-08-02)

El listón de arriba dice **«umbral CERO, todas las rutas del manifiesto, 2
anchos»** —y hasta el 2026-08-27 decía «11 páginas»—, y hay que leer
**el umbral y los anchos juntos: el umbral cero vale EN esos dos anchos**. Fuera
de ellos el contrato es otro, y confundirlos genera trabajo sin final.

> **Y el cambio de denominador NO toca este §:** el umbral cero se aplicaba a 11
> rutas y ahora a 426, pero **a los mismos dos anchos**. Lo que §8.1 declara es
> *dónde* vale el umbral, no *sobre cuántas*. Los dos ejes son ortogonales
> (§*N valores de un total no son N familias*).

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

---

## 2026-08-20 · 88.ª tanda — dos decisiones que `L2` DESTAPA y no cierra

Ninguna de las dos es de `L2`: las dos afectan a **las colecciones de grupo A**,
y `L2` es sólo la primera forma que las pone a la vista. Se registran aquí en la
misma tanda que las mide (§MENCIONADO NO ES DOCUMENTADO).

### CMS-A-ROTULO · **el rótulo se guarda como TEXTO PLANO y el original sirve MARCADO**

`titulo` y `tituloMiga` son `type: "text"`, y el extractor les quita las
etiquetas. El original sirve `<sub>`:

| campo | el original sirve | el clon sirve | cardinal |
|---|---|---|---|
| `tituloMiga` | `Oxígeno (O<sub>2</sub>)` | `Oxígeno (O 2 )` — etiquetas fuera **y un espacio dentro** | **9 de 37** términos · 1 de 152 blog · 0 de 23 doc |
| `titulo` (el `h1`) | ídem | `Oxígeno (O2)` — etiquetas fuera, **sin** espacio | **6 de 37** términos |

> ⚠ **Las dos rutas del MISMO extractor discrepan entre sí** —una mete espacio y
> la otra no—, y eso es lo que dice que ninguna de las dos es deliberada. Es el
> mismo error que `extractoDerivado` ya tiene documentado y resuelto en su
> comentario (*«las etiquetas se quitan sin meter un espacio, que es lo que hace
> `wp_strip_all_tags`»*): la corrección se aplicó **allí** y no en el extractor.

**Dónde se ve, y por eso no es cosmético:** la **miga** de las 37 páginas de
término (`/[slug]`, desde que se transcribieron) y ahora también el **rótulo de
las tarjetas** de `/glosario`. En la miga el último eslabón lleva
`max-width:350px` con `text-ellipsis`, o sea que un ancho distinto puede además
recortar.

**Qué habría que decidir**, y son dos cosas, no una:

1. **si el campo admite marcado** — pasa de `text` a un texto con contrato de
   etiquetas admitidas (aquí basta `sub`, pero el censo hay que hacerlo);
2. **cómo se renderiza en los TRES sitios** que lo pintan (`h1`, miga, tarjeta
   de `L2`), que es lo que hoy no puede hacerse porque el dato no lo lleva.

**Coste:** esquema + re-extracción + re-siembra. **No se parchea con una tabla
de sustituciones** — eso sería inventar el dato en el render.

### CMS-A-IDORIGINAL · **el `post-<id>` de WordPress no está en ninguna colección**

`P-LH-C8` se pudo comprobar por primera vez al construir `L2`, y sale rojo:

```
original  article.et_pb_post.post-71556.glossary
clon      article.et_pb_post.glossary.type-glossary
```

**El elemento es el mismo —Δ0 en su `y`— y su FIRMA no.** Cardinal:
`listado.tarjetas.N.clases.length` **7 en el original y 5 en el clon**, en las
3 tarjetas congeladas de cada una de las 8 páginas.

Faltan dos clases y **son de naturaleza distinta**:

| clase | por qué falta | qué haría falta |
|---|---|---|
| `post-71556` | el clon **no tiene los ids de WordPress** | un campo `idOriginal` en las colecciones de grupo A, poblado desde la captura |
| `has-post-thumbnail` | el clon **no sirve imagen** en esta tarjeta (`media: null` en el original también) | nada: es una clase que el original emite y **no usa**. Se replicaría por fidelidad, no por efecto |

> ⚠ **No se cablea un id inventado.** Y el alcance no es `L2`: `idOriginal`
> afectaría a **las 149 entradas de grupo A** y a cualquier forma que emita
> `article.et_pb_post` — o sea también a `L1`, donde nadie lo ha comprobado.
>
> **Y hay una pregunta previa que decide si merece la pena:** si esas clases
> **pintan algo**. `has-post-thumbnail` casi seguro que no; `post-<id>` es el
> gancho de los overrides por post que Divi compila, así que **puede pintar**.
> Se mide antes de modelar.



---

## ✅ 7i · `CMS-F34-SECTOR` — **DECIDIDA (116.ª) e IMPLEMENTADA (118.ª, 2026-08-27)**, en sus dos mitades

> ### ✅ IMPLEMENTADA el 2026-08-27 (118.ª ESCALÓN 1+2)
>
> | mitad | qué se emitió | verificado |
> |---|---|---|
> | **(c1)** la relación `caso → sector` | **nada que construir**: ya existía y ya estaba poblada — **11 términos · 57 relaciones**, casando con su consumidor medido | consulta real a la DB |
> | **(c2)** el archivo `/es/sector/*` | **13 páginas** (6 base + 7 `/page/N`) + **5 redirecciones 301** | manifiesto **416 → 429** claves crudas · dif. simétrica **13 y 0** |
>
> **Fidelidad: 12 de 12 ejes a Δ0** en `/sector/edar` servido contra su captura
> —título, `h1`, secciones, filas, columnas, módulos, `tax-tap`, columna vacía,
> barra a la derecha, 0 `<article>`, 0 `role="navigation"`, 1 eslabón de miga—.
>
> **Y las 5 se sirven como 301 con su destino**, `mineria` en bucle a sí misma
> igual que el original.
>
> ⚠ **El defecto que sólo vio medir después: `permanent: true` sirve 308.** Es
> la forma que uno escribe pensando «el original es permanente», y Next la
> traduce a **308**, no a 301. Los dos son «permanente» y **no son el mismo
> byte**. Corregido a `statusCode: 301` y re-medido. El diff se leía correcto —
> el comentario decía «301»— y lo servido decía otra cosa.
>
> **Lo que NO se implementó, y es una decisión declarada:** `hrefTermino()`
> sigue apuntando al ORIGINAL. Ahora que `/sector/*` está clonado, §Regla de
> rutas locales pediría repuntarlo; el encargo scopea (c2) a **emitir** el
> archivo, y repuntar cambia el destino de los chips en páginas ya verificadas.
> **Se ficha en vez de hacerse en silencio** — abajo, en «lo que NO decide».
>
> Código: `lib/sector-archivo.ts` · `components/listados/PaginaSector.tsx` ·
> `app/sector/[slug]/…` · `next.config.ts`. Derivación: `estado-118.{mjs,log,json}`.

Lo que sigue es la decisión tal como se tomó, su razón y su condición de
reapertura.

### La decisión, en sus dos mitades

| | qué se decide | rutas | coste |
|---|---|---|---|
| **(c1)** | **SÍ a la RELACIÓN `caso → sector`** | **0** | 0.0 s |
| **(c2)** | **REPLICAR TAL CUAL el archivo `/es/sector/*`** | **13** | 2.9 s |

**Y (c2) tiene un detalle que no es cosmético:** de las 13 rutas, **5 dan 301**
y **se replican COMO REDIRECCIÓN, no como página**. Replicar un 301 como página
sería servir un 200 donde el original sirve un salto — o sea cambiar el
comportamiento con la excusa de copiarlo.

### La razón de cada mitad

**(c1)** es la única pieza de las tres decisiones con **consumidor medido**: el
filtro de Isotope de `/casos-de-exito/` — **11 sectores + 1 comodín `"*"`** —,
que además enlaza los 11 (ESCALÓN 1 de la 115.ª, seis canales sobre 256
documentos). No cuesta rutas, y lo consume algo que ya existe.

**(c2) se decide POR PRECEDENTE, no por mérito propio: `D2.5 · REPLICAR TAL
CUAL`**, ya aplicado a las **55** URLs que responden 200 sin listar nada. El
archivo de `sector` es exactamente ese caso —**0 tarjetas en 6 de 6** por los
tres selectores, cuerpo de ~3.3 KB de miga y barra lateral— así que tratarlo de
otra forma sería abrir una excepción a una regla ya tomada.

### ⚠ (c2) se toma CONTRA §regla 23, y por eso lleva condición de reapertura

**§regla 23 con su OPERACIÓN delante, que es como hay que citarla:** se toma la
opción que empieza **SEPARADA**, porque deshacerla es **FUSIONAR**, y fusionar
es el lado barato. Aquí la separada es **no emitir el archivo** — deshacerla
cuesta emitir 13 rutas (2.9 s), y deshacer la contraria cuesta **retirar URLs
publicadas**.

**La restricción que pesó más:** la **CONSISTENCIA con D2.5**. Un sitio que
replica 55 cascarones vacíos y omite 13 idénticos no tiene una regla: tiene dos,
y la diferencia entre ellas no está escrita en ningún sitio.

> **CONDICIÓN DE REAPERTURA de (c2):** si `D2.5` se revisa —o si aparece una
> instancia de `/sector/*` que **sí sirva contenido**, o una URL de esa familia
> **enlazada desde fuera del filtro**— esta decisión se vuelve a mirar. Hoy son
> **15 documentos** los que las enlazan, **todos del propio filtro o del propio
> archivo**.

### Lo que §7i NO decide, con su cardinal

- **el mecanismo del BUCLE de `mineria`** — `/es/sector/mineria/` da **301 a sí
  misma**, **5 saltos**. Se ficha con su número y **no se diagnostica**:
  dirimirlo exige leer la cabecera `Location` de cada salto con el `Host` y el
  esquema completos, y eso **necesita red**. *Un mecanismo sin medir que entra
  en una mesa la contamina*;
- ~~**la implementación de (c1) y (c2)**: no se toca código en esta tanda.~~
  ✅ **Hecha en la 118.ª** — ver el recuadro de arriba;
- ⚠ **EL REPUNTE DE `hrefTermino()` (118.ª)** — el archivo ya está clonado, así
  que §Regla de rutas locales pediría que los chips dejaran de apuntar al
  original. **No se hace**, y por dos razones que conviene separar: el encargo
  scopea (c2) a *emitir*, y repuntar cambia el destino de enlaces en páginas ya
  verificadas. Alcance derivado: **1 fichero** (`lib/taxonomia-sectores.ts`) y
  **2 consumidores** (`CasoCabecera`, `CasoDetalles`) más `casos-de-exito/page`.
  ⚠ **Y no es un repunte trivial:** de los 11 términos, **5 redirigen** y uno
  **en bucle**, así que un chip local llevaría al visitante a un 301 propio —
  fiel, pero es un cambio de comportamiento que merece su propia adjudicación;
- ⚠ **EL RITMO de la fila 2 del archivo — SIN MEDIR (118.ª).** El corpus da
  marcado, no geometría: ninguna de las 13 capturas se ha medido con
  `getComputedStyle`. El componente **no cablea** clase de ritmo, porque
  cablear un valor sin medirlo es cómo se fabrica un arreglo falso;
- ⚠ **LA LISTA DE RUTAS ES MEDIDA, NO DERIVADA (118.ª).** Barrido el parámetro
  (`ceil(casos/k)`, k = 1..30) contra el total que el original declara en su
  `<title>`: **mejor `k = 5`, acierta 8 de 9** y falla en `industria`. El
  archivo no pagina los casos. **Consecuencia: un término nuevo NO entra solo**,
  al revés que en `/etiqueta`. Y la excepción no es aleatoria — `industria` es
  también el único con título de archivo propio—, pero con **n = 1** eso no es
  un discriminador.

---

## ⛔ 7h · `CMS-BOTON-ALINEACION` y `CMS-GUTTERS` SON **UNA** DECISIÓN, Y SU DENOMINADOR NO ES 2 FICHAS SINO **14+ CLASES** — o **16+ PARES** (2026-08-25, 108.ª · unidades corregidas en la 109.ª)

La 108.ª puso las cuatro deudas de modelo de F3-3 en una mesa para contestar una
pregunta: **¿comparten MECANISMO?** Dos se cerraron (abajo) y las dos que quedan
**son la misma clase de cosa**:

> **Un PRESET que el editor elige de un enum y que Divi transporta como CLASE**,
> no como CSS con ordinal. `et_pb_button_alignment_*` va en el envoltorio del
> módulo; `et_pb_gutters2` va en la fila.

**Y el esquema YA implementa ese patrón una vez:** `piel` del botón
(`MODULO_BOTON_PAGINA`, valores `defecto | azul` → clase `boton-azul`, **4 de
13**) es exactamente eso, con `conDefecto`. Así que **no hace falta inventar
mecanismo: hace falta decidir su ALCANCE.**

### El denominador que ninguna de las dos fichas tenía

Derivado (`derivaciones/deudas-modelo-f33.{mjs,log}`) censando las clases
`et_pb_*` que **discriminan entre HERMANOS DEL MISMO TIPO** —no del mismo nivel,
que es lo que da el pleno de §sondas 4—. Se escribe **en las dos unidades**
(corregido en la 109.ª: la v1 decía *«22 pares, de los que no emite 14 clases»*,
o sea un numerador en CLASES sobre un denominador en PARES):

| unidad | discriminan | el clon NO emite |
|---|---|---|
| **PAR** (clase × grupo) — **la que manda para el modelo** | 22 | **16** |
| **CLASE** distinta — la de estas fichas | 17 | **14** |

**Manda el PAR** porque el mismo nombre en dos niveles puede ser **dos campos**:
la alineación de un `text` y la de un `blurb` las escribe el editor en módulos
distintos. Colapsarlas a «una clase» decidiría de antemano que comparten campo —
que es justo lo que la decisión de alcance de abajo tiene que poder elegir. Las
2 clases que separan ambas unidades son `et_pb_text_align_center` y
`et_pb_section_video_on_hover`, cada una discriminando en dos grupos.

| clase | grupo | n / total | fichada |
|---|---|---|---|
| `et_pb_button_alignment_center` · `_tablet_center` · `_phone_center` | `button·envoltorio` | 10/13 · 8/13 · 8/13 | ✅ `CMS-BOTON-ALINEACION` |
| `et_pb_button_alignment_right` · `_tablet_right` · `_phone_right` | `button·envoltorio` | 1/13 ×3 | ✅ idem |
| **`et_pb_gutters2`** | **fila** | **3/113** | ✅ `CMS-GUTTERS` |
| `et_pb_column_empty` | columna | 21/179 | ⛔ **no** |
| `et_pb_text_align_center` | `text` · `blurb` | 8/151 · 5/22 | ⛔ **no** |
| `et_pb_section_video_on_hover` | `blurb` · columna | 5/22 · 7/179 | ⛔ **no** |
| `et_pb_with_background` | sección | 6/86 | ⛔ **no** |
| `et_pb_equal_columns` | fila | 6/113 | ⛔ **no** |
| `et_pb_fullwidth_section` | sección | 2/86 | ⛔ **no** |
| `et_pb_sticky_module` | columna | 2/179 | ⛔ **no** |

> ⚠ **«Las dos fichadas son 2 de 14» era una TERCERA unidad, y hacía la deuda
> mayor de lo que es** (corregido en la 109.ª). Mezcla **fichas** con **clases**,
> y se lee como que quedan 12 por decidir. Derivado: las 2 fichas
> —`CMS-BOTON-ALINEACION` y `CMS-GUTTERS`— cubren **7 de las 14 clases** (las
> seis `et_pb_button_alignment_*` más `et_pb_gutters2`), así que **quedan 7 sin
> fichar, no 12**:
>
> `et_pb_text_align_center` · `et_pb_section_video_on_hover` ·
> `et_pb_column_empty` · `et_pb_with_background` · `et_pb_equal_columns` ·
> `et_pb_fullwidth_section` · `et_pb_sticky_module`
>
> O sea que la decisión de alcance reparte **mitad y mitad**, no 2 contra 12 —
> y eso cambia lo que cuesta adoptarla entera.

**Decidirlas por separado es arreglar la instancia en vez de la CLASE** — que es
exactamente cómo se llega a la tercera tanda del mismo bug.

#### ⚠ Y LOS 16 «NO» SON PREGUNTAS, NO VEREDICTOS — derivado en la 109.ª

El censo contesta *«¿ESCRIBE el clon esta CLASE?»*. La otra pregunta —*«¿SIRVE
el clon este EFECTO?»*— se intentó contestar offline
(`derivaciones/presets-efecto-109.{mjs,log}`) y **no se pudo cerrar ni un par**:

| salida | pares | qué significa |
|---|---|---|
| **NO CONTESTABLE offline** | **14** | su propiedad no está entre los ejes de `f33-cmp`, o no hay regla capturada |
| **OTRO CANAL?** (con interrogante) | **2** | `et_pb_equal_columns` (`flex`) y `et_pb_fullwidth_section` (`padding`): geométricas, y el fuente del clon menciona la propiedad — **candidato, no veredicto** |
| **cerrados con Δ de dos lados** | **0 de 16** | ninguna congelada de este repo compara `text-align`, `background` ni `position` en estos nodos |

**Por qué no se cierran, con su número:** `f33-cmp` compara **geometría**
(`docH · base · nSecciones · nFilas · nModulos · anchos · cajas · enlaces ·
cascaron`), y **10 de los 16 pares ganan `text-align`** — que no mueve ninguno
de esos ejes salvo por envolvimiento.

> **Y lo que esto le quita de delante al propietario:** los 16 «NO» **no son 16
> deudas confirmadas**. Son 16 preguntas, de las que hoy **2** tienen candidato
> a estar resueltas por otro canal y **14** ni siquiera se pueden formular con
> los instrumentos que hay.

**Tres cosas accionables para quien construya la sonda que sí las cierre:**

1. **el efecto de 3 pares vive en los DESCENDIENTES, no en el nodo** —
   `et_pb_with_background` (12 reglas de contexto), `et_pb_gutters2` (29) y
   `et_pb_sticky_module` (1)—. Comparar la propiedad **en el nodo que lleva la
   clase** daría **Δ0 con el defecto puesto**: §*una regla en el NIVEL
   equivocado no da error*, sabido de antemano;
2. **3 pares no tienen NINGUNA regla en lo capturado** —`et_pb_column_empty` y
   `et_pb_section_video_on_hover` ×2— y eso **no es «sin efecto»: es la
   COBERTURA** (108 hojas capturadas de 507). Lo que los cierra es capturar sus
   hojas, y eso necesita red;
3. **la sonda va a LOS DOS ANCHOS** (§regla 35): `gutters2` y `equal_columns`
   son justo del tipo que vive en un `@media`, y el ancho donde su regla no
   compite no puede verla.

> ⚠ **Los tres límites de este censo, declarados con su número (§regla 14):**
>
> 1. contesta *«¿escribe el clon esta CLASE?»*, **no** *«¿sirve el clon este
>    EFECTO?»*. Un preset puede estar resuelto por otro canal, así que un «no
>    emite» es una **PREGUNTA para el dato**, no un veredicto;
> 2. su universo son **las 31 rutas de F3-3 y sólo ésas**. Una clase que no
>    discrimine aquí puede discriminar en el primer documento nuevo;
> 3. sólo censa `et_pb_*`. **`boton-azul` —el precedente— es una clase DEL TEMA**,
>    sin ese prefijo, así que **14 es una COTA INFERIOR**, no el total.

### La decisión que sube, y es UNA

**¿Adopta el modelo «preset del editor portado por clase» como canal general, y
con qué alcance de las 14+ CLASES (16+ PARES)?** Las tres salidas, con su coste:

| | qué | coste |
|---|---|---|
| **P1** | un campo `preset` por nivel (fila · columna · sección · módulo), enum abierto, `conDefecto` | una migración, y **cubre los 14 de golpe** — incluidos los que nadie ha fichado |
| **P2** | un campo por preset fichado (`alineacion`, `gutters`) | dos migraciones y **12 sin cubrir**, que volverán de uno en uno |
| **P3** | no modelar ninguno y dejar la hoja escribiendo por reparto | **0 migraciones**, y `f33.css` sigue siendo *correcto para las 31 y falso para la primera página nueva* |

### Y las DOS que salen de la mesa, con su número

| deuda | veredicto de la 108.ª |
|---|---|
| **`gallery`** | ✅ **NO ES DEUDA.** `MODULO_GALLERY` **existe** en `bloques/kb.ts` y el clon lo sirve: `kb-cmp` ve sus **6 items con los DOS lados** (1408 pares · 0 distintos · `soloOriginal: 0`), y lo mismo contra el original **vivo**. La ficha había leído `KIND_DE_DIVI` —la tabla de traducción **de una sonda**— creyendo leer el esquema. Y los items son **6**, no 11 |
| **`button.pt` / `button.pb`** | ✅ **NO ES DEUDA: es PLANTILLA.** La cascada dice `.et_pb_button` —**selector genérico, sin ordinal**— en `KunakAir/style.css`, `!important`, **12 nodos**, `0.5em`/`0.6em` **declarados idénticos a 1440 y a 390**. El test A dictaba «CAMPO» porque **un `em` no se mueve con el ancho lo escriba quien lo escriba** (regla nueva en `CLAUDE.md`). Habrían sido **dos campos inventados** |

> ⚠ **Y una QUINTA que sí es hueco y no estaba en la mesa:** `dvmd_table_maker`
> —módulo de TERCEROS, sin prefijo `et_pb_`, invisible a todos los censos de
> tipos— **no está en ninguna colección** y emite **2 rutas**, no 1. La segunda es
> `/politica-de-cookies`, de F3-3, con **Δ docH −1512.00** medido de dos lados
> **a 1440**. Es §F3-3-MODULO-DE-TERCEROS, abierta desde la 105.ª.

#### ⚠ Y LA PREGUNTA NO ERA LA QUE ESTABA ESCRITA — derivado en la 109.ª

*«Sin bloque en ninguna colección»* es cierto **de `paginas`**. Pero
`packages/cms-config/src/bloques/monografico.ts` **ya exporta `MODULO_TABLA`**
(`slug: "tabla"`), tabla **genérica** —`cabeceras: array[{texto}]` +
`filas[].celdas[]` con `CELDA = {texto, fuerte, resto}`—. Así que lo abierto no
es *«¿hay que inventar un tipo?»* sino **«¿cabe lo que se sirve, y qué queda
fuera?»**, y eso se contesta **recorriendo el DOCUMENTO, no los campos**
(`derivaciones/tabla-cookies-109.{mjs,log}`).

**Lo primero que aparece es que NO ES UNA TABLA HTML:** `<table>`, `<thead>`,
`<tr>`, `<td>` salen **0 en el marcado**. Es una **rejilla de `<div>`** con la
posición en las clases (`dvmd_tm_row_N` · `dvmd_tm_col_N`), UNA tabla de
**11 × 5 = 55 celdas**. Cualquier extractor que buscara `<table>` daría cero y
lo leería como *«no hay tabla»*.

**Y las celdas tienen TRES papeles, no dos:**

| papel | celdas | columna(s) | ¿lo expresa `MODULO_TABLA`? |
|---|---|---|---|
| `dvmd_tm_rhead` — cabecera de FILA | **11** | 0 | ⛔ **no**: `cabeceras` es una lista PLANA, o sea de columna |
| `dvmd_tm_tdata` — dato | 33 | 1 · 2 · 3 | ✅ sí, en `celdas[]` |
| `dvmd_tm_rfoot` — PIE de fila | **11** | 4 | ⛔ **no**: no hay `pies` ni papel por columna |

> **⇒ 22 de las 55 celdas (40 %) llevan un papel que el modelo no expresa.**
> El contenido *cabe* —las 55 son texto plano, **0 enlaces · 0 listas · 0
> párrafos múltiples**, así que `{texto, fuerte, resto}` no pierde ni un
> carácter—. Lo que no cabe es **la ESTRUCTURA**.

**Y hay una cuarta cosa sin sitio que el marcado no marca:** la **fila 0** es
una cabecera de columna por su CONTENIDO —`Cookie · Propia o de terceros · Tipo
· Propósito · Más información`— y **ninguna clase lo dice**. `cabeceras` podría
expresarla, pero entonces **se pierde el papel de la columna 0**: el modelo
tiene UN sitio para cabeceras y el documento tiene DOS ejes.

> **La decisión que sube, y ahora con su reparto:** adoptar `MODULO_TABLA` tal
> cual conserva **33 de 55 celdas con su papel** y aplana las otras 22.
> Expresarlo entero pide **un papel por columna** (o por celda), que es un campo
> nuevo — no un tipo nuevo.

### ✅ T1 · APLICADO (113.ª, 2026-08-26) — y la condición de reapertura CON SU NÚMERO

`MODULO_TABLA` se adoptó **tal cual**, sin modificarlo, importándolo desde
`bloques/monografico.ts` a `MODULOS_PAGINA`. Migración
`20260826_173354_f3_3_t1_tabla_cola_larga` (4 tablas, reversa probada antes de
sembrar). En la DB: **1 tabla · 11 filas · 55 celdas · 0 cabeceras**.

**PÉRDIDA DECLARADA, con su cardinal** (§regla 14):

| qué se pierde | cardinal | coste en PÍXELES |
|---|---|---|
| papel `rhead` (cabecera de fila, col 0) | 11 | **0** |
| papel `rfoot` (pie, col 4) | 11 | **0** |
| fila 0 como cabecera de columna | 5 | **0** |
| `ritmo` con unidad (bloque trae `moduloBase`) | 1 campo | **0** — inerte: el extractor escribe 0 claves de geometría |

**Los 22 papeles cuestan CERO píxeles, y eso está medido, no supuesto:** papel y
columna son **1:1 en las 55**, así que `f33.css` los recupera por POSICIÓN
(`:first-child` → col 0 · `:nth-child(5)` → col 4). Lo que se pierde es la
SEMÁNTICA —el original sirve `role="rowheader"` en las 11 de la columna 0 y el
modelo no puede afirmarlo—, no la geometría.

**EL RESIDUO, con sus dos lados y su ancho** (`f33-cmp`, corpus con sus hojas):

| ancho | antes de T1 | **después** | tabla orig → clon |
|---|---|---|---|
| **1440** | `docH` Δ **−1512.00** (módulo AUSENTE) | **+45.00** | 1511 → 1542 |
| **390** | `docH` Δ **−1952.00** (módulo AUSENTE) | **+770.00** | 1824.88 → 2697 |

**ATRIBUCIÓN — y es lo que decide T2, porque un residuo sin atribuir no reabre
nada ni cierra nada.** Ni un píxel del residuo es imputable a los 22 papeles
aplanados. Todo lo medido cae en **transcripción de CSS**, y se cerró en dos
pasos con su número:

| término | @1440 | @390 |
|---|---|---|
| tipografía y `padding` leídos del `<style>` en vez de la CASCADA | +815 → **+45** | — |
| `padding` de celda que cambia con el ancho (`8px 20px` → `8px 10px`) | — | +1547 → **+770** |

> **T2 **NO** SE REABRE.** La separadora se escribió en el pre-registro antes de
> medir: *«> 150 y atribuido AL PAPEL ⇒ T2 se reabre; > 150 y atribuido a otra
> cosa ⇒ defecto de transcripción, se arregla en el componente»*. El residuo
> está atribuido a transcripción en los dos anchos.

**LO QUE SÍ REABRE T1**, y hoy no existe: **una SEGUNDA tabla `dvmd` con otra
piel**. Todo el CSS de la tabla lleva ordinal (`.dvmd_table_maker_0`,
`item_N`), o sea que por el discriminador de este repo **es campo, no
plantilla**, y `MODULO_TABLA` no tiene campos de piel: los colores, el
`padding` y la rejilla están cableados en `f33.css` con los valores **de la
primera instancia**. Es literalmente el patrón del que avisa `CLAUDE.md`.
`dvmd_table_maker` aparece en **21 documentos** y emite **2 rutas**, y la otra
es de arquetipo escrito a mano: **n = 1**.

⚠ **Y lo que queda SIN ATRIBUIR, con su número:** de los **+770** de 390 y los
**+45** de 1440, la parte que no se explicó es **la celda que mide 81 contra
54.38 a 390** con `font-size`, `line-height`, `padding`, ancho de columna y
rejilla **ya idénticos**. El único eje que sigue difiriendo en lo medido es el
`font-size` de la CELDA (orig 13px · clon 15px) mientras el del `cdata` casa
(15/21 en los dos). No se cablea sin entender por qué: es **SIN PROBAR**, y lo
dirime medir el envuelto renglón a renglón, no otro retoque de CSS.

⚠ **El punto de corte del `@media` de 390 NO está derivado**: sólo se midieron
1440 y 390, los `@media` de `dvmd` del documento usan 980 y 767 y **ninguno
toca `padding`**. Se escribió en **767** para garantizar el ancho de contrato;
**768–980 queda SIN PROBAR**, y es rango intermedio.

⚠ **Y una consecuencia declarada de NO tocar `arbol-f33`:** su `tipoDe` exige
`et_pb_<tipo>_<n>` y no puede ver el módulo de terceros, así que el cruce de
`f33-cmp` publica `/es/politica-de-cookies/ · dom 9 · censo 8 ·
tiposQueElCensoNoNombra: ["dvmd_table_maker"]` y **cuenta como rojo**. Es
correcto e informativo —el hueco sale NOMBRADO— y conciliarlo obliga a tocar la
definición compartida de **15 consumidores** (§regla 29 mitad 2), con el radio
de caducidad que la 112.ª midió. Fuera del alcance de esta tanda.

⚠ **Dos unidades, siempre:** `dvmd_table_maker` aparece en **21 DOCUMENTOS** y
emite **2 RUTAS**. Esta derivación mira **una ruta**. Y la otra emitida,
`/monitor-calidad-aire`, es de arquetipo **escrito a mano** (13 de 31 celdas
citadas en `src/`), así que lo que allí se sirva **no es un veredicto sobre el
CMS** — el propio censo ya avisa de que es un FALSO NO sobre lo que sirve la DB.

---

# §2m · `autores` — LA COLECCIÓN SIN ARCHIVO, Y LA FIRMA CON PAPEL (117.ª, 2026-08-27)

**Decisión del propietario, tomada y sostenida por el dato:** `author` es una
ENTIDAD CON CAMPOS, no una plantilla con la lista dentro — **7 de 7** ejes de
contenido propio varían entre sus 6 instancias. Se modela como COLECCIÓN.

## §2m.1 · Colección SIN archivo, y por qué eso no es media colección

El archivo `/author/*` **no se emite**. No es una renuncia, es lo que dice el
dato:

| | |
|---|---|
| formas de listado que lo enlazan | **0 de 35** |
| `href` a `/author/` que el clon puede servir | **1**, y es **ABSOLUTO** |
| `href` LOCALES a `/author/` | **0** |
| rutas `/author/*` que el build emite | **0** |

Así que no emitirlo **no crea ni un enlace roto** (§Regla de rutas locales: si
el destino no está clonado, el `href` se queda apuntando al original).
Verificado tras sembrar: diferencia simétrica de rutas **0 perdidas · 0 nuevas**
sobre **416**.

⚠ **Y NO llama a `registroDeSlug`** (§regla 25): el registro impone unicidad en
el plano de un segmento de `/es/`, y estos términos **no tienen URL en ese
plano**. Reclamarlo sólo podría **bloquear** 5 slugs de raíz que ninguna URL
usa — una guarda cuyo dominio es más ancho que su invariante deja de proteger y
pasa a rechazar cosas correctas.

## §2m.2 · Campos, con la fracción que EJERCITA cada opcional

    autores  slug · nombre · foto · fotoOrigen · cargo · redes[] · bio

| campo | lo traen | lo dejan vacío |
|---|---|---|
| `nombre` | 6 de 6, **todos distintos** | — |
| `foto` | 4 de 6 | 2 — sirven el `user.svg` del TEMA, que no es la foto de nadie |
| `cargo` | 4 de 6 | 2 — y con `<p></p>`, vacío de verdad |
| `bio` | 4 de 6 | 2 |
| `redes` | 5 de 6 | 1 |

§*un campo opcional no expresa un caso: sólo PERMITE que falte* — aquí el caso
está **ejercitado por el original**, así que estos caminos de render **no son
«sin estrenar»**.

⚠ **`foto` va declarada y VACÍA**: las **5** fotos de la ficha están **0
capturadas**. Canal enumerado ANTES de que matara un seed (§F3-4-FICHA-FOTOS).

⚠ **Se siembran 5, no 6.** `mar_ramirez` tiene archivo y firma **0 de 152**
entradas: no se siembra un autor que ninguna firma referencia.

## §2m.3 · La relación: ARRAY con PAPEL, y el orden es el HUECO

    entradas-blog.firmas[]         autor -> autores · papel · proemio
    documentos-cientificos.firmas[]  idem

**No cabe en un campo simple:** 150 entradas traen un firmante y **2** traen
dos, separando «Revisado y aprobado por» de «Escrito por». Un `relationship`
simple perdería el segundo; un `hasMany` sin papel perdería CUÁL es cuál.

**El orden no es decorativo**: el elemento 0 se pinta en el hueco `revisor` —el
que lleva la foto, 152 de 152— y el 1 en `autor`, sin foto (2 de 2). El hueco se
DERIVA de la posición y no necesita campo.

### `proemio` se guarda, y la elección se midió

| modelo | instancias separadoras | acierto |
|---|---|---|
| `proemio = f(autor, papel)` | **1** | falla |
| `proemio = f(autor, papel, hueco)` | **0** | 8 de 8 triples |

Lo PROBADO es que **(autor, papel) NO basta**. Que el triple sea *la* función
**no lo está**: se apoya en UNA instancia separadora. Así que el texto se guarda
con su defecto derivado y se **omite cuando coincide** — si la función es
correcta el dato queda vacío en las 152 y no cuesta nada; si es falsa, el
original se replica igual (§sondas 6, el defecto en la dirección que grita).

### `formaMedida: "objeto"` — y la v1 lo puso al revés

`firmas[].autor` es un **término embebido `{slug, nombre}`**, como `categorias`
y `etiquetas`. La v1 lo declaró como slug pelado —que es lo que el extractor
emitía— y **el extractor era el que estaba mal**: con slug pelado el RENDER no
tiene el `nombre`, que es el texto del enlace.

Lo destapó **la adjudicación, no la lectura**: `href` salió `/author/undefined`
y el proemio perdió su `‹NOMBRE›` en **22 pares**. Y no se arregla subiendo
`depth`: una relación **dentro de un array** queda un nivel por debajo de
`depth: 1`, y `proyector.ts` documenta por qué subirlo es la salida cara.

## §2m.4 · Las dos migraciones, con su reversa PROBADA antes del dato

`20260827_110011_f3_4_autores_y_firmas` · `20260827_114716_f3_4_firmas_doc_cientifico`

⚠ **El `down` generado NO revertía.** Payload emite `DROP TABLE "autores"
CASCADE` y **después** `DROP CONSTRAINT "…_autores_fk"` — que el CASCADE ya se
llevó. Corregido con `IF EXISTS`. Verificado **tabla a tabla** (§regla 30), no
con el total: `diff` sin salida, 134 y 137 líneas idénticas.

**La ventana era ésa y sólo ésa**: una reversa que borra tablas sólo se puede
comprobar mientras no haya filas que dependan de ellas.

## §2m.5 · Lo que este modelo NO decide, con su cardinal

- **el archivo `/author/*`**: no se emite. Si algún día se emitiera, `autores`
  entraría en el registro de slugs — hoy no, y por eso no lo reclama;
- **la foto**: declarada y vacía, **0 de 5** capturadas;
- **el render en documento científico**: el dato está sembrado (23 de 23) y el
  render NO lo pinta, porque su EMPLAZAMIENTO no está medido — allí hay **1**
  ficha y en blog **2**, y con una sola no se sabe a qué ancho se ve
  (§F3-4-FICHA-DOC-CIENTIFICO).

---

## ⏳ 2026-08-30 · 123.ª tanda — `CMS-F35-RITMO`: los arquetipos de `src/lib` NECESITAN campos de ritmo, y todavía NO se escriben

**Medido, no supuesto** (`docs/research/cola-larga/derivaciones/tests-ab-123.*`,
3 controles en verde · 357 nodos con caja · régimen `B-` derivado antes de
aplicar ningún test):

Aplicados los **dos** tests a los ejes de RITMO —`margin`/`padding` de sección,
fila y módulo— de los 4 documentos del lote **PRODUCTO · CATÁLOGO · SOFTWARE**,
sobre 48 celdas (4 documentos × 3 tipos × 4 ejes):

| | `seMueve` → test A dice **plantilla** | `noSeMueve` → test A dice **campo** |
|---|---|---|
| **varía** → test B dice **campo** | **27** | **4** |
| **no varía** | **0** | **0** |
| *(sin nada escrito: único valor = 0, el inicial)* | | **17** |

**Lo que la tabla decide, y es una sola cosa:** el content type de estos
arquetipos **necesita campos de ritmo por bloque**, como `flujo` en SECTOR —
porque **31 de 31** ejes escritos son campo y **cero** son plantilla. No hay
ninguno que se pueda cablear en el componente.

**Lo que la tabla NO decide, con su cardinal — y por eso esto queda `⏳` y no
`✅`:**

- **el eje `módulos` está SIN COMPARAR** contra el original, no a «0 defectos»:
  el clon no emite marcador de módulo, así que los dos selectores no denotan el
  mismo conjunto (medido: `14 → 2`, `7 → 2`, `6 → 2`). Cerrarlo pide emitir
  `data-modulo` en los componentes;
- **420 PARES (nodo × eje) no tienen llave** de emparejamiento entre anchos
  (ordinal de clase), y quedan fuera del cruce. ⚠ **La unidad estaba mal escrita
  aquí** —decía «420 nodos»— y son **105 NODOS × 4 ejes de ritmo**. Los dos
  cardinales son ciertos, cada uno en su unidad, y **ninguno sustituye al otro**;
  reconciliado y derivado en §2n;
- **los 4 de la celda `varia+noSeMueve` salen CON RESERVA**: son los únicos donde
  el test A por sí solo dictaría campo, y esta derivación **no mira la unidad
  declarada** — un `em` no se mueve con el ancho lo escriba quien lo escriba.
  Hace falta la **cascada** (`CSS.getMatchedStylesForNode`);
- **la varianza INTER-instancia no está medida**: los 4 documentos son 4
  arquetipos distintos, no 4 instancias de uno. Escribir el modelo hoy sería
  modelar desde una única instancia por arquetipo, que es el arreglo falso que
  §F3-5 tiene como incógnita declarada desde que se abrió.

> **Y el hallazgo de método que esta tanda deja, porque vale para cualquier
> arquetipo de builder que venga después: aquí el test A, aplicado SOLO, habría
> respondido AL REVÉS en 27 de los 31 ejes escritos — el 87 %.** El falso
> negativo que `CLAUDE.md` describe —*un campo escrito en % igual que su default
> se mueve con el ancho y parece plantilla*— **no es un caso marginal en este
> arquetipo: es la mayoría**. Y las 17 celdas SIN ESCRIBIR, leídas por el
> enunciado literal, habrían sido **17 campos inventados** más.

---

# §2n · `CMS-F35-MODULO` — **QUÉ CUENTA COMO «UN MÓDULO»**, fijado antes de escribir el content type (126.ª, 2026-08-31)

**Por qué esto va delante y no al pie.** El content type de F3-5 lleva un array
de módulos. Un array cuyo elemento no está definido **no se puede auditar
después**: cualquier comparación futura leería la diferencia entre dos
definiciones como defecto del clon. La 125.ª publicó **tres cardinales ciertos
por documento —110 · 90 · 83— y ninguno es «el» número**, así que fijarlo es
una precondición del escalón 2, no una nota.

Derivación con sus **14 controles en verde** y sus **dos cruces al elemento**:
`docs/research/cola-larga/derivaciones/paso0-criterio-126.{mjs,json,log}`.

## §2n.1 · El criterio ELEGIDO, y por qué

> **UN MÓDULO = un nodo `.et_pb_module` del CUERPO que NO cuelga de otro
> `.et_pb_module`.** Cascarón descontado (`_tb_header` · `_tb_footer`).
> **Unidad: módulo de primer nivel.**

| documento | módulos de primer nivel |
|---|---|
| PRODUCTO | **90** |
| CATÁLOGO | **35** |
| SOFTWARE | **70** |
| SOFTWARE-corta | **36** |
| **total 4 docs** | **231** |

**La razón no es de comodidad: es que el original la SIRVE.** El escalón 2 de la
125.ª estableció que *«sin llave» es un discriminador servido entre lo que
compuso el EDITOR y lo que compuso el CONSTRUCTOR* — el constructor sólo numera
los módulos que el editor colocó. Cruzado **profundidad × llave** sobre los 311
módulos del cuerpo, la partición sale así (los cuatro cubos suman el total en
4/4 documentos):

| | con llave | sin llave |
|---|---|---|
| **primer nivel** | **230** | **1** |
| anidado | 4 | **76** |

**230 de 231 módulos de primer nivel llevan ordinal del constructor — el
99.6 %.** Y los **76 sin llave son los 19 `et_pb_toggle` × 4 documentos**: el
acordeón de FAQs, que **no son 19 bloques del flexible content sino el contenido
de UN campo** — `FAQ_ITEMS`, que el clon ya modela así. Los dos discriminadores,
uno estructural y otro servido, dicen lo mismo.

> ⚠ **Y las dos excepciones se declaran, porque no son ruido:**
>
> - **1 de primer nivel SIN llave**: `dvmd_table_maker` en PRODUCTO — módulo de
>   un tercero, que el constructor no numera. **Es módulo** por el criterio y
>   entra en el array;
> - **4 anidados CON llave**: `et_pb_posts`, 1 por documento. O sea que
>   «anidado» y «sin llave» **no son la misma partición**, y por eso el criterio
>   se escribe sobre la PROFUNDIDAD —que es lo que define el elemento del
>   array— y no sobre la llave, que es sólo la evidencia que lo respalda.

## §2n.2 · Los otros dos, NOMBRADOS CON SU UNIDAD — no se sustituyen

§*corregir un denominador no es sustituirlo en todas partes*: los tres son
ciertos y dicen cosas distintas. Citar uno sin su unidad es lo que los hace
indistinguibles.

| cardinal | unidad | qué es |
|---|---|---|
| **231** (90·35·70·36) | **módulo de primer nivel** | ✅ **EL CRITERIO.** El elemento del array del content type |
| **311** (110·55·90·56) | **nodo `.et_pb_module` del cuerpo EN EL DOM**, a cualquier profundidad | cierto. Es el censo del DOM, y cuenta un acordeón de 19 toggles como **20** |
| **215** (83·33·66·33) | **módulo con caja @1440 dentro de las `min(orig,clon)` primeras filas con caja** | cierto, y ⚠ **NO es un criterio de módulo** — ver abajo |

> ⚠⚠ **EL 83 NO DICE QUÉ CUENTA COMO UN MÓDULO: DICE CUÁNTOS CABEN EN LAS FILAS
> QUE EL EMPAREJAMIENTO DEJÓ VIVAS.** `productos-cmp` publica `porFila` como
> `p.O.filas.slice(0, n)` con `n = min(nO, nC)`, así que **deja fuera la última
> fila del original**. Medido en la congelada: **1 fila huérfana por documento,
> 4 de 4** (7→6 · 9→8 · 7→6 · 7→6), y el control cruzado cuadra con el
> `huerfanasO: 4` que la propia congelada publica.
>
> **Es §*la causa común: el NIVEL al que se mide* con el contenedor puesto en el
> EMPAREJAMIENTO**, y mezcla además un segundo eje —el filtro de CAJA— con el
> primero. Un cardinal que confunde dos ejes no puede ser el criterio de ninguno.
>
> **Lo que queda SIN DERIVAR, con lo que haría falta:** cuántos módulos tiene esa
> fila huérfana en cada documento **no está en la congelada** (va recortada). Lo
> daría una corrida de `productos-cmp` con el clon servido; hasta entonces se
> declara con su cardinal —**4 filas, 1 por documento**— y no se rellena.

## §2n.3 · La reconciliación 420 / 105 — DOS UNIDADES, no una corrección

La 123.ª escribió **«420 sin llave»** y la 125.ª **«105»**. No se corrigen entre
sí: **son el mismo conjunto en dos unidades**, y los dos son ciertos.

Derivado, no recordado — el número de ejes se **lee del fuente** de la 123.ª
(`tests-ab-123.mjs`, `const EJES = [...]`):

> **4 ejes de ritmo** —`marginTop` · `marginBottom` · `paddingTop` ·
> `paddingBottom`— **× 105 NODOS = 420 PARES (nodo × eje).**

Y el cruce se hace **al elemento, no por el total** (§*un cardinal es un
contenedor y absorbe la membresía*): `sinLlave` **por documento** reproduce
exacto contra las dos congeladas de la 125.ª — **34 · 22 · 27 · 22** en 4 de 4.

> ⚠ **Y los dos censos de la 125.ª NO cuentan la misma unidad**, así que
> cruzarlos por el total daría un desacuerdo inventado: el escalón 1 cuenta
> **311 módulos del cuerpo**; el escalón 2, **357 nodos con caja** que incluyen
> **secciones y filas** además de módulos. Los dos son correctos; sólo coinciden
> al nivel del elemento, que es donde se cruzaron.

## §2n.4 · Lo que este criterio NO decide

- **no decide el eje `módulos` del comparador.** Sigue **SIN COMPARAR** (`·`),
  y con los dos bloqueos que la 125.ª derivó: 35 componentes de 97 que habría
  que tocar para emitir `data-modulo`, y este criterio —que ya no bloquea—.
  Fijarlo era la precondición, no el cierre;
- **no mide el eje CAJA.** El censo es offline y del DOM; un módulo escondido
  cuenta aquí y no tiene geometría (§*lo que no tiene caja no es que no se
  cuente: es que no se puede medir*). Para el ARRAY del content type eso es lo
  correcto —el editor lo colocó igual—, pero **no se puede usar este cardinal
  para leer geometría**;
- **es propiedad de estos 4 documentos**, no del sitio.

---

# §2ñ · `CMS-F35-BREAKPOINT` — **la tercera posición de `medida()`**, y el hallazgo es que la segunda estaba mal nombrada (126.ª, 2026-08-31)

## §2ñ.1 · El hueco, con su censo

La 125.ª dejó **un** hueco de tipo en `medida()` (el de unidad se cerró: la base
del `rem` es 16px constante). Censado sobre los 4 documentos del lote —sólo
reglas de ritmo cuyo ordinal es **SUJETO** del selector, §regla 36—:

| posición | declaraciones del editor |
|---|---|
| base (escritorio) | **85** |
| `@media (max-width: 980px)` — pestaña **TABLET** de Divi | **20** |
| `@media (max-width: 767px)` — pestaña **MÓVIL** de Divi | **20** |

Divi da **tres** pestañas por campo de espaciado; `medida()` tenía **dos**
posiciones. Un valor de tablet guardado en la de móvil se serviría **también a
390**, donde el original sirve otro.

## §2ñ.2 · ⚠⚠ CUÁL FALTABA SE DERIVA DEL RENDER, NO DEL NOMBRE DEL CAMPO

Parecía que faltaba la de tablet. **No:** los dos consumidores del grupo aplican
`--*-movil` dentro de `@media (max-width: 980px)` —`f33.css` L144/185/243/303 y
`kb.css` L96/178, derivado y cruzado en `qa:medida-bp`—. O sea que

> **`movilValor` ocupa la posición de TABLET (≤980). La que faltaba es la de
> ≤767, que es la que de verdad se sirve a 390.**

Es una instancia más de §*cuando lo que replicas es un VALOR SERVIDO, escribe el
valor, no la intención*: `movil` es una intención, `980` es el valor. Por eso la
posición nueva se llama **`valor767`/`unidad767`**, por su punto de ruptura.

**`movilValor` NO se renombra** (§regla 29 punto 2). El recuento que lo decide se
**derivó** antes de tocar nada, por los tres canales
(`derivaciones/consumidores-medida-126.*`, 7 controles):

| canal | cardinal |
|---|---|
| ESQUEMA · llamadas a `medida(` | **16** en 2 ficheros (`kb.ts` 7 · `paginas.ts` 9) |
| RENDER · lectores a mano | **4** (+ `payload-types.ts` generado, 425 ocurrencias, identificado aparte) |
| BASE · tablas · columnas · grupos | **18 · 165 · 55** |
| colecciones POBLADAS alcanzadas | `articulos_kb` **6** · `paginas` **31** |

Con 55 grupos vivos en dos colecciones pobladas, renombrar rompería a todos para
arreglar a uno. Se **amplía**.

## §2ñ.3 · La migración, con su reversa probada ANTES de sembrar

`20260831_014031_f3_5_medida_breakpoint_767`. §regla 30: la ventana en la que la
reversa tiene respuesta es **antes de que entre el dato**, y se verificó
**TABLA A TABLA con `diff`**, no con el total:

| comprobación | resultado |
|---|---|
| simetría del fichero | **110 ADD COLUMN / 110 DROP COLUMN · 55 CREATE TYPE / 55 DROP TYPE** |
| `up` → censo de columnas | **18 tablas** cambian — exactamente las 18 derivadas |
| `down` → censo de columnas | **`diff` VACÍO** contra el de antes, en las **138** tablas |
| filas tras la reversa | `entradas_blog` 152 · `articulos_kb` 6 · `casos` 57 · `paginas` 31 — intactas |
| tipos huérfanos tras la reversa | **0** |
| registro de migraciones | **25 → 24, y se fue UNA**: la creada |

> ⚠ **Y el aviso de §regla 30 se cobró en vivo:** `payload migrate:down` imprimió
> **«Rolling back batch 2 consisting of 25 migration(s)»** y revirtió **una**.
> El veredicto lo dio la tabla `payload_migrations`, no la consola — §*el LOG de
> la herramienta no es lo que la herramienta hizo*.

Cruce que cierra el recuento: **55 `CREATE TYPE` = 55 grupos** derivados de la
DB, y tras aplicarla `pg_type` trae **55 enums (`e`) + 55 arrays (`b`)** — los
arrays los crea Postgres solo, derivado por `typtype` y no supuesto.

## §2ñ.4 · La guarda que `medida()` no tenía — y lo que declara SIN ESTRENAR

`medida()` llevaba desde que existe **sin ninguna sonda que leyera su forma**
(derivado: 0 de las de `scripts/qa/`). La 126.ª le añade
**`npm run qa:medida-bp`**, con 8 controles y **5 casos de negativo, control
incluido**, cada uno cayendo por su motivo:

| invariante | qué pasa si falta |
|---|---|
| POSICIONES | vuelve el hueco: 2 posiciones para 3 breakpoints medidos |
| NOMBRES DISTINTOS | la versión vieja de `unidadDe` mapeaba a mano con un ternario de **dos ramas**, así que la tercera unidad se habría llamado `movilUnidad` y **colisionado en silencio** — dos campos con el mismo `name` no son un error de tipos (§regla 9, 7.º caso) |
| VALIDATE muerde, y su control acepta | la unidad **supuesta** en vez de rechazada, o sea el defecto que `medida()` existe para corregir |
| CRUCE con el render | el esquema nombra un ancho y el render aplica otro — el hallazgo de §2ñ.2 con el signo cambiado |

> ⚠ **DECLARADO CON SU CARDINAL (§regla 14): `valor767` es hoy un camino de
> render SIN ESTRENAR.** Ni `f33.css` ni `kb.css` tienen tramo `≤767` para el
> ritmo, y `vars()` no emite `--*-767`: **0 consumidores**. La sonda lo publica
> en cada corrida y **no lo cuenta como fallo** — es un hecho, no un rojo.
> Cablearlo es trabajo de otra tanda y lleva su NO-OP por delante.

---

# ✅ §2o · `CMS-F35` — **EL CONTENT TYPE DEL LOTE F3-5**, escrito con sus SIN PROBAR delante (126.ª, 2026-08-31)

**Colección `arquetipos`**, registrada en `COLECCIONES`, con migración
`20260831_015813_f3_5_arquetipos` y su reversa probada. Fuente:
`packages/cms-config/src/{bloques,colecciones}/arquetipos.ts`.

## §2o.1 · La membresía, y `/kunak-api` no estrena arquetipo

| ruta | discriminante |
|---|---|
| `/monitor-calidad-aire` | `producto` |
| `/accesorios` | `catalogo` |
| `/software-de-medicion-calidad-del-aire` | `software` |
| `/kunak-api` | `software` + `varianteCorta` |

El discriminante tiene **TRES** valores, no cuatro: el recon de `/kunak-api`
concluyó que *«el arquetipo API/desarrollador no existe»*, así que modelarlo
como un cuarto habría creado un arquetipo que la medición niega. **HOME queda
fuera de esta tanda por alcance, no por criterio.**

## §2o.2 · Colección propia y no `paginas` — decidido CONTANDO, y con su operación

Derivado antes de decidir (`derivaciones/tipos-f35-126.*`, 7 controles): la
unión de `paginas` ya expresa **8 de los 11 tipos** y **228 de las 231
instancias — el 98.7 %**. Con ese número reutilizar era una opción viva, y aun
así se separa, por dos razones **con la operación escrita** (§regla 23):

1. **§1.5b Razón 3** — deshacer «dos colecciones» es **FUSIONAR**, el lado
   barato; deshacer «una» es SEPARAR, el caro;
2. **`paginas` es la COLA LARGA**, con membresía enumerada (48 rutas / 32
   páginas). Estas 4 son arquetipos **nombrados**, con recon, specs y
   componentes propios: meterlos ahí haría falsa la definición de esa colección.

> ⚠ **CONDICIÓN DE REAPERTURA** —la decisión se toma con dominio corto, así que
> la lleva: si las dos uniones llegan a coincidir al **100 % de los TIPOS**
> (hoy 72.7 %) o si desaparece del corpus alguno de los 3 que estrena, **se
> re-evalúa fusionar**, que es el lado barato.

**Los 3 que ESTRENA:** `et_pb_cta` · `dvmd_table_maker` · `et_pb_gallery`, **1
instancia cada uno**, las tres en PRODUCTO. Y `gallery` **sí lo expresa el
esquema por otro canal** (`MODULO_GALLERY` en `bloques/kb.ts`): lo que no lo
expresa es la unión de `paginas`. Decir *«el esquema no lo expresa»* leyendo una
sola colección es §*la salida servida incluye el canal que no estabas mirando*.

> ⚠⚠ **Y EL CENSO DE TIPOS LLEGÓ CON UN SOBRE-CASADO QUE HABRÍA INVERTIDO EL
> VEREDICTO.** La v1 derivaba el tipo de *la primera clase desnuda*, y eso toma
> **MODIFICADORES por tipos** sin dar error: `et_pb_with_border` sobre un
> `et_pb_text` (x3), `et_pb_promo` donde el ordinal dice `et_pb_cta`,
> `et_pb_button_module_wrapper` donde dice `et_pb_button` (x24). Publicaba
> **86.6 %** y *«colección propia»*; derivando el tipo **del ORDINAL** sale
> **98.7 %** y *«reutilizar»*. Lo delató que *«con borde»* no es un tipo de
> módulo — §*un tipo implausible: la primera hipótesis es el instrumento*.
> Evidencia conservada:
> `tipos-f35-126-SONDA-TIPO-POR-CLASE-DESNUDA-MODIFICADORES.json`.

## ⚠⚠ §2o.3 · El ritmo — **CORREGIDO EN LA 127.ª: 4 de los 6 «CAMPO» no eran campo, eran la regla `:last-child`**

**Lo primero, porque es lo que cambia el modelo:**

> **Comparar CONJUNTOS de valores entre instancias confunde «el editor escribió
> otro valor» con «la MISMA regla se aplicó a otro número de hermanos».** Una
> pseudo-clase estructural —`:last-child`, `:first-child`, `:nth-*`— mete un
> valor extra en el conjunto **sin que nadie escriba nada**.

Medido: `iconos-xs-2` `mb` daba PRODUCTO `[31.6719]` contra SOFTWARE-corta
`[0, 31.6719]`, y la 125.ª lo leyó como varianza de campo. El `0` lo declara
`.et_pb_module:last-child{margin-bottom:0}` del constructor, y **ningún selector
ganador de ese par lleva ORDINAL**. Los conjuntos no difieren en un valor:
difieren en **cuántos módulos hay en la columna**.

**⇒ De los 6 «CAMPO» de la 125.ª sobreviven DOS.** Los 4 de `iconos-xs-2` e
`iconos-md-3` pasan a **PLANTILLA** (ganador genérico: el reparto de Divi
`5.82 % · 4.242 % · 3.735 %` a 1440, `.et_pb_column .et_pb_module{30px}` a 390).

**Los cardinales, cada uno CON SU UNIDAD Y SU DOMINIO** (§regla 14 · §*dos
lecturas pueden dar el mismo cardinal contando unidades distintas* — los dos
dominios son ciertos y son **dos conjuntos de documentos**, no dos lecturas de
uno):

| dominio | pares | CAMPO | PLANTILLA | SIN ESCRIBIR | SIN PROBAR | Σ |
|---|---|---|---|---|---|---|
| **LOTE** — 4 arquetipos distintos | 52 | **2** | 10 | 40 | 0 | **52 ✓** |
| **FAMILIA PRODUCTO** — 3 instancias del MISMO | 132 | **8** | 26 | 98 | 0 | **132 ✓** |

> ⚠ **LAS CUATRO COLUMNAS DE VEREDICTO SON UNA PARTICIÓN Y SUMAN LOS PARES. LA
> VARIANZA ESTRUCTURAL NO ES UNA QUINTA CATEGORÍA: ES UN SUB-RECUENTO DE
> `PLANTILLA`** (corregido 2026-08-31, 128.ª, §regla 14 con el contenedor
> puesto en **el juego de claves**).
>
> | dominio | de sus `PLANTILLA`, por varianza ESTRUCTURAL |
> |---|---|
> | **LOTE** | **4 de 10** |
> | **FAMILIA PRODUCTO** | **0 de 26** |
>
> **Escritas las cinco al mismo nivel, la fila del LOTE sumaba 56 sobre 52
> pares** — el número siempre fue correcto y la FORMA presentaba un
> sub-recuento como hermano de sus contenedores. **Y la del LOTE era la única
> que podía delatarlo**: la de la FAMILIA cierra exacta (132 = 132) porque sus
> dos claves extra valen 0, o sea que el instrumento que teníamos delante para
> comprobarlo era **ciego por construcción** (§*0 instancias separadoras*).
>
> Derivado del `detalle` par a par, no del resumen —§*se compara en la unidad
> que se afirma*—: `escalon1-lecturas-128.{mjs,json,log}`, que cruza veredicto ×
> marca estructural y da **`PLANTILLA|estructural=true → 4`** en el lote y **0**
> en la familia. **Los JSON de la 127.ª conservan la forma vieja a propósito**:
> el arreglo es de redacción y no de dato, así que re-congelarlos sólo movería
> la evidencia de sitio (§regla 5 · §regla 8b: un pre-registro no se reescribe).

| unidad (familia) | CAMPO | de |
|---|---|---|
| par (marcador × ancho × eje) | **8** | 132 |
| marcador × eje | **5** | 68 |
| eje (`mt`·`mb`·`pt`·`pb`) | **2** (`mb`·`pt`) | 4 |

**El veredicto POR EJE es el mismo que escribió la 126.ª.** Lo que cambió es la
evidencia: el denominador pasa de 52 a **132** y las piezas que lo sostienen son
otras.

**LOS 8, con la varianza Y la cascada — las dos patas concuerdan en los ocho:**

| pieza | ancho | eje | valores por documento | selector ganador |
|---|---|---|---|---|
| `parametros` | 1440·390 | `mb` | monitor `0` · estacion `9` · sensor `0` | `.et_pb_text_14` `0.5em !important` |
| `clear-both` | 1440·390 | `mb` | monitor `0` · estacion `9` · sensor `0` | `.et_pb_text_14` `0.5em !important` |
| `menu-anclas` | 1440 | `mb` | monitor `31.6719` · estacion `27.2` · sensor `31.6719` | `.et_pb_text_15` `1.7rem !important` |
| `menu-anclas` | 1440 | `pt` | monitor `0` · estacion `17` · sensor `0` | `.et_pb_text_15` `1em !important` |
| `clear` | 1440·390 | `pt` | monitor `0` · estacion `32` | `.et_pb_text_16..29` `2rem !important` |

Los 8 llevan **`ordinal: true`** — el valor lo trae un selector
`et_pb_<tipo>_<n>`, que el constructor emite **por módulo** ⇒ lo escribió el
editor. El marcador es la **LLAVE** de emparejamiento, no el portador (§regla 36).

> ⚠⚠ **Y SU ALCANCE ES MENOR DEL QUE ESTA TABLA SUGIERE — CORREGIDO POR LA
> 128.ª (2026-08-31). NO CAMBIA NINGUNA DEFINICIÓN DE CAMPO: cambia DE CUÁNTAS
> INSTANCIAS SALIÓ LA EVIDENCIA, que es lo que lo hace auditable.**
>
> El comparador decide «lo escribió el editor» con
> `ganadores.filter(g => g.ordinal).length > 0` sobre **todos** los documentos
> del par. Es una **UNIÓN**, así que el ordinal de **uno** adjudica CAMPO para
> sus hermanos — que pueden no haber escrito nada.
>
> Re-adjudicado **por documento** (`SIN_EMPAREJAR=1`, unidad *documento ×
> marcador × ancho × eje*):
>
> | dominio | filas | lo que sale |
> |---|---|---|
> | **FAMILIA** | 348 | los 8 CAMPO son los **mismos** (`CAMPO → CAMPO` 8 de 8) **y los 8 son de UN documento**, `estacion-de-monitoreo`. `monitor` y `sensor` → **cero** CAMPO, y **12 de sus 14** filas movidas caen a `SIN ESCRIBIR` |
> | **LOTE** | 244 | de las 6 filas-CAMPO del par sobreviven **4**: CATÁLOGO (`.et_pb_text_7`) y SOFTWARE (`.et_pb_text_14`) tienen ordinal **propio**; PRODUCTO no, y cae a PLANTILLA (`mb`) y SIN ESCRIBIR (`pt`) |
>
> **Los campos siguen siendo campos** —la cascada los confirma con su selector
> ordinal— **pero su evidencia es de UNA instancia, no de tres.**
>
> **Y LA CASCADA SOLA ADJUDICA A LOS SINGLETON**, que es lo que el
> emparejamiento no podía por construcción (`docs.length < 2` ⇒ 0 pares):
>
> | arquetipo | CAMPO | PLANTILLA | SIN ESCRIBIR | resueltas |
> |---|---|---|---|---|
> | CATÁLOGO | **2** | 4 | 22 | 6 de 28 |
> | SOFTWARE | **4** | 6 | 34 | 10 de 44 |
> | SOFTWARE-corta | 0 | 8 | 32 | 8 de 40 |
> | PRODUCTO | 0 | 27 | 105 | 27 de 132 |
>
> ⚠ **Y APARECE UN CAMPO QUE NINGÚN PAR PODÍA VER:** `SOFTWARE · iconos-md-2 ·
> mb · 1440 y 390 · 40px !important` sobre `.et_pb_blurb_15/16` — **ordinal, o
> sea el editor**. `iconos-md-2` sólo está en SOFTWARE dentro del lote, así que
> el emparejamiento lo descartaba: **el cero era del ámbito de la llave**, no
> del original (§regla 29). No necesita definición nueva —`pieza` es texto
> libre— pero **sí cambia qué instancias ejercitan `mb`**. Fichado, no cableado.
>
> Congeladas: `escalon1-varianza-127-por-documento-{lote,familia}.{json,log}` ·
> sabotaje `-neg-sin-ordinal-por-documento-lote` (CAMPO 6 → 0, 18/18) · **NO-OP
> verde en los dos caminos existentes, con salida byte-idéntica**.

> ✅ **2026-08-31 (130.ª) — LOS DOS CAMPO DE SOFTWARE PASAN A ESTAR BAJO
> COMPARACIÓN DE DOS LADOS. NINGUNA DEFINICIÓN CAMBIA; lo que cambia es que
> ahora se pueden VERIFICAR contra el original.**
>
> Los dos —`menu-anclas` sobre `.et_pb_text_14/15` e `iconos-md-2` sobre
> `.et_pb_blurb_15/16`— viven en **la misma fila** del original (la 3), y ésa es
> la que el clon pasó a marcar con `data-modulo`: `productos-cmp` la compara
> **34 → 34** a los dos anchos. Hasta hoy el eje `módulos` de esta ruta estaba a
> `·`, o sea que los valores del ESQUEMA salían del ORIGINAL y **nadie había
> comprobado que el clon los sirviera**.
>
> **Y la primera comparación ya cosecha en el `mb` que estos campos modelan:**
> `mb 31.67 → 27.81` en los 9 blurbs de beneficios y en el texto de la fila,
> `mb 31.67 → 0` en las imágenes. Son **defectos del clon que llevaban ahí desde
> que se construyó**, no regresión: es cobertura nueva.
>
> ⚠ **Y su reverso, que hay que leer antes de tocar nada:** la primera línea
> base publicó además `Δ+243.75` constante en 14 tarjetas de `iconos-md-2`, y
> **eso NO era del clon**: era el `srcset` remoto del original ganándole al
> `src` localizado (§regla 43), así que el original no pintaba sus capturas.
> Corregido en la sonda. **Un Δ grande y CONSTANTE sobre el marcador de un CAMPO
> es exactamente la forma de un dato que invita a recalibrar el esquema** — y
> aquí habría recalibrado contra media unidad.

### Los 46, reescritos con su reparto y los dos números con su unidad

| de los 46 pares SIN VARIANZA del lote | n | vía |
|---|---|---|
| **RESUELTOS a PLANTILLA** | **6** | pata 2 · cascada · selector GENÉRICO |
| **SIGUEN ABIERTOS** | **40** | `SIN ESCRIBIR` — el único valor observado es el inicial |
| resueltos a CAMPO por varianza en la familia | **0** | — |

**Los 6 resueltos**: `modulo-beneficios` `mb` ×2 anchos (ganador: el reparto de
Divi por tipo de columna) y `kunak-faq-item` `pt`·`pb` ×2 anchos (ganador
`.kunak-faq-item{padding:17px}`, del tema, genérico y sin ordinal).

> ⚠⚠ **Y LOS 40 QUE QUEDAN NO SON «PLANTILLA»: SON `SIN ESCRIBIR`, Y NO SE
> CABLEAN.** Su único valor observado es `0`, el **inicial** de la propiedad, así
> que no hay declaración a la que preguntar (§*el test A supone que hay algo
> escrito*). Y el test A no los rescata solo: la 124.ª midió que su premisa es
> falsa en `B-` por `FN-bp` —el editor escribe POR PUNTO DE RUPTURA y lo compila
> en `@media` con ordinal, así que **su** valor también se mueve con el ancho—,
> con **45 · 32 · 20** casos. `mt` y `pb` quedan **al default**.

> ⚠ **Y la cascada se toma a LOS DOS ANCHOS** (la 125.ª sólo a 1440). El ganador
> de `mb` a 1440 es un **`%` de reparto** por tipo de columna; a 390 es
> `.et_pb_column .et_pb_module{margin-bottom:30px}`. El test A a 390 leería «px
> absolutos ⇒ campo» sobre **plantilla pura**.

### El dominio, y por qué la familia decide y el lote no

**`pieza` es un campo, y es el hallazgo que hizo medible todo esto.** Sin él, el
ordinal del constructor es único por documento y empareja 0 por construcción
(§regla 29). Censo derivado, **con su dominio al lado**:

| dominio | marcadores | en ≥2 docs | singleton |
|---|---|---|---|
| LOTE (4 arquetipos), navegador con caja | 18 | 7 | 11 |
| LOTE, censo OFFLINE del HTML | 20 | 8 | 12 |
| **FAMILIA PRODUCTO** (3 del mismo), navegador con caja | **19** | **17** | **2** |

Los dos censos del lote son **ciertos** y ninguno corrige al otro: la diferencia
simétrica es **2 y 0** —`popup` y `dark`, sin caja—, o sea el criterio de
recuento (§regla 31 hermana). El `18 · 7` es el denominador para **medir
geometría**; el `20 · 8`, para **inventariar el HTML**.

**Y el dominio que decide qué es CAMPO es la FAMILIA**, no el lote: allí las 3
instancias son del MISMO arquetipo, así que un valor distinto sólo puede haberlo
escrito quien editó esa página. En el lote un valor distinto puede ser **otra
plantilla** —§*lo que varía entre FORMAS distingue plantillas, no campos*—, y
ahí es exactamente donde la 125.ª se pasó de largo con 4 pares.

**Régimen, derivado y no supuesto**: los 3 documentos de la familia son **`B-`**
(builder) mirando **los DOS marcadores del `<body>`**. En `-T` o `--` la lectura
se invertiría y esta tabla no valdría.

> ⚠ **`valor767` sigue SIN CONSUMIDOR, y ahora con su denominador**: la cascada
> de los 132 pares devolvió **37 declaraciones ganadoras dentro de un `@media`**
> y **ninguna a 767** — sólo `(min-width: 981px)` ×16, `(max-width: 980px)` ×15 y
> `all` ×6. O sea que esta medición **no le da consumidor**; sigue fichado con su
> cero en `PENDIENTES-QA.md`.

Derivaciones: `cola-larga/derivaciones/paso0-dominio-127.*` ·
`escalon1-varianza-127.*` (+ `-control-lote`, `-neg-sin-etcache`) ·
`hojas-etcache-127.*`.

## §2o.4 · Los defaults, con su contenedor — y `mbPorDefecto()` no se sustituye

Vacío en un `medida()` = **el default responsive de Divi**, que no es una
constante: sección `pt`/`pb` = **4 % DE LA SECCIÓN** · fila = **2 % DE LA FILA**
· módulo `mb` = **2.75 % DE LA FILA**. Escribir `57.5938 · 28.7969 · 34.0469`
los convierte en constantes de una página cuyo contenedor medía 1440.

⚠ **`mbPorDefecto()` NO se sustituye por la fórmula del porcentaje**: ésta
acierta 55 de 114 al bit y falla en **59 módulos de un solo grupo**
(`articulos-kb · 4_4`), donde pondría `25.0625` contra `34.0469` medido. La
tabla acierta **118 de 118**.

## §2o.5 · La migración — y el `down` generado NO REVERTÍA

§regla 30 se cobró **otra vez**, y en la única ventana en que se puede ver:

> El `down` emitía `DROP TABLE "arquetipos" CASCADE` **antes** de
> `ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT ..._arquetipos_fk`.
> El CASCADE ya se lleva esa FK, así que la sentencia explícita aborta la
> transacción entera: **exit 1 y CERO revertido** — 13 tablas y 134 tipos
> quedándose puestos.

Corregido a mano con `IF EXISTS` (idempotente, no cambia lo que la reversa
deja). Verificación **TABLA A TABLA con `diff`**:

| comprobación | resultado |
|---|---|
| simetría | **13 CREATE TABLE / 13 DROP TABLE · 134 CREATE TYPE / 134 DROP TYPE** |
| `up` | 138 a **151** tablas (13 nuevas) + 1 columna en `payload_locked_documents_rels` |
| `down` **antes** del arreglo | **exit 1, 0 revertido** |
| `down` **tras** el arreglo | `diff` **VACÍO** contra el censo previo · 25 migraciones · **0 tipos huérfanos** · `entradas_blog` 152 intactas |

> ⚠ **Y un límite de modelado que se derivó, no se sufrió: el slug de un bloque
> tiene un presupuesto de 18 caracteres.** Postgres corta identificadores a 63 y
> el nombre más largo que Payload genera es
> `enum_arquetipos_blocks_<slug>_ritmo_mb_movil_unidad` (23 + 22 fijos).
> `slider-completo-arq` son 19 y el `migrate:create` **falla en voz alta** — que
> es lo bueno: no hay truncado silencioso que colisione dos enums. De ahí
> `slider-ancho-arq`. La posición nueva de la 126.ª (`unidad767`) es **más
> corta** que `movil_unidad`, así que no estrecha el presupuesto.

## §2o.6 · El render — `default` que TIRA, ya verificado

§regla 6 en el render: **los dos renderizadores existentes ya tienen `default`
que lanza** —`CuerpoPagina.tsx` L493 y `CuerpoKb.tsx` L268, los dos con el
`kind` recibido en el mensaje—. Se **verificó** en esta tanda en vez de darse
por hecho: en React `undefined` es un valor de retorno legal que renderiza
NADA, y así se sirvieron 6 páginas con 0 módulos y todo lo verde siguió verde.

⚠ **Y una ruta que responde 200 no prueba que sirva contenido.** Ninguna guarda
de este repo mira dentro —cuentan rutas, slugs, familias y bytes—: lo que
distingue las dos afirmaciones es el comparador de dos lados, no el manifiesto.

## §2o.7 · Lo que esta colección NO hace todavía, con su cardinal

- **0 lectores en el render**: las 4 rutas siguen sirviéndose de `src/lib/`.
  §F3-5 «hecho» es *el content type escrito con sus SIN PROBAR declarados y no
  cableados* — eso es lo que hay. El sitio servido desde Payload es la segunda
  mitad, y otra tanda;
- **0 filas sembradas**: ~~el extractor del lote no existe~~. Camino de render
  **SIN ESTRENAR**, declarado en vez de supuesto;
- **el eje `módulos` sigue SIN COMPARAR** (`·`, no «a 0»). El criterio ya no lo
  bloquea (§2n); el coste sí: **35 componentes de 97**.

---

## ✅ §2o.8 · `CMS-F35-SIEMBRA` — el extractor EXISTE, y lo que bloquea la siembra es el CENSO DEL CAMPO RICO (131.ª, 2026-08-31)

**`cms:extractor-f35` produce las 4 filas** con sus **231 módulos de primer
nivel**, reproduciendo el `porDoc` de la 126.ª al bit (90 · 35 · 70 · 36).
Negativo **5/5 + control**, con los cinco casos cayendo **por su motivo**.
Congelada: `medidas/f35-extraido.json`.

### El `ritmo` se OMITE en los 231, y está DERIVADO

`arquetipos` declara `ritmo.mb` y `ritmo.pt` como CAMPO, pero los valores
medidos los publica `escalon1-varianza-127.json` y **su alcance es la familia
PRODUCTO** (monitor · estación · sensor), **no el lote**.

**Y los 8 CAMPO son los 8 del MISMO documento** (§*un veredicto producido sobre
un agregado no se puede atribuir a sus miembros*): el valor no-default está
siempre en `estacion-de-monitoreo-…`, que no es del lote. El único del lote en
esa familia lleva **el default en las 5 piezas** —`parametros`·mb 0 ·
`clear-both`·mb 0 · `menu-anclas`·mb 31.6719 (= 2.75 % de su fila) ·
`menu-anclas`·pt 0 · `clear`·pt 0—.

> **Ningún documento del lote tiene un valor de ritmo medido como no-default.**
> Los otros 226 módulos ni siquiera entraron en el denominador de la 127.ª: son
> **SIN MEDIR por alcance**, que no es «default confirmado». Se omite; el
> sabotaje `ritmo-cableado` impide relajarlo en silencio.

### ⚠ `T-nombre-media` — la transformación de nombre, con su cardinal

El clon transcribió a mano en julio los nombres de la galería de PRODUCTO
normalizándolos a minúsculas, y `PM2.5` perdió además el punto
(`monitor.ts:227-228`). El corpus pide `PM2.5_belgium.webp`; el repo tiene
`pm25_belgium.webp`. **6 rutas distintas, todas del canal
`galeria-arq.items.imagen`, que es `required`.**

El candidato **se DERIVA** (normalizando y exigiendo que sea **único** en su
directorio) y un candidato ambiguo **TIRA** (§regla 6: la ausencia se rechaza,
no se sustituye).

> ⚠⚠ **Y no basta con `existsSync`: en Windows es CASE-INSENSITIVE y encuentra
> 5 de las 6.** La comprobación es **byte a byte** contra `readdirSync`, que es
> la que corre en el despliegue. Es `CLAUDE.md` §regla 47.

### ⛔ LA PRECONDICIÓN DE LA SIEMBRA: 22 bloqueos del censo del campo rico

`arquetipos` **NO entra en `CATALOGOS` ni en `SEMBRADAS` todavía**, y el motivo
está medido. El denominador se derivó recorriendo **los CUATRO ejes** de
`validaHtmlCorpus` en **una** corrida (§regla 27), no re-corriendo el sembrador:

| eje | bloqueos | denominador |
|---|---|---|
| `script` | **0** | 199 campos HTML |
| `etiqueta` | **11** | 199 |
| `host` | **0** | 199 |
| `atributo` | **11** | 199 |

**22 bloqueos · 30 tokens distintos · 5 clases · 0 SIN CLASIFICAR:**

| clase | n | tokens |
|---|---|---|
| `data-*` del constructor | 10 | `data-auto-rotate` · `data-inertia` · `data-sitekey` · `data-slide-id` … |
| **formulario** | **9** | `form` · `input` · `label` · `button` · `fieldset` · `legend` · `action` · `method` · `for` |
| schema.org | 5 | `meta` · `itemprop` · `itemscope` · `itemtype` · `content` |
| aria de tabla | 4 | `aria-colcount` · `aria-colindex` · `aria-rowcount` · `aria-rowindex` |
| estructura HTML5 | 2 | `article` · `header` |

> **La clase mayor es la que este documento ya declaraba AUSENTE en el dominio
> del censo:** *«código, `dl`, formularios: ausentes en las 209»*. O sea §*una
> regla derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR para
> ese caso*, con el censo de **43 etiquetas / 81 atributos** ejercitado fuera de
> donde se midió.

**Ampliar la whitelist con `<form action method>` y `data-sitekey` (reCAPTCHA)
es una decisión de esquema con su propio análisis de riesgo**, y el censo lo
dice él mismo: *«se admite AÑADIÉNDOLA al censo con su evidencia, no
colándola»*. **Se ficha; no se cuela.**

Reparto por documento: `monitor-calidad-aire` 9 · `software-…` 6 · `kunak-api`
4 · `accesorios` 3. Por bloque: `texto-arq` 15 · `slider-ancho-arq` 3 ·
`codigo-arq` 2 · `tabla-arq` 1 · `slider-arq` 1.
Derivación: `derivaciones/bloqueos-f35-131.{mjs,log}`.

---

## ⏸ §2o.9 · `CMS-6` · **EL CENSO DEL CAMPO RICO ANTE EL LOTE F3-5** — ⛔ **PENDIENTE DEL PROPIETARIO** (132.ª, 2026-09-01)

**La decisión:** qué se hace con las 5 clases de token que `validaHtmlCorpus`
rechaza del lote F3-5. **El expediente DESCRIBE; la elección no es de la tanda.**

Acta con las cinco fichas: `PENDIENTES-QA.md` §132.ª.
Derivaciones: `derivaciones/{paso0,clases,fichas}-132.{mjs,log,json}`.

### El reparto, en la unidad que decide

Denominadores: **22 bloqueos · 199 campos HTML · 4 documentos · 5 `kind`**.

| clase | tokens | bloqueos | campos | docs | `kind` |
|---|---|---|---|---|---|
| schema.org | 5 | **8** | 4 | **4** | `texto-arq` |
| estructura HTML5 | 2 | **6** | 4 | **4** | `texto-arq` |
| `data-*` del constructor | 12 | **5** | 5 | 3 | 3 |
| **formulario** | **20** | **2** | **1** | **1** | `codigo-arq` |
| aria de tabla | 4 | **1** | 1 | 1 | `tabla-arq` |

> **Admitir las cuatro inertes deja 2 bloqueos** —diferencia simétrica
> **DESAPARECEN 20 · APARECEN 0**— y los dos son del **mismo campo**:
> `monitor-calidad-aire · codigo-arq.contenido`. Los otros tres documentos entran
> limpios.

### Y el alcance del censo, medido: no vio NINGUNA de las cinco

**43 de 43 tokens con cero apariciones en el dominio donde la regla se derivó** —
cada eje contra SU censo: las 11 etiquetas contra el inventario de `a-censo`
(post_content servido de 209 páginas), los 32 atributos contra el corpus de
`atributos-censo` (610 regiones · 294 páginas). **Auditado con 8 testigos vivos**,
porque un 100 % redondo es antes sospecha del instrumento que dato.

O sea que el censo **no excluyó estas clases: no las conocía**. Es §*una regla
derivada sobre un dominio donde el caso NO SE DA está SIN PROBAR para ese caso*,
aplicada al bloqueo entero y no sólo a `formulario` como decía §2o.8.

### ⚠ Corrección a §2o.8: eran **43 tokens**, no 30

`extractor-f35` congela `hit.slice(0, 6)` y **tres bloqueos estaban EN el tope**.
Sin recortar son **43**, y **8 de los 13 ocultos son de formulario** (`option` ·
`select` · `name` · `novalidate` · `placeholder` · `required` · `selected` ·
`value`). Las 5 clases y el `0 SIN CLASIFICAR` aguantan; lo que estaba
subestimado en más del doble es **el cardinal de la clase que decide**.

### La superficie de `formulario`, que es la única con ella

| | |
|---|---|
| destino | `https://kunak.activehosted.com/proc.php` — **host de TERCERO** |
| método | **POST** |
| ¿lo alcanza `HOSTS_PERMITIDOS`? | **NO** — esa allowlist mira `<iframe>`, no `<form>` |
| `<input>` | 17 — 5 visibles, **12 ocultos** (`act=sub` · `or=<hash>` · 3 de UTM …) |
| `<select>` | 2, con **280 `<option>`** |
| reCAPTCHA | `data-sitekey` en un `<div class="g-recaptcha">`; clave **pública por diseño** |
| **qué hace sin backend** | **nada**: lo inicializa un `<script>` inline que `A.limpia()` retira. **52 `<script>` en el documento, 0 en el campo** |

### Las opciones, con su REVERSA nombrada (§regla 23)

| | desbloquea | **cómo se deshace** | reapertura |
|---|---|---|---|
| **A** · admitir las 4 inertes | **20 de 22** · 3 docs limpios | deshacer es **RESTRINGIR** = el lado **caro** (mata siembra ya hecha) | no va contra ningún criterio |
| **B** · admitir las 5 | **22 de 22** | igual: **restringir**, el lado caro | ⚠ **CONTRA** el criterio del propio censo (*«las cuatro familias peligrosas salen a CERO»*) — **exige condición de reapertura explícita** |
| **C** · `formulario` como BLOQUE TIPADO | los 2 de formulario, **sin tocar la whitelist** | deshacer es **AMPLIAR** = el lado **barato** | **a favor**: es lo que §3.3·T4 hace con los `<script>` |
| **D** · excluir el campo | los 2 | deshacer es replantear esto entero (NO-OP) | ⚠ contra la **regla 1** (fidelidad): pierde contenido servido |
| **E** · no hacer nada | 0 | trivial | F3-5 queda parada |

**A + C** desbloquea 22 de 22 sin ampliar la whitelist con formulario. **El clon
ya tiene C hecho**: `CtaGuiaProyecto.tsx` sirve ese mismo formulario reconstruido
en TSX, sin ActiveCampaign y sin reCAPTCHA.

**Y hay precedente del procedimiento de alta**, ejercitado una vez:
`HOSTS_PERMITIDOS` lleva **dos tramos** —Tramo A (18 hosts, firma 2026-08-04,
censo 209/209) y **Tramo C (3 hosts, AMPLIACIÓN firmada 2026-08-05, censo
76/76)**—, con su criterio escrito (*«los hosts CENSADOS, cero pérdida medida»*)
y su exclusión razonada (`googletagmanager.com`).

### Lo que el expediente NO contesta

1. si alguna clase es **peligrosa en ejecución** — mide qué entra y de dónde, no
   qué hace el navegador del visitante;
2. si **otros arquetipos ya sembrados** traen estas clases: el barrido es de los
   4 documentos del lote;
3. **cuánta pérdida de contenido servido** tiene cada opción — el Tramo C se
   firmó con *«cero pérdida medida»* y **esa medición no está hecha aquí**;
4. si el `<form>` **sin sus `<script>`** sigue funcionando — necesita render, y
   la 132.ª es OFFLINE.
