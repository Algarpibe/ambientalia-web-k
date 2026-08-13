import type { Metadata } from "next";

import { PaginaBlog, metadataBlog } from "@/components/listados/PaginaBlog";

/**
 * `/blog` — la página 1 de `L1-blog`.
 *
 * El árbol vive en `components/listados/PaginaBlog.tsx`, compartido con
 * `/blog/page/[n]`: dos copias del árbol de un arquetipo es la peor forma de
 * duplicación que hay — enseñan algo *parecido* y divergen el día que alguien
 * toca una sola de las dos.
 */
export function generateMetadata(): Promise<Metadata> {
  return metadataBlog(1);
}

export default function Pagina() {
  return PaginaBlog({ n: 1 });
}
