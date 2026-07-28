# PAGE_TOPOLOGY.md — arquetipo SECTOR / SOLUCIÓN VERTICAL

> Recon (Fase 1) del **2026-07-28**. Página de referencia:
> `https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/` (Urbano).
> Contraste estructural contra `…/sectores/control-de-emisiones-industriales/`
> (Industria y olores) + barrido ligero de los **7 sectores vivos**.
> Ruta destino: `src/app/sectores/calidad-del-aire-en-las-ciudades/page.tsx`
> (**primera ruta anidada del proyecto**).
>
> Medido con puppeteer-core sobre el Chrome del sistema (headless, perfil
> limpio, Cookiebot bloqueado vía `--host-resolver-rules`, `--hide-scrollbars`),
> a **1440×900** y **390×844 reales**, con las imágenes perezosas forzadas a
> `eager` y un pase de scroll + settle antes de medir.
> Sondas en el scratchpad de la sesión: `lib.mjs` · `topology.mjs` ·
> `probe.mjs` · `detalle.mjs` · `geom.mjs` · `behaviors.mjs` ·
> `sectores-scan.mjs` / `sectores-scan2.mjs` (barrido de los 8) · `shots.mjs` ·
> `compose.mjs`.
> Capturas: `docs/design-references/sectores/urbano-{desktop-1440,movil-390}-full.jpg`
> y `industria-desktop-1440-full.jpg`.
> **No se escribió código de producto en esta fase** salvo el content type
> (`src/lib/sectores.ts`), que es el entregable pedido del recon.

## 0. Identidad de la página

- **Plantilla WordPress**: `page-template-sectors page-template-sectors-php`
  → los 7 sectores vivos comparten **la misma plantilla PHP**. No es una
  colección de páginas Divi sueltas: es un arquetipo declarado por el tema.
- **Jerarquía**: `page-child parent-pageid-24963` (padre = `/es/sectores/`).
- **Título**: "Soluciones de control de la calidad del aire urbano para
  ciudades | Kunak AIR"
- **H1**: "Calidad del aire en las ciudades" (30px/36 w400 **blanco**, sobre la
  foto de cabecera)
- **Kicker sobre el H1**: "Urbano" (40px/30.6 **w700** blanco, `margin-top: -13px`)
- **Breadcrumb**: Inicio / Sectores / **Calidad del aire en las ciudades**
  (3 niveles, el último sin enlace, `ol.kunak-breadcrumbs` con schema.org)
- **Altura de documento**: **6081** a 1440 · **10913** a 390. Sin scroll
  horizontal en ninguno de los dos.
- **Retícula**: fila Divi **86% máx 1380** (1238.4px a 1440). **NO es el 80%** de
  /monitor-calidad-aire, /software y /kunak-api. La única excepción es
  `banda-clientes`, que va al **95%** (1368px).
- **Taxonomía asociada**: `https://kunakair.com/es/sector/urbano/` (es la que
  filtra los casos de éxito). **No es 1:1 con la página**: `/petroleo-y-gas`
  reusa `sector/industria/` y `/construccion` usa `sector/obras/`.

## 1. Mapa de secciones (desktop 1440)

| # | Sección | top | alto | Modelo de interacción |
|---|---|---|---|---|
| — | **Cabecera de sector** (`cabecera cabecera-sectores`) | 0 | **397.6** | scroll-driven (header) + **estático** (kicker/H1) |
| S1 | `banda-clientes` — 13 logos en carrusel | 397.6 | 122 | **time-driven** (autoplay 2.5 s) |
| S2 | Breadcrumb | 519.6 | 50 | estático |
| S3 | Hero de sector (foto + 2 CTA \| H2 azul + 5 párrafos) | 569.6 | 893.5 | estático |
| S4 | **CTA de descarga** (`.calls` con foto, caja blanca) | 1463.1 | 440.8 | estático |
| S5 | Beneficios \| Aplicaciones (2 listas) + claim \| foto | 1890 | 1057.5 | estático |
| S6 | CTA de ancho completo (slider de **3** diapositivas) | 2947.4 | 401.6 | **time-driven** (7 s) + click |
| S7 | Bloque K: Soluciones + Últimos proyectos + Artículos | 3349 | 2138.2 | **hover-driven** (tabs) + hover en tarjetas |
| — | Footer TB (links + legal + franja) | 5487.2 | 593.8 | estático (compartido) |

