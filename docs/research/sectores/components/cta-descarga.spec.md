# CtaDescarga — shortcode `calls` variante `call-con-foto`

> Medido 2026-07-28 a **1440×900** y **390×844** reales.
> Componente: `src/components/sectores/CtaDescarga.tsx`.
> Bloque del *flexible content*: `{ kind: "ctaDescarga", … }`.

## Qué es

El **mismo shortcode `calls`** que la newsletter de la home, con otra piel. Las
clases del original lo dicen:

```
calls one-column espacio-derecha call-fondo-blanco espacio-blanco-derecha call-con-foto
```
(la home usa solo `calls one-column`).

Y la piel **cambia entera entre desktop y móvil** — no es un simple reflow:

| | 1440 | 390 |
|---|---|---|
| Fondo | ninguno (transparente sobre blanco) | **`rgba(0,0,0,0.45)` + `mix-blend-mode: multiply`** → gris |
| Borde | **1px solid #d8d8d8** | **ninguno** |
| Color del texto | `#333` | **`#fff`** |
| `padding` | `40px 50px` | `30px 30px 40px` |
| `margin-bottom` | 46.25 | 12.5156 |
| Disposición | `.calls-content` es **flex** (foto izq. + texto der.) | bloque apilado |
| Foto | **280×246.39**, `margin: 0 20px 0 −30px` (se sale de la caja) | **165.23×145.27** centrada (`margin: 0 55.08`) |
| Botón | outline `#333`, fondo `rgba(255,255,255,.65)` | outline `#fff`, fondo `rgba(0,0,0,.15)` |

En móvil no hay imagen de fondo: el `multiply` sobre blanco deja el
`rgba(0,0,0,.45)` plano, o sea un gris ~`#8c8c8c`. (La home sí tiene foto
debajo; aquí no.)

## Contenedores

- La sección padre no aporta padding (`0`); el ritmo lo pone la **fila**:
  `padding: 28.7969 0` (2%) en desktop, `30 0` en móvil, retícula **86%** en los dos anchos.
- `.calls-content-inner` ocupa **866.39** en desktop (1136.39 − 280 de foto −
  20 de gap + los 30 que la foto se come por la izquierda).

## Tipografía

| Elemento | 1440 | 390 |
|---|---|---|
| `.calls-title` | `37px / 51.8px` **w400** `#333`, `padding-bottom: 10px` | `27px / 37.8px` w400 **`#fff`** |
| `.calls-text` | `18px / 30.6px` w400, `padding-bottom: 30px` | `14px / 22.4px` w400 `#fff` |
| `.calls-button` | `15px/25.5px` w700, `padding: 7.5 40.5 9 22.5`, `radius 30`, `margin: 0 15px 10px 0` | igual, invertido de color |

Ojo: el título es un `<p class="calls-title">`, **no** un heading — y a 37px
w400 (no w300 como los h2 del hero). En el clon se emite `<p>`.

## Contenido (Urbano, verbatim)

- Título: *¿Necesitas medir la contaminación en tu ciudad?*
- Cuerpo: *Descarga ahora el informe completo y descubre cómo Bilbao ha
  reducido la contaminación atmosférica y creado una ciudad más sostenible.*
- Botón: **Descargar informe** →
  `https://kunakair.com/es/informe-tecnico-control-de-la-calidad-del-aire-en-ciudades/`
  con `target="_blank" rel="nofollow"` (destino **no clonado** → href original
  y `external: true`).
- Foto: `/images/uploads/2024/11/cta-informe-tecnico-urban-ES.png`

## Es opcional en el arquetipo

De los 7 sectores vivos, **6 lo llevan y "Investigación y consultoría" no**
(0 `.calls`). Por eso vive en `body: SectorBlock[]` y no en un campo fijo.
Y su posición cambia: en Urbano va **antes** de las listas de beneficios; en
Industria, **después**.

## Estados

Solo el hover del botón Divi (`OutlineButton` ya lo implementa).

## Assets

- `/images/uploads/2024/11/cta-informe-tecnico-urban-ES.png`
