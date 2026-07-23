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

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.label} className="flex flex-col items-center text-center">
            <img
              src={b.icon}
              alt=""
              aria-hidden
              width={50}
              height={50}
              className="mb-[30px]"
              style={{ width: 50, height: 50 }}
            />
            <h3
              style={{
                fontSize: 18,
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

      <div className="mt-8 flex justify-center">
        <BlueButton href="https://kunakair.com/es/contacto/">Solicita más información</BlueButton>
      </div>
    </div>
  );
}
