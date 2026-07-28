"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CARRUSEL_FUNDIDO_MS,
  CARRUSEL_INTERVALO_MS,
  DIAPOSITIVAS,
  type Diapositiva,
} from "@/lib/software";

/**
 * S1 · fila 2, columna 2/3 — carrusel de 9 capturas con autoplay.
 * Spec: docs/research/software/components/carrusel-capturas.spec.md
 *
 * Es LA ÚNICA pieza time-driven de la página (BEHAVIORS §1). Valores medidos en
 * vivo el 2026-07-27 a 1280:
 *   · caja 500px de alto, borde 22px #eee, radius 32, sombra 0 0 5px rgba(0,0,0,.3)
 *   · fondo por `background-image` (no <img>) + velo rgba(0,0,0,.3) a sangre
 *   · título 30px/30 fw700 blanco centrado, pb 10, text-shadow 0 1px 3px
 *   · ciclo de 6000 ms (5 s de reposo del `et_slider_speed_5000` + 1 s de
 *     fundido) — NO los 3,5 s que estimó el recon
 *   · transición: FUNDIDO CRUZADO (ambas diapositivas con left:0 y sin
 *     transform; la entrante sube de opacity 0 a 1)
 *
 * Flechas y puntos replicados EXACTAMENTE:
 *   · flechas 48×48 blancas centradas, `opacity 0 / left|right -22px` en reposo
 *     y `opacity 1 / 22px` al pasar el ratón por el módulo, con transición
 *     0.2s ease-in-out. En el original el disparador es la clase
 *     `et_slider_hovered` que Divi añade por JS; aquí basta `group-hover`.
 *   · puntos 7×7 radius 7 `rgba(255,255,255,.5)`, separación 10 (el último a 0),
 *     opacidad .5 → 1 en el activo, contenedor absoluto a `bottom: 20px`
 *     centrado sobre el ancho de la diapositiva.
 */
export function CarruselCapturas({
  slides = DIAPOSITIVAS,
  intervalMs = CARRUSEL_INTERVALO_MS,
}: {
  slides?: Diapositiva[];
  intervalMs?: number;
} = {}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
  }, [intervalMs, slides.length]);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  // El original NO pausa el autoplay al usar los controles: reinicia la cuenta.
  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
      restart();
    },
    [restart, slides.length]
  );

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Qué permite hacer Kunak AIR Cloud"
      className="group relative mb-[27.82px] h-[500px] w-full overflow-hidden rounded-[32px] border-[22px] border-[#eee]"
      style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.3)" }}
    >
      {slides.map((s, i) => (
        <div
          key={s.imagen}
          aria-hidden={i !== index}
          // `h-[500px]` y NO `inset-0`: en el original el slide mide 500 dentro
          // de una caja interior de 456, así que 44px se recortan por abajo y el
          // título queda algo por debajo del centro visible. Es fiel.
          className="absolute inset-x-0 top-0 h-[500px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${s.imagen}')`,
            opacity: i === index ? 1 : 0,
            transition: `opacity ${CARRUSEL_FUNDIDO_MS}ms ease-in-out`,
            // la saliente queda por encima mientras se funde, como el original
            zIndex: i === index ? 1 : 0,
          }}
        >
          {/* velo `et_pb_slide_overlay_container` */}
          <div aria-hidden className="absolute inset-0 bg-black/30" />
          {/* caja de descripción Divi: padding 16%/8% y margin auto */}
          <div className="relative flex h-full w-full items-center justify-center px-[8%] py-[16%]">
            <h3
              className="pb-[10px] text-center text-[30px] font-bold leading-[30px] text-white"
              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
            >
              {s.titulo}
            </h3>
          </div>
        </div>
      ))}

      {/* Flechas: invisibles y 22px fuera de caja hasta el hover del módulo */}
      <button
        type="button"
        aria-label="Diapositiva anterior"
        onClick={() => goTo(index - 1)}
        className="absolute z-[100] -ml-[22px] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white opacity-0 transition-all duration-200 ease-in-out group-hover:ml-[22px] group-hover:opacity-100"
        style={{ top: 228, left: 0 }}
      >
        <ChevronLeft size={48} strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Diapositiva siguiente"
        onClick={() => goTo(index + 1)}
        className="absolute z-[100] -mr-[22px] flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-white opacity-0 transition-all duration-200 ease-in-out group-hover:mr-[22px] group-hover:opacity-100"
        style={{ top: 228, right: 0 }}
      >
        <ChevronRight size={48} strokeWidth={2} aria-hidden />
      </button>

      {/* Puntos: siempre visibles, centrados a 20px del borde inferior */}
      <div className="absolute bottom-[20px] left-0 z-10 w-full text-center leading-[30.6px]">
        {slides.map((s, i) => (
          <button
            key={s.imagen}
            type="button"
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => goTo(i)}
            className={
              "inline-block h-[7px] w-[7px] cursor-pointer rounded-[7px] border-0 p-0 align-middle transition-opacity duration-200 " +
              (i === index ? "opacity-100" : "opacity-50")
            }
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              // el original deja el último sin margen (los 9 suman 143px)
              marginRight: i === slides.length - 1 ? 0 : 10,
            }}
          />
        ))}
      </div>
    </div>
  );
}
