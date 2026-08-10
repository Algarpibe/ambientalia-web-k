import type { Metadata } from "next";

import { PaginaKb, metadataKb, paramsKb } from "@/components/kb/PaginaKb";

/**
 * `/centro-de-ayuda/[...ruta]` — la raíz de 5 de los 6 artículos de KB
 * (`centro-de-ayuda/kunak-air/articulos-de-ayuda/<slug>`).
 *
 * El árbol de la página vive en `components/kb/PaginaKb.tsx`, compartido con
 * `/soporte/[...ruta]`: la razón está en su cabecera.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return paramsKb("centro-de-ayuda");
}

export function generateMetadata({ params }: { params: Promise<{ ruta: string[] }> }): Promise<Metadata> {
  return metadataKb("centro-de-ayuda", params);
}

export default function Pagina({ params }: { params: Promise<{ ruta: string[] }> }) {
  return PaginaKb({ raiz: "centro-de-ayuda", params });
}
