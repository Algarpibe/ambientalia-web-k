# scripts/qa — sondas de medición contra el original

Utillaje de la fase 4 del flujo (QA visual). Mide el original con
puppeteer-core sobre el Chrome del sistema, siguiendo las **notas de método** de
`CLAUDE.md`: perfil limpio, Cookiebot bloqueado por `--host-resolver-rules`,
pase de scroll + settle antes de medir y móvil solo por device metrics.

Estas sondas **no forman parte del build**: `npm run check` no las toca y
`puppeteer-core` no está en `package.json` a propósito, para no meter un
navegador en las dependencias de la app.

## Cómo correrlas

```bash
cd scripts/qa
npm i --no-save puppeteer-core     # ~1 MB: usa el Chrome ya instalado
node tree-todos.mjs 1440           # desktop
node tree-todos.mjs 390            # móvil (device metrics 390×844)
```

`lib.mjs` asume el Chrome de Windows en
`C:\Program Files\Google\Chrome\Application\chrome.exe`; cámbialo ahí si tu
instalación está en otro sitio.

Las sondas que comparan contra el clon (`tree-cmp`, `cmp-sector`) necesitan el
clon servido en `localhost:3000`. Ojo con lo que avisa `CLAUDE.md`: con
`next start`, tras editar hay que **parar, `npm run build` y relanzar**, y el
servidor se mata **por puerto**.

⚠ **Las sondas que reciben una ruta se lanzan desde PowerShell, no desde Git
Bash.** MSYS traduce cualquier cosa que empiece por `/` a una ruta de Windows, así
que `MARCADOR_RUTA=/sectores/x` llega como `C:/Program Files/Git/sectores/x` y la
sonda revienta con `Invalid URL`. Afecta a `offsets.mjs`, `dos-rutas.mjs` y a
`clon-base.mjs` con `MARCADOR_RUTA`.

## Las sondas

| sonda | qué compara | cuándo usarla |
|---|---|---|
| `enlaces.mjs` | el HTML **servido** contra las rutas que emite el build, **en las dos direcciones** | **después de clonar cualquier página**: cierra la regla de rutas locales y caza los 404 internos |
| `ruido.mjs [corridas]` | el original **consigo mismo**, N veces | **primero de todo**: fijar el suelo de ruido antes de juzgar un Δ |
| `tree-todos.mjs [ancho]` | el original, los 8 sectores entre sí | diseñar el content type contra la distribución real |
| `tree-cmp.mjs <sector> [ancho]` | original vs clon, **árbol sección→fila** del cuerpo | distinguir "la fila está mal colocada" de "el contenido mide otra cosa" |
| `cmp-sector.mjs <sector> [ancho]` | original vs clon, **anclas de texto** | ver de un vistazo dónde empieza a acumularse el desfase |
| `mono-modulos.mjs [ancho]` | el original: árbol **sección→fila→columna→MÓDULO** | cuando la fila no basta: clases Divi, esqueleto de etiquetas y reparto de columnas |
| `mono-cabecera.mjs [ancho]` | el original **contra sí mismo**: 2 monográficos vs 2 sectores | decidir si dos páginas comparten componente, midiendo en vez de suponer |
| `mono-detalle.mjs [ancho]` | kicker, módulos del hero, piel de `calls`, `h4`, mapa de punteados | los cabos sueltos que el árbol no ve |
| `mono-inline.mjs [ancho]` | los atributos `style` **que escribió el editor** + desbordamiento de la tabla | separar estilo de tema, de módulo y de editor |
| `clon-base.mjs [ancho] [etiq] [--cmp f.json]` | **el clon contra sí mismo**, todas sus rutas | antes/después de tocar un componente compartido |
| `mono-cmp.mjs <edar\|petroleo> [ancho]` | original vs clon **módulo a módulo**, alto y margen aparte | cuando la fila no basta para saber *dónde* falta |
| `dos-rutas.mjs <rutaA> <rutaB> [ancho]` | **dos rutas del MISMO build**, árbol + `docH` + anclas | preguntar si dos modelos de contenido producen la misma página |
| **`offsets.mjs <ruta> [ancho] [--cmp otra]`** | **el offset de cada nodo dentro de su padre**, y la holgura de cada columna | **siempre que un alto cuadre y no te lo creas** — ver abajo |
| `corte-cuerpo.mjs` | que la rebanada del cuerpo del clon **acabe en el slider**, 6 rutas × 2 anchos | guarda de E1; después de tocar `TrustBar`, `CtaBannerSlider` o el hero |

