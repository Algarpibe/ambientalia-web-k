import Link from "next/link";

/**
 * Hero — banner-home (`et_pb_section_0`).
 * Two-column layout, background image + dark gradient overlay,
 * kicker H1 + big H2 + subheading, two circular animated CTAs, EPA/mCerts/AirLab
 * badges anchored at the bottom-right.
 *
 * Structure mirrored from docs/research/components/hero.spec.md.
 */
export function HeroSection() {
  return (
    <section
      className="banner-home relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.47) 100%), url('/images/uploads/2023/07/imagen-banner-principal-2-1-1.webp')",
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
        paddingTop: "clamp(120px, 12.7vw, 180px)",
      }}
    >
      {/* Watermark "K" — mix-blend soft-light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-[1] w-full"
        style={{
          top: "31%",
          height: "100%",
          backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left top",
          mixBlendMode: "soft-light",
        }}
      />

      <div className="relative z-[2] mx-auto flex w-[85%] max-w-[1380px] items-stretch gap-[5.5%] lg:min-h-[80vh]">
        {/* Left column — the AIR Pro sensor pinned to the bottom edge */}
        <div className="banner-home-col-izda hidden w-[36.7%] shrink-0 flex-col items-end self-end lg:flex">
          <img
            src="/images/uploads/2022/12/kunak-air-pro-aislado.png"
            alt="Kunak AIR Pro"
            className="h-auto w-auto"
            style={{ maxHeight: "73vh" }}
          />
        </div>

        {/* Right column — text stack + CTAs + logos */}
        <div className="banner-home-col-dcha flex w-full flex-col self-center lg:w-[57.8%]">
          <div style={{ width: "90%" }}>
            {/* SEO kicker — present in the original DOM but renders 0×0 */}
            <h1 className="sr-only">Monitoreo de la calidad del aire</h1>

            {/* Titular: 38px en móvil (≤767 Divi), 42px desktop — hero.spec.md */}
            <h2
              className="text-[38px] leading-[45.6px] text-white md:text-[42px] md:leading-[50.4px]"
              style={{
                letterSpacing: "-0.5px",
                fontWeight: 600,
                color: "#fff",
                textShadow: "0em 0em 0.3em rgba(0,0,0,0.64)",
                marginTop: 10,
              }}
            >
              La solución profesional para la monitorización de la calidad del aire
            </h2>

            <h2
              className="text-white"
              style={{
                fontSize: 28,
                lineHeight: 1.3,
                letterSpacing: "-0.5px",
                fontWeight: 300,
                color: "#fff",
                textShadow: "0em 0em 0.3em rgba(0,0,0,0.64)",
                marginTop: 14,
              }}
            >
              Datos fiables y trazables para decisiones operativas y cumplimiento normativo
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#video"
              data-trigger-click="video"
              className="banner-home-button group inline-flex h-[50px] items-center text-white"
            >
              <PlayCircleAnimated className="mr-[10px] h-[50px] w-[50px] shrink-0" />
              <span className="text-[18px] font-bold">Descubre cómo funciona</span>
            </Link>

            <Link
              href="https://kunakair.com/es/descarga-catalogo/"
              target="_blank"
              rel="noopener"
              className="banner-home-button group inline-flex h-[50px] items-center text-white"
            >
              <DownloadCircleAnimated className="mr-[10px] h-[50px] w-[50px] shrink-0" />
              <span className="text-[18px] font-bold">Catálogo</span>
            </Link>
          </div>

          {/* Divider + certification badges */}
          <div
            className="mt-10 border-t border-white/40 pt-5 text-white"
            style={{ width: "90%" }}
          >
            <p className="text-[16px]">
              Evaluado por los principales expertos mundiales en calidad del aire
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-8">
              <a
                href="/doc/09.StudiesReferences/Independent_studies/USEPA_Wildland_Fire_Challenge_Kunak_AIR_Evaluation.pdf"
                target="_blank"
                rel="noopener"
                title="EPA"
                className="banner-logotipo inline-block transition-opacity duration-200 hover:opacity-75"
              >
                <img
                  src="/images/uploads/2025/10/logos-banner-home-epa.svg"
                  alt="EPA"
                  width={143}
                  height={64}
                  style={{ width: 143, height: 64, maxWidth: "none" }}
                />
              </a>
              <a
                href="/doc/09.StudiesReferences/Independent_studies/Kunak_AIR_Pro_Mcerts_certificate_MC23041800-1.pdf"
                target="_blank"
                rel="noopener"
                title="mCerts"
                className="banner-logotipo inline-block transition-opacity duration-200 hover:opacity-75"
              >
                <img
                  src="/images/uploads/2025/10/logos-banner-home-mcerts.svg"
                  alt="mCerts"
                  width={63}
                  height={64}
                  style={{ width: 63, height: 64, maxWidth: "none" }}
                />
              </a>
              <a
                href="/doc/09.StudiesReferences/Independent_studies/AIRLAB_Microsensors_Challenge_2023_Kunak_AIR_Pro.pdf"
                target="_blank"
                rel="noopener"
                title="AirLab"
                className="banner-logotipo inline-block transition-opacity duration-200 hover:opacity-75"
              >
                <img
                  src="/images/uploads/2025/10/logos-banner-home-airlab.svg"
                  alt="AirLab"
                  width={90}
                  height={64}
                  style={{ width: 90, height: 64, maxWidth: "none" }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Animated CTA icons — reproduce the theme's `.stroke-solid` + `.icon` pair.
 *
 *   .banner-home .stroke-solid {
 *     stroke-dashoffset:0; stroke-dasharray:300; stroke-width:4px;
 *     transition: stroke-dashoffset 1s ease, opacity 1s ease;
 *   }
 *   .banner-home .icon { transform:scale(0.8); transform-origin:50% 50%;
 *     transition: transform 200ms ease-out; }
 *   .banner-home-button:hover .stroke-solid { opacity:1; stroke-dashoffset:300 }
 *   .banner-home-button:hover .icon         { transform:scale(0.9) }
 * ------------------------------------------------------------------------ */

function PlayCircleAnimated({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        className="stroke-solid"
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeDasharray={300}
        strokeDashoffset={0}
        style={{
          transition:
            "stroke-dashoffset 1s ease, opacity 1s ease",
        }}
        d="M49.9,2.5C23.6,2.8,2.1,24.4,2.5,50.4C2.9,76.5,24.7,98,50.3,97.5c26.4-0.6,47.4-21.8,47.2-47.7 C97.3,23.7,75.7,2.3,49.9,2.5"
      />
      <path
        className="icon"
        fill="#fff"
        style={{
          transform: "scale(0.8)",
          transformOrigin: "50% 50%",
          transition: "transform 200ms ease-out",
        }}
        d="M38,69c-1,0.5-1.8,0-1.8-1.1V32.1c0-1.1,0.8-1.6,1.8-1.1l34,18c1,0.5,1,1.4,0,1.9L38,69z"
      />
    </svg>
  );
}

function DownloadCircleAnimated({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        className="stroke-solid"
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeDasharray={300}
        strokeDashoffset={0}
        style={{
          transition:
            "stroke-dashoffset 1s ease, opacity 1s ease",
        }}
        d="M49.9,2.5C23.6,2.8,2.1,24.4,2.5,50.4C2.9,76.5,24.7,98,50.3,97.5c26.4-0.6,47.4-21.8,47.2-47.7 C97.3,23.7,75.7,2.3,49.9,2.5"
      />
      <path
        className="icon"
        fill="#fff"
        style={{
          transform: "scale(0.8)",
          transformOrigin: "50% 50%",
          transition: "transform 200ms ease-out",
        }}
        d="M41.4,59.1l4.3,4.3c2.4,2.4,6.2,2.4,8.6,0l4.3-4.3h9.7c3.4,0,6.1,2.7,6.1,6.1v3c0,3.4-2.7,6.1-6.1,6.1H31.7c-3.4,0-6.1-2.7-6.1-6.1v-3c0-3.4,2.7-6.1,6.1-6.1h9.7ZM53,51.8l7-7c1.2-1.2,3.1-1.2,4.3,0s1.2,3.1,0,4.3l-12.2,12.2c-1.2,1.2-3.1,1.2-4.3,0l-12.2-12.2c-1.2-1.2-1.2-3.1,0-4.3s3.1-1.2,4.3,0l7,7v-23.1c0-1.7,1.4-3,3-3s3,1.4,3,3v23.1ZM69,66.7c0-1.3-1-2.3-2.3-2.3s-2.3,1-2.3,2.3,1,2.3,2.3,2.3,2.3-1,2.3-2.3Z"
      />
    </svg>
  );
}

function ScrollIndicator() {
  return (
    <div
      aria-hidden
      className="scroll-code absolute z-[3] w-[40px]"
      style={{ bottom: 60, left: "50%", transform: "translate(-50%, 0)" }}
    >
      <div className="mx-auto flex h-[38px] w-[24px] items-start justify-center rounded-full border border-white/70">
        <span
          className="mt-[8px] block h-[6px] w-[6px] rounded-full bg-white"
          style={{ animation: "kunak-scroll-dot 2s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
