"use client";

import { useState } from "react";
import { OutlineButton, BlueButton } from "@/components/SectionRow";
import {
  TRIALS_GALLERY,
  TRIALS_RESULTS,
  CO_LOCATION_FULL_PDF,
  PRECISION_HELP_HREF,
} from "@/lib/monitor";

/**
 * S3 · #trials-test — "Ensayos y pruebas": botón→PDF + galería-slider + lista
 * de resultados + CTA.
 * Spec: docs/research/monitor-calidad-aire/components/galeria-ensayos.spec.md
 *
 * ⚠️ El "título del estudio completo" es en realidad un BOTÓN outline → PDF.
 * Galería: marco tipo tablet (border 32px #eee, radius 17, sombra hairline),
 * 9 gráficas con crossfade ~400ms (solo la activa visible), flechas que
 * aparecen deslizándose al hover del slider, 9 dots clicables. `loading=eager`
 * + aspect-ratio fijo para evitar CLS (la galería lazy del original colapsa).
 */
export function GaleriaEnsayos() {
  const [active, setActive] = useState(0);
  const n = TRIALS_GALLERY.length;
  const go = (delta: number) => setActive((a) => (a + delta + n) % n);

  return (
    <div>
      <h2
        className="pb-[10px]"
        style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Ensayos y pruebas
      </h2>

      {/* Botón outline → PDF del estudio de co-ubicación completo */}
      <div className="mb-[30px]">
        <OutlineButton href={CO_LOCATION_FULL_PDF}>
          Kunak AIR Pro: Estudio de campo de co-ubicación (completo)
        </OutlineButton>
      </div>

      {/* Galería-slider en marco "tablet" */}
      <div
        className="group relative max-w-[660px] overflow-hidden rounded-[17px]"
        style={{ boxShadow: "0 0 1px #333" }}
      >
        <div className="border-[32px] border-[#eee]">
          <div className="relative aspect-[5/3] w-full">
            {TRIALS_GALLERY.map((img, i) => (
              <img
                key={img.src}
                src={img.src}
                alt={i === active ? img.alt : ""}
                aria-hidden={i !== active}
                loading="eager"
                draggable={false}
                className={
                  "absolute inset-0 h-full w-full object-contain transition-opacity duration-[400ms] " +
                  (i === active ? "z-[1] opacity-100" : "z-0 opacity-0")
                }
              />
            ))}
          </div>
        </div>

        {/* Flechas ‹ › — ocultas fuera del marco, entran al hover del slider */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Gráfica anterior"
          className="absolute left-[-22px] top-1/2 z-[100] -mt-[24px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[48px] leading-none text-[#333] opacity-0 transition-all duration-200 ease-in-out group-hover:left-[22px] group-hover:opacity-100"
        >
          ❮
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Gráfica siguiente"
          className="absolute right-[-22px] top-1/2 z-[100] -mt-[24px] flex h-[48px] w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[48px] leading-none text-[#333] opacity-0 transition-all duration-200 ease-in-out group-hover:right-[22px] group-hover:opacity-100"
        >
          ❯
        </button>

        {/* Dots — sobre la franja gris inferior del marco */}
        <div className="absolute bottom-[9px] left-0 z-[10] w-full text-center leading-none">
          {TRIALS_GALLERY.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver gráfica ${i + 1} de ${n}`}
              aria-current={i === active}
              className={
                "mr-[10px] inline-block h-[7px] w-[7px] cursor-pointer rounded-[7px] border-0 p-0 align-middle last:mr-0 " +
                (i === active ? "bg-[#333] opacity-100" : "bg-black/30 opacity-50")
              }
            />
          ))}
        </div>
      </div>

      {/* Resultado de las pruebas — H3 32px + lista a 2 columnas de PDFs */}
      <h3
        className="pb-[10px] pt-[30px]"
        style={{ fontSize: 32, lineHeight: "32px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Resultado de las pruebas
      </h3>
      <ul className="list-none columns-2 p-0">
        {TRIALS_RESULTS.map((r) => (
          <li key={r.label} className="mb-[6px] break-inside-avoid text-[18px] leading-[26px]">
            <a
              href={r.href}
              target="_blank"
              rel="noopener"
              className="text-[#333] no-underline hover:text-[#0075C9]"
            >
              <strong className="font-bold">
                {r.segs.map((s, i) => (s.sub ? <sub key={i}>{s.t}</sub> : <span key={i}>{s.t}</span>))}
              </strong>{" "}
              Estudio de campo en coubicación
            </a>
          </li>
        ))}
      </ul>

      {/* CTA azul centrado */}
      <div className="mt-[24px] flex justify-center">
        <BlueButton href={PRECISION_HELP_HREF} external>
          ¿Cómo asegura Kunak la mejor precisión?
        </BlueButton>
      </div>
    </div>
  );
}
