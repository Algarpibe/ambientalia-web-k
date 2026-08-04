/**
 * LAS DEFINICIONES DE CONTENIDO QUE SE COMPARTEN — §2d.1, literal:
 *
 *   > **Común compartido, no duplicado:** las definiciones de texto/imagen/botón
 *   > y el ritmo se exportan una vez y las consumen `MonoModulo` y la futura
 *   > unión de `articulos-kb` — *lo que se duplica es el documento, no la
 *   > definición*.
 *
 * §2e añade el tercer consumidor: el cuerpo de `productos` («ritmo y retícula
 * de bloque: definición compartida, la misma que consumen `MonoModulo` y
 * `articulos-kb`»).
 */
import type { Block, Field } from "payload";
import {
  conDefecto,
  editorNegrita,
  imagen,
  moduloBase,
  subida,
} from "../campos/comunes.ts";

/**
 * `MonoNivel = 2 | 3 | 4`. Número y no `select` porque el tipo medido es
 * numérico; el conjunto cerrado lo impone `min`/`max`.
 *
 * El nivel **manda la tipografía del claim** —h2→37 · h3→32 · h4→26, medido en
 * las 12 instancias— y por eso NO hay campo `fs`: el tamaño está predicho por
 * el nivel. El día que una instancia rompa esa correlación, `fs` pasa a campo.
 */
export const nivel: Field = conDefecto(
  { name: "nivel", type: "number", min: 2, max: 4 } as Field,
  2,
  "§1.5 · MonoNivel 2|3|4",
);

/**
 * `MonoInline` — texto que puede llevar negrita a mitad de frase.
 *
 * No es cosmética: la negrita es más ancha, así que **cambia dónde envuelve**.
 * Sin ella un `li` de Petróleo S1F3 salía a 3 renglones donde el original va a
 * 4 — **−30.59 a 390**, y a 1440 no se notaba nada.
 *
 * ⚠ **SOLO para `MonoInline`, y desde §3.1d es una restricción, no una
 * costumbre.** `editorNegrita` es Párrafo + Negrita y nada más, así que **no
 * puede expresar `sub`/`sup`/`a`**. Eso es correcto **aquí** —`MonoInline` es
 * dato tipado del clon y su inventario está medido en 56 `<strong>`— y es un
 * defecto en cualquier campo cuyo tipo medido sea `CampoRicoEnLinea`, que es
 * HTML y admite siete etiquetas. Prestarlo fuera de `MonoInline` fue justo lo
 * que escondió el `<sup>` de `productos.bullets`. Para esos: `htmlLinea`.
 */
export function inline(name: string, required = false): Field {
  return { name, type: "richText", editor: editorNegrita, required };
}

/* ══════════════════════════════════════════════════════════════════════════
 * `MonoBloqueTexto` — los bloques que caben dentro de UN módulo de texto
 *
 * Es una lista y no campos fijos porque un solo `et_pb_text` mezcla heading,
 * párrafos y listas **con un único `margin-bottom`**: partirlo en dos módulos
 * metería 34px de aire donde el original pone los 10 del `padding-bottom` del
 * heading.
 * ═════════════════════════════════════════════════════════════════════════ */

export const BLOQUE_P: Block = {
  slug: "p",
  labels: { singular: "Párrafo", plural: "Párrafos" },
  fields: [
    inline("p", true),
    /**
     * `padding-bottom` del párrafo. Default **18 si le sigue algo, 0 si es el
     * último** — la rítmica Divi, verificada en los 30 párrafos del cuerpo.
     * Con UNA excepción, y por eso el campo existe: el `p` de EDAR S0F1C0 va a
     * 0 teniendo un `ul` detrás. Se replica el dato y no se inventa la regla.
     */
    { name: "pb", type: "number" },
  ],
};

export const BLOQUE_UL: Block = {
  slug: "ul",
  labels: { singular: "Lista", plural: "Listas" },
  fields: [{ name: "ul", type: "array", fields: [inline("texto", true)] }],
};

export const BLOQUE_CLAIM: Block = {
  slug: "claim",
  labels: { singular: "Claim", plural: "Claims" },
  fields: [{ name: "claim", type: "text", required: true }, nivel],
};

