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
  titularesModulo,
} from "../campos/comunes.ts";

/**
 * `MonoNivel = 2 | 3 | 4`. Número y no `select` porque el tipo medido es
 * numérico; el conjunto cerrado lo impone `min`/`max`.
 *
 * El nivel **manda la tipografía del claim** —h2→37 · h3→32 · h4→26, medido en
 * las 12 instancias— y por eso NO hay campo `fs`: el tamaño está predicho por
 * el nivel. El día que una instancia rompa esa correlación, `fs` pasa a campo.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **EL DEFECTO NO ES UNO: SON DOS, Y COMPARTIRLO CAMBIABA LA ETIQUETA
 * SERVIDA (cazado el 2026-08-04 por `qa:cms-roundtrip`, y por nada más).**
 *
 * Este fichero declaraba **un solo** `nivel` con `conDefecto(…, 2, …)` y lo
 * reusaba en los cuatro sitios. El render del clon —que es la salida servida, o
 * sea la fuente de verdad— usa **dos defectos distintos**:
 *
 * | quién | cómo lo lee `MonoCuerpo.tsx` | defecto |
 * |---|---|---|
 * | `claim` (bloque y módulo) | `Claim({ nivel = 2 })` · líneas 100 · 281 | **2** |
 * | `titular` (bloque y módulo) | `b.nivel ?? 3` · `m.nivel ?? 3` · líneas 156 · 275 | **3** |
 *
 * Con el defecto compartido a 2, el hook de `conDefecto` —*coincidir con el
 * defecto = no haber escrito*— **omitía el `nivel: 2` explícito de un
 * `titular`**, y al leerlo de vuelta el render caía en su `?? 3`: el
 * `<h2>Proyectos por todo el mundo</h2>` de EDAR salía **`<h3>`**. Una etiqueta
 * distinta en el esqueleto del DOM, que es justo lo que `tree-cmp` compara.
 *
 * **Y ninguna guarda podía verlo.** `payload-types` compila igual, `qa:cms-campos`
 * pasa igual: **los dos miran la RUTA del campo, no su DEFECTO** — la misma
 * ceguera que la ficha **CMS-SP-TIPO** describe para el TIPO de la hoja. El
 * único instrumento que lo ve es el que mete el dato y lo saca: el round-trip.
 * Alcance medido: **1 instancia** en el catálogo (`monografico.ts` l. 872), y
 * bastaba una.
 *
 * El `defaultValue` viaja a la columna (`default: 2` en las 12 columnas `nivel`
 * de la migración inicial), así que cambiarlo **es cambio de esquema y lleva su
 * migración versionada** — `20260804_…_nivel_titular_por_defecto_3`.
 * ══════════════════════════════════════════════════════════════════════════
 */
function nivelCon(defecto: 2 | 3, deQuien: string): Field {
  /* Un objeto NUEVO por llamada, no una copia del de al lado: `conDefecto`
   * MUTA el campo que recibe, así que compartir la referencia es exactamente
   * cómo los cuatro sitios acabaron con el mismo defecto. */
  return conDefecto(
    { name: "nivel", type: "number", min: 2, max: 4 } as Field,
    defecto,
    `§1.5 · MonoNivel 2|3|4 — el ${deQuien} lo lee con \`?? ${defecto}\` en MonoCuerpo.tsx`,
  );
}

/**
 * `MonoAncho` — **el token de columna de la retícula de Divi**, compartido por
 * todo arquetipo que tenga columnas. **No es el enum de los valores vistos: es
 * la retícula.** Escrito solo desde EDAR habría salido de cuatro valores y
 * Petróleo estrena otros cuatro (catch 1 de `MODELO.md` §2) — y `articulos-kb`
 * volvió a traer **cuatro repartos, en 6 instancias**, que es exactamente el
 * mismo número con el que la primera vez se acertó por poco.
 *
 * ⚠ Vive aquí y no en `monografico.ts` desde el **2026-08-10 (F3-1 PASO 1)**:
 * lo consumen MONOGRÁFICO y `articulos-kb`, y un arquetipo importando la
 * retícula *del otro arquetipo* invierte la dirección de la dependencia. Se
 * reexporta desde `monografico.ts` para no partir a quien lo importaba de allí.
 */
export const ancho: Field = {
  name: "ancho",
  type: "select",
  required: true,
  options: ["1_4", "1_3", "2_5", "1_2", "3_5", "2_3", "3_4", "4_4"],
};

