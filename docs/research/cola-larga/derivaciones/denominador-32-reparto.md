# El 32 tras S1 — reparto DERIVADO y clasificado POR UNIDAD

> **93.ª tanda, 2026-08-22, ESCALÓN 1 punto 2.** El encargo pedía derivar sitio
> a sitio en qué unidad está escrito cada número **antes de tocarlo**, y
> publicar el reparto como se hizo con los 19 del 48. Aquí está, con su cero.

## El hallazgo que ordena todo lo demás: ahora son **TRES** unidades, no dos

La 92.ª estableció que 48 y 32 no eran dos lecturas sino **dos unidades del
mismo conjunto**, las dos ciertas. S1 no añade una lectura: **parte una de las
dos unidades en dos**, y la que se parte es la que más se cita.

| unidad | n | qué es | quién la usa |
|---|---|---|---|
| **RUTA** | **48** | URLs que el original sirve *de algún modo* | F3-3: lo que la fase **RESUELVE** |
| **CAPTURADA** | **32** | documentos de la cola larga con HTML propio | **toda medida hecha sobre el corpus** |
| **DOCUMENTO DE `paginas`** | **31** | lo que la colección **ALOJA** | CMS-3: el esquema, el opcional, la emisión |

```
48 RUTAS = 31 páginas + 1 entrada de blog + 13 redirecciones + 3 bajas
```

> ⚠⚠ **LA TRAMPA DE ESTA TANDA, Y ES LA CONTRARIA A LA DE LA 92.ª.** Allí el
> riesgo era **sustituir 48 por 32 en todas partes**. Aquí el riesgo es
> sustituir **32 por 31**, y es peor por un motivo que no se ve al leer:
>
> > **S1 NO DESCAPTURA NADA.** Se capturaron 32 documentos y se siguen habiendo
> > capturado 32. Lo que S1 cambió es **de qué colección es uno de ellos**. Así
> > que toda medida hecha *sobre el corpus* —el censo de tipos, las hojas, el
> > `<body>`, los módulos— **conserva su 32 y es correcta**; sólo baja a 31 lo
> > que habla de **lo que `paginas` aloja**.
>
> Es §*corregir un denominador no es sustituirlo en todas partes* aplicada por
> segunda vez en dos tandas, y la segunda vez **con una unidad más**. El barrido
> a ciegas habría roto **17 sitios** que estaban bien.

## Método

`grep -rn "\b32\b"` sobre `docs/`, `packages/`, `scripts/` y
`docs/research/cola-larga/`, filtrando los 32 que no son de la cola larga:
`32px`, `±32.28`, `+32.59`, `margin-bottom: 32`, `td×32`, `31→32 rutas` (F2-5),
`47.25 · 47 · 32 · 50.5` (retícula) y `32/32 azul×4`.

## El reparto — **29 sitios**, clasificados

### (a) Unidad **CAPTURADA** — **17**. CIERTOS, se quedan en 32

Son medidas *sobre el corpus*, y el corpus no cambió:

| dónde | qué mide |
|---|---|
| `ESQUEMA:1562` | censo de marcado de las 32 capturadas |
| `ESQUEMA` §2j.1 C2 (`:3799`) | «20 de las 32 páginas leídas» — el censo que decidió C2 |
| `ESQUEMA` §2j.2 (`:3888`×3) | «derivada de 32 de 48» · «COMPLETA para las 32» · «32 de 32 con todas sus hojas» |
| `ESQUEMA` §2j.3b (`:3931`…`:3992`, 7 sitios) | **el acta de la 92.ª**: `30 de 32`, la tabla por régimen, el sabotaje B a `32/32`. Es el registro de lo que se midió aquel día |
| `PLAN:728` · `:833` · `:838` · `:871` · `:902` | «de las 32 capturas» · hojas `32/32` · «plausibles y falsos en 26 de 32» · «censado el marcado de las 32 páginas capturadas» · «leído el `<body>` servido de las 32» |
| `PLAN:943` · `:944` · `:946` | las tres filas de evidencia C1/C2/C3-vs-C4 — medidas del corpus en su momento |
| `HANDOFF:205` · `:207` · `:229` · `:231` | «de las 32 capturadas sólo 6 tienen sus hojas» · «26 de 32» · «7 de las 32» · «25 de las 32» |

