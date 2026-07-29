# El experimento que decide si SECTOR y MONOGRÁFICO son un content type o dos

> **Diseñado el 2026-07-29, en fase de specs, ANTES de construir nada.**
> Se escribe ahora justamente porque escribirlo después sería escribirlo sabiendo
> qué resultado conviene. Lo que sigue —hipótesis, criterio de éxito, predicciones
> y regla de decisión— **queda registrado y no se toca** cuando lleguen los datos.

## 0 · Cuándo se corre

**Al terminar de construir MONOGRÁFICO, y no antes.** Hasta entonces: no tocar
`SectorBlock`, no ampliar `flujo`, no subir el `pb` de fila a campo. El
argumento está en `DECISIONES.md` (c) y en §3 del recon.

Se adelanta **solo** si aparece antes una instancia de SECTOR que el modelo de
SECTOR no representa (p. ej. un sector clásico con un `pb` de fila distinto de
28.7969/30). Ese hallazgo *es* el resultado del experimento llegando por otra
puerta.

## 1 · Hipótesis

> **H1** — El content type de MONOGRÁFICO puede expresar el cuerpo de Urbano sin
> pérdida y sin campos nuevos. Es decir: **SECTOR es un caso degenerado de
> MONOGRÁFICO**, y el CMS necesita un solo content type.

**H0** (lo que hay que poder afirmar si H1 falla): existe al menos una propiedad
del cuerpo de Urbano que el modelo de MONOGRÁFICO no representa sin añadirle un
campo. Entonces **la frontera está medida** y los dos arquetipos se quedan
separados con una razón escrita.

Las dos salidas son resultado. La que no vale es "casi entra".

## 2 · Qué se mide, y contra qué

**Clon contra clon, no contra el original.** Urbano ya está clonado y su cuerpo
clava el original (Δ0 en los dos anchos, S7). Comparar la reexpresión contra el
**Urbano actual** elimina de raíz el ruido del sitio vivo: el clon es
determinista y dos builds del mismo código dan el mismo número al céntimo.

El objetivo de medida es, en los **dos anchos** (1440×900 y 390×844):

1. el **árbol sección → fila** del cuerpo (`mt` · `pt` · `pb` · alto de cada
   nodo), con `scripts/qa/tree-cmp.mjs` adaptado a comparar dos rutas del clon;
2. la **altura de documento** (`docH`);
3. las **anclas de texto** del cuerpo (`cmp-sector.mjs`).

## 3 · Procedimiento

1. Construido MONOGRÁFICO, se crea **`/sectores/urbano-mono`** (ruta temporal, no
   enlazada) que monta el cuerpo de Urbano **con el modelo y los componentes del
   monográfico**, transcribiendo `SECTOR_URBANO.body` a `MonoSeccion[]`.
2. La transcripción se hace **solo con los campos que ya existen** en
   `MODELO.md`. **Cada vez que haga falta inventar un campo se anota en el acta y
   no se inventa**: es un fallo de H1, y seguir adelante con el campo puesto
   convierte el experimento en una profecía autocumplida.
3. `npm run build`, matar el servidor **por puerto**, relanzar, verificar un
   marcador del cambio en el HTML servido (§ el corolario de `CLAUDE.md`).
4. Medir las tres cosas del §2 sobre `/sectores/calidad-del-aire-en-las-ciudades`
   y `/sectores/urbano-mono` **en la misma corrida**.
5. Se borra la ruta temporal. **Lo que se conserva es el acta**, no el código.

## 4 · Criterio de éxito — registrado antes de mirar

**H1 se acepta si y solo si se cumplen las tres:**

| # | criterio | umbral |
|---|---|---|
| C1 | ningún campo nuevo en el modelo del monográfico | **0** campos |
| C2 | árbol sección→fila idéntico | **Δ 0** en `mt`/`pt`/`pb` y en el alto de cada fila, **en los dos anchos** |
| C3 | `docH` idéntico | **Δ 0** en los dos anchos |

**El umbral es cero y no es un capricho.** Es clon contra clon: no hay ruido que
justifique una tolerancia. Y el cuerpo de un sector está en la región de
dispersión **0** del sitio (`scripts/qa/README.md` §3), así que aquí un Δ de 8.6
es tan real como uno de 100.

