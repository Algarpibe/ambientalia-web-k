# PRE-REGISTRO · 147.ª — CÓMO LLEGA EL CÓDIGO AL VPS

**Escrito ANTES de correr ninguno de los cuatro caminos.** Fecha: 2026-09-05.
Terreno derivado en `paso0-147.{mjs,json,log}`, commit `757007a`.

Un pre-registro protege de decidir por cansancio y **no protege de partir de una
premisa falsa** (§regla 8b), así que los hechos negativos que afirma van
comprobados contra el archivo, no de memoria. Los tres que afirma son:

| hecho negativo afirmado | comprobado contra | resultado |
|---|---|---|
| el origen **no declara** `content-length` | dos `curl -sIL` en el PASO 0 | **0 ocurrencias** de `content-length` y de `transfer-encoding` |
| el repositorio **no exige** credenciales | `api.github.com/repos/…` sin token | **200** |
| el tarball **no excluye** ficheros del árbol | `grep export-ignore .gitattributes` | **0** — el tarball lleva los 7 696 |

---

## LA COMPROBACIÓN QUE EL ENCARGO PIDE NO EXISTE — Y SU SUSTITUTA VA DECLARADA AQUÍ

El encargo manda, para el camino SEPARADO, *«comprobar el tamaño contra el que
el origen declara»*. **El origen no declara ninguno** (PASO 0). Así que la
comprobación se sustituye, y la sustituta se escribe **antes** de medir para que
no se pueda ajustar al resultado:

| lo que iba a comprobarse | lo que se comprueba en su lugar | qué prueba |
|---|---|---|
| tamaño ⟷ `content-length` | **`gzip -t`** sobre el fichero | el trailer de gzip lleva CRC32 **e ISIZE**: un stream cortado no los tiene y `gzip -t` falla. Es la única comprobación de completitud que el formato ofrece **desde dentro** |
| — | **sha256 de DOS descargas** | si coinciden, el artefacto es estable entre peticiones y el `etag` lo identifica de verdad. Si no, el tarball no es reproducible y ningún hash sirve de referencia |
| — | **ficheros extraídos = 7 696** | un `exit 0` de `tar` no dice qué hay detrás (§regla 61); el cardinal sí |

> ⚠ **Y el `gzip -t` NO se cree sin su testigo por las DOS polaridades**
> (§regla 28d): sobre el fichero íntegro tiene que **pasar**, y sobre una copia
> **truncada a mano** tiene que **fallar**. Si sólo pasara, no distinguiría «el
> archivo está bien» de «no sé mirar» — y ése es justo el cero que este repo
> lleva nueve reglas persiguiendo.

---

## P1 · LA TUBERÍA — CONTROL POSITIVO

**Predicción: FALLA**, y falla **después** de haber transferido una fracción
sustancial, no al principio.

**El mecanismo que predigo, y es el que hace la predicción falsable:** en
`curl … | tar -xz` la velocidad de descarga queda **acoplada** a la de
extracción. El VPS tiene **2 núcleos** y hay que escribir **~1.78 GiB crudos**;
mientras `tar` escribe a disco, `curl` se bloquea con el pipe lleno y la
conexión con codeload queda **abierta y ociosa**. Una conexión ociosa el tiempo
suficiente la corta el origen, y entonces `tar` ve un gzip **sin su trailer** y
dice exactamente `unexpected end of file`.

**El testigo que separa el mecanismo de una coincidencia: el TIEMPO.** Si el
acoplamiento es real, la tubería tarda ≈ **max**(descarga, extracción) y no
≈ descarga; y el camino SEPARADO, que no acopla, tarda ≈ descarga **+**
extracción con la descarga a velocidad plena.

**Qué significaría cada respuesta — las dos son informativas:**

- **falla** → el control positivo funciona y el diagnóstico de la 146.ª se
  sostiene: lo que falla es la transferencia, no el archivo;
- **NO falla** → y esto hay que decirlo con todas las letras, porque **cambia el
  diagnóstico entero**: el fallo no sería reproducible desde el host por SSH, y
  entonces no es del CAMINO sino del **ENTORNO de Easypanel** —contenedor,
  límites de memoria, timeouts del constructor—. Sigue sin ser de tamaño, así
  que CMS-11 cambia de enunciado igual; pero el mecanismo pasa a estar **SIN
  MEDIR**, y decir «ya sé qué era» sería inventarlo.

⚠ **Y declaro la asimetría de entornos por delante, porque es la que puede
tumbar esta predicción:** el fallo original ocurrió **dentro de la tubería de
Easypanel**, y yo voy a correr la tubería **en el host por SSH**. Son dos
entornos, así que un «no falla» aquí **no refuta** que allí falle — deja el caso
sin ejercitar, que es §*una refutación en el ancho donde la propiedad está
tapada no refuta nada* con el ancho cambiado por el entorno.

---

## P2 · EL CAMINO SEPARADO

**Predicción: COMPLETA**, con `gzip -t` en verde y **7 696** ficheros
extraídos.

