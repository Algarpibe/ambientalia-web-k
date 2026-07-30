import type { CampoRico, CampoRicoEnLinea } from "@/types/kunak";

/**
 * `.entry-content.entry-content-{need,solution,results}` — uno de los tres
 * bloques ricos del caso.
 *
 * ── Tres campos y no uno con secciones, ni un array ────────────────────────
 * Los títulos «Necesidad · Solución · Resultados» son **constantes en 57/57** y
 * su orden también (un solo orden en todo el corpus), así que **no son
 * contenido**: van aquí, en la plantilla. Con tres campos obligatorios la
 * obligatoriedad vive en el esquema en vez de en lógica condicional del admin.
 *
 * C-SP4 (si el original los guarda como 3 campos ACF o como un `post_content`
 * troceado) **no condiciona**: la salida servida muestra tres contenedores con
 * clase propia, y tres campos la reproducen venga de donde venga. Es el
 * principio del repo — se verifica contra la salida servida, no contra la
 * fuente que uno supone responsable.
 *
 * Medido (varianza cero en 6 instancias): `h2` 20px/20 w700 ls −0.5 · el
 * contenedor 18px/30.6 `#333`.
 *
 * ── El `destacado` se pinta AQUÍ, y por medición ───────────────────────────
 * C-SP9, cerrada en C-3: en el original `.texto-destacado` vive **dentro del
 * contenedor del bloque `necesidad`, como su último hijo**. Es campo aparte del
 * modelo —49/57, y falta con el bloque presente— pero **se renderiza dentro**,
 * que es lo que hace el original. Y lleva marcado en línea (`strong`, `br`), no
 * es texto plano.
 *
 * ── El HTML entra crudo, y eso es la decisión, no un atajo ─────────────────
 * `CLAUDE.md` §Dónde para el modelado: hasta el contenedor de contenido se
 * modela; a partir de ahí el contenido lleva su estructura dentro y se declara
 * **rico**. El contrato de qué admite está medido y escrito en
 * `docs/ESQUEMA-CMS.md` §3.1 — «rico» aquí no quiere decir «cualquier cosa».
 */
export function CasoBloque({
  titulo,
  html,
  destacado,
  className = "",
}: {
  titulo: string;
  html: CampoRico;
  destacado?: CampoRicoEnLinea;
  className?: string;
}) {
  return (
    <div className={"entry-content " + className}>
      <h2 className="entry-content-bloque-title text-[20px] font-bold leading-[20px] tracking-[-0.5px] text-[#333]">
        {titulo}
      </h2>
      <div className="entry-content-bloque text-[18px] leading-[30.6px] text-[#333]">
        <div
          className="
            [&_a]:text-[#0075C9] [&_a:hover]:underline
            [&_p]:mb-[1em] [&_ul]:mb-[1em] [&_ul]:list-disc [&_ul]:pl-[1.25em]
            [&_iframe]:w-full [&_table]:w-full [&_table_td]:border [&_table_th]:border
            [&_blockquote]:border-l-4 [&_blockquote]:border-[#0075C9] [&_blockquote]:pl-4
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {destacado ? (
          <div
            className="texto-destacado"
            dangerouslySetInnerHTML={{ __html: destacado }}
          />
        ) : null}
      </div>
    </div>
  );
}
