"use client";

import type { Product } from "@/types/kunak";
import { useListaContenido } from "@/hooks/useListaContenido";
import { SectionTitle, BlueButton, OutlineButton } from "./SectionRow";

/**
 * `et_pb_section_7` (rows 10–11) — "Nuestros productos".
 *
 * HOVER-driven tabs (NOT click), transcribed from
 * `themes/KunakAir/assets/js/init.js`:
 *   $("#lista-soluciones li span").on("mouseenter", toggleActiveClasses)
 * Desktop (≥768px): mouseenter over a tab swaps the right panel instantly
 * (no fade). Mobile (<768px): behaves as an accordion — tapping the active
 * item closes it; the panel renders inside each `<li>`.
 * El mecanismo vive en `useListaContenido`, compartido con `ListaContenido`
 * (la variante "accesorios" del mismo shortcode).
 *
 * ⚠ **`items` es OBLIGATORIO desde F2-3** y eso es la migración, no estilo. Tenía
 * de defecto `PRODUCTS_TABS` —o sea el catálogo medido importado dentro de un
 * componente—, y con los productos ya en el CMS ese defecto sería una **segunda
 * fuente de verdad** que además no da error: la home habría seguido pintando el
 * fichero mientras las otras dos instancias pintaban la DB. El dato lo espera la
 * página y baja por prop (§F2-3-ASYNC-HIJO).
 *
 * Spec: docs/research/components/productos-tabs.spec.md
 */
const PLUS_ICON = "/images/theme/ico-plus-negro.svg";
const MINUS_ICON = "/images/theme/ico-minus-azul.svg";

