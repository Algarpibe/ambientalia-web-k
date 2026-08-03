# PRE-REGISTRO · ¿queda algo sin construir que FUERCE un campo en algo ya decidido?

> **2026-08-03. Escrito y commiteado ANTES de clasificar nada.** Es la
> reformulación de la **precondición 1 de F2-1**, y sigue el camino que ya
> funcionó con la precondición 2: **de frase a número**.

---

## 0 · Por qué la precondición 1 está mal enunciada

`PLAN-FASE-2.md` la enuncia como **binaria** —«biblioteca cerrada»— pero **su
razón escrita no lo es**:

> *«El esquema se congela con el último arquetipo: abrir colecciones antes es
> re-migrar, y re-migrar con contenido dentro es lo caro.»*

Esa razón distingue **dos cosas que la frase junta**, y solo una es cara:

| | coste | ¿es lo que la precondición teme? |
|---|---|---|
| **AÑADIR** una colección o un block nuevos después | **barato** — no toca lo ya poblado | **NO** |
| **CAMBIAR** una colección o un block **ya poblados** | **caro** — es la dirección de §1.5b Razón 3 | **SÍ** |

**Y hay precedente de esta misma semana**, que es lo que prueba que la
distinción no es teórica: `anchoPct` en SECTOR era exactamente un **CAMBIO**
sobre una colección ya decidida, y **se cazó a tiempo por una medición**
(`clase/DECISION-ANCHO-MODULO.md`, 2026-08-03). Si hubiera aparecido con
contenido dentro, habría sido la dirección cara.

> **De donde la pregunta que de verdad gobierna F2-1, y sustituye a «¿está
> cerrada la biblioteca?»:**
>
> **¿QUEDA ALGO SIN CONSTRUIR QUE PUEDA FORZAR UN CAMPO O UNA VARIANTE DENTRO DE
> UNA COLECCIÓN O UN BLOCK YA DECIDIDOS?**

---

## 1 · EL CRITERIO — tres cubos, escritos antes de mirar

Cada forma sin construir cae en **uno** de estos tres:

| cubo | qué hace esa forma | ¿bloquea F2-1? |
|---|---|---|
| **A** | **LEE** de una colección existente **sin cambiarla** — un índice, un listado, una página que proyecta lo que ya está | **NO** |
| **B** | **AÑADE** colección o block **propios**, sin tocar los existentes | **NO** |
| **C** | **FUERZA** un campo, una variante o un cambio de forma en algo **ya decidido** | **SÍ — y entra en el esquema ANTES de congelarlo** |

### 1.1 · La pregunta cubre DOS objetos, no uno

Declararlo importa porque el segundo es el que se olvida:

1. **Los CAMPOS de las colecciones** — `sectores`, `monograficos`, `casos`,
   `faqs`, `taxonomia-sectores`, las del grupo A.
2. **Las DEFINICIONES DE BLOCK COMPARTIDAS.** `ESQUEMA-CMS.md` §2d.1 decidió
   que `articulos-kb` exporta `blurb`/`gallery` y reutiliza por **definición
   exportada** lo común con `MonoModulo` — *«lo que se duplica es el documento,
   no la definición»*. Consecuencia directa:

   > **Un consumidor posterior que necesite una VARIANTE de un block compartido
   > no está añadiendo nada: está CAMBIANDO la definición que ya comparten
   > otros. Eso es cubo C**, aunque la forma que lo pide sea nueva.

   Es la misma trampa que `anchoPct`, un nivel más arriba: allí el campo faltaba
   en una colección; aquí faltaría en una definición que varias colecciones
   comparten — y por tanto se cobra en todas a la vez.

### 1.2 · La regla del INCÓGNITA, que es la que impide el verde fácil

> **Una forma que no se pueda clasificar sin recon de verdad se cuenta como
> INCÓGNITA, y una INCÓGNITA NO es «no bloquea».**

