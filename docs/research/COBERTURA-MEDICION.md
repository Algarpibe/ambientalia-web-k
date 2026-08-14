# Cobertura de medición — qué se ha comparado contra el original y qué no

> ⛔ **LEE ESTO ANTES DE LA MATRIZ (2026-08-14, 70.ª tanda). LOS EJES SE CUENTAN
> EN RUTAS, Y UNA RUTA DE LISTADO NO ES UNA PÁGINA.** Declarado con su número en
> `PENDIENTES-QA.md` §F3-LH-ALCANCE-PAGINA-1 y derivado en `qa:lh-alcance`
> §`alcanceReal`:
>
> | | n |
> |---|---|
> | páginas del original en las series de listado | **149** (84 con contenido) |
> | páginas que `qa:lh-cmp` compara | **13**, y **las 13 son la página 1** |
> | posiciones **nunca comparadas a ningún ancho** | `intermedia` **86** · `última` **28** |
> | clases de `qa:lh-serie` que se tocan | **11 de 38** → **27 ciegas**, **122 páginas** |
>
> **O sea que un `✓` de `base`, `árbol`, `filas` o `módulos` en una ruta de
> listado quiere decir «la página 1 de esa ruta», no «esa ruta».** La matriz
> cuenta rutas porque los demás arquetipos son una página por ruta; los listados
> **no lo son**, y la unidad se declaró en `qa:lh-serie` con veredicto literal
> **«LA SERIE NO ES UNA UNIDAD»**.
>
> ⚠ **Y el `·` de las `/page/N` sigue sin ser neutro: es donde han aparecido los
> DOS últimos defectos de plantilla**, uno por tanda —la piel A en la 68.ª, la
> piel B en la 69.ª—. La diferencia con lo que decía esta cabecera hasta hoy es
> que ahora el hueco tiene **denominador**: no es «hay `/page/N` sin mirar», es
> **114 páginas en dos posiciones que ninguna sonda de dos lados ha abierto
> nunca**.

> ⏸ **NO SE MOVIÓ el 2026-08-14 (69.ª tanda, la del ALCANCE de las specs), y es
> POR CONSTRUCCIÓN — re-derivada y comprobada IDÉNTICA a la congelada, no
> supuesta.** La matriz sigue en `base` **38** · `árbol` **38** ·
> `comportamiento` **37** · `docH` **31** · `enlaces` **31** · `anchos` **22** ·
> `filas` **13** · `módulos` **9** · `offsets` **0 (3 en `c`)**, sobre **363**
> rutas.
>
> **La tanda no emitió ninguna ruta ni comparó geometría nueva**: su instrumento
> (`qa:lh-huecos`) es un **censo del corpus congelado** cruzado con
> `lh-spec-{1440,390}.json`, no un comparador de dos lados. Acreditarle un eje
> sería §*la cobertura declarada al nivel de arriba* con el contenedor más cómodo
> que hay — **el hecho de que la tanda midió algo**.
>
> ⚠ **Y hay una consecuencia que sí toca a esta tabla, aunque el número no se
> mueva:** el defecto de la piel B (§F3-LH-PIELB-VENTANA) vivía **entero en las
> 23 rutas `/etiqueta/*/page/N`**, y esas rutas están en la matriz con **`·` en
> todos los ejes**. O sea que **el «·» no era neutro: escondía un defecto de
> plantilla en 31 de 38 instancias medibles.** El espejo mide **la página 1 de
> cada forma**, así que ninguna `/page/N` tiene referencia — y es la **segunda**
> tanda seguida que encuentra un defecto ahí (la 68.ª, el `« Anterior` de la piel
> A). **Dos de dos: el hueco de las `/page/N` ya no es teórico.**
>
> > ⚠ **CORREGIDO 2026-08-14 (70.ª tanda): «el espejo mide la página 1» era
> > cierto y NO es la explicación del verde.** Cruzadas las 43 instancias **por
> > ruta**, el comparador tenía **3** en su universo y **comparó UNA**
> > (`etiqueta/calidad-del-aire`, 1 de 4): las otras dos son `L2`, **AUSENTE**. Y
> > esa única instancia **no separa los dos modelos**. El verde no vino de mirar
> > sólo páginas 1 — vino de **0 instancias SEPARADORAS**, que es un número
> > distinto y más pequeño. Ver §F3-LH-ALCANCE-PAGINA-1.

> ⏸ **NO SE MOVIÓ el 2026-08-14 (67.ª tanda, la de la DECISIÓN de `padre`), y
> es POR CONSTRUCCIÓN — escrito después de mirarlo, no supuesto.** La tanda no
> emitió ninguna ruta (siguen **345**) ni comparó geometría: su instrumento
> (`qa:lh-jerarquia`) es un **censo del corpus congelado** y un cruce con el
> esquema, no un comparador de dos lados. **Acreditarle un eje sería §la
> cobertura declarada al nivel de arriba con el contenedor más cómodo que hay:
> el hecho de que la tanda midió algo.**
>
> Lo único que cambia es una **precondición** de la siguiente: la línea base del
> clon a los dos anchos queda congelada en `clon-base-{1440,390}-f33-padre-antes`
> (345 · 345 rutas), porque arreglar §F3-LH-EXTRACTOR-PREFIJO-CABLEADO **mueve
> el contenido de 9 rutas ya emitidas**.

> ✅ **RE-DERIVADA 2026-08-13 (66.ª tanda, la que CONSTRUYE `L1-blog` y
> `L1-etiqueta`). La matriz SUBE en cinco ejes y el denominador sube con ella —
> las dos cosas a la vez, que es lo que hay que leer junto.**
>
> | eje | antes (302 rutas) | ahora (345 rutas) | quién lo paga |
> |---|---|---|---|
> | comportamiento | 37 | 37 | — |
> | **base cruda (`h1.y`)** | 31 | **34** | `c-cabecera` · **`lh-cmp`** |
> | **árbol secciones** | 31 | **34** | `c-cmp` · **`lh-cmp`** |
> | docH | 31 | 31 | `c-cmp` |
> | enlaces | 31 | 31 | `enlaces` |
> | **anchos horiz.** | 15 | **18** | `c-banda` · `a-miga` · **`lh-cmp`** |
> | **filas** | 6 | **9** | **`lh-cmp`** · `tree-cmp` · `mono-cmp` |
> | **módulos** | 2 | **5** | **`lh-cmp`** · `mono-cmp` |
> | offsets/holgura | 0 (3 en `c`) | 0 (3 en `c`) | — |
>
> **`filas` y `módulos` son los que más se mueven en relativo** —×1.5 y ×2.5—, y
> es coherente con lo que la sonda hace: compara el árbol del cuerpo nodo a nodo.
>
> ⚠ **`docH` y `enlaces` NO suben, y eso es deliberado, no un olvido.**
> `lh-cmp` tiene `docH` en su `IGNORAR` (no lo compara) y su `href` se mide
> contra el **CORPUS**, que es otra pregunta que la de `enlaces.mjs` (contra las
> rutas que el build emite). **Acreditar un eje que la sonda no compara sería
> §la cobertura declarada al nivel de arriba con el contenedor más cómodo de
> todos: el nombre de la sonda.**
>
> **Y las 42 rutas `/page/N` entran al denominador en `·`, todas.** El espejo
> mide la página 1 de cada forma, así que la paginación está **emitida y sin
> comparar** — se dice aquí para que «43 rutas nuevas» no se lea como «43
> verificadas»: son **3**.
>
> **Lo que la predicción de las tres tandas anteriores acertó a medias:** decía
> *«cuando F3-2 construya, esta matriz se va a hundir»*. El denominador subió de
> 302 a 345 (+43) y la cobertura subió en 5 ejes — no se hundió porque **la
> tanda que construyó trajo su comparador de dos lados en la misma tanda**, que
> es exactamente lo que §UN ARQUETIPO NUEVO NO HEREDA COBERTURA pide. Las que se
> hundieron fueron las que sembraron sin comparar.

> ⚠ **RE-DERIVADA 2026-08-13 (2.ª tanda de construcción) — sin movimiento, y eso
> es lo esperado: esta tanda no construyó rutas.** `qa:cobertura` sobre las
> **302** emitidas: `comportamiento` **37** · `docH`/`base cruda`/`árbol`/
> `enlaces` **31** · `anchos` 15 · `filas` 6 · `módulos` 2 · `offsets` 0.
>
> **Y la declaración que lleva cuatro tandas escrita, otra vez y con la misma
> frase: cuando F3-2 construya, esta matriz se va a hundir, y NO será una
> regresión.** Entrarán decenas de rutas de listado sin una sola medida contra el
> original — el denominador crece antes que la cobertura, por construcción.
>
> **Lo que sí cambió es de otro eje y no está en la matriz:** el **canal de CSS**
> de las 13 páginas de listado pasa de incompleto a **completo (13/13)**, y con
> él las tres pieles de `h1` dejan de ser *números replicados* para ser **reglas
> servidas** (§F3-LH-PIELES-EXHIBIDAS). Eso no sube ninguna celda —no es una
> comparación de geometría— pero es lo que permite **cablearlas sin inventar**.