### Las cuatro `mono-*`: para qué se escribieron

Recon del arquetipo MONOGRÁFICO TÉCNICO (`docs/research/monografico-tecnico/`).
`tree-todos.mjs` **se para en la fila** y adivina el tipo de bloque por una
huella; en esas dos páginas eso etiqueta `claimConFoto` 13 filas que no lo son.
Para decidir un content type hay que bajar al módulo.

De ellas sale el hallazgo que gobierna aquel modelo: **en Divi, lo que el editor
no toca es responsive (un % del padre) y lo que toca queda en px absolutos,
iguales a 1440 y a 390.** Se mide a dos anchos y se mira si el número se mueve.

⚠ **Vale para el RITMO y no para todo**, y confundir su alcance da la respuesta
invertida — el ancho de módulo se escribe en % igual que su default, así que se
mueve con el ancho lo escriba quien lo escriba, y es campo. La versión buena, con
los dos tests y sus falsos negativos, está en `CLAUDE.md` §«Cómo se decide si
algo es plantilla o campo». Aquí se deja el enunciado porque es lo que estas
cuatro sondas miden, no como regla general.

`<sector>` es `urbano` o `industria`; para dar de alta otro, añádelo a la tabla
de URLs de cada sonda.

### `clon-base.mjs` — el clon contra sí mismo, con umbral CERO

Las demás sondas comparan contra el original y arrastran su ruido. Ésta compara
**dos builds del mismo clon**, que es determinista: aquí no hay tolerancia que
discutir, un Δ de 0.01 es un Δ.

Dos cosas la hacen fiable, y las dos se pagaron antes:

- **Las rutas salen del `prerender-manifest.json`**, como en `enlaces.mjs`. Con
  una lista a mano habría medido 9 páginas antes y 9 después del monográfico y
  habría dado "sin regresión" sin mirar las dos nuevas; así las marca como
  NUEVAS.
- **Exige un marcador del build servido antes de medir.** `MARCADOR="texto que
  solo existe en el build nuevo"` (y `MARCADOR_RUTA` si no está en la home). Si
  no lo encuentra **sale con 2 y no mide**: la corrida que más importa es
  justamente la que dice "no se movió nada", y es la que un `next start` viejo
  falsifica sin dejar rastro.

Verificada **en negativo** (2026-07-29): con 1px de más en el `padding-bottom`
del hero cazó las 4 páginas que comparten el componente, nombró la sección, dio
el cambio de ritmo y salió con código 1.

### `offsets.mjs` — medir al nivel donde vive la propiedad

**Instrumental estándar, no sonda de un experimento.** Es la contrapartida de
todos los árboles de alturas de este directorio, y responde a lo que ninguno de
ellos puede: **un contenedor más alto que su contenido absorbe lo que le pase
dentro.** El alto sale idéntico y el defecto sigue ahí.

Dos casos medidos, los dos del 2026-07-30:

| el defecto | lo tapaba | se vio midiendo |
|---|---|---|
| claim centrado vs pegado arriba (**121.03 → 0**) | la fila: centrado o arriba, **mide lo mismo** | el offset del claim **dentro de su fila** |
| `<p>` → `<h2>`, +10 de `padding-bottom` | la columna hermana: 390.08 de alto contra 148 | el alto **del módulo**, no de la fila |

El segundo es el que enseña el tamaño del problema: **a 1440 daba Δ0 y a 390
+10**, con el mismo código. No cuadraba a 1440; cuadraba porque cabía.

Qué reporta, y por qué cada cosa:

- **`off`** — offset de cada nodo respecto al **borde de contenido** de su padre
  (con el `padding-top` descontado). Un 0 que no es 0 es la firma del centrado
  vertical y de los márgenes de columna.
