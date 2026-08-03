# scripts/qa — sondas de medición contra el original

Utillaje de la fase 4 del flujo (QA visual). Mide el original con
puppeteer-core sobre el Chrome del sistema, siguiendo las **notas de método** de
`CLAUDE.md`: perfil limpio, Cookiebot bloqueado por `--host-resolver-rules`,
pase de scroll + settle antes de medir y móvil solo por device metrics.

Estas sondas **no forman parte del build**: `npm run check` no las toca y
`puppeteer-core` no está en `package.json` a propósito, para no meter un
navegador en las dependencias de la app.

## Cómo correrlas

**La forma canónica son los `npm run qa:*`, desde la raíz del repo.** No hace
falta `cd`: cada sonda resuelve sus rutas contra su propio directorio, no contra
el `cwd`.

```bash
npm i --no-save puppeteer-core          # ~1 MB: usa el Chrome ya instalado

npm run qa:enlaces                      # guarda de rutas locales, las dos direcciones
npm run qa:slugs                        # guarda de unicidad de slug ENTRE familias del plano
SABOTAJE=accesorios npm run qa:slugs    #   ↑ su test en negativo: DEBE salir con ≠ 0
npm run qa:corte                        # guarda del corte del cuerpo, 6 rutas × 2 anchos
npm run qa:offsets -- /sectores/calidad-del-aire-en-las-ciudades 1440
npm run qa:tree -- urbano 1440          # original vs clon, árbol sección→fila
npm run qa:cmp-sector -- industria 390  # original vs clon, anclas de texto
npm run qa:mono -- edar 1440            # original vs clon, módulo a módulo
npm run qa:dos-rutas -- /sectores/a /sectores/b 1440
npm run qa:clon-base -- 1440 --cmp medidas/clon-base-1440.json
npm run qa:ruido -- 3                   # suelo de ruido, antes de juzgar nada
npm run qa:arbol-todos -- 1440          # los 8 sectores del original entre sí

npm run qa:lib                          # test en negativo de lib.mjs — sin navegador
npm run qa:bases                        # ¿tiene cada ruta base de lectura VÁLIDA?
```

**El `--` es obligatorio** para que npm pase los argumentos al script en vez de
comérselos.

Por qué envueltas en `npm run` y no `node scripts/qa/x.mjs` a pelo: da un
**prefijo estable** (`npm run qa:…`) que se autoriza una vez en
`.claude/settings.json` y vale para cualquier combinación de argumentos. A pelo,
cada invocación nueva era un comando distinto y pedía permiso otra vez — 360
reglas de un solo uso acumuladas antes de arreglarlo.

`lib.mjs` asume el Chrome de Windows en
`C:\Program Files\Google\Chrome\Application\chrome.exe`; cámbialo ahí si tu
instalación está en otro sitio.

Las sondas que comparan contra el clon necesitan el clon servido en
`localhost:3000`. Ojo con lo que avisa `CLAUDE.md`: con `next start`, tras editar
hay que **parar, `npm run build` y relanzar**, y el servidor se mata **por
puerto**.

### Dos cosas que el `cwd` y Git Bash rompían, ya arregladas en `lib.mjs`

- **`w()` resuelve contra `scripts/qa/`, no contra el `cwd`.** Antes escribía
  donde estuvieras: lanzada desde la raíz habría creado un `medidas/` paralelo y
  las salidas congeladas se habrían partido en dos árboles **sin dar ningún
  error**. Un fallo de esa forma no falla: da dos verdades.
- **La traducción de MSYS se deshace en la LECTURA, no en el punto de uso.** Git
  Bash convierte cualquier valor que empiece por `/` en una ruta de Windows, así
  que `/sectores/x` llegaba como `C:/Program Files/Git/sectores/x` y la sonda
  moría con `Invalid URL`. Las tres formas valen y dan lo mismo: `/sectores/x`,
  `sectores/x` y el `C:/Program Files/Git/sectores/x` que MSYS fabrica.

  > ⚠ **Y muerde igual en variables de entorno.** Eso costó dos sesiones **por
  > la misma puerta**: se arregló `MARCADOR_RUTA` en `clon-base.mjs` —donde este
  > README ya afirmaba que `ruta()` lo cubría y **la llamada no estaba**, el
  > corolario *DOCUMENTADO NO ES CONECTADO*— y la misma clase reapareció en
  > `SOLO` de `c-cabecera.mjs`, con `SOLO=/` llegando como
  > `C:/Program Files/Git/`, casando con **cero** rutas y dando un veredicto
  > verde de una corrida que no midió nada.

  Por eso ya no hay nada de lo que acordarse: **se lee con `env()`,
  `envRuta()` o `envRutas()`**, nunca con `process.env.X` a pelo.

  | lectura | para qué | ejemplo |
  |---|---|---|
  | `envRuta(n, def)` | una ruta de **página** | `MARCADOR_RUTA` |
  | `envRutas(n)` | **lista** de rutas de página, coma; `null` si no está | `SOLO` |
  | `env(n, def)` | valor cualquiera, incl. ruta de **fichero** | `SALIDA` |

  `SALIDA` va por `env()` **a propósito**: es una ruta de fichero, y `ruta()` le
  forzaría una barra inicial convirtiéndola en absoluta.

  Lo prueba **`npm run qa:lib`**, 14 aserciones sin navegador. Es el test en
  negativo de una función pura: barato de correr, y lo que impide que la tercera
  puerta vuelva a abrirse.

