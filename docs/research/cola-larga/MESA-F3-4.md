# MESA DE F3-4 · tres decisiones de propietario, con su reparto

**2026-08-26 · 115.ª tanda, ESCALÓN 2. No se decide ninguna: se dejan
DECIDIBLES.**

> ## ✅ ESTADO AL 2026-08-26 (116.ª) — las tres, resueltas o contestadas
>
> | | separadora | estado | fracción |
> |---|---|---|---|
> | **(a)** `categoria` | contenido propio no derivado de sus miembros | ✅ **CONTESTADA — es una CONSULTA** | **0 de 4** refutaciones · **4 de 4** términos |
> | **(b)** `author` | ¿el archivo tiene contenido propio? | ✅ **CONTESTADA — SÍ lo tiene** | **7 de 7** ejes propios son CAMPO · **6 de 6** términos |
> | **(c)** `sector` | *(ya venía partida)* | ✅ **DECIDIDA por el propietario** | (c1) SÍ a la relación · (c2) REPLICAR TAL CUAL |
>
> Derivaciones: `derivaciones/separadora-categoria-116.{mjs,log,json}` ·
> `derivaciones/separadora-author-116.{mjs,log,json}`. Decisión de (c) con su
> razón y su condición de reapertura: `ESQUEMA-CMS.md` §7i.
>
> **Y esta mesa NO se reescribe: se anota.** Lo de abajo es lo que la 115.ª
> dejó, y sigue siendo el estado de conocimiento con el que se contestó. Las
> correcciones van marcadas donde tocan.

F3-4 lleva desde el plan de fase con la instrucción *«abre decisión de ESQUEMA:
tómala ANTES de empezar»*, y ésta es la primera vez que su premisa está medida:
el censo de la 108.ª, los códigos de estado de la 114.ª y el barrido de seis
canales de la 115.ª.

**Todas las cifras de este documento se DERIVAN**, no se citan:
`derivaciones/mesa-f34-115.{mjs,log,json}` — que **tira en voz alta** si una de
sus tres congeladas se renombra, en vez de publicar el número de ayer.

---

## Antes de las tres: lo que decide cómo se leen

**El régimen de cada familia**, porque cambia la lectura de todo lo demás
(§`CLAUDE.md` · *identifica el RÉGIMEN antes de aplicar ningún test*):

| familia | régimen | qué significa |
|---|---|---|
| `categoria` | **`-T`** en 4/4 | plantillada: los valores los fijó quien construyó la plantilla |
| `author` | **`--`** en 6/6 | **cuarto casillero** — plantilla PHP del tema, sin capa de builder |
| `sector` | **`-T`** en 6/6 | plantillada |

**El coste**, derivado de A-SP13 (`ESQUEMA-CMS.md` §2.3): **0.2228 s/ruta**,
lineal y sin codo. Medido, no estimado.

**Quién consume cada una** (ESCALÓN 1 · seis canales · 256 documentos de
`corpus/fase-3`):

| familia | clase de término | **mecanismo** | enlaces |
|---|---|---|---|
| `categoria` | 63 docs | **0** | 135 |
| `author` | 0 docs | **0** | 36 |
| `sector` | 29 docs | **2** | 15 |

> **Ninguna se consume sin enlazarse.** El único mecanismo del corpus es el
> filtro de Isotope de `/casos-de-exito/`, vive en 2 documentos y **además**
> enlaza los 11 sectores.

---

## (a) `categoria`

**Unidades** — las dos, y no se sustituyen:

| unidad | cardinal |
|---|---|
| **términos** | **4** |
| alias de codificación (dan 301 a su gemela sin tilde) | 2 |
| **URLs declaradas** | **6** — sigue siendo cierto |
| **RUTAS en disco** | **27**, de las que **23** son `/page/N` |

**Lo medido:** régimen `-T` en 4/4 · sirve **2–9 tarjetas**, cuerpo
**7 650–21 405 B** · enlazada desde **15 de 35** formas de listado.

| candidato | rutas | coste | nota |
|---|---|---|---|
| **COLECCIÓN** (el término es contenido propio) | **27** | 6.0 s | exige campos propios (título, texto, imagen) |
| **RELACIÓN sin archivo** | **0** | 0.0 s | el término es dato, no URL; los enlaces de las 15 formas quedan por repuntar |
| «no se replica» | 0 | 0.0 s | **descartado por el dato**: sirve contenido y lo enlazan 15 formas |

