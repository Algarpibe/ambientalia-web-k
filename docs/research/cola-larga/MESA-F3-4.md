# MESA DE F3-4 · tres decisiones de propietario, con su reparto

**2026-08-26 · 115.ª tanda, ESCALÓN 2. No se decide ninguna: se dejan
DECIDIBLES.**

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

**SIN MEDIR, con su cardinal:** el cuerpo de los 4 términos **no se ha
comparado entre sí** para ver si su cabecera es plantilla o campo. **4 de 4.**

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

**SIN MEDIR, con su cardinal:** **la varianza entre instancias del régimen `--`
no está medida en ningún sitio del repo** — `CLAUDE.md` la declara SIN PROBAR.
Estas 6 son la muestra que existe, **sin comparar entre sí: 6 de 6**. Es
exactamente lo que decidiría la separadora que queda.

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

- **el eje COMPORTAMIENTO** (0/31 en el repo): un filtro montado en JS tras una
  petición no deja rastro en el HTML servido. **Las tres decisiones se toman
  sobre el HTML SERVIDO**, y eso se declara en vez de suponerse cubierto;
- **el mecanismo del bucle de `mineria`**: fichado con su número, no explicado.
  Necesita red;
- **la varianza entre instancias del régimen `--`**, que `CLAUDE.md` declara SIN
  PROBAR y que decide cómo se lee `author`. **6 instancias sin comparar**;
- **el CSS servido**: una regla podría esconder tarjetas por clase de término.
  Sería un séptimo canal y no está en la lista del ESCALÓN 1.
