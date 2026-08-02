# HANDOFF — `footer-links` cerrado, D3 cerrado, D1 y D2 NO EXISTEN

> ⚠ **Tanda 2026-08-02 (5.ª).** Se hicieron los PASOS 0 a 5 del encargo y el 6
> salvo la última corrida de adjudicación a 1440, que quedó lanzada. **D4 está
> cerrado entero**; de las cuatro causas de C1 ya no queda ninguna abierta —
> pero **dos de ellas se cerraron demostrando que no eran defectos**.

## 1 · El titular: de las cuatro causas de C1, dos no existían

`c1-localiza` descompuso el desfase del cascarón en cuatro sumandos que
reconstruían el total al céntimo. Reconstruir no es explicar: **dos de los cuatro
eran la misma altura contada de otra forma.**

| | qué decía | qué es | estado |
|---|---|---|---|
| **D1** | −225 antes de la 1.ª sección | la cabecera del clon está dentro de `main` como `section.banda-cabecera`, y **mide 225 igual que la del original** | **partición · fichada, no se toca** |
| **D2** | +50 de hueco entre secciones | las migas del clon son un `<nav>`, y `main > section` no las cuenta. **50 = 50** | **partición · fichada, no se toca** |
| **D3** | −42 entre última sección y pie | el `margin-bottom` del `<article>` del CPT `solutions` | **CERRADO** |
| **D4** | el alto del pie | tres presentaciones por tipo de página | **CERRADO** (5 ejes) |

**Lo que lo hizo visible fue bajar un nivel.** Un hueco de 50 px puede ser aire
que sobra o un nodo que el censo no cuenta, y **los dos dan el mismo número**.
`c1-localiza` medía huecos entre secciones sin mirar dentro del hueco. La sonda
nueva —`qa:d123`— **enumera los hijos en flujo del contenedor, casen o no con el
selector de sección**, y con las dos listas delante la pregunta se contesta sola.

Comprobado en **11 formas y los dos anchos**: la banda del clon iguala al
céntimo la cabecera del original (1440: 225 · 397.59/397.61; 390: 165.58 ·
136.58 · 347.25 · 419.25 · 362.91).

## 2 · ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH` (sigue vigente)

> **Muchos `docH` se ALEJAN de 0, y eso es CORRECTO.** `docH` carga todas las
> causas a la vez; mientras el pie estuvo mal, su error **compensaba** al del
> cuerpo. Al arreglarlo la compensación desaparece y el residuo del cuerpo sale
> a la superficie.

**Y ahora hay número para exhibirlo.** A 390, de 30 rutas, **15 se alejan de 0** —
y no de cualquier manera:

| familia | movió | predicho por las piezas |
|---|---|---|
| **ancha** (grupo A · sector · monográfico · FAQ), 19 rutas | **−292 / −291** | −268.63 (D4) − 30 (legal) + 6.9 (Suscríbete) = **−291.73** |
| **estrechaPad** · `/monitor-calidad-aire` | **+354** | +339.59 (D4) − 2 (legal) − 25.09 (Suscríbete) + 42 (D3) = **+354.5** |
| **caso**, 4 rutas | −26 / −27 | D4 del caso |

**Diecinueve rutas moviéndose el mismo número, y ese número predicho por la suma
de las piezas, es la adjudicación.** No lo es que el total se acerque a cero.

**Dos residuos que NO cuadran, y los dos caen en la familia de ruido documentada
(27 · 54 · 81):** `/accesorios` mueve **+274** donde su hermano de familia mueve
+354 —**−80**, y `/accesorios` lleva el módulo «Artículos y Guías», que el
original **baraja en cada carga**—; y `/kunak-api` mueve **+69** donde D3
predice +42 (**+27**). No se persiguen: están por debajo del suelo conocido de
ese módulo.

## 3 · El «¡Suscríbete!» — y por qué dos intentos midieron el nodo equivocado

Era el residuo **entero** de `footer-links`: de las cinco columnas, cuatro
cuadraban al céntimo en las tres presentaciones.

**No fue un descuido de la sonda anterior: era la identidad.** `.et_pb_column`
identifica la columna en el original y **no existe en el clon**, así que
`closest()` subía hasta la rejilla (28 enlaces). Ahora el ancla se busca **por
texto**, la columna por `.et_pb_column` / `data-kunak`, y lo demás se **deriva**.

Dos supuestos que el HTML servido desmintió, **los dos habrían dado «0 anclas»**:

1. En el original el botón **no es un `<a>`**: es `<span role="link">` con el
   destino en **base64**, resuelto por JS.
2. **Hay uno por idioma** en el DOM, todos servidos y todos menos uno ocultos por
   CSS. «Cuántos casan» y «cuántos se ven» son preguntas distintas.

| `footer-links` | @1440 antes | ahora | @390 antes | ahora |
|---|---|---|---|---|
| ancha | −4 | **−1** | −7.7 | **−0.79** |
| software | −1 | −1 | −0.82 | −0.82 |
| estrechaPad | +1 | +1 | **+26.29** | **+1.2** |

La columna EMPRESA queda a **0.00 contra la caja del original** en las tres
presentaciones y los dos anchos.

## 4 · El NIVEL, en los dos sentidos, dentro de una misma sonda

Es el hallazgo de método de la tanda, y conviene no volver a pagarlo:

| sentido | qué pasaba | qué habría producido |
|---|---|---|
| **arriba** | la columna del clon es un **ítem de rejilla** y va `stretch`: a 1440 su caja es la de la columna más alta | Δ **+51** y **+83** leídos como defecto, siendo sobrante |
| **abajo** | en el original el `mb` del envoltorio **se escapa** de la columna (contenido 329.59, caja 313.59); el clon, contexto de formato propio, **lo contiene** | **16 px de más** cableados en las tres |

Lo que suma en la fila es **la caja**, en los dos lados — comprobado con la Σ de
las cinco columnas a 390 (orig 1325.41 · clon 1318.71 · fila −7.7).

Y su corolario, que ya está en `CLAUDE.md`: **a 1440 la fila no se movió en dos
de las tres presentaciones, y el arreglo era correcto.** Ahí EMPRESA no es la
columna más alta, así que su error estaba tapado por la holgura. **Con solo la
fila delante, dos de tres arreglos parecerían inertes.**

## 5 · Lo que queda abierto, en orden

1. **La última corrida de adjudicación a 1440 quedó lanzada** (`c-cmp
   -- 1440`, salida `medidas/c-cmp-1440-tras-d3.json`). La de 1440 que está
   congelada —`c-cmp-1440-tras-suscribete.json`— es **anterior a D3**, así que
   sus tres rutas `solutions` le faltan **+42**. A 390 sí está todo aplicado.
2. **La cabecera del MONOGRÁFICO: −36.02 a 1440 y 0 a 390.** Salió de paso en
   `qa:d123`. El clon sirve al monográfico **el valor del sector** a 1440 y el
   suyo a 390. Es la **regla espejo** con firma de **familia de calibración**.
   Fichada en `PENDIENTES-QA.md`, sin perseguir.
3. **El residuo de ~1 px del pie** en las tres presentaciones (fila ~1 + columna
   CERTIFICACIONES **+0.2**). Sin descomponer.
4. **La FAMILIA DE CALIBRACIÓN sigue sin cerrarse como clase**: hace falta medir
   el **ancho del cuerpo** en las 31 rutas, hoy a **0/31** en
   `COBERTURA-MEDICION.md`. La sonda no existe.
5. **`/` con su pie propio**, a propósito, y va con C-QA3 (+289.91).

## 6 · Lo que NO hay que hacer al empezar

- **No leer «se aleja de 0» como regresión** sin mirar de qué familia es y
  cuánto movió. Diecinueve rutas moviendo −292 es la prueba, no el problema.
- **No reabrir D1 ni D2.** Están medidas en 11 formas y dos anchos: son
  partición. Tocar el flujo de la cabecera en 31 rutas por un número de
  partición es el arreglo falso de manual, y ahora hay fichero para probarlo.
- **No citar el 1440 congelado como si incluyera D3.** No lo incluye.
- **No leer el `último→pie` de CASO ni de FAQ en `qa:d123`** como defecto: su
  contenedor se elige por una cadena distinta a la del clon y la sonda lo dice
  en `via`. Son dos niveles comparados, no un hueco.
- **No perseguir ±27 ni ±81** en rutas con el módulo «Artículos y Guías».

## 7 · Sondas nuevas de esta tanda

```bash
npm run qa:d4-sus -- 390|1440     # el bloque «¡Suscríbete!», por composición y con la FILA
npm run qa:d123   -- 390|1440     # los hijos EN FLUJO del contenedor, 11 formas + cadena de antepasados
```

Las dos con `Censo`, `SOLO=`, `SALIDA=`, salida congelada y **test en negativo
que escribe en otro fichero**. Catálogo y las dos trampas que existen para no
repetir, en `scripts/qa/README.md` §«Las sondas de C1».

`qa:enlaces` **limpio en las dos direcciones** (1725 salientes · 868 entrantes) ·
`qa:slugs` limpio (A, B y C) · `npm run check` **0 errores** · `c-cmp` **exit 0 a
1440**; a 390 exit 1 por **un timeout de 120 s del ORIGINAL** en una FAQ —
reintentada suelta, mide bien (`base 0 · docH −86`), o sea episodio de latencia,
no defecto del clon.

---

# HANDOFF — `footer-legal` cerrado y la CLASE nombrada; D2/D3/D1 SIGUEN SIN TOCAR

> ⚠ **Tanda 2026-08-01 (4.ª).** Se hicieron los PASOS 0, 1 y 4 del encargo.
> **Los PASOS 2 (D2/D3) y 3 (D1) NO se alcanzaron** — no es que se descartaran:
> no se llegó. Siguen exactamente como estaban.

## ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH`

> **Con D4 arreglado, muchos `docH` se ALEJAN de 0, y eso es CORRECTO.**
>
> `docH` carga **las cuatro causas de C1 a la vez**. Mientras el pie estuvo mal,
> su error **compensaba** a D1/D2/D3; al arreglarlo, la compensación desaparece.
> Medido: `/sectores/calidad-del-aire-en-las-ciudades` pasa de **+41 a −23**.
>
> **El eje en el que se adjudica D4 es `qa:d4`, no `qa:c-cmp`.**

Es el catálogo de compensaciones de `CLAUDE.md` **visto desde el otro lado**: no
se descubre una compensación al medir, se **fabrica** una al arreglar una de las
dos mitades. Un arreglo correcto de una causa de una suma **tiene** que empeorar
el total mientras las demás sigan abiertas.

## 1 · Estado del pie, medido contra el original

