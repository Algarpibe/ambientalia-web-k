import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CtaBanner } from "@/components/CtaBanner";
import { SectoresCarousel } from "@/components/SectoresCarousel";
import { UltimosProyectos } from "@/components/UltimosProyectos";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { ProductosTabs } from "@/components/ProductosTabs";
import { HeroProducto } from "@/components/monitor/HeroProducto";
import { InformacionProducto } from "@/components/monitor/InformacionProducto";
import { SubNavAnclas } from "@/components/monitor/SubNavAnclas";
import { Beneficios } from "@/components/monitor/Beneficios";
import { Especificaciones } from "@/components/monitor/Especificaciones";
import { GaleriaEnsayos } from "@/components/monitor/GaleriaEnsayos";
import { Software } from "@/components/monitor/Software";
import { CONTACT_HREF } from "@/lib/monitor";

export const metadata: Metadata = {
  title: "Monitor de calidad del aire profesional | Kunak AIR Pro",
  description:
    "Kunak AIR Pro: monitor de calidad del aire basado en sensores con máxima precisión. Datos continuos, fiables y trazables de partículas y hasta 16 contaminantes.",
};

/**
 * /monitor-calidad-aire — Kunak AIR Pro (CPT solutions, id 768).
 * Topología: docs/research/monitor-calidad-aire/PAGE_TOPOLOGY.md
 *
 * GRUPO A: cabecera + Hero (visor 360 nativo) + Información del producto +
 * CTA banner + sub-nav de anclas sticky/scrollspy + reutilizables wireados.
 * GRUPO B: Beneficios, Software, Especificaciones, Galería de ensayos.
 * Pendiente GRUPO C: sondas meteorológicas y FAQ — siguen como placeholders
 * con su ancla funcional (para que el scrollspy resuelva los 8 ids).
 */
export default function MonitorCalidadAirePage() {
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* Cabecera TB: franja foto puerto + gradiente detrás del header transparente.
            (En el original es una sección de la plantilla de header; aquí la
            renderizamos como banda superior sobre la que flota el HeaderNav.) */}
        <div
          aria-hidden
          className="h-[220px] w-full bg-cover bg-center md:h-[300px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(71,71,71,0.17), rgba(71,71,71,0)), url('/images/uploads/2023/10/cabecera-puerto.jpg')",
          }}
        />

        {/* S0 breadcrumb + S1 fila 1 (hero con visor 360°) */}
        <HeroProducto />

        {/* S1 fila 2 — Información del producto */}
        <InformacionProducto />

        {/* S2 — CTA banner "No se puede mejorar…" (variante texto a la izquierda).
            Grupo B: falta el asset exacto (foto ciclistas) + la variante align:left
            + la cita "(Snyder et al., 2013)". De momento se wirea con la copy
            principal y una foto urbana existente como placeholder. */}
        <CtaBanner
          image="/images/uploads/2023/02/people-city-urban.jpg"
          heading="No se puede mejorar lo que no se puede medir."
          buttonLabel="Empezar a medir con precisión"
          buttonHref={CONTACT_HREF}
        />

        {/* S3 — bloque compuesto: sub-nav de anclas sticky (1/4) + 8 bloques (3/4) */}
        <section className="bg-white py-[40px]">
          <div className="mx-auto flex w-[85%] max-w-[1080px] flex-col gap-[30px] md:flex-row md:gap-[3%]">
            <SubNavAnclas />

            <div className="w-full space-y-[10px] md:flex-1">
              {/* #benefits — Beneficios (grid 3×3 icon-blurbs) */}
              <div id="benefits" className="scroll-mt-[110px] py-8">
                <Beneficios />
              </div>

              {/* #applications — SectoresCarousel (mismo shortcode que la home).
                  Grupo B: variante embebida en columna 3/4 + bullets píldora. */}
              <div id="applications" className="scroll-mt-[110px]">
                <SectoresCarousel />
              </div>

              {/* #software — texto Kunak AIR Cloud + botón (sin capturas) */}
              <div id="software" className="scroll-mt-[110px] py-8">
                <Software />
              </div>

              {/* #specifications — tabla de especificaciones (15 filas + sellos) */}
              <div id="specifications" className="scroll-mt-[110px] py-8">
                <Especificaciones />
              </div>

              {/* #trials-test — galería-slider de ensayos (9 gráficas) */}
              <div id="trials-test" className="scroll-mt-[110px] py-8">
                <GaleriaEnsayos />
              </div>

              {/* #case-studies — UltimosProyectos (mismas 3 tarjetas que la home).
                  Grupo B: título "Casos de éxito" + CTA "Ver todos los casos". */}
              <div id="case-studies" className="scroll-mt-[110px]">
                <UltimosProyectos />
              </div>

              {/* #power-packs — ProductosTabs (patrón lista-contenido).
                  Grupo B: datos "Paquetes de energía" (panel solar, cargadores). */}
              <div id="power-packs" className="scroll-mt-[110px]">
                <ProductosTabs />
              </div>

              {/* #meteo-sensors — 2ª instancia ProductosTabs (6 sondas) — GRUPO C */}
              <div id="meteo-sensors" className="scroll-mt-[110px] py-8">
                <PlaceholderBlock label="Sondas meteorológicas — tabs (Grupo C)" />
              </div>
            </div>
          </div>
        </section>

        {/* S4 — Artículos y Guías (UltimosArticulos).
            Grupo B: título "Artículos y Guías" + 3 posts distintos. */}
        <UltimosArticulos />

        {/* S5 — Preguntas frecuentes (19 toggles acordeón) — GRUPO C */}
        <section className="bg-white py-10">
          <div className="mx-auto w-[85%] max-w-[1080px]">
            <PlaceholderBlock label="Preguntas frecuentes — 19 toggles (Grupo C)" />
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}

/** Stub visible de una sección pendiente; conserva el ancla para el scrollspy. */
function PlaceholderBlock({ label }: { label: string }) {
  return (
    <p className="rounded-[8px] border border-dashed border-[#ccc] px-4 py-6 text-center text-[14px] text-[#BBB]">
      [ {label} ]
    </p>
  );
}