- **`absorbe`** — alto de la columna menos su `padding` menos el alto real de su
  contenido: **cuánto puede fallar ahí dentro sin que la fila se mueva.** En
  Petróleo a 1440 hay **11 columnas con holgura, de 16 a 421.11**. Ése es el
  margen de error del árbol de filas en esa página, medido.
- **`align-items` y el eje** de la fila — quién decide lo anterior. Sin la causa,
  "estira" es un síntoma.
- **por módulo**: `tag` (del envoltorio **y** del elemento de dentro, `P>SPAN`),
  `letter-spacing`, `padding-bottom`, `margin-bottom`, `font-size/line-height`.
  Las cinco cambian de valor **sin cambiar el alto de la fila**.

Y cuando **no** hay holgura lo dice también (`✅ ninguna columna con holgura:
aquí el alto de la fila sí es concluyente`), que es la mitad útil: autoriza a
creerse el árbol de filas.

Con `--cmp <otraRuta>` compara dos rutas del clon al nivel del módulo, con umbral
cero. Es lo que se usó para el experimento Urbano.

⚠ **Detecta dónde está el nivel de columna y lo dice** (`columnas:flex` o
`columnas:directo`): `MonoCuerpo` monta `fila > flex > columnas` y `SectorBody`
no —cada bloque aporta su envoltorio—. Asumir uno daba por columna el interior de
un `CtaDescarga`, con un informe plausible y falso.

Nació como `exp-detalle.mjs` en el experimento Urbano y se generalizó el
2026-07-30: el hallazgo no era del experimento, era del método. La salida de
aquella corrida sigue en `medidas/exp-detalle-{1440,390}.json` como evidencia del
acta.

### `corte-cuerpo.mjs` — la guarda del corte (E1)

`tree-cmp` y `mono-cmp` aíslan «el cuerpo» del clon rebanando sus
`main > section` entre el hero y el slider. **Ese corte estuvo roto una tanda
entera** y las dos sondas metían la sección del slider dentro del cuerpo: el
cierre era «la última sección con `.swiper`», y `CtaBannerSlider` **no lleva
Swiper** —es un fundido escrito a mano con `aria-roledescription="carrusel"`—,
así que el único `.swiper` de la página lo ponía `TrustBar`, **antes** del hero.
Medido: `iSwiper` 1 · `iHero` 2 en las 6 rutas y los 2 anchos, así que
`iSlider > iHero` salía falso y la rebanada se iba al final de `main`.

Arreglado en las dos sondas. Y esta guarda existe por el corolario 1 de
`CLAUDE.md`: **no se da por cerrada una clase de fallo hasta que una sonda
recorre la salida y sale limpia.** Comprueba, en las 6 rutas × 2 anchos, que el
corte cae **en el slider** —verificado por su rol ARIA, no por la clase que se
buscaba— y que no queda ninguna sección de slider dentro del cuerpo. Determinista
(no toca el original), código 0 limpia y 1 sucia.

Lo que hizo falta para creerse el arreglo, y no solo el arreglo:

- **la prueba de que no falseó nada**: las dos rebanadas, vieja y nueva,
  calculadas **en la misma carga de página**, para las 6 rutas × 2 anchos. La
  nueva salió prefijo exacto de la vieja y lo único que sobraba era la sección
  del slider, 12 de 12. Diffear dos corridas end-to-end no habría servido: el
  lado del original es un sitio vivo;
- **el test en negativo**: con el ancla cambiada por una que no existe, la sonda
  dice `CORTE ROTO en el CLON` y sale con **1**. Antes rebanaba hasta el final
  **en silencio**, que es exactamente cómo el fallo sobrevivió.

### `mono-cmp.mjs` — módulo a módulo, separando contenido de ritmo

Con ~60 módulos por página, saber *cuánto* falta en una fila no dice *dónde*.
Ésta baja al módulo y reporta el **alto** (contenido) y el **margen** (ritmo) por
separado, porque son dos defectos con dos arreglos distintos.

⚠️ **Cuenta también secciones, filas y columnas, y hace falta.** Su primera
versión solo contaba módulos y sacó un "✅ 0 módulos distintos" con la sección 0
de EDAR a **−48**: el desfase estaba en el `margin-bottom` de la `<table>`, que
no pertenece a ningún módulo. Una sonda que no mira un nivel del árbol da el
mismo "limpio" que una que no encuentra nada.

