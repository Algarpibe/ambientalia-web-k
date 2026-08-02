import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Breadcrumb } from "@/components/Breadcrumb";
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
        <BandaCabecera {...BANDA.producto} foto="/images/uploads/2023/10/cabecera-puerto.jpg" />

        {/* --- S0 · Breadcrumb --- */}
        {/* Unificada sobre el componente base en A-QA1b (2026-08-01): esta
            página tenía una copia a mano sin `font-semibold`, sin
            `tracking-[0.3px]` y **sin el tope de 350** del tema. */}
        <Breadcrumb items={BREADCRUMB} />

        {/* --- S1 · hero + intro + catálogo (watermark K de sección) --- */}
        <section
          className="relative bg-white bg-no-repeat pt-[50px] lg:pt-[4vw]"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 50%",
          }}
        >
          {/* Fila 1 — hero. Columnas Divi 3/5 + 2/5 con gutter 5.5%.
              Sin pt propio: en el original esta fila va a pt 0 en ambos anchos
              (sangría fila→columna 0 medida, C-QA7) — el aire lo pone la
              sección (50/4vw), que ya está arriba. El pt-[30px]/2vw previo era
              el default Divi cableado sin medir: +28.8 @1440 · +30 @390. */}
          <div data-fila="" className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] md:flex-row md:items-start md:gap-[5.5%]">
            <div className="relative w-full md:w-[57.75%]">
              <img
                src="/images/uploads/2022/12/punteado.svg"
                alt=""
                aria-hidden
                width={60}
                height={22}
                // QA: en el original el punteado cuelga 65px a la IZQUIERDA de la
                // columna, TAMBIÉN en móvil (1280: l=61.5 con la retícula en
                // 126.5; 390: l=-26 con la retícula en 39 — el mismo -65).
                className="absolute -top-[26px] -left-[65px]"
              />
              {/* Inversión tipográfica del original: el <p> es el titular
                  visual (50px/fw800) y el <h1> va debajo a 23px/fw300.
                  35px/42 en ≤767 (C-QA7): la regla móvil del kicker, la misma
                  que ya llevan HeroApi y HeroSoftware — faltaba aquí (+18 a 390). */}
              <p className="text-[35px] font-extrabold leading-[42px] text-[#333] md:text-[50px] md:leading-[60px]">{HERO.kicker}</p>
              {/* pb-[10px]: regla Divi de titulares, presente en TODOS los h1/h2
                  del original (QA 2026-07-27; ya la tenían el h3 de ficha y el FAQ). */}
              <h1 className="pb-[10px] text-[23px] font-light leading-[23px] text-[#333]">
                {HERO.h1}
              </h1>
              {/* w-[80%]: el módulo de texto del original es más estrecho que su
                  columna en AMBOS tamaños (467.8/584.8 a 1280; 249.6/312 a 390)
                  → el titular envuelve a 4 líneas, no a 3.
                  Tamaño: 35px en móvil (≤767) y 44 en desktop, con interlínea
                  1.25× — la proporción del original en todos sus h2. */}
              <h2
                id={HERO.h2Id}
                className="mt-[32px] w-[80%] pb-[10px] text-[35px] font-light leading-[1.25] text-[#333] md:text-[44px]"
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
          <div data-fila="" className="relative mx-auto w-[80%] max-w-[1380px] pt-[64px]">
            <img
              src="/images/uploads/2022/12/punteado.svg"
              alt=""
              aria-hidden
              width={60}
              height={22}
              className="absolute top-[24px] -left-[65px]"
            />
            <h2
              id={INTRO_HEADING_ID}
              className="pb-[10px] text-[35px] font-light leading-[1.25] text-[#333] md:text-[44px]"
            >
              {INTRO_HEADING}
            </h2>
          </div>

          {/* Fila 3 — intro a dos columnas 1/2 + 1/2 */}
          <div data-fila="" className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pt-[32px] md:flex-row md:items-start md:gap-[5.5%]">
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
              data-fila=""
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
                    // visible también en móvil: el original lo pinta en las 6
                    // posiciones a 390 (el que desaparece es la caja de anclas,
                    // no el punteado del titular de categoría)
                    className="absolute -top-[32px] -left-[65px]"
                  />
                  {/* mb 27.9 solo en desktop: es el hueco hasta la caja de
                      anclas, que en móvil no existe (allí el h2 va a mb 0).
                      35px en móvil / 32 en desktop: el h2 de Divi es MAYOR en
                      móvil, no menor. */}
                  <h2 className="pb-[10px] text-[35px] font-light leading-[1.25] text-[#333] md:mb-[27.9px] md:text-[32px]">
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
        <FaqAcordeon tituloCompacto />
      </main>

      <Footer tipo="catalogo" />
      <ScrollToTop />
    </>
  );
}
