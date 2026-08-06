import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CasoPagina } from "@/components/caso/CasoPagina";
// F2-3: el catálogo se lee del CMS por Local API; `src/lib/casos.ts` se conserva
// como seed histórico y sigue aportando lo que es PLANTILLA —`prefijoDe`,
// `metadataDeCaso`—, que DERIVAN de los campos en vez de guardarse.
import { metadataDeCaso, prefijoDe } from "@/lib/casos";
import { casosPublicados, getCasoCms } from "@/lib/cms/casos";

/**
 * `/casos-de-exito/[slug]` — el prefijo **por defecto** de la colección
 * `casos` (53 de los 57).
 *
 * Recon `docs/research/grupo-C/`, decisión **D2 · CMS-1** en su
 * `DECISIONES.md`, Payload en `docs/ESQUEMA-CMS.md` §2b.
 *
 * ── Dos rutas, UNA colección ───────────────────────────────────────────────
 * Esta y `/case-studies/[slug]` sirven **el mismo componente sobre la misma
 * colección**, filtrando por el campo `prefijo`. Que la página sea la misma es
 * la prueba de que el prefijo es un campo de enrutado y no una distinción de
 * contenido: si divergieran, D2 estaría mal.
 *
 * ── Las rutas CRUZADAS no se emiten, y es una decisión ─────────────────────
 * `generateStaticParams` filtra por prefijo, así que un caso inglés **no**
 * responde bajo `/casos-de-exito/`. El original sí lo hace (301 en 7 de 9
 * probadas, 404 en 2), pero eso es **comportamiento de servicio, no dato del
 * contenido** (C-SP2, cerrada como no-bloqueante en D2). Emitirlas sería
 * inventar enrutado.
 *
 * ── Dar de alta un caso es AÑADIR DATOS ────────────────────────────────────
 * Un `CasoDeExito` más en `CASOS_PUBLICADOS` y la ruta sale sola, sin tocar
 * este fichero — la misma prueba de CMS-readiness que ya pasaron SECTOR y
 * MONOGRÁFICO (§5 del esquema).
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await casosPublicados())
    .filter((c) => prefijoDe(c) === "casos-de-exito")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caso = await getCasoCms("casos-de-exito", slug);
  return caso ? metadataDeCaso(caso) : {};
}

export default async function CasoDeExitoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caso = await getCasoCms("casos-de-exito", slug);
  if (!caso) notFound();
  return <CasoPagina caso={caso} />;
}
