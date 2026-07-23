import { ARTICLES } from "@/lib/articles";
import { SectionTitle, BlueButton } from "./SectionRow";

/**
 * `et_pb_section_9` — "Últimos artículos" (3-card blog grid).
 * Cards zoom their image 1.1× on hover; titles turn blue on hover.
 * Spec: docs/research/components/ultimos-articulos.spec.md
 */
export function UltimosArticulos() {
  return (
    <section
      className="relative bg-white bg-no-repeat pb-[60px] pt-[56px] md:pb-[101px] md:pt-[84px]"
      style={{
        backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
        backgroundPosition: "0% 0%",
      }}
    >
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
          <SectionTitle>Últimos artículos</SectionTitle>
        </div>

        {/* −10 compensa el pb-[10px] que ahora lleva SectionTitle (regla Divi h2) */}
        <div className="mt-[33px] grid gap-x-[40px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((post) => (
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
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[#333]">{post.date}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-end md:mt-[80px]">
          <BlueButton href="https://kunakair.com/es/recursos/guias/">
            Amplia tus conocimientos con nuestras guías
          </BlueButton>
        </div>
      </div>
    </section>
  );
}
