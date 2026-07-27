# faq.spec.md — Sección "Preguntas frecuentes" (S5 · 19 toggles)

> Recon 2026-07-26: getComputedStyle en vivo + **CSS canónico del tema** (`KunakAir/style.css` §"kunak-faq",
> descargado y citado verbatim — sin distorsión de zoom) + **JS del acordeón extraído verbatim** del HTML de la página.
> Móvil verificado con iframe same-origin a 390px. Estados abierto/cerrado/hover verificados con clicks reales
> (independencia de toggles confirmada: abrir el 2º NO cierra el 1º).
> ⚠️ Hallazgo clave: los 19 toggles **NO son módulos Toggle de Divi** — es HTML escrito a mano dentro de UN solo
> módulo de texto (`.et_pb_text_inner > .kunak-faqs-accordion`), con `<style>` y `<script>` vanilla inline al final.

## Contexto de sección

- `section.et_pb_section_5`: fondo blanco + `url(recurso-k-fondo.svg) no-repeat 0% 0%` (watermark "K",
  asset YA en el clon: `/images/uploads/2022/12/recurso-k-fondo.svg`), padding vertical 4% (Divi default; ~50.6px @1265).
- Fila `et_pb_row_6.et_pb_row_1-4_3-4` — misma retícula 1/4–3/4 que S3 (en el clon: mismo contenedor 85%/max-1080).
- **Columna izquierda (1/4)**: `punteado.svg` decorativo (60×22, ya en clon) + H2 `Preguntas frecuentes`
  — **44px/55px w300 #333 ls ‑0.5px pb 10px** (mismo estilo que "Información del producto").
- **Columna derecha (3/4)**: `.kunak-faqs-accordion` con los 19 ítems. A 1600 de viewport: col izq 264px, col der 931px.

## Anatomía del ítem (CSS canónico del tema, verbatim)

```css
.kunak-faq-item {
    margin-bottom: 0 !important;
    border: none;
    background: transparent;
    border-bottom: 1px solid #d9d9d9;
    padding: 17px 8px;
    transition: all .2s ease;
}
.kunak-faq-item:first-child { border-top: 1px solid #d9d9d9; }
.kunak-faq-item:hover { background-color: #f4f4f4; }
```

Markup por ítem (verbatim, todos empiezan cerrados):

```html
<div class="et_pb_module et_pb_toggle et_pb_toggle_close kunak-faq-item">
  <h3 class="et_pb_toggle_title">…pregunta…</h3>
  <div class="et_pb_toggle_content clearfix">…párrafos…</div>
</div>
```

### Título (`h3.et_pb_toggle_title`)

- **1.2rem (19.2px) / lh 1.4, w400, color `var(--negro)` #333, ls 0**, padding 0, cursor pointer, `transition all .2s`.
- **Hover: color `var(--azul)` #0075C9** (título + icono cambian juntos).

### Icono ⊕/⊖ (`::before` del título)

```css
.kunak-faq-item .et_pb_toggle_title:before {
    background: url(ico-plus-negro.svg) no-repeat right top;
    content: ""; display: block;
    background-size: 22px 22px; width: 24px; height: 24px;
    position: absolute; top: 2px; inset-inline-end: 0;
}
```

Matriz de estados (4 SVGs del tema — **los 4 YA están en el repo**):

| Estado | Icono |
|---|---|
| cerrado | `ico-plus-negro.svg` |
| cerrado + hover | `ico-plus-azul.svg` |
| abierto | `ico-minus-negro.svg` |
| abierto + hover | `ico-minus-azul.svg` |

En el clon: `ico-plus-negro` e `ico-minus-azul` ya viven en `/images/theme/`; `ico-minus-negro` e
`ico-plus-azul` están en `/images/other/wp-content/themes/KunakAir/assets/images/` → copiarlos a `/images/theme/`.

### Contenido (`.et_pb_toggle_content`)

- **1rem (16px) / lh 1.7, w400 #333**.
- Abierto: `padding-top: 0.5rem`. Párrafos: `p:not(:last-child) { padding-bottom: 0.5rem }`.

## Mecanismo de apertura (JS vanilla inline, transcrito)

CSS base (inline `<style>` en el propio módulo):

```css
.kunak-faqs-accordion .et_pb_toggle .et_pb_toggle_content {
    max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
}
```

