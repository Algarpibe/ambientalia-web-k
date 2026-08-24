import type { Metadata } from "next";

import { PaginaKb, metadataKb, paramsKb } from "@/components/kb/PaginaKb";
import { PaginaF33, metadataF33 } from "@/components/cola-larga/PaginaF33";
import { bajoPrefijo, getPaginaColaLarga, paginasColaLarga, rutaDePagina } from "@/lib/cms/paginas";

/**
 * `/soporte/[...ruta]` — DOS catálogos bajo la misma raíz desde F3-3.
 *
 * · **`articulos-kb`** — **1** artículo
 *   (`soporte/centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda/<slug>`).
 *   Uno de seis: exactamente la forma de la instancia que un modelo escrito con
 *   la mayoría se come, y por eso el prefijo es campo y esta ruta existe;
 * · **`paginas` (cola larga, E1)** — **4**: `centro-de-ayuda`,
 *   `centro-de-ayuda/kunak-air-cloud/articulos-de-ayuda`,
 *   `centro-de-ayuda/kunak-air-cloud/video-tutoriales` y
 *   `servicio-de-reparacion`.
 *
 * ⚠ **`servicio-de-reparacion` es una de las DOS separadoras que refutaron la
 * ruta como discriminador del régimen**: está prefijada y es **`B-`**, mientras
 * `/sistema-interno-de-informacion` es de raíz y **`BT`**. Por eso el cascarón
 * lo elige el campo `regimen` y no el plano en el que caiga la página.
 *
 * ⚠⚠ Toca la ruta ya verificada del artículo de KB — ANTES/DESPUÉS de
 * `clon-base` a los dos anchos, porque emitir de MENOS no da error.
 */
export const dynamicParams = false;

const RAIZ = "soporte";

export async function generateStaticParams() {
  const [kb, cola] = await Promise.all([paramsKb(RAIZ), paginasColaLarga()]);
  return [
    ...kb,
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
