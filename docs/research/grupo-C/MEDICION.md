# MEDICIÓN de C-3 — la entrada pre-registrada, cobrada

> **2026-07-30**, al abrir C-3. Todo lo de aquí sale de dos sondas nuevas
> (`c-cascaron.mjs`, `c-spec.mjs`) con su salida congelada en
> `scripts/qa/medidas/`. Las decisiones que cita son las de `DECISIONES.md`;
> el modelo, `MODELO.md`; el destino, `docs/ESQUEMA-CMS.md` §2b.
>
> Se mide **antes** de escribir componente porque eso es literalmente lo que
> pide P-C3-2, y porque es la lección del monográfico: allí ocho propiedades no
> se veían en la primera página y las ocho eran campo.

---

## 0 · Línea base del clon, antes de tocar nada

`npm run qa:clon-base -- {1440,390} c3-antes`, build limpio desde HEAD
(`f444b11`), `.next` borrado, servidor levantado por puerto.

| fichero | qué congela |
|---|---|
| `medidas/clon-base-1440-c3-antes.json` | las 11 rutas a 1440: `docH`, `h1`, árbol de secciones, anclas |
| `medidas/clon-base-390-c3-antes.json` | las mismas a 390 |

Es contra esto —umbral **cero**, clon contra clon— contra lo que se comprueba
que emitir rutas nuevas y tocar terreno compartido no mueve un píxel de las 11.

---

## 1 · P-C3-2 · el cascarón — **SE SOSTIENE**

Sonda `npm run qa:c-cascaron -- <ancho>`. **10 instancias**: 6 casos (los dos
prefijos) y 4 FAQ, elegidas adversarias y no cómodas — con galería y sin, con
dos términos de sector y sin ninguno, con soluciones y sin, con mapa y sin.

| ancho | ejes comparados | con varianza | veredicto |
|---|---|---|---|
| **1440** | 131 (67 caso · 64 FAQ) | **0** | ✅ |
| **390** | 131 | **0** | ✅ |

Los ejes son **ritmo** (margin/padding), **tipografía** (familia, tamaño, peso,
interlínea, `letter-spacing`, color, `text-transform`, `text-align`) y
**retícula** (anchos de contenedor y reparto de columnas), en cabecera, migas,
`main-title`, sobretítulo, `h1`, cliente, chip, los tres bloques, detalles,
mapa, soluciones y las cuatro secciones del pie.

**Lo que NO se juzga y por qué se dice**: los ejes `·alto` y `h1·y` dependen del
contenido —un caso con más texto mide más—, así que se vuelcan al JSON como
contexto y se excluyen del veredicto. Juzgarlos habría dado «varianza» en las
10 instancias y habría tapado la pregunta real.

**Las 4 ausencias que sí aparecen, y por qué no refutan**: los ejes de la
sección `soluciones` faltan en el caso del lindano, y `detalles.mapa` falta en
Río. Las dos son secciones que **el modelo ya declara opcionales**
(`soluciones?` 53/57, `ubicacionMapa?` 56/57), y donde existen valen lo mismo.
La sonda lleva esa tabla escrita dentro, con su cita: **toda ausencia que no
case con ella se cuenta y refuta**.

### ⚠ La sonda llegó con un defecto, y daba varianza donde no la había

La primera versión medía `entry-content-need > p` — **un nodo de dentro del
contenido rico**. Salieron tres ejes «con varianza»: `text-align` `start` vs
`justify` en los tres bloques. No era del cascarón: los `<p>` del corpus traen
`style="text-align: justify"` **escrito por el editor dentro del campo rico**,
que está por debajo de la frontera del contenedor de contenido
(`CLAUDE.md` §Dónde para el modelado de estructura). Medir ahí es medir el
contenido y llamarlo plantilla.

Es el error de nivel de `CLAUDE.md` en la dirección que no estaba escrita:
**medir MÁS abajo de donde vive la propiedad también invalida la medida**, igual
que medirla más arriba. Corregido a `.entry-content-bloque` —el contenedor, lo
que un `<p>` sin `style` hereda— y el inventario de esos `style` se sacó a un
canal aparte (abajo, §5).

**Test en negativo, corrido entero después del arreglo**
(`SABOTAJE=forma`, congelado en `medidas/c-cascaron-1440-sabotaje.json`): con
una FAQ colada entre los casos, la sonda da **52 ejes con varianza** y sale con
**1**, y cae por su propio invariante —migas ausentes, sobretítulo ausente, pie
de 3 en vez de 4— no por el cubo de ausencias declaradas. La corrida de
sabotaje **escribe en otro fichero**: la primera versión pisaba la salida
congelada con la falsa.

---

## 2 · P-C3-1 · la 4ª sección del pie — **SE SOSTIENE**, D5 no se reabre