**SEPARADORA** — un término con **contenido propio que NO se derive de sus
miembros**: un texto de cabecera, una imagen, un orden distinto del de fecha.
Si lo hay ⇒ COLECCIÓN. Si no lo hay en ninguno de los 4 ⇒ es una CONSULTA, y
basta la relación más el listado (§*un listado no tiene contenido propio: es
una CONSULTA*).

> ### ✅ CONTESTADA el 2026-08-26 (116.ª) — **es una CONSULTA**
>
> `derivaciones/separadora-categoria-116.{mjs,log,json}` · **0 de 4**
> refutaciones disparan, sobre **4 de 4** términos:
>
> | refutación | medido |
> |---|---|
> | R1 · texto de cabecera propio que VARÍE | **0 de 4** términos lo traen · 1 valor distinto ⇒ varianza **CERO** |
> | R2 · imagen de cabecera | **0** distintas en 4 |
> | R3 · orden distinto del de fecha | **4 de 4** descendentes, con las fechas leídas en **las 27 rutas** |
> | R4 · pieza en unos y no en otros | **0 de 6** tipos, quitado el contador de módulo |
>
> Lo único que varía entre las 4 instancias es el nombre del término (`h1` y
> último eslabón de la miga), **qué módulo de blog de la plantilla se sirvió**
> —`et_pb_blog_{0,2,3,4}_tb_body`, mientras la miga conserva su ordinal 0 en
> los 4, así que el contador numera la PLANTILLA y no la página— y las
> tarjetas con su paginador, que **son los miembros**.
>
> ⇒ **el candidato RELACIÓN sin archivo queda sostenido POR EL DATO**, no por
> el criterio de asimetría.
>
> **Y la relación quedó medida de paso, por DOS canales** (la tarjeta del
> archivo y el enlace `/categoria/…` dentro de la propia entrada): cobertura
> **152 de 152** entradas · cardinalidad **1:N con N ≤ 2**, positivos **2 de
> 152**, y los dos canales nombran **los mismos dos**, comparados por elemento.

**~~SIN MEDIR~~ ✅ MEDIDO (116.ª):** el cuerpo de los 4 términos se comparó
entre sí, **6 pares de 4 términos**. Queda **SIN DIRIMIR** otra cosa, y es
nueva: **8 de las 27 rutas sirven 0 tarjetas**, y offline no se distingue una
página real vacía de una URL que ya no existe. Comprobado contra el archivo
antes de ficharlo: `estados-114.json` cubre **1 de esas 27**.

> ⚠ **Y ESO CORRIGE UNA UNIDAD DE ESTA MISMA MESA:** «27 rutas» y «27 páginas
> con contenido» no son lo mismo — son **19 con tarjetas + 8 vacías**, y el
> coste de **6.0 s** está calculado sobre la primera.

---

## (b) `author`

**Unidades:**

| unidad | cardinal |
|---|---|
| **términos** | **6** |
| **RUTAS** | **34**, de las que **28** son la paginación de **un solo término** (`kunak`) |

**Lo medido:** régimen `--` en 6/6 · sirve **0–6 tarjetas**, cuerpo
**1 469–12 978 B** · **0 de 35** formas de listado la enlazan, y **0 en los seis
canales** dentro de `corpus/fase-3`.

> ⚠ **Y ESE 0 ES DE LOS LISTADOS, NO DEL SITIO.** El ESCALÓN 1 midió
> `corpus/fase-3`, que **no contiene las entradas de blog**. Ampliado el
> barrido:
>
> | | |
> |---|---|
> | entradas de blog capturadas | **152** |
> | con `ficha-autor-revisor` en el cuerpo | **152 — todas** |
> | que enlazan a `/author/` | **152** |
>
> Reparto: `kunak` 143 · `edurne-ibarrola` 4 · `irene` 3 · `javier-fernandez` 3
> · `admin` 1. (`mar_ramirez` no firma ninguna, y es justo el término cuyo
> archivo tiene **0 tarjetas**.)
>
> Es §*la salida servida incluye el canal que no estabas mirando*, con el canal
> puesto en **una carpeta del corpus**.

