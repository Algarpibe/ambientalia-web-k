# SectorBody — el *flexible content* del arquetipo

> Componente: `src/components/sectores/SectorBody.tsx`.
> Modelo: `SectorBlock` en `src/lib/sectores.ts` (unión discriminada por `kind`).

## Por qué existe

El cuerpo entre el hero y el CTA de ancho completo **no tiene una forma fija**.
Medido en dos sectores (`PAGE_TOPOLOGY.md` §2.3):

| | Urbano | Industria y olores |
|---|---|---|
| 1 | `ctaDescarga` | `beneficiosAplicaciones` |
| 2 | `beneficiosAplicaciones` | `ctaDescarga` |
| 3 | `claimConFoto` | `listaSimple2Col` |
| 4 | — | `claimConFoto` |
| 5 | — | `mapaProyectos` |

E "Investigación y consultoría" no lleva `ctaDescarga`. Un renderizador que
recorre `body: SectorBlock[]` y despacha por `kind` cubre los tres casos con la
**misma plantilla**, que es el objetivo CMS.

`SectorBody` es un `switch` exhaustivo: el `default` hace `never` check, así
que **añadir un tipo al modelo sin pintarlo rompe el typecheck** en vez de
fallar en silencio.

## La gramática sección → fila (S7, 2026-07-29)

El cuerpo **no es una pila de secciones**. En Divi son SECCIONES con FILAS
dentro, y quien edita decide en cuál cae cada bloque: un mismo `kind` va en su
propia sección en un sector y como fila pegada a la anterior en el siguiente.
Medido con `scripts/qa/tree-todos.mjs` sobre los **8 sectores vivos** (salida en
`scripts/qa/medidas/tree-todos-1440.json`) aparecen solo dos formas de sección y
dos de fila:

| forma | `margin-top` | `padding-top` | `padding-bottom` |
|---|---|---|---|
| sección con ritmo | −14 | 57.5938 / 50 | 14 |
| sección rasa | 0 | 0 | 0 |
| fila normal | — | 2% (28.7969 a 1440) / 30 | 2% / 30 |
| fila pegada | — | **0** | 2% / 30 |

**Todas** las filas cierran igual, así que el `padding-bottom` no depende de
nada y se queda en el componente. Lo único editorial es dónde corta la sección,
y eso es el campo `flujo` del content type (`SectorBlockFlujo`), con los 4
valores que salen de combinar las dos tablas: `seccion`, `seccionRasa`, `fila`,
`filaPegada`. Por defecto `seccion`, y el primer bloque del cuerpo abre sección
siempre, lo declare o no — una fila necesita una sección que la contenga.

Reparto en los 6 sectores de plantilla clásica (EDAR y Petróleo y gas van con
otra plantilla y quedan fuera):

| sector | cuerpo |
|---|---|
| Urbano | cta `seccionRasa` · beneficios `seccion` · claim `filaPegada` |
| Construcción | igual que Urbano |
| Industria | beneficios `seccion` · cta · lista · claim `filaPegada` · mapa `fila` |
| Puertos | beneficios `seccion` · cta `fila` · claim `filaPegada` · mapa `fila` |
| Minería | beneficios `seccion` · claim · cta `filaPegada` · mapa `fila` |
| Investigación | beneficios `seccion` · claim `filaPegada` |

**Reparto de responsabilidades.** `SectorBody` monta la `<section>` y la
retícula de fila; los 5 componentes de bloque pintan **solo el contenido de su
fila** y no llevan ni `<section>` ni `mx-auto w-[86%]`. Antes cada bloque se
envolvía a sí mismo, que es lo que hace Urbano por casualidad — allí el CTA y
las listas sí caen en dos secciones del original — y en Industria metía de más
el `pb 14` de sección + el `pt 2%` de fila en cada junta: el CTA caía +42.8 y de
ahí abajo todo ~+70. Detalle y números en `docs/PENDIENTES-QA.md` §S7.

## Los 5 tipos

| `kind` | Spec | ¿Lo usa Urbano? |
|---|---|---|
| `ctaDescarga` | `cta-descarga.spec.md` | sí |
| `beneficiosAplicaciones` | `beneficios-aplicaciones.spec.md` | sí |
| `claimConFoto` | `claim-con-foto.spec.md` | sí |
| `listaSimple2Col` | aquí abajo | no (Industria) |
| `mapaProyectos` | aquí abajo | no (Industria · Puertos · Minería) |

Los dos últimos se implementan igualmente: son parte del arquetipo y sin ellos
la plantilla no sirve para los 8 sectores, que es lo que se está construyendo.

---

## `listaSimple2Col`

Medido en `…/sectores/control-de-emisiones-industriales/` a 1440.

Un párrafo de entrada a ancho completo y, debajo, **una lista repartida en dos
columnas 1/2** (no es una lista con `columns: 2` — son dos `<ul>` en dos
columnas Divi, cada uno con sus propios ítems).

⚠️ **El párrafo de entrada NO está en esta fila en el original.** Medido en S7
(2026-07-29): en Industria cuelga del final de la fila del CTA, y la fila de las
listas contiene solo los dos `<ul>` (207.56 de contenido a 1440). El clon lo
pinta arriba de las listas, 30.6 más abajo de donde va. Efecto vertical neto
cero — la fila siguiente arranca al píxel — y sin arreglar a propósito: ver
`docs/PENDIENTES-QA.md` §S9a, que explica por qué el arreglo es de modelo.

- Fila del párrafo: columna 4/4, módulo de texto `18px/30.6` — alto 30.6.
- Fila de las listas: 2 × 1/2, cada `<ul>` de **207.6** de alto con 6 ítems.
- Mismas reglas de lista que `beneficiosAplicaciones`: `padding: 0 0 18px 36px`,
  `list-style: none`, viñeta `::before "•"` 22.4px `#0075C9` colgando −20.16.

Contenido de Industria (verbatim), para cuando se clone:

> Intro: *Algunos de las aplicaciones donde desplegar sistemas de
> monitorización ambiental son:*
> Izq.: Industria cementera · Metalurgia y minería · Pasta y papel · Extracción
> de combustibles fósiles · Tratamiento de aguas residuales (PTAR y EDAR) ·
> Vertederos y estiércol
> Der.: Gestión del compost · Espacios agrícolas y ganaderos · Industria del
> gas y del petróleo · Petroquímica · Plantas de fertilizantes · Empresas
> farmacéuticas

## `mapaProyectos`

Módulo `et_pb_map` de Divi con pines de proyectos: **41** en Industria, 30 en
Puertos, 32 en Minería. Estructura de la fila (Industria):

```
punteado
h2   "Proyectos por todo el mundo"        44px/55 w300 #333
p    intro 18px/30.6
mapa 1238.4 × 570
```

Cada pin es un `<h3>` de 32px/32 w300 con el nombre del proyecto (muchos
"Confidencial").

⚠️ **No se clona el mapa de Google.** El módulo del original carga la Maps
JavaScript API con la clave del sitio; replicarlo significaría o usar una clave
propia o incrustar la ajena. El componente pinta el titular, la intro y un
**contenedor con la lista de pines** del tamaño medido, y deja el mapa para una
decisión de producto. Anotado aquí y no en el código para que no se pierda:
`MapaProyectos` **es un placeholder deliberado**, no un bloque a medio hacer.
Urbano no lo usa, así que no afecta a la página que se construye hoy.
