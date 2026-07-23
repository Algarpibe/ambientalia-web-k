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
              className="pb-[10px] text-[30px] text-white md:text-[45px]"
              style={{ fontWeight: 400, lineHeight: 1.4, letterSpacing: "normal" }}
            >
              Innovación en calidad del aire a 1 clic
            </p>

            <div className="space-y-4 pb-[30px] text-[18px] leading-[1.7] text-white">
              <p>¡Mantente informado sobre el aire que respiras!</p>
              <p>
                Suscríbete a nuestra newsletter para recibir las últimas novedades en tecnología de monitorización
                ambiental, estudios sobre calidad del aire y más.
              </p>
            </div>

            <a
              href="https://kunakair.com/es/suscribete/"
              className="group inline-flex items-center gap-2 rounded-[30px] border border-white px-6 py-[9px] text-[15px] font-bold text-white transition-colors duration-200 hover:border-[#7F8798] hover:bg-[#7F8798]"
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