## Las sondas

| sonda | qué compara | cuándo usarla |
|---|---|---|
| `lib.test.mjs` | las funciones **puras** de `lib.mjs` contra lo que ya sabes | **tras tocar `lib.mjs`**: no necesita navegador ni servidor, así que no hay excusa |
| `c-bases.mjs` | del congelado de `c-cabecera`: **¿tiene cada ruta un `h1` con caja real en los dos lados?** | **antes de leer un Δ de cuerpo de un arquetipo nuevo**: sin base válida, el Δ no significa nada |
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

> ⚠ **Y un tercer fallo suyo, cazado el 2026-08-02 al usarla como guarda:** con
> el 3000 vacío imprimía **31 `ERR_CONNECTION_REFUSED`** —uno por ruta— y salía
> con **código 0**. O sea que **la guarda de regresión del clon daba verde
> midiendo exactamente nada.** El aviso estaba impreso desde el principio; lo que
> faltaba era que **contase**: regla 1 de §sondas —*impreso y no contado*— y
> *verde por vaciado*, las dos en la sonda que más se corre.
>
> Ahora las rutas no medidas cierran el código de salida, y «páginas comparadas»
> cuenta **las que se compararon**, no las que se intentaron. Lo que **no**
> arregla: sigue esperando un `next start` ajeno en el 3000 en vez de
> `iniciarClon()` — es una de las 18 pendientes de migrar, y hasta que se migre
> este modo de fallo se detecta, no se evita.

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

### `slugs.mjs` — la guarda de unicidad de slug ENTRE familias del plano

Hermana de `enlaces.mjs` y con su misma forma: **sin navegador**, sin original,
derivada del `prerender-manifest`, código 0/≠0. Cubre la otra mitad del enrutado
—que dos familias no se peleen por la misma URL— y existe porque **el build no
avisa**: el andamio del ENRUTADO declaró `accesorios` a propósito desde un
`[slug]` de raíz y Next **compiló sin error**, emitiendo la ruta por las dos vías
y dejando ganar a la estática.

Cuatro comprobaciones, y ninguna es redundante:

| | qué caza | por qué las otras no lo ven |
|---|---|---|
| **A** colisión | un slug declarado por dos familias | Next **deduplica en silencio**: el manifiesto no recuerda que hubo dos |
| **B** sombra | un slug del catálogo cuya ruta emite **otra cosa** | pregunta `srcRoute`, o sea **quién emite de verdad** |
| **C** huérfana | una ruta de `/[slug]` que ningún catálogo declara | es la dirección contraria: catálogo y servido desincronizados |
| **D** la sonda | conjunto comparado vacío → **error, no «0 colisiones»** | regla 4 de `CLAUDE.md`: no mirar nada y no encontrar nada dan la misma salida |

La familia de **rutas estáticas de un segmento** (`page`/`solutions`) sale del
propio manifiesto, así que el conjunto comparado nunca está vacío por
construcción y **D no es decorativa**: se dispara si esa lectura se rompe.

Los catálogos se leen con `import()` **directo sobre el `.ts`** —Node borra los
tipos y `src/lib/` solo importa tipos—: la guarda mira **el catálogo que usa el
build**, no un espejo que se pueda quedar viejo.

**Alcance declarado:** solo el plano de un segmento de `/es/`. Las familias
prefijadas (casos, FAQ, sectores, documentos científicos) tienen unicidad *por
colección*, que es nativa, y **no entran**. Que no estén no es un hueco: es el
alcance.

Test en negativo, **re-runnable** y escribiendo en `medidas/slugs-SABOTAJE.json`
para no pisar la medida buena:

```bash
SABOTAJE=accesorios npm run qa:slugs                    # → A y B disparan, exit 1
SABOTAJE=slug-que-no-existe npm run qa:slugs            # → control: exit 0
```

El control importa tanto como el sabotaje: una guarda que fallara con cualquier
slug tampoco estaría midiendo nada.

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

#### El OBSERVABLE de mecanismo (2026-08-02, para la ráfaga 3 de C-QA6)

