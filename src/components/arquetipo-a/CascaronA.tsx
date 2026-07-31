import type { ReactNode } from "react";

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
    <div className={`mx-auto w-[86%] max-w-[1380px] ${className}`}>{children}</div>
  );
}

/**
 * `section#0` — la sección de las migas. **50 px de alto a 1440** (fila
 * `pt/pb 12` + texto de 26) y 102 a 390 cuando la miga envuelve a 3 renglones.
 *
 * El texto va a **12 px / 600 / `#0075C9` / `letter-spacing: .3px`**, que no es
 * el gris del resto del sitio: la miga del arquetipo A es azul y semibold.
 * Medido, no heredado del caso — ahí es otra cosa.
 *
 * ── ⚠ La interlínea es 26, y el módulo dice 30.6 ─────────────────────────
 * La primera versión puso `leading-[30.6px]`, que es el `line-height` computado
 * de `text#0`, y salió **+4.58 en las tres formas a 1440** — un residuo
 * constante, o sea una sola causa por encima del `h1`. La composición la señala
 * sin ambigüedad:
 *
 *   original @1440   12 + **26** + 12 = **50**  = `section#0` ✓
 *   original @390    12 + 3×**26** + 12 = **102** = `section#0` con 3 renglones ✓
 *   clon con 30.6    12 + 30.6 + 12 = 54.6  →  **+4.6**, que es el +4.58 medido
 *
 * Es `CLAUDE.md` §El NIVEL al que se mide otra vez, y por tercera vez en este
 * arquetipo: el `line-height` del **módulo** no es el del elemento que ocupa
 * sitio. El alto real del elemento —26— es el dato; 30.6 es el del contenedor.
 */
export function MigasA({ migas }: { migas: { label: string; href?: string }[] }) {
  return (
    <section className="w-full bg-white">
      <FilaA className="py-[12px]">
        <div className="text-[12px] font-semibold leading-[26px] tracking-[0.3px] text-[#0075C9]">
          {migas.map((m, i) => (
            <span key={`${m.label}-${i}`}>
              {i > 0 && <span className="mx-[6px]">›</span>}
              {m.href ? (
                <a href={m.href} className="hover:underline">
                  {m.label}
                </a>
              ) : (
                <span>{m.label}</span>
              )}
            </span>
          ))}
        </div>
      </FilaA>
    </section>
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
