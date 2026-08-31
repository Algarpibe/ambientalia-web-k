# 131.ª · PASO 0 — DERIVA

**Fecha (del sistema): 2026-08-31 · HEAD de arranque `259f987`.**
Todo lo de aquí se derivó; nada se cita de memoria (§regla 9). Cada cifra lleva
su unidad (§regla 14), y los hechos negativos se buscaron.

---

## 1 · Estado y tripwire

| qué | derivado | fichero / vía |
|---|---|---|
| `CLAUDE.md` cargado | **322 186 chars · 2.15×** el aviso de 150 000 | `git show 259f987:CLAUDE.md` |
| tripwire `KV-01 · 7HQMPD` | **1 anclada a línea** (3 libres, las otras 2 son prosa) · pos **22.4 %** | idem |
| tripwire `KV-08 · 5ZMCFR` | **1 anclada a línea** (2 libres) · pos **100 %** | idem |
| congeladas | **1544 FICHEROS** en `scripts/qa/medidas/`, **554 ARTEFACTOS** | `readdirSync` |
| negativos en disco | **73 FICHEROS** `*.neg.mjs` | `git ls-files` |
| comandos `*-neg` | **88 COMANDOS**, y **0 huérfanos** (§regla 26) | `package.json` × disco |
| sondas | **219 sondas COMPILAN y declaran su mínimo** | `npm run qa:lib`, `EXIT=0` |
| manifiesto | **429 RUTAS** · `apps/web/.next/prerender-manifest.json`, mtime `2026-08-31T19:54:40Z` | §regla 5: se cita CON su fichero |
| procesos | **0 sondas del proyecto en vuelo** (27 `node.exe` ajenos, ninguno con `kunak` en su línea de órdenes) | §regla 18 — es de PROCESOS, no del árbol |
| DB | **151 tablas** · las **13 de `arquetipos` creadas** · **0 filas** · migración `20260831_015813_f3_5_arquetipos` en **batch 3** | consulta real, no el «Up» de `docker ps` |

Derivación: `paso0-131.{mjs,log}`.

> ⚠ **La v1 de `paso0-131.mjs` publicó `negativos = 554`, IDÉNTICO a su propio
> recuento de artefactos.** Su `git ls-files scripts/qa | grep -c neg` casaba
> `scripts/qa/medidas/*-neg-*.json`, que están versionados. Es §sondas 4 en su
> cara de **sobre-casado**, y **lo delató el empate**: dos cifras de objetos
> distintos no salen iguales por casualidad. El bueno es **73**.

---

## 2 · Lo que hay que sembrar — CON SU UNIDAD

**Las tres cifras son ciertas y cuentan cosas distintas** (§*corregir un
denominador no es sustituirlo en todas partes*):

| cardinal | unidad |
|---|---|
| **4** | **FILA de `arquetipos`** ← lo que la siembra inserta |
| **231** | módulo de PRIMER NIVEL del cuerpo (90 · 35 · 70 · 36) |
| 311 | nodo `.et_pb_module` del cuerpo en el DOM, a cualquier profundidad |

Las 4 filas: `/monitor-calidad-aire` (`producto`) · `/accesorios` (`catalogo`) ·
`/software-de-medicion-calidad-del-aire` (`software`) · `/kunak-api`
(`software` + `varianteCorta`).

### ⚠ La nota del encargo sobre los valores explícitos NO se sostiene

El encargo decía —para contrastar, no para copiar— *«los valores explícitos
viven en `/software-…` y `/accesorios`»*. **Derivado, es falso**, y la
distinción es la que decide qué escribe el sembrador:

> **«Qué MARCADORES llevan CAMPO» y «qué VALORES lleva cada instancia» son dos
> preguntas, y sólo la segunda es la que se siembra.**

- **marcadores con CAMPO** (ESQUEMA §2o, 130.ª): `menu-anclas` e `iconos-md-2`
  en la fila 3 de `/software-…`. Cierto — es dónde el arquetipo **admite** un
  valor propio;
