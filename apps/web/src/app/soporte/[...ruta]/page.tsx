import type { Metadata } from "next";

import { PaginaKb, metadataKb, paramsKb } from "@/components/kb/PaginaKb";

/**
 * `/soporte/[...ruta]` — la segunda raíz de KB, con **1** artículo
 * (`soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/<slug>`).
 *
 * Uno de seis. Es exactamente la forma de la instancia que un modelo escrito con
 * la mayoría se come — el mismo 1 de 23 que obligó al catch-all en grupo A — y
 * por eso el prefijo es campo y esta ruta existe.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsKb("soporte");
}

export function generateMetadata({ params }: { params: Promise<{ ruta: string[] }> }): Promise<Metadata> {
  return metadataKb("soporte", params);
}

export default function Pagina({ params }: { params: Promise<{ ruta: string[] }> }) {
  return PaginaKb({ raiz: "soporte", params });
}