Las ráfagas 1 y 2 dejaron establecido que el `h1` es **bimodal**: dos estados
discretos separados por **32.28 exactos**, con el valor alto idéntico en dos días
distintos. Una condición binaria **no se explica midiendo más veces la misma
magnitud** —eso vuelve a contar cuánto mueve—: se explica registrando, en la
misma carga, algo que cambie con ella. Desde hoy `ruido.mjs` anota por carga
`document.fonts.status`, el `font-family` computado del `h1`, **qué familias
dice `fonts.check()` que están de verdad disponibles**, los **renglones y el
ancho RENDERIZADOS** del titular, y la **cadena `h1`→raíz** con el
desplazamiento de cada nivel dentro de su padre.

Dos avisos que hacen falta para leer el fichero sin engañarse:

- **`getComputedStyle(h1).fontFamily` devuelve la LISTA DECLARADA, no la fuente
  con la que se pintó.** Si la webfont no llegó, ese valor **no cambia**: él solo
  no puede discriminar el fenómeno que se le pide discriminar. Quien discrimina
  son `fonts.status`/`check()` y, sobre todo, el ancho y los renglones
  renderizados.
- **El ±32.28 no está DENTRO del `h1`: está en su `y`.** Lo que crece está por
  encima, y por eso la cadena — el nivel cuyo desplazamiento cambia entre dos
  cargas es el nivel donde nace la diferencia.

El informe distingue **tres** respuestas y no dos: *acompaña* · *no acompaña* ·
**«no se puede evaluar aquí»** (el `h1` no cambió de estado en esta ráfaga).
Confundir las dos últimas es el fallo entero de C-QA6.

Y los **detectores binarios** llevan veredicto propio: `rocketToken` dio `N` en
las **36 cargas** de las ráfagas 1 y 2, y `rocketLoader` también. Eso **no es
«el token no interviene»** — es un detector que **nunca ha discriminado**, la
regla del cero/pleno. Sale impreso como **NO VALIDADO** y **no se cita como
evidencia** hasta que se le vea cambiar. No cierra el código de salida a
propósito: es una observación sobre el original, no un defecto de la sonda.

```bash
# Ráfaga 3 (desde el 2026-08-03, ≥2 h de la última y mejor en un tercer día):
RUTAS=/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas \
  CAMPANA=cqa6 npm run qa:ruido -- 3
```

Negativos: `SABOTAJE=muerto` → ancla inventada ⇒ censo ⇒ exit 2 ·
`SABOTAJE=detector` → un detector que nunca dispara y otro que dispara siempre
⇒ los **dos** salen NO VALIDADOS (el cero y el pleno en la misma corrida) ·
control ⇒ exit 0. Congelados en `medidas/ruido-*neg-*.json`.

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
| `clon-base-{1440,390}-cms0d-{antes,despues}.json` | línea base y verificación del salto de next `16.2.1 → 16.2.12` (CMS-0d): Δ0 en 11 páginas × 2 anchos — **2026-07-30** |

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

### Las `a-*` — el recon del arquetipo A

`docs/research/arquetipo-A/`. Miden el **original**, no el clon.

| sonda | qué hace |
|---|---|
| `a-censo.mjs` | **las 209 páginas del grupo A** por `fetch`: inventario de etiquetas dentro del `post_content` + esqueleto `tb_body`. Sin navegador |
| `a-muestra.mjs` | aplica la **regla de selección pre-registrada** sobre el censo: la más larga, la más corta, una por payload raro, la de más variedad, y relleno aleatorio con semilla fija |
| `a-cascaron.mjs [ancho] [--muestra]` | los módulos del `tb_body` con su ritmo y tipografía. Con `--muestra`, las 24 seleccionadas |
| `a-behaviors.mjs [ancho]` | índice del artículo, `iframe`, relacionados |
| `a-scripts.mjs` | los `<script>` dentro del contenido, clasificados uno a uno (§3.3 del esquema) |
| `a-lexical.mjs` | **piloto de CMS-0e**: convierte el cuerpo a una estructura de nodos y compara **invariantes** entre origen y árbol. `PROBETA=1` corre la probeta sintética; `SABOTAJE=sub\|hid\|leyenda`, el test en negativo |
| `a-ids.mjs` | **A-SP9**: origen de los `id` de encabezado. Mide los **dos ejes a la vez** —ámbito (documento vs `post_content`) × momento (HTML servido vs DOM tras settle)— porque las dos medidas que se contradecían diferían en los dos. `PAGINA=<url>` para otra página |
| `a-embeds.mjs` | **censo de proveedores de `iframe` en las 209** + inventario de `video`/`audio`/`embed`. Mide contra la lista cerrada de §3.3 **tal como está escrita**, que es lo que permite ver que no cubre |

⚠ **`a-lexical` compara contra una representación PROPIA, no contra Lexical de
Payload** (no está instalado). Sirve para inventariar qué del corpus se resiste a
una estructura de nodos; **no prueba que Payload acepte el resultado**. El acta,
con esa separación escrita, en `docs/ESQUEMA-CMS.md` §CMS-0e.

