import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { FaqAcordeon } from "@/components/monitor/FaqAcordeon";
import { AnchorNav } from "@/components/AnchorNav";
import { AccesorioCard } from "@/components/AccesorioCard";
import { BlueButton } from "@/components/SectionRow";
import {
  ACCESORIO_CATEGORIAS,
  ACCESORIOS_ARTICLES,
  BREADCRUMB,
  HERO,
  INTRO_HEADING,
  INTRO_HEADING_ID,
  INTRO_LEFT,
  INTRO_RIGHT_ITEMS,
  INTRO_RIGHT_LEAD,
} from "@/lib/accesorios";

export const metadata: Metadata = {
  title: "Accesorios para sensores de calidad del aire | Kunak",
  description:
    "Accesorios para las estaciones Kunak AIR: paneles solares, cargadores y sondas meteorológicas (anemómetros, pluviómetro, sonómetro, piranómetro, WBGT y Gashood).",
};

/**
 * /accesorios — arquetipo CATÁLOGO (CPT solutions, id 26481).
 * Topología: docs/research/accesorios/PAGE_TOPOLOGY.md
 * Comportamientos: docs/research/accesorios/BEHAVIORS.md
 *
 * NO es una rejilla de tarjetas: es un catálogo long-form de 2 categorías, cada
 * una con una columna sticky de anclas (1/4) + una pila de fichas (3/4). Sin
 * filtros, tabs, paginación ni buscador — la única navegación es el scrollspy.
 *
 * Reutiliza: HeaderNav · Footer template="tb" · ScrollToTop · FaqAcordeon
 * (19/19 preguntas idénticas al monitor) · UltimosArticulos variante "monitor"
 * · AnchorNav (compartido con el sub-nav del monitor) · BlueButton.
 *
 * Móvil ARREGLADO respecto al original (decisión 2026-07-27): imagen apilada
 * sobre el título (el original parte el h3 letra a letra) y tablas con scroll
 * horizontal (el original las recorta y oculta la 4ª columna). Desktop 100%
 * fiel. Ver los specs de AccesorioCard y SpecTable.
 */
