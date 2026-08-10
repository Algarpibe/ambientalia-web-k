import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ColumnaAncha, ColumnaEstrecha, FilaTb, SeccionCuerpoTb } from "@/components/CascaronTb";
import { CuerpoKb } from "@/components/kb/CuerpoKb";
import { articulosKb, getArticuloKb } from "@/lib/cms/articulos-kb";

/**
 * LA PÁGINA DE `articulos-kb`, compartida por sus DOS raíces de ruta.
 *
 * ── Por qué dos ficheros de ruta y un solo componente ─────────────────────
 * `prefijo` es campo **required** con dos valores medidos
 * (`centro-de-ayuda/kunak-air/articulos-de-ayuda` ×5 y
 * `soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda` ×1), así que la
 * URL **no se puede componer desde el slug** — es el mismo hallazgo que obligó
 * al catch-all de `/recursos/[...ruta]` en grupo A.
 *
 * Los dos prefijos empiezan por segmentos distintos (`centro-de-ayuda` y
 * `soporte`), y un `[...ruta]` en la RAÍZ competiría con `/[slug]`, que ya sirve
 * las 202 del plano. Así que van dos catch-all, uno por raíz, **con el árbol de
 * página en un solo sitio**: dos copias del árbol de un arquetipo es la peor
 * forma de duplicación que hay — enseñan algo *parecido*, y divergen el día que
 * alguien toca una sola de las dos sin que nada lo diga.
 *
 * `dynamicParams = false` va en cada ruta: sin eso, `/soporte/lo-que-sea`
 * responde 200 con una página cualquiera en vez de 404 (medido en el andamio del
 * ENRUTADO de grupo A, resultado 3).
 *
 * ── Lo que el cascarón aporta, y lo que NO está verificado ────────────────
 * La retícula del `_tb_body` es **la misma plantilla de theme-builder que grupo
 * A**, medida al píxel a los dos anchos (`CascaronTb`). Lo único que cambia es
 * el LADO de la columna estrecha: **izquierda** aquí, derecha en A.
 *
 * ⚠ **La cabecera y el pie NO se han comparado contra el original en esta
 * familia** (§F3-1-CASCARON-KB-SIN-COMPARAR). `c-cabecera` cubre 17 rutas y
 * ninguna es de KB; que sean los mismos módulos `_tb_` que el resto del sitio es
 * una hipótesis razonable, **no una medida**. Lo que sí está medido es el ALTO
 * de la cabecera —225 / 165.58, varianza 0 en las 6— y por eso `BANDA.kb` tiene
 * entrada propia en vez de reusar la de grupo A.
 *
 * ⚠ **La barra lateral se emite VACÍA.** El original tiene ahí un
 * `et_pb_sidebar_0_tb_body` con **1 widget** en 6/6, y su contenido **no está
 * medido**: `cascaron.spec.md` §2 midió la caja (258.5 · canal 68.1094 · `y`
 * alineada con el contenido) y no lo de dentro. Emitir la columna sin el widget
 * conserva la retícula —que es lo medido— y deja el hueco visible;
 * inventarle contenido sería rellenar una medida que no se tomó.
 */

/** El alto de cabecera de esta familia, medido en sus 6 instancias. */
export const BANDA_KB = BANDA.kb;

type Params = { ruta: string[] };

/** `centro-de-ayuda` · `soporte` — la raíz que cada fichero de ruta declara. */
export type RaizKb = "centro-de-ayuda" | "soporte";

/**
 * Los `params` de una raíz. Se **derivan del catálogo**, no de una lista: el
 * prefijo es un campo, así que un artículo que cambie de sitio cambia su ruta
 * sola. Y se filtran por raíz porque cada fichero de `app/` sólo puede emitir
 * las suyas.
 */
export async function paramsKb(raiz: RaizKb) {
  return (await articulosKb())
    .filter((a) => a.prefijo.split("/")[0] === raiz)
    .map((a) => ({ ruta: [...a.prefijo.split("/").slice(1), a.slug] }));
}

export async function metadataKb(raiz: RaizKb, params: Promise<Params>): Promise<Metadata> {
  const { ruta } = await params;
  const a = await getArticuloKb([raiz, ...ruta]);
  if (!a) return {};
  return {
    title: a.seo.title,
    ...(a.seo.description ? { description: a.seo.description } : {}),
    // Igual que en el resto del clon: el `canonical` se DERIVA de la ruta y
    // apunta al original, declarando cuál es la página buena para los buscadores.
    alternates: { canonical: `https://kunakair.com/es/${a.prefijo}/${a.slug}/` },
    ...(a.seo.ogImage ? { openGraph: { images: [a.seo.ogImage] } } : {}),
  };
}

export async function PaginaKb({
  raiz,
  params,
  conBorradores = false,
}: {
  raiz: RaizKb;
  params: Promise<Params>;
  /** Prop que Next nunca pasa; existe para que la vista previa REUSE la página. */
  conBorradores?: boolean;
}) {
  const { ruta } = await params;
  const a = await getArticuloKb([raiz, ...ruta], { conBorradores });
  if (!a) notFound();

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        <BandaCabecera {...BANDA_KB} />

        <SeccionCuerpoTb>
          <FilaTb>
            <div className="min-[981px]:flex">
              {/* `col_1_4` — 258.5 con canal DERECHO de 68.1094: aquí la barra
                  va la primera. Vacía a propósito, ver ⚠ de arriba. */}
              <ColumnaEstrecha lado="izquierda" />
              {/* `col_3_4` — 911.75. Aquí entra el `post_content`, que es la
                  capa PROPIA del builder: la sección, sus filas y sus módulos. */}
              <ColumnaAncha>
                <CuerpoKb filas={a.cuerpo} />
              </ColumnaAncha>
            </div>
          </FilaTb>
        </SeccionCuerpoTb>
      </main>

      <Footer tipo="grupoA" />
      <ScrollToTop />
    </>
  );
}
