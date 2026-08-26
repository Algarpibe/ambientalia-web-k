# ACTA · PASO 0 de la 114.ª — EL CENSO DE CANÓNICOS CABLEADOS (2026-08-26)

Pre-registro: `PRE-REGISTRO-CANONICOS-CABLEADOS-114.md` (commit `7553156`,
escrito y commiteado **antes** de correr nada).
Instrumento: `canonicos-cableados-114.mjs` · salida: `canonicos-cableados-114.log`.

---

## §1 · EL VEREDICTO, EN LAS DOS UNIDADES QUE HACEN FALTA

**La cadena de captura está protegida y la red se puede gastar.** Tres lecturas
peladas arregladas, una verificada como falso positivo, cero lectores muertos.

| magnitud | antes de arreglar | después |
|---|---|---|
| CONSUMOS de `medidas/` (unidad LECTURA) | 119 | 119 |
| de ésos, **CABLEA** | 118 | 118 |
| **RESUELVE** por `mtime` | **1** | 1 |
| DEFECTO (cablea sin guarda), todo el repo | 92 | **89** |
| ficheros con ≥1 defecto | 67 | **64** |
| en la CADENA ACOTADA, sin guarda — unidad **cadena completa** | 11 | **8** |
| … de ésos, en `.neg.mjs` (fixtura propia, no lo corre ninguna campaña) | 7 | 7 |
| … de ésos, en **PRODUCCIÓN** | **4** | **1** (falso positivo verificado) |
| lectores muertos (cablean algo que hoy no existe) | 0 | 0 |

Control **6/6** por los dos lados, `EXIT=0`, **264 fuentes parseadas sin una sola
excepción**.

**Arreglado** — guarda con diagnóstico que nombra a su productor, no resolución
nueva:

| fichero | congelada | la produce |
|---|---|---|
| `seed/captura-media.mjs` | `media-regenera.json` | `npm run qa:media-regenera` |
| `seed/extractor-f33.mjs` | `f33-rutas.json` | `npm run qa:f33-rutas` |
| `seed/extractor-p.mjs` | `solutions-seo.json` | `npm run qa:solutions-seo` |

Los tres pasaron de `PELADA` a `guarda [directa sobre F_*]` en la re-corrida —
**el efecto medido, no el diff leído** (§*el marcador prueba que el build es
nuevo, no que el cambio tenga efecto*).

**Falso positivo verificado a mano y anotado en el propio detector**, para que
nadie repita la comprobación: `coloca-media.mjs:84`. Su guarda vive a **dos
saltos** de variable (L146 `corridaVigente(LISTA_PEDIDA)` → L148
`if (!existsSync(FUENTE)) throw`) y este detector sólo sigue uno. Además L84 es
el default de un parámetro `LISTA=`, que §regla 5bis declara legítimo: *el
parámetro elige la DEFINICIÓN; la CORRIDA se resuelve por `mtime`*.

---

## §2 · LAS PREDICCIONES: 7 DE 7 EN RANGO

Contra los números **anteriores al arreglo**, que son los que el pre-registro
predecía:

| # | magnitud | predije | rango | salió | |
|---|---|---|---|---|---|
| P1 | CONSUMOS | 130 | 60–300 | **119** | ✓ |
| P2 | CABLEA | 120 | 55–290 | **118** | ✓ |
| P3 | DEFECTO | 70 | 25–200 | **92** | ✓ |
| P4 | CABLEA en la cadena | 14 | 4–40 | **21** | ✓ |
| P5 | cadena sin guarda | 3 | 0–15 | **11** (4 producción) | ✓ |
| P6 | ficheros con defecto | 45 | 15–120 | **67** | ✓ |
| P7 | lectores muertos | 2 | 0–12 | **0** | ✓ |

**La dirección declarada acertó:** predije infra-estimar el total, y P3, P4 y P6
salieron por encima. P1, P2 y P5 quedaron casi al número.

**Y la premisa fue lo que lo salvó.** La que traía —*«el patrón del repo es
resolver, cablear es la excepción»*— quedó refutada en §0.2 del pre-registro con
un comando, **antes** de escribir ningún número: `eligeCongeladaAnterior` vive en
4 ficheros de 239. Corregida, las siete predicciones entraron. Con la premisa
falsa habrían salido bajas **todas a la vez**, que es la firma de la 112.ª — un
error correlacionado que se lee como mala suerte.

