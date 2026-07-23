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

export default function Home() {
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

        {/* 7 composite: Presencia mundial → Testimonios → Haz visible + Beneficios → Nuestros productos */}
        <PresenciaMundial />
        <Testimonios />
        <HazVisible />
        <ProductosTabs />

        {/* 8 CTA newsletter · 9 Últimos artículos · 10 Últimos proyectos */}
        <CtaNewsletter />
        <UltimosArticulos />
        <UltimosProyectos />

        {/* 11 CTA "¿Te preocupa…?" · 12 Sostenibilidad */}
        <CtaPreocupa />
        <Sostenibilidad />
      </main>
      <Footer />
    </>
  );
}
