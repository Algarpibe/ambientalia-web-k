import { Product360Viewer } from "@/components/Product360Viewer";
import { VideoLightbox } from "@/components/VideoLightbox";
import { BlueButton } from "@/components/SectionRow";
import { FRAMES_360, VALIDATOR_LOGOS, CONTACT_HREF } from "@/lib/monitor";

/**
 * S0 (breadcrumb) + S1 · fila 1 (hero) de /monitor-calidad-aire.
 * Spec: docs/research/monitor-calidad-aire/components/hero-producto.spec.md
 *
 * Izquierda: kicker "Kunak AIR Pro" + H1 subtítulo + H2 gigante + kicker azul
 * + 6 logos validadores + CTA azul. Derecha: visor 360° (nativo) con badge
 * laurel absoluto + botón outline "Ver vídeo del producto" (VideoLightbox
 * parametrizado a YouTube tuTfw6KIvd4).
 */
export function HeroProducto() {
  return (
    <>
      {/* --- S0 · Breadcrumb --- */}
      <nav aria-label="Migas de pan" className="bg-white">
        <div className="mx-auto w-[85%] max-w-[1080px] pt-[24px] text-[12px]">
          <ol className="kunak-breadcrumbs flex flex-wrap items-center gap-1">
            <li>
              <a href="https://kunakair.com/es/" className="font-semibold text-[#333] hover:text-[#0075C9]">
                Inicio
              </a>
            </li>
            <li aria-hidden className="text-[#0075C9]">/</li>
            <li>
              <a href="https://kunakair.com/es/productos/" className="font-semibold text-[#333] hover:text-[#0075C9]">
                Productos
              </a>
            </li>
            <li aria-hidden className="text-[#0075C9]">/</li>
            <li aria-current="page" className="font-semibold text-[#0075C9]">
              AIR Pro
            </li>
          </ol>
        </div>
      </nav>

      {/* --- S1 · fila 1 · Hero --- */}
      <section
        className="relative bg-white bg-no-repeat py-[41px]"
        style={{
          backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
          backgroundPosition: "0% 50%",
        }}
      >
        <div className="mx-auto flex w-[85%] max-w-[1080px] flex-col gap-[45px] py-[30px] md:flex-row md:items-start">
          {/* Columna izquierda — texto */}
          <div className="relative w-full md:flex-1">
            <img
              src="/images/uploads/2022/12/punteado.svg"
              alt=""
              aria-hidden
              width={60}
              height={22}
              className="pointer-events-none absolute -left-[65px] -top-[30px] z-[-1]"
              style={{ width: 60, height: 22 }}
            />

            <p style={{ fontSize: 50, lineHeight: "60px", fontWeight: 800, color: "#333" }}>
              Kunak AIR Pro
            </p>
            <h1
              className="pb-[10px]"
              style={{ fontSize: 23, lineHeight: "23px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
            >
              Monitor de calidad del aire
            </h1>
            <h2
              id="monitoriza-la-calidad-del-aire-con-datos-precisos-y-fiables"
              className="pb-[10px]"
              style={{ fontSize: 44, lineHeight: "55px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
            >
              Monitoriza la calidad del aire con datos precisos y fiables
            </h2>

            <p style={{ fontSize: 16, fontWeight: 800, color: "#0075C9" }}>
              BASADO EN SENSORES <span style={{ color: "#333" }}>|</span> MÁXIMA PRECISIÓN
            </p>

            {/* 6 logos validadores — grid 2 col en móvil, fila en desktop */}
            <div className="mt-[26px] flex flex-wrap items-center gap-x-[4%] gap-y-[22px] sm:gap-x-[26px]">
              {VALIDATOR_LOGOS.map((v) => (
                <a
                  key={v.title}
                  href={v.href}
                  target="_blank"
                  rel="noopener"
                  title={v.title}
                  className="flex w-[48%] items-center justify-center sm:w-auto sm:justify-start"
                >
                  <img
                    src={v.src}
                    alt={v.title}
                    className="h-[52px] w-auto max-w-full object-contain"
                    style={v.width ? { width: v.width } : undefined}
                  />
                </a>
              ))}
            </div>

            <div className="mt-[30px]">
              <BlueButton href={CONTACT_HREF}>Solicita más información</BlueButton>
            </div>
          </div>

          {/* Columna derecha — visor 360° + badge + botón vídeo */}
          <div className="w-full md:flex-1">
            <div className="relative">
              <Product360Viewer
                frames={FRAMES_360}
                reverse
                inertia={12}
                autoRotate
                ariaLabel="Kunak AIR Pro — vista 360°"
              />
              {/* Badge laurel AIRLAB — absoluto, esquina inferior-derecha. */}
              <img
                src="/images/uploads/2024/01/ganador-airlab-2021-2023-2.svg"
                alt="Ganador AIRLAB Microsensors Challenge 2021 & 2023 — sensor multicontaminante más preciso"
                className="pointer-events-none absolute bottom-0 right-0 z-[2] w-[105px]"
              />
            </div>

            {/* Botón outline "Ver vídeo del producto" → lightbox YouTube. */}
            <div className="mt-[26px] flex justify-center">
              <VideoLightbox
                youtubeId="tuTfw6KIvd4"
                title="Kunak Air Pro - The most accurate air quality monitor"
                ariaLabel="Vídeo del producto Kunak AIR Pro"
              >
                <span className="group relative inline-block rounded-[30px] border border-[#333] pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-[#333] transition-all duration-300 hover:pr-[55.5px]">
                  Ver vídeo del producto
                  <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px] group-hover:text-[#0075C9]">
                    →
                  </span>
                </span>
              </VideoLightbox>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
