import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CtaBanner } from "@/components/CtaBanner";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { UltimosProyectos } from "@/components/UltimosProyectos";
import { FaqAcordeon } from "@/components/monitor/FaqAcordeon";
import { AnchorNav } from "@/components/AnchorNav";
import { BlueButton } from "@/components/SectionRow";
import { HeroSoftware } from "@/components/software/HeroSoftware";
import { InfoProductoSoftware } from "@/components/software/InfoProductoSoftware";
import { ListaBeneficios } from "@/components/software/ListaBeneficios";
import { RejillaHerramientas } from "@/components/software/RejillaHerramientas";
import {
  ANCLAS,
  ANCLAS_CTAS,
  BREADCRUMB,
  CASES_HREF,
  CASOS,
  S2,
  SOFTWARE_ARTICLES,
} from "@/lib/software";

export const metadata: Metadata = {
  title: "Software para el análisis de la calidad del aire | Kunak AIR Cloud",
  description:
    "Kunak AIR Cloud: software de medición de la calidad del aire para visualizar, validar y analizar los datos de tu red de sensores, con 16 herramientas y informes personalizados.",
};

/**
 * /software-de-medicion-calidad-del-aire — Kunak AIR Cloud (CPT solutions, id 27164).
 * Topología: docs/research/software/PAGE_TOPOLOGY.md
 * Comportamientos: docs/research/software/BEHAVIORS.md
 * Specs de bloque: docs/research/software/components/*.spec.md
 *
 * Arquetipo SOFTWARE/PLATAFORMA: híbrido que hereda la carpintería de
 * /monitor-calidad-aire (columna de anclas sticky 1/4 + contenido 3/4, CTA de
 * ancho completo, artículos, FAQ) y cambia el contenido de producto físico por
 * capturas de producto software.
 *
 * Lo genuinamente nuevo son 2 piezas: el CARRUSEL de 9 capturas con autoplay
 * (la única pieza time-driven del clon entero) y la REJILLA de 16 herramientas.
 * No hay tabs, buscador, filtros, visor 360, tablas de specs ni popup de
 * formulario: la única navegación interna es el scrollspy de 3 anclas.
 *
 * Reutiliza: HeaderNav · Footer template="tb" · ScrollToTop · FaqAcordeon
 * (19/19 preguntas idénticas al monitor y a /accesorios) · CtaBanner ·
 * UltimosArticulos variante "monitor" · UltimosProyectos embebido ·
 * AnchorNav · VideoLightbox · BlueButton.
 *
 * Nace con A3 (`overflow-wrap: break-word` global) ya aplicado, así que los
 * titulares largos parten como en el original desde el primer render.
 */
