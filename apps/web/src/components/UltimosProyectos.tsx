import type { CaseStudy } from "@/types/kunak";
import { PROJECTS } from "@/lib/projects";
import { SectionTitle, BlockTitle, OutlineButton } from "./SectionRow";

/**
 * `et_pb_section_10` — "Últimos proyectos" (3 case-study cards).
 * Images are `background-image` layers that scale 1.1× on hover.
 * "Ver todos los casos de éxito" maps to the ES case-studies page.
 * Spec: docs/research/components/ultimos-proyectos.spec.md
 *
 * `embedded` = la instancia de /monitor-calidad-aire (#case-studies): las
 * mismas 3 tarjetas, pero dentro de la columna 3/4 (sin sección propia ni
 * punteado), con el título a la escala de 37px y el CTA alineado a la
 * izquierda. Spec: …/monitor-calidad-aire/components/reutilizables.spec.md §3
 *
 * `posts` permite pasar otro juego de casos (misma prop que `UltimosArticulos`).
 * Hoy las 3 páginas sirven los mismos 3 —verificado en el DOM del original—,
 * pero cada página guarda su lista en su propio `lib/*.ts`, así que el
 * componente no debe cablear `PROJECTS`.
 */
export function UltimosProyectos({
  title = "Últimos proyectos",
  ctaLabel = "Ver todos los casos de éxito",
  ctaHref = "/casos-de-exito",
  ctaExternal = false,
  embedded = false,
  bare = false,
  posts = PROJECTS,
}: {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /**
   * `target="_blank"`. Las páginas de sector lo necesitan: allí el CTA apunta a
   * `https://kunakair.com/case-studies/` (SIN `/es/`) y el original lo abre en
   * otra pestaña — medido 2026-07-28.
   */
  ctaExternal?: boolean;
  embedded?: boolean;
  /**
   * `bare` — solo la rejilla y el CTA, **sin sección, sin fila y sin titular**.
   * Lo usan las páginas de sector, donde el titular y las tarjetas viven en
   * DOS filas Divi distintas (medido: fila del h2 122.59 · fila de tarjetas
   * 587.66) y la retícula es la del sector (86%), no el 85% de la home. La
   * página compone las filas; aquí solo va el contenido.
   */
  bare?: boolean;
  posts?: CaseStudy[];
} = {}) {
  const cards = (
    <>
      {/* MARCADOR DE SONDA (130.ª) — ATRIBUTO sobre la rejilla, que ya existe.
          En el original las 3 fichas son UN solo módulo de texto
          (`.et_pb_text_18` en software), no tres: el marcador va en el
          contenedor, no en cada `<article>`. */}
      <div
        data-modulo="text"
        className={
          "grid gap-x-[40px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3 " +
          // sector: el `margin-bottom: 40` de la ficha del original cuenta
          // también cuando las 3 caben en una sola fila (rejilla 461.06 =
          // ficha 421.06 + 40); el `gap-y` solo actúa ENTRE filas.
          (bare ? "mt-0 md:pb-[40px] " : embedded ? "mt-0 " : "mt-[43px] ")
        }
      >
          {posts.map((c) => (
            <article key={c.href} className="flex flex-col">
              <div className="aspect-[4/2.7] overflow-hidden rounded-[10px]">
                <a href={c.href} className="group block h-full w-full" aria-label={c.title}>
                  <span
                    aria-hidden
                    className="block h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${c.image}')` }}
                  />
                </a>
              </div>

              <div className="py-[5px] text-[13.5px] leading-[1.4]">
                <span className="font-bold text-[#333]">Sector: </span>
                {c.sectorHref ? (
                  <a href={c.sectorHref} className="text-[#0075C9] hover:underline">
                    {c.sector}
                  </a>
                ) : (
                  <span className="text-[#0075C9]">{c.sector}</span>
                )}
              </div>

              <header className="mt-[12px]">
                <div className="text-[16px] font-bold leading-[1.4] text-[#333]">{c.client}</div>
                <h3 className="text-[20px] font-normal leading-[1.35] text-[#333]">
                  <a href={c.href} className="text-[#333] transition-colors hover:text-[#0075C9]">
                    {c.title}
                  </a>
                </h3>
              </header>
            </article>
          ))}
        </div>

      {/* El CTA va centrado a la derecha en la home; en la columna 3/4 del
          monitor el wrapper del original no lleva clase de alineación → izda. */}
      {/* MARCADOR DE SONDA (130.ª) — este div hace de
          `et_pb_button_module_wrapper`, que es el módulo que el original mide
          (el `<a>` de dentro es el `.et_pb_button`, un nivel por debajo). */}
      <div
        data-modulo="button"
        className={
          "flex " +
          // sector: el original deja 25px justos entre la rejilla y el CTA
          // (rejilla acaba en 4707.67 · wrapper del botón en 4732.67)
          (bare
            ? "mt-[25px] justify-end"
            : embedded
              ? "mb-[30px] mt-[46px] justify-start"
              : "mt-10 justify-end md:mt-[91px]")
        }
      >
        <OutlineButton href={ctaHref} external={ctaExternal}>
          {ctaLabel}
        </OutlineButton>
      </div>
    </>
  );

  if (bare) return cards;

  if (embedded) {
    return (
      <div>
        {/* MARCADOR DE SONDA (130.ª) — `.et_pb_text_17` del original. */}
        <BlockTitle dataModulo="text" className="mb-[28px]">
          {title}
        </BlockTitle>
        {cards}
      </div>
    );
  }

  return (
    <section className="relative bg-white pb-[50px] pt-[56px] md:pb-[71px] md:pt-[84px]">
      <div data-fila="" className="mx-auto w-[85%] max-w-[1380px]">
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

        {cards}
      </div>
    </section>
  );
}
