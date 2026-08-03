import type { CampoRico } from "@/types/kunak";

/**
 * EL CAMPO RICO DEL ARQUETIPO A — un solo campo HTML, con contrato medido.
 *
 * `ESQUEMA-CMS.md` §3.1 y `arquetipo-A/components/campo-rico.spec.md` (censo de
 * **209/209**). Se renderiza con `dangerouslySetInnerHTML`, igual que la FAQ y
 * los tres bloques del caso de éxito.
 *
 * ── Por qué HTML y no un árbol de bloques ─────────────────────────────────
 * No es comodidad, lo dijo el censo: **43 etiquetas distintas**, ninguna
 * estructura repetida lo bastante para merecer tipo propio, `<script>`
 * ejecutable dentro del contenido en 15 páginas, y un rango de longitud de
 * **254×** (275 a 69 784 caracteres). Modelar eso como bloques sería inventar un
 * esquema para documentos que ya tienen uno.
 *
 * ⚠ **Y «rico» no es «richText».** El campo es **HTML**, no un árbol Lexical:
 * CMS-0e decidió que el cuerpo entra **crudo** y se convierte entrada por
 * entrada, y el §3.1 es el contrato de lo que tiene que admitir, no una firma
 * de API. Aquí se sirve tal cual.
 *
 * ── Las T1–T7 NO están aplicadas, y es deliberado ─────────────────────────
 * `style="width:1210px"` (T2), `wp-caption`/`wp-image-<id>`/`aligncenter` (T3),
 * `<a class="et_pb_button">` (T1, **80 % del corpus**) y los `<script>` (T4)
 * **siguen en el dato tal como los sirve el original**. Son transformaciones de
 * **migración** —lo que hay que hacerle al corpus al importarlo a Payload— y su
 * sitio es F2-2. Adelantarlas dentro del clon sería construir sobre un corpus
 * que ya no es el que hay que migrar.
 *
 * ── Lo único que el CSS neutraliza, y por qué no es una T ─────────────────
 * `T2` avisa de que un `style="width: 1210px"` desborda un contenedor de
 * 911.75. Aquí **el estilo se conserva en el dato** y la caja se contiene por
 * CSS (`max-w-full` sobre el contenido, `overflow-x` en la tabla). Es la misma
 * decisión que ya se tomó con la tabla del monográfico a 390: desviación de
 * render, anotada, sin tocar el contenido.
 */

/** Tipografía del cuerpo, medida en las tres formas a los dos anchos. */
const CUERPO = `
  text-[18px] leading-[30.6px] text-[#333]
  [&_p]:pb-[1em]
  [&_h2]:mt-[44.4px] [&_h2]:mb-[11.1px] [&_h2]:pb-[10px]
  [&_h2]:text-[37px] [&_h2]:leading-[46.25px] [&_h2]:font-light [&_h2]:tracking-[-0.5px]
  [&_h3]:mt-[44.4px] [&_h3]:mb-[11.1px] [&_h3]:pb-[10px]
  [&_h3]:text-[26px] [&_h3]:leading-[32.5px] [&_h3]:font-light [&_h3]:tracking-[-0.5px]
  [&_h4]:mb-[11.1px] [&_h4]:pb-[10px] [&_h4]:text-[20px] [&_h4]:font-semibold
  [&_a]:text-[#0075C9] [&_a:hover]:underline
  [&_ul]:pb-[1em] [&_ul]:pl-[1em] [&_ul]:list-disc
  [&_ol]:pb-[1em] [&_ol]:pl-[1em] [&_ol]:list-decimal
  [&_li]:list-inside
  [&_blockquote]:my-[1em] [&_blockquote]:border-l-[5px] [&_blockquote]:border-[#0075C9] [&_blockquote]:pl-[20px]
  [&_img]:h-auto [&_img]:max-w-full
  [&_iframe]:max-w-full
  [&_video]:h-auto [&_video]:max-w-full
  [&_table]:w-full [&_table]:border-collapse
  [&_.wp-caption]:!w-auto [&_.wp-caption]:max-w-full
  [&_.wp-caption-text]:text-[14px] [&_.wp-caption-text]:italic
  [&_hr]:my-[1em]
`;

/**
 * Slug de un titular, para el ancla del índice. **Se REGENERA, no se conserva**
 * (`ESQUEMA-CMS.md` §T6, que cerró A-SP9): los `id` de los `h2` **no vienen en
 * el contenido** —0 en el HTML servido y 16 en el DOM de la misma página, 8
 * páginas sin excepción—, los pone el JS del tema al cargar. O sea que no hay
 * nada que migrar y el índice es **derivable** del propio texto.
 *
 * La forma la copia del original: sin tildes, sin signos, minúsculas, guiones.
 * `¿Qué es el metano y por qué es tan importante?` →
 * `que-es-el-metano-y-por-que-es-tan-importante`.
 */
export function slugTitular(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Los `h2` del cuerpo, en orden: la proyección de la que sale el índice. */
export function titularesDe(cuerpo: CampoRico) {
  return [...cuerpo.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((texto) => ({ texto, id: slugTitular(texto) }));
}

/** El mismo cuerpo con un `id` en cada `h2`, para que el índice tenga destino. */
function conAnclas(cuerpo: CampoRico) {
  return cuerpo.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (todo, attrs, dentro) => {
    if (/\bid=/.test(attrs)) return todo;
    const texto = dentro.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!texto) return todo;
    return `<h2${attrs} id="${slugTitular(texto)}">${dentro}</h2>`;
  });
}

export function CuerpoRicoA({
  cuerpo,
  className = "",
}: {
  cuerpo: CampoRico;
  className?: string;
}) {
  return (
    <div
      className={`${CUERPO} ${className}`}
      dangerouslySetInnerHTML={{ __html: conAnclas(cuerpo) }}
    />
  );
}
