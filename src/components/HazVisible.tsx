import { SectionRow, SectionTitle, BlueButton } from "./SectionRow";
import { Beneficios } from "./Beneficios";

/**
 * `et_pb_section_7` (row 9) — "Haz visible la contaminación".
 * Left column: title + "Descargar catálogo". Right column: two blue 37px
 * subtitle headings, two body paragraphs with inline links, a blue 37px
 * highlight line (NOT a boxed callout), then the Beneficios grid.
 * Spec: docs/research/components/haz-visible.spec.md
 */
const BLUE_HEADING = {
  fontSize: "clamp(26px, 2.8vw, 37px)",
  fontWeight: 300,
  lineHeight: 1.2,
  letterSpacing: "-0.5px",
  color: "#0075C9",
} as const;

export function HazVisible() {
  return (
    <section className="relative bg-white" style={{ paddingTop: 28, paddingBottom: 151 }}>
      <SectionRow
        title={<SectionTitle>Haz visible la contaminación</SectionTitle>}
        belowTitle={
          <BlueButton href="https://kunakair.com/es/descarga-catalogo/">Descargar catálogo</BlueButton>
        }
      >
        {/* Blue subtitle headings */}
        <div className="space-y-1">
          <h2 style={BLUE_HEADING}>Simplifica tu operativa diaria.</h2>
          <h2 style={BLUE_HEADING}>Toma mejores decisiones.</h2>
        </div>

        {/* Body paragraphs with inline links */}
        <div className="mt-8 space-y-6 text-[18px] leading-[1.7] text-[#333]">
          <p>
            Súmate al cambio y empieza a medir de forma fiable la contaminación con los sensores de calidad del aire
            más precisos del mercado y toma mejores decisiones gracias al{" "}
            <a
              href="https://kunakair.com/es/software-de-medicion-calidad-del-aire/"
              className="text-[#333] hover:text-[#0075C9] hover:underline"
            >
              software de calidad del aire
            </a>{" "}
            más avanzado.
          </p>
          <p>
            Nuestra solución Kunak AIR es la solución más versátil del mercado para medir gases y partículas gracias a
            su sistema patentado de{" "}
            <a
              href="https://kunakair.com/es/sensor-de-calidad-del-aire/"
              className="text-[#333] hover:text-[#0075C9] hover:underline"
            >
              cartuchos inteligentes
            </a>{" "}
            intercambiables.
          </p>
        </div>

        {/* Blue highlight line (plain heading, no box) */}
        <h2 className="mt-4 mb-10" style={BLUE_HEADING}>
          Elige los contaminantes a medir en tu proyecto de calidad del aire y cámbialos cuando lo necesites.
        </h2>

        <Beneficios />
      </SectionRow>
    </section>
  );
}
