import { SPEC_ROWS, CERT_SEALS } from "@/lib/monitor";

/**
 * S3 · #specifications — tabla de 15 filas + sellos FCC/CE/RoHS.
 * Spec: docs/research/monitor-calidad-aire/components/especificaciones.spec.md
 *
 * ⚠️ NO es un <table>: réplica del plugin Divi Table Maker con CSS Grid
 * (33% / 67%). Bordes 1px #333 colapsados (borde izq/sup en el contenedor +
 * der/inf en cada celda), radius 10 en las 4 esquinas (vía overflow-hidden del
 * grid redondeado), hover de fila #eee SOLO en desktop, alto mínimo de fila 35.
 */
export function Especificaciones() {
  return (
    <div>
      <h2
        className="pb-[10px]"
        style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Especificaciones
      </h2>

      <div className="max-w-[880px] overflow-x-auto">
        <div className="grid grid-cols-[minmax(120px,33%)_minmax(160px,67%)] overflow-hidden rounded-[10px] border-l border-t border-[#333]">
          {SPEC_ROWS.map((row) => (
            <div key={row.label} className="group/row contents">
              <Cell>{row.label}</Cell>
              <Cell>
                {row.value.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </Cell>
            </div>
          ))}
        </div>
      </div>

      {/* Sellos FCC / CE / RoHS — flex align-baseline, gap 25/20 */}
      <div className="mt-[20px] flex flex-wrap items-baseline gap-x-[25px] gap-y-[20px]">
        {CERT_SEALS.map((c) => (
          <img key={c.alt} src={c.src} alt={c.alt} className="max-h-[40px] w-auto object-contain" />
        ))}
      </div>
    </div>
  );
}

/** Celda de la tabla: borde inferior/derecho (colapsa con el izq/sup del grid),
 *  fondo blanco, texto 15px/1.4 #333, y hover de fila #eee solo ≥md. */
function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[35px] flex-col justify-center border-b border-r border-[#333] bg-white px-[20px] py-[8px] text-[15px] leading-[1.4] text-[#333] md:group-hover/row:bg-[#eee]">
      {children}
    </div>
  );
}
