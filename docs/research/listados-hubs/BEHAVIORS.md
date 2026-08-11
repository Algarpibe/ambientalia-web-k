# BEHAVIORS — listados y hubs (`P-LH-C6`)

> **2026-08-10.** La pasada de comportamiento que `LH-2` §D5 dejó pre-registrada
> como **precondición de LISTADO-B**: *hover de tarjeta · si la paginación
> navega por enlace o por AJAX · lazy de las imágenes de tarjeta · el orden de
> entradas entre dos cargas.* Sonda: **`npm run qa:comportamiento`**
> (`scripts/qa/comportamiento.mjs`), congelada en
> `medidas/comportamiento-1440.json`.
>
> **Alcance declarado, porque un eje es propiedad de lo medido y no del sitio:**
> **9 formas** de listado (una por cada una de las de `lh-tarjetas`) **a 1440**,
> lado del original; el lado del clon **se pide y se registra** —las 9 dan
> **404**, no están construidas—. Los otros dos anchos y las 26 instancias
> restantes de L1 **no entraron**.

## 0 · Lo que este documento puede afirmar y por qué

Este eje llevaba **0/31** en `COBERTURA-MEDICION.md` desde que la matriz existe.
No por descuido: las dos sondas de comportamiento anteriores —`a-behaviors` y
`c-behaviors`— **solo abren el original**, y censar un lado no es comparar dos.

Y hay una segunda razón, que es la que obligó a escribir instrumento nuevo en
vez de reutilizar:

> **Una interacción que NO SE DISPARA da exactamente la misma lectura que una
> que se dispara y no tiene efecto.** Las dos escriben «0 cambios».

Es el `switch` sin `default` de F3-1 con otro disfraz (`CLAUDE.md` §sondas,
regla 6): no falla, no pinta, no avisa. Sin cerrar eso, **el eje entero saldría
verde midiendo nada** — que es exactamente cómo se llega a 0/31 sin que nadie lo
note.

Por eso cada interacción lleva un **control positivo**: una evidencia de que el
disparo ocurrió, **independiente del efecto que se mide**. Y el veredicto tiene
**cuatro** valores, no dos:

| veredicto | qué es | ¿cuenta como unidad evaluada? |
|---|---|---|
| `EFECTO` | disparó y cambió algo **que pinta** | sí |
| `SIN EFECTO` | disparó y no cambió nada — **es una medida** | sí |
| `NO APLICA` | la precondición no está, **con su número** | sí |
| `NO SE DISPARÓ` | la precondición estaba y el disparo no llegó | **no** → la corrida sale roja |

`NO APLICA` y `NO SE DISPARÓ` son los dos que un informe perezoso funde en «no
pasó nada», y son opuestos: hecho del sitio contra fallo del instrumento.

**Los controles, uno por tipo:**

| tipo | control positivo |
|---|---|
| `hover` | `elementFromPoint` devuelve la diana **antes** de mover + llegó un `pointerover`/`mouseover` **`isTrusted`** cuyo `target` cuelga de la diana + `diana.matches(":hover")` |
| `click` | el mismo, y el evento viaja por **canal de consola** — el efecto que se mide *es* una navegación, así que el canal normal muere justo cuando habría que leerlo |
| `scroll` | `scrollY` 0→>0 + eventos `scroll` contados + una imagen que estaba bajo el pliegue entra en el viewport |
| `tiempo` | un `setTimeout` **de la página** puso su marca y `performance.now()` avanzó ≥0.9·N |
| `carga` | la cabecera `date` **difiere** entre respuestas (`cf-cache-status: DYNAMIC`) — o sea que contestó el origen, no una caché |
| `filtro` | `click` `isTrusted` en la diana, sin navegación |

Test en negativo **5/5** (`npm run qa:comportamiento-neg`), cada sabotaje por su
propio discriminador y **con el control en verde** — sin él, cuatro rojos no
probarían nada (§sondas, regla 8a).

