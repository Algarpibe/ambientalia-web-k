import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FaqSidebar } from "@/components/faq/FaqSidebar";
import { FAQS_PUBLICADAS, getFaq } from "@/lib/faqs";

/**
 * `/faqs/[slug]` — ARQUETIPO **FAQ**, el más barato del proyecto en campos.
 *
 * Recon `docs/research/grupo-C/` · decisión **D4** en su `DECISIONES.md` ·
 * modelo en `MODELO.md` §2 · Payload en `docs/ESQUEMA-CMS.md` §2b.
 *
 * ── Por qué arquetipo propio y no «un caso con menos campos» (D1) ──────────
 * Tres criterios disparados cuando bastaba uno: firma de secciones
 * (`tb_header · tb_footer ×3`, **cero secciones propias**), elemento
 * estructural exclusivo (ni migas ni la 4ª sección del pie) y naturaleza del
 * cuerpo (**un** `entry-content` corto frente a campos estructurados con tres
 * bloques ricos). Varianza cero dentro de cada forma en las 76.
 *
 * La asimetría con el caso **es** la prueba de que la frontera está bien
 * puesta: lo que los separa es exactamente lo que esta página no tiene.
 *
 * ── El cascarón, medido (varianza cero en 4 instancias × 2 anchos) ─────────
 * `.container` 1152/312 con `pt 58` · `h1` 44px/44 w300 ls −0.5 con `pb 10` ·
 * `#left-area` 848.16 a 1440 · el cuerpo con `pt 30` y 18px/30.6 · **pie de 3
 * secciones** (sin el slider CTA del caso).
 *
 * ⚠ Y una pieza que el modelo no mencionaba: **la barra lateral**
 * (`et_right_sidebar`, 4 widgets). **No añade ningún campo** —P-C3-7 aguanta—
 * pero corrige «el arquetipo más barato posible»: es barato en campos, no en
 * cascarón (`MEDICION.md` §5.3).
 *
 * ── SEO: lo que falta no se inventa ────────────────────────────────────────
 * `description` y `ogImage` están **ausentes en las 19** (corrección §0 de
 * `DECISIONES.md`, que desdice al recon). Aquí solo va `title`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return FAQS_PUBLICADAS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const faq = getFaq(slug);
  if (!faq) return {};
  return {
    title: faq.seo.title,
    // El `canonical` se DERIVA del slug y apunta al original, como en el resto
    // del clon. `description` y `ogImage` no existen en las 19: no se fabrican.
    alternates: { canonical: `https://kunakair.com/es/faqs/${faq.slug}/` },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const faq = getFaq(slug);
  if (!faq) notFound();

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        <div className="container mx-auto w-[80%] max-w-[1152px] pt-[58px]">
          <div id="content-area" className="md:flex md:justify-between">
            <div id="left-area" className="md:w-[73.5%]">
              <article className="faqs">
                <h1 className="entry-title pb-[10px] text-[44px] font-light leading-[44px] tracking-[-0.5px] text-[#333]">
                  {faq.titulo}
                </h1>
                {/* Cuerpo RICO: un solo campo HTML con el contrato del §3.1. El
                    perfil medido de las 19 —`p ul li a span br sub`— entra
                    entero, sin tocar ni los cauces abiertos: 0 iframes, 0
                    vídeos, 0 tablas y 0 scripts en las 19. */}
                <div
                  className="
                    entry-content pt-[30px] text-[18px] leading-[30.6px] text-[#333]
                    [&_a]:text-[#0075C9] [&_a:hover]:underline
                    [&_p]:mb-[1em] [&_ul]:mb-[1em] [&_ul]:list-disc [&_ul]:pl-[1.25em]
                  "
                  dangerouslySetInnerHTML={{ __html: faq.cuerpo }}
                />
              </article>
            </div>

            <FaqSidebar />
          </div>
        </div>
      </main>

      {/* Pie de 3 secciones: la FAQ NO lleva el slider CTA del caso. Es uno de
          los tres criterios que separaron los dos arquetipos (D1). */}
      <Footer template="tb" />
      <ScrollToTop />
    </>
  );
}
