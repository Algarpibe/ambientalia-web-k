# scripts/qa — sondas de medición contra el original

Utillaje de la fase 4 del flujo (QA visual). Mide el original con
puppeteer-core sobre el Chrome del sistema, siguiendo las **notas de método** de
`CLAUDE.md`: perfil limpio, Cookiebot bloqueado por `--host-resolver-rules`,
pase de scroll + settle antes de medir y móvil solo por device metrics.

Estas sondas **no forman parte del build**: `npm run check` no las toca y
`puppeteer-core` no está en `package.json` a propósito, para no meter un
navegador en las dependencias de la app.

## Cómo correrlas

```bash
cd scripts/qa
npm i --no-save puppeteer-core     # ~1 MB: usa el Chrome ya instalado
node tree-todos.mjs 1440           # desktop
node tree-todos.mjs 390            # móvil (device metrics 390×844)
```

`lib.mjs` asume el Chrome de Windows en
`C:\Program Files\Google\Chrome\Application\chrome.exe`; cámbialo ahí si tu
instalación está en otro sitio.

## `tree-todos.mjs`

Recorre los **8 sectores vivos** del original y vuelca, del cuerpo de cada uno
(lo que hay entre la sección del hero y el slider de ancho completo), el árbol
de `.et_pb_section` → `.et_pb_row` con `margin-top`, `padding-top`,
`padding-bottom` y altura de cada nodo, más una huella heurística del tipo de
bloque (`ctaDescarga`, `beneficiosAplicaciones`, `listaSimple2Col`,
`claimConFoto`, `mapaProyectos`).

Escribe `tree-todos-<ancho>.json` en el directorio de trabajo y saca el mismo
árbol por consola.

### Qué respalda

**Es la medida de la que sale el campo `flujo` de `SectorBlock`** — la tabla de
ritmos documentada en `src/lib/sectores.ts` (`SectorBlockFlujo`). Se corrió
sobre los 8 sectores, no sobre 2, y de ahí salió que en Divi el cuerpo de un
sector no es una pila de secciones sino **secciones con filas dentro**, con solo
dos formas de sección y dos de fila:

| valor | sección | fila |
|---|---|---|
| `seccion` | `mt −14` · `pt 57.5938 / 50` · `pb 14` | `pt 2% / 30` |
| `seccionRasa` | `mt 0` · `pt 0` · `pb 0` | `pt 2% / 30` |
| `fila` | (continúa la abierta) | `pt 2% / 30` |
| `filaPegada` | (continúa la abierta) | `pt 0` |

Diseñar el content type contra 2 instancias en vez de contra los 8 fue el error
de la tanda anterior: Urbano y Construcción comparten forma, y las otras cuatro
de plantilla clásica no.

## `medidas/`

Salidas congeladas de la sonda. **Son la prueba, no un caché**: el original es
un sitio vivo y los deltas solo se comparan entre medidas del mismo día y la
misma configuración.

| fichero | qué es |
|---|---|
| `tree-todos-1440.json` | 8 sectores a 1440×900, DPR 1 — **2026-07-28** |

Notas de esa medida:

- **EDAR** y **Petróleo y gas** salen con otra estructura (7 y 7 secciones, con
  filas de menú y breadcrumb dentro del rango): están rehechos con una plantilla
  nueva y **no** son los 6 de plantilla clásica sobre los que se diseñó `flujo`.
- La medida a 390 se corrió el mismo día pero su JSON no se conservó; se
  reproduce con `node tree-todos.mjs 390`.
