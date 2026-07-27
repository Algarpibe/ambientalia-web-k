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
 */
export function UltimosProyectos({
  title = "Últimos proyectos",
  ctaLabel = "Ver todos los casos de éxito",
  ctaHref = "https://kunakair.com/es/casos-de-exito/",
  embedded = false,
}: {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  embedded?: boolean;
} = {}) {
  const cards = (
    <>
      <div
        className={
          "grid gap-x-[40px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3 " +
          (embedded ? "mt-0" : "mt-[43px]")
        }
      >
          {PROJECTS.map((c) => (
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
      <div
        className={
          "flex " +
          (embedded ? "mt-[35px] justify-start" : "mt-10 justify-end md:mt-[91px]")
        }
      >
        <OutlineButton href={ctaHref}>{ctaLabel}</OutlineButton>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div>
        <BlockTitle className="mb-[28px]">{title}</BlockTitle>
        {cards}
      </div>
    );
  }

  return (
    <section className="relative bg-white pb-[50px] pt-[56px] md:pb-[71px] md:pt-[84px]">
      <div className="mx-auto w-[85%] max-w-[1380px]">
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