Y su regla de oro, que se pagó con cinco defectos en la propia sonda: **la
probeta sin sabotaje TIENE que salir limpia y cada sabotaje TIENE que caer por su
propio invariante.** Los cinco defectos daban números plausibles, no errores.

Tres cosas que costaron una corrida cada una y están anotadas en el código:

- **El `post_content` se extrae por emparejamiento equilibrado de `<div>`**, no
  por «hasta el próximo `</div>`»: el contenido lleva divs dentro y un corte
  ingenuo se come la mitad del inventario **sin dar ningún error**.
- **El esqueleto `tb_body` NO se saca con un regex sobre el HTML entero.** Divi
  emite en un `<style>` en línea una regla CSS por módulo, con esas mismas
  clases: la primera versión mezclaba reglas con elementos y devolvía **tres
  esqueletos donde había uno**. Se recorta a `#main-content` y se leen solo
  atributos `class`.
- **El atributo `loading` de las imágenes no se mide con el navegador.**
  `settle()` pone `loading="eager"` en todas antes de medir, así que cualquier
  conteo de perezosas sale **0 por construcción**. Se lee del HTML servido.

### Las `c-*` — el recon del grupo C (caso de éxito + FAQ)

`docs/research/grupo-C/`. Miden el **original**. Plan de muestreo pre-registrado
en `PLAN-MUESTREO.md`.

| sonda | qué hace |
|---|---|
| `c-censo.mjs` | **las 76/76** por `fetch`: régimen del `<body>`, cascarón por origen de sección, campos visibles, cuerpo y etiquetas, SEO. El navegador se usa **solo como `DOMParser`** |
| `c-muestra.mjs` | muestra adversaria con **semilla fija** (`20260730`) e informe de **cobertura de payloads raros**, que cierra el código de salida |
| `c-rutas.mjs` | **CMS-1**: resolución del prefijo cruzado sin seguir redirección, `canonical`, `hreflang` y si los 4 ingleses duplican a alguno de los 53 |
| `c-behaviors.mjs [ancho]` | galería, pestañas de soluciones, mapa y acordeón, con `settle` |

Tres cosas que costaron una corrida cada una y están anotadas en el código:

- **El grupo C no está en ninguno de los dos regímenes de `CLAUDE.md`**: sin
  `et_pb_pagebuilder_layout` y sin `et-tb-has-body`. Cabecera y pie por Divi
  Theme Builder, **cuerpo por plantilla PHP del tema**. Se aplica la lectura de
  «plantillado» —varianza entre instancias—, no la del test A.
- **`elemento.click()` no dispara las pestañas de soluciones**; hace falta
  `page.mouse.click()` sobre coordenadas reales. El click que no llega y la
  pestaña rota dan la misma salida.
- **Swiper clona slides y marca originales**: contar `.swiper-slide` da 17 donde
  hay 11, y filtrar por `includes("duplicate")` da 10 porque
  `swiper-slide-duplicate-prev` va sobre un **original**. Clase exacta.

### Las dos `c-*` nuevas de C-3 (2026-07-30)

| sonda | qué hace |
|---|---|
| `c-cascaron.mjs [ancho]` | **P-C3-2**: ritmo, tipografía y retícula del cascarón en 10 instancias (6 casos, 4 FAQ) elegidas adversarias. Juzga la **varianza entre instancias** —el discriminador del régimen plantillado—, nunca el test A. `SABOTAJE=forma`, el test en negativo, **escribe en otro fichero** |
| `c-spec.mjs` | **transcribe** el contenido verbatim de las instancias que puebla C-3, y de paso cierra C-SP6/8/9/10/12. Cobra **P-C3-1** comparando el pie par a par |

Tres cosas que costaron una corrida cada una y están anotadas en el código:

- **`c-cascaron` medía un nodo de DENTRO del contenido rico** (`… > p`) y sacaba
  varianza en tres ejes: era el `style="text-align: justify"` que escribe el
  editor, por debajo de la frontera del contenedor de contenido. **Medir más
  abajo de donde vive la propiedad invalida la medida igual que medir más
  arriba**. El eje bueno es el contenedor.
- **`c-spec` comparaba el pie ENTERO** y refutaba P-C3-1 por una diferencia de
  `footer-legal`, que es otra sección — habría reabierto D5 sin motivo. El
  veredicto tiene que cubrir exactamente la propiedad de la que habla la
  predicción, y la sección se identifica **midiendo** (pie del caso menos pie de
  la FAQ), no por su índice.
- **`.case-detalles-txt > p` se deja el contenido de «Parámetros» fuera.** El
  original escribe `<p><span>Parámetros:</span><br><ul>…</ul></p>`, y `<ul>`
  dentro de `<p>` es inválido: el parser cierra el `<p>` antes, así que la lista
  queda de **hermana**. El campo salía vacío — un dato plausible, no un error.

---

## Las sondas de C1 — el cascarón fuera de sección (D1…D4)

`c1-localiza` abrió el «resto» de `docH` en cuatro piezas que suman al céntimo.
Cada una tiene después su sonda, porque **una descomposición dice cuánto, no
qué**.

