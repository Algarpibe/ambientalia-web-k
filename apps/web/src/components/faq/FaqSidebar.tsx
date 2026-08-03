import { FAQ_SIDEBAR } from "@/lib/grupo-c-plantilla";

/**
 * `#sidebar` — la barra lateral estándar del sitio, en su hueco derecho
 * (`et_right_sidebar`).
 *
 * ⚠ **Es plantilla, no campo.** El modelo de la FAQ (`MODELO.md` §2) no la
 * mencionaba y la salida servida la trae: la medición de C-3 la destapó
 * (`MEDICION.md` §5.3). Que exista **no refuta P-C3-7** —no aparece ningún
 * campo nuevo en la FAQ— pero sí corrige la frase «el arquetipo más barato
 * posible»: es barato en campos, no en cascarón.
 *
 * Los cuatro widgets, en el orden del original: Buscar · un `widget_text`
 * **vacío** (se reproduce, ocupa hueco) · Categorías · Suscríbete.
 */
export function FaqSidebar() {
  const { buscar, categorias, newsletter } = FAQ_SIDEBAR;
  return (
    <div id="sidebar" className="mt-[50px] md:mt-0 md:w-[25%] md:pl-[5.5%]">
      <div className="et_pb_widget widget_search mb-[30px]">
        <h4 className="widgettitle mb-[10px] text-[18px] font-bold text-[#333]">
          {buscar.titulo}
        </h4>
        <form role="search" method="get" action={buscar.accion} className="searchform">
          <div>
            <label className="sr-only" htmlFor="s">
              Buscar:
            </label>
            <input
              type="text"
              name="s"
              id="s"
              defaultValue=""
              className="w-full border border-[#ddd] px-[10px] py-[8px] text-[16px]"
            />
            <input type="submit" id="searchsubmit" value="Buscar" className="sr-only" />
          </div>
        </form>
      </div>

      {/* `widget_text` vacío del original: sin contenido, pero con su caja. */}
      <div className="et_pb_widget widget_text mb-[30px]" />

      <div className="et_pb_widget widget_text mb-[30px]">
        <h4 className="widgettitle mb-[10px] text-[18px] font-bold text-[#333]">
          {categorias.titulo}
        </h4>
        <ul className="text-[16px] leading-[30.6px]">
          {categorias.items.map((c) => (
            <li key={c.href} className="cat-item">
              <a href={c.href} className="text-[#333] hover:text-[#0075C9]">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="et_pb_widget widget_text">
        <h4 className="widgettitle mb-[10px] text-[18px] font-bold text-[#333]">
          {newsletter.titulo}
        </h4>
        {/* El original sirve un `<span role="link">` con la URL en base64; aquí
            va un `<a>` de verdad — ver la razón en `grupo-c-plantilla.ts`. */}
        <a
          href={newsletter.href}
          className="inline-block rounded-[3px] bg-[#0075C9] px-[20px] py-[8px] text-[16px] text-white transition-opacity hover:opacity-80"
        >
          {newsletter.label}
        </a>
      </div>
    </div>
  );
}