| forma | @1440 links · legal · fondo | @390 links · legal · fondo |
|---|---|---|
| ancha (A×3 · sector · monográfico · caso · faq) | −4 · +1 · **0** | **−7.7** · +1.59 · **0** |
| software | −1 · +1 · **0** | −0.82 · +1.58 · **0** |
| catálogo · producto | +1 · **0** · **0** | **+26.29** · +0.58 · **0** |

**`footer-legal` y `footer-background` están CERRADOS.** El legal pasó de
**+31.59 / +1.59 / +2.6** a **+1.59 / +1.58 / +0.58**.

**Todo lo que queda vive en `footer-links`, y dentro de él en UNA columna.** De
las cinco, cuatro cuadran al céntimo en las tres presentaciones; el residuo
entero está en **EMPRESA**, la única con el botón «¡Suscríbete!».

## 2 · Lo siguiente, y por qué en ese orden

1. **El bloque «¡Suscríbete!»** — cierra `footer-links` y con él D4 entero. Sus
   márgenes (`mt 16 · mb 46 · pb 3.1`) están cableados con el valor de SOFTWARE:
   **−0.01 ahí y +25.1 en catálogo**. ⚠ **Dos intentos de medir su caja dieron
   nodos equivocados** (el lado del clon casó la rejilla entera, 28 enlaces): la
   sonda necesita bajar un nivel más en el clon —la fila es la REJILLA, y las
   columnas son sus hijos— antes de fiarse de ningún número suyo.
2. **D2** (+50 de huecos entre secciones) y **D3** (−42 entre última sección y
   pie): **sin diagnosticar y sin tocar.**
3. **D1** (−225): **sigue bloqueada**, con la misma condición — solo si se
   demuestra que mueve `docH` y no solo la partición.

## 3 · CLASE nueva: LA FAMILIA DE CALIBRACIÓN (`PENDIENTES-QA.md`)

> Un componente compartido construido midiendo **UNA** página hereda los valores
> de esa familia, acierta en ella y falla en las demás — y **el acierto se lee
> como verificación**.

Firma: **una familia a Δ≈0 exacto y las otras con residuos de signos distintos**.
Tres instancias, las tres con familia SOFTWARE: alto del pie · tipografía del pie
· bloque Suscríbete (abierta).

**Candidatos listados y NO arreglados**: `Breadcrumb` (8 importadores) y
`UltimosArticulos` (6) cablean `w-[80%]` **por defecto**, y el ESQUEMA §6b dice
que los mismos anchos gobiernan la retícula del **cuerpo**. Y lo que el barrido
no cubre: `SectionRow` (15) y `HeaderNav` (10) — **un grep por constantes
conocidas es un cribado, no un censo**. La clase no se cierra sin medir el ancho
del cuerpo, hoy a **0/31**.

## 4 · Dos correcciones a lo que este mismo HANDOFF decía

**(a) La atribución del bloque social estaba invertida.** El acta de D4 decía que
el clon servía el valor de `estrecha` en las dos; **servía el de `ancha` en las
tres**. El error de método es el que `CLAUDE.md` nombra: citar un número de una
tabla de pares **sin decir de qué lado es**. `d4-tipo` solo abría el original;
ahora abre los dos.

**(b) El primer arreglo del bloque social NO FUNCIONÓ, y en silencio.** Se cableó
como `pb-[30px]` sobre una caja de **alto fijo**: con `box-sizing: border-box` el
`padding` se absorbe. La clase **estaba en el HTML servido** y era **inerte** —
el marcador dio verde y el cambio no existía—. Lo cazó medir después, no leer el
diff.

## 5 · Sondas

- **`c-cmp` vuelve a poder dar VERDE.** `P-C3-3` barría las 31 rutas con
  `.entry-content`, un selector escrito para 6 → REFUTADA en toda corrida. Ahora
  su ámbito es `caso` + `faq`, **con guarda de que acotar no se vuelva no
  mirar** (cuenta zonas casadas y etiquetas; 0 ⇒ NO SE PUDO EVALUAR).
  Negativos: `SABOTAJE=cauces` → refuta · `SABOTAJE=ruta` → error · control →
  **exit 0**. `SOLO=` y `SALIDA=` nuevos.
- `qa:d4-tipo` abre ya **los dos lados** y lee la composición de `footer-legal`.
- ⚠ **MONOGRÁFICO no se pudo medir a 390** (timeout de 120 s en el original, que
  tiene episodios de latencia documentados). La sonda lo registra como **error**,
  no como «sin diferencia».

`qa:enlaces` limpia · `qa:slugs` limpia · typecheck · lint 0 errores · build.
⚠ **La adjudicación de las 31 rutas NO se re-corrió tras el PASO 1** — el estado
de `c-cmp` es el de la tanda anterior.

---

# HANDOFF — D4 ARREGLADO (3 partes, con residuo fichado); D2/D3/D1 sin tocar

> ⚠ **Tanda 2026-08-01 (3.ª) · EL ARREGLO DE D4.** Tres commits, cada uno con su
> medición antes/después y su adjudicación contra el original. **D2, D3 y D1 NO
> se han tocado** — no cabían, y D1 sigue bloqueada por su condición.

## ⚠⚠ LÉEME ANTES DE ADJUDICAR NADA CONTRA `docH`

> **Con D4 arreglado, muchos `docH` se ALEJAN de 0, y eso es CORRECTO.**
>
> `docH` carga **las cuatro causas de C1 a la vez**. Mientras el pie estuvo mal,
> su error **compensaba** a D1/D2/D3; al arreglarlo, la compensación desaparece
> y el residuo de las otras tres sale a la superficie. Ejemplo medido:
> `/sectores/calidad-del-aire-en-las-ciudades` pasa de **+41 a −23**.
>
> **Quien mida el PIE contra el original ve la mejora; quien mire solo `docH`
> leerá como regresión lo que es descompensación esperada.** El eje en el que se
> adjudica D4 es `qa:d4`, no `qa:c-cmp`.

Es el mismo mecanismo del catálogo de compensaciones de `CLAUDE.md` —«un Δ de
cero puede ser dos errores que se anulan»—, pero visto **desde el otro lado**:
aquí no se descubre una compensación al medir, se **fabrica** una al arreglar
una de las dos mitades. Un arreglo correcto de una causa de una suma **tiene**
que empeorar el total mientras las demás sigan abiertas.

⚠ Este aviso vivió una tanda **solo en el mensaje del commit `fd3de61`** y no en
ningún documento. Es *MENCIONADO NO ES DOCUMENTADO* (`CLAUDE.md` §sondas, regla
3): un mensaje de commit lo lee menos gente todavía que un informe de sesión.

## 1 · Lo que se arregló, y contra qué se adjudicó

El clon servía **681.09 de pie SIEMPRE** —el valor de SOFTWARE, la familia con
la que se calibró—. Ahora cada tipo de página hereda su presentación.

| forma | @1440 antes | @1440 ahora | @390 antes | @390 ahora |
|---|---|---|---|---|
| ancha (A×3 · sector · monográfico · faq) | +87.34 | **−3** | +292.52 | **+23.89** |
| CASO | −255.72 | **−3** | +27.46 | **+23.9** |
| catálogo · producto | −367.16 | **+3** | −310.70 | **+28.89** |
| **software** | **0** | **0** ✅ | +0.78 | +0.78 ✅ |
| home (sin tocar, a propósito) | −1.58 | −1.58 | +0.42 | +0.42 |

- **La 4ª sección del CASO cierra a Δ 0.00 a los dos anchos** (343.06 y 265.06).
- **`footer-background` cierra a 0 exacto** en las tres presentaciones y los dos
  anchos: el eje del `padding` está cerrado.
- **SOFTWARE no se movió un píxel**: no es una recalibración global disfrazada.

**Adjudicación en las 31 rutas** (`c-cmp`, los dos anchos, congelado): el clon se
movió en **28 de 31**, y las 3 que no son exactamente las que no debían (home
intacta, las 2 de software sin cambio). El movimiento es **exactamente el Δ del
pie** en cada familia: −90.34 ancha · +370.16 catálogo/producto · +252.72 caso
@1440; −268.63 · +339.59 · −3.56 @390.

**Y la reconstrucción cierra al céntimo**, que es lo que prueba que no se movió
nada más: A·blog predicho `docH` 1400.66, medido **1401** (scrollHeight es
entero); por causas, `D1 −225 + D2 +50 + D3 0 + D4 −3 + cuerpo −193.21 =
−371.34` contra **−371** medido.

## 2 · ⚠ El modelo del §6b tenía DOS ejes y son TRES (y hay un cuarto anotado)

Corregido en `ESQUEMA-CMS.md` **§6b.1**. La decisión de modelo NO cambia —sigue
siendo plantilla por tipo de página—; cambia de cuántos ejes consta.

1. **Faltaban 4 formas, 9 rutas** (FAQ, HOME, A·documento, MONOGRÁFICO). Las 4
   son `ancha`. La que importa: **el pie del original en la HOME es idéntico al
   de grupo A**, no una maquetación propia.
2. **El tercer eje es TIPOGRAFÍA** (`li` 14/26/mb0 · 14/30.6/mb7 ·
   **18**/30.6/mb9; legal 12 · 12 · **18**). Con solo los dos primeros,
   catálogo/producto se quedaban a **−79.19**. **No es responsive**: idéntico a
   1280, 1440 y 390.
3. **Cuarto eje, medido y NO cableado:** el bloque de **iconos sociales** vale
   **31.59 en ancha** y **61.59 en estrecha**. Es el **+31.59** que queda en
   `ancha` a 390.

> **Por qué se escondía:** los dos ejes reproducen el total de
> `footer-background`, que **no tiene texto**. Lo que no cuadraba vivía en el
> **renglón**, dos niveles más abajo. Regla del NIVEL, aplicada al pie.

## 3 · ⚠ Una medida del repo era falsa

La cabecera de `Footer.tsx` atribuía `li 14px/30.6 mb 7` a
**/monitor-calidad-aire** medido a 1280 (P1, 2026-07-27). /monitor da hoy
**18px/30.6 mb 9** a ese mismo ancho — esos eran los valores de SOFTWARE.
Corregida. **No se ha investigado** si el original cambió o si P1 midió otra
cosa; se cableó lo medido hoy, reproducido a tres anchos y congelado.

## 4 · El residuo — está FICHADO, no está limpio

Composición en `PENDIENTES-QA.md` §D4. En corto:

| @1440 | links | legal | fondo | | @390 | links | legal | fondo |
|---|---|---|---|---|---|---|---|---|
| ancha | −4 | +1 | 0 | | ancha | −7.7 | **+31.59** | 0 |
| software | −1 | +1 | 0 | | software | −0.82 | +1.59 | 0 |
| estrechaPad | +1 | +2 | 0 | | estrechaPad | **+26.29** | +2.6 | 0 |

- El **+1 de `footer-legal` es ANTERIOR a esta tanda**: software ya lo tenía y se
  anulaba contra el −1 de `footer-links`. Δ0 por compensación, dentro del único
  Δ0 que el pie tenía.
