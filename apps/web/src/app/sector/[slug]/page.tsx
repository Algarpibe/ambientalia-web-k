import type { Metadata } from "next";

import { PaginaSector, metadataSector, paramsSectorBase } from "@/components/listados/PaginaSector";

/**
 * `/sector/<slug>` — la página 1 del ARCHIVO DE TAXONOMÍA.
 *
 * Decisión: `ESQUEMA-CMS.md` §7i (c2) · derivación `estado-118.{mjs,log}`.
 *
 * ⚠ **Sólo emite los términos cuya página 1 responde 200: son 6 de 11.** Los
 * otros 5 dan **301** en el original y se replican **como redirección** en
 * `next.config.ts`, no como página — replicar un 301 como página sería servir
 * un 200 donde el original sirve un salto.
 *
 * ⚠ **Y los params NO se derivan del catálogo de términos**, al revés que
 * `paramsEtiquetas()`. No es un descuido: el nº de páginas del archivo **no se
 * deriva del dato del clon** —`ceil(casos/5)` acierta 8 de 9 y falla en
 * `industria`— así que la lista es MEDIDA. Un término nuevo **no entra solo**,
 * y eso está declarado en `lib/sector-archivo.ts`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsSectorBase();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return metadataSector(slug, 1);
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return PaginaSector({ slug, n: 1 });
}
