# Grupo C — topología medida (caso de éxito + FAQ)

> **Recon C-1. Solo datos.** Las decisiones de modelado son de **C-2** y aquí no
> se toman. Lo que este recon deja abierto está al final, en
> §9 «PREGUNTAS PARA C-2», **sin contestar**.

Fecha: **2026-07-30** · corpus **76/76 leídas, 0 fallos** · viewport 1440×900 y
390×844 (DPR 1) para lo que necesitó navegador.

| forma | ruta | n |
|---|---|---|
| `caso-es` | `/es/casos-de-exito/<slug>/` | **53** |
| `caso-en` | `/es/case-studies/<slug>/` | **4** |
| `faq` | `/es/faqs/<slug>/` | **19** |

Los índices `/es/casos-de-exito/` y `/es/preguntas-frecuentes/` **no cuentan como
instancias** y se excluyen del censo: el primero es una `page` con plantilla PHP
propia (`page-template-case-studies-php`), el segundo un
`post-type-archive-faqs`. El sitemap de `case-studies` trae 54 URLs `/es/` y una
es ese índice — de ahí que el corpus sean 53 + 4, no 54 + 4.

---

## 0 · EL RÉGIMEN, antes que ningún test

`CLAUDE.md` manda identificar el régimen **antes** de aplicar los dos tests, y
aquí la respuesta obliga a un matiz: **el grupo C no está en ninguno de los dos
regímenes descritos.** Es un tercero.

La línea del `<body>` servido, por forma:

```
caso-es  wp-singular case-studies-template-default single single-case-studies
         postid-11609 … et-tb-has-template et-tb-has-header et-tb-has-footer

caso-en  wp-singular case-studies-template-default single single-case-studies
         postid-59479 … et-tb-has-template et-tb-has-header et-tb-has-footer

faq      wp-singular faqs-template-default single single-faqs
         postid-65794 … et-tb-has-template et-tb-has-header et-tb-has-footer
```

Contra la tabla de `CLAUDE.md`:

| marca | qué significaría | grupo C |
|---|---|---|
| `et_pb_pagebuilder_layout` | página de BUILDER | **ausente en las 76** |
| `et-tb-has-body` | página PLANTILLADA por el Theme Builder | **ausente en las 76** |
| secciones `…_tb_body` | ídem | **0 en las 76** |

> **El régimen es un TERCERO: cabecera y pie por Divi Theme Builder, cuerpo por
> plantilla PHP del tema hijo.** `et-tb-has-header` y `et-tb-has-footer` están;
> `et-tb-has-body` no. El cuerpo lo emite `case-studies-template-default` /
> `faqs-template-default`, que es la jerarquía de plantillas de WordPress, no
> Divi.

**Consecuencia para los tests, que es lo que importa.** En este régimen **no
existe la persona que editó esta página**: el cuerpo lo compone un PHP igual para
todas las instancias, y quien da de alta un caso rellena campos. Por tanto se
aplica la lectura del régimen **plantillado**, no la de builder:

> El discriminador válido es **la varianza entre instancias**. Cero varianza =
> plantilla, aunque la huella sean px absolutos. **El test A (los dos anchos) no
> se aplica aquí**, y aplicarlo daría la respuesta invertida.

Y la varianza está medida abajo: **cero en todos los ejes del cascarón**.

---

## 1 · El cascarón, por forma — varianza CERO en los cuatro ejes

Medido en las 76, sin excepción:

| eje | `caso-es` (53) | `caso-en` (4) | `faq` (19) |
|---|---|---|---|
| reparto de secciones | `tb_header 1 · propia 1 · tb_footer 4` | **idéntico** | `tb_header 1 · propia 0 · tb_footer 3` |
| firma de secciones (orden + clase) | 1 sola forma | **la misma** | 1 sola forma |
| clases de plantilla del `<body>` | 1 sola forma | **la misma** | 1 sola forma |
| marcas `et-tb-*` | 1 sola forma | **la misma** | 1 sola forma |
| bloques del cuerpo | `need · solution · results` | **los mismos** | (ninguno) |

**Las tres formas tienen varianza cero.** Por el discriminador del régimen
plantillado, el cascarón entero es **plantilla**.

### El pie: 4 secciones en el caso, 3 en la FAQ

Confirmado el `tb_footer 4 vs 3` que anotó `RECON-LISTADOS`, y **la diferencia
está localizada**:

| | secciones del pie |
|---|---|
| **caso** | `(fullwidth, sin clase de autor)` · `footer-links` · `footer-legal` · `footer-background` |
| **FAQ** | `footer-links` · `footer-legal` · `footer-background` |

