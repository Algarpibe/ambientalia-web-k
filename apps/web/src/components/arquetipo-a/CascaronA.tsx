import type { ReactNode } from "react";

import { Breadcrumb } from "@/components/Breadcrumb";

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

/** Fila del `tb_body`: 86 % con tope de 1380. Idéntica en las tres plantillas. */
export function FilaA({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-fila="" className={`mx-auto w-[86%] max-w-[1380px] ${className}`}>{children}</div>
  );
}

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
 * Ahora es lo que tenía que haber sido: **el componente base, con la retícula
 * del arquetipo A**. Lo único propio de A es el ancho de fila (86 %, frente al
 * 80 % de producto); la interlínea de 26 y el truncado del último eslabón son
 * del defecto porque están medidos en las 7 formas.
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
 * `section#1` — la que contiene el `post_content`. `pt/pb` **57.59 a 1440 y 50
 * a 390**: se mueve con el ancho, o sea que es el 4 % por defecto de Divi y
 * **plantilla** por el test A. (En este régimen el test A no decide campo vs
 * plantilla, pero sí identifica el valor como el default de Divi.)
 */
export function SeccionCuerpoA({ children }: { children: ReactNode }) {
  return (
    <section className="w-full bg-white pt-[50px] pb-[50px] min-[981px]:pt-[57.59px] min-[981px]:pb-[57.59px]">
      {children}
    </section>
  );
}

/** Columna principal: 73.62 % (911.75 a 1440), ancho completo al apilar. */
export function ColumnaPrincipalA({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`w-full min-[981px]:w-[73.62%] ${className}`}>{children}</div>;
}

/** Columna lateral: 20.87 % (258.5 a 1440) con gutter de 5.5 %. */
export function ColumnaLateralA({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full min-[981px]:w-[20.87%] min-[981px]:ml-[5.5%] ${className}`}>
      {children}
    </div>
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