| candidato | rutas | coste | nota |
|---|---|---|---|
| **COLECCIÓN con archivo** | **34** | 7.6 s | 28 de ellas son paginación de un solo autor |
| **COLECCIÓN sin archivo** (dato sí, URL no) | **0** | 0.0 s | conserva la ficha de las 152; los 36 enlaces quedan por repuntar |
| «no se replica» | 0 | 0.0 s | **DESCARTADO POR EL DATO**: rompería la firma de las 152 entradas |

**SEPARADORA — CONTESTADA en esta misma tanda**, porque era un barrido offline
y ficharla habría sido mandar a la siguiente a hacer lo que ésta podía hacer.
Y de paso contestó **la segunda separadora, la del modelo**:

> **¿un miembro en DOS términos de la misma taxonomía?** → **SÍ: 2 de 152**, y
> con **PAPELES DISTINTOS**:
>
> | entrada | autores |
> |---|---|
> | `calidad-del-aire-en-las-comunidades` | `irene` (Revisado y aprobado por) + `kunak` (Escrito por) |
> | `monitorizacion-near-reference` | `edurne-ibarrola` + `kunak` |
>
> **La relación entrada→autor NO cabe en un campo simple: es 1:N CON PAPEL.**
> Dominio barrido entero (152), positivos 2 — se publica la fracción, no un
> «se comprobó» (§*el listón es todo el dominio alcanzable*).

**Lo que QUEDA por separar es otra cosa:** si el archivo `/author/` tiene
contenido propio (los 6 cuerpos van de 1 469 a 12 978 B) o es sólo la plantilla
del tema con la lista dentro.

> ### ✅ CONTESTADA el 2026-08-26 (116.ª) — **SÍ tiene contenido propio**
>
> `derivaciones/separadora-author-116.{mjs,log,json}` · **6 de 6** términos
> comparados entre sí, con los ejes **PARTIDOS** entre lo propio y lo derivado
> de los miembros — porque contar lo derivado infla el veredicto con lo mismo
> que la pregunta excluye:
>
> | GRUPO A · contenido PROPIO (decide) | valores distintos de 6 |
> |---|---|
> | foto (`src`) | **5** |
> | foto ES la del tema (`user.svg`) | **2** |
> | `h1` (nombre) | **6** |
> | cargo | **5** |
> | redes (conjunto) | **4** |
> | ¿tiene bio? | **2** |
> | cuerpo de la bio (chars) | **5** |
>
> **7 de 7 son CAMPO.** El GRUPO B —títulos y nº de listado, nº de tarjetas,
> encabezado de la bio— varía **4 de 4** y **no cuenta**: se deriva de qué
> entradas firmó el autor.
>
> ⇒ **`author` NO es «la plantilla del tema con la lista dentro»: es una
> ENTIDAD CON CAMPOS** (foto · nombre · cargo · redes · biografía).
>
> ⚠⚠ **Y ESO CAMBIA EL ESQUEMA, NO SÓLO EL VEREDICTO:** `foto`, `cargo`,
> `redes` y `bio` son **OPCIONALES**, y el original **EJERCITA** el caso —
> `admin` y `mar_ramirez` traen la foto del TEMA, el cargo **vacío**
> (`<p></p>`) y **ninguna bio**: **2 de 6**. §*un campo opcional no expresa un
> caso: sólo permite que falte* — el camino de render hay que estrenarlo.
>
> ### ✅ Y el `href` a `/author/` que el clon sirve HOY, por TRES canales
>
> | canal | medido |
> |---|---|
> | original | `ficha-autor-revisor` en **152 de 152** · **612** href, **absolutos 612 · locales 0**, los 612 dentro de la ficha |
> | cuerpo transformado | **0** — y es **CORRECTO**: la ficha vive en un módulo de la PLANTILLA, no en el `post_content` |
> | **código del clon** | **228** ficheros barridos · **1** href a `/author/`, **ABSOLUTO**, **0 locales** · rutas `/author/` que el build emite: **0** |
>
> ⇒ **«COLECCIÓN sin archivo» no crea ni un enlace roto.** El candidato queda
> limpio **por el dato**, no por el criterio.
>
> ⚠ **Y un hallazgo de fidelidad que NO es esta separadora**, fichado con su
> cardinal y sin perseguirlo: el clon **no pinta la `ficha-autor-revisor`** —
> **0 de 228** ficheros de código—, y el original la enseña en **152 de 152**
> entradas.