export const BLOQUE_TITULAR: Block = {
  slug: "titular",
  labels: { singular: "Titular", plural: "Titulares" },
  fields: [{ name: "titular", type: "text", required: true }, nivel],
};

export const BLOQUES_TEXTO: Block[] = [BLOQUE_P, BLOQUE_UL, BLOQUE_CLAIM, BLOQUE_TITULAR];

/* ══════════════════════════════════════════════════════════════════════════
 * LOS MÓDULOS COMPARTIDOS — texto · imagen · botón
 * ═════════════════════════════════════════════════════════════════════════ */

export const MODULO_TITULAR: Block = {
  slug: "titular",
  labels: { singular: "Titular", plural: "Titulares" },
  fields: [{ name: "texto", type: "text", required: true }, nivel, ...moduloBase],
};

export const MODULO_CLAIM: Block = {
  slug: "claim",
  labels: { singular: "Claim", plural: "Claims" },
  fields: [{ name: "texto", type: "text", required: true }, nivel, ...moduloBase],
};

export const MODULO_TEXTO: Block = {
  slug: "texto",
  labels: { singular: "Texto", plural: "Textos" },
  fields: [
    { name: "bloques", type: "blocks", blocks: BLOQUES_TEXTO, required: true },
    /**
     * `line-height` de los `p` y `li` del módulo. Defecto **30.6**.
     *
     * Es campo por el test B: **cambia de módulo a módulo dentro de la misma
     * página** — 30.6 · 36 · 45 en EDAR. La spec lo tenía al revés: daba 30.6
     * por plantilla y llamaba «excepción» al 36 de Petróleo.
     */
    conDefecto({ name: "lh", type: "number" } as Field, 30.6, "§1.5 · 30.6·36·45 por módulo"),
    ...moduloBase,
  ],
};

export const MODULO_IMAGEN: Block = {
  slug: "imagen",
  labels: { singular: "Imagen", plural: "Imágenes" },
  fields: [
    { name: "src", type: "upload", relationTo: "media", required: true },
    { name: "alt", type: "text" },
    ...moduloBase,
  ],
};

/**
 * ⚠ **El botón NO lleva `moduloBase`, y es fidelidad, no olvido.** El tipo
 * medido (`{ kind: "boton"; label; href; external? }`) es el único de la unión
 * que **no extiende `MonoModuloBase`**: el wrapper del botón de Divi no se
 * entera de ser el último de su columna y lleva su `mb 16` fijo en 7 de 7.
 */
export const MODULO_BOTON: Block = {
  slug: "boton",
  labels: { singular: "Botón", plural: "Botones" },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "href", type: "text", required: true },
    { name: "external", type: "checkbox" },
  ],
};

/** Los que consumen los tres arquetipos de cuerpo (§2d.1). */
export const MODULOS_COMPARTIDOS: Block[] = [
  MODULO_TITULAR,
  MODULO_CLAIM,
  MODULO_TEXTO,
  MODULO_IMAGEN,
  MODULO_BOTON,
];

/**
 * El shortcode `calls`, piel `"fondo"`. Lo reutilizan MONOGRÁFICO (como módulo)
 * y SECTOR (como bloque de cuerpo, allí con su campo `variante`: las dos pieles
 * son un campo del editor y no dos componentes).
 */
export const CAMPOS_CTA_DESCARGA: Field[] = [
  { name: "title", type: "text", required: true },
  { name: "body", type: "array", fields: [{ name: "texto", type: "textarea", required: true }] },
  {
    name: "cta",
    type: "group",
    fields: [
      { name: "label", type: "text", required: true },
      { name: "href", type: "text", required: true },
      { name: "external", type: "checkbox" },
    ],
  },
  subida("image"),
];

/** Pines del mapa de proyectos (Industria 41 · Puertos 30 · Minería 32). */
export const CAMPO_PINS: Field = {
  name: "pins",
  type: "array",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "lat", type: "number", required: true },
    { name: "lng", type: "number", required: true },
  ],
};

/** Reexport para quien solo quiera la foto con su alt. */
export { imagen };
