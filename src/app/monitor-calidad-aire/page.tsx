import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CtaBanner } from "@/components/CtaBanner";
import { UltimosProyectos } from "@/components/UltimosProyectos";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { Aplicaciones } from "@/components/monitor/Aplicaciones";
import { PaquetesEnergia } from "@/components/monitor/PaquetesEnergia";
import { HeroProducto } from "@/components/monitor/HeroProducto";
import { InformacionProducto } from "@/components/monitor/InformacionProducto";
import { SubNavAnclas } from "@/components/monitor/SubNavAnclas";
import { Beneficios } from "@/components/monitor/Beneficios";
import { Especificaciones } from "@/components/monitor/Especificaciones";
import { GaleriaEnsayos } from "@/components/monitor/GaleriaEnsayos";
import { Software } from "@/components/monitor/Software";
import { SondasMeteorologicas } from "@/components/monitor/SondasMeteorologicas";
import { FaqAcordeon } from "@/components/monitor/FaqAcordeon";
import { CONTACT_HREF, MONITOR_ARTICLES, S2_BODY, S2_HEADING, S2_IMAGE } from "@/lib/monitor";

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
 * GRUPO C: Sondas meteorológicas y Preguntas frecuentes — con esto los 8
 * anclas del scrollspy quedan resueltas y no queda ningún placeholder.
 */
export default function MonitorCalidadAirePage() {
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* Cabecera TB: franja foto puerto + gradiente detrás del header transparente.
            (En el original es una sección de la plantilla de header; aquí la
            renderizamos como banda superior sobre la que flota el HeaderNav.) */}
        {/* QA 2026-07-26: el original sirve cabecera-construccion.jpg (vista aérea
            de ciudad) y la banda mide 137px (móvil/hamburguesa) / 177px (menú
            desktop ≥1024) hasta el breadcrumb — medido por CDP a 390 y 1280. */}
        <div
          aria-hidden
          className="h-[137px] w-full bg-cover bg-center lg:h-[177px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(71,71,71,0.17), rgba(71,71,71,0)), url('/images/uploads/2023/10/cabecera-construccion.jpg')",
          }}
        />

        {/* S0 breadcrumb + S1 fila 1 (hero con visor 360°) */}
        <HeroProducto />

        {/* S1 fila 2 — Información del producto */}
        <InformacionProducto />

        {/* S2 — CTA banner "No se puede mejorar…": texto a la IZQUIERDA y cita de
            Snyder cerrando el párrafo. QA 2026-07-26: el slider SÍ lleva
            `et_pb_bg_layout_dark` (computed por CDP: botón BLANCO con bg
            rgba(0,0,0,0.15), como los banners de la home) — la spec §1 que decía
            outline #333 estaba equivocada. */}
        <CtaBanner
          image={S2_IMAGE}
          heading={S2_HEADING}
          headingHref={CONTACT_HREF}
          body={S2_BODY}
          align="left"
          buttonLabel="Empezar a medir con precisión"
          buttonHref={CONTACT_HREF}
        />

        {/* S3 — bloque compuesto: sub-nav de anclas sticky (1/4) + 8 bloques (3/4) */}
        {/* Geometría Divi medida: sección pb 4vw (50 móvil), fila 80% máx 1380
            con pt 4vw / pb 2vw (30 móvil) y gutter 5.5% entre columnas 1/4-3/4. */}
        <section className="bg-white pb-[50px] lg:pb-[4vw]">
          <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[30px] pt-[4vw] md:flex-row md:gap-[5.5%] lg:pb-[2vw]">
            <SubNavAnclas />

            {/* `min-w-0` es imprescindible: sin él, el `min-width:auto` por
                defecto del flex item impide encoger por debajo del min-content
                de la tabla de especificaciones y la columna se va a 1080px
                (desbordando el contenedor y dando scroll horizontal a la página). */}
            {/* Los bloques cierran con el mb ~28px del último módulo Divi
                (pb-[28px] del wrapper); sin py extra entre bloques. */}
            <div className="w-full min-w-0 md:flex-1">
              {/* #benefits — Beneficios (grid 3×3 icon-blurbs) */}
              <div id="benefits" className="scroll-mt-[110px] pb-[28px]">
                <Beneficios />
              </div>

              {/* #applications — carrusel de sectores embebido + frase azul +
                  banner-guía con popup de descarga */}
              <div id="applications" className="scroll-mt-[110px] pb-[28px]">
                <Aplicaciones />
              </div>

              {/* #software — texto Kunak AIR Cloud + botón (sin capturas) */}
              <div id="software" className="scroll-mt-[110px] pb-[28px]">
                <Software />
              </div>

              {/* #specifications — tabla de especificaciones (15 filas + sellos) */}
              <div id="specifications" className="scroll-mt-[110px] pb-[28px]">
                <Especificaciones />
              </div>

              {/* #trials-test — galería-slider de ensayos (9 gráficas) */}
              <div id="trials-test" className="scroll-mt-[110px] pb-[28px]">
                <GaleriaEnsayos />
              </div>

              {/* #case-studies — las mismas 3 tarjetas que la home, embebidas */}
              <div id="case-studies" className="scroll-mt-[110px] pb-[28px]">
                <UltimosProyectos embedded title="Casos de éxito" ctaLabel="Ver todos los casos" />
              </div>

              {/* #power-packs — shortcode `lista-contenido` con los 3 accesorios */}
              <div id="power-packs" className="scroll-mt-[110px] pb-[28px]">
                <PaquetesEnergia />
              </div>

              {/* #meteo-sensors — shortcode `lista-contenido` con las 6 sondas */}
              <div id="meteo-sensors" className="scroll-mt-[110px] pb-[28px]">
                <SondasMeteorologicas />
              </div>
            </div>
          </div>
        </section>

        {/* S4 — Artículos y Guías. El original sortea los 3 posts en cada carga;
            aquí va congelado el set del recon. */}
        <UltimosArticulos title="Artículos y Guías" posts={MONITOR_ARTICLES} variant="monitor" />

        {/* S5 — Preguntas frecuentes (19 toggles acordeón) */}
        <FaqAcordeon tituloCompacto punteadoEnFlujo />
      </main>

      <Footer template="tb" />
      <ScrollToTop />
    </>
  );
}
