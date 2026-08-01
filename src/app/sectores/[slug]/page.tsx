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
import { MonoCuerpo } from "@/components/monografico/MonoCuerpo";

import { SECTORES_PUBLICADOS, getSector } from "@/lib/sectores";
import { MONOGRAFICOS_PUBLICADOS, getMonografico } from "@/lib/monografico";

/**
 * /sectores/[slug] — **DOS arquetipos en la misma ruta**:
 *
 * | arquetipo | recon | cuerpo |
 * |---|---|---|
 * | SECTOR / SOLUCIÓN VERTICAL | `docs/research/sectores/` | `SectorBlock[]` → `SectorBody` |
 * | MONOGRÁFICO TÉCNICO | `docs/research/monografico-tecnico/` | `MonoSeccion[]` → `MonoCuerpo` |
 *
 * **No es una ruta con dos plantillas: es una plantilla con dos cuerpos.** En
 * el original los seis sectores clásicos y los dos monográficos cuelgan de
 * `/es/sectores/` y comparten cabecera, banda de clientes, breadcrumb, hero,
 * CTA de ancho completo, bloque K y franja del pie — medido original contra
 * original en la misma corrida (`components/cabecera-hero-cola.spec.md`). Lo
 * único que cambia de forma es lo que va entre el hero y el slider.
 *
 * Por eso el despacho es por slug y no por subruta: replicar la topología de
 * URLs del original es parte de la fidelidad, y partirla en dos carpetas
 * `app/` habría duplicado el 80% de esta página para no ganar nada.
 *
 * `generateStaticParams()` emite una ruta por instancia publicada de cada uno,
 * así que dar de alta cualquiera de los dos sigue siendo **añadir datos**:
 * un `SectorPage` a `SECTORES_PUBLICADOS` o un `MonograficoPage` a
 * `MONOGRAFICOS_PUBLICADOS`, sin tocar código.
 *
 * Reutiliza sin tocar: HeaderNav · ScrollToTop · ProductosTabs (con `items`) ·
 * UltimosProyectos · UltimosArticulos · SectionTitle · CabeceraSector ·
 * CtaBannerSlider · CtaDescarga · BlueButton/OutlineButton/LightButton.
 * Con campos nuevos: `SectorHero` (`modulos` + `pb`) · `MapaProyectos`
 * (`soloCaja`).
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
  return [...SECTORES_PUBLICADOS, ...MONOGRAFICOS_PUBLICADOS].map((p) => ({
    slug: p.slug,
  }));
}

/** Resuelve el slug contra los dos catálogos. Los slugs no se solapan. */
function getPagina(slug: string) {
  const monografico = getMonografico(slug);
  if (monografico) return { monografico, sector: undefined, comun: monografico };
  const sector = getSector(slug);
  if (sector) return { monografico: undefined, sector, comun: sector };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pagina = getPagina(slug);
  if (!pagina) return {};
  const { seo } = pagina.comun;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pagina = getPagina(slug);
  if (!pagina) notFound();
  const { monografico, sector: sectorClasico } = pagina;
  const sector = pagina.comun;

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

        {/* --- S3 · hero 1/2 + 1/2 ---
            El monográfico aporta los dos campos que difieren entre arquetipos:
            `pb` de desktop (39 vs 60) y la LISTA de módulos de la columna
            derecha (3 vs 2, con un color por titular). */}
        <SectorHero
          hero={sector.hero}
          modulos={monografico?.hero.modulos}
          pb={monografico?.hero.pb}
        />

        {/* --- Cuerpo: el flexible content de cada arquetipo --- */}
        {monografico ? (
          <MonoCuerpo cuerpo={monografico.cuerpo} />
        ) : (
          <SectorBody body={sectorClasico!.body} />
        )}

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

      <Footer tipo="sector" stripImage={sector.footerStripImage} />
      <ScrollToTop />
    </>
  );
}
