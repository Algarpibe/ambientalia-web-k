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
          {/* QA Fase 5 de /kunak-api (2026-07-28): este punteado llevaba
              `z-[-1]` y NO SE VEÍA — con z-index negativo la imagen se pinta
              por detrás del `bg-white` de la sección que la contiene
              (`elementFromPoint` sobre su centro devolvía la `<section>`, no la
              imagen). En el original va a `z-index: auto` y es visible. Se
              quita el z-index: no tapa nada, cuelga 65px a la izquierda de la
              retícula y ya es `pointer-events-none`. */}
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="pointer-events-none absolute -left-[65px] -top-[40px]"
            style={{ width: 60, height: 22 }}
          />
          <SectionTitle>{title}</SectionTitle>
        </div>

        {/* −10 compensa el pb-[10px] que ahora lleva SectionTitle (regla Divi h2)

            QA Fase 5 de /kunak-api (2026-07-28): a la tarjeta le faltaban los
            dos remates del módulo de blog del original — `padding-bottom: 25px`
            dentro de la ficha y `margin-bottom` por debajo (**60** en desktop,
            **42** en móvil). Sin ellos el bloque de 3 tarjetas iba **88px
            corto** a 1280 y el CTA de guías quedaba pegado a las fechas.
            Medido idéntico en el original de /monitor-calidad-aire,
            /accesorios, /software y /kunak-api (ficha 375.3 / rejilla 435.3
            frente a 347.3 del clon). El `mb` de desktop se pone en la REJILLA,
            no en la ficha: a 1280 las 3 caben en una fila y el original lo
            suma una sola vez; en móvil van apiladas y el hueco de 42 lo da
            `gap-y` (el margen de la última ficha colapsa fuera del contenedor
            en el original, así que no debe sobrar por debajo). Los 60 van de
            **padding**, no de margen: como margen colapsaban con el `mt` del
            CTA y el hueco se quedaba en 60 en vez de 60+12.6.

            ⚠️ Solo para las fichas de producto. La HOME monta el módulo de blog
            con otra calibración —medido en su original: ficha `pb 0` / `mb 40`,
            rejilla 396.6— así que la variante `home` se queda como estaba. Su
            propio desfase (−34.9 a 1280) es anterior a esta tanda y le toca al
            QA de la home. */}
        <div
          className={
            (monitor
              ? "mt-[28px] gap-y-[42px] md:gap-y-[60px] md:pb-[60px] "
              : "mt-[30px] gap-y-[32px] md:mt-[33px] md:gap-y-10 ") +
            "grid gap-x-[40px] sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {posts.map((post) => (
            <article key={post.href} className={monitor ? "pb-[25px]" : ""}>
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
              {/* QA Fase 5 de /kunak-api (2026-07-28): el título azul al hover
                  NO es universal. Medido con ratón real (`page.mouse.move`) y
                  con el zoom 1.1 de la imagen como control de que el hover
                  aterriza: la HOME sí lo pinta azul, y /monitor-calidad-aire,
                  /software y /kunak-api lo dejan en #333. Por eso el hover se
                  queda solo en la variante `home`.
                  (/accesorios se agrupa con las fichas de producto por
                  inferencia: su sonda de hover no llegó a aterrizar, pero monta
                  el mismo módulo de blog que las otras tres —ficha `pb 25` /
                  `mb 60`— frente a la calibración distinta de la home.) */}
              <h3 className="mt-[25px] text-[20px] font-normal leading-[1.35] text-[#333]">
                <a
                  href={post.href}
                  className={
                    "text-[#333] " + (monitor ? "" : "transition-colors hover:text-[#0075C9]")
                  }
                >
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
