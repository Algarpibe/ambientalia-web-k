import type { ReactNode } from "react";

import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { HeaderNav } from "@/components/HeaderNav";
import { ScrollToTop } from "@/components/ScrollToTop";

import "@/app/listados.css";
import "@/app/tema.css";

/**
 * EL CASCARÓN DE LAS PLANTILLAS DEL TEMA — `L3` (archivo de taxonomía) y `L5`
 * (índice de casos).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO ES `PaginaListado` CON UNA VARIANTE MÁS
 *
 * `L1` corre en **theme builder** (`et-tb-has-body`, secciones `_tb_body`) y
 * estas dos corren en **plantilla PHP del tema**: su `<body>` no trae ni
 * `et_pb_pagebuilder_layout` ni `et-tb-has-body`, y su cuerpo es **una sola
 * sección propia** —la miga— más un `.container` que **no es una sección de
 * Divi**. `lh-barrido` lo lee así:
 *
 * | | `L1` | `L3` · `L5` |
 * |---|---|---|
 * | `esqueleto.cuerpo` | 2 secciones `_tb_body` | **1** sección `propia` (la miga) |
 * | el listado | dentro de una fila Divi | dentro de `.container`, **fuera** del esqueleto |
 * | clases de sección | `et_pb_section_N_tb_body` | `et_pb_section_N` |
 *
 * Meter esto en `PaginaListado` habría obligado a ramificar el árbol entero y a
 * emitir clases `_tb_body` que el original **no sirve** — o sea a inventar
 * marcado para reutilizar un componente.
 *
 * ── Y lo que SÍ comparten `L3` y `L5`, que es por lo que este componente
 *    existe en vez de dos copias ──────────────────────────────────────────
 * El `#main-content` con la sección de la miga, el `.container`, la banda
 * `.main-title.titulo-puntos` con el `h1.entry-title`, la banda de filtros y el
 * contenedor del listado. Lo que difiere va por prop **y está medido**, no
 * parametrizado por si acaso:
 *
 * | | `L3` | `L5` |
 * |---|---|---|
 * | ancho de la fila de la miga | **1152** (80 %) | **1238.39** (86 %) |
 * | `padding-top` del `.container` | **58** (el de Divi) | **50** (`.page-template-case-studies …`) |
 * | sobretítulo | `span.tax-tap.tax-tap-category` (absoluto) | `p.sobretitulo` (**en flujo**, 30.6 px) |
 * | envoltorio | ninguno | `div#post-N.page.type-page.hentry` |
 * | cabecera | 225 / 136.58 | **458.09 / 473.08** — la única que BAJA al estrechar |
 * | secciones de pie | 3 | **4** (la banda CTA de la familia CASOS) |
 *
 * ⚠ **La cabecera de `L5` no es la de nadie más y no se acopla**: su
 * `header.et-l--header` lleva una TERCERA fila exclusiva del índice, medida en
 * las 2 instancias de `L5` y en **0 de 12** listados y **0 de 3** singulares de
 * caso. Los números se replican **como medida**: el reparto interno de esa fila
 * vive en la hoja externa y la captura no lo trae.
 */
export type VarianteTema = "sci" | "casos";

