import type { ReactNode } from "react";

import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { HeaderNav } from "@/components/HeaderNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BarraLateral } from "@/components/listados/BarraLateral";
import {
  ColumnaDivi,
  FilaListado,
  FilaTbDivi,
  ModuloTexto,
  SeccionTb,
} from "@/components/listados/ListadoB";
import { Paginador } from "@/components/listados/Paginador";

import "@/app/listados.css";

/**
 * EL ÁRBOL DE `LISTADO-B` — el cascarón `_tb_body` que comparten las dos
 * variantes construidas.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL VOCABULARIO ES EL DE DIVI, Y ESO ES UNA DECISIÓN CON RAZÓN
 *
 * `lh-barrido.mjs` lee el esqueleto por `.et_pb_section` · `.et_pb_row` ·
 * `.et_pb_column_*` · `.et_pb_module`, y es **un solo instrumento para los dos
 * lados** — su cabecera dice por qué: dos barridos serían la clase C7 con su
 * peor salida, *los dos verdes en su propio marco midiendo cosas distintas*.
 * `nSecciones`, `nFilas`, `nColumnas`, `reparto` y `nModulos` son eje
 * **plantilla**, así que emitir otro vocabulario no sería una diferencia de
 * estilo: sería no poder comparar.
 *
 * ── Lo que este árbol NO reproduce, dicho con su nombre ───────────────────
 * | qué | por qué |
 * |---|---|
 * | `body.clases` (`blog`, `archive`, `tag-411`…) | son artefactos de WordPress y el `<body>` del clon es **uno solo** para las 302 rutas: el App Router no deja variarlo por ruta |
 * | `regimen.tbBody` | ídem — sale `false` en el clon y `true` en el original |
 * | `porCapa.tb_header` / `tb_footer` | Divi mete cabecera y pie **dentro de `.et_pb_section`**; el clon los sirve en Tailwind ya verificado a dos anchos. Es la divergencia que `c-cmp` ya midió en las 31 rutas, no una de esta tanda |
 * | `fontFamily` | el clon carga Manrope con `next/font`, que la sirve con un nombre generado. **La fuente es la misma**; el literal computado no |
 *
 * Las cuatro se declaran en `PENDIENTES-QA.md` con su número de pares. Ninguna
 * se disfraza: emitir `et-tb-has-body` con un efecto de cliente, por ejemplo,
 * pondría verde el par sin que la afirmación fuera cierta en el HTML servido.
 */

export type VarianteL1 = "blog" | "etiqueta" | "resources";

/**
 * La clase de ritmo de la fila del listado. El VALOR vive en `listados.css`;
 * aquí sólo cuál toca, porque `estiloInline` es eje `plantilla` y el original lo
 * trae a `null`.
 *
 * ⚠ Y el ritmo difiere en **dos celdas, no en una** — el `14.3906` está en las
 * dos variantes y en propiedades distintas: `padding-top` de la fila en blog,
 * `margin-top` en etiqueta. Ver el bloque de la fila 2 en la hoja.
 */
/**
 * ⚠ **`resources` entra con la cadena VACÍA, y eso es una declaración, no un
 * olvido.** El espejo (`lh-spec-{1440,390}.json`) mide **secciones**, no filas:
 * de `resources` sabemos que su sección 1 lleva `pt/pb 57.5938` @1440 y `50`
 * @390 —idéntico a las otras dos— y **no sabemos el ritmo de sus tres filas**.
 *
 * Inventarle una clase con los números de blog sería cablear el valor de otra
 * variante, que es exactamente cómo se fabrica una FAMILIA DE CALIBRACIÓN. Se
 * entra con el default de Divi y **lo adjudica `qa:lh-cmp` contra el original**,
 * que es el instrumento que existe para eso.
 */
const FILA2 = { blog: "lh-fila2-blog", etiqueta: "lh-fila2-etiqueta", resources: "" } as const;