Móvil 390: cabecera **347.3** · S1 122 · S2 50 · S3 **1564.7** · S4 593.4 ·
S5 **1970.2** · S6 **265.1** · S7 **4226.6** · footer 1761.2.

**Lo que NO tiene** (y conviene fijarlo para no buscarlo en Fase 2):
FAQ (0 `et_pb_toggle` reales en los 7 sectores) · caja de anclas / scrollspy ·
tablas de especificaciones · visor 360 · lightbox de vídeo · newsletter
("Innovación en calidad del aire a 1 clic") · buscador ni filtros ·
formularios. **La única navegación interna de la página es el scroll.**

### 1.1 Cabecera de sector — la diferencia real con las otras 4 páginas

La `.cabecera` de /monitor-calidad-aire, /accesorios, /software y /kunak-api
mide **225px** y es puramente decorativa: foto + las filas del header, y el
`<h1>` vive dentro del cuerpo de la página. En los sectores es la **misma
sección con una fila más**:

| | Páginas ya clonadas | **Sector** |
|---|---|---|
| Clases | `cabecera` | `cabecera` **`cabecera-sectores`** |
| Alto | 225 | **397.6** (móvil 347.3) |
| Filas | topbar 0..41 · menú 41..185 | + **fila kicker/H1 185..357.6** |
| `padding-bottom` | 40 | 40 |
| Contenido | ninguno | kicker + `<h1>`, ambos blancos |
| Foto | genérica (varía entre visitas) | **la del sector**, fija |

O sea: la franja bajo el header pasa de 40px a **212.6px desktop / 221.7px
móvil**, y lleva texto encima. Es un bloque **nuevo** (§3).

### 1.2 Desglose por sección (desktop)

**S1 · `banda-clientes`** — sección `#e4e5e5`, fila al **95% (1368px)** con
`padding: 20px 0`, alto **122**. Un único módulo de texto con el shortcode
`.swiper.clientesSwiper` (25 slides = 13 logos + clones de bucle, slide 186.3,
logos a **80px** de alto). **No lleva titular**: la home mete "Con la confianza
de empresas líderes" en una columna 1/3 y el carrusel en la 2/3, con la fila al
85% (1238.4) y `padding: 30px 0 20px` → **153.2** de alto. Mismo componente,
**otra variante**.

**S3 · Hero de sector** — sección `padding: 57.59 0 60` (4% / 60px), fila
`pb 28.8`, dos columnas **1/2 + 1/2** (585.1 cada una, gutter 5.5%):

- *Col. izquierda* (4 módulos): punteado a `x = 35.8` (**−65px** de la
  retícula, la regla de siempre) · foto del sector **585.1×312.1** ·
  botón azul primario · botón azul secundario ("Descargar catálogo").
  Los dos botones son **Divi 15px/44px** con `margin-bottom: 30`.
- *Col. derecha* (2 módulos): `<h2>` **37px/37 w300** cuyo texto va dentro de un
  `<span style="color:#0075c9">` (el h2 en sí computa `#333`; el azul lo pone
  el span — importante para el clon) · bloque de 5 `<p>` a 18/30.6 con la
  rítmica Divi `padding-bottom: 18px` salvo el último.

**S4 · CTA de descarga (`.calls`)** — módulo `et_pb_code` con el shortcode
`calls` en la variante `one-column espacio-derecha call-fondo-blanco
espacio-blanco-derecha call-con-foto`:
caja **1238.4×337**, `border: 1px solid #d8d8d8`, `padding: 40px 50px`,
`margin-bottom: 46.25`; foto **280×246.4** con `margin: 0 20px 0 −30px` (se
sale de la caja por la izquierda); `p.calls-title` **37px/51.8 w400 #333** con
`padding-bottom: 10`; `.calls-text` 18/30.6 con `padding-bottom: 30`; botón
**outline #333** con `background: rgba(255,255,255,.65)`, `target="_blank"` y
`rel="nofollow"`.
Es el **mismo shortcode `calls`** que la newsletter de la home, pero con otra
piel: la home usa `calls one-column` a sangre, sobre foto, texto blanco y sin
imagen. **En móvil esta caja cambia de piel**: pierde el borde, gana
`background rgba(0,0,0,.45)` con `mix-blend-mode: multiply`, el texto pasa a
**blanco**, el botón a outline blanco y la foto se **centra arriba** (165.2 de
ancho, `margin: 0 55.08`). Ver la captura móvil, tira 02.