**~~SIN MEDIR~~ ⚠ MEDIDO A MEDIAS (116.ª), y hay que decir qué mitad:** las 6
instancias se compararon entre sí **en el eje del MARCADO**, y de paso se
barrieron **57 casos + 19 FAQ** (los dos cardinales de `CLAUDE.md`, derivados
y **los dos casan**). **Lo que `CLAUDE.md` declara SIN PROBAR es otro eje** —
ritmo, tipografía y retícula, o sea **geometría computada**— y ése **no se
puede derivar de este corpus**: sin las hojas enlazadas, `getComputedStyle` da
una medida plausible y falsa (§F3-1-CSS-NO-CAPTURADO). **Siguen sin medir
6 + 57 + 19 = 82 instancias** en ese eje.

> ⚠ **Y el régimen `--` de estas 6 hubo que DESEMPATARLO**, porque las dos
> señales de `CLAUDE.md` discrepan en 6 de 6. El discriminador —que no estaba
> escrito en ningún sitio— es que **Divi numera cada sección UNA vez**: si
> `ocurrencias == distintos`, es builder; si repite el mismo literal, es una
> plantilla PHP copiando la clase. `author` repite `et_pb_section_1_tb_body`
> hasta 4 veces y **el número crece con el contenido**: **`--` confirmado**,
> con 5 de 6 decidibles y **1 indeterminada** (`mar_ramirez`, una sola
> sección: el test no separa).
>
> ⚠ **Y hay una varianza que SÍ apareció, en un canal que esta mesa no miraba:**
> el `<style>` en línea. `divi-dynamic-critical-inline-css` (**161 728 B**,
> idénticos donde está) falta en **2 de 484** documentos capturados, y esos 2
> son **exactamente** `admin` y `mar_ramirez`, comparados por elemento. El
> mecanismo se ficha **sin explicar** (necesita red).

---

## (c) `sector` — **ya viene PARTIDA en dos, y la partición se mantiene**

Es lo que la hizo decidible en la 108.ª. **Son dos decisiones, no una.**

**Unidades:** **11 términos** · **13 RUTAS** · **5 dan 301**.

| URL | → |
|---|---|
| `/es/sector/industria/` | `/es/sectores/control-de-emisiones-industriales/` |
| `/es/sector/investigacion-consultoria/` | `/es/sectores/estudio-de-la-contaminacion-atmosferica/` |
| `/es/sector/obras/` | `/es/sectores/contaminacion-por-construccion/` |
| `/es/sector/urbano/` | `/es/sectores/calidad-del-aire-en-las-ciudades/` |
| **`/es/sector/mineria/`** | **`/es/sector/mineria/` ⛔ BUCLE A SÍ MISMA** |

**Lo medido:** régimen `-T` en 6/6 · **0 tarjetas en 6 de 6** por los TRES
selectores, cuerpo ~3.3 KB de miga + barra lateral — **no lista nada**, y su
paginación tampoco.

| | candidato | rutas | coste | ¿tiene consumidor? |
|---|---|---|---|---|
| **(c1)** | la **RELACIÓN** `caso → sector` | **0** | 0.0 s | ✅ **sí** — el filtro de `/casos-de-exito/`: **11 sectores + 1 comodín `"*"`** |
| **(c2)** | el **ARCHIVO** `/es/sector/*` | **13** | 2.9 s | ❌ **no lo consume nadie y no sirve contenido** |

Para (c2) hay precedente, no vacío: **`D2.5 · REPLICAR TAL CUAL`** ya decidió
esto para las 55 que responden 200 sin listar.

**SEPARADORAS:**

- **(c1)** — un caso de éxito en **DOS sectores a la vez**, o un sector con
  **orden propio**. Si no lo hay, la relación cabe como campo simple en el caso
  y no necesita entidad.
- **(c2)** — que alguna URL `/sector/*` esté enlazada **desde fuera del
  filtro**. Hoy son 15 documentos, todos del propio filtro o del archivo.

