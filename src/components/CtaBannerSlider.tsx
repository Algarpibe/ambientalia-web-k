"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LightButton } from "./SectionRow";
import type { SectorCtaSlide } from "@/lib/sectores";

/**
 * CTA de ancho completo con VARIAS diapositivas y autoplay — la fusión de la
 * **piel** de `CtaBanner` con el **motor** de `software/CarruselCapturas`.
 * Spec: docs/research/sectores/components/cta-banner-slider.spec.md
 *
 * `CtaBanner` sirve una sola diapositiva sin autoplay y no vale aquí;
 * `CarruselCapturas` tiene el motor exacto (fundido cruzado, flechas 48×48 a
 * `opacity 0 / ±22px` reveladas por `group-hover`, dots 7×7 a `bottom: 20`)
 * pero con la caja de las capturas de /software. Esto junta las dos.
 *
 * Cadencia medida en vivo: **7000 ms** (`et_slider_speed_7000`).
 * Alto: 401.56 desktop / 265.06 móvil. El título ES un enlace, al mismo
 * destino que el botón.
 *
 * En móvil las flechas del original son **visibles siempre** (`opacity: 1`,
 * `left/right: 0`), no aparecen al hover.
 */
const FUNDIDO_MS = 1000;

export function CtaBannerSlider({
  slides,
  intervalMs = 7000,
  label = "Llamadas a la acción",
}: {
  slides: SectorCtaSlide[];
  intervalMs?: number;
  label?: string;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
  }, [intervalMs, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart, slides.length]);

  // Como en `CarruselCapturas`: usar los controles no pausa, reinicia la cuenta.
  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
      restart();
    },
    [restart, slides.length]
  );

  return (
    <section className="w-full bg-white">
      <div
        role="region"
        aria-roledescription="carrusel"
        aria-label={label}
        className="group relative w-full overflow-hidden"
      >
        {slides.map((s, i) => (
          <div
            key={s.image}
            aria-hidden={i !== index}
            className={
              "w-full bg-cover bg-center px-[6%] " +
              (i === index ? "relative" : "pointer-events-none absolute inset-0")
            }
            style={{
              backgroundImage: `url('${s.image}')`,
              backgroundColor: "rgba(0, 0, 0, 0.33)",
              backgroundBlendMode: "multiply",
              opacity: i === index ? 1 : 0,
              transition: `opacity ${FUNDIDO_MS}ms ease-in-out`,
              zIndex: i === index ? 1 : 0,
            }}
          >
            {/* Descripción Divi: móvil pt 34.31 / pb 51.47; desktop py 76.03
                (18.94%) y la copy en la mitad derecha (pl 49%). */}
            <div className="mx-auto max-w-[1380px] pb-[51.4688px] pt-[34.3125px] text-left md:py-[76.0312px] md:pl-[49%]">
              <h2 className="pb-[10px] text-[27px] font-light leading-[35.1px] tracking-[-0.5px] text-white md:text-[45px] md:leading-[58.5px]">
                <a href={s.cta.href} className="text-white no-underline">
                  {s.heading}
                </a>
              </h2>

              <LightButton href={s.cta.href} className="mt-[20px]">
                {s.cta.label}
              </LightButton>
            </div>
          </div>
        ))}

        {slides.length > 1 ? (
          <>
            {/* Flechas: en móvil visibles y pegadas al borde; en desktop
                invisibles a −22px hasta que el ratón entra en el módulo. */}
            <button
              type="button"
              aria-label="Diapositiva anterior"
              onClick={() => goTo(index - 1)}
              className="absolute left-0 top-1/2 z-[100] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white transition-all duration-200 ease-in-out md:-ml-[22px] md:opacity-0 md:group-hover:ml-[22px] md:group-hover:opacity-100"
            >
              <ChevronLeft size={48} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Diapositiva siguiente"
              onClick={() => goTo(index + 1)}
              className="absolute right-0 top-1/2 z-[100] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white transition-all duration-200 ease-in-out md:-mr-[22px] md:opacity-0 md:group-hover:mr-[22px] md:group-hover:opacity-100"
            >
              <ChevronRight size={48} strokeWidth={2} aria-hidden />
            </button>

            {/* Dots: 7×7, separación 10 (el último a 0), bottom 13.25 / 20 */}
            <div className="absolute inset-x-0 bottom-[13.25px] z-[100] text-center md:bottom-[20px]">
              {slides.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === index || undefined}
                  onClick={() => goTo(i)}
                  className="mr-[10px] inline-block h-[7px] w-[7px] cursor-pointer rounded-[7px] border-0 bg-white p-0 align-middle last:mr-0"
                  style={{ opacity: i === index ? 1 : 0.5 }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
