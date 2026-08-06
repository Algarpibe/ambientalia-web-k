import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CasoPagina } from "@/components/caso/CasoPagina";
// F2-3: el catálogo se lee del CMS por Local API; `src/lib/casos.ts` se conserva
// como seed histórico y sigue aportando lo que es PLANTILLA —`prefijoDe`,
// `metadataDeCaso`—, que DERIVAN de los campos en vez de guardarse.
import { metadataDeCaso, prefijoDe } from "@/lib/casos";
import { casosPublicados, getCasoCms } from "@/lib/cms/casos";

/**
 * `/case-studies/[slug]` — el **otro** prefijo de la MISMA colección `casos`:
 * 4 de los 57.
 *
 * ── Que este fichero sea un calco del otro ES la decisión D2 ───────────────
 * Los 4 de `/case-studies/` son **contenido propio en español sobre la misma
 * plantilla en los cinco ejes** (mismas clases de `<body>`, mismo reparto,
 * misma firma, mismos bloques; 0 duplicados, 0 `hreflang`, `canonical`
 * propio). La única diferencia entre los 57 es **una palabra en la URL**, así
 * que `prefijo` es un campo con defecto y no una colección aparte.
 *
 * Y C-3 lo confirmó desde otro sitio: **las migas de estos 4 apuntan al índice
 * ESPAÑOL** `/es/casos-de-exito/` (C-SP8). Ni el propio WordPress los trata
 * como una colección distinta.
 *
 * Por eso las dos rutas montan `CasoPagina` sin una sola diferencia: en cuanto
 * divergieran, el prefijo habría dejado de ser un campo.
 *
 * ⚠ **`/es/case-studies/` a pelo (sin slug) NO se emite**: nadie ha medido qué
 * sirve el original ahí — es **C-SP11**, y hasta saberlo el clon no inventa una
 * página.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await casosPublicados())
    .filter((c) => prefijoDe(c) === "case-studies")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caso = await getCasoCms("case-studies", slug);
  return caso ? metadataDeCaso(caso) : {};
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caso = await getCasoCms("case-studies", slug);
  if (!caso) notFound();
  return <CasoPagina caso={caso} />;
}
