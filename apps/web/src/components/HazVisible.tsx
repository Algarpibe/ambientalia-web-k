import { SectionRow, SectionTitle, BlueButton } from "./SectionRow";
import { Beneficios } from "./Beneficios";

/**
 * `et_pb_section_7` (row 9) — "Haz visible la contaminación".
 * Left column: title + "Descargar catálogo". Right column: two blue 37px
 * subtitle headings, two body paragraphs with inline links, a blue 37px
 * highlight line (NOT a boxed callout), then the Beneficios grid.
 * Spec: docs/research/components/haz-visible.spec.md
 */
// Móvil: el original mantiene 37px/44.4 en estos h2 (medido 2026-07-23);
// el tamaño va por clase (37px base, clamp solo ≥768) y el peso/color aquí.
const BLUE_HEADING = {
  fontWeight: 300,
  lineHeight: 1.2,
  letterSpacing: "-0.5px",
  color: "#0075C9",
} as const;
const BLUE_HEADING_CLS = "text-[37px] md:text-[clamp(26px,2.8vw,37px)]";

export function HazVisible() {
  return (
    <section className="relative pb-[20px] pt-[20px] md:pb-[151px] md:pt-[28px]">
      <SectionRow
        title={<SectionTitle>Haz visible la contaminación</SectionTitle>}
        belowTitle={
          /* Móvil: pb20 del módulo del título + mb30 del botón Divi */
          <div className="mb-[30px] mt-[20px] md:my-0">
            <BlueButton href="/descarga-catalogo">Descargar catálogo</BlueButton>
          </div>
        }
      >
        {/* Blue subtitle headings */}
        <div className="space-y-0 md:space-y-1">
          <h2 className={`pb-[10px] md:pb-0 ${BLUE_HEADING_CLS}`} style={BLUE_HEADING}>
            Simplifica tu operativa diaria.
          </h2>
          <h2 className={`pb-[10px] md:pb-0 ${BLUE_HEADING_CLS}`} style={BLUE_HEADING}>
            Toma mejores decisiones.
          </h2>
        </div>

        {/* Body paragraphs with inline links — móvil: rítmica Divi (p pb18) */}
        <div className="mt-[40px] text-[18px] leading-[1.7] text-[#333] md:mt-8 md:space-y-6">
          <p className="pb-[18px] md:pb-0">
            Súmate al cambio y empieza a medir de forma fiable la contaminación con los sensores de calidad del aire
            más precisos del mercado y toma mejores decisiones gracias al{" "}
            <a
              // ruta local: esta página ya está clonada
              href="/software-de-medicion-calidad-del-aire"
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
        {/* Móvil: la fila Divi original mide 335px (no 337) y "medir en tu
            proyecto" cae justo en el límite → 7 líneas; max-w-335 calca el wrap */}
        <h2
          className={`mb-10 mt-[20px] max-w-[335px] pb-[10px] md:mt-4 md:max-w-none md:pb-0 ${BLUE_HEADING_CLS}`}
          style={BLUE_HEADING}
        >
          Elige los contaminantes a medir en tu proyecto de calidad del aire y cámbialos cuando lo necesites.
        </h2>

        <Beneficios />
      </SectionRow>
    </section>
  );
}