⚠️ **Y cuenta los nodos SIN PAREJA — que es la misma lección una vuelta más
arriba.** Con el corte de E1 roto, el clon aportaba una sección de más, la sonda
escribía `SEC 3 SOBRA en clon`… y a continuación `✅ 0 · 0 · 0` **con código 0**,
porque ningún `continue` incrementaba nada. Imprimir un descuadre sin contarlo da
el mismo informe que no verlo. Arreglado en los cuatro niveles
(sección/fila/columna/módulo) el 2026-07-30.

`columnas con el ALTO distinto` va **aparte y no cierra el código de salida**, con
su razón dicha en la propia salida: las instancias medidas son columnas que en el
clon estiran por ser hijas de un flex, y eso es inerte (los módulos de dentro
cuadran y la fila también). Es E3 en `docs/PENDIENTES-QA.md`. Contarlo aparte y
decirlo es lo contrario de lo que hacía antes, que era imprimirlo y callarse.

### `enlaces.mjs` — la guarda de la regla de rutas locales

Único caso que **no necesita el original**: solo el clon servido y el build.
Sale con código 0 si está limpia y 1 si no, así que sirve de check.

La regla, exacta: un href al dominio original cuyo path, quitado el prefijo
`/es` y la barra final, **coincida con una ruta publicada** es un fallo. Si no
coincide, es correcto y **debe pasar** — los sectores sin clonar tienen que
seguir apuntando fuera. Las rutas salen de `.next/prerender-manifest.json`: sin
lista manual, se automantiene.

Mira **solo anclas**: `<link rel="canonical">` y `og:url` deben apuntar al
original a propósito. Y solo la rama `/es`: la raíz y `/fr/` son otras páginas.

**Cubre las dos direcciones.** La segunda: un href **interno** que no
corresponda a ruta emitida es un 404, y eso **ninguna medida de altura lo ve** —
la página que enlaza sigue midiendo lo mismo. Qué se descarta de antemano, para
que el informe no se llene de ruido: anclas puras (`#x`), esquemas (`mailto:`,
`tel:`…), y las rutas con extensión, que son ficheros de `public/` y se cuentan
aparte. La query y el hash se recortan antes de comparar. La **barra final** se
recorta también, pero va a **AVISOS y no a fallos**: con `trailingSlash`
desactivado, `/x/` redirige a `/x` — infringe la regla del proyecto, no rompe.

Verificada **en negativo** (2026-07-29): con un href interno inventado, la
guarda lo caza, da su `fichero:línea` y sale con código 1. Sin esa prueba,
"limpio" solo significaba que la sonda no hacía nada.

⚠️ **Solo ve lo que llega al HTML servido.** Un enlace que se pinte únicamente
en cliente es invisible para ella. Y ojo con medir contra un servidor viejo: la
primera pasada del test en negativo salió "limpia" porque `next start` seguía
sirviendo el build anterior. Se mata **por puerto**, no con `pkill`.

### Dos trampas ya pagadas

- **La función de `page.evaluate()` se serializa al navegador**, así que un
  `const` del módulo NO viaja: el flag va por argumento o salta un
  `ReferenceError` dentro de la página.
- **Las anclas de texto por cabeza engañan.** El ancla del claim de Industria
  ("Identifica qué operaciones o procesos…") enganchaba un párrafo del hero que
  empieza con las mismas 8 palabras, y daba Δ0 falsos. Va por la cola
  ("partículas en industrias").

## `tree-todos.mjs`

Recorre los **8 sectores vivos** del original y vuelca, del cuerpo de cada uno
(lo que hay entre la sección del hero y el slider de ancho completo), el árbol
de `.et_pb_section` → `.et_pb_row` con `margin-top`, `padding-top`,
`padding-bottom` y altura de cada nodo, más una huella heurística del tipo de
bloque (`ctaDescarga`, `beneficiosAplicaciones`, `listaSimple2Col`,
`claimConFoto`, `mapaProyectos`).

Escribe `tree-todos-<ancho>.json` en el directorio de trabajo y saca el mismo
árbol por consola.

