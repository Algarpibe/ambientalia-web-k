"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { CLIENT_LOGOS } from "@/lib/clients";

/**
 * `banda-clientes` (`et_pb_section_1`) — 35 client logos in a Swiper carousel.
 *
 * Configuration copied verbatim from `themes/KunakAir/assets/js/init.js` (the
 * `.clientesSwiper` block):
 *
 *   slidesPerView: 2, spaceBetween: 30, loop: true, grabCursor: true,
 *   autoplay: { delay: 2500, disableOnInteraction: false },
 *   breakpoints: {
 *     480:  { slidesPerView: 3, spaceBetween: 20 },
 *     640:  { slidesPerView: 4, spaceBetween: 20 },
 *     768:  { slidesPerView: 5, spaceBetween: 40 },
 *     1024: { slidesPerView: 6, spaceBetween: 50 },
 *     1280: { slidesPerView: 6, spaceBetween: 50 },
 *   }
 */
export function TrustBar() {
  return (
    <section
      className="banda-clientes relative"
      style={{ backgroundColor: "#e4e5e5" }}
    >
      <div
        className="mx-auto flex w-[85%] max-w-[1380px] flex-col items-center gap-8 md:flex-row"
        style={{ paddingTop: 30, paddingBottom: 20, minHeight: 153 }}
      >
        {/* Column 1/3 — heading with the decorative dot pattern */}
        <div className="relative w-full md:w-1/3">
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="absolute z-[-1]"
            style={{ top: -10, left: -65 }}
          />
          {/* Móvil 30px (spec: render ~28-30px; el clamp bajaba a 22 y apilaba
              con poco aire — B2). Desktop mantiene el clamp verificado exacto. */}
          <p
            className="text-[30px] text-[#333] md:text-[clamp(22px,1.9vw,30px)]"
            style={{
              fontWeight: 300,
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
            }}
          >
            Con la confianza de empresas líderes
          </p>
        </div>

        {/* Column 2/3 — Swiper carousel */}
        <div className="relative w-full md:w-2/3">
          <Swiper
            className="clientesSwiper"
            modules={[Autoplay]}
            slidesPerView={2}
            spaceBetween={30}
            loop
            grabCursor
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            breakpoints={{
              480: { slidesPerView: 3, spaceBetween: 20 },
              640: { slidesPerView: 4, spaceBetween: 20 },
              768: { slidesPerView: 5, spaceBetween: 40 },
              1024: { slidesPerView: 6, spaceBetween: 50 },
              1280: { slidesPerView: 6, spaceBetween: 50 },
            }}
            style={{ lineHeight: 1 }}
          >
            {CLIENT_LOGOS.map((logo) => (
              <SwiperSlide
                key={logo.title}
                className="!flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.title}
                  title={logo.title}
                  className="mx-auto object-contain"
                  style={{ maxWidth: 200, maxHeight: 80 }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
