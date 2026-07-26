import { OutlineButton } from "@/components/SectionRow";
import { SOFTWARE_PARAGRAPHS, SOFTWARE_MORE_HREF } from "@/lib/monitor";

/**
 * S3 · #software — "Software": H2 + 4 párrafos (2 con enlace inline) + botón
 * outline "Saber más".
 * Spec: docs/research/monitor-calidad-aire/components/software.spec.md
 *
 * ⚠️ El bloque NO lleva capturas de pantalla (PAGE_TOPOLOGY lo daba por
 * hecho; el original tiene 0 <img>). Es texto puro + botón.
 *
 * Los enlaces inline son visualmente indistinguibles del texto: la regla azul
 * del tema exige un ancestro `.et_pb_slide` que aquí no existe, así que
 * heredan #333 y solo cambian a #5e6770 (--gris-kunak) en hover.
 */
export function Software() {
  return (
    <div>
      <h2
        className="pb-[10px]"
        style={{ fontSize: 37, lineHeight: "37px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
      >
        Software
      </h2>

      {/* pb 18px en todos menos el último (igual que el original) */}
      {SOFTWARE_PARAGRAPHS.map((segs, p) => (
        <p
          key={p}
          className={p === SOFTWARE_PARAGRAPHS.length - 1 ? "pb-0" : "pb-[18px]"}
          style={{ fontSize: 18, lineHeight: "30.6px", fontWeight: 400, color: "#333" }}
        >
          {segs.map((s, i) =>
            s.href ? (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener"
                className="text-inherit no-underline transition-colors duration-300 hover:text-[#5e6770]"
              >
                {s.t}
              </a>
            ) : (
              <span key={i}>{s.t}</span>
            ),
          )}
        </p>
      ))}

      {/* margin-bottom 2.75% de la fila Divi → ~30px en el contenedor del clon */}
      <div className="mt-[30px]">
        <OutlineButton href={SOFTWARE_MORE_HREF}>Saber más</OutlineButton>
      </div>
    </div>
  );
}
