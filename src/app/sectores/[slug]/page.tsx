import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TrustBar } from "@/components/TrustBar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CtaBannerSlider } from "@/components/CtaBannerSlider";
import { ProductosTabs } from "@/components/ProductosTabs";
import { UltimosProyectos } from "@/components/UltimosProyectos";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { SectionTitle } from "@/components/SectionRow";

import { CabeceraSector } from "@/components/sectores/CabeceraSector";
import { SectorHero } from "@/components/sectores/SectorHero";
import { SectorBody } from "@/components/sectores/SectorBody";

import { SECTORES_PUBLICADOS, getSector } from "@/lib/sectores";

/**
 * /sectores/[slug] — arquetipo **SECTOR / SOLUCIÓN VERTICAL**.
 * Topología: docs/research/sectores/PAGE_TOPOLOGY.md
 * Comportamientos: docs/research/sectores/BEHAVIORS.md
 * Specs de bloque: docs/research/sectores/components/*.spec.md
 *
 * **Primera ruta anidada y primera ruta dinámica del proyecto.** Una sola
 * plantilla para los 8 sectores del sitio: `generateStaticParams()` emite una
 * ruta estática por cada `SectorPage` de `SECTORES_PUBLICADOS`, así que dar de
 * alta un sector es añadir sus datos a `src/lib/sectores.ts` — sin tocar código.
 *
 * La cabecera, la banda de clientes, el breadcrumb, el hero, el CTA de ancho
 * completo y el bloque K son FIJOS (la plantilla). Lo único variable en forma
 * —no solo en texto— es el cuerpo, que va como `SectorBlock[]` y lo pinta
 * `SectorBody`: Urbano monta 3 bloques, Industria 5 y en otro orden.
 *
 * Reutiliza sin tocar: HeaderNav · ScrollToTop · ProductosTabs (con `items`) ·
 * UltimosProyectos · UltimosArticulos (variante "monitor") · SectionTitle ·
 * BlueButton/OutlineButton/LightButton.
 * Variantes nuevas: TrustBar `variant="sectores"` · Footer `stripImage`.
 */

/**
 * Fila Divi del bloque K: retícula del sector (86% máx 1380) con `padding`
 * vertical de 30px en móvil y 2% (28.7969 a 1440) en desktop. El original
 * monta cinco de éstas dentro de la misma sección.
 */
function FilaK({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">{children}</div>
  );
}

/** Titular de fila con su punteado colgando 65px a la izquierda. */
function TituloK({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <img
        src="/images/uploads/2022/12/punteado.svg"
        alt=""
        aria-hidden
        width={60}
        height={22}
        className="pointer-events-none absolute -left-[65px] -top-[40px]"
        style={{ width: 60, height: 22 }}
      />
      <SectionTitle>{children}</SectionTitle>
    </div>
  );
}

export function generateStaticParams() {
  return SECTORES_PUBLICADOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) return {};
  return {
    title: sector.seo.title,
    description: sector.seo.description,
    alternates: { canonical: sector.seo.canonical },
    openGraph: {
      title: sector.seo.title,
      description: sector.seo.description,
      images: [sector.seo.ogImage],
    },
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) notFound();

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* --- Cabecera de sector: foto + kicker + H1 (397.61 / 347.25) --- */}
        <CabeceraSector header={sector.header} />

        {/* --- S1 · banda de clientes SIN titular, fila 95%, alto 122 --- */}
        <TrustBar variant="sectores" />

        {/* --- S2 · breadcrumb de 3 niveles --- */}
        <Breadcrumb
          items={sector.breadcrumb}
          rowClassName="mx-auto w-[86%] max-w-[1380px]"
        />

        {/* --- S3 · hero 1/2 + 1/2 --- */}
        <SectorHero hero={sector.hero} />

        {/* --- Cuerpo: flexible content (los 5 tipos de SectorBlock) --- */}
        <SectorBody body={sector.body} />

        {/* --- CTA de ancho completo: 3 diapositivas, autoplay 7 s --- */}
        <CtaBannerSlider slides={sector.ctaSlides} label={`Kunak para ${sector.header.kicker}`} />

        {/* --- Bloque K: soluciones + proyectos + artículos sobre el watermark ---
            En el original es UNA sección con `recurso-k-fondo.svg` a 0% 50% y
            cinco filas dentro; aquí el fondo va en el wrapper, como ya se hizo
            en la home (M2). */}
        <div
          className="relative bg-white bg-no-repeat pt-[50px] md:pt-[57.5938px]"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 50%",
          }}
        >
          {/* fila 0 — titular + lista de soluciones (una sola fila Divi:
              h2 65 · mb del módulo 34.05 · lista 532 · py 2%) */}
          <FilaK>
            <TituloK>Nuestras soluciones</TituloK>
            <div className="mt-[30px] md:mt-[34.0469px]">
              <ProductosTabs items={sector.soluciones} sinTitulo />
            </div>
          </FilaK>

          {/* fila 1 — solo el titular de proyectos (122.59 de alto) */}
          <FilaK>
            <TituloK>{sector.proyectos.title}</TituloK>
          </FilaK>

          {/* fila 2 — las 3 tarjetas + CTA a la derecha */}
          <FilaK>
            <UltimosProyectos
              bare
              ctaLabel={sector.proyectos.cta.label}
              ctaHref={sector.proyectos.cta.href}
              ctaExternal={sector.proyectos.cta.external}
              posts={sector.proyectos.posts}
            />
          </FilaK>

          {/* filas 3 y 4 — titular de artículos + rejilla, que `UltimosArticulos`
              ya monta enteras en su variante `sectores` */}
          <UltimosArticulos
            title={sector.articulos.title}
            posts={sector.articulos.posts}
            variant="sectores"
          />
        </div>
      </main>

      <Footer template="tb" stripImage={sector.footerStripImage} />
      <ScrollToTop />
    </>
  );
}
