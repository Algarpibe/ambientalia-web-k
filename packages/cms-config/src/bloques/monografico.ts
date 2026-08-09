/**
 * EL CUERPO DEL MONOGRÁFICO — §1.5.
 *
 * No es una lista de bloques: **es el árbol de Divi**, sección → fila → columna
 * → pila de módulos, y Payload lo expresa de forma nativa (§1 preámbulo: aquí
 * la unión discriminada es el tipo del campo, no una tabla puente — por eso la
 * «frontera de regímenes» que se discutió en la evaluación externa era una
 * mitigación del M2A de Directus y no aplica).
 *
 * `filas` y `columnas` van como `array` y no como `blocks`: **no son uniones**,
 * tienen una sola forma, y un `blocks` de una variante es peor admin sin ganar
 * nada. El anidamiento que §1.5 pide es el mismo; si pesa, `blocksAsJSON`.
 */
import type { Block, Field } from "payload";
import { moduloBase, ritmoInline, subida } from "../campos/comunes.ts";
import {
  CAMPOS_CTA_DESCARGA,
  CAMPO_PINS,
  MODULOS_COMPARTIDOS,
  inline,
} from "./contenido.ts";

/**
 * `MonoAncho` — token de columna de Divi. **No es el enum de los valores
 * vistos: es la retícula.** Escrito solo desde EDAR habría salido de cuatro
 * valores y Petróleo estrena otros cuatro (catch 1 de `MODELO.md` §2).
 */
export const ancho: Field = {
  name: "ancho",
  type: "select",
  required: true,
  options: ["1_4", "1_3", "2_5", "1_2", "3_5", "2_3", "3_4", "4_4"],
};

/**
 * `MonoCelda = string | { fuerte, resto? }` — **nunca HTML**, igual que
 * `MonoTrozo`: el conjunto está cerrado. Si mañana aparece cursiva se añade un
 * caso, no un campo `html`.
 *
 * ⚠ **Es una UNIÓN aplanada, y hasta el 2026-08-04 nadie se lo había dicho al
 * walker.** `texto` **es** la rama de cadena; `fuerte`+`resto` la otra. Con tres
 * campos propios el envoltorio transparente no aplica, así que `aPayload`
 * recorría los tres sobre una cadena, sacaba `undefined` de los tres y escribía
 * **`{}`**: las **16 celdas de texto de la tabla de EDAR entraban en blanco**,
 * sin un solo error. Lo vio `qa:cms-roundtrip` y nada más.
 */
export const CELDA: Field[] = [
  { name: "texto", type: "text" },
  { name: "fuerte", type: "text" },
  { name: "resto", type: "text" },
];

export const MODULO_SERIE: Block = {
  slug: "serie",
  labels: { singular: "Serie", plural: "Series" },
  fields: [
    /**
     * Pares `h4 + p` dentro de UN `et_pb_text`, los dos con `padding-left: 40px`
     * inline. **No es un `blurb` ni una lista**: no hay marcador (`::before`
     * computa `content: none`). El indentado de 40 es plantilla: 13 de 13.
     */
    {
      name: "items",
      type: "array",
      fields: [
        { name: "titulo", type: "text", required: true },
        { name: "texto", type: "textarea", required: true },
      ],
    },
    ...moduloBase,
  ],
};

export const MODULO_TABLA: Block = {
  slug: "tabla",
  labels: { singular: "Tabla", plural: "Tablas" },
  fields: [
    /**
     * Tabla **genérica**, no cuatro columnas con nombre: Petróleo no tiene
     * tabla, así que n = 1, y un esquema con nombres sería S9–S11 aplicado al
     * esquema del CMS (`DECISIONES.md` (a)).
     */
    { name: "cabeceras", type: "array", fields: [{ name: "texto", type: "text", required: true }] },
    {
      name: "filas",
      type: "array",
      fields: [
        {
          name: "celdas",
          type: "array",
          fields: CELDA,
          /**
           * A qué campo va la rama ESCALAR de `MonoCelda`. Se declara **aquí**,
           * al lado de la definición, y no en una tabla de rutas del walker: una
           * lista de rutas escrita a mano envejece contra el esquema (regla 9).
           * Con tres campos candidatos no hay nada que derivar — cuál recibe la
           * cadena es decisión del modelo.
           */
          custom: { escalarA: "texto" },
        },
      ],
    },
    ...moduloBase,
  ],
};

