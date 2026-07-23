import type { ReactNode } from "react";

/**
 * Divi 1/3 + 2/3 row pattern used across sections 2, 3, 7, 9–12.
 * The title column always carries the small "punteado" dot decoration
 * absolutely positioned behind it.
 */
export function SectionRow({
  title,
  children,
  belowTitle,
  className = "",
}: {
  title: ReactNode;
  children: ReactNode;
  belowTitle?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "mx-auto flex w-[85%] max-w-[1380px] flex-col gap-8 md:flex-row md:gap-[5.5%] " +
        className
      }
    >
      <div className="relative w-full md:w-1/3">
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
          style={{ width: 60, height: 22 }}
        />
        <div>{title}</div>
        {belowTitle ? <div className="mt-6">{belowTitle}</div> : null}
      </div>
      <div className="w-full md:w-2/3">{children}</div>
    </div>
  );
}

/** Standard title used in the left column of each 1/3+2/3 row. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontWeight: 300,
        fontSize: "clamp(32px, 3.5vw, 44px)",
        lineHeight: 1.25,
        color: "#333",
        letterSpacing: "-0.5px",
      }}
    >
      {children}
    </h2>
  );
}

/** Solid blue pill button used all over the page (`.boton-azul`). */
export function BlueButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const isPdf = href.endsWith(".pdf");
  return (
    <a
      href={href}
      {...(external || isPdf ? { target: "_blank", rel: "noopener" } : {})}
      className="inline-flex items-center gap-2 rounded-full bg-[#0075C9] px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-[#7F8798]"
    >
      {children}
      <span className="arrow inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  );
}

/** Outline pill button, Divi's default variant. */
export function OutlineButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const isPdf = href.endsWith(".pdf");
  return (
    <a
      href={href}
      {...(external || isPdf ? { target: "_blank", rel: "noopener" } : {})}
      className="group inline-flex items-center gap-2 rounded-full border border-[#333]/40 px-6 py-3 text-[14px] font-semibold text-[#333] transition-colors duration-300 hover:border-[#0075C9] hover:text-[#0075C9]"
    >
      {children}
      <span className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</span>
    </a>
  );
}
