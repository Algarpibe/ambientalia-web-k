import type { Faq } from "@/types/kunak";
import { todos } from "./local";

/**
 * FAQ leída de la colección `faqs` — **la primera familia migrada de F2-3, el
 * canario.**
 *
 * ── Por qué ésta y no otra ────────────────────────────────────────────────
 * Es la más barata del modelo (cuatro campos, ningún bloque, ninguna relación,
 * ningún medio) y **una familia completa**: tiene su `generateStaticParams()`,
 * su `generateMetadata()` y su cuerpo. Si la forma sale limpia aquí, las demás
 * la copian; si algo de la fontanería no funciona —el bundling de `payload`
 * dentro de `next build`, el `.env`, el pool— se descubre con 2 rutas en juego
 * y no con 31.
 *
 * ── La proyección, y por qué es explícita ─────────────────────────────────
 * El documento de Payload trae `id`, `createdAt` y `updatedAt`, que **el
 * esquema no escribió**: los inyecta `buildConfig`. El resto de campos casan
 * uno a uno con `Faq` porque así se modeló (§2b), y no se copian con un spread
 * a propósito:
 *
 *   > un `{...doc}` haría que un campo NUEVO del CMS entrase en el render sin
 *   > que nadie lo decida, y un campo RENOMBRADO desapareciera sin ruido. La
 *   > lista explícita convierte las dos cosas en un error de compilación.
 *
 * ── Lo que garantiza que esta proyección es fiel ──────────────────────────
 * No es este fichero: es la medida. `qa:cms-roundtrip` prueba que DB↔dato
 * medido son inversos (63/63), y el Δ0 de F2-3 —`qa:clon-base` a dos anchos y
 * `qa:html-cmp` byte a byte— prueba que lo que sale renderizado es el mismo
 * fichero que salía leyendo de `src/lib/faqs.ts`. Un campo mal proyectado
 * mueve uno de los dos.
 */
interface DocFaq {
  slug: string;
  seo: { title: string };
  titulo: string;
  cuerpo: string;
}

export async function faqsPublicadas(): Promise<Faq[]> {
  const docs = await todos<DocFaq>("faqs");
  return docs.map((d) => ({
    slug: d.slug,
    seo: { title: d.seo.title },
    titulo: d.titulo,
    cuerpo: d.cuerpo,
  }));
}

export async function getFaq(slug: string): Promise<Faq | undefined> {
  return (await faqsPublicadas()).find((f) => f.slug === slug);
}
