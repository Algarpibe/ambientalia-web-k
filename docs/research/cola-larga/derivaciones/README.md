# Derivaciones de la cola larga (F3-3) — 90.ª tanda, 2026-08-22

> ⚠ **Esto NO son sondas y NO viven en `scripts/qa/`.** No miden nada del sitio:
> **leen congeladas y corpus que ya estaban en el repo** y publican el cruce. Por
> eso no declaran `Evaluadas` ni congelan en `medidas/` — no hay medida que
> proteger, hay una derivación que exhibir (§regla 2: *si una conclusión se cita
> en un doc, tiene que existir el fichero del que salió*).
>
> **El original no se abrió en ningún momento.**

Las cifras que estos cuatro ficheros producen son las que citan
`PLAN-FASE-3.md` §F3-3 y `HANDOFF.md` §4.

| script | contesta | NO contesta | salida |
|---|---|---|---|
| `inv-f33.mjs` | ¿está capturado el HTML de cada una de las **48 RUTAS**? | **si una ausencia es un hueco o una NO-PÁGINA** — eso lo contesta `modulos-f33-v4.mjs` §6 | `inv-f33.log` |
| `css-f33.mjs` | ¿están capturadas **sus hojas**? | qué dicen esas hojas | `css-f33.log` |
| `sondas-f33-v2.mjs` | ¿la ha **medido** alguna congelada no-artefacto? | qué midió, ni con qué calidad | `sondas-v2.log` |
| ~~`modulos-f33-v2.mjs`~~ → **`modulos-f33-v4.mjs`** | qué **tipos de módulo** trae cada una, por capa, **y cuáles no tienen bloque en el repo** | **ni un píxel** | `mod-v4.log` |

> ⚠ **v2 → v3 (91.ª tanda) — la tercera vez que este censo falla por §sondas 4, y
> ahora en la LISTA CONTRA LA QUE COMPARA.** v2 usaba
> `YA = ["text","image","button","blurb","cta","divider","code","gallery"]`,
> escrita a mano, que acredita a `MonoSeccion[]` **cuatro tipos que no expresa**:
> `blurb`/`gallery` viven en `MODULOS_KB` y `code`/`divider` **no existen en
> ninguna unión**. v3 **deriva el conjunto del registro de bloques**
> (`packages/cms-config/src/bloques/*.ts`) en vez de reescribir la lista —
> §regla 9 caso 7: *lo nuevo entra solo*— y separa la **retícula**
> (`section`/`row`/`column*`) de los **módulos de contenido**, que es la unidad
> que decide el modelo. Control: si el parseo casa con 0 slugs, **tira**.
>
> Efecto: fuera de `MonoSeccion[]` **7 → 9**, hubs L4 **NINGUNO → 1**, sueltas
> **5 → 7**. `code` (**9/19** sueltas) se había perdido entero.

**Añadidos en la 91.ª:**

| fichero | qué dice |
|---|---|
| `sueltas-16-reverificadas-2026-08-22.json` | las 16 «sin capturar» **no son páginas**: 13 × 301 · 3 × 404, re-preguntadas al origen vivo. Misma respuesta que el 2026-08-09 |
| `css-f33-2026-08-22.log` | el estado **final** tras pagar la precondición: **32/32 páginas con TODAS sus hojas** |
| `css-f33-2026-08-22-mitad-campana.log` | el estado **intermedio**, con 15 hojas en 404. Se conserva porque es la evidencia de que el `et-cache` se recompila al pedir la página: los mismos 15 dieron 200 tras calentar sus 8 páginas |

`reg-f33.log` es la lectura del `<body>` servido (régimen) y el recuento de
secciones propias, de donde salen R5 y R6.

## Las dos versiones que se descartaron, y por qué — las dos son §sondas 4

**`sondas-f33` v1 → v2.** v1 aceptaba la ruta **sin `/es/`**, y esa forma es en
los extractores la clave de un **recuento de enlaces entrantes**
(`"/contacto": 4`), no una medida. Daba **22/35 sueltas «medidas»**, todas
falsas. Lo destapó **abrir un caso a mano** contra `c-extraido.json` y
`extractor-corpus.json`. v2 exige `/es/…` y lleva **control en negativo**: una
ruta inventada tiene que casar en **0** ficheros — y casa en 0. Sin ese control,
un patrón que sobre-casa vuelve a salir con cara de dato.

**`modulos-f33` v1 → v2.** v1 contaba **clases modificadoras** (`gutters3`,
`menu__wrap`, `with_background`, `scroll_top`) como si fueran tipos de módulo, y
publicaba «19 tipos fuera de `MonoSeccion[]`» donde hay **2**. v2 usa cómo Divi
nombra la **instancia** de un módulo —`et_pb_<tipo>_<n>`, con `_tb_<capa>` cuando
viene del theme builder—, lo que además **separa las dos capas**, que es el
discriminador de régimen de este repo. Las dos versiones daban un número
plausible; sólo una nombra lo que dice nombrar.

> **Y en las dos el `<style>`/`<script>` va fuera antes de buscar marcado**: el
> CSS de Divi nombra sus propias clases, así que `et_pb_toggle` aparece en
> páginas que no tienen ni un toggle. Es la trampa que ya costó un «sí en las 35»
> en el recon de listados.
