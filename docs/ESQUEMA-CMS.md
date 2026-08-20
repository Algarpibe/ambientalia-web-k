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
| `categorias` | `category` | **SIN CENSAR** (LH-SP8: viva y fuera de sitemap) | se censa antes de modelar |

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
de páginas compuestas (6 hubs LH-2 + 7 hubs KB) **ya se sabe que `MonoSeccion[]`
solo no la cubre** — usan `video`/`toggle`. LH-2 D1 la dejó apuntando a la
hipótesis del grupo D; la hipótesis cayó, así que la cola larga necesitará su
propia decisión de modelo cuando toque.

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

## 7 · Decisiones abiertas, en un sitio

| # | decisión | bloquea |
|---|---|---|
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