/** El defecto del `claim`: `Claim({ nivel = 2 })`. */
export const nivelClaim: Field = nivelCon(2, "claim");
/** El del `titular`: `b.nivel ?? 3` / `m.nivel ?? 3`. **No es el mismo.** */
export const nivelTitular: Field = nivelCon(3, "titular");

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
  /**
   * ⚠ **`claim` NO es `required`, y la razón está medida (2026-08-04).**
   *
   * Lo era, y el seed de los monográficos murió con un 400 —*«This field is
   * required»*— sobre `cuerpo.0.filas.0.columnas.0.modulos.1.bloques.1.claim`.
   * El dato medido trae **`{ claim: "" }`**: un claim VACÍO.
   *
   * Y no es un hueco por rellenar. `MonoCuerpo.tsx` lo pinta como
   * `<Heading>` con un `<span>` vacío dentro, o sea **un encabezado que ocupa su
   * interlínea**: es ritmo vertical del original, y en un proyecto que mide a
   * píxel eso es contenido. El clon lo reproduce.
   *
   * O sea que lo que no tenía respaldo no era el dato: era el `required`. Es la
   * misma regla que cerró `productos.seo.title` en la misma tanda —**se mide o
   * cae**— aplicada en el sentido contrario, que es el que menos se ve: allí la
   * medida SOSTUVO el `required` (24/24 en el original); aquí lo TUMBA.
   *
   * Lo derivó `npm run cms:sondeo`, que desde esta tanda distingue un `required`
   * **sin dato** de uno **con valor vacío** — Payload los rechaza igual y sólo el
   * primero se veía.
   */
  fields: [{ name: "claim", type: "text" }, nivelClaim],
};

export const BLOQUE_TITULAR: Block = {
  slug: "titular",
  labels: { singular: "Titular", plural: "Titulares" },
  fields: [{ name: "titular", type: "text", required: true }, nivelTitular],
};

export const BLOQUES_TEXTO: Block[] = [BLOQUE_P, BLOQUE_UL, BLOQUE_CLAIM, BLOQUE_TITULAR];

/* ══════════════════════════════════════════════════════════════════════════
 * LOS MÓDULOS COMPARTIDOS — texto · imagen · botón
 * ═════════════════════════════════════════════════════════════════════════ */

export const MODULO_TITULAR: Block = {
  slug: "titular",
  labels: { singular: "Titular", plural: "Titulares" },
  fields: [{ name: "texto", type: "text", required: true }, nivelTitular, ...moduloBase],
};

export const MODULO_CLAIM: Block = {
  slug: "claim",
  labels: { singular: "Claim", plural: "Claims" },
  fields: [{ name: "texto", type: "text", required: true }, nivelClaim, ...moduloBase],
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
    /**
     * ⚠ **La piel de los titulares — ENSANCHAMIENTO retrocompatible, y la
     * medida dice que este módulo es su sitio (F3-1, 2026-08-10).**
     *
     * `qa:pieles` leyó el CSS que Divi compiló en las 573 páginas del corpus:
     * de las **1309** reglas de titular por módulo en capa propia, **291 son de
     * `sectores`** (los 8, o sea SECTOR *y* MONOGRÁFICO, que son quienes
     * consumen este bloque) y **658 de `productos`**, contra 82 de KB. El campo
     * no llegó por KB: **llevaba aquí desde el principio y no se había medido**,
     * exactamente como `inline` (§2d.3).
     *
     * Es opcional y su ausencia es el defecto del tema, así que **los 2
     * monográficos y los 9 productos ya sembrados siguen válidos sin tocar un
     * dato**: por eso el tabú de «no toques lo poblado» no aplica.
     *
     * ⚠ **Y lo que esta tanda NO hace: POBLARLO aquí.** Los 949 overrides de
     * `sectores` + `productos` están medidos y **no extraídos** — el extractor
     * del monográfico lee `style=` y estos valores no viven ahí. Es un camino de
     * render sin estrenar **declarado**, con su ficha (§F3-1-PIEL-FUERA-DE-KB) y
     * su número, no un campo que se supone soportado.
     */
    titularesModulo,
    ...moduloBase,
  ],
};

/**
 * El CONTENIDO de un módulo de imagen, sin su ritmo. Se exporta aparte porque
 * `articulos-kb` monta el mismo contenido sobre **otro ritmo** —el suyo lleva
 * unidad (`medida`)— y *lo que se duplica es el documento, no la definición*
 * (§1.5b): dos declaraciones de «la imagen de un módulo» son la clase C7.
 */
export const CAMPOS_MODULO_IMAGEN: Field[] = [
  { name: "src", type: "upload", relationTo: "media", required: true },
  { name: "alt", type: "text" },
];

export const MODULO_IMAGEN: Block = {
  slug: "imagen",
  labels: { singular: "Imagen", plural: "Imágenes" },
  fields: [...CAMPOS_MODULO_IMAGEN, ...moduloBase],
};

/**
 * ⚠ **El botón NO lleva `moduloBase`, y es fidelidad, no olvido.** El tipo
 * medido (`{ kind: "boton"; label; href; external? }`) es el único de la unión
 * que **no extiende `MonoModuloBase`**: el wrapper del botón de Divi no se
 * entera de ser el último de su columna y lleva su `mb 16` fijo en 7 de 7.
 */
export const CAMPOS_MODULO_BOTON: Field[] = [
  { name: "label", type: "text", required: true },
  { name: "href", type: "text", required: true },
  { name: "external", type: "checkbox" },
];

export const MODULO_BOTON: Block = {
  slug: "boton",
  labels: { singular: "Botón", plural: "Botones" },
  fields: [...CAMPOS_MODULO_BOTON],
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
