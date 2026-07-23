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
  type NavLink,
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {/* Row 0 — utility bar (hides with page scroll, does not re-fix).
            Oculta a ≤1023px como el original (theme style.css @max-width:1023). */}
        <div className="hidden border-b border-white/10 lg:block">
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
              ? "fixed inset-x-0 top-0 z-[1000] pb-0 pt-[14px] shadow-[0_0_20px_rgba(0,0,0,0.1)] lg:pb-[10px] lg:pt-[18px]"
              : "relative pb-[30px] pt-[30px] shadow-none")
          }
          style={{ backgroundColor: sticky ? "#ffffff" : "transparent" }}
        >
          <div className="mx-auto flex w-full items-start lg:w-[85%] lg:max-w-[1380px] lg:items-center lg:gap-8">
            {/* Logo column — the SVG fills flip on sticky. Móvil: 120px (104 sticky),
                margin-inline-start 10% como .col-logotipo-cabecera del original */}
            <Link
              href="/"
              aria-label="Kunak"
              className={
                "col-logotipo-cabecera relative z-[20001] ml-[10%] block shrink-0 lg:ml-0 lg:w-1/4 " +
                (sticky ? "max-w-[104px]" : "max-w-[120px] lg:max-w-[170px]")
              }
            >
              <KunakLogoBrand
                primaryFill={sticky ? "#0075C9" : "#ffffff"}
                secondaryFill={sticky ? "#5E666F" : "#ffffff"}
                className="h-auto w-full transition-[fill] duration-200"
              />
            </Link>

            {/* Menu column — two rows like the original: links + help pill,
                then the catalog pill on its own line, left-aligned. */}
            <div className="hidden flex-1 flex-col items-start gap-2 lg:flex">
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

            {/* Hamburguesa (≤1023px) — 48×52, 3 barras 28×2; ver mobile-nav.spec.md */}
            <button
              type="button"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className={
                "group relative ml-auto block h-[52px] w-[48px] cursor-pointer lg:hidden " +
                (sticky ? "my-[3.5px]" : "mt-[14px]")
              }
              style={{ marginRight: "calc(3vh + 6px)" }}
            >
              <MobileBars open={mobileOpen} sticky={sticky} />
            </button>
          </div>

          <MobileMenu sticky={sticky} open={mobileOpen} onClose={() => setMobileOpen(false)} />
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

/* --------------------------------------------------------------------------
 * Menú móvil (≤1023px) — spec en docs/research/components/mobile-nav.spec.md.
 * Mecanismo transcrito del original: hamburguesa de 3 barras (span 28×2),
 * panel 90vh con slide de 500ms, submenús acordeón instantáneo con +/−
 * y overlay .hover-link que navega a la página de sección.
 * ------------------------------------------------------------------------ */

interface MobileNavItemData {
  label: string;
  href: string;
  children?: MobileNavItemData[];
  /** Items visible-movil (Soporte/Blog/Contacto): 13.5px */
  small?: boolean;
  /** Los submenús de visible-movil van con fondo #eee */
  graySub?: boolean;
  /** "Descargar catálogo" — botón azul full-width */
  pill?: boolean;
  /** Página actual (Inicio en la home): texto azul */
  current?: boolean;
}

const SOPORTE_SUB = UTILITY_MENU[0].children ?? [];
const soporteLink = (label: string): NavLink =>
  SOPORTE_SUB.find((c) => c.label === label) ?? { label, href: "#" };

/** 11 items verbatim de #mobile_menu2 en /es/ (sin selector de idioma;
    "¿Cómo podemos ayudarte?" lleva visible-escritorio y NO aparece). */
const MOBILE_MENU: MobileNavItemData[] = [
  { label: "Inicio", href: "https://kunakair.com/es/", current: true },
  {
    label: "Productos",
    href: "https://kunakair.com/es/productos/",
    children: PRODUCTS.map((p) => ({
      label: p.label,
      href: p.href,
      children: p.children,
    })),
  },
  {
    label: "Sectores",
    href: "https://kunakair.com/es/sectores/",
    children: SECTORS.map((s) => ({ label: s.label, href: s.href })),
  },
  {
    label: "Empresa",
    href: "https://kunakair.com/es/empresa/",
    children: COMPANY,
  },
  { label: "Casos de éxito", href: "https://kunakair.com/es/casos-de-exito/" },
  {
    label: "Recursos",
    href: "https://kunakair.com/es/recursos/",
    children: RESOURCES,
  },
  {
    label: "Descargar catálogo",
    href: "https://kunakair.com/es/descarga-catalogo/",
    pill: true,
  },
  {
    label: "Soporte",
    href: "https://kunakair.com/es/soporte/",
    small: true,
    graySub: true,
    // Orden móvil del original (distinto al utility bar de escritorio)
    children: [
      soporteLink("Centro de ayuda"),
      soporteLink("Soporte técnico"),
      soporteLink("Servicio de reparación (RMA)"),
    ],
  },
  { label: "Blog", href: "https://kunakair.com/es/blog/", small: true },
  { label: "Contacto", href: "https://kunakair.com/es/contacto/", small: true },
];

