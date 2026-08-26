# PRE-REGISTRO · ¿CUÁNTOS CONSUMIDORES CABLEAN UN CANÓNICO DE `medidas/`? (114.ª tanda, PASO 0) — 2026-08-26

**Se escribe y se commitea ANTES de correr el censo.** §0 **no es predicción**:
está derivado y lleva su comando al lado (§regla 8b — *los hechos que un
pre-registro afirme se comprueban al escribirlo, contra el archivo, no de
memoria*). Lo que se predice es §3, y sólo §3.

El encargo pide además **declarar la PREMISA del número**, no sólo el número,
porque la 112.ª falló 3 de 6 predicciones **en la misma dirección** por una
premisa y no por aritmética. §2 es esa premisa — y **ya salió falsa**, cazada
antes de escribir ningún número.

---

## §0 · LO QUE YA ESTÁ DERIVADO (no se predice: se cita con su comando)

### 0.1 · La exclusión de `.tmp/`, con su cardinal

```
$ ls scripts/qa/.tmp | wc -l                          # 34 ficheros
$ find scripts/qa/.tmp -name '*.mjs' | wc -l          # 26 .mjs
$ sed -n '55,56p' .gitignore
# Artefactos temporales de sondas (bundle de esbuild de qa:cms-campos)
scripts/qa/.tmp/
```

**26 `.mjs` excluidos de 26.** Son **bundles de esbuild**, no fuentes: cada uno
lleva dentro el texto de las fuentes que empaqueta, así que un `grep` ingenuo
cuenta **la misma lectura dos veces** — una en el fuente y otra en su bundle.
No trackeados (`.gitignore` L56), luego no son código que nadie mantenga.

### 0.2 · El universo bruto, y el reparto que decide la premisa

```
$ grep -rl "medidas/" scripts/ --include="*.mjs" | grep -v "/.tmp/" | wc -l    # 239
$ grep -rl "eligeCongeladaAnterior" scripts/ --include="*.mjs" | grep -v "/.tmp/" | wc -l   #   4
$ (ficheros con readFileSync que además mencionan medidas/)                    # 183
```

| | ficheros |
|---|---|
| mencionan `medidas/` | **239** |
| de ésos, **resuelven** con `eligeCongeladaAnterior` | **4** |

**4 de 239.** Ese es el dato que rompe la premisa de §2, y está derivado **antes**
de predecir nada.

⚠ **Los 183 NO son 183 lecturas de `medidas/`.** «Tiene `readFileSync`» y
«lee de `medidas/`» son dos afirmaciones: casi toda sonda **escribe** a
`medidas/` con `w()` y **lee** de otro sitio (el corpus, `LISTA-DERIVADA.json`,
un `INDICE.json`). Contar los 183 sería §*el sobre-casado* que la 110.ª ya midió
en el detector de al lado. El 183 se cita como **cota superior**, nunca como
resultado.

### 0.3 · Las instancias del control POSITIVO existen y están NOMBRADAS — pero no son 5 ficheros, son 9 lecturas

El encargo dice «las 5 instancias ya nombradas». Derivadas contra el árbol, la
unidad no cuadra: **son 2 ficheros y 9 lecturas.**

**`scripts/qa/f33-spec.mjs`** (la sonda registrada de la 109.ª):

```
 94: const F33 = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;
470: const GEO_F33 = "f33-geo-SONDA-390-SIN-HOJAS-ENLAZADAS-…-2026-08-24.json";
471: const GEO_RUTA = join(RAIZ, "scripts/qa/medidas", GEO_F33);
472: if (!existsSync(GEO_RUTA))  ← guarda
479: const GEO = JSON.parse(readFileSync(GEO_RUTA, "utf8"));
```

**Dos lecturas cableadas y sólo UNA tiene guarda.** La de L472 la puso la 109.ª
al arreglar el lector muerto; **L94 sigue pelada** y nadie la miró, porque el
arreglo se hizo sobre la instancia que había fallado (§regla 4 — *la instancia y
no la CLASE*).