- El **+31.59 de ancha @390** tiene dueño medido (iconos sociales, arriba).
- El **+26.29 de estrechaPad @390** NO está atribuido.

## 5 · Lo que NO se tocó

- **D2** (+50 de huecos entre secciones) y **D3** (−42 entre última sección y
  pie): **sin diagnosticar y sin tocar.** No cabían en la tanda.
- **D1** (−225 antes de la 1ª sección): **sigue bloqueada.** La condición no ha
  cambiado — hay que demostrar primero que mueve `docH` y no solo la partición.
- **`/` conserva su pie propio a propósito.** Su pie original es idéntico al de
  grupo A, pero el clon lo construye aparte (`w-[85%]`, 1 bloque en vez de 3) y
  totaliza −1.58/+0.42: partición distinta con total casi igual. **Va con C-QA3**
  (+289.91 abierto); con los dos cambios a la vez no se adjudica ninguno.
- **C3** (cuerpo de A·blog), **C5**, **C6**: sin cambios.

## 6 · Sondas y verificación

Nuevas: **`qa:d4-tipo`** (varianza tipográfica del pie) · **`qa:d4-cta`** (spec de
la 4ª sección). `qa:d4` ampliada: **11 formas**, lee la fila **de los dos lados**
(antes `null` en el clon — un `null` leído como dato), abre la composición
(`fila`/`cols`/`mods`), estrena `Censo` y **código de salida** (antes devolvía 0
pasara lo que pasara), y `SOLO=` para acotar.

Las tres con **test en negativo comprobado en las dos direcciones** antes de
creerse ningún limpio.

`qa:enlaces` **limpia** · `qa:slugs` **limpia** · typecheck · lint 0 errores ·
build · marcador verificado en el HTML servido en cada parte.

⚠ **`c-cmp` sale con código 1 a los dos anchos, y ya lo hacía ANTES de esta
tanda** (la corrida de línea base también). Es `P-C3-3`: su selector
`.entry-content` se escribió para las 6 rutas del grupo C y hoy barre las 31, así
que marca `<h1>`, `<article>`, `<header>` y `<meta>` en páginas que no son casos.
**No es regresión y no se tocó** — pero es una sonda que no puede dar verde, o
sea una guarda apagada.

---

# (anterior) HANDOFF — D4 con el MODELO resuelto y el arreglo listo para escribir; D2/D3/D1 sin tocar

> ⚠ **Tanda 2026-08-01 (2.ª) · DIAGNÓSTICO de D4.** No se ha tocado ni un
> componente. Se cierra aquí a propósito: el arreglo de D4 toca **las 31 rutas**
> y exige el ciclo de adjudicación completo, que no cabía. Lo que queda hecho es
> **la pregunta de modelo, contestada y escrita en el ESQUEMA** — que era la
> condición del encargo antes de arreglar nada.

## 1 · D4 · el pie: una plantilla, una variante, y dos ejes de presentación

`npm run qa:d4 -- 1440` · congelado en `medidas/d4-pie-1440*.json` · 7 familias,
sobre el ORIGINAL.

| familia | secs | ancho de fila | `pt/pb` sección | alto |
|---|---|---|---|---|
| A·blog · A·término · SECTOR | 3 | **1238.39** (86 %) | 0 | 593.75 |
| SOFTWARE | 3 | **1152** (80 %) | 0 | 681.09 |
| CATÁLOGO · PRODUCTO | 3 | **1152** | **57.5938** | 1048.25 |
| **CASO** | **4** | 1238.39 | 0 | 936.81 |

**La respuesta a «¿mismo pie o plantillas distintas?» son las dos cosas:**

1. **El contenido del pie es el mismo en las 7** — `footer-links` (8 módulos, 5
   columnas), `footer-legal` (7, 3), `footer-background` (1), mismas clases
   `_tb_footer`, 46–48 enlaces. **No es otro pie.**
2. **CASO añade una 4ª sección**, un CTA de 343.06 con 4 módulos. **Eso sí es
   otra plantilla**, y confirma el `tb_footer` 4 vs 3 que midió C-1.
3. **Lo que varía entre las otras seis es PRESENTACIÓN**, en dos ejes
   independientes: el **ancho de fila** (1152 estrecha las columnas a 230.39 y
   los enlaces envuelven más → `footer-links` 430.78 → 518.13) y el **`padding`
   de sección** (0 vs 57.5938, el default Divi del 4 %), que explica
   `footer-background` **al céntimo**: 41 → 156.19 = **57.5938 × 2**.

**Decisión de modelo, ya en `ESQUEMA-CMS.md` §6b:** firma «constante dentro de la
familia, distinta entre familias» = **decisión de PLANTILLA, no campo por
instancia**. Nadie editó el pie de `/accesorios`; lo heredó su tipo de página. Y
los mismos dos valores gobiernan la retícula del cuerpo (86 % en grupo A y
sector, 80 % en producto/catálogo/software) → **van en la plantilla de tipo, no
en el dato del pie.**

## 2 · El defecto del clon, localizado — y por qué NO lo arreglé

`src/components/Footer.tsx` escribe **`w-[80%] max-w-[1380px]` fijo** → 1152
siempre, que es el valor de **SOFTWARE**. Por eso acierta en esa familia y falla
en las demás: **la familia con la que se calibró.** Lo importan **10 ficheros**.

**Lo que hay que hacer, en orden:**

1. el **ancho de fila** y el **`padding`** salen del **tipo de página** (86 %/0
   para grupo A y sector; 80 %/0 para software; 80 %/4 % para catálogo y
   producto). **No se cablean por página** — sería repetir el error que lo causó;
2. **CASO recibe su 4ª sección** (el CTA), que hoy no existe en el clon;
3. medición antes/después y **adjudicación contra el original una a una** de todo
   lo que se mueva. `qa:d4` ya mide los dos lados, así que sirve de verificación.

⚠ **Aviso para quien lo coja:** al cambiar el pie se mueven las 31 rutas a la
vez. `clon-base` marcará todo y **no puede decir si el cambio es correcto** —
hay que preguntarle al original (regla de petróleo). Y `docH` cambiará en las 31,
así que conviene congelar `c-cmp` **antes** de tocar.

## 3 · Lo que sigue sin tocar

- **D2** · +50 de huecos entre secciones, igual en las tres familias (76 a 390 en
  grupo A). Sin diagnosticar dónde vive.
- **D3** · −42 entre la última sección y el pie, solo en catálogo y software.
  Sin diagnosticar.
- **D1** · −225 antes de la primera sección, constante en las tres. **NO se toca
  hasta demostrar que mueve `docH`**: la cabecera del clon está fuera de flujo y
  la del original en flujo, pero si el clon mete esos 225 dentro de su primera
  sección, **la partición cambia y el total no**. Es la trampa de C4 y el aviso
  del encargo. Comprobación pendiente: comparar `docH` con y sin el cambio, no
  el reparto resto/secciones.
- **C3** · el cuerpo de A·blog, de −2 941.74 a +1 111.92, sin causa única.
- **C5** · industria fila 4 **+13 a los dos anchos**; investigación **+11.2 a
  390**; edar **−30 a 390** → dentro del suelo NO probado de ±32.28, **SIN
  PROBAR**.
- **C6** · el estado HTTP solo lo mira `c-cmp`; `lib.mjs` ya lo expone.

## 4 · Estado

Cobertura sin cambios respecto a la tanda anterior: docH · base · árbol ·
enlaces **31/31**, anchos 13, filas 6, módulos 2, offsets 0, comportamiento 0.

Sondas nuevas: **`npm run qa:d4`** (composición del pie, los dos lados) además de
`qa:c1` y `qa:cobertura`.

Verificación: `qa:enlaces` limpia · `qa:slugs` limpia · lint 0 errores ·
typecheck · build.

---

# (anterior) HANDOFF — C2 resuelta (no era defecto), C1 LOCALIZADA en cuatro causas; falta arreglarlas

> ⚠ **Tanda 2026-08-01 · DIAGNÓSTICO.** No se ha tocado ni un componente. Lo que
> hay es una contradicción del repo resuelta y una causa raíz abierta en cuatro
> piezas, listas para arreglar. Registro en `PENDIENTES-QA.md` §COBERTURA;
> matriz en `docs/research/COBERTURA-MEDICION.md`.

## 1 · C2 estaba MAL y contradecía a C-QA3. Se anula C2

El repo afirmaba dos cosas incompatibles sobre la home: C-QA3 (2026-07-31) decía
que el `+289.91` **no es un defecto y nunca lo fue**; C2 (2026-08-01) lo fichaba
como DEFECTO. **La que se tacha es C2**, y la medición que lo decide es la que
faltaba — si el `h1` **empuja** algo:

| | `position` | ¿en flujo? | caja | ¿empuja? |
|---|---|---|---|---|
| original | `static` | sí | **0 × 0** | **nada** |
| clon | `absolute` | **no** | 1 × 1 | **nada** |

Consecuencia visual **cero por los dos lados**, por caminos distintos. El error
de C2 fue leer `h1.y = 0` y deducir una maquetación sin comprobar que el `h1`
tuviera caja.

> **Lo que hay que llevarse:** «alto 0 o 1 px» dice que no se ve; **no** dice que
> no tenga consecuencia. Un elemento de 1 px **en flujo** desplaza 1 px. Lo
> decide `position`, y hay que **medirlo** — no deducirlo de la clase (`sr-only`).

`c-cabecera` mide ya `h1caja` (position · enFlujo · clip · w). La home queda
marcada en la matriz como **base `h1` NO VÁLIDA — ancla alternativa: `h2`**.

**Lo que sí sigue abierto en la home es C-QA3: +21.03 a 1440 · −0.23 a 390**
contra el `h2`, reproducido hoy al céntimo. No es esta tanda.

## 2 · C1 LOCALIZADA: no es un desfase, son CUATRO que se suman

`npm run qa:c1 -- 1440|390` (sonda nueva, congela). Una ruta por familia. **Las
cuatro piezas reconstruyen el número de cada familia al céntimo:**

| pieza | A · blog | CATÁLOGO | SOFTWARE |
|---|---|---|---|
| **D1 · antes de la 1ª sección** | −225 | −225 | −225 |
| **D2 · Σ huecos entre secciones** | +50 | +50 | +50.01 |
| **D3 · entre última sección y pie** | 0 | −42 | −42 |
| **D4 · alto del PIE** | **+87.34** | **−367.16** | **0** |
| **suma** | **−87.79** | **−583.97** | **−217.63** |
| medido | −87.79 | −583.97 | −217.63 |

Y a 390 cuadra igual: A da `−165.58 + 76 + 292.52 + 0.42 = +203.36`, el valor
medido. **La inversión de signo no necesita dos explicaciones**: son las mismas
cuatro causas con magnitudes distintas por ancho.

