import type { Metadata } from "next";

import { PaginaEtiqueta, metadataEtiqueta, paramsEtiquetas } from "@/components/listados/PaginaEtiqueta";

/**
 * `/etiqueta/<slug>` — la página 1 de `L1-etiqueta`.
 *
 * Los params se **derivan del catálogo** de `etiquetas` (12 términos), no de
 * una lista: un término nuevo entra solo.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsEtiquetas();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return metadataEtiqueta(slug, 1);
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return PaginaEtiqueta({ slug, n: 1 });
}
