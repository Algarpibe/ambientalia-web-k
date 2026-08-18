import type { Metadata } from "next";

import {
  PaginaCategoriaCientifica,
  metadataCategoria,
  paramsDeCategorias,
} from "@/components/listados/PaginaCategoriaCientifica";

/**
 * `/scientific-category/[slug]` — la página 1 de `L3`, el archivo de taxonomía.
 *
 * ⚠ **La ruta NO es `/recursos/documentos-cientificos/<término>`**, que es lo
 * que sugiere la miga: el archivo vive en **`/es/scientific-category/<término>/`**,
 * y las 6 páginas del espejo lo confirman. Componer la ruta desde la miga habría
 * emitido tres rutas que el original no sirve y ninguna de las que sí.
 *
 * `dynamicParams = false`: sin eso, `/scientific-category/lo-que-sea`
 * respondería 200 con una página cualquiera en vez de 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await paramsDeCategorias()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return metadataCategoria({ slug, n: 1 });
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return PaginaCategoriaCientifica({ slug, n: 1 });
}
