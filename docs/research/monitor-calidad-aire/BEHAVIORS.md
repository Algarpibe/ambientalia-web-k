# BEHAVIORS.md — kunakair.com/es/monitor-calidad-aire (Kunak AIR Pro)

> Barrido de interacciones — 2026-07-23. Desktop 1045×515 CSS px, móvil 390 px (iframe same-origin).
> Todos los comportamientos verificados EN VIVO (clicks/drags reales salvo donde se indica).

## 1. Runtime y librerías

- jQuery + SwiperJS (`sectoresSwiper`) + Divi builtin — como la home.
- **360 Javascript Viewer** (`@3dweb/360javascriptviewer` 1.7.32, plugin `360deg-javascript-viewer`) — NUEVA.
- **Popups for Divi** 3.2.7 (`da-overlay`) — NUEVA.
- Lightbox del tema (`lightbox.js`, overlay `lightboxOverlay`) + magnific-popup de Divi cargado.
- **Divi sticky elements** (`et_pb_sticky_module`) — primera página del proyecto que lo usa de verdad.
- **Animaciones de entrada: NINGUNA** — 27/27 módulos con `et_pb_animation_off(_tablet/_phone)`, verificado igual que en la home (M7). Clon estático fiel.

## 2. Header sticky y scroll-to-top — ♻️ COMPARTIDOS

Mismo comportamiento que la home (HeaderNav + ScrollToTop ya clonados): utility bar que desaparece,
`.fila-menu-principal-fixed` glass blanco con logo azul, dropdowns/mega menú, botón scroll-top fijo.
Sin trust bar en esta página. **No reimplementar nada.**

## 3. Visor 360° del hero — 🆕 driven-by-drag (+ auto-rotate inicial)

- Markup: `div` con `id="jsv-holder-…"` dentro de `et_pb_text_4`, data-attrs:
  `data-total-frames="35"`, `data-main-image-url=".../kunak360_IMG_01.jpg"`, `data-image-url-format="kunak360_IMG_xx.jpg"`,
  `data-speed="90"`, `data-inertia="12"`, `data-zoom="true"`, `data-reverse="true"`, `data-auto-rotate="1"`,
  notificación por defecto "drag to rotate" activada (hint pill "arrastrar para rotar" sobre la imagen).
- Comportamiento observado: al cargar hace **1 vuelta automática** (`auto-rotate:1`); overlay "360°⟳" + pill de hint;
  al **arrastrar horizontalmente** rota frame a frame con inercia (verificado con drag real: la vista cambió de frontal a trasera
  y el hint desapareció tras la primera interacción). `data-reverse` invierte el sentido respecto al drag.
- Implementación clon sugerida (Fase 3): componente cliente con las 35 imágenes precargadas, pointer events →
  índice de frame = f(deltaX × speed), inercia con rAF, hint overlay que se oculta en el primer pointerdown, vuelta automática inicial.

## 4. "Ver vídeo del producto" — ♻️ VideoLightbox (fuente YouTube)

- Botón outline `et_pb_button` con `href="#video"` (no existe elemento `#video`: interceptado por `lightbox.js` del tema).
- Al click: overlay `lightboxOverlay` + caja blanca centrada con **X** arriba-derecha e iframe
  `https://www.youtube.com/embed/tuTfw6KIvd4?feature=oembed` dentro de `.et_pb_video_box`. Cierre con X verificado.
- El clon ya tiene `VideoLightbox` (M5, Brightcove): **parametrizar la fuente** para aceptar YouTube embed.

## 5. Sub-nav de anclas sticky + scrollspy — 🆕 (desktop only)

- Columna `.et_pb_column_1_4 .columna-lista-anclas et_pb_sticky_module` en S3, con:
  caja `menu-anclas` (borde 1 px redondeado) con `<ul>` de 8 `<a>` (`id="link-<ancla>"`, `href="#<ancla>"`) +
  3 botones CTA debajo (ficha técnica PDF / contacto / `#catalogo`).
- **Sticky Divi por JS** (no CSS sticky): al scrollear con eventos reales añade `et_pb_sticky et_pb_sticky--top`
  e inline `position:fixed !important; top:70px; z-index:10000; width:172px…`. Con scroll programático instantáneo NO engancha
  (rAF del listener) — en el clon usar `position:sticky; top:70px` nativo, resultado idéntico.
- Se libera al final de la fila S3 (vuelve al flujo). La columna es más alta que el viewport a 515 px → los CTAs quedan bajo el fold mientras está pinned (fiel al original).
- **Scrollspy**: clase **`activo`** sobre el `<a>` correspondiente (azul + bold vs gris). Se adelanta bastante al bloque
  (offset grande, ~1 viewport: p.ej. marca "Ensayos y pruebas" cuando aún se ve Especificaciones). Para el clon:
  IntersectionObserver con rootMargin generoso; calibrar offset exacto en Fase 3 si se quiere fidelidad pixel-perfect.
- **Click en ancla**: scroll SUAVE animado (jQuery) hasta dejar el módulo destino en el TOP del viewport, **sin compensar el header fijo**
  (el H2 queda parcialmente tapado por el glass — comportamiento real del sitio). NO cambia el hash de la URL.
- **Móvil (≤980)**: `menu-anclas` → `display:none`. La columna sticky queda solo con los 3 botones → **barra sticky horizontal**
  bajo el header (banda gris, botones en fila con wrap; en el sitio real el primer botón se corta por la izquierda a 390 px — fiel).

## 6. Carrusel Aplicaciones — ♻️ SectoresCarousel (Swiper)

- MISMO shortcode/instancia que la home: `swiper sectoresSwiper kunak-shortcode`, 6 slides únicos ×2 (loop), drag + dots clicables,
  hover/active revela descripción + "Ver más →". Sin autoplay observado.