Meterla en A o en B «porque probablemente sea eso» es exactamente el mecanismo
que `CLAUDE.md` §sondas regla 6 describe: **traducir una ausencia a un valor
benigno**, borrando la diferencia entre «esto no se pudo determinar» y «esto
está bien». Las incógnitas se cuentan aparte y se nombran.

### 1.3 · Y la resolución que se pide, que es la que hace la tanda barata

**No hace falta recon.** A/B/C es una resolución **mucho más gruesa** que una
topología: para clasificar basta saber **qué datos consume** la forma y **de
dónde salen**, no cómo se maqueta. Si para decidir el cubo hace falta medir
píxeles, la respuesta correcta es **INCÓGNITA**, no un recon improvisado.

---

## 2 · ALCANCE — declarado y cerrado

| origen | formas | cómo se clasifica |
|---|---|---|
| **`listados-hubs/DECISIONES.md`** — LISTADO-B (con sus **tres variantes de tarjeta**), L2, L3, `casos-de-exito` como índice sobre la colección `casos` | decididas, **sin construir** | **LEYENDO**, sin navegador |
| **`ESQUEMA-CMS.md` §2d.1** — `articulos-kb` (6 instancias) + los 7 hubs de KB | decidida, sin construir | **LEYENDO** |
| **cola larga** (~26) · **20 dudosas del CPT `solutions`** · **`/es/categoria/*`** (sin censar, LH-SP8) | **sin recon** | A/B/C si se puede; **INCÓGNITA si no** |

**Sospecha pre-registrada, y se escribe para que cuente como predicción y no
como relato:** las **variantes de tarjeta** de LISTADO-B son el candidato más
probable a cubo C de toda la lista. Una tarjeta pide **título, imagen, extracto,
fecha, categoría**; si las colecciones que lista no llevan ya esos campos,
**listarlas los fuerza** — y eso es cambiar una colección decidida, no añadir
una nueva. Se comprueba leyendo los campos ya decididos de cada colección
listada.

**Lo que NO entra:** nada que ya esté construido, y ninguna pregunta de píxel.
Esta tanda **no mide** y **no construye**.

---

## 3 · EL VEREDICTO — sus dos números, y qué significa cada salida

Se cierra con **dos** números, no uno:

> **(1) cuántas formas caen en C · (2) cuántas quedan como INCÓGNITA.**

| salida | consecuencia, dicha sin diplomacia |
|---|---|
| **C vacío** e incógnitas **pocas y acotadas** | **F2-1 puede congelar el esquema y arrancar.** La precondición 1 deja de gobernar |
| **C con contenido** | **eso entra en el esquema PRIMERO.** No es «se verá en F2-1»: es la dirección cara si se descubre con contenido dentro |
| **incógnitas muchas o sin acotar** | **no se puede afirmar que F2-1 arranca limpio.** Se dice, con su lista y su plan de resolución — no se rellena el hueco con optimismo |

**«Pocas y acotadas» se define aquí, antes de contarlas**, para que el número no
se ajuste al resultado:

> Una incógnita está **ACOTADA** si se sabe **qué habría que mirar** para
> resolverla y **cuánto cuesta** (una lectura, un censo corto, un recon). Y el
> conjunto es **POCO** si **ninguna de ellas puede, por sí sola, cambiar una
> colección ya poblada** — o sea si el peor caso de todas ellas juntas sigue
> siendo cubo B.

Si una sola incógnita **podría** ser cubo C, el conjunto **no** es «pocas y
acotadas», por muy corto que sea.

---

## 4 · ESCALÓN DECLARADO

Si aparece una frontera de modelado que (a) ninguna lectura de esta tanda pueda
arbitrar, (b) sea cara de deshacer, y (c) no tenga precedente aplicable en
`ESQUEMA-CMS.md` ni en `CLAUDE.md`: **se para**, se escribe la frontera con la
evidencia de cada lado, y se deja para una tanda de decisión.

---

*Pre-registrado el 2026-08-03. La clasificación (PASOS 2 y 3) y el veredicto
(PASO 4) se escriben DESPUÉS de commitear esto.*