**S5 · Beneficios / Aplicaciones + claim** — dos filas:
- *fila 0*: 1/2 + 1/2, cada una con punteado + `<h3>` **44px/55 w300** (el
  h3 tiene el tamaño de un h2 de sección) + `<ul>` con `padding: 0 0 18px 36px`,
  `list-style: none` y **viñeta azul por `::before` `"•"` a 22.4px `#0075C9`**.
- *fila 1* (`et_pb_equal_columns`): claim `<p>` **37px/37 w300 azul por span**
  (con `padding-right: 25`) a la izquierda y foto 585.1×390.1 a la derecha.
  Ojo: la foto arranca **121px más arriba** que el claim (y 2514.5 vs 2635.6) —
  el claim está centrado verticalmente en la fila.

**S6 · CTA de ancho completo** — `et_pb_fullwidth_slider` con **3
diapositivas**, `et_slider_auto et_slider_speed_7000 et_pb_bg_layout_dark`.
Alto 401.6 (móvil 265.1). Cada slide: foto propia + `background-color
rgba(0,0,0,.33)`, `h4.et_pb_slide_title` **45px/58.5 w300 blanco** (enlazado) y
botón blanco `rgba(0,0,0,.15)`. Descripción con `padding: 76 0 76 620.9` (la
copy vive en la mitad derecha, igual que el `CtaBanner` con `align="right"`).
Flechas ocultas en reposo, 3 dots blancos de 7px a `bottom: 20`.

**S7 · Bloque K** — una sola sección con el watermark
`recurso-k-fondo.svg` a `0% 50%`, `padding-top: 57.59`, y **5 filas**:

| fila | contenido | nota |
|---|---|---|
| 0 | punteado ×2 + `<h2>` "Nuestras soluciones" + `#lista-soluciones` | los **dos** punteados están superpuestos en el original (artefacto de autoría Divi: dos módulos idénticos en la misma posición) |
| 1 | 1/3 + 2/3 — punteado + `<h2>` "Últimos proyectos" | la col. 2/3 va **vacía** |
| 2 | 3 tarjetas de caso + CTA "Ver todos los casos de éxito" (derecha) | |
| 3 | 1/3 + 2/3 — punteado + `<h2>` "Artículos y Guías" | col. 2/3 vacía |
| 4 | 3 tarjetas de blog + CTA azul "Amplia tus conocimientos con nuestras guías" (derecha) | |

`#lista-soluciones` es el shortcode `lista-contenido` en su variante
"soluciones" — **el mismo de `ProductosTabs`**, con lista `float: inline-start`
371.5 y panel `float: inline-end` 780.2×500 (`border 1px #777`, `radius 10`,
`padding 30`). Aquí trae **3 productos** (AIR Pro / AIR Lite / AIR Cloud) en
vez de los 5 de la home: **no hay Cartuchos ni API**.

## 2. Estructura común vs. contenido variable (el objetivo CMS)

Barrido de los **7 sectores vivos** (`sectores-scan2.mjs`). Todos: misma
plantilla, misma `banda-clientes`, mismo breadcrumb de 3 niveles, mismo
`#lista-soluciones` de 3 productos, mismo slider de **3** diapositivas a 7 s,
mismos bloques de casos y artículos, **0 FAQ**, mismo footer TB.

### 2.1 Lo que es ESTRUCTURA (la plantilla, idéntica en los 7)

