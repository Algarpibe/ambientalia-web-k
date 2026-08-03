import { CtaBanner } from "./CtaBanner";

/**
 * `et_pb_section_6` — "¿Estás inmerso en un proyecto…?" CTA banner.
 * Spec: docs/research/components/cta-inmerso.spec.md
 */
export function CtaInmerso() {
  return (
    <CtaBanner
      image="/images/uploads/2023/02/people-city-urban.jpg"
      heading="¿Estás inmerso en un proyecto de calidad del aire y necesitas información fiable?"
      buttonLabel="Podemos ayudarte"
      buttonHref="https://kunakair.com/es/contacto/"
      bottomGapClassName="pb-[20px] md:pb-[71px]"
    />
  );
}
