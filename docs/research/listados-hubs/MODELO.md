# LH-2 · MODELO — content types de listados y hubs

> **2026-07-31.** Traducción de las decisiones de `DECISIONES.md` a modelo de
> datos, con **defecto explícito y omitido cuando coincide** (el patrón del
> ESQUEMA §1.5). **Nada de esto está construido**; es el contrato que la
> construcción y la Fase 2 consumen. Colecciones en `ESQUEMA-CMS.md` §2c.

## 1 · Lo primero: un listado NO es un content type

Un archivo es **una consulta renderizada**: no tiene editor por instancia ni
contenido propio. Lo que sí es contenido — y por tanto colección — son **los
términos** de las taxonomías que consultan. El arquetipo LISTADO-B es plantilla
(con variantes) + esos datos.

## 2 · Colecciones nuevas (términos de taxonomía)

| colección | fuente WP | docs | campos |
|---|---|---|---|
| `etiquetas` | `post_tag` | **12** | `nombre` · `slug` |
| `categoriasRecursos` | `resources` (**jerárquica**) | **10** (2 padres: `articulos`, `seminarios-web` + 8 hijas de `articulos`) | `nombre` · `slug` · `padre?` (relación a sí misma) |
| `categoriasCientificas` | `scientific-category` | **3** | `nombre` · `slug` |
| `categorias` | `category` | **SIN CENSAR** (LH-SP8 — fuera de sitemap; vistas: `noticias`, `articulos`) | se censa antes de modelar |

El `h1` de cada archivo es el **`nombre` del término** — dato derivado, no
campo de página. Ninguna descripción de término apareció en las tarjetas ni en
los archivos medidos; si el detalle del término la usa, es del grupo A.

## 3 · Lo que el content type del grupo A debe traer DE NACIMIENTO (D3)

El contrato mínimo de `entradas` (blog) para que los listados funcionen sin
re-migración:

```
titulo            texto                    (ya previsto en A)
slug              texto único              (ya previsto en A)
fechaPublicacion  fecha                    — visible en tarjeta (etiqueta/resources)
imagenDestacada   relación a media, OPCIONAL
                  · sizes que debe emitir el CMS: 1080×675 · 1024×683 · 980 · 480
                    (los que sirve el srcset de las tarjetas — amarra CMS-0b/M-IMG)
categorias        relación → `categorias`        (≥1 en lo visto: noticias | articulos)
etiquetas         relación → `etiquetas`         (0..n — hay tarjetas sin tag)
categoriasRecursos relación → `categoriasRecursos` (0..n)
extracto          texto OPCIONAL · **defecto: derivado** — recorte del arranque
                  del cuerpo a ~267c con «…». Si LH-SP10 encuentra extractos
                  manuales, el campo ya existe y solo se puebla.
autor             ——— NO LO EXIGE NINGÚN LISTADO. No se añade por esto.
```

`documentosCientificos` añade `categoriaCientifica` (relación →
`categoriasCientificas`). `terminos` (glosario) y `faqs` no necesitan nada
nuevo: su tarjeta es solo título+enlace (y `faqs` ya está modelada en C).

**La proyección de teaser es DEL content type** (D3/D5.7): `BlogPost` y
`CaseStudy` de `src/types/kunak.ts` son esa proyección, verificada contra las
9 formas. Al construir A: `BlogPost` gana `slug` y taxonomías, y `href` deja de
ser absoluto.

## 4 · El arquetipo LISTADO-B (plantilla, 23 instancias)

```
plantilla LISTADO-B                        (esqueleto tb_body: 2 secciones, medido 23/23)
  variante: "blog" | "etiqueta" | "recursos"     ← fija la CONFIG de tarjeta:
    blog:     imagen + título                      (sin fecha, sin extracto; categoría)
    etiqueta: imagen + título + fecha .published + categoría + extracto ~267c…
    recursos: imagen + título + fecha-texto        (sin categoría, sin extracto)
  entradasPorPagina (parámetro de plantilla por variante — NO campo):
    blog/etiqueta: 9 · recursos: 15 · (L3: SIN PROBAR, LH-SP9)
  consulta (dato): todasLasEntradas | término de `etiquetas` | término de `categoriasRecursos`
  paginación: /page/N/ · rutas DERIVADAS en build (⌈entradas/porPagina⌉) · dynamicParams=false
```

## 5 · LISTADO-TEMA (L2 · L3) — separados, con reapertura escrita

- **L2** (`glosario` · `preguntas-frecuentes`): 4 secciones, tarjeta
  solo-título, 5/página. Consulta: colección entera (`terminos` · `faqs`).
- **L3** (`scientific-category/*`): 5 secciones, tarjeta título+categoría con
  otro markup, por-página SIN PROBAR.
- **Reapertura**: si la lectura fina muestra que la 5.ª sección de L3 es bloque
  opcional del mismo esqueleto → un solo LISTADO-TEMA.

## 6 · Lo que NO estrena modelo

- **Los 6 hubs de builder**: páginas compuestas por instancia — cola larga, y
  la hipótesis del grupo D (`MonoSeccion[]`) sigue pendiente de su experimento.
- **El listado embebido** de `/es/recursos/`: es un **bloque de consulta**
  (`fuente · nº · nivel de titular h3`) — el clon ya lo tiene construido
  (`UltimosArticulos`).
- **`/es/casos-de-exito/` (L5)**: página índice sobre la colección `casos` —
  57 tarjetas `CaseStudy`, **sin paginar** (fidelidad, D5.5), ambos prefijos
  mezclados (medido en C-1). Cero campos nuevos.
- **El caso de éxito NO gana relación a `etiquetas`** aunque sus clases lleven
  `tag-*`: ningún listado medido la consume. Reapertura: el día que un archivo
  liste casos.
