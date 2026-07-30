# ENRUTADO — CMS-2 resuelto con una prueba, y una recomendación

> **2026-07-30.** `../RECON-LISTADOS.md` §CMS-2 dejó tres salidas y no eligió.
> Aquí se elige, porque **bloquea la construcción**: el arquetipo A son 209
> páginas y 187 de ellas cuelgan de la raíz de `/es/`.
>
> El §CMS-2 pedía confirmar o desmentir **con una prueba, no con un
> razonamiento**. Se hizo: andamio `src/app/[slug]/page.tsx` con una **colisión
> deliberada**, medido y borrado. El árbol quedó verificado en su sitio.

## 1 · El problema, recordado con el dato

**202 slugs de cinco familias comparten el espacio de nombres plano de `/es/`**:

| familia | slugs en la raíz |
|---|---|
| `post` (entradas de blog + `blog`) | **150** |
| `glossary` (términos + `glosario`) | **38** |
| `page` | 7 |
| `solutions` | 6 — incluidas **4 rutas que el clon ya sirve** |
| `case-studies` · `faqs` (índices) | 1 + 1 |

Del arquetipo A, **187 de sus 209 páginas están ahí** (150 blog + 37 término).
Solo los 23 documentos científicos tienen prefijo propio.

## 2 · La prueba

Andamio: una ruta dinámica de raíz `src/app/[slug]/page.tsx` cuyo
`generateStaticParams` declara dos slugs — uno libre (`andamio-slug-libre`) y
**uno que colisiona a propósito con la ruta estática `/accesorios`**, que el clon
ya sirve.

### Resultado 1 · El build no dice nada

```
Route (app)
├ ● /[slug]
│ ├ /andamio-slug-libre
│ └ /accesorios          ← declarado por el dinámico
├ ○ /accesorios          ← y la ruta estática, a la vez
```

**Compila sin error y sin aviso**, y emite `/accesorios` por las dos vías.

### Resultado 2 · La ruta estática gana

| petición | qué sirvió |
|---|---|
| `/accesorios` (colisión) | **la ESTÁTICA** — `<title>Accesorios para sensores…`, sin el marcador del andamio |
| `/andamio-slug-libre` | la dinámica |
| `/monitor-calidad-aire` | la estática, intacta |

**Confirmado: en Next, un segmento estático gana a un `[slug]` dinámico del
mismo nivel.** Replicar el plano del original **es seguro en ejecución**.

### Resultado 3 · …pero el dinámico se traga todos los 404 de un segmento

Y esto **no** estaba en el §CMS-2:

| petición | con el andamio | sin él |
|---|---|---|
| `/slug-inventado` | **HTTP 200**, sirve la página dinámica | **404** |
| `/sectores/no-existe` | 404 | 404 |
| `/a/b/c-inventado` | 404 | 404 |

Un `[slug]` de raíz **captura cualquier ruta de un solo segmento que no haya
casado antes**, porque `dynamicParams` está activo por defecto. Las rutas
anidadas no se ven afectadas.

**Consecuencia:** con un `[slug]` de raíz, **el sitio deja de tener 404 de un
segmento**. Un enlace con una errata (`/acesorios`) responde 200 con la página
equivocada en vez de fallar.

### Resultado 4 · La guarda de enlaces sobrevive, y por cómo está hecha

`enlaces.mjs` siguió **limpia y correcta** con el andamio puesto. No por suerte:
compara los hrefs internos contra **las rutas del `prerender-manifest`**, no
contra el HTTP en vivo. Un href con errata seguiría marcándose como roto aunque
el servidor devuelva 200.

Si la guarda comprobase por petición HTTP —que era la forma «obvia»— **se habría
vuelto ciega justo cuando más falta hace**. Es la regla de `CLAUDE.md` §El
principio pagando dividendos: se compara contra lo que emite el build.

## 3 · La recomendación

> **Salida (a): replicar el plano del original, con unicidad ENTRE familias
> impuesta en el esquema y una guarda que falle en build.**

Y con esta forma concreta:

1. **Rutas estáticas para lo que ya es estático.** Las 11 actuales se quedan como
   están: la prueba dice que ganan siempre.
2. **Un solo `[slug]` de raíz** para las familias planas (blog, término, y lo que
   venga), despachando por slug contra los catálogos — **exactamente el patrón
   que `/sectores/[slug]` ya usa** para servir dos arquetipos.
3. **`dynamicParams = false`** en ese `[slug]`. Es la línea que devuelve los 404:
   sin ella, el resultado 3 dice que el sitio se traga cualquier ruta inventada.
4. **La unicidad es entre familias, no dentro de cada una.** Es el cambio de
   modelo que la prueba obliga: en WordPress cada CPT garantiza slugs únicos
   *dentro de sí*, y eso **no basta** — el conflicto es blog × término × página ×
   `solutions`. En el CMS: un índice único sobre `(slug)` que cruce los tipos que
   viven en la raíz.
5. **Una guarda que falle en build**, no en revisión. La colisión no da error hoy
   (resultado 1), así que hay que fabricarlo: comparar los slugs de todos los
   catálogos planos contra las rutas estáticas emitidas y salir con código ≠ 0.
   Es el mismo patrón que `enlaces.mjs` y `corte-cuerpo.mjs`, y se deriva del
   `prerender-manifest` para que se automantenga.

### Por qué (a) y no las otras dos

| salida | por qué no |
|---|---|
| **(b)** dar prefijo en el CMS (`/glosario/<slug>`) | **rompe 187 URLs vivas** del original y contradice la regla 1 del proyecto (fidelidad al píxel *y a la topología de URLs*, que es lo que ya decidió `/sectores/[slug]` sirviendo dos arquetipos). Sería la primera desviación estructural del clon |
| **(c)** modelar los términos como páginas de un tipo | funciona para el glosario y **no resuelve el caso grande**: las 150 entradas de blog seguirían en el plano. Cambia el síntoma de sitio |

**(a) es además la única que ya está probada en este repo**: `/sectores/[slug]`
despacha dos arquetipos por slug contra dos catálogos desde el monográfico, y
`enlaces.mjs` lo vigila.

## 4 · Lo que esta decisión NO cubre

- **El caso de éxito sigue con dos patrones de ruta** (CMS-1): 53 en
  `/es/casos-de-exito/` y 4 en `/es/case-studies/`. Eso es prefijo, no plano, y
  se decide cuando se aborde el grupo C.
- **`dynamicParams = false` no está probado aquí.** Se deduce del resultado 3;
  **no se midió**. Queda como **A-SP12**.
- **El coste de emitir 209 rutas estáticas** no se ha medido. El build actual
  emite 11 en ~1 s; 220 es otro orden. **A-SP13.**

## 5 · El árbol quedó como estaba

| comprobación | resultado |
|---|---|
| `src/app/[slug]/` borrado | sí; `src/app/` vuelve a sus 6 entradas |
| rutas emitidas | **11**, las de siempre |
| `/slug-inventado` | **404** otra vez |
| `npm run qa:enlaces` | limpia en las dos direcciones |
| `npm run qa:corte` | **12/12** |
| `npm run check` | verde, 0 errores |
