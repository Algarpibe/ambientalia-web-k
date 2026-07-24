# Footer Specification (`footer.et-l--footer`)

## Overview
- **Target file:** `src/components/Footer.tsx`
- **Screenshot:** `docs/design-references/footer.jpg`
- **Interaction model:** estático + hovers de link + **dropdown de idioma que abre hacia ARRIBA**.

## DOM Structure
```
footer.et-l--footer > section (bg #fff, padding-top 56.36px)
├─ Row 0 (.et_pb_row_0_tb_footer, 5 columnas iguales, maxWidth 1380,
│         border-top: 1px solid #333, padding 28.17px 0)
│  ├─ col 1: <p><strong>PRODUCTOS</strong></p> + <ul> 6 links
│  ├─ col 2: SECTORES + 8 links
│  ├─ col 3: EMPRESA + 5 links + botón azul "¡Suscríbete!"
│  ├─ col 4: RECURSOS + 9 links
│  └─ col 5: CERTIFICACIONES + <a href=PDF><img certificacion-ens.png></a>
├─ Row 1 (.et_pb_row_1_tb_footer, cols 3/5 + 1/5 + 1/5)
│  ├─ col 3/5 footer-legal: copyright + links legales (12px) + línea "Página web diseñada con ♥ …"
│  ├─ col 1/5 .footer-redes: 5 iconos sociales
│  └─ col 1/5 .footer-idioma: menú idioma (globo + "Español" + submenú hacia arriba)
└─ Row 2: vacía (padding 20px 0 — espaciador)
```

## Computed Styles (exact)

### Row 0 — columnas de enlaces
- Row: `border-top: 1px solid #333; padding: 28.17px 0; max-width 1380` (ancho 85% como el resto).
- Cabecera de columna: `<strong>` fontSize **14px**/700. Color: **PRODUCTOS = #0075C9 (azul)**, las otras 4 = **#333** (así en el original — la primera columna va en azul).
- `ul`: list none; `line-height: 26px !important; padding-bottom: 1em`.
- Links: fontSize **14px**/400; color #333 (var(--negro)); sin subrayado; `transition: color .3s`.
- **Hover link:** `color: #0075C9`.

### Botón ¡Suscríbete! (col EMPRESA)
- `BlueButton` (boton-azul): bg/border #0075C9, blanco, pill 30px, 15px/700, flecha →; hover #7F8798. `padding-bottom: 10px` extra (regla footer).
- Original: `<span>` ofuscado con data-url base64 → **`/es/suscribete/`**. Clase `ocultar-es` = utilidades de idioma del tema (se oculta en EN/FR/AR); en el clon ES se muestra siempre.

### Col CERTIFICACIONES
- `<a href="/doc/11.Certificates/Certificado_ENS_-_Kunak_Technologies.pdf">` (abrir en _blank) con `<img src=certificacion-ens.png>` — computed **100×121px**.

### Row 1 — legal / social / idioma
- **footer-legal (col 3/5):** párrafos fontSize **12px**; color #333; los links legales igual (12px/400 #333, hover azul). Segunda línea con corazón: SVG inline `#corazon` `width:16px; vertical-align:-2px` (usar `HeartIcon` de icons.tsx, color azul #0075C9 según original visual).
- **footer-redes (col 1/5):** `display:flex; text-align:end`; iconos `display:inline-block; margin-inline-start: 9px`; tamaño de glifo **25px**; color **#333**. En el clon usar `LinkedInIcon, XIcon, InstagramIcon, FacebookIcon, YouTubeIcon` de icons.tsx a ~22–25px.
- **footer-idioma (col 1/5):** menú alineado a la derecha (`justify-content: end`).
  - Trigger: icono globo `ico-globe.svg` **14×14** (`public/images/theme/ico-globe.svg`; hay variante blanca `ico-globe-blanco.svg`) + texto "Español" 14px #333 + caret ▾.
  - **Submenú abre hacia ARRIBA:** `top: -89px; width: 132px; border: 1px solid #333; border-radius: 10px; padding: 4px 0; box-shadow: none`.
  - Items: `padding: 6px 20px; transition: all .2s ease-in-out;` hover `background-color: rgba(0,0,0,0.03)`; 14px #333.