Sonda `npm run qa:c-spec`, 4 casos, **6 pares**.

La sección se identifica **midiendo**, no por su índice: clases del pie del caso
menos clases del pie de la FAQ. Pie del caso **4** secciones, pie de la FAQ
**3**; la que sobra es `et_pb_section et_pb_fullwidth_section et_section_regular`
— el **slider CTA de ancho completo**, 3134 caracteres normalizados.

> **Idéntica byte a byte en los 6 pares.** Cero diferencias. Nada derivado del
> post. **D5 queda cerrada tal como se decidió: cero campos.**

Su contenido es 4 diapositivas, una por idioma, con `ocultar-{en,es,fr,ar}`; en
`/es/` la visible es «¿Necesitas información fiable para tu proyecto de calidad
del aire?» → «Podemos ayudarte» → `/es/contacto`.

### ⚠ La sonda contestaba a una pregunta que nadie hizo

Su primera versión comparaba **el pie entero** y daba «P-C3-1 REFUTADA» por una
diferencia de `footer-legal`, que es **otra sección**. Habría reabierto D5 sin
motivo. Es el mismo error de nivel del §1, otra vez: el veredicto tiene que
cubrir exactamente la propiedad de la que habla la predicción.

### Y lo que se vio de paso, fuera de P-C3-1

`footer-legal` **sí difiere entre casos**, en los 6 pares: es el conmutador de
idioma de **WPML**, cuyo `href` apunta a la URL de la página actual y cuya clase
`wpml-ls-last-item` baila. **No es campo del caso** —es mecanismo de servicio
del original— y el clon **ya no lo reproduce**: `LANGUAGES` (`src/lib/nav.ts`)
es una constante fija, igual para las 11 páginas ya clonadas. Se anota, no se
construye.

---

## 3 · P-C3-4 · las fichas de soluciones — **se sostiene en lo comparable**

De los 4 casos medidos, **2 `data-id` aparecen en más de un caso**
(`monitor-calidad-aire` y `software-de-medicion-calidad-del-aire`, en 3 casos
cada uno). Los dos dan la ficha **idéntica byte a byte** —etiqueta, subtítulo,
`h4`, imagen, `alt`, intro completa y CTA—: la ficha **es** proyección del
producto. **0 choques.**

Alcance honesto: esto no re-demuestra P-C3-4, que se apoya en el censo de C-2
(640 nodos de panel, 18 fichas, 17 títulos); confirma que en la muestra que se
va a construir no hay contraejemplo. El cierre completo llega cuando el bloque
esté renderizado desde `products.ts` y se compare con el original en las 4.

---

## 4 · Cinco SIN PROBAR cerrados

Salen del mismo HTML que la transcripción, así que no merecían corrida propia.

| # | pregunta | respuesta medida |
|---|---|---|
| **C-SP8** | contenido exacto de las migas | `Inicio > Casos de éxito > <título>`, tres niveles; el último sin enlace. **La del prefijo inglés apunta al índice ESPAÑOL** (`/es/casos-de-exito/`) — más evidencia para D2. La FAQ **no tiene migas** (0 niveles) |
| **C-SP9** | ¿`destacado` lleva marcado inline? | **SÍ.** Río trae `<strong>…</strong><br>` dentro. Y vive **dentro del contenedor del bloque `necesidad`, como su último hijo**, en las 3 que lo tienen |
| **C-SP10** | leyendas y `alt` de galería | **`leyenda` ausente en las 22 imágenes** de las dos galerías medidas. `alt` presente y **constante dentro de cada caso** (el mismo texto en las 7 de Des Moines y en las 15 de Río) → es del caso, no de la imagen |
| **C-SP12** | ¿el chip del detalle enlaza? | **SÍ**, un `<a href="/es/sector/<slug>/">` por término, y la fila «Sector(es)» de detalles lleva los mismos con `rel="tag"`. Confirma la proyección única de `sectores` |
| **C-SP6** | hosts de `iframe` del cuerpo | en la muestra: `www.youtube.com` ×2 · `player.vimeo.com` ×1 · **`kunakcloud.com` ×1** (dominio propio, un widget). **No es el censo**: el censo de los 11 casos con `iframe` sigue pendiente antes del import |

---

## 5 · CUATRO cosas que mueven el modelo, dichas en voz alta

Ninguna contradice una decisión de C-2: tres resuelven condiciones que C-2 dejó
escritas y una es un campo que el corpus del grupo C descubre en una colección
ajena. Van todas a `ESQUEMA-CMS.md` §2b en esta misma tanda.

### 5.1 · `destacado` NO es texto plano — es rico en línea

`MODELO.md` §1 dice «texto plano… Si lleva marcado inline no se sabe (C-SP9);
**mientras**, texto plano». C-SP9 ya está medida y **lleva marcado**:

