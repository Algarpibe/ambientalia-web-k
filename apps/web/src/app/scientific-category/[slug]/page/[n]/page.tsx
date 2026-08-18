import type { Metadata } from "next";

import {
  PaginaCategoriaCientifica,
  metadataCategoria,
  paramsDeCategorias,
} from "@/components/listados/PaginaCategoriaCientifica";

/**
 * `/scientific-category/[slug]/page/[n]` — las páginas 2..N de `L3`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ESTAS RUTAS SON INALCANZABLES POR NAVEGACIÓN, Y AUN ASÍ SE EMITEN
 *
 * `L3` **no sirve ningún control de paginación en el cuerpo** —medido en las 6
 * páginas y a los dos anchos—: la única mención a `/page/2/` en el documento es
 * el `<link rel=next>` de Yoast. O sea que el original tiene rutas a las que no
 * se puede llegar pinchando.
 *
 * `D2.6` decide **REPLICAR TAL CUAL**: el original las sirve con 200 y con
 * canonical propio, así que no emitirlas sería la desviación. Lo que cambia
 * entre ellas y la 1.ª es **sólo el `<title>` y el `canonical`** — el cuerpo
 * pinta el término entero.
 *
 * ⚠ **Y cuántas emitir sale del tamaño de página, que está ACOTADO a 5 ó 6 sin
 * instancia que los separe** (`POR_PAGINA_SCI` en `lib/cms/documentos.ts`, con
 * la entrada separadora escrita). Con los 3 términos de hoy las dos opciones
 * emiten **las mismas 6 rutas**, así que la elección es NO-OP sobre todo lo
 * medido — y se declara en vez de callarse.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { slug: string; n: string }[] = [];
  for (const { slug, total } of await paramsDeCategorias())
    for (let n = 2; n <= total; n++) params.push({ slug, n: String(n) });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { slug, n } = await params;
  return metadataCategoria({ slug, n: Number(n) });
}

export default async function Pagina({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return PaginaCategoriaCientifica({ slug, n: Number(n) });
}
