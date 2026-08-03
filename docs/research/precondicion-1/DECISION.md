# DECISIÓN · la precondición 1, contestada — **C = 1**, y no lo habría cazado el enunciado viejo

> **2026-08-03.** Evalúa `PRE-REGISTRO.md` (commit `cf25baf`, anterior a
> clasificar nada). Tanda de **LECTURA**: no se midió, no se construyó, no se
> abrió el navegador.

---

## 0 · El veredicto, con sus dos números

> **CUBO C = 1** · **INCÓGNITAS = 2 acotadas** (una de ellas, 14 páginas).
>
> **C no está vacío, así que eso entra en el esquema PRIMERO.** Y el ítem de C
> **no es ninguno de los candidatos que el pre-registro sospechaba**: es
> **`productos`**, una colección que **dos colecciones ya decididas apuntan como
> destino de relación** y que **no está modelada en ninguna parte del esquema**.

**La sospecha pre-registrada falló, y falló limpio.** El pre-registro apostaba
por las **variantes de tarjeta de LISTADO-B** como el candidato más probable a
cubo C. **No lo son**: el contrato que exigen ya está escrito en el esquema desde
LH-2 (§2c, «el contrato de nacimiento del grupo A»). Se anota como predicción
fallada, no se reescribe.

---

## 1 · PASO 2 · Lo decidido pero sin construir — **todo A o B**

### 1.1 · Las variantes de tarjeta: **cubo A**, y con el contrato ya escrito

LH-2 D3 ya hizo exactamente esta pregunta («lo que los listados le EXIGEN al
grupo A — la decisión que condiciona») y su respuesta está **en el esquema**,
§2c: *«el contrato de nacimiento del grupo A (D3 — lo caro de re-migrar si
falta)»*. Cotejado campo a campo contra `EntradaBlog` (`src/types/kunak.ts`):

| lo que la tarjeta exige (D3) | ¿está? |
|---|---|
| `titulo` · `slug` | ✅ |
| `fechaPublicacion` | ✅ (+ `fechaActualizacion`) |
| `imagenDestacada` **opcional** | ✅ opcional, como pedía |
| **las TRES taxonomías** `category` · `post_tag` · `resources` — *«lo más caro de re-migrar si falta»* | ✅ `categorias` · `etiquetas` · `recurso` |
| `extracto` | **declarado en §2c** como opcional con derivación por defecto |
| `autor` | ✅ **correctamente ausente** — 0/9 formas lo piden |

> **La sospecha era razonable y estaba contestada hace tres días.** El mecanismo
> que lo evitó no fue la suerte: fue que **LH-2 se hizo ANTES de construir el
> grupo A**, exactamente por esto. La precondición ya funcionó una vez.

**`extracto` no es cubo C**, y la distinción importa: **el campo ya está
decidido**, así que nada lo «fuerza». Lo que LH-SP10 decide es si algún extracto
tiene **contenido manual que capturar al importar** — que es una pregunta de
**F2-2 (fidelidad de importación)**, no de congelación de esquema. Se ficha ahí,
en voz alta: **si hay extractos manuales y el importador deriva todos, se pierde
contenido en silencio.**

### 1.2 · L2 · L3 · L5: **cubo A**, verificado contra los tipos

| forma | qué lee | ¿fuerza algo? |
|---|---|---|
| **L2** (glosario · preguntas-frecuentes) | `TerminoKunakpedia` · `Faq` — tarjeta **solo-título** | no: los dos tienen `titulo` + `slug` |
| **L3** (`scientific-category/*`) | `DocumentoCientifico.categoria: TerminoA` | no: la relación **ya existe** en el tipo |
| **L5** (`casos-de-exito` índice) | `CaseStudy` ← `CasoDeExito` (`titulo` · `cliente` · `sectores` · `imagenCabecera` · `slug`) | no: §2c lo declara *«página índice, cero campos nuevos»* |

### 1.3 · El SEGUNDO objeto — las definiciones de block compartidas: **cubo B**

Es el que el pre-registro declaró que se olvida, y **está contestado por
medición**, no por argumento. `grupo-D/RECON.md` §5 y §7:

| predicción de grupo D | resultado |
|---|---|
| **PD1** · retícula y ritmo entran | ✅ **«nada obligó a tocar `MonoRitmo`»** |
| **PD2** · texto, imagen, botón entran | ✅ los 3 artículos simples se expresan con ellos |

Y §7, literal: *«la retícula, el ritmo y los módulos de texto/imagen/botón del
monográfico **sí** sirven»*.

