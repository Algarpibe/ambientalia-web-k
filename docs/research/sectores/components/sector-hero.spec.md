# SectorHero — S3, fila 1/2 + 1/2

> Medido 2026-07-28 a **1440×900** y **390×844** reales. Mismo arnés que el
> resto del recon de `/sectores`.
> Componente: `src/components/sectores/SectorHero.tsx`.

## Sección y fila

| | 1440 | 390 |
|---|---|---|
| Sección `padding` | `57.5938 0 60` (**4%** arriba) | `50 0 20` |
| Fondo | `#fff` | `#fff` |
| Fila | **86%** máx 1380 = **1238.39** | 86% = **335.39** |
| Fila `padding-bottom` | 28.7969 (**2%**) | 30 |
| Columnas | 1/2 + 1/2 = **585.13** cada una, gutter 5.5% (68.11) | apiladas, 335.39 |

**Orden en móvil**: la columna de la **foto y los botones va PRIMERA** y el
titular + los párrafos después (col. izq. y569.25, col. der. y972.13). O sea:
en móvil el H2 azul aparece **debajo** de la foto y de los dos CTA. La columna
izquierda remata con `margin-bottom: 30`.

## Columna izquierda (4 módulos)

| Módulo | 1440 | 390 |
|---|---|---|
| Punteado | 60×22 en **x 35.8** (= retícula − 65) · `margin-bottom: 34.0469` | 60×22 en **x −37.7** (= 27.3 − 65) · `margin-bottom: 30` |
| Foto | **585.13×312.06**, `margin-bottom: 34.0469` | **335.39×178.88**, `margin-bottom: 30` |
| Botón 1 (wrapper) | alto 74, `margin-bottom: 16` | igual |
| Botón 2 (wrapper) | alto 74, `margin-bottom: 0` | igual |

Los dos botones son **Divi azules** idénticos en ambos anchos:

```
font: 15px/25.5px w700 #fff · letter-spacing normal
padding: 7.5px 40.5px 9px 22.5px
background: #0075C9 · border: 1px solid #0075C9 · border-radius: 30px
margin: 0 15px 30px 0 · display: inline-block
```
Flecha `::after` (ETmodules `"$"`) siempre visible a `right: 15.5px`,
`margin-left: 5px`. Es exactamente el `BlueButton` que ya existe en
`SectionRow.tsx` — **no se re-implementa**.

Alto del wrapper 74 = botón 44 + `margin-bottom` 30 del botón.

## Columna derecha (2 módulos)

**Titular** — módulo con `margin-bottom: 34.0469` (D) / `30` (M):

```
<h2>  37px / 37px  w300  #333  letter-spacing -0.5px  padding-bottom: 10px
  └─ <span style="color:#0075c9">…</span>   ← el AZUL lo pone el span
```

⚠️ El `<h2>` computa `#333`; el azul viene de un `<span>` en línea dentro. Si
se pinta el h2 en azul directamente el resultado es el mismo a la vista, pero
se pierde el matiz de que el color es **contenido** (editable en el CMS), no
estilo. En el clon se emite el span.

**No baja de tamaño en móvil**: sigue a `37px/37px` (mismo caso que los h2
azules de la home).

**Cuerpo** — módulo sin márgenes. Párrafos a `18px/30.6px w400 #333` con la
rítmica Divi: **`padding-bottom: 18px` en todos salvo el último**.

Alturas medidas de los 5 párrafos de Urbano — 1440:
`109.78 · 140.38 · 140.38 · 79.19 · 122.38` · 390: `140.38 · 201.56 · 201.56 ·
109.78 · 183.56`.

## Contenido (Urbano, verbatim)

- Foto: `/images/uploads/2023/02/urban-air-quality-1.jpg`,
  `alt="calidad del aire en las ciudades"`
- CTA 1: **Quiero saber más** → `https://kunakair.com/es/contacto/`
- CTA 2: **Descargar catálogo** → `https://kunakair.com/es/descarga-catalogo/`
- H2: *Conoce la calidad del aire que respiran tus ciudadanos con datos
  precisos calle a calle.*
- 5 párrafos (ver `SECTOR_URBANO.hero.paragraphs` en `src/lib/sectores.ts`).

Ninguno de los dos CTA está clonado todavía → **hrefs al original**.

## Estados

Solo el hover de los botones Divi, que ya implementa `BlueButton` (el
`padding-right` se expande a 55.5 y la flecha se desplaza). Nada más.

## Assets

- `/images/uploads/2023/02/urban-air-quality-1.jpg`
- `/images/uploads/2022/12/punteado.svg` (ya en el repo)
