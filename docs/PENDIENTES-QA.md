# Pendientes de QA — clon kunakair.com/es

## 🟠 LH-CONTENEDOR · el `%` de `L1` NO se resuelve contra el número que parece, y la tabla de `mbPorDefecto` cubre **6 de las 9 formas** (2026-08-11)

**PASO 4 de la 54.ª tanda.** Las dos direcciones se escribieron **antes de
mirar** y —como la vez anterior— **la respuesta salió en la contraria**:

| dirección | veredicto |
|---|---|
| **(a) ¿alguna congelada resolvió un % contra el contenedor equivocado?** | **NO. Nada que corregir hacia atrás.** Derivado de `kb-spec-1440.json`: **las 39 filas de `articulos-kb` miden 911.75**, sin excepción, así que el `mbPorDefecto(ANCHO_FILA_KB, …)` cableado en `scripts/seed/extractor-kb.mjs:176` **coincide con lo medido** |
| **(b) ¿la regla nueva vale para las 9 formas?** | **NO: vale para 6.** Y de camino aparece algo que la pregunta no contemplaba — una **colisión de rol** |

Sonda: **`qa:lh-contenedores`** (deriva de `lh-spec-{1440,390}` congeladas y del
**fuente** de `defaults.ts`; no abre navegador), congelada en
`medidas/lh-contenedores.json`, negativo **3/3**.

| forma | fila @1440 | ¿la cubre `mbPorDefecto`? |
|---|---|---|
| L1-blog · L1-etiqueta · L1-resources (padre e hijo) · L4 · L5 | **1238.39** | ✅ `ANCHO_FILA_CASCARON` |
| **L3-sci** | **1152** | ❌ **ancho sin medir — la función TIRA** |
| **L2-glosario · L2-faqs** | **sin filas Divi** | ⊘ **el mecanismo no aplica** |

### §LH-CONTENEDOR-ROL · **`911.75` es FILA en un arquetipo y COLUMNA en otro, y la función no puede distinguirlo**

Es el hallazgo caro, y no lo enseña ninguna medida a solas: lo enseña el cruce.

| dónde | qué es `911.75` | la fila real |
|---|---|---|
| `articulos-kb` | **el ancho de la FILA** (39/39) | 911.75 |
| **L1-blog · L1-etiqueta** | **el ancho de una COLUMNA `3_4`** | **1238.39** |

`mbPorDefecto(anchoFila, tipoColumna)` recibe **un número suelto**, y la
constante que lo nombra se llama `ANCHO_FILA_KB`. Al construir `L1`, la columna
de contenido mide **exactamente 911.75** — el mismo número — y es el que se tiene
a mano.

> ⛔ **Pasárselo NO da error: devuelve el default del OTRO arquetipo.** Para una
> columna estrecha daría **25.0625** donde a `L1` le tocan **34.0469**, que es
> justo el error que el ⚠⚠ del §Test A describe, cometido con la función escrita
> para evitarlo.

**Y es una cara NUEVA de §DOS VARIABLES CONFUNDIDAS.** Allí dos variables tomaban
el mismo valor dentro de un dominio y la regla nombraba una al azar. Aquí es al
revés: **un mismo valor tiene dos ROLES en dominios distintos**, y la firma de la
función —un número— no lleva cuál. La regla del §Test A —*«un default de ritmo se
escribe CON SU CONTENEDOR o no se escribe»*— hay que aplicarla también **al
argumento**, no sólo a la prosa.

**Qué lo cerraría** (no se decide aquí: es modelado): que `mbPorDefecto` reciba
**el rol además del número** —arquetipo, o el par (fila, columna)— para que el
911.75 de `L1` no pueda hacerse pasar por el de KB. Mientras tanto, la sonda lo
vigila y **sale roja a propósito**.

### §LH-CONTENEDOR-L3 · `L3-sci` estrena un tercer ancho de fila: **1152**

No es `1238.39` ni `911.75`. `mbPorDefecto(1152, …)` **tira**, que es el
comportamiento correcto (§sondas 6: una ausencia se rechaza, no se sustituye) —
pero significa que **`L3` no tiene default de ritmo derivable** y que construirla
exige medirlo primero. Anotado, no cableado.

> **El disparador 3 del ESCALÓN NO salta**, y conviene decirlo explícito: pedía
> *«una medida congelada resuelta contra el contenedor equivocado»*, y **no la
> hay** — (a) sale limpia. Lo que hay es **cobertura incompleta y un riesgo de
> construcción**, que se fichan y no paran nada.

---

## ⛔⛔ ESCALÓN F3-2 (3.º) · **`D4-H1` sale de CERRADA: su evidencia no podía sostener lo que afirma** (2026-08-11)

**Es un escalón de los que este proyecto se toma en serio porque RETIRA una
decisión cerrada**, y no por un dato nuevo: por releer con el discriminador
correcto la evidencia que ya estaba congelada.

| | |
|---|---|
| **lo que `D4` afirma** | *«los 35 `h1` = nombre del término/índice»* ⇒ el `h1` es **dato derivado del término, no propiedad de la página** |
| **lo que dice su propia evidencia** | `lh-censo.json`: **33 de 35**. `/es/glosario/` y `/es/preguntas-frecuentes/` traen `h1: ""` |
| **y por qué eso no es sólo una cifra mal** | `lh-censo` guardaba **el TEXTO**, así que *«lo encontré vacío»* y *«no lo encontré»* salen **con el mismo valor**. El enunciado no está mal medido: está **SIN MEDIR**, con una medida real de coartada |

**Resuelto contra el marcado servido** (`qa:lh-h1`, 149 documentos,
`medidas/lh-h1.json`, negativo **4/4**): esas dos páginas tienen **cero `<h1>` en
el documento entero**. Era **ausencia**.

### Las dos direcciones, contestadas con el mismo barrido

Escritas **antes de mirar**, como pide §UNA COMPROBACIÓN RETROACTIVA SE ENMARCA
EN LAS DOS DIRECCIONES — y como la última vez, **la segunda no salió donde se
esperaba**:

| dirección | veredicto |
|---|---|
| **(a) ¿algo cerrado se apoya en el `""`?** | **SÍ — `D4`**, y es lo único: el barrido de las **753** congeladas encuentra `h1` vacío/nulo sólo en `lh-censo*` y `lh-regimen*` (las mismas 2 rutas) y en ficheros `-neg-muerto`, que son artefactos de test |
| **(b) ¿la lectura nueva de `lh-spec` está sobre-generalizada?** | **NO.** `lh-spec.mjs:308-310` discrimina **por elemento**, no por texto, así que un `<h1></h1>` vacío daría `hayH1: true` con `texto: ""`. No colapsa |

> ⚠ **Pero (b) trae su propio límite, y es la razón de que se declare en vez de
> cerrarse: hay 0 `<h1>` vacíos en los 149.** O sea que la rama del `<h1>` vacío
> de `lh-spec` es un **CAMINO SIN ESTRENAR** — correcto en el 100 % de lo medido
> y **no ejercitado ni una vez**. Se declara con su alcance (§F2-5, la familia de
> `qa:nunca-vistos`); no se da por soportada.

### El censo, y la partición es lo que convierte esto en una pregunta de modelo

| familia | n | con `<h1>` y texto | `<h1>` vacío | SIN `<h1>` |
|---|---|---|---|---|
| L1 (blog · etiqueta · resources) | 117 | **117** | 0 | 0 |
| L3-sci · L4-hub · L5-casos · otra | 20 | **20** | 0 | 0 |
| **L2-glosario** | 8 | 0 | 0 | **8** |
| **L2-faqs** | 4 | 0 | 0 | **4** |

Varianza **0 dentro** de cada familia y distinta **entre** familias: en régimen
plantillado, **plantilla**. Y ahí está lo que `D4` mezclaba en una sola fila:

> **¿de dónde sale el TEXTO del `h1`?** → del término (137/137 de los que lo
> tienen). **¿HAY `h1`?** → lo decide **la plantilla de la familia**.
>
> Si el `h1` fuera *«dato derivado del término, no propiedad de la página»*, `L2`
> tendría uno: **sus términos tienen nombre y la página no tiene `h1`.** Luego la
> **presencia** es de la plantilla y el **contenido** del término — un enunciado
> distinto del que `D4` tiene escrito, no una corrección de su cifra.

### Por qué para aquí

**Reescribir esa fila es MODELAR**, y modelar con una decisión retirada delante
es exactamente lo que una tanda de medición no debe hacer. La evidencia queda
congelada y la decisión va a una **tanda de decisión**.

**Y arrastra una consecuencia de método con denominador:** el protocolo lee el
cuerpo **restando la `y` del `h1`**, y **12 documentos no tienen ancla**.
`lh-spec` propone «primera tarjeta» — **candidato, no ancla**: para serlo hay que
probarlo en **9/9 formas** y verificar que es **el mismo elemento en los dos
lados** (lo que `c-cabecera` aprendió a exigir). **La mitad de «los dos lados» no
se puede contestar hoy: el clon no emite estas rutas.**

**Evidencia congelada:** `medidas/lh-h1.json` + sus 4 negativos ·
`medidas/lh-censo.json` (la que contenía las excepciones) ·
`docs/research/listados-hubs/DECISIONES.md` §*la fila del `h1` sale de cerrada*.

> ⚠ **Nota de instrumento que se pagó en esta misma corrida (§sondas 8a):** el
> sabotaje `colapsa` —que reproduce el defecto de `lh-censo` leyendo el texto—
> daba **exactamente el mismo resultado que la corrida limpia** (137 · 0 · 12), y
> eso **no prueba que el defecto no importe: prueba que la población no lo
> ejercita**. Hizo falta **fabricar el caso** (`vacio-inyectado`, un `<h1></h1>`
> en `/glosario`) para que las dos lecturas se separaran:
>
> | corrida | discriminador | vacío | ausente |
> |---|---|---|---|
> | limpia | elemento | 0 | 12 |
> | `colapsa` | texto | 0 | 12 ← **no discrimina: no hay caso** |
> | `vacio-inyectado` | elemento | **1** | 11 |
> | `colapsa-con-vacio` | texto | **0** | **12** ← el mismo documento, mal leído |
>
> El par de abajo es la demostración: **mismo documento, mismo `<h1></h1>`, y el
> colapso lo cuenta como ausente.** Sin fabricar el caso, el negativo habría
> pasado por bueno sin haber probado nada.

---

## ✅ (cerrado por acotación de `D1`) ESCALÓN F3-2 (2.º) · **80 de las 117 páginas de `L1` sirven una BARRA LATERAL, y `D1` dice que entre variantes sólo cambia la tarjeta** (2026-08-11)

> ✅ **CERRADO EL MISMO 2026-08-11, y sin retirar ninguna decisión.** El escalón
> preguntaba dos cosas y las dos tienen respuesta medida sobre la población
> entera (`medidas/lh-barra.json`, 149 documentos, **negativo 5/5**):
>
> | pregunta del escalón | respuesta |
> |---|---|
> | ¿`D1` es falsa? | **No: queda ACOTADA.** `L1` sigue siendo uno con tres variantes; lo que se ensancha es **de qué** son las variantes — tarjeta **y** retícula de cuerpo con su barra. Misma lectura que la tarjeta, las tres pieles de paginación y la regla de zoom: varianza 0 dentro, distinta entre |
> | ¿el widget «Categorías» consume la taxonomía (condición de reapertura de `D3`)? | **NO.** Es `widget_text` en 80/80 —no el nativo `widget_categories`—, con **1 solo contenido** en los 80, y **no cubre 5 de los 7** términos que el propio contenido ejerce. `D3` queda **confirmada**: la condición se comprobó y no se cumple |
>
> **Y el límite que la medida SÍ impone, que es la parte que no se puede
> decidir:** barra y retícula son **COLINEALES en 149/149** —ningún documento
> tiene una sin la otra—, así que *«la barra es propiedad de la CAPA»* y *«…de la
> VARIANTE»* son **INDISTINGUIBLES** con esta población. Se declara **NO
> SEPARABLE** con su denominador; si al modelar hay que elegir, se elige el eje
> con **mecanismo servido** (la plantilla de cuerpo del theme builder decide las
> dos a la vez) y **se dice que la razón es ésa, no una medida**. Acta completa:
> `docs/research/listados-hubs/DECISIONES.md` §*D1 queda ACOTADA*.
>
> ⚠ **Y la firma de la barra son 4 widgets, no 10 — todo lo que este documento
> diga «10» abajo está corregido por esto.** `lh-barra` tomaba la firma sobre una
> **ventana fija de 14 000 caracteres** y la barra mide **1481**: los otros 6 eran
> del **pie** (clase `fwidget`). §sondas 4, tercera cara. **No mueve la partición**
> (los tres patrones siguen a 80·80·80), sólo el recuento. Congelada vieja
> conservada como `medidas/lh-barra-SONDA-VENTANA-14000-COMIA-EL-PIE.json`;
> arreglo por balance de `<div>` **con guarda** (`fwidget` = 0 dentro / 480 fuera)
> y dos negativos nuevos: `categorias-variable` (el comparador sabe fallar) y
> `corte-fijo` (reproduce el defecto con su número — el ANTES/DESPUÉS que el diff
> no da).
>
> **Lo que queda vivo del escalón** es el trabajo, no la duda: la barra **entra en
> la entrega de F3-2** como contenido de plantilla de la variante, y los dos
> `href` absolutos a `/es/categoria/*` entran en **`P-LH-C4`**.

**Salió en el PASO 2 —la fase de specs—, y otra vez antes de escribir una línea
de plantilla.** Al medir la retícula del cuerpo por primera vez (`qa:lh-spec`,
el píxel que `LH-SP2` decía que no estaba medido):

| forma | fila del listado | ancho de la columna de contenido | tarjeta |
|---|---|---|---|
| **L1-blog · L1-etiqueta** | **`3_4 + 1_4`** | **911.75** + barra de **258.5** | 277.2 |
| **L1-resources** (padre e hijo) | **`4_4`** | **1238.39**, sin barra | 386.08 |

Y no son dos instancias: derivado sobre la **población entera** de la captura de
F3-0 (`qa:lh-barra`, negativo 3/3, `medidas/lh-barra.json`):

| familia | documentos | con barra lateral en el cuerpo | con columna `3_4` |
|---|---|---|---|
| **L1-blog** | 17 | **17** | 17 |
| **L1-etiqueta** | 63 | **63** | 63 |
| **L1-resources** | **37** | **0** | 0 |
| L2 · L3 · L4 · L5 | 24 | 0 | 0 |

**Reparto mixto dentro de una familia: CERO.** O sea que en régimen plantillado
la lectura es la misma que la de la configuración de tarjeta —varianza 0 dentro,
distinta entre— y por tanto **distingue variantes de plantilla**, no campos. El
recuento de arquetipos **no cambia**.

### Por qué es ESCALÓN y no un detalle de spec

`DECISIONES.md` §D1 no se queda en «L1 es uno con tres variantes»; **dice de qué
son las variantes**:

> *«lo que difiere entre familias es la **configuración del módulo de
> tarjetas**, uniforme al 100 % dentro de cada familia»*

Eso, medido, es **falso por defecto**. Lo que difiere además es:

1. **la RETÍCULA del cuerpo** — `3_4+1_4` contra `4_4`, y con ella el nº de
   filas de la 2.ª sección (2 contra 3);
2. **una superficie de contenido entera que ningún documento del repo modela**:
   la barra lateral trae **10 widgets** con **una sola firma en los 80
   documentos** — `search` · 6 × `text` · 2 × `custom_html`, con los títulos
   **«Buscar» · «Categorías» · «¡Suscríbete a nuestra newsletter!»**.

**`D3` enumera lo que los listados le EXIGEN al grupo A** —título, slug, fecha,
imagen, extracto, tres taxonomías, autor— y **la barra lateral no está**. Un
buscador, una lista de categorías y un formulario de newsletter no son «la
configuración de la tarjeta».

### Y la razón de que nadie lo viera es la de siempre: EL NIVEL AL QUE SE MIDIÓ

`lh-censo` midió **el primer nivel de secciones** y dio *«6 secciones y 2
`_tb_body` en 23/23, sin una excepción»*. **Eso sigue siendo verdad.** La barra
lateral **no vive en ese nivel**: vive en una **fila** dentro de la 2.ª sección.
Es §La causa común de `CLAUDE.md` con un contenedor nuevo — **el recuento de
secciones**, que tenía holgura de sobra para esconder una columna entera y no
movió ni un dígito.

⚠ **Y hay un instrumento que además lo tapó activamente:** la firma de
`lh-serie` marca `·sb` (sidebar) en **las 149**, porque busca
`et_pb_widget_area` **en el documento entero** — y el pie también tiene widgets.
Es el **pleno** de §sondas 4 (*un patrón que casa en TODAS no mide nada*), y
convertía justo esta diferencia en una constante. `lh-barra` lo evita exigiendo
el sufijo `_tb_body` y **declarando máximo además de mínimo**: con
`SABOTAJE=patron-ubicuo` sale por UBICUO, no por dato.

### Lo que decide, y por eso F3-2 no construye hoy

| pregunta | por qué no se puede improvisar |
|---|---|
| **¿la barra lateral entra en la entrega de F3-2?** | son 80 de 117 páginas de `L1`. Dejarla fuera no es «un fleco»: es **un cuarto del ancho** y toda la columna derecha |
| **¿qué es cada widget en el modelo?** | «Categorías» **consume la taxonomía `category`** — que es exactamente la condición de reapertura que `D3` dejó escrita («no se añade la relación hasta que un listado la consuma»). El buscador y la newsletter son **integraciones**, no contenido |
| **¿es plantilla o contenido?** | lo medido dice **plantilla** (1 firma en 80). Pero está medido sobre el **marcado**, no sobre lo que el editor puede tocar en WordPress |
| **¿contra qué contenedor resuelven los defaults de ritmo?** | **911.75 en blog/etiqueta y 1238.39 en resources** — literalmente los dos números del ⚠⚠ de `CLAUDE.md` (§Test A). Construir L1 con un solo contenedor mete el error que ese aviso describe, en 80 páginas |

**Evidencia congelada:** `medidas/lh-barra.json` (+ sus 3 negativos) ·
`medidas/lh-spec-1440.json` · `medidas/lh-spec-390.json`.

### Un segundo hallazgo de la misma corrida, más pequeño y también sin ficha

**`/es/glosario/` y `/es/preguntas-frecuentes/` NO tienen `<h1>`.** Cero, medido
en vivo y derivado del HTML capturado. `D4` afirma *«los 35 `h1` = nombre del
término/índice»*, y `lh-censo` guardó `h1: ""` para las dos — que es **«lo
encontré vacío» y «no lo encontré» colapsados en el mismo valor**, la regla del
cero otra vez.

**Consecuencia operativa inmediata, y es de método:** el protocolo de este
proyecto lee el cuerpo **restando la `y` del `h1`**. En `L2` **no hay ancla**, así
que su base tiene que ser otra cosa —`lh-spec` congela ya la de la primera
tarjeta— y eso hay que decidirlo antes de comparar nada de `L2`.

---

## 🟡 F3-2-SEO-PAGINAS-VACIAS · las 55 páginas vacías, ¿son deuda de SEO del SITIO? — pregunta de PRODUCTO, abierta a propósito (2026-08-11)

**Ficha abierta por `D2.5`, y con el encuadre puesto para que ni se pierda ni se
cuele en la migración.**

`kunakair.com/es` sirve **55 URLs** que responden **200**, se declaran canónicas
de sí mismas, llevan `<title>` «Página 9 de 17» y **no listan ni una entrada**
(`/es/blog/page/9/` … `/page/17/`, y lo mismo en otras 16 series). Son
indexables y no tienen contenido.

| | |
|---|---|
| **es una pregunta legítima** | 55 URLs indexables sin contenido es, a primera vista, deuda de SEO |
| **y NO es una pregunta de la migración** | esas 55 URLs existen **hoy**, en el original, con el clon sin desplegar. La deuda —si lo es— **ya está contraída** |
| **por eso `D2.5` decide REPLICAR** | es la única salida que no cambia el sitio. `noindex` o 404 son **mejoras de producto**, y meterlas dentro de una migración deja sin respuesta la única pregunta que la migración contesta: *¿el clon reproduce el original?* |

### Qué hay que decidir, y con qué información

1. **¿Es deuda de verdad?** No está medido: haría falta mirar si Google las
   tiene indexadas (Search Console del original) y si alguna recibe tráfico o
   enlaces. Hoy **no lo sabemos** — que 55 URLs sean indexables no prueba que
   estén indexadas.
2. **Si lo es, ¿cuál es el arreglo?** `noindex` (siguen respondiendo, dejan de
   competir) o **404** (dejan de existir, y con ellas cualquier enlace entrante).
   Son distintas y la segunda es irreversible de facto.
3. **¿Y por qué existen?** Mecanismo sin identificar: WordPress sirve 200 para
   `/page/N/` mientras `N ≤ ` el total que Yoast anuncia, y ese total **no es**
   el número de páginas con contenido (§`D2.5`, la tabla de las dos magnitudes).
   Diagnosticarlo es parte de la respuesta, no un extra.

### Cómo se cierra

**Se lleva al propietario del SITIO, como cambio de producto sobre
kunakair.com**, no a una tanda de clonado. Si se decide arreglarlo:

- se arregla **primero en el original** y después el clon lo replica —con lo
  que `D2.5` sigue valiendo sin tocarse y el número de rutas baja solo—; o
- se decide explícitamente que el clon **diverge**, y entonces deja de ser una
  réplica en ese punto y se anota como desviación deliberada con su razón,
  igual que `D2.4`.

**Lo que no se hace es decidirlo dentro de una tanda de construcción**, que es
exactamente lo que `D2.5` evitó.

---

## ✅ (cerrado por `D2.5`) ESCALÓN F3-2 · **55 de las «107 rutas /page/N/» existen y no listan NADA**, y eso es una forma que `DECISIONES.md` no contempla (2026-08-11)

> ✅ **CERRADO EL MISMO 2026-08-11** con **`D2.5` · REPLICAR TAL CUAL**, firmada
> por el propietario (`docs/research/listados-hubs/DECISIONES.md` §D2.5). La
> ficha se conserva entera porque es la evidencia que la decisión cita.
>
> **Tres cosas que el cierre añadió y esta ficha no tenía:**
>
> 1. **`D2.4` y `D2.5` no se contradicen — las separa el CANONICAL, 7/7 y
>    55/55.** El original declara él mismo qué `/page/N/` es ruta: canonical a la
>    página 1 = *«no soy ruta»* (→ 404 en el clon); canonical a sí misma = *«sí
>    lo soy»* (→ se emite). Una regla, dos respuestas.
> 2. **Las tres fuentes NO discrepan: son dos magnitudes.** El `<title>` de
>    Yoast mide la frontera del **servidor** (**21/21** series) y la ventana de
>    `paginate_links` mide la del **contenido** (**14/14**). Lo que había no era
>    una contradicción sino un criterio de medición eligiendo una en silencio.
> 3. **El número deja de ser un rango:** **142** rutas bajo `D2.5` (87 bajo la
>    otra lectura), derivado en `qa:lh-paginas`, que ahora imprime las dos.



**Salió en el PASO 2 —antes de construir una sola línea—** al preguntar si una
serie `/page/N/` es una unidad. No lo es, y de paso apareció esto:

| | |
|---|---|
| qué hace el original | `/es/blog/page/9/` … `/page/17/` responden **200**, con `<link rel=canonical>` **a sí mismas**, `<title>` de Yoast **«Página 9 de 17»**… y **cero `<article>`** |
| dónde está la frontera | `page/8` = 5 tarjetas · `page/9..17` = 0 · `page/18` = **404** |
| cuántas | **55 páginas vacías** frente a **84 con contenido**, en las 17 series a las que la pregunta aplica |
| las tres fuentes del total **no coinciden** | la **ventana** de `paginate_links` dice 8 · el **`<title>`** dice 17 · el **contenido** se acaba en 8 |
| verificado en vivo | **51 puntos de frontera · 0 discrepancias** con la captura de F3-0 |

Congeladas: `medidas/lh-serie.json` · `medidas/lh-serie-vivo.json` (con su control).

### Por qué es ESCALÓN y no una ficha más

`DECISIONES.md` §D2 contempla **dos** situaciones y ésta es una **tercera**:

| | qué dice el original | qué decidió D2 |
|---|---|---|
| **D2.3** · listado que pagina | N páginas con contenido | derivar `/page/N/` en build: `⌈entradas ÷ porPágina⌉` |
| **D2.4** · los 7 que responden 200 a **cualquier** N | canonical → **la página 1** | **no se replican**: 404 en el clon, desviación anotada |
| **← ESTO** | **200 · canonical a SÍ MISMA · título «de 17» · cero entradas** | **nada** |

Y las dos reglas existentes dan **respuestas distintas** aquí, que es lo que
impide resolverlo de paso:

- por **D2.3**, la derivación por contenido emite **8** páginas para el blog ⇒
  `/page/9..17` serían **404** en el clon y **200** en el original;
- por **D2.4**, el criterio para no replicar era *«el canonical dice que no son
  rutas»* — y aquí **el canonical dice que sí lo son**.

> **El número de la entrega está en juego, no un detalle:** «107 rutas
> `/page/N/`» sale de `lh-paginas`, cuyo criterio es *«200 hasta el primer
> 404»*, y ese criterio **cuenta las vacías**. Medido sobre la población:
> **54 con contenido · 55 vacías**. O sea que F3-2 emite ~54 o ~109 según cómo
> se decida, y la diferencia es **la mitad de la entrega**.

**No se decide aquí, y por eso está escrito así.** La consigna de la tanda lo
dejó dicho —*si al construir aparece una forma que `DECISIONES.md` no contempla,
para con la evidencia congelada*—, y además la decisión no es obvia: replicar el
200-vacío es fiel y emite 55 rutas que no sirven nada; no replicarlo es
divergir del original en 55 URLs que hoy responden. **Las dos son legítimas y
las dos hay que escribirlas con su razón**, como se hizo con `D2.4`.

⚠ **Y hay una consecuencia que sí es inmediata: `LH-SP9` estaba mal planteada.**
Decía *«14·1·8 entradas con 2·1·2 páginas — no sale un divisor limpio»*. Con las
vacías fuera, el divisor se calcula contra **las páginas con contenido**, no
contra el total del 404. Es la misma confusión, un nivel más abajo.

---

## ✅ F3-2-UNIDAD-SERIE · una serie `/page/N/` **no es una unidad**, y ahora está medido en vez de supuesto (2026-08-11)

**PASO 2 de F3-2, y la pregunta se hizo antes de necesitar la respuesta.** Al
declarar cobertura de las ~142 rutas nuevas, la tentación es *«con una página
por serie basta: es la misma plantilla»* — que es **literalmente la frase que
dejó MONOGRÁFICO a cero** (§LH-C6-FAMILIA-NO-ES-FAMILIA): un contenedor que
mapea a varias unidades reportadas, con «la primera de cada uno» de filtro
silencioso.

**No se muestreó: se midió la población entera**, y gratis — la captura de F3-0
ya trae **las 149 páginas** (cada índice y **cada** `/page/N/`). Sonda nueva
`npm run qa:lh-serie` (negativo **3/3**):

| | |
|---|---|
| series con más de una página | **28** |
| …**heterogéneas** (≥2 clases estructurales) | **19** |
| …homogéneas | 9 — y son las **triviales**: las que sirven la misma página a cualquier `N` (`D2.4`) |
| clases estructurales distintas en la población | **35** |
| veredicto | **LA SERIE NO ES UNA UNIDAD** |

**Las tres hipótesis del pre-registro salieron, y por eso el resultado se puede
leer como una prueba y no como una descripción:** la 1.ª no tiene «anterior» y
la última no tiene «siguiente» (H1); la última trae **menos tarjetas** (H2, p. ej.
`9 → 7 → 0`); las intermedias sólo se diferencian en qué números imprime la
ventana (H3).

> **Consecuencia operativa para F3-2:** la unidad de cobertura de las rutas de
> paginación **es la ruta**, no la serie. Si alguna vez se quiere muestrear, el
> muestreo legítimo es *«una de cada CLASE medida»* con este censo detrás —
> nunca *«la primera de cada serie»*, que sólo ve la clase «primera».

### ⚠ Y la sonda nació con el mismo defecto del que protege — lo cazó su CONTROL EN VIVO, no su código

La primera corrida contó **65 documentos con 0 tarjetas** y los llamó *«páginas
que existen y no listan nada»*. **Mezclaba dos ceros distintos:**

| cero | qué es |
|---|---|
| `/es/blog/page/9/` → 0 `<article>`, **y su página 1 sirve 9** | la página existe y no lista nada — **hallazgo** |
| `/es/productos/` → 0 `<article>`, **y su página 1 tampoco** | esa forma **no usa `<article>`** (hub de builder) — cero del selector |

Son 5 series enteras (`productos` · `sectores` · `recursos/{documentos-cientificos,kunakpedia,preguntas-frecuentes}`)
contadas como «vacías» sin serlo. Corregido mirando la página 1 de cada serie;
el número bueno es **55**, no 65.

**Y lo que lo destapó fue el control, no releer el código:** al pedir en vivo la
frontera de cada serie, cinco dieron `1:301` —porque `/page/1/` **no es una URL
de este sitio**, WordPress la redirige— y cuatro dieron `-Infinity:404`, que es
lo que sale al hacer `Math.max()` de un conjunto vacío. **Dos defectos del
instrumento, los dos con forma de dato**, y ninguno habría dado error.

---

## ✅✅ LH-C6-EJE-COMPLETO · el eje `comportamiento` llega a **37/37**, y con eso deja de haber una partición que interpretar (2026-08-11)

`0/31` el 08-10 por la mañana · `13/37` esa tarde · `18/37` al cerrar
MONOGRÁFICO · **`37/37` hoy**. Es **el único eje de la matriz con cobertura
completa** — por delante de `docH`, `base` y `árbol`, que van por 31/37.

| | |
|---|---|
| corrida | `TODAS=1 UNIVERSO=emitidas` · **518 / 518 interacciones con DISPARO CONFIRMADO** · `NO SE DISPARÓ` **0** |
| veredictos | `EFECTO` 387 · `SIN EFECTO` 101 · `NO APLICA` 30 (con su número, uno a uno) |
| alcance | **las 37 rutas emitidas × 2 lados** = 74 páginas, a **1440** |
| selectores | **5 vivos, 0 muertos** en las 74 |
| congelada | `medidas/comportamiento-1440-emitidas-todas.json` · matriz en `medidas/cobertura-2026-08-11-2.json` |

> **Lo que este `37/37` SÍ permite decir, y el `18/37` no:** se acabó tener que
> declarar *«una ruta por familia»* — que es la frase que escondió un arquetipo
> entero (§LH-C6-FAMILIA-NO-ES-FAMILIA). Con las 37 medidas, **las dos
> particiones dan lo mismo porque no queda nada fuera**, y el alcance se declara
> sin adjetivos: *las rutas que el build emite, a 1440*.

⚠ **Lo que sigue sin poder decir, y no es letra pequeña:**

- **es 1440 y sólo 1440.** El catálogo excluye `hover` a 390 a propósito (bajo
  emulación táctil no es la misma interacción), así que **390 no es «lo mismo
  más estrecho»**: es una pasada que no se ha hecho;
- **el eje sigue SIN SUELO DE RUIDO.** Un `SIN EFECTO` aislado es *SIN PROBAR*,
  no *limpio*. Lo único medido de su forma es §LH-C6-TIEMPO-BIMODAL, y son 8
  observaciones de **una** página;
- **`0 selectores muertos` de ESTA corrida vive en la consola, no en la
  congelada.** El arreglo que mete el censo en el fichero (§sondas 2, *una
  conclusión citada necesita su fichero*) se escribió **con la corrida ya en
  vuelo**, así que entra a partir de la siguiente. Se dice en vez de callarlo:
  el respaldo de hoy es el código de salida —la sonda sale con 2 si hay un
  muerto— y eso no es un fichero.

---

## ✅ LH-C6-TODAS-SIN-MARCA · la TERCERA perilla que cambia el alcance de una congelada sin decirlo en el nombre (2026-08-11)

Ayer se cerró para `SOLO` lo que ya existía para `AFOR`
(§LH-C6-SOLO-SIN-ETIQUETA). Al ir a correr las 37 apareció la tercera, **y es
la misma clase con el signo cambiado**:

| perilla | qué cambia | cómo se declaraba |
|---|---|---|
| `AFOR` | **qué zona** de la afordancia | exige `ETIQUETA` |
| `SOLO` | **cuántas páginas** — un SUBconjunto | exige `ETIQUETA` (desde ayer) |
| **`TODAS`** | **cuántas páginas — el SUPERconjunto** | **nada** |

Sin marca, *«una por `srcRoute`» (13 rutas)* y *«las 37»* escriben en el **mismo
nombre** y con la **misma forma**: sólo `meta.alcance` las separa, que es
literalmente el defecto que la ficha de ayer describe.

**Arreglado derivando en vez de pidiendo.** El nombre lleva `-todas` porque lo
sabe la perilla — no hay nada que recordar, y un valor derivado no envejece
contra el repo (§sondas 9). `meta.alcance.todasLasEmitidas` va además dentro.

⚠ **Prior art que NO se renombra:** `comportamiento-1440-emitidas-monografico.json`
se congeló con `TODAS=1 SOLO=… ETIQUETA=…` **antes** de esta regla y está
declarada por su nombre en `cobertura.mjs`; renombrarla rompería la cita, y su
`ETIQUETA` ya dice lo que es.

> **La moraleja, que es la de siempre una vuelta más abajo:** cerrar una clase
> con una guarda por perilla deja la clase abierta para **la perilla que aún no
> existe**. Lo que la cierra de verdad es que el nombre se **componga** de lo
> que la corrida hizo, no de lo que su autor se acordó de escribir.

---

## ✅ P-LH-C6 · el eje COMPORTAMIENTO deja de estar vacío — 0/31 → 13/37 (2026-08-10) → 18/37 → **37/37** (2026-08-11, §LH-C6-EJE-COMPLETO)

**La precondición de LISTADO-B está cumplida** y, de paso, la celda peor cubierta
del proyecto tiene su primera medida. Sonda nueva: **`npm run qa:comportamiento`**
(negativo `qa:comportamiento-neg`), congelada en `medidas/comportamiento-1440.json`.

| | |
|---|---|
| corrida | **254 / 254 interacciones con DISPARO CONFIRMADO** · 0 selectores muertos |
| veredictos | `EFECTO` 171 · `SIN EFECTO` 65 · `NO APLICA` 18 · **`NO SE DISPARÓ` 0** |
| alcance | **9 formas de listado** (lado original; el del clon **404 verificado**) + **13 rutas emitidas × 2 lados** (una por familia del manifiesto) · **1440** |
| negativo | **5/5**, cada sabotaje por su discriminador **y con el CONTROL en verde** |

Las cuatro preguntas de `LH-2` §D5 están contestadas en
`docs/research/listados-hubs/BEHAVIORS.md`. Resumen:

| pregunta | respuesta medida |
|---|---|
| hover de tarjeta | **`scale(1.1)` sobre la media** en L1-resources · L4 · L5; `#f7f7f7 → #f0f0f0` en L3; **sin efecto** en L2 (tarjeta solo-título). **Y es ZONAL** — ver §LH-C6-HOVER-ZONAL |
| ¿paginación AJAX? | **NO: enlace real**, `defaultPrevented: false` en las 5 formas con control |
| lazy de imagen de tarjeta | **no hay**: `sinCargarAntes = 0` en las 9 y `Δ 0` al scrollear. Atributo `loading="lazy"` sólo en L4 (3 de 3) |
| orden entre cargas | **1 solo orden en 10 cargas** en blog · etiqueta · casos ⇒ **cota al 95 %: < 30 % por carga**. NO sortean como el módulo P4 de la HOME |

### Por qué esta sonda necesitó una guarda que ningún otro eje necesita

> **Una interacción que NO SE DISPARA da la misma lectura que una que se dispara
> y no tiene efecto.** Las dos escriben «0 cambios».

Es el `switch` sin `default` de F3-1 con otro disfraz. Sin cerrarlo, el eje
entero saldría verde midiendo nada — que es exactamente cómo llevaba 0/31 sin
que nadie lo notara. Cada tipo lleva **control positivo independiente del
efecto** y el veredicto tiene **cuatro** valores; `NO SE DISPARÓ` **no cuenta
como unidad evaluada**, así que la corrida sale roja por el contrato de
`Evaluadas` y no por buena voluntad.

**Y el control se pagó solo en la primera corrida completa**: marcó **3 dianas**
que no reaccionaban, y ninguna era del sitio —

| lo que parecía | lo que era |
|---|---|
| «esta tarjeta no tiene hover» | la **cabecera fija** de Divi tapaba el punto de disparo |
| «este enlace no reacciona» | un `<a>` **en línea** de dos renglones: su caja de borde cubre el hueco entre líneas y el centro cae en el `<p>`. Se apunta sobre `getClientRects()`, no sobre la caja |
| ídem | el veredicto leía `tapada` de la MARCA y el control publicaba la del PUNTO disparado: **los tres controles en verde y veredicto rojo**. Regla 1 de §sondas rota dentro de la sonda escrita para cerrar esa familia |

Evidencia de los dos defectos, congelada con nombre que lo dice (regla 7):
`comportamiento-1440-SONDA-APUNTE-BBOX.json` · `comportamiento-1440-SONDA-TAPADA-DE-MARCA.json`.

---

## ⛔ LH-C6-FILTRO-L5 · `casos-de-exito` tiene un FILTRO DE CLIENTE por sector, y LH-2 D1 dijo «cero campos nuevos» (2026-08-10)

**Medido, no supuesto** (`comportamiento-1440.json`, interacción `filtro`):

| | |
|---|---|
| controles | **12 `<button data-filter=".sector-*">`** en `div.case-filter > #filters.button-group`, con `h2` = «Sectores» |
| al pulsar el 2.º | **57 de 57 → 3 de 57** tarjetas visibles |
| `is-checked` | `*` → `.sector-edar` |
| mecanismo | **FILTRO DE CLIENTE**: oculta tarjetas **sin recargar y sin cambiar la URL** |
| control positivo | `click` `isTrusted` en la diana, sin navegación |

**Por qué es ficha y no arreglo:** `LH-2` §D1 decidió que L5 *«no es un arquetipo:
es el índice que le faltaba al grupo C … en el modelo es una ruta + plantilla
sobre la colección `casos`; **cero campos nuevos**»*. El filtro **consume la
taxonomía `sector`** del caso, que hoy **no está en el modelo del caso** — §D3 la
dejó fuera con una condición de reapertura explícita: *«no se añade la relación
al modelo del caso **hasta que un listado la consuma**»*.

> **La condición se cumple: un listado la consume.** Y no de adorno — es el
> discriminador de las 12 opciones de un control que el visitante usa.

**Lo que NO se hace aquí, y es a propósito:** no se reescribe `DECISIONES.md`
sobre la marcha. La consigna de la tanda lo dejó dicho —*si el comportamiento
contradice el modelo decidido, para con la evidencia congelada*— y además la
decisión correcta no es obvia: la taxonomía `sector` es una de las **tres
familias sin censar de F3-4**, así que modelarla desde este único consumidor
sería decidir con n=1. **Va a la mesa de F3-4 con este número delante.**

---

## ⛔ LH-C6-L3-SIN-PAGINADOR · `scientific-category` pagina por URL y no sirve ningún control (2026-08-10)

Dos medidas congeladas que se contradicen, y la contradicción **la imprime la
sonda** en vez de quedarse callada:

| fuente | dice |
|---|---|
| `lh-paginas.json` | `articulos-cientificos-y-estudios` tiene **3 páginas** (`evaluaciones-independientes` 2 · `articulos-tecnicos` 1) |
| `comportamiento-1440.json` | `click · paginación` → **NO APLICA**: *«no se encontró enlace a /page/2/ (la sonda dice que pagina: 3 páginas)»* |

**Verificado contra el HTML congelado de F3-0**: en todo el documento hay **una
sola** aparición de `/page/2/`, y está en el `<head>` — el `<link rel="next">`
que pone Yoast. **Ni `.wp-pagenavi`, ni `nav.kunak-pagination`, ni ningún `a` en
el cuerpo.**

> **Desde la página 1 de L3 no se puede llegar a la 2 pulsando nada.**

**Lo que decide, y por eso es ficha antes de construir:**

1. **`D2.3`** dice que las rutas `/page/N/` se derivan en build. Para L3 eso
   emitiría rutas **que nadie puede alcanzar navegando**. Replicarlo es fiel;
   no replicarlo es una desviación deliberada. Las dos son legítimas y hay que
   **elegir con la razón escrita**, como se hizo con las 7 de `D2.4`;
2. **`LH-SP9`** (entradas por página de L3, *«14·1·8 con 2·1·2 páginas — no sale
   un divisor limpio»*) sigue abierta **y ahora se sabe por qué costaba**: la
   ventana de `paginate_links` que el censo leía no existe en esta forma. El
   total sólo lo sabe el servidor, y `lh-paginas` ya lo pregunta bien (3, no 2).

---

## ✅ LH-C6-HOVER-ZONAL · CERRADA (2026-08-11) — el disparador tiene nombre, y no lo dio el comportamiento sino el CSS SERVIDO

**La pregunta que quedaba era una sola** —*«¿cuál es el contenedor que dispara el
zoom?»*— y **el instrumento que la tenía abierta no podía contestarla**, que es
lo que hay que aprenderse de esta ficha:

> El hover ya había **excluido** `article` (con el puntero en la meta, la imagen
> no se mueve). Lo que quedaba era separar `a…:hover img` de `img:hover`, y eso
> **no lo separa ningún píxel**: las dos cajas coinciden en pantalla. Más
> corridas de hover habrían dado la misma respuesta más veces.

**Medido por `npm run qa:hover-zonal`** (nueva; negativo **4/4**), que lee el CSS
que el documento **se trae** — los `<style>` **y las 7–14 hojas EXTERNAS**, un
canal que ninguna sonda de este repo leía (§F3-1-CSS-NO-CAPTURADO: *19 hojas, 0
capturadas*). **41 185 reglas servidas** en las 9 formas:

| forma | disparador servido | objetivo | declaración |
|---|---|---|---|
| **L1-blog · L1-etiqueta · L1-resources (×2) · L4** | **`.et_pb_post .entry-featured-image-url`** | **`img`** | `transform: scale(1.1)` |
| **L5-casos** | `.case-list-content article .case-imagen` | **el propio disparador** | `transform: scale(1.1)` |

> **O sea que son DOS formas distintas, no una con dos pieles:** en L1/L4 el
> disparador es el **`<a>` que envuelve la imagen destacada** y el que se amplía
> es el `<img>` **de dentro**; en L5 el `<a>` **se amplía a sí mismo** (la tarjeta
> de caso no tiene `<img>`: la imagen es `background-image` del propio enlace).
> Cablear `article:hover img` reproduce el píxel a 1440 en las dos y **cambia el
> disparador en las dos**.

**El cruce de instrumentos cerró, y es lo que hace adjudicable esto** (§sondas 4,
tercera cara — *cuando existe otra medición del mismo objeto con otro
instrumento, cruzarla es obligatorio*): los **4 zooms medidos** por
`qa:comportamiento` tienen **los 4** su regla servida; `efectos medidos SIN
regla = 0`. Y al revés — **L1-blog y L1-etiqueta SIRVEN la regla y no tenían zoom
medido** en la corrida canónica, porque su puntero cayó en la meta. Las dos
corridas que parecían contradecirse quedan explicadas por el mismo CSS.

⚠ **Alcance:** sólo `transform`. El hover de color (`a.noticias`,
`.scientific-imagen-container`) es otra pregunta y no la contesta esta sonda; y
esto lee la cascada **escrita**, no la computada — por eso se cruza con el otro
instrumento en vez de sustituirlo. Congelada: `medidas/hover-zonal.json`.

---

## ⚠ LH-C6-HOVER-ZONAL · el hover de una tarjeta NO ES UNO: depende de la zona (2026-08-10) — *cómo se llegó a la ficha de arriba*

**Dos corridas de la misma sonda sobre `L1-blog` dieron efectos distintos**, y
las dos son ciertas:

| punto de disparo | efecto medido |
|---|---|
| dentro de la **imagen** | `img` · `transform: none → matrix(1.1,0,0,1.1,0,0)` (caja `440×293.2 → 484×322.5`) |
| dentro de la **meta** | `a.noticias` · `color: rgb(102,102,102) → rgb(0,117,201)`, **y la imagen no se mueve** |

> **Una sonda que apunta «al centro de la tarjeta» está eligiendo una respuesta
> sin decirlo.** El primer apunte iba al centro de la caja de borde; el segundo
> —el que arregla el problema de los `<a>` en línea— busca el primer píxel
> alcanzable, y ése cayó en otra zona. Nada falló: la pregunta estaba mal puesta.

**Corregido declarando la zona**: `AFOR=<selector> ETIQUETA=<nombre>` mide otra
zona de la misma afordancia y **exige nombre propio para la congelada**, para que
una medida de la meta no pueda pasar por «el hover de la tarjeta» (regla 7
aplicada *antes* de que ocurra).

**Consecuencia para LISTADO-B:** son **dos reglas con dianas distintas**, y hay
que construir las dos. Una plantilla con `article:hover img { scale: 1.1 }`
reproduce el píxel a 1440 **y cambia el disparador** — o sea, el defecto de
rango del §CONTRATO NO ES EL MISMO A TODOS LOS ANCHOS trasladado al eje de
interacción. ~~**Falta medir cuál es el contenedor que dispara el zoom**~~
**MEDIDO el 2026-08-11** — es `a.entry-featured-image-url` (L1/L4) y
`a.case-imagen` (L5): ver la ficha ✅ de arriba.

---

## ⛔ LH-C6-LAZY-CLON · el clon emite 28 `loading="lazy"` donde el original emite 265 (2026-08-10)

Primer hallazgo del eje **por los dos lados**, y es de CLASE: 13 rutas, una por
familia del manifiesto, a 1440.

| ruta | `loading="lazy"` orig → clon | imágenes sin pedir al terminar la red, orig → clon |
|---|---|---|
| `/` | **69 → 0** | **35 → 0** |
| `/monitor-calidad-aire` | **74 → 0** | **24 → 0** |
| `/software-de-medicion-calidad-del-aire` | **40 → 16** | **32 → 16** |
| `/accesorios` | 21 → 12 | 17 → 10 |
| `/kunak-api` | **20 → 0** | 4 → 0 |
| `/sectores/calidad-del-aire-en-las-ciudades` | **18 → 0** | 10 → 0 |
| `/case-studies/…rio-de-janeiro` | **16 → 0** | 9 → 0 |
| `/casos-de-exito/…des-moines-iowa` | **7 → 0** | 2 → 0 |
| las 5 de grupo A y KB | 0 → 0 | ≤1 → 0 |
| **TOTAL** | **265 → 28** | — |

Las dos columnas dicen cosas distintas y por eso están las dos: la primera es
**markup** (el atributo), la segunda es **comportamiento** (cuántas imágenes
seguían sin pedirse cuando la red quedó en reposo). **El clon las pide todas.**

**Por qué ninguna guarda podía verlo:** una imagen que se carga antes o después
**no mueve `docH`, ni `h1.y`, ni el árbol de secciones, ni un `href`**. Es el
mismo hueco por el que pasaron las 23 imágenes rotas de §M-404, con el signo
cambiado.

**Alcance:** medido en **13 de 37 rutas** y **sólo a 1440**. No se ha comprobado
si el atributo del original es uniforme dentro de cada familia, así que **no se
cablea nada**: el número es la ficha, la decisión es de la tanda que toque
`M-IMG`/`CMS-0b`.

### ⚠ AMPLÍA EL ALCANCE (2026-08-11): confirmado en un SEGUNDO arquetipo, y ahí el número es mucho mayor

Al cerrar el hueco de MONOGRÁFICO (§LH-C6-FAMILIA-NO-ES-FAMILIA) entraron **5
rutas más**, y las dos del arquetipo MONOGRÁFICO son las peores medidas hasta
hoy — porque son las que más imágenes traen:

| ruta | `lazy` orig → clon | imágenes cargadas antes → después del scroll |
|---|---|---|
| `/sectores/…-en-edar` | **28 → 0** | orig **66 → 194** (pidió **128** al scrollear) · clon **74 → 74** (**0**) |
| `/sectores/…-petroleo-y-gas` | **28 → 0** | orig **58 → 64** · clon **74 → 74** (**0**) |

El veredicto del tipo `scroll` lo dice sin interpretación: **orig `EFECTO`, clon
`SIN EFECTO`** en las dos. *«todas las imágenes ya estaban cargadas antes de
scrollear»* es la lectura literal de la sonda sobre el clon.

**Lo que esto añade a la ficha no es un número más grande, es el ALCANCE:** con
13 rutas el hallazgo podía ser de los arquetipos tempranos; con las 18 aparece
también en el más tardío y con el contenido más pesado. Sigue sin cablearse
nada, y sigue siendo decisión de `M-IMG`/`CMS-0b`.

### ✅ ALCANCE COMPLETO (2026-08-11): las 37 rutas, y el veredicto por lado es lo que lo cierra

Ya no es una muestra. `TODAS=1` sobre las 37 × 2 lados:

| | orig → clon | dónde |
|---|---|---|
| `loading="lazy"` **en la raíz** | **373 → 28** | 29 rutas de 37 difieren |
| **imágenes pedidas AL SCROLLEAR** (documento entero) | **363 → 2** | ídem |
| **veredicto del tipo `scroll`** | **`EFECTO` 29 de 37 → `EFECTO` 1 de 37** | — |

> **La fila del veredicto es la que no admite interpretación:** *«hay carga
> diferida»* es la lectura literal de la sonda en **29 de las 37** rutas del
> original y en **1** de las del clon. No es que el clon difiera menos: es que
> **no difiere**.

⚠ **Y las dos primeras filas NO tienen el mismo alcance, que es justo lo que hay
que leer bien:** el recuento de `lazy` se toma **en la raíz de contenido**, y las
raíces son `#main-content` (orig) y `main` (clon) — **dos selectores que no está
probado que denoten el mismo subárbol** (§sondas 4: *un pleno también puede ser
el instrumento*). El de imágenes pedidas al scrollear se toma **sobre el
documento entero en los dos lados**, y por eso es el que se puede comparar sin
asterisco. Se dan las dos, con su ámbito escrito, en vez de fundirlas en un
número más redondo.

---

## ⚠ LH-C6-CLON-SIRVE-OTRO-MARCADO · tres diferencias de marcado que ninguna sonda de alto puede ver (2026-08-11)

Salidas del mismo barrido de MONOGRÁFICO, **inventario de los dos lados**, a
1440. Ninguna mueve `docH` ni `h1.y`, y por eso llegan hasta aquí:

| eje | orig → clon | dónde |
|---|---|---|
| nodos `article` | **7 → 6** | las 2 rutas de MONOGRÁFICO |
| nodos `article` | **3 → 0** | las 2 de grupo A del barrido (`/monitorizacion-de-emisiones-del-trafico-urbano`, `/…-en-centros-de-datos`) |
| controles de formulario | **0 → 8** | las 2 de MONOGRÁFICO |

**Los 8 controles del clon son de Swiper** —`Diapositiva anterior` ·
`Diapositiva siguiente` · `Ir a la diapositiva 1..3` + 3 sin nombre—: el
original tiene slider (25 y 32 nodos) pero **no lo gobierna con `<button>`**. O
sea que no es «un control de más», es **el mismo carrusel con otro mecanismo**,
y aparece en el inventario porque el inventario cuenta controles de formulario.

⚠ **Los tres son RECUENTOS DE SELECTOR, no defectos adjudicados**, y la
distinción importa: `article` es una etiqueta, no una tarjeta — que el clon
sirva 6 donde el original sirve 7 dice que **el marcado difiere**, no cuál de
los dos está mal. Adjudicarlo pide mirar qué nodo es cada uno, y eso no se ha
hecho. Va a la lista con su número, sin conclusión.

### ⚠ ALCANCE COMPLETO (2026-08-11): no eran 2 rutas, son **21 de 37** — y el eje `article` tiene FORMA

Las 37 × 2 lados, mismo inventario:

| eje | orig → clon | rutas que difieren | ámbito |
|---|---|---|---|
| nodos `article` | **105 → 64** | **21 de 37** | **el DOCUMENTO** en los dos lados ⇒ comparable |
| controles de formulario | **67 → 183** | 16 de 37 | la raíz (`#main-content` / `main`) ⇒ **con asterisco** |
| marcador `slider` | **290 → 323** | 12 de 37 | ídem |
| `<img>` | **1094 → 719** | 26 de 37 | ídem |

**Y `article` —el único de los cuatro con ámbito comparable— no sale disperso:
sale en dos grupos limpios.**

| patrón | rutas | qué son |
|---|---|---|
| **`−1`** (7→6 · 5→4 · 4→3) | 11 | HOME · PRODUCTO · SOFTWARE · CATÁLOGO · API · los 6 de `/sectores/*` |
| **`3→0`** | 6 | seis de grupo A: el clon **no emite ni uno** |
| **`4→1`** | 3 | los tres de `casos-de-exito` / `case-studies` |

> **Un `−1` repetido en once rutas de seis arquetipos distintos no es ruido de
> contenido: es un nodo que la plantilla del original pone y la del clon no.**
> Y el `3→0` de grupo A es otra cosa distinta —ahí no falta uno, faltan todos—.
> Fundir los dos en «el marcado difiere» pierde exactamente la información que
> hace falta para adjudicarlos.

**Sigue sin adjudicarse, y ahora se sabe qué costaría:** identificar **qué** nodo
es el `−1` en una sola de las once (mirar los `article` de los dos lados y
emparejarlos) muy probablemente cierra las once a la vez. Es una medida pequeña
y no entra aquí porque esta tanda es del eje, no del marcado.

⚠ **Los otros tres ejes cargan el asterisco de la raíz** —`#main-content` contra
`main`, dos selectores que no está probado que denoten el mismo subárbol— así
que `1094 → 719` **no es «al clon le faltan 375 imágenes»**: es que los dos
recuentos pueden no estar contando el mismo conjunto. Antes de citarlo como
defecto hay que igualar el ámbito, que es la misma trampa por la que `c-cmp` dio
«las 31 rutas con el árbol distinto» (§sondas 4).

---

## ⚠ LH-C6-HOVER-SUBRAYADO · el clon SUBRAYA al hover y el original NUNCA (2026-08-10)

Medido sobre **99 hover con efecto** en las 13 rutas × 2 lados, contando sólo
los cambios **que pintan** (un color de borde con anchura 0 se registra aparte y
no cuenta):

| propiedad que cambia al hover | original | clon |
|---|---|---|
| `color` | 60 | 61 |
| **`textDecorationLine: none → underline`** | **0** | **26** |
| **`textDecorationColor`** | **0** | **24** |
| `transform` (zoom de media) | 2 | 0 |
| `opacity` | 2 | 3 |
| `backgroundColor` | 6 | 5 |

**Y el color al que va tampoco es el mismo:** el original pasa a
`rgba(0,117,201,0.7)` —el mismo azul translúcido— y el clon a `rgb(0,94,163)`,
un azul más oscuro y **opaco**.

> ⚠ **La mitad que hace esto adjudicable llegó tarde y merece anotarse:** la
> primera versión de la sonda leía `borderTopColor` **sin su anchura** y contó
> **88 «cambios» en el original**. Un color de borde con `border-width: 0` **no
> pinta nada**. O sea que el hallazgo estaba a punto de ser «el original
> reacciona en el borde y el clon no» sobre 88 efectos invisibles. Se miden las
> anchuras y `text-decoration` completos, y los cambios que no pintan se
> registran **aparte**.

**Alcance:** 13 rutas, 1440, y la afordancia es *«los 4 primeros `a`/`button` de
la raíz de contenido»* — o sea que **no son necesariamente los mismos elementos
en los dos lados**. Lo que sí es comparable es **el reparto de propiedades**, que
es lo que está en la tabla. Para adjudicar píxel a píxel hace falta emparejar
afordancias, y eso no está hecho.

### ⚠ ALCANCE COMPLETO (2026-08-11): las 37 rutas — el reparto aguanta y el subrayado se multiplica por 3.5

**253 hover con `EFECTO`** (132 orig · 121 clon) sobre las 37 × 2 lados:

| propiedad que cambia al hover | original | clon |
|---|---|---|
| `color` | 195 | 184 |
| **`textDecorationLine: none → underline`** | **0** | **90** |
| **`textDecorationColor`** | **0** | **86** |
| `transform` (zoom de media) | **2** | **0** |
| `backgroundColor` · `borderTopColor` · `borderBottomColor` | 16 · 16 · 16 | 15 · 15 · 15 |
| `opacity` | 2 | 4 |

> **El reparto es el mismo con 2.8× más muestra**, que es lo que convierte el
> hallazgo de *«se vio en 13 rutas»* en *«así es el clon»*: el original **nunca**
> subraya al hover —0 de 132— y el clon lo hace en **90 de 121**. El `0 → 90` es
> el mismo defecto de clase que el `0 → 26`, contado entero.
>
> Y el `transform 2 → 0` dice la otra mitad: **el zoom de media que el original
> tiene en dos afordancias, el clon no lo tiene en ninguna** — coherente con que
> las plantillas que lo llevan (§LH-C6-HOVER-ZONAL) son justo las de listado, que
> el clon todavía no construye.

---

## ⚠ LH-C6-COBERTURA-DIVERGE · la matriz generada y `COBERTURA-MEDICION.md` llevan una semana divergiendo (2026-08-10)

**`qa:cobertura` no arrancaba desde el 2026-08-03** (`path.enApp` en vez de
`enApp`, colado en la conversión a monorepo, commit `bcc2b83`). No es un verde
falso —muere con `TypeError` y código ≠0— pero sí una semana en la que **la
matriz no se podía regenerar**, y lo destapó **intentar usarla** (§regla 10).

Arreglado. Y al correrla salen **dos divergencias con el documento**, las dos por
la misma causa —una sonda que acredita un eje y no está declarada como fuente:

| eje | dice el documento | dice la sonda | por qué |
|---|---|---|---|
| **anchos horiz.** | **31/31** por `qa:ancho` | **15/37** (`c-banda` · `a-miga`) | `ancho-cuerpo` **no está declarada** como fuente en `cobertura.mjs` |
| docH · base · árbol · **KB** | 4 ejes a `O` para las 6 rutas de `articulos-kb` | **`·` en las 6** | `kb-cmp` **no está declarada** como fuente |

**No se arregla en esta tanda, y se dice por qué:** declarar una fuente es
decidir **qué rutas y qué ejes acredita**, y hacerlo deprisa es cómo se pinta de
verde una celda que nadie miró — que es lo único que este documento existe para
evitar. Va con su número a la tanda que toque cobertura.

**Lo que sí queda:** la matriz **vuelve a ser generable**, y el eje
`comportamiento` sale **13/37 con su sonda declarada**. Congelada:
`medidas/cobertura-2026-08-10.json`.

---

## ✅ LH-C6-FAMILIA-NO-ES-FAMILIA · «una ruta por familia» dejó un ARQUETIPO ENTERO a cero, y el 13/37 no podía decirlo (2026-08-11)

**El alcance de `P-LH-C6` se declaró como *«13 rutas emitidas, una por familia
del manifiesto»*. Es literalmente cierto y aun así dejaba un hueco que la cifra
no expresa.** Las dos mitades, las dos derivadas:

| | `comportamiento.mjs` | `cobertura.mjs` |
|---|---|---|
| qué llama «familia» | el **`srcRoute`** del manifiesto | el **ARQUETIPO** (`FAMILIAS`, predicados escritos) |
| cuántas hay | **13** | **10** |
| en qué unidad reporta | la interacción | **la RUTA** |

Las dos particiones coinciden en 8 de 10 familias, y **por eso la palabra tapó
la diferencia**. Donde no coinciden es donde `CLAUDE.md` ya avisa: **una ruta
dinámica sirve DOS arquetipos** (§Páginas clonadas). Derivado sobre el
manifiesto:

| arquetipo | rutas | medidas el 2026-08-10 |
|---|---|---|
| MONOGRÁFICO | 2 | **0** ← |
| SECTOR | 4 | 1 |
| A · blog / término | 16 | 3 |
| A · documento científico | 4 | 1 |
| CASO | 4 | 2 |
| FAQ | 2 | 1 |
| HOME · CATÁLOGO · PRODUCTO · SOFTWARE | 1·1·1·2 | 1·1·1·2 |

`/sectores/[slug]` es **un** `srcRoute` con **dos** arquetipos dentro; «la
primera de cada `srcRoute`» eligió la de SECTOR y MONOGRÁFICO se quedó en
**0 de 2**.

> **Y no es un arquetipo cualquiera: es aquel del que este repo ya sabe que
> esconde los defectos de los componentes que comparte con SECTOR.** El `h1` al
> 100 % donde el original le da el 50 % daba **Δ0 a los cinco anchos** en los 4
> sectores y **−36.02** en el monográfico, porque sus titulares son más largos
> (§El NIVEL al que se mide, *«a veces el detector no es otro ancho, es otro
> contenido»*). Muestrear por `srcRoute` reproduce exactamente ese punto ciego.

**Cerrado midiendo** — `TODAS=1 SOLO=monitorizacion ETIQUETA=monografico`:
**5 rutas × 2 lados · 70/70 con disparo confirmado · 0 selectores muertos**,
congelada en `medidas/comportamiento-1440-emitidas-monografico.json` y
**declarada por su nombre** en `cobertura.mjs` (no por glob: una corrida `AFOR=`
mide otra zona y no puede acreditar el hover canónico). El eje pasa a
**18/37** y ninguna familia de la matriz queda a cero.

**Cosecha de esas 5 rutas:** §LH-C6-LAZY-CLON (ampliada — el clon no difiere
**128** imágenes en EDAR) y §LH-C6-CLON-SIRVE-OTRO-MARCADO (nueva).

**La regla, que es lo reutilizable:**

> **Cuando una sonda y su informe agrupan con palabras distintas que suenan
> igual, el alcance se declara en la unidad del INFORME, no en la del
> instrumento.** «Una por familia» sólo se puede leer si dice *de qué* familia,
> y aquí las dos particiones eran reales, ambas correctas, y no eran la misma.

---

## ⚠ MEDIDAS-BASE-VIEJA · dos congeladas canónicas se quedaron ANTES de F3-1, y cada `npm run check` derrama una fechada (2026-08-11)

Visto al revisar el árbol antes de commitear, no buscándolo:

| congelada | dice | dice el build de hoy |
|---|---|---|
| `medidas/manifiesto.json` (2026-08-05) | 31 rutas | **37** — y marca las 6 de `articulos-kb` + `/centro-de-ayuda/[...ruta]` en su clave `nuevas` |
| `medidas/slugs.json` (2026-08-08) | `emitidas: 31` | **37** |

**La guarda funciona: por eso se ve.** `w()` se niega a pisar y desvía a un
fichero fechado — pero como nadie re-congela, **`slugs-*` lleva ~20 derrames
desde el 2026-08-01** (5 el día 1, 14 el día 2…). No es una medida mala: es que
la canónica de esos dos ejes **quedó atrás cuando F3-1 emitió 6 rutas más**.

**No se re-congela en esta tanda, y por la misma razón que
§LH-C6-COBERTURA-DIVERGE:** re-basar una canónica es **decidir cuál es la
referencia**, y hacerlo de paso, en la tanda que iba de otra cosa, es como se
pierde el punto de comparación. Es `PISAR=1` y una frase de por qué — pero la
frase hay que escribirla mirando los dos ficheros, no al vuelo.

⚠ **Y el coste mientras tanto no es cero:** `medidas/` es *la prueba*, y 20
derrames casi idénticos alrededor de una canónica vieja hacen más caro
distinguir cuál es la buena — que es justo lo que la regla 7 protege.

---

## ⚠ LH-C6-TIEMPO-BIMODAL · el tipo `tiempo` tiene DOS ESTADOS discretos, no ruido (2026-08-11)

El acta de `P-LH-C6` avisó de que este eje **no tiene suelo** citando *«29
mutaciones en una corrida y 1 en la siguiente»* sobre `/monitor-calidad-aire`.
Re-correr el test en negativo entero dio la **segunda instancia**, en otra
página, y con una forma que el aviso no tenía:

| corrida de `L1-blog` | `tiempo` orig |
|---|---|
| control · 08-10 y 08-11 | `EFECTO` · **mut 1 · fuera 80** |
| tapado · 08-10 y 08-11 | `EFECTO` · **mut 1 · fuera 80** |
| sin-disparo | 08-10 `EFECTO` (1·80) → 08-11 `SIN EFECTO` (**0·0**) |
| diana-falsa | 08-10 `SIN EFECTO` (0·0) → 08-11 `EFECTO` (**1·80**) |

**8 observaciones válidas, exactamente DOS valores: `1 · 80` (6) y `0 · 0`
(2).** Ningún intermedio, y **flipa en las dos direcciones** entre corridas.

> **O sea que no es «ruido»: es BIMODAL, como el `h1` de `/software` y los dos
> monográficos.** Y a un suelo bimodal le aplica la regla ya escrita
> (`CLAUDE.md` §La base de lectura): **un suelo bimodal NO es un umbral —
> DISCRIMINA.** Un `SIN EFECTO` del tipo `tiempo` en `L1-blog` no es defecto: es
> el segundo estado. Cualquier **otro** valor sí lo sería.

**Y lo que esto NO autoriza:** son 8 observaciones de **una** página. No
establece la forma para las demás rutas ni para los otros tipos. El eje sigue
**sin campaña**, y el aviso de §BEHAVIORS §3 sigue en pie — lo que cambia es que
ahora hay una forma medida donde antes había un adjetivo.

**Lo que sí prueba de la sonda, y es lo tranquilizador:** los cuatro
discriminadores de disparo (`NO SE DISPARÓ` · `tapada` · selector MUERTO · reloj
de la página) salieron **idénticos en las dos corridas**. La inestabilidad está
en el **efecto**, no en el **control** — que es exactamente el reparto que la
sonda se diseñó para conseguir.

---

## ✅ LH-C6-SOLO-SIN-ETIQUETA · la guarda de `AFOR` existía y la de `SOLO` no: se arregló la instancia, no la clase (2026-08-11)

`comportamiento.mjs` traía una guarda explícita para `AFOR=` — *cambia qué zona
se mide, así que **exige `ETIQUETA`** o la congelada escribiría en el nombre
canónico* (§sondas, regla 7 aplicada antes de que ocurra). Correcta.

**`SOLO=` no la tenía, y produce el mismo daño y peor de leer:** una corrida
`SOLO` mide **un subconjunto** y su congelada tiene **la forma exacta de una
corrida completa** — mismas claves, mismo esquema—; sólo el `meta.alcance`
delata que midió una página de trece. Y es la perilla que más se usa.

Arreglado en el sitio de la clase, con `NEG` exento (el negativo usa `SOLO` por
diseño y `w()` ya lo desvía a `-neg-<caso>` por su cuenta). Comprobado en los
dos lados: `SOLO=… ` sin `ETIQUETA` → **exit 2** con su mensaje; con `ETIQUETA`
→ escribe `comportamiento-1440-emitidas-monografico.json`. Negativo entero
**re-corrido tras el cambio**.

---

## ✅ F3-1 · `articulos-kb` SERVIDA y COMPARADA PAR A PAR (2026-08-10)

**Cierra los PASOS 1·2·3.** La hoja `kb-*` (`apps/web/src/app/kb.css`) está
**derivada** por `npm run qa:kb-clases` de los nodos cuyo DATO omite cada
propiedad —no del valor mayoritario— y aceptada **par a par** por
`npm run qa:kb-cmp`, que compara el clon renderizado contra el original:

| corrida | pares iguales | sin declarar |
|---|---|---|
| @1440 · original **congelado** | **4999 / 5089** | **0** |
| @390 · original **congelado** | **4979 / 5089** | **0** |
| @1440 · original **VIVO** | **5453 / 5543** | **0** |
| @390 · original **VIVO** | **5433 / 5543** | **0** |

> **Y el vivo da los MISMOS recuentos de hueco que el congelado**, ficha por
> ficha. Es el control cruzado que ninguna de las dos corridas da sola: el
> original de hoy reproduce la medida del 2026-08-10 en todo lo comparado.

⚠ **Alcance, y hay que leerlo con el aviso puesto:** estas rutas **no tienen
campaña de ruido propia**, así que un residuo pequeño aquí **es SIN PROBAR, no
limpio** — y no se puede pedir prestado el suelo de otra ruta, porque un suelo es
propiedad *de las rutas medidas*.

### Los 4 defectos que el comparador cazó y ninguna guarda anterior podía ver

| defecto | coste | por qué no lo veía nada |
|---|---|---|
| el discriminador de bloque es **`kind`** y el componente miraba `blockType` | **las 6 páginas servidas con CERO módulos** | `switch` sin `default` ⇒ `undefined` ⇒ React no pinta y no avisa. Verde: `check`, `qa:slugs`, `qa:manifiesto`, manifiesto con sus 6 rutas |
| los SVG no tienen tamaño intrínseco | **40 imágenes a 0 px de ancho** | el `src` resuelve (HTTP 200); lo que falta es la caja |
| `ColumnaAncha` al **73.62 %** en vez de 73.624 | **−0.047 px ⇒ 45 pares** | horizontal y sub-píxel: no cambia un renglón, así que ninguna guarda de alturas lo mueve. **Grupo A lo traía igual** |
| `margin-right` del canal a **390** | **18.4375 px en 15 columnas** | la media query no sube la especificidad y perdía contra `:not(:last-child)`. Δ0 perfecto a 1440 |

### Los 7 huecos DECLARADOS, con su número

La sonda los cuenta y **falla en las dos direcciones**: uno que crece es un
defecto nuevo con coartada; uno que se vacía es un permiso muerto.

| ficha | @1440 | @390 | qué es |
|---|---|---|---|
| **F3-1-SRCSET-KB** | 7 | 12 | ver abajo — asciende de cómoda a cara |
| **F3-1-PIEL-CUERPO-KB** | 18 | 18 | la piel del CUERPO del módulo de texto (claim 25px ×5 · etiqueta azul 15px ×2) no es campo todavía |
| **F3-1-ALIGN-BLURB-KB** | 9 | 9 | el `align` de la piel del blurb no se extrae |
| **F3-1-ICONO-BLURB-KB** | 27 | 27 | el contenedor del icono mide **50×46** con una imagen de **50×50 desplazada +6** |
| **F3-1-GALERIA-KB** | 10 | 19 | n=1 en las 6 instancias: FAMILIA DE CALIBRACIÓN |
| **F3-1-ALTO-DERIVADO-KB** | 18 | 24 | altos de módulo con Δ de 0.42 a 10.6 y **ninguna propiedad comparada distinta** |
| **F3-1-BOTON-ALIGN-KB** | 1 | 1 | 1 de 6 botones computa `start` en el ORIGINAL y los otros 5 `left` |

#### F3-1-SRCSET-KB · la ficha que cambia de categoría

`srcset` se dejó fuera del modelo con su razón (M-IMG abierta en el ESQUEMA, no
se resuelve de paso). Medido ahora, **tiene consecuencia geométrica**:

> a 390 el original sirve la **variante que WordPress recorta** y el clon el
> fichero entero. `cloud-aqi` mide **1651×393** en disco y el original lo pinta
> **335.39 × 188.66** (16:9): el clon da **79.83** de alto. **Δ 108.83 px**, en 3
> imágenes; y 0.34 px en otras 7 por el redondeo de la razón.

Deja de ser una ficha de peso de descarga. Su cierre es el de M-IMG.

#### F3-1-ICONO-BLURB-KB · lo que falta para cerrarla es una MEDIDA, no una idea

El contenedor es `inline-block` de 50×**46** con la imagen dentro midiendo
50×**50** y empezando **6 px más abajo**. Ninguna combinación de lo capturado lo
explica, y **la spec no tomó** `height`, `overflow`, `font-size` ni los márgenes
del `img`. Se cierra re-midiendo esas cuatro sobre el original, no razonando.

#### F3-1-ALTO-DERIVADO-KB · el hueco que la corrida VIVA acotó

La corrida `--vivo` compara **454 pares más** (el espejo congelado guarda un solo
`p` por módulo) y **los 18 Δ de alto siguen sin una sola propiedad distinta
debajo**. O sea que la causa **no** está en el ritmo ni en la tipografía de
párrafo: queda entre lo que este barrido no mira (métricas de los inline —
`b`, `span`, `sub`, `a`— o la fuente). Es la §regla del NIVEL aplicada al propio
comparador: mide alto y no mide lo que lo compone.

## ✅ F3-1-PIEL-FUERA-DE-KB · contestada en las DOS direcciones (2026-08-10)

**(a) ¿cuántas conclusiones anteriores de «varianza cero / ningún discriminador»
se sacaron de ejes de atributo y estructura sin mirar el CSS compilado?**

Derivado sobre el repo entero (`docs` · `apps/web/src` · `packages` · `scripts`):
**141 afirmaciones**, de las cuales **10 mencionan tipografía**. Leídas una a una,
**ninguna está en riesgo**, y la razón es estructural y vale como regla:

> **Toda afirmación tipográfica del repo se derivó de `getComputedStyle`, que
> está AGUAS ABAJO del CSS compilado.** El escalón fue posible en un solo sitio:
> donde una sonda leyó el **atributo** (`estiloInline`) y lo llamó «el editor no
> tocó nada». Medir el computado ya ve el `<style>` que Divi escribe.

Las 3 copias de *«cero varianza en 24 instancias (ritmo, **tipografía**,
retícula)»* del cascarón de grupo A salen de `a-cascaron`, que mide computado ⇒
**siguen en pie**. Las otras son declaraciones del límite (*«cero varianza no
prueba plantilla»*), no conclusiones.

**Contestada al revés otra vez:** el riesgo no está en lo viejo — está en
**sobre-generalizar la regla nueva** y mandar a alguien a re-auditar 131
afirmaciones sobre estructura que nunca estuvieron expuestas.

**(b) las reglas de piel FUERA de KB: ¿cómo las produce hoy cada arquetipo
construido?**

Derivado de `medidas/pieles-modulo.json` y del árbol de componentes:

| | |
|---|---|
| reglas de piel de titular fuera de `articulos-kb` | **1227** (productos 658 · sectores 291 · listados 118 · sueltas 104 · hubs 56) |
| cómo las produce el clon hoy | **CABLEADAS en el componente**: **56 de los 77 `.tsx`** de `apps/web/src/components` llevan `text-[NNpx]` literal (60× `18px` · 12× `35px` · 11× `37px` · 10× `44px`) |
| su Δ0 | **limpio donde está medido** — los comparadores de esos arquetipos no lo marcan |

> **No es una emergencia: es la CLASE.** Correcto para las instancias medidas y
> roto para la siguiente, exactamente como estaba `mb` antes de §2d.6. Va a esta
> lista **con su número** y se paga cuando toque el arquetipo, con su round-trip
> — no de paso.

> ⚠ **DENOMINADOR CORREGIDO 2026-08-11 (74 → 77), y merece la nota porque es la
> §regla 9 cometida DENTRO de una tanda que derivó todo lo demás.** El **56** se
> derivó; el **74** se heredó del barrido del 2026-08-01 que dejó escrito
> `CLAUDE.md` (*«los 74 `.tsx` de `src/components`»*). Derivado hoy contra el
> árbol y contra el commit donde se escribió la ficha (`git ls-tree be4cb37`):
> **77 en los dos**. O sea que el denominador ya estaba viejo el día que se
> escribió.
>
> **Nada cambia del hallazgo** —el numerador y las 1227 son buenos, y re-derivar
> hoy da 56 otra vez—, y por eso es el ejemplo limpio de lo que la regla dice:
> *un número recordado y uno derivado se escriben igual y no valen lo mismo*. En
> una fracción, **basta con que uno de los dos lados sea de memoria**.


## ⛔ F3-1-CSS-NO-CAPTURADO · el original NO está fuera del camino crítico para MEDIR EL PÍXEL (2026-08-10)

**Medido por `npm run qa:kb-css`, de dos lados, 6/6.** Acta:
`docs/research/articulos-kb/MEDICION.md` §0.

| | |
|---|---|
| hojas externas que el HTML de KB pide | **19 distintas** |
| capturadas en el repo | **0** |
| CSS **en línea** dentro del HTML | 8 bloques · **184 015 bytes** |
| anclas de ESTILO distintas entre captura y original | **55 de 210** |
| anclas de CAJA distintas | **36 de 36** |
| árbol de módulos idéntico | **6/6** |

> **La captura no sale desnuda: sale PLAUSIBLE.** 155 de 210 anclas de estilo
> coinciden. Medir specs ahí **no habría dado ningún error**: habría dado una
> spec con 55 valores inventados. El peor de todos: `columna.width` **678.52
> offline contra 430.80 en el original** — sin las hojas externas la partición
> en columnas no ocurre y todas salen de ancho completo, o sea **una spec que
> afirma, con número, que el cuerpo de este arquetipo es plano**.

**La frase de F3-0, con su alcance:** *el original está fuera del camino crítico
para **obtener datos** —sembrar, censar, transcribir, auditar el texto— y **no lo
está para medir el píxel**.* Es §regla 10 por tercera vez sobre la misma campaña:
capturar las páginas no es capturar sus assets, ni sus imágenes ni sus hojas.

**Salidas, con su coste:**

| | qué costaría | qué compraría |
|---|---|---|
| **(a) dejarlo así** | 0 | las specs y los Δ0 de este arquetipo siguen necesitando el sitio vivo |
| **(b) capturar el cascarón CSS** | las 19 hojas + las fuentes + reescritura de URL absolutas + **una campaña que pruebe que el render offline ≡ el vivo** | medición reproducible para siempre, también para los otros arquetipos |

**Se elige (a) para esta tanda y se declara.** (b) no es una tarea: es una tanda
con su propia verificación, y **hasta que exista y salga a Δ0 la captura no se
puede usar para medir píxeles**. Anotarlo es lo que impide que la próxima tanda
lo dé por hecho leyendo el titular de F3-0.

⚠ **Y esto NO afecta a `qa:kb-recon`**, que mide **estructura** sobre la misma
captura: el árbol de módulos sale **idéntico 6/6**. La captura sirve para el
árbol y no para el estilo, y las dos frases son distintas.

## ⚠ F3-1-SIN-PROBAR-KB · lo que las specs de `articulos-kb` dejan sin probar, nombrado (2026-08-10)

De `medidas/kb-tests.json` — **1519 pares (nodo × propiedad)** clasificados.
**No se cablea ninguno**: cablear lo no probado es exactamente el arreglo falso.

| propiedad | par medido | por qué no está probada |
|---|---|---|
| `fila.maxWidth` | `1380px → 1380px` (39 filas) | el test A no vale (es caja) y el B calla. **Inerte**: 1380 > 911.75 y > 335.39, no recorta nada |
| `columna.width` ×17 | `430.797 → 335.391` · `270.484 → 335.391` | columnas de filas **simétricas**: las hermanas miden lo mismo. **No añaden incógnita** — la propiedad que decide es `fila.reparto`, y ésa sí está probada |
| `modulo.marginTop` ×1 | `-18px → 0px` | **un solo módulo** con margen superior negativo a 1440, sin hermano que lo contradiga |
| **el mecanismo del default de `mb`** | `34.0469` en las 59 columnas `4_4` · `25.0625` en las 13 estrechas | **ninguno es el 2.75 % de su propio contenedor**: `34.0469` es el 2.75 % de **1238.39**, la fila del CASCARÓN. *Que* ocurre está medido sin excepción; *por qué*, no |
| `seccion.paddingTop = 0` | `0px → 0px` en las 6 | es un desvío del default (4 %), así que alguien lo escribió — pero **hay UNA sección por página**, así que el test B **no puede pronunciarse**, y su silencio no es «no varía» |
| `blurb.position_top` · `bg_layout_light` · la piel del `button` | 36/36 y 6/6 | **cero varianza no prueba plantilla**: prueba que en las instancias que existen nadie lo tocó |

**El de `mb` es el que muerde al construir:** cablear «el default de `mb`» como
una constante se equivoca en uno de los dos grupos por ~9 px, y en **59 módulos**
si se elige mal. **El default es una función del tipo de columna, no un número.**

> ⚠⚠ **CORREGIDO EL MISMO DÍA (F3-1 PASO 6): la frase de arriba atribuye el
> efecto a la VARIABLE EQUIVOCADA, y es correcta sólo dentro de KB.** En las 6
> instancias **todas las filas miden 911.75**, así que «tipo de columna» y
> «ancho de fila» están **confundidos** y la medición no puede separarlos.
> Derivado contra un segundo arquetipo —`medidas/mono-modulos-{1440,390}.json`,
> filas de 1238.39, emparejado nodo a nodo— la confusión se deshace:
>
> | arquetipo | fila | columna | `mb` por defecto @1440 | n |
> |---|---|---|---|---|
> | SECTOR/MONOGRÁFICO | 1238.39 | **estrechas** | **34.0469** | 35 |
> | SECTOR/MONOGRÁFICO | 1238.39 | `4_4` | **34.0469** | 11 |
> | `articulos-kb` | 911.75 | **estrechas** | **25.0625** | 13 |
> | `articulos-kb` | 911.75 | `4_4` | **34.0469** | 59 |
>
> **Manda el ANCHO DE LA FILA (2.75 %), no el tipo de columna.** Y la
> consecuencia es la contraria a la que la cola retroactiva iba buscando: **en
> los arquetipos ya construidos NO hay nada que corregir** —sus 35 módulos de
> columna estrecha llevan `34.0469` y ése es su valor medido—, y lo que habría
> hecho daño es **generalizar la regla de KB hacia atrás**: habría puesto
> `25.0625` en 35 módulos que miden `34.0469`. El mismo arreglo falso, con el
> signo cambiado.
>
> Lo que sigue SIN PROBAR es sólo la **excepción**: por qué una `4_4` de una fila
> de 911.75 resuelve su 2.75 % contra 1238.39. Implementación con su tabla y su
> `throw` ante un ancho de fila sin medir: `mbPorDefecto()` en
> `packages/cms-config/src/defaults.ts`.

## ⚠ F3-1-RITMO-SIN-UNIDAD · `ritmoInline` y `ritmoModulo` son `number`, o sea px IMPLÍCITOS (2026-08-10)

`campos/comunes.ts` declara el ritmo de SECTOR, MONOGRÁFICO y `productos` con
campos `number`. En KB eso no vale —el editor escribió px **y** porcentajes, y a
1440 son el mismo número (`cuerpo.spec.md` §2.1)—, así que el arquetipo nuevo
estrena `medida()`: valor + unidad, con la unidad **obligatoria** en cuanto hay
valor. La pregunta retroactiva es si los poblados arrastran la misma ambigüedad.

**Derivado, no recordado** (§sondas 9), emparejando nodo a nodo
`medidas/mono-modulos-1440.json` contra `-390.json` — 3 páginas congeladas:
edar · petróleo · **urbano**:

| nivel | n | valores NO-default distintos entre 1440 y 390 |
|---|---|---|
| sección (`mt`·`pt`·`pb`) | **8** | **0** — `−14 · 14 · 40 · 0` iguales a los dos anchos |
| fila (`pt`·`pb`) | **22** | **0** — `2 · 36 · 40 · 60 · 72 · 0` iguales |
| módulo (`mt`·`mb`) | **95** | **0** — `16 · 17 · 20 · 23 · 26 · 30 · 41 · 0` iguales |

Los únicos pares que se mueven son **los defaults** (`57.5938→50` ·
`28.7969→30` · `34.0469→30` · `37.1406→10.0469`), y el dato los **omite** por
convención.

> **Veredicto: la ambigüedad es LATENTE, no realizada.** En lo medido el editor
> no escribió ni un porcentaje, así que ningún dato guardado está mal hoy. Lo que
> un `number` no puede hacer es **expresar** el `%` que traiga una cuarta
> instancia: lo guardaría como px, sin dar error, y el defecto sería invisible a
> 1440 — exactamente el modo de fallo que KB acaba de exhibir.

**Alcance declarado: 3 páginas de las 4 construidas.** Los 8 sectores NO están
todos medidos con esta sonda, así que «0 porcentajes» es una propiedad de esas
tres, no del arquetipo.

**Por qué no se migra en esta tanda, y no es pereza:** cambiar `number` → grupo
en un tipo **poblado** exige que `mapeo`/`vuelta`, el render y `qa:cms-roundtrip`
sepan llevar la forma nueva, y eso se prueba con su round-trip, no de paso. La
razón **no** es «no se toca lo poblado» (§2d.3 ya cerró ese tabú): es que la
prueba cuesta una tanda y esta no es la suya.

**Dueño:** la tanda que toque el ritmo de SECTOR/MONOGRÁFICO por cualquier otra
razón, o la primera que mida un porcentaje escrito por el editor en esas páginas.

## ⚠ F3-1-SRCSET-KB · las imágenes de `articulos-kb` no modelan `srcset`, y es omisión DECLARADA (2026-08-10)

`modulos.spec.md` §3 censó **14 de 21** módulos `image` con `srcset` en el
original. `MODULO_IMAGEN_KB` guarda `src` + `alt` y **no** lo modela, mientras
que el grupo A sí lo hace (`imagenA`) **porque `srcset` es la causa de M-IMG**:
el censo de las 309 páginas demostró que **no es función de la imagen** —39 de
519 orígenes se sirven con `srcset` distinto según el punto de uso—.

**Por qué se deja fuera en vez de colarlo:** M-IMG está **abierta** en el ESQUEMA
(§CMS-0b) y resolverla de paso, en la tanda que estrena el arquetipo, es
exactamente cómo se fabrica una decisión sin medida. Lo que sí es defecto es no
decirlo, y por eso está esta ficha.

**Qué NO bloquea:** el Δ0 de geometría. A viewport fijo el navegador sirve una
sola variante y el alto no cambia. **Qué SÍ afecta:** el byte servido y, con él,
`qa:cmp-srcset` el día que se corra sobre estas 6 rutas.

**Dueño:** la tanda que cierre M-IMG, o la que corra `cmp-srcset` sobre KB.

**Límite declarado del instrumento:** `esDefault()` de `kb-tests.mjs` sólo
reconoce la forma «% de la fila propia», así que los 59 nodos a `34.0469` salen
**CAMPO por test B**. Eso no afirma que los escribiera un editor — afirma que el
clasificador no tiene la regla. El veredicto de la propiedad (CAMPO) no depende
de ellos.

## ⚠ F3-1-CASCARON-KB-SIN-COMPARAR · la cabecera y el pie de KB nunca se han comparado contra el clon (2026-08-10)

El cascarón de `articulos-kb` sale con **varianza cero en las 6 instancias** del
ORIGINAL, así que es plantilla y no aporta campos. Lo que **no** está medido es
si el clon lo sirve igual: `qa:c-cabecera` cubre **17 rutas y ninguna es de KB**.

> Que sean «los mismos módulos `_tb_` que el resto del sitio» es una hipótesis
> razonable, **no una medida** — y §COBERTURA ya cobró una vez que un arquetipo
> nuevo **no hereda cobertura**.

⚠ **Y la base en crudo de este arquetipo NO se puede tomar con el `h1`.** El
protocolo dice *cada arquetipo nuevo mide su base EN CRUDO una vez*, y su ancla
es el `h1`; aquí el `h1` dice `Kunak Help Center`, **está oculto en las 6** y su
`y` es 0 en los dos lados — o sea **Δ0 por construcción**, que es el contenedor
que absorbe en su forma más pura. **El ancla la tiene que elegir la tanda que
construya**, y elegirla es parte del trabajo, no un detalle.

## ⛔ DEFECTO-SUB-EDAR · el clon sirve `H2S` donde el original sirve `H₂S` — DEFECTO VIVO con dueño (2026-08-10)

> **Se saca a ficha propia porque estaba dentro de §CLASE-INLINE-PRESTADO y ahí
> se lee como pendiente de MODELO.** No lo es: **el clon pinta hoy otra cosa que
> el original**, en dos rutas dadas por verificadas desde julio. El modelo es la
> *causa*; esto es el *defecto*.

**Rutas afectadas:** `/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar`
y `/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas`.

**Los dos lados, derivados y no recordados** (2026-08-10):

| | |
|---|---|
| `<sub>` en el ORIGINAL | **41** en EDAR · **31** en petróleo (`grep -o '<sub>' corpus/fase-3-sectores/*.html`) |
| `<sub>` que el clon emite en esas rutas | **0** |
| cómo los representa `apps/web/src/lib/monografico.ts` | **8** aplanados a negrita (`{ b: "<dígito>" }`) · **25** como carácter Unicode (`₂`×16 · `₃`×5 · `₄`×4) |

> **Y las dos representaciones conviven en el mismo fichero**, a 40 líneas de
> distancia: `[{ b: "H" }, { b: "2" }, { b: "S…" }]` en la l. 585 y `"H₂S, CH₄,
> CO₂"` en la 627. Ninguna de las dos es lo que sirve el original.

**El clon SÍ sabe emitir `<sub>`** — lo hace en `monitor/InformacionProducto.tsx`,
`SolucionProfesional.tsx`, `monitor/FaqAcordeon.tsx` y dentro del `campoHtml` de
`arquetipo-a.ts`. **Lo que no puede es decirlo por `MonoInline`**, cuyo tipo es
literalmente `string | (string | {b:string})[]` (`monografico.ts:165-179`): el
único marcado que expresa es la negrita. Es §CLASE-INLINE-PRESTADO en su forma
más pura — **el renderizador no tiene la culpa, la tiene el tipo**.

**Por qué ninguna sonda lo ve:** todas comparan alturas, árbol de secciones y
anclas. **Ninguna compara la ETIQUETA del texto en línea**, y aplanar un `<sub>`
no cambia el nº de nodos de bloque. §El NIVEL al que se mide, con un contenedor
nuevo: **el nivel de la marca en línea**, por debajo de lo que ve el árbol.

⚠ **Y puede no ser sólo cosmético:** un `<sub>` tiene otro tamaño y otra línea
base, así que **cambia el ancho de la línea**. Si en algún ancho ese `li` envuelve
distinto, es un Δ de alto — el mismo mecanismo que el `<strong>` en línea
(−30.59 a 390, invisible a 1440).

**Dueño:** esta ficha. **Tanda propia, no cola de F3-1** — toca `apps/web` y por
tanto **paga su Δ0**: `MonoInline` + el render de `MonoCuerpo.tsx` +
`mapeo`/`vuelta` con **round-trip 63/63 verde antes y después**, y
`clon-base` 31/31 sin mover un píxel.

> ⚠ **NO se aplaza por «no se toca lo poblado».** Ensanchar un tipo es
> **retrocompatible** y ese tabú **no aplica** (§2d.3). Se aplaza por el coste
> del round-trip, que es una razón distinta y hay que decir cuál es.

**Precondición para cerrarla:** el barrido de las otras `inline` del repo
—derivado, no recordado— para no arreglar la instancia y dejar viva la clase por
cuarta vez.

## 📦 MIGRACION-DATO-MONOGRAFICO · las TRES improvisaciones dejan de ser irreparables al ensanchar el tipo (2026-08-10)

> **La palabra importa y por eso la ficha existe: esto es MIGRACIÓN DE DATO, no
> cambio de código.** Hoy las tres se leen como decisiones de transcripción que
> habría que revisar a mano. **No lo son: son el mismo tipo corto rodeado tres
> veces**, y en cuanto el tipo lo exprese, las tres se convierten en
> **transformaciones mecánicas y verificables** del dato ya sembrado.

Las tres, en `apps/web/src/lib/monografico.ts`, derivadas:

| # | línea | lo que hace | lo que el original tiene | al ensanchar pasa a ser |
|---|---|---|---|---|
| 1 | **585-589** | `<sub>` **aplanado a negrita** — `[{b:"H"},{b:"2"},{b:"S…"}]`, **8 casos** | `<strong>H<sub>2</sub>S…</strong>` | `{b:"H"},{sub:"2"},{b:"S…"}` — reagrupable **por regla** |
| 2 | **627 · 633 · 639 · 657 · 663 · 1037** | el mismo subíndice como **carácter Unicode**, `₂`×16 · `₃`×5 · `₄`×4 | `H<sub>2</sub>S` | `H` + `{sub:"2"}` + `S` — **sustitución de carácter a marca** |
| 3 | **276 · 622** | `kind: "tabla"` **inventado** para el `<table>` que el tipo no admitía | un `<table>` del editor | el kind se conserva; lo que cambia es que sus celdas puedan llevar marca |

> **Tres apaños DISTINTOS para la misma carencia es la firma de un tipo corto,
> no de tres decisiones.** Y es lo que hace que la migración sea segura: no hay
> que adivinar qué quiso decir quien transcribió — **el original está congelado**
> (`corpus/fase-3-sectores/*.html`, 8/8) y la forma correcta se **deriva** de él.

**Por qué NO se hace ahora:** depende del ensanchamiento de `MonoInline`, que es
§DEFECTO-SUB-EDAR y es tanda propia. **El orden es obligado**: primero el tipo y
su render con el round-trip verde, después la migración del dato.

**Criterio de «hecho» cuando llegue:**

1. **cero** caracteres Unicode de subíndice en `apps/web/src/lib/*.ts` (hoy: 25
   en `monografico.ts`, 14 en `monitor.ts`, 9 en `nav.ts`, 1 en `casos.ts` —
   **derivado**, y hay que decidir uno a uno si son marca o texto del original);
2. **cero** `{ b: "<dígito>" }` (hoy 8);
3. el nº de `<sub>` del HTML servido **iguala al del original**: 41 en EDAR y 31
   en petróleo;
4. `cms-roundtrip` **63/63** y `clon-base` **31/31** sin moverse.

⚠ **El punto 1 no es un `sed`.** Un `₂` puede ser el original escribiendo un
carácter Unicode, no una marca — y `monitor.ts` y `nav.ts` no son monográficos.
**Se decide contra el original de cada ruta, no por búsqueda y reemplazo.**

## 🧨 CLASE-INLINE-PRESTADO · `inline` en campos cuyo tipo medido es RICO — 4 instancias, y una de ellas está VIVA en pantalla (2026-08-09)

**La clase que destapó el escalón del texto**, generalizada para que no haga
falta encontrarla una cuarta vez. Acta y medida: `ESQUEMA-CMS.md` §2d.3.

> **`inline` (`editorNegrita`) es párrafo + negrita y NADA MÁS.** Prestarlo a un
> campo cuyo tipo medido admite marcado de línea **no da error de ningún tipo**:
> el esquema valida, el round-trip pasa, el typecheck compila y la página se
> sirve. Lo único que ocurre es que **el dato entra aplanado**, y a partir de ahí
> ninguna sonda puede echar de menos lo que ya no está.

| # | campo | lo medido | estado |
|---|---|---|---|
| 1 | `productos.bullets` | `<sup>` en 4 filas | ✅ cerrada (§7d) — la primera de la clase |
| 2 | **`MODULO_TEXTO` compartido** (SECTOR · MONOGRÁFICO) | **12 etiquetas en prosa**: `span×179 · sub×52 · td×32 · tr×9 · th×4 · h5×4 · div×4 · br×3 · em×1 · table×1 · thead×1 · tbody×1` | ⛔ **ABIERTA** — ver abajo |
| 3 | `articulos-kb`, módulo de texto | 7 etiquetas | ✅ cerrada — `texto-kb` = `campoHtml` (§2d.3) |
| 4 | **`blurb.descripcion`** | `p×24 · br×1 · **img×6**` | ✅ cerrada — `campoHtml`, misma tanda |

**La 4.ª se encontró barriendo, y es la más instructiva del lote:** su cabecera
en `bloques/kb.ts` afirmaba *«lo medido son `<p>` con texto, sin una sola
etiqueta fuera de ese conjunto en los 24»* **y traía al lado la regla correcta**
(*«si aparece una, se amplía el campo con la medida delante»*). El recuento
**nunca se derivó**: los 6 `<img>` estaban en `medidas/kb-recon.json` desde antes
de que la frase se escribiera. Es §sondas 9 —*un recuento afirmado de memoria se
barre antes de usarse*— sobre una cabecera que citaba «los 24» sin recorrerlos.

### ⛔ Lo que queda ABIERTO — promovido a ficha propia el 2026-08-10

> **La 2.ª instancia (el `MODULO_TEXTO` compartido) tiene su defecto VIVO en
> pantalla, y desde el 2026-08-10 vive en su propia ficha: §DEFECTO-SUB-EDAR**,
> arriba. Se sacó de aquí porque dentro de una ficha de CLASE se leía como
> «pendiente de modelo», y no lo es: **el clon pinta hoy otra cosa que el
> original** en dos rutas dadas por verificadas.
>
> La migración del dato que ese ensanchamiento habilita —las tres
> improvisaciones de `monografico.ts`— es **§MIGRACION-DATO-MONOGRAFICO**,
> también arriba, y es **migración de DATO, no cambio de código**.

**Lo que sigue siendo de esta ficha (la CLASE):** la precondición de cierre —el
barrido de las otras `inline` del repo, **derivado y no recordado**— para no
arreglar la instancia y dejar viva la clase por cuarta vez.

## ✅ F3-1-ESCALON-TEXTO · el módulo de texto compartido NO expresa lo que trae el corpus de KB — CERRADO SIN ARBITRAR (2026-08-09)

> ✅ **CERRADO EL MISMO DÍA que se abrió, y las dos salidas costeadas resultaron
> ser la pregunta equivocada.** Antes de arbitrar se preguntó **sobre qué
> POBLACIÓN se derivó el tipo compartido** y salió que se derivó sobre la
> TRANSCRIPCIÓN. Medido contra el original (`qa:texto-poblacion`, 8 páginas
> capturadas para esto): **SECTOR/MONOGRÁFICO traen 12 etiquetas fuera del tipo,
> KB trae 7.** O sea que el tipo **no se le queda corto al recién llegado:
> estaba corto para sus propios consumidores desde el principio.**
>
> **Salida aplicada:** `texto-kb` = `campoHtml` para KB (la frontera de
> `CLAUDE.md` §Dónde para el modelado), y `MODULO_TEXTO` **declarado
> infra-especificado** con ficha propia — §CLASE-INLINE-PRESTADO, arriba. Acta
> completa con su medida: `ESQUEMA-CMS.md` §2d.3.
>
> Lo que sigue debajo es el enunciado original, conservado.

**La construcción de `articulos-kb` paró aquí a propósito**, con la consigna de
la tanda: *«si la captura trae una forma que el ESQUEMA no expresa, eso es
frontera de modelo y se para con la evidencia congelada»*. Esto es su acta.

**Qué se estaba haciendo:** F3-1 (`PLAN-FASE-3.md`) construye `articulos-kb`
CMS-first — captura → seed → build → Δ0 contra el original. El bloque `blurb` y
el `gallery` que §2d.1 dejó pendientes están **medidos y escritos**
(`packages/cms-config/src/bloques/kb.ts`, migración versionada
`20260809_125718_f3_articulos_kb`, `npm run check` verde). Lo que paró es el
**módulo de TEXTO**.

**La medida, congelada en `medidas/kb-recon.json` → `veredicto.moduloTexto`**
(`npm run qa:kb-recon`, offline sobre `corpus/fase-3/`, 6/6 artículos):

| | |
|---|---|
| módulos `et_pb_text` | **85** |
| etiquetas distintas dentro | **16** |
| el inventario | `p×95 · span×50 · li×40 · h2×20 · strong×13 · ul×9 · b×9 · h3×8 · sub×7 · h1×6 · a×5 · i×4 · em×2 · h4×2 · sup×1 · img×1` |
| atributos | `style×74 · target×5 · decoding×1` |
| **fuera del tipo compartido** | **7**: `span×50 · sub×7 · a×5 · i×4 · em×2 · img×1 · sup×1` |

**La contradicción, y las dos mitades son citas:**

- §2d.1 decidió que `articulos-kb` *«CONSUME las definiciones compartidas **sin
  cambiarlas**»*, y **PD2** predijo que *«texto, imagen y botón entran»*;
- `MODULO_TEXTO` compartido tiene `bloques: BLOQUES_TEXTO` (`p`·`ul`·`claim`·
  `titular`) y sus textos son **`inline` = párrafo + negrita y nada más**.

Para **imagen** y **botón** la medida confirma a PD2. Para **texto no**: el tipo
compartido no puede expresar `span[style]`, `sub`, `sup`, `a`, `i`, `em` ni
`img`. **PD2 se midió sobre KINDS de módulo, no sobre la FORMA de sus campos**,
y ahí es donde falla — igual que HD1 acertó en la mitad de la retícula y falló
en la de los kinds.

> **Y es exactamente el `<sup>` de `productos.bullets` otra vez** (§7d): prestar
> `inline` fuera de `MonoInline` fue lo que escondió aquel `<sup>`, y aquí hay
> **7 de ellos** en un tipo que no los admite.

### Por qué NO se ha resuelto sobre la marcha

Porque la resolución **cambia una decisión escrita** (§2d.1), y este repo eso lo
hace con acta y no de paso. Las dos salidas, con su coste:

| salida | qué cuesta | qué dice el precedente |
|---|---|---|
| **A · el texto de KB es `campoHtml`** (un módulo `texto-kb` propio en `MODULOS_KB`) | un bloque más; `MODULO_TEXTO` compartido **intacto**, o sea MONOGRÁFICO no se toca | **CMS-0e** («HTML crudo primero») y **§3.1d** ya decidieron esto para el dato que viene del editor de WordPress, que es exactamente este caso. Y `CLAUDE.md` §Dónde para el modelado: *a partir del contenedor de contenido, el contenido lleva su estructura dentro y se declara RICO* |
| **B · ampliar `BLOQUES_TEXTO`** con 7 formas más | toca un tipo **poblado** (SECTOR y MONOGRÁFICO lo usan) ⇒ cubo **C**, que es lo caro | `CLAUDE.md` lo rechaza con el censo de 209: *modelar eso como bloques sería inventar un esquema para documentos que ya tienen uno* |

**La salida A es la que los documentos ya existentes implican**, y aun así **no
se aplica en esta tanda**: se escribe aquí, se decide en el ESQUEMA con su
pre-registro, y entonces se construye. Lo que NO se hace es cablearlo mientras
§2d.1 dice lo contrario.

**Dueño:** la tanda que retome F3-1. **Lo que ya está hecho y no hay que
repetir:** la captura (F3-0), el recon (`qa:kb-recon`, negativo por el `Censo`),
los bloques `blurb`/`gallery` medidos, la migración aplicada y `check` verde.

## ✅ F2-5-ESCALON-ETIQUETAS · el alta del EDITOR pasó TODAS las guardas de entrada y el RENDER murió — el escalón de la prueba final, con su hueco arbitrable (2026-08-08)

**La prueba final de F2-5 PARÓ aquí a propósito** — la consigna: *«si el alta
destapa un hueco de esquema que ningún documento arbitra, PARA con la evidencia
congelada»*. Esto es el acta del disparo, y la pregunta que deja para arbitrar.

**Qué pasó, medido y no contado:** la cuenta EDITOR (creada por el admin de la
prueba, sin acceso al repo) dio de alta `entradas-blog/guia-cms-traspaso-f25`
desde el formulario — slug, seo.title, título, fecha, categoría, cuerpo HTML —
**sin etiquetas, sin imagen destacada, sin extracto: los tres opcionales en el
esquema**. Todas las guardas de entrada la acogieron: el esquema validó, el
hook registró el slug, el webhook disparó con la sesión del editor (`disparos
1 · motivo "entradas-blog:guia-cms-traspaso-f25 create"`). Y el build murió
prerenderizando la página nueva: `TypeError: Cannot read properties of
undefined (reading 'length')`, exit 1 a los 35.91 s.

**La contención de F2-4 funcionó en su primer fallo real:** nada se promocionó
— home 200, `/guia-cms-traspaso-f25` 404, el build anterior siguió servido, y
`GET /estado` conservó `ultimoFallo` con la cola entera del build (lo que ve el
editor). Ficheros: `medidas/f25-prueba-final-ESCALON-estado-publicador.json` ·
`medidas/f25-prueba-final-ESCALON-diagnostico.json`.

**El hueco, localizado: tres piezas documentadas, cada una coherente, cuya
COMPOSICIÓN mata el render — y ningún documento arbitra la composición:**

| pieza | qué dice |
|---|---|
| `mapeo.mjs:501` («LA LISTA VACÍA», decisión escrita) | un `hasMany` sin filas proyecta **`undefined`** — Payload no distingue «vacío» de «ausente» |
| `types/kunak.ts:394` | `etiquetas: TerminoA[]` **no-opcional** — con su comentario diciendo «post_tag — **0..n**»: el 0 declarado en prosa y negado en el tipo |
| `[slug]/page.tsx:163` | la plantilla se fía del tipo: `entrada.etiquetas.length` sin guarda |

**Por qué no se vio antes:** las 7 entradas transcritas (de 149) traen TODAS
etiquetas — el caso «sin etiquetas» estaba **SIN PROBAR**, y *sin probar no se
cablea* vale también para un tipo no-opcional.

**El lazo diagnóstico, cerrado con UNA variable:** el editor pasó la fila a
BORRADOR y el siguiente build **pasó y promocionó** (38.29 s, 31 rutas, home
200) — misma DB, mismo código; publicada falla, borrador pasa. El elemento era
exactamente esa fila.

**Lo que hay que medir ANTES de arreglar, y por eso se para:** qué renderiza
**el original** en una entrada sin etiquetas (WordPress las permite; ¿cuáles de
las 149 no tienen?). Sin esa medida, cualquier arreglo —guarda en la plantilla,
`[]` en la proyección, `required` en el esquema— es inventar el contrato. Las
tres salidas tienen costes distintos: la guarda en plantilla decide una
fidelidad no medida; el `[]` en la proyección rompe la decisión escrita de «LA
LISTA VACÍA» y a `qa:cms-roundtrip`; el `required` impondría al editor un dato
que el original no exige. **Es una decisión de ESQUEMA con medida previa, no un
parche.**

**Estado al parar:** entrada 71 en borrador (**semilla de documentación** del
hueco — se queda, con dueño: esta ficha); usuarios de prueba borrados (DB a 0;
el primer alta real la hace el propietario); la segunda mitad de la prueba (el
producto) **no se corrió**. Y el alcance de la clase queda anotado: el mismo
patrón `campo opcional ⇒ undefined ⇒ plantilla sin guarda` puede existir en las
otras familias — se barre cuando el arbitraje decida la dirección, no antes.

### ✅ CERRADA 2026-08-08 — arbitrada CON la medida delante, y la contradicción imputada al tipo NO existía

**PASO 1 · lo que faltaba, medido sobre el ARCHIVO** (`npm run qa:escalon`,
negativo 5/5, congelada en `medidas/escalon-etiquetas.json`). Las 149 capturas
del corpus llevaban la respuesta desde el 2026-08-04 — §sondas 8b otra vez: *el
suelo de una pregunta no vive sólo en la campaña que la persigue*.

| pregunta | medido |
|---|---|
| ¿cuántas de las 149 sin etiquetas? | **8** — el caso es REAL, no sólo legal |
| ¿qué emite el original ahí? | **OMITE** el `<span class="case-tags">`. **Una sola forma en las 8**: el `div.case-taxonomies` sigue con la categoría sola |
| ¿el rótulo se deriva del número? | **141/141** — 63 singular · 78 plural |

**PASO 2 · el arbitraje, y las dos piezas que NO ceden:**

> **`types/kunak.ts:394` no cede porque la contradicción imputada NO EXISTE.**
> La ficha decía *«el 0 declarado en prosa y negado en el tipo»*. Un array
> **no-opcional de longitud 0 ES «0»**: el tipo dice «la clave está siempre, la
> lista puede estar vacía», que es exactamente lo que el original hace. `0..n` y
> `TerminoA[]` **concuerdan**. La medida no dejó la contradicción en pie: la
> disolvió.

> **`[slug]/page.tsx:163` no cede porque YA es la fidelidad medida.** El
> original omite (8/8) y `etiquetas.length > 0 &&` es justo eso. Un `?.` ahí
> toleraría un valor que el tipo prohíbe: cerraría **la instancia** y dejaría
> vivas las otras 34 rutas de lista — el arreglo falso de manual.

**Cede `mapeo.mjs`, y no por borrado sino por ESTRECHAMIENTO a donde se
derivó.** La regla vieja tenía las dos mitades ciertas y la conclusión no se
seguía: *«0 arrays vacíos explícitos en 46 filas»* dice que la preimagen es
única **en ese dominio**, no que «ausente» valga para todos los campos — y el
dominio eran 7 entradas de 149. Regla nueva, en `ESQUEMA-CMS.md` §7e:

> **una lista vuelve `[]`, salvo que el campo declare `vaciaEsAusente: true`.**

El discriminador **se deriva de la ida** (40 listas recorridas · 35 siempre
presentes · **5 omitibles**), y las 5 coinciden con las 5 que el tipo medido
declara opcionales: el invariante *opcional en el tipo ⟺ omitible en el dato* se
cumple **40/40**. Guarda: `qa:cms-decl` con su cuarta declaración en las dos
direcciones (negativo **8/8**), donde `vacia-es-ausente-muerta` **reproduce el
escalón** — y es la mitad que ninguna otra sonda caza.

**Y la prueba de EFECTO, medida y no leída en el diff** (§dos pasos, D4): el
cambio es **NO-OP sobre todo lo medido** —`qa:cms-roundtrip` 63/63 y
`qa:cms-lectura` 63/63 sin moverse— porque para las 35 la rama no se ejecuta
nunca. Proyectado el caso del escalón: `etiquetas: []` ⇒ `[]`, la plantilla
sobrevive al `.length`; y el control de la otra rama, `casos.galeria: []` ⇒
sigue **AUSENTE**.

⚠ **Y una corrección de estado que hay que decir: la entrada 71 YA NO ESTÁ.** La
DB traía **7 entradas-blog** al empezar esta tanda, o sea sólo las sembradas: la
semilla del escalón se perdió en algún reseed entre tandas, pese al *«no la
borres»* del HANDOFF. **No cambia el arbitraje** —la medida que lo decide es el
corpus, no la fila— pero sí obliga a **recrear el caso** en la prueba final en
vez de reutilizarlo. Es la §regla 5 en su forma general: *lo que devuelve el
árbol a un estado anterior se lleva por delante lo no commiteado*, aplicado a la
DB, que no está en git en absoluto.

## 📋 CASOS LEGALES NUNCA OBSERVADOS · el inventario, con número (2026-08-08, F2-5 PASO 3)

**La generalización del escalón, y lo que evita repetirlo alta a alta.**
§F2-5-ESCALON-ETIQUETAS costó una fase parada por una frase: *el clon se calibró
con 7 entradas de 149, y las 7 traían etiquetas*. El campo admitía vacío, el
original lo ejerce 8 veces, y **el render nunca lo había renderizado**. No es un
fallo de `etiquetas`: es **la FAMILIA DE CALIBRACIÓN aplicada al ESQUEMA en vez
de a las páginas**, y ahora tiene un generador nuevo —**cada alta desde el
admin**— así que la pregunta hay que poder repetirla.

Instrumento: **`npm run qa:nunca-vistos`** (negativo 4/4), congelada en
`medidas/casos-nunca-vistos.json`.

> **La salida es una lista con número, NO un juicio.** Un caso sin ejercitar no
> es un defecto: es un camino de render que no ha corrido. Puede estar
> perfectamente soportado —muchos lo están— o matar el build como mató el de la
> 40.ª. Por eso el código de salida **no** depende de cuántos haya, sino de que
> la sonda haya podido mirar.

### El número

| | |
|---|---|
| casos que el esquema admite | **296** |
| ejercitados por las 46 filas sembradas | **88** |
| **SIN EJERCITAR** | **208** |

Reparto por forma del caso, y no valen lo mismo:

| forma | n | qué es |
|---|---|---|
| **ausente** | 128 | un campo sin `required` que ninguna fila omite. El más peligroso: el tipo medido puede prometer que sí está — **es el escalón, literal** |
| **vacía** | 43 | una lista con cero filas. **LA FORMA DEL ESCALÓN**, y desde ESQUEMA §7e **las 43 tienen respuesta decidida**: 43 vuelven `[]` por defecto, 0 por declaración. Guardada en las dos direcciones por `qa:cms-decl` |
| **valor** | 37 | una opción de `select` o de `checkbox` que ningún dato trae |

### Las tres cosas que hay que leer con cuidado

1. **El alcance es el SEED, no el original.** La cobertura se mide sobre los 9
   catálogos (46 filas) porque es el dato con el que el render está calibrado.
   O sea que el inventario dice *«el render no ha visto esto»*, **no** *«el
   original no lo tiene»* — y ésa es exactamente la distinción que enseñó el
   escalón: `etiquetas` vacías existen **8 veces en el original** y **cero en el
   seed**.
2. **«Sin ejercitar» ≠ «sin decidir».** Los 43 `vacía` están sin ejercitar y
   **todos tienen su respuesta escrita y guardada**. Confundir las dos cosas
   convertiría un inventario en una lista de pánico.
3. **El detector sobre-casaba y se corrigió antes de publicar el número**: un
   campo ausente **con `defaultValue`** SÍ ejercita ese valor —el dato medido
   omite lo que coincide con su defecto— y contarlo como «nunca visto» marcaba
   justo el valor que ven casi todas las filas. Eran **5 casos** de más (213 →
   208). Es §sondas 4 en su tercera cara: un número plausible de más.

### ⚠⚠ CORRIGE AL ALCANCE (2026-08-09, F3-1): «296 casos que el esquema admite» ERAN LOS DE LAS COLECCIONES CON CATÁLOGO

**Cómo se destapó, y es el mejor destapador posible: se le añadió trabajo y el
número no se movió.** `articulos-kb` ganó tres campos y **dos bloques nuevos**
—`blurb` con `reticula` (3 valores), `alineacion` (2), imagen y descripción
opcionales; `gallery` con su array— y el titular salió **296 · 208, idéntico al
carácter**. No porque la colección no admita casos: porque **el universo se
construía recorriendo `CATALOGOS`**, y `articulos-kb` no tiene catálogo en
`src/lib`. **La colección entera era invisible al instrumento.**

> **Es la clase de siempre —*no encontrar nada y no mirar nada dan la misma
> salida*— en su forma más cara: el DENOMINADOR no era el que el titular
> decía.** «296 casos que el esquema admite» son los casos de las colecciones
> **con catálogo**, y el número se venía citando como si fuera del esquema. Es
> §El NIVEL al que se mide aplicado a la unidad de una cobertura, otra vez.

**Lo medido al declararlo: 111 casos en 8 colecciones que el instrumento NO
puede ejercitar**, y el reparto importa más que el total:

| colección | casos | por qué no se puede ejercitar |
|---|---|---|
| `media` | 61 | no es un catálogo: se deriva de los `upload` de las demás |
| **`articulos-kb`** | **37** | **su dato NACE en el CMS (F3-1)**: se siembra desde `corpus/fase-3/`, no desde `src/lib` |
| `usuarios` | 11 | infraestructura (CMS-0f), sin lado medido |
| `categorias-recursos` · `slugs` | 1 + 1 | taxonomía derivada · registro del plano |

**Y NO se suman al 208, a propósito.** Son dos preguntas distintas: los 208 son
casos que **el seed podría ejercitar y no ejercita**; estos 111 son casos que el
seed **no puede ejercitar en absoluto**, porque no hay filas que recorrer.
Fundirlos movería un número congelado que hay actas citando (regla 5) y además
mezclaría dos cosas que se arreglan por caminos distintos.

**El arreglo es de alcance, no de recuento:** el instrumento ahora recorre
**todas** las colecciones de la config, y una que no tenga catálogo **y no tenga
razón escrita TIRA**. Las internas de Payload se reconocen por prefijo
(`payload-*`) y no se enumeran — una lista a mano de las internas de una
dependencia envejece con cada `npm update`. La declaración viaja **dentro de la
congelada** (`fueraDelUniverso`), para que un número citado de ahí traiga al lado
lo que su instrumento no podía mirar.

**Consecuencia para F3-1:** los 37 de `articulos-kb` son su cola de trabajo, y
**ninguno está ejercitado todavía** porque el seed está parado en
§F3-1-ESCALON-TEXTO. Los que la medida del original ya dice que existen —y que
por tanto el render va a ver en cuanto se siembre— son: `blurb` **sin imagen**
(6 de 36), `blurb` **sin descripción** (12 de 36), y `reticula: "ninguna"` (3 de
36). Ésos no hay que inventárselos: **están en el corpus**.

### Y lo que el inventario NO puede contestar

Un caso sin ejercitar no dice si el render lo soporta. Para saberlo hay que
**ejercitarlo**, y eso ya tiene instrumento: `qa:f25-final` da de alta desde el
admin y construye. Los 208 son la **cola de trabajo** de esa sonda, no su
veredicto. Prioridad natural: los `ausente` cuyo tipo medido es **no-opcional**,
que es la firma exacta del escalón — derivarlos pide cruzar el AST de
`types/kunak.ts` con la config, que hoy `qa:cms-campos` hace por RUTA pero no
por OPCIONALIDAD. **Dueño: esta ficha.**

## 🧨 CLASE · UN INSTRUMENTO ANCLADO AL SEED — el BARRIDO, 4.ª instancia (2026-08-08)

**El encargo de F2-5 lo pidió por su nombre:** *«comprueba que ninguna otra
guarda sigue anclada al SEED en vez de a la DB… es la tercera instancia de la
clase, así que barre las demás en vez de arreglar ésta»*. Esto es el barrido, y
salió una cuarta.

**Derivado, no recordado** (§sondas 9): `grep -ln "catalogos.mjs\|src/lib/\|arquetipo-a"
scripts/qa/*.mjs` ⇒ **16 sondas**. El discriminador no es *«lee el seed»* —
muchas deben— sino:

> **¿cuál es el OBJETO de la sonda?** Si compara contra el **dato medido**, el
> seed **es** el ancla correcta: la medición no envejece. Si juzga la **salida
> del build**, el ancla es la **DB**, porque es de donde el build lee desde F2-3
> (8 familias: casos · documentos-cientificos · entradas-blog · faqs ·
> monograficos · productos · sectores · terminos-kunakpedia).

| reparto de las 16 | veredicto |
|---|---|
| `cms-campos` · `cms-decl` · `cms-lectura` · `cms-roundtrip` · `cms-teaser` · `cms-arquetipos` · `media-colision` · `t4b-bloque` (8) | **ancla correcta** — su objeto ES el dato medido |
| `cmp-srcset` · `media-poblaciones` · `solutions-seo` · `tree-todos` (4) | **no leen el seed** — sólo lo nombran en comentarios |
| `slugs` (1) | ya corregida — 3.ª instancia, pre-vuelo de la 40.ª |
| **`tipo-hoja` (1)** | ⚠ **4.ª INSTANCIA — corregida en esta tanda** |
| `clase-rango` (1) | ⚠ **5.ª, más débil — ficha abajo, sin corregir** |

### ⚠ La 4.ª: `tipo-hoja` tenía DOS ejes con DOS anclas, y los dos leían el seed

Lo que la hace vale la pena escribir es que **las dos anclas conviven en el mismo
fichero**, así que «esta sonda lee el seed» no es ni verdadero ni falso:

| eje | su OBJETO | ancla correcta |
|---|---|---|
| tipo de hoja | *¿puede el esquema expresar lo que el dato MEDIDO decía?* | **el SEED** — un producto nuevo del admin no es una medición |
| **`href`** | *¿emite el build la ruta a la que apunta este href?* | **la DB** — cuenta todo producto que el build renderiza |

El eje `href` sacaba sus filas de `catalogos.get("productos")`. Con DB == seed la
discrepancia es **invisible**; la destapa el alta de un producto desde el admin,
que es exactamente el caso que F2-4 dejó escrito (*«publicar NO multiplica el
caso, dar de alta productos desde el admin sí»*) y **la mitad de la prueba final
que nunca corrió**.

**Corregido**: el eje lee la DB con el mismo filtro que el build
(`estado=publicado`, derivado de si la colección tiene el campo). Medido: **9/9
→ 10/10** con el alta de la prueba dentro, 0 defectos. Y el reparto que deja, que
no se puede fusionar:

> **el DEFECTO se juzga sobre todos los productos que el build renderiza; la
> COINCIDENCIA con el dato medido, sólo sobre los que tienen dato medido.** Un
> producto del admin no puede «coincidir» con nada — contarlo como que coincide
> es la regla del cero.

Guardas nuevas, las dos por si el ancla nueva deja de mirar: `href-sin-db` (0
productos ⇒ error, no «0 defectos») y `href-medido-ausente` (un producto medido
que la DB no tiene ⇒ error, no verde por omisión). **El listón NO sale de
`filas.length`** —derivarlo de la lista que se itera es no tener listón— sino de
que todo producto medido siga en la DB. Negativo **10/10**.

### La 5.ª, más débil, y por qué se ficha en vez de arreglarse

`clase-rango` deriva su ALCANCE del `prerender-manifest` (correcto) pero
**clasifica** qué `/sectores/*` es MONOGRÁFICO leyendo los slugs de
`src/lib/monografico.ts`. Un monográfico dado de alta desde el admin caería en la
MUESTRA en vez de en el CONTROL.

**Es instancia de la clase y a la vez la más benigna de las cinco**, y conviene
decir por qué: `clase-rango` compara el clon contra **el original vivo**, y un
monográfico creado desde el admin **no existe en kunakair.com** — la corrida
moriría antes por el 404 del lado del original. O sea que la mala clasificación
no puede llegar a producir un veredicto en falso, sólo un error confuso.

**Dueño:** esta ficha. **Coste del arreglo:** leer los slugs de la DB, lo que le
añade a `clase-rango` un requisito de Postgres que hoy no tiene — y es una sonda
de rango, que se corre contra el original en sesiones donde el CMS puede no estar
levantado. Se arregla cuando se toque `clase-rango` por otra razón; **no antes**,
porque el cambio cuesta más de lo que compra.

## 🧨 CLASE · UN SERVIDOR AJENO EN EL PUERTO NO SE DISTINGUE DEL TUYO (2026-08-07)

**Dos instancias en la misma tanda, y la segunda ya tenía la solución escrita al
lado**, que es lo que la convierte en clase en vez de anécdota.

> **`spawn(..., { shell: true })` + `p.kill()` mata el SHELL y deja vivo el
> proceso.** En Windows no hay grupo de procesos que matar, así que `npm run
> start` y `node publicador.mjs` sobreviven a la sonda que los lanzó. La corrida
> siguiente pide el mismo puerto, **recibe `200 OK`** y mide el estado de otro
> proceso — con su `.next`, su DB y su contador de builds.

| # | sonda | qué midió de más |
|---|---|---|
| 1 | `qa:publicar` | `builds: 2 · disparos: 4` **antes de su primer disparo** — era el publicador de la corrida anterior |
| 2 | `qa:programada` | se quedó colgada hablando con un `next start` huérfano en `:3187` |

**Es la §causa común de `CLAUDE.md` con un contenedor nuevo: el PROCESO al otro
lado del puerto.** Un `200 OK` prueba que *algo* escucha, no que sea lo que
acabas de lanzar — exactamente igual que un `Δ0` prueba que dos números
coinciden, no que midan lo mismo.

**Las dos mitades del arreglo, y hacen falta las dos:**

1. **Identidad.** El servidor publica su `pid` (y su `dist`) en `/estado`, y
   quien lo levanta **exige que sea el suyo**. Sin esto, la corrida no puede
   saberlo;
2. **Muerte de verdad.** `iniciarClon()` de `lib.mjs` ya lo tenía resuelto desde
   julio —**puerto libre pedido al sistema** y `taskkill /T` sobre el árbol—, y
   la sonda nueva se escribió un servidor a mano en vez de usarlo. La segunda
   instancia se arregló **borrando código**, no escribiéndolo.

> **La regla operativa: una sonda no levanta servidores a mano.** Si necesita el
> clon, `iniciarClon()`. Si necesita otro proceso, **sin `shell`** y con
> comprobación de identidad. Y si aparece un tercer caso, la solución ya existe:
> búscala antes de escribirla.

## 🧨 CLASE · UN NEGATIVO ANCLADO A ALGO QUE EL PROPIO TRABAJO MUEVE SE AUTO-INVALIDA (2026-08-06)

**Tercera instancia en dos tandas, y las tres con el mismo daño: el negativo se
pone rojo *porque el trabajo avanzó*, y ese rojo no dice qué pasó.** Lo que
cambia entre ellas es **a qué estaba anclado**, y por eso conviene enunciarla una
vez en general:

> **Un test en negativo compara contra un ANCLA. Si el ancla es algo que la
> propia tanda modifica —el estado del build, una lista de rutas, o el
> CONTRATO— el negativo deja de falsar sin dejar de correr.** Y su salida no
> distingue «la sonda ya no caza» de «el proyecto cambió»: son el mismo rojo.

| # | ancla | qué la movió | cómo se vio |
|---|---|---|---|
| 1 | `html-f23-base.json` (la línea base de la FASE) | migrar una familia con desviación deliberada | el negativo del instrumento enrojecía por 4 rutas que **no pueden** coincidir |
| 2 | `startsWith("/faqs/")` (una lista de rutas a mano) | cada familia migrada acumula renumeración RSC | `solo-reparto` pedía un estado del build que ya no existe ⇒ **insatisfacible**, 9/11 sin que nadie rompiera nada |
| 3 | **el CONTRATO** — qué nivel es la PUERTA | declarar el 2º volátil movió la puerta de `visible` a `visibleSinChunks` | `visible-alterado` saboteaba el nivel viejo ⇒ **exit 0 esperando 1** |

**La tercera es la peor de las tres y hay que saber por qué:** las dos primeras
se arreglan **derivando el ancla** (medir la base al empezar; derivar la lista en
vez de escribirla). La tercera **no tiene ancla que derivar**: el contrato es una
decisión, y cuando cambia, *todo falsador que apuntara al nivel viejo deja de
falsar*. No hay derivación que lo evite.

> **Lo único que la caza es correr el negativo ENTERO en la misma tanda que
> cambia el contrato** —`CLAUDE.md` §sondas 3, corolario— y **leer el rojo como
> lo que es**: no «relaja la expectativa», sino «apunta el falsador a la puerta
> nueva». La diferencia entre las dos lecturas es exactamente la diferencia entre
> tener guarda y no tenerla.

Las tres salieron a la luz porque el negativo se corrió **antes de tocar nada**
(el control primero). Sin ese hábito, la 3 se habría leído como «la sonda sigue
verde» — que es literalmente lo que decía.

## 📐 F2-3-CHUNK · el SEGUNDO volátil declarado de `html-cmp`, y en qué se diferencia del primero (2026-08-06)

**Lo destapó migrar `productos`: 11 rutas con el `visible` distinto y el
contenido idéntico** — entre ellas un caso que **ni siquiera monta el componente
tocado**. Diagnóstico tomado contra el build inmediatamente anterior y con
`visibleDe` (la función de la propia sonda, no una copia):

```
             visible            igual   igual tras normalizar <CHUNK>
home      136664 → 136664       false   TRUE
sector     96687 →  96687       false   TRUE
lindano    60873 →  60873       false   TRUE
```

Toda la diferencia estaba en `<script src="/_next/static/chunks/2xiiasx10lkh8.js">`
→ `0la1r4byhiv3d.js`. **Causa real y deseada:** `ProductosTabs` es un componente
**cliente** y dejó de importar `src/lib/products.ts`, así que su chunk cambió de
contenido y con él su nombre. El bundle de la home **ya no lleva el catálogo
dentro**.

**Por qué es volátil declarable:** el original **no emite chunks de Next**
(`qa:rsc-original`, 4 arquetipos, 0 con carga de Next), así que no traslada
ninguna fidelidad. Mismas cuatro guardas del `BUILD_ID`: patrón **anclado a un
prefijo literal**, **contado** (`nChunks`), **los dos hashes guardados**
(`visible` y `visibleSinChunks`) y **fracción acotada** (medido: 0.12 %).

> ⚠ **Y la diferencia con el `BUILD_ID`, que es la que impide borrarlo sin más:
> el `BUILD_ID` cambia en TODO build; el nombre de chunk cambia SÓLO si el bundle
> cliente cambió.** Normalizarlo a secas **borraría una señal real**. Por eso no
> se borra: una ruta así **no se reporta como idéntica** — sale en su propia
> categoría `bundle`, contada y nombrada.

**Falsadores** (`qa:html-cmp-neg`, hoy **13/13**, era 11/11): `solo-bundle`
(verde y contado) · `chunk-ensanchado` (un patrón que además se coma
`class="…"` ⇒ VOLÁTIL UBICUO, exit 2) · y `visible-alterado` **reapuntado a la
puerta nueva** — ver la CLASE de arriba.

**⚠ Lo que NO se puede adjudicar contra la base de la FASE, y la sonda lo dice
ruta a ruta:** `html-f23-base.json` es anterior a este nivel y **no se
re-congela**. Contra ella las 11 siguen saliendo DISTINTAS con el aviso
*«la base no trae `visibleSinChunks`: NO se puede descartar que sea sólo el
nombre de chunk»*. Su adjudicación viene de `medidas/html-f23-prod-base.json`,
tomada del build inmediatamente anterior **con el nivel puesto**.

## ⚠ F2-4-CHUNK-CSS · la máscara del 2.º volátil cubre `.js` y NO `.css` (2026-08-08)

**`qa:html-cmp` contra `html-f24-base.json` da 31 de 31 rutas con el marcado
VISIBLE distinto. NO es una regresión, y tampoco es «el instrumento comparando
dos cosas distintas»: es un volátil YA DECLARADO al que le falta un tipo de
fichero.**

⚠ **Y el 100 % obligaba a dudar del comparador antes que del clon** (§sondas 4,
complementario). Se reconstruyó a mano, que es lo que esa regla pide:

| paso | resultado |
|---|---|
| ¿es el instrumento? | **no.** `visible` es idéntico en **tres** congeladas anteriores (`html-f23-prod-operacion`, `html-f23-prod-despues`, `html-f24-base`) y estable entre **cargas** y entre **dos builds** distintos de HEAD |
| ¿qué cambió, en TEXTO? | se construyó `ec5fbf3` aparte y se compararon los **33 HTML prerenderizados del disco** (sin servidor, para que el desajuste servidor/`.next` no pudiera entrar): **32 de 33 difieren en UN token de ~795, y en las 32 es el nombre del fichero CSS.** `bytes` idénticos. **Cero «otra cosa»** |
| ¿cambió el CSS, o sólo su nombre? | **cambió: 92 442 → 92 536 = +94 B.** Son las dos utilidades nuevas de la cinta de la preview: `.bg-\[\#111\]{background-color:#111}` (36) y `.leading-\[22px\]{--tw-leading:22px;line-height:22px}` (52) |
| ¿pueden tocar a las 31? | **no.** Son selectores de clase **autoconfinados**, y `grep -rl` sobre `apps/web/src` dice que las usa **sólo** `vista-previa/[slug]/page.tsx`. Corroborado aparte: `qa:clon-base` da **Δ0 en las 31 a 1440 y a 390** |

> **Veredicto: no es regresión.** Es lo que cuesta añadir una ruta que estrena
> dos utilidades: la hoja de estilos es **compartida**, así que crece para todos
> y su nombre —que es función del grafo de módulos— cambia en todas las páginas.

**La grieta del instrumento, que es lo que queda abierto.** `CHUNK_PATRON` vale
`\/_next\/static\/chunks\/[A-Za-z0-9_-]+\.js`: **sólo `.js`**. Así que
`visibleSinChunks` —la puerta real— **no puede distinguir un CSS renombrado de un
CSS con otro contenido**, y las dos cosas salen igual de rojas.

**NO se ensancha la máscara en esta tanda, y la razón es la que el propio
`html-cmp` escribe:** meter algo en la normalización *«para que la sonda deje de
protestar»* es la trampa que sus cuatro guardas existen para impedir. Ensanchar a
`.css` mandaría **todo cambio de hoja de estilos** al cubo `solo-bundle` —verde y
contado—, y una hoja de estilos **sí** es fidelidad: es donde viven los píxeles
que 48 sondas midieron contra kunakair.com. El chunk JS puede ir ahí porque su
contenido no pinta; el CSS no.

**Salida propuesta, para quien la coja:** un nivel **`css`** propio y contado
—hash del CSS *resuelto* (el contenido del fichero, no su nombre)— de forma que
un renombrado salga verde y un cambio de reglas salga rojo **con el diff de
selectores**. Es un nivel nuevo, no una máscara más ancha.

**Criterio de «hecho»:** `qa:html-cmp` distingue los dos casos sobre esta misma
pareja de builds (renombrado ⇒ verde · +94 B de reglas ⇒ rojo con las dos
selectores nombrados), y su negativo lo prueba con los dos falsadores.
**Mientras tanto**, la base con la que se compara es `html-f24-verif.json`
(2026-08-08), y un rojo de `html-cmp` en `visible` **hay que adjudicarlo a mano**
como se hizo aquí: no se puede leer como regresión sin mirar el token.

## ⚠ F2-3-HREF-DERIVADO · 6 de 9 productos apuntan a una ruta que el build NO emite (2026-08-06)

**Consecuencia declarada de §4** —*«dentro del CMS los 24 son documentos, así que
su ruta es local por definición»*—, con su número por primera vez.
`npm run qa:tipo-hoja`, eje `href`:

| | n |
|---|---:|
| productos con lado medido | 9 |
| cuyo `href` **cambia de valor** al pasar por el CMS | **6** |
| que apuntan a una ruta que **el build no emite** | **6** |

Ejemplo: `https://kunakair.com/es/cartuchos-inteligentes/amoniaco/` →
`/cartuchos-inteligentes/amoniaco`. El dato medido aplica la **regla de rutas
locales** (`CLAUDE.md`) —local si está clonado, original si no—; el esquema no
guarda `href` y la vuelta lo compone **siempre local**.

**⚠ Y no lo ve ninguna otra sonda, que es la parte que importa:**

- **`qa:enlaces` no**, porque recorre `<a href>` del marcado y estos `href`
  **no llegan al marcado**: `ProductosTabs` sólo sirve el panel del producto
  **activo**, y el activo es `monitor-calidad-aire` en las 10 instancias;
- **`html-cmp` no**, porque su puerta es el marcado visible. Estos `href` viajan
  en la **carga RSC** como props del componente cliente — que es el nivel
  declarado INFORMATIVO.

Se ve en su **disparador**, y con el número exacto: `bytesCarga` bajó **−24 por
cada producto referenciado** en las 3 rutas de caso (−24 · −24 · **−72** con tres
cartuchos), que es exactamente el largo de `https://kunakair.com/es` más la barra
final. El cuarto disparo es `/` (**+3759**, `nFilas 120→109`): el catálogo pasó
del chunk cliente a la carga RSC al dejar de ser un valor por defecto del
componente y pasar a ser prop del servidor.

**Estado: DECLARADA, no arreglada, y las dos salidas son de ESQUEMA** — (a)
reabrir §4 para guardar `href` verbatim, o (b) aplicar la regla de rutas locales
en el render con una lista derivada de las rutas emitidas. Las dos son decisión
de modelado, no trabajo mecánico de F2-3. **No bloquea**: hoy ninguna de las 6
rutas se enlaza desde el marcado servido.

### ⚖ ADJUDICADA (2026-08-07, F2-4): salida (b), y el dueño es F2-5

**El encargo de F2-4 pedía adjudicarla con este argumento: *«6 de 9 productos
apuntando a rutas no emitidas es un 404 con `dynamicParams = false`, y publicar
multiplica el caso»*. La primera mitad es cierta; la segunda hay que
corregirla, y la corrección cambia la prioridad, no la decisión.**

> **Publicar NO multiplica el caso: lo deja donde está.** F2-4 no toca ni
> `ProductosTabs` ni el dato de `productos`. Lo que multiplicaría el caso es
> **dar de alta productos desde el admin**, que es F2-5.

⚠ **Y el alcance de la ficha se re-derivó antes de adjudicar (regla 9), porque
el primer intento salió mal en las dos direcciones.** Contra el build de hoy:

| pregunta | derivación | resultado |
|---|---|---|
| ¿aparece en el build? | `grep -rl "cartuchos-inteligentes" .next/server/app` | **67 ficheros** — la primera versión de esta ficha escribió «0», y era falso |
| ¿en cuántas RUTAS, en su forma local? | `grep -rlo '"/cartuchos-inteligentes/' … --include='*.html'` | **2**: `case-studies/distrito-baja-emision-rio-de-janeiro` y `casos-de-exito/control-…-des-moines-iowa` |
| ¿como `<a href>` del marcado visible? | `grep -rho 'href="/cartuchos-inteligentes…'` | **cero.** Los `href` visibles a cartuchos apuntan **al original** (`https://kunakair.com/es/cartuchos-inteligentes/…`), que es lo correcto |

**O sea que los 67 ficheros son casi todos el `href` BUENO** —al original, en el
marcado— y la forma local defectuosa vive en la **carga RSC de 2 rutas**, tal
como la ficha original decía. La cifra de «6 de 9 productos» sigue siendo del
**dato**, no de las rutas servidas: **2 rutas afectadas hoy, 0 enlaces rotos
visibles**. Es el mismo error que la ficha ya nombraba —*el panel que no se
sirve*— cometido esta vez **al comprobarlo**: un `grep` sin distinguir la forma
local de la del original cuenta las dos y da un número que no significa nada.

**Se adjudica la salida (b) —componer el `href` contra las rutas que el build
emite— y no la (a), con tres razones y una es nueva de esta tanda:**

| | por qué |
|---|---|
| (a) guardar `href` verbatim | **congela una decisión de ENTORNO en el dato.** El `href` bueno depende de *qué está clonado*, que cambia cada tanda; guardarlo obliga a re-migrar los 24 productos cada vez que se clona una página. Es la regla de rutas locales convertida en contenido |
| **(b) derivar en el render** ← | la lista de rutas emitidas **ya existe y ya se deriva**: es de donde `qa:enlaces` y `qa:slugs` sacan la suya. No hay nada que mantener |
| lo nuevo de F2-4 | **el build es el único momento en que se sabe qué rutas existen** (CMS-0c · §4), y (b) se resuelve **ahí**. Con rebuild-por-webhook eso no es una restricción: es exactamente cuando toca |

**Dueño: F2-5**, y con su razón: la salida (b) hay que escribirla en el render y
**su guarda tiene que ver el panel que hoy no se sirve** — o sea `qa:tipo-hoja`
extendida, no `qa:enlaces`. Y F2-5 es la fase en la que alguien va a dar de alta
un producto desde el formulario, que es cuando el 404 pasa de latente a real.

**Criterio de «hecho», escrito ya para que no se negocie luego:** los 9 `href`
compuestos contra `rutasEmitidas()`, **cero** apuntando a una ruta que el build
no emite, y un falsador que meta un `href` a ruta inexistente y **falle**.

### ✅ CERRADA (2026-08-08, F2-5 PASO 0) — por la salida (b), y con un dato que la ficha no esperaba

**La regla vive en el render y el dato no cambia.** `devuelveProducto` sigue
componiendo el CANDIDATO local (la vuelta sigue pura, el round-trip intacto);
el proyector de `apps/web` le aplica después la regla de rutas locales de
`CLAUDE.md` (`segunEntorno`, en los DOS caminos: colección y embebido), con la
lista de construidas **derivada del árbol de `app/`**
(`@kunak/cms-config/entorno` · `rutasConstruidas`), no de una lista a mano.

**Por qué del árbol y no del manifiesto, dicho porque la consigna decía
«manifest»:** el `prerender-manifest` es la SALIDA del build y esta regla corre
DENTRO del build que lo produce — con el publicador construyendo en un `dist`
limpio, a la hora de renderizar no hay manifiesto. El árbol de `app/` es la
ENTRADA de la que el build deriva sus rutas estáticas, y el lazo contra el
manifiesto real lo cierra `qa:tipo-hoja` (eje `href`, ahora VEREDICTO y no
aviso) después de cada build: si árbol y manifiesto divergen, rojo.

**El criterio, medido:** `qa:tipo-hoja` **9/9 · 0 defectos** — 3 locales
emitidas, 6 al original con la forma exacta — **y 9/9 COINCIDEN CON EL DATO
MEDIDO**: la regla reconstruye byte a byte los `href` que el catálogo traía
(el dato ya cumplía la regla de rutas locales; era la vuelta quien la rompía).
Falsadores nuevos en `qa:tipo-hoja-neg` (**8/8**): `href-todo-construido` (el
404 de la ficha, cazado por LOCAL SIN RUTA EMITIDA), `href-nada-construido`
(la dirección inversa: un construido apuntando al original — el par de
discriminación) y `href-app-vacio` (la derivación TIRA, regla del cero).

**El efecto en la salida servida, adjudicado por derivación:** `html-cmp` vs
`html-f24-verif` — **marcado visible Δ0 en las 31**; 10 rutas con `bytesCarga`
movido, las 10 las que pintan el bloque, cada una **+24 × sus referenciados**:
`/` +48 (estación y sensor, los 2 referenciados de las 5 pestañas), las 6 de
`/sectores/*` +24 (estación, el único referenciado de sus 3 soluciones), y los
3 casos +24/+72/+24 — **la inversa exacta de los −24·−72·−24 que fichó F2-3**.
`clon-base` **31/31 sin mover un píxel** @1440 y @390 · `qa:enlaces` 868 hrefs
limpio · `check` verde. Ficheros: `tipo-hoja.json` (re-congelada, PISAR, con la
del defecto en git `ec5fbf3`), `tipo-hoja-2026-08-08.json`,
`html-f25-paso0.json`, `clon-base-{1440,390}-f25-paso0.json`.

**Y la nota para el alta desde el admin (PASO 4 de F2-5):** un producto nuevo
no construido sale al original **por la misma regla, sin tocar nada** — que es
exactamente el caso que esta fase multiplica.

## 📐 F2-3-T4B-CRITERIO · el criterio de aceptación de `/[slug]`, POR CLASE y al NIVEL DEL BLOQUE (2026-08-06)

**Escrito ANTES de landar nada, que es la mitad que da valor a un criterio.**
Instrumento: `npm run qa:t4b-bloque` · negativo `qa:t4b-bloque-neg` **8/8**.

### Por qué el nivel es el bloque y no la ruta

`html-cmp` juzga el `visible` de la ruta entera con un hash a umbral cero, y esa
premisa **deja de valer aquí por una razón de contenido**: T4b *sustituye*, no
restaura. Donde el original monta un visor de PDF por JavaScript, el CMS guarda
un enlace al PDF; el marcado **tiene** que cambiar ahí. Exigir Δ0 a la ruta es
exigir lo imposible.

Y en cuanto la ruta puede diferir por diseño, **su hash deja de decir nada**:
cualquier regresión que entre con la migración —un `alt` vacío, un `<sup>`
comido (CMS-SP-TIPO), una entidad mal escapada— cae en el mismo veredicto
«distinta» y **la sustitución la tapa**. Es la §causa común de `CLAUDE.md` con
un contenedor nuevo, **el séptimo**: el contenedor no es una fila, ni una caja,
ni el protocolo — es **el hash de la ruta**, y su holgura mide exactamente lo
que ocupa la sustitución (7112 bytes en la peor de las cuatro).

### El criterio, en dos mitades que se miden por separado

| mitad | qué | umbral |
|---|---|---|
| **1 · RESTO** | el `visible` de las dos partes **sin** los bloques de las clases declaradas | **PUERTA · CERO.** Un byte fuera de un bloque declarado es DEFECTO, exit 1 |
| **2 · BLOQUE** | lo de dentro, **por clase** | **no se juzga por su tamaño**: contra la diana de su clase |

### Las clases que HAY, censadas sobre el dato del seed (no sobre el corpus)

| clase | n | ANTES | DESPUÉS | diana |
|---|---:|---|---|---|
| `fb3d` | **3** | `<div …_3d-flip-book…></div>` + `<script>` con `FB3D_CLIENT_DATA` | `<p><a href="<PDF>" data-media="<clave>">título</a></p>` | ⛔ **DESVIACIÓN DELIBERADA** |
| `nbc` | **1** | `<script …nbcwashington.com/portableplayer…>` | *(nada; el `<div class="contenedor-video-fijo">` queda vacío)* | ⛔ **DESVIACIÓN DELIBERADA** |
| `instagram` | **1** | `<script …instagram.com/embed.js…>` | *(nada)* | ✅ **SIN PÉRDIDA DE BLOQUE** — el `<blockquote class="instagram-media">` sobrevive con su texto y su permalink |
| *hermano materializado* | **0** | — | — | ✅ umbral CERO contra el hermano — **la rama existe y NO tiene instancia aquí** |

**La razón de cada desviación, que es lo que la regla 1 exige:**

- **`fb3d`** — el original monta el visor por JS y **no existe equivalente
  materializado en ninguna población**: ni en el catálogo medido ni en los 209
  documentos del corpus. El **contenido (el PDF) se conserva**; la
  **presentación, no**. Deuda: §M-PDF-FB3D (los 5 PDF que la captura nunca pidió).
- **`nbc`** — **imposible, no pendiente**: §3.3 decidió *enlace a la noticia* y
  el `<script>` sólo da la URL del **reproductor** con su `CID` caducable. La URL
  del artículo no está en el dato y no se inventa (regla 6).

> ⚠ **La cuarta diana —la ÚNICA que compra fidelidad— tiene n = 0 aquí, y se
> dice en vez de darla por aplicada.** El encargo la pedía para `flourish`
> («hay hermanos del corpus con el `<iframe>` ya materializado»). Derivado
> (regla 9): `grep -rl flourish-embed corpus/` → **8 ficheros** ·
> `grep -c flourish apps/web/src/lib/*.ts` → **0**. **`flourish` vive en el
> camino del EXTRACTOR, no en el catálogo que siembra `/[slug]`.** La rama queda
> escrita porque es donde caerá el día que el corpus entre en una familia de
> ruta; hoy no hay nada a lo que aplicarla.

### Lo que este criterio NO compra

> **«Adjudicado» NO es «fiel».** Dice que la diferencia está **donde se
> declaró**, no que la sustitución sea buena. Para `fb3d` y `nbc` la respuesta
> de la clase es que el clon queda **peor que el original** y se acepta con
> acta. Y la sonda entera es **clon-contra-clon**: no mide fidelidad contra
> kunakair.com, igual que `html-cmp` y `clon-base`.

### La trampa que este diseño hace posible, y la guarda que la cierra

Recortar bloques para afirmar Δ0 sobre el resto abre una puerta concreta:
**ensanchar un patrón hasta que se trague la regresión.** Ni el censo la ve —un
patrón más ancho casa el mismo número de veces— ni la identidad de bytes, que se
cumple por construcción del `replace`. **Las dos guardas obvias son ciegas.**

La que muerde es una propiedad del CONTENIDO: **un bloque declarado es
andamiaje, no cuerpo.** Si un match se lleva un `<p>`, un encabezado, una imagen
o una lista sin tenerlo declarado (`permite`), es DEFECTO. Falsador:
`patron-ensanchado` en el negativo — y es el caso que justifica la guarda,
porque sale VERDE en todas las demás.

### ✅ APLICADO — la familia landada el 2026-08-06, y qué dice CADA instrumento

**Y esto es la mitad que hay que leer antes de tocar nada**, porque dos sondas
de la casa salen ROJAS por diseño en esta familia y no son regresiones:

| sonda | resultado | lectura |
|---|---|---|
| **`qa:t4b-bloque`** | **RESTO a CERO en 10/10 rutas** · 3 bloques adjudicados · 0 invaden cuerpo | ✅ **es la puerta de esta familia** |
| `qa:html-cmp` vs `html-f23-base` | **4 DISTINTAS** de 31 · 27 limpias (5 sólo BUILD_ID · 8 sólo reparto · 14 renumeración) | ⚠ **rojo ESPERADO**: son las 4 con bloque sustituido. **Ni una quinta** — las 4 que marca son exactamente las 4 que `t4b-bloque` adjudica |
| `qa:clon-base` @1440 y @390 | **28/31 sin mover un píxel**, 3 con cambio | ⚠ **rojo ESPERADO** en los 3 de `fb3d`: `+1 ancla` y `+48.6` (1440) · `+48.6/+79.18/+79.19` (390) |
| `qa:enlaces` | limpia en las dos direcciones · 868 hrefs internos · 1728 externos | ✅ |
| `qa:corte` · `qa:slugs` · `qa:manifiesto` · `qa:cms-lectura` · `npm run check` | 12/12 · 14 slugs 0 colisiones · 31 rutas · 63/63 · verde | ✅ |

**El `+48.6` está explicado y su variación entre anchos también:** es el párrafo
del enlace al PDF que T4b pone donde estaba el visor. A 390 dos de los tres
títulos **envuelven a dos renglones** (`+79.18`, `+79.19`) y el tercero no
(`EEA Report Air Pollution`, corto, `+48.6` a los dos anchos). O sea que la
diferencia entre anchos **no es ruido: es el wrap del título del PDF**, que es
justo lo que tiene que pasar.

> ⚠ **`clon-base` y `html-cmp` NO se van a poner verdes en esta familia, y no
> hay que intentarlo.** Su rojo es la desviación con acta. La sonda que decide
> si algo se rompió es `qa:t4b-bloque`, y lo que hay que vigilar en las otras dos
> es **el CONJUNTO**: si algún día marcan una ruta que `t4b-bloque` no adjudica,
> eso sí es defecto.

**Deuda que la sustitución deja abierta:** los 3 `data-media` apuntan a PDF que
la captura **nunca pidió** (§M-PDF-FB3D — la lista se derivó del markup y esas
URL viven en base64). El `href` va al original, que es lo que la regla de rutas
locales pide mientras el PDF no esté publicado.

## ⚠ F2-3-EXIT-FETCH · `process.exit()` después de un `fetch` NO devuelve el código elegido (2026-08-06)

**Repro mínimo, 3 de 3 en esta máquina (Windows 11, Node 26.4):**

```
node -e "await fetch(URL); process.exit(2)"      → Assertion failed:
                                                    !(handle->flags & UV_HANDLE_CLOSING),
                                                    src\win\async.c:94   ⇒ exit 3221226505
node -e "await fetch(URL); process.exitCode = 2" → exit 2
```

`process.exit()` arranca el proceso mientras el socket keep-alive de `fetch`
sigue cerrándose y libuv aborta. **No lo evitan** `setImmediate`, `setTimeout(0)`
ni cerrar el dispatcher de undici (probados, 3 de 3 cada uno). Lo único que
funciona es **dejar drenar el bucle**, que es lo que hace `exitCode`.

**Por qué importa y no es cosmético:** la guarda de UBICUIDAD de `html-cmp`
**acertaba** —imprimía su mensaje correcto— y `qa:html-cmp-neg` la contaba como
fallada: *«esperaba exit 2, salió 3221226505»*. Es §regla 1 por el otro lado —el
canal de verdad son **la salida Y el código**, y discrepaban— y §sondas 8a: el
sabotaje sí ejercitaba la guarda, y el instrumento que lo leía no podía verlo.

**Alcance derivado, no recordado (regla 9): 24 ficheros de `scripts/` hacen
`fetch` y `process.exit`.** En `html-cmp` se veía siempre porque la salida
ocurría inmediatamente después del `fetch`; en las demás la carrera la suele
ganar el trabajo que hay en medio, así que es **latente y dependiente del
tiempo**. La dirección peligrosa es un `process.exit(0)` que sale 3221226505 —
verde que se lee como rojo, ruidoso pero no silencioso.

**Arreglado en las 2 que esta tanda toca** (`html-cmp`, `t4b-bloque`); las otras
22 quedan **fichadas y sin barrer**, con su derivación al lado. Decirlo es la
diferencia entre «arreglé la clase» y «arreglé la instancia que me estorbaba».

### ⚠ ALCANCE CORREGIDO Y DUEÑO ASIGNADO (2026-08-06, tanda 37.ª)

**El recuento de arriba se re-derivó antes de usarlo (regla 9) y no salió 24.**

```
for f in $(grep -rl "fetch(" scripts --include="*.mjs"); do
  grep -q "process\.exit(" $f && echo $f; done | wc -l      → 29
```

**29 candidatos**, no 24 — y la lista está congelada en el cuerpo de esta ficha
(4 de `scripts/`, 23 de `scripts/qa/`, 2 de `scripts/seed/`).

> ⚠ **RE-DERIVADO 2026-08-08: son 32.** No es que la cifra estuviera mal — es que
> **el alcance CRECE con cada sonda nueva**, y una ficha que cita un recuento sin
> volver a derivarlo envejece **contra** el repo en silencio (§sondas 9). Las tres
> nuevas son de F2-4: `publicar.mjs`, `programada.mjs` y `publica-e2e.mjs`.
>
> **Y las tres entran DECLARADAS, no por descuido**: su `process.exit()` es el
> **vigilante `unref()`** que sale con el código ya calculado, y va **2 s después
> del último `fetch` y después de matar a los hijos**, así que la carrera que
> describe esta ficha no existe ahí. Están escritas con su razón en el propio
> fichero. **El recuento sube igual**, porque el criterio de la ficha es
> *«alcanzable tras un `fetch`»* y eso lo decide el barrido, no la intención de
> quien lo escribió — si el criterio admitiera excepciones por comentario, el
> control automático que la ficha pide para `qa:lib` no podría escribirse.
>
> **Estado: 32 candidatos · 2 auditados · 30 sin auditar.** El dueño no cambia.

**Y la segunda corrección es peor que un recuento: «arreglado en las 2» era
IMPRECISO.** Las dos conservan llamadas a `process.exit()` **después** de sus
`fetch` —`html-cmp` 496 y 505, `t4b-bloque` 451—; lo que se convirtió fue **la
ruta que se demostró fallando**. Comprobado hoy: la corrida sin `--cmp`
(línea 496, post-`fetch`) sale **0** correctamente… *porque hay un `await parar()`
en medio que le gana la carrera al socket*. O sea **lo mismo que la ficha dice de
las otras 27: latente y dependiente del tiempo**, no arreglado.

> **Lectura correcta del estado:** 29 candidatos · **2 auditados** con su ruta
> crítica convertida · **27 sin auditar** · y en los 2 auditados quedan llamadas
> de la misma clase que hoy ganan la carrera por accidente de ordenación.

**DUEÑO: tanda de INSTRUMENTO, no F2-4.** La razón es de coste y de riesgo, no de
preferencia:

- **no bloquea F2-4** — es un modo de fallo de las *sondas*, no del sitio ni del
  CMS, y su dirección peligrosa (`exit(0)` → 3221226505) es **ruidosa**: se lee
  como rojo, no como verde falso;
- **barrerlo bien no es un `sed`**: `process.exit()` corta el flujo y
  `process.exitCode` no, así que cada conversión exige **reestructurar el control
  de flujo** de esa sonda (en `html-cmp`, meter ~100 líneas dentro de un `else`).
  Hacerlo al final de una tanda de migración es cambiar 27 instrumentos sin
  presupuesto para volver a falsarlos uno a uno;
- y **cada arreglo de una sonda vuelve a correr su test en negativo, entero**
  (`CLAUDE.md` §sondas 3, corolario). 27 sondas = 27 negativos.

**Criterio de «hecho» de esa tanda, escrito ya para que no se negocie luego:**
las 29 auditadas una a una —convertidas o declaradas exentas con su razón—, cada
sonda tocada con su negativo corrido entero, y **un control en `qa:lib` que falle
si aparece un `process.exit()` alcanzable tras un `fetch`**. Sin ese último
control es un barrido, no una clase cerrada.

## ✅ F2-3-T4A-BLOG · CERRADA (2026-08-06) — era T4b sin cablear, y el motivo escrito era una premisa falsada

**Lo que decía la ficha:** *«el seed aplica T4a sin T4b, así que la DB guarda 4
cuerpos de blog mutilados»*. Cierto. Lo que faltaba era **por qué**, y no era
un orden deliberado:

> **El seed no tenía T4b porque no tenía NINGUNA transformación.** Derivado:
> `grep -c "transformaciones" scripts/seed/seed.mjs` → **0**, mientras
> `TRANSFORMACIONES = [T8,T1,T2,T3,T3B,T4B,T4,T5,T6,T7]` ya llevaba T4b **en su
> orden correcto** y lo usaban `extractor`, `cms-roundtrip` y `media-hueco`. El
> seed tenía **una segunda copia a mano** de T8+T4a, y su `0 sustituidos` era un
> **literal de cadena**, no un recuento.

**Y la razón que el código daba llevaba dos tandas falsada.** `seed.mjs` decía
que T4b *«necesita datos que el catálogo NO tiene: el PDF, la URL de la
noticia»*; `PLAN-FASE-2.md` §871 lo derribó en la tanda 30.ª (*«T4b es
DERIVABLE»*) porque **la referencia al PDF viaja en el payload base64 del propio
`<script>`**. Comprobado contra el catálogo del seed: **3 de 3 FB3D derivables
vía `payload`**, `post()` limpia, 0 payloads ilegibles.

> Es §sondas 3 en su **tercera** forma: allí un comentario prometía una LLAMADA
> que no existía, luego unos CONSUMIDORES que no existían; aquí promete **una
> RAZÓN**, medida falsa, en el único sitio del repo que nadie ejecuta ni
> verifica. Y el `0 sustituidos` literal ni siquiera lo contradecía.

**Aplicado:** `seed.mjs` importa `T4B` (una sola definición), lo corre **antes**
de T4a con su postcondición, y el seed imprime `5 <script> eliminados (T4a) ·
3 sustituidos (T4b)` — los dos **contados**. La familia está landada con el
criterio de §F2-3-T4B-CRITERIO.

## ⛔ ~~F2-3-T4A-BLOG~~ · el diagnóstico original, conservado (2026-08-06)

**Bloquea:** la única familia de ruta que queda (`entradas-blog` +
`terminos-kunakpedia`), y con ella el criterio *«al menos una instancia de CADA
colección»* de la prueba de operación.

**Se migró, se midió y se revirtió**, que es como se sabe el número.
`qa:html-cmp` marcó **4 rutas con el marcado VISIBLE distinto** —la PUERTA del
contrato del §F2-3-RSC-ORDEN—:

| ruta | Δ bytes |
|---|---:|
| `/running-for-clean-air` | **−7112** |
| `/monitorizacion-de-emisiones-del-trafico-urbano` | **−6783** |
| `/la-contaminacion-del-aire-el-asesino-silencioso-de-europa` | **−6532** |
| `/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos` | **−524** |

**La causa NO es el proyector: es T4a sin T4b.** El seed imprime su propia
pérdida —*«5 `<script>` eliminados, **0 sustituidos**»*— y `T4B` vive en
`transformaciones.mjs`, que es el camino del **extractor**, no el del seed. Así
que la DB guarda esos 4 cuerpos **sin** el visor de PDF, el embed de Instagram,
el reproductor de NBC y los flipbooks. Diferencia comprobada carácter a carácter
contra el catálogo medido: el primer punto de divergencia es un `<script>` en
los cuatro.

**El alcance está acotado, y la evidencia llevaba dos días congelada** — regla
8b, *la respuesta estaba en `medidas/`*: `sondeo-frontera.json` (**2026-08-04**)
registra **4 rechazos del `validate`, los 4 en `entradas-blog`, los 4 mismos
slugs**. Y ninguna otra colección tiene `<script>` en el dato medido: **0 en las
otras 8**. Dos instrumentos independientes, el mismo conjunto de cuatro.

> **Por qué no se landa igual con la desviación anotada:** meter los 4 cuerpos
> mutilados en el clon servido es una **regresión de contenido** contra la regla
> 1 (fidelidad), a cambio de nada — F2-3 no necesita blog para avanzar. Y el Δ0
> de esta fase existe precisamente para que una migración de FUENTE no se
> convierta en un cambio de CONTENIDO sin que nadie lo decida.

**Y ojo con el matiz que decide cómo se desbloquea:** `terminos-kunakpedia`
**está limpia** (0 scripts). Está bloqueada sólo por **compartir ruta** con
`entradas-blog` en el plano de raíz. No hace falta arreglar los términos: hace
falta T4b.

**Qué lo desbloquea, y qué NO:** T4b sobre el camino del seed —o el importador
del corpus, que ya lo lleva—. Lo que **no** lo desbloquea es esperar: T4b
*sustituye*, no restaura, así que **el Δ0 de esas 4 rutas no va a ser cero
nunca**. La tanda que lo aborde tiene que decidir **contra qué** se acepta esa
familia, y esa decisión es de contenido, no de instrumento.

Evidencia congelada: `medidas/html-f23-slug-REVERTIDA-2-t4a.json` (4 rojas) ·
`medidas/sondeo-frontera.json` §`validate.rechazos`.

## ⚠ F2-3-ASYNC-HIJO · un límite asíncrono NUEVO mueve el HTML sin mover un dato (2026-08-06)

**Mecanismo nuevo para este proyecto, y sólo se ve porque la puerta es el
marcado visible.** Al migrar `/[slug]` se hizo `async` el componente
`RelacionadosA` para que leyera el catálogo del CMS. `qa:html-cmp` marcó **6**
rutas, no 4: las 6 con `relacionados: true` — y **dos de ellas sin una sola
diferencia de dato**, `/contador-…` con **Δ 0 bytes** y el marcado distinto.

Volver el componente **síncrono** —pasándole el catálogo que la página ya
espera— devolvió esas 2 a Δ0, dejando sólo las 4 de T4a. Antes/después con todo
lo demás igual: `html-f23-slug-REVERTIDA-1-async.json` (6) →
`-2-t4a.json` (4).

> **Abrir un límite asíncrono dentro del árbol cambia el HTML servido aunque el
> dato sea idéntico.** Las dos familias migradas antes no lo vieron porque su
> `async` está **en la página**, no en un hijo; `casos` y `sectores` tampoco, por
> lo mismo.

**Regla operativa para lo que quede:** el dato se espera **en la página**, que ya
es asíncrona, y baja a los componentes por prop. Un `await` dentro de un
componente hijo es un cambio de maquetación disfrazado de refactor — y su Δ0 no
lo caza `clon-base`, que mide geometría: aquí la geometría **no se movió**.

### ✅ APLICADA al landar (2026-08-06) — y el mecanismo merece nombre propio

`RelacionadosA` recibe `catalogo: EntradaBlog[]` **por prop** y sigue siendo
síncrono; la página, que ya es asíncrona, es quien espera el dato. Resultado
medido: **de las 10 rutas de `/[slug]`, sólo las 4 con bloque sustituido
difieren** — ni una de las 6 con `relacionados: true` aparece por el límite
asíncrono. La regla se sostuvo en la corrida buena, no sólo en la revertida.

**El mecanismo, enunciado para que no haya que redescubrirlo:**

> **Abrir un LÍMITE ASÍNCRONO dentro del árbol de componentes cambia el HTML
> servido aunque el dato sea bit a bit idéntico.** React parte el stream por los
> límites de suspensión, así que un `await` nuevo mueve dónde cortan los `push`
> y **qué marcado sale en qué trozo** — sin que haya cambiado un solo dato.

**Y por qué esto NO estaba en el catálogo de contenedores de `CLAUDE.md`:** los
seis de allí son cosas que **absorben** un defecto. Éste **crea uno** donde no
había nada, y **sólo lo ve una sonda cuyo objeto sea el MARCADO**. `clon-base`
mide geometría y no se mueve un píxel; `html-cmp` con la puerta en `filas` lo
habría leído como reparto RSC. Lo que lo destapó fue tener la puerta en
**`visible`** —la decisión del §F2-3-RSC-ORDEN, tomada dos días antes por otra
razón—: un caso de una decisión de instrumento pagando en un sitio que no era
el suyo.

**La forma general, que es lo reutilizable:** al migrar la fuente de un dato,
**la frontera async del árbol es parte del artefacto servido**, no un detalle de
implementación. Mover un `await` un nivel arriba o abajo es un cambio de salida
y se mide como tal.

## ✅ F2-3-MEDIA · CERRADA (2026-08-06) — y la premisa era verdadera con la conclusión equivocada

**Lo que decía la ficha:** *«`media` no guarda la ruta de origen ⇒ `rutaDeMedia`
no se puede implementar»*. La primera mitad es cierta y sigue siéndolo. La
segunda **no se seguía**, y para saberlo había que preguntárselo al dato:

> si dos rutas distintas no comparten nunca su último segmento, `filename → ruta`
> es una **función** y se tabula. La conclusión sólo vale si **COLISIONAN**.

**Medido** (`npm run qa:media-colision`, congelada, negativo 6/6):

| población | rutas | basenames repetidos | referencias del corpus |
|---|---:|---:|---:|
| **dominio** — lo que HOY es fila de `media` | **112** (133 referencias) | **0** | 0 |
| **corpus** — orígenes capturados | 534 | **0** | 0 |
| **unión** — todo lo que ALGUNA VEZ podrá ser fila | 646 | **1** | **12** |
| `publico` — `public/images` entero | 628 | 12, y **11 son CASCARÓN** | — |

Y no se dio por supuesto que `filename` FUERA el basename: se verificó contra la
salida servida —`media/`, que `cms:reset` vacía— y salió **112/112 con el nombre
exacto**. Payload no saneó ni desduplicó.

> **La lectura, con su alcance: es una función HOY y deja de serlo en la unión.**
> La colisión es `control-de-la-calidad-del-aire-en-ciudades.jpg` en `2023/04` y
> en `2024/06`, y no es hipotética: los dos están capturados y el corpus los cita
> **3 y 9 veces**.

**Resuelta por CMS-0g** (acta con las tres salidas costadas en `ESQUEMA-CMS.md`
§7c): campo de **PROCEDENCIA** `rutaOrigen` en `media`, `required: false` por
construcción, con migración versionada y re-seed. **112/112 con origen en la DB.**

**Y lo que la cerró del todo**, porque el campo solo no bastaba: `aMedido`
necesitaba **tres mapas que la IDA construía en su mismo proceso**, y en el
render no hay ida. Ahora se declaran con `custom` en 8 campos y hay dos guardas:

| guarda | qué afirma | negativo |
|---|---|---|
| `qa:cms-decl` | lo declarado coincide con lo que la ida deriva, **en las dos direcciones** | **6/6** |
| `qa:cms-lectura` | el contexto del RENDER proyecta **63/63 idéntico** al verificado | **4/4** |

⚠ **Sin la segunda, el 63/63 del round-trip era un verde prestado**: verifica un
contexto y el build usa otro.

## ⚠ F2-3-VARIANTE-PISA · 3 orígenes de `media` con el fichero pisado (2026-08-06)

**No es CMS-0g y por eso va aparte**: los `filename` siguen siendo distintos, así
que la tabla no se rompe. Lo que se pisa son **los bytes en disco**.

`media/` es **plano** y ahí caen también las variantes que genera `imageSizes`.
Tres rutas del dominio se llaman como una variante generable de otro origen
(`X-1024x683.jpg`, y `X.jpg` también está subido), y **2 de las 3 ya tienen el
fichero sobrescrito**:

| origen | ¿pisado? |
|---|---|
| `uploads/2025/12/Brazil-first-Low-Emission-District-LED-Rio-de-Janeiro-1024x683.jpg` | **sí** |
| `uploads/2026/05/Movilidad-urbana-sostenible_Kunak-1024x683.jpg` | **sí** |
| `uploads/2025/06/sargazo-cancun-repmex-1024x683.jpg` | aún no (su base no está subida) |

**Probado con control, no razonado:** Payload copia los orígenes **verbatim** —el
`sha256` de la base coincide con el de `public/images`— y el disputado **difiere**,
o sea que lo que hay ahí es la variante generada, no el origen que un documento
de `media` cree tener.

**Consecuencia hoy: ninguna geométrica.** Las dos imágenes miden 1024×683 en los
dos casos, así que es familia **M-IMG** (dimensión igual, bytes no). **La deuda
real es de fragilidad**: si el orden de inserción cambiara, Payload
desduplicaría (`-1.jpg`) y **entonces sí** rompería la tabla. Lo vigila
`qa:media-colision` comprobación B en cada corrida.

### ⚠ AMPLIADA 2026-08-06 — ¿sobreviven los orígenes? Sí, pero NO donde se buscó

**La pregunta era si los bytes pisados sobreviven en la captura congelada** (534
ficheros con `sha256`, commiteados). Medido:

> **NO están en `media-corpus`. Y no es un hueco de la captura: es su ALCANCE
> declarado.** `media-corpus/INDICE.json` lo dice en su propia cabecera —*«fuera:
> las VARIANTES»*— y la lista se derivó del **markup**. Los dos orígenes
> disputados **se llaman como una variante**, así que la regla de la lista nunca
> los pidió. Es el mismo mecanismo que **§M-PDF-FB3D**: la lista acertó en todo
> lo que podía ver.

**Pero la pérdida es RECUPERABLE, y el que la recupera es otro artefacto:**
`apps/web/public/images` —**en git**, comprobado con `git ls-files`— guarda los
**112 orígenes**, y los 3 ficheros disputados con sus bytes buenos. Verificado
con `sha256` origen a origen: **109 de 112 son idénticos byte a byte a
`media/`**, y en los 3 que difieren el bueno está en `public/`. Y `media/` está
en `.gitignore` y `cms:reset` lo vacía ⇒ **lo pisado es un artefacto
reconstruible, no daño durable.**

> **La palabra correcta no es «pérdida real»: es recuperable.** Lo que sí hay
> que corregir es **dónde está la red**: no en la captura, en `public/images`.
> Citar `media-corpus` como respaldo de esta clase habría sido una garantía
> falsa — no puede contener, por construcción, nada con nombre de variante.

**Y dos correcciones de recuento (regla 9), derivadas contra la DB y el disco:**

**(a) La exposición es mayor que «3», y está anidada.** Las cifras no se
contradicen: son predicados distintos, cada vez más estrecho.

| predicado | nº | qué significa |
|---|---:|---|
| orígenes de `media` | 112 | — |
| con **nombre de variante** (`-WxH`) | **40** | la forma cruda |
| …y con un ancho que `imageSizes` **puede** generar | **18** | los otros **22** son `-600x600`, y **ningún `imageSize` produce 600** (300·480·768·980·1024·1080·1280) ⇒ fuera del alcance del mecanismo |
| …y con su **base en la unión** | **3** | es el predicado de `qa:media-colision` C |
| …y **materializado** (los dos ficheros presentes, `sha` distinto) | **2** | lo que la ficha ya decía |

O sea: la sonda cuenta bien lo que dice contar. Lo que faltaba era **el
denominador de la fragilidad**: hay **18** nombres al alcance del mecanismo, y
cada uno se convierte en colisión el día que alguien suba su base.

**(b) Hay un TERCER fichero que difiere, y NO es de este mecanismo.**
`/images/uploads/2024/01/Air_pollution_in_Madrid.webp`: mismas dimensiones
(**1000×600**), sin nombre de variante, y **ningún otro origen genera ese
nombre** (comprobado contra los `sizes` de los 112). Lo que pasó es que Payload
**lo RE-CODIFICÓ**: `65 752 → 62 096` bytes.

Y eso toca **el control de la comprobación C**, cuyo propio comentario lo había
anticipado: *«sin el control, el sha distinto se explicaría solo por
recodificación y no probaría nada (regla 8a)»*. **La alternativa que el control
descartaba existe de verdad** — sobre el único fichero cuyo formato es distinto:

> **«Payload copia los orígenes verbatim» vale para los 111 `jpeg`+`png`, y NO
> para el `webp`.** Es una propiedad **del formato**, no de la colección, y el
> alcance hay que decirlo: el mecanismo está derivado sobre **n = 1** — hay un
> solo `webp` entre los 112 (108 `jpeg` · 3 `png` · 1 `webp`).

El control sigue siendo válido **para lo que se usa** (los 2 disputados son
`jpg`), pero la frase no se puede citar de la colección entera. Consecuencia
hoy: ninguna geométrica —misma dimensión— ⇒ **M-IMG** también, con su mecanismo
propio.

## ✅ F2-3-RSC-ORDEN · CERRADA (2026-08-06) — con CONTRATO, y la otra salida era la equivocada

**Lo que había que decidir:** si el nivel `filas` de `html-cmp` debía ignorar la
fila de estado del router, o si el residuo se fichaba **ruta a ruta**. Se ha
hecho lo tercero, que no estaba en la lista: **declarar qué garantiza cada nivel
y cuál puede por tanto ser puerta.** Y la segunda opción se ha podido descartar
midiendo, no opinando (abajo).

### El hecho que decide la categoría, y es del ORIGINAL

> **EL ORIGINAL NO EMITE CARGA RSC.** `npm run qa:rsc-original` —congelada en
> `medidas/rsc-original.json`, negativo **5/5**—: 4 arquetipos (HOME · PRODUCTO ·
> SECTOR · DOC. CIENTÍFICO), **0 con `__next_f`**, los 4 con su control positivo
> `et_pb_`. Sin el control, «no hay RSC» y «no miré» darían la misma salida.

De ahí se sigue —y no es preferencia— que **el nivel `filas` no tiene contraparte
que auditar, ni hoy ni nunca**: es **clon-contra-clon POR CONSTRUCCIÓN**, la
familia que `CLAUDE.md` §UN ARQUETIPO NUEVO NO HEREDA COBERTURA declara que *«se
lee como verde y no mide fidelidad»*. Un Δ0 ahí no compra fidelidad porque no hay
fidelidad que comprar.

**Y `visible` sí puede ser puerta por el mismo argumento, no por otro.**
`html-cmp` es una guarda de **invariancia** (clon de hoy contra clon de ayer), y
lo que hace útil a una invariancia es que **traslade** una fidelidad ya pagada.
El marcado visible es donde vive la que 48 sondas midieron contra kunakair.com;
byte-identidad ahí la transfiere al otro lado de la migración. La carga RSC no
tiene ninguna que transferir.

**La segunda razón es independiente de la primera:** `generateMetadata` pasa a
asíncrona **en cada familia que se migra**, así que el reparto de ids cambia en
cada familia. *Una puerta que enrojece por el mecanismo de la propia fase no es
una puerta: es ruido con nombre.*

### El contrato

| nivel | qué garantiza | umbral | falsador |
|---|---|---|---|
| **`visible`** | lo que recibe el visitante no cambió — **y traslada la fidelidad medida contra el original** | **PUERTA · CERO** | `visible-alterado` → exit 1 |
| **`filas`** | **nada de fidelidad.** Sólo churn accidental de la carga de hidratación | **INFORMATIVO, con disparador** | `filas-renumeradas` → verde y contado · `inv-nfilas` · `inv-nmascaras` · `inv-bytescarga` → exit 1 |
| `normalizado` | nada por sí solo | informativo, contado | `solo-reparto` → verde y contado |

**El disparador —qué tiene que aparecer para que alguien mire el informativo—**,
porque degradar a informativo **no es dejar de mirar**. El reparto mueve *qué
fila lleva qué id*; lo que no puede mover son los INVARIANTES de la carga:
`nFilas` · `nMascaras` · `bytesCarga`. Filas distintas con los invariantes
quietos = renumeración (verde, **contada y nombrada aparte**); **un invariante
movido = DEFECTO**, con su nombre y su número.

⚠ **`bytesCarga` es nuevo y `html-f23-base.json` es ANTERIOR**, y esa congelada
no se re-congela. Durante F2-3 el disparador corre con **dos invariantes y no
tres**, y la sonda **lo dice ruta a ruta** (`⚠ sin comprobar en la base:
bytesCarga`) en vez de darlo por cumplido — regla 6: una ausencia no se sustituye
por un valor benigno. Lo que queda fuera está acotado: un cambio de bytes DENTRO
de una fila sin alterar el nº de filas ni el de referencias; si ese contenido se
renderiza lo ve la puerta, así que sólo escapa contenido que viaje **sólo** en la
carga.

### Por qué la otra salida —fichar ruta a ruta— era la equivocada, y está medido

Al correr el contrato nuevo salió algo que la ficha anterior no podía ver: **el
residuo CAMBIÓ DE RUTA entre dos builds del mismo commit.**

| build | ruta que lleva el residuo |
|---|---|
| `4FmTRSOGl1Yg71Tvd2eMq` (`medidas/html-antes.json`, 08-06) | `…/evaluaciones-independientes/desafio-airlab-de-microsensores-2023` |
| `AJuzJ90GKcggYZrj32lvZ` (`medidas/html-f23-contrato.json`, 08-06) | `…/articulos-cientificos-y-estudios/exposicion-de-los-atletas…` |

Las dos congeladas comparadas entre sí dan **2 rutas de 31 con `filas` distintas
— justo esas dos**, y los invariantes **idénticos en base, A y B** (`nFilas` 46 y
46 · `nMascaras` 77 y 75). O sea: **el residuo no es una propiedad de la ruta.**
Una ficha ruta a ruta habría nombrado una ruta que deja de ser la ruta al
siguiente build, y la siguiente tanda habría ido a buscar un defecto donde ya no
estaba.

### Resultado

`qa:html-cmp` contra `html-f23-base` con el contrato puesto: **31 comparadas · 0
con contenido distinto** · 25 sólo el `BUILD_ID` · 5 sólo reparto · **1 sólo
renumeración**. Negativo **11/11** (era 8/8: entran `filas-renumeradas` y los
tres `inv-*`, sale `filas-alteradas`, que exigía rojo donde el contrato pide
verde contado). **`/recursos/[...ruta]` queda con su Δ0 de contenido pagado.**

## ⛔ (histórico) F2-3-RSC-ORDEN · 1 ruta con residuo en la carga RSC que NO es contenido (2026-08-06)

Al migrar `/recursos/[...ruta]`, `qa:html-cmp` marcó **1 de 31** con contenido
distinto: `…/evaluaciones-independientes/desafio-airlab-de-microsensores-2023`.
**Diagnosticado midiendo, no supuesto** — capturando el HTML antes y después:

| eje | antes → después |
|---|---|
| marcado **visible** (lo que ve el visitante) | **Δ0** |
| payload RSC desescapado | **32918 → 32918**, misma longitud |
| filas RSC | **46 → 46** |
| trozos `push` | 20 → **19** (los −43 bytes son un envoltorio de trozo) |
| lo que de verdad cambia | la fila de `meta` se emite **antes**, y una fila pasa de id `11:` a `12:` |

Causa: `generateMetadata` pasa a ser **asíncrona** al consultar la DB, así que el
serializador reparte los ids en orden de resolución. **Es exactamente el
fenómeno que la cabecera de `html-cmp` documenta** y que ya excusa en otras 5
rutas como *«sólo reparto del stream»*.

**Por qué sigue saliendo rojo en ésta, y por qué NO se ha tocado la sonda:** su
máscara de identificadores es `^[0-9a-f]+:`, y hay **una fila cuyo id va
precedido de tabuladores** (el contenido de la fila anterior acaba en `\n\t\t\t`),
así que no se enmascara. Ampliar la máscara a `^\s*[0-9a-f]+:` **no lo arregla**
—se comprobó—: queda un residuo en la fila de **estado del router**, que lleva
referencias internas que se mueven con la renumeración.

> **No se ensancha la máscara hasta que la sonda calle.** Es literalmente lo que
> su propia cabecera prohíbe: *«meter `__next_f` en la normalización sería
> declarar volátil un tercio del documento para que la sonda deje de
> protestar»*. Lo que se hace es **decir en qué nivel difiere y con qué número**,
> que es lo que esta ficha hace.

**Lo que hay que decidir en la tanda siguiente**, y es decisión de instrumento,
no de dato: si el nivel `filas` debe comparar el **conjunto de filas** ignorando
la fila de estado del router (nombrándola y contándola aparte, como ya se hace
con `solo-reparto`), o si el residuo se ficha ruta a ruta. **Hasta decidirlo,
esta ruta NO se cuenta como Δ0 de contenido.**

## ⛔ (histórico) F2-3-MEDIA · el proyector de lectura NO puede reconstruir la ruta de un `upload` (2026-08-05)

**Lo que bloquea:** las **5 familias de ruta que quedan** por migrar a Local API.
Es el hallazgo que paró el PASO 3 de F2-3 después del canario, y no es una
apreciación: sale de dos derivaciones.

**Derivación 1 — la forma del canario no generaliza** (`npm run qa:lectura-forma`,
congelada en `medidas/lectura-forma.json`). Cuántas de las cuatro
transformaciones de FORMA de `scripts/seed/mapeo.mjs` tiene cada colección:

| familia de ruta | colección | upload | relación | blocks | richText | array | hojas |
|---|---|---:|---:|---:|---:|---:|---:|
| `/faqs/[slug]` ✅ migrada | `faqs` | 0 | 0 | 0 | 0 | 0 | 7 |
| `/[slug]` | `terminos-kunakpedia` | 0 | 0 | 0 | 0 | 0 | 10 |
| `/[slug]` | `entradas-blog` | **1** | **3** | 0 | 0 | 0 | 19 |
| `/recursos/[...ruta]` | `documentos-cientificos` | **1** | **1** | 0 | 0 | 0 | 21 |
| `/casos-de-exito/[slug]` · `/case-studies/[slug]` | `casos` | **2** | **2** | 0 | 0 | 1 | 26 |
| `/sectores/[slug]` | `sectores` | **8** | **1** | **1** | 0 | 12 | 108 |
| `/sectores/[slug]` | `monograficos` | **8** | **1** | **2** | **2** | 17 | 199 |

El canario se migró con un proyector **escrito a mano, campo a campo**, y podía
hacerse porque `faqs` es **0 en las cuatro**. La única otra colección así es
`terminos-kunakpedia`, y **comparte ruta** con `entradas-blog`, que no lo es. O
sea: **la forma del canario no vale para NINGUNA otra familia**. Copiarla igual
sería la FAMILIA DE CALIBRACIÓN de manual — heredar los valores del primer
contexto medido.

**Derivación 2 — y aunque se compartiera el walker, falta el dato.** `aMedido`
(el walker de la vuelta, ya escrito y probado por el round-trip 63/63) necesita
**tres** métodos de contexto —derivado: `grep "ctx\." ` sobre su cuerpo—:
`rutaDeMedia` · `deRel` · `conKind`. Y el primero **no se puede implementar**:

```
select filename, url from media limit 1;
  Kunak-AIR-Pro-1024.jpg | /api/media/file/Kunak-AIR-Pro-1024.jpg
```

La colección `media` **no guarda la ruta de origen**. El seed subió
`apps/web/public/images/…/Kunak-AIR-Pro-1024.jpg` y Payload conservó el
**nombre de fichero**, no el directorio, así que `/images/products/x.jpg` y
`/images/uploads/2024/03/x.jpg` son indistinguibles al volver. El dato medido
guarda `imagenCabecera: "/images/…"`; **de un id de `media` no sale esa cadena**.

**Las dos salidas, y las dos tienen dueño escrito:**

| salida | qué cuesta | de quién es |
|---|---|---|
| añadir a `media` un campo con la ruta de origen | cambio de ESQUEMA + migración versionada + re-seed | F2-1/F2-2 (modelo) |
| que el render apunte a `/api/media/file/…` | **cambia el HTML servido ⇒ rompe el Δ0** | **M-IMG**, ya registrada como *deuda de RENDER en `apps/web`* (§6 del ESQUEMA) |

Ninguna de las dos es «seguir migrando familias»: **es una decisión de modelo
antes de la siguiente familia.** Por eso F2-3 se para aquí y no improvisa.

> ⚠ **Y lo que NO hay que hacer:** escribir proyectores a mano para `casos`,
> `sectores` y `monograficos`. Son 26, 108 y **199 hojas** con 17 arrays y 2
> uniones de bloques — o sea re-implementar el walker en TypeScript, que es
> exactamente la «segunda lista escrita a mano» contra la que avisa la cabecera
> de `mapeo.mjs`. Y aquí sería **peor que allí**: en el seed las dos listas se
> comparan entre sí (el round-trip), y en el render **no hay pareja**, así que
> un olvido sólo se ve si mueve píxeles.

## ✅ M-ORIGEN404 · DECIDIDO — el DATO conserva la referencia (2026-08-05)

**La pregunta que quedó abierta el 05-08 por la mañana:** el corpus cita 3
ficheros que `kunakair.com` ya no sirve (404 verificado a mano tras los 2
reintentos). El contenido importado los va a citar y no habrá fichero. Las dos
salidas eran *dejar el `<img>` como está* (fidelidad) o *quitarlo* (desviación).

**Decidido: el dato conserva la referencia.** Y no es una preferencia — lo
resuelve un contrato que ya estaba escrito:

> `CLAUDE.md` §1: **fidelidad al píxel sobre criterio propio. Los textos van
> *verbatim*, erratas incluidas.**

Los tres razonamientos, en orden de peso:

1. **El original SIRVE la referencia.** El `<img src>` está en el HTML que
   kunakair.com devuelve hoy; lo que falta es el fichero al otro extremo. O sea
   que **el corpus no está mal: el origen está roto**. Quitar el `<img>` haría
   que el clon dejara de decir lo que el original dice — que es exactamente la
   desviación que la regla 1 prohíbe, y encima **irreversible**: el día que
   alguien reponga el fichero, un dato que conserva la referencia se arregla
   solo y uno que la borró ya no sabe qué borró.
2. **Es una decisión de RENDER, y va por su carril.** Que la página pinte un
   hueco, un marcador de rotura o nada es una elección de plantilla en
   `apps/web`, y se toma con la página delante. Meterla en el DATO acopla las
   dos capas y rompe la regla 2 — que es la misma razón por la que **M-IMG
   cambió de dueño** en la 29.ª en vez de cerrarse desde F2-2.
3. **Y quitarlo sería sustituir una ausencia por un valor benigno** (regla 6):
   un cuerpo sin el `<img>` no distingue *«aquí nunca hubo imagen»* de *«aquí
   había una y el origen la perdió»*.

**Los tres documentos, nombrados — y DERIVADOS de `extractor-corpus.json`
(`mediaDelCuerpo.detalle`), no recordados** (regla 9):

| documento | fichero que cita |
|---|---|
| `entradas-blog/ldar-deteccion-y-reparacion-inteligente-de-fugas-industriales` | `2026/05/Emisiones-fugitivas_programa-LDAR.jpg` |
| `terminos-kunakpedia/oxigeno` | `2026/05/Ambiente-laboral-en-entorno-industrial-confinado_Kunak-scaled.jpg` |
| `terminos-kunakpedia/oxido-nitrico-no` | `2026/05/Exposicion-de-la-infancia-al-oxido-nitrico_Kunak-scaled.jpg` |

> ⚠ **Y los tres los tuve que derivar porque los había escrito de memoria.** La
> primera versión de esta tabla nombraba `monitorizacion-mal-olor-industrial`,
> `salud-laboral-calidad-aire-interior` y `oxido-nitrico`: **uno inventado y dos
> mal**, y dos de los tres ni siquiera eran del grupo correcto (son de
> Kunakpedia, no de blog). Regla 9, séptima instancia — y aquí habría mandado a
> la tanda siguiente a buscar la imagen rota en tres documentos que no la tienen.

**Y la referencia queda MARCADA, que es la otra mitad del encargo.** El eje
`existencia` gana su **invariante D** (`qa:artefacto`): cada `data-media` que
T3b y T4b escriben tiene que resolver, y las ausencias se reparten en tres
cajones **por predicado, no por lista**:

| cajón | predicado | ¿rojo? |
|---|---|---|
| **§M-ORIGEN404** | se pidió y `media-corpus/INDICE.json` registró su error | **no** |
| **§M-PDF-FB3D** | es un PDF que T4b sacó de un base64, y `listaACapturar` se derivó del markup | **no** |
| **404 NUEVO** | ni lo uno ni lo otro | **SÍ** |

Sabotaje `media-inventada` en `qa:artefacto-neg` (**7/7**): sin él, las dos
exenciones serían indistinguibles de un `catch {}`.

> ⚠ **Lo que NO decide esto:** si la página pinta un hueco, un `alt` visible o
> nada. Eso es de `apps/web` y de la tanda que toque el render — aquí sólo se
> decide que **el dato no miente sobre lo que el original dice**.

## ⛔ M-PDF-FB3D · 5 PDF que T4b referencia y la captura NUNCA PIDIÓ (2026-08-05)

**No es §M-ORIGEN404 y conviene no mezclarlos:** allí se pidió el fichero y el
origen dio 404; aquí **no se pidió nunca**, y el mecanismo está medido.

`listaACapturar` (537, congelada en `media-regenera.json`) se derivó barriendo
**el MARKUP** del cuerpo — `<img src>`, `srcset`, `<source>`. La referencia al
PDF de un visor FB3D **no está en el markup**: vive dentro del payload **base64**
de su `<script>`, que es justo lo que T4b aprendió a leer. Ningún barrido de
markup podía verla, así que su ausencia **no es una captura incompleta: es el
alcance de la lista**.

| PDF | por qué la lista no lo vio |
|---|---|
| `2020/10/CIRCULAR-NAVARRE-CATALOGUE.pdf` | sólo en el payload base64 |
| `2024/11/Efectos-del-ozono-troposferico-…-Ecologistas-en-Accion.pdf` | idem |
| `2024/12/EEA-Report-Air-Pollution.pdf` | idem |
| `2025/02/Rapport_Ombrieres_village_olympique_2024.pdf` | idem |
| `2026/06/Kunak_AIR_Pro_Co-location_tests.pdf` | idem |

**3 de los 8 sí están** —`2021/10/infografia-directrices-de-la-OMS-…pdf` porque
otra página lo enlaza con un `<a href>`, y los 2 de forma `data-pdf` porque su
URL sí está en un atributo—. O sea: **la lista acertó en todo lo que podía ver.**

**No se capturan en esta tanda, y es deliberado:** el arreglo correcto **no** es
descargar 5 ficheros a mano —eso rompe la cadena de derivación de la regla 9—,
sino que `qa:media-regenera` **derive también** las referencias de los payloads
FB3D y vuelva a congelar su lista. Eso re-abre la captura, o sea vuelve a pegarle
al sitio vivo: es una tanda con su propio alcance, no la cola de ésta.

> **Mientras tanto el dato conserva la referencia**, por el mismo razonamiento
> de §M-ORIGEN404: el original la sirve.

## ⛔ T3B-NO-CANONICO · 2 bloques `wp-caption` que T3b deja sin tocar (2026-08-05)

De los **446** bloques censados, **444 son canónicos** —`<div class="wp-caption">`
+ un `<img>` + `<p class="wp-caption-text">…</p></div>`— y T3b los convierte. Los
otros 2 no lo son, y no por capricho del original:

| documento | qué tiene dentro |
|---|---|
| `entradas-blog/zonas-de-bajas-emisiones-y-el-control-de-la-contaminacion-del-aire` | tras la leyenda, un `<p>` **sin cerrar** y un bloque `calls` (CTA de suscripción) inyectado por shortcode |
| `terminos-kunakpedia/particulas-en-suspension` | idem |

El `</div>` del contenedor cae **después** del CTA, así que emparejar por
balanceo —o con un `[\s\S]*?` hasta el siguiente `</p></div>`— **se tragaría el
CTA entero o saltaría al bloque siguiente**. Se dejan sin tocar y se cuentan
(regla 6: la ausencia se rechaza, no se sustituye a ojo).

**Consecuencia declarada:** esos 2 conservan `wp-caption`/`wp-caption-text` y su
`id="attachment_N"`. Es el motivo de que la postcondición de T3b sea *«no queda
un `wp-caption` **canónico** sin convertir»* y no *«no queda ningún
`wp-caption`»*: **una guarda que no puede salir verde no discrimina** — el mismo
defecto que el criterio de F2-2 que exigía cerrar M-IMG desde una fase que no
puede cerrarlo.

## ⛔ T3-ALCANCE · marcadores del editor que §3.2 T3 NO nombra (2026-08-05)

Censado al escribir T3b, y **no se barren**: §3.2 T3 nombra tres marcadores
—`wp-image-<id>`, `wp-caption`, `aligncenter`— y éstos no están en la lista.

| marcador | n | dónde |
|---|---|---|
| `size-full` · `size-large` · `size-medium` | **405** | el `<img>` de un `wp-caption` |
| `alignnone` | 29 | el contenedor |
| `alignright` | **2** | el contenedor |

**Los dos primeros parecen residuo y el tercero es una decisión editorial**
(flotar a la derecha), así que la respuesta no es la misma para los tres y **no
se decide desde la tanda que los encuentra**. Ampliar por mi cuenta el alcance de
una decisión ajena es cómo se pierde contenido sin que nadie lo note. Va al
ESQUEMA §3.2 como pregunta abierta.

## ABIERTO · `/kunak-api` — el `<title>` del clon NO es el del original (2026-08-04)

Lo destapó de paso `npm run qa:solutions-seo` (24/24 URLs del CPT, congelado en
`medidas/solutions-seo.json`), midiendo otra cosa:

| | `<title>` |
|---|---|
| **original** | `Kunak API - Kunak` |
| **clon** (`apps/web/src/app/kunak-api/page.tsx`, `export const metadata`) | `Kunak API \| Integración de datos de calidad del aire` |

**Es una discrepancia de fidelidad de las de la regla 1** (*textos verbatim,
erratas incluidas*), y no la veía nadie porque **ninguna sonda del repo compara
el `<head>`**: todas miden geometría del `<body>`. El dato correcto —el del
original— **ya está** en `src/lib/products.ts` (`seo.title` de `kunak-api`, §2h
del ESQUEMA); lo que falta es que la página lo consuma en vez de llevar su
propio literal.

**No se arregla en la tanda que lo encuentra, y la razón es de alcance:** tocar
`metadata` de una `page.tsx` es tocar `apps/web`, o sea pagar una corrida Δ0
completa por un cambio que **no mueve un píxel del `<body>`** — la sonda que lo
verificaría no puede verlo. Se arregla en la tanda de F2-3, que es cuando las
páginas pasan a leer del CMS y el `seo` deja de vivir en la capa de estructura.

> ⚠ **Y lo que este pendiente enseña de método:** el título estaba en el
> `export const metadata` de tres `page.tsx`, o sea **contenido dentro de la capa
> de ESTRUCTURA** (`CLAUDE.md` regla 2). Ahí es invisible para cualquier
> auditoría del catálogo *y* para cualquier sonda de geometría. **Un dato que
> vive en la plantilla no lo audita nadie.**

## /monitor-calidad-aire — QA visual final (2026-07-26)

> Comparación CDP por secciones (puppeteer-core + Chrome del sistema, perfil
> limpio, Cookiebot bloqueado) a **1280** y **390 real** (device metrics), clips
> lado a lado + computed styles. Referencias del día: original desktop
> **12927** / móvil **22363**. Clon tras la tanda: **12489 (−438)** / **21546
> (−817)**. Sondas reutilizables en el scratchpad de la sesión (`qa/snap.mjs`
> captura+clips por sección/ancla, `qa/probe*.mjs` computed, `qa/hover2.mjs`
> hover por ratón real — ojo: en el original el label es `p.lista-titulo`, el
> primer `a` del li es el "Ver más" del panel oculto con rect 0×0).

### Corregido en la tanda (desktop y móvil salvo indicación)

- **Cabecera**: el original sirve `cabecera-construccion.jpg` (no
  cabecera-puerto) y la banda mide **137px móvil / 177px desktop** (era 220/300).
- **Retícula**: TODAS las filas de esta página son Divi **80% máx 1380** (no
  85%/1080), gutter 5.5%, cols 47.25 · 29.6667/64.833 · 20.875/73.625; secciones
  py 4vw (50 móvil), filas pt 2vw (30 móvil). Aplicado en breadcrumb, hero,
  fila 2, S3, artículos y FAQ. Esto arregló de rebote todos los wraps (chips
  9/fila, blurbs, "Preguntas frecuente-s"…).
- **S2 CtaBanner**: el slider SÍ es `bg_layout_dark` → **botón BLANCO** con bg
  rgba(0,0,0,.15) (la spec §1 decía outline #333 — corregida aquí), desc py 5%
  desktop (la home mantiene sus 74px) y párrafo **14px/22.4 en móvil**. Exacto:
  400/400 d · 376/377 m.
- **Fila 2**: checklist en blurbs **3×2 centrados** (icono 50 arriba, h4 18/21.6
  w300, item 199, mb28; móvil 2×150), "La gama de contaminantes más completa"
  es **H3 20px/24 w700 #333** (no azul 37), subíndices añadidos en el recuadro
  azul 2 (O₃/NO₂/SO₂/PM₂,₅/PM₁₀), logos validadores con los SVG **cuadrados**
  (hero: fila única 69/49; fila 2: 94px ×6 gap 19; móvil 2 col 90-150), y la
  **imagen del mástil se OCULTA en móvil** (col izq original: 308px).
- **Sub-nav anclas**: caja a ancho de columna con **flecha `ico-arrow.svg`
  30×30** en cada ítem (bg del `a`, pr 30), ul pb16, mb 27, col pt 32; móvil
  gris #f4f4f4.
- **Aplicaciones**: slide embebido **300px en móvil** (no 450; regla en
  globals), dots remontados a ~28px bajo los slides (solo embedded), banner-guía
  px 40 en móvil. Móvil **+3 exacto**; frase azul 37px TAMBIÉN en móvil (hay un
  segundo "Facilitamos…" a 18px en Beneficios que confunde sondas de texto).
- **Ensayos**: lista de resultados con **chips circulares 46×46** (strong dentro
  del enlace, borde 2px azul, 14px w700), filas de 56, relleno por **columnas**
  (columns-2), flecha → al final del enlace y CTA azul **a la izquierda**.
  Móvil −2.
- **Especificaciones**: labels alineados ARRIBA en filas altas, gap título→tabla
  28, y en móvil columnas **35/65 con padding de celda 12** (antes 50/50+40 →
  +137 de wraps).
- **Artículos y Guías**: variante `monitor` de UltimosArticulos — **sin
  watermark K** (sección bg none), fila 80%, pt 140, CTA a +46 con remate
  30+64.
- **FAQ**: sección 4vw + fila pt20/pb64 (50/19.5 móvil), toggles con borde
  arriba Y abajo, remate mb30. Desktop −2, móvil +9.
- **Footer**: nueva prop `backgroundStrip` con la franja `footer-background`
  (`cabecera-puerto-1.jpg`, 41/40px).
- **Footer TB (P1, cerrado 2026-07-27)**: `Footer` gana `template="tb"` (la
  prop `backgroundStrip` desaparece — el tb la implica) con la plantilla TB
  propia de esta página medida módulo a módulo (`qa/p1-probe.mjs`, 1280/390
  reales): **los paddings Divi son % del ancho del PADRE** (sección links pt
  4% desktop / 50px móvil y pb 0; fila links py 2% / 30px; fila legal py 1%
  en ambos) → el shell tb son secciones a ancho completo con la fila
  **80% máx 1380** dentro (la home conserva su wrapper 85% byte-idéntico);
  columnas **sin gutter** (5×20%, el aire lo pone el mb 32 del widget → ul
  pb 32), **li 14px/lh 30.6 con mb 7** (stride 37.6, no 26), cabeceras p
  30.6 pegadas al ul (mb 0 también desktop), Suscríbete **pb 2 desktop /
  3.1 móvil** (h 37/38.1) con mt 16 + mb 46, CERT img + pb 32, legal
  **12px/lh 30.6 también en desktop** (2+1 líneas = 91.8; p2 a 9.6px) con
  mb 32/62, iconos móvil **gap 38 + pl 19** (no 42.7/9) en caja 31.6 +
  60 hasta idioma, fila legal py 1% (12.64/3.89), **sin espaciador de 40**
  y franja 41/40. Resultado: desktop **694.2 vs 694.2 (exacto**, links+legal
  653.2 = 653.2; era −41.8**)**, móvil **2053.7 vs 2053.1 (+0.6**, era
  −251.5**)** con las anclas de columnas idénticas al píxel (y 369.2 /
  732.5 / 1083.2 / 1484.1, iconos y1887.6, idioma y1979.2). Home verificada
  sin regresión: móvil **19182 / footer 1761.6 exactos** (B4) y desktop
  1418 footer **592.2 exacto**.
- **Header P2 (cerrado 2026-07-27, `qa/p2-probe.mjs`/`p2-cycle.mjs`)**: el
  header original (MISMO template en home y monitor — verificado a 1280
  idénticos) tiene **tres regímenes por ancho de viewport útil**:
  **≤1379px → fila `contenido` al 92% sin max-width** (1177.6 a cw1280, col
  logo 11.87% = 139.8 + margen 5.5% = 64.8, menú 973) y el menú entero en
  **UNA fila** con "Descargar catálogo" inline a 12px del pill de ayuda
  (catálogo x1059.5 y60, también en sticky: fila 75, catálogo y14);
  **1380–1417 → fila ~85%** y el catálogo cae a su 2ª línea (el estado
  verificado de la home a cw1403 en M4); **≥1418 → fila a ancho completo**
  y vuelve a una fila (fuera de alcance — la referencia de la home es
  cw1403). Fix en `HeaderNav` con variantes `lg:max-[1379px]:*` (fila 92%
  sin max-w, logo 11.87%, ml 5.5%, columna de menú en flex-row con gap 12):
  el clon a 1280 clava el contenedor (x51.2/1177.6/139.8/973) en top,
  sticky y vuelta a 0, en ambas páginas. Residuos anotados: catálogo
  x1013.3 vs 1059.5 (−46, deriva acumulada de anchos de items — misma
  familia que el dLeft de M4), alto de fila 115.9 vs 95.5 (pre-existente a
  todos los anchos), y a cw1265 (1280 CON scrollbar) el original ya no cabe
  y envuelve por flex-wrap mientras el clon (items más estrechos) aguanta
  hasta ~cw1210. **Re-verificado sin regresión**: home cw1403 con 35 links
  del header idénticos pre/post, M4 por hover real dTop 0/−1 en los 8 casos
  y dLeft −11/−20/−34 (los residuos aceptados), home docH 11837 / footer
  592.2 (B4). Ojo QA: la cabecera del original sirvió `cabecera-puerto` en
  esta tanda (el 26-07 sirvió construcción) — la imagen VARÍA entre visitas,
  no re-investigar.
- **Hover #power-packs (desktop)**: ✅ verificado por ratón real contra el
  original — mismo comportamiento exacto (hover = preview con mouseenter
  ~300ms, click = fija, mouseleave = vuelve al fijado; opacidades .3/1 y ⊖/⊕).
- Home verificada sin regresión tras la tanda: móvil **19182 exacto**; desktop
  por secciones idéntico (el hero es 100vh — depende del alto de viewport).

### Pendientes (residuos anotados, por orden de magnitud)

> Referencias re-medidas el 2026-07-27 (el contenido del blog del original
> varía a diario y mueve el total — no re-investigar): original **12533 d /
> 22248 m**; clon tras P1 **12567 (+34) / 21798 (−450)**. El footer ya no
> resta: el +34 desktop es P4 (artículos congelados vs original más corto
> hoy) y el −450 móvil es la suma P3+P4+P5+P6 ya anotada.

| # | Zona | Delta | Nota |
|---|------|-------|------|
| P1 | ~~Footer TB (esta página)~~ | ✅ 2026-07-27 | Resuelto — ver «Footer TB» en la lista de corregidos: `template="tb"` con secciones a ancho completo, fila 80%, li 30.6+7, paddings % del padre. Desktop exacto, móvil +0.6. |
| P2 | ~~Header a <~1330px~~ | ✅ 2026-07-27 | Resuelto — régimen responsive ≤1379px en `HeaderNav` (ver «Header P2» en corregidos). No era un wrap del texto: el original tiene TRES regímenes de fila por ancho y a ≤1379 mete todo el menú en UNA fila. M4 re-verificada sin regresión. |
| P3 | Fila 2 móvil | −209 | Ritmo de módulos móvil de la col derecha (space-y 28 vs mezcla Divi 18/30). Desktop quedó −90. |
| P4 | Artículos y Guías | −55 d / −194 m | **La ÚNICA fuente conocida de dispersión de todo el sitio** — ver «P4, ascendido» más abajo. Alturas dependientes del CONTENIDO: los 3 posts van congelados (decisión §4) y el original los sortea — no comparable px a px. |
| P5 | Sondas/Paquetes móvil | −94 / −43 | Acordeón inline `lista-contenido` algo compacto vs original. |
| P6 | Especificaciones móvil | +74 | Wraps residuales de la tabla (original trunca labels con overflow). |
| P7 | Chips fila 1 | 10 vs 9 | A 1280 el clon mete NMHC en la 1ª fila (geometría de chip idéntica; es el whitespace inline de li del original). |
| P8 | Círculo "N" en capturas | N/A | Es el indicador DevTools de Next (el server corre `next dev`, no `next start` — nota de cabecera desactualizada). No existe en producción. |


> Estado tras la Fase 5 (QA visual) del 2026-07-22, actualizado el 2026-07-23
> tras cerrar A1 y A2. Comparación por capturas CDP full-page (viewport real
> 1440×900 → ancho útil 1418px; móvil emulado 390×844) entre
> `https://kunakair.com/es/` y `http://localhost:3000/`.
> Alturas de referencia (2026-07-23, tras M1+M2+M3): original desktop
> **11863px** / clon **11848px** (−15); original móvil **19221px** / clon
> **19208px** (−13). No quedan deltas móviles por sección fuera de banda.
> **Tras B4 (2026-07-23): clon móvil 19182 (−39)** — el footer ya no compensa
> con +26.6 el resto de deltas (todos en banda por sección); el acumulado
> −39 es la suma de residuos ya anotados, no un defecto nuevo.
> Herramientas de medición reutilizables en el scratchpad de la sesión:
> `qa/fullpage.mjs` (captura, con flag `mobile` para emular 390 de verdad —
> sin él Chrome headless fuerza 500px de ancho mínimo), `qa/sections.mjs`
> (alturas por sección), `qa/compose-m2.ps1` (comparativas lado a lado),
> `qa/tree.mjs` (**la sonda genérica de la tanda M2**: árbol de módulos con
> geometría+tipografía por titular regex o `css:<selector>`, sirve para
> original y clon), `qa/s2-probe.mjs` (anclas de texto, plantilla A2),
> `qa/verify-baja.mjs` (checks puntuales de la tanda mecánica).
> Ojo servidor: el clon corre con `next start` (build de producción) — tras
> editar componentes hay que **parar el proceso, `npm run build` y relanzar**;
> si la página sale sin estilos (CSS 500), es un `next start` desincronizado
> de `.next` (pasó el 2026-07-23).
>
> **2ª tanda mecánica (2026-07-23):** M6 (fondo sticky vidrio), M8 (scroll-to-top),
> M1-parcial (H2 hero móvil 38px), B1/B2/B3 (alturas BAJA) y B6 (botón Cookiebot).
> Verificados por checks CDP puntuales sobre el clon (valores computados), **no
> por una re-medición full-page** — las alturas de referencia de arriba son de la
> tanda A1/A2 y no se recalcularon.

Todo lo no listado aquí quedó verificado dentro de ±13px del original en desktop
y con comportamiento correcto (hover de productos, sticky nav, sliders, hovers
de tarjetas, footer).

## Prioridad ALTA

(vacía — A1 y A2 resueltos, ver abajo)

## Prioridad MEDIA

(vacía — M1…M5 resueltos, ver abajo)

## Prioridad BAJA

| # | Sección | Descripción | Magnitud |
|---|---------|-------------|----------|
| B7 | TrustBar / carruseles | En capturas simultáneas los logos/slides visibles difieren entre original y clon por el instante del autoplay. **No es defecto** — anotado para no re-investigarlo en futuros QA. | N/A |

## Resueltos

| # | Sección | Resolución | Fecha |
|---|---------|-----------|-------|
| B5 | Productos — acordeón móvil (scroll animado) | **Resuelto** (sonda `qa/b5-probe.mjs`, ratón real por CDP a 390 — ojo: el handler del original es **mouseenter**, `el.click()` no lo dispara, y el pre-scroll de sondas debe ir con `behavior: "instant"` porque el clon lleva `scroll-behavior: smooth` global). Comportamiento medido del original: al ABRIR anima ~600ms hasta `li.offset().top − 5` (liTop final 5.4/4.6) incluso con otro panel cerrándose encima; al CERRAR (clic en el activo) no hay scroll. Implementado en `ProductosTabs.tsx`: refs por li + `window.scrollTo({top: li − 5, behavior: "smooth"})` en un `useEffect` post-commit (medir tras el cierre del panel anterior, como el offset post-toggle de jQuery); el cierre no dispara scroll. Verificado en el clon: abrir → liTop 5.3 animado, cerrar → sin scroll programático (−8 de scroll anchoring del navegador, también ausente de animación en el original), reabrir → 5.3. Orden y nº de tabs verificado idéntico (Pro, Lite, Cartuchos, Cloud, API). **Resto anotado fuera de alcance**: los paneles abiertos de Lite y Cartuchos miden +27px en el clon (857.8/884.8 vs 830.8/857.8) y el de Pro −8.9 — estado transitorio del acordeón, no afecta a las alturas de página del QA estático; pendiente solo si algún día se hace QA de estados abiertos. | 2026-07-23 |
| B4 | Footer (móvil) | **Resuelto: 1761.6 vs 1761.4 (+0.2)** (sonda `qa/b4-probe.mjs`, 390 real por `Emulation.setDeviceMetricsOverride` — reprodujo primero las referencias 19221/19208 exactas, validando la metodología). El +26.6 era un desajuste de ritmo **compensado**: columnas de enlaces demasiado altas (headings 39.8 vs 30.6, li 28 vs 26, ul pb 18 vs 14 → +25/+29/+31 por columna) canceladas por una zona legal demasiado compacta (lh 19.2 vs 30.6, gaps 24 vs 62 → −79.6). Causas raíz: (1) el original hereda **line-height 30.6px FIJO** (1.7em de body 18px) — el clon tiene `line-height: 1.7` sin unidades en globals y los hijos escalan por su font-size; (2) el li heredaba fs 18 del body y el strut inflaba la caja de 26 a 28 — el original pone **fs 14 en el propio li**. Ritmo móvil aplicado como base (<640) con `sm:` restaurando los valores desktop verificados: sección pt 50, fila pt 30, headings mb-0/lh-30.6, ul fs14/pb14, botón Suscríbete mt 48 (32+16) / alto 45 (pb 10 móvil) / +46 después (30+16), tras CERT 62 (32 widget + 30 fila), legal fila pt/pb 4 (1%), legal lh 30.6 + 62 hasta iconos, iconos +38 hasta idioma, e **iconos sociales a 42.7px de separación con 9 de entrada** (margen Divi responsive `0 33.7 0 9`; desktop sigue a 9px — verificado en árbol desktop). Desktop intacto por construcción (todo `<640`) y verificado: footer 592.2 ≈ 592. Capturas lado a lado coincidentes; matiz sin efecto en altura: "Editar preferencias de cookies" envuelve como bloque (es botón inline-block) donde el original corta la frase — mismas 3 líneas. **Nuevo total móvil del clon: 19182 vs 19221 (−39)** — ver nota de cabecera. | 2026-07-23 |
| B8 | Mega-menú — sub-submenú "Cartuchos inteligentes" + residuo del panel | **Resuelto** (sonda `qa/b8-probe.mjs`, hover real por CDP sobre original y clon en top/sticky). Medido el original: panel del mega **1418×198 SIN border-top** (el spec de Fase 3 decía 1px — computed 0px; ese border y el `px-6 py-4` del clon eran el residuo de 15px), celdas li de **200×198** con stride 202.8 (whitespace 2.8px entre inline-blocks), `a` con py 10 / 15px / lh 28, img 130 con py 10 (hover 150 + py 0 = caja constante de 150, sin reflow). Sub-sub: `absolute top:197px` del li **en ambos estados** (y316 top / y270 sticky), grid `auto-flow: column` 9 filas × 2 columnas (**273px + 296px** — la 2ª la fija el max-content de NMHC), padding 16/0, min-w 500, sombra `0 2px 5px` también en sticky, toggle instantáneo por visibility+opacity (sin transición), items 13.5px/fw500/lh 1.6/pad 6-20, hover `bg rgba(0,0,0,0.1)` + texto azul, caret ETmodules "3" 16px en right:0/top:160 del a (→ ChevronDownIcon absolute). `self-start` en los items para que el hover del último de cada columna no estire a la fila de 55.2 del wrap de COV (como el original). Re-probe del clon: panel, celda, img, grid, filas/columnas e items **idénticos al píxel** en top y sticky; verificado visualmente en navegador. Los datos (18 contaminantes) ya estaban en `nav.ts` desde Fase 2; el acordeón móvil ya los renderizaba desde A1. La deriva de ~6px/item de anchos de texto en la fila de links (dd Recursos −34px) queda como estaba — anotada en M4 como residuo aceptado. | 2026-07-23 |
| M5 | Hero — botón "Descubre cómo funciona" | **Resuelto**: nuevo `VideoLightbox.tsx` (client) — overlay `bg-black/80` por portal a body, iframe Brightcove (videoId 6361248610112) 16:9 con allowfullscreen, ✕ / Esc / clic-fuera para cerrar, scroll del body bloqueado al abrir, el iframe se desmonta al cerrar (detiene el vídeo). Verificado por CDP: dialog+aria-modal, src exacto, overflow hidden↔visible, red a players.brightcove.net → 200, cierre por ambas vías. Nota: el vídeo que sirve ese ID muestra un monitor HORIBA APHA-380 (¿clip correcto?) — cambiar el `videoId` en `VideoLightbox.tsx` si no lo es. Commit `149c3d2`. | 2026-07-23 |
| M4 | Header — dropdowns top/sticky | **Resuelto** (sonda `qa/m4-probe.mjs`: hover real por CDP sobre Productos/Sectores/Empresa/Recursos en ambos estados, original vs clon). Medido el original: TODOS los dropdowns cuelgan de la línea **viewport 119-120 (top) / 73-74 (sticky)** — no del borde inferior del header (185/127): tapan la 2ª línea del catálogo, con gap negativo también en el original. El mega ya estaba exacto (119/73 ✓); los tres estándar iban −7 (top) / **−14 (sticky)** y alineados a la derecha del link cuando el original alinea al **borde izquierdo del li**. Fixes: los tres pasan a `position: fixed` con `top: sticky?73:120` sin `left` (la posición estática los ancla al li, como el sub-menu Divi), sombra exacta `0 2px 5px` (mega sticky `0 0 4px`), caja cuadrada, Sectores a min-w 240. **Puente de gracia** `::before` de 20px sobre cada panel (equivale al `padding-bottom: 23px` del li + `::after` 2rem del original — sin él, el cursor moría en el hueco link→panel y el menú se cerraba en tránsito; el mega tenía el mismo bug latente). De rebote: la **columna del logo pasa a 15.87% fijo de la fila en lg** (192px como la col Divi; antes el `max-w` 170→104 encogía la columna y todo el menú saltaba 66px a la izquierda al entrar en sticky — el original no se mueve: dd left 517/617/833 idénticos en ambos estados), menú a 4.63% con items `px-2` sin gap (geometría li del original), e **iconos de Sectores a la IZQUIERDA del texto** (captura en vivo; el spec de Fase 3 decía lo contrario — corregido). Resultado: dTop 0/−1 en los 8 casos; dLeft −11/−20/−34 residual por deriva de anchos de texto (cada dd alineado con su propio link). Desktop 11848 y móvil 19208 sin cambios. Ojo QA: el vidrio sticky se ve transparente en capturas headless (`--disable-gpu` no pinta `backdrop-filter`) — no es defecto. | 2026-07-23 |
| M1 | Hero (móvil 390px) | **Resuelto: 834 vs 836 (−2)**, con anclas idénticas (H2 y120/h192, subtítulo y315/h119, botones y456, divisor y630, logos y700 en una fila). Causas: (1) el wrapper del 90% es de desktop — en móvil los módulos de texto ocupan la fila completa (335px): con 298px el titular caía en 6 líneas en vez de 4 (+82) y el subtítulo en 4 en vez de 3 (+27); (2) los **badges van en UNA fila** en el original (EPA a 134×60, gaps de 16 — el gap-32 del clon los echaba a 2 filas, +96); (3) ritmo Divi: H2 sin mt y con pb10, mb 3.34 entre titulares, mb 20.8 antes de botones, stride 84 entre botones apilados (50+34), divisor con pt8 y P "Evaluado" a 16px/30.6, logos pegados al párrafo, y remate mb30+pb40 de columna tras los badges (el clon acababa a ras). Fidelidad extra: la **marca de agua K solo existe desde 768px** (`@media (min-width:768px) .banner-home:before` — en móvil el clon la pintaba encima de los badges), el módulo **scroll-code va oculto en phone** (display:none verificado), y el P "Evaluado" ahora lleva `text-white` explícito — la regla global `p { color:#333 }` de globals.css le ganaba a la herencia y lo dejaba ilegible sobre la foto (bug preexistente, también visible en desktop). Desktop intacto: hero 824 (0), total 11848. **Página móvil completa: 19208 vs 19221 (−13).** | 2026-07-23 |
| M3 | S3 Sectores intro (móvil) | **Resuelto: 965 vs 965 (exacto)**, con todas las anclas a ±0 del original (H2 en y80, botón en y186, col derecha en y290, texto y300/h324, lema y654/h131, "Desliza" y815). Causas: pt móvil 80 (50+30) y pb 89 (30 fila + 59 sección); el módulo del título lleva **pb32+mb20** antes del botón (no solo el pb10 del h2) y el botón su mb30; el bloque de texto lleva mt10 y rítmica Divi (p pb18, no space-y); y el lema **"Una solución./Múltiples aplicaciones." son dos h2 de 37px con `line-height: 1` y pb10 cada uno en móvil** (misma regla que los h2 azules de S2/A2) — el clamp del clon los bajaba a 28px/33.6 (−64px). Extra de fidelidad: el enlace "cartuchos inteligentes" es **#333** en el original (verificado por CDP, como los enlaces de HazVisible), no azul. Desktop intacto: S3 533 (−13, igual que antes), total 11848. Móvil total tras M3: **19377 vs 19221 (+156)** — ahora todo el delta restante es el hero (M1, +167) menos los flecos ya anotados dentro de banda. | 2026-07-23 |
| M2 | S7 compuesto (móvil) + items asociados | **Resuelto** con la metodología de A2 (`qa/tree.mjs`, sonda genérica de árbol por titular/selector, nueva en esta tanda). Móvil: compuesto **5154 vs 5167 (−13)** — Presencia 896 vs 895, Testimonios **923 vs 923 (exacto)**, HazVisible 1809 vs 1815, Productos 1526 vs 1534 — y de los items asociados: CTA inmerso **319 vs 320**, newsletter **312 vs 312 (exacto)**, artículos 1426 vs 1423, sostenibilidad 954 vs 952. **Página móvil completa: 19221 vs 19221.** Causas reales por bloque: (1) *Presencia*: pt 80 (50 sección + 30 fila), mb 20 del módulo H2, mb 30 del texto y del botón, mapa con mt 30, pb 20 — el pb-146 era de desktop. (2) *Testimonios*: el slider Divi móvil mide por el slide activo **en flujo** (los demás `display:none`, como el fadeIn/Out de jQuery) — no un contenedor fijo de 400px; slide = img 177×177 mt 18 + gap 32 + quote 18.1/28.96 a ancho completo + nombre h57 (26+21+pb10, sin mt del rol) + **pb 104**; hueco H2→slider 69.5. (3) *HazVisible*: los H2 azules intermedios **mantienen 37px/44.4 en móvil** (el clamp los bajaba a 26); "Elige los contaminantes…" envuelve en **7 líneas porque la fila original mide 335px** (no 337) — `max-w-[335px]` móvil, sin hacks; rítmica p pb18, mb 40/20/40; blurbs 2 col de 162 gutter 13, H3 **16px/19.2+pb10 en móvil** (18px solo desktop), icono+26. (4) *Productos*: pt 30, lista pegada al H2 (mb 0), UL con pb18, panel abierto con img pegada (+6), p 18px/27 pb18, **ventajas sin viñetas y con divisor #999 por li** (regla `.lista-contenido-ul li` móvil del tema; bullets azules solo ≥sm), botón "Ver más" a +20, pb 21 del panel, botón final a +34 y pb 50. (5) *CTA inmerso/preocupa*: slide description pt 34/pb 51 (10%/15%), H2 27px/35.1 con **fw 500 en móvil / 300 desktop** (peso responsive Divi — causaba un wrap de 3 líneas en vez de 4), pb10, botón mt 20 y alto 44 (pt 7.5/pb 9). (6) *Newsletter*: título 27px/1.4, cuerpo **14px/22.4 con p pb14** en móvil, botón 44px con **mb 10** (`.calls-button`). (7) *Sostenibilidad*: pt 70, gap 30 entre pilares, texto de blurbs a la izquierda con px 17 (302px). Bonus: el fondo K (710×1302) ahora vive en un wrapper común de los 4 bloques en `page.tsx` — en el original es una sola sección Divi y la K cruzaba el borde Presencia→Testimonios (también arregla el recorte en desktop). Desktop verificado sin regresión: **11848 vs 11863 (−15, antes −23)** — newsletter 409 (0, antes −10), CTA inmerso 471 (0) y CTA preocupa 341 (0) ahora exactos; resto idéntico. Restos conocidos dentro de banda: li de ventajas 38px vs 40 del original (su pb computado es 10 — artefacto de render, no se fuerza), y el crop de las fotos del blog móvil difiere (original recorta img de 440px anclada a la izquierda; clon object-cover centrado) — solo encuadre, mismas alturas. | 2026-07-23 |
| A1 | Header móvil — menú hamburguesa | **Implementado** en `HeaderNav.tsx` (breakpoint real del tema: **≤1023px**, no 980). Hamburguesa de 3 barras 28×2 (blancas/`#333` en sticky, morph a ✕), panel 90vh con slide 500ms, 11 items verbatim, submenús acordeón +/− con overlay `.hover-link`, pill azul "Descargar catálogo"; "¿Cómo podemos ayudarte?" oculto como el original (`visible-escritorio`). Spec completo en `docs/research/components/mobile-nav.spec.md`. Verificado por CDP a 390 y 800px contra el original (fila 126→73px sticky, logo 120→104px, panel y96/y73, filas 47px — todo ±1px); desktop sin cambios. Commit `334df3b`. | 2026-07-23 |
| A2 | S2 "La solución profesional" | **Resuelto**: desktop **2407 vs 2409** (−2px, 21 anclas ±9) y móvil **4884 vs 4884 (exacto)**. Causas reales (extraídas módulo a módulo, ver addendum en `solucion-profesional.spec.md`): geometría de fila Divi (86.35% / cols 29.6667+64.833 / gutter 5.5%) que cambiaba el wrapping; `line-height: 1` en los h2 azules de 37px; `padding-bottom: 10px` de Divi en todos los h2; mt 10 del primer módulo; mb de módulo 33.67px; `<p>&nbsp;</p>` de 30px ante el callout; "Protege tu salud./Protege el medio ambiente." son **dos h2** sin negrita; blurbs 18px/21.6 con icono+30; logos validadores con ancho por logo (EPA 120, resto 100, Airparif 100%); botones Divi 15px/44px con flecha siempre visible y hover que expande el padding. En móvil: sección pt 50, filas pt 30, título 35px, validadores 2/fila, gaps propios. De rebote quedaron exactos **S7 desktop (+1)** y **Sostenibilidad (0)**, y se encontró el hueco de 53px (desktop) / 15px (móvil) tras el newsletter que faltaba desde la Fase 5. Desktop total: **11840 vs 11863 (−23)**. | 2026-07-23 |
| M6 | Header sticky — fondo vidrio | **Resuelto**: la fila sticky pasa de blanco sólido a **`rgba(255,255,255,0.576)` + `backdrop-filter: blur(10px)`** (valores en `HeaderNav.tsx`). Verificado por CDP: `backgroundColor rgba(255,255,255,0.576)`, `backdropFilter blur(10px)`, `position fixed`. El logo azul y el texto `#333` siguen legibles sobre el vidrio. | 2026-07-23 |
| M8 | Botón scroll-to-top | **Resuelto**: nuevo `ScrollToTop.tsx` montado en `page.tsx`. `position: fixed; bottom: 125px; right: 0; z-index: 99999; background: rgba(0,0,0,0.4)`, icono `ChevronUpIcon` blanco, 44×44 pegado al borde derecho; aparece con `scrollY > 500` (rAF-throttled) y hace `scrollTo({top:0, behavior:'smooth'})`. Verificado por CDP (bottom 125, right 0, z 99999, bg rgba 0.4, borde derecho a 1424 = viewport). | 2026-07-23 |
| B1 | Newsletter (desktop) | **Aplicada rítmica Divi documentada**: los dos `<p>` del bloque `.calls-text` pasan de `space-y-4` (16px) al `padding-bottom: 1em (18px)` real de Divi (salvo el último), con el bloque rematando en 30px. La diferencia de −11px estaba **dentro de la banda ±13px** que el propio doc declara verificada; el cambio es de fidelidad, no de pixel-forcing. | 2026-07-23 |
| B2 | TrustBar (móvil) | **Aplicado valor documentado**: el titular "Con la confianza…" pasa a **30px en móvil** (spec: render ~28-30px; el `clamp` lo bajaba a 22 y apilaba con poco aire). Desktop mantiene el `clamp(22,1.9vw,30)` verificado exacto. Verificado por CDP: 30px a 390. (No se re-midió la altura total móvil del original.) | 2026-07-23 |
| B3 | Carrusel sectores (móvil) | **Altura de slide responsive**: `500px` fijo → **`450px` en <640px** / `500px` desde 640 (`SwiperSlide` y `.sector-imagen-wrap`). El −50px derivado del delta documentado (+51) acerca el móvil a los 568px del original. Verificado por CDP: slide 450px a 390. | 2026-07-23 |
| B6 | Cookiebot — botón footer | **Cableado**: "Editar preferencias de cookies" ahora es `CookiePreferencesButton` (client) que invoca **`window.Cookiebot.renew()`** (API documentada en BEHAVIORS.md #8). No-op seguro mientras el script de Cookiebot no esté cargado; queda listo para cuando se decida clonar el banner (decisión de producto aún abierta). | 2026-07-23 |
| M7 | Animaciones de entrada | **N/A — premisa incorrecta, verificado en vivo (no re-investigar, como B7)**: el original NO tiene animaciones de entrada. Los "23 módulos con `et_pb_animation_*`" del recon son 23 `<img>` de blurbs con `et-waypoint` + **`et_pb_animation_off`** en los 3 breakpoints; el critical CSS de Divi eliminó todas las reglas `.et-animated`/`.et_pb_animation_*` (en runtime `document.styleSheets` tiene 0 reglas al respecto — CDP, perfil limpio + Cookiebot bloqueado). Medido sin scroll previo: iconos a `opacity: 1` desde el load en 1440 y 390; el waypoint de `scripts.min.js` (offset `"100%"`, `bottom-in-view` solo para la última fila de la última sección) añade la clase `et-animated` al entrar en viewport **sin efecto visual alguno** (animationName none, opacity 1→1, sin inline styles, muestreado 60ms×20). El clon estático ya es fiel; no se implementó nada. `.kunak-fade-up` sigue en `globals.css` por si algún día se quiere un reveal como personalización deliberada (post-emulación). Corrección anotada en BEHAVIORS.md §1. | 2026-07-23 |

## Notas para retomar

- Las medidas del original se tomaron con perfil limpio (sin cookies) y Cookiebot
  bloqueado vía `--host-resolver-rules`. Ojo: en sesión viva con historial, el
  original puede renderizar estados distintos (p. ej. la cabecera PRODUCTOS del
  footer se midió azul en vivo pero es `#333` en render limpio — ya corregido).
- El original recalcula alturas de sliders Divi por JS tras el load; medir
  siempre tras un pase de scroll + settle (los scripts `qa/*.mjs` ya lo hacen).
- Objetivos numéricos por sección (desktop 1418px, re-medidos 2026-07-23 —
  entre paréntesis el delta actual del clon): hero 824 (0) · trustbar 153 (0) ·
  S2 2409 (−2) · intro 546 (−13) · carrusel 619 (0) · spacer 57 (−1) ·
  CTA inmerso 471 (+1) · S7 compuesto 3185 (+1) · newsletter 409 (−10) ·
  artículos 793 (+3) · proyectos 822 (−3) · CTA preocupa 341 (+2) ·
  sostenibilidad 588 (0) · footer 592 (0). Además hay un margen ENTRE
  secciones tras el newsletter: 53px desktop / 15px móvil (ya replicado en
  `CtaNewsletter`).
- Cambios globales aplicados en A2 (afectan a todas las secciones que usan
  `SectionRow`): fila 86.35% máx 1380, columnas 29.6667%/64.833% con gutter
  5.5% y `shrink-0`, `SectionTitle` con `pb-[10px]` (regla Divi h2) y 35px en
  móvil, `belowTitle` a +34 (0 en móvil), botones Divi exactos (15px/44px,
  padding 7.5/40.5/9/22.5, flecha siempre visible, hover expande a pr 55.5).
  Cualquier ajuste futuro de sección debe medir DESPUÉS de estos valores.

## /accesorios — QA visual (2026-07-27)

> Comparación lado a lado clon (localhost:3000) vs original a **1280×631**
> (DPR 1.5), medida con computed styles + rects vía CDP sobre los 11 `id` de
> ficha, que existen en ambos. Alturas de documento del día: original
> **11423**, clon **11125 antes** → **11211 después** de la tanda (−212).
> Móvil 390 **no verificado** (ver pendiente A4).
>
> **Tres trampas de método que invalidaron medidas y conviene no repetir:**
> 1. **Imágenes lazy del original**: sin forzar la carga, el original mide
>    11361 en vez de 11423 y 3 de los 6 punteados dan `w=0`. Hay que recorrer
>    la página y poner `loading='eager'` antes de medir.
> 2. **`requestAnimationFrame` no corre en pestañas ocultas**: el scrollspy
>    (que va dentro de un rAF) se queda congelado y parece roto en AMBOS
>    sitios. Para probarlo hay que desplazar con ratón real sobre la pestaña
>    activa y leer el resultado en la captura, no con `scrollTo` vía JS.
> 3. `html { scroll-behavior: smooth }` hace que `scrollTo` + lectura
>    inmediata de `scrollY` devuelva valores obsoletos: usar
>    `behavior:'instant'`.

### Corregido en la tanda (desktop 1280)

- **`padding-bottom: 10px` en los titulares** (regla Divi de h1/h2, la misma
  que ya aplicaba `SectionTitle` en la home). Faltaba en los 5 titulares
  escritos a mano en `page.tsx`: h1 46→**56**, h2 del hero, h2 "Información
  sobre el producto" 55→**65**, y los dos h2 de categoría 80→**90**. El h3 de
  ficha y el h2 del FAQ ya la tenían.
- **h2 del hero a `md:w-[80%]`**: en el original el módulo de texto mide
  **467.8** dentro de una columna de 584.8, así que el titular envuelve a
  **4 líneas**; el clon lo tenía a ancho completo y salían 3 (−55px). Ahora
  467.4 y altura 230 = original.
- **Punteado 65px a la izquierda de la retícula**: el original coloca los 6 a
  `l=61.5` (la fila empieza en 126.5); el clon ponía a `l=126.5` los 4 de
  `page.tsx` (los 2 de componentes compartidos ya estaban bien). Aplicado
  `md:-left-[65px]` (en los de categoría, `-left-[65px]` a secas: ya iban
  `hidden md:block`).
- **Hueco h2 de categoría → caja de anclas**: `mb` 32 → **27.9** (medido).
- **`AnchorNav` a 16px/16px — REGRESIÓN PROPIA**: al extraer el componente
  desde `SubNavAnclas` (commit 91fe57f) se subió a `text-[17px]` y padding
  17/17 siguiendo el spec `anchor-nav.spec.md`. El original mide **16px de
  fuente y padding 16px 16px 0** en ambas páginas, que es justo lo que tenía
  el `SubNavAnclas` previo. Revertido a 16/16 — **esto también toca
  /monitor-calidad-aire**, devolviéndolo a sus valores de la QA de julio.
  El spec sigue diciendo 17; conviene corregirlo.

### A1 · Salto por hash — RESUELTO (2026-07-27, misma sesión)

**Síntoma**: `/accesorios#pluviometro` dejaba la página en `scrollY = 0`, así
que los 9 "Ver más" de /monitor-calidad-aire aterrizaban arriba del todo.

**Causa raíz**: `html { scroll-behavior: smooth }` en `globals.css`. Con esa
regla, el salto nativo al fragmento en la carga inicial pasa a ser una
**animación**, y cualquier reajuste de layout durante la carga la cancela: la
página se queda donde estaba (0). No era, como se supuso al principio, que el
App Router reseteara el scroll tras hidratar — esa hipótesis nunca llegó a
probarse (el indicio que lo delataba: `history.scrollRestoration` seguía en
"auto", o sea que el efecto del componente que se probó ni se ejecutó).

**Arreglo**: eliminar la regla. Tres líneas de CSS, sin JS ni componentes.

**Por qué es seguro y además más fiel**:
- El original tiene `scroll-behavior: **auto**` en `html` y en `body` (medido).
- `scroll-behavior` solo aplica cuando la API de scroll **no** especifica
  `behavior`. Los dos únicos consumidores de scroll suave del clon —
  `ScrollToTop` y `AnchorNav`— lo pasan **explícito** en JS, así que no cambian.
- El único otro enlace interno era `href="#catalogo"` en `SectoresIntro`, y
  **no existe ningún `id="catalogo"`** en el proyecto: no apuntaba a nada.
  El `href="#"` de `HeaderNav` lleva `preventDefault()`. Cero consumidores.

**Verificado**: los 4 slugs probados aterrizan a 80px del viewport (el
`scroll-mt-[80px]` de `AccesorioCard`) — `panel-solar` 79.7 · `piranometro` 80
· `gashood` 80.1 — y, sobre todo, **clic real en un "Ver más" desde
/monitor-calidad-aire**: navega a `/accesorios#anemometro-mecanico`, queda en
`scrollY 3038` con la ficha a **79.7** y el h3 correcto.

**Desviación deliberada que queda en pie**: el original aterriza la ficha a
**0px** en la navegación por hash y a **80px** al pulsar un ancla de la caja
(BEHAVIORS §5). El clon usa 80 en ambos casos, para que la cabecera fija no
tape el título. Si se quisiera fidelidad estricta, habría que quitar el
`scroll-mt-[80px]` de `AccesorioCard` y asumir que el título queda tapado.

### A4 · Móvil 390 — VERIFICADO Y CORREGIDO (2026-07-27, misma sesión)

Medido con **`Emulation.setDeviceMetricsOverride` a 390×844** (puppeteer-core
sobre el Chrome del sistema, perfil limpio, headless). `resize_window` de la
extensión NO sirve: informa éxito pero el viewport se queda en 1280.
Sonda reutilizable en el scratchpad de la sesión (`qa/m390.mjs` mide fichas,
`qa/m390b.mjs` titulares y punteados; el segundo se convierte a 1280 con un
`sed` sobre las dos líneas de métricas).

**Las dos correcciones móviles funcionan.** Contra el original a 390:

| | Clon | Original |
|---|---|---|
| h3 "Panel solar" | **42px / 1.31 líneas** | 138px / **4.31 líneas** |
| h3 "Cargadores para exteriores" | **74px / 2.31** | 266px / **8.31 líneas** |
| Imagen de ficha | `float:none`, **apilada sobre el título** | `inline-end` |
| Envoltorio de tabla | `overflow-x: auto` | `visible` |
| **4ª columna alcanzable** | **sí** | **no** |
| Scroll horizontal de página | no | no |

O sea: el original parte "Pa/nel/so/lar" letra a letra y deja "Notas de
instalación" inalcanzable; el clon no. Confirmado también a ojo en las
capturas `m390-clon-panelsolar.png` / `m390-orig-panelsolar.png`.

**Pero el pase destapó que las 5 correcciones de la tanda de desktop se habían
verificado SOLO a 1280 y tres estaban mal en móvil.** Corregido:

- **Los h2 son MÁS grandes en móvil, no más pequeños**: el original usa **35px
  en ≤767** para los tres (hero, "Información sobre el producto" y los de
  categoría), incluso para el de categoría que en desktop mide 32. El clon los
  dejaba en 44/44/32. Ahora `text-[35px] md:text-[44px]` y
  `text-[35px] md:text-[32px]`.
- **Interlínea proporcional**: el original mantiene **1.25× el tamaño** en
  todos sus h2 (44→55, 32→40, 35→43.75). Se sustituye el `leading-[55px]`
  fijo por `leading-[1.25]`, que sirve para los dos tamaños.
- **El punteado también cuelga −65px en móvil** (l=−26 con la retícula en 39),
  y el de los titulares de categoría **sí se ve a 390** — lo que desaparece
  bajo 980 es la caja de anclas, no el punteado. Se quitan el `md:` del
  desplazamiento y el `hidden md:block`.
- **`w-[80%]` del h2 del hero aplica en ambos tamaños** (249.6/312 a 390,
  igual que 467.8/584.8 a 1280), no solo desde `md:`.
- El `mb-[27.9px]` del h2 de categoría pasa a `md:mb-[27.9px]`: en móvil no hay
  caja de anclas debajo y el original va a mb 0.

**Resultado tras corregir** — a 390 coincide **exactamente** en todo lo medido
(punteados −26 ×6; h2hero 35px/249.6/272.5; h2info 35px/312/97.5; h2cat
35px/97.5/mb 0; h1 79/pb 10), y a 1280 no hay regresión: la altura total
mejora de −212 a **−101**.

Dos notas para no confundir en el próximo pase:
- **El clon es más ALTO que el original en móvil** (21197 vs 20338, +859). Es
  la consecuencia esperada de apilar la imagen sobre el título en las 11
  fichas; no es un defecto.
- El `mb` del h2 de categoría difiere en la propiedad (clon 27.9 sobre el h2,
  original 0 sobre el h2 y el hueco lo pone el módulo Divi), pero la
  **geometría resultante es la misma**. No "corregirlo" a 0 sin medir el hueco.

### A3 · `overflow-wrap: break-word` — RESUELTO (2026-07-27)

Aplicado en `body` dentro de `globals.css`. Se pone ahí, y no en `SectionTitle`,
porque **`overflow-wrap` es una propiedad heredada** y ese es exactamente el
alcance que tiene en el original (regla global de Divi): medido, el original
devuelve `break-word` en **todos** los h2 de las tres páginas y el clon devolvía
`normal` en todos.

**Efecto buscado**: el h2 "Preguntas frecuentes", en la columna de 211.2, pasa
de desbordar en 2 líneas/120px a partirse en **3 líneas/175px** — el valor
exacto del original — en /monitor-calidad-aire y /accesorios.

**Verificación de no regresión** (las 3 páginas × 2 viewports, alturas de
documento medidas antes y después con el mismo arnés):

| Página | Antes | Después | Original | Δ vs original |
|---|---|---|---|---|
| home @1280 | 11995 | 11995 | 11797 | +198 → +198 |
| monitor @1280 | 12532 | 12532 | 12927 | −395 → −395 |
| accesorios @1280 | 11315 | 11315 | 11416 | −101 → −101 |
| home @390 | 19182 | 19182 | 19221 | −39 → −39 |
| monitor @390 | 21798 | 21819 | 22309 | −511 → **−490** |
| accesorios @390 | 21197 | 21197 | 20338 | +859 → +859 |

Ninguna empeora y monitor@390 mejora 21. A 1280 la altura total no se mueve
porque los h2 afectados viven en la columna 1/4, que no manda en la altura de
la sección. El otro h2 que cambió, "Reconocimientos" de la home (65 → 120),
**convergió con el original** (dejó de aparecer en el diff contra el original).

**Bug latente que destapó, y que hubo que corregir a la vez**: los 4 titulares
de `/accesorios` llevaban `pl-[10px]` y **el original los tiene a
`padding-left: 0`** (medido en los cuatro: h1, h2 del hero, h2 de "Información
sobre el producto" y h2 de categoría). Sin `break-word` el desajuste no se veía
—la palabra larga desbordaba en silencio—, pero con él el h2 del hero pasaba a
7 líneas/316.3 en móvil en vez de las 6/272.5 del original. Quitado el
`pl-[10px]`, vuelve a coincidir exactamente. Es cambio de `page.tsx`, no de
componente compartido.

### A2 · por qué se queda como está (2026-07-27)

**No se arregla, y no es por falta de intento.** El pendiente original decía
"el clon la resuelve en una fila y el original en dos, −47.7px". Medido en
serio a varios anchos (valores estables, repetidos dos veces cada uno):

| Ancho | Original | filas | Clon | filas |
|---|---|---|---|---|
| 1440 | 237 | 2 | 177 | 2 |
| 1380 | 237 | 2 | 177 | 2 |
| 1280 | **188.5** | **1** | 177 | 1 |
| 1024 | 237 | 2 | 177 | **1** |

Es decir: **el original NO sigue una regla de breakpoint**, es no monótono —
una fila a 1280, dos filas tanto a 1024 como a 1440. El mecanismo está medido:
el contenedor del menú del original mide **973px a 1280 pero 962.4px a 1440**
(más ancho en el viewport más estrecho), y por eso el botón "Descargar
catálogo" (165.3) cabe en la fila del menú solo a 1280. Es una rareza del
dimensionado de la cabecera de Divi, no un diseño.

Razones para no forzarlo:

1. Replicarlo significa **reproducir un accidente de layout**, no una regla, en
   `HeaderNav`, que es compartido por las 4 páginas (incluida /software, que
   está por construir).
2. Deshace la decisión de **P2** (commit `4975da9`), que puso el botón en una
   línea a ≤1379px y se validó explícitamente contra regresiones en la home.
3. **No hay defecto visual que arreglar**: a 1440 la cabecera del clon mide
   203.6 y la franja 177, pero el botón termina en 173.6 —dentro de la foto— y
   nunca colisiona con el breadcrumb, que empieza en 189. Comprobado a 1440,
   1380, 1280 y 1024: `invade: false` en los cuatro.
4. La ganancia sería **solo de altura de cabecera** (entre −11.5 a 1280 y −60 a
   1440), sin ningún acercamiento en fidelidad de contenido.

Si en el futuro se quisiera abordar, el punto de partida es entender por qué el
contenedor del menú del original es más ancho a 1280 que a 1440 — hasta que eso
esté explicado, cualquier ajuste será prueba y error.

### Verificado correcto (no tocar)

- **Interiores de las 11 fichas: idénticos al píxel.** Alturas de bloque
  595.7 / 329.8 / 329.8 / 606.8 / 747.1 / 552.5…, imagen 260×244 flotada,
  tablas 339.4 / 117.8 / 394.8, ancho de columna 744.9. El modelo
  `AccesorioCard` + `SpecTable` reproduce el original sin desviación.
- **Footer**: 693.6 en ambos (trabajo de P1 intacto).
- **Scrollspy**: funciona y coincide con el original. Con desplazamiento real
  y pestaña activa, al llegar a "Cargadores para exteriores" ambos marcan
  "Cargador para exteriores". El original **sí** tiene scrollspy en esta
  página (la primera lectura, que decía que no, era el artefacto del rAF).
- **Caja de anclas**: border 1px #333, radius 10, mb 27.2, `li` 30/56,
  flecha `ico-arrow.svg` 30×30 a `100% 0%`, pr 30 — todo coincide.

### Pendiente

- **A2 · Franja de cabecera — NO SE ARREGLA (decisión razonada, 2026-07-27).**
  Ver la sección "A2 · por qué se queda como está" más abajo.
- **A5 · Residuo de altura: −101 a 1280**, y ya está explicado. Con medición
  homogénea (puppeteer, `--hide-scrollbars`) el clon queda en **11315** frente
  a **11416** del original. Ese −101 lo cubren A2 (−47.7) y A3 (−55), que
  suman −102.7: **no queda diferencia sin atribuir**. Los interiores de las 11
  fichas ya coincidían al píxel.

## /software-de-medicion-calidad-del-aire — QA de construcción (2026-07-27)

> Medido con puppeteer-core sobre el Chrome del sistema (headless, perfil
> limpio, Cookiebot bloqueado, `--hide-scrollbars`, imágenes perezosas forzadas
> a `eager` + pase de scroll) a **1280×900** y **390×844 reales**
> (`Emulation.setDeviceMetricsOverride`). Sondas en el scratchpad de la sesión:
> `m390.mjs` (bloques), `m390b.mjs` (anclas verticales), `m390c.mjs`
> (tipografía de la columna 1/3), `m390d.mjs` (ritmo móvil), `shot.mjs`.
> La página **nace con A3 aplicado**, así que no hereda el defecto de los h2.

### Desktop 1280 — anclas verticales (clon vs original)

| Ancla | Clon | Original | Δ |
|---|---|---|---|
| kicker "Kunak AIR Cloud" | 303.8 | 303.3 | +0.5 |
| h1 | 363.8 | 363.3 | +0.5 |
| h2 del hero | 434.2 | 434.1 | +0.1 |
| claim azul | 670.4 | 670.4 | **0** |
| "Información del producto" | 965.8 | 966.5 | −0.7 |
| h2 azul 1 | 985.8 | 986.5 | −0.7 |
| "Características:" | 1589.7 | 1592.4 | −2.7 |
| h2 azul 2 | 1945.5 | 1948.9 | −3.4 |
| párrafo de cierre | 2621.5 | 2631.3 | −9.8 |
| h2 Beneficios | 3219 | 3227.2 | −8.2 |
| h2 Herramientas | 4319.8 | 4331.5 | −11.7 |
| h2 Casos de éxito | 8051.5 | 8062.9 | −11.4 |
| h2 Artículos y Guías | 8848.4 | 8848.3 | **+0.1** |
| h2 Preguntas frecuentes | 9543.9 | 9625.7 | −81.8 |
| **Altura de documento** | **11579** | **11705** | **−126** |

El −126 está **atribuido por completo**: −81.8 es P4 (los 3 posts van
congelados y el original los sortea; los titulares envuelven distinto) y el
resto es el remate del footer ya anotado. Los −9…−12 intermedios son el strut
de los `<span>` de 17pt del original (sus módulos miden 31.9/78.9 donde el clon
da 30.6/77.6): sub-2px por módulo, no se fuerza.

Coinciden **al píxel**: carrusel 655.9×500 con borde 22 #eee, radius 32 y
sombra `0 0 5px`; los 9 puntos en x 738.7…874.7 (paso 17); las flechas en
526.3/1046.2 a 48×48; tarjeta de herramienta 350.1×421.8 con captura
350.1×233.4; blurb de beneficio 744.9×82.6 con icono 40 y gap 15; bloque de
las 6 características 285.2 de alto; caja de anclas 211.2×154.3.

### Móvil 390 — anclas verticales

| Ancla | Clon | Original | Δ |
|---|---|---|---|
| kicker | 267 | 266.6 | +0.4 |
| h1 | 309 | 308.6 | +0.4 |
| h2 del hero | 402.4 | 400.8 | +1.6 |
| "Información del producto" | 1214.7 | 1224.6 | −9.9 |
| h2 azul 1 | 1438.4 | 1430.5 | +7.9 |
| h2 azul 2 | 3457 | 3434.1 | +22.9 |
| h2 Beneficios | 5120.9 | 5081.4 | +39.5 |
| h2 Herramientas | 6978.2 | 6960.6 | +17.6 |
| h2 Casos de éxito | 13852.8 | 13837.5 | +15.3 |
| h2 Artículos y Guías | 15407.8 | 15366.8 | +41 |
| h2 Preguntas frecuentes | 16743.6 | 16870 | −126.4 |
| **Altura de documento** | **20757** | **20916** | **−159** |

Sin scroll horizontal (`scrollWidth == clientWidth == 390`). Interiores
idénticos al píxel: carrusel 312×500, tarjetas 312×396.4 y 312×365.8, blurb de
beneficio 312×148.4, h2 del hero 35px/228.8. El −159 es, otra vez, P4
(artículos→FAQ: −167).

**Cuatro reglas móviles del original que hubo que descubrir midiendo** (todas
aplicadas; sin ellas el clon salía +212 en vez de −159):

1. El **kicker baja a 35px/42** en ≤767 (a 50px "Kunak AIR Cloud" envuelve a 2
   líneas y el hero crece 78px).
2. **"Información del producto" baja a 35px/43.75** (misma regla que los h2).
3. La imagen **`kunak-cloud-dispositivos.png` se OCULTA en móvil**
   (`display: none` medido), igual que el mástil de /monitor-calidad-aire.
4. Las filas Divi usan **30px fijos** de padding y de margin-bottom en móvil,
   no el 2% del ancho; la fila de S3 usa **50px** de padding superior y los 2
   CTAs de la columna 1/4 se apilan con **44.4px** entre ellos.

### Comportamientos verificados en vivo

- **Autoplay del carrusel**: 6000 ms por diapositiva (5 s de `et_slider_speed_5000`
  + 1 s de fundido), bucle infinito, **fundido cruzado** sin desplazamiento
  horizontal. Corrige la estimación de "~3,5 s" de `BEHAVIORS.md` §1, que
  arrancó a mitad de ciclo.
- **Flechas**: invisibles en reposo (`opacity: 0`, `left/right: -22px`) y
  visibles al pasar el ratón (`opacity: 1`, 22px), transición 0.2s. En el
  original el disparador es la clase `et_slider_hovered` que Divi añade **por
  JS**: leer computed styles justo después de mover el ratón todavía devuelve
  `opacity: 0`. Trampa de método, anotada también en la spec.
- **Lightbox de vídeo**: abre `youtube.com/embed/sRLe65Enlbs`, con
  `aria-modal`, `body { overflow: hidden }` y cierre por ✕/Esc/clic fuera. La
  URL se capturó abriendo el modal real del original: el plugin
  *popups-for-divi* **extrae la sección `#video` del DOM** al cargar y la
  reinyecta al pulsar, por eso no aparece en una lectura inicial.
- **Scrollspy**: marca una sola ancla y en el mismo orden que el original
  (`y=0` ninguna · 3500 Beneficios · 4500/6000 Herramientas · 8000/8600 Casos).
  Ojo con la trampa de siempre: con la pestaña en segundo plano
  (`document.visibilityState === "hidden"`) el rAF de `AnchorNav` no corre y el
  scrollspy parece congelado; para medirlo hay que parchear `rAF` a
  `setTimeout` **y descontar un paso de retardo** en la lectura, o usar ratón
  real con la pestaña visible.
- **FAQ**: 19 toggles, todos cerrados de inicio. **Artículos**: 3. **Casos**: 3
  + CTA "Ver todos los casos".

### Pendiente

- **S1 · Residuo de −9 en la columna 2/3 a 1280.** Son 4 módulos que en el
  original miden 1,3px más de alto por el strut de sus `<span>` de 17pt. No se
  fuerza.
- **P4 (heredado)**: los 3 posts de "Artículos y Guías" van congelados y el
  original los sortea en cada carga — −81.8 a 1280 y −167 a 390. No es
  comparable px a px.
- **A2 (heredado)**: la franja de cabecera. Afecta igual que a las otras
  páginas y sigue sin arreglarse por la decisión razonada de más arriba.

## /kunak-api — QA de construcción (2026-07-27)

> ⚠️ **SUPERADA por "/kunak-api — QA VISUAL (Fase 5) · 2026-07-28"**, al final
> del archivo. Se conserva como registro histórico, pero **sus números no valen
> como referencia**: el móvil se midió dentro de un iframe y eso ocultó que S1
> iba +166.5px. Ir a la entrada de Fase 5.

> Medido con Claude in Chrome (`javascript_tool`, computed styles reales,
> imágenes perezosas forzadas a `eager` + pase de scroll) a **cw 1264.7**
> (viewport 1280) contra el original en vivo. El móvil se midió en un
> **iframe de 390** servido desde el propio `localhost:3000` (el navegador de la
> sesión no baja de 1280 de viewport): dentro del iframe `innerWidth` es 390 y
> el contenido 374.7, porque la barra de scroll sí ocupa — las alturas son
> comparables, los anchos van un ~4% cortos.
> Specs de bloque: `docs/research/kunak-api/components/*.spec.md`.

### Desktop 1280 — secciones (clon vs original)

| Sección | Clon | Original | Δ |
|---|---|---|---|
| S0 breadcrumb | 50 | 50 | **0** |
| S1 hero + info + beneficios | 1956.7 | 1965 | −8.3 |
| · fila 1 (hero) | 563.5 | 563.4 | **+0.1** |
| · fila 2 (información) | 771.5 | 776.1 | −4.6 |
| · fila 3 (beneficios) | 570.5 | 575 | −4.5 |
| S2 Artículos y Guías | 613.3 | 699.8 | −86.5 |
| S3 Preguntas frecuentes | 1398.4 | 1404.4 | −6 |
| S4 CTA de ancho completo | 275.1 | 275.1 | **0** |

- La **fila 1 es exacta**: kicker 60, h1 56, h2 175, claim 61.2, botón 43.3 con
  su remate de 90 (30 del botón + 60 del wrapper), columna 550.7 y foto a
  −47.8 (el `margin-top: -10%`, ver `hero-api.spec.md`).
- El **CTA final es exacto**: caja 275.1 con `padding` 55.65 / `padding-right`
  345, `<h2>` 68.5 y párrafo 32 — sin una sola prop nueva en `CtaBanner`.
- Los −4.5 de las filas 2 y 3 son **el strut de los `inline-block`**: en el
  original los blurbs forman line boxes y cada fila se lleva ~2.7px extra de
  interlínea que el flex del clon no tiene. Es el mismo residuo aceptado en
  /software; no se fuerza.
- El **espaciado nuevo de `UltimosArticulos` es correcto**: fila del titular a
  25.6 del techo de sección (original 25.3, el 2%) y CTA a 12.7 de las tarjetas
  (original 12.7, el 1%), con el mismo remate de 94.

### Móvil 390 — verificado

- **Sin scroll horizontal** (`scrollWidth == clientWidth`).
- Altura de documento **9196**, dentro de la horquilla del propio original
  (**9176 / 9203 / 9230** en tres cargas seguidas: los posts se sortean, P4).
- Los 12 blurbs pasan a **2 por fila** al 48% — el corte de esta variante es
  **480px**, no 768 ni 981.
- La foto del hero **se mantiene visible** (a diferencia de la de /software).
- Punteado recortado contra el borde izquierdo, como en /accesorios (A4).

### Pendiente

- **P4 (heredado)**: los −86.5 de "Artículos y Guías". Los 3 posts van
  congelados (el original los sortea) y, además, el módulo de blog del original
  se lleva ~60px de relleno interno que el clon no pinta — el mismo residuo que
  ya tienen /monitor-calidad-aire y /software con el componente compartido.
- **P2 (heredado)**: la franja de cabecera cambia de foto entre visitas. El
  recon capturó `cabecera-urbana.jpg` y el clon la fija; en la comprobación de
  hoy el original servía `cabecera-puerto-1.jpg`. No se re-investiga.
- **A2 (heredado)**: la franja del header mide menos que la del original.
  Decisión ya tomada: no se fuerza.

### A5 · Los blurbs de /software van 13px descolocados en el ORIGINAL (2026-07-27)

Descubierto al extraer `BlurbsIconos`. El tema separa los blurbs con
`margin-inline-end` y lo anula con `:nth-child(3n+1)`, que cuenta sobre **todos**
los hijos de la columna Divi, no solo sobre los blurbs:

| Página | Módulos de texto antes | `3n+1` cae en | Efecto |
|---|---|---|---|
| /kunak-api | 4 | blurbs **3 y 6** | huecos uniformes del 3% ✔ |
| /software | 5 | blurbs **2 y 5** | el 2.º y el 3.º de cada fila salen **PEGADOS** |

Medido en el original de /software: `x = 482.3 · 698.7 · 902.0` con caja 203.3
→ hueco 1→2 = 13.1 (2%) y hueco 2→3 = **0**.

El clon pinta huecos uniformes en las dos páginas, así que en /software el 3.er
blurb de cada fila queda **13.1px a la derecha** del original. **No se corrige**:
el encargo del refactor era extraer el componente sin mover /software, y el
resultado uniforme se ve mejor que el del tema. Queda anotado por si algún día
se quiere fidelidad total.

Del mismo A/B salen otras dos desviaciones **preexistentes** de /software, que
tampoco se han tocado: el `<h4>` del blurb se pinta a **fw 400** cuando el
original es **fw 300**, y el reparto vertical es `icono mb 30 + h4 sin padding`
en vez de `icono mb 20 + h4 pb 10` (el alto total del blurb es el mismo, 105.2,
pero el título va 10px más abajo dentro de la caja).

### /software — A/B del refactor: SIN regresión

Medido a 1280 antes y después de sustituir el bloque inline por `BlurbsIconos`,
recargando la misma página:

| | Antes | Después |
|---|---|---|
| Altura de documento | **11533** | **11533** |
| `<main>` (7 bloques) | idénticos | idénticos |
| `<ul>` de blurbs | 1639.2 / 285.2 / 482.3 / 655.9 | idéntico |
| `x` de los 6 blurbs | 482.3 · 698.7 · 915.1 (×2) | idéntico |
| Alto de blurb | 105.2 / 124.4 | idéntico |
| Icono | 1645.2 / 50 / 558.9 | idéntico |
| `<h4>` | 1725.2 / 19.2 / 482.3 / 203.3 | idéntico |

Lo único que cambia es **cómo** se pinta la separación: antes `margin-right: 2%`
con `nth-child(3n)` a 0, ahora `column-gap: 2%`. Mismas posiciones.
Móvil 390 también verificado: 1 blurb por fila a ancho completo, `mb 30`, sin
scroll horizontal.

## /kunak-api — QA VISUAL (Fase 5) · 2026-07-28

> Sustituye en autoridad al bloque **"/kunak-api — QA de construcción"** de más
> arriba, que midió con Claude in Chrome y **el móvil dentro de un iframe de
> 390** servido desde localhost. Ese atajo ocultó el defecto más grande de la
> página (S1 iba **+166.5px** en móvil): dentro del iframe el ritmo vertical no
> es el de un viewport real. Los números de aquella entrada se mantienen como
> registro histórico; los válidos son estos.
>
> Metodología (la de `CLAUDE.md`): puppeteer-core sobre el Chrome del sistema,
> headless, **perfil limpio**, Cookiebot bloqueado por `--host-resolver-rules`,
> `--hide-scrollbars`, imágenes perezosas forzadas a `eager` + pase de scroll y
> settle. **1280×900** y **390×844 reales** por
> `Emulation.setDeviceMetricsOverride`. Capturas por viewport con `setViewport`
> (nunca `fullPage`). Hovers con ratón real (`page.mouse.move`) y con el zoom
> 1.1 de la imagen como **control de que el hover aterriza**.
> Sondas en el scratchpad de la sesión: `lib.mjs` (base), `secciones.mjs`,
> `s1movil.mjs`, `s2.mjs`, `faq-strut.mjs`, `faqoffset.mjs`, `compartidos.mjs`
> (las 5 páginas a la vez), `bp.mjs` (barrido de breakpoints), `hover*.mjs`,
> `punteado.mjs`, `tiras.mjs` (capturas).

### Resultado por sección (clon vs original)

| Sección | 1280 antes | 1280 después | 390 antes | 390 después |
|---|---|---|---|---|
| S1 hero + info + beneficios | −14.5 | **−14.5** | **+166.5** | **+7.9** |
| S2 Artículos y Guías | −88.1 | **−3.1** | −167.4 | **−18.4** |
| S3 Preguntas frecuentes | −2 | **−10** | +8.5 | **−9.5** |
| S4 CTA de ancho completo | 0 | **0** | −0.8 | **−0.8** |
| Documento | −146 | **−69** | −34 | **−62** |

Ojo con los totales de documento: **no son el indicador bueno**. Antes, el
+166.5 de S1 en móvil cancelaba el −167.4 de S2 y el total salía "bueno" (−34)
con las dos secciones muy desviadas. Lo que cuenta es la tabla por sección.

### Discrepancias encontradas, por prioridad

**ALTA — corregidas**

| # | Qué | Medida | Dónde |
|---|---|---|---|
| K1 | **Ritmo móvil de S1**: 6 huecos inflados y 2 cortos | +166.5 acumulado | `HeroApi`, `InfoProductoApi`, `BeneficiosApi` |
| K2 | **Tarjeta de artículo sin los remates del módulo de blog**: falta `padding-bottom: 25px` en la ficha y el margen inferior (60 desktop / 42 móvil) | rejilla 347.3 vs 435.3 → **−88** | `UltimosArticulos` (compartido) |
| K3 | **Doble raya entre toggles del FAQ**: el clon ponía `border-y` en los 19; el original solo borde arriba en el 1.º y abajo en todos | +18.1 de alto y raya de 2px en vez de 1px | `FaqAcordeon` (compartido) |
| K4 | **Punteado invisible**: con `z-[-1]` se pinta por detrás del `bg-white` de su sección (`elementFromPoint` devolvía la `<section>`) | 3 de los 4 punteados de la página no se veían | `InfoProductoApi`, `BeneficiosApi`, `FaqAcordeon`, `UltimosArticulos` |
| K5 | **Título de artículo azul al hover** donde el original lo deja en `#333` | color | `UltimosArticulos` (compartido) |

**MEDIA — corregidas**

| # | Qué | Medida | Dónde |
|---|---|---|---|
| K6 | **Botón claro sin la geometría Divi**: `px-6` simétrico + flecha en flujo, en vez de `padding 7.5/40.5/9/22.5` con flecha absoluta y `pr 55.5` al hover | +8.5 de ancho en las 3 páginas donde se midió | `LightButton` (compartido) |
| K7 | **El h4 de los blurbs `iconos-md-3` no baja a 16/19.2 por debajo de 981px** | +2.4 por título de 1 línea, +4.8 por los de 2 | `BlurbsIconos` (compartido) |
| K8 | **La columna de toggles del FAQ no baja 10px** respecto al h2 | −10 constante | `FaqAcordeon`, prop `desfaseColumna` |

**BAJA — no se tocan**

- **K9 · Residuo del strut de los `inline-block` (punto abierto 2 del recon,
  RESUELTO Y CUANTIFICADO)**: el original pinta los blurbs con
  `display: inline-block` + `vertical-align: text-top` dentro de una columna con
  `line-height: 30.6px`, así que cada fila forma un *line box* **3.3px más alto**
  que la caja del blurb (paso real 160.3 = 129.2 del blurb + 28.16 de margen
  **+2.94 de interlínea**). El clon usa flex, donde no hay line box: paso 157.0
  exacto. Son **4 filas de blurbs → −13.2**, que es casi todo el −14.5 de S1 en
  desktop. Antes se anotó "~2.7px"; el valor medido es **3.3 por fila**. Se
  mantiene la decisión de /software: **no se fuerza**. Si algún día se quisiera,
  el arreglo es sumar 3.3 al `mb` de la fila de blurbs en `BlurbsIconos`.
- ~~**K10 · −10 de alto en la sección del FAQ.**~~ → **CERRADO el 2026-07-28**:
  era el remate inferior de la columna de toggles, que el clon fijaba en 30
  cuando el original usa **0** (/monitor, /accesorios) o **40** (/software,
  /kunak-api). Sección del FAQ ahora a **Δ 0.0** a 1280 y **+0.5** a 390 en las
  cuatro páginas. Ver "FAQ de las 4 páginas" al final del archivo.
- **P4 (heredado)**: el original **sortea** los 3 posts en cada carga. S2 no es
  comparable px a px y la altura de documento varía entre cargas (medido en el
  original: 5331 / 5358 a 1280). Los ±3…18 que quedan en S2 son eso.
- **P2 (heredado)**: la foto de la franja de cabecera cambia entre visitas.
- **A2 (heredado)**: la franja del header mide menos que la del original.

### Puntos abiertos del recon — los dos resueltos

1. **¿El título de la tarjeta de artículo se pone azul al hover?**
   **NO en las fichas de producto, SÍ en la home.** Medido con ratón real y con
   el zoom de la imagen como control:

   | Página (original) | Título al hover | Control |
   |---|---|---|
   | home | **#0075C9** | zoom OK |
   | /monitor-calidad-aire | #333 | zoom OK |
   | /software | #333 | zoom OK |
   | /kunak-api | #333 | zoom OK |
   | /accesorios | #333 | *el hover no aterrizó* |

   El recon acertaba. Como `UltimosArticulos` lo usan 4 páginas, el hover se ha
   dejado **solo en la variante `home`**. /accesorios se agrupa con las fichas de
   producto **por inferencia** (su sonda no llegó a aterrizar, pero monta el
   mismo módulo de blog: ficha `pb 25` / `mb 60`, frente al `pb 0` / `mb 40` de
   la home). Si alguien quiere cerrarlo del todo, es re-medir esa página.

2. **Residuo del strut** → K9, arriba.

Y un tercero que salió al medir: el `<h2>` "Integra datos de fuentes externas"
**no es una discrepancia de color** aunque lo parezca. El original deja el `h2`
en `#333` y mete todo el texto en un `<span>` a `#0075C9` (comprobado: el span
cubre el 100% del texto); el clon pinta el color en el propio `h2`. Misma
pintura. Anotado para que nadie lo vuelva a "arreglar".

### Verificación de no regresión (componentes compartidos)

`UltimosArticulos`, `FaqAcordeon`, `LightButton` y `BlurbsIconos` los usan las 5
páginas. Medido en las 5, original vs clon, a 1280 después de los cambios:

| | FAQ (paso / alto) | Botón claro | Ficha de artículo |
|---|---|---|---|
| home | (no tiene) | 200.3 y 210.9 = **exactos** (antes +8.5) | **intacta**: `pb 0` / `mb 0`, rejilla 361.7 — la variante `home` no se tocó |
| /monitor-calidad-aire | 61.88 = 61.88 ✔ | 285 = **285** (antes 293.4) | `pb 25` ✔, rejilla 432.3 vs 435.3 |
| /accesorios | 61.88 vs 61.87 · 1176.7 vs 1176.6 ✔ | (no tiene) | `pb 25` ✔, rejilla 432.3 vs 435.3 |
| /software | 61.88 vs 61.87 · 1176.7 vs 1176.6 ✔ · desfase 28 = 28 ✔ | 256.3 = **256.3** (antes 264.8) | `pb 25` ✔ |
| /kunak-api | 61.88 · 1176.7 vs 1176.6 ✔ · desfase 28 = 28 ✔ | 178.1 = **178.1** (antes 186.6) | `pb 25` ✔, hueco al CTA 12.8 = 12.8 ✔ |

Ninguna regresión; el arreglo del botón claro y el del FAQ **mejoran también**
las otras páginas.

### Hallazgos de otras páginas (fuera de este QA, sin tocar)

- ~~**`/monitor-calidad-aire` · el FAQ del original tiene 18 preguntas y arranca
  por "¿Qué área cubre cada dispositivo?"**~~ → **FALSO, retractado el
  2026-07-28.** Era un artefacto de sonda: el filtro descartaba los `h3` por
  encima del techo del `<h2>`, y en /monitor el primer toggle queda ARRIBA de
  ese techo. Las 19 preguntas están, y son las mismas. Ver la sección
  "FAQ de las 4 páginas" al final del archivo.
- **El punteado con `z-[-1]` (K4) está en otros 5 componentes**:
  `SectionRow`, `HeroProducto`, `InformacionProducto`, `InfoProductoSoftware`,
  `UltimosProyectos` (y `TrustBar`, con otro patrón). Casi seguro invisibles por
  el mismo motivo, pero afectan a páginas que no entraban en este QA. Se dejan
  para el QA de cada una.
- **Home**: la rejilla de artículos va **−34.9** a 1280 (su original monta la
  ficha con `pb 0` / `mb 40`, calibración distinta a la de las fichas de
  producto), y le queda un botón claro sin migrar ("¡Me apunto!", 24/24
  `inline-flex`) que no sale de `LightButton`.

### Nota de método (cara de aprender)

Durante esta tanda un `npm run build` **con `next start` levantado** dejó el
HTML estático sin regenerar: las páginas seguían sirviendo el marcado anterior
y una verificación dio por bueno un cambio que no estaba aplicado. `CLAUDE.md`
ya avisa ("parar el proceso, `npm run build` y relanzar") — cúmplase al pie, y
ante la duda `rm -rf .next`. Comprobación barata: `curl` a la página y buscar la
clase que se acaba de tocar antes de medir nada.

## FAQ de las 4 páginas — contenido compartido, presentación por página (2026-07-28)

> Arranca de una retractación: la Fase 5 de /kunak-api anotó que "/monitor tiene
> 18 preguntas y empieza por otra distinta". **Es falso.** Las sondas de aquel
> día filtraban los `h3` con `Y > techo del <h2>`, y en /monitor el primer
> toggle queda **por encima** de ese techo (el rótulo va 50.2px más abajo, ver
> abajo), así que se perdía la primera pregunta y el recuento salía 18.
>
> Metodología: puppeteer-core, perfil limpio, Cookiebot bloqueado, 1280×900 y
> 390×844 reales. Comparación **bloque a bloque sobre el DOM vivo** (párrafos,
> listas, `<br>` y enlaces), no por `textContent` concatenado.
> Sondas: `faqdump2.mjs`, `diff19.mjs`, `colfaq.mjs`, `detalle.mjs`,
> `verif4.mjs`, `secfaq.mjs`, `pad.mjs`.

### (1) Contenido: las 4 páginas comparten EL MISMO set

**19 preguntas, mismo orden, mismas respuestas** en /monitor-calidad-aire,
/accesorios, /software-de-medicion-calidad-del-aire y /kunak-api. El diff entre
las cuatro da **idéntico**: mismas preguntas, mismos párrafos, mismas listas,
mismos enlaces. La primera es "¿Los equipos Kunak son certificados ATEX?" en
las cuatro y la última "¿Cuál es la diferencia entre calibración y corrección?".

Y el `FAQ_ITEMS` del clon **ya los reproduce verbatim**: 0 preguntas distintas y
0 respuestas distintas contra el original. **No hace falta parametrizar el
dataset ni crear un set por página**: `FAQ_ITEMS` en `lib/monitor.ts` es
correcto donde está.

Tres diferencias que aparecieron en el primer diff eran **artefactos del
extractor**, no del clon (comprobadas una a una):

| Aparente | Realidad |
|---|---|
| El `<li>` del clon empieza por "•" | El original lo pinta con `li::before { content: "•"; color: #0075C9; font-size: 22.4px }`, que `textContent` no ve. El clon usa un `<span aria-hidden>•</span>` con esos mismos valores. **Misma pintura.** |
| "…del equipo.Esto permite…" sin espacio | Los dos tienen **1 `<br>`** en ese punto. El espacio extra del original es whitespace de fuente, invisible al renderizar. |
| Bloques de la respuesta 6 en distinto orden | El extractor leía un nodo clonado y sin layout. Sobre el DOM vivo coinciden. |

### (2) Presentación: eso SÍ cambia por página

Lo que difiere no es el contenido, sino tres valores de la plantilla. Medidos en
los cuatro originales a 1280 y a 390:

| | Rótulo | Punteado | Desfase de la columna | Remate inferior |
|---|---|---|---|---|
| /monitor-calidad-aire | **23px/23px** | **EN FLUJO** (`position: relative`, 22 alto + mb 28.16 desktop / 30 móvil) → empuja el rótulo **+50.2** | 0 | **0** |
| /accesorios | **23px/23px** | absoluto (−65 x, −40 y) | 0 | **0** |
| /software | 44/55 desktop · 35/43.75 móvil | absoluto | **10** | **40** |
| /kunak-api | 44/55 desktop · 35/43.75 móvil | absoluto | **10** | **40** |

El clon pintaba **44px en las cuatro**, el punteado **absoluto en las cuatro** y
un remate fijo de **30**. De ahí salían tres defectos:

- **K11 · Rótulo del FAQ a 44px en /monitor y /accesorios** donde el original usa
  23px: un titular de 3 líneas en vez de 2, muy visible.
- **K12 · Punteado absoluto en /monitor**: el rótulo quedaba 50.2px demasiado
  alto y el punteado colgado 65px a la izquierda en vez de alineado con la
  columna.
- **K13 (= K10 de la Fase 5) · Remate inferior fijo de 30**: sobraban 30 en
  /monitor y /accesorios y faltaban 10 en /software y /kunak-api.

`FaqAcordeon` recibe ahora `tituloCompacto` y `punteadoEnFlujo`; el remate se
deriva de `desfaseColumna`, porque son los dos márgenes del mismo módulo Divi y
van siempre emparejados (0+0 / 10+40).

### (3) Verificación en las 4 páginas, a 1280 y a 390

| | Rótulo | Rótulo sobre la columna | x del punteado | 1.er toggle | **Sección FAQ** |
|---|---|---|---|---|---|
| /monitor-calidad-aire | ✔ | ✔ 50.1 vs 50.2 · 52 vs 52 | ✔ 128 · 39 | ✔ 0 · 115 | **Δ 0.0 · +0.5** |
| /accesorios | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 0 · 63 | **Δ 0.0 · +0.5** |
| /software | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 10 · 127.5 | **Δ 0.0 · +0.5** |
| /kunak-api | ✔ | ✔ 0 · 0 | ✔ 63 · −26 | ✔ 10 · 127.5 | **Δ 0.0 · +0.5** |

La sección del FAQ pasa a coincidir **al píxel en las cuatro**, en los dos
anchos. Antes iba +30 en /monitor y /accesorios y −10 en /software y /kunak-api.

### Lección de método

Dos sondas distintas dieron "18 preguntas" y "otra primera pregunta" porque
ambas heredaban el mismo filtro `Y > y(h2)`. **Un filtro geométrico no sirve
para contar contenido**: si el recuento de una sonda no cuadra con lo esperado,
antes de anotarlo como hallazgo hay que reproducirlo con un criterio
independiente (aquí bastaba contar `h3` dentro de la sección, sin filtro de
posición). El coste de no hacerlo fue anotar en el QA un defecto de contenido
que no existía.

## Dos defectos transversales del recon de /sectores (2026-07-28)

> Salieron del recon del arquetipo SECTOR (`docs/research/sectores/`) al medir
> el original con el mismo arnés de siempre (puppeteer-core, Chrome del
> sistema, headless, perfil limpio, Cookiebot bloqueado). Afectan a las 5
> páginas ya clonadas, no solo a la nueva. **Los dos corregidos en esta tanda.**

### K11 · `nav.ts` — el href de EDAR daba 404 · RESUELTO

`SECTORS[2]` guardaba
`…/sectores/monitorizacion-ambiental-y-control-de-olores-en-plantas-de-aguas-residuales/`,
que devuelve **404**. El menú vivo del original usa
`…/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/` (**200**).
Comprobado con `fetch` a los dos.

Era un desajuste **interno del propio clon**: `footer.ts:29` ya tenía el bueno,
así que el mega-menú y el pie enlazaban a sitios distintos con la misma
etiqueta. Verificado en el DOM: antes del arreglo las 5 páginas servían **los
dos** hrefs; después, solo el correcto.

### K12 · `ScrollToTop` — caja 44×44 sin radio · RESUELTO

Medido en el original **en las 5 páginas** a 1440 (y confirmado a 390), con el
botón ya asentado:

| | Original | Clon (antes) | Clon (después) |
|---|---|---|---|
| Caja | **40×40** | 44×44 | **40×40** |
| `border-radius` | **5px 0 0 5px** | 6px 0 0 6px | **5px 0 0 5px** |
| `right` / `bottom` | 0 / 125 | 0 / 125 | 0 / 125 |
| `background` | rgba(0,0,0,.4) | ídem | ídem |
| `z-index` | 99999 | ídem | ídem |
| Chevron (tinta medida) | **14×8 centrado** | 14×8 centrado | **14×8 centrado** |

**El icono no se tocó, y es deliberado.** El original encaja un glifo de fuente
ETmodules ("2") de 30px en la caja de 40 con `padding: 5px`; el clon usa un SVG.
Midiendo la tinta blanca sobre capturas ampliadas ×5, el chevron visible mide
**14×8 px en ambos**, así que reproducir el `padding: 5px` con un SVG de 30×30
habría **agrandado** el chevron respecto al original. Se replica el resultado,
no la implementación. Residuo: el glifo del original va 1px más a la derecha
dentro de la caja (centro x 20.9 vs 19.9) — es el side bearing de la fuente.

**Sin regresión, verificado por medición y no por razonamiento** (el botón es
`position: fixed`, pero el baseline se midió de verdad haciendo `git stash` +
build): alturas de documento idénticas antes y después en las 5 páginas y en
los dos anchos.

| | home | monitor | accesorios | software | api |
|---|---|---|---|---|---|
| @1440 antes / después | 11870 / **11870** | 12410 / **12410** | 10863 / **10863** | 11711 / **11711** | 5289 / **5289** |
| @390 antes / después | 19182 / **19182** | 21854 / **21854** | 21180 / **21180** | 20844 / **20844** | 9125 / **9125** |

### K13 · Remates del mismo botón: umbral y hover · RESUELTO (2026-07-28)

**Umbral de aparición: `scrollY > 800`, constante.** El clon usaba 500px fijos.

> ⚠️ **Corrección de un hallazgo mal anotado en K12.** Allí se dijo que el
> original "aparece al pasar una pantalla completa" y que la regla parecía ser
> `scrollY > innerHeight`. **Es falso.** Salió de muestrear en pasos de 100px a
> dos alturas de viewport (900 y 844) que están las dos entre 800 y 900: los
> dos casos daban "off en y800, on en y900" y eso se leyó como dependencia del
> viewport. Repetido con **búsqueda binaria del punto de corte a cuatro
> geometrías** —1440×600, 1440×900, 1440×1200 y 390×844— los cuatro cortan en
> el **mismo** sitio:
>
> | Viewport | `innerHeight` | Corte | umbral / innerHeight |
> |---|---|---|---|
> | 1440×600 | 600 | **800–802** | 1.337 |
> | 1440×900 | 900 | **800–802** | 0.891 |
> | 1440×1200 | 1200 | **800–802** | 0.668 |
> | 390×844 | 844 | **800–802** | 0.950 |
>
> Al píxel: **off en y800, on en y801**, y sin histéresis (bajando se apaga en
> el mismo 800). Es la misma lección que dejó el falso hallazgo del FAQ al
> final de este archivo: **dos muestras que comparten el sesgo del método no
> son dos comprobaciones**. Aquí bastaba variar el alto del viewport.

**Hover: fondo `#0075C9`.** El clon oscurecía a `bg-black/60`. Medido en el
original: reposo `rgba(0,0,0,.4)` → hover `rgb(0,117,201)` → vuelta a
`rgba(0,0,0,.4)`. El cambio es **instantáneo**: el original computa
`transition: all 0s`. La `transition-opacity duration-300` del clon solo afecta
a la aparición (en el original ese fundido lo hace jQuery, no CSS), así que no
se toca.

**Verificado en el clon**, las 5 páginas × 3 geometrías (1440×900, 1440×600 y
390×844): corte en **800/801 en las 15 combinaciones** —igual que el original y
sin depender del alto de viewport— y hover `rgb(0, 117, 201)` en las 5.

Sin regresión: alturas de documento idénticas a las de K12 en las 5 páginas y
los 2 anchos (11870 · 12410 · 10863 · 11711 · 5289 a 1440; 19182 · 21854 ·
21180 · 20844 · 9125 a 390). El botón es `position: fixed` y ninguno de los dos
cambios es de maquetación, pero se volvió a medir.

#### Dos trampas de la sonda, pagadas en esta tanda

1. **No leer la `opacity` computada para saber si el botón está visible.** El
   clon tiene `transition-opacity duration-300`; con una espera de 260 ms la
   opacidad va todavía por 0.9x, así que el test daba **falso negativo** y la
   búsqueda binaria convergía a un 1500 sin sentido, idéntico en las 5 páginas
   (señal de que el sondeo estaba roto, no de que el umbral fuera ése). Hay que
   mirar la **clase** de estado, que cambia sin transición — el equivalente del
   `et-visible` del original.
2. **`document.scrollHeight` depende de dónde esté el scroll.** Medido al final
   de un pase de scroll, la home a 390 da **19174**; medido con el scroll en 0,
   **19182**. Son 8px del header, que al hacerse sticky pasa a `position:
   fixed` y sale del flujo. Para comparar alturas hay que usar **la misma sonda
   y el mismo estado de scroll** en el antes y el después, no dos sondas
   distintas.

## /sectores/[slug] — QA de construcción (2026-07-28)

> Primera **ruta anidada y dinámica** del proyecto:
> `src/app/sectores/[slug]/page.tsx` con `generateStaticParams()` sobre
> `SECTORES_PUBLICADOS` de `src/lib/sectores.ts`. Hoy solo Urbano; dar de alta
> otro sector es añadir un `SectorPage` a esa lista, sin tocar código.
> Medido con el arnés de siempre (puppeteer-core, Chrome del sistema, headless,
> perfil limpio, Cookiebot bloqueado, `--hide-scrollbars`, lazy→eager + pase de
> scroll) a **1440×900** y **390×844** reales. Sondas en el scratchpad:
> `spec.mjs` (fichas de los 6 bloques), `cmp.mjs` (clon vs original),
> `clon.mjs` (no regresión de las 5 páginas), `umbral.mjs`, `shots.mjs`.

### Alturas y anclas

| | original | clon | Δ |
|---|---|---|---|
| Documento @1440 | 6081 | **6122** | +41 |
| Documento @390 | 10913 | **11064** | +151 |

Sin scroll horizontal en ninguno de los dos (`scrollWidth == clientWidth`).

Anclas verticales (Δ del clon contra el original):

| Ancla | @1440 | @390 |
|---|---|---|
| h1 de la cabecera | **0** | **0** |
| banda de clientes | **0** | **0** |
| breadcrumb | **0** | **0** |
| h2 del hero | **0** | **0** |
| título del CTA de descarga | **0** | −8.4 |
| h3 "Beneficios…" / "Aplicaciones…" | −8.6 | −8.5 |
| claim azul | +5.4 | +5.5 |
| h2 "Nuestras soluciones" | −8.7 | −8.5 |
| h2 "Últimos proyectos" | −8.6 | −18.6 |
| h2 "Artículos y Guías" | −24.8 | −82.5 |
| footer | −73.8 | −141.4 |

Y coinciden **al píxel** las cajas: h2 del hero 585.1×121 · h3 de listas
468.1×175 · claim 560.1×148 · banda 1440×122 · panel de soluciones
**780.2×500** · fila del h2 de proyectos 122.6.

### Tres errores propios que costó encontrar (y cómo se vieron)

1. **La retícula del sector es el 86%, no el 80%.** El recon anotó "80% máx
   1380 (1238.4px a 1440)" — dos datos que no cuadran entre sí: 80% de 1440 son
   1152. Medido a cuatro anchos (1280/1440/1600/1800 → 1100.8 · 1238.39 · 1376
   · 1380) la fila es **86% con máximo 1380**, que entra a ~1605px. Corregido en
   los 7 componentes, en la página y en las specs. Se vio porque las cajas del
   h2 y del h3 salían ~41px estrechas.
2. **`ProductosTabs` anidaba dos retículas.** Con `sinTitulo` seguía aplicando
   su propia fila dentro de la fila del sector → panel de 671 en vez de 780.2.
   Ahora en ese modo va a `w-full` y la fila la pone la página.
3. **Un `style` inline no lo pisa una clase `md:`.** El fondo del CTA de
   descarga iba en `style={{backgroundColor}}` y la caja salía **gris también
   en desktop**, cuando ahí es blanca con borde. Movido a clases. De rebote
   apareció el otro clásico: la regla global `p { color: #333 }` le gana a la
   herencia, así que en móvil el texto del CTA salía gris sobre fondo oscuro —
   el color va explícito en cada `<p>` (mismo tropiezo que M1 en la home).

### Residuo: los interiores de las tarjetas (−74 @1440 / −141 @390)

Todo el delta que queda está **después** de "Nuestras soluciones" y es de los
interiores de `UltimosProyectos` y `UltimosArticulos`, que son **compartidos con
la home, /monitor, /software y /kunak-api**:

- ficha de caso **404.9** en el clon vs **421.1** en el original (−16.2);
- ficha de artículo **395.6** vs **414.5** (−18.9).

Desglosado: el `.case-cliente` del original va a `16px/**30.6**` y el clon usa
`leading-[1.4]` (22.4) → −8.2; la foto lleva `margin-bottom: 4` que el clon no
pone → −4; el resto son 2-4px de la caja de taxonomías. **No se toca**:
corregirlo cambia la tarjeta en las cuatro páginas ya verificadas y eso pide su
propia tanda con medición antes/después. Anotado aquí para que no se
re-investigue.

Lo que sí se ajustó, y solo para el sector, es el `margin-bottom: 40` de la
ficha, que en el original cuenta **también cuando las 3 caben en una fila** (la
rejilla mide ficha + 40); el `gap-y` del clon solo actúa entre filas.

### Verificado en vivo

- **Autoplay del CTA**: cambio de diapositiva cada **~6950 ms** medido en el
  clon (original 7000). Fundido cruzado, 3 dots, flechas al hover.
- **Rutas locales**: `Inicio → /` y `Ver más → /monitor-calidad-aire`. El resto
  apunta al original porque no está clonado, con `target="_blank"` solo en los
  dos que lo llevan (`Descargar informe` y `Ver todos los casos de éxito`).
- **404** en un slug que no existe (`/sectores/no-existe`).

### Sin regresión en las 4 páginas anteriores

Se tocaron 5 componentes compartidos (`TrustBar`, `Footer`, `ProductosTabs`,
`UltimosProyectos`, `UltimosArticulos`). Alturas de documento **idénticas** al
baseline de K12/K13 en las 5 páginas y los 2 anchos:

| | home | monitor | accesorios | software | api |
|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 |

Todas las variantes nuevas van cerradas por prop (`TrustBar variant`,
`Footer stripImage`, `ProductosTabs sinTitulo`, `UltimosProyectos bare`,
`UltimosArticulos variant="sectores"`), así que el camino por defecto de esas
páginas no cambia.

### Pendientes

- **S1 · RECLASIFICADO (2026-07-30): no es «interiores de tarjeta», es la mitad
  construida de la mayor deuda del sitio.** Sigue midiendo −16.2 (caso) y −18.9
  (artículo), pero eso ya no es lo que decide su prioridad. Ver **§S1** abajo.
- **S2 · `ProductosTabs` en la home**: el original le da al panel
  `height: 500px` y `margin-bottom: 32`; el clon va a 497.5 con `mb 0`. En el
  sector se aplica (la lista de 3 ítems deja mandar al panel y sin los 500 el
  bloque salía +79.5); en la home la lista de 5 lo enmascara y **se deja como
  está** para no tocar una página verificada. Pendiente de su QA.
- **S3 · `MapaProyectos` es un placeholder deliberado**: pinta titular, intro y
  la lista de pines, no el mapa de Google (haría falta clave propia). Urbano no
  lo usa; lo usarán Industria, Puertos y Minería.
- **P4 (heredado)**: los 3 artículos van congelados y el original los sortea —
  entre dos medidas del mismo día su footer se movió de 5487.2 a 5514.2.

## /sectores — lo que enseñó poblar el 2º sector (2026-07-28)

> Industria y olores se pobló **solo con datos** (commit `6b65c2d`) para probar
> hasta dónde llega la plantilla. El modelo aguantó: otra composición, otro
> orden y los dos tipos que Urbano no ejercitaba (`listaSimple2Col`,
> `mapaProyectos` con 41 pines) entraron sin tocar código. Lo que falló fue el
> **componente**, calibrado viendo una sola instancia.

### S4 · Las dos pieles del shortcode `calls` · RESUELTO

| | `"foto"` (Urbano) | `"fondo"` (Industria) |
|---|---|---|
| Clases | `…espacio-derecha …` **`call-con-foto`** | `calls one-column call-fondo-blanco espacio-blanco-derecha` |
| La foto | `<img>` 280 a la izquierda, sangrada −30 | **`background-image: cover`** a `0% 0%` |
| `.calls-content` | `flex` | `block` |
| `padding` desktop | 40/50 | **40/60** |
| `padding` móvil | 30/30/40 | **40/60** |
| Texto | inner 866.4 | inner 1116.39 con `padding-left` **36%** |
| Alto @1440 | 337 | **420** |

Añadido `variante?: "foto" | "fondo"` al bloque (por defecto `"foto"`). El campo
`image` ya servía para las dos: lo que faltaba era el discriminador.
**Verificado contra el original a 1440 y 390**: caja `1238.4×420` / `335.4×578.6`,
`padding 40px 60px`, x del título `563.7` / `87.3` — **idénticos**.

### S5 · El color del titular del hero es CONTENIDO · RESUELTO

`SectorHero` cableaba `#0075C9`. Urbano usa ese, **Industria usa `#0c71c3`**
(el azul por defecto de Divi) — y dentro de la propia Industria el claim sí
lleva `#0075c9`, o sea que conviven los dos en la misma página. Viene del
`<span style="color:…">` que escribe quien edita en WordPress. Añadido
`headingColor?: string` al content type. Verificado: `rgb(12, 113, 195)` en el
clon y en el original.

### S6 · Rítmica Divi entre párrafos del `.calls-text` · RESUELTO

El original da `padding-bottom` de 1em a cada `<p>` salvo el último: **18px en
desktop, 14px en móvil**. Faltaba. No se veía en Urbano, que tiene un solo
párrafo; Industria tiene dos y salían pegados. Verificado: `79.2/pb18 + 61.2/pb0`
a 1440 y `103.6/pb14 + 112/pb0` a 390, igual que el original.

### Sin regresión

Las 6 páginas anteriores mantienen su altura exacta en los 2 anchos:

| | home | monitor | accesorios | software | api | urbano |
|---|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 | 6122 |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 | 11064 |

---

### Dos hallazgos NUEVOS de Industria

Salieron al medir Industria a fondo después de los tres arreglos.

**S7 · Los bloques del cuerpo son FILAS de una sección, no secciones sueltas ·
RESUELTO (2026-07-29).**
`SectorBody` metía cada bloque en su propia `<section>` con su ritmo (sección
`pb-14` + fila `py-2%`). El original agrupa o separa según le conviene: en
**Urbano** el CTA y las listas están en **dos secciones** distintas (S4 y S5) y
por eso las cuentas encajaban; en **Industria** los cinco bloques son **cinco
filas de la MISMA sección** (S4), donde entre fila y fila solo hay el
`padding-bottom` de la anterior.

Medido a 1440: el bloque de listas coincidía **al píxel** (h3 175/120, ul
363.5/332.9, fin 2016.3) y aun así el CTA caía a 2128.9 frente a 2086.1 del
original. El +42.8 era exactamente **14** (el `pb` de sección de
`BeneficiosAplicaciones`) **+ 28.797** (el `pt` de fila de `CtaDescarga`), que
en el original no existen porque las dos filas comparten sección. De ahí bajaba
todo ~+70 hasta el pie.

*Cómo se arregló.* No con CSS: **le faltaba un campo al content type**. Se midió
con `scripts/qa/tree-todos.mjs` el árbol sección→fila de los **8 sectores
vivos** (no de 2 — ése fue el error original), y salieron solo dos formas de
sección y dos de fila. De su combinación sale `SectorBlockFlujo`, con 4 valores:

| valor | qué monta | ritmo medido (1440 / 390) |
|---|---|---|
| `seccion` | abre `<section>` con ritmo | `mt −14` · `pt 57.5938 / 50` · `pb 14`; fila `pt 2% / 30` |
| `seccionRasa` | abre `<section>` sin ritmo | `mt 0` · `pt 0` · `pb 0`; fila `pt 2% / 30` |
| `fila` | otra fila de la sección abierta | `pt 2% / 30` |
| `filaPegada` | otra fila, pegada a la de arriba | **`pt 0`** |

Reparto en los 6 de plantilla clásica: Urbano y Construcción `cta seccionRasa ·
beneficios seccion · claim filaPegada`; Industria `beneficios seccion · cta ·
lista · claim filaPegada · mapa fila`; Puertos `… cta fila · claim filaPegada ·
mapa fila`; Minería `… claim · cta filaPegada · mapa fila`; Investigación
`beneficios seccion · claim filaPegada`. (EDAR y Petróleo y gas van con otra
plantilla y quedan fuera.)

Los 5 componentes de bloque dejan de envolverse a sí mismos y pintan **solo el
contenido de su fila**; `SectorBody` monta la `<section>` y la retícula. El
ritmo es plantilla y vive en el componente; **dónde corta** es editorial y vive
en el dato.

Resultado medido (2026-07-29, original vs clon, mismo día y configuración).
Informe completo, con el árbol sección→fila y el Antes/Después de las 7 páginas:
**`docs/research/sectores/MEDICION-S7.md`**.

| | Industria @1440 | Industria @390 | Urbano @1440 | Urbano @390 |
|---|---|---|---|---|
| fila del CTA (top) | **2086.1 / 2086.1 → Δ0** (antes +42.8) | **3653.06 / 3653.06 → Δ0** | 1532.9 / 1532.9 → Δ0 | −8.4 |
| fila del claim | Δ0 | −47.5 (ver S9) | −8.6 | −8.5 |
| fila del mapa | Δ0 | −47.5 | — | — |
| alto de la sección | — | — | **1057.45 / 1057.45** | **1970.16 / 1970.16** |

Las cinco filas de Industria comparten ya una sola `<section>` con los mismos
`pt/pb` que el original, y sus cuatro primeras filas arrancan **al píxel**.
Urbano, cuya sección de listas+claim ahora clava el alto en los dos anchos, ve
además corregido un error propio de +14 que tenía el claim: antes caía tras el
`pb` de sección de las listas, y en el original va **antes** de ese `pb`.

Alturas de documento tras S7:

| | home | monitor | accesorios | software | api | urbano | industria |
|---|---|---|---|---|---|---|---|
| @1440 | 11870 | 12410 | 10863 | 11711 | 5289 | **6122** | 7229 → **7171** |
| @390 | 19182 | 21854 | 21180 | 20844 | 9125 | **11064** | 12626 → **12566** |

Las 6 páginas anteriores no se mueven ni un píxel, **Urbano incluido** (su
cuerpo pesa lo mismo: los 14px solo cambian de sitio dentro de la sección).
Industria adelgaza **−58 a 1440 y −60 a 390**, que es justo lo que sobraba: a
1440, `14` (pb de sección) + `28.797` (pt de fila del CTA) + `28.797` (pt de
fila de las listas); a 390, `14 + 30 + 30` menos el `pt` de sección que ya no se
duplica. Contra el original medido en la misma corrida queda en **+27** (7144) y
**+41** (12525).

⚠️ Al comparar con la tabla del 2026-07-28, ojo con la base: dos corridas de hoy
leyeron el original a 7117 y a 7144 a 1440. Es sitio vivo — los residuos solo
valen contra la lectura de su propia corrida, y por eso arriba se da el
adelgazamiento del clon, que sí es estable.

**S8 · `MapaProyectos` no fijaba altura en móvil · RESUELTO (2026-07-28).**
El contenedor llevaba `md:h-[570px]`, así que a 390 los 41 pines se desplegaban
enteros: **1632.9** de alto frente a los **570** del original. Medido el
`et_pb_map_container` del original: **`height: 570px` fijo en los dos anchos**
(1238.4×570 y 335.4×570), así que la altura va **sin prefijo**.

Efecto en Industria a 390: el mapa pasa a 570 (Δ0) y el documento de **13689 a
12626** frente a los 12530 del original — el desfase cae de **+1159 a +96**. Las
anclas de más abajo pasan de +1053 / +1043 / +979 a **−9.6 / −19.7 / −83.5**,
ya dentro del residuo conocido de los interiores de tarjeta (S1). Desktop no se
mueve (ya iba a 570). Sin regresión en las 6 páginas anteriores.

Sigue en pie lo de S3: el mapa de Google **no se clona** (haría falta clave
propia); el bloque pinta titular, intro y la lista de pines en la caja de 570.

---

---

## /sectores — 3º y 4º sector, solo datos (2026-07-29)

> **Construcción** (`contaminacion-por-construccion`) e **Investigación y
> consultoría** (`estudio-de-la-contaminacion-atmosferica`), poblados **sin
> tocar una sola línea de componente**. `npm run check`: 0 errores.

Elegidos por lo que ejercitan, no por completar la lista:

- **Construcción** es el único de los 8 que pone el CTA de descarga **por
  delante** de las listas (`cta seccionRasa · beneficios seccion · claim
  filaPegada`). Invierte el orden respecto a Industria y es el que de verdad
  prueba la regla de agrupación de `SectorBody`: dos secciones, la primera rasa.
- **Investigación** es el **caso mínimo**: dos bloques, una sección, y el único
  sector **sin CTA de descarga** (0 `.calls`). Prueba que el cuerpo es libre de
  verdad y no una plantilla con huecos opcionales.

### Por qué Puertos y Minería quedan fuera

**Decisión deliberada, no un pendiente.** Los dos son **permutaciones de una
topología ya validada**: Puertos es `beneficios seccion · cta fila · claim
filaPegada · mapa fila` y Minería `beneficios seccion · claim · cta filaPegada ·
mapa fila` — las mismas piezas que Industria en otro orden, sin un solo tipo de
bloque ni valor de `flujo` que no esté ya ejercitado.

Su único aporte diferencial son **30 y 32 pines** de datos para `mapaProyectos`,
que es un **placeholder deliberado** (S3: el mapa de Google no se clona, haría
falta clave propia de GCP). O sea: coste de transcripción real, información
nueva **cero**.

Para una **biblioteca de arquetipos**, que es lo que se está construyendo, no
aportan. Si algún día el objetivo cambia a clonar el sitio entero, entran — los
datos están inventariados y las sondas los miden sin tocar nada.

### Medición (2026-07-29, original vs clon, misma corrida)

**Cuerpo exacto en los dos sectores y en los dos anchos.** Todas las anclas del
cuerpo a Δ0:

| ancla | Construcción @1440 | Construcción @390 | Investigación @1440 | Investigación @390 † |
|---|---|---|---|---|
| cta | **−0.1** | **0** | (no tiene) | (no tiene) |
| beneficios | **0** | **0** | **0** | **0** |
| aplicaciones | **0** | **0** | **0** | **0** |
| claim | **0** | **0** | **0** | **0** |
| soluciones | −0.1 | −35.1 (S10) | **0** | **0** |
| proyectos | **0** | −45.3 | −0.1 | −10.2 |

† Investigación @390 lleva una base de **+11.2** en el `h1` (S11); la columna da
el valor **relativo a esa base**, según la regla 2 del protocolo.

Sin regresión: las 7 páginas anteriores mantienen su altura **al píxel** en los
dos anchos (home 11870/19182 · monitor 12410/21854 · accesorios 10863/21180 ·
software 11711/20844 · api 5289/9125 · urbano 6122/11064 · industria
7171/12566). `/sectores` da **404** — el índice no está clonado, así que pasar
`SECTORES_PUBLICADOS` de 2 a 4 entradas solo emite rutas nuevas y no cambia
ninguna página existente.

### Dos hallazgos NUEVOS, sin arreglar (son de componente)

Los dos salieron **porque estos dos sectores tienen textos que los anteriores no
tenían**. Es justo para lo que sirve poblar más instancias.

**S10 · `CtaBannerSlider` tiene alto fijo a 390 y el original crece con el
titular.** Medido: el slider del clon mide **345.1 en Construcción y 345.1 en
Urbano** — el mismo. El del original no: en Urbano coincide (Δ0 antes y después
del slider) y en Construcción es ~35 más alto, porque su primera diapositiva
—*"Controla la calidad del aire en las obras y contribuye al bienestar de las
personas"*— envuelve a más líneas. De ahí el **−35.1** que aparece de golpe
entre el claim y "Nuestras soluciones", y que arrastra el resto de la página.
No afecta a 1440 (Δ−0.1).

**S11 · `CabeceraSector` crece de más cuando el kicker envuelve a dos líneas.**
Investigación tiene el kicker más largo de los 8 ("Investigación y consultoría")
y a 390 envuelve. El original lo absorbe con **+19.4** sobre la posición del
`h1` de los demás sectores (189.4 → 208.8); el clon con **+30.6**, que es su
`line-height` completo. De ahí los **+11.2** de base, que arrastran toda la
página. A 1440 no envuelve y el Δ es 0.

Ninguno de los dos se toca en esta tanda: el encargo era **solo datos**, y
tocarlos habría ocultado precisamente el dato de que la plantilla aguanta 4
sectores sin una línea de componente.

### Lo que queda incumplido y no entraba en el encargo

**`nav.ts` apuntaba los 8 sectores al original** — **RESUELTO el 2026-07-29**:
los 4 clonados pasan a ruta local y los 4 no clonados se quedan en el original,
con el criterio escrito en la cabecera de `SECTORS` para quien añada el
siguiente. Medidas las 9 páginas a 1440 y 390 antes y después: **las 18 lecturas
idénticas**, sin regresión (un href no mueve layout, pero `nav` lo comparten
todas las páginas y era justo el caso donde uno sustituye medición por
confianza).

⚠️ **Al arreglarlo salió que la regla estaba rota en TRES ficheros, no en uno.**
El HTML servido seguía trayendo los hrefs originales de los 4 clonados desde:

**Y al cerrarla por clase salieron dos más**, que ni el grep de sectores habría
encontrado. Estado final, **todo resuelto el 2026-07-29**:

| fichero | qué pinta | estado |
|---|---|---|
| `src/lib/nav.ts` | mega-menú de Sectores + "Inicio" + selector de idioma | ✅ |
| `src/lib/footer.ts` | columna de Sectores del pie | ✅ |
| `src/lib/home-carrusel-sectores.ts` | `SECTOR_SLIDES` (era `sectors.ts`) | ✅ |
| `src/components/HeaderNav.tsx` | "Inicio" del menú principal y del móvil | ✅ |
| `src/components/monitor/HeroProducto.tsx` | breadcrumb del hero → pasa a `Link` | ✅ |
| `accesorios.ts` · `api.ts` · `software.ts` | breadcrumb "Inicio" ×3 | ✅ |

### La guarda: `scripts/qa/enlaces.mjs`

Se cierra **por clase, no por instancia**. La sonda recorre el HTML **servido**
de las páginas publicadas y compara cada href al original contra **las rutas que
emite el build** (`.next/prerender-manifest.json`). Publicado → fallo; no
publicado → correcto. **Sin lista manual**: cuando se clone el monográfico, sus
enlaces pasan a ser fallo sin que nadie toque la sonda.

Tres afinados que costaron una corrida cada uno y están en su cabecera:

- **Solo anclas.** `<link rel="canonical">` y `og:url` **deben** apuntar al
  original — declaran cuál es la página buena para los buscadores. Mirándolos,
  la guarda pedía romper el SEO.
- **Solo la rama `/es`.** El clon reproduce ese árbol. "Quitar el prefijo de
  idioma, sea cual sea" daba la home francesa y la raíz como si fueran la
  nuestra.
- El localizador de origen exige que la cola **cierre el literal**: como
  subcadena, el href de la home (`/es/`) casaba con toda línea que tuviera
  cualquier URL del original.

Verificación: **limpia** (1000 hrefs al original, 545 destinos externos
distintos, ninguno con ruta local) y **las 18 lecturas de altura idénticas**.

Lección de método, ya generalizada en `CLAUDE.md`: **verificar contra la salida
servida, nunca contra la fuente que uno supone responsable.** Se arregló
`nav.ts` dando por hecho que era el responsable, y el menú seguía trayendo
hrefs del original desde otros dos ficheros.

---

## CLASE · S9, S10 y S11 son el mismo hallazgo cuatro veces

> **Léelo antes que los cuatro apartados que vienen debajo.** Por separado
> parecen flecos de pulido. Juntos son una sola cosa, y esa cosa es deuda de
> **CMS-readiness**, no de acabado.

Los cuatro residuos vivos del arquetipo SECTOR tienen la misma causa raíz: **un
componente construido para el contenido de UNA instancia, no para un rango de
contenidos.**

| | qué se cableó | qué lo destapó |
|---|---|---|
| **S9b** · caja del CTA | el alto que daba el texto de Urbano | Industria, con dos párrafos y otra piel |
| **S9c** · cabecera del mapa | la del primer sector con mapa | el mismo bloque en otro sector |
| **S10** · `CtaBannerSlider` | **alto fijo** (345.1 a 390) | Construcción, con titulares que envuelven más |
| **S11** · `CabeceraSector` | un kicker que **no envuelve** | "Investigación y consultoría", el más largo de los 8 |

Y una quinta de la misma familia, ya resuelta, que sirve de patrón: **S9a**, la
intro de `listaSimple2Col`, donde el clon monta **una** maquetación y el
original tiene **dos** (la intro cuelga de la fila anterior).

El síntoma siempre es el mismo: el original **crece con su contenido** y el clon
**no**, porque se midió una instancia y se cableó el número. Por eso ninguno
apareció en QA de la página para la que se construyó el componente: **solo se
ven al poblar la segunda, la tercera o la cuarta**.

### Por qué es CMS-readiness y no pulido

Un CMS no da un rango de contenido: da **cualquier** contenido. Un componente
con alto fijo o con una sola maquetación no falla el día que se despliega —
falla el día que alguien escribe un titular de tres líneas. Los cuatro son
**defectos de contrato**, no de píxel: el componente promete servir al arquetipo
y solo sirve a la instancia que se midió.

### El catálogo de instancias, ampliado por el recon del MONOGRÁFICO (2026-07-29)

La precondición de la tanda es "tener el rango real". EDAR y Petróleo y gas
**reutilizan la cabecera y el slider tal cual** (medido original contra original,
`docs/research/monografico-tecnico/components/cabecera-hero-cola.spec.md`), así
que suman dos instancias a cada uno — y de paso fijan los extremos:

| | valor medido | dónde |
|---|---|---|
| **S10** · alto del slider @390 | 265.06 · **300.14** · **300.14** · 300.16 | Urbano · EDAR · Petróleo · Investigación |
| S10 · alto del slider @1440 | **401.56 en las cuatro** — a desktop es constante | — |
| S10 · lo que hay cableado en el clon | **345.1**, que no coincide con ninguna | `CtaBannerSlider` |
| **S11** · líneas del `h1` @390 | 2 · **4** · 3 · 3 | Urbano · **EDAR (máximo del sitio)** · Petróleo · Investigación |
| S11 · kicker que envuelve a 2 líneas | "Investigación y consultoría" | el más largo de los 8 |

O sea: el alto del slider a 390 **no es un número, es el máximo de sus 3
diapositivas**, y a 1440 sí es constante. Cuando se aborde la tanda, el criterio
*"el alto lo pone el contenido"* tiene aquí sus dos regímenes ya medidos y no
hay que volver a buscarlos.

### Cómo se resuelve: una tanda única, y no ahora

**No se arreglan de uno en uno según van saliendo.** Eso reproduce el error que
los causó: calibrar contra la instancia que se tiene delante.

Se resuelven en **una sola tanda, con criterio común** —*el alto lo pone el
contenido, no el componente*— y **con el catálogo de instancias ya completo**,
es decir cuando estén medidos los 8 sectores (o los que se decidan clonar). Solo
entonces se conoce el rango real: el kicker más largo, el titular de slider que
más envuelve, el CTA con más párrafos.

Hacerlo antes es adivinar el rango. Hacerlo por separado es cablear otra vez.

---

### S9 · Tres residuos que destapó la medida de S7, sin arreglar (2026-07-29)

> **Reclasificados contra el suelo de ruido el 2026-07-29. Los cuatro
> sobreviven** — ninguno es ruido. Ver el cuadro al final de la sección.
> Y ver la **nota de CLASE** de arriba: no se arreglan sueltos.

Con el ritmo de secciones ya exacto, lo que queda del desfase de los dos
sectores es **contenido dentro de la fila**, no la fila. Son tres cosas
distintas y ninguna entraba en el encargo de S7. Medido con
`qa/tree-cmp.mjs` (fila a fila, original vs clon).

**S9a · La `intro` de `listaSimple2Col` está en la fila equivocada.** En el
original de Industria el párrafo *"Algunos de las aplicaciones donde desplegar
sistemas de monitorización ambiental son:"* es un módulo de texto **al final de
la fila del CTA**, no la cabecera de la fila de las listas:

| fila @1440 | original | clon | Δ |
|---|---|---|---|
| CTA | 525.61 | 495.02 | **−30.6** |
| listas | 236.36 | 266.95 | **+30.6** |

Los 30.6 son exactamente el párrafo (18/30.6). A 390 son 61.78 (envuelve a dos
líneas), con el mismo trasvase. **Efecto vertical neto: cero** — la fila
siguiente arranca al píxel en los dos anchos —, así que se ve solo como que la
intro cae 30.6 más abajo de lo que debe.

No se toca porque el arreglo honesto es de modelo, no de CSS: si la intro
pertenece a la fila del CTA, entonces **no es un campo de `listaSimple2Col`**
sino un módulo de texto suelto que Divi deja colgar de cualquier fila. Antes de
inventar un `SectorBloqueTexto` conviene ver si se repite en Puertos y Minería o
es una excentricidad de quien editó Industria.

**S9b · La caja del CTA de descarga es más baja que la del original, y por
motivos distintos en cada piel.**

| | @1440 | @390 |
|---|---|---|
| piel `"foto"` (Urbano) | −8.6 | −8.4 |
| piel `"fondo"` (Industria) | 0 (una vez descontada S9a) | −47.5 |

La piel `"fondo"` **clava el desktop** y se queda corta solo en móvil. La piel
`"foto"` va −8.5 en los dos anchos, y ese −8.6 es el ÚNICO residuo de Urbano:
todas sus anclas, de la cabecera al pie, van desplazadas ese mismo valor y ni
una más. Es un interior de caja (padding o alto de la foto de 280), no ritmo.

**Origen del −47.5 a 390: PREEXISTENTE, verificado — no es regresión de S7.**
Comprobado con `git checkout` al commit anterior a S7 (`5db79ee`), `npm run
build` y la misma sonda; clon contra clon, que es determinista. La fila del CTA
mide **591.14 de contenido antes y después** de S7 (651.14 con `pt 30` →  621.14
con `pt 0`): S7 solo tocó el `padding`. El original mide 700.42 de contenido, y
esos 109.28 de déficit son 61.78 del párrafo mal colocado de S9a más **47.5 de
la caja**. Antes de S7 el claim daba **+26.5** contra el original de su corrida;
S7 retira 74 de ritmo sobrante (`14 + 30 + 30`, todos `pt 0` en el original) y
`26.5 − 74 = −47.5` — el déficit estaba **tapado** por un sobrante que lo
compensaba de más. Detalle en `docs/research/sectores/MEDICION-S7.md`.

**S9c · La fila del mapa es +13 en los dos anchos** (740.19 → 753.19 a 1440;
836.28 → 849.28 a 390). El contenedor de 570 es exacto desde S8, así que los 13
están en el bloque de titular + intro que va encima: el clon monta `h2 55 +
pb 10 + intro 30.6 + mt 30` = 695.6 y el original mide 682.6. Recordatorio de
que `MapaProyectos` es un **placeholder deliberado** (el mapa de Google no se
clona), así que afinar su cabecera solo tiene sentido cuando se decida qué se
pinta dentro.

### P4, ascendido: de fleco heredado a suelo de ruido del proyecto (2026-07-29)

P4 llevaba desde la Fase 5 anotado como "heredado, no es defecto, no comparable
px a px". **Eso se queda corto y hay que leerlo al revés.** Medido con
`scripts/qa/ruido.mjs` (3 corridas × 7 páginas × 2 anchos = 42 cargas del
original), P4 no es un fleco de una página: es **la única fuente conocida de
dispersión de todo el sitio**.

| | antes | ahora |
|---|---|---|
| qué es | un residuo heredado de una zona | **el suelo de ruido del proyecto** |
| dónde | "Artículos y Guías" | **exactamente una fila por página**, siempre ésa |
| cuánto | "no comparable" | **27, 54 u 81** — uno, dos o tres renglones de 27px |
| causa | "el original los sortea" | la misma, **y ya está confirmada como la única** |
| fuera de ahí | sin medir | **dispersión 0**, tres corridas al céntimo |

Consecuencias prácticas, que es lo que lo hace un ascenso y no una nota:

1. **Es la magnitud contra la que se juzga cualquier Δ.** Un residuo del cuerpo
   no se compara contra 81: se compara contra **0**.
2. **Acota dónde NO mirar.** Si un desfase aparece por primera vez en el bloque
   de artículos o de ahí abajo y vale ≤81, no se investiga.
3. **Explica retroactivamente medidas viejas.** Los `9176 / 9203 / 9230` de tres
   cargas del original en la QA de /accesorios son exactamente 27 y 27: era esto,
   ya visible entonces sin que se le pusiera nombre.
4. **No se puede arreglar y no se intenta.** El módulo es aleatorio en origen;
   los 3 posts van congelados por decisión §4. Lo que cambia es que ahora está
   *cuantificado*, y por eso sirve de instrumento.

### Reclasificación contra el suelo de ruido (2026-07-29)

Medido con `scripts/qa/ruido.mjs`: 3 corridas × 7 páginas × 2 anchos del
original. Protocolo en `scripts/qa/README.md`; salida en
`scripts/qa/medidas/ruido.json`.

El resultado hace innecesario el umbral que se temía: **la dispersión no está
repartida por la página**. En cada página varía **exactamente una fila** —
siempre la de "Artículos y Guías", porque el original sortea los 3 posts en cada
carga (P4)— con saltos de 27, 54 u 81 (uno, dos o tres renglones). **En todo lo
demás, tres corridas dieron el mismo valor al céntimo: dispersión 0.** El `h1`
dio 0 en las 14 combinaciones de página y ancho.

| residuo | magnitud | región | dispersión de su región | veredicto |
|---|---|---|---|---|
| S9a · intro en la fila del CTA | ±61.78 @390 · ±30.6 @1440 | cuerpo | **0** | **defecto** |
| S9b · caja CTA piel `"fondo"` | −47.5 @390 | cuerpo | **0** | **defecto** |
| S9b · caja CTA piel `"foto"` | −8.6 @1440 · −8.5 @390 | cuerpo | **0** | **defecto** |
| S9c · cabecera de `mapaProyectos` | +13 @1440 · +13 @390 | cuerpo | **0** | **defecto** |

Los dos pequeños —el −8.6 y el +13, que eran los sospechosos— **no caen por
debajo del ruido: caen en una región donde el ruido medido es cero**. Y los dos
se reproducen entre anchos, el +13 al píxel exacto, lo que por sí solo descarta
que sean jitter: son dos maquetaciones distintas del mismo componente.

La lección de método, que vale para el resto del proyecto: **un suelo de ruido
global habría sido peor que no tener ninguno.** Con un umbral de 81 aplicado a
toda la página se habrían archivado como ruido dos defectos reales del cuerpo,
por variación que solo existe en el bloque de artículos.

---

## MONOGRÁFICO TÉCNICO — construido (2026-07-29)

> `/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar` y
> `/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas`. Séptimo arquetipo.
> Recon y specs: `docs/research/monografico-tecnico/`. Modelo y datos:
> `src/lib/monografico.ts`. Sonda propia: `scripts/qa/mono-cmp.mjs`.

### Resultado, por composición y no por total

Medido original vs clon **módulo a módulo** a 1440 y 390, la misma corrida:

| | @1440 | @390 |
|---|---|---|
| Petróleo y gas | **exacto** (0 módulos · 0 filas · 0 secciones) | −0.23 en total |
| EDAR | −0.01 | −0.16 en total |

**Todo el residuo que queda son tres módulos de imagen**, y la causa está
identificada (abajo, M-IMG). El cuerpo —ritmo de sección, de fila y de módulo,
retícula, tipografía, tabla, series, listas y CTA— cuadra al céntimo.

Y las **9 páginas anteriores no se movieron un píxel** en los dos anchos, con
`CabeceraSector`, `SectorHero` y `MapaProyectos` tocados. La sonda que lo dice
(`clon-base.mjs`) se probó **en negativo** en la misma sesión: con un `pb` de
hero cambiado en 1px cazó las 4 páginas afectadas, nombró la sección y salió
con código 1.

### Lo que enseñó construirlo: la spec medía el ritmo y extendió la conclusión

El discriminador de Divi —"lo que el editor no toca es responsive; lo que toca
queda en px iguales a 1440 y a 390"— es correcto **para el ritmo**, que es donde
se descubrió. La spec lo aplicó de rebote a la tipografía y a la caja, y ahí no
vale: en Divi el ancho de módulo se escribe en **%**, igual que su default, así
que el número se mueve con el ancho en los dos casos.

**Lo que delata a estas propiedades como campo es lo de siempre: varían de un
módulo a otro dentro de la misma página.** Seis correcciones, con su coste si se
hubiera construido leyendo la spec — tabla completa en el `⚠ CORRIGE` de
`components/seccion-editorial.spec.md`:

| propiedad | la spec decía | mide la salida servida | coste |
|---|---|---|---|
| ancho de módulo | (no existía) | **70 · 80 · 90 · 100 %** | −55 × 10 instancias |
| `line-height` de p/li | 30.6 fijo | **30.6 · 36 · 45**, por módulo | hasta −77 |
| `claim` h3 | 44/55 | **32/32** | −12 |
| bordes de la tabla | sin bordes | `1px solid #333` + `mb 48` | −58 |
| default `mb` de imagen | 3% | **2.75%**; el 3% es una excepción | ±37 |
| último módulo → `mb 0` | regla | **la rompen 12** (7 botones) | +16 × 7 |

Más dos que nadie había buscado: **56 bloques con `<strong>` en línea** (y no
solo al principio de la frase) y el **hueco entre columnas apiladas a 390**, que
no es "30 salvo la última".

**El patrón es el de siempre**: cada una de las ocho se descubrió al medir la
*segunda* página, no la primera. Y ninguna se veía en el total de la fila: la
del `<strong>` costaba −30.59 **solo a 390** y cero a 1440.

### M-IMG · Residuo abierto: la variante de imagen (≤0.14 por página)

**No arreglado, y con causa medida.** El original sirve por `srcset` una
variante redimensionada; el clon sirve el fichero completo. Cuando el recorte
redondea a otra proporción, el alto sale distinto por décimas:

| | fichero | natural | alto @390 |
|---|---|---|---|
| original | `alert-cloud-vertical-web-3-480x705.jpg` | 480×705 (1.46875) | **492.59** |
| clon | `alert-cloud-vertical-web-3.jpg` | 681×1000 (1.46843) | **492.48** |

Afecta a **3 imágenes** de las 11 del cuerpo (las que tienen la proporción
redonda dan Δ0). Cerrarlo es implementar `srcset` con las mismas variantes que
elige el original — es una tanda de **assets**, transversal a todas las páginas,
y no de este arquetipo. Anotado aquí para que la próxima medida no lo persiga.

> ⚠ **MEDIDO 2026-08-04 (F2-2 bloque 3) — y NO se cierra. Con su número, que es
> lo que el criterio del PLAN exige en vez de un decreto.**
>
> El eje `srcset` **no lo COMPARABA ninguna de las 59 sondas** (derivado hoy;
> el «48» que circula es del 2026-08-02 y ya no vale). Tres lo tocan por **un
> solo lado** —`a-spec` y `a-lexical` lo censan en el original, `cms-teaser` lo
> cita en el rótulo de una regla— y censar un lado no es comparar dos. Se midió
> alto, ancho, árbol, enlaces y tipografía, nunca el atributo cuya elección ES
> la causa de M-IMG. Por eso llevaba abierta — no había con qué cerrarla. Ahora
> existe `npm run qa:cmp-srcset` (dos lados, negativo 4/4, congela en
> `medidas/cmp-srcset.json`).
>
> | | |
> |---|---|
> | pares comparados (ruta × imagen origen) | **311 de 311** |
> | ✓ IGUAL | **140** |
> | ✗ **el clon NO emite `srcset`** | **70** ← la clase M-IMG |
> | ✗ `srcset` DISTINTO | **5** |
> | ? sin pareja (módulo de posts barajados) | 96 — no es del eje |
>
> **Dónde están los 70, y explica por qué M-IMG parecía pequeña:**
>
> | ruta | sin `srcset` / imágenes |
> |---|---|
> | `/software-de-medicion-calidad-del-aire` | **19 de 37** |
> | `/accesorios` | **14 de 18** |
> | `/monitor-calidad-aire` | 8 de 51 |
> | `/casos-de-exito/red-…-world-athletics` | 4 de 4 |
> | `/kunak-api` · casos · grupo A | 2 · 3+3 · **1 por ruta** (cascarón) |
>
> **Se concentran donde el clon CONSTRUYÓ en vez de transcribir.** En grupo A el
> `srcset` viaja **verbatim dentro del HTML rico** (`arquetipo-a.ts`), y por eso
> 140 pares salen iguales; en los arquetipos construidos el dato es
> `MonoModulo.imagen`/`Product` con **`src` y ningún campo de variantes**. La
> ficha de arriba decía «3 imágenes de las 11» porque miraba una página.
>
> **Y las TRES razones por las que no se cierra, ninguna de ellas «falta
> trabajo»:**
>
> 1. **el juego fijo de tamaños es NECESARIO y NO SUFICIENTE.** Censado en las
>    309 páginas del corpus (`qa:media-srcset`): el `srcset` **no es función de
>    la imagen** — 39 de 519 orígenes se sirven con `srcset` distinto según el
>    punto de uso, topado en el ancho pedido. El atributo necesita un dato que
>    **no está en la colección de media ni modelado en ningún sitio**;
> 2. **la población de esta ficha NO ES MEDIBLE con el corpus.** M-IMG está
>    medida en el monográfico (`alert-cloud-vertical-web-3` vive en
>    `monografico.ts`), y los **4 sectores + 2 monográficos están fuera del
>    corpus por construcción**. `cmp-srcset` cubre 24 de las 34 rutas del build
>    y **lo declara en su salida y en su congelada**, para que el verde de las
>    24 no se lea como si cubriera las 30;
> 3. **los 5 «distinto» están SIN DIRIMIR.** En 4 el **clon trae MÁS**
>    candidatos que la captura de hoy (un `1280w` que el original ya no emite).
>    Ninguno está entre los 39 orígenes de varias firmas, así que con **una**
>    captura no se distingue «el sitio cambió» de «varía por carga». Se ficha
>    como lo que es.
>
> **Lo que SÍ quedó hecho, y quita la mitad de abajo del problema:** el CMS
> genera ya `alert-cloud-vertical-web-3-480x705.jpg` — el fichero exacto que la
> tabla de arriba cita como «el que sirve el original». Lo que falta es el lado
> del render.

> ⚠ **RE-EVALUADA 2026-08-05 (29.ª). SIGUE SIN CERRARSE — y la razón 1 se
> DISUELVE, que es lo que cambia su forma.**
>
> **El número se reprodujo, y hay que leerlo con cuidado:** `qa:cmp-srcset`
> vuelve a dar **311/311 pares · 140 igual · 70 sin `srcset` · 5 distinto**, con
> la congelada **idéntica byte a byte**. Pero eso **prueba que el CLON es
> estable, no que el sitio no haya cambiado**: el lado «original» es la captura
> congelada, así que la igualdad es esperable **por construcción**. La razón 3
> —los 5 sin dirimir— **no se toca**: sigue necesitando una segunda captura.
>
> **La razón 1 sí cae, y no cerrando nada sino MIDIENDO que no hay nada que
> cerrar.** Decía: *«el atributo necesita el ancho pedido en el punto de uso,
> que no está en la colección de media ni modelado en ningún sitio»*. Eso daba
> por hecho que faltaba **modelar** algo. `npm run qa:media-hueco` (nueva,
> negativo **7/7**) lo midió:
>
> | | |
> |---|---|
> | pares (hueco × origen) que varían **por encima** del contenedor | **0 de 237** |
> | grupos intra-página que varían por encima | **0 de 715** |
> | excepciones, y **todas por debajo** del contenedor | **7** (1 en `post_content` · 6 en módulo de texto del builder) |
> | `srcset`+`sizes`+`width`+`size-` que sobreviven VERBATIM a T1–T8 | **311/311** |
>
> > **Por encima del contenedor de contenido lo fija el HUECO (plantilla); por
> > debajo viaja DENTRO del campo rico, carácter a carácter. No entra nada en el
> > esquema.**
>
> **Consecuencia para M-IMG, y es una reducción real: deja de ser deuda de
> MODELO y pasa a ser deuda de RENDER.** Los 70 se concentran donde el clon
> **construyó** (`/software` 19/37 · `/accesorios` 14/18 · `/monitor` 8/51),
> porque sus componentes emiten `src` y ningún candidato — y eso se arregla en
> `apps/web`, que **paga Δ0** y es otra tanda.
>
> **Quedan DOS razones, las dos de alcance, ninguna de modelado:**
>
> 1. ~~el juego fijo es necesario y no suficiente, y falta modelar el ancho
>    pedido~~ → **DISUELTA**: medido que no hay que modelarlo;
> 2. **la población de la ficha NO ES MEDIBLE con el corpus** — y aquí va el
>    recuento **derivado**, porque el que circulaba mezclaba dos unidades:
>
>    | | n | |
>    |---|---|---|
>    | entradas del `prerender-manifest` | **34** | incluye 3 que no son páginas |
>    | `/_global-error` · `/_not-found` · `/favicon.ico` | 3 | la sonda las excluye a propósito |
>    | **páginas del build** | **31** | |
>    | emparejadas con el corpus | **24** | |
>    | **fuera** | **7** | `/` + **4 sectores + 2 monográficos** |
>
>    El «**10** que faltan son los 4 sectores + 2 monográficos» que circulaba es
>    `34 − 24`, o sea **la resta correcta sobre la unidad equivocada**: 10 cuenta
>    3 no-páginas y `/`, y los sectores+monográficos son **6**. Regla 9 — *un
>    recuento afirmado de memoria se deriva antes de usarse*;
> 3. **los 5 «distinto» siguen SIN DIRIMIR** (ver arriba: la re-corrida no los
>    toca).

### M-404 · 23 imágenes que el clon SIRVE y no existen (2026-08-04)

**Nuevo, y no lo veía nadie.** `npm run qa:media-poblaciones` cruzó las
referencias `/images/…` del **HTML servido** por las 32 rutas del build contra
el árbol de `apps/web/public/images`, y encontró **23 referencias sin fichero**:

| rutas | n |
|---|---|
| `/case-studies/distrito-baja-emision-rio-de-janeiro` | **15** |
| `/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa` | **7** |
| `/contaminacion-por-metano` | 1 |

**Verificadas contra la salida servida, no por aritmética de conjuntos:** HTTP
**404** las tres comprobadas a mano, y **200** la hermana que sí está
(`…des-moines.jpg`). La causa se lee en el disco: el clon se bajó los
**`-600x600`** de esas galerías y el HTML pide el **original sin recortar**.

> **Por qué llevaba ahí sin que saltara nada:** `clon-base` —la guarda que más
> se corre— mide `docH`, `h1.y`, nº de secciones y nº de enlaces. **Una imagen
> rota no mueve ninguno de los cuatro.** Es la séptima instancia de *«la guarda
> también tiene un NIVEL, y el suyo no es este eje»*, y la primera cosecha del
> eje `media` en su primer barrido: **un eje nuevo no hereda cobertura.**

**No cierra el código de salida de `media-poblaciones`, a propósito y dicho en
su propia salida** (regla 1): es deuda del CLON, no un fallo del reparto de
poblaciones, y un rojo permanente por deuda ajena es cómo se consigue que nadie
lea los rojos. **Se pondrá verde solo** el día que los 23 ficheros estén.

⚠ **Y al arreglarlo hay que decidir una cosa, no descargar y ya:** el original
puede estar sirviendo ahí un `srcset` cuyo mayor candidato sea el `-600x600`.
Descargar el original completo cambiaría la imagen servida. **Se mide antes con
`qa:cmp-srcset` sobre esas tres rutas** — que ya las cubre.

> ⚠ **2026-08-05 (F2-2 bloque 3, 29.ª): NO se arregla aquí, y la razón no es
> falta de tiempo.** Arreglarlo toca `apps/web` —los ficheros van a
> `public/images`— y por tanto **paga corrida Δ0**. Pero además:
>
> > **el Δ0 SE VA A MOVER, y ese movimiento es CORRECCIÓN, no regresión.** Una
> > imagen presente maqueta distinto que una rota: ocupa su caja, empuja lo de
> > abajo y cambia `docH`. O sea que la guarda de regresión —`clon-base`, umbral
> > cero— **va a marcar las 3 rutas**, y marcarlas será lo correcto.
>
> Y eso es justo lo que no se puede resolver de paso dentro de otra tanda: cada
> una de las 3 rutas hay que **adjudicarla contra el original, una a una**, para
> separar «se movió porque ahora está la imagen» de «se movió porque metí un
> defecto». Es una **tanda aislada**, con el precedente exacto de la conversión
> a monorepo: cambio transversal, línea base nueva, adjudicación explícita.
> Meterlo en una tanda de esquema convertiría su Δ0 en no interpretable.

#### El eje que M-404 abre, y que hoy sólo se NOMBRA

> **Ninguna guarda comprueba que lo que el clon SIRVE exista.** Las 48 sondas
> miden alto, ancho, árbol, enlaces, tipografía y —desde el bloque 3— `srcset`.
> Ninguna hace la pregunta anterior a todas ellas: **¿el recurso referenciado
> devuelve 200?**

`media-poblaciones` lo encontró **de rebote**, cruzando poblaciones para otra
cosa; no es una guarda del eje. La diferencia importa: una guarda del eje
correría en cada tanda y **subiría el listón sola** cuando una ruta nueva
trajera una referencia rota, igual que hace `enlaces.mjs` con los `href`.

Se **nombra como eje pendiente y no se construye hoy** — un eje nuevo es una
sonda con su negativo, y meterla en una tanda que ya cerró dos fronteras es
cómo se acaba con una sonda sin test en negativo. Entra en
`COBERTURA-MEDICION.md` como celda a 0.

**Y el nombre correcto del eje es `existencia`, no `imágenes`:** el mismo
agujero cubre `<img src>`, `srcset`, `<source>`, `<video>`, los PDF de recursos
y las fuentes. Nombrarlo por el síntoma que se vio primero sería fabricar una
sonda que sólo mira imágenes porque las imágenes fueron lo primero que falló.

### ⛔ M-ORIGEN404 · 3 ficheros que el CORPUS referencia y el ORIGINAL ya no sirve (2026-08-05)

**No es deuda del clon, y por eso tiene ficha propia y no entra en §M-404.** La
captura de media pidió 537 orígenes y **534 llegaron**; los 3 que faltan dan
**HTTP 404 en `kunakair.com`**, verificado a mano tras los 2 reintentos del
script, con una petición por fichero:

| fichero | |
|---|---|
| `2026/05/Emisiones-fugitivas_programa-LDAR.jpg` | 404 |
| `2026/05/Ambiente-laboral-en-entorno-industrial-confinado_Kunak-scaled.jpg` | 404 |
| `2026/05/Exposicion-de-la-infancia-al-oxido-nitrico_Kunak-scaled.jpg` | 404 |

**El corpus los referencia y el original no los tiene.** Es una **ausencia
permanente del origen**, no una captura incompleta: reintentar no los va a traer.

> **Y no se puede «arreglar» sin inventar.** El contenido importado los citará y
> no habrá fichero. Las salidas son *dejar el `<img>` roto como está en el
> original* (fidelidad) o *quitarlo* (desviación deliberada). **Es una decisión
> de contrato, y va con las de T4b** — no se resuelve en la tanda que la
> encuentra (regla 6: la ausencia se rechaza, no se sustituye a ojo).

⚠ **El contrato de `Evaluadas` hizo su trabajo:** la corrida sale **«NO SE PUDO
EVALUAR · 534 de 537»** con código ≠ 0, en vez de un verde con 3 huecos. Un
534/537 presentado como completo es exactamente lo que ese contrato existe para
impedir.

### ✅ M-EXISTENCIA · El eje del ARTEFACTO EN DISCO, construido (2026-08-05)

**Nombrado el 05-08 por la mañana y construido el mismo día**, porque la
verificación de la captura lo necesitaba de todos modos.

Dos hallazgos independientes en dos días habían caído en el mismo hueco —las 23
imágenes 404 y `media/` con cero variantes— y **ninguna de las 65 sondas los
vio**: todo el instrumento mide **HTML SERVIDO**, y la propiedad *«el fichero
existe y mide lo que dice»* **no vive en el HTML**. Es §La causa común aplicada
al **soporte**.

`npm run qa:artefacto` · **1 497 artefactos** · negativo **6/6**:

| invariante | qué comprueba | n |
|---|---|---|
| **A** | lo que el clon SIRVE existe en `apps/web/public` | 406 |
| **B** | lo CAPTURADO existe y su `sha256` casa | 534 |
| **C** | cada tamaño que la ficha del CMS declara existe **y mide eso** | 557 |

Los sabotajes son cuatro y **cada uno por su invariante** —`fichero-ausente` ·
`sha-cambiado` · `variante-no-generada` (el defecto de los `imageSizes` inertes)
· `dimension-distinta`— más `sin-fuente` para la regla del cero. **«Existe» y
«mide lo que dice» van separados a propósito:** una sonda que sólo comprobara la
primera daría verde sobre un recorte equivocado.

### ✅ M-SHARP · El arreglo de los `imageSizes` estaba en UNA instancia, no en la CLASE (2026-08-05)

**Cerrado en la misma tanda que lo encontró, y encontrarlo fue un accidente.**

La tanda 28.ª descubrió que sin `sharp` los `imageSizes` son **inertes** —Payload
avisa en un WARN y **sigue con exit 0**— y lo arregló en `scripts/seed/cli.mjs`,
midiendo el efecto: `media/` de 85 a **545** ficheros. Correcto, **y era la
instancia**.

> **Los demás procesos que siembran llamaban a `construyeConfig()` a secas.**
> `cms-roundtrip.mjs` **re-siembra** para comparar, y su negativo lo lanza **6
> veces más**. O sea que cada corrida del round-trip **volvía a subir la media
> SIN sharp y se llevaba por delante las variantes que el seed acababa de
> generar**.

**Medido, y por eso se vio:** tras las corridas de la tanda 29.ª, `media/`
quedaba en **112 ficheros y 2 variantes** —y las 2 eran ficheros fuente que ya se
llamaban `-WxH`, o sea **0 variantes reales**—. Ninguna sonda lo veía: **ninguna
mira `media/`**.

**Arreglo, en el sitio por el que pasan todas:** `sharp` entra en
`construyeConfig` (`packages/cms-config/src/payload.config.ts`), con `sharp`
declarado como dependencia del paquete compartido. `opciones.extra` puede seguir
sobreescribiéndolo.

| | antes | después |
|---|---|---|
| `media/` tras `cms:seed` | 112 · **0** variantes | **667 · 539** variantes |
| `media/` tras `qa:cms-roundtrip` | 112 · 0 | **667 · 539** — **sobreviven** |
| `qa:cms-roundtrip` | 63/63 | **63/63**, congelada idéntica |

**La lección es la que este repo ya tiene escrita** —*«arreglar la instancia y no
la CLASE es cómo se llega a la tercera tanda del mismo bug»*— y aquí llegó a la
segunda en 24 horas. **Y el detector no fue una guarda: fue que el PASO 1 de la
tanda siguiente necesitaba el pipeline y lo encontró apagado.**

⚠ **Queda el hueco de instrumento, y se dice:** **ninguna sonda mira `media/`**.
Un seed que no genera una sola variante sale verde en las 65 sondas. Es hermano
del eje `existencia`, y se ficha con él.

### ✅ M-SEED · CERRADO 2026-08-05 — el seed está ROTO desde la firma de la allowlist (2026-08-04)

> ✅ **CERRADO 2026-08-05 (29.ª) por el PROCEDIMIENTO DE ALTA, que es la salida
> que la propia ficha decía que había — no por meter el host y ya.**
>
> §3.3b **AMPLIADA Y FIRMADA** por el propietario: la allowlist suma los **3
> hosts reales del grupo C** censados en `medidas/c-embeds.json` —
> `kunakcloud.com` · `player.vimeo.com` · `dailymotion.com`— y el alcance
> firmado pasa de «grupo A» a «grupo A + grupo C censados». **21 hosts.**
> `googletagmanager.com` queda **fuera con su evidencia**: 76 en 76/76 = es el
> cascarón (regla 4, el pleno), jamás candidato.
>
> **Es el MISMO criterio del 04-08** —los censados, cero pérdida medida—
> **aplicado al censo que entonces no existía**. La prohibición de la 27.ª
> —*«no dar de alta sin pasar por el procedimiento»*— se cumple: se pasó por él.
>
> **Y el efecto está MEDIDO, no supuesto** (D4: el marcador prueba frescura, no
> efecto):
>
> | | |
> |---|---|
> | `npm run cms:seed` | termina — **63 documentos en 13 colecciones** |
> | `npm run qa:cms-roundtrip` | **63/63 IDÉNTICOS** |
> | la congelada nueva contra la del 04-08 | difiere **sólo en `meta.fecha`** |
> | negativos re-corridos | `saneador` **6/6** (21 hosts) · `cms-roundtrip` **6/6** |
>
> **El bloque 1 sale de «pendiente de re-verificación» y vuelve a estar
> cerrado**, que es lo que esta ficha bloqueaba. Y la lección de la ficha sigue
> en pie sin cambios: *se cerró una frontera y no se re-corrió lo que dependía
> de ella* — lo que se arregló es la consecuencia, no la causa.

**El diagnóstico original, que se conserva porque es lo que enseña:**

**Pre-existente, no de esta tanda, y bloquea el criterio de F2-2 bloque 1.**

```
npm run cms:seed  →  ValidationError · collection: 'casos'
  Necesidad · Resultados
  §3.3b: host(s) de iframe fuera de la allowlist firmada — kunakcloud.com
```

**Reproducido con las modificaciones de esta tanda GUARDADAS APARTE**
(`git stash`) para no atribuírselo a lo que no es: falla igual en `6795883`.

**Qué pasó, y es la clase que este repo ya tiene nombrada.** La tanda 27.ª firmó
§3.3b —la allowlist de 18 hosts— y `casos.ts` trae `kunakcloud.com` en sus
iframes. C-SP6 lo había **fichado** (`kunakcloud.com ×2`) con la nota
*«procedimiento de alta cuando el grupo C se importe»*… pero `casos` **ya se
siembra hoy desde `src/lib`**, no espera al import del corpus. Así que:

> **Se cerró una frontera y no se re-corrió lo que dependía de ella.** Es
> exactamente lo que la propia tanda 27.ª descubrió en sus 3 sabotajes SIN
> DIANA —*«el negativo no se re-corrió después»*— cometido en el mismo día
> sobre el otro lado: allí caducaron unos sabotajes, aquí caducó **el seed**.

**Consecuencia que hay que decir en voz alta:** el `round-trip 63/63` que cierra
F2-2 bloque 1 **no se puede reproducir hoy** — necesita una DB sembrada y el
seed no llega a terminar. El 63/63 sigue siendo cierto de cuando se midió; lo
que ya no está es la capacidad de re-verificarlo.

**Y NO se arregla metiendo el host en la lista.** El HANDOFF de la 27.ª lo
prohíbe explícitamente: *«no dar de alta `kunakcloud.com` sin pasar por el
procedimiento de §3.3b»*. La allowlist la firma el propietario; añadir un host
para que el seed pase sería falsificar el instrumento justo donde §F2-2 avisa.
**Es una decisión, y va a la tanda que la tome** — con los otros dos que C-SP6
dejó fichados (`player.vimeo.com`, `dailymotion.com`).

### M-TAB · La tabla a 390: desviación deliberada que cuesta 0

Se replica la decisión de `/accesorios` (A4): el original deja desbordar la
tabla 189px fuera de su columna y **pierde la 4ª columna**; el clon la envuelve
en `overflow-x: auto`. Medido: **el alto es el mismo** (2201.81 en los dos), así
que la desviación no mueve la página — solo hace alcanzable lo que el original
esconde.

El envoltorio va con `md:overflow-x-visible`: a 1440 el `margin-bottom: 48px` de
la tabla tiene que **escaparse del módulo** hacia la columna, como en el
original, y un contenedor con `overflow` lo encerraría.

### M-COMP · Desviación deliberada de la regla de componentes

`CLAUDE.md` dice que un componente reutilizado por una segunda página se extrae
a la raíz de `src/components/`. `CabeceraSector`, `SectorHero`, `CtaDescarga` y
`MapaProyectos` se quedan en `components/sectores/` **a propósito**: son las
piezas del arquetipo SECTOR reutilizadas por un arquetipo que vive en el mismo
subárbol de URLs, y moverlas rompería los enlaces de sus specs sin cambiar un
píxel. Si el experimento de `EXPERIMENTO-URBANO.md` acaba fusionando los dos
content types, este reparto se rehace entero y entonces sí toca moverlas.

### La guarda de enlaces corrigió al HANDOFF sobre quién pinta qué

`enlaces.mjs` hizo lo que estaba previsto: en cuanto el build emitió las dos
rutas nuevas, los 22 enlaces a EDAR y Petróleo pasaron a fallo **sin tocar la
sonda**. Pero los sitios reales eran `nav.ts` · `footer.ts` · **`sectores.ts`**,
y el HANDOFF apostaba por `nav.ts` · `footer.ts` · `home-carrusel-sectores.ts`
— el carrusel de la home **no lleva** ni EDAR ni Petróleo. Tercera vez en el
proyecto que la lista de responsables escrita de memoria falla y la salida
servida acierta.

De rebote se cerró el 404 conocido de `nav.ts` (apuntaba a
`…-en-plantas-de-aguas-residuales/`): al localizar el href dejó de existir.

### Un dato que copiar habría estropeado

El slider de las dos páginas es el de la taxonomía *industria*, **igual que el
de `/sectores/control-de-emisiones-industriales`… salvo una palabra**: aquí dice
`inmisiones` y allí `inisiones`. Comprobado contra el HTML servido de las tres
páginas. La errata vive **solo** en Industria; reutilizar sus datos "porque el
slider es el mismo" la habría traído a dos páginas donde no está.

## EXPERIMENTO URBANO — corrido (2026-07-30)

Acta completa, con la composición de cada Δ, en
`docs/research/monografico-tecnico/EXPERIMENTO-URBANO.md` §8. Aquí solo lo que
es QA.

**Veredicto: H1 rechazada por C1** — el content type de MONOGRÁFICO necesita
**tres campos nuevos** para expresar el cuerpo de Urbano (`variante` de la piel
del `ctaDescarga`, nivel semántico `<p>` del `claim`, alineación vertical de las
columnas de una fila). Los dos content types se quedan **separados**, y la regla
de decisión pre-registrada prohíbe añadir esos campos "de paso": **no se han
añadido**. Nada del clon cambió — las 11 páginas a Δ0 en los dos anchos y
`enlaces.mjs` limpia.

### E1 · El corte del cuerpo del CLON no localizaba el slider · **RESUELTO (2026-07-30)**

El cierre del cuerpo en el lado del clon era *«el slider es la ÚLTIMA sección con
`.swiper`»*, y eso **no lo encuentra**: `CtaBannerSlider` es un fundido escrito a
mano (`aria-roledescription="carrusel"`), sin Swiper. Los únicos `.swiper` de la
página los pone `TrustBar`, que va **antes** del hero, así que el índice caía por
detrás del corte, `iSlider > iHero` salía falso y la rebanada se iba **al final de
`main`** con la sección del slider dentro.

**Estaba en DOS sondas, no en una.** La nota original solo nombraba
`tree-cmp.mjs`; `mono-cmp.mjs` llevaba el mismo bloque copiado — y es la sonda
cuyos números cita el acta del monográfico. Se encontró grepando `swiper` en
`scripts/qa/` en vez de arreglar la que se tenía delante, que es el corolario 1
de `CLAUDE.md` aplicado a la propia herramienta.

**Y un segundo agujero, en `mono-cmp.mjs`, que es la razón de que E1 viviera una
tanda entera sin verse:** con el corte roto el clon aportaba una sección de más,
la sonda escribía `SEC 3 SOBRA en clon`… y a continuación
`✅ 0 · 0 · 0` **con código 0**, porque ningún `continue` incrementaba ningún
contador. Un descuadre impreso y no contado da el mismo informe que un descuadre
no visto.

#### Qué se arregló

| | |
|---|---|
| el corte | la **primera** sección después del hero con `[aria-roledescription='carrusel'], .swiper`, en `tree-cmp.mjs` y `mono-cmp.mjs` |
| fallar en voz alta | si no lo encuentra: `❌ CORTE ROTO`, «el árbol de abajo NO es el cuerpo», y **código 1**. Antes rebanaba hasta el final en silencio |
| nodos sin pareja | se **cuentan** en los cuatro niveles de `mono-cmp` (sección/fila/columna/módulo) y en las filas de `tree-cmp` |
| salida congelada | las dos sondas **no escribían nada**: sus conclusiones vivían en la consola de quien las corría. Ahora `medidas/tree-cmp-*.json` y `medidas/mono-cmp-*.json` |
| la guarda | `scripts/qa/corte-cuerpo.mjs`, 6 rutas × 2 anchos, comprueba que el corte cae **en el slider** y que no queda ninguno dentro del cuerpo. **12 de 12 limpios** |

#### La prueba de que no falseó conclusiones pasadas

No se afirma: se midió, y de dos formas.

**1 · Determinista, sin el sitio vivo.** Las dos rebanadas —vieja y nueva—
calculadas **en la misma carga de página**, para las 6 rutas y los 2 anchos.
Diffear dos corridas end-to-end no habría servido: el lado del original es un
sitio vivo y cualquier diferencia quedaría contaminada. Resultado, **12 de 12**:
la rebanada nueva es **prefijo exacto** de la vieja, y lo único que la vieja
añadía era **una** sección, verificada como el slider por su rol ARIA. Con el
lado del original intacto y la rebanada siendo un prefijo, todo lo que viene
después —que es función pura de ella— solo puede perder esas líneas.

**2 · End-to-end, mismo build, antes y después.** El diff completo de las cuatro
corridas:

| sonda | lo único que cambió |
|---|---|
| `tree-cmp urbano 1440` | desaparecen `SEC 2` (el slider) y `fila 3 SOBRA en clon`. Las 3 filas del cuerpo, **idénticas** (Δ+0 / −8.6 / −8.6) |
| `tree-cmp edar 1440` | desaparecen `SEC 3` y `fila 10 SOBRA en clon`. **10 filas en los dos lados** |
| `mono-cmp petroleo 1440` | desaparece `SEC 3 SOBRA en clon`. Veredicto **`0 · 0 · 0` sin cambio** — la afirmación «Petróleo exacto» se sostiene |
| `mono-cmp edar 390` | desaparece `SEC 3 SOBRA en clon`. Veredicto **`2 · 0 · 5` sin cambio** (los residuos M-IMG conocidos) |

Y un control que salió gratis: **el lado del original no se movió un céntimo
entre las dos corridas**, así que el diff es atribuible al arreglo y a nada más.
Dispersión 0 en el cuerpo, como dice el protocolo.

**3 · Test en negativo.** Con el ancla cambiada por una que no existe, la sonda
canta `CORTE ROTO en el CLON` y sale con **1** — y reproduce exactamente el
síntoma viejo (`fila 3 SOBRA en clon`, 3 filas contra 4). Restaurada después.

#### Lo que NO se tocó, y por qué

`dos-rutas.mjs` sigue metiendo la sección del slider en su rebanada, **a
propósito y dicho en su cabecera**: la usa como control del cascarón (si el
slider no sale Δ0, lo que cambió no era el cuerpo) y el §8.0 del acta cita ese
número. Cambiarlo invalidaría la evidencia congelada de un experimento cuyo
andamio ya está borrado y no se puede rehacer.

### E2 · Un Δ0 que no se reproduce entre anchos es una medida TAPADA

La fila del claim de Urbano salió **Δ0 a 1440** y **+10 a 390**. No cuadraba a
1440: cuadraba por accidente — la columna de la foto mide 390.08 y la del claim
148, así que **+10 de claim y 121.03 de centrado perdido caben dentro de la fila
sin mover su alto**.

`CLAUDE.md` ya dice que *reproducirse entre anchos pesa más que el tamaño*, y lo
aplica a los residuos: un Δ idéntico a 1440 y a 390 no puede ser ruido. **El
lado espejo, que faltaba:** un Δ0 en un ancho con Δ≠0 en el otro no es "casi
cuadra", es un defecto que la columna hermana más alta está tapando. Ahí hay que
bajar a la composición.

Y el corolario duro: **la alineación vertical no la ve NINGÚN alto de fila.**
Centrado o pegado arriba, la fila mide lo mismo. Se ve solo midiendo el módulo
**dentro** de su fila.

**Promovido a regla general el 2026-07-30**, con su causa común y sus cuatro
instancias, en `CLAUDE.md` §«La causa común: el NIVEL al que se mide». La regla
espejo pasa a ser un caso particular: la holgura del contenedor no es la misma a
1440 (columnas en fila, manda la más alta) que a 390 (apilan, no hay dónde
absorber), y de ahí que el defecto aparezca en un ancho y no en el otro.

Instrumento: `scripts/qa/offsets.mjs` (era `exp-detalle.mjs`, generalizada).
Reporta por columna cuánto puede fallar dentro sin que la fila se mueva
(`absorbe`) y el offset de cada nodo dentro de su padre. Documentada en
`scripts/qa/README.md`.

### S1 · RECLASIFICADO — la mitad construida del par listado→detalle (2026-07-30)

**Estaba clasificado como residuo cosmético** —«interiores de tarjeta, −16.2 caso
/ −18.9 artículo»—, en la lista de flecos de una página ya verificada. La
reclasificación no viene de una medida nueva: **viene de saber qué hay al otro
lado**, que es lo que aportó el censo y confirmó `docs/research/RECON-LISTADOS.md`.

**La justificación, en tres datos medidos:**

1. **Las dos formas que esas tarjetas pintan son las dos más numerosas del
   original**: caso de éxito **57** páginas y entrada de blog **149**. Son **206
   páginas**, el 59 % de las 347 que ningún arquetipo cubre.
2. **`UltimosProyectos` y `UltimosArticulos` son la mitad *listado* de ese par, y
   están construidos, verificados y reutilizados en 6 páginas.** La otra mitad
   —la página de detalle— está al **0 %**.
3. **Y los modelos que ya existen son la proyección de teaser, no el content
   type.** `CaseStudy` y `BlogPost` (`src/types/kunak.ts`) tienen lo que necesita
   un listado y nada de lo que necesita un detalle: **falta el cuerpo, el slug**
   (guardan un `href` absoluto al original, así que no hay de dónde sacar la ruta
   local), **la taxonomía** (el `<body>` de una entrada trae `tax-resource`), **el
   SEO por instancia** y, en el caso de éxito, **su pie propio** (`tb_footer` 4
   frente a 3). Cobertura de instancias: **3 de 149** y **3 de 57**.

**Por qué el cambio de etiqueta importa y no es burocracia.** Como «fleco de
tarjeta», S1 competía con residuos de décimas y se aplazaba por tamaño: −16.2 es
pequeño. Como **mitad construida del par que cubre 206 páginas**, lo que se juega
no es el Δ: es que **la geometría interior de esas dos tarjetas es la parte del
arquetipo de detalle que ya está pagada**, y arreglarla es trabajo del arquetipo,
no pulido de una página. Medirlo bien ahora evita calibrar el detalle contra un
teaser que no cuadra.

**Lo que NO cambia:** no se construye nada, no se toca el componente y el Δ sigue
abierto con su número. Solo cambia de qué tanda es.

**Y una consecuencia que llega sola**, para no descubrirla: el día que exista el
arquetipo de detalle, los **6 `href`** de esas tarjetas pasan a ser fallo de
`enlaces.mjs` **sin tocar la sonda** — la regla se deriva del
`prerender-manifest`. Es el mismo mecanismo que convirtió 22 enlaces en fallo
cuando el monográfico emitió sus rutas.

### E3 · El ALTO de la columna se imprimía y no se contaba

**Hallazgo del arreglo de E1, no arreglado — y ahora visible.** `mono-cmp.mjs`
contaba como estructura el alto de sección, el alto de fila y el `margin-bottom`
de columna, pero **no el alto de columna**: lo imprimía y seguía. Con `SEC1/F3/C1
h 539.45 → 909.72 Δ+370.27` en pantalla, el veredicto era `0 · 0 · 0`.

Medido en las 4 combinaciones: **6 columnas** en Petróleo @1440, **5** en EDAR
@1440, **3** en cada uno a 390.

**Qué son, medido con `offsets.mjs`:** columnas que en el clon **estiran** por ser
hijas de un flex, mientras Divi las deja a la altura de su contenido. Es inerte —
los módulos de dentro cuadran, el `top` de cada uno cuadra y la fila cuadra—,
porque en las dos maquetaciones el alto de la fila lo fija la columna más alta.

**Qué se hizo:** contarlas **aparte**, informarlas en la salida con su razón
escrita, y **no** cerrar el código de salida con ellas. Que es lo contrario de lo
que hacía antes, que era imprimirlas y callarse.

**Qué queda por decidir, y no aquí:** si el clon debe dejar de estirar las
columnas para ser fiel al DOM del original. Es cambio de componente compartido
(`MonoCuerpo`), inerte a la vista, y toca `SectorBlock` por vecindad. Va a la
tanda de CLASE, con el criterio común, no de paso.

**Y lo que sí deja escrito:** esas columnas son **holgura medida**. En Petróleo a
1440 son 11 columnas de 16 a **421.11** — el margen de error real del árbol de
filas en esa página. Un defecto de 400px en la columna corta de S1F3 no habría
movido un solo número del árbol.

---

## GRUPO C — la entrada de C-3, medida (2026-07-30)

**Nada de esto es un defecto del clon**: son las predicciones pre-registradas de
`docs/research/grupo-C/DECISIONES.md` cobradas antes de construir, más lo que la
medición destapó. El acta completa, con los números y los defectos de sonda, en
`docs/research/grupo-C/MEDICION.md`.

### C-SP1 / D5 · CERRADA — la 4ª sección del pie no lleva campos

**P-C3-1 se sostiene.** La sección que el caso tiene y la FAQ no —identificada
midiendo, no por su índice: pie del caso 4 secciones, pie de la FAQ 3— es el
**slider CTA de ancho completo**, y su HTML normalizado es **idéntico byte a
byte en los 6 pares** de los 4 casos medidos. Nada derivado del post.
**D5 queda como se decidió: cero campos.** No hay que volver a abrirla.

Lo que sí difiere entre casos es **otra** sección, `footer-legal`: el conmutador
de idioma de **WPML**, cuyo `href` apunta a la URL de la página actual. **No es
campo del caso** —es mecanismo de servicio del original— y el clon ya no lo
reproduce: `LANGUAGES` (`src/lib/nav.ts`) es constante fija para las 11 páginas
ya clonadas. **Desviación deliberada, coste 0**, en la misma línea que el resto
del pie.

### C-SP7 · CERRADA — el cascarón del grupo C no esconde ningún campo

**P-C3-2 se sostiene a los dos anchos**: 10 instancias adversarias (6 casos con
los dos prefijos, 4 FAQ), **131 ejes** de ritmo, tipografía y retícula por
ancho, **0 con varianza**. Sonda `npm run qa:c-cascaron`, salida congelada,
test en negativo corrido entero después del arreglo.

### C-SP8 · C-SP9 · C-SP10 · C-SP12 · CERRADAS

Salen del mismo HTML servido que la transcripción (`npm run qa:c-spec`):

- **C-SP8** — migas `Inicio > Casos de éxito > <título>`; el último nivel sin
  enlace; **la del prefijo inglés apunta al índice ESPAÑOL**. La FAQ no tiene.
- **C-SP9** — `destacado` **lleva marcado inline** (`<strong>`, `<br>`) y vive
  **dentro del contenedor del bloque `necesidad`, como su último hijo**.
- **C-SP10** — **cero leyendas** en las 22 imágenes de galería medidas; el `alt`
  es **constante dentro de cada caso**, o sea del caso y no de la imagen.
- **C-SP12** — el chip del detalle **sí enlaza** a `/es/sector/<slug>/`, un `<a>`
  por término, y la fila de detalles lleva los mismos con `rel="tag"`.

### C-SP6 · sigue abierta, y ahora con muestra

En las instancias medidas: `www.youtube.com` ×2 · `player.vimeo.com` ×1 ·
**`kunakcloud.com` ×1** (dominio propio, un widget de datos). **No es el
censo** — los 11 casos con `iframe` hay que barrerlos por host antes del import,
como dice §2b del esquema.

### C-SP13 (nuevo) · la barra lateral de la FAQ

`MODELO.md` §2 describe el cascarón de la FAQ como «cabecera + `h1` + cuerpo +
pie estándar». La salida servida trae además `et_right_sidebar` y un `#sidebar`
con **4 widgets** (Buscar · un `widget_text` vacío · Categorías · «¡Suscríbete a
nuestra newsletter!» con el enlace ofuscado en base64).

**No añade campo** —P-C3-7 aguanta— pero **sí es pieza de plantilla que
construir**, y hay que decidir si el enlace ofuscado se reproduce o se sirve
decodificado (el clon ya tiene `SUBSCRIBE_HREF` en `src/lib/footer.ts`). Va a
`C-SP13` porque nadie ha medido si las 19 lo llevan idéntico: se midieron 4.

### C-SP14 (nuevo) · `bulletsTitulo` del producto

`ProductPanel` (`src/components/ProductosTabs.tsx`) tiene **«Ventajas» cableado
en el componente**. Los 4 productos de cartucho que usan los casos titulan esa
misma lista **«Especificaciones»**. Dos valores en el corpus → **es un campo**,
con defecto explícito `"Ventajas"`.

Es `CLAUDE.md` §Estructura que en realidad es contenido, otra instancia:
calibrado con la primera página (los 5 productos de la home), la segunda lo
desmiente. **No se cablea el valor de la primera.** Dos flecos del mismo sitio:
las viñetas de cartucho llevan marcado inline (`R<sup>2</sup>`, `μg/m<sup>3</sup>`)
y **`amoniaco` no tiene imagen** (el panel sin foto ya está contemplado).

### C-SP15 (nuevo) · la alineación en línea deja de ser SIN PROBAR

`ESQUEMA-CMS.md` §3.1 tiene «alineación e indentación | no medidas; SIN PROBAR,
no se habilitan a ciegas». **Ya están medidas** en el grupo C: `text-align`
aparece **24 veces** en las 10 instancias, con **tres valores** (`justify`,
`left`, `center`) y en **cuatro etiquetas** (`p`, `li`, `ul`, `div`).

Sigue siendo decisión abierta —qué hace el CMS con ella: conservar, normalizar o
descartar como T2— pero ya **no por falta de datos**. La decisión es del §3, no
de la construcción del grupo C.

### C-QA1 (nuevo, ABIERTO) · el desfase de base de las 6 rutas nuevas está en la CABECERA

Primera pasada de QA visual del grupo C (`npm run qa:c-cmp`, 2026-07-30). El
`h1` —la base de lectura del protocolo— **no cuadra**, y el desfase es de la
cabecera, no del cuerpo:

| ancho | `h1.y` original | `h1.y` clon | base |
|---|---|---|---|
| 1440 | 532.19 caso · 283 FAQ | 140.59 · 58 | **−391.6** · **−225** |
| 390 | 511.69 caso · 223.58 FAQ | 139.59–191.59 · 58 | **−320 a −372** · **−165.58** |

Lo tienen **las dos formas**, así que no es del arquetipo: es que la cabecera del
clon no ocupa el hueco que ocupa la del original **cuando no hay nada entre ella
y el `h1`**. Las 11 páginas ya clonadas no lo sufren porque todas meten algo en
medio (`CabeceraSector`, el hero de producto) que **absorbe** la diferencia. El
caso y la FAQ arrancan directas y destapan la medida — la regla del contenedor
con holgura de `CLAUDE.md`, otra instancia.

**Hasta que la base cuadre, el `docH` de las 6 rutas nuevas no se puede leer**
(Δ de −1000 a −2900 a 1440): con la base a −391, cualquier lectura del cuerpo
puede ser dos errores anulándose.

**Cómo se cierra, escrito y no corrido**: medir la composición de la cabecera del
original a los dos anchos —**con el selector bueno**: `#main-header` NO existe,
que es justo por lo que el eje salió muerto en `c-cascaron`— y compararla con lo
que emite `HeaderNav`. No se toca nada a ojo.

### C-SP16 (nuevo) · la cabecera del grupo C está SIN PROBAR, no probada

`c-cascaron` daba `header·ritmo` y `header·ancho` como ejes limpios y **estaban
muertos**: el selector `#main-header` no existe en el original, así que nunca
midieron nada. Corregido —la sonda ahora los separa y los dice— y el recuento
honesto de P-C3-2 baja de **131 a 81 ejes**. La predicción **sigue en pie** con
los 81; lo que cambia es que **la cabecera no está entre ellos**. No se cablea
nada apoyándose en ella.

---

## C-QA1 · DIAGNÓSTICO de la cabecera — y son DOS defectos, no uno (2026-07-30)

Sonda `npm run qa:c-cabecera -- <ancho>`, las **17 rutas** contra su original,
salida congelada en `medidas/c-cabecera-{1440,390}.json`. **Medido antes de
arreglar nada**, porque el arreglo toca componente compartido en 17 rutas.

### Lo primero: el selector, verificado en los dos lados

`header.et-l--header` — comprobado en el HTML servido del original **y** del
clon. No se repite el error de C-SP16: la sonda usa el `Censo` de `lib.mjs` y
**sale con 2 si algún selector no casa en ninguna página**. Corrida limpia:
`4 vivos, 0 muertos` en 34 páginas.

Y una verificación que el censo **no** da y hacía falta: que el primer `h1` sea
**el mismo elemento** en los dos lados. Lo es en las 17 (mismo texto), así que
los Δ son comparables. Un selector que casa en ambos lados pero apunta a cosas
distintas es el primo hermano de C-SP16, y no lo caza ningún censo.

### (a) La cabecera del original NO es una sola cosa

Su alto **depende de la plantilla**, y está **EN FLUJO en todas menos la home**:

| plantilla | @1440 | @390 |
|---|---|---|
| producto · accesorios · software · API | **225** | 136.58 |
| home *(fuera de flujo)* · **FAQ** | **225** | 165.58 |
| **caso de éxito** | **387** | 362.91 |
| sector | 397.61 | 347.25 · 402.64 |
| monográfico | 433.61 | 419.25 · 383.25 |

**El clon sirve siempre la misma: 203.59 / 126, y siempre FUERA DE FLUJO.**

La causa está clara: **el original mete la banda de título DENTRO de
`header.et-l--header`** —en sector el `h1` está *dentro de la cabecera*, medido—
y el clon la descompone en `HeaderNav` (absoluto) + una sección en `main`.

### (b) La respuesta a la pregunta: las 11 antiguas NO están todas a Δ0

Con el `h1` **en crudo**, sin restar la base de lectura:

| ruta | Δ @1440 | Δ @390 |
|---|---|---|
| los **6 sectores** | **0** (los 6) | **0** en 5 · **+11.2** en `estudio-de-la-contaminacion-atmosferica` |
| `/accesorios` | **−19.2** | **+48.42** |
| `/kunak-api` | **−48** | +0.42 |
| `/monitor-calidad-aire` | **−48** | **+78.42** |
| `/software-de-medicion-calidad-del-aire` | **−48** | +0.42 |
| `/` | +289.91 | +119 — **no concluyente**, ver abajo |
| las **6 nuevas** del grupo C | **−391.6** caso · **−225** FAQ | −320 a −372 · −165.58 |

> **Los 6 sectores están CORRECTOS, no compensados.** El original mide 397.61 de
> cabecera con el `h1` dentro; el clon mide 203.59 de `HeaderNav` fuera de flujo
> **más** `section.cabecera-sectores` de 397.59 en flujo, y el `h1` cae en
> 261.16 **en los dos**. Es una descomposición fiel con el mismo total, no dos
> errores anulándose.

> **Pero 4 páginas de producto SÍ tienen un desfase real que nadie había
> visto**, y **cambia de signo entre anchos** (−19.2 → +48.42 en accesorios;
> −48 → +78.42 en monitor). Un residuo que cambia de signo entre dos
> maquetaciones no es ruido: es una medida tapada.

**Por qué llevaba invisible desde el principio:** la regla del `h1` de
`CLAUDE.md` §Protocolo **resta la base de lectura antes de comparar nada**, así
que un desfase que está *en* la base se normaliza a cero por construcción. Es la
instancia más antigua del contenedor con holgura de este proyecto, y el
contenedor es **el propio protocolo de medición**. La regla sigue siendo
correcta para leer el CUERPO; lo que faltaba era **alguien que mirara la base en
crudo alguna vez**.

⚠ **`/` no es concluyente y no se cuenta como defecto todavía**: el `h1` del
original sale a **y=0 a los dos anchos**, que es la firma de un `h1` dentro de
una diapositiva posicionada en absoluto. Su Δ no se compara igual que el de un
`h1` en flujo. Mirarlo aparte antes de tocarlo.

### Consecuencia para el plan: la tanda NO es «cabecera sola»

Son **dos defectos con dos causas distintas**:

| # | qué | dónde |
|---|---|---|
| **C-QA1** | el clon **no pone nada** donde el original pone la cabecera en flujo; el caso y la FAQ arrancan **debajo** de una cabecera absoluta | las **6 rutas nuevas** |
| **C-QA2** *(nuevo)* | el espaciador que compensa la cabecera absoluta **no vale lo que la cabecera del original**, y el error **cambia de signo entre anchos** | **4 páginas de producto** (`/accesorios`, `/kunak-api`, `/monitor-calidad-aire`, `/software-…`) |

Arreglar la cabecera sola **movería las 4 de producto**, que hoy pasan `qa:enlaces`
y `clon-base` porque nadie compara su base en crudo. Por eso el arreglo va con
**plan propio y en sesión limpia**, contra la base congelada de las 17
(`medidas/clon-base-{1440,390}-cqa1-antes.json`, umbral cero).

### C-QA3 (nuevo, ABIERTO) · la HOME nunca tuvo una base de lectura válida

PASO 2 del plan de la cabecera: mirar la home aparte, porque su `h1` sale a
**y=0** en el original. Medido con `npm run qa:c-cabecera` (`SOLO=/`), congelado.

**El `h1` de la home mide 0 px de alto en el original y 1 px en el clon**: los
dos son títulos **ocultos para SEO**, no el titular de la página. Su `y` no
guarda ninguna relación con la maquetación, así que el `Δ +289.91` de la tabla
de C-QA1 **no es un defecto y nunca lo fue**.

Pero la conclusión no es tranquilizadora, es la contraria:

> **La base de lectura de la home no estaba movida: no era una base.** Y como el
> protocolo *resta* la base antes de comparar, cualquier lectura del cuerpo de
> la home se hizo contra un punto de apoyo arbitrario.

**Medido contra un ancla VÁLIDA** —el primer encabezado con caja real, que es el
**mismo `h2`** en los dos lados («La solución profesional para la monitoriza…»):

| ancho | original | clon | Δ |
|---|---|---|---|
| **1440** | 279.88 | 300.91 | **+21.03** |
| 390 | 120.23 | 120 | −0.23 |

**El Δ0 de la home no se sostiene a 1440.** Y el número no es casual: la
cabecera del original mide **225** a 1440 y la del clon **203.59** —
**−21.41**—, que es el mismo desfase con signo contrario en el contenido. Las
dos cabeceras están **fuera de flujo** en la home, así que lo que lo transmite
no es el flujo sino algo dimensionado contra el alto de la cabecera. Falta
medirlo por composición.

**Y ese −21.41 es el mismo que ya asoma en C-QA2**: la cabecera del clon es
21.41 más baja a 1440 y 10.58 más baja a 390 que la del original en las
plantillas de producto. Puede que C-QA2 y C-QA3 sean **una sola causa** con dos
síntomas — pero eso **no se afirma sin medirlo**, y por eso van separados.

**Se decide aparte, como estaba pactado**: la home es la primera página clonada
y la más verificada del proyecto, y un cambio ahí no entra de rebote en una
tanda de cabecera. Lo que esta anotación fija es que su «verificada con Δ0»
**tenía una base inválida debajo**, y que a 1440 hay +21.03 reales.

⚠ **Consecuencia de método, ya escrita en `CLAUDE.md`**: un `h1` oculto es una
base inválida, y el protocolo no lo detecta solo. `qa:c-cabecera` ahora
comprueba **que el `h1` tenga caja real en los dos lados** y, si no, mide contra
el primer encabezado visible y **dice que lo está haciendo**.

---

## C-QA4 · AUDITORÍA DE BASES — las 17 rutas, los dos anchos (2026-07-30)

La pregunta que el arreglo de C-QA3 implica y **nadie había corrido**: si la
home no tenía base de lectura válida, ¿a cuántas rutas más les pasa? Sonda
`npm run qa:bases`, salida congelada en `medidas/c-bases.json`.

**No mide el original otra vez**: deriva del congelado
`medidas/c-cabecera-{1440,390}.json`, que ya trae `h1alto` de los dos lados en
las 17 desde `82142e2`. Re-medir el original sería re-medirlo a mano —lo que el
HANDOFF prohíbe— y meter el ruido de un sitio vivo en una pregunta que el
fichero ya contesta.

### El resultado: la home y solo la home

**16 de 17 rutas tienen base válida** a 1440 y a 390 — `h1` con caja real
(`alto > 4`) en original y clon. La única sin base es **`/`** (0 px en el
original, 1 px en el clon), que es **C-QA3, ya registrada**, con su ancla
alternativa medida: el `h2` «La solución profesional para la monitoriza…».

Y las 17 pasan la comprobación de que el `h1` es **el mismo elemento** en los
dos lados (`h1txt` coincide), así que sus Δ son legítimos.

> **No aparece ninguna ruta sin base además de la home.** Los deltas de cuerpo
> de las otras 16 se apoyan en un punto de apoyo real.

### Pero sí aparece otra cosa, y es un defecto nuevo: C-QA5

### C-QA5 (nuevo, ABIERTO) · el `h1` ENVUELVE distinto en 4 rutas, solo a 1440

Base válida y `y` comparable, pero **la caja del `h1` no mide lo mismo**:

| ruta | @1440 orig→clon | @390 |
|---|---|---|
| `/sectores/…-en-edar` | **82 → 46** | 154 = 154 |
| `/sectores/…-petroleo-y-gas` | **82 → 46** | 118 = 118 |
| `/case-studies/…-rio-de-janeiro` | **209.38 → 108.19** | 462.34 = 462.34 |
| `/casos-de-exito/…-por-lindano` | **108.19 → 57.59** | 209.38 = 209.38 |

Los cuatro son el mismo hecho: **el título del original envuelve en más
renglones que el del clon**, o sea que **el contenedor del `h1` es más ancho en
el clon**. A 390 no pasa en ninguna — las cuatro cuadran exactamente.

**Se cuenta aparte de «sin base» a propósito.** El borde superior del `h1` sigue
siendo comparable, así que la base vale; lo que no cuadra es el **ancho** del
contenedor del título. Mezclarlo con C-QA3 sería medir al nivel equivocado.

**Y explica por qué llevaba invisible**, que es la regla de siempre: los dos
monográficos tienen el `h1` con `y = 261.16` **en los dos lados** y aparecen como
Δ0 en el diagnóstico de C-QA1. La banda de título tiene alto propio, así que
**absorbe** que el titular ocupe uno o dos renglones sin mover nada de lo que
viene debajo. Un contenedor con holgura más.

⚠ **Es el aviso que hay que leer antes de construir la banda de caso y FAQ**
(C-QA1, PASO 1): replicar el **alto** de la cabecera del original y no su
**ancho de columna** deja este defecto dentro de las rutas nuevas desde el
primer día. Río y lindano ya lo tienen — y son dos de las seis.

**No se arregla en la tanda de C-QA1**: son cuatro rutas, dos de ellas de un
arquetipo ya verificado, y el orden pactado es una cosa cada vez. Queda abierta
con su medición hecha.

---

## C-QA1 · CERRADA — la banda de cabecera de caso y FAQ (2026-07-30)

Las **6 rutas nuevas** están a **Δ0 en el `h1` en crudo, a los dos anchos**, y
las **11 anteriores no se han movido un píxel** (`qa:clon-base`, umbral cero,
contra `medidas/clon-base-{1440,390}-cqa1-antes.json`, con `MARCADOR`).
`qa:enlaces` limpia en las dos direcciones.

### Lo que se midió antes de tocar nada — `npm run qa:banda`

Salida congelada en `medidas/c-banda-{1440,390}.json`. El total de la cabecera
(387 · 225) decía que había un defecto y **no bastaba para arreglarlo**: un
total es el nivel donde caben dos errores anulándose. Por composición salieron
**dos** cosas, no una.

**(1) El hueco en flujo.** El original mete la cabecera EN FLUJO; el clon la
tiene `absolute` y no ocupa nada. Es un `et_pb_section` con degradado y:

| plantilla | `min-height` | @1440 | @390 | foto |
|---|---|---|---|---|
| **caso** | **387px** en 4 de 4 | 387 | 362.91 | **distinta en las 4** |
| **FAQ** | 0 — la llenan las filas del menú | 225 | 165.58 | ninguna en 2 de 2 |

> **El alto es plantilla y la foto es campo**, por el discriminador de régimen
> plantillado de `CLAUDE.md`: cero varianza entre instancias = plantilla, lo que
> varía = campo. De ahí `imagenCabecera` en `CasoDeExito` — un campo nuevo, con
> su medición, no «de paso».

⚠ **Y a 1440 la FAQ mide 225, igual que producto — pero a 390 mide 165.58 y
producto 136.58.** Coinciden en un ancho y no en el otro: la fila del menú lleva
`pt/pb 30/30` en la FAQ y `19/12` en producto. Dar por buena la coincidencia de
1440 habría metido **−29 en las dos FAQ a 390**, que es la regla espejo otra vez.

**(2) Las migas del caso NO son las de producto.** En el clon las pintaba el
mismo componente; en el original el caso las trae en `div.migas` (sección del
tema) y producto en un `et_pb_section` del builder:

| | original | clon | Δ |
|---|---|---|---|
| producto | 50 | 50 | 0 |
| **caso @1440** | 54.59 | 50 | **−4.59** |
| **caso @390** | 85.19 | 102 | **+16.81** |

Cambia de signo entre anchos, así que no es un `padding`. Con fila, ancho,
tamaño, peso y espaciado **idénticos**, quedan dos diferencias y solo dos:

- **interlínea 30.6 contra 26** → 54.59 = 30.6 + 24 · 85.19 = 2×30.6 + 24;
- **el último `li` va truncado**: `max-width 350px · nowrap · overflow hidden ·
  text-overflow ellipsis`. Los otros dos miden **exactamente** lo mismo en los
  dos lados (52.36 y 107.53); el tercero medía 350 en el original y 425.06 en el
  clon **con el mismo texto**. Sin truncar, a 390 el titular envuelve en 3
  renglones donde el original hace 2.

Las dos son de la plantilla del CASO → `variante="caso"` en `Breadcrumb`, **no**
el defecto: cambiarlas para todos habría movido producto y los 6 sectores.

### El desglose, que cuadra al céntimo

`387 + 54.59 (migas) + 60 (pt) + 30.6 (sobretítulo) = 532.19` — la `y` del `h1`
del original. A 390: `362.91 + 85.19 + 33 + 30.6 = 511.70` contra 511.69.

### ⚠ El ORIGINAL se movió 32.28 en tres rutas durante la tanda

Entre el congelado (`c-cabecera-*.json`) y la corrida de verificación, el `h1`
**del original** cambió en `/software-de-medicion-calidad-del-aire` (421.39 →
389.11) y en los dos monográficos (261.16 → 228.88): **−32.28 en las tres**. El
lado del CLON no se movió en ninguna, y `qa:clon-base` las da «sin mover un
píxel», así que **no es de este cambio** — el clon no puede mover el original.

Es la nota de método de `CLAUDE.md` cobrándose: *el original no es un objetivo
de medición estable*. Queda anotado como **C-QA6** porque cambia los objetivos
de C-QA2: el −48 de `/software` es hoy **−15.72** contra un original distinto, y
los dos monográficos, que estaban a Δ0, salen a **+32.28**. **Antes de tocar
nada de eso hay que re-medir el original tres veces** y quedarse con el valor
estable, no con el de una corrida.

### ~~C-QA6 (nuevo, ABIERTO)~~ **CERRADA (2026-08-03)** · re-medir la base de las 3 rutas que movió el original

> **→ Veredicto en §C-QA6 · CIERRE, al final del documento.** Suelo `h1` fijado
> **a 1440: 32.28** en estas 3 rutas. **A 390 no cierra** — 0 entre las ráfagas
> exhibibles contra un ±30 sin fichero. Y el **−15.72 de `/software` no queda
> pendiente: se disuelve** — era el −48 leído contra el estado bajo de un
> original **bimodal**, y ese −48 ya está arreglado.

`/software-de-medicion-calidad-del-aire` y los dos monográficos. Tres corridas
del original, mismo día, y congelar. Hasta entonces sus Δ **no se leen**.

> **Corrección del mismo día, y refuerza el diagnóstico:** al re-correr para
> congelar la verificación, los dos monográficos **habían vuelto a 261.16** y
> `/software` a su valor previo. O sea que el 32.28 **iba y venía entre corridas
> del mismo día**, que es la firma de la inestabilidad del sitio vivo y no de un
> cambio del original. Congelado en `medidas/c-cabecera-{1440,390}-2026-07-31.json`:
> 1440 da **5 de 17** desplazadas y 390 **6 de 17**, y **ninguna de las 6 nuevas
> está entre ellas** a ninguno de los dos anchos.
>
> C-QA6 sigue abierta pero cambia de forma: no es «el original se movió», es
> **«estas 3 rutas necesitan las 3 corridas del protocolo antes de que su Δ
> valga»**. Es exactamente lo que `CLAUDE.md` §Notas de método manda hacer y lo
> que nadie había hecho con ellas.

### La custodia, que falló durante esta misma tanda

La corrida de verificación **pisó `c-cabecera-{1440,390}.json`**, que es el
DIAGNÓSTICO congelado y la única prueba de que el defecto existía. Se recuperó
de git. El `SUFIJO` de `SOLO` cubría la corrida parcial y dejaba abierta la
puerta grande: la corrida entera.

> **Congelar no sirve de nada si la siguiente corrida descongela sin avisar.**
> `c-cabecera` ahora **no pisa** una salida que ya exista: escribe al lado con la
> fecha y lo dice. `PISAR=1` fuerza el re-congelado a propósito.

Y de paso salió la otra mitad de un arreglo viejo: **`clon-base --cmp` resolvía
la ruta contra el `cwd`**, no contra `scripts/qa/`. `w()` se arregló en su día y
**el lado de LECTURA se quedó sin arreglar**, así que la sonda no sabía leer lo
que ella misma había escrito: el `--cmp medidas/x.json` de su propia
documentación moría con ENOENT lanzado desde la raíz. Media corrección de las de
`CLAUDE.md`: la instancia y no la CLASE.

---

## C-QA6 · MEDIDA — la base de lectura NO es estable en 3 rutas (2026-07-30)

Protocolo de 3 corridas (`npm run qa:ruido`, ahora con `RUTAS=` y `ETIQUETA=`)
sobre `/software-de-medicion-calidad-del-aire` y los dos monográficos, a los dos
anchos. Congelado en `medidas/ruido-cqa6.json` y `ruido-crudo-cqa6.json`.

### El resultado, que no es el que se buscaba

**Dos ráfagas de 3 corridas, separadas por ~6 minutos, dan cosas distintas:**

| ráfaga | `h1` | nº de `.et_pb_row` |
|---|---|---|
| **A** | **±32.28** en petróleo@1440 · **±30** en las tres @390 | **variable** en 3 de 6 |
| **B** | **0 en las 6** | estable |

> **Una ráfaga limpia no prueba estabilidad: prueba que en esos minutos no hubo
> episodio.** Y como el protocolo pide «3 corridas», la ráfaga B se lee como
> «suelo 0» y cierra la pregunta en falso. Es lo que llevaba pasando.

El episodio se ha visto **tres veces**: las dos lecturas separadas por horas
durante C-QA1 (`/software` 421.39→389.11; los monográficos 261.16→228.88) y la
ráfaga A. Magnitud **~30–32.28**, **no reproducible a demanda**.

**Y no es el ruido conocido.** El documentado (27 · 54 · 81) son renglones del
módulo «Artículos y Guías»; estos números no son múltiplos de 27 y aparecen en
el `h1`, que va **por encima** de ese módulo. **Mecanismo sin identificar.**

### Consecuencia, y bloquea a C-QA2

> En `/software`, EDAR y petróleo, **todo residuo por debajo de ~32.28 está SIN
> PROBAR** — ni defecto ni limpio. Eso incluye el **−15.72 de `/software`**, que
> era el objetivo con el que se iba a verificar su arreglo.

> ⚠ **SUPERADO dos veces (2026-08-03). Esta frase es la lectura de UMBRAL, y es
> la que hay que dejar de usar.**
>
> 1. **El suelo no es una banda, son dos picos** (§La regla de lectura de un
>    suelo BIMODAL): se lee **≈0 limpio · ≈32.28 limpio · cualquier otro valor
>    DEFECTO, incluidos los menores que 32.28**. Como umbral, esta frase tapaba
>    defectos de hasta 32 px.
> 2. **El −15.72 ni siquiera era un residuo aparte**: era el −48 medido contra
>    el otro pico, y ya está arreglado (§C-QA6 · CIERRE).

`/software` es a la vez ruta inestable y una de las 4 de producto de C-QA2, así
que **su arreglo se hace pero su verificación queda anotada como pendiente del
suelo real**, no dada por buena. Las otras tres de producto (`/accesorios`,
`/kunak-api`, `/monitor-calidad-aire`) **no están afectadas**: no aparecen en las
rutas con episodio.

### Lo que se corrigió en `CLAUDE.md`, sin suavizar

La frase fundacional —«en 42 cargas su dispersión fue 0 en las 14
combinaciones»— es **cierta e incompleta en dos ejes**:

- **alcance**: las 14 son **7 páginas × 2 anchos**, las clonadas en julio de
  2026. **No incluyen los monográficos, ni el caso, ni la FAQ.** Se citaba como
  propiedad del sitio y es propiedad **de las rutas medidas**;
- **alcance temporal**: el propio método de comprobación no distingue «estable»
  de «sin episodio ahora». Ése es el eje que invalida la comprobación, no solo
  su cobertura.

También hereda la corrección «0 en todo lo demás»: son **tres** regiones de
ruido, no dos, y la tercera se identifica **por ruta y por momento**, no por
módulo.

### ⚠ Dos defectos de instrumento salidos de esta misma medición

1. **`ruido.mjs` calculaba la dispersión dimensional comparando filas por
   índice, incluso cuando el nº de filas cambiaba entre corridas.** La ráfaga A
   reportó **`SUELO DIMENSIONAL = 8950.73`**, que parece «el sitio es un caos» y
   en realidad es la fila 7 de una carga menos la fila 7 de otra que no es la
   misma fila. La sonda **imprimía** «⚠ nº de filas variable» y **contaba igual
   el número**: la regla 1 rota dentro del propio informe. Corregido — si el nº
   de filas varía, el dimensional vale `null` y se dice por qué.
2. **Escribía `ruido.json` y `ruido-crudo.json` FUERA de `medidas/`**, contra la
   regla 2. Corregido antes de usarla.

### ⚠ Y una pérdida de evidencia que hay que anotar

**La salida congelada de la ráfaga A ya no existe: la borré yo a mano** (`rm`)
antes de re-correr con la sonda corregida, para que la ráfaga B escribiera con
el nombre limpio. Sus números están arriba y en el acta de esta sesión, pero **el
fichero del que salieron no se puede exhibir**, que es justo lo que la regla 2
exige.

La guarda de `w()` —escrita ese mismo día— **no protege de esto**: protege de que
una sonda pise su salida, no de que una persona la borre. Anotado como lo que es,
un fallo de operación y no del instrumento.

---

## C-QA2 vs C-QA3 · NO son la misma causa — medido (2026-07-30)

`npm run qa:banda`, congelado en `medidas/c-banda-{1440,390}-2026-07-31.json`.
Medido **antes de arreglar nada**, que era la condición.

### La home, por composición — y el dato que lo cierra

Las dos cabeceras van **fuera de flujo** (225 el original, 203.59 el clon), así
que el cuerpo empieza en `y=0` en los dos lados. El ancla es el **mismo `h2`**
(«La solución profesional…»); el `h1` no sirve, es el oculto de SEO (C-QA3).

| @1440 | orig | clon |
|---|---|---|
| `section` del hero, `padding-top` | **180px** | **180px** |
| `padding-top` de la fila | 28.80 | 0 |
| centrado vertical de la columna | 71.08 | 110.91 |
| `margin-top` del `h2` | 0 | 10 |
| **`y` del ancla** | **279.88** | **300.91** |

> **El `padding-top` del hero es 180 en los dos lados, y es una constante.**
> Nada de la home está dimensionado contra el alto de la cabecera — ni en el
> original ni en el clon. Ésa es la respuesta a la pregunta de causa común.

Lo que sí difiere está **dentro** del hero: la columna del texto mide **549.03
en el original y 498.19 en el clon (−50.84)** y va **centrada verticalmente**
contra una hermana de ~657, así que parte de ese déficit reaparece arriba como
offset. Es el patrón del claim de Urbano otra vez —«+10 de `padding-bottom` y
121.03 de centrado vertical perdido»—, no un problema de cabecera.

### Por qué 21.41 y 21.03 son una COINCIDENCIA

Tres pruebas, y cualquiera basta:

1. **El signo es el contrario.** La cabecera del clon es **21.41 más BAJA**; si
   eso se transmitiera, el contenido subiría. El ancla del clon está **21.03 más
   ABAJO**.
2. **El mecanismo no existe.** Para transmitirse haría falta algo dimensionado
   contra el alto de la cabecera. En la home no lo hay: el hero abre con `pt`
   **180 fijo** en los dos lados.
3. **A 390 se comportan al revés.** C-QA2 crece (**+78.42** en monitor, **+48.42**
   en accesorios); C-QA3 **desaparece** (−0.23), porque a 390 las columnas apilan
   y no hay centrado que amplifique nada.

| | C-QA2 · producto | C-QA3 · home |
|---|---|---|
| cabecera | el clon **reserva flujo**: 177 donde el original pone 225 | las dos **fuera de flujo**; nadie reserva nada |
| mecanismo | **espaciador** de alto equivocado | **centrado vertical** de una columna 50.84 corta |
| @1440 | −48 exacto | +21.03 |
| @390 | +0.42 · +48.42 · **+78.42** | **−0.23** |
| ¿lo mueve arreglar la cabecera? | **sí, es el arreglo** | **no**, su `pt` es constante |

> **Son dos defectos con dos causas y van con dos arreglos y dos mediciones.**
> Unificarlos habría cableado el espaciador de producto usando el número de la
> home, que es la definición de arreglo falso.

### Lo que queda para el arreglo (PASO 3), con su objetivo

- **C-QA2 · producto** — el espaciador pasa de **177 a 225** (@1440) y de **137 a
  136.58** (@390). El offset del `h1` por debajo del espaciador **ya coincide al
  céntimo** (167.59 en los dos lados en `/kunak-api`), así que es un solo cambio.
  ⚠ ~~**`/software` no tiene objetivo verificable** hasta cerrar C-QA6: su
  residuo (−15.72) está por debajo del episodio de ±32.28.~~ **RESUELTO
  (2026-08-03, §C-QA6 · CIERRE):** el −15.72 y el −48 eran **el mismo defecto**
  medido contra los dos estados de un original bimodal (clon 373.39; orig
  389.11 ↔ 421.39). El objetivo era −48, **ya aplicado**: clon a 421.39 y Δ0 en
  las 4 corridas posteriores de `c-cabecera`.
- **C-QA3 · home** — es un déficit de **contenido** dentro de la columna del
  hero, no de cabecera. **No entra en la tanda de cabecera**: se decide aparte,
  como estaba pactado, y con su propia medición de qué falta en esos 50.84.

### ⚠ Y lo que hay que escribir sin suavizar

**Las 4 páginas de producto y la home figuraban como «verificadas con Δ0», y ese
estado era un artefacto del protocolo, no una corrección.** La regla del `h1`
resta la base de lectura antes de comparar, así que un desfase que vive **en** la
base se normaliza a cero por construcción. Nadie las miró en crudo hasta C-QA1.

En la home fue peor que un desfase tapado: **su `h1` es el oculto de SEO**, de 0
px en el original y 1 en el clon, así que **no había base** — todas sus lecturas
de cuerpo se hicieron contra un origen arbitrario. La home es la primera página
clonada y la más verificada del proyecto.

---

## C-QA2 · APLICADO — el espaciador, y lo que destapó (2026-07-30)

El espaciador de las 4 de producto pasa de `137 / lg:177` a **225 a 1440** y
**136.58 a 390**, medidos contra la cabecera del original. Los 4 `page.tsx`
tenían el `div` copiado a mano; ahora usan **`BandaCabecera`**, el componente que
salió de C-QA1 — extraído a la raíz al usarlo la segunda página, como manda
`CLAUDE.md` §Arquitectura.

`qa:clon-base` (umbral cero, con marcador): **+48 a 1440 y −0.42 a 390 en las 4,
y las otras 13 rutas sin mover un píxel.**

### Contra el original: el cambio hace EXACTAMENTE lo previsto

| ruta | @1440 antes→después | @390 antes→después |
|---|---|---|
| `/kunak-api` | −48 → **0** ✅ | +0.42 → **0** ✅ |
| `/software-…` | −48 → **0** ✅ | +0.42 → **0** ✅ |
| `/monitor-calidad-aire` | −48 → **0** ✅ | +78.42 → **+78** |
| `/accesorios` | −19.2 → **+28.8** | +48.42 → **+48** |

El espaciador mueve **+48 exactos** en las cuatro: `−19.2 + 48 = 28.8` cuadra al
céntimo igual que los tres `−48 + 48 = 0`. **El defecto del espaciador está
cerrado y era uno solo.**

### C-QA7 (nuevo, ABIERTO → ✅ cerrado 2026-07-31, ver §C-QA7 · CERRADO al final) · dos residuos propios que el espaciador tapaba

Lo que queda **no es del espaciador**: son defectos **de cada página**, debajo de
él, que el error del espaciador venía compensando en parte.

| ruta | residuo | qué se sabe |
|---|---|---|
| `/accesorios` | **+28.8** @1440 · **+48** @390 | su original mide **392.59**, igual que `/kunak-api`, que ahora da Δ0 → la cabecera es la misma y el sobrante está **en su cuerpo** |
| `/monitor-calidad-aire` | **+78** @390 (0 a 1440) | su original mide **308.58**, igual que `/software-…`, que da Δ0 a los dos anchos → mismo caso, y **solo a 390** |

Los dos se localizan igual: **midiendo por composición la cadena del `h1` desde
el espaciador hacia abajo** en la página que falla y en la que cuadra, que tienen
la misma cabecera. `qa:banda` ya sabe hacerlo (`cadena`).

> **`/accesorios` es el caso de libro de «un Δ de cero puede ser dos errores que
> se anulan», y aquí ni siquiera daba cero: daba −19.2** — un número pequeño,
> fácil de leer como fleco, que era **−48 de espaciador más +28.8 propios**.

### ⚠ Y una lección sobre el veredicto de la tanda anterior

El acta de C-QA2 decía que era **«un solo cambio, sin segundo defecto debajo»**,
y lo fundaba en que el offset del `h1` por debajo del espaciador **coincidía al
céntimo (167.59)**. Era verdad — **y estaba medido en `/kunak-api` y solo ahí**.
Para 2 de las 4 no valía.

> Es la regla de `CLAUDE.md` otra vez: **el veredicto tiene que cubrir
> exactamente la propiedad de la que habla.** «El offset coincide en la página
> que miré» no es «el offset coincide en las cuatro», y la diferencia entre las
> dos frases son los dos residuos de C-QA7.

No cambia la decisión —el arreglo del espaciador era correcto y había que
hacerlo— pero sí lo que se podía prometer antes de correrlo.

### El estado de `/software`, que NO se da por bueno

Da **Δ0 a los dos anchos**, que es el mejor resultado posible. **Y su
verificación sigue pendiente del suelo real (C-QA6)**: esa ruta presenta
episodios de **±32.28** en la base, así que un Δ0 leído en una corrida puede ser
el episodio y no el arreglo. Se cierra cuando cierre la campaña de ráfagas.

> **CERRADO (2026-08-03, §C-QA6 · CIERRE).** El Δ0 **es el arreglo, no el
> episodio**: el original salió en su estado alto en 2 de 3 ráfagas y en **6 de
> 6** corridas de `c-cabecera`, y el clon casa con él al céntimo. Con la letra
> pequeña que ahora sí se puede escribir: es **Δ0 contra el estado dominante**,
> y si una corrida futura pilla el estado bajo saldrá **+32.28** sin que haya
> regresión.

### Nota suelta · `/` a 390 con `docH +8`

Aparece en la comparación clon-contra-clon y **no es de este cambio**: la home no
usa `BandaCabecera` y la regla CSS nueva solo casa con `.banda-cabecera*`. No
mueve ningún ancla (`h1.y` sin cambio). Queda anotado como no reproducido.

---

## ~~C-QA6 · CAMPAÑA ABIERTA~~ **CERRADA (2026-08-03)** — el protocolo de ruido, rediseñado (2026-07-30)

> **→ §C-QA6 · CIERRE, al final del documento.** Lo de abajo es el rediseño del
> protocolo, que sigue vigente; el estado de la campaña ya no.

`CLAUDE.md` §Notas de método sustituye «mide 3 veces» por tres reglas, porque lo
viejo **medía el temblor dentro de un episodio** y lo que mueve al original son
**los episodios**:

1. **el suelo es el máximo ENTRE ráfagas separadas**, no dentro de una. Una
   ráfaga = 3 cargas seguidas; hacen falta **≥3 ráfagas, ≥2h de separación, ≥2
   días distintos**;
2. **una ráfaga limpia se reporta como «no se observó ruido en este episodio»**,
   nunca como «el suelo es 0»;
3. **el alcance se declara siempre**: qué rutas y qué anchos entraron.

`ruido.mjs` lo implementa con `CAMPANA=<nombre>`: cada ráfaga se congela en su
propio fichero con sello de tiempo bajo `medidas/campana/<nombre>/`, y la sonda
lee todas y dice si la campaña está cerrada. Un fichero por ráfaga porque cada
una es un dato independiente que hay que poder exhibir — y porque una campaña
que acumulara en un solo fichero pelearía con la guarda de `w()` cada sesión.

### Estado: 1 de 3 ráfagas · faltan 2 y ≥1 día

**Ráfaga 1 — 2026-07-30 22:14:57 local** (`campana/cqa6/rafaga-2026-07-30T22-14-57.json`;
re-etiquetada el 2026-08-03 — se archivó como `rafaga-2026-07-31T03-14-57.json`,
sello **UTC**, que es **el mismo instante**):

| combinación | `h1` | posicional |
|---|---|---|
| `software@1440` · `edar@1440` · `petroleo@1440` | **±32.28** las tres | 33 |
| las tres @390 | 0 | 81 · 27 · 27 |

> **Tercera observación independiente del episodio de ±32.28**, y la primera que
> lo ve en las **tres rutas a la vez** a 1440. Ya no es un fleco de una corrida.

**Lo máximo observado hasta ahora es ±32.28; no es todavía «el suelo»** — la
campaña está abierta y el máximo solo puede subir. Las tres combinaciones @390
están a 0, que se lee **«no se observó ruido en estos episodios»**, no «su suelo
es 0».

### Consecuencia vigente

`/software` da **Δ0 a los dos anchos** tras C-QA2, que es el mejor resultado
posible, **y no se da por verificado**: un Δ0 leído en una corrida podría ser el
episodio. Se cierra cuando cierre la campaña.

### Nota suelta, sin perseguir

`software@1440` da **dispersión dimensional de 4862.67 con el nº de filas
estable**, así que esta vez **no es el artefacto de índices** que se corrigió: es
una fila que de verdad cambia de alto entre cargas. Anotado; no se persigue en
esta tanda.

---

## C-QA7 · CERRADO — los dos residuos eran TRES defectos, y dos son el mismo (2026-07-31)

Diagnóstico por composición con `qa:banda` (la cadena del `h1`, eslabón a
eslabón), **antes de tocar nada**, contra el original en vivo. Congelado en
`medidas/c-banda-1440-2026-07-31-{3,4,5}.json` y `c-banda-390-2026-07-31-{2,3,4,5}.json`
(el sufijo más bajo de cada ancho es el diagnóstico; el más alto, la
verificación — el `-2` de 1440 es una corrida fallida: el original tardó >120 s
y sirvió selectores muertos, documentada y descartada).

### `/accesorios` (+28.8 @1440 · +48 @390) — dos defectos que suman

| defecto | @1440 | @390 |
|---|---|---|
| la fila del hero llevaba `pt-[30px] lg:pt-[2vw]` — **el default Divi cableado sin medir**; en el original esa fila va a **pt 0 en los dos anchos** (sangría fila→columna 0 medida; el aire lo pone la sección, 50/4vw, ya replicada) | **+28.8** | **+30** |
| el kicker «Accesorios» a `text-[50px]/60` fijo, **sin la regla móvil 35px/42** de ≤767 que ya llevaban `HeroApi` y `HeroSoftware` | 0 (60=60) | **+18** (60 vs 42) |
| **total** | **+28.8** ✓ | **+48** ✓ |

La composición cuadra al céntimo en los dos anchos, sin resto.

### `/monitor-calidad-aire` (+78 @390 · 0 @1440) — un defecto, y es el mismo §2

La cadena del clon es **idéntica a la del original eslabón a eslabón** —fila
`pt` 30 incluida, que en esta página **sí existe**— hasta el kicker «Kunak AIR
Pro»: **120 de alto contra 42**. Iba con **estilo inline**
(`fontSize: 50, lineHeight: "60px"`), que no puede ser responsive, así que
nunca bajó a 35px/42 y a 390 envolvía a **2 líneas**: 60×2 = 120, y
120 − 42 = **78** — el residuo entero.

**La firma espejo, confirmada en su forma pura:** a 1440 «Kunak AIR Pro» cabe
en una línea a 50px y el defecto no deja ni rastro (Δ0 antes y después). No lo
tapaba un contenedor con holgura: **lo tapaba el no-wrap** — la holgura era el
ancho de la línea.

### Resultado — Δ0 exacto en crudo, los dos anchos, las dos rutas

| ruta | @1440 (orig = clon) | @390 (orig = clon) |
|---|---|---|
| `/accesorios` | **392.59 = 392.59** ✅ | **278.58 = 278.58** ✅ |
| `/monitor-calidad-aire` | **421.39 = 421.39** ✅ | **308.58 = 308.58** ✅ |

Arreglos: `src/app/accesorios/page.tsx` (quitar el `pt` de fila; kicker a las
clases responsive) y `src/components/monitor/HeroProducto.tsx` (kicker de
estilo inline a las mismas clases). Commits `0ce6e00` y `2c2432e`.

### ⚠ Lo que el diagnóstico enseñó, más allá del arreglo

1. **El `pt` de la primera fila del cuerpo es CAMPO, no plantilla** — la huella
   del test A en las 4 páginas de producto del régimen builder: **0 px a los
   dos anchos** en accesorios/api/software (el editor lo anuló) y **2 %/30**
   (el default intacto) en monitor. Cuatro páginas hermanas, dos valores. Es la
   familia de `flujo` otra vez, ahora en la entrada del cuerpo. Anotado en
   `ESQUEMA-CMS.md` §6 en esta misma tanda — regla nueva: **lo que un
   diagnóstico revele como campo va al esquema en la tanda que lo mide.**
2. **La regla móvil del kicker (35px/42 en ≤767) es plantilla** — cero varianza
   en los 4 originales de producto. El clon la tenía en 2 de 4: las otras dos
   la perdieron por escribirla a mano (una con clases fijas, otra con estilo
   inline). Tercera vez que un valor compartido se cablea por instancia;
   cuando estos arquetipos se modelen, el kicker es UN componente.
3. **El −19.2 de `/accesorios` entra al catálogo de compensaciones de
   `CLAUDE.md`** (sexta instancia): −48 de espaciador tapando +28.8 propios.
   Un número pequeño no es un defecto pequeño: era el residuo de dos grandes.

### ⚠ Custodia · la línea base 390 post-C-QA2 canónica ERA el build roto — RECONCILIADO (2026-07-31)

La verificación de esta tanda comparó contra `clon-base-390-cqa2-despues.json`
y salieron **10 «regresiones» falsas de +136.58 en S0**: ese fichero era el
congelado del build con el **comentario CSS mal cerrado** (la banda a 0 a 390 —
la lección del HANDOFF). La línea **sana** post-C-QA2 vivía en la variante
fechada: la guarda de `w()` la mandó ahí al negarse a pisar la rota — su
**primer disparo real protegiendo evidencia** — y nadie reconcilió el nombre.

**Reconciliado en la tanda siguiente (2026-07-31), invirtiendo los nombres:**

| fichero | contiene |
|---|---|
| `clon-base-390-cqa2-despues.json` (canónico) | la medida **SANA** post-C-QA2 (`/kunak-api` h1y 278.58 · S0 136.58) |
| `clon-base-390-cqa2-despues-BUILD-ROTO-comentario-css.json` | el congelado del **build roto** (S0=0), conservado como evidencia |

Git conserva las dos historias (`aa8541a` y el rename). Verificado contra la
sana: `/accesorios` −48 y `/monitor` −78 exactos, las otras 15 sin mover un
píxel (`clon-base-390-cqa7-despues.json`). A 1440 nunca hubo ambigüedad (el
bug era solo móvil).

La moraleja, que sustituye al aviso que hubo aquí 24 horas: **documentado no
es conectado — un aviso de «usa el otro fichero» que se puede eliminar
arreglando el nombre es un nombre mal puesto.** El próximo `--cmp` habría usado
el nombre obvio; ahora el nombre obvio es el correcto y el peligroso dice en el
nombre lo que es.

---

## A-QA1 · ~~CERRADO~~ → **CERRADO DE VERDAD 2026-08-01** — era el TOPE DE 350 DEL TEMA, no el separador (2026-07-31)

> Acta completa de la construcción en `docs/research/arquetipo-A/MEDICION.md`.
> Medida congelada: `medidas/clon-base-{1440,390}-grupoA-base26.json` contra la
> `y` cruda del original en `medidas/a-cascaron-{1440,390}-2026-07-31-4.json`.

### ⚠ ACTA DE CORRECCIÓN (2026-08-01) — se declaró CERRADA una clase que llegaba a 3 de 7

**No se reescribe lo de abajo: se tacha y se anota.** El diagnóstico del
2026-07-31 es correcto —el tope de 350 es del tema, el separador no era la
causa— y **el cierre no lo era**.

**Qué se creyó.** Que bajar el truncado al defecto de `Breadcrumb.tsx` lo
repartía a todas las migas del clon, y por tanto que la CLASE quedaba cerrada.
El commit `072d9f1` lo dice, y la §«Y es CLASE, no instancia» de abajo también.

**Por qué se creyó.** Por la **cabecera del propio componente**
(`src/components/Breadcrumb.tsx:2-5`), que afirmaba:

> «Migas de pan `ol.kunak-breadcrumbs` — compartidas por /monitor-calidad-aire,
> /accesorios, /software-de-medicion-calidad-del-aire, /kunak-api y las páginas
> de sector.»

**Falso.** Quien lo importa de verdad, derivado con un grep, son **tres**:
`sectores/[slug]/page.tsx`, `arquetipo-a/CascaronA.tsx` y `caso/CasoPagina.tsx`.
Las cuatro páginas que la cabecera nombraba **tienen su propia copia escrita a
mano** y no importan nada. Se leyó la cabecera en vez de derivar los
consumidores, que es la tercera regla de sondas (**documentado no es
conectado**) aplicada a un comentario en vez de a una función.

**Estado real:** el arreglo llegó a **3 de las 7** migas que pinta el clon.

| implementación | pinta | ¿le llegó el tope de 350? |
|---|---|---|
| `Breadcrumb.tsx` ← `sectores/[slug]` | 6 sectores + 2 monográficos | ✅ |
| `Breadcrumb.tsx` ← `CascaronA` | las 4 formas del grupo A | ✅ |
| `Breadcrumb.tsx` ← `CasoPagina` | el caso de éxito | ✅ |
| `monitor/HeroProducto.tsx` a mano | `/monitor-calidad-aire` | ❌ |
| `accesorios/page.tsx` a mano | `/accesorios` | ❌ |
| `kunak-api/page.tsx` a mano | `/kunak-api` | ❌ |
| `software-…/page.tsx` a mano | `/software-de-medicion-calidad-del-aire` | ❌ |

### ⚠ Y la segunda corrección: `49.94` se citó como medida DEL PAR, y es un solo lado

La §«Y es CLASE» de abajo dice «producto (**49.94**) … daba Δ0 porque sus
rótulos no llegan a 350». **49.94 es el ancho del original.** El clon leía
**38.94** en el mismo fichero congelado, `medidas/a-miga-1440-2026-08-01.json`.
La miga entera de producto mide **183.95 en el original contra 150.70 en el
clon — −33.25, idéntico a 1440 y a 390**, o sea que por la regla de los dos
anchos no puede ser ruido. Las cuatro copias a mano no llevan `font-semibold`
ni `tracking-[0.3px]` ni el tope, y ponen el separador como `<li aria-hidden>/</li>`
con `gap-1` en vez del `li::after` con `pl/pr 7.2` del original.

> **La sonda lo imprimió. El informe no lo contó.** Es la **regla 1** de
> §Reglas sobre las sondas —*un descuadre impreso y no contado da el mismo
> informe que uno no visto*— cometida **en un informe y no en una sonda**. De ahí
> la extensión de la regla, anotada en `CLAUDE.md`: el canal único de verdad
> obliga igual a lo que escribe la sonda y a **lo que escribe quien la lee**.
> Copiar un número de una tabla de pares sin decir de qué lado es, es exactamente
> el mismo fallo un nivel más arriba.

**Se cierra de verdad en la tanda del 2026-08-01** (§CLASE · la miga, más
abajo), con las cuatro copias unificadas sobre el base y las cuatro rutas
adjudicadas contra el original una por una.

**Base en crudo del arquetipo nuevo** — la medida que `CLAUDE.md` §Notas de
método exige una vez por arquetipo, antes de fiarse de ningún Δ de cuerpo:

| forma | @1440 | @390 |
|---|---|---|
| blog CON relacionados | **−0.01** ✅ | **+26.00** |
| blog SIN relacionados | **−0.01** ✅ | **0.00** ✅ |
| término | **−0.03** ✅ | **−0.02** ✅ |
| documento científico | **−0.01** ✅ | **+52.00** |

**El residuo está CUANTIZADO en renglones de 26**: son 1 y 2 renglones de miga
de más, no un desfase continuo. O sea que la maqueta vertical es correcta y lo
que sobra es **ancho de la miga**, que empuja el envolvimiento.

### El separador era la sospecha, y la medición lo descartó

`npm run qa:a-miga`, **a 1440 y no solo a 390**: a 390 la miga llena el
contenedor en los dos lados y el ancho está **tapado por el wrap**.

| | original | clon |
|---|---|---|
| separador | `"/"` en un `::after` del `li`, **w 5.31** + `pl 7.2`, con el `li` a `pr 7.2` | `›` con `mx-[6px]` |
| eslabón intermedio | **75.72** | **75.89** |

**+0.17 px por eslabón**, o +0.68 con cuatro. Frente a renglones de 26. Ajustar
el separador habría sido el arreglo falso.

### Lo que era: el ÚLTIMO eslabón, y el tope es del TEMA

El original acota el último a `max-width: 350px · white-space: nowrap ·
overflow: hidden · text-overflow: ellipsis`, medido en **siete formas** —blog,
término, documento científico, caso, producto, sector— y luego también en
monográfico. El clon lo dejaba envolver: **498.97** y **681.77** contra 350.

Resultado tras bajar el tope al componente base: **−0.01 · −0.01 · −0.03 a 1440
y 0.00 · 0.00 · −0.02 a 390** en las cuatro formas.

### ⚠ Y es CLASE, no instancia — con una víctima ya cobrada

> ⚠ **Esta sección se dejó como se escribió; sus dos erratas están tachadas
> abajo y explicadas en el ACTA DE CORRECCIÓN de arriba.**

`variante="caso"` de `Breadcrumb` llevaba el truncado como si fuera del caso.
Al ser del tema:

- ~~**producto (49.94) y sectores (194.52) daban Δ0 porque sus rótulos no llegan
  a 350**~~ → **sectores (194.52) sí**; **producto NO daba Δ0**: 49.94 es el
  original y el clon medía **38.94**, con la miga entera a **−33.25**. El número
  se copió de un solo lado de una tabla de pares. Es **corrección aparente por
  contenido corto** en sectores, y en producto era un descuadre sin contar;
- **el monográfico de petróleo ya estaba roto**: su rótulo mide **436.97**, sí
  pasa de 350, y el clon envolvía en 3 renglones donde el original hace 2
  (**−26 de `docH` a 390**). Invisible porque en sector la miga va **debajo**
  del `h1`, así que la base de lectura no se movía y solo asomaba en `docH`,
  que nadie comparaba contra el original. Verificado tras el arreglo: **Δ 0.00**;
- y el día que un editor escriba un título largo en cualquier otra plantilla,
  habría pasado lo mismo en una página verde.

### Un duplicado que no hacía falta

`MigasA` reimplementó la miga en `CascaronA` cuando `Breadcrumb.tsx` ya la
pintaba para ~~producto,~~ caso y los 6 sectores — **producto no: también era
una copia a mano, y no se vio** (ACTA DE CORRECCIÓN). El coste no fue el
duplicado: fue que **divergió** (75.89 contra 75.72). Ahora es un envoltorio del
base.

> Y el duplicado **no era uno, eran cinco**: `MigasA` más las cuatro copias de
> producto, accesorios, api y software. Se arregló el que la medición del grupo A
> puso delante y se dio la clase por cerrada — *arreglar la instancia y no la
> CLASE*, el mismo fallo que `CLAUDE.md` documenta dos veces.

**Lo que este defecto NO era:** la banda de cabecera —**225 / 165.58**, deducidos
por composición— ni el ritmo de `section#0`, que da 50 y 102 exactos.

## CLASE · la miga — CERRADA de verdad (A-QA1b, 2026-08-01)

> Congelado: `medidas/a-miga-{1440,390}-2026-08-01-{2,3}.json` ·
> `medidas/clon-base-{1440,390}-aqa1b.json`.

Cierre de la clase que A-QA1 dio por cerrada llegando a 3 de 7 (ACTA DE
CORRECCIÓN, arriba). **Las cuatro copias a mano se unifican sobre
`Breadcrumb.tsx`** y la miga pasa a tener **una sola implementación en el clon**.

### El barrido acotado que se hizo ANTES de tocar

Porque ya iban dos instancias (`MigasA` y estas cuatro), tocaba preguntar si
había una tercera clase antes de arreglar la segunda.

**(a) ¿Copiaron algo más esos 4 ficheros?** **No.** Importan todo lo demás
—`HeaderNav`, `BandaCabecera`, `Footer`, `ScrollToTop`, `UltimosArticulos`,
`FaqAcordeon`, `CtaBanner`, los heros…—. Lo único escrito a mano era la miga, y
con ella su envoltorio `<nav>` + fila. El **dato** (`BREADCRUMB`) ya estaba bien
puesto en `lib/` en tres de los cuatro; el cuarto lo tenía incrustado en
`HeroProducto.tsx` y sale a `lib/monitor.ts` en esta tanda.

**(b) ¿Qué componentes afirman en su cabecera quién los usa?** Barridos los
**74** `.tsx` de `src/components`: **uno solo**, y era el falso —
`Breadcrumb.tsx`. Otros dos nombran rutas en su cabecera sin afirmar
consumidores (`BlurbsIconos`, que nombra `/kunak-api` y `/software` como las dos
**calibraciones** del módulo; `CtaNewsletter`, que nombra el destino de su botón).
Ninguno miente.

**Y una nota de método sobre el barrido mismo.** La primera versión buscó
literales de `className` compartidos y **casó en 16 ficheros** con
`text-[18px] leading-[30.6px] text-[#333]` — que no es identidad de componente
sino un **token del tema**, legítimamente repetido. Es el falso positivo de
*«un patrón que casa en todas no mide nada»*. Lo que sí discrimina es el
marcador **semántico** —`aria-label`, `itemType`, `role`, clase `kunak-*`/`et_pb_*`—:
nombra una **cosa**, no un aspecto. Con ese criterio salen 45 marcadores, 9 en
más de un fichero, y el único que delata una copia es `aria-label="Migas de
pan"` en **5**.

**No aparece una tercera clase.** Dos hallazgos adyacentes, ninguno de ellos una:

- `CtaBannerSlider` reutiliza el **motor** de `software/CarruselCapturas` — y lo
  **declara en su propia cabecera**, con su spec. Duplicación deliberada y
  registrada, que es lo contrario del problema de aquí;
- `icons.tsx` exporta un `KunakLogo` que **no importa nadie** (el que se usa es
  `KunakLogoBrand` de `KunakLogo.tsx`). Es código muerto, no una copia en uso —
  y un `export` no lo caza el linter. Ver §CLASE · el `export` que esconde
  código muerto, abajo.

### ⚠ CLASE · el `export` que esconde código muerto (abierto, 2026-08-01)

**Se registra como CLASE y no como instancia, porque el mecanismo es general y
el linter no lo cubre.**

> **`noUnusedLocals` caza una función local que nadie llama. Una función
> **exportada** que nadie importa no la caza nadie**: desde el punto de vista
> del módulo, el `export` *es* su uso. O sea que **exportar convierte código
> muerto en código invisible.**

Es la misma familia que la regla 3 de §sondas —*documentado no es conectado*—,
que se pagó con `charsCenso()`: allí la función estaba definida, documentada
como resuelta y **nunca llamada**, y lo habría cazado el linter precisamente
porque era **local**. Un `export` le quita esa red.

**Instancia conocida:** `KunakLogo` en `src/components/icons.tsx:348`. Hay dos
implementaciones del logo y solo una viva; quien vaya a tocar el logo puede
editar la muerta y ver que no pasa nada — que es el coste real, no los bytes.

**Por qué está abierto y no cerrado:** no se ha barrido la clase. El barrido de
A-QA1b buscaba **copias a mano**, no **exports huérfanos**; son dos preguntas
distintas y solo se hizo la primera. Cerrarlo es derivar, para cada `export` de
`src/`, si alguien lo importa — el mismo grep que ya se usa para consumidores,
al revés. **No se arregla la instancia antes de barrer la clase**: es
exactamente cómo se llegó a la tercera tanda de la miga.

### La adjudicación de las cuatro, CONTRA EL ORIGINAL

`npm run qa:a-miga -- 1440|390`. Las tres rutas que faltaban —accesorios,
software, api— **se añaden a la sonda**: `producto` ya estaba y por eso se vio;
las otras tres no las miraba nadie contra el original.

| ruta | antes (orig → clon) | después | veredicto |
|---|---|---|---|
| `/monitor-calidad-aire` | 183.95 → **150.70** (**−33.25**) | 183.95 → **183.95** | **CORRECCIÓN** |
| `/accesorios` | sin medir nunca | 207.73 → **207.73** | **CORRECCIÓN** (último 73.72 = 73.72) |
| `/software-…` | sin medir nunca | 199.13 → **199.13** | **CORRECCIÓN** (último 65.11 = 65.11) |
| `/kunak-api` | sin medir nunca | 199.92 → **199.92** | **CORRECCIÓN** (último 65.91 = 65.91) |

**Δ 0.00 en las cuatro, a 1440 y a 390**, con `eslabones 3/3 · renglones 1/1 ·
alto 26/26` y el último `li` a `max-width 350 · nowrap · hidden · ellipsis` en
los dos lados. Las **11 formas** que mide hoy la sonda cierran a Δ0.

Las tres «sin medir nunca» son el punto: su Δ0 de hoy es la **primera vez** que
esas migas se comparan con el original. Antes no estaban bien, estaban **sin
mirar** — y habrían dado verde en cualquier informe que se fiara de producto por
analogía.

### ⚠ Y `clon-base` NO marcó las cuatro — la lección de la tanda, sobre la guarda

Se esperaba que el guardián clon-contra-clon señalara cuatro diferencias que
adjudicar. Marcó **cero**: `31 páginas · 0 con regresión` a 1440 y a 390.

**No es que el cambio no hiciera nada** —`a-miga` acaba de medir +33.25 en
producto—. Es que **`clon-base` mide `docH`, `h1.y`, nº de secciones y nº de
enlaces: todo vertical y estructural.** El defecto era de **ancho**, y como las
cuatro migas caben en un renglón antes y después, no movió un píxel de alto.

> **La guarda de no-regresión es CIEGA a la clase de defecto que esta tanda
> arregla**, y lo es por la misma razón que el defecto sobrevivió meses: se mide
> el nivel que está a mano, y el nivel que estaba a mano era el vertical.
> `CLAUDE.md` §EL NIVEL NO ES SOLO VERTICAL, aplicado esta vez **al
> instrumento**.

Consecuencia operativa, y es la que hay que recordar: **un `clon-base` limpio
dice «no hay regresión vertical», no «el cambio no tuvo efecto».** Para un
cambio horizontal la adjudicación **tiene** que venir de una sonda que mida
ancho contra el original — aquí, `a-miga`. Las 27 rutas restantes sin mover un
píxel siguen valiendo como lo que son: no hay regresión vertical en ninguna.

### Verificación

- `qa:a-miga` **11 formas × 2 anchos**, Δ0 · test en negativo **exit 2**, exit 0
  limpio (22 páginas, 1 selector muerto detectado).
- `qa:clon-base` 1440 y 390 con `MARCADOR=max-w-[350px]` verificado en el HTML
  servido: **31 páginas · 0 regresión**.
- `qa:enlaces` limpia en las dos direcciones (31 páginas, 868 hrefs internos) ·
  `qa:slugs` limpia · `qa:lib` 26/26 · lint 0 errores · typecheck · build.

### Lo que queda ABIERTO, y se dice porque la sonda lo imprime

**`doc-cientifico` · −2.70 en la suma de textos a 1440.** El eslabón 3
(«Artículos científicos y estudios») mide **208.19 en el original contra 205.48
en el clon**; los otros cuatro dan Δ0 exacto.

- **Es anterior a esta tanda**: idéntico en la congelación de antes del cambio y
  en la de después. No lo causa la unificación.
- **No mueve maqueta**: 1 renglón / 1 renglón y alto 26/26 a 1440; a 390 la miga
  va capada a 350 y da `renglones 3/3 · alto 78/78`. O sea que **a 390 está
  tapado por el tope**, y solo es observable a 1440 — otra vez el corolario del
  ancho.
- **Descartado**: el texto es **idéntico byte a byte** (32 cp, mismos
  codepoints), y el HTML del original no trae `&nbsp;` ni espacio de cola.
- **Sin identificar**, y se deja así en vez de inventarle una causa. No se cablea
  nada: sería exactamente el arreglo falso que esta tanda documenta.

## COBERTURA · lo que apareció al comparar 31 rutas contra el original (2026-08-01)

> Congelado: `medidas/c-cmp-{1440,390}-2026-08-01*.json` ·
> `medidas/c-cabecera-{1440,390}-2026-08-01.json` · `medidas/tree-cmp-*` ·
> `medidas/enlaces.json` · `medidas/cobertura.json`. Matriz: `npm run qa:cobertura`.
>
> **Tanda de diagnóstico: nada de esto se arregla aquí.** Es el inventario que
> alimenta la tanda CLASE. Es la **primera vez** que 31 rutas se comparan con el
> original en `docH` y árbol — antes 23 de ellas solo tenían `clon-base`.

### ⚠ D4 · RESUELTO EL MODELO, PENDIENTE EL ARREGLO (2026-08-01)

> Sonda: `npm run qa:d4 -- 1440`. Congelado: `medidas/d4-pie-1440*.json`.
> Decisión de modelo escrita en `ESQUEMA-CMS.md` **§6b**, en esta misma tanda.

**La pregunta era si el pie del original es el mismo con otro contenido o son
plantillas distintas. Son las dos cosas, y hay que separarlas:**

| familia | secs | ancho de fila | `pt/pb` sección | alto |
|---|---|---|---|---|
| A·blog · A·término · SECTOR | 3 | **1238.39** (86 %) | 0 | 593.75 |
| SOFTWARE | 3 | **1152** (80 %) | 0 | 681.09 |
| CATÁLOGO · PRODUCTO | 3 | **1152** | **57.5938** | 1048.25 |
| **CASO** | **4** | 1238.39 | 0 | 936.81 |

1. **El contenido del pie es el MISMO en las 7**: `footer-links` (8 módulos, 5
   columnas), `footer-legal` (7 módulos, 3), `footer-background` (1), mismas
   clases `_tb_footer`, 46–48 enlaces.
2. **CASO añade una 4ª sección** —un CTA de 343.06— que las otras seis no
   tienen. **Eso sí es otra plantilla**, y confirma el `tb_footer` 4 vs 3 de C-1.
3. **Lo que varía entre las otras seis es PRESENTACIÓN, no contenido**, en dos
   ejes independientes:
   - **ancho de fila**: 1152 estrecha las columnas a 230.39 (contra 247.67), los
     enlaces envuelven más y `footer-links` pasa de 430.78 a 518.13. La regla del
     ancho, en el pie;
   - **`padding` de sección**: 0 contra **57.5938** (el default Divi del 4 %).
     Explica `footer-background` **al céntimo**: 41 → 156.19 = **57.5938 × 2**.

**Firma «constante dentro de la familia, distinta entre familias» = decisión de
PLANTILLA, no campo por instancia.** Nadie editó a mano el pie de `/accesorios`:
lo heredó su tipo de página. Y los mismos dos valores gobiernan la retícula del
cuerpo (86 % en grupo A y sector, 80 % en producto/catálogo/software), así que
**van en la plantilla de tipo, no en el dato del pie**.

**El defecto del clon, ya localizado:** `Footer.tsx` escribe `w-[80%]
max-w-[1380px]` fijo → **1152 siempre**, que es el valor de SOFTWARE. Por eso
acierta ahí y falla en las demás — **la familia con la que se calibró**. Lo
importan **10 ficheros**.

**Pendiente de arreglar** (no entra en esta tanda: toca las 31 rutas y exige el
ciclo de adjudicación completo):
- el ancho de fila y el `padding` salen del **tipo de página**, no se cablean;
- **CASO recibe su 4ª sección** (CTA), que hoy no existe en el clon;
- y después, medición antes/después y adjudicación **contra el original** de todo
  lo que se mueva, una a una.

### ⚠ C1 · LOCALIZADO (2026-08-01) — no es UN desfase, son CUATRO que se suman

> Sonda: `node scripts/qa/c1-localiza.mjs 1440|390`, una ruta por familia.
> Congelado: `medidas/c1-localizacion-{1440,390}.json`. **Diagnóstico: no se ha
> arreglado nada.**

El «resto» se abre por composición en cuatro piezas, y **las cuatro sumadas
reconstruyen el número de cada familia al céntimo**:

| pieza | A · blog | CATÁLOGO | SOFTWARE |
|---|---|---|---|
| **D1 · antes de la 1ª sección** | −225 | −225 | −225 |
| **D2 · Σ huecos entre secciones** | +50 | +50 | +50.01 |
| **D3 · entre última sección y pie** | 0 | −42 | −42 |
| **D4 · alto del PIE** | **+87.34** | **−367.16** | **0** |
| resto (después del pie) | −0.13 | +0.19 | −0.64 |
| **suma** | **−87.79** | **−583.97** | **−217.63** |
| medido en C1 | −87.79 | −583.97 | −217.63 |

**Cuadra exacto en las tres.** Y a 390 también: A da
`−165.58 + 76 + 0 + 292.52 + 0.42 = **+203.36**`, que es el valor medido.

**Qué es cada una:**

- **D1 — la cabecera del clon está FUERA DE FLUJO.** Original `position: static`
  (`relative` a 390) y **en flujo**, 225 de alto: empuja la primera sección 225
  hacia abajo. El clon la pone `absolute`, así que su primera sección arranca en
  **y = 0**. ⚠ **No está probado que esto sea defecto de `docH`**: si el clon
  mete esos 225 dentro de su primera sección, la partición cambia pero el total
  no. Es la misma trampa de C4 — mientras la partición no sea equivalente, el
  reparto resto/secciones no se puede leer. **Se mide antes de tocar.**
- **D2 — el clon mete 50 px de hueco entre secciones que el original no tiene**
  (76 a 390 en grupo A). Constante en las tres familias.
- **D3 — el original tiene 42 px entre la última sección y el pie** que el clon
  no tiene. En catálogo y software; en grupo A no existe (0 en los dos).
- **D4 — el pie del clon es de ALTO FIJO y el del original VARÍA por página.**
  Ésta es la que explica que el número sea *distinto por familia*:

| | pie original @1440 | pie clon @1440 |
|---|---|---|
| A · blog | **593.75** | 681.09 |
| CATÁLOGO | **1048.25** | 681.09 |
| SOFTWARE | **681.09** | 681.09 |

  El clon sirve **siempre 681.09**; el original va de 593.75 a 1048.25. Por eso
  SOFTWARE daba Δ0 en esta pieza y las otras dos no: **el clon acertó en la
  familia con la que se calibró el pie, y las demás heredaron su altura.** Es
  otra vez «corrección aparente por contenido corto», ahora en el pie.

**Sobre la inversión de signo, que era el riesgo del encargo:** las cuatro causas
son las mismas a los dos anchos, con magnitudes distintas (D1 −225→−165.58, D2
+50→+76, D4 +87.34→+292.52). **No hacen falta dos explicaciones**, pero tampoco
vale una sola: son cuatro sumandos con signos opuestos, que es exactamente la
forma «dos errores que se anulan» del catálogo del NIVEL, aquí con cuatro.

**Orden para la tanda de arreglo:** D4 primero (es la que diferencia familias y
la de mayor magnitud), luego D2 y D3 (constantes y localizadas), y **D1 la
última y solo si se demuestra que mueve `docH`** — tocar el flujo de la cabecera
en 31 rutas por un número que quizá sea de partición es el arreglo falso de
manual.

### ⚠ C1 · CLASE — el cascarón fuera de sección difiere por FAMILIA, y el signo se invierte

Descomponiendo `docH` en **Σ secciones** (cuerpo) y **resto** (cabecera + pie +
lo que no cae en ninguna sección), sobre las 17 rutas donde el nº de secciones
coincide en los dos lados y la partición es por tanto equivalente:

| familia | rutas | resto Δ @1440 | resto Δ @390 |
|---|---|---|---|
| **A · blog + documento** | **14** | **−87.5** (rango −86.92…−88.14) | **+228.5** (subgrupos en 203 y 176.6) |
| CATÁLOGO `/accesorios` | 1 | **−583.97** | −440.03 |
| SOFTWARE (`/kunak-api`, `/software-…`) | 2 | **−217.63 / −217.85** | −127.85 / −127.29 |
| PRODUCTO `/monitor-calidad-aire` | 1 | −584.15 | *(partición no equivalente)* |

**Por qué es CLASE y no ruido, con las tres señales del criterio:**

1. **Constante dentro de la familia.** Las 14 rutas de grupo A dan −87.5 **±0.6**
   en páginas que van de 1 772 a 42 557 px de alto. Un residuo que no escala con
   el contenido es del cascarón.
2. **Las familias coinciden consigo mismas y no entre sí.** `/accesorios`
   (−583.97) y `/monitor` (−584.15) dan **el mismo número**; `/kunak-api` y
   `/software` dan **el mismo número** (−217.6/−217.9). Es por plantilla.
3. **El signo se invierte entre anchos** en grupo A: −87.5 a 1440, **+228.5** a
   390. `CLAUDE.md` §Notas de método: *el signo se invierte, que es la firma de
   una medida tapada*. Es la misma firma que destapó C-QA7.

**Invisible para todo lo que había:** `clon-base` compara el clon consigo mismo,
y `c-cabecera` mide **por encima del `h1`** — que en grupo A cuadra a −0.01. El
residuo vive **por debajo**, o sea en el pie o en el hueco que lo precede.

### ~~C2 · DEFECTO — la HOME tiene la base desplazada +289.91~~ → **NO ES DEFECTO. Anulada el 2026-08-01**

> ⚠ **La ficha de abajo estaba MAL y contradecía a C-QA3**, que ya lo había
> resuelto el 2026-07-31. Se tacha ésta, no aquélla. Se deja escrita porque el
> error es instructivo.
>
> **Qué falló:** leí `h1.y` original = 0 y concluí «el original pone el `h1`
> arriba con la cabecera transparente encima». **Nunca miré si el `h1` tenía
> caja.** No la tiene: es un título oculto para SEO en los dos lados, y su `y`
> no guarda relación con la maquetación. Es exactamente lo que dice C-QA3.
>
> **Medido ahora, que es lo que faltaba** (`c-cabecera` mide ya `h1caja`,
> congelado en `medidas/c-cabecera-{1440,390}-parcial-2026-08-01.json`):
>
> | | `position` | ¿en flujo? | caja | ¿empuja algo? |
> |---|---|---|---|---|
> | original | `static` | sí | **0 × 0** | **nada** |
> | clon | `absolute` | **no** | 1 × 1 | **nada** |
>
> Los dos tienen **consecuencia visual cero**, por caminos distintos: el original
> ocupa 0 px estando en flujo, el clon está fuera de flujo. Así que **el +289.91
> no desplaza ni un píxel de nada** y no es un defecto.
>
> **Lo que sí hay en la home es el +21.03 de C-QA3**, medido contra el ancla
> válida (el `h2`, el mismo elemento en los dos lados) y **reproducido hoy al
> céntimo**: `+21.03` a 1440 y `−0.23` a 390. Sigue **ABIERTO** ahí, no aquí.
>
> **Y la consecuencia de método, que es lo que hay que llevarse:** «alto 0 o 1
> px» dice que no se ve; **no** dice que no tenga consecuencia. Un elemento de
> 1 px **en flujo** desplaza 1 px. Lo que decide si su `y` importa es
> `position`, y eso hay que **medirlo** — no deducirlo de la clase (`sr-only`),
> que es la fuente que uno supone responsable.
>
> **En la matriz de cobertura la home queda marcada `base h1 NO VÁLIDA — ancla
> alternativa: h2`**, para que su celda `O` no se lea como «base verificada».

### ~~C2~~ (texto original, anulado)

| | original | clon | Δ |
|---|---|---|---|
| `h1.y` crudo @1440 | **0** | 289.91 | **+289.91** |
| `h1.y` crudo @390 | **0** | 119 | **+119** |
| alto de cabecera @1440 | 225 | 203.59 | −21.41 |

Mismo `h1` en los dos lados («Monitoreo de la calidad del aire»). El original lo
pone en **y = 0**: el hero arranca arriba del todo y la cabecera va **encima**,
transparente. El clon lo baja debajo de la cabecera.

**Es el arquetipo más antiguo del proyecto y es la primera vez que se mide su
base en crudo** — `c-cabecera` no existía cuando se construyó, y hasta esta
tanda solo cubría 17 rutas. Ejemplifica exactamente la regla C4.

### C3 · ABIERTO — el cuerpo de A·blog varía sin patrón

Con el cascarón ya descontado (C1), Σ secciones @1440 va de **−2 941.74**
(`/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos`) a **+1 111.92**
(`/running-for-clean-air`). **No es sistemático**: hay signos en los dos
sentidos, así que no es una causa única. Son las páginas de cuerpo rico, con
imágenes perezosas y embebidos. **Pendiente de descomponer por módulo**; no se
toca nada hasta saber qué es.

### C4 · ABIERTO — 14 rutas con distinto nº de secciones: la partición no es equivalente

| familia | orig → clon | lectura |
|---|---|---|
| CASO (4) | 1 → 2 | el clon parte el cuerpo en dos donde el original trae una |
| FAQ (2) | **0** → 1 | el original **no mete el cuerpo en ninguna `.et_pb_section`**: incomparable por construcción, no es defecto |
| SECTOR (4) + MONOGRÁFICO (2) | 7→6 · 6→5 · 8→7 | el original trae **una sección más** |
| HOME | 13 → 11 | dos menos |
| PRODUCTO | 6 → 7 | una más |

**No se adjudica con estos datos**: mientras el nº difiera, el reparto
cuerpo/resto de C1 no es comparable en estas familias. `tree-cmp` sí cierra
**0 filas sin pareja** en los 6 sectores a los dos anchos, así que el −1 de
SECTOR es de agrupación, no de contenido perdido.

### C5 · Hallazgos sueltos, con su encuadre

- **`/sectores/control-de-emisiones-industriales`, fila 4 «Proyectos por todo el
  mundo»: h Δ+13 a 1440 Y a 390.** Reproduce en los dos anchos → **no es ruido**.
  Defecto de fidelidad, pequeño y localizado.
- **`/sectores/estudio-de-la-contaminacion-atmosferica`: +11.2 a 390**, en la
  base y en el `top` de la fila 1 — el mismo número por las dos vías.
- **`/sectores/…-en-edar`: −30 en la base a 390.** Cae dentro del suelo **no
  probado** de ±32.28 que C-QA6 midió para los monográficos: **SIN PROBAR**, ni
  defecto ni limpio. No se toca hasta cerrar la campaña de ruido.

  > ⚠ **REVISADO al cerrar la campaña (2026-08-03, §C-QA6 · CIERRE): sigue SIN
  > PROBAR, pero por una razón distinta y peor.** Primero, la ficha citaba mal el
  > ancho: el **±32.28 es de @1440**, y a 390 las **3 ráfagas exhibibles** dan un
  > solo estado (189.39) en 9 cargas — o sea suelo **0**, que convertiría el −30
  > en defecto de pleno derecho.
  >
  > **Pero la ráfaga A del 2026-07-30 midió `±30` en las tres rutas @390**
  > (§C-QA6 · MEDIDA, tabla de ráfagas), y **su fichero se borró a mano**. Si
  > contara, el suelo a 390 sería **30** y el −30 caería justo dentro. O sea que
  > las dos lecturas posibles son «defecto claro» y «exactamente el suelo», y
  > **la medida que las separa es la única que no existe**. El `±30` contra un
  > `−30` es demasiada coincidencia para descartarla a ojo.
  >
  > **Se queda SIN PROBAR y no se toca.** Es el coste del borrado a mano,
  > cobrado por primera vez como una **decisión que no se puede tomar** — hasta
  > hoy solo se había pagado como «un número que no se puede exhibir». Lo
  > resuelve una ráfaga más a 390 que reproduzca (o no) el ±30, no un arreglo.

### C6 · CLASE de SONDA — una 404 carga bien y se deja medir

El test en negativo de la `c-cmp` generalizada metió una ruta inventada y la
sonda **no dio error: dio números**. `base +142.5 · docH 1300→900 · ✓`.

> **`page.goto` no lanza en 404.** La página de error carga, renderiza y se
> mide. Una sonda que no mire el estado HTTP publica los deltas de una página de
> error como si fueran de la página — y son plausibles.

Arreglado **en el sitio común**, no en la sonda: `openPage` de `lib.mjs`
devuelve ya `status`, y `c-cmp` aborta la ruta si no es 200. **Comprobado
después: las 31 rutas dan 200 en los dos lados**, así que ningún número de esta
tanda sale de una 404. Queda **abierto para las demás sondas**: ninguna otra
mira el estado todavía.

### C7 · CLASE de SONDA — dos selectores que no denotan el mismo conjunto

La primera versión del árbol de `c-cmp` comparaba `.et_pb_section` (original)
contra `main > section, main > div` (clon) y dio **31 de 31 rutas con el árbol
distinto**. Cero defectos: Divi mete en `.et_pb_section` **la cabecera y el pie
del theme builder**. Contra `esqueleto.json`: sector
`{tb_header:1, tb_footer:3, propia:7}` = 11 contra los 7 del clon — y los **7
del clon eran exactos**.

> **Un pleno en una comparación es tan sospechoso como un cero** (§sondas regla
> 4, la mitad del pleno). 31 de 31 no era un hallazgo: era el selector.

## Desviaciones deliberadas del grupo A (2026-07-31)

### 1 · El bloque de relacionados se emite SOLO EN ESPAÑOL

El original sirve el rótulo («También te puede interesar» · «Related content» ·
«قد يهمك أيضًا») y **tres botones**, uno por idioma, y esconde dos por CSS.
Medido: `text#7`, `text#8`, `button#0` y `button#2` dan **w 0 · h 0 a los dos
anchos**.

**Razón:** reproducir dos módulos invisibles no mueve un píxel y sí mete texto
inglés y árabe en el HTML de una página española. El coste de la desviación es
**cero en geometría** y el beneficio es un HTML que dice lo que la página es.

### 2 · Los 7 listados con 200-para-todo servirán 404 — decidido en LH-2 D2

**Se registra aquí porque no tenía sitio y la tanda que lo construya no debe
redescubrirlo.** Del recon de listados (`listados-hubs/PAGE_TOPOLOGY.md` §5,
`medidas/lh-paginas.json`): **7 páginas del original responden HTTP 200 a
cualquier `/page/N/`** —los 6 hubs de builder y `casos-de-exito`— pero **su
`canonical` apunta a la primera**, o sea que el propio original las declara
no-rutas.

> **El clon servirá 404.** Replicarlas sería clonar **contenido duplicado
> infinito**, y contarlas por su HTTP 200 habría metido **441 rutas
> inexistentes** en el cálculo de enrutado del §4b.

Es desviación deliberada porque el clon devuelve algo distinto del original en
esas URLs, y por tanto va aquí y no en el esquema. **Aplica cuando se construyan
los listados** (LISTADO-B / LISTADO-TEMA), no antes: hoy ninguno está emitido.

### 3 · `no-html-link-for-pages` desactivada, con la razón medida

Ver `eslint.config.mjs`. Con el `[slug]` de raíz emitido, **cualquier href
literal de un segmento casa con `/[slug]`** y la regla empezó a disparar sobre
enlaces servidos y verificados desde hace meses. Se comprobó moviendo las dos
rutas nuevas fuera de `src/app`: el error desaparece — lo produce el enrutado,
no el enlace. La guarda que sí importa aquí es **`qa:enlaces`**, que compara
contra las rutas que emite el build y en las dos direcciones.

---

## D4 · EL PIE — arreglado en tres partes (2026-08-01)

Cuarta de las cuatro causas de C1, y la única que **diferenciaba familias**: el
clon servía **681.09 siempre**, el alto del pie de SOFTWARE, que es la familia
con la que se calibró. Diagnóstico y modelo en `3a737c8`; el arreglo, aquí.

### Lo que se hizo, y en qué orden

1. **Congelar antes de tocar** (`32cceb0`) — `d4-pie-{1440,390}-antes.json` y
   `c-cmp-{1440,390}-d4-antes.json`. Al tocar el pie se mueven las 31 rutas a la
   vez y `clon-base` no puede decir si el cambio es correcto.
2. **Ancho, `padding` y tipografía desde el TIPO DE PÁGINA** (`2da4491`).
3. **La 4ª sección del CASO** (`61c0286`) — Δ **0.00** a los dos anchos.

### El resultado, adjudicado contra el original

| forma | @1440 antes | @1440 ahora | @390 antes | @390 ahora |
|---|---|---|---|---|
| ancha (A×3 · sector · monográfico · faq) | +87.34 | **−3** | +292.52 | **+23.89** |
| CASO | −255.72 | **−3** | +27.46 | **+23.9** |
| catálogo · producto | −367.16 | **+3** | −310.70 | **+28.89** |
| **software** | **0** | **0** ✅ | +0.78 | +0.78 ✅ |
| home (sin tocar) | −1.58 | −1.58 | +0.42 | +0.42 |

**SOFTWARE no se movió un píxel**: el cambio no es una recalibración global.

`footer-background` cierra a **0 exacto en las tres presentaciones y los dos
anchos** — el eje del `padding` está cerrado.

### ⚠ Tres cosas que la tanda descubrió y hay que no reinvestigar

**1 · El modelo tenía DOS ejes y son TRES.** Ver `ESQUEMA-CMS.md` §6b.1. El
tercero es tipografía (`li` 14/26/mb0 · 14/30.6/mb7 · **18**/30.6/mb9; legal 12 ·
12 · **18**). Con solo los dos primeros, catálogo/producto se quedaban a
**−79.19**, y el arreglo se habría dado por bueno porque «el modelo dice dos
ejes». Lo tapaba el nivel: los dos ejes reproducen el total de
`footer-background`, que **no tiene texto**.

**2 · Una medida del repo era falsa.** La cabecera de `Footer.tsx` atribuía
`li 14px/30.6 mb 7` a **/monitor-calidad-aire** medido a 1280 (P1, 2026-07-27).
/monitor da hoy **18px/30.6 mb 9** a ese mismo ancho; esos valores son los de
SOFTWARE. Corregida en el componente. No se ha investigado si el original cambió
o si P1 midió otra cosa — lo que se cablea es lo medido hoy, reproducido a
**tres anchos** (1280, 1440, 390) y congelado.

**3 · La sonda `d4` era ciega del lado del clon** en el eje que se iba a tocar
(`filaW` salía de `.et_pb_row`, que el clon no tiene → `null` en las 7). Un
`null` leído como dato, otra vez. Corregido: un selector por lado y la salida
dice **cuál** (`via`).

### ABIERTO · el residuo, con su composición — NO es «limpio»

| @1440 | links | legal | fondo |
|---|---|---|---|
| ancha | −4 | +1 | 0 |
| software | −1 | +1 | 0 |
| estrechaPad | +1 | +2 | 0 |

| @390 | links | legal | fondo |
|---|---|---|---|
| ancha | −7.7 | **+31.59** | 0 |
| software | −0.82 | +1.59 | 0 |
| estrechaPad | **+26.29** | +2.6 | 0 |

- **El +1 de `footer-legal` es ANTERIOR a esta tanda**: software ya lo tenía y se
  anulaba contra el −1 de `footer-links` — Δ0 por compensación, no por acierto.
  Es la firma que `CLAUDE.md` describe, y estaba dentro del único Δ0 del pie.
- **El +31.59 de `ancha` a 390 tiene dueño medido: el bloque de iconos
  sociales**, que vale **31.59 en ancha** y **61.59 en estrecha** (columna 2 de
  `footer-legal`). El clon sirve el de estrecha en las dos. **Cuarto eje de
  presentación, medido y NO cableado.**
- **El +26.29 de `estrechaPad` a 390** no está atribuido: sin descomponer.

### ABIERTO · `/` sigue con su pie propio, a propósito

Medido: el pie del original en la home es **idéntico al de grupo A** (593.75 /
1761.17, fila 86 %, 3 secciones). El clon lo construye aparte —`w-[85%]`, **1
solo bloque de nivel 1** en vez de 3, espaciador de 40— y aun así totaliza
**−1.58 / +0.42**: partición distinta con total casi igual, o sea una
compensación, no un acierto.

**No se cambia en esta tanda** porque la home tiene **C-QA3 abierto (+289.91)** y
con los dos cambios a la vez no se adjudica ninguno de los dos. Va con C-QA3.

---

## CLASE · LA FAMILIA DE CALIBRACIÓN (2026-08-01)

> **Cuando un componente compartido se construye midiendo UNA página, hereda los
> valores de la familia de esa página. Después acierta en ella y falla en todas
> las demás — y el acierto se lee como verificación.**

No es un defecto: es un **generador de defectos**, y el clon lleva al menos tres.
Se reconoce por una firma muy concreta: **una familia da Δ≈0 exacto y las otras
dan residuos con signos distintos**. Ese 0 no es un acierto, es el punto donde se
tomó la medida.

### Las instancias medidas

| # | qué | familia de calibración | coste |
|---|---|---|---|
| 1 | **alto del pie**: 681.09 fijo | SOFTWARE | +87.34 a −367.16 en 10 de 11 formas |
| 2 | **tipografía del pie** (`li 14/30.6 mb 7`), documentada como medida en **/monitor** | SOFTWARE | −79.19 en catálogo y producto |
| 3 | **bloque «¡Suscríbete!»** (`mt 16 · mb 46 · pb 3.1`) | SOFTWARE | −6.9 ancha · **−0.01 software** · +25.1 catálogo (@390) |

La 2 es la más instructiva: **el comentario decía /monitor y los valores eran de
software**, así que ni siquiera la atribución escrita servía para detectarlo.

> ⚠ **ACTUALIZADO 2026-08-02 (2).** La DEFINICIÓN de esta clase era demasiado
> estrecha y está corregida al final del documento (§CLASE · la definición,
> corregida): no es «los valores de SOFTWARE» sino **los del PRIMER CONTEXTO
> medido**, que puede ser una familia, un ARQUETIPO o hasta un ANCHO. Son **7**
> instancias, todas cerradas, y **el barrido pendiente cambia de criterio**.
>
> ⚠ **ACTUALIZADO 2026-08-02.** La 3 está **cerrada**, y el inventario tiene ya
> **cinco** instancias — la 5.ª rompe el patrón por dos sitios y cambia lo que
> es la clase. Tabla al día en §CLASE · 5.ª y 6.ª instancia, al final de este
> documento.

### Barrido de candidatos — LISTADO, NO ARREGLADO

Componentes compartidos (importados por ≥2 páginas) que cablean constantes de la
familia software. **Ninguno está verificado como defecto**: son candidatos con
motivo, y el motivo es que el ESQUEMA §6b registra que los mismos dos anchos
(**86 % grupo A y sector · 80 % producto, catálogo y software**) gobiernan
**también la retícula del cuerpo**, no solo el pie.

| componente | importado por | constante | por qué es candidato |
|---|---|---|---|
| `Breadcrumb.tsx:79` | **8** | `rowClassName = "mx-auto w-[80%] max-w-[1380px]"` | el 80 % **por defecto**, o sea que grupo A · sector · caso · faq lo reciben aunque su retícula sea 86 % |
| `UltimosArticulos.tsx:72` | **6** | `"mx-auto w-[80%] max-w-[1380px] …"` | idem, sin variante por tipo |

⚠ **Y el que NO aparece en el grep importa igual**: `SectionRow` lo importan
**15** ficheros y `HeaderNav` **10**. No cablean `w-[80%]`, pero **no se ha
comprobado** que sus valores no vengan de una sola familia. Un grep por
constantes conocidas encuentra lo que ya sabes buscar; **es un cribado, no un
censo**.

### Cómo se cierra de verdad (pendiente)

Midiendo el ancho de fila del **cuerpo** en las 31 rutas contra el original. Hoy
ese eje está a **0/31** en `COBERTURA-MEDICION.md` — nunca se ha comparado—, así
que la clase **no se puede cerrar con lo que hay medido**: haría falta la sonda
de anchos de cuerpo, que no existe.

---

## D4 · CERRADO el «¡Suscríbete!», y con él `footer-links` (2026-08-02)

Cuarta y última instancia del residuo del pie. Sonda nueva: **`qa:d4-sus`**,
congelada en `medidas/d4-suscribete-{390,1440}-{antes,despues}.json`.

### Por qué dos intentos anteriores midieron el nodo equivocado

No fue un descuido: **`.et_pb_column` identifica la columna en el original y no
existe en el clon**, así que cualquier `closest()` subía hasta la rejilla entera
(28 enlaces). Es la regla de `CLAUDE.md` §sondas — *para identificar un
componente, el literal de `className` no discrimina*. La identidad ahora es
semántica y la misma en los dos lados: **el ancla por TEXTO**, la columna por
`.et_pb_column` / `data-kunak="footer-col"`, y todo lo demás **derivado** de esos
dos.

Y dos supuestos que el HTML servido desmintió, **los dos habrían dado «0 anclas»
—un AUSENTE que se lee como «no hay bloque» cuando lo que no hay es la
suposición**:

1. **En el original el botón no es un `<a>`**: es
   `<span class="et_pb_button … kunak-obfuscated-link" role="link" tabindex="0"
   data-url="<base64>">`. El destino va ofuscado y lo resuelve JS.
2. **Hay uno por IDIOMA en el DOM** (`ocultar-en` · `ocultar-es` · `ocultar-fr`…),
   todos servidos y todos menos uno ocultos por CSS. «Cuántos casan» y «cuántos
   se ven» son preguntas distintas; se cuentan las dos y se mide el visible.

### El NIVEL, otra vez, y en los dos sentidos

| | qué pasaba | consecuencia si se ignora |
|---|---|---|
| **hacia arriba** | la columna del clon es un **ítem de rejilla** y va `stretch`: a 1440 su caja es la de la columna más alta del pie | Δ **+51** y **+83** que no son defecto, sino sobrante de estirado |
| **hacia abajo** | en el original el `mb` del envoltorio del botón **se escapa** de la columna (contenido 329.59, caja 313.59); en el clon —contexto de formato propio— **se contiene** | cablear contra el contenido mete **16 px de más** en las tres presentaciones |

Lo que suma en la fila es **la caja**, en los dos lados. Comprobado con la Σ de
las cinco columnas a 390: orig **1325.41** contra clon **1318.71**, y la fila
**−7.7** — los tres números encajan.

Por eso la sonda devuelve `altoContenido` **y** `col.h`, y avisa del sobrante.

### El resultado, adjudicado contra el original

`footer-links`, alto de fila:

| presentación | @1440 antes | @1440 ahora | @390 antes | @390 ahora |
|---|---|---|---|---|
| ancha | −4 | **−1** | −7.7 | **−0.79** |
| software | −1 | −1 | −0.82 | −0.82 |
| estrechaPad | +1 | +1 | **+26.29** | **+1.2** |

Y la columna EMPRESA queda a **0.00 contra la caja del original** en las tres
presentaciones y los dos anchos.

⚠ **A 1440 la fila NO se mueve en software ni en estrechaPad, y eso es
correcto**: ahí EMPRESA no es la columna más alta, así que su error estaba
**tapado por la holgura** de la que sí lo es. Por eso se adjudica **por columna
además de por fila** — con solo la fila delante, dos de los tres arreglos
parecerían no haber hecho nada.

### ABIERTO · el residuo que queda, y no es «limpio»

**~1 px en las tres presentaciones**, constante: la fila del clon tiene ~1 menos
de sobrante propio y la columna CERTIFICACIONES **+0.2** (184.25 contra 184.05).
Sin descomponer. No se toca.

---

## D1 y D2 · NO EXISTEN — son PARTICIÓN (2026-08-02)

Sonda: **`qa:d123`**, congelada en `medidas/d123-flujo-{390,1440}-*.json`.

`c1-localiza` medía huecos entre secciones **sin mirar qué hay dentro del
hueco**, y un hueco de 50 px puede ser dos cosas que dan **el mismo número**:
aire que sobra (defecto) o **un nodo que el censo no cuenta como sección**
(partición, y el total no se mueve). La única forma de distinguirlas es bajar un
nivel: enumerar los hijos **en flujo** del contenedor, casen o no con el selector.

| | original | clon | veredicto |
|---|---|---|---|
| **D1** −225 | cabecera **en flujo**, 225 | `section.banda-cabecera`, **225** | 225 = 225 |
| **D2** +50 | `et_pb_section_0`, 50 | **`<nav>`** de migas, **50** | 50 = 50 |

El clon mete la banda de cabecera y las migas **dentro de `main`**; el original
tiene la cabecera fuera del contenedor y las migas como sección. Mismos píxeles,
otra caja. `main > section` no cuenta un `<nav>` → los +50; y
`antesDePrimeraSeccion` vale 0 cuando la primera sección empieza en y=0 → los
−225.

Comprobado a los dos anchos y en las 11 formas: la banda del clon **iguala al
céntimo** el alto de la cabecera del original (1440: 225 · 397.59/397.61; 390:
165.58 · 136.58 · 347.25 · 419.25 · 362.91).

> **Se fichan como desviación deliberada y NO se tocan.** La condición que
> `PENDIENTES` le había puesto a D1 —«solo si se demuestra que mueve `docH`»— no
> se cumple; y **nadie se la había puesto a D2**, que resultó ser lo mismo.

---

## D3 · CERRADO — es el `margin-bottom` del `<article>` del CPT (2026-08-02)

Los 42 px viven **fuera** del contenedor, que declara `mb: 0` — desde dentro no
se ven. Subiendo la cadena de antepasados aparece el dueño:

```
<article id="post-27049" class="post-27049 solutions type-solutions">
    margin-bottom: 42px
```

**Medido sobre 11 formas, no sobre las 3 de C1**, porque el alcance de esto es
«qué tipos de página lo llevan» y con tres familias eso se supone, no se sabe —
el error que D4 ya había cometido con 7 de 11:

| formas | `<article>` | `mb` |
|---|---|---|
| catálogo · software · producto | `type-solutions` | **42** |
| sector · monográfico · home | `type-page` | 0 |
| A·blog · A·término · A·documento | no hay `<article>` en la cadena | 0 |

La frontera es el **CPT de WordPress**, y es **la misma** que ya separa `ancha`
de las dos estrechas en el pie. Por eso el arreglo entra en esa tabla —un sitio,
la misma clave— y no en cuatro `page.tsx` copiados a mano.

⚠ **Dónde se cablea no es dónde vive.** En el original el margen es del
`<article>`; el clon no tiene ese envoltorio y lo expresa como espacio **antes
del pie** (`antesDelPie`). La geometría coincide —`body` es contenedor flex, el
margen no colapsa—; la atribución no. Si el clon estrena `<article>`, esto se
mueve allí.

**Adjudicado contra el original**, `docH` antes → ahora: catálogo **−69 → −27** ·
software **−84 → −42** · producto **−785 → −743**. Exactamente **+42** en las
tres y **cero movimiento en las otras ocho formas**. Confirmado a 390: el
original trae 42 y el clon ahora también.

### ⚠ Dos números de esta sonda que NO son D3

**CASO (7415.09 a 390) y FAQ (468.19)** no tienen cuerpo de Divi, así que su
contenedor se elige por una **cadena de respaldo distinta a la del clon** — la
sonda lo dice en `via`. Son dos niveles distintos comparados, no un hueco. **No
se leen como defecto**; para adjudicar esas dos formas hace falta igualar el
contenedor primero.

---

## ABIERTO · la cabecera del MONOGRÁFICO, −36.02 y solo a 1440 (2026-08-02)

Salió de paso en `qa:d123` y **no se ha perseguido**. La banda de cabecera:

| | @1440 orig | @1440 clon | @390 orig | @390 clon |
|---|---|---|---|---|
| SECTOR | 397.61 | 397.59 | 347.25 | 347.25 |
| **MONOGRÁFICO** | **433.61** | **397.59** | 419.25 | 419.25 |

A 1440 el clon sirve al monográfico **el valor del sector**; a 390 sirve el suyo
y cuadra. Es **la regla espejo** —Δ≠0 en un ancho y 0 en el otro no es «casi
cuadra», es una medida tapada— con la firma de la **FAMILIA DE CALIBRACIÓN**: un
valor heredado de la familia con la que se midió. Se ficha; no se toca en esta
tanda, que ya movía el pie de las 31 rutas.

---

## ⚠ C1 · SALDADO — 2 causas reales arregladas, 2 particiones fichadas (2026-08-02)

`c1-localiza` abrió el desfase del cascarón en cuatro sumandos que reconstruían
el total al céntimo. **Reconstruir no es explicar**: dos de los cuatro eran la
misma altura contada de otra forma.

| | era | veredicto |
|---|---|---|
| **D1** −225 | la cabecera del clon va dentro de `main` como `section.banda-cabecera` | **PARTICIÓN DELIBERADA** |
| **D2** +50 | las migas del clon son un `<nav>`, no una `<section>` | **PARTICIÓN DELIBERADA** |
| **D3** −42 | `margin-bottom` del `<article>` del CPT `solutions` | arreglado |
| **D4** | el pie, con 5 ejes de presentación por tipo de página | arreglado |

### D1 y D2 · PARTICIÓN DELIBERADA — con su prueba, para que nadie las «arregle»

> **No se tocan. Y la prueba de por qué no se tocan es ésta, no un argumento.**

`qa:d123` enumera los hijos **en flujo** del contenedor de cuerpo —casen o no
con el selector de sección— en **11 formas × 2 anchos**. La banda del clon
iguala **al céntimo** la cabecera del original:

| ancho | valores medidos (orig = clon) |
|---|---|
| 1440 | **225** (grupo A · catálogo · software · producto · FAQ · home) · **397.59 / 397.61** (sector) |
| 390 | **165.58** · **136.58** · **347.25** · **419.25** · **362.91** |

Y las migas: **50 = 50** en los dos lados.

**De dónde salían los números, que es lo que hay que entender para no repetirlo:**

- los **+50** de D2 salen de que `main > section` **no cuenta un `<nav>`**, así
  que las migas del clon caen en el hueco entre secciones en vez de en una;
- los **−225** de D1 salen de que `antesDePrimeraSeccion` vale **0** cuando la
  primera sección empieza en `y=0`, que es lo que pasa cuando la cabecera va
  **dentro** del contenedor.

Ninguna de las dos mueve `docH`. La condición que este documento le había puesto
a D1 —«solo si se demuestra que mueve `docH`»— **no se cumple**; y a D2 **nadie
se la había puesto**, que es cómo estuvo un mes en la lista de defectos.

### ⚠⚠ Y el matiz del INSTRUMENTO, que es lo que hay que leer antes de `c-cmp`

> **La métrica RESTO —`docH` − Σsecciones— cuenta todo lo que vive FUERA de
> sección: migas, bandas de cabecera, envoltorios. Así que una diferencia de
> RESTO puede ser PARTICIÓN y no defecto, y no hay forma de distinguirlo desde
> el propio número.**

Es la regla del NIVEL aplicada a la métrica en vez de al elemento: RESTO es un
**contenedor con holgura** —cabe dentro un nodo entero sin dejar rastro— y
además su frontera **depende del selector de sección de cada lado**, que en el
original es `.et_pb_section` y en el clon `main > section`. Dos selectores que
**no denotan el mismo conjunto** (la clase C7 de este documento).

**Consecuencia operativa, y vale para `c-cmp` y para
`COBERTURA-MEDICION.md` igual:**

> **Un Δ de RESTO se adjudica POR COMPOSICIÓN antes de tocar nada.** Se enumeran
> los hijos en flujo de los dos lados y se emparejan por lo que son —cabecera con
> banda, migas con migas—, no por si casan con el selector. Si cada pieza cuadra
> y el RESTO no, el defecto está en la partición, no en la página.
>
> Lo mismo vale para **`nº de secciones ≠`**, que `c-cmp` ya imprime como
> **PREGUNTA y no como defecto**: las 14 rutas que a 1440 traen un número
> distinto lo traen por esto.

Coste de no haberlo escrito antes: **D1 y D2 vivieron una tanda entera como
«causas de C1 pendientes de arreglar»**, con un orden de ataque asignado y una
condición de bloqueo, cuando no eran defectos.

---

## CLASE · el inventario al día — 5 instancias, y la 5.ª cambia la clase (2026-08-02)

Actualiza el inventario del §CLASE. La 3 pasa a **cerrada** y entran dos más:

| # | qué | familia de calibración | coste | estado |
|---|---|---|---|---|
| 1 | alto del pie: 681.09 fijo | SOFTWARE | +87.34 a −367.16 en 10 de 11 formas | cerrada |
| 2 | tipografía del pie | SOFTWARE | −79.19 en catálogo y producto | cerrada |
| 3 | bloque «¡Suscríbete!» | SOFTWARE | −6.9 · −0.01 · +25.1 (@390) | **cerrada 2026-08-02** |
| 4 | bloque de iconos sociales | ESTRECHA | +31.59 en `ancha` a 390 | cerrada |
| **5** | **ancho de módulo del `h1` de la cabecera de `/sectores/*`** | **SECTOR** | **−36.02 en las 2 rutas del monográfico, solo ≥981px** | **cerrada 2026-08-02** |

### Por qué la 5 no es una más: rompe el patrón por dos sitios

**(a) Su familia de calibración NO es software.** Las cuatro primeras heredaban
valores de SOFTWARE, hasta el punto de que «todo se calibró con software» parecía
ser la clase. No lo es: la clase es **«un componente compartido hereda la familia
sobre la que se midió»**, y aquí ese componente es `CabeceraSector`, medido sobre
**SECTOR** y reutilizado por **MONOGRÁFICO** — dos arquetipos que comparten ruta
y comparten cabecera.

**(b) El defecto es INVISIBLE en las 4 instancias de su propio arquetipo, a los
cinco anchos medidos.** No lo tapaba un ancho: lo tapaba el **contenido**. Los
cuatro sectores tienen titulares cortos que caben en un renglón con 619 px y con
1238, así que el ancho de módulo equivocado **no deja rastro en ningún ancho**.
Solo aparece con un titular largo, o sea en el otro arquetipo.

> **De donde la lección que faltaba: el detector de una familia de calibración no
> siempre es otra FAMILIA — puede ser otro CONTENIDO.** Barrer «las N instancias
> del arquetipo» no habría encontrado ésta ni midiendo las cuatro a cinco anchos.
> Lo que la encontró fue medir **el arquetipo vecino que comparte el componente**.

Es el mecanismo del **NO-WRAP** de `CLAUDE.md` §El NIVEL en su forma más pura: un
ancho equivocado en un texto que no envuelve **no cuesta un solo píxel** hasta que
el texto envuelve.

---

## La cabecera de `/sectores/*` · CERRADA — era ANCHO DE MÓDULO (2026-08-02)

Sonda nueva: **`qa:cabecera`**, los dos lados, congelada en
`medidas/cabecera-cmp-{390,800,1000,1280,1440}-*.json`.

`mono-cabecera.mjs` compara **original contra original** —nació para decidir si
el monográfico estrenaba arquetipo— y por eso no podía adjudicar nada del clon.

### Lo medido

El síntoma era **−36.02 a 1440 y 0 a 390**: la regla espejo. Y `36` es exacta­
mente el `line-height` del `h1`, o sea **un renglón** — señal de envolvimiento,
no de ritmo. La causa está en el **ancho**, y por eso se mide al ancho donde el
texto SÍ envuelve:

| ancho | `h1` / fila en el ORIGINAL | | renglones del monográfico |
|---|---|---|---|
| 390 | 335.39 / 335.39 | **100 %** | 4 |
| 800 | 688 / 688 | **100 %** | 2 |
| 1000 | 430 / 860 | **50 %** | 3 |
| 1280 | 550.39 / 1100.8 | **50 %** | 2 |
| 1440 | 619.19 / 1238.39 | **50 %** | 2 |

**El clon daba 100 % en los cinco.**

Tres cosas que los cinco anchos deciden y dos no podrían:

1. **Es porcentaje, no px.** 550.39 a 1280 contra 619.19 a 1440. Con solo 1440 y
   390 las dos hipótesis —«50 % de la fila» y «un ancho fijo que a 390 no cabe»—
   predicen lo mismo.
2. **El corte está entre 800 y 1000**, o sea el de Divi (980), que el repo ya
   escribe como `min-[981px]:`.
3. **Los cinco anchos dan el mismo valor en las 4 instancias vivas** → es
   plantilla, no campo por instancia.

### Adjudicado contra el original

| ruta | @1440 antes | @1440 ahora | @390 antes | @390 ahora |
|---|---|---|---|---|
| MONOGRÁFICO · edar | **−36.02** | **−0.02** | 0 | 0 |
| MONOGRÁFICO · petróleo | **−36.02** | **−0.02** | 0 | 0 |
| SECTOR · urbano | −0.02 | −0.02 | 0 | 0 |
| SECTOR · investigación | −0.02 | −0.02 | +11.2 | +11.2 |

**En la propiedad medida —la sección de cabecera— se movieron las 2 rutas del
monográfico y ninguna más**, que era la condición.

#### ⚠ Y a nivel de `docH` se movieron CINCO, que no es lo mismo y hay que decirlo

Comparando `c-cmp-1440-tras-d3` con `c-cmp-1440-tras-cabecera` (31 rutas, las dos
corridas limpias): **26 quietas** y **5 movidas**.

| ruta | movió | qué es |
|---|---|---|
| MONOGRÁFICO · petróleo | **+36** | el arreglo, exacto |
| MONOGRÁFICO · edar | **+9** | el arreglo **−27** de ruido (+36 − 27) |
| SECTOR · urbano | +27 | ruido: su cabecera mide **−0.02 antes y después** |
| SECTOR · industria | −27 | ruido: ídem |
| CASO · world athletics | +76 | **fuera del alcance del cambio** |

**El alcance no se afirma, se deriva:** `grep -rn CabeceraSector src/` da **un
solo importador**, `src/app/sectores/[slug]/page.tsx`. El caso **no puede** haber
sido tocado por esto — su +76 es de otra causa, y las dos de ±27 caen en la
familia de ruido documentada, con la cabecera medida sin moverse.

> **La lección de redacción, que es la de `CLAUDE.md` §canal único de verdad:**
> «se movieron 2 y ninguna más» es **verdad de la sección de cabecera y falsa de
> `docH`**. Un alcance se cita **con el nivel al que se midió**, igual que un
> número de un par se cita con sus dos lados.

⚠ **El +11.2 de investigación a 390 es ANTERIOR y ajeno**: está congelado como
`base +11.2` en `medidas/c-cmp-390-tras-d3.json`, medido antes de tocar nada.
No se toca en esta tanda.

### ⚠ Y un hallazgo de paso, NO perseguido: el alto de la cabecera a 1280

A 1280 el original da **338.25** (sector) y **374.25** (monográfico); el clon da
**397.59** en los dos → **+59.34 / +23.34**. Es decir: **el alto de la cabecera
del original varía entre 1280 y 1440 y el del clon no.** No es lo mismo que se ha
arreglado aquí —el ancho de módulo ya cuadra a 1280— y **1280 no es uno de los
dos anchos de medición del proyecto**, así que se ficha y no se persigue. Lo que
sí deja escrito es que **el ritmo vertical de esta cabecera no está verificado
fuera de 1440 y 390**.

---

## Desviación deliberada · el botón «¡Suscríbete!» del pie (2026-08-02)

**El original sirve un `<span>`, el clon sirve un `<a>`.** Registrado aquí porque
el clon devuelve markup distinto del original, igual que las del grupo A.

| | original | clon |
|---|---|---|
| etiqueta | `<span class="et_pb_button … kunak-obfuscated-link" role="link" tabindex="0" data-url="<base64>">` | `<a href="…">` |
| destino | **ofuscado en base64**, lo resuelve JS al hacer clic | literal en el `href` |
| idiomas | **uno por idioma en el DOM** (`ocultar-en` · `ocultar-es` · `ocultar-fr`…), todos servidos, todos menos uno ocultos por CSS | solo el del idioma servido |

**Por qué se mantiene la desviación:** el clon no reproduce la ofuscación
antispam —es una decisión de la instalación de WordPress, no de la maquetación— y
emitir los cuatro idiomas ocultos para tapar tres de ellos con CSS sería copiar
un coste sin la razón que lo justifica.

**Lo que sí obliga:** cualquier sonda que busque este botón tiene que aceptar
**`a` y `[role=link]`**, y contar **candidatos y visibles por separado** — buscar
`<a>` da **cero** en el original, y un cero se lee como «no hay bloque» cuando lo
que no hay es la suposición. Implementado en `qa:d4-sus`.

Emparejada con **C-SP13** (la barra lateral de la FAQ) en el sentido de que las
dos son diferencias de **salida servida**, no de medida.

---

## Campaña de ruido · episodio del 2026-08-02 (registro, ráfaga 2 pendiente)

Al protocolo de `CLAUDE.md` §Notas de método —«el suelo es el máximo ENTRE
ráfagas separadas en el tiempo, ≥3 ráfagas, ≥2 horas, ≥2 días»—:

| fecha | ruta | ancho | episodio |
|---|---|---|---|
| **2026-08-02**, corrida de adjudicación de las 31 rutas | `/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento` | 390 | **timeout de navegación de 120 s en el ORIGINAL** |

**Reintentada suelta minutos después, la misma ruta mide bien** (`base 0 · docH
−86`), o sea que fue un **episodio de latencia**, no un fallo del clon ni de la
sonda. Congelado en `medidas/c-cmp-390-faq-reintento.json`.

**Qué añade al registro:** el ruido del original **no es solo desplazamiento de
píxeles** —la familia 27/54/81 del módulo barajado, y los ±32.28 de base en 3
rutas—: también se manifiesta como **la página no llega a cargar en 120 s**. Una
sonda que trate eso como «sin diferencia» publica un cero falso; `c-cmp` lo
cuenta como ruta no medida y cierra su código de salida con ello, que es lo
correcto.

> ⚠ **La ráfaga 2 de la campaña SIGUE PENDIENTE, y este episodio no la
> sustituye.** Una observación suelta durante otra medición no es una ráfaga: no
> tiene las 3 cargas seguidas ni el alcance declarado. El suelo de estas rutas
> **sigue sin fijar**, y hasta que se fije, **todo residuo pequeño en ellas está
> SIN PROBAR** — ni defecto ni limpio.

---

## CLASE · LA FAMILIA DE CALIBRACIÓN — la definición, corregida (2026-08-02)

> ⚠ **La definición que este documento traía era demasiado estrecha, y se notó
> al llegar la quinta instancia.** Decía «hereda los valores de la familia de esa
> página», y las cuatro primeras heredaban de SOFTWARE — tanto que «todo se
> calibró con software» parecía ser el hallazgo. **No lo es.**

**La clase, enunciada bien:**

> **Un componente compartido cablea los valores del PRIMER CONTEXTO en que se
> midió. Después acierta en ese contexto y falla en todos los demás — y el
> acierto se lee como verificación.**

«Contexto» es lo que cambia entre consumidores, y **puede ser de dos tipos**:

| tipo de contexto | instancias | ejemplo |
|---|---|---|
| **familia de páginas** | 1 · 2 · 3 · 4 | el pie, calibrado con SOFTWARE |
| **ARQUETIPO** | **5** | `CabeceraSector`, calibrado con SECTOR y reutilizado por MONOGRÁFICO |

### El inventario

| # | qué | primer contexto medido | coste | estado |
|---|---|---|---|---|
| 1 | alto del pie: 681.09 fijo | SOFTWARE | +87.34 a −367.16 en 10 de 11 formas | cerrada |
| 2 | tipografía del pie | SOFTWARE | −79.19 en catálogo y producto | cerrada |
| 3 | bloque «¡Suscríbete!» | SOFTWARE | −6.9 · −0.01 · +25.1 (@390) | cerrada |
| 4 | bloque de iconos sociales | ESTRECHA | +31.59 en `ancha` a 390 | cerrada |
| 5 | **ancho de módulo del `h1` de la cabecera** | **SECTOR** (arquetipo) | **−36.02 en las 2 del monográfico** | cerrada |
| 6 | **bordes de la fila del pie** | ancha/estrecha | **−1 en dos, +1 en la otra** | cerrada |
| 7 | **`py` de fila, `mb` de módulo y del kicker en px** | **1440** (¡un ANCHO!) | **+59.34 a 1280**, Δ0 a 1440 y 390 | cerrada |

**La 7 estira la definición una vez más y conviene verla:** el «primer contexto»
no fue una familia ni un arquetipo, sino **el primer ANCHO medido**. Se cablearon
28.7969 · 21.6562 · 29.77 px donde Divi escribe **2 % · 1.7488 % · 2.4039 %**.
Δ0 a 1440 y a 390 —los dos anchos del contrato de fidelidad— y **congelado en todo
lo de en medio**. Es la misma clase con el eje cambiado, y es exactamente lo que
el §8.1 del ESQUEMA avisa que puede pasar al migrar: **un campo con el valor de
1440 dentro pasa el listón y rompe el rango.**

### ⚠ El barrido pendiente CAMBIA DE CRITERIO

El barrido anterior buscaba *«componentes compartidos que cablean constantes de
la familia software»*. Con la definición corregida, eso busca una instancia, no
la clase. El criterio correcto:

> **Componentes compartidos con valores fijos que UN SOLO contexto consumidor ha
> ejercitado.** Da igual cuál sea el contexto —familia, arquetipo o ancho—: lo
> que hace peligroso a un valor es que **nadie lo haya puesto a prueba desde
> fuera del sitio donde se midió.**

Y de ahí las tres preguntas del barrido, en este orden:

1. **¿Cuántos contextos DISTINTOS consumen este componente?** Se deriva
   (`grep -rn "components/X" src/`), no se afirma — la cabecera de
   `Breadcrumb.tsx` ya mintió una vez sobre esto.
2. **¿Alguno de ellos ejercita el valor de forma distinta?** Un titular largo
   ejercita un ancho; uno corto no. **Si todos los consumidores lo ejercitan
   igual, el valor está SIN PROBAR**, aunque haya ocho consumidores.
3. **¿El valor está en px donde el original usa %?** Entonces está calibrado con
   un ancho, y los dos anchos del contrato no lo pueden ver.

### La nota de método: el detector no fue otro ancho, fue otro CONTENIDO

La 5 se descubrió así, y es lo más reutilizable de la tanda:

> **La reutilización de un componente por un SEGUNDO ARQUETIPO es un test del
> primero.** Y a veces es el único que existe: el `h1` a 100 % en vez de 50 %
> daba **Δ0 en las 4 instancias del arquetipo SECTOR a los cinco anchos
> medidos**, porque sus titulares caben en un renglón con 619 px y con 1238. No
> lo tapaba un ancho — lo tapaba el contenido.

Corolario operativo: **cuando un arquetipo nuevo estrena un componente
compartido, medir el arquetipo VIEJO no es redundante: es la única cobertura que
el componente ha tenido nunca.**

---

## La sonda, dueña de su ciclo de servidor (2026-08-02)

Deuda mecánica anotada en el HANDOFF desde hacía semanas. **Mordió dos veces**, la
segunda el 2026-08-02: `npm run check` construye, y lanzarlo con una sonda en
vuelo le cambió el `.next` al servidor vivo → **404 en 4 rutas que existen**, y la
corrida de 31 rutas se descartó entera.

Se resuelve en **dos mitades**, porque una sola no bastaba:

### 1 · `iniciarClon()` — aislamiento donde se puede

Arranca **su propio** servidor en un puerto libre pedido al sistema, espera a que
responda, y lo mata al terminar el proceso —salida normal, `SIGINT` o excepción
sin capturar—. Dos sondas pueden correr a la vez sin pisarse, y nadie puede
pararle el servidor a una corrida en vuelo. `CLON=<url>` sigue mandando, para
apuntar a un despliegue.

⚠ **Lo que NO protege, y hay que decirlo:** el servidor propio lee el **mismo
`.next`**, así que un `next build` concurrente le cambia el contenido igual.

### 2 · La guarda de `BUILD_ID` — detección donde no se puede

Next escribe un identificador por build en `.next/BUILD_ID`. Se lee al arrancar la
sonda y se relee al congelar. Si cambió, **la corrida entera está contaminada** y
la salida se congela con el sufijo **`-CONTAMINADA`** y un error a voz en grito.

> **Lo grave nunca fue el 404: era que no se sabía dónde había caído el corte.**
> Las rutas medidas antes del cambiazo eran buenas y las de después no, y el
> fichero no las distinguía. Ahora el fichero lo dice en el nombre.

**Vive en `w()` a propósito**, que es el sitio por el que escriben las 19 sondas:
las cubre **todas sin tocar ninguna**. Es la decisión de la regla 5 —arreglar la
CLASE y no la instancia— aplicada por tercera vez en `lib.mjs`, junto a la guarda
de sobrescritura y a `Censo`.

### Estado de la migración — parcial y declarado

| sonda | ciclo de servidor |
|---|---|
| `cabecera-cmp` | **propio** (migrada y verificada: arranca en puerto libre, mide, cierra) |
| las otras 18 | siguen esperando un `next start` ajeno en el 3000 |

**Las 19 están cubiertas por la guarda de `BUILD_ID`**, que es la que ataja el
fallo que se cobró las dos corridas. La migración del resto es mecánica —una
línea de `import`, una de arranque y una de parada— y queda pendiente.

**Test en negativo: `npm run qa:lib`, 31/31.** Cubre las tres cosas: que con
`CLON` puesta la sonda **no** gestione servidor, que medir contra un **puerto
vacío falle** en vez de devolver vacío, y que un clon que no llega a levantar
**tire** diciendo el puerto en vez de seguir midiendo.

---

## C-QA6 · RÁFAGA 2 de la campaña de ruido (2026-08-02, 12:33 local)

Congelada en `medidas/campana/cqa6/rafaga-2026-08-02T12-33-41.json`. Mismas 3
rutas y mismos 2 anchos que la ráfaga 1, que es la condición para comparar.

> **Re-etiquetada el 2026-08-03.** Se archivó como
> `rafaga-2026-08-02T17-33-41.json`, con sello **UTC**; «17:33 UTC» y «12:33
> local» son **el mismo instante**. El contenido medido no se tocó — ver
> §C-QA6 · CIERRE.

### Estado de la campaña: **2 de 3 ráfagas · 2 días · ABIERTA**

| combinación | h1 (máx entre ráfagas) | posicional |
|---|---|---|
| software · edar · petróleo @1440 | **32.28** | 33 |
| software @390 | 0 | **81** |
| edar @390 | 0 | 54 |
| petróleo @390 | 0 | 27 |

> **Esto NO es un suelo todavía**: es «lo máximo observado hasta ahora». Falta
> **1 ráfaga**, y hasta cerrarla todo residuo pequeño en estas rutas sigue **SIN
> PROBAR**.

### Lo que la ráfaga 2 añade, que es lo interesante

**1 · El `h1` tiene DOS ESTADOS DISCRETOS, no temblor.** Los valores crudos son
siempre los mismos dos, y la diferencia es exactamente 32.28 en las tres rutas:

| ruta | estado bajo | estado alto |
|---|---|---|
| software @1440 | 389.11 | **421.39** |
| edar @1440 | 228.88 | **261.16** |
| petróleo @1440 | 228.88 | **261.16** |

**Ráfaga 2 cayó entera en el estado ALTO** (9/9 cargas @1440). Ráfaga 1 pilló una
transición. Y el valor alto es **idéntico en las dos ráfagas separadas por dos
días**: el estado es estable y reproducible, no ruido gaussiano.

**2 · La sincronía entre rutas NO es total, y la ráfaga 1 ya lo decía.** Mirando
sus tres cargas @1440:

| corrida | software | edar | petróleo |
|---|---|---|---|
| 1 | bajo | bajo | bajo |
| 2 | **bajo** | **alto** | **alto** |
| 3 | alto | alto | alto |

**Los dos monográficos se mueven juntos; software va por su cuenta.** O sea que
hay **al menos dos grupos**, no un interruptor global. En la ráfaga 2 no hubo
transición, así que **no confirma ni refuta** la sincronía — solo dice que en ese
episodio no hubo cambio de estado.

**3 · Latencia: NO SE PUEDE EVALUAR TODAVÍA, y no por falta de instrumento.**
La ráfaga 2 sí trae cronómetro (6.9–12.1 s, con un pico de 12.1 s en software) y
**no hubo ningún cambio de estado**, ni siquiera en la carga lenta. La ráfaga 1,
que sí tuvo transición, es **anterior al cronómetro** (`carga=undefined`). Así
que hay latencia sin transición y transición sin latencia: **cero pares
útiles**. Se resuelve solo con la ráfaga 3, si trae transición.

**4 · ⚠ `rocketToken` dio `N` en las 12 cargas de la ráfaga 2.** Eso **no
significa «el token no interviene»**: significa que el detector **no ha
discriminado nunca**. Por la regla 4 de §sondas —*un patrón que no casa en
ninguna observación es sospechoso, no un cero*— se anota como **detector sin
validar**, no como evidencia de ausencia. Antes de concluir nada con él hay que
comprobar que sabe dar `S` en alguna página.

### Cuándo toca la ráfaga 3

**A partir del 2026-08-03**, con ≥2 h de separación de la última (**12:33 local**
del 2026-08-02) y **preferiblemente en un tercer día**, que da un día más de los
dos que el protocolo exige. Cierra la campaña y fija el suelo de estas 3 rutas.

---

## HOME · la retícula del CUERPO — primera cosecha del eje horizontal (2026-08-02)

> ⚠⚠ **CORREGIDA el mismo día por §Eje horizontal · ADJUDICACIÓN (más abajo).**
> La tabla de esta ficha lista **tres** anchos y son **dos**: el `75 % → −158.39`
> era una **fila fantasma** del detector conductual, no una fila del clon. Lee
> aquélla; ésta se conserva porque es la evidencia de qué se creía antes del
> marcador.

**Sonda nueva `qa:ancho`**, congelada en `medidas/ancho-cuerpo-{1440,390}.json`.
Es la primera vez que este eje se mide: `COBERTURA-MEDICION.md` lo tenía a
**0/31 de verdad**.

**De las 31 rutas, 30 salen limpias y toda la cosecha está en `/`.** El original
usa **86 % uniforme** en todas sus filas de cuerpo; el clon sirve **tres anchos
distintos**:

| el clon sirve | Δ @1440 | Δ @390 | filas |
|---|---|---|---|
| **86.35 %** (1243.44 / 336.75) | **+5.05** | **+1.36** | 6 · 10 |
| **85 %** (1224 / 331.5) | **−14.39** | **−3.89** | 5 · 2 |
| **75 %** (1080) | **−158.39** | — | 1 (solo @1440) |

**Encuadre: FIDELIDAD, no rango.** Se reproduce en los **dos anchos del contrato**
y además con **el mismo porcentaje**, no con el mismo píxel — que es una firma más
fuerte todavía que la de la regla «reproducirse entre anchos pesa más que el
tamaño»: no es un residuo que sobrevive a dos maquetaciones, es **el mismo valor
equivocado escrito en la hoja de estilos**.

**Y es la FAMILIA DE CALIBRACIÓN otra vez**, con su firma completa: el `w-[85%]`
de la home ya estaba anotado en la cabecera de `Footer.tsx` como «la home lo
construye aparte», y nadie lo había comparado con el original porque **este eje
no se medía**.

**NO se arregla en esta tanda** (era diagnóstico puro) y **va con C-QA3**: la home
tiene +289.91 abierto y dos cambios a la vez no se adjudican.

### ⚠ La letra pequeña de la cobertura

**99 filas emparejadas de 276.** Las **177 huérfanas** son filas que la sonda **no
comparó** — preguntas, no verdes. Detalle y cómo se estrechan, en
`COBERTURA-MEDICION.md` §El hueco nº 1 se cierra.

---

## CLASE MAYOR · el hueco de la barra de navegación, cableado en 31 rutas

> **Prioridad ALTA para la tanda de CLASE.** No es una instancia: es un valor
> cableado que gobierna **las 31 rutas del clon** y que **ninguna constante puede
> arreglar**.

### Lo medido

| | @1440 | @1280 |
|---|---|---|
| barra del original (`/sectores/*`) | 41 + 144 = **185** | 41 + 95.52 = **136.52** |
| hueco cableado en el clon | **185** | **185** |
| Δ | 0 | **+48.69** |

Y el clon **ya varía por su cuenta**: su propio `<header>` mide **203.59 a 1440 y
157.89 a 1280**. Lo congelado es solo el HUECO que le reserva el cuerpo.

### Por qué no hay constante que sirva

**185/1440 = 12.85 % pero 136.52/1280 = 10.67 %.** La altura de la barra **no
varía proporcionalmente al ancho** — la mueve la maquetación del menú, que
reflota—, así que ni un px ni un % reproducen la curva. Cualquier valor que se
elija acierta en el ancho donde se midió: **es un generador de familias de
calibración**, no un número que esté mal.

### Alcance: 31 rutas, dos componentes

| componente | rutas | qué cablea |
|---|---|---|
| `CabeceraSector` | 6 (`/sectores/*`) | `pt-[125.58px] md:pt-[185px]` |
| `BandaCabecera` | **29** | `--banda-alto: 165.58px` · `--banda-alto-md: 225px` |

### Encuadre y arreglo

**Defecto de RANGO** (`CLAUDE.md` §El contrato no es el mismo a todos los
anchos): a 1440 y 390 cuadra, y solo se ve en medio. **Su arreglo es
estructural** —la barra **en flujo**, que es exactamente la partición **D1**
fichada como deliberada— y de **ámbito proyecto**, con adjudicación en las 31
rutas.

> ⚠ **Y ojo con la tentación:** D1 está fichada como partición deliberada
> **porque no mueve `docH`**, y eso sigue siendo cierto. Meter la barra en flujo
> **no es «reabrir D1 como defecto»**: es elegir la otra partición porque la
> actual obliga a cablear un hueco. Son dos afirmaciones distintas y la ficha de
> D1 no se toca.

---

## Eje horizontal · ADJUDICACIÓN de la cosecha completa (2026-08-02, 9.ª tanda)

**Corridas:** `medidas/ancho-cuerpo-{1440,390}-2026-08-02.json`, las dos con el
marcador de fila puesto. Las anteriores (`ancho-cuerpo-{1440,390}.json`, mismo
día, detector conductual) **se conservan** porque son la evidencia de la
corrección de más abajo.

**Cobertura, declarada al nivel al que se mide:** **164 de 181 filas del
original** (90.6 %), **idéntica a 1440 y a 390** — mismas filas, mismas parejas,
mismas huérfanas en las 31 rutas. Antes eran 99.

> **Y lo que este eje verifica, dicho con precisión:** de las 164 parejas,
> **152 dan Δ0 y son informativas** —o sea que su ancho DICE algo, no repite el
> del padre—. Ésa es la primera verificación real de la retícula del cuerpo del
> proyecto. Las 12 restantes están todas en `/`.

### Ficha 1 · `/` — la retícula del cuerpo · **FIDELIDAD** · va con C-QA3

El original usa **86 % en sus 16 filas, sin una excepción, a los dos anchos**
(1238.39 · 335.39). El clon sirve **dos** valores, y tres comportamientos:

| lo que hace el clon | filas | @1440 | @390 | Δ@1440 | Δ@390 | quién |
|---|---|---|---|---|---|---|
| **fijo 86.35 %** | 8 | 1243.44 | 336.75 | **+5.05** | **+1.36** | `SectionRow` |
| **fijo 85 %** | 2 | 1224 | 331.5 | **−14.39** | **−3.89** | `TrustBar` · `UltimosProyectos` |
| **cambia 86.35 → 85** en `md` | 3 | 1224 | 336.75 | **−14.39** | **+1.36** | `HeroSection` · `ProductosTabs` · `UltimosArticulos` |

**Encuadre: FIDELIDAD.** Falla en los dos anchos del contrato y **con el mismo
porcentaje**, no con el mismo píxel: no es un residuo que sobrevive a dos
maquetaciones, es el valor equivocado escrito en la hoja de estilos. La tercera
fila de la tabla es además **defecto de RANGO por el otro lado**: el clon
**varía donde el original no varía** (86 % constante), que es la regla del
contrato leída al revés.

**Por qué solo aquí, y por qué es FAMILIA DE CALIBRACIÓN de manual:** los cinco
componentes tienen **variante por familia**, y las variantes de las otras
familias están a Δ0 en las 30 rutas restantes. `TrustBar` sirve 95 % al sector
—medido Δ0— y 85 % a la home; `UltimosArticulos` sirve 86 % al sector y 80 % a
producto —los dos Δ0— y 86.35/85 % a la home. **La única variante que nadie
había comparado con el original es la de la home**, y es la única mal.

**No se toca aquí.** La home tiene **+289.91** de base abierto en C-QA3 y dos
cambios a la vez no se adjudican.

> ⚠ **CORRECCIÓN de la ficha del 2026-08-02 (8.ª tanda), §HOME · la retícula del
> CUERPO: el tercer valor no existe.** Aquella tabla anotaba **75 % → −158.39** a
> 1440. Era una **fila FANTASMA**: un bloque centrado dentro de `Testimonios` que
> el detector conductual tomó por fila. Con el marcador desaparece y la fila real
> de Testimonios empareja a **86.35 %, +5.05**, como sus siete hermanas. El clon
> sirve **dos** valores de retícula, no tres, y el peor Δ de la home es **−14.39**,
> no −158.39.
>
> Es la regla del pleno aplicada a un detector conductual: **un heurístico que
> encuentra MÁS de lo que hay no da error, da un número plausible de más.**

### Ficha 2 · las otras 30 rutas — **152 filas informativas a Δ0**

Sin ninguna excepción y a los dos anchos. Eso incluye, por primera vez medidos
contra el original: la retícula de sector (86 %), monográfico (86 %), grupo A
(86 %), producto y catálogo (80 %), la banda de clientes (95 % en sector, 85 %
en home) y **la miga de pan de las 29 rutas que la llevan** — que hasta hoy solo
había mirado `a-miga`, y solo el eslabón, no la fila.

### Ficha 3 · las 27 huérfanas, con su encuadre — ninguna es un ancho

**17 del original y 10 del clon**, y las cuatro clases están cerradas como
PARTICIÓN o como límite declarado del método. **Ninguna es un defecto de ancho
sin explicar.**

| # | clase | rutas | qué es | encuadre |
|---|---|---|---|---|
| 1 | «Amplía tus conocimientos con nuestras guías» | 5 (`/` · accesorios · api · monitor · software) | el original le da **fila propia**; el clon lo pinta **dentro** de la fila de `UltimosArticulos` | **PARTICIÓN** (el clon funde 2 filas en 1) |
| 2 | el kicker + `h1` de sector/monográfico | 6 | fila del clon cuyo equivalente vive en el `_tb_header` del original, que este eje excluye | **PARTICIÓN D1**, ya medida y fichada |
| 3 | la 2.ª fila de «Artículos y Guías» | 6 (sectores + monográficos) | el original la parte en dos filas y el clon monta una; encima el módulo **se baraja en cada carga** | **PARTICIÓN** + ruido conocido (27·54·81) |
| 4 | «Cuéntanos tus necesidades» | 1 (`/`) | fila propia en el original, dentro de `ProductosTabs` en el clon | **PARTICIÓN** |
| 5 | el testimonio «Jérôme De Waele…» | 1 (`/`) | fila propia en el original, dentro de la fila `Testimonios` del clon | **PARTICIÓN** |
| 6 | la fila del hero de `/` | 1 (`/`) | no empareja porque el `h1` oculto de SEO **se renderiza en el clon** (`absolute` 1×1) y **no en el original** (0×0), así que el texto visible difiere | artefacto del **`h1` de `/`**, ya fichado en `COBERTURA-MEDICION.md` |
| 7 | la fila de listas de Industria | 1 | el original **no** lleva la intro en esa fila; el clon sí | **S9a**, ya fichado y abierto |
| 8 | dos filas **sin texto** | 2 (construcción · petróleo) | banda de clientes: carrusel de 2.5 s, y en esa carga los dos lados no compartían ni un logo | **límite del emparejador**, no diferencia entre lados |

> **La 6 esconde una medida, y hay que decirlo:** la fila del hero de `/` mide
> **1224 (85 %)** en el clon contra **1238.39 (86 %)** en el original. Si
> emparejara sería un **−14.39 más**, o sea 13 filas con Δ≠0 en vez de 12. No se
> cuenta como Δ porque la sonda no la emparejó; se anota para que nadie lea «12»
> como el total.

> **La 7 es la mejor noticia de la tanda y conviene verla como tal:** un eje que
> se estrena **redescubrió solo** un defecto que otra sonda había fichado por su
> cuenta hace tandas. Dos instrumentos independientes señalando el mismo párrafo
> es lo más parecido a una confirmación que hay aquí.

### Lo que esta corrida NO verifica

- **17 filas del original siguen sin comparar** (9.4 %), y las de la clase 3 son
  filas de contenido barajado: mientras el módulo rote, su firma no puede casar
  y su ancho seguirá sin medirse por esta vía.
- **Las columnas dentro de la fila** se miden (`cols` en el fichero) pero **no se
  adjudican**: este barrido llega al nivel de FILA.
- **Ningún ancho intermedio.** El contrato de rango de este eje está **sin
  probar**: `qa:ancho` solo se ha corrido a 1440 y a 390.

---

## AUDITORÍA · ¿algún veredicto pasado de `clon-base` fue verde-sin-medir? (2026-08-02)

**Contestada LEYENDO `medidas/`, sin re-medir.** La pregunta la deja abierta el
defecto de la sonda: con el puerto vacío imprimía 31 errores y salía con código 0,
así que un acta pudo haber citado un «0 regresiones» que no midió nada.

### Lo que dicen los ficheros

**31 corridas congeladas de `clon-base`. En 30, TODAS sus páginas tienen dato.**
Los dos ficheros con **cero** unidades medidas son de hoy y son la evidencia del
propio defecto: `clon-base-1440-2026-08-02-2.json` (el diagnóstico) y
`clon-base-neg-puerto-muerto.json` (la pata 1 del negativo).

**Una sola corrida quedó a medias:** `clon-base-1440-cqa1-despues.json`, **16 de
17** — `/casos-de-exito/red-calidad-de-aire-para-world-athletics` dio *Navigation
timeout of 120000 ms*.

### El veredicto, con su alcance

| afirmación | estado |
|---|---|
| el acta de C-QA1: «las **11 anteriores** no se han movido un píxel» | **RESPALDADA** — las 11 están medidas en ese mismo fichero |
| el titular de esa corrida: «17 páginas comparadas · 0 con regresión» | **NO CONCLUYENTE en 1 de 17**: se compararon 16 |
| la ruta que faltó, a 1440 | **sin comparar** en esa corrida |
| la misma ruta, a 390 | **medida y comparada** en la misma tanda (`clon-base-390-cqa1-despues.json`, `docH 8225`) |

**Ninguna conclusión del proyecto se cae.** La que faltó es de grupo C —no de las
11 que el acta afirma— y su otro ancho sí se midió. Lo que se corrige es una
**cifra de titular**, no un hallazgo.

> **Y la razón de que sea «pocas o ninguna» no es suerte: es que el modo de fallo
> necesitaba el puerto vacío**, y una corrida contra un puerto vacío se nota
> enseguida por lo que tarda y por lo que imprime. El agujero era real y estaba
> abierto; lo que no hubo fue una corrida que lo atravesara y se citara. Eso se
> puede afirmar hoy porque **las 31 congelaron su contenido** — sin los ficheros,
> la pregunta no tendría respuesta.

### Lo que queda anotado

`clon-base-1440-cqa1-despues.json` lleva una ruta sin medir. Si alguien vuelve a
citarlo, **su cifra de páginas comparadas es 16, no 17**.

---

## VALIDACIÓN EN VIVO DE LAS 48 SONDAS — lo que el barrido estático no podía ver (2026-08-02, 11.ª tanda)

> **Tanda de INSTRUMENTO.** No se midió fidelidad y no se tocó el clon. Lo que
> cambia es qué puede salir verde y dónde se congela la evidencia.

La tanda anterior migró las sondas al contrato de `Evaluadas` y cerró con esta
frase: *«las 47 compilan y declaran; las demás llevan una línea insertada por
barrido revisado a mano; si alguna falla, fallará en voz alta»*. Correrlas era la
comprobación que faltaba, y sacó **seis defectos que ningún barrido estático
podía ver** — cinco de ellos anteriores a la migración.

### 0 · El barrido del contrato era la SÉPTIMA instancia, y su parche no cerraba

`qa:lib` comprobaba con un `grep` que las sondas declaran su mínimo, y el parche
de la tanda anterior añadió `node --check` **como segunda aserción**. Con dos
aserciones independientes para una sola pregunta, **un fichero roto deja la
primera en verde**: el informe podía decir «las 48 declaran su mínimo» de un
directorio que no arranca. Es la regla 1 de `CLAUDE.md` §sondas —*un solo canal
de verdad*— incumplida dentro del test que cierra esa misma clase.

Ahora `auditarSondas()` da **un veredicto por sonda**: compila **y** declara, o
**no es conforme**. La declaración se busca sobre el fuente **sin comentarios y
sin literales**, porque `// new Evaluadas(` es justo lo que un `grep` no
distingue. Test en negativo con ficheros rotos a propósito, en directorio
temporal y por tanto re-runnable.

> ⚠ **Y lo que sigue sin discriminar, dicho aquí:** que la `ev` esté en el
> **ámbito** correcto. Compila, declara y no cuenta nada — el caso `c-muestra`.
> Eso solo lo ve **correr la sonda**.

### 1 · ⚠ EL VERDE ERA MUDO EN 47 DE 48 — y el HANDOFF decía lo contrario

**El hallazgo de la tanda.** El HANDOFF §7 de la 10.ª decía: *«No leer un verde
de sonda como «midió» sin la línea de unidades: **ahora la imprime**»*.

**Medido corriéndolas: la imprimía UNA (`clon-base`).** Las otras 47 declaraban,
contaban y cerraban bien el código de salida —la guarda funcionaba— y salían con
un `✅` **sin decir sobre cuántas unidades**. O sea: el contrato estaba cerrado
para la máquina y **abierto para el lector**, que es quien firma las actas.

Es *documentado no es conectado* sobre la mitad legible de la propia guarda, y
van **tres veces en `lib.mjs`** (`SIN_CLON` inerte · `BUILD_ID` sin cerrar el
código · esto).

**Arreglado donde pasan todas:** la línea la pone el gancho de salida si la sonda
no llamó a `informe()`. No se le pide a 47 ficheros que se acuerden.

| antes | ahora |
|---|---|
| `✅ 0 discrepancias` | `✅ 0 discrepancias` + `✓ evaluadas 31/31 rutas · enlaces` |

### 2 · EL PENDIENTE DE LOS MÍNIMOS CAMBIA DE ENUNCIADO

Venía escrito como *«apretar los 8 suelos de 1 a su lista real»*. Las dos mitades
de esa frase estaban mal.

**(a) La lista de 8 estaba escrita a mano, y por tanto caducada.** Faltaban
`a-behaviors`, el segundo contrato de `clon-base` (`evCmp`) y **`cmp-sector`, que
es el que ya había firmado un verde falso**. Cerrar la clase sobre esos 8 es el
caso de la miga otra vez, que llegó a **3 de 7** implementaciones.

**Derivado ejecutando** (`auditarSondas()` + lectura del argumento `minimo` sobre
el código sin literales), tras arreglar `cmp-sector`: **49 declaraciones en 48
sondas** —`clon-base` lleva dos—, de ellas **39 derivan su mínimo de una lista** y
**10 declaran un literal**, todos `1`.

**(b) Y el criterio no es «que no sea 1»**, porque para cinco de esas diez el
mínimo correcto **es** 1. El enunciado bueno es otro:

> **TODO MÍNIMO TIENE QUE EXPRESAR EL INVARIANTE QUE LA SONDA AFIRMA.** No que
> sea grande, ni que venga de una lista: que diga **lo que la sonda promete
> haber mirado**.

Aplicado a las diez, ejecutando y mirando qué recorre cada una:

| sonda | qué recorre de verdad | mínimo | ¿expresa el invariante? |
|---|---|---|---|
| `a-behaviors` | **1 URL fija** (`URL_BLOG`) | 1 | **sí** |
| `d4-cta` | **1 página** (la 4.ª sección del pie, solo el CASO) | 1 | **sí** |
| `clon-base`/`evCmp` | rutas comparadas contra la línea base | 1 | **sí**, deliberado: es la guarda de vaciado |
| `offsets` | 1 ruta, **o 2 con `--cmp`** | 1 | **parcial**: con `--cmp` debería ser 2 |
| `a-ids` | `[PAGINA, ...OTRAS]`, lista derivada de la muestra | 1 | **NO** |
| `c-behaviors` | `CASOS(5) + FAQS(2) + INDICES(n)`, de la muestra | 1 | **NO** |
| `corte-cuerpo` | `RUTAS` del manifiesto × 2 anchos — **midió 12** | 1 | **NO** |
| `dos-rutas` | rutaA + rutaB = **2 por construcción** | 1 | **NO** |
| `mono-cmp` | original + clon = **2** — midió 2 | 1 | **NO** |
| `tree-cmp` | original + clon = **2** — midió 2 | 1 | **NO** |

**Seis no lo cumplen** (`a-ids`, `c-behaviors`, `corte-cuerpo`, `dos-rutas`,
`mono-cmp`, `tree-cmp`) **y una a medias** (`offsets`). No se arreglan en esta
tanda: se dejan nombradas.

**(c) Y el criterio NO se agota en las de mínimo literal**, que es lo que hacía
engañosa la formulación vieja. Hay **dos sondas que DERIVAN su mínimo y tampoco
lo cumplen**, las dos por la misma confusión —contar en una unidad y pisar en
otra—:

| sonda | imprime | unidad declarada | mínimo derivado de | qué acepta de más |
|---|---|---|---|---|
| `c-muestra` | `evaluadas 16/3` | páginas de la muestra | `Object.keys(salida.formas).length` = **formas** | 3 páginas **de la misma forma**, mientras su comentario promete «una por forma» |
| `esqueleto` | `evaluadas 16/9` | páginas | `Object.keys(FORMAS).length` = **formas** | 9 páginas de una sola forma |

**La línea de unidades es lo que las delató.** Un `16/3` y un `16/9` saltan a la
vista precisamente porque numerador y denominador cuentan cosas distintas; antes
de esta tanda ninguna de las dos imprimía nada.

Derivar el mínimo no garantiza que exprese el invariante: solo que no es un
número suelto. Lo que hay que mirar es si **el denominador está en la misma
unidad que el numerador**.

La línea de unidades lo deja ver de un vistazo: `corte-cuerpo` imprime
**`evaluadas 12/1 páginas`**. Un `12/1` es la firma de un suelo flojo; un
`31/31`, la de un mínimo derivado. **Antes esto no se veía en ningún sitio.**

### 2bis · ⚠ Y el suelo de 1 YA HABÍA TAPADO UNA CORRIDA PARCIAL: `cmp-sector`

**Es el defecto de migración de la tanda, y son DOS defectos que se tapaban el
uno al otro.** `cmp-sector` imprimía en pantalla sus **13 filas comparadas** y la
línea de unidades decía **`evaluadas 1/1 filas comparadas`** — verde.

| pieza | qué tenía | qué pasaba |
|---|---|---|
| el recuento | `ev.ok(filas.length)` | **`filas` es un OBJETO**, así que `filas.length` es `undefined` |
| `Evaluadas.ok(n = 1)` | parámetro por defecto | el `undefined` **se convertía en 1** en vez de dar error |
| la declaración | `minimo: 1` | **1 ≥ 1 ⇒ verde** |

Quítese cualquiera de las tres y la sonda sale roja. Estaban las tres.

> **El parámetro por defecto es el mecanismo, y es de la familia de siempre:
> convierte un cálculo equivocado en un número plausible.** `ok(undefined)` y
> `ok()` no significan lo mismo y no pueden dar lo mismo — es el
> *cero/pleno* aplicado al recuento en vez de al selector.

**Arreglado a mano, las tres:** el mínimo se **deriva** (`cfg.anclas.length +
COLAS`), el recuento usa `Object.keys(filas).length`, y `ok()` ahora **distingue
«sin argumento» de «argumento undefined»** y tira en el segundo caso — la guarda
va en `lib.mjs`, que es por donde cuentan todas.

Y es la respuesta empírica a la pregunta de PASO 3: **el suelo de 1 no es una
formalidad pendiente de apretar. Ya había firmado un verde sobre 1 de 13.**

### 2ter · ⚠ Y el contrato también puede dar un ROJO FALSO: `lh-paginas`

**El triaje de la tanda tenía tres cubos —verde legítimo · contrato bien
disparado · defecto de migración— y le faltaba éste.** `lh-paginas` medía sus 35
rutas, informaba de las 35 —«paginan de verdad: 21 · NO paginan: 14»— y
terminaba con `❌ NO SE PUDO EVALUAR — 21 de 35 rutas`.

El bucle tiene **dos salidas tempranas** y el `ev.ok()` estaba solo al final:

| camino | qué deja | ¿es una medida? |
|---|---|---|
| `!dos.ok` | «este listado tiene **1 página**» | **sí** |
| `alto > MAX` | «**NO PAGINA**»: sirve 200 para cualquier N y el canonical confirma la 1.ª. **Cuesta una petición MÁS** que las demás | **sí** |

Los dos `continue` esquivaban la línea que la migración automática había puesto
al final del cuerpo. Es la trampa de `c-muestra` **por el otro lado** —allí la
`ev` quedaba fuera de alcance y el verde era falso; aquí el rojo lo es— y no es
menos grave:

> **Un rojo que nadie sabe explicar se acaba ignorando, y entonces la guarda ya
> no guarda nada.** Un falso positivo repetido desactiva una alarma igual de
> bien que un falso negativo, solo que más despacio.

**Barrida la clase en las 48**: 8 sondas tienen un salto por delante de su
`ev.ok()`, y revisadas una a una **solo ésta estaba mal**. En `a-censo`,
`lh-censo` y `lh-tarjetas` el `continue` sigue a un **fallo real** (`fallos++`,
HTTP ≠ 200) y no contar es lo correcto. El discriminador es simple y conviene
tenerlo escrito:

> **¿el camino que salta dejó un DATO o dejó un ERROR?** Si dejó un dato, cuenta.

### 3 · Seis sondas congelaban FUERA de `medidas/`, con su evidencia dentro

`cmp-sector` · `mono-cabecera` · `mono-detalle` · `mono-inline` · `mono-modulos`
· `tree-todos` escribían en la **raíz de `scripts/qa/`**, mientras sus ficheros
congelados —los que cita el README y están commiteados— viven en `medidas/`.

**Consecuencia, y es la regla 5 de §sondas anulada en seis sitios:** la guarda de
sobrescritura de `w()` compara contra el destino, y el destino no existía. O sea
que **nunca disparaba**: cada corrida escribía limpio en la raíz y el congelado
de `medidas/` quedaba intacto **sin compararse con nada**. Un «→ fichero
escrito» idéntico al de una corrida que sí ha pasado la guarda.

Lo destapó ver aparecer `scripts/qa/cmp-industria-1440.json` en `git status`.
**Arreglado**: las seis apuntan a `medidas/`.

### 4 · `w()` fecha en UTC, y eso adelanta el día a partir de las 19:00 locales

Las salidas de esta tanda, tomadas el **2026-08-02 a las 19:16 −0500**, se
congelaron como **`…-2026-08-03.json`**. `alLado()` usa
`new Date().toISOString()`, que es UTC.

No es cosmético en este proyecto:

- la regla de método dice que **los deltas solo se comparan entre medidas del
  mismo día**, y el nombre del fichero es de dónde se lee ese día;
- la campaña C-QA6 exige que la ráfaga 3 caiga **en un tercer día**. Un fichero
  fechado 08-03 tomado el 08-02 por la tarde **parece cumplirlo y no lo cumple**.

**Arreglado**: fecha local.

### 5 · 22 de 31 sondas que usan `openPage` IGNORAN el estado HTTP

`lib.mjs` devuelve el estado desde hace tandas, y su propio comentario dice por
qué: *«una 404 CARGA BIEN: `goto` no lanza, la página renderiza, y una sonda que
no lo mire mide el 404 y publica deltas plausibles»*. **Nueve lo miran. Veintidós
no** — entre ellas `clon-base`, la guarda que más se corre.

Visto en vivo, y por accidente: `dos-rutas` con un slug inventado devolvió
`docH 6035 → 900` y `null` en todas las anclas, y lo informó como **«el cascarón
NO es el mismo»** en vez de «404». Dio rojo, sí, pero por el motivo equivocado —
y un motivo equivocado en un informe es lo que se cita después.

**Arreglado en el sitio común**, no en 22 ficheros: `openPage` **no cuenta como
página evaluada** una respuesta ≥ 400 y lo grita. Como la mayoría declara
`porPaginas: true`, el recuento se queda corto **y el contrato la pone roja
sola**.

> ⚠ **Lo que este arreglo NO cubre**, y por eso se escribe: las 6 sondas que
> cuentan a mano (`a-behaviors` `a-cascaron` `a-miga` `c-bases` `clon-base`
> `cmp-sector`) siguen pudiendo llamar a `ev.ok()` tras una 404. Para ellas el
> aviso es la línea gritada, no el contrato.

### 6 · Cuatro sondas sin `npm run qa:*`

`mono-cabecera` · `mono-detalle` · `mono-inline` · `mono-modulos` — hay que
lanzarlas `node scripts/qa/x.mjs`. El README dice que la forma canónica es
`npm run qa:*` y da la razón (**prefijo estable** que se autoriza una vez; a pelo
cada invocación pedía permiso otra vez, 360 reglas de un solo uso). **Fichado, no
arreglado**: es una línea de `package.json` por sonda y no es de esta tanda.

---

## C-QA6 · CIERRE — la campaña completa, el suelo fijado y el −15.72 disuelto (2026-08-03)

**C-QA6 queda CERRADA.** Ráfaga 3 corrida el **2026-08-03 a las 08:28:44 local**
→ `medidas/campana/cqa6/rafaga-2026-08-03T08-28-44.json`, con
`✓ evaluadas 18/18 cargas · ruido · 0 selectores muertos`.

### Antes de nada: las tres ráfagas están en UNA escala

Las ráfagas 1 y 2 se archivaron con sello **UTC** (`toISOString()`); desde el
2026-08-02 el sello es **local**. Como el criterio de la campaña —«≥2 h de
separación y ≥2 **días** distintos»— se comprueba **leyendo esos nombres**, con
la máquina en −05:00 mezclarlas habría metido **5 h de error en el propio
veredicto**. Se re-etiquetaron las dos **antes** de correr la 3 (commit
`9787f68`):

| se archivó como | pasa a llamarse | día |
|---|---|---|
| `rafaga-2026-07-31T03-14-57.json` | `rafaga-2026-07-30T22-14-57.json` | 07-31 → **07-30** |
| `rafaga-2026-08-02T17-33-41.json` | `rafaga-2026-08-02T12-33-41.json` | 08-02 (igual) |

**Fue RE-ETIQUETADO, no re-medición, y está probado en vez de afirmado:** contra
lo que git guarda del fichero viejo, `resumen` y `crudo` dan el **mismo sha256**
en los dos, el resto del `meta` es idéntico y el instante se conserva (el sello
viejo en UTC **es** el `ts` nuevo). La conversión tiene **dos fuentes
independientes que concuerdan**: el `mtime` en disco y la fecha del commit que
congeló cada uno (`b3a5ca5` 22:15:52 −0500; `a089ba2` 13:11:16 −0500). El nombre
viejo vive dentro del fichero, en `meta.reetiquetado`, porque tres documentos lo
citaban y **una cita cuyo fichero desaparece queda huérfana**.

Desde esta tanda el fichero lleva además **`meta.escala`**: la escala se
**declara**, no se deduce del nombre. Mientras no lo llevó, la única forma de
saber en qué escala estaba un sello era mirar el `mtime` — un dato que vive
**fuera de la medida** y que un `git clone` reescribe.

### Estado de la campaña: **COMPLETA**

`3 ráfagas · 3 días · separadas ≥2h (3)`. Separaciones **calculadas del `ts`
absoluto**, no estimadas: **62.31 h** (1→2) y **19.92 h** (2→3).

> **Cómo cierran tres ráfagas, que es lo que un lector va a preguntar.** El
> protocolo pide **≥3 ráfagas, ≥2 h de separación y ≥2 días distintos** — los
> días son un **mínimo**, no un reparto de una ráfaga por día. Las ráfagas 1 y 2
> ya aportaban los dos días exigidos (30 jul y 2 ago), así que **la 3 podía caer
> el mismo día que la 2 y la campaña habría cerrado igual**. De hecho cayó en un
> tercer día (08-03) y salieron **3**, pero eso es holgura, no requisito. Nótese
> que **el re-etiquetado no regaló el día**: movió la ráfaga 1 de 07-31 a 07-30,
> que sigue siendo un día distinto de 08-02.

### El suelo, con su alcance declarado

> **Alcance: 3 rutas × 2 anchos, medidas el 2026-07-30, 08-02 y 08-03.**
> `/software-de-medicion-calidad-del-aire` ·
> `/sectores/…-en-edar` · `/sectores/…-petroleo-y-gas`.
> Un suelo es propiedad **de las rutas medidas**, no del sitio: para cualquier
> otra ruta esto no es un suelo, es un hueco.

| combinación | `h1` (máx ENTRE ráfagas) | posicional |
|---|---|---|
| `software@1440` · `edar@1440` · `petroleo@1440` | **32.28** | 33 |
| `software@390` | **0** | 81 |
| `edar@390` | **0** | 54 |
| `petroleo@390` | **0** | 27 |

**Los ceros de @390 casi se pueden escribir como suelo — y no se van a
escribir.** La regla dice que «el suelo es 0» **solo** puede escribirlo una
campaña completa y aun así con su fecha, y ésta lo está: 9 cargas por
combinación en 3 episodios separados, un solo estado en las tres rutas. Con eso
bastaría… si las 3 ráfagas fueran todo lo que se ha medido a 390.

> ⚠ **No lo son, y esto es lo que impide cerrar el ancho de 390.** La **ráfaga
> A** del 2026-07-30 midió **`±30` en las tres rutas @390** (§C-QA6 · MEDIDA), y
> **su fichero se borró a mano** — el episodio está en prosa y la medida no
> existe. Por el enunciado del protocolo el suelo es **el máximo ENTRE
> ráfagas**; si la A contara, el suelo a 390 sería **30**, no 0.
>
> **Así que a 390 el resultado es: 0 entre las ráfagas EXHIBIBLES, con una
> observación de ±30 documentada y no exhibible que lo contradice.** No se
> escribe «suelo 0» porque una campaña no puede cerrar un ancho ignorando la
> única medida que la contradice, por más que esa medida ya no tenga fichero.
>
> **Y aquí es donde el borrado a mano deja de ser una anécdota.** Hasta hoy se
> había pagado como *«el número mejor pagado de la tanda es el único que no se
> puede exhibir»*. Ahora se paga como algo peor: **una decisión que no se puede
> tomar** — el −30 de `/…-en-edar` a 390 es «defecto claro» o «exactamente el
> suelo» según cuente o no la ráfaga A, y no hay forma de dirimirlo. Se cierra
> con **una ráfaga más a 390**, no con un arreglo.

**A 1440 sí cierra**, que es donde estaba la pregunta de C-QA6: suelo `h1`
**32.28**, a fecha 2026-08-03. No es una propiedad permanente ni del sitio.

### El hallazgo: el `h1` es BIMODAL, no tembloroso

Los valores absolutos de las 18 cargas de la ráfaga 3, más las 36 anteriores,
dan **exactamente dos estados por combinación**, separados por 32.28 clavados:

| ruta @1440 | estado bajo | estado alto | Δ |
|---|---|---|---|
| `software` | 389.11 | 421.39 | 32.28 |
| `edar` · `petroleo` | 228.88 | 261.16 | 32.28 |

**El estado bajo se vio SOLO en la ráfaga 1** (2026-07-30). Las ráfagas 2 y 3 —y
las **6** corridas de `c-cabecera` que hay congeladas— cayeron todas en el alto.

### Qué pasa con el −15.72 de `/software`: **se disuelve, no queda pendiente**

Era lo que quedaba SIN PROBAR por debajo de ~32.28, y la campaña contesta algo
mejor que «sigue sin probarse»: **nunca fue un residuo aparte.** Es **el −48
leído contra el estado bajo del original**. El clon valía **373.39**, fijo:

```text
389.11 (orig, estado bajo)  − 373.39 (clon)  =  −15.72
421.39 (orig, estado alto)  − 373.39 (clon)  =  −48.00
421.39 − 389.11 = 32.28   ← la diferencia entre los dos «defectos» ES el suelo
```

Un clon, **un** defecto, dos números según qué estado pillara la corrida. Los
«dos candidatos a objetivo» de C-QA2 eran el mismo.

**Y ese defecto ya está arreglado:** el clon pasó de **373.39 a 421.39**, y las
**4** corridas de `c-cabecera` posteriores al arreglo lo dan a **Δ0**
(`c-cabecera-1440-2026-08-03.json`). Los dos monográficos, igual: clon 261.16
contra orig 261.16, Δ0 en las mismas corridas.

> ⚠ **La consecuencia que hay que dejar escrita, porque si no alguien «arregla»
> un clon correcto.** El clon tiene **UN** valor fijo; el original tiene **DOS**.
> No existe un valor fijo que case con los dos, así que el «Δ0» de estas 3 rutas
> significa **Δ0 contra el estado DOMINANTE** (421.39 · 261.16 · 261.16), que es
> el que salió en 2 de 3 ráfagas y en 6 de 6 corridas de `c-cabecera`.
>
> **Si una corrida futura pilla el original en su estado bajo, las tres marcarán
> +32.28, y eso NO es una regresión.** Es el original en su otro estado.
> Recalibrar entonces sería fabricar exactamente la FAMILIA DE CALIBRACIÓN
> contra la que avisa `CLAUDE.md`: cablear el valor de la instancia que tienes
> delante.

### Lo que C-QA6 **no** cierra: el MECANISMO

La campaña fija el **suelo**. La pregunta de **por qué** el original tiene dos
estados sigue abierta, y la propia sonda lo imprime:

```text
observable de mecanismo: presente en 1/3 ráfaga(s) · transiciones registradas CON observable: 0
```

Es un desencuentro de calendario, y conviene nombrarlo porque no se arregla
midiendo más de lo mismo: **el observable discriminante se añadió DESPUÉS de la
ráfaga 1**, que es **la única que tuvo transición**. Las ráfagas 2 y 3 llevan el
observable pero **no cambiaron de estado**, así que no había nada contra lo que
correlacionar — y eso se reporta como *«aquí no se puede evaluar»*, no como
*«el observable no sirve»*.

**Los dos detectores siguen NO VALIDADOS** tras **18** cargas más (54 en total):
`rocketToken` S 0 / N 18 y `rocketLoader` S 0 / N 18. Por la regla del cero/pleno
**no se pueden citar en ninguna dirección**: «Rocket Loader no interviene» sigue
sin respaldo, porque un detector que nunca ha discriminado no distingue *«no está
presente»* de *«el selector está mal escrito»*.

> **Fichado, no hecho:** la propia sonda tiene escrito que un detector que siga
> sin validar **al cerrar la campaña se retira del observable** («ocupa sitio y
> sugiere respuesta»). La campaña ya está cerrada, así que **toca retirarlos o
> reescribirlos** — pero eso es una decisión sobre la sonda, no el cierre de
> C-QA6, y no se hace de tapadillo en esta tanda.

**Para atacar el mecanismo hace falta una ráfaga CON transición Y con
observable**, y no se puede provocar a demanda: el estado bajo apareció una vez
en tres episodios repartidos en cinco días. Queda como pregunta abierta de coste
bajo — cada ráfaga futura de `cqa6` la contesta gratis si el original coopera.

### Consecuencia práctica para leer Δ en estas 3 rutas

- **@1440** — ⚠ **NO es un umbral, y así estaba mal escrito aquí.** Se compara
  contra **dos valores admisibles** (≈0 y ≈32.28); **cualquier otro valor es
  defecto, incluidos los menores que 32.28.** Ver §La regla de lectura de un
  suelo BIMODAL, abajo.
- **@390** — **sin cerrar.** 0 entre las 3 ráfagas exhibibles, contra un `±30`
  documentado y sin fichero (ráfaga A). Un Δ **muy por debajo de 30** es
  defecto; un Δ **de ~30** queda SIN PROBAR hasta que otra ráfaga a 390
  reproduzca el episodio o no. Es el único cabo que C-QA6 deja suelto, y no lo
  dejó la medición: lo dejó un `rm`.
- **Cualquier otra ruta** — no tiene suelo. Tiene un hueco.

---

## C-QA6 · flecos — la regla bimodal, la predicción pre-registrada y la campaña de 390 (2026-08-03)

### ⚠ La regla de lectura de un suelo BIMODAL — y por qué NO es un umbral

**Corrige lo que este mismo documento escribió horas antes**, que decía *«todo
residuo < 32.28 es indistinguible del estado del original»*. **Eso es leer el
suelo como un umbral, y es exactamente el error que el hallazgo bimodal
desmiente.**

> **La distribución no es una dispersión de 0 a 32.28: son DOS PICOS separados
> por 32.28 exactos.** Entre pico y pico **no hay masa** — en las 27 cargas
> @1440 de la campaña no apareció ni un solo valor intermedio.

De donde la regla, que es la que hay que aplicar:

| Δ observado | lectura |
|---|---|
| **≈ 0** | el original está en el estado **alto**: el clon casa. **Limpio.** |
| **≈ 32.28** | el original está en el estado **bajo**: el clon casa con el otro pico. **Limpio.** |
| **cualquier otro valor** | **DEFECTO — incluidos los MENORES que 32.28.** |

**Un umbral de 32.28 taparía defectos de hasta 32 px**, y precisamente en las
rutas peor conocidas del proyecto. Un Δ de 12, o de 20, o de 31 **no es «ruido
pequeño»**: es un valor que el original **nunca ha producido**, así que solo
puede venir del clon.

> **El suelo de una distribución bimodal no acota: DISCRIMINA.** Se compara
> contra **dos valores admisibles**, no contra un máximo. La pregunta correcta
> no es *«¿cabe dentro del suelo?»* sino **«¿cae en uno de los dos picos?»**.

### Lo que las medidas congeladas dicen y el acta anterior no

El acta anterior cerró con *«el −48 ya está arreglado, Δ0 en las corridas
posteriores»*. Es verdad **y está incompleto en el eje que importa**, porque ese
Δ0 es contra **un solo** estado:

| corridas exhibibles de `c-cabecera` @1440 | qué salió |
|---|---|
| **6** que midieron `/software` | el original en **421.39 — el estado ALTO — en las 6** |
| **5** que midieron los dos monográficos | el original en **261.16 — el ALTO — en las 5** |

**El original nunca se dejó ver en su estado bajo por `c-cabecera`.** Y el clon
se calibró contra lo único que había delante:

```text
ANTES    clon 373.39  →  vs bajo 389.11 = −15.72  ·  vs alto 421.39 = −48.00
DESPUÉS  clon 421.39  →  vs bajo 389.11 = +32.28  ·  vs alto 421.39 =   0.00
```

> **O sea que el −15.72 no desapareció: se convirtió en +32.28.** Mover el clon
> no eliminó la discrepancia contra el estado bajo — **cambió contra cuál de los
> dos estados el clon es exacto**. No existe ningún valor fijo que dé 0 contra
> los dos, porque **el clon tiene UN valor y el original tiene DOS**.

**Por tanto el «Δ0» de estas 3 rutas es una afirmación CONDICIONADA AL ESTADO, y
así hay que escribirla y así hay que leerla:**

> **`/software`, EDAR y petróleo están a Δ0 CONTRA EL ESTADO ALTO** (421.39 ·
> 261.16 · 261.16), que es el único que han visto las 6 corridas de
> `c-cabecera` y 2 de las 3 ráfagas de `cqa6`. **Contra el estado bajo están a
> +32.28.** No es un defecto pendiente: es que la pregunta *«¿cuánto se desvía
> el clon?»* **no tiene una sola respuesta** mientras el original sea bimodal.

Calibrar contra el pico alto **fue deliberado y se deja razonado**: es el estado
dominante en todo lo observado (**6/6** en `c-cabecera`, **2/3** en ráfagas,
**23 de 27** cargas @1440 de `cqa6`). Calibrar contra el punto medio daría
±16.14 contra los dos y **no acertaría ninguno** — peor, porque convertiría los
**dos** estados en defecto en vez de uno.

---

### PREDICCIÓN PRE-REGISTRADA — lo que convierte esto en modelo y no en relato

Se escribe **antes** de observarla, con su falsador, y se fecha. Si el modelo
bimodal es correcto, cuando el original caiga en el estado bajo:

1. **`c-cabecera` imprimirá `+32.28` EXACTOS.** No «unos 32», no «entre 30 y 33».
2. **De forma SIMULTÁNEA dentro de cada grupo**, y los grupos son **dos**:
   - **grupo A** — `/software` (sola);
   - **grupo B** — EDAR y petróleo (**siempre idénticas entre sí**).
3. **Los dos grupos pueden estar en estados DISTINTOS a la vez.** No es una
   conjetura: está medido en la ráfaga 1 de `cqa6`, carga a carga —

   | carga | `/software` | EDAR | petróleo |
   |---|---|---|---|
   | #1 | 389.11 **bajo** | 228.88 **bajo** | 228.88 **bajo** |
   | #2 | 389.11 **bajo** | 261.16 **ALTO** | 261.16 **ALTO** |
   | #3 | 421.39 **ALTO** | 261.16 alto | 261.16 alto |

   Los monográficos saltaron entre #1 y #2; `/software`, entre #2 y #3. **Momentos
   distintos, y los dos monográficos clavados el uno al otro en las tres cargas.**

4. **El hueco es 32.28 en los DOS grupos** —`421.39 − 389.11` y
   `261.16 − 228.88`— pese a partir de bases distintas. Eso apunta a **un solo
   mecanismo**, todavía **sin identificar**.

> **FALSADOR, declarado:** **cualquier lectura que no sea ni ≈0 ni ≈32.28 tumba
> el modelo** y vuelve a abrir la pregunta del mecanismo. También lo tumbaría un
> tercer estado, o que los dos monográficos se separaran entre sí.

**Estado de la predicción a 2026-08-03:** *sin contrastar todavía* — desde que
se escribió, las 9 cargas @1440 de `cqa6-390` salieron **las 9 en el estado
alto**. Consistente, y **no es evidencia a favor**: para eso hace falta ver el
estado bajo.

**Observación adicional, con su límite dicho:** en la ráfaga 1 la transición fue
**monótona bajo→alto** a lo largo de cargas consecutivas, y las ráfagas 2 y 3 y
la de `cqa6-390` salieron enteras en alto. Es **compatible** con algo que se
calienta —caché del origen, por ejemplo— pero es **una sola ráfaga de 3 cargas**:
se anota como pista, **no como mecanismo**, y no se cita como explicación.

---

### CAMPAÑA `cqa6-390` — porque «no hay forma de dirimirlo» no es un estado final

El −30 de EDAR@390 es «defecto claro» o «exactamente el suelo» según cuente o no
la ráfaga A, cuyo fichero se borró a mano. **Eso lo dirime una campaña, no un
argumento.** Arrancada hoy, mismas 3 rutas:

```bash
RUTAS=/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas \
  CAMPANA=cqa6-390 npm run qa:ruido -- 3
```

**Ráfaga 1 — 2026-08-03 09:39:47 local**
(`medidas/campana/cqa6-390/rafaga-2026-08-03T09-39-47.json`, `✓ evaluadas 18/18 cargas`):

| combinación @390 | `h1` | estado único |
|---|---|---|
| `software` | 0 | 308.58 |
| `edar` | 0 | 189.39 |
| `petroleo` | 0 | 189.39 |

**No se observó el ±30 en este episodio.** Que es distinto de decir que no
exista, y la sonda lo imprime así sola: `⏳ CAMPAÑA ABIERTA`.

**Cuándo tocan las siguientes**, que es lo que hay que dejar escrito:

| ráfaga | cuándo | por qué |
|---|---|---|
| **1 ✅** | 2026-08-03 09:39 local | hecha |
| **2 ⏳** | **≥2 h después** — o sea a partir de las **11:39 del 2026-08-03** | separación mínima del protocolo |
| **3 ⏳** | **en OTRO DÍA** (≥2026-08-04), ≥2 h de la 2 | los ≥2 días distintos los tiene que aportar ésta |

> ⚠ **Aquí los dos días NO están cubiertos de antemano**, al revés que en `cqa6`:
> la ráfaga 1 es del 08-03, así que **la 3 tiene que caer otro día
> obligatoriamente**. Si las tres cayeran el mismo día la campaña **no cierra**,
> por muy separadas que estén.

**Se corrió DESPUÉS de retirar los detectores, a propósito:** así las 3 ráfagas
de esta campaña son **homogéneas**. Es justo lo que le faltó a `cqa6`, donde el
observable llegó tras la ráfaga 1 y dejó **la única con transición** sin nada al
lado.

**Y de regalo mide 1440**, así que **cada ráfaga de esta campaña es también un
test de la predicción bimodal** de arriba. Sale gratis.

#### Hasta que cierre

> **El −30 de `/sectores/…-en-edar` a 390 se queda SIN PROBAR**, con esa
> etiqueta literal: **ni defecto ni limpio**. No se toca, no se «arregla» y no se
> cita como resuelto.

Y arrastra la corrección que ya está hecha arriba: **un suelo es propiedad de
las rutas Y LOS ANCHOS medidos.** El ±32.28 es de 1440 y no ampara nada a 390.

---

## C-QA6 · LA ESCALA DEL FENÓMENO — el protocolo mide en días y la cosa pasa en segundos (2026-08-03)

**Corrige el protocolo que la propia §C-QA6 instaló**, y lo corrige con los datos
de la campaña que lo cerró. No es un matiz: cambia **qué variable hay que subir**
para volver a ver el fenómeno.

### El dato: las transiciones están medidas CARGA A CARGA

La ráfaga 1 de `cqa6` son 3 cargas consecutivas, en minutos. Los estados
cambiaron **dentro de la ráfaga**:

| carga | `/software` | EDAR | petróleo |
|---|---|---|---|
| #1 | 389.11 **bajo** | 228.88 **bajo** | 228.88 **bajo** |
| #2 | 389.11 **bajo** | 261.16 **ALTO** | 261.16 **ALTO** |
| #3 | 421.39 **ALTO** | 261.16 alto | 261.16 alto |

**Los monográficos saltaron entre la #1 y la #2. `/software`, entre la #2 y la
#3.** Cargas consecutivas: **segundos de separación, no horas.**

### La consecuencia, y es sobre el protocolo

El protocolo vigente —**«≥3 ráfagas, ≥2 h de separación, ≥2 días distintos»**—
se escribió para los **episodios largos**: las dos lecturas separadas por horas
de C-QA1, en las que el original «se movía» de un rato a otro. Esa calibración
es correcta **para lo que se observó entonces**. Pero la campaña que cerró la
pregunta midió algo distinto:

> **El estado cambia entre cargas consecutivas. La variable que discrimina es el
> NÚMERO DE CARGAS, no el reparto en días.**

Dicho de otro modo: **el protocolo gasta días para comprar algo que se compra
con cargas.** Tres ráfagas repartidas en tres días dan 9 cargas por combinación;
una sola sentada de 60 da casi siete veces más muestreo del fenómeno **en una
tarde**, y ninguna cantidad de días compensa un muestreo corto si lo que
discrimina es la carga.

**Los dos ejes no son intercambiables y hay que decir para qué sirve cada uno:**

| eje | qué compra | cuándo hace falta |
|---|---|---|
| **días / separación** | protege de que una condición **persistente** (un despliegue, una caché fría, un incidente) se lea como el suelo permanente | **sigue haciendo falta**: es lo que impide llamar «suelo» a una tarde rara |
| **nº de cargas** | **muestrea los estados** — es la escala a la que ocurre el cambio | **es el que faltaba**, y el que decide si un «un solo estado» significa algo |

> **Ninguno sustituye al otro.** El protocolo no se deroga: **se le añade el eje
> que no tenía.** Una campaña con 3 días y 9 cargas está bien separada **y mal
> muestreada**, y eso hasta hoy no se podía ni enunciar.

### Y por eso «un solo estado a 390» no es una conclusión

Aquí está el asunto, con sus dos lados puestos uno al lado del otro:

| ancho | cargas | estados vistos |
|---|---|---|
| **1440** | **27** (cqa6) | **DOS** — 389.11 ↔ 421.39 y 228.88 ↔ 261.16 |
| **390** | **18** (cqa6 + ráfaga 1 de cqa6-390) | **UNO** — 308.58 · 189.39 · 189.39 |

> ⚠ **«No se vio un segundo estado en 18 cargas» NO es «390 es unimodal».** Son
> dos afirmaciones distintas y solo la primera está respaldada. Es **la regla del
> cero** —*no encontrar nada y no mirar nada dan la misma salida*— aplicada al
> **muestreo** en vez de a un selector.

Y no es escrúpulo retórico: a 1440 el estado raro salió en **4 de 27 cargas**,
o sea alrededor del **15 %**. Con 18 cargas, una tasa así se puede perder por
azar sin nada de extraordinario. **18 no es un tamaño que pueda contestar la
pregunta**, y hasta hoy se estaba leyendo como si lo fuera.

**De ahí `estados-390`** (§siguiente), que es exactamente esa pregunta contestada
en la escala del fenómeno: **muchas cargas, una sentada**. Y de ahí que **no** se
le toque el tamaño a `cqa6-390`: esa campaña contesta el eje de los días y vale
por tener sus 3 ráfagas homogéneas.

### `estados-390` · el eje de las CARGAS, contestado (2026-08-03)

La pregunta era **«¿390 es unimodal, o está poco muestreado?»**, y se contesta en
la escala del fenómeno —**cargas**, no días—. Una sentada, 60 cargas por ruta:

```bash
npm run qa:estados-390 -- 60      # → medidas/estados-390.json · ✓ 180/180 cargas
```

| ruta @390 | cargas válidas | estados | valores |
|---|---|---|---|
| `software` | 60 | **1** | `308.58 ×60` |
| `edar` | 60 | **1** | `189.39 ×60` |
| `petroleo` | 60 | **1** | `189.39 ×60` |

**Cero variación en 180 cargas.**

#### Qué se puede afirmar con eso, y qué no

> **No es «390 es unimodal».** La sonda lo imprime ella misma, y es la regla del
> cero: **180 cargas sin ver algo acotan su frecuencia, no prueban su ausencia.**

Lo que sí se puede escribir, con el número:

| | 1440 | 390 |
|---|---|---|
| estados vistos | **2** | **1** |
| tasa del estado raro | **4 de 27 ≈ 15 %** | **0 de 60 por ruta** |
| cota al 95 % (regla de tres, `3/n`) | — | **< 5 % por carga y ruta** |

Y el contraste que cierra la pregunta que se hizo:

> **Si a 390 hubiera un segundo estado con la tasa de 1440 (≈15 %), la
> probabilidad de no verlo en 60 cargas sería `6.6 × 10⁻⁵`; en las 180,
> `2.9 × 10⁻¹³`.** O sea: **390 NO se comporta como 1440.** Eso ya no es una
> suposición ni un «no se vio»: está medido y acotado.

**Pero una tasa mucho menor sigue cabiendo**, y por eso el −30 no se cierra
aquí: un estado que apareciera en el 1 % de las cargas daría `0.99⁶⁰ ≈ 0.55` de
no salir — más probable que salir.

#### Lo que esto le hace a `cqa6-390`: **la confirma, no la sustituye**

El pre-registro decía: *«si aparece un segundo estado, `cqa6-390` cambia de
sentido antes de gastar dos días en ella»*. **No apareció**, así que la campaña
**mantiene su sentido y sigue en pie con sus ráfagas 2 y 3.**

Y de paso los dos ejes quedan repartidos limpiamente, que es la confirmación
práctica de §La escala del fenómeno:

| eje | instrumento | estado |
|---|---|---|
| **cargas** — ¿hay un segundo estado FRECUENTE? | `estados-390`, 180 cargas | ✅ **CERRADO**: no lo hay (< 5 %) |
| **días** — ¿hay una condición EPISÓDICA que reaparezca? | `cqa6-390`, 3 ráfagas | ⏳ **abierto**: 1 de 3 |

> **Y esa división explica por qué el ±30 de la ráfaga A no lo contesta esta
> sonda.** Si aquello fue un episodio —una condición ligada a un momento, no a
> una carga— entonces 180 cargas de una sola tarde **no pueden verlo por
> construcción**, por muchas que sean. Es exactamente el eje que compra la
> separación en días, y para eso está `cqa6-390`.

#### El −30 de EDAR@390, tras esto

**Sigue SIN PROBAR**, con esa etiqueta. Lo que cambia es que ahora se sabe **por
qué vía puede resolverse y por cuál no**:

- **no** por más cargas: 180 ya dicen que no hay estado frecuente;
- **sí** por las ráfagas 2 y 3 de `cqa6-390`, que es donde vive la hipótesis
  episódica.

Si esas dos cierran sin ver el ±30, el balance de evidencia queda: **un ±30
observado una vez, sin fichero, no reproducido en 180 cargas ni en 3 episodios
separados.** Eso seguirá sin ser una prueba de ausencia —nada lo es— pero será
suficiente para dejar de tratar el −30 como candidato a suelo y pasarlo a
defecto con su ficha. **Esa decisión NO se toma hoy**: se toma con las dos
ráfagas hechas, y se deja escrito aquí para que se tome por el criterio
pre-registrado y no por cansancio.

---

## `cqa6-390` · ráfaga 2 de 3 (2026-08-03, 11:58 local)

`medidas/campana/cqa6-390/rafaga-2026-08-03T11-58-27.json`, `✓ evaluadas 18/18 cargas`.
Separación con la ráfaga 1: **2.31 h** (calculada del `ts` absoluto).

| combinación @390 | `h1` | estado único |
|---|---|---|
| `software` · `edar` · `petroleo` | **0** | 308.58 · 189.39 · 189.39 |

**Sigue sin observarse el ±30.** Con las 180 cargas de `estados-390` y estas 2
ráfagas, van **36 cargas de campaña + 180 de sentada** a 390 sin un segundo
estado — y aun así **no se escribe «no existe»**, se escribe la cota.

> ⚠ **Estado: 2 de 3 ráfagas · UN SOLO DÍA. La ráfaga 3 tiene que caer OTRO DÍA
> (≥2026-08-04).** Aquí los dos días **no venían dados de antemano** como en
> `cqa6` —donde las ráfagas 1 y 2 ya aportaban 07-30 y 08-02—: si las tres caen
> el 08-03, **la campaña no cierra por muy separadas que estén**.

El `docH` y el `pie` sí se movieron (27 · 54). Es la familia **conocida** de
renglones del módulo «Artículos y Guías» (27 · 54 · 81), no la base de lectura:
**el `h1` dio 0 en las 6 combinaciones.**

**Hasta que cierre, el −30 de `/…-en-edar` a 390 sigue SIN PROBAR**, con esa
etiqueta: ni defecto ni limpio.

---

## 📅 PROGRAMADA · ráfaga 3 de `cqa6-390` — fecha mínima 2026-08-04

**NO se lanzó el 2026-08-03 aunque había hueco de sobra**, y la razón es el
criterio, no la agenda:

> Las ráfagas 1 y 2 son **las dos del 08-03** (09:39 y 11:58, separadas 2.31 h).
> Así que **el segundo día de la campaña depende ENTERA de la ráfaga 3**. Si
> cayera también el 08-03, la campaña tendría 3 ráfagas y **UN solo día**: no
> cierra, por muy separadas que estén.

Es la diferencia con `cqa6`, donde las ráfagas 1 y 2 ya aportaban dos días
(07-30 y 08-02) y la 3 podía caer donde quisiera.

```bash
# ≥2026-08-04, y ≥2 h de la última (11:58 local del 08-03 — sobra con el cambio de día)
RUTAS=/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas \
  CAMPANA=cqa6-390 npm run qa:ruido -- 3
```

**Con ella en vuelo: nada de `check` ni `build`** — le cambian el `.next` al
servidor por debajo y la corrida entera se descarta, porque no se sabe dónde
cayó el corte.

**Qué cierra:** el suelo de `h1` a 390 en esas 3 rutas, y con él el **−30 de
`/…-en-edar` a 390**, que sigue **SIN PROBAR** — ni defecto ni limpio. Recordar
que **no lo resuelven más cargas**: `estados-390` ya puso 180 sin ver un segundo
estado (cota <5 % por carga). Lo que falta es el eje de los **días**.

## CLASE · el ancho de MÓDULO — CAMPO en SECTOR, y dos defectos con número (2026-08-03)

Medición de desbloqueo de la precondición 2 de F2-1. Pre-registro
`clase/PRE-REGISTRO-ANCHO-MODULO.md` (`61a9e78`, **anterior a la sonda y a
medir**) · acta `clase/DECISION-ANCHO-MODULO.md` · evidencia
`medidas/clase-rango-{1440,390}.json` (`226c30f`) · esquema en `ESQUEMA-CMS.md`
§6c.1. Sonda nueva `clase-rango`, negativo entero 4/4 (`02d806d`).

**Alcance:** 12 rutas (4 SECTOR · 4 CASO · 2 FAQ · **2 MONOGRÁFICO de control**)
× 2 lados × 2 anchos = 48 cargas. 24/24 páginas por ancho · 0 selectores muertos
· control con varianza 2/2.

### Los DOS defectos, con su número

| # | ítem | original | clon | Δ @1440 | Δ @390 | dónde |
|---|---|---|---|---|---|---|
| **CL-1** | **`MapaProyectos`** — no cablea ancho, así que da 100 % | `90 %` · 1114.55 | `100 %` · 1238.39 | **+123.84** | **+33.55** (301.84→335.39) | **solo Industria** de los 4 sectores vivos |
| **CL-2** | `BeneficiosAplicaciones` `w-[80%]` en el `<h3>` | `80 %` | `80 %` | **0** | **0** | las 4 |

> **CL-2 no es defecto de píxel: es un CAMPO QUE FALTA.** El valor cableado es el
> correcto en 4/4, y por eso no se ve. Lo que está mal es que sea una clase de
> Tailwind en vez de un dato — se arregla en F2-1 declarando el campo, no
> tocando el componente.

**CL-1 es el que hay que arreglar, y es Bloque A** (después de F2-1). Existe solo
en Industria: *el detector de un ancho mal no fue otro ancho, fue otra
**INSTANCIA***. MONOGRÁFICO ya modela ese módulo con `anchoPct: 90`.

### ⚠ Un fleco del EMPAREJADOR, y es el que casi tapa CL-1

La pareja de `MapaProyectos` **no la casó la firma de texto por UN carácter**:
el original da `ProyectosportodoelmundoA…` (48 car. truncados, arrastra el texto
del módulo siguiente) y el clon `Proyectosportodoelmundo`. O sea que **el eje de
fidelidad no lo habría cantado ni con veredicto en ese nivel**; salió de leer el
lado del original. Es la clase C7 —emparejar por contenido con una definición de
«lo mismo» que no coincide— en su tercera forma. **Ficha abierta**: la firma
truncada a 48 caracteres cruza la frontera del módulo.

### Lo que queda SIN VEREDICTO, con esa etiqueta literal

**El nivel de MÓDULO y el de COLUMNA no tienen veredicto en el lado del CLON.**
El clon solo marca la **fila** (`data-fila`); en los otros dos su identidad es un
heurístico que **sobre-casa**: **66 «columnas» contra 27** y **102 «módulos»
contra 66** en el control. Consecuencia en los dos ejes de `clase-rango`:

- **fidelidad** — empareja el texto correcto en el **elemento equivocado**
  (`pctO 100 → pctC 31.18`, `wO 1238 → wC 386`): eso es *el NIVEL al que se
  mide*, no un defecto del clon;
- **rango** — un clon sobre-casado tiene **siempre** muchos valores distintos,
  así que `distintos.clon === 1` **no se cumple nunca** y el eje **no puede
  disparar**. Eso no es limpio: es **CIEGO**.

La sonda lo cuenta y lo grita: **26 celdas ruta×nivel SIN VEREDICTO**. Se cierra
marcando esos niveles en el clon (**`data-col` / `data-mod`**, los caminos ya
están puestos en la sonda), igual que `data-fila` cerró el nivel de fila para
`ancho-cuerpo`.

> ⚠ **Los `Δ0` de esta corrida son del nivel de FILA, 65 pares, y solo de ahí.**
> No se pueden citar como «el cuerpo de SECTOR está a Δ0».

### Lo que sí quedó cerrado, y no hay que reinvestigar

- **Los `4.84 / 10.25 / 16.33 / 17.89 %` NO son varianza de módulo**: son
  separadores de **`w = 60 px` exactos y sin texto**. Una sola decisión leída
  contra columnas de anchos distintos. **No los toques como si fueran anchos.**
- **La columna de SECTOR es la rejilla de Divi** (`29.67 · 47.25 · 64.83 · 100`):
  derivable del nº de columnas, **plantilla**.
- **La fila de SECTOR es `86 %`, más `95 %` en UNA**: la banda de clientes (firma
  vacía), idéntica en las 4 instancias y en los dos anchos. **Plantilla.**
- **Grupo C no tiene capa de builder.** FAQ trae **0** secciones propias
  (`faqs-template-default` · `et-tb-has-template`); CASO trae **1**, con 1 fila /
  1 columna / 1 módulo al valor por defecto. **No es un cero de instrumento**: el
  mismo código, en la misma pasada, devolvió 7 secciones en SECTOR y 8 en el
  control.

---

## ✅ CAMPAÑA `cqa6-390` · CERRADA (2026-08-04) — y el −30 se DISUELVE, no se convierte en defecto

**Ráfaga 3**, `medidas/campana/cqa6-390/rafaga-2026-08-04T06-44-12.json`,
`✓ evaluadas 18/18 cargas`. La sonda imprime el veredicto ella sola:

```
═══ CAMPAÑA «cqa6-390» — 3 ráfaga(s), 2 día(s)
  requisitos: ≥3 ráfagas (3) · ≥2 días (2) · separadas ≥2h (3)
  ✅ CAMPAÑA COMPLETA: el suelo de arriba ya se puede citar, con su fecha.
```

| combinación | `h1` (máx entre ráfagas) | posicional |
|---|---|---|
| `software`@1440 · EDAR@1440 · petróleo@1440 | **0** | 0 · 27 · 27 |
| `software`@390 · EDAR@390 · petróleo@390 | **0** | 0 · 54 · 27 |

El posicional (27 · 54) es la familia **conocida** de renglones de «Artículos y
Guías». **La base dio 0 en las 6.**

### ⚠ Pero el criterio pre-registrado NO se aplica, porque su premisa es FALSA

El criterio escrito el 2026-08-03 (§«El −30 de EDAR@390, tras esto») decía:

> *«Si esas dos cierran sin ver el ±30, el balance de evidencia queda: **un ±30
> observado una vez, sin fichero**, no reproducido en 180 cargas ni en 3
> episodios separados […] será suficiente para […] pasarlo a defecto con su
> ficha.»*

**«Sin fichero» es falso.** El ±30 a 390 está en `medidas/`, congelado y
**commiteado**, en dos rutas y por otra sonda — `c-cabecera`, que es justo la que
mide la base en crudo:

| ruta @390 | estado A | estado B | **Δ** | ficheros (los dos en git) |
|---|---|---|---|---|
| `/software-de-medicion-calidad-del-aire` | 308.58 | **338.58** | **30.00** | `c-cabecera-390-2026-07-31.json` ↔ `c-cabecera-390.json` (`82142e2`) |
| `/sectores/…-en-edar` | 189.39 | **219.39** | **30.00** | `c-cabecera-390.json` ↔ `c-cabecera-390-2026-08-01.json` (`cf253e9`) |

**Y el lado del clon, que es lo que lo cierra: no se movió.** EDAR da `clon
189.39` en las dos corridas, la del Δ0 y la del −30. El único valor que cambia
entre las dos es el del **original**.

### La adjudicación, y es la del −15.72 otra vez

> **El −30 de EDAR@390 nunca fue un defecto del clon: es el ORIGINAL en su
> segundo estado.** A 390 el original es **bimodal con Δ = 30 exactos**, igual
> que a 1440 lo es con Δ = 32.28. El clon está cableado a **un** valor, así que
> su lectura correcta es **Δ0 contra el estado dominante y −30 contra el raro** —
> la condición que `CLAUDE.md` ya describe para 1440, reproducida a 390.

Es literalmente el mecanismo que disolvió el −15.72: *«el −15.72 y el −48 nunca
fueron dos candidatos a objetivo: eran EL MISMO defecto medido contra los dos
estados»*. Aquí, **el Δ0 y el −30 son la misma medida contra los dos estados**, y
**la diferencia entre los dos «defectos» ES el suelo**.

### ⚠ EL SUELO DE 390, PUBLICADO CON SU FORMA — y con su alcance por RUTA

Completado el 2026-08-04 tras **barrer el archivo entero** en vez de citar los
dos ficheros que se habían abierto (regla 8b). Barridos: **las 324 congeladas**
más las **4 ráfagas** de campaña a 390 (`cqa6` ×1 + `cqa6-390` ×3).

**Un suelo se publica con su FORMA, no sólo con su número** (`CLAUDE.md`
§C-QA6): si tiene picos, **DISCRIMINA** — se compara contra los valores
admisibles, no contra el máximo.

| Δ del clon contra el original | lectura |
|---|---|
| **≈ 0** | el original en su estado **dominante**: el clon casa. **Limpio.** |
| **≈ 30** | el original en su estado **raro**: casa con el otro pico. **Limpio.** |
| **cualquier otro** | **DEFECTO — incluidos los MENORES que 30.** Un Δ de 12 o de 28 es un valor que el original **nunca ha producido** a este ancho, así que sólo puede venir del clon |

**Y el alcance NO es uniforme entre las tres rutas.** Es la parte que la primera
redacción de esta acta se saltó, y la que el barrido corrigió:

| ruta @390 | dominante | segundo estado | ¿forma establecida? |
|---|---|---|---|
| `/software-de-medicion-calidad-del-aire` | **308.58** | **338.58** (1 vez) | ✅ **bimodal, Δ 30** |
| `/sectores/…-en-edar` | **189.39** | **219.39** (1 vez) | ✅ **bimodal, Δ 30** |
| `/sectores/…-petroleo-y-gas` | **189.39** | **ninguno observado** | ❌ **NO establecida** |

> **Para petróleo@390 la tabla de lectura de arriba NO está autorizada.** Nunca
> se le ha observado un segundo estado, así que **no se sabe si lo tiene ni a qué
> distancia está**. Y **«no observado» no es «no existe»**: se escribe la **cota**
> —0 eventos en las cargas medidas ⇒ al 95 %, `3/n` por carga— no la ausencia.
> Que sus dos hermanas sean bimodales a 30 es **una razón para sospecharlo, no
> para afirmarlo**; en petróleo, hoy, **sólo Δ≈0 está respaldado como limpio**.

**Dónde vive cada evidencia, porque las dos fuentes no ven lo mismo:**

| fuente | qué aportó |
|---|---|
| **`c-cabecera`** (4 congeladas @390) | **los dos estados** — es la única que ha visto el raro, y en 2 rutas |
| **campaña `ruido`** (4 ráfagas @390) | **sólo el dominante** en las tres rutas, las 4 veces |
| **`estados-390`** (180 cargas, una sentada) | **sólo el dominante** en las tres |

O sea: **la campaña que se montó para dirimir esto nunca vio el fenómeno**, y lo
vio la sonda que no lo estaba buscando. Es la regla 8b con nombre y apellidos.

**Consecuencia sobre la ficha de §C5:** el −30 sale de **SIN PROBAR** y **no
entra en defecto**. Queda como **estado del original**, con la regla de lectura
de los suelos bimodales: un **+30** en una corrida futura de EDAR@390 **no es una
regresión**, es el otro pico. Y **cualquier otro valor sí es defecto**, incluidos
los menores de 30 — un suelo bimodal DISCRIMINA, no acota.

### Lo que la campaña sí compró, dicho con precisión

No fue el número: fue **poder mirar**. Las 3 ráfagas dieron `h1` 0 en las 6
combinaciones, o sea que **dentro de la campaña el original se quedó en el estado
dominante las 9 cargas @390**. Eso, con las 180 de `estados-390`, mantiene la
**cota** de antes —el estado raro es **poco frecuente**, no inexistente— y ahora
además está **exhibido**, que era lo único que faltaba.

> **Y el eje que cerró no es el que se creía.** La campaña se pagó por el eje de
> los **días**; lo que dirimió la pregunta fue **el archivo**. Ver la lección de
> abajo.

### ⚠ LA LECCIÓN, y es de método: `medidas/` ES UNA MUESTRA DEL ORIGINAL Y NADIE LA CONSULTÓ

La regla 7 ya dice que `medidas/` es *«la prueba, no un caché»*. Le faltaba la
vuelta, que es la que costó una campaña de dos días:

> **Toda medida congelada de un PAR contiene una muestra del original en esa
> ruta y ese ancho.** O sea que el suelo de ruido **no vive solo en los ficheros
> de la campaña de ruido**: vive en las 324 congeladas. Preguntar «¿cuántos
> estados ha tenido esta ruta?» es un `grep` sobre lo que ya está en git, y
> **nadie lo hizo** — ni al declarar el −30 SIN PROBAR, ni al escribir el
> criterio pre-registrado que afirmaba «sin fichero».

Las dos mitades operativas:

1. **Antes de abrir una campaña de ruido para una ruta, se barre el archivo de
   esa ruta y ese ancho.** Es gratis, está commiteado, y aquí tenía **las dos
   respuestas**.
2. **Un criterio pre-registrado también se audita contra la salida servida.** El
   de §«tras esto» afirmaba un hecho negativo —*«sin fichero»*— que **no se
   comprobó al escribirlo**. Pre-registrar protege de decidir por cansancio; **no
   protege de partir de una premisa falsa**, y una premisa falsa dentro de un
   pre-registro es peor que fuera, porque llega blindada contra la revisión.

**Lo que habría costado no mirar:** el criterio habría convertido un **no-defecto
en «defecto con su ficha»**, y la tanda siguiente habría salido a cazar en el
clon un bug que no existe — con el agravante de que el clon **ya está a Δ0 contra
el estado dominante**, así que «arreglarlo» habría sido moverlo al estado raro.
Eso es exactamente una **FAMILIA DE CALIBRACIÓN** fabricada a mano.

### Y el ±30 de la ráfaga A queda corroborado, sin necesitar su fichero

La ráfaga A del 2026-07-30 midió `±30` en las tres rutas @390 y **su fichero se
borró a mano** (§regla 5). Hoy ese número **está respaldado por otras dos
congeladas que sí existen**, y en dos rutas. No lo rehabilita —sigue sin poder
exhibirse— pero **deja de ser el único apoyo de nada**: la pregunta que abrió ya
está contestada por evidencia que nunca se borró.

## ✅ F3-1-ESCALON-TIPOGRAFIA · CERRADO (2026-08-10) — no eran tres pieles: era UN defecto y DOS overrides, y el discriminador SÍ estaba servido

> **La ficha original queda entera abajo**, porque su razonamiento es correcto en
> todo menos en una cosa, y esa cosa es la que enseña.

### Qué faltaba mirar

Los diez ejes que la sonda recorrió son **atributos y estructura**. Ninguno era
CSS. Y Divi **no escribe marcado: COMPILA CSS**, y lo sirve en el mismo
documento. Leído con `npm run qa:pieles` (nueva, 573 páginas del corpus):

```
.et_pb_text_1 h2                   { font-weight:700; font-size:45px }
.et_pb_text_3 h2,.et_pb_text_5 h2  { font-weight:300; font-size:44px; line-height:1.25em }
@media (max-width:980px) y (max-width:767px) { … h2 { font-size:35px } }
.et_pb_text_6 h3,…                 { color:#0C71C3!important }
```

**Reconstruido módulo a módulo, y cierra 1:1:** los 3 `h2` de `37/37` son
`text_13` de `como-garantiza` y `text_5`/`text_14` de `que-es-kunak-air` — **los
únicos cuyo módulo no lleva regla de `h2`**. Igual los 4 `h3` de `#333`: sin
regla. O sea:

> **No había tres pieles de `h2`: había el DEFECTO DEL TEMA (37/37 w300) y DOS
> overrides por módulo.** Y el `h3` no tenía dos pieles: tenía el defecto
> (32/32 #333) y **un override que sólo toca el color**.

### La causa de fondo, y es una que ya está en `CLAUDE.md`

La ficha decía que el discriminador «no está servido». Estaba: en el `<style>`
del propio documento. Lo que llevó al error fue una frase del esquema
(`MODULO_TEXTO_KB`) que era **premisa cierta con conclusión falsa**:

> *«`estiloInline` es `null` en los 85 módulos: el editor no tocó ni la
> interlínea ni el ancho en ninguno.»*

`estiloInline` es el atributo `style=`, y **Divi no lo usa**. Medir su ausencia
para concluir «el editor no tocó» es **medir al nivel que absorbe** (§El NIVEL al
que se mide), con el agravante de que la frase citaba una medida real. Lo servido
dice que el editor tocó la tipografía **en 89 sitios** de esos 85 módulos.

### Y hubo un SEGUNDO escalón, que la sonda nueva se tragó primero

`qa:pieles` informó **«0 overrides en `blurb`»** mientras `modulos.spec.md` §2
tenía medidas **TRES pieles** del titular de blurb. Las dos no podían ser
verdad, y ganó la spec: **Divi compila la piel del blurb contra
`.et_pb_module_header`**, no contra `h4` —el nivel es un ajuste aparte—, y
`ES_TITULAR` sólo casaba `h[1-6]`. Corregido, salen **216 reglas de blurb en una
sola página** y las tres pieles reaparecen exactas (`18/21.6 w700` ×24 con
`16/19.2` a 390 · `18/21.6 w300` ×9 · `18/18 w600` ×3).

> §sondas 4 en su forma pura: **un cero que significaba «no miré»**. Lo delató
> **contradecir una medida buena anterior**, que es el control que no siempre se
> tiene.

### Lo que las dos preguntas de población contestaron, con número

| | pregunta | respuesta derivada |
|---|---|---|
| **(a)** | ¿es CERRADO el conjunto de pieles? | **NO** — 14 en KB contra **43 en el corpus**; `font-size` ∈ {18·20·21·23·32·35·37·**44.1**·44·45·50}, y la misma piel aparece en `h1`, `h2` y `h3` ⇒ **no es propiedad del nivel** ⇒ enum descartado, **propiedades** |
| **(b)** | ¿existe FUERA de KB? | **SÍ, y KB es la minoría**: de 1456 reglas, **1272 están fuera** (productos 827 · sectores 291 · listados 126 · sueltas 148 · hubs 56 · **KB 184**) |

**Por (b) el arbitraje cambió de sitio, como la consigna anticipaba:** el campo
**no es de `articulos-kb`** — es del módulo de texto **compartido**, que estaba
infra-especificado igual que lo estaba `inline` (§2d.3). Se define **una vez** en
`campos/comunes.ts` y lo consumen `MODULO_TEXTO` (compartido) y
`MODULO_TEXTO_KB`.

### La forma, y de dónde sale cada decisión

- `titulares`: **array por nivel** en módulos de texto (Divi da 6 controles);
- `piel`: **grupo** en el blurb (Divi da 1 control, y el nivel va aparte);
- `fs` en **px** (1456/1456), `lh` en **em** (razón; 499/499, cero en px),
  `fw` **número** y no enum de los cuatro vistos (catch 1 de `MODELO.md` §2),
  `align` **select cerrado por el CONTROL de Divi** (4 valores; 2 ejercitados),
  `movilFs` **uno solo** porque `@980` y `@767` traen **el mismo valor en las
  323** y ninguna sin base;
- el **defecto** no vive en el campo: vive en `titularPorDefecto()`
  (`defaults.ts`), que **tira** ante un nivel sin medir.

**El defecto del blurb se derivó de las OMISIONES**, no de un módulo sin regla
(los 36 llevan): la piel de ×3 escribe *sólo* `font-weight:600` y computa
`18/18` ⇒ `fs`=18 y `lh`=1; la de ×9 no escribe peso y computa `w300` ⇒
`fw`=300. **Cada omisión de una regla es la medida del defecto de esa
propiedad**, y la guarda que lo prueba es que **ninguna de las tres pieles
extraídas escribe `fs`**.

### `align` NO se deriva del computado, y eso lo enseñó un caso

El `h2` de `text_13` computa `text-align: center` y **ninguna regla lo explica**:
viene de `style="text-align: center"` **dentro del campo rico**. Es contenido del
editor de texto, no ajuste del módulo, y ya viaja verbatim en `html`. Escribirlo
como campo habría **duplicado el dato**, con las dos copias divergiendo en cuanto
alguien editara el cuerpo. Es la frontera de `CLAUDE.md` sosteniéndose sola.

De ahí la guarda que lo convierte en fallo visible en vez de riesgo silencioso:

> **Todo override que el computado ve y ninguna regla del CSS servido explica se
> nombra.** Es lo que hace que *«la captura no tiene las 19 hojas externas»* deje
> de ser un riesgo callado. Sabotaje `piel-align` en el test en negativo.

### Estado

Campo, migraciones versionadas (`20260810_164348` · `20260810_171434`, **3
`CREATE TABLE` + 6 `ADD COLUMN`, cero `ALTER` sobre columna existente** ⇒
retrocompatible probado por el diff) y **re-siembra hecha y verificada en DB**:
21 filas de `titulares` y 36 pieles de blurb, las seis exactas.

**Lo que NO se hizo, y es lo siguiente:** la plantilla y la ruta (PASO 4) y el Δ0
(PASO 5). Ver §F3-1-PIEL-FUERA-DE-KB y §F3-1-PIEL-CUERPO-KB.

---

## ⛔ (histórico) F3-1-ESCALON-TIPOGRAFIA · el `h2` tiene TRES pieles y NADA de lo servido las distingue (2026-08-10)

Aparece al escribir la plantilla de `articulos-kb`, que es cuando la pregunta se
hace por primera vez. `modulos.spec.md` §1.1 **había medido** que el `h2` tiene
más de una piel y lo dejó escrito. Lo que la spec no contestó, porque no era su
pregunta, es la que necesita el componente: **¿con QUÉ las separa?**

Sonda: `npm run qa:kb-tipografia` · `medidas/kb-tipografia.json` · 30 titulares.

| etiqueta | pieles medidas | veredicto | discriminador servido |
|---|---|---|---|
| `h2` | `45/45 w700` x6 · `44/55 w300` x11 · `37/37 w300` x3 | **CAMPO (test B)** | **NINGUNO de los 10 ejes** |
| `h3` | `32/32 w300 rgb(12,113,195)` x4 · `32/32 w300 #333` x4 | **CAMPO (test B)** | **NINGUNO establecido** |
| `h4` | `26/26 w300` x2 | una piel | — |

**Test B con nombre y apellidos:** `como-garantiza-kunak-la-mejor-precision` trae
`44/55` **y** `37/37` en la misma página (f3c0m0 y f6c0m0 contra f6c0m4), y
`que-es-kunak-air-cloud` trae los dos colores de `h3`. Dos hermanos con valores
distintos ⇒ lo escribió una persona.

**Los diez ejes que se miraron, y ninguno separa:** `style=` y `class=` de la
propia etiqueta dentro del campo rico · las clases del módulo · `estiloInline`
del módulo · reparto de la fila · posición en la columna · nº de fila · `mb` ·
`mt` · etiquetas vecinas. Los tres módulos son, hasta el último atributo
servido, **indistinguibles**.

> **El único rastro es `et_pb_text_N`, y no cuenta.** Es el gancho con el que
> Divi cuelga el CSS compilado de los ajustes de ESE módulo — o sea **la huella
> del campo que falta**, no un dato: `N` es el ordinal del módulo en la página y
> no significa nada fuera de ella. Aceptarlo sería cablear la piel a la
> posición, con la instancia siguiente por delante.

### La trampa que la sonda tuvo que esquivar

La primera versión dio **`fila` y `mb` como discriminador del `h3`** — y es
falso. Las dos pieles del `h3` viven en **una sola página**, así que *cualquier*
eje posicional las separa por accidente: los 4 de un color caen antes que los 4
del otro. Es la regla de sondas 4 en su tercera cara —*un detector que encuentra
más de lo que hay da un número plausible de más*—, y habría producido una
plantilla que cablea el color a la fila.

> **Un discriminador hallado en UNA página no es un discriminador.** La sonda
> exige ahora que la separación se sostenga en **2 páginas o más** y, si no,
> reporta **NO ESTABLECIDO** con su denominador.

### Qué decide, y por qué la tanda para aquí

`texto-kb` guarda `html` + ritmo + `anchoPct`, y **ninguno expresa la piel del
titular**. §2d.5 concluyó que `lh` no hacía falta en este módulo; la conclusión
se derivó de la interlínea de los **párrafos** y **no se comprobó sobre los
titulares** — es la regla de la regla derivada sobre un dominio donde el caso no
se da, otra vez.

Servir hoy pintaría **3 `h2` a `44/55` donde el original pone `37/37`** y **4
`h3` en el color equivocado**. El Δ tendría causa conocida: medirlo no informa y
tapa lo que sí. Por eso **no hay CSS de titulares ni ruta emitida** — escribirlos
exige *elegir* una de las tres pieles, que es el arreglo falso con otro disfraz.

**Lo que hay que decidir (no se improvisa aquí):** si `texto-kb` gana un campo de
piel del titular —y con qué forma: `fs`/`lh`/`color` sueltos, un enum de pieles,
o el ajuste por módulo tal cual lo escribe Divi— y cómo lo deriva el extractor,
que **sí puede**: la piel está en `kb-spec-{1440,390}.json`, que es estilo
computado. El coste es un campo, una migración y una re-siembra.

**Dueño:** la tanda que retome F3-1 PASO 4.

## ⚠ F3-1-PIEL-FUERA-DE-KB · 1272 overrides de titular medidos y NO extraídos (2026-08-10)

El campo `titularesModulo` está **declarado** en `MODULO_TEXTO` (el compartido) y
**no poblado** fuera de `articulos-kb`. El hueco está medido, con su número:

| colección | reglas de titular en capa propia | páginas | consume `MODULO_TEXTO`? |
|---|---|---|---|
| `productos` | **827** | 24/24 | **sí** |
| `sectores` (SECTOR + MONOGRÁFICO) | **291** | 8/8 | **sí** |
| `sueltas` | 148 | 8/20 | aún no modeladas |
| `listados` | 126 | 12/149 | F3-2 |
| `hubs-kb` | 56 | 7/7 | F3-2 |

Sonda: `npm run qa:pieles` · `medidas/pieles-modulo.json`.

**Por qué no se pobló en esta tanda, dicho con precisión:** el extractor del
monográfico lee `style=` del nodo, y **estos valores no viven ahí** — viven en el
CSS compilado. Extraerlos exige el mismo movimiento que se hizo para KB (leer el
CSS servido, cruzarlo contra el computado a dos anchos) **más** su round-trip, y
eso se prueba, no se hace de paso. Es la misma razón por la que §2d.3 no tocó
`inline`, aplicada consistentemente.

> ⚠ **Y hasta entonces es un CAMINO DE RENDER SIN ESTRENAR declarado**, no un
> campo soportado: `qa:nunca-vistos` lo cuenta. Lo que **sí** está probado es que
> declararlo no rompe nada — la migración es aditiva pura y los 2 monográficos y
> 9 productos ya sembrados siguen válidos con el campo ausente, o sea con el
> defecto del tema, que es lo que hoy renderizan.

**Y lo que esto predice, que es lo aprovechable:** si el monográfico tiene 291
overrides de titular sin modelar, es probable que su Δ contra el original tenga
una componente tipográfica que hoy se atribuye a otra cosa. **No está medido** —
se dice como hipótesis con su origen, no como hallazgo.

**Dueño:** la tanda que extraiga el cuerpo de SECTOR/MONOGRÁFICO contra el CSS.

## ⚠ F3-1-PIEL-CUERPO-KB · el módulo de texto también tiene piel PROPIA, y no tiene campo (2026-08-10)

Además de la piel de sus titulares, el propio módulo de texto lleva overrides
tipográficos **sobre su cuerpo**, y en KB son **7 pieles distintas**:

```
{ color:#0075c9!important }                                              ×12
{ font-size:15px; font-weight:800; letter-spacing:0.1px }                ×12
  └ @980 y @767 { font-size:13px }                                       ×12+×12
{ font-family:'Manrope'; font-size:25px; line-height:1.2em }             ×11
  └ @980 y @767 { font-size:35px }                                       ×11+×11
```

Casan con `modulos.spec.md` §1.1: el `p` (etiqueta azul) a `15/30.6 w800 ls
0.1px rgb(0,117,201)` que a 390 pasa a **13**, y el `p` (claim) a `25/30` que a
390 pasa a **35**.

**No se modela en esta tanda, y la razón es que falta la mitad de la medida:** el
campo `lh` del módulo compartido existe con defecto `30.6`, pero **contra qué
defecto se compara `font-size`, `letter-spacing` y `color` del cuerpo aquí no
está derivado** — y derivarlo es exactamente el trabajo que se acaba de hacer
para los titulares (encontrar los módulos sin regla). Modelarlo sin eso
produciría campos con el defecto dentro, que es el §1.5 al revés.

**Dueño:** la tanda que cierre el Δ0 del cuerpo de KB (PASO 5), porque es donde
se va a ver.

## ⚠ HTML-CMP-NO-REPRODUCIBLE · dos builds seguidos del mismo árbol dan 31/31 rutas distintas (2026-08-10)

Al verificar que la extracción de `CascaronTb` no movía nada, `qa:html-cmp` salió
**31 de 31 con el marcado visible distinto**, y **también con los nombres de
chunk quitados** (`visibleSinChunks`). Congelado en
`medidas/html-cascaron-antes.json` y `-despues.json`, dos builds del mismo día.

**No es el cambio, y basta un control para saberlo:** entre las 31 están **`/` y
`/accesorios`, que no importan el fichero tocado**. Los deltas de bytes son
`±43` en 8 rutas **con los dos signos** y `0` en las otras 23 — la firma de algo
del build, no de una edición.

> Es la regla de sondas 4 tal cual: **31 de 31 no es un hallazgo, es el
> instrumento.** Un comparador que encuentra defecto en el 100 % de lo que mira
> está comparando dos cosas que no son la misma.

**Consecuencia operativa:** `qa:html-cmp` **no puede adjudicar hoy** un cambio de
render en este entorno — su umbral es cero y el suelo no lo es. Cualquier
afirmación de tipo *«este refactor no movió nada»* respaldada en él es una
afirmación **sin medida**, y así queda etiquetada la de `CascaronTb`.

**Lo que NO se sabe todavía, dicho para que no se lea de más:** de dónde sale la
variación. No se ha aislado si es el `BUILD_ID`, un nonce, un orden de módulos
del bundler o un `updatedAt` que llega al payload RSC. **Sin esa causa tampoco se
puede afirmar que el suelo sea inocuo** — podría estar tapando un cambio real.

**Dueño:** la tanda que necesite volver a usar `html-cmp` como puerta. El primer
paso es barato: **dos builds SIN tocar una línea** y comparar. Si salen 31/31, el
suelo es del build; si salen 0/31, lo de hoy sí era la edición y esta ficha se
cae.