> **`articulos-kb` CONSUME las definiciones compartidas sin cambiarlas y AÑADE
> su propia unión (`blurb`/`gallery`). Eso es cubo B.**

**Y la cola larga tampoco toca lo compartido, por decisión ya tomada:** §2d.1
dice que `video`/`toggle` **no entran en `MonoSeccion[]`** —*«sería el arreglo
falso de §1.5b Razón 1»*—, así que su modelo será propio. **Cubo B**, con la
decisión de modelo pendiente pero acotada a sí misma.

---

## 2 · PASO 3 · Lo que no tiene recon

### 2.1 · Las 20 dudosas del CPT `solutions` — **CUBO C**

**Y el mecanismo no es el que el pre-registro tenía en la cabeza.** No pueden
cambiar los campos de `productos` (no están decididos); cambian **cuántas
colecciones es `productos`** — y eso cambia un campo que **sí** está decidido, en
**dos** sitios:

| dónde | qué dice el esquema |
|---|---|
| **§1.4 · SECTOR** | `soluciones` → **relación a la colección de productos** |
| **§2b · grupo C** | `soluciones` → **relación 0..n a la colección de productos (la del §1.4)** |

Y la duda está escrita en el censo, no la invento aquí
(`CENSO-ARQUETIPOS.md` §3): de los **17 cartuchos inteligentes** —

> *«¿Es PRODUCTO reducido, o **un arquetipo FICHA con su propio modelo**?»*

**Si es lo segundo, `productos` se parte, y las dos relaciones decididas cambian
con él.** Eso es literalmente cubo C: *fuerza un campo dentro de colecciones ya
decididas*.

### 2.2 · ⚠ Y lo que apareció al mirar, que el enunciado VIEJO no podía cazar

> **`productos` no está modelada en NINGUNA parte de `ESQUEMA-CMS.md`.** Se cita
> **dos veces, y las dos como destino de relación**. No tiene ni un campo escrito.

Los content types del esquema son §1.4 SECTOR · §1.5 MONOGRÁFICO · §2 grupo A ·
§2b grupo C · §2c términos de taxonomía · §2d.1 `articulos-kb`. **Faltan cinco
arquetipos CONSTRUIDOS**: HOME · **PRODUCTO** · **CATÁLOGO** · SOFTWARE · API.

**Por qué la precondición vieja era ciega a esto, y es la lección de la tanda:**

> **«Biblioteca cerrada» pregunta si la página está CONSTRUIDA. PRODUCTO lo
> está — se clonó en julio. Lo que falta no es la página: es su CONTENT TYPE.**
> Un enunciado que mide construcción no puede ver un hueco de modelado, y éste
> lleva ahí desde que se escribió el §1 («**los DOS** content types medidos»).

**Y el censo ya había escrito por qué es peligroso**, con la misma lección que
`anchoPct` cobró esta semana:

> *«Los otros seis tienen **una instancia cada uno**, así que de ellos todavía
> no se sabe qué es plantilla y qué es campo — que es exactamente lo que enseñó
> la tanda del monográfico (8 propiedades invisibles en la primera página).»*

`anchoPct` lo confirmó el 2026-08-03 con **cuatro** instancias: el `90 %` estaba
en **una sola** de las cuatro. PRODUCTO, CATÁLOGO, SOFTWARE y API tienen **una**.

**El reparto de los cinco, que no es uniforme:**

| arquetipo | ¿bloquea? | por qué |
|---|---|---|
| **PRODUCTO / CATÁLOGO** (CPT `solutions`) | **SÍ — cubo C** | **relación decidida apuntándolo** desde `sectores` y `casos`, + 20 instancias sin medir que pueden partirlo |
| HOME · SOFTWARE · API | **no — cubo B** | páginas singleton; **nada decidido las apunta**. Modelarlas después es añadir |

### 2.3 · `/es/categoria/*` (LH-SP8) — **INCÓGNITA acotada**

El esquema ya la declara y ya dice lo que le falta: `categorias` con *«**SIN
CENSAR** … se censa antes de modelar»* (§2c). Su peor caso:

- **jerárquica** ⇒ gana `padre?`, como `categoriasRecursos` — sobre una colección
  **nueva y vacía** ⇒ **B**;
- **N términos** ⇒ mueve el nº de rutas ⇒ **F2-4 / A-SP13**, no el esquema.

**Acotada**: se sabe qué mirar (un censo corto de la familia) y su peor caso
sigue siendo B. La relación `EntradaBlog.categorias` ya existe.