> **Y el dato que lo cierra: RESUELVE = 1 de 119.** No es que resolver sea
> minoritario: es que en todo el repo hay **una sola** lectura que resuelve su
> corrida por `mtime` (`lh-cubos.mjs` L132). Se publica con su `n` porque un
> booleano de concordancia vale lo que vale su cardinal (§regla 22): el eje B
> tiene **1 instancia separadora**, y su poder discriminante está probado por el
> control negativo, no por el tamaño del dominio.

---

## §3 · LO QUE ESTE PASO 0 ENSEÑA, Y NO ES EL CENSO

### 3.1 · ⚠⚠ UN DETECTOR CON FALSOS POSITIVOS NO DA NÚMEROS MALOS: DISPARA CRITERIOS DE PARADA QUE EL DATO REAL NO DISPARA

El pre-registro fijó un corte: **P5 > 15 ⇒ la tanda se corta y la red no se
gasta.** Lo que midió cada versión del instrumento:

| versión del detector | P5 (cadena completa) | ¿dispara el corte? |
|---|---|---|
| v1 · lexer sin regex literales | **19** | **SÍ** |
| v2 · lexer con regex, sin control de comentarios | **20** | **SÍ** |
| v2 · con control de comentarios | **18** | **SÍ** |
| v3 · AST, sin filtro de metadatos | **23** | **SÍ** |
| **v3 · AST completo, control 6/6** | **11** | **NO** |

> **Las cuatro primeras habrían cortado la tanda. El dato real no la corta.** Un
> criterio de parada pre-registrado es una guarda, y una guarda alimentada por un
> instrumento sin adjudicar **no protege: bloquea** (§regla 25 con el objeto
> puesto en el propio umbral).

**Operativamente, y es lo reutilizable:** un umbral pre-registrado **no se
evalúa contra la primera corrida, sino contra la primera corrida CON EL CONTROL
EN VERDE.** Mientras el control esté rojo, el número que el instrumento publica
no es una medida del repo — es una medida del instrumento, y aplicarle un
criterio de parada es dejar que el defecto decida el alcance de la tanda.

### 3.2 · UN LEXER ESCRITO A MANO NO ES UN PARSER — Y SUS DEFECTOS SE ANULAN ENTRE SÍ

El detector necesitó **tres versiones**, y las dos primeras fallaron por lo
mismo: saltarse los comentarios con un lexer propio.

| # | defecto | cómo se vio | cardinal |
|---|---|---|---|
| 1 | no reconocía **regex literales**: `/['"]/` abre una comilla que nunca cierra | guarda de «termina con cadena abierta» | **38 de 264 fuentes (14.4 %)** |
| 2 | se desincronizaba **en medio** y se resincronizaba antes del final | **ninguna guarda podía verlo** — hizo falta un control nuevo: *«¿algún consumo cae en una línea que en el fuente es comentario?»* | 1 fichero, y era `coloca-media.mjs`, de los que el encargo nombra |

El segundo es §*un Δ de cero puede ser dos errores que se anulan* **cometido
dentro del instrumento**: la guarda miraba el ESTADO FINAL, y el estado final
era correcto.

> **Arreglarlo con otra heurística habría sido §regla 4 —*la instancia y no la
> CLASE*— por tercera vez. La clase es que un lexer a mano no es un parser**, y
> el repo ya trae uno: `acorn` (8.16.0, en `node_modules`). Con el AST, *«esto es
> un comentario»* y *«esto es el primer argumento de `w()`»* dejan de ser
> heurísticas y pasan a ser hechos del árbol. Resultado: **264 de 264 parseadas,
> 0 excepciones**.

### 3.3 · «NO ES ESCRITURA» NO BASTA PARA QUE SEA CONSUMO — Y EL SESGO SEGURO TIENE SU PRECIO

La v2 invirtió el sesgo a propósito —*«ESCRITURA es lo que hay que PROBAR;
CONSUMO es el resto»*— porque reconocer `w()` es cerrado y reconocer «lectura»
exige enumerar los helpers del repo, lista que envejece en silencio (§regla 9,
7.º caso). Fue la decisión correcta **y tenía un coste que hubo que medir**:

> **Este repo escribe METADATOS con nombres de fichero dentro** —`fuente:
> ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json"]` en
> `extractor-kb.mjs:704`— **que no lee nadie.** Son la misma clase que los
> literales en prosa, pero **sin espacios que los delaten**, así que el filtro de
> prosa no los ve.

Medido: **106 metadatos** y **58 literales en prosa**, publicados con su cardinal
y no descontados en silencio (§regla 14). Sin ese filtro, P3 salía **223 en vez
de 89** — o sea que la mayoría del «defecto» era un campo descriptivo.

**El corolario de diseño:** un consumo tiene que **LLEGAR a una lectura**
—directamente, por su variable o por un helper—, y lo que no llega se publica
como METADATO. La comprobación se hace sobre el AST, donde es exacta.

### 3.4 · DOS FALSOS POSITIVOS DEL MISMO ORIGEN: MIRAR EL PADRE INMEDIATO EN VEZ DE SUBIR POR LA EXPRESIÓN

Los dos aparecieron juntos y son §*la causa común: el NIVEL al que se mide*
cometida **dentro del detector**:

| caso | por qué falló | el arreglo |
|---|---|---|
| `sondeo.mjs:597` salía como CONSUMO y es **ESCRITURA** | `w(SABOTAJE ? \`…-neg-\${S}.json\` : "…-frontera.json", informe)` — `arguments[0]` es el **ternario**, no el literal | subir por los nodos **transparentes** (ternario, `\|\|`, `&&`) antes de comparar |
| `seed-listados.mjs:33` salía SIN GUARDA y **la tiene** | `if (!existsSync(F) \|\| SABOTAJE === "…")` — la negación es el primer operando de un `\|\|`, no la raíz del test | buscar el `!existsSync` **en todo el test**, no en su raíz |

---

## §4 · LO QUE QUEDA FICHADO Y NO SE ARREGLA AQUÍ (punto 4 del encargo)

**89 lecturas cableadas sin guarda en 64 ficheros**, todas **fuera** de la cadena
de captura. Se fichan con su número y **no se tocan en esta tanda**: el encargo
acota el veredicto a lo que la campaña de red va a usar, y ampliarlo sería
§regla 25 con el signo contrario.

**Y lo que hace falta saber para dimensionarlo, derivado y no recordado:** de
esas 89, la mayoría están en `.neg.mjs`, que cablean la congelada de su sonda o
su propia fixtura **a propósito**. La lista completa, fichero a fichero y con su
cardinal, está en `canonicos-cableados-114.log` §*DEFECTOS FUERA DE LA CADENA*.

⚠ **Lo que este censo NO contesta** (§*una medida contesta las preguntas que se
le hicieron, y su fichero no lleva escrito cuáles NO*):

1. **si un cableado hoy RESUELVE** más allá de existir el fichero — se comprobó
   la existencia en disco (P7 = 0), no que el contenido siga valiendo. Una
   congelada caducada de §regla 5bis existe y miente;
2. **la transitividad de guarda más allá de UN salto** de variable. El detector
   produce CANDIDATOS; los 4 de producción se verificaron **uno a uno contra el
   fuente**, y de ahí salió el falso positivo de `coloca-media`. Con 4 candidatos
   eso es viable; con 89 no lo sería sin ampliar el detector;
3. **los 24 dinámicos** (`medidas/${…}.json`): no se pueden comprobar contra el
   disco por construcción. Se publican con su cardinal, no se descuentan.

---

## §5 · EL ENTORNO, COMPROBADO ANTES DE GASTAR NADA

- `git status` limpio al empezar (§regla 5: congelar y commitear en la misma tanda);
- **PROCESOS** revisados, no sólo el árbol (§regla 18): 57 `node.exe`, todos MCP
  servers y un `vitest run` de **otro** proyecto. **Cero sondas de este repo en
  vuelo**, así que ningún `build` de esta tanda le cambia el `.next` a nadie;
- el PASO 0 es **offline**: no levanta navegador, no toca la DB, no construye.