> La sección de más del caso es la **primera**, `et_pb_fullwidth_section` sin
> clase semántica propia. **Qué contiene exactamente: SIN MEDIR** — este recon la
> contó y la situó, no la abrió. Es el «CTA que el pie actual del clon no monta»
> del `RECON-LISTADOS`, pero eso está **por confirmar**.

### La FAQ no tiene migas

`caso` trae una sección propia `migas` (breadcrumb, `ol.kunak-breadcrumbs`);
**`faq` no trae ninguna sección propia**. No es una diferencia de contenido: es
una diferencia de plantilla.

---

## 2 · El cuerpo NO es un `post_content`

**`.et_pb_post_content` no existe en ninguna de las 76.** El contenedor del
arquetipo A no está aquí, y el cuerpo es otra cosa en cada forma.

### 2.1 · Caso de éxito — campos estructurados + tres bloques ricos

El marcado de la plantilla PHP, con `acf-map` entre las clases, que delata
**ACF** (Advanced Custom Fields):

| campo visible | marcado | presencia `caso-es` (53) | `caso-en` (4) |
|---|---|---|---|
| sobretítulo | `p.sobretitulo` | 53 | 4 |
| título | `h1.entry-title` | 53 | 4 |
| cliente | `.case-cliente` | 53 | 4 |
| sector | `.case-sectores` | 53 | 4 |
| **cuerpo: Necesidad** | `.entry-content-need` | 53 | 4 |
| **cuerpo: Solución** | `.entry-content-solution` | 53 | 4 |
| **cuerpo: Resultados** | `.entry-content-results` | 53 | 4 |
| texto destacado | `.texto-destacado` | **46** | 3 |
| galería | `section.case-galeria` (swiper) | **44** | 4 |
| detalles del proyecto | `section.case-detalles` | 53 | 4 |
| mapa | `.acf-map` + `.marker[data-lat][data-lng]` | 53 | **3** |
| soluciones relacionadas | `section.case-soluciones` | **49** | 4 |

> **Los opcionales están medidos, no supuestos:** destacado 46/53, galería 44/53,
> soluciones 49/53, y el mapa falta en 1 de los 4 ingleses (56 de 57 lo llevan).

⚠ **Trampa de conteo, para que no se propague a C-2:** el campo
`campos.soluciones.items` del censo cuenta **nodos del DOM, y están duplicados**
—cada solución se pinta dos veces, una dentro del `li` y otra en
`.lista-contenido-content`—. El censo da 6–20; **las soluciones reales son la
mitad: 3–10**. El porqué de la duplicación está medido en `BEHAVIORS.md` §2.
Tamaños de galería, del censo: **3–15 imágenes**, mediana 7.

**Dos que PARECEN campo y no lo son** (varianza cero entre las 57):

- **`sobretitulo` vale «Caso de éxito» en las 57.** Un solo valor distinto en
  todo el corpus.
- **Los títulos de los tres bloques son `["Necesidad","Solución","Resultados"]`
  en las 57**, en ese orden. El editor escribe el contenido de cada bloque, no
  su título.

**El bloque de detalles** es una lista de pares etiqueta/valor, siempre los
mismos rótulos: `Cliente · Usuario · Ubicación · Sector · Año · Parámetros`.
El mapa lleva las coordenadas en el marcador (`data-lat` / `data-lng`), que es
dato del autor.

**El sector se parece a una taxonomía**: 15 cadenas distintas en las 57, con el
rótulo en singular o plural según el número (`Sector: Industria` ·
`Sectores: EDAR / PTAR, Olores`), y **4 casos con más de uno**. El **cliente** es
prácticamente único: 55 valores distintos en 57.

### 2.2 · FAQ — un único campo rico, y pequeño

**Un solo `.entry-content`, sin sufijo, en las 19.** Sin sobretítulo, sin
cliente, sin galería, sin mapa: **solo título y cuerpo**.

| | min | p50 | max | rango |
|---|---|---|---|---|
| caracteres del cuerpo | 151 | 213 | **539** | 3.6× |

Compárese con el arquetipo A, cuyo rango era **254×**: el cuerpo de la FAQ es un
párrafo o dos.

---

## 3 · El perfil de etiquetas contra el contrato del §3.1

Número de páginas en que aparece cada etiqueta **dentro del cuerpo** (los tres
bloques del caso; el `entry-content` único de la FAQ):

| forma | etiquetas |
|---|---|
| `caso-es` (53) | `h2:53 div:53 p:53 a:50 ul:45 li:45 strong:36 sub:21 iframe:10 span:9 img:8 h4:7 em:7 br:5 sup:4 h3:4 blockquote:4 video:3 source:3 b:2 table:1 tbody:1 tr:1 td:1 script:1` |
| `caso-en` (4) | `h2:4 div:4 p:4 a:4 strong:4 ul:4 li:4 sub:2 img:2 b:2 iframe:1 h5:1 br:1 i:1 table:1 thead:1 tr:1 th:1 tbody:1 td:1 blockquote:1` |
| `faq` (19) | `p:19 ul:2 li:2 span:1 a:1 sub:1 br:1` |

