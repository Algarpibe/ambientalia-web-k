import { SectionRow, SectionTitle, BlueButton } from "./SectionRow";

/**
 * `et_pb_section_7` (row 6) — "Presencia mundial" + world map.
 * The map is a single static SVG (`world.svg`) with countries painted blue.
 * Spec: docs/research/components/presencia-mundial.spec.md
 */
export function PresenciaMundial() {
  return (
    <section
      className="relative bg-white bg-no-repeat"
      style={{
        paddingTop: 85,
        paddingBottom: 146,
        backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
        backgroundPosition: "0% 0%",
      }}
    >
      <SectionRow
        title={<SectionTitle>Presencia mundial</SectionTitle>}
        belowTitle={
          <div className="flex flex-col items-start gap-8">
            <div className="space-y-6 text-[18px] leading-[1.7] text-[#333]">
              <p>
                Las estaciones Kunak AIR han sido probadas en las condiciones más adversas en más de 80 países por
                los 5 continentes. Desde los países nórdicos con temperaturas de -30ºC hasta Oriente Medio a +50ºC.
              </p>
              <p>
                Nuestra avanzada tecnología hace que nuestras soluciones sean válidas para ambientes con condiciones
                de extrema temperatura y humedad como las zonas tropicales o zonas gélidas como la Antártida.
              </p>
            </div>
            <BlueButton href="https://kunakair.com/es/contacto/">¿Cómo podemos ayudarte?</BlueButton>
          </div>
        }
      >
        <img
          src="/images/uploads/2023/03/world.svg"
          alt="Mapa mundial de la presencia de Kunak"
          width={786}
          height={405}
          className="h-auto w-full"
          style={{ maxWidth: "100%" }}
        />
      </SectionRow>
    </section>
  );
}
