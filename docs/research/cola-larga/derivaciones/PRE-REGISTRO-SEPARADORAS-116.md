# PRE-REGISTRO · 116.ª · las dos separadoras que faltan (`categoria` y `author`)

**2026-08-26 · escrito y commiteado ANTES de medir.**

Las dos separadoras de la MESA-F3-4 son **barridos OFFLINE**, así que se
ejercitan en vez de ficharse — que es lo que la 115.ª demostró con `author`
(su primer borrador la fichó, y contestarla costó un barrido).

---

## 0 · LO QUE YA HE VISTO, DECLARADO CON SU CARDINAL

Un pre-registro escrito después de mirar no es un pre-registro, y **callarlo es
peor que la contaminación**. El estado honesto al escribir esto:

| familia | instancias abiertas antes de escribir esto | de |
|---|---|---|
| `categoria` | **0** | 4 |
| `author` | **1** (`irene`, al orientarme) | 6 |
| casos · FAQ | **0** | por derivar |
| cuerpos transformados del clon | **0** (sólo listé el directorio) | 152 |

**Consecuencia de método, y es la que cuenta:** la apuesta de `author` **no es
ciega**, así que **no se puede cobrar como acierto de predicción**. Por eso su
predicción se escribe donde SÍ tiene riesgo — no *«¿hay contenido propio?»*
(que ya vi en 1), sino **si la ESTRUCTURA es constante y sólo varían los
VALORES en las 6**, que es el discriminador que de verdad decide y que una sola
instancia no puede contestar.

---

## 1 · (a) `categoria` — ¿CONSULTA o COLECCIÓN?

**La separadora, tal como la dejó la mesa:** un término con **contenido propio
que NO se derive de sus miembros** — un texto de cabecera, una imagen, un orden
distinto del de fecha. Si lo hay ⇒ COLECCIÓN. Si no lo hay en los 4 ⇒ CONSULTA.

### Apuesta

> **NO lo hay en ninguno de los 4 ⇒ es una CONSULTA.** Predicción numérica:
> **4 de 4** con cuerpo idéntico salvo (i) el `h1`/`<title>`, (ii) el último
> eslabón de la miga, (iii) la lista de tarjetas y su paginación.

### Mecanismo que la sostiene

`categoria` es la taxonomía **de núcleo** de WordPress sobre `post`. Su archivo
lo pinta una plantilla única (`category.php`/`archive.php`, o aquí un cuerpo de
theme-builder), y lo único que el núcleo le da a un término por sí mismo es
`name`, `slug` y `description`. Un texto de cabecera sería `term_description()`
y una imagen exigiría un campo a medida.

Y el régimen lo refuerza: la mesa lo da **`-T` en 4/4**, o sea plantillada —
**los valores los fijó quien construyó la plantilla, para las 4 a la vez**, y
el discriminador correcto es **la varianza entre instancias**, no el px
absoluto (§*identifica el RÉGIMEN antes de aplicar ningún test*).

### Qué la refutaría, por orden de fuerza

1. un `<p>` de descripción bajo el `h1` **con texto distinto por término**;
2. una imagen de cabecera **con `src` distinto por término**;
3. un orden de tarjetas que no sea por fecha descendente;
4. una sección presente en un término y ausente en otro.

Cualquiera de las cuatro ⇒ **COLECCIÓN**, y la apuesta cae.

### Premisa sobre la práctica del repo (§la que ha fallado las últimas cuatro)

> **Que el veredicto `-T` del censo para `categoria` sea correcto.**

Y **no la doy por buena**: el censo (`censo-f34.mjs` L96) decide el régimen con
**UN solo marcador** —`et-tb-has-body` en el `<body>`—, y `CLAUDE.md` nombra
**dos** señales para `-T`: ese marcador **y** las secciones `…_tb_body`.
**Se deriva con las dos**, y si discrepan se publica la discrepancia en vez de
elegir.

---

## 2 · (b) `author` — ¿contenido propio o plantilla del tema con la lista dentro?

### Apuesta, escrita donde tiene riesgo

> **(b1)** La **ESTRUCTURA** del cascarón —qué secciones y qué clases existen—
> tiene **varianza CERO en las 6** ⇒ eso es **PLANTILLA**.
>
> **(b2)** Los **VALORES** dentro de esa estructura —foto, nombre, cargo, redes,
> biografía— **varían de instancia a instancia** ⇒ eso son **CAMPOS**.
>
> **(b3)** Por tanto el archivo `/author/` **NO es «la plantilla del tema con la
> lista dentro»**: el término trae contenido propio que no se deriva de sus
> miembros, y `author` es una **ENTIDAD con campos**, no una etiqueta.

### La sub-apuesta que sí es ciega, y es la que puede caer

Los tamaños en disco parten las 6 en dos grupos sin que yo haya abierto ninguno
salvo `irene`:

| grupo | términos | bytes |
|---|---|---|
| grandes | `edurne-ibarrola` · `irene` · `javier-fernandez` · `kunak` | 274 402 – 281 885 |
| **pequeños** | **`admin` · `mar_ramirez`** | **104 685 – 106 943** |

> **Apuesto a que la diferencia de ~170 KB es LA LISTA DE TARJETAS, y que los
> dos pequeños conservan la cabecera de autor entera** (foto, cargo, redes,
> bio).
>
> **Refutación:** que a `admin` o a `mar_ramirez` les falte alguna de esas
> piezas. Si les falta ⇒ los campos son **opcionales**, y eso **cambia el
> esquema**, no sólo el veredicto (§*un campo opcional no expresa un caso: sólo
> permite que falte*).

