"use client";

import { useEffect, useState } from "react";
import { ChevronUpIcon } from "./icons";

/**
 * Botón "volver arriba" — réplica de `span.et_pb_scroll_top` del original:
 * `position: fixed; bottom: 125px; right: 0; z-index: 99999;
 *  background: rgba(0,0,0,0.4)`. Aparece al dejar atrás el hero y hace
 * scroll suave hasta arriba. (Pendiente M8 de docs/PENDIENTES-QA.md.)
 *
 * Umbral de aparición: 500px de scroll (~alto del hero visible tras el
 * padding-top del header; Divi lo muestra "al abandonar el hero").
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafPending = false;
    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        setVisible(window.scrollY > 500);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={
        "fixed right-0 z-[99999] flex h-[44px] w-[44px] items-center justify-center rounded-l-[6px] bg-black/40 text-white transition-opacity duration-300 hover:bg-black/60 " +
        (visible ? "opacity-100" : "pointer-events-none opacity-0")
      }
      style={{ bottom: 125 }}
    >
      <ChevronUpIcon className="h-6 w-6" />
    </button>
  );
}