| sonda | qué mide |
|---|---|
| `c1-localiza.mjs [ancho]` | la descomposición: antes de la 1.ª sección · Σ huecos · última→pie · alto del pie. **Diagnóstico, no arregla** |
| `d4-pie.mjs [ancho]` | el pie por composición en **11 formas**, un selector por lado y diciendo cuál (`via`). `SOLO=` acota, `SALIDA=` nombra la corrida |
| `d4-tipografia.mjs` | el tercer eje del pie: `li`, `ul` y legal, renglón a renglón, **los dos lados** |
| `d4-cta.mjs` | la 4.ª sección del pie, que solo lleva el CASO |
| `d4-suscribete.mjs [ancho]` | **el bloque «¡Suscríbete!»** de la columna EMPRESA, por composición (título · `ul` · hueco · botón · hueco) y con la FILA y sus cinco columnas. Devuelve `altoContenido` **y** `col.h`, y avisa del sobrante de estirado |
| `d123-flujo.mjs [ancho]` | **enumera los hijos en flujo** del contenedor de cuerpo en 11 formas, más la cadena de antepasados y lo que va después. Es la que distingue partición de defecto |

**Las dos trampas que estas sondas existen para no repetir:**

1. **Un hueco no es aire hasta que miras dentro.** `main > section` no cuenta un
   `<nav>`; `antesDePrimeraSeccion` vale 0 si la primera sección empieza en y=0.
   Así nacieron D1 (−225) y D2 (+50), que **no existen**: son la misma altura
   partida de otra forma. Se ven enumerando **todos** los hijos en flujo, no solo
   los que casan con el selector de sección.
2. **La columna del clon es un ítem de rejilla.** Va `stretch`, así que su caja es
   la de la columna más alta del pie y a 1440 daba Δ +51 y +83 que eran sobrante,
   no defecto. Y en el original el margen del último hijo **se escapa** de la
   columna. Lo que suma en la fila es **la caja**, en los dos lados: se adjudica
   contra `altoContenido`, y `col.h` queda en la salida para poder exhibir la
   diferencia.

**Y una de alcance, que ya se pagó dos veces:** el pie se midió primero con **7
familias de 11** y D3 con **3**. Las dos veces el número que faltaba era de una
forma no medida. Cuando lo que se busca es *«qué tipos de página llevan esto»*,
**la lista de formas es el experimento** — recortarla no ahorra, decide el
resultado.

### `cabecera-cmp.mjs` — la cabecera de `/sectores/*`, los DOS lados

```bash
npm run qa:cabecera -- 1440|1280|1000|800|390     # SOLO=edar acota · SABOTAJE=1 en negativo
```

Ancla en el **`h1`** —semántico, uno por página, el mismo objeto en los dos
lados— y sube **la cadena entera de anchos hasta la sección**. Devuelve la
fracción `h1 / padre` **con sus dos operandos**, nunca solo el cociente.

**Por qué existiendo `mono-cabecera.mjs`:** aquélla compara **original contra
original** (nació para decidir si el monográfico estrenaba arquetipo) y por tanto
**no puede adjudicar nada del clon**. Es una de las sondas de un solo lado que la
auditoría de cobertura cuenta como `c`.

**Las tres cosas que enseñó, y que se pagan si se olvidan:**

1. **Un Δ de alto igual al `line-height` es ENVOLVIMIENTO, y su causa es un
   ANCHO.** −36.02 con `line-height: 36` = un renglón. No se busca en el ritmo.
2. **Tres anchos, no dos.** Con 1440 y 390 «50 % de la fila» y «un ancho fijo en
   px» predicen lo mismo. El tercero (1280 → 550.39) las separa, y dos más
   (800 → 100 %, 1000 → 50 %) localizan el corte sin suponerlo.
3. **`getClientRects().length` NO cuenta renglones** en un elemento de bloque:
   devuelve la caja de borde, 1 siempre. Se cuentan con un `Range` sobre el
   contenido, agrupando por `top`. La 1.ª versión publicaba «Δ renglones 0» junto
   a «Δ alto −36» — las dos de la misma sonda, contradiciéndose.

### La sonda, dueña de su ciclo de servidor — `iniciarClon()` + guarda de `BUILD_ID`

```js
import { iniciarClon } from "./lib.mjs";
const { base: CLON, parar: pararClon } = await iniciarClon();   // puerto propio
...
await pararClon();                                              // y al salir, sola
```

**Dos mitades, porque una no basta:**

1. **`iniciarClon()` aísla lo que se puede.** Puerto libre pedido al sistema,
   espera activa a que responda, y muerte del árbol al terminar el proceso
   —salida normal, `SIGINT` o excepción—. Dos sondas pueden medir a la vez.
   `CLON=<url>` sigue mandando y entonces no gestiona nada.