export default function SoftwareMedicionCalidadDelAirePage() {
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* Cabecera TB: franja foto tras el header transparente. El original
            sirve `cabecera-puerto.jpg` (medido 2026-07-27); la imagen VARÍA
            entre visitas — no re-investigar (nota de PENDIENTES-QA, P2). */}
        <BandaCabecera {...BANDA.producto} foto="/images/uploads/2023/10/cabecera-puerto.jpg" />

        {/* --- S0 · Breadcrumb (3 niveles, el último sin enlace) --- */}
        {/* Unificada sobre el componente base en A-QA1b (2026-08-01): esta
            página tenía una copia a mano sin `font-semibold`, sin
            `tracking-[0.3px]` y **sin el tope de 350** del tema. */}
        <Breadcrumb items={BREADCRUMB} />

        {/* --- S1 · hero + información del producto (watermark K a 0% 50%) --- */}
        <section
          className="relative bg-white bg-no-repeat pt-[50px] lg:pt-[4vw]"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 50%",
          }}
        >
          <HeroSoftware />
          <InfoProductoSoftware />
        </section>

        {/* --- S2 · CTA de ancho completo (slider Divi de 1 diapositiva) ---
            Medido: fondo `urban-1500.jpg` con `rgba(0,0,0,.33)` en multiply,
            copy a la IZQUIERDA (pr 31%), título 45px/58.5 enlazado a /contacto/
            y botón claro. Padding vertical 5% también SIN párrafo (55.65 a
            cw 1264.7) — de ahí el `padYClassName` explícito. */}
        <CtaBanner
          image={S2.image}
          heading={S2.heading}
          headingHref={S2.headingHref}
          align="left"
          padYClassName="md:py-[5%]"
          buttonLabel={S2.buttonLabel}
          buttonHref={S2.buttonHref}
        />

        {/* --- S3 · anclas sticky (1/4) + beneficios / herramientas / casos (3/4) --- */}
        {/* Geometría medida: sección pb 5%, fila 80% máx 1380 con pt 4% y pb 2%,
            columnas 20.875% / 73.625% y gutter 5.5%. */}
        <section className="bg-white pb-[50px] lg:pb-[5%]">
          <div data-fila="" className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[30px] pt-[50px] md:pt-[4vw] lg:pb-[2vw] md:flex-row md:gap-[5.5%]">
            {/* Columna 1/4 — `self-start` es imprescindible: si el flex item se
                estira a la altura de la fila, el sticky nunca llega a pegarse. */}
            <aside className="columna-lista-anclas w-full pt-[32px] md:w-[20.875%] md:shrink-0 md:self-start md:sticky md:top-[70px]">
              <div className="relative">
                {/* MARCADOR DE SONDA (130.ª) — ATRIBUTO sobre el `<img>` que ya
                    existe: es el `.et_pb_image_4` con el que arranca la fila 3
                    del original. */}
                <img
                  data-modulo="image"
                  src="/images/uploads/2022/12/punteado.svg"
                  alt=""
                  aria-hidden
                  width={60}
                  height={22}
                  className="absolute -top-[32px] -left-[65px]"
                />
              </div>
              {/* offset 80: aterriza el bloque a 80px del viewport para que la
                  cabecera fija no tape el h2 (misma decisión que /accesorios). */}
              <AnchorNav items={ANCLAS} scrollOffset={80}>
                {/* Apilados en ambos anchos; en móvil el original los separa
                    44.4px (medido a 390: 4927 → 5015.4, botón de 44). */}
                <div className="flex flex-col items-start gap-[44.4px] md:w-full md:gap-[14px]">
                  {/* MARCADOR DE SONDA (130.ª) — ⚠ LOS DOS ÚNICOS ENVOLTORIOS
                      de esta tanda, y por eso se nombran: el original mide cada
                      botón por su `et_pb_button_module_wrapper` y aquí los dos
                      `<a>` cuelgan directos del flex, sin wrapper propio. Un
                      atributo sobre el `<a>` marcaría el `.et_pb_button`, que
                      es un nivel POR DEBAJO del módulo. El `<div>` no lleva
                      clase: con `items-start` toma el ancho de su contenido y
                      el `gap` sigue actuando entre hermanos — pero que sea
                      NO-OP es una PREDICCIÓN y la cierra la medida, no este
                      comentario. */}
                  {ANCLAS_CTAS.map((c) => (
                    <div key={c.label} data-modulo="button">
                      <BlueButton href={c.href}>{c.label}</BlueButton>
                    </div>
                  ))}
                </div>
              </AnchorNav>
            </aside>

            {/* Columna 3/4 — `min-w-0` evita que el min-content de las capturas
                impida encoger el flex item por debajo del contenedor. */}
            <div className="w-full min-w-0 md:flex-1">
              {/* #beneficios — 9 blurbs a ancho completo */}
              <div id="beneficios" className="scroll-mt-[80px] pt-[32px]">
                {/* MARCADOR DE SONDA (130.ª) — `.et_pb_text_15` del original. */}
                <h2
                  data-modulo="text"
                  className="mb-[27.81px] pb-[10px] text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333]"
                >
                  Beneficios
                </h2>
                <ListaBeneficios />
              </div>

              {/* #herramientas — 16 tarjetas de 47% con captura 1800×1200 */}
              <div id="herramientas" className="scroll-mt-[80px] pt-[32px]">
                {/* MARCADOR DE SONDA (130.ª) — `.et_pb_text_16` del original. */}
                <h2
                  data-modulo="text"
                  className="mb-[27.81px] pb-[10px] text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333]"
                >
                  Herramientas
                </h2>
                <RejillaHerramientas />
              </div>

              {/* #case-studies — las mismas 3 tarjetas que la home, embebidas.
                  Ojo: en el original el id `case-studies` está DUPLICADO (en el
                  h2 y en el contenedor del listado); aquí se emite una vez. */}
              <div id="case-studies" className="scroll-mt-[80px] pt-[32px]">
                <UltimosProyectos
                  embedded
                  title="Casos de éxito"
                  ctaLabel="Ver todos los casos"
                  ctaHref={CASES_HREF}
                  posts={CASOS}
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- S4 · Artículos y Guías (el original sortea los 3 posts) --- */}
        <UltimosArticulos title="Artículos y Guías" posts={SOFTWARE_ARTICLES} variant="monitor" />

        {/* --- S5 · Preguntas frecuentes (19 toggles, idénticas al monitor) --- */}
        <FaqAcordeon desfaseColumna={10} />
      </main>

      <Footer tipo="software" />
      <ScrollToTop />
    </>
  );
}