- **valores medidos**: los publica `escalon1-varianza-127.json`, y su alcance es
  **la familia PRODUCTO** —`monitor` · `estacion` · `sensor`—, **no el lote**.
  Reparto: **132 pares · 8 CAMPO · 26 PLANTILLA · 98 SIN ESCRIBIR**.

**Y los 8 CAMPO son los 8 del MISMO documento**, que es exactamente el caso que
`CLAUDE.md` documenta en §*un veredicto producido sobre un agregado no se puede
atribuir a sus miembros*:

| marcador · eje | monitor **(del lote)** | estacion (fuera) | sensor (fuera) |
|---|---|---|---|
| `parametros` · mb | **0** | 9 | 0 |
| `clear-both` · mb | **0** | 9 | 0 |
| `menu-anclas` · mb | **31.6719** = default | 27.2 | 31.6719 |
| `menu-anclas` · pt | **0** | 17 | 0 |
| `clear` · pt | **0** | 32 | — |

> **De los 4 documentos del lote, NINGUNO tiene un valor de ritmo medido como
> no-default.** El único del lote en esa familia lleva **el default en las 5
> piezas**. Los valores no-default viven todos en `estacion-de-monitoreo-…`, que
> **no es del lote**.

**Consecuencia para el ESCALÓN 2, y va con su cardinal:** el `ritmo` de los 231
módulos se **OMITE** salvo que una medición lo diga, y **hoy ninguna lo dice
para estos 4 documentos**. Los otros 226 módulos ni siquiera entraron en el
denominador de la 127.ª: son **SIN MEDIR por alcance**, que no es «default
confirmado». Se declara, no se cablea.

---

## 3 · LOS CANALES DE MEDIA — el punto de mayor valor

Enumerados **caminando la CONFIG**, cruzados contra **la guarda que PARA**
(`existsSync(apps/web/public + ruta)`, la misma de `creaContexto().media`,
`seed.mjs` L258-286). Derivación: `canales-media-131.{mjs,json,log}`.

| canal | inst | rutas | faltan (win) | faltan (LINUX) | |
|---|---|---|---|---|---|
| `bloques.icono-arq.imagen` | 70 | 55 | 0 | **0** | opcional |
| `bloques.imagen-arq.imagen` | 27 | 7 | 0 | **0** | REQUERIDO |
| `bloques.video-arq.portada` | 2 | **0** | 0 | 0 | opcional — cero DECLARADO |
| `bloques.galeria-arq.items.imagen` | 1 | 9 | 1 | **6** | REQUERIDO |
| `seo.ogImage` | 0 | **0** | 0 | 0 | opcional — cero DECLARADO |

**Total: 5 canales · 71 rutas distintas.**

**Las 6 ausencias, CLASIFICADAS (§regla 27, sin cubo de sobras):**

| clase | n | qué trabajo manda |
|---|---|---|
| **RENOMBRE** | **6** | el fichero **está en el repo** con otro nombre → resoluble **SIN RED** |
| **AUSENTE** | **0** | ninguna necesita campaña de captura |

Las 6 son las de la galería de PRODUCTO: `H2S_spain` · `NO2_UK` · `O3_spain` ·
`PM10_belgium` · `PM2.5_belgium` · `SO2_france`, contra `h2s_spain.webp`,
`no2_uk.webp`, `o3_spain.webp`, `pm10_belgium.webp`, `pm25_belgium.webp`,
`so2_france.webp`. El clon las transcribió a mano en julio normalizando a
minúsculas, y `PM2.5` → `pm25` perdió además el punto (`monitor.ts:227-228`).

### ⚠⚠ Y EL HALLAZGO DE MÉTODO: `existsSync` EN WINDOWS ES CASE-INSENSITIVE, ASÍ QUE LA GUARDA QUE PARA DA UN VEREDICTO DISTINTO AQUÍ Y EN EL DESPLIEGUE