2. **La guarda de `BUILD_ID` detecta lo que no se puede aislar.** El servidor
   propio lee el mismo `.next`, así que un `build` concurrente le cambia el
   contenido igual. `w()` compara `.next/BUILD_ID` al arrancar y al congelar; si
   cambió, la salida se escribe como **`…-CONTAMINADA.json`** y sale por error.

> **Lo grave de un build a mitad de corrida nunca fue el 404: era que no se sabía
> DÓNDE CAYÓ EL CORTE.** Las rutas medidas antes eran buenas y las de después no,
> y el fichero no las distinguía. Ahora lo dice en el nombre.

La guarda vive en `w()` —por donde escriben las 19— así que **las cubre todas sin
tocar ninguna**. Migradas a servidor propio: **`cabecera-cmp`**. El resto sigue
esperando un `next start` ajeno; es mecánico y está pendiente.

Test en negativo: **`npm run qa:lib`** (31/31) — con `CLON` puesta no gestiona
servidor · contra un puerto vacío **falla** en vez de medir · un clon que no
levanta **tira** diciendo el puerto.

### `ancho-cuerpo.mjs` — el eje horizontal del CUERPO, los dos lados

```bash
npm run qa:ancho -- 1440|390        # SOLO=<txt> · SALIDA=…
                                    # SABOTAJE=muerto|pleno|sinmarcador|anidado
```

Cierra el hueco nº 1 de `COBERTURA-MEDICION.md`. Deriva sus rutas del build,
arranca **su propio clon** (`iniciarClon`) y congela salida.

**Cobertura 2026-08-02: 164 de 181 filas del original, a 1440 y a 390, con el
MISMO recuento en las 31 rutas.** Y se declara en filas, no en rutas: *una ruta
contaba como cubierta con una sola de sus doce filas emparejada.*

**Las cuatro decisiones de diseño, cada una pagada antes:**

1. **`informativo`.** El ancho de un bloque que **llena** su contenedor repite el
   del padre: su Δ0 **no verifica nada**. Cada medida lleva la marca y el resumen
   cuenta aparte las no informativas — sin eso, este eje seguiría pareciendo
   verde.
2. **Identidad por marcador semántico.** En el original, `et_pb_row`/`et_pb_column`
   (clases del tema) sí nombran una cosa. En el clon no había equivalente, así
   que la fila se deducía por **comportamiento** (centrada y más estrecha que su
   sección) y **sobre-casaba**: 16 filas donde el sector tiene 11 — bajaba a las
   diapositivas de un slider y a sus puntos de paginación (12 · 12 · 7 px).
   **Desde 2026-08-02 el clon lo dice: `data-fila`.** El conductual se queda de
   respaldo y la salida declara por cuál entró (`via`), para que una página sin
   marcar no desaparezca en silencio.
3. **Emparejar por CONTENIDO, no por índice** — el nº de secciones ya difiere por
   partición. Y **la firma va SIN ESPACIOS**: el original separa nodos en línea
   con espacios y el clon no, así que colapsar a uno casó **0 de 13 filas** en la
   primera corrida. Es la trampa de `charsCenso()`.
4. **Acotar no puede volverse verde por vaciado.** Esa primera corrida, con 0
   filas comparadas, imprimió **✅ y código 0**. Ahora `comparadas === 0` cierra
   el código de salida: *una sonda que no compara nada y una que compara y no
   encuentra nada dan la misma salida*.

### ⚠ La quinta, que se pagó entera: TRES definiciones de «el mismo texto»

El marcador arregló **un tercio** de las huérfanas. Las otras dos terceras partes
estaban dentro del emparejador, y son la trampa de `charsCenso()` **tres veces
seguidas en la misma función**:

| lo que leía | por qué | arreglo |
|---|---|---|
| «TambiéntepuedeinteresarRelatedcontentقديهمكأيضًا» | el original **sirve todos los idiomas en el DOM** y oculta por CSS todos menos uno | `innerText`, no `textContent` |
| «Descargarcatálogo→» contra «Descargarcatálogo» | la flecha es `::after` en el original y un `<span>` en el clon | se quita de los DOS |
| textos distintos en cada carga | «Artículos y Guías» **se baraja**; la banda de clientes es un **carrusel de 2.5 s** | pasada por prefijo (12 car.) y por **conjunto** de nombres de imagen, las dos con unicidad exigida en los dos lados |

Cada pareja lleva en el fichero **cómo** se emparejó (`texto` · `prefijo` ·
`imagenes`): un Δ sacado de un emparejamiento flojo no vale lo que uno sacado de
la firma entera, y el lector tiene que poder distinguirlos sin preguntar.

**Regla que se lleva a la próxima sonda:** cuando un emparejador por texto falla,
la hipótesis por defecto no es «el clon está partido distinto» — es **«mi
definición de *el mismo texto* no es la misma en los dos lados»**.

