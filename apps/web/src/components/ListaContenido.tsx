"use client";

import type { AccesorioItem } from "@/types/kunak";
import { useListaContenido } from "@/hooks/useListaContenido";
import { OutlineButton } from "./SectionRow";

/**
 * Shortcode `lista-contenido` del tema KunakAir en su variante **accesorios**
 * (`#producto-accesorios-*`): lista de etiquetas a la izquierda (⊕/⊖, la activa
 * en azul) y tarjeta con foto + intro + "Ver más" a la derecha.
 *
 * Es el mismo mecanismo que `ProductosTabs` (#lista-soluciones) — compartido en
 * `useListaContenido` — pero con el modelo de datos reducido del shortcode de
 * accesorios: sin subtítulo en la etiqueta y sin destacado/ventajas en el panel.
 *
 * Instancias de la página: "Sondas meteorológicas" (#meteo-sensors) y, cuando
 * se capturen sus datos y fotos, "Paquetes de energía" (#power-packs).
 *
 * Spec: docs/research/monitor-calidad-aire/components/sondas-meteorologicas.spec.md
 */
const PLUS_ICON = "/images/theme/ico-plus-negro.svg";
const MINUS_ICON = "/images/theme/ico-minus-azul.svg";

export function ListaContenido({ items }: { items: AccesorioItem[] }) {
  const { activeId, liRef, onEnter, onClick } = useListaContenido(items[0]?.id ?? null);
  const active = items.find((i) => i.id === activeId) ?? null;

  return (
    // Los floats del original (lista 30% a la izquierda, contenido 60% a la
    // derecha) se emulan con flex + justify-between: a ≥1080 da los mismos
    // 250px + 60% medidos en vivo. El panel SÍ puede encoger (sin shrink-0)
    // para no desbordar en la banda 768–980, donde el clon ya muestra la
    // retícula 1/4–3/4 que el original todavía tiene apilada.
    <div className="w-full overflow-hidden md:flex md:justify-between">
      <ul className="md:w-[30%] md:min-w-[239px] md:shrink-0 min-[1080px]:md:min-w-[250px]">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li
              key={item.id}
              ref={liRef(item.id)}
              className="mb-[10px] border-b border-[#999] pb-[10px] last:border-b-0 md:border-b-0 md:pb-0"
            >
              <button
                type="button"
                onMouseEnter={() => onEnter(item.id)}
                onClick={() => onClick(item.id)}
                aria-expanded={isActive}
                className={
                  "block w-full cursor-pointer bg-no-repeat py-[5px] pr-[50px] text-left text-[22px] font-normal leading-[1.2em] transition-opacity duration-300 " +
                  (isActive ? "opacity-100" : "opacity-30 hover:opacity-100")
                }
                style={{
                  color: isActive ? "#0075C9" : "#333",
                  backgroundImage: `url('${isActive ? MINUS_ICON : PLUS_ICON}')`,
                  backgroundPosition: "right 5px",
                  backgroundSize: "28px 28px",
                }}
              >
                {item.label}
              </button>

              {/* Duplicado inline del panel: el original lo tiene siempre en el
                  DOM y solo lo muestra <768 (acordeón táctil). */}
              {isActive ? (
                <div className="md:hidden">
                  <AccesorioPanel item={item} inline />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Columna de paneles — solo desktop (`display:none !important` a ≤767) */}
      <div className="hidden md:block md:w-[60%]">
        {active ? <AccesorioPanel item={active} /> : null}
      </div>
    </div>
  );
}

/**
 * `.lista-contenido-item` — tarjeta solo desde 768 (borde/radius/padding);
 * fila imagen 50% / texto 50% desde 576; columna por debajo.
 * `inline` = duplicado del acordeón móvil, donde el título es un `<p>` plano
 * (el del panel de escritorio es un `<h3>` de 32px).
 */
function AccesorioPanel({ item, inline = false }: { item: AccesorioItem; inline?: boolean }) {
  return (
    <div className="flex flex-col pb-[1.3rem] sm:flex-row md:mb-[2rem] md:rounded-[10px] md:border md:border-[#777] md:p-[30px] md:pb-[30px]">
      <div className="sm:w-1/2">
        <img src={item.image} alt="" width={300} height={300} className="h-auto w-full" />
      </div>

      <div className="sm:w-1/2">
        {inline ? (
          <p className="text-[18px] leading-[30.6px] text-[#333]">{item.label}</p>
        ) : (
          <h3
            className="pb-[10px]"
            style={{ fontSize: 32, lineHeight: "32px", fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
          >
            {item.label}
          </h3>
        )}

        <div className="mb-[20px] text-[18px] leading-[1.5em] text-[#333]">
          <p>{item.intro}</p>
        </div>

        <OutlineButton href={item.href}>Ver más</OutlineButton>
      </div>
    </div>
  );
}
