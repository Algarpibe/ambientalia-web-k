import type { SectorHero as SectorHeroData } from "@/lib/sectores";
import { BlueButton } from "../SectionRow";

/**
 * S3 — hero del sector: 1/2 + 1/2.
 * Spec: docs/research/sectores/components/sector-hero.spec.md
 *
 * Izquierda: punteado a −65 · foto · dos botones azules.
 * Derecha: H2 de 37px (el azul lo pone un `<span>` dentro del h2, como el
 * original) y los párrafos con la rítmica Divi `padding-bottom: 18px` salvo el
 * último.
 *
 * En MÓVIL la columna de la foto va primera y el titular debajo — es el orden
 * del original (col. izq. y569.25, col. der. y972.13), no una decisión propia.
 */
export function SectorHero({ hero }: { hero: SectorHeroData }) {
  return (
    <section className="w-full bg-white pb-[20px] pt-[50px] md:pb-[60px] md:pt-[57.5938px]">
      <div className="mx-auto w-[86%] max-w-[1380px] pb-[30px] md:pb-[28.7969px]">
        <div className="flex flex-col md:flex-row md:gap-[5.5%]">
          {/* ── columna izquierda ───────────────────────────────── */}
          <div className="relative mb-[30px] w-full md:mb-0 md:w-[47.25%]">
            <img
              src="/images/uploads/2022/12/punteado.svg"
              alt=""
              aria-hidden
              width={60}
              height={22}
              className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
              style={{ width: 60, height: 22 }}
            />

            <img
              src={hero.image.src}
              alt={hero.image.alt}
              className="mb-[30px] w-full md:mb-[34.0469px]"
            />

            {hero.ctas.map((cta, i) => (
              <div key={cta.href + cta.label} className={i === 0 ? "mb-[16px]" : ""}>
                <BlueButton href={cta.href} external={cta.external}>
                  {cta.label}
                </BlueButton>
                {/* margin-bottom 30 del propio botón Divi (wrapper de 74) */}
                <div aria-hidden className="h-[30px]" />
              </div>
            ))}
          </div>

          {/* ── columna derecha ─────────────────────────────────── */}
          <div className="w-full md:w-[47.25%]">
            <h2 className="mb-[30px] pb-[10px] text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333] md:mb-[34.0469px]">
              <span style={{ color: "#0075C9" }}>{hero.heading}</span>
            </h2>

            <div className="text-[18px] leading-[30.6px] text-[#333] [&>p:not(:last-child)]:pb-[18px]">
              {hero.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
