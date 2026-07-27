# sondas-meteorologicas.spec.md — Bloque "Sondas meteorológicas" (S3 · col. derecha · ancla `#meteo-sensors`)

> Recon 2026-07-26: getComputedStyle en vivo (col. 3/4 = **744.885px**) + **CSS canónico del tema**
> (`KunakAir/style.css` §".lista-contenido", citado verbatim) + handler real de `init.js` (transcrito).
> Móvil verificado con iframe same-origin a 390px. Switching por hover verificado disparando `mouseenter` real.
> ♻️ **Mismo patrón `lista-contenido` que ProductosTabs de la home** (`docs/research/components/productos-tabs.spec.md`
> documenta el mecanismo compartido). Este spec cubre los datos de ESTA instancia y sus diferencias.

## Estructura

Dos módulos hermanos en `.columna-caracteristicas` (los últimos del bloque S3):

1. **Título** `.et_pb_text_30` con **`id="meteo-sensors"`** (ancla del sub-nav): `<h2>Sondas meteorológicas</h2>`
   — **37px/37px w300 #333 ls ‑0.5px pb 10px** (escala S3, NO la de 44px). `margin-bottom: 2.75%` (~27.8px).
2. **Shortcode** `.et_pb_text_31 > #producto-accesorios-meteo_sensors.lista-contenido.kunak-shortcode`:

```
#producto-accesorios-meteo_sensors        (width 100%, overflow hidden)
├─ .lista-contenido-ul                    (float:inline-start; width 30%; min-width 250px @≥1080; computed 250px @744)
│  └─ ul > li ×6 (margin-bottom 10px)
│     ├─ span[data-id]                    ← etiqueta hoverable (el 1º con .li-activo inicial)
│     └─ .lista-contenido-item[data-id="item-…"]  ← duplicado inline, SOLO móvil (título en <p>)
└─ .lista-contenido-content               (float:inline-end; width 60%; computed 446.9px @744)
   └─ .lista-contenido-item[data-id="item-…"] ×6  ← paneles desktop (título en <h3>)
```

## Los 6 ítems (verbatim)

