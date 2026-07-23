# PAGE_TOPOLOGY.md — kunakair.com/es (home)

> Reconocimiento realizado el 2026-07-22 sobre `https://kunakair.com/es/`.
> Viewport de referencia: **desktop 1440×900** (contenido ancho útil 1424×715).
> Alto total del `document.body`: **11538 px** (renderiza como una única página larga en scroll vertical).
> Wrapper raíz: `div#page-container > div#et-boc > (header.et-l--header + div#et-main-area > div#main-content + footer)`.

## Stack detectado

- **Plataforma:** WordPress + **Divi theme** (`wp-theme-Divi`, tema hijo `KunakAir`, plantillas Theme Builder `et-tb-has-header`).
- **Fuente principal:** `Manrope, sans-serif` sobre `document.body`.
- **JS runtime:** jQuery **3.7.1**, SwiperJS (`sectoresSwiper`), **Cookiebot** (consent, iframe oculto), scripts adicionales: `3d-flip-book`, `snazzymaps`, `dvmd-tm-module`, `txtcc-tooltip`.
- **Animaciones:** `Divi builtin` (`et_pb_animation_*`, 23 módulos con animaciones en la home). **No hay Lenis / Locomotive / GSAP / AOS / ScrollReveal.**
- **Idiomas disponibles:** ES (default), EN, FR, AR.
- **HTML lang:** `es-ES`. **Body classes**: `home wp-singular page-template-default page page-id-24305 custom-background wp-theme-Divi wp-child-theme-KunakAir et-tb-has-template et-tb-has-header`.

## Layout global

- Sin scroll containers anidados: el scroll ocurre en `<html>/<body>` (scroll nativo).
- **Header overlay al inicio**: el `<header class="et-l--header">` original es `position:absolute; top:0` sobre el hero, con fondo transparente y logo blanco. Se desplaza con la página.
- **Nav sticky secundario**: al hacer scroll aparece la fila `.fila-menu-principal` con la clase adicional `fila-menu-principal-fixed` que la fija arriba (`position:fixed; top:0; z-index:1000; background:rgba(255,255,255,0.576); box-shadow:0 0 20px rgba(0,0,0,0.1)`, altura 127 px). Al mismo tiempo se oculta la fila utilitaria superior (Soporte / Blog / Contacto / idioma).
- **Botón scroll-to-top** (`span.et_pb_scroll_top.et-pb-icon`): `position:fixed; bottom:125px; right:0; background:rgba(0,0,0,0.4); color:#fff; z-index:99999`. Aparece cuando se abandona el hero.
- **Cookiebot**: iframe `.CybotCookiebotHiddenIframe` off-screen; probablemente el banner sale al primer render y desaparece tras consent (no visible en las capturas actuales de este perfil).

## Header (posición `y = 0` a `225`)

Dos filas apiladas:

1. **Utility bar (`.et_pb_row_0_tb_header`)** — 41 px, transparente. Contiene: `Soporte ▼`, `Blog`, `Contacto`, `🌐 Español ▼`. Desaparece al hacer scroll (queda debajo del sticky).
2. **Main nav (`.fila-menu-principal`)** — 144 px, transparente en top. Logo **Kunak (SENSING ANYWHERE)** en blanco, nav: `Inicio · Productos ▼ · Sectores ▼ · Empresa ▼ · Casos de éxito · Recursos ▼`, botón outline pill `¿Cómo podemos ayudarte?`, botón sólido `Descargar catálogo`.

Al hacer scroll ≳ **~100–200 px** (umbral aproximado, activado por listener de scroll de Divi), la main nav se transforma:
- Fija arriba (`position:fixed`).
- Fondo blanco semi-transparente `rgba(255,255,255,0.576)` (glass).
- Logo cambia a variante **azul**; textos de nav pasan de blanco a gris/azul oscuro.
- Utility bar se desplaza fuera del viewport (no se refija).
- Sombra suave `0 0 20px rgba(0,0,0,0.1)`.
- Transición sobre `background-color 0.3s`.

## Mapa de secciones (`#main-content > article > .et_pb_section_*`)

Total: **13 secciones** + footer. Todas dispuestas verticalmente sin sticky ni scroll-snap, salvo el nav (arriba) y el botón scroll-to-top.