### Qué respalda

**Es la medida de la que sale el campo `flujo` de `SectorBlock`** — la tabla de
ritmos documentada en `src/lib/sectores.ts` (`SectorBlockFlujo`). Se corrió
sobre los 8 sectores, no sobre 2, y de ahí salió que en Divi el cuerpo de un
sector no es una pila de secciones sino **secciones con filas dentro**, con solo
dos formas de sección y dos de fila:

| valor | sección | fila |
|---|---|---|
| `seccion` | `mt −14` · `pt 57.5938 / 50` · `pb 14` | `pt 2% / 30` |
| `seccionRasa` | `mt 0` · `pt 0` · `pb 0` | `pt 2% / 30` |
| `fila` | (continúa la abierta) | `pt 2% / 30` |
| `filaPegada` | (continúa la abierta) | `pt 0` |

Diseñar el content type contra 2 instancias en vez de contra los 8 fue el error
de la tanda anterior: Urbano y Construcción comparten forma, y las otras cuatro
de plantilla clásica no.

## PROTOCOLO DE MEDICIÓN

**Antes de llamar defecto a nada, lee esto.** Medido el **2026-07-29** con
`ruido.mjs`: 3 corridas × 7 páginas × 2 anchos = 42 cargas del original.

### 0 · Antes de creerte un "limpio", prueba que la sonda sabe fallar

**Una sonda que no encuentra nada y una que no mira nada dan la misma salida.**
Rompe algo a propósito, comprueba que lo caza y que sale con código ≠ 0, y
revierte. Cuesta tres minutos y es lo único que convierte un "limpio" en un dato.

Y **asegúrate de que la salida servida es la que crees**: el test en negativo de
`enlaces.mjs` dio "limpio" en falso a la primera porque `next start` seguía con
el build anterior — el enlace roto estaba en `.next` y no en el HTML. **Mata por
puerto**, no con `pkill`, y verifica un marcador del cambio antes de medir.
(Pendiente de automatizar: ver la tarea mecánica en `docs/HANDOFF.md`.)

### 1 · Tres corridas, no una

El original no es un objetivo de medición estable. Una corrida sola no permite
distinguir un defecto del clon de una carga distinta del original. **Tres es el
mínimo**: con tres se ve si un valor se repite o baila. `node ruido.mjs 3`.

### 2 · La base de lectura es el `h1`

Se compara el `h1` del clon con el del original **antes que nada**. Si difieren,
ese desplazamiento es la base y **hay que restarlo de todo lo demás** — si no,
se leen +30 en veinte anclas y parecen veinte defectos cuando son uno solo, o
ninguno.

Es el `h1` y no otra cosa porque en las 42 cargas su dispersión fue **0 en las
14 combinaciones de página y ancho**, sin una sola excepción. Es el elemento más
estable que hay medido, y va lo bastante arriba como para capturar cualquier
deriva de la cabecera.

### 3 · El suelo de ruido NO es un número, son dos regiones

Éste es el hallazgo que hace útil la corrida. La dispersión no está repartida:

| región | dispersión medida en 3 corridas |
|---|---|
| **el módulo "Artículos y Guías" y todo lo que va debajo** | hasta **81** |
| **todo lo demás** | **0** |

En cada página varía **exactamente una fila**, y siempre la misma: la de
"Artículos y Guías". Los saltos son 27, 54 u 81 — uno, dos o tres renglones de
27px. La causa está identificada y es de diseño: el original **sortea los 3
posts en cada carga** (P4 en `docs/PENDIENTES-QA.md`), así que los titulares
envuelven distinto. Fuera de ese módulo, tres corridas dieron el mismo valor al
céntimo.

Por tanto:

- **Un Δ por debajo de la dispersión de SU región no es un defecto.** En el
  bloque de artículos y en el pie, eso significa hasta 81. En el cuerpo de la
  página significa **cero**: ahí un Δ de 8.6 es tan real como uno de 100.
- Aplicar un suelo global de 81 sería el error contrario al que se quería
  evitar: descartaría defectos reales del cuerpo por ruido que solo existe en
  otro sitio.

