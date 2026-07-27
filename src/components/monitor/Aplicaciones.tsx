import { SectoresCarousel } from "@/components/SectoresCarousel";
import { BlockTitle } from "@/components/SectionRow";
import { APLICACIONES_CLAIM } from "@/lib/monitor";
import { CtaGuiaProyecto } from "./CtaGuiaProyecto";

/**
 * S3 · #applications — "Aplicaciones": título + carrusel de sectores embebido
 * en la columna 3/4 + frase azul + banner-guía con popup de descarga.
 *
 * Las 6 slides son las mismas de la home (`SECTOR_SLIDES`); lo que cambia es la
 * variante embebida del carrusel — ver `SectoresCarousel`.
 *
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md §2
 */
export function Aplicaciones() {
  return (
    <div>
      <BlockTitle className="mb-[28px]">Aplicaciones</BlockTitle>

      <SectoresCarousel variant="embedded" />

      {/* et_pb_text_19: no es un h3, es un <p> azul a la escala de 37px */}
      <p
        className="my-[20px]"
        style={{
          fontSize: 37,
          lineHeight: "37px",
          fontWeight: 300,
          letterSpacing: "-0.5px",
          color: "#0075C9",
        }}
      >
        {APLICACIONES_CLAIM}
      </p>

      <CtaGuiaProyecto />
    </div>
  );
}
