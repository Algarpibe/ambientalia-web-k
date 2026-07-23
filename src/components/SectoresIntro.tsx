import { SectionRow, SectionTitle, BlueButton } from "./SectionRow";

/**
 * `et_pb_section_3` — Sectores intro.
 * Same 1/3 + 2/3 pattern. Title + button on the left; body + blue tagline on
 * the right, followed by the "Desliza las imágenes..." hint that leads into
 * the Swiper carousel below.
 *
 * Spec: docs/research/components/sectores-carousel.spec.md (Part A)
 */
export function SectoresIntro() {
  return (
    // Móvil: pt 80 (50 sección + 30 fila) y pb 89 (30 fila + 59 sección)
    <section className="relative bg-white pb-[89px] pt-[80px] md:pb-[74px] md:pt-[85px]">
      <SectionRow
        title={
          /* Móvil: el módulo del título lleva pb32 + mb20 antes del botón */
          <div className="pb-[52px] md:pb-0">
            <SectionTitle>Sectores</SectionTitle>
          </div>
        }
        belowTitle={
          <div className="mb-[30px] md:mb-0">
            <BlueButton href="#catalogo">Descargar catálogo</BlueButton>
          </div>
        }
      >
        {/* Móvil: mt10 del módulo y rítmica Divi (p pb18) */}
        <div className="mt-[10px] text-[18px] leading-[1.7] text-[#333] md:mt-0 md:space-y-6">
          <p className="pb-[18px] md:pb-0">
            Controla la contaminación ambiental en tiempo real con la solución más fiable para el análisis preciso
            de gases y partículas y toma mejores decisiones.
          </p>
          <p>
            Elige los contaminantes que desees medir en cada proyecto. Kunak AIR es una solución versátil que,
            gracias a la tecnología de{" "}
            {/* Como en HazVisible: el enlace hereda #333 (verificado por CDP) */}
            <a
              href="https://kunakair.com/es/sensor-de-calidad-del-aire/"
              className="text-[#333] hover:text-[#0075C9] hover:underline"
            >
              cartuchos inteligentes
            </a>
            , se adapta a las necesidades de cada proyecto de calidad del aire.
          </p>
        </div>

        {/* Móvil: dos h2 Divi de 37px con line-height 1 y pb10 cada uno
            (como los h2 azules de S2); desktop mantiene el clamp/1.2 */}
        <p
          className="mt-[30px] md:mt-10"
          style={{
            color: "#0075C9",
            fontWeight: 300,
            letterSpacing: "-0.5px",
          }}
        >
          <span className="block pb-[10px] text-[37px] leading-none md:pb-0 md:text-[clamp(28px,3vw,44px)] md:leading-[1.2]">
            Una solución.
          </span>
          <span className="block pb-[10px] text-[37px] leading-none md:pb-0 md:text-[clamp(28px,3vw,44px)] md:leading-[1.2]">
            Múltiples aplicaciones.
          </span>
        </p>

        <p className="mt-[30px] text-[18px] leading-[1.7] text-[#333] md:mt-6">
          Desliza las imágenes y encuentra la solución perfecta para tu sector.
        </p>
      </SectionRow>
    </section>
  );
}
