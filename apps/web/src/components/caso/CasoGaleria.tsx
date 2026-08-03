"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import type { CasoImagen } from "@/types/kunak";

/**
 * `section.case-galeria` — el carrusel de fotos del caso de éxito.
 *
 * Recon: `docs/research/grupo-C/BEHAVIORS.md` §1. Presente en **48 de 57**
 * casos, de 3 a 15 imágenes (mediana 7) — o sea que **no llevar galería es un
 * estado normal del arquetipo**, no un caso raro: el componente no se monta y
 * la sección no existe.
 *
 * ── La mecánica es PLANTILLA; lo único que es dato son las imágenes ────────
 * El original monta `swiper .casegalerySwiper` con slides que son `<a>` al
 * archivo a tamaño completo (`data-lightbox="roadtrip"`). El carrusel, sus
 * botones y el número de slides visibles no varían de un caso a otro: son del
 * tema. Por eso `galeria` es **media múltiple sin más estructura** y no un
 * bloque con opciones.
 *
 * ── ⚠ Al medir, la galería sale DUPLICADA en el HTML ──────────────────────
 * Swiper clona slides, y además el tema emite la lista dos veces (la copia
 * responsive de `BEHAVIORS.md` §2). Contando nodos salen 14 donde hay 7 y 30
 * donde hay 15. La transcripción de `c-spec.json` se deduplica por `src`
 * **antes** de entrar en el dato — si no, el content type habría nacido con el
 * doble de imágenes y nadie lo habría notado.
 *
 * ── El destino del enlace ──────────────────────────────────────────────────
 * El original enlaza a la imagen **a tamaño completo** (sin el sufijo
 * `-600x600`), que es lo que abre el lightbox. Se conserva el enlace al archivo
 * local; **el lightbox en sí no está implementado** — es C-SB1 en
 * `BEHAVIORS.md` §6, y va anotado en `docs/PENDIENTES-QA.md`, no improvisado.
 */
export function CasoGaleria({ imagenes }: { imagenes: CasoImagen[] }) {
  return (
    <section className="case-galeria mx-auto w-[80%] max-w-[1152px]">
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={1.4}
        breakpoints={{
          768: { slidesPerView: 3, spaceBetween: 20 },
          1080: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="casegalerySwiper"
      >
        {imagenes.map((img) => (
          <SwiperSlide key={img.src}>
            <a
              href={img.src.replace(/-\d+x\d+(\.[a-z]+)$/, "$1")}
              // `target` no: el original tampoco lo pone — el lightbox
              // interceptaba el click y sin él degrada a abrir la foto.
              className="block"
            >
              <img
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="img-responsive w-full"
              />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