> **La guarda de Windows dice 1 y la de Linux dice 6.** Un factor de **6**, y el
> que manda es el de Linux: allí `NO2_UK.webp` **no** encuentra `no2_uk.webp`.

Un `cms:seed` verde en esta máquina puede morir con 5 `MEDIA AUSENTE` más en un
despliegue. Es §*el veredicto lo da la salida servida* con el contenedor puesto
en **el sistema de ficheros**, y ninguna sonda del repo lo miraba.

### ⚠ Y el cero de la galería era del INSTRUMENTO — conservado

La v1 de `canales-media-131.mjs` publicó **`galeria-arq · instancias 0`**. Su
parser de `subida()` no veía el anidamiento dentro del `array` de `items`, así
que declaró el canal como `galeria-arq.imagen` mientras la tabla lo buscaba como
`galeria-arq.items.imagen`. **Los dos nombres son plausibles y no casan**, y la
única instancia de `et_pb_gallery` —con sus 9 imágenes y su campo `required`—
cayó fuera del recuento.

**Las dos mitades del error estaban IMPRESAS y no se contaban juntas** (§regla 1):
al lado del cero, su propia salida decía `canal … NO declarado`. La v2 lo
convierte en **control duro** —toda entrada de `PORTAN_MEDIA` tiene que casar un
canal declarado, y un no-casado es ROJO—. Evidencia:
`canales-media-131-SONDA-CANAL-GALERIA-SIN-CASAR.{json,log}`.

**Control de la v2, verde:** el recorrido REPRODUCE el `porDoc` de la 126.ª —
**PRODUCTO 90 · CATÁLOGO 35 · SOFTWARE 70 · SOFTWARE-corta 36**. Sin eso, el
recuento de media no valdría.

---

## 4 · §regla 5bis — el ALCANCE del daño en la línea base de la 129.ª

Derivación: `base-129-caducada-131.{mjs,json,log}`.

**El titular NO discrimina:** las dos congeladas publican **`distintos: 43`**
(y 49 a 390) — el mismo número antes y después de cerrar el `srcset`. Leído por
ahí, el arreglo de la 130.ª «no hizo nada». Lo que discrimina es comparar
`|clon − original|` **par a par**.

| ancho | pares | tocados | **CREA** (cobertura nueva) | **MUEVE** (daño real) | acercan | alejan |
|---|---|---|---|---|---|---|
| 1440 | 128 | 52 (40.6 %) | **49** | **3** | 3 | 0 |
| 390 | 127 | 59 (46.5 %) | **55** | **4** | 2 | 2 |

> **Sin el corte CREA / MUEVE el número se lee al revés.** 49 y 55 de los
> «ALEJA» son pares que la congelada de antes **no tenía** —el eje `módulos` que
> la 130.ª encendió—, y salen con `distAntes = 0` porque no existían, no porque
> se hayan alejado.

**➜ El alcance real del daño son 3 pares de 128 (2.3 %) y 4 de 127 (3.1 %)**,
todos ejes `h` de filas con imágenes. El mayor: `/software-… fila3 h`, de
`|Δ| 1671.6 → 34.65` con la `orig` moviéndose de 3871.56 a 5577.81 — que es la
firma del original pintando ahora sus imágenes.

### La congelada NO se renombra, y la razón está DERIVADA

§regla 5bis manda renombrar una congelada caducada; §regla 45 manda corregir el
acta y no el fichero. Aquí gana la segunda, por tres razones medidas:

1. **el resolutor ya elige la buena, verificado POR EFECTO** (no por frescura):
   un resolutor por `mtime` que descarte artefactos devuelve
   `productos-cmp-{1440,390}-2026-08-31-srcset-cerrado.json` en los dos anchos.
   Renombrar no compra nada;
2. **renombrar la volvería INVISIBLE a `cobertura.mjs`**, que consume
   `congeladasDe("productos-cmp")` — la familia ENTERA (§regla 7, la vuelta: un
   marcador de artefacto no es una etiqueta, es un FILTRO);