**C1 manda sobre C2 y C3.** Un cuerpo que sale idéntico al píxel *después* de
añadirle dos campos al modelo no prueba H1: prueba que dos modelos parecidos
convergen si se les añade lo que les falta, que es cierto para cualquier par de
modelos.

## 5 · Predicciones — para que no se puedan mover las porterías

Registradas ahora, con lo que se sabe hoy. El valor del experimento está en que
estas cuatro se pueden equivocar:

| # | pieza de Urbano | predicción | por qué |
|---|---|---|---|
| P1 | `beneficiosAplicaciones` | **entra sin campos nuevos** | EDAR S2F0 es literalmente `punt · h3 · ul` en las dos columnas — ya medido |
| P2 | `flujo: seccionRasa` / `filaPegada` | **entra**: son `{mt:0,pt:0,pb:0}` y `{pt:0}` | el enum de 4 es una proyección de los overrides (`seccion-editorial.spec.md` §1) |
| P3 | `ctaDescarga` piel `"foto"` | **entra**, pero el monográfico **no la ejercita** (solo usa `"fondo"`) | el campo `variante` ya existe en `SectorBloqueCtaDescarga` y viaja con el módulo |
| P4 | **`claimConFoto`** | **ES EL QUE FALLA** | ver abajo |

### P4, la predicción que importa

`claimConFoto` es lo único de Urbano que el monográfico **no tiene ninguna
instancia de**, y tiene dos rasgos que el modelo no expresa hoy:

- el claim es un **`<p>` de 37px**, no un `h2` ni un `h3` (el `claim` del
  monográfico es `h2` 37/37 o `h3` 44/55);
- va **centrado verticalmente** respecto a la foto (el original usa
  `margin: 121.031px 0` en la columna; el clon lo resuelve con `items-center`).
  **Ninguna columna del monográfico está centrada verticalmente**: las 31
  medidas apilan desde arriba.

Si P4 se cumple, H1 cae por C1 y el resultado es **"la frontera está en la
alineación vertical de columna y en el nivel semántico del claim"** — una
frontera concreta, medida y de una línea, que es exactamente el resultado
valioso del caso "no entra".

Y si P4 **no** se cumple —si el `<p>` de 37 resulta ser expresable como un
`claim` más y el centrado sale del reparto de alturas—, entonces H1 sobrevive a
su prueba más dura, y eso vale mucho más que si nadie hubiera predicho nada.

## 6 · Regla de decisión

| resultado | qué se hace |
|---|---|
| **C1 + C2 + C3** | Se declara probado **por construcción** que SECTOR ⊂ MONOGRÁFICO. El esquema del CMS pasa a **un content type** con SECTOR como caso degenerado. La fusión se planifica como tanda propia — **no se hace en caliente el mismo día**. |
| **C1 falla** (hacen falta campos) | Se documenta **cuáles** y por qué, en este mismo fichero. Los dos content types se quedan separados **con la frontera escrita**. No se añaden esos campos "de paso". |
| **C2 o C3 fallan con C1 cumplido** | El modelo expresa el dato pero los componentes no lo pintan igual: es **defecto de componente**, no de modelo. Va a `PENDIENTES-QA.md` y el experimento se repite tras corregirlo. |

En los tres casos el acta se escribe **aquí**, con fecha, y `HANDOFF.md` apunta a
ella.

## 7 · Después del experimento, pase lo que pase

**Correr `scripts/qa/enlaces.mjs`** con el clon servido y después de
`npm run build`.

En cuanto MONOGRÁFICO emita sus rutas, los enlaces a EDAR y a Petróleo y gas que
hoy son correctos **pasan a ser fallo automáticamente**, sin tocar la sonda: la
regla se deriva de `.next/prerender-manifest.json`. Hay que localizarlos en los
**tres** ficheros que pintan enlaces a sectores —`nav.ts`, `footer.ts` y
`home-carrusel-sectores.ts`— y volver a correrla hasta que salga limpia.

La sonda cubre las dos direcciones y está verificada en negativo. Sale con
código 0 limpia y 1 sucia.
