# HIPÓTESIS ENCOLADA · ¿el grupo D cuesta un arquetipo o cero?

> **Pre-registrada el 2026-07-30. NO se ha ejecutado.** Se escribe ahora, antes
> de tener ningún dato del grupo D, por la misma razón que
> `../monografico-tecnico/EXPERIMENTO-URBANO.md`: escrito después sería escrito
> sabiendo qué conviene.

## 1 · De dónde sale

`../RECON-LISTADOS.md` §3 midió que el **grupo D — artículo de centro de ayuda,
13 páginas** no es de la familia editorial:

| | grupo A (209) | grupo D (13) | control: SECTOR / MONOGRÁFICO |
|---|---|---|---|
| `<body>` | `single-<cpt>` | **`page-template-default` + `page-id-…`** | `page-template-sectors` |
| `et_pb_pagebuilder_layout` | no | **SÍ** | **SÍ** |
| secciones propias de la instancia | 0 | **1** | 7 · 8 |
| cuerpo | módulo `post_content` | **compuesto por el editor** | compuesto por el editor |

**El grupo D es una página del builder**, del mismo tipo que SECTOR y
MONOGRÁFICO. Y el cuerpo de una página del builder es **el árbol de Divi**, que
es literalmente lo que `MonoSeccion[]` modela (`src/lib/monografico.ts`).

## 2 · La hipótesis

> **HD1** — El content type de MONOGRÁFICO (`MonoSeccion[]` y su árbol
> sección → fila → columna → módulo) **expresa el cuerpo de las 13 páginas del
> grupo D sin campos nuevos**. Si es cierto, **esas 13 páginas no cuestan un
> arquetipo**: cuestan datos.

> **HD0** — Hacen falta campos o estructura. Entonces la frontera está medida y
> el grupo D es arquetipo propio, con su razón escrita.

## 3 · Cómo se contesta — el mismo protocolo que ya funcionó

Es el diseño de `EXPERIMENTO-URBANO.md`, que ya se corrió una vez y dio un
resultado limpio (H1 rechazada por C1, tres campos medidos):

1. **Recon primero**: topología de las 13, sin escribir código.
2. **Transcribir una** a `MonoSeccion[]` **solo con campos existentes**. Cada vez
   que haga falta inventar un campo **se anota y no se inventa** — poner el campo
   convierte el experimento en profecía autocumplida.
3. **Andamio** en una ruta temporal marcada, medida **clon contra clon** con
   `npm run qa:dos-rutas`, umbral **cero**, a 1440 y a 390.
4. **Borrar el andamio** y verificar con `qa:clon-base`, `qa:enlaces` y
   `qa:corte` que el árbol vuelve.

### Criterios, con el mismo orden de mando

| # | criterio | umbral |
|---|---|---|
| **D1** | ningún campo nuevo en `MonoSeccion[]` | **0** campos |
| **D2** | árbol sección→fila idéntico | **Δ 0** en los dos anchos |
| **D3** | `docH` idéntico | **Δ 0** en los dos anchos |

**D1 manda sobre D2 y D3**, por la misma razón que C1 mandaba: un cuerpo idéntico
al píxel *después* de añadir campos no prueba nada.

## 4 · Predicciones — registradas antes de mirar

Con lo que se sabe hoy, que es solo el esqueleto de 2 de las 13:

| # | pieza | predicción | por qué |
|---|---|---|---|
| **PD1** | la retícula y el ritmo | **entran** | el grupo D usa la misma retícula Divi que todo el sitio; `MonoRitmo` ya cubre sección/fila/módulo |
| **PD2** | los módulos de texto, imagen y botón | **entran** | son los que `MonoModulo` ya tiene |
| **PD3** | **la barra lateral** (`sidebar` + `sticky_module` medidos en el esqueleto) | **ES EL QUE FALLA** | ver abajo |
| **PD4** | el `blurb` (medido en las dos instancias) | **falla o entra según qué sea** | no hay `blurb` en `MonoModulo`; si es un `texto` con icono, quizá se exprese; si es un módulo con su propia retícula, no |

### PD3, la que importa

El esqueleto de las 2 instancias medidas trae `sidebar_` y `sticky_module` en la
sección 0. **`MonoColumna` no tiene barra lateral y `MonoSeccion` no tiene
adherencia**: las 31 columnas del monográfico son columnas normales de una fila.

Una barra lateral **pegajosa** no es un campo de la columna: es un
comportamiento, y encima cambia la retícula (la fila pasa a ser contenido +
lateral). Si PD3 se cumple, el resultado es **«la frontera está en la barra
lateral adherente»** — concreta, medible y de una línea, que es el resultado
valioso del caso «no entra».

## 5 · Cuándo se corre

**No ahora.** Va después de que el grupo A esté decidido, por la misma regla que
puso el experimento Urbano después de construir MONOGRÁFICO: **primero se termina
lo que se tiene entre manos.**

Se adelanta **solo** si aparece antes una instancia del grupo D que el modelo de
MONOGRÁFICO claramente no representa — ese hallazgo *es* el resultado del
experimento llegando por otra puerta.

## 6 · Lo que está prohibido hasta entonces

- **No tocar `MonoSeccion[]`** para «dejarlo preparado» — eso es exactamente
  añadir el campo antes de la prueba.
- **No construir el grupo D** ni parcialmente.
- **No dar por buena PD3** sin medirla: es una predicción, y en la tanda anterior
  falló la que se daba por segura (P3).