3. **sigue siendo el «antes» CORRECTO del NO-OP de la 130.ª**
   (`escalon1-noop-130.mjs`): los dos lados de aquella comparación se tomaron
   con el mismo instrumento.

Con **3 y 4 pares tocados de 128 y 127**, renombrarla entera sería tirar una
medida buena al 97 % — que es exactamente contra lo que §regla 5bis avisa
(*«decir "el espejo está mal" habría tirado una medida buena"»*).
Derivación: `resolutor-base-131.{mjs,log}`.

> ⚠ **Y la v1 de `base-129-caducada-131.mjs` publicó `pares comparables: 0`,
> `ALCANCE = NaN %` y `EXIT=0`** — indexaba `j.rutas[].ejes[]`, que en esa
> congelada no existe. **Sus dos controles pasaron**, porque vigilaban el
> **orden** de las congeladas (`mtime`), no que se hubiera comparado nada: el
> contrato estaba un nivel POR ENCIMA de lo que se compara (§regla 44). La v2
> añade la guarda que faltaba —`pares comparados > 0`— y con ella el fallo salió
> en rojo, destapando además una **llave repetida** real
> (`/kunak-api|modulo|fila1|mb`): `modulos.difs` va por (fila, **módulo**, eje).
> Evidencia: `base-129-caducada-131-SONDA-INDEXABA-RUTAS-EJES.{json,log}`.

---

## 5 · Qué hay YA en el repo que haga parte de este trabajo

Se recorrió antes de escribir una línea. **Hay mucho, y el patrón es
reutilizable** — nada de esto se va a reescribir:

| pieza | dónde | qué aporta |
|---|---|---|
| el registro de catálogos | `scripts/seed/catalogos.mjs` §`CATALOGOS` | **dos vías**: `json`+`en` (catálogo extraído) y `modulo`+`exportado` (desde `src/lib`) |
| el sembrador | `scripts/seed/seed.mjs` (`siembra`, `exigeVacia`, `SEMBRADAS`) | recorrido, guardas de media y de relación, modo **sondeo** |
| la guarda de media | `creaContexto().media`, `seed.mjs` L258-286 | **la que PARA** — y ya tiene rama de sondeo que anota en vez de morir |
| 6 extractores | `extractor-{p,a,c,f33,kb,listados}.mjs` | el patrón entero: corpus → catálogo congelado → control contra la transcripción a mano |
| la traducción de URL | `transformaciones.mjs` L134 / L1003 | `…/uploads/x` → `/images/uploads/x`, **cola VERBATIM** |
| el comparador de dos lados | `qa:productos-cmp` | ya adjudicado, con 6 negativos |
| el inventario por canales | `qa:media-canales` | deriva canales de la config resuelta |

**Lo que NO existe** (buscado, no recordado): **no hay extractor del lote F3-5**
— `git ls-files scripts/seed | grep -i "f35\|arquetipo"` da **0 ficheros**, y
`CATALOGOS` no tiene entrada para `arquetipos`.

**Y la vía tiene que ser `json`+`en`, no `modulo`+`exportado`:** los 231 módulos
están medidos **sobre el CORPUS** (`monitor-calidad-aire.html` …), no sobre
`src/lib`. Sembrar desde `src/lib` —como hacen `sectores` y `monograficos`—
poblaría el content type con una estructura que **nadie midió contra el
original**.

---

## VEREDICTO DEL PASO 0 — y por qué NO se corta aquí

§DÓNDE CORTAR LIMPIO punto 1 manda cortar *«si aparece un canal de media SIN
CAPTURAR»*. **No aparece ninguno: `AUSENTE = 0`.** Los 6 huecos son **RENOMBRE**
—el fichero está en el repo—, que es la distinción que este repo ya pagó en la
129.ª (*«de esas 5, 3 eran resolubles SIN RED»*). Capturar es una campaña con su
encargo; **esto no lo es**, y tratarlo como tal pararía la tanda por un trabajo
que no hay que hacer.

**La tanda sigue al ESCALÓN 1.**
