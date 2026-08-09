/**
 * LA UNIÓN PROPIA DE `articulos-kb` — §2d.1, y **medida** por `qa:kb-recon`
 * sobre la captura congelada de F3-0 (36 blurbs y 1 galería en 6 instancias).
 *
 * ── Por qué vive aquí y no en `contenido.ts` ───────────────────────────────
 * §2d.1 lo decidió con predicado: *«tipo propio por arquetipo; `MonoModulo`
 * intacto. `blurb`/`gallery` → unión propia de `articulos-kb`»*, porque P-K1
 * salió ❌ — **no aparecen en SECTOR ni en MONOGRÁFICO**. Meterlos en
 * `MODULOS_COMPARTIDOS` los metería en `MonoSeccion[]` por la puerta de atrás,
 * que es el arreglo falso de §1.5b Razón 1.
 *
 * Y la otra mitad de la misma decisión: **lo compartido se CONSUME, no se
 * duplica** — *lo que se duplica es el documento, no la definición*. Por eso
 * este fichero **importa** `moduloBase`, `nivelTitular`, `inline` y `subida` en
 * vez de re-escribirlos: dos definiciones de «el nivel del titular» es la clase
 * C7, y las dos salidas seguirían verdes mientras divergen.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE LA MEDIDA DICE DE CADA CAMPO — `medidas/kb-recon.json`
 *
 * Régimen: capa propia de BUILDER (el centro de ayuda es híbrido), así que el
 * discriminador es la **varianza entre hermanos** (test B). Alcance: **36
 * blurbs en 3 artículos**, que es todo lo que el arquetipo tiene.
 *
 * | propiedad | medido | veredicto |
 * |---|---|---|
 * | `imagen` | 30/36 | **opcional** — 6 blurbs no la traen |
 * | `descripcion` | 24/36 | **opcional** — 12 no la traen |
 * | nivel del titular | `h4`×27 · `h3`×9 | **CAMPO** — varía entre instancias |
 * | retícula | `iconos-xs-2 iconos-md-3`×24 · `col-md-4`×9 · ninguna×3 | **CAMPO**, y con TRES valores |
 * | alineación | `center`×27 · `left`×9 | **CAMPO** |
 * | enlace | **0/36** | **NO EXISTE** — no se añade |
 *
 * ⚠ **Y lo que NO se cablea, con su nombre:** `et_pb_blurb_position_top` y
 * `et_pb_bg_layout_light` salen **36/36**, y `estiloInline` es `null` en las
 * 36. Cero varianza **no prueba plantilla**: prueba que en las instancias que
 * existen nadie lo tocó. Van al componente y quedan **SIN PROBAR** anotados —
 * cablearlos como campo con un solo valor es inventarse un enum, y darlos por
 * plantilla es lo que costó las ocho propiedades del monográfico.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { Block } from "payload";
import { campoHtml, conDefecto, subida } from "../campos/comunes.ts";
import type { Field } from "payload";
import { nivelTitular } from "./contenido.ts";
import { moduloBase } from "../campos/comunes.ts";

/**
 * La retícula del blurb — **el número de columnas que el editor le pone**, y es
 * lo que Divi escribe como clase de módulo. Tres valores medidos y ninguno
 * inventado: `iconos` (xs-2/md-3) · `col-md-4` · ninguna.
 *
 * ⚠ **`ninguna` es un valor, no la ausencia del campo.** Los 3 blurbs de
 * `que-puedes-hacer-con-kunak-air` que no llevan clase de retícula la tienen
 * *deliberadamente* quitada por quien editó, y eso los pinta a ancho completo.
 * Modelarlo como «campo ausente» obligaría a distinguir «no lo puso» de «lo
 * quitó», que es la ambigüedad que §7e acaba de cerrar por el otro lado.
 */
export const reticulaBlurb: Field = conDefecto(
  { name: "reticula", type: "select", options: ["iconos", "col-md-4", "ninguna"] } as Field,
  "iconos",
  "kb-recon · iconos×24 · col-md-4×9 · ninguna×3",
);

/** Alineación del contenido del blurb. `center`×27 · `left`×9. */
export const alineacionBlurb: Field = conDefecto(
  { name: "alineacion", type: "select", options: ["center", "left"] } as Field,
  "center",
  "kb-recon · center×27 · left×9",
);