> ⚠⚠ **ACTUALIZADO 2026-08-13 (tanda de CONSTRUCCIÓN) — LISTADOS ESTRENA
> COMPARADOR, y su primera lectura es 0.**
>
> | eje nuevo | qué compara | estado hoy |
> |---|---|---|
> | **listados · par a par** | las 13 páginas de las 9 formas, nodo × propiedad, contra `lh-spec` | **13 AUSENTES · 0 pares comparados** |
>
> **Y ese 0 es el dato, no un hueco de la matriz:** el clon no emite ninguna ruta
> de listado (404 en las 13, verificado también desde el manifiesto). El
> comparador se escribió **antes** que la plantilla a propósito — §UN ARQUETIPO
> NUEVO NO HEREDA COBERTURA— así que su rojo de hoy mide **el trabajo que queda**,
> no una regresión.
>
> **Lo que sí se pagó:** la **línea base** del clon a 1440 sobre las **302 rutas**
> (302 páginas · 0 errores), que es el «antes» que la tanda de construcción
> necesitará para adjudicar cualquier cambio a componente compartido.
>
> ⚠ **Y sigue en pie la declaración de hace tres tandas: cuando F3-2 construya,
> esta matriz se va a hundir otra vez, y NO será una regresión** — entrarán
> decenas de rutas de listado sin una sola medida contra el original, igual que
> pasó al sembrar. El denominador crece antes que la cobertura, por construcción.

> ⚠⚠ **ACTUALIZADO 2026-08-13 (tanda de T9) — el denominador sube de 252 a 302,
> y entra un CANAL que ningún eje de esta matriz leía: el CSS ENLAZADO.**
>
> | | antes | ahora |
> |---|---:|---:|
> | rutas emitidas por el build | 252 | **302** |
> | de ellas, en la matriz de 9 ejes | 37 | **37** |
> | ⛔ sin una sola medida contra el original | 215 | **265** |
>
> Las 50 nuevas son la población que cerró la tanda anterior (`productos` 9 → 19,
> `casos` 4 → 57). Entran en `·` en los nueve ejes, como las 215 anteriores:
> **poblar no es medir**, y el denominador crece más deprisa que la cobertura.
> Derivado hoy: `qa:manifiesto` **302 rutas · 13 familias · 0 vacías**.
>
> **El canal nuevo, y por qué no es un eje más:** los nueve ejes miden geometría;
> el eje `cuerpo` (abajo) mide el dato que entra. **Ninguno de los diez leía el
> CSS que el documento ENLAZA** — sólo el `<style>` en línea. Y ese canal es el
> que decide si una clase tiene render.
>
> | | antes | ahora |
> |---|---:|---:|
> | hojas CSS enlazadas por el corpus | **0 capturadas** de 505 | **7** de 505 |
> | páginas que enlazan `et-core-unified` (CSS unificado de MÓDULOS) | — | **573 de 782** |
>
> **Lo que compró:** la cuarta condición de T9 —el NO-OP al píxel— pagada **por
> mecanismo** (`qa:t9-css`: 0 de 44 clases con regla en 8 canales, control vivo,
> negativo 4/4). **Lo que destapó:** §F3-CSS-CANAL-PIELES — `qa:pieles` corre
> offline sobre un canal de los dos, así que sus **presencias** valen y sus
> **ceros y conjuntos cerrados** están SIN PROBAR. No es un defecto medido: es
> una pregunta que antes de esta tanda no se podía ni formular.
>
> ⚠ **Y la lectura que NO hay que dar:** capturar hojas **no** habilita medir
> píxeles offline (§F3-1-CSS-NO-CAPTURADO sigue abierta para eso — faltan
> fuentes, URLs absolutas y la campaña de equivalencia). *Leer* CSS y
> *renderizar* con CSS son dos usos, y sólo el primero está comprado.

> ⚠ **ACTUALIZADO 2026-08-13 (tanda de PIPELINE) — el denominador sube de 232 a
> 252, y aparece un EJE que esta matriz no tenía.**
>
> | | antes | ahora |
> |---|---:|---:|
> | rutas emitidas por el build | 232 | **252** |
> | de ellas, en la matriz de 9 ejes | 37 | **37** |
> | ⛔ sin una sola medida contra el original | 195 | **215** |
>
> Las 20 nuevas son **17 `faqs`** (de 2 a 19) más 3 de reparto. Entran en `·` en
> los nueve ejes, como las 195 anteriores.
>
> **Lo que sí se midió, y hay que leerlo con su alcance:** `clon-base --cmp` a
> **1440 y 390** da **232 páginas · 0 con regresión** en los dos anchos tras
> reescribir T7 —**1788 enlaces tocados**—. Eso es **clon contra clon**.
>
> ⚠⚠ **Y EL EJE QUE FALTA, que esta tanda estrenó y esta matriz no contempla: el
> CUERPO.**
>
> Los nueve ejes miden **geometría y estructura de la página servida**. Ninguno
> mira **el dato que entra**. Y ahí había un cero perfecto: el control de
> `extractor-a` comparaba **18 campos y ninguno era `cuerpo`**, o sea que el HTML
> que T1–T8 produce llevaba **desde F2-2 sin compararse contra nada** — con su
> verde puesto.
>
> | eje nuevo | qué compara | estado hoy |
> |---|---|---|
> | **cuerpo · grupo A** | el HTML de T1–T8 contra la transcripción a mano, por CLASES adjudicadas | **14 de 209** cuerpos · 0 discrepancias no declaradas |
> | **cuerpo · grupo C** | ídem, por región | **6 de 76** documentos · 0 discrepancias |
>
> **Y el denominador de ese eje se declara al lado del numerador, porque es
> pequeño:** 14 y 6 son los que tienen transcripción a mano. Lo que compra un
> control **no es qué fracción cubre, sino cuántas FORMAS ejercita** — pero eso
> se escribe, no se da por sabido.
>
> **Es §el séptimo contenedor con nombre nuevo:** la matriz declaraba su
> cobertura en la unidad *ruta × eje geométrico*, y esa unidad **absorbía
> entero** un eje que no estaba en la lista. Un eje ausente de la matriz no sale
> como hueco: **no sale**.

> ⚠⚠ **EL DENOMINADOR SE MULTIPLICA POR 6 (2026-08-12, 58.ª tanda) — y esto SÍ
> es el hundimiento anunciado, aunque llegue por otra puerta.**
>
> La tanda anterior escribió que *«el día que entren las 142 rutas la matriz
> tiene que hundirse, y ese hundimiento es lo esperado»*. **No entró ninguna
> ruta de listado y la matriz se hunde igual**, porque lo que entró fue la
> POBLACIÓN: `entradas-blog` 7 → **149**, `terminos-kunakpedia` 3 → **37**,
> `documentos-cientificos` 4 → **23**.
>
> | | antes | ahora |
> |---|---|---|
> | rutas emitidas por el build | **37** | **232** |
> | de ellas, en la matriz de 9 ejes | 37 | **37** |
> | ⛔ **sin una sola medida contra el original** | 0 | **195** |
>
> **Las 195 nuevas están en `·` en los NUEVE ejes.** No es una regresión: es que
> existían como dato y ahora existen como página, y ninguna sonda las ha mirado.
> Y conviene decirlo con la forma que este documento ya usa: **la diferencia
> entre «no hay defecto conocido» y «no se ha mirado» no está en ningún otro
> sitio del repo**, y hoy 195 de 232 caen en la segunda.
>
> **Lo que NO cambia, y es lo que hace citable el resto:** las 37 que sí estaban
> medidas **no se han movido** — `clon-base --cmp` a los dos anchos contra la
> línea base de F3-2. Poblar la DB no era un cambio de plantilla, y eso está
> comprobado en vez de supuesto.
>
> ⚠ **Y el aviso de UNIDAD, que esta matriz ya se ha cobrado una vez:** «232
> rutas» es el denominador **de la ruta**, no el de la fila ni el del módulo. El
> eje horizontal enseñó que *«31/31 rutas»* era verdad **y** que una ruta contaba
> como cubierta con **una** de sus doce filas emparejada. Con 232 rutas el mismo
> error costaría seis veces más.

> ⚠ **RE-DERIVADA 2026-08-12 (56.ª tanda) — y NO se movió, que es el dato.**
> `npm run qa:cobertura`: **37 rutas**, comportamiento **37/37**, `docH` · base
> cruda · árbol · enlaces **31/31**, anchos **15**, filas **6**, módulos **2**,
> holgura **0 (3 en `c`)**. Idéntica a la corrida anterior.
>
> **La tanda venía con esto declarado al revés**: *«la matriz SE VA A HUNDIR al
> entrar 142 rutas nuevas, y eso está declarado como no-regresión»*. No se
> hundió **porque no entró ninguna ruta**: F3-2 paró en el 4.º escalón
> (§POBLACIÓN) antes de construir. Congelada: `medidas/cobertura-2026-08-12.json`.
>
> **Y conviene leerlo con la frase entera, no con el número:** que la matriz
> siga igual no es que la cobertura esté bien — es que **F3-2 no ha empezado**.
> Las 35 formas de listado siguen en `·` en los nueve ejes, igual que
> `articulos-kb` cuando no emitía rutas. El día que entren las 142, **la matriz
> tiene que hundirse**, y ese hundimiento **es lo esperado y no una regresión**.

**Fecha: 2026-08-01.** Diagnóstico puro: no se arregló nada y no se midió nada
nuevo. Todo sale de leer las salidas congeladas de `scripts/qa/medidas/` y el
código de las 41 sondas. ⚠ **Actualizado 2026-08-02: son 48**, y el
recuento de «los dos lados» de §2 estaba mal en los dos sentidos — ver ahí.

