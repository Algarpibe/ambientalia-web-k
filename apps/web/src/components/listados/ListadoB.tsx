import type { ReactNode } from "react";

/**
 * LA RETÍCULA DE `LISTADO-B` (`L1`) — LAS DOS, y la segunda SIN EJERCITAR.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ AQUÍ HAY DOS CAMINOS Y SÓLO UNO TIENE DATOS
 *
 * `lh-barra.json` midió las dos retículas sobre **149 documentos** con
 * `firmasDistintas: 1`, o sea varianza CERO dentro de cada variante:
 *
 * | | `L1-blog` · `L1-etiqueta` | `L1-resources` |
 * |---|---|---|
 * | fila del listado | **`3_4 + 1_4`** | **`4_4`** |
 * | columna de contenido @1440 | **911.75** | **1238.39** |
 * | barra lateral | **258.5**, 4 widgets | **no hay** |
 * | documentos | **80 de 80** | **0 de 37** |
 *
 * ⚠ **`4_4`-sin-barra se implementa desde esa medida y se declara SIN
 * EJERCITAR.** Es §F2-5-ESCALON-ETIQUETAS con nombre propio: *un campo que
 * ADMITE un caso y que ningún dato de calibración EJERCITA es un camino de
 * render sin estrenar*. `L1-resources` está parado por
 * §F3-LH-JERARQUIA-RECURSOS —le faltan 2 términos y una decisión de esquema—,
 * así que hoy **0 de las 3 formas construidas pasan por `conBarra={false}`**.
 *
 * Lo que NO se hace, y es la razón de que este componente exista ya: **cablear
 * `3_4 + 1_4` porque es el que hay delante.** Eso convertiría la variante
 * medida en una constante, y la tanda que construya `L1-resources` encontraría
 * un componente que hay que reescribir en vez de uno que hay que estrenar.
 *
 * ── El límite que la medida impone, y que sigue vivo ──────────────────────
 * Barra y retícula son **COLINEALES en 149/149**: ningún documento tiene una sin
 * la otra. Así que *«la barra es propiedad de la CAPA»* y *«…de la VARIANTE»*
 * son **INDISTINGUIBLES** con esta población (§DOS VARIABLES CONFUNDIDAS). Se
 * elige el eje con **mecanismo servido** —la plantilla de cuerpo del theme
 * builder decide las dos a la vez, así que van juntas en una sola prop— y **la
 * razón es ésa, no una medida.**
 */

/* ══════════════════════════════════════════════════════════════════════════
 * LOS ENVOLTORIOS DE DIVI
 *
 * El clon emite el vocabulario de clases del original. No es decoración: es lo
 * que permite que `lh-barrido.mjs` —**un solo instrumento**— lea el esqueleto de
 * los dos lados sin una tabla de traducción (`nSecciones`, `nFilas`,
 * `nColumnas`, `reparto` y `nModulos` son todos eje `plantilla`).
 * ═════════════════════════════════════════════════════════════════════════ */

/** `.et_pb_section` del `_tb_body`. `n` es el índice que Divi compila en la clase. */
export function SeccionTb({ n, children }: { n: number; children: ReactNode }) {
  return <div className={`et_pb_section et_pb_section_${n}_tb_body et_section_regular`}>{children}</div>;
}

/** `.et_pb_row` del `_tb_body`. */
export function FilaTbDivi({
  n,
  extra = "",
  style,
  children,
}: {
  n: number;
  extra?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div data-fila="" className={`et_pb_row et_pb_row_${n}_tb_body${extra ? ` ${extra}` : ""}`} style={style}>
      {children}
    </div>
  );
}

/**
 * `.et_pb_column`. `tipo` es el token de la retícula (`4_4`, `3_4`, `1_4`) y es
 * **lo que el barrido lee para componer `reparto`** (`"3_4+1_4"`).
 *
 * `ultima` añade `et-last-child`, que en Divi es lo que pone el `margin-right`
 * a 0 — la regla POSICIONAL de la retícula, no un campo (§MEDICION.md 3.2).
 */
export function ColumnaDivi({
  tipo,
  n,
  ultima = false,
  extra = "",
  children,
}: {
  tipo: "4_4" | "3_4" | "1_4";
  n: number;
  ultima?: boolean;
  extra?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        `et_pb_column et_pb_column_${tipo} et_pb_column_${n}_tb_body${extra ? ` ${extra}` : ""}` +
        ` et_pb_css_mix_blend_mode_passthrough${ultima ? " et-last-child" : ""}`
      }
    >
      {children}
    </div>
  );
}

/** `.et_pb_module` genérico de texto. */
export function ModuloTexto({
  n,
  extra = "",
  children,
}: {
  n: number;
  extra?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        `et_pb_module et_pb_text et_pb_text_${n}_tb_body${extra ? ` ${extra}` : ""}` +
        " et_pb_text_align_left et_pb_bg_layout_light"
      }
    >
      <div className="et_pb_text_inner">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA FILA DEL LISTADO — el punto donde las dos retículas se separan
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * La fila del cuerpo del listado, con su retícula y (si la variante la tiene) su
 * barra.
 *
 * ⚠ **`conBarra` decide LAS DOS COSAS a la vez** —el reparto de columnas y la
 * presencia de la barra— y eso es exactamente lo que la colinealidad de 149/149
 * obliga a hacer: separarlas en dos props afirmaría que se pueden combinar de
 * cuatro formas, y **eso no está medido**. Tres de las cuatro combinaciones no
 * existen en el original.
 *
 * `paddingTop` es la única celda del ritmo donde blog y etiqueta difieren
 * (14.3906/3.89062 contra 28.7969/30), así que viaja como dato y no como clase.
 */
export function FilaListado({
  n,
  conBarra,
  ptLg,
  pt,
  barra,
  extra = "",
  children,
}: {
  n: number;
  /** `true` ⇒ `3_4 + 1_4` con barra · `false` ⇒ `4_4` sin ella (SIN EJERCITAR). */
  conBarra: boolean;
  /** `padding-top` de la fila a ≥981 px, medido. */
  ptLg: string;
  /** `padding-top` de la fila por debajo de 981 px, medido. */
  pt: string;
  /** El contenido de la columna estrecha. Sólo se pinta si `conBarra`. */
  barra?: ReactNode;
  extra?: string;
  children: ReactNode;
}) {
  /* La clase `et_pb_row_3-4_1-4` la emite Divi en las filas de dos columnas y la
     hoja la usa para el hueco de las columnas apiladas a 390. */
  const clase = [conBarra ? "et_pb_row_3-4_1-4" : "", extra].filter(Boolean).join(" ");
  return (
    <FilaTbDivi
      n={n}
      extra={clase}
      style={{ "--lh-fila2-pt": pt, "--lh-fila2-pt-lg": ptLg } as React.CSSProperties}
    >
      <ColumnaDivi tipo={conBarra ? "3_4" : "4_4"} n={2} ultima={!conBarra}>
        {children}
      </ColumnaDivi>
      {conBarra ? (
        <ColumnaDivi tipo="1_4" n={3} ultima>
          {barra}
        </ColumnaDivi>
      ) : null}
    </FilaTbDivi>
  );
}
