"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KunakLogoBrand } from "./KunakLogo";
import { ChevronDownIcon } from "./icons";
import {
  UTILITY_MENU,
  LANGUAGES,
  PRODUCTS,
  SECTORS,
  COMPANY,
  RESOURCES,
} from "@/lib/nav";

/**
 * Header + main navigation. Two rows on top of the hero, with the main row
 * turning `position: fixed` past the utility bar. Mechanism transcribed
 * verbatim from `themes/KunakAir/assets/js/init.js`:
 *
 *   var elementoFijo = $('.fila-menu-principal');
 *   var posicionInicial = elementoFijo.offset().top;   // 41px on desktop
 *   $(window).scroll(function () {
 *     if (scrollY >= posicionInicial)     addClass('fila-menu-principal-fixed');
 *     if (scrollY < posicionInicial + 10) removeClass(...);
 *   });
 *
 * Effective toggle: sticky OFF when `scrollY < posicionInicial + 10`, ON
 * otherwise. On a 1440×900 viewport this puts the flip at scrollY ≈ 51px.
 */
export function HeaderNav() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    // Measure the row's original offset before we ever add position:fixed,
    // otherwise the reading would be zero (fixed elements are out of flow).
    const posicionInicial = row.getBoundingClientRect().top + window.scrollY;

    let rafPending = false;
    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const y = window.scrollY;
        if (y >= posicionInicial && y >= posicionInicial + 10) {
          setSticky(true);
        } else if (y < posicionInicial + 10) {
          setSticky(false);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Kick once in case we mounted mid-page.
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="et-l et-l--header absolute inset-x-0 top-0 z-40">
      {/* Legibility gradient overlay (::before in Divi's #cabecera-wrap) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(71, 71, 71, 0.25) 0%, rgba(0, 0, 0, 0) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative">
        {/* Row 0 — utility bar (hides with page scroll, does not re-fix) */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex h-[41px] w-[85%] max-w-[1380px] items-center justify-end gap-6 text-[13px] font-medium text-white">
            {UTILITY_MENU.map((item) => (
              <UtilityDropdown key={item.label} item={item} />
            ))}
            <LanguageDropdown />
          </div>
        </div>

        {/* Row 1 — main nav */}
        <div
          ref={rowRef}
          data-sticky={sticky || undefined}
          className={
            "kunak-main-nav transition-[background-color] duration-300 " +
            (sticky
              ? "fixed inset-x-0 top-0 z-[1000] shadow-[0_0_20px_rgba(0,0,0,0.1)]"
              : "relative shadow-none")
          }
          style={{
            paddingTop: sticky ? 18 : 30,
            paddingBottom: sticky ? 10 : 30,
            backgroundColor: sticky ? "#ffffff" : "transparent",
          }}
        >
          <div className="mx-auto flex w-[85%] max-w-[1380px] items-center gap-8">
            {/* Logo column — the SVG fills flip on sticky */}
            <Link
              href="/"
              aria-label="Kunak"
              className="col-logotipo-cabecera relative z-[20001] block w-1/4 shrink-0"
              style={{ maxWidth: sticky ? 104 : 170 }}
            >
              <KunakLogoBrand
                primaryFill={sticky ? "#0075C9" : "#ffffff"}
                secondaryFill={sticky ? "#5E666F" : "#ffffff"}
                className="h-auto w-full transition-[fill] duration-200"
                style={{ maxWidth: sticky ? 104 : 170 }}
              />
            </Link>

            {/* Menu column — two rows like the original: links + help pill,
                then the catalog pill on its own line, left-aligned. */}
            <div className="flex flex-1 flex-col items-start gap-2">
              <nav
                className="flex flex-wrap items-center gap-6"
                aria-label="Menú principal"
              >
                <MainLink label="Inicio" href="https://kunakair.com/es/" sticky={sticky} />
                <MegaMenuProducts sticky={sticky} />
                <SectorsDropdown sticky={sticky} />
                <MainDropdown
                  label="Empresa"
                  href="https://kunakair.com/es/empresa/"
                  items={COMPANY}
                  sticky={sticky}
                />
                <MainLink
                  label="Casos de éxito"
                  href="https://kunakair.com/es/casos-de-exito/"
                  sticky={sticky}
                />
                <MainDropdown
                  label="Recursos"
                  href="https://kunakair.com/es/recursos/"
                  items={RESOURCES}
                  sticky={sticky}
                />
                <SecondaryPill sticky={sticky} />
              </nav>
              <CatalogPill />
            </div>
          </div>
        </div>

        {/* Spacer to preserve layout when the row goes fixed */}
        {sticky ? <div aria-hidden style={{ height: 127 }} /> : null}
      </div>
    </header>
  );
}

/* --------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------ */