> ### ✅ DECIDIDA POR EL PROPIETARIO el 2026-08-26 (116.ª), en sus dos mitades
>
> - **(c1) SÍ a la RELACIÓN `caso → sector`** — 0 rutas, y es la única pieza de
>   las tres con **consumidor medido**;
> - **(c2) REPLICAR TAL CUAL el archivo `/es/sector/*`** — 13 rutas · 2.9 s, por
>   **precedente D2.5**. Las **5 que dan 301 se replican COMO REDIRECCIÓN, no
>   como página**: replicar un 301 como página sería servir un 200 donde el
>   original salta.
>
> ⚠ **(c2) se toma CONTRA §regla 23** —la separada era no emitir el archivo—
> porque pesó más la **CONSISTENCIA con D2.5**, ya aplicada a 55 cascarones
> vacíos. Por eso **lleva condición de reapertura**, escrita en
> `ESQUEMA-CMS.md` §7i junto con la razón completa.
>
> **`mineria` queda fichada con sus 5 saltos y SIN diagnosticar**: necesita red.
>
> **NO se implementa en esta tanda.**

**SIN MEDIR, y NO se explica aquí a propósito:** el **bucle de `mineria`** se
ficha con su número (**5 saltos**, `redirect: manual`) y **no se diagnostica**.
Lo dirimiría leer la cabecera `Location` de cada salto con el `Host` y el
esquema completos — un 301 a sí misma suele ser un `canonical`/`redirect` que
depende de la barra final o del idioma. **Necesita red.** *Un mecanismo sin
medir que entra en una mesa la contamina.*

---

## El criterio de asimetría, con su OPERACIÓN escrita

§regla 23: el enunciado solo —*«entre dos opciones reversibles se toma la que
se deshace mejor»*— es **simétrico**, y al releerlo el signo se invierte
(derivado en la 114.ª: **11 citas en el repo, 2 invertidas**). Así que se
escribe con la operación delante:

> **Se toma la que empieza SEPARADA, porque deshacerla es FUSIONAR, y fusionar
> es el lado barato.**

| decisión | la separada | deshacerla | deshacer la otra |
|---|---|---|---|
| (a) `categoria` | **RELACIÓN sin archivo** | emitir 27 rutas · **6.0 s** | retirar URLs publicadas |
| (b) `author` | **COLECCIÓN sin archivo** | emitir 34 rutas · **7.6 s** | retirar URLs publicadas |
| (c) `sector` | **relación sin archivo** | emitir 13 rutas · **2.9 s** | retirar URLs publicadas |

⚠ **«No se replica» no es la opción separada en ninguna**: es la que **pierde
dato**, y deshacerla exige re-extraer del original. No compite con las otras
dos — compite consigo misma.

⚠ **Y si una decisión se toma CONTRA el criterio, se dice qué restricción pesó
más y SE LE PONE CONDICIÓN DE REAPERTURA.** Una decisión alineada con el
criterio puede no llevarla; una que lo contradice, siempre.

---

## Lo que esta mesa NO trae, con su nombre

*(actualizado el 2026-08-26 tras la 116.ª — lo tachado se midió, lo que queda
lleva su cardinal)*

- **el eje COMPORTAMIENTO** (0/31 en el repo): un filtro montado en JS tras una
  petición no deja rastro en el HTML servido. **Las tres decisiones se toman
  sobre el HTML SERVIDO**, y eso se declara en vez de suponerse cubierto;
- **el mecanismo del bucle de `mineria`**: fichado con su número, no explicado.
  Necesita red;
- ~~la varianza entre instancias del régimen `--`~~ → **medida en el eje del
  MARCADO** (6 author + 57 casos + 19 FAQ). **Sigue SIN PROBAR el eje que
  `CLAUDE.md` nombra —ritmo, tipografía, retícula, o sea GEOMETRÍA
  COMPUTADA—: 82 instancias**, y no por falta de tiempo: **este corpus no
  puede contestarlo** (sin las hojas enlazadas la medida sale plausible y
  falsa);
- **el MECANISMO del `<style>` de 161 728 B** que falta en **2 de 484**
  documentos: fichado con su cardinal, sin explicar;
- **el CSS servido** como séptimo canal del ESCALÓN 1: una regla podría esconder
  tarjetas por clase de término. Sigue fuera;
- **las 8 rutas VACÍAS de `categoria`** (de 27): offline no se distingue una
  página real vacía de una URL inexistente, y el archivo cubre **1 de 27**;
- **la `ficha-autor-revisor` que el clon no pinta** — original **152 de 152**,
  clon **0 de 228** ficheros de código. No es ninguna de las tres separadoras.
