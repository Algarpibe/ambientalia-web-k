"use client";

import { useRef, useState } from "react";
import { SectionTitle } from "@/components/SectionRow";
import { FAQ_ITEMS, type FaqBlock } from "@/lib/monitor";

/**
 * S5 — "Preguntas frecuentes": 19 toggles independientes sobre la retícula
 * 1/4–3/4 (título a la izquierda, acordeón a la derecha) y el watermark "K"
 * de fondo.
 *
 * ⚠️ En el original NO son módulos Toggle de Divi: es HTML a mano dentro de un
 * único módulo de texto, con un `<script>` vanilla que captura el click en el
 * título (fase de captura + stopImmediatePropagation, para que el JS de Divi no
 * interfiera). Se replica su algoritmo tal cual:
 *   - abrir  → `maxHeight = scrollHeight`
 *   - cerrar → fija `scrollHeight`, fuerza reflow y baja a 0 (transición suave)
 * Los toggles son INDEPENDIENTES: abrir uno no cierra los demás, y los 19
 * arrancan cerrados.
 *
 * a11y: el original solo tiene un `<h3>` clicable; aquí el h3 envuelve un
 * `<button aria-expanded>` — misma pintura, navegable por teclado.
 *
 * Spec: docs/research/monitor-calidad-aire/components/faq.spec.md
 */
const ICON_CLOSED = "/images/theme/ico-plus-negro.svg";
const ICON_CLOSED_HOVER = "/images/theme/ico-plus-azul.svg";
const ICON_OPEN = "/images/theme/ico-minus-negro.svg";
const ICON_OPEN_HOVER = "/images/theme/ico-minus-azul.svg";

export function FaqAcordeon() {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const contents = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    const content = contents.current[i];
    if (!content) return;
    const isOpen = open.has(i);

    if (!isOpen) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
      void content.offsetHeight; // reflow: sin él el cierre no transiciona
      content.style.maxHeight = "0px";
    }

    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section
      id="faq"
      className="bg-white bg-left-top bg-no-repeat"
      style={{ backgroundImage: "url('/images/theme/recurso-k-fondo.svg')" }}
    >
      {/* Divi: sección 4% arriba/abajo + fila pt 20 / pb 5% */}
      <div className="mx-auto flex w-[85%] max-w-[1080px] flex-col gap-[30px] pb-[104px] pt-[70px] md:flex-row md:gap-[3%]">
        {/* ---------- Columna izquierda (1/4) ---------- */}
        <div className="relative w-full md:w-[25%] md:shrink-0">
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
            style={{ width: 60, height: 22 }}
          />
          <SectionTitle>Preguntas frecuentes</SectionTitle>
        </div>

        {/* ---------- Columna derecha (3/4) — los 19 toggles ---------- */}
        <div className="w-full min-w-0 md:flex-1">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div
                key={item.q}
                className="border-b border-[#d9d9d9] px-[8px] py-[17px] transition-all duration-200 first:border-t first:border-t-[#d9d9d9] hover:bg-[#f4f4f4]"
              >
                <h3 className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="group block w-full cursor-pointer text-left text-[1.2rem] font-normal leading-[1.4] tracking-normal text-[#333] transition-all duration-200 hover:text-[#0075C9]"
                  >
                    {item.q}
                    {/* ::before del original: 24×24 con el SVG a 22px, arriba a
                        la derecha; el par negro/azul cubre el estado hover */}
                    <span
                      aria-hidden
                      className="absolute right-0 top-[2px] block h-[24px] w-[24px] bg-right-top bg-no-repeat group-hover:hidden"
                      style={{
                        backgroundImage: `url('${isOpen ? ICON_OPEN : ICON_CLOSED}')`,
                        backgroundSize: "22px 22px",
                      }}
                    />
                    <span
                      aria-hidden
                      className="absolute right-0 top-[2px] hidden h-[24px] w-[24px] bg-right-top bg-no-repeat group-hover:block"
                      style={{
                        backgroundImage: `url('${isOpen ? ICON_OPEN_HOVER : ICON_CLOSED_HOVER}')`,
                        backgroundSize: "22px 22px",
                      }}
                    />
                  </button>
                </h3>

                {/* max-height animado (0.3s ease). El padding-top del estado
                    abierto vive en el hijo para que `scrollHeight` ya lo
                    incluya al medirlo. */}
                <div
                  ref={(el) => {
                    contents.current[i] = el;
                  }}
                  className="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-[ease]"
                >
                  <div className="pt-[0.5rem] text-[1rem] leading-[1.7] text-[#333]">
                    <FaqAnswer blocks={item.a} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Párrafos y listas de una respuesta (`p:not(:last-child)` → pb 0.5rem). */
function FaqAnswer({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          // pb 1em = el `padding-bottom` que Divi da a las listas del contenido
          // (medido en el original: 16px, tanto si la lista va primera como
          // en medio de los párrafos)
          <ul key={i} className="pb-[1em] ps-[2em]">
            {block.items.map((text) => (
              <li key={text}>
                {/* li::before del tema: viñeta azul colgada (1.4rem, w .9em) */}
                <span
                  aria-hidden
                  className="-ms-[0.9em] inline-block w-[0.9em] text-[1.4rem] font-bold text-[#0075C9]"
                >
                  •
                </span>
                {text}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className={i === blocks.length - 1 ? undefined : "pb-[0.5rem]"}>
            {block.segs.map((seg, j) => (
              <span key={j}>
                {seg.br ? <br /> : null}
                {seg.href ? (
                  <a
                    href={seg.href}
                    target="_blank"
                    rel="noopener"
                    className="text-inherit no-underline transition-colors duration-300 hover:text-[#5e6770]"
                  >
                    {seg.t}
                  </a>
                ) : seg.sub ? (
                  <sub>{seg.t}</sub>
                ) : (
                  seg.t
                )}
              </span>
            ))}
          </p>
        ),
      )}
    </>
  );
}
