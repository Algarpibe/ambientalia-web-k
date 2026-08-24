import type { Metadata } from "next";

import { PaginaF33, metadataF33 } from "@/components/cola-larga/PaginaF33";
import { bajoPrefijo, paginasColaLarga, rutaDePagina } from "@/lib/cms/paginas";

/**
 * `/empresa/[...ruta]` — la ruta que E1 **estrena**: hoy sirve **1** página,
 * `/empresa/premios-y-reconocimientos` (régimen `B-`).
 *
 * ── Por qué un catch-all para UNA página ──────────────────────────────────
 * Por lo mismo que `/recursos/[...ruta]` y las dos raíces de KB: **el prefijo
 * es un CAMPO**, no una constante de plantilla. Escribir
 * `app/empresa/premios-y-reconocimientos/page.tsx` cablearía el valor de la
 * única instancia que hay hoy — que es exactamente el *arreglo falso* de
 * `CLAUDE.md` §Estructura: *cablear el valor de la primera instancia, que sigue
 * funcionando hasta que llega la tercera*. Con el catch-all, una segunda página
 * bajo `/empresa/` **se emite sola** al sembrarla, sin tocar código.
 *
 * ⚠ **`/empresa` (sin más) NO sale por aquí**: es una página de un solo
 * segmento y la sirve `/[slug]`, junto con las otras 18 del plano de raíz. Las
 * dos conviven porque una ruta estática/de un nivel y un catch-all del nivel
 * siguiente no compiten.
 *
 * `dynamicParams = false` va aquí como en el resto: sin él,
 * `/empresa/lo-que-sea` respondería **200** con una página cualquiera en vez de
 * 404 (medido en el andamio del ENRUTADO de grupo A, resultado 3).
 */
export const dynamicParams = false;

const RAIZ = "empresa";

export async function generateStaticParams() {
  /* DERIVADO del catálogo, no escrito: si mañana hay dos páginas bajo
   * `/empresa/`, entran solas (§regla 9, 7.º caso — una lista de literales
   * envejece contra el repo y no da error al hacerlo). */
  return bajoPrefijo(await paginasColaLarga(), RAIZ).map((p) => ({
    ruta: rutaDePagina(p).slice(1).split("/").slice(1),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ruta: string[] }>;
}): Promise<Metadata> {
  const { ruta } = await params;
  return metadataF33([RAIZ, ...ruta]);
}

export default async function Pagina({ params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  return <PaginaF33 segmentos={[RAIZ, ...ruta]} />;
}