> ⚠ **2026-08-09 (F3-1): el recuento de sondas NO se cita de aquí.** Arriba pone
> «41» y luego «48»; hoy `npm run qa:lib` dice **114**. Es la §sondas 9 en este
> mismo documento: *un número recordado envejece **contra** el repo, en
> silencio*. **La cifra la deriva `qa:lib` en su última línea**, y las de arriba
> se conservan sólo porque están fechadas.

> ⚠⚠ **Y lo que esta tanda añade a la matriz, que es un hueco NUEVO, no un
> avance: `articulos-kb` no está en las 31 rutas y su cobertura es `·` en los
> nueve ejes.** No podía ser otra cosa —no emite rutas todavía—, pero conviene
> que esté escrito antes de que alguien lea «31/31» como «todo».
>
> Lo que **sí** se midió antes de construir es el **coste** de darle cobertura,
> y salió un defecto de instrumento en el sitio menos visible: `c-cmp` derivaba
> las rutas del manifiesto —o sea que la ruta nueva **entraba sola**, bien— y
> luego decidía su forma con una cascada terminada en `return "A-blog"`. Una
> familia desconocida se habría medido **con el lector del blog**: anclas que sí
> existen en el DOM, sobre la página equivocada, y **números plausibles**. Es
> exactamente lo que este documento existe para evitar, con la vuelta de tuerca
> de que la sonda **no** habría dicho `·` ni `c`: habría dicho **O**.
>
> Arreglado (la forma se deriva de `srcRoute` y una familia sin declarar TIRA) y
> verificado como no-op: **mismo reparto de 31 rutas en 10 formas, 0
> desconocidas**. Coste restante del arquetipo: **una forma + su LECTOR**,
> contado en `PLAN-FASE-3.md` §F3-1.

> ⚠⚠⚠ **AÑADIDO EL MISMO DÍA, y corrige lo que el párrafo de arriba da por
> supuesto: el LECTOR no se puede escribir todavía, y no por falta de rutas.**
>
> El coste se contó como *«una forma + su lector»* dando por hecho que el lector
> es trabajo mecánico. No lo es: **un lector son ANCLAS**, y las anclas de un
> arquetipo salen de su **fase de specs** — que en `articulos-kb` **no existe**
> (`docs/research/grupo-D/` tiene `RECON.md` y `DECISION.md` y **ningún**
> `components/*.spec.md`). Escribirlas hoy sería inventarlas, que es el mismo
> defecto que el fallback `A-blog` con otro disfraz: **anclas plausibles sobre
> una página que nadie ha medido**.
>
> **La guarda, en cambio, ya está en su sitio y se verificó leyendo el código:**
> `c-cmp.mjs:128` sale con **exit 2** ante una familia sin declarar. O sea que el
> día que las 6 rutas se emitan, la sonda **se para sola** — que es exactamente
> lo que tiene que hacer. Declararle la familia ahora, sin lector medido,
> **desactivaría esa guarda** a cambio de nada.
>
> Orden correcto, y va en `ESQUEMA-CMS.md` §2d.4: **specs → … → lector**. Nunca
> al revés.

> ✅ **2026-08-10 · LAS SPECS YA EXISTEN, así que la precondición del lector está
> levantada — y aun así el lector NO se escribe todavía. Con otra razón.**
>
> `docs/research/articulos-kb/` tiene su `MEDICION.md` y sus tres
> `components/*.spec.md`, así que **las anclas ya no habría que inventarlas**:
> están medidas. Lo que **sigue faltando** es la otra mitad, y es la que el
> párrafo de arriba no separaba —
>
> > **un lector no se declara HECHO por tener anclas: se declara hecho por
> > haberse EJERCITADO.** Y no hay contra qué ejercitarlo: las 6 rutas siguen sin
> > emitirse, así que `c-cmp` no puede correrlo ni una vez. Declarar la familia
> > hoy cambiaría «una guarda armada» por **un lector sin estrenar**, que es un
> > cambio a peor: el primero se para solo y el segundo mide.
>
> Es la §regla 10 aplicada al propio instrumento —*una afirmación de completitud
> se verifica ejercitándola, no releyéndola*— y por eso el lector va **en la misma
> tanda que emita las rutas**, no antes. Lo que sí queda hecho y no hay que
> repetir: **las anclas están escritas** (`cascaron.spec.md` §4 nombra además la
> que NO sirve — el `h1` está oculto en las 6 y su `y` es 0 en los dos lados, o
> sea **Δ0 por construcción** si alguien hereda el ancla del protocolo).
>
> **Y esto NO mueve una sola celda de la matriz**: `articulos-kb` sigue `·` en los
> nueve ejes. Tener specs no es tener cobertura — la cobertura la da haber
> comparado, y no se ha comparado nada del clon porque no hay clon.

## Por qué existe este documento

En la tanda de la miga (A-QA1b) tres rutas —`/accesorios`, `/software-…`,
`/kunak-api`— resultaron tener el mismo defecto que `/monitor-calidad-aire`. No
lo escondieron pasando una comprobación: **nunca se habían comparado con el
original en ese eje.** Su Δ0 del 2026-08-01 fue la primera medición de esas
migas en la historia del proyecto.

De ahí la pregunta que contesta esta matriz: **¿qué más está en esa
situación?** Y el criterio, que es el que hace útil el documento:

> **«No hay defecto conocido» y «no se ha mirado» producen exactamente el mismo
> informe.** Sólo se distinguen mirando la lista de lo que se ha medido — que es
> esto.

## Cómo se lee

Tres estados, y la distinción entre los dos primeros es el punto entero:

| | significado |
|---|---|
| **O** | **comparado CONTRA EL ORIGINAL**: alguna sonda abrió los dos lados y congeló el par |
| `c` | comparado **solo clon-contra-clon** (`clon-base`, `offsets`): detecta regresión respecto a un build anterior, **no dice si el clon se parece al original** |
| `·` | **nunca** |

> ⚠ **`c` NO es media medición: es cero información sobre fidelidad.** Un
> `clon-base` limpio dice «no he cambiado nada respecto a ayer», y ayer podía
> estar mal. Los tres defectos de la miga vivían en rutas con `c` verde durante
> meses. Y en A-QA1b se midió además su límite: `clon-base` dio **31/31 sin
> mover un píxel** en la corrida que corregía **+33.25 px** de ancho, porque
> mide alto y estructura.

> ⚠ **Y hay un CUARTO estado que esta tabla no tiene y que conviene no
> confundir con `O`: la sonda que mide SÓLO EL ORIGINAL** (2026-08-10).
>
> `qa:pieles` —estrenada con F3-1— censa **573 páginas del corpus** y saca
> números grandes y citables (1456 reglas de piel de titular, 43 pieles
> distintas). **No aporta ni una celda a esta matriz**, y por la misma razón por
> la que `c` no aporta fidelidad, con el signo cambiado:
>
> > **`c` compara el clon con el clon; una sonda de censo compara el original con
> > nada.** Las dos producen verdes legítimos y **ninguna de las dos dice si el
> > clon se parece al original**, que es lo único que esta matriz mide.
>
> Es el mismo aviso que ya lleva `a-cascaron` (censo del original) frente a
> `clon-base` (guarda del clon): *«dos sondas que nunca se tocan»*. Se dice aquí
> porque la tanda que estrena una sonda grande tiene la tentación de leerla como
> avance de cobertura, y **`articulos-kb` sigue a `·` en los nueve ejes** — no
> por descuido, sino porque sus 6 rutas **no se emiten** (§CENSO: POBLADO y no
> SERVIDO, y todas las sondas de este repo leen HTML servido).

> ✅ **CERRADO el 2026-08-10 (tanda 48.ª): `articulos-kb` emite sus 6 rutas y
> gana FORMA y LECTOR.** `npm run qa:kb-cmp` es una sonda **de dos lados** —clon
> renderizado contra original, congelado o **vivo**— y compara **par a par, nodo
> × propiedad**, que es la unidad en la que esta matriz manda declarar la
> cobertura:
>
> | eje | antes | ahora | evidencia |
> |---|---|---|---|
> | ritmo (sección · fila · columna · módulo) | `·` | **`O`** | `kb-cmp-{1440,390}[-vivo].json` |
> | caja (`width` · `maxWidth` · `display`) | `·` | **`O`** | idem |
> | tipografía (titular · párrafo · `li` · botón · blurb) | `·` | **`O`** | idem |
> | árbol (nº de filas · columnas · módulos · reparto) | `·` | **`O`** | idem |
> | **comportamiento** | `·` | **`·`** | sigue sin tocarse — ver abajo |
>
> **Recuento en la unidad que la sonda compara**, no en rutas: **5089 pares por
> ancho** contra la medida congelada (4999 y 4979 iguales) y **5543** contra el
> sitio vivo (5453 y 5433). Los **90 y 110** restantes son **7 huecos declarados
> con su número**, no residuo — y la sonda **falla si crecen o si se vacían**.
>
> ⚠ **Lo que esto NO mueve:** el eje de **comportamiento sigue a 0/31** y esta
> familia no lo estrena. Y estas 6 rutas **no tienen campaña de ruido propia**,
> así que su columna de suelo queda en blanco: un residuo pequeño aquí es SIN
> PROBAR, no limpio.

## ⚠ DECLARADO ANTES DE CONSTRUIR: **F3-2 va a hundir TODOS los ejes de esta matriz, y no será una regresión** (2026-08-11)

