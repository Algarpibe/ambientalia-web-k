import { BlurbsIconos } from "@/components/BlurbsIconos";
import { BENEFICIOS, BENEFICIOS_HEADING, BENEFICIOS_INTRO } from "@/lib/api";

/**
 * S1 · fila 3 — "Beneficios" de /kunak-api.
 * Spec: docs/research/kunak-api/components/beneficios-api.spec.md
 *
 * Columnas **1/4 + 3/4** (20.875% / 73.625%, gutter 5.5%) con
 * `padding: 20px 0 5%`, la misma retícula que la columna de anclas de
 * /monitor-calidad-aire, /accesorios y /software — pero **aquí la columna 1/4
 * solo lleva el titular**: sin `menu-anclas`, sin CTAs debajo y sin `sticky`.
 * Es la diferencia estructural más importante de esta página.
 *
 * ⚠️ No confundir con `ListaBeneficios` de /software: allí el beneficio es
 * icono-a-la-izquierda a ancho completo, con `<h3>` de 24px y descripción.
 * Aquí es el MISMO blurb de icono-arriba centrado y sin descripción que las
 * características de la fila 2, solo que a 30% de una columna más ancha
 * (223.5 frente a 196.8 a cw 1264.7).
 */
export function BeneficiosApi() {
  return (
    <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[30px] pt-[20px] md:flex-row md:items-start md:gap-[5.5%] md:pb-[5vw]">
      {/* ---------- Columna 1/4 — solo el titular ---------- */}
      <div className="relative w-full md:w-[20.875%] md:shrink-0">
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
          style={{ width: 60, height: 22 }}
        />
        <h2
          className="pb-[10px] text-[35px] leading-[43.75px] md:text-[44px] md:leading-[55px]"
          style={{ fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
        >
          {BENEFICIOS_HEADING}
        </h2>
      </div>

      {/* ---------- Columna 3/4 ---------- */}
      <div className="w-full min-w-0 pt-[10px] md:w-[73.625%]">
        {/* El módulo del párrafo cierra con `padding-bottom: 20px` ADEMÁS de sus
            20 de `margin-bottom` (medido: módulo 142.4 = 122.4 del `<p>` + 20). */}
        <p className="mb-[20px] pb-[20px] text-[18px] leading-[30.6px] text-[#333]">
          {BENEFICIOS_INTRO}
        </p>

        <BlurbsIconos items={BENEFICIOS} variante="iconos-md-3" />
      </div>
    </div>
  );
}
