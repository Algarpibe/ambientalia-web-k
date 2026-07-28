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
 */
export function ClaimConFoto({ block }: { block: SectorBloqueClaimConFoto }) {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[86%] max-w-[1380px] pb-[30px] md:pb-[28.7969px]">
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
      </div>
    </section>
  );
}