### 2.4 · Las 14 páginas sueltas de la cola larga — **INCÓGNITA acotada**

`LEGAL` (4) · `LANDING DE DESCARGA` (3) · `EMPRESA` (2) · `SUSCRIPCIÓN` (2) ·
`SOPORTE` (2) · `CONTACTO` (1). **Sin recon.** No se meten en un cubo por
comodidad — se cuentan como incógnitas, con su cota:

> Son páginas **autónomas**: su contenido es propio y **ninguna colección
> decidida las apunta ni proyecta**. El peor caso es que estrenen colección o
> plantilla propias ⇒ **B**.

Los **13 hubs** (6 de LH-2 + 7 de KB) **no** son incógnita: §2d.1 ya los
clasificó como cola larga con modelo propio ⇒ **B**.

---

## 3 · El recuento, en la unidad en que se clasificó

| cubo | formas | páginas |
|---|---|---|
| **A** · lee sin cambiar | 4 (L1 · L2 · L3 · L5) | 35 |
| **B** · añade lo suyo | `articulos-kb` · 13 hubs · HOME/SOFTWARE/API · términos nuevos | ~26 |
| **C** · fuerza algo decidido | **1** — `productos` (CPT `solutions`) | **20 sin medir** |
| **INCÓGNITA acotada** | **2** — LH-SP8 · las 14 sueltas | 14 + N |

---

## 4 · La consecuencia, sin diplomacia

> **F2-1 NO puede congelar el esquema todavía.** No por «la biblioteca», sino
> porque **el esquema tiene un agujero con dos relaciones decididas apuntando a
> él**: `productos` no existe como content type y sus 20 instancias sin medir
> pueden decidir si es **una** colección o **dos**.

**Lo que lo cierra está acotado y es barato** — y el censo ya lo dijo:

> *«Resolverlas es **recon, no build**: un barrido de topología por página y
> comparar. **Barato**, y mueve 20 páginas de "no se sabe" a A o a C.»*

**El orden que sale de aquí:**

1. **AHORA · recon de las 20 dudosas del CPT `solutions`** (17 cartuchos + 3
   fichas) → decide si `productos` es una colección o dos, y con ello los campos
   de PRODUCTO/CATÁLOGO. **Es recon, no construcción.**
2. **Con eso · escribir el content type de `productos`** en `ESQUEMA-CMS.md`.
3. **Entonces · F2-1** congela y arranca.

**Lo que NO hay que hacer, y es la tentación exacta:** arrancar F2-1 modelando
`productos` **desde la única instancia construida**. Es la FAMILIA DE
CALIBRACIÓN con nombre y apellidos, y esta semana ya se pagó una vez: con cuatro
instancias de SECTOR, el `90 %` vivía en una sola.

**Las dos incógnitas no bloquean** —su peor caso es B— pero **se nombran y no se
cuentan como «no bloquea»**: quedan como trabajo con su cota escrita.

---

## 5 · ⚠ Una corrección al criterio del pre-registro, pagada por este caso

El pre-registro declaró **dos** objetos: los campos de las colecciones y las
definiciones de block compartidas. El ítem de C llegó por un **tercer camino**
que ninguno de los dos nombra explícitamente:

> **El DESTINO DE UNA RELACIÓN.** `soluciones` es un campo decidido en dos
> colecciones, pero lo que la forma nueva cambia no es *ese campo*: es **la
> identidad de la colección a la que apunta**. El campo se escribe igual y
> significa otra cosa.

Queda cubierto por la letra del criterio —cambia un campo decidido— pero **no lo
sugería**, y por eso casi se cuela: la mirada iba a los campos propios de cada
colección, no a **con qué se casan**. Se anota para el siguiente uso del
criterio: **al clasificar, hay que recorrer también los destinos de relación, y
preguntarse si la forma nueva puede PARTIR el destino.**

---

## 6 · ESCALÓN DECLARADO — no se disparó

| condición | ¿se cumple? |
|---|---|
| (a) ninguna lectura de esta tanda la arbitra | **NO** — la arbitró: C=1, nombrado, con su mecanismo |
| (b) cara de deshacer | sí |
| (c) sin precedente aplicable | **NO** — `anchoPct` (2026-08-03) y las 8 propiedades del monográfico son precedente directo y medido |

Dos de tres fallan. **No es frontera aplazada: es recon pendiente**, y va de
paso 1 del orden de §4.

---

*Decidido el 2026-08-03, contra el pre-registro `cf25baf`.*
