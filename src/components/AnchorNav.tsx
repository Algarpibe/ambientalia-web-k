"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

export interface AnchorNavItem {
  /** id del bloque destino (el `<a>` se emite como `link-{id}`, como el original) */
  id: string;
  label: string;
}

/**
 * Caja de anclas sticky con scrollspy — compartida por /monitor-calidad-aire
 * (sub-nav de 8 anclas) y /accesorios (una por categoría).
 * Spec: docs/research/accesorios/components/anchor-nav.spec.md
 *
 * Valores medidos 2026-07-27 en el original de AMBAS páginas (idénticos):
 * caja border 1px #333 radius 10 padding 17/17/0 mb 27.2; ul pb 17; li pb 10;
 * `a` 17px/26 fw800 con `ico-arrow.svg` 30×30 de background a 100% 0% y
 * padding-right 30; #BBB → #0075C9 al activarse (el peso no cambia).
 *
 * Sticky: el original lo hace por JS de Divi (clona el nodo y lo fija con
 * inline styles); aquí `position: sticky; top: 70px` nativo da el mismo
 * resultado — ya validado en la tanda M4/§5 del monitor.
 *
 * Scrollspy: gana el último ancla cuyo `top` < scrollY + 600 (regla del script
 * inline del original). Marca UNO solo; ninguno cuando se deja atrás el grupo.
 */
export function AnchorNav({
  items,
  scrollOffset = 0,
  hoverable = true,
  className = "",
  boxClassName = "",
  children,
}: {
  items: AnchorNavItem[];
  /** px a descontar al saltar por ancla: 0 en el monitor (fiel), 80 en accesorios */
  scrollOffset?: number;
  hoverable?: boolean;
  className?: string;
  boxClassName?: string;
  /** CTAs u otro contenido bajo la caja (solo el monitor los tiene) */
  children?: ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let rafPending = false;
    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const y = window.scrollY;
        let candidate: string | null = null;
        for (const a of items) {
          const el = document.getElementById(a.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top < y + 600) candidate = a.id; // el último que cumple gana
        }
        setActive(candidate);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  const onAnchorClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: "smooth" }); // sin escribir el hash, como el original
    },
    [scrollOffset]
  );

  return (
    <div className={className}>
      {/* Caja `menu-anclas` — oculta en móvil (regla ≤980 del tema) */}
      <div
        className={
          "mb-[27.2px] hidden w-full rounded-[10px] border border-[#333] px-[17px] pb-0 pt-[17px] md:block " +
          boxClassName
        }
      >
        <ul className="m-0 list-none p-0 pb-[17px]">
          {items.map((a) => {
            const isActive = active === a.id;
            return (
              <li key={a.id} className="pb-[10px]">
                <a
                  id={`link-${a.id}`}
                  href={`#${a.id}`}
                  onClick={(e) => onAnchorClick(e, a.id)}
                  className={
                    "block py-[2px] pr-[30px] text-[17px] font-extrabold leading-[26px] transition-colors " +
                    (isActive
                      ? "text-[#0075C9]"
                      : "text-[#BBB]" + (hoverable ? " hover:text-[#0075C9]" : ""))
                  }
                  style={{
                    backgroundImage: "url('/images/theme/ico-arrow.svg')",
                    backgroundPosition: "right top",
                    backgroundSize: "30px 30px",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {a.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {children}
    </div>
  );
}