- Diferencias: embebido en la columna 3/4 (ancho contenedor, no fullwidth); bullets con forma de guion/píldora (activo más ancho azul).
- Reutilizar el componente con prop de variante de ancho/paginación.

## 7. Galería "Ensayos y pruebas" — 🆕 slider fade con dots numerados

- `et_pb_gallery et_pb_gallery_0 galeria et_pb_slider et_pb_gallery_fullwidth`: 9 `gallery_item` (gráficas webp) en marco card gris.
- Flechas `.et-pb-arrow-prev/next` (`<a href="#">`) **aparecen al hover** sobre la galería; click → slide siguiente (verificado:
  active idx 0→1→2 con **crossfade**). 9 dots `.et-pb-controllers` (activo oscuro), clicables.
- OJO: las flechas son `href="#"` — en el clon usar `<button>` y `preventDefault` (en el sitio real provoca saltos de scroll ocasionales).
- Sin autoplay observado durante la sesión (~30 s en pantalla).

## 8. Tabs "Paquetes de energía" / "Sondas meteorológicas" — ♻️ patrón ProductosTabs (`lista-contenido`)

- Mismo shortcode que "Nuestros productos" de la home: `#producto-accesorios-power_packs` / equivalente meteo,
  `lista-contenido kunak-shortcode > lista-contenido-ul > ul > li > span[data-id]` + `.lista-contenido-item[data-id="item-…"]`.
- Cada `li` lleva icono **⊕/⊖** (circular): activo = ⊖ + texto azul (`li-activo`), panel derecho `item-activo` (display:flex)
  con imagen + título + descripción + "Ver más →" en card con borde redondeado.
- Click con ratón real verificado: cambia `li-activo`, alterna paneles. (El `.click()` programático NO dispara el handler jQuery.)
- **DOM duplicado**: cada item existe 2 veces — copia dentro del `li` (acordeón móvil) + copia en el panel (desktop).
  En **móvil** funciona como **acordeón**: el contenido se expande inline bajo el label activo (verificado a 390 px).
- Reutilizar/generalizar el componente ProductosTabs existente (mismo modelo dual desktop-panel / mobile-accordion).

## 9. Popup "Descargar ahora" (guía) — 🆕 modal con formulario (Popups for Divi)

- Trigger: CTA outline "Descargar ahora →" (`href="#disenar-proyecto-form-esp"`) en el banner "Diseña tu proyecto de calidad del aire".
- Click real verificado: abre overlay `da-popup`/`da-overlay evr_fb_popup_modal` — fondo oscurecido + blur, modal blanco centrado con **X**:
  "Para descargar la guía, rellena el siguiente formulario. Te enviaremos un email con el enlace al documento."
  Campos: Nombre y Apellidos*, Email de trabajo*, Empresa*, País* (select), Sector* (…y envío; no se rellenó el formulario).
- Requiere click confiable (dispatchEvent sintético no lo abre). Cierre con X verificado.
- Clon: modal propio (portal + overlay blur) con el formulario maquetado; envío real fuera de alcance (decidir en Fase 3: mailto/no-op/API).

## 10. Ancla `#catalogo` — ⚠️ MUERTA en esta página

- Los botones "Descarga el catálogo" del bloque S1 y de la columna sticky usan `href="#catalogo"`, pero **no existe** ningún
  elemento `id="catalogo"` ni popup registrado en el DOM: el click solo añade `#catalogo` a la URL (verificado; sin scroll ni modal).
- Probable popup roto/no publicado en el sitio real. Decisión para el clon: enlazar a `/es/descarga-catalogo/`
  (como hace el botón del header) o replicar el no-op. **Flag para Fase 3.**

## 11. FAQ — 🆕 toggles Divi independientes

- 19 × `et_pb_toggle et_pb_toggle_close kunak-faq-item`. Cerrado: título gris oscuro + ⊕ azul a la derecha, hairline inferior.
- Click en el título (verificado): `et_pb_toggle_close → et_pb_toggle_open`, título pasa a AZUL, icono ⊖, contenido se
  expande con slide-down (~300 ms, animación jQuery slideToggle de Divi).
- **Independientes, NO acordeón exclusivo**: se verificó 2 abiertos simultáneamente. Cada uno se cierra con segundo click.
- Respuestas con párrafos y `<ul>`; una respuesta enlaza "página 35 del catálogo".

## 12. CTA banner "No se puede mejorar…" — ♻️ patrón CtaBanner, variante izquierda

- `et_pb_fullwidth_slider` de **1 slide** → sin interacción (estático). Foto + overlay, texto blanco alineado a la IZQUIERDA
  + cita + CTA outline "Empezar a medir con precisión →". Reutilizar CtaBanner con prop de alineación.

## 13. Estáticos

- Breadcrumb, checklist 6 iconos, recuadros azules, chips de contaminantes (son `<a>` con hover), tabla de especificaciones
  (+ FCC/CE/RoHS), "Resultado de las pruebas" (chips + links a estudios), Casos de éxito (grid ♻️), Artículos y Guías (grid ♻️),
  Footer (♻️ + franja foto). Sin animaciones de entrada en ningún caso.

## 14. Notas de fidelidad / quirks del sitio real

1. Smooth scroll de anclas sin offset → títulos parcialmente bajo el header fijo (replicar o corregir: decidir).
2. Barra sticky de CTAs en móvil se corta por la izquierda a 390 px (fiel al original si se busca clon exacto).
3. Flechas de galería `href="#"` pueden provocar salto de scroll.
4. `#catalogo` muerto (ver §10).
5. Scrollspy con offset adelantado (~1 viewport).
6. El renderer se congela ocasionalmente con las imágenes lazy del sitio real (irrelevante para el clon, pero explica capturas lentas).
