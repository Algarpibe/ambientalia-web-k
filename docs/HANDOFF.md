# HANDOFF — MONOGRÁFICO TÉCNICO: specs cerradas, falta construir

> Escrito al cerrar la sesión del **2026-07-29** (recon) y **actualizado el mismo
> día** al cerrar la sesión de specs.
> Para arrancar sesión limpia. Léelo entero antes de tocar nada: son 5 minutos.

## Lo primero: en qué punto está

**Recon y specs de MONOGRÁFICO están HECHOS. No se ha escrito código, a
propósito.** La próxima sesión es de **build** (fase 3 del flujo), y entra por
`docs/research/monografico-tecnico/MODELO.md`.

| documento | qué trae |
|---|---|
| `PAGE_TOPOLOGY.md` | recon medido, con **tres correcciones marcadas `⚠ CORRIGE`** sobre la versión en frío |
| `DECISIONES.md` | **las tres decisiones, argumentadas y cerradas** |
| `MODELO.md` | el content type, escrito desde EDAR y **validado contra Petróleo sobre el papel**: 4 campos que EDAR sola habría fallado |
| `BEHAVIORS.md` | el cuerpo es estático; lo único propio es el desbordamiento de la tabla a 390 |
| `components/seccion-editorial.spec.md` | el cuerpo: ritmo, retícula, punteado, tipografía, los 3 payloads, objetivos numéricos |
| `components/tabla-resumen.spec.md` | la tabla, con su contenido **verbatim** |
| `components/cabecera-hero-cola.spec.md` | qué se reutiliza de SECTOR, medido original contra original |
| `EXPERIMENTO-URBANO.md` | el experimento **pre-registrado**: hipótesis, criterio, predicciones y regla de decisión |

**El hallazgo transversal de la tanda**, que vale para todo el proyecto y no solo
para este arquetipo: **en Divi, lo que el editor no toca es responsive (un % del
padre); lo que toca queda en px absolutos, iguales a 1440 y a 390.** Es un
discriminador **objetivo** entre plantilla y contenido — se mide a dos anchos y
se mira si el número se mueve — y es lo que resuelve la decisión (c) sin tener
que argumentar de oído.

## Estado

**7 arquetipos** en la biblioteca:

| arquetipo | ruta | recon |
|---|---|---|
| HOME | `/` | `docs/research/` (raíz) |
| PRODUCTO | `/monitor-calidad-aire` | `docs/research/monitor-calidad-aire/` |
| CATÁLOGO | `/accesorios` | `docs/research/accesorios/` |
| SOFTWARE/PLATAFORMA | `/software-de-medicion-calidad-del-aire` | `docs/research/software/` |
| — (variante corta del anterior) | `/kunak-api` | `docs/research/kunak-api/` |
| SECTOR / SOLUCIÓN VERTICAL | `/sectores/[slug]` | `docs/research/sectores/` |
| **MONOGRÁFICO TÉCNICO** | *sin construir — **specs cerradas*** | `docs/research/monografico-tecnico/` |

**SECTOR: 4 instancias de una sola plantilla** (Urbano · Industria ·
Construcción · Investigación), y el **test de aceptación está pasado**: las dos
últimas se poblaron con **cero líneas de componente**, solo añadiendo un
`SectorPage` a `SECTORES_PUBLICADOS` en `src/lib/sectores.ts`. Cuerpo exacto
contra el original (Δ0) en los dos anchos, y las 7 páginas anteriores sin
moverse un píxel.

Puertos y Minería se dejaron fuera **a propósito** (permutaciones de una
topología ya validada; razón en `docs/PENDIENTES-QA.md`).

## Por dónde entrar a construir

1. **`MODELO.md`** — el content type y sus cuatro puntos abiertos (§4).
2. **`components/seccion-editorial.spec.md`** — es el 68% del trabajo: el cuerpo.
   Trae los objetivos numéricos por sección y fila de las dos páginas.
3. `components/cabecera-hero-cola.spec.md` — lo que **no** hay que construir.

Antes de medir nada, `scripts/qa/README.md` §PROTOCOLO DE MEDICIÓN: 3 corridas,
el `h1` como base de lectura, y el suelo de ruido en **dos regiones** (hasta 81
en "Artículos y Guías", **0 en el resto**).

Las sondas del arquetipo ya existen y su salida está congelada: `mono-modulos`,
`mono-cabecera`, `mono-detalle` y `mono-inline` en `scripts/qa/`. **Se
reutilizan, no se rehacen.**

## Dos observaciones que pueden cambiar la prioridad

1. ~~**El arquetipo SECTOR está contenido dentro de MONOGRÁFICO.**~~ **Corregida
   al medir**: la última sección de EDAR y Petróleo *no* es un cuerpo de sector.
   Lo que el heurístico etiquetaba `claimConFoto` es una sección editorial más,
   y `claimConFoto` **no aparece en ninguna de las dos**. La contención va en el
   otro sentido: el cuerpo de SECTOR parece un **subconjunto** del de
   MONOGRÁFICO — `beneficiosAplicaciones` es literalmente `punt · h3 · ul` en
   dos columnas. Eso es lo que somete a prueba el experimento.
2. **Son las dos páginas más recientes del sitio.** 2 de 8, y las dos últimas
   publicadas — lo que sugiere que ésta es la plantilla nueva y que los otros 6
   sectores son el legado. Sin resolver: no hay dato público que lo confirme.

## Las tres decisiones: CERRADAS (2026-07-29)

