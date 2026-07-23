"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/kunak";
import { PRODUCTS_TABS } from "@/lib/products";
import { SectionTitle, BlueButton, OutlineButton } from "./SectionRow";

/**
 * `et_pb_section_7` (rows 10–11) — "Nuestros productos".
 *
 * HOVER-driven tabs (NOT click), transcribed from
 * `themes/KunakAir/assets/js/init.js`:
 *   $("#lista-soluciones li span").on("mouseenter", toggleActiveClasses)
 * Desktop (≥768px): mouseenter over a tab swaps the right panel instantly
 * (no fade). Mobile (<768px): behaves as an accordion — tapping the active
 * item closes it; the panel renders inside each `<li>`.
 *
 * Spec: docs/research/components/productos-tabs.spec.md
 */
const PLUS_ICON = "/images/theme/ico-plus-negro.svg";
const MINUS_ICON = "/images/theme/ico-minus-azul.svg";

export function ProductosTabs() {
  const [activeId, setActiveId] = useState<string | null>(PRODUCTS_TABS[0].id);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onEnter = (id: string) => {
    if (isDesktop) setActiveId(id);
  };
  const onClick = (id: string) => {
    if (!isDesktop) setActiveId((cur) => (cur === id ? null : id));
  };

  const active = PRODUCTS_TABS.find((p) => p.id === activeId) ?? null;

  return (
    <section className="relative bg-white" style={{ paddingTop: 28, paddingBottom: 123 }}>
      <div className="mx-auto w-[85%] max-w-[1380px]">
        <div className="pb-[10px]">
          <SectionTitle>Nuestros productos</SectionTitle>
        </div>

        <div className="mt-4 w-full overflow-hidden md:flex md:gap-[3%]">
          {/* Left column — tab list */}
          <ul className="md:w-[30%] md:min-w-[250px] md:shrink-0">
            {PRODUCTS_TABS.map((p) => {
              const isActive = p.id === activeId;
              return (
                <li
                  key={p.id}
                  className="mb-[10px] border-b border-[#999] pb-[10px] last:border-b-0 md:border-b-0 md:pb-0"
                >
                  <button
                    type="button"
                    onMouseEnter={() => onEnter(p.id)}
                    onClick={() => onClick(p.id)}
                    aria-expanded={isActive}
                    className={
                      "block w-full cursor-pointer bg-no-repeat pr-[50px] text-left transition-opacity duration-300 " +
                      (isActive ? "opacity-100" : "opacity-30 hover:opacity-100")
                    }
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      paddingTop: 5,
                      paddingBottom: 5,
                      color: isActive ? "#0075C9" : "#333",
                      backgroundImage: `url('${isActive ? MINUS_ICON : PLUS_ICON}')`,
                      backgroundPosition: "right 5px",
                      backgroundSize: "28px 28px",
                    }}
                  >
                    {p.name}
                    <strong className="block text-[16px] font-normal">{p.tagline}</strong>
                  </button>

                  {/* Mobile accordion panel */}
                  {isActive ? (
                    <div className="mt-4 md:hidden">
                      <ProductPanel product={p} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Right column — active panel (desktop only) */}
          <div className="hidden md:block md:w-[63%]">
            {active ? <ProductPanel product={active} /> : null}
          </div>
        </div>

        {/* Centered relative to the right panel column, like the original */}
        <div className="mt-[70px] flex justify-center md:pl-[33%]">
          <BlueButton href="https://kunakair.com/es/contacto/">Cuéntanos tus necesidades</BlueButton>
        </div>
      </div>
    </section>
  );
}

/** Right-hand product panel. Card border/padding only from ≥768px. */
function ProductPanel({ product }: { product: Product }) {
  const hasImage = product.image !== "";
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 md:rounded-[10px] md:border md:border-[#777] md:p-[30px]">
      {hasImage ? (
        <div className="sm:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-full rounded"
          />
        </div>
      ) : null}

      <div className={hasImage ? "sm:w-1/2" : "w-full"}>
        <h3 className="hidden text-[20px] font-bold leading-[1.5] text-[#333] sm:block">
          {product.name}
        </h3>
        <p className="mt-0 text-[18px] leading-[1.45] text-[#333] sm:mt-3">
          {product.description}
        </p>
        <p className="mt-4 text-[18px] leading-[1.45] text-[#333]">{product.highlight}</p>
        <p className="mt-4 text-[18px] font-bold leading-[1.45] text-[#333]">Ventajas</p>
        <ul className="mt-2 list-disc pl-[28px] text-[18px] leading-[1.5] text-[#333] marker:text-[22px] marker:text-[#0075C9]">
          {product.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="mt-6">
          <OutlineButton href={product.href}>Ver más</OutlineButton>
        </div>
      </div>
    </div>
  );
}
