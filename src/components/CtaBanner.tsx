import { LightButton, OutlineButton } from "./SectionRow";

/**
 * Shared full-width CTA banner — Divi `et_pb_fullwidth_slider` with a single
 * slide (no arrows / dots / autoplay). Used by the two dark photo banners on
 * the home: "¿Estás inmerso…?" (section 6) and "¿Te preocupa…?" (section 11),
 * y por el S2 de /monitor-calidad-aire ("No se puede mejorar…").
 *
 * Specs:
 *   docs/research/components/cta-inmerso.spec.md
 *   docs/research/components/cta-preocupa.spec.md
 *   docs/research/monitor-calidad-aire/components/reutilizables.spec.md §1
 *
 * Background: cover photo + `rgba(0,0,0,0.33)` with `mix-blend-mode: multiply`.
 * Copy lives in the right half on desktop (padding-left ≈ 49%), left-aligned.
 *
 * Variantes de /monitor-calidad-aire (todas opcionales, la home no cambia):
 * `align="left"` mueve la copy a la mitad izquierda (`padding-right: 31%`, y 0
 * por debajo de 981 como en el original), `body` añade el párrafo bajo el H2,
 * `headingHref` enlaza el título y `buttonVariant="outline"` pinta el botón
 * #333 en vez del blanco (el slider de S2 no es `bg_layout_dark`, así que el
 * tema le deja el botón por defecto pese a ir sobre foto).
 */
export function CtaBanner({
  image,
  heading,
  buttonLabel,
  buttonHref,
  bottomGapClassName = "",
  align = "right",
  body,
  headingHref,
  buttonVariant = "light",
  padYClassName,
}: {
  image: string;
  heading: string;
  buttonLabel: string;
  buttonHref: string;
  /** White space below the photo, inside the section (Divi slider margin). */
  bottomGapClassName?: string;
  align?: "left" | "right";
  /** Párrafo bajo el título (S2: la cita de Snyder cierra este texto). */
  body?: string;
  /** Si se pasa, el título se pinta como enlace (blanco, sin subrayado). */
  headingHref?: string;
  buttonVariant?: "light" | "outline";
  /**
   * Padding vertical de la descripción en desktop. Por defecto se deriva de
   * `body` (74px fijos sin párrafo — la home; 5% con él — S2 del monitor), pero
   * el S2 de /software usa **5% sin párrafo** (medido: 55.65 a cw 1264.7), así
   * que necesita decirlo explícitamente.
   */
  padYClassName?: string;
}) {
  const isLeft = align === "left";
  const padY = padYClassName ?? (body ? "md:py-[5%]" : "md:py-[74px]");

  return (
    <section className={"w-full bg-white " + bottomGapClassName}>
      <div
        className="relative w-full bg-cover bg-center px-[6%]"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundColor: "rgba(0, 0, 0, 0.33)",
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Móvil: slide description Divi pt 34.3 / pb 51.5 (10% / 15% de 343).
            align="left": pr 31% solo desde 981 (el original lo anula a ≤980).
            Desktop: la home usa 74px fijos (verificado); la variante con `body`
            (S2 de monitor) usa el 5% global de Divi (56.3 a 1280 — QA 26-07). */}
        <div
          className={
            "mx-auto max-w-[1380px] pb-[51px] pt-[34px] text-left " +
            padY +
            " " +
            (isLeft ? "min-[981px]:pr-[31%]" : "md:pl-[49%]")
          }
        >
          {/* Peso responsive Divi: 500 en móvil, 300 en desktop */}
          <h2
            className={
              "text-[27px] font-medium text-white md:text-[45px] md:font-light " +
              // el pb 10 del h3 solo se ve cuando hay párrafo debajo
              (body ? "pb-[10px]" : "pb-[10px] md:pb-0")
            }
            style={{
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
            }}
          >
            {headingHref ? (
              <a href={headingHref} className="text-white no-underline">
                {heading}
              </a>
            ) : (
              heading
            )}
          </h2>

          {/* QA 2026-07-26: el párrafo baja a 14px/22.4 en móvil (computed a 390). */}
          {body ? (
            <p className="text-[14px] leading-[22.4px] text-white md:text-[20px] md:leading-[32px]">
              {body}
            </p>
          ) : null}

          {/* Botón: margin-top 20px del original; la home sube a 32 en desktop
              porque allí no hay párrafo intermedio. */}
          {buttonVariant === "outline" ? (
            <OutlineButton href={buttonHref} className="mt-[20px]">
              {buttonLabel}
            </OutlineButton>
          ) : (
            <LightButton href={buttonHref} className={body ? "mt-[20px]" : "mt-[20px] md:mt-8"}>
              {buttonLabel}
            </LightButton>
          )}
        </div>
      </div>
    </section>
  );
}