## 1 · Las cuatro preguntas de LH-2 §D5, contestadas

### (a) Hover de tarjeta — **existe, es `scale(1.1)` sobre la MEDIA, y es ZONAL**

| forma | efecto medido al hover |
|---|---|
| **L1-resources** (padre e hijo) | `img.attachment-large` · `transform: none → matrix(1.1,0,0,1.1,0,0)` — la caja pasa de `440×293.2` a `484×322.5` |
| **L4-listado-embebido** | idéntico: `scale(1.1)` sobre el `<img>` |
| **L5-casos** | `a.case-imagen` · `scale(1.1)` — mismo factor sobre el `<a>` con `background-image`, porque la tarjeta de caso no tiene `<img>` |
| **L3-sci** | **otro efecto**: `div.scientific-imagen-container` · `backgroundColor: #f7f7f7 → #f0f0f0` |
| **L2** (glosario · faqs) | **SIN EFECTO** — la tarjeta es solo-título, no tiene media que ampliar |
| **L1-blog · L1-etiqueta** | `scale(1.1)` sobre el `<img>` **cuando el puntero cae en la imagen**; con el puntero en la meta, lo que cambia es `a.noticias · color: #666 → #0075C9` |

> ⚠ **Y ese último renglón es el hallazgo de método: el hover de una tarjeta NO
> ES UNO.** Dos corridas de esta misma sonda sobre `L1-blog` dieron cosas
> distintas porque el punto de disparo cayó en zonas distintas de la misma
> tarjeta — imagen contra meta—, y **las dos son ciertas**. Una sonda que apunta
> «al centro de la tarjeta» está eligiendo una respuesta sin decirlo.
>
> Corregido declarando la zona: `AFOR=<selector> ETIQUETA=<nombre>` mide otra
> zona **y exige nombre propio para la congelada**, para que una medida de la
> meta no pueda pasar por «el hover de la tarjeta». La corrida canónica apunta a
> la tarjeta; la de la zona de imagen va aparte.
>
> **Consecuencia para LISTADO-B:** el zoom de imagen y el color del enlace de
> categoría son **dos reglas distintas** con dianas distintas, y hay que
> construir las dos. Una plantilla que ponga `article:hover img {scale:1.1}`
> reproduce el píxel a 1440 y **cambia el disparador**.

> ✅ **CERRADO 2026-08-11 — el disparador tiene nombre, y lo dio otro
> instrumento.** `npm run qa:hover-zonal` (negativo 4/4) lee el **CSS SERVIDO**
> —los `<style>` y las **7–14 hojas externas**, 41 185 reglas en las 9 formas— y
> encuentra la regla, que es lo que ninguna cantidad de hover podía dar:
>
> | forma | lo que se construye |
> |---|---|
> | **L1** (blog · etiqueta · resources) **y L4** | `.et_pb_post .entry-featured-image-url:hover img { transform: scale(1.1) }` — dispara el **`<a>` que envuelve la imagen destacada**, se amplía el `<img>` de dentro |
> | **L5-casos** | `.case-list-content article .case-imagen:hover { transform: scale(1.1) }` — dispara **y se amplía el mismo `<a>`** (la tarjeta de caso no tiene `<img>`: la imagen es su `background-image`) |
>
> **Por qué el hover no podía cerrarlo, y conviene saberlo para la próxima:** el
> comportamiento ya había **excluido `article`** (puntero en la meta ⇒ la imagen
> no se mueve), pero separar `a:hover img` de `img:hover` **no lo hace ningún
> píxel** — las dos cajas coinciden en pantalla. El discriminador estaba
> **servido**, que es la lección de F3-1 (`CLAUDE.md` §El principio) aplicada a
> un eje nuevo.
>
> **Y el cruce cerró en las dos direcciones:** los 4 zooms medidos tienen los 4
> su regla (`efectos medidos SIN regla = 0`), y **L1-blog y L1-etiqueta SIRVEN la
> regla aunque su corrida canónica no midiera zoom** — porque el puntero cayó en
> la meta. Las dos corridas que parecían contradecirse las explica el mismo CSS.

