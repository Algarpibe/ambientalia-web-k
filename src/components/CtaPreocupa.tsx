import { CtaBanner } from "./CtaBanner";

/**
 * `et_pb_section_11` — "¿Te preocupa la calidad del aire que respiras?" banner.
 * Original button href is `/contact`; mapped to the ES contact page.
 * Spec: docs/research/components/cta-preocupa.spec.md
 */
export function CtaPreocupa() {
  return (
    <CtaBanner
      image="/images/uploads/2023/02/ship-pollution-monitoring-2.jpg"
      heading="¿Te preocupa la calidad del aire que respiras?"
      buttonLabel="Sí, quiero saber más"
      buttonHref="https://kunakair.com/es/contacto/"
    />
  );
}
