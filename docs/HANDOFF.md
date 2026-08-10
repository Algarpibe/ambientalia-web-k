# HANDOFF — `articulos-kb` está MODELADA y POBLADA, y el defecto de `mb` estaba atribuido a la variable equivocada

> ⚠ **Tanda 2026-08-10 (45.ª).** PASOS **1 · 2 · 6 · 7** completos. Los PASOS
> **3 (plantilla)**, **4 (ruta)** y **5 (sonda + Δ0 + lector de `c-cmp`)** **NO
> se hicieron** — se dice con su razón abajo. Registro: `ESQUEMA-CMS.md` §2d.6 ·
> `PLAN-FASE-3.md` §F3-1 · `CENSO-ARQUETIPOS.md` · `CLAUDE.md` §Test A ·
> `PENDIENTES-QA.md` (3 fichas nuevas).

## 0 · Los cuatro titulares

> **1 · EL DEFECTO DE `mb` NO ES «FUNCIÓN DEL TIPO DE COLUMNA»: MANDA EL ANCHO
> DE LA FILA.** La spec de la tanda anterior lo derivó de KB, donde **todas las
> filas miden 911.75** — así que tipo de columna y ancho de fila están
> **confundidos** y la medición no puede separarlos. Añadiendo
> `mono-modulos-{1440,390}.json` (filas de 1238.39) la confusión se deshace: un
> `1_2` de **585.13** en fila de 1238.39 lleva **34.0469**, y un `2_3` de
> **591.11** —casi el mismo ancho de columna— en fila de 911.75 lleva
> **25.0625**. La cola retroactiva del PASO 6 se contestó **al revés de como se
> preguntaba**: en los arquetipos construidos no hay nada que corregir (sus 35
> módulos de columna estrecha llevan 34.0469, medido), y **el daño lo habría
> hecho generalizar la regla de KB hacia atrás**.
>
> **2 · Y la corrección de fondo, que vale para cualquier default futuro: los
> TRES defaults de `CLAUDE.md` eran porcentajes sin decir DE QUÉ.** `57.5938 ·
> 28.7969 · 34.0469` son los valores de una página cuyo contenedor mide 1440.
> Dentro de una columna de 911.75 los tres cambian (`36.4688 · 18.2344 ·
> 25.0625`) y **ninguno da error**. Un default de ritmo se escribe **con su
> contenedor** o no se escribe.
>
> **3 · La retícula está en el esquema y la colección SEMBRADA: 39 filas · 54
> columnas · 143 módulos · 4 repartos · 56 imágenes**, derivadas de las medidas
> congeladas —**no** del HTML, que miente en 55 de 210 anclas— y con **0**
> peticiones al original. Verificado leyendo de vuelta: `mt: {valor: 2, unidad:
> "pct"}` en una fila, `anchoPct: 85` en la imagen cuadrada, **75 `movilValor`**
> en un solo documento. Un campo `number` habría guardado ese `2 %` como `2px`,
> y a 1440 se ve igual.
>
> **4 · `reparto` NO es un `select` de los cuatro repartos vistos**, y es el
> catch 1 de `MODELO.md` §2 evitado con el mismo número: `ancho` se declaró como
> **la retícula** porque desde EDAR habrían salido cuatro valores y Petróleo
> estrenó otros cuatro. KB vuelve a traer cuatro, en 6 instancias. El reparto es
> **la secuencia de `ancho` de las columnas**, con una guarda derivada: suman 1 o
> se rechaza.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| **`cms:extractor-kb`** ← nueva | **6 documentos** · 39 filas · 54 columnas · 143 módulos · repartos `4_4`×25 `1_2+1_2`×7 `1_3+2_3`×6 `1_3×3`×1 · `2 %`×3 `5 %`×2 `0.8 %`×3 `0.4 %`×1 · 26 overrides de móvil · **62 módulos con el `mb` en su defecto** |
| **`cms:extractor-kb-neg`** ← nueva | **6/6** — 5 sabotajes cayendo cada uno por SU invariante + control |
| **`cms:seed-kb`** ← nueva | 6 artículos · 39 filas · 143 módulos · **56 imágenes**, todas de `media-corpus/fase-3` |
| `npm run check` | verde · 31 rutas · `cms-campos` 10/10 |
| `qa:slugs` | LIMPIO · registro `articulos-kb` 6 · blog 7 · término 3 · productos 5 |
| `qa:lib` | **119 sondas** COMPILAN y declaran su mínimo |

**Y un número que se corrige por derivación (§sondas 9):** la consigna citaba
**31** casos legales sin ejercitar para esta colección. `qa:nunca-vistos` dice
hoy **96** — el PASO 1 le añadió el nivel de fila y las cuatro `medida`. El
instrumento **sigue sin poder ejercitarlos** (no hay catálogo que recorrer) y él
mismo lo dice: *«los contesta el seed de su arquetipo, no éste»*.

## 2 · Lo siguiente, por orden — y el orden sigue siendo de DEPENDENCIA

**Quedan 3 de los 6 pasos de §2d.4**, en el único orden posible:

1. **la plantilla** contra `docs/research/articulos-kb/components/*.spec.md`.
   Tiene que emitir **la sección propia** (`pt: 0`, campo uniforme declarado),
   **las 6 filas ocultas** (`d-none`, con el `<h1>Kunak Help Center</h1>` — no
   están en el dato porque son plantilla), el cascarón `_tb_` con su barra
   lateral, y resolver los defaults con `mbPorDefecto`;
2. **la ruta**, con sus **dos prefijos** (`prefijo` ya es campo y ya está
   sembrado con sus dos valores);
3. **sonda de dos lados + Δ0 + el lector de `c-cmp`**, que van juntos.

Después: **F3-2 · listados y hubs** (35 + 107, capturados, modelo decidido,
bloqueada por `P-LH-C6`) · **§DEFECTO-SUB-EDAR** (tanda propia) · operación sin
cambios (`Dockerfile` sin verificar, `PREVIEW_SECRETO`).

## 3 · Lo que NO hay que hacer al empezar

- **No leer «POBLADA» como cobertura.** Las 6 rutas **no se emiten**, y todas las
  sondas de este repo leen **HTML servido**: su cobertura es **cero por
  construcción**, no por descuido. Estado nombrado en `CENSO-ARQUETIPOS.md`:
  **POBLADO y no SERVIDO**.
- **No declarar la familia de `articulos-kb` en `c-cmp` todavía** — sigue sin
  haber contra qué ejercitar el lector. Va **en la misma tanda que emita las
  rutas**, y entonces la guarda que ya está puesta tiene que **dejar de saltar
  por sí sola**: eso se comprueba, no se supone.
- **No usar el `h1` como base en crudo.** Está **oculto en las 6** y su `y` es 0
  en los dos lados: heredar el ancla del protocolo da **Δ0 por construcción**.
  Elegir el ancla es parte del PASO 5.
- **No medir píxeles contra la captura.** Renderiza y **miente en 55 de 210
  anclas** (§F3-1-CSS-NO-CAPTURADO). Sirve para la ESTRUCTURA, no para el estilo.
- **No cablear el default de `mb`.** Y ojo: **tampoco el de la spec** — es el
  ancho de la FILA, no el tipo de columna. Se llama a `mbPorDefecto()`, que tira
  ante una fila sin medir.
- **No re-correr `cms:seed-kb` sobre una colección con datos**: exige vacía, y
  tira si no lo está.
- **No dar por buena la cabecera y el pie de KB** — salen con varianza cero en el
  ORIGINAL pero **nunca se han comparado contra el clon**
  (§F3-1-CASCARON-KB-SIN-COMPARAR).

## 4 · Por qué pararon los PASOS 3-5, dicho sin adornos

**No hubo hallazgo que lo impidiera: se acabó la tanda.** Los tres son trabajo de
construcción con su spec delante y sin decisión abierta — la plantilla tiene sus
1519 pares nodo × propiedad medidos, la ruta tiene su campo `prefijo` poblado, y
la sonda tiene su arquetipo poblado contra el que correr. Lo que hay que saber
antes de retomarlos está en §2 y §3 de arriba.

---

# (anterior) HANDOFF — `articulos-kb` tiene SPECS, y el PASO 0 que nadie había planteado dice dónde se pueden medir

> ⚠ **Tanda 2026-08-10 (44.ª).** PASOS 0 · 1 · 2 · 5 · 6 completos. El **PASO 3
> (la construcción) NO se hizo**, y el **PASO 4 (el lector de `c-cmp`) se
> contestó otra vez con un NO, con razón nueva**. Specs:
> `docs/research/articulos-kb/`. Registro: `ESQUEMA-CMS.md` §2d.5 ·
> `PLAN-FASE-3.md` §F3-1 · `PENDIENTES-QA.md` (5 fichas nuevas).

## 0 · Los cinco titulares

> **1 · LA CAPTURA NO SIRVE PARA MEDIR SPECS, y no porque salga desnuda: porque
> sale PLAUSIBLE.** De las **19 hojas externas** que el HTML de KB pide, la
> captura congelada tiene **0** — y aun así renderiza, porque trae **184 KB de
> CSS en línea**. Resultado medido de dos lados (`qa:kb-css`, 6/6): **155 de 210
> anclas de estilo coinciden y 55 no**. Medir ahí no habría dado ningún error;
> habría dado **una spec con 55 valores inventados**. El peor:
> `columna.width` **678.52 offline contra 430.80** en el original — sin las hojas
> la partición en columnas no ocurre y todas salen de ancho completo, o sea **una
> spec que afirma con número que el cuerpo es plano**, que es justo el defecto
> que paró el PASO 4.
>
> **2 · Y de ahí la frase de F3-0 con su alcance, por tercera vez sobre la misma
> campaña.** El original está fuera del camino crítico **para obtener datos**
> —sembrar, censar, transcribir, auditar el texto— y **NO lo está para medir el
> píxel**. Capturar las páginas no es capturar sus assets: primero fueron las 56
> imágenes, luego los cuerpos de SECTOR/MONOGRÁFICO, ahora las hojas de estilo.
>
> **3 · Las specs existen y el cuerpo NO es plano, con test detrás.** 1 sección
> propia por artículo (6/6) · **45 filas**, 6 ocultas (`d-none`, con el
> `<h1>Kunak Help Center</h1>` dentro — el `h1` de estas páginas está OCULTO en
> las 6) y 39 visibles con **cuatro repartos**: `4_4`×25 · `1_2+1_2`×7 ·
> `1_3+2_3`×6 · `1_3×3`×1. `fila.reparto` sale **CAMPO por test B**. Reconcilia
> con el `4_4`×31 del acta anterior: **25 visibles + 6 ocultas**.
>
> **4 · Los dos tests necesitaron CUATRO correcciones, y tres salieron de que la
> salida se contradecía a sí misma.** (a) el veredicto se da **por PROPIEDAD, no
> por nodo** —`fila.paddingTop` salía CAMPO×17 y PLANTILLA×13 con **el mismo par
> de valores**—; (b) el test B tiene un **falso positivo no escrito**, la REGLA
> POSICIONAL (`columna.marginRight` = 50.1406 en toda no-última y 0 en toda
> última, en las 60); (c) el test A **no se aplica en píxeles a la caja** pero
> **sí en RAZÓN contra el padre**, y así sale `anchoPct` medido (85 %×6 · 50 %×4 ·
> 40 %×2) en vez de inventado; (d) **`0px` es el caso degenerado del test A** —es
> a la vez «escribió 0» y «no hay nada»— y se discrimina con el default.
>
> **5 · Y el hallazgo que habría costado 59 módulos: EL DEFAULT DE `mb` NO ES UN
> NÚMERO, ES UNA FUNCIÓN DEL TIPO DE COLUMNA.** `34.0469` en las 59 columnas
> `4_4` y `25.0625` en las 13 estrechas, **sin una excepción** — y ninguno de los
> dos es el 2.75 % de su propio contenedor (`34.0469` es el 2.75 % de **1238.39**,
> la fila del *cascarón*). Cablearlo como constante se equivoca en uno de los dos
> grupos por ~9 px.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| **`qa:kb-css`** ← nueva | **6/6 pares captura-vs-original** · 19 hojas externas · **0 capturadas** · 55/210 anclas de estilo distintas · 36/36 de caja · árbol **6/6 idéntico** |
| **`qa:kb-spec [1440\|390]`** ← nueva | **6/6 artículos** a cada ancho · 0 selectores muertos · el árbol entero con `getComputedStyle` |
| **`qa:kb-tests`** ← nueva | **1519 pares (nodo × propiedad)** clasificados · 18 SIN PROBAR, nombrados uno a uno |
| `qa:lib` | **119 sondas** COMPILAN y declaran su mínimo · 0 no conformes |

**Corrida conservada como artefacto (regla 7):**
`kb-css-SONDA-ANCLA-EN-FILA-OCULTA.json` — la primera versión anclaba en
`.et_pb_row` a secas, que en las 6 páginas es `et_pb_row_0` con `d-none`, o sea
**comparaba una fila oculta contra una fila oculta que se ve**. Es el aviso de
*«antes de creerte un pleno, reconstruye un caso a mano»* cobrado en la sonda que
estrena el PASO 0.

## 2 · Lo siguiente, por orden — y el orden NO es de valor, es de dependencia

**F3-1 PASO 4 sigue abierto: 1 de sus 6 pasos está hecho** (§2d.4). Los cinco
que quedan, en el único orden posible:

1. **filas/columnas en el esquema, con su migración.** `articulos-kb.cuerpo` es
   `blocks` plano y necesita el nivel FILA con `reparto`. **La colección está
   VACÍA**, así que no hay dato que migrar — sólo esquema;
2. **extractor + seed.** ⚠ **No puede leer `style=`**: hay **0** estilos en línea
   en las 45 filas y los 149 módulos (Divi lo compiló a `et-core-unified`). Su
   entrada son **las medidas congeladas `kb-spec-{1440,390}.json`** —la captura
   del estilo computado, reproducible y commiteada— más el HTML congelado para el
   verbatim. **Los dos anchos hacen falta: uno solo no distingue px de %**;
3. **plantilla** contra `components/*.spec.md`;
4. **ruta** (dos prefijos; `prefijo` ya es campo);
5. **sonda de dos lados + Δ0 + el lector de `c-cmp`**, que van juntos.

Después: **F3-2 · listados y hubs** (35 + 107, ya capturados, bloqueada por
`P-LH-C6`) · **§DEFECTO-SUB-EDAR** (tanda propia, paga su Δ0) · operación sin
cambios (`Dockerfile` sin verificar, `PREVIEW_SECRETO`).

## 3 · Lo que NO hay que hacer al empezar

- **No medir specs, ni Δ0, ni nada de píxeles contra la captura.** Renderiza y
  **miente en 55 de 210 anclas**. Sirve para la ESTRUCTURA (el árbol sale
  idéntico 6/6, y por eso `qa:kb-recon` es válida) y **no para el estilo**.
- **No cablear «el default de `mb`» como una constante.** Es una función del
  tipo de columna, medida sin excepción en 72 módulos.
- **No escribir el campo de ritmo de fila como un `number`.** El editor escribió
  px absolutos **y** porcentajes (`2·5·0.8·0.4 %`), y **a 1440 son el mismo
  número**. Los separa que el default de Divi cambia de unidad al apilar
  (`2 %` → `30px` plano) y un % del editor no.
- **No declarar la familia de `articulos-kb` en `c-cmp` todavía**, y la razón ha
  CAMBIADO: ya no es que falten anclas —las specs las tienen— sino que **no hay
  contra qué ejercitar el lector**, porque las 6 rutas siguen sin emitirse. Un
  lector sin estrenar es peor que una guarda armada. Va **en la misma tanda que
  emita las rutas**.
- **No usar el `h1` como base en crudo de este arquetipo.** Está **oculto en las
  6** y su `y` es 0 en los dos lados: heredar el ancla del protocolo da **Δ0 por
  construcción**. Elegir el ancla es parte del trabajo.
- **No leer «`articulos-kb` está ESPECIFICADO» como avance de construcción.**
  Es 1 de 6 pasos, y su cobertura sigue `·` en los nueve ejes.
- **No dar por buena la cabecera y el pie de KB.** Salen con varianza cero en el
  ORIGINAL, pero **nunca se han comparado contra el clon** — `c-cabecera` cubre
  17 rutas y ninguna es de KB (§F3-1-CASCARON-KB-SIN-COMPARAR).

---

# (anterior) HANDOFF — el escalón CERRADO SIN ARBITRAR, y `articulos-kb` parada un escalón más arriba

> ⚠ **Tanda 2026-08-09 (43.ª).** PASOS 1 · 2 · 3 · 5 · 6 · 7 completos. El
> **PASO 4 paró en dos huecos que ninguna salida costeada contemplaba**, que era
> su salida prevista por la consigna. Acta del arbitraje: `ESQUEMA-CMS.md`
> §2d.3. Acta de la parada: §2d.4. Clase nueva: `PENDIENTES-QA.md`
> §CLASE-INLINE-PRESTADO.

## 0 · Los cinco titulares

> **1 · EL DILEMA NO SE ARBITRÓ: SE DISOLVIÓ, y lo disolvió preguntar sobre qué
> POBLACIÓN se derivó el tipo.** `MODULO_TEXTO` se calibró sobre `MonoInline`,
> que es **dato transcrito a mano** — y **una transcripción no se puede auditar
> contra sí misma**: lo que no se transcribió no está ahí para contarlo. Medido
> contra el original, en prosa: **SECTOR/MONOGRÁFICO traen 12 etiquetas fuera
> del tipo y KB trae 7.** El tipo no se le quedaba corto al recién llegado —
> **estaba corto para sus propios consumidores desde el principio**, y KB fue
> sólo el primero que se midió contra el sitio en vez de contra su copia.
>
> **2 · Hubo que CAPTURAR el original otra vez, y la razón que lo dejó fuera es
> la que produjo el hueco.** Los cuerpos de SECTOR y MONOGRÁFICO **no estaban en
> ningún corpus** —0 de 309, 0 de 272— excluidos con la razón escrita *«CONSTRUIDA
> completa: el cuerpo es dato tipado transcrito»*. Correcta para **sembrar**;
> exactamente la equivocada para **auditar**, porque los excluyó *por* estar
> transcritos, o sea *por* ser lo que había que comprobar. 8/8 capturados,
> denominador propio en `corpus/fase-3-sectores/`.
>
> **3 · El segundo testigo estaba en el repo desde julio: la transcripción
> improvisó TRES veces en un fichero.** `monografico.ts` aplana `<sub>` a negrita
> (l. 585), usa el carácter Unicode `H₂S` 40 líneas más allá (l. 627) e inventa
> un `kind: "tabla"` (l. 622) para el `<table>` que no cabía. **Tres apaños
> distintos para la misma carencia es la firma de un tipo corto**, no de tres
> decisiones. Y de ahí sale un **defecto VIVO**: EDAR sirve `H2S` donde el
> original sirve `H₂S` —4 de 5 `<li>`, 41 `<sub>` en la página— en una ruta dada
> por verificada.
>
> **4 · El PASO 4 paró, y no por el texto: por DOS huecos nuevos.** (a) el
> `cuerpo` de `articulos-kb` es **plano** y el original tiene **45 filas** con
> 1·2·3 columnas (`4_4`×31 · `1_2`×14 · `1_3`×9 · `2_3`×6); (b) **este arquetipo
> no tiene fase de SPECS** — `grupo-D/` no tiene `components/`. Sin specs la
> plantilla se inventa y el «Δ0 contra el original» deja de medir fidelidad.
> **Un criterio de «hecho» no comprueba que exista lo que hace falta para
> cumplirlo.**
>
> **5 · Y el PASO 5 se contestó con un NO, que es su resultado.** El lector de
> `c-cmp` **no se escribe todavía**: un lector son **anclas**, y las anclas salen
> de las specs que no existen — inventarlas es el fallback `A-blog` con otro
> disfraz. La **guarda sí está puesta y verificada leyendo el código**
> (`c-cmp.mjs:128`, exit 2 ante familia sin declarar), así que el día que las 6
> rutas se emitan la sonda se para sola. Declararle la familia hoy **desactivaría
> esa guarda a cambio de nada**.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| **`cms:captura-sectores`** ← nueva | **8/8 páginas · 2.5 MB · 0 fallos** — la población que faltaba |
| **`qa:texto-poblacion`** ← nueva · `-neg` | **14 páginas · 2 poblaciones · 7 vs 12 etiquetas fuera del tipo** · neg **4/4** · control contra `kb-recon` al carácter |
| `qa:nunca-vistos` | **208 de 296** sin moverse · fuera del universo **105 en 8 colecciones** (`articulos-kb` **31**, era 37: el número se mueve con el esquema) |
| `qa:lib` | **116 sondas** COMPILAN y declaran su mínimo · 0 no conformes |
| `npm run check` | **verde** (lint + typecheck + build + slugs + cms-campos 10/10) |
| migraciones | `20260809_135819_f3_texto_kb_rico` + `20260809_135857_f3_kb_retira_compartidos`, **aplicadas** |

## 2 · Lo siguiente, por orden de valor

1. **F3-1 PASO 4, y su orden es OBLIGADO** (§2d.4): **specs del arquetipo** →
   filas/columnas en el esquema con su migración → extractor + seed → plantilla
   → ruta → sonda de dos lados + Δ0 + lector de `c-cmp`. **Saltarse las specs es
   construir contra una plantilla inventada**, y entonces el Δ0 no prueba nada;
2. **F3-2 · listados y hubs** — sigue siendo el de más rendimiento (35 páginas +
   107 rutas), y **sigue bloqueada por `P-LH-C6`** (la pasada de comportamiento).
   Ojo: sus 142 = 35 + 107 ya están capturados y reproducen LH-2 al número;
3. **§CLASE-INLINE-PRESTADO** — el `H₂S` de EDAR. Es un **defecto vivo**, no un
   pendiente de modelo, y su arreglo es el ensanchamiento de `MonoInline` +
   render + `mapeo`/`vuelta` **con su round-trip 63/63 antes y después**;
4. operación, sin cambios: `Dockerfile` **sin verificar** y `PREVIEW_SECRETO`.

## 3 · Lo que NO hay que hacer al empezar

- **No leer «un ensanchamiento toca lo poblado» como una prohibición.** Es
  **retrocompatible**: el tabú protege de estrechamientos y de campos nuevos
  requeridos, y **no aplica**. Lo que sí cuesta es el round-trip, y ésa es la
  razón por la que se aplazó — decir la otra manda a la tanda siguiente a elegir
  por un motivo falso.
- **No declarar la familia de `articulos-kb` en `c-cmp` «para dejarlo listo».**
  Sin lector medido eso apaga la única guarda que hoy protege al arquetipo.
- **No citar «37 casos de `articulos-kb`» ni «111 fuera del universo».** Con el
  esquema de hoy son **31** y **105**. El número se mueve con el esquema, que es
  justo lo que lo hace útil.
- **No dar por buena la cobertura de `articulos-kb`:** sigue `·` en los nueve
  ejes, y lo seguirá hasta que emita rutas Y tenga lector.
- **No re-medir la población del texto.** Está congelada en
  `medidas/texto-poblacion.json` con su control; la corrida defectuosa se
  conserva aparte (`-SONDA-SOBRECASABA-ANFITRIONES`) y **no es una medida del
  sitio**.

---

# (anterior) HANDOFF — FASE 3 ABIERTA: el original FUERA del camino crítico, y `articulos-kb` parada en su escalón

> ⚠ **Tanda 2026-08-09 (42.ª).** PASOS 0 · 1 · 3 · 4 · 5 completos; el **PASO 2
> paró en el ESCALÓN con la evidencia congelada**, que era su salida prevista.
> La FASE 3 queda abierta con plan, con captura y con un arbitraje declarado.
> Plan nuevo: `docs/PLAN-FASE-3.md`. Escalón: `PENDIENTES-QA.md`
> §F3-1-ESCALON-TEXTO. Modelo medido: `ESQUEMA-CMS.md` §2d.2.

## 0 · Los cinco titulares

> **1 · EL ORIGINAL SALE DEL CAMINO CRÍTICO, DEFINITIVAMENTE — y hubo que
> capturarlo DOS veces para poder decirlo.** La campaña congeló **272 registros
> de HTML (69.4 MB)** y **337 ficheros de media (101.5 MB)**, 0 fallos en las
> dos. La primera acta ya decía la frase y **era falsa a medias**: al intentar
> sembrar salió que **0 de las 56 imágenes de `articulos-kb` estaban
> capturadas**. *Capturar las páginas no es capturar sus assets* — y lo destapó
> **usar la captura para algo**, no releer el acta.
>
> **2 · La lista se derivó de SEIS fuentes y el sitemap no aportó NI UNA en
> exclusiva.** Sus 370 URLs de `/es` ya eran alcanzables desde el corpus
> congelado: la captura de F2-2 era un **superconjunto** del sitemap y nadie lo
> había comprobado. Lo que sí apareció: **`/es/author/*`, 34 rutas vivas** (29
> sólo en `author/kunak`) con **0 URLs en el sitemap**; `/es/categoria/*` con
> **dos formas acentuadas** que 301; `/es/sector/*` a medias (5 de 11 redirigen).
> Y `listados` dio **142 = 35 + 107**, reproduciendo la paginación de LH-2 **al
> número** nueve días después.
>
> **3 · El PASO 2 paró donde tenía que parar: el módulo de TEXTO compartido NO
> expresa lo que trae el corpus.** 85 módulos `et_pb_text`, **16 etiquetas
> dentro**, **7 fuera del tipo** (`span×50 · sub×7 · a×5 · i×4 · em×2 · img×1 ·
> sup×1`). §2d.1 escribió que este arquetipo *«consume las definiciones
> compartidas sin cambiarlas»* y **PD2 acierta en imagen y botón y falla en
> texto**: se midió sobre KINDS de módulo, no sobre la forma de sus campos. Es
> el `<sup>` de `productos.bullets` otra vez, ×7.
>
> **4 · Lo que sí quedó medido y construido: `blurb` y `gallery`.** 36 blurbs en
> 3 artículos → `imagen` **opcional** (30/36), `descripcion` **opcional**
> (24/36), nivel del titular **campo** (h4×27·h3×9), `reticula` **campo con TRES
> valores** (iconos×24 · col-md-4×9 · **ninguna**×3), enlace **0/36 ⇒ no
> existe**. Lo que sale 36/36 **no se cableó**: cero varianza no prueba
> plantilla. Migración versionada aplicada y `npm run check` **verde**.
>
> **5 · Dos instrumentos mentían, y los dos por la misma familia.**
> `qa:nunca-vistos` decía «296 casos que el ESQUEMA admite» y eran los de las
> colecciones **con catálogo**: se le añadieron 2 bloques a `articulos-kb` y el
> número **no se movió ni un carácter** — la colección entera era invisible (hoy
> declara **111 casos en 8 colecciones** que no puede ejercitar, 37 de ellos de
> `articulos-kb`). Y `c-cmp` clasificaba la forma con una cascada terminada en
> **`return "A-blog"`**: una familia nueva se habría medido con el lector del
> blog — anclas que **sí existen** en el DOM, sobre la página equivocada, y
> números plausibles. Arreglado antes de construir y verificado como **no-op**.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| **`cms:captura-f3`** ← nueva · `-neg` | **272 registros · 107 base + 165 de paginación · 0 fallos** · neg **4/4** |
| **`cms:captura-f3-media`** ← nueva | **337 ficheros · 101.5 MB · 0 fallos** |
| **`qa:kb-recon`** ← nueva | **6/6 artículos, offline** (25–44 peticiones a la red BLOQUEADAS por página) · 0 selectores muertos |
| `qa:nunca-vistos` (alcance corregido) · `-neg` | **208 de 296** sin moverse **+ 111 declarados fuera** · neg **4/4** |
| `qa:lib` | **114 sondas** COMPILAN y declaran su mínimo |
| `npm run check` | **verde** (lint + typecheck + build + slugs + cms-campos 10/10) |
| `c-cmp` (fallback arreglado) | reparto **31 rutas → 10 formas · 0 desconocidas** (control offline contra el manifiesto) |

## 2 · Lo siguiente, por orden de valor

1. **Decidir §F3-1-ESCALON-TEXTO** y terminar `articulos-kb`. Las dos salidas
   están escritas con su coste; **A** (`campoHtml` en un módulo propio de KB) es
   la que CMS-0e, §3.1d y `CLAUDE.md` §Dónde para el modelado ya implican, pero
   **se decide con pre-registro**, no de paso — cambia una decisión escrita;
2. **F3-2 · listados y hubs** — 4 arquetipos que cubren 35 páginas + 107 rutas,
   con modelo ya decidido en `listados-hubs/DECISIONES.md`. **Bloqueada por
   `P-LH-C6`** (la pasada de comportamiento: hover · AJAX · lazy · orden entre
   cargas), que es además el primer mordisco al eje `comportamiento` **0/31**;
3. **F3-4 · las tres familias de archivo** que ningún censo tenía
   (`categoria`/`author`/`sector`): ya están capturadas, falta modelarlas;
4. operación, sin cambios: `Dockerfile` **sin verificar** y `PREVIEW_SECRETO`.

## 3 · Lo que NO hay que hacer al empezar

- **No cablear la salida A del escalón sin su acta.** §2d.1 dice hoy lo
  contrario y es una decisión con predicado pre-registrado: se corrige con otra,
  no con un commit de código.
- **No leer «el original sale del camino crítico» como «ya no hace falta».**
  Sigue haciendo falta para **medir el píxel** (el Δ0 de dos lados). Lo que ya no
  hace falta es pegarle para **obtener datos**.
- **No sumar los 111 «fuera del universo» a los 208.** Son dos preguntas: los 208
  el seed **podría** ejercitarlos y no lo hace; los 111 **no puede**, porque no
  hay filas. Fundirlos mueve un número que hay actas citando.
- **No citar `blurb ×36` del inventario del grupo D.** La captura da **×18** por
  tres recuentos independientes, y el instrumento viejo **no existe en el repo**
  para adjudicarlo (regla 2). La decisión no se mueve; el número sí.
- **No dar por buena la cobertura de `articulos-kb`:** es `·` en los nueve ejes,
  y lo será hasta que emita rutas y `c-cmp` tenga su forma y su LECTOR.

---

# (anterior) HANDOFF — FASE 2 CERRADA: el escalón arbitrado con la medida delante, y la prueba final entera en verde

> ⚠ **Tanda 2026-08-08 (41.ª).** PASOS 1 · 2 · 3 · 4 · 5 completos. El único
> arbitraje que quedaba abierto —§F2-5-ESCALON-ETIQUETAS— **está cerrado**, y no
> por criterio propio: **por medición del original**. La FASE 2 queda cerrada sin
> arbitrajes pendientes. Acta de fase en `PLAN-FASE-2.md` §F2-5 CERRADA y
> §ESTADO DE LA FASE 2; decisión de esquema en `ESQUEMA-CMS.md` §7e.

## 0 · Los cinco titulares

> **1 · La medida disolvió la mitad de la pregunta: la «contradicción escrita»
> del tipo NO EXISTÍA.** La ficha del escalón imputaba a `types/kunak.ts:394`
> una contradicción —*«`0..n` en prosa y negado en el tipo»*—. Falso: **un array
> NO-OPCIONAL de longitud 0 ES «0»**. El tipo dice *la clave está siempre, la
> lista puede estar vacía*, que es exactamente lo que hace el original. Y
> `[slug]/page.tsx:163` tampoco cede: **ya era la fidelidad medida** — el
> original OMITE el bloque en las 8, y `etiquetas.length > 0 &&` es justo eso.
> **De tres piezas «cada una coherente», dos eran además CORRECTAS.**
>
> **2 · Lo que cedió fue `mapeo.mjs`, y por ESTRECHAMIENTO, no por borrado.**
> «LA LISTA VACÍA» decía *«se elige AUSENTE; 46 filas dan 0 arrays vacíos
> explícitos»*: las dos mitades ciertas y **la conclusión no se seguía** — «0
> vacíos» dice que la preimagen es única EN ESE DOMINIO, y el dominio eran 7
> entradas de 149. Regla nueva (§7e): **una lista vuelve `[]` salvo que el campo
> declare `vaciaEsAusente`**, y el discriminador **se DERIVA de la ida** (40
> listas · 35 siempre presentes · **5 omitibles, que son las 5 que el tipo
> declara opcionales: 40/40**). El defecto se invierte a propósito: olvidar
> declarar un omitible hace fallar el round-trip **en el acto**; olvidar lo
> contrario no falla nada y mata el render delante del editor.
>
> **3 · Y la prueba de que no cableó nada es que NO MOVIÓ NADA.**
> `cms-roundtrip` **63/63** y `cms-lectura` **63/63** sin moverse;
> `clon-base` **31/31 sin mover un píxel** a 1440 y a 390. El cambio es un
> **NO-OP sobre todo lo medido** — sólo difiere en el caso que el corpus tiene
> (8 de 149) y el seed no. Efecto verificado por MEDIDA, no por diff.
>
> **4 · La prueba final ya no es un acta: es una SONDA, y salió 6/6 con la mitad
> del producto dentro.** `qa:f25-final` — el editor da de alta **entrada sin
> etiquetas** Y **producto**; las guardas la acogen (slug + webhook con SU
> credencial); **`next build` exit 0 en 31.37 s, 31→32 rutas** *(el caso que
> mató a la 40.ª)*; el eje `href` cubre el alta del admin; y deshecho el alta y
> reconstruido, **31 rutas y DB sin residuo**. Negativo 4/4.
>
> **5 · El pre-vuelo sacó la 4.ª instancia de la clase, y la sacó por barrido.**
> `tipo-hoja` tenía **DOS ejes con DOS anclas** y los dos leían el seed: «tipo de
> hoja» pregunta si el esquema expresa lo MEDIDO —seed, correcto— y **`href`**
> pregunta si el build emite la ruta —**DB**—. Re-anclado: **9/9 → 10/10** con el
> alta del admin dentro. La 5.ª (`clase-rango`) queda fichada **con la razón de
> no arreglarla ahora**, que es parte del resultado.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| **`qa:escalon`** ← nueva · `-neg` | **149/149 entradas del corpus · 8 sin etiquetas · el original OMITE, 1 sola forma · rótulo 141/141** · neg **5/5** |
| **`qa:f25-final`** ← nueva · `-neg` | **6/6 invariantes** (31→32→31 rutas, DB sin residuo) · neg **4/4** |
| **`qa:nunca-vistos`** ← nueva · `-neg` | **208 de 296 casos legales sin ejercitar** (128 ausente · 43 vacía · 37 valor) · neg **4/4** |
| `qa:cms-decl` (4.ª declaración) · `-neg` | **63 rutas en las dos direcciones** · neg **8/8** (2 sabotajes nuevos) |
| `qa:tipo-hoja` (eje href re-anclado) · `-neg` | **10/10 productos desde la DB · 0 defectos** · neg **10/10** (2 sabotajes nuevos) |
| `qa:cms-roundtrip` · `qa:cms-lectura` | **63/63 · 63/63** — sin moverse tras tocar la proyección |
| `qa:clon-base` @1440 · @390 | **31/31 sin mover un píxel** contra `f25-paso0` (×2) |
| `qa:slugs` · `qa:manifiesto` · `qa:enlaces` · `qa:corte` · `qa:lib` · `check` | 3 familias · 31 rutas · 868 hrefs limpio · 12/12 · **113 sondas con contrato** · verde |

## 2 · Lo siguiente — Fase 3, que es AÑADIR

**No queda ningún arbitraje de la FASE 2.** Lo que sigue está en
`PLAN-FASE-2.md` §ESTADO DE LA FASE 2, con dueño y naturaleza. Por orden de
valor:

1. **la biblioteca pendiente = Fase 3**: `articulos-kb` (dato sin plantilla) ·
   listados/hubs (35+107 rutas, §4b) · la cola larga del corpus (casos 4/57,
   blog 7/149…). Es **añadir arquetipos e instancias, no cambiar** lo
   construido;
2. **los 208 casos sin ejercitar** — inventario abierto CON instrumento
   (`qa:nunca-vistos`) y cola de trabajo (`qa:f25-final`). Prioridad natural:
   los `ausente` cuyo tipo medido es **no-opcional**, que es la firma exacta del
   escalón. Pide cruzar el AST de `types/kunak.ts` con la config por
   OPCIONALIDAD, que hoy `qa:cms-campos` hace por RUTA;
3. **operación**: `Dockerfile` **sin verificar** (nadie ha construido la imagen)
   y `PREVIEW_SECRETO` que quien despliegue tiene que poner;
4. instrumento: §F2-4-CHUNK-CSS · §F2-3-EXIT-FETCH (27 sondas) · el eje
   `comportamiento` **0/31** de `COBERTURA-MEDICION.md`, que sigue siendo el
   hueco mayor.

## 3 · Lo que NO hay que hacer al empezar

- **No leer «208 casos sin ejercitar» como 208 defectos.** Es cobertura
  declarada. Los 43 `vacía` **tienen respuesta decidida y guardada** (§7e):
  *sin ejercitar* ≠ *sin decidir*.
- **No «simplificar» la regla de §7e a «todas vuelven `[]`».** Las 5 declaradas
  `vaciaEsAusente` corresponden a campos que el tipo medido declara
  **opcionales**; quitarles la declaración rompe `qa:cms-roundtrip` por FORMA —
  y ése es el punto: el defecto está puesto en la dirección que grita.
- **No buscar la entrada 71** (`guia-cms-traspaso-f25`): ya no está, se perdió en
  un reseed. No hace falta — `qa:f25-final` recrea el caso y lo borra en cada
  corrida, que es mejor semilla que una fila que hay que acordarse de no borrar.
- **No correr `qa:f25-final` con otra sonda en vuelo**: construye dos veces y le
  cambiaría el `.next` por debajo a quien esté midiendo.
- **No dar por buena una base de `clon-base` por su fecha.** La de cierre de esta
  tanda es **`f25-paso2`**; la anterior, `f25-paso0`.
- **No leer un `qa:enlaces` o `qa:corte` en rojo como regresión sin mirar el
  puerto**: las dos esperan un `next start` en `:3000` y **no lo levantan
  ellas** — un `ECONNREFUSED` es eso, no un defecto del clon.

---

# (anterior) HANDOFF — F2-5 EJECUTADA y FASE 2 al completo: la prueba final PARÓ EN EL ESCALÓN, que era su salida prevista

> ⚠ **Tanda 2026-08-08 (40.ª).** PASOS 0 · 1 · 2 · 3 · 5 completos; el PASO 4
> corrió hasta el ESCALÓN y **paró con la evidencia congelada, como mandaba la
> consigna**. La FASE 2 queda ejecutada entera con UN arbitraje abierto
> (§F2-5-ESCALON-ETIQUETAS). Acta de fase en `PLAN-FASE-2.md` §F2-5 y §ESTADO
> DE LA FASE 2; manual de traspaso nuevo en `docs/TRASPASO-CMS.md`.

## 0 · Los cinco titulares

> **1 · El alta del EDITOR pasó TODAS las guardas de entrada y el RENDER
> murió — y eso es el hallazgo, no el fracaso.** La cuenta editor (sin repo)
> dio de alta una entrada desde el formulario en español; esquema, registro de
> slug y webhook la acogieron (disparo real con su sesión, motivo
> `entradas-blog:guia-cms-traspaso-f25 create`); `next build` murió
> prerenderizándola: `undefined.length`, exit 1 a los 35.91 s. **Tres piezas
> documentadas, cada una coherente, cuya composición nadie arbitra**:
> `mapeo.mjs:501` (un `hasMany` vacío proyecta `undefined` — «LA LISTA
> VACÍA»), `types/kunak.ts:394` (`etiquetas: TerminoA[]` no-opcional con el
> comentario diciendo «0..n») y `[slug]/page.tsx:163` (`.length` sin guarda).
> Las 7 entradas transcritas de 149 traen todas etiquetas: el caso ausente
> estaba SIN PROBAR. **Se PARA porque arreglar sin medir el original sería
> inventar el contrato** — ficha §F2-5-ESCALON-ETIQUETAS con las tres salidas
> y sus costes.
>
> **2 · La contención de F2-4 funcionó en su PRIMER fallo real, medida en
> producción de la prueba:** nada se promocionó — home 200, la ruta nueva 404,
> el build anterior entero — y `GET /estado` conservó `ultimoFallo` con la
> cola del build (lo que ve el editor). **El lazo diagnóstico se cerró con UNA
> variable**: la misma fila pasada a borrador ⇒ build verde y promocionado en
> 38.29 s, 31 rutas. Publicada falla, borrador pasa: el elemento era esa fila.
>
> **3 · §F2-3-HREF-DERIVADO CERRADA, y la regla devolvió el dato medido
> exacto.** La vuelta compone el CANDIDATO local; el proyector aplica la regla
> de rutas locales con «construido» DERIVADO del árbol de `app/` (la ENTRADA
> del build — el manifiesto es su SALIDA y no existe cuando el render corre);
> `qa:tipo-hoja` cierra el lazo contra el manifiesto real, en VEREDICTO.
> Medido: **9/9 coinciden con el dato medido** — el catálogo ya cumplía la
> regla; era la vuelta quien la rompía. La carga RSC devolvió los +24 por
> referenciado exactos (la inversa de los −24·−72 de F2-3), con el visible a
> Δ0 en las 31 y `clon-base` 31/31 a los dos anchos.
>
> **4 · Los roles existen y el webhook NO distingue quién guarda — medido, no
> supuesto.** `usuarios.rol` (migración `roles_f25`, defecto `editor`: a quien
> olvide elegir le falta poder, no le sobra), acceso en el paquete compartido,
> y la escalada cae por hook CON MENSAJE — a propósito no es un `access` de
> campo, porque un campo negado se descarta EN SILENCIO. `qa:roles` 8/8 por
> Local API con `overrideAccess: false` (R7: 1 guardado de editor ⇒ 1 disparo
> con su credencial) · negativo 3/3 cayendo cada sabotaje POR SU invariante.
>
> **5 · Y el pre-vuelo cazó a `qa:slugs` anclada al SEED — la clase de F2-3
> titular 5, declarada ANTES de tropezar con ella.** Su comprobación C leía el
> catálogo del plano de `src/lib/arquetipo-a.ts`, que dejó de ser la fuente
> del build en F2-3: el alta legítima habría salido HUÉRFANA — la guarda
> rechazando exactamente lo que la fase entrega. Re-anclada a la DB (filtro
> `estado=publicado`, el mismo del build), negativo re-corrido, y sin
> requisitos nuevos para `check`: su build ya exigía Postgres desde CMS-0c.

## 1 · Lo que quedó midiendo, y con qué

| sonda / medida | resultado |
|---|---|
| `qa:tipo-hoja` (eje `href` en veredicto) · `-neg` | **9/9 · 0 defectos · 9/9 = dato medido** · neg **8/8** (3 falsadores nuevos del eje) |
| `qa:roles` ← nueva · `-neg` | **8/8** · **3/3** (control · `sin-acceso`⇒R2/R3/R5 · `sin-guarda-rol`⇒R4) |
| `qa:slugs` re-anclada a la DB · sabotaje | 14 slugs · 3 familias limpio · `SABOTAJE=accesorios` ⇒ exit 1 |
| `qa:html-cmp` vs `html-f24-verif` | visible **Δ0 en las 31** · 10 cargas movidas, adjudicadas por DERIVACIÓN: +24 × referenciado exacto |
| `qa:clon-base` @1440 · @390 | **31/31 sin mover un píxel** (×2) |
| `qa:enlaces` · `qa:lib` · `check` | 868 hrefs limpio · 107 sondas con contrato · verde |
| la prueba final | guardas de entrada 4/4 acogiendo · build fallido CONTENIDO · lazo borrador⇒verde 38.29 s · evidencia `medidas/f25-prueba-final-ESCALON-*.json` |

## 2 · Lo siguiente — el arbitraje del escalón, y después Fase 3

1. **§F2-5-ESCALON-ETIQUETAS** (la tanda corta que abre lo demás): medir el
   original — ¿cuáles de las 149 entradas no tienen etiquetas y qué renderiza
   WordPress ahí? — y arbitrar entre plantilla-con-guarda / `[]` en proyección
   / `required` en esquema. Las tres salidas y sus costes ya están en la
   ficha. Después: re-correr la prueba final entera, **incluida la mitad del
   producto que no corrió**;
2. la tabla completa de lo que queda fuera, con dueños, está en
   `PLAN-FASE-2.md` §ESTADO DE LA FASE 2 (M-IMG · 23×404 · CHUNK-CSS ·
   EXIT-FETCH · Dockerfile · comportamiento 0/31 · 21 de CLASE · Breadcrumb ·
   biblioteca pendiente = Fase 3, que es AÑADIR, no cambiar).

## 3 · Lo que NO hay que hacer al empezar

- **No «arreglar» el escalón sin la medida del original.** Una guarda en la
  plantilla, un `[]` en la proyección o un `required` en el esquema deciden
  cosas DISTINTAS y ninguna está medida. La ficha lista los costes; primero el
  original, después el arbitraje.
- **No borrar la entrada 71 (`guia-cms-traspaso-f25`, borrador)**: es la
  semilla que reproduce y documenta el hueco. Su dueña es la ficha; se borra
  al cerrarla.
- **No publicar una entrada sin etiquetas** hasta el arbitraje: el build
  fallará (contenido, no caído — pero fallará). Está avisado también en
  `TRASPASO-CMS.md` §4.
- **No leer el estado de `usuarios` como definitivo**: la DB quedó a 0 a
  propósito (los usuarios de la prueba se borraron). El primer alta real la
  hace el propietario eligiendo rol **Admin** — el defecto del campo es
  `editor`.
- **No correr sondas con un build del publicador en vuelo** (la regla de
  siempre): la prueba final los dispara de verdad.

---

# (anterior) HANDOFF — F2-4 CERRADA: el eslabón que nadie ejercitaba, medido; y la cura de la §2 reintroducía la enfermedad

> ⚠ **Tanda 2026-08-08 (39.ª).** Reentrada sobre el commit de parada de la 38.ª,
> que se cortó a mitad y se commiteó **declarándose SIN VERIFICAR**. PASOS
> 0 · 1 · 2 · 3 · 4 · 5 completos. **El escalón NO disparó**: 91.41 s a 220 rutas
> es holgadamente compatible con publicar-es-reconstruir, y CMS-0c se conserva
> entero — con **una** grieta declarada y acotada (la preview).

## 0 · Los cinco titulares

> **1 · El árbol NO era coherente, y el primer instrumento que lo dijo mintió.**
> `npm run check` salía **EXIT=2**: la migración de F2-4 traía el `import` que
> emite `migrate:create` y el paquete compila con `verbatimModuleSyntax` — el
> arreglo que su hermana `20260804_120654_inicial.ts` **documenta como obligatorio
> en cada migración nueva**. Y la primera corrida lo dio por bueno porque
> `npm run check | tail` **devuelve el código de `tail`**: la tubería es un
> contenedor con holgura más (§La causa común), esta vez con el código de salida
> dentro.
>
> **2 · «Quién dispara el webhook» estaba ESCRITO y SIN EJERCITAR.** El hook
> `afterChange`/`afterDelete` llevaba 110 líneas de cabecera y
> `grep -rn PUBLICAR_URL scripts packages apps` devolvía **la definición y sus
> comentarios: cero llamadas**. Es §sondas 3 (*documentado no es conectado*)
> sobre **la pieza que da nombre a CMS-0c**. Lo cierra `qa:publica-e2e` (nueva,
> 4/4) con su control y su negativo: **guardar por la Local API dispara**
> (`entradas-blog:<slug> update`), **1 guardado = 1 disparo, 0 de `slugs`**, y
> **alta ⇒ 31→32 rutas con la ruta dentro · baja ⇒ 31 y fuera**.
>
> **3 · La cura de la §2 reintroducía la enfermedad, y hicieron falta DOS
> corridas para verlo.** Construir fuera y promocionar existe para que un build
> fallido no deje el sitio sin sitio. **La promoción son DOS renames**, y morir
> entre ellos deja el árbol **sin `.next`** — pasó dos veces, la segunda con el
> publicador muerto y el artefacto ausente **7 minutos**. Causa: `dispara()`
> llamaba a `bombea()` **sin `await` y sin `catch`**, así que el throw era un
> rechazo no capturado; la cabecera afirmaba *«la excepción sube y el build se
> marca fallido»* y **no subía a ningún sitio**.
>
> **4 · El 31 de 31 de `html-cmp` NO era regresión, y tampoco era el
> comparador.** Se reconstruyó a mano como pide §sondas 4: se construyó
> `ec5fbf3` aparte y se compararon los **33 HTML del disco** — **32 difieren en
> UN token de ~795, y en las 32 es el nombre del fichero CSS**. El CSS creció
> **+94 B**: las dos utilidades de la cinta de la preview, **selectores
> autoconfinados** que ninguna de las 31 páginas usa. `clon-base` corrobora con
> **Δ0 en las 31 a 1440 y a 390**. Lo que queda abierto es del instrumento:
> `CHUNK_PATRON` enmascara **`.js` y no `.css`** (§F2-4-CHUNK-CSS).
>
> **5 · Y la sonda nueva llegó con su propio defecto, del catálogo.**
> `qa:publica-e2e` **descartaba la salida del publicador**, así que cuando éste
> murió promocionando sólo supo decir `ECONNRESET`: **el motivo estaba en el
> canal que ella misma había cerrado.** Es la tercera vez en el repo que un
> instrumento se queda sin ver lo que venía a medir.

## 1 · Lo que quedó midiendo, y con qué

| sonda | resultado |
|---|---|
| **`qa:publica-e2e`** ← nueva | **4/4** · negativo **3/3** (`hook-mudo` ⇒ E2 · `disparo-fantasma` ⇒ E1 + control) |
| `qa:publicar` · `-neg` | 4/4 · 4/4 — **re-corridas tras tocar el publicador** |
| `qa:programada` · `-neg` | 6/6 · 4/4 — `preview-abierta` cae por **P4**, el suyo |
| `qa:clon-base` @1440 · @390 | **31/31 sin mover un píxel** contra `clon-base-*-f23-productos` |
| `qa:enlaces` · `corte` · `slugs` · `manifiesto` · `check` | 868 hrefs · 12/12 · 2/2 · 31 rutas · **verde tras el arreglo** |
| `qa:html-cmp` | 31 · 31 **adjudicadas a mano** — ver titular 4 |

## 2 · Lo siguiente — F2-5 · Admin y traspaso

Su especificación está en `PLAN-FASE-2.md` §F2-5 y **F2-4 no la cambia**. Lo que
sí le deja F2-4 en el plato, ya escrito con su criterio de «hecho»:

1. **§F2-3-HREF-DERIVADO es suya**, y con la corrección que hizo la 38.ª:
   *publicar NO multiplica el caso, **dar de alta productos desde el admin sí***.
   Salida (b), guarda por `qa:tipo-hoja` extendida (no `qa:enlaces`, que no ve el
   panel que no se sirve);
2. **`PREVIEW_SECRETO` no está en `apps/cms/.env`** — quien despliegue tiene que
   ponerla. Sin ella la preview **revienta**, que es la dirección segura;
3. **§F2-4-CHUNK-CSS** — un nivel `css` propio en `html-cmp`, **no** una máscara
   más ancha: una hoja de estilos **sí** es fidelidad.

## 3 · Lo que NO hay que hacer al empezar

- **No leer un `EXIT=0` de una tubería como el código de la orden.**
  `npm run check > fichero; echo $?`.
- **No creerse un `html-cmp` verde ni rojo sin mirar el token.** Hasta que exista
  el nivel `css`, un rojo en `visible` **hay que adjudicarlo a mano**; la base
  vigente es `html-f24-verif.json` (2026-08-08).
- **No dar por buena una base de `clon-base` por su fecha.** `f23-base` es de
  **antes** de F2-3 y marca 3 rutas que ya estaban adjudicadas. La base de cierre
  de una fase es **la que congeló su commit de cierre** — se deriva con
  `git show --stat <sha> -- scripts/qa/medidas/`.
- **No re-congelar `html-f24-base.json`** ni `programada.json`: la guarda de la
  §regla 5 ya desvía a fichero fechado, y esas dos son las que sostienen las
  adjudicaciones de arriba.
- **No arrancar el publicador sobre un `.next` a medias sin mirar el arranque:**
  ahora repara la promoción interrumpida, y lo **grita**. Ese grito es un dato,
  no ruido.

---

# (anterior) HANDOFF — F2-3 CERRADA: `productos` migrada, CMS-SP-TIPO cerrada por la salida que parecía la de repuesto, y el 2.º volátil declarado

> ⚠ **Tanda 2026-08-06 (37.ª).** PASOS 1 · 2 · 3 · 4 · 5 completos.
> **F2-3 cerrada contra su criterio del PLAN**: tabla del §8 en verde con umbral
> cero y prueba de operación **13/13** (`productos` dentro). **El escalón NO
> disparó** — el `<sup>` cabía, y de sobra. `apps/web` se toca por diseño y paga:
> **puerta a Δ0 en las 31 rutas**.

## 0 · Los cinco titulares

> **1 · CMS-SP-TIPO la cerró la salida 2, y la 1 NO PODÍA cerrarla.** §7b nombró
> dos salidas: *el Δ0 de render* o *una sonda que contraste el editor de cada
> campo contra su inventario medido*. La tanda fue a por la primera y midió que
> es ciega aquí: **`ProductosTabs` sólo sirve el panel del producto ACTIVO**, y
> el activo es `monitor-calidad-aire` en **las 10** instancias que pintan el
> bloque. Los 4 `<sup>` viven en los productos 6, 8 y 9 ⇒ **ninguna ruta emitida
> los contiene** (`grep -rl "<sup>"` sobre `.next/server/app`: 5 ficheros, los 5
> cuerpos de grupo A). **El mecanismo de pestañas es un contenedor con holgura, y
> su holgura es el panel entero.** La cierra `npm run qa:tipo-hoja` (10/10,
> negativo 5/5, y su sabotaje decisivo **es el defecto original**).
>
> **2 · La pregunta del encargo —«cuál de los dos contratos inline le
> corresponde»— tenía la respuesta con dos días de antigüedad, y uno de los dos
> contratos ya no existe.** Derivado del árbol, no recordado: `editorEnLinea`
> **se borró** el 2026-08-04 (`cbd2b3a`, *«sin consumidores»*), y `bullets[].texto`
> pasó de `inline()` a **`htmlLinea`** en ese mismo commit — **antes** de que
> existiera ninguna migración (`b1c6650`, *«la inicial en limpio»*). Así que
> **la migración versionada del campo ya es `20260804_120654_inicial`**: la
> columna nació `varchar` y el `<sup>` está en la DB desde el primer seed. **No
> había nada que mover**: la asimetría de §1.5b ya jugó a favor, dos días antes.
>
> **3 · Migrar `productos` destapó un VOLÁTIL que el contrato no tenía: el
> NOMBRE DE FICHERO DE CHUNK.** 11 rutas con el `visible` distinto y el contenido
> idéntico —incluida una que ni monta el componente tocado—. Diff tomado con
> `visibleDe` (la función de la propia sonda): **`visible` 136664 → 136664,
> `igual: false`, `igual tras normalizar <CHUNK>: TRUE`** en las 3 muestreadas.
> Causa real y deseada: `ProductosTabs` es cliente y dejó de importar el
> catálogo. Declarado con las **mismas cuatro guardas** del `BUILD_ID` y **una
> diferencia dicha en voz alta**: el `BUILD_ID` cambia en todo build, el chunk
> **sólo si el bundle cliente cambió**, así que no se borra — **se cuenta y se
> nombra** (`bundle`).
>
> **4 · El defecto de `href` que ninguna sonda podía ver, con su número.**
> `qa:tipo-hoja` eje `href`: **6 de 9 productos** apuntan a una ruta que el build
> **no emite**. No lo ve `qa:enlaces` (recorre `<a href>` y estos no llegan al
> marcado) ni `html-cmp` (su puerta es el marcado visible): viajan en la **carga
> RSC** como props del cliente. Se ve en su disparador y cuadra al byte: **−24
> por producto referenciado** (−24 · −24 · **−72**) = `https://kunakair.com/es`
> más la barra. Es consecuencia **declarada** de §4, fichada, y sus dos salidas
> son de ESQUEMA.
>
> **5 · Y la clase, por TERCERA vez en dos tandas, con un ancla nueva.**
> *Un negativo anclado a algo que el propio trabajo mueve se auto-invalida.* Las
> dos primeras se anclaban a un fichero y a una lista —y se arreglan
> **derivando**—. Ésta se anclaba **al CONTRATO**: declarar el 2.º volátil movió
> la puerta de `visible` a `visibleSinChunks` y `visible-alterado` pasó a
> sabotear el nivel viejo ⇒ **exit 0 esperando 1**. **No hay derivación que lo
> evite**: lo único que lo caza es correr el negativo entero en la misma tanda
> que cambia el contrato. Lo cazó.

## 1 · PASO 1 — `productos` migrada, y qué dice cada instrumento

Tres sitios pintan un producto y los tres leen ya del CMS: la **home**
(`PRODUCTOS_HOME_IDS`, derivado del catálogo medido), las **6 rutas de sector**
(ya lo hacían) y las **3 fichas de caso** (`getProductosCms`, esperado en la
página y bajado por prop — §F2-3-ASYNC-HIJO).

| sonda | resultado |
|---|---|
| `qa:html-cmp` vs base de la tanda | **31 · 0 con el marcado visible distinto** · 7 `bundle` · 4 con invariante de carga movido **y explicado** |
| `qa:html-cmp` vs base de la FASE | 15 = 4 adjudicadas + **11 que esa base no PUEDE clasificar**, dicho ruta a ruta |
| `qa:clon-base` @1440 · @390 | **28/31 sin mover un píxel**, los 3 del control — **ni uno más** |
| `qa:enlaces` · `corte` · `slugs` · `manifiesto` · `check` | 868 hrefs · 12/12 · 2/2 · 31 rutas · verde |
| `qa:cms-roundtrip` · `cms-lectura` · `cms-decl` | 63/63 · 63/63 · 23/23 |
| `qa:html-cmp-neg` · `qa:tipo-hoja-neg` · `qa:lib` | **13/13** (era 11/11) · **5/5** · 93/93 · 98 sondas |

**Las dos comprobaciones que el encargo pidió ANTES de medir, y las dos acotan lo
que el Δ0 significa:**

- **`productos.cuerpo` sigue VACÍO en las 9** — derivado sobre las 23 tablas
  `productos_blocks_*`: **0 filas en las 23**. Así que su Δ0 es **con los dos
  lados vacíos y no prueba nada del cuerpo**. Las 24 fichas entran después;
- **`Product.seo` se escribe y NO se lee** — `grep -rln "products" apps/web/src/app`
  no devuelve nada y los 3 productos construidos llevan su `metadata` en el
  `export const metadata` de su `page.tsx`, o sea en la capa de ESTRUCTURA. **Un
  campo que nadie renderiza no puede dar regresión, así que tampoco puede dar
  verde**: su cobertura la aporta `qa:tipo-hoja`, no el Δ0 ni la prueba de
  operación.

## 2 · PASO 3 — F2-3 CERRADA, punto por punto

Acta completa en `PLAN-FASE-2.md` §F2-3 · CERRADA. Las dos mitades del criterio:
**la tabla del §8 en verde con umbral cero** y **la prueba de operación 13/13**
—con su segunda mitad corrida: rebuild + `html-cmp` ⇒ **31 rutas · 0 con
contenido distinto**—. `usuarios` **fuera con su razón escrita y EJERCITADA como
precondición**, que no es lo mismo que «pasada».

**El `<sup>` sobrevivió al formulario**: 4 de 4 filas byte a byte en la DB tras
los 13 saves del admin.

## 3 · PASO 4 — §F2-3-EXIT-FETCH: alcance corregido y dueño asignado

**El recuento se re-derivó antes de usarlo y no salió 24: son 29.** Y la segunda
corrección duele más que la primera: **«arreglado en las 2» era impreciso**.
`html-cmp` (496, 505) y `t4b-bloque` (451) conservan `process.exit()` **después**
de sus `fetch`; hoy salen bien **porque hay un `await parar()` en medio que le
gana la carrera al socket** — o sea exactamente lo que la ficha dice de las
otras: latente y dependiente del tiempo.

> **29 candidatos · 2 auditados · 27 sin auditar**, y en los 2 auditados quedan
> llamadas de la misma clase.

**Dueño: tanda de INSTRUMENTO, no F2-4**, con su razón (no bloquea nada del
sitio; su dirección peligrosa es **ruidosa**; y convertir cada llamada exige
**reestructurar el control de flujo** de esa sonda y **volver a correr su
negativo entero**). Criterio de «hecho» ya escrito en la ficha, incluido **un
control en `qa:lib` que falle si aparece un `process.exit()` alcanzable tras un
`fetch`** — sin él sería un barrido, no una clase cerrada.

## 4 · LO SIGUIENTE — F2-4 · Publicación

Su especificación ya está escrita en `PLAN-FASE-2.md` §F2-4 y no la cambia nada
de esta tanda. Las cuatro piezas:

1. **webhook de rebuild** (CMS-0c: publicar dispara reconstrucción, no hay ISR);
2. **cron de publicación programada** — sin servidor mirando fechas, el cron
   dispara el rebuild cuando llega la hora;
3. **preview de borradores como ÚNICA ruta que lee en runtime**, acotada y con
   auth; todo lo demás sigue siendo HTML estático sin Postgres detrás;
4. **A-SP13 con número**: el coste de emitir ~220 rutas (hoy 31; 11 ≈ 1 s, y 220
   es otro orden). Es la **primera** de las tres incógnitas operativas de CMS-0c;
   **las otras dos** —quién dispara el webhook y qué ve el editor mientras
   reconstruye— se cierran en la misma fase, midiendo.

## 5 · Pendientes que NO bloquean

**§F2-3-HREF-DERIVADO** (6 de 9, dos salidas de ESQUEMA) · **§F2-3-EXIT-FETCH**
(27 sin auditar) · §F2-3-VARIANTE-PISA · §M-PDF-FB3D · §T3B-NO-CANONICO ·
§T3-ALCANCE · **M-IMG** (deuda de render) · **23 imágenes 404** (tanda aislada) ·
HOME cubo B · `Dockerfile` sin verificar · **26 celdas ciegas** · **6 mínimos**
flojos · `Breadcrumb` 28 rutas · los 5 «distinto» de `cmp-srcset` · swiper ×3 ·
nbc ×1 · los 3 `data-media` del seed fuera del invariante D de `qa:artefacto` ·
`qa:admin-operacion` sin negativo · **el eje `comportamiento` a 0/31**.

## 6 · Lo que NO hay que hacer al empezar

- **No leer un `html-cmp` contra `html-f23-base.json` como veredicto de una tanda
  nueva.** Esa base es anterior al nivel `visibleSinChunks` y no puede
  distinguir un cambio de chunk de un cambio de contenido — **la sonda lo dice
  ruta a ruta**. Para adjudicar, base tomada con el nivel puesto.
- **No re-congelar `html-f23-base.json`.**
- **No borrar el nombre de chunk «porque es ruido».** Cambia **sólo** si el
  bundle cliente cambió: se cuenta y se nombra, no se calla.
- **No dar por cerrado un `<sup>` con un Δ0 de render.** Aquí no se sirve.
  Lo que lo mide es `qa:tipo-hoja`.
- **No escribirle a `editorRico` una tabla de etiquetas** para que `tipo-hoja`
  deje de fallar el día que un campo lo use: se **deriva de sus features**, o lo
  SIN PROBAR entra cableado por la puerta de atrás.
- **No `await` dentro de un componente hijo** (§F2-3-ASYNC-HIJO).
- **No cablear «los productos de la home son los que no tienen `padre`»**: hoy
  cuadra con n=9 y §2e midió **6 de 24 sin `padre`** sobre el CPT completo.

---

# HANDOFF — F2-3 con las CINCO familias migradas, el criterio que se mide donde el defecto no cabe, y la prueba de operación PASADA

> ⚠ **Tanda 2026-08-06 (36.ª).** PASOS 1 · 2 · 3 · 4 · 5 completos.
> `/[slug]` **landada**: T4b cableado en el seed y la familia aceptada por un
> criterio **de BLOQUE, no de ruta**. La prueba de operación pasa de *«preparada
> y NO PROBADA»* a **PASADA, 12/12 colecciones por el admin de verdad**.
> **El escalón NO disparó.** `apps/web` se toca por diseño y paga lo que le toca.

## 0 · Los cinco titulares

> **1 · El bloqueo de `/[slug]` no era «T4b es deuda de F2-2»: era que el seed
> NO TENÍA PIPELINE.** `TRANSFORMACIONES = [T8,T1,T2,T3,T3B,T4B,T4,T5,T6,T7]`
> llevaba T4b **en su orden correcto** desde la tanda 31.ª, usado por
> `extractor`, `cms-roundtrip` y `media-hueco`. El seed tenía una **copia a mano
> de T8+T4a** y `grep -c "transformaciones" scripts/seed/seed.mjs` daba **0**.
>
> **2 · Y la razón que el código daba llevaba DOS TANDAS falsada.** `seed.mjs`
> decía que T4b *«necesita el PDF y la URL de la noticia, que el catálogo NO
> tiene»*; `PLAN-FASE-2.md` §871 lo derribó en la 30.ª (*«T4b es DERIVABLE»*).
> Comprobado contra el catálogo del seed: **3 de 3 FB3D derivables vía
> `payload`**. Es §sondas 3 en su **tercera** forma — allí un comentario prometía
> una LLAMADA, luego unos CONSUMIDORES; aquí promete **una RAZÓN**. Y el
> `0 sustituidos` que imprimía era un **literal de cadena**, así que ni siquiera
> lo contradecía.
>
> **3 · El encargo traía un recuento que no sobrevivió a la derivación, y era el
> que decidía el criterio.** Pedía comparar `flourish` contra su hermano
> materializado — la única diana que compra FIDELIDAD. Derivado (regla 9):
> `flourish-embed` está en **8 ficheros del corpus** y en **0 del catálogo**.
> Vive en el camino del EXTRACTOR, no en el que siembra `/[slug]`. **La rama de
> más valor del criterio tiene n = 0 aquí**, y se dice en vez de darla por
> aplicada.
>
> **4 · El criterio se mide al nivel del BLOQUE porque el hash de la ruta es un
> contenedor con holgura — el SÉPTIMO del catálogo.** Su holgura mide exactamente
> lo que ocupa la sustitución (hasta 3500 bytes). `qa:t4b-bloque`: **RESTO a
> CERO en 10/10** y 3 bloques adjudicados. Negativo **8/8**, y su caso decisivo
> —`patron-ensanchado`— es el único que las guardas de recuento **no pueden ver**.
>
> **5 · `qa:html-cmp-neg` estaba en 9/11 ANTES de tocar nada, y los dos fallos
> eran reales.** Uno envejecía solo (una lista escrita a mano que cada familia
> migrada invalidaba); el otro era `process.exit()` tras un `fetch` abortando
> libuv en Windows — **la guarda acertaba y el negativo la contaba como
> fallada**. Los dos arreglados; **11/11**.

## 1 · PASO 1 — por qué el seed no aplicaba T4b (derivado, no supuesto)

| pregunta | respuesta derivada |
|---|---|
| ¿existe T4b? | sí, en `TRANSFORMACIONES`, **antes de T4a** (el PDF vive dentro del `<script>`) |
| ¿quién la importa? | `extractor` · `extractor.neg` · `cms-roundtrip` · `media-hueco` — **no `seed.mjs`** |
| ¿falta la LLAMADA? | **falta el FICHERO ENTERO**: el seed no importaba `transformaciones.mjs`, tenía su propia copia de T8+T4a |
| ¿es orden deliberado? | **no.** El comentario daba una razón medida falsa dos tandas antes |

**Aplicado:** `seed.mjs` importa `T4B` —una sola definición— y lo corre antes de
T4a con su postcondición (un visor sin sustituir **tira**, no desaparece). El
seed imprime ahora `5 <script> eliminados (T4a) · 3 sustituidos (T4b)`, los dos
**contados**.

## 2 · PASO 2 — el criterio, escrito ANTES de landar

Acta completa: `PENDIENTES-QA.md` **§F2-3-T4B-CRITERIO**. En dos mitades:

| mitad | umbral |
|---|---|
| **RESTO** — el `visible` sin los bloques declarados | **PUERTA · CERO** |
| **BLOQUE** — por clase | contra la diana de su fila |

| clase | n | diana |
|---|---:|---|
| `fb3d` | 3 | ⛔ **DESVIACIÓN DELIBERADA** — el original monta el visor por JS; no hay equivalente materializado en NINGUNA población. Contenido conservado, presentación no |
| `nbc` | 1 | ⛔ **DESVIACIÓN DELIBERADA** — imposible: el script sólo da la URL del reproductor con `CID` caducable |
| `instagram` | 1 | ✅ **SIN PÉRDIDA DE BLOQUE** — el `<blockquote>` sobrevive con su permalink |
| *hermano materializado* | **0** | ✅ la rama existe y **no tiene instancia aquí** (`flourish`: corpus 8 · catálogo 0) |

**La trampa que el diseño abre y la guarda que la cierra:** recortar bloques
permite **ensanchar un patrón hasta tragarse la regresión**, y ni el censo ni la
identidad de bytes lo ven. Muerde una propiedad del contenido: **un bloque
declarado es andamiaje, no cuerpo** — si se lleva un `<p>` sin declararlo, es
defecto.

## 3 · PASO 3 — landada, y qué dice CADA instrumento

| sonda | resultado | lectura |
|---|---|---|
| **`qa:t4b-bloque`** | **RESTO a CERO 10/10** · 3 bloques · 0 invaden cuerpo | ✅ **la puerta de esta familia** |
| `qa:html-cmp` | **4 DISTINTAS** de 31 · 27 limpias | ⚠ rojo **ESPERADO**, y **ni una quinta** |
| `qa:clon-base` @1440 · @390 | **28/31 sin mover un píxel** | ⚠ rojo esperado en los 3 de `fb3d`: `+1 ancla` y `+48.6` / `+79.18` |
| `qa:enlaces` · `corte` · `slugs` · `manifiesto` · `cms-lectura` · `check` | 868 hrefs · 12/12 · 14 slugs · 31 rutas · 63/63 · verde | ✅ |

**El `+48.6` está explicado y su variación entre anchos también:** es el párrafo
del enlace al PDF. A 390 dos de los tres títulos **envuelven a dos renglones**;
el tercero (`EEA Report Air Pollution`, corto) no. **No es ruido: es el wrap.**

## 4 · PASO 4 — la PRUEBA DE OPERACIÓN, PASADA (y el protocolo tenía un paso inejecutable)

| paso | resultado |
|---|---|
| usuario por `/admin/create-first-user` | ✅ parte de la prueba |
| **12/12 colecciones servidas, guardadas desde el admin** | ✅ `qa:admin-operacion` |
| rebuild + `qa:html-cmp` contra su línea base | **31 rutas · 0 con contenido distinto** |
| `qa:t4b-bloque` tras los saves | **10/10, RESTO a cero, 3 bloques intactos** |

> **El editor NO degrada el dato.** El campo rico **sí pasó por el serializador**
> —los 4 cuerpos con `<script>` transformados y el `data-media` de T4b incluidos—
> y no movió un byte del marcado visible.

**⚠ Y la corrección de hecho: «GUARDAR SIN CAMBIOS» NO ES EJECUTABLE.** El botón
sale `disabled` en un formulario intacto; un `.click()` **no da error, no hace
nada**, y la primera corrida sacó **0 de 12** — un rojo correcto **por el motivo
equivocado**. Adaptación declarada: se ensucia un **campo de texto simple** (una
tecla y un borrado) **comprobando que su valor queda idéntico**, y el rico no se
toca. Sigue midiendo porque el formulario **serializa todos los campos**.

**Segunda corrección: la confirmación NO es un toast**, es `updatedAt` de la API
antes y después — la salida servida, no lo que la interfaz dice de sí misma. Sin
eso, «no encontré el toast» y «el save no ocurrió» daban la misma salida.

**`usuarios` NO se cuenta como pasada por tener 0 filas:** se declara **fuera del
criterio con su razón** (ningún usuario llega al render) y su camino de alta
queda probado como precondición. Igual `productos` (familia sin migrar),
`articulos-kb`, `media` y `slugs`.

## 5 · Lo que se arregló de camino, y no era de esta fase

**§F2-3-EXIT-FETCH (nueva ficha).** `process.exit()` tras un `fetch` aborta libuv
en Windows: `UV_HANDLE_CLOSING`, `async.c:94` ⇒ exit **3221226505** en vez del
código elegido. **Repro mínimo 3/3**; no lo evitan `setImmediate`,
`setTimeout(0)` ni cerrar el dispatcher de undici. Lo único que funciona es
`process.exitCode` —dejar drenar el bucle—, que es mecanismo, no retardo mágico.
**Alcance derivado: 24 ficheros.** Arreglados **2** (`html-cmp`, `t4b-bloque`);
**22 fichadas y sin barrer**, dicho con esas palabras.

**La diana de `html-cmp.neg` era una lista escrita a mano** (`startsWith("/faqs/")`)
y cada familia migrada la invalidaba: hoy **0 de 31** rutas tienen `filas` igual
a la base, así que el caso `solo-reparto` era **insatisfacible**. Sustituida por
su derivación —el control corre primero y cada sabotaje parte de **la medida de
HOY**—, así que ninguno depende del estado accidental del build.

> ⚠ **Y lo que eso enseña, que es lo caro:** *la tanda que migra una familia deja
> ROJO el negativo del instrumento con el que va a medirla*, y ese rojo no dice
> qué pasó. El HANDOFF anterior citaba **11/11**; hoy, en HEAD y sin tocar nada,
> eran **9/11**.

## 6 · Pendientes que NO bloquean

**§F2-3-EXIT-FETCH** (22 sondas sin barrer) · **`qa:admin-operacion` sin test en
negativo** (dicho, no disimulado: el veredicto lo emite `html-cmp`, que sí está
falsado 11/11) · **los 3 `data-media` del seed NO pasan por el invariante D** de
`qa:artefacto`, que lee sólo el camino del extractor · §M-PDF-FB3D ·
§F2-3-VARIANTE-PISA · 23 imágenes 404 · §T3B-NO-CANONICO · §T3-ALCANCE · swiper
×3 · nbc ×1 · HOME cubo B · `Dockerfile` · 26 celdas ciegas · 6 mínimos ·
`Breadcrumb` 28 rutas · **CMS-SP-TIPO** (el `<sup>` vive en `productos`, que
sigue sin ser familia de ruta) · los 5 «distinto» de `cmp-srcset` · **M-IMG**.

## 7 · LO SIGUIENTE, por orden

1. **`productos`** — la única colección con lado medido que **no llega al
   render**. Migrarla cierra `CMS-SP-TIPO` (su `<sup>`) y la mete en la prueba
   de operación. No es familia de ruta nueva: son `/monitor-calidad-aire`,
   `/accesorios`, `/software-…`, `/kunak-api`.
2. **F2-4 · Publicación** — webhook de rebuild, cron de publicación programada,
   preview. Y **A-SP13 con número**.
3. Barrer §F2-3-EXIT-FETCH en las 22 restantes, con su control.

## 8 · Lo que NO hay que hacer al empezar

- **No intentar poner verdes `html-cmp` ni `clon-base` en `/[slug]`.** Su rojo
  es la desviación con acta. Lo que se vigila ahí es **el CONJUNTO**: si marcan
  una ruta que `qa:t4b-bloque` no adjudica, **eso** sí es defecto.
- **No ensanchar los patrones de `t4b-bloque`** para que algo cuadre: es la
  trampa que su guarda de ANCHURA existe para cerrar, y el negativo la prueba.
- **No `await` dentro de un componente hijo** (§F2-3-ASYNC-HIJO). El dato se
  espera en la página y baja por prop.
- **No re-implementar una transformación en un segundo camino.** Es lo que causó
  todo esto: importar `transformaciones.mjs`, no copiarlo.
- **No leer «adjudicado» como «fiel».** Dice que la diferencia está donde se
  declaró, no que la sustitución sea buena.
- **No re-congelar `html-f23-base.json`.**

---

# HANDOFF — el CONTRATO de html-cmp escrito (y quien lo decidió fue el ORIGINAL), dos familias más migradas, y la última NO se landa con su número

> ⚠ **Tanda 2026-08-06 (35.ª).** PASOS 1 · 2 · 3 · 4 · 5 completos.
> PASO 2 entrega **2 de las 4** familias con su Δ0 pagado y la tercera
> **medida y revertida**: no puede pagarlo, y por qué está derivado.
> **El escalón NO disparó.** `apps/web` se toca por diseño y paga: 31/31 sin
> mover un píxel a 1440 y a 390.

## 0 · Los cuatro titulares

> **1 · La decisión de instrumento la tomó el ORIGINAL, no el gusto.**
> §F2-3-RSC-ORDEN ofrecía dos salidas —ensanchar la máscara o fichar el residuo
> ruta a ruta— y la que valía era una tercera: **declarar qué garantiza cada
> nivel**. El hecho que la cierra se midió contra la salida servida:
> **`qa:rsc-original` — 4 arquetipos del original, 0 con `__next_f`**, los 4 con
> control positivo. Luego el nivel `filas` **no tiene contraparte que auditar ni
> hoy ni nunca**: es clon-contra-clon POR CONSTRUCCIÓN. `visible` sí puede ser
> puerta, y por el mismo argumento: es donde vive la fidelidad que se puede
> **trasladar**.
>
> **2 · El contrato se pagó solo en la primera corrida.** `sectores` dejó **8
> rutas con la carga RSC renumerada**. Con el contrato anterior eso habrían sido
> **8 rojas por un cambio de Next**, no del clon. Y lo que descartó la otra
> salida fue una medida: **el residuo CAMBIA DE RUTA entre dos builds del mismo
> commit** — fichar ruta a ruta habría nombrado una ruta que deja de serlo.
>
> **3 · `/[slug]` no se landa, y el bloqueo no es del proyector.** Se migró, se
> midió, se revirtió: **4 rutas con el marcado VISIBLE distinto**
> (−7112 · −6783 · −6532 · −524). El seed aplica **T4a sin T4b** —su propia
> salida dice «5 `<script>` eliminados, **0 sustituidos**»—, así que la DB
> guarda 4 cuerpos de blog mutilados. **La evidencia llevaba dos días
> congelada**: `sondeo-frontera.json` del 04-08 registra los **4 mismos slugs**.
>
> **4 · Y salió un mecanismo nuevo que sólo se ve con la puerta en el marcado:**
> hacer `async` un componente HIJO cambia el HTML servido **sin mover un dato**
> — `/contador-…` con **Δ 0 bytes** y marcado distinto. `clon-base` no lo caza:
> la geometría no se mueve.

## 1 · PASO 1 — el contrato de los tres niveles

| nivel | qué GARANTIZA | umbral | falsador |
|---|---|---|---|
| `visible` | lo que recibe el visitante no cambió — **y traslada la fidelidad medida contra el original** | **PUERTA · CERO** | `visible-alterado` |
| `filas` | **nada de fidelidad** (el original no emite esto): sólo churn de la carga | **INFORMATIVO con disparador** | `filas-renumeradas` verde y contado · `inv-nfilas` · `inv-nmascaras` · `inv-bytescarga` rojos |
| `normalizado` | nada por sí solo | informativo, contado | `solo-reparto` |

**Degradar no es dejar de mirar.** El reparto mueve *qué fila lleva qué id*; no
puede mover `nFilas`, `nMascaras` ni `bytesCarga`. Filas distintas con los
invariantes quietos → verde **contado y nombrado**; un invariante movido →
DEFECTO con su número.

⚠ **`bytesCarga` es nuevo y `html-f23-base.json` es anterior**, y esa congelada
no se re-congela. Durante F2-3 el disparador corre con **dos invariantes y no
tres**, y la sonda **lo dice ruta a ruta** en vez de darlo por cumplido.

**Y el negativo cazó una premisa mía antes de que llegara a ningún documento:**
creía que el clon emite `et_pb_` «replicando las clases de Divi». Los **70 usos
de `apps/web/src` están TODOS en comentarios**. El caso salía rojo por `SIN
CONTROL` en vez de por `EMITE` — el invariante equivocado, que mirando sólo el
código de salida habría pasado.

| sonda | resultado |
|---|---|
| `qa:rsc-original` | 4/4 · **negativo 5/5**, y su falsador es **el propio clon** |
| `qa:html-cmp-neg` | **11/11** (era 8/8) |
| `qa:lib` | 93/93 · 93 sondas compilan y declaran |

## 2 · PASO 2 — dos familias con Δ0, una revertida con número

| familia | colecciones | veredicto |
|---|---|---|
| `/casos-de-exito/[slug]` · `/case-studies/[slug]` | `casos` | ✅ |
| `/sectores/[slug]` | `sectores` · `monograficos` (108 y 199 hojas) | ✅ |
| `/[slug]` | `entradas-blog` · `terminos-kunakpedia` | ⛔ **revertida** |

Las dos verdes, cada una con su verificación completa y sin heredar nada:
`html-cmp` **31 comparadas · 0 con contenido distinto** · `clon-base` **31/31 a
1440 y a 390** · `enlaces` limpia en las dos direcciones (868 hrefs) · `corte`
12/12 · `slugs` · `manifiesto` 31 rutas · `npm run check`.

**Lo que bloquea `/[slug]` está acotado:** `entradas-blog` es la **única** de las
9 colecciones con `<script>` en el dato medido (4 de 7 instancias, 5 scripts); las
otras 8 traen **0**. `terminos-kunakpedia` **está limpia** y sólo la bloquea
compartir ruta. Fichas: **§F2-3-T4A-BLOG** y **§F2-3-ASYNC-HIJO**.

## 3 · PASO 3 — M-IMG: sobreviven, pero NO donde se buscó

**La pregunta era si los bytes pisados están en la captura congelada. NO** — y
no es un hueco: `media-corpus` **excluye las VARIANTES por nombre** y los
disputados se llaman como una variante. Mismo mecanismo que §M-PDF-FB3D.

> **La pérdida es RECUPERABLE, y la red es otra:** `apps/web/public/images`, en
> git, con los **112 orígenes** (109/112 byte-idénticos a `media/`). Y `media/`
> está en `.gitignore` y lo vacía `cms:reset` ⇒ artefacto reconstruible, no daño
> durable. **Citar la captura como respaldo habría sido una garantía falsa.**

**Dos correcciones de recuento (regla 9), anidadas y sin contradecir la sonda:**
40 orígenes con nombre de variante → **18** con ancho generable (los 22 de `600`
están fuera de alcance: ningún `imageSize` produce 600) → **3** con base en la
unión (el predicado de `qa:media-colision` C) → **2** materializados.

**Y un TERCER fichero que difiere por OTRO mecanismo:**
`Air_pollution_in_Madrid.webp`, mismas dimensiones y **re-codificado**
(65 752 → 62 096 B). Toca el control de la comprobación C, cuyo propio
comentario lo había anticipado: *«el sha distinto se explicaría por
recodificación»*. **La alternativa existe de verdad** ⇒ *«Payload copia los
orígenes verbatim»* vale para los **111 `jpeg`+`png` y NO para el `webp`**;
propiedad del formato, derivada sobre **n = 1**.

## 4 · PASO 4 — la prueba de operación, PREPARADA y NO PROBADA

**Su criterio no es alcanzable hoy y se dice ahora, no después:** *«al menos una
instancia de CADA colección»* llega a **5 de 7** (`faqs` ·
`documentos-cientificos` · `casos` · `sectores` · `monograficos`); las 2 que
faltan dependen de **T4b**, que es deuda de F2-2.

Protocolo y precondiciones en `PLAN-FASE-2.md` §F2-3. La que hay que saber antes
de empezar: **`usuarios` tiene 0 filas** ⇒ hay que pasar por
`/admin/create-first-user`, y **eso es parte de la prueba**. `cms:reset` borra
también el usuario: el orden es sembrar → crear usuario → probar.

> ⚠ **No se ha escrito sonda a propósito.** Un `admin-operacion.mjs` sin haber
> corrido nunca es código que parece cobertura (regla 3).

## 5 · LO SIGUIENTE, por orden

1. **T4b sobre el camino del seed** — es lo único que desbloquea `/[slug]`, y con
   ello las 2 colecciones que le faltan a la prueba de operación. **Ojo: T4b
   SUSTITUYE, no restaura**, así que el Δ0 de esas 4 rutas no va a ser cero
   nunca; la tanda que lo aborde tiene que decidir **contra qué** se acepta esa
   familia, y esa decisión es de contenido, no de instrumento.
2. **La PRUEBA DE OPERACIÓN** sobre las 5 colecciones que sí están servidas.
3. `qa:media-colision` puede ganar el segundo mecanismo (re-codificación) como
   comprobación aparte de la C, con su negativo.

## 6 · Lo que NO hay que hacer al empezar

- **No ensanchar la máscara de `html-cmp`.** El §F2-3-RSC-ORDEN está **cerrado**
  con contrato; ampliarla ahora deshace la decisión sin medir nada.
- **No leer un `filas` distinto como defecto.** Es informativo: se mira si movió
  un invariante, y la sonda lo dice con su número.
- **No `await` dentro de un componente hijo** (§F2-3-ASYNC-HIJO). El dato se
  espera en la página y baja por prop.
- **No landar `/[slug]` con la desviación anotada.** Serían 4 páginas servidas
  con el contenido mutilado, contra la regla 1, y a cambio de nada.
- **No citar `media-corpus` como respaldo de un origen con nombre de variante:**
  no puede contenerlo por construcción.
- **No re-congelar `html-f23-base.json`.**

---

# HANDOFF — CMS-0g cerrada por MEDICIÓN, el proyector genérico funcionando en las 6 colecciones, y una segunda familia migrada

> ⚠ **Tanda 2026-08-06 (34.ª).** PASOS 1 · 2 · 3 completos; PASO 4 **parcial —
> 1 de 4 familias de ruta**, con su Δ0 pagado; PASO 5 completo.
> **El escalón NO disparó.** **`apps/web` se toca por diseño** y paga: 31/31 sin
> mover un píxel a 1440 y a 390.

## 0 · Los tres titulares

> **1 · El PASO 1 podía haber disuelto CMS-0g, y no la disolvió — pero cambió la
> pregunta.** La premisa del HANDOFF anterior (*«`media` no guarda la ruta de
> origen»*) era **verdadera**; su conclusión (*«luego `rutaDeMedia` no se puede
> implementar»*) **no se seguía**. `qa:media-colision` midió que
> `filename → ruta` **es una función hoy** —112 rutas, 0 basenames repetidos,
> verificado contra `media/` con 112/112 nombres exactos— y **deja de serlo en
> la unión con el corpus**: 646 rutas, **1** colisión, **12** referencias.
>
> **2 · El campo era la mitad pequeña.** Lo que de verdad bloqueaba era que
> `aMedido` necesita **tres mapas que la IDA construía en su mismo proceso**, y
> en el render no hay ida. Ahora se **declaran** con `custom` en 8 campos, el
> walker vive en el paquete compartido, y **`qa:cms-lectura` mide que el
> contexto del render proyecta 63/63 idéntico al verificado** — incluidas
> `sectores` (108 hojas) y `monograficos` (199). **El proyector genérico vale
> para todas las familias; la forma del canario ya no hace falta que generalice.**
>
> **3 · El negativo cazó TRES defectos míos, todos mudos, y el tercero es un C7
> de manual.** Un contexto de ida con los mapas vacíos que hacía coincidir los
> dos lados **por no hacer ninguno el trabajo**; la **raíz del walker** mal
> (el seed camina con `aPayload(…, coleccion)`, yo declaraba desde raíz vacía, y
> ningún `get` casaba nunca); y `soluciones` **colapsando tres colecciones en una
> clave**. Los tres los destapó `sin-declaraciones` saliendo **verde**.

## 1 · PASO 1 — la medida que decidía si había algo que modelar

`npm run qa:media-colision` (negativo **6/6**), congelada. Deriva el **DOMINIO
real** de `rutaDeMedia` en vez de suponerlo: no los 534 capturados ni los 628 de
`public/images`, sino **las rutas que llegan a un campo `upload`** — el walker
sobre los 9 catálogos con un `ctx` que anota en vez de subir.

| población | rutas | repetidos | refs del corpus |
|---|---:|---:|---:|
| **dominio** | **112** (133 referencias) | **0** | 0 |
| corpus | 534 | **0** | 0 |
| **unión** | 646 | **1** | **12** |
| `publico` | 628 | 12, **11 CASCARÓN** | — |

**Y no se dio por supuesto que `filename` FUERA el basename**: se verificó contra
la salida servida (`media/`, que `cms:reset` vacía) → **112/112 exactos**.

⚠ **Hallazgo lateral, contado y SEPARADO del código de salida a propósito**
(regla 1, la mitad que permite no cerrarlo *diciendo por qué*): `media/` es
**plano** y 3 orígenes se llaman como una variante generable de otro origen.
**2 ya tienen el fichero PISADO** — probado con control: Payload copia los
orígenes verbatim (sha idéntico en la base) y el disputado difiere. **No rompe la
tabla** (los `filename` siguen distintos) ⇒ familia M-IMG. Ficha
`PENDIENTES-QA.md` §F2-3-VARIANTE-PISA.

## 2 · PASO 2 — CMS-0g: campo de PROCEDENCIA, decidido por la asimetría de deshacer

Acta con las tres salidas costadas en `ESQUEMA-CMS.md` **§7c**. El criterio es el
de CMS-0f, y **aquí no es la trivial**:

| dirección | qué cuesta |
|---|---|
| **SIN → CON campo** (después) | la columna es barata; **rellenarla no**. El valor sólo lo sabe el seed. Con altas del admin dentro, re-sembrar pierde lo escrito y el relleno sería un **backfill por heurística** — la opción descartada, con su colisión conocida y **sin poder dirimir cuál de las dos rutas era**. **La procedencia sólo es conocible mientras el seed sea la única fuente.** |
| **CON → SIN campo** | `DROP COLUMN` y derivar. **Mecánico y electivo**, y con el dato delante para comprobar que la derivación acierta **antes** de tirarlo |

**La naturaleza decide la forma, no el gusto:** `required: false` (un alta del
admin **no tiene origen**; exigirlo sería un esquema roto en producción) ·
`readOnly` (es registro de migración) · `unique` · fuera del round-trip.

**Y el `null` tiene render y no es un hueco:** `rutaOrigen ?? /api/media/file/<filename>`
— para una media dada de alta en el admin **ésa es la única URL que puede
funcionar**.

## 3 · PASO 3 — aplicado, y lo que costó más que el campo

| pieza | comprobación |
|---|---|
| `rutaOrigen` + migración `20260806_124532` (reversible) | **112/112 con origen en la DB** (`psql`) |
| el walker sube a `packages/cms-config` | lo usan ida, round-trip y **render** |
| la mitad de VUELTA de `PREPARA` sube con él | el render no puede importar `seed.mjs` |
| `contextoDeLectura` — los 3 métodos **sin ida** | — |
| las 3 declaraciones, `custom` en **8 campos** | `qa:cms-decl` **en las dos direcciones**, negativo **6/6** |
| `apps/web/src/lib/cms/proyector.ts` | `qa:cms-lectura` **63/63**, negativo **4/4** |

> ⚠ **Sin `qa:cms-lectura`, el 63/63 del round-trip era un verde PRESTADO**: su
> vuelta corre con el contexto de la ida y **el build usa otro**.

**Dos cosas que el render necesita y la ida tenía gratis:** con `depth: 1` un
término embebido llega poblado pero **su propia relación y su propia media
quedan un nivel más abajo**. Se pasan los **dos índices** (`id → slug`,
`id → media`), leídos una vez por build. Subir el `depth` era la salida cara: los
documentos de `sectores`/`monograficos` son enormes y lo que hace falta es *un
slug*.

## 4 · PASO 4 — 1 de 4 familias de ruta, con su Δ0 · y por qué paré ahí

Migrada **`/recursos/[...ruta]`** (`documentos-cientificos`), la de menos forma,
como pedía el encargo para que la sorpresa llegara barata.

| eje | resultado |
|---|---|
| `qa:clon-base` @1440 · @390 vs `f21-antes` | **31/31 · 0 regresiones** las dos |
| `qa:enlaces` | limpia en las dos direcciones · 868 hrefs internos |
| `qa:corte` · `qa:slugs` · `qa:manifiesto` | 12/12 · 2/2 · 31 rutas, 0 vacías |
| `npm run check` | verde |
| `qa:html-cmp` vs `html-f23-base` | **30 de 31 limpias · 1 con residuo RSC** |

**El residuo está diagnosticado y NO es contenido** (§F2-3-RSC-ORDEN):
marcado **visible Δ0** · payload RSC **32918 → 32918** · **46 → 46 filas** · lo
que cambia es que la fila de `meta` se emite antes (porque `generateMetadata`
pasa a asíncrona) y una fila va de id `11:` a `12:`. La máscara de `html-cmp` es
`^[0-9a-f]+:` y **esa fila lleva el id precedido de tabuladores**, así que no se
enmascara. Ampliarla a `^\s*…` **tampoco lo arregla** —comprobado—: queda la fila
de estado del router.

> **NO se ensanchó la máscara**, que es exactamente lo que la cabecera de la
> sonda prohíbe. Se mide, se nombra y se decide en la tanda siguiente.

**Por qué paré con una familia y no con cuatro:** el diagnóstico del residuo
consumió la corrida (dos builds y dos capturas para poder afirmarlo con
números). Las tres restantes **están desbloqueadas y son trabajo mecánico** —
`qa:cms-lectura` ya prueba que el proyector las proyecta bien—, pero cada una
paga su Δ0 y ninguno se hereda.

## 5 · LO SIGUIENTE, por orden

1. **Decidir el nivel `filas` de `html-cmp`** (§F2-3-RSC-ORDEN). Es decisión de
   INSTRUMENTO y bloquea el Δ0 de contenido de todas las familias que quedan,
   porque el fenómeno **aparecerá en cada una**. Las dos salidas están escritas
   en la ficha. Cualquier cambio **vuelve a correr su negativo entero (8/8)**.
2. **Las 3 familias restantes**, de menos a más forma: `/[slug]`
   (`entradas-blog` + `terminos-kunakpedia`) → `/casos-de-exito` ·
   `/case-studies` (`casos`) → `/sectores/[slug]` (`sectores` + `monograficos`).
   Patrón ya escrito: un `apps/web/src/lib/cms/<x>.ts` que llame a
   `leeColeccion<T>` y la página que lo `await`ee. **Cada una paga su Δ0.**
3. **La PRUEBA DE OPERACIÓN**, que ahora sí puede cumplir su criterio.

> ⚠ **Y su trampa, sin cambios:** un `update` por Local API **NO es** el guardado
> del admin. Lo que la prueba caza es la **NORMALIZACIÓN DEL EDITOR** —un save
> que reordena claves, normaliza HTML o «arregla» el rico mueve el render sin que
> nadie haya editado nada— y eso vive en el camino del **admin**. Simularlo con
> un update programático da un verde que **no prueba la pregunta**. Pasa por
> `/admin` de verdad, con `puppeteer-core` y la disciplina de siempre, **o se
> declara NO PROBADA**. Su criterio: al menos una instancia de **CADA**
> colección — una sola no distingue «el editor no degrada» de «esta forma no
> tenía nada que degradar».

## 6 · Pendientes que NO bloquean

**§F2-3-VARIANTE-PISA** (3 orígenes, 2 pisados — M-IMG) · **§F2-3-RSC-ORDEN**
(bloquea el Δ0 de CONTENIDO, no el resto) · 23 imágenes 404 · §M-PDF-FB3D ·
§T3B-NO-CANONICO · §T3-ALCANCE · swiper ×3 · nbc ×1 · HOME cubo B · `Dockerfile` ·
26 celdas ciegas · 6 mínimos · `Breadcrumb` 28 rutas · **CMS-SP-TIPO**
(instrumento hecho, **sigue sin ejercitarse**: el `<sup>` vive en `productos`,
que no es familia de ruta) · los 5 «distinto» de `cmp-srcset` · **M-IMG**.

## 7 · Lo que NO hay que hacer al empezar

- **No ensanchar la máscara de `html-cmp`** hasta que el §F2-3-RSC-ORDEN esté
  decidido. Y si se decide ampliarla, **su negativo entero, no sólo el caso que
  se toca**.
- **No escribir proyectores a mano.** Ya no hay motivo: `leeColeccion` funciona
  sobre las 6 colecciones y está medido.
- **No leer un `clon-base` verde como «no cambió nada»**: mide geometría.
- **No tomar «sólo reparto del stream» por Δ0.** Se cuenta aparte a propósito.
- **No re-congelar `html-f23-base.json`**: es el HTML anterior a la migración y
  es contra lo que se mide el Δ0 de contenido de toda la fase.
- **No dar por buena una declaración de `custom` sin `qa:cms-decl`.** Es la regla
  3 —*documentado no es conectado*— y aquí falla en silencio.

---

# HANDOFF — F2-3 arranca: el canario migrado, el negativo del entorno cazando un verde falso, y el PASO 3 parado con número

> ⚠ **Tanda 2026-08-05 (33.ª).** PASOS 1 · 2 · 3 del encargo, más el registro.
> **El escalón NO disparó.** **`apps/web` SÍ se toca, por diseño y por primera
> vez** — y paga su Δ0 en la misma tanda: 31/31 a 1440 y a 390.

## 0 · Los tres titulares

> **1 · El PASO 2 encontró lo que venía a buscar, y en el sitio menos cómodo.**
> El negativo del entorno —contenedor tirado, build fallido, `.next` borrado—
> corrió `clon-base` y salió **exit 0 con CERO líneas**. La sonda que adjudica
> el Δ0 de esta fase daba verde sin haber medido nada. Causa: `iniciarClon`
> registraba `uncaughtException` **en el mismo bucle** que `exit`, `SIGINT` y
> `SIGTERM`. Los tres primeros son avisos; ése es un **RELEVO**, y registrarlo
> desactiva el comportamiento por defecto de Node. **Alcance derivado: las 7
> sondas que llaman a `iniciarClon()`.**
>
> **2 · El canario está migrado y limpio, y el byte a byte vio lo que el Δ0
> geométrico no.** `clon-base` dio **Δ0 en las 31** y `html-cmp` marcó **2
> distintas**, las dos de `/faqs/*`. Abiertas: **marcado visible idéntico byte a
> byte**, y toda la diferencia en la carga RSC de hidratación —cortes de `push`
> y renumeración de filas— porque `generateMetadata` pasa a ser asíncrona.
>
> **3 · El PASO 3 se para tras el canario, y con dos derivaciones, no con una
> impresión.** «Si sale limpia, las demás siguen su forma» **es falso y está
> medido**: `faqs` es la única colección con **0 de las 4 transformaciones de
> forma**. Y aunque se compartiera el walker, `media` **no guarda la ruta de
> origen**, así que `rutaDeMedia` no se puede implementar. Ficha:
> `PENDIENTES-QA.md` §F2-3-MEDIA · decisión **CMS-0g** en el ESQUEMA §7.

## 1 · PASO 1 — la base REPRODUCE, y «apps/web intacto» era falso

`qa:clon-base` contra la congelada de `5bfb944`: **31/31 · 0 regresiones · umbral
CERO** en los dos anchos. **La base vale.**

Pero el comando del encargo no podía enseñar lo que había: `git diff 5bfb944 HEAD
-- apps/web` sale con **53 KB de altas** porque en `5bfb944` **`apps/web` no
existía** (la app vivía en la raíz). El filtro de ruta mide el **renombrado**, no
el contenido — §El principio otra vez, medido al nivel que absorbe. Cruzando el
renombrado:

```
git diff --stat 5bfb944:src HEAD:apps/web/src   →  2 ficheros, +99 líneas
git diff --stat 5bfb944:public HEAD:apps/web/public → vacío
```

Lo hizo **5a6e1fb** (`productos.seo`), cuyo propio mensaje avisaba: *«⚠ TOCA
apps/web y NO ha pagado su corrida Δ0»*. Llevaba cuatro tandas sin pagarla.

**Reproduce porque el campo es INERTE, y eso se deriva:** `grep -rn "\.seo\b"
apps/web/src` fuera del dato y del tipo da **3 usos, los tres de OTROS tipos**
(`faq.seo`, `doc.seo` ×2). Nadie lee `product.seo`.

> **Las dos frases que se venían usando como una:** «`apps/web` no se ha tocado»
> (falsa desde el 04-08) y «`apps/web` no ha movido un píxel» (verdadera, y ahora
> medida). Un dato añadido y no consumido las separa.

## 2 · PASO 2 — las dos guardas nuevas, y el defecto que destaparon

### 2.1 · `qa:manifiesto` — «sin rutas» deja de ser un verde · negativo **6/6**

Con Postgres en el camino del build, un fallo puede **no tirar el build**: puede
emitir menos rutas. Y entonces `clon-base`, `enlaces` y `slugs` —que derivan sus
rutas del build **a propósito**, para automantenerse— miden sobre el conjunto
menguado sin poder enterarse.

Dos comprobaciones **independientes**, y el negativo las dispara por separado:

| # | qué ve | de dónde saca la verdad | qué ve que la otra NO |
|---|---|---|---|
| 1 | familia dinámica declarada que emitió **0** rutas | **el build solo** | funciona sin línea base |
| 2 | rutas de la congelada que ya no están | la congelada de F2-1 | una familia que emite 5 de 6 |

La #1 existe porque `dynamicRoutes` **sobrevive a un `generateStaticParams()`
vacío**. Sin ese testigo, «devolvió vacío» y «no existe» dan la misma salida.

Y el mínimo de `Evaluadas` sale de **la base**, no del build: derivarlo del
artefacto auditado deja que un build degenerado **se autorice a sí mismo**.

### 2.2 · `qa:html-cmp` — el HTML servido byte a byte · negativo **8/8**

`clon-base` compara geometría. Un `<sup>` perdido, un `alt` vacío o una entidad
mal decodificada **dan Δ0 en sus cuatro medidas**. Y es el riesgo propio de F2-3:
la migración no pretende cambiar nada, así que su criterio natural no es «se
mueve poco» sino **«sale el mismo fichero»**.

**Es alcanzable, y se midió antes de exigirlo:**

| control | resultado |
|---|---|
| dos corridas contra el MISMO build (servidor relanzado) | **31/31 idénticas byte a byte** |
| corrida tras RECONSTRUIR sin tocar código | **31/31 idénticas salvo el `BUILD_ID`** |

### 2.3 · Los TRES niveles, que salieron de medir el canario

La primera versión comparaba **un** hash y marcó `2 DISTINTAS`. Al abrirlas: el
marcado visible era **idéntico byte a byte** y toda la diferencia estaba en la
carga RSC. **Lo que NO se hizo: meter `__next_f` en la normalización** — sería
declarar volátil un tercio del documento para que la sonda calle.

| nivel | qué es | umbral |
|---|---|---|
| `visible` | el documento **sin** los `push` de `__next_f` | **CERO** — es lo que ve el visitante |
| `filas` | las filas RSC con los identificadores **enmascarados** | **CERO** — es el contenido de la carga |
| `normalizado` | el documento entero salvo `BUILD_ID` | **se cuenta y se nombra**: «sólo reparto del stream» |

El negativo los dispara por separado, y el caso que lo hace honesto es
**`solo-reparto`: tiene que salir VERDE y contarse aparte.** Sin él, los tres
niveles serían uno.

**Las dos guardas de la normalización**, que es donde esta sonda podía mentir —
un volátil corto o frecuente no pierde el hallazgo, **borra contenido de los dos
lados y los iguala**: largo mínimo 8 · ≤1 % de los bytes de cada página. El
sabotaje `volatil-ubicuo` **deriva su cadena** del HTML de disco (`" class=""`
×726 = 2.86 % en `accesorios.html`).

**Y el marcador de frescura es `meta.buildId` EN LA CONGELADA.** El protocolo
pide una marca en el HTML servido, y **una migración cuyo efecto esperado es cero
no la puede dejar**. Ésta es mejor: se ve en la evidencia, no en la consola de
quien la corrió.

### 2.4 · El negativo del ENTORNO, medido

| escenario | resultado |
|---|---|
| `next build` con `kunak-cms-pg` parado | **exit 1** · `ECONNREFUSED` → `Failed to collect page data for /faqs/[slug]` |
| `.next` tras ese build | **no queda nada** — ni manifiesto ni `BUILD_ID` |
| `qa:manifiesto` sobre ese estado | **exit 2** · «NO HAY ARTEFACTO QUE AUDITAR» |
| **`qa:clon-base` sobre ese estado** | **exit 0 · CERO líneas** ← el hallazgo |
| familia con `generateStaticParams()` vacío | **`npm run build` sale 0** y emite 29 rutas · `qa:manifiesto` **exit 1** |

De la última sale una consecuencia estructural: **`qa:manifiesto` entra en
`npm run check`**. Un build al que le falta una familia entera sale con 0; la
cadena sólo falla ruidosamente si la guarda corre **dentro** de ella.

### 2.5 · El verde falso de `clon-base`, y por qué el contrato no lo cubría

```js
for (const ev of ["exit","SIGINT","SIGTERM","uncaughtException"]) process.on(ev, …)
```

Parece simetría. **No lo es.** Con un gancho, Node deja de imprimir y deja de
salir con 1 ⇒ **exit 0, salida muda**. Es «0 comparado = verde» con un mecanismo
que el contrato de `Evaluadas` **no podía ver**: si el proceso muere antes de
construir su `Evaluadas`, **no hay contador al que gritar**.

Arreglado en el sitio común (`gritaSiRevienta` en `lib.mjs`), **registrada antes
del atajo de `CLON`** para que el atajo no se quede sin guarda. Control en
`qa:lib` §3b **por los dos lados** — el mismo `throw` sin gancho (≠0, 11 líneas)
y con gancho vacío (0, mudo). **93/93 · las 85 sondas compilan y declaran.**

Y el efecto se **midió después**, no se leyó en el diff: la misma orden que daba
exit 0 mudo ahora da **exit 1** con «EXCEPCIÓN NO CAPTURADA — LA SONDA NO MIDIÓ
NADA».

## 3 · PASO 3 — la primera familia, y su aceptación

`/faqs/[slug]` lee por Local API. `apps/web/src/lib/cms/local.ts` es el único
sitio por el que este artefacto habla con la DB, y **no tiene un solo
`try/catch`**: un `?? []` ahí produce el build en verde con menos rutas.
`sort: "id"` (orden de inserción = orden de `src/lib`), `pagination: false` (el
defecto de Payload son **10** documentos), `coleccion` tipada `CollectionSlug`.

`src/lib/faqs.ts` **no se borra**: pasa a seed histórico y sigue siendo lo que
`catalogos.mjs` inserta y la referencia del round-trip 63/63.

| sonda | resultado |
|---|---|
| `qa:clon-base` @1440 · @390 vs `f21-antes` | **31/31 · 0 regresiones** las dos |
| `qa:html-cmp` vs `html-f23-base` | **31 comparadas · 0 con CONTENIDO distinto** |
| `qa:manifiesto` | 31 rutas · 11 familias · 0 vacías · 0 desaparecidas |
| `qa:enlaces` | limpia en las dos direcciones · 31/31 · 868 hrefs internos |
| `qa:corte` | 12/12 |
| `npm run check` | verde |

## 4 · Por qué el PASO 3 se PARA aquí — con dos derivaciones

**Derivación 1 — la forma del canario no generaliza** (`qa:lectura-forma`,
congelada). Cuántas de las cuatro transformaciones de forma de `mapeo.mjs` tiene
cada colección:

| familia | colección | upload | rel | blocks | richText | hojas |
|---|---|---:|---:|---:|---:|---:|
| `/faqs/[slug]` ✅ | `faqs` | 0 | 0 | 0 | 0 | 7 |
| `/[slug]` | `terminos-kunakpedia` | 0 | 0 | 0 | 0 | 10 |
| `/[slug]` | `entradas-blog` | 1 | 3 | 0 | 0 | 19 |
| `/recursos/[...ruta]` | `documentos-cientificos` | 1 | 1 | 0 | 0 | 21 |
| `/casos-de-exito` · `/case-studies` | `casos` | 2 | 2 | 0 | 0 | 26 |
| `/sectores/[slug]` | `sectores` | 8 | 1 | 1 | 0 | **108** |
| `/sectores/[slug]` | `monograficos` | 8 | 1 | 2 | 2 | **199** |

El canario pudo migrarse con un proyector **a mano, campo a campo**, porque
`faqs` es **0 en las cuatro**. La única otra colección así **comparte ruta** con
una que no lo es. O sea: **la forma del canario no vale para ninguna otra
familia.**

**Derivación 2 — y aunque se compartiera el walker, falta el dato.** `aMedido`
necesita **tres** métodos de contexto (derivado: `grep "ctx\."` sobre su cuerpo):
`rutaDeMedia` · `deRel` · `conKind`. El primero **no se puede implementar**:

```
select filename, url from media limit 1;
  Kunak-AIR-Pro-1024.jpg | /api/media/file/Kunak-AIR-Pro-1024.jpg
```

**`media` no guarda la ruta de origen.** El dato medido escribe `"/images/…"` y
de un id de `media` **no sale esa cadena**. Es la decisión **CMS-0g** (ESQUEMA
§7), y sus dos salidas ya tienen dueño: campo de origen en `media` (esquema, con
migración) o render contra `/api/media/file/…` (**cambia el HTML ⇒ rompe el Δ0**,
o sea **M-IMG**, ya registrada como deuda de RENDER).

> **Ninguna de las dos es «seguir migrando familias».** Escribir proyectores a
> mano para `casos`, `sectores` y `monograficos` sería re-implementar el walker
> en TypeScript — la «segunda lista escrita a mano» contra la que avisa la
> cabecera de `mapeo.mjs`, y **peor aquí que allí**: en el seed las dos listas se
> comparan entre sí (el round-trip); en el render **no hay pareja**, así que un
> olvido sólo se ve si mueve píxeles.

## 5 · LO SIGUIENTE — la PRUEBA DE OPERACIÓN, y su trampa

> ⚠ **Un `update` por Local API NO es el guardado del admin.** Lo que la prueba
> caza es la **NORMALIZACIÓN DEL EDITOR** —un save que reordena claves, normaliza
> HTML o «arregla» el rico mueve el render sin que nadie haya editado nada—, y
> eso vive en el camino del **admin**, no en el de la API. Simularlo con un
> update programático da un verde que **no prueba la pregunta**.

Así que pasa por `/admin` de verdad, con `puppeteer-core` y la disciplina de
siempre (perfil limpio, device metrics, matar por puerto), **o se declara NO
PROBADA**. Es la mitad que el piloto de CMS-0e nunca hizo.

**Su criterio:** al menos una instancia de **CADA** colección — una sola no
distingue «el editor no degrada» de «esta forma no tenía nada que degradar».

**Y hoy sólo hay UNA familia migrada**, así que la prueba de operación en su
forma completa está **acotada por el §4**: puede correrse entera sobre `faqs`
(importar → abrir en admin → guardar sin cambios → `html-cmp` y `clon-base` se
mantienen), y para las demás colecciones hay que decidir **CMS-0g** antes. Las
dos mitades se pueden solapar: la decisión de modelo no depende de la prueba.

**El instrumento ya está**: `qa:html-cmp` es exactamente la sonda que ve una
normalización del editor, porque compara **contenido**, no geometría. Y de
rebote es la que puede cerrar **CMS-SP-TIPO** en cuanto la familia con el `<sup>`
esté migrada.

## 6 · Pendientes que NO bloquean

**⛔ F2-3-MEDIA / CMS-0g** (bloquea las 5 familias que quedan; ficha con las dos
derivaciones) · **23 imágenes 404** · **§M-PDF-FB3D** (5 PDF) ·
**§T3B-NO-CANONICO** (2 de 446) · **§T3-ALCANCE** · **swiper ×3 · nbc ×1** ·
HOME cubo B · `Dockerfile` · 26 celdas ciegas · 6 mínimos · `Breadcrumb` 28
rutas · **CMS-SP-TIPO** (instrumento hecho, falta ejercitarlo) · los 5 «distinto»
de `cmp-srcset` · **M-IMG**, deuda de RENDER · `enlaces.json` canónica es del
**2026-08-01** y difiere en **+8 hrefs** (deriva entre el 08-01 y el 08-03, **no**
de esta tanda: `clon-base` da Δ0 en `nAnclas` contra la base del 08-03 y
`html-cmp` da marcado visible Δ0 en las 31).

## 7 · Lo que NO hay que hacer al empezar

- **No escribir proyectores a mano** para las familias que quedan. Ver §4: el
  número que lo desaconseja son 199 hojas, 17 arrays y 2 uniones de bloques.
- **No leer un `clon-base` verde como «no cambió nada»**: mide geometría. Lo que
  ve el contenido es `qa:html-cmp`, y su verdadero umbral son los niveles
  `visible` y `filas`, no el documento entero.
- **No tomar «sólo reparto del stream» por Δ0.** Se cuenta aparte a propósito, y
  aparecerá en cada familia que migre (su `generateMetadata` pasa a asíncrona).
- **No simular la prueba de operación con un `update` programático.** §5.
- **No dar por cerrada CMS-SP-TIPO** porque exista `html-cmp`: el instrumento
  está, pero **no ha ejercitado** la hoja con el `<sup>` — sigue en `productos`,
  que no está migrada. Regla 8a.
- **No re-congelar `html-f23-base.json`**: es el HTML **anterior** a la
  migración, reconstruido a propósito desde `909f0db`. Es contra lo que se mide
  el Δ0 de contenido de toda la fase.

---

# HANDOFF — F2-2 CERRADA: las diez transformaciones escritas, y las dos derivaciones cazaron un número mal contado cada una

> ⚠ **Tanda 2026-08-05 (32.ª).** Los 7 pasos del encargo. **El escalón NO
> disparó.** **No se toca `apps/web`** — `git diff cda063a HEAD -- apps/web`
> vacío, no paga Δ0. **Y es la última tanda que puede decir eso: F2-3 toca
> `apps/web` por diseño** (§7).

## 0 · Los tres titulares

> **1 · F2-2 CIERRA.** El punto 3 del criterio corregido era el único hueco, y lo
> cierra **T3b y T4b escritas con su negativo**: `cms:extractor` 209/209 cuerpos
> · **10/10 postcondiciones limpias** · `cms:extractor-neg` **11/11**, cada
> sabotaje cayendo por SU postcondición. **Son DIEZ transformaciones, no ocho.**
>
> **2 · Las dos derivaciones corrigieron el reparto que traía este HANDOFF, y las
> dos por lo mismo: LA UNIDAD.** fb3d tiene **6 scripts y 8 VISORES** —2 traen
> `data-pdf` en el atributo y no cargan script, así que T4a nunca los vio y
> ningún censo hecho sobre `scriptsQuitados` podía contarlos—. Misma trampa que
> el «13 mecánicos» de la 30.ª, una vuelta más abajo: allí se contaba de más,
> aquí de menos.
>
> **3 · El invariante D cazó DOS defectos míos antes de estrenarse.** 80
> referencias que no resolvían porque `claveDeMedia` devolvía la **variante** y
> no el origen; y las 51 restantes porque **la media del corpus vive en DOS
> árboles** y yo miraba uno. Un eje nuevo que sale verde a la primera es un eje
> que no ha mirado.

## 1 · PASO 1 — T3b, y lo que el censo obligó a NO hacer

`wp-caption` → `<figure>`/`<figcaption>` con `data-media`. **444 de 446.**

Censo (446 bloques · 83 páginas): 446/446 con **un** `<img>` y **con leyenda** ·
420 con `id="attachment_N"` · 24 con `<a>` · **443 bajo subidas, 3 hotlink**.

| decisión | por qué |
|---|---|
| el `id` de WP y su `aria-describedby` se van **JUNTOS** | quitar uno y dejar el otro fabrica un **puntero colgante** |
| `<figure>`/`<figcaption>`, no `<div>`/`<p>` | es el HTML que significa «leyenda de este medio», y **las dos están en las 43 censadas** |
| `data-media` = **el ORIGEN**, no la variante | `foo-1024x576.jpg` es un **tamaño** de `foo.jpg`. `origenDe` sube a `lib.mjs`: dos copias serían C7 |
| **nada de emparejar por balanceo** | 2 bloques traen un `calls` inyectado con el `<p>` sin cerrar: el `</div>` cae **después del CTA**, y balancear se lo tragaría |

**Lo que NO se toca, y va como pregunta abierta** (§T3-ALCANCE): `size-*` (405) ·
`alignnone` (29) · `alignright` (**2**). §3.2 T3 nombra **tres** marcadores y
éstos no están — ampliar por mi cuenta el alcance de una decisión ajena es cómo
se pierde contenido sin que nadie lo note.

## 2 · PASO 2 — T4b, con el reparto MEDIDO

| clase | n | qué hace T4b |
|---|---|---|
| **`fb3d-flipbook`** | **8** (no 6) | → `<p><a href="<PDF>" data-media="…">TÍTULO</a></p>`. Forma A (6): `guid`+`title` del payload **base64**; forma B (2): `data-pdf` en el atributo |
| **`flourish`** | **4** | el `<div>` se **conserva** y el `<iframe>` entra dentro — **copiado de un hermano del mismo corpus** que ya lo trae materializado |
| `twitter` · `instagram` | 3 | **nada**, y es un resultado medido: el `<blockquote>` degrada a cita válida con su enlace |
| `swiper` · `nbc` | 3 + 1 | **listados** con su documento y su clase §3.3. **No es escalón: es una lista con nombre y dueño** |

Del hermano de Flourish se copia todo menos **la altura** (`673.078px`, que el
script mide en ejecución para ESA visualización — cablearla sería una familia de
calibración) y **`data-mce-fragment`** (residuo de TinyMCE).

## 3 · PASO 3 — §M-ORIGEN404 DECIDIDO: el dato conserva la referencia

**Y no es una preferencia: lo resuelve la regla 1** (*verbatim, erratas
incluidas*). **El original SIRVE la referencia** — lo que falta es el fichero al
otro extremo, así que el corpus no está mal: el origen está roto. Quitar el
`<img>` sería una desviación **irreversible**: el día que repongan el fichero, un
dato que conserva la referencia se arregla solo.

Que la página pinte un hueco es **decisión de render** y va por su carril — la
misma razón por la que M-IMG cambió de dueño en vez de cerrarse desde F2-2.

**Los 3 documentos van nombrados y DERIVADOS** de `extractor-corpus.json`. La
primera versión de esa tabla los escribió **de memoria: uno inventado y dos mal**,
y dos ni eran del grupo correcto. Regla 9, séptima instancia.

**Y la referencia queda MARCADA:** invariante **D** del eje `existencia`, con las
exenciones como **PREDICADOS y no listas** — «se pidió y el índice registró su
error» (§M-ORIGEN404) y «es un PDF que T4b sacó de un base64» (§M-PDF-FB3D). Una
imagen nueva sin fichero no cumple ninguno y **sale roja**. Sabotaje
`media-inventada`, negativo **7/7**.

## 4 · Los TRES hallazgos, y ninguno daba error

| # | qué | cómo se vio |
|---|---|---|
| **1** | **§M-PDF-FB3D · 5 PDF que el CMS iba a referenciar sin fichero detrás.** `listaACapturar` se derivó del **markup** y esas URL viven en **base64**: ningún barrido de markup podía verlas | el invariante D, en su primera corrida |
| **2** | **`claveDeMedia` devolvía la variante** — 80 referencias sin resolver | idem |
| **3** | **la media del corpus vive en DOS árboles**: `media-corpus/` y `apps/web/public/images/uploads`, porque `listaACapturar` **resta lo que ya era local** (63 de 600). Mirar uno da 51 falsos positivos | idem |

> **Los tres los encontró el eje nuevo, y dos eran MÍOS.** Es el argumento a
> favor de estrenar una sonda contra un dato grande y no contra el caso que
> tienes en la cabeza: 432 documentos reales encuentran lo que 5 inventados no.

## 5 · PASO 4 — la de-duplicación de `w()`, en el sitio común

`clon-base` normalizó el puerto efímero **en su sonda** el 04-08 y ahí se quedó
— la instancia, no la clase. Pero **`meta.fecha` la tiene TODA congelada que use
`hoy()`**: la misma medida de otro día estrenaba fichero y la guarda de la regla
5 avisaba de un cambio que no existe.

`volatilesQueDifieren()` en `lib.mjs`: lista **corta y explícita**, sólo dentro
de `meta`, **NOMBRADA** en la salida, y **la congelada no se reescribe** (cambiarle
la fecha sería inventar que se volvió a medir). Con su **CONTROL** en `qa:lib`
(**85/85**): otro día **Y** otro número tiene que seguir estrenando fichero, o
«excluye volátiles» sería «de-duplica siempre».

## 6 · PASO 6 — F2-2 contra el criterio de 5 puntos

| # | criterio | estado |
|---|---|---|
| 1 | siembra y round-trip idéntico | ✅ **63/63**, negativo 6/6 |
| 2 | corpus **y media** capturados, congelados y commiteados antes de transformar | ✅ 309 páginas + **534/537 · 335 MB** con `sha256`; los 3 restantes ⇒ §M-ORIGEN404 **decidido** |
| 3 | **T1–T8 con negativo por transformación** | ✅ **son DIEZ**: 10/10 limpias · negativo **11/11** |
| 4 | el saneador ejecuta el contrato censado | ✅ 6/6 · 21 hosts · **y admite el corpus transformado por las diez** |
| 5 | lo almacenado basta para reconstruir el contenido | ✅ caja 7/7 · `srcset` 311/311 · dimensión 73/73 · **relación de media 432 docs, 0 ausencias nuevas** |

**M-IMG NO cierra: cambia de dueño** — deuda de RENDER en `apps/web`. Un criterio
que no se puede cumplir nunca no discrimina, y por eso mismo la postcondición de
T3b dice *«no queda un `wp-caption` **canónico**»* y no *«ninguno»*.

## 7 · LO SIGUIENTE — F2-3 · Lectura, y ROMPE LA RACHA POR DISEÑO

> ⚠ **F2-1 y F2-2 se cerraron con `git diff -- apps/web` vacío en todas sus
> tandas, y eso se ha venido citando como señal de que nada se rompía. F2-3
> TIENE que tocar `apps/web`**: las páginas pasan a leer por Local API en build.
> **Desde ahí cada tanda paga su Δ0** y «apps/web intacto» deja de ser un renglón
> del informe. Confundir el fin de la racha con una regresión —o no medir porque
> «esta fase ya toca apps/web»— son los dos errores que este aviso evita.

**Aceptación:** la del **§8** con **umbral CERO sobre TODO el
`prerender-manifest`** —el criterio es el manifest, no un número—, con
**MARCADOR de frescura** en el HTML servido y **la sonda probada en negativo**
antes de creerle un «limpio».

**Y la PRUEBA DE OPERACIÓN, que el Δ0 solo no cubre:** importar → **abrir la
entrada en el admin** → **guardar SIN cambios** → y que el Δ0 **se mantenga**.
Caza los round-trips destructivos del editor —un save que normaliza HTML,
reordena claves o «arregla» el rico mueve el render sin que nadie haya editado—.
Es la mitad que el piloto de CMS-0e **nunca probó**: un round-trip verde prueba
que la ida y la vuelta son inversas, **no** que pasar por el editor no normalice.

## 8 · Pendientes que NO bloquean

**23 imágenes 404** (tanda aislada; su Δ0 **se moverá** y ese movimiento es
**corrección**, a adjudicar ruta a ruta) · **§M-PDF-FB3D** (5 PDF; el arreglo es
que `media-regenera` los derive y re-congele = **re-abrir la captura**) ·
**§T3B-NO-CANONICO** (2 de 446) · **§T3-ALCANCE** (`size-*` · `alignnone` ·
`alignright`) · **swiper ×3 · nbc ×1** sin sustituto · HOME cubo B ·
`Dockerfile` · 26 celdas ciegas · 6 mínimos · `Breadcrumb` 28 rutas ·
**CMS-SP-TIPO** · los 5 «distinto» de `cmp-srcset` · **M-IMG**, deuda de RENDER.

## 9 · Lo que NO hay que hacer al empezar

- **No re-capturar media, ni los 5 de §M-PDF-FB3D a mano.** Bajar 5 ficheros
  sueltos rompe la cadena de derivación (regla 9): el arreglo es que
  `qa:media-regenera` **derive** las referencias de los payloads FB3D y re-congele
  su lista. Eso re-abre la captura, y es una tanda con su alcance.
- **No leer el verde del invariante D como «no falta ninguna imagen».** Faltan
  **8** (3 + 5), exentas **por predicado** y con ficha. Una novena saldría roja.
- **No contar T4b por scripts.** Son **8 visores fb3d** y 6 scripts, y la
  diferencia son 2 sustituciones reales.
- **No barrer `size-*`/`alignnone`/`alignright` «ya que estamos».** §3.2 T3 no los
  nombra; `alignright` es decisión editorial y los otros parecen residuo — no es
  la misma respuesta para los tres.
- **No dar por hecho que `apps/web` sigue intacto en F2-3.** Ahí cambia el
  contrato: se toca y **se mide**.

---

# HANDOFF — F2-2 a UNA TANDA de cerrar: la media congelada, el eje `existencia` construido, y sólo faltan T3b y T4b

> ⚠ **Tanda 2026-08-05 (31.ª).** PASOS 1 · 2 del encargo, más el refinamiento de
> T4b y el registro. **El escalón NO disparó.** **No se toca `apps/web`** —
> `git diff f416b85 HEAD -- apps/web` vacío, no paga Δ0.

## 0 · Los tres titulares

> **1 · El original sale del CAMINO CRÍTICO, también para la media.** 534 de 537
> ficheros capturados (**335 MB**), con `sha256`, `-text` en `.gitattributes` y
> **commiteados antes de transformar nada**. Con el HTML congelado desde la 27.ª,
> **es la última vez que este proyecto le pega al sitio vivo por un fichero**.
>
> **2 · Los 3 que faltan NO son defecto nuestro: dan HTTP 404 EN EL ORIGINAL**,
> verificado a mano tras los 2 reintentos. El corpus los referencia y kunakair
> ya no los tiene ⇒ §M-ORIGEN404, y es **decisión de contrato**, no captura
> incompleta.
>
> **3 · El eje `existencia` está CONSTRUIDO**, y con él se verificó la captura:
> **1 497 artefactos**, negativo **6/6** con un sabotaje por invariante. Es el
> hueco donde cayeron los dos hallazgos de los dos días anteriores.

## 1 · PASO 1 — la captura

`npm run cms:captura-media` · lista **derivada** de `media-regenera.json` ·
secuencial · 500 ms · **nunca en paralelo** · reanudable sin re-pegar ·
**FUERA de `corpus/`** (meterla dentro movería los denominadores congelados 309
y 209, citados en actas).

⚠ **Y el contrato de `Evaluadas` hizo su trabajo:** la corrida sale **«NO SE PUDO
EVALUAR · 534 de 537»** con código ≠ 0, no un verde con 3 huecos.

## 2 · PASO 2 — el eje `existencia`

`npm run qa:artefacto` · **1 497 artefactos** · negativo **6/6**.

| invariante | qué comprueba | n |
|---|---|---|
| **A** | lo que el clon SIRVE existe en `apps/web/public` | 406 |
| **B** | lo CAPTURADO existe y su `sha256` casa | 534 |
| **C** | cada tamaño que la ficha del CMS declara existe **y mide eso** | 557 |

**«Existe» y «mide lo que dice» van separados a propósito:** una sonda que sólo
comprobara la primera daría verde sobre un recorte equivocado. Y las 23 de
§M-404 van en lista **derivada de la congelada**: no ponen el eje en rojo, pero
**una nueva sí**.

## 3 · T4b, refinado: son 10, no 13

Comprobado **corriendo T1–T8** y mirando qué sobrevive sin su `<script>`:

| clase | n | sin su script |
|---|---|---|
| `fb3d-flipbook` | 6 | ⚠ **necesita sustitución** — el PDF vive sólo en el payload base64 |
| `flourish` | 4 | ⚠ **necesita sustitución** — el `<div>` sobrevive **vacío** |
| `twitter` · `instagram` | 3 | ✅ **no necesitan nada**: el `<blockquote>` degrada a cita válida con su enlace |
| `swiper` | 3 | ⛔ decisión de render |
| `nbc` | 1 | ⛔ imposible |

**El «13 mecánicos» de ayer contaba como trabajo 3 casos que no lo son.**

## 4 · ⛔ LO QUE FALTA PARA CERRAR F2-2 — y es UNA cosa

| # | pendiente |
|---|---|
| 1 | **T3b** (`wp-caption` → relación de media con leyenda) |
| 2 | **T4b** — 10 sustituciones derivables + 4 fichadas (3 swiper + 1 nbc) |
| 3 | *(no bloquea el criterio)* la de-duplicación de `w()` con campos volátiles |

Los 4 puntos restantes del criterio corregido **están cumplidos con evidencia**
(tabla punto por punto en `PLAN-FASE-2.md` §F2-2 · tercera reentrada).

## 5 · LO SIGUIENTE — F2-3 · Lectura

**Entrega:** lectura por **Local API en build** (sin HTTP en el camino de los
datos, que es lo que CMS-0f compró), con **aceptación de umbral CERO sobre TODO
el `prerender-manifest`**, no sobre una muestra.

> ⚠ **Y la mitad que el piloto de CMS-0e nunca probó: LA PRUEBA DE OPERACIÓN.**
> Importar → **abrir la entrada en el admin** → **guardar SIN cambios** → y que
> el Δ0 **se mantenga**. Un round-trip verde prueba que la ida y la vuelta son
> inversas; **no** prueba que pasar por el editor no normalice nada. Son dos
> afirmaciones distintas y sólo la primera está medida.

## 6 · Pendientes que NO bloquean

23 imágenes **404** del clon (tanda aislada; su Δ0 **se moverá** y ese movimiento
es **corrección**, a adjudicar ruta a ruta) · **§M-ORIGEN404** (3 ficheros que el
original ya no sirve: decisión de contrato, va con T4b) · HOME cubo B ·
`Dockerfile` · 26 celdas ciegas · 6 mínimos · `Breadcrumb` 28 rutas ·
**CMS-SP-TIPO** · los 5 «distinto» de `cmp-srcset` · **M-IMG**, que **cambió de
dueño**: es deuda de RENDER en `apps/web`.

## 7 · Lo que NO hay que hacer al empezar

- **No volver a capturar media.** Está congelada y commiteada con `sha256`; el
  eje `existencia` lo verifica. Re-pegarle al original es tocar la línea base.
- **No reintentar los 3 de §M-ORIGEN404.** Dan 404 en el origen: reintentar no
  los trae. Lo que falta es **decidir** qué hace el contenido importado con
  ellos.
- **No contar T4b como 13 sustituciones.** Son **10**; 3 no necesitan nada.
- **No inventar el sustituto del NBC ni la galería del swiper.** Regla 6: una
  transformación que falta se rechaza, no se sustituye a ojo.
- **No leer el verde del eje `existencia` como que no hay imágenes rotas.** Hay
  **23**, fichadas y con dueño; el eje las excluye **derivándolas**, no
  ignorándolas.

---

# HANDOFF — F2-2 bloque 3 · la captura baja a 537, T4b resulta DERIVABLE, y los `imageSizes` estaban apagados otra vez

> ⚠ **Tanda 2026-08-05 (30.ª).** PASOS 1 · 4 del encargo, más la corrección del
> criterio de F2-2 (PASO 5) y su registro. **El escalón NO disparó.** **No se
> toca `apps/web`** — `git diff eacb79f HEAD -- apps/web` vacío, no paga Δ0.

## 0 · Los tres titulares

> **1 · Los `imageSizes` volvían a estar INERTES, y el arreglo de ayer era la
> INSTANCIA.** La 28.ª puso `sharp` en `scripts/seed/cli.mjs`; pero
> `cms-roundtrip` **re-siembra** (y su negativo lo lanza 6 veces más) llamando a
> `construyeConfig()` a secas, así que **cada round-trip borraba las variantes**.
> Medido: `media/` en **112 ficheros y 0 variantes reales**. Arreglado en el
> sitio común ⇒ **667 · 539 variantes**, y **sobreviven** al round-trip.
>
> **2 · La captura baja de 1 571 a 537, y NO por regenerar variantes.** El
> pipeline reproduce la **dimensión exacta** (73/73) y **no los bytes** (0/73).
> Pero el ahorro real es otro: **dos tercios de la media del corpus vive en el
> CASCARÓN** y no entra en el CMS. `qa:media-regenera`, negativo **5/5**.
>
> **3 · T4b es DERIVABLE, y el PLAN decía que no.** *«Necesita el PDF y la URL
> de la noticia, que el catálogo no tiene»* es cierto de `src/lib` y **falso del
> corpus**: el payload de FB3D es **base64** y lleva dentro la URL del PDF.
> **13 de 17 mecánicas · 3 decisiones de render · 1 imposible.**

## 1 · PASO 1 — medir antes de pedirle 1 571 ficheros al sitio vivo

`npm run qa:media-regenera` · negativo **5/5** · congela `media-regenera.json`
con **la lista de captura derivada** (`listaACapturar`).

| | |
|---|---|
| dimensiones idénticas (pipeline real vs variante capturada) | **73/73** |
| sha256 idéntico | **0/73** — jpeg **+6 %**, **png +256 %** (3 ficheros) |
| CONTROL · ficheros comparados **consigo mismos** | **38/38** |
| a capturar | **537** (de 600 orígenes del cuerpo, 63 ya locales) |

⚠ **La primera versión mezcló las dos poblaciones de `media/`** —GENERADAS por
sharp y SUBIDAS que ya se llamaban `-WxH`— y sacó *«38 de 111 idénticos»*: un
dato **inventado por el instrumento**, porque comparaba ficheros **consigo
mismos**. Ahora los SUBIDOS son el **CONTROL** (tienen que dar 100 %), y su
sabotaje es `sin-poblaciones`.

⚠ **39 de 721 variantes del cuerpo no las regenera `IMAGE_SIZES`** (`600x600 ×32`
+ 7). `600x600` está fuera **por medida** (cascarón, y la única que recorta).

## 2 · PASO 4 — T4b, por sus ENTRADAS

| clase | n | sustituto |
|---|---|---|
| `fb3d-flipbook` | 6 | ✅ payload **base64** → `.posts[].data.guid` (PDF) + `.title` |
| `flourish` | 4 | ✅ `<div class="flourish-embed" data-src="visualisation/NNNN">` |
| `twitter` | 2 | ✅ `<blockquote class="twitter-tweet">` → `href` con `/status/\d+` |
| `instagram` | 1 | ✅ `data-instgrm-permalink` |
| `swiper-jsdelivr` | 3 | ⚠ el DATO está (10–11 slides); «galería nativa» es **decisión de render** |
| `nbc` | 1 | ❌ sólo la URL del **REPRODUCTOR**, no la del artículo |

⚠ **La primera derivación dio 17/17 y era falsa:** contaba «encontré un dato»
como «encontré EL dato». Regla 4, tercera cara — y el número plausible era el
más cómodo.

## 3 · PASO 5 — el criterio de F2-2, CORREGIDO

El criterio exigía *«el `srcset` emitido coincide con el del original → M-IMG
cerrado»*. **M-IMG es deuda de RENDER en `apps/web` desde la 29.ª**, así que F2-2
—que es DATOS— no puede cerrarlo. *Un criterio que no se puede cumplir nunca es
peor que uno exigente: no discrimina.* Reescrito en `PLAN-FASE-2.md` §F2-2 en 5
puntos, con M-IMG **cambiando de dueño**, no cerrándose.

## 4 · ⛔ F2-2 NO ESTÁ CERRADA, y esto es lo que falta

| # | pendiente | estado |
|---|---|---|
| 1 | **capturar los 537** | lista **derivada y congelada**, lista para ejecutar (secuencial, espaciada, sha256, `.gitattributes`, commit antes de transformar) |
| 2 | **T3b** (`wp-caption` → relación de media) | desbloqueada por la 29.ª; sin escribir |
| 3 | **T4b** | deja de ser incógnita: 13 mecánicas · 3 decisiones · 1 imposible |
| 4 | **de-duplicación de `w()`** con campos volátiles | fichada, sin hacer |

## 5 · Pendientes que NO bloquean

23 imágenes **404** (tanda aislada, su Δ0 se moverá y es corrección) · eje
**`existencia`** 0/31 · **ninguna sonda mira `media/`** (nuevo, hermano del
anterior) · HOME cubo B · `Dockerfile` · 26 celdas ciegas · 6 mínimos ·
`Breadcrumb` 28 rutas · **CMS-SP-TIPO** · los 5 «distinto» de `cmp-srcset`.

## 6 · Lo que NO hay que hacer al empezar

- **No capturar las 1 571.** Están medidas: son **537**, y la lista está
  congelada. Capturar el cascarón es pedirle al sitio vivo mil ficheros que el
  CMS no usa.
- **No creerse que los `imageSizes` funcionan porque el seed salga verde.**
  Payload avisa en un WARN y sigue con **exit 0**. La comprobación es contar
  variantes en `media/`, no leer la salida.
- **No dar T4b por bloqueada.** El PLAN lo decía y está medido que no: el corpus
  trae el dato. Lo que falta es **decidir** la galería y **aceptar** que el NBC
  no tiene sustituto derivable.
- **No inventar el sustituto del NBC.** Regla 6: una transformación que falta se
  rechaza, no se sustituye. Va como pendiente con su documento y su clase.

---

# HANDOFF — F2-2 bloque 3 · la frontera del «ancho pedido» CERRADA sin añadir nada, y el seed desbloqueado

> ⚠ **Tanda 2026-08-05 (29.ª).** PASOS 1 · 2 · 6 · 3 · 7 del encargo de
> reentrada. **El escalón NO disparó**, y se comprobaron sus tres condiciones:
> la frontera la arbitran los dos tests (falla la primera) y `anchoPct` es
> precedente directo (falla la tercera) ⇒ **era ejecución**. **No se toca
> `apps/web`** — `git diff 7e1e154 HEAD -- apps/web` vacío, así que no paga Δ0.

## 0 · Los tres titulares

> **1 · La frontera del «ancho pedido» se CIERRA SIN AÑADIR NADA AL ESQUEMA, y
> con número.** La tanda anterior la dejó como *«la decisión que desbloquea
> M-IMG: ¿campo del bloque, o derivado del render?»*. **Ninguna de las dos.**
> `qa:media-hueco` (nueva, negativo **7/7**): **0 de 237** pares y **0 de 715**
> grupos varían **por encima** del contenedor de contenido; las **7** excepciones
> caen **todas por debajo**, y ahí el atributo ya viaja verbatim — **311/311**
> sobreviven a T1–T8.
>
> **2 · El seed vuelve a terminar, y el `63/63` está RE-VERIFICADO.** §3.3b
> **ampliada y firmada** (21 hosts) por el **procedimiento de alta**, no
> re-firmando la lista. La congelada nueva difiere de la del 04-08 **sólo en
> `meta.fecha`**. §M-SEED **CERRADO**.
>
> **3 · M-IMG NO se cierra — y pasa de deuda de MODELO a deuda de RENDER.** De
> sus tres razones, la nº 1 se **disuelve** (no hay nada que modelar). Quedan dos
> y las dos son de **alcance**: la población de la ficha no está en el corpus
> (**7** páginas fuera de 31, no 10 — recuento corregido) y los 5 «distinto»
> siguen sin dirimir.

## 1 · PASO 1 — la firma, y lo que desbloqueó

§3.3b suma **`kunakcloud.com` · `player.vimeo.com` · `dailymotion.com`**,
derivados de `medidas/c-embeds.json` (76/76). Alcance firmado: **grupo A + grupo
C censados**. `googletagmanager.com` **fuera con su evidencia** — 76 en 76/76 =
cascarón (regla 4, el pleno), jamás candidato.

| | |
|---|---|
| `cms:seed` | **63 documentos en 13 colecciones** |
| `qa:cms-roundtrip` | **63/63 IDÉNTICOS** · sólo cambia `meta.fecha` |
| `qa:saneador-neg` | **6/6** (21 hosts) |
| `qa:cms-roundtrip-neg` | **6/6** (4 cazan · 1 ciego · control) |

## 2 · PASO 2 — la frontera, y los DOS defectos míos que el dato cazó

`npm run qa:media-hueco` · offline sobre `corpus/` · **negativo 7/7**.
Aplica los dos tests **después** de derivar el régimen del `<body>`
(PLANTILLADO×209 · BUILDER×24 · SIN MARCADOR×76), y **el test A no se aplica**
con su razón escrita: su alcance declarado es el RITMO.

> **Por encima del contenedor de contenido lo fija el HUECO ⇒ plantilla. Por
> debajo viaja DENTRO del campo rico ⇒ ya está almacenado. NO ENTRA NADA.**

**Y NO es un `anchoPct`:** aquél varía entre módulos hermanos de la misma
página; éste no varía **ni entre instancias**.

⚠ **Los dos defectos, los dos daban un veredicto plausible y FALSO, y los dos
quedan como sabotaje** (artefactos con marcador `SONDA-`, regla 7):

| defecto | qué producía |
|---|---|
| medir el **ancho renderizado** en vez de la caja pedida | `large` es una CAJA y WordPress **no amplía** ⇒ el renderizado es `min(caja, ancho NATIVO)` y mezcla dos poblaciones. Sacaba «86 grupos varían» ⇒ **CAMPO**. Es el error de `media-srcset` §1 **un nivel más arriba** |
| definir el contenedor de contenido **sólo** como `post_content` | deja al BUILDER **sin contenedor**, y el HTML que escribió una persona cuenta como cascarón. Sacaba 6 pares falsos |

## 3 · PASO 6 — M-IMG con su número Y con su alcance

**311/311 pares · 140 igual · 70 sin `srcset` · 5 distinto**, congelada
**idéntica byte a byte**. ⚠ Eso prueba que **el CLON es estable, no que el sitio
no haya cambiado**: el lado «original» es la captura congelada.

⚠ **Recuento corregido (regla 9):** el «10 que faltan» es `34 − 24` sobre
entradas del manifest que incluyen **3 no-páginas**. En la unidad de la matriz
—la RUTA— son **7** (`/` + 4 sectores + 2 monográficos), y la fila de
`COBERTURA-MEDICION.md` decía `24 · 0 · 10` **sobre un denominador de 31**:
corregida.

## 4 · PASO 3 — fichado, no arreglado, y el eje que abre

Las **23 imágenes 404** siguen fichadas (§M-404). **No se arreglan aquí**, y no
por tiempo:

> **el Δ0 SE VA A MOVER, y ese movimiento es CORRECCIÓN, no regresión.** Una
> imagen presente maqueta distinto que una rota. Hay que adjudicar **ruta a
> ruta contra el original** ⇒ **tanda aislada**, con el precedente de la
> conversión a monorepo.

**Eje nuevo NOMBRADO y no construido: `existencia`** — ninguna guarda comprueba
que lo que el clon sirve devuelva **200**. Se llama `existencia` y no
«imágenes» porque el mismo agujero cubre `srcset`, `<source>`, `<video>`, los
PDF y las fuentes. Entra en `COBERTURA-MEDICION.md` a **0/31**.

## 5 · ⛔ LO QUE NO SE HIZO

| paso | estado | razón |
|---|---|---|
| **4 · T3b / T4b** | **NO** | **quedan DESBLOQUEADOS** por el PASO 2 — pero cada uno exige su sabotaje por su propio invariante y el negativo entero re-corrido. Es la tanda siguiente, no su cola |
| **5 · capturar los 1 571** | **NO** | es lo que hace medible la población de M-IMG. **Fuera de `corpus/`**: meterlas dentro movería los denominadores congelados (309 y 209) |

## 6 · De rebote: una congelada rancia

`cms-campos.json` llevaba desatendida desde `5a6e1fb` (`Product` 9 → **12**
campos). La sonda sigue **verde** —0 campos sin contraparte—, así que era
congelada rancia y **no** defecto de esquema. Re-congelada a propósito con
`PISAR`, con la vieja a salvo en git (`0c71f89`).

## 7 · Pendientes que NO bloquean

| # | pendiente | por qué no bloquea |
|---|---|---|
| 1 | **HOME sin content type** | cubo B: modelarla después es AÑADIR |
| 2 | **`Dockerfile` sin verificar** (dos apps, un compose; **y no hay servicio de Postgres en él** — el contenedor se levanta a mano) | lo cobra F2-4 |
| 3 | **26 celdas ciegas** · comportamiento 0/31 · **`existencia` 0/31** | deuda de medición del CLON |
| 4 | **`qa:cobertura` no conoce los 2 ejes nuevos** — su matriz dice «9 ejes» y el documento discute 11 | se arregla enseñándoselos, no editando el rótulo |
| 4b | **una congelada con `hoy()` en `meta` NUNCA se de-duplica** — la de-duplicación de `w()` (*«idéntica se reescribe, no se pierde nada»*) no puede dispararse jamás, así que **cada corrida en un día nuevo estrena fichero aunque no haya cambiado un dato**. Visto hoy en `slugs` y `cms-campos`; es **la clase del puerto efímero de `clon-base`** (defecto 2 de la 26.ª) generalizada al sello de fecha | ruido de `medidas/`, no medida falsa. Lo paga quien toque `w()` |
| 5 | **`Breadcrumb` 28 rutas** (−33.25, de ancho) | `clon-base` no lo ve |
| 6 | **CMS-SP-TIPO** — el Δ0 de render de F2-3 | punto ciego verificado en cada negativo |
| 7 | **`/kunak-api` `<title>`** | ninguna sonda compara el `<head>` |
| 8 | **extracción de builder** (casos · faqs · productos) | otra mecánica, su tanda — **y es lo que falta para medir los 6 pares del módulo de texto** |
| 9 | **M-404** — 23 imágenes 404 | tanda aislada, paga Δ0 |
| 10 | **los 5 «distinto» de `cmp-srcset`** | SIN DIRIMIR: necesitan una **segunda** captura |

## 8 · Lo que NO hay que hacer al empezar

- **No modelar el «ancho pedido».** Está **medido** que no hay que hacerlo
  (§2). Volver a plantearlo como «¿campo o derivado?» es re-abrir una frontera
  cerrada con número.
- **No leer la re-corrida idéntica de `cmp-srcset` como que el original no ha
  cambiado.** Su lado «original» es la captura congelada: la igualdad es
  esperable **por construcción**, y los 5 «distinto» siguen sin dirimir.
- **No cerrar M-IMG.** Le quedan dos razones de ALCANCE, y la principal —su
  población— se resuelve con el PASO 5, no con una decisión.
- **No arreglar las 23 imágenes de paso.** Su Δ0 se mueve a propósito y hay que
  adjudicarlo ruta a ruta; dentro de otra tanda su Δ0 deja de ser interpretable.
- **No meter las 6 rutas que faltan dentro de `corpus/`.** Movería los
  denominadores congelados (309 y 209), citados en actas.
- **No dar de alta `googletagmanager.com`.** Es cascarón, 76/76, y la razón ya
  está escrita para no re-derivarla.
- **No leer el rojo de `cmp-srcset` como fallo de instrumento.** Su control sale
  con **exit 2 a propósito**: ese rojo ES el hallazgo del criterio.

---

# HANDOFF — F2-2 bloque 3 PARADO POR EL ESCALÓN: el srcset no es función de la imagen, y M-IMG no se cierra

> ⚠ **Tanda 2026-08-04 (28.ª).** PASOS 1 · 2 · 6 · 4 del encargo del bloque 3.
> **El escalón DISPARÓ en el PASO 1**, que es donde el encargo dijo que podía
> disparar. **No se toca `apps/web`** — `git diff 6795883 HEAD -- apps/web`
> vacío, así que no paga corrida Δ0; aun así las dos sondas que miden el clon se
> re-corrieron tras el `check` y salen **idénticas a sus congeladas**.

## 0 · Los tres titulares

> **1 · La premisa del §F2-2 —*«image sizes replicando el `srcset` del
> original»*— es MEDIA VERDAD, y la mitad falsa es la que cierra M-IMG.**
> Censado en las 309 páginas congeladas: un juego FIJO genera **todos** los
> ficheros (9 cajas, 0 formas sin explicar) y **no determina el atributo**.
> **39 de 519 imágenes se sirven con `srcset` distinto según el punto de uso.**
> ⇒ **NECESARIO y NO SUFICIENTE.**
>
> **2 · El eje `srcset` se comparó de dos lados POR PRIMERA VEZ, y M-IMG no se
> cierra — con número: 311 pares · 140 iguales · 70 sin `srcset` · 5 distintos.**
> Y la mitad que más pesa es de ALCANCE: **la población de M-IMG no está en el
> corpus**, así que su propia ficha no es medible con esta sonda.
>
> **3 · Los `imageSizes` llevaban desde que se escribieron SIN GENERAR NADA.**
> `IMAGE_SIZES` declarado, conectado, versionado… y el seed corría sin `sharp`.
> Payload lo avisa en un WARN y sigue con exit 0. Efecto medido tras el arreglo:
> `media/` de **85 a 545 ficheros**, 485 variantes.

## 1 · PASO 1 — el contrato del `srcset`, DERIVADO parseando el atributo

`npm run qa:media-srcset` · offline sobre `corpus/` · **negativo 7/7**
(5 que cazan · 1 **diana perdida verificada** · control).

**Lo primero que había que deshacer era una LECTURA.** El grep tosco devuelve
1110 · 1156 · 1198 · 1238 · 1279 · 1333 · 1338 · 1478, que parece «anchos por
imagen». **Son dos poblaciones y el grep las mezcla:**

| población | anchos | qué es |
|---|---|---|
| variante generada (`-WxH`) | **13** | tamaños declarables |
| sólo el original sin recortar | **60** | la anchura NATIVA de esa imagen |

Y las **1 819 URLs del INDICE son VARIANTES**: detrás hay **519 imágenes
origen**. El `srcset` multiplica.

**No son anchos, son CAJAS.** Las 13 se pliegan en **9**; `114 · 126 · 247 ·
576` son la **salida** de las cajas 300 y 600 sobre retratos. En el **cuerpo**
sólo aparecen las seis de ancho libre (w480 · w980 · w1280 · w1024 · w300 ·
w768); `caja150` · `caja300` · `caja600` están a **0 en cuerpo** — cascarón — y
`caja600` es la única que **recorta**.

**El hallazgo que dispara el escalón:**

```
2025/07/aaqms.jpg   ×20  480w · 980w
                    × 1  480w · 980w · 1280w · 1800w
```

La lista **se topa en el ancho pedido** y **siempre incluye el fichero pedido**.
Ese dato no está en la colección de media ni modelado en ningún sitio.

## 2 · PASO 2 — las dos poblaciones, de la SALIDA SERVIDA

`npm run qa:media-poblaciones` · **negativo 4/4**.

| | n | bytes | restricción |
|---|---|---|---|
| **(a) SERVIDA** por las 32 rutas | **406** | 65.5 MB | **DURA** — Δ0 del artefacto |
| **(b) sólo corpus** | **1 571** de 1 819 | — | ninguna todavía |
| solape | 248 | 52.9 MB | |
| en disco y sin servir | 245 | 23.0 MB | peso muerto |

Falta por capturar: jpg×1304 · png×103 · jpeg×67 · webp×45 · svg×20 · pdf×16 ·
mp4×8 · gif×7 · 1 sin extensión.

> ⚠ **Y de rebote, 23 imágenes que el clon SIRVE y NO EXISTEN** — Rio ×15 ·
> Des Moines ×7 · metano ×1. **HTTP 404 verificado**, no aritmética de
> conjuntos. No lo ve **ninguna** sonda: `clon-base` mide `docH` · `h1.y` ·
> secciones · enlaces, y una imagen rota no mueve ninguno. §M-404.

## 3 · PASO 6 — el eje `srcset`, de dos lados

`npm run qa:cmp-srcset` · original = corpus congelado · clon = HTML **servido**
· unidad = **PAR (ruta × imagen origen)**, no la ruta · **negativo 4/4**.

```
311/311 pares · 140 IGUAL · 70 el clon NO emite srcset · 5 DISTINTO
              · 96 sin pareja (posts barajados: no es del eje)
```

Los 70 se concentran **donde el clon CONSTRUYÓ**: `/software` 19/37 ·
`/accesorios` 14/18 · `/monitor` 8/51 · `/kunak-api` 2/18. En grupo A el
`srcset` viaja **verbatim dentro del HTML rico**, y por eso 140 salen iguales.

**Y la frontera, DERIVADA:** de las 34 rutas del build el corpus empareja 24.
Las que faltan son `/` y **los 4 sectores + 2 monográficos** — **exactamente la
población donde M-IMG está fichada**. La sonda lo dice en su cabecera, su salida
y su congelada.

## 4 · PASO 4 — image sizes corregidos, y el descubrimiento de que eran inertes

**Dos errores de la lista anterior, los dos por venir de 14 instancias:**

- **`card: {1024, 683}` FORZABA UN RECORTE** que el original nunca produce — el
  `fit` por defecto de Payload es `cover`, y la caja de 1024 emite **10 formas
  distintas**. Corregido a `width: 1024`;
- faltaban **`w300`** y **`w768`**, que el cuerpo sí usa. Migración
  `20260805_011925_image_sizes_censados`, aplicada en limpio.

**Y lo que no se veía:** sin `sharp` en `scripts/seed/cli.mjs`, **nada de eso
generaba un fichero**. Es D4 literal —*el marcador prueba que el build es nuevo,
no que el cambio tenga efecto*—. Cazado **midiendo después**: 85 → **545**
ficheros. El CMS genera ya `alert-cloud-vertical-web-3-480x705.jpg`, el fichero
exacto que la ficha de M-IMG cita como «el que sirve el original».

## 5 · ⛔ LO QUE NO SE HIZO, y por qué

| paso | estado | razón |
|---|---|---|
| **3 · capturar los 1 571 que faltan** | **NO** | el PASO 1 cambia su forma: hay que decidir **fuera de `corpus/`** para no mover los denominadores congelados (309 y 209) |
| **5 · T3b / T4b** | **NO** | T3b liga `wp-caption` a la **relación** de media, y esa relación depende de cómo se modele el ancho pedido (§1). Hacerla antes es cablear |
| **6 · cerrar M-IMG** | **NO, y se dice así** | 70 de 311, y su población propia no es medible. «Se cierra por decreto» es justo lo que el criterio prohíbe |

## 6 · ⛔ EL BLOQUEO QUE HAY QUE MIRAR PRIMERO — el seed está roto

**`npm run cms:seed` NO TERMINA**, y es **pre-existente**: reproducido con las
modificaciones de esta tanda en `git stash`, falla igual en `6795883`.

```
ValidationError · casos · Necesidad · Resultados
  §3.3b: host(s) de iframe fuera de la allowlist firmada — kunakcloud.com
```

La 27.ª firmó la allowlist y `casos.ts` trae `kunakcloud.com`. C-SP6 lo tenía
fichado *«para cuando el grupo C se importe»*, pero **`casos` ya se siembra hoy
desde `src/lib`**. Es la misma clase que esa tanda descubrió en sus 3 sabotajes
sin diana: **se cerró una frontera y no se re-corrió lo que dependía de ella.**

> **Consecuencia: el `round-trip 63/63` del bloque 1 NO se puede reproducir
> hoy.** Sigue siendo cierto de cuando se midió; lo que falta es poder
> re-verificarlo.

**Y NO se arregla metiendo el host en la lista** — el HANDOFF de la 27.ª lo
prohíbe explícitamente. Es firma del propietario. §M-SEED.

## 7 · Pendientes que NO bloquean

| # | pendiente | por qué no bloquea |
|---|---|---|
| 1 | **HOME sin content type** | cubo B: modelarla después es AÑADIR |
| 2 | **`Dockerfile` sin verificar** (dos apps, un compose) | lo cobra F2-4 |
| 3 | **26 celdas ciegas** · comportamiento 0/31 | deuda de medición del CLON |
| 4 | **6 mínimos** de sondas escritos en vez de derivados | ídem |
| 5 | **`Breadcrumb` 28 rutas** (−33.25, de ancho) | `clon-base` no lo ve |
| 6 | **CMS-SP-TIPO** — detector nombrado: el Δ0 de render de F2-3 | punto ciego verificado en cada negativo |
| 7 | **`/kunak-api` `<title>`** — ninguna sonda compara el `<head>` | fichado |
| 8 | **extracción de builder** (casos · faqs · productos) | otra mecánica, su tanda |
| 9 | **M-404** — 23 imágenes 404 | deuda del clon; la sonda se pondrá verde sola |
| 10 | **los 5 «distinto» de `cmp-srcset`** | SIN DIRIMIR: con una captura no se separa «el sitio cambió» de «varía por carga» |

## 8 · Lo que NO hay que hacer al empezar

- **No cerrar M-IMG declarando `imageSizes`.** Está medido que no basta: el
  atributo se compone en el punto de uso (§1). Cerrarla así es el decreto que el
  criterio prohíbe.
- **No leer el verde de `cmp-srcset` como cobertura de las 34 rutas.** Son 24, y
  las 10 que faltan incluyen la población donde M-IMG se fichó.
- **No meter las 6 rutas que faltan dentro de `corpus/`.** Movería los
  denominadores congelados de `media-srcset` (309) y del extractor (209), que
  están citados en actas.
- **No dar de alta `kunakcloud.com` para que el seed pase.** Es §3.3b, y es
  firma. Lo mismo con `player.vimeo.com` y `dailymotion.com`.
- **No declarar `caja150`/`caja300`/`caja600`** sin volver a medir: están a **0
  en cuerpo** y `caja600` recorta. Payload genera toda variante declarada para
  toda subida.
- **No leer el rojo de `cmp-srcset` como un fallo de instrumento.** Su control
  sale con **exit 2 a propósito**: ese rojo ES el hallazgo del criterio.

---

# HANDOFF — F2-2 bloque 2 CERRADO: la captura commiteada, T1–T8 con negativo 9/9, y el saneador firmado

> ⚠ **Tanda 2026-08-04 (27.ª).** PASOS 0–5 del encargo del bloque 2. El escalón
> **no disparó**: la captura no trajo nada que el censo, la whitelist o T1–T8 no
> contemplen (0 etiquetas · 0 hosts nuevos en el corpus del grupo A). **No se
> toca `apps/web`** — cero ficheros, no paga Δ0.

## 0 · Los dos titulares

> **1 · El corpus existe, está CONGELADO y COMMITEADO antes de transformarlo, y
> tiene su número:** `corpus/` = **309 páginas · 100.2 MB de HTML crudo ·
> 4.4 MB de cuerpo · 1 819 URLs de media** (CMS-0b por fin medido), con sha256
> por página y `-text` para que un checkout no cambie los bytes. Y T1–T8 corren
> **OFFLINE** contra esa captura: **209/209 cuerpos · 8/8 postcondiciones ·
> negativo 9/9** (un sabotaje POR transformación) · saneador **6/6** con los
> 209 cuerpos reales de control.
>
> **2 · La clase del PISAR está cerrada POR CONSTRUCCIÓN, y el re-corrido
> destapó lo que llevaba semanas verde en falso:** los 3 sabotajes de `sondeo`
> estaban **SIN DIANA desde la tanda 26.ª** (exit 0 los tres) y nadie lo sabía
> porque nadie re-corrió el negativo tras cerrar las fronteras — la regla 8a en
> su forma silenciosa.

## 1 · PASO 1 — la clase del PISAR, en el sitio común

Derivado (`grep PISAR *.neg.mjs`): **11 usos en 10 ficheros** — 3 controles
pisando la canónica (`sondeo.neg`, `cms-campos.neg`, `cms-slugs.neg`), 4
desviados por disciplina (el comentario copiado), el resto sabotajes con PISAR
superfluo. El arreglo, donde se arreglan las clases:

- **`NEG=<etiqueta>`**: con él puesto, `w()` desvía TODA escritura no marcada a
  `<base>-neg-<etiqueta>` — una corrida negativa **no puede** tocar una canónica;
- **`corridaNegativa()`** en `lib.mjs`, el único camino sancionado: pone NEG y
  **borra `PISAR` y `SALIDA`** del entorno del hijo, aunque quien lanza los
  tenga exportados. `nombreNeg()` deriva el nombre del artefacto — no se
  escribe a mano;
- caso en `qa:lib` (**80/80**): la canónica no se toca **ni con NEG+PISAR
  juntos**; el runner probado EJECUTANDO un hijo real.

**Los 9 negativos migrados y re-corridos enteros:** cms-campos **5/5** ·
cms-teaser **3/3** · cms-arquetipos **4/4** · cms-slugs **4/4** · cms-roundtrip
**6/6** (el ciego `tipo-hoja` sigue sin morder, como debe) · sondeo **4/4** ·
solutions-campos **4/4** — **pagando su pendiente §8.8: ya tiene control de
verdad**, antes tenía un sabotaje *llamado* control · solutions-seo y
clase-rango, al final de la tanda (pegan al original y la captura estaba en
vuelo).

### ⚠ El hallazgo: tres sabotajes SIN DIANA, y no lo causó la migración

La tanda 26.ª cerró las tres fronteras que les daban diana —teaser dato propio
(§2g) eliminó las 31 relaciones con `href` · `seo.title` medido (§2h) eliminó
el grupo ausente · `RUTAS_EN_FRONTERA = []` hizo no-op quitar la poda— y **el
negativo no se re-corrió después**: sus 3/3 eran de otra época del catálogo.

> **Un sabotaje que no cambia el resultado no ha probado la guarda: ha probado
> que el instrumento ya no la ejercita** (regla 8a). Y no da rojo: da exit 0.

Arreglo en dos mitades: `sondeo.mjs` **comprueba su diana por sabotaje** y sale
por `SIN DIANA` nombrado (nunca por verde); `sondeo.neg.mjs` los verifica como
**dianas perdidas** (el patrón del punto ciego de `cms-roundtrip`) y sale ROJO
el día que el corpus del alta las reintroduzca — con la instrucción de
devolverlos a la tabla de los que cazan (sus checks están en git, `65d6cf5`).
Los 3 artefactos viejos ya no reproducen y se retiraron del árbol.

## 2 · PASO 2 — la captura, con su etiqueta

Lista **derivada** de `cms-arquetipos.json` (§2f) + `a-censo` + `c-censo` +
`solutions-campos` — toda colección del instrumento o tiene fuente o declara
su razón de exclusión, y una sin decidir **TIRA** (regla 6). Secuencial, 500 ms,
UNA petición por página **también entre corridas** (lo capturado no se re-pide:
la corrida interrumpida se reanuda sin re-pegar). 309/309 · 0 fallos.

| colección | pág | HTML | cuerpo |
|---|---|---|---|
| entradas-blog | 149 | 48.3 MB | 3.1 MB |
| terminos-kunakpedia | 37 | 12.6 MB | 1.2 MB |
| documentos-cientificos | 23 | 6.5 MB | 0.04 MB — fichas cortas con PDF, 23/23 con `post_content` |
| casos · faqs · productos | 57 · 19 · 24 | 18.4 · 5.2 · 9.2 MB | builder: sin `post_content`, es forma |

Fuera con razón declarada: sectores · monograficos (cuerpo = dato tipado
transcrito) · taxonomia-sectores (término embebido, sin cuerpo).

## 3 · PASOS 3–4 — T1–T8 y el saneador

Orden de contrato: **T8 → T1 → T2 → T3a → T4a → T5 → T6 → T7**, cada una con
`aplica` · `post` (su postcondición, evaluada EN SU ETAPA — la de T8 en el HTML
final sería vacua: T4a se lleva los scripts) · `diana` (regla 8a por
construcción). Aplicadas sobre los 209 cuerpos: T8 ×17 · T1 ×196 · T2 ×446 ·
T3a ×891 · T4a ×17 · T5 ×18 · T6 ×2 · T7 ×**1 785** enlaces internos a ruta
local. Congela `medidas/extractor-corpus.json`.

- **Los 17 scripts de T4a son exactamente los 17 del censo §3.3** — el número
  cruza entre instrumentos. T4b (la sustitución) queda **por documento** en el
  informe: 6 fb3d · 4 flourish · 3 swiper · 2 twitter · 1 instagram · 1 nbc;
- **T3b queda NOMBRADA para el bloque 3** (precedente T4a/T4b): `wp-caption` no
  se descarta hasta que exista la relación de media que absorbe la leyenda —
  descartar el marcador antes sería media transformación;
- **el saneador es UN código** (`validaHtmlCorpus` en `comunes.ts`): whitelist
  de 43 **nombrando la etiqueta** · allowlist firmada **nombrando el host**
  (también vía `data-src`) · `<script>`. El `validate` del alta y el extractor
  importan LA MISMA función (clase C7 evitada). Negativo **6/6**, control = los
  209 cuerpos transformados reales.

## 4 · PASO 0 — la firma, y C-SP6 cerrado de paso

**§3.3b FIRMADA**: allowlist = **los 18 hosts censados**, comparación **por
HOST** (el caso `flo.uri.sh`), **procedimiento de alta** (un host nuevo se añade
a `HOSTS_PERMITIDOS` con su porqué; mientras, rechazo nombrándolo). Alcance
firmado: grupo A; la estricta queda disponible sabiendo que cuesta 21 decisiones.

**C-SP6** (`qa:c-embeds`, offline sobre la captura): 90 iframes · 7 hosts en el
grupo C. Lectura que importa: `googletagmanager.com` **76/76 = cascarón, no
contenido** (regla 4, el pleno — jamás candidato a alta); los reales fuera de la
allowlist son `kunakcloud.com` ×2 · `player.vimeo.com` ×1 · `dailymotion.com`
×1 → **procedimiento de alta cuando el grupo C se importe**. Fichados, no
colados.

## 5 · LO SIGUIENTE — F2-2 bloque 3

**Media al volumen persistente (CMS-0b) + image sizes replicando el `srcset`
del original — que es lo que cierra M-IMG con medida, no por decreto.** Las
1 819 URLs de media del INDICE son la lista de trabajo; el conjunto mínimo de
variantes ya está medido (§CMS-0b: `480 · 980 · 1024×683 · 1080×675 · 1280` +
original). Con el media hecho se cobran **T3b** (wp-caption → relación con
leyenda) y **T4b** (los 5 PDF de FB3D a media); y el alta masiva del corpus
trae **el ciclo del grafo** (dos pasadas) y **re-arma las dianas de `sondeo`**
— su negativo saldrá rojo pidiendo devolver los sabotajes a la tabla de los que
cazan: es la señal esperada, no una regresión.

## 6 · Pendientes que NO bloquean

| # | pendiente | por qué no bloquea |
|---|---|---|
| 1 | **HOME sin content type** | cubo B: modelarla después es AÑADIR |
| 2 | **`Dockerfile` sin verificar** (dos apps, un compose) | lo cobra F2-4 |
| 3 | **26 celdas ciegas** · comportamiento 0/31 | deuda de medición del CLON |
| 4 | **6 mínimos** de sondas escritos en vez de derivados | ídem |
| 5 | **`Breadcrumb` 28 rutas** (−33.25, de ancho) | `clon-base` no lo ve |
| 6 | **CMS-SP-TIPO** — con su detector NOMBRADO: **el Δ0 de render de F2-3** (o contrastar features del editor contra `ETIQUETAS_CENSADAS`) | punto ciego verificado en cada corrida del negativo |
| 7 | **`/kunak-api` `<title>`** — ninguna sonda compara el `<head>` | fichado en PENDIENTES-QA |
| 8 | **extracción de builder** (casos · faqs · productos: 24 fichas del CPT) | el corpus está capturado; la mecánica es otra y tiene su tanda |

## 7 · Lo que NO hay que hacer al empezar

- **No re-pegar al sitio vivo para re-correr una transformación.** La captura
  es la línea base; T1–T8 son re-ejecutables OFFLINE. Re-capturar una página ya
  capturada exige borrar su fichero a propósito — y eso es tocar la línea base.
- **No leer el `-neg-` de una congelada como medida del sitio** (regla 7); y
  desde esta tanda, **no lanzar una sonda desde un `.neg.mjs` sino por
  `corridaNegativa`** — es lo que hace imposible pisar una canónica.
- **No leer el rojo futuro de `cms:sondeo-neg` como regresión** cuando el
  corpus entre: es la diana volviendo (§1). La instrucción está en su salida.
- **No dar de alta `kunakcloud.com`/`vimeo`/`dailymotion` sin pasar por el
  procedimiento de §3.3b** — y no dar de alta `googletagmanager.com` nunca:
  es cascarón.
- **No commitear `corpus/transformado/`** — se deriva; está en `.gitignore`.

---

# HANDOFF — F2-2 bloque 1 CERRADO: 63/63 y el negativo entero, con un punto ciego declarado

> ⚠ **Tanda 2026-08-04 (26.ª).** Reentrada sobre un commit declarado SIN
> VERIFICAR (`5a6e1fb`). **El escalón NO se disparó**: sus tres condiciones se
> comprobaron una a una y las tres fronteras eran **ejecución**, no frontera.
> **No se toca `apps/web`** — y la deuda Δ0 que la tanda anterior dejó abierta
> **queda PAGADA**: 31/31 · 0 regresiones a 1440 y a 390.

## 0 · Los dos titulares

> **1 · El criterio de «hecho» del §F2-2 está cumplido, literal.** `round-trip
> 63/63 documentos IDÉNTICOS` sobre las **46 filas** de 9 colecciones + 4
> taxonomías derivadas, DB migrada desde cero con **4 migraciones versionadas** y
> `push: false`. Se entró con **157 diferencias**.
>
> **2 · Y el verde vale porque su negativo pasa: `6/6`** — 4 sabotajes que caza
> **+ 1 PUNTO CIEGO declarado y verificado + control**. El punto ciego es el
> resultado más caro de la tanda (§3.3).

## 1 · PASO 0 — lo que había en `5a6e1fb`, derivado del diff y no de su mensaje

| estado | qué | evidencia |
|---|---|---|
| ✅ **HECHO** | el árbol es coherente | `npm run check` exit 0 · `qa:lib` 69/69 |
| ✅ | las migraciones aplican en limpio sobre vacío | `cms:reset`: inicial · registro_slugs · teaser_dato_propio, sin error |
| ✅ | **TEASER conectado de punta a punta**, no sólo escrito | campos en `comunes.ts` + migración aplicada + `RUTAS_EN_FRONTERA = []` + sondeo con **0 relaciones sin destino** (eran 31) |
| ✅ | **`productos.seo.title` medido y en el dato** | sondeo: **0 required sin dato · 0 required vacíos** |
| ⚠ **A MEDIAS** | **las 3 sondas nuevas no tenían script npm** | el mensaje del commit las cita como `qa:solutions-seo` · `qa:cms-teaser` · `qa:cms-arquetipos` y **ninguno existía en `package.json`** |
| ⚠ | **ninguna de las 3 tenía negativo** | y `qa:cms-roundtrip-neg` **apuntaba a un fichero que NUNCA existió** (`git log --all` vacío) |
| ⚠ | el round-trip **no pasaba** | reproducido exacto: **40/63, 157 diferencias** |
| ⚠ | `apps/web` tocado **sin Δ0 pagado** | `git diff bcc2b83 HEAD -- apps/web` = `products.ts` +80 · `types/kunak.ts` +19 |
| ⚠ | `ALIAS`/`IGNORADOS` de `mapeo.mjs` **exportados y sin un solo importador**, y el `aliasCoherentes()` que su comentario prometía **no existía** | `grep -rn "ALIAS" scripts/` |
| ⛔ **SIN EMPEZAR** | PASO 3 en los docs · T4 en el PLAN · el acta del teaser y del `seo` en el ESQUEMA | los tres vivían **sólo en comentarios de código** |

**Un fichero escrito no es un paso hecho, y aquí tomó la forma de
`package.json`:** tres sondas citadas por un nombre de script que no existe, y un
negativo declarado apuntando al vacío. **La regla 3 en los dos sitios que nadie
ejecuta** — el `package.json` y un comentario.

## 2 · Las 157 diferencias, en 7 clases — y ninguna se normalizó

| n | clase | qué era | resolución |
|---|---|---|---|
| **72** | `soluciones[]` embebido con `id`/`name`/`href` contra `slug`/`titulo` | **`PREPARA` tenía ida y no vuelta** | `DEVUELVE` + `sonInversas()`, que lo **ejecuta** sobre el catálogo antes de comparar nada |
| **16** | celdas de tabla → `{}` | **el escalar de una unión aplanada se PERDÍA al entrar** | `aPayload` **tira** en vez de escribir `{}`; `custom.escalarA` declara el destino |
| **15** | `[]` contra clave ausente | Payload **no puede** distinguir «lista vacía» de «campo ausente» | la vuelta omite; derivado: **0 arrays vacíos explícitos en las 46 filas**, y el comparador se auto-vigila si eso cambia |
| **7** | `kind` inventado | `CON_KIND` era un `Set` de **slugs**, y `claim`/`titular` nombran **dos bloques distintos** (módulo y bloque de texto) | la llave pasa a ser **(ruta, slug)**, como `formaDeRel` |
| **6** | `paginaSlug` vs `pagina` | ídem 72 | `DEVUELVE` |
| **4** | `entradas-blog.cuerpo` | **T4a**, transformación declarada | se aplica a los dos lados **con su control de simetría** |
| **1** | `nivel` ausente | **el defecto estaba MAL ELEGIDO** (§3.1) | migración versionada |

## 3 · Los tres hallazgos, y los tres son de la familia CMS-SP-TIPO

**Ninguna guarda mira nada de la hoja salvo su ruta.** `payload-types` compila y
`qa:cms-campos` pasa en los tres casos.

### 3.1 · El `nivel` compartido — cambiaba la ETIQUETA servida

`MonoCuerpo.tsx` lee el claim con `?? 2` y el titular con **`?? 3`**. El esquema
les daba **un solo** `conDefecto(nivel, 2)`, así que el hook —*coincidir con el
defecto = no haber escrito*— **omitía el `nivel: 2` explícito de un titular**, y
al leerlo de vuelta el render caía en su `?? 3`: el `<h2>Proyectos por todo el
mundo</h2>` de EDAR salía **`<h3>`**. Una etiqueta distinta en el esqueleto del
DOM, que es lo que `tree-cmp` compara.

Migración `20260804_182349_nivel_titular_por_defecto_3` (6 columnas). **Y
arrastra el `claim DROP NOT NULL`** que la tanda anterior cambió en la config y
**nunca emitió como migración**: con `push: false`, una DB migrada desde cero y la
config **discrepaban**. Va declarado en la cabecera de la migración, no colado.

### 3.2 · Las 16 celdas que entraban en blanco

`MonoCelda = string | {fuerte, resto?}` es una unión aplanada en 3 campos. Con 3
campos propios el envoltorio transparente no aplica, así que `aPayload` recorría
los tres **sobre una cadena**, sacaba `undefined` de los tres y escribía `{}`:
**16 celdas de la tabla de EDAR en la DB en blanco, sin un solo error.** Ahora un
escalar donde el esquema espera objeto **tira** (regla 6), y `custom.escalarA`
—declarado **en el campo**, no en una tabla de rutas— dice a dónde va.

### 3.3 · ⚠ EL PUNTO CIEGO, que es el resultado que más vale

`cms-roundtrip.mjs` nació diciendo *«la única sonda que mira el TIPO de la
hoja»*. Se comprobó con un sabotaje en vez de con un argumento:

> **`tipo-hoja`** cambia `productos.bullets[].texto` de `htmlLinea` a
> `editorNegrita` —**CMS-SP-TIPO literal**, el defecto del `R<sup>2</sup> >0,8`—
> y la sonda sale **63/63, exit 0**.

**Y no es un fallo del comparador: la pérdida ocurre al RENDERIZAR.**
`inlineALexical` mete la cadena en un nodo de texto y `lexicalAInline` la
devuelve idéntica — **la ida y la vuelta son inversas perfectas sobre un editor
que aun así pinta la fórmula como texto plano**. Lo que sí mira de la hoja es su
**DEFECTO** y su **FORMA** (3.1 y 3.2); el **EDITOR**, no.

**CMS-SP-TIPO sigue ABIERTA**, ahora con la razón medida (ESQUEMA §7b) y
**declarada como punto ciego VERIFICADO**: el sabotaje se corre en cada negativo
y se exige que **siga sin morder**. El día que muerda, el negativo sale **ROJO** y
obliga a venir a leer por qué. *Un punto ciego documentado y no verificado
envejece solo; uno verificado avisa cuando deja de serlo.*

## 4 · Lo que se construyó

```
scripts/qa/cms-roundtrip.neg.mjs     ← NUEVO — 4 sabotajes + 1 ciego + control
scripts/qa/cms-teaser.neg.mjs        ← NUEVO — el falsador, falsado
scripts/qa/cms-arquetipos.neg.mjs    ← NUEVO — par de DISCRIMINACIÓN, no guarda
scripts/qa/solutions-seo.neg.mjs     ← NUEVO — selector muerto · derivable · 0 URLs
scripts/seed/seed.mjs                ← DEVUELVE · rutaLocal · comoEmbebido · sonInversas
scripts/seed/mapeo.mjs               ← escalarA · exigeObjeto · lista vacía · kind por ruta
packages/cms-config/src/migrations/20260804_182349_nivel_titular_por_defecto_3
+ los 6 scripts npm que faltaban
```

| negativo | resultado |
|---|---|
| `qa:cms-roundtrip-neg` | **6/6** (4 que caza · 1 ciego · control) |
| `qa:cms-teaser-neg` | **3/3** |
| `qa:cms-arquetipos-neg` | **4/4** |
| `qa:solutions-seo-neg` | **4/4** |
| `qa:lib` | **69/69** · las **66** sondas compilan y declaran su mínimo |

**Y `cms-teaser` tenía un mínimo de `1` escrito a mano.** Ahora se **deriva**:
**34 teasers del catálogo**. La unidad correcta es el teaser recorrido —que
existe en el dato antes de medir— y no el par comparable, **que es el
resultado**: un mínimo puesto sobre el resultado no puede detectar que el
instrumento no miró.

### El negativo que hace honesta una decisión, y no sólo verde

El sabotaje `derivable` de `cms-teaser` **le da a `date` el formateador de meses
en español que la decisión dice que no se puede escribir**, y el veredicto
voltea a FALSADA. O sea que derivar el teaser **sí es técnicamente posible**; no
se hace porque re-formatear **normaliza en silencio las erratas del original** y
el contrato de fidelidad lo prohíbe. **Es una decisión de contrato, no una
limitación técnica** — y venderla como limitación habría sido más cómodo.

## 5 · Tres defectos de instrumento, míos, y uno automatizaba la regla 5

| # | qué | cómo se cazó |
|---|---|---|
| 1 | **el CONTROL de cada negativo iba con `PISAR` sobre la medida canónica** — un test en negativo re-congelando la evidencia buena, o sea **la regla 5 automatizada y puesta en los cuatro** | el round-trip canónico apareció re-congelado a 63/63 sin que nadie lo pidiera. Arreglado con `SALIDA` → `*-neg-control.json` |
| 2 | **`clon-base` metía el PUERTO EFÍMERO en `meta.base`**, así que la de-duplicación de `w()` —*«idéntica se reescribe, no se pierde nada»*— **no podía dispararse jamás**: cada corrida estrenaba fichero. De ahí los **48** `clon-base-*` de `medidas/` | dos salidas de la misma corrida salieron «distintas» y sus `paginas` eran idénticas |
| 3 | **`cms-arquetipos` citaba una congelada de OTRO modelo**: tras cerrar la frontera del teaser, `sondeo-frontera.json` seguía diciendo **31 colgantes** y el sondeo real daba **0** | guarda nueva (el conjunto de colecciones tiene que coincidir) + la fecha del fichero **se imprime** al citarlo |

⚠ **Y un desliz mío que hay que decir:** borré a mano dos congeladas de
`clon-base` **afirmando que eran idénticas cuando la comprobación decía que no**.
No se perdió nada —la diferencia era el puerto de `meta.base`, y sus `paginas`
coinciden con la base aceptada, **0 de 31**— pero el orden correcto era mirar
**antes de borrar**. Es la §regla 5 rozada por tercera vez en el proyecto, y las
tres por la misma prisa.

## 6 · Δ0 de `apps/web` — la deuda de la tanda anterior, PAGADA

| corrida | resultado |
|---|---|
| `clon-base` @1440 vs `clon-base-1440-2026-08-03.json` | **31 comparadas · 0 con regresión** |
| `clon-base` @390 vs `clon-base-390-2026-08-03.json` | **31 comparadas · 0 con regresión** |

⚠ **Y la trampa que costó una corrida entera**: la primera comparación se hizo
contra `clon-base-*-cms0d-despues.json` y dio **10 de 11 con regresión**. No era
una regresión: ese fichero tiene **11 rutas** y es **anterior a C-QA1/C-QA7**, así
que los `+48`, `+36.02` y `+19.2` que marcaba son **los arreglos deliberados de
aquellas tandas**.

> **La línea base de una comparación tiene que ser la última ACEPTADA, no la que
> tenga el nombre más parecido** — y el nombre no lo dice. Aquí lo dijo el
> recuento: **11 rutas contra 31**. Un comparador que encuentra defecto en el
> 91 % de lo que mira está, casi siempre, comparando dos cosas que no son la
> misma (regla 4, la cara del pleno).

## 7 · LO SIGUIENTE — F2-2 bloque 2 · extractor + saneador

**Entrega:** el extractor del corpus para las 209 páginas del grupo A con
**T1–T8** aplicadas al importar, y el saneador con la whitelist censada (43
etiquetas **a ADMITIR**, no a filtrar; la única prohibición es `<script>`, ya
puesta como `validate`).

> **El listón es el de esta tanda: test en negativo POR TRANSFORMACIÓN.** Un
> sabotaje por cada una de T1–T8, cada uno cayendo por SU invariante, **más el
> control**. Y cada arreglo re-corre el test entero.

Lo que ya está medido y no hay que redescubrir:

- **T4b** necesita el PDF y la URL de la noticia — **5 scripts en 4 entradas**,
  con su clasificación §3.3 congelada. Hasta que se haga, ese contenido **no está
  en el CMS**, y el seed lo imprime documento a documento;
- **T8 es NO-OP sobre el catálogo actual** (5 tokens dentro de `<script>`, 0
  fuera) **y sigue haciendo falta** en el importador, que compara contra el HTML
  crudo **antes** de transformar;
- **el ciclo del grafo vuelve**: `taxonomia-sectores → sectores → casos →
  taxonomia-sectores`, en cuanto entren los 57 casos y las 149 entradas ⇒
  **sembrar en dos pasadas**;
- **`productos.cuerpo` está vacío en las 9 y es correcto** (ESQUEMA §2f):
  `products.ts` es la proyección de pestaña. Las **24 fichas** del CPT entran
  aquí.

## 8 · Pendientes que NO bloquean

| # | pendiente | por qué no bloquea |
|---|---|---|
| 1 | **la HOME sigue sin content type** | cubo B: modelarla después es AÑADIR, no re-migrar |
| 2 | **`Dockerfile` sin verificar**, y ahora sin cubrir `apps/cms` | el contrato de F2-1 es el Δ0 del HTML servido; lo cobra F2-4 |
| 3 | **26 celdas ciegas** de `COBERTURA-MEDICION.md`, comportamiento **0/31** | deuda de medición del CLON |
| 4 | **6 mínimos** de sondas escritos en vez de derivados — **uno menos**: `cms-teaser` ya lo deriva | ídem |
| 5 | **`Breadcrumb` de 28 rutas**, −33.25 | ídem, y es de ancho: `clon-base` no lo ve |
| 6 | **CMS-SP-TIPO** | §3.3: abierta, con su razón medida y su punto ciego verificado |
| 7 | **`/kunak-api` sirve un `<title>` que no es el del original** | nuevo, fichado en `PENDIENTES-QA.md`. No lo veía nadie: **ninguna sonda compara el `<head>`** |
| 8 | **`solutions-campos.neg.mjs` no tiene control** — tiene un sabotaje *llamado* `control`, que es otra cosa | preexistente; lo paga quien lo toque |

## 9 · Lo que NO hay que hacer al empezar

- **No leer el 63/63 sin su alcance.** Son **46 filas de 9 colecciones**, con
  `productos.cuerpo` vacío y `articulos-kb` fuera. El alcance viaja en
  `SEMBRADAS` y `FUERA_DE_BLOQUE_1`, y la sonda lo imprime al final.
- **No dar CMS-SP-TIPO por cerrada porque el round-trip esté verde.** Está
  **medido** que no la ve (§3.3).
- **No comparar contra `clon-base-*-cms0d-*`.** Es de 11 rutas y anterior a
  C-QA1/C-QA7 (§6). La base aceptada es `clon-base-{1440,390}-2026-08-03.json`.
- **No normalizar una diferencia del round-trip.** Las tres prohibidas siguen
  prohibidas —`?? ""` en `seo.title`, omitir el teaser del comparador, relajar el
  `validate`— y se les suma la cuarta que esta tanda pudo haber tomado:
  **arreglar el `nivel` en el proyector en vez de en el esquema**. Se arregló con
  **migración**.
- **No re-congelar una medida canónica desde un test en negativo.** Es el defecto
  1 del §5, y estaba puesto en los cuatro.

---

# HANDOFF — F2-2 bloque 1: PARADO POR EL ESCALÓN, con tres fronteras medidas

> ⚠ **Tanda 2026-08-04 (25.ª).** El escalón declarado disparó **tres veces** en
> el PASO 1. **No toca `apps/web`.** El bloque 1 **no cierra**, y la razón es un
> hallazgo, no una falta de trabajo.

## 0 · El titular

> **La premisa del §F2-2 —*«`src/lib/*.ts` son los datos»*— es FALSA para la
> mitad de las colecciones.** Lo son para los arquetipos que el clon
> **construyó**; para los que sólo **referenció** son proyecciones incompletas.
> Nadie había escrito cuáles son cuáles, y eso decide si una colección se puede
> sembrar.

**Sembrado y corriendo: 12 documentos en 4 colecciones**, con subida de media,
sobre DB migrada desde cero. **Parado: 5 colecciones**, cada una con su
medición.

## 1 · Las tres fronteras — `scripts/seed/sondeo.mjs`

| # | colección | qué falta | evidencia |
|---|---|---|---|
| **1** | `sectores` · `monograficos` | **31 relaciones de teaser sin documento** (20+11), 28 slugs distintos | el clon transcribió 4 casos de 57 y 7 entradas de 149 |
| **2** | `productos` | **`seo.title` `required` y sin medir en NINGÚN sitio** (9/9) | ni `src/lib/products.ts` (proyección de pestaña) ni `medidas/solutions-campos.json` |
| **3** | `entradas-blog` | **4 de 7 cuerpos traen `<script>`** | NBC ×1 · FB3D ×2 · Instagram ×1. El `validate` de T4 los rechaza |

Arrastradas por relación: `casos` (→`productos`) y `taxonomia-sectores`
(→`sectores`).

**La 3 es la conceptualmente grave:** el PLAN puso los seeds en el bloque 1 y
T1–T8 en el bloque 2, y **los seeds necesitan T4**. El orden del PLAN está mal,
y ahora está medido.

## 2 · Lo que la tanda de DECISIÓN tiene que resolver

1. **El `date` del teaser** — `"Ene 7, 2025"` contra `"7 enero 2025"`. Dos
   renderizaciones de la misma fecha, con el campo declarado *verbatim* a
   propósito. Proyectar una de la otra exige un formateador de meses **o** dejar
   de guardar la fecha verbatim: **decisión de modelo, no transformación**.
2. **`productos.seo`** — ¿`required` de verdad? Si sí, **hay que medirlo**; hoy
   no existe en ninguna congelada. Si no, el esquema lo afirma sin respaldo.
3. **Dónde va T4** — o sube al bloque 1, o `entradas-blog` no tiene bloque 1 y
   el PLAN lo dice.

## 3 · Lo construido, y su estado real

| pieza | estado |
|---|---|
| `scripts/seed/catalogos.mjs` — carga los `src/lib/*.ts` **como módulo** (esbuild + alias `@/`) | ✅ corriendo |
| `scripts/seed/mapeo.mjs` — walker **bidireccional** dirigido por la config resuelta | ✅ la IDA · ⚠ **la VUELTA escrita y NUNCA CORRIDA** |
| `scripts/seed/seed.mjs` · `cli.mjs` · `reset.mjs` | ✅ la guarda de DB vacía **disparó** |
| `scripts/seed/sondeo.mjs` — la sonda de frontera | ✅ produjo las 3 mediciones |
| `npm run cms:reset` · `cms:seed` | ✅ |

> ⚠ **`aMedido` (el proyector) está SIN EJERCITAR y lleva la etiqueta encima.**
> El PASO 2 no llegó a correr. **No se puede citar como que funciona** — la tanda
> que lo estrene lo prueba en negativo antes de creerle nada, empezando por el
> invariante del defecto omitido.

## 4 · ⚠ Tres defectos de instrumento, MÍOS, cazados en esta tanda

Los tres daban **números plausibles**, que es lo único que los hace peligrosos:

| defecto | reportaba | cómo se cazó |
|---|---|---|
| `esSlug` no leía el `href` de un teaser | «34 huérfanas, **1 slug distinto**» | **1 slug para 34 referencias es imposible** |
| el sondeo no entraba en un **grupo ausente** | «campos required sin dato: **(ninguno)**» | el seed caía por `productos.seo.title` en la misma corrida |
| `CATALOGOS` daba por acíclico un grafo **con ciclo** | `RELACIÓN SIN DESTINO` con pinta de orden mal puesto | reconstruirlo a mano: no había orden posible |

**El ciclo vuelve en el bloque 2** (`taxonomia-sectores → sectores → casos →
taxonomia-sectores`), cuando entren los 57 casos y las 149 entradas: hará falta
**sembrar en dos pasadas**. Escrito en `catalogos.mjs`.

## 5 · Lo que NO se hizo, y es deliberado

**No se normalizó nada para que las diferencias desaparecieran.** Ni un `?? ""`
en `seo.title`, ni omitir el teaser del comparador, ni relajar el `validate`.
Cualquiera de las tres habría dado un bloque 1 **verde** — y habría falsificado
el instrumento justo donde el §F2-2 avisa.

## 6 · PASO 0, que sí quedó cerrado

- **Incógnitas reconciliadas con §3.1d**: el recuento de CMS-0e se **aplaza** (no
  hay conversión que auditar); §3.4 se **disuelve como bloqueo**; el tamaño del
  corpus sigue viva (bloque 3); la allowlist sigue viva (política).
- **Allowlist de hosts PROPUESTA y derivada** del censo 209/209: **83 iframes ·
  18 hosts**, en 4 tramos, con las 3 formas posibles y lo que cuesta cada una.
  **Falta firma del propietario.** Y el censo mata la «lista cerrada de 5»: sólo
  **2** aparecen como iframe, y **`flourish` no casa por nombre** (su host es
  `flo.uri.sh`) ⇒ **se compara por HOST, nunca por proveedor**.
- **El suelo de 390 publicado con su FORMA** y con su alcance **por ruta**:
  `software` y EDAR bimodales Δ30 (**forma establecida**); **petróleo con un solo
  estado observado ⇒ NO establecida**, y ahí sólo Δ≈0 está respaldado.

## 7 · Pendientes de siempre

HOME sin content type (cubo B) · `Dockerfile` sin verificar · 26 celdas ciegas
(comportamiento 0/31) · 6 mínimos · `Breadcrumb` de 28 rutas · **CMS-SP-TIPO**
(ninguna guarda mira el tipo de la hoja).

## 8 · Lo que NO hay que hacer al empezar

- **No sembrar `productos`/`sectores`/`entradas-blog` «rellenando» lo que falta.**
  Las tres fronteras son decisiones, y rellenarlas es inventar dato medido.
- **No fiarse de `aMedido`.** Está sin correr.
- **No dar el bloque 1 por cerrado con las 4 colecciones sembradas.** Son 12
  documentos de 46; el alcance viaja en `SEMBRADAS` y en `FUERA_DE_BLOQUE_1`.

---

# HANDOFF — F2-1 CERRADA: el esquema queda congelado, versionado y con su guarda

> ⚠ **Tanda 2026-08-04 (24.ª).** Cinco pasos + la ráfaga 3 de `cqa6-390`. Cierra
> **F2-1**. **No toca `apps/web`**: `git diff c9f7eec HEAD -- apps/web` está
> **vacío**, cero ficheros, así que —como el bloque 2— **no paga corrida Δ0**.
> La restricción de CMS-0f se cumple por no haber cruzado la frontera.

## 0 · Los dos titulares

> **1 · F2-1 está HECHA**, contra su criterio literal y con evidencia por punto:
> tipos que compilan · colecciones verificadas (`qa:cms-campos` 10/10, negativo
> 5/5) · migración inicial **en limpio sobre Postgres vacío con `push: false`**
> (106 tablas, batch 1) · **la guarda de colisión probada en negativo por las dos
> mitades**, la del build y la del alta.
>
> **2 · El −30 de EDAR@390 nunca fue un defecto del clon.** La campaña
> `cqa6-390` cerró (3 ráfagas · 2 días) y el archivo dio la respuesta que la
> campaña no podía dar: **a 390 el original es BIMODAL con Δ = 30 exactos**, con
> fichero congelado y commiteado de los dos estados en dos rutas. El clon no se
> movió nunca.

## 1 · Lo que se construyó, en un vistazo

```
packages/cms-config/src/
  campos/comunes.ts        ← campoHtml · htmlLinea · ETIQUETAS_CENSADAS (43)
  colecciones/slugs.ts     ← el registro del plano de /es/, unique: true
  hooks/registro-slug.ts   ← reclama y suelta, pasando `req` (misma transacción)
  migrations/              ← 2 migraciones versionadas, aplicadas en limpio
scripts/qa/cms-slugs.mjs (+ .neg.mjs)   ← la guarda de ENTRADA y su negativo
```

## 2 · PASO 1 · §3.1d — el corpus entra como HTML, no como Lexical

**No se decidió nada: se APLICÓ CMS-0e**, que estaba vigente desde el
2026-07-30 y a la que el bloque 2 se le había desviado. Se hizo aquí y no en
F2-2 porque **el punto de congelación no es la primera entrada importada, es la
primera MIGRACIÓN** — es la que escribe las columnas.

**El discriminador no fue criterio mío: fue el tipo medido**, y estaba escrito en
`types/kunak.ts` desde antes de traducir.

| tipo medido | destino |
|---|---|
| `CampoRico = string` · `CampoRicoEnLinea = string` | **HTML crudo** (11 campos) |
| `MonoInline = string \| MonoTrozo[]` | **sigue Lexical** — dato tipado del clon, no corpus |

**Las dos formas que §3.1d dejaba abiertas caen enteras.** Las dos daban por
hecho que el destino final es Lexical y el HTML un tránsito. No lo es: el tipo
medido **ya es `string`**, así que el campo definitivo y el sitio de aterrizaje
son el mismo objeto — ni dos fuentes de verdad, ni entradas que no existen hasta
convertirse.

Acta campo a campo (los 12), contrato y evidencia: `ESQUEMA-CMS.md` **§3.1d**.

## 3 · Los cuatro hallazgos, y ninguno daba error

| # | qué | dónde |
|---|---|---|
| 1 | **`productos.bullets[].texto` no podía expresar `<sup>`.** Estaba en `editorNegrita` (Párrafo + Negrita) y el corpus trae `R<sup>2</sup> >0,8`. Pasaban `payload-types` **y** `qa:cms-campos` — **ninguno mira el TIPO de la hoja, sólo su ruta** | ficha **CMS-SP-TIPO**, §7 del ESQUEMA |
| 2 | **El primer negativo de `push: false` no medía nada.** `migrate:status` no dispara el push, así que daba 0 con `push:true` **y** con `push:false`. Lo cazó el control | §5 |
| 3 | `migrate:create` emite `MigrateUpArgs`/`MigrateDownArgs` como **import de valor** y el paquete usa `verbatimModuleSyntax`. **Hay que rehacerlo en CADA migración nueva**; lo caza el typecheck de `check` | nota en las 2 migraciones |
| 4 | El HTML crudo aterriza en **`varchar` SIN longitud** — verificado **insertando los 69 784 caracteres** del máximo medido y leyéndolos de vuelta, no leyendo el catálogo | PASO 2 |

## 4 · La guarda de slug: DOS mitades, las dos probadas

§4 dice que son **complementarias, no alternativas**, y ven cosas distintas:

| | qué ve | qué NO puede ver | negativo |
|---|---|---|---|
| `qa:slugs` (**build**) | sombras y huérfanas, contra el `prerender-manifest` | un alta rechazada — no llega al build | `SABOTAJE=accesorios` → **exit 1**; limpio → **exit 0** |
| `qa:cms-slugs` (**alta**) | el rechazo, contra la DB real | que una ruta estática sombree un slug del catálogo | **4/4**, cada sabotaje por su invariante; control **5/5** |

**El alcance de los dos es EL MISMO, y eso es requisito, no coincidencia:** sólo
el plano de un segmento de `/es/` — `entradas-blog`, `terminos-kunakpedia` y
`productos` **sin `padre`** (6 de 24, §2e). Dos definiciones distintas de «lo
mismo» son la clase C7 de este repo, y aquí darían un hook que rechaza altas que
el build considera legítimas. **Si una familia baja al plano, se añade en LOS DOS
sitios.**

`qa:cms-slugs` **no entra en `npm run check`**: necesita Postgres, y meterle una
dependencia de servicio convertiría «la DB está apagada» en «el código está mal».

## 5 · ⚠ LA LECCIÓN: un negativo sin control no es un negativo

La regla del cero, cobrada **dentro de la verificación de una guarda**:

| | `push` | arranque | columna en la DB |
|---|---|---|---|
| intento fallido | `true` **y** `false` | `migrate:status` | **0 en los dos** — no medía nada |
| control | `true` | `getPayload()` real | **1** — aparece |
| negativo | `false` | `getPayload()` real | **0** — la guarda para |

> **El control no es la mitad opcional del negativo: es la que decide si el
> negativo significa algo.** Sin él, ese 0 se lee como «la guarda funciona».

## 6 · La campaña `cqa6-390`, y la lección que vale más que el número

Cerró: **3 ráfagas · 2 días · ≥2 h**, `h1` **0 en las 6 combinaciones**. Pero el
criterio pre-registrado **no se aplicó, porque su premisa era falsa**: decía *«un
±30 observado una vez, SIN FICHERO»*, y hay **dos**, congelados y commiteados, de
otra sonda:

| ruta @390 | estado A | estado B | Δ |
|---|---|---|---|
| `/software…` | 308.58 | **338.58** | **30.00** |
| `…-en-edar` | 189.39 | **219.39** | **30.00** |

El clon vale **189.39 en las dos corridas**. Lo único que cambia es el original.

> **El −30 sale de SIN PROBAR y NO entra en defecto**: es el original en su
> segundo estado. Un **+30** futuro en EDAR@390 **no es regresión**, es el otro
> pico; **cualquier otro valor sí lo es**, incluidos los menores de 30 — un suelo
> bimodal DISCRIMINA, no acota.

**La lección, que es de método y le faltaba a la regla 7:**

> **Toda medida congelada de un PAR contiene una muestra del original.** El suelo
> de ruido **no vive sólo en los ficheros de la campaña de ruido**: vive en las
> 324 congeladas, y preguntarles es un `grep` sobre git. Nadie lo hizo — ni al
> declarar el −30 SIN PROBAR, ni al escribir el pre-registro que afirmaba «sin
> fichero». **Un pre-registro protege de decidir por cansancio; no protege de
> partir de una premisa falsa**, y ahí llega blindada contra la revisión.

## 7 · LO SIGUIENTE: F2-2 · Datos

**Entrega** (`PLAN-FASE-2.md` §F2-2, actualizado hoy):

1. **Seeds mecánicos por Local API** — `src/lib/*.ts` **son** los datos (§8).
2. **Extractor del corpus** con las transformaciones **T1–T8** del §3.2.
3. **Saneador** con la whitelist censada (§3.1 · §3.3b).
4. **Media al volumen persistente** (CMS-0b) con los *image sizes* que **cierran
   M-IMG**.

> ⚠ **Y tres cosas que §3.1d le cambia a F2-2, escritas para que no se
> redescubran:**
>
> - **eran T1–T8, no T1–T6.** El «T1–T6» del PLAN era **el residuo exacto** del
>   episodio de `CLAUDE.md` §sondas regla 3: una tanda «corrigió» T1–T7 → T1–T6
>   comprobándolo contra un registro donde T7 aún no estaba escrito. El registro
>   se arregló entonces; **la cita se quedó arrastrando la corrección
>   equivocada** hasta hoy. Corregido en el PLAN;
> - **el saneador cambia de forma**: con el corpus fuera del editor, la whitelist
>   es **lo que hay que ADMITIR** (43 etiquetas), no un filtro que imponer. La
>   única prohibición es `<script>`, y **ya está puesta** como `validate`;
> - **T4 va ANTES del alta.** Las 15 páginas con script **fallan al importar** si
>   no se aplica primero. Es deliberado (regla 6), pero hay que saberlo o se lee
>   como defecto del esquema.

## 8 · Pendientes que NO bloquean F2-2

| # | pendiente | por qué no bloquea |
|---|---|---|
| 1 | **La HOME sigue sin content type** — el único arquetipo genuinamente sin él | es el **cubo B**: modelarla después es **AÑADIR**, no re-migrar (§2e, y `qa:cms-campos` lo declara fuera de alcance con esa razón) |
| 2 | **El `Dockerfile` sin verificar** — se reapuntó a `apps/web` en el bloque 1 y **no se construyó la imagen** | el contrato de aceptación de F2-1 es el Δ0 del HTML servido por `next start`, no el despliegue. Lo cobra F2-4 |
| 3 | **Las 26 celdas ciegas** de `docs/research/COBERTURA-MEDICION.md`, con **comportamiento a 0/31** | es deuda de medición del CLON, no del CMS |
| 4 | **Los 6 mínimos** de sondas todavía flojos | ídem |
| 5 | **El `Breadcrumb` de 28 rutas** | ídem — y es de ancho, así que `clon-base` no lo ve (§la guarda también tiene un nivel) |
| 6 | **CMS-SP-TIPO** (nueva hoy): ninguna guarda mira el **tipo** de la hoja, sólo su nombre | es deuda de **instrumento**; la paga la tanda que escriba la sonda |
| 7 | **§3.4** (tabla: nodo o block) y **§3.3b** (allowlist de hosts) | ya **no bloquean**: §3.1d sacó el corpus del editor |

## 9 · Lo que NO hay que hacer al empezar

- **No volver a poner el corpus en `richText`.** Es CMS-0e, decidida el
  2026-07-30 y aplicada el 2026-08-04, y el tipo medido es `string`.
- **No hacer condicional el `push: false`.** Cumpliría la letra del PLAN y
  rompería el motivo: con `push` vivo en desarrollo, `migrate:create` diffea
  contra una DB derivada y la migración describe «de mi DB torcida a la config».
- **No leer el `+30` de EDAR@390 como regresión.** Es el otro estado del
  original (§6).
- **No dar por buena una guarda con negativo y sin control.** Es la lección de
  esta tanda y se pagó dentro de la propia verificación (§5).
- **No añadir familias al registro de slugs sin añadirlas también a `FAMILIAS`
  de `scripts/qa/slugs.mjs`.** Los dos alcances tienen que ser el mismo.

---

# HANDOFF — F2-1 bloque 2: Payload andando, 16 colecciones, y una comprobación que las audita

> ⚠ **Tanda 2026-08-03 (23.ª).** Seis pasos. Instala Payload y traduce el modelo.
> **NO siembra datos** (F2-2) **ni versiona migraciones** (bloque 3). Y **no toca
> `apps/web`** — por eso no paga corrida Δ0: la restricción de CMS-0f se cumple
> por no haber cruzado la frontera, no por cruzarla y medirla.

## 0 · El titular

> **Payload 3.87.0 sirve `/admin` con HTTP 200 contra un Postgres local, las 16
> colecciones están traducidas de lo YA medido y `payload-types.ts` compila.**
>
> **Y lo que hace auditable todo lo demás: `qa:cms-campos` DERIVA los campos de
> `apps/web/src` y verifica uno a uno que tienen contraparte — 10 tipos · 298
> rutas de campo · 0 sin contraparte**, con negativo **5/5**.
>
> **`git diff HEAD -- apps/web` está VACÍO**, sin un fichero nuevo.

```
apps/cms/              ← app Next con el admin. Config de 13 líneas
packages/cms-config/   ← TODO el modelo: campos · bloques · 16 colecciones · tipos
scripts/qa/cms-campos.mjs (+ .neg.mjs)  ← la comprobación y su negativo
```

## 1 · Por qué la comprobación es el entregable, y no `payload-types.ts`

**Que `payload-types.ts` compile NO es que las colecciones expresen los campos.**
Los tipos se generan **desde** las colecciones: un campo que se cae en la
traducción produce unos tipos perfectamente consistentes **con el esquema
equivocado**. Es *«un `join()` silencioso fabrica el verde vacío»* aplicado al
esquema — **no encontrar un campo y no buscarlo dan la misma salida**.

`cms-campos` compara **dos lados derivados**, ninguno escrito a mano:

| lado | de dónde sale |
|---|---|
| **A · lo medido** | el compilador de TypeScript sobre `types/kunak.ts` y `lib/{sectores,monografico}.ts` |
| **B · Payload** | la **config resuelta** (esbuild + import del objeto), no el texto del fichero |

Declarado sólo el **mapa** y las **excepciones** —1 hoja · 5 relaciones · 4
alias—, y **todas se imprimen**. Una excepción que nadie usa sale por
`DECLARACIÓN MUERTA`: sin eso, las exclusiones envejecen tapando campos futuros.

**La guarda se cobró tres declaraciones en su primera corrida** —`CampoRico`,
`CampoRicoEnLinea`, `MonoTrozo`, las tres innecesarias— y **un falso positivo
propio**: pedía el `kind` de cada bloque como campo, cuando en Payload la
identidad de un bloque **es su `slug`**. Las dos cosas salieron por correr la
sonda, no por leerla.

**Negativo 5/5, cada uno por SU invariante:** `campo` · `alias` · `hoja` ·
`tipo` · **CONTROL** (sin él, una sonda que fallara siempre pasaría los cuatro).

## 2 · Los 7 hallazgos, todos escritos en `ESQUEMA-CMS.md` EN esta tanda

El que más pesa, porque es de método:

> **`padre` (§2e.1): una pregunta pre-registrada como binaria puede no contener
> su respuesta.** §2e decía «relación vs `select`, lo decide F2-1». Con la medida
> delante: **`cartuchos-inteligentes` NO es una URL del CPT**, así que **17 de 18
> hijos apuntarían a un documento inexistente** — relación pura no vale, y la
> polimórfica exigiría inventar una colección de un término que ningún censo
> respalda. Decidido **`select`** por el precedente de `prefijo` (§2b · §2.4).
> PR-SP2 no se cierra: **se afila**.

Los otros seis: `table`/`mark`/`small` **no existen** en `richtext-lexical@3.87.0`
(§3.1c) · CMS-0e **necesita dónde aterrizar el HTML crudo** y un `richText` no es
ese sitio, con las dos formas costadas para F2-2 (§3.1d) · «omitido cuando
coincide» **no es gratis**: `defaultValue` es media mitad, hace falta un hook, y
está en `conDefecto` (§1.5c) · `MonoInline` → texto rico acotado a negrita
(§1.5c) · **`anchoPct` está en el esquema de SECTOR y NO en `SectorBloqueBase`**
del código —el hueco va del esquema al código— (§1.5c) · `usuarios` es
infraestructura sin lado medido (§CMS-0f).

## 3 · EL BLOQUE 3, que es lo siguiente de F2-1

**Migraciones + slugs + guarda de colisión.** Las tres piezas, y la tercera manda:

1. **Migraciones versionadas desde el día uno, con `push: false` en producción** —
   el esquema de la DB solo cambia por migración, nunca por sync implícito. Hoy
   `postgresAdapter` va con su `push` por defecto **a propósito y anotado en
   `payload.config.ts`**: adelantarlo sin la carpeta de migraciones dejaría el
   esquema sin forma de avanzar.
2. **La colección-registro `slugs`** con `unique: true` y los hooks de las
   colecciones de contenido **pasando `req`** — misma transacción: el alta y su
   registro de slug entran o fallan juntos. **No se ha creado en esta tanda**: es
   del bloque 3, y hoy cada colección lleva sólo la unicidad **nativa por
   colección**, que §4 ya dijo que **no basta**.
3. **La guarda de build de colisión del §4, PROBADA EN NEGATIVO**: un slug
   duplicado a propósito **entre familias** tumba el build, y pasa en limpio al
   quitarlo. *Guarda probada en negativo o no hay guarda.* El precedente está
   hecho: `qa:slugs` ya se probó con una colisión real
   (`medidas/slugs-COLISION-DELIBERADA-catalogo.json`).

## 4 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — ≥2026-08-04, OBLIGATORIO otro día.** Hoy sigue
   siendo 08-03. Cierra el **−30 de EDAR@390, SIN PROBAR**. Con ella en vuelo:
   **nada de `check` ni `build`** (y `check` ahora construye Y corre
   `qa:cms-campos`).
2. **F2-1 bloque 3** (arriba).
3. **`data-col` / `data-mod` en el clon** — cierra las **26 celdas SIN VEREDICTO**
   de `clase-rango`; los caminos ya están en la sonda. Hasta entonces sus `Δ0`
   son **solo del nivel de fila**, 65 pares.
4. **Los 6 mínimos** de sondas que aún declaran un mínimo escrito en vez de
   derivado del build — una ruta nueva no les sube el listón sola.
5. **Migrar a `iniciarClon()` las que esperan un 3000 ajeno** — `qa:enlaces` y
   `qa:corte` confirmadas entre ellas.
6. **`Breadcrumb max-w-[350px]` — 28 rutas**, ya cobrado en −33.25.
7. **El `Dockerfile` reapuntado a `apps/web` pero SIN CONSTRUIR** — y ahora
   además **sin cubrir `apps/cms`**: son dos apps y el compose sigue teniendo
   una. El contrato de F2-1 es el Δ0 del HTML servido, no el despliegue; se
   prueba en una tanda de despliegue.
8. **Bloque A** (CL-1 `MapaProyectos` +123.84/+33.55) y **Bloque B**
   (`articulos-kb`, que hoy es la única colección con content type decidido y
   **sin instancias transcritas** a `src/lib`).

## 5 · Lo que NO hay que hacer al empezar

- **No leer un `payload-types.ts` que compila como una verificación del esquema.**
  Para eso está `qa:cms-campos`, y su verde sólo vale porque su negativo pasa.
- **No añadir un campo a una colección sin mirar si tiene lado medido.** Si lo
  tiene y no lo pones, `cms-campos` lo nombra; si no lo tiene, la colección sale
  en «SIN lado medido» y eso es una afirmación más débil de lo que parece.
- **No meter nada de admin en `packages/cms-config`.** Es la frontera entera de
  CMS-0f: lo que entre ahí lo hereda el build del artefacto verificado.
- **No poner `push: false` sin la carpeta de migraciones** — dejaría el esquema
  sin forma de avanzar.
- **No correr `check` ni `build` con la ráfaga 3 en vuelo.**

---

# HANDOFF — F2-1 bloque 1: monorepo convertido, Δ0 en los dos anchos

> ⚠ **Tanda 2026-08-03 (22.ª).** Seis pasos. **Primera tanda de F2-1 que toca
> código de infraestructura** — y a propósito **NO instala Payload**: si la
> conversión y la instalación van juntas y el Δ0 se rompe, no se sabe cuál de
> las dos fue. Línea base congelada y commiteada (`5bfb944`) **antes de mover un
> fichero**.

## 0 · El titular

> **La conversión a monorepo está hecha y el artefacto sigue a Δ0: 31 rutas
> comparadas, 0 regresiones, a 1440 y a 390**, con marcador de frescura
> verificado y las **cuatro patas** del negativo de `clon-base` cayendo cada una
> por su invariante.

```
apps/web/             ← la app de render
apps/cms/             ← vacía a propósito: Payload es el bloque 2
packages/cms-config/  ← config + tipos + defaults. NADA de admin (CMS-0f)
scripts/  docs/       ← se quedan en la RAÍZ
```

## 1 · El hallazgo del bloque, y sale VERDE si no se busca

`scripts/` **no bajó** con la app —las sondas miden el original tanto como el
clon, y bajarlas invalidaría los cientos de `scripts/qa/…` citados en `docs/`—.
El precio: **`scripts/qa/../..` dejó de ser la raíz de la app**, y **12 sitios lo
daban por hecho**.

> ⚠ **Un `prerender-manifest.json` que no existe deja la lista de rutas VACÍA, y
> una sonda que no mide ninguna ruta NO DA ERROR: da verde.** Habría sido verde
> **justo sobre la corrida que autoriza la conversión.**

Es la regla del cero de `CLAUDE.md` §sondas —*no encontrar nada y no mirar nada
dan la misma salida*— aplicada **a la raíz** en vez de a un selector.

**Arreglado en el sitio común y no en 12**: `APP` en `lib.mjs` **busca la app
hacia arriba y la VERIFICA** (un `package.json` que declare `next`) y **tira** si
no la encuentra. Un `join()` silencioso es lo que fabrica el verde vacío.

## 2 · La aceptación, con el protocolo de CMS-0d

| comprobación | resultado |
|---|---|
| `clon-base` @1440 vs base | **31 comparadas · 0 regresiones** |
| `clon-base` @390 vs base | **31 comparadas · 0 regresiones** |
| marcador de frescura | presente — **y su negativo falla** |
| `qa:enlaces` · `qa:slugs` · `qa:corte` | 31/31 · limpio · 12/12 |
| `npm run check` · `qa:lib` | exit 0 · **69/69, las 54 compilan** |

**Y el instrumento se re-probó ANTES de creerle el Δ0** — cuatro patas, cada una
por lo suyo: **puerto muerto → exit 2** · **build viejo → exit 2 y salida
`-CONTAMINADA`** · **0 comparadas → exit 1** · **control → exit 0 con sus 31**.

**`medidas/` sigue siendo UN árbol** (360 ficheros): la mudanza no abrió un
segundo.

## 3 · Dos cosas que la conversión destapó y no eran suyas

1. **`npm install` en la raíz podó `puppeteer-core`** y las sondas dejaron de
   arrancar. Es la trampa que **§CMS-0d ya tenía escrita**. **Cerrada de raíz**:
   ahora es `devDependency` del `package.json` de la RAÍZ — que es nuevo y **no
   es el artefacto**; `apps/web/package.json` no la lleva.
2. **`qa:enlaces` y `qa:corte` esperan un `3000` ajeno.** **Preexistente,
   verificado contra HEAD** — es el pendiente *«migrar a `iniciarClon()` las
   45»*. Con el 3000 levantado, las dos verdes.

## 4 · LOS DOS BLOQUES SIGUIENTES DE F2-1

**Bloque 2 · Payload + colecciones/tipos.** Instalar Payload **en `apps/cms`**,
y las **colecciones y `payload-types.ts` en `packages/cms-config`** — no en la app
de render: es lo que permite que el build lea por **Local API sin HTTP** y que el
churn del admin no toque el artefacto. Los content types ya están escritos:
§1.4 SECTOR (con `anchoPct`) · §1.5 MONOGRÁFICO · §2 grupo A · §2b grupo C ·
§2c términos · §2d.1 `articulos-kb` · **§2e `productos`**.

> **Y su restricción, la misma que ésta cumplió:** si el bloque 2 toca
> `apps/web`, paga **su propia corrida Δ0** contra la línea base — que ya existe
> y está commiteada.

**Bloque 3 · migraciones + slugs + guarda de colisión.** Migraciones
**versionadas** desde el día uno con **`push: false`** en producción; la
colección-registro **`slugs`** con `unique: true` y los hooks **pasando `req`**
(misma transacción); y la **guarda de build de colisión** del §4 — **probada en
NEGATIVO**: un slug duplicado a propósito entre familias tumba el build, y pasa
en limpio al quitarlo. *Guarda probada en negativo o no hay guarda.*

## 5 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — ≥2026-08-04, OBLIGATORIO otro día.** Hoy sigue
   siendo 08-03. Cierra el −30 de EDAR@390, **SIN PROBAR**. Con ella en vuelo:
   **nada de `check` ni `build`**.
2. **F2-1 bloque 2** (Payload + colecciones).
3. **`data-col` / `data-mod` en el clon** — cierra las **26 celdas SIN VEREDICTO**
   de `clase-rango`; los caminos ya están puestos en la sonda. Hasta entonces sus
   `Δ0` son **solo del nivel de fila**, 65 pares.
4. **Migrar a `iniciarClon()` las que aún esperan un 3000 ajeno** — `qa:enlaces`
   y `qa:corte` confirmadas hoy entre ellas.
5. **`Breadcrumb max-w-[350px]` — 28 rutas**, ya cobrado en −33.25.
6. **Bloque A** (CL-1 `MapaProyectos` +123.84/+33.55) y **Bloque B**
   (`articulos-kb`).
7. **El `Dockerfile` reapuntado pero SIN CONSTRUIR** — el contrato de F2-1 es el
   Δ0 del HTML servido, no el despliegue. Se prueba en una tanda de despliegue.

## 6 · Lo que NO hay que hacer al empezar

- **No dar por buena una sonda tras un cambio de layout sin correr su negativo.**
  El modo de fallo de esta mudanza es **verde vacío**, no rojo.
- **No meter Payload en `apps/web`.** El aislamiento es el motivo entero de
  CMS-0f: el churn del admin no puede tocar el artefacto verificado.
- **No poner colecciones ni tipos en la app de render.** Van en
  `packages/cms-config`, que es lo que hace posible la Local API sin HTTP.
- **No reinstalar `puppeteer-core` con `--no-save`.** Ya es `devDependency` de la
  raíz; volver al `--no-save` reabre la trampa de CMS-0d.
- **No correr `check` ni `build` mañana con la ráfaga 3 en vuelo.**

---

# HANDOFF — `productos` es UNA colección: cubo C vacío, y F2-1 arranca

> ⚠ **Tanda 2026-08-03 (21.ª).** Seis pasos. Tanda de **RECON + DECISIÓN**: se
> midió el original, no se construyó ninguna página, no se tocó `src/`.
> Pre-registro commiteado **antes** de la sonda y de medir (`3af483c`); medida
> congelada y commiteada **antes** del acta (`3039996`).

## 0 · El titular

> **El CPT `solutions` es UNA colección `productos` con discriminante.** Campos
> de frontera medidos: **1** (`padre`, opcional). Ni U1 ni U2 disparan.
>
> **⇒ El cubo C queda VACÍO. Las dos precondiciones de F2-1 están cerradas.
> F2-1 ARRANCA.**

## 1 · Lo primero que salió, y fue antes de medir: el alcance estaba mal

Derivado del `solutions-sitemap.xml` en vez de citado del censo: **24 URLs, no
22**, y dos de ellas el proyecto no las contaba como de este CPT —
`software-de-medicion-calidad-del-aire` y `kunak-api`.

> ⚠ **CORRIGE a la tanda 20.ª:** dijo *«HOME · SOFTWARE · API son singleton,
> nada decidido las apunta ⇒ cubo B»*. **Falso para dos de los tres.** SOFTWARE y
> API son **del mismo CPT** que PRODUCTO y CATÁLOGO, o sea de la colección que
> las dos relaciones apuntaban. **El error fue citar el censo en vez de derivar
> el CPT** — la misma clase que la 20.ª acababa de documentar.

Y el recuento correcto: **4 arquetipos construidos sin content type**, no 5 —
`kunak-api` es **variante**, no arquetipo (`CLAUDE.md` §Páginas clonadas). De los
4, **tres eran del agujero** y **solo HOME queda fuera**.

## 2 · La calibración que decidió el número — y sin ella la respuesta se invierte

El criterio de §1.5b es «campos nuevos que solo una forma usa». **Qué cuenta como
«campo» no es libre: lo fija el precedente.** §1.3, literal:

> *«`beneficiosAplicaciones` **entra sin un solo campo nuevo**»*

Es **un bloque entero que SECTOR tiene y MONOGRÁFICO no**, y quedó **fuera** de
los 3 campos de frontera. Los 3 que sí contó son **propiedades**.

> **Un KIND DE BLOQUE que una forma usa y otra no NO es campo de frontera. Lo son
> las PROPIEDADES.**

Por eso `blurb`, `galeria`, `video`, `cta`, `tabla` y `slider` **no cuentan**.
**Sin esta calibración el recuento sale ×5 y la decisión se invierte.**

## 3 · Lo medido — 24/24, 0 muertos, control 4/4

| | |
|---|---|
| **plantilla** | **`solutions-template-default` en 24 de 24** — un solo cascarón |
| **secciones propias** | 4 · 5 · 6 (×21) · 7 ⇒ composición **por instancia** |
| **frontera de propiedades** | **1**: la ruta con **padre** (18 de 24), y **opcional** |

**La agrupación por ruta era una hipótesis y los datos la tumbaron:**
`sensor-de-calidad-del-aire/metano` tiene la firma de un **cartucho** (47 mod, 0
`blurb`), no la de su padre; y `software-…`/`kunak-api` tienen la de
`monitor-calidad-aire`. **El eje real es volumen de contenido, no forma**: 18
páginas de 46–50 módulos sin `blurb` contra 5 de 56–106 con él, **mismo nº de
secciones y misma plantilla**.

## 4 · El content type, en §2e

`productos` · `tipo` (**`select`, defecto `"ficha"`**; `catalogo` solo lo usa
`accesorios`) · **`padre` opcional** · `seo` · `titulo` · `slug` · **`cuerpo` =
`blocks`** con la unión de kinds del CPT. Ritmo y retícula por **definición
compartida**, la misma de `MonoModulo` y `articulos-kb`.

**Las dos relaciones, cerradas**: `sectores.soluciones` y `casos.soluciones` →
**`relationTo: 'productos'`**, **sin polimorfismo** — al ser una sola colección
no hace falta.

## 5 · El TERCER OBJETO del criterio de precondición, añadido

El pre-registro de la 20.ª declaró **dos** objetos y el ítem de C llegó por un
tercero. Escrito ya en `precondicion-1/PRE-REGISTRO.md` §1.1:

> **LA IDENTIDAD DE LA COLECCIÓN DESTINO DE UNA RELACIÓN.** Un campo de relación
> **se escribe igual y significa otra cosa** si su destino cambia de forma. Lo
> que la forma nueva cambia no es el campo: es **cuántas colecciones es su
> destino**.

**Por qué se escapa:** la mirada va a los campos *propios* y a las definiciones
*compartidas*, no a **con qué se casan**. **Regla: al clasificar, recorre también
los destinos de relación y pregúntate si la forma nueva puede PARTIR el destino.**

## 6 · SIN PROBAR, anotado y no cableado

- **PR-SP1 · `accesorios`** (n=**1**): única con tablas y sin slider. Con n=1 **no
  se separa «catálogo es otra forma» de «un autor que maquetó con tablas»**. Entra
  con `tipo: "catalogo"`; **una segunda página de catálogo reabre la pregunta**.
- **PR-SP2 · el padre**: categoría en 17 casos, **otro producto** en 1.
- **PR-SP3** · `producto` y `catalogo` tienen **n=1**: su «universal» es
  «presente». **Ninguna afirmación de plantilla sale de ellas.**

## 7 · LO SIGUIENTE — **F2-1**

**Las dos precondiciones están cerradas**: la 1 con el cubo C vacío, la 2 con
`anchoPct` declarado. Su primera tarea es el **layout del monorepo** (CMS-0f),
bajo la restricción del acta: **si toca la app de render, paga UNA corrida de
re-aceptación Δ0 contra la línea base ANTES de cualquier otro cambio**.

**Las 2 incógnitas acotadas siguen ahí y NO se cuentan como «no bloquean»**:
LH-SP8 (`/es/categoria/*`) y las 14 páginas sueltas de la cola larga. Su peor
caso es B — **eso es una cota que autoriza arrancar, no un permiso para darlas
por resueltas**.

## 8 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — ≥2026-08-04, OBLIGATORIO otro día.** Hoy sigue
   siendo 08-03: tampoco se pudo lanzar en esta tanda. Cierra el −30 de
   EDAR@390, **SIN PROBAR**. Con ella en vuelo: **nada de `check` ni `build`**.
2. **F2-1** (esquema), con la restricción de CMS-0f.
3. **Columna y módulo CIEGOS en el lado del clon** — `clase-rango` declara **26
   celdas SIN VEREDICTO** porque el clon solo marca la fila (`data-fila`). Se
   cierra con **`data-col` / `data-mod`**; **los caminos ya están puestos** en la
   sonda. Hasta entonces sus `Δ0` son **solo del nivel de fila**, 65 pares.
4. **Los 6 SIN PROBAR** — `LH-SP3` · `LH-SP8` · `LH-SP9` · **`LH-SP10` (ya
   reclasificado a F2-2**: el campo está declarado; lo que decide es si el
   importador **pierde extractos manuales en silencio**) · `A-SP14` · `A-SP15`.
   Y los tres nuevos **PR-SP1/2/3**.
5. **`Breadcrumb max-w-[350px]` — 28 rutas**, ya cobrado en **−33.25**. El más
   urgente de los 21 que no bloquean.
6. **Bloque A** (CL-1 `MapaProyectos` +123.84/+33.55) y **Bloque B**
   (`articulos-kb`).
7. **HOME sin content type** — singleton, nada la apunta ⇒ cubo B, no bloquea.

## 9 · Lo que NO hay que hacer al empezar

- **No contar un KIND DE BLOQUE como campo de frontera.** La calibración es
  `beneficiosAplicaciones` en §1.3, y con ella el recuento se multiplica por 5.
- **No tratar `simple` y `rica` como dos content types.** Misma plantilla, mismo
  nº de secciones: lo único que las separa es cuántos bloques puso el editor.
- **No dar `accesorios` por «otra forma».** Es **n=1** y está SIN PROBAR.
- **No citar un censo donde se puede derivar el CPT.** Costó dos páginas en la
  tanda anterior y una corrección en ésta.
- **No correr `check` ni `build` mañana con la ráfaga 3 en vuelo.**

---

# HANDOFF — la precondición 1, de frase a número: C = 1, y es `productos`

> ⚠ **Tanda 2026-08-03 (20.ª).** Cinco pasos. Tanda de **LECTURA**: no se midió,
> no se construyó, no se abrió el navegador, no se tocó `src/` ni `scripts/`.
> Pre-registro commiteado **antes** de clasificar (`cf25baf`).

## 0 · El titular

> **CUBO C = 1 · INCÓGNITAS = 2 acotadas.** El ítem de C **no es ninguno de los
> candidatos que se sospechaban**: es **`productos`**, una colección que **dos
> colecciones ya decididas apuntan como destino de relación** y que **no está
> modelada en ninguna parte del esquema**.
>
> **F2-1 no congela todavía** — y lo que lo cierra es **recon, no build**.

## 1 · La reformulación, que es la mitad del entregable

«Biblioteca cerrada» es binaria; **su razón escrita no lo es**. Distingue dos
cosas que la frase junta y **solo una es cara**:

| | coste | ¿es lo que teme? |
|---|---|---|
| **AÑADIR** una colección o block nuevos | barato | **NO** |
| **CAMBIAR** una colección o block **ya poblados** | caro (§1.5b R3) | **SÍ** |

> **La pregunta que gobierna F2-1: ¿queda algo sin construir que pueda FORZAR un
> campo o una variante dentro de una colección o un block YA DECIDIDOS?**
> **A** lee sin cambiar · **B** añade lo suyo · **C** fuerza algo decidido.
> Solo **C** bloquea, y una **INCÓGNITA no cuenta como «no bloquea»**.

## 2 · La sospecha pre-registrada FALLÓ, y falló limpio

El pre-registro apostó por las **variantes de tarjeta de LISTADO-B** como el
candidato más probable a C. **No lo son.** El contrato que exigen ya está escrito
en §2c desde LH-2 —`fechaPublicacion`, `imagenDestacada` opcional, `extracto`, y
**las TRES taxonomías**, que era *«lo más caro de re-migrar si falta»*—, y
`EntradaBlog` los tiene todos.

> **El mecanismo que lo evitó no fue la suerte: LH-2 se hizo ANTES de construir
> el grupo A, exactamente por esto. La precondición ya funcionó una vez.**

Se anota como **predicción fallada**, no se reescribe.

## 3 · El segundo objeto —las definiciones compartidas— está contestado por MEDICIÓN

Era el que el pre-registro declaró que se olvida. `grupo-D/RECON.md` §5 y §7:
**PD1 «nada obligó a tocar `MonoRitmo`»** y **PD2 texto/imagen/botón entran**.

> `articulos-kb` **consume** las definiciones compartidas **sin cambiarlas** y
> **añade** su propia unión (`blurb`/`gallery`) ⇒ **cubo B**.

Y la cola larga tampoco las toca: §2d.1 ya decidió que `video`/`toggle` **no**
entran en `MonoSeccion[]`.

## 4 · El ítem de C, y por qué el enunciado viejo era CIEGO a él

> **`productos` se cita DOS veces en `ESQUEMA-CMS.md` y las dos como destino de
> relación** —`sectores.soluciones` §1.4 y `casos.soluciones` §2b— **y no tiene
> ni un campo escrito.** Sus **20 instancias sin medir** (17 cartuchos + 3
> fichas) pueden decidir si es **una** colección o **dos**, y eso cambiaría un
> campo decidido en **dos** colecciones.

**Faltan CINCO arquetipos construidos** del esquema: HOME · **PRODUCTO** ·
**CATÁLOGO** · SOFTWARE · API. El §1 lo dice en su propio título desde el primer
día («los **dos** content types medidos») y nunca se completó.

> **«Biblioteca cerrada» pregunta si la página está CONSTRUIDA — y PRODUCTO lo
> está, desde julio. Lo que falta no es la página: es su CONTENT TYPE. Un
> criterio que mide construcción no puede ver un hueco de modelado.**

**Solo uno de los cinco bloquea**, y por una razón concreta: HOME, SOFTWARE y API
son singleton y **nada decidido las apunta** ⇒ B. PRODUCTO/CATÁLOGO tienen la
relación encima ⇒ **C**.

## 5 · Una corrección al criterio, pagada por este caso

El pre-registro declaró **dos** objetos (campos de colección · definiciones de
block compartidas). C llegó por un **tercero**:

> **El DESTINO DE UNA RELACIÓN.** `soluciones` es un campo decidido, pero lo que
> la forma nueva cambia no es *ese campo*: es **la identidad de la colección a la
> que apunta**. Se escribe igual y significa otra cosa.

Queda cubierto por la letra del criterio, pero **no lo sugería**. Para el
siguiente uso: **al clasificar, recorre también los destinos de relación y
pregúntate si la forma nueva puede PARTIR el destino.**

## 6 · LO SIGUIENTE, nombrado

**AHORA · recon de las 20 dudosas del CPT `solutions`** (17 `cartuchos-inteligentes/*`
+ 3 fichas). El censo ya dijo lo que cuesta: *«recon, no build: un barrido de
topología por página y comparar. **Barato**»*. Sale con **una colección o dos**.

**DESPUÉS · escribir el content type de `productos`** en `ESQUEMA-CMS.md` §2e.

**ENTONCES · F2-1** congela y arranca (CMS-0f ya decidida; precondición 2 ya
cerrada).

⚠ **Lo que NO vale: modelar `productos` desde la única instancia construida.** Es
la FAMILIA DE CALIBRACIÓN, y se pagó el mismo día: con **cuatro** instancias de
SECTOR, el `anchoPct: 90` vivía en **una sola**.

## 7 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — ≥2026-08-04, OBLIGATORIO otro día.** Hoy sigue
   siendo 08-03: no se pudo lanzar. Cierra el −30 de EDAR@390, **SIN PROBAR**.
   Con ella en vuelo: **nada de `check` ni `build`**.
2. **Recon de las 20 dudosas** → `productos` → **F2-1**.
3. **Columna y módulo CIEGOS en el lado del clon** — `clase-rango` declara **26
   celdas SIN VEREDICTO** porque el clon solo marca la fila (`data-fila`). Se
   cierra con **`data-col` / `data-mod`**; los caminos **ya están puestos** en la
   sonda. Hasta entonces, sus `Δ0` son **solo del nivel de fila**, 65 pares.
4. **Los 6 SIN PROBAR abiertos** — `LH-SP3` (qué ordena cada listado) · `LH-SP8`
   (censo de `/es/categoria/*`) · `LH-SP9` (entradas/página de L3) · `LH-SP10`
   (¿algún extracto es manual?) · `A-SP14` · `A-SP15`. **`LH-SP10` es de F2-2, no
   de F2-1**: el campo ya está declarado; lo que decide es si el importador
   **pierde contenido en silencio** derivándolos todos.
5. **`Breadcrumb max-w-[350px]` — 28 rutas**, ya cobrado en **−33.25**. El más
   urgente de los 21 que no bloquean.
6. **Bloque A** (CL-1 `MapaProyectos` +123.84/+33.55) y **Bloque B**
   (`articulos-kb`).
7. **Las 14 páginas sueltas** de la cola larga y la **barra de navegación**
   (CLASE MAYOR, 31 rutas, defecto de RANGO).

## 8 · Lo que NO hay que hacer al empezar

- **No leer «C = 1» como «casi listo».** Ese 1 tiene **20 páginas sin medir**
  debajo y decide la forma de una colección que dos ya apuntan.
- **No tratar las incógnitas como cubo B.** Son **2 acotadas** (LH-SP8 y las 14
  sueltas): su peor caso es B, pero eso es una **cota**, no una clasificación.
- **No dar el grupo A por «lo caro» de la precondición.** Su contrato se cerró en
  LH-2 y esta tanda lo verificó campo a campo: **cubo A**.
- **No correr `check` ni `build` mañana con la ráfaga 3 en vuelo.**

---

# HANDOFF — CMS-0f decidida: dos apps en monorepo, y la infraestructura queda sin decisiones abiertas

> ⚠ **Tanda 2026-08-03 (19.ª).** Cinco pasos, en Fable. Tanda de **DECISIÓN
> PURA**: no se midió nada, no se construyó nada, no se tocó `src/` ni
> `scripts/`. El entregable es un acta — la última decisión de infraestructura
> del esquema, con su criterio escrito antes de la elección.

## 0 · El titular

> **CMS-0f: DOS APPS en el mismo monorepo** —el clon intacto + una app CMS
> (admin de Payload), misma DB— **y la lectura en build por LOCAL API
> COMPARTIDA** (paquete del monorepo con config + tipos). **El endpoint interno
> queda descartado. Con esto el §CMS-0 no tiene ya ninguna decisión abierta**:
> las dos que quedan en §7 (tabla §3.4, allowlist §3.3b) son de contenido y de
> política, y ninguna bloquea instalar Payload.

Acta completa: `ESQUEMA-CMS.md` **§CMS-0f** (es DECISIÓN, no fase — vive con
CMS-0b/0c/0d/0e). `PLAN-FASE-2.md` §F2-1 ya no dice «se decide al arrancar».

## 1 · El criterio, y se escribió ANTES de elegir

Ninguna medida arbitra esto — las dos opciones funcionan. Cuando ninguna medida
arbitra, **decide la asimetría de deshacer** (la maquinaria de §1.5b Razón 3):

| dirección | qué cuesta |
|---|---|
| **única → dos** (separar después) | **desenredar el artefacto verificado** — extraer config, rutas y dependencias de un `package.json`/`next.config` entrelazados, con re-aceptación completa a umbral cero sobre el manifest de ese momento (~220 rutas tras el grupo A, no 31) — y llega **forzado en el momento caro**: cuando el churn de Payload ya duele, o sea después de F2-3, con editores dentro |
| **dos → una** (colapsar después) | las piezas ya están **aisladas por construcción**: montar las rutas del admin y fusionar dependencias. **Mecánico, electivo**, una corrida de re-aceptación, sin mover datos ni esquema |

> **Enredar→desenredar es caro y forzado; aislado→fusionar es mecánico y
> electivo.** Esa asimetría toma la decisión — coincide con la recomendación del
> evaluador independiente, pero lo que decide es el criterio.

## 2 · La frontera de la lectura, cerrada en la misma acta

Elegir «dos apps» sin cerrar por dónde lee el build era dejarla a medias. Cerrado:

> **Local API por paquete compartido del monorepo** — config de colecciones +
> tipos generados + defaults, **nada de componentes de admin**. La app de render
> gana `payload` y el adaptador de Postgres como dependencias **de build**
> (CMS-0c: la DB es dependencia del build, no del runtime) y **no emite jamás
> `/admin` ni `/api`**.

**Por qué no el endpoint interno**, en tres: (1) **reabriría CMS-0**, que dice
literal *«leen de la DB sin HTTP»*; (2) convierte una dependencia de biblioteca
en una de **servicio** en build — el build del clon fallaría con la app CMS
caída, y mete HTTP donde la aceptación exige salida determinista (CMS-0c,
consecuencia 3); (3) **no ahorra el paquete compartido** — con endpoint también
habría que compartir `payload-types.ts`; solo añade HTTP encima.

## 3 · Lo que la decisión protege, con la vara ya medida

El activo: **31 rutas a Δ0 con línea base congelada** y la aceptación de F2-3 a
**umbral CERO sobre todo el `prerender-manifest`**. La vara de qué cuesta
re-verificar existe: **CMS-0d pagó el protocolo completo por un parche de Next**.

- Con app única, **cada release de Payload** aterriza en el `package.json` y el
  `next.config` de la app de render ⇒ protocolo completo cada vez — o la presión
  de saltárselo, que es cómo se fabrica un verde falso.
- Con dos apps, el churn del admin se queda en la app CMS; los insumos del
  render cambian **solo** cuando cambia el paquete compartido — evento
  **elegido y agrupable**, acotable por diff de lockfile.

**Y el acoplamiento que QUEDA, dicho en el acta para que no sea sorpresa:** las
dos apps comparten el núcleo de Payload a través del paquete y del esquema de la
DB. Una subida del núcleo en el paquete **sí** paga el protocolo completo. Dos
apps no compra inmunidad: compra que ese pago sea **por lotes y elegido**.

## 4 · Qué tendría que pasar para revisarla

1. **La frontera** cae a endpoint interno solo si la Local API compartida
   resulta inviable entre dos apps (la config deja de poder cargarse desde dos
   procesos). Revisaría la frontera, **no** la decisión de dos apps.
2. **La decisión** se colapsa a única si operar dos apps cuesta más de lo que
   evita — **contado en corridas de re-aceptación forzadas**, número y no
   impresión. El colapso es la dirección barata por construcción: poder pagarlo
   es lo que esta decisión compra.

## 5 · LO SIGUIENTE, nombrado

**F2-1 (esquema) — ya sin incógnitas previas.** Su primera tarea es la mecánica
del layout del monorepo (raíz-como-app vs `apps/`), **bajo la restricción
heredada de CMS-0f**:

> **La conversión no toca el artefacto verificado en silencio.** Si el layout
> mueve o modifica la app de render —aunque sea una línea de `workspaces` en su
> `package.json`— paga **UNA corrida de re-aceptación Δ0 contra la línea base
> congelada ANTES de cualquier otro cambio**, con el protocolo de CMS-0d.

Y el resto de F2-1 como está escrito: colecciones con los defectos explícitos
(incluido el `anchoPct` de SECTOR de la 18.ª), migraciones versionadas con
`push: false`, colección-registro `slugs`, y la guarda de colisión **probada en
negativo**.

## 6 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — ≥2026-08-04, OBLIGATORIO otro día.** Hoy sigue
   siendo 08-03: no se pudo lanzar en esta tanda. Cierra el −30 de EDAR@390, que
   sigue **SIN PROBAR**. Con ella en vuelo: **nada de `check` ni `build`**.
2. **F2-1**, con la restricción del §5. (La precondición 2 quedó cerrada en la
   18.ª; la 1 —biblioteca— sigue abierta y es la que gobierna.)
3. **`data-col` / `data-mod` en el clon** — cierra las 26 celdas SIN VEREDICTO
   de `clase-rango`.
4. **Bloque A** (CL-1 `MapaProyectos` +123.84/+33.55 · `Breadcrumb` −33.25) y
   **Bloque B** (`articulos-kb`).
5. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
6. **Comportamiento a 0/31** en la matriz de cobertura.

## 7 · Lo que NO hay que hacer al empezar

- **No leer «dos apps» como headless por HTTP.** La lectura sigue siendo Local
  API sin HTTP — es la letra de CMS-0, conservada a propósito; lo que cae es la
  letra «embebido» de la tabla de plataforma (anotada, no borrada).
- **No convertir el repo a monorepo moviendo el artefacto sin pagar la corrida
  Δ0 previa.** Es la restricción del acta, no una sugerencia.
- **No meter nada de admin en el paquete compartido.** Config + tipos +
  defaults; el contrato de la frontera está en el acta.
- **No correr `check` ni `build` mañana con la ráfaga 3 en vuelo.**

---

# HANDOFF — el ancho de módulo es CAMPO en SECTOR: los 10 se parten 9/1 y F2-1 puede arrancar

> ⚠ **Tanda 2026-08-03 (18.ª).** Cinco pasos. Tanda de **MEDICIÓN**: no se
> arregló ningún componente y no se tocó `src/`. El entregable son **una sonda
> que no existía, dos números y una línea de esquema**. Pre-registro commiteado
> **antes** de construir la sonda y de medir (`61a9e78`); medidas commiteadas
> **antes** del acta (`226c30f`).

## 0 · El titular

> **MIXTO, y no era la rama cómoda. El ancho de MÓDULO en SECTOR es CAMPO**
> —`80 · 90 · 100`, idénticos a 1440 y a 390—; **en grupo C no hay nada que sea
> campo porque no hay capa de builder que medir**.
>
> **De los 10 bloqueadores, NUEVE se abren y UNO se convierte en trabajo.** Y la
> misma corrida destapó **uno nuevo que ningún inventario podía ver**:
> `MapaProyectos`, **+123.84 px** a 1440 y **+33.55** a 390, **solo en
> Industria**.

## 1 · El hallazgo que reencuadró la pregunta, y es de LECTURA

Antes de medir se leyó a qué **nivel** vive cada valor cableado de los 10:

> **NUEVE cablean retícula** —fila (`86 %`/`80 %`) o columna (`47.25 · 47 · 32 ·
> 50.5 · 25 %`)— **y solo UNO está al nivel de módulo** (el `<h3>` de
> `BeneficiosAplicaciones`).

`DECISION.md` los agrupó a los diez bajo *«cablean ancho de MÓDULO»*. Era
**confusión de NIVEL**: el precedente de MONOGRÁFICO es del nivel de módulo y a
nueve no les aplicaba. La pregunta se abrió en **tres**, una por nivel.

**Y lo que el fuente no puede contestar:** un módulo **sin** clase de ancho *es*
un módulo al 100 %. Si el original le da 90 %, no hay valor cableado que
encontrar — hay uno **ausente**. Ningún `grep` lo ve. Es exactamente CL-1.

## 2 · El discriminador NO fue el que pedía el encargo, y está medido

El encargo decía *«px absolutos iguales a 1440 y a 390 significan CAMPO»*. Es el
**test A**, y `CLAUDE.md` declara **esta propiedad exacta** como su excepción: el
ancho de módulo se escribe en % igual que su default, así que **da la respuesta
al revés**. Se usó el **test B** (varianza intra-página), y el pre-registro lo
dejó escrito antes de medir.

**Medido, con los dos lados de la inversión:**

| | huella | qué es |
|---|---|---|
| separadores | **`60 px` iguales a los dos anchos** ← la huella de «campo» del test A | **NO son campo**: una decisión leída contra columnas distintas |
| ancho de módulo | **`%` igual, px distinto** (`468.09`/`268.31`) ← la huella de «plantilla» | **SÍ es campo** |

Con el test A esta tanda habría abierto los 10 **por el motivo equivocado**.

## 3 · Y los dos discriminadores coinciden, así que el veredicto es robusto

| | ¿varía? |
|---|---|
| intra-página (test B, régimen builder) | **SÍ** — Industria trae `80`, `90` y `100` |
| entre instancias (el de régimen plantillado) | **SÍ** — el `90` existe **solo en Industria** |
| a los dos anchos | **SÍ** — idénticos |

**No depende de qué régimen se le suponga a SECTOR.** Es la lectura más robusta
que podía salir.

## 4 · `clase-rango`, y por qué su segundo número no es adorno

Sonda nueva. Los dos ejes se calculan de **datos distintos** —la fidelidad de
**pares**, el rango de **conjuntos por lado**— y por eso el rango sobrevive donde
la fidelidad muere. **Test en negativo entero, 4/4, asertando sobre los
CONTADORES** y no sobre el código de salida (que es UN número para DOS ejes):

- `fidelidad` → ① sube y ② **se queda a 0**;
- `rango` → ② sube y ① **se queda sin pares**.

**Validada contra una medida buena anterior antes de creerle nada:** en el
control, el módulo del original da `70×1 · 80×7 · 90×1 · 100×45` — **exactamente**
los `anchoPct` de `monografico.ts`.

**Y trajo un defecto propio, cazado por esa misma corrida:** el clon solo marca
la **fila**. Por heurístico daba **66 «columnas» contra 27** y **102 «módulos»
contra 66**. Sin guarda, el eje de rango **no podía disparar nunca** ahí y habría
salido verde. Ahora un nivel solo tiene veredicto si la identidad es del tema en
el original **y** de marcador en el clon; el resto se cuenta y se grita: **26
celdas SIN VEREDICTO**.

## 5 · Lo que le hace a F2-1 — **puede arrancar**

| | antes | ahora |
|---|---|---|
| ítems que bloquean | **10, «sin probar»** | **1, probado** (+1 nuevo) |
| qué hay que hacer | desconocido | **una línea de esquema** |
| grupo C | bloqueaba | **no bloquea** |

`SectorBlock` gana **`anchoPct?: number`, defecto `100`**. Es **el mismo campo,
con el mismo nombre y el mismo defecto** que `MonoModuloBase.anchoPct`: no un
campo nuevo, el mismo en una segunda colección. Por eso **no fuerza a fusionar
colecciones** ni contradice §1.5b — *lo que se duplica es el documento, no la
definición*. Escrito en `ESQUEMA-CMS.md` §1.4 y §6c.1, y `PLAN-FASE-2.md`
precondición 2 **cerrada**.

**La precondición 1 (biblioteca) sigue abierta y es hoy la única de las dos que
gobierna el arranque.**

## 6 · LO SIGUIENTE, nombrado

**AHORA · CMS-0f — tanda corta, en Fable.** *App única (Payload embebido en el
Next del clon) vs dos apps en monorepo, misma DB.* Es **decisión, no fase**: su
acta va a `ESQUEMA-CMS.md` §CMS-0. Los costes de las dos ya están escritos en
`PLAN-FASE-2.md` §F2-1, y el evaluador independiente recomienda **dos apps**
para no tocar el artefacto verificado. **Es corta porque no hay que medir nada:
la información ya está escrita; falta elegir.**

**DESPUÉS, con CMS-0f decidida · F2-1 (esquema).** Con `anchoPct` en `sectores`
**desde el primer día** — que es la única pieza donde equivocarse era cara de
deshacer, y ya no lo es.

**Y en paralelo, sin prisa · Bloque A** (arreglos CLASE), empezando por los dos
con número: **CL-1 `MapaProyectos`** (+123.84 / +33.55, solo Industria) y
`Breadcrumb max-w-[350px]` (28 rutas, −33.25).

## 7 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — a partir de HOY+1 (≥2026-08-04), OBLIGATORIO otro
   día.** No se pudo lanzar en esta tanda: es del 08-03 y las dos que hay también.
   Cierra el −30 de EDAR@390, que sigue **SIN PROBAR**. Con ella en vuelo: **nada
   de `check` ni `build`**.
2. **CMS-0f** (arriba) y, con ella, **F2-1**.
3. **`data-col` / `data-mod` en el clon** — cierra las 26 celdas SIN VEREDICTO de
   `clase-rango`. Los caminos ya están puestos en la sonda.
4. **Bloque A** (CL-1, `Breadcrumb`) y **Bloque B** (`articulos-kb`).
5. **La firma del emparejador cruza la frontera del módulo** — 48 car. truncados
   arrastran el texto del siguiente; casi tapa CL-1.
6. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
7. **Comportamiento a 0/31** en la matriz de cobertura.

## 8 · Lo que NO hay que hacer al empezar

- **No leer los `Δ0` de `clase-rango` como «el cuerpo de SECTOR está a Δ0».** Son
  **del nivel de FILA**, 65 pares, y solo de ahí. Columna y módulo están
  **CIEGOS** en el lado del clon, no limpios.
- **No tratar los `4.84 / 10.25 / 16.33 / 17.89 %` como anchos de módulo.** Son
  separadores de **60 px exactos**: una decisión, no cuatro.
- **No arreglar `BeneficiosAplicaciones` como defecto de píxel.** Su `80 %` es el
  valor **correcto** en 4/4: lo que falta es el campo, y eso se arregla en F2-1.
- **No aplicar el test A al ancho de módulo.** Da la respuesta al revés, y ahora
  está medido en los dos sentidos.
- **No dar grupo C por «no varía».** Es que **no tiene capa de builder**: FAQ, 0
  secciones propias; CASO, 1. Y no es cero de instrumento — el mismo código dio 7
  en SECTOR y 8 en el control.

---

# HANDOFF — CLASE clasificada: la precondición de F2-1 deja de ser una frase y es 10

> ⚠ **Tanda 2026-08-03 (17.ª).** Seis pasos. **Mitad de decisión: no se arregló
> ni un componente.** El entregable es el plan que ejecuta la siguiente, más un
> número que hoy no existía. PASOS 1–3 commiteados (`e6c9cb3`) **antes** de
> clasificar y de recomendar — el orden de grupo D, porque *una tanda que decide
> y arregla a la vez escribe el criterio que su arreglo cumple*.

## 0 · El titular

> **«CLASE es precondición de F2-1» = 10 de 31 ítems. Y esos 10 se desbloquean
> con UNA MEDICIÓN, no con diez arreglos.**

Los otros **21 son trabajo de plantilla que no toca el esquema**, así que no
tienen por qué preceder a F2-1.

## 1 · El inventario crece ×3.9 — y era de esperar

Sonda nueva `qa:clase-censo` (`medidas/clase-censo.json`): 74 componentes → 58
con medida absoluta → 41 con alcance ≥2 **rutas** → 33 candidatos → **31 reales**.
**El inventario a mano tenía ~8.**

**Tres defectos de la lista a mano, dos míos y cazados contra casos conocidos:**

1. **`BandaCabecera` no salía**: su `165.58` no es clase Tailwind sino literal de
   objeto. El detector medía *«medida absoluta escrita en Tailwind»*, no *«medida
   absoluta cableada»*.
2. **Contar IMPORTADORES subcuenta justo donde duele.** `CabeceraSector` lo
   importa **1** fichero — que sirve **6 rutas**. Y 6 de las 11 páginas son
   dinámicas. Corregido a **alcance transitivo en rutas emitidas**: con
   importadores, 27 compartidos; con rutas, **41**. `RelacionadosA` pasa de «1
   importador» a **10 rutas**.
3. **El `345.1` que S10 cita como cableado ya no existe en `src/`.** La lista
   citaba un valor muerto.

## 2 · El criterio de bloqueo, que es lo reutilizable

> **BLOQUEA = el esquema quedaría MAL si se migra así.** Y se resuelve en una
> pregunta: **¿el valor cableado lo elige EL EDITOR (campo) o se deriva del
> CONTENIDO (lo calcula la plantilla)?**

- **derivado del contenido** → alto que sale del texto: lo calcula la plantilla,
  **cero campos**. Rompe la página hoy; **no rompe el esquema**. → NO BLOQUEA.
- **elegido por el editor** → si el esquema no tiene el campo, **va mal a
  Payload**. → BLOQUEA.

**Y la duda cuenta como bloqueo** por la Razón 3 de §1.5b: **añadir un campo
después de que haya contenido escrito es la dirección cara.**

## 3 · Los 10 que bloquean: no por rotos, por SIN PROBAR

Cablean **ancho de MÓDULO** en SECTOR (`SectorBody` `SectorHero` `ClaimConFoto`
`ListaSimple2Col` `BeneficiosAplicaciones` `CabeceraSector`) y grupo C
(`CasoPagina` `CasoDetalles` `CasoGaleria` `FaqSidebar`).

**`anchoPct` existe SOLO en `src/lib/monografico.ts`** — y ahí, donde se miró,
**resultó campo** (70·80·90·100 en la misma página, −55 por instancia ×10).
Fuera de MONOGRÁFICO nadie lo ha mirado: **SIN PROBAR**, y *sin probar no se
cablea* — pero está cableado.

> **Lo que los desbloquea: la varianza intra-página del ancho de módulo en
> SECTOR y grupo C, contra el original, a 1440.** Un sí o un no. Sonda:
> extensión de `ancho-cuerpo` al nivel de **módulo** (hoy mide fila).

## 4 · Los 21 que no bloquean, y la sonda que les falta

Altos derivados del contenido · retícula de fila por familia (86 %/80 % = la
colección) · cajas de icono y separadores · `Footer` (ficha propia).

> **No existe hoy sonda que mida «el alto lo pone el contenido».** Todas comparan
> **un** contenido contra **un** original; esta clase necesita **el mismo
> componente con N contenidos** y que el alto **varíe** como varía el del
> original. `clase-rango` cierra con **dos** números: fidelidad (Δ0 por
> instancia) **y rango** (varianza>0 donde el original varía). **Sin el segundo
> no sirve, porque el defecto es precisamente «no varía».** Construirla es coste
> de esa tanda, dicho de antemano.

Más urgente de los 21: **`Breadcrumb max-w-[350px]`** — 28 rutas, ya cobrado en
**−33.25**. Que no bloquee el esquema no lo hace menos defecto.

## 5 · Recomendación de rumbo (la decisión es del propietario)

> **F2-1 arranca EN PARALELO, precedido de la medición corta de desbloqueo.**

1. **AHORA** · medición del ancho de módulo en SECTOR y grupo C. Corta, no
   construye nada, sale con un sí o un no.
2. **EN PARALELO** · F2-1 (esquema) con los content types ya decididos.
3. **DESPUÉS y sin prisa** · los arreglos CLASE contra los criterios del
   pre-registro, construyendo `clase-rango`.

**El riesgo mayor y el menos visible es NO arrancar**: el proyecto sigue puliendo
píxeles mientras el objetivo de negocio —salir de WordPress— no avanza, y **cada
ítem de CLASE parece justificado por sí solo**. La biblioteca es el instrumento
que prueba el modelo, no el entregable.

**Lo que NO se recomienda:** arrancar F2-1 **sin** la medición previa. Es la
única pieza donde equivocarse es cara de deshacer.

**ESCALÓN DECLARADO: no se disparó.** La única frontera que apareció (¿es
`anchoPct` campo fuera de MONOGRÁFICO?) falla dos de las tres condiciones —**la
arbitra una medición concreta** y **tiene precedente directo y medido**. Así que
no es decisión aplazada: es medición pendiente, y va de paso 1.

## 6 · LOS DOS BLOQUES SIGUIENTES

**Bloque A · ejecución de los arreglos CLASE.** Contra los criterios de
`docs/research/clase/PRE-REGISTRO.md` §PASO 3 —cada ítem con su sonda, sus
anchos, su instancia y su número—. Incluye **construir `clase-rango`**, que no
existe. Empezar por `Breadcrumb max-w-[350px]` (28 rutas).

**Bloque B · construir `articulos-kb`** (6 instancias, decidido en
`ESQUEMA-CMS.md` §2d.1): content type propio con `blurb`/`gallery` más las
definiciones comunes exportadas, y **su propia sonda comparadora de dos lados
desde la primera tanda** — *un arquetipo nuevo no hereda cobertura*, y el
arquetipo más reciente estaba tan descubierto como el más viejo.

## 7 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — 2026-08-04 o después, OBLIGATORIO otro día.** Las
   dos que hay son ambas del 08-03. Con ella en vuelo: **nada de `check` ni
   `build`**.
2. **Medición de desbloqueo** del ancho de módulo (§3) — precondición real de F2-1.
3. **Bloque A** (arreglos CLASE) y **Bloque B** (`articulos-kb`).
4. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
5. **Las 17 filas sin emparejar** de `ancho-cuerpo` — bloquean cerrar el grupo B.
6. **Comportamiento a 0/31** en la matriz de cobertura.
7. **La cola larga de páginas compuestas** (13 hubs) — `MonoSeccion[]` no la cubre.

## 8 · Lo que NO hay que hacer al empezar

- **No tratar los 31 como precondición de F2-1.** Son **10**, y se desbloquean
  con una medición.
- **No arreglar los 10 antes de medirlos.** Si el ancho de módulo no varía, son
  plantilla y no hay nada que arreglar — arreglar primero es cablear otra vez.
- **No construir `clase-rango` con un solo número.** Sin el eje de rango mide
  fidelidad y **se le escapa el defecto de esta clase**.
- **No leer el inventario a mano** (~8 ítems): está superado y contiene al menos
  un valor muerto. El bueno es `medidas/clase-censo.json`, derivado.

---

# HANDOFF — grupo D decidido: cinco preguntas, cinco predicados, cero argumentos

> ⚠ **Tanda 2026-08-03 (16.ª).** Siete pasos. Tanda de **DECISIÓN**: no se
> construyó nada, no se tocó `MonoSeccion[]`, y la única medida nueva es la que
> el propio pre-registro declaró pendiente. El método es el de
> `EXPERIMENTO-URBANO` y LH-2: **los predicados se commitearon ANTES de
> evaluarse** (`effb473`) y cada decisión es la rama que el pre-registro asignó
> al resultado que salió.

## 0 · Las cinco decisiones

| pregunta | decisión | predicado |
|---|---|---|
| **régimen** | **no hay tercero: es propiedad de la CAPA.** Capa `_tb_` plantillada (1 firma en 13/13) + capa propia de builder (varía). `CLAUDE.md` **corregido, no ampliado** | P-R1 ∧ P-R2 |
| **hub de KB** | **L4 de LH-2**: página compuesta por instancia → cola larga, **cero arquetipos**. No es LISTADO-B | ¬P-H1 ∧ P-H2 |
| **colecciones** | **UNA nueva: `articulos-kb`.** Los 7 hubs, fuera de colección | P-C + dependencia |
| **los 4 kinds** | tipo propio por arquetipo; **`MonoModulo` intacto** | ¬P-K1 ∧ P-K2 |
| **D2/D3** | **SIN OBJETO** — D1 bastó; no se autoriza construcción-instrumento | P-M1 |

Registro canónico: `ESQUEMA-CMS.md` **§2d.1** · acta: `docs/research/grupo-D/DECISION.md`.

## 1 · El hallazgo que paga la tanda: el régimen por CAPAS

La medida nueva (censo `_tb_` de las 13, congelada en
`medidas/grupo-d-plantilla.json`) dio **varianza CERO en la capa de plantilla**:
una sola firma (`header · body · footer×3`), sidebar 13/13, sticky 13/13,
`post_content` 13/13. Y la capa propia **varía** (composición en artículos,
1→11 secciones en hubs).

> **Los dos marcadores del `<body>` conviven porque los dos MECANISMOS
> conviven.** El marcador anuncia qué mecanismos hay; **quién decidió cada valor
> lo dice la varianza de su capa.** «Identifica el régimen de la página» pasa a
> «identifica el régimen de **cada capa**» — corrección aplicada en `CLAUDE.md`
> §Régimen con su evidencia.

Verificación cruzada: la re-derivación de `propias` del censo nuevo coincide con
el inventario congelado **en las 13** (0 desacuerdos).

## 2 · El hub no estrena nada — y lo dice un criterio de hace tres días

P-H1 falló limpio: **cero módulos de consulta** en los 7 hubs (y el instrumento
los ve: el control EDAR trae el kind `blog`). P-H2 se cumplió: oscilan
**1·1·5·5·7·7·11**. Eso es, literal, el casillero **L4 que LH-2 D1 ya había
decidido** para sus 6 hubs de builder: *página compuesta por instancia = cola
larga, cero arquetipos*. El matiz pre-registrado se respetó: las parejas casi
calcadas (`articulos-de-ayuda` ×2) son sub-formas de página compuesta, **no una
colección por parecido**.

## 3 · Colecciones: la pregunta «¿dos?» se disolvió

Con el hub en L4, queda **UNA colección nueva: `articulos-kb`** — 6 instancias,
forma uniforme (1 sección propia las 6), cuerpo de
texto/imagen/botón/`blurb`/`gallery`. El criterio de §1.5b aplicó tal cual
(fricción en las dos direcciones + separar-después-es-más-caro); no hubo que
argumentar por qué no valía.

## 4 · Los 4 kinds: dónde vive cada uno, y dónde NO

P-K1 falló (ninguno de los 4 aparece en SECTOR/MONOGRÁFICO medidos), así que:

- `blurb` · `gallery` → **unión propia de `articulos-kb`** cuando se construya,
  reutilizando por **definición exportada** lo común con `MonoModulo` (texto,
  imagen, botón, ritmo) — *lo que se duplica es el documento, no la definición*.
- `video` · `toggle` → pertenecen a los hubs = **cola larga**: su modelo se
  decide cuando se decida la cola larga. Modelarlos hoy sería modelar páginas
  que no se ha decidido construir.
- **Ninguno entra a `MonoSeccion[]`.** La prohibición del §6 pasa de cautela a
  **decisión ratificada** (sería el arreglo falso de §1.5b Razón 1).

## 5 · D2/D3, cerrados con la palabra correcta

**SIN OBJETO**, no «no se pudo»: eran confirmatorios de HD1 y su pregunta
desapareció con ella — medirlos exigiría construir con los kinds añadidos, o sea
medir **otro modelo**. La construcción mínima como instrumento **no se
autoriza**: no compraba información para ninguna decisión de esta tanda. Y la
vuelta del píxel queda dicha por la vía estándar: **un arquetipo nuevo no hereda
cobertura** — cuando `articulos-kb` se construya, sonda comparadora de dos lados
propia.

## 6 · Consecuencia nueva que antes no estaba escrita

La **cola larga de páginas compuestas** ahora son 6 hubs LH-2 + 7 hubs KB, y
**ya se sabe que `MonoSeccion[]` solo no la cubre** (usan `video`/`toggle`).
LH-2 la dejó apuntando a la hipótesis del grupo D; la hipótesis cayó. La cola
larga necesitará su propia decisión de modelo cuando toque — está anotado en
§2d.1.

## 7 · Verificación

- Pre-registro commiteado **antes** de evaluar (`effb473`); medida nueva
  congelada y commiteada **antes** de decidir (`982d9dc`).
- Consistencia cruzada censo nuevo ↔ inventario: **13/13, 0 desacuerdos**.
- `npm run check` 0 errores · `qa:lib` en verde · árbol limpio tras push.
- El servidor `next start` de la sesión de enlaces se **paró antes** del
  `check` (un build le cambiaría el `.next` por debajo).

## 8 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390` — OTRO DÍA (≥2026-08-04), obligatorio.** Cierra el
   −30 de EDAR@390, que sigue **SIN PROBAR**. Con ella en vuelo: nada de
   `check` ni `build`.
2. **Construir `articulos-kb`** cuando su prioridad llegue — con recon fino a
   dos anchos, content type propio (`blurb`/`gallery` + comunes exportados) y
   **su propia sonda de dos lados** desde la primera tanda.
3. **La cola larga de páginas compuestas** (13 hubs) — necesita decisión de
   modelo propia; `MonoSeccion[]` solo no la cubre.
4. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
5. **La retícula de la HOME** — va con C-QA3.
6. **El mecanismo del ±32.28** — sin identificar.
7. **Comportamiento a 0/31** en la matriz de cobertura.

## 9 · Lo que NO hay que hacer al empezar

- **No añadir `blurb`/`video`/`toggle`/`gallery` a `MonoSeccion[]`.** Ya no es
  cautela: es decisión con predicado (P-K, §2d.1).
- **No tratar los 7 hubs de KB como colección** por mucho que las parejas se
  parezcan — es el mismo veredicto L4 de los 6 de LH-2.
- **No leer el `<body>` como si el régimen fuera de la página.** Es de la capa;
  con los dos marcadores presentes, la varianza de cada capa dice quién decidió
  qué.
- **No correr `check` ni `build` mañana con la ráfaga 3 en vuelo.**

---

# HANDOFF — grupo D: HD1 rechazada, y la frontera sale doble

> ⚠ **Tanda 2026-08-03 (15.ª).** Cinco pasos. Tanda de **RECON**: no se escribió
> código, no se construyó nada, no se tocó `MonoSeccion[]`. El §6 del
> pre-registro lo prohibía hasta tener la respuesta, **y la respuesta llegó en
> D1**.

## 0 · El veredicto

> ❌ **HD1 RECHAZADA por D1.** `MonoSeccion[]` **no** expresa el cuerpo del grupo
> D: faltan **4 kinds de módulo** —`blurb` · `video` · `toggle` · `gallery`— y
> los necesitan **10 de las 13** páginas. **El grupo D cuesta arquetipo.**

D1 mandaba sobre D2 y D3 por el propio pre-registro (*«un cuerpo idéntico al
píxel después de añadir campos no prueba nada»*), así que **D2/D3 no se evalúan**:
medirlos exigiría construir, que es lo que D1 acaba de declarar caro.

## 1 · Lo primero que salió, y no estaba en el enunciado

**«13 páginas» no son 13 artículos.** Son 13 URLs, y la cuenta de secciones
propias las parte sin ambigüedad:

| forma | n | secciones propias | varianza |
|---|---|---|---|
| **artículo de KB** | **6** | **1** en las 6 | **cero** ⇒ plantilla |
| **hub / índice** | **7** | 1 · 1 · 5 · 5 · 7 · 7 · 11 | **1 → 11** ⇒ campo |

Son **dos formas**, y probablemente dos colecciones. Meterlas en el mismo saco
era un supuesto del enunciado, no una medida.

## 2 · PASO 1 · Régimen, verificado en las 13

**13 de 13: `page-template-default` + `et_pb_pagebuilder_layout` ⇒ BUILDER.**
Leído en el `<body>` servido de cada una, no heredado de la familia.

Pero llevan **además** `et-tb-has-body`, así que contra los controles:

| | tpl | secc. `_tb_body` | propias |
|---|---|---|---|
| SECTOR · MONOGRÁFICO | `sectors` | **0** | 7 · 8 |
| grupo A (blog) | `single-post` | **3** | **0** |
| **grupo D** | `default` | **1** | 1 … 11 |

> **El grupo D es HÍBRIDO y no cae en ninguno de los dos casilleros de
> `CLAUDE.md`**: plantilla de theme-builder que pone cascarón **más** una sección
> propia del builder dentro. La lectura de builder vale **para la sección
> propia**; el resto lo fijó quien construyó la plantilla.

## 3 · PASO 2 · El criterio en el instrumento, y lo que costó

`mono-cmp` corta el cuerpo del original entre la miga «InicioSectores» y el
`et_pb_fullwidth_section`. Medido, con el control discriminando:

| | miga «InicioSectores» | `fullwidth_section` |
|---|---|---|
| KB artículo · KB hub | **NO** | **NO** |
| CONTROL monográfico | **SÍ** | **SÍ** |

**Coste contado ANTES de tocar nada, y no se tocó:**

| # | modificación necesaria |
|---|---|
| 1 | otro ancla de miga (la del KB dice «Soporte / Centro de ayuda») |
| 2 | otro ancla de cierre (no hay slider de ancho completo) |
| 3 | otro `+2` en la rebanada (salta banda de clientes + hero **de SECTOR**) |
| — | **y el lado del CLON no existe**: son comparadores de dos lados |

**Tres modificaciones del corte y un lado ausente**, todo antes de mirar un píxel
de contenido. Por el contrapositivo del criterio, eso **es** coste de arquetipo.

> **Y una nota honrada sobre el criterio:** no se puede evaluar **entero** sin
> construir, porque falta el lado del clon. Lo que sí se evalúa sin construir es
> el lado del original, y ahí ya falla. No se forzó el resto — D1 ya había
> cerrado.

Las sondas **fallan en voz alta** (`avisoCorte`): no habrían dado verde falso.

## 4 · PASO 3 · 13 instancias, y qué decide la comparación

Inventario acotado a las **secciones propias**.

> ⚠ **El selector se validó contra los controles primero.** La primera versión
> buscaba `<section>` y dio **0 propias en el control**, donde hay 8 — **selector
> muerto, no un cero** (regla 4). Divi las emite como `<div class="et_pb_section">`.
> Corregido, el control da **8 y 7**: los valores conocidos.

Y la comparación de 13 —la lección de Industria, *una sola no distingue plantilla
de campo*— decide esto:

| propiedad | varianza intra-forma | veredicto |
|---|---|---|
| secciones propias en artículos | **0** | plantilla |
| secciones propias en hubs | 1 → 11 | **campo** |
| barra lateral pegajosa | **0** (13/13) | plantilla |

## 5 · PD3 acertó en el QUÉ y falló en el DÓNDE — y eso la mejora

PD3 predijo que la barra lateral sería la frontera. **Lo es.** Pero:

```
et_pb_section_0_tb_body   ← PLANTILLA: sidebar SÍ · sticky SÍ · post_content SÍ
  └── et_pb_section_0     ← PROPIA: sidebar ·  · sticky ·
```

> **Está en 13 de 13 y siempre en la PLANTILLA, nunca en la sección propia.** No
> es un campo de `MonoColumna`: es **cascarón**, como la cabecera y el pie.

**Y es mejor noticia que la prevista:** una barra lateral que fuera campo de
columna **contaminaría el content type de MONOGRÁFICO**. Siendo cascarón, el
content type se salva y lo que cuesta es **una plantilla de página**.

El aviso del recon de listados quedó atendido de paso: `barraLateral` daba falsos
positivos cazando el área de widgets **del pie**. Medido por sección, **el control
monográfico da NINGUNO en el cuerpo teniendo sidebar en el pie** — discrimina.

| | predicción | resultado |
|---|---|---|
| PD1 · retícula y ritmo | entran | ✅ acierta |
| PD2 · texto/imagen/botón | entran | ✅ acierta — 3 de 6 artículos solo usan eso |
| PD3 · la barra lateral falla | falla | ✅ acierta, **un nivel más arriba** |
| PD4 · el `blurb` | «según qué sea» | ❌ **falla** — 36 · 18 · 18 |

## 6 · PASO 4 · La familia de calibración, ESPERADA

**No hay Δ que adjudicar: no se construyó nada.** Lo que se deja escrito es la
expectativa, para que no se lea al revés cuando llegue:

> El grupo D sería el **TERCER cuerpo** sobre cascarón compartido. Así apareció
> el **−36.02**: un ancho mal que **ningún ancho enseñaba** porque los titulares
> de las 4 instancias vivas eran cortos, y que solo salió cuando el MONOGRÁFICO
> trajo titulares largos.

1. **Cualquier Δ es candidato a defecto DEL COMPONENTE COMPARTIDO** antes que del
   grupo D. Se adjudica contra el original **una a una**.
2. **Los títulos del grupo D son largos** (`por-que-kunak-air-es-la-mejor-estacion-de-calidad-del-aire`):
   es justo el contenido que destapa anchos mal puestos.
3. Su cascarón es **distinto** del de SECTOR (sin banda de clientes ni slider),
   así que **no hereda su calibración**.

## 7 · PASO 5 · Esquema actualizado EN esta tanda

`ESQUEMA-CMS.md` **§2d** nuevo. Ojo a la dirección, que es la contraria a la
prevista: **HD1 rechazada significa que `MonoSeccion[]` NO gana un consumidor** —
el grupo D es arquetipo propio, previsiblemente **dos colecciones** (artículo y
hub), por la misma razón que §1.5b separó SECTOR de MONOGRÁFICO.

**Los 4 kinds NO se han añadido**, igual que los tres campos de §1.3 siguen sin
añadirse: **la frontera se documenta, no se borra.**

## 8 · Campaña `cqa6-390` · ráfaga 2 hecha

`rafaga-2026-08-03T11-58-27.json`, **2.31 h** de separación, `✓ 18/18 cargas`.
`h1` a **0** en las tres @390 otra vez — sigue sin verse el ±30.

> ⚠ **Estado: 2 de 3 · UN solo día.** **La ráfaga 3 tiene que caer OTRO DÍA
> (≥2026-08-04).** Aquí los dos días **no venían dados** como en `cqa6`: con las
> tres del 08-03 la campaña **no cierra**, por muy separadas que estén.

El `docH`/`pie` sí se movió (27 · 54): familia conocida de «Artículos y Guías»,
no la base.

## 9 · Lo que queda abierto, por prioridad

1. **Ráfaga 3 de `cqa6-390`, otro día.** Cierra el −30 de EDAR@390, que sigue
   **SIN PROBAR**.
2. **Decidir el grupo D**: construirlo como arquetipo (2 formas) o aplazarlo con
   acta. La frontera ya está medida, así que **la decisión es de prioridad, no de
   información**.
3. **¿El hub de KB es un listado de §2c** o una tercera cosa? Es lo único que el
   recon deja sin cerrar del grupo D.
4. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
5. **La retícula de la HOME** — 86.35/85 % contra 86 %.
6. **El mecanismo del ±32.28** — sin identificar; Rocket Loader descartado.
7. **Comportamiento a 0/31** en la matriz de cobertura.

## 10 · Lo que NO hay que hacer al empezar

- **No añadir los 4 kinds a `MonoSeccion[]`** «ya que sabemos que faltan». Eso es
  exactamente lo que §6 del pre-registro prohibía, y el motivo sigue vivo: el
  modelo de MONOGRÁFICO está medido contra 2 instancias y no debe crecer por una
  hipótesis de otro grupo.
- **No leer «grupo D = 13 páginas» como una forma.** Son **dos**: 6 artículos y
  7 hubs, con varianza de secciones 0 y 1→11.
- **No tratar la barra lateral como campo de columna.** Es cascarón.
- **No dar `cqa6-390` por cerrable hoy**: le falta un DÍA, no una ráfaga.

---

# HANDOFF — el instrumento cerrado: la escala del fenómeno, 180 cargas y los 9 mínimos

> ⚠ **Tanda 2026-08-03 (14.ª).** Cinco pasos. Tanda de **INSTRUMENTO**: no se
> tocó el clon. Con esto **el instrumento queda cerrado** y lo que venga después
> es construcción.

## 0 · El titular: el protocolo medía en días y el fenómeno pasa en segundos

Lo dicen los datos de la campaña que cerró C-QA6. La ráfaga 1 tiene las
transiciones medidas **carga a carga**:

| carga | `/software` | EDAR | petróleo |
|---|---|---|---|
| #1 | 389.11 **bajo** | 228.88 **bajo** | 228.88 **bajo** |
| #2 | 389.11 **bajo** | 261.16 **ALTO** | 261.16 **ALTO** |
| #3 | 421.39 **ALTO** | 261.16 alto | 261.16 alto |

**Los monográficos saltan entre #1 y #2; `/software` entre #2 y #3.** Cargas
consecutivas: **segundos**.

> **La variable que discrimina es el NÚMERO DE CARGAS, no el reparto en días.**
> 3 ráfagas en 3 días dan **9 cargas** por combinación; una sentada de 60 da
> siete veces más muestreo **en una tarde**. El protocolo gastaba días para
> comprar algo que se compra con cargas.

**No se deroga: se le añade la regla 4.** Los dos ejes compran cosas distintas y
ninguno sustituye al otro — los días protegen de leer una tarde rara como suelo
permanente; **las cargas muestrean los estados**. Una campaña con 3 días y 9
cargas está **bien separada y mal muestreada**, y hasta hoy eso no se podía ni
enunciar.

## 1 · Y por eso «un solo estado a 390» no era una conclusión

`estados-390`, sonda nueva: **60 cargas × 3 rutas = 180, una sentada**.
Resultado: **un solo estado en las tres** (`308.58` · `189.39` · `189.39`), cero
variación.

**Cómo se reporta un cero de muestreo sin convertirlo en prueba de ausencia** —
se escribe **la cota**, no la conclusión:

| | 1440 | 390 |
|---|---|---|
| estados | **2** | **1** |
| tasa del raro | **4/27 ≈ 15 %** | **0/60 por ruta** |
| cota 95 % (regla de tres) | — | **< 5 % por carga** |

> Si a 390 hubiera un segundo estado con la tasa de 1440, no verlo en 60 cargas
> tendría probabilidad **6.6 × 10⁻⁵**. **390 no se comporta como 1440 — medido,
> no supuesto.** Pero una tasa mucho menor sigue cabiendo: esto **acota**, no
> cierra.

**Y el reparto de ejes que deja, que es lo reutilizable:** un cero en el eje de
las cargas **no puede** contestar una hipótesis **episódica**. Si la condición va
ligada a un momento y no a una carga, 180 cargas de una tarde no la ven **por
construcción**. Para eso está la separación en días.

| eje | instrumento | estado |
|---|---|---|
| **cargas** — ¿hay un segundo estado FRECUENTE? | `estados-390` (180) | ✅ **cerrado**: no lo hay |
| **días** — ¿hay una condición EPISÓDICA? | `cqa6-390` (1 de 3) | ⏳ **abierto** |

**`cqa6-390` queda CONFIRMADA, no sustituida.** Su pre-registro decía que si
aparecía un segundo estado cambiaría de sentido; no apareció, así que sigue en
pie con sus ráfagas 2 y 3.

## 2 · La cadena de custodia, cerrada con un número

Barrido de **343 ficheros** congelados buscando la firma de una 404 contada como
página: **2795 valores `docH`**, de los que **52 eran dispersiones** de `ruido`
(no alturas — descartadas), **2743 alturas absolutas**.

> **404 accidentales colocadas como página: CERO.**

La firma aparece **3 veces, las 3 negativos deliberados**. Dos estaban bien
marcadas; la tercera no, y es un caso que la regla 7 no contemplaba:

> **Un fichero que es medida Y artefacto A LA VEZ.** `c-cmp-1440-2026-08-01-3`
> tiene **31 filas genuinas + `/RUTA-INVENTADA`**, que `c-cmp.mjs:84` solo añade
> bajo `SABOTAJE`. Renombrado a `…-neg-ruta` **por procedencia** (la corrida fue
> un negativo), con `meta.neg` dentro diciendo que las 31 son buenas — si no, el
> marcador se leería como que todo el fichero es basura.

Hallazgo adicional: **12 ficheros llevan errores congelados y 8 no lo declaran
en el nombre**. Ninguno es una 404 contada como página: son timeouts, red caída
y el `ERR_CONNECTION_REFUSED` ya documentado, **todos registrados COMO error**,
que es el comportamiento correcto. Los dos 404 reales (`_global-error`,
`_not-found` en `ancho-cuerpo-1440.json`) son **historia ya arreglada** — el
filtro está en `ancho-cuerpo.mjs:55` desde `a089ba2` y solo el fichero más viejo
los tiene.

## 3 · Los 9 mínimos, uno por commit

| sonda | antes | ahora | invariante que ahora sí expresa |
|---|---|---|---|
| `dos-rutas` | 1 | **2** | se llama *dos*-rutas: una sola no es media comparación |
| `mono-cmp` | 1 | **2** | `[original, clon]`: sin los dos lados no compara |
| `tree-cmp` | 1 | **2** | su veredicto es «N en el original · M en el clon» |
| `a-ids` | 1 | **`1+OTRAS.length`** | recorre `[PAGINA, ...OTRAS]` (8) |
| `c-behaviors` | 1 | **`CASOS+FAQS+INDICES`** | itera las tres listas (9) |
| `corte-cuerpo` | 1 | **`RUTAS.length`** | el «suelo flojo» del `12/1` |
| `offsets` | 1 | **`rutaB ? 2 : 1`** | el mínimo es del **MODO**, no de la sonda |
| `c-muestra` | 3 (formas) | **16 (páginas)** | numerador y denominador en la misma unidad |
| `esqueleto` | 9 (formas) | **16 (páginas)** | idem |

**El que casi cuela, y merece leerse:** en `c-muestra` la corrección obvia era
`minimo = Σ muestra.length`… y `total` **ya se define como esa misma suma**. Eso
habría dado un listón idéntico **por construcción**: un contrato que **no puede
fallar nunca**, o sea cambiar un verde vacío por otro **con pinta de arreglado**.
El listón sale de las **ENTRADAS** (`Σ min(cupo, total)`), nunca de la salida.

Y `c-behaviors` es el que más importaba: es la sonda del eje **comportamiento**,
el que está a **0/31** en la matriz de cobertura. **El hueco peor cubierto tenía
el contrato más flojo.**

## 4 · Dos defectos encontrados en lo que escribí, no en lo heredado

- **`estados-390`, en su propio test en negativo:** con 0 cargas válidas
  imprimía igualmente el párrafo de «un solo estado» — la **6.ª instancia de
  «0 comparado = verde»**, dentro de la sonda escrita para medir un muestreo
  insuficiente. Corregido antes de la corrida buena.
- **La hipótesis del grupo D estaba citada en una ruta que no existe.** El
  TRASPASO apuntaba a `monografico-tecnico/HIPOTESIS-GRUPO-D.md` y vive en
  `arquetipo-A/`. Quien siguiera el traspaso abriría una ruta muerta y concluiría
  que el pre-registro nunca se escribió — **comprobar el destino no distingue
  «nunca existió» de «está en otro sitio»**.

## 5 · Verificación

`qa:lib` **69/69** · **las 49 sondas compilan y declaran su mínimo (0 sin
contrato)** · `c-muestra` re-corrida en vivo → `✓ evaluadas 16/16` **y salida
congelada idéntica** (el arreglo es de contrato, no de medida) · `estados-390`
→ `✓ 180/180 cargas, 0 selectores muertos` · negativo de `estados-390` → **exit
2** con el ancla saboteada · `npm run check` **0 errores**.

**Ningún `build` en vuelo mientras una sonda medía**, y las medidas commiteadas
antes de escribir las actas.

## 6 · SIGUIENTE FRENTE — la hipótesis del grupo D

**Con el instrumento cerrado, lo que viene es construcción.** El frente es
`docs/research/arquetipo-A/HIPOTESIS-GRUPO-D.md` (⚠ **en `arquetipo-A/`**, no en
`monografico-tecnico/` como decía el traspaso):

- **Pre-registrada el 2026-07-30, sin ejecutar**, con `PD1`–`PD3` escritas
  **antes de mirar** — por la misma razón que `EXPERIMENTO-URBANO.md`, que ya se
  corrió una vez y dio resultado limpio.
- **13 páginas** (artículo de centro de ayuda). `RECON-LISTADOS.md` §3 ya midió
  que **no es de la familia editorial**: lleva `et_pb_pagebuilder_layout`, tiene
  **secciones propias de la instancia** y su cuerpo lo **compone el editor** —
  o sea es **página de BUILDER**, del mismo tipo que SECTOR y MONOGRÁFICO.
- **`HD1`: si `MonoSeccion[]` expresa el cuerpo de las 13 sin campos nuevos,
  esas 13 páginas NO cuestan un arquetipo: cuestan datos.** `HD0`: hacen falta
  campos, y entonces el grupo D es arquetipo propio **con su razón escrita**.
- El protocolo está en su §3 y es el que ya funcionó: recon primero, transcribir
  **una** solo con campos existentes, criterios con orden de mando.

## 7 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
3. **Ráfagas 2 y 3 de `cqa6-390`** — la 2 a ≥2 h de la 1 (09:39 del 08-03); **la
   3 en OTRO DÍA obligatoriamente**. Hasta que cierren, el **−30 de EDAR@390
   sigue SIN PROBAR**, y ya se sabe que **no** lo resuelven más cargas.
4. **El mecanismo del ±32.28** — sin identificar. Rocket Loader **descartado**
   (`S 0 / N 54`). Hace falta una ráfaga **con transición Y con observable**.
5. **Las 17 filas sin emparejar** del eje horizontal, y su RANGO sin probar.
6. **Migrar a `iniciarClon()` las 45** que aún esperan un 3000 ajeno.
7. **Comportamiento a 0/31** en la matriz — el hueco mayor, y ahora con
   `c-behaviors` bien acotada para atacarlo.

## 8 · Lo que NO hay que hacer al empezar

- **No leer el suelo de 32.28 como un umbral.** Son **dos picos**: `≈0` limpio,
  `≈32.28` limpio, **cualquier otro valor defecto — incluidos los menores**.
- **No escribir «390 es unimodal».** Se escribe la **cota**: `< 5 %` por carga.
- **No pedirle al eje de las cargas que conteste una hipótesis episódica**, ni al
  revés. Cada uno contesta lo suyo y hay que decir cuál se está contestando.
- **No dar por resuelto el −30** ni tratarlo como defecto: sigue **SIN PROBAR**,
  y la decisión se toma **con las dos ráfagas hechas**, por el criterio
  pre-registrado y no por cansancio.
- **No correr `check` ni `build` con una sonda en vuelo.**

---

# HANDOFF — los flecos de C-QA6: el suelo bimodal NO es un umbral

> ⚠ **Tanda 2026-08-03 (13.ª), continuación de la 12.ª.** Cuatro pasos. Tanda de
> **LECTURA**: no se tocó el clon y solo se midió una ráfaga. Lo que cambia es
> **cómo se lee** un suelo que ya estaba medido — y de paso corrige el acta de
> la tanda anterior, que lo escribió como umbral.

## 0 · El titular, y corrige a la tanda de esta misma mañana

El acta del cierre escribió: *«todo residuo < 32.28 es indistinguible del estado
del original»*. **Eso es leer el suelo como un umbral, y el propio hallazgo
bimodal lo desmiente:**

> **No es una banda de 0 a 32.28: son DOS PICOS separados por 32.28 exactos, y
> entre ellos NO HAY MASA** — en las 27 cargas @1440 de `cqa6` no salió ni un
> solo valor intermedio.

| Δ | lectura |
|---|---|
| **≈ 0** | original en estado alto, el clon casa. **Limpio.** |
| **≈ 32.28** | original en estado bajo, casa con el otro pico. **Limpio.** |
| **cualquier otro** | **DEFECTO — incluidos los MENORES que 32.28.** |

**Leerlo como umbral habría tapado defectos de hasta 32 px en las rutas peor
conocidas del proyecto.** Un Δ de 12 no es «ruido pequeño»: es un valor que el
original **nunca ha producido**.

> **Forma general, que es lo reutilizable:** *un suelo acota solo si la
> distribución es UNIMODAL; si tiene picos, **discrimina**.* Por eso un suelo se
> publica con **su forma**, no solo con su número — «32.28» a secas invita
> justo a la lectura equivocada.

## 0bis · Y el Δ0 estaba redactado sin su condición

Las medidas congeladas dicen algo que el acta anterior no recogió: en **las 6**
corridas de `c-cabecera` que midieron `/software` el original salió **siempre**
en 421.39, y en **las 5** que midieron los monográficos, siempre en 261.16. **El
estado bajo nunca se dejó ver por `c-cabecera`**, y el clon se calibró contra lo
único que había delante:

```text
ANTES    clon 373.39  →  vs bajo 389.11 = −15.72  ·  vs alto 421.39 = −48.00
DESPUÉS  clon 421.39  →  vs bajo 389.11 = +32.28  ·  vs alto 421.39 =   0.00
```

> **El −15.72 no desapareció: hoy es +32.28.** Mover el clon no quitó la
> discrepancia contra el estado bajo — **cambió contra cuál de los dos estados
> el clon es exacto**. Ningún valor fijo da 0 contra los dos.

Así que **«Δ0» aquí es una afirmación CONDICIONADA AL ESTADO** y se redacta
así: *Δ0 **contra el estado alto***. Calibrar contra el alto fue deliberado —es
el dominante: 6/6 en `c-cabecera`, 2/3 en ráfagas, **23 de 27** cargas— y el
punto medio habría dado ±16.14 contra los dos, **fallando los dos**.

## 0ter · Predicción PRE-REGISTRADA, con falsador

Escrita **antes** de observarla, que es lo que la separa de un relato. Cuando el
original caiga en el estado bajo, `c-cabecera` imprimirá **+32.28 exactos**, de
forma **simultánea dentro de cada grupo**, y los grupos son **dos** —`/software`
por un lado; EDAR y petróleo por otro—. Que van por separado **está medido**,
carga a carga en la ráfaga 1 de `cqa6`:

| carga | `/software` | EDAR | petróleo |
|---|---|---|---|
| #1 | 389.11 **bajo** | 228.88 **bajo** | 228.88 **bajo** |
| #2 | 389.11 **bajo** | 261.16 **ALTO** | 261.16 **ALTO** |
| #3 | 421.39 **ALTO** | 261.16 alto | 261.16 alto |

El hueco es **32.28 en los dos grupos** pese a bases distintas
(`421.39−389.11` y `261.16−228.88`): **un solo mecanismo, sin identificar**.

> **FALSADOR:** cualquier lectura que **no sea ni ≈0 ni ≈32.28** tumba el modelo
> y reabre el mecanismo. También lo tumbaría un tercer estado, o que los dos
> monográficos dejaran de ir clavados.

**Sin contrastar todavía:** las 9 cargas @1440 de `cqa6-390` salieron las 9 en
alto. Consistente, **y no es evidencia a favor** — para eso hay que ver el bajo.

## 0quater · Rocket Loader: DESCARTADA, y la campaña de 390 en marcha

- **Detectores retirados** (`rocketToken`, `rocketLoader`), que es la cláusula
  que `ruido.mjs` tenía **pre-registrada** para el cierre de campaña. **No
  borrados en silencio:** `S 0 / N 54` queda escrito como hipótesis
  **DESCARTADA** con su recuento y sus fechas. ⚠ **Lo cerrado es el detector, no
  la pregunta:** el mecanismo sigue **sin identificar**. Test en negativo
  re-corrido: `SABOTAJE=detector` saca los dos sabotajes NO VALIDADOS — la regla
  del cero y la del pleno en una corrida.
- **Campaña `cqa6-390` arrancada**, porque *«no hay forma de dirimirlo»* no es un
  estado en el que este proyecto se quede. Ráfaga 1 hecha
  (`rafaga-2026-08-03T09-39-47.json`, `✓ 18/18 cargas`): `h1` a **0** en las
  tres @390. **Faltan 2**, y aquí **la 3 tiene que caer otro día
  obligatoriamente** — la ráfaga 1 es del 08-03 y no regala días como en `cqa6`.
  **Hasta que cierre, el −30 de EDAR@390 sigue SIN PROBAR**, con esa etiqueta.

---

# HANDOFF — C-QA6 cierra a 1440, el −15.72 se disuelve, y un `rm` deja un cabo que no se puede atar

> ⚠ **Tanda 2026-08-03 (12.ª).** Los cuatro pasos del encargo. Tanda de
> **MEDICIÓN Y REGISTRO**: no se tocó el clon. Lo que cambia es qué Δ se pueden
> leer en 3 rutas, y qué dos afirmaciones dejan de estar pendientes.
>
> ⚠ **CORREGIDA por la tanda 13.ª, arriba**, en dos puntos: su §4 leyó el suelo
> como **umbral** (no lo es, son dos picos) y su «Δ0» va **condicionado al
> estado**. Lo demás sigue en pie.

## 0 · El titular

C-QA6 pedía **fijar el suelo de ruido** de `/software` y los dos monográficos, y
con él resolver el **−15.72 de `/software`**, que llevaba semanas SIN PROBAR por
debajo del episodio de ±32.28. La campaña cierra, y la respuesta es mejor que la
que se buscaba:

> **El −15.72 no era un residuo pendiente de medir: era el −48 leído contra el
> otro estado de un original BIMODAL.** El clon valía 373.39 y el original
> oscila entre 389.11 y 421.39. `389.11 − 373.39 = 15.72`;
> `421.39 − 373.39 = 48`; y **la diferencia entre los dos «defectos» es
> exactamente el suelo, 32.28**. Un clon, un defecto, dos números según qué
> estado pillara la corrida.

Y ese defecto **ya estaba arreglado**: el clon pasó a 421.39 y las 4 corridas
posteriores de `c-cabecera` lo dan a Δ0. C-QA2 · `/software` no necesitaba un
objetivo nuevo; necesitaba saber que sus dos candidatos eran el mismo.

## 1 · Antes de medir: las 3 ráfagas, en UNA escala

Las ráfagas 1 y 2 se archivaron con sello **UTC**; la 3 salía en **local**. Como
el criterio de la campaña —«≥2 h y ≥2 **días** distintos»— se comprueba
**leyendo esos nombres**, mezclarlas habría metido **5 h de error en el propio
veredicto de separación**. Re-etiquetadas **antes** de correr la 3 (`9787f68`):

| se archivó como | pasa a llamarse | día |
|---|---|---|
| `rafaga-2026-07-31T03-14-57.json` | `rafaga-2026-07-30T22-14-57.json` | 07-31 → **07-30** |
| `rafaga-2026-08-02T17-33-41.json` | `rafaga-2026-08-02T12-33-41.json` | 08-02 (igual) |

**RE-ETIQUETADO, no re-medición — y probado, no afirmado.** Contra lo que git
guarda del fichero viejo: `resumen` y `crudo` con el **mismo sha256**, el resto
del `meta` idéntico, y el instante conservado (el sello viejo en UTC **es** el
`ts` nuevo). Dos fuentes independientes concuerdan en el −5 h: el `mtime` y la
fecha del commit que congeló cada uno. Con `git mv`. El nombre viejo va **dentro
del fichero** (`meta.reetiquetado`) porque **tres** documentos lo citaban.

> **El barrido de citas encontró 8, no las 2 que se sabían** — en
> `PENDIENTES-QA`, `HANDOFF` y `TRASPASO`. Todas actualizadas.

Y desde esta tanda el fichero lleva **`meta.escala`**: la escala se **declara**,
no se deduce del nombre. Mientras no lo llevó, la única forma de saber en qué
escala estaba un sello era mirar el `mtime` — **un dato que vive fuera de la
medida y que un `git clone` reescribe**.

## 2 · La campaña: COMPLETA

```
RUTAS=/software…,/…-en-edar,/…-petroleo-y-gas CAMPANA=cqa6 npm run qa:ruido -- 3
→ medidas/campana/cqa6/rafaga-2026-08-03T08-28-44.json
✓ evaluadas 18/18 cargas · ruido · 0 selectores muertos
```

`3 ráfagas · 3 días · separadas ≥2h (3)`. Separaciones **calculadas del `ts`
absoluto**, no estimadas: **62.31 h** (1→2) y **19.92 h** (2→3).

> **Cómo cierran 3 ráfagas, que es lo que se va a preguntar.** Los ≥2 días son
> un **mínimo**, no un reparto de una ráfaga por día: las ráfagas 1 y 2 ya
> aportaban los dos (30 jul · 2 ago), así que **la 3 podía caer el mismo día que
> la 2 y habría cerrado igual**. Cayó en un tercero (08-03) y salieron 3, pero
> eso es holgura. Y **el re-etiquetado no regaló el día**: movió la 1 de 07-31 a
> 07-30, que sigue siendo distinto de 08-02.

## 3 · El hallazgo: el `h1` es BIMODAL, no tembloroso

54 cargas dan **exactamente dos estados** por combinación, a 32.28 clavados:

| ruta @1440 | bajo | alto | Δ |
|---|---|---|---|
| `software` | 389.11 | 421.39 | 32.28 |
| `edar` · `petroleo` | 228.88 | 261.16 | 32.28 |

**El estado bajo se vio SOLO en la ráfaga 1.** Las ráfagas 2 y 3 y las **6**
corridas de `c-cabecera` cayeron todas en el alto.

> ⚠ **La consecuencia que hay que leer antes de tocar estas 3 rutas: el clon
> tiene UN valor fijo y el original tiene DOS.** No existe un valor fijo que case
> con los dos, así que su «Δ0» es **Δ0 contra el estado dominante**. **Si una
> corrida futura pilla el estado bajo, las tres marcarán +32.28 y eso NO es una
> regresión.** Recalibrar entonces sería fabricar la FAMILIA DE CALIBRACIÓN
> contra la que avisa `CLAUDE.md`.

## 4 · Lo que la campaña NO cierra, y por qué

**(a) El ancho de 390 — y no lo impidió la medición, lo impidió un `rm`.**
Las 3 ráfagas exhibibles dan **0** a 390 en las tres rutas (9 cargas cada una).
Pero la **ráfaga A** del 2026-07-30 midió **±30 en las tres @390**, y **su
fichero se borró a mano**. El suelo es «el máximo ENTRE ráfagas»: si la A
contara, sería **30**, no 0.

> Consecuencia concreta: el **−30 de `/…-en-edar` a 390** es «defecto claro» o
> «exactamente el suelo» según cuente o no esa ráfaga, y **no hay forma de
> dirimirlo**. `±30` contra `−30` es demasiada coincidencia para descartarla a
> ojo.
>
> **El borrado a mano se cobra por segunda vez, y más caro.** Hasta hoy era *«el
> número mejor pagado de la tanda es el único que no se puede exhibir»*. Ahora
> es **una decisión que no se puede tomar.** Lo cierra una ráfaga más a 390.

**(b) El MECANISMO.** La campaña fija el suelo; el *por qué* sigue abierto, y la
sonda lo imprime sola:

```
observable de mecanismo: presente en 1/3 ráfaga(s) · transiciones registradas CON observable: 0
```

Es un desencuentro de calendario: **el observable se añadió DESPUÉS de la ráfaga
1**, que es **la única con transición**. Las ráfagas 2 y 3 lo llevan pero no
cambiaron de estado — y eso se reporta *«aquí no se puede evaluar»*, no *«el
observable no sirve»*. Hace falta **una ráfaga con transición Y con observable**,
y no se provoca a demanda.

**Los dos detectores siguen NO VALIDADOS** tras 18 cargas más (54 en total):
`rocketToken` y `rocketLoader`, S 0 / N 18. No se citan en ninguna dirección.

> **Fichado, no hecho:** la propia sonda tiene escrito que un detector sin
> validar **al cerrar la campaña se retira**. La campaña ya cerró, así que toca
> retirarlos o reescribirlos — decisión sobre la sonda, no parte del cierre de
> C-QA6, y no se hace de tapadillo.

## 5 · Verificación

- `qa:lib` **69/69** · las **48 sondas compilan y declaran su mínimo** (0 sin
  contrato).
- Ráfaga 3 con `✓ evaluadas 18/18 cargas`, **0 selectores muertos**, y
  `meta.ts` + `meta.escala` comprobados **antes** de leer nada.
- Re-etiquetado probado por hash contra `git show HEAD:<fichero viejo>`.
- **Ningún `build` en vuelo** mientras la sonda medía.
- Las tres ráfagas commiteadas **antes** de escribir el acta.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
3. **El −30 de `/…-en-edar` a 390** — SIN PROBAR y **no dirimible** hasta otra
   ráfaga a 390 (§4a). No es un arreglo pendiente: es una medición pendiente.
4. **Los mínimos que no expresan su invariante**: **6** (`a-ids` · `c-behaviors`
   · `corte-cuerpo` · `dos-rutas` · `mono-cmp` · `tree-cmp`) **+1 a medias**
   (`offsets --cmp`) **+2 con denominador en otra unidad** (`c-muestra` 16/3,
   `esqueleto` 16/9). **Vivo y sin tocar en esta tanda.**
5. **`openPage` no cubre las 6 sondas que cuentan a mano** (`a-behaviors` ·
   `a-cascaron` · `a-miga` · `c-bases` · `clon-base` · `cmp-sector`): pueden
   sumar tras una 404. Para ésas el aviso es la línea gritada, no el contrato.
   **Vivo y sin tocar en esta tanda.**
6. **Las 17 filas sin emparejar** del eje horizontal, y su RANGO sin probar.
7. **Migrar a `iniciarClon()` las 45** que aún esperan un 3000 ajeno.
8. **Los 2 detectores sin validar** de `ruido` (§4b).
9. **El comportamiento sigue a 0/31** en la matriz de cobertura — el hueco mayor.

## 7 · Lo que NO hay que hacer al empezar

- **No leer el «Δ0» de estas 3 rutas como incondicional.** Es Δ0 **contra el
  estado dominante**; un +32.28 futuro es el original, no una regresión.
- **No escribir «el suelo a 390 es 0».** Es 0 **entre las ráfagas exhibibles**,
  con un ±30 documentado que lo contradice y no tiene fichero.
- **No reabrir el −15.72 de `/software`.** No es un residuo: es el −48 medido
  contra el otro estado, y el −48 ya está arreglado.
- **No citar `rocketToken`/`rocketLoader`**: 0 de 54 cargas en `S`.
- **No restar sellos de ráfaga sin mirar `meta.escala`.** Las tres están en local
  desde `9787f68`, pero cualquier fichero anterior a esa fecha en otra campaña
  puede seguir en UTC.
- **No borrar una medida a mano para dejar sitio a otra.** Es la segunda vez que
  se paga en este mismo expediente, y esta vez costó una decisión, no un número.

---

# HANDOFF — las 48 sondas corridas en vivo: el verde era MUDO en 47

> ⚠ **Tanda 2026-08-02 (11.ª).** Los cinco pasos del encargo. Tanda de
> **INSTRUMENTO**: no se midió fidelidad y **no se tocó el clon**. Lo que cambia
> es qué puede salir verde, dónde se congela la evidencia y con qué fecha.

## 0 · El titular, y es el que cambia cómo se lee todo lo demás

La tanda anterior migró las 48 sondas al contrato de `Evaluadas` y cerró
diciendo: *«las 47 compilan y declaran; si alguna falla, fallará en voz alta»*.
**Correrlas era la comprobación que faltaba**, y lo primero que sacó fue esto:

> **El HANDOFF anterior escribió «no leer un verde sin la línea de unidades:
> ahora la imprime». Medido corriéndolas: la imprimía UNA de 48.**

Las otras 47 declaraban, contaban y cerraban bien el código de salida —la guarda
funcionaba— y salían con un `✅` **sin decir sobre cuántas unidades**. El
contrato estaba cerrado **para la máquina** y abierto **para el lector**, que es
quien firma las actas. Es *documentado no es conectado* por **tercera vez en
`lib.mjs`** (tras `SIN_CLON` inerte y `BUILD_ID` sin cerrar el código).

Arreglado en el gancho de salida, no en 47 ficheros. Y todo lo demás que
encontró esta tanda **estaba en esa línea desde el momento en que existió**:

| lo que imprime | qué significaba |
|---|---|
| `evaluadas 1/1 filas comparadas` en `cmp-sector` | **verde falso**: contaba 1 de 13 |
| `evaluadas 12/1 páginas` en `corte-cuerpo` | suelo flojo: midió doce, se exigía una |
| `evaluadas 16/9 páginas` en `esqueleto` | el denominador cuenta **formas**, no páginas |
| `evaluadas 21/35 rutas` en `lh-paginas` | **rojo falso**: dos `continue` esquivaban el recuento |

## 1 · Las 48, corridas y clasificadas

**48 de 48**, en tres lotes por consecuencia. Servidor propio en el 3000 durante
toda la corrida y **ningún `build` en vuelo**.

| lote | sondas | verde | rojo legítimo | contrato bien disparado | **defecto** |
|---|---|---|---|---|---|
| **A** guardas y comparadoras | 23 | 21 | 1 | 0 | **1** |
| **B** identidad e infraestructura | 12 | 9 | 2 | 0 | **1** |
| **C** censos del original | 13 | 12 | 0 | 1 | **1**\* |

\* el de C no sale en el código de salida sino en el **fichero**: `c-cascaron`
salía verde y dejaba media medida en `medidas/`.

**Rojos legítimos** —veredictos de diseño sobre hallazgos ya fichados, y las tres
salidas **idénticas byte a byte a su congelado**—: `mono-cmp` (E3) · `a-embeds`
(16 proveedores fuera de la lista de 5) · `a-lexical` (CMS-0e, 16/24 sin
pérdida). **No se tocan.**

**Contrato bien disparado:** `ruido` con una sola corrida no puede medir
dispersión y lo dice —*«NINGUNA combinación con ≥2 corridas válidas: esta corrida
NO midió el suelo»*—. Es el 4.º arreglo de la tanda anterior funcionando.

## 2 · Los tres defectos de sonda

**`cmp-sector` — verde falso, con TRES capas tapándose.** Imprimía sus 13 filas
en pantalla y declaraba `1/1`:

| capa | qué tenía | qué hizo |
|---|---|---|
| recuento | `ev.ok(filas.length)` | `filas` es un **objeto** ⇒ `undefined` |
| firma | `ok(n = 1)` | el defecto lo convirtió en **1** |
| declaración | `minimo: 1` | 1 ≥ 1 ⇒ **verde** |

Quítese cualquiera de las tres y sale roja. Estaban las tres. **Es la regla 6
nueva de `CLAUDE.md`**: *un parámetro por defecto convierte «no lo sé» en «está
bien»*. `ok()` ya distingue «sin argumento» de «argumento `undefined`» y tira en
el segundo caso.

**`lh-paginas` — ROJO falso.** Medía las 35 rutas, informaba de las 35 y salía
con `21 de 35`. El bucle tiene **dos salidas tempranas** —«1 página» y «NO
PAGINA»— y las dos son **resultados**, no rutas sin medir. La migración puso el
`ev.ok()` al final del cuerpo y los `continue` lo esquivaban.

> **Un rojo que nadie sabe explicar se acaba ignorando.** Un falso positivo
> desactiva una alarma igual de bien que un falso negativo, solo que más despacio.

Barrida la clase: 8 sondas tienen un salto por delante de su `ev.ok()`, y **solo
ésta estaba mal**. Discriminador: *¿el camino que salta dejó un DATO o dejó un
ERROR?*

**`c-cascaron` — media medida en `medidas/`, cada corrida.** Escribía **dos veces
el mismo fichero**: una antes del veredicto y otra al final. La primera es un
prefijo estricto de la segunda y **nada en el nombre decía que estaba
incompleta**. Barrida la clase: ninguna otra escribe dos veces el mismo destino.

## 3 · Cuatro defectos más, todos en `lib.mjs` — o sea en las 48 a la vez

| | qué pasaba | alcance |
|---|---|---|
| **la línea de unidades** | la imprimía 1 sonda de 48 | 47 |
| **`w()` fechaba en UTC** | a las 19:03 del **02** congelaba como **`-08-03`** | `lib.mjs` + **22 sondas** |
| **`alLado()` duplicaba** | la idempotencia miraba solo el destino canónico ⇒ `-fecha.json` y `-fecha-2.json` **byte a byte iguales** | todas |
| **`openPage` ignoraba el HTTP** | **22 de 31** usuarias no miraban el estado; una 404 se mide como página buena | 22 |

**La fecha va en los DOS sentidos y por eso importa:** dos ráfagas de la misma
tarde pueden salir con días distintos —**verde falso del «≥2 días distintos» de
C-QA6**— y dos de días distintos pueden colapsar en la misma. `ruido` nombra sus
ráfagas con ese sello. Ahora `hoy()`/`sello()` viven en `lib.mjs` y las importan
las 22; el fichero de ráfaga añade `meta.ts` (instante absoluto) porque las
ráfagas 1 y 2 de cqa6 llevan sello UTC y restarlas contra una local mete 5 h.

**Y el 404, auditado hacia atrás:** de los **324** ficheros de `medidas/`, solo
**14 registran el estado** y los 4 valores ≥ 400 son legítimos (un negativo con
su nombre, y `c-rutas`, donde el 404 **es** la medida). **No hay contaminación
conocida — pero 310 de 324 no registran el estado, así que para ésos la pregunta
no se puede contestar**, que no es lo mismo que «están limpios».

## 4 · Y seis sondas congelaban FUERA de `medidas/`

`cmp-sector` · `mono-cabecera` · `mono-detalle` · `mono-inline` · `mono-modulos`
· `tree-todos` escribían en la raíz de `scripts/qa/`, con su congelado en
`medidas/`. **La guarda de sobrescritura compara contra el destino, y el destino
no existía: nunca disparaba.** En el lote C se la vio disparar por primera vez en
`mono-cabecera`.

## 5 · El pendiente de los mínimos CAMBIA DE ENUNCIADO

Era *«apretar los 8 suelos de 1»*. Las dos mitades estaban mal:

- **la lista de 8 estaba escrita a mano** y le faltaban `a-behaviors`,
  `cmp-sector` y el 2.º contrato de `clon-base`. **Derivada ejecutando**: 49
  declaraciones en 48 sondas, **39 derivadas** y **10 literales**;
- **el criterio no es «que no sea 1»**: para cuatro de esas diez el mínimo
  correcto **es** 1.

> **TODO MÍNIMO TIENE QUE EXPRESAR EL INVARIANTE QUE LA SONDA AFIRMA.**

**No lo cumplen 6** (`a-ids` · `c-behaviors` · `corte-cuerpo` · `dos-rutas` ·
`mono-cmp` · `tree-cmp`) **y 1 a medias** (`offsets`, con `--cmp`). **Y no se
agota ahí**: `c-muestra` (`16/3`) y `esqueleto` (`16/9`) **derivan** su mínimo y
tampoco lo cumplen, porque el denominador cuenta **formas** y el numerador
**páginas**. Nombrados, no arreglados.

## 6 · Verificación

`npm run check` **0 errores** · `qa:lib` **69/69** (el total lo **cuenta** el
test, ya no está escrito) · las **48 compilan y declaran**, con un solo veredicto
por sonda · `qa:slugs` limpio · `cmp-sector` **13/13** y `lh-paginas` **35/35**
re-corridas tras su arreglo · `c-cascaron` con **un** fichero por corrida.

## 7 · Lo que queda abierto

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
3. **Ráfaga 3 de C-QA6**, con el observable puesto. **Ojo: las ráfagas 1 y 2
   están fechadas en UTC**; la 3 saldrá en local y el `meta.ts` es lo que
   permite restarlas bien.
4. **Los mínimos que no expresan su invariante**: 6 + 1 + 2 (§5).
5. **Las 17 filas sin emparejar** del eje horizontal, y su RANGO sin probar.
6. **Migrar a `iniciarClon()` las 45** que aún esperan un 3000 ajeno.
7. **`openPage` no cubre las 6 sondas que cuentan a mano**: pueden sumar tras
   una 404. Para ésas el aviso es la línea gritada, no el contrato.

## 8 · Lo que NO hay que hacer al empezar

- **No leer un `✅` sin su línea de unidades.** Ahora la lleva siempre; si falta,
  esa sonda no es de este contrato.
- **No leer `12/1` ni `16/9` como verdes equivalentes a `31/31`.** El primero es
  un suelo flojo y el segundo un denominador en otra unidad.
- **No citar los `-2026-08-03` del lote A como del día 3**: son del 2 por la
  tarde, con el sello en UTC. Se dejan con su nombre a propósito, porque
  renombrarlos sería reescribir la evidencia del fallo que los produjo.
- **No tocar los tres rojos legítimos** (`mono-cmp`, `a-embeds`, `a-lexical`):
  son veredictos de diseño, idénticos a su congelado.
- **No usar `rocketToken`/`rocketLoader` como evidencia**: 0 de 50 cargas en `S`.

---

# HANDOFF — «0 comparado = verde» deja de depender de la atención

> ⚠ **Tanda 2026-08-02 (10.ª).** Los cuatro pasos del encargo. Tanda de
> **INSTRUMENTO**: no se midió fidelidad y no se tocó el clon. Lo que cambia es
> qué puede y qué no puede salir verde.

## 1 · El contrato, y por qué esta vez sí cierra la clase

La misma clase había aparecido **cinco veces**, cada una con su arreglo local:
`mono-cmp` (E1) · `charsCenso()` · `ancho-cuerpo` al nacer · `ruido` ·
**`clon-base`** con 31 `ERR_CONNECTION_REFUSED` y código 0. Cinco arreglos no
impidieron el sexto, así que el arreglo no era el arreglo.

> **Toda sonda DECLARA —o deriva del build— su mínimo de unidades evaluadas, y
> por debajo el resultado es NO SE PUDO EVALUAR con código ≠ 0. Nunca verde.**

`Evaluadas`, en `lib.mjs`. Lo que lo hace **estructural** y no una función más
que se puede olvidar:

- el veredicto lo fuerza un gancho de `process.on("exit")`: una sonda que declare
  su mínimo **no puede salir con 0 por debajo de él aunque nunca mire su propio
  contador**, ni con un `process.exit(0)` explícito;
- **congelar una medida sin declarar nada sale por «SIN CONTRATO»**: el olvido
  tampoco es verde;
- `minimo` es obligatorio y ≥ 1, y `new Evaluadas()` **tira** si falta o es 0 —
  una sonda que no sabe cuántas unidades debería evaluar no puede afirmar que las
  evaluó;
- las páginas las cuenta **`openPage`**, por donde pasan todas: no hay un `ok()`
  que se pueda olvidar.

**Migradas las 47.** 39 con el mínimo derivado de su lista (`× 2` en las
comparadoras: media pareja no es una comparación) y **8 con suelo declarado de
1** — `a-ids` · `c-behaviors` · `corte-cuerpo` · `d4-cta` · `dos-rutas` ·
`mono-cmp` · `offsets` · `tree-cmp`. El suelo cierra «0 = verde» pero **no
detecta una corrida parcial**: apretarlas a su lista real está anotado como
pendiente, no dado por hecho.

## 2 · `clon-base` a servidor propio, y las cuatro patas

Ya no espera un `next start` ajeno. El modo de fallo que la hizo dar verde
midiendo nada **no se detecta: no existe**. Y lleva **dos** contratos, porque
tiene dos niveles que se vacían por separado — rutas medidas y rutas
**comparadas** (una línea base sin rutas en común comparaba cero y salía con 0).

| pata | resultado |
|---|---|
| puerto muerto (`CLON=…:9`) | **exit 2** · «NO SE PUDO EVALUAR — 0 de 31 rutas» |
| build viejo (`BUILD_ID` a mitad) | **exit 2** · salida `-CONTAMINADA`, 31/31 medidas |
| 0 páginas comparadas | **exit 1** · «0 de 1 rutas comparadas» |
| control | **exit 0** · 31 comparadas · 0 con regresión |

## 3 · Dos instancias más, destapadas por el propio trabajo

**La SEXTA, dentro de otra guarda.** La de `BUILD_ID` renombraba la salida a
`-CONTAMINADA`, gritaba **y no tocaba el código de salida**. El HANDOFF que la
estrenó decía «sale por error»: no salía. Es *documentado no es conectado* por
segunda vez en `lib.mjs` —la primera fue `SIN_CLON`, inerte—. La destapó pedirle
a `clon-base` la pata de «build viejo», que habría dado verde.

**La SÉPTIMA, en el test del contrato.** El barrido que comprueba que las 47 lo
declaran es una expresión regular, y dio verde sobre `c-censo.mjs` **con dos
`const ev` y sin compilar**: miraba el texto, no el programa. `qa:lib` hace ahora
un `--check` por sonda.

Y una tercera cosa que conviene no olvidar: la migración automática produjo en
`c-muestra` un fichero **que compila** con la `ev` **fuera de alcance**, porque
el `for` de nivel 0 que parecía el bueno estaba anidado. Lo cazó revisar el diff,
no ejecutar nada.

## 4 · La auditoría: ¿hubo algún verde-sin-medir citado?

Contestada **leyendo `medidas/`**, sin re-medir. **31 corridas congeladas de
`clon-base`; en 30 todas sus páginas tienen dato.** Los dos ficheros con cero
unidades son de hoy: el diagnóstico y la pata 1 del negativo.

**Una quedó a medias:** `clon-base-1440-cqa1-despues.json`, **16 de 17** —
`/casos-de-exito/red-calidad-de-aire-para-world-athletics`, timeout de 120 s.

| afirmación | estado |
|---|---|
| acta de C-QA1: «las **11 anteriores** no se han movido un píxel» | **RESPALDADA** — las 11 están medidas |
| titular de esa corrida: «17 páginas comparadas» | **fueron 16** |
| esa ruta a 390, misma tanda | **medida y comparada** |

**Ninguna conclusión del proyecto se cae**; se corrige una cifra de titular. Y
que la respuesta exista es mérito de la regla de congelar: sin los 31 ficheros,
la pregunta no se podría contestar hoy.

## 5 · Verificación

`qa:lib` **42/42** (6 casos del contrato + barrido de declaración + barrido de
compilación) · `npm run check` **0 errores** · `qa:slugs` limpio ·
`qa:cobertura` limpio · `qa:ancho` acotada exit 0 · `clon-base` las cuatro patas.

⚠ **Lo que NO se ha corrido**: las 47 sondas enteras. Se verificó que **las 47
compilan y declaran**, y se corrieron en vivo `slugs`, `cobertura`, `ancho`,
`clon-base` y `lib`. Las demás llevan una línea insertada por barrido revisado a
mano; si alguna falla, fallará **en voz alta** — que es exactamente lo que esta
tanda instala.

## 6 · Lo que queda abierto

1. **Ráfaga 3** de C-QA6, con el observable puesto. **Desde hoy mismo** (el
   2026-08-03 ya cumple ≥2 h y tercer día).
2. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO.
3. **La retícula de la HOME** — 86.35/85 % contra 86 %. Va con C-QA3.
4. **Los 8 mínimos de suelo**, a su lista real.
5. **Las 17 filas sin emparejar** del eje horizontal y su **RANGO, sin probar**.
6. **Migrar a `iniciarClon()` las 17 sondas** que aún esperan un 3000 ajeno
   (`clon-base` ya no está en la lista).

## 7 · Lo que NO hay que hacer al empezar

- **No leer un verde de sonda como «midió»** sin la línea de unidades: ahora la
  imprime, pero el hábito viene de antes.
- **No añadir una sonda nueva sin `Evaluadas`**: `qa:lib` la caza, y por eso el
  barrido tiene que seguir en verde.
- **No citar el titular de `clon-base-1440-cqa1-despues`**: son 16, no 17.
- **No dar por apretados los 8 mínimos de 1.**

---

# HANDOFF — el marcador de fila, las 177 huérfanas resueltas y el observable de la ráfaga 3

> ⚠ **Tanda 2026-08-02 (9.ª).** Los cuatro pasos del encargo. **Tanda de
> INSTRUMENTO y ADJUDICACIÓN**: se arregló cómo se mide y se adjudicó todo lo
> medido; **no se tocó ni un ancho del clon**, a propósito.

## 1 · Lo primero, porque tiene fecha: la ráfaga 3 ya tiene con qué explicar

`ruido.mjs` anota ahora, **por carga y junto al `h1`**, un observable
discriminante. La campaña llegaba a su última ráfaga sabiendo que el `h1` es
**bimodal** —dos estados a 32.28 exactos, el alto idéntico en dos días— y sin
nada con que atribuirlo, y **una condición binaria no se explica midiendo más
veces la misma magnitud.**

```bash
# desde el 2026-08-03, ≥2 h de la última (12:33 local del 2026-08-02), mejor en un 3.er día
RUTAS=/software-de-medicion-calidad-del-aire,/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar,/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas \
  CAMPANA=cqa6 npm run qa:ruido -- 3
```

Lo que registra: `document.fonts.status` · el `font-family` computado · **qué
familias están de verdad disponibles** (`fonts.check`) · los **renglones y el
ancho RENDERIZADOS** del titular · y la **cadena `h1`→raíz** con el
desplazamiento de cada nivel dentro de su padre.

**Los dos avisos que hacen falta para no leerlo mal, y el segundo cambia dónde
hay que mirar:**

1. **`getComputedStyle(h1).fontFamily` devuelve la lista DECLARADA, no la fuente
   con la que se pintó.** Si la webfont no llegó y se usó la de reserva, ese
   valor **no cambia**: él solo es un detector que no puede ver el fenómeno. Se
   registra igual —descarta que el CSS servido cambie— pero quien discrimina son
   `fonts.status`/`check()` y el **ancho y los renglones renderizados**.
2. **El ±32.28 no está DENTRO del `h1`: está en su `y`**, o sea que lo que crece
   está **por encima**. La cadena existe por eso: el nivel cuyo desplazamiento
   cambia entre dos cargas es **el nivel donde nace el 32.28**.

El informe distingue **tres** respuestas y no dos: *acompaña* · *no acompaña* ·
**«no se puede evaluar aquí»** (el `h1` no cambió de estado en esta ráfaga).
Confundir las dos últimas es el fallo entero de C-QA6.

**`rocketToken`: NO VALIDADO, y con número.** `N` en las **36 cargas** de las
ráfagas 1 y 2 — y `rocketLoader` igual. Eso no es «el token no interviene»: es un
detector que **nunca ha discriminado**. Sale impreso como NO VALIDADO y **no se
cita** hasta que se le vea cambiar. Si la ráfaga 3 tampoco le saca un `S`, se
retira del observable.

## 2 · El marcador de fila: 99 parejas de 181 pasan a 164 — y la hipótesis era un tercio

`data-fila` en 23 contenedores del clon. **Es identidad, no medida, y está
probado**: `clon-base` con el mismo original y el mismo día, build sin marcador
contra build con marcador, da **31 páginas · 0 con regresión · umbral CERO**.

> ⚠ **Pero el HANDOFF anterior decía que el marcador «convierte huérfanas en
> emparejadas sin tocar una medida», y medido es UN TERCIO.** Las otras dos
> terceras partes estaban **dentro del emparejador**: tenía **tres definiciones
> distintas de «el mismo texto»**, la trampa de `charsCenso()` tres veces
> seguidas en la misma función.

| causa de las 177 | qué era | lo arregla |
|---|---|---|
| filas **fantasma** del clon | el conductual bajaba a las diapositivas de un slider y a sus puntos (12 · 12 · 7 px) | el marcador |
| el original sirve **todos los idiomas** | «Related content قد يهمك أيضًا» contra el español solo | `innerText` |
| la **flecha** de los botones | `::after` en el original, `<span>` en el clon | quitarla de los dos |
| contenido que **rota** | «Artículos y Guías» se baraja; la banda de clientes es un carrusel de 2.5 s | pasada por prefijo y por **conjunto** de imágenes |

|  | antes | ahora |
|---|---|---|
| filas del original emparejadas | 99 / 181 (54.7 %) | **164 / 181 (90.6 %)** |
| huérfanas | 177 | **27** |
| filas del clon | 194 (con fantasmas) | **174, todas por marcador** |

**Las 31 rutas dan el MISMO recuento a 1440 y a 390.** No es cobertura: es el
control de que el emparejador no está inventando.

## 3 · La adjudicación — y una corrección a la cosecha de ayer

### ⚠ El «75 % → −158.39» de la HOME NO EXISTE

Era una **fila fantasma**: un bloque centrado dentro de `Testimonios` que el
detector conductual tomó por fila. Con el marcador desaparece y la fila real
empareja a **86.35 %, +5.05**, como sus siete hermanas. **El clon sirve DOS
valores de retícula, no tres**, y el peor Δ de la home es **−14.39**.

> Es la regla del pleno aplicada a un heurístico: **uno que encuentra MÁS de lo
> que hay no da error — da un número plausible de más.**

### La ficha buena de `/` (FIDELIDAD, va con C-QA3)

El original usa **86 % en sus 16 filas, sin excepción, a los dos anchos**.

| el clon | filas | Δ@1440 | Δ@390 | quién |
|---|---|---|---|---|
| fijo **86.35 %** | 8 | +5.05 | +1.36 | `SectionRow` |
| fijo **85 %** | 2 | −14.39 | −3.89 | `TrustBar` · `UltimosProyectos` |
| **cambia** 86.35→85 en `md` | 3 | −14.39 | +1.36 | `HeroSection` · `ProductosTabs` · `UltimosArticulos` |

**FAMILIA DE CALIBRACIÓN de manual:** los cinco componentes tienen variante por
familia y **las de las otras familias están a Δ0** en las 30 rutas restantes
—`TrustBar` sirve 95 % al sector, `UltimosArticulos` 86 % al sector y 80 % a
producto—. La única variante que nadie había comparado es la de la home.

### Las otras 30 rutas: **152 filas informativas a Δ0**, los dos anchos

Primera verificación real de la retícula del cuerpo del proyecto. Incluye la
**miga de pan de las 29 rutas** que la llevan, que hasta hoy solo había mirado
`a-miga` y solo el eslabón.

### Las 27 huérfanas: ninguna es un ancho

12 son **PARTICIÓN** (el clon funde en una fila lo que el original parte en dos,
o al revés) · 6 de ellas son **D1**, ya fichada · 2 son un límite del
emparejador (el carrusel de logos) · 1 es el artefacto del `h1` oculto de `/` ·
**1 es S9a, que este eje redescubrió solo** — dos instrumentos independientes
señalando el mismo párrafo. Tabla completa en `PENDIENTES-QA.md`.

⚠ **Y una medida que la tabla de Δ no cuenta:** la fila del hero de `/` mide
**1224 contra 1238.39** y no empareja (por el `h1` oculto). Serían **13** filas
con Δ≠0, no 12.

## 4 · `clon-base` daba VERDE midiendo nada

Cazado al usarla como guarda de esta tanda: **con el 3000 vacío imprimía 31
`ERR_CONNECTION_REFUSED` y salía con código 0.** La guarda de regresión del clon,
la que más se corre, no distinguía «sin regresión» de «sin medir».

Son las dos reglas de §sondas a la vez: *impreso y no contado* y *verde por
vaciado*. El aviso llevaba ahí desde el principio; lo que faltaba era que
**contase**. Arreglado —las rutas no medidas cierran el código de salida— pero
**no migrada**: sigue esperando un `next start` ajeno, y es una de las 18.

## 5 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones
(1725 · 868) · `qa:slugs` limpio (A, B y C) · `qa:lib` **31/31** ·
`qa:ancho` **exit 0 a 1440 y a 390**, con sus cuatro negativos ·
`qa:ruido` con sus tres negativos · `clon-base` **31 páginas · 0 regresión**
antes/después del marcador.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, defecto de RANGO,
   arreglo estructural. Sin tocar.
2. **La retícula de la HOME** — 86.35/85 % contra 86 %. **Va con C-QA3.**
3. **Ráfaga 3** de la campaña, **con el observable puesto**. Desde mañana.
4. **Las 17 filas sin emparejar**: 12 son partición ya nombrada; lo que no se
   puede cerrar por esta vía son las de contenido barajado.
5. **El RANGO del eje horizontal: sin probar.** `qa:ancho` solo se ha corrido a
   1440 y a 390.
6. **Migrar las 18 sondas** a servidor propio — con `clon-base` la primera, que
   ya ha demostrado el modo de fallo.
7. **Los huecos 2–5 de cobertura**: filas 6/31 · módulos 2/31 · offsets 0/31 ·
   **comportamiento 0/31**.

## 7 · Lo que NO hay que hacer al empezar

- **No citar el −158.39 de la home.** No existe: era una fila fantasma.
- **No leer «164/181» como el eje cerrado.** Y no leer «31/31 rutas» como nada:
  la unidad de este eje es la FILA.
- **No usar `rocketToken` como evidencia** hasta que dé `S` alguna vez.
- **No arreglar la home por partes**: la retícula va con C-QA3.
- **No fiarse de un `clon-base` verde sin mirar que haya medido.** Ya lo dice él,
  pero la costumbre de leerlo como «todo bien» viene de antes del arreglo.

---

# HANDOFF — el eje horizontal, medido por primera vez; y la campaña de ruido a 2/3

> ⚠ **Tanda 2026-08-02 (8.ª).** Los cinco pasos del encargo. **Tanda de
> DIAGNÓSTICO**: se midió un eje que nunca se había mirado y **no se arregló
> nada de lo que salió**, a propósito.

## 1 · El hueco nº 1 de cobertura, cerrado — y lo que había debajo

**`qa:ancho`** compara el ancho de la retícula del cuerpo contra el original en
**31 rutas × 2 anchos**. Era el **0/31 de verdad** de `COBERTURA-MEDICION.md`.

**Toda la cosecha está en `/`.** Las otras 30 rutas salen limpias. El original usa
**86 % uniforme**; el clon sirve tres anchos distintos:

| el clon sirve | Δ @1440 | Δ @390 | filas |
|---|---|---|---|
| **86.35 %** | +5.05 | +1.36 | 6 · 10 |
| **85 %** | −14.39 | −3.89 | 5 · 2 |
| **75 %** | **−158.39** | — | 1 (solo @1440) |

**Encuadre: FIDELIDAD.** Se reproduce en los dos anchos del contrato **y con el
mismo porcentaje**, no con el mismo píxel — firma más fuerte todavía que la de
«reproducirse entre anchos»: no es un residuo que sobrevive a dos maquetaciones,
es **el mismo valor equivocado escrito en la hoja de estilos**. Familia de
calibración, con el `w-[85%]` de la home ya anotado en `Footer.tsx` desde hace
tandas y nunca comparado, **porque este eje no se medía**.

**No se arregla aquí y va con C-QA3** (+289.91 abierto en la home): dos cambios a
la vez en la misma página no se adjudican.

### ⚠⚠ Y la letra pequeña, que vale tanto como la cosecha

> **«31/31 rutas» NO es «31/31 filas».** Se emparejaron **99 filas de 276**; las
> **177 huérfanas NO se compararon**. Son preguntas, no verdes.

El detector de fila del clon es **conductual** (bloque centrado más estrecho que
su sección) y **sobre-casa en los sectores**: 11 filas en el original contra
**16** en el clon. Se estrecha dando al clon un **marcador semántico de fila**
—como el `data-kunak` del pie— en vez de deducirla. Eso convierte huérfanas en
emparejadas sin tocar una medida.

## 2 · Campaña de ruido: 2 de 3 ráfagas, y tres cosas nuevas

**1 · El `h1` tiene DOS ESTADOS DISCRETOS**, separados por **32.28 exactos**, no
temblor continuo. El valor alto es **idéntico en dos ráfagas separadas por dos
días**: estable y reproducible.

**2 · La sincronía entre rutas NO es total.** En la ráfaga 1, corrida 2: los dos
monográficos ya estaban en alto y **software seguía en bajo**. Son **al menos dos
grupos**, no un interruptor global. La ráfaga 2 cayó entera en el estado alto, así
que **no confirma ni refuta**.

**3 · Latencia: cero pares útiles, y no por falta de instrumento.** La ráfaga 2
trae cronómetro (6.9–12.1 s, con un pico de 12.1 s) **y no tuvo transición**; la
ráfaga 1 tuvo transición y **es anterior al cronómetro**. Hay latencia sin
transición y transición sin latencia.

**4 · ⚠ `rocketToken` dio `N` en las 12 cargas.** Eso **no es «el token no
interviene»**: es un detector que **nunca ha discriminado**. Por la regla del
cero/pleno se anota como **sin validar**; antes de concluir con él hay que
comprobar que sabe dar `S` en alguna página.

**Ráfaga 3: a partir del 2026-08-03**, ≥2 h de la última (12:33 local del
2026-08-02) y **mejor en un tercer día**. Cierra la campaña.

## 3 · CLASE MAYOR fichada, sin tocar: el hueco de la barra en 31 rutas

| | @1440 | @1280 |
|---|---|---|
| barra del original | **185** | **136.52** |
| hueco cableado en el clon | 185 | **185** |

**No hay constante que sirva:** 185/1440 = 12.85 % pero 136.52/1280 = **10.67 %**.
La barra **no varía proporcionalmente al ancho** — la mueve el reflote del menú—,
así que ni px ni % reproducen la curva: **cualquier valor acierta solo en el ancho
donde se midió**. Es un **generador de familias de calibración**, no un número mal.

**Ámbito 31 rutas**: `CabeceraSector` (6) y **`BandaCabecera` (29)**. Defecto de
**RANGO**; arreglo **estructural** (la barra en flujo), prioridad **alta**.

> ⚠ **Y el matiz que evita un malentendido caro:** meter la barra en flujo **no es
> reabrir D1 como defecto**. D1 sigue siendo partición deliberada y sigue sin
> mover `docH`. Es **elegir la otra partición** porque la actual obliga a cablear
> un hueco. La ficha de D1 no se toca.

## 4 · Las sondas: dos defectos propios cazados antes de creerles nada

**En `ancho-cuerpo`, la primera corrida comparó 0 filas de 13 y aun así imprimió
✅ con código 0.** Dos causas, las dos de manual:

1. **La firma emparejaba con espacios normalizados.** El original separa los nodos
   en línea con espacios y el clon no: «Inicio Productos» contra
   «InicioProductos». Es la trampa de `charsCenso()` —dos definiciones de «lo
   mismo»—. Ahora la firma va **sin espacios**.
2. **Acotar se volvía verde por vaciado.** Ahora `comparadas === 0` **cierra el
   código de salida**: *una sonda que no compara nada y una que compara y no
   encuentra nada dan la misma salida*.

**Y en `lib.mjs`, la bandera `SIN_CLON` era INERTE**: se leía al cargar el módulo
y la sonda la pone **después** del `import`, así que la constante ya valía
`false`. *Documentado no es conectado*, cometido **dentro de la propia guarda**.
Ahora se lee en cada llamada.

## 5 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones ·
`qa:slugs` limpio · `qa:lib` **31/31** · `qa:ancho` con sus dos negativos
(selector muerto ⇒ error · patrón ubicuo ⇒ error · control ⇒ 0) · `c-cmp`
**exit 0 a 1440 y a 390**.

## 6 · Lo que queda abierto, por prioridad

1. **La barra de navegación (CLASE MAYOR)** — 31 rutas, arreglo estructural.
2. **La retícula de la HOME** — 86.35/85/75 % contra 86 %. **Va con C-QA3.**
3. **Las 177 filas huérfanas** del eje horizontal: marcador semántico de fila en
   el clon y vuelven a la comparación.
4. **Ráfaga 3** de la campaña, para fijar el suelo.
5. **Validar el detector `rocketToken`** antes de usarlo como evidencia.
6. **Migrar las 18 sondas restantes** a servidor propio (cubiertas por BUILD_ID).
7. **Los huecos 2–5 de cobertura**: filas 6/31 · módulos 2/31 · offsets 0/31 ·
   **comportamiento 0/31**.

## 7 · Lo que NO hay que hacer al empezar

- **No leer «30 de 31 rutas limpias» como el eje verificado.** Son 99 filas de
  276; el resto **no se ha mirado**.
- **No arreglar la home por partes**: la retícula va con C-QA3.
- **No usar `rocketToken` como evidencia** hasta que se le vea dar `S`.
- **No tratar el hueco de la barra como un número que ajustar.** No lo es.

---

# HANDOFF — el contrato de RANGO, el pie a Δ0 exacto, y las sondas dueñas de su servidor

> ⚠ **Tanda 2026-08-02 (7.ª).** Los cinco pasos del encargo, hechos. Lo que más
> se va a usar de aquí no es un arreglo: es **la distinción de contrato**, porque
> decide qué cuenta como defecto en todo lo que venga.

## 1 · EL CONTRATO NO ES EL MISMO A TODOS LOS ANCHOS

| dónde | contrato | qué es defecto |
|---|---|---|
| **1440 y 390** | **FIDELIDAD** | cualquier Δ ≠ 0 sobre el suelo de ruido |
| **anchos intermedios** | **COMPORTAMIENTO DE RANGO** | un valor **cableado** donde el original **varía** |

El original es **Divi fluido** y el clon es Tailwind con cortes declarados: las
dos curvas pasan por 1440 y por 390 y **no coinciden entre medias**. Igualarlas
punto a punto sería reproducir el motor de Divi, y como no hay un ancho
«siguiente» que fijar, **no termina**.

**En intermedios no se exige Δ0: se exige que el clon VARÍE donde el original
varía.** Y se arregla haciendo que dependa de lo que el original hace que
dependa — **nunca cableando el valor del ancho medido**, que es exactamente cómo
se fabrica una familia de calibración.

En `CLAUDE.md` (antes de las notas de método) y en `ESQUEMA-CMS.md` §8.1, que
añade lo que el listón de aceptación no cubría: **al migrar, una presentación
puede volverse un CAMPO, y un campo con el valor de 1440 dentro pasa el listón y
rompe el rango.**

## 2 · La cabecera a 1280: eran tres valores cableados donde Divi usa %

Descompuesta por composición — la sección del original tiene **tres** hijos y el
clon uno más un `pt` cableado:

| qué | 1440 | 1280 | era |
|---|---|---|---|
| `py` de fila | 28.7969 | 25.5938 | **2 %** |
| `mb` del módulo del `h1` | 21.6562 | 19.25 | **1.7488 %** |
| `mb` / `mt` del kicker | 29.77 / −13 | 26.46 / −11.55 | **2.4039 % / −1.0498 %** |

**Medido:** 1440 pasa a **Δ 0.00 exacto en las cuatro rutas** —mejor que con los
px, que daban −0.02—, 390 sin cambio, y 1280 de **59.34 a 48.69**.

### Lo que queda a 1280 tiene un nombre y NO se arregla con una constante

Los **48.69** son el hueco de la barra de navegación: el original vale
41 + 95.52 = **136.52** y el clon cablea **185**. Y no hay porcentaje que sirva:
185/1440 = 12.85 % pero 136.52/1280 = **10.67 %**, o sea que la altura de la barra
**no varía proporcionalmente al ancho** — la mueve la maquetación del menú. El
clon lo sabe: **su propio `header` mide 203.59 a 1440 y 157.89 a 1280**, varía
igual. Lo congelado es solo el HUECO.

> **Su arreglo es estructural —la barra en flujo, que es la partición D1— y es de
> ámbito PROYECTO, no de esta cabecera:** `BandaCabecera` cablea lo mismo para las
> otras 29 rutas (`--banda-alto` 165.58/225).

## 3 · El residuo de ~1 px del pie: era un BORDE, y es el 7.º eje

Estaba fichado como «~1 px sin descomponer». **Un residuo que se repite igual a
1440 y a 390 no puede ser ruido.** Midiendo `pt + pb + Σcolumnas` contra el alto
de la fila: el original sobraba **2.01** y el clon **1.01**, constante en los dos
anchos y en las tres presentaciones.

| presentación | orig `border-top` | orig `border-bottom` | clon |
|---|---|---|---|
| ancha · estrecha | 1px | **1px** | 1px / 0 |
| estrechaPad | **0** | **0** | 1px / 0 |

El clon servía `border-top: 1px` y nada abajo **en las tres**: −1 donde falta el
de abajo y **+1 donde sobra el de arriba**. Y no era solo alto: **en catálogo y
producto pintaba una línea de `#333` cruzando el pie que el original no tiene.**

**`footer-links` queda a Δ 0.00 exacto a 1440** en las cinco rutas y **+0.20 a
390**, con un solo dueño con nombre: la columna CERTIFICACIONES (184.25 contra
184.05).

## 4 · Las sondas, dueñas de su servidor — dos mitades

**`iniciarClon()`** arranca su servidor en un puerto libre, espera a que
responda y mata el árbol al salir (incluida excepción sin capturar). Dos sondas
pueden medir a la vez.

⚠ **No basta, y decirlo importa:** el servidor propio lee el **mismo `.next`**,
así que un build concurrente le cambia el contenido igual. De eso protege la
segunda mitad:

**La guarda de `BUILD_ID` en `w()`.** Se lee al arrancar la sonda y al congelar;
si cambió, la salida va a **`…-CONTAMINADA.json`** y sale por error.

> **Lo grave de un build a mitad de corrida nunca fue el 404: era no saber DÓNDE
> CAYÓ EL CORTE.** Ahora el fichero lo dice en el nombre.

Vive en `w()` —por donde escriben las 19— así que **las cubre todas sin tocar
ninguna**. Migrada a servidor propio: **`cabecera-cmp`**, verificada con el 3000
muerto (arranca en puerto propio, mide Δ0, deja el puerto cerrado). **Las otras
18 siguen esperando un `next start` ajeno** — mecánico y pendiente.

`npm run qa:lib` **31/31**, con los tres negativos nuevos.

## 5 · La CLASE, redefinida

> **Un componente compartido cablea los valores del PRIMER CONTEXTO en que se
> midió** — y «contexto» puede ser una **familia** (instancias 1–4), un
> **ARQUETIPO** (la 5) o hasta un **ANCHO** (la 7).

Siete instancias, **todas cerradas**. La 7 es la que estira la definición: px
donde Divi escribe %, con **Δ0 en los dos anchos del contrato** y congelado en
todo lo de en medio.

**El barrido pendiente cambia de criterio:** no «componentes que cablean
constantes de software» —eso busca una instancia— sino **componentes compartidos
con valores fijos que UN SOLO contexto consumidor ha ejercitado**. Con la
pregunta que faltaba: **si todos los consumidores ejercitan el valor IGUAL, está
sin probar aunque haya ocho.**

Y la nota de método: **la reutilización por un segundo arquetipo es un test del
primero, y a veces el único.** El `h1` al 100 % daba Δ0 en las 4 instancias de
SECTOR **a los cinco anchos** porque sus titulares son cortos.

## 6 · Verificación

`npm run check` **0 errores** · `qa:enlaces` limpio en las dos direcciones
(1725 salientes · 868 entrantes) · `qa:slugs` limpio (A, B y C) · `qa:lib`
**31/31** · `c-cmp` **exit 0 a 1440 y a 390**, 31/31 cada uno, las tres
predicciones en pie.

## 7 · Lo que queda abierto

1. **El hueco de la barra de navegación**, de ámbito proyecto: **48.69 a 1280** en
   `/sectores/*` y el equivalente en `BandaCabecera` para las otras 29. **Defecto
   de RANGO**, no de fidelidad. Arreglo estructural (la barra en flujo = D1), con
   adjudicación en 31 rutas.
2. **La columna CERTIFICACIONES, +0.20 a 390.** Sub-píxel, con nombre.
3. **Migrar las 18 sondas restantes** a servidor propio. Mecánico.
4. **El barrido de la FAMILIA DE CALIBRACIÓN con el criterio nuevo** — sigue
   necesitando el ancho del cuerpo en las 31 rutas, hoy **0/31**.
5. **La ráfaga 2 de la campaña de ruido**, pendiente de su día.
6. **`/` con su pie propio**, con C-QA3 (+289.91).

## 8 · Lo que NO hay que hacer al empezar

- **No perseguir Δ0 en un ancho intermedio.** Comprueba si VARÍA; si varía,
  cumple. Un «se ficha, no se persigue» ahí **no es deuda, es el contrato**.
- **No reabrir D1 ni D2** como defectos de fidelidad: son partición. (Pero D1 sí
  es el camino del arreglo de rango del punto 7.1 — no es lo mismo.)
- **No construir con una sonda en vuelo.** Ahora se detecta, pero detectar
  significa **descartar la corrida**, no salvarla.
- **No dar por barrido un componente** porque tenga muchos consumidores: lo que
  cuenta es cuántos **ejercitan el valor de forma distinta**.

---

# HANDOFF — C1 SALDADO: 2 causas arregladas, 2 particiones fichadas

> ⚠ **Tanda 2026-08-02 (6.ª).** Los cuatro pasos del encargo, hechos. **C1 se
> cierra como capítulo**, y con él la cuarta de sus causas y una quinta
> instancia de la FAMILIA DE CALIBRACIÓN que llegó de fuera.

## 1 · El balance de C1, que es lo que hay que llevarse

| | era | veredicto |
|---|---|---|
| **D1** −225 | la cabecera del clon va **dentro** de `main` como `section.banda-cabecera` | **PARTICIÓN DELIBERADA** · fichada |
| **D2** +50 | las migas del clon son un `<nav>`, no una `<section>` | **PARTICIÓN DELIBERADA** · fichada |
| **D3** −42 | `margin-bottom` del `<article>` del CPT `solutions` | **arreglado** |
| **D4** | el pie: **5 ejes** de presentación por tipo de página | **arreglado** |

**Dos de cuatro no eran defectos.** `c1-localiza` los reconstruía al céntimo, y
reconstruir no es explicar: eran la misma altura contada de otra forma.

La prueba está congelada y es la que impide que alguien los «arregle» dentro de
tres tandas: **11 formas × 2 anchos**, la banda del clon igualando al céntimo la
cabecera del original (1440: **225** · 397.59/**397.61**; 390: 165.58 · 136.58 ·
347.25 · 419.25 · 362.91) y las migas **50 = 50**.

## 2 · ⚠⚠ LO QUE HAY QUE LEER ANTES DE `c-cmp` Y DE `COBERTURA`

> **La métrica RESTO (`docH` − Σsecciones) cuenta todo lo que vive FUERA de
> sección: migas, bandas, envoltorios. Una diferencia de RESTO puede ser
> PARTICIÓN y no defecto, y desde el número no hay forma de saberlo.**

RESTO es un **contenedor con holgura** —cabe dentro un nodo entero sin dejar
rastro— y además su frontera **la define el selector de sección de cada lado**:
`.et_pb_section` en el original, `main > section` en el clon. Dos selectores que
no denotan el mismo conjunto.

**Un Δ de RESTO se adjudica POR COMPOSICIÓN antes de tocar nada:** se enumeran
los hijos en flujo de los dos lados y se emparejan **por lo que son** —cabecera
con banda, migas con migas—, no por si casan con el selector. Instrumento:
`qa:d123`. Lo mismo vale para el **`nº de secciones ≠`** que `c-cmp` ya imprime
como **PREGUNTA**.

Coste de no haberlo tenido escrito: D1 y D2 vivieron una tanda entera como
causas pendientes, con orden de ataque y condición de bloqueo.

## 3 · La cabecera del monográfico: ancho de módulo, y la clase cambia

Era **−36.02 a 1440 y 0 a 390**. `36` es el `line-height` del `h1`: **un
renglón**, o sea envolvimiento, o sea que la causa es un **ancho**.

El original le da al `h1` el **50 %** de la fila; el clon le daba el **100 %**.
Medido a **cinco anchos** con `qa:cabecera` (los dos lados): 390 y 800 → 100 % ·
1000, 1280 y 1440 → 50 %. Cinco y no dos porque con 1440 y 390 «50 % de la fila»
y «un ancho fijo en px» **predicen lo mismo**; 1280 las separa y 800/1000 sitúan
el corte (el de Divi, 980) en vez de suponerlo.

**Adjudicado en la propiedad medida** —la sección de cabecera, `qa:cabecera`—:
edar y petróleo **−36.02 → −0.02** a 1440, sin moverse a 390; los dos sectores
intactos. Ahí sí se movieron **las 2 del monográfico y ninguna más**.

⚠ **A nivel de `docH` se movieron CINCO de 31**, y decir «2 y ninguna más» a
secas sería falso: petróleo **+36** (exacto), edar **+9** (+36 −27 de ruido), dos
sectores **±27** con su cabecera medida **sin moverse**, y un CASO **+76** que
está **fuera del alcance del cambio** — `grep -rn CabeceraSector src/` da **un
solo importador**, `sectores/[slug]/page.tsx`, así que el caso no puede haber
sido tocado. **Un alcance se cita con el NIVEL al que se midió**, igual que un
número de un par se cita con sus dos lados.

### Lo que esta instancia cambia de la CLASE — y es lo más útil de la tanda

Las cuatro instancias anteriores heredaban valores de SOFTWARE, hasta parecer que
la clase era «todo se calibró con software». **No lo es.** La clase es *un
componente compartido hereda la familia sobre la que se midió*, y aquí esa
familia es un **ARQUETIPO**: `CabeceraSector`, medido sobre SECTOR y reutilizado
por MONOGRÁFICO.

Y el defecto **es invisible en las 4 instancias de su propio arquetipo, a los
cinco anchos**: los titulares de los sectores caben en un renglón con 619 px y
con 1238.

> **Un ancho mal no cuesta un píxel hasta que el texto envuelve. Así que el
> detector de un defecto de ancho no siempre es OTRO ANCHO: a veces es OTRO
> CONTENIDO.** Barrer «las N instancias del arquetipo a dos anchos» no habría
> encontrado ésta. La encontró medir **el arquetipo vecino que comparte el
> componente**.

En `CLAUDE.md`, como segunda cara del NO-WRAP.

## 4 · Dos trampas de operación que se cobraron en esta tanda

**(a) `npm run check` CONSTRUYE.** Lanzarlo mientras una sonda mide le cambia el
`.next` al servidor vivo y salen **404 en rutas que existen** — pasó con las 4 de
`/recursos/…` en mitad de la adjudicación. Con el servidor relanzado dan 200 las
cuatro. **Lo grave no es el 404: es que no se sabe dónde cayó el corte**, así que
la corrida entera se descarta y se repite. Regla nueva en `CLAUDE.md`: **con una
sonda en vuelo, nada de `build`, `check` ni `dev`.**

**(b) La sonda nueva llegó con dos defectos, los dos «plausibles».**
`getClientRects().length` **no cuenta renglones** en un elemento de bloque —da 1
siempre—, así que la 1.ª versión publicaba «Δ renglones 0» **al lado** de «Δ alto
−36», dos números suyos contradiciéndose. Y el kicker se buscaba como `<p>`, que
en el original no lo es → `null` en las 4. Corregidos: `Range` agrupado por `top`
y búsqueda por posición.

## 5 · Estado de las sondas

```bash
npm run qa:cabecera -- 1440|1280|1000|800|390   # la cabecera de /sectores/*, los dos lados
npm run qa:d123     -- 1440|390                 # hijos EN FLUJO: distingue partición de defecto
npm run qa:d4-sus   -- 1440|390                 # el «¡Suscríbete!», por composición
```

`qa:enlaces` limpio en las dos direcciones (1725 salientes · 868 entrantes) ·
`qa:slugs` limpio (A, B y C) · `npm run check` **0 errores**.

**`c-cmp` en VERDE de verdad a los dos anchos**, cada uno con su corrida limpia y
congelada:

| ancho | resultado | salida |
|---|---|---|
| 1440 | **exit 0** · 31/31 · las 3 predicciones en pie | `c-cmp-1440-tras-cabecera.json` |
| 390 | **exit 0** · 31/31 · las 3 predicciones en pie | `c-cmp-390-tras-cabecera.json` |

A 390 **no se repitió el episodio de latencia**: las 31 rutas cargaron, incluida
la FAQ que el 2026-08-02 dio timeout de 120 s. Queda confirmado lo que decía el
reintento — era un episodio del original, no un defecto del clon ni de la sonda.

## 6 · Lo que queda abierto

1. **El alto de la cabecera a 1280**: el original varía entre 1280 y 1440
   (338.25 → 397.61) y el clon no (397.59 en los dos) → **+59.34**. Salió de paso
   al buscar el corte. **1280 no es uno de los dos anchos del proyecto**, así que
   se ficha; lo que deja escrito es que **el ritmo vertical de esa cabecera no
   está verificado fuera de 1440 y 390**.
2. **El residuo de ~1 px del pie** en las tres presentaciones (fila ~1 + columna
   CERTIFICACIONES +0.2). Sin descomponer.
3. **`+11.2` de base en `/sectores/estudio-de-la-contaminacion-atmosferica` a
   390**, anterior a esta tanda y congelado en `c-cmp-390-tras-d3.json`.
4. **La FAMILIA DE CALIBRACIÓN no se cierra como clase**: falta medir el **ancho
   del cuerpo** en las 31 rutas, hoy **0/31** en `COBERTURA-MEDICION.md`. La
   sonda no existe. **Y ahora se sabe además que el barrido tiene que incluir los
   arquetipos VECINOS que comparten componente**, no solo las instancias propias.
5. **La ráfaga 2 de la campaña de ruido**, pendiente de su día. El timeout de 120 s
   del 2026-08-02 está registrado como episodio, **pero no la sustituye**.
6. **`/` con su pie propio**, a propósito, y va con C-QA3 (+289.91).

## 7 · Lo que NO hay que hacer al empezar

- **No reabrir D1 ni D2.** Están medidas en 11 formas y dos anchos.
- **No leer un Δ de RESTO ni un `nº secciones ≠` como defecto** sin componer.
- **No dar por barrido un componente compartido** habiendo mirado solo las
  instancias de su arquetipo: si lo usa un segundo arquetipo con contenidos más
  largos, **ahí es donde vive el defecto**.
- **No construir mientras se mide.**

---

# HANDOFF — `footer-links` cerrado, D3 cerrado, D1 y D2 NO EXISTEN

> ⚠ **Tanda 2026-08-02 (5.ª).** Se hicieron los PASOS 0 a 5 del encargo y el 6
> incluida la corrida final de adjudicación a los dos anchos. **D4 está
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

1. ~~La corrida de adjudicación a 1440~~ **HECHA · exit 0 · 31/31**
   (`medidas/c-cmp-1440-tras-d3.json`), y es la mejor prueba de la tanda:

   | familia | rutas | movió total | de ese total, **por D3** |
   |---|---|---|---|
   | **ancha** | 22 | −87 / −88 | **0** en 19 de 22 |
   | **caso** | 4 | +256 | **0** |
   | **home** | 1 | 0 | **0** |
   | **estrechaPad** | 2 | +410 | **+42** |
   | **software** | 2 | +42 | **+42** |

   **D3 movió las cuatro rutas del CPT `solutions` y dejó las otras 27 en
   cero.** Un arreglo cuyo alcance medido y cuyo alcance servido coinciden
   ruta a ruta no necesita más adjudicación. Las tres excepciones de `ancha`
   son **±27** —la familia de ruido documentada—, no D3.
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
> | **1 ✅** | 2026-07-30 22:14 local | **±32.28** en el `h1` de las **tres** rutas a 1440 |
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
