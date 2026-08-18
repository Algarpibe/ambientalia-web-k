# PRE-REGISTRO · 81.ª tanda — el campo de fecha, y `L5` entera

> **Escrito y commiteado ANTES de medir.** Un pre-registro protege de decidir por
> cansancio y **no** protege de partir de una premisa falsa (§sondas 8b): los
> hechos negativos que afirma van comprobados **contra el archivo** al
> escribirlo. Y su segunda mitad, pagada por la 79.ª: **lo que un cambio toca se
> DERIVA del `git diff`, nunca se enumera de memoria.**

**Fecha:** 2026-08-18 · **Anchos:** 1440 y 390 · **DPR:** 1 · **Objetivo:** el
CLON contra los espejos congelados de la 79.ª · **Alcance:** el universo de
`lh-cmp` más la forma nueva `L5-casos`.

## Estado de partida, DERIVADO y no recordado

| | valor | de dónde |
|---|---|---|
| commits | **421** | `git log --format=%H \| wc -l` |
| árbol | **limpio** | `git status --porcelain` vacío |
| congeladas | **1107** | `ls scripts/qa/medidas/*.json` |
| sondas | **181** | `qa:lib`, última línea |
| rutas emitidas | **373** · 19 familias · 0 vacías | `qa:manifiesto`, EXIT 0 |
| `BUILD_ID` | `VwpCEg806tSXkz6kG-LcB` | `apps/web/.next/BUILD_ID` |
| último commit que toca `src/` o `packages/` | `517e1f6` (08-18 09:48) | `git log -1 -- apps/web/src packages` |
| `kunak-cms-pg` | **Up 7 h** | `docker ps` |

> ⚠ **Un número del encargo NO reproduce y se escribe el derivado (§regla 9):**
> el encargo dice **186 sondas** y `qa:lib` cierra con **181**. Se usa 181.

**El `.next` que hay en disco es de este árbol:** los cinco commits posteriores a
`517e1f6` tocan **sólo `docs/` y `medidas/`**, así que no hay build pendiente que
invalide una medida del PASO 0.

**Procesos (§regla 18, que no se deriva de `git status`):** ~34 `node.exe`,
**todos identificados** — servidores MCP salvo **tres** scripts `_tmp-consulta*`
de este repo abandonados desde las 8:49–8:58, que sostienen **3 conexiones
`idle`** a `kunak_cms`. **No bloquean**: `max_connections = 100` y el `pool.max`
de 3 es **por proceso**, no compartido. Ninguno es una sonda en vuelo.

## La línea base del comparador, con su FICHERO nombrado

`medidas/lh-cmp-1440-2026-08-18-2.json` y `medidas/lh-cmp-390-2026-08-18.json`
—**no** los canónicos, que son la primera foto (§sondas 5):

| | @1440 | @390 |
|---|---|---|
| formas | **13** | **13** |
| ausentes en el clon | **4** | **4** |
| con diferencias | **9** | **9** |
| pares comparados | 12 611 | 12 620 |
| pares distintos | 622 | 619 |

## Las TRES decisiones del propietario, escritas antes de medir

Van al registro en este mismo commit, no al chat (§MENCIONADO NO ES DOCUMENTADO):

1. **`CMS-ORDEN-L2` / ESQUEMA §7g** — se añade el **campo de fecha** a `casos` y
   `terminos-kunakpedia` y se construye `L5`. Es **transcripción**: la clave está
   servida y medida (57/57 y 37/37);
2. **§F3-LH-DESEMPATE-DE-L3** — **DECLARAR y no tocar**. Los 17 de 23 se quedan
   con su número; no se modela un desempate que el original no sirve por ningún
   canal (0 de 23). Precedente: el `h1` bimodal;
3. **Alcance de F3-5** — **todos los arquetipos que sigan en `src/lib/`**, no
   sólo HOME. Las **dos lecturas** que convivían en `PLAN-FASE-3.md` se resuelven
   **borrando** la de HOME-solo. ⚠ El cardinal *«seis»* del encargo **no
   reproduce**: derivado por el criterio *«`page.tsx` que importa contenido de
   `src/lib/`»* salen **5 rutas · 4 arquetipos + 1 variante**. La sustancia no
   depende del número; el número se publica con su criterio.

## LAS PREDICCIONES

| # | predicción | cómo se falsa |
|---|---|---|
| P1 | rutas emitidas **373 → 374** (+1 de `L5`) | `qa:manifiesto`. Si sale otra cifra, se **nombra ruta a ruta**, no se ajusta |
| P2 | comparador de FORMAS **13 · 4 ausentes · 9 comparadas → 13 · 3 · 10** | `qa:lh-cmp`. Las 3 que quedan ausentes son **`L2-glosario`, `L2-faqs` y `L4`** |
| P3 | comparador de PÁGINAS: **una ausente menos** | `qa:lh-cmp-todas` |
| P4 | `qa:cobertura` **sube** | la matriz |
| P5 | el campo nuevo **NO mueve ningún par de `L1` ni de `L3`** | si los mueve, es el disparador **(e)** y es la CLASE, no `L5` |
| P6 | el caso **«documento SIN fecha»** sigue en **0 de 57** y **0 de 37** | si al sembrar se ejercita, es el disparador **(d)**: camino de render **sin estrenar** |

> ⚠ **Lo que este pre-registro NO puede predecir todavía, y se dice en vez de
> improvisarlo:** *qué toca exactamente el cambio de esquema*. Eso se **deriva
> del `git diff`** del commit de la migración, en el PASO 2 y **antes** de medir
> el PASO 3 — que es justo la lección que la 79.ª pagó escribiendo de memoria una
> lista de dos cuando eran tres.

## LOS CINCO DISPARADORES DEL ESCALÓN 2 (parar y fichar, no construir encima)

| | disparador |
|---|---|
| **a** | el `datePublished` derivado del corpus **no reproduce** 57/57 o 37/37 ⇒ el campo no es la clave |
| **b** | la migración **no es reversible**, o `cms:reset` + re-siembra no reproduce el estado de hoy |
| **c** | `qa:cms-roundtrip` o `qa:cms-campos` rojos por algo que **no** sea el campo nuevo |
| **d** | al sembrar se ejercita **«documento SIN fecha»** (hoy 0 instancias) |
| **e** | construir `L5` mueve pares en formas **ya verificadas** (`L1`, `L3`) |

**CORTE LIMPIO 1:** con el campo migrado, sembrado y el round-trip verde, **parar
ahí es cierre válido** y `L5` entra entera en la 82.ª sin nada a medias.
