import { SpecTable } from "./SpecTable";
import type { Accesorio } from "@/lib/accesorios";

/**
 * Ficha de accesorio del catálogo (`.accesorio-container` del original).
 * Spec: docs/research/accesorios/components/accesorio-card.spec.md
 *
 * DESKTOP (fiel): bloque sin borde ni fondo ni hover; imagen 260×244 flotada a
 * la DERECHA con `margin-top: -32px` (sube por encima del h3, y el texto la
 * rodea); h3 32px/32 fw300 con pl 10; texto 18px/30.6; contenedor mt 32 mb 48.
 *
 * MÓVIL ARREGLADO (decisión 2026-07-27): el original mantiene el float a 260px
 * en una columna de 312 y el h3 se parte letra a letra ("Pa/nel/sol/ar"). Aquí,
 * a <640px la imagen NO flota y se apila encima del título, que ocupa el ancho
 * completo. Desde `sm:` se restaura exactamente el original.
 */
export function AccesorioCard({ item }: { item: Accesorio }) {
  return (
    <div
      id={item.slug}
      // scroll-mt: el original aterriza el bloque a 80px del viewport al saltar
      // por ancla (BEHAVIORS §5); AnchorNav ya descuenta ese offset, esto cubre
      // además la navegación por hash directa (p. ej. desde /monitor-calidad-aire).
      // margins (no padding): el original usa `margin: 32px 0 48px` y los
      // márgenes COLAPSAN entre fichas → separación real de 48, no de 80.
      // `clear: both` es del original (evita que una ficha suba junto al float
      // de la anterior); por eso NO hace falta un divisor de clear al final.
      className="mt-[32px] mb-[48px] clear-both scroll-mt-[80px]"
    >
      {/* Medido en el original: `width: 260px` con `padding-left: 16px` en
          border-box → ancho de CONTENIDO 244, y alto AUTOMÁTICO. De ahí que
          las cuadradas rindan 260×244 y la del sensor UV-A (1024×555) mida
          260×132. `margin-top: -32px` la monta sobre el h3. */}
      <img
        src={item.image.src}
        alt={item.title}
        width={item.image.width}
        height={item.image.height}
        loading="lazy"
        decoding="async"
        className={
          // móvil ARREGLADO: bloque propio sobre el título, sin flotar
          "mb-4 block h-auto w-[260px] max-w-full pl-0 " +
          // ≥640: exactamente el original
          "sm:float-right sm:mb-0 sm:mt-[-32px] sm:pl-[16px]"
        }
      />

      {/* `padding: 0 0 10px` (regla Divi de titulares); sin sangría izquierda */}
      <h3 className="pb-[10px] text-[32px] font-light leading-[32px] text-[#333]">{item.title}</h3>

      <div className="text-[18px] leading-[30.6px] text-[#333]">
        {/* los <p> del original van a margin 0 / padding 0 */}
        {item.description.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}

        {/* medido: ul `padding: 0 0 18px 18px` y li de 26px de alto */}
        {item.bullets?.length ? (
          <ul className="m-0 list-disc pb-[18px] pl-[18px]">
            {item.bullets.map((b) => (
              <li key={b} className="leading-[26px]">
                {b}
              </li>
            ))}
          </ul>
        ) : null}

        {item.specs ? <SpecTable specs={item.specs} /> : null}

        {item.extraImage ? (
          <img
            src={item.extraImage.src}
            alt={item.extraImage.alt ?? item.title}
            width={item.extraImage.width}
            height={item.extraImage.height}
            loading="lazy"
            decoding="async"
            // sin margen y en flujo INLINE con `vertical-align: baseline` como
            // el original (Tailwind pone `middle` a las img): la caja de línea
            // aporta así los ~9px de descendente bajo la imagen
            className="inline h-auto w-full align-baseline"
          />
        ) : null}
      </div>
    </div>
  );
}
