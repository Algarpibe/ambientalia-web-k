import type { ReactNode } from "react";
import { BlurbsIconos } from "@/components/BlurbsIconos";
import { VideoLightbox } from "@/components/VideoLightbox";
import { CarruselCapturas } from "@/components/software/CarruselCapturas";
import {
  CARACTERISTICAS,
  INFO,
  INFO_BLOQUE_1,
  INFO_BLOQUE_2,
  INFO_CARACTERISTICAS_LABEL,
  INFO_CIERRE,
  INFO_LEAD_CARRUSEL,
  INFO_LEAD_HERRAMIENTAS,
  INFO_PARRAFO_INTRO,
  INFO_PARRAFO_MODULAR,
  INFO_PARRAFO_SUITE,
} from "@/lib/software";

/**
 * S1 · fila 2 — "Información del producto".
 * Spec: docs/research/software/components/info-producto-software.spec.md
 *
 * Columnas 1/3 + 2/3 (29.6667% / 64.833%, gutter 5.5%), la misma retícula que
 * la fila 2 de /monitor-calidad-aire.
 *
 * Col izq: título `<p>` de 44/55 (no es un h2 en el original), foto de
 * dispositivos y el CTA de vídeo — centrado en desktop, a la izquierda en móvil.
 * Col der: dos bloques de titular azul 37px, los 6 blurbs de característica y
 * el carrusel de 9 capturas. Ritmo Divi: módulos con `margin: 20px 0`
 * (colapsan a 20px entre hermanos, verificado en las anclas medidas).
 *
 * ⚠️ Corrección al recon: PAGE_TOPOLOGY sitúa los 6 blurbs en la columna 1/3;
 * en el DOM están en la 2/3, a 31% + 2% (3 por fila).
 */

/** `last:pb-0`: Divi da `padding-bottom: 1em` a los `<p>` salvo al último de
 *  cada módulo (verificado: el 2º párrafo del módulo mide 122.5 = 4×30.6). */
function BodyP({ children }: { children: ReactNode }) {
  return (
    <p
      className="pb-[18px] text-[18px] leading-[30.6px] text-[#333] last:pb-0"
      style={{ fontWeight: 400 }}
    >
      {children}
    </p>
  );
}

/** Titular azul de 37px con su bajada de 17pt (22.67px), también azul. */
function BloqueAzul({ heading, lead }: { heading: string; lead: string }) {
  return (
    <div>
      <h2
        className="pb-[10px]"
        style={{
          fontSize: 37,
          lineHeight: "37px",
          fontWeight: 300,
          letterSpacing: "-0.5px",
          color: "#0075C9",
        }}
      >
        {heading}
      </h2>
      <p style={{ fontSize: "22.67px", lineHeight: "30.6px", color: "#0075C9", fontWeight: 400 }}>
        {lead}
      </p>
    </div>
  );
}

export function InfoProductoSoftware() {
  return (
    <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] py-[30px] md:flex-row md:items-start md:gap-[5.5%] md:py-[2vw]">
      {/* ---------- Columna 1/3 ---------- */}
      <div className="relative w-full md:w-[29.6667%] md:shrink-0">
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
          style={{ width: 60, height: 22 }}
        />
        {/* en el original es un <p>, no un titular: 44px/55 fw300 en desktop y
            35/43.75 en móvil (≤767), como todos sus titulares */}
        <p
          className="mb-[27.82px] text-[35px] leading-[43.75px] md:text-[44px] md:leading-[55px]"
          style={{ fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
        >
          {INFO.heading}
        </p>

        {/* El original OCULTA esta imagen en móvil (`display: none` medido a
            390), igual que el mástil de /monitor-calidad-aire. */}
        <img
          src={INFO.imagen.src}
          alt={INFO.imagen.alt}
          width={INFO.imagen.width}
          height={INFO.imagen.height}
          className="mb-[27.82px] hidden h-auto w-full md:block"
        />

        {/* CTA de vídeo: `href="#video"` en el original, pero es un LIGHTBOX.
            URL real capturada abriendo el modal el 2026-07-27:
            https://www.youtube.com/embed/sRLe65Enlbs?feature=oembed */}
        <div className="mb-[14.4px] flex justify-start md:justify-center">
          <VideoLightbox
            youtubeId={INFO.videoYoutubeId}
            title={INFO.videoTitle}
            ariaLabel="Vídeo del producto Kunak AIR Cloud"
          >
            <span className="group relative inline-block rounded-[30px] border border-[#333] pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-[#333] transition-all duration-300 hover:pr-[55.5px]">
              {INFO.videoCtaLabel}
              <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px] group-hover:text-[#0075C9]">
                →
              </span>
            </span>
          </VideoLightbox>
        </div>
      </div>

      {/* ---------- Columna 2/3 — ritmo Divi de 20px entre módulos ----------
          `pb-[32.8px]`: remate medido tras el último párrafo del original
          (col4 acaba 32.8px por debajo del cierre del módulo). */}
      <div className="w-full min-w-0 space-y-[20px] pb-[32.8px] pt-[20px] md:w-[64.833%]">
        <BloqueAzul heading={INFO_BLOQUE_1.heading} lead={INFO_BLOQUE_1.lead} />

        <div>
          <BodyP>{INFO_PARRAFO_INTRO}</BodyP>
          <BodyP>
            {INFO_PARRAFO_SUITE.antes}
            <b className="font-bold">{INFO_PARRAFO_SUITE.negrita}</b>
            {INFO_PARRAFO_SUITE.despues}
          </BodyP>
        </div>

        <p style={{ fontSize: "22.67px", lineHeight: "30.6px", color: "#0075C9", fontWeight: 400 }}>
          {INFO_LEAD_HERRAMIENTAS}
        </p>

        <p className="text-[18px] leading-[30.6px] text-[#333]">{INFO_PARRAFO_MODULAR}</p>

        <p className="text-[18px] leading-[30.6px] text-[#333]">{INFO_CARACTERISTICAS_LABEL}</p>

        {/* 6 blurbs de característica: 31% + 2% de margen, 3 por fila.
            El original aplica la regla `.modulo-beneficios` desde 981px; el clon
            mapea ese breakpoint a `md`, igual que monitor/Beneficios.
            Forma compartida con los 12 de /kunak-api → `BlurbsIconos`. */}
        {/* Sin `m-0`: el `space-y` del contenedor pinta su margen con `:where()`
            (especificidad 0) y `m-0` se lo comería, dejando el bloque pegado al
            titular azul siguiente. */}
        <BlurbsIconos items={CARACTERISTICAS} variante="modulo-beneficios" />

        <BloqueAzul heading={INFO_BLOQUE_2.heading} lead={INFO_BLOQUE_2.lead} />

        <p className="text-[18px] leading-[30.6px] text-[#333]">{INFO_LEAD_CARRUSEL}</p>

        <CarruselCapturas />

        <p className="text-[18px] leading-[30.6px] text-[#333]">
          {INFO_CIERRE.antes}
          <a
            href={INFO_CIERRE.enlaceHref}
            target="_blank"
            rel="noopener"
            className="text-[#333] hover:text-[#0075C9]"
          >
            {INFO_CIERRE.enlaceLabel}
          </a>
          {INFO_CIERRE.despues}
        </p>
      </div>
    </div>
  );
}
