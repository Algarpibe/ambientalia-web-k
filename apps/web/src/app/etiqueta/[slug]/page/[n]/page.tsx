import type { Metadata } from "next";

import { PaginaEtiqueta, metadataEtiqueta } from "@/components/listados/PaginaEtiqueta";
import { POR_PAGINA, entradasDeEtiqueta, etiquetasA } from "@/lib/cms/listados";

/**
 * `/etiqueta/<slug>/page/N` — las páginas 2..N de `L1-etiqueta`.
 *
 * Igual que `/blog/page/[n]`: las rutas se derivan en build (`D2.3`) y **sólo
 * las que tienen contenido** — las vacías del original salen de una frontera
 * del servidor de WordPress que no se deriva del contenido del clon
 * (§F3-LH-VACIAS-NO-EMITIDAS).
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const salida: { slug: string; n: string }[] = [];
  for (const t of await etiquetasA()) {
    const total = Math.max(1, Math.ceil((await entradasDeEtiqueta(t.slug)).length / POR_PAGINA));
    for (let n = 2; n <= total; n++) salida.push({ slug: t.slug, n: String(n) });
  }
  return salida;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { slug, n } = await params;
  return metadataEtiqueta(slug, Number(n));
}

export default async function Pagina({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return PaginaEtiqueta({ slug, n: Number(n) });
}
