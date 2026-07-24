"use client";

import { useCallback, useEffect, useState } from "react";
import { BlueButton, OutlineButton } from "@/components/SectionRow";
import { ANCHOR_LINKS, DATASHEET_PDF, CONTACT_HREF, CATALOG_HREF } from "@/lib/monitor";

/**
 * S3 · columna izquierda — sub-nav de anclas sticky + scrollspy.
 * Spec: docs/research/monitor-calidad-aire/components/subnav-anclas.spec.md
 *
 * Desktop: caja `menu-anclas` (8 enlaces) + 3 CTAs, fija con `position: sticky;
 * top: 70px` (equivalente al sticky JS de Divi del original).
 * Scrollspy: regla exacta del script inline → el último enlace cuyo target
 * cumple `target.top < scrollY + 600` recibe la clase activa (offset +600px).
 * Click: scroll suave hasta `target.top` SIN compensar el header (fiel), sin
 * cambiar el hash.
 * Móvil (≤767): la caja se oculta; sobreviven los 3 CTAs como barra horizontal
 * gris pegada bajo el header.
 */
export function SubNavAnclas() {
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
        for (const a of ANCHOR_LINKS) {
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
  }, []);

  const onAnchorClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY; // sin offset (fiel)
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <aside
      className={
        "columna-lista-anclas w-full md:w-[25%] md:shrink-0 " +
        // Desktop: barra lateral sticky. Móvil: barra horizontal gris bajo el header.
        "md:sticky md:top-[70px] max-md:sticky max-md:top-[60px] max-md:z-[2] max-md:bg-[#eee] max-md:py-2"
      }
    >
      {/* Caja menú de anclas — solo desktop */}
      <div className="hidden w-[172px] rounded-[10px] border-[0.67px] border-[#333] px-4 pb-0 pt-4 md:block">
        <ul className="m-0 list-none p-0">
          {ANCHOR_LINKS.map((a) => {
            const isActive = active === a.id;
            return (
              <li key={a.id} className="pb-[10px]">
                <a
                  id={`link-${a.id}`}
                  href={`#${a.id}`}
                  onClick={(e) => onAnchorClick(e, a.id)}
                  className={
                    "block py-[2px] text-[16px] font-extrabold leading-[26px] transition-colors " +
                    (isActive ? "text-[#0075C9]" : "text-[#BBB] hover:text-[#0075C9]")
                  }
                >
                  {a.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3 CTAs — apilados en desktop, barra horizontal en móvil */}
      <div className="mt-0 flex flex-row flex-wrap justify-center gap-2 md:mt-6 md:w-[172px] md:flex-col md:items-start md:gap-3">
        <OutlineButton href={DATASHEET_PDF}>Descargar ficha técnica</OutlineButton>
        <BlueButton href={CONTACT_HREF}>Solicita más información</BlueButton>
        <BlueButton href={CATALOG_HREF}>Descarga el catálogo</BlueButton>
      </div>
    </aside>
  );
}