**D4 es la que explica que el número sea distinto por familia** — el pie del clon
es de **alto fijo (681.09)** y el del original **varía por página**: 593.75 en
blog, 1048.25 en catálogo, 681.09 en software. O sea que **el clon acertó en la
familia con la que se calibró el pie y las demás heredaron su altura**: otra
«corrección aparente por contenido corto», ahora en el pie.

## 3 · Por dónde seguir — el orden importa y está razonado

1. **D4 primero** — la de mayor magnitud y la única que diferencia familias.
   Hay que averiguar **qué** hace variar el pie del original (¿widgets por tipo
   de página? ¿un módulo extra en catálogo?) y modelarlo. Es candidato a
   **campo**, así que puede tocar `ESQUEMA-CMS.md`.
2. **D2 y D3** — constantes (+50 / −42) y localizadas; deberían ser baratas.
3. **D1 la ÚLTIMA, y solo si se demuestra que mueve `docH`.** ⚠ La cabecera del
   clon está fuera de flujo y la del original en flujo, pero **si el clon mete
   esos 225 dentro de su primera sección, la partición cambia y el total no**.
   Mientras no se pruebe, tocar el flujo de la cabecera en 31 rutas es el
   arreglo falso de manual. **Medir antes de tocar.**

**Cada arreglo: un commit, medición antes/después, y adjudicación contra el
original de todo lo que se mueva** (regla de petróleo: qué cambió nunca dice si
el cambio es correcto).

## 4 · Lo que también queda abierto, sin tocar

- **C3** — el cuerpo de A·blog va de −2 941.74 a **+1 111.92**, signos en los dos
  sentidos: no hay causa única. Pendiente de descomponer por módulo.
- **C4** — 14 rutas con distinto nº de secciones. La FAQ es **incomparable por
  construcción** (el original no mete su cuerpo en ninguna `.et_pb_section`).
- **C5** — industria fila 4 **+13 a los dos anchos** (reproduce → defecto);
  investigación **+11.2 a 390**; edar **−30 a 390**, dentro del suelo NO probado
  de ±32.28 → **SIN PROBAR**, no se toca.
- **C6** — el estado HTTP solo lo mira `c-cmp`; `lib.mjs` ya lo expone. Falta en
  las demás sondas.
- **La matriz**: ancho del **cuerpo** sigue a **0/31** de verdad (los 13 son de
  un elemento) y comportamiento a **0/31**.

## 5 · Estado de la cobertura

`npm run qa:cobertura` — docH **31/31** · base **31/31** · árbol **31/31** ·
enlaces **31/31** (ya congela) · anchos 13 · filas 6 · módulos 2 · offsets 0 ·
comportamiento 0. **Cero celdas `c`** en los cuatro primeros.

Verificación de esta tanda: `qa:enlaces` limpia · `qa:slugs` limpia · `qa:lib`
26/26 · lint 0 errores · typecheck · build.

---

# (anterior) HANDOFF — grupo A construido y A-QA1 CERRADO; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda 2026-07-31 (5.ª del día) — CONSTRUCCIÓN DEL GRUPO A.** Acta en
> **`docs/research/arquetipo-A/MEDICION.md`**; el ESQUEMA gana **§2.4** (cuatro
> correcciones al recon) y los **image sizes** bajo §CMS-0b; `PENDIENTES-QA.md`
> gana **A-QA1** y tres desviaciones deliberadas.
>
> ## Estado del clon: **31 rutas** (17 + 14), 0 regresión
>
> | ruta nueva | forma | instancias |
> |---|---|---|
> | `/[slug]` | entrada de blog · término de Kunakpedia | 7 + 3 |
> | `/recursos/[...ruta]` | documento científico | 4 |
>
> **14 de 209 a propósito**: las 209 van en F2-2 con el extractor. Lo que sí
> está es cada eje capaz de romper la plantilla — los dos extremos de longitud
> de las 209 (275 y 69 784 ch), las **dos firmas de blog**, tabla, cita,
> galería, vídeo, embebido, `<script>` en el cuerpo, la de 26 etiquetas y **los
> tres prefijos** de documento científico.
>
> ## Lo verificado
>
> - **0 regresión** en las 17 anteriores, **umbral cero, a los dos anchos**, con
>   marcador de frescura comprobado en el HTML servido.
> - **Base EN CRUDO** contra el original (la medida que se hace una vez por
>   arquetipo, antes de fiarse de ningún Δ de cuerpo): **−0.01 · −0.01 · −0.03 a
>   1440 en las tres formas.** La banda de cabecera —**225 / 165.58**— no se
>   copió de ninguna plantilla: se dedujo por composición de esa `y` cruda.
> - `qa:enlaces` limpia en las dos direcciones · `qa:corte` 12/12 · `qa:slugs`
>   limpia · lint · typecheck · build.
> - **✅ A-SP12 cerrada por medición**: `dynamicParams = false` devuelve los 404
>   (`/slug-inventado`, `/acesorios`, `/recursos/inventado/x/y`) y la ruta
>   estática sigue ganando.
> - **La guarda de slugs, probada con una colisión REAL** en el catálogo: el
>   build **volvió a compilar sin un aviso** (tercera confirmación de que es
>   silenciosa) y la sonda la cazó por A y por B, exit 1.
>
> ## ✅ A-QA1 · CERRADO (2026-07-31) — y el tope de 350 era del TEMA
>
> Las 4 formas a **Δ0 a los dos anchos**: −0.01 · −0.01 · −0.03 a 1440 y
> **0.00 · 0.00 · −0.02 a 390**.
>
> **El separador no era la causa**, y la medida lo dijo antes del arreglo: el
> clon medía **75.89** por eslabón contra **75.72** del original, o sea **+0.17**
> — tres órdenes por debajo de un renglón de 26. Lo era el **último eslabón**,
> que el original acota a `max-width: 350px · nowrap · overflow hidden ·
> text-overflow ellipsis`.
>
> Y ese tope está en las **siete formas medidas** del original, no solo en el
> caso, así que:
>
> - **`variante="caso"` de `Breadcrumb` estaba mal delimitada** — mezclaba una
>   regla general con las específicas. El truncado bajó al **defecto**; la
>   variante se queda con la interlínea 30.6, que sí es del caso;
> - **producto y sectores daban Δ0 porque sus rótulos no llegan a 350**, no
>   porque estuvieran bien: **corrección aparente por contenido corto**;
> - y el cambio **destapó una víctima**: el monográfico de petróleo envolvía en 3
>   renglones donde el original hace 2 (**−26 de `docH`**), invisible porque en
>   sector la miga va **debajo** del `h1` y la base no se movía. Comprobado
>   contra el original tras el arreglo: **Δ 0.00**.
>
> Instrumento nuevo: **`npm run qa:a-miga -- 1440|390`**, que mide la miga
> original contra clon con **el mismo selector en los dos lados** y lee el
> separador del pseudoelemento. Su lección va a `CLAUDE.md`: **el nivel al que
> se mide no es solo vertical** — un ancho medido al ancho estrecho está tapado
> por el wrap.
>
> **Campo nuevo de esquema (§2c.1): `tituloMiga`.** El rótulo de la miga del
> término **no es el `h1`** (3 de 3 términos difieren, 11 de 11 blog y doc
> coinciden). Opcional con defecto «el título». No salía en la base porque a 390
> los dos rótulos caen en 2 renglones igualmente: **medida tapada, no acierto**.
>
> ## Las cuatro correcciones al recon (§2.4 del ESQUEMA)
>
> 1. **El documento científico no tiene UN prefijo: tiene TRES**
>    (`documentos-cientificos/articulos-cientificos-y-estudios` 14 ·
>    `…/evaluaciones-independientes` 8 · **`estudios-cientificos/articulos-tecnicos`
>    1**). Se modela como CMS-1 modeló el del caso: campo con defecto. De ahí el
>    catch-all — un segmento fijo se habría comido esa instancia de 23.
> 2. **`text#2` del documento trae `autores` y `anyo`**, que el modelo no tenía.
> 3. **El `h1` del término mide 44/52.8, no 18** (el 18 era del MÓDULO) y **no
>    reduce a 390**, al revés que blog y documento.
> 4. **La autoría es PLANTILLA**: idéntica en las 11 instancias que la llevan.
>
> Las tres primeras son la misma lección: **se había leído el contenedor**. El
> `color` de ese módulo sale **blanco** en las tres formas — maquetar con él
> habría dado un titular invisible.
>
> ## Sondas y comandos nuevos
>
> ```bash
> npm run qa:slugs                       # unicidad de slug ENTRE familias del plano
> SABOTAJE=accesorios npm run qa:slugs   #   su test en negativo (exit 1)
> SABOTAJE=inexistente npm run qa:slugs  #   su control     (exit 0)
> npm run qa:a-spec                      # transcripción verbatim del mínimo adversario
> SABOTAJE=1 npm run qa:a-spec           #   test en negativo: patrón muerto, exit 2
> node scripts/gen-arquetipo-a.mjs       # regenera src/lib/arquetipo-a.ts
> node scripts/download-grupo-a.mjs      # baja sus assets a public/
> ```
>
> `npm run check` ahora es **lint → typecheck → build → qa:slugs**.
>
> ## Lo que NO hay que rehacer al empezar
>
> - **No re-medir el original a mano.** El contenido verbatim de las 14
>   instancias está en `medidas/a-spec.json` y el cascarón en
>   `a-cascaron-{1440,390}-2026-07-31-4.json`, ya con tipografía, `y` cruda e
>   índice.
> - **No editar `src/lib/arquetipo-a.ts` a mano**: está generado. Se toca la
>   sonda o el generador y se regenera.
> - **No aplicar T1–T7.** Siguen sin aplicar a propósito: son transformaciones
>   de migración y su sitio es F2-2. El generador hace solo las dos reescrituras
>   que el CLON obliga (assets a `public/`, `<a>` a rutas locales).
> - **No cablear A-SP14 ni A-SP15**: anotados, no resueltos.
>
> ## Sigue abierto, sin cambios
>
> **C-QA6** (campaña de ruido: 1 de 3 ráfagas; faltan 2, ≥2 h y ≥1 día distinto)
> · **C-QA3** (la home: +289.91 a 1440 · +119 a 390) · **C-QA5** · y la **Fase
> 2** con sus dos precondiciones. La biblioteca avanza de verdad: el grupo A
> pasa de «reconocido» a **construido**, y con él dejan de estar bloqueados los
> **26 de los 35 listados** que dependían de él.
>
> ---
>
# (bloque anterior) HANDOFF — LH-2 decidido: los listados ya tienen modelo; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda LH-2, 2026-07-31 (4.ª del día) — DECISIONES DE MODELADO de
> listados y hubs.** Actas: **`listados-hubs/DECISIONES.md`** (D1–D5, con
> reaperturas) y **`MODELO.md`** (content types con defaults); el ESQUEMA gana
> **§2c** (colecciones de términos + contrato del grupo A) y **§4b corregido**.
> Nada construido.
>
> - **D1**: las 35 cuestan **2 arquetipos nuevos (quizá 3)** — LISTADO-B (23,
>   una plantilla, tres variantes de tarjeta) y LISTADO-TEMA (L2/L3 separados
>   con reapertura) — más una **página índice** (`casos-de-exito`, sin paginar,
>   sobre la colección `casos`) y **cero arquetipos por los 6 hubs de builder**.
> - **D2**: `/page/N/` plantilla; **`entradasPorPagina` es parámetro de
>   plantilla por variante (9·15·5), NO campo** — ⚠ corrige la nota que el
>   recon dejó en §4b con la lente del builder. Rutas derivadas en build; los
>   7 con 200-para-todo sirven 404 (desviación deliberada, a PENDIENTES al
>   construir); re-correr `qa:lh-paginas` el día que se emita.
> - **D3 — la que condiciona el grupo A**: sus entradas nacen con
>   `fechaPublicacion`, `imagenDestacada` (sizes 1080×675·1024×683·980·480),
>   `extracto` derivado por defecto y **TRES taxonomías**
>   (`category`+`post_tag`+`resources`) — y **sin `autor`** (0/9 formas lo
>   piden). Evidencia nueva: **`qa:lh-tarjetas`** (lectura fina, 9 formas,
>   congelada). `BlogPost`/`CaseStudy` (S1) = proyección canónica verificada.
> - **D5**: 7 de las 8 preguntas contestadas; la 8.ª (orden de resolución de
>   la raíz) es CMS-2 y se decide en F2-1. **LH-SP5 decidido: hace falta una
>   pasada de COMPORTAMIENTO antes de construir L1** (hover · AJAX · lazy ·
>   orden entre cargas) — pre-registrada como P-LH-C6.
> - **Pre-registro de construcción P-LH-C1…C6** al final de DECISIONES.md.
> - ⚠ **Hallazgo fuera de alcance: `/es/categoria/*` existe** (200, archivo,
>   fuera de sitemap) — familia **SIN CENSAR (LH-SP8)**; los 35 no eran el
>   universo. Y quedan LH-SP9 (por-página de L3) y LH-SP10 (¿extracto manual?).
>
> ---
>
# (bloque anterior) HANDOFF — recon de listados+hubs hecho; quedan la CAMPAÑA, la home y C-QA5

