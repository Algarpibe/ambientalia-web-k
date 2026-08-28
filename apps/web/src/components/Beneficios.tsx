import type { Benefit } from "@/types/kunak";
import { BlueButton } from "./SectionRow";

/**
 * `et_pb_section_7` (row 9, lower part) — "Beneficios:" grid.
 * 6 blurbs laid out 3×2, icons 50×50, centred labels 18px/300.
 * Renders inside the 2/3 column of HazVisible. The original CTA has a dead
 * `href="#"`; mapped to the ES contact page.
 * Spec: docs/research/components/beneficios.spec.md
 */
const BENEFITS: Benefit[] = [
  { icon: "/images/uploads/2023/02/cartridge-system.svg", label: "Sistema de cartuchos" },
  { icon: "/images/uploads/2023/02/multi-pollutant-1.svg", label: "Múltiples contaminantes" },
  { icon: "/images/uploads/2023/02/flexible-scalable.svg", label: "Flexible y escalable" },
  { icon: "/images/uploads/2023/01/reduced-maintenance.svg", label: "Mantenimiento reducido" },
  { icon: "/images/uploads/2023/01/remote-calibration.svg", label: "Calibración remota" },
  { icon: "/images/uploads/2023/01/advanced-software-1.svg", label: "Software avanzado" },
];

export function Beneficios() {
  return (
    <div className="mt-10">
      <p className="text-[18px] leading-[1.7] text-[#333]">Beneficios:</p>

      {/* Móvil: 2 col de 162 con gutter 13, icono a 76 del texto (50+26),
          H3 16px/19.2 con pb10 y stride de fila 157 (medido 2026-07-23) */}
      <div className="mt-[20px] grid grid-cols-2 gap-x-[13px] gap-y-[33px] sm:grid-cols-3 md:mt-6 md:gap-x-6 md:gap-y-8">
        {BENEFITS.map((b) => (
          <div key={b.label} className="flex flex-col items-center text-center">
            <img
              src={b.icon}
              alt=""
              aria-hidden
              width={50}
              height={50}
              className="mb-[26px] md:mb-[30px]"
              style={{ width: 50, height: 50 }}
            />
            <h3
              className="pb-[10px] text-[16px] md:pb-0 md:text-[18px]"
              style={{
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                color: "#333",
              }}
            >
              {b.label}
            </h3>
          </div>
        ))}
      </div>

      <div className="mb-[30px] mt-[30px] flex justify-center md:mb-0 md:mt-8">
        <BlueButton href="/contacto">Solicita más información</BlueButton>
      </div>
    </div>
  );
}
