# PAGE_TOPOLOGY.md — arquetipo MONOGRÁFICO TÉCNICO

> **Recon en frío, 2026-07-29. No se ha escrito código.**
> Instancias vivas: `…/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/`
> y `…/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/`.
> Medido a 1440×900 y 390×844, DPR 1, con `scripts/qa/tree-todos.mjs` y una
> sonda de módulos Divi. Salida congelada en `scripts/qa/medidas/`.

## Por qué tiene nombre propio y no lleva "sector" dentro

Estas dos páginas **cuelgan de `/sectores/`** en el original y aparecen en el
mega-menú junto a las otras seis. Es la única cosa que comparten con ellas.

Se les da un nombre que **no contiene "sector" a propósito**: quien lea
`docs/research/` dentro de tres semanas tiene que ver de un vistazo que esto
**no es una variante del arquetipo SECTOR**, como `/kunak-api` sí lo es de
SOFTWARE. Aquí el modelo de contenido no se estira: se rompe en tres sitios
distintos, y los tres están medidos abajo.

Son **monográficos técnicos**: una pieza larga de contenido divulgativo con
apartados propios ("¿Qué gases se deben medir en una EDAR?", "Tabla resumen:
procesos y emisiones", "Cómo funciona la solución"), que **termina** con la cola
comercial del arquetipo SECTOR. El sector es el pie de la página, no su forma.

## 1. Lo que sí comparten con SECTOR

La **cabecera y la cola son idénticas**, y eso es reutilizable tal cual:

| pieza | ¿igual que SECTOR? |
|---|---|
| cabecera de foto + kicker + h1 | sí |
| banda de clientes | sí |
| breadcrumb de 3 niveles | sí |
| hero 1/2 + 1/2 | sí |
| CTA de ancho completo (3 diapositivas) | sí |
| bloque K (soluciones · proyectos · artículos) | sí |
| franja del pie | sí |

Y **la última sección de su cuerpo es un cuerpo de SECTOR completo**, con el
mismo ritmo `mt −14 · pt 57.5938/50 · pb 14` y los mismos tipos de bloque:

| | última sección |
|---|---|
| EDAR | `beneficiosAplicaciones seccion · claimConFoto filaPegada · ctaDescarga filaPegada · mapaProyectos fila` |
| Petróleo y gas | `claimConFoto filaPegada · ctaDescarga filaPegada` |

O sea: **el arquetipo SECTOR está contenido dentro de éste**, al final. Lo nuevo
es todo lo que va antes.

## 2. Los tres sitios donde el modelo actual se rompe

### 2.1 Un 6º tipo de bloque: la SECCIÓN EDITORIAL

**13 de las 19 filas de cuerpo** de las dos páginas son un mismo bloque que no
existe en el modelo. Su forma:

```
h3   antetítulo / eyebrow
h2   titular
     cuerpo variable  →  ul  |  <table>  |  serie de h4  |  párrafos
img  foto
     [botón, opcional]
```

en **1 o 2 columnas**, con la foto a un lado o debajo. Inventario medido:

| # | página | titular | columnas | cuerpo | botón |
|---|---|---|---|---|---|
| 0 | EDAR | ¿Qué cambia con monitorización continua? | 2 | `ul` | — |
| 1 | EDAR | ¿Qué gases se deben medir en una EDAR? | 1 | `ul` | — |
| 2 | EDAR | ¿Dónde se generan las emisiones en la planta? | 1 | foto | — |
| 3 | EDAR | Tabla resumen: procesos y emisiones | 1 | **`<table>`** | — |
| 4 | EDAR | Alertas y toma de decisiones | 2 | `ul` | sí |
| 5 | EDAR | Control perimetral y gestión de quejas | 2 | 2×(h3+h2) | — |
| 6 | Petróleo | De inspecciones puntuales a control continuo | 2 | **5×h4** | — |
| 7 | Petróleo | Qué necesitas para controlar las emisiones | 2 | `ul` | sí |
| 8 | Petróleo | La solución de Kunak | 2 | `ul` | sí |
| 9 | Petróleo | Contaminantes que pueden monitorizarse | 2 | `ul` | — |
| 10 | Petróleo | Aplicaciones en petróleo y gas | 2 | **7×h4** | sí |
| 11 | Petróleo | Monitorización de metano y detección temprana de fugas | 2 | `ul` | sí |
| 12 | Petróleo | Cómo funciona la solución | 1 | h4 | — |

Ojo con la trampa de clasificación: el heurístico de `tree-todos.mjs` etiqueta
casi todas como `claimConFoto`, porque su huella es "lleva `<img>` y pocos
`<p>`". **No lo son.** `claimConFoto` es una frase de 37px en azul de marca sin
titular ni cuerpo. Éstas tienen antetítulo, titular y cuerpo estructurado. Si se
clonan mirando la etiqueta del heurístico en vez de la página, sale mal.

Tres payloads que el modelo actual no sabe pintar en ningún bloque: una
**`<table>`**, una **serie de `<h4>`** usada como lista, y una fila con **dos
pares titular+texto** en las dos columnas.

### 2.2 A `flujo` le faltan dos formas de sección

El enum de 4 valores se dedujo de los 6 sectores de plantilla clásica, donde
solo hay dos formas de sección. Aquí hay **cuatro**:

| forma | `margin-top` | `padding-top` (1440/390) | `padding-bottom` | ¿en el modelo? |
|---|---|---|---|---|
| con ritmo | −14 | 57.5938 / 50 | 14 | sí — `seccion` |
| rasa | 0 | 0 | 0 | sí — `seccionRasa` |
| **suelta** | **0** | **57.5938 / 50** | **57.5938 / 50** | **no** |
| **suelta corta** | **0** | **57.5938 / 50** | **40** | **no** |

Reparto medido:

| | SEC 0 | SEC 1 | SEC 2 |
|---|---|---|---|
| EDAR | suelta | suelta | con ritmo |
| Petróleo | suelta corta | suelta | con ritmo |

### 2.3 El `padding-bottom` de fila deja de ser plantilla

**Éste es el que más duele**, porque rompe un invariante que hoy está cableado
en `SectorBody` y documentado como plantilla:

> «Todas las filas cierran igual (`padding-bottom 2% / 30`), así que eso se
> queda en el componente.»

En los 6 sectores clásicos eso se cumple **sin una sola excepción**: 28.7969 a
1440 y 30 a 390, siempre. En estas dos páginas el `pb` de fila vale:

| página | `pb` de sus filas (1440) |
|---|---|
| EDAR | `60 · 72 · 28.7969 · 28.7969 · 28.7969` · `28.7969` · `28.7969 · 60 · 28.7969 · 28.7969` |
| Petróleo | `40 · 2` · `60 · 36 · 28.7969 · 60 · 28.7969` · `60 · 28.7969` |

Aparecen 2, 36, 40, 60 y 72. **Eso es dato editorial, no ritmo de plantilla**, y
un modelo que lo cablee no puede representar estas páginas.

## 3. Consecuencia para el CMS

Meter estas dos en el content type de SECTOR **degrada el modelo para los 6 que
hoy funcionan**:

- `flujo` dejaría de ser un enum de 4 con un default seguro y pasaría a 6.
- El `pb` de fila subiría de plantilla a campo, en los 8 sectores, para que dos
  lo usen.
- El *flexible content* pasaría de 5 tipos ajustados a 6 con uno enorme y
  polimórfico que absorbe el 68% del cuerpo.

**Recomendación: arquetipo aparte.** Comparte componentes con SECTOR (cabecera,
hero, cola, y los 5 bloques para su última sección), pero su content type es
otro: una lista de secciones editoriales con ritmo propio, cerrada por un cuerpo
de sector.

## 4. Antes de construir nada, medir esto

Lo que este recon **no** ha resuelto y hay que medir en la fase de specs:

1. **Los `<h4>` en serie** (Petróleo, filas 6 y 10): ¿son un módulo `blurb` de
   Divi, una lista con estilo, o texto suelto? Cambia si es un bloque propio.
2. **La `<table>`** de EDAR: geometría, cabecera, comportamiento a 390.
3. Si la **sección editorial** es un tipo con `variante`, o son 2–3 tipos
   distintos que se parecen. La respuesta sale de contar payloads, no de mirar
   una.
4. El **hero de estas dos** tiene `padding-bottom: 39`, ni 60 (clásico 1440) ni
   20 (clásico 390) — ya costó dos versiones de sonda. Comprobar si su hero es
   el mismo componente con otro ritmo o es otro.
5. Cuántas instancias más de este arquetipo hay o va a haber: hoy son **2 de 8**
   y son **las dos más recientes** del sitio, lo que sugiere que es la plantilla
   nueva y que los otros 6 son el legado. Si es así, el orden de prioridad del
   proyecto cambia.
