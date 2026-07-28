import { BlueButton, OutlineButton } from "@/components/SectionRow";
import { HERO } from "@/lib/software";

/**
 * S1 · fila 1 — hero de /software-de-medicion-calidad-del-aire.
 * Spec: docs/research/software/components/hero-software.spec.md
 *
 * Misma inversión tipográfica que /accesorios: el titular VISUAL es el `<p>`
 * de 50px/fw800 y el `<h1>` real va debajo a 23px/fw300. Lo propio de esta
 * página son el claim en versalitas azules (16px/30.6 fw800 #0075C9) y el 2º
 * CTA de la app de Android (enlace externo real, no se localiza).
 *
 * Retícula medida a 1280: fila 80% máx 1380 con py 2%, columnas 47.25% + 47.25%
 * y gutter 5.5%. Sin `padding-left` en los titulares (el original mide 0) y con
 * el `padding-bottom: 10px` de Divi en h1 y h2.
 */
export function HeroSoftware() {
  return (
    // mb 2vw: el original separa fila 1 y fila 2 con el margin-bottom de la
    // fila Divi (25.29 a cw 1264.7), ADEMÁS de los dos paddings de 2vw
    // En móvil Divi fija las filas a 30px (no al 2% del ancho), tanto en el
    // padding como en el margin-bottom de la fila.
    <div className="mx-auto mb-[30px] flex w-[80%] max-w-[1380px] flex-col gap-[30px] py-[30px] md:mb-[2vw] md:flex-row md:items-start md:gap-[5.5%] md:py-[2vw]">
      <div className="relative w-full md:w-[47.25%]">
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          // el punteado cuelga 65px a la izquierda de la retícula, también en
          // móvil (regla verificada en /accesorios, A4)
          className="absolute -top-[26px] -left-[65px]"
        />
        {/* Móvil (≤767): el kicker BAJA a 35px/42 — si no, "Kunak AIR Cloud"
            envuelve a 2 líneas y el hero crece 78px (medido a 390). */}
        <p className="text-[35px] font-extrabold leading-[42px] text-[#333] md:text-[50px] md:leading-[60px]">
          {HERO.kicker}
        </p>
        <h1 className="pb-[10px] text-[23px] font-light leading-[23px] tracking-[-0.5px] text-[#333]">
          {HERO.h1}
        </h1>
        {/* 44px en desktop, 35 en móvil, interlínea 1.25 en ambos (regla Divi).
            Huecos medidos en el original (cw 1264.7): h1→h2 37.4 · h2→claim 6.2
            · claim→CTA 27.8 · CTA→CTA 57.9 (30 del wrapper del 1º + 27.9 entre
            wrappers) · CTA final→fin de columna 14.4. */}
        <h2 className="mt-[37.4px] pb-[10px] text-[35px] font-light leading-[1.25] text-[#333] md:text-[44px]">
          {HERO.h2}
        </h2>
        <p className="mt-[6.2px] mb-[27.81px] text-[16px] font-extrabold leading-[30.6px] text-[#0075C9]">
          {HERO.claim}
        </p>
        <div className="mb-[14.4px] flex flex-col items-start gap-[57.9px]">
          <BlueButton href={HERO.ctaHref}>{HERO.ctaLabel}</BlueButton>
          <OutlineButton href={HERO.appCtaHref} external>
            {HERO.appCtaLabel}
          </OutlineButton>
        </div>
      </div>

      <div className="w-full md:w-[47.25%]">
        <img
          src={HERO.image.src}
          alt={HERO.image.alt}
          width={HERO.image.width}
          height={HERO.image.height}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
