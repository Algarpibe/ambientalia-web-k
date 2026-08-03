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
    <section className="relative bg-white pb-[80px] pt-[70px] md:pb-[59px] md:pt-[57px]">
      <SectionRow
        className="md:pb-[71px] md:pt-[20px]"
        title={<SectionTitle>Comprometidos con la sostenibilidad</SectionTitle>}
      >
        <div className="text-[18px] leading-[1.7] text-[#333] md:mt-[10px]">
          <p className="pb-[18px]">
            Las estaciones de monitorización de la calidad del aire de Kunak son los sistemas de monitorización
            ambiental más sostenibles del mercado.
          </p>
          <p>En su fabricación, cuidamos al detalle:</p>
        </div>

        {/* Pilares Divi: columnas de 238 (gutter 40), icono + 26 de aire (=76
            hasta el texto), descripción de 159px, margen de módulo 34 al pie */}
        <div className="mt-[20px] grid grid-cols-1 gap-[30px] sm:grid-cols-3 md:mb-[34px] md:gap-[40px]">
          {PILLARS.map((p, i) => (
            // Móvil: texto a la izquierda con padding 17 (blurb_content 302px
            // del original); centrado solo a partir de sm
            <div key={i} className="px-[17px] text-left sm:px-[40px] sm:text-center">
              <img
                src={p.icon}
                alt=""
                aria-hidden
                width={50}
                height={50}
                className="mx-auto mb-[26px]"
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
