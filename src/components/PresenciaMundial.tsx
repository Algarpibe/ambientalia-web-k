import { SectionRow, SectionTitle, BlueButton } from "./SectionRow";

/**
 * `et_pb_section_7` (row 6) — "Presencia mundial" + world map.
 * The map is a single static SVG (`world.svg`) with countries painted blue.
 * Spec: docs/research/components/presencia-mundial.spec.md
 */
export function PresenciaMundial() {
  // El fondo K vive en el wrapper del compuesto (page.tsx) para no
  // recortarse en el borde de la sección, como en el original
  return (
    <section className="relative pb-[20px] pt-[80px] md:pb-[101px] md:pt-[85px]">
      <SectionRow
        title={
          <div>
            <SectionTitle>Presencia mundial</SectionTitle>
            {/* En el original los párrafos van en el mismo módulo que el título
                (+6px), con pb 18 el primero; ancho 363 para calcar el wrap */}
            <div className="mt-[20px] text-[18px] leading-[1.7] text-[#333] md:mt-[6px] md:max-w-[363px]">
              <p className="pb-[18px]">
                Las estaciones Kunak AIR han sido probadas en las condiciones más adversas en más de 80 países por
                los 5 continentes. Desde los países nórdicos con temperaturas de -30ºC hasta Oriente Medio a +50ºC.
              </p>
              <p>
                Nuestra avanzada tecnología hace que nuestras soluciones sean válidas para ambientes con condiciones
                de extrema temperatura y humedad como las zonas tropicales o zonas gélidas como la Antártida.
              </p>
            </div>
          </div>
        }
        belowTitle={
          /* Móvil: mb 30 del módulo de texto antes del botón + mb 30 del botón */
          <div className="mb-[30px] mt-[30px] md:my-0">
            <BlueButton href="https://kunakair.com/es/contacto/">¿Cómo podemos ayudarte?</BlueButton>
          </div>
        }
      >
        <img
          src="/images/uploads/2023/03/world.svg"
          alt="Mapa mundial de la presencia de Kunak"
          width={786}
          height={405}
          className="mt-[30px] h-auto w-full"
          style={{ maxWidth: "100%" }}
        />
      </SectionRow>
    </section>
  );
}
