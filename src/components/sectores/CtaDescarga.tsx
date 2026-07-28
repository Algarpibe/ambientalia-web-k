import type { SectorBloqueCtaDescarga } from "@/lib/sectores";

/**
 * Shortcode `calls` — las **dos pieles** del bloque de descarga.
 * Spec: docs/research/sectores/components/cta-descarga.spec.md
 *
 * `variante: "foto"` (Urbano, por defecto): la foto es un `<img>` de 280 a la
 * izquierda, sangrado −30 fuera del padding, y el texto ocupa el resto.
 * `variante: "fondo"` (Industria): la foto es el `background-image` de la caja
 * y el texto se aparta a la derecha con `padding-left: 36%` para dejarla ver.
 *
 * Lo que comparten las dos, y **cambia entero entre anchos** (no es un reflow):
 *   desktop → borde #d8d8d8, texto #333, la foto se ve tal cual.
 *   móvil   → `rgba(0,0,0,.45)` con `mix-blend-mode: multiply` (oscurece la
 *             foto en la piel "fondo"; en la piel "foto" no hay imagen debajo y
 *             queda un gris plano), SIN borde, texto blanco y botón invertido.
 *
 * El color va EXPLÍCITO en cada `<p>`: la regla global `p { color: #333 }` de
 * globals.css le gana a la herencia del contenedor (mismo tropiezo que M1).
 *
 * El botón no usa `OutlineButton`/`LightButton` porque su fondo es propio y
 * cambia con el breakpoint; la geometría Divi sí es la de siempre.
 */
export function CtaDescarga({ block }: { block: SectorBloqueCtaDescarga }) {
  const fondo = block.variante === "fondo";

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-[86%] max-w-[1380px] py-[30px] md:py-[28.7969px]">
        <div
          className={
            "mb-[12.5156px] bg-[rgba(0,0,0,0.45)] bg-cover bg-[0%_0%] text-white [background-blend-mode:multiply] md:mb-[46.25px] md:border md:border-[#d8d8d8] md:bg-transparent md:text-[#333] md:[background-blend-mode:normal] " +
            // paddings: la piel "fondo" usa 40/60 en los DOS anchos
            (fondo ? "px-[60px] py-[40px]" : "px-[30px] pb-[40px] pt-[30px] md:px-[50px] md:py-[40px]")
          }
          style={fondo ? { backgroundImage: `url('${block.image}')` } : undefined}
        >
          <div className={fondo ? "" : "md:flex"}>
            {fondo ? null : (
              <img
                src={block.image}
                alt=""
                aria-hidden
                className="mx-auto block w-[165.23px] md:mx-0 md:ml-[-30px] md:mr-[20px] md:w-[280px] md:shrink-0"
              />
            )}

            <div className={fondo ? "md:pl-[36%]" : "md:min-w-0 md:flex-1"}>
              <p className="pb-[10px] text-[27px] font-normal leading-[37.8px] text-white md:text-[37px] md:leading-[51.8px] md:text-[#333]">
                {block.title}
              </p>

              {/* Rítmica Divi del `.calls-text`: `padding-bottom` de 1em en
                  cada párrafo salvo el último (14 en móvil, 18 en desktop).
                  Con Urbano no se veía —tiene un solo párrafo—; salió al
                  poblar Industria, que tiene dos y salían pegados. */}
              <div className="pb-[30px] text-[14px] leading-[22.4px] text-white [&>p:not(:last-child)]:pb-[14px] [&>p]:text-white md:text-[18px] md:leading-[30.6px] md:text-[#333] md:[&>p:not(:last-child)]:pb-[18px] md:[&>p]:text-[#333]">
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