/**
 * `blurb` — icono + titular + descripción. El módulo más numeroso del
 * arquetipo (36) y el que HD1 no podía expresar.
 *
 * `imagen` usa **`subida`** y no `imagen()`: es la misma relación a `media` que
 * el resto del proyecto, importada, no una segunda definición.
 *
 * ⚠⚠ **`descripcion` era `inline` sobre una afirmación FALSA, y se corrige aquí
 * con la medida delante (2026-08-09, §2d.3).** Esta cabecera decía:
 *
 *   > *«lo medido son `<p>` con texto, sin una sola etiqueta fuera de ese
 *   > conjunto en los 24. Si aparece una, se amplía el campo con la medida
 *   > delante»*
 *
 * La segunda frase es la regla correcta; **la primera no se había derivado**.
 * Recorriendo `medidas/kb-recon.json → descripcionHtml` (los mismos bytes que ya
 * estaban congelados cuando se escribió): **`p×24 · br×1 · img×6`**. Los 6
 * `<img>` son las capturas de pantalla de `que-es-kunak-air` **dentro de la
 * descripción del blurb**, no en su icono.
 *
 * O sea que el tipo medido es **rico de bloque** ⇒ `campoHtml`, igual que el
 * `cuerpo` de grupo A. Es §sondas 9 —*un recuento afirmado de memoria se barre
 * antes de usarse*— cobrada sobre una cabecera que citaba «los 24» sin haberlos
 * recorrido, y es la **tercera** instancia de `inline` prestado a un campo cuyo
 * tipo medido es rico (§2d.3): `productos.bullets` · `MODULO_TEXTO` · ésta.
 */
export const MODULO_BLURB: Block = {
  slug: "blurb",
  labels: { singular: "Blurb", plural: "Blurbs" },
  fields: [
    { name: "titulo", type: "text", required: true },
    nivelTitular,
    subida("imagen"),
    { name: "alt", type: "text" },
    campoHtml("descripcion"),
    reticulaBlurb,
    alineacionBlurb,
    ...moduloBase,
  ],
};

/**
 * `gallery` — **1 módulo en las 6 instancias, con 6 items.**
 *
 * ⚠ **Una sola instancia es la FAMILIA DE CALIBRACIÓN**, así que este bloque se
 * escribe con lo que hay y **se declara que no discrimina nada**: con n=1 no se
 * sabe qué es plantilla y qué es campo, exactamente como PRODUCTO/CATÁLOGO/
 * SOFTWARE/API (§precondición 1) y como `anchoPct: 90`, que vivía en una sola
 * de cuatro instancias. El día que aparezca una segunda galería, se re-mide.
 *
 * Por eso `n` NO es un campo: el número de items es la longitud del array, y
 * un campo que duplique una longitud es un dato que puede mentir.
 */
