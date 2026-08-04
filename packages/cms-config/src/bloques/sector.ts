/**
 * EL CUERPO DEL SECTOR — §1.4. *Flexible content* de 5 bloques, cada uno con su
 * `flujo`, deducido de los **8 sectores** y no de dos.
 *
 * ⚠ Los dos campos de la base (`flujo` y `anchoPct`) son el ejemplo canónico de
 * `CLAUDE.md` §«Estructura que en realidad es contenido»: parecían CSS del
 * componente y los escribe quien edita la página.
 */
import type { Block, Field } from "payload";
import { anchoPct, conDefecto, imagen, subida } from "../campos/comunes.ts";
import { CAMPO_PINS } from "./contenido.ts";

/**
 * **`flujo` — dónde corta la sección.** En Divi el cuerpo son secciones con
 * filas dentro, y **el editor decide en cuál cae cada bloque**; el ritmo
 * vertical entre bloques es consecuencia de eso, no de un `padding` del
 * componente. Salió de barrer los 8 sectores vivos con `tree-todos.mjs`: con
 * dos sectores a la vista se habrían inventado los valores equivocados.
 *
 * Defecto `"seccion"`: un bloque sin declarar abre su propia sección, que es el
 * comportamiento seguro — y el primero del cuerpo abre una siempre, lo diga o
 * no, porque una fila necesita sección que la contenga.
 */
export const flujo: Field = conDefecto(
  {
    name: "flujo",
    type: "select",
    options: ["seccion", "seccionRasa", "fila", "filaPegada"],
  } as Field,
  "seccion",
  "§1.4 · medido en los 8 sectores vivos (tree-todos)",
);

/**
 * Lo que comparten los 5 bloques.
 *
 * `anchoPct` entra aquí por **§6c.1, medido el 2026-08-03**: `80 · 90 · 100` en
 * las 4 instancias de SECTOR, idénticos a 1440 y a 390, con varianza
 * intra-página. Es **el mismo campo** que `MonoModuloBase.anchoPct`, en una
 * segunda colección.
 *
 * ⚠ Y es un campo que el ESQUEMA decidió y **`src/lib/sectores.ts` todavía no
 * tiene** (`SectorBloqueBase` solo declara `flujo`). La dirección del hueco
 * importa: aquí el esquema va por delante del código medido, no al revés.
 */
export const bloqueBase: Field[] = [flujo, anchoPct];

export const BLOQUE_CTA_DESCARGA: Block = {
  slug: "ctaDescarga",
  labels: { singular: "CTA de descarga", plural: "CTA de descarga" },
  fields: [
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
    /**
     * **Las dos pieles del shortcode `calls`, y el editor elige.** El mismo
     * campo `image` alimenta las dos; lo que cambia es dónde se pinta la foto:
     * `"foto"` la saca como `<img>` de 280 sangrado −30, `"fondo"` la pone de
     * `background-image: cover` con `padding-left: 36%`. Alto a 1440: 337 vs
     * 420.
     *
     * Lo descubrió poblar Industria: el componente solo sabía pintar la primera
     * y la página salía +53 desplazada de ahí abajo. Se intentó primero como
     * retoque de `padding`. No lo era.
     */
    conDefecto(
      { name: "variante", type: "select", options: ["foto", "fondo"] } as Field,
      "foto",
      "§1.4 · CLAUDE.md §Estructura que en realidad es contenido",
    ),
    ...bloqueBase,
  ],
};

export const BLOQUE_BENEFICIOS_APLICACIONES: Block = {
  slug: "beneficiosAplicaciones",
  labels: { singular: "Beneficios y aplicaciones", plural: "Beneficios y aplicaciones" },
  fields: [
    {
      name: "left",
      type: "group",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "items", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
      ],
    },
    {
      name: "right",
      type: "group",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "items", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
      ],
    },
    ...bloqueBase,
  ],
};

export const BLOQUE_CLAIM_CON_FOTO: Block = {
  slug: "claimConFoto",
  labels: { singular: "Claim con foto", plural: "Claims con foto" },
  fields: [
    { name: "claim", type: "text", required: true },
    imagen("image", { requerida: true }),
    ...bloqueBase,
  ],
};

export const BLOQUE_LISTA_SIMPLE_2COL: Block = {
  slug: "listaSimple2Col",
  labels: { singular: "Lista en 2 columnas", plural: "Listas en 2 columnas" },
  fields: [
    // ⚠ §S9a de `PENDIENTES-QA.md`: en el original este párrafo de entrada
    // cuelga de la FILA ANTERIOR, no del bloque. Sigue pendiente de medir; se
    // deja como campo del bloque y NO se cablea la posición.
    { name: "intro", type: "textarea" },
    { name: "left", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
    { name: "right", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
    ...bloqueBase,
  ],
};

export const BLOQUE_MAPA_PROYECTOS: Block = {
  slug: "mapaProyectos",
  labels: { singular: "Mapa de proyectos", plural: "Mapas de proyectos" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "intro", type: "textarea" },
    CAMPO_PINS,
    ...bloqueBase,
  ],
};

export const BLOQUES_SECTOR: Block[] = [
  BLOQUE_CTA_DESCARGA,
  BLOQUE_BENEFICIOS_APLICACIONES,
  BLOQUE_CLAIM_CON_FOTO,
  BLOQUE_LISTA_SIMPLE_2COL,
  BLOQUE_MAPA_PROYECTOS,
];

/** Hero 1/2 + 1/2 del sector: foto + 2 CTA a la izquierda, titular + copy a la derecha. */
export const heroSector: Field = {
  name: "hero",
  type: "group",
  fields: [
    imagen("image", { requerida: true }),
    {
      name: "ctas",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "external", type: "checkbox" },
      ],
    },
    { name: "heading", type: "text", required: true },
    /**
     * **Es contenido, no estilo.** En el original el color lo pone un
     * `<span style="color:…">` dentro del `h2`, no el `h2` (que computa
     * `#333`), y no es el mismo en todos los sectores: Urbano usa `#0075c9` (el
     * azul de marca) e Industria `#0c71c3` (el azul por defecto de Divi).
     *
     * El segundo es **error del original, replicado a propósito** — fidelidad
     * al píxel sobre criterio propio. Por defecto, el de marca.
     */
    conDefecto({ name: "headingColor", type: "text" } as Field, "#0075c9", "§1.4"),
    {
      name: "paragraphs",
      type: "array",
      fields: [{ name: "texto", type: "textarea", required: true }],
    },
  ],
};