**El factor es 1.1 exacto y se repite en cuatro formas** (`440→484` = ×1.1,
`293.2→322.5` = ×1.1, `357.3→393` = ×1.1). Eso es plantilla, no campo.

### (b) La paginación **navega por enlace real. NO es AJAX.**

Medido pulsando el enlace a `/page/2/` con el ratón, en las formas que paginan:

| forma | mecanismo | `defaultPrevented` |
|---|---|---|
| L1-blog · L1-etiqueta · L1-resources-hijo · L2-glosario · L2-faqs | **ENLACE REAL — navegación del navegador** | `false` en las 5 |

`defaultPrevented: false` es la mitad que lo cierra: **nadie intercepta el
click**, así que la navegación la hace el `<a>`. Es la confirmación que `D2.3`
necesitaba —*las rutas `/page/N/` se derivan en build*— porque una paginación
AJAX habría exigido además un punto de entrada de datos.

**Y hay TRES pieles de paginación**, censadas en el corpus congelado de F3-0 y
alineadas 1:1 con las tres variantes de tarjeta de `D1`:

| piel | markup | quién la usa |
|---|---|---|
| A | `div.wp-pagenavi[role=pagination]` con `a.page-numbers` y `a.next.page-numbers` | **L1-blog** |
| B | `div.wp-pagenavi[role=navigation]` con `span.pages` («Page 1 of 4»), `a.page.larger`, `a.nextpostslink`, `a.last` | **L1-etiqueta · L2** |
| C | `nav.kunak-pagination > ul.page-numbers > li > a.page-numbers` | **L1-resources** |

> La piel B **imprime el total de páginas en el propio HTML** (`span.pages`).
> Es una fuente independiente para `P-LH-C3` que no cuesta una petición por
> página, y no estaba anotada en ningún sitio.

### (c) Las imágenes de tarjeta **no se cargan de forma diferida**

| forma | `<img>` en tarjeta | con `loading="lazy"` | bajo el pliegue | **sin cargar antes de scrollear** | **Δ al scrollear** |
|---|---|---|---|---|---|
| L1-blog | 8 | 0 | 6 | **0** | **0** |
| L1-etiqueta | 9 | 0 | 6 | **0** | **0** |
| L1-resources-hijo | 15 | 0 | 12 | **0** | **0** |
| L1-resources-padre | 3 | 0 | 0 | **0** | **0** |
| L2 · L3 · L5 | 0 (`background-image`) | — | — | — | — |
| **L4-listado-embebido** | 3 | **3** | 3 | **0** | **0** |

Con el control de scroll en verde en las 9 (scrollY 0→>0, eventos contados,
imágenes entrando en viewport), o sea que el «0» es *«se scrolleó y no hizo
falta pedir nada»*, no *«no se scrolleó»*.

**Alcance de esta afirmación, y hay que decirlo:** la lectura pristina se toma
tras `networkidle2`, y el umbral de carga perezosa de Chrome es generoso. Lo que
está medido es: **al terminar la carga de red, las imágenes de tarjeta ya están
todas presentes, y scrollear no pide ninguna más.** Para construir LISTADO-B eso
es lo que importa — no hace falta maquinaria de carga diferida para ser fiel—;
lo que **no** está medido es el comportamiento con red lenta.

**El atributo sí es dato de markup:** `loading="lazy"` aparece en **3 de 3**
imágenes de tarjeta de L4 y en **0** de las demás.

### (d) El orden entre cargas **no varía** — con su cota, no con un titular

10 peticiones por forma, caché deshabilitada, `date` distinto en las 10 (control
positivo: contestó el origen):

| forma | entradas | órdenes distintos en 10 cargas |
|---|---|---|
| L1-blog | 9 | **1** |
| L1-etiqueta | 9 | **1** |
| L5-casos | 57 | **1** |

