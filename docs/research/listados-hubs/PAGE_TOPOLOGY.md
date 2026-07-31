# RECON LISTADOS + HUBS — ¿los 12 índices y los 23 archivos son un arquetipo o varios?

> **2026-07-31. Recon en frío: solo datos, cero construcción, cero decisiones de
> modelado** (esas van a la fase de decisión — última sección). Continúa
> `RECON-LISTADOS.md`, que dejó los grupos A–D medidos y a los hubs fuera del
> alcance. Sonda: `scripts/qa/lh-censo.mjs` (`npm run qa:lh`), fetch+parseo del
> HTML **servido** — la pregunta es de topología servida y un navegador solo
> añadiría mutaciones de JS que aquí no se miden. Salidas congeladas:
> `medidas/lh-regimen.json` · `medidas/lh-censo.json`.
>
> **Alcance declarado:** los **12 ÍNDICE/HUB** del censo (`CENSO-ARQUETIPOS.md`
> §4) y los **23 ARCHIVO DE TAXONOMÍA** (12 `etiqueta/*` + 8
> `recursos/articulos/*` + 3 `scientific-category/*`), leídos de los
> sub-sitemaps y reconciliados: **cuadran 12+8+3**. La cola larga (empresa,
> legales, contacto, soporte, landings) **NO entra**: es tanda propia.

## 1 · RÉGIMEN, antes de cualquier test (PASO 1)

Una línea del `<body>` servido por cada una de las 35 (`lh-regimen.json`,
2026-07-31). La sospecha de mezcla se confirma: **cuatro regímenes**, y este
reparto es el primer dato del recon:

| régimen | páginas | cuáles |
|---|---|---|
| **página de BUILDER** (`et_pb_pagebuilder_layout`, `page-id-N`, sin `tb_body`) | **6** | `productos` · `sectores` · `recursos` · `recursos/kunakpedia` · `recursos/documentos-cientificos` · `recursos/preguntas-frecuentes` |
| **página con PLANTILLA PHP propia** (`page-template-case-studies-php`) | **1** | `casos-de-exito` |
| **ARCHIVO con `tb_body`** (`archive`/`blog` + `et-tb-has-body`) | **23** | los 12 `etiqueta/*` + los 8 `recursos/articulos/*` + `blog` + `recursos/articulos` + `recursos/seminarios-web` |
| **ARCHIVO SIN `tb_body`** (`archive`, plantilla de tema) | **5** | `glosario` · `preguntas-frecuentes` · los 3 `scientific-category/*` |

Tres lecturas inmediatas, todas de dato servido:

1. **«Hub» era una etiqueta del censo, no un régimen.** De los 12, seis son
   páginas compuestas en el builder (la naturaleza de SECTOR/MONOGRÁFICO), una
   tiene plantilla PHP propia (la naturaleza del grupo C), y **cinco son
   archivos de WordPress** — tres de ellos (`blog`, `recursos/articulos`,
   `recursos/seminarios-web`) literalmente **archivos de término** con
   `tb_body`, iguales por régimen a los 20 archivos del grupo B. Los dos de
   `recursos/*` son los **términos padre** de la taxonomía jerárquica
   `resources` (`term-articulos` · `term-seminarios-web`); los 8 del censo son
   sus hijos.
2. **El grupo B del recon anterior estaba medido solo en `etiqueta/*`, y no
   cubre a los 3 `scientific-category/*`**: estos van **sin `et-tb-has-body`**
   — su cuerpo lo emite la plantilla del tema, no el Theme Builder. Mismo
   reparto de regímenes que separó al grupo C del A.
3. `glosario` y `preguntas-frecuentes` (raíz) son también archivos **sin**
   `tb_body` — el archivo de CPT (`glossary`, `faqs`) no comparte plantilla de
   cuerpo con el archivo de etiquetas del blog.

## 2 · PRE-REGISTRO — escrito ANTES de mirar un esqueleto (PASOS 2 y 3)

Se registra ahora, con el régimen ya visto y **ningún esqueleto mirado**, por
la razón de siempre: escrito después sería escrito sabiendo qué conviene.

### El plan de muestreo (PASO 2)

- **Censo 35/35** para todo lo que sea fetch+parseo: régimen, reparto de
  secciones por origen (`_tb_body` vs propias), módulo `post_content`,
  paginación (patrón y máximo), nº de tarjetas y muestra de sus campos.
- **Muestra adversaria SOLO para lectura fina** (esqueleto sección a sección,
  campos por tarjeta), elegida por máquina con **semilla fija 1440**
  (mulberry32): 4 hubs de 12 · 3 `etiqueta` de 12 · 3 `resources` de 8 · 2
  `scientific-category` de 3, **más dos por regla adversaria**: el listado con
  MÁS tarjetas y el que MENOS (los extremos que un formulario servirá). La
  muestra la imprime y congela la sonda.

### La hipótesis (PASO 3)

> **H-LH1** — Los **23 archivos con `tb_body`** (las tres familias: etiqueta,
> resources padre e hijos, blog) son **UNA plantilla** — un solo arquetipo
> LISTADO con la consulta como parámetro.
>
> **H-LH2** — Los **5 archivos sin `tb_body`** son **otro** arquetipo (o
> varios): plantilla de tema, como el grupo C respecto al A.
>
> **H-LH3** — Los **6 hubs de builder** NO son un arquetipo de listado: son
> páginas compuestas por instancia (la naturaleza de SECTOR), y su parecido
> entre sí es cuestión de la fase de decisión, no de plantilla compartida.
>
> **H-LH0** — Cualquier reparto distinto: más arquetipos dentro de los
> `tb_body`, o menos de los que el régimen sugiere.

### Qué hallazgo cambiaría el veredicto — registrado antes de mirar

**No se añaden criterios después.**

| # | hallazgo | efecto sobre el veredicto |
|---|---|---|
| **PL-F1** | dos archivos `tb_body` con **distinto nº o secuencia de secciones `tb_body`** | parte H-LH1: el grupo B son ≥2 plantillas |
| **PL-F2** | un archivo clasificado «sin `tb_body`» cuyo cuerpo resulte tener secciones **propias** (builder) | régimen mal leído para esa página: **se re-mide y se descarta su fila** de esta corrida — no se acomoda el veredicto |
| **PL-F3** | un hub de builder con **rejilla de entradas por consulta** (módulo blog/portfolio dentro del builder) | tercera naturaleza de listado («listado compuesto»): obliga a separar hub de listado también en el modelado |
| **PL-F4** | tarjetas con **campos distintos** entre familias (p. ej. fecha en unas y no en otras) | NO parte arquetipos — es proyección/campo — pero fija la proyección de teaser por familia y se anota como tal |
| **PL-F5** | un archivo `tb_body` **sin paginación y sin rejilla** | señal de medida rota (un archivo sin listado no es un archivo): se re-mide esa página antes de contarla |

**Y el límite de la muestra, dicho antes:** el censo 35/35 cubre las señales de
esqueleto de primer nivel; la lectura fina va sobre 12+2 páginas. Un veredicto
«varios» será firme (refutar es barato); un «uno» dentro de cada grupo será
**provisional** al nivel de detalle que la lectura fina no cubra — la tanda del
monográfico enseñó que 8 propiedades no se ven en la primera instancia.

---

*(El resto del documento se escribe DESPUÉS de correr el censo completo —
commit del pre-registro primero.)*
