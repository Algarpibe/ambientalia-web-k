import type { Metadata } from "next";

import { PaginaKb, metadataKb, paramsKb } from "@/components/kb/PaginaKb";
import { PaginaF33, metadataF33 } from "@/components/cola-larga/PaginaF33";
import { bajoPrefijo, getPaginaColaLarga, paginasColaLarga, rutaDePagina } from "@/lib/cms/paginas";

/**
 * `/centro-de-ayuda/[...ruta]` — DOS catálogos bajo la misma raíz desde F3-3.
 *
 * · **`articulos-kb`** — 5 de los 6 artículos
 *   (`centro-de-ayuda/kunak-air/articulos-de-ayuda/<slug>`);
 * · **`paginas` (cola larga, E1)** — **4**: los hubs `kunak-air`,
 *   `kunak-air-cloud`, `kunak-air/articulos-de-ayuda` y
 *   `kunak-air/video-tutoriales`.
 *
 * ⚠⚠ **ESTO TOCA RUTAS YA VERIFICADAS**, que es la razón por la que el encargo
 * pide ANTES/DESPUÉS de `clon-base` a los dos anchos: los 5 artículos de KB
 * salen por este mismo fichero, y una `generateStaticParams` que se equivoque
 * **no da error — emite de menos**. Un catálogo que devuelva `[]` deja de
 * emitir sus rutas y el build sigue en verde.
 *
 * ⚠ Y son **hermanos, no anidados**: `centro-de-ayuda/kunak-air/articulos-de-ayuda`
 * es una PÁGINA de la cola larga **y** el prefijo de 5 artículos de KB. Las dos
 * cosas conviven porque el despacho compara **la ruta completa**, no el prefijo
 * — comparar por slug emparejaría documentos distintos (§regla 29).
 */
export const dynamicParams = false;

const RAIZ = "centro-de-ayuda";

export async function generateStaticParams() {
  const [kb, cola] = await Promise.all([paramsKb(RAIZ), paginasColaLarga()]);
  return [
    ...kb,
    /* Los segmentos POR DEBAJO de la raíz: el fichero de ruta ya aporta la
     * suya. Se derivan de la ruta del documento, no de una lista. */
    ...bajoPrefijo(cola, RAIZ).map((p) => ({ ruta: rutaDePagina(p).slice(1).split("/").slice(1) })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ruta: string[] }>;
}): Promise<Metadata> {
  const { ruta } = await params;
  if (await getPaginaColaLarga([RAIZ, ...ruta])) return metadataF33([RAIZ, ...ruta]);
  return metadataKb(RAIZ, params);
}

export default async function Pagina({ params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  if (await getPaginaColaLarga([RAIZ, ...ruta]))
    return <PaginaF33 segmentos={[RAIZ, ...ruta]} />;
  return PaginaKb({ raiz: RAIZ, params });
}
