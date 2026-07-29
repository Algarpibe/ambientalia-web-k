# HANDOFF — arranque del arquetipo MONOGRÁFICO TÉCNICO

> Escrito al cerrar la sesión del **2026-07-29**.
> Para arrancar sesión limpia. Léelo entero antes de tocar nada: son 5 minutos.

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
| **MONOGRÁFICO TÉCNICO** | *sin construir* | `docs/research/monografico-tecnico/` |

**SECTOR: 4 instancias de una sola plantilla** (Urbano · Industria ·
Construcción · Investigación), y el **test de aceptación está pasado**: las dos
últimas se poblaron con **cero líneas de componente**, solo añadiendo un
`SectorPage` a `SECTORES_PUBLICADOS` en `src/lib/sectores.ts`. Cuerpo exacto
contra el original (Δ0) en los dos anchos, y las 7 páginas anteriores sin
moverse un píxel.

Puertos y Minería se dejaron fuera **a propósito** (permutaciones de una
topología ya validada; razón en `docs/PENDIENTES-QA.md`).

## Por dónde entrar

**`docs/research/monografico-tecnico/PAGE_TOPOLOGY.md`** — recon en frío de
EDAR y Petróleo y gas, hecho sin escribir código. Trae las tres roturas medidas
(la sección editorial que cubre 13 de 19 filas, las dos formas de sección que le
faltan a `flujo`, y el `padding-bottom` de fila que deja de ser plantilla) y su
§4 lista lo que **no** resolvió y hay que medir en la fase de specs.

Antes de medir nada, `scripts/qa/README.md` §PROTOCOLO DE MEDICIÓN: 3 corridas,
el `h1` como base de lectura, y el suelo de ruido en **dos regiones** (hasta 81
en "Artículos y Guías", **0 en el resto**).

## Dos observaciones que pueden cambiar la prioridad

1. **El arquetipo SECTOR está contenido dentro de MONOGRÁFICO.** La última
   sección del cuerpo de EDAR y de Petróleo es un cuerpo de sector completo, con
   el mismo ritmo (`mt −14 · pt 57.5938/50 · pb 14`) y los mismos tipos de
   bloque. Lo nuevo es todo lo que va antes.
2. **Son las dos páginas más recientes del sitio.** 2 de 8, y las dos últimas
   publicadas — lo que sugiere que ésta es la plantilla nueva y que los otros 6
   sectores son el legado. Si se confirma, el orden de prioridad del proyecto
   cambia: MONOGRÁFICO deja de ser "el raro que falta" y pasa a ser hacia dónde
   va el sitio.

## Tres decisiones que van ARGUMENTADAS en las specs, antes de una línea de código

No son detalles de implementación: las tres condicionan el esquema del CMS, y
las tres tienen una respuesta cómoda que probablemente es la equivocada.

### a) La `<table>` de "Tabla resumen: procesos y emisiones"

**La decisión de modelado de más consecuencia del proyecto hasta hoy.** Dos
salidas:

- **Filas estructuradas con columnas tipadas**, poblables campo a campo desde el
  CMS. Caro de construir, y obliga a decidir el esquema de la tabla (¿cuántas
  columnas?, ¿son las mismas en toda instancia?, ¿alguna es enumerada?).
- **Bloque de texto rico** con el HTML de la tabla dentro. Trivial de construir
  y **tira por tierra la regla 2 del proyecto**: la estructura se vuelve opaca,
  no se puede consultar, ordenar ni reutilizar, y el CMS pasa a guardar
  presentación en vez de datos.

Es **la primera vez que "estructura = contenido" se pone de verdad difícil**.
Hasta ahora la separación salía casi gratis. Aquí cuesta, y por eso hay que
resolverla mirando el original —¿qué columnas tiene?, ¿se repite el patrón en
Petróleo y gas o es única de EDAR?— y **no por comodidad de construcción**.
Decisión escrita, con el argumento, antes de tocar nada.

### b) ¿Reutiliza `CabeceraSector` y `CtaBannerSlider`, o tiene los suyos?

Si los reutiliza, **hereda S10 y S11** (alto fijo del slider, kicker que no
envuelve). Eso **no es malo**: suma dos instancias más a la tanda de
variabilidad, que es justo lo que esa tanda necesita para conocer el rango real.

Lo que no vale es heredarlos **por descuido**. Quiero decisión escrita y
**medida**: comprobar que la cabecera y el slider del monográfico tienen la
misma geometría que los de SECTOR, no suponerlo porque se parezcan. Ojo con un
dato ya conocido: **el hero de estas dos páginas lleva `padding-bottom: 39`**,
ni 60 (clásico a 1440) ni 20 (clásico a 390) — ya costó dos versiones de sonda.
Si el hero difiere, la cabecera puede diferir también.

### c) ¿Dónde vive el `pb` de fila como dato, y por qué eso no contamina SECTOR?

En los 6 sectores clásicos el `padding-bottom` de fila es **siempre**
28.7969/30, sin una excepción, y por eso hoy está cableado en `SectorBody` como
plantilla. En el monográfico vale 2, 36, 40, 60 y 72: ahí **es dato editorial**.

La decisión no es "si se sube a campo", sino **dónde**: en el content type del
monográfico, sin tocar `SectorBlock`. Escribir por qué esa frontera se sostiene
—y qué pasaría si mañana un sector clásico necesitara un `pb` distinto— es parte
de la spec. Si la respuesta acaba siendo "hay que unificarlos", **eso lo decide
el experimento de abajo, no esta decisión**.

## El experimento que cierra el recon

**Al terminar de construir MONOGRÁFICO, y no antes: intentar expresar el cuerpo
de Urbano con su modelo.**

- **Si entra sin pérdida** → la contención de la observación 1 queda probada
  **por construcción**, no por parecido. El esquema del CMS se deriva de ahí: un
  solo content type con SECTOR como caso degenerado.
- **Si no entra** → se documenta **dónde está la frontera**, que es un resultado
  igual de valioso y deja los dos arquetipos separados con una razón medida.

**No unificar nada antes de ese resultado.** Ni tocar `SectorBlock`, ni ampliar
`flujo`, ni mover el `pb` de fila a dato. Hoy el modelo de SECTOR está ajustado
a sus 6 instancias y funciona; ampliarlo "por si acaso" lo degrada para las 4
que ya sirven — el argumento está desarrollado en la §3 del recon.

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