export default function AccesoriosPage() {
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* Cabecera TB: franja foto tras el header transparente (mismo patrón
            que /monitor-calidad-aire: 137px con hamburguesa, 177 desde lg). */}
        <div
          aria-hidden
          className="h-[137px] w-full bg-cover bg-center lg:h-[177px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(71,71,71,0.17), rgba(71,71,71,0)), url('/images/uploads/2023/10/cabecera-puerto.jpg')",
          }}
        />

        {/* --- S0 · Breadcrumb --- */}
        <nav aria-label="Migas de pan" className="bg-white">
          <div className="mx-auto w-[80%] max-w-[1380px] py-[12px] text-[12px] leading-[26px]">
            <ol className="kunak-breadcrumbs flex flex-wrap items-center gap-1 text-[#0075C9]">
              {BREADCRUMB.map((b, i) => (
                <li key={b.label} className="contents">
                  {i > 0 ? <span aria-hidden>/</span> : null}
                  {b.href ? (
                    <a href={b.href} className="text-[#0075C9] hover:underline">
                      {b.label}
                    </a>
                  ) : (
                    <span aria-current="page">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* --- S1 · hero + intro + catálogo (watermark K de sección) --- */}
        <section
          className="relative bg-white bg-no-repeat pt-[50px] lg:pt-[4vw]"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 50%",
          }}
        >
          {/* Fila 1 — hero. Columnas Divi 3/5 + 2/5 con gutter 5.5%. */}
          <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pt-[30px] md:flex-row md:items-start md:gap-[5.5%] lg:pt-[2vw]">
            <div className="relative w-full md:w-[57.75%]">
              <img
                src="/images/uploads/2022/12/punteado.svg"
                alt=""
                aria-hidden
                width={60}
                height={22}
                // QA: en el original el punteado cuelga 65px a la IZQUIERDA de la
                // columna (medido l=61.5 con la retícula empezando en 126.5).
                className="absolute -top-[26px] left-0 md:-left-[65px]"
              />
              {/* Inversión tipográfica del original: el <p> es el titular
                  visual (50px/fw800) y el <h1> va debajo a 23px/fw300. */}
              <p className="text-[50px] font-extrabold leading-[60px] text-[#333]">{HERO.kicker}</p>
              {/* pb-[10px]: regla Divi de titulares, presente en TODOS los h1/h2
                  del original (QA 2026-07-27; ya la tenían el h3 de ficha y el FAQ). */}
              <h1 className="pb-[10px] pl-[10px] text-[23px] font-light leading-[23px] text-[#333]">
                {HERO.h1}
              </h1>
              {/* md:w-[80%]: el módulo de texto del original mide 467.8 dentro de
                  una columna de 584.8 → el titular envuelve a 4 líneas, no a 3. */}
              <h2
                id={HERO.h2Id}
                className="mt-[32px] pb-[10px] pl-[10px] text-[44px] font-light leading-[55px] text-[#333] md:w-[80%]"
              >
                {HERO.h2}
              </h2>
              <div className="mt-[30px]">
                <BlueButton href={HERO.ctaHref}>{HERO.ctaLabel}</BlueButton>
              </div>
            </div>

            <div className="w-full md:w-[36.75%]">
              <img
                src={HERO.image.src}
                alt={HERO.image.alt}
                width={HERO.image.width}
                height={HERO.image.height}
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Fila 2 — "Información sobre el producto" */}
          <div className="relative mx-auto w-[80%] max-w-[1380px] pt-[64px]">
            <img
              src="/images/uploads/2022/12/punteado.svg"
              alt=""
              aria-hidden
              width={60}
              height={22}
              className="absolute top-[24px] left-0 md:-left-[65px]"
            />
            <h2
              id={INTRO_HEADING_ID}
              className="pb-[10px] pl-[10px] text-[44px] font-light leading-[55px] text-[#333]"
            >
              {INTRO_HEADING}
            </h2>
          </div>

          {/* Fila 3 — intro a dos columnas 1/2 + 1/2 */}
          <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pt-[32px] md:flex-row md:items-start md:gap-[5.5%]">
            <div className="w-full text-[18px] leading-[30.6px] text-[#333] md:w-[47.25%]">
              {INTRO_LEFT.map((p) => (
                <p key={p.slice(0, 40)} className="pb-[18px]">
                  {p}
                </p>
              ))}
            </div>
            <div className="w-full text-[18px] leading-[30.6px] text-[#333] md:w-[47.25%]">
              <p className="pb-[18px]">{INTRO_RIGHT_LEAD}</p>
              <ul className="list-disc pl-[24px]">
                {INTRO_RIGHT_ITEMS.map((li) => (
                  <li key={li.slice(0, 40)} className="pb-[18px]">
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Filas 4 y 5 — una por categoría: anclas sticky (1/4) + fichas (3/4) */}
          {ACCESORIO_CATEGORIAS.map((cat) => (
            <div
              key={cat.heading}
              className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pt-[64px] md:flex-row md:gap-[5.5%]"
            >
              {/* Columna 1/4 — título de categoría + caja de anclas sticky.
                  `self-start` es imprescindible: si el flex item se estira a la
                  altura de la fila, el sticky nunca llega a pegarse. */}
              <aside className="columna-lista-anclas w-full md:w-[20.875%] md:shrink-0 md:self-start md:sticky md:top-[70px] md:pt-[32px]">
                <div className="relative">
                  <img
                    src="/images/uploads/2022/12/punteado.svg"
                    alt=""
                    aria-hidden
                    width={60}
                    height={22}
                    className="absolute -top-[32px] -left-[65px] hidden md:block"
                  />
                  {/* mb 27.9: hueco medido entre el h2 y la caja de anclas del
                      original (el 32 anterior venía de una estimación). */}
                  <h2 className="mb-[27.9px] pb-[10px] pl-[10px] text-[32px] font-light leading-[40px] text-[#333]">
                    {cat.heading}
                  </h2>
                </div>
                {/* offset 80: el original aterriza el bloque a 80px del viewport */}
                <AnchorNav
                  items={cat.items.map((i) => ({ id: i.slug, label: i.navLabel }))}
                  scrollOffset={80}
                />
              </aside>

              {/* Columna 3/4 — entradilla opcional + fichas.
                  `min-w-0`: sin él, el min-width:auto del flex item impide
                  encoger por debajo del min-content de las tablas. */}
              <div className="w-full min-w-0 md:flex-1">
                {cat.intro?.length ? (
                  <div className="text-[18px] leading-[30.6px] text-[#333]">
                    {cat.intro.map((p) => (
                      <p key={p.slice(0, 40)} className="pb-[18px]">
                        {p}
                      </p>
                    ))}
                  </div>
                ) : null}

                {cat.items.map((item) => (
                  <AccesorioCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          ))}

          <div className="h-[50px] lg:h-[4vw]" />
        </section>

        {/* --- S2 · Artículos y Guías (el original sortea los 3 posts) --- */}
        <UltimosArticulos
          title="Artículos y Guías"
          posts={ACCESORIOS_ARTICLES}
          variant="monitor"
        />

        {/* --- S3 · Preguntas frecuentes (19 toggles, idénticas al monitor) --- */}
        <FaqAcordeon />
      </main>

      <Footer template="tb" />
      <ScrollToTop />
    </>
  );
}