**`scripts/seed/catalogos.mjs`** (el de la 113.ª): **7** entradas cableadas
(`medidas/p-extraido.json`, `f33-extraido`, `c-extraido` ×2, `a-extraido` ×3),
con **una** guarda común en L262 (`if (!fs.existsSync(f)) throw`).

> **De donde el primer hallazgo de §0, que cambia el detector: la unidad NO es
> el FICHERO.** Un fichero puede cablear siete veces y tener una sola guarda, y
> puede resolver bien un insumo y cablear otro (§0.4). Contar ficheros absorbe
> la membresía — §*un cardinal es un contenedor*.

### 0.4 · El control NEGATIVO no es limpio, y eso es un dato: `lh-cubos` resuelve UNO y cablea OTRO

El encargo lo da por bueno (*«algo que sepas que resuelve bien … NO tiene que
salir»*). Derivado:

```
131: const _autoCmp = eligeCongeladaAnterior(new RegExp(`^lh-cmp-${ANCHO}-todas(…)?\.json$`));
132: const F_CMP  = arg("cmp",    _autoCmp.fichero ? `medidas/${_autoCmp.fichero}` : `medidas/lh-cmp-${ANCHO}-todas.json`);
134: const F_NUEVO = arg("espejo", `medidas/lh-espejo-${ANCHO}.json`);
135: const F_VIEJO = … arg("viejo", `medidas/lh-espejo-${ANCHO}-SONDA-EXTRACTO-EN-2-FORMAS-DE-9.json`);
```

- **L132 RESUELVE** por `mtime` y sólo cae al canónico si no hay ninguna. Un
  `grep` ingenuo del literal lo marcaría como cableado: **éste es el falso
  positivo que el control negativo existe para cazar**;
- **L134/L135 CABLEAN**, aunque sean defaults de `arg()`.

**Y el discriminador no es de criterio: ya está escrito** (§regla 5bis, la
vuelta de 2026-08-23) — *un parámetro elige **qué DEFINICIÓN** se usa; **qué
CORRIDA de esa definición se resuelve por `mtime`, nunca por nombre***. L132
resuelve la corrida; L134 la fija por nombre.

> **Consecuencia: el control negativo se ESTRECHA a la lectura que el encargo
> nombra** —`lh-cmp-<ancho>-todas.json` en L132— y no al fichero. Escrito como
> «`lh-cubos` no debe salir» el control **habría salido rojo** y me habría hecho
> «arreglar» un detector que estaba en lo cierto (§regla 21).

### 0.5 · El árbol está limpio y no hay ninguna sonda de este repo en vuelo (§regla 18)