1. Cabecera de sector: foto + kicker + H1.
2. `banda-clientes` (los **mismos 13 logos** en los 7 sectores).
3. Breadcrumb Inicio / Sectores / *[título del sector]*.
4. Hero 1/2+1/2: punteado + foto + 2 botones \| H2 azul + párrafos.
5. **Cuerpo libre** — ver §2.3.
6. CTA de ancho completo: slider de 3 diapositivas, autoplay 7 s.
7. Bloque K: "Nuestras soluciones" (3 productos) + "Últimos proyectos" (3) +
   "Artículos y Guías" (3).
8. Footer TB con la franja inferior = **la foto del sector**.

### 2.2 Lo que es CONTENIDO (lo que poblaría el CMS)

| Campo | Urbano | Industria y olores |
|---|---|---|
| Kicker | "Urbano" | "Industria y olores" |
| H1 | "Calidad del aire en las ciudades" | "Control de emisiones industriales" |
| Foto de cabecera/franja | `urban-1920.jpg` | `industry-1920x1024-1.jpg` |
| Foto del hero | `urban-air-quality-1.jpg` | `industry-perimeter.jpg` |
| H2 del hero | "Conoce la calidad del aire que respiran tus ciudadanos…" | "Mide el impacto de las emisiones industriales…" |
| CTA 1 del hero | "Quiero saber más" | "¿Quieres saber más?" |
| CTA 2 del hero | "Descargar catálogo" | "Descargar catálogo" |
| H3 de beneficios | "Beneficios de monitorizar la calidad del aire:" | "Beneficios del control de las emisiones industriales:" |
| H3 de aplicaciones | "Aplicaciones en las ciudades:" | "Aplicaciones en las industrias:" |
| Nº de beneficios / aplicaciones | 7 / 7 | 9 / 9 |
| CTA de descarga | "¿Necesitas medir la contaminación en tu ciudad?" (informe de Bilbao) | "¿Quieres controlar el impacto de tus procesos…?" (informe de Cemex) |
| Slides del CTA | 3, propias | 3, propias |
| Taxonomía de casos | `sector/urbano` | `sector/industria` |
| Mapa de proyectos | **no** | **sí** (41 pines) |
| Altura a 1440 | 6081 | 7144 |

Los CTA de la cabecera y del slider apuntan **siempre a `/es/contacto/`** en
los 7 sectores; el 2º botón del hero siempre a `/es/descarga-catalogo/`. El
enlace del CTA de descarga sí es propio de cada sector.

### 2.3 El cuerpo es libre — y ese es el hallazgo importante

Entre el hero (§4) y el CTA de ancho completo (§6) cada sector monta **las
filas Divi que quiere**. Comparación literal:

| | Urbano | Industria y olores |
|---|---|---|
| Bloques | CTA descarga · Beneficios\|Aplicaciones · claim\|foto | Beneficios\|Aplicaciones · CTA descarga · lista de aplicaciones a 2 col · claim\|foto · **"Proyectos por todo el mundo" + mapa Google de 41 pines** |
| Secciones | 2 (S4 y S5) | 1 (S4 con 5 filas) |
| Orden | CTA **antes** de los beneficios | CTA **después** |

Investigación y consultoría, además, **no tiene CTA de descarga** (0 `.calls`).
Puertos y Minería tienen mapa; el resto no.

**Consecuencia para el CMS**: el content type no puede ser una lista plana de
campos fijos para el cuerpo. Hay una **cabecera y un pie fijos** (campos
tipados) y un **cuerpo de bloques ordenados** — un *flexible content* de 5
tipos ya identificados: `ctaDescarga`, `listasBeneficiosAplicaciones`,
`claimConFoto`, `listaSimple2Col`, `mapaProyectos`. Así está modelado en
`src/lib/sectores.ts`.

### 2.4 Inventario de los 8 sectores

