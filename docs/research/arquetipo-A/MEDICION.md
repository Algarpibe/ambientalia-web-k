# ARQUETIPO A — acta de CONSTRUCCIÓN (2026-07-31)

> El recon (2026-07-30) dijo qué era. Esto dice qué pasó al construirlo: **tres
> plantillas, 14 rutas nuevas, 0 regresión en las 17 anteriores y la base a Δ0 a
> 1440**. Y **cuatro cosas del recon que la construcción corrige**, más un
> defecto abierto con su causa cuantificada.
>
> Sondas y salidas congeladas:
> `qa:a-spec` → `medidas/a-spec.json` (transcripción verbatim, 14 instancias) ·
> `qa:a-cascaron` → `medidas/a-cascaron-{1440,390}-2026-07-31-4.json` (con
> tipografía, `y` cruda e índice) · `qa:slugs` → `medidas/slugs.json` ·
> `qa:clon-base` → `medidas/clon-base-{1440,390}-grupoA-{antes,base26}.json`.

## 0 · Qué se emitió

| ruta | forma | instancias |
|---|---|---|
| `/[slug]` | entrada de blog · término de Kunakpedia | 7 + 3 |
| `/recursos/[...ruta]` | documento científico | 4 |

**14 de 209 a propósito.** Las 209 se pueblan en F2-2 con el extractor;
transcribir a mano lo que un extractor va a rehacer es trabajo tirado. Lo que sí
tenía que estar hoy es **cada eje capaz de romper la plantilla**, que es lo que
`PLAN-MUESTREO.md` §0 dice que no aparece hasta la instancia 2, 3 o 4.

## 1 · Las CUATRO correcciones al recon

Ninguna contradice una decisión; **tres corrigen un número y una añade campos**.
Van al ESQUEMA en esta misma tanda, que es la regla.

### 1.1 · El documento científico no tiene UN prefijo: tiene TRES

`ENRUTADO.md` §1 decía «solo los 23 documentos científicos tienen prefijo
propio», en singular. Las 23 URLs del censo dicen otra cosa:

| prefijo | páginas |
|---|---|
| `recursos/documentos-cientificos/articulos-cientificos-y-estudios` | 14 |
| `recursos/documentos-cientificos/evaluaciones-independientes` | 8 |
| **`recursos/estudios-cientificos/articulos-tecnicos`** | **1** |

O sea que la ruta es `recursos/<prefijo>/<categoría>/<slug>` con **dos** valores
de prefijo y **tres** de categoría — y la categoría es el término de
`scientific-category` que LH-2 ya había censado (3 términos, confirmados).

**Se modela como CMS-1 modeló el prefijo del caso de éxito**: campo `select` con
defecto, omitido cuando coincide. Y de ahí sale el catch-all `[...ruta]`: un
segmento fijo `documentos-cientificos` **se habría comido justo la instancia 1
de 23**, que es el modo de fallo que este proyecto ya conoce por su nombre.

### 1.2 · `text#2` del documento trae campos que el modelo no tenía

`<strong>Reche et al.</strong> | 2020` + el enlace a su categoría. **Autores y
año son campos**: varían en las 4 instancias medidas (`Reche et al.` ·
`Thibault et al.` · `Airparif` · `Revista Hydrocarbon Engineering`).

### 1.3 · El `h1` del término mide 44/52.8, no 18 — y no reduce a 390

`PAGE_TOPOLOGY.md` §5 y `ESQUEMA-CMS.md` §2.2 daban `text#1 font-size` = **18**
para término frente a 44 en blog y documento. **El 18 es del MÓDULO**; el `h1`
de dentro lo pisa y mide **44 / 52.8**.

El veredicto —plantilla— **no cambia**, porque sigue habiendo varianza cero
entre instancias. Lo que cambia es el número, y con él un hecho nuevo: el `h1`
del término **no reduce a 390** (44/52.8 a los dos anchos) mientras blog y
documento bajan a **35/42**, y además lleva `margin-bottom: 44`, que las otras
dos no tienen. Es una diferencia más a favor de «tres plantillas, no una».

> Y es la misma lección que ya está escrita: `CLAUDE.md` §El NIVEL al que se
> mide. El `color` computado de `text#1` sale **blanco** en las tres formas —
> blanco sobre blanco—: maquetar con el valor del contenedor habría dado un
> titular invisible. **El módulo no es el titular.**

### 1.4 · La autoría es PLANTILLA, no campo

«Escrito por el Equipo de marketing y comunicación», **idéntico en las 11
instancias que lo llevan** (7 de blog y 4 de documento). Varianza cero entre
instancias = plantilla, que es el discriminador del régimen plantillado.

