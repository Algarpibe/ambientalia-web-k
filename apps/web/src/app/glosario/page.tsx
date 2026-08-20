import type { Metadata } from "next";

import { PaginaGlosario, metadataGlosario } from "@/components/listados/PaginaGlosario";

/**
 * `/glosario` — la página 1 de `L2-glosario`.
 *
 * El árbol vive en `components/listados/PaginaGlosario.tsx`, compartido con
 * `/glosario/page/[n]`: dos copias del árbol de un arquetipo es la peor forma
 * de duplicación que hay.
 *
 * ⚠ **El slug `glosario` comparte espacio de nombres con `/[slug]`**, que sirve
 * 202 slugs de cinco familias. Una colisión **no da error**: el build compila,
 * emite la ruta por las dos vías y sirve la página equivocada con 200. Quien lo
 * caza es `npm run qa:slugs`, que entra en `npm run check`.
 */
export function generateMetadata(): Promise<Metadata> {
  return metadataGlosario(1);
}

export default function Pagina() {
  return PaginaGlosario({ n: 1 });
}
