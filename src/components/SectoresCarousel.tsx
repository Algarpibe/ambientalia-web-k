"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { SECTOR_SLIDES } from "@/lib/sectors";

/**
 * `et_pb_section_4` — SectoresSwiper.
 *
 * Configuration copied verbatim from `themes/KunakAir/assets/js/init.js`
 * `sectoresSwiper`:
 *
 *   slidesPerView: 1, spaceBetween: 30, centeredSlides: true, loop: true,
 *   speed: 700, grabCursor: true, slideToClickedSlide: true,
 *   autoplay: { delay: 5000, disableOnInteraction: false },
 *   pagination: { el: '.swiper-pagination', clickable: true },
 *   navigation: { nextEl: ..., prevEl: ... },     // hidden by CSS
 *   breakpoints: {
 *     480: { slidesPerView: 1, spaceBetween: 10 },
 *     640: { slidesPerView: 2, spaceBetween: 20 },
 *     990: { slidesPerView: 3, spaceBetween: 25 },
 *    1500: { slidesPerView: 4, spaceBetween: 30 },
 *   }
 *
 * Non-active slides fade to opacity 0.3 and become non-interactive; the
 * active slide shows a hover overlay in Kunak blue (rgba(0,117,201,0.65))
 * and scales its background image to 1.1x, both in 500ms.
 *
 * `variant="embedded"` = la instancia de /monitor-calidad-aire (#applications),
 * que va dentro de la columna 3/4. El tema la re-estila vía `body.single-solutions`:
 * slides de 400px desde 981 (en vez de 500), icono/título arrancando arriba
 * (`justify-content: flex-start` + padding-top 10% → 30% desde 981), descripción
 * a 1rem y `padding-inline-start: 0` en el swiper (queda solo el pr de 7vw).
 * Spec: docs/research/monitor-calidad-aire/components/reutilizables.spec.md §2a
 */
export function SectoresCarousel({
  variant = "fullwidth",
}: {
  variant?: "fullwidth" | "embedded";
} = {}) {
  const embedded = variant === "embedded";

  return (
    <section
      className={
        "sectoresSwiper-wrapper relative w-full overflow-hidden " + (embedded ? "" : "bg-white")
      }
      style={embedded ? undefined : { paddingBottom: 40 }}
    >
      <Swiper
        className={
          "sectoresSwiper !pb-12 " +
          (embedded ? "sectoresSwiper--embedded !pl-0 !pr-[7vw]" : "!px-[7vw]")
        }
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={30}
        centeredSlides
        loop
        speed={700}
        grabCursor
        slideToClickedSlide
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".sectores-dots" }}
        breakpoints={{
          480: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          990: { slidesPerView: 3, spaceBetween: 25 },
          1500: { slidesPerView: 4, spaceBetween: 30 },
        }}
      >
        {SECTOR_SLIDES.map((s) => (
          <SwiperSlide
            key={s.slug}
            className="!h-[450px] !overflow-hidden !rounded-[10px] sm:!h-[500px]"
          >
            <SectorCard slide={s} embedded={embedded} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination dots — pill-shaped 2rem × 7px */}
      {/* QA 2026-07-26 (embedded): el original pinta los dots a bottom:10 del
          swiper (~28px bajo los slides) — se remontan al hueco del pb-48. */}
      <div
        className={
          "sectores-dots flex items-center justify-center gap-2 " +
          (embedded ? "-mt-[24px]" : "mt-6")
        }
      />

      <style jsx global>{`
        .sectoresSwiper .swiper-wrapper {
          --swiper-wrapper-transition-timing-function: ease-in-out;
        }
        .sectoresSwiper .swiper-slide {
          opacity: 0.3;
          transition: opacity 0.5s ease;
        }
        .sectoresSwiper .swiper-slide.swiper-slide-active {
          opacity: 1;
        }
        .sectoresSwiper .swiper-slide:not(.swiper-slide-active) a {
          pointer-events: none;
        }

        /* Custom cursors on adjacent slides */
        .sectoresSwiper .swiper-slide-next {
          cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2036%2031%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M35.4%2C16.4l-13.1%2C13.9c-.3.3-.7.4-1%2C.4s-.6-.1-.9-.3c-.5-.5-.6-1.3%2C0-1.8l11.1-11.8H1.6c-.7%2C0-1.3-.6-1.3-1.2s.6-1.3%2C1.3-1.3h29.8L20.3%2C2.4c-.5-.5-.4-1.3%2C0-1.8.5-.5%2C1.4-.4%2C1.9%2C0l13.1%2C13.9c.5.5.5%2C1.2%2C0%2C1.7Z%22/%3E%3C/svg%3E")
            6 15, pointer;
        }
        .sectoresSwiper .swiper-slide-prev {
          cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2036%2031%22%3E%3Cg%20transform%3D%22scale%28-1%2C1%29%20translate%28-36%2C0%29%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M35.4%2C16.4l-13.1%2C13.9c-.3.3-.7.4-1%2C.4s-.6-.1-.9-.3c-.5-.5-.6-1.3%2C0-1.8l11.1-11.8H1.6c-.7%2C0-1.3-.6-1.3-1.2s.6-1.3%2C1.3-1.3h29.8L20.3%2C2.4c-.5-.5-.4-1.3%2C0-1.8.5-.5%2C1.4-.4%2C1.9%2C0l13.1%2C13.9c.5.5.5%2C1.2%2C0%2C1.7Z%22/%3E%3C/g%3E%3C/svg%3E")
            30 15, pointer;
        }
        .sectoresSwiper .swiper-slide:not(.swiper-slide-prev):not(.swiper-slide-next):not(.swiper-slide-active) {
          cursor: default;
        }

        /* La altura de 400px de la variante embebida vive en globals.css: tiene
           que ir en la capa utilities para ganar al !important de Tailwind. */

        /* Pagination bullets: pill 2rem × 7px */
        .sectores-dots .swiper-pagination-bullet {
          width: 2rem;
          height: 7px;
          display: inline-block;
          border-radius: 5px;
          background: transparent;
          border: 1px solid #000;
          opacity: 0.2;
          margin: 0 4px;
          cursor: pointer;
          transition: opacity 0.2s, background-color 0.2s;
        }
        .sectores-dots .swiper-pagination-bullet-active {
          opacity: 1;
          background: #0075c9;
          border-color: #0075c9;
        }
      `}</style>
    </section>
  );
}