| # | `data-id` | Label lista | Intro (verbatim) | Imagen (`/uploads/2022/12/…`) | href `Ver más` |
|---|---|---|---|---|---|
| 1 | `anemometro-mecanico` (activo inicial) | Anemómetro Mecánico | Incluye sensores de velocidad y de dirección del viento. | `kunak_IMG_0047-copia-300x300-1-300x300.jpg` (300×300) | `/es/accesorios/#anemometro-mecanico` |
| 2 | `anemometro-ultrasonico` | **Anenómetro Ultrasónico** (sic, typo del original — replicar) | Incluye sensores de velocidad y de dirección del viento. *(misma frase que #1, sic)* | `kunak_IMG_0061-copia-300X300-300x300.jpg` (300×300; ojo `300X300` mayúscula en el nombre) | `/es/accesorios/#anemometro-ultrasonico` |
| 3 | `pluviometro` | Pluviómetro | Gracias a su gran fiabilidad, fácil mantenimiento y limpieza sencilla, ofrece aplicaciones en todos los climas. | `rain-gauge-300x300.jpg` (300×300) | `/es/accesorios/#pluviometro` |
| 4 | `piranometro` | Piranómetro | El piranómetro mide la radiación solar mediante una termopila ennegrecida de alta calidad protegida por una cúpula. | `pyranometer-300x300.jpg` (300×300) | `/es/accesorios/#piranometro` |
| 5 | `termometro-de-globo-y-de-bulbo-humedo-wbgt` | Termómetro de globo y de bulbo húmedo (WBGT) | El termómetro de globo y de bulbo húmedo (WBGT) mide el estrés térmico bajo la luz solar directa, teniendo en cuenta la temperatura, la humedad, la velocidad del viento (sensación térmica) y la radiación solar. | `WBGT-300x300-1-300x300.jpg` (300×300) | `/es/accesorios/#termometro-de-globo-y-de-bulbo-humedo-wbgt` |
| 6 | `sensor-ultravioleta-a` | Sensor Ultravioleta-A | Estos sensores UV-A detectan la radiación UV de 300 a 400 nm y están calibrados en unidades de densidad de flujo de energía de energía en vatios por metro cuadrado. *(sic: "de energía de energía" duplicado en el original)* | `apogee-su-202-ultraviolet-A-sensor-300x163.jpg` (**300×163**, único no cuadrado) | `/es/accesorios/#sensor-ultravioleta-a` |

En el panel desktop el título repite el label dentro de `<h3>`; hrefs completos: `https://kunakair.com` + ruta.

## Estilos (CSS canónico + computed)

### Etiqueta de lista (`span[data-id]`) — DIFERENCIA con la home

- display block; **fontSize 22px; lineHeight 1.2em (26.4px); w400**; padding `5px 50px 5px 0`; cursor pointer.
  (La home los tiene a 30px w700 vía override `#lista-soluciones` — aquí NO aplica. Sin `strong` de subtítulo.)
- Icono: `background: url(ico-plus-negro.svg) no-repeat right 5px; background-size: 28px 28px`.
- **Inactivo: `opacity: .3`** (color #333) · **hover: `opacity: 1; transition opacity .3s`** ·
  **activo `.li-activo`: `color: var(--azul); opacity: 1; background-image: url(ico-minus-azul.svg)`**.
  (Iconos YA en `/images/theme/` — los mismos que usa `ProductosTabs`.)

### Panel activo (desktop ≥768)

- Base: `display:none; opacity:0; visibility:hidden`. Activo: `display:flex; opacity:1; visibility:visible`
  — **cambio instantáneo, sin transición** (flex-direction row ≥576).
- **Card**: `border: 1px solid #777; border-radius: 10px; padding: 30px; margin-bottom: 2rem` (computed 446.9×280 @744).
- Interior 50/50: `.lista-contenido-item-imagen` 50% (193px) + `.lista-contenido-item-txt` 50% (193px).
- **H3 título panel: 32px/32px w300 #333 ls ‑0.5px pb 10px** (misma escala que "Resultado de las pruebas").
- Intro: **18px / 27px (1.5em) w400 #333**; wrapper `.lista-contenido-item-introduccion` margin-bottom 20px.
- Botón `Ver más` = **`OutlineButton` EXACTO** (15px w700 #333, transparente, borde 1px #333, radius 30,
  padding 7.5/40.5/9/22.5, flecha ETmodules visible; verificado computed idéntico al componente del clon).

## Comportamiento (handler real de `init.js`, compartido con ProductosTabs)

```js
$("#producto-accesorios-meteo_sensors li span").on("mouseenter", toggleActiveClasses)
```

- **Desktop (body.min-768, matchMedia ≥768px): HOVER-driven** — mouseenter activa el ítem y desactiva el resto
  (exclusivo; verificado en vivo). No hay toggle-cierre en desktop.
- **Móvil (<768)**: el tap dispara mouseenter → si el ítem ya está activo, **cierra todo** (estado "ninguno abierto"
  es válido); si no, lo abre en exclusiva y anima scroll hasta `li.offset().top − 5` (jQuery "slow", ~600ms).
- El clon YA implementa este mecanismo en `ProductosTabs.tsx` (hover/acordeón + scroll B5) → **generalizar/reutilizar**.

## Diferencias móvil (≤767, verificado a 390px)

- `.lista-contenido-content` → `display:none !important`; se muestran los **duplicados inline** dentro de cada `<li>`.
- **El 1º ítem arranca ABIERTO** también en móvil (su duplicado inline lleva `item-activo` de serie).
- Ítem inline: `flex-direction: column`, **SIN card** (sin borde/padding: la regla card es solo ≥768);
  el título del duplicado es un `<p>` plano (no h3), seguido de intro y botón.
- `li`: `border-bottom: 1px solid #999; padding-bottom: 10px` (+ margin-bottom 10px); el último sin borde.
- Labels: mismos 22px/1.2 (sin cambio de tamaño).
- Franja 576–767: ítem inline pasa a `flex-direction: row` con imagen 50% / texto 50% (sigue sin card).

## Assets NUEVOS a descargar (6 imágenes — únicas nuevas del bloque)

| Asset | URL origen |
|---|---|
| Anemómetro mecánico | `https://kunakair.com/wp-content/uploads/2022/12/kunak_IMG_0047-copia-300x300-1-300x300.jpg` |
| Anemómetro ultrasónico | `https://kunakair.com/wp-content/uploads/2022/12/kunak_IMG_0061-copia-300X300-300x300.jpg` |
| Pluviómetro | `https://kunakair.com/wp-content/uploads/2022/12/rain-gauge-300x300.jpg` |
| Piranómetro | `https://kunakair.com/wp-content/uploads/2022/12/pyranometer-300x300.jpg` |
| WBGT | `https://kunakair.com/wp-content/uploads/2022/12/WBGT-300x300-1-300x300.jpg` |
| Sensor UV-A | `https://kunakair.com/wp-content/uploads/2022/12/apogee-su-202-ultraviolet-A-sensor-300x163.jpg` |

(Se usa el crop `-300x300` que sirve el atributo `src` del original; los iconos ⊕/⊖ ya están en el clon.)

## Datos → `monitor.ts`

`METEO_SENSORS: { id, label, intro, image, href }[]` (6 ítems, 1º activo). Reutilizar el shape de
`ProductosTabs` si se generaliza (los campos extra de `Product` — tagline/highlight/bullets — aquí quedan vacíos;
alternativa: prop de variante con modelo reducido). Ver REUSE_NOTES §5 para la instancia gemela `#power-packs`.
