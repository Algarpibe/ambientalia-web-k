import type { Metadata } from "next";

import { PaginaBlog, metadataBlog, paginasDeBlog } from "@/components/listados/PaginaBlog";

/**
 * `/blog/page/N` — las páginas 2..N de `L1-blog`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS RUTAS SE DERIVAN EN BUILD, Y LAS VACÍAS SE SIRVEN
 *
 * `D2.3` — la paginación **navega por enlace real, no por AJAX**
 * (`defaultPrevented: false` en las 5 formas con control), así que derivar las
 * `/page/N/` en build es viable sin un punto de entrada de datos.
 *
 * ⚠ **`D2.5` · REPLICAR TAL CUAL, firmada por el propietario.** El original
 * sirve **55 páginas que responden 200, se declaran canónicas de sí mismas y no
 * listan ni una entrada** (`/es/blog/page/9/`…`17/`), frente a 54 con contenido.
 * El clon hace lo mismo: es la única de las tres salidas que **no cambia el
 * sitio**. `noindex` y 404 son decisiones de producto y se llevan aparte
 * (§F3-2-SEO-PAGINAS-VACIAS).
 *
 * ⚠ **Y aquí sólo se emiten las páginas CON contenido.** Las 55 vacías del
 * original salen de una frontera que el servidor de WordPress decide (el último
 * `N` con 200), y ese número **no se deriva del contenido del clon**: son
 * `/blog/page/9..17` cuando el contenido acaba en la 8. Emitirlas exigiría
 * cablear la frontera medida, que es un dato del original de una fecha — se
 * ficha en vez de inventarlo (§F3-LH-VACIAS-NO-EMITIDAS).
 *
 * `dynamicParams = false`: sin eso, `/blog/page/lo-que-sea` respondería 200 con
 * una página cualquiera en vez de 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const total = await paginasDeBlog();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  return metadataBlog(Number(n));
}

export default async function Pagina({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return PaginaBlog({ n: Number(n) });
}