> **Ninguno era falso y ninguno se toca.** Lo que se les añade —donde el texto
> lo permitía sin reescribir un acta— es **la palabra «capturadas»**, que es lo
> único que los distinguía de un denominador de colección al leerlos.

### (b) Unidad **DOCUMENTO DE `paginas`** — **8**. Corregidos a 31

| dónde | decía | dice |
|---|---|---|
| `ESQUEMA:1551-1553` | «en unidad PÁGINA son 32 · 32 lo que la colección ALOJA» | **la tabla de las TRES unidades**, con `48 = 31 + 1 + 13 + 3` |
| `ESQUEMA` §2j.2, tabla | «documentos de `paginas` **32**» | **31** + fila nueva «entrada de blog **1**» |
| `ESQUEMA:3927` | «re-aceptar las **32** a umbral cero» | **31** |
| `ESQUEMA:4116` (§2j.4) | «0 ejes comparados en las **32**» | **0 ejes comparados en las 31** |
| `PLAN:718` (título §F3-3) | «48 RUTAS = 32 páginas + 13 + 3» | **31 páginas + 1 entrada + 13 + 3** |
| `PLAN:722` | las dos unidades | **las tres** |
| `PLAN:766` · `:800` · `:809` | «7 + 6 + 35 = 48 (= 32 páginas)» · «no tiene 48 sino 32» · fila «páginas 32» | **31**, con las 18 sueltas |
| `PLAN:978` · `:982` · `:983` | entrega «**32** páginas emitidas con Δ0» | **31 páginas + 1 entrada + 13 redirecciones** |

### (c) Argumentos **SUPERADOS** por el mecanismo, no por el número — **2**

`ESQUEMA:3800` (fila C4) y `PLAN:946` decían *«en C3 el campo de bloques tiene
que ser opcional para las 32»*. **El número no es lo que está mal: el mecanismo
sí.** §2j.3c midió que el opcional **nunca expresó** esas dos páginas —§*un
campo opcional no expresa un caso, sólo permite que falte*— y quien las expresa
es una colección distinta (S1) y un campo rico (S2).

**Se marcan como superados en vez de reescribirse**, porque son la celda de
evidencia de una comparación ya cerrada: cambiar el argumento cambiaría el
registro de por qué se eligió C3.

### (d) Predicados **pre-registrados** — **2**. NO se tocan

`PRE-REGISTRO-CMS-3.md:224-225` — *«`map` en una página que no sea `/es/contacto/`:
NO, 1 de 32»* y *«`icon` fuera de `/es/soporte/`: NO, 1 de 32»*. Son unidad
CAPTURADA **y** son pre-registro: ni el número está mal ni el texto se reescribe.

### (e) El cero que hay que escribir aunque sea cero

> **Sitios donde el 32 esté CABLEADO dentro de un instrumento: 0.**

Derivado, no supuesto. Los cuatro `.mjs` de `derivaciones/` que tocan el
conjunto (`inv-f33` · `css-f33` · `modulos-f33-v4` · `prueba-union-f33`) sacan su
cardinal de `corpus/fase-3/LISTA-DERIVADA.json`, y `regimenes-corpus` lo saca del
árbol. **Ninguno escribe 32.**

Y en `prueba-union-f33` el 31 **tampoco** se escribe: se deriva restando los que
otra colección aloja, discriminados por `single-post` en el `<body>`. Si mañana
otra suelta resultara ser una entrada, el denominador baja solo — que es la
diferencia entre un número derivado y uno recordado (§regla 9).

## Control de que la clasificación está hecha

```
grep -rn "\b32\b" docs/ packages/ scripts/  →  29 sitios de la cola larga
      17 (a) CAPTURADA · ciertos, intactos
       8 (b) `paginas`  · corregidos a 31
       2 (c) superados por mecanismo · marcados
       2 (d) pre-registro · intactos
      ─────
      29     y 0 sin clasificar
```

> **La prueba de que el barrido a ciegas era el error:** de los 29, **21 no
> había que tocarlos** (17 + 2 + 2). Sustituir 32 por 31 en todas partes habría
> convertido 21 aciertos en 21 fallos, y ninguno habría dado error — las dos
> lecturas se escriben igual.
