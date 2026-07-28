# ClaimConFoto — claim azul + foto (fila `et_pb_equal_columns`)

> Medido 2026-07-28 a **1440×900** y **390×844** reales.
> Componente: `src/components/sectores/ClaimConFoto.tsx`.
> Bloque del *flexible content*: `{ kind: "claimConFoto", … }`.

## Fila

| | 1440 | 390 |
|---|---|---|
| Fila | 1238.39, `display: flex`, `padding-bottom: 28.7969` | 335.39, apilada, `padding-bottom: 30` |
| Col. texto | 585.13 × **148** | 335.39 × 296 |
| Col. foto | 585.13 × **390.08** | 335.39 × 223.59 |

**El claim va centrado verticalmente respecto a la foto.** El original lo
consigue con `margin: 121.031px 0` en la columna de texto —
`(390.08 − 148) / 2 = 121.04` ✓. En el clon se hace con `items-center` en el
flex de la fila, que da el mismo resultado sin cablear un número.

En móvil **el texto va primero** y la foto debajo (y4069.92 vs y4365.92), sin
centrado.

## Claim

```
<p>  37px / 37px  w300  #333   padding-right: 25px (en el módulo)
  └─ <span style="color:#0075c9">…</span>
```

Igual que el H2 del hero: el **azul lo pone el span**, el `<p>` computa `#333`,
y **no baja de tamaño en móvil** (sigue a 37/37). El `padding-right: 25` va en
el módulo, no en el `<p>` (ancho útil 560.13 de 585.13).

Es un `<p>`, no un heading.

## Foto

Ocupa el ancho completo de su columna: **585.13×390.08** a 1440,
**335.39×223.59** a 390. Sin borde, sin radio, sin sombra.

## Contenido (Urbano, verbatim)

- Claim: *Protege la salud de tus ciudadanos tomando las mejores decisiones
  basadas en datos fiables, precisos y en tiempo real.*
- Foto: `/images/uploads/2023/04/control-de-la-calidad-del-aire-en-ciudades.jpg`,
  `alt="calidad aire ciudades kunak"`

## Estados

Ninguno.

## Assets

- `/images/uploads/2023/04/control-de-la-calidad-del-aire-en-ciudades.jpg`