| Sector | Ruta | Taxonomía | CTA descarga | Mapa | Casos | Arts |
|---|---|---|---|---|---|---|
| Urbano | `/sectores/calidad-del-aire-en-las-ciudades/` | `urbano` | sí | — | 3 | 3 |
| Industria y olores | `/sectores/control-de-emisiones-industriales/` | `industria` | sí | 41 | 3 | 3 |
| EDAR | `/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/` | ? | ? | ? | ? | ? |
| Petróleo y gas | `/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/` | `industria` | sí | — | 3 | 3 |
| Puertos y aeropuertos | `/sectores/contaminacion-del-transporte-maritimo/` | `puertos` | sí | 30 | 3 | 1 |
| Construcción | `/sectores/contaminacion-por-construccion/` | `obras` | sí | — | 1 | 3 |
| Minería | `/sectores/contaminacion-del-aire-por-la-mineria/` | `mineria` | sí | 32 | 3 | 1 |
| Investigación y consultoría | `/sectores/estudio-de-la-contaminacion-atmosferica/` | `investigacion-consultoria` | **no** | — | 3 | 3 |

> ⚠️ **`nav.ts` tiene el href de EDAR roto.** Guarda
> `…/sectores/monitorizacion-ambiental-y-control-de-olores-en-plantas-de-aguas-residuales/`,
> que devuelve **404**. El menú vivo del original apunta a
> `…/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/`.
> Corregir en `src/lib/nav.ts:108` (no es parte de esta fase, pero está medido).
> Por eso EDAR queda sin escanear en la tabla.

## 3. Reutilizable vs. nuevo

| Sección | Componente | Estado |
|---|---|---|
| Header + mega-menú + menú móvil | `HeaderNav` | ✅ **tal cual** |
| Foto de cabecera + kicker + H1 | — | 🆕 **`CabeceraSector`** — la franja de las otras 4 páginas es un `<div>` decorativo de 137/177px escrito a mano en cada `page.tsx`; aquí mide 212.6/221.7 y lleva dos módulos de texto encima. Se repite en los 8 sectores → componente propio |
| `banda-clientes` | `TrustBar` | ⚠️ **variante nueva** — misma `CLIENT_LOGOS` y mismo Swiper, pero **sin titular**, fila al **95%** (no 85%), `padding 20/0` (no 30/0/20) y sección de **122** (no 153.2). Prop `variant="sectores"` |
| Breadcrumb | — (hoy inline en cada `page.tsx`) | ⚠️ **extraer** — 4ª repetición del mismo `<ol>`; con 8 sectores por delante toca sacarlo a `Breadcrumb` |
| Hero 1/2+1/2 | `SectionRow` / `OutlineButton` / `BlueButton` | 🆕 **`SectorHero`** ensamblado con las piezas existentes (la retícula 1/2+1/2 con punteado a −65 no existe todavía) |
| CTA de descarga `.calls` | `CtaNewsletter` (mismo shortcode, otra piel) | 🆕 **`CtaDescarga`** — caja blanca con borde + foto sangrada en desktop, caja oscura con foto centrada en móvil. `CtaNewsletter` tiene la copy incrustada y no es parametrizable: no se toca |
| Beneficios \| Aplicaciones | — | 🆕 **`BeneficiosAplicaciones`** (2×`<ul>` con viñeta azul `::before` y h3 44/55). Ojo con el nombre: ya existe `software/ListaBeneficios`, que es otra cosa (blurbs con icono). Lo más parecido que hay es el `<ul>` de ventajas de `ProductosTabs`, que usa `list-disc` + `marker:text-[#0075C9]`; aquí el original usa `list-style: none` + `::before "•"` a 22.4px con `padding-left: 36` en el `<ul>` |
| Claim + foto | `SectionRow` | 🆕 pequeño — 2 columnas con el claim centrado vertical |
| CTA de ancho completo | `CtaBanner` + `software/CarruselCapturas` | ⚠️ **fusión** — `CtaBanner` sirve hoy **una** diapositiva sin autoplay, pero tiene la piel correcta (foto + velo, copy a la derecha, botón blanco). `CarruselCapturas` ya trae **exactamente** el motor que hace falta: fundido cruzado, flechas 48×48 a `opacity 0 / ±22px` reveladas por `group-hover` y dots de 7×7 a `bottom: 20`. Lo nuevo es solo cablearlos con `intervalMs = 7000` |
| "Nuestras soluciones" | `ProductosTabs` | ✅ **tal cual, con otros datos** (3 productos en vez de 5) — ya acepta `items` |
| "Últimos proyectos" | `UltimosProyectos` | ✅ **tal cual** — ya acepta `posts`, `title` y `ctaLabel/ctaHref`. Ojo: aquí el CTA va a `https://kunakair.com/case-studies/` (sin `/es/`) y con `target="_blank"` |
| "Artículos y Guías" | `UltimosArticulos` | ✅ **variante `monitor` con otros posts** (verificar el ritmo de fila en Fase 2) |
| Watermark K de S7 | patrón ya usado en `page.tsx` de la home | ✅ wrapper con `recurso-k-fondo.svg` a `0% 50%` |
| Botón subir | `ScrollToTop` | ✅ **tal cual** (ver nota de QA abajo) |
| Footer | `Footer template="tb"` | ⚠️ casi — la franja inferior usa **la foto del sector**, no `cabecera-puerto-1.jpg`. Hace falta una prop para la imagen |
| Mapa de proyectos (otros sectores) | — | 🆕 **fuera de alcance de esta página** (Urbano no lo tiene). Anotado para cuando se clone Industria/Puertos/Minería |

