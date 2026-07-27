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
      {/* QA 2026-07-26: fila Divi 80%/máx 1380 con py 12 (alto total 50) y TODO
          el texto en azul #0075C9 (color del módulo, enlaces incluidos). */}
      <nav aria-label="Migas de pan" className="bg-white">
        <div className="mx-auto w-[80%] max-w-[1380px] py-[12px] text-[12px] leading-[26px]">
          <ol className="kunak-breadcrumbs flex flex-wrap items-center gap-1 text-[#0075C9]">
            <li>
              <a href="https://kunakair.com/es/" className="text-[#0075C9] hover:underline">
                Inicio
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href="https://kunakair.com/es/productos/" className="text-[#0075C9] hover:underline">
                Productos
              </a>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">AIR Pro</li>
          </ol>
        </div>
      </nav>

      {/* --- S1 · fila 1 · Hero --- */}
      {/* Geometría Divi medida (QA 2026-07-26): sección pt 4vw (50 móvil); fila
          80%/máx 1380 con pt 2vw (30 móvil) y pb 5vw; columnas 1/2 de 47.25%
          con gutter 5.5%. */}
      <section
        className="relative bg-white bg-no-repeat pt-[50px] lg:pt-[4vw]"
        style={{
          backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
          backgroundPosition: "0% 50%",
        }}
      >
        <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[5vw] pt-[30px] md:flex-row md:items-start md:gap-[5.5%] lg:pt-[2vw]">
          {/* Columna izquierda — texto */}
          <div className="relative w-full md:w-[47.25%]">
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

            {/* 6 logos validadores. QA 2026-07-26: en esta página el original
                renderiza los SVG CUADRADOS (150×150 natural) — desktop una fila
                compacta a 69px (49 los dos últimos); móvil 2 columnas a 90px
                (100 los dos últimos), no las versiones apaisadas de la home. */}
            <div className="mt-[26px] grid grid-cols-2 items-center justify-items-center gap-y-[33px] sm:flex sm:flex-wrap sm:justify-start sm:gap-x-[13px] sm:gap-y-0">
              {VALIDATOR_LOGOS.map((v, i) => (
                <a key={v.title} href={v.href} target="_blank" rel="noopener" title={v.title}>
                  <img
                    src={v.src}
                    alt={v.title}
                    className={
                      "aspect-square w-auto object-contain " +
                      (i < 4 ? "h-[90px] sm:h-[69px]" : "h-[100px] sm:h-[49px]")
                    }
                  />
                </a>
              ))}
            </div>

            <div className="mt-[30px]">
              <BlueButton href={CONTACT_HREF}>Solicita más información</BlueButton>
            </div>
          </div>

          {/* Columna derecha — visor 360° + badge + botón vídeo */}
          <div className="w-full md:w-[47.25%]">
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