**Se escribe ahora, con F3-2 sin empezar, porque dicho después parece lo
contrario de lo que es.** F3-2 emite listados y hubs; el denominador de esta
matriz es *«las rutas que el build emite»*, así que **crece de golpe** y toda
celda `·` nueva es *«todavía no medida»*, **no** *«se rompió algo»*.

| | rutas emitidas | `comportamiento` | `docH` · `base` · `árbol` · `enlaces` |
|---|---|---|---|
| **HOY, antes de F3-2** | **37** | **37/37 = 100 %** | 31/37 = 84 % |
| **DESPUÉS de F3-2** — 35 listados + **107** `/page/N/`, **vacías incluidas** | **179** | 37/179 = **21 %** | 31/179 = **17 %** |

> ✅ **CERRADO EL MISMO DÍA: el denominador ya NO es un rango, es 179.** Lo fija
> **`D2.5` · REPLICAR TAL CUAL** (firmada por el propietario;
> `docs/research/listados-hubs/DECISIONES.md` §D2.5), que decidió que las **55
> páginas que responden 200 y no listan nada** se emiten como en el original.
>
> **El antes y el después de esta celda, que es lo que había que escribir:**
>
> | | denominador | por qué |
> |---|---|---|
> | **antes** (2026-08-11, mañana) | **126 ó 181** — un **RANGO** | «107» salía de `lh-paginas`, cuyo criterio *200 hasta el primer 404* contaba las vacías **sin decirlo**: la decisión la estaba tomando una medición por inercia |
> | **después** (2026-08-11, tarde) | **179** — un **NÚMERO** | `D2.5` decide, y el número **se deriva de la decisión**: `37 + 142` rutas de F3-2 |
>
> **De dónde salen los 179, derivados y no recordados:** `qa:lh-paginas` re-corrida
> en vivo ese día (261 peticiones, `medidas/lh-paginas-2026-08-11.json`) da
> **142** rutas bajo `D2.5` —35 índices + **107** de paginación, de las cuales
> **55 vacías**— contra **87** bajo la lectura por contenido. Las 37 de hoy no se
> tocan: **37 + 142 = 179**.
>
> ⚠ **Y el 142 es una foto, no una constante** (`P-LH-C3`): el contenido vivo
> mueve la frontera. La tanda que emita re-corre la sonda **ese día** y verifica
> contra esa corrida.

**Lo que NO cambia y conviene decir en la misma frase:** las **37** rutas de hoy
siguen medidas exactamente igual después. El porcentaje baja porque entra
trabajo nuevo, no porque se pierda ninguno — y la unidad en la que hay que
leerlo es **la ruta comparada**, no el tanto por ciento (§séptimo contenedor: *una
cobertura declarada al nivel de arriba absorbe todo lo que no se midió abajo*).

### ✅ 2026-08-11 · las **5 specs** de listados existen — pero eso NO es cobertura

`docs/research/listados-hubs/components/` pasa de 1 spec a **5**
(`listado-b` · `listado-tema-cpt` · `listado-tema-tax` · `hub-builder` ·
`indice-casos`). Conviene decir en qué eje mueve eso la aguja **y en cuál no**:

| | |
|---|---|
| **lo que sí** | las **anclas** para comparar existen: cada forma tiene su base **en crudo**, su retícula y su ritmo medidos. Es lo que `COBERTURA` dejó escrito para `articulos-kb` (*«un lector son ANCLAS, y las anclas salen de su fase de specs»*) |
| **lo que NO** | **cero rutas comparadas.** Las 5 specs son **de un solo lado** — el clon no emite ninguna de las 9 formas—, así que en esta matriz `F3-2` sigue a **0**, exactamente igual que antes de escribirlas |

> **Una spec no es una comparación**, y esta distinción es la razón de ser de
> este documento: *«la diferencia entre «no hay defecto conocido» y «no se ha
> mirado» no está en ningún otro sitio del repo»*. Escribir las specs mueve
> `F3-2` de **«no se puede comparar»** a **«se puede comparar»**. La comparación
> es de la tanda que construya.

⚠ **Y las specs traen su propia deuda declarada**, que la construcción hereda:
**4 medidas del cascarón sin diagnosticar** —`L5` con 4 secciones de pie y
cabecera de 458.09, tres pieles de `h1`, y la base de `L5` subiendo al
estrechar—. Están fichadas (`SP-K5` · `SP-T7` · `SP-H6`) y **no son defectos del
clon**: son cosas del original que nadie ha explicado.

**Y la unidad de las rutas de paginación ya está decidida con medida**
(§F3-2-UNIDAD-SERIE): **cada `/page/N/` es su propia unidad**. Las 28 series con
varias páginas dan **38 clases estructurales** y **19 de las 28 son
heterogéneas**, así que «una por serie» vería sólo la clase «primera». Si en
algún momento se muestrea, será *una por CLASE medida*, con el censo detrás.

> ⚠ **38, no 35 (corregido 2026-08-11) — y el cambio es del INSTRUMENTO, no del
> sitio.** La firma de `lh-serie` incluye un componente `·sb` que casaba
> `et_pb_widget_area` **en el documento entero**, pie incluido, y por tanto salía
> en **las 149**: §sondas 4, *un patrón que casa en TODAS no mide nada*. Con el
> discriminador que derivó `lh-barra` (`et_pb_sidebar_N_tb_body`, **80/149**)
> **tres clases que estaban unidas se separan**.
>
> **La lección de cobertura, que es la que hay que llevarse:** un componente de
> firma que no discrimina **no es neutro — está fusionando unidades**, y una
> unidad fusionada es cobertura declarada de más. Aquí eran 3 de 38 (**8 %**) que
> se habrían dado por cubiertas comparando otra. Detalle: `PENDIENTES-QA.md`
> §LH-SERIE-HIGIENE.

## ✅✅✅ EL EJE `comportamiento` ESTÁ COMPLETO — **37/37** (2026-08-11)

**Era el hueco mayor del proyecto y hoy es el único eje con cobertura completa**,
por delante de `docH` · `base` · `árbol` (31/37 los tres). La trayectoria, en
dos días: `0/31` → `13/37` → `18/37` → **`37/37`**.

| | |
|---|---|
| corrida | `TODAS=1 UNIVERSO=emitidas` · **518/518 interacciones con disparo confirmado** · `NO SE DISPARÓ` **0** · 5 selectores vivos, **0 muertos** en 74 páginas |
| veredictos | `EFECTO` 387 · `SIN EFECTO` 101 · `NO APLICA` 30 |
| alcance | **las 37 rutas emitidas × 2 lados**, a **1440** |
| congelada | `medidas/comportamiento-1440-emitidas-todas.json`, **declarada por nombre** en `cobertura.mjs` |

> **Lo que la completitud compra, y no es sólo un número:** se acabó el
> *«una ruta por familia»*. Esa frase era cierta y escondió un arquetipo entero
> (§LH-C6-FAMILIA-NO-ES-FAMILIA) porque **la sonda y esta matriz llaman «familia»
> a dos particiones distintas**. Con las 37 medidas **las dos coinciden por
> construcción**: no queda nada fuera de ninguna de las dos.

⚠ **Y lo que NO compra, dicho aquí para que nadie lo lea de más:** `37/37`
significa *«las 37 comparadas a 1440»*. **No hay pasada a 390** —el catálogo
excluye `hover` ahí a propósito— y **el eje sigue sin campaña de ruido**, así que
un `SIN EFECTO` suelto es SIN PROBAR, no limpio. Cobertura completa **no es**
suelo conocido.

## ✅✅ Cómo llegó hasta aquí — 0/31 → **13/37** (2026-08-10, `P-LH-C6`) → **18/37** (2026-08-11)

Era **el hueco mayor del proyecto** y llevaba a cero desde que existe esta
matriz. La causa estaba escrita aquí abajo y era exacta: *«`a-behaviors` y
`c-behaviors` **solo abren el original**»* — censar un lado no es comparar dos.

**`npm run qa:comportamiento`** (`scripts/qa/comportamiento.mjs`) es la primera
sonda del eje que abre **los dos**:

| | |
|---|---|
| corrida | **254 / 254 interacciones con DISPARO CONFIRMADO** · 0 selectores muertos · **+70/70** en la ampliación del 08-11 |
| unidad | **la INTERACCIÓN**, no la ruta — declarada así a propósito (§séptimo contenedor) |
| alcance | **18 rutas emitidas × 2 lados** (13 del 08-10, una por `srcRoute` · **+5** del 08-11 que cierran MONOGRÁFICO), a **1440** · más **9 formas de listado** cuyo lado del clon es un **404 verificado** |
| negativo | **5/5**, cada sabotaje por su discriminador y con el **CONTROL en verde** |
| congelada | `medidas/comportamiento-1440.json` |

> **La guarda que este eje necesita y ningún otro:** *una interacción que NO SE
> DISPARA da la misma lectura que una que se dispara y no tiene efecto.* Las dos
> escriben «0 cambios». Por eso el veredicto tiene **cuatro** valores —`EFECTO` ·
> `SIN EFECTO` · `NO APLICA` (con su número) · `NO SE DISPARÓ`— y **el último no
> cuenta como unidad evaluada**, así que la corrida sale roja por el contrato de
> `Evaluadas`. Sin eso, el eje entero habría salido verde midiendo nada — que es
> exactamente cómo se llega a 0/31 sin que nadie lo note.

**Primera cosecha, por los dos lados** (fichas en `PENDIENTES-QA.md`):

