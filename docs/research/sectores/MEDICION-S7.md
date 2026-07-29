# MEDICIÓN-S7 — el cuerpo del sector agrupado en secciones

> Fecha de la medida: **2026-07-29**. Viewports **1440×900** y **390×844**, DPR 1.
> Sondas: `scripts/qa/tree-cmp.mjs` (árbol sección→fila, original vs clon) y
> `scripts/qa/cmp-sector.mjs` (anclas de texto). Método de `CLAUDE.md`: Chrome
> del sistema por puppeteer-core, perfil nuevo, Cookiebot bloqueado, pase de
> scroll + settle, móvil solo por device metrics.
> Commits: `9807359` (S7 1/2, el campo en el content type) y `64a7901` (S7 2/2).

## Qué se estaba arreglando

`SectorBody` metía **cada bloque del cuerpo en su propia `<section>`** con ritmo
completo. El original no hace eso: agrupa o separa según le conviene. Urbano
salía bien **por casualidad** —allí el CTA y las listas sí caen en dos secciones
distintas—; Industria monta sus cinco bloques como **cinco filas de la misma
sección**, y el clon colaba en cada junta el `padding-bottom: 14` de sección más
el `padding-top: 2%` de fila.

El desfase del CTA de Industria era exactamente **14 + 28.797 = 42.797**.

## Antes / Después — altura de documento

Sonda `alturas.mjs`, las 7 páginas del clon servidas con `next start`.

### @1440

| página | antes | después | Δ |
|---|---|---|---|
| home | 11870 | 11870 | **0** |
| monitor | 12410 | 12410 | **0** |
| accesorios | 10863 | 10863 | **0** |
| software | 11711 | 11711 | **0** |
| kunak-api | 5289 | 5289 | **0** |
| **urbano** | 6122 | 6122 | **0** |
| **industria** | 7229 | **7171** | **−58** |

### @390

| página | antes | después | Δ |
|---|---|---|---|
| home | 19182 | 19182 | **0** |
| monitor | 21854 | 21854 | **0** |
| accesorios | 21180 | 21180 | **0** |
| software | 20844 | 20844 | **0** |
| kunak-api | 9125 | 9125 | **0** |
| **urbano** | 11064 | 11064 | **0** |
| **industria** | 12626 | **12566** | **−60** |

Las **5 páginas de control** (home, monitor, accesorios, software, kunak-api) no
se mueven ni un píxel en ninguno de los dos anchos. Urbano tampoco: su cuerpo
pesa lo mismo porque los 14px del `padding-bottom` de sección **solo cambian de
sitio** (antes iban entre las listas y el claim; ahora, como en el original,
después del claim).

Industria adelgaza justo lo que le sobraba:

- **@1440**: `14` (pb de sección) + `28.797` (pt de fila del CTA) + `28.797`
  (pt de fila de las listas) = **57.59** → medido −58.
- **@390**: `14 + 30 + 30` menos el `pt` de sección que ya no se duplica = **60**
  → medido −60.

## Árbol sección → fila, original vs clon

### Industria @1440 (`tree-cmp.mjs industria 1440`)

Original — **una** sección, cinco filas:

| | top | h | pt | pb |
|---|---|---|---|---|
| SEC 0 | 1357.36 | 2622.80 | 57.5938 (mt −14) | 14 |
| fila 0 · beneficios | 1414.95 | 630.17 | 28.7969 | 28.7969 |
| fila 1 · cta | 2045.13 | 525.61 | **0** | 28.7969 |
| fila 2 · listas | 2570.73 | 236.36 | **0** | 28.7969 |
| fila 3 · claim | 2807.09 | 418.88 | **0** | 28.7969 |
| fila 4 · mapa | 3225.97 | 740.19 | 28.7969 | 28.7969 |

Clon tras S7 — misma sección, mismos `pt/pb`:

