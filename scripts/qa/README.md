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
`next start`, tras editar hay que **parar, `npm run build` y relanzar**.

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

### Las cuatro `mono-*`: para qué se escribieron

Recon del arquetipo MONOGRÁFICO TÉCNICO (`docs/research/monografico-tecnico/`).
`tree-todos.mjs` **se para en la fila** y adivina el tipo de bloque por una
huella; en esas dos páginas eso etiqueta `claimConFoto` 13 filas que no lo son.
Para decidir un content type hay que bajar al módulo.

De ellas sale el hallazgo que gobierna aquel modelo, y que sirve para todo el
proyecto: **en Divi, lo que el editor no toca es responsive (un % del padre) y
lo que toca queda en px absolutos, iguales a 1440 y a 390.** Es un
discriminador objetivo entre plantilla y contenido: se mide a dos anchos y se
mira si el número se mueve.

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

### `mono-cmp.mjs` — módulo a módulo, separando contenido de ritmo

Con ~60 módulos por página, saber *cuánto* falta en una fila no dice *dónde*.
Ésta baja al módulo y reporta el **alto** (contenido) y el **margen** (ritmo) por
separado, porque son dos defectos con dos arreglos distintos.

⚠️ **Cuenta también secciones, filas y columnas, y hace falta.** Su primera
versión solo contaba módulos y sacó un "✅ 0 módulos distintos" con la sección 0
de EDAR a **−48**: el desfase estaba en el `margin-bottom` de la `<table>`, que
no pertenece a ningún módulo. Una sonda que no mira un nivel del árbol da el
mismo "limpio" que una que no encuentra nada.

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
