# PRE-REGISTRO de la comparación de E1 — 104.ª tanda, 2026-08-24

**Escrito ANTES de correr `qa:f33-cmp`**, y con la lista de lo que la tanda tocó
pegada delante en vez de recordada (§regla 8b, segunda mitad: *«qué cambió el
instrumento se deriva del `diff`, nunca se recuerda»*).

Su función no es acertar: es que un Δ **esperado** no se lea como defecto y que
un Δ **inesperado** no se pueda explicar a posteriori.

---

## 0 · QUÉ TOCÓ ESTA TANDA — derivado, no recordado

```
git diff --name-only <HEAD antes de la tanda>..HEAD -- apps/ packages/ scripts/qa/
```

| fichero | qué |
|---|---|
| `apps/web/src/app/[slug]/page.tsx` | despacha un TERCER catálogo (19 rutas) |
| `apps/web/src/app/{centro-de-ayuda,soporte,recursos}/[...ruta]/page.tsx` | extienden `generateStaticParams` (4 · 4 · 3) |
| `apps/web/src/app/empresa/[...ruta]/page.tsx` | **ruta nueva** (1) |
| `apps/web/src/components/cola-larga/PaginaF33.tsx` | **nuevo** — el árbol, con `switch` por régimen |
| `apps/web/src/components/BandaCabecera.tsx` | entrada `colaLargaB` (193.72 / 196.58) |
| `apps/web/src/lib/cms/paginas.ts` | el campo `regimen` en el tipo de lectura |
| `scripts/qa/f33-cmp.mjs` | dominio 6 → **31**; ejes de MÓDULO; reparto por régimen |
| `scripts/qa/f33-cmp.neg.mjs` | los negativos pasan a `PILOTO=1` |
| `docs/research/cola-larga/derivaciones/arbol-f33.mjs` | `censaPaginasF33()`, censo compartido |
| `docs/research/cola-larga/derivaciones/piloto-f33.mjs` | consume el censo compartido |

**Control del refactor del censo:** `piloto-f33.json` sale **byte a byte
idéntico** tras mover el censo a `arbol-f33.mjs`. Un refactor que dice ser
NO-OP y no lo demuestra es una hipótesis.

---

## 1 · LO QUE **DEBE** SALIR IGUAL

| predicado | por qué |
|---|---|
| **las 382 rutas de la línea base, sin mover un píxel** a los **dos** anchos | ninguna de ellas lee `paginas`; lo que se tocó de sus ficheros es `generateStaticParams`, que añade, no sustituye |
| **0 rutas DESAPARECIDAS** | extender un catch-all sólo puede añadir |
| `qa:slugs` **limpio** | `paginas` reclama 19 slugs de raíz y ninguno lo sirve otra familia |

⚠ **Y la mitad que hay que decir en voz alta: los 6 artículos de KB salen por
los MISMOS dos ficheros que se han tocado.** Emitir de MENOS **no da error** —
un catálogo que devuelva `[]` deja de emitir sus rutas y el build sigue verde—,
así que el predicado no es «compila»: es **`0 desaparecidas` en la diferencia
simétrica**.

---

## 2 · LO QUE **DEBE** SALIR DISTINTO, con su cardinal exacto

### 2a · `nSecciones`: **−1 en exactamente 10 rutas**, 0 en las otras 21

No es un defecto de la emisión: es la **RETIRADA**, declarada y contada en
`f33-extraido.json` §`retirada` desde antes de esta tanda —
`seccionesColapsadas: 10 · filasColapsadas: 10 · columnasColapsadas: 10`, y
**313 módulos censados → 301 emitidos**.

En esas 10 la sección del original tiene **un solo módulo**, y ese módulo se
clasificó fuera del contenido:

| clase | n | qué es |
|---|---|---|
| **CASCARÓN** | **10** | la MIGA — pertenece al cascarón, no al cuerpo |
| **CONSULTA** | **2** | `bucle-entradas` (`/recursos`) y `listado-cientifico` (`/recursos/documentos-cientificos`) — §*un listado no tiene contenido propio: es una CONSULTA* |

Las 10 rutas, nombradas (no «unas cuantas»):

```
/empresa · /empresa/premios-y-reconocimientos · /productos · /recursos
/recursos/documentos-cientificos · /recursos/kunakpedia
/recursos/preguntas-frecuentes · /sectores · /soporte
/soporte/servicio-de-reparacion
```

Predicción cruzada, ya medida sobre el HTML **estático** del build:
**21 de 31 cuadran, 10 descuadran en −1, y son esas 10.**

> ⚠⚠ **PERO LA MIGA NO ESTÁ EMITIDA POR NADIE, Y ESO SÍ ES UN HUECO.**
> «CASCARÓN» significa *lo pone el cascarón, no el cuerpo* — y el cascarón de
> este arquetipo (`PaginaF33`) **no emite miga**. O sea que la retirada sacó la
> miga del contenido **sobre una promesa que el render todavía no cumple**:
> §*documentado no es conectado*, con las dos mitades en ficheros distintos.
> Se predice, por tanto, un Δ de `base`/`docH` **en esas 10** — y **no se
> arregla en esta tanda**: se mide, se adjudica y se ficha con sus dos lados.

### 2b · `base` y `docH`: Δ ≠ 0 esperado, y **no se sabe cuánto**

Tres causas conocidas, ninguna medida todavía:

1. la **miga ausente** en 10 rutas (2a);
2. la banda `colaLargaB` es **`B-` sólo**: `BT` reusa `BANDA.kb` y su `y` de
   primera sección propia en la única `BT` del piloto es **340.16** contra
   **371.44** de KB — un Δ de **31.28** que esta tanda **no adjudica**;
3. el régimen `--` tiene **n = 1**: nada de lo que su cascarón haga está
   probado por variación.

### 2c · el eje de MÓDULO: **estreno**

`f33-cmp` no lo medía hasta hoy. **No hay predicción numérica** — sería
inventarla. Lo que sí se predice es la FORMA de un fallo:

> si el clon perdiera un módulo, la llave posicional **desalinea todo lo que
> viene detrás** y el `CRUCE DE TIPO` lo dice con nombre. Un Δ de ritmo, en
> cambio, no desalinea nada.

---

## 3 · LO QUE ESTE PRE-REGISTRO **NO** PREDICE

* **la tipografía** — 2 de las 5 familias de variables de `f33.css` salen
  INERTES (`--f33h-*`, `--f33blurb-*`) porque la piel está **SIN DERIVAR**;
* **el comportamiento** — 36 de 313 módulos viven en desplegables CERRADOS y
  exigen INTERACCIÓN (eje `comport`, **0/31**);
* **los anchos intermedios** — ahí el contrato es de RANGO, y es otra pregunta;
* **`map` · `slider` · `icon`** — n = 1, SIN PROBAR, deliberadamente no cableados.

---

## 4 · CRITERIO DE CIERRE (CORTE LIMPIO 2)

* un Δ **predicho en §2a** con su cardinal exacto ⇒ **no es defecto**, es la
  retirada;
* un Δ **no predicho** ⇒ se ficha **con sus DOS LADOS** (`orig X → clon Y`) y la
  tanda **cierra sin registrar cobertura**;
* `f33-cmp` entra en `qa:cobertura` **sólo** si los Δ son adjudicables.