export const MODULO_GALLERY: Block = {
  slug: "gallery",
  labels: { singular: "Galería", plural: "Galerías" },
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      fields: [subida("imagen", { requerida: true }), { name: "alt", type: "text" }, { name: "titulo", type: "text" }],
    },
    ...moduloBase,
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 * `texto-kb` — EL MÓDULO DE TEXTO DEL ARQUETIPO, y el acta del escalón
 *
 * Resuelve §F3-1-ESCALON-TEXTO. El acta completa, con su medida y su tabla de
 * poblaciones, está en `ESQUEMA-CMS.md` §2d.3; aquí va lo que hay que saber
 * para leer el código.
 *
 * ── Lo que el escalón preguntaba, y lo que lo disolvió ─────────────────────
 * `qa:kb-recon` midió que el tipo COMPARTIDO (`MODULO_TEXTO`, con `BLOQUES_TEXTO`
 * y textos `inline` = párrafo + negrita) **no expresa** 7 de las 16 etiquetas
 * que traen los 85 `et_pb_text` de KB. El dilema escrito era: ¿módulo propio
 * para KB, o ensanchar el compartido y tocar un tipo poblado?
 *
 * **Ninguna de las dos, porque la pregunta de antes no se había hecho:**
 *
 *   > **¿sobre qué POBLACIÓN se derivó el tipo compartido?**
 *
 * Sobre `MonoInline`, que es **dato TRANSCRITO A MANO** a `apps/web/src/lib`. Y
 * una transcripción **no se puede auditar contra sí misma**: lo que no se
 * transcribió no está ahí para contarlo. Medido contra el ORIGINAL de los 8
 * `/es/sectores/*` (capturados para esto, porque no estaban en ningún corpus)
 * por `npm run qa:texto-poblacion` — un instrumento, dos poblaciones, con
 * control contra `kb-recon`:
 *
 * | en PROSA, fuera del tipo | n |
 * |---|---|
 * | `articulos-kb` (6 páginas · 85 módulos) | `span·sub·a·i·em·img·sup` — **7** |
 * | **SECTOR/MONOGRÁFICO** (8 páginas · 175 módulos de prosa) | `span·sub·td·tr·th·h5·div·br·em·table·thead·tbody` — **12** |
 *
 * O sea que **el tipo ya se le quedaba corto a sus PROPIOS consumidores**, y KB
 * no es el recién llegado que rompe nada: es el primero que se midió contra el
 * original en vez de contra su transcripción. **`inline` no está corto: está
 * INFRA-ESPECIFICADO**, y ensancharlo corrige una medición.
 *
 * ── El segundo testigo, y es el que no admite réplica ──────────────────────
 * La transcripción misma improvisó **tres veces** para rodear lo que su tipo no
 * podía decir, en un solo fichero (`apps/web/src/lib/monografico.ts`):
 *
 *   · l. 585-589 · `<strong>H<sub>2</sub>S…` → `[{b:"H"},{b:"2"},{b:"S…"}]`
 *                  — el subíndice **aplanado a negrita**;
 *   · l. 627·633·639 · `H<sub>2</sub>S, CH<sub>4</sub>` → `"H₂S, CH₄"`
 *                  — **carácter Unicode**, otro apaño, 40 líneas más allá;
 *   · l. 622 · el `<table>` del cuerpo → `kind: "tabla"`, un **kind inventado**.
 *
 * Tres apaños distintos para la misma carencia es la firma de un tipo corto, no
 * de tres decisiones.
 *
 * ── La decisión, que es la FRONTERA que `CLAUDE.md` ya tenía escrita ───────
 *
 *   > *Hasta el contenedor de contenido, la estructura se modela. A partir del
 *   > contenedor, el contenido lleva su propia estructura dentro y se declara
 *   > RICO.*
 *
 * El módulo, su ritmo, su ancho y su sitio en la fila **siguen modelados** —eso
 * es estructura y lo pone quien maquetó—. Lo de dentro es **un campo HTML**,
 * como el `cuerpo` de grupo A y por la misma razón (CMS-0e: *HTML crudo
 * primero*; §3.1d: *el sitio de aterrizaje ES el campo definitivo*). No se
 * inventan 12 formas de bloque para documentos que ya traen la suya.
 *
 * ⚠ **Y lo que este bloque NO hace: tocar `MODULO_TEXTO`.** El compartido queda
 * como está **con su defecto declarado y fechado** (ficha en `PENDIENTES-QA.md`
 * §CLASE-INLINE-PRESTADO), porque ensancharlo bien exige que `MonoInline`, el
 * render y `mapeo`/`vuelta` sepan llevar las marcas nuevas — y eso se prueba con
 * su round-trip, no de paso. **La razón NO es «no se toca lo poblado»**: un
 * ensanchamiento es RETROCOMPATIBLE y ese tabú no aplica (§2d.3).
 * ═════════════════════════════════════════════════════════════════════════ */
export const MODULO_TEXTO_KB: Block = {
  slug: "texto-kb",
  labels: { singular: "Texto (KB)", plural: "Textos (KB)" },
  fields: [
    campoHtml("html", { requerido: true }),
    /**
     * ⚠ **NO lleva `lh`, y es medida, no olvido.** El compartido tiene `lh`
     * porque en el monográfico varía entre hermanos (30.6 · 36 · 45, test B).
     * Aquí `estiloInline` es **`null` en los 85** módulos: el editor no tocó ni
     * la interlínea ni el ancho en ninguno.
     *
     * **Cero varianza no prueba plantilla** — prueba que nadie lo tocó en las
     * instancias que existen. Así que no se cablea un valor **ni** se inventa un
     * campo: queda **SIN PROBAR**, anotado, y lo decide la segunda instancia que
     * lo mueva. `moduloBase` sí entra, porque es la definición compartida del
     * ritmo y omitirla sería duplicar la decisión por el otro lado.
     */
    ...moduloBase,
  ],
};

/** La unión propia del arquetipo: lo compartido lo pone quien la consume. */
export const MODULOS_KB: Block[] = [MODULO_TEXTO_KB, MODULO_BLURB, MODULO_GALLERY];
