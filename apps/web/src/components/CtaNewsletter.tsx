/**
 * `et_pb_section_8` — "Innovación en calidad del aire a 1 clic" newsletter CTA.
 * Divi `.calls` module: paper-plane SVG background tinted with
 * `rgba(0,0,0,0.45)` via `mix-blend-mode: multiply`. Copy sits in the left
 * ~2/3 (padding-inline-end 31% on desktop). Button links to /es/suscribete/.
 * Spec: docs/research/components/cta-newsletter.spec.md
 */
export function CtaNewsletter() {
  // El original deja 15px (móvil) / 53px (desktop) hasta "Últimos artículos"
  return (
    <section className="mb-[15px] w-full bg-white md:mb-[53px]">
      <div
        className="w-full bg-cover"
        style={{
          backgroundImage: "url('/images/uploads/2024/11/banner-suscripcion.svg')",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backgroundBlendMode: "multiply",
          backgroundPosition: "0% 0%",
        }}
      >
        <div className="mx-[6%] py-[5%]">
          <div className="mx-auto max-w-[1380px] md:pr-[31%]">
            <p
              className="pb-[10px] text-[27px] text-white md:text-[45px]"
              style={{ fontWeight: 400, lineHeight: 1.4, letterSpacing: "normal" }}
            >
              Innovación en calidad del aire a 1 clic
            </p>

            {/* Rítmica Divi: cada <p> lleva padding-bottom 1em (18px) salvo el
                último; el bloque .calls-text remata con 30px (cta-newsletter.spec) */}
            {/* Móvil: calls-text 14px/22.4 con p pb 14 (medido 2026-07-23) */}
            <div className="pb-[30px] text-[14px] leading-[1.6] text-white [&>p:not(:last-child)]:pb-[14px] md:text-[18px] md:leading-[1.7] md:[&>p:not(:last-child)]:pb-[18px]">
              <p>¡Mantente informado sobre el aire que respiras!</p>
              <p>
                Suscríbete a nuestra newsletter para recibir las últimas novedades en tecnología de monitorización
                ambiental, estudios sobre calidad del aire y más.
              </p>
            </div>

            <a
              // original: https://kunakair.com/es/suscribete/
              href="/suscribete"
              className="group mb-[10px] inline-flex items-center gap-2 rounded-[30px] border border-white px-6 pb-[9px] pt-[7.5px] text-[15px] font-bold text-white transition-colors duration-200 hover:border-[#7F8798] hover:bg-[#7F8798]"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
            >
              ¡Me apunto!
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
