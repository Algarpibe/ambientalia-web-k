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
}) {
  const isLeft = align === "left";

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
            align="left": pr 31% solo desde 981 (el original lo anula a ≤980). */}
        <div
          className={
            "mx-auto max-w-[1380px] pb-[51px] pt-[34px] text-left md:py-[74px] " +
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

          {body ? <p className="text-[20px] leading-[1.6em] text-white">{body}</p> : null}

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
