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
  bottomGap = 0,
}: {
  image: string;
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  /** White space below the photo, inside the section (Divi slider margin). */
  bottomGap?: number;
}) {
  return (
    <section className="w-full bg-white" style={{ paddingBottom: bottomGap }}>
      <div
        className="relative w-full bg-cover bg-center px-[6%]"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundColor: "rgba(0, 0, 0, 0.33)",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="mx-auto max-w-[1380px] py-[40px] text-left md:py-[74px] md:pl-[49%]">
          <h2
            className="text-[28px] text-white md:text-[45px]"
            style={{
              fontWeight: 300,
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
            }}
          >
            {heading}
          </h2>

          <a
            href={buttonHref}
            className="group mt-8 inline-flex items-center gap-2 rounded-[30px] border border-white px-6 py-[9px] text-[15px] font-bold text-white transition-colors duration-200 hover:border-[#7F8798] hover:bg-[#7F8798]"
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
