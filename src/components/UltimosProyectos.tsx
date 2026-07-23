import { PROJECTS } from "@/lib/projects";
import { SectionTitle, OutlineButton } from "./SectionRow";

/**
 * `et_pb_section_10` — "Últimos proyectos" (3 case-study cards).
 * Images are `background-image` layers that scale 1.1× on hover.
 * "Ver todos los casos de éxito" maps to the ES case-studies page.
 * Spec: docs/research/components/ultimos-proyectos.spec.md
 */
export function UltimosProyectos() {
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
          <SectionTitle>Últimos proyectos</SectionTitle>
        </div>

        <div className="mt-[43px] grid gap-x-[40px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-10 flex justify-end md:mt-[91px]">
          <OutlineButton href="https://kunakair.com/es/casos-de-exito/">
            Ver todos los casos de éxito
          </OutlineButton>
        </div>
      </div>
    </section>
  );
}