> ⚠ **Tanda 2026-07-31 (3.ª del día) — RECON LISTADOS + HUBS.** Acta completa
> en **`docs/research/listados-hubs/PAGE_TOPOLOGY.md`**. Solo datos: cero
> construcción y cero decisiones de modelado (van a su tanda, y las preguntas
> están escritas sin contestar en su §9).
>
> ## Lo que contestó
>
> **Las 35 no son un arquetipo: son CINCO formas**, y el reparto lo dio el
> **régimen del `<body>` servido**, mirado antes que nada:
>
> | forma | pág. | qué es |
> |---|---|---|
> | **L1** ARCHIVO PLANTILLADO | **23** | `tb_body` de 2 secciones — **6 secciones y 2 `tb_body` en las 23, sin una excepción** |
> | **L2** ARCHIVO DE CPT (tema) | 2 | `glosario` · `preguntas-frecuentes`, 4 secciones |
> | **L3** ARCHIVO DE TAXONOMÍA (tema) | 3 | los `scientific-category/*`, 5 secciones |
> | **L4** HUB DE BUILDER | 6 | compuestos por instancia (6·7·8·6·7·6) |
> | **L5** HUB CON PLANTILLA PHP | 1 | `casos-de-exito`: lista **las 57 sin paginar** |
>
> **Tres correcciones a lo que el censo anterior daba por sabido:** «hub» era
> una etiqueta, no un régimen (3 de los 12 son archivos de término); los 3
> `scientific-category` **no son del grupo B** (otro régimen); y **PL-F3 se
> disparó** — `/es/recursos/` es builder **con listado dentro**.
>
> **Paginación (nadie la había mirado):** patrón **`/page/N/`**, 21 de 35
> paginan, **107 rutas extra** (total 142). La ventana de `paginate_links` decía
> 56 — **subestimaba en 51**, porque imprime `1 2 3 … 8` y no la lista. Y **7
> páginas NO paginan aunque devuelvan 200 a cualquier N**: su canonical apunta a
> la primera. Va al **ESQUEMA §4b**, con el nº de entradas por página (9·15·5·3)
> anotado como **campo**.
>
> **Estado del clon frente a los 35:** **ninguno de los 12 hubs existe**
> (verificado contra el `prerender-manifest`). **25 href** del clon apuntan a 8
> de ellos y **pasarán a ser fallo de `qa:enlaces` solos** al emitir el primero.
> **Solo `/productos` y `/sectores` son construibles hoy**; **26 de 35 dependen
> del grupo A**, sin construir.
>
> ## ⚠ Lo que hay que saber antes de fiarse de estos números
>
> **La sonda llegó con CUATRO defectos y los cuatro daban cifras plausibles.**
> Están contados uno a uno en el §6 del acta. El cuarto es el que más enseña:
> `lh-paginas` **imprimía «⚠ TOPE» y sumaba el número igual** —la regla 1 rota
> dentro de mi propio informe, como le pasó a `ruido.mjs`— e inventaba **441
> rutas** que no existen.
>
> De ahí una **guarda nueva en `CLAUDE.md`, hermana de la regla 4**: *un patrón
> que casa en TODAS tampoco mide nada*. `max` por patrón discriminante, markup
> buscado sin `<style>`, y **test en negativo que cubre las dos guardas en una
> corrida**.
>
> ## Sondas nuevas
>
> ```bash
> npm run qa:lh                 # censo 35/35 (MODO=rutas|regimen|censo)
> npm run qa:lh-paginas         # el final real de cada paginación, por 404
> SABOTAJE=1 npm run qa:lh      # test en negativo: MUERTO + UBICUO, exit 2
> ```
>
> Congeladas en `medidas/lh-{regimen,censo,paginas}.json`, con las defectuosas
> conservadas bajo `…-SONDA-DEFECTUOSA-*` / `…-SONDA-CONTABA-EL-TOPE`.
>
> ## Sigue abierto, sin cambios
>
> **C-QA6** (campaña de ruido: 1 de 3 ráfagas; `ruido.mjs` ya congela `cargaMs`)
> · **C-QA3** (la home) · **C-QA5** · y la **Fase 2** con sus dos precondiciones
> (`docs/PLAN-FASE-2.md`). El recon de hoy **avanza la primera**: la biblioteca
> está más cerca de cerrada, pero **falta la cola larga** (empresa, legales,
> contacto, soporte, landings) y **el grupo A sin construir bloquea 26 de estos
> 35**.
>
> ---
>
# (bloque anterior) HANDOFF — C-QA7 cerrado; quedan la CAMPAÑA (2 ráfagas), la home y C-QA5

> ⚠ **Tanda corta 2026-07-31, después del cierre de abajo — HAY PLAN DE FASE 2:**
> **`docs/PLAN-FASE-2.md`**, las cinco fases de la migración a Payload
> (F2-1 esquema · F2-2 datos · F2-3 lectura · F2-4 publicación · F2-5 admin y
> traspaso), cada una con sus decisiones enlazadas, su incógnita y su criterio
> de «hecho», más las **dos precondiciones de arranque** (biblioteca cerrada y
> tanda CLASE). Convención nueva en el ESQUEMA: **`CMS-n` = decisión ·
> `F2-n` = fase**. La primera decisión de F2-1 es **CMS-0f** (app única vs dos
> apps en monorepo; el evaluador externo recomienda dos — costes de ambas ya
> escritos en el plan). En la misma tanda: la mina de custodia **desactivada
> con el rename** (✅ abajo), la ráfaga 2 con **tiempos de carga** (§CAMPAÑA),
> el **no-wrap como mecanismo propio** en `CLAUDE.md`, y el §1 del ESQUEMA
> deja explícito que **el régimen builder entra en Payload** (la «frontera de
> regímenes» era mitigación del M2A de Directus y no aplica).
>
> ⚠ **Actualización 2026-07-31, cerrando el bloque 5 de la cabecera.** El bloque
> anterior (abajo) sigue siendo contexto válido; esto es lo que cambia.
>
> ## Estado del clon, medido al cerrar — 17 rutas × 2 anchos
>
> | ancho | a Δ0 | desplazadas, TODAS con nombre y ficha |
> |---|---|---|
> | **1440** | **16 de 17** | `/` (+289.91 · C-QA3, sin base válida) |
> | **390** | **15 de 17** | `/` (+119 · C-QA3) · `estudio` (+11.2 · en el diagnóstico congelado) |
>
> Nada anónimo — el objetivo de la tanda de cabecera entera. Con la reserva de
> C-QA6 en pie: los Δ0 de `/software` y los 2 monográficos se leen **«sin
> episodio observado»**, no «verificados», hasta cerrar la campaña.
> `qa:enlaces` (dos direcciones), `qa:corte` (12/12) y `qa:bases` limpias;
> `clon-base` contra la línea post-C-QA2: solo se movieron los dos arreglos,
> las otras 15 sin un píxel (`clon-base-{1440,390}-cqa7-despues.json`).
>
> ## Hecho en este bloque
>
> - **PASO 0** · dos registros: la lección del comentario CSS en `CLAUDE.md`
>   (§Notas de método — es el argumento operativo de «siempre dos anchos») y la
>   **pista de sincronía** de la campaña (abajo, en su tabla).
> - **C-QA7 · CERRADO** (acta en `PENDIENTES-QA.md`). Los dos residuos eran
>   **tres defectos, y dos son el mismo**:
>   - `/accesorios` (+28.8·+48): un **`pt` de fila que el original no tiene**
>     (el default Divi cableado sin medir: +28.8/+30) **más** el kicker sin la
>     regla móvil 35px/42 (+18 a 390). La composición cuadra al céntimo.
>   - `/monitor` (+78 solo a 390): el **mismo kicker**, pero con estilo inline
>     que no puede ser responsive — «Kunak AIR Pro» a 2 líneas: 120−42=78.
>     La firma espejo en su forma pura: a 1440 el no-wrap lo tapaba entero.
>   - Resultado: **Δ0 exacto en crudo, dos rutas × dos anchos**, contra el
>     original en vivo. Commits `0ce6e00` · `2c2432e`.
> - **Docs en la misma tanda**: sexta instancia del catálogo de compensaciones
>   (`CLAUDE.md`: el −19.2 = −48+28.8) y **el `pt` de fila al esquema como
>   CAMPO** (`ESQUEMA-CMS.md` §6: test A — 0 px en 3 de 4 hermanas, default
>   2%/30 intacto en monitor). Regla nueva vigente: lo que un diagnóstico
>   revele como campo va al esquema en la tanda que lo mide.
>
> ## ✅ Custodia — RECONCILIADA (2026-07-31): el nombre canónico vuelve a ser la medida sana
>
> `clon-base-390-cqa2-despues.json` contenía el build roto por el comentario
> CSS (S0=0: 10 falsas regresiones de +136.58 al comparar). **Los nombres se
> invirtieron**: el canónico contiene ahora la medida **SANA**, y el build roto
> se llama `clon-base-390-cqa2-despues-BUILD-ROTO-comentario-css.json` —
> conservado como evidencia, git guarda las dos historias. Ya no hay aviso que
> recordar: el nombre obvio es el correcto. Detalle y moraleja en
> `PENDIENTES-QA.md` §C-QA7 · Custodia.
>
> ## Abiertas, por orden
>
> - **C-QA6 · la campaña de ruido** — 1 de 3 ráfagas; faltan 2, ≥2 h de
>   separación y ≥1 día distinto. Cómo correrla y la pista de sincronía: abajo,
>   §CAMPAÑA. **Hasta cerrarla, `/software` no se da por verificado.**
> - **C-QA3 · la home** — déficit de **contenido** en la columna del hero
>   (−50.84 amplificado por centrado), no de cabecera. Se decide aparte.
> - **C-QA5** — el `h1` envuelve distinto en 4 rutas, solo a 1440: es el
>   **ancho** del contenedor del título, base válida.
>
> ---
>
# (bloque anterior) HANDOFF — C-QA2 aplicada; quedan C-QA7, la home y una CAMPAÑA con fechas

