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

export function FaqAcordeon({
  /**
   * Desfase en desktop del techo de la columna de toggles respecto al `<h2>`
   * (el `margin-top` de módulo Divi). Medido en los originales el 2026-07-28:
   * `/monitor-calidad-aire` **0**, `/accesorios` **0**, `/software` **10**,
   * `/kunak-api` **10**. En móvil las columnas se apilan, así que solo se
   * aplica desde `md`.
   *
   * (El "12.7" que se anotó para /monitor el 2026-07-28 era un artefacto: la
   * sonda medía desde el h2, que allí va 50.2px más abajo por el punteado en
   * flujo. Medido desde el techo de la columna, el desfase es 0.)
   */
  desfaseColumna = 0,
  /**
   * Calibración del rótulo. El set de 19 preguntas es el MISMO en las cuatro
   * páginas (verificado bloque a bloque el 2026-07-28), pero el titular no:
   * `/monitor-calidad-aire` y `/accesorios` lo pintan a **23px/23px** y
   * `/software` y `/kunak-api` a la escala de sección (44/55 desktop,
   * 35/43.75 móvil). Medido a 1280 y a 390 en los cuatro originales.
   */
  tituloCompacto = false,
  /**
   * En `/monitor-calidad-aire` el módulo del punteado va **EN FLUJO**
   * (`position: relative`, 22px de alto + `margin-bottom: 28.16`), así que
   * empuja el rótulo 50.2px hacia abajo y se alinea con el borde izquierdo de
   * la columna. En las otras tres es absoluto y cuelga 65px a la izquierda.
   */
  punteadoEnFlujo = false,
}: {
  desfaseColumna?: 0 | 10;
  tituloCompacto?: boolean;
  punteadoEnFlujo?: boolean;
} = {}) {
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
      {/* QA 2026-07-26 (CDP): sección py 4vw (50 móvil) + fila pt 20 / pb 64
          (19.5 móvil); fila 80%/máx 1380, columnas 1/4-3/4 con gutter 5.5%. */}
      <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[70px] pt-[70px] md:flex-row md:gap-[5.5%] lg:pb-[calc(4vw+64px)] lg:pt-[calc(4vw+20px)]">
        {/* ---------- Columna izquierda (1/4) ---------- */}
        <div className="relative w-full md:w-[20.875%] md:shrink-0">
          {/* QA Fase 5 de /kunak-api (2026-07-28): sin `z-[-1]`. Con z-index
              negativo el punteado se pintaba detrás del `bg-white` de esta
              sección y no se veía; el original lo deja en `z-index: auto`. */}
          <img
            src="/images/uploads/2022/12/punteado.svg"
            alt=""
            aria-hidden
            width={60}
            height={22}
            className={
              punteadoEnFlujo
                // el margen del módulo es 30 en móvil y 28.1562 desde md
                ? "pointer-events-none mb-[30px] block md:mb-[28.1562px]"
                : "pointer-events-none absolute -left-[65px] -top-[40px]"
            }
            style={{ width: 60, height: 22 }}
          />
          {tituloCompacto ? (
            // 23/23 fw300 ls −0.5 pb 10, igual en 1280 y en 390 (medido).
            <h2 className="pb-[10px] text-[23px] font-light leading-[23px] tracking-[-0.5px] text-[#333]">
              Preguntas frecuentes
            </h2>
          ) : (
            <SectionTitle>Preguntas frecuentes</SectionTitle>
          )}
        </div>

        {/* ---------- Columna derecha (3/4) — los 19 toggles ----------
            QA 2026-07-26: cada toggle lleva border ARRIBA y ABAJO (1px 0px) y el
            módulo remata con mb 30. */}
        {/* El remate inferior de la columna de toggles NO es 30 (QA 2026-07-28,
            medido a 1280 y a 390 en los cuatro originales): va emparejado con
            `desfaseColumna`, porque son los dos márgenes del mismo módulo Divi.
              · desfase 0  (/monitor-calidad-aire, /accesorios) → remate **0**
                columna = 1176.6 = el bloque de toggles, sin nada debajo
              · desfase 10 (/software, /kunak-api)              → remate **40**
                columna = 1226.6 = 10 + 1176.6 + 40
            Con los 30 fijos de antes la sección salía +30 en las dos primeras y
            −10 en las dos últimas (este era el residuo K10 de la Fase 5). */}
        <div
          className={
            "w-full min-w-0 md:flex-1 " +
            (desfaseColumna === 10 ? "pb-[40px] md:pt-[10px]" : "pb-0")
          }
        >
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div
                key={item.q}
                // QA Fase 5 de /kunak-api (2026-07-28): el original NO pone
                // `border-y` en cada toggle — el 1.º lleva borde arriba y abajo
                // (alto 62.9) y del 2.º en adelante solo abajo (61.9), así que
                // entre dos toggles hay UNA raya de 1px, no dos pegadas. Con
                // `border-y` el bloque de 19 salía 18.1px más alto y pintaba una
                // doble raya de 2px. Verificado idéntico en el original de
                // /accesorios, /software y /kunak-api, a 1280 y a 390.
                className="border-b border-[#d9d9d9] px-[8px] py-[17px] transition-all duration-200 first:border-t hover:bg-[#f4f4f4]"
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
