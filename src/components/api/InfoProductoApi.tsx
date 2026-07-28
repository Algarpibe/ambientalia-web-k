import { BlurbsIconos } from "@/components/BlurbsIconos";
import { CARACTERISTICAS, INFO } from "@/lib/api";

/**
 * S1 · fila 2 — "Información del producto" de /kunak-api.
 * Spec: docs/research/kunak-api/components/info-producto-api.spec.md
 *
 * Columnas 1/3 + 2/3 (29.6667% / 64.833%, gutter 5.5%), la misma retícula que
 * la fila 2 de /monitor-calidad-aire y /software. La fila lleva
 * `padding: 20px 0 5%`.
 *
 * Diferencias con `InfoProductoSoftware`: aquí el rótulo de la columna 1/3 **sí
 * es un `<h2>`** (allí es un `<p>`), la columna no lleva foto ni CTA de vídeo, y
 * la 2/3 es la versión corta — párrafo, titular azul, párrafo, "Características:"
 * y los 6 blurbs. Sin carrusel y sin párrafo de cierre.
 *
 * Ritmo Divi medido a cw 1264.7 (los márgenes de módulo colapsan entre
 * hermanos): intro `mt 10 / mb −1`, h2 azul `20/20`, párrafo `10/20`,
 * "Características:" `10 / 27.82`. Como −1 y 20 colapsan a 19, el hueco real
 * intro→h2 es 19 y el resto 20: se pinta con `space-y-[20px]` y un `-mb-[1px]`
 * en el párrafo de entrada.
 */
export function InfoProductoApi() {
  return (
    <div className="mx-auto flex w-[80%] max-w-[1380px] flex-col gap-[30px] pb-[30px] pt-[20px] md:flex-row md:items-start md:gap-[5.5%] md:pb-[5vw]">
      {/* ---------- Columna 1/3 ---------- */}
      <div className="relative w-full md:w-[29.6667%] md:shrink-0">
        <img
          src="/images/uploads/2022/12/punteado.svg"
          alt=""
          aria-hidden
          width={60}
          height={22}
          className="pointer-events-none absolute -left-[65px] -top-[40px] z-[-1]"
          style={{ width: 60, height: 22 }}
        />
        {/* 44px/55 en desktop y 35/43.75 en móvil, como todos los titulares de
            sección. Módulo sin `margin-bottom`: el h2 solo lleva su pb de 10. */}
        <h2
          className="pb-[10px] text-[35px] leading-[43.75px] md:text-[44px] md:leading-[55px]"
          style={{ fontWeight: 300, letterSpacing: "-0.5px", color: "#333" }}
        >
          {INFO.heading}
        </h2>
      </div>

      {/* ---------- Columna 2/3 — ritmo Divi de 20px entre módulos ---------- */}
      <div className="w-full min-w-0 space-y-[20px] pt-[10px] md:w-[64.833%]">
        {/* `mb-[19px]`, no `-mb-[1px]`: el módulo del párrafo de entrada lleva
            `margin-bottom: -1px` en el original, que COLAPSA con los 20 del
            siguiente → 19 de hueco. Aquí hay que escribir el resultado, porque
            el `margin-bottom` de `space-y` va con `:where()` (especificidad 0)
            y cualquier clase de margen propia lo sustituye en vez de sumarse. */}
        <p className="mb-[19px] text-[18px] leading-[30.6px] text-[#333]">
          {INFO.parrafoIntro.antes}
          {/* ruta LOCAL: /software-de-medicion-calidad-del-aire ya está clonada.
              El original abre en pestaña nueva (`target="_blank"`); dentro del
              clon no tiene sentido, así que se emite como enlace normal. */}
          <a
            href={INFO.parrafoIntro.enlaceHref}
            className="text-[#0075C9] hover:text-[#005ea3]"
          >
            {INFO.parrafoIntro.enlaceLabel}
          </a>
          {INFO.parrafoIntro.despues}
        </p>

        {/* Titular azul de 37px. Aquí NO lleva la bajada de 17pt que sí tienen
            los dos bloques azules de /software. */}
        <h2
          className="pb-[10px]"
          style={{
            fontSize: 37,
            lineHeight: "37px",
            fontWeight: 300,
            letterSpacing: "-0.5px",
            color: "#0075C9",
          }}
        >
          {INFO.h2Azul}
        </h2>

        <p className="text-[18px] leading-[30.6px] text-[#333]">{INFO.parrafo}</p>

        {/* `pb-[7.82px]` (padding, no margin): el módulo cierra con 27.82 y el
            `space-y` ya pone 20 — un margen se colaparía con él y perderíamos
            los 7.82; el padding se suma. */}
        <p className="pb-[7.82px] text-[18px] leading-[30.6px] text-[#333]">
          {INFO.caracteristicasLabel}
        </p>

        <BlurbsIconos items={CARACTERISTICAS} variante="iconos-md-3" />
      </div>
    </div>
  );
}