> ⚠ **Actualización 2026-07-30, cerrando el bloque 4 de la cabecera.** El cuerpo
> de este documento (abajo) sigue siendo contexto válido. Esto es lo que cambia.
>
> ## Estado del clon, medido al cerrar — 17 rutas × 2 anchos
>
> | ancho | a Δ0 | desplazadas |
> |---|---|---|
> | **1440** | **15 de 17** | `/` (+289.91) · `/accesorios` (+28.8) |
> | **390** | **13 de 17** | `/` (+119) · `/accesorios` (+48) · `/monitor` (+78) · `estudio` (+11.2) |
>
> **Ninguna es una regresión**: `/` no tiene base válida (C-QA3), `estudio`
> +11.2 ya estaba en el diagnóstico congelado, y las otras dos son **C-QA7**,
> abierto abajo. `qa:enlaces`, `qa:corte` y `qa:bases` limpias.
>
> ## Hecho en este bloque
>
> - **PASO 0 · la otra mitad de la custodia**, en `CLAUDE.md` junto a la guarda
>   de `w()`: **congelar y COMMITEAR van en la misma tanda**. La guarda protege
>   de que una **sonda** pise su salida; de un `rm`, un `git checkout --` o un
>   descarte en el IDE protege **git y solo git**. Se cita el fallo de la ráfaga
>   A de C-QA6, que fue exactamente eso.
>
> - **PASO 1 · C-QA2 aplicada.** El espaciador de las 4 de producto pasa de
>   `137 / lg:177` a **225 / 136.58**, y los 4 `page.tsx` dejan de llevar el
>   `div` copiado a mano: usan **`BandaCabecera`**. `qa:clon-base` con umbral
>   cero: **+48 a 1440 y −0.42 a 390 en las 4, las otras 13 sin mover un píxel**.
>
>   Contra el original el cambio hace **exactamente** lo previsto —mueve +48
>   exactos en las cuatro— y ahí aparece lo que tapaba:
>
>   | ruta | @1440 | @390 |
>   |---|---|---|
>   | `/kunak-api` · `/software-…` | **0** ✅ | **0** ✅ |
>   | `/monitor-calidad-aire` | **0** ✅ | **+78** |
>   | `/accesorios` | **+28.8** | **+48** |
>
> - **PASO 2 · el protocolo de ruido, rediseñado**, y la campaña arrancada.
>
> ## C-QA7 (ABIERTO) — lo siguiente, y ya sabe por dónde empezar
>
> Los residuos de `/accesorios` y `/monitor` **no son del espaciador**: son de
> cada página, debajo de él, y el error del espaciador los venía compensando.
>
> **La pista está medida y es fuerte:** sus originales miden **392.59** y
> **308.58**, *idénticos* a los de `/kunak-api` y `/software-…`, que ahora dan
> **Δ0 a los dos anchos**. Misma cabecera, mismo espaciador, distinto resultado
> → el sobrante está **en el cuerpo**. Se localiza comparando **la cadena del
> `h1` de la página que falla contra la de la que cuadra**, que `qa:banda` ya
> sabe sacar (`cadena`).
>
> `/accesorios` es el caso de libro de dos errores que se anulan, y ni siquiera
> daba cero: daba **−19.2**, un número pequeño y fácil de leer como fleco, que
> era **−48 de espaciador más +28.8 propios**.
>
> ## ⏳ CAMPAÑA DE RUIDO `cqa6` — 1 de 3 ráfagas. NO SE PIERDA ENTRE TANDAS
>
> El protocolo nuevo: **el suelo es el máximo ENTRE ráfagas separadas**, no
> dentro de una. Requisitos: **≥3 ráfagas · ≥2 h de separación · ≥2 días
> distintos**.
>
> | ráfaga | cuándo | resultado |
> |---|---|---|
> | **1 ✅** | 2026-07-31T03:14Z | **±32.28** en el `h1` de las **tres** rutas a 1440 |
> | **2 ⏳** | **otro día**, ≥2 h de separación | pendiente |
> | **3 ⏳** | **otro día** | pendiente |
>
> **Cómo se corre la siguiente** (una línea, ~6 min):
>
> ```bash
> CAMPANA=cqa6 RUTAS="/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas" npm run qa:ruido -- 3
> ```
>
> Congela sola en `medidas/campana/cqa6/rafaga-<sello>.json` y **dice cuántas
> faltan**. Ráfaga 1 fue la **tercera observación independiente** del episodio de
> ±32.28 y la primera que lo ve en las tres rutas a la vez: ya no es un fleco.
>
> **⚠ HIPÓTESIS DE MECANISMO añadida el 2026-07-31 — solo se anota.**
> **Cloudflare Rocket Loader** está activo en el original: reescribe
> `type="text/javascript"` con un token de 24 hex **distinto en cada petición**
> para **aplazar la ejecución de los scripts**. Se descubrió midiendo el grupo A
> —dos congelaciones de `a-spec` del mismo día difieren **solo** en ese token, en
> 4 de 14 páginas— y encaja con lo que la campaña observa:
>
> | lo observado en C-QA6 | lo que Rocket Loader hace |
> |---|---|
> | el `h1` **envuelve distinto** entre cargas | aplazar scripts desplaza **cuándo asientan fuentes y maquetación** |
> | el movimiento aparece **sincronizado en varias rutas a la vez** | es una capa **global** del sitio, no algo por página |
> | correlaciona con la **latencia** | cuanto más tarda la carga, más tarde se ejecuta lo aplazado |
>
> **No es una explicación y no se persigue ahora.** Es un candidato con tres
> coincidencias, que es más de lo que había. Lo que sí se hace es **registrarlo
> sin coste**: `ruido.mjs` anota ya, junto a cada medida, `rocketToken` (si el
> token por petición está presente) y `rocketLoader` (si el script del propio
> Rocket Loader está en la página) — editada **antes** de la ráfaga 2, como se
> hizo con `cargaMs`. **Las ráfagas 2 y 3 no necesitan nada a mano.**
>
> > **Pista de mecanismo (solo anotada — no perseguir):** el ±32.28 de la ráfaga 1
> apareció **en las tres rutas A LA VEZ**. Movimiento sincronizado sugiere una
> causa global compartida, no aleatoriedad por página. Las ráfagas 2 y 3 deben
> anotar si la sincronía se repite.
>
> **Y la ráfaga 2 anota EL TIEMPO DE CARGA junto a cada medida.** Hipótesis a
> confirmar o descartar: el ±32.28 sincronizado **correlaciona con la latencia
> del original** (cargas lentas → fuentes/imágenes sin asentar → el `h1`
> envuelve distinto). El episodio de latencia existe: la noche del 2026-07-31
> el original dio cargas de >120 s (documentado en
> `c-banda-1440-2026-07-31-2.json`). ✅ **`ruido.mjs` ya congela `cargaMs`
> junto a cada medida** (2026-07-31, editada ANTES de la ráfaga 2, con
> `qa:lib` 26/26 y corrida instrumental congelada en
> `medidas/ruido{,-crudo}-paso0b.json` — cargas de 7.3–8.0 s esa corrida, y
> el timeout también se cronometra: un error trae su latencia). Las ráfagas
> 2 y 3 no necesitan nada a mano.
>
> ⚠ **Hasta cerrarla, `/software` NO se da por verificado** aunque dé Δ0 a los
> dos anchos: un Δ0 leído en una corrida puede ser el episodio y no el arreglo.
> Y una combinación a 0 se lee **«no se observó ruido en estos episodios»**,
> nunca «su suelo es 0».
>
> ## Abiertas, por orden
>
> - **C-QA7** — `/accesorios` (+28.8 · +48) y `/monitor` (+78 solo a 390). Con
>   pista medida, arriba.
> - **C-QA6** — la campaña, 2 ráfagas y ≥1 día.
> - **C-QA3 · la home** — es un déficit de **contenido** en la columna del hero
>   (**−50.84**, amplificado por centrado vertical), **no de cabecera**: el `pt`
>   del hero vale 180 en los dos lados. Se decide aparte.
> - **C-QA5** — el `h1` envuelve distinto en 4 rutas, **solo a 1440**. Base
>   válida; lo que no cuadra es el **ancho** del contenedor del título.
>
> ## Dos cosas que este bloque enseñó y conviene no repetir
>
> 1. **Un veredicto medido en una página no cubre las cuatro.** El acta anterior
>    decía «un solo cambio, sin segundo defecto debajo» apoyándose en que el
>    offset coincidía al céntimo — **en `/kunak-api` y solo ahí**. Para 2 de 4 no
>    valía, y esa diferencia es C-QA7.
> 2. **Medir a los dos anchos no es opcional.** Un comentario CSS mal cerrado
>    dejó cuatro líneas de prosa haciendo de selector y el parser se comió **la
>    regla base** —la que sirve el ancho móvil—: bandas de 0 a 390 con **1440
>    intacto**. A 1440 solo, habría pasado por buena. (Y pasó dos veces: la
>    explicación del fallo llevaba el token de cierre entre comillas, que en CSS
>    no se puede citar.)
>
> ---
>
# (bloque anterior) HANDOFF — C-3 construida; lo siguiente es la CABECERA