export function PaginaListado({
  variante,
  miga,
  titular,
  descripcion,
  chips,
  listado,
  paginador,
  hrefSiguiente,
  hrefAnterior,
}: {
  variante: VarianteL1;
  miga: BreadcrumbItem[];
  /** El módulo del `h1`, ya compuesto por la variante (difiere en marcado). */
  titular: ReactNode;
  /** Sólo `/etiqueta`: el módulo `et_pb_text_4_tb_body` con la descripción. */
  descripcion?: ReactNode;
  /**
   * Sólo `/recursos/*`: el módulo `et_pb_text_2_tb_body` con el grupo de
   * botones de filtro. Va en **su propia fila**, que es la diferencia de árbol
   * entre esta variante y las otras dos.
   */
  chips?: ReactNode;
  /** El módulo del listado, ya compuesto por la variante. */
  listado: ReactNode;
  /** El módulo del paginador. En `/blog` va DENTRO del de listado ⇒ aquí `null`. */
  paginador?: ReactNode;
  /** `<link rel="next">` del `<head>` — el original lo sirve y el barrido lo lee. */
  hrefSiguiente?: string;
  /** `<link rel="prev">`. Medido en `/recursos/*`; en las otras dos SIN MEDIR. */
  hrefAnterior?: string;
}) {
  const ritmo = FILA2[variante];
  const esRecursos = variante === "resources";
  return (
    <>
      {/* `<link rel=next>` — el original lo sirve y `lh-barrido` lo lee como
          `paginador.linkNextDelHead`. React lo iza al `<head>` en el App Router.
          Es además lo ÚNICO que `L3` sirve de paginación, así que el rol existe
          aparte del control del cuerpo. */}
      {hrefSiguiente ? <link rel="next" href={hrefSiguiente} /> : null}
      {hrefAnterior ? <link rel="prev" href={hrefAnterior} /> : null}

      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* El hueco EN FLUJO de la cabecera: 225 / 136.58, deducidos de la `y`
            de la primera sección `_tb_body`, que no tiene `padding-top`. */}
        <BandaCabecera {...BANDA.listado} />

        {/* `#main-content` es el `contenedorTema` que el barrido mide: 1440 de
            ancho, fondo #f7f7f7 y `overflow: hidden`. */}
        <div id="et-main-area">
          {/* `lh-cuerpo` va AQUÍ y no en `.et-l--body`: el barrido mide
              `#main-content` como `contenedorTema`, y su `borderColor` —que sin
              borde declarado es `currentColor`— salía con el `rgba(0,0,0,0.1)`
              del preflight de Tailwind hasta que el reset lo alcanzó. */}
          <div id="main-content" className="lh-cuerpo w-full overflow-hidden bg-[#f7f7f7]">
            <div className="et-l et-l--body">
              <div className="et_builder_inner_content et_pb_gutters3">
                {/* ── Sección 0 · la miga. `pt/pb` a 0 en los dos anchos. ── */}
                <SeccionTb n={0}>
                  <FilaTbDivi n={0}>
                    <ColumnaDivi tipo="4_4" n={0} ultima>
                      <ModuloTexto n={0} extra="breadcrumbs">
                        <Breadcrumb items={miga} envoltorio="heredado" />
                      </ModuloTexto>
                    </ColumnaDivi>
                  </FilaTbDivi>
                </SeccionTb>

                {/* ── Sección 1 · titular + listado. `pt/pb` 57.5938 / 50. ── */}
                <SeccionTb n={1}>
                  <FilaTbDivi n={1}>
                    <ColumnaDivi tipo="4_4" n={1} ultima>
                      {titular}
                      {descripcion}
                    </ColumnaDivi>
                  </FilaTbDivi>

                  {/* ⚠ **El árbol de `resources` tiene TRES filas y el de las
                      otras dos, DOS**, y ésa es la diferencia estructural que
                      obliga a ramificar aquí en vez de parametrizar una sola
                      composición:

                        blog · etiqueta   fila1(titular) · fila2(listado + barra)
                        resources         fila1(titular) · fila2(chips) · fila3(listado)

                      Medido con **una sola firma de árbol en las 18 páginas con
                      contenido** de `/recursos/`, así que no es una instancia
                      rara: es la plantilla de la variante.

                      Y en `resources` el listado NO cuelga de la columna: cuelga
                      de un módulo de texto VACÍO (`et_pb_text_3_tb_body`) y va
                      dentro de su `.et_pb_text_inner`, con el `<nav>` de
                      hermano. Colgarlo de la columna «porque es donde va en las
                      otras dos» habría quitado dos niveles que el barrido lee. */}
                  {esRecursos ? (
                    <>
                      <FilaTbDivi n={2}>
                        <ColumnaDivi tipo="4_4" n={2} ultima>
                          {chips}
                        </ColumnaDivi>
                      </FilaTbDivi>

                      <FilaTbDivi n={3} extra={ritmo}>
                        <ColumnaDivi tipo="4_4" n={3} ultima>
                          <ModuloTexto n={3}>
                            {listado}
                            {paginador}
                          </ModuloTexto>
                        </ColumnaDivi>
                      </FilaTbDivi>
                    </>
                  ) : (
                    <FilaListado
                      n={2}
                      ritmo={ritmo}
                      extra={variante === "blog" ? "blog-contenido" : ""}
                      barra={
                        <BarraLateral
                          /* `et_pb_with_border` lo lleva blog y no etiqueta,
                             medido en las dos instancias. */
                          conBorde={variante === "blog"}
                          /* `/categoria/<slug>/` **no está clonado** (va en F3-4),
                             así que el enlace se queda apuntando al original —
                             §Regla de rutas locales. */
                          hrefCategoria={(slug) => `https://kunakair.com/es/categoria/${slug}/`}
                        />
                      }
                    >
                      {listado}
                      {paginador}
                    </FilaListado>
                  )}
                </SeccionTb>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer tipo="grupoA" />
      <ScrollToTop />
    </>
  );
}

/** El módulo del paginador de `/etiqueta`: va SOLO, en `et_pb_text_6_tb_body`. */
export function ModuloPaginador({ children }: { children: ReactNode }) {
  return <ModuloTexto n={6}>{children}</ModuloTexto>;
}

export { Paginador };