export const MODULO_CTA_DESCARGA: Block = {
  slug: "ctaDescarga",
  labels: { singular: "CTA de descarga", plural: "CTA de descarga" },
  fields: [...CAMPOS_CTA_DESCARGA, ...moduloBase],
};

export const MODULO_MAPA_PROYECTOS: Block = {
  slug: "mapaProyectos",
  labels: { singular: "Mapa de proyectos", plural: "Mapas de proyectos" },
  fields: [CAMPO_PINS, ...moduloBase],
};

/** `MonoModulo` — la unión entera. */
export const MODULOS_MONOGRAFICO: Block[] = [
  ...MODULOS_COMPARTIDOS,
  MODULO_SERIE,
  MODULO_TABLA,
  MODULO_CTA_DESCARGA,
  MODULO_MAPA_PROYECTOS,
];

/** `MonoColumna`. */
export const columnas: Field = {
  name: "columnas",
  type: "array",
  fields: [
    ancho,
    /**
     * El `punteado.svg` que cuelga −65px a la izquierda de la fila. **Booleano
     * por columna, no adorno del bloque**: EDAR lo pone en las dos columnas
     * cuando las dos llevan contenido; Petróleo solo en la 0, incluso cuando la
     * 0 es la foto. No hay regla de plantilla que dé los dos repartos.
     */
    { name: "punteado", type: "checkbox" },
    /**
     * Hueco bajo la columna **cuando apila a 390**. Defecto `30` si no es la
     * última de su fila, `0` si lo es — y es campo porque hay excepción: la
     * primera columna de la fila de cierre comercial va a 0 sin ser la última,
     * en las DOS páginas. Cablear el 30 metía +30 en esa fila de las dos.
     */
    { name: "mbMovil", type: "number" },
    { name: "modulos", type: "blocks", blocks: MODULOS_MONOGRAFICO, required: true, custom: { conKind: true } },
  ],
};

/** `MonoFila extends MonoRitmo`. */
export const filas: Field = {
  name: "filas",
  type: "array",
  fields: [...ritmoInline, columnas],
};

/** `MonoSeccion extends MonoRitmo` — la raíz del cuerpo. */
export const cuerpoMonografico: Field = {
  name: "cuerpo",
  type: "array",
  fields: [...ritmoInline, filas],
};

/**
 * `MonoHero`. La columna derecha es una **LISTA de módulos**, no
 * `claim + párrafos` (catch 3 de `MODELO.md`): SECTOR monta 2 y el monográfico
 * 3, y el primero de Petróleo está **vacío** — altura 0 pero `margin-bottom:
 * 16`. Omitirlo deja la página 16 px corta del hero al pie.
 */
export const heroMonografico: Field = {
  name: "hero",
  type: "group",
  fields: [
    {
      name: "image",
      type: "group",
      fields: [
        { name: "src", type: "upload", relationTo: "media", required: true },
        { name: "alt", type: "text" },
      ],
    },
    {
      name: "ctas",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "external", type: "checkbox" },
      ],
    },
    {
      name: "modulos",
      type: "array",
      fields: [
        { name: "heading", type: "text" },
        /**
         * ⚠ **Varía DENTRO de una misma página**: en EDAR el primer módulo es
         * `#0c71c3` y los otros dos `#0075c9`. Por eso el `hero.headingColor`
         * de `SectorPage` —un color por página— no puede representar este hero.
         *
         * `#0c71c3` es el azul **de serie de Divi**, no el de marca, y el
         * reparto lo confirma como descuido: solo en el primer heading del hero
         * de EDAR e Industria, y en **ningún** módulo del cuerpo de las cuatro
         * páginas. Se replica a propósito — fidelidad sobre criterio propio.
         */
        { name: "headingColor", type: "text" },
        /* `paragraphs?: string[]` — opcional en el tipo medido, y la ida lo ve
         * faltar en 2 de los 6 módulos del hero. Ver §LA LISTA VACÍA. */
        {
          name: "paragraphs",
          type: "array",
          custom: { vaciaEsAusente: true },
          fields: [{ name: "texto", type: "textarea", required: true }],
        },
        { name: "mb", type: "number" },
      ],
    },
    /**
     * `padding-bottom` de la sección en **desktop**: 39 en este arquetipo y 60
     * en SECTOR. A 390 los cuatro valen 20, así que solo el de desktop
     * distingue.
     */
    { name: "pb", type: "number" },
  ],
};

export { inline, subida };