export function ProductosTabs({
  items,
  sinTitulo = false,
}: {
  items: Product[];
  /**
   * `sinTitulo` — las páginas de sector titulan el bloque **"Nuestras
   * soluciones"** y lo hacen en su propia fila, con el punteado, porque el
   * titular y la lista viven en filas Divi distintas. Con esta prop el
   * componente aporta solo la lista + el panel; el titular y la fila los pone
   * la página, que además usa la retícula del sector (86%, no el 85%) y el
   * ritmo de fila del sector (`py: 30 móvil / 28.7969 desktop`, no el
   * `pt 28 / pb 123` de la home).
   */
  sinTitulo?: boolean;
}) {
  const { activeId, liRef, onEnter, onClick } = useListaContenido(items[0]?.id ?? null);
  const active = items.find((p) => p.id === activeId) ?? null;

  return (
    <section
      className={
        sinTitulo ? "relative" : "relative pb-[50px] pt-[30px] md:pb-[123px] md:pt-[28px]"
      }
    >
      <div
        // Marcador de fila SOLO cuando esta es la fila: con `sinTitulo` la pone
        // la página que envuelve el bloque, y marcar las dos declararía dos
        // filas anidadas donde el original tiene una.
        data-fila={sinTitulo ? undefined : ""}
        className={
          // Con `sinTitulo` la FILA la pone la página (el sector ya envuelve
          // este bloque en su retícula del 86%): aquí solo el ancho completo,
          // o se anidarían dos retículas y el panel saldría 100px estrecho.
          sinTitulo ? "w-full" : "mx-auto w-[86.35%] max-w-[1380px] md:w-[85%]"
        }
      >
        {/* Móvil: la lista arranca pegada al H2 (mb 0 del módulo de título) */}
        {sinTitulo ? null : (
          <div className="md:pb-[10px]">
            <SectionTitle>Nuestros productos</SectionTitle>
          </div>
        )}

        {/* El `md:mt-4` es el hueco de la home entre su titular y la lista; en
            el sector ese hueco ya lo pone el `margin-bottom` del módulo del h2
            (34.05), así que aquí sobra. */}
        <div
          className={
            "w-full overflow-hidden md:flex md:gap-[3%] " + (sinTitulo ? "" : "md:mt-4")
          }
        >
          {/* Left column — tab list (móvil: la UL Divi remata con pb18) */}
          <ul className="pb-[18px] md:w-[30%] md:min-w-[250px] md:shrink-0 md:pb-0">
            {items.map((p) => {
              const isActive = p.id === activeId;
              return (
                <li
                  key={p.id}
                  ref={liRef(p.id)}
                  className="mb-[10px] border-b border-[#999] pb-[10px] last:border-b-0 md:border-b-0 md:pb-0"
                >
                  <button
                    type="button"
                    onMouseEnter={() => onEnter(p.id)}
                    onClick={() => onClick(p.id)}
                    aria-expanded={isActive}
                    className={
                      "block w-full cursor-pointer bg-no-repeat pr-[50px] text-left transition-opacity duration-300 " +
                      (isActive ? "opacity-100" : "opacity-30 hover:opacity-100")
                    }
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      paddingTop: 5,
                      paddingBottom: 5,
                      color: isActive ? "#0075C9" : "#333",
                      backgroundImage: `url('${isActive ? MINUS_ICON : PLUS_ICON}')`,
                      backgroundPosition: "right 5px",
                      backgroundSize: "28px 28px",
                    }}
                  >
                    {p.name}
                    <strong className="block text-[16px] font-normal">{p.tagline}</strong>
                  </button>

                  {/* Mobile accordion panel — sin hueco tras el header, como
                      .lista-contenido-item del original */}
                  {isActive ? (
                    <div className="md:hidden">
                      <ProductPanel product={p} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Right column — active panel (desktop only) */}
          <div className="hidden md:block md:w-[63%]">
            {active ? <ProductPanel product={active} alto={sinTitulo} /> : null}
          </div>
        </div>

        {/* Centered relative to the right panel column, like the original.
            Móvil: pb 3.89 fila + pt 30 fila botón ≈ 34
            En las páginas de sector este CTA NO existe: la fila del original
            solo lleva punteado + h2 + la lista (verificado en el DOM). */}
        {sinTitulo ? null : (
          <div className="mt-[34px] flex justify-center md:mt-[70px] md:pl-[33%]">
            <BlueButton href="/contacto">
              Cuéntanos tus necesidades
            </BlueButton>
          </div>
        )}
      </div>
    </section>
  );
}

/** Right-hand product panel. Card border/padding only from ≥768px. */
/**
 * `alto` — el panel del original tiene **`height: 500px` fijo** y
 * `margin-bottom: 32px` (medido a 1440 en el sector Y en la home). Se aplica
 * solo en las páginas de sector: allí la lista tiene 3 ítems y el panel manda
 * en la altura del bloque, así que sin los 500 el bloque salía +79.5. En la
 * home la lista de 5 ítems lo enmascara y el clon va a 497.5 con `mb 0`; se
 * deja como está para no tocar una página ya verificada — anotado para su QA.
 */
function ProductPanel({ product, alto = false }: { product: Product; alto?: boolean }) {
  const hasImage = product.image !== "";
  return (
    // Móvil (<640): rítmica del .lista-contenido-item original — imagen pegada
    // (+6), p 18px/27 con pb18, ul pt10/pb10 con li pb10+mb10, botón a +20 y
    // pb 21 al pie del panel (medido 2026-07-23)
    <div
      className={
        "flex flex-col gap-[6px] pb-[21px] sm:flex-row sm:gap-8 sm:pb-0 md:rounded-[10px] md:border md:border-[#777] md:p-[30px] " +
        (alto ? "md:mb-[32px] md:h-[500px]" : "")
      }
    >
      {hasImage ? (
        <div className="sm:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-full rounded"
          />
        </div>
      ) : null}

      <div className={hasImage ? "sm:w-1/2" : "w-full"}>
        <h3 className="hidden text-[20px] font-bold leading-[1.5] text-[#333] sm:block">
          {product.name}
        </h3>
        <p className="mt-0 pb-[18px] text-[18px] leading-[1.5] text-[#333] sm:mt-3 sm:pb-0 sm:leading-[1.45]">
          {product.description}
        </p>
        <p className="pb-[18px] text-[18px] leading-[1.5] text-[#333] sm:mt-4 sm:pb-0 sm:leading-[1.45]">
          {product.highlight}
        </p>
        {/* El título de la lista es CAMPO, con defecto explícito: los 5
            productos de la home dicen "Ventajas" y los 4 cartuchos que usan los
            casos de éxito dicen "Especificaciones". Estuvo cableado hasta que
            el grupo C pobló la segunda instancia (C-SP14). */}
        <p className="text-[18px] font-bold leading-[1.5] text-[#333] sm:mt-4 sm:leading-[1.45]">
          {product.bulletsTitulo ?? "Ventajas"}
        </p>
        {/* Móvil: sin viñetas y con divisor #999 por li (regla
            .lista-contenido-ul li del tema); bullets azules solo en sm+ */}
        <ul className="list-none pb-[10px] pl-0 pt-[10px] text-[18px] leading-[1.5] text-[#333] marker:text-[22px] marker:text-[#0075C9] sm:mt-2 sm:list-disc sm:pb-0 sm:pl-[28px] sm:pt-0">
          {/* Las viñetas admiten marcado en LÍNEA: los cartuchos traen
              `R<sup>2</sup>` y `μg/m<sup>3</sup>`, que son fórmulas y no
              adorno. Las de los 5 productos de la home son texto plano y salen
              byte a byte igual — lo prueba `qa:clon-base` con umbral cero. */}
          {product.bullets.map((b) => (
            <li
              key={b}
              className="mb-[10px] border-b border-[#999] pb-[10px] last:border-b-0 sm:mb-0 sm:border-b-0 sm:pb-0"
              dangerouslySetInnerHTML={{ __html: b }}
            />
          ))}
        </ul>
        <div className="mt-[20px] sm:mt-6">
          <OutlineButton href={product.href}>Ver más</OutlineButton>
        </div>
      </div>
    </div>
  );
}
