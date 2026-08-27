import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginaSector, metadataSector, paramsSectorPaginas } from "@/components/listados/PaginaSector";

/**
 * `/sector/<slug>/page/N` — las **7** páginas `≥ 2` del archivo de taxonomía.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA TOPOLOGÍA RARA DEL ORIGINAL, REPLICADA TAL CUAL
 *
 * En **3 de los 5** términos que redirigen, la BASE da 301 y sus `/page/N`
 * responden **200**: `industria` (2, 3), `investigacion-consultoria` (2) y
 * `urbano` (2, 3, 4). O sea que hay páginas 2 y 3 de un archivo cuya página 1
 * no existe.
 *
 * Eso está **medido, no supuesto** — `estados-114` lo comprueba en vivo con
 * `redirect: "manual"` y lo dice con sus dos lados: *«las /page/N capturadas,
 * con su base en 301: 200 · 200 ⇒ se sirven IGUAL»*. Y por eso las capturas de
 * esos términos son reales y no artefactos.
 *
 * «Arreglarlo» —emitir también la base, o no emitir las páginas— sería
 * inventar enrutado. §*el veredicto lo da la salida servida*.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsSectorPaginas();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  return metadataSector(slug, Number(n));
}

export default async function Pagina({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  /* La ausencia se RECHAZA, no se sustituye (§regla 6): un `n` que no sea un
     entero no cae en `NaN` y de ahí a un render vacío. */
  if (!/^\d+$/.test(n)) notFound();
  return PaginaSector({ slug, n: Number(n) });
}
