import type { ReactNode } from "react";
import { SectionRow, SectionTitle } from "./SectionRow";

/**
 * `et_pb_section_12` — "Comprometidos con la sostenibilidad".
 * 1/3 title + 2/3 (two paragraphs + three icon blurbs, centred).
 * Spec: docs/research/components/sostenibilidad.spec.md
 */
const PILLARS: { icon: string; body: ReactNode }[] = [
  {
    icon: "/images/uploads/2023/02/ecology.svg",
    body: (
      <>
        el <strong>ecodiseño</strong> con sistemas que facilitan la reutilización y reparación de los equipos;
      </>
    ),
  },
  {
    icon: "/images/uploads/2023/02/waste-reduction.svg",
    body: (
      <>
        la <strong>reducción de residuos</strong> a través de la implementación de estrategias de economía circular,
        y
      </>
    ),
  },
  {
    icon: "/images/uploads/2023/02/energy-efficiency.svg",
    body: (
      <>
        la <strong>eficiencia energética</strong> con el uso de soluciones que aprovechan la energía solar.
      </>
    ),
  },
];

export function Sostenibilidad() {
  return (
    <section className="relative bg-white pb-[80px] pt-[56px] md:pb-[152px] md:pt-[76px]">
      <SectionRow title={<SectionTitle>Comprometidos con la sostenibilidad</SectionTitle>}>
        <div className="space-y-6 text-[18px] leading-[1.7] text-[#333]">
          <p>
            Las estaciones de monitorización de la calidad del aire de Kunak son los sistemas de monitorización
            ambiental más sostenibles del mercado.
          </p>
          <p>En su fabricación, cuidamos al detalle:</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div key={i} className="px-[40px] text-center">
              <img
                src={p.icon}
                alt=""
                aria-hidden
                width={50}
                height={50}
                className="mx-auto mb-[30px]"
                style={{ width: 50, height: 50 }}
              />
              <p className="text-[16px] leading-[1.37] text-[#333]">{p.body}</p>
            </div>
          ))}
        </div>
      </SectionRow>
    </section>
  );
}