| hallazgo | número |
|---|---|
| §LH-C6-LAZY-CLON — el clon no difiere la carga de imagen | `loading="lazy"` **265 → 28**; imágenes sin pedir al quedar la red en reposo **35 → 0** en `/` |
| §LH-C6-HOVER-SUBRAYADO — el clon subraya al hover y el original nunca | `textDecorationLine` **0 → 26**, y el color va a `rgb(0,94,163)` opaco donde el original va a `rgba(0,117,201,0.7)` |
| §LH-C6-FILTRO-L5 — filtro de cliente por sector no modelado | **12 botones**, 57 → 3 tarjetas |
| §LH-C6-L3-SIN-PAGINADOR — pagina por URL sin control en el cuerpo | 3 páginas, **0** enlaces `/page/2/` fuera del `<head>` |

> ⚠ **Lo que este `13/37` NO es.** Es **una ruta por familia**: contar las 37
> porque «la familia está cubierta» sería el séptimo contenedor otra vez. Con
> `TODAS=1` la sonda recorre las 37, y hasta entonces las otras 24 son `·`.
>
> ⚠⚠ **Y «familia» ahí NO es la familia de este documento — por eso un
> arquetipo entero se quedó a cero (corregido 2026-08-11, →`18/37`).** La sonda
> agrupa por **`srcRoute`** del manifiesto (13 grupos); esta matriz agrupa por
> **ARQUETIPO** (10). Coinciden en 8 de 10, y donde no coinciden es donde
> `CLAUDE.md` ya avisa: **`/sectores/[slug]` es UN `srcRoute` que sirve DOS
> arquetipos**. «La primera de cada `srcRoute`» eligió la de SECTOR y
> **MONOGRÁFICO quedó en 0 de sus 2 rutas** — el arquetipo del que este repo ya
> sabe que esconde los defectos de los componentes que comparte con SECTOR (el
> **−36.02** del `h1`, invisible en los 4 sectores).
>
> Cerrado midiendo: `TODAS=1 SOLO=monitorizacion ETIQUETA=monografico` → **5
> rutas × 2 lados, 70/70, 0 muertos**, congelada en
> `medidas/comportamiento-1440-emitidas-monografico.json` y **declarada por
> nombre** en `cobertura.mjs`. **El eje va por `18/37` y ninguna familia de esta
> matriz está a cero.** Ficha: `PENDIENTES-QA.md` §LH-C6-FAMILIA-NO-ES-FAMILIA.
>
> ⚠ **Y este eje no tiene suelo de ruido.** Ninguna campaña lo ha medido, así que
> un `SIN EFECTO` aislado es **SIN PROBAR**, no *limpio*: el mismo `tiempo` sobre
> `/monitor-calidad-aire` dio **29** mutaciones en una corrida y **1** en la
> siguiente.

## ⚠ Y la matriz llevaba una SEMANA sin poder regenerarse (2026-08-10)

`qa:cobertura` moría con `TypeError` desde la conversión a monorepo
(`path.enApp` por `enApp`, commit `bcc2b83` del 2026-08-03). Muere gritando —no
es un verde falso— pero durante esa semana **la matriz sólo se leía a mano**, y
lo destapó **intentar usarla**, que es §regla 10.

Arreglado, y al correrla salen **dos divergencias con este documento**, las dos
por la misma causa —una sonda que acredita un eje y **no está declarada como
fuente** en `cobertura.mjs`:

| eje | dice este documento | dice la sonda |
|---|---|---|
| **anchos horiz.** | 31/31 por `qa:ancho` | **15/37** — `ancho-cuerpo` no está declarada |
| los 4 ejes de `articulos-kb` | `O` en las 6 rutas (F3-1) | **`·`** — `kb-cmp` no está declarada |

**No se arreglan aquí a propósito:** declarar una fuente es decidir qué rutas y
qué ejes acredita, y hacerlo deprisa es cómo se pinta de verde una celda que
nadie miró. Ficha con su número: `PENDIENTES-QA.md` §LH-C6-COBERTURA-DIVERGE.

**Y el denominador ya no es 31: son 37** — las 6 de `articulos-kb` entraron con
sus rutas.

## La matriz · 31 rutas × 9 ejes

> Generada por `npm run qa:cobertura` · congelada en `medidas/cobertura.json`.
> **No se edita a mano**: se recomputa de las salidas de `medidas/`.

> ⚠ **El «× 9» del título es de la matriz que `qa:cobertura` genera; el recuento
> de más abajo va ya por 11.** `srcset`/media entró el 2026-08-04 y
> **existencia** el 2026-08-05, los dos **fuera** de la matriz generada — o sea
> que el título dice 9 y el documento discute 11. Se deja dicho en vez de
> retocar el número a mano: **la matriz la genera una sonda**, y cuadrarlo de
> verdad es enseñarle los dos ejes nuevos, no editar su rótulo. Fichado como
> deuda de `qa:cobertura`.

> ⚠ **`/` — base `h1` NO VÁLIDA. Ancla alternativa: el `h2`.** Su `h1` es un
> título oculto para SEO en los dos lados y **no empuja nada**: original
> `static` pero **0×0**, clon `absolute` (fuera de flujo) 1×1. Medido
> 2026-08-01, `medidas/c-cabecera-{1440,390}-parcial-2026-08-01.json`. Su celda
> `O` en «base» significa *comparada*, **no** *verificada*: el número que vale
> es el del `h2` — **+21.03 a 1440 · −0.23 a 390**, abierto en C-QA3.

