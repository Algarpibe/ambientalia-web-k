"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Reemplaza el modal de vídeo del original (el botón "Descubre cómo funciona"
 * del hero apunta a `#video` y dispara un lightbox con el player de Brightcove).
 *
 * Renderiza el trigger (children = icono + texto, estilo lo pone el caller) y,
 * al pulsarlo, un overlay oscuro con el iframe 16:9. Cierra con ✕, Esc o clic
 * fuera; bloquea el scroll del body mientras está abierto. El iframe se
 * desmonta al cerrar, así que el vídeo se detiene.
 *
 * Fuente parametrizable: por defecto el player Brightcove de la home; pásale
 * `youtubeId` (p.ej. "tuTfw6KIvd4" en /monitor-calidad-aire) o un `src`
 * completo para otro proveedor.
 */
const VIDEO_SRC =
  "https://players.brightcove.net/4684385811001/default_default/index.html?videoId=6361248610112";

export function VideoLightbox({
  children,
  className,
  src,
  youtubeId,
  title = "Cómo funciona Kunak AIR",
  ariaLabel = "Vídeo: cómo funciona Kunak AIR",
}: {
  children: ReactNode;
  className?: string;
  /** URL de embed completa (tiene prioridad sobre `youtubeId`). */
  src?: string;
  /** ID de YouTube; se convierte en la URL de embed oembed. */
  youtubeId?: string;
  title?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const videoSrc =
    src ??
    (youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?feature=oembed&autoplay=1&rel=0`
      : VIDEO_SRC);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Bloquea el scroll del body mientras el modal está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-pointer border-0 bg-transparent p-0 text-left",
          className
        )}
      >
        {children}
      </button>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[960px]"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar vídeo"
                  className="absolute right-0 -top-[42px] flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-[28px] leading-none text-white transition-opacity duration-200 hover:opacity-70 md:-right-[44px] md:top-0"
                >
                  ✕
                </button>

                {/* aspect-video = 16:9 responsive */}
                <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-black">
                  <iframe
                    src={videoSrc}
                    title={title}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
