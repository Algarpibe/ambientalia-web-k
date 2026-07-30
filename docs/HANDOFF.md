# HANDOFF — MONOGRÁFICO construido; queda el EXPERIMENTO

> Reescrito el **2026-07-29** al terminar la fase de build del arquetipo
> MONOGRÁFICO TÉCNICO. Para arrancar sesión limpia: son 5 minutos.

## Lo primero: en qué punto está

**MONOGRÁFICO TÉCNICO está construido y medido.** Las dos páginas vivas del
original están clonadas y el cuerpo cuadra al céntimo salvo un residuo de
décimas con causa identificada. Lo que queda pendiente es **correr el
experimento pre-registrado**, que era el paso siguiente por diseño.

| documento | qué trae |
|---|---|
| `docs/research/monografico-tecnico/PAGE_TOPOLOGY.md` | recon medido, con tres `⚠ CORRIGE` sobre la versión en frío |
| `…/DECISIONES.md` | las tres decisiones, argumentadas y cerradas — **las tres se sostuvieron al construir** |
| `…/MODELO.md` | el content type de la fase de specs. **Le faltaban campos**: el vigente es `src/lib/monografico.ts` |
| `…/components/seccion-editorial.spec.md` | el cuerpo. **Empieza con un `⚠ CORRIGE` de seis puntos**: léelo antes que el resto |
| `…/EXPERIMENTO-URBANO.md` | el experimento pre-registrado — **sin correr todavía** |
| `docs/PENDIENTES-QA.md` §MONOGRÁFICO | el acta de QA: qué cuadra, qué no y por qué |

## Estado

**7 arquetipos**, 11 rutas emitidas:

| arquetipo | ruta | estado |
|---|---|---|
| HOME | `/` | clonado |
| PRODUCTO | `/monitor-calidad-aire` | clonado |
| CATÁLOGO | `/accesorios` | clonado |
| SOFTWARE/PLATAFORMA | `/software-de-medicion-calidad-del-aire` | clonado |
| — (variante corta) | `/kunak-api` | clonado |
| SECTOR | `/sectores/[slug]` | 4 de 8 poblados |
| **MONOGRÁFICO TÉCNICO** | `/sectores/…-en-edar` · `/sectores/…-petroleo-y-gas` | **2 de 2 — completo** |

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera de los dos sigue siendo añadir datos: un `SectorPage` a
`SECTORES_PUBLICADOS` o un `MonograficoPage` a `MONOGRAFICOS_PUBLICADOS`.

## El resultado, medido

Original vs clon **módulo a módulo** (`scripts/qa/mono-cmp.mjs`), 1440 y 390:

| | @1440 | @390 |
|---|---|---|
| Petróleo y gas | **exacto**: 0 módulos · 0 filas · 0 secciones | −0.23 total |
| EDAR | −0.01 | −0.16 total |

Y **las 9 páginas anteriores sin moverse un píxel** en los dos anchos, habiendo
tocado tres componentes compartidos. Lo dice `scripts/qa/clon-base.mjs`, que se
probó **en negativo** en la misma sesión: con 1px de más en el `pb` del hero
cazó las 4 páginas afectadas, nombró la sección y salió con código 1.

Todo el residuo que queda son **tres módulos de imagen** y la causa está medida:
el original sirve por `srcset` una variante redimensionada cuya proporción
redondea distinto (M-IMG en `PENDIENTES-QA.md`). Es tanda de **assets**,
transversal, no de este arquetipo.

## Lo siguiente: el experimento, y nada antes

**`docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md`.** Está
pre-registrado: hipótesis, criterio con umbral **cero**, cuatro predicciones y
regla de decisión. Se corre **ahora**, que es cuando toca — al terminar de
construir MONOGRÁFICO.

Decide si SECTOR y MONOGRÁFICO son un content type o dos, y por tanto si el CMS
lleva uno o dos. Hasta que se corra: **ni tocar `SectorBlock`, ni ampliar
`flujo`, ni subir el `pb` de fila a dato.**

Cuando se corra, el acta se escribe **en ese mismo fichero**, con fecha, gane o
pierda H1. Ojo con el §4: **C1 manda sobre C2 y C3** — un cuerpo idéntico al
píxel *después* de añadir campos no prueba nada.

## Lo que enseñó construirlo, y que cambia cómo se leen las specs

**El discriminador de Divi tiene alcance.** Vale para el ritmo, que es donde se
descubrió; no para la tipografía ni para la caja. En Divi el ancho de módulo se
escribe en % igual que su default, así que el número se mueve con el ancho
aunque lo haya escrito una persona.

Cuando no aplica, vale el test general: **¿varía de una instancia a otra del
mismo hueco dentro de la misma página?** Ampliado en `CLAUDE.md`.

Ocho propiedades salieron de ahí, y **ninguna se veía en la primera página**:
ancho de módulo, `line-height`, tamaño del claim, bordes de la tabla, default
de `mb` de imagen, la regla del último módulo, el `<strong>` en línea y el hueco
entre columnas apiladas. Tabla con el coste de cada una en el `⚠ CORRIGE` de
`seccion-editorial.spec.md`.

## Lo que NO hay que hacer al empezar

- **No arreglar S9, S10 ni S11 sueltos.** Ver la nota de **CLASE** en
  `PENDIENTES-QA.md`: son el mismo hallazgo cuatro veces y se resuelven en una
  tanda única con criterio común. El monográfico **añadió instancias al
  catálogo**, que era lo que faltaba.
- **No perseguir el residuo de las imágenes** (M-IMG): son décimas, la causa
  está escrita y se cierra con `srcset`, no con maquetación.
- **No re-medir el original a mano.** Las sondas están en `scripts/qa/` con su
  salida congelada en `medidas/`. Se reutilizan.

## Sondas nuevas de esta tanda

| sonda | qué hace |
|---|---|
| `clon-base.mjs [ancho] [--cmp antes.json]` | **el clon contra sí mismo**, antes/después de tocar algo compartido. Rutas del `prerender-manifest`, umbral cero, y exige un `MARCADOR` en el HTML servido antes de medir nada |
| `mono-cmp.mjs <edar\|petroleo> [ancho]` | original vs clon **módulo a módulo**, separando alto (contenido) de margen (ritmo) |

`tree-cmp.mjs` acepta ahora los 6 slugs y localiza el hero **por el breadcrumb**
y no por su `padding-bottom`: el del monográfico cierra a 39 y la heurística
vieja se quedaba sin cuerpo.

## Comandos

```bash
npm run check                            # lint + typecheck + build
npm run build && npm run start           # tras editar: parar, rehacer, relanzar
cd scripts/qa && npm i --no-save puppeteer-core
node enlaces.mjs                         # guarda de rutas locales — limpia hoy
MARCADOR="…" node clon-base.mjs 1440 --cmp antes.json
node mono-cmp.mjs edar 1440
node ruido.mjs 3                         # suelo de ruido, antes de juzgar nada
```

Y lo de siempre, que sigue costando cuando se olvida: **matar el servidor por
puerto**, nunca con `pkill`, y **verificar un marcador del cambio en el HTML
servido** antes de dar una medida por buena. `clon-base.mjs` ya lo exige por
`MARCADOR`; las demás sondas todavía no (tarea mecánica pendiente: que sean
dueñas de su ciclo de servidor, ~20 líneas en `lib.mjs`).