### 4 · Reproducirse entre anchos pesa más que el tamaño

Un residuo que sale **igual a 1440 y a 390** no puede ser ruido: son dos
maquetaciones distintas del mismo componente. Es un discriminador más fuerte que
la magnitud. Por eso sobreviven residuos pequeños como el −8.6 de la caja del
CTA (−8.6 a 1440 y −8.5 a 390) y el +13 de la cabecera del mapa (+13 en los
dos).

### 5 · Anomalía conocida, sin origen determinado

Una corrida del 2026-07-29 leyó **todas** las anclas del original de Industria a
390 con +30 (h1 a 219.4 en vez de 189.4). **No se ha reproducido en 6 intentos
posteriores** — 3 de `ruido.mjs` y 3 con perfil nuevo cargando esa página la
primera, que era la hipótesis obvia. Sin Cookiebot en el DOM en ninguno.

**Origen no determinado.** Guarda práctica: es justo lo que detecta la regla 2 —
si el `h1` del original no coincide con el de otra corrida del mismo día,
descarta la corrida y repítela.

## `medidas/`

Salidas congeladas de las sondas. **Son la prueba, no un caché.**

| fichero | qué es |
|---|---|
| `tree-todos-1440.json` | 8 sectores a 1440×900, DPR 1 — **2026-07-29** |
| `tree-todos-390.json` | 8 sectores a 390×844, DPR 1 — **2026-07-29** |
| `ruido.json` | dispersión en 3 corridas, 7 páginas × 2 anchos — **2026-07-29** |
| `mono-modulos-{1440,390}.json` | árbol hasta el módulo de EDAR, Petróleo y Urbano — **2026-07-29** |
| `mono-cabecera-{1440,390}.json` | cabecera/hero/slider/tipografía/tabla de 4 páginas — **2026-07-29** |
| `mono-detalle-{1440,390}.json` | kicker, hero módulo a módulo, `calls`, `h4`, punteados — **2026-07-29** |
| `mono-inline-{1440,390}.json` | `style` inline del cuerpo + desbordamiento de la tabla — **2026-07-29** |
| `clon-base-{1440,390}.json` | **el clon**, sus 11 rutas: `docH`, `h1` y árbol de secciones — **2026-07-29** |
| `exp-{antes,despues}-{1440,390}.json` | línea base del clon antes/después del andamio del experimento Urbano — **2026-07-30** |
| `exp-urbano-{1440,390}.json` | el experimento: Urbano vs su reexpresión con el modelo del monográfico — **2026-07-30** |
| `exp-detalle-{1440,390}.json` | la composición de aquel experimento; la sonda que la produjo es hoy `offsets.mjs` — **2026-07-30** |
| `tree-cmp-<sector>-<ancho>.json` | árbol sección→fila original vs clon. **La sonda no congelaba nada** hasta el 2026-07-30 |
| `mono-cmp-{edar,petroleo}-{1440,390}.json` | módulo a módulo original vs clon, las 4 combinaciones que cita el acta — **2026-07-30** |
| `offsets-<ruta>-<ancho>.json` | offsets y holgura por columna y módulo — **2026-07-30** |
| `corte-cuerpo.json` | la guarda de E1: 6 rutas × 2 anchos, corte en el slider — **2026-07-30** |

Las `mono-*` de 1440 se tomaron en **dos corridas con dispersión 0** (`docH`
11136 / 11303, `h1` en y 261.16 en las cuatro páginas): la regla 2 del protocolo
se cumple y las medidas valen.

Los dos árboles **coinciden en estructura**: los 8 sectores dan el mismo reparto
de secciones y filas a 1440 y a 390, con `filaPegada` a `pt 0` en ambos. Los 4
valores de `flujo` son la misma regla en los dos anchos, no una de desktop con
excepciones.

**El histórico vive en git, no en el árbol.** Estos ficheros son siempre la
referencia vigente y no pueden llevar un defecto conocido dentro: la próxima
sesión los consultará sin preguntar. Las versiones anteriores son recuperables
por commit —la primera del 1440, con el recorte de cabecera defectuoso, está en
`26c74dd`— y ahí se quedan. Si regeneras, sustituye; no acumules variantes con
sufijo.