> ⚠ **Actualización 2026-07-30, al cerrar el diagnóstico de C-QA1.** El cuerpo
> de este documento (abajo) describe el estado **antes** de construir C-3 y
> sigue siendo válido como contexto. Lo que cambia es qué toca ahora.
>
> **C-3 está construida y verificada**: 17 rutas (11 + 6), las **siete
> predicciones P-C3-1…7 se sostienen**, `qa:enlaces` limpia en las dos
> direcciones y **0 regresión** en las 11 anteriores a los dos anchos. Acta en
> `docs/research/grupo-C/MEDICION.md` (partes 1 y 2).
>
> ## Lo siguiente: la cabecera, y son DOS defectos
>
> Diagnóstico completo en `docs/PENDIENTES-QA.md` §C-QA1, medido con
> `npm run qa:c-cabecera` sobre las 17 rutas y **congelado**. En corto:
>
> - **La cabecera del original no es una sola cosa.** Su alto depende de la
>   plantilla (**225** producto · **387** caso · **397.61** sector · **433.61**
>   monográfico a 1440) y está **EN FLUJO** en todas menos la home, porque el
>   original mete la banda de título **dentro** de `header.et-l--header`. El
>   clon sirve siempre **203.59** y siempre **fuera de flujo**.
> - **Los 6 sectores están CORRECTOS, no compensados**: el clon los descompone
>   en `HeaderNav` absoluto + `section.cabecera-sectores` en flujo y el `h1` cae
>   en 261.16 en los dos lados. Descomposición fiel, mismo total.
> - **Pero 4 páginas de producto tienen un desfase real que nadie había visto**
>   (`/accesorios`, `/kunak-api`, `/monitor-calidad-aire`, `/software-…`), y
>   **cambia de signo entre anchos**: −19.2 → **+48.42** en accesorios, −48 →
>   **+78.42** en monitor. Un residuo que cambia de signo entre dos maquetaciones
>   no es ruido.
> - **Por qué llevaba invisible**: la regla del `h1` **resta la base de lectura
>   antes de comparar**, así que un desfase que está *en* la base se normaliza a
>   cero por construcción. El contenedor con holgura es **el propio protocolo**.
>
> **Por tanto la tanda NO es «cabecera sola»**: es **C-QA1** (las 6 nuevas) +
> **C-QA2** (el espaciador de las 4 de producto), y arreglar la primera sin la
> segunda movería 4 páginas hoy verdes. **Va con plan propio y en sesión
> limpia** — es cambio de componente compartido en 17 rutas.
>
> **Lo que ya está listo para esa sesión:** la base congelada de las 17
> (`medidas/clon-base-{1440,390}-cqa1-antes.json`, umbral cero), el diagnóstico
> (`medidas/c-cabecera-{1440,390}.json`) y la guarda nueva de `lib.mjs`.
>
> ⚠ **`/` no cuenta como defecto todavía**: su `h1` sale a **y=0 a los dos
> anchos** en el original, la firma de un `h1` dentro de una diapositiva
> absoluta. Mirarlo aparte antes de tocarlo.
>
> **Y una regla nueva en `CLAUDE.md`**, la cuarta sobre sondas: *un selector que
> no casa con nada no es un cero, es un defecto*. Resuelta en el sitio común
> (`Censo` en `scripts/qa/lib.mjs`); las sondas usan `__q`/`__qa`.

---

# (contexto previo) la entrada de C-3 está COBRADA

> Reescrito el **2026-07-30** al cerrar el bloque de medición de **C-3**. Para
> arrancar sesión limpia: son 5 minutos. Lo anterior (grupo C decidido en C-2,
> monográfico construido, grupo A reconocido) sigue vigente y está resumido
> abajo con su detalle enlazado — no hay que releer los docs viejos.

## Lo primero: en qué punto está

El clon tiene **11 rutas de 7 arquetipos**, todas verificadas y sin moverse un
píxel. Desde el 2026-07-30 el trabajo se mueve del **clon** al **modelado**:
censo → los 4 grupos → grupo A reconocido → grupo C reconocido (**C-1**),
decidido (**C-2**) y ahora **con su entrada de construcción medida (C-3, bloque
1 de 2)**.

> **Lo siguiente es literalmente escribir el código.** La condición de entrada
> —las siete predicciones P-C3-1…7— **ya no bloquea**: las tres que se podían
> cobrar antes de construir se cobraron y **las tres se sostienen**. Lo que
> queda del encargo C-3 son los PASOS 1, 2 y 3.

| documento | qué trae |
|---|---|
| **`docs/research/grupo-C/MEDICION.md`** | **léelo primero**: la entrada cobrada, los 5 SIN PROBAR cerrados y **las 4 cosas que mueven el modelo** |
| `docs/research/grupo-C/DECISIONES.md` | **C-2: las cinco decisiones** + el ⚠ CORRIGE al recon + el pre-registro P-C3-1…7 |
| `docs/research/grupo-C/MODELO.md` | los tres content types, **ya con los ⚠ CORREGIDO de C-3 dentro** |
| **`docs/ESQUEMA-CMS.md`** | **el destino**: Payload, cada content type, la whitelist del campo rico, migración y aceptación. §2b es el grupo C; **§2b.1 es el corrige de C-3**. Registro vivo |
| `docs/research/grupo-C/PAGE_TOPOLOGY.md` · `BEHAVIORS.md` | recon C-1, censo 76/76. Datos, cero decisiones |
| `docs/research/arquetipo-A/` | recon del grupo A (209 pg): campo rico censado 209/209 |
| `docs/research/RECON-LISTADOS.md` · `CENSO-ARQUETIPOS.md` | las 7 formas que suman 321 páginas son 4 arquetipos · cuánto le falta a la biblioteca |
| `docs/PENDIENTES-QA.md` | registro vivo de QA. **Léelo antes de tocar una página ya clonada.** Su última sección es la del grupo C |

## Lo que cobró el bloque de medición (2026-07-30)

Dos sondas nuevas, **`qa:c-cascaron`** y **`qa:c-spec`**, con salida congelada y
test en negativo. Acta en `MEDICION.md`.

| predicción | veredicto | evidencia |
|---|---|---|
| **P-C3-2** · el cascarón no esconde campos | ✅ **se sostiene** | 10 instancias adversarias (6 casos con los dos prefijos, 4 FAQ) · **131 ejes × 2 anchos · 0 con varianza** |
| **P-C3-1** · la 4ª sección del pie | ✅ **se sostiene** | idéntica **byte a byte en los 6 pares**. **D5 cerrada: cero campos** |
| **P-C3-4** · la ficha se proyecta del producto | ✅ en lo comparable | los 2 `data-id` presentes en ≥2 casos dan ficha idéntica · 0 choques |

**Cinco SIN PROBAR cerrados** — C-SP8 (migas: `Inicio > Casos de éxito > título`,
y **la del prefijo inglés apunta al índice ESPAÑOL**, evidencia nueva a favor de
D2) · **C-SP9** · **C-SP10** (cero leyendas; el `alt` es del caso, no de la
imagen) · **C-SP12** (el chip **sí** enlaza a `/es/sector/<slug>/`) · muestra de
C-SP6 (`youtube` · `vimeo` · **`kunakcloud.com`**, dominio propio).

### ⚠ Las CUATRO cosas que mueven el modelo — están ya escritas, no las redescubras

Ninguna contradice a C-2: tres resuelven condiciones que C-2 dejó escritas.
Detalle en `MEDICION.md` §5 y `ESQUEMA-CMS.md` §2b.1.

1. **`destacado` NO es texto plano** — lleva `<strong>` y `<br>` → rico **en
   línea**. Y **vive como último hijo del contenedor de `necesidad`**: ahí hay
   que renderizarlo.
2. **`detalles.parametros` NO es texto plano** — lleva `ul li sub b p` → rico. Y
   su HTML de origen es **inválido** (`<ul>` dentro de `<p>`): el parser cierra
   el `<p>` antes, así que un extractor ingenuo devuelve el campo **vacío sin
   dar error**.
3. **La FAQ tiene BARRA LATERAL** (`et_right_sidebar`, 4 widgets). **No añade
   campo** —P-C3-7 aguanta— pero es pieza de plantilla que el modelo daba por
   inexistente. Es barato en campos, no en cascarón.
4. **El producto necesita `bulletsTitulo`** con defecto `"Ventajas"`: los
   cartuchos titulan **«Especificaciones»**. `ProductPanel` lo tiene cableado.

## Lo que queda de C-3, en orden

**PASO 1 · construir.** Colecciones en `src/lib` (`casos.ts`, `faqs.ts`,
`taxonomia-sectores.ts`), detalle de caso y detalle de FAQ, rutas según D2:
prefijo como campo, las 4 inglesas bajo `/case-studies/`, **rutas cruzadas NO
emitidas**. Fichas de soluciones **por relación a productos**. Sector por
taxonomía con sus **dos proyecciones** (chip y fila de detalles) desde **un solo
dato**. Constantes a plantilla (D3). Textos verbatim, rutas locales para lo
clonado.

> **`ubicacionMapa`: el render es decisión aparte y no se hereda.**
> `MapaProyectos` de SECTOR es placeholder deliberado (S3, sin clave de GCP).
> El mapa del caso es **otro** componente (un punto, contenedor 330/290). Si se
> decide también placeholder, **se dice en voz alta** y va a `PENDIENTES-QA.md`
> con su razón. El modelo guarda las coordenadas en los dos casos.

**Lo que ya está transcrito y no hay que volver a medir**: el contenido verbatim
de las 6 instancias del mínimo adversario está congelado en
**`scripts/qa/medidas/c-spec.json`** — títulos, cliente, los tres bloques ricos
en HTML, destacado, galerías, detalles fila a fila, marcadores, `data-id` de
soluciones con su ficha completa, migas y SEO. **Se lee de ahí, no del
original.**

**PASO 2 · el mínimo adversario, ya elegido** (y es el que mide `c-spec`):

| instancia | qué eje rompe |
|---|---|
| `des-moines` | **dos términos** de sector · galería 7 · soluciones · mapa |
| `world-athletics` | **sin término** (chips vacíos) · **sin galería** · destacado |
| `rio-de-janeiro` | **prefijo inglés** · **sin mapa** (el único de 57) · galería 15 (la mayor) · destacado **con marcado** · **tabla** |
| `lindano` | **sin soluciones** · **sin parámetros** (el único de 57) · sin galería |
| FAQ `dron` | la más corta (151) |
| FAQ `calibracion-correccion` | la más larga (539) y la de más etiquetas |

Assets que hay que descargar a `public/` (**nunca se enlaza en caliente**):
22 imágenes de galería (7 + 15), 4 `og:image`, y las fotos de los 3 productos
de cartucho nuevos que sí tienen (`amoniaco` no tiene).

