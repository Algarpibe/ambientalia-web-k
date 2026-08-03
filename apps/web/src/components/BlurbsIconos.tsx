/**
 * Rejilla de blurbs de icono: **icono arriba centrado + título**, sin
 * descripción y sin enlace. Es el mismo módulo `et_pb_blurb` del tema en sus
 * dos calibraciones, así que vive en un solo componente parametrizado:
 *
 * | | `iconos-md-3` (/kunak-api) | `modulo-beneficios` (/software) |
 * |---|---|---|
 * | Caja móvil | **48%** + 2% (2 por fila desde 0) | 100% (1 por fila) |
 * | Corte | **480px** | 981px → el clon lo mapea a `md`, como `monitor/Beneficios` |
 * | Caja desktop | **30%** + 3% | **31%** + 2% |
 * | `<h4>` | **18 / 21.6** | **16 / 19.2** |
 *
 * Anatomía común, medida en vivo el 2026-07-27 a cw 1264.7 en las dos páginas:
 * el `et_pb_only_image_mode_wrap` mete `padding-top: 6px` y `margin-bottom:
 * -10px`, y el `.et_pb_main_blurb_image` remata con `margin-bottom: 30px` →
 * **6 arriba + 50 de icono + 20 hasta el título**. El `margin-bottom` de módulo
 * es 27.82 a cw 1264.7 (el 2,2% del ancho de ventana) en ambas.
 *
 * ⚠️ Separación horizontal: el tema la pinta con `margin-inline-end` y la
 * anula con `:nth-child(3n+1)`, que cuenta sobre **todos** los hijos de la
 * columna Divi (los módulos de texto que van antes también cuentan). En
 * /kunak-api eso cae justo en los blurbs 3 y 6 → huecos uniformes; en /software
 * cae en el 2 y el 5 → el 2.º y el 3.º de cada fila salen **pegados**. El clon
 * usa `gap-x` (huecos uniformes) en las dos: en /kunak-api es exacto y en
 * /software mantiene lo que ya se construyó y verificó (ver PENDIENTES-QA, A5).
 */

/** Bloque repetible del CMS: solo icono y título. */
export interface BlurbIconoItem {
  icono: string;
  titulo: string;
}

const VARIANTES = {
  /** `.iconos-xs-2 .iconos-md-3` — 2 por fila siempre, 3 desde 480px. */
  "iconos-md-3": {
    lista: "flex list-none flex-row flex-wrap gap-x-[2%] p-0 min-[480px]:gap-x-[3%]",
    caja: "w-[48%] min-[480px]:w-[30%]",
    // 20 = los 30 del `.et_pb_main_blurb_image` menos los −10 del wrap interno
    icono: "mb-[20px]",
    // el `letter-spacing: -0.5px` lo pone la regla global de h1–h6.
    // QA Fase 5 de /kunak-api (2026-07-28): el h4 NO es 18/21.6 a todos los
    // anchos — el original baja a **16/19.2 por debajo de 981px** (corte
    // barrido a 390/420/479/480/560/640/767/768/900/980/981/1100/1280). Con
    // 18/21.6 fijo cada título de 1 línea salía +2.4 y los de 2 líneas +4.8.
    titulo:
      "pb-[10px] text-[16px] font-light leading-[19.2px] text-[#333] min-[981px]:text-[18px] min-[981px]:leading-[21.6px]",
  },
  /** `.modulo-beneficios` — ancho completo hasta el corte, 3 por fila desde él. */
  "modulo-beneficios": {
    lista: "flex list-none flex-col p-0 md:flex-row md:flex-wrap md:gap-x-[2%]",
    caja: "w-full md:w-[31%]",
    icono: "mb-[30px]",
    titulo: "text-[16px] font-normal leading-[19.2px] text-[#333]",
  },
} as const;

export type BlurbsIconosVariante = keyof typeof VARIANTES;

export function BlurbsIconos({
  items,
  variante,
  className = "",
}: {
  items: readonly BlurbIconoItem[];
  variante: BlurbsIconosVariante;
  /** Clases extra para el `<ul>` (márgenes de módulo del sitio que lo usa). */
  className?: string;
}) {
  const v = VARIANTES[variante];
  return (
    <ul className={v.lista + " " + className}>
      {items.map((b) => (
        <li
          key={b.titulo}
          // pt 6 = el `padding-top` del `et_pb_only_image_mode_wrap`.
          // mb 30 en móvil / 27.82 desde md (medido en ambos anchos).
          className={"mb-[30px] pt-[6px] md:mb-[27.82px] " + v.caja}
        >
          {/* Los `alt` del original son textos heredados de otra página
              ("Interfaz API Rest" repetido 6 veces, "Cartridges system"…):
              se emiten decorativos, mismo criterio que en /software. */}
          <img
            src={b.icono}
            alt=""
            aria-hidden
            width={50}
            height={50}
            className={"mx-auto block object-contain " + v.icono}
            style={{ width: 50, height: 50 }}
          />
          <h4 className={"text-center " + v.titulo}>{b.titulo}</h4>
        </li>
      ))}
    </ul>
  );
}
