/**
 * Shared full-width CTA banner — Divi `et_pb_fullwidth_slider` with a single
 * slide (no arrows / dots / autoplay). Used by the two dark photo banners on
 * the home: "¿Estás inmerso…?" (section 6) and "¿Te preocupa…?" (section 11).
 *
 * Specs:
 *   docs/research/components/cta-inmerso.spec.md
 *   docs/research/components/cta-preocupa.spec.md
 *
 * Background: cover photo + `rgba(0,0,0,0.33)` with `mix-blend-mode: multiply`.
 * Copy lives in the right half on desktop (padding-left ≈ 49%), left-aligned.
 */
export function CtaBanner({
  image,
  heading,
  buttonLabel,
  buttonHref,
  bottomGapClassName = "",
}: {
  image: string;
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  /** White space below the photo, inside the section (Divi slider margin). */
  bottomGapClassName?: string;
}) {
  return (
    <section className={"w-full bg-white " + bottomGapClassName}>
      <div
        className="relative w-full bg-cover bg-center px-[6%]"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundColor: "rgba(0, 0, 0, 0.33)",
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Móvil: slide description Divi pt 34.3 / pb 51.5 (10% / 15% de 343) */}
        <div className="mx-auto max-w-[1380px] pb-[51px] pt-[34px] text-left md:py-[74px] md:pl-[49%]">
          {/* Peso responsive Divi: 500 en móvil, 300 en desktop */}
          <h2
            className="pb-[10px] text-[27px] font-medium text-white md:pb-0 md:text-[45px] md:font-light"
            style={{
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
            }}
          >
            {heading}
          </h2>

          <a
            href={buttonHref}
            className="group mt-[20px] inline-flex items-center gap-2 rounded-[30px] border border-white px-6 pb-[9px] pt-[7.5px] text-[15px] font-bold text-white transition-colors duration-200 hover:border-[#7F8798] hover:bg-[#7F8798] md:mt-8"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
          >
            {buttonLabel}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
