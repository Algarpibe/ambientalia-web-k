import type { ReactNode } from "react";

/**
 * LA RETÍCULA DE `LISTADO-B` (`L1`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CAMINO `4_4`-SIN-BARRA SE EJERCITÓ, Y LO QUE SALIÓ NO ES «FALLA»
 * NI «CUADRA»: ES QUE LA MEDIDA NO CUBRÍA LA FORMA (2026-08-14)
 *
 * Aquí vivía un `conBarra: boolean` que ponía `4_4` sin barra, implementado
 * desde `lh-barra.json` y declarado **SIN EJERCITAR** —§F2-5-ESCALON-ETIQUETAS:
 * *un camino de render que ningún dato de calibración estrena*—. La tanda que
 * construyó `L1-resources` lo estrenó, y ésta es la respuesta:
 *
 * | lo que `lh-barra.json` midió | ¿acertó? |
 * |---|---|
 * | la fila del listado es **`4_4`** | **sí** |
 * | **no hay barra lateral** | **sí** |
 * | la columna mide **1238.39** | **sí** |
 *
 * …y aun así el componente estaba **mal**, porque la retícula no era lo único
 * que cambiaba:
 *
 * | | blog · etiqueta | `resources` (medido) | lo que emitía `conBarra={false}` |
 * |---|---|---|---|
 * | filas de la sección 1 | 2 | **3** (titular · chips · listado) | 2 |
 * | índice de la fila del listado | 2 | **3** | 2 |
 * | índice de su columna | 2 | **3** | 2 |
 * | el listado cuelga de… | la columna | **un módulo de texto vacío** (`et_pb_text_3_tb_body > .et_pb_text_inner`) | la columna |
 *
 * O sea: `lh-barra.json` **midió bien lo que midió** —la retícula y la barra— y
 * el error fue de ALCANCE al leerlo: se dio por medida «la forma de la fila del
 * listado» cuando lo medido era «cuántas columnas tiene y si hay barra». Es
 * §UNA REGLA DERIVADA SOBRE UN DOMINIO DONDE EL CASO NO SE DA, con el matiz que
 * la hace instructiva: **la regla no era falsa, era INCOMPLETA, y una regla
 * incompleta se lee exactamente igual que una completa.**
 *
 * **Y por eso el `conBarra={false}` se BORRA en vez de dejarse.** Un camino
 * muerto que dice implementar `L1-resources` y no es lo que `L1-resources`
 * sirve es peor que no tenerlo: §sondas 3 —*documentado no es conectado*— con
 * la variante que más engaña, porque el código **existe** y parece respaldo.
 * `resources` compone su árbol en `PaginaListado`, donde se ve entero.
 *
 * ── Lo que la medida SÍ dejó cerrado, y sigue en pie ──────────────────────
 * `lh-barra.json`, **149 documentos**, `firmasDistintas: 1` ⇒ varianza CERO
 * dentro de cada variante:
 *
 * | | `L1-blog` · `L1-etiqueta` | `L1-resources` |
 * |---|---|---|
 * | fila del listado | **`3_4 + 1_4`** | **`4_4`** |
 * | columna de contenido @1440 | **911.75** | **1238.39** |
 * | barra lateral | **258.5**, 4 widgets | **no hay** |
 * | documentos | **80 de 80** | **0 de 37** |
 *
 * ── Y el límite de aquella medida, que ya no importa pero explica el caso ──
 * Barra y retícula eran **COLINEALES en 149/149**, así que *«la barra es de la
 * CAPA»* y *«…de la VARIANTE»* eran INDISTINGUIBLES (§DOS VARIABLES
 * CONFUNDIDAS) y se metieron en una sola prop. Con `resources` construida se
 * ve que la pregunta estaba mal planteada: **no comparten fila**, así que no
 * hay una prop que las combine.
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

/**
 * `.et_pb_module` genérico de texto.
 *
 * ⚠ **`vacio` NO es «sin hijos»: es SIN `et_pb_text_inner`**, y la diferencia
 * es un nivel del árbol que el barrido cuenta. El original lo sirve así en
 * `/recursos/seminarios-web/`, cuyo módulo de chips va literalmente
 * `<div class="…et_pb_text_2_tb_body…"></div>` porque ese término no tiene
 * hermanas. Emitir el envoltorio con la lista vacía habría metido un `<div>`
 * que el original no tiene, en la única instancia que ejercita el caso.
 */
export function ModuloTexto({
  n,
  extra = "",
  vacio = false,
  children,
}: {
  n: number;
  extra?: string;
  vacio?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        `et_pb_module et_pb_text et_pb_text_${n}_tb_body${extra ? ` ${extra}` : ""}` +
        " et_pb_text_align_left et_pb_bg_layout_light"
      }
    >
      {vacio ? null : <div className="et_pb_text_inner">{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA FILA DEL LISTADO — el punto donde las dos retículas se separan
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * La fila del cuerpo del listado de `blog` y `etiqueta`: `3_4 + 1_4` con barra.
 *
 * ⚠ **Ya NO lleva `conBarra`.** Lo llevaba, con el camino `false` implementado
 * desde `lh-barra.json` y declarado sin ejercitar; al construir `L1-resources`
 * salió que esa variante **no comparte esta fila** —tiene tres filas y el
 * listado cuelga de un módulo de texto—, así que el camino no era «el mismo sin
 * barra». Se borra en vez de quedarse: ver la cabecera del fichero.
 *
 * `paddingTop` es la única celda del ritmo donde blog y etiqueta difieren
 * (14.3906/3.89062 contra 28.7969/30), así que viaja como dato y no como clase.
 */
export function FilaListado({
  n,
  ritmo,
  barra,
  extra = "",
  children,
}: {
  n: number;
  /**
   * La clase de ritmo de la variante (`lh-fila2-blog` · `lh-fila2-etiqueta`).
   *
   * ⚠ **Va por clase y no por variable en línea**, y eso lo decidió el
   * comparador: `estiloInline` es eje `plantilla` y el original lo trae a
   * `null`, así que un `style=` en la fila **es una diferencia por sí mismo**
   * aunque el número que lleve dentro sea el correcto. Costó 3 pares.
   */
  ritmo: string;
  /** El contenido de la columna estrecha. */
  barra: ReactNode;
  extra?: string;
  children: ReactNode;
}) {
  /* La clase `et_pb_row_3-4_1-4` la emite Divi en las filas de dos columnas y la
     hoja la usa para el hueco de las columnas apiladas a 390. */
  const clase = ["et_pb_row_3-4_1-4", ritmo, extra].filter(Boolean).join(" ");
  return (
    <FilaTbDivi n={n} extra={clase}>
      <ColumnaDivi tipo="3_4" n={2}>
        {children}
      </ColumnaDivi>
      <ColumnaDivi tipo="1_4" n={3} ultima>
        {barra}
      </ColumnaDivi>
    </FilaTbDivi>
  );
}