Confirma por el otro lado la decisión de LH-2 D3 (**sin `autor`**), que se había
tomado porque no lo pide ningún listado. Tampoco lo pide el detalle.

⚠ Alcance: **11 de 209**. Que no varíe en 11 no prueba que no varíe en 209 — se
anota como **A-SP16**, no se cierra.

## 2 · A-SP12, cerrada por medición

`ENRUTADO.md` §4 la dejó como «deducido, no medido». Medida:

| petición | respuesta |
|---|---|
| `/slug-inventado-que-no-existe` | **404** |
| `/acesorios` (errata) | **404** |
| `/recursos/inventado/x/y` | **404** |
| las 14 declaradas | 200 |
| `/accesorios` (estática, colisiona con el plano) | 200, **la sirve la estática** |

`dynamicParams = false` **sí** devuelve los 404 y la estática **sí** gana. Las
dos mitades de la salida (a) del ENRUTADO quedan verificadas en ejecución.

## 3 · La guarda de slugs, probada con una colisión REAL

El test en negativo del PASO 1 usó una familia postiza (`SABOTAJE=accesorios`).
Con el catálogo ya construido se hizo **la de verdad**: `slug: "accesorios"`
añadido a `TERMINOS_KUNAKPEDIA`, build completo.

> **El build volvió a compilar sin un aviso** — 31 rutas, cero errores. Tercera
> confirmación independiente de que una colisión de datos es silenciosa.

`qa:slugs` la cazó por **A** (dos familias declaran el slug) y por **B** (lo
emite `/accesorios`, no `/[slug]`), exit 1. Congelada en
`medidas/slugs-COLISION-DELIBERADA-catalogo.json`. Retirada.

## 4 · Verificación

| comprobación | resultado |
|---|---|
| **0 regresión** en las 17 anteriores, umbral cero, 2 anchos | ✅ «sin mover un píxel» en las 17 × 2 |
| `qa:enlaces`, dos direcciones | ✅ limpia (2 980 hrefs al original · 868 internos) |
| `qa:corte` | ✅ 12/12 |
| `qa:slugs` | ✅ 14 slugs, 3 familias, 0 colisiones |
| lint · typecheck · build | ✅ |

**Los 6 href que pasaron a ser fallo, exactamente como se predijo.** Al emitir
las rutas del plano, 4 destinos distintos en **5 ficheros de `src/lib/`**
(`api` · `monografico` · `software` · `sectores` · `accesorios` · `monitor`)
dejaron de ser externos legítimos. La sonda los localizó con su `fichero:línea`;
**no se buscaron a mano**.

### 4.1 · La base EN CRUDO — la medida que se hace una vez por arquetipo

`CLAUDE.md` §Notas de método la exige antes de fiarse de ningún Δ de cuerpo,
porque la regla del `h1` resta la base y **no puede auditarse a sí misma**.

| forma | clon @1440 | original | Δ | clon @390 | original | Δ |
|---|---|---|---|---|---|---|
| blog CON relacionados | 332.58 | 332.59 | **−0.01** | 343.58 | 317.58 | **+26.00** |
| blog SIN relacionados | 332.58 | 332.59 | **−0.01** | 291.58 | 291.58 | **0.00** |
| término | 346.95 | 346.98 | **−0.03** | 295.45 | 295.47 | **−0.02** |
| documento científico | 332.58 | 332.59 | **−0.01** | 369.58 | 317.58 | **+52.00** |

**La banda de cabecera no se copió de ninguna plantilla: se dedujo por
composición** de esa `y` cruda — 332.59 − 50 (`section#0`) − 57.59 (`section#1
pt`) = **225** a 1440, y 317.58 − 102 − 50 = **165.58** a 390. Cuadra en las tres
formas: el término da 346.98 porque su `row#1` añade `pt 14.39`.

### 4.2 · El primer intento dio +4.58 constante, y la composición lo resolvió

Un residuo **idéntico en las tres formas** es una sola causa por encima del
`h1`. La composición la señaló sin ambigüedad:

```
original @1440   12 + 26   + 12 = 50    = section#0 ✓
original @390    12 + 3×26 + 12 = 102   = section#0 con la miga a 3 renglones ✓
clon con 30.6    12 + 30.6 + 12 = 54.6  → +4.6, que es el +4.58 medido
```

