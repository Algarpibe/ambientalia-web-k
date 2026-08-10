import type { ReactNode } from "react";

import { Breadcrumb } from "@/components/Breadcrumb";
import { ColumnaAncha, ColumnaEstrecha, FilaTb, SeccionCuerpoTb } from "@/components/CascaronTb";

/**
 * EL CASCARÓN DEL ARQUETIPO A — las piezas comunes a las tres plantillas.
 *
 * Recon `docs/research/arquetipo-A/`, esquema `ESQUEMA-CMS.md` §2.
 * Medición de construcción congelada en
 * `scripts/qa/medidas/a-cascaron-{1440,390}-2026-07-31-4.json`
 * (`npm run qa:a-cascaron -- 1440|390`).
 *
 * ── Por qué aquí no hay ni un campo de presentación ────────────────────────
 * Al contrario que SECTOR —donde media docena de propiedades resultaron ser
 * campos editoriales— **el cascarón de A no tiene ni uno**: cero varianza en 24
 * instancias, en ritmo, tipografía y retícula. Y la razón no es suerte, es el
 * RÉGIMEN (`CLAUDE.md` §régimen): A es **plantillado**, así que la persona que
 * escribiría esos valores por página **no existe**. Quien redacta una entrada
 * rellena el `post_content` y nada más.
 *
 * Por eso todo lo de este fichero va en el componente y nada en el dato. Es
 * exactamente la decisión contraria a la de `SectorBody`, y por una razón
 * medida — no por gusto.
 *
 * ── La retícula es la del sitio: no estrena nada ──────────────────────────
 * fila **86 %** con `max-width: 1380` (1238.39 a 1440 · 335.39 a 390), columnas
 * **73.62 % + 20.87 %** con gutter **5.5 %** — los tokens `3_4` y `1_4` que
 * `monografico.ts` ya tenía.
 *
 * ── El corte responsive es el de Divi: 980, no el `md` de Tailwind ────────
 * Las columnas apilan por debajo de **981 px**. Usar `md:` (768) habría dejado
 * dos columnas entre 768 y 980, que es donde el original ya apila.
 */

/* ══════════════════════════════════════════════════════════════════════════
 * LA RETÍCULA DEL `_tb_body` — REEXPORTADA desde `components/CascaronTb.tsx`
 *
 * ⚠ **Movida el 2026-08-10 (F3-1 PASO 1 de la construcción), y por una medida:**
 * `articulos-kb` usa **la misma plantilla de theme-builder**, al píxel y a los
 * dos anchos —fila 1238.39/335.39 con tope 1380, sección `pt/pb` 57.5938/50,
 * columnas 911.75 y 258.5, canal 68.1094—. Lo único que cambia es el LADO de la
 * columna estrecha, que en A va a la derecha y en KB a la izquierda.
 *
 * Así que estas cuatro piezas **no son del arquetipo A**: son del cascarón, y
 * dejarlas aquí con nombre de arquetipo habría obligado a la segunda página a
 * importar `arquetipo-a/` o a copiarlas — que es la clase C7. Es la regla del
 * repo (*cuando un componente de página se reutiliza, se extrae a la raíz*)
 * aplicada con su verificación: **el JSX emitido es el mismo**, y quien lo dice
 * es `qa:html-cmp` byte a byte, no el diff.
 *
 * Los nombres de siempre se conservan para no tocar a sus 3 importadores.
 * ═════════════════════════════════════════════════════════════════════════ */
export const FilaA = FilaTb;
export const SeccionCuerpoA = SeccionCuerpoTb;
export const ColumnaPrincipalA = ColumnaAncha;
/** La barra de A va a la DERECHA: el canal es `ml`. Medido en las 24. */
export const ColumnaLateralA = ColumnaEstrecha;

