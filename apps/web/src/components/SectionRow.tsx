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
      // `data-fila` es MARCADOR DE SONDA, no estilo: no cambia un píxel, dice
      // QUÉ ES este nodo. El original lo dice con `.et_pb_row` y el clon no
      // tenía equivalente, así que `ancho-cuerpo` deducía la fila por
      // comportamiento —bloque centrado más estrecho que su sección— y
      // **sobre-casaba**: 16 filas donde el original tiene 11. Ver la cabecera
      // de `scripts/qa/ancho-cuerpo.mjs`.
      data-fila=""
      className={
        // Divi: .et_pb_row width 86.35% max 1380; cols 29.6667% + 64.833%,
        // gutter 5.5% (valores exactos del CSS inline de la página original)
        // Móvil: columnas apiladas con 30px (margin-bottom de columna Divi)
        "mx-auto flex w-[86.35%] max-w-[1380px] flex-col gap-[30px] md:flex-row md:gap-[5.5%] " +
        className
      }
    >
      <div className="relative w-full md:w-[29.6667%] md:shrink-0">
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
        {/* Gap módulo Divi: margin-bottom 33.67px del módulo de título en
            desktop; en móvil colapsa a 0 (solo queda el pb-20 del título) */}
        {belowTitle ? <div className="md:mt-[34px]">{belowTitle}</div> : null}
      </div>
      <div className="w-full md:w-[64.833%] md:shrink-0">{children}</div>
    </div>
  );
}

/** Standard title used in the left column of each 1/3+2/3 row.
    Divi da `padding-bottom: 10px` a todos los h1-h6. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="pb-[10px]"
      style={{
        fontWeight: 300,
        // Original: 35px en móvil (≤767), 44px en desktop
        fontSize: "clamp(35px, 3.5vw, 44px)",
        lineHeight: 1.25,
        color: "#333",
        letterSpacing: "-0.5px",
      }}
    >
      {children}
    </h2>
  );
}

/**
 * Título de un bloque dentro de la columna 3/4 de S3 en /monitor-calidad-aire:
 * la escala de 37px del original (`.et_pb_text_inner h2`), no la de 44px de las
 * cabeceras de sección que pinta `SectionTitle`.
 */
export function BlockTitle({
  children,
  className = "",
  dataModulo,
}: {
  children: ReactNode;
  className?: string;
  /* MARCADOR DE SONDA (130.ª) — se pasa como PROP en vez de envolver el `<h2>`:
     el elemento que el original mide como módulo ya existe, así que el marcador
     va como ATRIBUTO sobre él y no puede mover un píxel por construcción.
     Omitido, el render es byte a byte el de antes. */
  dataModulo?: string;
}) {
  return (
    <h2
      data-modulo={dataModulo}
      className={"pb-[10px] " + className}
      style={{
        fontSize: 37,
        lineHeight: "37px",
        fontWeight: 300,
        letterSpacing: "-0.5px",
        color: "#333",
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
  // Divi .et_pb_button.boton-azul: 15px/25.5 fw700, padding 7.5/40.5/9/22.5,
  // borde 1px radius 30 → alto 44px. Flecha siempre visible dentro del padding
  // derecho; hover: padding-right 55.5px (el botón crece) + flecha se desplaza.
  return (
    <a
      href={href}
      {...(external || isPdf ? { target: "_blank", rel: "noopener" } : {})}
      className="group relative inline-block rounded-[30px] border border-[#0075C9] bg-[#0075C9] pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-white transition-all duration-300 hover:border-[#7F8798] hover:bg-[#7F8798] hover:pr-[55.5px]"
    >
      {children}
      <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px]">→</span>
    </a>
  );
}

/**
 * Botón claro sobre foto oscura (Divi `et_pb_bg_layout_dark`): borde blanco y
 * fondo `rgba(0,0,0,.15)`. Sirve como enlace (`href`) o como disparador
 * (`onClick`, p. ej. el CTA que abre el popup de la guía).
 */
export function LightButton({
  href,
  onClick,
  children,
  className: extra = "",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  // QA Fase 5 de /kunak-api (2026-07-28): este botón no seguía la geometría
  // Divi que sí replica `OutlineButton`. Llevaba `px-6` simétrico + flecha en
  // flujo con `gap-2`, y salía 8.5px más ancho que el original en las 3 páginas
  // donde se midió (178.1→186.6 en /kunak-api, 256.3→264.8 en /software,
  // 285→293.4 en /monitor). El original es `inline-block` con
  // `padding: 7.5px 40.5px 9px 22.5px`, flecha absoluta dentro del hueco de la
  // derecha y `padding-right: 55.5px` al hover — igual que el botón de contorno.
  const className =
    "group relative inline-block rounded-[30px] border border-white pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-white transition-all duration-300 hover:border-[#7F8798] hover:bg-[#7F8798] hover:pr-[55.5px] " +
    extra;
  const style = { backgroundColor: "rgba(0, 0, 0, 0.15)" };
  const inner = (
    <>
      {children}
      <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px]">
        →
      </span>
    </>
  );

  return href ? (
    <a href={href} className={className} style={style}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}

/** Outline pill button, Divi's default variant (borde #333, flecha azul al hover). */
export function OutlineButton({
  href,
  children,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  const isPdf = href.endsWith(".pdf");
  return (
    <a
      href={href}
      {...(external || isPdf ? { target: "_blank", rel: "noopener" } : {})}
      className={
        "group relative inline-block rounded-[30px] border border-[#333] pb-[9px] pl-[22.5px] pr-[40.5px] pt-[7.5px] text-[15px] font-bold leading-[25.5px] text-[#333] transition-all duration-300 hover:pr-[55.5px] " +
        className
      }
    >
      {children}
      <span className="arrow absolute ml-[5px] inline-block text-[20px] leading-[25.5px] transition-all duration-300 group-hover:ml-[12px] group-hover:text-[#0075C9]">→</span>
    </a>
  );
}
