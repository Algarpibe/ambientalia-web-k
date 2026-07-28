import type { SectorHeader } from "@/lib/sectores";

/**
 * `.cabecera.cabecera-sectores` — la franja de foto con el kicker y el H1
 * encima. Spec: docs/research/sectores/components/cabecera-sector.spec.md
 *
 * Es la franja decorativa de las otras 4 páginas MÁS una fila Divi de texto:
 * 397.61 de alto en desktop y 347.25 en móvil, contra los 225 de aquéllas.
 *
 * `HeaderNav` es `absolute` y no ocupa espacio: el hueco de sus filas
 * (185 desktop / 125.58 móvil, medidos en el original) lo pone el `padding-top`
 * de aquí. En el clon el header real acaba en 203.59 a 1440, o sea que su caja
 * solapa 18.6px de la franja, pero no hay colisión visual: lo más bajo que
 * pinta es el pill "Descargar catálogo", que termina en ~173.
 */
export function CabeceraSector({ header }: { header: SectorHeader }) {
  return (
    <section
      className="cabecera-sectores w-full bg-cover bg-center pb-[40px] pt-[125.58px] md:pt-[185px]"
      style={{
        backgroundImage:
          `linear-gradient(rgba(71,71,71,0.17) 0%, rgba(0,0,0,0) 100%), url('${header.image}')`,
      }}
    >
      {/* Fila Divi: **86% máx 1380** en los dos anchos (medido a 1280/1440/
          1600/1800: 1100.8 · 1238.39 · 1376 · 1380 — el máximo entra a ~1605).
          NO es el 80% de las páginas de producto. py 30 móvil / 2% desktop. */}
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        {/* Kicker: 40px sobre una caja de línea de 30.6 y `margin-top: -13`.
            El hueco hasta el h1 (29.77 desktop / 16.22 móvil) incluye los
            11.21px de alto del módulo original que no supimos atribuir a
            ninguna regla Divi — ver la spec. */}
        <p className="-mt-[13px] mb-[16.22px] text-[40px] font-bold leading-[30.6px] text-white md:mb-[29.77px]">
          {header.kicker}
        </p>

        <h1 className="pb-[10px] text-[30px] font-normal leading-[36px] tracking-[-0.5px] text-white">
          {header.title}
        </h1>

        {/* margin-bottom del módulo del h1 (21.6562 desktop / 5.8594 móvil) */}
        <div aria-hidden className="h-[5.8594px] md:h-[21.6562px]" />
      </div>
    </section>
  );
}
