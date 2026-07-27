import { BENEFITS_ITEMS } from "@/lib/monitor";

/**
 * S3 · #benefits — grid 3×3 de icon-blurbs.
 * Spec: docs/research/monitor-calidad-aire/components/beneficios.spec.md
 *
 * ⚠️ Distinto del componente `Beneficios` de la home. El original usa la
 * columna 3/4 como flex-wrap y cada `.modulo-beneficios` a `width:31%;
 * margin-inline-end:2%` (≥981px; el 3º de cada fila sin margen). En el clon
 * mapeamos ese breakpoint a `md`. Bloque 100 % estático (sin enlaces ni hover).
 */
export function Beneficios() {
  return (
    <div>
      <h2
        className="pb-[10px]"
        style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Beneficios
      </h2>
      <p className="mb-[28px]" style={{ fontSize: 18, lineHeight: "30.6px", fontWeight: 400, color: "#333" }}>
        Facilitamos la toma de decisiones con datos ambientales precisos
      </p>

      <ul className="flex list-none flex-col p-0 md:flex-row md:flex-wrap">
        {BENEFITS_ITEMS.map((b) => (
          <li
            key={b.title}
            className="mb-[28px] w-full md:mr-[2%] md:w-[31%] md:[&:nth-child(3n)]:mr-0"
          >
            <div className="flex items-start gap-[15px]">
              <img
                src={b.icon}
                alt=""
                aria-hidden
                width={40}
                height={40}
                className="shrink-0 object-contain"
                style={{ width: 40, height: 40 }}
              />
              <div>
                <h3
                  className="pb-[10px]"
                  style={{ fontSize: 24, lineHeight: "28.8px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
                >
                  {b.title}
                </h3>
                <p style={{ fontSize: 16, lineHeight: "21.92px", fontWeight: 400, color: "#333" }}>{b.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
