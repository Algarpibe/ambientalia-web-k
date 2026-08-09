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
import { conDefecto, subida } from "../campos/comunes.ts";
import type { Field } from "payload";
import { inline, nivelTitular } from "./contenido.ts";
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
 * La descripción es `inline` —párrafo con negrita— y no `campoHtml`: lo medido
 * son `<p>` con texto, sin una sola etiqueta fuera de ese conjunto en los 24.
 * Si aparece una, **se amplía el campo con la medida delante**, no se pone
 * `campoHtml` «por si acaso» — prestar un editor más ancho de la cuenta fue lo
 * que escondió el `<sup>` de `productos.bullets`.
 */
export const MODULO_BLURB: Block = {
  slug: "blurb",
  labels: { singular: "Blurb", plural: "Blurbs" },
  fields: [
    { name: "titulo", type: "text", required: true },
    nivelTitular,
    subida("imagen"),
    { name: "alt", type: "text" },
    inline("descripcion"),
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

/** La unión propia del arquetipo: lo compartido lo pone quien la consume. */
export const MODULOS_KB: Block[] = [MODULO_BLURB, MODULO_GALLERY];