Argumentadas en **`docs/research/monografico-tecnico/DECISIONES.md`**. Resumen,
para no reabrirlas:

| | decisión | en una línea |
|---|---|---|
| **a** | la `<table>` | **filas estructuradas, tabla genérica** (`cabeceras[]` + `filas[][]`), **no** cuatro columnas con nombre: Petróleo no tiene tabla, así que n = 1 y un esquema con nombres sería S9–S11 aplicado al esquema del CMS |
| **b** | cabecera y slider | **se reutilizan los dos, medido original contra original**. El hero también, con **dos campos nuevos**: el `pb` de desktop (39 vs 60) y que su columna derecha es una **lista** de módulos con **un color por titular** |
| **c** | el `pb` de fila | vive en el content type del monográfico, **en los tres niveles** (sección, fila, módulo) porque son el mismo mecanismo. **No se toca `SectorBlock`**: en los 6 sectores clásicos ese valor es un invariante medido, y abrir un campo que ninguna instancia usa degrada su modelo |

## El experimento que cierra el recon

**Diseñado y pre-registrado**:
`docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md` — hipótesis, criterio
de éxito con umbral **cero** (clon contra clon, sin ruido), **cuatro
predicciones registradas** y regla de decisión para cada resultado.

Se corre **al terminar de construir MONOGRÁFICO, y no antes**. Hasta entonces:
ni tocar `SectorBlock`, ni ampliar `flujo`, ni mover el `pb` de fila a dato.

## Lo que NO hay que hacer al empezar

- **No arreglar S9, S10 ni S11 sueltos.** Ver la nota de **CLASE** al principio
  de `docs/PENDIENTES-QA.md`: son el mismo hallazgo cuatro veces (componente
  calibrado contra una instancia, no contra un rango) y se resuelven en **una
  tanda única con criterio común**, con el catálogo de instancias ya completo.
- **La regla de rutas locales ya está cerrada, y con guarda.** No la vuelvas a
  cerrar a mano. Se creía rota en un fichero, resultó estarlo en **seis**
  (`nav.ts`, `footer.ts`, el carrusel de la home, `HeaderNav`, el hero de
  monitor y tres breadcrumbs). Ahora la vigila `scripts/qa/enlaces.mjs`.

## Al terminar el monográfico: correr la guarda

**`cd scripts/qa && node enlaces.mjs`** — con el clon servido y **después de
`npm run build`**, que es de donde saca las rutas publicadas.

En cuanto el monográfico emita sus rutas, los enlaces a EDAR y a Petróleo y gas
que hoy son correctos **pasan a ser fallo automáticamente**, sin tocar la sonda:
la regla se deriva de `.next/prerender-manifest.json`. Hay que localizarlos en
los tres sitios donde vive un enlace a sector —`nav.ts`, `footer.ts` y
`home-carrusel-sectores.ts`— y volver a correrla hasta que salga limpia.

La guarda cubre **las dos direcciones**: un href que va al original teniendo
copia local, y un href interno que no corresponde a ruta emitida (un 404, que
ninguna medida de altura ve). Verificada en negativo. Sale con código 0 limpia y
1 sucia, así que se puede encadenar a `npm run check` si algún día interesa.

Al medir contra ella, **mata el servidor por puerto, no con `pkill`**: la
primera pasada del test en negativo salió "limpia" porque `next start` seguía
sirviendo el build anterior.

## Tarea para una sesión MECÁNICA (no para la de specs)

**Que las sondas sean dueñas de su ciclo de servidor.** Hoy todas asumen que hay
un `localhost:3000` levantado y **confían en que sirve el build actual**. Debería
ser: matar por puerto → `npm run build` → arrancar → esperar a listo → medir →
parar. Unas 20 líneas en `lib.mjs`, reutilizables por las cuatro sondas.

**Por qué merece una tarea propia, con el caso de hoy:** el test en negativo de
`enlaces.mjs` salió **"limpio" en falso**. El enlace roto estaba en `.next` y no
en el HTML servido, porque `next start` seguía corriendo con el build anterior y
un `pkill -f "next start"` no lo mató. Se descubrió por casualidad, al grepear el
HTML por otro motivo.

El fallo **no fue de disciplina** — el paso "parar, rebuild, relanzar" está en
`CLAUDE.md` desde hace tandas y aun así se coló. Fue que **la frescura del build
dependía de que alguien se acordara**, y eso acaba fallando justo en la corrida
en la que más importa: la que dice "no se mueve nada". Un "18 lecturas
idénticas" es exactamente el resultado que un build viejo falsifica sin dejar
rastro.

Mientras no esté hecho: **matar por puerto, nunca con `pkill`**, y verificar un
marcador del cambio en el HTML servido antes de dar una medida por buena.

## Cómo levantar y comparar

```bash
npm run build && npm run start          # standalone: tras editar, parar y rehacer
cd scripts/qa && npm i --no-save puppeteer-core
node enlaces.mjs                        # guarda de rutas locales (solo clon)
node ruido.mjs 3                        # suelo de ruido, antes de juzgar nada
node tree-cmp.mjs <sector> [ancho]      # árbol sección→fila, original vs clon
node cmp-sector.mjs <sector> [ancho]    # anclas de texto
```

El principio que las gobierna está en `CLAUDE.md` §«El principio»: **verificar
contra la salida servida, nunca contra la fuente que uno supone responsable.**
Se ha aprendido tres veces en este proyecto, una tanda cada una.

Móvil **solo** con device metrics 390×844. Medidas congeladas en
`scripts/qa/medidas/` — son la referencia vigente; el histórico está en git.
