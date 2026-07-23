"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SectionRow, SectionTitle } from "./SectionRow";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { TESTIMONIALS } from "@/lib/testimonials";

/**
 * Testimonios — Divi's native `et_pb_slider` (NOT a Swiper carousel).
 * Class markers on the original: `et_slider_auto et_slider_speed_7000` →
 * autoplay every 7000 ms with a ~500 ms cross-fade, pause on hover, no dots,
 * blue arrows (`#0075C9`) that turn `#7F8798` on hover.
 *
 * Spec: docs/research/components/testimonios.spec.md
 */
const AUTOPLAY_DELAY = 7000;
const FADE_MS = 500;

export function Testimonios() {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoveredRef = useRef(false);

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (hoveredRef.current) return;
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_DELAY);
  }, [total]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoplay]);

  const next = () => {
    setIndex((i) => (i + 1) % total);
    startAutoplay();
  };
  const prev = () => {
    setIndex((i) => (i - 1 + total) % total);
    startAutoplay();
  };

  return (
    <section
      className="testimonios-section relative bg-white"
      style={{ paddingTop: 28, paddingBottom: 60 }}
    >
      {/* Row 7 — heading */}
      <SectionRow title={<SectionTitle>Testimonios</SectionTitle>}>
        {/* the right column stays visually empty per original layout */}
        <div />
      </SectionRow>

      {/* Row 8 — full-width slider */}
      <div
        className="testimonios relative mx-auto mt-6 w-[85%] max-w-[1080px]"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
        }}
      >
        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="Testimonio anterior"
          className="absolute left-0 top-1/2 z-[3] -translate-y-1/2 text-[#0075C9] transition-colors hover:text-[#7F8798]"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Testimonio siguiente"
          className="absolute right-0 top-1/2 z-[3] -translate-y-1/2 text-[#0075C9] transition-colors hover:text-[#7F8798]"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>

        {/* Stacked slides — crossfade on opacity */}
        <div
          className="relative mx-auto"
          style={{ minHeight: 400, maxWidth: 920 }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              aria-hidden={i !== index}
              className="absolute inset-0 flex flex-col items-center gap-8 px-8 md:flex-row md:items-start md:gap-12"
              style={{
                opacity: i === index ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease`,
                pointerEvents: i === index ? "auto" : "none",
              }}
            >
              {/* Avatar 180×180 circular */}
              <div className="shrink-0" style={{ width: "28%", minWidth: 180 }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={180}
                  height={180}
                  className="mx-auto rounded-full object-cover"
                  style={{ width: 180, height: 180 }}
                />
              </div>

              {/* Description — column-reverse: quote first, author below */}
              <div className="flex flex-1 flex-col-reverse" style={{ width: "70%" }}>
                <div className="mt-6">
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 300,
                      lineHeight: 1.3,
                      letterSpacing: "-0.5px",
                      color: "#0075C9",
                    }}
                  >
                    {t.name}
                    <span
                      className="mt-1 block"
                      style={{ fontSize: 16, color: "#333" }}
                    >
                      {t.role}
                    </span>
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "18.1px",
                    color: "#333",
                    lineHeight: 1.6,
                  }}
                >
                  {t.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