La miga se había maquetado con el `line-height` del **módulo** (30.6) cuando el
elemento ocupa **26**. **Tercera vez en este mismo arquetipo** que el contenedor
tapa la propiedad que se estaba preguntando — las otras dos: el `color` blanco
del módulo del titular (§1.3) y el `font-size` 18 del término.

## 5 · ⚠ ABIERTO — A-QA1, la miga envuelve de más a 390

**+26.00** en blog con relacionados y **+52.00** en documento; **0.00** y
**−0.02** en las otras dos. El residuo está **cuantizado en renglones de 26**:
son 1 y 2 renglones de más, no un desfase continuo — o sea que la maqueta es
correcta y lo que sobra es **ancho de la miga**.

La causa candidata, sin medir: el separador. El clon pinta `›` con `mx-6`
(12 px de aire por separador); el original lo genera el CSS del tema y **no se
ha medido**. Con 4 separadores eso son ~48 px de más, bastante para forzar un
renglón. **No se toca hasta medirlo**: ajustar el margen a ojo hasta que cuadre
es exactamente el arreglo falso que este proyecto documenta.

Ficha en `PENDIENTES-QA.md`.

## 6 · SIN PROBAR nuevos

| # | qué | por qué |
|---|---|---|
| **A-SP14** | el índice de escritorio trae **21 ítems** y el móvil **16** en la misma página | son los dos módulos de la misma corrida. Qué los diferencia (¿`h3` en uno y no en otro?) no se ha medido. El clon proyecta **solo los `h2` en los dos**, que es lo que §2.2 dice |
| **A-SP15** | la geometría interior de la tarjeta del bloque de relacionados | solo está medido el alto del módulo (458.52 a 1440). El original **sortea los 3 posts en cada carga** (P4) y ésa es la región de ruido de hasta 81 px |
| **A-SP16** | que la autoría sea constante en las **209** | medida en 11 |

## 7 · Desviaciones deliberadas

1. **El bloque de relacionados se emite solo en español.** El original sirve el
   rótulo y el botón en **es · en · ar** a la vez y esconde dos por CSS: medido,
   `text#7`/`text#8` y `button#0`/`button#2` dan **w 0 · h 0** a los dos anchos.
   Reproducir dos módulos invisibles no mueve un píxel y sí mete texto inglés y
   árabe en el HTML de una página española.
2. **La consulta de relacionados elige entre 7 entradas, no entre 149.** No es
   una decisión: es lo que hay hasta F2-2.
3. **`@next/next/no-html-link-for-pages` desactivada**, con la razón medida en
   `eslint.config.mjs`: con el plano de raíz emitido, cualquier href literal de
   un segmento casa con `/[slug]` y la regla dispara sobre enlaces verificados
   desde hace meses. La guarda que importa aquí es `qa:enlaces`, que compara
   contra las rutas que emite el build.

## 8 · ⚠ El corpus NO es byte-estable entre cargas — hallazgo de la limpieza

Salió al comparar dos congelaciones de `a-spec` del **mismo día**: **misma
longitud, contenido distinto** en 4 de las 14 instancias.

```
… <script type="f1647b948470883fc1a5f3e3-text/javascript">   ← carga 1
… <script type="8211bb7fddbaf4eb525ec1ce-text/javascript">   ← carga 2
```

Es **Rocket Loader de Cloudflare**, que reescribe `type="text/javascript"`
poniéndole delante un token de 24 hex **distinto en cada petición**, para
aplazar la ejecución. **5 ocurrencias en 4 de las 14 páginas** — las que llevan
`<script>` dentro del cuerpo.

**Tres consecuencias, y ninguna es cosmética:**

1. **`ESQUEMA-CMS.md` §3.3 no cambia** —«`script` no entra», los 17 acaban en
   nodo-embed tipado o en eliminación documentada— pero gana un argumento que no
   tenía: ese `type` **no lo escribió nadie**, lo inyecta el CDN. Migrarlo
   verbatim sería importar como contenido un artefacto de la capa de entrega.
2. **El extractor de F2-2 tiene que normalizarlo**, o dos corridas de import no
   diffearán limpio nunca y cada re-import marcará 4 páginas como cambiadas sin
   que haya cambiado nada. Es ruido que se propaga al historial del CMS.
3. **`CLAUDE.md` §«el original no es un objetivo de medición estable» vale
   también para el CONTENIDO**, no solo para la geometría. La regla se escribió
   para alturas; esto es la misma clase de problema un nivel más abajo, y la
   detectó **congelar dos veces y comparar** — que es exactamente para lo que
   sirve la guarda de `w()`.

Evidencia conservada: `medidas/a-spec-SEGUNDA-CARGA-token-cloudflare.json`.