### Notas de QA que salen del recon (no se actúa en Fase 1)

- **`ScrollToTop`**: el original mide **40×40** con `border-radius: 5px 0 0 5px`
  y `padding: 5px`; el clon lo montó a 44×44 sin radio (M8). Medido idéntico en
  la home y en el sector, así que si se corrige hay que hacerlo en las 5
  páginas a la vez.
- **`.case-imagen-container`** sí lleva `border-radius: 10px` + `overflow:
  hidden` (el `<a>` interior va a 0): el `rounded-[10px]` de `UltimosProyectos`
  es correcto. Comprobado para no "arreglarlo" por error.
- Los **artículos rotan en cada carga** (tres cargas del mismo día devolvieron
  tres tríos distintos). Es el P4 heredado: los 3 posts irán congelados y la
  comparación px a px de ese bloque no vale.

## 4. Retícula y ritmo (valores medidos)

**Desktop 1440** — sección `padding-top: 57.59` (**4%**) en S3, S5 y S7;
`padding-bottom: 60` en S3, `14` en S5. Filas `padding: 28.7969` (**2%**)
arriba y abajo. Columnas 1/2 = 585.1 con gutter 5.5%; 1/3 = 367.4; 2/3 = 802.9.
Punteado siempre a **−65px** de la retícula (x 35.8 en la columna izquierda,
x 689 en la derecha).

**Móvil 390** — se confirman las cuatro reglas ya conocidas del proyecto: fila
al **86%** (335.4 desde x 27.3), secciones con **50px** de `padding-top`, filas
con **30px** fijos (no el 2%), y los titulares bajando de escala. Medidas:

| Elemento | 1440 | 390 |
|---|---|---|
| kicker | 40px/30.6 w700 | **40px/30.6** (no cambia) |
| h1 | 30px/36 w400 | **30px/36** (no cambia; envuelve a 2 líneas) |
| h2 del hero | 37px/37 w300 | **37px/37** (no cambia) |
| claim | 37px/37 w300 | **37px/37** (no cambia) |
| h3 Beneficios | 44px/55 w300 | **35px/43.75** |
| h2 de sección (Soluciones/Proyectos/Artículos) | 44px/55 w300 | **35px/43.75** |
| título del slider | 45px/58.5 w300 | **27px/35.1** |
| `.calls-title` | 37px/51.8 w400 #333 | **27px/37.8 w400 blanco** |
| `.calls-text` | 18/30.6 | **14/22.4** |
| botones Divi | 15px/44px | 15px/44px |

Ojo con el patrón: los **37px** del hero y del claim **no bajan** en móvil (la
misma regla que ya se descubrió en los h2 azules de la home), pero los **44px**
sí bajan a 35. No mezclar las dos escalas.

**Orden de las columnas en móvil** — en S3 la columna de la **foto y los
botones va primero** y el H2 + los párrafos después; o sea, en móvil el titular
aparece **debajo** de la foto y de los dos CTA (ver tira `m390-03`). En S5
fila 1 el claim va antes que la foto.