Negativos, los cuatro congelados en `medidas/ancho-neg-*.json`:
`SABOTAJE=muerto` → selector muerto ⇒ exit 2 · `pleno` → patrón ubicuo ⇒ exit 2 ·
`sinmarcador` → cae al respaldo conductual **y lo declara** ⇒ exit 0 ·
`anidado` → un `data-fila` dentro de otro ⇒ exit 2 · control ⇒ exit 0.

---

## EL CONTRATO DE `Evaluadas` — el mínimo de unidades, en `lib.mjs`

> **Toda sonda declara —o deriva del build— su mínimo de unidades evaluadas. Por
> debajo, el resultado es NO SE PUDO EVALUAR con código ≠ 0. Nunca verde.**

```js
const ev = new Evaluadas({ unidad: "rutas", minimo: RUTAS.length, porPaginas: true });
```

- `minimo` **obligatorio y ≥ 1**: una sonda que no sabe cuántas unidades debería
  evaluar no puede afirmar que las evaluó. Derivarlo (`RUTAS.length`) es mejor que
  escribirlo — una ruta nueva sube el listón sola.
- `porPaginas: true` → las cuenta `openPage`, por donde pasan todas. No hay un
  `ok()` que se pueda olvidar. Se pone a `false` cuando la unidad es otra cosa
  (un PAR de páginas, una fila, una comparación) y entonces la sonda cuenta.
- **Dos lados = dos páginas por unidad**: en las comparadoras el mínimo va
  `× 2`, porque media pareja no es una comparación.
- El veredicto lo fuerza un gancho de `process.on("exit")`: **no se puede salir
  con 0 por debajo del mínimo ni con un `process.exit(0)` explícito**, y congelar
  una medida sin declarar nada sale con «SIN CONTRATO».
- **Y todo verde lleva su línea de unidades**, la ponga la sonda con
  `ev.informe()` o el gancho al final. Ver abajo: es la mitad que estuvo sin
  conectar.

### ⚠ La mitad LEGIBLE del contrato, conectada el 2026-08-02

El contrato cerraba el código de salida —«0 comparado = verde» resuelto **para la
máquina**— y el HANDOFF que lo estrenó escribió que un verde ya llevaba su línea
de unidades. **Al validar las 48 en vivo: la imprimía UNA.** Las otras 47
declaraban, contaban y cerraban bien el código, y salían con un `✅` mudo — que
es exactamente el hábito de lectura que el contrato venía a romper.

Es *documentado no es conectado* sobre la propia guarda, y la corrección es la de
siempre: **no se pide a 47 sondas que se acuerden de llamar a `informe()`**, la
pone el gancho de salida si falta. Un verde sin línea de unidades ya no existe.

> **Cómo se lee un verde:** `✓ evaluadas 31/31 rutas · enlaces`. El primer número
> es lo que se midió; el segundo, lo que había que medir. **Si no ves esa línea,
> la sonda no es de este contrato** y su verde no dice cuántas unidades miró.

### El SUELO 1 cierra «0 = verde», no la corrida parcial

**Es la letra pequeña al elegir instrumento, y no está en ningún otro sitio.**

| | qué garantiza | qué NO garantiza |
|---|---|---|
| mínimo **derivado** (`RUTAS.length`) | se midió **todo** lo que había | — |
| **suelo 1** | se midió **algo**: no hay verde por vaciado | **que se midiera todo**. Una corrida que muere en la ruta 2 de 12 sale **verde** |

⚠ **Y no es teoría: ya había firmado un verde falso.** `cmp-sector` imprimía sus
13 filas en pantalla y declaraba `evaluadas 1/1` — `ev.ok(filas.length)` sobre un
objeto daba `undefined`, el parámetro por defecto lo volvía 1, y el suelo de 1 lo
dio por bueno. Arreglado (mínimo derivado + `Object.keys`), y `ok()` ya no acepta
un `undefined`.

**El conjunto se DERIVA, no se lee de aquí.** La lista anterior estaba escrita a
mano y decía «8»; le faltaban `a-behaviors`, `cmp-sector` y el segundo contrato
de `clon-base`. Hoy (2026-08-02), ejecutando: **49 declaraciones en 48 sondas**
—`clon-base` lleva dos—, **39 con mínimo derivado** y **10 con literal**.

**Y el criterio no es «que no sea 1»**, porque para cuatro de las diez el mínimo
correcto **es** 1:

> **TODO MÍNIMO TIENE QUE EXPRESAR EL INVARIANTE QUE LA SONDA AFIRMA.**

| | sondas | ¿lo expresa? |
|---|---|---|
| mide **una** cosa, elegida por quien lanza | `a-behaviors` · `d4-cta` | **sí** |
| guarda de vaciado de un segundo nivel | `clon-base`/`evCmp` | **sí**, deliberado |
| 1 ruta, **o 2 con `--cmp`** | `offsets` | **a medias** |
| **la lista existe y el suelo no la usa** | `a-ids` · `c-behaviors` · `corte-cuerpo` · `dos-rutas` · `mono-cmp` · `tree-cmp` | **NO** |

