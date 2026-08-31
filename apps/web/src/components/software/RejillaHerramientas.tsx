import { HERRAMIENTAS, type Herramienta } from "@/lib/software";

/**
 * S3 · #herramientas — 16 tarjetas con captura de dashboard.
 * Spec: docs/research/software/components/rejilla-herramientas.spec.md
 *
 * El original no usa `grid`: son blurbs `inline-block` con la clase
 * `iconos-md-2` → `width: 47%` + `margin-inline-end: 5.5%` desde 480px, dos por
 * fila, con `margin-bottom: 40px`. Aquí se reproduce con flex-wrap y el margen
 * derecho anulado en los pares (mismo resultado geométrico: 350.1px de tarjeta
 * y 40.96 de separación a cw 1264.7; 399 a 1440).
 *
 * Captura 1800×1200 (ratio 3:2) a ancho completo con radius 10, gap 30 hasta el
 * h3 (26px/26 fw300 con pb 10) y descripción a 18px/30.6. Sin hover: las
 * tarjetas no son enlaces.
 *
 * `loading="lazy"`: las 16 capturas suman ~4,4 MB a resolución original y se
 * muestran a 350-400px. El original también las marca como perezosas.
 */
export function RejillaHerramientas({ items = HERRAMIENTAS }: { items?: Herramienta[] } = {}) {
  return (
    <ul className="m-0 flex list-none flex-col p-0 min-[480px]:flex-row min-[480px]:flex-wrap">
      {/* MARCADOR DE SONDA (130.ª) — `data-modulo` como ATRIBUTO sobre el
          `<li>`, que es el 1:1 del `.et_pb_blurb` con clase `iconos-md-2` del
          original. Es el marcador que lleva uno de los CAMPO de este arquetipo:
          el ESQUEMA mide `iconos-md-2 · mb · 40px !important` sobre
          `.et_pb_blurb_15/16` con selector ORDINAL, o sea escrito por el
          editor. Lo consume `productos-cmp` (`[data-modulo]`). */}
      {items.map((h) => (
        <li
          key={h.titulo}
          data-modulo="blurb"
          className="mb-[40px] w-full min-[480px]:mr-[5.5%] min-[480px]:w-[47%] min-[480px]:[&:nth-child(2n)]:mr-0"
        >
          <img
            src={h.captura.src}
            alt={h.captura.alt}
            width={h.captura.width}
            height={h.captura.height}
            loading="lazy"
            decoding="async"
            className="mb-[30px] block h-auto w-full rounded-[10px]"
          />
          <h3
            className="pb-[10px]"
            style={{
              fontSize: 26,
              lineHeight: "26px",
              fontWeight: 300,
              letterSpacing: "-0.5px",
              color: "#333",
            }}
          >
            {h.titulo}
          </h3>
          <p style={{ fontSize: 18, lineHeight: "30.6px", fontWeight: 400, color: "#333" }}>
            {h.descripcion}
          </p>
        </li>
      ))}
    </ul>
  );
}
