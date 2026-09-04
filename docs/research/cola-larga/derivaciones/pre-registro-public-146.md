# PRE-REGISTRO · 146.ª ESCALÓN 1 — QUÉ SON LOS 661 MiB DE `apps/web/public`

**Escrito ANTES de medir el solape y el alcance.** Commiteado antes del
ESCALÓN 2, que es la única cosa que hace que una predicción valga algo
(§*un pre-registro protege de decidir por cansancio*).

Base derivada: `derivaciones/paso0-146.json`, HEAD `4909da2`.

---

## Lo que el PASO 0 ya dejó FIJO, y por tanto no se predice

No son predicciones: están medidas y se citan para que se vea sobre qué se
predice.

| dato | valor derivado |
|---|---|
| `apps/web/public` rastreado | **2 755 ficheros · 661.14 MiB** |
| `media/` en disco | **3 418 ficheros · 304.36 MiB** |
| `media/` rastreado en git | **0** — `.gitignore:61` |
| lo rastreado ENTERO (= el tarball) | **7 675 ficheros · 1 825.77 MiB** |
| de eso, excluido de Docker pero en el tarball | **1 146.87 MiB · 4 628 f** |
| `.dockerignore` excluye `public/` | **no** |
| `Dockerfile:137` copia `public/` a la imagen | **sí** |
| `docker-compose.yml:39` monta | **sólo `.next`, `:ro`** |
| `publicador.mjs` toca `public/` | **0 líneas de código** |

---

## P1 · ¿CUÁNTOS DE LOS 2 755 FICHEROS DE `public/` SON LOS MISMOS QUE LOS UPLOADS DE `media/`?

### Criterio de identidad — POR HASH, y del contenido

**SHA-256 del contenido del fichero**, no el nombre ni el tamaño. Un fichero de
`public/` "es el mismo" que uno de `media/` si y sólo si existe en `media/`
algún fichero con su mismo digest.

Y se publican **los dos cardinales**, no su resta (§*un cardinal es un
contenedor y absorbe la membresía*):

- `public/` **con hash presente en `media/`** → el solape;
- `public/` **sin hash en `media/`** → lo que CMS-0b no disuelve;
- y, del otro lado, `media/` **sin hash en `public/`** → lo que `media/` tiene
  de propio.

⚠ Y el hash se calcula sobre **los bytes del disco**, que es lo que Docker
copia, no sobre el blob de git. El PASO 0 midió que difieren en 2 ficheros.

### El CONTROL, sin el cual un comparador roto da 0 solape y parece una medida (§regla 28c)

**Dos testigos, uno por polaridad, elegidos y NOMBRADOS antes de correr:**

1. **testigo POSITIVO** — un fichero que tiene que salir EN el solape. Se
   elige derivándolo: el primer fichero de `media/` cuyo `basename` exista
   también bajo `public/images/uploads/` **y cuyo tamaño coincida**. Si el
   comparador no lo encuentra, el comparador está roto y la corrida no
   adjudica;
2. **testigo NEGATIVO** — un fichero que tiene que salir FUERA. Un `.woff2`
   de `public/fonts/`: las fuentes no son uploads de Payload y no pueden
   estar en `media/`. Si sale dentro, el comparador está casando de más.

Con los dos vivos, el número significa algo. Sin ellos, no.

### PREDICCIÓN

> **Solape por hash: entre 550 y 900 ficheros de los 2 755, y entre 90 y
> 200 MiB.**

**El razonamiento, para que la predicción sea falsable y no un rango cómodo:**

- Payload genera variantes con `sharp` a partir del original. Las variantes
  **no pueden** coincidir por hash con nada de `public/` salvo casualidad:
  son bytes nuevos producidos por otro codificador;
- el esquema declara **4 `imageSizes`** (1080×675 · 1024×683 · 980 · 480,
  §CMS-0b/M-IMG), así que un upload de imagen produce **1 original + hasta 4
  variantes**. `3 418 / 5 ≈ 684` originales;
- de esos originales, los que además estén colocados en `public/` por
  `cms:coloca-media` **sí** deberían coincidir al bit, porque la campaña
  copia, no re-codifica;
- pero `public/` tiene además fuentes, vídeos, SVG del tema, y assets de
  `seo/` que nunca fueron uploads.

De ahí el rango: el techo son los ~684 originales, el suelo es que una parte
de ellos se re-codificara al subir.

**Y en MiB el rango es más bajo que en proporción de ficheros**, porque los
vídeos —que son lo pesado de `public/`— no son uploads de Payload.

### La separadora, que es lo que decide si la respuesta sirve de algo

> **Si el solape es alto, buena parte de la pregunta la disuelve CMS-0b.**
> Concretamente: los ficheros solapados podrían servirse desde el volumen
> persistente en vez de desde el repo. Pero eso **exige que el `src` que el
> HTML emite apunte a `/api/media/…` y no a `/images/…`**, y eso **no está
> medido**. Si el HTML los pide por `/images/…`, quitarlos de `public/` los
> rompe aunque estén en `media/`: mismo byte, otra URL.
>
> **Predicción sobre la separadora: el HTML los pide por `/images/…`, así
> que el solape por hash NO basta para moverlos** — hace falta además que el
> render cambie de canal. Lo mido en el ESCALÓN 2 junto con P2.

---

## P2 · ¿CUÁNTOS DE ESOS FICHEROS LOS REFERENCIA UNA RUTA QUE EL BUILD EMITE?

### Cómo se mide, con §regla 61 puesta

El encargo avisa: *«que el `src` esté bien no significa que el fichero esté»*.
Aquí la dirección es **la contraria** y hay que decirlo, porque son dos
preguntas distintas y sólo una es la de P2:

- **§regla 61** pregunta: de los `src` citados, ¿cuántos tienen fichero
  detrás? Detecta assets rotos;
- **P2** pregunta: de los ficheros que hay, ¿cuántos cita alguien? Detecta
  **arrastre**.

Son la diferencia simétrica del mismo emparejamiento, y **se publican los dos
lados** (§*un cardinal es un contenedor*): `citados-sin-fichero` y
`ficheros-sin-citar`.

**El canal**: el HTML **prerenderizado** que el build ya dejó en
`apps/web/.next/server/app/**/*.html`, más los `*.rsc`/payload donde el
contenido no esté en el HTML. Se lee de disco, **sin levantar servidor y sin
construir** — el encargo prohíbe tocar el build mientras haya sondas y esta
tanda es expediente. Se declara el `mtime` del build leído y el `BUILD_ID`.

⚠ **Limitación que se declara ANTES, con su número** (§regla 14): un asset
citado **sólo por CSS** (`url(...)` en una hoja) o **sólo por JS** no aparece
en el HTML. Se buscará también en los `.css` y `.js` emitidos, y **los tres
canales se publican por separado con su cardinal**, porque un cero en uno de
ellos no es un cero del conjunto.

### PREDICCIÓN

> **Alcanzables: entre 700 y 1 300 de los 2 755. Arrastre: entre 1 450 y
> 2 050 ficheros, y más del 70 % de los MiB.**

**El razonamiento:**

- `public/images/uploads/AAAA/MM/` reproduce el árbol de WordPress del
  original, y `download-assets.mjs` bajó **lo que el original referenciaba en
  el momento de la captura**, no lo que el clon emite hoy. El clon emite hoy
  **~426 rutas** (derivado del `prerender-manifest` en tandas anteriores);
- WordPress sirve cada imagen en varios tamaños (`-150x150`, `-300x200`,
  `-1024x683`…) y el clon usa **uno**, así que por cada imagen viva hay varias
  descargadas que nadie pide;
- las fuentes, los SVG del tema y `seo/` **sí** se citan casi todos;
- los vídeos pesan mucho y son pocos: si alguno no se cita, el porcentaje de
  MiB de arrastre sube de golpe. De ahí que la predicción en MiB sea más alta
  que en ficheros.

---

## P3 · CON EL MODELO B APLICADO, ¿SIGUE `public/` EN EL CAMINO DE DESPLIEGUE?

### PREDICCIÓN: **SÍ, pero no en el que el encargo teme — y hay que partirlo en tres caminos, no uno**

El PASO 0 ya leyó los tres ficheros que lo deciden. La predicción es qué se
verá al comprobarlo **contra el artefacto**, no contra la receta (§El
principio):

| camino | ¿pasa `public/`? | frecuencia | predicción |
|---|---|---|---|
| **cada PUBLICACIÓN** (build fuera + `docker restart`) | **NO** | por cada *Publicar* | el volumen es sólo `.next`; el publicador no toca `public/` en 0 líneas de código. `public/` se sirve **desde la imagen** |
| **construcción de la IMAGEN** | **SÍ** | **una vez** con B (frente a *cada publicación* con A) | `public/` no está en `.dockerignore` y `Dockerfile:137` lo copia. Predicción: los 2 755 ficheros están dentro de la imagen |
| **traer el REPO al host** | **SÍ** | una vez, y en cada `git pull` | con B quien construye es el publicador **en el host**, así que el host necesita el árbol. Predicción: **el tarball deja de estar en el camino sólo si el host usa `git clone`/`pull` en vez del tarball de Easypanel** — y eso es una decisión de despliegue que **CMS-10 no tomó** |

### La distinción que el encargo pide, predicha

> **El fallo del `tar -xz` NO desaparece solo al aplicar B.** B cambia *quién
> construye* y *con qué frecuencia viaja la imagen*; **no cambia cómo llega
> el código al VPS**. Si Easypanel sigue trayendo el árbol por tarball de
> GitHub, el mismo tarball de ~1 826 MiB rastreados sigue en el camino —
> ahora una vez en vez de en cada deploy, que es una mejora de frecuencia,
> no de causa.
>
> **Predicción de mecanismo del fallo original:** `gzip: unexpected end of
> file` sobre un archivo grande servido por `codeload.github.com` es un
> **corte de transferencia**, no un archivo corrupto en origen. Si es eso, el
> mismo tarball descargado con reintentos o por `git clone` llega entero.
> **Se mide descargándolo y comprobando su integridad**, que es la única cosa
> que distingue *«GitHub sirve un archivo roto»* de *«la descarga se cortó»* —
> y las dos producen exactamente el mismo mensaje de `tar`.

### Y lo que la predicción dice que NO hay que hacer

Si el mecanismo es el corte de transferencia, **encoger `public/` es un
arreglo por magnitud, no por causa**: baja la probabilidad del corte sin
cerrarlo, y deja el 62.8 % del tarball —`media-corpus`, `scripts`, `corpus`—
intacto. Eso importa para el reparto del ESCALÓN 3.

---

## Lo que este pre-registro NO contesta, declarado (§*escribe QUÉ PREGUNTA CONTESTA Y QUÉ PREGUNTAS NO*)

1. **si el VPS puede hacer `git clone`** — no se mide: la tanda no toca el VPS;
2. **si `media/` está poblado en destino** — `media/` es local y no viaja;
3. **cuánto pesa el tarball COMPRIMIDO** — se medirá en el ESCALÓN 2, y no es
   deducible de los 1 825.77 MiB rastreados: la mayor parte son JPEG/PNG/MP4
   ya comprimidos, que gzip no encoge, pero `scripts/qa/medidas` son **JSON**,
   que encoge mucho;
4. **el coste de reescribir el historial de git** — se estimará, no se hará.