Las cuatro últimas de la fila NO son «suelos flojos por pereza»: `dos-rutas`,
`mono-cmp` y `tree-cmp` comparan **dos** páginas por construcción y declaran 1;
`corte-cuerpo` recorre `RUTAS` del manifiesto × 2 anchos y **midió 12**.

**Y el criterio no se agota en las de mínimo literal.** Dos sondas derivan su
mínimo y tampoco lo cumplen, porque **el denominador está en otra unidad que el
numerador**: `c-muestra` imprime `16/3` y `esqueleto` `16/9` — páginas arriba,
**formas** abajo. `esqueleto` acepta nueve páginas de una sola forma.

La línea de unidades es lo que hace visible todo esto de un vistazo: `12/1` es la
firma de un suelo flojo, `16/9` la de un denominador en otra unidad, y `31/31` la
de un mínimo que sí expresa lo que la sonda afirma.

Negativos, en `qa:lib` (**55 aserciones**): bajo el mínimo con `exit(0)` ⇒ ≠0 ·
alcanzado ⇒ 0 **y con su línea de unidades**, sin duplicarla si la sonda llamó a
`informe()` · congelar sin declarar ⇒ «SIN CONTRATO» ⇒ ≠0 · `SIN_CONTRATO=1` ⇒ 0
· `minimo` ausente o 0 ⇒ **tira**.

### El barrido del contrato: EJECUTAR, no casar texto

**Séptima instancia de la clase, y dentro del test que la cierra.** El barrido que
comprobaba que las sondas declaran su mínimo era un `grep`, y dio verde sobre
`c-censo.mjs` con dos `const ev` y **sin compilar**. El primer parche añadió un
`node --check` **como segunda aserción**, y eso no basta: con dos aserciones
independientes, un fichero roto deja la primera —«las N declaran»— **en verde**.
Dos canales de verdad para una sola pregunta.

`auditarSondas()` (en `lib.mjs`) da **un veredicto por sonda**:

> **Compila **y** declara, o NO ES CONFORME. Lo que no compila no es «sin
> veredicto»: tumba la afirmación.**

Y la declaración se busca sobre el fuente **sin comentarios y sin literales**
(`sinLiterales()`), porque `// new Evaluadas(` y `"new Evaluadas("` son lo que un
`grep` no distingue de una declaración de verdad.

Test en negativo con **ficheros rotos a propósito**, en un directorio temporal
para que sea re-runnable: uno que **no compila y contiene el texto** que el grep
buscaba (el caso `c-censo` exacto) ⇒ ROTA y no conforme · uno mudo ⇒ SIN DECLARAR
· uno con la declaración **en un comentario y en una cadena** ⇒ SIN DECLARAR ·
uno bueno ⇒ conforme.

⚠ **Lo que este barrido NO discrimina, y hay que saberlo:** que la `ev` esté **en
el ámbito correcto**. `c-muestra.mjs` estuvo a punto de quedar con la declaración
dentro de un `for` anidado — **compila, declara, y no cuenta nada**. Eso no lo ve
ni el texto ni el parser: lo ve **correr la sonda**. El fichero lo cubre el
barrido; el contrato lo cobra la corrida.

### `clon-base` — dueña de su servidor, y las cuatro patas

```bash
npm run qa:clon-base -- 1440 [etiqueta] [--cmp medidas/base.json]
```

Arranca **su propio** clon con `iniciarClon()`: el modo de fallo que la hizo dar
verde midiendo nada —el 3000 vacío— **ya no existe**, no se detecta. Y lleva DOS
contratos, porque tiene dos niveles y cada uno se puede vaciar por su cuenta:
las **rutas medidas** (mínimo derivado del build) y las **rutas comparadas**
(mínimo 1: una línea base sin rutas en común compara cero y antes salía con 0).

| pata | cómo | resultado |
|---|---|---|
| puerto muerto | `CLON=http://127.0.0.1:9` | **exit 2** · «NO SE PUDO EVALUAR — 0 de 31 rutas» |
| build viejo | cambiar `.next/BUILD_ID` a mitad | **exit 2** · salida `-CONTAMINADA`, 31/31 medidas |
| 0 comparadas | `--cmp medidas/clon-base-neg-baseline-fantasma.json` | **exit 1** · «0 de 1 rutas comparadas» |
| control | normal, con línea base real | **exit 0** · 31 comparadas · 0 regresiones |

⚠ **La pata del build viejo destapó la sexta instancia de la clase, dentro de otra
guarda:** la de `BUILD_ID` renombraba la salida a `-CONTAMINADA`, gritaba **y no
tocaba el código de salida**. El HANDOFF que la estrenó decía «sale por error»:
no salía. Ahora va por el mismo gancho que el mínimo — un solo sitio decide si
una corrida puede salir con 0.