**PASO 3 · verificar.** Ciclo completo (matar **por puerto**, `.next` borrado,
build, **marcador**). Las predicciones que quedan, una a una, **las que puedan
fallar primero**:

- **P-C3-3** · el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed. Ojo: Río
  **lleva tabla** (§3.4 sigue abierta) y `blockquote`.
- **P-C3-5** · al emitir las rutas nuevas, **`qa:enlaces` convierte en fallo los
  `href` absolutos existentes** (los de `projects.ts`, el CTA de `sectores.ts` a
  `case-studies`, y los que haya — **se localizan con la sonda, no a mano**).
  *Refuta:* que salga limpia con los absolutos aún puestos → sería la sonda
  fallando. Corregirlos y re-correr **hasta limpia en las dos direcciones**.
- **P-C3-6** · el mapa: contenedor 330/290, un marcador.
- **P-C3-7** · la FAQ entra con `titulo + cuerpo` y no aparece ningún campo.
  (La barra lateral **no** lo refuta: no es campo.)
- **Sin regresión**: las 11 páginas anteriores contra
  `medidas/clon-base-{1440,390}-c3-antes.json`, **umbral cero**, con `MARCADOR`.

**PASO 4 · docs.** `MEDICION.md` ya existe y se amplía con el resultado de la
construcción; `PENDIENTES-QA.md` tiene ya su sección de grupo C con
C-SP13/14/15 abiertos; `ESQUEMA-CMS.md` §2b.1 tiene el corrige.

## El destino: Payload, y nada lo bloquea

**Payload self-hosted** en VPS Hostinger + Easypanel, sobre **Postgres** propio,
**embebido en la app Next**, editor **Lexical**, lectura por **Local API** (el
SSG actual se conserva). Todo el esquema en `ESQUEMA-CMS.md`.

**Cerradas**: **CMS-0b** media en volumen persistente · **CMS-0c** publicación
por **rebuild con webhook, no ISR** · **CMS-0d** `next` a **16.2.12** (Δ0 en las
11) · **CMS-0e** el cuerpo entra como **HTML crudo, convertido por entrada** ·
**T6/A-SP9** el `id` de los `h2` **se regenera** · **§1.5b** `sectores` y
`monograficos` son dos colecciones · **CMS-1** el prefijo como campo (C-2).

**Abiertas, y ninguna bloquea**: cómo se modela la tabla (§3.4) · qué hosts de
embebido se admiten (§3.3b) · **qué hace el CMS con la alineación en línea**
(§3.1 — ya **no** por falta de datos: C-3 la midió, 24 apariciones, 3 valores, 4
etiquetas).

⚠ El **recuento** de CMS-0e (16 · 3 · 5) sigue **provisional** hasta rehacerlo
con `@payloadcms/richtext-lexical` instalado. **Ningún número de ese § se cita
como firme** antes de esa corrida.

## SIN PROBAR vivos, en un sitio

**Grupo C** — **cerradas por C-3**: `C-SP1`(=D5) · `C-SP7` · `C-SP8` · `C-SP9` ·
`C-SP10` · `C-SP12`. **Siguen abiertas**: `C-SP2` (rutas cruzadas — **ya no
bloquea**, D2; la medición que la cierra está escrita: barrer las 57 leyendo
**`X-Redirect-By`**) · `C-SP3` (**ya no condiciona**) · `C-SP4` (**no
condiciona**: se decide por la salida servida) · `C-SP5` (qué es el único
`<script>`) · **`C-SP6`** (censar por host los `iframe` de los 11 casos **antes
del import**) · `C-SP11` (qué sirve `/es/case-studies/` a pelo). **Nuevas de
C-3**: **`C-SP13`** (la barra lateral, medida en 4 de 19) · **`C-SP14`**
(`bulletsTitulo`) · **`C-SP15`** (la alineación en línea).

**Grupo A** — `A-SP1`…`A-SP7`, `A-SP10`…`A-SP13` (`ESQUEMA-CMS.md` §2.3).
`A-SP8` y `A-SP9` cerradas. **No se cablea ninguno.**

**Comportamiento del grupo C** — `C-SB1`…`C-SB5` en su `BEHAVIORS.md` §6.

## Estado del clon

**7 arquetipos**, 11 rutas emitidas, todas verificadas: HOME · PRODUCTO
(`/monitor-calidad-aire`) · CATÁLOGO (`/accesorios`) · SOFTWARE
(`/software-de-medicion-calidad-del-aire`) · su variante corta (`/kunak-api`) ·
SECTOR (`/sectores/[slug]`, 4 de 8 poblados) · MONOGRÁFICO TÉCNICO (2 de 2).

`/sectores/[slug]` **despacha dos arquetipos por slug**. Dar de alta una
instancia de cualquiera es **añadir datos, sin tocar código** — la prueba de
CMS-readiness ya pasada (§5 del esquema).

**La línea base viva**: Petróleo **exacto** a 1440 (0 módulos · 0 filas · 0
secciones), EDAR −0.01; a 390, −0.23 y −0.16. Las 9 anteriores sin moverse un
píxel habiendo tocado tres componentes compartidos. Todo el residuo son **tres
módulos de imagen** con causa medida (**M-IMG**: `srcset`).

**Del experimento pre-registrado**: H1 rechazada → **dos content types**, con la
frontera en **tres campos**. **Sigue prohibido** añadirlos «de paso», ampliar
`flujo` o subir el `pb` de fila a dato sin una tanda de fusión con su plan.

## Cuánto le falta a la biblioteca

**380 páginas conocidas** en `/es` (**y 380 es un suelo**: el sitemap omite los
`noindex`). Cubiertas 13 · dudosas 20 · **sin cubrir 347**. **Por formas vamos
por el 30 %**, que es la cifra que cuenta: un arquetipo se paga una vez.

| grupo | formas | páginas | estado |
|---|---|---|---|
| **A · detalle plantillado** | blog · término · doc. científico | **209** | reconocido, no construido |
| **B · listado plantillado** | archivo de taxonomía | 23 | sin tocar |
| **C · detalle sin plantilla de cuerpo** | caso de éxito · FAQ | **76** | **decidido y con la entrada medida** ← aquí |
| **D · página del builder** | artículo de KB | 13 | hipótesis encolada con pre-registro |

La pista del grupo D, **anotada y no perseguida**: su cuerpo es lo que
`MonoSeccion[]` modela. **Se prueba con experimento pre-registrado, no de
oído**, y mientras tanto **no se toca `MonoSeccion[]`**.

## Lo que NO hay que hacer al empezar

- **No re-medir el original a mano.** El contenido verbatim de las 6 instancias
  está en `medidas/c-spec.json` y el cascarón en `c-cascaron-{1440,390}.json`.
- **No arreglar S9, S10 ni S11 sueltos** (nota de **CLASE** en `PENDIENTES-QA`).
- **No perseguir M-IMG.** Son décimas, causa escrita, se cierra con `srcset`.
- **No promocionar a campo** el sobretítulo, los títulos de bloque ni los
  rótulos del caso: están en `MODELO.md` como plantilla **con su evidencia**.
- **No añadir los tres campos del §1.3** sin tanda de fusión con plan.
- **No reabrir D5.** P-C3-1 la cerró midiendo.

## Método: lo que se paga cuando se olvida

Todo está en `CLAUDE.md`; aquí solo lo que más ha costado:

- **Identifica el RÉGIMEN antes de aplicar ningún test.** El grupo C es un
  **tercer** régimen (cabecera y pie por Theme Builder, cuerpo por PHP del tema)
  y se le aplica la lectura **plantillada**: el discriminador es la **varianza
  entre instancias**, no el test A.
- **Mide al NIVEL donde vive la propiedad.** Y C-3 añadió **la mitad que
  faltaba**: medir más **ABAJO** la invalida igual que medir más arriba —
  `c-cascaron` midió un `<p>` de dentro del contenido rico y sacó «varianza» que
  era el `style` del editor. La otra cara: `c-spec` comparó el pie **entero** y
  refutó P-C3-1 por otra sección, a punto de reabrir D5 sin motivo. **El
  veredicto tiene que cubrir exactamente la propiedad de la que habla.**
- **Las sondas llegan con defectos y dan números plausibles, no errores.** Un
  canal de verdad, **congelar la salida** (y que **el sabotaje escriba en otro
  fichero**: la primera versión pisaba la medida buena con la falsa), y
  **documentado no es conectado**. Cada arreglo **vuelve a correr el test en
  negativo entero**.
- **Un HTML inválido no da error: da un campo vacío.** `<ul>` dentro de `<p>` y
  el extractor se queda sin la lista.

## Sondas y comandos

**Se lanzan por `npm run qa:*` desde la raíz. El `--` es obligatorio.**

```bash
npm run check                            # lint + typecheck + build  ← antes de commitear
npm run build && npm run start           # tras editar: parar POR PUERTO, rehacer, relanzar
npm i --no-save puppeteer-core           # una vez (y tras CUALQUIER npm install)

npm run qa:enlaces                       # guarda de rutas locales — las dos direcciones
npm run qa:corte                         # guarda del corte del cuerpo — 12/12
npm run qa:clon-base -- 1440 --cmp medidas/clon-base-1440-c3-antes.json
npm run qa:offsets -- <ruta> 1440        # offset por nodo + HOLGURA por columna
npm run qa:mono -- edar 1440             # original vs clon, módulo a módulo
npm run qa:dos-rutas -- /a /b 1440       # dos rutas del mismo build, cara a cara
npm run qa:ruido -- 3                    # suelo de ruido, antes de juzgar nada
npm run qa:c-cascaron -- 1440            # P-C3-2 · SABOTAJE=forma es su test en negativo
npm run qa:c-spec                        # transcripción verbatim + P-C3-1
npm run qa:c-censo | qa:c-muestra | qa:c-rutas | qa:c-behaviors
npm run qa:a-censo | qa:a-embeds | qa:a-scripts | qa:a-ids | qa:a-lexical
```

Catálogo completo en `scripts/qa/README.md`. Salidas congeladas en
`scripts/qa/medidas/`.

**Las tres trampas que siguen cobrándose:**

1. **Mata el servidor por puerto, nunca con `pkill`**, y **verifica un marcador
   del cambio en el HTML servido** antes de dar una medida por buena.
   `clon-base.mjs` lo exige por `MARCADOR`; las demás **todavía no** (tarea
   mecánica pendiente: que sean dueñas de su ciclo de servidor, ~20 líneas en
   `lib.mjs`).
2. **`puppeteer-core` va con `--no-save`**, así que **cualquier `npm install` lo
   poda**. Rehacerlo antes de correr sondas.
3. **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844), y
   **capturas por viewport, nunca `fullPage: true`**.
