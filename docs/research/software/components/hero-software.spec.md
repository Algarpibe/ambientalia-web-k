# hero-software.spec.md — `HeroSoftware` (S1 · fila 1)

> Medido el **2026-07-27** sobre `kunakair.com/es/software-de-medicion-calidad-del-aire/`
> con la extensión de Chrome (viewport **1280**, ancho útil **1264.7** —
> `clientWidth` con barra de scroll). Todas las cifras de esta ficha son
> *computed styles* + `getBoundingClientRect()` reales, no lecturas del CSS.
> Topología: `../PAGE_TOPOLOGY.md` §S1 · Comportamientos: `../BEHAVIORS.md`.

## Qué es

La fila 1 de S1: **1/2 + 1/2**. Izquierda toda la copy del hero + 2 CTAs;
derecha una foto. Es el mismo esqueleto que el hero de /accesorios **con la
misma inversión tipográfica `<p>` grande / `<h1>` pequeño**, más dos piezas que
/accesorios no tiene: una **línea de claim en versalitas azules** y un **segundo
CTA de app**.

```
<p>Kunak AIR Cloud</p>          ← 50px/60 fw800 #333   (titular VISUAL)
<h1>Software de medición…</h1>  ← 23px/23 fw300 #333   (bajada)
<h2>Analiza datos de forma…</h2>← 44px/55 fw300 #333
<p>DATOS EN TIEMPO REAL | …</p> ← 16px/30.6 fw800 #0075C9
[Solicita una demo gratuita]    ← BlueButton  → /contacto/
[Descargar app (Android)]       ← OutlineButton → Google Play (externo)
```

## Geometría (desktop, cw 1264.7)

| Elemento | Medida |
|---|---|
| Sección `et_pb_section_1` | `padding-top: 50.58px` (**4%** del ancho útil), fondo `recurso-k-fondo.svg` a `0% 50%`, `no-repeat`, sobre blanco |
| Fila | **80% máx 1380** = 1011.7, `padding: 25.29px 0` (**2%**), `margin-bottom: 25.29px` |
| Columnas | **478 + 478** (47.25% cada una), gutter **5.5%** |
| Punteado | `punteado.svg` 60×22, absoluto, ~40px por encima del módulo de texto y **65px a la izquierda** de la retícula (regla del proyecto) |
| Kicker `<p>` | 50px / 60 / **fw800** / #333 · `margin: 0` |
| `<h1>` | 23px / 23 / fw300 / #333 · `padding-bottom: 10px` · `letter-spacing: -0.5px` |
| `<h2>` | 44px / 55 / fw300 / #333 · `padding-bottom: 10px` · módulo con `margin-bottom: 6.2px` |
| Claim `<p>` | **16px / 30.6 / fw800 / #0075C9** · módulo con `margin-bottom: 27.81px` |
| CTA 1 | `BlueButton` — 15px/25.5 fw700, padding 7.5/40.5/9/22.5, radius 30, alto **43.3** |
| CTA 2 | `OutlineButton` (borde #333, fondo transparente) — mismas métricas |
| Foto | `2023/02/industrial-woman-engineer-using-the-cloud.jpg` 1024×683 → **478** de ancho, `alt="medicion calidad aire Kunak AIR Cloud"` |

Anclas verticales medidas (y absolutas): kicker 206.5 · h1 266.5 · h2 336.9 ·
claim 573.1 · CTA1 631.5 · CTA2 732.7 · foto 206.5.

## Textos verbatim

- Kicker: `Kunak AIR Cloud`
- H1: `Software de medición de la calidad del aire`
- H2: `Analiza datos de forma sencilla y obtén información útil para la toma de decisiones`
- Claim: `DATOS EN TIEMPO REAL | SIEMPRE ACTUALIZADO`
- CTA 1: `Solicita una demo gratuita` → `/es/contacto/`
- CTA 2: `Descargar app (Android)` →
  `https://play.google.com/store/apps/details?id=com.kunak.kunak`
  (**`target="_blank"`** en el original; es un enlace externo real, no se
  localiza)

## Breadcrumb (S0)

`<ol class="kunak-breadcrumbs">` con microdatos schema.org, 3 niveles:
**Inicio** → `/es/` · **Productos** → `/es/productos/` · **AIR Cloud** (último,
sin enlace). Mismo componente inline que /accesorios.

## Móvil (390)

Columnas apiladas a **312px** con la foto debajo del bloque de texto. El h2 baja
a **35px** con interlínea 1.25 (regla Divi ya aplicada en /accesorios: los h2
son MÁS grandes en móvil, no más pequeños, salvo los de 44 que bajan a 35). El
kicker y el h1 no cambian de tamaño. Sin scroll horizontal.

## Trampas heredadas que aquí ya nacen resueltas

- **A3** (`overflow-wrap: break-word` en `body`) ya está aplicado en
  `globals.css` desde el commit `9435b79`: los titulares largos parten como en
  el original desde el primer render.
- **`padding-left: 0` en los titulares**: el original mide 0 en h1/h2 (el
  `pl-[10px]` que llevaba /accesorios era un bug del clon). No añadirlo.
- **`padding-bottom: 10px`** sí va en todos los h1/h2 (regla Divi).