```
$ git status --short                                     # (vacío)
$ Get-CimInstance Win32_Process -Filter "Name='node.exe'"
  → 57 procesos: MCP servers (n8n, context7, codegraph, firebase, postgres,
    chrome-devtools) y un `vitest run` de OTRO proyecto (antigravity-suite).
    Cero `scripts/qa/*.mjs` de kunak-web-clone.
```

Se comprueba en **PROCESOS**, no en `git status` — los dos dan lo mismo con una
sonda ajena corriendo y sin ella. El PASO 0 es offline y no construye, pero el
ESCALÓN 1 sale a la red y esto queda derivado para él.

---

## §1 · EL DETECTOR, ESCRITO ANTES DE CORRERLO

**Unidad = LA LECTURA** (por §0.3), no el fichero. El fichero se publica al lado
como agrupación, nunca como denominador.

**Tres ejes, y son ortogonales:**

| eje | pregunta | positivo | negativo |
|---|---|---|---|
| **A · ¿es LECTURA de `medidas/`?** | ¿el literal llega a `readFileSync`/`existsSync`/`JSON.parse`? | LECTURA | **ESCRITURA** (`w(...)`) → fuera del universo |
| **B · ¿el nombre es CABLEADO?** | ¿el nombre de la corrida se escribe a mano? | **CABLEA** | **RESUELVE** (`eligeCongeladaAnterior`, `readdirSync`+filtro, glob) |
| **C · ¿tiene GUARDA?** | ¿un `existsSync` con `throw`/`exit` **y diagnóstico** delante? | CON GUARDA | **SIN GUARDA** (`readFileSync` pelado) → **DEFECTO** |

- **CABLEA** = A ∧ B. Es lo que el encargo pide contar en el punto 1.
- **DEFECTO** = A ∧ B ∧ ¬C. Es lo único que se arregla (punto 3: *«cablea» no es
  «defecto»*).
- **RESUELVE-CON-FALLBACK** (§0.4, L132) cuenta como **RESUELVE**: el fallback
  sólo actúa cuando no existe ninguna corrida, que es el caso legítimo.

**Exclusiones, cada una con su cardinal (§regla 14 — *una limitación sin su
número se lee como una nota al pie*):**

| se excluye | cardinal | por qué |
|---|---|---|
| `scripts/qa/.tmp/` | **26 `.mjs`** | bundles, contienen el fuente duplicado (§0.1) |
| comentarios (`*`, `//`) | se publica | un comentario no se ejecuta. La 110.ª midió que contarlos es **NO-OP en las 16 definiciones**, pero se excluyen igual |
| `.json` fuera de `medidas/` | se publica | la 110.ª midió que sobre-casarlo lleva a 12/13 |

**Guarda del propio detector (§sondas 4):** si el eje A devuelve **0** o si
devuelve **el universo entero**, sale por error nombrado. Un cero y un pleno se
leen los dos como dato.

**Control por los dos lados (§regla 8):**

| lado | caso | qué exijo |
|---|---|---|
| **positivo** | `f33-spec.mjs` L94 y L471 · `catalogos.mjs` ×7 | **9 lecturas CABLEA**, de las que **L94 sale SIN GUARDA** |
| **negativo** | `lh-cubos.mjs` **L132** (la lectura de `lh-cmp-…-todas`) | **NO sale como CABLEA** |

Sin las dos mitades el censo no ha probado que discrimina.

---

## §2 · LA PREMISA — Y YA ESTÁ REFUTADA (esto es lo que el encargo pide declarar)

**La premisa con la que llegué a este PASO 0:**

> *«El patrón dominante del repo es escribir con `w()` y **leer resolviendo**,
> así que cablear un canónico es la EXCEPCIÓN — unas pocas instancias
> descuidadas.»*

**Es falsa, y §0.2 la refuta con un comando:** `eligeCongeladaAnterior` vive en
**4 ficheros de 239**. Resolver es lo excepcional; **cablear es el patrón por
defecto del repo.**

**Por qué importa haberla cazado aquí y no después:** con esa premisa puesta,
las seis predicciones de §3 habrían salido bajas **todas a la vez y por el mismo
motivo** — exactamente la firma de la 112.ª, donde 3 de 6 fallaron en la misma
dirección. Una premisa falsa no produce un error por predicción: produce **un
error correlacionado que se lee como mala suerte**.

**La premisa corregida, que es la que gobierna §3:**

> **`eligeCongeladaAnterior` es RECIENTE y MINORITARIO. Todo lo anterior cablea,
> y la mayoría lo hace sin guarda, porque cuando se escribió el fichero existía
> y `readFileSync` pelado funcionaba.**

**La premisa que NO he podido comprobar y por tanto declaro SIN PROBAR:** que un
literal cableado **hoy resuelva**. Un canónico liberado por un renombre de
§regla 5bis deja el literal igual de escrito y el fichero ausente, y **el fuente
no se distingue del que sí resuelve**. Eso no lo contesta este detector: lo
contesta comprobar cada literal contra el disco, y es el punto donde el censo
puede salir mucho mayor de lo que predigo.

---

## §3 · LO QUE PREDIGO (esto sí es predicción, y es lo único)

Escrito **sin haber corrido nada** del detector, con la premisa corregida de §2.

| # | magnitud | predicción | rango que aceptaría sin sorprenderme |
|---|---|---|---|
| **P1** | **LECTURAS** de `medidas/` (eje A) en todo el repo | **≈ 130** | 60 – 300 |
| **P2** | de ésas, **CABLEA** (A ∧ B) | **≈ 120** | 55 – 290 |
| **P3** | de ésas, **DEFECTO** — cablea SIN guarda (A ∧ B ∧ ¬C) | **≈ 70** | 25 – 200 |
| **P4** | **LECTURAS cableadas en la cadena ACOTADA** (`cms:captura-*`, `cms:coloca-media`, `qa:media-canales`, `seed*`) | **≈ 14** | 4 – 40 |
| **P5** | de la acotada, **SIN GUARDA** — lo único que se arregla hoy | **≈ 3** | **0 – 15** |
| **P6** | **FICHEROS distintos** con al menos un DEFECTO, en todo el repo | **≈ 45** | 15 – 120 |
| **P7** | literales cableados que **hoy NO resuelven** en disco (lector muerto) | **≈ 2** | 0 – 12 |

**El razonamiento de P3, que es del que cuelga la decisión:** si cablear es el
patrón por defecto (§2) y la guarda se añade **sólo cuando alguien se quema**
—`f33-spec` en la 109.ª, `catalogos` en la 113.ª—, entonces la guarda es tan
minoritaria como la resolución. P3 ≈ 55 % de P2 es ya una estimación **generosa
con el repo**.

**El razonamiento de P5, que es el que decide si la tanda sigue:** la cadena
acotada es justamente donde las dos últimas tandas ya se quemaron, así que es la
parte del repo **con más guardas por metro**. Espero que esté casi cubierta.

### La dirección en la que me equivocaría, que es lo que el encargo pide

> **Espero equivocarme INFRA-ESTIMANDO P1/P2/P6 y SOBRE-ESTIMANDO P5.**

Y los dos sesgos tienen causa distinta, que es lo que hace que no se cancelen:

1. **infra-estimo el total** por el sesgo histórico medido del repo: las siete
   instancias del catálogo de §regla 9 salieron **todas** mayores que lo
   afirmado (~8→31 · 8→10 · 2→8 · 1→3 · 22→24 · 6→16 · 4→8). Un octavo caso a la
   baja sería la excepción, no la norma;
2. **sobre-estimo P5** porque las dos tandas anteriores acaban de arreglar
   justo ahí, y estoy contando como pendiente trabajo que ya está hecho — que es
   §*una comprobación retroactiva se enmarca en las DOS direcciones*: la pregunta
   simétrica es *«¿la cadena acotada ya está cubierta?»*, y la respuesta
   «sí, casi entera» **cabe perfectamente en el resultado «no hay nada»**.

### Lo que NO predigo, y por qué

**No predigo cuántos DEFECTOS hay que arreglar fuera de la cadena acotada.** El
encargo ya manda ficharlos con su número y **no** arreglarlos. Prometer aquí un
número de arreglos sería fijar de antemano el alcance que el punto 4 declara
fuera.

---

## §4 · CÓMO SE LEE UN RESULTADO GRANDE

El encargo lo dice y se repite aquí porque es la salida por defecto: **si el
censo sale grande, el número ES el resultado.** Se publica, se corta, y la red
no se gasta. Un censo que se recorta para caber en la tanda que lo encargó no
mide el repo: mide la tanda.

**Y el corte tiene su criterio escrito antes:** se arregla lo que caiga en la
cadena acotada de §1 (P5) y **nada más**. Si P5 sale por encima de su rango
—más de 15— la tanda se corta ahí y la red queda para su propia tanda.
