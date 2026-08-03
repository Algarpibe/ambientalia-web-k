import type { CasoDeExito } from "@/types/kunak";
import { hrefTermino } from "@/lib/taxonomia-sectores";

/**
 * `.main-title.titulo-puntos` — sobretítulo, `h1`, cliente y chip de sector.
 *
 * Medido (varianza cero en 6 instancias × 2 anchos):
 *   contenedor  `.container` 1152/312, `pt 60` a 1440 y `33` a 390
 *   sobretítulo 15px/30.6 w800 ls 0.1 uppercase `#0075C9`
 *   h1          44px/50.6 w300 ls −0.5 `#333`, `pb 7`
 *   cliente     18px/21.6 uppercase
 *   chip        14px/17.5 (1440) · 14px/19.6 (390)
 *
 * ── El sobretítulo «Caso de éxito» NO es campo ─────────────────────────────
 * Un solo valor en 57/57. Va cableado aquí a propósito, y está en `MODELO.md`
 * con su evidencia para que nadie lo promocione después.
 *
 * ── El chip y la fila de detalles son la MISMA cosa ────────────────────────
 * Un solo dato (`caso.sectores`) con dos proyecciones. En los 4 casos sin
 * términos el original **emite el `<span class="case-sectores">` vacío**, no lo
 * omite: se reproduce, porque un contenedor vacío no es lo mismo que ningún
 * contenedor.
 *
 * C-SP12, cerrada en C-3: **el chip del detalle SÍ enlaza** a
 * `/es/sector/<slug>/`, un `<a>` por término. Ese archivo de taxonomía es del
 * grupo B y **no está clonado**, así que por la regla de rutas locales el
 * enlace se queda apuntando al original.
 */
export function CasoCabecera({ caso }: { caso: CasoDeExito }) {
  const terminos = caso.sectores ?? [];
  return (
    <div className="main-title titulo-puntos">
      <p className="sobretitulo text-[15px] font-extrabold uppercase leading-[30.6px] tracking-[0.1px] text-[#0075C9]">
        Caso de éxito
      </p>

      <h1 className="entry-title pb-[7px] text-[44px] font-light leading-[50.6px] tracking-[-0.5px] text-[#333]">
        {caso.titulo}
      </h1>

      <div className="case-cliente text-[18px] uppercase leading-[21.6px] text-[#333]">
        {caso.cliente}
      </div>

      <div className="case-taxonomies">
        <span className="case-sectores text-[14px] leading-[19.6px] text-[#333] md:leading-[17.5px]">
          {terminos.length ? (
            <>
              {terminos.length > 1 ? "Sectores: " : "Sector: "}
              {terminos.map((t, i) => (
                <span key={t.slug}>
                  {i > 0 ? ", " : ""}
                  <a href={hrefTermino(t)} className="hover:underline">
                    {t.nombre}
                  </a>
                </span>
              ))}
            </>
          ) : null}
        </span>
      </div>
    </div>
  );
}