/**
 * `section#0` — la sección de las migas del grupo A.
 *
 * ⚠ **Esto era un componente DUPLICADO, y lo era sin necesidad.** La primera
 * versión reimplementó la miga aquí —con el separador escrito como `›` en el
 * marcado y `mx-[6px]`— cuando `src/components/Breadcrumb.tsx` ya la pintaba
 * para producto, caso y los 6 sectores. La regla del proyecto dice extraer a la
 * raíz cuando un componente se reutiliza; aquí el de la raíz **ya existía** y se
 * escribió otro al lado.
 *
 * El coste no fue el duplicado: fue que el duplicado **divergió**. El original
 * no escribe el separador en el marcado —lo pinta un `::after` del `li` con
 * `content: "/"`, `padding-left: 7.2`— y el eslabón lleva `padding-right: 7.2`.
 * Reimplementarlo a mano dio `75.89` donde el original mide `75.72`.
 *
 * ⚠ **`articulos-kb` NO la usa**, y es medida: su cascarón tiene **5 secciones**
 * y ninguna es de migas (`cascaron.spec.md` §1). Por eso esta pieza se queda
 * aquí y no sube a `CascaronTb` con las otras cuatro.
 */
export function MigasA({ migas }: { migas: { label: string; href?: string }[] }) {
  return (
    <Breadcrumb
      items={migas}
      rowClassName="mx-auto w-[86%] max-w-[1380px]"
      variante="producto"
    />
  );
}

/**
 * El titular. **44.1 / 52.92 / peso 300 / `#333` / `ls −0.5`** a 1440 y
 * **35 / 42** a 390 en blog y documento científico.
 *
 * ⚠ **El término NO reduce**: su `h1` mide **44 / 52.8 a los DOS anchos**, y
 * además lleva `margin-bottom: 44`, que las otras dos no tienen. Es una de las
 * tres diferencias que hacen que A sean tres plantillas y no una con
 * discriminante. Por eso `responsive` es una prop y no una constante.
 *
 * ⚠ Y el número **no se lee del módulo**: `text#1` computa
 * `color: rgb(255,255,255)` —blanco sobre blanco— porque es el `<div>` del
 * módulo y el `h1` de dentro lo pisa. Maquetar con el valor del contenedor
 * habría dado un titular invisible (`CLAUDE.md` §El NIVEL al que se mide).
 */
export function TituloA({
  children,
  responsive = true,
  className = "",
}: {
  children: ReactNode;
  responsive?: boolean;
  className?: string;
}) {
  return (
    <h1
      className={
        responsive
          ? `text-[35px] leading-[42px] font-light tracking-[-0.5px] text-[#333] min-[981px]:text-[44.1px] min-[981px]:leading-[52.92px] ${className}`
          : `text-[44px] leading-[52.8px] font-light tracking-[-0.5px] text-[#333] ${className}`
      }
    >
      {children}
    </h1>
  );
}

/**
 * La autoría. **Idéntica en las 11 instancias que la llevan** (7 de blog y 4 de
 * documento científico), así que es **plantilla, no campo** — el discriminador
 * del régimen plantillado es la varianza entre instancias, y aquí es cero.
 *
 * Y no es una conclusión de pasada: LH-2 D3 ya había decidido **sin `autor`**
 * porque no lo pide ningún listado (0 de 9 formas, 0 URLs de `author` en `/es`).
 * Esta medida lo confirma por el otro lado — tampoco lo pide el detalle.
 *
 * El original la sirve **dos veces**, una por columna, y esconde la que no toca:
 * a 1440 se ve la de la lateral (`text#5`) y a 390 la de la principal
 * (`text#4`). Se reproduce igual, porque el ritmo de cada columna depende de
 * cuál esté viva.
 */
export const AUTORIA = "Escrito por el Equipo de marketing y comunicación";

export function AutoriaA({ donde }: { donde: "principal" | "lateral" }) {
  return (
    <div
      className={
        donde === "principal"
          ? "mb-[30px] text-[18px] leading-[30.6px] text-[#333] min-[981px]:hidden"
          : "hidden text-[18px] leading-[30.6px] text-[#333] min-[981px]:mb-[34.05px] min-[981px]:block"
      }
    >
      {AUTORIA}
    </div>
  );
}
