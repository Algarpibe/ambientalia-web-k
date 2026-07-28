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
