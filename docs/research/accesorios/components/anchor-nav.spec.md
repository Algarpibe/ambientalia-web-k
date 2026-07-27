# anchor-nav.spec.md — Caja de anclas sticky compartida (`AnchorNav`)

> Medido 2026-07-27 a **1440×900** en **las dos páginas** que la usan:
> `/accesorios/` (2 instancias) y `/monitor-calidad-aire/` (1 instancia).
> **Los valores computados son idénticos en ambas** — es literalmente el mismo
> módulo del tema (`.columna-lista-anclas > .menu-anclas`).

## Valores (verificados en las dos páginas, 1440)

| Propiedad | Valor |
|---|---|
| Caja `.menu-anclas` | `border: 1px solid #333` · `border-radius: 10px` · `padding: 17px 17px 0` · `margin-bottom: 27.2px` · ancho = columna (240) |
| `ul` | `margin: 0` · `padding: 0 0 17px` · sin viñetas |
| `li` | `margin: 0` · `padding: 0 0 10px` |
| `a` | **17px / 26 / fw800** · `display: block` · `padding: 2px 30px 2px 0` |
| Flecha | **`background-image` del propio `<a>`** (no `::after`): `ico-arrow.svg`, `background-size: 30px 30px`, `position: 100% 0%`, `no-repeat` |
| Color base | **#BBB** |
| Color activo | **#0075C9** (el peso NO cambia: 800 en ambos estados) |
| Columna | Divi 1/4 = **20.875 %**, `padding-top: 32px` |

⚠️ **Corrección respecto al clon anterior**: `SubNavAnclas` del monitor estaba
construido con **16px** de tipo y `padding`/`ul-pb` de **16**, y `mb 27`. El
original mide **17 / 17 / 17 / 27.2** en ambas páginas. Al unificar en
`AnchorNav` se adoptan los valores medidos; esto **no altera la altura de
página** del monitor (la columna es sticky, `self-start`, y su alto no gobierna
la fila, que la marca la columna 3/4 de ~5300 px).

## Sticky

El original usa el sticky **por JS de Divi** (`sticky-elements.js`): clona el
nodo (`et_pb_sticky_placeholder` queda en el flujo) y al vivo le aplica inline
`position: fixed !important; z-index: 10000; left/width` calculados, con `top`
computado a **70px**.

**En el clon: `position: sticky; top: 70px` nativo** — misma conclusión ya
validada en `docs/research/monitor-calidad-aire/BEHAVIORS.md` §5. Requisitos:

- `self-start` en el flex item (si se estira a la altura de la fila, un sticky
  tan alto como su contenedor nunca se pega).
- En `/accesorios/` hay **dos instancias**, una por categoría, cada una sticky
  **dentro de su propia fila**: al terminar la fila la columna se suelta sola,
  que es exactamente lo que hace Divi con sus `margin-top` negativos.

## Scrollspy

- Marca **exactamente un ítem** (`.activo` → #0075C9); el resto queda #BBB.
- Al dejar atrás la categoría, la columna se queda **sin ninguno** marcado.
- Regla del monitor ya implementada y verificada: gana **el último ancla cuyo
  `top` sea menor que `scrollY + 600`**. Se conserva para ambas páginas.
- ⚠️ En el original las clases `activo` parecen **acumularse** (hasta 12 a la
  vez): es un artefacto del **clon del DOM** que crea el sticky de Divi, con
  IDs duplicados. **No replicar** — ver `../BEHAVIORS.md` §4.

## Click en ancla

- Scroll **suave**, y **sin escribir el hash** en la URL (`preventDefault`).
- Offset de aterrizaje **distinto por página** (medido):
  - `/accesorios/`: el bloque queda a **80 px** del viewport → `top − 80`.
  - `/monitor-calidad-aire/`: **sin compensar** el header (el H2 queda
    parcialmente tapado; fiel al original) → `top − 0`.
  Por eso el componente expone `scrollOffset` (por defecto 0, para no tocar el
  comportamiento ya verificado del monitor).

## Hover

**Ninguno en el original**: los enlaces no cambian de color, fondo ni
decoración al pasar el ratón (verificado con ratón real en `/accesorios/`). El
clon del monitor tenía un `hover:text-[#0075C9]`; se mantiene como mejora de
affordance (no altera métricas) y se controla con la prop `hoverable`.

## Móvil

`.menu-anclas` → **`display: none`** (regla ≤980 del tema) en las dos páginas.

- **Monitor**: bajo la caja hay 3 CTAs que sobreviven como barra horizontal
  gris pegada bajo el header. Ese bloque **no pertenece a `AnchorNav`**: se
  pasa como `children` para no arrastrarlo a /accesorios/.
- **Accesorios**: no hay CTAs → **no queda nada**; solo el `<h2>` de categoría
  encima, que tampoco es del componente (va en la página).

## API del componente

```tsx
<AnchorNav
  items={[{ id, label }]}     // id = slug del bloque destino
  scrollOffset={80}            // 0 en el monitor (fiel), 80 en accesorios
  className?                   // ritmo propio de cada página
>
  {/* opcional: CTAs bajo la caja (solo monitor) */}
</AnchorNav>
```

Los `id` de los `<a>` siguen siendo `link-{id}`, como en el original.