> ⚠ **No se escribe «el orden es estable»: se escribe la COTA.** Cero eventos en
> 10 cargas ⇒ al 95 % (regla de tres) **< 30 % por carga**. Una tasa menor sigue
> cabiendo. Es la misma disciplina que `estados-390` (`CLAUDE.md` §ruido): *no
> encontrar nada y no mirar nada dan la misma salida*, y un cero de muestreo
> acota, no cierra.

**Lo que sí queda resuelto para `LH-SP3`:** los listados **no se comportan como
el módulo «Artículos y Guías» de la HOME** (P4, que sortea 3 posts en cada
carga). Así que el QA px a px de listados **no necesita congelar contenido** por
esta causa — con la cota puesta.

## 2 · Lo que la pasada encontró y NO estaba en el plan

### 2.1 · `casos-de-exito` (L5) tiene un **FILTRO DE CLIENTE por sector**

**12 `<button data-filter=".sector-*">`** dentro de `div.case-filter > #filters.button-group`,
con `h2.case-filter-title` = «Sectores» y `button.is-checked` marcando el activo.
Medido pulsando el segundo:

| | |
|---|---|
| mecanismo | **FILTRO DE CLIENTE** — oculta tarjetas **sin recargar y sin cambiar la URL** |
| tarjetas visibles | **57 de 57 → 3 de 57** |
| `is-checked` | `*` → `.sector-edar` |
| control | `click` `isTrusted` en la diana, sin navegación |

**Y esto toca el modelo**, así que se ficha y **no se reescribe `DECISIONES.md`
sobre la marcha** (`PENDIENTES-QA.md` §LH-C6-FILTRO-L5).

### 2.2 · `L3` (`scientific-category`) **pagina por URL y NO SIRVE CONTROL DE PAGINACIÓN**

`lh-paginas` mide **3 páginas** en `articulos-cientificos-y-estudios` (2 en
`evaluaciones-independientes`, 1 en `articulos-tecnicos`). El cuerpo servido
**no trae ninguna de las tres pieles**: el único rastro de `/page/2/` en todo el
documento es el `<link rel="next">` que pone Yoast **en el `<head>`**.

O sea: **desde la página 1 no se puede llegar a la 2 pulsando nada.** El
veredicto de la sonda fue `NO APLICA` con su número —*«no se encontró enlace a
/page/2/ (la sonda dice que pagina: 3 páginas)»*—, que es la forma en que dos
medidas congeladas se contradicen en voz alta en vez de en silencio.

Ficha: `PENDIENTES-QA.md` §LH-C6-L3-SIN-PAGINADOR.

### 2.3 · El único control de formulario de los listados es el **buscador del sidebar**

Enumerados **todos** los `form · select · input · button · [role=tab] ·
[aria-controls]` de la raíz de contenido, en las 9 formas:

| forma | controles |
|---|---|
| L1-blog · L1-etiqueta · L2-glosario · L2-faqs | `form` + `input[name=s]` + `input` — **el widget de búsqueda de WordPress** |
| L1-resources (×2) · L3 · L4 | **ninguno** |
| L5-casos | **12 `button`** (el filtro de 2.1) |

**No hay ningún control de ORDEN en ninguna de las 9.** Y esa afirmación se
sostiene porque se **enumeró lo que aparece** en vez de preguntar por un
selector nombrado: un `select[name=orderby]` habría dado cero, y un cero se lee
igual esté el selector bien o mal escrito (`CLAUDE.md` §sondas, regla 4).

### 2.4 · Ningún listado tiene slider, acordeón, pestañas ni vídeo

`{slider: 0, acordeon: 0, pestanas: 0, video: 0}` en las **9**. Y el tipo
`tiempo` da **0 mutaciones en el contenido** en 8 de 9 (la excepción es L1-blog
con 1, dentro del ruido de un sitio vivo). **Los listados son estáticos salvo
por hover, paginación y —en L5— el filtro.**

