import type { SectorBloqueCtaDescarga } from "@/lib/sectores";

/**
 * Shortcode `calls` en la variante `call-con-foto`.
 * Spec: docs/research/sectores/components/cta-descarga.spec.md
 *
 * La piel CAMBIA ENTERA entre anchos, no es un reflow:
 *   desktop → caja blanca con borde #d8d8d8, texto #333, foto a la izquierda
 *             sangrada −30px fuera del padding, botón outline #333.
 *   móvil   → caja `rgba(0,0,0,.45)` con `mix-blend-mode: multiply` (sobre
 *             blanco = gris plano, aquí no hay foto de fondo), SIN borde, texto
 *             blanco, foto centrada arriba y botón outline blanco.
 *
 * El botón no usa `OutlineButton`/`LightButton` porque su fondo es propio
 * (`rgba(255,255,255,.65)` en desktop) y cambia de color con el breakpoint;
 * la geometría Divi sí es la misma de siempre.
 */
export function CtaDescarga({ block }: { block: SectorBloqueCtaDescarga }) {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        {/* OJO: el fondo va en CLASES, no en `style` inline. Con el color en
            línea el `md:bg-transparent` no puede ganarle (un estilo inline pisa
            cualquier clase) y la caja salía GRIS también en desktop. */}
        <div className="mb-[12.5156px] bg-[rgba(0,0,0,0.45)] px-[30px] pb-[40px] pt-[30px] text-white [background-blend-mode:multiply] md:mb-[46.25px] md:border md:border-[#d8d8d8] md:bg-transparent md:px-[50px] md:py-[40px] md:text-[#333] md:[background-blend-mode:normal]">
          <div className="md:flex">
            <img
              src={block.image}
              alt=""
              aria-hidden
              className="mx-auto block w-[165.23px] md:mx-0 md:ml-[-30px] md:mr-[20px] md:w-[280px] md:shrink-0"
            />

            <div className="md:min-w-0 md:flex-1">
              {/* El color va EXPLÍCITO en cada `<p>`: la regla global
                  `p { color: #333 }` de globals.css le gana a la herencia del
                  contenedor y el texto salía gris sobre el fondo oscuro del
                  móvil (mismo tropiezo que M1 en la home). */}
              <p className="pb-[10px] text-[27px] font-normal leading-[37.8px] text-white md:text-[37px] md:leading-[51.8px] md:text-[#333]">
                {block.title}
              </p>

              <div className="pb-[30px] text-[14px] leading-[22.4px] text-white [&>p]:text-white md:text-[18px] md:leading-[30.6px] md:text-[#333] md:[&>p]:text-[#333]">
                {block.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              <div>
                <a
                  href={block.cta.href}
                  {...(block.cta.external ? { target: "_blank", rel: "nofollow noopener" } : {})}
                  className="group relative mb-[10px] mr-[15px] inline-block rounded-[30px] border border-white bg-[rgba(0,0,0,0.15)] pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-white transition-all duration-300 hover:pr-[55.5px] md:border-[#333] md:bg-[rgba(255,255,255,0.65)] md:text-[#333]"
                >
                  {block.cta.label}
                  <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px] md:group-hover:text-[#0075C9]">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
