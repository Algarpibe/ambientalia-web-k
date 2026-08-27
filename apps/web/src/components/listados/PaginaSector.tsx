import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { HeaderNav } from "@/components/HeaderNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WidgetsBarra } from "@/components/listados/BarraLateral";
import { ColumnaDivi, FilaTbDivi, ModuloTexto, SeccionTb } from "@/components/listados/ListadoB";
import { ARCHIVO_SECTOR, getArchivoSector, rutasArchivoSector } from "@/lib/sector-archivo";
import { getTermino } from "@/lib/taxonomia-sectores";

import "@/app/listados.css";
import "@/app/tema.css";

/**
 * `L1-sector` — el ARCHIVO DE TAXONOMÍA `/sector/<slug>` y `/sector/<slug>/page/N`.
 *
 * Decisión: `ESQUEMA-CMS.md` §7i (c2) — **REPLICAR TAL CUAL**, por precedente
 * `D2.5`, que ya decidió esto para las 55 URLs que responden 200 sin listar.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL RÉGIMEN, COMPROBADO POR SU INVARIANTE Y NO POR SU MARCADOR
 *
 * El `<body>` trae `et-tb-has-body` y **no** `et_pb_pagebuilder_layout` ⇒ `-T`,
 * PLANTILLADA. Y no se lee sólo del marcador: §*una clase se puede copiar a
 * mano*, así que se comprueba el **invariante del contador** — el constructor
 * numera cada sección una vez, luego `ocurrencias == distintos`. Medido sobre
 * la captura, **sin `<style>` ni `<script>`** (el CSS de Divi nombra sus
 * propias clases, que es el falso pleno de §sondas 4):
 *
 *   > `et_pb_section_0_tb_body` · `et_pb_section_1_tb_body` — **occ 2 = dis 2**.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ NO ES `PaginaListado` CON UNA VARIANTE MÁS
 *
 * Comparten sección 0 (la miga) y el par de columnas `3_4 + 1_4`, y aun así el
 * árbol difiere en tres sitios **medidos sobre la salida servida**:
 *
 * | | `blog` · `etiqueta` | **`sector`** |
 * |---|---|---|
 * | clase de la fila 2 | `et_pb_row_3-4_1-4` + ritmo | **ninguna**: `et_pb_row_2_tb_body` a secas |
 * | columna `3_4` | lleva el listado | **VACÍA**, con `et_pb_column_empty` |
 * | módulo del titular | `et_pb_text_3_tb_body` | **`et_pb_text_2_tb_body`** |
 *
 * Reutilizar `FilaListado` habría emitido `et_pb_row_3-4_1-4`, **una clase que
 * el original no sirve aquí** — o sea inventar marcado para reutilizar un
 * componente, que es justo lo que la cabecera de `PaginaTema` ya rechazó una
 * vez. Los PRIMITIVOS sí se reutilizan; la composición es propia.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE NO HAY, Y ES LO QUE DEFINE ESTE ARQUETIPO
 *
 * Derivado de las 13 capturas, con `<style>` y `<script>` fuera:
 *
 *   · **0 `<article>`** — cero tarjetas, por los tres selectores;
 *   · **0 `et_pb_blog_N_tb_body`** — no hay módulo de listado;
 *   · **0 `role="navigation"`** y **0 `span.pages`** — **no hay paginador en el
 *     cuerpo**, aunque las URLs `/page/N` existan y respondan 200;
 *   · **0 `<link rel=canonical>`**.
 *
 * Emitir un paginador «porque hay páginas» sería exactamente el error que este
 * repo llama *transcribir lo que el autor pretendía en vez de lo servido*.
 *
 * ── La miga tiene UN eslabón, no dos ─────────────────────────────────────
 * `<ol class="kunak-breadcrumbs">` con **sólo `Inicio`**. No lleva el nombre
 * del término, al revés que `/etiqueta`. Medido en las 13.
 *
 * ── El sobretítulo es UNO, no tres ───────────────────────────────────────
 * `/etiqueta` sirve tres `span.tax-tap` —uno por idioma, con `ocultar-*`—.
 * Aquí hay **uno solo**: `span.tax-tap.tax-tap-sector` con el literal
 * «Sector», sin variantes de idioma. Verbatim.
 *
 * ── Lo que este componente NO resuelve, con su cardinal (§regla 14) ───────
 * · el **ritmo** de la fila 2 (`padding` de fila) está **SIN MEDIR**: no se le
 *   pone clase de ritmo, así que hereda el default. Ninguna de las 13 capturas
 *   se ha medido con `getComputedStyle` —el corpus da marcado, no geometría—,
 *   y **cablear un valor sin medirlo es cómo se fabrica un arreglo falso**;
 * · **2 de 11** términos (`mineria`, `obras`) no tienen ninguna captura, así
 *   que su forma es **DESCONOCIDA**, no vacía.
 */
