import type { SectorBloqueClaimConFoto } from "@/lib/sectores";

/**
 * Claim azul de 37px + foto, fila `et_pb_equal_columns`.
 * Spec: docs/research/sectores/components/claim-con-foto.spec.md
 *
 * El original centra el claim verticalmente con `margin: 121.031px 0` en la
 * columna de texto (= (390.08 − 148) / 2). Aquí se hace con `items-center`,
 * que da el mismo resultado sin cablear el número — y que sigue valiendo si el
 * claim o la foto de otro sector tienen otras alturas.
 *
 * En móvil el texto va primero y la foto debajo, sin centrado.
 *
 * El bloque pinta **solo el contenido de su fila**: la `<section>` y la retícula
 * las monta `SectorBody` (S7). Que aquí no hubiera `padding-top` era el `flujo:
 * "filaPegada"` cableado — en los 6 sectores de plantilla clásica el claim
 * siempre va pegado a la fila de arriba, pero eso es dato, no plantilla.
 */
export function ClaimConFoto({ block }: { block: SectorBloqueClaimConFoto }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-[5.5%]">
      <div className="w-full pr-[25px] md:w-[47.25%]">
        <p className="text-[37px] font-light leading-[37px] text-[#333]">
          <span style={{ color: "#0075C9" }}>{block.claim}</span>
        </p>
      </div>

      <div className="w-full md:w-[47.25%]">
        <img src={block.image.src} alt={block.image.alt} className="w-full" />
      </div>
    </div>
  );
}
