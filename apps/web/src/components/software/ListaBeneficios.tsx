import { BENEFICIOS, type Beneficio } from "@/lib/software";

/**
 * S3 · #beneficios — 9 blurbs a ancho completo de la columna 3/4.
 * Spec: docs/research/software/components/lista-beneficios.spec.md
 *
 * Misma tipografía que el bloque `Beneficios` de /monitor-calidad-aire
 * (icono 40 + gap 15 + h3 24/28.8 fw300 + p 16/21.92), pero **uno por fila**:
 * aquí el original no aplica el 31% de `.modulo-beneficios`, los blurbs ocupan
 * los 744.9 de la columna. Bloque 100 % estático: sin enlaces ni hover.
 *
 * Los `alt` del original son textos en inglés de otra página que no describen
 * el icono ("Easy fast installation" para el candado de "Seguro y
 * confidencial"): se emiten como decorativos, igual que en el monitor.
 */
export function ListaBeneficios({ items = BENEFICIOS }: { items?: Beneficio[] } = {}) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {/* MARCADOR DE SONDA (130.ª) — `data-modulo` sobre el `<li>`, que ya
          existe: el original sirve aquí un `.et_pb_blurb` por beneficio y el
          `<li>` es su 1:1, así que va como ATRIBUTO y no puede mover un píxel
          por construcción. Lo consume `productos-cmp` (`[data-modulo]`). */}
      {items.map((b) => (
        <li key={b.titulo} data-modulo="blurb" className="mb-[27.81px]">
          <div className="flex items-start gap-[15px]">
            <img
              src={b.icono}
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
                style={{
                  fontSize: 24,
                  lineHeight: "28.8px",
                  fontWeight: 300,
                  letterSpacing: "-0.5px",
                  color: "#333",
                }}
              >
                {b.titulo}
              </h3>
              <p style={{ fontSize: 16, lineHeight: "21.92px", fontWeight: 400, color: "#333" }}>
                {b.descripcion}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
