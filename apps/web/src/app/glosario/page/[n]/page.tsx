import type { Metadata } from "next";

import { PaginaGlosario, metadataGlosario, paginasDeGlosario } from "@/components/listados/PaginaGlosario";

/**
 * `/glosario/page/N` — las páginas 2..8 de `L2-glosario`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS OCHO SE EMITEN, Y EL CARDINAL SALE DEL CANAL SIN RECORTAR
 *
 * `span.pages` dice **«Page 1 of 8»** en `corpus/fase-3/listados/glosario/`, y
 * las 8 capturas suman **37 tarjetas** con 5 por página. O sea que el cardinal
 * **medido** y el **derivado** (`⌈37/5⌉ = 8`) coinciden.
 *
 * ⚠ **Emitir sólo la página 1 habría dejado siete 404 con el paginador de la
 * primera apuntando a ellas** — el propio `wp-pagenavi` de la captura sirve
 * `…/page/2/` … `…/page/8/`. No es una opción de alcance: es servir enlaces
 * rotos desde la página que sí se emite.
 *
 * ⚠ **`L2` no tiene páginas VACÍAS, y es la única de las cinco formas de la que
 * se puede decir eso**: `lh-ancla` da 0 vacíos en `L2-glosario` y `L2-faqs`, así
 * que `D2.5` y `P-LH-C7` —replicar las 200 sin contenido— **no le aplican**. La
 * frontera del original y la del clon coinciden por construcción, no por
 * casualidad.
 *
 * `dynamicParams = false`: sin eso, `/glosario/page/lo-que-sea` respondería 200
 * con una página cualquiera en vez de 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const total = await paginasDeGlosario();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  return metadataGlosario(Number(n));
}

export default async function Pagina({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return PaginaGlosario({ n: Number(n) });
}