**Lo que ya toca el contrato existente, medido:**

| construcción | caso-es | caso-en | faq | dónde está decidido |
|---|---|---|---|---|
| `sub` / `sup` | 21 / 4 | 2 / 0 | 1 / 0 | §3.1: habilitados |
| `table` | 1 | 1 | 0 | **§3.4 ABIERTA** |
| `iframe` | **10** | 1 | 0 | §3.3b: nodo-embed con URL |
| `video` | **3** | 0 | 0 | §3.1b: nodo de vídeo |
| `script` | **1** | 0 | 0 | §3.3: no entra; exige sustituto |
| `h5` | 0 | **1** | 0 | §3.1: fuera de whitelist, degrada a h4 |

> **El cuerpo de la FAQ entra entero en el contrato del §3.1 tal como está.** Sus
> 7 etiquetas son párrafo, lista, enlace, `span`, `br` y un `sub`.
>
> **El cuerpo del caso NO añade ninguna construcción nueva** respecto a lo que ya
> está inventariado para el arquetipo A: cae dentro de §3.1 más los flecos que
> §3.3b, §3.1b y §3.4 ya tienen abiertos por su cuenta. **No pide un contrato
> nuevo.**

---

## 4 · CMS-1 — las dos rutas, medidas

La pregunta era: **¿misma plantilla y solo cambia el prefijo, o difieren en algo
más?** Y: **¿los 4 ingleses son alias o contenido propio?**

### 4.1 · La plantilla es la misma. Toda.

`caso-es` y `caso-en` coinciden en **los cinco ejes** del §1: mismas clases de
`<body>` (`case-studies-template-default single single-case-studies`), mismo
reparto de secciones, misma firma, mismas marcas `et-tb-*`, mismos bloques de
cuerpo. **Es un solo CPT con un solo `single`.** El prefijo es lo único distinto.

### 4.2 · Son CONTENIDO PROPIO, no traducciones ni alias

| medida | resultado |
|---|---|
| títulos o clientes repetidos entre los 4 y los 53 | **0** |
| `hreflang`/`alternate` declarados | **0 de 57** |
| `canonical` | **cada uno apunta a su propia URL**, en los 9 comprobados |
| idioma del contenido de los 4 | **español** (títulos y cuerpo) |

> Los 4 de `/es/case-studies/` son **4 casos distintos, escritos en español**, que
> por lo que sea quedaron bajo el otro prefijo. **No** son la versión inglesa de
> ninguno de los 53.

### 4.3 · El prefijo cruzado redirige… casi siempre

Cabeceras HTTP sin seguir la redirección, con barra final (la forma canónica):

| dirección | 200 | 301 | 404 |
|---|---|---|---|
| `/casos-de-exito/<slug-de-los-4>` | 0 | **3** | **1** |
| `/case-studies/<slug-de-5 españoles>` | 0 | **4** | **1** |

Los 301 apuntan **a la ruta propia del post**. Los dos 404 son reales, no
artefacto de la sonda: comprobado que sin barra final dan 301 → añadir barra →
404.

- `monitoreo-del-trafico-y-la-calidad-del-aire-en-castel-d-ario` → 404 bajo
  `/casos-de-exito/`
- `red-calidad-de-aire-para-world-athletics` → 404 bajo `/case-studies/`

> ⚠ **SIN PROBAR: por qué 7 de 9 redirigen y 2 no.** Podría ser un plugin de
> redirecciones con reglas por entrada, o el adivinador canónico de WordPress
> fallando en esos slugs. **Este recon no lo ha determinado**, y la diferencia
> importa para C-2: no es lo mismo «hay alias sistemático» que «hay alias por
> accidente en algunas entradas».

---

## 5 · SEO por instancia

Presente en las 76: `title`, `meta description`, `canonical`, `og:image`.
Ausente en las 76: `hreflang`.

Es justo lo que `RECON-LISTADOS` §4 apuntaba que falta en los modelos de teaser
del clon (`CaseStudy` sin cuerpo, sin slug, sin taxonomía, sin SEO).

---

## 6 · Los índices, medidos de pasada

| índice | qué es | listado |
|---|---|---|
| `/es/casos-de-exito/` | `page` con `page-template-case-studies-php` | **57 entradas, sin paginación** — las 57 en una página |
| `/es/preguntas-frecuentes/` | `post-type-archive-faqs` | **5 entradas + paginación** |

Las 57 del índice de casos cuadran con 53 + 4: **el índice mezcla los dos
prefijos**, que es un dato para CMS-1.

---

## 7 · ⚠ SIN PROBAR