function UtilityDropdown({
  item,
}: {
  item: (typeof UTILITY_MENU)[number];
}) {
  const hasChildren = !!item.children?.length;
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className="inline-flex items-center gap-1 py-2 text-[13px] font-medium text-white transition-opacity duration-400 hover:opacity-70"
      >
        {item.label}
        {hasChildren ? <ChevronDownIcon className="h-3 w-3" /> : null}
      </Link>
      {hasChildren ? (
        <div className="pointer-events-none absolute right-0 top-full z-50 min-w-[220px] translate-y-1 rounded-md bg-white py-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          {item.children!.map((sub) => (
            <Link
              key={sub.label}
              href={sub.href}
              className="block px-5 py-1.5 text-[13.5px] text-[#333] transition-colors hover:bg-black/[0.03] hover:text-[#0075C9]"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LanguageDropdown() {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-white transition-opacity duration-400 hover:opacity-70"
      >
        <GlobeMini />
        Español
        <ChevronDownIcon className="h-3 w-3" />
      </button>
      <div className="pointer-events-none absolute right-0 top-full z-50 min-w-[140px] translate-y-1 rounded-md bg-white py-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        {LANGUAGES.slice(1).map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="block px-5 py-1.5 text-[13.5px] text-[#333] transition-colors hover:bg-black/[0.03] hover:text-[#0075C9]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function GlobeMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function MainLink({
  label,
  href,
  sticky,
}: {
  label: string;
  href: string;
  sticky: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "text-[14px] font-medium transition-colors duration-400 " +
        (sticky ? "text-[#333] hover:text-[#0075C9]" : "text-white hover:opacity-70")
      }
    >
      {label}
    </Link>
  );
}

function MainDropdown({
  label,
  href,
  items,
  sticky,
}: {
  label: string;
  href: string;
  items: { label: string; href: string }[];
  sticky: boolean;
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={
          "inline-flex items-center gap-1 text-[14px] font-medium transition-colors duration-400 " +
          (sticky ? "text-[#333] hover:text-[#0075C9]" : "text-white hover:opacity-70")
        }
      >
        {label}
        <ChevronDownIcon className="h-3 w-3" />
      </Link>
      <div className="pointer-events-none absolute right-0 top-full z-50 min-w-[240px] translate-y-1 rounded-md bg-white py-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        {items.map((sub) => (
          <Link
            key={sub.label}
            href={sub.href}
            className="block px-5 py-1.5 text-[13.5px] text-[#333] transition-colors hover:bg-black/[0.03] hover:text-[#0075C9]"
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Full-width mega-menu for "Productos". */
function MegaMenuProducts({ sticky }: { sticky: boolean }) {
  return (
    <div className="group static">
      <Link
        href="https://kunakair.com/es/productos/"
        className={
          "inline-flex items-center gap-1 text-[14px] font-medium transition-colors duration-400 " +
          (sticky ? "text-[#333] hover:text-[#0075C9]" : "text-white hover:opacity-70")
        }
      >
        Productos
        <ChevronDownIcon className="h-3 w-3" />
      </Link>
      <div
        className="pointer-events-none fixed inset-x-0 z-[999999] border-t border-black/30 bg-white opacity-0 shadow-md transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
        style={{ top: sticky ? 73 : 119 }}
      >
        <div className="mx-auto flex max-w-[1380px] justify-center gap-2 px-6 py-4 text-center">
          {PRODUCTS.map((p) => (
            <div key={p.label} className="group/product w-[15%] max-w-[180px]">
              <Link
                href={p.href}
                className="flex flex-col-reverse items-center gap-2 py-2 text-[15px] text-[#333] transition-colors hover:text-[#0075C9]"
              >
                <span>{p.label}</span>
                {p.image ? (
                  // Product thumbnails swap from 130 → 150 px on hover
                  <img
                    src={p.image}
                    alt={p.label}
                    className="w-[130px] transition-all duration-300 group-hover/product:w-[150px]"
                  />
                ) : null}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Dropdown for "Sectores" — icons on the right, hover recolours icon + text to blue. */
function SectorsDropdown({ sticky }: { sticky: boolean }) {
  return (
    <div className="group relative">
      <Link
        href="https://kunakair.com/es/sectores/"
        className={
          "inline-flex items-center gap-1 text-[14px] font-medium transition-colors duration-400 " +
          (sticky ? "text-[#333] hover:text-[#0075C9]" : "text-white hover:opacity-70")
        }
      >
        Sectores
        <ChevronDownIcon className="h-3 w-3" />
      </Link>
      <div className="pointer-events-none absolute right-0 top-full z-50 min-w-[280px] translate-y-1 rounded-md bg-white py-2 opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        {SECTORS.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group/sector flex flex-row-reverse items-center justify-between gap-3 px-5 py-2 text-[13.5px] text-[#333] transition-colors hover:text-[#0075C9]"
          >
            <img
              src={s.icon}
              alt=""
              width={34}
              height={34}
              className="w-[34px] shrink-0 transition-[filter]"
              style={{
                filter:
                  "invert(12%) sepia(6%) saturate(6%) hue-rotate(359deg) brightness(70%) contrast(100%)",
              }}
            />
            <span className="flex-1">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Secondary outline pill ("¿Cómo podemos ayudarte?"). */
function SecondaryPill({ sticky }: { sticky: boolean }) {
  return (
    <Link
      href="https://kunakair.com/es/contacto/"
      className={
        "inline-flex items-center gap-2 rounded-[10px] border px-3 py-[10px] text-[14px] font-semibold transition-colors " +
        (sticky
          ? "border-[#333] text-[#333] hover:border-[#0075C9] hover:text-[#0075C9] hover:opacity-100"
          : "border-white text-white hover:border-white/70 hover:text-white/70")
      }
      style={{ paddingTop: 10, paddingBottom: 8 }}
    >
      ¿Cómo podemos ayudarte?
    </Link>
  );
}

/** Solid blue pill CTA ("Descargar catálogo") — always blue on white text. */
function CatalogPill() {
  return (
    <Link
      href="https://kunakair.com/es/descarga-catalogo/"
      className="inline-flex items-center rounded-[10px] bg-[#0075C9] px-4 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-[#005ea3]"
      style={{ borderTop: "6px solid #0075C9" }}
    >
      Descargar catálogo
    </Link>
  );
}
