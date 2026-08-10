/**
 * `articulos-kb` LEÍDO DEL CMS — el catálogo y los tipos de su cuerpo.
 *
 * ⚠ **Esta familia NO tiene contraparte en `src/lib`**, y es lo que la hace
 * distinta de todas las demás: su dato **nace en el CMS** (F3-1), sembrado
 * desde `medidas/kb-extraido.json` por `cms:seed-kb`. Así que aquí no hay un
 * tipo medido que importar de `@/types/kunak` — el tipo se declara aquí, contra
 * las specs, y **su verificación no es `qa:cms-campos`** (que empareja contra
 * `src/lib`) **sino el comparador de dos lados contra el ORIGINAL**.
 */
import { leeColeccion } from "./proyector";

/* ══════════════════════════════════════════════════════════════════════════
 * EL TIPO DEL CUERPO — el que el esquema emite, no una copia a mano
 * ═════════════════════════════════════════════════════════════════════════ */

/**
 * Un valor de ritmo **con su unidad**. Es la razón de ser de `medida()` en el
 * esquema: el editor escribió px absolutos **y** porcentajes y a 1440 son el
 * mismo número (`cuerpo.spec.md` §2.1). `valor` ausente = nadie lo escribió ⇒
 * el default responsive de Divi, que **no se puede representar como valor**
 * porque cambia de unidad al apilar.
 */
export type MedidaKb = {
  valor?: number | null;
  unidad?: "px" | "pct" | null;
  movilValor?: number | null;
  movilUnidad?: "px" | "pct" | null;
};

/** El token de columna de la retícula de Divi. */
export type TipoColumnaKb = "1_4" | "1_3" | "2_5" | "1_2" | "3_5" | "2_3" | "3_4" | "4_4";

type Ritmo = { mt?: MedidaKb | null; mb?: MedidaKb | null; pb?: MedidaKb | null } | null;
type Base = { ritmo?: Ritmo; anchoPct?: number | null };

/* ⚠ **El discriminador que llega al render es `kind`, no `blockType`** — y
 * costó una corrida entera del comparador saberlo. `blockType` es lo que Payload
 * guarda y lo que la IDA escribe (`mapeo.mjs` §blocks); la VUELTA lo traduce a
 * `kind` cuando el bloque lo declara (`custom: { conKind: true }` en
 * `columnasKb`), porque `kind` es la forma del dato MEDIDO.
 *
 * El error no dio ni un aviso: un `switch (m.blockType)` sin `default` devuelve
 * `undefined` y React **no renderiza nada**. Las 6 páginas se servían con sus
 * filas, sus columnas y **cero módulos** — HTTP 200, build verde, `qa:slugs`
 * limpio. Lo cazó `qa:kb-cmp` con `columna.nModulos: orig 2 → clon 0`, que es
 * exactamente para lo que existe un comparador de dos lados. */

/**
 * La PIEL de un titular: lo que el editor tocó en la pestaña de tipografía de
 * Divi. **Ausente = el defecto del tema**, que vive en la hoja (`kb.css`) y en
 * `titularPorDefecto()` con la misma procedencia.
 *
 * `lh` va en RAZÓN (em) y no en px: a 390 el `h2` de 44 pasa a 35 y su
 * interlínea a 43.75, que es el mismo 1.25 sobre otra `fs`. En px daría 55 a
 * los dos anchos (§2d.7).
 */
export type PielKb = {
  fs?: number | null;
  lh?: number | null;
  fw?: number | null;
  color?: string | null;
  align?: "left" | "center" | "right" | "justify" | null;
  movilFs?: number | null;
};

export type TitularKb = PielKb & { nivel: string };

export type ModuloKb =
  | (Base & { kind: "texto-kb"; html: string; titulares?: TitularKb[] | null })
  | (Base & { kind: "imagen-kb"; src: string; alt?: string | null })
  | (Base & { kind: "boton-kb"; label: string; href: string; external?: boolean | null })
  | (Base & {
      kind: "blurb";
      titulo: string;
      nivel?: number | null;
      imagen?: string | null;
      alt?: string | null;
      descripcion?: string | null;
      reticula?: "iconos" | "col-md-4" | "ninguna" | null;
      alineacion?: "center" | "left" | null;
      /** Un GRUPO y no un array por nivel: Divi da UN control aquí (§2d.7). */
      piel?: PielKb | null;
    })
  | (Base & {
      kind: "gallery";
      items: { imagen: string; alt?: string | null; titulo?: string | null }[];
    });

export type ColumnaKb = { ancho: TipoColumnaKb; modulos: ModuloKb[] };
export type FilaKb = {
  pt?: MedidaKb | null;
  pb?: MedidaKb | null;
  mt?: MedidaKb | null;
  mb?: MedidaKb | null;
  columnas: ColumnaKb[];
};

export type ArticuloKb = {
  slug: string;
  prefijo: string;
  titulo: string;
  seo: { title: string; description?: string | null; ogImage?: string | null };
  cuerpo: FilaKb[];
};

/* ══════════════════════════════════════════════════════════════════════════
 * EL DEFECTO DE `mb` — una TABLA medida, y el `throw` que impide inventarla
 *
 * ⚠ **NO es una constante y tampoco es «función del tipo de columna».** §2d.6
 * lo corrigió con un segundo arquetipo delante: manda el **ancho de la FILA**.
 * En KB la fila mide siempre 911.75, así que las dos lecturas coinciden aquí —
 * y por eso la de la spec no fallaba dentro de KB y falla fuera.
 *
 * Es una **segunda escritura** de `mbPorDefecto` de `defaults.ts`, y eso sería
 * la clase C7 si no fuera porque el render **no puede importar** el paquete de
 * config (arrastraría Payload al bundle del cliente). La guarda contra la
 * divergencia es que los dos números están en el mismo commit y que
 * `qa:kb-cmp` mide contra el original: si divergen, el Δ lo dice.
 * ═════════════════════════════════════════════════════════════════════════ */
export const ANCHO_FILA_KB = 911.75;
const ANCHO_FILA_CASCARON = 1238.39;

export function mbPorDefectoKb(anchoFila: number, tipoColumna: TipoColumnaKb): { px1440: number; px390: number } {
  if (anchoFila === ANCHO_FILA_CASCARON) return { px1440: 34.0469, px390: 30 };
  if (anchoFila === ANCHO_FILA_KB)
    return { px1440: tipoColumna === "4_4" ? 34.0469 : 25.0625, px390: 30 };
  throw new Error(
    `mbPorDefectoKb: ancho de fila SIN MEDIR (${anchoFila}). Los dos medidos son ` +
      `${ANCHO_FILA_CASCARON} (SECTOR/MONOGRÁFICO) y ${ANCHO_FILA_KB} (articulos-kb).`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA LECTURA
 * ═════════════════════════════════════════════════════════════════════════ */

export async function articulosKb(o?: { conBorradores?: boolean }): Promise<ArticuloKb[]> {
  return leeColeccion<ArticuloKb>("articulos-kb", o);
}

/** Despacho por ruta completa: **el prefijo es campo y tiene DOS valores**. */
export async function getArticuloKb(
  segmentos: string[],
  o?: { conBorradores?: boolean },
): Promise<ArticuloKb | null> {
  const ruta = segmentos.join("/");
  return (await articulosKb(o)).find((a) => `${a.prefijo}/${a.slug}` === ruta) ?? null;
}