| # | qué | por qué |
|---|---|---|
| **C-SP1** | qué contiene la 4ª sección del pie del caso | contada y situada, **no abierta** |
| **C-SP2** | por qué 2 de 9 rutas cruzadas dan 404 y 7 redirigen | medido el síntoma, no el mecanismo |
| **C-SP3** | si `.case-sectores` es una taxonomía real de WordPress o texto | se ve el rótulo renderizado, no el origen |
| **C-SP4** | si los 3 bloques del cuerpo son 3 campos ACF o un `post_content` troceado por el PHP | se ve el resultado, no el origen |
| **C-SP5** | qué es el `<script>` de la única página de caso que lo lleva | contado, no leído (es lo que `a-scripts` hizo para el grupo A) |
| **C-SP6** | de qué proveedor son los 10 `iframe` del cuerpo de caso | **no censados por host**, a diferencia de las 209 del grupo A (§3.3b) |
| **C-SP7** | el ritmo y la tipografía del cascarón (px por sección/fila/módulo) | **no medidos**: este recon es de topología y campos, no de maquetación |

---

## 8 · Salidas congeladas

| sonda | salida |
|---|---|
| `npm run qa:c-censo` | `scripts/qa/medidas/c-censo.json` |
| `npm run qa:c-muestra` | `scripts/qa/medidas/c-muestra.json` |
| `npm run qa:c-rutas` | `scripts/qa/medidas/c-rutas.json` |
| `npm run qa:c-behaviors [ancho]` | `scripts/qa/medidas/c-behaviors-1440.json` · `-390.json` |

Plan de muestreo en `PLAN-MUESTREO.md`; interacción en `BEHAVIORS.md`.

---

## 9 · PREGUNTAS PARA C-2

**No se contestan aquí.** Cada una lleva el dato con el que se decide.

1. **¿El caso de éxito es una colección con campos, o un cuerpo rico con
   bloques?** El dato: 3 bloques ricos fijos (`Necesidad · Solución ·
   Resultados`, títulos constantes en 57/57) + 9 campos estructurados, de los que
   **4 son opcionales con frecuencia medida** (destacado 46/53, galería 44/53,
   soluciones 49/53, mapa 56/57).

2. **¿Los tres bloques son tres campos ricos, o uno con tres secciones?** El
   dato: sus títulos no varían nunca, así que **el título no es contenido**; lo
   que varía es solo el cuerpo de cada uno. Ver **C-SP4**.

3. **¿`sobretitulo` es campo?** El dato: **un único valor en las 57** («Caso de
   éxito»). Por el discriminador del régimen plantillado, eso es plantilla — pero
   es una cadena visible y la decisión de si se modela como campo con defecto es
   de C-2.

4. **¿Sector es taxonomía o cadena?** El dato: 15 valores, **4 casos con más de
   uno**, y el rótulo cambia de singular a plural con el número. Ver **C-SP3**.

5. **CMS-1 · ¿un prefijo o dos?** El dato: **una sola plantilla**, contenido
   propio en los 4, `canonical` propio en cada uno, **0 `hreflang`**, el índice
   mezcla ambos, y el prefijo cruzado redirige en 7 de 9 con **2 excepciones sin
   explicar** (C-SP2). La decisión de si el clon emite un prefijo, dos, o uno con
   redirecciones, es de C-2.

6. **¿El mapa se migra como dato o como render?** El dato: coordenadas en
   `data-lat`/`data-lng`, y **Google Maps montado en cliente** con
   `maps.googleapis.com` (§BEHAVIORS). Es un `iframe`/SDK de tercero dentro de un
   campo, que es justo lo que §3.3b acaba de sacar del `enum` cerrado.

7. **¿La galería es un campo de media múltiple o un bloque?** El dato: **3–15
   imágenes** por caso (mediana 7), presente en 48 de las 57, carrusel real
   (`swiper` inicializado con botones).

8. **¿Las «soluciones» son una relación?** El dato: **3–10 por caso**, cada una con
   `data-id` que **es el slug de un producto ya clonado**
   (`monitor-calidad-aire`, `software-de-medicion-calidad-del-aire`) o de un
   contaminante. Huele a relación polimórfica, que es lo que §1.5b acaba de
   documentar como soportado — **pero no se decide aquí**.

9. **¿La FAQ es una colección propia o un bloque dentro de otra cosa?** El dato:
   CPT propio con `single` propio, cuerpo de 151–539 caracteres, **sin ningún
   campo más que título y cuerpo**, y un archivo paginado de 5 en 5.

10. **¿El pie de 4 secciones se modela, o es el mismo pie con un bloque más?** El
    dato: las 3 últimas secciones coinciden con las 3 de la FAQ; **la que sobra es
    la primera**. Ver **C-SP1**.
