import type { BlogPost } from "@/types/kunak";
import { ARTICLES } from "@/lib/articles";
import { SectionTitle, BlueButton } from "./SectionRow";

/**
 * `et_pb_section_9` — "Últimos artículos" (3-card blog grid).
 * Cards zoom their image 1.1× on hover; titles turn blue on hover.
 * Spec: docs/research/components/ultimos-articulos.spec.md
 *
 * /monitor-calidad-aire reusa el bloque con otro título ("Artículos y Guías") y
 * otros 3 posts: el original los sortea en cada carga, así que el clon congela
 * el set capturado en el recon (`MONITOR_ARTICLES`).
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md §4
 */
export function UltimosArticulos({
  title = "Últimos artículos",
  posts = ARTICLES,
  variant = "home",
}: {
  title?: string;
  posts?: BlogPost[];
  /**
   * "monitor" = /monitor-calidad-aire (QA 2026-07-26): sección SIN watermark
   * (et_pb_section_4 bg none), fila Divi 80%/máx 1380 con pt 140 y remate
   * pb 64 + mb 30 del botón. También la usa /software.
   *
   * "api" = /kunak-api: idéntica salvo el ESPACIADO de la fila del titular —
   * el original le da `padding-top: 2%` (25.29 medido a cw 1264.7), no los
   * 140px fijos; y el CTA cuelga a `1%` de las tarjetas en vez de a 46px
   * (son dos filas Divi: `28.8px 0 1%` y `0 0 5%`).
   *
   * La home no cambia.
   */
  variant?: "home" | "monitor" | "api";
} = {}) {
  // las dos variantes de ficha de producto comparten sección y retícula
  const monitor = variant !== "home";
  const api = variant === "api";
  return (
    <section
      className={
        "relative bg-white bg-no-repeat " +
        (monitor ? "" : "pb-[50px] pt-[80px] md:pb-[101px] md:pt-[84px]")
      }
      style={
        monitor
          ? undefined
          : {
              backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
              backgroundPosition: "0% 0%",
            }
      }
    >
      <div
        className={
          monitor
            ? "mx-auto w-[80%] max-w-[1380px] pb-[49px] md:pb-[94px] " +
              // móvil: las filas Divi usan 30px fijos, no el 2% del ancho
              (api ? "pt-[30px] md:pt-[2vw]" : "pt-[140px]")
            : "mx-auto w-[86.35%] max-w-[1380px] md:w-[85%]"
        }
      >
        <div className="relative">
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
            style={{ width: 60, height: 22 }}
          />
          <SectionTitle>{title}</SectionTitle>
        </div>

        {/* −10 compensa el pb-[10px] que ahora lleva SectionTitle (regla Divi h2) */}
        <div
          className={
            (monitor ? "mt-[28px] " : "mt-[30px] md:mt-[33px] ") +
            "grid gap-x-[40px] gap-y-[32px] sm:grid-cols-2 md:gap-y-10 lg:grid-cols-3"
          }
        >
          {posts.map((post) => (
            <article key={post.href}>
              <a
                href={post.href}
                className="group block aspect-[4/2.7] overflow-hidden rounded-[10px] bg-[#eee]"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
              <h3 className="mt-[25px] text-[20px] font-normal leading-[1.35] text-[#333]">
                <a href={post.href} className="text-[#333] transition-colors hover:text-[#0075C9]">
                  {post.title}
                </a>
              </h3>
              <p className="text-[13.5px] leading-[1.55] text-[#333] md:mt-2">{post.date}</p>
            </article>
          ))}
        </div>

        <div
          className={
            "mt-4 flex justify-end " +
            (api ? "md:mt-[1vw]" : monitor ? "md:mt-[46px]" : "md:mt-[80px]")
          }
        >
          <BlueButton href="https://kunakair.com/es/recursos/guias/">
            Amplia tus conocimientos con nuestras guías
          </BlueButton>
        </div>
      </div>
    </section>
  );
}