export function PaginaSector({ slug, n }: { slug: string; n: number }) {
  const a = getArchivoSector(slug);
  /* §regla 6 en el render: la ausencia se RECHAZA. Un `n` fuera de las páginas
     medidas no cae en un camino silencioso — `notFound()` es ruidoso y visible,
     y un `undefined` devuelto aquí no fallaría: no pintaría. */
  if (!Number.isInteger(n) || !a.paginas.includes(n)) notFound();
  const t = getTermino(slug);

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        <BandaCabecera {...BANDA.listado} />

        <div id="et-main-area">
          <div id="main-content" data-lh="sector" className="lh-cuerpo w-full overflow-hidden bg-[#f7f7f7]">
            <div className="et-l et-l--body">
              <div className="et_builder_inner_content et_pb_gutters3">
                {/* ── Sección 0 · la miga, de UN solo eslabón. ── */}
                <SeccionTb n={0}>
                  <FilaTbDivi n={0}>
                    <ColumnaDivi tipo="4_4" n={0} ultima>
                      <ModuloTexto n={0} extra="breadcrumbs">
                        <Breadcrumb items={[{ label: "Inicio", href: "/" }]} envoltorio="heredado" />
                      </ModuloTexto>
                    </ColumnaDivi>
                  </FilaTbDivi>
                </SeccionTb>

                {/* ── Sección 1 · titular (fila 1) + barra (fila 2). ── */}
                <SeccionTb n={1}>
                  <FilaTbDivi n={1}>
                    <ColumnaDivi tipo="4_4" n={1} ultima>
                      {/* `et_pb_text_2_tb_body`, no el 3 de `/etiqueta`. */}
                      <ModuloTexto n={2}>
                        {/* UN sobretítulo, sin variantes de idioma. El `{" "}`
                            reproduce el blanco que el original sirve entre el
                            `span` y el `h1`: §*el espacio entre elementos
                            enlínea se RENDERIZA* — un JSX «limpio» lo perdería. */}
                        <span className="tax-tap tax-tap-sector">Sector</span>{" "}
                        <h1>{t.nombre}</h1>
                      </ModuloTexto>
                    </ColumnaDivi>
                  </FilaTbDivi>

                  {/* ⚠ Fila 2 SIN clase extra: el original sirve
                      `et_pb_row et_pb_row_2_tb_body` y nada más. La `3_4` va
                      VACÍA y **no** es `et-last-child`; la `1_4` sí. */}
                  <FilaTbDivi n={2}>
                    <ColumnaDivi tipo="3_4" n={2} extra="et_pb_column_empty" />
                    <ColumnaDivi tipo="1_4" n={3} ultima>
                      <div className="et_pb_module et_pb_sidebar_0_tb_body et_pb_widget_area clearfix et_pb_widget_area_right et_pb_bg_layout_light">
                        {/* `/categoria/<slug>/` NO está clonado —§7i (a) lo deja
                            como relación SIN archivo, 0 rutas—, así que el
                            enlace se queda en el original (§Regla de rutas
                            locales). Derivado en `estado-118`: 6 href de código
                            y los 6 al original, 0 rotos. */}
                        <WidgetsBarra hrefCategoria={(s) => `https://kunakair.com/es/categoria/${s}/`} />
                      </div>
                    </ColumnaDivi>
                  </FilaTbDivi>
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

/** Los params de las 13 páginas, derivados de la lista medida. */
export function paramsSector() {
  return rutasArchivoSector();
}

/** Sólo los términos que sirven su página 1 — las 6 rutas base. */
export function paramsSectorBase() {
  return ARCHIVO_SECTOR.filter((a) => a.paginas.includes(1)).map((a) => ({ slug: a.slug }));
}

/** Los `(slug, n)` con `n ≥ 2` — las 7 rutas `/page/N`. */
export function paramsSectorPaginas() {
  return rutasArchivoSector()
    .filter((r) => r.n >= 2)
    .map((r) => ({ slug: r.slug, n: String(r.n) }));
}

/**
 * El `<title>`, verbatim del original.
 *
 * Patrón medido en 9 de 10 términos con captura: `<nombre> Archives - Kunak`
 * en la página 1 y `<nombre> Archives - Página N de M - Kunak` en las demás.
 * `industria` trae un título propio y por eso `tituloArchivo` existe — es un
 * campo, no una rama: **varía entre instancias**.
 */
export function metadataSector(slug: string, n: number): Metadata {
  const a = getArchivoSector(slug);
  const base = a.tituloArchivo ?? `${getTermino(slug).nombre} Archives`;
  return { title: n === 1 ? `${base} - Kunak` : `${base} - Página ${n} de ${a.total} - Kunak` };
}