**Mecanismo:** sin acoplamiento, `curl -o` descarga a velocidad de red y cierra
la conexión; `tar -xzf` lee de **disco local**, sin ninguna conexión abierta que
nadie pueda cortar. El tamaño del archivo no cambia — cambia **cuánto tiempo se
tiene abierta la conexión**, que es la variable del mecanismo de P1.

**Qué significaría cada respuesta:**

- **completa** → el fallo es del **ACOPLAMIENTO**, y por tanto **el tamaño no
  impide la entrega**. CMS-11 deja de ser una decisión de tamaño;
- **NO completa** → entonces la variable es otra (la red del VPS, un límite del
  origen por volumen, el disco), y **ahí sí** el tamaño vuelve al centro: el
  reparto de cinco candidatos de la 146.ª sube al propietario tal cual.

---

## P3 · `git clone`, COMPLETO Y SHALLOW

**Predicción: los dos COMPLETAN.** Y los tamaños, que es lo que el encargo pide
predecir:

| camino | predicción | de dónde sale |
|---|---|---|
| `git clone` completo | **890 – 950 MiB** transferidos | el pack local mide **894.64 MiB** (`count-objects -v -H`, PASO 0) y GitHub sirve un pack equivalente |
| `git clone --depth 1` | **850 – 950 MiB** — **NO sustancialmente menor** | la 146.ª midió el multiplicador de versiones en **1.00**: 2 731 rutas, 2 731 versiones, **0 MiB de historial muerto**. Si no hay historial que podar, un shallow no tiene qué quitar |

**Y la predicción que de verdad decide la tanda, porque compara los dos
canales:**

> **el clone transfiere ~895 MiB contra los ~1 320 MiB del tarball, o sea
> alrededor de un 32 % MENOS.** Predigo que el camino de git es **el más
> barato de los cuatro en bytes**, y no por poco.

**El testigo, y va en la dirección incómoda:** si `--depth 1` saliera **mucho**
más pequeño —digamos por debajo de 500 MiB— eso **contradiría** el multiplicador
1.00 que la 146.ª midió, y la primera hipótesis no sería «qué bien» sino **el
instrumento**: o mi medida de hoy o la suya de ayer estaría mal, y habría que
dirimirlo antes de escribir nada (§sondas 4, *la contradicción con una medida
buena anterior*).

⚠ **Y una advertencia de comparabilidad que declaro antes de medir:**
`.gitattributes` trae `* text=auto`, así que los ficheros de texto se
**normalizan a LF**. En un host Linux el checkout de git y el tarball deberían
dar los mismos bytes, pero **`corpus/**` y `media-corpus/**` llevan `-text`
precisamente porque su sha256 depende de ello. Si los conteos difieren, la
primera sospecha es ésta y no una entrega incompleta.

---

## P4 · ¿QUÉ QUEDA DE LA HIPÓTESIS `public/`? — CONTESTADO ANTES DE MEDIR

**Si P2 completa y P1 falla, de la CAUSA no queda nada que `public/` explique.**

El razonamiento, que es de álgebra y no de medición: si el **mismo** archivo de
1 320 MiB llega entero por el camino separado y se corta por la tubería,
entonces **el tamaño no es la variable que decide** — lo es la forma. Y una
variable que no decide no se arregla encogiéndola.

Lo que **sí** quedaría de `public/`, y hay que escribirlo con su unidad para no
tirar una medida buena:

| queda | no queda |
|---|---|
| la **MAGNITUD**: 649.57 MiB del tarball, el tiempo de transferencia, el tamaño de la imagen | la **CAUSA**: el fallo de entrega |

La 146.ª ya escribió *«encoger `public/` es un arreglo por MAGNITUD, no por
causa»*. Esta tanda lo subiría un escalón: de *«arreglo por magnitud»* a
**«arreglo por magnitud que además NO HACE FALTA para entregar»** — que es una
afirmación más fuerte y más barata de actuar, porque convierte los cinco
candidatos de un bloqueo en una optimización opcional.

**Y la combinación que NO he predicho, dicha por delante para que no se lea como
sorpresa:** si P1 **y** P2 fallan los dos, `public/` recupera su papel entero y
CMS-11 sigue siendo de tamaño. Si P1 **no** falla, el mecanismo queda sin medir
y `public/` queda **igual que hoy**: fichado con su magnitud y sin causa
atribuida.

---

## LO QUE ESTE PRE-REGISTRO **NO** CONTESTA

Escrito a mano, porque un fichero congelado no lleva dentro qué preguntas no se
le hicieron (§*una regla incompleta se lee exactamente igual que una completa*):

1. **no contesta si Easypanel completa.** Los cuatro caminos se corren **por
   SSH en el host**. La tubería de Easypanel es otro entorno y no se toca;
2. **no contesta si el despliegue funciona.** Extraer el código no es construir
   la imagen ni servirla — el 500 de `web.ambientalia.cloud` es de atar un
   dominio a un servicio que no existe, y va después;
3. **no contesta cuál de los cinco candidatos de CMS-11 conviene.** Mide la
   separadora de ENTREGA; el reparto de MiB se conserva como expediente.
