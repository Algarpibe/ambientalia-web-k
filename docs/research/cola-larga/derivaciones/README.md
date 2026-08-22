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
| `inv-f33.mjs` | ¿está capturado el HTML de cada una de las 48? | nada de geometría ni de modelo | `inv-f33.log` |
| `css-f33.mjs` | ¿están capturadas **sus hojas**? | qué dicen esas hojas | `css-f33.log` |
| `sondas-f33-v2.mjs` | ¿la ha **medido** alguna congelada no-artefacto? | qué midió, ni con qué calidad | `sondas-v2.log` |
| `modulos-f33-v2.mjs` | qué **tipos de módulo** trae cada una, por capa | **ni un píxel** — el corpus de 26 de 32 está sin sus hojas | `mod-v2.log` |

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