| fila | top orig → clon | Δtop | h orig → clon | Δh |
|---|---|---|---|---|
| beneficios | 1414.95 → 1414.94 | **0** | 630.17 → 630.17 | **0** |
| cta | 2045.13 → 2045.11 | **0** | 525.61 → 495.02 | −30.6 |
| listas | 2570.73 → 2540.13 | −30.6 | 236.36 → 266.95 | +30.6 |
| claim | 2807.09 → 2807.08 | **0** | 418.88 → 418.88 | **0** |
| mapa | 3225.97 → 3225.95 | **0** | 740.19 → 753.19 | +13 |

El ±30.6 de las filas 1 y 2 **no es ritmo**: es el párrafo de entrada de
`listaSimple2Col`, que en el original cuelga de la fila del CTA (S9a). Su efecto
vertical neto es cero — la fila 3 vuelve a arrancar al píxel.

### Urbano @1440

| | original | clon | Δ |
|---|---|---|---|
| SEC 0 (rasa) · h | 440.83 | 432.23 | −8.6 |
| SEC 1 · h | **1057.45** | **1057.45** | **0** |
| fila beneficios · h | 566.98 | 566.98 | **0** |
| fila claim · h (pt 0) | 418.88 | 418.88 | **0** |

### Urbano @390

| | original | clon | Δ |
|---|---|---|---|
| SEC 0 (rasa) · h | 593.39 | 584.91 | −8.5 |
| SEC 1 · h | **1970.16** | **1970.16** | **0** |
| fila beneficios · h | 1356.56 | 1356.56 | **0** |
| fila claim · h (pt 0) | 549.59 | 549.59 | **0** |

Confirma de paso que `filaPegada` es **`pt 0` en los dos anchos**, no solo en
desktop.

## Anclas: el objetivo de S7

`cmp-sector.mjs`, arranque de cada bloque del cuerpo.

| ancla | Industria @1440 | Industria @390 |
|---|---|---|
| beneficios | 1443.8 / 1443.7 → **−0.1** | −30 (base) → **0 relativo** |
| **cta** | **2086.1 / 2086.1 → Δ0** (antes **+42.8**) | **3653.06 / 3653.06 → Δ0** |
| listas | +28.8 (S9a) | +12.5 relativo (S9a) |
| claim | 2946.6 / 2946.6 → **Δ0** | −47.5 relativo (S9b) |
| mapa | 3254.8 / 3254.8 → **Δ0** | −47.5 relativo (S9b) |

> A 390 todas las anclas de Industria llevan una base de **−30** heredada del
> `padding-top` de la cabecera en móvil, que es residuo previo y ajeno a S7; la
> columna da el valor **relativo a esa base**.

Urbano queda con **un único residuo** que arrastra por igual de la cabecera al
pie: **−8.6** a 1440 y **−8.5** a 390, que es el alto de la caja del CTA de
descarga en su piel `"foto"` (S9b). Ni una ancla se sale de ese valor.

## Ojo con la base al comparar

Dos corridas del **mismo día** leyeron el original de Industria a 1440 en
**7117** y **7144**. Es un sitio vivo: los residuos solo valen contra la lectura
de su propia corrida. Por eso arriba se da el **adelgazamiento del clon**, que sí
es estable, y no un "residuo contra el original" que cambia según la corrida.

## Lo que NO arregló S7

Tres residuos, ninguno de ritmo de sección, detallados en
`docs/PENDIENTES-QA.md` §S9:

- **S9a** — la `intro` de `listaSimple2Col` va en la fila del CTA en el original.
- **S9b** — la caja del CTA de descarga mide menos que la del original: −8.6/−8.5
  en la piel `"foto"`; en la piel `"fondo"` clava el desktop y va −47.5 a 390.
- **S9c** — la cabecera de `mapaProyectos` es +13 en los dos anchos (bloque que
  es placeholder deliberado: el mapa de Google no se clona).