### Premisa sobre la práctica del repo — **y ésta la doy por SOSPECHOSA de antemano**

> La mesa y el encargo dicen **régimen `--` en 6/6**, y el encargo apoya en eso
> su promesa mayor: *«cierra un SIN PROBAR de `CLAUDE.md` en todo el repo»*.

**Predigo que esa premisa no se sostiene**, y el motivo es del mismo tipo que la
premisa de (a): el censo la derivó con **un solo marcador**. Al orientarme vi en
el cuerpo de `irene` secciones `et_pb_section_1_tb_body` **con el `<body>` sin
`et-tb-has-body`** — o sea **las dos señales de `-T` en desacuerdo dentro del
mismo documento**.

> **Predicción explícita:** el censo clasificó `author` como `--` mirando el
> `<body>`, y el marcado de sección dice `_tb_body`. Si se confirma, **estas 6
> NO contestan el SIN PROBAR del régimen `--`**, y hay que decirlo en vez de
> entregarlo — §*una regla derivada sobre un dominio donde el caso NO SE DA está
> SIN PROBAR para ese caso*, con el dominio equivocado por el instrumento.

**Y el otro lado de la comprobación retroactiva** (§*se enmarca en las DOS
direcciones*): la pregunta simétrica es **«¿está el veredicto NUEVO
sobre-generalizado?»** — es decir, si resultara `-T`, ¿arrastra eso a
`categoria` y a `sector`, que el mismo censo clasificó con el mismo marcador
único? **Las dos preguntas se contestan con el mismo barrido**, y las dos se
escriben aquí antes de mirar.

### La extensión a casos y FAQ

`CLAUDE.md` dice **57 casos y 19 FAQ** en régimen `--`. **No se citan: se
derivan.** Predicción: **al menos una de las dos cifras no casa** con lo que hay
en disco hoy — no por descuido, sino porque un cardinal escrito en prosa
envejece **contra** el repo (§regla 9). Y **cada cifra se declara con su
alcance por separado**, sin sumar denominadores.

---

## 3 · (c) El `href` a `/author/` que el clon sirve HOY

**La pregunta de fidelidad:** las 152 entradas de blog enlazan a `/author/`.
¿Qué sirve el clon en ese `href`?

### Apuesta

> **152 de 152 conservan la URL ABSOLUTA del original**
> (`https://kunakair.com/es/author/…`), **0 apuntan a una ruta local**.

### Mecanismo

§*Regla de rutas locales*: *«si el destino ya está clonado, el `href` va a la
ruta local; si no, se deja apuntando al original hasta que se clone»*. `/author/`
**no está clonado** — no aparece en la tabla de «Páginas clonadas» ni tiene
`page.tsx` —, luego lo correcto es que siga absoluto.

### El fork real, y por eso esto no es trivial

**T7 reescribe los enlaces internos del cuerpo rico al importar.** Si T7 casa
`/es/author/…` como «interno», los 152 `href` habrán pasado a rutas locales que
**el build no emite** ⇒ **152 enlaces rotos vivos**, y eso se ficha con su
cardinal en vez de cerrarse en verde.

> **Y la consecuencia sobre la decisión, que es para lo que se mide:**
> «COLECCIÓN sin archivo» sólo queda limpia si el `href` es absoluto. Si es
> local, la opción **crea** enlaces rotos y deja de ser gratis.

### Premisa sobre la práctica del repo

> Que **`corpus/transformado/entradas-blog/*.html` sea lo que el clon sirve**, y
> no una fase intermedia que otro paso vuelve a tocar.

**Se deriva**, no se supone: hay que ver **quién lee ese directorio** y si entre
él y el render queda alguna transformación más. Si queda, el barrido mide **la
fase que midió**, y así se declara.

---

## 4 · LOS CONTROLES QUE LLEVA EL BARRIDO (§regla 8 · un negativo sin control no es un negativo)

| # | control | qué demuestra |
|---|---|---|
| C1 | el extractor de cuerpo **discrimina**: dos términos distintos dan cuerpos distintos | que un «idéntico» no lo fabrica un extractor que devuelve vacío |
| C2 | el detector de régimen **separa**: casa las DOS señales por separado y publica las dos columnas | que un `--` no es un selector que no casa (§sondas 4) |
| C3 | el buscador de `href` **casa un caso conocido de antemano** | que un 0 no es un filtro roto — el error que la 115.ª cometió sobre su propio `grep` |
| C4 | todo cardinal se publica **con su unidad y su denominador** | que no se comparen páginas contra familias (§dos lecturas con el mismo cardinal) |

---

## 5 · LO QUE ESTA TANDA NO VA A CONTESTAR, ESCRITO ANTES

- **el eje COMPORTAMIENTO** (0/31): un orden o un filtro montado en JS no deja
  rastro en el HTML servido. Las dos separadoras se contestan **sobre el HTML
  servido**, y eso acota el veredicto;
- **el CSS servido como séptimo canal**: una regla podría esconder tarjetas por
  clase de término. No entra;
- **el bucle de `mineria`**: necesita red;
- **la geometría computada**: sin navegador y sin las hojas enlazadas, medir
  `getComputedStyle` daría una medida **plausible y falsa** (§F3-1-CSS-NO-
  CAPTURADO: 678.52 contra 430.80). La varianza entre instancias se lee del
  **marcado y del `<style>` en línea**, que es el canal que la 114.ª demostró
  suficiente — y eso se declara como **alcance**, no como equivalencia.
