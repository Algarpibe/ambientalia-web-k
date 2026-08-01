/**
 * Migas de pan `ol.kunak-breadcrumbs` — compartidas por /monitor-calidad-aire,
 * /accesorios, /software-de-medicion-calidad-del-aire, /kunak-api y las páginas
 * de sector. Estaban escritas a mano en cada `page.tsx`; con 8 sectores por
 * delante tocaba extraerlas.
 *
 * Medido 2026-07-28 en el original (idéntico a 1440 y 390):
 *   sección sin padding · fila `padding: 12px 0` con la retícula de la página
 *   `ol`  12px/26px w600 #0075C9 letter-spacing 0.3px
 *   `li`  inline-block con `padding-right: 7.2px`
 *   `li::after` `content: "/"` con `padding-left: 7.2px` — **en todos menos el
 *         último** (el separador es del li previo, no un nodo aparte)
 *   el último `li` es un `<span>` sin enlace, mismo color
 *
 * El original marca los `li` con `schema.org/BreadcrumbList`; se replica.
 */
export interface BreadcrumbItem {
  label: string;
  /** Sin `href` = página actual (último nivel, sin enlace). */
  href?: string;
}

/**
 * ── Y NO son las mismas migas en las dos plantillas (C-QA1, 2026-07-30) ─────
 * En el original el caso las trae en `div.migas` (sección del tema) y producto
 * en un `et_pb_section` del builder. **En el clon las pinta este componente
 * para las dos**, y ahí es donde el parecido engañaba:
 *
 *   producto  original 50    · clon 50     → cuadra
 *   caso      original 54.59 · clon 50     → **−4.59** a 1440
 *             original 85.19 · clon 102    → **+16.81** a 390 — cambia de signo
 *
 * Un residuo que cambia de signo entre anchos no es un `padding`. Medido por
 * composición (`npm run qa:banda`), con la fila, el ancho, el tamaño, el peso y
 * el espaciado **idénticos** en los dos lados, salen dos diferencias y solo dos:
 *
 *  1. **interlínea 30.6 contra 26** → 54.59 = 30.6 + 24 · 85.19 = 2×30.6 + 24;
 *  2. **el último `li` va truncado**: `max-width 350px · nowrap · overflow
 *     hidden · text-overflow ellipsis`. Los otros dos miden **exactamente** lo
 *     mismo en ambos lados (52.36 y 107.53); el tercero medía 350 en el
 *     original y 425.06 en el clon **con el mismo texto**. Sin el truncado, a
 *     390 el titular envuelve en 3 renglones donde el original hace 2.
 *
 * ~~Las dos son de la plantilla del CASO, así que van en una variante y **no en
 * el defecto**: cambiarlas para todos movería producto y los 6 sectores, que
 * hoy cuadran.~~
 *
 * ── ⚠ CORREGIDO 2026-07-31 (A-QA1): la 2 NO es del caso, es del TEMA ────────
 * La conclusión de arriba es la mitad correcta: la **interlínea** sí es del
 * caso. **El truncado no.** Medido con `npm run qa:a-miga` en las **siete
 * formas** del original —blog, término, documento científico, caso, producto,
 * sector— el último `li` trae `max-width: 350px · white-space: nowrap ·
 * overflow: hidden · text-overflow: ellipsis` **sin una excepción**.
 *
 * Y las tres consecuencias, que valen más que el arreglo:
 *
 *  · **la variante estaba mal delimitada**: metió una regla general entre las
 *    específicas. El truncado baja aquí, al defecto;
 *  · **producto y sectores daban Δ0 porque sus rótulos no llegan a 350**
 *    —49.94 y 194.52 medidos—, no porque estuvieran bien. Es corrección
 *    aparente **por contenido corto**: el Δ0 no verificaba la regla, la
 *    esquivaba;
 *  · y por eso es **CLASE, no instancia**: el día que alguien escriba un título
 *    largo en un sector o en un producto, el clon envolverá donde el original
 *    trunca, y el defecto aparecerá en una página que llevaba meses verde.
 *
 * Lo destapó el grupo A porque **sus títulos sí pasan de 350** (498.97 y 681.77
 * medidos a 1440): el corpus nuevo ejercitó una regla que el viejo no tocaba.
 */
export function Breadcrumb({
  items,
  rowClassName = "mx-auto w-[80%] max-w-[1380px]",
  variante = "producto",
}: {
  items: BreadcrumbItem[];
  /** Retícula de la fila. Por defecto la de las páginas de producto (80%). */
  rowClassName?: string;
  /**
   * Qué plantilla las pinta. **Solo cambia la interlínea** — el truncado del
   * último eslabón bajó al defecto en A-QA1, porque está en las 7 formas.
   */
  variante?: "producto" | "caso";
}) {
  const esCaso = variante === "caso";
  return (
    <nav aria-label="Migas de pan" className="bg-white">
      <div className={rowClassName + " py-[12px]"}>
        <ol
          className={
            "kunak-breadcrumbs text-[12px] font-semibold tracking-[0.3px] text-[#0075C9] " +
            (esCaso ? "leading-[30.6px]" : "leading-[26px]")
          }
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, i) => (
            <li
              key={item.label}
              className={
                "inline-block pr-[7.2px] after:pl-[7.2px] after:content-['/'] last:after:content-none " +
                // El truncado es del ÚLTIMO, que es el título del contenido — y
                // va **en el defecto**: medido en las 7 formas del original, sin
                // una excepción (A-QA1). Antes vivía en `variante="caso"` y eso
                // era una regla general disfrazada de específica.
                (i === items.length - 1
                  ? "max-w-[350px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom"
                  : "")
              }
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href ? (
                <a itemProp="item" href={item.href} className="hover:underline">
                  <span itemProp="name">{item.label}</span>
                </a>
              ) : (
                <span itemProp="name" aria-current="page">
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