Script (inline, `DOMContentLoaded`): listener de **click en el título** en **fase de captura** con
`preventDefault + stopPropagation + stopImmediatePropagation` (para que el JS de toggles de Divi no interfiera):

- **Abrir**: `et_pb_toggle_close → et_pb_toggle_open` + `content.style.maxHeight = content.scrollHeight + 'px'`.
- **Cerrar**: swap inverso + fija `maxHeight = scrollHeight`, fuerza reflow (`void content.offsetHeight`) y pone `maxHeight = '0px'` → transición de cierre suave.
- **Toggles INDEPENDIENTES**: abrir uno no cierra los demás (verificado). Estado inicial: los 19 cerrados.

Equivalente React: estado `Set<number>` de abiertos + `max-height` animado con `scrollHeight` (o grid-rows).
Nota a11y: el original NO usa `<button>` ni aria-expanded (solo h3 clicable) — replicar visual; añadir
`<button>`/aria dentro del h3 es mejora aceptable que no cambia el render.

## Los 19 Q&A (verbatim)

Estructura del contenido indicada por ítem: `[Np]` = nº de párrafos, `[ul]` = lista.

1. **¿Los equipos Kunak son certificados ATEX?** [2p] — "Los equipos Kunak están diseñados para el monitoreo perimetral de emisiones difusas o detección de fugas en zonas no clasificadas como ATEX." / "Pueden adaptarse para operar en entornos con riesgo de explosión cumpliendo los requisitos de la Zona 1 ATEX, siempre que se configure el sistema adecuadamente."
2. **¿Qué área cubre cada dispositivo?** [1p] — "En cuanto al alcance del dispositivo, es importante tener en cuenta que los equipos Kunak realizan mediciones puntuales (point measurement). No existe un “radio” de alcance, es decir, miden la concentración en el punto donde están instalados. La representatividad espacial que pueda tener esa medición depende de múltiples factores como la orografía, las fuentes emisoras cercanas y las condiciones meteorológicas." (comillas tipográficas “” en el original)
3. **¿Cada cuánto tiempo se reemplazan los cartuchos y se renueva el software?** [2p] — "La vida útil de los cartuchos depende del tipo de sensor y las condiciones ambientales, con un rango estimado de entre 12 y 36 meses. Puede consultarse más información en la página correspondiente del catálogo." / "Los servicios en la nube (Kunak Cloud) se renuevan anualmente para mantener las funciones de análisis, calibración y trazabilidad actualizadas."
4. **¿El equipo es portátil o fijo?** [2p] — "Los equipos Kunak pueden instalarse en farolas, paredes, mástiles o trípodes." / "Gracias a su diseño ligero y modular, es posible reubicarlos fácilmente retirando la base y fijándolos en otro punto de la instalación." ⚠️ El original arrastra un `<span data-sheets-root="1">` mal anidado (artefacto de pegado desde Sheets, cruza los dos `<p>`) — NO replicar el span.
5. **¿Cada cuánto se calibra el equipo?** [2p] — "Los sensores se entregan calibrados de fábrica con certificado oficial de calibración." / "Para mantener la precisión de las mediciones, se recomienda realizar una calibración o ajuste remoto cada tres meses, o bien tras un cambio de ubicación o de estación del año."
6. **¿Qué opciones de calibración existen?** [2p + ul de 3] — "La calibración puede hacerse mediante tres métodos:" + lista: "co-locación con una estación de referencia" · "campana de gas (gashood) con botellas patrón" · "ajuste remoto utilizando datos históricos para corregir la línea base" + "La elección dependerá de las necesidades del proyecto y del presupuesto disponible."
7. **¿Se pueden obtener los datos en local (Modbus)?** [1p] — "Sí. Todos los equipos Kunak incorporan el protocolo Modbus RTU RSxx, que permite la transmisión y lectura local de datos sin depender de la conexión a Internet."
8. **¿Cómo se comunica el equipo?** [1p] — "El sistema puede enviar datos mediante conexión celular (4G/3G), Ethernet, Wi-Fi o Modbus, adaptándose a las infraestructuras de red disponibles en cada emplazamiento."
9. **¿Cuál es la duración de la batería?** [1p] — "Los equipos incluyen una batería interna de respaldo con una autonomía de entre 3 y 30 días, dependiendo de la configuración y del tipo de sensor activo."
10. **¿A qué altura debe instalarse el equipo?** [1p] — "Se recomienda una altura de instalación de 3 a 4 metros sobre el suelo, para garantizar representatividad en la medición y evitar interferencias o actos vandálicos."
11. **¿El equipo tiene memoria interna?** [1p] — "Sí. Dispone de memoria interna de alta velocidad capaz de almacenar los datos hasta 15 días sin conexión a Internet, asegurando la continuidad de los registros."
12. **¿Se pueden conectar sondas meteorológicas?** [1p con `<br />`] — "Sí. Kunak AIR Pro admite hasta 6 sondas meteorológicas. Kunak AIR Lite, hasta 2 sondas, según la versión del equipo.`<br/>`Esto permite correlacionar variables ambientales con las concentraciones de contaminantes."
13. **¿Puedo instalarlo en un vehículo o en un dron para monitoreo en movimiento?** [1p] — "Sí, siempre que la velocidad no supere los 20 km/h. De este modo se garantiza la estabilidad de la medición y la correcta captura de datos ambientales."
14. **¿Cuenta esta tecnología con certificaciones?** [2p] — "Los equipos basados en sensores no se rigen por una certificación única. Kunak valida continuamente sus dispositivos en campo junto a organismos independientes." / "Estas pruebas garantizan que los datos cumplen con la Directiva Europea de Calidad del Aire y los estándares de la US EPA."
15. **¿Es obligatorio el uso de la plataforma Kunak AIR Cloud?** [1p] — "Sí. Kunak AIR Cloud es esencial para compensar efectos de temperatura y humedad, ejecutar mantenimiento remoto y autodiagnóstico, corregir la línea base y validar los datos, y asegurar la trazabilidad y fiabilidad de las mediciones."
16. **¿Pueden utilizarse los equipos en interiores?** [1p] — "Sí. Los equipos pueden utilizarse en entornos industriales, ganaderos o logísticos, ofreciendo un control preciso de los contaminantes también en espacios cerrados."
17. **¿Cuál es la diferencia entre el sensor de partículas del AIR Pro y el AIR Lite?** [2p con `<sub>`] — "Kunak AIR Pro: Sensor de 24 canales, certificado MCERTS, mide partículas finas y gruesas (PM`<sub>`1`</sub>`, PM`<sub>`2.5`</sub>`, PM`<sub>`10`</sub>`) y cumple con medidas indicativas." / "Kunak AIR Lite: Sensor de 5 canales, sin certificación MCERTS, especializado en la detección de partículas finas."
18. **¿Cómo se integran los datos a una tercera plataforma?** [1p] — "Los datos pueden integrarse automáticamente mediante REST API, Modbus o FTP, facilitando la conexión con plataformas de terceros y sistemas de gestión ambiental o industrial."
19. **¿Cuál es la diferencia entre calibración y corrección?** [ul de 2 + 2p, único ítem con ENLACE] — lista: "La calibración ajusta la respuesta del sensor comparando sus datos con una referencia trazable (como una estación de referencia o gas certificado) para determinar su incertidumbre exacta." · "La corrección modifica la respuesta del sensor sin referencia externa para reducir errores y compensar la deriva natural, aunque no permite calcular la incertidumbre con precisión." + "En síntesis, la calibración usa una referencia externa y la corrección es un ajuste interno para mantener la fiabilidad del sensor." + "Más info en la página 35 del [catálogo]." — enlace `catálogo` → `https://kunakair.com/es/descarga-catalogo/` `target="_blank"` (= `CATALOG_HREF` ya en `monitor.ts`).

## Diferencias móvil (390px, verificado)

- **Ninguna en el ítem**: mismo 1.2rem/1.4, mismo padding 17px 8px, mismos bordes e iconos.
- La fila 1/4–3/4 apila: título encima, toggles debajo a ancho completo (single column).

## Assets

**Ninguno nuevo que descargar.** Los 4 iconos ⊕/⊖ ya están en el repo (2 en `/images/theme/`, 2 en el
mirror `/images/other/…` → copiar a `/images/theme/`); `recurso-k-fondo.svg` y `punteado.svg` ya en clon.

## Datos → `monitor.ts`

`FAQ_ITEMS: { q: string; a: FaqBlock[] }[]` donde `FaqBlock` modela párrafo (con segmentos texto/sub/br/enlace)
o lista `ul`. Solo el ítem 19 lleva href; el 17 lleva `<sub>`; el 12 lleva `<br>`.