function SectorCard({
  slide,
  embedded = false,
}: {
  slide: typeof SECTOR_SLIDES[number];
  embedded?: boolean;
}) {
  return (
    <div className="sector-imagen-wrap absolute inset-0 h-[450px] w-full overflow-hidden rounded-[10px] sm:h-[500px]">
      <a
        href={slide.href}
        className={
          "sector-imagen group relative flex h-full w-full flex-col items-center overflow-hidden bg-black " +
          (embedded ? "justify-start pb-0 pt-[10%] min-[981px]:pt-[30%]" : "justify-center")
        }
        style={{
          backgroundImage: `url('${slide.bg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "all 0.5s",
          ...(embedded ? null : { paddingBottom: "30%" }),
        }}
      >
        {/* Overlay ::before — starts dark, hover becomes Kunak blue */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            transition: "background-color 0.5s ease-in-out",
          }}
        />
        <img
          src={slide.icon}
          alt=""
          aria-hidden
          className="relative z-[1]"
          style={{
            width: 60,
            height: 60,
            filter: "brightness(0) invert(1)",
          }}
        />
      </a>

      <div
        className="sector-content absolute inset-x-0 bottom-0 z-[2] px-4 pt-12 pb-4 text-white"
        style={{
          background: "linear-gradient(0deg, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <h3
          className="text-white"
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-0.3px",
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h3>
        {/* embebido: el tema sube la descripción a 1rem en single-solutions */}
        <div
          className={
            "sector-descripcion mt-2 pb-3 leading-[1.5] text-white " +
            (embedded ? "text-[16px]" : "text-[14.5px]")
          }
        >
          {slide.description}
        </div>
        <a
          href={slide.href}
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-white transition-opacity hover:opacity-80"
        >
          Ver más <span>→</span>
        </a>
      </div>

      <style jsx>{`
        .sector-imagen-wrap:hover .sector-imagen {
          transform: scale(1.1);
        }
        .sector-imagen-wrap:hover .sector-imagen > span {
          background-color: rgba(0, 117, 201, 0.65) !important;
        }
      `}</style>
    </div>
  );
}
