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
    <section
      className="relative bg-white"
      style={{ paddingTop: 85, paddingBottom: 74 }}
    >
      <SectionRow
        title={<SectionTitle>Sectores</SectionTitle>}
        belowTitle={<BlueButton href="#catalogo">Descargar catálogo</BlueButton>}
      >
        <div className="space-y-6 text-[18px] leading-[1.7] text-[#333]">
          <p>
            Controla la contaminación ambiental en tiempo real con la solución más fiable para el análisis preciso
            de gases y partículas y toma mejores decisiones.
          </p>
          <p>
            Elige los contaminantes que desees medir en cada proyecto. Kunak AIR es una solución versátil que,
            gracias a la tecnología de{" "}
            <a
              href="https://kunakair.com/es/sensor-de-calidad-del-aire/"
              className="text-[#0075C9] hover:underline"
            >
              cartuchos inteligentes
            </a>
            , se adapta a las necesidades de cada proyecto de calidad del aire.
          </p>
        </div>

        <p
          className="mt-10"
          style={{
            color: "#0075C9",
            fontSize: "clamp(28px, 3vw, 44px)",
            fontWeight: 300,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          Una solución.
          <br />
          Múltiples aplicaciones.
        </p>

        <p className="mt-6 text-[18px] leading-[1.7] text-[#333]">
          Desliza las imágenes y encuentra la solución perfecta para tu sector.
        </p>
      </SectionRow>
    </section>
  );
}
