# REUSE_NOTES.md — Secciones reutilizables en /monitor-calidad-aire

> Grupo A (fase de specs). Estas secciones NO llevan spec completo: se reutiliza el componente existente con cambios de contenido/props. Referencia de contenido verbatim: get_page_text en PAGE_TOPOLOGY.md y BEHAVIORS.md de esta carpeta.

## 1. CtaBanner → "No se puede mejorar lo que no se puede medir…" (S2)

- Reutilizar **`CtaBanner`** (patrón CtaInmerso/CtaPreocupa).
- Cambios: **alineación de texto IZQUIERDA** (los de la home van a la derecha → prop `align: 'left'`), foto ciclistas urbanos (asset nuevo a capturar en build), overlay oscuro, H2 blanco 3 líneas + párrafo-cita con `(Snyder et al., 2013)` + CTA outline blanco `Empezar a medir con precisión →` → `/es/contacto/` (verificar href en build).
- El original es un `et_pb_fullwidth_slider` de 1 slide — se replica como banner estático.

## 2. SectoresCarousel → "Aplicaciones" (S3 `#applications`)

- Reutilizar **`SectoresCarousel`** tal cual (mismas 6 slides, mismos textos/fotos/links que la home).
- Cambios de props: título del bloque `Aplicaciones` + variante **embebida en columna** (ancho contenedor 3/4, NO fullwidth) + bullets tipo guion/píldora (activo azul más ancho). Revisar que el componente acepte `variant="embedded"` o equivalente; si no, prop nueva.
- Tras el carrusel (mismo bloque): H3 azul `Facilitamos la toma de decisiones con datos ambientales precisos.` + **banner guía "Diseña tu proyecto de calidad del aire"** (foto peatones + copy + CTA `Descargar ahora →`). El popup del CTA es NUEVO (spec en Grupo B); decisión ya tomada: replicar visualmente, submit → `/es/contacto/`, sin backend.

## 3. UltimosProyectos → "Casos de éxito" (S3 `#case-studies`)

- Reutilizar **`UltimosProyectos`** con las MISMAS 3 tarjetas de la home (Nama Water Services / Valdemingómez / Virginia DEQ).
- Cambios: título `Casos de éxito`, CTA **outline** `Ver todos los casos →` (la home usa otro texto: "Ver todos los casos de éxito"), y va dentro de la columna 3/4 (ancho menor — verificar grid 3→3 se mantiene, en el original sí, tarjetas más estrechas).

## 4. UltimosArticulos → "Artículos y Guías" (S4)

- Reutilizar **`UltimosArticulos`**.
- Cambios: título `Artículos y Guías`; 3 posts distintos: (1) `¿Cómo afecta la contaminación del aire en el deporte practicado al aire libre?` — Sep 24, 2020; (2) `Kunak AIR Lite: la estación basada en sensores para medir la calidad del aire con infinitas aplicaciones` — Jun 30, 2022; (3) `Monitores de calidad de aire móviles: más datos, decisiones mejor informadas` — May 18, 2021. CTA igual: `Amplia tus conocimientos con nuestras guías →`. Imágenes de los 3 posts = assets nuevos (capturar en build).
- Sección a ancho completo de página (fuera de la fila 1/4–3/4).

## 5. ProductosTabs (patrón `lista-contenido`) → "Paquetes de energía" (`#power-packs`) y "Sondas meteorológicas" (`#meteo-sensors`)

- Reutilizar/generalizar **`ProductosTabs`**: mismo shortcode dual (lista izq con `li-activo` + iconos ⊕/⊖ + panel derecho card; acordeón inline en ≤980).
- Instancia 1 — `Paquetes de energía` (id original `producto-accesorios-power_packs`), 3 items: `Panel solar` (activo inicial; desc: "El panel solar monocristalino de alta eficiencia de 6,3 voltios es robusto, resistente al agua (IP67) y ha sido diseñado para un uso prolongado en exteriores en cualquier entorno." + `Ver más →`), `Cargadores para exteriores` ("Pequeño, ligero e impermeable…"), `Cargador para interiores`. Imagen panel: `/2022/12/kunak_IMG_0017-300x300-2.jpg` (asset nuevo) + imágenes de los otros 2 (capturar en build).
- Instancia 2 — `Sondas meteorológicas`, 6 items: `Anemómetro Mecánico` (activo; "Incluye sensores de velocidad y de dirección del viento." + `Ver más →`), `Anemómetro Ultrasónico` (sic: el original escribe "Anenómetro"), `Pluviómetro`, `Piranómetro`, `Termómetro de globo y de bulbo húmedo (WBGT)`, `Sensor Ultravioleta-A`. Imágenes por item (capturar en build).
- Diferencia visual vs home: los items llevan círculo ⊕/⊖ a la derecha del label (la home no lo tiene) → prop `showToggleIcons` o variante.
- Hrefs `Ver más` → páginas de accesorios (capturar en build).

## Compartidos sin cambios

`HeaderNav` (pasar imagen de cabecera `cabecera-puerto.jpg` + gradiente), `Footer` (añadir franja `footer-background` si no existe), `ScrollToTop`, `KunakLogo`, `VideoLightbox` (con prop de fuente YouTube — ver hero-producto.spec.md), tokens/fuentes de `globals.css`.

## NO usados en esta página

`TrustBar`, `CtaNewsletter`, `Testimonios`, `PresenciaMundial`, `Beneficios` (el de la home), `Sostenibilidad`, `HazVisible`, `SectoresIntro`, `HeroSection` (home), `SolucionProfesional`.