| # | idx CSS | Nombre operativo | Top (px) | Alto (px) | Fullwidth | Titular / notas |
|---|---------|------------------|---------:|----------:|:---------:|-----------------|
| 0 | `et_pb_section_0` | **Hero** | 0 | 752 | – | `H1` visualmente oculto "Monitoreo de la calidad del aire" + `H2` "La solución profesional para la monitorización de la calidad del aire" + subtítulo "Datos fiables y trazables para decisiones operativas y cumplimiento normativo". CTAs "Descubre cómo funciona" (link a `#video`) y "Catálogo". Barra inferior con logos EPA / MCERTS / AIRLAB (linkan a PDFs de estudios). Fondo: imagen aérea `imagen-banner-principal-2-1-1.webp` con overlay `linear-gradient(rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.47) 100%)`. `padding-top: 180px`. |
| 1 | `et_pb_section_1` | **Trust bar / logos clientes** | 752 | 153 | – | Título vertical a la izquierda "Con la confianza de empresas líderes"; a la derecha una **fila de logos que rota** (visto Repsol, Ricardo, Rio Tinto, APM Terminals, BHP, Iberia → luego Dunkerque Port, Lifeco, Acoem, Vito, Port of Zeebrugge, WHO). Detalle decorativo: matriz de puntos. |
| 2 | `et_pb_section_2` (id `home-content`) | **Producto — La solución profesional** | 905 | 2266 | – | Bloque de texto largo con varios sub-bloques: título "La solución profesional para la monitorización ambiental" + subtítulo azul "Mide múltiples contaminantes de forma precisa con la estación de calidad del aire más versátil". Párrafos con enlaces (CEN/TS 17660, EPA/600/R-20/279, EPA/600/R-23/14, EPA/600/R-20/280, EPA/600/R-23/145, Directiva …). Recuadro azul con norma internacional. CTAs "Descargar ficha técnica", "Descargar catálogo". Fila de 5 iconos+etiqueta ("Datos fiables en tiempo real", "Certificación MCERTS CSA MC230418/00", "Tecnología patentada", "Equipos en los 5 continentes", "+10 años de experiencia"). Sub-bloque **"Solución validada"** con logos de reguladores (EPA, MCERTS, AQ-SPEC, AirParif, CDMX Medio Ambiente, Ricardo). Sub-bloque **"Reconocimientos"** con 3 tarjetas de premios (EPA Wildland Fire Sensors Challenge – Honorable Mention, AIRLAB Challenge Awards – Best multi-pollutant sensor, AQE – Winner best AQ network) + texto y remate "Ganador del AIRLAB Microsensors Challenge" con laurel + cita destacada "Construye un futuro más sostenible…". |
| 3 | `et_pb_section_3` (id `home-content`) | **Sectores — intro** | 3171 | 544 | – | Título "Sectores" + subtítulo largo ("Controla la contaminación ambiental…"). Titular grande "**Una solución. Múltiples aplicaciones.**" + "Desliza las imágenes y encuentra la solución perfecta para tu sector." Sirve como cabecera del carrusel siguiente. |
| 4 | `et_pb_section_4` | **Carrusel Sectores (Swiper)** | 3715 | 618 | ✅ | **SwiperJS** `sectoresSwiper` con **6 slides únicos** (loop → 12 slides en DOM) y **6 dots de paginación**. Cada slide es una tarjeta con foto de fondo, un icono lineal centrado sobre la imagen y una etiqueta en la esquina inferior izquierda; al hover / activo muestra descripción y CTA `Ver más →`. Sectores identificados: Minería, Investigación y consultoría, Urbano, Industria, y (por texto en cards visibles) referencias a "combinando tecnología punta y conocimiento", "Crea espacios donde la gente quiera vivir…", "Ayuda a crear un futuro más limpio…". |
| 5 | `et_pb_section_5` | **Espaciador / decorativo** | 4333 | 56 | – | Fila muy corta, aparente separador visual. |
| 6 | `et_pb_section_6` | **CTA banner — "¿Estás inmerso en un proyecto…?"** | 4390 | 469 | ✅ | Fondo foto (gente caminando por ciudad) con overlay oscuro. Texto blanco alineado a la derecha con la pregunta "¿Estás inmerso en un proyecto de calidad del aire y necesitas información fiable?" + botón outline pill "Podemos ayudarte →". |
| 7 | `et_pb_section_7` | **Presencia mundial + Testimonios + Beneficios + Productos** (bloque compuesto muy alto) | 4858 | 3094 | – | Contiene, en este orden: (a) **"Presencia mundial"** con párrafos de rango (-30 °C a +50 °C, >80 países) y **mapa mundial** con países en azul; (b) CTA pill sólido "¿Cómo podemos ayudarte? →"; (c) **"Testimonios"** en **carrusel/slider** con flechas `‹ ›` a los lados, foto circular del entrevistado, cita larga y firma (visto Jérôme De Waele, Director General, AIRCOAN); (d) bloque **"Haz visible la contaminación"** con copy en dos columnas + CTA "Descargar catálogo" + destacado azul "Elige los contaminantes a medir…"; (e) grilla **"Beneficios:"** con iconos ("Mantenimiento reducido", "Calibración remota", "Software avanzado") + CTA sólido "Solicita más información →"; (f) bloque **"Nuestros productos"** con **acordeón/tabs custom** en columna izquierda de 4 items (`AIR Pro`, `AIR Lite`, `AIR Cloud`, `Kunak API`) marcado con `<span class="li-activo">` y panel derecho con imagen + nombre + descripción + subtítulo "BASADA EN SENSORES…" + bullet list ("Sistema de cartuchos, Totalmente autónomo, Datos en tiempo real, Precisión probada") + botón outline "Ver más →". Cierra con CTA sólido "Cuéntanos tus necesidades →". |
| 8 | `et_pb_section_8` | **CTA newsletter — "Innovación en calidad del aire a 1 clic"** | 7952 | 408 | ✅ | Fondo gris claro con **ilustraciones de aviones de papel** siguiendo trayectorias punteadas. Titular blanco grande "Innovación en calidad del aire a 1 clic" + subtítulo (parcial en captura) + CTA outline pill "¡Me apunto! →". |
| 9 | `et_pb_section_9` | **Últimos artículos (blog)** | 8413 | 788 | – | Título "Últimos artículos" a la izquierda. Grid de **3 tarjetas** de posts con imagen, titular truncado y fecha (visto 21 Jul 2026, 25 Jun 2026, 18 Jun 2026). CTA sólido bottom-right "Amplia tus conocimientos con nuestras guías →". |
| 10 | `et_pb_section_10` | **Últimos proyectos (casos de éxito)** | 9201 | 816 | – | Título "Últimos proyectos". Grid de **3 tarjetas** de casos, cada una: imagen de fondo + etiqueta pequeña "Sector: <NAME>" con el sector en enlace azul + título del cliente + descripción corta. Vistos: Nama Water Services (EDAR/PTAR – Omán), Vertedero de Valdemingómez (Olores), Virginia DEQ (Industria). CTA outline pill "Ver todos los casos de éxito →". |
| 11 | `et_pb_section_11` | **CTA banner — "¿Te preocupa la calidad del aire que respiras?"** | 10017 | 340 | ✅ | Fondo azul oscuro con foto de fondo (buque atracando). Texto blanco alineado a la derecha con pregunta. Botón (parcial en captura) probablemente "Contáctanos". |
| 12 | `et_pb_section_12` | **Comprometidos con la sostenibilidad** | 10357 | 546 | – | Título "Comprometidos con la sostenibilidad" (2 columnas: título izda, texto+iconos dcha). Copy "Las estaciones de monitorización… son los sistemas más sostenibles del mercado. En su fabricación, cuidamos al detalle:" + **3 columnas con icono**: `ecodiseño`, `reducción de residuos`, `eficiencia energética` (icono planeta, planta, panel solar). |
| Footer | `footer.et-l--footer` | **Footer** | 10948 | 591 | – | 5 columnas: `PRODUCTOS` (Kunak AIR Pro/Lite/Cloud/API, Cartuchos inteligentes, Accesorios), `SECTORES` (Urbano, Industria y olores, EDAR, Petróleo y gas, Puertos y aeropuertos, Construcción, Minería, Investigación y consultoría), `EMPRESA` (Sobre Kunak, Premios y reconocimientos, Contacto, Política de seguridad, Sistema interno de información) + CTA sólido "¡Suscríbete! →", `RECURSOS` (Artículos y guías, Casos de éxito, Blog, Documentos científicos, Kunakpedia, Preguntas frecuentes, Centro de ayuda, Servicio de reparación RMA, Soporte técnico), `CERTIFICACIONES` (badge ENS RD 311/2022). Barra inferior: copyright `2026 © KUNAK TECHNOLOGIES SL · Aviso legal – Política de privacidad – Política de cookies – Editar preferencias de cookies` + "Página web diseñada con ♥ por Digital Design" + **iconos sociales**: LinkedIn, X, Instagram, Facebook, YouTube + selector `🌐 Español ▼`. |

## Dependencias / superposiciones

- **Nav sticky** siempre por encima del contenido (`z-index:1000`).
- **Scroll-to-top** por encima de todo (`z-index:99999`).
- **Cookiebot** iframe fuera de flujo (`top:-9979`), sin impacto visual normal.
- El resto de secciones son bloque simple, sin overlays cruzados.

## Ancho útil observado

- Todo el contenido se enmarca en filas Divi estándar (`.et_pb_row`) con contenedor máximo aparente ~**1080 px** (ancho mostrado por los `.et_pb_row_1-4_3-4` y anchos de sombras/tarjetas), padding lateral simétrico.
- Las secciones marcadas `fullwidth` (`et_pb_fullwidth_section`) rompen el ancho útil y ocupan el 100 % del viewport (carrusel de sectores, CTA banners con foto, banner newsletter).