| ruta | docH | base cruda (h1.y) | árbol secciones | filas | módulos | offsets/holgura | anchos horiz. | enlaces | comportamiento |
|---|---|---|---|---|---|---|---|---|---|
| **HOME** ||||||||||
| `/` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| **PRODUCTO** ||||||||||
| `/monitor-calidad-aire` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| **CATÁLOGO** ||||||||||
| `/accesorios` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| **SOFTWARE** ||||||||||
| `/kunak-api` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/software-de-medicion-calidad-del-aire` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| **MONOGRÁFICO** ||||||||||
| `/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar` | **O** | **O** | **O** | **O** | **O** | c | · | **O** | **O** |
| `/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas` | **O** | **O** | **O** | **O** | **O** | c | **O** | **O** | **O** |
| **SECTOR** ||||||||||
| `/sectores/calidad-del-aire-en-las-ciudades` | **O** | **O** | **O** | **O** | · | c | **O** | **O** | **O** |
| `/sectores/contaminacion-por-construccion` | **O** | **O** | **O** | **O** | · | · | · | **O** | **O** |
| `/sectores/control-de-emisiones-industriales` | **O** | **O** | **O** | **O** | · | · | · | **O** | **O** |
| `/sectores/estudio-de-la-contaminacion-atmosferica` | **O** | **O** | **O** | **O** | · | · | · | **O** | **O** |
| **CASO** ||||||||||
| `/case-studies/distrito-baja-emision-rio-de-janeiro` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/casos-de-exito/red-calidad-de-aire-para-world-athletics` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| **FAQ** ||||||||||
| `/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| **A · documento científico** ||||||||||
| `/recursos/documentos-cientificos/articulos-cientificos-y-estudios/exposicion-de-los-atletas-a-la-contaminacion-atmosferica-durante-los-mundiales-de-atletismo` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/recursos/documentos-cientificos/articulos-cientificos-y-estudios/idoneidad-de-una-red-de-comunicaciones-moviles-para-realizar-mediciones-de-la-calidad-del-aire-de-alta-resolucion` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/recursos/documentos-cientificos/evaluaciones-independientes/desafio-airlab-de-microsensores-2023` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/recursos/estudios-cientificos/articulos-tecnicos/soluciones-avanzadas-de-monitorizacion` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| **A · blog / término** ||||||||||
| `/centro-de-ayuda/kunak-air/articulos-de-ayuda/como-garantiza-kunak-la-mejor-precision` | · | · | · | · | · | · | · | · | **O** |
| `/centro-de-ayuda/kunak-air/articulos-de-ayuda/evidencias-de-funcionamiento` | · | · | · | · | · | · | · | · | **O** |
| `/centro-de-ayuda/kunak-air/articulos-de-ayuda/por-que-kunak-air-es-la-mejor-estacion-de-calidad-del-aire` | · | · | · | · | · | · | · | · | **O** |
| `/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-es-kunak-air` | · | · | · | · | · | · | · | · | **O** |
| `/centro-de-ayuda/kunak-air/articulos-de-ayuda/que-puedes-hacer-con-kunak-air` | · | · | · | · | · | · | · | · | **O** |
| `/cloruro-de-hidrogeno-hcl` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/contador-particulas-suspension-movilidad-sostenible` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/contaminacion-por-metano` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/emisiones-atmosfericas` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |
| `/la-contaminacion-del-aire-el-asesino-silencioso-de-europa` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/metano` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/monitorizacion-de-emisiones-del-trafico-urbano` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/monitorizacion-de-la-calidad-del-aire-en-centros-de-datos` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/running-for-clean-air` | **O** | **O** | **O** | · | · | · | · | **O** | **O** |
| `/soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/que-es-kunak-air-cloud` | · | · | · | · | · | · | · | · | **O** |
| `/todas-nuestras-soluciones-en-el-iotswc` | **O** | **O** | **O** | · | · | · | **O** | **O** | **O** |

### Recuento · HOY (2026-08-14, 68.ª tanda) — derivado por `qa:cobertura`

Denominador **363** (las rutas que emite el build; eran 345 antes de
`L1-resources`). Sale de `medidas/cobertura-2026-08-14-2.json`:

| eje | **O** | `c` | `·` | antes (345) | sonda declarada |
|---|---|---|---|---|---|
| base cruda (h1.y) | **38** | 0 | 325 | 34 | `c-cabecera` · `lh-cmp` |
| árbol secciones | **38** | 0 | 325 | 34 | `c-cmp` · `lh-cmp` |
| comportamiento | 37 | 0 | 326 | 37 | `comportamiento` |
| docH | 31 | 0 | 332 | 31 | `c-cmp` |
| enlaces | 31 | 0 | 332 | 31 | `enlaces` |
| anchos horiz. | **22** | 0 | 341 | 18 | `c-banda` · `a-miga` · `lh-cmp` |
| filas | **13** | 0 | 350 | 9 | `lh-cmp` · `tree-cmp` · `mono-cmp` |
| módulos | **9** | 0 | 354 | 5 | `lh-cmp` · `mono-cmp` |
| offsets / holgura | 0 | **3** | 360 | 0 | `offsets` *(solo clon)* |

**Sube en 5 ejes con el denominador subiendo a la vez** (+18 rutas), y los 4 de
cada subida son exactamente las 4 formas de `L1-resources`. `docH` y `enlaces`
**no** suben, y es deliberado: `lh-cmp` no compara `docH` —está en su `IGNORAR`—
y su `href` va contra el corpus, que es otra pregunta que la de `enlaces.mjs`.

> ⚠⚠ **Y las corridas `--vivo` NO ENTRABAN EN ESTA MATRIZ hasta hoy, que es el
> caso más fuerte que hay.** `congeladas(base)` exige que el sufijo sea una
> FECHA, así que `lh-cmp-1440-vivo.json` **no casaba con ningún patrón**: la
> matriz se quedaba con la comparación contra el ESPEJO congelado e **ignoraba la
> del original VIVO**.
>
> No daba error — daba una matriz **plausible y baja**. Es §sondas 4: un patrón
> que no casa no es un cero, y aquí el cero se leía como *«esas rutas no están
> comparadas»* cuando lo están, y contra la mejor referencia que existe.
> Corregido en `cobertura.mjs`; el efecto es **+4 en cinco ejes**.

### Recuento · 2026-08-11 — **derivado por `qa:cobertura`, no escrito a mano**

Denominador **37** (las rutas que emite el build; eran 31 hasta que `articulos-kb`
entró con las suyas). Sale de `medidas/cobertura-2026-08-11-2.json`:

| eje | **O** | `c` | `·` | sonda declarada |
|---|---|---|---|---|
| **comportamiento** | **37** | 0 | **0** | `comportamiento` ← **el único completo** |
| docH | 31 | 0 | 6 | `c-cmp` |
| base cruda (h1.y) | 31 | 0 | 6 | `c-cabecera` |
| árbol secciones | 31 | 0 | 6 | `c-cmp` |
| enlaces | 31 | 0 | 6 | `enlaces` |
| anchos horiz. | 15 | 0 | 22 | `c-banda` · `a-miga` |
| filas | 6 | 0 | 31 | `tree-cmp` · `mono-cmp` |
| módulos | 2 | 0 | 35 | `mono-cmp` |
| offsets / holgura | 0 | **3** | 34 | `offsets` *(solo clon)* |

> ⚠ **Los 6 `·` de las cinco primeras filas son las 6 rutas de `articulos-kb`, y
> NO significan que no se hayan medido:** `kb-cmp` las compara par a par
> (F3-1) pero **no está declarada como fuente** en `cobertura.mjs`. Igual que
> `anchos horiz.`, donde el documento decía 31/31 por `ancho-cuerpo` y la sonda
> dice 15 por la misma causa. Es §LH-C6-COBERTURA-DIVERGE, **sigue abierta**, y
> se deja ver en vez de cuadrarla a mano: **declarar una fuente es decidir qué
> ejes acredita**, y eso no se hace de paso.

### Recuento · DESPUÉS de la tanda de cierre (2026-08-01) — *histórico, con su fecha*

| eje | **O** | `c` | `·` | sonda que lo compara | antes |
|---|---|---|---|---|---|
| **docH** | **31** | 0 | 0 | `c-cmp` — deriva del build | 8 |
| **base cruda (h1.y)** | **31** | 0 | 0 | `c-cabecera` — deriva del build | 21 |
| **árbol de secciones** | **31** | 0 | 0 | `c-cmp` | 9 |
| enlaces | **31** | 0 | 0 | `enlaces` — **ya congela** | 31 *(sin evidencia)* |
| anchos horizontales | **31**⚠ | 0 | 0 | **`ancho-cuerpo`** — deriva del build | 31 |
| filas | **6** | 0 | 25 | `tree-cmp` · `mono-cmp` | 3 |
| módulos | **2** | 0 | 29 | `mono-cmp` | 2 |
| offsets / holgura | **0** | 3 | 28 | — *(ninguna)* | 0 |
| comportamiento | **0** | 0 | **31** | — *(ninguna)* | 0 |
| **`srcset` / media** ⚠ | **24** | 0 | **7** | **`cmp-srcset`** — deriva del build ∩ corpus | **0** *(eje nuevo)* |
| **existencia (¿el artefacto EN DISCO existe y mide lo que dice?)** ✅ | **—** | 0 | 0 | **`artefacto`** — **1 929** artefactos, negativo **7/7** | **0** *(nombrado 08-05, CONSTRUIDO 08-05, invariante D 08-05)* |

> ✅ **CONSTRUIDO el 2026-08-05, y su unidad NO es la ruta** — por eso su fila
> lleva `—` en las columnas de 31. La unidad es **el artefacto**, y son **1 929**:
> 406 referencias servidas · 534 ficheros capturados · 557 fichas de tamaño del
> CMS · **432 documentos referidos desde el cuerpo transformado**. Declararlo en
> rutas sería el séptimo contenedor otra vez.
>
> **CUATRO** invariantes, cada uno con su sabotaje (negativo **7/7**):
> **A** lo que el clon sirve existe en `apps/web/public` · **B** lo capturado
> existe y su `sha256` casa · **C** cada tamaño que la ficha del CMS declara
> existe **y mide exactamente eso** · **D** *(añadido el mismo día, con T3b/T4b)*
> cada `data-media` que el cuerpo transformado declara **resuelve**.
>
> ⚠ **Y D es el que hay que leer con cuidado, porque nació encontrando dos
> defectos MÍOS y uno del alcance de la captura:** 80 referencias que no
> resolvían porque la llave era **la variante y no el origen**; 51 más porque
> **la media del corpus vive en DOS árboles** (`media-corpus/` y
> `apps/web/public/images/uploads`, ya que `listaACapturar` **resta lo que ya era
> local**: 63 de 600); y **§M-PDF-FB3D**, 5 PDF que el CMS iba a referenciar sin
> fichero detrás porque la lista se derivó del **markup** y esas URL viven dentro
> de un **base64**. *Un eje nuevo que sale verde a la primera es un eje que no ha
> mirado.*
>
> **Las 23 ausencias de §M-404 NO lo ponen en rojo**, ni las 3 de §M-ORIGEN404 ni
> las 5 de §M-PDF-FB3D: van en listas **derivadas** —y las de D son **predicados**,
> no listas—, y el eje sale ROJO en cuanto aparezca una **nueva**. *Un rojo
> permanente por deuda ajena es cómo se consigue que nadie lea los rojos*; una
> lista escrita a mano sería peor, porque envejece contra el repo (regla 9).

> ⚠ **CORREGIDO 2026-08-05: la fila de `srcset` decía `24 · 0 · 10`, y
> `24 + 10 = 34` en una matriz cuyo denominador es 31.** El «10» es
> `34 − 24` sobre las entradas del `prerender-manifest`, que **incluyen 3 que no
> son páginas** (`/_global-error` · `/_not-found` · `/favicon.ico`, que la sonda
> excluye a propósito). En la unidad de esta matriz —la RUTA— son **7**: `/` +
> los 4 sectores + los 2 monográficos. Es el **séptimo contenedor** otra vez
> —*la unidad en la que se declara la cobertura absorbe lo que no se midió
> abajo*— y aquí ni siquiera absorbía: **cuadraba mal a la vista** y nadie sumó.

> ⚠ **EJE NUEVO (2026-08-04, F2-2 bloque 3), y llega con su letra pequeña de
> fábrica.** Hasta hoy **ninguna de las 59 sondas COMPARABA el `srcset`**
> (derivado: `ls scripts/qa/*.mjs` sin `.neg`/`lib`, menos las 3 de esta tanda).
> Tres lo tocan **por un solo lado** —`a-spec` y `a-lexical` lo **censan en el
> original**, y `cms-teaser` sólo lo **cita** en el rótulo de una regla—, y
> censar un lado no es comparar dos. Por eso **M-IMG**, cuya causa
> medida es justamente la variante que elige el `srcset`, llevaba abierta desde
> que se fichó: no había con qué cerrarla. Es el caso de manual de *«un
> arquetipo nuevo NO hereda cobertura»* aplicado a un EJE.
>
> **Su unidad NO es la ruta: es el PAR (ruta × imagen origen)** — 311 pares. Una
> ruta con 51 imágenes no queda cubierta porque una de ellas empareje, que es el
> séptimo contenedor de `CLAUDE.md` §El NIVEL al que se mide.
>
> **Y las 10 rutas en `·` no son deuda de trabajo, son una FRONTERA:** son `/`,
> las internas del build y **los 4 sectores + 2 monográficos**, que están fuera
> del corpus por construcción — y son **exactamente la población donde M-IMG
> está medida**. Para cubrirlas hace falta el lado del original, que hoy no está
> capturado. La sonda lo declara en su salida y en su congelada.
>
> **Primera cosecha del eje:** 70 pares donde el clon **no emite** el `srcset`
> del original, y —de rebote, por `qa:media-poblaciones`— **23 imágenes que el
> clon sirve y no existen** (§M-404 de `PENDIENTES-QA.md`), invisibles a
> `clon-base` porque una imagen rota no mueve `docH` ni `h1.y`.

> ⚠ **La celda de «anchos horizontales» es de RUTAS y su unidad son FILAS.** 31/31
> rutas, sí — pero **164 de 181 filas** (2026-08-02). Una ruta entra en la
> columna **O** con una sola de sus doce filas emparejada, así que ese 31 es
> **la cota superior optimista** del eje. El desglose por arquetipo, con las 17
> filas que faltan clasificadas una a una, está en §El eje horizontal, al final
> de este documento. **Es el mismo error que este documento existe para evitar,
> cometido dentro de él**: contar al nivel que hace la cifra bonita.

**No queda ni una celda `c` en docH, base y árbol.** Se cerraron generalizando
dos sondas para que **deriven sus rutas del build**, como ya hacía `enlaces`: a
partir de ahora **una ruta nueva entra sola** y su hueco se cierra sin que nadie
tenga que acordarse. Ése es el cierre que importa — no las 23 celdas de hoy,
sino que la matriz no vuelva a abrirse por olvido.

**Lo que la primera corrida encontró está en `PENDIENTES-QA.md` §COBERTURA:** un
desfase de cascarón **por familia** (−87.5 en las 14 rutas de grupo A, con el
signo invertido a 390), **+289.91 de base en la HOME**, y dos defectos de sonda
cazados por sus tests en negativo. Ninguno era visible para una guarda solo-clon.

### Tres cosas que el recuento esconde y hay que decir

**1 · «anchos 12/31» está inflado: son 12 rutas de UN elemento.** Once vienen de
`a-miga`, que mide **solo la miga de pan**, y dos de `c-banda`, que mide **solo
la banda de título**. **Ninguna ruta del proyecto tiene su ancho de cuerpo
comparado con el original.** Leído bien, el eje horizontal está a **0 en lo que
importa** — que es justo donde apareció el defecto de la tanda anterior.

**2 · De las 48 sondas, 14 abren los dos lados.**

> ⚠ **Corregido el 2026-08-02.** Esta línea decía «de las 41, solo 9», y la lista
> de 9 tenía **dos errores en sentidos opuestos**: incluía `enlaces` —documentada
> como *«el único caso que no necesita el original»*— y `ruido`, que declara
> `SIN_CLON = "1"` porque solo abre el original; y **le faltaban siete**.
>
> Derivado ahora de lo que cada sonda **declara en su propia unidad**
> (`"páginas (2 por unidad: los dos lados)"`), que es un marcador semántico y no
> una coincidencia de texto: `ancho-cuerpo` · `c-banda` · `c-cabecera` · `c-cmp` ·
> `c1-localiza` · `cabecera-cmp` · `d123-flujo` · `d4-pie` · `d4-suscribete` ·
> `d4-tipografia` — más `a-miga`, `cmp-sector`, `mono-cmp` y `tree-cmp`, que
> comparan los dos lados sin decirlo en la unidad.
>
> **Y cómo NO derivarlo, porque se intentó dos veces:** buscar menciones a
> `kunakair.com` sobre-casa (`enlaces` la nombra en los `href` que audita, sin
> abrirla nunca); exigir `openPage(...kunakair…)` literal da **cero**, y un cero
> no es un hallazgo sino un detector roto (regla 4 de §sondas). Las URLs viven en
> tablas (`{orig, clon}`) y no en la llamada. Las otras 32 son **censos del original** (recon: `a-spec`, `c-censo`,
`lh-*`, `esqueleto`…) o **guardas del clon** (`clon-base`, `offsets`,
`corte-cuerpo`, `dos-rutas`, `c-bases`). Ambas cosas son útiles y **ninguna
mide fidelidad**.

**3 · `enlaces` está a 31/31 pero no congela nada.** Es la única O completa del
cuadro y su evidencia **no existe en `medidas/`** — contradice la regla 2 de
§sondas (*una sonda que no congela produce afirmaciones que no se pueden
auditar*). Es un hueco de otra clase: no de cobertura, de trazabilidad.

## Lo que queda abierto, y su coste

La tanda de cierre gastó lo barato. Queda:

| # | hueco | estado | coste |
|---|---|---|---|
| 1 | ~~anchos horizontales del CUERPO~~ | **CERRADO 2026-08-02 · 31/31 rutas y 164/181 FILAS** a los dos anchos, con `qa:ancho`. Cobertura por ruta en §El eje horizontal, al nivel al que se mide | hecho |
| 2 | **filas** | 6/31 — solo sectores y monográficos; `tree-cmp` no sabe de las otras formas | generalizar `tree-cmp` |
| 3 | **módulos** | 2/31 — solo `mono-cmp` | generalizar `mono-cmp` |
| 4 | **offsets / holgura** | 0 contra el original; `offsets` es solo-clon por construcción | modo `--orig`, caro |
| 5 | ~~**comportamiento**~~ | ✅✅ **CERRADO EN RUTAS 2026-08-11 — `37/37`**: `qa:comportamiento` (de dos lados) recorrió el universo entero con `TODAS=1`, **518/518 interacciones con disparo confirmado**, 0 selectores muertos, sobre las **842/842** de las tres corridas del eje. Lo que queda **no son rutas**: (a) **390** —el catálogo excluye `hover` ahí a propósito, así que es otra pasada, no la misma más estrecha—; (b) **el suelo de ruido**, del que sólo hay **una forma medida** (el `tiempo` de `L1-blog` es **bimodal**, §LH-C6-TIEMPO-BIMODAL) | ✅ hecho |
| 6 | **estado HTTP en las demás sondas** | solo `c-cmp` lo mira; `lib.mjs` ya lo expone | 1 línea por sonda |
| 7 | **existencia del recurso servido** | **0/31** — NOMBRADO 2026-08-05, ver abajo | sonda nueva + su negativo |

### El eje 7 · existencia — nombrado el 2026-08-05, y por qué no se construyó ya

**Ninguna guarda comprueba que lo que el clon SIRVE exista.** Los 10 ejes de
arriba miden alto, ancho, árbol, enlaces, tipografía y `srcset`; ninguno hace la
pregunta anterior a todos ellos: **¿el recurso referenciado devuelve 200?**

Lo destapó `media-poblaciones` **de rebote** —cruzando poblaciones para otra
cosa— con **23 imágenes que el clon sirve y no existen** (M-404 en
`PENDIENTES-QA.md`). Que lo encontrara un cruce y no una guarda es justo el
punto: un hallazgo de rebote **no sube el listón solo** cuando entre una ruta
nueva; una guarda del eje sí, como hace `enlaces.mjs` con los `href`.

> **Y el nombre es `existencia`, no `imágenes`.** El mismo agujero cubre
> `<img src>`, `srcset`, `<source>`, `<video>`, los PDF de `/recursos` y las
> fuentes. Nombrarlo por el síntoma que se vio primero fabricaría una sonda que
> sólo mira imágenes porque las imágenes fueron lo primero que falló — que es
> cómo se hereda un alcance sin haberlo elegido.

**No se construye en la tanda que lo nombra**, a propósito: un eje nuevo es una
sonda **con su test en negativo**, y añadirlo a una tanda que ya cerró dos
fronteras es exactamente cómo se acaba con una sonda sin negativo — el defecto
que este documento existe para no repetir.

### Por qué el ancho del cuerpo sigue siendo el número 1

No ha cambiado desde la auditoría, y ahora hay una razón más:

1. **El eje puede ser absorbido.** El *wrap* tapa un ancho igual que una fila con
   holgura tapa un alto, y a 1440 no deja ni rastro.
2. **Nunca hubo sonda apuntándole.** Las dos que existen —`a-miga`, `c-banda`—
   nacieron **reaccionando a un defecto ya encontrado**, nunca antes.
3. **Precedente medido, ya tres veces**: el kicker de `/monitor` a 50 px, la miga
   del grupo A, y las cuatro copias a mano de A-QA1b.
4. **Y ahora un cuarto**: el desfase de cascarón de C1 aparece a −87.5 a 1440 y
   **+228.5 a 390**. Un residuo que cambia de signo entre anchos es, por la regla
   espejo, un contenedor que en un ancho tapaba algo — y eso es geometría
   horizontal.

### Lo que NO recomiendo priorizar

**`offsets` contra el original.** Sirve para **diagnosticar** cuando ya sabes que
algo no cuadra, no para **detectar**. Como red, el ancho del cuerpo (#1) cubre
más por menos.

## Cómo se refresca

```bash
npm run qa:cobertura      # recomputa la matriz de medidas/ y la congela
```

La sonda **exige que exista toda fuente que declara**: si un fichero de
`medidas/` desaparece, la celda saldría `·` —indistinguible de «nunca se
midió»— así que sale por **error** y cierra el código de salida. Test en
negativo: `SABOTAJE=1 npm run qa:cobertura` → exit 2.

---

## ⚠ El hueco nº 1 se cierra, y con su letra pequeña (2026-08-02)

**`qa:ancho` (`ancho-cuerpo.mjs`) compara el ancho de la retícula del cuerpo
contra el original en las 31 rutas y los dos anchos.** El eje pasa de **0/31 de
verdad** a **31/31 rutas**, y la primera cosecha ya está fichada en
`PENDIENTES-QA.md` (§HOME · la retícula del cuerpo).

**Pero «31/31 rutas» NO es «31/31 filas», y la diferencia hay que decirla:**

| | @1440 | @390 |
|---|---|---|
| filas emparejadas por firma | **99** | **99** |
| filas huérfanas (sin pareja) | **177** | **176** |
| filas con Δ ≠ 0 | 12 (todas en `/`) | 12 (todas en `/`) |

> **Las huérfanas son PREGUNTAS, no defectos ni verdes.** Una fila que no casa
> por firma de texto no se ha comparado: no se sabe si su ancho cuadra. Contarlas
> como cubiertas sería exactamente el error que este documento existe para
> evitar — «no hay defecto conocido» leído como «se ha mirado».

**De dónde salen las huérfanas, medido:** el detector de fila del clon es
*conductual* (bloque centrado más estrecho que su sección) y **sobre-casa** en
las páginas de sector — 11 filas en el original contra **16** en el clon—, porque
casa también bloques centrados anidados que en Divi no son filas. Y en las demás
formas ocurre lo contrario: el original trae filas que el clon reparte de otro
modo. Las dos cosas son de PARTICIÓN, la misma clase que D1/D2.

**Cómo se estrecha el hueco restante:** dando al clon un marcador semántico de
fila —como el `data-kunak` del pie— en vez de deducirla por comportamiento. Eso
convierte las huérfanas en emparejadas sin tocar una sola medida.

**Lo que sí está probado hoy:** de las 99 comparadas, **87 dan Δ0 y 12 dan Δ≠0,
las 12 en `/`**, y el censo de selectores sale limpio en los dos lados con sus
dos negativos (selector muerto → error, patrón ubicuo → error).

---

## El eje horizontal, declarado AL NIVEL AL QUE SE MIDE (2026-08-02, 9.ª tanda)

> **`31/31 rutas` era verdad y era la cifra equivocada.** Una ruta contaba como
> cubierta con **una sola** de sus doce filas emparejada. La unidad de este eje
> es la **FILA**, así que su cobertura se declara en filas — y por ruta, porque
> el reparto no es uniforme.

**Corridas:** `medidas/ancho-cuerpo-{1440,390}-2026-08-02.json`.
**Las 31 rutas dan el MISMO recuento a los dos anchos** — mismas filas, mismas
parejas, mismas huérfanas. Eso no es cobertura, es control de que el
emparejador no está inventando.

| arquetipo | filas del original | emparejadas | cobertura |
|---|---|---|---|
| **HOME** (1 ruta) | 16 | 12 | 75 % |
| **PRODUCTO** (1) | 7 | 6 | 86 % |
| **CATÁLOGO** (1) | 9 | 8 | 89 % |
| **SOFTWARE** (2) | 14 | 12 | 86 % |
| **SECTOR** (4) | 45 | 39 | 87 % |
| **MONOGRÁFICO** (2) | 35 | 32 | 91 % |
| **CASO** (4) | 4 | 4 | 100 % |
| **FAQ** (2) | 0 | 0 | *(no tiene filas de cuerpo en ninguno de los dos lados)* |
| **A · blog / término** (10) | 39 | 39 | 100 % |
| **A · documento científico** (4) | 12 | 12 | 100 % |
| **TOTAL** | **181** | **164** | **90.6 %** |

**Y de las 164, 152 son informativas y dan Δ0.** Las 12 restantes están todas en
`/` y están adjudicadas en `PENDIENTES-QA.md` §Eje horizontal · ADJUDICACIÓN.

### Las 17 filas que faltan no son un hueco de la misma clase

Están clasificadas una a una, y **ninguna es un ancho sin medir**: 12 son
**PARTICIÓN** —el clon funde en una fila lo que el original parte en dos, o al
revés—, 2 son un **límite del emparejador** (banda de clientes: carrusel de
2.5 s, y en esa carga los dos lados no compartían logo), 1 es el artefacto del
`h1` oculto de `/`, 1 es **S9a** —ya fichado y abierto— y 1 es la fila del
hero de `/`, que esconde un **−14.39** que no se cuenta como Δ porque no
emparejó. Tabla completa en `PENDIENTES-QA.md`.

> **Por eso «90.6 %» no se redondea a «cerrado».** El 9.4 % que falta tiene
> nombre y causa, que es exactamente la diferencia entre un hueco y una lista de
> respuestas. Lo que sí sigue abierto de verdad es que **este eje solo se ha
> corrido a 1440 y a 390**: su comportamiento de RANGO está sin probar.

### Cómo se llegó aquí — y qué de esto NO fue el marcador

La tanda anterior dejó 99/181 y la hipótesis de que un marcador semántico de
fila en el clon las recuperaría. Medido: **el marcador es un tercio.** Las otras
dos terceras partes eran **tres definiciones distintas de «el mismo texto»**
dentro del propio emparejador —el original sirve todos los idiomas en el DOM, la
flecha de los botones es `::after` en un lado y `<span>` en el otro, y dos
módulos rotan su contenido en cada carga—. Detalle en el commit del marcador y
en la cabecera de `scripts/qa/ancho-cuerpo.mjs`.

**La lección que se lleva a la próxima sonda:** cuando un emparejador por texto
falla, la hipótesis por defecto no debe ser «el clon está partido distinto» sino
**«mi definición de “el mismo texto” no es la misma en los dos lados»** — que es
la trampa de `charsCenso()` otra vez, y aquí estaba tres veces seguidas.

---

## La cobertura, ahora AUDITABLE POR CORRIDA (2026-08-02, 11.ª tanda)

**Esta tanda no añade una sola celda a la matriz.** Cambia otra cosa, y es la que
este documento existe para vigilar: **cuándo se puede leer un verde como una
medición.**

### El verde era mudo en 47 de 48 sondas

El contrato de `Evaluadas` cerraba «0 comparado = verde» **para la máquina** —por
debajo del mínimo, código ≠ 0—. Para el lector no: la sonda imprimía un `✅` sin
decir sobre cuántas unidades. El HANDOFF que lo estrenó afirmaba que ya imprimía
la línea; **medido corriéndolas, la imprimía una** (`clon-base`).

Desde hoy la pone el gancho de salida si la sonda no llama a `informe()`:

```
✓ evaluadas 31/31 rutas · enlaces
```

> **Cómo se lee esta matriz a partir de ahora.** Un `O` de una celda sigue
> queriendo decir «se comparó contra el original». Lo que la línea de unidades
> añade es la pregunta anterior, que antes no tenía respuesta sin abrir el JSON:
> **¿cuántas unidades entraron en esa comparación?** Un `31/31` y un `12/1` son
> los dos verdes, y no valen lo mismo.

### Y la unidad del denominador puede no ser la del numerador

Dos sondas **derivan** su mínimo y aun así no expresan lo que afirman, porque
cuentan en una unidad y pisan en otra. Las delató la línea nueva:

| sonda | imprime | numerador | denominador |
|---|---|---|---|
| `c-muestra` | `evaluadas 16/3` | páginas | **formas** |
| `esqueleto` | `evaluadas 16/9` | páginas | **formas** |

Enunciado que sustituye al viejo «apretar los 8 suelos de 1»: **todo mínimo tiene
que expresar el invariante que la sonda afirma.** Detalle y la lista derivada
—10 declaraciones con mínimo literal, de las que **6 no lo cumplen y 1 a
medias**— en `PENDIENTES-QA.md` §VALIDACIÓN EN VIVO.

### Auditoría retrospectiva: ¿alguna medida congelada es de una 404?

De las 31 sondas que usan `openPage`, **22 ignoraban el estado HTTP**, y una 404
carga bien y se mide como una página buena. La pregunta obligada es si eso ya
contaminó evidencia. **Contestada leyendo los 324 ficheros de `medidas/`, sin
re-medir:**

| | |
|---|---|
| ficheros congelados | **324** |
| campos de estado HTTP registrados | 515, en **14** ficheros |
| ficheros que **no registran ningún estado** | **310** |
| estados ≥ 400 encontrados | **4, y los 4 legítimos** |

Los cuatro: dos en `a-spec-SONDA-DOS-RUTAS-INVENTADAS.json` —un negativo, lo dice
el nombre— y dos en `c-rutas.json`, donde **el 404 ES la medida** (CMS-1 resuelve
el prefijo cruzado, y que una ruta no exista es el hallazgo).

> **Conclusión, con su límite dicho:** no hay ninguna contaminación conocida por
> 404. Pero **310 de 324 ficheros no registran el estado**, así que para ellos la
> pregunta **no se puede contestar retrospectivamente** — no es «están limpios»,
> es «no se puede saber». Hacia adelante sí: `openPage` ya no cuenta una
> respuesta ≥ 400 como página evaluada, y el contrato pone la corrida en rojo.

Es la misma forma que la auditoría de `clon-base` de la tanda anterior, y tiene
el mismo mérito prestado: **la respuesta existe porque las sondas congelan.**