```html
<strong>Eduardo Paes, alcalde de Río de Janeiro:</strong><br>
“Con esta iniciativa, Río demuestra liderazgo…”
```

→ **campo rico restringido a línea** (`strong`, `br`, texto), no `string`. La
condición la escribió C-2; esto la resuelve, no la contradice.

### 5.2 · `detalles.parametros` NO es texto plano — es rico

`MODELO.md` lo declara `parametros?: string`. La salida servida trae `<ul>`,
`<li>`, `<sub>`, `<b>` y `<p>` dentro:

```html
<li>CO, NO<sub>2</sub>, NO and O<sub>3</sub>.</li>
<li><b>Material particulado</b>: PM<sub>10</sub> y PM<sub>2,5</sub>…</li>
```

→ **campo rico**, con el mismo contrato del §3.1 (el `sub` ya está dentro: 139
páginas del arquetipo A lo usan para fórmulas químicas).

⚠ Y una **trampa de parseo** que costó una corrida: el original escribe
`<p><span>Parámetros:</span><br><ul>…</ul></p>`, y `<ul>` dentro de `<p>` es
HTML inválido — **el parser cierra el `<p>` antes del `<ul>`**, así que la lista
queda de **hermana**, no de hija. Con el selector ingenuo `.case-detalles-txt > p`
el campo salía **vacío**: un dato plausible, no un error. Es exactamente cómo
sobreviven los fallos de sonda.

### 5.3 · La FAQ tiene BARRA LATERAL, y el modelo no la mencionaba

`MODELO.md` §2 describe su cascarón como «cabecera + `h1` + cuerpo + pie
estándar». La salida servida trae además `et_right_sidebar` y un `#sidebar` con
**4 widgets**: Buscar · un `widget_text` vacío · Categorías (Eventos ·
Noticias) · «¡Suscríbete a nuestra newsletter!» con el enlace ofuscado en
base64.

**No es un campo**: es un área de widgets del sitio, idéntica en las 4
instancias medidas (varianza cero en los 64 ejes). **P-C3-7 no se resiente** —
sigue sin aparecer ningún campo nuevo en la FAQ—, pero **sí es una pieza de
plantilla que construir**, y el modelo la daba por inexistente. Corrige la
frase «el arquetipo más barato posible»: es barato en campos, no en cascarón.

### 5.4 · El producto necesita `bulletsTitulo` — lo descubre la segunda instancia

`ProductPanel` (`src/components/ProductosTabs.tsx`) tiene **«Ventajas» cableado
en el componente**. Los 4 productos de cartucho que usan los casos titulan esa
misma lista **«Especificaciones»**. Dos valores en el corpus → **es un campo**,
con defecto explícito `"Ventajas"` omitido en el dato cuando coincide.

Es el patrón de `CLAUDE.md` §Estructura que en realidad es contenido, tal cual:
calibrado con la primera instancia (los 5 productos de la home), la segunda lo
desmiente. **Y no se cablea el valor de la primera**, que es como se produce el
arreglo falso.

Dos flecos del mismo sitio: las viñetas de cartucho llevan **marcado inline**
(`R<sup>2</sup> &gt;0,8`, `1 μg/m<sup>3</sup>`), y **`amoniaco` no tiene
imagen** — el panel sin foto ya está contemplado (`image: ""`, el caso de Kunak
API).

---

## 6 · El inventario que alimenta §3.1: `style` en línea dentro del contenido

Sale de `c-cascaron` como canal aparte (no es eje del cascarón). En las 10
instancias:

| ×  | qué |
|---|---|
| 10 | `li text-align: justify;` |
| 9 | `p text-align: justify;` |
| 2 | `ul text-align: justify;` |
| 2 | `p text-align: left;` |
| 1 | `div text-align: center;` |
| 2 | `div padding-top: 56.0714%;` · 1 `div padding-top: 35.2941%;` |
| 1 | `table width: 100%; border-collapse: collapse;` |

**Consecuencia para el esquema**: §3.1 tiene hoy «alineación e indentación | no
medidas; **SIN PROBAR**, no se habilitan a ciegas». **Ya están medidas**: la
alineación se usa, con tres valores (`justify`, `left`, `center`), y en cuatro
etiquetas distintas. Deja de ser SIN PROBAR y pasa a decisión con datos — que
**no se toma aquí**, porque la decisión de qué hace el CMS con ella (conservar,
normalizar o descartar como T2) es del §3, no de esta construcción.

Los `padding-top` en porcentaje son el envoltorio de proporción de los `iframe`
(el truco del *aspect ratio*), no estilo de autor: van con el nodo-embed
(§3.3b), no con la alineación.
