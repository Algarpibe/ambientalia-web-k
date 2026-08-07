import { HeaderNav } from "@/components/HeaderNav";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { SolucionProfesional } from "@/components/SolucionProfesional";
import { SectoresIntro } from "@/components/SectoresIntro";
import { SectoresCarousel } from "@/components/SectoresCarousel";
import { CtaInmerso } from "@/components/CtaInmerso";
import { PresenciaMundial } from "@/components/PresenciaMundial";
import { Testimonios } from "@/components/Testimonios";
import { HazVisible } from "@/components/HazVisible";
import { ProductosTabs } from "@/components/ProductosTabs";
import { CtaNewsletter } from "@/components/CtaNewsletter";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { UltimosProyectos } from "@/components/UltimosProyectos";
import { CtaPreocupa } from "@/components/CtaPreocupa";
import { Sostenibilidad } from "@/components/Sostenibilidad";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
// F2-3: los productos se leen del CMS por Local API. `src/lib/products.ts` pasa
// a seed histórico y sólo aporta `PRODUCTOS_HOME_IDS`, que es ESTRUCTURA — qué
// productos lista este shortcode y en qué orden.
import { getProductosCms } from "@/lib/cms/productos";
import { PRODUCTOS_HOME_IDS } from "@/lib/products";

export default async function Home() {
  /* El dato se espera AQUÍ y baja por prop: un `await` dentro de un componente
     hijo cambia el HTML servido sin mover un dato (§F2-3-ASYNC-HIJO). */
  const productos = await getProductosCms(PRODUCTOS_HOME_IDS);

  return (
    <>
      <HeaderNav />
      <main className="flex flex-1 flex-col">
        {/* 0 Hero · 1 TrustBar · 2 Solución · 3 Sectores intro · 4 Carrusel */}
        <HeroSection />
        <TrustBar />
        <SolucionProfesional />
        <SectoresIntro />
        <SectoresCarousel />

        {/* 5 decorative spacer */}
        <div aria-hidden style={{ height: 56 }} />

        {/* 6 CTA "¿Estás inmerso…?" */}
        <CtaInmerso />

        {/* 7 composite: Presencia mundial → Testimonios → Haz visible + Beneficios → Nuestros productos.
            En el original es UNA sección Divi con el fondo K (710×1302) continuo
            desde su borde superior; el wrapper evita que se recorte entre bloques. */}
        <div
          className="bg-white bg-no-repeat"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 0%",
          }}
        >
          <PresenciaMundial />
          <Testimonios />
          <HazVisible />
          <ProductosTabs items={productos} />
        </div>

        {/* 8 CTA newsletter · 9 Últimos artículos · 10 Últimos proyectos */}
        <CtaNewsletter />
        <UltimosArticulos />
        <UltimosProyectos />

        {/* 11 CTA "¿Te preocupa…?" · 12 Sostenibilidad */}
        <CtaPreocupa />
        <Sostenibilidad />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
