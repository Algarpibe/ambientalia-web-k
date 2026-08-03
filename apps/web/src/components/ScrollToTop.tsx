"use client";

import { useEffect, useState } from "react";
import { ChevronUpIcon } from "./icons";

/**
 * Botón "volver arriba" — réplica de `span.et_pb_scroll_top` del original.
 * Medido el 2026-07-28 en las **5 páginas** del original a 1440 y 390, con el
 * botón ya asentado (la animación de entrada lo desplaza ~3px, así que leerlo
 * a los 700 ms da una `left` falsa):
 *
 *   40×40 · `padding: 5px` · `border-radius: 5px 0 0 5px` ·
 *   `position: fixed; right: 0; bottom: 125px; z-index: 99999` ·
 *   `background: rgba(0,0,0,0.4)` · glifo ETmodules "2" a 30px/30 blanco.
 *
 * Iba a 44×44 con `rounded-l-[6px]` desde M8; corregido en la tanda del
 * 2026-07-28. **El icono no se toca**: medido en píxeles sobre capturas
 * ampliadas ×5, el chevron del original ocupa **14×8 px** centrados y el
 * `ChevronUpIcon` a 24×24 pinta exactamente los mismos 14×8. El `padding: 5px`
 * del original es cómo Divi encaja un glifo de fuente de 30px en la caja de
 * 40; replicarlo con un SVG de 30×30 agrandaría el chevron. Lo que se replica
 * es el resultado, no la implementación.
 *
 * **Umbral de aparición: `scrollY > 800`, constante.** No es relativo al
 * viewport: búsqueda binaria del punto de corte a 1440×600, 1440×900,
 * 1440×1200 y 390×844 → los cuatro cortan en el MISMO sitio (off en y800, on
 * en y801), así que el umbral no sigue a `innerHeight`. Sin histéresis:
 * bajando se apaga en el mismo 800. El clon usaba 500px.
 *
 * **Hover: fondo `#0075C9`** (azul de marca), no un negro más oscuro. El
 * original computa `transition: all 0s`, o sea el cambio de color es
 * instantáneo; la `transition-opacity` de aquí solo afecta a la aparición
 * (en el original es un fade de jQuery, no CSS).
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
        setVisible(window.scrollY > 800);
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
        "fixed right-0 z-[99999] flex h-[40px] w-[40px] items-center justify-center rounded-l-[5px] bg-black/40 text-white transition-opacity duration-300 hover:bg-[#0075C9] " +
        (visible ? "opacity-100" : "pointer-events-none opacity-0")
      }
      style={{ bottom: 125 }}
    >
      <ChevronUpIcon className="h-6 w-6" />
    </button>
  );
}