## 3 · Lo que NO se midió, dicho aquí

- **390.** El catálogo se declara **por ancho** y a 390 **no incluye `hover`**:
  bajo emulación táctil el `:hover` no es la misma interacción, así que medirlo
  ahí no es «lo mismo más estrecho», es otra pregunta.
- **Las otras 26 instancias de L1.** Se midió **una por forma**, que es lo que
  `lh-tarjetas` estableció que basta para la proyección (la fija la plantilla,
  no la instancia) — pero para *comportamiento* eso es una hipótesis heredada,
  no una medida.
- **El suelo de ruido de este eje no existe.** Ninguna campaña lo ha medido, así
  que un `SIN EFECTO` aislado es **SIN PROBAR**, no *limpio*. Se vio en vivo: el
  mismo `tiempo` sobre `/monitor-calidad-aire` dio **29** mutaciones en una
  corrida y **1** en la siguiente.
- **El lado del clon de los listados.** No existe: las 9 dan **404**. Eso está
  medido (no supuesto) y es exactamente lo que `F3-2` viene a construir.

> ⚠ **AÑADIDO 2026-08-11 — y esta lista NO lo tenía, que es el punto: el
> arquetipo MONOGRÁFICO se había quedado en CERO rutas, y el `13/37` no podía
> decirlo.**
>
> El alcance se declaró como *«una ruta por familia del manifiesto»*, y es
> literalmente cierto: `comportamiento.mjs` agrupa por **`srcRoute`** y hay 13.
> Pero `COBERTURA-MEDICION.md` reporta por **ARQUETIPO** y tiene **10 familias**,
> y las dos particiones no coinciden: **`/sectores/[slug]` es un `srcRoute` que
> sirve DOS arquetipos** (§Páginas clonadas de `CLAUDE.md`). Tomar «la primera de
> cada `srcRoute`» eligió la de SECTOR, y MONOGRÁFICO se quedó a **0 de 2**.
>
> **Es la firma de siempre: dos variables que dentro del instrumento van
> juntas.** `srcRoute` y arquetipo coinciden en 8 de las 10 familias, así que la
> palabra «familia» tapó la diferencia — y el arquetipo que cayó por el hueco es
> justo el que este repo ya sabe que esconde los defectos de los componentes que
> comparte con SECTOR (el **−36.02** del `h1`, que los 4 sectores no podían
> enseñar).
>
> **Cerrado midiendo, no reinterpretando** —
> `TODAS=1 SOLO=monitorizacion ETIQUETA=monografico`, **5 rutas × 2 lados,
> 70/70 con disparo confirmado, 0 selectores muertos**, congelada en
> `medidas/comportamiento-1440-emitidas-monografico.json`. El eje pasa de
> **13/37 a 18/37** y ninguna familia de la matriz queda a cero.

> ✅✅ **Y EL 2026-08-11 SE ACABA LA PREGUNTA: `TODAS=1` sobre el universo
> entero — 37/37.** `518/518` interacciones con disparo confirmado, `NO SE
> DISPARÓ 0`, **5 selectores vivos y 0 muertos** en las 74 páginas. Congelada:
> `medidas/comportamiento-1440-emitidas-todas.json`.
>
> **Lo que cambia no es sólo el número: es que ya no hay partición que
> declarar.** «Una ruta por familia» era la frase que escondió MONOGRÁFICO, y
> escondía porque `srcRoute` y ARQUETIPO son dos particiones distintas que suenan
> igual. Con las 37 medidas **las dos coinciden porque no queda nada fuera de
> ninguna**, y el alcance se dice sin adjetivos: *las rutas que el build emite,
> a 1440*.
>
> ⚠ **Sigue siendo 1440 y sigue sin suelo.** Cobertura completa **no es** ruido
> conocido, y esta lista de §3 sigue en pie en todo lo demás.
