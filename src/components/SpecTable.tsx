import { Fragment } from "react";
import type { AccesorioSpecs, SpecCell } from "@/lib/accesorios";

/**
 * Tabla de especificaciones de una ficha de accesorio.
 * Spec: docs/research/accesorios/components/spec-table.spec.md
 *
 * Dos formas medidas en el original (`<table>` HTML plano, el plugin
 * table-maker está cargado pero NO se usa):
 *   · `matrix` — 4 columnas, cabecera en negrita, celdas CENTRADAS, pad 6/24.
 *   · `pairs`  — `<th>` fw700 + `<td>`, alineadas a la IZQUIERDA, pad 9/24.
 * Común: border 1px #333 colapsado, 15px #333, ancho 100% de la columna.
 *
 * Móvil ARREGLADO (decisión 2026-07-27): el original deja las tablas `matrix`
 * en 472/432px dentro de una columna de 312 y `.et-boc { overflow-x: hidden }`
 * las CORTA sin scroll — la 4ª columna queda inalcanzable. Aquí el envoltorio
 * lleva `overflow-x: auto`, así que a <640 se desplazan dentro de su caja y a
 * ≥640 el contenedor es inocuo (la tabla cabe al 100%, como el original).
 */
export function SpecTable({ specs }: { specs: AccesorioSpecs }) {
  return (
    // `clear: both` + `margin-bottom: 48px` son de la `<table>` del original:
    // sin el clear, el envoltorio (BFC por `overflow-x`) se encoge al lado del
    // float de la imagen (588px en vez de 848) y las celdas envuelven.
    // En desktop `overflow-x:auto` es inerte —la tabla cabe al 100%—; en móvil
    // es lo que da el scroll horizontal que el original no ofrece.
    <div className="clear-both mb-[48px] overflow-x-auto">
      <table
        className={
          "w-full border-collapse border border-[#333] text-[15px] text-[#333] " +
          // solo las `matrix` (4 columnas) necesitan desplazarse en móvil; las
          // `pairs` caben en los 312px de la columna, igual que en el original
          (specs.kind === "matrix" ? "min-w-[420px] sm:min-w-0" : "")
        }
      >
        {specs.kind === "matrix" ? <MatrixBody specs={specs} /> : <PairsBody specs={specs} />}
      </table>
    </div>
  );
}

function Cell({ value }: { value: SpecCell }) {
  if (Array.isArray(value)) {
    // el original separa las líneas con <br>
    return (
      <>
        {value.map((line, i) => (
          <Fragment key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </>
    );
  }
  return <>{value}</>;
}

const ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function MatrixBody({ specs }: { specs: Extract<AccesorioSpecs, { kind: "matrix" }> }) {
  return (
    <>
      {/* Los anchos van inline como en el original: con reparto `auto` la
          última columna se ensancha y cambian los saltos de línea (la fila de
          12W del panel solar pasa de 3 líneas a 2). */}
      <colgroup>
        {specs.colWidths.map((w, i) => (
          <col key={i} style={{ width: w }} />
        ))}
      </colgroup>
      {/* El original usa `<td><strong>` dentro del tbody; aquí `<th scope="col">`
          en un thead: mismo render (fw700 centrado) y semántica correcta. */}
      <thead>
        <tr>
          {specs.header.map((h) => (
            <th
              key={h}
              scope="col"
              className="border border-[#333] px-[24px] py-[6px] text-center font-bold"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {specs.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className={
                  "border border-[#333] px-[24px] py-[6px] font-normal " +
                  (ALIGN[specs.align[j]] ?? "text-center")
                }
              >
                <Cell value={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {specs.note ? (
        <tfoot>
          <tr>
            <td
              colSpan={specs.header.length}
              className="border border-[#333] px-[24px] py-[6px] text-right text-[10px]"
            >
              {specs.note}
            </td>
          </tr>
        </tfoot>
      ) : null}
    </>
  );
}

function PairsBody({ specs }: { specs: Extract<AccesorioSpecs, { kind: "pairs" }> }) {
  return (
    <tbody>
      {specs.rows.map(([label, value]) => (
        <tr key={label}>
          {/* 55.4054% es el ancho inline del original; con `auto` la columna
              de valores se estrecha y alguna fila envuelve de más */}
          <th
            scope="row"
            className="w-[55.4054%] border border-[#333] px-[24px] py-[9px] text-left font-bold"
          >
            {label}
          </th>
          <td className="border border-[#333] px-[24px] py-[6px] text-left font-normal">
            <Cell value={value} />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