/** 3 barras 28×2 → ✕ al abrir. Blancas sobre el hero, #333 en sticky. */
function MobileBars({ open, sticky }: { open: boolean; sticky: boolean }) {
  const color = sticky ? "bg-[#333333]" : "bg-white";
  const bar =
    "absolute left-[10px] h-[2px] w-[28px] transition-[transform,top,background-color] ";
  return (
    <>
      <span
        aria-hidden
        className={
          bar +
          color +
          " " +
          (open
            ? "top-[13px] -rotate-45 duration-100 group-hover:rotate-0"
            : "top-[5px] duration-300 group-hover:translate-y-[2px]")
        }
      />
      <span
        aria-hidden
        className={
          "absolute left-[10px] top-[13px] h-[2px] w-[28px] transition-colors duration-150 " +
          (open ? "bg-transparent" : color)
        }
      />
      <span
        aria-hidden
        className={
          bar +
          color +
          " " +
          (open
            ? "top-[13px] rotate-45 duration-100 group-hover:rotate-0"
            : "top-[21px] duration-300 group-hover:-translate-y-[2px]")
        }
      />
    </>
  );
}

/** Panel desplegable: 90vh, borde azul 3px, slide 500ms ease-in-out. */
function MobileMenu({
  sticky,
  open,
  onClose,
}: {
  sticky: boolean;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className="absolute inset-x-0 z-[9999] overflow-hidden transition-[height] duration-500 ease-in-out lg:hidden"
      // No sticky: la fila tiene 30px de padding inferior y el panel ancla
      // al bottom del botón (y=96 en el original); sticky: al bottom de la fila.
      style={{ top: sticky ? "100%" : "calc(100% - 30px)", height: open ? "90vh" : 0 }}
    >
      <ul
        id="mobile-menu"
        className="h-[90vh] overflow-y-auto border-t-[3px] border-[#0075C9] bg-white pt-[2%] shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
      >
        {MOBILE_MENU.map((item) => (
          <MobileMenuItem key={item.label} item={item} onNavigate={onClose} />
        ))}
      </ul>
    </div>
  );
}

function MobileMenuItem({
  item,
  onNavigate,
  inGraySub,
}: {
  item: MobileNavItemData;
  onNavigate: () => void;
  inGraySub?: boolean;
}) {
  // Igual que el original: el estado expandido persiste al cerrar el menú.
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!item.children?.length;

  if (item.pill) {
    return (
      <li className="block px-[5%]">
        <a
          href={item.href}
          onClick={onNavigate}
          className="my-[7px] block rounded-[15px] border-b border-t-[6px] border-[#0075C9] bg-[#0075C9] px-[5px] pb-[5px] text-[15px] font-medium leading-[26px] text-white"
        >
          {item.label}
        </a>
      </li>
    );
  }

  const rowClasses =
    "block border-b border-black/[0.03] px-[5%] py-[10px] font-medium leading-[26px] transition-[opacity,background-color] duration-200 " +
    (item.small ? "text-[13.5px] " : "text-[15px] ") +
    (item.current ? "text-[#0075C9] " : "text-[#333] ") +
    (inGraySub ? "bg-[#eee] " : "hover:bg-[#f9f9f9] ");

  if (!hasChildren) {
    return (
      <li className="px-[5%]">
        <a href={item.href} onClick={onNavigate} className={rowClasses}>
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li className="relative px-[5%]">
      <a
        href="#"
        aria-expanded={expanded}
        onClick={(e) => {
          e.preventDefault();
          setExpanded((v) => !v);
        }}
        className={"group/mi relative " + rowClasses}
      >
        {item.label}
        {/* Icono +/− (a::after del original), hover → filtro azul */}
        <span
          aria-hidden
          className="absolute right-[10px] top-[14px] h-[20px] w-[20px] bg-center bg-no-repeat group-hover/mi:[filter:invert(37%)_sepia(70%)_saturate(7166%)_hue-rotate(191deg)_brightness(80%)_contrast(101%)]"
          style={{
            backgroundImage: `url(${
              expanded ? "/images/theme/minus-light.svg" : "/images/theme/plus-light.svg"
            })`,
          }}
        />
      </a>
      {/* .hover-link del original: la zona del texto navega a la página de
          sección; solo los 60px derechos (icono) hacen toggle */}
      <a
        href={item.href}
        tabIndex={-1}
        aria-hidden
        onClick={onNavigate}
        className="absolute left-0 right-[60px] top-0 z-[1] h-[47px]"
      />
      {expanded ? (
        <ul>
          {item.children!.map((c) => (
            <MobileMenuItem
              key={c.label}
              item={c}
              onNavigate={onNavigate}
              inGraySub={item.graySub || inGraySub}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