## States & Behaviors
- **Hover links (todas las columnas + legales):** color → #0075C9, transition color .3s.
- **Hover iconos sociales:** sin regla específica en el CSS del tema (mantener #333; opcionalmente azul — anotado para QA).
- **Dropdown idioma:** hover/click sobre "Español" muestra el submenú hacia arriba (Divi menu es hover-driven en desktop). Enter/exit sin animación relevante (fade corto Divi).
- **"Editar preferencias de cookies":** en el original es un botón del plugin GDPR (`moove-gdpr-infobar-settings-btn`, href vacío). En el clon: enlace no funcional o placeholder.

## Text Content (verbatim, con hrefs)

### PRODUCTOS
- Kunak AIR Pro → `/es/monitor-calidad-aire/`
- Kunak AIR Lite → `/es/estacion-de-monitoreo-de-calidad-del-aire/`
- Kunak AIR Cloud → `/es/software-de-medicion-calidad-del-aire/`
- Kunak API → `/es/kunak-api/`
- Cartuchos inteligentes → `/es/sensor-de-calidad-del-aire/`
- Accesorios → `/es/accesorios/`

### SECTORES
- Urbano → `/es/sectores/calidad-del-aire-en-las-ciudades/`
- Industria y olores → `/es/sectores/control-de-emisiones-industriales/`
- EDAR → `/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/`
- Petróleo y gas → `/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/`
- Puertos y aeropuertos → `/es/sectores/contaminacion-del-transporte-maritimo/`
- Construcción → `/es/sectores/contaminacion-por-construccion/`
- Minería → `/es/sectores/contaminacion-del-aire-por-la-mineria/`
- Investigación y consultoría → `/es/sectores/estudio-de-la-contaminacion-atmosferica/`

### EMPRESA
- Sobre Kunak → `/es/empresa/`
- Premios y reconocimientos → `/es/empresa/premios-y-reconocimientos/`
- Contacto → `/es/contacto/`
- Política de seguridad → `/es/politica-de-seguridad-de-la-informacion/`
- Sistema interno de información → `/es/sistema-interno-de-informacion/`
- Botón: "¡Suscríbete!" → `/es/suscribete/`

### RECURSOS
- Artículos y guías → `/es/recursos/guias/`
- Casos de éxito → `/es/casos-de-exito/`
- Blog → `/es/blog/`
- Documentos científicos → `/es/recursos/documentos-cientificos/`
- Kunakpedia → `/es/recursos/kunakpedia/`
- Preguntas frecuentes → `/es/recursos/preguntas-frecuentes/`
- Centro de ayuda → `/es/soporte/centro-de-ayuda/`
- Servicio de reparación (RMA) → `/es/soporte/servicio-de-reparacion/`
- Soporte técnico → `https://kunaksensing.atlassian.net/servicedesk/customer/portal/1/group/6/create/50` (externo)

### CERTIFICACIONES
- Badge ENS → `/doc/11.Certificates/Certificado_ENS_-_Kunak_Technologies.pdf`

### Barra legal
- "2026 © KUNAK TECHNOLOGIES SL · Aviso legal – Política de privacidad – Política de cookies – Editar preferencias de cookies"
  - Aviso legal → `/es/aviso-legal/`
  - Política de privacidad → `/es/politica-de-privacidad-y-de-proteccion-de-datos/`
  - Política de cookies → `/es/politica-de-cookies/`
  - Editar preferencias de cookies → (botón GDPR, sin href)
- "Página web diseñada con ♥ por Digital Design" — ♥ = SVG 16px; "Digital Design" → `https://digitaldesign.es/` (externo)

### Social (orden exacto)
1. LinkedIn → `https://www.linkedin.com/company/kunak/`
2. X → `https://twitter.com/KunaK_sensing`
3. Instagram → `https://www.instagram.com/kunak_technologies/`
4. Facebook → `https://www.facebook.com/KunakTechnologies/`
5. YouTube → `https://www.youtube.com/channel/UC-suigTybwCW50od_rhTZxg`

### Idiomas (submenú)
- Español → `https://kunakair.com/es/` (actual)
- English → `https://kunakair.com/`
- Français → `https://kunakair.com/fr/`
- العربية → `https://kunakair.com/ar/`

## Assets
- `public/images/uploads/2026/07/certificacion-ens.png` — ya descargado.
- `public/images/theme/ico-globe.svg`, `ico-globe-blanco.svg` — descargados en esta fase.
- Iconos sociales y corazón: usar `icons.tsx` (ya existen LinkedInIcon, XIcon, InstagramIcon, FacebookIcon, YouTubeIcon, HeartIcon, GlobeIcon).
- El PDF ENS no se descarga (enlace externo al original o placeholder).

## Responsive Behavior
- **≥981px:** 5 columnas iguales (row0); row1 = 3/5 + 1/5 + 1/5.
- **≤980px:** columnas apiladas (Divi); footer-redes e idioma se apilan a la izquierda; `footer-idioma` width 17.6% hasta 1023px (regla del tema) — en móvil apilado.
- **≤767px:** todo en una columna; iconos sociales en fila; submenú idioma sigue abriendo hacia arriba.

## Addendum B4 — ritmo móvil medido en vivo (2026-07-23, `qa/b4-probe.mjs`, 390 real)

- Sección links pt **50** (56 es desktop); fila pt/pb **30**, margen lateral 27.3 (fila 335.4).
- Headings `p` de **30.6 SIN margen**: line-height **30.6px fijo** heredado (1.7em del
  body de 18px — NO 1.7 sin unidades). Aplica también al legal (12px → lh 30.6 igual).
- li de **26px exactos**: el original fija fs 14 en el li (con fs heredado de 18, el
  strut infla la caja a 28). ul con **pb 14**.
- Botón ¡Suscríbete!: 48 antes (32 mb widget + 16 wrapper), alto **45** (pb 10 móvil,
  no 9), 46 después (30 mb span + 16 wrapper).
- CERT: heading 30.6 + img 121.7 pegada; después **62** (32 mb widget + 30 pb fila).
- Legal: fila con pad **1%** (3.9), bloque 122.4 (3 líneas + 1 a lh 30.6) + **62**
  hasta iconos; iconos (25px, caja 31.6) + **30** hasta idioma (30); spacer final 40.
- Iconos sociales móvil: margen Divi responsive `0 33.7 0 9` → **42.7 entre iconos,
  9 de entrada** (desktop: 9px entre iconos, sin cambio).
- Total footer móvil original: **1761.4**.
