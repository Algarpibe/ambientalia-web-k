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

export type VarianteL1 = "blog" | "etiqueta";

/** El ritmo de la fila del listado, que es donde las dos variantes difieren. */
const FILA2 = {
  /* blog: `pt` 14.3906 @1440 · 3.89062 @390 */
  blog: { ptLg: "14.3906px", pt: "3.89062px" },
  /* etiqueta: `pt` 28.7969 @1440 · 30 @390 — el default de Divi (2 % de la fila) */
  etiqueta: { ptLg: "28.7969px", pt: "30px" },
} as const;

export function PaginaListado({
  variante,
  miga,
  titular,
  descripcion,
  listado,
  paginador,
}: {
  variante: VarianteL1;
  miga: BreadcrumbItem[];
  /** El módulo del `h1`, ya compuesto por la variante (difiere en marcado). */
  titular: ReactNode;
  /** Sólo `/etiqueta`: el módulo `et_pb_text_4_tb_body` con la descripción. */
  descripcion?: ReactNode;
  /** El módulo del listado, ya compuesto por la variante. */
  listado: ReactNode;
  /** El módulo del paginador. En `/blog` va DENTRO del de listado ⇒ aquí `null`. */
  paginador?: ReactNode;
}) {
  const ritmo = FILA2[variante];
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* El hueco EN FLUJO de la cabecera: 225 / 136.58, deducidos de la `y`
            de la primera sección `_tb_body`, que no tiene `padding-top`. */}
        <BandaCabecera {...BANDA.listado} />

        {/* `#main-content` es el `contenedorTema` que el barrido mide: 1440 de
            ancho, fondo #f7f7f7 y `overflow: hidden`. */}
        <div id="et-main-area">
          <div id="main-content" className="w-full overflow-hidden bg-[#f7f7f7]">
            <div className="et-l et-l--body lh-cuerpo">
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

                  <FilaListado
                    n={2}
                    /* ⚠ `true` en las DOS variantes construidas, y no es un
                       cableado: es lo que `lh-barra.json` mide en 80 de 80
                       documentos. El camino `false` existe y está SIN
                       EJERCITAR — ver la cabecera de `ListadoB.tsx`. */
                    conBarra
                    ptLg={ritmo.ptLg}
                    pt={ritmo.pt}
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