export function PaginaTema({
  variante,
  miga,
  sobretitulo,
  titulo,
  filtros,
  listado,
  hrefSiguiente,
  hrefAnterior,
}: {
  variante: VarianteTema;
  miga: BreadcrumbItem[];
  /** El rótulo sobre el `h1`. Su MARCADO difiere entre las dos formas. */
  sobretitulo: ReactNode;
  /** El texto del `h1.entry-title`. */
  titulo: string;
  /** La banda de filtros: **geometría obligatoria**, aunque su comportamiento no. */
  filtros: ReactNode;
  /** El contenedor del listado, ya compuesto por la forma. */
  listado: ReactNode;
  /** `<link rel=next>` del `<head>` — lo único que `L3` sirve de paginación. */
  hrefSiguiente?: string;
  hrefAnterior?: string;
}) {
  const esCasos = variante === "casos";
  const cuerpo = (
    <div className="container">
      <div className="main-title titulo-puntos">
        {sobretitulo}
        <h1 className="entry-title">{titulo}</h1>
      </div>
      {filtros}
      {listado}
    </div>
  );

  return (
    <>
      {hrefSiguiente ? <link rel="next" href={hrefSiguiente} /> : null}
      {hrefAnterior ? <link rel="prev" href={hrefAnterior} /> : null}

      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* El hueco EN FLUJO de la cabecera. `L5` tiene la SUYA — ver la tabla
            de arriba: coincidir con las otras formas a 1440 y no a 390 es
            justamente lo que `BANDA` existe para no dar por bueno. */}
        <BandaCabecera {...(esCasos ? BANDA.indiceCasos : BANDA.listado)} />

        <div id="et-main-area">
          <div
            id="main-content"
            data-lh={variante}
            className="lh-cuerpo lh-tema w-full overflow-hidden bg-white"
          >
            {/* ── La única sección PROPIA: la miga. `pt/pb` a 0. ─────────── */}
            <div className="migas et_pb_section et_pb_section_0 et_section_regular">
              <div data-fila="" className="et_pb_row et_pb_row_0">
                <div className="et_pb_column et_pb_column_4_4 et_pb_column_0 et_pb_css_mix_blend_mode_passthrough et-last-child">
                  <div className="et_pb_module et_pb_text et_pb_text_0 breadcrumbs et_pb_text_align_left et_pb_bg_layout_light">
                    <div className="et_pb_text_inner">
                      {/* `variante="tema"`: la interlínea del módulo de la miga
                          es **30.6 en las plantillas PHP del tema** y 26 dentro
                          de un `_tb_body`. Medido en el mismo espejo: 30.59 en
                          `L3` contra 26 en `L1-blog`. Sin esto la base cae
                          **−4.59** y arrastra la página entera. */}
                      <Breadcrumb items={miga} envoltorio="heredado" variante="tema" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ⚠ **El `.container` de `L5` va DENTRO de un `div.hentry`, y el de
                `L3` no.** No es adorno: el `padding-top: 50px` del índice lo
                pone `.page-template-case-studies #main-content .hentry
                .container`, o sea que **sin el envoltorio la regla no aplica** y
                el listado subiría 50 px. Es §El principio en su forma de
                cascada: se replica lo que el navegador hace con lo servido. */}
            {esCasos ? <div className="page type-page status-publish has-post-thumbnail hentry">{cuerpo}</div> : cuerpo}
          </div>
        </div>

      </main>

      {/* ⚠ `L5` sirve CUATRO secciones de pie y las otras cuatro formas TRES: la
          4.ª es la banda CTA de la familia CASOS. **La emite este `Footer`**,
          que con `tipo="caso"` la pone delante de `footer-links` — es la misma
          que el singular del caso ya sirve y `qa:d4-cta` ya midió.

          ⚠ Aquí hubo un prop `bandaCta` «para que la página compusiera la 4.ª
          sección». **Nadie lo pasaba nunca**, porque el `Footer` ya lo hacía: un
          hueco declarado que otro sitio llenaba, o sea un comentario que promete
          algo que el código no hace (§sondas 3). Se borra en vez de
          actualizarse. */}
      {/* ⚠ **`L3` y `L5` NO comparten pie, y esto llevaba mal desde que se
          construyeron** (2026-08-20, 86.ª tanda, §F3-LH-PIE-UNO-CONTRA-CUATRO).
          `grupoA` sirve la piel A —fila al 86 %— y `L3-sci` usa la **piel C**,
          fila al 80 %, igual que su cuerpo. Medido: **−86.34 @1440** y
          **−289.64 @390**, todo en `footer-links`, y sin adjudicar hasta hoy
          porque `pie.rect.h` es eje MIXTO y el comparador no lo lee como
          defecto. `L5` sí es piel A + la sección CTA, así que se queda. */}
      <Footer tipo={esCasos ? "caso" : "listadoTema"} />
      <ScrollToTop />
    </>
  );
}
